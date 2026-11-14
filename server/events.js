/**
 * events.js — lightweight engagement logging for the Why Layer features
 * (Why-learn-this opens, unlock-chip clicks, map opens, checkpoint passes).
 *
 * Reuses the existing LearningEvent model and emit() helper — this is not
 * a new analytics system, just the first thing that actually calls a
 * write path that already existed with nothing writing to it, same shape
 * as mastery.js was for ConceptMastery before /api/mastery existed.
 */

const express = require('express');
const { requireAuth } = require('./auth');
const eventGenerator = require('./lil/eventGenerator');

const router = express.Router();

// The client sends these, so they are bounded before anything reaches the
// database: a short snake_case event name, a short topic id, and a small
// plain-object details payload.
const EVENT_TYPE_RE = /^[a-z][a-z0-9_]{0,47}$/;
const TOPIC_ID_RE = /^[a-z0-9_-]{1,64}$/;
const MAX_DETAILS_BYTES = 2048;

router.post('/', requireAuth, async (req, res) => {
  const { eventType, topicId, details } = req.body || {};
  if (typeof eventType !== 'string' || !EVENT_TYPE_RE.test(eventType)) {
    return res.status(400).json({ error: 'eventType must be a short snake_case name' });
  }
  if (topicId != null && (typeof topicId !== 'string' || !TOPIC_ID_RE.test(topicId))) {
    return res.status(400).json({ error: 'topicId must be a short topic id' });
  }
  if (details != null && (typeof details !== 'object' || Array.isArray(details) ||
      JSON.stringify(details).length > MAX_DETAILS_BYTES)) {
    return res.status(400).json({ error: `details must be an object under ${MAX_DETAILS_BYTES} bytes` });
  }
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.json({ ok: true, logged: false, reason: 'no-db' });
    }
    await eventGenerator.emit(req.user.id, eventType, topicId || null, details || {});
    res.json({ ok: true, logged: true });
  } catch (err) {
    console.error('[events] emit failed:', err.message);
    // Telemetry must never break the feature it's watching.
    res.json({ ok: true, logged: false, reason: 'error' });
  }
});

module.exports = { router };
