import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Period, PeriodDocument } from './schemas/period.schema';
import { CreatePeriodDto, UpdatePeriodDto } from './periods.dto';

@Injectable()
export class PeriodsService {
  constructor(
    @InjectModel(Period.name) private periodModel: Model<PeriodDocument>,
  ) {}

  async create(createPeriodDto: CreatePeriodDto): Promise<Period> {
    const createdPeriod = new this.periodModel(createPeriodDto);
    return createdPeriod.save();
  }

  async findAll(): Promise<Period[]> {
    return this.periodModel.find().sort({ year: -1, month: -1 }).exec();
  }

  async findOne(id: string): Promise<Period | null> {
    return this.periodModel.findById(id).exec();
  }

  async update(
    id: string,
    updatePeriodDto: UpdatePeriodDto,
  ): Promise<Period | null> {
    return this.periodModel
      .findByIdAndUpdate(id, updatePeriodDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Period | null> {
    return this.periodModel.findByIdAndDelete(id).exec();
  }
}
