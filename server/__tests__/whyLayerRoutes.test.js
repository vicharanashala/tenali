'use strict';
// Routes added for the Why Layer: GET /api/mastery and POST /api/events.
// These run without MongoDB, which is exactly the
// case worth pinning down: no database must read as "unavailable", never
// as "this student has mastered nothing", and the events endpoint must
// bound what a client can write before it ever reaches the database.

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../auth');
const mastery = require('../mastery');
const events = require('../events');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/mastery', mastery.router);
  app.use('/api/events', events.router);
  return app;
}

const token = jwt.sign({ sub: 'u-test', username: 'tester', role: 'user' }, JWT_SECRET, { expiresIn: '5m' });
const auth = { Authorization: `Bearer ${token}` };

describe('GET /api/mastery', () => {
  const app = buildApp();

  test('requires a login', async () => {
    const res = await request(app).get('/api/mastery');
    expect(res.status).toBe(401);
  });

  test('says unavailable (503) without a database, instead of an empty list', async () => {
    const res = await request(app).get('/api/mastery').set(auth);
    expect(res.status).toBe(503);
    expect(res.body.mastery).toBeUndefined();
  });
});

describe('POST /api/events', () => {
  const app = buildApp();
  const post = (body) => request(app).post('/api/events').set(auth).send(body);

  test('requires a login', async () => {
    const res = await request(app).post('/api/events').send({ eventType: 'why_panel_opened' });
    expect(res.status).toBe(401);
  });

  test('accepts a normal event (not stored without a database, never an error)', async () => {
    const res = await post({ eventType: 'why_panel_opened', topicId: 'ratio', details: { from: 'quiz' } });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, logged: false });
  });

  test.each([
    ['missing eventType', {}],
    ['non-string eventType', { eventType: 42 }],
    ['eventType with spaces', { eventType: 'drop table' }],
    ['very long eventType', { eventType: 'a'.repeat(60) }],
    ['topicId that is not an id', { eventType: 'x_opened', topicId: '<script>' }],
    ['details as an array', { eventType: 'x_opened', details: [1, 2] }],
    ['details as a string', { eventType: 'x_opened', details: 'hello' }],
    ['oversized details', { eventType: 'x_opened', details: { blob: 'z'.repeat(5000) } }],
  ])('rejects %s', async (_name, body) => {
    const res = await post(body);
    expect(res.status).toBe(400);
  });

  test('every event name the client sends passes validation', async () => {
    // Mirrors logEvent('...') calls in client/src; a rename that breaks the
    // pattern would otherwise silently drop that metric.
    const names = [
      'why_panel_opened', 'why_deeper_opened', 'prereq_chip_clicked',
      'unlock_chip_clicked', 'checkpoint_passed_or_failed',
      'study_mode_changed', 'focus_topics_set', 'focus_topic_started', 'focus_ladder_opened',
      'focus_ladder_topic_started', 'focus_timer_started', 'focus_bar_next',
    ];
    for (const eventType of names) {
      const res = await post({ eventType, topicId: 'ratio' });
      expect(res.status, eventType).toBe(200);
    }
  });
});

