import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';

export type UnitDocument = Unit & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Unit {
  @Prop({ required: true, unique: true, index: true })
  number: string;

  @Prop()
  residentName: string;

  @Prop()
  phone: string;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Category | Types.ObjectId;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);
