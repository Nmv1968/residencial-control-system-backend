import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterTransactionsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['CARGO_MENSUAL', 'PAGO', 'AJUSTE', 'GASTO'])
  tipo?: string;

  @IsOptional()
  @IsString()
  concepto?: string; // Will filter by descripcion field

  @IsOptional()
  @IsString()
  unitId?: string; // Will filter by unidad

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isReversed?: boolean;
}
