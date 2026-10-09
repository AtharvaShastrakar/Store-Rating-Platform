import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('Auth API Integration Tests', () => {
  it('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/auth/signup should reject name shorter than 20 characters', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Short Name',
      email: 'shortname@example.com',
      address: '123 Test Street, Suite 100',
      password: 'UserPass123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name', message: expect.stringContaining('20 and 60') }),
      ])
    );
  });

  it('POST /api/auth/signup should reject password missing uppercase or special char', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Test Customer User Account Name',
      email: 'invalidpass@example.com',
      address: '123 Test Street, Suite 100',
      password: 'simplepassword',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/auth/login should authenticate valid admin user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@storerating.com',
      password: 'AdminPass123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('ADMIN');
  });

  it('POST /api/auth/login should fail with invalid password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@storerating.com',
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
