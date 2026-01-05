import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HousingService } from './housing.service';
import { HousingController } from './housing.controller';
import { Housing, HousingSchema } from './schemas/housing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Housing.name, schema: HousingSchema }]),
  ],
  controllers: [HousingController],
  providers: [HousingService],
  exports: [HousingService],
})
export class HousingModule {}
