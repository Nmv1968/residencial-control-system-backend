import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  Transaction,
  TransactionDocument,
  TransactionType,
} from './schemas/transaction.schema';
import { Unit, UnitDocument } from '../units/schemas/unit.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(Unit.name) private unitModel: Model<UnitDocument>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.transactionModel.create(
      createTransactionDto as any,
    );

    // Side effects on Unit Balance
    if (createTransactionDto.tipo === TransactionType.PAGO) {
      if (createTransactionDto.unidad) {
        // Payment: Reduce debt (subtract from balance)
        await this.unitModel
          .updateOne(
            { _id: createTransactionDto.unidad },
            { $inc: { balance: -createTransactionDto.monto } },
          )
          .exec();
      }
    } else if (createTransactionDto.tipo === TransactionType.CARGO_MENSUAL) {
      if (createTransactionDto.unidad) {
        // Charge: Increase debt (add to balance)
        await this.unitModel
          .updateOne(
            { _id: createTransactionDto.unidad },
            { $inc: { balance: createTransactionDto.monto } },
          )
          .exec();
      }
    }
    // GASTO (Expense) and AJUSTE logic do not strictly require balance updates on Unit unless specified.
    // GASTO is usually global or unit-less, but if linked to logic, can be added here.

    return transaction;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Transaction[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.transactionModel
        .find()
        .populate('unidad')
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.transactionModel.countDocuments().exec(),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionModel
      .findById(id)
      .populate('unidad')
      .exec();
    if (!transaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async reverse(id: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    if (transaction.isReversed) {
      throw new Error(`Transaction is already reversed`);
    }

    // Inverse Balance Logic
    if (transaction.tipo === TransactionType.PAGO && transaction.unidad) {
      // Reversing a Payment -> Increase Debt (Add back to balance)
      await this.unitModel
        .updateOne(
          { _id: transaction.unidad },
          { $inc: { balance: transaction.monto } },
        )
        .exec();
    } else if (
      transaction.tipo === TransactionType.CARGO_MENSUAL &&
      transaction.unidad
    ) {
      // Reversing a Charge -> Decrease Debt (Subtract from balance)
      await this.unitModel
        .updateOne(
          { _id: transaction.unidad },
          { $inc: { balance: -transaction.monto } },
        )
        .exec();
    }

    transaction.isReversed = true;
    return transaction.save();
  }

  async getDashboardSummary() {
    const now = new Date();
    // Start of current month: Day 1, 00:00:00
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
    );
    // End of current month: Day 0 of next month maps to last day of current, 23:59:59.999
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // 1. Total Collected (PAGO) this month (Exclude Reversed)
    const paymentsAggregation = await this.transactionModel.aggregate([
      {
        $match: {
          tipo: TransactionType.PAGO,
          isReversed: { $ne: true },
          fecha: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$monto' },
        },
      },
    ]);
    const totalCollected = paymentsAggregation[0]?.total || 0;

    // 2. Total Spent (GASTO) this month (Exclude Reversed)
    const expensesAggregation = await this.transactionModel.aggregate([
      {
        $match: {
          tipo: TransactionType.GASTO,
          isReversed: { $ne: true },
          fecha: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$monto' },
        },
      },
    ]);
    const totalSpent = expensesAggregation[0]?.total || 0;

    // 3. Units with Debt (saldoActual > 0)
    const unitsInDebt = await this.unitModel
      .countDocuments({ balance: { $gt: 0 } })
      .exec();

    // 4. Total Receivable (sum of all balances > 0)
    const totalReceivableAgg = await this.unitModel.aggregate([
      { $match: { balance: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$balance' } } },
    ]);
    const totalReceivable = totalReceivableAgg[0]?.total || 0;

    // 5. Cash Balance (total collected - total spent all time, not reversed)
    const allPayments = await this.transactionModel.aggregate([
      {
        $match: {
          tipo: TransactionType.PAGO,
          isReversed: { $ne: true },
        },
      },
      { $group: { _id: null, total: { $sum: '$monto' } } },
    ]);
    const allExpenses = await this.transactionModel.aggregate([
      {
        $match: {
          tipo: TransactionType.GASTO,
          isReversed: { $ne: true },
        },
      },
      { $group: { _id: null, total: { $sum: '$monto' } } },
    ]);
    const cashBalance =
      (allPayments[0]?.total || 0) - (allExpenses[0]?.total || 0);

    // 6. Collection Progress (% of collected vs expected for the month)
    const totalUnits = await this.unitModel.countDocuments().exec();
    // Assuming a standard monthly fee (you can make this dynamic later)
    const expectedMonthlyCollection = totalUnits * 150; // Example: $150 per unit
    const collectionProgress =
      expectedMonthlyCollection > 0
        ? Math.min(
            100,
            Math.round((totalCollected / expectedMonthlyCollection) * 100),
          )
        : 0;

    return {
      cashBalance,
      totalReceivable,
      unitsInArrears: unitsInDebt,
      collectionProgress,
      totalCollected,
      totalSpent,
    };
  }

  async getIncomeExpensesHistory() {
    const now = new Date();
    const labels: string[] = [];
    const income: number[] = [];
    const expenses: number[] = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(
        month.getFullYear(),
        month.getMonth(),
        1,
        0,
        0,
        0,
      );
      const endOfMonth = new Date(
        month.getFullYear(),
        month.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      // Month label
      const monthNames = [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
      ];
      labels.push(monthNames[month.getMonth()]);

      // Income for this month
      const incomeAgg = await this.transactionModel.aggregate([
        {
          $match: {
            tipo: TransactionType.PAGO,
            isReversed: { $ne: true },
            fecha: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$monto' } } },
      ]);
      income.push(incomeAgg[0]?.total || 0);

      // Expenses for this month
      const expensesAgg = await this.transactionModel.aggregate([
        {
          $match: {
            tipo: TransactionType.GASTO,
            isReversed: { $ne: true },
            fecha: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$monto' } } },
      ]);
      expenses.push(expensesAgg[0]?.total || 0);
    }

    return { labels, income, expenses };
  }

  async getOccupancyStats() {
    const occupied = await this.unitModel
      .countDocuments({ status: 'OCCUPIED' })
      .exec();
    const vacant = await this.unitModel
      .countDocuments({ status: 'VACANT' })
      .exec();
    const total = await this.unitModel.countDocuments().exec();

    return {
      labels: ['Ocupadas', 'Vacías'],
      data: [occupied, vacant],
      total,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
    };
  }

  async getRecentActivity() {
    const recentTransactions = await this.transactionModel
      .find({ isReversed: { $ne: true } })
      .populate('unidad')
      .sort({ fecha: -1 })
      .limit(10)
      .exec();

    return recentTransactions.map((t: any) => ({
      id: t._id,
      type: t.tipo,
      unit: t.unidad?.number || 'N/A',
      description: t.descripcion,
      amount: t.monto,
      date: t.fecha,
      status: 'COMPLETED',
    }));
  }

  async getAccountStatement(unitId: string, year: number) {
    const startOfYear = new Date(year, 0, 1, 0, 0, 0);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    return this.transactionModel
      .find({
        unidad: unitId as any,
        fecha: { $gte: startOfYear, $lte: endOfYear },
      })
      .sort({ fecha: 1 }) // Chronological order for statement
      .exec();
  }

  // --- CRON JOB ---
  // Runs at 00:00 on day-of-month 1
  @Cron('0 0 1 * *')
  async generateMonthlyCharges() {
    // DEPRECATED: New Financial System uses Debts Module
    console.log('Legacy Monthly Charges Generation is deprecated.');
  }
}
