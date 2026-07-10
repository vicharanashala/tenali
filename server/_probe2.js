const Module = require('module');
const origRequire = Module.prototype.require;
let savedApp = null;
Module.prototype.require = function (id) {
  if (id === 'express') {
    const express = origRequire.call(this, 'express');
    const wrap = function (...args) {
      const app = express(...args);
      app.listen = () => { savedApp = app; return { close() {} }; };
      return app;
    };
    Object.assign(wrap, express);
    return wrap;
  }
  return origRequire.call(this, id);
};
require('./index.js');
const app = savedApp;
function call(method, path, body) {
  return new Promise((resolve) => {
    const req = { method, url: path, headers: { 'content-type': 'application/json' }, query: {}, body: body || {} };
    const qsIndex = path.indexOf('?');
    if (qsIndex >= 0) {
      req.path = path.slice(0, qsIndex);
      path.slice(qsIndex + 1).split('&').forEach(p => { const [k, v] = p.split('='); req.query[k] = decodeURIComponent(v || ''); });
    } else { req.path = path; }
    const res = { headers: {}, statusCode: 200, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.statusCode = n; return this; }, json(o) { resolve(o); }, send(o) { resolve(o); }, end() { resolve(); } };
    app(req, res);
  });
}

(async () => {
  // Probe rounding answers many times and compute what answer the buggy
  // version would have produced. Show any discrepancies with the headline 6.835 case.
  const buggy = (v, dp) => parseFloat(parseFloat(v).toFixed(dp));
  let mismatchCount = 0, total = 0;
  for (let i = 0; i < 200; i++) {
    const q = await call('GET', '/rounding-api/question?difficulty=easy');
    const numStr = q.prompt.match(/Round ([\d.]+)/)[1];
    const dp = q.prompt.includes('1 decimal') ? 1 : 2;
    const buggyAns = buggy(numStr, dp);
    if (Math.abs(buggyAns - q.answer) >= 0.0005) {
      mismatchCount++;
      if (mismatchCount <= 5) console.log(`differ: ${numStr} dp=${dp}  fixed=${q.answer}  buggy=${buggyAns}`);
    }
    total++;
  }
  console.log(`Rounding: ${mismatchCount}/${total} cases where the new answer differs from the buggy toFixed-based answer`);

  // Headline test: directly fabricate a "Round 6.835 to 2 decimal places" call
  // by exercising the helper through the percent endpoint isn't possible — instead
  // import index.js's exported globals via re-eval of the helper.
  const fs = require('fs');
  const src = fs.readFileSync('./index.js', 'utf8');
  const helperMatch = src.match(/function roundHalfUp[\s\S]*?\n\}/);
  eval(helperMatch[0]);
  const cases = [
    [6.835, 2, 6.84], [0.045, 2, 0.05], [9.95, 1, 10],
    [-6.835, 2, -6.84], [2.5, 0, 3], [12350, -2, 12400],
  ];
  let pass = 0, fail = 0;
  for (const [v, dp, exp] of cases) {
    const got = roundHalfUp(v, dp);
    const ok = Math.abs(got - exp) < 1e-9;
    if (ok) pass++; else { fail++; console.log(`FAIL ${v} dp=${dp} got=${got} exp=${exp}`); }
  }
  console.log(`Helper headline cases: ${pass} pass / ${fail} fail`);
})();
