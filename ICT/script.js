/* ==========================================================================
   Crack the Pattern! – Exploring Sequences & Series
   Pure Vanilla JavaScript — Well-Commented & Beginner Friendly
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeroMiniGame();
  initPatternDetective();
  initExampleTabs();
  initVisualizerLab();
  initShowdown();
  initPracticeQuiz();
});

/* Helper: Format numbers cleanly without floating-point clutter */
function fmtNum(val) {
  if (!Number.isFinite(val)) return '∞';
  const rounded = Math.round(val * 10000) / 10000;
  if (Math.abs(rounded) >= 1e7) {
    return rounded.toExponential(2);
  }
  return Number.isInteger(rounded)
    ? rounded.toLocaleString('en-IN')
    : parseFloat(rounded.toFixed(4)).toString();
}

/* Helper: Format Indian Rupees nicely (e.g., ₹1,07,37,41,823) */
function fmtINR(amount) {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

/* ==========================================================================
   1. NAVIGATION, ACTIVE SCROLL HIGHLIGHT & CLASSROOM TEACH MODE
   ========================================================================== */
function initNavigation() {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const presentToggle = document.getElementById('presentToggle');
  const presentLabel = document.getElementById('presentLabel');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Classroom presentation mode toggle (enlarges text for projectors)
  presentToggle.addEventListener('click', () => {
    const active = document.documentElement.classList.toggle('presentation-mode');
    presentToggle.classList.toggle('active', active);
    presentLabel.textContent = active ? 'Normal Size' : 'Teach Mode';
  });

  // Highlight active nav item while scrolling
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const pos = window.scrollY + 135;
    sections.forEach((sec) => {
      const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
      if (!link) return;
      if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });
}

/* ==========================================================================
   2. HERO LIVE MINI-GAME: GUESS THE NEXT NUMBER
   ========================================================================== */
const heroPatterns = [
  {
    tag: 'Pattern #1 • Arithmetic Progression (AP)',
    terms: [3, 7, 11, 15],
    answer: 19,
    choices: [17, 19, 21, 23],
    hint: 'Check the gap between consecutive numbers: 7 − 3 = +4!',
    rule: 'Add 4 each time (AP with d = 4): 15 + 4 = 19.'
  },
  {
    tag: 'Pattern #2 • Geometric Progression (GP)',
    terms: [2, 6, 18, 54],
    answer: 162,
    choices: [108, 156, 162, 216],
    hint: 'Each number is multiplied by the same factor: 6 ÷ 2 = ×3!',
    rule: 'Multiply by 3 each time (GP with r = 3): 54 × 3 = 162.'
  },
  {
    tag: 'Pattern #3 • Fibonacci Sequence',
    terms: [1, 1, 2, 3, 5, 8],
    answer: 13,
    choices: [11, 12, 13, 16],
    hint: 'Try adding the two numbers right before each term!',
    rule: 'Add the previous two terms (Fibonacci): 5 + 8 = 13.'
  },
  {
    tag: 'Pattern #4 • Countdown AP',
    terms: [50, 43, 36, 29],
    answer: 22,
    choices: [21, 22, 23, 24],
    hint: 'This staircase goes DOWN by the same amount each step!',
    rule: 'Subtract 7 each time (AP with d = −7): 29 − 7 = 22.'
  },
  {
    tag: 'Pattern #5 • Shrinking GP',
    terms: [64, 32, 16, 8],
    answer: 4,
    choices: [2, 4, 6, 0],
    hint: 'Every term is divided by 2 (multiplied by 0.5).',
    rule: 'Multiply by 1/2 each time (GP with r = 0.5): 8 × 0.5 = 4.'
  },
  {
    tag: 'Pattern #6 • Perfect Squares',
    terms: [1, 4, 9, 16, 25],
    answer: 36,
    choices: [32, 35, 36, 49],
    hint: 'Look at 1×1, 2×2, 3×3, 4×4, 5×5…',
    rule: 'Square numbers (n²): the 6th term is 6² = 36.'
  }
];

function initHeroMiniGame() {
  let idx = 0;
  let streak = 0;
  let answered = false;

  const tagEl = document.getElementById('heroPatternHintTag');
  const stripEl = document.getElementById('heroSeqStrip');
  const choicesEl = document.getElementById('heroChoices');
  const feedbackEl = document.getElementById('heroGameFeedback');
  const streakEl = document.getElementById('heroStreak');
  const hintBtn = document.getElementById('heroHintBtn');
  const nextBtn = document.getElementById('heroNextBtn');

  function renderPattern() {
    answered = false;
    const item = heroPatterns[idx];
    tagEl.textContent = item.tag;
    feedbackEl.classList.add('hidden');
    feedbackEl.className = 'hero-game-feedback hidden';

    stripEl.innerHTML =
      item.terms.map((n) => `<span class="seq-tile">${n}</span>`).join('') +
      `<span class="seq-tile mystery-tile" id="heroMysteryTile">?</span>`;

    choicesEl.innerHTML = item.choices
      .map((c) => `<button class="hero-choice-btn" type="button" data-val="${c}">${c}</button>`)
      .join('');

    choicesEl.querySelectorAll('.hero-choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const picked = Number(btn.dataset.val);
        const isCorrect = picked === item.answer;

        choicesEl.querySelectorAll('.hero-choice-btn').forEach((b) => {
          b.disabled = true;
          const v = Number(b.dataset.val);
          if (v === item.answer) b.classList.add('correct');
          if (v === picked && !isCorrect) b.classList.add('wrong');
        });

        const tile = document.getElementById('heroMysteryTile');
        tile.textContent = item.answer;
        tile.classList.remove('mystery-tile');
        tile.classList.add('solved-tile');

        streak = isCorrect ? streak + 1 : 0;
        streakEl.textContent = streak;

        feedbackEl.className = `hero-game-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
        feedbackEl.innerHTML = `<strong>${isCorrect ? '🎯 Nailed it!' : '💡 Good try!'}</strong> ${item.rule}`;
        feedbackEl.classList.remove('hidden');
      });
    });
  }

  hintBtn.addEventListener('click', () => {
    const item = heroPatterns[idx];
    feedbackEl.className = 'hero-game-feedback feedback-correct';
    feedbackEl.innerHTML = `<strong>💡 Hint:</strong> ${item.hint}`;
    feedbackEl.classList.remove('hidden');
  });

  nextBtn.addEventListener('click', () => {
    idx = (idx + 1) % heroPatterns.length;
    renderPattern();
  });

  renderPattern();
}

/* ==========================================================================
   3. SECTION 2: INTUITION FIRST – PATTERN DETECTIVE (4 REAL-WORLD CARDS)
   ========================================================================== */
const detectiveCases = [
  {
    icon: '🐷',
    type: 'Case 1 • Weekly Savings (AP)',
    title: 'The Steady Piggy Bank',
    story: 'You start with ₹100 in Week 1 and add ₹50 every week. How much will you have in Week 5?',
    seq: '₹100, ₹150, ₹200, ₹250, ?',
    options: ['₹275', '₹300', '₹350'],
    correct: 1,
    explanation:
      '<strong>₹300!</strong> Because you add the exact same ₹50 each week, this is an <strong>Arithmetic Progression (AP)</strong> with a = 100 and d = +50 — just like climbing equal stairs!'
  },
  {
    icon: '🦠',
    type: 'Case 2 • Viral Growth (GP)',
    title: 'Doubling Bacteria',
    story: 'A lab dish starts with 10 bacteria in Hour 1, and the count DOUBLES every hour. How many in Hour 5?',
    seq: '10, 20, 40, 80, ?',
    options: ['100', '120', '160'],
    correct: 2,
    explanation:
      '<strong>160!</strong> Here you <em>multiply</em> by 2 each hour (80 × 2 = 160). Multiplying by a constant ratio creates a <strong>Geometric Progression (GP)</strong> with a = 10 and r = 2.'
  },
  {
    icon: '🌻',
    type: 'Case 3 • Nature’s Code (Fibonacci)',
    title: 'Sunflower Petal Spiral',
    story: 'Count the petals on lilies, buttercups, and daisies: 1, 1, 2, 3, 5, 8… What number appears next?',
    seq: '1, 1, 2, 3, 5, 8, ?',
    options: ['11', '13', '16'],
    correct: 1,
    explanation:
      '<strong>13!</strong> Each term is the sum of the two before it (5 + 8 = 13). This famous <strong>Fibonacci Sequence</strong> shows up across flowers, pinecones, and spiral shells!'
  },
  {
    icon: '🏀',
    type: 'Case 4 • Shrinking Bounce (Converging GP)',
    title: 'The Bouncing Basketball',
    story: 'A ball bounces to 80 cm, then half as high each bounce: 80, 40, 20, 10… How high is Bounce 5?',
    seq: '80 cm, 40 cm, 20 cm, 10 cm, ?',
    options: ['5 cm', '2 cm', '0 cm'],
    correct: 0,
    explanation:
      '<strong>5 cm!</strong> Multiplying by r = 0.5 (1/2) makes every bounce shrink toward zero. Even if it bounced infinitely many times, its total height stays finite (a <strong>converging GP</strong>)!'
  }
];

function initPatternDetective() {
  const grid = document.getElementById('detectiveGrid');

  detectiveCases.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'detective-card';

    const choicesHtml = item.options
      .map((opt, i) => `<button class="choice-pill" type="button" data-i="${i}">${opt}</button>`)
      .join('');

    card.innerHTML = `
      <div class="det-head">
        <div class="det-icon">${item.icon}</div>
        <div>
          <span class="det-badge">${item.type}</span>
          <h3>${item.title}</h3>
        </div>
      </div>
      <p class="det-story">${item.story}</p>
      <div class="det-seq">${item.seq}</div>
      <div class="det-choices">${choicesHtml}</div>
      <div class="det-reveal hidden" id="detReveal-${index}"></div>
    `;

    const buttons = card.querySelectorAll('.choice-pill');
    const reveal = card.querySelector(`#detReveal-${index}`);

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const chosen = Number(btn.dataset.i);
        const isCorrect = chosen === item.correct;

        buttons.forEach((b, i) => {
          b.disabled = true;
          if (i === item.correct) b.classList.add('correct');
          if (i === chosen && !isCorrect) b.classList.add('wrong');
        });

        reveal.className = `det-reveal ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
        reveal.innerHTML = `${isCorrect ? '✅ Great detective work! ' : '💡 Look closely: '}${item.explanation}`;
        reveal.classList.remove('hidden');
      });
    });

    grid.appendChild(card);
  });
}

/* ==========================================================================
   4. SECTION 3: TABBED WORKED EXAMPLES
   ========================================================================== */
function initExampleTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      buttons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById(target).classList.add('active');
    });
  });
}

/* ==========================================================================
   5. SECTION 4: INTERACTIVE AP & GP VISUALIZER LAB
   ========================================================================== */
function initVisualizerLab() {
  let mode = 'ap'; // 'ap' or 'gp'

  const modeApBtn = document.getElementById('modeApBtn');
  const modeGpBtn = document.getElementById('modeGpBtn');
  const controlTitle = document.getElementById('labControlTitle');
  const groupD = document.getElementById('groupD');
  const groupR = document.getElementById('groupR');

  const sliderA = document.getElementById('sliderA');
  const inputA = document.getElementById('inputA');
  const sliderD = document.getElementById('sliderD');
  const inputD = document.getElementById('inputD');
  const sliderR = document.getElementById('sliderR');
  const inputR = document.getElementById('inputR');
  const sliderN = document.getElementById('sliderN');
  const inputN = document.getElementById('inputN');

  const patternBadge = document.getElementById('labPatternBadge');
  const chartHint = document.getElementById('labChartHint');
  const termsFlow = document.getElementById('labTermsFlow');
  const barChart = document.getElementById('labBarChart');
  const liveAnSteps = document.getElementById('liveAnSteps');
  const liveSnSteps = document.getElementById('liveSnSteps');
  const liveInfCard = document.getElementById('liveInfCard');

  function setMode(newMode) {
    mode = newMode;
    modeApBtn.classList.toggle('active', mode === 'ap');
    modeGpBtn.classList.toggle('active', mode === 'gp');
    groupD.classList.toggle('hidden', mode !== 'ap');
    groupR.classList.toggle('hidden', mode !== 'gp');
    controlTitle.textContent = mode === 'ap' ? '🎛️ AP Controls (Constant Difference)' : '🎛️ GP Controls (Constant Ratio)';
    renderLab();
  }

  function syncPair(slider, input, minVal, maxVal) {
    slider.addEventListener('input', () => {
      input.value = slider.value;
      renderLab();
    });
    input.addEventListener('input', () => {
      let v = parseFloat(input.value);
      if (Number.isNaN(v)) return;
      v = Math.max(minVal, Math.min(maxVal, v));
      slider.value = v;
      renderLab();
    });
  }

  syncPair(sliderA, inputA, -20, 50);
  syncPair(sliderD, inputD, -20, 20);
  syncPair(sliderR, inputR, -3, 3);
  syncPair(sliderN, inputN, 2, 12);

  modeApBtn.addEventListener('click', () => setMode('ap'));
  modeGpBtn.addEventListener('click', () => setMode('gp'));

  // Quick presets for live classroom teaching
  const presets = {
    stairs:    { mode: 'ap', a: 3,  d: 4,  r: 2,    n: 7 },
    countdown: { mode: 'ap', a: 18, d: -3, r: 2,    n: 8 },
    doubling:  { mode: 'gp', a: 2,  d: 4,  r: 2,    n: 7 },
    shrink:    { mode: 'gp', a: 16, d: 4,  r: 0.5,  n: 7 },
    alternate: { mode: 'gp', a: 16, d: 4,  r: -0.5, n: 7 }
  };

  document.querySelectorAll('.preset-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = presets[btn.dataset.preset];
      sliderA.value = inputA.value = p.a;
      sliderD.value = inputD.value = p.d;
      sliderR.value = inputR.value = p.r;
      sliderN.value = inputN.value = p.n;
      setMode(p.mode);
    });
  });

  function renderLab() {
    const a = parseFloat(inputA.value) || 0;
    const d = parseFloat(inputD.value) || 0;
    const r = parseFloat(inputR.value) || 0;
    const n = Math.max(2, Math.min(12, parseInt(inputN.value, 10) || 6));

    // 1. Generate all n terms
    const terms = [];
    for (let i = 0; i < n; i++) {
      if (mode === 'ap') {
        terms.push(a + i * d);
      } else {
        terms.push(a * Math.pow(r, i));
      }
    }

    const nthTerm = terms[n - 1];
    let sumVal = 0;

    // 2. Render terms strip with +d or ×r connectors
    const stepText = mode === 'ap' ? (d >= 0 ? `+${fmtNum(d)}` : `${fmtNum(d)}`) : `×${fmtNum(r)}`;
    termsFlow.innerHTML = terms
      .map((val, idx) => {
        const cls = `term-chip ${mode === 'gp' ? 'term-gp' : ''} ${idx === n - 1 ? 'term-last' : ''}`;
        const arrow = idx < n - 1 ? `<span class="term-step-arrow">${stepText}</span>` : '';
        return `<span class="${cls}" title="Term a${idx + 1}">${fmtNum(val)}</span>${arrow}`;
      })
      .join('');

    // 3. Render animated bars scaled cleanly by largest absolute magnitude
    const maxAbs = Math.max(...terms.map((t) => Math.abs(t)), 1);
    barChart.innerHTML = terms
      .map((val, idx) => {
        const pct = Math.max((Math.abs(val) / maxAbs) * 100, val === 0 ? 3 : 7);
        const barCls = val < 0 ? 'neg-bar' : mode === 'ap' ? 'ap-bar' : 'gp-bar';
        return `
          <div class="vbar-col">
            <div class="vbar-val" title="a${idx + 1} = ${fmtNum(val)}">${fmtNum(val)}</div>
            <div class="vbar-track">
              <div class="vbar-fill ${barCls}" style="height: ${pct.toFixed(1)}%;"></div>
            </div>
            <div class="vbar-label">a<sub>${idx + 1}</sub></div>
          </div>
        `;
      })
      .join('');

    // 4. Update live step-by-step formulas & pattern hints
    if (mode === 'ap') {
      sumVal = (n / 2) * (2 * a + (n - 1) * d);
      patternBadge.textContent = d > 0 ? `Rising Staircase (+${fmtNum(d)})` : d < 0 ? `Falling Staircase (${fmtNum(d)})` : 'Flat Constant Sequence';
      chartHint.textContent = 'Notice the straight, equal step between every bar!';

      liveAnSteps.innerHTML = `
        a<sub>n</sub> = a + (n − 1)d<br />
        a<sub>${n}</sub> = ${fmtNum(a)} + (${n} − 1)(${fmtNum(d)})<br />
        a<sub>${n}</sub> = ${fmtNum(a)} + ${fmtNum((n - 1) * d)}<br />
        <span class="lm-final">a<sub>${n}</sub> = ${fmtNum(nthTerm)}</span>
      `;

      liveSnSteps.innerHTML = `
        S<sub>n</sub> = (n / 2)(a + a<sub>n</sub>)<br />
        S<sub>${n}</sub> = (${n} / 2)(${fmtNum(a)} + ${fmtNum(nthTerm)})<br />
        S<sub>${n}</sub> = ${fmtNum(n / 2)} × ${fmtNum(a + nthTerm)}<br />
        <span class="lm-final">S<sub>${n}</sub> = ${fmtNum(sumVal)}</span>
      `;

      liveInfCard.classList.add('hidden');
    } else {
      // GP calculations (safely handle r === 1)
      if (r === 1) {
        sumVal = n * a;
      } else {
        sumVal = (a * (Math.pow(r, n) - 1)) / (r - 1);
      }

      if (Math.abs(r) > 1) {
        patternBadge.textContent = r > 1 ? `Explosive Growth (×${fmtNum(r)})` : `Alternating Growth (×${fmtNum(r)})`;
        chartHint.textContent = 'Watch how rapidly the exponential bars shoot up!';
      } else if (Math.abs(r) < 1) {
        patternBadge.textContent = `Shrinking & Converging (×${fmtNum(r)})`;
        chartHint.textContent = 'Bars shrink toward 0 — even an infinite sum stays finite!';
      } else {
        patternBadge.textContent = r === 1 ? 'Constant GP (r = 1)' : 'Flip-Flop GP (r = −1)';
        chartHint.textContent = 'Every bar keeps the exact same magnitude!';
      }

      liveAnSteps.innerHTML = `
        a<sub>n</sub> = a · r<sup>n−1</sup><br />
        a<sub>${n}</sub> = ${fmtNum(a)} × (${fmtNum(r)})<sup>${n - 1}</sup><br />
        a<sub>${n}</sub> = ${fmtNum(a)} × ${fmtNum(Math.pow(r, n - 1))}<br />
        <span class="lm-final">a<sub>${n}</sub> = ${fmtNum(nthTerm)}</span>
      `;

      if (r === 1) {
        liveSnSteps.innerHTML = `
          Since r = 1, S<sub>n</sub> = n · a<br />
          S<sub>${n}</sub> = ${n} × ${fmtNum(a)}<br />
          <span class="lm-final">S<sub>${n}</sub> = ${fmtNum(sumVal)}</span>
        `;
      } else {
        liveSnSteps.innerHTML = `
          S<sub>n</sub> = a(r<sup>n</sup> − 1) / (r − 1)<br />
          S<sub>${n}</sub> = ${fmtNum(a)}((${fmtNum(r)})<sup>${n}</sup> − 1) / (${fmtNum(r)} − 1)<br />
          <span class="lm-final">S<sub>${n}</sub> = ${fmtNum(sumVal)}</span>
        `;
      }

      // Infinite sum convergence panel
      liveInfCard.classList.remove('hidden');
      if (Math.abs(r) < 1) {
        const sInf = a / (1 - r);
        liveInfCard.className = 'inf-card inf-converges';
        liveInfCard.innerHTML = `
          <strong>♾️ Converging Infinite Series (|r| = ${fmtNum(Math.abs(r))} &lt; 1):</strong><br />
          S<sub>∞</sub> = a / (1 − r) = ${fmtNum(a)} / (1 − ${fmtNum(r)}) = <strong>${fmtNum(sInf)}</strong>.
          Your current sum S<sub>${n}</sub> = ${fmtNum(sumVal)} is already closing in on <strong>${fmtNum(sInf)}</strong>!
        `;
      } else {
        liveInfCard.className = 'inf-card inf-diverges';
        liveInfCard.innerHTML = `
          <strong>📈 Diverges (|r| = ${fmtNum(Math.abs(r))} ≥ 1):</strong>
          Because the terms do not shrink toward 0, adding infinitely many terms does not settle to a finite number. Try setting <strong>r = 0.5</strong>!
        `;
      }
    }
  }

  renderLab();
}

/* ==========================================================================
   6. SECTION 5: LINEAR VS. EXPONENTIAL SHOWDOWN (30-DAY SALARY CHALLENGE)
   ========================================================================== */
function initShowdown() {
  let userPick = null;
  let currentDay = 1;
  let playTimer = null;

  const pickA = document.getElementById('pickOptionA');
  const pickB = document.getElementById('pickOptionB');
  const betBanner = document.getElementById('showdownBetBanner');
  const dayLabel = document.getElementById('showdownDayLabel');
  const slider = document.getElementById('showdownSlider');
  const apDailyEl = document.getElementById('apDailyPay');
  const gpDailyEl = document.getElementById('gpDailyPay');
  const apTotalEl = document.getElementById('apTotalPay');
  const gpTotalEl = document.getElementById('gpTotalPay');
  const apFill = document.getElementById('apRaceFill');
  const gpFill = document.getElementById('gpRaceFill');
  const commentary = document.getElementById('showdownCommentary');
  const autoPlayBtn = document.getElementById('autoPlayShowdownBtn');
  const dayBtns = document.querySelectorAll('.day-btn');

  function setBet(choice) {
    userPick = choice;
    pickA.classList.toggle('picked', choice === 'A');
    pickB.classList.toggle('picked', choice === 'B');
    betBanner.classList.remove('hidden');
    betBanner.innerHTML =
      choice === 'A'
        ? '🔒 You bet on <strong>Option A (₹10,000/day AP)</strong>! Now step through the days or hit Auto-Play to see if it holds up!'
        : '🔒 You bet on <strong>Option B (₹1 doubled daily GP)</strong>! Step through the days or hit Auto-Play to watch exponential power!';
    updateShowdown(currentDay);
  }

  pickA.addEventListener('click', () => setBet('A'));
  pickB.addEventListener('click', () => setBet('B'));

  function updateShowdown(day) {
    currentDay = day;
    slider.value = day;
    dayLabel.textContent = `Day ${day}`;

    dayBtns.forEach((btn) => {
      btn.classList.toggle('active', Number(btn.dataset.day) === day);
    });

    const apDaily = 10000;
    const apTotal = 10000 * day;
    const gpDaily = Math.pow(2, day - 1);
    const gpTotal = Math.pow(2, day) - 1;

    apDailyEl.textContent = fmtINR(apDaily);
    gpDailyEl.textContent = fmtINR(gpDaily);
    apTotalEl.textContent = fmtINR(apTotal);
    gpTotalEl.textContent = fmtINR(gpTotal);

    // Visual race bars scaled relative to the current leader on that day
    const leader = Math.max(apTotal, gpTotal, 1);
    const apPct = Math.max((apTotal / leader) * 100, 1.5);
    const gpPct = Math.max((gpTotal / leader) * 100, 1.5);
    apFill.style.width = `${apPct.toFixed(1)}%`;
    gpFill.style.width = `${gpPct.toFixed(1)}%`;

    // Engaging live commentary reacting to the exact day
    if (day === 1) {
      commentary.innerHTML =
        '<strong>Day 1:</strong> Option A starts massively ahead with <strong>₹10,000</strong> vs just <strong>₹1</strong> for Option B. Option B looks like a terrible deal!';
    } else if (day <= 14) {
      commentary.innerHTML =
        `<strong>Day ${day}:</strong> Option A is crushing it (<strong>${fmtINR(apTotal)}</strong> vs <strong>${fmtINR(gpTotal)}</strong>). Linear growth feels unstoppable early on!`;
    } else if (day <= 17) {
      commentary.innerHTML =
        `<strong>Day ${day} Warning!</strong> Option B's <em>daily</em> pay (${fmtINR(gpDaily)}) has already beaten ₹10,000/day — and the gap in total money is closing super fast!`;
    } else if (day === 18) {
      commentary.innerHTML =
        `<strong>⚡ DAY 18 PLOT TWIST!</strong> Option B's total (<strong>${fmtINR(gpTotal)}</strong>) just <strong>OVERTAKES</strong> Option A's total (<strong>${fmtINR(apTotal)}</strong>) for the very first time!`;
    } else if (day < 30) {
      commentary.innerHTML =
        `<strong>Day ${day}:</strong> Exponential takeoff! Option B has reached <strong>${fmtINR(gpTotal)}</strong> while Option A crawls at <strong>${fmtINR(apTotal)}</strong>.`;
    } else {
      const verdict =
        userPick === 'B'
          ? '🎉 Your bet on Option B WON big time!'
          : userPick === 'A'
          ? '😲 Surprise! Option B beat Option A by over 3,579 times!'
          : '🚀 Mind blown!';
      commentary.innerHTML =
        `<strong>🏆 Day 30 Final Result:</strong> ${verdict} Option A gives <strong>₹3,00,000</strong> (₹3 Lakh), while Option B explodes to <strong>${fmtINR(gpTotal)}</strong> (over <strong>₹107.37 Crore</strong>)! That is the true power of a Geometric Series.`;
    }
  }

  slider.addEventListener('input', () => {
    stopAutoPlay();
    updateShowdown(Number(slider.value));
  });

  dayBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      stopAutoPlay();
      updateShowdown(Number(btn.dataset.day));
    });
  });

  function stopAutoPlay() {
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
      autoPlayBtn.textContent = '▶ Auto-Play';
    }
  }

  autoPlayBtn.addEventListener('click', () => {
    if (playTimer) {
      stopAutoPlay();
      return;
    }
    if (currentDay >= 30) currentDay = 1;
    autoPlayBtn.textContent = '⏸ Pause';
    updateShowdown(currentDay);
    playTimer = setInterval(() => {
      if (currentDay >= 30) {
        stopAutoPlay();
        return;
      }
      updateShowdown(currentDay + 1);
    }, 240);
  });

  updateShowdown(1);
}

/* ==========================================================================
   7. SECTION 6: INTERACTIVE PRACTICE QUIZ (10 MIXED EASY & MEDIUM QUESTIONS)
   ========================================================================== */
const quizQuestions = [
  {
    difficulty: 'Easy',
    question: 'What is the next term in the Arithmetic Progression: 4, 10, 16, 22, …?',
    options: ['26', '28', '30', '32'],
    correct: 1,
    explanation: 'Common difference d = 10 − 4 = 6. So next term = 22 + 6 = 28.'
  },
  {
    difficulty: 'Easy',
    question: 'Which of the following is a Geometric Progression (GP)?',
    options: ['2, 5, 8, 11, …', '5, 10, 20, 40, …', '1, 4, 9, 16, …', '10, 8, 6, 4, …'],
    correct: 1,
    explanation: 'In 5, 10, 20, 40…, each term is multiplied by a constant ratio r = 2.'
  },
  {
    difficulty: 'Easy',
    question: 'What is the main difference between a Sequence and a Series?',
    options: [
      'A sequence is an ordered list; a series is the sum of its terms',
      'A sequence only uses GP; a series only uses AP',
      'A sequence has no pattern; a series has a pattern',
      'They mean the exact same thing'
    ],
    correct: 0,
    explanation: 'A sequence lists terms with commas (2, 4, 6), while a series adds them up (2 + 4 + 6 = 12).'
  },
  {
    difficulty: 'Easy',
    question: 'Find the 8th term (a₈) of the AP with first term a = 3 and common difference d = 5.',
    options: ['35', '38', '40', '43'],
    correct: 1,
    explanation: 'Using aₙ = a + (n − 1)d: a₈ = 3 + (8 − 1) × 5 = 3 + 35 = 38.'
  },
  {
    difficulty: 'Easy',
    question: 'In the Fibonacci sequence 1, 1, 2, 3, 5, 8, 13, …, what is the next number?',
    options: ['18', '20', '21', '26'],
    correct: 2,
    explanation: 'Each term equals the sum of the previous two terms: 8 + 13 = 21.'
  },
  {
    difficulty: 'Medium',
    question: 'Find the 5th term (a₅) of the GP: 2, 6, 18, 54, …',
    options: ['108', '162', '216', '486'],
    correct: 1,
    explanation: 'Here a = 2 and r = 3. So a₅ = a · r⁴ = 2 × 3⁴ = 2 × 81 = 162.'
  },
  {
    difficulty: 'Medium',
    question: 'What is the sum of the first 10 natural numbers: 1 + 2 + 3 + … + 10?',
    options: ['45', '50', '55', '60'],
    correct: 2,
    explanation: 'Using Sₙ = n(n + 1) / 2 = (10 × 11) / 2 = 110 / 2 = 55.'
  },
  {
    difficulty: 'Medium',
    question: 'Find the sum of the first 5 terms of the GP: 1 + 2 + 4 + 8 + 16.',
    options: ['30', '31', '32', '63'],
    correct: 1,
    explanation: 'Using S₅ = 1(2⁵ − 1) / (2 − 1) = 32 − 1 = 31 (or add directly: 1+2+4+8+16 = 31).'
  },
  {
    difficulty: 'Medium',
    question: 'Find the infinite sum (S∞) of the converging GP: 10 + 5 + 2.5 + 1.25 + …',
    options: ['15', '18.75', '20', 'Infinity'],
    correct: 2,
    explanation: 'Here a = 10 and r = 0.5 (since |r| < 1). S∞ = a / (1 − r) = 10 / (1 − 0.5) = 10 / 0.5 = 20.'
  },
  {
    difficulty: 'Medium',
    question: 'A runner jogs 2 km on Day 1 and increases distance by 0.5 km every day. How far does she jog on Day 7?',
    options: ['4.5 km', '5 km', '5.5 km', '6 km'],
    correct: 1,
    explanation: 'This is an AP with a = 2 and d = 0.5. On Day 7: a₇ = 2 + (7 − 1)(0.5) = 2 + 3 = 5 km.'
  }
];

function initPracticeQuiz() {
  let idx = 0;
  let score = 0;
  const userAnswers = [];

  const progressText = document.getElementById('quizProgressText');
  const diffBadge = document.getElementById('quizDiffBadge');
  const scoreDisplay = document.getElementById('quizScoreDisplay');
  const progressBar = document.getElementById('quizProgressBar');
  const questionArea = document.getElementById('quizQuestionArea');
  const resultArea = document.getElementById('quizResultArea');
  const questionText = document.getElementById('quizQuestionText');
  const optionsBox = document.getElementById('quizOptions');
  const feedbackBox = document.getElementById('quizFeedback');
  const nextBtn = document.getElementById('quizNextBtn');

  function showQuestion() {
    const q = quizQuestions[idx];
    progressText.textContent = `Question ${idx + 1} of ${quizQuestions.length}`;
    diffBadge.textContent = q.difficulty;
    diffBadge.className = `diff-badge ${q.difficulty === 'Easy' ? 'diff-easy' : 'diff-medium'}`;
    progressBar.style.width = `${((idx + 1) / quizQuestions.length) * 100}%`;

    questionText.textContent = `${idx + 1}. ${q.question}`;
    feedbackBox.classList.add('hidden');
    nextBtn.classList.add('hidden');

    optionsBox.innerHTML = q.options
      .map(
        (opt, i) =>
          `<button class="option-btn" type="button" data-i="${i}"><strong>${String.fromCharCode(65 + i)}.</strong> ${opt}</button>`
      )
      .join('');

    const btns = optionsBox.querySelectorAll('.option-btn');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const chosen = Number(btn.dataset.i);
        const isRight = chosen === q.correct;

        userAnswers.push({ q, chosen, isRight });
        if (isRight) {
          score++;
          scoreDisplay.textContent = score;
        }

        btns.forEach((b, i) => {
          b.disabled = true;
          if (i === q.correct) b.classList.add('correct');
          if (i === chosen && !isRight) b.classList.add('wrong');
        });

        feedbackBox.className = `feedback-box ${isRight ? 'feedback-correct' : 'feedback-wrong'}`;
        feedbackBox.innerHTML = `
          <strong>${isRight ? '✅ Spot on!' : `❌ Not quite — the correct answer is "${q.options[q.correct]}".`}</strong><br />
          ${q.explanation}
        `;
        feedbackBox.classList.remove('hidden');

        nextBtn.textContent = idx === quizQuestions.length - 1 ? 'View Final Score 🏆' : 'Next Question →';
        nextBtn.classList.remove('hidden');
      });
    });
  }

  function showResults() {
    questionArea.classList.add('hidden');
    resultArea.classList.remove('hidden');

    const pct = Math.round((score / quizQuestions.length) * 100);
    document.getElementById('resultScoreText').textContent = `${score} / ${quizQuestions.length} (${pct}%)`;

    const trophy = document.getElementById('resultTrophy');
    const heading = document.getElementById('resultHeading');
    const msg = document.getElementById('resultMessage');

    if (pct >= 80) {
      trophy.textContent = '🏆';
      heading.textContent = 'Sequence & Series Master!';
      msg.textContent = 'Awesome work! You can spot AP, GP, Fibonacci, and series sums like a pro.';
    } else if (pct >= 50) {
      trophy.textContent = '🌟';
      heading.textContent = 'Solid Progress!';
      msg.textContent = 'You’ve got the core ideas down. Check the review below and try for 10/10!';
    } else {
      trophy.textContent = '🚀';
      heading.textContent = 'Keep Practicing!';
      msg.textContent = 'Play with the AP & GP Visualizer Lab above, then give the quiz another shot!';
    }

    document.getElementById('resultReview').innerHTML = userAnswers
      .map(
        (entry, i) => `
          <div class="review-item ${entry.isRight ? 'rev-ok' : 'rev-no'}">
            <strong>Q${i + 1}: ${entry.q.question}</strong><br />
            Your answer: <em>${entry.q.options[entry.chosen]}</em> ${
              entry.isRight ? '✅' : `❌ (Correct: <strong>${entry.q.options[entry.q.correct]}</strong>)`
            }<br />
            <small>${entry.q.explanation}</small>
          </div>
        `
      )
      .join('');
  }

  nextBtn.addEventListener('click', () => {
    idx++;
    if (idx < quizQuestions.length) {
      showQuestion();
    } else {
      showResults();
    }
  });

  document.getElementById('restartQuizBtn').addEventListener('click', () => {
    idx = 0;
    score = 0;
    userAnswers.length = 0;
    scoreDisplay.textContent = '0';
    resultArea.classList.add('hidden');
    questionArea.classList.remove('hidden');
    showQuestion();
  });

  showQuestion();
}
