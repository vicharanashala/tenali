const { ConceptMastery } = require('./models');
const { bktUpdate, DEFAULT_PARAMS } = require('../lib/bkt');
const { nextDisplayedMastery } = require('../lib/displayedMastery');
const { MASTERY_THRESHOLD } = require('./constants');

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
      incorrectStreak: 0,
      pMastery: DEFAULT_PARAMS.pInit,
      displayedMasteryPercent: DEFAULT_PARAMS.pInit * 100
    });
  }

  const prevPMastery = record.pMastery ?? DEFAULT_PARAMS.pInit;
  const prevDisplayed = record.displayedMasteryPercent ?? (prevPMastery * 100);

  const { pMasteryNext } = bktUpdate(prevPMastery, isCorrect);
  record.pMastery = pMasteryNext;

  // TODO (#289): gradeLevel is declared on User schema but not populated/mapped; fallback to '6-8'
  const rawPercent = pMasteryNext * 100;
  record.displayedMasteryPercent = nextDisplayedMastery(prevDisplayed, rawPercent, '6-8');

  if (isCorrect) {
    record.incorrectStreak = 0;
  } else {
    record.incorrectStreak = (record.incorrectStreak || 0) + 1;
  }

  const previouslyMastered = record.isMastered || false;
  const nowMastered = record.pMastery >= MASTERY_THRESHOLD;
  let newlyMastered = false;

  record.isMastered = nowMastered;

  if (!previouslyMastered && nowMastered) {
    newlyMastered = true;
    record.completedAt = new Date();
    record.lastRevisedAt = new Date();
  } else {
    record.lastRevisedAt = new Date();
  }

  await record.save();

  return {
    isMastered: record.isMastered,
    newlyMastered,
    incorrectStreak: record.incorrectStreak,
    pMastery: record.pMastery,
    displayedMasteryPercent: record.displayedMasteryPercent
  };
}

module.exports = {
  update
};
