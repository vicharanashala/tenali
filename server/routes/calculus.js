'use strict';
const router = require('express').Router();

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
const randInt = randomInt;
function rand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
function simplifyFraction(num, den) {
  if (den < 0) { num = -num; den = -den; }
  const g = gcd(Math.abs(num), den);
  return { num: num / g, den: den / g };
}
function sup(n) {
  const map = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const s = String(Math.abs(n));
  const digits = s.split('').map(d => map[Number(d)]).join('');
  if (n < 0) return '⁻' + digits;
  return digits;
}

const generators = {

  log: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = Date.now();
      if (diff === 'easy') {
        const combos = [
          { b: 2, n: 4, ans: 2 }, { b: 2, n: 8, ans: 3 }, { b: 2, n: 16, ans: 4 }, { b: 2, n: 32, ans: 5 },
          { b: 2, n: 64, ans: 6 }, { b: 3, n: 9, ans: 2 }, { b: 3, n: 27, ans: 3 }, { b: 3, n: 81, ans: 4 },
          { b: 5, n: 25, ans: 2 }, { b: 5, n: 125, ans: 3 }, { b: 10, n: 100, ans: 2 }, { b: 10, n: 1000, ans: 3 },
          { b: 4, n: 16, ans: 2 }, { b: 4, n: 64, ans: 3 }, { b: 7, n: 49, ans: 2 }, { b: 6, n: 36, ans: 2 },
          { b: 2, n: 1, ans: 0 }, { b: 3, n: 1, ans: 0 }, { b: 10, n: 1, ans: 0 },
          { b: 10, n: 10, ans: 1 }, { b: 2, n: 2, ans: 1 },
        ];
        const c = pick(combos);
        const sub = (x) => String(x).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join('');
        const prompt = `Evaluate log${c.b === 10 ? '' : sub(c.b)}(${c.n})`;
        return { id, difficulty: diff, type: 'evaluate', prompt, answer: c.ans, display: String(c.ans) };
      } else if (diff === 'medium') {
        const base = pick([2, 3, 10]);
        const sub = (n) => String(n).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join('');
        const bStr = base === 10 ? '' : sub(base);
        const subtype = pick(['add', 'subtract', 'power']);
        if (subtype === 'add') {
          const a = rand(2, 20); const b = rand(2, 20);
          const product = a * b;
          return { id, difficulty: diff, type: 'simplify_log', prompt: `Simplify: log${bStr}(${a}) + log${bStr}(${b})`, ansProduct: product, base, display: `log${bStr}(${product})` };
        } else if (subtype === 'subtract') {
          const b = rand(2, 8); const a = b * rand(2, 8);
          const quotient = a / b;
          return { id, difficulty: diff, type: 'simplify_log', prompt: `Simplify: log${bStr}(${a}) − log${bStr}(${b})`, ansProduct: quotient, base, display: `log${bStr}(${quotient})` };
        } else {
          const n = rand(2, 10); const k = rand(2, 4);
          const power = Math.pow(n, k);
          return { id, difficulty: diff, type: 'simplify_log', prompt: `Simplify: ${k} × log${bStr}(${n})`, ansProduct: power, base, display: `log${bStr}(${power})` };
        }
      } else if (diff === 'hard') {
        const combos = [
          { b: 2, n: 4, x: 2 }, { b: 2, n: 8, x: 3 }, { b: 2, n: 16, x: 4 },
          { b: 3, n: 9, x: 2 }, { b: 3, n: 27, x: 3 }, { b: 5, n: 25, x: 2 },
          { b: 5, n: 125, x: 3 }, { b: 4, n: 64, x: 3 }, { b: 10, n: 100, x: 2 },
          { b: 2, n: 32, x: 5 }, { b: 3, n: 81, x: 4 },
        ];
        const c = pick(combos);
        return { id, difficulty: diff, type: 'solve_exp', prompt: `Solve: ${c.b}ˣ = ${c.n}`, answer: c.x, display: `x = ${c.x}` };
      } else {
        const base = pick([2, 10]);
        const sub = (n) => String(n).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join('');
        const bStr = base === 10 ? '' : sub(base);
        const exp = rand(1, 4);
        const a = rand(-10, 10);
        const val = Math.pow(base, exp);
        const x = val - a;
        return { id, difficulty: diff, type: 'solve_log', prompt: `Solve: log${bStr}(x ${a >= 0 ? '+ ' + a : '− ' + Math.abs(a)}) = ${exp}`, answer: x, display: `x = ${x}` };
      }
    },
    check(body) {
      const { type } = body;
      const userStr = (body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-').replace(/^x=/i, '');
      let correct = false;
      if (type === 'simplify_log') {
        const cleaned = userStr.replace(/log[₀₁₂₃₄₅₆₇₈₉]*/g, '').replace(/[()]/g, '');
        correct = !isNaN(parseInt(cleaned)) && parseInt(cleaned) === body.ansProduct;
      } else {
        const userNum = parseFloat(userStr);
        correct = !isNaN(userNum) && Math.abs(userNum - body.answer) < 0.01;
      }
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  diff: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = Date.now();
      if (diff === 'easy') {
        const a = rand(1, 6); const n = rand(2, 5);
        const x = rand(1, 5);
        const deriv = a * n * Math.pow(x, n - 1);
        return { id, difficulty: diff, type: 'power_rule', prompt: `f(x) = ${a}x${sup(n)}. Find f'(${x}).`, answer: deriv, display: String(deriv) };
      } else if (diff === 'medium') {
        let a = rand(-5, 5); const b = rand(-8, 8); const c = rand(-10, 10);
        if (a === 0) a = 2;
        const x = rand(-3, 3);
        const deriv = 2 * a * x + b;
        const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
        const cStr = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
        return { id, difficulty: diff, type: 'polynomial', prompt: `f(x) = ${a}x² ${bStr}x ${cStr}. Find f'(${x}).`, answer: deriv, display: String(deriv) };
      } else if (diff === 'hard') {
        const a = rand(1, 4); const b = rand(-10, 10); const c = rand(-10, 10);
        const g = gcd(Math.abs(b), 2 * a);
        const ansNum = -b / g;
        const ansDen = (2 * a) / g;
        const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
        const cStr = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
        const display = ansDen === 1 ? String(ansNum) : `${ansNum}/${ansDen}`;
        return { id, difficulty: diff, type: 'turning_point', prompt: `f(x) = ${a}x² ${bStr}x ${cStr}. Find x where f'(x) = 0.`, ansNum, ansDen, display };
      } else {
        const a = pick([1, -1, 2, -2, 3]);
        const b = rand(-8, 8); const c = rand(-10, 10);
        const xTurn = -b / (2 * a);
        const yTurn = a * xTurn * xTurn + b * xTurn + c;
        const rounded = Math.round(yTurn * 100) / 100;
        const nature = a > 0 ? 'minimum' : 'maximum';
        const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
        const cStr = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
        return { id, difficulty: diff, type: 'min_max', prompt: `f(x) = ${a}x² ${bStr}x ${cStr}. Find the ${nature} value of f(x).`, answer: rounded, display: String(rounded) };
      }
    },
    check(body) {
      const { type } = body;
      const userStr = (body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-').replace(/^x=/i, '');
      let correct = false;
      if (type === 'turning_point') {
        const { ansNum, ansDen } = body;
        const fracMatch = userStr.match(/^(-?\d+)\/(-?\d+)$/);
        let uNum, uDen;
        if (fracMatch) { uNum = parseInt(fracMatch[1]); uDen = parseInt(fracMatch[2]); }
        else { const n = parseFloat(userStr); if (!isNaN(n) && Number.isInteger(n)) { uNum = n; uDen = 1; } else if (!isNaN(n)) { correct = Math.abs(n - ansNum / ansDen) < 0.01; } }
        if (!correct && uNum !== undefined && uDen !== undefined && uDen !== 0) {
          const us = simplifyFraction(uNum, uDen);
          const es = simplifyFraction(ansNum, ansDen);
          correct = us.num === es.num && us.den === es.den;
        }
      } else {
        const userNum = parseFloat(userStr);
        correct = !isNaN(userNum) && Math.abs(userNum - body.answer) < 0.5;
      }
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  integ: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const a = randInt(1, 8); const n = randInt(1, 4);
        const newCoeffDen = n + 1;
        const g = gcd(Math.abs(a), newCoeffDen);
        const cNum = a / g; const cDen = newCoeffDen / g;
        const newPow = n + 1;
        answer = cDen === 1 ? cNum : cNum + '/' + cDen;
        display = `${answer}x^${newPow} + C`;
        prompt = `Integrate ${a === 1 ? '' : a}x${n === 1 ? '' : '^' + n} dx.\nGive the coefficient of x^${newPow} (as a fraction if needed).`;
      } else if (diff === 'medium') {
        const a = randInt(1, 4); const b = randInt(-5, 5); const c = randInt(0, 6); const k = randInt(1, 4);
        const num = 2 * a * k * k * k + 3 * b * k * k + 6 * c * k;
        const den = 6;
        const g = gcd(Math.abs(num), den);
        const rn = num / g; const rd = den / g;
        answer = rd === 1 ? rn : rn + '/' + rd;
        display = String(answer);
        const bStr = b >= 0 ? ` + ${b}x` : ` − ${Math.abs(b)}x`;
        const cStr = c > 0 ? ` + ${c}` : '';
        prompt = `Evaluate ∫₀^${k} (${a}x² ${bStr}${cStr}) dx.`;
      } else if (diff === 'hard') {
        const a = randInt(1, 3); const b = randInt(-3, 3); const n = randInt(2, 4);
        const hi = randInt(1, 3);
        const evalAt = (x) => Math.pow(a * x + b, n + 1) / (a * (n + 1));
        const val = evalAt(hi) - evalAt(0);
        if (Number.isInteger(val)) {
          answer = val;
        } else {
          const top = Math.pow(a * hi + b, n + 1) - Math.pow(b, n + 1);
          const bot = a * (n + 1);
          const g2 = gcd(Math.abs(top), Math.abs(bot));
          const rn2 = top / g2; const rd2 = bot / g2;
          answer = rd2 === 1 ? rn2 : (rd2 < 0 ? -rn2 + '/' + -rd2 : rn2 + '/' + rd2);
        }
        display = String(answer);
        const bStr = b >= 0 ? `+${b}` : `${b}`;
        prompt = `Evaluate ∫₀^${hi} (${a}x${bStr})^${n} dx.`;
      } else {
        const k = randInt(2, 6);
        const num = k * k * k; const den = 6;
        const g = gcd(num, den);
        answer = (den / g) === 1 ? num / g : (num / g) + '/' + (den / g);
        display = String(answer);
        prompt = `Find the area enclosed between y = x² − ${k}x and the x-axis.`;
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = (body.userAnswer || '').trim().replace(/\s/g, '');
      const ans = String(body.answer).replace(/\s/g, '');
      let correct = ua === ans;
      if (!correct) {
        const evalFrac = (s) => { const p = String(s).split('/'); return p.length === 2 ? parseFloat(p[0]) / parseFloat(p[1]) : parseFloat(s); };
        const u = evalFrac(ua); const a2 = evalFrac(ans);
        if (!isNaN(u) && !isNaN(a2) && Math.abs(u - a2) < 0.001) correct = true;
      }
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  limits: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = `q-${Date.now()}-${Math.random()}`;
      if (diff === 'easy') {
        const a = randomInt(1, 5); const b = randomInt(2, 6); const c = randomInt(1, 10);
        const answer = b * a + c;
        return { id, difficulty: diff, prompt: `Find lim(x→${a}) [${b}x + ${c}]`, answer, display: String(answer) };
      } else if (diff === 'medium') {
        const a = randomInt(2, 6);
        const answer = 2 * a;
        return { id, difficulty: diff, prompt: `Find lim(x→${a}) [(x² − ${a * a})/(x − ${a})]`, answer, display: String(answer) };
      } else if (diff === 'hard') {
        const a = randomInt(1, 4); const b = randomInt(1, 4);
        const answer = a / b;
        return { id, difficulty: diff, prompt: `Find lim(x→0) [sin(${a}x)/${b}x]`, answer, display: answer.toFixed(3) };
      } else {
        const a = randomInt(1, 5); const d = randomInt(1, 5);
        const b = randomInt(1, 10); const e = randomInt(1, 10);
        const c = randomInt(1, 10); const f = randomInt(1, 10);
        const answer = a / d;
        return { id, difficulty: diff, prompt: `Find lim(x→∞) [(${a}x² + ${b}x + ${c})/(${d}x² + ${e}x + ${f})]`, answer, display: answer.toFixed(3) };
      }
    },
    check(body) {
      const userNum = parseFloat((body.userAnswer || '').trim());
      const correct = !isNaN(userNum) && Math.abs(userNum - body.answer) < 0.05;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  diffeq: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = `q-${Date.now()}-${Math.random()}`;
      if (diff === 'easy') {
        const orders = [
          { de: "dy/dx = 2x", order: 1 }, { de: "d²y/dx² + 3dy/dx = 0", order: 2 },
          { de: "d³y/dx³ − y = x", order: 3 }, { de: "(dy/dx)² + dy/dx = x", order: 1 }
        ];
        const chosen = pick(orders);
        return { id, difficulty: diff, prompt: `Find order: ${chosen.de}`, answer: chosen.order, display: String(chosen.order) };
      } else if (diff === 'medium') {
        const degrees = [
          { de: "(dy/dx)² + dy/dx = x", deg: 2 }, { de: "d²y/dx² + (dy/dx)³ = 0", deg: 3 },
          { de: "(d²y/dx²)² = 4(dy/dx)", deg: 2 }, { de: "dy/dx + y = x", deg: 1 }
        ];
        const chosen = pick(degrees);
        return { id, difficulty: diff, prompt: `Find degree: ${chosen.de}`, answer: chosen.deg, display: String(chosen.deg) };
      } else if (diff === 'hard') {
        const solutions = [
          { de: "dy/dx = 2x", sol: "y = x² + C", isValid: true },
          { de: "dy/dx + y = 0", sol: "y = e^(−x)", isValid: true },
          { de: "dy/dx = y", sol: "y = e^x", isValid: true },
          { de: "d²y/dx² + y = 0", sol: "y = sin(x)", isValid: true }
        ];
        const chosen = pick(solutions);
        const answerStr = chosen.isValid ? 'yes' : 'no';
        return { id, difficulty: diff, prompt: `Is y = ${chosen.sol.split('=')[1].trim()} a solution of ${chosen.de}? (yes/no)`, answer: answerStr, display: answerStr };
      } else {
        const a = randomInt(1, 4); const b = randomInt(1, 4);
        const answerStr = `y = ${a}x²/2 + ${b}x + C`;
        return { id, difficulty: diff, prompt: `Solve: dy/dx = ${a}x + ${b}`, answer: answerStr, display: answerStr };
      }
    },
    check(body) {
      const { answer } = body;
      let userStr = (body.userAnswer || '').trim().toLowerCase();
      const correct = (typeof answer === 'string')
        ? userStr === answer.toLowerCase() || userStr === answer.toLowerCase().replace(/\s+/g, '')
        : !isNaN(parseInt(userStr, 10)) && parseInt(userStr, 10) === answer;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

};

router.get('/question', (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.question(req.query.difficulty || 'easy'));
});

router.post('/check', require('express').json(), (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.check(req.body || {}));
});

module.exports = router;
