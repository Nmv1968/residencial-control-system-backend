import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHousingDto {
  @ApiProperty({
    example: 'A-101',
    description: 'Unique housing number or identifier',
  })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiPropertyOptional({
    example: '60d0fe4f5311236168a109ca',
    description: 'ObjectId of the owner',
  })
  @IsOptional()
  @IsMongoId()
  owner?: string;

  @ApiPropertyOptional({ default: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ default: 0, description: 'Initial balance' })
  @IsOptional()
  @IsNumber()
  balance?: number;
}

export class UpdateHousingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  owner?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  balance?: number;
}
