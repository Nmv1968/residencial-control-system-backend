import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ContactInfo,
  ContactInfoDocument,
} from './schemas/contact-info.schema';
import { CreateContactInfoDto } from './dto/create-contact-info.dto';

@Injectable()
export class ContactInfoService {
  constructor(
    @InjectModel(ContactInfo.name)
    private contactInfoModel: Model<ContactInfoDocument>,
  ) {}

  async getContactInfo(): Promise<ContactInfo> {
    const info = await this.contactInfoModel.findOne().exec();
    if (!info) {
      // Return empty object if not exists yet, or create default
      return {};
    }
    return info;
  }

  async updateContactInfo(
    createDto: CreateContactInfoDto,
  ): Promise<ContactInfo> {
    // Upsert: update the first document found, or create new if none exists
    const updated = await this.contactInfoModel
      .findOneAndUpdate({}, createDto, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      })
      .exec();
    return updated;
  }
}
