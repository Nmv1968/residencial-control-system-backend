import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UnitDocument = Unit & Document;

export enum UnitType {
  CASA = 'CASA',
  LOCAL = 'LOCAL',
  PARQUEADERO = 'PARQUEADERO',
}

@Schema({ timestamps: true })
export class Unit {
  @Prop({ required: true, unique: true })
  nombre: string;

  @Prop({ required: true, enum: UnitType })
  tipo: UnitType;

  @Prop({ required: true, min: 0 })
  tarifaMensual: number;

  @Prop({ default: 0 })
  saldoActual: number;

  @Prop()
  propietario: string;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);
