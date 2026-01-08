import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Unit } from '../../units/schemas/unit.schema';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
  CARGO_MENSUAL = 'CARGO_MENSUAL',
  PAGO = 'PAGO',
  AJUSTE = 'AJUSTE',
  GASTO = 'GASTO',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'Unit', required: false })
  unidad: Unit;

  @Prop({ required: true, enum: TransactionType })
  tipo: TransactionType;

  @Prop({ required: true, min: 0 })
  monto: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: false })
  proveedor: string;

  @Prop({ required: true, default: Date.now, index: true })
  fecha: Date;

  @Prop()
  evidenciaUrl: string;

  @Prop({ default: false })
  isReversed: boolean;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
