const { User } = require('../auth');

/**
 * Updates a student's gamification state (coins earned and XP gained).
 * 
 * @param {String} userId 
 * @param {Boolean} isCorrect 
 * @param {String} sessionGoal 
 * @returns {Promise<Object>} Summary of coins and XP increments
 */
async function update(userId, isCorrect, sessionGoal = 'standard') {
  let coinsEarned = 0;
  let xpEarned = 0;

  if (isCorrect) {
    xpEarned = 10;
    if (sessionGoal === 'speed') {
      coinsEarned = 20; // Double payout multiplier for speed run
    } else {
      coinsEarned = 10; // Standard coin payout
    }
  } else {
    // 2 XP awarded for effort on wrong answers
    xpEarned = 2;
  }

  let totalCoins = 0;
  let totalXP = 0;

  const user = await User.findById(userId);
  if (user) {
    user.coins = (user.coins || 0) + coinsEarned;
    user.xp = (user.xp || 0) + xpEarned;
    await user.save();
    totalCoins = user.coins;
    totalXP = user.xp;
  }

  return {
    coinsEarned,
    xpEarned,
    totalCoins,
    totalXP
  };
}

module.exports = {
  update
};
