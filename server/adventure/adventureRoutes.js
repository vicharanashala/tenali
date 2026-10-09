/**
 * TENALI ADVENTURE GAME - API ROUTES
 * ══════════════════════════════════════════════════════════════════════
 * Express REST API route definitions mounted under /api/adventure.
 */

'use strict';

const express = require('express');
const router = express.Router();
const adventureService = require('./adventureService');

// Middleware to extract guest progress payload from request headers
function extractGuestProgress(req) {
  try {
    const raw = req.get('x-guest-progress');
    return raw ? JSON.parse(raw) : null;
  } catch (_e) {
    return null;
  }
}

// Middleware to get optional authenticated user context (reused from server auth)
async function getOptionalUserContext(req) {
  if (req.user) return req.user;
  const authHeader = req.get('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!match) return null;

  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'tenali-dev-secret-change-me';
    const payload = jwt.verify(match[1], JWT_SECRET);

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      const auth = require('../auth');
      const user = await auth.User.findById(payload.sub);
      if (user) return user;
    }
  } catch (_e) { }
  return null;
}

// GET /api/adventure/config — Retrieves worlds, levels, and user progress summary
router.get('/config', async (req, res) => {
  try {
    const userContext = await getOptionalUserContext(req);
    const guestProgress = extractGuestProgress(req);
    const data = await adventureService.getGameData(userContext, guestProgress);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// GET /api/adventure/continue — Finds next uncompleted level to continue
router.get('/continue', async (req, res) => {
  try {
    const userContext = await getOptionalUserContext(req);
    const guestProgress = extractGuestProgress(req);
    const data = await adventureService.getContinueLevel(userContext, guestProgress);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/adventure/start — Starts level gameplay session
router.post('/start', express.json(), async (req, res) => {
  const { levelId } = req.body;
  try {
    const userContext = await getOptionalUserContext(req);
    const sessionData = await adventureService.startLevel(userContext, levelId);
    res.json(sessionData);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/adventure/next-clue — Requests next clue for active session
router.post('/next-clue', express.json(), async (req, res) => {
  const { sessionId } = req.body;
  try {
    const clueData = await adventureService.getNextClue(sessionId);
    res.json(clueData);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/adventure/hint — Requests hint for active session
router.post('/hint', express.json(), async (req, res) => {
  const { sessionId } = req.body;
  try {
    const hintData = await adventureService.getHint(sessionId);
    res.json(hintData);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/adventure/guess — Validates concept guess
router.post('/guess', express.json(), async (req, res) => {
  const { sessionId, guessConceptId } = req.body;
  try {
    const userContext = await getOptionalUserContext(req);
    const guestProgress = extractGuestProgress(req) || req.body.guestProgress;
    const result = await adventureService.submitGuess(sessionId, guessConceptId, userContext, guestProgress);
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

module.exports = router;
