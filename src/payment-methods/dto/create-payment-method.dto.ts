import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreatePaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isBank?: boolean;

  @ValidateIf((o) => o.isBank === true)
  @IsString()
  @IsNotEmpty()
  bankName?: string;

  @ValidateIf((o) => o.isBank === true)
  @IsString()
  @IsNotEmpty()
  accountNumber?: string;

  @ValidateIf((o) => o.isBank === true)
  @IsString()
  @IsNotEmpty()
  accountHolder?: string;

  @ValidateIf((o) => o.isBank === true)
  @IsEnum(['SAVINGS', 'CURRENT'])
  accountType?: string;

  @IsString()
  @IsOptional()
  additionalData?: string;
}

export class UpdatePaymentMethodDto extends CreatePaymentMethodDto {}
