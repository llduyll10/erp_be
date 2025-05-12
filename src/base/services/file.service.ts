import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileHelper } from '../../utils/helpers/file.helper';
import { ApiError } from '../../utils/errors/api-error.util';
import * as fs from 'fs';
import * as path from 'path';

interface FileUploadOptions {
  allowedMimeTypes?: string[];
  maxSize?: number;
  subDirectory?: string;
}

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Injectable()
export class FileService {
  private uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR') || 'uploads';
    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: UploadedFile, options?: FileUploadOptions): Promise<string> {
    const { allowedMimeTypes = ['image/jpeg', 'image/png'], maxSize = 5 * 1024 * 1024 } = options || {};

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type');
    }

    if (file.size > maxSize) {
      throw new Error('File too large');
    }

    const uploadDir = path.join(process.cwd(), 'uploads', options?.subDirectory || '');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(uploadDir, filename);

    await fs.promises.writeFile(filepath, file.buffer);

    return filepath;
  }

  async deleteFile(filepath: string): Promise<void> {
    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
    }
  }

  getFileStream(filePath: string): fs.ReadStream {
    const fullPath = path.join(this.uploadDir, filePath);
    if (!fs.existsSync(fullPath)) {
      throw ApiError.notFound('File not found');
    }
    return fs.createReadStream(fullPath);
  }
} 