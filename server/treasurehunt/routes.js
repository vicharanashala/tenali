console.log("Treasure routes file loaded");
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { generateGrid, floodReveal, isGridCleared } = require('./grid');
const { saveCompletedSession } = require('./sessionModel');
const router = express.Router();

const INITIAL_LIVES = 3;

function countTreasures(session) {
  let total = 0;
  let found = 0;
  const { treasureMap, revealed } = session;
  for (let r = 0; r < treasureMap.length; r++) {
    for (let c = 0; c < treasureMap[r].length; c++) {
      if (treasureMap[r][c]) {
        total++;
        if (revealed[r][c]) found++;
      }
    }
  }
  return { total, found };
}

function recordTopicAttempt(session, topic, correct) {
  if (!session.topicStats) session.topicStats = {};
  if (!session.topicStats[topic]) {
    session.topicStats[topic] = { attempted: 0, correct: 0, incorrect: 0 };
  }
  const stats = session.topicStats[topic];
  stats.attempted++;
  if (correct) stats.correct++;
  else stats.incorrect++;
}

function buildSummary(session) {
  const { total, found } = countTreasures(session);
  const livesUsed = (session.initialLives ?? INITIAL_LIVES) - session.lives;
  const topicBreakdown = Object.entries(session.topicStats || {}).map(([topic, s]) => ({
    topic,
    attempted: s.attempted,
    correct: s.correct,
    accuracy: s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : null,
  }));

  let weakestTopic = null;
  let lowestAcc = Infinity;
  for (const entry of topicBreakdown) {
    if (entry.attempted > 0 && entry.accuracy < lowestAcc) {
      lowestAcc = entry.accuracy;
      weakestTopic = entry.topic;
    }
  }

  return {
    status: session.status,
    treasuresFound: found,
    totalTreasures: total,
    livesUsed,
    topicBreakdown,
    weakestTopic,
  };
}

function finalizeIfEnded(session) {
  if (session.status !== 'in_progress') return null;

  if (isGridCleared(session.revealed, session.treasureMap)) {
    session.status = 'won';
    const summary = buildSummary(session);
    saveCompletedSession(session, summary);
    return summary;
  }

  if (session.lives <= 0) {
    session.status = 'lost';
    const summary = buildSummary(session);
    saveCompletedSession(session, summary);
    return summary;
  }

  return null;
}

function ensureSessionActive(session, res) {
  if (session.status && session.status !== 'in_progress') {
    res.status(400).json({ error: 'game already ended', status: session.status });
    return false;
  }
  return true;
}

const modulesPath = path.join(__dirname, 'modules.json');
const worldsPath = path.join(__dirname, 'worlds.json');
const sessions = new Map();
const diagnostics = new Map();

function loadModules() {
  const raw = fs.readFileSync(modulesPath, 'utf8');
  return JSON.parse(raw);
}

function loadWorlds() {
  const raw = fs.readFileSync(worldsPath, 'utf8');
  return JSON.parse(raw);
}

// ─── Legacy routes (kept for backward compat, not used by new worlds UI) ────
router.get('/modules', (req, res) => {
  const raw = fs.readFileSync(modulesPath, 'utf8');
  let modules = JSON.parse(raw);
  const grade = req.query.grade;
  if (grade !== undefined && grade !== '') {
    const g = Number(grade);
    modules = modules.filter((m) => m.grade === g);
  }
  res.json(modules);
});

// ─── Part D: GET /worlds ────────────────────────────────────────────────────
router.get('/worlds', (req, res) => {
  const worlds = loadWorlds();
  res.json(worlds);
});

router.use((req, res, next) => {
  console.log("Router hit:", req.method, req.originalUrl);
  next();
});
router.get('/ping', (req, res) => {
  res.json({ status: 'ok', feature: 'treasurehunt' });
});

// ─── Fraction math helpers ──────────────────────────────────────────────────
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function simplifyFraction(num, den) {
  if (den < 0) { num = -num; den = -den; }
  if (num === 0) return { num: 0, den: 1 };
  const g = gcd(Math.abs(num), den);
  return { num: num / g, den: den / g };
}

function fractionOp(n1, d1, n2, d2, op) {
  let rNum, rDen;
  if (op === '+') {
    rNum = n1 * d2 + n2 * d1;
    rDen = d1 * d2;
  } else if (op === '−' || op === '-') {
    rNum = n1 * d2 - n2 * d1;
    rDen = d1 * d2;
  } else if (op === '×' || op === '*') {
    rNum = n1 * n2;
    rDen = d1 * d2;
  } else if (op === '÷' || op === '/') {
    rNum = n1 * d2;
    rDen = d1 * n2;
  } else {
    rNum = n1 * d2 + n2 * d1;
    rDen = d1 * d2;
  }
  return simplifyFraction(rNum, rDen);
}

function fractionToString(num, den) {
  if (den === 1) return `${num}`;
  return `${num}/${den}`;
}

// ─── Distractor generation ──────────────────────────────────────────────────
const NUMERIC_DISTRACTOR_MAX_ITERATIONS = 100;

function numericDistractors(correctAnswer, count = 3) {
  const num = Number(correctAnswer);
  if (!Number.isFinite(num)) {
    throw new Error(`numericDistractors: invalid answer ${JSON.stringify(correctAnswer)}`);
  }
  correctAnswer = num;
  const isDecimal = !Number.isInteger(correctAnswer);
  const distractors = new Set();

  let offsets;
  if (isDecimal) {
    const decStr = String(correctAnswer);
    const dp = decStr.includes('.') ? decStr.split('.')[1].length : 1;
    const step = Math.pow(10, -dp);
    offsets = [-3, -2, -1, 1, 2, 3].map((m) => +(correctAnswer + m * step).toFixed(dp));
  } else {
    offsets = [-3, -2, -1, 1, 2, 3].map((m) => correctAnswer + m);
  }

  for (let i = offsets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [offsets[i], offsets[j]] = [offsets[j], offsets[i]];
  }

  for (const val of offsets) {
    if (distractors.size >= count) break;
    if (val !== correctAnswer) {
      distractors.add(val);
    }
  }

  let delta = isDecimal ? 0.5 : 4;
  let iterations = 0;
  while (distractors.size < count) {
    iterations++;
    if (iterations > NUMERIC_DISTRACTOR_MAX_ITERATIONS) {
      throw new Error(
        `numericDistractors: could not generate ${count} distractors for ${correctAnswer}`,
      );
    }
    const candidate = isDecimal
      ? +(correctAnswer + delta).toFixed(2)
      : correctAnswer + Math.round(delta);
    if (candidate !== correctAnswer && !distractors.has(candidate)) {
      distractors.add(candidate);
    }
    delta += isDecimal ? 0.5 : 1;
  }

  return [...distractors];
}

function fractionDistractors(correctNum, correctDen, n1, d1, n2, d2, count = 3) {
  const correctStr = fractionToString(correctNum, correctDen);
  const distractors = new Set();

  const naiveNum = n1 + n2;
  const naiveDen = d1 + d2;
  const naiveSimp = simplifyFraction(naiveNum, naiveDen);
  const naiveStr = fractionToString(naiveSimp.num, naiveSimp.den);
  if (naiveStr !== correctStr) distractors.add(naiveStr);

  const expandedStr = fractionToString(correctNum * 2, correctDen * 2);
  if (expandedStr !== correctStr) distractors.add(expandedStr);

  const wrongNum1 = simplifyFraction(correctNum + 1, correctDen);
  const wrongStr1 = fractionToString(wrongNum1.num, wrongNum1.den);
  if (wrongStr1 !== correctStr && !distractors.has(wrongStr1)) distractors.add(wrongStr1);

  const wrongDen1 = simplifyFraction(correctNum, correctDen + 1);
  const wrongStr2 = fractionToString(wrongDen1.num, wrongDen1.den);
  if (wrongStr2 !== correctStr && !distractors.has(wrongStr2)) distractors.add(wrongStr2);

  if (distractors.size < count) {
    const wrongNum2 = simplifyFraction(Math.abs(correctNum - 1), correctDen);
    const wrongStr3 = fractionToString(wrongNum2.num, wrongNum2.den);
    if (wrongStr3 !== correctStr && !distractors.has(wrongStr3)) distractors.add(wrongStr3);
  }

  const result = [...distractors].slice(0, count);
  let offset = 2;
  while (result.length < count) {
    const padded = fractionToString(correctNum + offset, correctDen);
    if (padded !== correctStr && !result.includes(padded)) {
      result.push(padded);
    }
    offset++;
  }
  return result;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED HELPER: fetch a question for a given topic + tier from worlds.json data
// Used by GET /question AND GET /diagnostic/start
// ═══════════════════════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 4000;

function buildUpstreamQuestionUrl(topicEntry, tier) {
  const apiType = topicEntry.apiType;
  const tierParams = topicEntry.tierMap[tier] || topicEntry.tierMap['easy'] || {};
  const qs = Object.entries(tierParams)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return `http://127.0.0.1:${PORT}/${apiType}-api/question${qs ? '?' + qs : ''}`;
}

/**
 * Generate distractors for string-based answers (congruence conditions, conic
 * names, yes/no, etc.).  `pool` is an array of plausible wrong answers.
 * If a pool isn't provided we generate light perturbations of the correct text.
 */
function stringDistractors(correctAnswer, pool, count = 3) {
  const distractors = new Set();
  if (pool && pool.length > 0) {
    const shuffled = shuffle(pool);
    for (const p of shuffled) {
      if (String(p) !== String(correctAnswer) && distractors.size < count) {
        distractors.add(String(p));
      }
    }
  }
  // Pad if pool was too small
  let i = 1;
  while (distractors.size < count) {
    const pad = `${correctAnswer}-${i}`;
    if (!distractors.has(pad)) distractors.add(pad);
    i++;
  }
  return [...distractors];
}

/**
 * Known distractor pools keyed by apiType (or apiType:field).
 * Used for string-answer topics so the wrong options look plausible.
 */
const STRING_POOLS = {
  congruence: ['SSS', 'SAS', 'ASA', 'RHS', 'AAS'],
  conics: ['circle', 'ellipse', 'parabola', 'hyperbola'],
  diffeq_yesno: ['yes', 'no'],
};

/**
 * fetchTopicQuestion(topicEntry, tier)
 * Given a topic entry from worlds.json and a difficulty tier, fetches a question
 * from the upstream topic API, builds questionText + correctAnswer + options.
 * Returns { questionText, correctAnswer, options, topic }.
 *
 * Handles many upstream response formats:
 *   - Standard numeric: { prompt, answer: <number> }
 *   - Fraction:         { prompt, ansNum, ansDen }  or fractionadd special case
 *   - Coordinate/pair:  { prompt, ansX, ansY, display }
 *   - String answer:    { prompt, answer: "SSS" | "parabola" | "yes" }
 *   - Array answer:     { prompt, answer: [1,2,3] }
 *   - Display fallback: { prompt, display } when answer is missing
 *   - lineq special:    { x1, y1, x2, y2, m, c } (no prompt/answer)
 */
async function fetchTopicQuestion(topicEntry, tier) {
  const apiType = topicEntry.apiType;
  const url = buildUpstreamQuestionUrl(topicEntry, tier);

  const apiRes = await fetch(url);
  if (!apiRes.ok) {
    throw new Error(`upstream API returned ${apiRes.status}`);
  }
  const data = await apiRes.json();

  let questionText, correctAnswer, options;

  // ── fractionadd: special fraction arithmetic ──────────────────────────────
  if (apiType === 'fractionadd') {
    const op = data.op || '+';
    if (data.mixed) {
      questionText = `${data.w1} ${data.n1}/${data.d1} ${op} ${data.w2} ${data.n2}/${data.d2}`;
      const impN1 = data.w1 * data.d1 + data.n1;
      const impN2 = data.w2 * data.d2 + data.n2;
      const result = fractionOp(impN1, data.d1, impN2, data.d2, op);
      correctAnswer = fractionToString(result.num, result.den);
      const distrs = fractionDistractors(result.num, result.den, impN1, data.d1, impN2, data.d2);
      options = shuffle([correctAnswer, ...distrs]);
    } else {
      questionText = `${data.n1}/${data.d1} ${op} ${data.n2}/${data.d2}`;
      const result = fractionOp(data.n1, data.d1, data.n2, data.d2, op);
      correctAnswer = fractionToString(result.num, result.den);
      const distrs = fractionDistractors(result.num, result.den, data.n1, data.d1, data.n2, data.d2);
      options = shuffle([correctAnswer, ...distrs]);
    }
    return { questionText, correctAnswer, options, topic: topicEntry.topic };
  }

  questionText = data.prompt;

  // ── Coordinate answers (ansX + ansY) — coordgeom midpoint, transform ──────
  if (data.ansX !== undefined && data.ansY !== undefined) {
    correctAnswer = data.display || `(${data.ansX}, ${data.ansY})`;
    const distrs = [];
    const offsets = shuffle([-2, -1, 1, 2, 3, -3]);
    for (const off of offsets) {
      if (distrs.length >= 3) break;
      const d = `(${data.ansX + off}, ${data.ansY - off})`;
      if (d !== correctAnswer) distrs.push(d);
    }
    while (distrs.length < 3) {
      distrs.push(`(${data.ansX + distrs.length + 1}, ${data.ansY - distrs.length - 1})`);
    }
    options = shuffle([correctAnswer, ...distrs]);
    return { questionText, correctAnswer, options, topic: topicEntry.topic };
  }

  // ── Fraction answers (ansNum + ansDen) — prob, stats, coordgeom gradient,
  //    diff hard, sequences, etc. ────────────────────────────────────────────
  if (data.ansNum !== undefined && data.ansDen !== undefined) {
    const result = simplifyFraction(data.ansNum, data.ansDen);
    correctAnswer = fractionToString(result.num, result.den);
    // Use display if it looks better (e.g. "4/15" instead of computed)
    if (data.display && data.display !== correctAnswer) {
      // Prefer the simplified form but keep display for specific formats
    }
    const distrs = [];
    // Generate plausible wrong fractions
    const wrongNums = shuffle([result.num + 1, result.num - 1, result.num + 2, result.num * 2]);
    for (const wn of wrongNums) {
      if (distrs.length >= 3) break;
      const ws = simplifyFraction(wn, result.den);
      const wStr = fractionToString(ws.num, ws.den);
      if (wStr !== correctAnswer && !distrs.includes(wStr)) {
        distrs.push(wStr);
      }
    }
    // Pad with denominator perturbations if needed
    let dOff = 1;
    while (distrs.length < 3) {
      const ws = simplifyFraction(result.num, result.den + dOff);
      const wStr = fractionToString(ws.num, ws.den);
      if (wStr !== correctAnswer && !distrs.includes(wStr)) {
        distrs.push(wStr);
      }
      dOff++;
    }
    options = shuffle([correctAnswer, ...distrs]);
    return { questionText, correctAnswer, options, topic: topicEntry.topic };
  }

  // ── lineq hard: has m, c but no prompt/answer field ───────────────────────
  if (apiType === 'lineq' && data.m !== undefined && data.c !== undefined && !data.prompt) {
    const m = data.m;
    const c = data.c;
    questionText = `Find equation of line through (${data.x1}, ${data.y1}) and (${data.x2}, ${data.y2})`;
    correctAnswer = `y = ${m === 0 ? '' : (m === 1 ? 'x' : m === -1 ? '-x' : m + 'x')}${c >= 0 && m !== 0 ? ' + ' + c : c < 0 ? ' − ' + Math.abs(c) : (m === 0 ? String(c) : '')}`;
    // Simplify: just use display-style
    correctAnswer = data.display || `y = ${m}x + ${c}`;
    const distrs = [];
    for (const off of shuffle([1, -1, 2, -2, 3])) {
      if (distrs.length >= 3) break;
      const d = `y = ${m + off}x + ${c - off}`;
      if (d !== correctAnswer) distrs.push(d);
    }
    while (distrs.length < 3) distrs.push(`y = ${m}x + ${c + distrs.length + 1}`);
    options = shuffle([correctAnswer, ...distrs]);
    return { questionText, correctAnswer, options, topic: topicEntry.topic };
  }

  // ── Array answers (sets, section) ─────────────────────────────────────────
  if (Array.isArray(data.answer)) {
    if (apiType === 'sets') {
      correctAnswer = `{${data.answer.join(', ')}}`;
      // Build distractors by adding/removing elements
      const distrs = [];
      const ans = data.answer;
      if (ans.length > 1) {
        distrs.push(`{${ans.slice(1).join(', ')}}`);
      }
      distrs.push(`{${[...ans, ans[ans.length - 1] + 1].join(', ')}}`);
      if (ans.length > 2) {
        distrs.push(`{${ans.slice(0, -1).join(', ')}}`);
      }
      while (distrs.length < 3) {
        const extra = ans.map(x => x + distrs.length);
        distrs.push(`{${extra.join(', ')}}`);
      }
      options = shuffle([correctAnswer, ...distrs.slice(0, 3)]);
    } else {
      // section: coordinate pair as array
      const display = data.display || data.answer.map(v => Math.round(v * 100) / 100).join(', ');
      correctAnswer = `(${display})`;
      const distrs = [];
      for (const off of shuffle([1, -1, 2, -2, 0.5])) {
        if (distrs.length >= 3) break;
        const d = `(${data.answer.map(v => Math.round((v + off) * 100) / 100).join(', ')})`;
        if (d !== correctAnswer) distrs.push(d);
      }
      while (distrs.length < 3) {
        distrs.push(`(${data.answer.map(v => v + distrs.length + 1).join(', ')})`);
      }
      options = shuffle([correctAnswer, ...distrs]);
    }
    return { questionText, correctAnswer, options, topic: topicEntry.topic };
  }

  // ── String answers (congruence, conics, diffeq yes/no) ────────────────────
  if (typeof data.answer === 'string' && !Number.isFinite(Number(data.answer))) {
    correctAnswer = data.answer;
    let pool = STRING_POOLS[apiType] || null;
    // diffeq hard returns "yes"/"no"
    if (!pool && (data.answer === 'yes' || data.answer === 'no')) {
      pool = STRING_POOLS.diffeq_yesno;
    }
    const distrs = stringDistractors(correctAnswer, pool);
    options = shuffle([correctAnswer, ...distrs]);
    return { questionText, correctAnswer, options, topic: topicEntry.topic };
  }

  // ── Standard numeric answer ───────────────────────────────────────────────
  const numericAnswer = Number(data.answer);
  if (Number.isFinite(numericAnswer)) {
    correctAnswer = numericAnswer;
    const distrs = numericDistractors(numericAnswer);
    options = shuffle([correctAnswer, ...distrs]);
    return { questionText, correctAnswer, options, topic: topicEntry.topic };
  }

  // ── Fallback: use display field if available ──────────────────────────────
  if (data.display) {
    const numDisplay = Number(data.display);
    if (Number.isFinite(numDisplay)) {
      correctAnswer = numDisplay;
      const distrs = numericDistractors(numDisplay);
      options = shuffle([correctAnswer, ...distrs]);
      return { questionText, correctAnswer, options, topic: topicEntry.topic };
    }
    // String display
    correctAnswer = data.display;
    const distrs = stringDistractors(correctAnswer, null);
    options = shuffle([correctAnswer, ...distrs]);
    return { questionText, correctAnswer, options, topic: topicEntry.topic };
  }

  // ── Nothing worked — throw so caller can retry another topic ──────────────
  throw new Error(
    `upstream returned unrecognizable answer format (${apiType}: ${JSON.stringify(data).slice(0, 200)})`,
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// Part G: POST /session/start — accepts { worldId, topicTiers, gridSize }
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/session/start', (req, res) => {
  const { worldId, topicTiers, gridSize: rawGridSize, moduleId, anonId } = req.body || {};
  const gridSize = rawGridSize ?? 5;

  // ── Legacy path: if moduleId is provided, use the old modules.json lookup ──
  if (moduleId && !worldId) {
    const modules = loadModules();
    if (!modules.some((m) => m.id === moduleId)) {
      return res.status(400).json({ error: 'invalid moduleId' });
    }
    const { treasureMap, neighborCounts, hintCell } = generateGrid(gridSize);
    const revealed = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, {
      moduleId, gridSize, tier: 'easy', lives: 3,
      treasureMap, neighborCounts, revealed, createdAt: Date.now(),
      status: 'in_progress',
      initialLives: INITIAL_LIVES,
      topicStats: {},
      anonId: anonId || null,
    });
    return res.json({ sessionId, moduleId, gridSize, lives: 3, tier: 'easy', hintCell });
  }

  // ── New worlds path ──
  if (!worldId) {
    return res.status(400).json({ error: 'worldId is required' });
  }
  const worlds = loadWorlds();
  const world = worlds.find(w => w.id === worldId);
  if (!world) {
    return res.status(400).json({ error: 'invalid worldId' });
  }

  const { treasureMap, neighborCounts, hintCell } = generateGrid(gridSize);
  const revealed = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
  const sessionId = crypto.randomUUID();

  // For Endless Treasure: use a single shared tier instead of per-topic tiers
  const isEndless = worldId === 'endless-treasure';
  const activeTopics = world.topics.filter(t => t.status === 'active');

  // Build initial tier — use provided topicTiers or default all to 'easy'
  const resolvedTopicTiers = {};
  activeTopics.forEach(t => {
    resolvedTopicTiers[t.topic] = (topicTiers && topicTiers[t.topic]) || 'easy';
  });

  sessions.set(sessionId, {
    worldId,
    gridSize,
    lives: 3,
    treasureMap,
    neighborCounts,
    revealed,
    createdAt: Date.now(),
    status: 'in_progress',
    initialLives: INITIAL_LIVES,
    topicStats: {},
    anonId: anonId || null,
    // Per-topic tiers (used by all worlds except Endless Treasure)
    topicTiers: resolvedTopicTiers,
    // Per-topic streak counters
    topicStreaks: {},
    // Endless Treasure: single shared tier + global streak
    sharedTier: isEndless ? (topicTiers ? Object.values(topicTiers)[0] || 'easy' : 'easy') : null,
    streak: 0,
    // Track the current question's topic for /check
    currentQuestion: null,
  });

  // Return the first active topic's tier as a display hint
  const displayTier = isEndless
    ? (sessions.get(sessionId).sharedTier)
    : (Object.values(resolvedTopicTiers)[0] || 'easy');

  res.json({
    sessionId, worldId, gridSize, lives: 3, tier: displayTier, hintCell,
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Part G: GET /question — picks a random ACTIVE topic from the session's world
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/question', async (req, res) => {
  const { sessionId } = req.query;
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'session not found' });
  }

  // ── Legacy path (moduleId-based sessions) ──
  if (session.moduleId && !session.worldId) {
    const modules = loadModules();
    const mod = modules.find((m) => m.id === session.moduleId);
    if (!mod) {
      return res.status(500).json({ error: 'module not found for session' });
    }
    const currentTier = session.tier || 'easy';
    const upstreamUrl = buildUpstreamQuestionUrl(mod, currentTier);
    console.log(
      `[treasurehunt] GET /question start session=${sessionId} topic=${mod.apiType} tier=${currentTier} url=${upstreamUrl}`,
    );
    try {
      const q = await fetchTopicQuestion(mod, currentTier);
      console.log(
        `[treasurehunt] GET /question ok session=${sessionId} topic=${mod.apiType} tier=${currentTier}`,
      );
      console.log(`[question] topic=${mod.apiType} tier=${currentTier} text="${q.questionText}"`);
      session.currentQuestion = {
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        tier: currentTier,
        topic: mod.apiType,
      };
      return res.json({ questionText: q.questionText, options: q.options, tier: currentTier });
    } catch (err) {
      console.error('[treasurehunt] question fetch error:', err.message);
      return res.status(502).json({ error: 'failed to fetch question from upstream API' });
    }
  }

  // ── New worlds path ──
  const worlds = loadWorlds();
  const world = worlds.find(w => w.id === session.worldId);
  if (!world) {
    return res.status(500).json({ error: 'world not found for session' });
  }

  const activeTopics = world.topics.filter(t => t.status === 'active');
  if (activeTopics.length === 0) {
    return res.status(500).json({ error: 'no active topics in this world' });
  }

  // Pick a random active topic — retry with a different topic on failure (up to 3 attempts)
  const MAX_QUESTION_RETRIES = 3;
  const shuffledTopics = shuffle(activeTopics);
  let lastErr = null;

  for (let attempt = 0; attempt < Math.min(MAX_QUESTION_RETRIES, shuffledTopics.length); attempt++) {
    const pickedTopic = shuffledTopics[attempt];

    // Determine the tier to use
    const isEndless = session.worldId === 'endless-treasure';
    const currentTier = isEndless
      ? (session.sharedTier || 'easy')
      : (session.topicTiers[pickedTopic.topic] || 'easy');

    const upstreamUrl = buildUpstreamQuestionUrl(pickedTopic, currentTier);
    console.log(
      `[treasurehunt] GET /question attempt=${attempt + 1} session=${sessionId} topic=${pickedTopic.topic} tier=${currentTier} url=${upstreamUrl}`,
    );

    try {
      const q = await fetchTopicQuestion(pickedTopic, currentTier);
      console.log(
        `[treasurehunt] GET /question ok session=${sessionId} topic=${pickedTopic.topic} tier=${currentTier}`,
      );
      console.log(`[question] topic=${pickedTopic.topic} tier=${currentTier} text="${q.questionText}"`);

      session.currentQuestion = {
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        tier: currentTier,
        topic: pickedTopic.topic,
      };

      return res.json({
        questionText: q.questionText,
        options: q.options,
        tier: currentTier,
      });
    } catch (err) {
      console.error(`[treasurehunt] question fetch error (attempt ${attempt + 1}):`, err.message);
      lastErr = err;
    }
  }

  // All retries failed
  console.error('[treasurehunt] all question retries exhausted:', lastErr?.message);
  res.status(502).json({ error: 'failed to fetch question from upstream API' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Part G: POST /check — per-topic tier stepping (or shared tier for Endless)
// ═══════════════════════════════════════════════════════════════════════════════
const TIER_ORDER = ['easy', 'medium', 'hard'];

router.post('/check', (req, res) => {
  const { sessionId, selectedOption, row, col } = req.body || {};
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'session not found' });
  }
  if (!session.currentQuestion) {
    return res.status(400).json({ error: 'no active question' });
  }
  if (!ensureSessionActive(session, res)) return;

  const r = Number(row);
  const c = Number(col);

  const selected = String(selectedOption);
  const correct = String(session.currentQuestion.correctAnswer);
  const questionText = session.currentQuestion.questionText;
  const questionTopic = session.currentQuestion.topic;

  const isEndless = session.worldId === 'endless-treasure';
  // Is this a worlds-based session?
  const isWorldSession = !!session.worldId;

  if (selected === correct) {
    // ── Correct answer ──
    recordTopicAttempt(session, questionTopic, true);
    session.revealed[r][c] = true;

    if (isWorldSession) {
      if (isEndless) {
        // Endless Treasure: single global streak + shared tier
        session.streak = (session.streak || 0) + 1;
        if (session.streak >= 2) {
          const idx = TIER_ORDER.indexOf(session.sharedTier);
          if (idx < TIER_ORDER.length - 1) {
            session.sharedTier = TIER_ORDER[idx + 1];
          }
          session.streak = 0;
        }
      } else {
        // Per-topic streak + per-topic tier
        if (!session.topicStreaks) session.topicStreaks = {};
        session.topicStreaks[questionTopic] = (session.topicStreaks[questionTopic] || 0) + 1;
        if (session.topicStreaks[questionTopic] >= 2) {
          const currentTier = session.topicTiers[questionTopic] || 'easy';
          const idx = TIER_ORDER.indexOf(currentTier);
          if (idx < TIER_ORDER.length - 1) {
            session.topicTiers[questionTopic] = TIER_ORDER[idx + 1];
          }
          session.topicStreaks[questionTopic] = 0;
        }
      }
    } else {
      // Legacy moduleId-based session
      session.streak = (session.streak || 0) + 1;
      if (session.streak >= 2) {
        const idx = TIER_ORDER.indexOf(session.tier);
        if (idx < TIER_ORDER.length - 1) {
          session.tier = TIER_ORDER[idx + 1];
        }
        session.streak = 0;
      }
    }

    // Flood-fill from this cell if neighborCount === 0
    let floodCells = [];
    if (session.neighborCounts[r][c] === 0) {
      session.revealed[r][c] = false;
      floodCells = floodReveal(r, c, session.treasureMap, session.neighborCounts, session.revealed);
    }

    session.currentQuestion = null;

    // Compute the display tier for the response
    const newTier = isEndless
      ? session.sharedTier
      : isWorldSession
        ? (session.topicTiers[questionTopic] || 'easy')
        : session.tier;

    const summary = finalizeIfEnded(session);

    return res.json({
      correct: true,
      neighborCount: session.neighborCounts[r][c],
      newTier,
      livesLeft: session.lives,
      floodCells,
      status: session.status,
      ...(summary && { summary }),
    });
  } else {
    // ── Incorrect answer ──
    recordTopicAttempt(session, questionTopic, false);
    const correctAnswer = session.currentQuestion.correctAnswer;
    session.lives = Math.max(0, session.lives - 1);

    if (isWorldSession) {
      if (isEndless) {
        const idx = TIER_ORDER.indexOf(session.sharedTier);
        if (idx > 0) {
          session.sharedTier = TIER_ORDER[idx - 1];
        }
        session.streak = 0;
      } else {
        const currentTier = session.topicTiers[questionTopic] || 'easy';
        const idx = TIER_ORDER.indexOf(currentTier);
        if (idx > 0) {
          session.topicTiers[questionTopic] = TIER_ORDER[idx - 1];
        }
        if (!session.topicStreaks) session.topicStreaks = {};
        session.topicStreaks[questionTopic] = 0;
      }
    } else {
      const idx = TIER_ORDER.indexOf(session.tier);
      if (idx > 0) {
        session.tier = TIER_ORDER[idx - 1];
      }
      session.streak = 0;
    }

    session.currentQuestion = null;

    const newTier = isEndless
      ? session.sharedTier
      : isWorldSession
        ? (session.topicTiers[questionTopic] || 'easy')
        : session.tier;

    const summary = finalizeIfEnded(session);

    return res.json({
      correct: false,
      correctAnswer,
      tip: `${questionText} = ${correctAnswer}`,
      livesLeft: session.lives,
      newTier,
      status: session.status,
      ...(summary && { summary }),
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// Part F: Diagnostic endpoints
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/diagnostic/start', async (req, res) => {
  const { worldId } = req.query;
  if (!worldId) {
    return res.status(400).json({ error: 'worldId is required' });
  }

  const worlds = loadWorlds();
  const world = worlds.find(w => w.id === worldId);
  if (!world) {
    return res.status(400).json({ error: 'invalid worldId' });
  }

  const activeTopics = world.topics.filter(t => t.status === 'active');
  if (activeTopics.length === 0) {
    return res.status(400).json({ error: 'no active topics in this world' });
  }

  // Pick 5 topics spread evenly across active topics
  const pickedTopics = [];
  for (let i = 0; i < 5; i++) {
    pickedTopics.push(activeTopics[i % activeTopics.length]);
  }
  // Shuffle so we don't always start with the same topic
  for (let i = pickedTopics.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pickedTopics[i], pickedTopics[j]] = [pickedTopics[j], pickedTopics[i]];
  }

  try {
    // Fetch all 5 questions in parallel, using 'easy' tier for diagnostic
    const questionPromises = pickedTopics.map(t => fetchTopicQuestion(t, 'easy'));
    const questions = await Promise.all(questionPromises);

    const diagnosticId = crypto.randomUUID();
    diagnostics.set(diagnosticId, {
      worldId,
      questions: questions.map(q => ({
        topic: q.topic,
        correctAnswer: q.correctAnswer,
        answered: false,
        userCorrect: null,
      })),
      activeTopics: activeTopics.map(t => t.topic),
      createdAt: Date.now(),
    });

    // Respond WITHOUT correct answers
    res.json({
      diagnosticId,
      questions: questions.map(q => ({
        topic: q.topic,
        questionText: q.questionText,
        options: q.options,
      })),
    });
  } catch (err) {
    console.error('[treasurehunt] diagnostic start error:', err.message);
    res.status(502).json({ error: 'failed to fetch diagnostic questions' });
  }
});

router.post('/diagnostic/answer', (req, res) => {
  const { diagnosticId, topic, selectedOption } = req.body || {};
  const diag = diagnostics.get(diagnosticId);
  if (!diag) {
    return res.status(404).json({ error: 'diagnostic not found' });
  }

  const entry = diag.questions.find(q => q.topic === topic && !q.answered);
  if (!entry) {
    return res.status(400).json({ error: 'question not found or already answered' });
  }

  entry.answered = true;
  entry.userCorrect = String(selectedOption) === String(entry.correctAnswer);

  res.json({ recorded: true });
});

router.post('/diagnostic/finish', (req, res) => {
  const { diagnosticId } = req.body || {};
  const diag = diagnostics.get(diagnosticId);
  if (!diag) {
    return res.status(404).json({ error: 'diagnostic not found' });
  }

  // Build topicTiers: correct → 'medium', incorrect → 'easy', not-asked → 'easy'
  const topicTiers = {};
  const askedTopics = new Set();

  for (const q of diag.questions) {
    askedTopics.add(q.topic);
    topicTiers[q.topic] = q.userCorrect ? 'medium' : 'easy';
  }

  // Any active topic not covered defaults to 'easy'
  for (const topic of diag.activeTopics) {
    if (!askedTopics.has(topic)) {
      topicTiers[topic] = 'easy';
    }
  }

  // Clean up
  diagnostics.delete(diagnosticId);

  res.json({ topicTiers });
});

// ─── POST /cell/reveal ──────────────────────────────────────────────────────
router.post('/cell/reveal', (req, res) => {
  const { sessionId, row, col } = req.body || {};
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'session not found' });
  }
  if (!ensureSessionActive(session, res)) return;

  const r = Number(row);
  const c = Number(col);
  if (
    !Number.isInteger(r) || !Number.isInteger(c) ||
    r < 0 || r >= session.gridSize || c < 0 || c >= session.gridSize
  ) {
    return res.status(400).json({ error: 'out of bounds' });
  }

  if (session.revealed[r][c]) {
    return res.status(400).json({ error: 'cell already revealed' });
  }

  if (session.treasureMap[r][c]) {
    session.revealed[r][c] = true;
    const summary = finalizeIfEnded(session);
    return res.json({
      type: 'treasure',
      neighborCount: session.neighborCounts[r][c],
      status: session.status,
      ...(summary && { summary }),
    });
  }

  // Zero-count non-treasure cell: free reveal + flood-fill (no question needed)
  if (session.neighborCounts[r][c] === 0) {
    const cells = floodReveal(r, c, session.treasureMap, session.neighborCounts, session.revealed);
    const summary = finalizeIfEnded(session);
    return res.json({
      type: 'revealed',
      cells,
      status: session.status,
      ...(summary && { summary }),
    });
  }

  // Non-treasure cell with neighborCount > 0: need to answer a question first
  res.json({ type: 'question', status: session.status });
});

module.exports = router;
