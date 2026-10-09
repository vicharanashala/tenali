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
      displayedMasteryPercent: 30
    });
  }

  const previousMastery = record.pMastery ?? DEFAULT_PARAMS.pInit;
  const previousDisplayedMastery = record.displayedMasteryPercent ?? 30;
  const wasMastered = record.isMastered;

  // Update BKT mastery
  const { pMasteryNext } = bktUpdate(previousMastery, isCorrect);

  record.pMastery = pMasteryNext;

  // Update displayed mastery
  const rawMasteryPercent = record.pMastery * 100;
  // TODO (#289): The application currently lacks a reliable grade-band source.
  // Use '6-8' as a temporary default until the grade-band source is resolved.
  const displayedMasteryPercentNext = nextDisplayedMastery(
    previousDisplayedMastery,
    rawMasteryPercent,
    '6-8'
  );

  record.displayedMasteryPercent = displayedMasteryPercentNext;

  // Update telemetry
  if (isCorrect) {
    record.incorrectStreak = 0;
    record.lastRevisedAt = new Date();
  } else {
    record.incorrectStreak = (record.incorrectStreak || 0) + 1;
    record.lastRevisedAt = new Date();
  }

  // Determine mastery based on BKT threshold
  const isMasteredNow = record.pMastery >= MASTERY_THRESHOLD;
  const newlyMastered = !wasMastered && isMasteredNow;

  record.isMastered = isMasteredNow;

  if (newlyMastered) {
    record.completedAt = new Date();
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
