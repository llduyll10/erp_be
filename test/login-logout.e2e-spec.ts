import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/entities/users.entity';
import { Company } from '../src/entities/companies.entity';
import { EncryptionService } from '../src/shared/services/encryption.service';
import { createTestingModule, createTestingApp } from './test-utils';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let companyRepository: Repository<Company>;
  let encryptionService: EncryptionService;
  let accessToken: string;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture = await createTestingModule();
    app = await createTestingApp(moduleFixture);

    userRepository = moduleFixture.get(getRepositoryToken(User));
    companyRepository = moduleFixture.get(getRepositoryToken(Company));
    encryptionService = moduleFixture.get(EncryptionService);

    // Clean databases
    await userRepository.query('DELETE FROM users');
    await companyRepository.query('DELETE FROM companies');
    await userRepository.query('DELETE FROM access_tokens');

    // Create a test company
    const company = companyRepository.create({
      name: 'Test Company',
      email: 'company@example.com',
    });
    const savedCompany = await companyRepository.save(company);

    // Create a test user
    const hashedPassword = await encryptionService.hash('Password123!');
    testUser = userRepository.create({
      full_name: 'Test User',
      email: 'user@example.com',
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

  it('should login with valid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'Password123!',
      })
      .expect(200)
      .expect((res: any) => {
        // Debug logging
        console.log(
          'Login response:',
          JSON.stringify(res.body.data.data, null, 2),
        );

        // Adjust for nested response structure
        expect(res.body.data).toHaveProperty('data');
        const authData = res.body.data.data;
        expect(authData).toHaveProperty('accessToken');
        expect(authData).toHaveProperty('refreshToken');
        expect(authData).toHaveProperty('user');
        expect(authData.user).toHaveProperty('email', 'user@example.com');
        accessToken = authData.accessToken;
      });
  });

  it('should reject login with invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'WrongPassword123!',
      })
      .expect(401);
  });

  it('should access protected route with valid token', () => {
    return request(app.getHttpServer())
      .get('/users/profile/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res: any) => {
        // Adjust for nested response structure
        expect(res.body.data).toHaveProperty('data');
        const userData = res.body.data.data;
        expect(userData).toHaveProperty('id');
        expect(userData).toHaveProperty('email', 'user@example.com');
      });
  });

  it('should logout successfully', () => {
    console.log('Using access token for logout:', accessToken);
    return request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('should reject access to protected route after logout', async () => {
    // Wait a bit to ensure token is processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // This should now fail since the token should be invalidated
    return request(app.getHttpServer())
      .get('/users/profile/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });
});
