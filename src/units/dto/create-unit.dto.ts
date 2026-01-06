import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UnitType } from '../schemas/unit.schema';

export class CreateUnitDto {
  @ApiProperty({
    example: 'Casa 101',
    description: 'Unique name/number of the unit',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ enum: UnitType, example: UnitType.CASA })
  @IsEnum(UnitType)
  @IsNotEmpty()
  tipo: UnitType;

  @ApiProperty({
    example: 50.0,
    description: 'Monthly fee for the unit',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  tarifaMensual: number;

  @ApiProperty({
    example: 0,
    description: 'Current balance (debt positive, credit negative)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  saldoActual?: number;

  @ApiProperty({
    example: 'Juan Perez',
    description: 'Name of the owner',
    required: false,
  })
  @IsOptional()
  @IsString()
  propietario?: string;
}
