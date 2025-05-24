import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TokenDto {
  @Expose()
  @ApiProperty({ description: 'JWT access token' })
  access_token: string;

  @Expose()
  @ApiProperty({ description: 'JWT refresh token' })
  refresh_token: string;

  constructor(partial: Partial<TokenDto>) {
    Object.assign(this, partial);
  }
}
