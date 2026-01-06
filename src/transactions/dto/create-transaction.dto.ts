import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../schemas/transaction.schema';

export class CreateTransactionDto {
  @ApiProperty({ example: '63f...', description: 'MongoID of the Unit' })
  @IsMongoId()
  @IsNotEmpty()
  unidad: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.PAGO })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  tipo: TransactionType;

  @ApiProperty({
    example: 50.0,
    description: 'Amount of the transaction',
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01) // Ensure positive amount > 0
  @IsNotEmpty()
  monto: number;

  @ApiProperty({
    example: 'January Payment',
    description: 'Description of the transaction',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({
    example: '2023-01-15T10:00:00Z',
    description: 'ISO Date of the transaction',
  })
  @IsDateString()
  @IsNotEmpty()
  fecha: string; // Expecting ISO date string

  @ApiProperty({
    example: '/uploads/file.png',
    description: 'URL/Path to evidence file',
    required: false,
  })
  @IsOptional()
  @IsString() // Can accept relative path or full URL. IsUrl might be too strict if storing relative paths.
  evidenciaUrl?: string;
}
