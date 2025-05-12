import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';

export class FileHelper {
  static readonly IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  static validateFile(file: Express.Multer.File, options?: {
    allowedMimeTypes?: string[];
    maxSize?: number;
  }): void {
    const allowedMimeTypes = options?.allowedMimeTypes || this.IMAGE_MIME_TYPES;
    const maxSize = options?.maxSize || this.MAX_FILE_SIZE;

    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new HttpException(
        `File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (file.size > maxSize) {
      throw new HttpException(
        `File size too large. Max size: ${maxSize / 1024 / 1024}MB`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  static generateFileName(file: Express.Multer.File): string {
    const fileExt = extname(file.originalname);
    return `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
  }
} 