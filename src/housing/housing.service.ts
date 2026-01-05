import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Housing, HousingDocument } from './schemas/housing.schema';
import { CreateHousingDto, UpdateHousingDto } from './housing.dto';

@Injectable()
export class HousingService {
  constructor(
    @InjectModel(Housing.name) private housingModel: Model<HousingDocument>,
  ) {}

  async create(createHousingDto: CreateHousingDto): Promise<Housing> {
    const createdHousing = new this.housingModel(createHousingDto);
    return createdHousing.save();
  }

  async findAll(): Promise<Housing[]> {
    return this.housingModel.find().populate('owner').exec();
  }

  async findOne(id: string): Promise<Housing | null> {
    return this.housingModel.findById(id).populate('owner').exec();
  }

  async update(
    id: string,
    updateHousingDto: UpdateHousingDto,
  ): Promise<Housing | null> {
    return this.housingModel
      .findByIdAndUpdate(id, updateHousingDto, { new: true })
      .populate('owner')
      .exec();
  }

  async remove(id: string): Promise<Housing | null> {
    return this.housingModel.findByIdAndDelete(id).exec();
  }
}
