import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/entities/users.entity';
import { Company } from '../src/entities/companies.entity';
import { EncryptionService } from '../src/shared/services/encryption.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { createTestingModule, createTestingApp } from './test-utils';
import { AuthService } from '../src/modules/auth/auth.service';
import * as jwt from 'jsonwebtoken'; // Import native jsonwebtoken

describe('JWT Authentication (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let companyRepository: Repository<Company>;
  let encryptionService: EncryptionService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let authService: AuthService;
  let testUser: User;
  let validToken: string;
  let expiredToken: string;
  let invalidSignatureToken: string;

  beforeAll(async () => {
    const moduleFixture = await createTestingModule();
    app = await createTestingApp(moduleFixture);

    userRepository = moduleFixture.get(getRepositoryToken(User));
    companyRepository = moduleFixture.get(getRepositoryToken(Company));
    encryptionService = moduleFixture.get(EncryptionService);
    jwtService = moduleFixture.get(JwtService);
    configService = moduleFixture.get(ConfigService);
    authService = moduleFixture.get(AuthService);

    // Clean databases
    await userRepository.query('DELETE FROM users');
    await companyRepository.query('DELETE FROM companies');
    await userRepository.query('DELETE FROM access_tokens');

    // Create a test company
    const company = companyRepository.create({
      name: 'JWT Test Company',
      email: 'jwt@example.com',
    });
    const savedCompany = await companyRepository.save(company);

    // Create a test user
    const hashedPassword = await encryptionService.hash('Password123!');
    testUser = userRepository.create({
      full_name: 'JWT Test User',
      email: 'jwt@example.com',
      password: hashedPassword,
      company_id: savedCompany.id,
    });
    testUser = await userRepository.save(testUser);

    // Get tokens through the actual login flow
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'jwt@example.com',
        password: 'Password123!',
      });

    if (
      loginResponse.status !== 200 ||
      !loginResponse.body.data?.data?.accessToken
    ) {
      console.error('Login failed:', loginResponse.body);
      throw new Error('Failed to login');
    }

    validToken = loginResponse.body.data.data.accessToken;

    // Create a payload for tokens
    const payload = {
      sub: testUser.id,
      email: testUser.email,
      role: testUser.role,
      company_id: testUser.company_id,
    };

    // Use native jsonwebtoken for expired token
    const jwtSecret = configService.get('JWT_SECRET');
    expiredToken = jwt.sign(
      { ...payload, exp: Math.floor(Date.now() / 1000) - 10 },
      jwtSecret,
    );

    // For invalid signature token
    invalidSignatureToken = jwt.sign(payload, 'wrongsecret', {
      expiresIn: '1h',
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should access protected route with valid token', () => {
    return request(app.getHttpServer())
      .get('/users/profile/me')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect((res) => {
        // The API response has multiple levels of nesting
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('message');
        expect(res.body.data).toHaveProperty('data');

        // Check user properties in response.data.data
        const userData = res.body.data.data;
        expect(userData).toHaveProperty('id');
        expect(userData).toHaveProperty('email', 'jwt@example.com');
      });
  });

  it('should reject access with expired token', () => {
    return request(app.getHttpServer())
      .get('/users/profile/me')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('should reject access with invalid signature token', () => {
    return request(app.getHttpServer())
      .get('/users/profile/me')
      .set('Authorization', `Bearer ${invalidSignatureToken}`)
      .expect(401);
  });

  it('should reject access with malformed token', () => {
    return request(app.getHttpServer())
      .get('/users/profile/me')
      .set('Authorization', 'Bearer malformedtoken')
      .expect(401);
  });

  it('should reject access without token', () => {
    return request(app.getHttpServer()).get('/users/profile/me').expect(401);
  });

  it('should allow access to public routes without token', () => {
    return request(app.getHttpServer()).post('/auth/login').expect(400); // Bad request since we're not sending data, but not 401
  });
});
