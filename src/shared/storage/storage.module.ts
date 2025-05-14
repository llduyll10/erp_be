import { StorageModule as NestStorageModule } from '@codebrew/nestjs-storage';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageFile } from '@/entities/storage_files';
import { StorageFileSubscriber } from './storage-file.subscriber';
import { UploadService } from './upload.service';
import { StorageFileController } from './storage-file.controller';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { StorageConfig } from '@/config/config.interface';
import { join } from 'path';
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([StorageFile]),
    NestjsFormDataModule,
    NestStorageModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const storageConfig = configService.get<StorageConfig>('storage');
        if (!storageConfig) {
          // Provide a default configuration if none is found
          return {
            default: 'local',
            disks: {
              local: {
                driver: 'local',
                config: {
                  root: join(process.cwd(), 'uploads'),
                  publicUrl: 'http://localhost:3000/uploads',
                },
              }
            }
          };
        }
        return storageConfig;
      },
    }),
  ],
  controllers: [StorageFileController],
  providers: [UploadService, StorageFileSubscriber],
  exports: [UploadService],
})
export class StorageModule { }
