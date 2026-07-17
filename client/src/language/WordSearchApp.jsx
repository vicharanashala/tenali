import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTimer, QuizLayout } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import './WordSearchApp.css';

// Words based on user requirements
const WORDS_BY_LEVEL = {
  1: {
    title: 'Level 1 (Grades K–2)',
    description: 'Easy common words',
    gridSize: 8,
    words: ['CAT', 'DOG', 'SUN', 'BUS', 'BOOK', 'TREE', 'APPLE', 'BALL', 'FISH', 'STAR'],
  },
  2: {
    title: 'Level 2 (Grades 3–5)',
    description: 'Medium common words',
    gridSize: 10,
    words: ['PYTHON', 'ROBOT', 'ENERGY', 'FOREST', 'VOLCANO'],
  },
  3: {
    title: 'Level 3 (Grades 3–5)',
    description: 'Medium academic words',
    gridSize: 10,
    words: ['GALAXY', 'LIBRARY', 'COMPASS', 'DIAMOND', 'MACHINE'],
  },
  4: {
    title: 'Level 4 (Middle school+)',
    description: 'Hard words',
    gridSize: 12,
    words: ['ALGORITHM', 'ECOSYSTEM', 'QUANTUM', 'SATELLITE', 'MICROSCOPE', 'DEMOCRACY', 'ENCRYPTION', 'ASTRONOMY', 'BIODIVERSITY', 'ARCHITECTURE'],
  },
  5: {
    title: 'Level 5 (Expert)',
    description: 'Expert long words',
    gridSize: 16,
    words: ['PHOTOSYNTHESIS', 'CRYPTOGRAPHY', 'ELECTROMAGNETISM', 'METAMORPHOSIS', 'NEUROSCIENCE', 'CONSTITUTIONAL', 'THERMODYNAMICS', 'SYNCHRONIZATION'],
  }
};

const LEVELS = [
  { id: 1, name: 'Level 1', desc: 'Grades K–2 (Easy)', color: 'orange' },
  { id: 2, name: 'Level 2', desc: 'Grades 3–5 (Medium)', color: 'orange' },
  { id: 3, name: 'Level 3', desc: 'Grades 3–5 (Academic)', color: 'orange' },
  { id: 4, name: 'Level 4', desc: 'Middle School (Hard)', color: 'orange' },
  { id: 5, name: 'Level 5', desc: 'Expert Vocabulary', color: 'orange' },
];

export default function WordSearchApp({ onBack }) {
  const [levelSearch, setLevelSearch] = useState('');
  const [chosenLevel, setChosenLevel] = useState(null);
  const [grid, setGrid] = useState([]);
  const [wordPositions, setWordPositions] = useState([]); // Array of { word, cells: [{r,c}] }
  const [targetWords, setTargetWords] = useState([]);
  const [solvedWords, setSolvedWords] = useState(new Set());
  const [totalXp, setTotalXp] = useState(0);
  const [levelXp, setLevelXp] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [streak, setStreak] = useState(0);
  const [toast, setToast] = useState(null);

  // Advanced selection & target states
  const [activeWord, setActiveWord] = useState(null); // String
  const [selection, setSelection] = useState([]); // Array of {r, c}
  const [hintedCell, setHintedCell] = useState(null); // {r, c}
  const [successAnimation, setSuccessAnimation] = useState(false);

  const timer = useTimer();

  // Load XP
  useEffect(() => {
    try {
      const savedXp = localStorage.getItem('tenali_wordsearch_xp');
      if (savedXp) setTotalXp(Number(savedXp));
    } catch {}
  }, []);

  // Keyboard navigation for escape key to deselect activeWord
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveWord(null);
        setSelection([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show toast utility
  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Generate word search puzzle
  const generatePuzzle = (levelId) => {
    const levelData = WORDS_BY_LEVEL[levelId];
    const size = levelData.gridSize;
    const words = [...levelData.words];

    // Initialize grid with spaces
    let tempGrid = Array.from({ length: size }, () => Array(size).fill(''));

    // Directions: Horizontal, Vertical, Diagonal
    const directions = [
      { r: 0, c: 1, name: 'Horizontal →' },
      { r: 1, c: 0, name: 'Vertical ↓' },
      { r: 1, c: 1, name: 'Diagonal ↘' },
      { r: -1, c: 1, name: 'Diagonal ↗' },
    ];

    const placedWords = [];

    // Attempt to place each word
    words.forEach(word => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        attempts++;
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const startR = Math.floor(Math.random() * size);
        const startC = Math.floor(Math.random() * size);

        // Check bounds
        const endR = startR + dir.r * (word.length - 1);
        const endC = startC + dir.c * (word.length - 1);

        if (endR >= 0 && endR < size && endC >= 0 && endC < size) {
          // Check overlap compatibility
          let canPlace = true;
          const wordCells = [];

          for (let i = 0; i < word.length; i++) {
            const currR = startR + dir.r * i;
            const currC = startC + dir.c * i;
            const cellVal = tempGrid[currR][currC];
            if (cellVal !== '' && cellVal !== word[i]) {
              canPlace = false;
              break;
            }
            wordCells.push({ r: currR, c: currC });
          }

          if (canPlace) {
            // Write to grid
            for (let i = 0; i < word.length; i++) {
              tempGrid[wordCells[i].r][wordCells[i].c] = word[i];
            }
            placedWords.push({ word, cells: wordCells, directionName: dir.name });
            placed = true;
          }
        }
      }
    });

    // Fill remaining with random uppercase letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (tempGrid[r][c] === '') {
          tempGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    setGrid(tempGrid);
    setWordPositions(placedWords);
    setTargetWords(placedWords.map(p => p.word));
    setSolvedWords(new Set());
    setActiveWord(null);
    setHintedCell(null);
    setLevelXp(0);
    setHintsLeft(3);
    setStreak(0);
    timer.start();
  };

  // Check and solve selection
  const checkSelection = (cells) => {
    if (!cells || cells.length === 0) return false;
    const selectedWord = cells.map(cell => grid[cell.r][cell.c]).join('');
    const reversedWord = [...selectedWord].reverse().join('');

    const targetToFind = activeWord ? activeWord : null;

    let matched = wordPositions.find(p => p.word === selectedWord || p.word === reversedWord);

    // If an active target is selected, validate that it matches the selection
    if (targetToFind) {
      if (selectedWord !== targetToFind && reversedWord !== targetToFind) {
        return false;
      }
    }

    if (matched && !solvedWords.has(matched.word)) {
      const newSolved = new Set(solvedWords);
      newSolved.add(matched.word);
      setSolvedWords(newSolved);

      const newStreak = streak + 1;
      setStreak(newStreak);

      const xpGained = 20 + newStreak * 5;
      setLevelXp(prev => prev + xpGained);
      const newTotal = totalXp + xpGained;
      setTotalXp(newTotal);
      try { localStorage.setItem('tenali_wordsearch_xp', String(newTotal)); } catch {}

      showToast(`Found "${matched.word}"! +${xpGained} XP`, 'correct');
      setSuccessAnimation(true);
      setTimeout(() => setSuccessAnimation(false), 1000);

      // Auto-deselect the active word once solved
      if (activeWord === matched.word) {
        setActiveWord(null);
      }

      if (newSolved.size === targetWords.length) {
        timer.stop();
        showToast('Level Complete! Fantastic job finding all words!', 'correct');
      }
      return true;
    }
    
    return false;
  };

  // Handle cell click selection loop
  const handleCellClick = (r, c) => {
    setHintedCell(null);
    // If selection is empty, start a new selection loop with this cell
    if (selection.length === 0) {
      setSelection([{ r, c }]);
      return;
    }

    // Check if clicked cell is already the last selected cell (backtrack/pop)
    const lastCell = selection[selection.length - 1];
    if (lastCell.r === r && lastCell.c === c) {
      setSelection(prev => prev.slice(0, -1));
      return;
    }

    // Check if clicked cell is already in selection (pop/truncate selection to this point)
    const existingIndex = selection.findIndex(cell => cell.r === r && cell.c === c);
    if (existingIndex !== -1) {
      setSelection(prev => prev.slice(0, existingIndex + 1));
      return;
    }

    // Check if clicked cell is adjacent to the last selected cell
    const isAdjacent = Math.abs(r - lastCell.r) <= 1 && Math.abs(c - lastCell.c) <= 1;
    if (isAdjacent) {
      const nextSelection = [...selection, { r, c }];
      setSelection(nextSelection);

      // Check if current selection spells the activeWord or any target word
      const found = checkSelection(nextSelection);
      if (found) {
        setSelection([]);
      }
    } else {
      // Not adjacent: reset selection loop to start from this new cell
      setSelection([{ r, c }]);
    }
  };

  // Word selection click handler
  const handleWordClick = (word) => {
    setHintedCell(null);
    if (solvedWords.has(word)) return;
    if (activeWord === word) {
      setActiveWord(null);
    } else {
      setActiveWord(word);
    }
  };

  // Keyboard word card select handler
  const handleWordKeyDown = (e, word) => {
    if (e.key === 'Enter') {
      handleWordClick(word);
    }
  };

  // Hints handler
  const handleHint = () => {
    if (hintsLeft <= 0) return;
    
    let targetWord = null;
    if (activeWord) {
      targetWord = wordPositions.find(p => p.word === activeWord);
    } else {
      const unsolved = wordPositions.filter(p => !solvedWords.has(p.word));
      if (unsolved.length > 0) {
        targetWord = unsolved[Math.floor(Math.random() * unsolved.length)];
      }
    }

    if (!targetWord) return;

    const firstCell = targetWord.cells[0];
    setHintedCell(firstCell);
    showToast(`Hint: "${targetWord.word}" starts at highlighted circle!`, 'info');
    setHintsLeft(prev => prev - 1);
  };

  // Layout select screen
  if (!chosenLevel) {
    return (
      <>
        <div className="header-row">
          <button className="back-button" onClick={onBack}>← Home</button>
        </div>
        <h1>Word Search Puzzles</h1>
        <p className="subtitle">Find all hidden words in the letters grid</p>

        <div className="search-bar-row">
          <input
            className="search-bar"
            type="text"
            placeholder="Search word search levels..."
            value={levelSearch}
            onChange={e => setLevelSearch(e.target.value)}
          />
        </div>

        <div className="menu-grid" style={{ marginTop: 20 }}>
          {LEVELS.filter(l => l.name.toLowerCase().includes(levelSearch.toLowerCase()) || l.desc.toLowerCase().includes(levelSearch.toLowerCase())).map(levelItem => (
            <button
              key={levelItem.id}
              className="menu-card orange"
              onClick={() => {
                setChosenLevel(levelItem);
                generatePuzzle(levelItem.id);
              }}
            >
              <span className="menu-title">{levelItem.name}</span>
              <span className="menu-subtitle">{levelItem.desc}</span>
            </button>
          ))}
        </div>
      </>
    );
  }

  // Active game view
  const progressPercent = targetWords.length > 0 ? Math.round((solvedWords.size / targetWords.length) * 100) : 0;
  const isFinished = solvedWords.size === targetWords.length && targetWords.length > 0;

  return (
    <QuizLayout
      title={chosenLevel.name}
      subtitle={WORDS_BY_LEVEL[chosenLevel.id].title}
      onBack={() => setChosenLevel(null)}
      timer={timer}
    >
      {/* Dashboard row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div className="progress-pill center">
          Level {chosenLevel.id} Puzzles
        </div>
        <div style={{ flex: 1, minWidth: 80, padding: '0 12px' }}>
          <div className="cw-progress-bar-track">
            <div className="cw-progress-bar-fill" style={{ width: `${progressPercent}%`, backgroundColor: '#e67e22' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {streak >= 2 && <span className="cw-streak-badge">Streak ×{streak}</span>}
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e67e22' }}>{totalXp} XP</span>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>Hints: {hintsLeft}</span>
        </div>
      </div>

      {/* Bonus Feature: Currently Finding Indicator */}
      <AnimatePresence>
        {activeWord && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="ws-current-finding-banner"
            style={{
              padding: '10px 16px',
              background: 'rgba(230, 126, 34, 0.15)',
              border: '1px solid rgba(230, 126, 34, 0.3)',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#e67e22',
              textAlign: 'center',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>Currently Finding:</span>
            <span style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>🎯 {activeWord}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ws-container">
        {/* Letter Grid */}
        <div className="ws-grid-panel">
          <motion.div
            className="ws-grid"
            animate={successAnimation ? { scale: [1, 1.03, 1] } : {}}
            transition={{ duration: 0.5 }}
            style={{
              gridTemplateColumns: `repeat(${grid.length}, 36px)`,
              gridTemplateRows: `repeat(${grid.length}, 36px)`,
            }}
          >
            {grid.map((row, rIdx) =>
              row.map((char, cIdx) => {
                const isCellSelected = selection.some(cell => cell.r === rIdx && cell.c === cIdx);
                const isCellSolved = wordPositions.some(p => solvedWords.has(p.word) && p.cells.some(cell => cell.r === rIdx && cell.c === cIdx));
                const isCellHinted = hintedCell && hintedCell.r === rIdx && hintedCell.c === cIdx;

                let cellClass = 'ws-cell';
                if (isCellSelected) cellClass += ' ws-cell--selected';
                else if (isCellSolved) cellClass += ' ws-cell--solved';
                else if (isCellHinted) cellClass += ' ws-cell--hinted';

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={cellClass}
                    onClick={() => handleCellClick(rIdx, cIdx)}
                  >
                    {char}
                  </div>
                );
              })
            )}
          </motion.div>

          <div className="ws-actions">
            <button className="ws-btn ws-btn--ghost" onClick={handleHint} disabled={hintsLeft <= 0 || isFinished}>
              Hint ({hintsLeft})
            </button>
            {isFinished && (
              <button className="ws-btn ws-btn--primary" onClick={() => setChosenLevel(null)}>
                Finish Level
              </button>
            )}
          </div>
          </div>

        {/* Target Words */}
        <div className="ws-words-panel">
          <div className="ws-section-title">Find These Words</div>
          <div className="ws-words-list">
            {targetWords.map(word => {
              const isSolved = solvedWords.has(word);
              const isActive = activeWord === word;

              let wordClass = 'ws-word-item';
              if (isSolved) wordClass += ' ws-word-item--solved';
              else if (isActive) wordClass += ' ws-word-item--active';

              return (
                <motion.div
                  key={word}
                  role="button"
                  tabIndex={isSolved ? -1 : 0}
                  aria-selected={isActive}
                  aria-disabled={isSolved}
                  onClick={() => handleWordClick(word)}
                  onKeyDown={(e) => handleWordKeyDown(e, word)}
                  className={wordClass}
                  whileHover={{ scale: isSolved ? 1 : 1.05 }}
                  whileTap={{ scale: isSolved ? 1 : 0.95 }}
                  animate={isActive ? { scale: [1, 1.04, 1] } : {}}
                  transition={isActive ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
                  style={{
                    cursor: isSolved ? 'not-allowed' : 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{word}</span>
                  {isSolved && <span style={{ color: '#2ecc71', fontSize: '0.85rem' }}>✓</span>}
                  {isActive && <span style={{ color: '#e67e22', fontSize: '0.75rem' }}>●</span>}
                </motion.div>
              );
            })}
          </div>

          <div className="ws-section-title" style={{ marginTop: '10px' }}>Statistics</div>
          <div className="ws-stats-grid">
            <div className="ws-stat-card">
              <div className="ws-stat-val">{targetWords.length}</div>
              <div className="ws-stat-lbl">Total Words</div>
            </div>
            <div className="ws-stat-card">
              <div className="ws-stat-val">{levelXp} XP</div>
              <div className="ws-stat-lbl">XP Gained</div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`ws-toast ws-toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </QuizLayout>
  );
}
