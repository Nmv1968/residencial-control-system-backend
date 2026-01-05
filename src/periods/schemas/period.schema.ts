import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PeriodDocument = Period & Document;

@Schema()
export class Period {
  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  month: number;

  @Prop({ default: 'Open' }) // Open, Closed
  status: string;
}

export const PeriodSchema = SchemaFactory.createForClass(Period);
PeriodSchema.index({ year: 1, month: 1 }, { unique: true });
