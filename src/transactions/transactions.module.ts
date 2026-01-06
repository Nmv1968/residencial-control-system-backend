import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { Unit, UnitSchema } from '../units/schemas/unit.schema';
import { Expense, ExpenseSchema } from '../expenses/schemas/expense.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Unit.name, schema: UnitSchema },
      { name: Expense.name, schema: ExpenseSchema },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService], // Exported for Cron use
})
export class TransactionsModule {}
