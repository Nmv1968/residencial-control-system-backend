import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentMethodDocument = PaymentMethod & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class PaymentMethod {
  @Prop({ required: true })
  name: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);
