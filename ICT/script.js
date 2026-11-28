/* ==========================================================================
   Can Mathematics Predict Luck? – Exploring Probability
   Interactive Logic (Pure Vanilla JavaScript – Beginner Friendly!)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeroToys();
  initMysterySection();
  initProbabilityScale();
  initExampleTabs();
  initCoinLab();
  initDiceLab();
  initChallengeGame();
  initPracticeQuiz();
  initMysteryBagChallenge();
});

/* ==========================================================================
   1. MOBILE MENU & ACTIVE NAV LINK HIGHLIGHT
   ========================================================================== */
function initNavigation() {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

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

  // Highlight active section on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 130;
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        if (scrollPos >= top && scrollPos < top + height) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  });
}

/* ==========================================================================
   2. HERO INTERACTIVE TOYS (Coin, Die, Spinner)
   ========================================================================== */
function initHeroToys() {
  const heroCoinBtn = document.getElementById('heroCoinBtn');
  const heroDieBtn = document.getElementById('heroDieBtn');
  const heroDieFace = document.getElementById('heroDieFace');
  const heroSpinner = document.getElementById('heroSpinner');
  const dieUnicode = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  let spinnerAngle = 0;

  const flipHeroCoin = () => {
    const face = Math.random() < 0.5 ? 'H' : 'T';
    heroCoinBtn.querySelector('.hero-coin-face').textContent = face;
  };

  const rollHeroDie = () => {
    const idx = Math.floor(Math.random() * 6);
    heroDieFace.textContent = dieUnicode[idx];
  };

  const spinHeroWheel = () => {
    spinnerAngle += 360 + Math.floor(Math.random() * 360);
    heroSpinner.style.transform = `rotate(${spinnerAngle}deg)`;
  };

  heroCoinBtn.addEventListener('click', flipHeroCoin);
  heroDieBtn.addEventListener('click', rollHeroDie);
  heroSpinner.parentElement.addEventListener('click', spinHeroWheel);
}

/* ==========================================================================
   3. SECTION 2: THE MYSTERY OF CHANCE
   (Easy to edit: modify the questions array below!)
   ========================================================================== */
const mysteryQuestions = [
  {
    icon: '🪙',
    question: 'If you toss a coin, will you get Heads or Tails?',
    options: ['Definitely Heads', 'Definitely Tails', 'Impossible to know for sure!'],
    explanation:
      '<strong>You cannot be 100% sure!</strong> A fair coin has two equal sides, so Heads and Tails have the exact same chance — <strong>1 out of 2 (50%)</strong>.'
  },
  {
    icon: '🎲',
    question: 'If you roll a fair dice, can you predict the exact number?',
    options: ['Yes, with a trick', 'No, any number 1–6 can appear'],
    explanation:
      '<strong>No one can guarantee the exact number</strong> on a single fair roll! Each number from 1 to 6 has an equal <strong>1 out of 6</strong> chance of landing on top.'
  },
  {
    icon: '🔥',
    question: 'Is getting a 6 more difficult than getting a 2 on a fair dice?',
    options: ['Yes, 6 is harder!', 'No, both have the exact same chance'],
    explanation:
      '<strong>Surprise — getting a 6 is NOT harder!</strong> It only <em>feels</em> harder in games like Ludo because we wait eagerly for a 6. Mathematically, P(6) = 1/6 and P(2) = 1/6!'
  },
  {
    icon: '🔮',
    question: 'Can mathematics tell us how likely something is to happen?',
    options: ['Yes! Using Probability', 'No, luck has no math'],
    explanation:
      '<strong>Yes!</strong> Even though math cannot read the future for one single toss, <strong>Probability</strong> accurately measures how likely events are and predicts long-term patterns.'
  }
];

function initMysterySection() {
  const grid = document.getElementById('mysteryGrid');

  mysteryQuestions.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'mystery-card';

    const choicesHtml = item.options
      .map(
        (opt) =>
          `<button class="choice-pill" type="button" data-idx="${index}">${opt}</button>`
      )
      .join('');

    card.innerHTML = `
      <div class="mystery-head">
        <div class="mystery-icon">${item.icon}</div>
        <h3>${item.question}</h3>
      </div>
      <div class="mystery-choices">${choicesHtml}</div>
      <div class="mystery-reveal hidden" id="mysteryReveal-${index}">${item.explanation}</div>
    `;

    card.querySelectorAll('.choice-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        card.querySelectorAll('.choice-pill').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById(`mysteryReveal-${index}`).classList.remove('hidden');
      });
    });

    grid.appendChild(card);
  });
}

/* ==========================================================================
   4. SECTION 3: INTERACTIVE PROBABILITY SCALE & EXAMPLE TABS
   ========================================================================== */
function initProbabilityScale() {
  const slider = document.getElementById('probScaleSlider');
  const labelEl = document.getElementById('scaleLabel');
  const decimalEl = document.getElementById('scaleDecimal');
  const percentEl = document.getElementById('scalePercent');
  const exampleEl = document.getElementById('scaleExample');

  function updateScale(percentVal) {
    const dec = (percentVal / 100).toFixed(2);
    decimalEl.textContent = dec;
    percentEl.textContent = `${percentVal}%`;

    if (percentVal === 0) {
      labelEl.textContent = 'Impossible Event (0)';
      labelEl.style.background = '#f43f5e';
      exampleEl.textContent = 'Example: Rolling a 7 on a standard 6-sided die.';
    } else if (percentVal < 40) {
      labelEl.textContent = 'Unlikely Event';
      labelEl.style.background = '#f59e0b';
      exampleEl.textContent = 'Example: Rolling a 6 on a die (16.7%) or picking a Heart from a deck of cards (25%).';
    } else if (percentVal <= 60) {
      labelEl.textContent = 'Equally Likely (Even Chance)';
      labelEl.style.background = '#0ea5e9';
      exampleEl.textContent = 'Example: Getting Heads on a fair coin (50%) or rolling an even number on a die (50%).';
    } else if (percentVal < 100) {
      labelEl.textContent = 'Likely Event';
      labelEl.style.background = '#10b981';
      exampleEl.textContent = 'Example: Rolling a number greater than 1 on a die (5/6 ≈ 83%) or picking a red ball from 8 red & 2 blue balls.';
    } else {
      labelEl.textContent = 'Certain Event (1)';
      labelEl.style.background = '#4f46e5';
      exampleEl.textContent = 'Example: Rolling a number between 1 and 6 on a standard die, or Tuesday coming after Monday.';
    }
  }

  slider.addEventListener('input', (e) => updateScale(Number(e.target.value)));

  document.querySelectorAll('.scale-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pct = Math.round(Number(btn.dataset.val) * 100);
      slider.value = pct;
      updateScale(pct);
    });
  });

  updateScale(50);
}

function initExampleTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;
      buttons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById(targetId).classList.add('active');
    });
  });
}

/* ==========================================================================
   5. SECTION 4: INTERACTIVE COIN TOSS LAB
   ========================================================================== */
function initCoinLab() {
  let heads = 0;
  let tails = 0;
  let coinRotation = 0;
  const recentHistory = [];

  const virtualCoin = document.getElementById('virtualCoin');
  const outcomeBadge = document.getElementById('coinOutcomeBadge');
  const totalEl = document.getElementById('coinTotal');
  const headsEl = document.getElementById('coinHeadsCount');
  const tailsEl = document.getElementById('coinTailsCount');
  const headsProbEl = document.getElementById('coinHeadsProb');
  const tailsProbEl = document.getElementById('coinTailsProb');
  const barHeadsFill = document.getElementById('barHeadsFill');
  const barTailsFill = document.getElementById('barTailsFill');
  const barHeadsLabel = document.getElementById('barHeadsLabel');
  const barTailsLabel = document.getElementById('barTailsLabel');
  const historyEl = document.getElementById('coinHistory');

  function updateCoinUI(lastOutcomeText) {
    const total = heads + tails;
    totalEl.textContent = total;
    headsEl.textContent = heads;
    tailsEl.textContent = tails;

    const hPct = total === 0 ? 0 : (heads / total) * 100;
    const tPct = total === 0 ? 0 : (tails / total) * 100;
    const hDec = total === 0 ? '0.00' : (heads / total).toFixed(2);
    const tDec = total === 0 ? '0.00' : (tails / total).toFixed(2);

    headsProbEl.textContent = `P(H) = ${hPct.toFixed(1)}% (${hDec})`;
    tailsProbEl.textContent = `P(T) = ${tPct.toFixed(1)}% (${tDec})`;

    barHeadsFill.style.height = `${hPct}%`;
    barTailsFill.style.height = `${tPct}%`;
    barHeadsLabel.textContent = `${heads} (${hPct.toFixed(1)}%)`;
    barTailsLabel.textContent = `${tails} (${tPct.toFixed(1)}%)`;

    if (lastOutcomeText) {
      outcomeBadge.textContent = lastOutcomeText;
    }

    if (recentHistory.length === 0) {
      historyEl.innerHTML = '<span class="muted-note">No tosses yet</span>';
    } else {
      historyEl.innerHTML = recentHistory
        .map((r) => `<span class="hist-dot ${r === 'H' ? 'hist-h' : 'hist-t'}">${r}</span>`)
        .join('');
    }
  }

  function tossCoin(times) {
    let lastResult = 'H';
    let batchHeads = 0;
    let batchTails = 0;

    for (let i = 0; i < times; i++) {
      const isHeads = Math.random() < 0.5;
      if (isHeads) {
        heads++;
        batchHeads++;
        lastResult = 'H';
      } else {
        tails++;
        batchTails++;
        lastResult = 'T';
      }
      recentHistory.unshift(lastResult);
      if (recentHistory.length > 20) recentHistory.pop();
    }

    // Smooth 3D coin flip landing cleanly on Heads (0 mod 360) or Tails (180 mod 360)
    const baseSpins = 720; // 2 full spins
    const currentMod = coinRotation % 360;
    const targetMod = lastResult === 'H' ? 0 : 180;
    coinRotation += baseSpins + ((targetMod - currentMod + 360) % 360);
    virtualCoin.style.transform = `rotateY(${coinRotation}deg)`;

    const label =
      times === 1
        ? `Result: ${lastResult === 'H' ? '🟡 HEADS!' : '🟣 TAILS!'}`
        : `Tossed ${times} times: ${batchHeads} Heads, ${batchTails} Tails`;

    updateCoinUI(label);
  }

  document.getElementById('tossOneBtn').addEventListener('click', () => tossCoin(1));
  document.getElementById('tossTenBtn').addEventListener('click', () => tossCoin(10));
  document.getElementById('tossHundredBtn').addEventListener('click', () => tossCoin(100));
  document.getElementById('resetCoinBtn').addEventListener('click', () => {
    heads = 0;
    tails = 0;
    recentHistory.length = 0;
    coinRotation = 0;
    virtualCoin.style.transform = 'rotateY(0deg)';
    updateCoinUI('Ready to toss!');
  });

  updateCoinUI('Ready to toss!');
}

/* ==========================================================================
   6. SECTION 5: INTERACTIVE DICE LAB
   ========================================================================== */
function initDiceLab() {
  const counts = [0, 0, 0, 0, 0, 0];
  let totalRolls = 0;

  const virtualDie = document.getElementById('virtualDie');
  const outcomeBadge = document.getElementById('diceOutcomeBadge');
  const diceTotalEl = document.getElementById('diceTotal');
  const diceLastEl = document.getElementById('diceLast');
  const diceBarChart = document.getElementById('diceBarChart');
  const diceFreqGrid = document.getElementById('diceFreqGrid');

  // 3x3 grid dot layouts for faces 1–6
  const pipMaps = {
    1: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    2: [1, 0, 0, 0, 0, 0, 0, 0, 1],
    3: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    4: [1, 0, 1, 0, 0, 0, 1, 0, 1],
    5: [1, 0, 1, 0, 1, 0, 1, 0, 1],
    6: [1, 0, 1, 1, 0, 1, 1, 0, 1]
  };

  function renderDieFace(num) {
    virtualDie.innerHTML = pipMaps[num]
      .map((hasPip) => `<span class="${hasPip ? 'pip' : 'pip-empty'}"></span>`)
      .join('');
  }

  // Create the 6 bars and frequency cells once
  for (let n = 1; n <= 6; n++) {
    const col = document.createElement('div');
    col.className = 'bar-col';
    col.innerHTML = `
      <div class="bar-value" id="diceBarVal-${n}">0%</div>
      <div class="bar-track">
        <div class="bar-fill fill-dice-${n}" id="diceBarFill-${n}" style="height: 0%;"></div>
      </div>
      <div class="bar-name">${n}</div>
    `;
    diceBarChart.appendChild(col);

    const cell = document.createElement('div');
    cell.className = 'dice-freq-cell';
    cell.innerHTML = `Face ${n}<strong id="diceFreq-${n}">0</strong><span id="dicePct-${n}">0%</span>`;
    diceFreqGrid.appendChild(cell);
  }

  function updateDiceUI(lastNum, msg) {
    diceTotalEl.textContent = totalRolls;
    diceLastEl.textContent = lastNum ? lastNum : '—';
    if (msg) outcomeBadge.textContent = msg;

    for (let n = 1; n <= 6; n++) {
      const c = counts[n - 1];
      const pct = totalRolls === 0 ? 0 : (c / totalRolls) * 100;
      // Scale visual bar axis cleanly to max 40% so 16.7% sits nicely at ~42% height
      const barHeight = Math.min((pct / 40) * 100, 100);

      document.getElementById(`diceBarFill-${n}`).style.height = `${barHeight}%`;
      document.getElementById(`diceBarVal-${n}`).textContent = `${pct.toFixed(0)}%`;
      document.getElementById(`diceFreq-${n}`).textContent = c;
      document.getElementById(`dicePct-${n}`).textContent = `${pct.toFixed(1)}%`;
    }
  }

  function rollDice(times) {
    let lastRoll = 1;
    for (let i = 0; i < times; i++) {
      lastRoll = Math.floor(Math.random() * 6) + 1;
      counts[lastRoll - 1]++;
      totalRolls++;
    }

    virtualDie.classList.remove('rolling');
    void virtualDie.offsetWidth; // trigger CSS animation replay
    virtualDie.classList.add('rolling');

    renderDieFace(lastRoll);
    const msg =
      times === 1
        ? `🎲 You rolled a ${lastRoll}!`
        : `⚡ Rolled ${times} times! (Last roll: ${lastRoll})`;
    updateDiceUI(lastRoll, msg);
  }

  document.getElementById('rollOneBtn').addEventListener('click', () => rollDice(1));
  document.getElementById('rollTenBtn').addEventListener('click', () => rollDice(10));
  document.getElementById('rollSixtyBtn').addEventListener('click', () => rollDice(60));
  document.getElementById('resetDiceBtn').addEventListener('click', () => {
    counts.fill(0);
    totalRolls = 0;
    renderDieFace(5);
    updateDiceUI(null, 'Click Roll Dice to begin!');
  });

  renderDieFace(5);
  updateDiceUI(null, 'Click Roll Dice to begin!');
}

/* ==========================================================================
   7. SECTION 6: PROBABILITY CHALLENGE – PREDICT BEFORE YOU PLAY
   (Easy to edit: add or update items in challenges array!)
   ========================================================================== */
const challenges = [
  {
    tag: '🪙 Coin Mystery',
    visual: '🪙 🪙 🪙 ➡️ ❓',
    question:
      'Maya tossed a fair coin 3 times and got HEADS every single time (H, H, H). On her 4th toss, which outcome is more likely?',
    options: [
      'Tails is much more likely now',
      'Heads is on a lucky streak',
      'Heads and Tails are STILL equally likely (50-50)',
      'It is impossible to get Heads again'
    ],
    correct: 2,
    explanation:
      'A coin has no memory! Even after three Heads in a row, the 4th toss is completely fresh. Both Heads and Tails still have an equal probability of <strong>1/2 (50%)</strong>.'
  },
  {
    tag: '🎲 Dice Strategy',
    visual: '🎲 { 1, 2, 3, 4, 5, 6 }',
    question:
      'In a board game, you win a bonus if you roll a number GREATER than 4 on a fair die. What is your probability of winning?',
    options: ['1/6', '2/6 (which simplifies to 1/3)', '3/6 (1/2)', '4/6 (2/3)'],
    correct: 1,
    explanation:
      'The numbers greater than 4 are <strong>5 and 6</strong> — that is <strong>2 favourable outcomes</strong> out of <strong>6 possible outcomes</strong>. So P(> 4) = 2/6 = <strong>1/3</strong>!'
  },
  {
    tag: '🔴 Coloured Balls',
    visual: '🔴🔴🔴🔴 🔵 🟡🟡🟡🟡🟡',
    question:
      'A bag holds 4 Red balls, 1 Blue ball, and 5 Yellow balls. Without looking, you pick 1 ball. Which colour has the HIGHEST chance of being picked?',
    options: ['Red (4 out of 10)', 'Blue (1 out of 10)', 'Yellow (5 out of 10)', 'All colours are equally likely'],
    correct: 2,
    explanation:
      'There are 10 balls in total. Yellow has the most balls (5), giving it a probability of <strong>5/10 = 1/2 (50%)</strong> — higher than Red (40%) and Blue (10%).'
  },
  {
    tag: '🌦️ Everyday Life',
    visual: '☁️ 🌧️ ☀️',
    question:
      'The morning weather report says there is a 20% chance of rain today. What is the probability that it will NOT rain today?',
    options: ['20%', '50%', '80%', '100%'],
    correct: 2,
    explanation:
      'Either it rains or it does not rain — together they make <strong>100% (or 1)</strong>! So P(No Rain) = 100% − 20% = <strong>80% (or 0.8)</strong>.'
  },
  {
    tag: '🎡 Spinning Wheel',
    visual: '🟢 🟢 🟢 🔵 🔵 🔴 🟡 🟣',
    question:
      'A fair spinner is divided into 8 equal slices: 3 Green, 2 Blue, 1 Red, 1 Yellow, and 1 Purple. What is the probability of landing on Green?',
    options: ['1/8', '3/8', '3/5', '5/8'],
    correct: 1,
    explanation:
      'There are <strong>3 Green slices</strong> (favourable) out of <strong>8 equal slices</strong> (total). Using our formula: P(Green) = <strong>3/8</strong> (37.5%).'
  },
  {
    tag: '📅 Calendar Chance',
    visual: '📆 Mon • Tue • Wed • Thu • Fri • Sat • Sun',
    question:
      'A day of the week is chosen at random. What is the probability that its name starts with the letter "S"?',
    options: ['1/7', '2/7', '3/7', '5/7'],
    correct: 1,
    explanation:
      'Out of 7 days in a week, <strong>2 days</strong> start with "S" — <strong>Saturday and Sunday</strong>. So P(Starts with S) = <strong>2/7</strong>!'
  }
];

function initChallengeGame() {
  let current = 0;
  let score = 0;

  const card = document.getElementById('challengeCard');
  const counterEl = document.getElementById('challengeCounter');
  const scoreEl = document.getElementById('challengeScore');

  function renderChallenge() {
    if (current >= challenges.length) {
      counterEl.textContent = 'All Challenges Completed!';
      card.innerHTML = `
        <div style="text-align:center;">
          <div style="font-size:3.5rem; margin-bottom:0.5rem;">🎉</div>
          <h3>You Predicted ${score} out of ${challenges.length} Correctly!</h3>
          <p>Awesome detective work! Remember: math helps us make smarter predictions every time.</p>
          <button class="btn btn-primary" id="replayChallengeBtn">🔄 Play Challenges Again</button>
        </div>
      `;
      document.getElementById('replayChallengeBtn').addEventListener('click', () => {
        current = 0;
        score = 0;
        scoreEl.textContent = '0';
        renderChallenge();
      });
      return;
    }

    const item = challenges[current];
    counterEl.textContent = `Challenge ${current + 1} of ${challenges.length}`;

    const optionsHtml = item.options
      .map((opt, idx) => `<button class="option-btn" data-idx="${idx}">${opt}</button>`)
      .join('');

    card.innerHTML = `
      <span class="challenge-badge">${item.tag}</span>
      <div class="challenge-visual">${item.visual}</div>
      <h3>${item.question}</h3>
      <div class="challenge-options">${optionsHtml}</div>
      <div id="challengeFeedback" class="hidden"></div>
      <div class="challenge-nav">
        <button class="btn btn-primary hidden" id="nextChallengeBtn">
          ${current === challenges.length - 1 ? 'See Final Score 🏆' : 'Next Challenge →'}
        </button>
      </div>
    `;

    const buttons = card.querySelectorAll('.option-btn');
    const feedback = document.getElementById('challengeFeedback');
    const nextBtn = document.getElementById('nextChallengeBtn');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const chosen = Number(btn.dataset.idx);
        const isCorrect = chosen === item.correct;

        buttons.forEach((b, i) => {
          b.disabled = true;
          if (i === item.correct) b.classList.add('correct');
          if (i === chosen && !isCorrect) b.classList.add('wrong');
        });

        if (isCorrect) {
          score++;
          scoreEl.textContent = score;
        }

        feedback.className = `feedback-box ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
        feedback.innerHTML = `
          <strong>${isCorrect ? '✅ Spot-on prediction!' : '💡 Good try! Let’s see why:'}</strong><br />
          ${item.explanation}
        `;
        nextBtn.classList.remove('hidden');
      });
    });

    nextBtn.addEventListener('click', () => {
      current++;
      renderChallenge();
    });
  }

  renderChallenge();
}

/* ==========================================================================
   8. SECTION 7: PRACTICE QUIZ (10 QUESTIONS – EASY & MEDIUM)
   (Easy to edit: modify or add questions below!)
   ========================================================================== */
const quizQuestions = [
  {
    difficulty: 'Easy',
    question: 'What is the probability of an IMPOSSIBLE event?',
    options: ['0', '0.5', '1', '100'],
    correct: 0,
    explanation: 'An impossible event has 0 favourable outcomes, so its probability is always 0.'
  },
  {
    difficulty: 'Easy',
    question: 'A fair coin is tossed once. What is the probability of getting Tails?',
    options: ['1/4', '1/2', '2/3', '1'],
    correct: 1,
    explanation: 'There is 1 Tails out of 2 equally likely outcomes (Heads, Tails), so P(Tails) = 1/2.'
  },
  {
    difficulty: 'Easy',
    question: 'Which of the following numbers CANNOT be the probability of an event?',
    options: ['0', '0.35', '3/4', '1.4'],
    correct: 3,
    explanation: 'Probability always lies between 0 and 1 (inclusive). Since 1.4 is greater than 1, it cannot be a probability.'
  },
  {
    difficulty: 'Easy',
    question: 'A fair 6-sided die is rolled once. What is the probability of getting the number 5?',
    options: ['5/6', '1/5', '1/6', '1/2'],
    correct: 2,
    explanation: 'Only 1 face shows the number 5 out of 6 total faces: P(5) = 1/6.'
  },
  {
    difficulty: 'Easy',
    question: 'A bag has 4 Blue marbles and 6 Red marbles. One marble is drawn at random. What is P(Blue)?',
    options: ['4/6', '4/10 (or 2/5)', '6/10', '1/4'],
    correct: 1,
    explanation: 'Total marbles = 4 + 6 = 10. Favourable (Blue) = 4. So P(Blue) = 4/10 = 2/5.'
  },
  {
    difficulty: 'Medium',
    question: 'A fair die is rolled once. What is the probability of getting an ODD number?',
    options: ['1/6', '1/3', '1/2', '2/3'],
    correct: 2,
    explanation: 'Odd numbers on a die are {1, 3, 5} → 3 favourable outcomes out of 6 total. P(Odd) = 3/6 = 1/2.'
  },
  {
    difficulty: 'Medium',
    question: 'Cards numbered 1 to 10 are placed in a box. One card is picked at random. What is the probability of picking a multiple of 3?',
    options: ['2/10', '3/10', '4/10', '1/3'],
    correct: 1,
    explanation: 'Multiples of 3 from 1 to 10 are {3, 6, 9} — that is 3 favourable cards out of 10. So P(Multiple of 3) = 3/10.'
  },
  {
    difficulty: 'Medium',
    question: 'If the probability of winning a game is 0.65, what is the probability of NOT winning it?',
    options: ['0.35', '0.45', '0.65', '1.65'],
    correct: 0,
    explanation: 'P(Event) + P(Not Event) = 1. So P(Not Winning) = 1 − 0.65 = 0.35.'
  },
  {
    difficulty: 'Medium',
    question: 'A letter is chosen at random from the word "MATHS". What is the probability that it is a vowel?',
    options: ['1/5', '2/5', '3/5', '4/5'],
    correct: 0,
    explanation: 'The word MATHS has 5 letters. Only "A" is a vowel (1 favourable outcome). So P(Vowel) = 1/5.'
  },
  {
    difficulty: 'Medium',
    question: 'You roll a fair die once. What is the probability of getting a number LESS than 7?',
    options: ['0', '5/6', '6/7', '1'],
    correct: 3,
    explanation: 'All 6 faces {1, 2, 3, 4, 5, 6} are less than 7! That is a CERTAIN event: 6/6 = 1.'
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

        feedbackBox.className = `feedback-box quiz-feedback ${isRight ? 'feedback-correct' : 'feedback-wrong'}`;
        feedbackBox.innerHTML = `
          <strong>${isRight ? '✅ Correct!' : `❌ Not quite! The correct answer is "${q.options[q.correct]}".`}</strong><br />
          ${q.explanation}
        `;
        feedbackBox.classList.remove('hidden');

        nextBtn.textContent = idx === quizQuestions.length - 1 ? 'View My Results 🏆' : 'Next Question →';
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
      heading.textContent = 'Probability Champion!';
      msg.textContent = 'Outstanding work! You have mastered the core ideas of Probability.';
    } else if (pct >= 50) {
      trophy.textContent = '🌟';
      heading.textContent = 'Great Effort!';
      msg.textContent = 'You understand the basics well! Review the explanations below and try for a perfect score.';
    } else {
      trophy.textContent = '🚀';
      heading.textContent = 'Keep Exploring!';
      msg.textContent = 'Probability gets super easy with practice. Revisit the Learn Math section and give it another go!';
    }

    document.getElementById('resultReview').innerHTML = userAnswers
      .map(
        (entry, i) => `
          <div class="review-item ${entry.isRight ? 'rev-ok' : 'rev-no'}">
            <strong>Q${i + 1}: ${entry.q.question}</strong><br />
            Your answer: <em>${entry.q.options[entry.chosen]}</em> ${entry.isRight ? '✅' : `❌ (Correct: <strong>${entry.q.options[entry.q.correct]}</strong>)`}<br />
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

/* ==========================================================================
   9. SECTION 8: FINAL FUN CHALLENGE – MYSTERY BAG DETECTIVE
   ========================================================================== */
function initMysteryBagChallenge() {
  const secretConfigs = [
    { red: 5, blue: 3, yellow: 2 },
    { red: 2, blue: 6, yellow: 2 },
    { red: 1, blue: 3, yellow: 6 },
    { red: 4, blue: 4, yellow: 2 },
    { red: 6, blue: 1, yellow: 3 }
  ];

  let secretBag = {};
  let drawn = { red: 0, blue: 0, yellow: 0 };

  const lastDrawEl = document.getElementById('bagLastDraw');
  const revealPanel = document.getElementById('bagRevealPanel');

  function pickNewBag() {
    secretBag = secretConfigs[Math.floor(Math.random() * secretConfigs.length)];
    drawn = { red: 0, blue: 0, yellow: 0 };
    revealPanel.classList.add('hidden');
    lastDrawEl.textContent = 'New secret bag ready! Draw balls to gather probability clues.';
    updateBagUI();
  }

  function updateBagUI() {
    const total = drawn.red + drawn.blue + drawn.yellow;
    ['red', 'blue', 'yellow'].forEach((col) => {
      const cap = col.charAt(0).toUpperCase() + col.slice(1);
      document.getElementById(`bag${cap}Count`).textContent = drawn[col];
      const pct = total === 0 ? 0 : ((drawn[col] / total) * 100).toFixed(1);
      document.getElementById(`bag${cap}Pct`).textContent = `${pct}%`;
    });
  }

  function drawBalls(times) {
    let lastColor = 'red';
    for (let i = 0; i < times; i++) {
      const r = Math.random() * 10;
      if (r < secretBag.red) {
        drawn.red++;
        lastColor = '🔴 Red';
      } else if (r < secretBag.red + secretBag.blue) {
        drawn.blue++;
        lastColor = '🔵 Blue';
      } else {
        drawn.yellow++;
        lastColor = '🟡 Yellow';
      }
    }
    const total = drawn.red + drawn.blue + drawn.yellow;
    lastDrawEl.textContent =
      times === 1
        ? `You drew: ${lastColor} (Total draws: ${total})`
        : `Drew 10 more balls! Total evidence collected: ${total} draws.`;
    updateBagUI();
  }

  document.getElementById('drawOneBallBtn').addEventListener('click', () => drawBalls(1));
  document.getElementById('drawTenBallsBtn').addEventListener('click', () => drawBalls(10));
  document.getElementById('revealBagBtn').addEventListener('click', () => {
    const total = drawn.red + drawn.blue + drawn.yellow;
    revealPanel.innerHTML = `
      <h4>🔓 Inside the Secret Bag (10 Balls Total):</h4>
      <p style="font-size:1.15rem; margin:0.5rem 0;">
        <strong>🔴 ${secretBag.red} Red (${secretBag.red * 10}%)</strong> &nbsp;•&nbsp;
        <strong>🔵 ${secretBag.blue} Blue (${secretBag.blue * 10}%)</strong> &nbsp;•&nbsp;
        <strong>🟡 ${secretBag.yellow} Yellow (${secretBag.yellow * 10}%)</strong>
      </p>
      <small>You drew ${total} ball(s). Notice how drawing 30+ balls makes your experimental percentages closely match the hidden numbers!</small>
    `;
    revealPanel.classList.remove('hidden');
  });
  document.getElementById('newBagBtn').addEventListener('click', pickNewBag);

  pickNewBag();
}
