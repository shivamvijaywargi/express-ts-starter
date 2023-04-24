import request from 'supertest';
import app from './app';

describe('Test default API route', () => {
  test('It should return a 200 response on GET /api/ping', async () => {
    const response = await request(app).get('/api/ping');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      status: 'UP',
      message: 'PONG',
    });
  });

  test('It should return a 404 response on an unknown route', async () => {
    const response = await request(app).get('/unknown/route');
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: 'Not Found - GET /unknown/route',
    });
  });
});
