import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PaymentMethod,
  PaymentMethodDocument,
} from './schemas/payment-method.schema';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/create-payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectModel(PaymentMethod.name)
    private paymentMethodModel: Model<PaymentMethodDocument>,
  ) {}

  async create(createDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const created = new this.paymentMethodModel(createDto);
    return created.save();
  }

  async findAll(): Promise<PaymentMethod[]> {
    return this.paymentMethodModel.find({ isActive: true }).exec();
  }

  async update(
    id: string,
    updateDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    const updated = await this.paymentMethodModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException(`PaymentMethod with ID ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<PaymentMethod> {
    // Soft delete
    const deleted = await this.paymentMethodModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    if (!deleted)
      throw new NotFoundException(`PaymentMethod with ID ${id} not found`);
    return deleted;
  }
}
