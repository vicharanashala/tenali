function switchTab(tabId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const targetView = document.getElementById(`view-${tabId}`);
  const targetBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  if (targetView) targetView.classList.add('active');
  if (targetBtn) targetBtn.classList.add('active');

  if (tabId === 'refraction') drawRefraction();
  if (tabId === 'raylab') drawRayDiagram();
  if (tabId === 'illusions') drawIllusion();
}

const incSlider = document.getElementById('incAngle');
const med1Select = document.getElementById('medium1');
const med2Select = document.getElementById('medium2');

function drawRefraction() {
  const canvas = document.getElementById('refractionCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;

  const theta1Deg = parseFloat(incSlider.value);
  const n1 = parseFloat(med1Select.value);
  const n2 = parseFloat(med2Select.value);

  document.getElementById('incAngleVal').textContent = `${theta1Deg}°`;
  document.getElementById('n1Val').textContent = `${n1.toFixed(2)}`;
  document.getElementById('n2Val').textContent = `${n2.toFixed(2)}`;

  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = n1 === 1.0 ? '#0f172a' : 'rgba(56, 189, 248, 0.14)';
  ctx.fillRect(0, 0, W, cy);

  ctx.fillStyle = n2 === 1.0 ? '#0f172a' : 'rgba(56, 189, 248, 0.28)';
  ctx.fillRect(0, cy, W, cy);

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(W, cy);
  ctx.stroke();

  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(cx, 20);
  ctx.lineTo(cx, H - 20);
  ctx.stroke();
  ctx.setLineDash([]);

  const rayLen = 190;
  const rad1 = (theta1Deg * Math.PI) / 180;

  const ix = cx - rayLen * Math.sin(rad1);
  const iy = cy - rayLen * Math.cos(rad1);
  drawRay(ctx, ix, iy, cx, cy, '#facc15', 3);

  const rx = cx + rayLen * Math.sin(rad1);
  const ry = cy - rayLen * Math.cos(rad1);
  drawRay(ctx, cx, cy, rx, ry, 'rgba(250, 204, 21, 0.55)', 2);

  const sinTheta2 = (n1 / n2) * Math.sin(rad1);
  const readout = document.getElementById('refractionReadout');

  if (sinTheta2 > 1) {
    drawRay(ctx, cx, cy, rx, ry, '#ef4444', 3.5);
    const critDeg = ((Math.asin(n2 / n1) * 180) / Math.PI).toFixed(1);
    readout.innerHTML = `
      <strong>Status:</strong> <span style="color:#dc2626;">Total Internal Reflection (TIR)</span><br/>
      <strong>Critical Angle (θ<sub>c</sub>):</strong> ${critDeg}°<br/>
      <strong>Reflected Angle:</strong> ${theta1Deg}°
    `;
  } else {
    const rad2 = Math.asin(sinTheta2);
    const theta2Deg = ((rad2 * 180) / Math.PI).toFixed(1);
    const tx = cx + rayLen * Math.sin(rad2);
    const ty = cy + rayLen * Math.cos(rad2);
    drawRay(ctx, cx, cy, tx, ty, '#38bdf8', 3);

    const critText = n1 > n2 ? `${((Math.asin(n2 / n1) * 180) / Math.PI).toFixed(1)}°` : 'N/A (n₁ ≤ n₂)';
    readout.innerHTML = `
      <strong>Reflected Angle (θ<sub>r</sub>):</strong> ${theta1Deg}°<br/>
      <strong>Refracted Angle (θ<sub>2</sub>):</strong> ${theta2Deg}°<br/>
      <strong>Critical Angle (θ<sub>c</sub>):</strong> ${critText}
    `;
  }

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '13px sans-serif';
  ctx.fillText(`Medium 1 (n₁ = ${n1.toFixed(2)})`, 16, 28);
  ctx.fillText(`Medium 2 (n₂ = ${n2.toFixed(2)})`, 16, cy + 26);
  ctx.fillText('Normal', cx + 8, 34);
}

function drawRay(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(mx, my);
  ctx.lineTo(mx - 10 * Math.cos(angle - 0.4), my - 10 * Math.sin(angle - 0.4));
  ctx.lineTo(mx - 10 * Math.cos(angle + 0.4), my - 10 * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
}

[incSlider, med1Select, med2Select].forEach(el => el && el.addEventListener('input', drawRefraction));

const elemSelect = document.getElementById('elementType');
const objDistSlider = document.getElementById('objDist');
const focalSlider = document.getElementById('focalLen');

function drawRayDiagram() {
  const canvas = document.getElementById('rayCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;

  const type = elemSelect.value;
  const uMag = parseFloat(objDistSlider.value);
  const fMag = parseFloat(focalSlider.value);
  const objH = 55;

  document.getElementById('objDistVal').textContent = `${uMag} px`;
  document.getElementById('focalLenVal').textContent = `${fMag} px`;

  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(W, cy);
  ctx.stroke();

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (type === 'convex-lens') {
    ctx.ellipse(cx, cy, 12, 135, 0, 0, Math.PI * 2);
  } else if (type === 'concave-lens') {
    ctx.moveTo(cx - 12, cy - 135);
    ctx.quadraticCurveTo(cx - 2, cy, cx - 12, cy + 135);
    ctx.lineTo(cx + 12, cy + 135);
    ctx.quadraticCurveTo(cx + 2, cy, cx + 12, cy - 135);
    ctx.closePath();
  } else if (type === 'concave-mirror') {
    ctx.arc(cx - 140, cy, 140, -0.85, 0.85);
  } else {
    ctx.arc(cx + 140, cy, 140, Math.PI - 0.85, Math.PI + 0.85);
  }
  ctx.stroke();

  drawPoint(ctx, cx - fMag, cy, 'F');
  drawPoint(ctx, cx + fMag, cy, "F'");

  const ox = cx - uMag;
  const oy = cy - objH;
  drawArrow(ctx, ox, cy, ox, oy, '#facc15', 'Object');

  const u = -uMag;
  const isLens = type.includes('lens');
  const f = (type === 'convex-lens' || type === 'convex-mirror') ? fMag : -fMag;

  let v, m, ix, iy;
  if (isLens) {
    const invV = 1 / f + 1 / u;
    v = Math.abs(invV) < 1e-5 ? 9999 : 1 / invV;
    m = v / u;
    ix = cx + v;
  } else {
    const invV = 1 / f - 1 / u;
    v = Math.abs(invV) < 1e-5 ? 9999 : 1 / invV;
    m = -v / u;
    ix = cx + v;
  }
  iy = cy - m * objH;

  const readout = document.getElementById('rayReadout');

  if (Math.abs(v) > 2000) {
    readout.innerHTML = `<strong>Image Position:</strong> At Infinity (∞)<br/><strong>Nature:</strong> Parallel emergent rays`;
    return;
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fb7185';
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(cx, oy);
  ctx.lineTo(ix, iy);
  ctx.stroke();

  ctx.strokeStyle = '#4ade80';
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(cx, cy);
  ctx.lineTo(ix, iy);
  ctx.stroke();

  const isReal = isLens ? v > 0 : v < 0;
  drawArrow(ctx, ix, cy, ix, iy, isReal ? '#38bdf8' : '#c084fc', 'Image', !isReal);

  const orientation = m < 0 ? 'Inverted' : 'Erect (Upright)';
  const sizeText = Math.abs(m) > 1.05 ? 'Magnified' : Math.abs(m) < 0.95 ? 'Diminished' : 'Same Size';

  readout.innerHTML = `
    <strong>Image Distance (v):</strong> ${v.toFixed(1)} px<br/>
    <strong>Magnification (m):</strong> ${m.toFixed(2)}×<br/>
    <strong>Nature:</strong> ${isReal ? 'Real' : 'Virtual'}, ${orientation}, ${sizeText}
  `;
}

function drawPoint(ctx, x, y, label) {
  ctx.fillStyle = '#f87171';
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '12px sans-serif';
  ctx.fillText(label, x - 5, y + 18);
}

function drawArrow(ctx, x1, y1, x2, y2, color, label, dashed = false) {
  ctx.save();
  if (dashed) ctx.setLineDash([5, 4]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();

  const dir = y2 < y1 ? -1 : 1;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 6, y2 - dir * 10);
  ctx.lineTo(x2 + 6, y2 - dir * 10);
  ctx.closePath();
  ctx.fill();

  ctx.font = '12px sans-serif';
  ctx.fillText(label, x2 - 18, y2 + dir * 16);
}

[elemSelect, objDistSlider, focalSlider].forEach(el => el && el.addEventListener('input', drawRayDiagram));

let currentIllusion = 'muller';
let illusionRevealed = false;

const illusionData = {
  muller: {
    title: 'Müller-Lyer Illusion',
    desc: 'Which horizontal shaft looks longer—the top line with inward fins or the bottom line with outward fins?',
    truth: 'Both horizontal shafts are exactly 260 pixels long. Depth-cue perspective makes outward fins look like an interior corner, tricking the brain into scaling it up.'
  },
  ebbinghaus: {
    title: 'Ebbinghaus Size Illusion',
    desc: 'Compare the two orange center circles. Does the one surrounded by small blue circles look larger?',
    truth: 'Both orange center circles have the exact same radius (26 px). Relative size contrast alters perceived scale.'
  },
  contrast: {
    title: 'Simultaneous Luminance Contrast',
    desc: 'Compare the two inner squares on the left (dark background) and right (light background). Which inner square is brighter?',
    truth: 'Both inner squares have the exact same mid-gray RGB value (#808080). Lateral inhibition in the retina exaggerates brightness differences at edges.'
  }
};

function selectIllusion(type, btn) {
  currentIllusion = type;
  illusionRevealed = false;
  document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.getElementById('illusionTitle').textContent = illusionData[type].title;
  document.getElementById('illusionDesc').textContent = illusionData[type].desc;
  document.getElementById('revealBtn').textContent = 'Reveal Geometric Truth';
  document.getElementById('illusionExplanation').textContent = 'Click the button above to overlay measurement guides.';
  drawIllusion();
}

function toggleIllusionReveal() {
  illusionRevealed = !illusionRevealed;
  document.getElementById('revealBtn').textContent = illusionRevealed ? 'Hide Overlay' : 'Reveal Geometric Truth';
  document.getElementById('illusionExplanation').innerHTML = illusionRevealed
    ? `<strong>Explanation:</strong> ${illusionData[currentIllusion].truth}`
    : 'Click the button above to overlay measurement guides.';
  drawIllusion();
}

function drawIllusion() {
  const canvas = document.getElementById('illusionCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (currentIllusion === 'muller') {
    const x1 = 190, x2 = 450, yTop = 130, yBot = 250;
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 4;

    drawSegment(ctx, x1, yTop, x2, yTop);
    drawSegment(ctx, x1, yTop, x1 + 30, yTop - 25);
    drawSegment(ctx, x1, yTop, x1 + 30, yTop + 25);
    drawSegment(ctx, x2, yTop, x2 - 30, yTop - 25);
    drawSegment(ctx, x2, yTop, x2 - 30, yTop + 25);

    drawSegment(ctx, x1, yBot, x2, yBot);
    drawSegment(ctx, x1, yBot, x1 - 30, yBot - 25);
    drawSegment(ctx, x1, yBot, x1 - 30, yBot + 25);
    drawSegment(ctx, x2, yBot, x2 + 30, yBot - 25);
    drawSegment(ctx, x2, yBot, x2 + 30, yBot + 25);

    if (illusionRevealed) {
      ctx.save();
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      drawSegment(ctx, x1, 70, x1, 310);
      drawSegment(ctx, x2, 70, x2, 310);
      ctx.restore();
    }
  } else if (currentIllusion === 'ebbinghaus') {
    const leftX = 200, rightX = 440, cy = H / 2;

    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI) / 3;
      drawCircle(ctx, leftX + 75 * Math.cos(ang), cy + 75 * Math.sin(ang), 34, '#38bdf8');
    }
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4;
      drawCircle(ctx, rightX + 48 * Math.cos(ang), cy + 48 * Math.sin(ang), 11, '#38bdf8');
    }

    drawCircle(ctx, leftX, cy, 26, '#fb923c');
    drawCircle(ctx, rightX, cy, 26, '#fb923c');

    if (illusionRevealed) {
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(leftX, cy - 26);
      ctx.lineTo(rightX, cy - 26);
      ctx.moveTo(leftX, cy + 26);
      ctx.lineTo(rightX, cy + 26);
      ctx.stroke();
    }
  } else if (currentIllusion === 'contrast') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(40, 50, 260, 280);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(340, 50, 260, 280);

    ctx.fillStyle = '#808080';
    ctx.fillRect(130, 150, 80, 80);
    ctx.fillRect(430, 150, 80, 80);

    if (illusionRevealed) {
      ctx.fillStyle = '#808080';
      ctx.fillRect(210, 175, 220, 30);
    }
  }
}

function drawSegment(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawCircle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

const quizQuestions = [
  {
    q: 'A ray of light travels from air (n = 1.0) into glass (n = 1.5) at an angle of incidence of 30°. How does the ray bend?',
    options: ['Away from the normal', 'Towards the normal', 'Without any deviation', 'It undergoes Total Internal Reflection'],
    answer: 1,
    explanation: 'Step 1: Compare refractive indices: glass (n₂ = 1.5) is optically denser than air (n₁ = 1.0). Step 2: By Snell’s Law (n₁ sin θ₁ = n₂ sin θ₂), since n₂ > n₁, sin θ₂ < sin θ₁, so the ray bends towards the normal.'
  },
  {
    q: 'Where should an object be placed in front of a convex lens of focal length f to obtain a real, inverted image of the exact same size?',
    options: ['At the focus (F)', 'Between F and 2F', 'At 2F', 'Between the optical center and F'],
    answer: 2,
    explanation: 'Step 1: Using the lens formula 1/f = 1/v − 1/u with u = −2f. Step 2: 1/v = 1/f − 1/(2f) = 1/(2f), giving v = +2f. Magnification m = v/u = −1 (real, inverted, same size).'
  },
  {
    q: 'Which condition is strictly required for Total Internal Reflection (TIR) to occur?',
    options: [
      'Light travels from rarer to denser medium at any angle',
      'Light travels from denser to rarer medium with i > critical angle',
      'Light travels from denser to rarer medium with i < critical angle',
      'Both media have identical refractive indices'
    ],
    answer: 1,
    explanation: 'TIR only occurs when light attempts to pass from an optically denser medium (higher n) into a rarer medium (lower n) at an incident angle exceeding θc = arcsin(n₂/n₁).'
  },
  {
    q: 'Why are convex mirrors preferred as rear-view mirrors in vehicles?',
    options: [
      'They form real and magnified images',
      'They always form erect, diminished images with a wider field of view',
      'They eliminate chromatic aberration',
      'They focus parallel sunlight onto a single point'
    ],
    answer: 1,
    explanation: 'A convex mirror diverges reflected rays, always producing a virtual, upright, and diminished image regardless of object distance, giving drivers a wide field of view.'
  },
  {
    q: 'What is the power of a converging (convex) lens with a focal length of +25 cm?',
    options: ['+0.04 D', '+4.0 D', '−4.0 D', '+25 D'],
    answer: 1,
    explanation: 'Step 1: Convert focal length to meters: f = +25 cm = +0.25 m. Step 2: Power P = 1 / f(m) = 1 / 0.25 = +4.0 Diopters (D).'
  },
  {
    q: 'In the Müller-Lyer optical illusion, why does the line with outward-pointing fins appear longer?',
    options: [
      'Chromatic dispersion inside the cornea',
      'Depth-cue perspective misinterpretation by the visual cortex',
      'Total internal reflection in the vitreous humor',
      'Astigmatism of the eye lens'
    ],
    answer: 1,
    explanation: 'The brain interprets outward fins as an inside corner receding in 3D space and scales up the perceived length to maintain size constancy.'
  }
];

let qIndex = 0;
let score = 0;
let answered = false;

function loadQuestion() {
  answered = false;
  const current = quizQuestions[qIndex];
  document.getElementById('quizProgress').textContent = `Question ${qIndex + 1} of ${quizQuestions.length}`;
  document.getElementById('quizScore').textContent = `Score: ${score}`;
  document.getElementById('quizQuestion').textContent = current.q;

  const optContainer = document.getElementById('quizOptions');
  optContainer.innerHTML = '';

  current.options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = `${String.fromCharCode(65 + idx)}. ${optText}`;
    btn.onclick = () => selectAnswer(idx, btn);
    optContainer.appendChild(btn);
  });

  const expBox = document.getElementById('quizExplanation');
  expBox.classList.add('hidden');
  expBox.innerText = current.explanation;
  document.getElementById('nextBtn').classList.add('hidden');
}

function selectAnswer(selectedIdx, btnElement) {
  if (answered) return;
  answered = true;

  const current = quizQuestions[qIndex];
  const allBtns = document.querySelectorAll('.option-btn');
  allBtns.forEach(b => (b.disabled = true));

  if (selectedIdx === current.answer) {
    btnElement.classList.add('correct');
    score++;
    document.getElementById('quizScore').textContent = `Score: ${score}`;
  } else {
    btnElement.classList.add('wrong');
    allBtns[current.answer].classList.add('correct');
  }

  showQuizExplanation();
  document.getElementById('nextBtn').classList.remove('hidden');
}

function showQuizExplanation() {
  document.getElementById('quizExplanation').classList.remove('hidden');
}

function nextQuestion() {
  qIndex++;
  if (qIndex < quizQuestions.length) {
    loadQuestion();
  } else {
    const quizBox = document.getElementById('quizBox');
    quizBox.innerHTML = `
      <div style="text-align:center; padding: 1.5rem 0;">
        <h2>Quiz Completed!</h2>
        <p style="font-size:1.2rem; margin: 1rem 0;">You scored <strong>${score} out of ${quizQuestions.length}</strong></p>
        <button class="btn btn-primary" onclick="location.reload()">Restart Quiz</button>
      </div>
    `;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  drawRefraction();
  drawRayDiagram();
  drawIllusion();
  loadQuestion();
});
