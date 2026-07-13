import React, { useState, useEffect, useRef } from 'react';
import { useTimer, QuizLayout } from '../App';

// API base URL from environment variables (Vite)
const API = import.meta.env.VITE_API_BASE_URL || '';

/**
 * WordCreatorApp Component
 * Interactive word-creation puzzle where players complete words by filling in the blanks.
 */
export default function WordCreatorApp({ onBack }) {
  const [level, setLevel] = useState(1);
  const [showLevelSelect, setShowLevelSelect] = useState(true);
  const [levelSearch, setLevelSearch] = useState('');

  // Game state
  const [puzzleIndex, setPuzzleIndex] = useState(1);
  const [puzzle, setPuzzle] = useState(null);
  const [userInputs, setUserInputs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [foundWords, setFoundWords] = useState([]);
  const [totalXp, setTotalXp] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Per-puzzle stats and results tracking
  const [puzzleStats, setPuzzleStats] = useState({});
  const [showResults, setShowResults] = useState(false);

  const inputRefs = useRef([]);
  const timer = useTimer();

  // Read stats from localStorage on mount
  useEffect(() => {
    try {
      const savedXp = localStorage.getItem('tenali_wordcreator_xp');
      if (savedXp) setTotalXp(Number(savedXp));
    } catch {}
  }, []);

  // Initialize stats for the 20 puzzles in a level
  const initPuzzleStats = () => {
    const initialStats = {};
    for (let i = 1; i <= 20; i++) {
      initialStats[i] = {
        xpGained: 0,
        timeSpent: 0,
        wrongAttempts: [],
        correctWords: [],
        pattern: '',
        solutions: []
      };
    }
    setPuzzleStats(initialStats);
  };

  // Manage timer start/stop: runs when playing, resets on level select or results screen
  useEffect(() => {
    if (!showLevelSelect && !showResults) {
      const savedTime = puzzleStats[puzzleIndex]?.timeSpent || 0;
      timer.start(savedTime);
    } else {
      timer.reset();
    }
  }, [showLevelSelect, showResults, puzzleIndex]);

  // Fetch puzzle when level/index changes
  useEffect(() => {
    if (showLevelSelect) return;

    const fetchPuzzle = async () => {
      setLoading(true);
      setFeedback(null);
      setIsCorrect(null);
      setRevealed(false);
      try {
        const res = await fetch(`${API}/wordcreator-api/question?level=${level}&index=${puzzleIndex}`);
        const data = await res.json();
        setPuzzle(data);
        setUserInputs(Array(data.blanksCount).fill(''));
        
        // Load words found for this level/puzzle
        const savedWordsKey = `tenali_wordcreator_words_${level}_${puzzleIndex}`;
        const savedWords = localStorage.getItem(savedWordsKey);
        setFoundWords(savedWords ? JSON.parse(savedWords) : []);

        // Save pattern and solutions list to stats for the results screen
        setPuzzleStats(prev => {
          const current = prev[puzzleIndex] || { xpGained: 0, timeSpent: 0, wrongAttempts: [], correctWords: [] };
          return {
            ...prev,
            [puzzleIndex]: {
              ...current,
              pattern: data.pattern,
              solutions: data.solutions || []
            }
          };
        });

        // Focus first input box
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      } catch (err) {
        console.error("Failed to load puzzle:", err);
        setFeedback("Failed to load puzzle. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPuzzle();
  }, [level, puzzleIndex, showLevelSelect]);

  const handleInputChange = (e, idx) => {
    const val = e.target.value.replace(/[^a-zA-Z]/g, '').slice(-1).toLowerCase();
    const newInputs = [...userInputs];
    newInputs[idx] = val;
    setUserInputs(newInputs);

    // Auto-focus next input box if typed
    if (val && idx < puzzle.blanksCount - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleInputKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !userInputs[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (submitting || loading || !puzzle || revealed) return;

    // Verify all input letters are filled
    if (userInputs.some(val => !val)) {
      setFeedback("Please fill in all blank spaces!");
      setIsCorrect(false);
      return;
    }

    // Build constructed word
    let wordChars = puzzle.pattern.split("");
    puzzle.blankIndices.forEach((blankIdx, i) => {
      wordChars[blankIdx] = userInputs[i];
    });
    const finalWord = wordChars.join("");

    // Verify if word is already found
    if (foundWords.some(w => w.word === finalWord)) {
      setFeedback(`You already discovered "${finalWord.toUpperCase()}"!`);
      setIsCorrect(false);
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API}/wordcreator-api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          word: finalWord, 
          pattern: puzzle.pattern,
          level: level,
          index: puzzleIndex
        }),
      });
      const data = await res.json();

      if (data.correct) {
        setIsCorrect(true);
        setFeedback(`Success! "${finalWord.toUpperCase()}" is a valid word.`);
        
        // Reward XP (level * 10)
        const xpEarned = level * 10;
        const newXp = totalXp + xpEarned;
        setTotalXp(newXp);
        localStorage.setItem('tenali_wordcreator_xp', String(newXp));

        // Append to found words
        const newWordObj = {
          word: data.word,
          partOfSpeech: data.partOfSpeech,
          definition: data.definition,
          phonetic: data.phonetic
        };
        const updatedWords = [...foundWords, newWordObj];
        setFoundWords(updatedWords);

        const savedWordsKey = `tenali_wordcreator_words_${level}_${puzzleIndex}`;
        localStorage.setItem(savedWordsKey, JSON.stringify(updatedWords));

        // Update stats
        setPuzzleStats(prev => {
          const current = prev[puzzleIndex] || { xpGained: 0, timeSpent: 0, wrongAttempts: [], correctWords: [] };
          const alreadyFound = current.correctWords.some(w => w.word === newWordObj.word);
          return {
            ...prev,
            [puzzleIndex]: {
              ...current,
              xpGained: current.xpGained + (alreadyFound ? 0 : xpEarned),
              correctWords: alreadyFound ? current.correctWords : [...current.correctWords, newWordObj]
            }
          };
        });

        // Reset inputs and focus back on first input for finding another word
        setUserInputs(Array(puzzle.blanksCount).fill(''));
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);

      } else {
        setIsCorrect(false);
        setFeedback(data.reason || `"${finalWord.toUpperCase()}" is not a valid word.`);

        // Record wrong attempt in stats ONLY if it is not a network check error
        if (!data.isNetworkError) {
          setPuzzleStats(prev => {
            const current = prev[puzzleIndex] || { xpGained: 0, timeSpent: 0, wrongAttempts: [], correctWords: [] };
            const alreadyLogged = current.wrongAttempts.includes(finalWord);
            return {
              ...prev,
              [puzzleIndex]: {
                ...current,
                wrongAttempts: alreadyLogged ? current.wrongAttempts : [...current.wrongAttempts, finalWord]
              }
            };
          });

          // Reset inputs and focus back on first input for incorrect guesses (except network errors)
          setUserInputs(Array(puzzle.blanksCount).fill(''));
          setTimeout(() => {
            inputRefs.current[0]?.focus();
          }, 100);
        }
      }
    } catch (err) {
      console.error(err);
      setFeedback("Error checking word validity. Try again.");
      setIsCorrect(false);
    } finally {
      setSubmitting(false);
    }
  };

  const recordPuzzleTime = () => {
    if (timer) {
      const elapsedSeconds = timer.stop();
      setPuzzleStats(prev => {
        const curr = prev[puzzleIndex] || { xpGained: 0, timeSpent: 0, wrongAttempts: [], correctWords: [] };
        return {
          ...prev,
          [puzzleIndex]: {
            ...curr,
            timeSpent: elapsedSeconds
          }
        };
      });
    }
  };

  const handleNextPuzzle = () => {
    recordPuzzleTime();
    setPuzzleIndex(p => p + 1);
  };

  const handlePrevPuzzle = () => {
    recordPuzzleTime();
    setPuzzleIndex(p => p - 1);
  };

  const handleCompleteLevel = () => {
    recordPuzzleTime();
    setShowResults(true);
  };

  const getLevelDesc = (lvl) => {
    const map = {
      1: "3-letter, 1 blank",
      2: "3-letter, 2 blanks",
      3: "4-letter, 1 blank",
      4: "4-letter, 2 blanks",
      5: "5-letter, 1 blank",
      6: "5-letter, 2 blanks",
      7: "5-letter, 3 blanks",
      8: "6-letter, 2 blanks",
      9: "6-letter, 3 blanks",
      10: "6-letter, 4 blanks",
      11: "7-letter, 2 blanks",
      12: "7-letter, 3 blanks",
      13: "7-letter, 4 blanks",
      14: "8-letter, 2 blanks",
      15: "8-letter, 3 blanks",
      16: "8-letter, 4 blanks",
      17: "9-letter, 3 blanks",
      18: "9-letter, 4 blanks",
      19: "10-letter, 3 blanks",
      20: "10-letter, 4 blanks"
    };
    return map[lvl] || "";
  };

  const getPosStyle = (pos) => {
    const clean = (pos || '').toLowerCase();
    if (clean === 'noun') return { background: 'rgba(74, 144, 226, 0.15)', color: '#4a90e2' };
    if (clean === 'verb') return { background: 'rgba(38, 222, 129, 0.15)', color: '#26de81' };
    if (clean === 'adjective') return { background: 'rgba(155, 89, 182, 0.15)', color: '#9b59b6' };
    if (clean === 'adverb') return { background: 'rgba(230, 126, 34, 0.15)', color: '#e67e22' };
    return { background: 'rgba(5, 196, 107, 0.15)', color: '#05c46b' };
  };

  if (showLevelSelect) {
    const levels = Array.from({ length: 20 }, (_, i) => i + 1);
    const filteredLevels = levels.filter(lvl => 
      `level ${lvl}`.includes(levelSearch.toLowerCase()) || 
      getLevelDesc(lvl).toLowerCase().includes(levelSearch.toLowerCase())
    );

    return (
      <QuizLayout title="Word Creator" subtitle="Select difficulty level to start playing" onBack={onBack}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Cumulative Language XP: <span style={{ color: 'var(--clr-accent, #05c46b)' }}>{totalXp} XP</span></div>
        </div>
        
        <div className="search-bar-row">
          <input
            className="search-bar"
            type="text"
            placeholder="Search levels (e.g., '3 blanks' or 'Level 5')…"
            value={levelSearch}
            onChange={e => setLevelSearch(e.target.value)}
          />
        </div>

        <div className="menu-grid">
          {filteredLevels.map((lvl) => (
            <button 
              key={lvl} 
              className="menu-card green" 
              onClick={() => { 
                setLevel(lvl); 
                setPuzzleIndex(1); 
                initPuzzleStats();
                setShowResults(false);
                setShowLevelSelect(false); 
              }}
            >
              <span className="menu-title">Level {lvl}</span>
              <span className="menu-subtitle">{getLevelDesc(lvl)}</span>
            </button>
          ))}
        </div>
      </QuizLayout>
    );
  }

  if (showResults) {
    // Calculate level totals
    const statsArray = Object.values(puzzleStats);
    const totalLevelXp = statsArray.reduce((sum, s) => sum + s.xpGained, 0);
    const totalLevelTime = statsArray.reduce((sum, s) => sum + s.timeSpent, 0);
    const totalCorrectWords = statsArray.reduce((sum, s) => sum + s.correctWords.length, 0);
    const totalWrongAttempts = statsArray.reduce((sum, s) => sum + s.wrongAttempts.length, 0);
    
    const accuracy = totalCorrectWords + totalWrongAttempts > 0 
      ? Math.round((totalCorrectWords / (totalCorrectWords + totalWrongAttempts)) * 100)
      : 100;

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    return (
      <QuizLayout 
        title={`Results · Level ${level}`} 
        subtitle="Level completion stats and performance report" 
        onBack={() => setShowLevelSelect(true)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>XP Gained</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--clr-accent, #05c46b)' }}>+{totalLevelXp} XP</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total Time</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ffc107' }}>{formatTime(totalLevelTime)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Discovered</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4a90e2' }}>{totalCorrectWords}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Accuracy</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: accuracy >= 70 ? '#26de81' : '#f85149' }}>{accuracy}%</div>
            </div>
          </div>

          {/* Details Section */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--clr-accent, #05c46b)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10, marginBottom: 16 }}>
              Puzzle-by-Puzzle Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '500px', overflowY: 'auto', paddingRight: 8 }}>
              {Object.keys(puzzleStats).map((idxStr) => {
                const idx = parseInt(idxStr, 10);
                const stat = puzzleStats[idx];
                
                // Get list of missed common words
                const userWordsSet = new Set((stat.correctWords || []).map(w => w.word.toLowerCase()));
                const missedWords = (stat.solutions || []).filter(sol => !userWordsSet.has(sol.toLowerCase()));

                return (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: 16, 
                      borderRadius: 12, 
                      background: 'rgba(255,255,255,0.01)', 
                      border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', fontWeight: 600 }}>Puzzle {idx}</span>
                        <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', letterSpacing: 2, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 }}>
                          {stat.pattern || '...'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: '0.9rem' }}>
                        <span>Time Spent: <strong style={{ color: '#ffc107' }}>{stat.timeSpent}s</strong></span>
                        <span>XP: <strong style={{ color: 'var(--clr-accent, #05c46b)' }}>+{stat.xpGained} XP</strong></span>
                      </div>
                    </div>

                    {/* Discovered Words */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Discovered:</span>
                      {stat.correctWords && stat.correctWords.length > 0 ? (
                        <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
                          {stat.correctWords.map((item, wIdx) => (
                            <span 
                              key={wIdx} 
                              title={`${item.partOfSpeech || 'word'}: ${item.definition || ''}`} 
                              style={{ 
                                fontSize: '0.8rem', 
                                background: 'rgba(5, 196, 107, 0.12)', 
                                border: '1px solid rgba(5, 196, 107, 0.3)', 
                                color: '#26de81', 
                                padding: '2px 6px', 
                                borderRadius: 4, 
                                textTransform: 'uppercase',
                                cursor: 'help'
                              }}
                            >
                              {item.word}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#ff6b6b', fontStyle: 'italic' }}>None</span>
                      )}
                    </div>

                    {/* Missed Common Words */}
                    {missedWords.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Missed Common:</span>
                        <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
                          {missedWords.map((word, wIdx) => (
                            <span 
                              key={wIdx} 
                              style={{ 
                                fontSize: '0.8rem', 
                                background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                color: 'var(--clr-text-soft)', 
                                padding: '2px 6px', 
                                borderRadius: 4, 
                                textTransform: 'uppercase'
                              }}
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wrong Attempts */}
                    {stat.wrongAttempts && stat.wrongAttempts.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>Wrong Attempts:</span>
                        <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
                          {stat.wrongAttempts.map((attempt, wIdx) => (
                            <span 
                              key={wIdx} 
                              style={{ 
                                fontSize: '0.8rem', 
                                background: 'rgba(248, 81, 73, 0.12)', 
                                border: '1px solid rgba(248, 81, 73, 0.3)', 
                                color: '#ff6b6b', 
                                padding: '2px 6px', 
                                borderRadius: 4, 
                                textTransform: 'uppercase'
                              }}
                            >
                              {attempt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => {
              setShowLevelSelect(true);
              setShowResults(false);
            }}
            style={{ 
              alignSelf: 'center', 
              padding: '12px 32px', 
              fontSize: '1.1rem', 
              fontWeight: 'bold', 
              background: 'var(--clr-accent, #05c46b)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5,196,107,0.3)',
              transition: 'all 0.2s'
            }}
          >
            Back to Levels
          </button>
        </div>
      </QuizLayout>
    );
  }

  return (
    <QuizLayout 
      title={`Word Creator · Level ${level}`} 
      subtitle={getLevelDesc(level)} 
      onBack={() => setShowLevelSelect(true)}
      timer={timer}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 40, marginBottom: 20 }}>
        <div className="progress-pill center" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          Puzzle {puzzleIndex} of 20
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '1.05rem', fontWeight: 'bold', zIndex: 1 }}>
          XP: <span style={{ color: 'var(--clr-accent, #05c46b)' }}>{totalXp} XP</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
        {loading || !puzzle ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--clr-text-soft)' }}>Loading puzzle pattern...</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', width: '100%' }}>
            
            {/* Word Pattern Row */}
            <div className="question-box" style={{ margin: '12px 0' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {puzzle.pattern.split("").map((char, idx) => {
                  const isBlank = char === "_";
                  if (!isBlank) {
                    return (
                      <div 
                        key={idx} 
                        style={{
                          width: 44,
                          height: 48,
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}
                      >
                        {char}
                      </div>
                    );
                  } else {
                    const blankIdx = puzzle.blankIndices.indexOf(idx);
                    return (
                      <input
                        key={idx}
                        ref={el => inputRefs.current[blankIdx] = el}
                        type="text"
                        maxLength="1"
                        value={userInputs[blankIdx] || ""}
                        onChange={e => handleInputChange(e, blankIdx)}
                        onKeyDown={e => handleInputKeyDown(e, blankIdx)}
                        style={{
                          width: 44,
                          height: 48,
                          borderRadius: 8,
                          border: '2px solid var(--clr-accent, #05c46b)',
                          background: 'rgba(5, 196, 107, 0.05)',
                          color: 'inherit',
                          textAlign: 'center',
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          outline: 'none',
                          margin: '0 2px'
                        }}
                      />
                    );
                  }
                })}
              </div>
            </div>

            {puzzle.solutions && puzzle.solutions.length > 0 && (
              <div style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginTop: -8, marginBottom: 8, fontStyle: 'italic', textAlign: 'center' }}>
                {puzzle.solutions.length > 1 
                  ? `💡 Tip: At least ${puzzle.solutions.length} common words match this pattern! (${foundWords.length} found)`
                  : `💡 Tip: At least 1 common word matches this pattern! (${foundWords.length} found)`
                }
              </div>
            )}

            {feedback && (
              <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>
                {feedback}
              </div>
            )}

            <div className="button-row">
              {!revealed && (
                <button 
                  type="submit" 
                  disabled={submitting || userInputs.some(v => !v)}
                >
                  {submitting ? "Checking..." : "Verify Word"}
                </button>
              )}
            </div>
          </form>
        )}

        {/* Puzzle Navigation Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, width: '100%', maxWidth: '500px' }}>
          <button 
            disabled={puzzleIndex <= 1} 
            onClick={handlePrevPuzzle}
            style={{ padding: '6px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, color: 'inherit', cursor: 'pointer' }}
          >
            ← Previous Puzzle
          </button>
          {puzzleIndex < 20 ? (
            <button 
              disabled={foundWords.length === 0} 
              onClick={handleNextPuzzle}
              style={{ 
                padding: '6px 16px', 
                background: foundWords.length === 0 ? 'rgba(255,255,255,0.05)' : 'var(--clr-accent, #05c46b)', 
                border: foundWords.length === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none', 
                borderRadius: 6, 
                color: foundWords.length === 0 ? 'var(--clr-text-soft)' : '#fff', 
                cursor: foundWords.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: foundWords.length === 0 ? 'normal' : 'bold',
                transition: 'all var(--transition)'
              }}
            >
              Next Puzzle →
            </button>
          ) : (
            <button 
              disabled={foundWords.length === 0} 
              onClick={handleCompleteLevel}
              style={{ 
                padding: '6px 16px', 
                background: foundWords.length === 0 ? 'rgba(255,255,255,0.05)' : 'var(--clr-accent, #05c46b)', 
                border: foundWords.length === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none', 
                borderRadius: 6, 
                color: foundWords.length === 0 ? 'var(--clr-text-soft)' : '#fff', 
                cursor: foundWords.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: foundWords.length === 0 ? 'normal' : 'bold',
                transition: 'all var(--transition)'
              }}
            >
              Complete Level ✓
            </button>
          )}
        </div>

        {/* Discovered Words Listing */}
        <div className="found-words-section" style={{ marginTop: 24, width: '100%' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--clr-accent, #05c46b)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8, marginBottom: 12 }}>
            Created Words ({foundWords.length})
          </h3>
          {foundWords.length === 0 ? (
            <p style={{ color: 'var(--clr-text-soft)', fontStyle: 'italic', fontSize: '0.95rem', textAlign: 'center' }}>
              No words created yet for this puzzle. Try to solve the blanks!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {foundWords.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    padding: 16, 
                    borderRadius: 12, 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.06)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 6 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--clr-accent, #05c46b)', textTransform: 'uppercase' }}>{item.word}</strong>
                    {item.phonetic && <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>{item.phonetic}</span>}
                    {item.partOfSpeech && (
                      <span 
                        style={{ 
                          fontSize: '0.75rem', 
                          padding: '2px 6px', 
                          borderRadius: 4, 
                          fontStyle: 'italic', 
                          fontWeight: 600,
                          ...getPosStyle(item.partOfSpeech)
                        }}
                      >
                        {item.partOfSpeech}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', lineHeight: '1.4' }}>{item.definition}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </QuizLayout>
  );
}
