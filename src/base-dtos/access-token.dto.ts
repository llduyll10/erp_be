import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BaseDTO } from './base.dto';

/**
 * Base DTO for AccessToken entity
 */
export class AccessTokenDto extends BaseDTO {
  @Expose()
  @ApiProperty({ description: 'JWT access token' })
  token: string;

  @Expose()
  @ApiProperty({ description: 'JWT refresh token' })
  refresh_token: string;

  @Expose()
  @ApiProperty({ description: 'User ID associated with this token' })
  user_id: string;

  @Expose()
  @ApiProperty({ description: 'Company ID associated with this token' })
  company_id: string;

  @Expose()
  @ApiProperty({
    description: 'Token expiration timestamp',
    type: Date,
  })
  expires_at: Date;

  @Expose()
  @ApiProperty({
    description: 'Whether the token has been revoked',
    type: Boolean,
    default: false,
  })
  is_revoked: boolean;
}
