'use strict';
const path = require('path');
const fs = require('fs');
const router = require('express').Router();

const riddles = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'riddles', 'riddles.json'), 'utf8'));

function generateRiddleSolution(r) {
  const steps = [];
  if (r.type === 'find-rule' && r.equations && r.equations.length >= 2) {
    const eqs = r.equations;
    const xs = eqs.map(e => e.input);
    const ys = eqs.map(e => e.output);
    const target = Number(r.answer);
    const predict = (fn, label, expr) => {
      const ok = eqs.every((e, i) => fn(e.input) === e.output);
      if (!ok) return false;
      const ans = fn(r.question);
      if (ans !== target) return false;
      steps.push(`Check every row with ${label}:`);
      eqs.forEach((e, i) => steps.push(`  ${e.input} → ${fn(e.input)} (given ${e.output}) ✔`));
      steps.push(`Apply ${expr} to the question ${r.question}: ${ans}.`);
      steps.push(`Answer: ${r.answer}`);
      return true;
    };
    // 1) Linear y = m*x + c
    if (xs.length >= 2 && (xs[1] - xs[0]) !== 0) {
      const m = (ys[1] - ys[0]) / (xs[1] - xs[0]);
      const c = ys[0] - m * xs[0];
      if (Number.isInteger(m) && Number.isInteger(c)) {
        if (predict(x => m * x + c, `output = ${m}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`, `${m}×${r.question} ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`)) {
          steps.unshift(`Compare the first two rows: ${xs[0]} → ${ys[0]} and ${xs[1]} → ${ys[1]}.`);
          steps.splice(1, 0, `Output changes by ${ys[1] - ys[0] >= 0 ? '+' : ''}${ys[1] - ys[0]} for a change of ${xs[1] - xs[0] >= 0 ? '+' : ''}${xs[1] - xs[0]} in input → slope ${m}.`);
          return steps;
        }
      }
    }
    // 2) Simple cube y = x^3
    if (xs.every((x, i) => x * x * x === ys[i])) {
      if (predict(x => x * x * x, `output = input³`, `${r.question}³`)) return steps;
    }
    // 3) Multiplicative y = k * x
    if (xs.every(x => x !== 0) && Number.isInteger(ys[0] / xs[0]) && ys.every((y, i) => y / xs[i] === ys[0] / xs[0])) {
      const k = ys[0] / xs[0];
      if (predict(x => k * x, `output = ${k} × input`, `${k} × ${r.question}`)) return steps;
    }
    // 4) Product-style y = x*(x + d)
    const tryProduct = (d) => predict(x => x * (x + d), `output = input × (input ${d >= 0 ? '+' : '-'} ${Math.abs(d)})`, `${r.question} × (${r.question} ${d >= 0 ? '+' : '-'} ${Math.abs(d)})`);
    if (tryProduct(ys[0] / xs[0] - xs[0]) || tryProduct(1) || tryProduct(-1) || tryProduct(2) || tryProduct(-2)) return steps;
    // 5) Quadratic y = a*x^2 + b*x + c (needs 3 points), via Lagrange interpolation
    if (xs.length >= 3) {
      const [x0, x1, x2] = xs; const [y0, y1, y2] = ys;
      const L = (x, xa, xb, xc) => (x - xb) * (x - xc) / ((xa - xb) * (xa - xc));
      const f = (x) => y0 * L(x, x0, x1, x2) + y1 * L(x, x1, x0, x2) + y2 * L(x, x2, x0, x1);
      const a = (f(2) - 2 * f(1) + f(0)) / 2;
      const b = f(1) - f(0) - a;
      const c = f(0);
      if (Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(c) && a !== 0) {
        let label = `output = ${a}x²`;
        if (b !== 0) label += ` ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x`;
        if (c !== 0) label += ` ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`;
        let expr = `${a}×${r.question}²`;
        if (b !== 0) expr += ` ${b >= 0 ? '+' : '-'} ${Math.abs(b)}×${r.question}`;
        if (c !== 0) expr += ` ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`;
        if (predict(x => a * x * x + b * x + c, label, expr)) return steps;
      }
    }
    // Fallback
    steps.push(`Compare each input with its output:`);
    eqs.forEach(e => steps.push(`  ${e.input} → ${e.output}`));
    steps.push(`Find the relationship linking every input to its output.`);
    if (r.hint) steps.push(`Hint: ${r.hint}`);
    steps.push(`Answer: ${r.answer}`);
  } else if (r.type === 'sequence' && r.sequence && r.sequence.length >= 3) {
    const s = r.sequence;
    const diffs = s.slice(1).map((v, i) => v - s[i]);
    const ratios = s.slice(1).map((v, i) => v / s[i]);
    steps.push(`Sequence: ${s.join(', ')}, ?`);
    const allSameDiff = diffs.every(d => d === diffs[0]);
    const allSameRatio = ratios.every(q => Math.abs(q - ratios[0]) < 1e-9);
    if (allSameDiff) {
      steps.push(`Differences between terms: ${diffs.join(', ')} — constant.`);
      steps.push(`This is an arithmetic sequence; each term adds ${diffs[0]}.`);
      steps.push(`Next term = ${s[s.length - 1]} + ${diffs[0]} = ${r.answer}.`);
    } else if (allSameRatio && Number.isInteger(ratios[0])) {
      steps.push(`Ratios between terms: ${ratios.join(', ')} — constant.`);
      steps.push(`This is a geometric sequence; each term is multiplied by ${ratios[0]}.`);
      steps.push(`Next term = ${s[s.length - 1]} × ${ratios[0]} = ${r.answer}.`);
    } else {
      //二阶差分检查
      const secondDiffs = diffs.slice(1).map((v, i) => v - diffs[i]);
      if (secondDiffs.length > 0 && secondDiffs.every(d => d === secondDiffs[0])) {
        steps.push(`First differences: ${diffs.join(', ')} (not constant).`);
        steps.push(`Second differences: ${secondDiffs.join(', ')} — constant. This is a quadratic sequence.`);
        steps.push(`Next first difference = ${diffs[diffs.length - 1]} + ${secondDiffs[0]} = ${diffs[diffs.length - 1] + secondDiffs[0]}.`);
        steps.push(`Next term = ${s[s.length - 1]} + ${diffs[diffs.length - 1] + secondDiffs[0]} = ${r.answer}.`);
      } else {
        steps.push(`Look for the pattern linking the terms: ${s.join(', ')}.`);
        if (r.hint) steps.push(`Hint: ${r.hint}`);
        steps.push(`Answer: ${r.answer}`);
      }
    }
  } else if (r.type === 'logic') {
    steps.push(`Read carefully: ${r.question}`);
    if (r.hint) steps.push(`Reasoning: ${r.hint}`);
    steps.push(`Answer: ${r.answer}`);
  } else if (r.type === 'image-numpad' || r.type === 'image-option') {
    steps.push(`Look at the image for "${r.title}".`);
    if (r.hint) steps.push(`Reasoning: ${r.hint}`);
    steps.push(`Answer: ${r.answer}`);
  } else {
    if (r.hint) steps.push(`Hint: ${r.hint}`);
    steps.push(`Answer: ${r.answer}`);
  }
  return steps;
}

router.get('/question', (req, res) => {
  const difficulty = parseInt(req.query.difficulty) || 1;
  const type = req.query.type;
  let pool;
  if (type) {
    pool = riddles.filter(r => r.type === type || (type === 'image' && r.type.startsWith('image')));
  } else {
    pool = riddles.filter(r => r.difficulty <= Math.min(difficulty + 1, 5));
  }
  if (pool.length === 0) pool = riddles;
  // Exclude recently-used riddles to avoid immediate repeats
  let used = [];
  if (req.query.used) {
    try { used = JSON.parse(req.query.used); } catch (e) { used = String(req.query.used).split(',').map(Number); }
  }
  if (used.length && pool.length > used.length) {
    const remaining = pool.filter(r => !used.includes(r.id));
    if (remaining.length > 0) pool = remaining;
  }
  const q = pool[Math.floor(Math.random() * pool.length)];
  res.json(q);
});

router.post('/check', require('express').json(), (req, res) => {
  const { id, answer } = req.body;
  const riddle = riddles.find(r => r.id === id);
  if (!riddle) return res.status(400).json({ error: 'Riddle not found' });
  const correct = String(answer).trim() === String(riddle.answer).trim();
  res.json({ correct, correctAnswer: riddle.answer, hint: riddle.hint });
});

router.get('/count', (req, res) => {
  const type = req.query.type;
  let pool = riddles;
  if (type) pool = riddles.filter(r => r.type === type || (type === 'image' && r.type.startsWith('image')));
  res.json({ count: pool.length });
});

router.post('/solution', require('express').json(), (req, res) => {
  const { id } = req.body;
  const riddle = riddles.find(r => r.id === id);
  if (!riddle) return res.status(400).json({ error: 'Riddle not found' });
  res.json({ steps: generateRiddleSolution(riddle), answer: riddle.answer });
});

module.exports = router;
