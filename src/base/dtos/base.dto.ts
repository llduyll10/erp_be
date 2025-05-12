import { IsOptional, IsUUID } from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BaseDTO {
  @ApiProperty({ description: 'Unique identifier' })
  @IsUUID()
  @IsOptional()
  @Expose()
  id?: string;

  @ApiProperty({ description: 'Created timestamp' })
  @Expose()
  createdAt?: Date;

  @ApiProperty({ description: 'Last updated timestamp' })
  @Expose()
  updatedAt?: Date;
} 