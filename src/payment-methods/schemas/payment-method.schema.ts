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

  @Prop({ default: false })
  isBank: boolean;

  @Prop()
  bankName?: string;

  @Prop()
  accountNumber?: string;

  @Prop()
  accountHolder?: string;

  @Prop({ enum: ['SAVINGS', 'CURRENT'] })
  accountType?: string;

  @Prop()
  additionalData?: string;
}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);
