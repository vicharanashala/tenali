const mongoose = require('mongoose');

const CheckpointAttemptSchema = new mongoose.Schema({
  topicId: { type: String, required: true },
  scorePercent: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  attemptedAt: { type: Date, default: Date.now }
});

const CheckpointQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  prompt: { type: String, required: true },
  correctAnswer: { type: String, required: false },
  conceptKey: { type: String, required: true }
});

const ActiveCheckpointSchema = new mongoose.Schema({
  topicId: { type: String, required: true },
  questions: { type: [CheckpointQuestionSchema], default: [] },
  startedAt: { type: Date, default: Date.now }
});

const LearningJourneyProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  completedConcepts: { type: [String], default: [] },
  completedTopics: { type: [String], default: [] },
  conceptsNeedingRevision: { type: [String], default: [] },
  checkpointAttempts: { type: [CheckpointAttemptSchema], default: [] },
  latestCheckpointScore: { type: Map, of: Number, default: {} },
  activeCheckpoint: { type: ActiveCheckpointSchema, default: null },
  updatedAt: { type: Date, default: Date.now }
});

const LearningJourneyProgress = mongoose.models.LearningJourneyProgress || mongoose.model('LearningJourneyProgress', LearningJourneyProgressSchema);

module.exports = { LearningJourneyProgress };
