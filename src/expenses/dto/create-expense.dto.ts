import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({
    example: 'Electric Company',
    description: 'Provider or Payee name',
  })
  @IsString()
  @IsNotEmpty()
  proveedor: string;

  @ApiProperty({
    example: 'Electricity Bill Jan',
    description: 'Description of the expense',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({
    example: 120.5,
    description: 'Amount of the expense',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  monto: number;

  @ApiProperty({
    example: '2023-01-20T10:00:00Z',
    description: 'ISO Date of the expense',
  })
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({
    example: '/uploads/invoice.pdf',
    description: 'URL/Path to invoice file',
    required: false,
  })
  @IsOptional()
  @IsString()
  facturaUrl?: string;
}
