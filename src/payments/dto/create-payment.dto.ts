import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;

  @IsString()
  @IsOptional()
  observation?: string;

  @IsString()
  @IsOptional()
  proofUrl?: string;

  @IsMongoId()
  @IsNotEmpty()
  unitId: string;

  @IsMongoId()
  @IsNotEmpty()
  paymentMethodId: string;

  @IsArray()
  @IsMongoId({ each: true })
  debtIds: string[];
}
