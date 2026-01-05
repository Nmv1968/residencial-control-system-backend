import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HousingDocument = Housing & Document;

@Schema()
export class Housing {
  @Prop({ required: true, unique: true })
  number: string;

  @Prop({ default: 'Active' })
  status: string;

  @Prop({ default: 0 })
  balance: number;
}

export const HousingSchema = SchemaFactory.createForClass(Housing);
