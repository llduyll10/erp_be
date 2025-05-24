import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/entities/users.entity';
import { Company } from '../src/entities/companies.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';

describe('Register Company (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let companyRepository: Repository<Company>;

  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue(true),
  };

  const validCompanyData = {
    company_name: 'Test Company',
    admin: {
      full_name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailerService)
      .useValue(mockMailerService)
      .compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get(getRepositoryToken(User));
    companyRepository = moduleFixture.get(getRepositoryToken(Company));

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    // Clean database before each test
    await userRepository.query('DELETE FROM users');
    await companyRepository.query('DELETE FROM companies');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register-company', () => {
    it('should successfully register a new company with admin user', async () => {
      // When
      const response = await request(app.getHttpServer())
        .post('/auth/register-company')
        .send(validCompanyData);

      // Then
      expect(response.status).toBe(201);
      expect(response.body.data.data).toHaveProperty('access_token');
      expect(response.body.data.data.user).toMatchObject({
        full_name: validCompanyData.admin.full_name,
        email: validCompanyData.admin.email,
      });
      expect(response.body.data.data.company).toMatchObject({
        name: validCompanyData.company_name,
      });
    });

    it('should return 409 when company name already exists', async () => {
      // Given
      await request(app.getHttpServer())
        .post('/auth/register-company')
        .send(validCompanyData);

      // When
      const response = await request(app.getHttpServer())
        .post('/auth/register-company')
        .send({
          company_name: validCompanyData.company_name,
          admin: {
            full_name: 'Another Admin',
            email: 'another@test.com',
            password: 'password123',
          },
        });

      // Then
      expect(response.status).toBe(409);
      expect(response.body.message).toContain(
        'Company with this name already exists',
      );
    });

    it('should return 409 when admin email already exists', async () => {
      // Given
      await request(app.getHttpServer())
        .post('/auth/register-company')
        .send(validCompanyData);

      // When
      const response = await request(app.getHttpServer())
        .post('/auth/register-company')
        .send({
          company_name: 'Different Company',
          admin: {
            full_name: 'Another Admin',
            email: validCompanyData.admin.email,
            password: 'password123',
          },
        });

      // Then
      expect(response.status).toBe(409);
      expect(response.body.message).toContain(
        'User with this email already exists',
      );
    });

    it('should return 400 when company name is missing', async () => {
      // When
      const response = await request(app.getHttpServer())
        .post('/auth/register-company')
        .send({
          admin: validCompanyData.admin,
        });

      // Then
      expect(response.status).toBe(400);
    });

    it('should return 400 when admin email is invalid', async () => {
      // When
      const response = await request(app.getHttpServer())
        .post('/auth/register-company')
        .send({
          company_name: validCompanyData.company_name,
          admin: {
            ...validCompanyData.admin,
            email: 'invalid-email',
          },
        });

      // Then
      expect(response.status).toBe(400);
    });

    it('should return 400 when password is too short', async () => {
      // When
      const response = await request(app.getHttpServer())
        .post('/auth/register-company')
        .send({
          company_name: validCompanyData.company_name,
          admin: {
            ...validCompanyData.admin,
            password: '123',
          },
        });

      // Then
      expect(response.status).toBe(400);
    });
  });
});
