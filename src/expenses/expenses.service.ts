import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense, ExpenseDocument } from './schemas/expense.schema';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const createdExpense = new this.expenseModel(createExpenseDto);
    return createdExpense.save();
  }

  async findAll(): Promise<Expense[]> {
    return this.expenseModel.find().sort({ fecha: -1 }).exec();
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expenseModel.findById(id).exec();
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }

  // Update and remove skipped for brevity as per instructions ("Genera el código modularizado... modulos separados... logic financiera critica")
  // Adding them for completeness as requested "CRUD".
  async update(id: string, updateDto: any): Promise<Expense> {
    // Simplified DTO for now
    const updated = await this.expenseModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException(`Expense with ID ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<Expense> {
    const deleted = await this.expenseModel.findByIdAndDelete(id).exec();
    if (!deleted)
      throw new NotFoundException(`Expense with ID ${id} not found`);
    return deleted;
  }
}
