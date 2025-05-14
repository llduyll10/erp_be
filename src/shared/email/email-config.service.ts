import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Injectable()
export class EMailConfigService {
  constructor(private configService: ConfigService) { }

  createMailerOptions(): MailerOptions {
    const provider = this.configService.get<string>('mail.provider');
    const transport = this._getTransportConfig(provider);

    return {
      transport,
      defaults: {
        from: this.configService.get<string>('mail.mailFrom'),
      },
      template: {
        dir: join(__dirname, '..', '..', 'templates', 'email'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }

  private _getTransportConfig(provider?: string) {
    switch (provider) {
      case 'smtp':
        return {
          host: this.configService.get('mail.smtp.host'),
          port: this.configService.get('mail.smtp.port'),
          secure: this.configService.get('mail.smtp.secure'),
          auth: {
            user: this.configService.get('mail.smtp.auth.user'),
            pass: this.configService.get('mail.smtp.auth.pass'),
          },
        };
      case 'sendgrid':
        return {
          service: 'SendGrid',
          auth: {
            api_key: this.configService.get('mail.sendgrid.apiKey'),
          },
        };
      case 'maildev':
        return {
          host: this.configService.get('mail.maildev.host'),
          port: this.configService.get('mail.maildev.port'),
          ignoreTLS: this.configService.get('mail.maildev.ignoreTLS'),
          secure: this.configService.get('mail.maildev.secure'),
          auth: {
            user: this.configService.get('mail.maildev.username'),
            pass: this.configService.get('mail.maildev.password'),
          },
        };
      default:
        throw new Error(`Email provider ${provider} doesn't support yet`);
    }
  }
}
