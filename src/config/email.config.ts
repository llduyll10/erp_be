import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  provider: process.env.MAIL_PROVIDER || 'maildev',
  mailFrom: process.env.MAIL_FROM || 'noreply@example.com',

  // Maildev configuration for local development
  maildev: {
    host: process.env.MAILDEV_HOST || 'localhost',
    port: parseInt(process.env.MAILDEV_PORT || '1025', 10),
    ignoreTLS: true,
    secure: false,
    username: process.env.MAILDEV_USERNAME || 'maildev',
    password: process.env.MAILDEV_PASSWORD || 'maildev',
  },

  // SMTP configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || '',
    },
  },

  // SendGrid configuration
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
  },
}));