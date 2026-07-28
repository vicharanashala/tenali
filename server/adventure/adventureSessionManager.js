/**
 * TENALI ADVENTURE GAME - SESSION MANAGER
 * ══════════════════════════════════════════════════════════════════════
 * Manages active level sessions in-memory with clue history, hint tracking,
 * and elapsed playing time telemetry.
 */

'use strict';

const crypto = require('crypto');
const config = require('./adventureConfig');

const sessions = new Map();

/**
 * Periodically cleans up expired sessions.
 */
function cleanExpiredSessions() {
  const now = Date.now();
  for (const [id, sess] of sessions.entries()) {
    if (now - sess.lastActiveAt > config.SESSION_TIMEOUT_MS) {
      sessions.delete(id);
    }
  }
}

const cleanupTimer = setInterval(cleanExpiredSessions, 10 * 60 * 1000);
if (typeof cleanupTimer.unref === 'function') {
  cleanupTimer.unref();
}

module.exports = {
  createSession: ({ userId, levelId, conceptId, isBoss }) => {
    const sessionId = `adv_sess_${crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(12).toString('hex')}`;
    const now = Date.now();

    const session = {
      sessionId,
      userId: userId || null,
      levelId,
      conceptId,
      isBoss: !!isBoss,
      currentClueIndex: 0,
      revealedClues: [],
      hintsUsed: [],
      startedAt: now,
      lastActiveAt: now,
      completed: false,
      outcome: null
    };

    sessions.set(sessionId, session);
    return session;
  },

  getSession: (sessionId) => {
    const session = sessions.get(sessionId);
    if (session) {
      session.lastActiveAt = Date.now();
    }
    return session || null;
  },

  updateSession: (sessionId, updates) => {
    const session = sessions.get(sessionId);
    if (!session) return null;
    Object.assign(session, updates, { lastActiveAt: Date.now() });
    return session;
  },

  endSession: (sessionId, outcome) => {
    const session = sessions.get(sessionId);
    if (!session) return null;
    session.completed = true;
    session.outcome = outcome;
    session.endedAt = Date.now();
    session.elapsedSeconds = Math.round((session.endedAt - session.startedAt) / 1000);
    return session;
  },

  deleteSession: (sessionId) => {
    sessions.delete(sessionId);
  },

  _sessionsMap: sessions // Exposed for unit tests
};
