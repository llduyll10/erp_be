import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

@Injectable()
export class EMailConfigService {
  constructor(private configService: ConfigService) {}

  createMailerOptions(): MailerOptions {
    const provider = this.configService.get<string>('EMAIL_PROVIDER', 'smtp');

    // If in test environment or no provider, use a fake transport
    if (process.env.NODE_ENV === 'test' || !provider) {
      return {
        transport: {
          jsonTransport: true, // This is a fake transport that doesn't send emails
        },
        defaults: {
          from: this.configService.get<string>(
            'EMAIL_FROM',
            'noreply@example.com',
          ),
        },
        template: {
          dir: path.join(__dirname, '..', '..', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      };
    }

    return {
      transport: this._getTransportConfig(provider),
      defaults: {
        from: this.configService.get<string>(
          'EMAIL_FROM',
          'noreply@example.com',
        ),
      },
      template: {
        dir: path.join(__dirname, '..', '..', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }

  private _getTransportConfig(provider: string) {
    // Default to SMTP if not configured
    if (!provider || provider === 'smtp') {
      return {
        host: this.configService.get<string>('EMAIL_HOST', 'localhost'),
        port: this.configService.get<number>('EMAIL_PORT', 587),
        secure: this.configService.get<boolean>('EMAIL_SECURE', false),
        auth: {
          user: this.configService.get<string>('EMAIL_USER', ''),
          pass: this.configService.get<string>('EMAIL_PASSWORD', ''),
        },
        ignoreTLS: this.configService.get<boolean>('EMAIL_IGNORE_TLS', false),
        requireTLS: this.configService.get<boolean>('EMAIL_REQUIRE_TLS', false),
      };
    }

    // Add other providers here if needed
    throw new Error(`Email provider ${provider} doesn't support yet`);
  }
}
