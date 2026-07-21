const mongoose = require('mongoose');

const SimulPredictionRoundSchema = new mongoose.Schema({
  sliderChanged: { type: String, enum: ['slope', 'intercept'] },
  predicted: { type: String, enum: ['up', 'down', 'left', 'right', 'none'] },
  actual: { type: String, enum: ['up', 'down', 'left', 'right', 'none'] },
  correct: Boolean
}, { _id: false });

const SimulConceptSessionSchema = new mongoose.Schema({
  learnerId: { type: String, required: true, index: true },
  startedAt: { type: Date, default: Date.now },
  completedStages: { type: [Number], default: [] },
  stage1Guess: {
    x: Number,
    y: Number
  },
  stage2Predictions: [SimulPredictionRoundSchema],
  stage3PrecisionGap: Number,
  stage4StepperCompleted: { type: Boolean, default: false },
  stage5Explanation: {
    text: String,
    keywordMatch: Boolean
  },
  conceptualGroundingScore: { type: Number, min: 0, max: 1 },
  isSpacedReplay: { type: Boolean, default: false }
});

module.exports = mongoose.model('SimulConceptSession', SimulConceptSessionSchema);
