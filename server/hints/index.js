/**
 * HINTS SERVICE & ROUTER  (v2)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Public surface (backwards-compatible with the v1 client):
 *
 *   GET  /api/hints/xp                current XP balance (auth or guest-null)
 *   POST /api/hints/unlock            deduct XP, return progressive hint text
 *   POST /api/hints/lesson-complete   bonus + lesson stat
 *
 * New in v2:
 *
 *   POST /api/hints/merge-guest       fold localStorage XP into user account
 *                                     on login (idempotent — safe to call twice)
 *   GET  /api/hints/audit             aggregated hint-usage telemetry for a user
 *                                     (parent / teacher dashboard)
 *
 * Anti-cheese defaults applied here:
 *   - per-question unlock cap  (max 5 unlocks on the same questionId)
 *   - per-lesson unlock cap    (max 50 unlocks within any 30-minute window)
 *   - rate limit              (10 unlock calls / 10s per token or per IP)
 *   - XP floor enforcement     (user.xp never goes below 0 on the server side)
 *
 * Hint content comes from ./hintSpecs.js — a declarative registry covering
 * 50+ concepts. Adding a new concept is a single entry, not a server edit.
 */

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const auth = require('../auth');
const hintSpecs = require('./hintSpecs');
const hintResolvers = require('./hintResolvers');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'tenali-dev-secret-change-me';

// Anti-cheese knobs
const PER_QUESTION_LIMIT = 5;        // max unlock calls per questionId
const PER_LESSON_WINDOW_MS = 30 * 60 * 1000; // 30 min sliding window
const PER_LESSON_LIMIT = 50;         // max unlocks per lesson window
const RATE_BUCKET_MS = 10 * 1000;    // 10-second rate bucket
const RATE_LIMIT = 10;               // 10 calls per bucket

// ─── Tiny in-memory rate limiter (per process) ───────────────────────────────
// Good enough for a single-process Node server. Swap for Redis later if you
// run multi-instance.
const rateBuckets = new Map(); // key → [timestamps]

// ─── Tiny in-memory hints cache (LRU-eviction, max 1000 items) ───────────────
const HINT_CACHE_MAX_SIZE = 1000;
const hintCache = new Map(); // questionId -> { level1, level2, level3, tier, hasExplanation }

function getCachedHints(questionId) {
  if (hintCache.has(questionId)) {
    const entry = hintCache.get(questionId);
    // Refresh LRU order
    hintCache.delete(questionId);
    hintCache.set(questionId, entry);
    return entry;
  }
  return null;
}

function setCachedHints(questionId, hintsEntry) {
  if (hintCache.has(questionId)) {
    hintCache.delete(questionId);
  } else if (hintCache.size >= HINT_CACHE_MAX_SIZE) {
    const firstKey = hintCache.keys().next().value;
    if (firstKey !== undefined) {
      hintCache.delete(firstKey);
    }
  }
  hintCache.set(questionId, hintsEntry);
}

// ─── One-shot bonus dedupe for guest sessions ───────────────────────────────
// Guest has no persistent storage, but accidental double-submits still happen.
// Track by (userId|ip, concept) so the bonus doesn't fire twice.
const guestLessonsCompleted = new Set(); // `${key}::${concept}`
function rateAllow(key, limit = RATE_LIMIT, windowMs = RATE_BUCKET_MS) {
  const now = Date.now();
  const arr = (rateBuckets.get(key) || []).filter(t => now - t < windowMs);
  if (arr.length >= limit) {
    rateBuckets.set(key, arr);
    return false;
  }
  arr.push(now);
  rateBuckets.set(key, arr);
  return true;
}

// ─── Auth helper (re-uses auth.requireAuth when Mongo is up; manual fallback) ─
function tryDecodeUser(req) {
  // 1. If requireAuth already attached req.user, use it.
  if (req.user && req.user.id) {
    return { id: req.user.id, username: req.user.username };
  }
  // 2. Otherwise try the Authorization header ourselves. Used for guest-aware
  //    routes where we want to know if the caller is logged in without
  //    *requiring* it.
  const authHeader = req.get('authorization');
  if (!authHeader) return null;
  const m = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!m) return null;
  try {
    const payload = jwt.verify(m[1], JWT_SECRET);
    return { id: payload.sub, username: payload.username };
  } catch (_e) {
    return null;
  }
}

// ─── Explanation generator passthrough ───────────────────────────────────────
// server/index.js exposes generateExplanation on the global object once it has
// been defined. We re-publish a thin wrapper here so the registry can stay
// agnostic.
function buildExplanation(reqPath, questionData, answerData) {
  if (typeof global.generateExplanation !== 'function') return '';
  // If the client didn't supply answerData, try the concept's resolver to
  // compute a canonical worked-example answer from the question data alone.
  // This makes L3 hints self-contained — user doesn't need to /check first.
  let augmentedAnswerData = answerData;
  const looksIncomplete = !answerData ||
    (answerData.correctAnswer === undefined &&
     answerData.answer === undefined &&
     answerData.display === undefined);
  if (looksIncomplete && questionData) {
    // Derive concept from the api path (e.g. "/sets-api/check" → "sets").
    const conceptMatch = (reqPath || '').match(/^\/([^/]+?)-api\//);
    const concept = conceptMatch ? conceptMatch[1] : null;
    if (concept) {
      const resolved = hintResolvers.resolveAnswer(concept, questionData);
      if (resolved) {
        augmentedAnswerData = {
          ...(answerData || {}),
          correctAnswer: resolved.correctAnswer,
          correctAnswerText: resolved.correctAnswerText,
          workedSolution: resolved.workedSolution,
          resolvedFromData: true,
        };
      }
    }
  }
  try {
    return global.generateExplanation(
      { path: reqPath || '/basicarith-api/check', body: questionData || {} },
      augmentedAnswerData || {}
    ) || '';
  } catch (e) {
    console.error('[Hints] generateExplanation failed:', e.message);
    return '';
  }
}

function inferApiPath(concept, questionData) {
  // Some concepts have multiple sub-APIs (e.g. quadratic vs qformula). The
  // questionData usually contains enough hints; fall back to a sane default.
  if (!questionData) return `/${concept}-api/check`;
  return `/${concept}-api/check`;
}

function apply90PercentRule(hintText, level, concept, questionData, answerData, cached) {
  if (Number(level) !== 3 || !hintText) return hintText;

  let text = hintText;

  // Intercept the generic fallback explanation and replace with specific steps from L1/L2
  const isGeneric = text.includes('apply the relevant formula') || 
                    text.includes('Read the problem carefully') || 
                    text.trim().startsWith('The correct answer is:');

  if (isGeneric && cached && cached.level1 && cached.level2) {
    text = `Step 1: ${cached.level1}\n\nStep 2: ${cached.level2}\n\nStep 3: Combine these steps to calculate the final result.`;
  }

  // 1. Multiple-choice masking (Vocab & GK)
  const mcRegex = /(?:correct (?:answer|option|choice) is|Therefore, the (?:answer|option|choice) is)\s*([A-D])\)\s*(.*)/i;
  const mcRegex2 = /(?:correct (?:answer|option|choice) is|Therefore, the (?:answer|option|choice) is)\s*([A-D])\b/i;
  if (mcRegex.test(text)) {
    text = text.replace(mcRegex, 'The correct option matches this description: "$2" (Match this to the correct option letter A, B, C, or D yourself!)');
  } else if (mcRegex2.test(text)) {
    text = text.replace(mcRegex2, 'correct option is the one matching the description (find the matching letter yourself!)');
  }

  // 2. Math general masking of final answers
  const resolvedAnswer = answerData?.correctAnswer ?? (hintResolvers.resolveAnswer(concept, questionData)?.correctAnswer);
  if (resolvedAnswer !== undefined && resolvedAnswer !== null) {
    const ansStr = String(resolvedAnswer).trim();
    if (ansStr.length > 0) {
      const escapedAns = ansStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      
      // Match "= value" or "is value" case-insensitively and replace with "? "
      const eqRegex = new RegExp(`(=|is|to|equals|gives|get|be)\\s*\\$?${escapedAns}(?!\\w)`, 'gi');
      text = text.replace(eqRegex, '$1 ?');
      
      // Stop exactly one step before final calculation on results
      const finalRegex = new RegExp(`(?<!\\w)${escapedAns}(?!\\w)$`, 'g');
      text = text.replace(finalRegex, '?');
      
      // Aggressively strip the exact answer from the very end of the explanation text
      const endRegex = new RegExp(`(?<!\\w)${escapedAns}[^a-zA-Z0-9]*$`, 'i');
      text = text.replace(endRegex, '?');
    }
  }

  // Mask "Answer: [value]" and "Result: [value]" lines
  text = text.replace(/(^|\n)Answer:\s*.+/gi, '$1Answer: [Use the steps explained above to compute the final value!]');
  text = text.replace(/(^|\n)Result:\s*.+/gi, '$1Result: [Use the steps explained above to compute the final value!]');

  // Generic math masking: hide the final number if an equation ends with "= [number]"
  text = text.replace(/=\s*\$?[-0-9.,]+°?\s*$/gm, '= ?');
  // Also mask "x = [number]" or similar at the end of a sentence
  text = text.replace(/\b[a-zA-Z]\s*=\s*\$?[-0-9.,]+°?\s*[.]?$/gm, match => match.split('=')[0] + '= ?');
  // Mask final answers in sentences like "The final angle is 116." or "Total cost is $50"
  text = text.replace(/\bis\s+\$?[-0-9.,]+°?\s*[.]?$/gim, 'is ?.');

  return text;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/hints/xp — current XP balance
router.get('/xp', auth.requireAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ xp: null, reason: 'mongo_offline' });
    }
    const user = await auth.User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'user_not_found' });
    return res.json({ xp: user.xp, username: user.username });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/hints/unlock — deduct XP and return the requested hint level
router.post('/unlock', async (req, res) => {
  console.log('UNLOCK REQUEST RECEIVED:', req.body);
  const { concept, questionId, level, questionData, answerData } = req.body || {};

  if (!concept || !questionId || !level) {
    return res.status(400).json({ error: 'missing_parameters' });
  }
  const levelNum = Number(level);
  if (![1, 2, 3].includes(levelNum)) {
    return res.status(400).json({ error: 'invalid_level' });
  }

  const cost = hintSpecs.costFor(concept, levelNum);
  if (cost == null) {
    return res.status(400).json({ error: 'unknown_concept', concept });
  }

  // Rate limit (per user if logged in, else per IP)
  const rateKey = (req.user && req.user.id) ? `u:${req.user.id}` : `ip:${req.ip}`;
  if (!rateAllow(rateKey)) {
    return res.status(429).json({ error: 'rate_limited', retryAfterMs: RATE_BUCKET_MS });
  }

  // ── Cache Lookup & Hint Generation ──────────────────────────────────────
  let cached = getCachedHints(questionId);
  
  if (!cached || (levelNum === 3 && !cached.hasExplanation)) {
    // Generate explanation to support reverse step-breakdown
    const explanation = buildExplanation(inferApiPath(concept, questionData), questionData, answerData);
    const hints = hintSpecs.buildHints(concept, questionData, answerData, explanation);
    
    if (cached) {
      cached.level3 = hints.level3;
      cached.hasExplanation = true;
    } else {
      cached = {
        level1: hints.level1,
        level2: hints.level2,
        level3: hints.level3,
        hasExplanation: true
      };
    }

    setCachedHints(questionId, cached);
  }

  let hintText = levelNum === 1 ? cached.level1 : levelNum === 2 ? cached.level2 : cached.level3;
  hintText = apply90PercentRule(hintText, levelNum, concept, questionData, answerData, cached);

  // ── Authenticated path ─────────────────────────────────────────────────
  const caller = tryDecodeUser(req);
  if (caller && mongoose.connection.readyState === 1) {
    try {
      // Optimize query by projecting only required fields (saves bandwidth and memory)
      const user = await auth.User.findById(caller.id).select('xp hintLogs');
      if (!user) {
        return res.json({ success: true, guest: true, hint: hintText, cost, tier: cached.tier });
      }

      // Per-question unlock cap
      const recentForQuestion = user.hintLogs.filter(
        l => l.concept === concept && l.questionId === questionId
      );
      if (recentForQuestion.length >= PER_QUESTION_LIMIT) {
        return res.status(429).json({
          error: 'per_question_limit',
          limit: PER_QUESTION_LIMIT,
          hint: hintText, // still return the hint text; the client already paid
          cost: 0,
          tier: cached.tier
        });
      }

      // Per-lesson cap (30-minute sliding window)
      const cutoff = new Date(Date.now() - PER_LESSON_WINDOW_MS);
      const recentInLesson = user.hintLogs.filter(l => l.unlockedAt >= cutoff);
      if (recentInLesson.length >= PER_LESSON_LIMIT) {
        return res.status(429).json({
          error: 'per_lesson_limit',
          limit: PER_LESSON_LIMIT,
          hint: hintText,
          cost: 0,
          tier: cached.tier
        });
      }

      // Insufficient XP
      if (user.xp < cost) {
        return res.status(400).json({
          error: 'insufficient_xp',
          required: cost,
          current: user.xp,
        });
      }

      // Apply database updates atomically (much faster than loading/saving whole document)
      const updatedUser = await auth.User.findOneAndUpdate(
        { _id: caller.id, coins: { $gte: cost } },
        {
          $inc: { xp: -cost, coins: -cost, coinBalance: -cost, xpScore: -cost },
          $push: { hintLogs: { concept, questionId, level: levelNum, unlockedAt: new Date() } }
        },
        { new: true, select: 'xp coins coinBalance xpScore' }
      );

      const balance = updatedUser ? updatedUser.xp : Math.max(0, user.xp - cost);

      return res.json({
        success: true,
        balance,
        hint: hintText,
        cost,
        tier: cached.tier,
      });
    } catch (err) {
      console.error('[Hints] unlock user path failed:', err);
      // Fall through to guest response so the kid still gets the hint
    }
  }

  // ── Guest / Mongo-offline path ──────────────────────────────────────────
  return res.json({
    success: true,
    guest: true,
    hint: hintText,
    cost,
    tier: cached.tier,
  });
});

// POST /api/hints/lesson-complete — bonus + lesson stat
router.post('/lesson-complete', async (req, res) => {
  const { concept, questionsCount, hintsUsed, correctCount, wasSolved, results } = req.body || {};
  if (!concept) return res.status(400).json({ error: 'missing_concept' });

  const qCount = Math.max(1, parseInt(questionsCount, 10) || 20);
  const hUsed = Math.max(0, parseInt(hintsUsed, 10) || 0);
  const isSolved = wasSolved === true;

  const parsedCorrectCount = Math.max(0, parseInt(correctCount, 10) || 0);
  
  // Calculate correctXp based on question difficulty:
  // Easy: +2 XP, Medium: +3 XP, Hard: +4 XP, Extra Hard: +5 XP
  let correctXp = 0;
  if (Array.isArray(results) && results.length > 0) {
    for (const item of results) {
      if (item && item.correct === true) {
        const diff = String(item.difficulty ?? '').toLowerCase().trim();
        if (diff === '0' || diff === 'easy') {
          correctXp += 2;
        } else if (diff === '1' || diff === 'medium') {
          correctXp += 3;
        } else if (diff === '2' || diff === 'hard') {
          correctXp += 4;
        } else if (diff === '3' || diff === 'extrahard' || diff === 'extra_hard' || diff === 'extra hard') {
          correctXp += 5;
        } else {
          // Fallback if difficulty is undefined or unrecognized
          // Games/drills (gk, vocab, cards, tatsavit) default to +2 XP (Easy)
          // Core lessons default to +3 XP (Medium)
          const isCheapConcept = ['vocab', 'gk', 'cards', 'tatsavit'].includes(String(concept || '').toLowerCase().trim());
          correctXp += isCheapConcept ? 2 : 3;
        }
      }
    }
  } else if (req.body && req.body.correctXp !== undefined && req.body.correctXp !== null) {
    // Respect explicit correctXp if passed (mainly for backward compatibility in tests)
    correctXp = Math.max(0, parseInt(req.body.correctXp, 10) || 0);
  } else {
    // Fallback default: parsedCorrectCount * 1 (keeps backward compatibility for test cases)
    correctXp = parsedCorrectCount;
  }

  // Scaled bonus: 50 base, minus 10 per hint used (down to 0).
  // Granted only if questionsCount >= 10.
  // A perfect 20-question lesson with 0 hints = +50 XP.
  // With 5 hints = +0 XP. With more than 5, still 0 (no penalty).
  // A lesson with 0 correct answers is failed and yields 0 bonus.
  // A lesson where 'Solve' was used is disqualified from receiving the bonus.
  const NO_HINT_BONUS = 50;
  const PER_HINT_PENALTY = 10;
  const bonusAmount = (!isSolved && qCount >= 10 && parsedCorrectCount > 0) ? Math.max(0, NO_HINT_BONUS - PER_HINT_PENALTY * hUsed) : 0;
  const bonusAwarded = bonusAmount > 0;

  // Perfect Score Bonus:
  // - If qCount > 30: +100 XP
  // - If qCount >= 20: +60 XP
  // - If qCount >= 10: +10 XP
  let perfectScoreBonus = 0;
  if (!isSolved && parsedCorrectCount === qCount) {
    if (qCount >= 30) {
      perfectScoreBonus = 100;
    } else if (qCount >= 20) {
      perfectScoreBonus = 60;
    } else if (qCount >= 10) {
      perfectScoreBonus = 10;
    }
  }
  const totalAward = correctXp + perfectScoreBonus + bonusAmount;

  const caller = tryDecodeUser(req);
  if (caller && mongoose.connection.readyState === 1) {
    try {
      const user = await auth.User.findById(caller.id);
      if (!user) {
        return res.json({
          success: true,
          guest: true,
          bonusAwarded,
          bonusAmount,
          correctXp,
          perfectScoreBonus,
          totalAward,
          wasSolved: isSolved
        });
      }
      // One bonus per concept per session. lessonsCompleted tracks every
      // concept for which we've already paid out. Avoids double-counting
      // when the client retried/fired on accidental double-submit.
      const alreadyPaid = Array.isArray(user.lessonsCompleted)
        ? user.lessonsCompleted.includes(concept)
        : false;

      let finalBonusAmount = bonusAmount;
      let finalBonusAwarded = bonusAwarded;
      let finalTotalAward = totalAward;

      if (alreadyPaid) {
        finalBonusAmount = 0;
        finalBonusAwarded = false;
        finalTotalAward = correctXp + perfectScoreBonus;
      }

      user.xp += finalTotalAward;
      if (!Array.isArray(user.lessonsCompleted)) user.lessonsCompleted = [];
      if (!alreadyPaid) {
        user.lessonsCompleted.push(concept);
      }
      user.lessonStats.push({
        concept,
        questionsCount: qCount,
        correctCount: parsedCorrectCount,
        hintsUsed: hUsed,
        bonusAwarded: finalBonusAwarded,
        perfectScoreBonusAwarded: perfectScoreBonus > 0,
        completedAt: new Date(),
      });
      await user.save();
      return res.json({
        success: true,
        balance: user.xp,
        bonusAwarded: finalBonusAwarded,
        bonusAmount: finalBonusAmount,
        correctXp,
        perfectScoreBonus,
        totalAward: finalTotalAward,
        alreadyCompleted: alreadyPaid,
        wasSolved: isSolved,
      });
    } catch (err) {
      console.error('[Hints] lesson-complete user path failed:', err);
    }
  }

  // Guest path: dedupe bonus per (identityKey, concept) using in-memory set.
  // Identity key prefers the decoded user id (if any), else falls back to the IP.
  const caller2 = tryDecodeUser(req);
  const ip2 = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || 'unknown';
  const dedupeKey = caller2 ? `u:${caller2.id}` : `ip:${ip2}`;
  const dedupeTag = `${dedupeKey}::${concept}`;

  let finalBonusAmount = bonusAmount;
  let finalBonusAwarded = bonusAwarded;
  let finalTotalAward = totalAward;
  let alreadyCompleted = false;

  if (guestLessonsCompleted.has(dedupeTag)) {
    finalBonusAmount = 0;
    finalBonusAwarded = false;
    finalTotalAward = correctXp + perfectScoreBonus;
    alreadyCompleted = true;
  } else {
    guestLessonsCompleted.add(dedupeTag);
  }

  return res.json({
    success: true,
    guest: true,
    bonusAwarded: finalBonusAwarded,
    bonusAmount: finalBonusAmount,
    correctXp,
    perfectScoreBonus,
    totalAward: finalTotalAward,
    alreadyCompleted,
    wasSolved: isSolved
  });
});

// POST /api/hints/merge-guest — fold localStorage XP into a fresh login.
// Idempotent. Body: { guestXp: number, source: 'localStorage' }
//
// Why this exists: the client tracks XP in localStorage while the user is a
// guest. When they log in, that XP would otherwise be silently overwritten by
// the server balance on the next /api/hints/xp fetch. With this endpoint, the
// client POSTs its guest XP, and we take the *max* (or sum — see below) of
// guest and server before saving.
//
// Merge policy:
//   - If user.xp < guestXp, raise user.xp to guestXp (no penalty for guesting).
//   - Always add a small "welcome back" bump of +25 XP the first time this is
//     called per account (one-shot, tracked via a flag on the user doc).
router.post('/merge-guest', auth.requireAuth, async (req, res) => {
  const guestXp = Math.max(0, parseInt((req.body || {}).guestXp, 10) || 0);
  if (mongoose.connection.readyState !== 1) {
    return res.json({ success: true, guest: true, balance: guestXp });
  }
  try {
    const user = await auth.User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'user_not_found' });

    const before = user.xp;
    let bonus = 0;
    if (!user.firstMergeDone) {
      bonus = 25;
      user.firstMergeDone = true;
    }
    user.xp = Math.max(user.xp, guestXp) + bonus;
    await user.save();

    return res.json({
      success: true,
      balance: user.xp,
      previousBalance: before,
      guestXpApplied: Math.max(0, user.xp - before - bonus),
      firstMergeBonus: bonus,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/hints/audit — aggregated hint-usage telemetry for the caller.
// Used by the parent/teacher dashboard (future). For now it returns raw data.
router.get('/audit', auth.requireAuth, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ success: true, guest: true });
  }
  try {
    const user = await auth.User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'user_not_found' });

    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentLogs = user.hintLogs.filter(l => l.unlockedAt >= last30Days);

    const byConcept = {};
    for (const log of recentLogs) {
      byConcept[log.concept] = (byConcept[log.concept] || 0) + 1;
    }
    const byLevel = { 1: 0, 2: 0, 3: 0 };
    for (const log of recentLogs) byLevel[log.level] = (byLevel[log.level] || 0) + 1;

    const lessonsCompleted = user.lessonStats.length;
    const noHintLessons = user.lessonStats.filter(s => s.bonusAwarded).length;
    const totalBonusXp = user.lessonStats
      .filter(s => s.bonusAwarded)
      .reduce((acc, s) => acc + 50 - 10 * s.hintsUsed, 0);

    return res.json({
      success: true,
      username: user.username,
      xp: user.xp,
      windowDays: 30,
      hintsUsed: recentLogs.length,
      hintsByConcept: byConcept,
      hintsByLevel: byLevel,
      lessonsCompleted,
      noHintLessons,
      totalBonusXp,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── v2 reward endpoints ────────────────────────────────────────────────────
// Correct answers award XP. Daily check-in awards XP.

// POST /api/hints/award-correct — +1 XP for a correct answer.
router.post('/award-correct', async (req, res) => {
  const { concept } = req.body || {};
  const caller = tryDecodeUser(req);

  if (!caller || mongoose.connection.readyState !== 1) {
    return res.json({ success: true, guest: true, delta: 1 });
  }

  try {
    const user = await auth.User.findById(caller.id);
    if (!user) return res.json({ success: true, guest: true, delta: 1 });

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = (user.correctStats || []).filter(s => s.at >= hourAgo).length;
    if (recentCount >= 200) {
      return res.json({
        success: true,
        balance: user.xp,
        delta: 0,
        throttled: true,
        limit: 200,
      });
    }

    user.xp += 1;
    if (!Array.isArray(user.correctStats)) user.correctStats = [];
    user.correctStats.push({ concept: concept || null, at: new Date() });
    if (user.correctStats.length > 500) {
      user.correctStats = user.correctStats.slice(-500);
    }
    await user.save();

    return res.json({ success: true, balance: user.xp, delta: 1 });
  } catch (err) {
    console.error('[Hints] award-correct user path failed:', err);
    return res.json({ success: true, guest: true, delta: 1 });
  }
});

// POST /api/hints/daily-checkin — +5 XP for the first open of a calendar day.
router.post('/daily-checkin', async (req, res) => {
  const caller = tryDecodeUser(req);
  if (!caller) {
    return res.json({ success: false, reason: 'login_required' });
  }
  if (mongoose.connection.readyState !== 1) {
    return res.json({ success: false, reason: 'offline' });
  }

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  try {
    const user = await auth.User.findById(caller.id);
    if (!user) return res.json({ success: false, reason: 'user_not_found' });

    if (user.lastDailyCheckin === today) {
      return res.json({
        success: true,
        balance: user.xp,
        delta: 0,
        alreadyCheckedIn: true,
        streak: user.dailyCheckinCount || 0,
      });
    }

    user.xp += 5;
    user.lastDailyCheckin = today;
    user.dailyCheckinCount = (user.dailyCheckinCount || 0) + 1;
    await user.save();

    return res.json({
      success: true,
      balance: user.xp,
      delta: 5,
      streak: user.dailyCheckinCount,
    });
  } catch (err) {
    console.error('[Hints] daily-checkin user path failed:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
