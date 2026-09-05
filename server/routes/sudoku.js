'use strict';
const router = require('express').Router();
const { sudokuGenerate } = require('../lib/sudoku');

router.get('/question', (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  const { grid, solution } = sudokuGenerate(difficulty);
  const prompt = 'Fill the empty cells (0 = empty) so each row, column, and 3×3 box contains digits 1–9.';
  res.json({ prompt, grid, solution, difficulty });
});

router.post('/check', require('express').json(), (req, res) => {
  const { grid, solution } = req.body || {};
  if (!grid || !solution || !Array.isArray(grid) || !Array.isArray(solution)) {
    return res.json({ correct: false, message: 'Invalid submission.' });
  }
  let correct = true;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (solution[r][c] !== 0 && Number(grid[r][c]) !== solution[r][c]) { correct = false; break; }
    }
    if (!correct) break;
  }
  res.json({ correct, message: correct ? 'Puzzle solved correctly!' : 'Some cells are incorrect.' });
});

module.exports = router;
