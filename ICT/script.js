/* =========================================================
   1. EXACT FRACTION ARITHMETIC ENGINE
   ========================================================= */
class Fraction {
  constructor(num, den = 1) {
    if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) {
      this.num = 0;
      this.den = 1;
      this.invalid = true;
      return;
    }
    this.invalid = false;
    // Handle decimals cleanly by scaling up to integers
    if (!Number.isInteger(num) || !Number.isInteger(den)) {
      const scale = 10000;
      num = Math.round(num * scale);
      den = Math.round(den * scale);
    }
    if (den < 0) {
      num = -num;
      den = -den;
    }
    if (num === 0) {
      this.num = 0;
      this.den = 1;
      return;
    }
    const g = Fraction.gcd(Math.abs(num), Math.abs(den));
    this.num = num / g;
    this.den = den / g;
  }

  static gcd(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b !== 0) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }

  static parse(str) {
    if (typeof str === 'number') return new Fraction(str, 1);
    const cleaned = String(str).trim().replace(/\s+/g, '');
    if (!cleaned) return new Fraction(0, 1);
    if (cleaned.includes('/')) {
      const parts = cleaned.split('/');
      if (parts.length === 2) {
        const n = parseFloat(parts[0]);
        const d = parseFloat(parts[1]);
        if (!isNaN(n) && !isNaN(d) && d !== 0) {
          return new Fraction(n, d);
        }
      }
      return new Fraction(0, 1);
    }
    const val = parseFloat(cleaned);
    return isNaN(val) ? new Fraction(0, 1) : new Fraction(val, 1);
  }

  isZero() { return this.num === 0; }
  neg() { return new Fraction(-this.num, this.den); }
  abs() { return new Fraction(Math.abs(this.num), this.den); }
  add(o) { return new Fraction(this.num * o.den + o.num * this.den, this.den * o.den); }
  sub(o) { return new Fraction(this.num * o.den - o.num * this.den, this.den * o.den); }
  mul(o) { return new Fraction(this.num * o.num, this.den * o.den); }
  div(o) {
    if (o.isZero()) return null;
    return new Fraction(this.num * o.den, this.den * o.num);
  }
  equals(o) { return o !== null && this.num === o.num && this.den === o.den; }
  toNumber() { return this.num / this.den; }

  toString() {
    if (this.den === 1) return `${this.num}`;
    return `${this.num}/${this.den}`;
  }

  toHTML(omitSign = false) {
    const n = omitSign ? Math.abs(this.num) : this.num;
    if (this.den === 1) return `${n}`;
    const sign = !omitSign && this.num < 0 ? '−' : '';
    return `${sign}<span class="inline-frac"><span class="f-num">${Math.abs(n)}</span><span class="f-den">${this.den}</span></span>`;
  }
}

/* =========================================================
   2. APP STATE & THEME MANAGEMENT
   ========================================================= */
const COEF_KEYS = ['a1', 'b1', 'c1', 'a2', 'b2', 'c2'];
let inputMode = 'slider'; // 'slider' | 'fraction'
let gridRange = 10;

// Exact Fraction coefficients
const coefs = {
  a1: new Fraction(1, 1),
  b1: new Fraction(1, 1),
  c1: new Fraction(-4, 1),
  a2: new Fraction(2, 1),
  b2: new Fraction(-1, 1),
  c2: new Fraction(-2, 1),
};

// Animated numerical values for smooth Canvas morphing
const animCoefs = { a1: 1, b1: 1, c1: -4, a2: 2, b2: -1, c2: -2 };
let hoverPoint = null;
let animTime = 0;

// Theme Toggle
const themeBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeLabel = document.getElementById('themeLabel');

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('linearlab-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
}

themeBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

const savedTheme = localStorage.getItem('linearlab-theme');
if (savedTheme) setTheme(savedTheme);

// Scroll Reveal Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* =========================================================
   3. MODE SWITCHING & CONTROL SYNC
   ========================================================= */
function setInputMode(mode) {
  inputMode = mode;
  document.getElementById('modeSliderBtn').classList.toggle('active', mode === 'slider');
  document.getElementById('modeFractionBtn').classList.toggle('active', mode === 'fraction');

  document.getElementById('line1-sliders').classList.toggle('hidden', mode !== 'slider');
  document.getElementById('line2-sliders').classList.toggle('hidden', mode !== 'slider');
  document.getElementById('line1-fractions').classList.toggle('hidden', mode !== 'fraction');
  document.getElementById('line2-fractions').classList.toggle('hidden', mode !== 'fraction');

  syncAllInputsFromState();
}

function syncAllInputsFromState() {
  COEF_KEYS.forEach(key => {
    const f = coefs[key];
    const rangeEl = document.getElementById(`${key}-range`);
    const textEl = document.getElementById(`${key}-text`);
    const numEl = document.getElementById(`${key}-num`);
    const denEl = document.getElementById(`${key}-den`);

    const val = f.toNumber();
    rangeEl.value = Math.max(parseFloat(rangeEl.min), Math.min(parseFloat(rangeEl.max), val));
    textEl.value = f.toString();
    numEl.value = f.num;
    denEl.value = f.den;
  });
  analyzeSystem();
}

// Attach listeners for Sliders, Text Inputs, and Fraction Numerator/Denominator Inputs
COEF_KEYS.forEach(key => {
  const rangeEl = document.getElementById(`${key}-range`);
  const textEl = document.getElementById(`${key}-text`);
  const numEl = document.getElementById(`${key}-num`);
  const denEl = document.getElementById(`${key}-den`);

  rangeEl.addEventListener('input', () => {
    coefs[key] = new Fraction(parseFloat(rangeEl.value), 1);
    textEl.value = coefs[key].toString();
    numEl.value = coefs[key].num;
    denEl.value = coefs[key].den;
    analyzeSystem();
  });

  textEl.addEventListener('change', () => {
    coefs[key] = Fraction.parse(textEl.value);
    syncAllInputsFromState();
  });

  const updateFromFracInputs = () => {
    const n = parseInt(numEl.value, 10);
    let d = parseInt(denEl.value, 10);
    if (isNaN(d) || d === 0) {
      d = 1;
      denEl.value = 1;
    }
    coefs[key] = new Fraction(isNaN(n) ? 0 : n, d);
    const val = coefs[key].toNumber();
    rangeEl.value = Math.max(parseFloat(rangeEl.min), Math.min(parseFloat(rangeEl.max), val));
    textEl.value = coefs[key].toString();
    analyzeSystem();
  };

  numEl.addEventListener('input', updateFromFracInputs);
  denEl.addEventListener('input', updateFromFracInputs);
});

function quickSetFrac(key, num, den) {
  coefs[key] = new Fraction(num, den);
  syncAllInputsFromState();
}

/* =========================================================
   4. PRESETS & NAVIGATION HELPERS
   ========================================================= */
function applyPreset(type) {
  if (type === 'intersect') {
    loadCoefs([1,1], [1,1], [-4,1], [2,1], [-1,1], [-2,1]);
  } else if (type === 'parallel') {
    loadCoefs([1,1], [2,1], [-4,1], [2,1], [4,1], [-12,1]);
  } else if (type === 'coincident') {
    loadCoefs([2,1], [3,1], [-6,1], [4,1], [6,1], [-12,1]);
  } else if (type === 'fraction-demo') {
    setInputMode('fraction');
    loadCoefs([1,2], [1,3], [-2,1], [3,4], [-1,2], [-1,1]);
  }
}

function applyRandomPreset() {
  const types = ['intersect', 'parallel', 'coincident'];
  const pick = types[Math.floor(Math.random() * types.length)];
  const randInt = (min, max) => {
    let v = 0;
    while (v === 0) v = Math.floor(Math.random() * (max - min + 1)) + min;
    return v;
  };
  const dens = inputMode === 'fraction' ? [1, 2, 3, 4] : [1];
  const randDen = () => dens[Math.floor(Math.random() * dens.length)];

  const a1 = new Fraction(randInt(-4, 4), randDen());
  const b1 = new Fraction(randInt(-4, 4), randDen());
  const c1 = new Fraction(randInt(-6, 6), randDen());

  if (pick === 'intersect') {
    let a2 = new Fraction(randInt(-4, 4), randDen());
    let b2 = new Fraction(randInt(-4, 4), randDen());
    if (a1.mul(b2).equals(a2.mul(b1))) b2 = b2.add(new Fraction(1, 1));
    const c2 = new Fraction(randInt(-6, 6), randDen());
    coefs.a1 = a1; coefs.b1 = b1; coefs.c1 = c1;
    coefs.a2 = a2; coefs.b2 = b2; coefs.c2 = c2;
  } else if (pick === 'parallel') {
    const k = new Fraction(randInt(2, 3), 1);
    coefs.a1 = a1; coefs.b1 = b1; coefs.c1 = c1;
    coefs.a2 = a1.mul(k); coefs.b2 = b1.mul(k);
    coefs.c2 = c1.mul(k).add(new Fraction(randInt(2, 5), 1));
  } else {
    const k = new Fraction(randInt(2, 3), 1);
    coefs.a1 = a1; coefs.b1 = b1; coefs.c1 = c1;
    coefs.a2 = a1.mul(k); coefs.b2 = b1.mul(k); coefs.c2 = c1.mul(k);
  }
  syncAllInputsFromState();
}

function loadCoefs(a1, b1, c1, a2, b2, c2) {
  coefs.a1 = new Fraction(a1[0], a1[1]);
  coefs.b1 = new Fraction(b1[0], b1[1]);
  coefs.c1 = new Fraction(c1[0], c1[1]);
  coefs.a2 = new Fraction(a2[0], a2[1]);
  coefs.b2 = new Fraction(b2[0], b2[1]);
  coefs.c2 = new Fraction(c2[0], c2[1]);
  syncAllInputsFromState();
}

function jumpToPreset(type) {
  applyPreset(type);
  document.getElementById('playground').scrollIntoView({ behavior: 'smooth' });
}

function adjustZoom(delta) {
  gridRange = Math.max(4, Math.min(24, gridRange + delta));
  document.getElementById('zoomLabel').textContent = `±${gridRange}`;
}

function resetZoom() {
  gridRange = 10;
  document.getElementById('zoomLabel').textContent = `±10`;
}

/* =========================================================
   5. EQUATION FORMATTING & MATHEMATICAL ANALYSIS
   ========================================================= */
function formatEquationHTML(a, b, c) {
  const parts = [];
  if (!a.isZero()) {
    const isOne = a.num === 1 && a.den === 1;
    const isNegOne = a.num === -1 && a.den === 1;
    const term = isOne ? 'x' : isNegOne ? '−x' : `${a.toHTML()}x`;
    parts.push(term);
  }
  if (!b.isZero()) {
    const isPos = b.num > 0;
    const sign = parts.length ? (isPos ? ' + ' : ' − ') : (isPos ? '' : '−');
    const absB = b.abs();
    const isOne = absB.num === 1 && absB.den === 1;
    parts.push(`${sign}${isOne ? 'y' : `${absB.toHTML()}y`}`);
  }
  if (!c.isZero()) {
    const isPos = c.num > 0;
    const sign = parts.length ? (isPos ? ' + ' : ' − ') : (isPos ? '' : '−');
    parts.push(`${sign}${c.abs().toHTML()}`);
  }
  if (!parts.length) return '0 = 0';
  return parts.join('') + ' = 0';
}

function formatRatioHTML(f1, f2) {
  if (f1.isZero() && f2.isZero()) return '0/0';
  if (f2.isZero()) return '∞';
  const r = f1.div(f2);
  return r.toHTML();
}

function formatSlopeIntercept(a, b, c, label) {
  if (a.isZero() && b.isZero()) return `${label}: Invalid (a=0, b=0)`;
  if (b.isZero()) {
    const xVal = c.neg().div(a);
    return `${label}: x = ${xVal.toHTML()} (Vertical, slope = ∞)`;
  }
  const m = a.neg().div(b);
  const k = c.neg().div(b);
  const kSign = k.num >= 0 ? '+' : '−';
  const kPart = k.isZero() ? '' : ` ${kSign} ${k.abs().toHTML()}`;
  return `${label}: y = ${m.toHTML()}x${kPart}  [slope m = ${m.toHTML()}]`;
}

let currentAnalysis = { status: 'intersect', pt: { x: 2, y: 2 }, ptFrac: null };

function analyzeSystem() {
  const { a1, b1, c1, a2, b2, c2 } = coefs;

  // Equation previews
  document.getElementById('eq1-preview').innerHTML = formatEquationHTML(a1, b1, c1);
  document.getElementById('eq2-preview').innerHTML = formatEquationHTML(a2, b2, c2);

  // Ratios
  const rA = a2.isZero() ? null : a1.div(a2);
  const rB = b2.isZero() ? null : b1.div(b2);
  const rC = c2.isZero() ? null : c1.div(c2);

  document.getElementById('ratio-a').innerHTML = formatRatioHTML(a1, a2);
  document.getElementById('ratio-b').innerHTML = formatRatioHTML(b1, b2);
  document.getElementById('ratio-c').innerHTML = formatRatioHTML(c1, c2);

  // Exact Cross-Product Comparison (works reliably even when some coefficients are 0)
  const D = a1.mul(b2).sub(a2.mul(b1));
  const Dx = b1.mul(c2).sub(b2.mul(c1));
  const Dy = c1.mul(a2).sub(c2.mul(a1));

  const abEqual = D.isZero();
  const bcEqual = Dx.isZero() && Dy.isZero();

  const opAB = document.getElementById('op-ab');
  const opBC = document.getElementById('op-bc');

  opAB.textContent = abEqual ? '=' : '≠';
  opAB.className = `ratio-operator ${abEqual ? 'op-eq' : 'op-neq'}`;

  opBC.textContent = bcEqual ? '=' : '≠';
  opBC.className = `ratio-operator ${bcEqual ? 'op-eq' : 'op-neq'}`;

  const lineBadge = document.getElementById('line-type-badge');
  const sysBadge = document.getElementById('system-type-badge');
  const solBanner = document.getElementById('solution-details');

  const valid1 = !(a1.isZero() && b1.isZero());
  const valid2 = !(a2.isZero() && b2.isZero());

  if (!valid1 || !valid2) {
    currentAnalysis = { status: 'invalid', pt: null, ptFrac: null };
    lineBadge.textContent = 'Invalid Equation';
    lineBadge.className = 'pill pill-amber';
    sysBadge.textContent = 'Set a or b ≠ 0';
    sysBadge.className = 'pill pill-amber';
    solBanner.innerHTML = '<strong>Heads up:</strong> Both <em>a</em> and <em>b</em> cannot be zero in a linear equation.';
  } else if (!D.isZero()) {
    const xF = Dx.div(D);
    const yF = Dy.div(D);
    currentAnalysis = {
      status: 'intersect',
      pt: { x: xF.toNumber(), y: yF.toNumber() },
      ptFrac: { x: xF, y: yF }
    };
    lineBadge.textContent = 'Intersecting Lines';
    lineBadge.className = 'pill pill-green';
    sysBadge.textContent = 'Consistent • Unique Solution';
    sysBadge.className = 'pill pill-green';

    const decStr = (xF.den !== 1 || yF.den !== 1)
      ? ` <span style="color:var(--muted)">≈ (${xF.toNumber().toFixed(2)}, ${yF.toNumber().toFixed(2)})</span>`
      : '';
    solBanner.innerHTML = `<strong>Exact Intersection Point:</strong> (x, y) = <strong>(${xF.toHTML()}, ${yF.toHTML()})</strong>${decStr}`;
  } else if (Dx.isZero() && Dy.isZero()) {
    currentAnalysis = { status: 'coincident', pt: null, ptFrac: null };
    lineBadge.textContent = 'Coincident Lines';
    lineBadge.className = 'pill pill-purple';
    sysBadge.textContent = 'Consistent • Infinitely Many Solutions';
    sysBadge.className = 'pill pill-purple';
    solBanner.innerHTML = '<strong>Complete Overlap:</strong> Both equations describe the exact same line—every point on it satisfies both equations.';
  } else {
    currentAnalysis = { status: 'parallel', pt: null, ptFrac: null };
    lineBadge.textContent = 'Parallel Lines';
    lineBadge.className = 'pill pill-red';
    sysBadge.textContent = 'Inconsistent • No Solution';
    sysBadge.className = 'pill pill-red';
    solBanner.innerHTML = '<strong>Never Meet:</strong> Equal slopes with different intercepts keep these lines permanently separated.';
  }

  // Update Live Step-by-Step Cards
  document.getElementById('step-slope-box').innerHTML = `
    <div style="color:var(--blue)">${formatSlopeIntercept(a1, b1, c1, 'L₁')}</div>
    <div style="color:var(--red)">${formatSlopeIntercept(a2, b2, c2, 'L₂')}</div>
  `;

  document.getElementById('step-ratio-box').innerHTML = `
    <div>a₁/a₂ = (${a1.toHTML()}) ÷ (${a2.toHTML()}) = <strong>${formatRatioHTML(a1, a2)}</strong></div>
    <div>b₁/b₂ = (${b1.toHTML()}) ÷ (${b2.toHTML()}) = <strong>${formatRatioHTML(b1, b2)}</strong></div>
    <div>c₁/c₂ = (${c1.toHTML()}) ÷ (${c2.toHTML()}) = <strong>${formatRatioHTML(c1, c2)}</strong></div>
    <div style="margin-top:6px; color:var(--blue)">Result: a₁/a₂ ${abEqual ? '=' : '≠'} b₁/b₂ ${bcEqual ? '=' : '≠'} c₁/c₂</div>
  `;

  if (currentAnalysis.status === 'intersect') {
    const { x, y } = currentAnalysis.ptFrac;
    document.getElementById('step-solution-box').innerHTML = `
      <div>D  = a₁b₂ − a₂b₁ = <strong>${D.toHTML()}</strong> (≠ 0)</div>
      <div>x  = (b₁c₂ − b₂c₁) / D = <strong>${x.toHTML()}</strong></div>
      <div>y  = (c₁a₂ − c₂a₁) / D = <strong>${y.toHTML()}</strong></div>
    `;
  } else if (currentAnalysis.status === 'coincident') {
    document.getElementById('step-solution-box').innerHTML = `
      <div>D = <strong>0</strong>, Dx = <strong>0</strong>, Dy = <strong>0</strong></div>
      <div style="color:var(--purple)">All determinants vanish → Dependent system with <strong>∞ solutions</strong>.</div>
    `;
  } else if (currentAnalysis.status === 'parallel') {
    document.getElementById('step-solution-box').innerHTML = `
      <div>D = <strong>0</strong>, while Dx = <strong>${Dx.toHTML()}</strong>, Dy = <strong>${Dy.toHTML()}</strong></div>
      <div style="color:var(--red)">Zero determinant with non-zero shift → <strong>No solution</strong>.</div>
    `;
  } else {
    document.getElementById('step-solution-box').innerHTML = `<div>Adjust coefficients so each line has a ≠ 0 or b ≠ 0.</div>`;
  }
}

/* =========================================================
   6. ANIMATED HTML5 CANVAS RENDERER + FX
   ========================================================= */
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;
  const x = ((px - rect.width / 2) / (rect.width / (gridRange * 2)));
  const y = ((rect.height / 2 - py) / (rect.height / (gridRange * 2)));
  hoverPoint = { x, y, px, py };
  document.getElementById('hoverCoords').textContent = `x: ${x.toFixed(2)}, y: ${y.toFixed(2)}`;
});

canvas.addEventListener('mouseleave', () => {
  hoverPoint = null;
  document.getElementById('hoverCoords').textContent = 'Hover graph for (x, y)';
});

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function renderLoop(timestamp) {
  animTime = timestamp * 0.001;

  // Smooth exponential interpolation (morphing effect) toward target coefficients
  const lerp = 0.16;
  COEF_KEYS.forEach(k => {
    const target = coefs[k].toNumber();
    animCoefs[k] += (target - animCoefs[k]) * lerp;
    if (Math.abs(target - animCoefs[k]) < 0.0005) animCoefs[k] = target;
  });

  drawGraphFrame();
  requestAnimationFrame(renderLoop);
}

function drawGraphFrame() {
  const rect = canvas.parentElement.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const W = rect.width;
  const H = rect.height;
  const originX = W / 2;
  const originY = H / 2;
  const stepX = W / (gridRange * 2);
  const stepY = H / (gridRange * 2);

  const toPxX = x => originX + x * stepX;
  const toPxY = y => originY - y * stepY;

  const showProjections = document.getElementById('opt-projections').checked;
  const showIntercepts = document.getElementById('opt-intercepts').checked;
  const showFX = document.getElementById('opt-effects').checked;

  // Background
  ctx.fillStyle = getCSSVar('--canvas-bg');
  ctx.fillRect(0, 0, W, H);

  // Grid Lines
  const gridStep = gridRange > 14 ? 2 : 1;
  const labelStep = gridRange > 16 ? 4 : gridRange > 8 ? 2 : 1;
  const minorColor = getCSSVar('--grid-minor');
  const axisColor = getCSSVar('--axis-color');
  const textColor = getCSSVar('--axis-text');

  for (let i = -gridRange; i <= gridRange; i += gridStep) {
    const isAxis = i === 0;
    ctx.strokeStyle = isAxis ? axisColor : minorColor;
    ctx.lineWidth = isAxis ? 2 : 1;

    ctx.beginPath();
    ctx.moveTo(toPxX(i), 0);
    ctx.lineTo(toPxX(i), H);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, toPxY(i));
    ctx.lineTo(W, toPxY(i));
    ctx.stroke();

    if (!isAxis && i % labelStep === 0) {
      ctx.fillStyle = textColor;
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(i, toPxX(i), originY + 15);
      ctx.textAlign = 'right';
      ctx.fillText(i, originX - 7, toPxY(i) + 4);
    }
  }

  // Axis End Labels
  ctx.fillStyle = axisColor;
  ctx.font = '800 12px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('X', W - 10, originY - 8);
  ctx.textAlign = 'left';
  ctx.fillText('Y', originX + 10, 18);

  // Hover Crosshair
  if (hoverPoint) {
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hoverPoint.px, 0);
    ctx.lineTo(hoverPoint.px, H);
    ctx.moveTo(0, hoverPoint.py);
    ctx.lineTo(W, hoverPoint.py);
    ctx.stroke();
    ctx.restore();
  }

  const { a1, b1, c1, a2, b2, c2 } = animCoefs;
  const blueColor = '#3b82f6';
  const redColor = '#ef4444';

  function drawInfiniteLine(a, b, c, color, opts = {}) {
    if (Math.abs(a) < 1e-6 && Math.abs(b) < 1e-6) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = opts.width || 3.5;
    ctx.lineCap = 'round';

    if (showFX) {
      ctx.shadowColor = color;
      ctx.shadowBlur = opts.glow || 10;
    }
    if (opts.dash) {
      ctx.setLineDash(opts.dash);
      if (opts.dashOffset) ctx.lineDashOffset = opts.dashOffset;
    }

    const pad = gridRange * 1.5;
    ctx.beginPath();
    if (Math.abs(b) > 1e-4) {
      const y1 = (-a * (-pad) - c) / b;
      const y2 = (-a * pad - c) / b;
      ctx.moveTo(toPxX(-pad), toPxY(y1));
      ctx.lineTo(toPxX(pad), toPxY(y2));
    } else {
      const xv = -c / a;
      ctx.moveTo(toPxX(xv), toPxY(-pad));
      ctx.lineTo(toPxX(xv), toPxY(pad));
    }
    ctx.stroke();
    ctx.restore();
  }

  // Draw Line 1 & Line 2
  const isCoincident = currentAnalysis.status === 'coincident';
  drawInfiniteLine(a1, b1, c1, blueColor, { width: isCoincident ? 6 : 3.5, glow: showFX ? 12 : 0 });
  drawInfiniteLine(a2, b2, c2, redColor, {
    width: isCoincident ? 3.5 : 3.5,
    dash: isCoincident ? [14, 12] : null,
    dashOffset: isCoincident && showFX ? -animTime * 42 : 0,
    glow: showFX ? 12 : 0
  });

  // Intercept Dots
  if (showIntercepts) {
    const plotIntercepts = (a, b, c, color) => {
      if (Math.abs(a) > 1e-5) {
        const xi = -c / a;
        if (Math.abs(xi) <= gridRange) drawMiniDot(toPxX(xi), toPxY(0), color);
      }
      if (Math.abs(b) > 1e-5) {
        const yi = -c / b;
        if (Math.abs(yi) <= gridRange) drawMiniDot(toPxX(0), toPxY(yi), color);
      }
    };
    plotIntercepts(a1, b1, c1, blueColor);
    plotIntercepts(a2, b2, c2, redColor);
  }

  // Parallel Animated Distance Indicator
  if (currentAnalysis.status === 'parallel' && showFX) {
    const norm = Math.hypot(a1, b1);
    if (norm > 1e-4) {
      // Pick midpoint along Line 1 closest to origin
      const t = -c1 / (a1 * a1 + b1 * b1);
      const x1 = a1 * t;
      const y1 = b1 * t;
      // Project onto Line 2
      const distSigned = -(a2 * x1 + b2 * y1 + c2) / (a2 * a2 + b2 * b2);
      const x2 = x1 + a2 * distSigned;
      const y2 = y1 + b2 * distSigned;

      if (Math.abs(x1) <= gridRange && Math.abs(y1) <= gridRange && Math.abs(x2) <= gridRange && Math.abs(y2) <= gridRange) {
        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([5, 4]);
        ctx.lineDashOffset = -animTime * 18;
        ctx.beginPath();
        ctx.moveTo(toPxX(x1), toPxY(y1));
        ctx.lineTo(toPxX(x2), toPxY(y2));
        ctx.stroke();

        const mx = (toPxX(x1) + toPxX(x2)) / 2;
        const my = (toPxY(y1) + toPxY(y2)) / 2;
        drawBadge(mx, my, 'Constant Gap', '#d97706');
        ctx.restore();
      }
    }
  }

  // Intersecting Point + Pulsing Halo + Axis Projections
  const liveD = a1 * b2 - a2 * b1;
  if (currentAnalysis.status === 'intersect' && Math.abs(liveD) > 1e-5) {
    const ix = (b1 * c2 - b2 * c1) / liveD;
    const iy = (c1 * a2 - c2 * a1) / liveD;
    const px = toPxX(ix);
    const py = toPxY(iy);

    if (px >= -24 && px <= W + 24 && py >= -24 && py <= H + 24) {
      // Dashed Projection Lines to X and Y axes
      if (showProjections) {
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, originY);
        ctx.moveTo(px, py);
        ctx.lineTo(originX, py);
        ctx.stroke();
        ctx.restore();
      }

      // Animated Pulse Ring
      if (showFX) {
        const pulse = (Math.sin(animTime * 4) + 1) / 2; // 0..1
        ctx.beginPath();
        ctx.arc(px, py, 9 + pulse * 10, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.32 - pulse * 0.24})`;
        ctx.fill();
      }

      // Core Intersection Point
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Exact Fraction Coordinate Label
      const ptF = currentAnalysis.ptFrac;
      const label = ptF ? `(${ptF.x.toString()}, ${ptF.y.toString()})` : `(${ix.toFixed(2)}, ${iy.toFixed(2)})`;
      drawBadge(px, py - 18, label, '#0f172a');
    }
  }
}

function drawMiniDot(x, y, color) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.restore();
}

function drawBadge(cx, cy, text, bg) {
  ctx.save();
  ctx.font = '700 11.5px "JetBrains Mono", monospace';
  const tw = ctx.measureText(text).width;
  const bw = tw + 14;
  const bh = 22;
  const bx = Math.min(Math.max(cx - bw / 2, 8), canvas.clientWidth - bw - 8);
  const by = Math.min(Math.max(cy - bh / 2, 42), canvas.clientHeight - bh - 8);

  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 7);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + bw / 2, by + bh / 2 + 0.5);
  ctx.restore();
}

/* =========================================================
   7. INTERACTIVE 6-QUESTION QUIZ (WITH FRACTIONS + CONFETTI)
   ========================================================= */
const quizData = [
  {
    eqs: "2x + 3y − 8 = 0<br>4x + 6y − 16 = 0",
    coefs: [[2,1],[3,1],[-8,1], [4,1],[6,1],[-16,1]],
    options: [
      "Coincident & Consistent (Infinitely many solutions)",
      "Parallel & Inconsistent (No solution)",
      "Intersecting & Consistent (Unique solution)"
    ],
    answer: 0,
    explanation: "a₁/a₂ = 2/4 = 1/2, b₁/b₂ = 3/6 = 1/2, and c₁/c₂ = −8/−16 = 1/2. All three ratios match!"
  },
  {
    eqs: "(1/2)x + (1/3)y − 2 = 0<br>3x + 2y − 10 = 0",
    coefs: [[1,2],[1,3],[-2,1], [3,1],[2,1],[-10,1]],
    useFracMode: true,
    options: [
      "Intersecting & Consistent (Unique solution)",
      "Parallel & Inconsistent (No solution)",
      "Coincident & Consistent (Infinitely many solutions)"
    ],
    answer: 1,
    explanation: "a₁/a₂ = (1/2)/3 = 1/6 and b₁/b₂ = (1/3)/2 = 1/6, but c₁/c₂ = −2/−10 = 1/5. Equal slopes with different intercepts → Parallel!"
  },
  {
    eqs: "5x − 4y + 8 = 0<br>7x + 6y − 9 = 0",
    coefs: [[5,1],[-4,1],[8,1], [7,1],[6,1],[-9,1]],
    options: [
      "Parallel & Inconsistent (No solution)",
      "Coincident & Consistent (Infinitely many solutions)",
      "Intersecting & Consistent (Unique solution)"
    ],
    answer: 2,
    explanation: "a₁/a₂ = 5/7 whereas b₁/b₂ = −4/6 = −2/3. Since a₁/a₂ ≠ b₁/b₂, they intersect at exactly one point."
  },
  {
    eqs: "(3/2)x + (5/3)y − 7 = 0<br>9x − 10y − 14 = 0",
    coefs: [[3,2],[5,3],[-7,1], [9,1],[-10,1],[-14,1]],
    useFracMode: true,
    options: [
      "Intersecting & Consistent (Unique solution)",
      "Parallel & Inconsistent (No solution)",
      "Coincident & Consistent (Infinitely many solutions)"
    ],
    answer: 0,
    explanation: "Watch the minus sign! a₁/a₂ = (3/2)/9 = +1/6, while b₁/b₂ = (5/3)/(−10) = −1/6. Since +1/6 ≠ −1/6, they intersect!"
  },
  {
    eqs: "6x − 3y + 10 = 0<br>2x − y + 9 = 0",
    coefs: [[6,1],[-3,1],[10,1], [2,1],[-1,1],[9,1]],
    options: [
      "Intersecting & Consistent",
      "Parallel & Inconsistent",
      "Coincident & Consistent"
    ],
    answer: 1,
    explanation: "a₁/a₂ = 6/2 = 3 and b₁/b₂ = −3/−1 = 3, but c₁/c₂ = 10/9. Same slope, different intercepts → Parallel & Inconsistent."
  },
  {
    eqs: "(1/4)x − (1/2)y + 1 = 0<br>x − 2y + 4 = 0",
    coefs: [[1,4],[-1,2],[1,1], [1,1],[-2,1],[4,1]],
    useFracMode: true,
    options: [
      "Parallel & Inconsistent (No solution)",
      "Intersecting & Consistent (Unique solution)",
      "Coincident & Consistent (Infinitely many solutions)"
    ],
    answer: 2,
    explanation: "Multiply the first equation by 4: you get x − 2y + 4 = 0, which is identical to Line 2! Every ratio equals 1/4."
  }
];

let currentQ = 0;
let score = 0;
let streak = 0;
let answered = false;

function loadQuestion() {
  answered = false;
  const q = quizData[currentQ];
  document.getElementById('quiz-progress').textContent = `Question ${currentQ + 1} of ${quizData.length}`;
  document.getElementById('quiz-score').textContent = `Score: ${score} / ${quizData.length}`;
  document.getElementById('quiz-streak').textContent = `🔥 Streak: ${streak}`;
  document.getElementById('quiz-progress-bar').style.width = `${((currentQ) / quizData.length) * 100}%`;
  document.getElementById('quiz-eqs').innerHTML = q.eqs;
  document.getElementById('quiz-prompt').textContent = "Analyze the coefficient ratios and pick the matching behavior:";

  const optList = document.getElementById('quiz-options');
  optList.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(i, btn);
    optList.appendChild(btn);
  });

  document.getElementById('quiz-feedback').style.display = 'none';
  document.getElementById('next-btn').classList.add('hidden');
  document.getElementById('plot-quiz-btn').classList.add('hidden');
}

function selectAnswer(idx, btn) {
  if (answered) return;
  answered = true;
  const q = quizData[currentQ];
  const allBtns = document.querySelectorAll('.option-btn');
  allBtns.forEach(b => (b.disabled = true));

  const fb = document.getElementById('quiz-feedback');
  fb.style.display = 'block';

  if (idx === q.answer) {
    score++;
    streak++;
    btn.classList.add('correct');
    fb.style.background = 'var(--green-soft)';
    fb.style.color = 'var(--green)';
    fb.innerHTML = `✅ Spot on! ${q.explanation}`;
  } else {
    streak = 0;
    btn.classList.add('wrong');
    allBtns[q.answer].classList.add('correct');
    fb.style.background = 'var(--red-soft)';
    fb.style.color = 'var(--red)';
    fb.innerHTML = `❌ Not quite. ${q.explanation}`;
  }

  document.getElementById('quiz-score').textContent = `Score: ${score} / ${quizData.length}`;
  document.getElementById('quiz-streak').textContent = `🔥 Streak: ${streak}`;
  document.getElementById('quiz-progress-bar').style.width = `${((currentQ + 1) / quizData.length) * 100}%`;

  const nextBtn = document.getElementById('next-btn');
  nextBtn.textContent = currentQ === quizData.length - 1 ? 'See Final Score 🎉' : 'Next Question →';
  nextBtn.classList.remove('hidden');
  document.getElementById('plot-quiz-btn').classList.remove('hidden');
}

function plotCurrentQuizInStudio() {
  const q = quizData[currentQ];
  if (q.useFracMode) setInputMode('fraction');
  loadCoefs(...q.coefs);
  document.getElementById('playground').scrollIntoView({ behavior: 'smooth' });
}

function nextQuestion() {
  currentQ++;
  if (currentQ < quizData.length) {
    loadQuestion();
  } else {
    showFinalQuizResult();
  }
}

function showFinalQuizResult() {
  const box = document.getElementById('quiz-box');
  if (score >= 4) launchConfetti();

  const verdict = score === quizData.length
    ? "Flawless 6/6! You’ve completely mastered ratios, fractions, and consistency."
    : score >= 4
    ? "Awesome work! You have a solid grip on linear equation systems."
    : "Nice warm-up! Play with the Fraction Mode & Step-by-Step Breakdown above, then challenge yourself again.";

  box.innerHTML = `
    <div style="text-align:center; padding: 18px 0;">
      <div style="font-size: 2.6rem; margin-bottom: 10px;">${score >= 4 ? '🏆' : '📘'}</div>
      <h3 style="font-size: 1.7rem; margin-bottom: 10px;">Challenge Complete!</h3>
      <p style="font-size: 1.35rem; font-weight: 800; color: var(--blue); margin-bottom: 12px;">
        Final Score: ${score} / ${quizData.length}
      </p>
      <p style="color: var(--muted); max-width: 520px; margin: 0 auto 24px;">${verdict}</p>
      <button class="btn btn-primary" onclick="restartQuiz()">Play Again ↺</button>
    </div>
  `;
}

function restartQuiz() {
  currentQ = 0;
  score = 0;
  streak = 0;
  const box = document.getElementById('quiz-box');
  box.innerHTML = `
    <div class="quiz-header-bar">
      <div class="quiz-meta">
        <span id="quiz-progress"></span>
        <span class="streak-badge" id="quiz-streak"></span>
      </div>
      <span class="score-pill" id="quiz-score"></span>
    </div>
    <div class="progress-track"><div class="progress-fill" id="quiz-progress-bar"></div></div>
    <div class="quiz-equations" id="quiz-eqs"></div>
    <div class="quiz-question-text" id="quiz-prompt"></div>
    <div class="options-list" id="quiz-options"></div>
    <div class="quiz-feedback" id="quiz-feedback"></div>
    <div class="quiz-footer">
      <button class="btn btn-outline hidden" id="plot-quiz-btn" onclick="plotCurrentQuizInStudio()">📈 Visualize This in Graph Studio</button>
      <button class="btn btn-primary hidden" id="next-btn" onclick="nextQuestion()">Next Question →</button>
    </div>
  `;
  loadQuestion();
}

/* =========================================================
   8. CONFETTI CELEBRATION EFFECT
   ========================================================= */
function launchConfetti() {
  const c = document.getElementById('confettiCanvas');
  const cx = c.getContext('2d');
  c.width = window.innerWidth;
  c.height = window.innerHeight;

  const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];
  const particles = Array.from({ length: 110 }, () => ({
    x: Math.random() * c.width,
    y: -20 - Math.random() * 140,
    w: 7 + Math.random() * 6,
    h: 4 + Math.random() * 5,
    vx: (Math.random() - 0.5) * 4,
    vy: 2.5 + Math.random() * 4,
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 0.2,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));

  let frames = 0;
  function tick() {
    cx.clearRect(0, 0, c.width, c.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      cx.save();
      cx.translate(p.x, p.y);
      cx.rotate(p.rot);
      cx.fillStyle = p.color;
      cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cx.restore();
    });
    frames++;
    if (frames < 170) requestAnimationFrame(tick);
    else cx.clearRect(0, 0, c.width, c.height);
  }
  tick();
}

/* =========================================================
   INIT
   ========================================================= */
syncAllInputsFromState();
loadQuestion();
requestAnimationFrame(renderLoop);
