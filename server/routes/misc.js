'use strict';
const router = require('express').Router();

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
const randInt = randomInt;

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a; }
function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }

function setPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function setRand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function randomSubset(universe, k) {
  const copy = [...universe]; const result = [];
  for (let i = 0; i < Math.min(k, copy.length); i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result.sort((a, b) => a - b);
}
function setUnion(a, b) { return [...new Set([...a, ...b])].sort((x, y) => x - y); }
function setIntersect(a, b) { const s = new Set(b); return a.filter(x => s.has(x)).sort((x, y) => x - y); }
function setDiff(a, b) { const s = new Set(b); return a.filter(x => !s.has(x)).sort((x, y) => x - y); }

const generators = {

  sets: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = Date.now();
      if (diff === 'easy') {
        const universe = [];
        for (let i = 1; i <= setRand(10, 15); i++) universe.push(i);
        const A = randomSubset(universe, setRand(3, 6));
        const B = randomSubset(universe, setRand(3, 6));
        const ops = [
          { op: 'A ∪ B', answer: setUnion(A, B) },
          { op: 'A ∩ B', answer: setIntersect(A, B) },
          { op: 'A − B', answer: setDiff(A, B) },
          { op: 'B − A', answer: setDiff(B, A) },
          { op: "A'", answer: setDiff(universe, A) },
        ];
        const chosen = setPick(ops);
        const prompt = `U = {${universe.join(', ')}}, A = {${A.join(', ')}}, B = {${B.join(', ')}}. Find ${chosen.op}`;
        return { id, difficulty: diff, type: 'list', prompt, answer: chosen.answer };
      } else if (diff === 'medium') {
        const nA = setRand(10, 30); const nB = setRand(10, 30);
        const nAB = setRand(2, Math.min(nA, nB) - 1);
        const nAuB = nA + nB - nAB;
        const subtype = setPick(['find_union', 'find_intersect', 'find_only_a']);
        let prompt, answer;
        if (subtype === 'find_union') {
          prompt = `n(A) = ${nA}, n(B) = ${nB}, n(A ∩ B) = ${nAB}. Find n(A ∪ B)`;
          answer = nAuB;
        } else if (subtype === 'find_intersect') {
          prompt = `n(A) = ${nA}, n(B) = ${nB}, n(A ∪ B) = ${nAuB}. Find n(A ∩ B)`;
          answer = nAB;
        } else {
          prompt = `n(A) = ${nA}, n(A ∩ B) = ${nAB}. How many elements are in A only?`;
          answer = nA - nAB;
        }
        return { id, difficulty: diff, type: 'cardinality', subtype, prompt, answer };
      } else if (diff === 'hard') {
        const onlyA = setRand(5, 20); const both = setRand(3, 15);
        const onlyB = setRand(5, 20); const neither = setRand(2, 10);
        const total = onlyA + both + onlyB + neither;
        const subtype = setPick(['find_neither', 'find_both', 'find_onlyA', 'find_total']);
        let prompt, answer;
        if (subtype === 'find_neither') {
          prompt = `In a group of ${total}: n(A only) = ${onlyA}, n(A ∩ B) = ${both}, n(B only) = ${onlyB}. How many are in neither A nor B?`;
          answer = neither;
        } else if (subtype === 'find_both') {
          prompt = `In a group of ${total}: n(A) = ${onlyA + both}, n(B) = ${onlyB + both}, n(neither) = ${neither}. Find n(A ∩ B).`;
          answer = both;
        } else if (subtype === 'find_onlyA') {
          prompt = `In a group of ${total}: n(A ∩ B) = ${both}, n(B only) = ${onlyB}, n(neither) = ${neither}. How many are in A only?`;
          answer = onlyA;
        } else {
          prompt = `n(A only) = ${onlyA}, n(A ∩ B) = ${both}, n(B only) = ${onlyB}, n(neither) = ${neither}. Find the total.`;
          answer = total;
        }
        return { id, difficulty: diff, type: 'venn2', subtype, prompt, answer };
      } else {
        const abc = setRand(1, 5); const abOnly = setRand(1, 8); const acOnly = setRand(1, 8);
        const bcOnly = setRand(1, 8); const aOnly = setRand(3, 12); const bOnly = setRand(3, 12);
        const cOnly = setRand(3, 12); const neither = setRand(2, 8);
        const nA = aOnly + abOnly + acOnly + abc; const nB = bOnly + abOnly + bcOnly + abc;
        const nC = cOnly + acOnly + bcOnly + abc; const nAB = abOnly + abc;
        const nAC = acOnly + abc; const nBC = bcOnly + abc;
        const total = aOnly + bOnly + cOnly + abOnly + acOnly + bcOnly + abc + neither;
        const subtype = setPick(['find_abc', 'find_neither', 'find_aonly', 'find_total']);
        let prompt, answer;
        if (subtype === 'find_abc') {
          prompt = `n(A) = ${nA}, n(B) = ${nB}, n(C) = ${nC}, n(A∩B) = ${nAB}, n(A∩C) = ${nAC}, n(B∩C) = ${nBC}, total in at least one set = ${total - neither}. Find n(A ∩ B ∩ C).`;
          answer = abc;
        } else if (subtype === 'find_neither') {
          const inAtLeastOne = nA + nB + nC - nAB - nAC - nBC + abc;
          prompt = `In a group of ${total}: n(A) = ${nA}, n(B) = ${nB}, n(C) = ${nC}, n(A∩B) = ${nAB}, n(A∩C) = ${nAC}, n(B∩C) = ${nBC}, n(A∩B∩C) = ${abc}. How many in neither?`;
          answer = total - inAtLeastOne;
        } else if (subtype === 'find_aonly') {
          prompt = `n(A) = ${nA}, n(A∩B) = ${nAB}, n(A∩C) = ${nAC}, n(A∩B∩C) = ${abc}. How many are in A only?`;
          answer = aOnly;
        } else {
          prompt = `n(A only) = ${aOnly}, n(B only) = ${bOnly}, n(C only) = ${cOnly}, n(A∩B only) = ${abOnly}, n(A∩C only) = ${acOnly}, n(B∩C only) = ${bcOnly}, n(A∩B∩C) = ${abc}, neither = ${neither}. Find total.`;
          answer = total;
        }
        return { id, difficulty: diff, type: 'venn3', subtype, prompt, answer };
      }
    },
    check(body) {
      const { type, answer: expected } = body;
      const userStr = (body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
      let correct = false; let display = '';
      if (type === 'list') {
        const cleaned = userStr.replace(/[{}]/g, '');
        let userSet;
        if (cleaned === '' || cleaned.toLowerCase() === 'empty') { userSet = []; }
        else { userSet = cleaned.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b); }
        const expectedSorted = [...expected].sort((a, b) => a - b);
        correct = userSet.length === expectedSorted.length && userSet.every((v, i) => v === expectedSorted[i]);
        display = expectedSorted.length === 0 ? '{ } (empty set)' : `{${expectedSorted.join(', ')}}`;
      } else {
        const userNum = parseInt(userStr);
        correct = !isNaN(userNum) && userNum === expected;
        display = String(expected);
      }
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  bounds: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const val = randInt(10, 99); const dp1 = randInt(1, 9);
        const num = val + dp1 / 10;
        prompt = `${num} is rounded to 1 decimal place. What is the lower bound?`;
        answer = num - 0.05; display = String(answer);
      } else if (diff === 'medium') {
        const base = randInt(3, 15) * 10;
        prompt = `A length is ${base} cm, rounded to the nearest 10 cm. What is the upper bound?`;
        answer = base + 5; display = String(answer);
      } else if (diff === 'hard') {
        const a = randInt(20, 50) / 10; const b = randInt(20, 50) / 10;
        prompt = `a = ${a} (1 d.p.) and b = ${b} (1 d.p.). Find the upper bound of a + b.`;
        answer = Math.round((a + 0.05 + b + 0.05) * 100) / 100; display = String(answer);
      } else {
        const a = randInt(30, 80) / 10; const b = randInt(20, 40) / 10;
        const upperA = a + 0.05; const lowerB = b - 0.05;
        const result = Math.round((upperA / lowerB) * 1000) / 1000;
        prompt = `a = ${a} (1 d.p.) and b = ${b} (1 d.p.). Find the upper bound of a ÷ b. Give answer to 3 d.p.`;
        answer = result; display = String(answer);
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/\s/g, ''));
      const correct = !isNaN(ua) && Math.abs(ua - body.answer) < 0.005;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  sdt: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const s = randInt(20, 80); const t = randInt(2, 6);
        answer = s * t; display = answer + ' km';
        prompt = `A car travels at ${s} km/h for ${t} hours. How far does it travel (in km)?`;
      } else if (diff === 'medium') {
        const s = randInt(30, 70); const d = s * randInt(2, 5);
        answer = d / s; display = answer + ' hours';
        prompt = `A train covers ${d} km at ${s} km/h. How long does the journey take (in hours)?`;
      } else if (diff === 'hard') {
        const d1 = randInt(30, 80); const s1 = randInt(20, 60);
        const d2 = randInt(30, 80); const s2 = randInt(20, 60);
        const totalD = d1 + d2;
        const timeNum = d1 * s2 + d2 * s1; const timeDen = s1 * s2;
        const ansNum = totalD * timeDen; const ansDen = timeNum;
        const g = gcd(Math.abs(ansNum), Math.abs(ansDen));
        const rn = ansNum / g; const rd = ansDen / g;
        answer = rd === 1 ? rn : Math.round((rn / rd) * 100) / 100;
        display = answer + ' km/h';
        prompt = `A cyclist rides ${d1} km at ${s1} km/h then ${d2} km at ${s2} km/h. Find the average speed (to 2 d.p. if needed).`;
      } else {
        const ms = randInt(5, 30);
        answer = Math.round(ms * 3.6 * 100) / 100; display = answer + ' km/h';
        prompt = `Convert ${ms} m/s to km/h.`;
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/[^\d.\-\/]/g, ''));
      const correct = !isNaN(ua) && Math.abs(ua - body.answer) < 0.05;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  variation: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const k = randInt(2, 9); const x1 = randInt(2, 6); const y1 = k * x1; const x2 = randInt(3, 8);
        answer = k * x2; display = String(answer);
        prompt = `y is directly proportional to x. When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`;
      } else if (diff === 'medium') {
        const x1 = randInt(2, 6); const x2 = randInt(2, 6);
        const kUse = x1 * x2 * randInt(1, 4);
        const y1 = kUse / x1;
        answer = kUse / x2; display = String(answer);
        prompt = `y is inversely proportional to x. When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`;
      } else if (diff === 'hard') {
        const k = randInt(1, 5); const x1 = randInt(2, 5); const y1 = k * x1 * x1; const x2 = randInt(2, 6);
        answer = k * x2 * x2; display = String(answer);
        prompt = `y is directly proportional to x². When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`;
      } else {
        const x1 = [4, 9, 16, 25][randInt(0, 3)];
        const sqrtX1 = Math.round(Math.sqrt(x1));
        const k = sqrtX1 * randInt(2, 6); const y1 = k / sqrtX1;
        const x2 = [4, 9, 16, 25][randInt(0, 3)];
        const sqrtX2 = Math.round(Math.sqrt(x2));
        answer = k / sqrtX2; display = String(answer);
        prompt = `y is inversely proportional to √x. When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`;
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/\s/g, ''));
      const correct = !isNaN(ua) && Math.abs(ua - body.answer) < 0.05;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  hcflcm: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      const type = randInt(1, 4);
      if (diff === 'easy') {
        if (type === 1) {
          const g = randInt(2, 8); const a = g * randInt(2, 5); const b = g * randInt(2, 5);
          answer = gcd(a, b); display = String(answer);
          prompt = `Find the HCF (Highest Common Factor) of ${a} and ${b}.`;
        } else if (type === 2) {
          const a = [9, 14, 15, 21, 25, 27][randInt(0, 5)]; const b = [8, 11, 16, 22, 26, 29][randInt(0, 5)];
          answer = gcd(a, b); display = String(answer);
          prompt = `What is the Highest Common Factor (HCF) of ${a} and ${b}?`;
        } else if (type === 3) {
          const factors = [
            { a: 12, b: 18, g: 6, fruit1: 'apples', fruit2: 'oranges' },
            { a: 16, b: 24, g: 8, fruit1: 'stickers', fruit2: 'stamps' },
            { a: 15, b: 20, g: 5, fruit1: 'pens', fruit2: 'pencils' },
            { a: 8, b: 12, g: 4, fruit1: 'blue beads', fruit2: 'red beads' }
          ][randInt(0, 3)];
          answer = factors.g; display = String(answer);
          prompt = `A teacher has ${factors.a} ${factors.fruit1} and ${factors.b} ${factors.fruit2}. She wants to divide them equally among her students without leftovers. What is the maximum number of students who can get an equal share?`;
        } else {
          const a = randInt(3, 9); const b = a * randInt(2, 4);
          answer = a; display = String(answer);
          prompt = `Find the HCF of ${a} and ${b}.`;
        }
      } else if (diff === 'medium') {
        if (type === 1) {
          const a = randInt(4, 12); const b = randInt(4, 12);
          answer = lcm(a, b); display = String(answer);
          prompt = `Find the LCM (Lowest Common Multiple) of ${a} and ${b}.`;
        } else if (type === 2) {
          const primes = [3, 5, 7, 11];
          const a = primes[randInt(0, 3)]; let b = primes[randInt(0, 3)];
          while (a === b) { b = primes[randInt(0, 3)]; }
          answer = lcm(a, b); display = String(answer);
          prompt = `What is the Lowest Common Multiple (LCM) of ${a} and ${b}?`;
        } else if (type === 3) {
          const p = [
            { a: 6, b: 8, l: 24, thing: 'neon signs blink', unit: 'seconds' },
            { a: 10, b: 15, l: 30, thing: 'bus schedules align', unit: 'minutes' },
            { a: 4, b: 6, l: 12, thing: 'alarms beep', unit: 'minutes' }
          ][randInt(0, 2)];
          answer = p.l; display = String(answer);
          prompt = `Two ${p.thing} at intervals of ${p.a} and ${p.b} ${p.unit}. If they align now, after how many ${p.unit} will they next align?`;
        } else {
          const a = randInt(3, 8); const b = a * randInt(2, 4);
          answer = b; display = String(answer);
          prompt = `Find the LCM of ${a} and ${b}.`;
        }
      } else if (diff === 'hard') {
        if (type === 1) {
          const a = randInt(3, 8); const b = randInt(3, 8); const c = randInt(3, 8);
          answer = lcm(lcm(a, b), c); display = String(answer);
          prompt = `Find the LCM of ${a}, ${b}, and ${c}.`;
        } else if (type === 2) {
          const g = randInt(2, 6); const a = g * randInt(2, 4); const b = g * randInt(2, 4); const c = g * randInt(2, 4);
          answer = gcd(gcd(a, b), c); display = String(answer);
          prompt = `Find the Highest Common Factor (HCF) of ${a}, ${b}, and ${c}.`;
        } else if (type === 3) {
          const base = [
            { h: 4, l: 24, a: 8, b: 12 }, { h: 6, l: 36, a: 12, b: 18 },
            { h: 5, l: 30, a: 10, b: 15 }, { h: 3, l: 18, a: 6, b: 9 }
          ][randInt(0, 3)];
          answer = base.b; display = String(answer);
          prompt = `The HCF of two numbers is ${base.h} and their LCM is ${base.l}. If one of the numbers is ${base.a}, what is the other number?`;
        } else {
          const a = [3, 4, 6][randInt(0, 2)]; const b = [4, 5, 8][randInt(0, 2)]; const c = [6, 8, 12][randInt(0, 2)];
          answer = lcm(lcm(a, b), c); display = String(answer);
          prompt = `Three runners start running a lap together. Runner A completes a lap in ${a} minutes, Runner B in ${b} minutes, and Runner C in ${c} minutes. After how many minutes will they next meet at the starting point?`;
        }
      } else {
        if (type === 1) {
          const r = randInt(2, 5); const g = randInt(4, 10); const f1 = randInt(2, 4); const f2 = randInt(2, 4);
          const a = g * f1 + r; const b = g * f2 + r;
          answer = gcd(a - r, b - r); display = String(answer);
          prompt = `Find the largest number that divides ${a} and ${b} leaving a remainder of ${r} in each case.`;
        } else if (type === 2) {
          const r = randInt(2, 5); const a = randInt(5, 10); const b = randInt(5, 10);
          answer = lcm(a, b) + r; display = String(answer);
          prompt = `What is the smallest positive integer which when divided by ${a} and ${b} leaves a remainder of ${r} in each case?`;
        } else if (type === 3) {
          const lengths = [
            { a: 48, b: 72, c: 96, g: 24 }, { a: 30, b: 45, c: 75, g: 15 },
            { a: 36, b: 54, c: 90, g: 18 }, { a: 40, b: 60, c: 80, g: 20 }
          ][randInt(0, 3)];
          answer = lengths.g; display = String(answer);
          prompt = `A merchant has three pieces of ribbon of lengths ${lengths.a} cm, ${lengths.b} cm, and ${lengths.c} cm. He wants to cut them into equal pieces of the maximum possible length. What should be the length of each piece (in cm)?`;
        } else {
          const a = randInt(6, 12); const b = randInt(8, 15);
          answer = lcm(a, b); display = String(answer);
          prompt = `Two neon signs blink at different rates. Sign A blinks every ${a} seconds, and Sign B blinks every ${b} seconds. If they both blink together now, after how many seconds will they next blink together?`;
        }
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/[^\d.\-]/g, ''));
      const correct = !isNaN(ua) && ua === body.answer;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  remfactor: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = `q-${Date.now()}-${Math.random()}`;
      if (diff === 'easy') {
        const a = randomInt(2, 5); const b = randomInt(1, 10); const c = randomInt(1, 20); const xVal = randomInt(1, 5);
        const answer = a * xVal * xVal + b * xVal + c;
        const prompt = `Find remainder when f(x) = ${a}x² + ${b}x + ${c} is divided by (x − ${xVal})`;
        return { id, difficulty: diff, prompt, answer, display: String(answer) };
      } else if (diff === 'medium') {
        const a = randomInt(2, 5); const answer_val = randomInt(1, 6);
        const b = randomInt(1, 8); const remainder = randomInt(1, 10);
        const isFactor = Math.random() < 0.5;
        const result = isFactor ? 0 : remainder;
        const prompt = `Is (x − ${answer_val}) a factor of f(x) = ${a}x² + ${b}x + ${result}? Answer yes or no`;
        const answerStr = isFactor ? 'yes' : 'no';
        return { id, difficulty: diff, prompt, answer: answerStr, display: answerStr };
      } else if (diff === 'hard') {
        const a = randomInt(1, 4); const b = randomInt(1, 6); const c = randomInt(1, 10); const d = randomInt(1, 15); const xVal = randomInt(1, 4);
        const answer = a * xVal * xVal * xVal + b * xVal * xVal + c * xVal + d;
        const prompt = `Find remainder when f(x) = ${a}x³ + ${b}x² + ${c}x + ${d} is divided by (x − ${xVal})`;
        return { id, difficulty: diff, prompt, answer, display: String(answer) };
      } else {
        const xVal = randomInt(1, 4); const b = randomInt(1, 20);
        const answer = -(xVal * xVal * xVal + b) / xVal;
        const prompt = `Find k such that (x − ${xVal}) is a factor of x³ + kx + ${b}`;
        return { id, difficulty: diff, prompt, answer, display: answer.toFixed(2) };
      }
    },
    check(body) {
      const { answer, display } = body;
      let userStr = (body.userAnswer || '').trim().toLowerCase();
      const correct = (typeof answer === 'string')
        ? userStr === answer.toLowerCase()
        : !isNaN(parseFloat(userStr)) && Math.abs(parseFloat(userStr) - answer) < 0.1;
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

};

router.get('/question', (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.question(req.query.difficulty));
});

router.post('/check', require('express').json(), (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.check(req.body || {}));
});

module.exports = router;
