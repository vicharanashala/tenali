const attemptLogger = require('./attemptLogger');
const masteryEngine = require('./masteryEngine');
const eventGenerator = require('./eventGenerator');
const studentState = require('./studentState');
const { isValidAttemptInput } = require('./utils');

// Lightweight Hook Registry
const hooks = {
  preCheck: [],
  postCheck: []
};

/**
 * Registers a feature-specific callback hook.
 * 
 * @param {String} hookPoint "preCheck" | "postCheck"
 * @param {Function} callback 
 */
function registerFeatureHook(hookPoint, callback) {
  if (hooks[hookPoint]) {
    hooks[hookPoint].push(callback);
  }
}

/**
 * Executes all registered hooks for a given lifecycle stage.
 */
async function executeFeatureHooks(hookPoint, context) {
  const result = {};
  for (const hook of hooks[hookPoint]) {
    try {
      const outcome = await hook(context);
      Object.assign(result, outcome || {});
    } catch (err) {
      console.error(`[LIL] Hook execution error at ${hookPoint}:`, err);
    }
  }
  return result;
}

/**
 * Central orchestrator for the LIL attempt lifecycle.
 * 
 * @param {Object} input 
 * @returns {Promise<Object>} The consolidated check evaluation output
 */
async function processAttempt(input) {
  if (!isValidAttemptInput(input)) {
    throw new Error('Invalid LIL attempt payload inputs');
  }

  const { userId, topicId, difficulty, userAnswer, isCorrect, sessionGoal, telemetry, prompt, correctAnswer, display, options, questionData } = input;

  // 1. Log Attempt
  const attemptId = await attemptLogger.log({
    userId,
    topicId,
    difficulty,
    userAnswer,
    isCorrect,
    sessionGoal,
    telemetry,
    prompt,
    correctAnswer,
    display,
    options,
    questionData
  });

  // 2. Mastery Update
  const masteryUpdate = await masteryEngine.update(userId, topicId, isCorrect);

  // 3. Emit Learning Events
  const events = [];
  if (masteryUpdate.newlyMastered) {
    const event = await eventGenerator.emit(userId, 'mastery_unlocked', topicId, {
      completedAt: new Date()
    });
    events.push(event);
  }

  // 4. Update Student State (Coins / XP)
  const stateUpdate = await studentState.update(userId, isCorrect, sessionGoal);

  // 5. Execute Feature Hooks (Goal, Checkpoint, telemetry, etc.)
  const hookContext = {
    userId,
    topicId,
    difficulty,
    userAnswer,
    isCorrect,
    sessionGoal,
    telemetry,
    attemptId,
    masteryUpdate,
    stateUpdate
  };
  
  const hookResults = await executeFeatureHooks('postCheck', hookContext);

  // 6. Return Payload
  return {
    correct: isCorrect,
    coinsEarned: stateUpdate.coinsEarned,
    xpEarned: stateUpdate.xpEarned,
    totalCoins: stateUpdate.totalCoins,
    totalXP: stateUpdate.totalXP,
    isMastered: masteryUpdate.isMastered,
    events,
    hookResults
  };
}

module.exports = {
  processAttempt,
  registerFeatureHook
};
