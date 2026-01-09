import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DebtsService } from './debts.service';
import { DebtsController } from './debts.controller';
import { Debt, DebtSchema } from './schemas/debt.schema';
import { UnitsModule } from '../units/units.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Debt.name, schema: DebtSchema }]),
    UnitsModule,
    CategoriesModule,
  ],
  controllers: [DebtsController],
  providers: [DebtsService],
  exports: [DebtsService, MongooseModule],
})
export class DebtsModule {}
