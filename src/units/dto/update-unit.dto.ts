import { CreateUnitDto } from './create-unit.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateUnitDto extends PartialType(CreateUnitDto) {}
