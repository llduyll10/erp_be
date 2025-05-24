import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingModule, createTestingApp } from './test-utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await createTestingModule();
    app = await createTestingApp(moduleFixture);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toHaveProperty('status', 'ok');
        expect(body.data).toHaveProperty('message');
      });
  });
});
