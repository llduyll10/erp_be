import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserDto } from '@/base-dtos/user.dto';
import { CompanyDto } from '@/base-dtos/company.dto';

export class UserResponseDto extends UserDto {
  constructor(partial: Partial<UserResponseDto>) {
    super();
    Object.assign(this, partial);
  }
}

export class CompanyResponseDto extends CompanyDto {
  constructor(partial: Partial<CompanyResponseDto>) {
    super();
    Object.assign(this, partial);
  }
}

export class RegisterCompanyResponseDto {
  @Expose()
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @Expose()
  @ApiProperty({ description: 'User details' })
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @Expose()
  @ApiProperty({ description: 'Company details' })
  @Type(() => CompanyResponseDto)
  company: CompanyResponseDto;

  constructor(partial: Partial<RegisterCompanyResponseDto>) {
    Object.assign(this, partial);
  }
}

export class AuthResponseDto {
  @Expose()
  @ApiProperty({ description: 'Access token' })
  accessToken: string;

  @Expose()
  @ApiProperty({ description: 'Refresh token', required: false })
  refreshToken?: string;

  @Expose()
  @ApiProperty({ description: 'User information', type: UserResponseDto })
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
