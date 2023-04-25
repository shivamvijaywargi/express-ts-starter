import request from 'supertest';
import app from '../../app';
import mongoose from 'mongoose';

beforeAll(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/jest');
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('Test the registration route POST /api/v1/auth/new', () => {
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

describe('Test the login route POST /api/v1/auth', () => {
  it('should return email not verified error', async () => {
    const response = await request(app).post('/api/v1/auth').send({
      email: 'jest@unit.test',
      password: '12345678',
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Account not verified, please verify.');
  });

  it('should return user not found error', async () => {
    const response = await request(app)
      .post('/api/v1/auth')
      .send({
        email: 'jest1@unit.test',
        password: '12345678',
      })
      .expect(400);

    expect(response.body.message).toBe(
      'Invalid email or password or user does not exist.',
    );
  });

  it('should return invalid email address', async () => {
    const response = await request(app)
      .post('/api/v1/auth')
      .send({
        email: 'jest1@unit.test11',
        password: '12345678',
      })
      .expect(400);

    expect(response.body.name).toBe('ZodError');
  });

  it('should return a 400 status code when a required field is missing', async () => {
    const response = await request(app)
      .post('/api/v1/auth')
      .send({
        email: 'jest@unit.test',
      })
      .expect(400);

    expect(response.body.name).toBe('ZodError');
  });
});
