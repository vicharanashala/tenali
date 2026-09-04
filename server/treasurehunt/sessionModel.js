const mongoose = require('mongoose');

const TopicBreakdownSchema = new mongoose.Schema({
  topic: String,
  attempted: Number,
  correct: Number,
  accuracy: Number,
}, { _id: false });

const TreasureHuntSessionSchema = new mongoose.Schema({
  anonId: { type: String, index: true },
  worldId: String,
  gridSize: Number,
  topicTiers: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ['won', 'lost'] },
  treasuresFound: Number,
  totalTreasures: Number,
  livesUsed: Number,
  topicBreakdown: [TopicBreakdownSchema],
  startedAt: Date,
  completedAt: { type: Date, default: Date.now },
});

const TreasureHuntSession = mongoose.models.TreasureHuntSession
  || mongoose.model('TreasureHuntSession', TreasureHuntSessionSchema);

function saveCompletedSession(session, summary) {
  const doc = {
    anonId: session.anonId || null,
    worldId: session.worldId || session.moduleId || null,
    gridSize: session.gridSize,
    topicTiers: session.topicTiers || null,
    status: summary.status,
    treasuresFound: summary.treasuresFound,
    totalTreasures: summary.totalTreasures,
    livesUsed: summary.livesUsed,
    topicBreakdown: summary.topicBreakdown,
    startedAt: new Date(session.createdAt),
    completedAt: new Date(),
  };

  TreasureHuntSession.create(doc).catch((err) => {
    console.error('[treasurehunt] failed to save completed session:', err.message);
  });
}

module.exports = { saveCompletedSession };
