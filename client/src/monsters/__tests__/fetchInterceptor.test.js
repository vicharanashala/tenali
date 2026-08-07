// Quick validation for fetchInterceptor.js URL/extract logic.
// Run with: node fetchInterceptor.test.js
//
// The interceptor itself can't run in Node (no window.fetch), so we test
// the testable pieces: URL detection, normalized extraction, and the
// classifier integration that we'd see in the actual app.

import { classifyMonster, MONSTERS_ENABLED, MONSTER_IDS } from '../classifier.js';

// ─── URL detection tests ────────────────────────────────────────────────────

// Inlined copy of the isCheckUrl logic for testing — kept in sync with
// fetchInterceptor.js. If you change the URL rule there, update this too.
const ALLOWED_TOPICS = new Set([
  'basicarith', 'multiply', 'sqrt', 'quadratic', 'funceval', 'indices',
  'addition', 'squaring', 'lineareq', 'rounding', 'ratio', 'percent',
  'decimals', 'sequences',
]);

const DEBUG_FIXTURES = {
  'bracketeer': { topic: 'basicarith', question: '3(x+2)', userAnswer: '3x + 2', correctAnswer: '3x + 6' },
  'sign-swapper': { topic: 'basicarith', question: '(-3) + 5', userAnswer: '-2', correctAnswer: '2' },
  'decimal-drifter': { topic: 'decimals', question: '0.5 + 0.3', userAnswer: '0.08', correctAnswer: '0.8' },
  'carry-crasher': { topic: 'addition', question: '47 + 38', userAnswer: '75', correctAnswer: '85' },
};

console.log('=== DEBUG FIXTURES ===');
for (const [monsterId, fixture] of Object.entries(DEBUG_FIXTURES)) {
  const fieldsPresent = ['topic', 'question', 'userAnswer', 'correctAnswer'].every(field => fixture[field] != null && fixture[field] !== '');
  console.log((fieldsPresent ? 'PASS' : 'FAIL') + ' | ' + monsterId + ' debug fixture has complete event data');
  if (!fieldsPresent) process.exitCode = 1;
}

function isCheckUrl(url) {
  if (typeof url !== 'string') return null;
  const cleanUrl = url.split('?')[0].split('#')[0];
  const m = cleanUrl.match(/\/([a-z0-9-]+)-api\/check\/?$/);
  if (!m) return null;
  const topic = m[1];
  if (!ALLOWED_TOPICS.has(topic)) return null;
  return topic;
}

const urlCases = [
  // Allowed topics
  { in: 'https://api.example.com/basicarith-api/check', expect: 'basicarith', label: 'basicarith check (allowed)' },
  { in: 'https://api.example.com/multiply-api/check', expect: 'multiply', label: 'multiply check (allowed)' },
  { in: 'https://api.example.com/sequences-api/check', expect: 'sequences', label: 'sequences check (allowed)' },
  { in: 'https://api.example.com/quadratic-api/check', expect: 'quadratic', label: 'quadratic check (allowed)' },
  // Query string tolerated
  { in: 'https://api.example.com/basicarith-api/check?difficulty=easy', expect: 'basicarith', label: 'check with query string' },
  { in: 'https://api.example.com/basicarith-api/check#section', expect: 'basicarith', label: 'check with hash fragment' },
  { in: 'https://api.example.com/basicarith-api/check/?', expect: 'basicarith', label: 'check with trailing slash' },
  // Blocked: auth
  { in: 'https://api.example.com/auth-api/login', expect: null, label: 'auth login rejected' },
  { in: 'https://api.example.com/auth-api/me', expect: null, label: 'auth me rejected' },
  { in: 'https://api.example.com/api/auth/login', expect: null, label: 'login with no topic prefix' },
  // Blocked: streak / future endpoints
  { in: 'https://api.example.com/streak-api/check', expect: null, label: 'streak-api/check (not in allow-list)' },
  { in: 'https://api.example.com/some-other-api/check', expect: null, label: 'unknown topic rejected' },
  // Blocked: not /check
  { in: 'https://api.example.com/basicarith-api/question', expect: null, label: '/question not /check' },
  { in: 'https://api.example.com/basicarith-api', expect: null, label: 'no /check suffix' },
  // Edge cases
  { in: '', expect: null, label: 'empty string' },
  { in: null, expect: null, label: 'null URL' },
  { in: undefined, expect: null, label: 'undefined URL' },
  { in: 12345, expect: null, label: 'numeric URL' },
];

let urlPass = 0, urlFail = 0;
console.log('=== URL DETECTION ===');
for (const c of urlCases) {
  const got = isCheckUrl(c.in);
  const ok = got === c.expect;
  if (ok) urlPass++; else urlFail++;
  console.log((ok ? 'PASS' : 'FAIL') + ' | ' + c.label + ' | input=' + JSON.stringify(c.in) + ' expect=' + JSON.stringify(c.expect) + ' got=' + JSON.stringify(got));
}

// ─── Normalized extraction tests ────────────────────────────────────────────

// Inlined caches mirroring the module-level ones in fetchInterceptor.js
const _questionCache = new Map();
const _lastRequestBody = new Map();

function parseRequestBody(init) {
  if (!init || !init.body) return null;
  if (typeof init.body !== 'string') return null;
  try { return JSON.parse(init.body); } catch (_e) { return null; }
}

function extractNormalized(data, url) {
  if (!data || typeof data !== 'object') return null;
  if (data.correct !== false) return null;
  const topic = isCheckUrl(url);
  if (!topic) return null;
  // Inlined caches for testing — kept in sync with fetchInterceptor.js
  const cachedQ = _questionCache.get(topic) || {};
  const reqBody = _lastRequestBody.get(topic) || {};
  let question = data.question ?? data.prompt ?? data.q ?? data.stem ?? data.problem ?? cachedQ?.prompt ?? cachedQ?.question ?? '';

  if (cachedQ.a !== undefined && cachedQ.b !== undefined) {
    const op = cachedQ.op ?? (topic === 'addition' ? '+' : (topic === 'multiply' ? '×' : '+'));
    question = `${cachedQ.a} ${op} ${cachedQ.b}`;
  }

  const correctAnswer = data.correctAnswer ?? data.expected ?? data.answer ?? data.display ?? reqBody.correctAnswer ?? reqBody.expected ?? '';
  const userAnswer = data.userAnswer ?? data.answer ?? data.submitted ?? data.studentAnswer ?? reqBody.userAnswer ?? reqBody.submitted ?? reqBody.answer ?? '';
  return { question, userAnswer, correctAnswer, topic };
}

const extractCases = [
  // Standard /check response shape
  {
    label: 'standard shape: question, userAnswer, correctAnswer',
    in: {
      data: { correct: false, question: '3(x+2)', userAnswer: '3x + 2', correctAnswer: '3x + 6' },
      url: 'https://api.example.com/basicarith-api/check',
    },
    expect: { question: '3(x+2)', userAnswer: '3x + 2', correctAnswer: '3x + 6', topic: 'basicarith' },
  },
  // NEW: actual server response shape — only {correct, correctAnswer, message}
  // Question and userAnswer must come from caches.
  {
    label: 'real server shape: question from cache, userAnswer from request body',
    in: {
      data: { correct: false, correctAnswer: 6, message: 'Incorrect' },
      url: 'https://api.example.com/basicarith-api/check',
      setup: () => {
        _questionCache.set('basicarith', { prompt: '3(x+2)' });
        _lastRequestBody.set('basicarith', { answer: 8 });
      },
      teardown: () => { _questionCache.clear(); _lastRequestBody.clear(); },
    },
    expect: { question: '3(x+2)', userAnswer: 8, correctAnswer: 6, topic: 'basicarith' },
  },
  // NEW: operand reconstruction for word problems
  {
    label: 'reconstruct math expression from operands a and b',
    in: {
      data: { correct: false, correctAnswer: 65, message: 'Incorrect' },
      url: 'https://api.example.com/addition-api/check',
      setup: () => {
        _questionCache.set('addition', { prompt: 'Alice has 19 apples...', a: 19, b: 46 });
        _lastRequestBody.set('addition', { answer: 55 });
      },
      teardown: () => { _questionCache.clear(); _lastRequestBody.clear(); },
    },
    expect: { question: '19 + 46', userAnswer: 55, correctAnswer: 65, topic: 'addition' },
  },
  // NEW: parseRequestBody cases
  {
    label: 'parseRequestBody: JSON string parses',
    in: { init: { method: 'POST', body: '{"a":3,"b":2,"answer":8}' } },
    expect: { a: 3, b: 2, answer: 8 },
  },
  {
    label: 'parseRequestBody: missing body returns null',
    in: { init: { method: 'POST' } },
    expect: null,
  },
  {
    label: 'parseRequestBody: invalid JSON returns null',
    in: { init: { method: 'POST', body: 'not-json' } },
    expect: null,
  },
  {
    label: 'parseRequestBody: null init returns null',
    in: { init: null },
    expect: null,
  },
  // Fallback: data.answer is the user's answer
  {
    label: 'alt shape: answer field is user input (correct=false)',
    in: {
      data: { correct: false, question: '3(x+2)', answer: '3x + 2', expected: '3x + 6' },
      url: 'https://api.example.com/basicarith-api/check',
    },
    expect: { question: '3(x+2)', userAnswer: '3x + 2', correctAnswer: '3x + 6', topic: 'basicarith' },
  },
  {
    label: 'display fallback: server response without correctAnswer',
    in: {
      data: { correct: false, display: '0.8', message: 'Incorrect' },
      url: 'https://api.example.com/decimals-api/check',
      setup: () => {
        _questionCache.set('decimals', { prompt: '0.5 + 0.3 = ?' });
        _lastRequestBody.set('decimals', { answer: '0.08' });
      },
      teardown: () => { _questionCache.clear(); _lastRequestBody.clear(); },
    },
    expect: { question: '0.5 + 0.3 = ?', userAnswer: '0.08', correctAnswer: '0.8', topic: 'decimals' },
  },
  {
    label: 'generic decimals payload prefers submitted userAnswer over question answer',
    in: {
      data: { correct: false, display: '16.2', message: 'Incorrect' },
      url: 'https://api.example.com/decimals-api/check',
      setup: () => {
        _questionCache.set('decimals', { prompt: '10.1 + 6.1 = ?' });
        _lastRequestBody.set('decimals', { answer: 16.2, userAnswer: '1.62' });
      },
      teardown: () => { _questionCache.clear(); _lastRequestBody.clear(); },
    },
    expect: { question: '10.1 + 6.1 = ?', userAnswer: '1.62', correctAnswer: '16.2', topic: 'decimals' },
  },
  // Fallback: prompt instead of question
  {
    label: 'alt shape: prompt instead of question',
    in: {
      data: { correct: false, prompt: '3(x+2)', userAnswer: '3x + 2', correctAnswer: '3x + 6' },
      url: 'https://api.example.com/basicarith-api/check',
    },
    expect: { question: '3(x+2)', userAnswer: '3x + 2', correctAnswer: '3x + 6', topic: 'basicarith' },
  },
  // Should NOT extract when correct=true
  {
    label: 'correct=true: returns null (not a wrong answer)',
    in: {
      data: { correct: true, question: '3(x+2)', userAnswer: '3x + 6', correctAnswer: '3x + 6' },
      url: 'https://api.example.com/basicarith-api/check',
    },
    expect: null,
  },
  // Should NOT extract when URL is wrong
  {
    label: 'auth URL: returns null (not a math topic)',
    in: {
      data: { correct: false, question: 'login failed', userAnswer: 'wrong-pw' },
      url: 'https://api.example.com/auth-api/login',
    },
    expect: null,
  },
  // Garbage data
  {
    label: 'null data: returns null',
    in: { data: null, url: 'https://api.example.com/basicarith-api/check' },
    expect: null,
  },
  {
    label: 'missing correct field: returns null',
    in: { data: { question: '3(x+2)' }, url: 'https://api.example.com/basicarith-api/check' },
    expect: null,
  },
];

let extractPass = 0, extractFail = 0;
console.log('\n=== EXTRACTION ===');
for (const c of extractCases) {
  // Per-test setup: populate caches if the case needs it
  if (c.in.setup) c.in.setup();
  let got;
  if (c.in.init !== undefined) {
    // parseRequestBody case
    got = parseRequestBody(c.in.init);
  } else {
    got = extractNormalized(c.in.data, c.in.url);
  }
  const ok = JSON.stringify(got) === JSON.stringify(c.expect);
  if (ok) extractPass++; else extractFail++;
  console.log((ok ? 'PASS' : 'FAIL') + ' | ' + c.label);
  if (!ok) console.log('  expect: ' + JSON.stringify(c.expect) + '\n  got:    ' + JSON.stringify(got));
  if (c.in.teardown) c.in.teardown();
}

// ─── End-to-end: URL → extract → classify ───────────────────────────────────

console.log('\n=== END-TO-END ===');
const e2eCases = [
  {
    label: 'wrong distributive: trigger Bracketeer',
    data: { correct: false, question: '3(x+2)', userAnswer: '3x + 2', correctAnswer: '3x + 6' },
    url: 'https://api.example.com/basicarith-api/check',
    expect: 'bracketeer',
  },
  {
    label: 'wrong sign: trigger Sign Swapper',
    data: { correct: false, question: '(-3) + 5', userAnswer: '-2', correctAnswer: '2' },
    url: 'https://api.example.com/basicarith-api/check',
    expect: 'sign-swapper',
  },
  {
    label: 'decimal drift: trigger Decimal Drifter',
    data: { correct: false, question: '0.5 + 0.3', userAnswer: '0.08', correctAnswer: '0.8' },
    url: 'https://api.example.com/basicarith-api/check',
    expect: 'decimal-drifter',
  },
  {
    label: 'auth wrong-password: classifier NOT triggered',
    data: { correct: false, question: 'login', userAnswer: 'wrong-pw' },
    url: 'https://api.example.com/auth-api/login',
    expect: null,
  },
];

let e2ePass = 0, e2eFail = 0;
for (const c of e2eCases) {
  const normalized = extractNormalized(c.data, c.url);
  const got = normalized ? classifyMonster(normalized) : null;
  const ok = got === c.expect;
  if (ok) e2ePass++; else e2eFail++;
  console.log((ok ? 'PASS' : 'FAIL') + ' | ' + c.label + ' | got=' + JSON.stringify(got));
}

// ─── Summary ────────────────────────────────────────────────────────────────

const totalPass = urlPass + extractPass + e2ePass;
const totalFail = urlFail + extractFail + e2eFail;
const total = totalPass + totalFail;

console.log('\n=== SUMMARY ===');
console.log('URL detection:    ' + urlPass + '/' + (urlPass + urlFail));
console.log('Extraction:       ' + extractPass + '/' + (extractPass + extractFail));
console.log('End-to-end:       ' + e2ePass + '/' + (e2ePass + e2eFail));
console.log('Total:            ' + totalPass + '/' + total);
console.log('MONSTER_IDS:      ' + JSON.stringify(MONSTER_IDS));
console.log('MONSTERS_ENABLED: ' + JSON.stringify(MONSTERS_ENABLED));

if (totalFail > 0) process.exit(1);
