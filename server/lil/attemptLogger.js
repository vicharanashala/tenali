const { Attempt } = require('./models');

/**
 * Logs a quiz question attempt details to MongoDB.
 * 
 * @param {Object} logInput
 * @returns {Promise<String>} The saved document ObjectId string
 */
async function log(logInput) {
  const attempt = new Attempt({
    userId: logInput.userId,
    topicId: logInput.topicId,
    difficulty: logInput.difficulty || 'easy',
    userAnswer: String(logInput.userAnswer ?? ''),
    isCorrect: logInput.isCorrect,
    sessionGoal: logInput.sessionGoal || 'standard',
    prompt: logInput.prompt,
    correctAnswer: logInput.correctAnswer,
    display: logInput.display,
    options: logInput.options,
    questionData: logInput.questionData,
    telemetry: {
      timeSpentMs: logInput.telemetry?.timeSpentMs || 0,
      inputEditsCount: logInput.telemetry?.inputEditsCount || 0,
      hintRequestedImmediately: !!logInput.telemetry?.hintRequestedImmediately,
      idleDurationMs: logInput.telemetry?.idleDurationMs || 0
    }
  });

  const saved = await attempt.save();
  return saved._id.toString();
}

module.exports = {
  log
};
