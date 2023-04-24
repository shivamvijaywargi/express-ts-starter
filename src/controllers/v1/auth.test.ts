import request from 'supertest';
import app from '../../app';
import mongoose from 'mongoose';

describe('Test the registration route', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/jest');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  it('registers a user successfully and returns a 201 status code', async () => {
    const response = await request(app)
      .post('/api/v1/auth/new')
      .send({
        email: 'jest@unit.test',
        password: '12345678',
        firstName: 'Jest',
        lastName: 'Test',
      })
      .expect(201);

    expect(response.body.data.email).toBe('jest@unit.test');

    const user = await mongoose.connection.db.collection('users').findOne({
      email: 'jest@unit.test',
    });

    expect(user).toBeDefined();
  });

  it('returns a 400 status code when a required field is missing', async () => {
    const response = await request(app)
      .post('/api/v1/auth/new')
      .send({
        email: 'jest@unit.test',
        password: '12345678',
      })
      .expect(400);

    expect(response.statusCode).toBe(400);
    expect(response.body.name).toBe('ZodError');
  });
});
