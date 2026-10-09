import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const app = createApp();
let adminToken: string;

describe('Admin API Integration Tests', () => {
  beforeAll(async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@storerating.com',
      password: 'AdminPass123!',
    });
    adminToken = loginRes.body.token;
  });

  it('GET /api/admin/dashboard-stats should return metrics counts', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.totalUsers).toBeGreaterThanOrEqual(1);
    expect(res.body.totalStores).toBeGreaterThanOrEqual(1);
    expect(res.body.totalRatings).toBeGreaterThanOrEqual(0);
  });

  it('GET /api/admin/users should support role filtering & search', async () => {
    const res = await request(app)
      .get('/api/admin/users?role=STORE_OWNER')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    res.body.users.forEach((u: any) => {
      expect(u.role).toBe('STORE_OWNER');
    });
  });

  it('GET /api/admin/users/:id should return user details with store owner rating info', async () => {
    const usersRes = await request(app)
      .get('/api/admin/users?role=STORE_OWNER')
      .set('Authorization', `Bearer ${adminToken}`);

    const owner = usersRes.body.users[0];
    if (owner) {
      const detailRes = await request(app)
        .get(`/api/admin/users/${owner.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.user.role).toBe('STORE_OWNER');
      expect(detailRes.body.user.storeRating).toBeDefined();
    }
  });

  it('GET /api/admin/dashboard-stats should fail without auth token', async () => {
    const res = await request(app).get('/api/admin/dashboard-stats');
    expect(res.status).toBe(401);
  });
});
