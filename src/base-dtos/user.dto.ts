import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BaseDTO } from '@/base/dtos/base.dto';
import { UserRoleEnum } from '@/entities/enums/user.enum';

/**
 * Base DTO for User entity
 */
export class UserDto extends BaseDTO {
  @Expose()
  @ApiProperty({ description: 'User email address' })
  email: string;

  @Expose()
  @ApiProperty({ description: 'User full name' })
  full_name: string;

  @Expose()
  @ApiProperty({
    description: 'User role',
    enum: UserRoleEnum,
    example: UserRoleEnum.ADMIN,
  })
  role: UserRoleEnum;

  @Expose()
  @ApiProperty({ description: 'ID of the company the user belongs to' })
  company_id: string;

  @Expose()
  @ApiProperty({
    description: 'Last login timestamp',
    required: false,
    type: Date,
  })
  last_login_at?: Date;
}
