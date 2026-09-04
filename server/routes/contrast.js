const express = require('express');
const { requireAuth, ContrastProgress } = require('../auth');
const router = express.Router();

// GET /contrast-api/progress - Retrieve authenticated user's progress
router.get('/progress', requireAuth, async (req, res) => {
  try {
    let progress = await ContrastProgress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = {
        completedModules: [],
        unlockedPairs: [],
        seenPairs: [],
        completedPairs: []
      };
    }
    res.json({ success: true, progress });
  } catch (err) {
    console.error('[contrast] GET /progress error:', err);
    res.status(500).json({ error: 'Failed to fetch contrast progress' });
  }
});

// POST /contrast-api/progress - Update authenticated user's progress
router.post('/progress', requireAuth, async (req, res) => {
  const { completedModules, unlockedPairs, seenPairs, completedPairs } = req.body;
  try {
    let progress = await ContrastProgress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = new ContrastProgress({ userId: req.user.id });
    }

    if (completedModules !== undefined) progress.completedModules = completedModules;
    if (unlockedPairs !== undefined) progress.unlockedPairs = unlockedPairs;
    if (seenPairs !== undefined) progress.seenPairs = seenPairs;
    if (completedPairs !== undefined) progress.completedPairs = completedPairs;

    progress.updatedAt = Date.now();
    await progress.save();
    res.json({ success: true, progress });
  } catch (err) {
    console.error('[contrast] POST /progress error:', err);
    res.status(500).json({ error: 'Failed to update contrast progress' });
  }
});

module.exports = router;
