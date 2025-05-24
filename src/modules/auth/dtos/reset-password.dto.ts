import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Reset token from email',
  })
  @IsNotEmpty({ message: 'Token is required' })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain uppercase, lowercase, and numbers or symbols',
  })
  password: string;

  @ApiProperty({
    description: 'Confirm new password',
  })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  @IsString()
  password_confirmation: string;
}
