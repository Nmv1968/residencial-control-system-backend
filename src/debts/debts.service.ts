import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Debt, DebtDocument, DebtStatus } from './schemas/debt.schema';
import { CreateDebtDto } from './dto/create-debt.dto';
import { Unit, UnitDocument, UnitStatus } from '../units/schemas/unit.schema';
import {
  Category,
  CategoryDocument,
} from '../categories/schemas/category.schema';

@Injectable()
export class DebtsService {
  async findAll() {
    return this.debtModel
      .find()
      .populate('unit')
      .sort({ generationDate: -1 })
      .exec();
  }

  constructor(
    @InjectModel(Debt.name) private debtModel: Model<DebtDocument>,
    @InjectModel(Unit.name) private unitModel: Model<UnitDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createDebtDto: CreateDebtDto): Promise<Debt> {
    const { unitId, ...rest } = createDebtDto;

    // Create Debt
    const debt = await this.debtModel.create({
      ...rest,
      unit: new Types.ObjectId(unitId),
    });

    // Update Unit Balance (Increase Debt)
    await this.unitModel.updateOne(
      { _id: new Types.ObjectId(unitId) },
      { $inc: { balance: createDebtDto.amount } },
    );

    return debt;
  }

  async generateBulk(payload: {
    scope: 'ALL' | 'CATEGORY' | 'SINGLE';
    targetId?: string; // CategoryId or UnitId
    amount: number;
    concept: string;
    dueDate?: string;
  }) {
    let units: UnitDocument[] = [];

    if (payload.scope === 'ALL') {
      units = await this.unitModel.find({ status: UnitStatus.OCCUPIED }).exec();
    } else if (payload.scope === 'CATEGORY' && payload.targetId) {
      units = await this.unitModel
        .find({
          category: new Types.ObjectId(payload.targetId),
          status: UnitStatus.OCCUPIED,
        })
        .exec();
    } else if (payload.scope === 'SINGLE' && payload.targetId) {
      const unit = await this.unitModel
        .findById(new Types.ObjectId(payload.targetId))
        .exec();
      if (unit) units.push(unit);
    }

    if (units.length === 0) {
      return { count: 0, message: 'No units found for the specified scope.' };
    }

    // Create Debts for all units
    const debtsToCreate = units.map((u) => ({
      amount: payload.amount,
      concept: payload.concept,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      generationDate: new Date(),
      status: DebtStatus.PENDING,
      unit: u._id,
    }));

    await this.debtModel.insertMany(debtsToCreate);

    // Update Balances (Bulk)
    await this.unitModel.updateMany(
      { _id: { $in: units.map((u) => u._id) } },
      { $inc: { balance: payload.amount } },
    );

    return {
      count: units.length,
      message: `Successfully generated debts for ${units.length} units.`,
    };
  }

  async findAllByUnit(unitId: string) {
    return this.debtModel
      .find({ unit: new Types.ObjectId(unitId) })
      .sort({ generationDate: -1 })
      .exec();
  }

  async findOne(id: string) {
    return this.debtModel.findById(id).populate('unit').exec();
  }
}
