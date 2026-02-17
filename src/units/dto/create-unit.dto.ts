import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({
    example: 'A-101',
    description: 'Unique number/identifier of the unit',
  })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({
    example: 'Juan Perez',
  })
  @IsString()
  @IsOptional()
  residentName?: string;

  @ApiProperty({
    example: '555-1234',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: '60d0fe4f5311236168a109ca',
    description: 'Category ID',
  })
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;
}
