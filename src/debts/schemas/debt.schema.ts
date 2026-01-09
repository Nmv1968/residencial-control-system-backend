import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Unit } from '../../units/schemas/unit.schema';

export type DebtDocument = Debt & Document;

export enum DebtStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Debt {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  concept: string;

  @Prop({ required: true, default: Date.now })
  generationDate: Date;

  @Prop()
  dueDate: Date;

  @Prop({ required: true, enum: DebtStatus, default: DebtStatus.PENDING })
  status: DebtStatus;

  @Prop({ type: Types.ObjectId, ref: 'Unit', required: true })
  unit: Unit | Types.ObjectId;
}

export const DebtSchema = SchemaFactory.createForClass(Debt);
