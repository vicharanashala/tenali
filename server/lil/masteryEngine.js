const { ConceptMastery } = require('./models');

/**
 * Updates mastery statistics and determines if a concept is mastered.
 * 
 * @param {String} userId 
 * @param {String} topicId 
 * @param {Boolean} isCorrect 
 * @returns {Promise<Object>} The updated mastery status metrics
 */
async function update(userId, topicId, isCorrect) {
  let record = await ConceptMastery.findOne({ userId, topicId });
  if (!record) {
    record = new ConceptMastery({
      userId,
      topicId,
      isMastered: false,
      incorrectStreak: 0
    });
  }

  let newlyMastered = false;

  if (isCorrect) {
    record.incorrectStreak = 0;
    // Standard baseline mastery rule: mark completed on correct answer
    if (!record.isMastered) {
      record.isMastered = true;
      newlyMastered = true;
      record.completedAt = new Date();
      record.lastRevisedAt = new Date();
    } else {
      record.lastRevisedAt = new Date();
    }
  } else {
    record.incorrectStreak += 1;
    // Regress mastery if 3 consecutive incorrect attempts occur
    if (record.incorrectStreak >= 3 && record.isMastered) {
      record.isMastered = false;
    }
  }

  await record.save();

  return {
    isMastered: record.isMastered,
    newlyMastered,
    incorrectStreak: record.incorrectStreak
  };
}

module.exports = {
  update
};
