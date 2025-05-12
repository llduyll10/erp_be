import { Module } from '@nestjs/common';
import { BullModule } from './modules/bull/bull.module';
import { EmailModule } from './modules/email/email.module';
import { FileModule } from './modules/file/file.module';

@Module({
  imports: [
    BullModule,
    EmailModule,
    FileModule,
  ],
  exports: [
    BullModule,
    EmailModule,
    FileModule,
  ],
})
export class SharedModule {} 