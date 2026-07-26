const express = require('express');
const router = express.Router();
const { generateTarget } = require('../lib/reverseGenerator');
const { validateConstruction } = require('../lib/reverseValidator');

/**
 * GET /reverse-api/question
 * Query params:
 *   topic (string): 'addition' | 'multiplication' | 'fractions' | 'linear-equations' | 'quadratic-equations' | 'geometry'
 *   difficulty (number): 0 (easy), 1 (medium), 2 (hard), 3 (extrahard)
 */
router.get('/question', (req, res) => {
  const topic = (req.query.topic || 'addition').trim().toLowerCase();
  const difficulty = parseInt(req.query.difficulty, 10) || 0;

  const problem = generateTarget(topic, difficulty);
  res.json(problem);
});

/**
 * POST /reverse-api/check
 * Request body:
 * {
 *   topic: string,
 *   target: number | string | object,
 *   difficulty: number,
 *   construction: object
 * }
 */
router.post('/check', express.json(), (req, res) => {
  const { topic, target, difficulty, construction } = req.body || {};

  const cleanTopic = (topic || 'addition').trim().toLowerCase();
  const safeDiff = parseInt(difficulty, 10) || 0;

  const result = validateConstruction(cleanTopic, target, construction, safeDiff);
  res.json(result);
});

module.exports = router;
