import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'User full name' })
  @IsString()
  @IsNotEmpty()
  readonly fullName: string;

  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ description: 'User password', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly password: string;

  @ApiProperty({ description: 'Company ID (if joining existing company)' })
  @IsString()
  readonly companyId?: string;
}
