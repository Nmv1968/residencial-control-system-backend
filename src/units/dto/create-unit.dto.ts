import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UnitStatus } from '../schemas/unit.schema';

export class CreateUnitDto {
  @ApiProperty({
    example: 'A-101',
    description: 'Unique number/identifier of the unit',
  })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({
    example: 'Juan Perez',
  })
  @IsString()
  @IsOptional()
  residentName?: string;

  @ApiProperty({
    example: '555-1234',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: UnitStatus, example: UnitStatus.OCCUPIED })
  @IsEnum(UnitStatus)
  @IsNotEmpty()
  status: UnitStatus;

  @ApiProperty({
    example: '60d0fe4f5311236168a109ca',
    description: 'Category ID',
  })
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;
}
