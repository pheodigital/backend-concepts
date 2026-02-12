import request from 'supertest';
import { createTestApp } from '../utils/test-app';

describe('CORS', () => {
  it('allows frontend origin', async () => {
    const app = await createTestApp();

    const res = await request(app.server).get('/').set('Origin', 'http://localhost:5173');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('blocks unknown origin', async () => {
    const app = await createTestApp();

    const res = await request(app.server).get('/').set('Origin', 'http://evil.com');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
