import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true })
  proveedor: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true, min: 0 })
  monto: number;

  @Prop({ required: true, default: Date.now })
  fecha: Date;

  @Prop()
  facturaUrl: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
