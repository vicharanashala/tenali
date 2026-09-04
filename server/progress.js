const express = require('express');
const { requireAuth, Progress } = require('./auth');
const logger = require('./lib/logger');

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

    // Atomic read-modify-write: a plain findOne() + mutate + save() has a
    // window between the read and the write where a second concurrent
    // request for the same user+topic (e.g. two answers submitted in quick
    // succession) can read the same starting state and clobber the first
    // write when it saves — a lost update. An aggregation-pipeline update
    // computes the new score/seenQuestions server-side, inside MongoDB, in
    // a single atomic operation, so there's no window for another request
    // to interleave.
    const scoreDelta = isCorrect === undefined ? 0 : (isCorrect ? 10 : -5);
    const pipeline = [
      {
        $set: {
          userId: { $ifNull: ['$userId', req.user.id] },
          topic: { $ifNull: ['$topic', topic] },
          difficulty: difficulty ? difficulty : { $ifNull: ['$difficulty', 'easy'] },
          score: { $max: [0, { $add: [{ $ifNull: ['$score', 0] }, scoreDelta] }] },
          seenQuestions: questionId
            ? {
                $cond: [
                  { $in: [questionId, { $ifNull: ['$seenQuestions', []] }] },
                  { $ifNull: ['$seenQuestions', []] },
                  { $slice: [{ $concatArrays: [{ $ifNull: ['$seenQuestions', []] }, [questionId]] }, -50] },
                ],
              }
            : { $ifNull: ['$seenQuestions', []] },
          updatedAt: new Date(),
        },
      },
    ];

    const prog = await Progress.findOneAndUpdate(
      { userId: req.user.id, topic },
      pipeline,
      { returnDocument: 'after', upsert: true, updatePipeline: true }
    );
    res.json({ success: true, progress: prog });
  } catch (err) {
    logger.error(null, '[progress] update error:', err);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

module.exports = { router };