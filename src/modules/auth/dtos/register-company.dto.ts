import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdminUserDto {
  @IsString()
  @IsNotEmpty()
  readonly fullName: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly password: string;
}

export class RegisterCompanyDto {
  @IsString()
  @IsNotEmpty()
  readonly companyName: string;

  @ValidateNested()
  @Type(() => AdminUserDto)
  readonly admin: AdminUserDto;
}
