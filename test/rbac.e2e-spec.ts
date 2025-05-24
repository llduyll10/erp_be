import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../src/entities/users.entity';
import { Company } from '../src/entities/companies.entity';
import { EncryptionService } from '../src/shared/services/encryption.service';
import { createTestingModule, createTestingApp } from './test-utils';

describe('Role-Based Access Control (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let companyRepository: Repository<Company>;
  let encryptionService: EncryptionService;
  let adminToken: string;
  let salesToken: string;
  let warehouseToken: string;

  beforeAll(async () => {
    const moduleFixture = await createTestingModule();
    app = await createTestingApp(moduleFixture);

    userRepository = moduleFixture.get(getRepositoryToken(User));
    companyRepository = moduleFixture.get(getRepositoryToken(Company));
    encryptionService = moduleFixture.get(EncryptionService);

    // Clean database
    await userRepository.query('DELETE FROM users');
    await companyRepository.query('DELETE FROM companies');

    // Create test company
    const company = companyRepository.create({
      name: 'RBAC Test Company',
      email: 'rbac@example.com',
    });
    const savedCompany = await companyRepository.save(company);

    // Create test admin user
    const hashedPassword = await encryptionService.hash('Password123!');
    const adminUser = userRepository.create({
      full_name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      company_id: savedCompany.id,
      role: UserRole.ADMIN,
    });
    await userRepository.save(adminUser);

    // Create test sales user
    const salesUser = userRepository.create({
      full_name: 'Sales User',
      email: 'sales@example.com',
      password: hashedPassword,
      company_id: savedCompany.id,
      role: UserRole.SALES,
    });
    await userRepository.save(salesUser);

    // Create test warehouse user
    const warehouseUser = userRepository.create({
      full_name: 'Warehouse User',
      email: 'warehouse@example.com',
      password: hashedPassword,
      company_id: savedCompany.id,
      role: UserRole.WAREHOUSE,
    });
    await userRepository.save(warehouseUser);

    // Login with admin user to get token
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Password123!',
      });
    console.log('Admin login response:', adminLoginResponse.body);

    if (!adminLoginResponse.body.data?.data?.accessToken) {
      console.error('Failed to get admin token:', adminLoginResponse.body);
      throw new Error('Admin login failed');
    }
    adminToken = adminLoginResponse.body.data.data.accessToken;

    // Login with sales user to get token
    const salesLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'sales@example.com',
        password: 'Password123!',
      });

    if (!salesLoginResponse.body.data?.data?.accessToken) {
      console.error('Failed to get sales token:', salesLoginResponse.body);
      throw new Error('Sales login failed');
    }
    salesToken = salesLoginResponse.body.data.data.accessToken;

    // Login with warehouse user to get token
    const warehouseLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'warehouse@example.com',
        password: 'Password123!',
      });

    if (!warehouseLoginResponse.body.data?.data?.accessToken) {
      console.error(
        'Failed to get warehouse token:',
        warehouseLoginResponse.body,
      );
      throw new Error('Warehouse login failed');
    }
    warehouseToken = warehouseLoginResponse.body.data.data.accessToken;
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

  it('should deny sales role from accessing admin dashboard', () => {
    return request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${salesToken}`)
      .expect(403);
  });

  it('should deny warehouse role from accessing admin dashboard', () => {
    return request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${warehouseToken}`)
      .expect(403);
  });

  // Sales data access tests
  it('should allow admin to access sales data', () => {
    return request(app.getHttpServer())
      .get('/admin/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('should allow sales role to access sales data', () => {
    return request(app.getHttpServer())
      .get('/admin/sales')
      .set('Authorization', `Bearer ${salesToken}`)
      .expect(200);
  });

  it('should deny warehouse role from accessing sales data', () => {
    return request(app.getHttpServer())
      .get('/admin/sales')
      .set('Authorization', `Bearer ${warehouseToken}`)
      .expect(403);
  });

  // Warehouse data access tests
  it('should allow all roles to access warehouse data', async () => {
    await request(app.getHttpServer())
      .get('/admin/warehouse')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/admin/warehouse')
      .set('Authorization', `Bearer ${salesToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/admin/warehouse')
      .set('Authorization', `Bearer ${warehouseToken}`)
      .expect(200);
  });
});
