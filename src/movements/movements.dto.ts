import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsMongoId,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MovementType {
  Charge = 'Charge',
  Credit = 'Credit',
}

export class CreateMovementDto {
  @ApiProperty({
    example: '60d0fe4f5311236168a109ca',
    description: 'ObjectId of the Housing',
  })
  @IsMongoId()
  @IsNotEmpty()
  housing: string;

  @ApiProperty({
    example: '60d0fe4f5311236168a109cb',
    description: 'ObjectId of the Period',
  })
  @IsMongoId()
  @IsNotEmpty()
  period: string;

  @ApiProperty({
    example: 'Maintenance Fee Jan 2026',
    description: 'Concept of the movement',
  })
  @IsString()
  @IsNotEmpty()
  concept: string;

  @ApiProperty({
    enum: MovementType,
    example: 'Charge',
    description: 'Type of movement: Charge or Credit',
  })
  @IsEnum(MovementType)
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 1500.0, description: 'Amount of the movement' })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({
    example: 'Paid via transfer',
    description: 'Additional observations',
  })
  @IsOptional()
  @IsString()
  observation?: string;
}

export class UpdateMovementDto {
  // Only allow updating concept/observation to prevent accounting fraud
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  concept?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observation?: string;
}
