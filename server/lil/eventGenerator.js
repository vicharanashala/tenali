const { LearningEvent } = require('./models');

/**
 * Creates and writes a system learning event record to MongoDB.
 * 
 * @param {String} userId 
 * @param {String} eventType 
 * @param {String} topicId 
 * @param {Object} details 
 * @returns {Promise<Object>} The generated event data summary
 */
async function emit(userId, eventType, topicId, details = {}) {
  const eventId = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const event = new LearningEvent({
    userId,
    eventId,
    eventType,
    topicId,
    details
  });

  const saved = await event.save();
  return {
    eventId: saved.eventId,
    eventType: saved.eventType,
    createdAt: saved.createdAt
  };
}

module.exports = {
  emit
};
