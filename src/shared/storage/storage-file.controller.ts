import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Delete,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { User } from '@/entities/user.entity';
import { ApiUpload } from '@/decorators/api-upload.decorator';
import { UploadFileRequestDTO } from './upload-file.dto';
import { StorageFile } from '@/entities/storage_files';
import { UUIDParam } from '@/decorators/uuid-param.decorator';

@Controller({
  version: '1',
  path: 'storage_files',
})
@ApiTags('StorageFile')
export class StorageFileController {
  constructor(private readonly uploadService: UploadService) { }

  @ApiOperation({ summary: 'Get file by file path' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successful get file by file path',
    type: StorageFile,
  })
  @HttpCode(HttpStatus.OK)
  @Get('get_file_by_path')
  async getFileByFilePath(@Query() query: { file: string }) {
    return await this.uploadService.getFileByFilePath(query.file);
  }

  @ApiOperation({ summary: 'Upload file' })
  @ApiResponse({
    status: 201,
    description: 'Successful upload file',
    type: StorageFile,
  })
  @Post('upload')
  @ApiUpload()
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(
    @Body() params: UploadFileRequestDTO,
    @CurrentUser() user: User,
  ) {
    return await this.uploadService.uploadFile(params.file, user.id);
  }

  @ApiOperation({ summary: 'Delete file by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully deleted file',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteFile(@UUIDParam('id') id: string) {
    return await this.uploadService.deleteFile(id);
  }
}
