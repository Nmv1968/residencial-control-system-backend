import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Unit } from '../../units/schemas/unit.schema';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
  CARGO_MENSUAL = 'CARGO_MENSUAL',
  PAGO = 'PAGO',
  AJUSTE = 'AJUSTE',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'Unit', required: true })
  unidad: Unit;

  @Prop({ required: true, enum: TransactionType })
  tipo: TransactionType;

  @Prop({ required: true, min: 0 })
  monto: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true, default: Date.now, index: true })
  fecha: Date;

  @Prop()
  evidenciaUrl: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
