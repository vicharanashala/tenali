/**
 * TENALI ADVENTURE GAME - BOSS ENGINE
 * ══════════════════════════════════════════════════════════════════════
 * Handles Boss Level mechanics. Boss levels are deferred for now —
 * regular levels use the full thoughts/hint model.
 * Boss levels fall back to the main concept's thoughts with a boss prefix.
 */

'use strict';

const config = require('./adventureConfig');
const kb = require('./adventureKB');

module.exports = {
  /**
   * Generates clues for a Boss Level.
   * Uses the boss concept's own thoughts (or clues), prefixed with a banner.
   */
  generateBossClues: (level) => {
    const mainConcept = kb.getConceptById(level.conceptId);
    if (!mainConcept) return ['I am the ultimate challenge of this kingdom.'];

    // Prefer child-friendly thoughts, fall back to clues
    const baseThoughts = mainConcept.thoughts || mainConcept.clues || [];

    const finalClues = [
      `⚔️ Boss Level! ${baseThoughts[0] || 'I am the final challenge.'}`,
      baseThoughts[1] || 'Think about everything you have learned.',
      baseThoughts[2] || 'All the concepts in this kingdom lead to me.',
      baseThoughts[3] || 'Look deep into the definition.',
      baseThoughts[4] || 'You are almost there!'
    ];

    return finalClues.slice(0, config.MAX_CLUES);
  },

  /**
   * Validates a Boss guess — same logic as a regular guess.
   */
  validateBossGuess: (targetConceptId, guessConceptId) => {
    const target = kb.getConceptById(targetConceptId);
    const guess  = kb.getConceptById(guessConceptId);
    if (!target || !guess) return false;
    return target.id === guess.id || target.name.toLowerCase() === guess.name.toLowerCase();
  },

  /**
   * Computes bonus XP and stars for a Boss level victory.
   */
  calculateBossRewards: (cluesRevealed, hintsUsedCount) => {
    const baseXP = config.BASE_LEVEL_XP * config.BOSS_XP_MULTIPLIER;
    let stars = 1;
    if (cluesRevealed <= 2 && hintsUsedCount === 0) stars = 3;
    else if (cluesRevealed <= 4) stars = 2;
    return { xpGained: baseXP, stars, bossBadgeAwarded: 'Royal Scholar Crystal' };
  }
};
