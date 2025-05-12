import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResponseDTO<T> {
  @ApiProperty()
  @Expose()
  success: boolean;

  @ApiProperty()
  @Expose()
  message?: string;

  @ApiProperty()
  @Expose()
  data?: T;

  @ApiProperty()
  @Expose()
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };

  constructor(partial: Partial<ResponseDTO<T>>) {
    Object.assign(this, partial);
  }
} 