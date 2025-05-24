import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BaseDTO {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  created_at: Date;

  @Expose()
  @ApiProperty()
  updated_at: Date;
}
