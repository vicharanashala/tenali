'use strict';
// Central reward rule-book for Tenali (issue #88).
//
// One file, one definition of "how much is X worth". Every code path that
// wants to know "how many coins/XP does this action earn?" calls into here.
// No Mongoose, no I/O — these are pure functions so they can be unit-tested
// in isolation and so the wire-in PRs (#90/#91/#92) can compose them with
// atomic storage without leaking rules into request handlers.
//
// Value provenance. The numbers below are consolidated from the rewards
// that are *already* paid out in the scattered call sites today:
//
//   server/lil/studentState.js        — 10 coins + 10 XP per correct answer
//                                       (any difficulty), 20 coins for speed-run,
//                                       0 coins + 2 XP on a wrong answer
//   server/routes/review.js           — 15 coins + 15 XP per review completion
//   server/index.js#evaluateCollections — collection coinReward (per JSON)
//   server/hints/hintSpecs.js#COSTS   — 5/8/10 coins for hint tier 1/2/3
//   server/hints/index.js             — +5 XP for daily check-in (0 coins)
//   server/index.js (POST /api/progress) — streak thresholds [3, 7, 15, 30]
//   server/progress.js                — no coin/XP awarded on badge unlock today
//   client/src/App.jsx                — 150 coins for transfer-challenge win
//
// Wiring rule changes go through this file only. Anything outside this file
// that mutates user.coins/user.xp is by definition a regression.

const DIFFICULTY_KEYS = Object.freeze(['easy', 'medium', 'hard', 'extrahard']);

// ── Reward tables ────────────────────────────────────────────────────────────
// Each entry is `{ coins, xp }` (or `{ coins }` for debits). Tables are
// frozen so accidental mutation throws in strict mode.

const REWARD_RULES = Object.freeze({
  // Standard checked-quiz module: correct answer at the given difficulty.
  // Today server/lil/studentState.js pays 10 coins + 10 XP regardless of
  // difficulty (and the per-difficulty dimension isn't yet honored); the
  // keyed shape is preserved so the table is ready for #91 to start
  // differentiating values once the server takes over the tally.
  QUIZ_CORRECT: Object.freeze({
    easy:      Object.freeze({ coins: 10, xp: 10 }),
    medium:    Object.freeze({ coins: 10, xp: 10 }),
    hard:      Object.freeze({ coins: 10, xp: 10 }),
    extrahard: Object.freeze({ coins: 10, xp: 10 }),
  }),
  // Speed-run multiplier: 2× coins, same XP — matches server/lil/studentState.
  QUIZ_CORRECT_SPEED: Object.freeze({
    easy:      Object.freeze({ coins: 20, xp: 10 }),
    medium:    Object.freeze({ coins: 20, xp: 10 }),
    hard:      Object.freeze({ coins: 20, xp: 10 }),
    extrahard: Object.freeze({ coins: 20, xp: 10 }),
  }),
  // Effort XP on a wrong answer (no coins) — matches server/lil/studentState.
  QUIZ_INCORRECT: Object.freeze({ coins: 0, xp: 2 }),

  // Topic badge unlocks on /api/progress POST when the level goes up.
  // Today server/progress.js does not award any coin/XP on a level change,
  // so every level resolves to zero reward; #91 may revisit this.
  TOPIC_BADGE: Object.freeze({
    started: Object.freeze({ coins: 0, xp: 0 }),
    bronze:  Object.freeze({ coins: 0, xp: 0 }),
    silver:  Object.freeze({ coins: 0, xp: 0 }),
    gold:    Object.freeze({ coins: 0, xp: 0 }),
  }),

  // Completing an entire collection (every topic in it at gold).
  // Per-collection override still wins (collections.json#coinReward);
  // this is the fallback when a collection omits the field.
  COLLECTION_DEFAULT_COIN_REWARD: 100,

  // Spaced-repetition ladder review completion (server/routes/review.js).
  REVIEW_COMPLETION: Object.freeze({ coins: 15, xp: 15 }),

  // Transfer challenge win (client/src/App.jsx — only call site today).
  TRANSFER_WIN: Object.freeze({ coins: 150, xp: 0 }),

  // Daily check-in bonus (server/hints/index.js#checkin).
  DAILY_CHECKIN: Object.freeze({ coins: 0, xp: 5 }),

  // Hint unlock cost — debits the user. Mirrors COSTS in hintSpecs.js.
  HINT_UNLOCK: Object.freeze({
    tier1: 5,
    tier2: 8,
    tier3: 10,
  }),

  // Streak milestones — badge-only (non-monetary). Listed here so there's
  // one place to look when tuning.
  STREAK_MILESTONES: Object.freeze([3, 7, 15, 30]),
});

// ── Milestone event-name strings ─────────────────────────────────────────────
// Centralized so /api/milestones writes strings that match what the dashboard
// expects to read back.
const MILESTONE_EVENTS = Object.freeze({
  JOINED: 'Joined Tenali',
  STREAK_PREFIX: 'Reached a',
  TOPIC_STARTED: (name) => `Started ${name}`,
  TOPIC_BRONZE:  (name) => `Unlocked Bronze in ${name}`,
  TOPIC_SILVER:  (name) => `Unlocked Silver in ${name}`,
  TOPIC_GOLD:    (name) => `Unlocked Gold in ${name}`,
  COLLECTION:    (collectionName) => `Mastered ${collectionName}`,
});

// ── Pure helpers ─────────────────────────────────────────────────────────────

// Map a difficulty value (number 0..3 or string key) to a stable key. Out-
// of-range inputs collapse to 'easy' so the reward is always defined.
function difficultyKey(difficulty) {
  if (typeof difficulty === 'number' && Number.isFinite(difficulty)) {
    const idx = Math.max(0, Math.min(3, Math.trunc(difficulty)));
    return DIFFICULTY_KEYS[idx];
  }
  const key = String(difficulty || '').toLowerCase();
  return DIFFICULTY_KEYS.includes(key) ? key : 'easy';
}

function cloneReward(reward) {
  return { coins: reward.coins, xp: reward.xp };
}

// Coins/XP awarded for a correct-answer event in a standard quiz module.
//   difficulty — 0/1/2/3 or 'easy'/'medium'/'hard'/'extrahard'
//   options.speed — true to apply the 2× speed-run bonus
function coinsForCorrectAnswer(difficulty = 0, options = {}) {
  const table = options.speed ? REWARD_RULES.QUIZ_CORRECT_SPEED : REWARD_RULES.QUIZ_CORRECT;
  const key = difficultyKey(difficulty);
  return cloneReward(table[key]);
}

// Coins/XP awarded for a wrong-answer event (effort XP only).
function coinsForIncorrectAnswer() {
  return cloneReward(REWARD_RULES.QUIZ_INCORRECT);
}

// Coins debited when the user unlocks a hint at the given tier (1/2/3).
// Returns a positive number — the caller is responsible for subtracting.
function coinsForHintUnlock(tier) {
  const t = Math.max(1, Math.min(3, Number(tier) || 1));
  return REWARD_RULES.HINT_UNLOCK[`tier${t}`];
}

// Reward for completing a spaced-repetition review session.
function coinsForReviewCompletion() {
  return cloneReward(REWARD_RULES.REVIEW_COMPLETION);
}

// Reward for pushing a topic up to a given badge level. Unknown levels
// collapse to 'started' (0/0) so the caller doesn't have to.
function coinsForTopicBadge(level) {
  const key = String(level || '').toLowerCase();
  const entry = REWARD_RULES.TOPIC_BADGE[key] || REWARD_RULES.TOPIC_BADGE.started;
  return cloneReward(entry);
}

// Reward for completing an entire collection. Honors an explicit per-
// collection override from collections.json, falling back to the rule-book
// default when the field is missing or non-numeric.
function coinsForCollectionCompletion(collection) {
  const explicit = collection && Number(collection.coinReward);
  const coins = Number.isFinite(explicit) && explicit >= 0
    ? explicit
    : REWARD_RULES.COLLECTION_DEFAULT_COIN_REWARD;
  return { coins, xp: 0 };
}

// Reward for winning a transfer challenge end-to-end.
function coinsForTransferWin() {
  return cloneReward(REWARD_RULES.TRANSFER_WIN);
}

// Daily check-in bonus.
function coinsForDailyCheckin() {
  return cloneReward(REWARD_RULES.DAILY_CHECKIN);
}

// Streak milestone predicates + event-name builders.
function isStreakMilestone(streak) {
  return REWARD_RULES.STREAK_MILESTONES.includes(Number(streak) || 0);
}

function streakMilestones() {
  return [...REWARD_RULES.STREAK_MILESTONES];
}

function streakMilestoneEvent(days) {
  return `${MILESTONE_EVENTS.STREAK_PREFIX} ${days}-Day Streak!`;
}

module.exports = {
  REWARD_RULES,
  DIFFICULTY_KEYS,
  MILESTONE_EVENTS,
  difficultyKey,
  coinsForCorrectAnswer,
  coinsForIncorrectAnswer,
  coinsForHintUnlock,
  coinsForReviewCompletion,
  coinsForTopicBadge,
  coinsForCollectionCompletion,
  coinsForTransferWin,
  coinsForDailyCheckin,
  isStreakMilestone,
  streakMilestones,
  streakMilestoneEvent,
};