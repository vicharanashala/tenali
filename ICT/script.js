// GAME STATE (Saved automatically in browser localStorage)
const defaultState = {
  stars: 0,
  coins: 0,
  missionsCompleted: { 1: false, 2: false, 3: false },
  missionStars: { 1: 0, 2: 0, 3: 0 },
  badges: []
};

let state = JSON.parse(localStorage.getItem('mathQuestState')) || defaultState;

const ALL_BADGES = [
  { id: 'bridge_builder', icon: '🌉', name: 'Bridge Builder', desc: 'Mastered Triangular & Square Patterns' },
  { id: 'shape_decoder', icon: '🔮', name: 'Shape Decoder', desc: 'Matched Visual Dot Sequences' },
  { id: 'vault_runner', icon: '⚡', name: 'Vault Runner', desc: 'Beat the Virahanka Timer' },
  { id: 'pattern_royal', icon: '👑', name: 'Pattern Master', desc: 'Completed World 1!' }
];

// NCERT CLASS 6 (GANITA PRAKASH CH 1: PATTERNS IN MATHEMATICS) DATA
const mission1Questions = [
  {
    instruction: "Robo-6 needs the next Triangular Number to cross!",
    sequence: [1, 3, 6, 10, "?"],
    answer: 15,
    choices: [12, 14, 15, 18],
    hintVisual: "1 (+2) ➔ 3 (+3) ➔ 6 (+4) ➔ 10 (+5) ➔ ?"
  },
  {
    instruction: "Repair the Square Number stone bridge!",
    sequence: [1, 4, 9, "?", 25],
    answer: 16,
    choices: [12, 15, 16, 20],
    hintVisual: "1×1=1 | 2×2=4 | 3×3=9 | 4×4=? | 5×5=25"
  },
  {
    instruction: "Complete the Odd Number bridge path!",
    sequence: [1, 3, 5, 7, "?"],
    answer: 9,
    choices: [8, 9, 10, 11],
    hintVisual: "🔵 (1) ➔ 🔵🔵🔵 (3) ➔ 🔵🔵🔵🔵🔵 (5) ➔ Add 2 dots each step!"
  }
];

const mission2Pairs = [
  {
    id: 'tri',
    label: "Triangular Numbers: 1, 3, 6",
    dots: [1, 3, 6]
  },
  {
    id: 'sq',
    label: "Square Numbers: 1, 4, 9",
    dots: [1, 4, 9]
  },
  {
    id: 'pow2',
    label: "Powers of 2: 1, 2, 4",
    dots: [1, 2, 4]
  }
];

const mission3Questions = [
  {
    instruction: "Virahanka–Fibonacci Code! Each number is the sum of the two before it:",
    sequence: [1, 2, 3, 5, 8, "?"],
    answer: 13,
    choices: [11, 12, 13, 15],
    hintVisual: "5 + 8 = ?"
  },
  {
    instruction: "Cube Numbers Vault Lock! (1×1×1, 2×2×2, 3×3×3...)",
    sequence: [1, 8, 27, "?"],
    answer: 64,
    choices: [36, 48, 64, 81],
    hintVisual: "4 × 4 × 4 = ?"
  },
  {
    instruction: "Doubling Treasure Pattern! Unlock the chest!",
    sequence: [2, 4, 8, 16, "?"],
    answer: 32,
    choices: [24, 30, 32, 64],
    hintVisual: "16 × 2 = ?"
  }
];

// RUNTIME VARIABLES
let currentMission = 1;
let qIndex = 0;
let mistakes = 0;
let timerInterval = null;
let timeLeft = 45;
let selectedShape = null;
let selectedSeq = null;
let matchedCount = 0;

// DOM ELEMENTS
const screens = {
  map: document.getElementById('mapScreen'),
  hub: document.getElementById('worldHubScreen'),
  arena: document.getElementById('gameArenaScreen')
};

function saveState() {
  localStorage.setItem('mathQuestState', JSON.stringify(state));
  updateHUD();
}

function updateHUD() {
  const totalStars =
    (state.missionStars[1] || 0) +
    (state.missionStars[2] || 0) +
    (state.missionStars[3] || 0);
  state.stars = totalStars;

  document.getElementById('starCount').textContent = totalStars;
  document.getElementById('coinCount').textContent = state.coins;
  document.getElementById('badgeCount').textContent = state.badges.length;

  // Progress bar
  const completedCount = Object.values(state.missionsCompleted).filter(Boolean).length;
  const pct = Math.round((completedCount / 3) * 100);
  document.getElementById('progressText').textContent = `${pct}%`;
  document.getElementById('progressFill').style.width = `${pct}%`;

  // World 1 Stars display
  const earnedWorldStars = Math.min(3, Math.floor(totalStars / 3));
  const w1StarStr = '⭐'.repeat(earnedWorldStars) + '☆'.repeat(3 - earnedWorldStars);
  document.getElementById('world1Stars').textContent = w1StarStr;

  // Unlock Mission 2 & 3 cards
  if (state.missionsCompleted[1]) {
    document.getElementById('m1Status').textContent = '✅ DONE';
    document.getElementById('m1Status').style.background = '#38b000';
    const m2 = document.getElementById('mission2Card');
    m2.classList.remove('locked-mission');
    document.getElementById('m2Status').textContent = 'UNLOCKED';
    const btn2 = document.getElementById('btnM2');
    btn2.disabled = false;
    btn2.textContent = 'Play Mission 2';
  }

  if (state.missionsCompleted[2]) {
    document.getElementById('m2Status').textContent = '✅ DONE';
    document.getElementById('m2Status').style.background = '#38b000';
    const m3 = document.getElementById('mission3Card');
    m3.classList.remove('locked-mission');
    document.getElementById('m3Status').textContent = 'UNLOCKED';
    const btn3 = document.getElementById('btnM3');
    btn3.disabled = false;
    btn3.textContent = 'Play Mission 3';
  }

  if (state.missionsCompleted[3]) {
    document.getElementById('m3Status').textContent = '✅ DONE';
    document.getElementById('m3Status').style.background = '#38b000';
  }
}

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// NAVIGATION EVENTS
document.getElementById('world1Card').addEventListener('click', () => showScreen('hub'));
document.getElementById('btnBackToMap').addEventListener('click', () => showScreen('map'));
document.getElementById('btnHome').addEventListener('click', () => {
  clearInterval(timerInterval);
  showScreen('map');
});
document.getElementById('btnQuitMission').addEventListener('click', () => {
  clearInterval(timerInterval);
  showScreen('hub');
});

// START MISSION
function startMission(num) {
  currentMission = num;
  qIndex = 0;
  mistakes = 0;
  clearInterval(timerInterval);
  document.getElementById('visualHintBox').classList.add('hidden');
  document.getElementById('timerBox').classList.add('hidden');

  showScreen('arena');

  if (num === 1) {
    document.getElementById('arenaTitle').textContent = "Mission 1: Robot's Bridge";
    renderSequenceQuestion(mission1Questions);
  } else if (num === 2) {
    document.getElementById('arenaTitle').textContent = "Mission 2: Relic Matcher";
    renderMatchingGame();
  } else if (num === 3) {
    document.getElementById('arenaTitle').textContent = "Mission 3: Vault Rush";
    startTimer();
    renderSequenceQuestion(mission3Questions);
  }
}

// RENDER SEQUENCE BRIDGE / VAULT QUESTION (MISSIONS 1 & 3)
function renderSequenceQuestion(bank) {
  const q = bank[qIndex];
  document.getElementById('instructionText').textContent = q.instruction;
  document.getElementById('visualHintBox').classList.add('hidden');

  const stage = document.getElementById('puzzleStage');
  stage.innerHTML = `
    <div class="bridge-row">
      ${q.sequence.map(item => `
        <div class="stone-tile ${item === '?' ? 'missing' : ''}">${item}</div>
      `).join('')}
    </div>
    <div class="choices-row">
      ${q.choices.map(choice => `
        <button class="choice-btn" onclick="checkSequenceAnswer(${choice})">${choice}</button>
      `).join('')}
    </div>
  `;
}

function checkSequenceAnswer(val) {
  const bank = currentMission === 1 ? mission1Questions : mission3Questions;
  const q = bank[qIndex];

  if (val === q.answer) {
    qIndex++;
    if (qIndex < bank.length) {
      renderSequenceQuestion(bank);
    } else {
      completeMission();
    }
  } else {
    mistakes++;
    const hintBox = document.getElementById('visualHintBox');
    document.getElementById('visualHintContent').textContent = q.hintVisual;
    hintBox.classList.remove('hidden');
  }
}

// RENDER MISSION 2: VISUAL DOT MATCHER
function renderMatchingGame() {
  document.getElementById('instructionText').textContent =
    "Tap a Dot Pattern on the left, then tap its matching Number Sequence on the right!";
  matchedCount = 0;
  selectedShape = null;
  selectedSeq = null;

  const shuffledSeqs = [...mission2Pairs].sort(() => Math.random() - 0.5);

  const stage = document.getElementById('puzzleStage');
  stage.innerHTML = `
    <div class="match-arena">
      <div class="match-col" id="shapeCol">
        ${mission2Pairs.map(item => `
          <div class="match-card" data-id="${item.id}" onclick="selectMatch('shape', '${item.id}', this)">
            <div class="dot-visual">${buildDotPatternHTML(item.dots)}</div>
          </div>
        `).join('')}
      </div>
      <div class="match-col" id="seqCol">
        ${shuffledSeqs.map(item => `
          <div class="match-card" data-id="${item.id}" onclick="selectMatch('seq', '${item.id}', this)">
            ${item.label}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function buildDotPatternHTML(counts) {
  return counts.map(c => {
    let dots = '';
    for (let i = 0; i < c; i++) dots += '<span class="dot"></span>';
    return `<div class="dot-group" style="max-width:42px; flex-direction:row; flex-wrap:wrap; justify-content:center;">${dots}</div>`;
  }).join(' ➔ ');
}

function selectMatch(type, id, el) {
  document.getElementById('visualHintBox').classList.add('hidden');

  if (type === 'shape') {
    document.querySelectorAll('#shapeCol .match-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedShape = { id, el };
  } else {
    document.querySelectorAll('#seqCol .match-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedSeq = { id, el };
  }

  if (selectedShape && selectedSeq) {
    if (selectedShape.id === selectedSeq.id) {
      selectedShape.el.classList.remove('selected');
      selectedSeq.el.classList.remove('selected');
      selectedShape.el.classList.add('matched');
      selectedSeq.el.classList.add('matched');
      selectedShape = null;
      selectedSeq = null;
      matchedCount++;

      if (matchedCount === mission2Pairs.length) {
        setTimeout(completeMission, 400);
      }
    } else {
      mistakes++;
      const hintBox = document.getElementById('visualHintBox');
      document.getElementById('visualHintContent').textContent =
        "Count the gold dots in each group from left to right!";
      hintBox.classList.remove('hidden');
      selectedShape.el.classList.remove('selected');
      selectedSeq.el.classList.remove('selected');
      selectedShape = null;
      selectedSeq = null;
    }
  }
}

// TIMER FOR MISSION 3
function startTimer() {
  timeLeft = 45;
  const timerBox = document.getElementById('timerBox');
  const timerVal = document.getElementById('timerVal');
  timerBox.classList.remove('hidden');
  timerVal.textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerVal.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("⏰ Time's up! Let's try the Vault Rush again!");
      startMission(3);
    }
  }, 1000);
}

// COMPLETE MISSION & AWARD REWARDS
function completeMission() {
  clearInterval(timerInterval);

  const earnedStars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
  state.missionsCompleted[currentMission] = true;
  state.missionStars[currentMission] = Math.max(
    state.missionStars[currentMission] || 0,
    earnedStars
  );
  state.coins += earnedStars * 25;

  // Unlock Badges
  const badgeMap = { 1: 'bridge_builder', 2: 'shape_decoder', 3: 'vault_runner' };
  const newBadge = badgeMap[currentMission];
  if (!state.badges.includes(newBadge)) {
    state.badges.push(newBadge);
  }
  if (
    state.missionsCompleted[1] &&
    state.missionsCompleted[2] &&
    state.missionsCompleted[3]
  ) {
    if (!state.badges.includes('pattern_royal')) {
      state.badges.push('pattern_royal');
    }
  }

  saveState();

  document.getElementById('modalTitle').textContent = `Mission ${currentMission} Complete!`;
  document.getElementById('modalStars').textContent = '⭐'.repeat(earnedStars);
  document.getElementById('modalRewardText').textContent =
    `You earned +${earnedStars * 25} Gold Coins & unlocked a Badge!`;
  document.getElementById('rewardModal').classList.remove('hidden');
}

document.getElementById('btnModalContinue').addEventListener('click', () => {
  document.getElementById('rewardModal').classList.add('hidden');
  showScreen('hub');
});

// BADGE VAULT MODAL
document.getElementById('btnBadges').addEventListener('click', () => {
  const list = document.getElementById('badgesList');
  list.innerHTML = ALL_BADGES.map(b => {
    const unlocked = state.badges.includes(b.id);
    return `
      <div class="badge-item ${unlocked ? 'earned' : ''}">
        <div style="font-size:2rem;">${unlocked ? b.icon : '🔒'}</div>
        <div style="font-weight:800; margin:4px 0;">${b.name}</div>
        <div style="font-size:0.75rem; color:#cbbdf7;">${b.desc}</div>
      </div>
    `;
  }).join('');
  document.getElementById('badgesModal').classList.remove('hidden');
});

document.getElementById('btnCloseBadges').addEventListener('click', () => {
  document.getElementById('badgesModal').classList.add('hidden');
});

// INITIALIZE ON LOAD
updateHUD();
