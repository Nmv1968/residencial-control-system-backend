import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Unit } from '../../units/schemas/unit.schema';
import { PaymentMethod } from '../../payment-methods/schemas/payment-method.schema';
import { Debt } from '../../debts/schemas/debt.schema';

export type PaymentDocument = Payment & Document;

@Schema({ _id: false })
class SnapshotData {
  @Prop()
  unitNumber: string;

  @Prop()
  categoryName: string;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Payment {
  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true, default: Date.now })
  paymentDate: Date;

  @Prop()
  observation: string;

  @Prop()
  proofUrl: string;

  @Prop({ type: SnapshotData })
  snapshotData: SnapshotData;

  @Prop({ type: Types.ObjectId, ref: 'Unit', required: true })
  unit: Unit | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PaymentMethod', required: true })
  paymentMethod: PaymentMethod | Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Debt' }] })
  debtsPaid: (Debt | Types.ObjectId)[];
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
