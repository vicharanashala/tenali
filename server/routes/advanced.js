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
function triRand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function triPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildOptions(correctText, distractors) {
  const seen = new Set([String(correctText)]);
  const cleaned = [];
  for (const d of distractors) {
    const s = String(d);
    if (!seen.has(s)) { seen.add(s); cleaned.push(s); }
    if (cleaned.length >= 3) break;
  }
  let pad = 1;
  while (cleaned.length < 3) {
    const filler = `${correctText}_${pad++}`;
    if (!seen.has(filler)) { seen.add(filler); cleaned.push(filler); }
  }
  const all = shuffleArray([{ text: String(correctText), correct: true }, ...cleaned.slice(0, 3).map(t => ({ text: t, correct: false }))]);
  const labels = ['A', 'B', 'C', 'D'];
  const options = all.map((o, i) => ({ option: labels[i], text: o.text }));
  const correctOption = labels[all.findIndex(o => o.correct)];
  return { options, correctOption, correctDisplay: String(correctText) };
}

function mcCheckResult(body) {
  const b = body || {};
  const correct = !!b.selectedOption && b.selectedOption === b.correctOption;
  return { correct, correctOption: b.correctOption, correctDisplay: b.correctDisplay, message: correct ? 'Correct!' : 'Incorrect' };
}

const generators = {

  vectors: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const id = Date.now();

      if (difficulty === 'easy') {
        const a = [triRand(-8,8), triRand(-8,8)];
        const b = [triRand(-8,8), triRand(-8,8)];
        const ans = [a[0]+b[0], a[1]+b[1]];
        const prompt = `a = (${a[0]}, ${a[1]}), b = (${b[0]}, ${b[1]}). Find a + b.`;
        return { id, difficulty, type: 'add', prompt, ansX: ans[0], ansY: ans[1], display: `(${ans[0]}, ${ans[1]})`, answer: `(${ans[0]}, ${ans[1]})` };
      }
      else if (difficulty === 'medium') {
        let k = triRand(-3, 5); if (k === 0) k = 2;
        const a = [triRand(-6,6), triRand(-6,6)];
        const ans = [k*a[0], k*a[1]];
        const prompt = `a = (${a[0]}, ${a[1]}). Find ${k}a.`;
        return { id, difficulty, type: 'scalar', prompt, ansX: ans[0], ansY: ans[1], display: `(${ans[0]}, ${ans[1]})`, answer: `(${ans[0]}, ${ans[1]})` };
      }
      else if (difficulty === 'hard') {
        const triples = [[3,4,5],[5,12,13],[8,15,17],[6,8,10]];
        const [x, y, mag] = triPick(triples);
        const sx = triPick([1,-1]); const sy = triPick([1,-1]);
        const prompt = `Find |v| where v = (${sx*x}, ${sy*y})`;
        return { id, difficulty, type: 'magnitude', prompt, answer: mag, display: String(mag) };
      }
      else {
        const x1 = triRand(-8,8); const y1 = triRand(-8,8);
        const x2 = triRand(-8,8); const y2 = triRand(-8,8);
        const prompt = `A = (${x1}, ${y1}), B = (${x2}, ${y2}). Find vector AB.`;
        return { id, difficulty, type: 'position', prompt, ansX: x2-x1, ansY: y2-y1, display: `(${x2-x1}, ${y2-y1})`, answer: `(${x2-x1}, ${y2-y1})` };
      }
    },
    check(body) {
      const { type } = body;
      const userStr = (body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
      let correct = false;

      if (type === 'magnitude') {
        const userNum = parseFloat(userStr);
        correct = !isNaN(userNum) && Math.abs(userNum - body.answer) < 0.5;
      } else {
        const m = userStr.replace(/[()]/g, '').split(',');
        if (m.length === 2) {
          correct = parseInt(m[0]) === body.ansX && parseInt(m[1]) === body.ansY;
        }
      }

      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  transform: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const id = Date.now();
      const x = triRand(-8, 8); const y = triRand(-8, 8);

      if (difficulty === 'easy') {
        const axis = triPick(['x-axis', 'y-axis']);
        const ansX = axis === 'y-axis' ? -x : x;
        const ansY = axis === 'x-axis' ? -y : y;
        const prompt = `Reflect (${x}, ${y}) in the ${axis}`;
        return { id, difficulty, type: 'reflect', prompt, ansX, ansY, display: `(${ansX}, ${ansY})`, answer: `(${ansX}, ${ansY})` };
      }
      else if (difficulty === 'medium') {
        const dx = triRand(-6, 6); const dy = triRand(-6, 6);
        const prompt = `Translate (${x}, ${y}) by vector (${dx}, ${dy})`;
        return { id, difficulty, type: 'translate', prompt, ansX: x + dx, ansY: y + dy, display: `(${x+dx}, ${y+dy})`, answer: `(${x+dx}, ${y+dy})` };
      }
      else if (difficulty === 'hard') {
        const angle = triPick([90, 180, 270]);
        let ansX, ansY;
        if (angle === 90) { ansX = -y; ansY = x; }
        else if (angle === 180) { ansX = -x; ansY = -y; }
        else { ansX = y; ansY = -x; }
        const prompt = `Rotate (${x}, ${y}) by ${angle}° anticlockwise about the origin`;
        return { id, difficulty, type: 'rotate', prompt, ansX, ansY, display: `(${ansX}, ${ansY})`, answer: `(${ansX}, ${ansY})` };
      }
      else {
        const sf = triPick([2, 3, -1, -2, 0.5]);
        const ansX = x * sf; const ansY = y * sf;
        const sfStr = sf === 0.5 ? '1/2' : String(sf);
        const prompt = `Enlarge (${x}, ${y}) by scale factor ${sfStr} from the origin`;
        return { id, difficulty, type: 'enlarge', prompt, ansX, ansY, display: `(${ansX}, ${ansY})`, answer: `(${ansX}, ${ansY})` };
      }
    },
    check(body) {
      const userStr = (body.userAnswer || '').replace(/\s+/g, '').replace(/−/g, '-');
      const m = userStr.replace(/[()]/g, '').split(',');
      let correct = false;
      if (m.length === 2) {
        correct = parseFloat(m[0]) === body.ansX && parseFloat(m[1]) === body.ansY;
      }
      return { correct, display: body.display, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

  linearalgebra: {
    question(difficulty) {
      difficulty = difficulty || 'easy';
      const id = Date.now();
      const ri = (lo, hi) => randomInt(lo, hi);
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const fv = (...c) => `(${c.join(', ')})`;
      const fm = (m) => `[${m[0][0]},${m[0][1]};${m[1][0]},${m[1][1]}]`;
      const rnd2 = (x) => Math.round(x * 100) / 100;
      let q;

      const easyGens = [
        () => { const u=[ri(-9,9),ri(-9,9)],v=[ri(-9,9),ri(-9,9)],r=[u[0]+v[0],u[1]+v[1]]; return {type:'vec_add',answerType:'vector',prompt:`Find u + v where u = ${fv(...u)} and v = ${fv(...v)}`,answer:fv(...r),display:fv(...r),data:{u,v}}; },
        () => { const u=[ri(-9,9),ri(-9,9)],v=[ri(-9,9),ri(-9,9)],r=[u[0]-v[0],u[1]-v[1]]; return {type:'vec_sub',answerType:'vector',prompt:`Find u − v where u = ${fv(...u)} and v = ${fv(...v)}`,answer:fv(...r),display:fv(...r),data:{u,v}}; },
        () => { let k=ri(-5,5); if(k===0)k=2; const v=[ri(-9,9),ri(-9,9)],r=[k*v[0],k*v[1]]; return {type:'vec_scale',answerType:'vector',prompt:`Find ${k}v where v = ${fv(...v)}`,answer:fv(...r),display:fv(...r),data:{k,v}}; },
        () => { const v=[ri(-9,9),ri(-9,9)],r=[-v[0],-v[1]]; return {type:'vec_neg',answerType:'vector',prompt:`Find −v where v = ${fv(...v)}`,answer:fv(...r),display:fv(...r),data:{v}}; },
        () => { const v=[ri(1,9),ri(1,9)],m=rnd2(Math.sqrt(v[0]*v[0]+v[1]*v[1])); return {type:'vec_mag',answerType:'scalar',prompt:`Find |v| where v = ${fv(...v)} (round to 2 d.p.)`,answer:String(m),display:String(m),data:{v}}; },
        () => { const u=[ri(-9,9),ri(-9,9)],v=[ri(-9,9),ri(-9,9)],d=u[0]*v[0]+u[1]*v[1]; return {type:'vec_dot',answerType:'scalar',prompt:`Find u · v where u = ${fv(...u)} and v = ${fv(...v)}`,answer:String(d),display:String(d),data:{u,v}}; },
        () => { const A=[[ri(-9,9),ri(-9,9)],[ri(-9,9),ri(-9,9)]],B=[[ri(-9,9),ri(-9,9)],[ri(-9,9),ri(-9,9)]],R=[[A[0][0]+B[0][0],A[0][1]+B[0][1]],[A[1][0]+B[1][0],A[1][1]+B[1][1]]]; return {type:'mat_add',answerType:'matrix',prompt:`Find A + B where A = ${fm(A)} and B = ${fm(B)}`,answer:fm(R),display:fm(R),data:{A,B}}; },
        () => { let k=ri(-5,5); if(k===0)k=2; const A=[[ri(-9,9),ri(-9,9)],[ri(-9,9),ri(-9,9)]],R=[[k*A[0][0],k*A[0][1]],[k*A[1][0],k*A[1][1]]]; return {type:'mat_scale',answerType:'matrix',prompt:`Find ${k}A where A = ${fm(A)}`,answer:fm(R),display:fm(R),data:{k,A}}; },
        () => { const A=[[ri(-9,9),ri(-9,9)],[ri(-9,9),ri(-9,9)]],det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'mat_det2',answerType:'scalar',prompt:`Find det(A) where A = ${fm(A)}`,answer:String(det),display:String(det),data:{A}}; },
        () => { const A=[[ri(-9,9),ri(-9,9)],[ri(-9,9),ri(-9,9)]],R=[[A[0][0],A[1][0]],[A[0][1],A[1][1]]]; return {type:'mat_transpose',answerType:'matrix',prompt:`Find Aᵀ where A = ${fm(A)}`,answer:fm(R),display:fm(R),data:{A}}; },
        () => { const A=[ri(-9,9),ri(-9,9)],B=[ri(-9,9),ri(-9,9)],r=[B[0]-A[0],B[1]-A[1]]; return {type:'vec_points',answerType:'vector',prompt:`Find vector AB where A = ${fv(...A)} and B = ${fv(...B)}`,answer:fv(...r),display:fv(...r),data:{A,B}}; },
      ];

      const mediumGens = [
        () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]],B=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]],R=[[A[0][0]*B[0][0]+A[0][1]*B[1][0],A[0][0]*B[0][1]+A[0][1]*B[1][1]],[A[1][0]*B[0][0]+A[1][1]*B[1][0],A[1][0]*B[0][1]+A[1][1]*B[1][1]]]; return {type:'mat_mul2',answerType:'matrix',prompt:`Find AB where A = ${fm(A)} and B = ${fm(B)}`,answer:fm(R),display:fm(R),data:{A,B}}; },
        () => { const x=ri(-5,5),y=ri(-5,5); const a1=ri(1,5),b1=ri(1,5),c1=a1*x+b1*y; let a2,b2,c2; do { a2=ri(1,5); b2=ri(1,5); } while(a1*b2===a2*b1); c2=a2*x+b2*y; return {type:'solve_2x2',answerType:'scalar',prompt:`Solve: ${a1}x + ${b1}y = ${c1} and ${a2}x + ${b2}y = ${c2}. Find x.`,answer:String(x),display:String(x),data:{a1,b1,c1,a2,b2,c2,x,y}}; },
        () => { const x=ri(-5,5),y=ri(-5,5); const a1=ri(1,5),b1=ri(1,5),c1=a1*x+b1*y; let a2,b2,c2; do { a2=ri(1,5); b2=ri(1,5); } while(a1*b2===a2*b1); c2=a2*x+b2*y; return {type:'solve_2x2_y',answerType:'scalar',prompt:`Solve: ${a1}x + ${b1}y = ${c1} and ${a2}x + ${b2}y = ${c2}. Find y.`,answer:String(y),display:String(y),data:{a1,b1,c1,a2,b2,c2,x,y}}; },
        () => { const A=[[ri(-9,9),ri(-9,9)],[ri(-9,9),ri(-9,9)]],t=A[0][0]+A[1][1]; return {type:'mat_trace',answerType:'scalar',prompt:`Find tr(A) where A = ${fm(A)}`,answer:String(t),display:String(t),data:{A}}; },
        () => { const u=[ri(-9,9),ri(-9,9)],v=[ri(-9,9),ri(-9,9)],c=u[0]*v[1]-u[1]*v[0]; return {type:'vec_cross',answerType:'scalar',prompt:`Find u × v where u = ${fv(...u)} and v = ${fv(...v)} (2D cross product: u₁v₂ − u₂v₁)`,answer:String(c),display:String(c),data:{u,v}}; },
        () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]],v=[ri(-5,5),ri(-5,5)],r=[A[0][0]*v[0]+A[0][1]*v[1],A[1][0]*v[0]+A[1][1]*v[1]]; return {type:'mat_vec',answerType:'vector',prompt:`Find Av where A = ${fm(A)} and v = ${fv(...v)}`,answer:fv(...r),display:fv(...r),data:{A,v}}; },
        () => { const u=[ri(1,9),ri(1,9)],v=[ri(1,9),ri(1,9)]; const dot=u[0]*v[0]+u[1]*v[1]; const magU=Math.sqrt(u[0]*u[0]+u[1]*u[1]),magV=Math.sqrt(v[0]*v[0]+v[1]*v[1]); const cosA=Math.max(-1,Math.min(1,dot/(magU*magV))); const angle=Math.round(Math.acos(cosA)*180/Math.PI); return {type:'vec_angle',answerType:'scalar',prompt:`Find the angle (nearest degree) between u = ${fv(...u)} and v = ${fv(...v)}`,answer:String(angle),display:String(angle)+'°',data:{u,v}}; },
        () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; const rank=(det!==0)?2:((A[0][0]!==0||A[0][1]!==0||A[1][0]!==0||A[1][1]!==0)?1:0); return {type:'mat_rank',answerType:'scalar',prompt:`Find rank(A) where A = ${fm(A)}`,answer:String(rank),display:String(rank),data:{A}}; },
        () => { const u=[ri(1,9),ri(1,9)],v=[ri(1,9),ri(1,9)]; const dot=u[0]*v[0]+u[1]*v[1]; const magV=Math.sqrt(v[0]*v[0]+v[1]*v[1]); const proj=rnd2(dot/magV); return {type:'vec_proj',answerType:'scalar',prompt:`Find the scalar projection of u onto v where u = ${fv(...u)} and v = ${fv(...v)} (round to 2 d.p.)`,answer:String(proj),display:String(proj),data:{u,v}}; },
        () => { let v=[ri(1,9),ri(1,9)]; if(Math.random()<0.5)v[0]=-v[0]; if(Math.random()<0.5)v[1]=-v[1]; const mag=Math.sqrt(v[0]*v[0]+v[1]*v[1]); const u1=rnd2(v[0]/mag); return {type:'vec_unit',answerType:'scalar',prompt:`Find the x-component of the unit vector in the direction of v = ${fv(...v)} (round to 2 d.p.)`,answer:String(u1),display:String(u1),data:{v}}; },
      ];

      const hardGens = [
        () => { const M=Array.from({length:3},()=>[ri(-5,5),ri(-5,5),ri(-5,5)]); const det=M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1])-M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0])+M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0]); const fmt=(m)=>`[${m[0].join(',')};${m[1].join(',')};${m[2].join(',')}]`; return {type:'det_3x3',answerType:'scalar',prompt:`Find det(A) where A = ${fmt(M)}`,answer:String(det),display:String(det),data:{M}}; },
        () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]]; const t=A[0][0]+A[1][1]; return {type:'eigen_sum',answerType:'scalar',prompt:`Find the sum of eigenvalues of A = ${fm(A)} (hint: sum = trace)`,answer:String(t),display:String(t),data:{A}}; },
        () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'eigen_prod',answerType:'scalar',prompt:`Find the product of eigenvalues of A = ${fm(A)} (hint: product = det)`,answer:String(det),display:String(det),data:{A}}; },
        () => { const x=ri(-3,3),y=ri(-3,3),z=ri(-3,3); const a1=ri(1,3),b1=ri(1,3),c1=ri(1,3),d1=a1*x+b1*y+c1*z; const a2=ri(1,3),b2=ri(1,3),c2=ri(1,3),d2=a2*x+b2*y+c2*z; const a3=ri(1,3),b3=ri(1,3),c3=ri(1,3),d3=a3*x+b3*y+c3*z; return {type:'solve_3x3',answerType:'scalar',prompt:`Solve: ${a1}x+${b1}y+${c1}z=${d1}, ${a2}x+${b2}y+${c2}z=${d2}, ${a3}x+${b3}y+${c3}z=${d3}. Find x.`,answer:String(x),display:String(x),data:{a1,b1,c1,d1,a2,b2,c2,d2,a3,b3,c3,d3,x,y,z}}; },
        () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'char_const',answerType:'scalar',prompt:`Find the constant term of the characteristic polynomial of A = ${fm(A)} (hint: = det(A))`,answer:String(det),display:String(det),data:{A}}; },
        () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]]; const A2=[[A[0][0]*A[0][0]+A[0][1]*A[1][0],A[0][0]*A[0][1]+A[0][1]*A[1][1]],[A[1][0]*A[0][0]+A[1][1]*A[1][0],A[1][0]*A[0][1]+A[1][1]*A[1][1]]]; const t=A2[0][0]+A2[1][1]; return {type:'mat_sq_trace',answerType:'scalar',prompt:`Find tr(A²) where A = ${fm(A)}`,answer:String(t),display:String(t),data:{A}}; },
        () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; return {type:'adj_det',answerType:'scalar',prompt:`Find det(adj(A)) where A = ${fm(A)} (hint: for 2x2, det(adj(A)) = det(A))`,answer:String(det),display:String(det),data:{A}}; },
        () => { const A=[[ri(-5,5),ri(-5,5)],[ri(-5,5),ri(-5,5)]]; const det=A[0][0]*A[1][1]-A[0][1]*A[1][0]; const rank=(det!==0)?2:((A[0][0]!==0||A[0][1]!==0||A[1][0]!==0||A[1][1]!==0)?1:0); const nullity=2-rank; return {type:'nullity',answerType:'scalar',prompt:`Find the nullity of A = ${fm(A)}`,answer:String(nullity),display:String(nullity),data:{A}}; },
        () => { const x=ri(-5,5),y=ri(-5,5); const a1=ri(1,5),b1=ri(1,5),c1=a1*x+b1*y; let a2,b2,c2; do{a2=ri(1,5);b2=ri(1,5);}while(a1*b2===a2*b1); c2=a2*x+b2*y; const detD=a1*b2-a2*b1; const detDx=c1*b2-c2*b1; const xC=rnd2(detDx/detD); return {type:'cramer_x',answerType:'scalar',prompt:`Use Cramer's rule to find x: ${a1}x+${b1}y=${c1}, ${a2}x+${b2}y=${c2}`,answer:String(xC),display:String(xC),data:{a1,b1,c1,a2,b2,c2}}; },
        () => { const A=[[ri(-3,3),ri(-3,3)],[ri(-3,3),ri(-3,3)]]; const A2=[[A[0][0]*A[0][0]+A[0][1]*A[1][0],A[0][0]*A[0][1]+A[0][1]*A[1][1]],[A[1][0]*A[0][0]+A[1][1]*A[1][0],A[1][0]*A[0][1]+A[1][1]*A[1][1]]]; const A3=[[A2[0][0]*A[0][0]+A2[0][1]*A[1][0],A2[0][0]*A[0][1]+A2[0][1]*A[1][1]],[A2[1][0]*A[0][0]+A2[1][1]*A[1][0],A2[1][0]*A[0][1]+A2[1][1]*A[1][1]]]; const t=A3[0][0]+A3[1][1]; return {type:'mat_cube_trace',answerType:'scalar',prompt:`Find tr(A3) where A = ${fm(A)}`,answer:String(t),display:String(t),data:{A}}; },
      ];

      if (difficulty === 'easy') {
        q = pick(easyGens)();
      } else if (difficulty === 'medium') {
        q = pick(mediumGens)();
      } else {
        q = pick(hardGens)();
      }
      return { id, difficulty, ...q };
    },
    check(body) {
      const { answer: expected, answerType, type, data } = body;
      const raw = (body.userAnswer || '').trim();
      const norm = (s) => s.replace(/\s+/g, '').replace(/−/g, '-').replace(/−/g, '-');
      const n = norm(raw);
      let correct = false;

      if (answerType === 'scalar') {
        const userVal = parseFloat(n);
        const expVal = parseFloat(expected);
        correct = !isNaN(userVal) && Math.abs(userVal - expVal) < 0.5;
      } else if (answerType === 'vector') {
        const m = n.match(/\(?([-\d.]+),([-\d.]+)\)?/);
        const e = norm(expected).match(/\(?([-\d.]+),([-\d.]+)\)?/);
        correct = m && e && Math.abs(parseFloat(m[1])-parseFloat(e[1])) < 0.01 && Math.abs(parseFloat(m[2])-parseFloat(e[2])) < 0.01;
      } else if (answerType === 'matrix') {
        const parseMat = (s) => {
          const cleaned = s.replace(/[\[\]]/g, '');
          const rows = cleaned.split(';');
          if (rows.length !== 2) return null;
          const r0 = rows[0].split(',').map(Number);
          const r1 = rows[1].split(',').map(Number);
          if (r0.length !== 2 || r1.length !== 2 || r0.some(isNaN) || r1.some(isNaN)) return null;
          return [r0, r1];
        };
        const um = parseMat(n);
        const em = parseMat(norm(expected));
        correct = um && em && um[0][0]===em[0][0] && um[0][1]===em[0][1] && um[1][0]===em[1][0] && um[1][1]===em[1][1];
      }
      return { correct, display: expected, message: correct ? 'Correct!' : 'Incorrect' };
    },
  },

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

  dotprodgym: {
    question(difficulty) {
      const id = `q-${Date.now()}-${Math.random()}`;
      const dim = difficulty === 'easy' ? 2 : difficulty === 'medium' ? (Math.random() < 0.5 ? 2 : 3) : 3;
      const lim = difficulty === 'extrahard' ? 9 : 6;
      const rand = () => { const v = randomInt(1, lim); return Math.random() < 0.5 ? -v : v; };
      const a = Array.from({ length: dim }, rand);
      const b = Array.from({ length: dim }, rand);
      let total = 0;
      for (let i = 0; i < dim; i++) total += a[i] * b[i];
      const fmtVec = (v) => `(${v.join(', ')})`;
      const prompt = `${fmtVec(a)} · ${fmtVec(b)} = ?`;
      const d1 = total - 2 * (a[0] * b[0]);
      const d2 = total - 2 * (a[dim - 1] * b[dim - 1]);
      const d3 = total - a[0] * b[0];
      const d4 = a.reduce((s, v, i) => s + Math.abs(v * b[i]), 0);
      const distractors = [String(d1), String(d2), String(d3), String(d4), String(total + 1), String(-total)];
      const correctText = String(total);
      const opts = buildOptions(correctText, distractors);
      return { id, difficulty, prompt, a, b, total, display: correctText, ...opts };
    },
    check(body) { return mcCheckResult(body); },
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
