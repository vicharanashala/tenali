const express = require('express');
const { requireAuth, Progress } = require('./auth');

const router = express.Router();
const inMemoryProgress = {};

router.get('/raw', requireAuth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const records = Object.values(inMemoryProgress).filter(r => r.userId === req.user.id);
      return res.json({ progress: records });
    }
    const records = await Progress.find({ userId: req.user.id });
    res.json({ progress: records });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

router.post('/update', requireAuth, async (req, res) => {
  const { topic, difficulty, isCorrect, questionId } = req.body;
  if (!topic) return res.status(400).json({ error: 'topic is required' });

  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const key = `${req.user.id}-${topic}`;
      if (!inMemoryProgress[key]) {
        inMemoryProgress[key] = { userId: req.user.id, topic, difficulty: difficulty || 'easy', score: 0, seenQuestions: [] };
      }
      const prog = inMemoryProgress[key];
      if (difficulty) prog.difficulty = difficulty;
      if (isCorrect !== undefined) {
        if (isCorrect) prog.score += 10;
        else prog.score = Math.max(0, prog.score - 5);
      }
      if (questionId) {
        if (!prog.seenQuestions.includes(questionId)) {
          prog.seenQuestions.push(questionId);
          if (prog.seenQuestions.length > 50) prog.seenQuestions.shift();
        }
      }
      prog.updatedAt = Date.now();
      return res.json({ success: true, progress: prog });
    }

    let prog = await Progress.findOne({ userId: req.user.id, topic });
    if (!prog) {
      prog = new Progress({ userId: req.user.id, topic, difficulty: difficulty || 'easy', score: 0, seenQuestions: [] });
    }

    if (difficulty) prog.difficulty = difficulty;

    if (isCorrect !== undefined) {
      if (isCorrect) prog.score += 10;
      else prog.score = Math.max(0, prog.score - 5);
    }

    if (questionId) {
      if (!prog.seenQuestions.includes(questionId)) {
        prog.seenQuestions.push(questionId);
        if (prog.seenQuestions.length > 50) prog.seenQuestions.shift();
      }
    }

    prog.updatedAt = Date.now();
    await prog.save();
    res.json({ success: true, progress: prog });
  } catch (err) {
    console.error('[progress] update error:', err);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

module.exports = { router };