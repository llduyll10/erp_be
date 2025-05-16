import { UserDto } from '@/base-dtos/user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserRole } from '@/entities/users.entity';

export class UserProfileDto extends UserDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User full name' })
  fullName: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'Company ID' })
  companyId: string;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last login date', required: false })
  lastLoginAt?: Date;

  constructor(partial: Partial<UserProfileDto>) {
    super();
    Object.assign(this, partial);
  }
}
