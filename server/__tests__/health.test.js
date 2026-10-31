'use strict';
// Regression tests for GET /api/health (#469).
//
// `render.yaml` declares `healthCheckPath: /api/health`, but no route served
// it: the request fell through to the SPA catch-all and returned index.html
// with a 200. The health check "passed" while saying nothing about the API —
// the exact failure mode DEPLOYMENT.md warns about ("a text/html answer means
// the request fell through to the SPA catch-all").
//
// These tests assert that the route answers JSON, that it leaks nothing, and
// that the path in render.yaml is the path the server actually serves.

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-not-the-default-0123456789abcdef';
process.env.MONGO_URI = 'mongodb://127.0.0.1:1/none';

const fs = require('fs');
const path = require('path');
const request = require('supertest');

const app = require('../index');

describe('GET /api/health', () => {
  it('answers 200 with JSON', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.type).toBe('application/json');
    expect(res.body.status).toBe('ok');
  });

  it('reports the runtime and uptime, and nothing else', async () => {
    const res = await request(app).get('/api/health');
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.node).toBe(process.versions.node);
    expect(Object.keys(res.body).sort()).toEqual(['node', 'status', 'uptime']);
  });

  it('leaks no credentials or environment values', async () => {
    const res = await request(app).get('/api/health');
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('JWT_SECRET');
    expect(body).not.toContain('MONGO_URI');
    expect(body).not.toContain(process.env.JWT_SECRET);
    expect(body).not.toContain('TENALI_SEED_USERS');
  });

  it('does not need a database connection', async () => {
    // MONGO_URI points at a closed port; a health check that depended on it
    // would fail exactly when the database is what broke.
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });
});

describe('render.yaml health check path', () => {
  const renderYaml = fs.readFileSync(path.join(__dirname, '..', '..', 'render.yaml'), 'utf8');

  it('points at a path the server serves', () => {
    const match = renderYaml.match(/healthCheckPath:\s*(\S+)/);
    expect(match).not.toBeNull();
    expect(match[1]).toBe('/api/health');
  });
});
