'use strict';
//
// server/lib/ledger.js — Atomic recordEvent() ledger writer (#90).
//
// All user coin, XP, and totalSolved mutations go through this function to
// ensure atomic update semantics ($inc, $push) in MongoDB. Concurrent
// requests (e.g. rapid quiz answers across tabs or retries) land their deltas
// without lost updates.

const mongoose = require('mongoose');
const auth = require('../auth');
const {
  coinsForCorrectAnswer,
  coinsForIncorrectAnswer,
  coinsForReviewCompletion,
  coinsForTopicBadge,
  coinsForCollectionCompletion,
  coinsForTransferWin,
  coinsForDailyCheckin,
  coinsForHintUnlock,
} = require('./scoring');

/**
 * Record a scoring event for a user and apply atomic DB updates.
 *
 * @param {string|mongoose.Types.ObjectId} userId - Target user ID
 * @param {Object} event - Scoring event descriptor
 * @param {string} event.type - Event type identifier
 * @param {number|string} [event.difficulty] - Quiz difficulty
 * @param {boolean} [event.speed] - Speed-run bonus flag
 * @param {string} [event.level] - Badge level for topic_badge
 * @param {Object} [event.collection] - Collection object for collection_completion
 * @param {number} [event.tier] - Hint tier (1..3) for hint_unlock
 * @param {string} [event.concept] - Concept key for hint_unlock
 * @param {string} [event.questionId] - Question ID for hint_unlock
 * @param {number} [event.levelNum] - Hint level number for hint_unlock
 * @param {Object} [event.milestone] - Milestone object to append
 * @param {number} [event.coins] - Explicit coins override (if type unknown)
 * @param {number} [event.xp] - Explicit xp override (if type unknown)
 * @returns {Promise<Object>} Updated user state and transaction summary
 */
async function recordEvent(userId, event = {}) {
  if (!userId) {
    throw new Error('recordEvent requires a valid userId');
  }

  const User = auth.User;
  let coinsDelta = 0;
  let xpDelta = 0;
  let isCorrectAttempt = false;

  switch (event.type) {
    case 'quiz_correct': {
      const reward = coinsForCorrectAnswer(event.difficulty, { speed: event.speed });
      coinsDelta = reward.coins;
      xpDelta = reward.xp;
      isCorrectAttempt = true;
      break;
    }
    case 'quiz_incorrect': {
      const reward = coinsForIncorrectAnswer();
      coinsDelta = reward.coins;
      xpDelta = reward.xp;
      break;
    }
    case 'review_completion': {
      const reward = coinsForReviewCompletion();
      coinsDelta = reward.coins;
      xpDelta = reward.xp;
      break;
    }
    case 'topic_badge': {
      const reward = coinsForTopicBadge(event.level);
      coinsDelta = reward.coins;
      xpDelta = reward.xp;
      break;
    }
    case 'collection_completion': {
      const reward = coinsForCollectionCompletion(event.collection);
      coinsDelta = reward.coins;
      xpDelta = reward.xp;
      break;
    }
    case 'transfer_win': {
      const reward = coinsForTransferWin();
      coinsDelta = reward.coins;
      xpDelta = reward.xp;
      break;
    }
    case 'daily_checkin': {
      const reward = coinsForDailyCheckin();
      coinsDelta = reward.coins;
      xpDelta = reward.xp;
      break;
    }
    case 'hint_unlock': {
      const cost = coinsForHintUnlock(event.tier);
      coinsDelta = -cost;
      xpDelta = 0;
      break;
    }
    default: {
      if (typeof event.coins === 'number') coinsDelta = event.coins;
      if (typeof event.xp === 'number') xpDelta = event.xp;
      if (event.isCorrect) isCorrectAttempt = true;
      break;
    }
  }

  // Check MongoDB connection state
  if (mongoose.connection.readyState !== 1) {
    // In-memory fallback mode (e.g. unit testing without mongod or dev mode fallback)
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        coinsEarned: coinsDelta,
        xpEarned: xpDelta,
        coins: 0,
        xp: 0,
        totalSolved: 0,
      };
    }

    user.coins = Math.max(0, (user.coins || 0) + coinsDelta);
    user.xp = Math.max(0, (user.xp || 0) + xpDelta);
    if (isCorrectAttempt) {
      user.totalSolved = (user.totalSolved || 0) + 1;
    }

    if (event.type === 'hint_unlock' && event.concept) {
      if (!user.hintLogs) user.hintLogs = [];
      user.hintLogs.push({
        concept: event.concept,
        questionId: event.questionId,
        level: event.levelNum,
        unlockedAt: new Date(),
      });
    }

    if (event.milestone) {
      if (!user.milestones) user.milestones = [];
      user.milestones.push(event.milestone);
    }

    await user.save();
    return {
      success: true,
      user,
      coinsEarned: coinsDelta,
      xpEarned: xpDelta,
      coins: user.coins,
      xp: user.xp,
      totalSolved: user.totalSolved,
    };
  }

  // Atomic update payload for MongoDB
  const update = {};
  const inc = {};

  if (coinsDelta !== 0) inc.coins = coinsDelta;
  if (xpDelta !== 0) inc.xp = xpDelta;
  if (isCorrectAttempt) inc.totalSolved = 1;

  if (Object.keys(inc).length > 0) {
    update.$inc = inc;
  }

  const push = {};
  if (event.type === 'hint_unlock' && event.concept) {
    push.hintLogs = {
      concept: event.concept,
      questionId: event.questionId,
      level: event.levelNum,
      unlockedAt: new Date(),
    };
  }
  if (event.milestone) {
    push.milestones = event.milestone;
  }

  if (Object.keys(push).length > 0) {
    update.$push = push;
  }

  // Execute atomic read-modify-write in MongoDB
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    update,
    { returnDocument: 'after' }
  );

  return {
    success: !!updatedUser,
    user: updatedUser,
    coinsEarned: coinsDelta,
    xpEarned: xpDelta,
    coins: updatedUser ? updatedUser.coins : 0,
    xp: updatedUser ? updatedUser.xp : 0,
    totalSolved: updatedUser ? updatedUser.totalSolved : 0,
  };
}

module.exports = { recordEvent };
