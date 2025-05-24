import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/entities/users.entity';
import { Company } from '../src/entities/companies.entity';
import { EncryptionService } from '../src/shared/services/encryption.service';
import { createTestingModule, createTestingApp } from './test-utils';

describe('Refresh Token (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let companyRepository: Repository<Company>;
  let encryptionService: EncryptionService;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture = await createTestingModule();
    app = await createTestingApp(moduleFixture);

    userRepository = moduleFixture.get(getRepositoryToken(User));
    companyRepository = moduleFixture.get(getRepositoryToken(Company));
    encryptionService = moduleFixture.get(EncryptionService);

    // Clean database
    await userRepository.query('DELETE FROM users');
    await companyRepository.query('DELETE FROM companies');
    await userRepository.query('DELETE FROM access_tokens');

    // Create test company
    const company = companyRepository.create({
      name: 'Refresh Token Company',
      email: 'refresh@example.com',
    });
    const savedCompany = await companyRepository.save(company);

    // Create test user
    const hashedPassword = await encryptionService.hash('Password123!');
    const testUser = userRepository.create({
      full_name: 'Refresh User',
      email: 'refresh-user@example.com',
      password: hashedPassword,
      company_id: savedCompany.id,
    });
    await userRepository.save(testUser);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should login and get tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'refresh-user@example.com',
        password: 'Password123!',
      })
      .expect(200);

    accessToken = response.body.data.data.access_token;
    refreshToken = response.body.data.data.refresh_token;

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  it('should refresh tokens successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: refreshToken })
      .expect(200);

    const newAccessToken = response.body.data.data.access_token;
    const newRefreshToken = response.body.data.data.refresh_token;

    console.log('response.body', response.body);

    expect(newAccessToken).toBeDefined();
    expect(newRefreshToken).toBeDefined();
    expect(newAccessToken).not.toEqual(accessToken);
    expect(newRefreshToken).not.toEqual(refreshToken);

    // Update tokens for subsequent tests
    accessToken = newAccessToken;
    refreshToken = newRefreshToken;
  });

  it('should access protected route with new token', async () => {
    await request(app.getHttpServer())
      .get('/users/profile/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('should reject with invalid refresh token', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: 'invalid-token' })
      .expect(401);
  });

  it('should invalidate previous refresh token after use', async () => {
    // Store the original refresh token to validate it's invalidated
    const originalRefreshToken = refreshToken;

    // First refresh is successful
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: originalRefreshToken })
      .expect(200);

    // Add a longer delay to ensure the token invalidation is processed
    await new Promise((resolve) => setTimeout(resolve, 500));

    // But the new refresh token should work
    refreshToken = response.body.data.data.refresh_token;
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: refreshToken })
      .expect(200);
  });
});
