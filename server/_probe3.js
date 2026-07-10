const Module = require('module');
const origRequire = Module.prototype.require;
let savedApp = null;
Module.prototype.require = function (id) {
  if (id === 'express') {
    const express = origRequire.call(this, 'express');
    const wrap = function (...args) { const app = express(...args); app.listen = () => { savedApp = app; return { close(){} }; }; return app; };
    Object.assign(wrap, express); return wrap;
  }
  return origRequire.call(this, id);
};
require('./index.js');
const app = savedApp;
function call(method, path, body) {
  return new Promise((resolve) => {
    const req = { method, url: path, headers: {'content-type':'application/json'}, query: {}, body: body || {} };
    const qsIndex = path.indexOf('?');
    if (qsIndex >= 0) { req.path = path.slice(0, qsIndex); path.slice(qsIndex+1).split('&').forEach(p => { const [k,v] = p.split('='); req.query[k] = decodeURIComponent(v||''); }); } else req.path = path;
    const res = { headers:{}, statusCode:200, setHeader(){}, status(n){this.statusCode=n;return this;}, json(o){resolve(o);}, send(o){resolve(o);}, end(){resolve();} };
    app(req, res);
  });
}
(async () => {
  // Force pct=10 case by trying many times (Tier 1 has [10, 25, 50, 100])
  let foundTen = 0, foundOther = 0;
  for (let i = 0; i < 50 && (foundTen < 1 || foundOther < 1); i++) {
    const q = await call('GET', '/percent-api/question?tier=1&type=1&first=1');
    if (q.pct === 10 && foundTen < 1) { console.log('pct=10 scaffold:', JSON.stringify(q.scaffold)); foundTen++; }
    if (q.pct !== 10 && foundOther < 1) { console.log(`pct=${q.pct} scaffold:`, JSON.stringify(q.scaffold)); foundOther++; }
  }
})();
