import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BaseDTO {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
} 