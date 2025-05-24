import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { MailerService } from '@nestjs-modules/mailer';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccessToken } from '../src/entities/access-token.entity';

/**
 * Create a testing module with mocked services for E2E tests
 * @returns A compiled testing module
 */
export async function createTestingModule(): Promise<TestingModule> {
  // Create a mock for the MailerService
  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue(true),
  };

  // Create a mock for the AccessToken repository
  const mockAccessTokenRepository = {
    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    create: jest.fn().mockImplementation((dto) => dto),
    findOne: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  return Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MailerService)
    .useValue(mockMailerService)
    .overrideProvider(getRepositoryToken(AccessToken))
    .useValue(mockAccessTokenRepository)
    .compile();
}

/**
 * Create and initialize a NestJS application for testing
 * @param module A compiled testing module
 * @returns An initialized NestJS application
 */
export async function createTestingApp(
  module: TestingModule,
): Promise<INestApplication> {
  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  await app.init();
  return app;
}

/**
 * Ensure proper cleanup of app resources
 * @param app The NestJS application instance
 */
export async function cleanupApp(app: INestApplication): Promise<void> {
  if (app) {
    try {
      await app.close();
    } catch (error) {
      console.error('Error closing app:', error);
    }
  }
}
