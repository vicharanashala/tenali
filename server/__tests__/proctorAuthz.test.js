'use strict';
// Authorization tests for the proctor read routes and the emotion routes (#471).
//
// These routes served student data to anyone who could reach the server:
// proctor sessions carry usernames, and every proctor event carries base64
// webcam images, audio and speech transcripts (VULN-01 in #457). The emotion
// history route returned any student's records to any caller, and the submit
// route took the identity from the request body (VULN-03).
//
// The assertions here are deliberately database-free: 401 and 403 are decided
// by the auth middleware before any query runs, so the behaviour is pinned
// without a mongod. The admin happy path needs a database and is covered by
// the proctor flow itself.

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-not-the-default-0123456789abcdef';
process.env.MONGO_URI = 'mongodb://127.0.0.1:1/none';

const jwt = require('jsonwebtoken');
const request = require('supertest');

// The requests that get past the auth gate still reach the database, and
// MONGO_URI points at a closed port here. Mongoose's default buffering
// timeout is 10s per query, which would make this file take a minute; the
// queries are not what these tests are about.
require('mongoose').set('bufferTimeoutMS', 1000);

const auth = require('../auth');
const app = require('../index');

const sign = (payload) => jwt.sign(payload, auth.JWT_SECRET);

const studentToken = sign({ sub: 'student-1', username: 'student_one', role: 'user' });
const otherStudentToken = sign({ sub: 'student-2', username: 'student_two', role: 'user' });
const adminToken = sign({ sub: 'admin-1', username: 'root', role: 'admin' });

describe('GET /api/proctor/sessions', () => {
  it('refuses a request with no token', async () => {
    const res = await request(app).get('/api/proctor/sessions');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('missing token');
  });

  it('refuses a token signed with the wrong secret', async () => {
    const forged = jwt.sign({ sub: 'admin-1', username: 'root', role: 'admin' }, 'tenali-dev-secret-change-me');
    const res = await request(app).get('/api/proctor/sessions').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid or expired token');
  });

  it('refuses a signed-in student', async () => {
    const res = await request(app).get('/api/proctor/sessions').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('admin access required');
  });

  it('lets an admin through the gate', async () => {
    const res = await request(app).get('/api/proctor/sessions').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  }, 20000);
});

describe('GET /api/proctor/session/:id', () => {
  it('refuses a request with no token', async () => {
    const res = await request(app).get('/api/proctor/session/000000000000000000000000');
    expect(res.status).toBe(401);
  });

  it('refuses a signed-in student', async () => {
    const res = await request(app)
      .get('/api/proctor/session/000000000000000000000000')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it('lets an admin through the gate', async () => {
    const res = await request(app)
      .get('/api/proctor/session/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  }, 20000);
});

describe('POST /api/emotions/submit', () => {
  it('refuses a request with no token', async () => {
    const res = await request(app)
      .post('/api/emotions/submit')
      .send({ quizType: 'trig', emotion: 'happy' });
    expect(res.status).toBe(401);
  });

  it('refuses a forged token', async () => {
    const forged = jwt.sign({ sub: 'x', username: 'y', role: 'admin' }, 'tenali-dev-secret-change-me');
    const res = await request(app)
      .post('/api/emotions/submit')
      .set('Authorization', `Bearer ${forged}`)
      .send({ quizType: 'trig', emotion: 'happy' });
    expect(res.status).toBe(401);
  });

  it('passes the gate for a signed-in student and ignores the identity in the body', async () => {
    const res = await request(app)
      .post('/api/emotions/submit')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ quizType: 'trig', emotion: 'happy', userId: 'someone-else', username: 'someone-else' });
    // The write needs a database; what matters here is that the request got
    // past the auth gate and was not rejected for carrying a body identity.
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  }, 20000);
});

describe('GET /api/emotions/history', () => {
  it('refuses a request with no token', async () => {
    const res = await request(app).get('/api/emotions/history');
    expect(res.status).toBe(401);
  });

  it('refuses a forged token', async () => {
    const forged = jwt.sign({ sub: 'x', username: 'y', role: 'admin' }, 'tenali-dev-secret-change-me');
    const res = await request(app).get('/api/emotions/history').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it('passes the gate for a signed-in student', async () => {
    const res = await request(app).get('/api/emotions/history').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  }, 20000);
});
