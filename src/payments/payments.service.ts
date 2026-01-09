import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Unit, UnitDocument } from '../units/schemas/unit.schema';
import { Debt, DebtDocument, DebtStatus } from '../debts/schemas/debt.schema';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from '../transactions/schemas/transaction.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Unit.name) private unitModel: Model<UnitDocument>,
    @InjectModel(Debt.name) private debtModel: Model<DebtDocument>,
    private transactionsService: TransactionsService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { unitId, debtIds, paymentMethodId, ...rest } = createPaymentDto;

    // 1. Verify Unit
    const unit = await this.unitModel
      .findById(unitId)
      .populate('category')
      .exec();
    if (!unit) throw new NotFoundException('Unit not found');

    // 2. Validate Debts
    if (debtIds && debtIds.length > 0) {
      const debts = await this.debtModel.find({ _id: { $in: debtIds } }).exec();
      if (debts.length !== debtIds.length) {
        throw new BadRequestException('Some debts were not found');
      }
      const invalidDebts = debts.filter(
        (d) =>
          d.status === DebtStatus.PAID || d.status === DebtStatus.CANCELLED,
      );
      if (invalidDebts.length > 0) {
        throw new BadRequestException(
          'Some debts are already paid or cancelled',
        );
      }
    }

    // 3. Mark Debts as PAID
    if (debtIds && debtIds.length > 0) {
      await this.debtModel.updateMany(
        { _id: { $in: debtIds } },
        { $set: { status: DebtStatus.PAID } },
      );
    }

    // 4. Create Payment
    const payment = new this.paymentModel({
      ...rest,
      unit: unitId,
      paymentMethod: paymentMethodId,
      debtsPaid: debtIds,
      snapshotData: {
        unitNumber: unit.number,
        categoryName: unit.category['name'] || '',
      },
    });
    await payment.save();

    // 5. Create Transaction (This also handles Balance Update)
    // We map the Payment to a Transaction
    await this.transactionsService.create({
      tipo: TransactionType.PAGO,
      monto: createPaymentDto.totalAmount,
      descripcion: `Pago registrado (Caja): ${createPaymentDto.observation || ''}`,
      fecha: new Date(createPaymentDto.paymentDate),
      unidad: unitId,
      evidenciaUrl: createPaymentDto.proofUrl,
      // Metadata to link back
      metadata: {
        paymentId: payment._id.toString(),
      },
    } as any);

    return payment;
  }

  async findAll() {
    return this.paymentModel
      .find()
      .populate('unit')
      .populate('paymentMethod')
      .sort({ paymentDate: -1 })
      .exec();
  }

  async findAllByUnit(unitId: string) {
    return this.paymentModel
      .find({ unit: unitId })
      .populate('unit')
      .populate('paymentMethod')
      .sort({ paymentDate: -1 })
      .exec();
  }

  async findOne(id: string) {
    return this.paymentModel
      .findById(id)
      .populate('unit')
      .populate('paymentMethod')
      .populate('debtsPaid')
      .exec();
  }
}
