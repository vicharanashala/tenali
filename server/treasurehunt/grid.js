/**
 * Treasure Hunt grid generation and win-check helpers.
 */

function generateGrid(gridSize) {
  const total = gridSize * gridSize;
  const treasureCount = Math.max(1, Math.round(total * 0.2));

  const treasureMap = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  for (let k = 0; k < treasureCount; k++) {
    const idx = indices[k];
    treasureMap[Math.floor(idx / gridSize)][idx % gridSize] = true;
  }

  const neighborCounts = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(0)
  );
  const deltas = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],          [0, 1],
    [1, -1],  [1, 0], [1, 1],
  ];

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      let count = 0;
      for (const [dr, dc] of deltas) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && treasureMap[nr][nc]) {
          count++;
        }
      }
      neighborCounts[r][c] = count;
    }
  }

  // Pick a starting hint cell: prefer non-treasure with neighborCount > 0
  let hintCell = null;
  for (let r = 0; r < gridSize && !hintCell; r++) {
    for (let c = 0; c < gridSize && !hintCell; c++) {
      if (!treasureMap[r][c] && neighborCounts[r][c] > 0) {
        hintCell = { row: r, col: c };
      }
    }
  }
  // Fallback: any non-treasure cell
  if (!hintCell) {
    for (let r = 0; r < gridSize && !hintCell; r++) {
      for (let c = 0; c < gridSize && !hintCell; c++) {
        if (!treasureMap[r][c]) {
          hintCell = { row: r, col: c };
        }
      }
    }
  }

  return { treasureMap, neighborCounts, hintCell };
}

/**
 * Flood-fill reveal (Minesweeper-style).
 * Starting from a confirmed non-treasure cell, marks it revealed and — if its
 * neighborCount is 0 — iteratively expands to all 8 neighbours, continuing
 * through any that are also non-treasure zero-count cells. Cells with
 * neighborCount > 0 are revealed but don't expand further. Treasure cells
 * are never revealed by this function.
 *
 * Uses an iterative BFS queue to avoid stack overflow on large empty regions.
 *
 * @returns {Array<{row, col, neighborCount}>} every cell newly revealed.
 */
function floodReveal(row, col, treasureMap, neighborCounts, revealed) {
  const gridSize = treasureMap.length;
  const newlyRevealed = [];

  const deltas = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];

  // Mark the starting cell
  revealed[row][col] = true;
  newlyRevealed.push({ row, col, neighborCount: neighborCounts[row][col] });

  // Only flood if starting cell is a zero-count cell
  if (neighborCounts[row][col] !== 0) {
    return newlyRevealed;
  }

  const queue = [{ row, col }];

  while (queue.length > 0) {
    const { row: cr, col: cc } = queue.shift();

    for (const [dr, dc] of deltas) {
      const nr = cr + dr;
      const nc = cc + dc;

      // Bounds check
      if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) continue;
      // Already revealed
      if (revealed[nr][nc]) continue;
      // Never reveal treasure cells
      if (treasureMap[nr][nc]) continue;

      // Reveal this neighbor
      revealed[nr][nc] = true;
      newlyRevealed.push({ row: nr, col: nc, neighborCount: neighborCounts[nr][nc] });

      // If this neighbor is also zero-count, continue expanding from it
      if (neighborCounts[nr][nc] === 0) {
        queue.push({ row: nr, col: nc });
      }
    }
  }

  return newlyRevealed;
}

function isGridCleared(revealedMap, treasureMap) {
  const gridSize = treasureMap.length;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!treasureMap[r][c] && !revealedMap[r][c]) {
        return false;
      }
    }
  }
  return true;
}

module.exports = { generateGrid, isGridCleared, floodReveal };
