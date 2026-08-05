const express = require('express');
const router = express.Router();

/**
 * GET /darts-api/question
 */
router.get('/question', (req, res) => {
  const level = req.query.level || 'easy';
  let x, y;

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randHalf = (min, max) => randInt(min * 2, max * 2) / 2;

  if (level === 'easy') {
    // 1st quadrant only
    x = randInt(1, 5);
    y = randInt(1, 5);
  } else if (level === 'medium') {
    // Any quadrant, integer
    do {
      x = randInt(-5, 5);
      y = randInt(-5, 5);
    } while (x === 0 && y === 0);
  } else if (level === 'hard') {
    // Any quadrant, half steps allowed
    do {
      x = randHalf(-5, 5);
      y = randHalf(-5, 5);
    } while (Number.isInteger(x) && Number.isInteger(y));
  } else {
    // extrahard
    const startX = randInt(-4, 4) || 1;
    const startY = randInt(-4, 4) || 1;
    const axis = Math.random() < 0.5 ? 'x' : 'y';
    x = axis === 'y' ? -startX : startX;
    y = axis === 'x' ? -startY : startY;

    return res.json({
      prompt: `Plot the reflection of (${startX}, ${startY}) across the ${axis.toUpperCase()}-axis.`,
      x, y, level, startX, startY, axis, type: 'reflection'
    });
  }

  res.json({
    prompt: `Throw the dart at coordinate (${x}, ${y}).`,
    x, y, level, type: 'standard'
  });
});

/**
 * POST /darts-api/check
 */
router.post('/check', express.json(), (req, res) => {
  const { userX, userY, x, y } = req.body;
  const correct = userX === x && userY === y;
  res.json({ correct, message: correct ? 'Bullseye!' : 'Missed!' });
});

module.exports = router;
