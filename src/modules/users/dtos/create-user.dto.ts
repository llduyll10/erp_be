import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StringField, EmailField } from '../../../common/decorators/field.decorators';

export class CreateUserDto {
  @EmailField()
  email: string;

  @StringField({ minLength: 8 })
  password: string;

  @StringField()
  firstName: string;

  @StringField()
  lastName: string;
} 