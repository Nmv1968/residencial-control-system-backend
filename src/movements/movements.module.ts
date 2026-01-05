import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MovementsService } from './movements.service';
import { MovementsController } from './movements.controller';
import { Movement, MovementSchema } from './schemas/movement.schema';
import { HousingModule } from '../housing/housing.module';
import { PeriodsModule } from '../periods/periods.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Movement.name, schema: MovementSchema },
    ]),
    HousingModule,
    PeriodsModule,
  ],
  controllers: [MovementsController],
  providers: [MovementsService],
})
export class MovementsModule {}
