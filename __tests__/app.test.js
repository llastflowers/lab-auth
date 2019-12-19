require('dotenv').config();

const request = require('supertest');
const app = require('../lib/app');
const connect = require('../lib/utils/connect');
const mongoose = require('mongoose');
const User = require('../lib/models/User');

describe('app routes', () => {
  beforeAll(() => {
    connect();
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  afterAll(() => {
    return mongoose.connection.close();
  });

  it('can sign up a user', () => {
    return request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'willow@willow.com', password: 'TREATS' })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.any(String),
          email: 'willow@willow.com',
          __v: 0
        });
      });
  });

  it('can log in a user', async() => {
    const user = await User.create({ email: 'willow@willow.com', password: 'TREATS' });
    return request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'willow@willow.com', password: 'TREATS' })
      .then(res => {
        expect(res.body).toEqual({
          _id: user.id,
          email: 'willow@willow.com',
          __v: 0
        });
      });
  });

  it('fails when a bad email is used', async() => {
    await User.create({ email: 'willow@willow.com', password: 'TREATS' });
    return request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'willowsarchnemesisskittles@willow.com', password: 'TREATS' })
      .then(res => {
        expect(res.body).toEqual({
          message: 'Invalid Email/Password',
          status: 401
        });
      });
  });

  it('fails when a bad password is used', async() => {
    await User.create({ email: 'willow@willow.com', password: 'TREATS' });
    return request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'willow@willow.com', password: 'nailclippers' })
      .then(res => {
        expect(res.body).toEqual({
          message: 'Invalid Email/Password',
          status: 401
        });
      });
  });
});
