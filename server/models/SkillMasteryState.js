const mongoose = require('mongoose');

const SkillMasteryStateSchema = new mongoose.Schema({
  learnerId: { type: String, required: true, index: true },
  skillId: { type: String, required: true },
  pMastery: Number,
  displayedMasteryPercent: Number,
  conceptualGroundingScore: Number,
  lastConceptReviewAt: Date,
  nextConceptReviewDue: Date,
  conceptReviewRung: { type: Number, default: 0 }
}, { timestamps: true });

SkillMasteryStateSchema.index({ learnerId: 1, skillId: 1 }, { unique: true });

module.exports = mongoose.model('SkillMasteryState', SkillMasteryStateSchema);
