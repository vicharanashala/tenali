'use strict';

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function sudokuIsValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (board[r][c] === num) return false;
  return true;
}

function sudokuSolve(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
        for (const n of nums) {
          if (sudokuIsValid(board, r, c, n)) {
            board[r][c] = n;
            if (sudokuSolve(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function sudokuGenerate(difficulty) {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  sudokuSolve(board);
  const solution = board.map(r => [...r]);
  let blanks;
  if (difficulty === 'easy') blanks = randomInt(30, 35);
  else if (difficulty === 'medium') blanks = randomInt(40, 45);
  else if (difficulty === 'hard') blanks = randomInt(50, 55);
  else blanks = randomInt(56, 60);
  const cells = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) cells.push([r, c]);
  cells.sort(() => Math.random() - 0.5);
  for (let i = 0; i < blanks && i < cells.length; i++) board[cells[i][0]][cells[i][1]] = 0;
  return { grid: board, solution };
}

module.exports = { sudokuIsValid, sudokuSolve, sudokuGenerate };
