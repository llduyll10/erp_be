import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BaseDTO } from './base.dto';

/**
 * Base DTO for Company entity
 */
export class CompanyDto extends BaseDTO {
  @Expose()
  @ApiProperty({ description: 'Company name' })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'Company address',
    required: false,
  })
  address?: string;

  @Expose()
  @ApiProperty({
    description: 'Company phone number',
    required: false,
  })
  phone?: string;

  @Expose()
  @ApiProperty({
    description: 'Company tax ID',
    required: false,
  })
  tax_id?: string;

  @Expose()
  @ApiProperty({
    description: 'Company website URL',
    required: false,
  })
  website?: string;

  @Expose()
  @ApiProperty({
    description: 'Primary contact person name',
    required: false,
  })
  contact_name?: string;

  @Expose()
  @ApiProperty({
    description: 'Primary contact email',
    required: false,
  })
  contact_email?: string;
}
