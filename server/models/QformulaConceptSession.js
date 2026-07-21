const mongoose = require('mongoose');

const PredictionRoundSchema = new mongoose.Schema({
  sliderChanged: { type: String, enum: ['a', 'b', 'c'] },
  predicted: { type: String, enum: ['more', 'fewer', 'same'] },
  actual: { type: String, enum: ['more', 'fewer', 'same'] },
  correct: Boolean
}, { _id: false });

const QformulaConceptSessionSchema = new mongoose.Schema({
  learnerId: { type: String, required: true, index: true },
  startedAt: { type: Date, default: Date.now },
  completedStages: { type: [Number], default: [] },
  stage1Predictions: [PredictionRoundSchema],
  stage2Explanation: {
    text: String,
    keywordMatch: Boolean
  },
  stage3StepperCompleted: { type: Boolean, default: false },
  conceptualGroundingScore: { type: Number, min: 0, max: 1 },
  isSpacedReplay: { type: Boolean, default: false }
});

module.exports = mongoose.model('QformulaConceptSession', QformulaConceptSessionSchema);
