import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

export interface EmailContext {
  [key: string]: unknown;
}

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendMail(
    to: string,
    subject: string,
    template: string,
    context: EmailContext,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject,
      template,
      context,
    });
  }
} 