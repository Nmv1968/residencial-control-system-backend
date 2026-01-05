import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'The username of the administrator',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'securePassword123!',
    description: 'The password of the administrator',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
