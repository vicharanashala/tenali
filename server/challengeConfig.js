/**
 * TENALI MIND READER — CHALLENGE CONFIGURATION
 * ══════════════════════════════════════════════════════════════════════
 *
 * Configurable constants and templates for the "You Guess" (Challenge Mode) game.
 */

'use strict';

const CHALLENGE_CONFIG = {
  // ── Session & Expiration ──────────────────────────────────────────────
  jwtExpiry: '30m', // JWT session token lifetime (30 minutes)

  // ── Scoring & Limits ──────────────────────────────────────────────────
  mrrScoreWin: 20,         // MRR rating awarded for winning a challenge
  mrrScoreLoss: 5,         // MRR rating deducted for losing/giving up
  defaultMaxQuestions: 15, // Default maximum question limit if unspecified

  // ── Predefined Dialogue Templates ─────────────────────────────────────
  dialogues: {
    yes: [
      "Aha, yes! The mathematical signs align with your question.",
      "Indeed, that is true for my secret concept.",
      "Yes, my secret concept possesses that exact quality!",
      "Correct! Your deduction is sharp. The answer is Yes.",
      "Yes! You are drawing closer to the secret of the court."
    ],
    no: [
      "No, that does not apply to the concept in my mind.",
      "Ah, a clever query, but the answer is No.",
      "No, you must seek in another direction.",
      "Negative! My secret concept does not share that property.",
      "No, my secret concept rejects that claim."
    ],
    dontknow: [
      "Hmm... even with all my courtly wisdom, I must say Don't Know.",
      "That lies in a gray area. I cannot definitively say Yes or No.",
      "An interesting angle, but I do not know the answer to that.",
      "Don't Know! Tenali's mind is temporarily clouded on this point.",
      "My records are silent on this matter. I do not know."
    ]
  }
};

module.exports = CHALLENGE_CONFIG;
