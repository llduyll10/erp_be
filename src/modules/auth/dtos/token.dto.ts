import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TokenDto {
  @Expose()
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @Expose()
  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;

  constructor(partial: Partial<TokenDto>) {
    Object.assign(this, partial);
  }
}
