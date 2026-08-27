'use strict';
const router = require('express').Router();

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
const randInt = randomInt;
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function simplifyFraction(num, den) {
  if (den < 0) { num = -num; den = -den; }
  const g = gcd(Math.abs(num), den);
  return { num: num / g, den: den / g };
}

function seqRand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function seqPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function percentType1(pct, base) {
  const templates = [
    `A new smartphone costs $${base}. It is currently on sale for ${pct}% off. What is the discount amount?`,
    `Your dinner bill is $${base} and you want to leave a ${pct}% tip. How much is the tip?`,
    `In a town of ${base} people, ${pct}% of them voted in the last election. How many people voted?`,
    `What is ${pct}% of ${base}?`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

const PERCENT_TIERS = {
  1: { pcts: [10, 25, 50, 100],         lo: 10,   hi: 100,   label: 'Tier 1' },
  2: { pcts: [20, 30, 75],              lo: 100,  hi: 500,   label: 'Tier 2' },
  3: { pcts: [15, 35, 60, 80],          lo: 500,  hi: 2000,  label: 'Tier 3' },
  4: { pcts: [12.5, 17.5, 22.5, 37.5, 47.5, 62.5, 87.5], lo: 2000, hi: 10000, label: 'Tier 4' },
};

function percentPickBase(tier, cfg, pct) {
  if (tier >= 4) return Math.round(randInt(cfg.lo, cfg.hi) / 10) * 10;
  const candidates = [];
  const step = tier === 1 ? 10 : 50;
  for (let b = cfg.lo; b <= cfg.hi; b += step) {
    if ((Math.round(pct * b * 10) / 10) % 100 === 0) candidates.push(b);
  }
  if (candidates.length === 0) return Math.round((cfg.lo + cfg.hi) / 2);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function generatePercentQuestion(tier, type, cfg, isFirstOfType) {
  const pct = cfg.pcts[Math.floor(Math.random() * cfg.pcts.length)];
  const base = percentPickBase(tier, cfg, pct);
  const cid = (suffix) => `t${tier}-q${type}-p${pct}-b${base}${suffix ? '-' + suffix : ''}`;
  const round2 = (v) => Math.round(v * 100) / 100;
  let prompt, answer, idSuffix = '', scaffold = null, expectsPercent = false;

  switch (type) {
    case 1: {
      answer = round2((pct * base) / 100);
      prompt = percentType1(pct, base);
      if (isFirstOfType && tier === 1 && pct !== 100) {
        const rows = [{ label: '100%', value: base }];
        if (pct !== 10) rows.push({ label: '10%', value: round2(base / 10) });
        rows.push({ label: `${pct}%`, value: '?' });
        scaffold = { rows };
      }
      break;
    }
    case 2: {
      const result = round2((pct * base) / 100);
      answer = pct; expectsPercent = true;
      prompt = `${result} is what % of ${base}?`;
      break;
    }
    case 3: {
      const result = round2((pct * base) / 100);
      answer = base;
      prompt = `${pct}% of ? = ${result}. Find the missing number.`;
      break;
    }
    case 4: {
      const direction = Math.random() < 0.5 ? 'increase' : 'decrease';
      idSuffix = direction;
      const delta = round2((pct * base) / 100);
      const newVal = round2(direction === 'increase' ? base + delta : base - delta);
      answer = pct; expectsPercent = true;
      prompt = direction === 'increase'
        ? `A value rises from ${base} to ${newVal}. What is the percentage increase?`
        : `A value falls from ${base} to ${newVal}. What is the percentage decrease?`;
      break;
    }
    case 5: {
      const discount = pct;
      const taxRates = tier <= 2 ? [5, 10] : [12, 18];
      const taxRate = taxRates[Math.floor(Math.random() * taxRates.length)];
      idSuffix = `tax${taxRate}`;
      const afterDiscount = base * (1 - discount / 100);
      const finalPrice = round2(afterDiscount * (1 + taxRate / 100));
      answer = finalPrice;
      prompt = `A ₹${base} item has a ${discount}% discount applied first, then ${taxRate}% tax. What is the final price?`;
      break;
    }
    default:
      return generatePercentQuestion(tier, 1, cfg, isFirstOfType);
  }
  return { id: cid(idSuffix), tier, type, pct, base, prompt, answer, scaffold, expectsPercent, meta: { pct, base } };
}

const generators = {

  ratio: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const id = Date.now();

      if (difficulty === 'easy') {
        // Simplify a:b
        const g = seqRand(2, 8);
        const a = seqRand(1, 10) * g;
        const b = seqRand(1, 10) * g;
        // Ensure they're not already simplified
        const gc = gcd(a, b);
        const prompt = `Simplify the ratio ${a} : ${b}`;
        return { id, difficulty, type: 'simplify', a, b, ansA: a / gc, ansB: b / gc, prompt, answer: `${a / gc}:${b / gc}` };
      }
      else if (difficulty === 'medium') {
        // Divide amount in ratio a:b (two parts) or a:b:c (three parts)
        const parts = seqPick([2, 2, 2, 3]); // mostly 2-part
        if (parts === 2) {
          const ra = seqRand(1, 7);
          const rb = seqRand(1, 7);
          const total = (ra + rb) * seqRand(2, 15);
          const prompt = `Divide ${total} in the ratio ${ra} : ${rb}`;
          const unit = total / (ra + rb);
          return { id, difficulty, type: 'divide2', ra, rb, total, ans1: ra * unit, ans2: rb * unit, prompt, answer: `${ra * unit}, ${rb * unit}` };
        } else {
          const ra = seqRand(1, 5);
          const rb = seqRand(1, 5);
          const rc = seqRand(1, 5);
          const total = (ra + rb + rc) * seqRand(2, 10);
          const prompt = `Divide ${total} in the ratio ${ra} : ${rb} : ${rc}`;
          const unit = total / (ra + rb + rc);
          return { id, difficulty, type: 'divide3', ra, rb, rc, total, ans1: ra * unit, ans2: rb * unit, ans3: rc * unit, prompt, answer: `${ra * unit}, ${rb * unit}, ${rc * unit}` };
        }
      }
      else if (difficulty === 'hard') {
        // Direct proportion: if a costs/weighs x, find cost/weight for b
        const unitVal = seqRand(2, 15);
        const qtyA = seqRand(2, 10);
        const valA = unitVal * qtyA;
        const qtyB = seqRand(2, 15);
        const valB = unitVal * qtyB;
        const contexts = [
          { q: `If ${qtyA} items cost $${valA}, how much do ${qtyB} items cost?`, unit: '$' },
          { q: `If ${qtyA} kg weighs ${valA} lbs, how much do ${qtyB} kg weigh?`, unit: ' lbs' },
          { q: `A car uses ${valA} litres for ${qtyA} km. How many litres for ${qtyB} km?`, unit: ' litres' },
        ];
        const ctx = seqPick(contexts);
        return { id, difficulty, type: 'direct', qtyA, valA, qtyB, answer: valB, prompt: ctx.q };
      }
      else {
        // Inverse proportion: if a workers take x days, how long for b workers?
        const workersA = seqRand(2, 10);
        const daysA = seqRand(2, 15);
        const totalWork = workersA * daysA;
        // Pick workersB that divides totalWork evenly
        const divisors = [];
        for (let i = 2; i <= 20; i++) { if (totalWork % i === 0 && i !== workersA) divisors.push(i); }
        if (divisors.length === 0) divisors.push(workersA + 1);
        const workersB = seqPick(divisors);
        const daysB = totalWork / workersB;
        const prompt = `${workersA} workers take ${daysA} days to finish a job. How many days for ${workersB} workers?`;
        // ansNum/ansDen to handle non-integer results
        const g2 = gcd(totalWork, workersB);
        return { id, difficulty, type: 'inverse', workersA, daysA, workersB, ansNum: totalWork / g2, ansDen: workersB / g2, prompt, answer: (workersB / g2 === 1) ? String(totalWork / g2) : `${totalWork / g2}/${workersB / g2}` };
      }
    },
    check(body) {
      const { type } = body;
      const userStr = (body.answer || '').replace(/\s+/g, '').replace(/−/g, '-');
      let correct = false;
      let display = '';

      if (type === 'simplify') {
        // Expect "a:b"
        const { ansA, ansB } = body;
        const m = userStr.match(/^(\d+):(\d+)$/);
        if (m) {
          correct = parseInt(m[1]) === ansA && parseInt(m[2]) === ansB;
        }
        display = `${ansA}:${ansB}`;
      }
      else if (type === 'divide2') {
        // Expect "a, b" or "a and b"
        const { ans1, ans2 } = body;
        const m = userStr.match(/^(-?\d+)[,\s&]+(-?\d+)$/);
        if (m) { correct = parseInt(m[1]) === ans1 && parseInt(m[2]) === ans2; }
        // Also accept just the larger part
        display = `${ans1}, ${ans2}`;
      }
      else if (type === 'divide3') {
        const { ans1, ans2, ans3 } = body;
        const m = userStr.match(/^(-?\d+)[,\s&]+(-?\d+)[,\s&]+(-?\d+)$/);
        if (m) { correct = parseInt(m[1]) === ans1 && parseInt(m[2]) === ans2 && parseInt(m[3]) === ans3; }
        display = `${ans1}, ${ans2}, ${ans3}`;
      }
      else if (type === 'direct') {
        const expected = body.answer;
        const userNum = parseFloat(userStr);
        correct = !isNaN(userNum) && Math.abs(userNum - expected) < 0.01;
        display = String(expected);
      }
      else if (type === 'inverse') {
        const { ansNum, ansDen } = body;
        const s = simplifyFraction(ansNum, ansDen);
        // Parse fraction or integer
        let uNum, uDen;
        const fracMatch = userStr.match(/^(-?\d+)\/(-?\d+)$/);
        if (fracMatch) { uNum = parseInt(fracMatch[1]); uDen = parseInt(fracMatch[2]); }
        else { const n = parseFloat(userStr); if (!isNaN(n) && Number.isInteger(n)) { uNum = n; uDen = 1; } }
        if (uNum !== undefined && uDen !== undefined && uDen !== 0) {
          const us = simplifyFraction(uNum, uDen);
          correct = us.num === s.num && us.den === s.den;
        }
        display = s.den === 1 ? `${s.num}` : `${s.num}/${s.den}`;
      }

      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  percent: {
    question(difficulty, opts = {}) {
      let tier = parseInt(opts.tier, 10);
      if (!tier || isNaN(tier)) {
        const map = { easy: 1, medium: 2, hard: 3, extrahard: 4 };
        tier = map[difficulty] || 1;
      }
      tier = Math.max(1, Math.min(4, tier));
      const type = Math.max(1, Math.min(5, parseInt(opts.type, 10) || 1));
      const isFirstOfType = opts.first === '1';
      const seen = String(opts.seen || '').split(',').filter(Boolean);
      const cfg = PERCENT_TIERS[tier];
      let q;
      for (let attempt = 0; attempt < 50; attempt++) {
        q = generatePercentQuestion(tier, type, cfg, isFirstOfType);
        if (!seen.includes(q.id)) break;
      }
      return q;
    },
    check(body) {
      const { type, tier, answer: expected, expectsPercent } = body;
      const userStr = String(body.userAnswer || '').replace(/\s+/g, '').replace(/[%₹$,]/g, '').replace(/−/g, '-');
      const userNum = parseFloat(userStr);
      let correct = false;
      if (!isNaN(userNum) && expected !== undefined && expected !== null) {
        const tol = (tier === 4 || type === 5) ? Math.max(0.01, Math.abs(expected) * 0.005) : 0.01;
        correct = Math.abs(userNum - expected) <= tol;
      }
      const display = Number.isInteger(expected) ? String(expected) : (expected != null ? Number(expected).toFixed(2) : '');
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect', expectsPercent: !!expectsPercent };
    },
  },

  profitloss: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const cp = randInt(20, 200) * 5; const profit = randInt(10, 50) * 5; const sp = cp + profit;
        answer = profit; display = '$' + answer;
        prompt = `An item is bought for $${cp} and sold for $${sp}. Find the profit.`;
      } else if (diff === 'medium') {
        const cp = randInt(10, 100) * 10; const profitPct = randInt(5, 40);
        const sp = cp + cp * profitPct / 100;
        answer = profitPct; display = answer + '%';
        prompt = `Cost price = $${cp}, selling price = $${sp}. Find the profit percentage.`;
      } else if (diff === 'hard') {
        const mp = randInt(20, 100) * 10; const discPct = [10, 15, 20, 25, 30][randInt(0, 4)];
        const sp = mp * (100 - discPct) / 100;
        answer = sp; display = '$' + answer;
        prompt = `A shirt has a marked price of $${mp}. A ${discPct}% discount is applied. Find the selling price.`;
      } else {
        const mp = randInt(20, 100) * 10; const d1 = [10, 20, 25][randInt(0, 2)]; const d2 = [10, 15, 20][randInt(0, 2)];
        const after2 = mp * (100 - d1) / 100 * (100 - d2) / 100;
        answer = after2; display = '$' + answer;
        prompt = `Marked price is $${mp}. Successive discounts of ${d1}% and ${d2}% are applied. Find the final price.`;
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/[$,\s%]/g, ''));
      const correct = !isNaN(ua) && Math.abs(ua - body.answer) < 0.05;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  shares: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = `q-${Date.now()}-${Math.random()}`;
      if (diff === 'easy') {
        const shares = randomInt(10, 100); const divPerShare = randomInt(2, 10);
        const answer = shares * divPerShare;
        return { id, difficulty: diff, prompt: `Calculate dividend: ${shares} shares, dividend per share = Rs ${divPerShare}`, answer, display: String(answer) };
      } else if (diff === 'medium') {
        const shares = randomInt(50, 200); const faceValue = 100; const divPercent = randomInt(5, 20);
        const answer = shares * (faceValue / 100) * (divPercent / 100) * 100;
        return { id, difficulty: diff, prompt: `Income from ${shares} shares, face value Rs 100, dividend ${divPercent}%`, answer, display: String(Math.round(answer)) };
      } else if (diff === 'hard') {
        const marketValue = randomInt(100, 200); const faceValue = 100; const divPercent = randomInt(5, 15);
        const dividend = (faceValue * divPercent) / 100;
        const answer = (dividend / marketValue) * 100;
        return { id, difficulty: diff, prompt: `Find return% given market value Rs ${marketValue}, face value Rs ${faceValue}, dividend ${divPercent}%`, answer, display: answer.toFixed(2) };
      } else {
        const faceValue = 100; const divPercent = randomInt(6, 12); const targetIncome = randomInt(500, 2000);
        const dividend = (faceValue * divPercent) / 100;
        const answer = targetIncome / dividend;
        return { id, difficulty: diff, prompt: `How many shares (face value Rs 100, dividend ${divPercent}%) needed for income of Rs ${targetIncome}?`, answer, display: String(Math.round(answer)) };
      }
    },
    check(body) {
      const userNum = parseFloat((body.userAnswer || '').trim());
      const correct = !isNaN(userNum) && Math.abs(userNum - body.answer) < 1;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  banking: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = `q-${Date.now()}-${Math.random()}`;
      if (diff === 'easy') {
        const P = randomInt(1000, 10000); const R = randomInt(2, 10); const T = randomInt(1, 5);
        const answer = (P * R * T) / 100;
        return { id, difficulty: diff, prompt: `Simple Interest: Principal Rs ${P}, Rate ${R}%, Time ${T} years`, answer, display: String(answer.toFixed(0)) };
      } else if (diff === 'medium') {
        const P = randomInt(5000, 20000); const R = randomInt(4, 12); const T = randomInt(1, 4);
        const answer = P * Math.pow(1 + R / 100, T) - P;
        return { id, difficulty: diff, prompt: `Compound Interest: Principal Rs ${P}, Rate ${R}%, Time ${T} years`, answer, display: String(answer.toFixed(0)) };
      } else if (diff === 'hard') {
        const P = randomInt(500, 2000); const r = randomInt(6, 10); const n = randomInt(12, 36);
        const MV = P * n + (P * n * (n + 1) / (2 * 12)) * (r / 100);
        return { id, difficulty: diff, prompt: `RD maturity: Monthly Rs ${P}, Rate ${r}%, Months ${n}`, answer: MV, display: String(Math.round(MV)) };
      } else {
        const MV = randomInt(10000, 50000); const r = randomInt(6, 10); const n = randomInt(12, 36);
        const P = MV / (n + (n * (n + 1) / (2 * 12)) * (r / 100));
        return { id, difficulty: diff, prompt: `RD: Find monthly installment for maturity Rs ${MV}, Rate ${r}%, Months ${n}`, answer: P, display: String(Math.round(P)) };
      }
    },
    check(body) {
      const userNum = parseFloat((body.userAnswer || '').trim());
      const correct = !isNaN(userNum) && Math.abs(userNum - body.answer) < 10;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  gst: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = `q-${Date.now()}-${Math.random()}`;
      if (diff === 'easy') {
        const price = randomInt(100, 1000); const rate = pick([5, 12, 18]);
        const answer = (price * rate) / 100;
        return { id, difficulty: diff, prompt: `Find GST on price Rs ${price} at rate ${rate}%`, answer, display: answer.toFixed(0) };
      } else if (diff === 'medium') {
        const price = randomInt(500, 2000); const rate = pick([5, 12, 18]);
        const answer = price + (price * rate) / 100;
        return { id, difficulty: diff, prompt: `Total price including ${rate}% GST on Rs ${price}`, answer, display: answer.toFixed(0) };
      } else if (diff === 'hard') {
        const listPrice = randomInt(1000, 5000); const rate = pick([5, 12, 18]);
        const gst = (listPrice * rate) / 100;
        const answer = listPrice + gst;
        return { id, difficulty: diff, prompt: `Intra-state: List price Rs ${listPrice}, GST ${rate}%. Find total (with CGST+SGST)`, answer, display: answer.toFixed(0) };
      } else {
        const billedAmount = randomInt(5000, 20000); const rate = pick([5, 12, 18]);
        const answer = (billedAmount * rate) / 100;
        return { id, difficulty: diff, prompt: `IGST at ${rate}% on Rs ${billedAmount}. Find input tax credit`, answer, display: answer.toFixed(0) };
      }
    },
    check(body) {
      const userNum = parseFloat((body.userAnswer || '').trim());
      const correct = !isNaN(userNum) && Math.abs(userNum - body.answer) < 1;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

};

router.get('/question', (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.question(req.query.difficulty || 'easy', req.query));
});

router.post('/check', require('express').json(), (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.check(req.body || {}));
});

module.exports = router;
