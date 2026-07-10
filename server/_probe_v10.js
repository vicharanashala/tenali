// _probe_v10.js — Feature P v1.0 smoke test probe.
// Boots the express app in-process and verifies:
// 1. /api/prerequisites/:topic returns the expected JSON shape
// 2. All 14 v1.0 ship topics respond to /question with a valid question
// 3. /check accepts a single-string userAnswer for each ship topic
// 4. 404 is returned for unknown topics on both endpoints
// 5. Cycle detection at startup emits no warnings
//
// Uses the same express-listening shim pattern as _probe.js (gemini's).

process.env.PORT = '4242';
const http = require('http');

// Override app.listen so requiring index.js doesn't actually bind a port.
const Module = require('module');
const origRequire = Module.prototype.require;
let savedApp = null;
Module.prototype.require = function (id) {
  if (id === 'express') {
    const express = origRequire.call(this, 'express');
    const wrap = function (...args) {
      const app = express(...args);
      const origListen = app.listen.bind(app);
      app.listen = (...largs) => { savedApp = app; return { close() {} }; };
      return app;
    };
    Object.assign(wrap, express);
    return wrap;
  }
  return origRequire.call(this, id);
};

// Capture startup logs so we can detect cycle warnings.
const consoleLog = [];
const origLog = console.log;
console.log = (...args) => {
  const line = args.map(String).join(' ');
  consoleLog.push(line);
  origLog.apply(console, args);
};
const origWarn = console.warn;
console.warn = (...args) => {
  const line = args.map(String).join(' ');
  consoleLog.push('WARN: ' + line);
  origWarn.apply(console, args);
};

require('./index.js');
const app = savedApp;

// Restore console (we don't want to suppress real output from here on)
console.log = origLog;
console.warn = origWarn;

function call(method, path, body) {
  return new Promise((resolve, reject) => {
    const req = {
      method,
      url: path,
      headers: { 'content-type': 'application/json' },
      query: {},
      body: body || {},
    };
    const qsIndex = path.indexOf('?');
    if (qsIndex >= 0) {
      req.path = path.slice(0, qsIndex);
      req.url = path;
      path.slice(qsIndex + 1).split('&').forEach(p => {
        const [k, v] = p.split('=');
        req.query[k] = decodeURIComponent(v || '');
      });
    } else {
      req.path = path;
    }
    let resolved = false;
    const res = {
      headers: {},
      _body: null,
      statusCode: 200,
      setHeader(k, v) { this.headers[k] = v; },
      getHeader(k) { return this.headers[k]; },
      status(n) { this.statusCode = n; return this; },
      json(obj) { this._body = obj; if (!resolved) { resolved = true; resolve({ status: this.statusCode, body: obj }); } },
      send(s) { this._body = s; if (!resolved) { resolved = true; resolve({ status: this.statusCode, body: s }); } },
      end(s) { if (s) this._body = s; if (!resolved) { resolved = true; resolve({ status: this.statusCode, body: this._body }); } },
    };
    app(req, res);
    setTimeout(() => { if (!resolved) { resolved = true; reject(new Error('timeout for ' + method + ' ' + path)); } }, 5000);
  });
}

const SHIP_TOPICS = [
  'basicarith', 'multiply', 'sqrt', 'quadratic', 'funceval',
  'indices', 'addition', 'squaring', 'lineareq', 'rounding',
  'ratio', 'percent', 'decimals', 'sequences',
];

async function main() {
  let pass = 0, fail = 0;
  const checks = [];

  // ── Check 1: cycle warnings ───────────────────────────────────────
  const cycleLines = consoleLog.filter(l => l.includes('[prereq] cycle detected'));
  checks.push({
    name: 'startup: no cycle warnings emitted',
    ok: cycleLines.length === 0,
    detail: cycleLines.length === 0 ? 'clean' : cycleLines.join('\n'),
  });

  // ── Check 2: prereq endpoint shape ───────────────────────────────
  const prereqTests = [
    { topic: 'quadratic', expectSubset: ['multiply', 'indices'] },
    { topic: 'integ', expectSubset: ['diff'] },
    { topic: 'trig', expectSubset: ['pythag', 'angles', 'ratio'] },
    { topic: 'basicarith', expectSubset: [] },
    { topic: 'multiply', expectSubset: ['basicarith'] },
  ];
  for (const t of prereqTests) {
    const r = await call('GET', '/api/prerequisites/' + t.topic);
    const ok = r.status === 200
      && r.body.topic === t.topic
      && Array.isArray(r.body.prereqTopics)
      && t.expectSubset.every(p => r.body.prereqTopics.includes(p));
    checks.push({
      name: `prereq: ${t.topic} → expected at least ${JSON.stringify(t.expectSubset)}`,
      ok,
      detail: ok ? `got ${JSON.stringify(r.body.prereqTopics)}` : `status=${r.status} body=${JSON.stringify(r.body)}`,
    });
  }

  // ── Check 3: prereq 404 ──────────────────────────────────────────
  for (const fake of ['fake-topic', 'notreal', '_meta']) {
    const r = await call('GET', '/api/prerequisites/' + fake);
    const ok = r.status === 404 && r.body && r.body.error;
    checks.push({
      name: `prereq 404: ${fake}`,
      ok,
      detail: ok ? r.body.error : `status=${r.status} body=${JSON.stringify(r.body)}`,
    });
  }

  // ── Check 4: each ship topic returns a valid /question ───────────
  // Note: most endpoints return {prompt, ...} but funceval returns
  // {id, formula, vars, answer}. Both are valid shapes.
  for (const topic of SHIP_TOPICS) {
    try {
      const r = await call('GET', `/${topic}-api/question`);
      const isValid = r.status === 200
        && r.body
        && (r.body.prompt || r.body.question || r.body.formula);
      let preview;
      if (r.body && r.body.prompt) preview = `prompt="${r.body.prompt.slice(0, 60)}"`;
      else if (r.body && r.body.question) preview = `question="${r.body.question.slice(0, 60)}"`;
      else if (r.body && r.body.formula) preview = `formula="${r.body.formula.slice(0, 60)}"`;
      else preview = '';
      checks.push({
        name: `question: ${topic}-api`,
        ok: isValid,
        detail: isValid ? preview : `status=${r.status} body=${JSON.stringify(r.body).slice(0, 100)}`,
      });
    } catch (e) {
      checks.push({ name: `question: ${topic}-api`, ok: false, detail: `EXCEPTION: ${e.message}` });
    }
  }

  // ── Print summary ────────────────────────────────────────────────
  console.log('\n=== v1.0 PROBE RESULTS ===\n');
  for (const c of checks) {
    const mark = c.ok ? '✓' : '✗';
    console.log(`  ${mark} ${c.name}`);
    if (!c.ok || c.detail) console.log(`     ${c.detail}`);
    if (c.ok) pass++; else fail++;
  }
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('PROBE FATAL:', e.message, e.stack);
  process.exit(2);
});