import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { Unit, UnitSchema } from './schemas/unit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
  ],
  controllers: [UnitsController],
  providers: [UnitsService],
  exports: [UnitsService, MongooseModule], // Exported for use in Transactions/Cron and other modules
})
export class UnitsModule {}
