'use strict';
const router = require('express').Router();

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
const randInt = randomInt;
function rand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a; }

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
  res.json(gen.question(req.query.difficulty));
});

router.post('/check', require('express').json(), (req, res) => {
  const topic = req.baseUrl.replace('-api', '').slice(1);
  const gen = generators[topic];
  if (!gen) return res.status(404).json({ error: 'Unknown topic' });
  res.json(gen.check(req.body || {}));
});

module.exports = router;
