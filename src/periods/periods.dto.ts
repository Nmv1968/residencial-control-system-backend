import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PeriodStatus {
  Open = 'Open',
  Closed = 'Closed',
}

export class CreatePeriodDto {
  @ApiProperty({ example: 2026, description: 'Year of the period' })
  @IsNumber()
  @IsNotEmpty()
  year: number;

  @ApiProperty({
    example: 1,
    description: 'Month of the period (1-12)',
    minimum: 1,
    maximum: 12,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(12)
  month: number;
}

export class UpdatePeriodDto {
  @ApiPropertyOptional({
    enum: PeriodStatus,
    description: 'Update status (e.g., to Close period)',
  })
  @IsOptional()
  @IsEnum(PeriodStatus)
  status?: string;
}
