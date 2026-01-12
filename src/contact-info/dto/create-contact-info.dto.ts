import { IsOptional, IsString, IsEmail } from 'class-validator';

export class CreateContactInfoDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  additionalData?: string;
}
