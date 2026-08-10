const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// Define Mongoose Schema for Concept Playgrounds Telemetry
const ConceptPlayAttemptSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // can be username or ObjectId
  skillId: { type: String, required: true },
  classLevel: { type: String, required: true },
  templateUsed: { type: String, required: true },
  proximityScore: { type: Number, required: true },
  attempts: { type: Number, required: true },
  selfExplanationText: { type: String },
  match: { type: Boolean },
  createdAt: { type: Date, default: Date.now }
});

const ConceptPlayAttempt = mongoose.model('ConceptPlayAttempt', ConceptPlayAttemptSchema);

// Endpoint to log a struggle attempt
router.post('/attempt', async (req, res) => {
  try {
    const { 
      skillId, 
      classLevel, 
      templateUsed, 
      proximityScore, 
      attempts, 
      selfExplanationText, 
      match 
    } = req.body;

    const userId = req.body.userId || 'anonymous';

    // Fast fail if mongoose is not connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: false, message: "Mongo not connected" });
    }

    const attempt = new ConceptPlayAttempt({
      userId,
      skillId,
      classLevel,
      templateUsed,
      proximityScore,
      attempts,
      selfExplanationText,
      match
    });

    await attempt.save();
    res.status(200).json({ success: true, message: "Attempt logged successfully." });
  } catch (error) {
    console.error("[ConceptPlay] Error saving attempt:", error);
    res.status(200).json({ success: false, error: "Database error, but progressing." });
  }
});

module.exports = router;
