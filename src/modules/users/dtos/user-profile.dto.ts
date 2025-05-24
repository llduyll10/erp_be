import { UserDto } from '@/base-dtos/user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserRole } from '@/entities/users.entity';

export class UserProfileDto extends UserDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User full name' })
  full_name: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'Company ID' })
  company_id: string;

  @ApiProperty({ description: 'Account creation date' })
  created_at: Date;

  @ApiProperty({ description: 'Last login date', required: false })
  last_login_at?: Date;

  constructor(partial: Partial<UserProfileDto>) {
    super();
    Object.assign(this, partial);
  }
}
