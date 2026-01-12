import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactInfoDocument = ContactInfo & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ContactInfo {
  @Prop()
  fullName?: string;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop()
  additionalData?: string;
}

export const ContactInfoSchema = SchemaFactory.createForClass(ContactInfo);
