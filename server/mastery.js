/**
 * mastery.js — read-only access to ConceptMastery records.
 *
 * ConceptMastery (server/lil/models.js) is already written automatically
 * by the global response-intercepting middleware on every `/<topic>-api/*`
 * interaction (see server/index.js). Nothing previously read it back out —
 * this adds the missing GET so the client can ask "what has this student
 * mastered?" (used by the Learning Journey "why/unlocks" view, and later
 * by the standalone Learning Map).
 */

const express = require('express');
const { requireAuth } = require('./auth');
const { ConceptMastery } = require('./lil/models');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    // Without a database nothing can be read, which is not the same as
    // "nothing mastered". An empty list here would show a returning student
    // zero progress as if it were real, so say it is unavailable instead.
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Mastery is unavailable right now' });
    }
    const records = await ConceptMastery.find({ userId: req.user.id });
    res.json({ mastery: records.map(r => ({ topicId: r.topicId, isMastered: r.isMastered })) });
  } catch (err) {
    console.error('[mastery] fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch mastery' });
  }
});

module.exports = { router };
