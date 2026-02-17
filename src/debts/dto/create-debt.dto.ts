import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { DebtStatus } from '../schemas/debt.schema';

export class CreateDebtDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  concept: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsMongoId()
  @IsNotEmpty()
  unitId: string;
}

export class GenerateBulkDebtDto {
  @IsIn(['ALL', 'CATEGORY', 'SINGLE'])
  @IsNotEmpty()
  scope: 'ALL' | 'CATEGORY' | 'SINGLE';

  @IsMongoId()
  @IsOptional()
  targetId?: string; // CategoryId or UnitId (required if scope is not ALL)

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  concept: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
