/**
 * ENHANCED MATH DETECTIVE APP
 *
 * Story-based detective cases with:
 * - Progressive hints for each question
 * - Case deduplication per topic (no user gets same case twice for same topic)
 * - All Tenali modules covered with multiple variants
 *
 * This is a drop-in replacement for the original MathDetectiveApp in App.jsx.
 * It imports stories from detective-stories.js and adds hint & deduplication features.
 */

import { useEffect, useState, useRef, useMemo } from 'react'
import { ALL_DETECTIVE_STORIES, isEnhancedCase, getEliminationReasons, highlightEvidenceSentences, escapeRegex, formatClueText, getClueEliminableSuspects, getClueEliminationReasons } from './detective-stories'
import { CASE_GENERATORS } from './detective-generators'
import BoardCasePlay from './detective-board-app'
import { BOARD_CASES } from './detective-board-cases'

// ─── Sound Effects (Web Audio API) ──────────────────────────────────────
let audioCtx = null;
function getAudioCtx() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch { return null; }
}

function playTone(freq, duration, type = 'sine', volume = 0.3) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playStarSound(starCount) {
  const freqs = { 3: [523, 659, 784], 2: [440, 554], 1: [349] };
  const notes = freqs[starCount] || freqs[1];
  notes.forEach((f, i) => setTimeout(() => playTone(f, 0.25, 'sine', 0.25), i * 120));
}

function playConfettiSound() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.3, 'sine', 0.2), i * 150));
}

function playCorrectSound() {
  playTone(660, 0.15, 'sine', 0.2);
  setTimeout(() => playTone(880, 0.2, 'sine', 0.2), 100);
}

// ─── Constants (mirrored from App.jsx for independence) ──────────────

const DETECTIVE_RANKS = [
  { title: 'Junior Detective',   xp: 0    },
  { title: 'Detective',          xp: 100  },
  { title: 'Senior Detective',   xp: 300  },
  { title: 'Chief Inspector',    xp: 700  },
  { title: 'Commissioner',       xp: 1500 },
  { title: 'Grand Commissioner', xp: 3000 },
];

const DETECTIVE_STORAGE_KEY = 'tenali-detective-progress';
const AUTO_ADVANCE_MS = 3500;

// ─── Progress Helpers ────────────────────────────────────────────────

function loadDetectiveProgress() {
  try {
    const raw = localStorage.getItem(DETECTIVE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { xp: 0, casesSolved: 0, cases: {}, usedCaseIds: [], age: 8, boardMastery: {} };
}

/**
 * AGE_TOPIC_MAP — Maps each math topic to the minimum age (by Indian curriculum)
 * at which the topic is introduced. Cases on topics below the student's age
 * are shown; topics above their age are hidden.
 *
 * Age → Class mapping:
 *   5→UKG, 6→C1, 7→C2, 8→C3, 9→C4, 10→C5, 11→C6, 12→C7,
 *   13→C8, 14→C9, 15→C10, 16→C11
 */
const AGE_TOPIC_MAP = {
  // Age 6+ — Class 1: counting, +/- concepts, intro to multiply, basic shapes
  'addition': 6,
  'multiply': 6,
  'triangles': 6,
  // Age 5+ — UKG: counting, number recognition, shapes, patterns, comparisons
  'counting': 5,
  'shapes': 5,
  'patterns': 5,
  'comparisons': 5,
  // Age 6+ — Class 1: +/- concepts, intro to multiply, basic shapes & measurement
  'addition': 6,
  'multiply': 6,
  'triangles': 6,
  // Age 8+ — Class 3: numbers to 10,000, fractions, measurement, perimeter & area
  'fractionadd': 8,
  'mensur': 8,
  'rounding': 8,
  // Age 9+ — Class 4: large numbers, factors/multiples, decimals, angles, polygon angle sums
  'polygons': 9,
  'decimals': 9,
  'angles': 9,
  'hcflcm': 9,
  'stats': 9,
  'profitloss': 9,
  'sdt': 9,
  // Age 10+ — Class 5: percentages, averages, basic algebra intro, squaring, volume
  'percent': 10,
  'primefactor': 10,
  'lineareq': 10,
  'squaring': 10,
  // Age 11+ — Class 6: integers, ratio & proportion, algebra equations
  'basicarith': 11,
  'ratio': 11,
  'simul': 11,
  // Age 12+ — Class 7: exponents, probability, standard form, linear equations
  'indices': 12,
  'prob': 12,
  'stdform': 12,
  // Age 13+ — Class 8: square & square roots, factorization, coordinate geometry, Pythagoras
  'sqrt': 13,
  'polyfactor': 13,
  'coordgeom': 13,
  'pythag': 13,
  'surds': 13,
  'tatsavit': 13,  // Algebraic simplification — Class 8 factorization & identities
  // Age 14+ — Class 9: polynomial division, circle theorems, transformations, vectors intro
  'circleth': 14,
  'transform': 14,
  'similarity': 14,
  'vectors': 14,
  'lineq': 14,
  'sets': 14,
  'congruence': 14,
  'heron': 14,
  // Age 15+ — Class 10: quadratic equations, trigonometry, arithmetic progressions
  'trig': 15,
  'quadratic': 15,
  'qformula': 15,
  'sequences': 15,
  'polymul': 15,
  'ineq': 15,
  'bases': 15,
  'shares': 15,
  'gst': 15,
  'banking': 15,
  // Age 16+ — Class 11: complex numbers, binomial theorem, permutations, limits, logs
  'complex': 16,
  'binomial': 16,
  'permcomb': 16,
  'funceval': 16,
  'log': 16,
  'matrix': 16,
  'diff': 16,
  'integ': 16,
  'limits': 16,
  'section': 16,
  'dotprod': 16,
  'invtrig': 16,
  'diffeq': 16,
  'bearings': 16,
  'bounds': 16,
  'circmeasure': 16,
  'conics': 16,
  'linprog': 16,
  'remfactor': 16,
  'variation': 16,
};

/**
 * getAgeClassLabel(age) — Returns the class/grade label for display.
 */
function getAgeClassLabel(age) {
  if (age <= 5) return 'UKG';
  const classNum = age - 5; // age 5→UKG(0), 6→C1, 7→C2, ...
  return `Class ${classNum}`;
}

/**
 * filterCasesByAge(cases, age) — Filters a case array to only include cases
 * whose topics are appropriate for the given age (by curriculum). Board
 * cases carry an explicit `ageRange` ([min, max]) that takes precedence.
 */
function filterCasesByAge(cases, age) {
  return cases.filter(c => {
    if (Array.isArray(c.ageRange)) {
      return age >= c.ageRange[0] && age <= c.ageRange[1];
    }
    const minAge = AGE_TOPIC_MAP[c.topic] || 16; // unknown topics default to 16+
    return age >= minAge;
  });
}

/** True for the board-based crime-scene case type. */
function isBoardCase(c) {
  return !!(c && c.type === 'board');
}

function saveDetectiveProgress(data) {
  try { localStorage.setItem(DETECTIVE_STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function saveInProgressCase(caseId, snapshot) {
  try {
    const p = loadDetectiveProgress();
    if (!p.cases) p.cases = {};
    p.cases[caseId] = { ...snapshot, status: 'in_progress', updatedAt: Date.now() };
    saveDetectiveProgress(p);
  } catch {}
}

function getDetectiveRank(xp) {
  let rank = DETECTIVE_RANKS[0];
  for (const r of DETECTIVE_RANKS) {
    if (xp >= r.xp) rank = r;
  }
  return rank;
}

function getNextRank(xp) {
  for (const r of DETECTIVE_RANKS) {
    if (xp < r.xp) return r;
  }
  return null;
}

function rankColor(title) {
  const map = {
    'Junior Detective': '#4caf50',
    'Detective': '#2196f3',
    'Senior Detective': '#ff9800',
    'Chief Inspector': '#f44336',
    'Commissioner': '#9c27b0',
    'Grand Commissioner': '#e8864a',
  };
  return map[title] || '#9e9e9e';
}

function rankEmoji(title) {
  const map = {
    'Junior Detective': '🔎',
    'Detective': '🔍',
    'Senior Detective': '⭐',
    'Chief Inspector': '🏅',
    'Commissioner': '👑',
    'Grand Commissioner': '🌟',
  };
  return map[title] || '🔍';
}

function checkDetectiveAnswer(correctAnswer, userAnswer) {
  const trimmed = String(userAnswer).trim();
  if (trimmed === String(correctAnswer)) return true;
  const numUser = parseFloat(trimmed);
  const numCorrect = parseFloat(correctAnswer);
  if (!isNaN(numUser) && !isNaN(numCorrect)) {
    return Math.abs(numUser - numCorrect) < 0.01;
  }
  return false;
}

// ─── COMBINED CASES: original + new stories ──────────────────────────

// Keep the original 11 cases
const ORIGINAL_CASES = [
  {
    id: 'case-1',
    title: 'The Case of the Missing Equation',
    description: 'A cryptic equation was left at a crime scene. Decode it to find the next clue!',
    difficulty: 1, xpReward: 30, topic: 'lineareq',
    stages: [
      { title: 'Briefing', narrative: 'Detective, we need your help! A mysterious note was found at the scene reading: "The sum of two consecutive numbers is 47." The next clue is hidden at the page number equal to the larger number. What is the larger number?', question: 'Two consecutive numbers add up to 47. Find the larger number.', answer: 24, hints: ['Let the numbers be x and x+1.', 'x + (x+1) = 47 → 2x + 1 = 47 → 2x = 46.', 'x = 23, larger = 24.'] },
      { title: 'Clue Analysis', narrative: 'Great work! The book led you to a safe. The safe combination is the answer to: "Three times a number, minus 5, equals 28. What is the number?"', question: '3x − 5 = 28. Solve for x.', answer: 11, hints: ['Add 5: 3x = 33.', 'x = 11.'] },
      { title: 'Final Deduction', narrative: 'The safe contained a final riddle: "Think of a number. Double it, add 10, then divide by 2. The result is 25. What was the original number?" The answer reveals the culprit!', question: 'Work backwards: (2x + 10) ÷ 2 = 25. Find x.', answer: 20, hints: ['Multiply both sides by 2: 2x + 10 = 50.', 'Then 2x = 40 → x = 20.'] },
    ],
  },
  {
    id: 'case-2',
    title: 'The Perimeter Plot',
    description: 'A suspicious blueprint was found. Use geometry to measure the evidence!',
    difficulty: 1, xpReward: 40, topic: 'mensur',
    stages: [
      { title: 'Scene Analysis', narrative: 'The blueprint shows a rectangular garden. The length is 12 metres and the width is 8 metres. The suspect wrote: "Perimeter = ?" on the edge. Find the perimeter to unlock the first clue.', question: 'A rectangle has length 12m and width 8m. What is its perimeter?', answer: 40, hints: ['Perimeter = 2(l + w).', '2(12 + 8) = 2 × 20 = 40.'] },
      { title: 'Area Investigation', narrative: 'Inside the garden, there is a square flower bed with side length 3 metres. The suspect planted something there. What is the area of the flower bed?', question: 'A square has side length 3m. Calculate its area.', answer: 9, hints: ['Area of square = side².', '3² = 9.'] },
      { title: 'The Big Reveal', narrative: 'The remaining area of the garden (excluding the flower bed) was dug up. Find the area that was disturbed to discover what was hidden.', question: 'Garden area = 96m². Flower bed area = 9m². Remainder = ?', answer: 87, hints: ['Remainder = total garden area − flower bed.', '96 − 9 = 87.'] },
    ],
  },
  {
    id: 'case-3',
    title: 'The Fraction Fiasco',
    description: 'A recipe for disaster! Someone tampered with the measurements. Restore the correct quantities.',
    difficulty: 2, xpReward: 50, topic: 'fractionadd',
    stages: [
      { title: 'Recipe Reconstruction', narrative: 'The chef\'s recipe calls for 2/3 cup of sugar, but the tamperer changed it to 1/4 cup. How much more sugar is needed to fix the recipe?', question: '2/3 − 1/4 = ? (Give answer as a simplified fraction a/b)', answer: '5/12', hints: ['LCM of 3 and 4 is 12.', '2/3 = 8/12, 1/4 = 3/12.', '8/12 − 3/12 = 5/12.'] },
      { title: 'Batch Adjustment', narrative: 'The corrected recipe makes 12 cookies. We need 30 cookies. Multiply all ingredients by what factor?', question: 'Scale factor = 30/12 = ? (simplified)', answer: '5/2', hints: ['Scale factor = new / old = 30/12.', 'Simplify: divide by 6 → 5/2.'] },
      { title: 'Final Check', narrative: 'The corrected sugar for 30 cookies: 2/3 × 5/2 = ?', question: '2/3 × 5/2 = ? (Simplify)', answer: '5/3', hints: ['Multiply numerators: 2×5=10, denominators: 3×2=6.', '10/6 = 5/3.'] },
    ],
  },
  {
    id: 'case-4', title: 'The Speed Trap', description: 'A speeding vehicle was caught on camera. Use speed-distance-time calculations!', difficulty: 2, xpReward: 60, topic: 'sdt',
    stages: [
      { title: 'Speed Calculation', narrative: 'The suspect\'s car travelled 240 km in 3 hours. Speed limit was 60 km/h. Was the suspect speeding? Enter speed in km/h.', question: 'Speed = Distance ÷ Time. 240km ÷ 3h = ?', answer: 80, hints: ['Speed = 240 ÷ 3.', '= 80 km/h. Yes, speeding!'] },
      { title: 'Time Alibi', narrative: 'The suspect claims they left at 2:30 PM and drove 150 km at 50 km/h. What time did they arrive?', question: 'Time = 150 ÷ 50 = ? hours. Add to 2:30 PM.', answer: 5.5, hints: ['150 ÷ 50 = 3 hours.', '2:30 + 3h = 5:30 PM = 5.5.'] },
      { title: 'Fuel Evidence', narrative: 'The car\'s fuel tank holds 45 litres. It consumes 8 km per litre. How far can the suspect travel on a full tank?', question: 'Range = Fuel × Efficiency. 45 × 8 = ?', answer: 360, hints: ['45 × 8 = 360 km.'] },
    ],
  },
  {
    id: 'case-5', title: 'The Percentage Heist', description: 'A bank statement has been altered. Follow percentage changes to trace the stolen amount!', difficulty: 3, xpReward: 80, topic: 'percent',
    stages: [
      { title: 'Initial Deposit', narrative: 'The victim deposited ₹2000. The statement shows 15% interest was added. What is the new balance?', question: '2000 + 15% of 2000 = ?', answer: 2300, hints: ['15% of 2000 = 300.', '2000 + 300 = 2300.'] },
      { title: 'The Withdrawal', narrative: 'The suspect withdrew 20% of the balance. How much was withdrawn?', question: '20% of 2300 = ?', answer: 460, hints: ['20% = 0.2.', '0.2 × 2300 = 460.'] },
      { title: 'Money Trail', narrative: 'After the withdrawal, the remaining balance was transferred. 80% of that transferred amount could be recovered. How much was recovered?', question: '80% of (2300 − 460) = ?', answer: 1472, hints: ['2300 − 460 = 1840.', '80% of 1840 = 0.8 × 1840 = 1472.'] },
    ],
  },
  {
    id: 'case-6', title: 'The Probability Puzzle', description: 'A gambling den was raided. Use probability to identify the rigged game!', difficulty: 3, xpReward: 100, topic: 'prob',
    stages: [
      { title: 'Dice Game', narrative: 'In a fair game, you roll a single six-sided die. What is the probability of rolling a number greater than 4?', question: 'P(>4) on a 6-sided die = ? (simplified fraction)', answer: '1/3', hints: ['Numbers > 4: 5, 6 (2 numbers).', 'P = 2/6 = 1/3.'] },
      { title: 'Card Trick', narrative: 'From a 52-card deck, what is P(heart)?', question: 'P(heart) from 52 = ?/?', answer: '1/4', hints: ['13 hearts in a deck.', '13/52 = 1/4.'] },
      { title: 'The Rigged Game', narrative: 'An 8-sided die with 3 "win" sides and 5 "lose" sides. What is P(win)?', question: 'P(win) = 3/8', answer: '3/8', hints: ['3 winning sides out of 8.', 'P = 3/8.'] },
    ],
  },
  {
    id: 'case-7', title: 'The Trigonometry Triangle', description: 'A mysterious triangle found at a crime scene. Use trigonometry to decode it!', difficulty: 2, xpReward: 70, topic: 'trig',
    stages: [
      { title: 'Angle Analysis', narrative: 'Right triangle with angle 30°, hypotenuse 10 cm. Find the opposite side (sin 30° = 0.5).', question: 'Opposite = sin 30° × 10 = 0.5 × 10 = ?', answer: 5, hints: ['SOH: sin = opposite/hypotenuse.', 'opposite = sin × hyp = 0.5 × 10 = 5.'] },
      { title: 'Adjacent Clue', narrative: 'Find the adjacent side (cos 30° ≈ 0.866).', question: 'Adjacent = cos 30° × 10 = 0.866 × 10 = ? (1 d.p.)', answer: 8.7, hints: ['CAH: cos = adjacent/hypotenuse.', 'adj = cos × hyp = 0.866 × 10 = 8.66 ≈ 8.7.'] },
      { title: 'Height of Building', narrative: 'From 50m from base, angle of elevation = 45°. tan 45° = 1. How tall is the building?', question: 'Height = 50 × tan 45° = 50 × 1 = ?', answer: 50, hints: ['TOA: tan = opposite/adjacent.', 'height = 50 × 1 = 50m.'] },
    ],
  },
  {
    id: 'case-8', title: 'The Statistical Suspect', description: 'A data breach at the bank! Analyse numbers to identify fraud.', difficulty: 2, xpReward: 75, topic: 'stats',
    stages: [
      { title: 'Mean Investigation', narrative: 'Five transactions: ₹100, 150, 200, 250, X. Mean = ₹200. Find X.', question: '(100+150+200+250+X) ÷ 5 = 200. Solve for X.', answer: 300, hints: ['Sum = 700 + X.', '(700+X)/5 = 200 → 700+X = 1000 → X = 300.'] },
      { title: 'Median Mystery', narrative: 'Sorted: 50, 80, 120, X, 200, 250. Median = 130. Find X.', question: 'Median = (120+X)/2 = 130. Find X.', answer: 140, hints: ['(120+X)/2 = 130.', '120+X = 260 → X = 140.'] },
    ],
  },
  {
    id: 'case-9', title: 'The Ratio Riddle', description: 'A coded message containing ratios. Crack the proportions!', difficulty: 1, xpReward: 45, topic: 'ratio',
    stages: [
      { title: 'Dividing the Loot', narrative: 'Two suspects split ₹300 in ratio 2:3. How much did the smaller share get?', question: 'Split 300 in ratio 2:3. Smaller = (2/5) × 300 = ?', answer: 120, hints: ['Total parts = 5.', 'One part = 300 ÷ 5 = 60.', 'Smaller = 2 × 60 = 120.'] },
      { title: 'Mixing Evidence', narrative: 'Two solutions mixed in ratio 3:7. Total = 500ml. How much of the first solution?', question: 'First = 3 × (500 ÷ 10) = ?', answer: 150, hints: ['One part = 500 ÷ 10 = 50 ml.', 'First = 3 × 50 = 150 ml.'] },
    ],
  },
  {
    id: 'case-10', title: 'The Algebraic Alibi', description: 'The suspect left a trail of algebraic equations. Solve each one!', difficulty: 3, xpReward: 90, topic: 'basicarith',
    stages: [
      { title: 'Linear Trail', narrative: 'Solve: 5x − 3 = 2x + 12. The answer is the house number.', question: '5x − 3 = 2x + 12. Solve for x.', answer: 5, hints: ['5x − 2x = 12 + 3 → 3x = 15.', 'x = 5.'] },
      { title: 'Simultaneous Sightings', narrative: 'Solve: 2x + y = 10 and x − y = 2. y is the floor number.', question: '2x + y = 10 and x − y = 2. What is y?', answer: 2, hints: ['Add equations: 3x = 12 → x = 4.', '4 − y = 2 → y = 2.'] },
      { title: 'Quadratic Questioning', narrative: 'x² − 7x + 12 = 0. The larger root is the page number.', question: 'x² − 7x + 12 = 0. Larger root = ?', answer: 4, hints: ['Factor: (x−3)(x−4) = 0.', 'Roots: x=3, x=4. Larger = 4.'] },
    ],
  },
  {
    id: 'case-11', title: 'The Number Theory Conspiracy', description: 'A conspiracy involving prime numbers, factors, and multiples. Use number theory!', difficulty: 3, xpReward: 100, topic: 'primefactor',
    stages: [
      { title: 'Prime Suspect', narrative: 'Sum of all primes between 10 and 20. That\'s the meeting room number.', question: 'Sum of primes between 10 and 20 (11,13,17,19) = ?', answer: 60, hints: ['Primes: 11, 13, 17, 19.', 'Sum = 60.'] },
      { title: 'Factor Finder', narrative: 'Prime factorization of 84. Sum all prime factors (including repeats).', question: '84 = 2×2×3×7. Sum = 2+2+3+7 = ?', answer: 14, hints: ['84 = 2×42 = 2×2×21 = 2×2×3×7.', 'Sum = 14.'] },
      { title: 'LCM Lock', narrative: 'LCM of 6 and 15 is the next code.', question: 'LCM(6, 15) = ?', answer: 30, hints: ['Multiples of 6: 6,12,18,24,30...', 'Multiples of 15: 15,30...', 'LCM = 30.'] },
    ],
  },
];

// Merge with new stories from detective-stories.js (avoid ID conflicts)
const EXISTING_IDS = new Set(ORIGINAL_CASES.map(c => c.id));
const NEW_STORIES = ALL_DETECTIVE_STORIES.filter(c => !EXISTING_IDS.has(c.id));
const ALL_CASES = [...ORIGINAL_CASES, ...NEW_STORIES, ...BOARD_CASES];

// ─── DetectiveCaseLibrary ───────────────────────────────────────────

function DetectiveCaseLibrary({ progress, cases, allComplete, onSelectCase, onBack }) {
  // Search/filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all'); // 'all' | 'classic' | 'enhanced'
  const searchInputRef = useRef(null);
  const caseListRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const [scrollActive, setScrollActive] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const [thumbTop, setThumbTop] = useState(0);

  // Group cases by topic for filter dropdown
  const topicGroups = {};
  for (const c of cases) {
    const topic = c.topic || 'general';
    if (!topicGroups[topic]) topicGroups[topic] = [];
    topicGroups[topic].push(c);
  }
  const uniqueTopics = Object.keys(topicGroups).sort();

  // Filter cases by search term, topic, and mode
  const filteredCases = cases.filter(c => {
    const matchesSearch = !searchTerm.trim() || 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = topicFilter === 'all' || c.topic === topicFilter;
    const matchesMode = modeFilter === 'all' ||
      (modeFilter === 'enhanced' && isEnhancedCase(c)) ||
      (modeFilter === 'crime-scene' && isBoardCase(c)) ||
      (modeFilter === 'classic' && !isEnhancedCase(c) && !isBoardCase(c));
    return matchesSearch && matchesTopic && matchesMode;
  });

  const classicCount = cases.filter(c => !isEnhancedCase(c) && !isBoardCase(c)).length;
  const enhancedCount = cases.filter(c => isEnhancedCase(c)).length;
  const crimeSceneCount = cases.filter(c => isBoardCase(c)).length;

  // Keyboard shortcut: Ctrl+F or / focuses search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey && e.key === 'f') || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName))) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Reset scroll position when filters change
  useEffect(() => {
    const el = caseListRef.current;
    if (!el) return;
    el.scrollTo(0, 0);
    setThumbTop(0);
    setCanScroll(el.scrollHeight - el.clientHeight > 0);
  }, [searchTerm, topicFilter, modeFilter]);

  // Show the scroll lens while scrolling; fade it out shortly after idle
  const handleCaseListScroll = () => {
    const el = caseListRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const hasOverflow = maxScroll > 0;
    setCanScroll(hasOverflow);
    if (hasOverflow) {
      const lensSize = 18; // matches .detective-scroll-pointer size in App.css
      setThumbTop((el.scrollTop / maxScroll) * (el.clientHeight - lensSize));
    }
    setScrollActive(true);
    clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => setScrollActive(false), 1300);
  };

  useEffect(() => () => clearTimeout(scrollTimerRef.current), []);

  return (
    <div className="app-shell">
      <div className="card" style={{ maxWidth: 'min(700px, 95vw)', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
          <button className="back-button" onClick={onBack} aria-label="Go back">← Back</button>
          <span style={{ flex: 1 }} />
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft)', fontWeight: 600 }}>
            {progress.casesSolved}/{cases.length} solved
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.3rem' }}>{allComplete ? '🏆' : '🗂️'}</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.3rem', fontFamily: 'var(--font-display)' }}>
            {allComplete ? 'All Cases Solved!' : 'Detective Case Library'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', margin: 0 }}>
            {allComplete
              ? 'Congratulations! You\'ve cracked every case. Replay any case below.'
              : `Choose a case to investigate. ${cases.length - progress.casesSolved} remaining.`}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', marginTop: '0.3rem' }}>
            {Object.keys(topicGroups).length} topics &middot; {cases.length} unique cases &middot; Press <kbd style={{ padding: '1px 5px', borderRadius: 4, background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', fontSize: '0.65rem' }}>/</kbd> to search
          </p>
        </div>

        {/* Search and filter bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', pointerEvents: 'none', opacity: 0.6 }}>🔍</span>
            <input ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search cases by title, topic or description..."
              style={{
                width: '100%', padding: '0.6rem 0.6rem 0.6rem 2rem', borderRadius: 10,
                border: '1.5px solid var(--clr-border)', background: 'var(--clr-input)',
                color: 'var(--clr-text)', fontSize: '0.85rem', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--clr-accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--clr-border)'}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--clr-text-soft)',
                  cursor: 'pointer', fontSize: '0.85rem', padding: '2px 4px',
                }}
              >
                ✕
              </button>
            )}
          </div>
          <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)}
            style={{
              padding: '0.6rem 0.8rem', borderRadius: 10,
              border: '1.5px solid var(--clr-border)', background: 'var(--clr-surface)',
              color: 'var(--clr-text)', fontSize: '0.8rem', fontWeight: 600, outline: 'none',
              cursor: 'pointer', maxWidth: 140,
            }}
          >
            <option value="all">All Topics</option>
            {uniqueTopics.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Mode filter tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
          {[
            { key: 'all', label: 'All Cases', icon: '📁', count: cases.length },
            { key: 'classic', label: 'Classic Mystery', icon: '🔎', count: classicCount },
            { key: 'enhanced', label: 'Case File', icon: '🕵️', count: enhancedCount },
            { key: 'crime-scene', label: 'Crime Scene', icon: '🗺️', count: crimeSceneCount },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setModeFilter(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.4rem 0.8rem', borderRadius: 999, border: 'none',
                background: modeFilter === tab.key ? 'var(--clr-accent)' : 'var(--clr-surface)',
                color: modeFilter === tab.key ? '#fff' : 'var(--clr-text-soft)',
                fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.2s',
                boxShadow: modeFilter === tab.key ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {tab.icon} {tab.label} <span style={{
                padding: '1px 6px', borderRadius: 999, fontSize: '0.65rem',
                background: modeFilter === tab.key ? 'rgba(255,255,255,0.25)' : 'var(--clr-border)',
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Case list */}
        {filteredCases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--clr-text-soft)', fontSize: '0.9rem' }}>
            🔍 No cases match your search. Try different keywords.
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div ref={caseListRef} className="detective-case-scroll" onScroll={handleCaseListScroll} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {filteredCases.map((caseItem, idx) => {
            const caseProgress = progress.cases[caseItem.id];
            const status = caseProgress ? caseProgress.status : 'not_started';
            const topicDisplay = caseItem.topic ? caseItem.topic.charAt(0).toUpperCase() + caseItem.topic.slice(1) : 'General';

            return (
              <button key={caseItem.id} onClick={() => onSelectCase(caseItem.id)}
                aria-label={'Open case: ' + caseItem.title}
                className={`mda-case-card mda-delay-${(idx % 8) + 1}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.2rem',
                  borderRadius: 12, border: status === 'solved'
                    ? '2px solid var(--clr-correct, #4caf50)'
                    : status === 'in_progress'
                      ? '2px solid var(--clr-accent)'
                      : '1.5px solid var(--clr-border)',
                  background: status === 'solved'
                    ? 'var(--clr-correct-bg, rgba(76,175,80,0.08))'
                    : status === 'in_progress'
                      ? 'var(--clr-accent-soft)'
                      : 'var(--clr-surface)',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'transform 0.15s, box-shadow 0.15s', color: 'var(--clr-text)',
                }}
              >
                <div style={{ textAlign: 'center', minWidth: 40, fontSize: '0.8rem' }}>
                  <div style={{ fontSize: '1.3rem' }}>
                    {caseItem.difficulty === 1 ? '🟢' : caseItem.difficulty === 2 ? '🟡' : '🔴'}
                  </div>
                  <div style={{
                    fontSize: '0.72rem', marginTop: '0.15rem', letterSpacing: '1px',
                    color: status === 'solved' ? '#ff9800' : 'var(--clr-text-soft)',
                    opacity: status === 'solved' ? 1 : 0.4,
                  }}>
                    {status === 'solved' && caseProgress && caseProgress.stars
                      ? '⭐'.repeat(caseProgress.stars) + '☆'.repeat(3 - caseProgress.stars)
                      : '☆☆☆'}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                    {caseItem.title}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-soft)', marginTop: '0.2rem', fontWeight: 600 }}>
                    📚 {topicDisplay} &middot; {isEnhancedCase(caseItem) ? 'Dynamic stages' : isBoardCase(caseItem) ? 'Crime scene board' : `${(caseItem.stages || []).length} stages`}
                    {isEnhancedCase(caseItem) && (
                      <span style={{ marginLeft: '0.4rem', padding: '1px 6px', borderRadius: 999, background: 'rgba(156, 39, 176, 0.12)', color: '#9c27b0', fontWeight: 700, fontSize: '0.6rem' }}>
                        🔎 Case Files
                      </span>
                    )}
                    {isBoardCase(caseItem) && (
                      <span style={{ marginLeft: '0.4rem', padding: '1px 6px', borderRadius: 999, background: 'rgba(198, 75, 52, 0.12)', color: '#C64B34', fontWeight: 700, fontSize: '0.6rem' }}>
                        🗺️ Board Case
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {status === 'solved' && (
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4caf50', padding: '2px 10px', borderRadius: 999, background: 'rgba(76,175,80,0.15)' }}>
                      Solved ✓
                    </div>
                  )}
                  {status === 'in_progress' && (
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-accent)', padding: '2px 10px', borderRadius: 999, background: 'var(--clr-accent-soft)' }}>
                      {isBoardCase(caseItem) ? 'In progress' : `Stage ${caseProgress.currentStage + 1}/${caseProgress.totalStages}`}
                    </div>
                  )}
                  {status === 'not_started' && (
                    <div style={{ fontSize: '1.2rem', opacity: 0.5 }}>→</div>
                  )}
                </div>
              </button>
              );
            })}
            </div>
            <div className={`detective-scroll-pointer${scrollActive && canScroll ? ' is-visible' : ''}`} style={{ top: thumbTop }} aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DetectiveCaseView (enhanced with hints) ─────────────────────────

function DetectiveCaseView({ caseData, initialStage, onComplete, onBack }) {
  const [stageIndex, setStageIndex] = useState(initialStage);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [skipMessage, setSkipMessage] = useState(false);
  const [motivationIdx, setMotivationIdx] = useState(0);
  const wrongMotivations = ['Close, detective! Give it another go.', 'Not quite — recheck the numbers!', 'Almost there! Try once more.', "Keep at it, detective! You're getting warmer.", "Don't give up! Look at the clues again."];
  const inputRef = useRef(null);
  const celebrationRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, [stageIndex]);

  const stage = caseData.stages[stageIndex];
  if (!stage) return null;

  const hints = stage.hints || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (revealed || !answer.trim()) return;
    const correct = checkDetectiveAnswer(stage.answer, answer);
    setRevealed(true);
    setFeedback({ correct, correctAnswer: stage.answer });
    if (!correct) setMotivationIdx(i => (i + 1) % wrongMotivations.length);
  };

  const handleHint = () => {
    if (hintLevel < hints.length) {
      setHintLevel(h => h + 1);
      setTotalHintsUsed(t => t + 1);
      setHintUsed(true);
    }
  };

  const handleNext = () => {
    if (!feedback) return;
    if (feedback.correct) {
      if (stageIndex + 1 >= caseData.stages.length) {
        setCompleted(true);
        const stars = totalHintsUsed === 0 ? 3 : totalHintsUsed <= 2 ? 2 : 1;
        onComplete(caseData.id, true, { hintUsed: totalHintsUsed > 0, stars, hintLevel: totalHintsUsed, totalHintsUsed });
      } else {
        const nextIdx = stageIndex + 1;
        setStageIndex(nextIdx);
        setAnswer('');
        setFeedback(null);
        setRevealed(false);
        setSkipMessage(false);
        setHintLevel(0);
        setHintUsed(false);
      }
    } else {
      setTotalHintsUsed(t => Math.max(0, t - hintLevel));
      setAnswer('');
      setFeedback(null);
      setRevealed(false);
      setSkipMessage(false);
      setHintLevel(0);
      setHintUsed(false);
    }
  };

  const handleSkip = () => {
    if (revealed || skipMessage) return;
    setSkipMessage(true);
  };

  useEffect(() => {
    if (!revealed) return;
    const handleKey = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); handleNext(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [revealed, feedback, stageIndex]);

  // ─── Star rating helper ────────────────────────────────────────────────
  function renderStars(hintLevel) {
    const starCount = hintLevel === 0 ? 3 : hintLevel === 1 ? 2 : 1;
    const stars = [];
    for (let i = 0; i < 3; i++) {
      stars.push(
        <span key={i} className={i < starCount ? 'mda-star' : ''} style={{ fontSize: '1.8rem', opacity: i < starCount ? 1 : 0.25, animationDelay: `${i * 0.15}s` }}>
          {i < starCount ? '⭐' : '☆'}
        </span>
      );
    }
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', margin: '0.2rem 0 0.5rem' }}>
        {stars}
      </div>
    );
  }

  // Play sound on correct stage answer
  useEffect(() => {
    if (revealed && feedback?.correct && stageIndex < caseData.stages.length - 1) {
      playCorrectSound();
    }
  }, [revealed, stageIndex]);

  // ─── Confetti effect ──────────────────────────────────────────────────
  useEffect(() => {
    if (!completed || !celebrationRef.current) return;
    const finalStars = totalHintsUsed === 0 ? 3 : totalHintsUsed <= 2 ? 2 : 1;
    playStarSound(finalStars);
    setTimeout(playConfettiSound, 300);
    const canvas = celebrationRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4', '#f368e0', '#ff9f43', '#00d2d3', '#4ade80', '#e8864a'];
    const confetti = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 14 + 4,
      h: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 4 + 2,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
    }));
    let frame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let allDone = true;
      confetti.forEach(c => {
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.rotSpeed;
        c.vy += 0.05;
        c.vx *= 0.99;
        if (c.y > canvas.height * 0.7) c.opacity -= 0.008;
        if (c.y < canvas.height + 50 && c.opacity > 0) allDone = false;
        ctx.save();
        ctx.globalAlpha = Math.max(0, c.opacity);
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rot * Math.PI) / 180);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      });
      if (!allDone) frame = requestAnimationFrame(animate);
    };
    animate();
    return () => { if (frame) cancelAnimationFrame(frame); };
  }, [completed]);

  if (completed) {
    const starCount = totalHintsUsed === 0 ? 3 : totalHintsUsed <= 2 ? 2 : 1;
    const xpMultiplier = starCount === 3 ? 1 : starCount === 2 ? 0.7 : 0.4;
    const xpEarned = Math.round(caseData.xpReward * xpMultiplier);

    return (
      <div className="app-shell">
        <canvas
          ref={celebrationRef}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}
        />
        <div className="card" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '2.5rem 2rem' }}>
          <div className="mda-trophy mda-floatSlow" style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🏆</div>
          <h1 className="mda-popIn" style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
            Case Solved!
          </h1>
          {renderStars(totalHintsUsed)}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div className="mda-popIn mda-delay-1" style={{ padding: '0.5rem 1rem', borderRadius: 12, background: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}>
              <div className="mda-countUp mda-delay-2" style={{ fontSize: '1.3rem', fontWeight: 800, color: starCount === 3 ? '#4caf50' : starCount === 2 ? '#ff9800' : '#f44336' }}>
                {starCount}/3
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-soft)', fontWeight: 600, textTransform: 'uppercase' }}>Stars</div>
            </div>
            <div className="mda-popIn mda-delay-2" style={{ padding: '0.5rem 1rem', borderRadius: 12, background: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}>
              <div className="mda-countUp mda-delay-3" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--clr-accent)' }}>+{xpEarned}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-soft)', fontWeight: 600, textTransform: 'uppercase' }}>XP Earned</div>
            </div>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            Excellent detective work! You cracked <strong>{caseData.title}</strong>!
          </p>
          <div style={{ marginBottom: '1.2rem', fontSize: '0.85rem', color: 'var(--clr-text-soft)', lineHeight: 1.6 }}>
            {totalHintsUsed === 0 && <span style={{ color: '#4caf50', fontWeight: 700 }}>🦅 No hints used across all stages — Masterful detective work!</span>}
            {totalHintsUsed === 1 && <span style={{ color: '#ff9800', fontWeight: 700 }}>💡 Used 1 hint total — try going solo next time for more stars!</span>}
            {totalHintsUsed === 2 && <span style={{ color: '#ff9800', fontWeight: 700 }}>💡 Used 2 hints total — try using fewer for more stars!</span>}
            {totalHintsUsed >= 3 && <span style={{ color: '#f44336', fontWeight: 700 }}>💡 Used {totalHintsUsed} hints total — challenge yourself to use fewer!</span>}
          </div>
          <button onClick={onBack} className="mda-popIn mda-delay-4"
            style={{
              padding: '0.8rem 2rem', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, var(--clr-accent), #d4733e)',
              color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(232,134,74,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(232,134,74,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(232,134,74,0.3)'; }}
            onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
            onPointerUp={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
          >
            Back to Case Library
          </button>
        </div>
      </div>
    );
  }

  const stageLabel = stageIndex === 0 ? 'Briefing' : `Stage ${stageIndex + 1}`;

  return (
    <div className="app-shell">
      <div className="card" style={{ maxWidth: 'min(600px, 95vw)', margin: '0 auto' }}>
        <button className="back-button" onClick={() => {
          if (!completed && stageIndex > 0) {
            saveInProgressCase(caseData.id, {
              currentStage: stageIndex,
              totalStages: caseData.stages.length,
              topic: caseData.topic,
            });
          }
          onBack();
        }} style={{ marginBottom: '0.8rem' }}>← Cases</button>

        {/* Progress indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '0.5rem', justifyContent: 'center' }}>
          {caseData.stages.map((_, i) => (
            <div key={i} style={{
              height: 4, flex: 1, maxWidth: 80, borderRadius: 2,
              background: i < stageIndex ? '#4caf50' : i === stageIndex ? 'var(--clr-accent)' : 'var(--clr-border)',
              transition: 'background 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
              transform: i === stageIndex && stageIndex > 0 ? 'scaleY(1.5)' : 'scaleY(1)',
            }} />
          ))}
        </div>

        {/* Detective mascot — reacts to game state */}
        <DetectiveMascot
          mood={
            revealed && feedback
              ? feedback.correct ? 'correct' : 'wrong'
              : hintLevel > 0 ? 'thinking'
              : 'neutral'
          }
          label={
            revealed && feedback
              ? feedback.correct ? 'Brilliant! ✨' : 'Try again...'
              : hintLevel > 0 ? 'Follow the clues!' : 'Think carefully'
          }
        />

        {/* Stage content wrapper — keyed on stageIndex to replay animations */}
        <div key={`stage-${stageIndex}-${stageIndex}`} className="mda-fadeIn">

        {/* Stage header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }} className="mda-stage-badge">
          <span style={{
            padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
            background: 'var(--clr-accent-soft)', color: 'var(--clr-accent)',
          }}>
            {stageLabel}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', fontWeight: 600 }}>
            {stageIndex + 1} of {caseData.stages.length}
          </span>
          {caseData.topic && (
            <span style={{
              padding: '3px 8px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 600,
              background: 'var(--clr-surface)', color: 'var(--clr-text-soft)', border: '1px solid var(--clr-border)',
              marginLeft: 'auto',
            }}>
              📚 {caseData.topic}
            </span>
          )}
        </div>

        {/* Narrative */}
        <div className="mda-narrative" style={{
          background: 'var(--clr-surface)', borderRadius: 12, padding: '1rem 1.2rem',
          marginBottom: '1.2rem', border: '1.5px solid var(--clr-border)',
          fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--clr-text)',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--clr-text-soft)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📜 Investigation Notes
          </div>
          {stage.narrative}
        </div>

        {/* Question */}
        <div className="mda-question-card" style={{
          textAlign: 'center', padding: '1rem', marginBottom: '1rem',
          borderRadius: 12, background: 'var(--clr-bg)', border: '1.5px solid var(--clr-accent)',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--clr-accent)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🔍 Solve This
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4 }}>
            {stage.question}
          </div>
        </div>

        {/* Hints section */}
        {!revealed && hints.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <button onClick={handleHint}
              disabled={hintLevel >= hints.length}
              aria-label={hintLevel >= hints.length ? 'No more hints' : `Need a hint? ${hintLevel + 1} of ${hints.length} left`}
              title={hintLevel >= hints.length ? 'No more hints available' : `Need a hint? ${hintLevel + 1} of ${hints.length} left`}
              style={{
                width: 42, height: 42, borderRadius: '50%', border: '2px solid',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', cursor: hintLevel >= hints.length ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                ...(hintLevel >= hints.length
                  ? { borderColor: 'var(--clr-border)', background: 'transparent', opacity: 0.45, color: 'var(--clr-text-soft)' }
                  : { borderColor: '#ffc107', background: 'rgba(255, 193, 7, 0.14)', color: '#ffc107', boxShadow: '0 0 10px rgba(255, 193, 7, 0.45)' }),
              }}
            >
              <span style={{ display: 'inline-flex', filter: hintLevel >= hints.length ? 'grayscale(1) brightness(0.65)' : 'none' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                </svg>
              </span>
            </button>
            {hintLevel > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {hints.slice(0, hintLevel).map((h, i) => (
                  <div key={i} className="mda-hint-reveal" style={{
                    padding: '0.5rem 0.8rem', borderRadius: 8,
                    background: 'rgba(255, 152, 0, 0.08)', border: '1px solid rgba(255, 152, 0, 0.2)',
                    fontSize: '0.85rem', color: 'var(--clr-text)', lineHeight: 1.4,
                  }}>
                    <span style={{ fontWeight: 700, color: '#ff9800' }}>Hint {i + 1}:</span> {h}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        </div> {/* end stage content wrapper */}

        {/* Answer input / Skip message / Feedback */}
        {skipMessage ? (
          <div style={{
            textAlign: 'center', padding: '1.2rem', borderRadius: 12, marginTop: '0.8rem',
            background: 'rgba(255, 152, 0, 0.08)', border: '2px solid rgba(255, 152, 0, 0.25)',
          }}>
            <DetectiveMascot mood="thinking" label="Every clue matters, Chief!" />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ff9800', marginBottom: '0.4rem' }}>
              Chief, this clue can be useful!
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)', marginBottom: '0.8rem', lineHeight: 1.5 }}>
              Skipping means you'll lose a star on this case. Think carefully before giving up.
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button onClick={() => setSkipMessage(false)}
                style={{
                  padding: '0.5rem 1.2rem', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, var(--clr-accent), #d4733e)',
                  color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                }}
              >
                🔍 I'll keep investigating
              </button>
              <button onClick={() => {
                setRevealed(true);
                setFeedback({ correct: false, correctAnswer: stage.answer });
                setSkipMessage(false);
                setTotalHintsUsed(t => t + 1);
              }}
                style={{
                  padding: '0.5rem 1.2rem', borderRadius: 8,
                  border: '1.5px solid var(--clr-border)', background: 'var(--clr-surface)',
                  color: 'var(--clr-text-soft)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                }}
              >
                Skip anyway
              </button>
            </div>
          </div>
        ) : !revealed ? (
          <>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <input ref={inputRef} type="text" value={answer} onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer..."
                style={{
                  flex: 1, maxWidth: 200, padding: '0.7rem 1rem', borderRadius: 10,
                  border: '2px solid var(--clr-border)', background: 'var(--clr-input)',
                  color: 'var(--clr-text)', fontSize: '1.1rem', textAlign: 'center', fontWeight: 600,
                  outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--clr-accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--clr-border)'}
              />
              <button type="submit" disabled={!answer.trim()}
                className="mda-btn-press"
                style={{
                  padding: '0.7rem 1.5rem', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, var(--clr-accent), #d4733e)',
                  color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: answer.trim() ? 'pointer' : 'not-allowed',
                  opacity: answer.trim() ? 1 : 0.5,
                }}
              >
                🔍 Submit Evidence
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button onClick={handleSkip}
                style={{
                  background: 'none', border: 'none', color: 'var(--clr-text-soft)',
                  fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.6,
                }}
              >
                Skip this question
              </button>
            </div>
          </>
        ) : (
          <div className={feedback && feedback.correct ? 'mda-feedback-correct' : 'mda-feedback-wrong'} style={{
            textAlign: 'center', padding: '1rem', borderRadius: 12,
            background: feedback && feedback.correct ? 'var(--clr-correct-bg, rgba(76,175,80,0.12))' : 'var(--clr-wrong-bg, rgba(224,90,74,0.12))',
            border: feedback && feedback.correct ? '2px solid var(--clr-correct, #4caf50)' : '2px solid var(--clr-wrong, #e05a4a)',
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem',
              color: feedback && feedback.correct ? 'var(--clr-correct, #4caf50)' : 'var(--clr-wrong, #e05a4a)' }}>
              {feedback && feedback.correct ? '✓ Correct!' : '🔍 ' + wrongMotivations[motivationIdx]}
            </div>
            {!feedback.correct && (
              <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginBottom: '0.5rem' }}>
                The correct answer was: <strong>{feedback && feedback.correctAnswer}</strong>
              </div>
            )}
            {feedback && feedback.correct && stageIndex < caseData.stages.length - 1 && (
              <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginBottom: '0.5rem' }}>
                On to the next stage!
              </div>
            )}
            <button onClick={handleNext} className="mda-btn-press"
              style={{
                marginTop: '0.5rem', padding: '0.5rem 1.5rem', borderRadius: 8,
                border: 'none', background: feedback && feedback.correct ? '#4caf50' : '#e05a4a',
                color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
              }}
            >
              {feedback && feedback.correct
                ? (stageIndex + 1 >= caseData.stages.length ? 'Complete Case' : 'Next Stage')
                : 'Try Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Achievement Badges ──────────────────────────────────────────────────

const ACHIEVEMENTS = [
  { id: 'first_case',    title: 'First Case',       icon: '🎯', desc: 'Solve your first case', check: (p) => p.casesSolved >= 1 },
  { id: 'perfect_score', title: 'Perfect Score',    icon: '⭐', desc: 'Get 3 stars on a case', check: (p) => Object.values(p.cases || {}).some(c => c.stars === 3) },
  { id: 'speed_demon',   title: 'Speed Demon',      icon: '🚀', desc: 'Solve 3 cases without hints', check: (p) => Object.values(p.cases || {}).filter(c => c.hintLevel === 0).length >= 3 },
  { id: 'veteran',       title: 'Veteran',           icon: '🎖️', desc: 'Solve 10 cases', check: (p) => p.casesSolved >= 10 },
  { id: 'diamond',       title: 'Diamond Detective', icon: '💎', desc: 'Get 3 stars on 5 cases', check: (p) => Object.values(p.cases || {}).filter(c => c.stars === 3).length >= 5 },
  { id: 'scholar',       title: 'Scholar',           icon: '📚', desc: 'Solve cases from 10 topics', check: (p) => { const topics = new Set(Object.values(p.cases || {}).map(c => c.topic)); return topics.size >= 10; } },
  { id: 'completionist', title: 'Completionist',     icon: '🏆', desc: 'Solve all cases', check: (p) => false },
];

const ACHIEVEMENT_STORAGE_KEY = 'tenali-detective-achievements';
const NEW_ACHIEVEMENT_KEY = 'tenali-detective-new-achievements';

function loadAchievements() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveAchievements(data) {
  try { localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function checkAndAwardAchievements(progress) {
  const unlocked = loadAchievements();
  const newlyUnlocked = [];
  for (const a of ACHIEVEMENTS) {
    if (!unlocked[a.id] && a.check(progress)) {
      unlocked[a.id] = { unlockedAt: Date.now() };
      newlyUnlocked.push(a);
    }
  }

  // If completionist check is global
  // Get ALL_CASES... but this function doesn't have access to it
  // We'll do the completionist check in the main component

  saveAchievements(unlocked);
  return newlyUnlocked;
}

function DetectiveAchievements({ onBack, progress }) {
  const [unlocked, setUnlocked] = useState(loadAchievements);
  const [dismissedNotif, setDismissedNotif] = useState(null);

  const earnedCount = Object.keys(unlocked).length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="app-shell">
      <div className="card" style={{ maxWidth: 'min(600px, 95vw)', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
          <button className="back-button" onClick={onBack}>← Back</button>
          <span style={{ flex: 1 }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.3rem' }}>🏅</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.3rem', fontFamily: 'var(--font-display)' }}>
            Detective Achievements
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', margin: 0 }}>
            {earnedCount}/{totalCount} badges earned
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ height: 8, borderRadius: 4, background: 'var(--clr-border)', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ height: '100%', borderRadius: 4, width: (earnedCount / totalCount) * 100 + '%', background: 'linear-gradient(90deg, #4caf50, #ff9800, #e8864a)', transition: 'width 0.5s ease' }} />
        </div>

        {/* Badge grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          {ACHIEVEMENTS.map((a, idx) => {
            const isUnlocked = !!unlocked[a.id];
            return (
              <div key={a.id} className={`mda-achievement-card ${isUnlocked ? 'mda-badgeReveal' : ''} mda-delay-${(idx % 6) + 1}`} style={{
                display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem',
                borderRadius: 12, background: isUnlocked ? 'var(--clr-surface)' : 'var(--clr-bg)',
                border: isUnlocked ? '1.5px solid var(--clr-accent)' : '1.5px dashed var(--clr-border)',
                opacity: isUnlocked ? 1 : 0.4,
                transition: 'all 0.3s ease',
              }}>
                <div style={{
                  fontSize: '1.8rem', width: 44, height: 44, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isUnlocked ? 'var(--accent-soft, rgba(232,134,74,0.12))' : 'transparent',
                  flexShrink: 0,
                }}>
                  {isUnlocked ? a.icon : '🔒'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isUnlocked ? 'var(--clr-text)' : 'var(--clr-text-soft)', marginBottom: 2 }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-soft)' }}>
                    {isUnlocked ? `✓ ${a.desc}` : a.desc}
                  </div>
                  {isUnlocked && (
                    <div style={{ fontSize: '0.6rem', color: 'var(--clr-text-soft)', marginTop: 2 }}>
                      Unlocked {new Date(unlocked[a.id].unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Achievement Notification ─────────────────────────────────────────

function AchievementNotification({ achievements, onDismiss }) {
  if (!achievements || achievements.length === 0) return null;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => onDismiss(), 500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: visible ? 'translateX(-50%)' : 'translateX(-50%) translateY(-120%)',
      zIndex: 10000, transition: 'transform 0.4s ease',
      maxWidth: '90vw', width: 380,
    }}>
      {achievements.map((a, i) => (
        <div key={a.id} style={{
          padding: '0.8rem 1.2rem', borderRadius: 12,
          background: 'linear-gradient(135deg, var(--clr-accent), #d4733e)', color: '#fff',
          boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', gap: '0.8rem',
          marginBottom: i < achievements.length - 1 ? '0.5rem' : 0,
        }}>
          <div style={{ fontSize: '2rem' }}>{a.icon}</div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8 }}>
              Achievement Unlocked!
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{a.title}</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>{a.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Leaderboard Component ───────────────────────────────────────────────

const LEADERBOARD_KEY = 'tenali-detective-leaderboard';

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { bestScores: [], byCase: {} };
}

function saveLeaderboard(data) {
  try { localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data)); } catch {}
}

function updateLeaderboard(caseId, stars, xp, hintLevel, topic) {
  const data = loadLeaderboard();
  
  // Update best score per case
  const existing = data.byCase[caseId];
  if (!existing || stars > existing.stars || (stars === existing.stars && xp > existing.xp)) {
    data.byCase[caseId] = { stars, xp, hintLevel, topic, date: Date.now() };
  }
  
  // Update all-time best scores list
  data.bestScores.push({ caseId, stars, xp, hintLevel, topic, date: Date.now() });
  data.bestScores.sort((a, b) => b.stars - a.stars || b.xp - a.xp);
  if (data.bestScores.length > 20) data.bestScores = data.bestScores.slice(0, 20);
  
  saveLeaderboard(data);
}

function DetectiveLeaderboard({ onBack, progress, totalCases, caseLookup }) {
  const [leaderData, setLeaderData] = useState(loadLeaderboard);
  const [sortBy, setSortBy] = useState('stars'); // 'stars' | 'xp' | 'recent'

  let entries = Object.entries(leaderData.byCase);
  
  if (sortBy === 'stars') {
    entries.sort((a, b) => (b[1].stars || 0) - (a[1].stars || 0) || (b[1].xp || 0) - (a[1].xp || 0));
  } else if (sortBy === 'xp') {
    entries.sort((a, b) => (b[1].xp || 0) - (a[1].xp || 0) || (b[1].stars || 0) - (a[1].stars || 0));
  } else {
    entries.sort((a, b) => (b[1].date || 0) - (a[1].date || 0));
  }

  const getCaseTitle = (id) => {
    const c = caseLookup[id];
    return c ? c.title : id;
  };

  const totalBestStars = Object.values(leaderData.byCase).reduce((s, v) => s + (v.stars || 0), 0);
  const possibleStars = totalCases * 3;

  return (
    <div className="app-shell">
      <div className="card" style={{ maxWidth: 'min(650px, 95vw)', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
          <button className="back-button" onClick={onBack}>← Back</button>
          <span style={{ flex: 1 }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.3rem' }}>🏆</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.3rem', fontFamily: 'var(--font-display)' }}>
            Detective Leaderboard
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', margin: 0 }}>
            Best scores across all cases
          </p>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.2rem', justifyContent: 'center' }}>
          <div style={{ background: 'var(--clr-surface)', borderRadius: 10, padding: '0.7rem 1rem', textAlign: 'center', border: '1.5px solid var(--clr-border)', flex: 1 }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ff9800' }}>{totalBestStars}/{possibleStars}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-soft)', fontWeight: 600, textTransform: 'uppercase' }}>Best Stars</div>
          </div>
          <div style={{ background: 'var(--clr-surface)', borderRadius: 10, padding: '0.7rem 1rem', textAlign: 'center', border: '1.5px solid var(--clr-border)', flex: 1 }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--clr-accent)' }}>{Object.keys(leaderData.byCase).length}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-soft)', fontWeight: 600, textTransform: 'uppercase' }}>Cases Recorded</div>
          </div>
        </div>

        {/* Sort toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'center' }}>
          {['stars', 'xp', 'recent'].map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              style={{
                padding: '0.3rem 1rem', borderRadius: 999, border: sortBy === s ? '1.5px solid var(--clr-accent)' : '1.5px solid var(--clr-border)',
                background: sortBy === s ? 'var(--clr-accent-soft)' : 'transparent',
                color: sortBy === s ? 'var(--clr-accent)' : 'var(--clr-text-soft)',
                cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s',
              }}
            >
              {s === 'stars' ? '⭐ Best Stars' : s === 'xp' ? '⚡ Best XP' : '🕐 Recent'}
            </button>
          ))}
        </div>

        {/* Leaderboard list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {entries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--clr-text-soft)', fontSize: '0.9rem' }}>
              No cases solved yet. Start investigating to see your scores!
            </div>
          )}
          {entries.map(([id, data], i) => (
            <div key={id} className={`mda-leaderboard-row mda-delay-${(i % 8) + 1}`} style={{
              display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 1rem',
              borderRadius: 10, background: i === 0 && sortBy === 'stars' ? 'rgba(255,152,0,0.08)' : 'var(--clr-surface)',
              border: i === 0 && sortBy === 'stars' ? '1.5px solid rgba(255,152,0,0.3)' : '1.5px solid var(--clr-border)',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: i === 0 ? '#ff9800' : i === 1 ? '#9e9e9e' : i === 2 ? '#8d6e63' : 'var(--clr-text-soft)', minWidth: 24, textAlign: 'center' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--clr-text)', marginBottom: 2 }}>
                  {getCaseTitle(id)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-soft)' }}>
                  📚 {data.topic || 'general'} &middot; {new Date(data.date).toLocaleDateString()}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', letterSpacing: '1px' }}>
                  <span style={{ color: '#ff9800' }}>{'⭐'.repeat(data.stars)}{'☆'.repeat(3 - data.stars)}</span>
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-accent)' }}>+{data.xp} XP</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Floating Background Particles ───────────────────────────────────
function DetectiveParticles() {
  const particles = useMemo(() => {
    const emojis = ['🔍', '🔎', '⭐', '🕵️', '🔦', '📜', '🧩', '💡', '📋', '🔐', '🎯', '📝'];
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      left: Math.random() * 100,
      size: 1.2 + Math.random() * 1.4,
      duration: 12 + Math.random() * 18,
      delay: Math.random() * 20,
    }));
  }, []);

  return (
    <div className="mda-particles-container" aria-hidden="true">
      {/* {particles.map(p => (
        <span
          key={p.id}
          className="mda-particle"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}rem`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </span>
      ))} */}
    </div>
  );
}

// ─── Detective Mascot ────────────────────────────────────────────────────
// Mood-tinted circular badge with glow, a speech-bubble label, and a pop
// animation that replays whenever the mood changes (key on mood forces remount).
const MASCOT_MOODS = {
  neutral:  { emoji: '🕵️', label: 'Sherlock',      tint: '#64748b', soft: 'rgba(100,116,139,0.14)' },
  thinking: { emoji: '🤔', label: 'Hmm...',        tint: '#f59e0b', soft: 'rgba(245,158,11,0.16)'  },
  correct:  { emoji: '😎', label: 'Nice!',         tint: '#22c55e', soft: 'rgba(34,197,94,0.16)'   },
  wrong:    { emoji: '🧐', label: 'Try again',     tint: '#ef4444', soft: 'rgba(239,68,68,0.16)'   },
  hint:     { emoji: '💡', label: 'Here\'s a clue', tint: '#f59e0b', soft: 'rgba(245,158,11,0.16)'  },
  solved:   { emoji: '🥳', label: 'Case solved!',  tint: '#22c55e', soft: 'rgba(34,197,94,0.16)'   },
  party:    { emoji: '🎉', label: 'Brilliant!',    tint: '#a855f7', soft: 'rgba(168,85,247,0.16)'  },
};

function DetectiveMascot({ mood = 'neutral', label }) {
  const m = MASCOT_MOODS[mood] || MASCOT_MOODS.neutral;
  const statusMark = mood === 'correct' ? '✓' : mood === 'wrong' ? '✗' : mood === 'solved' || mood === 'party' ? '★' : '?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem', margin: '0.5rem 0' }}>
      <div key={mood} className="mda-mascot-badge" role="img" aria-label={label || m.label}
        style={{
          position: 'relative',
          width: 72, height: 72, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.4rem',
          background: `radial-gradient(circle at 30% 25%, #ffffff55, transparent 55%), ${m.soft}`,
          border: `2.5px solid ${m.tint}`,
          boxShadow: `inset 0 -8px 14px rgba(0,0,0,0.08), 0 0 26px ${m.tint}${mood === 'neutral' ? '55' : '99'}, 0 4px 10px rgba(0,0,0,0.12)`,
        }}>
        {m.emoji}
        <span aria-hidden="true" style={{
          position: 'absolute', top: -4, right: -4,
          width: 22, height: 22, borderRadius: '50%',
          background: '#fff', border: `2px solid ${m.tint}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72rem', fontWeight: 800, color: m.tint,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}>
          {statusMark}
        </span>
      </div>
      <div className="mda-mascot-speech" style={{
        background: m.soft,
        border: `1.5px solid ${m.tint}`,
        color: m.tint,
        fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.2px',
        padding: '4px 13px', borderRadius: 999,
        boxShadow: `0 3px 10px ${m.soft}`,
      }}>
        {label || m.label}
      </div>
    </div>
  );
}

// ─── SuspectLineup — suspect profiles at case start ────────────────────

function SuspectLineup({ suspects, onContinue }) {
  const [expandedMotive, setExpandedMotive] = useState(null);

  return (
    <div className="app-shell">
      <div className="card" style={{ maxWidth: 'min(800px, 95vw)', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.3rem' }}>🕵️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.3rem', fontFamily: 'var(--font-display)' }}>
            Suspect Profiles
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', margin: 0 }}>
            Study each suspect before investigating. Remember their roles, alibis, and characteristics.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: suspects.length <= 3 ? `repeat(${suspects.length}, 1fr)` : 'repeat(2, 1fr)',
          gap: '0.8rem',
          marginBottom: '1.5rem',
        }}>
          {suspects.map((suspect, idx) => (
            <div key={suspect.id} className={`mda-delay-${(idx % 4) + 1}`}
              role="article"
              aria-label={`Suspect: ${suspect.name}, ${suspect.role}`}
              style={{
              background: 'var(--clr-surface)',
              borderRadius: 14,
              border: '1.5px solid var(--clr-border)',
              padding: '1.2rem 1rem',
              textAlign: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              <div style={{ fontSize: '2.8rem', marginBottom: '0.3rem' }} aria-hidden="true">{suspect.appearance}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-soft)', marginBottom: '0.4rem', fontWeight: 600 }}>
                {suspect.appearance} {suspect.name}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.15rem', fontFamily: 'var(--font-display)' }}>
                {suspect.name}
              </div>
              <div style={{
                fontSize: '0.72rem', fontWeight: 600, color: 'var(--clr-accent)',
                padding: '2px 8px', borderRadius: 999, background: 'var(--clr-accent-soft)',
                display: 'inline-block', marginBottom: '0.6rem',
              }}>
                {suspect.role}
              </div>

              <div style={{
                fontSize: '0.8rem', color: 'var(--clr-text-soft)', fontStyle: 'italic',
                lineHeight: 1.5, marginBottom: '0.8rem',
                padding: '0.5rem', borderRadius: 8, background: 'var(--clr-bg)',
              }}>
                "{suspect.alibi}"
              </div>

              {/* Characteristics badges */}
              <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                {suspect.characteristics && Object.entries(suspect.characteristics).map(([key, val]) => (
                  <span key={key} style={{
                    fontSize: '0.65rem', padding: '2px 8px', borderRadius: 999,
                    background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
                    fontWeight: 600, color: 'var(--clr-text-soft)',
                  }} aria-label={`${key}: ${val}`}>
                    {key === 'height' ? '📏' : key === 'hand' ? '✋' : '•'} {val}
                  </span>
                ))}
              </div>

              {/* Motive — expandable */}
              <button
                onClick={() => setExpandedMotive(expandedMotive === suspect.id ? null : suspect.id)}
                style={{
                  fontSize: '0.72rem', color: 'var(--clr-text-soft)', background: 'none',
                  border: '1px dashed var(--clr-border)', borderRadius: 8, padding: '3px 10px',
                  cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
                }}
              >
                {expandedMotive === suspect.id ? '▼ Hide motive' : '▶ View motive'}
              </button>
              {expandedMotive === suspect.id && (
                <div style={{
                  marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--clr-text)',
                  padding: '0.4rem 0.6rem', borderRadius: 8,
                  background: 'rgba(244, 67, 54, 0.08)', border: '1px solid rgba(244, 67, 54, 0.2)',
                  lineHeight: 1.4,
                }}>
                  🔍 {suspect.motive}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={onContinue}
            className="mda-btn-press"
            style={{
              padding: '0.8rem 2rem', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, var(--clr-accent), #d4733e)',
              color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(232,134,74,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            🔍 I've read the profiles. Let's investigate!
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EvidencePanel — collapsible evidence review ─────────────────────────

function EvidencePanel({ evidenceItems, suspects, eliminatedIds }) {
  const [isOpen, setIsOpen] = useState(true);
  const remaining = suspects.filter(s => !eliminatedIds.has(s.id));
  const eliminated = suspects.filter(s => eliminatedIds.has(s.id));

  return (
    <div style={{
      background: 'var(--clr-surface)', borderRadius: 14,
      border: '1.5px solid var(--clr-border)', marginBottom: '1rem',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center',
          gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--clr-text)', fontWeight: 700, fontSize: '0.85rem', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>📓</span>
        <span style={{ flex: 1 }}>Evidence Notebook ({evidenceItems.length} clue{evidenceItems.length !== 1 ? 's' : ''} solved)</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
      </button>

      {isOpen && (
        <div style={{ padding: '0 1rem 1rem' }}>
          {/* Evidence cards */}
          {evidenceItems.length === 0 && (
            <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)', textAlign: 'center', padding: '1rem' }}>
              No evidence collected yet. Solve clues to gather evidence.
            </div>
          )}
          {evidenceItems.map((ev, idx) => {
            const actuallyEliminated = (ev.eliminates || []).filter(id => eliminatedIds.has(id));
            const eliminatedSuspects = actuallyEliminated.map(id => suspects.find(s => s.id === id)).filter(Boolean);
            return (
              <div key={ev.id || idx} style={{
                padding: '0.7rem 0.8rem', borderRadius: 10, marginBottom: '0.5rem',
                background: 'var(--clr-bg)', border: '1px solid var(--clr-border)',
                fontSize: '0.82rem', lineHeight: 1.5,
              }}>
                <div style={{ fontWeight: 700, color: 'var(--clr-accent)', fontSize: '0.7rem', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
                  Evidence #{idx + 1}
                </div>
                <div style={{ color: 'var(--clr-text)', marginBottom: '0.3rem' }}>{ev.summary || ev.text}</div>
                {eliminatedSuspects.length > 0 && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--clr-wrong, #e05a4a)', fontWeight: 600 }}>
                    ✗ Eliminated: {eliminatedSuspects.map(s => s.name).join(', ')}
                  </div>
                )}
                {eliminatedSuspects.length === 0 && actuallyEliminated.length === 0 && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-soft)', fontStyle: 'italic' }}>
                    No elimination performed for this clue
                  </div>
                )}
              </div>
            );
          })}

          {/* Suspect status */}
          <div style={{ marginTop: '0.8rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--clr-text-soft)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Suspect Status
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {remaining.map(s => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  padding: '4px 10px', borderRadius: 999,
                  background: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)',
                  fontSize: '0.75rem', fontWeight: 600, color: '#4caf50',
                }}>
                  {s.appearance} {s.name}
                </div>
              ))}
              {eliminated.map(s => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  padding: '4px 10px', borderRadius: 999,
                  background: 'rgba(244, 67, 54, 0.08)', border: '1px solid rgba(244, 67, 54, 0.2)',
                  fontSize: '0.75rem', fontWeight: 600, color: 'var(--clr-text-soft)',
                  textDecoration: 'line-through', opacity: 0.7,
                }}>
                  {s.appearance} {s.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Evidence highlight helpers ───────────────────────────────────────────

function HighlightedEvidenceText({ text, suspects, eliminatedIds }) {
  const segments = highlightEvidenceSentences(text, suspects, eliminatedIds);
  const out = [];
  segments.forEach((seg, i) => {
    if (i > 0) out.push(' ');
    if (!seg.highlight) { out.push(<span key={i}>{seg.text}</span>); return; }
    if (!seg.token) { out.push(<mark key={i} className="detective-evidence-mark">{seg.text}</mark>); return; }
    const parts = seg.text.split(new RegExp(`(\\b${escapeRegex(seg.token)}\\b)`, 'i'));
    out.push(
      <mark key={i} className="detective-evidence-mark">
        {parts.map((part, j) =>
          part.toLowerCase() === seg.token.toLowerCase()
            ? <strong key={j} className="detective-evidence-token">{part}</strong>
            : part
        )}
      </mark>
    );
  });
  return out;
}

// ─── CaseCompletionScreen — shared completion + confetti ────────────────
// Owns its celebration canvas and confetti animation so both EnhancedCasePlay
// (list mode) and PathCasePlay (circle path mode) can reuse it.

function CaseCompletionScreen({ onBack, starCount, xpEarned, xpLabel, culpritName, culpritAppearance }) {
  const celebrationRef = useRef(null);

  useEffect(() => {
    const canvas = celebrationRef.current;
    if (!canvas) return;
    playStarSound(starCount);
    setTimeout(playConfettiSound, 300);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4', '#f368e0', '#ff9f43', '#00d2d3', '#4ade80', '#e8864a'];
    const confetti = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 14 + 4,
      h: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 4 + 2,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
    }));
    let frame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let allDone = true;
      confetti.forEach(c => {
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.rotSpeed;
        c.vy += 0.05;
        c.vx *= 0.99;
        if (c.y > canvas.height * 0.7) c.opacity -= 0.008;
        if (c.y < canvas.height + 50 && c.opacity > 0) allDone = false;
        ctx.save();
        ctx.globalAlpha = Math.max(0, c.opacity);
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rot * Math.PI) / 180);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      });
      if (!allDone) frame = requestAnimationFrame(animate);
    };
    animate();
    return () => { if (frame) cancelAnimationFrame(frame); };
  }, [starCount]);

  return (
    <div className="app-shell">
      <canvas ref={celebrationRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}
      />
      <div className="card" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '2.5rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🏆</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
          Case Solved!
        </h1>
        {/* Star rating */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', margin: '0.2rem 0 0.5rem' }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ fontSize: '1.8rem', opacity: i < starCount ? 1 : 0.25 }}>
              {i < starCount ? '⭐' : '☆'}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.5rem 1rem', borderRadius: 12, background: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: starCount === 3 ? '#4caf50' : starCount === 2 ? '#ff9800' : '#f44336' }}>{starCount}/3</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-soft)', fontWeight: 600, textTransform: 'uppercase' }}>Stars</div>
          </div>
          <div style={{ padding: '0.5rem 1rem', borderRadius: 12, background: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--clr-accent)' }}>+{xpEarned}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-soft)', fontWeight: 600, textTransform: 'uppercase' }}>{xpLabel}</div>
          </div>
        </div>
        <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{culpritAppearance}</div>
        <p style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
          The culprit was <strong>{culpritName}</strong>! Brilliant detective work.
        </p>
        <button onClick={onBack}
          style={{
            padding: '0.8rem 2rem', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, var(--clr-accent), #d4733e)',
            color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(232,134,74,0.3)',
          }}
        >
          Back to Case Library
        </button>
      </div>
    </div>
  );
}

// ─── EvidenceSummaryPrompt — shared "select your proof" step ─────────────

function EvidenceSummaryPrompt({ evidenceItems, selectedProofs, onToggleProof, onDone, onBack }) {
  return (
    <div className="app-shell">
      <div className="card" style={{ maxWidth: 'min(650px, 95vw)', margin: '0 auto' }}>
        <button className="back-button" onClick={onBack} style={{ marginBottom: '0.8rem' }}>← Back to clues</button>

        <DetectiveMascot mood="thinking" label="Build your case before accusing" />

        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>📋</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.3rem', fontFamily: 'var(--font-display)' }}>
            Evidence Summary
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.2rem' }}>
          {evidenceItems.map((ev, idx) => {
            const isSelected = selectedProofs.has(ev.id);
            return (
              <button key={ev.id}
                onClick={() => onToggleProof(ev.id)}
                aria-pressed={isSelected}
                aria-label={`Evidence ${idx + 1}: ${(ev.summary || ev.text).slice(0, 60)}${(ev.summary || ev.text).length > 60 ? '...' : ''}`}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.7rem',
                  padding: '0.7rem 0.8rem', borderRadius: 10, textAlign: 'left',
                  background: isSelected ? 'rgba(76, 175, 80, 0.08)' : 'var(--clr-bg)',
                  border: isSelected ? '2px solid var(--clr-correct, #4caf50)' : '1px solid var(--clr-border)',
                  cursor: 'pointer', transition: 'all 0.2s', color: 'var(--clr-text)', width: '100%',
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isSelected ? '#4caf50' : 'var(--clr-surface)',
                  border: isSelected ? 'none' : '1.5px solid var(--clr-border)',
                  color: isSelected ? '#fff' : 'var(--clr-text-soft)',
                  fontWeight: 800, fontSize: '0.75rem', marginTop: '0.1rem',
                }}>
                  {isSelected ? '✓' : idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--clr-accent)', marginBottom: '0.15rem', textTransform: 'uppercase' }}>
                    Evidence #{idx + 1}
                  </div>
                  <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>{ev.summary || ev.text}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', marginBottom: '0.6rem' }}>
            {selectedProofs.size} of {evidenceItems.length} evidence pieces selected (minimum 2)
          </div>
          <button onClick={onDone}
            disabled={selectedProofs.size < 2}
            style={{
              padding: '0.7rem 2rem', borderRadius: 12, border: 'none',
              background: selectedProofs.size >= 2
                ? 'linear-gradient(135deg, var(--clr-accent), #d4733e)'
                : 'var(--clr-border)',
              color: selectedProofs.size >= 2 ? '#fff' : 'var(--clr-text-soft)',
              fontWeight: 700, fontSize: '0.95rem', cursor: selectedProofs.size >= 2 ? 'pointer' : 'not-allowed',
              boxShadow: selectedProofs.size >= 2 ? '0 4px 16px rgba(232,134,74,0.3)' : 'none',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                <path d="M7 21h10" />
                <path d="M12 3v18" />
                <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
              </svg>
              Proceed to Accusation
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AccusationPrompt — shared "who did it?" step ────────────────────────

function AccusationPrompt({ suspects, remainingSuspects, evidenceItems, eliminatedIds, accusedId, accusationCorrect, onAccuse, onBack }) {
  return (
    <div className="app-shell">
      <div className="card" style={{ maxWidth: 'min(700px, 95vw)', margin: '0 auto' }}>
        <button className="back-button" onClick={onBack} style={{ marginBottom: '0.8rem' }}>← Back to clues</button>

        <DetectiveMascot mood={accusationCorrect === false ? 'wrong' : 'thinking'}
          label={accusationCorrect === false ? 'Are you sure?' : 'Who did it?'} />

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>⚖️</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.3rem', fontFamily: 'var(--font-display)' }}>
            Make Your Accusation
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', margin: 0 }}>
            {evidenceItems.length} evidence piece{evidenceItems.length !== 1 ? 's' : ''} collected &middot; {eliminatedIds.size} suspect{eliminatedIds.size !== 1 ? 's' : ''} eliminated
          </p>
        </div>

        {/* EvidencePanel summary */}
        <EvidencePanel evidenceItems={evidenceItems} suspects={suspects} eliminatedIds={eliminatedIds} />

        {accusationCorrect === false && (
          <div style={{
            padding: '0.7rem 1rem', borderRadius: 10, marginBottom: '1rem',
            background: 'var(--clr-wrong-bg, rgba(224,90,74,0.12))', border: '1.5px solid var(--clr-wrong, #e05a4a)',
            fontSize: '0.88rem', color: 'var(--clr-wrong, #e05a4a)', fontWeight: 600, textAlign: 'center',
          }}>
            Are you sure? The evidence might point elsewhere. You can try again.
          </div>
        )}

        <div style={{ fontSize: '0.92rem', fontWeight: 700, textAlign: 'center', marginBottom: '1rem', color: 'var(--clr-text)' }}>
          Who committed the crime?
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {remainingSuspects.map((suspect) => (
            <button key={suspect.id}
              onClick={() => onAccuse(suspect.id)}
              aria-label={`Accuse ${suspect.name} of the crime`}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                padding: '1rem 1.2rem', borderRadius: 14,
                border: accusedId === suspect.id && accusationCorrect === false
                  ? '2px solid var(--clr-wrong, #e05a4a)'
                  : '2px solid var(--clr-border)',
                background: accusedId === suspect.id && accusationCorrect === false
                  ? 'var(--clr-wrong-bg, rgba(224,90,74,0.08))'
                  : 'var(--clr-surface)',
                cursor: 'pointer', minWidth: 120, transition: 'all 0.2s', color: 'var(--clr-text)',
              }}
            >
              <span style={{ fontSize: '2.5rem' }} aria-hidden="true">{suspect.appearance}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{suspect.name}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-soft)' }}>{suspect.role}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CluePathMap — winding checkpoint trail with check/question-mark SVGs ──
// Sequential: only the first unsolved circle is clickable; solved circles get
// a check SVG, locked ones a question-mark SVG with hidden content.

function CluePathMap({ stages, solvedCount, onSelectStage }) {
  const n = stages.length;
  const W = 340;
  const H = 200;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x = 26 + t * (W - 52);
    const y = H / 2 + Math.sin(t * Math.PI) * (H / 2 - 40);
    pts.push({ x, y });
  }
  const seg = (a, b) => {
    const dx = (b.x - a.x) * 0.35;
    return `C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
  };
  let dAll = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) dAll += ` ${seg(pts[i], pts[i + 1])}`;
  let dGreen = '';
  if (solvedCount >= 2) {
    dGreen = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < solvedCount - 1 && i < n - 1; i++) dGreen += ` ${seg(pts[i], pts[i + 1])}`;
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: W, height: H, margin: '0 auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
        <defs>
          <pattern id="mda-ledger-grid" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.1" fill="var(--clr-text-soft)" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#mda-ledger-grid)" opacity="0.3" />
        <path d={dAll} fill="none" stroke="var(--clr-border)" strokeWidth="2.5" strokeDasharray="7 6" strokeLinecap="round" />
        {dGreen && (
          <path d={dGreen} fill="none" stroke="#58cc02" strokeWidth="2.5" strokeDasharray="7 6" strokeLinecap="round" />
        )}
      </svg>
      {stages.map((stage, idx) => {
        const p = pts[idx];
        const isSolved = idx < solvedCount;
        const isCurrent = idx === solvedCount;
        const locked = idx > solvedCount;
        return (
          <div key={idx}
            style={{ position: 'absolute', left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%`, transform: 'translate(-50%, -50%)' }}
          >
            {/* Floating status badge above the circle */}
            <div aria-hidden="true"
              style={{
                position: 'absolute', bottom: 'calc(100% + 3px)', left: '50%', transform: 'translateX(-50%)',
                width: 24, height: 24, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isSolved ? '#58cc02' : 'var(--clr-surface)',
                border: isSolved ? '2px solid #46a302' : `2px solid ${isCurrent ? 'var(--clr-accent)' : 'var(--clr-border)'}`,
                color: isSolved ? '#fff' : isCurrent ? 'var(--clr-accent)' : 'var(--clr-text-soft)',
                boxShadow: isSolved ? '0 2px 6px rgba(70,163,2,0.35)' : '0 1px 3px rgba(0,0,0,0.08)',
                transition: 'background 0.2s, border-color 0.2s, color 0.2s',
              }}
            >
              {isSolved ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3.5" />
                </svg>
              )}
            </div>
            {/* Duolingo-style checkpoint node */}
            <button onClick={() => onSelectStage(idx)}
              disabled={locked}
              className={isCurrent ? 'mda-path-pulse' : undefined}
              aria-label={`Stage ${idx + 1}: ${isSolved ? 'solved' : locked ? 'locked' : 'ready'}`}
              style={{
                width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `3px solid ${isSolved ? '#46a302' : isCurrent ? 'var(--clr-accent)' : 'var(--clr-border)'}`,
                background: isSolved ? '#58cc02' : 'var(--clr-surface)',
                color: isSolved ? '#fff' : isCurrent ? 'var(--clr-accent)' : 'var(--clr-text-soft)',
                cursor: isCurrent ? 'pointer' : 'default',
                boxShadow: isSolved ? '0 0 0 4px rgba(88,204,2,0.16), 0 3px 8px rgba(0,0,0,0.12)' : isCurrent ? '0 0 0 4px var(--clr-accent-soft), 0 3px 8px rgba(0,0,0,0.12)' : '0 2px 6px rgba(0,0,0,0.08)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                fontSize: '1.05rem', fontWeight: 800,
              }}
            >
              {idx + 1}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── EnhancedCasePlay — non-linear clue solving with elimination ─────────

function EnhancedCasePlay({ story, onComplete, onBack, initialState }) {
  const [phase, setPhase] = useState(initialState?.phase || 'clue-grid'); // 'clue-grid' | 'solving' | 'elimination' | 'accusation' | 'done'
  const [solvedClues, setSolvedClues] = useState(new Set(initialState?.solvedClues || []));
  const [eliminatedIds, setEliminatedIds] = useState(new Set(initialState?.eliminatedIds || []));
  const [evidenceItems, setEvidenceItems] = useState(initialState?.evidenceItems || []);
  const [currentClueIdx, setCurrentClueIdx] = useState(initialState?.currentClueIdx ?? null);
  const [totalHintsUsed, setTotalHintsUsed] = useState(initialState?.totalHintsUsed || 0);
  const [eliminationMsg, setEliminationMsg] = useState(null); // { type: 'correct'|'wrong'|'skip', text: '' }
  const [pendingEvidence, setPendingEvidence] = useState(initialState?.pendingEvidence ?? null);
  const [selectedElimSuspect, setSelectedElimSuspect] = useState(null);
  const [reasonPhase, setReasonPhase] = useState(false);
  const [accusedId, setAccusedId] = useState(null);
  const [accusationCorrect, setAccusationCorrect] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [selectedProofs, setSelectedProofs] = useState(new Set());

  const { suspects, culprit, stages } = story;
  const remainingSuspects = suspects.filter(s => !eliminatedIds.has(s.id));

  const handleSolveClue = (clueIdx, hintsUsed) => {
    const stage = stages[clueIdx];
    const newSolved = new Set(solvedClues);
    newSolved.add(clueIdx);
    setSolvedClues(newSolved);
    setTotalHintsUsed(t => t + hintsUsed);

    if (stage.evidence) {
      setEvidenceItems(prev => [...prev, stage.evidence]);
      setPendingEvidence(stage.evidence);
      setPhase('elimination');
    } else {
      // No evidence — go back to grid
      setCurrentClueIdx(null);
      setPhase('clue-grid');
    }
  };

  const handleElimination = (selectedSuspectId) => {
    if (!pendingEvidence) return;
    setSelectedElimSuspect(selectedSuspectId);
    setReasonPhase(true);
  };

  const handleReasonSelect = (reason) => {
    if (!pendingEvidence || !selectedElimSuspect) return;
    if (reason.correct) {
      const newEliminated = new Set(eliminatedIds);
      newEliminated.add(selectedElimSuspect);
      setEliminatedIds(newEliminated);
      const suspect = suspects.find(s => s.id === selectedElimSuspect);
      setEliminationMsg({ type: 'correct', text: `${suspect.appearance} ${suspect.name} has been eliminated!` });
      playCorrectSound();
    } else {
      setEliminationMsg({ type: 'wrong', text: `That reasoning doesn't hold up, detective. Look more carefully at what the evidence actually tells you.` });
    }
    setReasonPhase(false);
    setSelectedElimSuspect(null);
  };

  const handleEliminationRetry = () => {
    setEliminationMsg(null);
    setSelectedElimSuspect(null);
    setReasonPhase(false);
  };

  const handleEliminationDone = () => {
    setPendingEvidence(null);
    setEliminationMsg(null);
    setCurrentClueIdx(null);
    setSelectedElimSuspect(null);
    setReasonPhase(false);
    setPhase('clue-grid');
  };

  const handleStartAccusation = () => {
    setPhase('evidence-summary');
    setSelectedProofs(new Set());
  };

  const handleProofToggle = (evidenceId) => {
    setSelectedProofs(prev => {
      const next = new Set(prev);
      if (next.has(evidenceId)) next.delete(evidenceId);
      else next.add(evidenceId);
      return next;
    });
  };

  const handleEvidenceSummaryDone = () => {
    if (selectedProofs.size < 2) return;
    setPhase('accusation');
    setAccusedId(null);
    setAccusationCorrect(null);
  };

  const handleAccuse = (suspectId) => {
    setAccusedId(suspectId);
    if (suspectId === culprit) {
      setAccusationCorrect(true);
      setPhase('done');
      setCompleted(true);
      onComplete(story.id, true, {
        totalHintsUsed,
        stars: totalHintsUsed === 0 ? 3 : totalHintsUsed <= 2 ? 2 : 1,
        evidence: evidenceItems.map(e => e.id),
        eliminated: [...eliminatedIds],
        accused: suspectId,
        correct: true,
      });
    } else {
      setAccusationCorrect(false);
    }
  };

  // Persist mid-case progress so it survives leaving the case or refreshing
  useEffect(() => {
    if (completed) return;
    if (solvedClues.size === 0 && eliminatedIds.size === 0 && evidenceItems.length === 0) return;
    saveInProgressCase(story.id, {
      currentStage: stages.length,
      totalStages: stages.length,
      topic: story.topic,
      phase,
      solvedClues: [...solvedClues],
      eliminatedIds: [...eliminatedIds],
      evidenceItems,
      currentClueIdx,
      pendingEvidence,
      totalHintsUsed,
      savedCase: story,
    });
  }, [phase, solvedClues, eliminatedIds, evidenceItems, currentClueIdx, pendingEvidence, totalHintsUsed, completed, story, stages.length]);

  // ── Render: Completion screen ──────────────────────────────────────────
  if (completed) {
    const starCount = totalHintsUsed === 0 ? 3 : totalHintsUsed <= 2 ? 2 : 1;
    const xpMultiplier = starCount === 3 ? 1 : starCount === 2 ? 0.7 : 0.4;
    const xpEarned = Math.round(story.xpReward * 1.5 * xpMultiplier); // 1.5x bonus for enhanced
    const culpritSuspect = suspects.find(s => s.id === culprit);

    return (
      <CaseCompletionScreen
        onBack={onBack}
        starCount={starCount}
        xpEarned={xpEarned}
        xpLabel="XP Earned (1.5x)"
        culpritName={culpritSuspect?.name}
        culpritAppearance={culpritSuspect?.appearance}
      />
    );
  }

  // ── Render: Elimination prompt ──────────────────────────────────────────
  if (phase === 'elimination' && pendingEvidence) {
    return (
      <div className="app-shell">
        <div className="card" style={{ maxWidth: 'min(600px, 95vw)', margin: '0 auto' }}>
          <button className="back-button" onClick={() => { setPendingEvidence(null); setEliminationMsg(null); setPhase('clue-grid'); setCurrentClueIdx(null); }} style={{ marginBottom: '0.8rem' }}>← Back to clues</button>

          <DetectiveMascot mood={eliminationMsg ? (eliminationMsg.type === 'correct' ? 'correct' : 'wrong') : 'thinking'}
            label={eliminationMsg ? (eliminationMsg.type === 'correct' ? 'Nice deduction!' : 'Think again') : 'Who does this eliminate?'} />

          <div style={{
            background: 'rgba(255, 152, 0, 0.08)', border: '1.5px solid rgba(255, 152, 0, 0.25)',
            borderRadius: 12, padding: '1rem 1.2rem', marginBottom: '1.2rem', fontSize: '0.88rem', lineHeight: 1.6,
          }}>
            <div style={{ fontWeight: 700, color: '#ff9800', fontSize: '0.72rem', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
              📓 Evidence Collected
            </div>
            <div style={{ marginTop: '0.3rem' }}>
              <HighlightedEvidenceText text={pendingEvidence.text} suspects={suspects} eliminatedIds={pendingEvidence.eliminates} />
            </div>
          </div>

          {!eliminationMsg && !reasonPhase ? (
            <>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, textAlign: 'center', marginBottom: '1rem', color: 'var(--clr-text)' }}>
                Based on this evidence, which suspect can you eliminate?
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {remainingSuspects.map((suspect, idx) => (
                  <button key={suspect.id}
                    onClick={() => handleElimination(suspect.id)}
                    className={`mda-delay-${(idx % 4) + 1}`}
                    aria-label={`Eliminate ${suspect.name}`}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                      padding: '0.8rem 1rem', borderRadius: 12,
                      border: '1.5px solid var(--clr-border)', background: 'var(--clr-surface)',
                      cursor: 'pointer', minWidth: 100, transition: 'all 0.2s', color: 'var(--clr-text)',
                    }}
                  >
                    <span style={{ fontSize: '2rem' }} aria-hidden="true">{suspect.appearance}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{suspect.name}</span>
                  </button>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
                <button onClick={handleEliminationDone}
                  style={{
                    background: 'none', border: 'none', color: 'var(--clr-text-soft)',
                    fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.6,
                  }}
                >
                  Skip elimination for this clue
                </button>
              </div>
            </>
          ) : reasonPhase && selectedElimSuspect ? (
            (() => {
              const reasons = getEliminationReasons(pendingEvidence, suspects.find(s => s.id === selectedElimSuspect), suspects);
              return (
                <>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.6rem', color: 'var(--clr-text)' }}>
                    Why can't it be {suspects.find(s => s.id === selectedElimSuspect)?.name}?
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-soft)', textAlign: 'center', marginBottom: '1rem' }}>
                    Select the reason this evidence rules them out:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {reasons.map((reason, idx) => (
                      <button key={idx}
                        onClick={() => handleReasonSelect(reason)}
                        className={`mda-delay-${(idx % 4) + 1}`}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem',
                          padding: '0.7rem 1rem', borderRadius: 10, textAlign: 'left',
                          border: '1.5px solid var(--clr-border)', background: 'var(--clr-surface)',
                          cursor: 'pointer', transition: 'all 0.2s', color: 'var(--clr-text)', width: '100%',
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{reason.label}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', lineHeight: 1.4 }}>{reason.detail}</span>
                      </button>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <button onClick={() => { setReasonPhase(false); setSelectedElimSuspect(null); }}
                      style={{
                        background: 'none', border: 'none', color: 'var(--clr-text-soft)',
                        fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.6,
                      }}
                    >
                      ← Back to suspect selection
                    </button>
                  </div>
                </>
              );
            })()
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                padding: '0.8rem 1.2rem', borderRadius: 12, marginBottom: '1rem',
                background: eliminationMsg.type === 'correct' ? 'var(--clr-correct-bg, rgba(76,175,80,0.12))' : 'var(--clr-wrong-bg, rgba(224,90,74,0.12))',
                border: eliminationMsg.type === 'correct' ? '2px solid var(--clr-correct, #4caf50)' : '2px solid var(--clr-wrong, #e05a4a)',
                fontSize: '0.95rem', fontWeight: 700,
                color: eliminationMsg.type === 'correct' ? 'var(--clr-correct, #4caf50)' : 'var(--clr-wrong, #e05a4a)',
              }}>
                {eliminationMsg.type === 'correct' ? '✓ ' : '? '}{eliminationMsg.text}
              </div>
              {eliminationMsg.type === 'wrong' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                    <button onClick={handleEliminationRetry}
                      style={{
                        padding: '0.5rem 1.2rem', borderRadius: 10,
                        border: '1.5px solid var(--clr-accent)', background: 'var(--clr-accent-soft)',
                        color: 'var(--clr-accent)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                      }}
                    >
                      🔄 Try another suspect
                    </button>
                    <button onClick={handleEliminationDone}
                      style={{
                        padding: '0.5rem 1.2rem', borderRadius: 10,
                        border: '1.5px solid var(--clr-border)', background: 'var(--clr-surface)',
                        color: 'var(--clr-text-soft)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                      }}
                    >
                      Skip this elimination
                    </button>
                  </div>
                </div>
              )}
              <button onClick={handleEliminationDone}
                style={{
                  padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, var(--clr-accent), #d4733e)',
                  color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                Continue Investigation
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Render: Evidence Summary (before accusation) ──────────────────────
  if (phase === 'evidence-summary') {
    return (
      <EvidenceSummaryPrompt
        evidenceItems={evidenceItems}
        selectedProofs={selectedProofs}
        onToggleProof={handleProofToggle}
        onDone={handleEvidenceSummaryDone}
        onBack={() => setPhase('clue-grid')}
      />
    );
  }

  // ── Render: Final Accusation ────────────────────────────────────────────
  if (phase === 'accusation') {
    return (
      <AccusationPrompt
        suspects={suspects}
        remainingSuspects={remainingSuspects}
        evidenceItems={evidenceItems}
        eliminatedIds={eliminatedIds}
        accusedId={accusedId}
        accusationCorrect={accusationCorrect}
        onAccuse={handleAccuse}
        onBack={() => setPhase('clue-grid')}
      />
    );
  }

  // ── Render: Solving a clue (reuse DetectiveCaseView pattern) ────────────
  if (phase === 'solving' && currentClueIdx !== null) {
    return (
      <EnhancedClueSolve
        story={story}
        clueIdx={currentClueIdx}
        onSolved={(hintsUsed) => handleSolveClue(currentClueIdx, hintsUsed)}
        onBack={() => { setCurrentClueIdx(null); setPhase('clue-grid'); }}
      />
    );
  }

  // ── Render: Clue Grid (default) ─────────────────────────────────────────
  const allSolved = solvedClues.size === stages.length;
  const canAccuse = allSolved || (evidenceItems.length > 0 && remainingSuspects.length <= 2);

  return (
    <div className="app-shell">
      <div className="card" style={{ maxWidth: 'min(650px, 95vw)', margin: '0 auto' }}>
        <button className="back-button" onClick={() => {
          if (!completed && (solvedClues.size > 0 || eliminatedIds.size > 0 || evidenceItems.length > 0)) {
            saveInProgressCase(story.id, {
              currentStage: stages.length,
              totalStages: stages.length,
              topic: story.topic,
              phase,
              solvedClues: [...solvedClues],
              eliminatedIds: [...eliminatedIds],
              evidenceItems,
              currentClueIdx,
              pendingEvidence,
              totalHintsUsed,
              savedCase: story,
            });
          }
          onBack();
        }} style={{ marginBottom: '0.8rem' }}>← Cases</button>

        <DetectiveMascot mood={allSolved ? 'solved' : 'neutral'}
          label={allSolved ? 'All clues solved!' : `${solvedClues.size}/${stages.length} clues solved`} />

        {/* Evidence panel */}
        <EvidencePanel evidenceItems={evidenceItems} suspects={suspects} eliminatedIds={eliminatedIds} />

        {/* Clue grid */}
        <div style={{ display: 'grid', gridTemplateColumns: stages.length > 3 ? '1fr 1fr' : '1fr', gap: '0.6rem', marginBottom: '1rem' }}>
          {stages.map((stage, idx) => {
            const isSolved = solvedClues.has(idx);
            return (
              <button key={idx}
                onClick={() => { if (!isSolved) { setCurrentClueIdx(idx); setPhase('solving'); } }}
                disabled={isSolved}
                className={`mda-delay-${(idx % 4) + 1}`}
                aria-label={isSolved ? `Clue ${idx + 1}: solved` : `Clue ${idx + 1}: ${stage.narrative?.slice(0, 50)}...`}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.7rem',
                  padding: '0.9rem 1rem', borderRadius: 12, textAlign: 'left',
                  border: isSolved ? '1.5px solid rgba(76,175,80,0.3)' : '1.5px solid var(--clr-border)',
                  background: isSolved ? 'rgba(76,175,80,0.06)' : 'var(--clr-surface)',
                  cursor: isSolved ? 'default' : 'pointer',
                  opacity: isSolved ? 0.8 : 1,
                  transition: 'all 0.2s', color: 'var(--clr-text)', width: '100%',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isSolved ? '#4caf50' : 'var(--clr-accent-soft)',
                  color: isSolved ? '#fff' : 'var(--clr-accent)',
                  fontWeight: 800, fontSize: '0.85rem',
                }}>
                  {isSolved ? '✓' : idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.15rem', lineHeight: 1.3 }}>
                    {stage.narrative?.slice(0, 80)}{stage.narrative?.length > 80 ? '...' : ''}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-soft)' }}>
                    {isSolved ? '✓ Solved — evidence collected' : '🔍 Tap to investigate'}
                  </div>
                </div>
                {!isSolved && <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>→</span>}
              </button>
            );
          })}
        </div>

        {/* Accusation button */}
        {canAccuse && !allSolved && (
          <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
            <button onClick={handleStartAccusation}
              style={{
                padding: '0.6rem 1.5rem', borderRadius: 10, border: '1.5px dashed var(--clr-accent)',
                background: 'var(--clr-accent-soft)', color: 'var(--clr-accent)',
                fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
              }}
            >
              ⚖️ Ready to accuse? ({remainingSuspects.length} suspect{remainingSuspects.length !== 1 ? 's' : ''} remain)
            </button>
          </div>
        )}
        {allSolved && (
          <div style={{ textAlign: 'center' }}>
            <button onClick={handleStartAccusation}
              className="mda-btn-press"
              style={{
                padding: '0.8rem 2rem', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, var(--clr-accent), #d4733e)',
                color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(232,134,74,0.3)',
              }}
            >
              ⚖️ All clues solved! Make your accusation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EnhancedClueSolve — individual clue solving within enhanced case ────

function EnhancedClueSolve({ story, clueIdx, onSolved, onBack, contextHidden = false, stageLabel = 'Clue' }) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [skipMessage, setSkipMessage] = useState(null);
  const [motivationIdx, setMotivationIdx] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const wrongMotivations = ['Close, detective! Give it another go.', 'Not quite — recheck the numbers!', 'Almost there! Try once more.', "Keep at it, detective! You're getting warmer.", "Don't give up! Look at the clues again."];
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const stage = story.stages[clueIdx];
  if (!stage) return null;

  const hints = stage.hints || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (revealed || !answer.trim()) return;
    const correct = checkDetectiveAnswer(stage.answer, answer);
    setRevealed(true);
    setFeedback({ correct });
    if (!correct) setMotivationIdx(i => (i + 1) % wrongMotivations.length);
  };

  const handleHint = () => {
    if (hintLevel < hints.length) {
      setHintLevel(h => h + 1);
      setHintsUsed(t => t + 1);
    }
  };

  const handleNext = () => {
    if (!feedback) return;
    if (feedback.correct) {
      onSolved(hintsUsed);
    } else {
      setAnswer('');
      setFeedback(null);
      setRevealed(false);
      setHintLevel(0);
      setHintsUsed(0);
    }
  };

  return (
    <div className="app-shell">
      <div className="card" style={{ maxWidth: 'min(600px, 95vw)', margin: '0 auto' }}>
        <button className="back-button" onClick={onBack} style={{ marginBottom: '0.8rem' }}>← Back to clues</button>

        <DetectiveMascot
          mood={revealed ? (feedback?.correct ? 'correct' : 'wrong') : hintLevel > 0 ? 'thinking' : 'neutral'}
          label={revealed ? (feedback?.correct ? 'Evidence found!' : 'Try again') : 'Investigate carefully'}
        />

        {/* Clue badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{
            padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
            background: 'var(--clr-accent-soft)', color: 'var(--clr-accent)',
          }}>
            {stageLabel} {clueIdx + 1}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', fontWeight: 600 }}>
            of {story.stages.length}
          </span>
        </div>

        {/* Narrative — hidden behind a toggle in path mode so the question is front and centre */}
        {contextHidden ? (
          <div style={{ marginBottom: '1.2rem' }}>
            <button onClick={() => setNotesOpen(o => !o)}
              style={{
                padding: '0.45rem 1rem', borderRadius: 8, border: '1.5px dashed var(--clr-border)',
                background: 'transparent', color: 'var(--clr-text-soft)', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              }}
            >
              📜 {notesOpen ? 'Hide investigation notes' : 'Read investigation notes'}
            </button>
            {notesOpen && (
              <div style={{
                marginTop: '0.5rem',
                background: 'var(--clr-surface)', borderRadius: 12, padding: '1rem 1.2rem',
                border: '1.5px solid var(--clr-border)',
                fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--clr-text)',
              }}>
                {stage.narrative}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: 'var(--clr-surface)', borderRadius: 12, padding: '1rem 1.2rem',
            marginBottom: '1.2rem', border: '1.5px solid var(--clr-border)',
            fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--clr-text)',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--clr-text-soft)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📜 Investigation Notes
            </div>
            {stage.narrative}
          </div>
        )}

        {/* Question */}
        <div className="mda-question-card" style={{
          textAlign: 'center', padding: '1rem', marginBottom: '1rem',
          borderRadius: 12, background: 'var(--clr-bg)', border: '1.5px solid var(--clr-accent)',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--clr-accent)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🔍 Solve This
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4 }}>
            {stage.question}
          </div>
        </div>

        {/* Hints */}
        {!revealed && hints.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <button onClick={handleHint}
              disabled={hintLevel >= hints.length}
              aria-label={hintLevel >= hints.length ? 'No more hints' : `Need a hint? ${hintLevel + 1} of ${hints.length} left`}
              title={hintLevel >= hints.length ? 'No more hints available' : `Need a hint? ${hintLevel + 1} of ${hints.length} left`}
              style={{
                width: 42, height: 42, borderRadius: '50%', border: '2px solid',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', cursor: hintLevel >= hints.length ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                ...(hintLevel >= hints.length
                  ? { borderColor: 'var(--clr-border)', background: 'transparent', opacity: 0.45, color: 'var(--clr-text-soft)' }
                  : { borderColor: '#ffc107', background: 'rgba(255, 193, 7, 0.14)', color: '#ffc107', boxShadow: '0 0 10px rgba(255, 193, 7, 0.45)' }),
              }}
            >
              <span style={{ display: 'inline-flex', filter: hintLevel >= hints.length ? 'grayscale(1) brightness(0.65)' : 'none' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                </svg>
              </span>
            </button>
            {hintLevel > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {hints.slice(0, hintLevel).map((h, i) => (
                  <div key={i} className="mda-hint-reveal" style={{
                    padding: '0.5rem 0.8rem', borderRadius: 8,
                    background: 'rgba(255, 152, 0, 0.08)', border: '1px solid rgba(255, 152, 0, 0.2)',
                    fontSize: '0.85rem', color: 'var(--clr-text)', lineHeight: 1.4,
                  }}>
                    <span style={{ fontWeight: 700, color: '#ff9800' }}>Hint {i + 1}:</span> {h}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Answer input / Skip message / Feedback */}
        {skipMessage ? (
          <div style={{
            textAlign: 'center', padding: '1.2rem', borderRadius: 12, marginTop: '0.8rem',
            background: 'rgba(255, 152, 0, 0.08)', border: '2px solid rgba(255, 152, 0, 0.25)',
          }}>
            <DetectiveMascot mood="thinking" label="Every clue matters, Chief!" />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ff9800', marginBottom: '0.4rem' }}>
              Chief, this clue can be useful!
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)', marginBottom: '0.8rem', lineHeight: 1.5 }}>
              Skipping a clue means you won't collect its evidence. Come back to it later if you need more proof.
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button onClick={() => setSkipMessage(false)}
                style={{
                  padding: '0.5rem 1.2rem', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, var(--clr-accent), #d4733e)',
                  color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  I'll keep investigating
                </span>
              </button>
              <button onClick={() => onSolved(hintsUsed)}
                style={{
                  padding: '0.5rem 1.2rem', borderRadius: 8,
                  border: '1.5px solid var(--clr-border)', background: 'var(--clr-surface)',
                  color: 'var(--clr-text-soft)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                }}
              >
                Skip anyway
              </button>
            </div>
          </div>
        ) : !revealed ? (
          <>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <input ref={inputRef} type="text" value={answer} onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer..."
                style={{
                  flex: 1, maxWidth: 200, padding: '0.7rem 1rem', borderRadius: 10,
                  border: '2px solid var(--clr-border)', background: 'var(--clr-input)',
                  color: 'var(--clr-text)', fontSize: '1.1rem', textAlign: 'center', fontWeight: 600, outline: 'none',
                }}
              />
              <button type="submit" disabled={!answer.trim()}
                style={{
                  padding: '0.7rem 1.5rem', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, var(--clr-accent), #d4733e)',
                  color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: answer.trim() ? 'pointer' : 'not-allowed',
                  opacity: answer.trim() ? 1 : 0.5,
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  Submit Evidence
                </span>
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button onClick={() => setSkipMessage(true)}
                style={{ background: 'none', border: 'none', color: 'var(--clr-text-soft)', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.6 }}
              >
                Skip this question
              </button>
            </div>
          </>
        ) : (
          <div className={feedback?.correct ? 'mda-feedback-correct' : 'mda-feedback-wrong'} style={{
            textAlign: 'center', padding: '1rem', borderRadius: 12,
            background: feedback?.correct ? 'var(--clr-correct-bg, rgba(76,175,80,0.12))' : 'var(--clr-wrong-bg, rgba(224,90,74,0.12))',
            border: feedback?.correct ? '2px solid var(--clr-correct, #4caf50)' : '2px solid var(--clr-wrong, #e05a4a)',
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem',
              color: feedback?.correct ? 'var(--clr-correct, #4caf50)' : 'var(--clr-wrong, #e05a4a)' }}>
              {feedback?.correct ? '✓ Correct!' : '🔍 ' + wrongMotivations[motivationIdx]}
            </div>
            <button onClick={handleNext}
              style={{
                marginTop: '0.5rem', padding: '0.5rem 1.5rem', borderRadius: 8,
                border: 'none', background: feedback?.correct ? '#4caf50' : '#e05a4a',
                color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
              }}
            >
              {feedback?.correct ? 'Collect Evidence' : 'Try Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PathCasePlay — sequential circle-path case (case-enhanced-16 style) ──
// The player walks a vertical path of stages. Solving each equation reveals a
// clue (letter / characteristic), then the player answers "who does this clue
// eliminate?" ("No one" is always accepted — correct on ambiguous clues,
// a free skip otherwise). Cumulative eliminations narrow to the culprit.

function PathCasePlay({ story, onComplete, onBack, initialState }) {
  const [solvedClues, setSolvedClues] = useState(new Set(initialState?.solvedClues || []));
  const [phase, setPhase] = useState(initialState?.phase || 'path'); // 'path' | 'solving' | 'clue-reveal' | 'elimination' | 'evidence-summary' | 'accusation' | 'done'
  const [currentIdx, setCurrentIdx] = useState(() => {
    if (initialState?.currentClueIdx != null && initialState.currentClueIdx !== 'null') return initialState.currentClueIdx;
    for (let i = 0; i < story.stages.length; i++) {
      if (!(initialState?.solvedClues || []).includes(i)) return i;
    }
    return story.stages.length;
  });
  const [eliminatedIds, setEliminatedIds] = useState(new Set(initialState?.eliminatedIds || []));
  const [evidenceItems, setEvidenceItems] = useState(initialState?.evidenceItems || []);
  const [totalHintsUsed, setTotalHintsUsed] = useState(initialState?.totalHintsUsed || 0);
  const [lastEvidence, setLastEvidence] = useState(initialState?.pendingEvidence ?? null); // { stageIdx, clue, evidence }
  const [eliminationMsg, setEliminationMsg] = useState(null); // { type: 'correct'|'wrong'|'skip', text }
  const [selectedElimSuspect, setSelectedElimSuspect] = useState(null);
  const [reasonPhase, setReasonPhase] = useState(false);
  const [accusedId, setAccusedId] = useState(null);
  const [accusationCorrect, setAccusationCorrect] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [selectedProofs, setSelectedProofs] = useState(new Set());

  const { suspects, culprit, stages } = story;
  const remainingSuspects = suspects.filter(s => !eliminatedIds.has(s.id));
  const solvedCount = solvedClues.size;
  const allSolved = solvedCount === stages.length;

  const handleStartStage = (idx) => {
    if (solvedClues.has(idx)) return;
    setCurrentIdx(idx);
    setPhase('solving');
  };

  const handleStageSolved = (idx, hintsUsed) => {
    const stage = stages[idx];
    setTotalHintsUsed(t => t + hintsUsed);
    setSolvedClues(prev => new Set(prev).add(idx));
    const ev = stage.evidence;
    if (ev) {
      setEvidenceItems(prev => [...prev, ev]);
      setLastEvidence({ stageIdx: idx, clue: story.clueChain?.[idx] ?? stage.clue ?? null, evidence: ev });
      setPhase('clue-reveal');
    } else {
      setPhase('path');
    }
  };

  const handleElimination = (suspectId) => {
    setSelectedElimSuspect(suspectId);
    setReasonPhase(true);
  };

  const handleReasonSelect = (reason) => {
    if (!lastEvidence || !selectedElimSuspect) return;
    if (reason.correct) {
      const newEliminated = new Set(eliminatedIds);
      newEliminated.add(selectedElimSuspect);
      setEliminatedIds(newEliminated);
      const suspect = suspects.find(s => s.id === selectedElimSuspect);
      setEliminationMsg({ type: 'correct', text: `${suspect.appearance} ${suspect.name} has been eliminated!` });
      playCorrectSound();
    } else {
      setEliminationMsg({ type: 'wrong', text: `That reasoning doesn't hold up, detective. Look more carefully at what the clue actually tells you.` });
    }
    setReasonPhase(false);
    setSelectedElimSuspect(null);
  };

  const handleNoOne = () => {
    if (!lastEvidence) return;
    const eliminable = getClueEliminableSuspects(lastEvidence.clue, suspects) || [];
    setEliminationMsg({
      type: eliminable.length === 0 ? 'correct' : 'skip',
      text: eliminable.length === 0
        ? "Correct! This clue doesn't rule anyone out."
        : 'Noted — no elimination this time. Keep this clue in your notebook.',
    });
  };

  const handleEliminationRetry = () => {
    setEliminationMsg(null);
    setSelectedElimSuspect(null);
    setReasonPhase(false);
  };

  const handleEliminationContinue = () => {
    const nextIdx = solvedClues.size;
    setLastEvidence(null);
    setEliminationMsg(null);
    setSelectedElimSuspect(null);
    setReasonPhase(false);
    setCurrentIdx(nextIdx);
    setPhase('path');
  };

  const handleStartAccusation = () => {
    setPhase('evidence-summary');
    setSelectedProofs(new Set());
  };

  const handleProofToggle = (evidenceId) => {
    setSelectedProofs(prev => {
      const next = new Set(prev);
      if (next.has(evidenceId)) next.delete(evidenceId);
      else next.add(evidenceId);
      return next;
    });
  };

  const handleEvidenceSummaryDone = () => {
    if (selectedProofs.size < 2) return;
    setPhase('accusation');
    setAccusedId(null);
    setAccusationCorrect(null);
  };

  const handleAccuse = (suspectId) => {
    setAccusedId(suspectId);
    if (suspectId === culprit) {
      setAccusationCorrect(true);
      setPhase('done');
      setCompleted(true);
      onComplete(story.id, true, {
        totalHintsUsed,
        stars: totalHintsUsed === 0 ? 3 : totalHintsUsed <= 2 ? 2 : 1,
        evidence: evidenceItems.map(e => e.id),
        eliminated: [...eliminatedIds],
        accused: suspectId,
        correct: true,
      });
    } else {
      setAccusationCorrect(false);
    }
  };

  // Persist mid-case progress
  useEffect(() => {
    if (completed) return;
    if (solvedClues.size === 0 && eliminatedIds.size === 0 && evidenceItems.length === 0) return;
    saveInProgressCase(story.id, {
      currentStage: stages.length,
      totalStages: stages.length,
      topic: story.topic,
      phase,
      solvedClues: [...solvedClues],
      eliminatedIds: [...eliminatedIds],
      evidenceItems,
      currentClueIdx: phase === 'solving' ? currentIdx : solvedClues.size,
      pendingEvidence: lastEvidence,
      totalHintsUsed,
      savedCase: story,
    });
  }, [phase, solvedClues, eliminatedIds, evidenceItems, currentIdx, lastEvidence, totalHintsUsed, completed, story, stages.length]);

  // ── Render: Completion ────────────────────────────────────────────────
  if (completed) {
    const starCount = totalHintsUsed === 0 ? 3 : totalHintsUsed <= 2 ? 2 : 1;
    const xpMultiplier = starCount === 3 ? 1 : starCount === 2 ? 0.7 : 0.4;
    const xpEarned = Math.round(story.xpReward * 1.5 * xpMultiplier);
    const culpritSuspect = suspects.find(s => s.id === culprit);
    return (
      <CaseCompletionScreen
        onBack={onBack}
        starCount={starCount}
        xpEarned={xpEarned}
        xpLabel="XP Earned (1.5x)"
        culpritName={culpritSuspect?.name}
        culpritAppearance={culpritSuspect?.appearance}
      />
    );
  }

  // ── Render: Solving a stage ───────────────────────────────────────────
  if (phase === 'solving') {
    return (
      <EnhancedClueSolve
        story={story}
        clueIdx={currentIdx}
        onSolved={(hintsUsed) => handleStageSolved(currentIdx, hintsUsed)}
        onBack={() => setPhase('path')}
        contextHidden
        stageLabel="Stage"
      />
    );
  }

  // ── Render: Clue reveal ───────────────────────────────────────────────
  if (phase === 'clue-reveal' && lastEvidence) {
    return (
      <div className="app-shell">
        <div className="card" style={{ maxWidth: 'min(560px, 95vw)', margin: '0 auto', textAlign: 'center' }}>
          <DetectiveMascot mood="hint" label="Clue found!" />
          <div style={{
            background: 'rgba(255, 152, 0, 0.08)', border: '1.5px solid rgba(255, 152, 0, 0.3)',
            borderRadius: 14, padding: '1.4rem 1.2rem', marginBottom: '1.2rem',
          }}>
            <div style={{ fontWeight: 700, color: '#ff9800', fontSize: '0.72rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              🔍 New Clue — Evidence #{evidenceItems.length}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.6, color: 'var(--clr-text)' }}>
              {formatClueText(lastEvidence.clue)}
            </div>
          </div>
          <button onClick={() => setPhase('elimination')}
            className="mda-btn-press"
            style={{
              padding: '0.8rem 2rem', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, var(--clr-accent), #d4733e)',
              color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(232,134,74,0.3)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 21a8 8 0 0 1 13.292-6" />
                <circle cx="10" cy="8" r="5" />
                <path d="m22 22-3-3" />
              </svg>
              Who does this eliminate?
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Elimination ───────────────────────────────────────────────
  if (phase === 'elimination' && lastEvidence) {
    return (
      <div className="app-shell">
        <div className="card" style={{ maxWidth: 'min(600px, 95vw)', margin: '0 auto' }}>
          <button className="back-button" onClick={() => setPhase('path')} style={{ marginBottom: '0.8rem' }}>← Back to path</button>

          <DetectiveMascot mood={eliminationMsg ? (eliminationMsg.type === 'correct' ? 'correct' : eliminationMsg.type === 'skip' ? 'thinking' : 'wrong') : 'thinking'}
            label={eliminationMsg ? (eliminationMsg.type === 'correct' ? 'Nice deduction!' : eliminationMsg.type === 'skip' ? 'Moving on' : 'Think again') : 'Who does this eliminate?'} />

          <div style={{
            background: 'rgba(255, 152, 0, 0.08)', border: '1.5px solid rgba(255, 152, 0, 0.25)',
            borderRadius: 12, padding: '1rem 1.2rem', marginBottom: '1.2rem', fontSize: '0.92rem', lineHeight: 1.6,
            textAlign: 'center', color: 'var(--clr-text)',
          }}>
            <div style={{ fontWeight: 700, color: '#ff9800', fontSize: '0.72rem', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
              🔍 Clue #{evidenceItems.length}
            </div>
            {formatClueText(lastEvidence.clue)}
          </div>

          {!eliminationMsg && !reasonPhase ? (
            <>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {remainingSuspects.map((suspect) => (
                  <button key={suspect.id}
                    onClick={() => handleElimination(suspect.id)}
                    aria-label={`Eliminate ${suspect.name}`}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                      padding: '0.8rem 1rem', borderRadius: 12,
                      border: '1.5px solid var(--clr-border)', background: 'var(--clr-surface)',
                      cursor: 'pointer', minWidth: 100, transition: 'all 0.2s', color: 'var(--clr-text)',
                    }}
                  >
                    <span style={{ fontSize: '2rem' }} aria-hidden="true">{suspect.appearance}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{suspect.name}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--clr-text-soft)' }}>{suspect.role}</span>
                  </button>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
                <button onClick={handleNoOne}
                  style={{
                    background: 'none', border: '1.5px dashed var(--clr-border)', borderRadius: 999,
                    color: 'var(--clr-text-soft)', fontSize: '0.78rem', cursor: 'pointer', padding: '6px 16px',
                    fontWeight: 600,
                  }}
                >
                  Skip
                </button>
              </div>
            </>
          ) : reasonPhase && selectedElimSuspect ? (
            (() => {
              const reasons = getClueEliminationReasons(lastEvidence.clue, suspects.find(s => s.id === selectedElimSuspect), suspects);
              return (
                <>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.6rem', color: 'var(--clr-text)' }}>
                    Why can't it be {suspects.find(s => s.id === selectedElimSuspect)?.name}?
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-soft)', textAlign: 'center', marginBottom: '1rem' }}>
                    Select the reason this clue rules them out:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {reasons.map((reason, idx) => (
                      <button key={idx}
                        onClick={() => handleReasonSelect(reason)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem',
                          padding: '0.7rem 1rem', borderRadius: 10, textAlign: 'left',
                          border: '1.5px solid var(--clr-border)', background: 'var(--clr-surface)',
                          cursor: 'pointer', transition: 'all 0.2s', color: 'var(--clr-text)', width: '100%',
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{reason.label}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', lineHeight: 1.4 }}>{reason.detail}</span>
                      </button>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <button onClick={() => { setReasonPhase(false); setSelectedElimSuspect(null); }}
                      style={{
                        background: 'none', border: 'none', color: 'var(--clr-text-soft)',
                        fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.6,
                      }}
                    >
                      ← Back to suspect selection
                    </button>
                  </div>
                </>
              );
            })()
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                padding: '0.8rem 1.2rem', borderRadius: 12, marginBottom: '1rem',
                background: eliminationMsg.type === 'correct' ? 'var(--clr-correct-bg, rgba(76,175,80,0.12))'
                  : eliminationMsg.type === 'skip' ? 'rgba(255, 152, 0, 0.1)'
                  : 'var(--clr-wrong-bg, rgba(224,90,74,0.12))',
                border: eliminationMsg.type === 'correct' ? '2px solid var(--clr-correct, #4caf50)'
                  : eliminationMsg.type === 'skip' ? '2px solid #ff9800'
                  : '2px solid var(--clr-wrong, #e05a4a)',
                fontSize: '0.95rem', fontWeight: 700,
                color: eliminationMsg.type === 'correct' ? 'var(--clr-correct, #4caf50)'
                  : eliminationMsg.type === 'skip' ? '#ff9800'
                  : 'var(--clr-wrong, #e05a4a)',
              }}>
                {eliminationMsg.type === 'correct' ? '✓ ' : eliminationMsg.type === 'skip' ? 'ℹ️ ' : '? '}{eliminationMsg.text}
              </div>
              {eliminationMsg.type === 'wrong' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                    <button onClick={handleEliminationRetry}
                      style={{
                        padding: '0.5rem 1.2rem', borderRadius: 10,
                        border: '1.5px solid var(--clr-accent)', background: 'var(--clr-accent-soft)',
                        color: 'var(--clr-accent)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                          <path d="M21 3v5h-5" />
                          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                          <path d="M8 16H3v5" />
                        </svg>
                        Try another suspect
                      </span>
                    </button>
                    <button onClick={handleNoOne}
                      style={{
                        padding: '0.5rem 1.2rem', borderRadius: 10,
                        border: '1.5px solid var(--clr-border)', background: 'var(--clr-surface)',
                        color: 'var(--clr-text-soft)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                      }}
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}
              <button onClick={handleEliminationContinue}
                className="mda-btn-press"
                style={{
                  padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, var(--clr-accent), #d4733e)',
                  color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                Continue Down the Path
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Render: Evidence Summary (before accusation) ──────────────────────
  if (phase === 'evidence-summary') {
    return (
      <EvidenceSummaryPrompt
        evidenceItems={evidenceItems}
        selectedProofs={selectedProofs}
        onToggleProof={handleProofToggle}
        onDone={handleEvidenceSummaryDone}
        onBack={() => setPhase('path')}
      />
    );
  }

  // ── Render: Final Accusation ────────────────────────────────────────────
  if (phase === 'accusation') {
    return (
      <AccusationPrompt
        suspects={suspects}
        remainingSuspects={remainingSuspects}
        evidenceItems={evidenceItems}
        eliminatedIds={eliminatedIds}
        accusedId={accusedId}
        accusationCorrect={accusationCorrect}
        onAccuse={handleAccuse}
        onBack={() => setPhase('path')}
      />
    );
  }

  // ── Render: Path map (default) ─────────────────────────────────────────
  return (
    <div className="app-shell">
      <div className="card" style={{ maxWidth: 'min(650px, 95vw)', margin: '0 auto' }}>
        <button className="back-button" onClick={() => {
          if (solvedClues.size > 0 || eliminatedIds.size > 0 || evidenceItems.length > 0) {
            saveInProgressCase(story.id, {
              currentStage: stages.length,
              totalStages: stages.length,
              topic: story.topic,
              phase,
              solvedClues: [...solvedClues],
              eliminatedIds: [...eliminatedIds],
              evidenceItems,
              currentClueIdx: phase === 'solving' ? currentIdx : solvedClues.size,
              pendingEvidence: lastEvidence,
              totalHintsUsed,
              savedCase: story,
            });
          }
          onBack();
        }} style={{ marginBottom: '0.8rem' }}>← Cases</button>

        <DetectiveMascot mood={allSolved ? 'solved' : 'neutral'}
          label={allSolved ? 'All clues found!' : `${solvedCount}/${stages.length} stages solved`} />

        {/* Path map */}
        <div style={{
          background: 'var(--clr-surface)', borderRadius: 14,
          border: '1.5px solid var(--clr-border)', padding: '1rem 1.2rem', marginBottom: '1rem',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--clr-text-soft)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🗺️ Investigation Path
          </div>
          <CluePathMap stages={stages} solvedCount={solvedCount} onSelectStage={handleStartStage} />
        </div>

        {/* Evidence notebook */}
        <EvidencePanel evidenceItems={evidenceItems} suspects={suspects} eliminatedIds={eliminatedIds} />

        {allSolved ? (
          <div style={{ textAlign: 'center' }}>
            <button onClick={handleStartAccusation}
              className="mda-btn-press"
              style={{
                padding: '0.8rem 2rem', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, var(--clr-accent), #d4733e)',
                color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(232,134,74,0.3)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                  <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                  <path d="M7 21h10" />
                  <path d="M12 3v18" />
                  <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
                </svg>
                All clues found! Make your accusation
              </span>
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft)' }}>
              {remainingSuspects.length} suspect{remainingSuspects.length !== 1 ? 's' : ''} still in play
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main EnhancedMathDetectiveApp ────────────────────────────────────

export default function EnhancedMathDetectiveApp({ onBack }) {
  const [progress, setProgress] = useState(loadDetectiveProgress);
  const [screen, setScreen] = useState('dashboard'); // 'dashboard' | 'library' | 'case' | 'leaderboard' | 'achievements'
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);
  const [userAge, setUserAge] = useState(progress.age || 8);
  const [enhancedPhase, setEnhancedPhase] = useState(null); // null | 'lineup' | 'playing'
  const [generatedCase, setGeneratedCase] = useState(null); // holds dynamically generated cases (e.g. Profit & Loss)

  // Persist age whenever it changes
  useEffect(() => {
    const p = loadDetectiveProgress();
    p.age = userAge;
    saveDetectiveProgress(p);
  }, [userAge]);

  const rank = getDetectiveRank(progress.xp);
  const nextRank = getNextRank(progress.xp);
  const xpToNext = nextRank ? nextRank.xp - progress.xp : 0;
  const xpProgressPct = nextRank
    ? Math.min(100, Math.round(((progress.xp - rank.xp) / (nextRank.xp - rank.xp)) * 100))
    : 100;

  // Track used case IDs per topic for deduplication
  const usedCaseIds = progress.usedCaseIds || [];
  // Ensure totalStars is initialized
  if (!progress.totalStars) progress.totalStars = 0;

  // Determine initial screen
  useEffect(() => {
    const unfinishedCase = Object.entries(progress.cases || {}).find(([, p]) => p.status === 'in_progress');
    const hasAnyCaseStarted = Object.keys(progress.cases || {}).length > 0;
    const allComplete = hasAnyCaseStarted && ALL_CASES.every(c => progress.cases[c.id]?.status === 'solved');

    if (unfinishedCase) {
      setActiveCaseId(unfinishedCase[0]);
      setScreen('case');
      const saved = unfinishedCase[1];
      // Resume from saved snapshot if present; otherwise generate dynamic content.
      // Board specs are static in-code content — always resume with the current
      // spec (so the latest notebook content renders) while keeping progress.
      if (saved && saved.savedCase) {
        const freshBoardCase = saved.savedCase.type === 'board'
          ? ALL_CASES.find(c => c.id === unfinishedCase[0])
          : null;
        setGeneratedCase(freshBoardCase || saved.savedCase);
        setEnhancedPhase('playing');
      } else if (CASE_GENERATORS[unfinishedCase[0]]) {
        setGeneratedCase(CASE_GENERATORS[unfinishedCase[0]]());
        setEnhancedPhase('lineup');
      } else {
        setEnhancedPhase(null);
      }
    } else if (allComplete || !hasAnyCaseStarted) {
      setScreen('dashboard');
    } else {
      setScreen('library');
    }
  }, []);

  // Case deduplication: pick a case that hasn't been used for the same topic
  const handleSelectCase = (caseId) => {
    setActiveCaseId(caseId);
    // Resume an in-progress case from its saved snapshot; otherwise generate fresh
    const existing = (progress.cases || {})[caseId];
    let caseData;
    if (existing && existing.status === 'in_progress' && existing.savedCase) {
      // Board specs are static in-code content — resume with the current spec
      // (latest notebook content) while keeping progress from the snapshot.
      const freshBoardCase = existing.savedCase.type === 'board'
        ? ALL_CASES.find(c => c.id === caseId)
        : null;
      caseData = freshBoardCase || existing.savedCase;
      setGeneratedCase(caseData);
    } else if (CASE_GENERATORS[caseId]) {
      caseData = CASE_GENERATORS[caseId]();
      setGeneratedCase(caseData);
    } else {
      setGeneratedCase(null);
      caseData = ALL_CASES.find(c => c.id === caseId);
    }
    if (caseData && isEnhancedCase(caseData)) {
      setEnhancedPhase(existing && existing.status === 'in_progress' && existing.savedCase ? 'playing' : 'lineup');
    } else {
      setEnhancedPhase(null);
    }
    setScreen('case');
  };

  const handleCaseComplete = (caseId, solved, meta = {}) => {
    const caseData = (generatedCase && generatedCase.id === caseId) ? generatedCase : ALL_CASES.find(c => c.id === caseId);
    if (!caseData) return;

    const updated = { ...progress };
    if (!updated.cases) updated.cases = {};
    if (!updated.usedCaseIds) updated.usedCaseIds = [];
    if (!updated.totalStars) updated.totalStars = 0;

    // Calculate stars from TOTAL hints used across all stages
    const totalHintsUsed = meta.totalHintsUsed ?? meta.hintLevel ?? 0;
    const stars = totalHintsUsed === 0 ? 3 : totalHintsUsed <= 2 ? 2 : 1;
    const xpMultiplier = stars === 3 ? 1 : stars === 2 ? 0.7 : 0.4;
    const xpEarned = Math.round(caseData.xpReward * xpMultiplier);

    // Mark case as solved
    updated.cases[caseId] = {
      status: 'solved',
      currentStage: caseData.stages?.length ?? 1,
      totalStages: caseData.stages?.length ?? 1,
      topic: caseData.topic,
      stars,
      xpEarned,
      hintLevel: totalHintsUsed,
      completedAt: Date.now(),
    };

    // Board-case between-case mastery: silently nudge the skill-family band.
    if (caseData.type === 'board' && meta.skillFamily) {
      const total = (meta.correctCount || 0) + (meta.wrongCount || 0);
      if (!updated.boardMastery) updated.boardMastery = {};
      const current = updated.boardMastery[meta.skillFamily] ?? 0;
      let next = current;
      if (total > 0) {
        const correctRatio = (meta.correctCount || 0) / total;
        if (correctRatio >= 2 / 3 && totalHintsUsed <= 2) next = Math.min(2, current + 1);
        else if ((meta.wrongCount || 0) > total / 2 || totalHintsUsed > 4) next = Math.max(0, current - 1);
      }
      updated.boardMastery[meta.skillFamily] = next;
    }
    updated.xp += xpEarned;
    updated.totalStars = (updated.totalStars || 0) + stars;
    updated.casesSolved = Object.values(updated.cases).filter(c => c.status === 'solved').length;

    // Add to used case IDs (for deduplication)
    if (!updated.usedCaseIds.includes(caseId)) {
      updated.usedCaseIds.push(caseId);
    }

    // Update leaderboard with best score
    updateLeaderboard(caseId, stars, xpEarned, totalHintsUsed, caseData.topic);

    // Check and award achievements
    const allSolvedCount = updated.casesSolved;
    const tempProgress = { ...updated, casesSolved: allSolvedCount };
    
    // Override the completionist check to work with actual ALL_CASES length
    const checkWithTotal = (p) => p.casesSolved >= ALL_CASES.length;
    const achievementsWithCompletionist = ACHIEVEMENTS.map(a => 
      a.id === 'completionist' ? { ...a, check: checkWithTotal } : a
    );
    
    const unlocked = loadAchievements();
    const newlyUnlocked = [];
    for (const a of achievementsWithCompletionist) {
      if (!unlocked[a.id] && a.check(tempProgress)) {
        unlocked[a.id] = { unlockedAt: Date.now() };
        newlyUnlocked.push(a);
      }
    }
    if (newlyUnlocked.length > 0) {
      saveAchievements(unlocked);
      setNewAchievements(prev => [...prev, ...newlyUnlocked]);
    }

    saveDetectiveProgress(updated);
    setProgress(updated);
  };

  const handleBackFromCase = () => {
    const updated = loadDetectiveProgress();
    setProgress(updated);
    setEnhancedPhase(null);
    setScreen('library');
    setActiveCaseId(null);
  };

  const handleBackFromLibrary = () => {
    setScreen('dashboard');
  };

  const handleBackFromLeaderboard = () => {
    setScreen('dashboard');
  };

  const handleBackFromAchievements = () => {
    setScreen('dashboard');
  };

  const handleCTA = () => {
    if (screen === 'dashboard') {
      setScreen('library');
    }
  };

  const handleLeaderboard = () => {
    setScreen('leaderboard');
  };

  const handleAchievements = () => {
    setScreen('achievements');
  };

  const dismissAchievementNotif = () => {
    setNewAchievements([]);
  };

  const handleReset = () => {
    const msg = 'Reset all detective progress? This will clear all solved cases, XP, stars AND leaderboard data.';
    if (window.confirm(msg)) {
      const reset = { xp: 0, casesSolved: 0, cases: {}, usedCaseIds: [], boardMastery: {} };
      saveDetectiveProgress(reset);
      // Also clear leaderboard
      try { localStorage.removeItem(LEADERBOARD_KEY); } catch {}
      setProgress(reset);
      setEnhancedPhase(null);
      setScreen('dashboard');
      setActiveCaseId(null);
    }
  };

  const rankC = rankColor(rank.title);
  const rankE = rankEmoji(rank.title);

  // ═══════════════════════════════════════
  // SCREEN: Achievements
  // ═══════════════════════════════════════
  if (screen === 'achievements') {
    return (
      <>
        <AchievementNotification achievements={newAchievements} onDismiss={dismissAchievementNotif} />
        <DetectiveAchievements onBack={handleBackFromAchievements} progress={progress} />
      </>
    );
  }

  // ═══════════════════════════════════════
  // SCREEN: Leaderboard
  // ═══════════════════════════════════════
  if (screen === 'leaderboard') {
    const caseLookup = {};
    ALL_CASES.forEach(c => { caseLookup[c.id] = c; });
    return (
      <DetectiveLeaderboard onBack={handleBackFromLeaderboard} progress={progress} totalCases={ALL_CASES.length} caseLookup={caseLookup} />
    );
  }

  // ═══════════════════════════════════════
  // SCREEN: Detective Case View
  // ═══════════════════════════════════════
  if (screen === 'case' && activeCaseId) {
    const caseData = generatedCase || ALL_CASES.find(c => c.id === activeCaseId);
    if (!caseData) { setScreen('library'); return null; }

    // Enhanced case flow: SuspectLineup → EnhancedCasePlay (shared handlers
    // also used by the board case flow below)
    const handleEnhancedBack = () => {
      setEnhancedPhase(null);
      handleBackFromCase();
    };
    const handleEnhancedComplete = (caseId, solved, meta = {}) => {
      handleCaseComplete(caseId, solved, meta);
    };

    // Board case flow: BoardCasePlay (crime-scene board)
    if (caseData.type === 'board') {
      const caseProgress = (progress.cases || {})[activeCaseId];
      const boardResumeState = (caseProgress && caseProgress.status === 'in_progress' && caseProgress.boardSnapshot)
        ? { phase: caseProgress.phase, boardSnapshot: caseProgress.boardSnapshot }
        : null;
      const masteryBand = progress.boardMastery?.[caseData.skillFamily] ?? 0;
      const boardInitialState = boardResumeState
        ? { ...boardResumeState, initialBand: masteryBand }
        : { initialBand: masteryBand };
      return (
        <>
          <AchievementNotification achievements={newAchievements} onDismiss={dismissAchievementNotif} />
          <BoardCasePlay
            story={caseData}
            onComplete={handleEnhancedComplete}
            onBack={handleEnhancedBack}
            initialState={boardInitialState}
          />
        </>
      );
    }

    if (isEnhancedCase(caseData)) {
      if (enhancedPhase === 'lineup') {
        return (
          <>
            <AchievementNotification achievements={newAchievements} onDismiss={dismissAchievementNotif} />
            <SuspectLineup
              suspects={caseData.suspects}
              onContinue={() => setEnhancedPhase('playing')}
            />
          </>
        );
      }

      if (enhancedPhase === 'playing') {
        const caseProgress = (progress.cases || {})[activeCaseId];
        const resumeState = (caseProgress && caseProgress.status === 'in_progress' && caseProgress.savedCase)
          ? {
              phase: caseProgress.phase,
              solvedClues: caseProgress.solvedClues || [],
              eliminatedIds: caseProgress.eliminatedIds || [],
              evidenceItems: caseProgress.evidenceItems || [],
              currentClueIdx: caseProgress.currentClueIdx ?? null,
              pendingEvidence: caseProgress.pendingEvidence || null,
              totalHintsUsed: caseProgress.totalHintsUsed || 0,
            }
          : null;
        return (
          <>
            <AchievementNotification achievements={newAchievements} onDismiss={dismissAchievementNotif} />
            {caseData.mode === 'path' ? (
              <PathCasePlay
                story={caseData}
                onComplete={handleEnhancedComplete}
                onBack={handleEnhancedBack}
                initialState={resumeState}
              />
            ) : (
              <EnhancedCasePlay
                story={caseData}
                onComplete={handleEnhancedComplete}
                onBack={handleEnhancedBack}
                initialState={resumeState}
              />
            )}
          </>
        );
      }

      // Fallback — should not reach here, but go to lineup
      setEnhancedPhase('lineup');
      return null;
    }

    // Classic case flow (unchanged)
    const caseProgress = (progress.cases || {})[activeCaseId];
    const initialStage = caseProgress && caseProgress.status === 'in_progress'
      ? Math.min(caseProgress.currentStage || 0, caseData.stages.length - 1)
      : 0;

    return (
      <>
        <AchievementNotification achievements={newAchievements} onDismiss={dismissAchievementNotif} />
        <DetectiveCaseView
          caseData={caseData}
          initialStage={initialStage}
          onComplete={handleCaseComplete}
          onBack={handleBackFromCase}
        />
      </>
    );
  }

  // ═══════════════════════════════════════
  // SCREEN: Case Library
  // ═══════════════════════════════════════
  if (screen === 'library') {
    // Filter cases by age-appropriate topics (curriculum-aligned)
    const ageFilteredCases = filterCasesByAge(ALL_CASES, userAge);
    const hasAnyStarted = Object.keys(progress.cases || {}).length > 0;
    const allComplete = hasAnyStarted && ageFilteredCases.every(c => (progress.cases || {})[c.id]?.status === 'solved');

    // Show cases with unfinished ones first
    const sortedCases = [...ageFilteredCases].sort((a, b) => {
      const aStatus = (progress.cases || {})[a.id]?.status;
      const bStatus = (progress.cases || {})[b.id]?.status;
      if (aStatus === 'in_progress' && bStatus !== 'in_progress') return -1;
      if (bStatus === 'in_progress' && aStatus !== 'in_progress') return 1;
      return 0;
    });

    return (
      <>
        <AchievementNotification achievements={newAchievements} onDismiss={dismissAchievementNotif} />
        <DetectiveCaseLibrary
          progress={progress}
          cases={sortedCases}
          allComplete={allComplete}
          onSelectCase={handleSelectCase}
          onBack={handleBackFromLibrary}
        />
      </>
    );
  }

  // ═══════════════════════════════════════
  // SCREEN: Dashboard
  // ═══════════════════════════════════════
  const hasAnyStarted = Object.keys(progress.cases || {}).length > 0;
  // Filter cases by age-appropriate topics (curriculum-aligned)
  const ageFilteredAll = filterCasesByAge(ALL_CASES, userAge);
  const allComplete = hasAnyStarted && ageFilteredAll.every(c => (progress.cases || {})[c.id]?.status === 'solved');
  const unfinishedCase = Object.entries(progress.cases || {}).find(([, p]) => p.status === 'in_progress');
  const totalCases = ageFilteredAll.length;

  // Stats
  const solvedCount = progress.casesSolved || 0;
  const uniqueTopics = new Set(ageFilteredAll.map(c => c.topic)).size;

  return (
    <>
      <DetectiveParticles />
      <div className="app-shell">
        <div className="card" style={{ maxWidth: 'min(600px, 95vw)', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button className="back-button" onClick={onBack} style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>← Home</button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }} className="mda-floatSlow">🔍</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.3rem', fontFamily: 'var(--font-display)' }}>
            Math Detective Agency
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', margin: 0 }}>
            Solve mysteries using mathematics
          </p>
        </div>

        {/* Rank & XP Card */}
        <div style={{
          background: 'var(--clr-surface)', borderRadius: 16, padding: '1.2rem 1.5rem',
          marginBottom: '1.2rem', border: '1.5px solid var(--clr-border)',
          display: 'flex', alignItems: 'center', gap: '1rem',
        }}>
          <div style={{
            fontSize: '2.5rem', width: 56, height: 56, borderRadius: '50%',
            background: rankC + '20', border: '3px solid ' + rankC,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {rankE}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-soft)', fontWeight: 600, marginBottom: 1 }}>
              DETECTIVE RANK
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: rankC, marginBottom: '0.3rem' }}>
              {rank.title}
            </div>
            {nextRank && (
              <>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--clr-border)', position: 'relative', overflow: 'hidden', marginBottom: '0.2rem' }}>
                  <div style={{ height: '100%', borderRadius: 3, width: xpProgressPct + '%', background: 'linear-gradient(90deg, ' + rankC + ', ' + rankColor(nextRank.title) + ')', transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-soft)' }}>
                  {xpToNext} XP to {nextRank.title}
                </div>
              </>
            )}
            {!nextRank && (
              <div style={{ fontSize: '0.78rem', color: '#ff9800', fontWeight: 600 }}>
                Maximum rank achieved! ★
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--clr-surface)', borderRadius: 12, padding: '1rem', textAlign: 'center', border: '1.5px solid var(--clr-border)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--clr-text)', marginBottom: '0.2rem' }}>{solvedCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cases Solved</div>
          </div>
          <div style={{ background: 'var(--clr-surface)', borderRadius: 12, padding: '1rem', textAlign: 'center', border: '1.5px solid var(--clr-border)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--clr-accent)', marginBottom: '0.2rem' }}>{progress.xp}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>XP Earned</div>
          </div>
          <div style={{ background: 'var(--clr-surface)', borderRadius: 12, padding: '1rem', textAlign: 'center', border: '1.5px solid var(--clr-border)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ff9800', marginBottom: '0.2rem' }}>{progress.totalStars || 0}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>⭐ Stars Collected</div>
          </div>
          <div style={{ background: 'var(--clr-surface)', borderRadius: 12, padding: '1rem', textAlign: 'center', border: '1.5px solid var(--clr-border)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--clr-accent)', marginBottom: '0.2rem' }}>{uniqueTopics}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Topics Covered</div>
          </div>
        </div>

        <AchievementNotification achievements={newAchievements} onDismiss={dismissAchievementNotif} />

        {/* Age selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center', marginBottom: '1.2rem', padding: '0.6rem 1rem', borderRadius: 12, background: 'var(--clr-surface)', border: '1.5px solid var(--clr-border)' }}>
          <span style={{ fontSize: '1.1rem' }}>🎂</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--clr-text-soft)' }}>Age:</span>
          <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(a => (
              <button key={a} onClick={() => setUserAge(a)}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  border: userAge === a ? '2px solid var(--clr-accent)' : '1.5px solid var(--clr-border)',
                  background: userAge === a ? 'var(--clr-accent-soft)' : 'transparent',
                  color: userAge === a ? 'var(--clr-accent)' : 'var(--clr-text-soft)',
                  fontWeight: userAge === a ? 800 : 500,
                  fontSize: '0.75rem', cursor: 'pointer', padding: 0,
                  transition: 'all 0.2s',
                }}
                title={`Age ${a} — ${getAgeClassLabel(a)}`}
              >
                {a}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--clr-accent)', fontWeight: 700, whiteSpace: 'nowrap', background: 'var(--clr-accent-soft)', padding: '2px 8px', borderRadius: 999 }}>
            {getAgeClassLabel(userAge)}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleCTA}
            aria-label={unfinishedCase ? 'Continue current case' : allComplete ? 'View completed cases' : 'Browse case library'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.9rem 2rem', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, var(--clr-accent), #d4733e)',
              color: '#fff', fontWeight: 700, fontSize: '1.05rem',
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(232,134,74,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(232,134,74,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(232,134,74,0.3)'; }}
          >
            <span style={{ fontSize: '1.3rem' }}>
              {unfinishedCase ? '🔍' : allComplete ? '🏆' : '🗂️'}
            </span>
            {unfinishedCase ? 'Continue Investigation' : allComplete ? 'View Completed Cases' : 'Browse Case Library'}
          </button>
          <button onClick={handleLeaderboard}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.9rem 1.5rem', borderRadius: 14, border: '1.5px solid var(--clr-accent)',
              background: 'transparent',
              color: 'var(--clr-accent)', fontWeight: 700, fontSize: '1.05rem',
              cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s, background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--clr-accent-soft)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span style={{ fontSize: '1.3rem' }}>🏆</span>
            Leaderboard
          </button>
          <button onClick={handleAchievements}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.9rem 1.5rem', borderRadius: 14, border: '1.5px solid var(--clr-border)',
              background: 'var(--clr-surface)',
              color: 'var(--clr-text)', fontWeight: 700, fontSize: '1.05rem',
              cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s, background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--clr-surface-hover)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--clr-surface)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span style={{ fontSize: '1.3rem' }}>🏅</span>
            Achievements
          </button>
        </div>

        {/* Feature summary */}
        <div style={{
          background: 'var(--clr-surface)', borderRadius: 12, padding: '1rem 1.2rem',
          border: '1.5px solid var(--clr-border)',
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text-soft)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Agency Overview
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', lineHeight: 1.6 }}>
            🕵️ <strong>{totalCases}</strong> age-appropriate cases across <strong>{uniqueTopics}</strong> math topics
            <br />💡 Each question has progressive hints to help you
            <br />🔄 No two cases are the same — multiple story variants per topic
            <br />🎂 <strong>Age {userAge}</strong> — <strong>{getAgeClassLabel(userAge)}</strong>
            {totalCases === 0 && <><br />📚 <strong>UKG cases coming soon!</strong> Check back for counting, shapes & pattern stories</>}
            <br />🏆 Earn <strong>3 stars ⭐⭐⭐</strong> by solving without hints!
          </div>
        </div>

        {/* Reset */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button onClick={handleReset} style={{
            background: 'none', border: 'none', color: 'var(--clr-text-soft)',
            fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.5,
          }}>
            Reset all progress
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
