import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BaseDTO } from './base.dto';

/**
 * Base DTO for StorageFile entity
 */
export class StorageFileDto extends BaseDTO {
  @Expose()
  @ApiProperty({ description: 'Path to the file in storage' })
  file_path: string;

  @Expose()
  @ApiProperty({ description: 'Original filename' })
  original_name: string;

  @Expose()
  @ApiProperty({ description: 'File MIME type' })
  mime_type: string;

  @Expose()
  @ApiProperty({ description: 'File checksum for integrity verification' })
  checksum: string;

  @Expose()
  @ApiProperty({ description: 'File size in bytes', type: Number })
  size: number;

  @Expose()
  @ApiProperty({ description: 'Storage disk identifier' })
  disk: string;

  @Expose()
  @ApiProperty({
    description: 'ID of the user who uploaded the file',
    required: false,
    type: String,
  })
  uploader_id?: string;

  @Expose()
  @ApiProperty({ description: 'Public URL to access the file' })
  url: string;
}
