'use strict';
const router = require('express').Router();

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
const randInt = randomInt;
function rand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a; }

function simplifyFraction(num, den) {
  if (den < 0) { num = -num; den = -den; }
  const g = gcd(Math.abs(num), den);
  return { num: num / g, den: den / g };
}

function triRand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function triPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const PYTH_TRIPLES = [[3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10],[9,12,15],[12,16,20],[15,20,25],[9,40,41],[11,60,61],[20,21,29]];

function pythagPoolForIndex(qIdx) {
  // Tier 0 (questions 1-3): single-digit sides only — only the (3,4,5) triple.
  if (qIdx < 3) return { triples: [[3,4,5]], maxK: 1 };
  // Tier 1 (questions 4-6): small double-digit sides, k=1.
  if (qIdx < 6) return { triples: [[3,4,5],[6,8,10],[5,12,13],[9,12,15]], maxK: 1 };
  // Tier 2 (questions 7-9): broader pool, allow k=2.
  if (qIdx < 9) return { triples: [[3,4,5],[6,8,10],[5,12,13],[9,12,15],[8,15,17],[7,24,25]], maxK: 2 };
  // Tier 3 (10+): full pool, larger multipliers permitted.
  return { triples: PYTH_TRIPLES.slice(0, 6), maxK: 3 };
}

function heronQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    // semi-perimeter
    const a = randomInt(3, 10);
    const b = randomInt(3, 10);
    const c = randomInt(3, 10);
    if (a + b <= c) return heronQuestion(difficulty);
    const answer = (a + b + c) / 2;
    const prompt = `Find semi-perimeter of triangle with sides ${a}, ${b}, ${c}`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(1) };
  } else if (difficulty === 'medium') {
    // Pythagorean triple: area is integer
    const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
    const [a, b, c] = triPick(triples);
    const s = (a + b + c) / 2;
    const answer = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    const prompt = `Find area using Heron's formula: sides ${a}, ${b}, ${c}`;
    return { id, difficulty, prompt, answer, display: String(Math.round(answer)) };
  } else if (difficulty === 'hard') {
    // non-integer answer, round to 1 dp
    const a = randomInt(5, 12);
    const b = randomInt(5, 12);
    const c = randomInt(5, 12);
    if (a + b <= c) return heronQuestion(difficulty);
    const s = (a + b + c) / 2;
    const answer = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    const prompt = `Find area using Heron's formula: sides ${a}, ${b}, ${c}`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(1) };
  } else {
    // given area and two sides, find third
    const a = randomInt(4, 10);
    const b = randomInt(4, 10);
    const area = randomInt(10, 40);
    const s_val = (area * 2) / (a + b);
    const c = 2 * s_val - a - b;
    const answer = Math.abs(c);
    const prompt = `Triangle has sides ${a} and ${b}, area = ${area}. Find the third side`;
    return { id, difficulty, prompt, answer, display: answer.toFixed(2) };
  }
}

const POLYGON_NAMES = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' };

function invtrigQuestion(difficulty) {
  const id = `q-${Date.now()}-${Math.random()}`;
  if (difficulty === 'easy') {
    const values = [
      { val: 0, func: 'arcsin', ans: 0 }, { val: '1/2', func: 'arcsin', ans: 30 },
      { val: 1, func: 'arcsin', ans: 90 }, { val: 1, func: 'arccos', ans: 0 },
      { val: '1/2', func: 'arccos', ans: 60 }, { val: 0, func: 'arccos', ans: 90 },
      { val: 0, func: 'arctan', ans: 0 }, { val: 1, func: 'arctan', ans: 45 }
    ];
    const chosen = pick(values);
    return { id, difficulty, prompt: `Find ${chosen.func}(${chosen.val}) in degrees`, answer: chosen.ans, display: String(chosen.ans) };
  } else if (difficulty === 'medium') {
    const values = [
      { val: '√3/2', func: 'arcsin', ans: 60 }, { val: '√2/2', func: 'arcsin', ans: 45 },
      { val: '√2/2', func: 'arccos', ans: 45 }, { val: '√3/2', func: 'arccos', ans: 30 }
    ];
    const chosen = pick(values);
    return { id, difficulty, prompt: `Find ${chosen.func}(${chosen.val}) in degrees`, answer: chosen.ans, display: String(chosen.ans) };
  } else if (difficulty === 'hard') {
    const x = randomInt(3, 9) / 10;
    const answer = Math.sqrt(1 - x * x);
    return { id, difficulty, prompt: `Find sin(arccos(${x.toFixed(1)}))`, answer, display: answer.toFixed(3) };
  } else {
    const x = randomInt(1, 9) / 10;
    const answer = Math.atan(x) * 180 / Math.PI;
    return { id, difficulty, prompt: `Find principal value of arctan(${x.toFixed(1)}) in degrees`, answer, display: answer.toFixed(2) };
  }
}

const generators = {

  trig: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const id = Date.now();

      if (difficulty === 'easy') {
        // SOH-CAH-TOA: find missing side in right triangle
        // Use Pythagorean triples for clean answers
        const triples = [[3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10],[9,12,15],[10,24,26],[20,21,29]];
        const [a, b, c] = triPick(triples);
        const subtype = triPick(['find_hyp', 'find_leg']);
        let prompt, answer;
        if (subtype === 'find_hyp') {
          prompt = `Right triangle: legs = ${a} and ${b}. Find the hypotenuse.`;
          answer = c;
        } else {
          prompt = `Right triangle: hypotenuse = ${c}, one leg = ${a}. Find the other leg.`;
          answer = b;
        }
        return { id, difficulty, type: 'pythagoras', prompt, answer, answerDen: 1 };
      }
      else if (difficulty === 'medium') {
        // Find angle using trig ratios (answer in degrees, rounded to 1dp)
        const angle = triRand(15, 75);
        const rad = angle * Math.PI / 180;
        const side = triRand(5, 20);
        const fn = triPick(['sin', 'cos', 'tan']);
        let opp, adj, hyp, prompt;
        if (fn === 'sin') {
          hyp = side;
          opp = Math.round(hyp * Math.sin(rad) * 10) / 10;
          prompt = `Right triangle: opposite = ${opp}, hypotenuse = ${hyp}. Find the angle (degrees).`;
        } else if (fn === 'cos') {
          hyp = side;
          adj = Math.round(hyp * Math.cos(rad) * 10) / 10;
          prompt = `Right triangle: adjacent = ${adj}, hypotenuse = ${hyp}. Find the angle (degrees).`;
        } else {
          adj = side;
          opp = Math.round(adj * Math.tan(rad) * 10) / 10;
          prompt = `Right triangle: opposite = ${opp}, adjacent = ${adj}. Find the angle (degrees).`;
        }
        return { id, difficulty, type: 'find_angle', prompt, answer: angle, answerDen: 1 };
      }
      else if (difficulty === 'hard') {
        // Sine rule: a/sinA = b/sinB — find missing side or angle
        const A = triRand(30, 80);
        const B = triRand(30, 150 - A);
        const C = 180 - A - B;
        const radA = A * Math.PI / 180;
        const radB = B * Math.PI / 180;
        const a = triRand(5, 20);
        const b = Math.round(a * Math.sin(radB) / Math.sin(radA) * 10) / 10;
        const subtype = triPick(['find_side', 'find_angle']);
        let prompt, answer;
        if (subtype === 'find_side') {
          prompt = `Triangle: a = ${a}, angle A = ${A}°, angle B = ${B}°. Find side b (1 d.p.).`;
          answer = b;
        } else {
          prompt = `Triangle: a = ${a}, b = ${b}, angle A = ${A}°. Find angle B (degrees).`;
          answer = B;
        }
        return { id, difficulty, type: 'sine_rule', prompt, answer, answerDen: 1 };
      }
      else {
        // Cosine rule or area = ½ab·sinC
        const subtype = triPick(['cosine', 'area']);
        if (subtype === 'cosine') {
          const a = triRand(5, 15);
          const b = triRand(5, 15);
          const C = triRand(30, 120);
          const radC = C * Math.PI / 180;
          const c2 = a*a + b*b - 2*a*b*Math.cos(radC);
          const c = Math.round(Math.sqrt(c2) * 10) / 10;
          const prompt = `Triangle: a = ${a}, b = ${b}, angle C = ${C}°. Find side c (1 d.p.).`;
          return { id, difficulty, type: 'cosine_rule', prompt, answer: c, answerDen: 1 };
        } else {
          const a = triRand(5, 15);
          const b = triRand(5, 15);
          const C = triRand(30, 120);
          const radC = C * Math.PI / 180;
          const area = Math.round(0.5 * a * b * Math.sin(radC) * 10) / 10;
          const prompt = `Triangle: a = ${a}, b = ${b}, angle C = ${C}°. Find the area (1 d.p.).`;
          return { id, difficulty, type: 'area', prompt, answer: area, answerDen: 1 };
        }
      }
    },
    check(body) {
      const { answer: expected } = body;
      const userNum = parseFloat((body.userAnswer || '').replace(/[°\s]/g, ''));
      const correct = !isNaN(userNum) && Math.abs(userNum - expected) < 0.5;
      return { correct, display: String(expected), message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  coordgeom: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const id = Date.now();

      if (difficulty === 'easy') {
        // Foundations: midpoint, reflection, translation
        const subType = triPick(['midpoint', 'reflection', 'translation']);

        if (subType === 'midpoint') {
          const x1 = triRand(-8, 8); const y1 = triRand(-8, 8);
          const x2 = x1 + 2 * triRand(-4, 4); const y2 = y1 + 2 * triRand(-4, 4);
          const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2;
          const prompt = `Find the midpoint of (${x1}, ${y1}) and (${x2}, ${y2})`;
          return { id, difficulty, type: 'coord', prompt, ansX: mx, ansY: my, display: `(${mx}, ${my})`, points: [{x:x1, y:y1}, {x:x2, y:y2}] };
        }
        else if (subType === 'reflection') {
          const axis = triPick(['x-axis', 'y-axis']);
          const x1 = triRand(-8, 8); const y1 = triRand(-8, 8);
          let ansX = x1, ansY = y1;
          if (axis === 'x-axis') ansY = -y1;
          else ansX = -x1;
          const prompt = `Reflect (${x1}, ${y1}) across the ${axis}`;
          return { id, difficulty, type: 'coord', prompt, ansX, ansY, display: `(${ansX}, ${ansY})`, points: [{x:x1, y:y1}] };
        }
        else { // translation
          const x1 = triRand(-6, 6); const y1 = triRand(-6, 6);
          const dx = triRand(-4, 4); const dy = triRand(-4, 4);
          const ansX = x1 + dx; const ansY = y1 + dy;
          const vector = `<${dx}, ${dy}>`;
          const prompt = `Translate (${x1}, ${y1}) by the vector ${vector}`;
          return { id, difficulty, type: 'coord', prompt, ansX, ansY, display: `(${ansX}, ${ansY})`, points: [{x:x1, y:y1}] };
        }
      }
      else if (difficulty === 'medium') {
        // Lengths: distance, distance to origin
        const subType = triPick(['distance', 'distance_origin']);
        const triples = [[3,4,5],[5,12,13],[8,15,17],[6,8,10],[9,12,15]];

        if (subType === 'distance_origin') {
          const [dx, dy, dist] = triPick(triples);
          const sx = triPick([1, -1]); const sy = triPick([1, -1]);
          const x1 = sx * dx; const y1 = sy * dy;
          const prompt = `Find the distance from (${x1}, ${y1}) to the origin`;
          return { id, difficulty, type: 'scalar', prompt, answer: dist, display: String(dist), points: [{x:x1, y:y1}, {x:0, y:0}] };
        }
        else { // distance
          const [dx, dy, dist] = triPick(triples);
          const x1 = triRand(-5, 5); const y1 = triRand(-5, 5);
          const sx = triPick([1, -1]); const sy = triPick([1, -1]);
          const x2 = x1 + sx * dx; const y2 = y1 + sy * dy;
          const prompt = `Find the distance between (${x1}, ${y1}) and (${x2}, ${y2})`;
          return { id, difficulty, type: 'scalar', prompt, answer: dist, display: String(dist), points: [{x:x1, y:y1}, {x:x2, y:y2}] };
        }
      }
      else if (difficulty === 'hard') {
        // Slopes & Eqs: gradient, equation_line
        const subType = triPick(['gradient', 'equation_line']);

        const x1 = triRand(-6, 6); const y1 = triRand(-6, 6);
        const dx = triRand(1, 6) * triPick([1, -1]);
        const dy = triRand(-6, 6);
        const x2 = x1 + dx; const y2 = y1 + dy;
        const g = gcd(Math.abs(dy), Math.abs(dx));
        const mNum = dy / g * (dx < 0 ? -1 : 1);
        const mDen = Math.abs(dx) / g;

        if (subType === 'gradient') {
          const display = mDen === 1 ? String(mNum) : `${mNum}/${mDen}`;
          const prompt = `Find the gradient (slope) of the line through (${x1}, ${y1}) and (${x2}, ${y2})`;
          return { id, difficulty, type: 'fraction', prompt, ansNum: mNum, ansDen: mDen, display, points: [{x:x1, y:y1}, {x:x2, y:y2}] };
        }
        else { // equation_line
          const cNum = y1 * mDen - mNum * x1;
          const cDen = mDen;
          const cG = gcd(Math.abs(cNum), Math.abs(cDen));
          const cN = cNum / cG * (cDen < 0 ? -1 : 1);
          const cD = Math.abs(cDen) / cG;

          const mStr = mDen === 1 ? String(mNum) : (mNum < 0 ? `-${Math.abs(mNum)}/${mDen}` : `${mNum}/${mDen}`);
          const cStr = cD === 1 ? String(cN) : (cN < 0 ? `-${Math.abs(cN)}/${cD}` : `${cN}/${cD}`);
          let eqStr = `y=${mStr}x`;
          if (cN > 0) eqStr += `+${cStr}`;
          else if (cN < 0) eqStr += cStr;

          const prompt = `Find the equation of the line through (${x1}, ${y1}) and (${x2}, ${y2}). Format: y=mx+c`;
          return { id, difficulty, type: 'equation', prompt, ansMNum: mNum, ansMDen: mDen, ansCNum: cN, ansCDen: cD, display: eqStr, points: [{x:x1, y:y1}, {x:x2, y:y2}] };
        }
      }
      else {
        // Advanced: perp_bisector, area_triangle
        const subType = triPick(['perp_bisector', 'area_triangle']);

        if (subType === 'area_triangle') {
          const x1 = triRand(-8, 8); const y1 = triRand(-8, 8);
          const x2 = triRand(-8, 8); const y2 = triRand(-8, 8);
          const x3 = triRand(-8, 8); const y3 = triRand(-8, 8);
          const area = Math.abs((x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2)) / 2);
          const prompt = `Find the area of the triangle with vertices (${x1}, ${y1}), (${x2}, ${y2}), (${x3}, ${y3})`;
          return { id, difficulty, type: 'scalar', prompt, answer: area, display: String(area), points: [{x:x1, y:y1}, {x:x2, y:y2}, {x:x3, y:y3}] };
        }
        else { // perp_bisector
          const x1 = triRand(-6, 6); const y1 = triRand(-6, 6);
          const dx = triRand(1, 4) * triPick([1, -1]);
          const dy = triRand(1, 4) * triPick([1, -1]);
          const x2 = x1 + 2 * dx; const y2 = y1 + 2 * dy;

          const perpNum = -dx;
          const perpDen = dy;
          const g = gcd(Math.abs(perpNum), Math.abs(perpDen));
          const mNum = perpNum / g * (perpDen < 0 ? -1 : 1);
          const mDen = Math.abs(perpDen) / g;
          const prompt = `Find the gradient of the perpendicular bisector of (${x1}, ${y1}) and (${x2}, ${y2})`;
          const display = mDen === 1 ? String(mNum) : `${mNum}/${mDen}`;
          return { id, difficulty, type: 'fraction', prompt, ansNum: mNum, ansDen: mDen, display, points: [{x:x1, y:y1}, {x:x2, y:y2}] };
        }
      }
    },
    check(body) {
      const { type } = body;
      const userStr = (body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
      let correct = false;

      if (type === 'coord') {
        const m = userStr.replace(/[()]/g, '').split(',');
        if (m.length === 2) {
          correct = parseFloat(m[0]) === body.ansX && parseFloat(m[1]) === body.ansY;
        }
      }
      else if (type === 'scalar') {
        const userNum = parseFloat(userStr);
        correct = !isNaN(userNum) && Math.abs(userNum - body.answer) < 0.01;
      }
      else if (type === 'fraction') {
        const { ansNum, ansDen } = body;
        const fracMatch = userStr.match(/^(-?\d+)\/(-?\d+)$/);
        let uNum, uDen;
        if (fracMatch) { uNum = parseInt(fracMatch[1]); uDen = parseInt(fracMatch[2]); }
        else { const n = parseFloat(userStr); if (!isNaN(n) && Number.isInteger(n)) { uNum = n; uDen = 1; } }
        if (uNum !== undefined && uDen !== undefined && uDen !== 0) {
          const us = simplifyFraction(uNum, uDen);
          const es = simplifyFraction(ansNum, ansDen);
          correct = us.num === es.num && us.den === es.den;
        }
      }
      else if (type === 'equation') {
        const { ansMNum, ansMDen, ansCNum, ansCDen } = body;
        const eqMatch = userStr.match(/^y=(-?\d+(?:\/-?\d+)?)x([+-]\d+(?:\/\d+)?)?$/);
        if (eqMatch) {
          let mStr = eqMatch[1];
          let cStr = eqMatch[2] || "+0";

          const parseFrac = (str) => {
            const parts = str.replace('+','').split('/');
            if (parts.length === 1) return { num: parseInt(parts[0]), den: 1 };
            return simplifyFraction(parseInt(parts[0]), parseInt(parts[1]));
          };

          const uM = parseFrac(mStr);
          const uC = parseFrac(cStr);
          const eM = simplifyFraction(ansMNum, ansMDen);
          const eC = simplifyFraction(ansCNum, ansCDen);

          correct = uM.num === eM.num && uM.den === eM.den && uC.num === eC.num && uC.den === eC.den;
        }
      }

      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  circle: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const id = Date.now();

      if (difficulty === 'easy') {
        // Angle in semicircle = 90°
        const a = triRand(20, 70);
        const b = 90 - a;
        const prompt = `Triangle inscribed in semicircle. One angle at circumference = ${a}°. Find the other angle at circumference.`;
        return { id, difficulty, type: 'semicircle', prompt, answer: b, display: `${b}°` };
      }
      else if (difficulty === 'medium') {
        // Angle at centre = 2 × angle at circumference
        const circumAngle = triRand(20, 80);
        const centreAngle = 2 * circumAngle;
        const subtype = triPick(['find_centre', 'find_circum']);
        if (subtype === 'find_centre') {
          const prompt = `Angle at circumference = ${circumAngle}°. Find the angle at the centre subtended by the same arc.`;
          return { id, difficulty, type: 'centre_circum', prompt, answer: centreAngle, display: `${centreAngle}°` };
        } else {
          const prompt = `Angle at centre = ${centreAngle}°. Find the angle at the circumference subtended by the same arc.`;
          return { id, difficulty, type: 'centre_circum', prompt, answer: circumAngle, display: `${circumAngle}°` };
        }
      }
      else if (difficulty === 'hard') {
        // Cyclic quadrilateral: opposite angles sum to 180°
        const a = triRand(40, 140);
        const c = 180 - a;
        const b = triRand(40, 140);
        const d = 180 - b;
        const subtype = triPick(['find_opp_a', 'find_opp_b']);
        if (subtype === 'find_opp_a') {
          const prompt = `Cyclic quadrilateral ABCD. Angle A = ${a}°. Find angle C.`;
          return { id, difficulty, type: 'cyclic', prompt, answer: c, display: `${c}°` };
        } else {
          const prompt = `Cyclic quadrilateral ABCD. Angle B = ${b}°. Find angle D.`;
          return { id, difficulty, type: 'cyclic', prompt, answer: d, display: `${d}°` };
        }
      }
      else {
        // Tangent perpendicular to radius; alternate segment theorem
        const subtype = triPick(['tangent_radius', 'alternate_segment']);
        if (subtype === 'tangent_radius') {
          const angle = triRand(15, 75);
          const answer = 90 - angle;
          const prompt = `Tangent meets radius at point P. Angle between tangent and chord = ${angle}°. Find the angle between radius and chord.`;
          return { id, difficulty, type: 'tangent', prompt, answer, display: `${answer}°` };
        } else {
          const angle = triRand(20, 80);
          const prompt = `Alternate segment theorem: angle between tangent and chord = ${angle}°. Find the angle in the alternate segment.`;
          return { id, difficulty, type: 'alt_segment', prompt, answer: angle, display: `${angle}°` };
        }
      }
    },
    check(body) {
      const userNum = parseFloat((body.userAnswer || '').replace(/[°\s]/g, ''));
      const correct = !isNaN(userNum) && Math.abs(userNum - body.answer) < 0.5;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  pythag: {
    question(difficulty, query = {}) {
      const diff = difficulty || 'easy';
      const qIdx = Math.max(0, parseInt(query.q, 10) || 0);
      let prompt, answer, display;

      if (diff === 'easy') {
        // Find hypotenuse given two legs — gradual size progression
        const pool = pythagPoolForIndex(qIdx);
        const t = pool.triples[randInt(0, pool.triples.length - 1)];
        const k = randInt(1, pool.maxK);
        const a = t[0] * k, b = t[1] * k, c = t[2] * k;
        answer = c;
        display = answer + ' cm';
        prompt = `A right-angled triangle has legs ${a} cm and ${b} cm. Find the hypotenuse.`;
      } else if (diff === 'medium') {
        // Find a leg given hypotenuse and one leg — also tiered by question index
        const pool = pythagPoolForIndex(qIdx);
        const t = pool.triples[randInt(0, pool.triples.length - 1)];
        const k = randInt(1, pool.maxK);
        const a = t[0] * k, b = t[1] * k, c = t[2] * k;
        const pick = randInt(0, 1);
        if (pick === 0) {
          answer = a;
          display = answer + ' cm';
          prompt = `A right-angled triangle has hypotenuse ${c} cm and one leg ${b} cm. Find the other leg.`;
        } else {
          answer = b;
          display = answer + ' cm';
          prompt = `A right-angled triangle has hypotenuse ${c} cm and one leg ${a} cm. Find the other leg.`;
        }
      } else if (diff === 'hard') {
        // Word problem: ladder against wall
        const t = PYTH_TRIPLES[randInt(0, 5)];
        const k = randInt(1, 2);
        const base = t[0] * k, height = t[1] * k, ladder = t[2] * k;
        const pick = randInt(0, 1);
        if (pick === 0) {
          answer = height;
          display = answer + ' m';
          prompt = `A ${ladder} m ladder leans against a wall. Its base is ${base} m from the wall. How high up the wall does it reach?`;
        } else {
          answer = base;
          display = answer + ' m';
          prompt = `A ${ladder} m ladder reaches ${height} m up a wall. How far is the base of the ladder from the wall?`;
        }
      } else {
        // 3D Pythagoras: space diagonal of cuboid
        // Use triples that nest: e.g. 3,4,5 then diagonal = √(3²+4²+5²) — not always clean
        // Instead: pick a,b,c so a²+b²+c² is a perfect square
        const combos = [[1,2,2,3],[2,3,6,7],[2,6,9,11],[1,4,8,9],[4,4,7,9],[2,4,4,6],[3,6,6,9],[6,6,7,11],[1,2,14,15]];
        // Actually simpler: use nested Pythagoras. floor diagonal d = √(a²+b²), then space = √(d²+c²)
        // Pick a triple for floor: (3,4,5), then space with c: (5,12,13) → a=3,b=4,c=12, space=13
        const nested = [
          { a: 3, b: 4, c: 12, space: 13 },
          { a: 6, b: 8, c: 24, space: 26 },
          { a: 5, b: 12, c: 84, space: 85 },
          { a: 1, b: 2, c: 2, space: 3 },
          { a: 2, b: 4, c: 4, space: 6 },
          { a: 2, b: 3, c: 6, space: 7 },
        ];
        const pick = nested[randInt(0, nested.length - 1)];
        answer = pick.space;
        display = answer + ' cm';
        prompt = `A cuboid has dimensions ${pick.a} cm × ${pick.b} cm × ${pick.c} cm. Find the length of the space diagonal.`;
      }

      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/[^\d.\-]/g, ''));
      const correct = !isNaN(ua) && Math.abs(ua - body.answer) < 0.5;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  heron: {
    question(difficulty) {
      return heronQuestion(difficulty || 'easy');
    },
    check(body) {
      const { answer, display } = body;
      const userStr = (body.userAnswer || '').trim();
      const userNum = parseFloat(userStr);
      const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.5;
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  mensur: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = Date.now();
      let answer, prompt, display;
      if (diff === 'easy') {
        const shape = pick(['rectangle', 'triangle', 'parallelogram']);
        const a = rand(3, 15); const b = rand(3, 15);
        let displayEq;
        if (shape === 'rectangle') { answer = a * b; prompt = `Area of rectangle: length = ${a}, width = ${b}`; displayEq = `${a} × ${b} = ${answer}`; }
        else if (shape === 'triangle') { answer = a * b / 2; prompt = `Area of triangle: base = ${a}, height = ${b}`; displayEq = `½ × ${a} × ${b} = ${answer}`; }
        else { answer = a * b; prompt = `Area of parallelogram: base = ${a}, height = ${b}`; displayEq = `${a} × ${b} = ${answer}`; }
        return { id, difficulty: diff, type: 'area_2d', prompt, answer, display: displayEq };
      } else if (diff === 'medium') {
        const r = rand(2, 12);
        const subtype = pick(['area', 'circumference']);
        let displayEq;
        if (subtype === 'area') {
          answer = Math.round(Math.PI * r * r * 100) / 100;
          prompt = `Area of circle with radius ${r} (to 2 d.p., use π = 3.14159...)`;
          displayEq = `π × ${r}² = ${answer}`;
        } else {
          answer = Math.round(2 * Math.PI * r * 100) / 100;
          prompt = `Circumference of circle with radius ${r} (to 2 d.p.)`;
          displayEq = `2 × π × ${r} = ${answer}`;
        }
        return { id, difficulty: diff, type: 'circle', prompt, answer, display: displayEq };
      } else if (diff === 'hard') {
        const shape = pick(['cylinder', 'cone', 'sphere']);
        const r = rand(2, 8);
        let displayEq;
        if (shape === 'cylinder') {
          const h = rand(3, 12);
          answer = Math.round(Math.PI * r * r * h * 100) / 100;
          prompt = `Volume of cylinder: radius = ${r}, height = ${h} (2 d.p.)`;
          displayEq = `π × ${r}² × ${h} = ${answer}`;
        } else if (shape === 'cone') {
          const h = rand(3, 12);
          answer = Math.round(Math.PI * r * r * h / 3 * 100) / 100;
          prompt = `Volume of cone: radius = ${r}, height = ${h} (2 d.p.)`;
          displayEq = `⅓ × π × ${r}² × ${h} = ${answer}`;
        } else {
          answer = Math.round(4/3 * Math.PI * r * r * r * 100) / 100;
          prompt = `Volume of sphere with radius ${r} (2 d.p.)`;
          displayEq = `⁴⁄₃ × π × ${r}³ = ${answer}`;
        }
        return { id, difficulty: diff, type: 'volume', prompt, answer, display: displayEq };
      } else {
        const shape = pick(['cylinder', 'sphere']);
        const r = rand(2, 8);
        let displayEq;
        if (shape === 'cylinder') {
          const h = rand(3, 12);
          answer = Math.round(2 * Math.PI * r * (r + h) * 100) / 100;
          prompt = `Total surface area of cylinder: radius = ${r}, height = ${h} (2 d.p.)`;
          displayEq = `2 × π × ${r} × (${r} + ${h}) = ${answer}`;
        } else {
          answer = Math.round(4 * Math.PI * r * r * 100) / 100;
          prompt = `Surface area of sphere with radius ${r} (2 d.p.)`;
          displayEq = `4 × π × ${r}² = ${answer}`;
        }
        return { id, difficulty: diff, type: 'surface_area', prompt, answer, display: displayEq };
      }
    },
    check(body) {
      const userNum = parseFloat((body.userAnswer || '').replace(/\s+/g, ''));
      const correct = !isNaN(userNum) && Math.abs(userNum - body.answer) < 0.5;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  bearings: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      const id = Date.now();
      if (diff === 'easy') {
        const dirs = [
          { name: 'North', bearing: 0 }, { name: 'East', bearing: 90 },
          { name: 'South', bearing: 180 }, { name: 'West', bearing: 270 },
          { name: 'North-East', bearing: 45 }, { name: 'South-East', bearing: 135 },
          { name: 'South-West', bearing: 225 }, { name: 'North-West', bearing: 315 },
          { name: 'North-North-East', bearing: 23 }, { name: 'East-North-East', bearing: 68 },
          { name: 'East-South-East', bearing: 113 }, { name: 'South-South-East', bearing: 158 },
          { name: 'South-South-West', bearing: 203 }, { name: 'West-South-West', bearing: 248 },
          { name: 'West-North-West', bearing: 293 }, { name: 'North-North-West', bearing: 338 },
        ];
        const d = pick(dirs); const qType = Math.random();
        let prompt, answer;
        if (qType < 0.5) {
          prompt = `What is the three-figure bearing of ${d.name}?`; answer = d.bearing;
        } else if (qType < 0.75) {
          const opp = (d.bearing + 180) % 360;
          prompt = `What is the bearing directly opposite ${d.name}?`; answer = opp;
        } else {
          const turned = (d.bearing + 90) % 360;
          prompt = `Face ${d.name} and turn 90° clockwise. What bearing are you now facing?`; answer = turned;
        }
        const display = String(answer).padStart(3, '0');
        return { id, difficulty: diff, type: 'compass', prompt, answer, display };
      } else if (diff === 'medium') {
        const bearing = rand(0, 359); const back = (bearing + 180) % 360;
        const fmtB = (b) => String(b).padStart(3, '0');
        return { id, difficulty: diff, type: 'back_bearing', prompt: `The bearing from A to B is ${fmtB(bearing)}°. Find the bearing from B to A.`, answer: back, display: fmtB(back) };
      } else if (diff === 'hard') {
        let dx = rand(-10, 10); const dy = rand(-10, 10);
        if (dx === 0 && dy === 0) dx = 1; // avoid zero vector
        let angle = Math.atan2(dx, dy) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        const bearing = Math.round(angle);
        const fmtB = (b) => String(b).padStart(3, '0');
        return { id, difficulty: diff, type: 'from_coords', prompt: `A is at origin. B is ${Math.abs(dx)} units ${dx >= 0 ? 'East' : 'West'} and ${Math.abs(dy)} units ${dy >= 0 ? 'North' : 'South'}. Bearing of B from A?`, answer: bearing, display: fmtB(bearing) };
      } else {
        const bearing = rand(0, 359); const distance = rand(5, 50);
        const rad = bearing * Math.PI / 180;
        const east = Math.round(distance * Math.sin(rad) * 10) / 10;
        const fmtB = (b) => String(b).padStart(3, '0');
        return { id, difficulty: diff, type: 'distance_component', prompt: `Walking ${distance}m on bearing ${fmtB(bearing)}°. How far East? (to 1 decimal place)`, answer: east, display: String(east) };
      }
    },
    check(body) {
      const userStr = (body.userAnswer || '').replace(/[°\s]/g, '').replace(/−/g, '-');
      const userNum = parseFloat(userStr);
      const correct = !isNaN(userNum) && Math.abs(userNum - body.answer) < 1;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  angles: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const a = randInt(25, 155);
        answer = 180 - a; display = answer + '°';
        prompt = `Two angles on a straight line are ${a}° and x°. Find x.`;
      } else if (diff === 'medium') {
        const a = randInt(40, 120); const b = randInt(40, 120); const c = randInt(40, 120);
        answer = 360 - a - b - c;
        if (answer < 10) { answer += 60; }
        const cAdj = 360 - a - b - answer;
        display = answer + '°';
        prompt = `Four angles meet at a point: ${a}°, ${b}°, ${cAdj}°, and x°. Find x.`;
      } else if (diff === 'hard') {
        const a = randInt(30, 150); const vertOpp = a; const adj = 180 - a;
        const p = randInt(0, 1);
        if (p === 0) {
          prompt = `Two straight lines cross. One angle is ${a}°. Find the vertically opposite angle.`; answer = vertOpp;
        } else {
          prompt = `Two straight lines cross. One angle is ${a}°. Find the adjacent angle.`; answer = adj;
        }
        display = answer + '°';
      } else {
        const angle = randInt(30, 150); const type = randInt(0, 2);
        if (type === 0) {
          prompt = `Two parallel lines are cut by a transversal. One alternate angle is ${angle}°. Find the other alternate angle.`; answer = angle;
        } else if (type === 1) {
          prompt = `Two parallel lines are cut by a transversal. One corresponding angle is ${angle}°. Find the other corresponding angle.`; answer = angle;
        } else {
          prompt = `Two parallel lines are cut by a transversal. One co-interior angle is ${angle}°. Find the other co-interior angle.`; answer = 180 - angle;
        }
        display = answer + '°';
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/[°\s]/g, ''));
      const correct = !isNaN(ua) && Math.abs(ua - body.answer) < 0.5;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  triangles: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const a = randInt(20, 80); const b = randInt(20, 140 - a);
        answer = 180 - a - b; display = answer + '°';
        prompt = `A triangle has angles ${a}° and ${b}°. Find the third angle.`;
      } else if (diff === 'medium') {
        const apex = randInt(20, 140);
        if ((180 - apex) % 2 !== 0) {
          answer = (180 - (apex + 1)) / 2;
          const apexUse = apex + 1;
          display = answer + '°';
          prompt = `An isosceles triangle has an apex angle of ${apexUse}°. Find each base angle.`;
        } else {
          answer = (180 - apex) / 2;
          display = answer + '°';
          prompt = `An isosceles triangle has an apex angle of ${apex}°. Find each base angle.`;
        }
      } else if (diff === 'hard') {
        const a = randInt(25, 75); const b = randInt(25, 75);
        answer = a + b; display = answer + '°';
        prompt = `Two interior angles of a triangle are ${a}° and ${b}°. Find the exterior angle at the third vertex.`;
      } else {
        const extraAngle = randInt(20, 70);
        answer = 180 - 60 - extraAngle; display = answer + '°';
        prompt = `In triangle ABD, angle A = 60° (equilateral triangle ABC shares side AB). If angle ABD = ${60 + extraAngle}°, find angle ADB.`;
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/[°\s]/g, ''));
      const correct = !isNaN(ua) && Math.abs(ua - body.answer) < 0.5;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  congruence: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const sides = [randInt(3, 12), randInt(3, 12), randInt(3, 12)];
        const idx = randInt(0, 2);
        answer = sides[idx]; display = String(answer) + ' cm';
        const labels1 = ['AB', 'BC', 'CA']; const labels2 = ['PQ', 'QR', 'RP'];
        prompt = `△ABC ≅ △PQR. ${labels1.filter((_, i) => i !== idx).map((l, i) => `${l} = ${sides.filter((_, j) => j !== idx)[i]} cm`).join(', ')}, and ${labels2[idx]} = ${sides[idx]} cm. Find ${labels1[idx]}.`;
      } else if (diff === 'medium') {
        const a1 = randInt(30, 80); const a2 = randInt(30, 130 - a1); const a3 = 180 - a1 - a2;
        const angles = [a1, a2, a3]; const idx = randInt(0, 2);
        answer = angles[idx]; display = answer + '°';
        const labels1 = ['A', 'B', 'C']; const labels2 = ['P', 'Q', 'R'];
        prompt = `△ABC ≅ △PQR. Angle ${labels2[idx]} = ${angles[idx]}°. Find angle ${labels1[idx]}.`;
      } else if (diff === 'hard') {
        const rules = [
          { info: 'Three sides of one triangle equal three sides of another', answer: 'SSS' },
          { info: 'Two sides and the included angle of one triangle equal those of another', answer: 'SAS' },
          { info: 'Two angles and the included side of one triangle equal those of another', answer: 'ASA' },
          { info: 'A right angle, the hypotenuse, and one other side are equal in both triangles', answer: 'RHS' },
        ];
        const chosen = rules[randInt(0, rules.length - 1)];
        answer = chosen.answer; display = answer;
        prompt = `${chosen.info}. Which congruence condition is this? (SSS, SAS, ASA, or RHS)`;
      } else {
        const shared = randInt(4, 10); const sideA = randInt(3, 9);
        answer = sideA; display = answer + ' cm';
        prompt = `In the figure, △ABD ≅ △CBD (by SAS). AB = ${sideA} cm and BD = ${shared} cm. Find CB.`;
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = (body.userAnswer || '').trim().replace(/[°\s]/g, '').toUpperCase();
      const ans = String(body.answer).replace(/[°\s]/g, '').toUpperCase();
      const correct = ua === ans || parseFloat(ua) === parseFloat(ans);
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  polygons: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const n = [4, 5, 6, 7, 8, 10][randInt(0, 5)];
        answer = (n - 2) * 180; display = answer + '°';
        prompt = `Find the sum of interior angles of a ${POLYGON_NAMES[n] || n + '-sided polygon'}.`;
      } else if (diff === 'medium') {
        const n = [3, 4, 5, 6, 8, 9, 10, 12][randInt(0, 7)];
        answer = (n - 2) * 180 / n; display = answer + '°';
        prompt = `Find each interior angle of a regular ${POLYGON_NAMES[n] || n + '-sided polygon'}.`;
      } else if (diff === 'hard') {
        const n = [5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 36][randInt(0, 10)];
        const ext = 360 / n;
        answer = n; display = String(n) + ' sides';
        prompt = `A regular polygon has each exterior angle equal to ${ext}°. How many sides does it have?`;
      } else {
        const n = [5, 6, 7, 8, 9, 10, 12][randInt(0, 6)];
        answer = n * (n - 3) / 2; display = String(answer);
        prompt = `How many diagonals does a ${POLYGON_NAMES[n] || n + '-sided polygon'} have?`;
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/[°\s]/g, ''));
      const correct = !isNaN(ua) && Math.abs(ua - body.answer) < 0.5;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  similarity: {
    question(difficulty) {
      const diff = difficulty || 'easy';
      let prompt, answer, display;
      if (diff === 'easy') {
        const k = randInt(2, 5); const a = randInt(3, 10); const b = randInt(3, 10);
        answer = b * k; display = answer + ' cm';
        prompt = `△ABC is similar to △PQR. AB = ${a} cm, BC = ${b} cm, PQ = ${a * k} cm. Find QR.`;
      } else if (diff === 'medium') {
        const small = randInt(4, 10); const big = small * randInt(2, 4); const otherSmall = randInt(3, 8);
        const ansNum = otherSmall * big; const ansDen = small;
        const g = gcd(Math.abs(ansNum), ansDen);
        const rn = ansNum / g; const rd = ansDen / g;
        answer = Math.round((rd === 1 ? rn : rn / rd) * 100) / 100;
        display = answer + ' cm';
        prompt = `Two similar triangles have corresponding sides ${small} cm and ${big} cm. If another side of the smaller triangle is ${otherSmall} cm, find the corresponding side of the larger triangle.`;
      } else if (diff === 'hard') {
        const k = randInt(2, 5); const areaSmall = randInt(5, 30); const areaLarge = areaSmall * k * k;
        answer = areaLarge; display = answer + ' cm²';
        prompt = `Two similar figures have a length ratio of 1:${k}. The smaller figure has area ${areaSmall} cm². Find the area of the larger figure.`;
      } else {
        const k = randInt(2, 4); const volSmall = randInt(5, 25); const volLarge = volSmall * k * k * k;
        answer = volLarge; display = answer + ' cm³';
        prompt = `Two similar solids have a length ratio of 1:${k}. The smaller solid has volume ${volSmall} cm³. Find the volume of the larger solid.`;
      }
      return { prompt, answer, display, difficulty: diff };
    },
    check(body) {
      const ua = parseFloat((body.userAnswer || '').replace(/[^\d.\-]/g, ''));
      const correct = !isNaN(ua) && Math.abs(ua - body.answer) < 0.5;
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  invtrig: {
    question(difficulty) {
      return invtrigQuestion(difficulty || 'easy');
    },
    check(body) {
      const { answer, display } = body;
      const userNum = parseFloat((body.userAnswer || '').trim());
      const correct = !isNaN(userNum) && Math.abs(userNum - answer) < 0.5;
      return { correct, display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

};

router.get('/question', (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.question(req.query.difficulty, req.query));
});

router.post('/check', require('express').json(), (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.check(req.body || {}));
});

module.exports = router;
