const { TOPIC_DOMAINS } = require('./constants');

/**
 * Validates the LIL attempt request input structure.
 */
function isValidAttemptInput(input) {
  if (!input) return false;
  if (!input.userId) return false;
  if (!input.topicId || typeof input.topicId !== 'string') return false;
  if (typeof input.isCorrect !== 'boolean') return false;
  return true;
}

/**
 * Returns the domain category for a given topic ID key.
 */
function getDomainForTopic(topicId) {
  return TOPIC_DOMAINS[topicId] || 'other';
}

module.exports = {
  isValidAttemptInput,
  getDomainForTopic
};
