import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PaginationMeta {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}

export class ResponseDTO<T> {
  @ApiProperty()
  @Expose()
  success: boolean;

  @ApiProperty({ required: false })
  @Expose()
  message?: string;

  @ApiProperty({ required: false })
  @Expose()
  data?: T;

  @ApiProperty({ required: false })
  @Expose()
  meta?: PaginationMeta;

  constructor(partial: Partial<ResponseDTO<T>>) {
    Object.assign(this, partial);
  }
}
