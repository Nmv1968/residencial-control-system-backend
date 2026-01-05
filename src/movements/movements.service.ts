import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movement, MovementDocument } from './schemas/movement.schema';
import { CreateMovementDto, UpdateMovementDto } from './movements.dto';
import { HousingService } from '../housing/housing.service';
import { PeriodsService } from '../periods/periods.service';

@Injectable()
export class MovementsService {
  constructor(
    @InjectModel(Movement.name) private movementModel: Model<MovementDocument>,
    private housingService: HousingService,
    private periodsService: PeriodsService,
  ) {}

  async create(createMovementDto: CreateMovementDto): Promise<Movement> {
    // Validate Period
    const period = await this.periodsService.findOne(createMovementDto.period);
    if (!period) {
      throw new NotFoundException('Period not found');
    }
    if (period.status !== 'Open') {
      throw new BadRequestException('Period is closed');
    }

    // Validate Housing
    const housing = await this.housingService.findOne(
      createMovementDto.housing,
    );
    if (!housing) {
      throw new NotFoundException('Housing not found');
    }

    // Update Housing Balance
    let balanceChange = 0;
    if (createMovementDto.type === 'Charge') {
      balanceChange = createMovementDto.amount;
    } else if (createMovementDto.type === 'Credit') {
      balanceChange = -createMovementDto.amount;
    }

    await this.housingService.update(createMovementDto.housing, {
      balance: (housing.balance || 0) + balanceChange,
    });

    const createdMovement = new this.movementModel(createMovementDto);
    return createdMovement.save();
  }

  async findAll(query?: any): Promise<Movement[]> {
    return this.movementModel
      .find(query)
      .populate('housing')
      .populate('period')
      .sort({ date: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Movement | null> {
    return this.movementModel
      .findById(id)
      .populate('housing')
      .populate('period')
      .exec();
  }

  async update(
    id: string,
    updateMovementDto: UpdateMovementDto,
  ): Promise<Movement | null> {
    return this.movementModel
      .findByIdAndUpdate(id, updateMovementDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Movement | null> {
    return this.movementModel.findByIdAndDelete(id).exec();
  }
}
