import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { FilterUnitsDto } from './dto/filter-units.dto';
import { Unit, UnitDocument } from './schemas/unit.schema';

@Injectable()
export class UnitsService implements OnModuleInit {
  private readonly logger = new Logger(UnitsService.name);

  constructor(@InjectModel(Unit.name) private unitModel: Model<UnitDocument>) {}

  async onModuleInit() {
    try {
      // Clean up legacy index that causes duplicate key errors on 'nombre' field
      // Error trace showed: E11000 duplicate key error collection: test.units index: nombre_1
      const indexes = await this.unitModel.collection.indexes();
      const hasLegacyIndex = indexes.some((idx) => idx.name === 'nombre_1');

      if (hasLegacyIndex) {
        this.logger.warn(
          'Found legacy index "nombre_1". Dropping it to prevent duplicate key errors...',
        );
        await this.unitModel.collection.dropIndex('nombre_1');
        this.logger.log('Legacy index "nombre_1" dropped successfully.');
      }
    } catch (error) {
      // Ignore error if index doesn't exist or other DB issue (don't block startup)
      this.logger.warn(`Failed to check/drop legacy index: ${error.message}`);
    }
  }

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    const { categoryId, ...rest } = createUnitDto;
    const createdUnit = new this.unitModel({
      ...rest,
      category: categoryId,
    });
    return createdUnit.save();
  }

  async findAll(
    filters: FilterUnitsDto,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Unit[]; total: number; page: number; lastPage: number }> {
    const skip = (page - 1) * limit;

    // Build dynamic query based on filters
    const query: any = {};

    // Number filter (partial match, case-insensitive)
    if (filters.number) {
      query.number = { $regex: filters.number, $options: 'i' };
    }

    // Category filter (exact match)
    if (filters.categoryId) {
      query.category = filters.categoryId;
    }

    // Financial Status filter
    if (filters.financialStatus) {
      if (filters.financialStatus === 'DEBTOR') {
        query.balance = { $gt: 0 };
      } else if (filters.financialStatus === 'SOLVENT') {
        query.balance = { $lte: 0 };
      }
    }

    const [data, total] = await Promise.all([
      this.unitModel
        .find(query)
        .populate('category')
        .sort({ number: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.unitModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Unit> {
    const unit = await this.unitModel.findById(id).populate('category').exec();
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return unit;
  }

  async update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    const { categoryId, ...rest } = updateUnitDto as any; // Cast to avoid TS error if DTO not updated yet
    const updateData = { ...rest };
    if (categoryId) {
      updateData.category = categoryId;
    }

    const updatedUnit = await this.unitModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('category')
      .exec();
    if (!updatedUnit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return updatedUnit;
  }

  async remove(id: string): Promise<Unit> {
    const deletedUnit = await this.unitModel.findByIdAndDelete(id).exec();
    if (!deletedUnit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return deletedUnit;
  }
}
