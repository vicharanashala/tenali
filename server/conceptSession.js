const express = require('express');
const mongoose = require('mongoose');
const QformulaConceptSession = require('./models/QformulaConceptSession');
const SimulConceptSession = require('./models/SimulConceptSession');
const DiffConceptSession = require('./models/DiffConceptSession');
const SkillMasteryState = require('./models/SkillMasteryState');
const { nextInterval, INTERVAL_DAYS } = require('./lib/spacingLadder');

const router = express.Router();

// Get current state for a learner
router.get('/:skillId/state/:learnerId', async (req, res) => {
  try {
    const { skillId, learnerId } = req.params;
    
    // Fast fail if mongoose is not connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ 
        success: false, 
        message: "Mongo not connected",
        showRoteBanner: false,
        conceptualGroundingScore: null,
        isSpacedReplayDue: false
      });
    }

    const state = await SkillMasteryState.findOne({ learnerId, skillId });
    
    if (!state) {
      return res.status(200).json({
        success: true,
        showRoteBanner: true, // If they have no concept state, they probably rote learned if they try the quiz
        conceptualGroundingScore: null,
        isSpacedReplayDue: false
      });
    }

    const isDue = state.nextConceptReviewDue && new Date() >= state.nextConceptReviewDue;
    
    res.status(200).json({
      success: true,
      showRoteBanner: state.conceptualGroundingScore == null || state.conceptualGroundingScore < 0.6,
      conceptualGroundingScore: state.conceptualGroundingScore,
      isSpacedReplayDue: isDue
    });

  } catch (error) {
    console.error("[QFormulaConcept] Error getting state:", error);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

// Create or update a session
router.post('/:skillId/session', async (req, res) => {
  try {
    const { skillId } = req.params;
    const { 
      learnerId, 
      completedStages, 
      stage1Predictions, 
      stage2Explanation, 
      stage3StepperCompleted,
      conceptualGroundingScore,
      isSpacedReplay,
      // For simul
      stage1Guess,
      stage2Predictions,
      stage3PrecisionGap,
      stage4StepperCompleted,
      stage5Explanation
    } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: false, message: "Mongo not connected" });
    }

    // Save the session
    const SessionModel = skillId === 'simul' ? SimulConceptSession : (skillId === 'diff' ? DiffConceptSession : QformulaConceptSession);
    const session = new SessionModel({
      learnerId,
      completedStages,
      stage1Predictions,
      stage2Explanation,
      stage3StepperCompleted,
      conceptualGroundingScore,
      isSpacedReplay,
      // Simul specific fields (ignored by Qformula schema)
      stage1Guess,
      stage2Predictions,
      stage3PrecisionGap,
      stage4StepperCompleted,
      stage5Explanation,
      
      // Diff specific fields
      stage1Intuition: req.body.stage1Intuition,
      stage2PowerRule: req.body.stage2PowerRule,
      stage3ChainRule: req.body.stage3ChainRule,
      stage4ProductQuotient: req.body.stage4ProductQuotient,
      stage5MixedSolver: req.body.stage5MixedSolver
    });
    await session.save();

    // Update SkillMasteryState
    let state = await SkillMasteryState.findOne({ learnerId, skillId });
    if (!state) {
      state = new SkillMasteryState({ learnerId, skillId });
    }
    
    // Always update conceptual grounding score if provided
    if (conceptualGroundingScore !== undefined) {
      state.conceptualGroundingScore = conceptualGroundingScore;
    }

    // Handle spaced replay logic
    let completedFinalStage = false;
    let completedSpacedReplay = false;
    
    if (skillId === 'simul') {
      completedFinalStage = completedStages.includes(5); // simul has 5 stages
      completedSpacedReplay = isSpacedReplay && completedStages.includes(5);
    } else if (skillId === 'diff') {
      completedFinalStage = completedStages.includes(10);
      completedSpacedReplay = isSpacedReplay && completedStages.includes(10);
    } else {
      completedFinalStage = completedStages.includes(4); // qformula has 4 stages
      completedSpacedReplay = isSpacedReplay && completedStages.includes(4);
    }

    if (completedSpacedReplay) {
      // Calculate accuracy of this replay
      const correctCount = (stage1Predictions || []).filter(p => p.correct).length;
      const totalCount = (stage1Predictions || []).length;
      const accuracy = totalCount > 0 ? correctCount / totalCount : 1; // Default to 1 if no predictions logged
      
      const wentWell = accuracy >= 0.7; // arbitrary threshold for "held up"
      
      const currentRung = state.conceptReviewRung || 0;
      const newRung = nextInterval(currentRung, wentWell);
      
      state.conceptReviewRung = newRung;
      state.lastConceptReviewAt = new Date();
      
      const daysToAdd = INTERVAL_DAYS[newRung] || 1;
      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + daysToAdd);
      state.nextConceptReviewDue = nextDue;
    } else if (completedFinalStage) {
      // First time completing the concept playground
      if (!state.lastConceptReviewAt) {
        state.lastConceptReviewAt = new Date();
        const nextDue = new Date();
        nextDue.setDate(nextDue.getDate() + INTERVAL_DAYS[0]);
        state.nextConceptReviewDue = nextDue;
        state.conceptReviewRung = 0;
      }
    }

    await state.save();

    res.status(200).json({ success: true, sessionId: session._id });
  } catch (error) {
    console.error(`[ConceptSession] Error saving session for ${req.params.skillId}:`, error);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

module.exports = router;
