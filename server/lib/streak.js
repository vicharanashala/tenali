'use strict';

const STREAK_MILESTONE_BONUSES = {
  3: 50,
  7: 150,
  15: 300,
  30: 500,
};

/**
 * Returns the bonus coins for reaching a specific daily streak milestone.
 * @param {number} days - The streak milestone in days.
 * @returns {number} Bonus coins awarded, or 0 if not a milestone.
 */
function getStreakMilestoneBonus(days) {
  return STREAK_MILESTONE_BONUSES[days] || 0;
}

module.exports = {
  getStreakMilestoneBonus,
  STREAK_MILESTONE_BONUSES,
};
