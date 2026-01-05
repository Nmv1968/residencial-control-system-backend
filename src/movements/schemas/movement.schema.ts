import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Housing } from '../../housing/schemas/housing.schema';
import { Period } from '../../periods/schemas/period.schema';

export type MovementDocument = Movement & Document;

@Schema()
export class Movement {
  @Prop({ type: Types.ObjectId, ref: 'Housing', required: true })
  housing: Housing;

  @Prop({ type: Types.ObjectId, ref: 'Period', required: true })
  period: Period;

  @Prop({ required: true })
  concept: string;

  @Prop({ required: true, enum: ['Charge', 'Credit'] }) // Charge (Cargo), Credit (Abono)
  type: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  observation: string;

  @Prop({ default: Date.now })
  date: Date;
}

export const MovementSchema = SchemaFactory.createForClass(Movement);
