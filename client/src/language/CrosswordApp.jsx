import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTimer, QuizLayout } from '../App';
import './CrosswordApp.css';

// ─────────────────────────────────────────────────────────────
// Vocabulary Clues Database
// ─────────────────────────────────────────────────────────────
const WORD_CLUES = {
  // Easy
  'CAT': 'Purring household pet that chases mice.',
  'DOG': 'Loyal canine friend that barks.',
  'SUN': 'Bright star at the center of our solar system.',
  'BUS': 'Large vehicle used to transport many passengers.',
  'BOOK': 'Set of printed sheets bound together, read for learning or fun.',
  'TREE': 'Tall perennial plant with a woody trunk and branches.',
  'APPLE': 'Crisp round fruit that grows on trees, often red or green.',
  'BALL': 'Round object used in games and sports.',
  'FISH': 'Water-dwelling creature with gills and fins.',
  'STAR': 'Twinkling celestial body visible in the night sky.',
  
  // Medium
  'PYTHON': 'A type of large snake, or a popular programming language.',
  'ROBOT': 'A machine capable of carrying out complex actions automatically.',
  'ENERGY': 'The capacity or power to do work, like heat or electricity.',
  'FOREST': 'A large area covered chiefly with trees and undergrowth.',
  'VOLCANO': 'An opening in the Earth\'s crust that lets hot lava escape.',
  'GALAXY': 'A massive system of stars, gas, and dust bound by gravity.',
  'LIBRARY': 'A place where books and other media are kept for reading.',
  'COMPASS': 'An instrument used for navigation, showing magnetic north.',
  'DIAMOND': 'A precious gemstone made of pure carbon, the hardest mineral.',
  'MACHINE': 'An apparatus using mechanical power to perform a task.',

  // Hard
  'ALGORITHM': 'A step-by-step procedure or set of rules for solving problems.',
  'ECOSYSTEM': 'A biological community of interacting organisms and environment.',
  'QUANTUM': 'The smallest discrete quantity of electromagnetic energy.',
  'SATELLITE': 'An artificial body placed in orbit around the earth or moon.',
  'MICROSCOPE': 'An instrument used for viewing very small objects.',
  'DEMOCRACY': 'A system of government where citizens vote for leaders.',
  'ENCRYPTION': 'The process of converting information into secret code.',
  'ASTRONOMY': 'The branch of science that studies celestial objects and space.',
  'BIODIVERSITY': 'The variety of plant and animal life in a particular habitat.',
  'ARCHITECTURE': 'The art or practice of designing and constructing buildings.',

  // Expert
  'PHOTOSYNTHESIS': 'Process by which green plants make food using sunlight.',
  'CRYPTOGRAPHY': 'The art of writing or solving codes for secure communication.',
  'ELECTROMAGNETISM': 'Physical interaction among electrically charged particles.',
  'METAMORPHOSIS': 'Process of transformation from an immature form to an adult.',
  'NEUROSCIENCE': 'Scientific study of the nervous system and brain.',
  'CONSTITUTIONAL': 'Relating to an established set of governing laws or principles.',
  'THERMODYNAMICS': 'Branch of physics dealing with relations between heat and energy.',
  'SYNCHRONIZATION': 'The coordination of events to operate in unison or time.',
};

const LEVEL_WORDS = {
  1: ['CAT', 'DOG', 'SUN', 'BUS', 'BOOK', 'TREE', 'APPLE', 'BALL', 'FISH', 'STAR'],
  2: ['PYTHON', 'ROBOT', 'ENERGY', 'FOREST', 'VOLCANO'],
  3: ['GALAXY', 'LIBRARY', 'COMPASS', 'DIAMOND', 'MACHINE'],
  4: ['ALGORITHM', 'ECOSYSTEM', 'QUANTUM', 'SATELLITE', 'MICROSCOPE', 'DEMOCRACY', 'ENCRYPTION', 'ASTRONOMY', 'BIODIVERSITY', 'ARCHITECTURE'],
  5: ['PHOTOSYNTHESIS', 'CRYPTOGRAPHY', 'ELECTROMAGNETISM', 'METAMORPHOSIS', 'NEUROSCIENCE', 'CONSTITUTIONAL', 'THERMODYNAMICS', 'SYNCHRONIZATION'],
};

// ── Fallback Pre-designed Intersecting Layouts ──
const FALLBACK_PUZZLES = {
  1: {
    theme: 'Pets & Farm',
    gridSize: 5,
    words: [
      { id: 'f1', number: 1, word: 'CAT', clue: 'Purring household pet that chases mice.', row: 0, col: 0, direction: 'across' },
      { id: 'f2', number: 1, word: 'COW', clue: 'Spotted pig-like farm animal.', row: 0, col: 0, direction: 'down' },
      { id: 'f3', number: 2, word: 'OWL', clue: 'Nocturnal bird of prey.', row: 1, col: 2, direction: 'across' },
      { id: 'f4', number: 3, word: 'WOLF', clue: 'Wild canine that howls at the moon.', row: 1, col: 4, direction: 'down' },
    ]
  },
  2: {
    theme: 'Technology',
    gridSize: 7,
    words: [
      { id: 'f1', number: 1, word: 'PYTHON', clue: 'Popular programming language.', row: 0, col: 1, direction: 'down' },
      { id: 'f2', number: 2, word: 'ROBOT', clue: 'Automated machine.', row: 2, col: 0, direction: 'across' },
    ]
  },
  3: {
    theme: 'Space & Exploration',
    gridSize: 8,
    words: [
      { id: 'f1', number: 1, word: 'GALAXY', clue: 'Massive system of stars.', row: 0, col: 2, direction: 'down' },
      { id: 'f2', number: 2, word: 'MACHINE', clue: 'Mechanical apparatus.', row: 3, col: 0, direction: 'across' },
    ]
  },
  4: {
    theme: 'Academic & Science',
    gridSize: 10,
    words: [
      { id: 'f1', number: 1, word: 'QUANTUM', clue: 'Smallest discrete quantity of energy.', row: 0, col: 3, direction: 'down' },
      { id: 'f2', number: 2, word: 'SATELLITE', clue: 'Orbital spacecraft.', row: 4, col: 0, direction: 'across' },
    ]
  },
  5: {
    theme: 'Expert Level',
    gridSize: 15,
    words: [
      { id: 'f1', number: 1, word: 'METAMORPHOSIS', clue: 'Biological transformation process.', row: 0, col: 5, direction: 'down' },
      { id: 'f2', number: 2, word: 'NEUROSCIENCE', clue: 'Study of the brain and nerves.', row: 5, col: 0, direction: 'across' },
    ]
  }
};

const LEVELS = [
  { id: 1, title: 'Level 1', description: 'Easy common vocabulary', color: '#26de81', puzzles: [{ theme: 'Pets & Farm' }, { theme: 'Safari & Ocean' }] },
  { id: 2, title: 'Level 2', description: 'Medium word layouts', color: '#4a90e2', puzzles: [{ theme: 'Weather & Sky' }, { theme: 'Forests & Rivers' }] },
  { id: 3, title: 'Level 3', description: 'Medium academic layouts', color: '#ffc107', puzzles: [{ theme: 'Fruits & Grains' }, { theme: 'Kitchen Staples' }] },
  { id: 4, title: 'Level 4', description: 'Hard vocabulary layouts', color: '#e67e22', puzzles: [{ theme: 'Classroom' }, { theme: 'Physics & Space' }] },
  { id: 5, title: 'Level 5', description: 'Expert technical layouts', color: '#e67e22', puzzles: [{ theme: 'Landmarks' }, { theme: 'Transport & Travel' }] },
];

// ─────────────────────────────────────────────────────────────
// Layout Generator Heuristic Solver
// ─────────────────────────────────────────────────────────────
function generateCrossword(wordList) {
  if (!wordList || wordList.length === 0) return null;
  const sorted = [...wordList].sort((a, b) => b.length - a.length);
  const placed = [];
  const BOARD_SIZE = 40;
  const center = Math.floor(BOARD_SIZE / 2);

  placed.push({
    word: sorted[0],
    row: center,
    col: center - Math.floor(sorted[0].length / 2),
    direction: 'across'
  });

  function isValidPlacement(word, row, col, dir) {
    const len = word.length;
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return false;
    if (dir === 'across' && col + len > BOARD_SIZE) return false;
    if (dir === 'down' && row + len > BOARD_SIZE) return false;

    const wordCells = [];
    for (let i = 0; i < len; i++) {
      const r = dir === 'across' ? row : row + i;
      const c = dir === 'across' ? col + i : col;
      wordCells.push({ r, c, char: word[i] });
    }

    let intersects = false;

    for (let idx = 0; idx < wordCells.length; idx++) {
      const cell = wordCells[idx];
      const existing = placed.find(w => {
        const wLen = w.word.length;
        for (let i = 0; i < wLen; i++) {
          const r = w.direction === 'across' ? w.row : w.row + i;
          const c = w.direction === 'across' ? w.col + i : w.col;
          if (r === cell.r && c === cell.c) return true;
        }
        return false;
      });

      if (existing) {
        const offset = existing.direction === 'across' ? cell.c - existing.col : cell.r - existing.row;
        if (existing.word[offset] !== cell.char) {
          return false;
        }
        intersects = true;
      } else {
        const neighbors = [
          { r: cell.r - 1, c: cell.c },
          { r: cell.r + 1, c: cell.c },
          { r: cell.r, c: cell.c - 1 },
          { r: cell.r, c: cell.c + 1 }
        ];

        for (const n of neighbors) {
          if (wordCells.some(item => item.r === n.r && item.c === n.c)) continue;

          const touchesLetter = placed.some(w => {
            const wLen = w.word.length;
            for (let i = 0; i < wLen; i++) {
              const r = w.direction === 'across' ? w.row : w.row + i;
              const c = w.direction === 'across' ? w.col + i : w.col;
              if (r === n.r && c === n.c) return true;
            }
            return false;
          });

          if (touchesLetter) {
            return false;
          }
        }
      }
    }

    return intersects;
  }

  function solve(wordIdx) {
    if (wordIdx >= sorted.length) return true;

    const word = sorted[wordIdx];
    const candidates = [];

    placed.forEach(p => {
      for (let i = 0; i < word.length; i++) {
        for (let j = 0; j < p.word.length; j++) {
          if (word[i] === p.word[j]) {
            const nextDir = p.direction === 'across' ? 'down' : 'across';
            const row = nextDir === 'across' ? p.row + j : p.row - i;
            const col = nextDir === 'across' ? p.col - i : p.col + j;

            if (isValidPlacement(word, row, col, nextDir)) {
              candidates.push({ row, col, direction: nextDir });
            }
          }
        }
      }
    });

    candidates.forEach(c => {
      placed.push({ word, row: c.row, col: c.col, direction: c.direction });
      let minR = BOARD_SIZE, maxR = 0, minC = BOARD_SIZE, maxC = 0;
      placed.forEach(w => {
        const len = w.word.length;
        for (let i = 0; i < len; i++) {
          const r = w.direction === 'across' ? w.row : w.row + i;
          const c = w.direction === 'across' ? w.col + i : w.col;
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      });
      const width = maxC - minC + 1;
      const height = maxR - minR + 1;
      c.score = -(width + height) - Math.abs(width - height) * 2;
      placed.pop();
    });

    candidates.sort((a, b) => b.score - a.score);

    for (const c of candidates) {
      placed.push({ word, row: c.row, col: c.col, direction: c.direction });
      if (solve(wordIdx + 1)) return true;
      placed.pop();
    }

    return false;
  }

  const success = solve(1);
  return success ? placed : null;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function StarRow({ stars, max = 3 }) {
  return (
    <span className="cw-level-card-stars">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ color: i < stars ? '#ffc107' : 'rgba(255,255,255,0.15)' }}>★</span>
      ))}
    </span>
  );
}

function buildGrid(puzzle) {
  const { gridSize, words } = puzzle;
  const grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => ({
      isLetter: false,
      answer: '',
      value: '',
      number: null,
      solved: false,
      wrongFlash: false,
    }))
  );

  words.forEach(({ word, row, col, direction, number }) => {
    for (let i = 0; i < word.length; i++) {
      const r = direction === 'across' ? row : row + i;
      const c = direction === 'across' ? col + i : col;
      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
        grid[r][c].isLetter = true;
        grid[r][c].answer   = word[i].toUpperCase();
        if (i === 0 && number != null) {
          if (!grid[r][c].number) grid[r][c].number = number;
        }
      }
    }
  });

  return grid;
}

function getWordCells(wordObj) {
  const { word, row, col, direction } = wordObj;
  return Array.from({ length: word.length }, (_, i) => ({
    r: direction === 'across' ? row : row + i,
    c: direction === 'across' ? col + i : col,
  }));
}

function getActiveWord(puzzle, selectedCell, direction) {
  if (!puzzle || !selectedCell) return null;
  return puzzle.words.find(w => {
    if (w.direction !== direction) return false;
    const cells = getWordCells(w);
    return cells.some(c => c.r === selectedCell.r && c.c === selectedCell.c);
  }) || null;
}

function getLevelStars(levelId) {
  try {
    return Number(localStorage.getItem(`tenali_cw_stars_${levelId}`) || 0);
  } catch { return 0; }
}

function setLevelStars(levelId, stars) {
  try { localStorage.setItem(`tenali_cw_stars_${levelId}`, String(stars)); } catch {}
}

export default function CrosswordApp({ onBack }) {
  const [levelSearch, setLevelSearch] = useState('');
  const [chosenLevel, setChosenLevel] = useState(null);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [puzzle, setPuzzle] = useState(null);
  const [grid, setGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [direction, setDirection] = useState('across');
  const [solvedWords, setSolvedWords] = useState(new Set());
  const [totalXp, setTotalXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [toast, setToast] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [levelXp, setLevelXp] = useState(0);

  const cellRefs = useRef({});
  const toastTimer = useRef(null);
  const timer = useTimer();

  // Load XP from storage
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem('tenali_crossword_xp') || 0);
      setTotalXp(saved);
    } catch {}
  }, []);

  function showToast(msg, type = 'info') {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }

  // ── Dynamic Crossword Placement Generator on Puzzle Load ──
  useEffect(() => {
    if (!chosenLevel) return;

    const pool = LEVEL_WORDS[chosenLevel.id] || [];
    let generated = null;
    let attempts = 0;

    while (!generated && attempts < 80) {
      attempts++;
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const subset = shuffled.slice(0, 5); // Grab 5 words to place
      const layout = generateCrossword(subset);

      if (layout) {
        const words = layout.map((item, idx) => ({
          id: `w_${idx}`,
          word: item.word,
          clue: WORD_CLUES[item.word] || 'Thematic vocabulary word.',
          row: item.row,
          col: item.col,
          direction: item.direction,
        }));

        // Assign clue numbers
        const startCells = [];
        words.forEach(w => {
          if (!startCells.some(c => c.row === w.row && c.col === w.col)) {
            startCells.push({ row: w.row, col: w.col });
          }
        });
        startCells.sort((a, b) => {
          if (a.row !== b.row) return a.row - b.row;
          return a.col - b.col;
        });

        words.forEach(w => {
          const numIdx = startCells.findIndex(c => c.row === w.row && c.col === w.col);
          w.number = numIdx + 1;
        });

        // Translate offset
        let minR = 40, maxR = 0, minC = 40, maxC = 0;
        words.forEach(w => {
          const len = w.word.length;
          for (let i = 0; i < len; i++) {
            const r = w.direction === 'across' ? w.row : w.row + i;
            const c = w.direction === 'across' ? w.col + i : w.col;
            if (r < minR) minR = r;
            if (r > maxR) maxR = r;
            if (c < minC) minC = c;
            if (c > maxC) maxC = c;
          }
        });

        words.forEach(w => {
          w.row -= minR;
          w.col -= minC;
        });

        const gridSize = Math.max(maxR - minR + 1, maxC - minC + 1);

        generated = {
          theme: chosenLevel.puzzles[puzzleIndex]?.theme || chosenLevel.title,
          gridSize,
          words,
        };
      }
    }

    if (!generated) {
      // Gracefully fall back to pre-designed puzzle if search timed out
      const fallback = FALLBACK_PUZZLES[chosenLevel.id];
      generated = {
        theme: fallback.theme,
        gridSize: fallback.gridSize,
        words: fallback.words.map(w => ({ ...w, clue: WORD_CLUES[w.word] || w.clue })),
      };
    }

    setPuzzle(generated);
    const newGrid = buildGrid(generated);
    setGrid(newGrid);
    setSolvedWords(new Set());
    setHintsLeft(3);
    setToast(null);

    // Select first cell of first word
    const firstWord = generated.words[0];
    if (firstWord) {
      setSelectedCell({ r: firstWord.row, c: firstWord.col });
      setDirection(firstWord.direction);
    }

    timer.start(0);
  }, [chosenLevel, puzzleIndex]);

  // ── Auto-focus selected cell and auto-skip solved cells ──
  useEffect(() => {
    if (!selectedCell || !grid || grid.length === 0 || !puzzle) return;
    const { r, c } = selectedCell;
    const cell = grid[r]?.[c];
    
    if (cell && cell.isLetter && cell.solved) {
      const word = getActiveWord(puzzle, { r, c }, direction);
      if (word) {
        const cells = getWordCells(word);
        const idx = cells.findIndex(item => item.r === r && item.c === c);
        
        let nextIdx = idx + 1;
        let found = false;
        while (nextIdx < cells.length) {
          const item = cells[nextIdx];
          if (!grid[item.r][item.c].solved) {
            setSelectedCell({ r: item.r, c: item.c });
            found = true;
            break;
          }
          nextIdx++;
        }
        if (!found) {
          let prevIdx = idx - 1;
          while (prevIdx >= 0) {
            const item = cells[prevIdx];
            if (!grid[item.r][item.c].solved) {
              setSelectedCell({ r: item.r, c: item.c });
              found = true;
              break;
            }
            prevIdx--;
          }
        }
      }
    }

    const key = `${r}-${c}`;
    if (cellRefs.current[key]) {
      cellRefs.current[key].focus();
    }
  }, [selectedCell, grid, direction, puzzle]);

  // ── Highlight target words on grid ──
  const { highlightedCells, activeWord, totalWords } = useMemo(() => {
    const set = new Set();
    const act = getActiveWord(puzzle, selectedCell, direction);
    if (act) {
      getWordCells(act).forEach(c => set.add(`${c.r}-${c.c}`));
    }
    return {
      highlightedCells: set,
      activeWord: act,
      totalWords: puzzle ? puzzle.words.length : 0,
    };
  }, [selectedCell, direction, puzzle]);

  const progress = totalWords > 0 ? Math.round((solvedWords.size / totalWords) * 100) : 0;

  // ── Cell click ──
  function handleCellClick(r, c) {
    const cell = grid[r]?.[c];
    if (!cell?.isLetter) return;

    if (selectedCell?.r === r && selectedCell?.c === c) {
      setDirection(d => (d === 'across' ? 'down' : 'across'));
    } else {
      setSelectedCell({ r, c });
      const matchingWords = puzzle.words.filter(w => {
        const cells = getWordCells(w);
        return cells.some(item => item.r === r && item.c === c);
      });
      const hasAcross = matchingWords.some(w => w.direction === 'across');
      const hasDown   = matchingWords.some(w => w.direction === 'down');
      if (hasAcross && !hasDown) {
        setDirection('across');
      } else if (hasDown && !hasAcross) {
        setDirection('down');
      }
    }
  }

  // ── Advance cursor to next empty cell in word ──
  function advanceCursor(r, c, backward = false) {
    if (!puzzle) return;
    const word = getActiveWord(puzzle, { r, c }, direction);
    if (!word) return;
    const cells = getWordCells(word);
    const idx = cells.findIndex(cell => cell.r === r && cell.c === c);
    const next = backward ? cells[idx - 1] : cells[idx + 1];
    if (next) setSelectedCell({ r: next.r, c: next.c });
  }

  // ── Key Handler ──
  const handleKeyDown = useCallback((e, r, c) => {
    const key = e.key;

    if (key === 'ArrowRight') { e.preventDefault(); setDirection('across'); advanceCursor(r, c, false); }
    if (key === 'ArrowLeft')  { e.preventDefault(); setDirection('across'); advanceCursor(r, c, true); }
    if (key === 'ArrowDown')  { e.preventDefault(); setDirection('down');   advanceCursor(r, c, false); }
    if (key === 'ArrowUp')    { e.preventDefault(); setDirection('down');   advanceCursor(r, c, true); }

    if (key === 'Backspace') {
      e.preventDefault();
      const cell = grid[r]?.[c];
      if (!cell?.isLetter || cell.solved) return;

      if (cell.value) {
        setGrid(prev => {
          const next = prev.map(row => row.map(cell => ({ ...cell })));
          next[r][c].value = '';
          return next;
        });
      } else {
        advanceCursor(r, c, true);
      }
    }
  }, [grid, direction, puzzle]);

  // ── Input Handler ──
  const handleInput = useCallback((e, r, c) => {
    const cell = grid[r]?.[c];
    if (!cell?.isLetter || cell.solved) return;

    const char = e.target.value.replace(/[^a-zA-Z]/g, '').slice(-1).toUpperCase();

    setGrid(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      next[r][c].value = char;
      return next;
    });

    if (char) {
      checkWordCompletion(r, c, char);
      advanceCursor(r, c, false);
    }
  }, [grid, direction, puzzle, solvedWords]);

  // ── Word Completion Check ──
  function checkWordCompletion(changedR, changedC, newChar) {
    if (!puzzle) return;

    const affectedWords = puzzle.words.filter(w => {
      const cells = getWordCells(w);
      return cells.some(cell => cell.r === changedR && cell.c === changedC);
    });

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    newGrid[changedR][changedC].value = newChar;

    affectedWords.forEach(w => {
      if (solvedWords.has(w.id)) return;
      const cells = getWordCells(w);
      const isComplete = cells.every(cell => {
        const g = cell.r === changedR && cell.c === changedC
          ? newChar
          : newGrid[cell.r][cell.c].value;
        return g === newGrid[cell.r][cell.c].answer;
      });

      if (isComplete) {
        const newSolved = new Set(solvedWords);
        newSolved.add(w.id);
        setSolvedWords(newSolved);

        cells.forEach(cell => {
          newGrid[cell.r][cell.c].solved = true;
        });

        const newStreak = streak + 1;
        setStreak(newStreak);

        const xpGained = 30 + newStreak * 5;
        setLevelXp(x => x + xpGained);
        const newTotal = totalXp + xpGained;
        setTotalXp(newTotal);
        try { localStorage.setItem('tenali_crossword_xp', String(newTotal)); } catch {}

        showToast(`Solved: ${w.word}! +${xpGained} XP`, 'correct');

        if (newSolved.size === puzzle.words.length) {
          timer.stop();
          showToast('Puzzle Complete! Splendid job!', 'correct');
        }
      }
    });

    setGrid(newGrid);
  }

  // ── Hint: reveal one letter ──
  function handleRevealLetter() {
    if (!selectedCell || hintsLeft <= 0) return;
    const { r, c } = selectedCell;
    const cell = grid[r]?.[c];
    if (!cell?.isLetter || cell.solved || cell.value === cell.answer) {
      showToast('This cell is already correct!', 'info');
      return;
    }

    setGrid(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      next[r][c].value = next[r][c].answer;
      return next;
    });

    setHintsLeft(h => h - 1);
    if (streak > 0) setStreak(0);
    checkWordCompletion(r, c, cell.answer);
    showToast(`Letter revealed! ${hintsLeft - 1} hints remaining.`, 'info');
  }

  // ── Hint: reveal the starting letter of the active word ──
  function handleRevealWord() {
    if (!puzzle || !activeWord) {
      showToast("Select a cell or word to reveal its first letter!", "info");
      return;
    }
    const r = activeWord.row;
    const c = activeWord.col;

    setGrid(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      if (next[r]?.[c] && !next[r][c].solved) {
        next[r][c].value = next[r][c].answer;
        setTimeout(() => {
          checkWordCompletion(r, c, next[r][c].answer);
        }, 0);
      }
      return next;
    });
    showToast(`Revealed the first letter of "${activeWord.word}"!`, "info");
  }

  // ── Clue click ──
  function handleClueClick(word) {
    setSelectedCell({ r: word.row, c: word.col });
    setDirection(word.direction);
  }

  // ── Nav ──
  function handleNextPuzzle() {
    if (!chosenLevel) return;
    if (puzzleIndex + 1 < chosenLevel.puzzles.length) {
      setPuzzleIndex(p => p + 1);
    } else {
      setShowResults(true);
    }
  }

  function handlePrevPuzzle() {
    if (puzzleIndex > 0) setPuzzleIndex(p => p - 1);
  }

  if (!chosenLevel) {
    const filtered = LEVELS.filter(l =>
      l.title.toLowerCase().includes(levelSearch.toLowerCase()) ||
      l.description.toLowerCase().includes(levelSearch.toLowerCase())
    );

    return (
      <QuizLayout title="Crossword Puzzles" subtitle="Test your vocabulary with thematic crosswords" onBack={onBack}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            Language XP: <span style={{ color: '#e67e22' }}>{totalXp} XP</span>
          </div>
        </div>

        <div className="search-bar-row">
          <input
            className="search-bar"
            type="text"
            placeholder="Search levels… (e.g. 'Animals' or 'Science')"
            value={levelSearch}
            onChange={e => setLevelSearch(e.target.value)}
          />
        </div>

        <div className="menu-grid">
          {filtered.map(lvl => {
            const stars = getLevelStars(lvl.id);
            return (
              <button
                key={lvl.id}
                className="menu-card orange"
                onClick={() => {
                  setChosenLevel(lvl);
                  setPuzzleIndex(0);
                  setShowResults(false);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span className="menu-title">{lvl.title}</span>
                  <StarRow stars={stars} />
                </div>
                <span className="menu-subtitle">{lvl.description}</span>
              </button>
            );
          })}
        </div>
      </QuizLayout>
    );
  }

  if (showResults) {
    const earnedStars = levelXp >= 100 ? 3 : levelXp >= 50 ? 2 : 1;
    const currentStars = getLevelStars(chosenLevel.id);
    if (earnedStars > currentStars) {
      setLevelStars(chosenLevel.id, earnedStars);
    }

    return (
      <QuizLayout title={chosenLevel.title} subtitle="Results" onBack={() => setChosenLevel(null)}>
        <div className="cw-results-card">
          <h2>Level Complete!</h2>
          <p>Splendid performance. You have conquered all crosswords in this level.</p>
          <div className="cw-stars-large">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} className="cw-star-glow" style={{ color: i < earnedStars ? '#ffc107' : 'rgba(255,255,255,0.1)' }}>★</span>
            ))}
          </div>
          <div className="cw-results-stats">
            <div>
              <div className="cw-stat-num">{levelXp}</div>
              <div className="cw-stat-label">XP Gained</div>
            </div>
            <div>
              <div className="cw-stat-num">{timer.formattedTime}</div>
              <div className="cw-stat-label">Time Taken</div>
            </div>
          </div>
          <button className="cw-btn cw-btn--ghost" onClick={() => setChosenLevel(null)} style={{ marginTop: 24 }}>
            Back to Dashboard
          </button>
        </div>
      </QuizLayout>
    );
  }

  if (!puzzle || grid.length === 0) return null;

  const acrossClues = puzzle.words.filter(w => w.direction === 'across');
  const downClues   = puzzle.words.filter(w => w.direction === 'down');
  const totalPuzzles = chosenLevel.puzzles.length;
  const allSolved = solvedWords.size === totalWords;

  return (
    <QuizLayout
      title={chosenLevel.title}
      subtitle={puzzle.theme}
      onBack={() => setChosenLevel(null)}
      timer={timer}
    >
      {/* Top bar: progress, XP, streak */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div className="progress-pill center" style={{ flexShrink: 0 }}>
          Puzzle {puzzleIndex + 1} of {totalPuzzles}
        </div>
        <div style={{ flex: 1, minWidth: 80, padding: '0 12px' }}>
          <div className="cw-progress-bar-track">
            <div className="cw-progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {streak >= 2 && <span className="cw-streak-badge">Streak ×{streak}</span>}
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e67e22' }}>{totalXp} XP</span>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Hints: {hintsLeft}</span>
        </div>
      </div>

      <div className="cw-container">
        {/* Active clue banner */}
        {activeWord && (
          <div className="cw-active-clue-banner">
            <span className="cw-active-clue-direction">
              {activeWord.number} {activeWord.direction.toUpperCase()}
            </span>
            <span>{activeWord.clue}</span>
          </div>
        )}

        <div className="cw-layout">
          {/* ── GRID ── */}
          <div className="cw-grid-panel">
            <div
              className="cw-grid"
              style={{
                gridTemplateColumns: `repeat(${puzzle.gridSize}, 46px)`,
                gridTemplateRows:    `repeat(${puzzle.gridSize}, 46px)`,
              }}
            >
              {grid.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const key = `${rIdx}-${cIdx}`;
                  const isSelected = selectedCell?.r === rIdx && selectedCell?.c === cIdx;
                  const isHighlighted = highlightedCells.has(key);

                  if (!cell.isLetter) {
                    return <div key={key} className="cw-cell cw-cell--block" style={{ opacity: 0, pointerEvents: 'none', background: 'transparent', border: 'none', boxShadow: 'none' }} />;
                  }

                  let cellClass = 'cw-cell cw-cell--letter';
                  if (cell.solved)       cellClass += ' cw-cell--correct';
                  else if (isSelected)   cellClass += ' cw-cell--selected';
                  else if (isHighlighted) cellClass += ' cw-cell--word-highlight';

                  return (
                    <div key={key} className={cellClass} onClick={() => handleCellClick(rIdx, cIdx)}>
                      {cell.number && <span className="cw-cell-num">{cell.number}</span>}
                      <input
                        ref={el => { cellRefs.current[key] = el; }}
                        className="cw-cell-input"
                        type="text"
                        maxLength={2}
                        value={cell.value}
                        readOnly={cell.solved}
                        onChange={e => handleInput(e, rIdx, cIdx)}
                        onKeyDown={e => handleKeyDown(e, rIdx, cIdx)}
                        onClick={e => { e.stopPropagation(); handleCellClick(rIdx, cIdx); }}
                        aria-label={`Row ${rIdx + 1} Col ${cIdx + 1}`}
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* Progress indicator inside grid panel */}
            <div style={{ width: '100%', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>
              {solvedWords.size} / {totalWords} words solved
            </div>
          </div>

          {/* ── CLUES PANEL ── */}
          <div className="cw-clues-panel">
            {/* Across */}
            <div>
              <div className="cw-clues-section-title">
                <span className="cw-clue-dot cw-clue-dot--across" />
                Across
              </div>
              <div className="cw-clue-list">
                {acrossClues.map(w => {
                  const isSolved = solvedWords.has(w.id);
                  const isActive = activeWord?.id === w.id;
                  let clueClass = 'cw-clue-item';
                  if (isSolved) clueClass += ' cw-clue-item--solved';
                  else if (isActive) clueClass += ' cw-clue-item--active';

                  return (
                    <button
                      key={w.id}
                      className={clueClass}
                      onClick={() => handleClueClick(w)}
                    >
                      <span className="cw-clue-number">{w.number}</span>
                      <span className="cw-clue-text">{w.clue}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Down */}
            <div style={{ marginTop: 20 }}>
              <div className="cw-clues-section-title">
                <span className="cw-clue-dot cw-clue-dot--down" />
                Down
              </div>
              <div className="cw-clue-list">
                {downClues.map(w => {
                  const isSolved = solvedWords.has(w.id);
                  const isActive = activeWord?.id === w.id;
                  let clueClass = 'cw-clue-item';
                  if (isSolved) clueClass += ' cw-clue-item--solved';
                  else if (isActive) clueClass += ' cw-clue-item--active';

                  return (
                    <button
                      key={w.id}
                      className={clueClass}
                      onClick={() => handleClueClick(w)}
                    >
                      <span className="cw-clue-number">{w.number}</span>
                      <span className="cw-clue-text">{w.clue}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="cw-action-bar">
          <button
            className="cw-btn cw-btn--ghost"
            onClick={handleRevealLetter}
            disabled={hintsLeft <= 0 || allSolved}
          >
            Reveal Letter ({hintsLeft})
          </button>
          <button
            className="cw-btn cw-btn--ghost"
            onClick={handleRevealWord}
            disabled={allSolved}
          >
            Reveal Word
          </button>

          {allSolved && (
            <button className="cw-btn cw-btn--primary" onClick={handleNextPuzzle}>
              {puzzleIndex + 1 < totalPuzzles ? 'Next Puzzle' : 'Finish Quiz'}
            </button>
          )}
        </div>

        {/* Puzzle navigation */}
        <div className="cw-nav-row">
          <button
            className="cw-btn cw-btn--ghost"
            disabled={puzzleIndex <= 0}
            onClick={handlePrevPuzzle}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)' }}>
            {progress}% complete
          </span>
          <button
            className="cw-btn cw-btn--ghost"
            disabled={puzzleIndex + 1 >= totalPuzzles}
            onClick={handleNextPuzzle}
          >
            Next →
          </button>
        </div>
      </div>

      {toast && (
        <div className={`cw-toast cw-toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </QuizLayout>
  );
}
