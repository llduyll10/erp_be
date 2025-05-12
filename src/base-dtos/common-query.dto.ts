import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StringFieldOptional, NumberFieldOptional } from '../decorators/field.decorators';

export class OrderDTO {
  @StringFieldOptional()
  field: string;

  @StringFieldOptional({ enum: ['ASC', 'DESC'] })
  direction: 'ASC' | 'DESC' = 'ASC';
}

export class CommonQueryDTO {
  @ApiPropertyOptional()
  @StringFieldOptional()
  q?: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @NumberFieldOptional({ min: 1 })
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @NumberFieldOptional({ min: 1, max: 100 })
  limit?: number = 10;

  @ApiPropertyOptional({ type: [OrderDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDTO)
  @IsOptional()
  orderBy?: OrderDTO[] = [];
} 