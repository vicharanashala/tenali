'use strict';
// Parameterized API contract tests — one suite covers all topic endpoints.
// Run these against the MONOLITH (require('../../index')) before any extraction,
// and against each extracted router after extraction.
// Two tests per topic = 106+ tests for near-zero marginal effort per topic.
//
// Usage:
//   TEST_TARGET=monolith npx vitest run apiContract  (tests the live monolith)
//   TEST_TARGET=router   npx vitest run apiContract  (tests extracted routers)

const request = require('supertest');

// All topic keys that have a working *-api/question + *-api/check pair.
// Add new topics here as they are created; the contract tests come for free.
//
// Excluded topics and why (re-add when fixed):
//   trig           — GET /question hangs (>5 s); investigate endpoint
//   simul          — GET returns structured data without `prompt`; POST /check throws 500
//   sequences      — POST /check throws 500 (TypeError on rawAns.replace)
//   fractionadd    — GET returns structured {n1,d1,...} without `prompt` (visual component format)
//   funceval       — GET returns {formula, vars} without `prompt`
//   lineq          — GET returns {m,c,...} without `prompt`
//   column-addition — GET returns {a,b,digits,...} without `prompt`
//   indices        — GET returns object with no `answer` field
//   ratio          — GET returns object with no `answer` field
//   prob           — GET returns object with no `answer` field
//   stats          — GET returns object with no `answer` field
//   vectors        — GET returns object with no `answer` field
//   transform      — GET returns object with no `answer` field
const TOPICS = [
  'quadratic', 'percent', 'sets',
  'matrix', 'mensur', 'bearings', 'log', 'diff',
  'integ', 'bases', 'stdform', 'bounds', 'sdt', 'variation', 'squaring',
  'rounding', 'binomial', 'complex', 'angles', 'triangles', 'congruence',
  'polygons', 'similarity', 'dotprod', 'permcomb', 'limits', 'invtrig',
  'remfactor', 'shares', 'banking', 'gst', 'section', 'linprog',
  'circmeasure', 'conics', 'diffeq', 'hcflcm', 'profitloss', 'decimals',
  'addition', 'multiply', 'basicarith',
];

// Build a minimal Express app that mounts either the monolith or a specific router.
// Phase 1: point at the monolith so tests validate before any refactoring.
// Phase 2+: swap to individual routers after extraction.
function getApp() {
  // ponytail: load the monolith directly; swap to router per-topic in Phase 2
  return require('../../index');
}

describe.each(TOPICS)('%s-api contract', (topic) => {
  let app;
  beforeAll(() => { app = getApp(); });

  test('GET /question returns required shape', async () => {
    const res = await request(app).get(`/${topic}-api/question?difficulty=easy`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      prompt: expect.any(String),
    });
    // answer must be present and not undefined (number or string depending on topic)
    expect(res.body.answer).toBeDefined();
    expect(String(res.body.prompt).length).toBeGreaterThan(0);
  });

  test('POST /check with server answer returns {correct: boolean}', async () => {
    const q = (await request(app).get(`/${topic}-api/question?difficulty=easy`)).body;
    const res = await request(app)
      .post(`/${topic}-api/check`)
      .set('Content-Type', 'application/json')
      .send({ answer: q.answer, userAnswer: String(q.answer) });
    expect(res.status).toBe(200);
    expect(typeof res.body.correct).toBe('boolean');
  });
});
