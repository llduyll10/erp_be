import { Module, Global } from '@nestjs/common';
import { BullModule } from './bull/bull.module';
import { EmailModule } from './email/email.module';
import { FileModule } from './file/file.module';
import { StorageModule } from './storage/storage.module';
import { EntityUniqueValidator } from './validators/entity-unique.validator';
import { EncryptionService } from './services/encryption.service';
import { MailService } from './services/mail.service';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EMailConfigService } from './email/email-config.service';

@Global()
@Module({
  imports: [
    BullModule,
    EmailModule,
    StorageModule,
    FileModule,
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useClass: EMailConfigService,
    }),
  ],
  providers: [EntityUniqueValidator, EncryptionService, MailService],
  exports: [EncryptionService, MailService],
})
export class ShareModule {}
