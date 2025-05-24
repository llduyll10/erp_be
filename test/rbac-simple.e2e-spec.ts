import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/entities/users.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';
import { JwtMockStrategy } from './mock/jwt-mock.strategy';

describe('RBAC Simplified (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let adminToken: string;
  let salesToken: string;
  let warehouseToken: string;

  beforeAll(async () => {
    const mockMailerService = {
      sendMail: jest.fn().mockResolvedValue(true),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailerService)
      .useValue(mockMailerService)
      .overrideProvider(JwtStrategy)
      .useClass(JwtMockStrategy)
      .compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();

    // Create test tokens with sub field to match JwtPayload interface
    adminToken = jwtService.sign({
      sub: '00000000-0000-0000-0000-000000000001',
      role: UserRole.ADMIN,
    });

    salesToken = jwtService.sign({
      sub: '00000000-0000-0000-0000-000000000002',
      role: UserRole.SALES,
    });

    warehouseToken = jwtService.sign({
      sub: '00000000-0000-0000-0000-000000000003',
      role: UserRole.WAREHOUSE,
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // Admin dashboard access tests
  it('should allow admin to access admin dashboard', () => {
    return request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('should deny sales role from accessing admin dashboard', async () => {
    // Debug what token contains
    const tokenPayload = jwtService.decode(salesToken);
    console.log('Sales token payload:', tokenPayload);

    const response = await request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${salesToken}`)
      .expect(403);

    console.log(
      'Response from admin/dashboard with sales role:',
      response.body,
    );
  });

  // Add more tests as needed
});
