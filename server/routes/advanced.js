'use strict';
const router = require('express').Router();

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
const randInt = randomInt;
function rand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a; }
function nCr(n, r) {
  if (r > n || r < 0) return 0;
  if (r === 0 || r === n) return 1;
  let result = 1;
  for (let i = 0; i < r; i++) { result = result * (n - i) / (i + 1); }
  return Math.round(result);
}
function fmtComplex(re, im) {
  if (im === 0) return String(re);
  if (re === 0) return im === 1 ? 'i' : im === -1 ? '-i' : im + 'i';
  return re + (im > 0 && im !== 1 ? '+' : '') + (im === 1 ? '+i' : im === -1 ? '-i' : (im > 0 ? '' : '') + im + 'i');
}
function pos1d() { return 1 + Math.floor(Math.random() * 9); }
function matMul(A, B) {
  const n = A.length, m = B[0].length, p = B.length;
  const C = Array.from({ length: n }, () => Array(m).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) for (let k = 0; k < p; k++) C[i][j] += A[i][k] * B[k][j];
  return C;
}
function fmtMat(M) { return '[' + M.map(row => row.join(',')).join(';') + ']'; }

const generators = {

  matrix: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = Date.now();
      if (diff === 'easy') {
        const A = [[rand(-5,9), rand(-5,9)], [rand(-5,9), rand(-5,9)]];
        const B = [[rand(-5,9), rand(-5,9)], [rand(-5,9), rand(-5,9)]];
        const R = [[A[0][0]+B[0][0], A[0][1]+B[0][1]], [A[1][0]+B[1][0], A[1][1]+B[1][1]]];
        const fmtM = (m) => `[${m[0][0]},${m[0][1]};${m[1][0]},${m[1][1]}]`;
        return { id, difficulty: diff, type: 'add', prompt: `A = ${fmtM(A)}, B = ${fmtM(B)}. Find A + B.`, answer: R, display: fmtM(R) };
      } else if (diff === 'medium') {
        let k = rand(-3, 5); if (k === 0) k = 2;
        const A = [[rand(-5,9), rand(-5,9)], [rand(-5,9), rand(-5,9)]];
        const R = [[k*A[0][0], k*A[0][1]], [k*A[1][0], k*A[1][1]]];
        const fmtM = (m) => `[${m[0][0]},${m[0][1]};${m[1][0]},${m[1][1]}]`;
        return { id, difficulty: diff, type: 'scalar', prompt: `A = ${fmtM(A)}. Find ${k}A.`, answer: R, display: fmtM(R) };
      } else if (diff === 'hard') {
        const a = rand(-5,8); const b = rand(-5,8); const c = rand(-5,8); const d = rand(-5,8);
        const det = a * d - b * c;
        return { id, difficulty: diff, type: 'determinant', prompt: `Find the determinant of [${a},${b};${c},${d}]`, answer: det, display: String(det) };
      } else {
        const A = [[rand(-3,5), rand(-3,5)], [rand(-3,5), rand(-3,5)]];
        const B = [[rand(-3,5), rand(-3,5)], [rand(-3,5), rand(-3,5)]];
        const R = [
          [A[0][0]*B[0][0]+A[0][1]*B[1][0], A[0][0]*B[0][1]+A[0][1]*B[1][1]],
          [A[1][0]*B[0][0]+A[1][1]*B[1][0], A[1][0]*B[0][1]+A[1][1]*B[1][1]]
        ];
        const fmtM = (m) => `[${m[0][0]},${m[0][1]};${m[1][0]},${m[1][1]}]`;
        return { id, difficulty: diff, type: 'multiply', prompt: `A = ${fmtM(A)}, B = ${fmtM(B)}. Find AB.`, answer: R, display: fmtM(R) };
      }
    },
    check(body) {
      const { type, answer, display } = body;
      const userStr = (body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
      let correct = false;
      if (type === 'determinant') {
        correct = !isNaN(parseInt(userStr)) && parseInt(userStr) === answer;
      } else {
        const m = userStr.replace(/[\[\]]/g, '').split(';');
        if (m.length === 2) {
          const r0 = m[0].split(',').map(Number); const r1 = m[1].split(',').map(Number);
          if (r0.length === 2 && r1.length === 2)
            correct = r0[0] === answer[0][0] && r0[1] === answer[0][1] && r1[0] === answer[1][0] && r1[1] === answer[1][1];
        }
      }
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  bases: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = Date.now();
      if (diff === 'easy') {
        const n = rand(5, 63);
        return { id, difficulty: diff, type: 'dec_to_bin', prompt: `Convert ${n} (decimal) to binary`, answer: n.toString(2), display: n.toString(2) };
      } else if (diff === 'medium') {
        const n = rand(10, 127); const bin = n.toString(2);
        return { id, difficulty: diff, type: 'bin_to_dec', prompt: `Convert ${bin} (binary) to decimal`, answer: n, display: String(n) };
      } else if (diff === 'hard') {
        const n = rand(16, 255);
        return { id, difficulty: diff, type: 'dec_to_hex', prompt: `Convert ${n} (decimal) to hexadecimal`, answer: n.toString(16).toUpperCase(), display: n.toString(16).toUpperCase() };
      } else {
        const subtype = pick(['bin_add', 'hex_to_bin']);
        if (subtype === 'bin_add') {
          const a = rand(5, 30); const b = rand(5, 30); const sum = a + b;
          return { id, difficulty: diff, type: 'bin_add', prompt: `Add in binary: ${a.toString(2)} + ${b.toString(2)}`, answer: sum.toString(2), display: sum.toString(2) };
        } else {
          const n = rand(16, 255); const hex = n.toString(16).toUpperCase();
          return { id, difficulty: diff, type: 'hex_to_bin', prompt: `Convert ${hex} (hexadecimal) to binary`, answer: n.toString(2), display: n.toString(2) };
        }
      }
    },
    check(body) {
      const { type, answer } = body;
      const userStr = (body.userAnswer || '').replace(/\s+/g, '').toUpperCase().replace(/^0+/, '') || '0';
      let correct = false;
      if (type === 'bin_to_dec') { correct = parseInt(userStr) === answer; }
      else { const expected = String(answer).toUpperCase().replace(/^0+/, '') || '0'; correct = userStr === expected; }
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  stdform: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const sig = randInt(11, 99) / 10;
        const exp = randInt(2, 7) * (Math.random() < 0.5 ? 1 : -1);
        const val = sig * Math.pow(10, exp);
        prompt = `Write ${exp > 0 ? val.toLocaleString('en-US', {useGrouping: false}) : val.toFixed(Math.abs(exp) + 1)} in standard form.`;
        answer = `${sig} × 10^${exp}`; display = answer;
      } else if (diff === 'medium') {
        const a = randInt(11, 49) / 10; const ea = randInt(2, 5);
        const b = randInt(11, 49) / 10; const eb = randInt(2, 5);
        let product = a * b; let expR = ea + eb;
        if (product >= 10) { product /= 10; expR += 1; }
        product = Math.round(product * 100) / 100;
        answer = `${product} × 10^${expR}`; display = answer;
        prompt = `Calculate (${a} × 10^${ea}) × (${b} × 10^${eb}). Give answer in standard form.`;
      } else if (diff === 'hard') {
        const a = randInt(20, 90) / 10; const ea = randInt(5, 9);
        const b = randInt(11, 49) / 10; const eb = randInt(2, 4);
        let quotient = a / b; let expR = ea - eb;
        if (quotient < 1) { quotient *= 10; expR -= 1; }
        if (quotient >= 10) { quotient /= 10; expR += 1; }
        quotient = Math.round(quotient * 100) / 100;
        answer = `${quotient} × 10^${expR}`; display = answer;
        prompt = `Calculate (${a} × 10^${ea}) ÷ (${b} × 10^${eb}). Give answer in standard form.`;
      } else {
        const exp = randInt(3, 7); const a = randInt(11, 50) / 10; const b = randInt(11, 40) / 10;
        const sum = a + b; let resCoeff = sum; let resExp = exp;
        if (resCoeff >= 10) { resCoeff /= 10; resExp += 1; }
        resCoeff = Math.round(resCoeff * 100) / 100;
        answer = `${resCoeff} × 10^${resExp}`; display = answer;
        prompt = `Calculate (${a} × 10^${exp}) + (${b} × 10^${exp}). Give answer in standard form.`;
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const normalize = (s) => String(s).replace(/\s/g, '').replace(/×10\^/gi, 'e').replace(/x10\^/gi, 'e').replace(/\*10\^/gi, 'e');
      const ua = normalize(body.userAnswer || '');
      const ans = normalize(String(body.answer));
      const correct = ua === ans;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  binomial: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const n = randInt(4, 10); const r = randInt(1, Math.min(n - 1, 5));
        answer = nCr(n, r); display = String(answer);
        prompt = `Evaluate ${n}C${r} (${n} choose ${r}).`;
      } else if (diff === 'medium') {
        const n = randInt(4, 10); const r = randInt(2, Math.min(n - 1, 5));
        answer = nCr(n, r); display = String(answer);
        prompt = `Find the coefficient of x^${r} in the expansion of (1 + x)^${n}.`;
      } else if (diff === 'hard') {
        const a = randInt(1, 3); const b = randInt(1, 3); const n = randInt(3, 6); const r = randInt(1, Math.min(n, 4));
        answer = nCr(n, r) * Math.pow(a, n - r) * Math.pow(b, r); display = String(answer);
        prompt = `Find the coefficient of x^${r} in (${a} + ${b}x)^${n}.`;
      } else {
        const n = randInt(5, 10); const termNum = randInt(2, Math.min(n, 5)); const r = termNum - 1;
        answer = nCr(n, r); display = `${answer}x^${r}`;
        prompt = `Find the ${termNum}${termNum === 2 ? 'nd' : termNum === 3 ? 'rd' : 'th'} term in the expansion of (1 + x)^${n}. Give the coefficient only.`;
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/[^\d.\-]/g, ''));
      const correct = !isNaN(ua) && ua === body.answer;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  complex: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const a = randInt(-5, 5), b = randInt(-5, 5); const c = randInt(-5, 5), d = randInt(-5, 5);
        const re = a + c; const im = b + d;
        answer = re + ',' + im; display = fmtComplex(re, im);
        prompt = `If z₁ = ${fmtComplex(a, b)} and z₂ = ${fmtComplex(c, d)}, find z₁ + z₂.\nGive answer as a,b for a + bi.`;
      } else if (diff === 'medium') {
        const a = randInt(-4, 4), b = randInt(-4, 4); const c = randInt(-4, 4), d = randInt(-4, 4);
        const re = a * c - b * d; const im = a * d + b * c;
        answer = re + ',' + im; display = fmtComplex(re, im);
        prompt = `If z₁ = ${fmtComplex(a, b)} and z₂ = ${fmtComplex(c, d)}, find z₁ × z₂.\nGive answer as a,b for a + bi.`;
      } else if (diff === 'hard') {
        const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]];
        const [a, b, c] = triples[randInt(0, triples.length - 1)];
        const signA = Math.random() < 0.5 ? -1 : 1; const signB = Math.random() < 0.5 ? -1 : 1;
        answer = c; display = String(c);
        prompt = `Find |z| where z = ${fmtComplex(signA * a, signB * b)}.`;
      } else {
        const a = randInt(-4, 4), b = randInt(1, 5) * (Math.random() < 0.5 ? -1 : 1);
        const re = a * a - b * b; const im = 2 * a * b;
        answer = re + ',' + im; display = fmtComplex(re, im);
        prompt = `If z = ${fmtComplex(a, b)}, find z².\nGive answer as a,b for a + bi.`;
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = (body.userAnswer || '').replace(/\s/g, '').replace(/i/g, '');
      const ans = String(body.answer).replace(/\s/g, '');
      if (!ans.includes(',')) {
        const correct = parseFloat(ua) === parseFloat(ans);
        return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
      }
      const userParts = ua.split(',').map(Number); const ansParts = ans.split(',').map(Number);
      const correct = userParts.length === 2 && userParts[0] === ansParts[0] && userParts[1] === ansParts[1];
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  dotprod: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = Date.now();
      if (diff === 'easy') {
        const a = [pos1d(), pos1d()]; const b = [pos1d(), pos1d()];
        const dot = a[0]*b[0] + a[1]*b[1];
        return { id, difficulty: diff, type: 'dot2d', prompt: 'Find the dot product', vecA: a, vecB: b, answer: dot, display: String(dot) };
      } else if (diff === 'medium') {
        if (Math.random() < 0.5) {
          const a = [pos1d(), pos1d()]; const b = [pos1d(), pos1d()];
          const dot = a[0]*b[0] + a[1]*b[1];
          return { id, difficulty: diff, type: 'dot2d', prompt: 'Find the dot product', vecA: a, vecB: b, answer: dot, display: String(dot) };
        } else {
          const a = [pos1d(), pos1d(), pos1d()]; const b = [pos1d(), pos1d(), pos1d()];
          const dot = a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
          return { id, difficulty: diff, type: 'dot3d', prompt: 'Find the dot product', vecA: a, vecB: b, answer: dot, display: String(dot) };
        }
      } else if (diff === 'hard') {
        if (Math.random() < 0.5) {
          const A = Array.from({ length: 2 }, () => [pos1d(), pos1d()]);
          const B = Array.from({ length: 2 }, () => [pos1d(), pos1d()]);
          const C = matMul(A, B);
          return { id, difficulty: diff, type: 'matmul', size: 2, prompt: 'Compute the matrix product A × B', matA: A, matB: B, answer: C, display: fmtMat(C) };
        } else {
          const A = Array.from({ length: 3 }, () => [pos1d(), pos1d(), pos1d()]);
          const B = Array.from({ length: 3 }, () => [pos1d(), pos1d(), pos1d()]);
          const C = matMul(A, B);
          return { id, difficulty: diff, type: 'matmul', size: 3, prompt: 'Compute the matrix product A × B', matA: A, matB: B, answer: C, display: fmtMat(C) };
        }
      } else {
        const A = Array.from({ length: 4 }, () => [pos1d(), pos1d(), pos1d(), pos1d()]);
        const B = Array.from({ length: 4 }, () => [pos1d(), pos1d(), pos1d(), pos1d()]);
        const C = matMul(A, B);
        const allPos = [];
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) allPos.push([i, j]);
        for (let i = allPos.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [allPos[i], allPos[j]] = [allPos[j], allPos[i]]; }
        const blanks = allPos.slice(0, 4).sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);
        const missingValues = blanks.map(([r, c]) => C[r][c]);
        const Cdisplay = C.map(row => [...row]);
        blanks.forEach(([r, c], idx) => { Cdisplay[r][c] = '?' + (idx + 1); });
        return { id, difficulty: diff, type: 'matfill', prompt: 'Find the missing values in C = A × B', matA: A, matB: B, matC: Cdisplay, blanks, answer: missingValues, display: missingValues.join(', ') };
      }
    },
    check(body) {
      const { type, answer, display } = body;
      const userStr = (body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
      let correct = false;
      if (type === 'dot2d' || type === 'dot3d' || type === 'dotsum') {
        correct = !isNaN(parseInt(userStr)) && parseInt(userStr) === answer;
      } else if (type === 'matmul') {
        const inner = userStr.replace(/[\[\]]/g, ''); const rows = inner.split(';');
        if (rows.length === answer.length) {
          correct = true;
          for (let i = 0; i < rows.length; i++) {
            const vals = rows[i].split(',').map(Number);
            if (vals.length !== answer[i].length) { correct = false; break; }
            for (let j = 0; j < vals.length; j++) { if (vals[j] !== answer[i][j]) { correct = false; break; } }
            if (!correct) break;
          }
        }
      } else if (type === 'matfill') {
        const vals = userStr.split(',').map(s => parseInt(s.trim()));
        if (vals.length === answer.length) correct = vals.every((v, i) => !isNaN(v) && v === answer[i]);
      }
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  section: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = `q-${Date.now()}-${Math.random()}`;
      if (diff === 'easy') {
        const x1 = randomInt(-10, 10); const y1 = randomInt(-10, 10);
        const x2 = randomInt(-10, 10); const y2 = randomInt(-10, 10);
        const midX = (x1 + x2) / 2; const midY = (y1 + y2) / 2;
        return { id, difficulty: diff, prompt: `Find midpoint of (${x1},${y1}) and (${x2},${y2})`, answer: [midX, midY], display: `${midX.toFixed(1)},${midY.toFixed(1)}` };
      } else if (diff === 'medium') {
        const x1 = randomInt(-5, 5); const y1 = randomInt(-5, 5);
        const x2 = randomInt(-5, 5); const y2 = randomInt(-5, 5);
        const m = randomInt(1, 4); const n = randomInt(1, 4);
        const px = (m * x2 + n * x1) / (m + n); const py = (m * y2 + n * y1) / (m + n);
        return { id, difficulty: diff, prompt: `Point dividing (${x1},${y1}) and (${x2},${y2}) in ratio ${m}:${n}`, answer: [px, py], display: `${px.toFixed(2)},${py.toFixed(2)}` };
      } else if (diff === 'hard') {
        const x1 = randomInt(-5, 5); const y1 = randomInt(-5, 5);
        const x2 = randomInt(-5, 5); const y2 = randomInt(-5, 5);
        const t = randomInt(1, 3) / randomInt(1, 3);
        const px = (t * x2 + x1) / (t + 1); const py = (t * y2 + y1) / (t + 1);
        return { id, difficulty: diff, prompt: `Point (${px.toFixed(1)},${py.toFixed(1)}) divides (${x1},${y1}) and (${x2},${y2}). Find ratio m:n`, answer: t, display: `1:${(1/t).toFixed(2)}` };
      } else {
        const x1 = randomInt(-5, 5); const y1 = randomInt(-5, 5);
        const x2 = randomInt(-5, 5); const y2 = randomInt(-5, 5);
        const x3 = randomInt(-5, 5); const y3 = randomInt(-5, 5);
        const cx = (x1 + x2 + x3) / 3; const cy = (y1 + y2 + y3) / 3;
        return { id, difficulty: diff, prompt: `Centroid of triangle with vertices (${x1},${y1}), (${x2},${y2}), (${x3},${y3})`, answer: [cx, cy], display: `${cx.toFixed(2)},${cy.toFixed(2)}` };
      }
    },
    check(body) {
      const { answer, display } = body;
      const userStr = (body.userAnswer || '').trim();
      if (Array.isArray(answer)) {
        const parts = userStr.split(',').map(p => parseFloat(p.trim()));
        const correct = parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) &&
                        Math.abs(parts[0] - answer[0]) < 0.2 && Math.abs(parts[1] - answer[1]) < 0.2;
        return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
      } else {
        const userNum = parseFloat(userStr);
        const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.2;
        return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
      }
    },
  },

  linprog: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = `q-${Date.now()}-${Math.random()}`;
      if (diff === 'easy') {
        const a = randomInt(2, 5); const b = randomInt(2, 5); const vx = randomInt(1, 5); const vy = randomInt(1, 5);
        const answer = a * vx + b * vy;
        return { id, difficulty: diff, prompt: `Maximize Z = ${a}x + ${b}y at vertex (${vx}, ${vy})`, answer, display: String(answer) };
      } else if (diff === 'medium') {
        const a = randomInt(2, 4); const b = randomInt(2, 4);
        const vertices = [[0, 0], [randomInt(2, 6), 0], [0, randomInt(2, 6)], [randomInt(1, 3), randomInt(1, 3)]];
        let maxVal = -Infinity;
        vertices.forEach(([x, y]) => { maxVal = Math.max(maxVal, a * x + b * y); });
        return { id, difficulty: diff, prompt: `Maximize Z = ${a}x + ${b}y at vertices ${JSON.stringify(vertices)}`, answer: maxVal, display: String(maxVal) };
      } else if (diff === 'hard') {
        const a = randomInt(1, 3); const b = randomInt(1, 3); const c1 = randomInt(4, 8); const c2 = randomInt(4, 8);
        const corners = [[0, c1], [0, c2], [c1, 0], [c2/2, 0]].filter(p => p[0] >= 0 && p[1] >= 0);
        let minVal = Infinity;
        corners.forEach(([x, y]) => { if (x + y >= c1 && 2 * x + y >= c2) minVal = Math.min(minVal, a * x + b * y); });
        const answer = minVal < Infinity ? minVal : 0;
        return { id, difficulty: diff, prompt: `Minimize Z = ${a}x + ${b}y subject to x + y ≥ ${c1}, 2x + y ≥ ${c2}, x,y ≥ 0`, answer, display: String(Math.round(answer)) };
      } else {
        const a = randomInt(1, 3); const b = randomInt(1, 3);
        const c1 = randomInt(3, 6); const c2 = randomInt(3, 6); const c3 = randomInt(3, 6);
        const corners = [[0, 0], [c2, 0], [0, c3], [c2, Math.min(c3, c1 - c2)]];
        let maxVal = 0;
        corners.forEach(([x, y]) => { if (x + y <= c1 && x <= c2 && y <= c3) maxVal = Math.max(maxVal, a * x + b * y); });
        return { id, difficulty: diff, prompt: `Maximize Z = ${a}x + ${b}y subject to: x + y ≤ ${c1}, x ≤ ${c2}, y ≤ ${c3}, x,y ≥ 0`, answer: maxVal, display: String(maxVal) };
      }
    },
    check(body) {
      const { answer, display } = body;
      const userNum = parseFloat((body.userAnswer || '').trim());
      const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 1;
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  circmeasure: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = `q-${Date.now()}-${Math.random()}`;
      if (diff === 'easy') {
        const angles = [30, 45, 60, 90, 180, 360];
        const deg = pick(angles); const answer = (deg * Math.PI) / 180;
        return { id, difficulty: diff, prompt: `Convert ${deg}° to radians`, answer, display: answer.toFixed(2) };
      } else if (diff === 'medium') {
        const radMult = pick([0.5, 1, 1.5, 2, 3]);
        const answer = (radMult * 180) / Math.PI;
        return { id, difficulty: diff, prompt: `Convert ${radMult}π radians to degrees`, answer, display: String(Math.round(answer)) };
      } else if (diff === 'hard') {
        const r = randomInt(2, 8); const theta = (randomInt(30, 180) * Math.PI) / 180;
        const answer = r * theta; const deg = Math.round((theta * 180) / Math.PI);
        return { id, difficulty: diff, prompt: `Arc length: radius ${r}, angle ${deg}° (θ in radians)`, answer, display: answer.toFixed(2) };
      } else {
        const r = randomInt(3, 10); const theta = (randomInt(45, 180) * Math.PI) / 180;
        const answer = (1 / 2) * r * r * theta; const deg = Math.round((theta * 180) / Math.PI);
        return { id, difficulty: diff, prompt: `Sector area: radius ${r}, angle ${deg}° (θ in radians)`, answer, display: answer.toFixed(2) };
      }
    },
    check(body) {
      const { answer, display } = body;
      const userNum = parseFloat((body.userAnswer || '').trim());
      const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.5;
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  conics: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = `q-${Date.now()}-${Math.random()}`;
      if (diff === 'easy') {
        const types = [
          { eq: 'x² + y² = 25', type: 'circle' }, { eq: 'y² = 8x', type: 'parabola' },
          { eq: 'x²/25 + y²/9 = 1', type: 'ellipse' }, { eq: 'x²/16 − y²/9 = 1', type: 'hyperbola' }
        ];
        const chosen = pick(types);
        return { id, difficulty: diff, prompt: `Identify conic: ${chosen.eq}`, answer: chosen.type, display: chosen.type };
      } else if (diff === 'medium') {
        const h = randomInt(-5, 5); const k = randomInt(-5, 5); const r = randomInt(2, 8);
        const D = -2 * h; const E = -2 * k; const F = h * h + k * k - r * r;
        return { id, difficulty: diff, prompt: `Find radius: x² + y² + ${D}x + ${E}y + ${F} = 0`, answer: r, display: String(r) };
      } else if (diff === 'hard') {
        const a = randomInt(5, 10); const b = randomInt(2, a - 1);
        const c = Math.sqrt(a * a - b * b); const ecc = c / a;
        return { id, difficulty: diff, prompt: `Ellipse: x²/${a * a} + y²/${b * b} = 1. Find eccentricity`, answer: ecc, display: ecc.toFixed(3) };
      } else {
        const a = randomInt(1, 5);
        return { id, difficulty: diff, prompt: `Parabola: y² = ${4 * a}x. Find x-coordinate of focus`, answer: a, display: String(a) };
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
