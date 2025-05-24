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
  readonly full_name: string;

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
  readonly company_name: string;

  @ValidateNested()
  @Type(() => AdminUserDto)
  readonly admin: AdminUserDto;
}
