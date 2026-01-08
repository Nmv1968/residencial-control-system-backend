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
            { $inc: { saldoActual: -createTransactionDto.monto } },
          )
          .exec();
      }
    } else if (createTransactionDto.tipo === TransactionType.CARGO_MENSUAL) {
      if (createTransactionDto.unidad) {
        // Charge: Increase debt (add to balance)
        await this.unitModel
          .updateOne(
            { _id: createTransactionDto.unidad },
            { $inc: { saldoActual: createTransactionDto.monto } },
          )
          .exec();
      }
    }
    // GASTO (Expense) and AJUSTE logic do not strictly require balance updates on Unit unless specified.
    // GASTO is usually global or unit-less, but if linked to logic, can be added here.

    return transaction;
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionModel
      .find()
      .populate('unidad')
      .sort({ fecha: -1 })
      .exec();
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
          { $inc: { saldoActual: transaction.monto } },
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
          { $inc: { saldoActual: -transaction.monto } },
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
      .find({ saldoActual: { $gt: 0 } })
      .exec();

    return {
      totalCollected,
      totalSpent,
      unitsInDebt,
    };
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
    const units = await this.unitModel.find({}).exec(); // Filter by active status if exists
    console.log(
      `Starting monthly charges generation for ${units.length} units...`,
    );

    for (const unit of units) {
      if (unit.tarifaMensual > 0) {
        const transactionDto: CreateTransactionDto = {
          unidad: unit._id as any,
          tipo: TransactionType.CARGO_MENSUAL,
          monto: unit.tarifaMensual,
          descripcion: `Cargo Mensual - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
          fecha: new Date().toISOString(),
        };

        // Reuse create logic which handles balance update
        try {
          await this.create(transactionDto);
        } catch (error) {
          console.error(
            `Error generating charge for unit ${unit.nombre}:`,
            error,
          );
        }
      }
    }
    console.log('Monthly charges generation completed.');
  }
}
