import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface FileResponse {
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class FileService {
  constructor(private readonly configService: ConfigService) {}

  public async saveFile(file: Express.Multer.File): Promise<FileResponse> {
    const uploadPath = this.configService.get<string>('UPLOAD_DESTINATION');

    if (!uploadPath) {
      throw new Error('Upload destination not configured');
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadPath, fileName);

    await fs.promises.writeFile(filePath, file.buffer);

    return {
      fileName,
      filePath,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  public async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.promises.unlink(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
} 