/**
 * TENALI MIND READER — CHALLENGE SERVICE
 * ══════════════════════════════════════════════════════════════════════
 *
 * Implements the backend logic for the "You Guess" (Challenge Mode) game.
 * Performs concept selection, cryptographic token handling (JWT), question
 * answering based on the KB, guess validation, and event emission.
 */

'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { QUESTIONS, CONCEPTS } = require('./mindReaderKB');
const CHALLENGE_CONFIG = require('./challengeConfig');
const mindReaderEvents = require('./mindReaderEvents');

const JWT_SECRET = process.env.JWT_SECRET || 'tenali-dev-secret-change-me';

// Cache for settled JTIs to prevent replay attacks (jti -> exp timestamp in ms)
const settledJtis = new Map();

/**
 * Periodically cleans up expired JTIs from the replay prevention cache.
 */
function cleanExpiredJtis() {
  const now = Date.now();
  for (const [jti, exp] of settledJtis.entries()) {
    if (exp < now) {
      settledJtis.delete(jti);
    }
  }
}

// Start cache cleanup timer (unref so it doesn't block server tests)
const cleanupInterval = setInterval(cleanExpiredJtis, 10 * 60 * 1000);
if (typeof cleanupInterval.unref === 'function') {
  cleanupInterval.unref();
}

/**
 * Filters the CONCEPTS list by a given scope.
 *
 * @param {string} scopeType - curriculum | subject | chapter | lesson
 * @param {string} scopeValue - The identifier/value of the scope
 * @returns {Object[]} Matching concept objects
 */
function filterConceptsByScope(scopeType, scopeValue) {
  if (!scopeType || scopeType === 'curriculum') {
    return CONCEPTS;
  }
  if (scopeType === 'subject' && scopeValue) {
    return CONCEPTS.filter(c => c.subject.toLowerCase() === scopeValue.toLowerCase());
  }
  if (scopeType === 'chapter' && scopeValue) {
    return CONCEPTS.filter(c => String(c.chapter) === String(scopeValue));
  }
  if (scopeType === 'lesson' && scopeValue) {
    return CONCEPTS.filter(
      c => c.lessonId.toLowerCase() === scopeValue.toLowerCase() ||
           `${c.chapter}_${c.lessonId}`.toLowerCase() === scopeValue.toLowerCase()
    );
  }
  return [];
}

/**
 * Computes which questions best distinguish the correct concept from all
 * other candidates in the selected scope.
 *
 * @param {Object} targetConcept - The target concept object
 * @param {string} scopeType - curriculum | subject | chapter | lesson
 * @param {string} scopeValue - The scope value
 * @returns {Object[]} Array of top-3 discriminative questions
 */
function getDiscriminativeQuestions(targetConcept, scopeType, scopeValue) {
  const scopeConcepts = filterConceptsByScope(scopeType, scopeValue);
  const otherConcepts = scopeConcepts.filter(c => c.id !== targetConcept.id);
  if (otherConcepts.length === 0) return [];

  const scored = QUESTIONS.map(q => {
    const targetAns = targetConcept.answers[q.id];
    let diffCount = 0;
    for (const other of otherConcepts) {
      if (other.answers[q.id] !== targetAns) {
        diffCount++;
      }
    }
    const score = diffCount / otherConcepts.length;
    return { q, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(entry => ({
      id: entry.q.id,
      text: entry.q.text,
      score: entry.score,
      expectedAnswer: targetConcept.answers[entry.q.id] === true ? 'yes' : (targetConcept.answers[entry.q.id] === false ? 'no' : 'dontknow')
    }));
}

/**
 * Service API Methods
 */
const challengeService = {
  // Expose the cache map for unit test validation
  _settledJtis: settledJtis,

  /**
   * Retrieves safe metadata for the client to construct scopes and available questions.
   */
  getMetadata() {
    const safeConcepts = CONCEPTS.map(c => ({
      id: c.id,
      name: c.name,
      subject: c.subject,
      chapter: c.chapter,
      lessonId: c.lessonId
    }));
    
    const uniqueChapters = Array.from(new Set(CONCEPTS.map(c => c.chapter).filter(Boolean))).sort((a, b) => a - b);
    const uniqueSubjects = Array.from(new Set(CONCEPTS.map(c => c.subject).filter(Boolean))).sort();

    return {
      concepts: safeConcepts,
      questions: QUESTIONS,
      scopes: {
        grade: uniqueChapters,
        category: uniqueSubjects
      }
    };
  },

  /**
   * Initiates a new challenge game session, choosing a concept and returning a JWT.
   */
  startChallenge(scopeType, scopeValue, maxQuestions) {
    const candidates = filterConceptsByScope(scopeType, scopeValue);
    if (candidates.length === 0) {
      const error = new Error('No candidate concepts found for the selected scope.');
      error.statusCode = 400;
      throw error;
    }

    const secretConcept = candidates[Math.floor(Math.random() * candidates.length)];
    const limit = parseInt(maxQuestions, 10) || CHALLENGE_CONFIG.defaultMaxQuestions;
    const jti = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');

    // Create session JWT token with explicit claims
    const token = jwt.sign(
      {
        jti,
        conceptId: secretConcept.id,
        scopeType,
        scopeValue,
        maxQuestions: limit
      },
      JWT_SECRET,
      { expiresIn: CHALLENGE_CONFIG.jwtExpiry }
    );

    return {
      token,
      candidates: candidates.map(c => ({ id: c.id, name: c.name, answers: c.answers })),
      maxQuestions: limit
    };
  },

  /**
   * Asks Tenali a Yes/No/Don't Know question based on the token.
   */
  askQuestion(token, questionId) {
    if (!token || !questionId) {
      const error = new Error('Session token and question ID are required.');
      error.statusCode = 400;
      throw error;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      const error = new Error('Invalid or expired session token.');
      error.statusCode = 401;
      throw error;
    }

    if (settledJtis.has(decoded.jti)) {
      const error = new Error('This game session has already concluded.');
      error.statusCode = 409;
      throw error;
    }

    const concept = CONCEPTS.find(c => c.id === decoded.conceptId);
    if (!concept) {
      const error = new Error('Secret concept not found.');
      error.statusCode = 404;
      throw error;
    }

    const rawAns = concept.answers[questionId];
    const answer = rawAns === true ? 'yes' : (rawAns === false ? 'no' : 'dontknow');

    return { answer };
  },

  /**
   * Validates a concept guess and ends the game if correct or forced.
   */
  guessConcept(token, guessConceptId, questionsCount, forceEnd, userContext) {
    if (!token) {
      const error = new Error('Session token is required.');
      error.statusCode = 400;
      throw error;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      const error = new Error('Invalid or expired session token.');
      error.statusCode = 401;
      throw error;
    }

    if (settledJtis.has(decoded.jti)) {
      const error = new Error('This game session has already concluded.');
      error.statusCode = 409;
      throw error;
    }

    const concept = CONCEPTS.find(c => c.id === decoded.conceptId);
    if (!concept) {
      const error = new Error('Secret concept not found.');
      error.statusCode = 404;
      throw error;
    }

    const correct = concept.id === guessConceptId;
    const isOver = correct || forceEnd || parseInt(questionsCount, 10) >= decoded.maxQuestions;

    if (isOver) {
      // Mark token as settled in replay cache
      settledJtis.set(decoded.jti, (decoded.exp || (Math.floor(Date.now() / 1000) + 1800)) * 1000);

      const outcome = correct ? 'win' : 'loss';
      
      const resultCollector = {
        mrr: 1000,
        mindReaderGamesToday: 0,
        unlockedSkins: ["Classic Tenali"],
        equippedSkin: 'classic',
        equippedTitle: 'Novice Reader',
        authenticated: false
      };

      // Decouple rating and analytics: emit completion event
      mindReaderEvents.emit('challengeCompleted', {
        userContext,
        outcome,
        concept,
        questionsCount: parseInt(questionsCount, 10) || 0,
        scopeType: decoded.scopeType,
        scopeValue: decoded.scopeValue,
        resultCollector
      });

      // Compute discriminative key clues
      const bestQuestions = getDiscriminativeQuestions(concept, decoded.scopeType, decoded.scopeValue);

      return {
        correct,
        ended: true,
        concept,
        bestQuestions,
        result: resultCollector
      };
    }

    return {
      correct: false,
      ended: false
    };
  }
};

module.exports = challengeService;
