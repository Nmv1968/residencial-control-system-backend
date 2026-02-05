import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterUnitsDto {
  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(['DEBTOR', 'SOLVENT'])
  financialStatus?: string;
}
