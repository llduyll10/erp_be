import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EmailOptions } from '../email/interfaces/email-options.interface';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send an email
   * @param options Email options
   */
  async sendMail(options: EmailOptions): Promise<void> {
    try {
      // If we're in test or development mode with no email config, just log instead
      if (
        process.env.NODE_ENV === 'test' ||
        (process.env.NODE_ENV === 'development' &&
          !this.configService.get('EMAIL_HOST'))
      ) {
        this.logger.debug(
          `[MAIL MOCK] To: ${options.to}, Subject: ${options.subject}`,
        );
        this.logger.debug(
          `[MAIL MOCK] Content: ${
            options.text ||
            options.html ||
            (options.template ? `Using template: ${options.template}` : '')
          }`,
        );
        return;
      }

      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: options.context,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });
      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      // We don't want to throw an error here to prevent API failures due to email issues
      // If email sending is critical, you can throw an error here
    }
  }

  /**
   * Send a password reset email
   * @param to Email address
   * @param token Reset token
   * @param userName User name
   */
  async sendPasswordResetEmail(
    to: string,
    token: string,
    userName: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3000',
    )}/reset-password?token=${token}`;

    await this.sendMail({
      to,
      subject: 'Password Reset',
      template: 'password-reset',
      context: {
        resetUrl,
        userName,
        expiresIn: '1 hour',
      },
    });
  }
}
