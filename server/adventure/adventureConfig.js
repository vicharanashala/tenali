/**
 * TENALI ADVENTURE GAME - CONFIGURATION
 * ══════════════════════════════════════════════════════════════════════
 * Centralized gameplay constants and tuning values.
 * No magic numbers should exist inside services.
 */

'use strict';

module.exports = {
  // Session Configuration
  SESSION_TIMEOUT_MS: 60 * 60 * 1000, // 1 hour idle cleanup

  // Clues & Hints
  MAX_CLUES: 5,
  MAX_HINTS: 1,

  // XP & Scoring Rewards
  BASE_LEVEL_XP: 50,
  BOSS_XP_MULTIPLIER: 2.0,
  CORRECT_GUESS_BASE_SCORE: 100,

  // Stars Scoring Rules
  STARS_RULES: {
    THREE_STARS_MAX_CLUES: 2,       // 3 stars if guessed on Clue 1 or 2 with no hints
    TWO_STARS_MAX_CLUES: 4,         // 2 stars if guessed on Clue 3 or 4 (or used hint)
    ALLOW_HINT_FOR_THREE_STARS: false
  },

  // Progression & Unlock Defaults
  DEFAULT_UNLOCKED_WORLDS: ["number_kingdom"],
  DEFAULT_UNLOCKED_LEVELS: ["lvl_1_1"]
};
