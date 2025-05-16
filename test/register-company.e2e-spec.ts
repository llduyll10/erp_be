import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from '../src/entities/users.entity';
import { Company } from '../src/entities/companies.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Register Company (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let companyRepository: Repository<Company>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get(getRepositoryToken(User));
    companyRepository = moduleFixture.get(getRepositoryToken(Company));

    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Clean database before each test
    await userRepository.query('DELETE FROM users');
    await companyRepository.query('DELETE FROM companies');
  });

  afterEach(async () => {
    await app.close();
  });

  it('/auth/register (POST) - should register a new company successfully', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        companyName: 'Test Company',
        admin: {
          fullName: 'Admin User',
          email: 'admin@test.com',
          password: 'password123',
        },
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('user');
        expect(res.body).toHaveProperty('company');
        expect(res.body.user).toHaveProperty('fullName', 'Admin User');
        expect(res.body.user).toHaveProperty('email', 'admin@test.com');
        expect(res.body.company).toHaveProperty('name', 'Test Company');
      });
  });

  it('/auth/register (POST) - should return 409 for existing company name', async () => {
    // First register a company
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        companyName: 'Existing Company',
        admin: {
          fullName: 'Admin User',
          email: 'admin1@test.com',
          password: 'password123',
        },
      })
      .expect(201);

    // Try to register again with the same company name
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        companyName: 'Existing Company',
        admin: {
          fullName: 'Another Admin',
          email: 'admin2@test.com',
          password: 'password123',
        },
      })
      .expect(409);
  });

  it('/auth/register (POST) - should return 409 for existing email', async () => {
    // First register a company
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        companyName: 'First Company',
        admin: {
          fullName: 'Admin User',
          email: 'same@test.com',
          password: 'password123',
        },
      })
      .expect(201);

    // Try to register another company with the same admin email
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        companyName: 'Second Company',
        admin: {
          fullName: 'Another Admin',
          email: 'same@test.com',
          password: 'password123',
        },
      })
      .expect(409);
  });

  it('/auth/register (POST) - should return 400 for missing fields', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        companyName: 'Test Company',
        // Missing admin object
      })
      .expect(400);
  });
});
