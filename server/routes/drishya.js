const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../auth');
const SkillMasteryState = require('../models/SkillMasteryState');
const { bktUpdate } = require('../lib/bkt');

// Load content once at startup
const contentPath = path.join(__dirname, '..', 'data', 'drishyaContent.json');
let content = [];
try {
  if (fs.existsSync(contentPath)) {
    content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    console.log(`[drishya] loaded ${content.length} content items`);
  } else {
    console.error(`[drishya] drishyaContent.json not found at ${contentPath}`);
  }
} catch (err) {
  console.error('[drishya] failed to load drishyaContent.json:', err.message);
}

/**
 * GET /drishya-api/items
 * Returns all image-description records.
 */
router.get('/items', (req, res) => {
  res.json(content);
});

/**
 * GET /drishya-api/mastery
 * Returns empty array since mastery tracking is disabled.
 */
router.get('/mastery', (req, res) => {
  res.json([]);
});

// Helper for normalization
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
    .replace(/\s+/g, " ");
}

// Helper to check if a keyword matches learner text (with basic stem support)
function matchesKeyword(text, keyword) {
  const normText = normalizeText(text);
  const normKeyword = normalizeText(keyword);
  if (normText.includes(normKeyword)) return true;

  const stem = (w) => w.replace(/(ing|ed|s|es|ly)$/, '');
  const textWords = normText.split(' ').map(stem);
  const keywordWords = normKeyword.split(' ').map(stem);

  return keywordWords.every(kwWord =>
    textWords.some(tWord => tWord.includes(kwWord) || kwWord.includes(tWord))
  );
}

// Helper for heuristic verb checking
function hasVerb(text) {
  const normText = normalizeText(text);
  const words = normText.split(' ');
  const commonVerbs = new Set([
    'is', 'are', 'am', 'was', 'were', 'has', 'have', 'had', 'do', 'does', 'did',
    'run', 'runs', 'running', 'eat', 'eats', 'eating', 'play', 'plays', 'playing',
    'walk', 'walks', 'walking', 'draw', 'draws', 'drawing', 'paint', 'paints', 'painting',
    'sing', 'sings', 'singing', 'sleep', 'sleeps', 'sleeping', 'brush', 'brushes', 'brushing',
    'clean', 'cleans', 'cleaning', 'watch', 'watches', 'watching', 'look', 'looks', 'looking',
    'see', 'sees', 'seeing', 'catch', 'catches', 'catching', 'rain', 'rains', 'raining',
    'fly', 'flies', 'flying', 'ride', 'rides', 'riding', 'drive', 'drives', 'driving',
    'swim', 'swims', 'swimming', 'study', 'studies', 'studying', 'write', 'writes', 'writing',
    'go', 'goes', 'going', 'come', 'comes', 'coming', 'sit', 'sits', 'sitting', 'stand', 'stands', 'standing',
    'describe', 'describes', 'describing', 'climb', 'climbs', 'climbing', 'hold', 'holds', 'holding',
    'pointing', 'point', 'points', 'wear', 'wears', 'wearing'
  ]);

  for (const w of words) {
    if (commonVerbs.has(w)) return true;
    if (w.endsWith('ing') && w.length > 4) return true;
    if (w.endsWith('ed') && w.length > 3) return true;
  }
  return false;
}

/**
 * POST /drishya-api/check
 * Algorithmic, rule-based check of a learner's answer and BKT mastery state updates.
 */
router.post('/check', express.json(), async (req, res) => {
  const { itemId, exerciseType, answer } = req.body;

  const item = content.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  let isCorrect = false;
  let score = 0;
  let feedback = '';
  let coreMatched = [];
  let bonusMatched = [];

  if (exerciseType === 'mcq') {
    const userAns = normalizeText(answer);
    const correctAns = normalizeText(item.mcq.correct || item.primaryWord);
    const accepted = (item.acceptedAnswers || []).map(normalizeText);
    isCorrect = userAns === correctAns || accepted.includes(userAns);
    score = isCorrect ? 100 : 0;
    feedback = isCorrect ? 'Correct!' : `Incorrect. The correct answer is "${item.mcq.correct || item.primaryWord}".`;
  }
  else if (exerciseType === 'fillBlank') {
    const userAns = normalizeText(answer);
    const blankAnswers = (item.fillBlank.blankAnswers || []).map(normalizeText);
    const accepted = (item.acceptedAnswers || []).map(normalizeText);
    isCorrect = blankAnswers.includes(userAns) || accepted.includes(userAns);
    score = isCorrect ? 100 : 0;
    feedback = isCorrect ? 'Correct!' : 'Incorrect. Try again!';
  }
  else if (exerciseType === 'matching') {
    const userAns = normalizeText(answer);
    const correctAns = normalizeText(item.matching.word || item.primaryWord);
    const accepted = (item.acceptedAnswers || []).map(normalizeText);
    isCorrect = userAns === correctAns || accepted.includes(userAns);
    score = isCorrect ? 100 : 0;
    feedback = isCorrect ? 'Correct!' : 'Incorrect.';
  }
  else if (exerciseType === 'oddOneOut') {
    isCorrect = (answer === itemId);
    score = isCorrect ? 100 : 0;
    feedback = isCorrect ? 'Correct!' : 'Incorrect.';
  }
  else if (exerciseType === 'guided') {
    const text = answer || '';
    const guided = item.guidedDescription || {};
    const core = (guided.keywords && guided.keywords.core) || [];
    const bonus = (guided.keywords && guided.keywords.bonus) || [];
    const minWords = guided.minWords || 0;

    const words = normalizeText(text).split(' ').filter(w => w.length > 0);
    const wordCount = words.length;

    const coreUnmatched = [];
    for (const kw of core) {
      if (matchesKeyword(text, kw)) {
        coreMatched.push(kw);
      } else {
        coreUnmatched.push(kw);
      }
    }

    for (const kw of bonus) {
      if (matchesKeyword(text, kw)) {
        bonusMatched.push(kw);
      }
    }

    const totalPossibleWeight = (core.length * 2) + (bonus.length * 1);
    const earnedWeight = (coreMatched.length * 2) + (bonusMatched.length * 1);
    score = totalPossibleWeight > 0 ? Math.round((earnedWeight / totalPossibleWeight) * 100) : 0;

    if (wordCount < minWords) {
      isCorrect = false;
      feedback = `Your description is too short. Try to write at least ${minWords} words (you wrote ${wordCount}).`;
      score = Math.max(0, score - 20);
    } else {
      const coreRatio = core.length > 0 ? coreMatched.length / core.length : 1;
      isCorrect = coreRatio >= 0.5 && score >= 50;

      if (coreRatio >= 1.0) {
        feedback = `Excellent! You used all ${coreMatched.length} key words and described the image perfectly.`;
      } else if (coreRatio >= 0.7) {
        feedback = `Great job! You used ${coreMatched.length}/${core.length} key words. Try adding: ${coreUnmatched.slice(0, 2).join(', ')}.`;
      } else if (coreRatio >= 0.4) {
        feedback = `Good start! You used ${coreMatched.length}/${core.length} key words. Can you mention: ${coreUnmatched.slice(0, 2).join(', ')}?`;
      } else {
        feedback = `Look closely at the image. Try using key words like: ${core.slice(0, 3).join(', ')}.`;
      }
    }
  }
  else if (exerciseType === 'free') {
    const text = answer || '';
    const free = item.freeDescription || {};
    const core = (free.keywords && free.keywords.core) || [];
    const bonus = (free.keywords && free.keywords.bonus) || [];
    const minWords = free.minWords || 0;
    const requiresVerb = free.requiresVerb || false;

    const words = normalizeText(text).split(' ').filter(w => w.length > 0);
    const wordCount = words.length;

    const coreUnmatched = [];
    for (const kw of core) {
      if (matchesKeyword(text, kw)) {
        coreMatched.push(kw);
      } else {
        coreUnmatched.push(kw);
      }
    }

    for (const kw of bonus) {
      if (matchesKeyword(text, kw)) {
        bonusMatched.push(kw);
      }
    }

    const totalPossibleWeight = (core.length * 2) + (bonus.length * 1);
    const earnedWeight = (coreMatched.length * 2) + (bonusMatched.length * 1);
    score = totalPossibleWeight > 0 ? Math.round((earnedWeight / totalPossibleWeight) * 100) : 0;

    const verbDetected = hasVerb(text);

    if (wordCount < minWords) {
      isCorrect = false;
      feedback = `Your description is too short. Try to write at least ${minWords} words (you wrote ${wordCount}).`;
      score = Math.max(0, score - 20);
    } else if (requiresVerb && !verbDetected) {
      isCorrect = false;
      feedback = `Try adding an action word (verb) like 'running', 'playing', or 'is' to describe what is happening.`;
      score = Math.max(0, score - 15);
    } else {
      const coreRatio = core.length > 0 ? coreMatched.length / core.length : 1;
      isCorrect = coreRatio >= 0.5 && score >= 50;

      if (coreRatio >= 1.0) {
        feedback = `Excellent! You used all ${coreMatched.length} key words and described the image perfectly.`;
      } else if (coreRatio >= 0.7) {
        feedback = `Great job! You used ${coreMatched.length}/${core.length} key words. Try adding: ${coreUnmatched.slice(0, 2).join(', ')}.`;
      } else if (coreRatio >= 0.4) {
        feedback = `Good start! You used ${coreMatched.length}/${core.length} key words. Can you mention: ${coreUnmatched.slice(0, 2).join(', ')}?`;
      } else {
        feedback = `Look closely at the image. Try using key words like: ${core.slice(0, 3).join(', ')}.`;
      }
    }
  }

  res.json({
    success: true,
    isCorrect,
    score,
    feedback,
    coreMatched,
    bonusMatched
  });
});

module.exports = router;
