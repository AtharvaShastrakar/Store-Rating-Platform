import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const app = createApp();
let userToken: string;

describe('Rating & Store API Integration Tests', () => {
  beforeAll(async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'christopher.user@gmail.com',
      password: 'UserPass123!',
    });
    userToken = loginRes.body.token;
  });

  it('GET /api/stores should return store listings with ratings', async () => {
    const res = await request(app)
      .get('/api/stores')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.stores)).toBe(true);
    expect(res.body.stores.length).toBeGreaterThan(0);
    expect(res.body.stores[0].overallRating).toBeDefined();
  });

  it('POST /api/ratings should submit a valid star rating (1-5)', async () => {
    const storesRes = await request(app)
      .get('/api/stores')
      .set('Authorization', `Bearer ${userToken}`);

    const targetStore = storesRes.body.stores[0];

    const rateRes = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        storeId: targetStore.id,
        rating: 5,
      });

    expect(rateRes.status).toBe(200);
    expect(rateRes.body.rating.value).toBe(5);
  });

  it('POST /api/ratings should reject rating outside 1-5 range', async () => {
    const storesRes = await request(app)
      .get('/api/stores')
      .set('Authorization', `Bearer ${userToken}`);

    const targetStore = storesRes.body.stores[0];

    const rateRes = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        storeId: targetStore.id,
        rating: 6,
      });

    expect(rateRes.status).toBe(400);
    expect(rateRes.body.error.code).toBe('VALIDATION_ERROR');
  });
});
