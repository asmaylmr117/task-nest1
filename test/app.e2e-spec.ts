import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('Auth & Routes E2E', () => {
  let app: INestApplication;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health (Public) should return 200 without token', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  it('GET /auth/profile (Protected) should return 401 when no token is provided', async () => {
    const res = await request(app.getHttpServer()).get('/auth/profile').expect(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /auth/signup should fail when password is less than 6 chars', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'bad@example.com', password: '123' })
      .expect(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('at least 6 characters');
  });

  it('POST /auth/signup should fail when unknown properties are injected', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'attacker@example.com',
        password: 'password123',
        maliciousField: 'exploit',
      })
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /auth/signup should create a user and not return password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'john@example.com', password: 'password123' })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('john@example.com');
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('POST /auth/signup should fail on duplicate email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'john@example.com', password: 'password123' })
      .expect(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /auth/login with invalid password should return 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'john@example.com', password: 'wrongpassword' })
      .expect(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /auth/login with valid credentials should return access_token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'john@example.com', password: 'password123' })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.access_token).toBeDefined();
    userToken = res.body.data.access_token;
  });

  it('GET /auth/profile with valid token should return user data from token', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('john@example.com');
    expect(res.body.data.role).toBe('user');
    expect(res.body.data.userId).toBeDefined();
  });

  it('GET /auth/admin with standard user token should return 403 Forbidden', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/admin')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /auth/signup-admin should create admin user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup-admin')
      .send({ email: 'admin@example.com', password: 'adminpassword123' })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('admin');
  });

  it('POST /auth/login as admin should return token with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'adminpassword123' })
      .expect(201);
    adminToken = res.body.data.access_token;
    expect(adminToken).toBeDefined();
  });

  it('GET /auth/admin with admin token should succeed', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('Welcome to the admin dashboard!');
    expect(res.body.data.user.role).toBe('admin');
  });

  it('POST /auth/refresh with valid token should return new access and refresh tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.access_token).toBeDefined();
    expect(res.body.data.refresh_token).toBeDefined();
  });
});
