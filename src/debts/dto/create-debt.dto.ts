import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
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
