'use strict';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-not-the-default-0123456789abcdef';
process.env.MONGO_URI = 'mongodb://127.0.0.1:1/none';

const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../index');

describe('Matrix Mystics routes', () => {
  const indexHtml = fs.readFileSync(
    path.join(__dirname, '..', '..', 'client', 'dist', 'index.html'),
    'utf8'
  );

  it('serves the app page at /matrixmystics', async () => {
    const res = await request(app).get('/matrixmystics').redirects(1);
    expect(res.status).toBe(200);
    expect(res.type).toBe('text/html');
    expect(res.text).toBe(indexHtml);
  });

  it('serves the app page for a deep link', async () => {
    const res = await request(app).get('/matrixmystics/a/b');
    expect(res.status).toBe(200);
    expect(res.type).toBe('text/html');
    expect(res.text).toBe(indexHtml);
  });

  it('keeps paths outside the prefix on the generic SPA fallback', async () => {
    const res = await request(app).get('/random-test-path');
    expect(res.status).toBe(200);
    expect(res.type).toBe('text/html');
    expect(res.text).toBe(indexHtml);
  });
});
