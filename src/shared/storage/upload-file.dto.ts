import { FileField } from '@/decorators/field.decorator';
import { FileSystemStoredFile } from 'nestjs-form-data';

export class UploadFileRequestDTO {
  @FileField({
    fileSize: 100,
    fileTypes: ['pdf', 'image'],
  })
  file: FileSystemStoredFile;
}
