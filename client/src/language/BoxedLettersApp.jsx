import React, { useState, useCallback, useRef, useEffect } from 'react';
import { QuizLayout } from '../App';
import './BoxedLettersApp.css';

// ─────────────────────────────────────────────────────────────────────────────
// Puzzle Data
// Each puzzle: sides = [top, right, bottom, left] each with 3 letters.
// solutions = example valid word sets (4–6 words covering all 12 letters).
// ─────────────────────────────────────────────────────────────────────────────
const PUZZLES = [
  {
    id: 1,
    sides: [['P', 'L', 'A'], ['N', 'T', 'S'], ['E', 'R', 'O'], ['H', 'I', 'G']],
    hint: 'Think nature and growth.',
  },
  {
    id: 2,
    sides: [['B', 'R', 'A'], ['V', 'E', 'N'], ['T', 'U', 'S'], ['I', 'O', 'D']],
    hint: 'Think courage and places.',
  },
  {
    id: 3,
    sides: [['F', 'L', 'O'], ['W', 'E', 'R'], ['S', 'T', 'A'], ['N', 'D', 'I']],
    hint: 'Think blooms and positions.',
  },
  {
    id: 4,
    sides: [['C', 'H', 'A'], ['R', 'M', 'I'], ['N', 'G', 'S'], ['O', 'P', 'E']],
    hint: 'Think personality and actions.',
  },
  {
    id: 5,
    sides: [['Q', 'U', 'I'], ['C', 'K', 'L'], ['Y', 'J', 'O'], ['V', 'E', 'D']],
    hint: 'Think speed and emotion.',
  },
  {
    id: 6,
    sides: [['S', 'P', 'A'], ['R', 'K', 'L'], ['E', 'D', 'W'], ['I', 'T', 'H']],
    hint: 'Think shine and connection.',
  },
  {
    id: 7,
    sides: [['M', 'O', 'U'], ['N', 'T', 'A'], ['I', 'B', 'L'], ['E', 'S', 'K']],
    hint: 'Think peaks and trails.',
  },
  {
    id: 8,
    sides: [['G', 'L', 'O'], ['B', 'A', 'T'], ['H', 'E', 'R'], ['S', 'I', 'N']],
    hint: 'Think worldwide and gathering.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Geometry helpers
// ─────────────────────────────────────────────────────────────────────────────
const BOX_SIZE = 220;
const PADDING  = 52;
const TOTAL    = BOX_SIZE + PADDING * 2;
const RADIUS   = 16;

function getLetterPos(side, index) {
  const step = BOX_SIZE / 4;
  const offset = step * (index + 1);
  switch (side) {
    case 0: return { x: PADDING + offset,               y: PADDING - 24 };
    case 1: return { x: PADDING + BOX_SIZE + 24,        y: PADDING + offset };
    case 2: return { x: PADDING + BOX_SIZE - offset,    y: PADDING + BOX_SIZE + 24 };
    case 3: return { x: PADDING - 24,                   y: PADDING + BOX_SIZE - offset };
    default: return { x: 0, y: 0 };
  }
}

function buildLetterMap(sides) {
  const map = {};
  sides.forEach((sideLetters, sideIdx) => {
    sideLetters.forEach((letter, idx) => {
      map[letter] = { side: sideIdx, index: idx, ...getLetterPos(sideIdx, idx) };
    });
  });
  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────
function validateWord(word, letterMap) {
  if (word.length < 3) return { valid: false, reason: 'Word must be at least 3 letters.' };
  const upper = word.toUpperCase();
  for (const ch of upper) {
    if (!letterMap[ch]) return { valid: false, reason: `"${ch}" is not on the board.` };
  }
  for (let i = 0; i < upper.length - 1; i++) {
    const s1 = letterMap[upper[i]].side;
    const s2 = letterMap[upper[i + 1]].side;
    if (s1 === s2) {
      return { valid: false, reason: `"${upper[i]}" → "${upper[i + 1]}": can't connect two letters on the same side.` };
    }
  }
  return { valid: true };
}

function getUsedLetters(words) {
  const used = new Set();
  words.forEach(w => w.toUpperCase().split('').forEach(c => used.add(c)));
  return used;
}

// ─────────────────────────────────────────────────────────────────────────────
// Word colors (matching the app warm palette)
// ─────────────────────────────────────────────────────────────────────────────
// (Removed WORD_COLORS to keep all played words in a unified accent color)

// ─────────────────────────────────────────────────────────────────────────────
// SVG Board
// ─────────────────────────────────────────────────────────────────────────────
function FullBoard({ sides, letterMap, usedLetters, currentWord, playedWords, lastLetter }) {
  const currentPath = currentWord
    .toUpperCase()
    .split('')
    .filter(c => letterMap[c])
    .map(c => letterMap[c]);

  return (
    <svg
      width={TOTAL}
      height={TOTAL}
      viewBox={`0 0 ${TOTAL} ${TOTAL}`}
      style={{ display: 'block', margin: '0 auto', overflow: 'visible', maxWidth: '100%' }}
    >
      {/* Square box */}
      <rect
        x={PADDING} y={PADDING}
        width={BOX_SIZE} height={BOX_SIZE}
        rx={6}
        fill="none"
        stroke="var(--clr-border)"
        strokeWidth={2}
      />

      {/* Corner dots */}
      {[[PADDING,PADDING],[PADDING+BOX_SIZE,PADDING],[PADDING,PADDING+BOX_SIZE],[PADDING+BOX_SIZE,PADDING+BOX_SIZE]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r={4} fill="var(--clr-border)" />
      ))}

      {/* Played word lines */}
      {playedWords.map((obj, wIdx) => {
        const pts = obj.word.toUpperCase().split('').filter(c => letterMap[c]).map(c => letterMap[c]);
        if (pts.length < 2) return null;
        return (
          <polyline
            key={`pw-${wIdx}`}
            points={pts.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none" stroke="var(--clr-accent)"
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            opacity={0.65}
          />
        );
      })}

      {/* Current word dashed line */}
      {currentPath.length >= 2 && (
        <polyline
          points={currentPath.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none" stroke="var(--clr-accent)"
          strokeWidth={2.5} strokeDasharray="7 3"
          strokeLinecap="round" strokeLinejoin="round"
          opacity={0.9}
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.6s" repeatCount="indefinite" />
        </polyline>
      )}

      {/* Letter circles */}
      {sides.map((sideLetters, sideIdx) =>
        sideLetters.map((letter, idx) => {
          const pos = getLetterPos(sideIdx, idx);
          const isUsed = usedLetters.has(letter);
          const isInCurrent = currentWord.toUpperCase().includes(letter);
          const isLast = lastLetter === letter;

          let playedIdx = -1;
          for (let i = playedWords.length - 1; i >= 0; i--) {
            if (playedWords[i].word.toUpperCase().includes(letter)) { playedIdx = i; break; }
          }

          let fill = 'var(--clr-surface)';
          let stroke = 'var(--clr-border)';
          let textFill = 'var(--clr-text-soft)';
          let sw = 1.5;
          let r = RADIUS;

          if (isUsed && playedIdx >= 0) {
            fill = 'var(--clr-accent-soft)'; stroke = 'var(--clr-accent)'; textFill = 'var(--clr-accent)';
          }
          if (isInCurrent) {
            fill = 'var(--clr-accent-soft)'; stroke = 'var(--clr-accent)'; textFill = 'var(--clr-accent)';
            r = RADIUS + 2; sw = 2;
          }
          if (isLast) {
            fill = 'var(--clr-accent)'; stroke = 'var(--clr-accent)'; textFill = '#fff';
            r = RADIUS + 2; sw = 2.5;
          }

          return (
            <g key={`${sideIdx}-${idx}`} style={{ transition: 'all 0.2s' }}>
              <circle cx={pos.x} cy={pos.y} r={r} fill={fill} stroke={stroke} strokeWidth={sw}
                style={{ filter: isLast ? 'drop-shadow(0 0 6px var(--clr-accent))' : 'none', transition: 'all 0.25s' }} />
              <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize={13} fontWeight="bold"
                fontFamily="inherit" fill={textFill}
                style={{ transition: 'fill 0.25s', userSelect: 'none', pointerEvents: 'none' }}>
                {letter}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Completion Screen
// ─────────────────────────────────────────────────────────────────────────────
function CompletionScreen({ playedWords, onBack, onNext }) {
  const isOptimal = playedWords.length <= 6;
  return (
    <div className="bl-complete">
      <div className="bl-complete__emoji">{isOptimal ? '🎉' : '✅'}</div>
      <h2 className="bl-complete__title">
        {isOptimal ? 'Brilliant!' : 'Puzzle Solved!'}
      </h2>
      <p className="bl-complete__subtitle">
        You used <strong>{playedWords.length}</strong> word{playedWords.length !== 1 ? 's' : ''}.{' '}
        {isOptimal ? 'Right in the sweet spot of 4–6 words!' : 'Target is 4–6 words — keep practising!'}
      </p>

      <div className="bl-complete__chips">
        {playedWords.map((obj, i) => (
          <span key={i} className="bl-word-chip bl-tooltip-wrap"
            style={{
              background: 'var(--clr-accent-soft)',
              border: '1.5px solid var(--clr-accent)',
              color: 'var(--clr-accent)',
              cursor: 'help',
            }}>
            {obj.word}
            {obj.meaning && <span className="bl-tooltip">{obj.meaning}</span>}
          </span>
        ))}
      </div>

      <div className="bl-complete__actions">
        <button className="bl-btn bl-btn--secondary" onClick={onBack}>← Back</button>
        <button className="bl-btn bl-btn--primary" onClick={onNext}>Next Puzzle →</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Game Screen
// ─────────────────────────────────────────────────────────────────────────────
function GameScreen({ puzzle, onBack, onFinish }) {
  const [currentWord, setCurrentWord] = useState('');
  const [playedWords, setPlayedWords] = useState([]);
  const [wordError, setWordError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [blockedFlash, setBlockedFlash] = useState(false); // triggers shake on same-side block
  const inputRef = useRef(null);

  const letterMap = buildLetterMap(puzzle.sides);
  const allLetters = new Set(puzzle.sides.flat());
  const usedLetters = getUsedLetters(playedWords.map(w => w.word));
  const lastLetter = playedWords.length > 0
    ? playedWords[playedWords.length - 1].word.toUpperCase().slice(-1)
    : '';

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (usedLetters.size === allLetters.size && playedWords.length > 0) {
      setIsComplete(true);
    }
  }, [playedWords]);

  /**
   * handleInputChange — filters input character by character.
   * If the newly typed letter is on the same side as the previous letter
   * in the current word, it is rejected immediately with a shake animation.
   */
  const handleInputChange = (e) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');

    // Only check the most-recently added character (handles paste defensively too)
    if (raw.length > currentWord.length) {
      const newChar = raw[raw.length - 1];
      const prevChar = raw[raw.length - 2]; // character just before the new one

      // Reject if the new letter isn't on the board at all
      if (!letterMap[newChar]) {
        setWordError(`"${newChar}" is not on the board.`);
        triggerFlash();
        // reset input to previous value
        e.target.value = currentWord;
        return;
      }

      // Reject if new letter shares a side with the previous letter
      if (prevChar && letterMap[prevChar]) {
        const prevSide = letterMap[prevChar].side;
        const newSide  = letterMap[newChar].side;
        if (prevSide === newSide) {
          setWordError(`"${newChar}" is on the same side as "${prevChar}" — pick a different letter.`);
          triggerFlash();
          // reset input to previous value
          e.target.value = currentWord;
          return;
        }
      }
    }

    setCurrentWord(raw);
    setWordError('');
    setSuccessMsg('');
  };

  const triggerFlash = () => {
    setBlockedFlash(true);
    setTimeout(() => setBlockedFlash(false), 500);
  };

  /**
   * submitWord — validates board rules, then calls the free Dictionary API
   * to confirm the word is a real English word before accepting it.
   */
  const submitWord = useCallback(async () => {
    if (!currentWord || isVerifying) return;

    if (lastLetter && currentWord[0] !== lastLetter) {
      setWordError(`Next word must start with "${lastLetter}".`);
      return;
    }
    const boardCheck = validateWord(currentWord, letterMap);
    if (!boardCheck.valid) { setWordError(boardCheck.reason); return; }

    // Dictionary API check
    setIsVerifying(true);
    setWordError('');
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${currentWord.toLowerCase()}`
      );
      if (!res.ok) {
        // 404 = not a word
        setWordError(`"${currentWord}" isn't a recognised English word. Try another!`);
        setIsVerifying(false);
        return;
      }
      
      const data = await res.json();
      let meaning = 'Definition not available.';
      if (data && data.length > 0 && data[0].meanings && data[0].meanings.length > 0) {
        meaning = data[0].meanings[0].definitions[0].definition;
      }

      // Word verified ✓
      const newWords = [...playedWords, { word: currentWord, meaning }];
      setPlayedWords(newWords);
      setCurrentWord('');
      setWordError('');
      setSuccessMsg(`✓ "${currentWord}" accepted!`);
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch {
      // Network error — allow the word through so offline use still works
      const newWords = [...playedWords, { word: currentWord, meaning: 'Definition not available offline.' }];
      setPlayedWords(newWords);
      setCurrentWord('');
      setWordError('');
      setSuccessMsg(`"${currentWord}" added (offline — couldn't verify).`);
      setTimeout(() => setSuccessMsg(''), 2000);
    } finally {
      setIsVerifying(false);
      inputRef.current?.focus();
    }
  }, [currentWord, lastLetter, letterMap, playedWords, isVerifying]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submitWord();
    if (e.key === 'Backspace' && currentWord === '' && playedWords.length > 0) {
      setPlayedWords(p => p.slice(0, -1));
    }
  };

  const remainingLetters = [...allLetters].filter(l => !usedLetters.has(l));
  const progressPct = (usedLetters.size / allLetters.size) * 100;

  if (isComplete) {
    return (
      <CompletionScreen
        playedWords={playedWords}
        onBack={onBack}
        onNext={onFinish}
      />
    );
  }

  return (
    <div className="bl-game">
      {/* Progress */}
      <div className="bl-progress-meta">
        <span>{usedLetters.size} / {allLetters.size} letters used</span>
        <span>Target: 4–6 words</span>
      </div>
      <div className="bl-progress-bar">
        <div className="bl-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Board */}
      <div className="bl-board-wrap">
        <FullBoard
          sides={puzzle.sides}
          letterMap={letterMap}
          usedLetters={usedLetters}
          currentWord={currentWord}
          playedWords={playedWords}
          lastLetter={lastLetter}
        />
      </div>

      {/* Chain constraint */}
      {lastLetter && (
        <div className="bl-chain-hint">
          Next word must start with <strong style={{ color: 'var(--clr-accent)' }}>{lastLetter}</strong>
        </div>
      )}

      {/* Letter display tiles — shakes when a same-side letter is blocked */}
      <div
        className={`bl-tiles-wrap${blockedFlash ? ' bl-tiles-shake' : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        {currentWord.length > 0 ? (
          currentWord.split('').map((ch, i) => (
            <span key={i} className="bl-tile" style={{ animationDelay: `${i * 0.03}s` }}>
              {ch}
            </span>
          ))
        ) : (
          <span className="bl-tiles-placeholder">
            {lastLetter ? `Start with ${lastLetter}…` : 'Type a word…'}
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={currentWord}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="bl-hidden-input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck={false}
      />

      {/* Feedback */}
      {wordError && <div className="bl-feedback bl-feedback--error">{wordError}</div>}
      {successMsg && <div className="bl-feedback bl-feedback--success">{successMsg}</div>}

      {/* Action buttons */}
      <div className="bl-actions">
        <button className="bl-btn bl-btn--ghost"
          onClick={() => { setCurrentWord(''); setWordError(''); inputRef.current?.focus(); }}
          disabled={!currentWord || isVerifying}>
          Clear
        </button>
        <button className="bl-btn bl-btn--primary"
          onClick={submitWord} disabled={currentWord.length < 3 || isVerifying}>
          {isVerifying ? '⏳ Checking…' : 'Add Word ↵'}
        </button>
        <button className="bl-btn bl-btn--ghost"
          onClick={() => { setPlayedWords(p => p.slice(0, -1)); setWordError(''); }}
          disabled={playedWords.length === 0 || isVerifying}
          title="Remove last word">
          Undo
        </button>
      </div>

      {/* Played words */}
      {playedWords.length > 0 && (
        <div className="bl-words-section">
          <div className="bl-words-label">Words used ({playedWords.length}) — <span style={{ textTransform: 'none', fontStyle: 'italic', opacity: 0.8 }}>hover for meaning</span></div>
          <div className="bl-words-chips">
            {playedWords.map((obj, i) => (
              <span key={i} className="bl-word-chip bl-tooltip-wrap"
                style={{
                  background: 'var(--clr-accent-soft)',
                  border: '1.5px solid var(--clr-accent)',
                  color: 'var(--clr-accent)',
                  cursor: 'help',
                }}>
                {obj.word}
                {obj.meaning && <span className="bl-tooltip">{obj.meaning}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Remaining letters */}
      <div className="bl-remaining">
        <span className="bl-remaining-label">Still need:</span>
        {remainingLetters.length === 0 ? (
          <span style={{ color: 'var(--clr-correct)', fontWeight: 700 }}>All done! 🎉</span>
        ) : (
          <div className="bl-remaining-chips">
            {remainingLetters.map((l, i) => (
              <span key={i} className="bl-remaining-chip">{l}</span>
            ))}
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="bl-hint-area">
        <button className="bl-btn bl-btn--ghost" style={{ fontSize: '0.85rem' }}
          onClick={() => setShowHint(h => !h)}>
          {showHint ? 'Hide Hint 🙈' : '💡 Hint'}
        </button>
        {showHint && <span className="bl-hint-text">{puzzle.hint}</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Puzzle Select Screen
// ─────────────────────────────────────────────────────────────────────────────
function PuzzleSelect({ onSelect, onBack }) {
  return (
    <>
      <div className="header-row">
        <button className="back-button" onClick={onBack}>← Language Puzzles</button>
      </div>
      <h1 style={{ fontSize: 'clamp(1.8rem, 3.8vw, 2.4rem)' }}>Boxed Letters</h1>
      <p className="subtitle">
        Connect all 12 letters by forming words. No two consecutive letters can share a side.
        Each new word must start where the last one ended.
      </p>

      <div className="bl-rules-card">
        {[
          ['🔲', '3 letters sit outside each side of the square'],
          ['🔗', 'Form words to connect the letters with lines'],
          ['🚫', 'No two consecutive letters may share the same side'],
          ['➡️', 'Each new word starts with the last letter of the previous'],
          ['🎯', 'Use all 12 letters — ideally in 4 to 6 words'],
        ].map(([icon, rule], i) => (
          <div key={i} className="bl-rule">
            <span className="bl-rule-icon">{icon}</span>
            <span>{rule}</span>
          </div>
        ))}
      </div>

      <div className="menu-grid" style={{ marginTop: 24 }}>
        {PUZZLES.map((puz, i) => (
          <button
            key={puz.id}
            className="menu-card orange"
            onClick={() => onSelect(puz)}
          >
            <span className="menu-title">Puzzle {i + 1}</span>
            <span className="menu-subtitle" style={{ fontFamily: 'monospace', letterSpacing: '0.08em', fontSize: '0.78rem' }}>
              {puz.sides.map(s => s.join('')).join(' · ')}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────
export default function BoxedLettersApp({ onBack }) {
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [puzzleIndex, setPuzzleIndex] = useState(0);

  const handleSelect = (puz) => {
    setSelectedPuzzle(puz);
    setPuzzleIndex(PUZZLES.findIndex(p => p.id === puz.id));
  };

  const handleNext = () => {
    const nextIdx = (puzzleIndex + 1) % PUZZLES.length;
    setSelectedPuzzle(PUZZLES[nextIdx]);
    setPuzzleIndex(nextIdx);
  };

  if (!selectedPuzzle) {
    return <PuzzleSelect onSelect={handleSelect} onBack={onBack} />;
  }

  return (
    <QuizLayout
      title={`Boxed Letters · Puzzle ${puzzleIndex + 1}`}
      subtitle="Use every letter · Target: 4–6 words"
      onBack={() => setSelectedPuzzle(null)}
    >
      <GameScreen
        key={selectedPuzzle.id}
        puzzle={selectedPuzzle}
        onBack={() => setSelectedPuzzle(null)}
        onFinish={handleNext}
      />
    </QuizLayout>
  );
}
