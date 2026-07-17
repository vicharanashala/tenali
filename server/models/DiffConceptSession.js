const mongoose = require('mongoose');

const DiffConceptSessionSchema = new mongoose.Schema({
  learnerId: { type: String, required: true, index: true },
  startedAt: { type: Date, default: Date.now },
  completedStages: { type: [Number], default: [] },
  stage1Intuition: { type: Boolean, default: false },
  stage2PowerRule: {
    recognizedPattern: Boolean,
    completedTable: Boolean
  },
  stage3ChainRule: {
    innerOuterIdentified: Boolean,
    completedFactory: Boolean
  },
  stage4ProductQuotient: {
    uAndVMapped: Boolean,
    formulaMatched: Boolean
  },
  stage5MixedSolver: {
    problemsSolved: Number
  },
  conceptualGroundingScore: { type: Number, min: 0, max: 1 },
  isSpacedReplay: { type: Boolean, default: false }
});

module.exports = mongoose.model('DiffConceptSession', DiffConceptSessionSchema);
