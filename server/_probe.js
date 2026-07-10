// Spin up the actual express app and probe endpoints via the in-process supertest pattern.
process.env.PORT = '4242';
const http = require('http');

// Override app.listen so requiring index.js doesn't actually bind a port.
const realCreateServer = http.createServer;
let savedApp = null;
const Module = require('module');
const origRequire = Module.prototype.require;
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

require('./index.js');
const app = savedApp;

// In-memory request helper
function call(method, path, body) {
  return new Promise((resolve) => {
    const req = {
      method,
      url: path,
      headers: { 'content-type': 'application/json' },
      query: {},
      body: body || {},
    };
    // Parse query
    const qsIndex = path.indexOf('?');
    if (qsIndex >= 0) {
      const qs = path.slice(qsIndex + 1);
      req.path = path.slice(0, qsIndex);
      req.url = path;
      qs.split('&').forEach(p => {
        const [k, v] = p.split('=');
        req.query[k] = decodeURIComponent(v || '');
      });
    } else {
      req.path = path;
    }
    const res = {
      headers: {},
      _body: null,
      statusCode: 200,
      setHeader(k, v) { this.headers[k] = v; },
      getHeader(k) { return this.headers[k]; },
      status(n) { this.statusCode = n; return this; },
      json(obj) { this._body = obj; resolve(obj); },
      send(s) { this._body = s; resolve(s); },
      end(s) { if (s) this._body = s; resolve(this._body); },
    };
    app(req, res);
  });
}

(async () => {
  console.log('=== ROUNDING (5 easy) ===');
  for (let i = 0; i < 5; i++) {
    const q = await call('GET', '/rounding-api/question?difficulty=easy');
    console.log(JSON.stringify(q));
  }
  console.log('=== PYTHAG q=0 (3) and q=10 (2) ===');
  for (let i = 0; i < 3; i++) console.log(await call('GET', '/pythag-api/question?difficulty=easy&q=0').then(JSON.stringify));
  for (let i = 0; i < 2; i++) console.log(await call('GET', '/pythag-api/question?difficulty=easy&q=10').then(JSON.stringify));

  console.log('=== PERCENT (T1, type 1, first) ===');
  console.log(JSON.stringify(await call('GET', '/percent-api/question?tier=1&type=1&first=1')));
  console.log('=== PERCENT (T2, type 4) ===');
  console.log(JSON.stringify(await call('GET', '/percent-api/question?tier=2&type=4')));
  console.log('=== PERCENT (T4, type 5) ===');
  console.log(JSON.stringify(await call('GET', '/percent-api/question?tier=4&type=5')));
  console.log('=== PERCENT check 25 of 80 ===');
  // Build expected manually: 25% of 80 = 20
  console.log(JSON.stringify(await call('POST', '/percent-api/check', { tier: 1, type: 1, answer: 20, userAnswer: '20' })));

  console.log('=== PERMCOMB (P L1) ===');
  console.log(JSON.stringify(await call('GET', '/permcomb-api/question?section=P&level=1')));
  console.log('=== PERMCOMB (C L2) ===');
  console.log(JSON.stringify(await call('GET', '/permcomb-api/question?section=C&level=2')));
  console.log('=== PERMCOMB (mixed L3) ===');
  console.log(JSON.stringify(await call('GET', '/permcomb-api/question?section=mixed&level=3')));

  console.log('=== POLYFACTOR (T1 L1) ===');
  console.log(JSON.stringify(await call('GET', '/polyfactor-api/question?tier=1&level=1')));
  console.log('=== POLYFACTOR (T3 L3) ===');
  console.log(JSON.stringify(await call('GET', '/polyfactor-api/question?tier=3&level=3')));

  console.log('=== PROB (L1 balls type1) ===');
  console.log(JSON.stringify(await call('GET', '/prob-api/question?level=1&context=balls&probType=1')));
  console.log('=== PROB (L3 cards type4) ===');
  console.log(JSON.stringify(await call('GET', '/prob-api/question?level=3&context=cards&probType=4')));
  console.log('=== PROB CHECK unsimplified 6/10 vs 3/5 ===');
  console.log(JSON.stringify(await call('POST', '/prob-api/check', { ansNum: 3, ansDen: 5, userAnswer: '6/10' })));
  console.log('=== PROB CHECK simplified ===');
  console.log(JSON.stringify(await call('POST', '/prob-api/check', { ansNum: 3, ansDen: 5, userAnswer: '3/5' })));
  console.log('=== PROB CHECK wrong ===');
  console.log(JSON.stringify(await call('POST', '/prob-api/check', { ansNum: 3, ansDen: 5, userAnswer: '2/5' })));
})();
