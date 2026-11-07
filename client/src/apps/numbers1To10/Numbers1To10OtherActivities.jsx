import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { NUMBERS_INFO, STROKE_DEFINITIONS, HAND_IMAGES } from './numbers1To10Data.js';
import './Numbers1To10App.css';

/**
 * Numbers1To10App — Tenali Number Foundations: Numbers 1 to 10 Module
 *
 * 4 Interactive Sub-modules:
 *   1. 🗣️ Number Names & Spoken Sound
 *   2. 🖐️ Count & Hand Gestures
 *   3. ✍️ Hand Gesture to Number Symbol (Stroke Builder)
 *   4. 🐰 Hopscotch Mat Adventure (Bunny Game)
 */
export default function Numbers1To10OtherActivities({
  onBack,
  completedTopics = [],
  markTopicCompleted,
  updateCoins
}) {
  // Global Active Tab: 'names' | 'quantity' | 'symbols' | 'game'
  const [activeTab, setActiveTab] = useState('names');
  const [starCount, setStarCount] = useState(0);
  const [starBump, setStarBump] = useState(false);

  // Audio Context Ref
  const audioCtxRef = useRef(null);

  // ==========================================
  // WEB AUDIO SYNTHESIZER
  // ==========================================
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const sfxTone = useCallback((freq, type = 'sine', duration = 0.12, gainLvl = 0.15) => {
    try {
      initAudio();
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainLvl, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [initAudio]);

  const sfxClick = useCallback(() => {
    sfxTone(400, 'triangle', 0.05, 0.12);
  }, [sfxTone]);

  const sfxSuccess = useCallback(() => {
    setTimeout(() => sfxTone(523.25, 'triangle', 0.12, 0.2), 0);
    setTimeout(() => sfxTone(659.25, 'triangle', 0.12, 0.2), 90);
    setTimeout(() => sfxTone(783.99, 'triangle', 0.16, 0.2), 180);
    setTimeout(() => sfxTone(1046.50, 'triangle', 0.26, 0.25), 270);
  }, [sfxTone]);

  const sfxBoing = useCallback(() => {
    sfxTone(350, 'sine', 0.08, 0.2);
    setTimeout(() => sfxTone(550, 'sine', 0.12, 0.2), 60);
  }, [sfxTone]);

  const sfxSnap = useCallback(() => {
    sfxTone(520, 'triangle', 0.08, 0.18);
    setTimeout(() => sfxTone(680, 'triangle', 0.12, 0.18), 70);
  }, [sfxTone]);

  const sfxDiceRoll = useCallback(() => {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        sfxTone(240 + Math.random() * 260, 'square', 0.04, 0.06);
      }, i * 50);
    }
  }, [sfxTone]);

  const sfxStamp = useCallback(() => {
    sfxTone(220, 'sine', 0.08, 0.2);
    setTimeout(() => sfxTone(880, 'triangle', 0.18, 0.2), 80);
  }, [sfxTone]);

  const awardStars = useCallback((qty = 1) => {
    setStarCount(prev => prev + qty);
    setStarBump(true);
    setTimeout(() => setStarBump(false), 400);

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 30 + qty * 10,
        spread: 55,
        origin: { y: 0.7 }
      });
    }

    if (typeof updateCoins === 'function') {
      try {
        updateCoins(qty);
      } catch {
        // Safe fallback
      }
    }
    if (typeof markTopicCompleted === 'function') {
      try {
        markTopicCompleted('numbers-1-to-10');
      } catch {
        // Safe fallback
      }
    }
  }, [updateCoins, markTopicCompleted]);

  // Modals state
  const [rewardModal, setRewardModal] = useState({ open: false, title: '', subtitle: '', emoji: '⭐' });
  const [tutorialModalOpen, setTutorialModalOpen] = useState(false);

  // ==========================================
  // MODULE 1: NUMBER NAMES STATE
  // ==========================================
  const [currentNameNum, setCurrentNameNum] = useState(1);

  const speakCurrentNumberName = useCallback((numOverride) => {
    const n = numOverride ?? currentNameNum;
    const item = NUMBERS_INFO[n - 1];
    if (!item) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(item.word);
        utt.rate = 0.9;
        utt.pitch = 1.15;
        window.speechSynthesis.speak(utt);
      } catch {
        sfxTone(440, 'triangle', 0.2, 0.2);
      }
    } else {
      sfxTone(440, 'triangle', 0.2, 0.2);
    }
  }, [currentNameNum, sfxTone]);

  const handleSelectName = (num) => {
    sfxClick();
    setCurrentNameNum(num);
    speakCurrentNumberName(num);
  };

  const handlePrevName = () => {
    sfxClick();
    const next = currentNameNum > 1 ? currentNameNum - 1 : 10;
    setCurrentNameNum(next);
    speakCurrentNumberName(next);
  };

  const handleNextName = () => {
    sfxClick();
    const next = currentNameNum < 10 ? currentNameNum + 1 : 1;
    setCurrentNameNum(next);
    speakCurrentNumberName(next);
  };

  // ==========================================
  // MODULE 2: COUNT & HAND GESTURES STATE
  // ==========================================
  const [targetQuantityNum, setTargetQuantityNum] = useState(3);
  const [quantityRolling, setQuantityRolling] = useState(false);
  const [gestureChoices, setGestureChoices] = useState([1, 3, 5, 8]);
  const [quantityFeedback, setQuantityFeedback] = useState(null); // { type: 'correct'|'wrong', msg: '' }
  const [selectedGesture, setSelectedGesture] = useState(null);

  const rollQuantityDice = useCallback(() => {
    sfxDiceRoll();
    setQuantityRolling(true);
    setQuantityFeedback(null);
    setSelectedGesture(null);

    setTimeout(() => {
      const newTarget = Math.floor(Math.random() * 10) + 1;
      setTargetQuantityNum(newTarget);

      // Generate 4 distinct options including correct
      const opts = [newTarget];
      while (opts.length < 4) {
        const r = Math.floor(Math.random() * 10) + 1;
        if (!opts.includes(r)) opts.push(r);
      }
      opts.sort(() => Math.random() - 0.5);
      setGestureChoices(opts);
      setQuantityRolling(false);
    }, 280);
  }, [sfxDiceRoll]);

  const handleChooseQuantity = (chosenVal) => {
    if (quantityRolling) return;
    setSelectedGesture(chosenVal);

    if (chosenVal === targetQuantityNum) {
      sfxSuccess();
      awardStars(1);
      setQuantityFeedback({ type: 'correct', msg: '⭐ Excellent! Correct hand gesture!' });
      setTimeout(() => {
        rollQuantityDice();
      }, 1600);
    } else {
      sfxBoing();
      setQuantityFeedback({ type: 'wrong', msg: 'Oops! Count the fingers again!' });
      setTimeout(() => {
        setSelectedGesture(null);
      }, 1200);
    }
  };

  // ==========================================
  // MODULE 3: GESTURE TO SYMBOL STATE
  // ==========================================
  const [currentSymbolNum, setCurrentSymbolNum] = useState(1);
  const [activeStrokes, setActiveStrokes] = useState([]);
  const [symbolCompleted, setSymbolCompleted] = useState(false);

  const initSymbolStrokes = useCallback((num) => {
    setCurrentSymbolNum(num);
    const defs = STROKE_DEFINITIONS[num] || [];
    setActiveStrokes(defs.map(s => ({ ...s, placed: false })));
    setSymbolCompleted(false);
  }, []);

  const handleTapStrokePiece = (type) => {
    if (symbolCompleted) return;
    const targetIdx = activeStrokes.findIndex(s => !s.placed && s.type === type);
    if (targetIdx !== -1) {
      placeStrokeAtIndex(targetIdx);
    } else {
      sfxTone(220, 'sine', 0.08, 0.1);
    }
  };

  const handleTapSlotDirectly = (idx) => {
    if (symbolCompleted) return;
    if (activeStrokes[idx] && !activeStrokes[idx].placed) {
      placeStrokeAtIndex(idx);
    }
  };

  const placeStrokeAtIndex = (idx) => {
    sfxSnap();
    const updated = [...activeStrokes];
    updated[idx] = { ...updated[idx], placed: true };
    setActiveStrokes(updated);

    const allPlaced = updated.every(s => s.placed);
    if (allPlaced) {
      sfxSuccess();
      awardStars(1);
      setSymbolCompleted(true);
    }
  };

  const handlePickRandomSymbol = () => {
    sfxClick();
    let next = Math.floor(Math.random() * 10) + 1;
    while (next === currentSymbolNum) {
      next = Math.floor(Math.random() * 10) + 1;
    }
    initSymbolStrokes(next);
  };

  const handleStampSymbol = () => {
    sfxStamp();
    awardStars(1);
    setRewardModal({
      open: true,
      title: 'Worksheet Star!',
      subtitle: `You recognized the hand gesture and built the numeral ${currentSymbolNum}! ⭐`,
      emoji: '⭐'
    });
    setTimeout(() => {
      handlePickRandomSymbol();
    }, 1400);
  };

  // ==========================================
  // MODULE 4: HOPPING BUNNY MAT STATE
  // ==========================================
  const [gameDiceTarget, setGameDiceTarget] = useState(1);
  const [gameDiceRolling, setGameDiceRolling] = useState(false);
  const [bunnyPadIndex, setBunnyPadIndex] = useState(1);
  const [bunnyHopClass, setBunnyHopClass] = useState(false);
  const [bunnyYayVisible, setBunnyYayVisible] = useState(false);

  const rollGameDice = useCallback(() => {
    sfxDiceRoll();
    setGameDiceRolling(true);

    setTimeout(() => {
      let next = Math.floor(Math.random() * 10) + 1;
      setGameDiceTarget(next);
      setGameDiceRolling(false);
    }, 280);
  }, [sfxDiceRoll]);

  const handleTapMatHopPad = (padNum) => {
    sfxBoing();
    setBunnyHopClass(true);
    setBunnyPadIndex(padNum);

    const isMatch = padNum === gameDiceTarget;

    setTimeout(() => {
      setBunnyHopClass(false);
      if (isMatch) {
        sfxSuccess();
        awardStars(2);
        setBunnyYayVisible(true);
        setTimeout(() => setBunnyYayVisible(false), 1300);
        setTimeout(() => {
          rollGameDice();
        }, 1500);
      } else {
        sfxTone(260, 'sine', 0.08, 0.15);
      }
    }, 350);
  };

  const resetBunnyToStart = () => {
    sfxClick();
    setBunnyPadIndex(1);
  };

  // Initial tab setup
  useEffect(() => {
    initSymbolStrokes(1);
    rollQuantityDice();
  }, [initSymbolStrokes, rollQuantityDice]);

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  // Hand Gestures Component
  const HandGestureGraphic = ({ count, isLarge = false }) => {
    const imgStyle = {
      height: isLarge ? '135px' : '88px',
      maxWidth: count > 5 ? '50%' : '100%',
      objectFit: 'contain',
      pointerEvents: 'none',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
      transition: 'transform 0.2s ease'
    };

    if (count <= 5) {
      const src = HAND_IMAGES[String(count)] || '';
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', userSelect: 'none' }}>
          {src ? (
            <img src={src} alt={`${count} fingers`} style={imgStyle} />
          ) : (
            <span style={{ fontSize: isLarge ? '4rem' : '2.5rem' }}>🖐️ {count}</span>
          )}
        </div>
      );
    } else {
      const rightFingers = count - 5;
      const leftSrc = HAND_IMAGES['5'] || '';
      const rightSrc = HAND_IMAGES[String(rightFingers)] || '';

      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', height: '100%', userSelect: 'none' }}>
          {/* Left Hand: Full 5 fingers (mirrored facing inward) */}
          {leftSrc && (
            <img src={leftSrc} alt="5 fingers" style={{ ...imgStyle, transform: 'scaleX(-1)' }} />
          )}
          {/* Right Hand: Remainder fingers */}
          {rightSrc && (
            <img src={rightSrc} alt={`${rightFingers} fingers`} style={imgStyle} />
          )}
        </div>
      );
    }
  };

  // Dice Pip Face Component (1 to 10 dots only - no numerals shown on die!)
  const DiceFace = ({ count }) => {
    const pipBg = '#111827';

    if (count <= 6) {
      const pipMap = {
        1: [4],
        2: [0, 8],
        3: [0, 4, 8],
        4: [0, 2, 6, 8],
        5: [0, 2, 4, 6, 8],
        6: [0, 2, 3, 5, 6, 8]
      };
      const pips = pipMap[count] || [];

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          width: '100%',
          height: '100%',
          padding: '6px',
          gap: '4px',
          placeItems: 'center'
        }}>
          {Array.from({ length: 9 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: pips.includes(idx) ? pipBg : 'transparent',
                boxShadow: pips.includes(idx) ? 'inset 0 2px 3px rgba(0,0,0,0.4)' : 'none'
              }}
            />
          ))}
        </div>
      );
    } else {
      const col1 = Math.ceil(count / 2);
      const col2 = Math.floor(count / 2);

      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', height: '100%', padding: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%', padding: '2px 0' }}>
            {Array.from({ length: col1 }).map((_, i) => (
              <div key={`c1-${i}`} style={{ width: '15px', height: '15px', background: pipBg, borderRadius: '50%', boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.4)' }} />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%', padding: '2px 0' }}>
            {Array.from({ length: col2 }).map((_, j) => (
              <div key={`c2-${j}`} style={{ width: '15px', height: '15px', background: pipBg, borderRadius: '50%', boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.4)' }} />
            ))}
          </div>
        </div>
      );
    }
  };

  const currentNumberData = NUMBERS_INFO[currentNameNum - 1] || NUMBERS_INFO[0];

  return (
    <div className="numbers-app-wrapper">
      {/* ============================================================ */}
      {/* TOP NAVBAR                                                   */}
      {/* ============================================================ */}
      <header className="numbers-nav-bar">
        <div className="numbers-nav-left">
          <button
            type="button"
            className="numbers-back-btn"
            onClick={onBack}
            title="Return to Menu"
          >
            ← Back
          </button>
          <div className="numbers-header-title">
            <h2>Tenali · Number Foundations</h2>
            <span className="numbers-header-subtitle">Numbers 1 to 10 Discovery & Mastery</span>
          </div>
        </div>

        <div className="numbers-nav-right">
          <div className={`numbers-star-pill ${starBump ? 'bump' : ''}`} title="Stars Earned">
            <span>⭐</span>
            <span>{starCount}</span>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 4-MODULE PILL TAB NAVIGATION                                 */}
      {/* ============================================================ */}
      <nav className="numbers-tab-group" role="tablist">
        <button
          type="button"
          className={`numbers-tab-btn ${activeTab === 'names' ? 'active' : ''}`}
          onClick={() => { sfxClick(); setActiveTab('names'); }}
        >
          <span>🗣️</span> <span>1. Names & Sound</span>
        </button>
        <button
          type="button"
          className={`numbers-tab-btn ${activeTab === 'quantity' ? 'active' : ''}`}
          onClick={() => { sfxClick(); setActiveTab('quantity'); }}
        >
          <span>🖐️</span> <span>2. Count & Hands</span>
        </button>
        <button
          type="button"
          className={`numbers-tab-btn ${activeTab === 'symbols' ? 'active' : ''}`}
          onClick={() => { sfxClick(); setActiveTab('symbols'); }}
        >
          <span>✍️</span> <span>3. Gesture to Symbol</span>
        </button>
        <button
          type="button"
          className={`numbers-tab-btn ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => { sfxClick(); setActiveTab('game'); }}
        >
          <span>🐰</span> <span>4. Hop Game</span>
        </button>
      </nav>

      {/* ============================================================ */}
      {/* TAB 1: NUMBER NAMES & SPOKEN VOICE                           */}
      {/* ============================================================ */}
      {activeTab === 'names' && (
        <section className="numbers-card">
          <div className="numbers-section-header">
            <div>
              <h1>Number Names & Sound</h1>
              <p className="numbers-subtitle">
                Tap the card to listen to the pronunciation and count the cheerful objects!
              </p>
            </div>
            <div className="numbers-status-pill">
              <span>🔊 Spoken Voice Active</span>
            </div>
          </div>

          <div className="names-arena">
            <div className="focus-card">
              <div className="focus-card-badge">Listen & Connect</div>
              <div className="big-digit">{currentNumberData.num}</div>

              <button
                type="button"
                className="voice-play-btn"
                onClick={() => speakCurrentNumberName()}
                title="Tap to hear pronunciation"
              >
                <span>🔊</span>
                <span>{currentNumberData.word.toUpperCase()}</span>
              </button>

              {/* Countable Items visualization */}
              <div className="countable-items-box">
                {Array.from({ length: currentNumberData.num }).map((_, i) => (
                  <span
                    key={i}
                    className="countable-item"
                    title={`Count ${i + 1}`}
                    onClick={() => sfxTone(350 + i * 40, 'sine', 0.08, 0.18)}
                  >
                    {currentNumberData.emoji}
                  </span>
                ))}
              </div>

              {/* Previous / Next Controls */}
              <div className="card-nav-row">
                <button
                  type="button"
                  className="numbers-btn-secondary"
                  onClick={handlePrevName}
                >
                  ◀ Previous
                </button>
                <button
                  type="button"
                  className="numbers-btn-primary"
                  onClick={handleNextName}
                >
                  Next ▶
                </button>
              </div>
            </div>

            {/* Quick 1-10 Jump Ribbon */}
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', marginBottom: '6px' }}>
                Jump to Number (1–10)
              </div>
              <div className="number-strip-grid">
                {NUMBERS_INFO.map(item => (
                  <button
                    key={item.num}
                    type="button"
                    className={`number-strip-btn ${item.num === currentNameNum ? 'active' : ''}`}
                    onClick={() => handleSelectName(item.num)}
                  >
                    {item.num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* TAB 2: COUNT & HAND GESTURES                                 */}
      {/* ============================================================ */}
      {activeTab === 'quantity' && (
        <section className="numbers-card">
          <div className="numbers-section-header">
            <div>
              <h1>Count & Hand Gestures</h1>
              <p className="numbers-subtitle">
                Count the dots on the die, then choose the authentic hand gesture showing that count!
              </p>
            </div>
            <button
              type="button"
              className="numbers-btn-primary"
              onClick={rollQuantityDice}
              disabled={quantityRolling}
            >
              <span>🎲</span> <span>Roll Die</span>
            </button>
          </div>

          {/* Dice Count Display Arena */}
          <div className="dice-count-arena">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div
                className={`dice-cube ${quantityRolling ? 'rolling' : ''}`}
                onClick={rollQuantityDice}
                title="Tap die to roll"
              >
                <DiceFace count={targetQuantityNum} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--clr-text-soft)' }}>
                Tap die to roll 🎲
              </span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Countable Pips:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '4px' }}>
                <span style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '2.8rem', fontWeight: 700, color: 'var(--clr-accent)' }}>
                  {targetQuantityNum}
                </span>
                <span style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', fontWeight: 500 }}>
                  dots on the die
                </span>
              </div>
              {quantityFeedback && (
                <div style={{
                  minHeight: '24px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  marginTop: '8px',
                  color: quantityFeedback.type === 'correct' ? 'var(--clr-correct)' : 'var(--clr-wrong)'
                }}>
                  {quantityFeedback.msg}
                </div>
              )}
            </div>
          </div>

          {/* Hand Gesture Choice Cards */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--clr-text)' }}>
                Which hand shows this number of fingers?
              </span>
              <span className="numbers-status-pill" style={{ fontSize: '0.75rem' }}>
                Tenali Hand Art
              </span>
            </div>

            <div className="gestures-grid">
              {gestureChoices.map(num => {
                const isSelected = selectedGesture === num;
                const isCorrect = isSelected && num === targetQuantityNum;
                const isWrong = isSelected && num !== targetQuantityNum;

                let cardClass = 'gesture-card';
                if (isCorrect) cardClass += ' correct';
                if (isWrong) cardClass += ' wrong';

                return (
                  <div
                    key={num}
                    className={cardClass}
                    onClick={() => handleChooseQuantity(num)}
                  >
                    <div style={{ height: '105px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                      <HandGestureGraphic count={num} isLarge={false} />
                    </div>
                    <div style={{
                      marginTop: '8px',
                      width: '100%',
                      paddingTop: '6px',
                      borderTop: '1px solid var(--clr-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--clr-text-soft)' }}>
                        Hand Pattern
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* TAB 3: GESTURE TO SYMBOL (STROKE BUILDER & TRACING)          */}
      {/* ============================================================ */}
      {activeTab === 'symbols' && (
        <section className="numbers-card">
          <div className="numbers-section-header">
            <div>
              <h1>Hand Gesture to Number Symbol</h1>
              <p className="numbers-subtitle">
                Look at the fingers alone, then construct the numeral using elementary standing, sleeping, and curved lines!
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="numbers-btn-secondary"
                style={{ fontSize: '0.82rem', padding: '8px 14px' }}
                onClick={handlePickRandomSymbol}
              >
                <span>🎲 New Hand</span>
              </button>
              <button
                type="button"
                className="numbers-btn-secondary"
                style={{ fontSize: '0.82rem', padding: '8px 14px' }}
                onClick={() => initSymbolStrokes(currentSymbolNum)}
              >
                <span>🧹 Reset</span>
              </button>
            </div>
          </div>

          <div className="symbol-layout-grid">
            {/* LEFT: Hand Gesture Alone */}
            <div className="symbol-hand-card">
              <div style={{ width: '100%' }}>
                <span className="numbers-status-pill" style={{ fontSize: '0.74rem' }}>
                  Count the Fingers!
                </span>
                <p style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)', marginTop: '6px' }}>
                  Recognize the quantity from the hand alone:
                </p>

                <div className="hand-preview-frame">
                  <HandGestureGraphic count={currentSymbolNum} isLarge={true} />
                </div>
              </div>

              {/* Number Strip Selector */}
              <div style={{ width: '100%', borderTop: '1px solid var(--clr-border)', paddingTop: '12px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--clr-text-soft)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Practice Number:
                </div>
                <div className="symbol-number-strip">
                  {NUMBERS_INFO.map(item => (
                    <button
                      key={item.num}
                      type="button"
                      className={`symbol-number-btn ${item.num === currentSymbolNum ? 'active' : ''}`}
                      onClick={() => initSymbolStrokes(item.num)}
                    >
                      {item.num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Stroke Builder Assembly Canvas */}
            <div>
              {/* Pieces Palette */}
              <div className="stroke-palette-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--clr-text)' }}>
                    Tap Line Piece or Target Slot to Snap:
                  </span>
                  <span className="numbers-status-pill" style={{ fontSize: '0.7rem' }}>
                    Modular Strokes
                  </span>
                </div>

                <div className="stroke-pieces-row">
                  {/* Standing Line */}
                  <div
                    className="stroke-piece"
                    onClick={() => handleTapStrokePiece('standing')}
                    title="Standing Line (|)"
                  >
                    <div style={{ width: '8px', height: '36px', background: 'var(--clr-accent)', borderRadius: '999px', margin: '4px 0' }} />
                    <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>Standing</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--clr-text-soft)' }}>| Line</span>
                  </div>

                  {/* Sleeping Line */}
                  <div
                    className="stroke-piece"
                    onClick={() => handleTapStrokePiece('sleeping')}
                    title="Sleeping Line (—)"
                  >
                    <div style={{ width: '36px', height: '8px', background: 'var(--clr-accent)', borderRadius: '999px', margin: '18px 0' }} />
                    <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>Sleeping</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--clr-text-soft)' }}>— Line</span>
                  </div>

                  {/* Slanting Line */}
                  <div
                    className="stroke-piece"
                    onClick={() => handleTapStrokePiece('slant')}
                    title="Slanting Line (/)"
                  >
                    <div style={{ width: '8px', height: '36px', background: 'var(--clr-accent)', borderRadius: '999px', margin: '4px 0', transform: 'rotate(45deg)' }} />
                    <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>Slanting</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--clr-text-soft)' }}>/ Line</span>
                  </div>

                  {/* Curve Arc */}
                  <div
                    className="stroke-piece"
                    onClick={() => handleTapStrokePiece('curve-right')}
                    title="Right Curve ())"
                  >
                    <svg viewBox="0 0 40 40" style={{ width: '32px', height: '32px', margin: '4px 0', stroke: 'var(--clr-accent)', fill: 'none', strokeWidth: 6, strokeLinecap: 'round' }}>
                      <path d="M 12,8 C 30,8 30,32 12,32" />
                    </svg>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>Curve</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--clr-text-soft)' }}>) Arc</span>
                  </div>

                  {/* Circle / Loop */}
                  <div
                    className="stroke-piece"
                    onClick={() => handleTapStrokePiece('circle')}
                    title="Circle (O)"
                  >
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '5px solid var(--clr-accent)', margin: '7px 0', boxSizing: 'border-box' }} />
                    <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>Circle</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--clr-text-soft)' }}>◯ Shape</span>
                  </div>
                </div>
              </div>

              {/* Target Number Assembly Canvas */}
              <div className="stroke-board-frame">
                <svg viewBox="0 0 320 280" style={{ width: '100%', maxHeight: '270px' }}>
                  {activeStrokes.map((stroke, idx) => {
                    if (!stroke.placed) {
                      return (
                        <path
                          key={stroke.id || idx}
                          d={stroke.path}
                          fill="none"
                          stroke="var(--clr-border, rgba(255, 245, 230, 0.3))"
                          strokeWidth="24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray="8 10"
                          className="stroke-slot-highlight"
                          onClick={() => handleTapSlotDirectly(idx)}
                        />
                      );
                    } else {
                      return (
                        <path
                          key={stroke.id || idx}
                          d={stroke.path}
                          fill="none"
                          stroke="var(--clr-accent, #e8864a)"
                          strokeWidth="24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      );
                    }
                  })}
                </svg>
              </div>

              {/* Status and Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', gap: '10px' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: symbolCompleted ? 'var(--clr-correct)' : 'var(--clr-accent)' }}>
                  {symbolCompleted ? (
                    <span>🎉 Yay! You built the number {currentSymbolNum} symbol!</span>
                  ) : (
                    <span>💡 Count the hand on the left, then tap matching lines to build the number!</span>
                  )}
                </div>

                {symbolCompleted && (
                  <button
                    type="button"
                    className="numbers-btn-primary"
                    onClick={handleStampSymbol}
                  >
                    <span>⭐ Stamp Star!</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* TAB 4: HOPPING MAT ADVENTURE (BUNNY GAME)                    */}
      {/* ============================================================ */}
      {activeTab === 'game' && (
        <section className="numbers-card">
          <div className="numbers-section-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="numbers-status-pill" style={{ fontSize: '0.74rem' }}>
                  Module 4
                </span>
                <button
                  type="button"
                  className="numbers-btn-secondary"
                  style={{ fontSize: '0.76rem', padding: '4px 10px' }}
                  onClick={() => setTutorialModalOpen(true)}
                >
                  <span>👀 How to Play</span>
                </button>
              </div>
              <h1>Hopscotch Mat Adventure</h1>
              <p className="numbers-subtitle">
                Count each dot on the die with your finger, then help Bunny hop to that number pad below!
              </p>
            </div>

            <button
              type="button"
              className="numbers-btn-primary"
              onClick={rollGameDice}
              disabled={gameDiceRolling}
            >
              <span>🎲</span> <span>Roll Dice!</span>
            </button>
          </div>

          {/* Countable Dice Arena (NO NUMBERS PRINTED ON DIE) */}
          <div className="dice-count-arena" style={{ justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                className={`dice-cube ${gameDiceRolling ? 'rolling' : ''}`}
                style={{ width: '110px', height: '110px' }}
                onClick={rollGameDice}
                title="Tap die to roll"
              >
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DiceFace count={gameDiceTarget} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-accent)', textTransform: 'uppercase' }}>
                  Count The Dots:
                </div>
                <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--clr-text)', margin: '2px 0 0 0' }}>
                  Count each pip on the cube, then tap the matching pad below!
                </p>
              </div>
            </div>

            <div className="numbers-status-pill">
              <span>👆 Count dots ➔ Tap pad</span>
            </div>
          </div>

          {/* 10-Pad Hopping Mat */}
          <div className="bunny-track-container">
            <div className="bunny-track-scroll">
              {/* Animated Bunny Token Track */}
              <div className="bunny-token-holder">
                <div
                  className={`bunny-avatar-token ${bunnyHopClass ? 'hop-spring' : ''}`}
                  style={{ left: `${(bunnyPadIndex - 1) * 9.8}%` }}
                >
                  {bunnyYayVisible && (
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      background: 'var(--clr-correct)',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      marginBottom: '2px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}>
                      HOP! ⭐
                    </div>
                  )}
                  <span>🐰</span>
                </div>
              </div>

              {/* 10 Hop Pads */}
              <div className="hop-pads-grid">
                {Array.from({ length: 10 }).map((_, i) => {
                  const padNum = i + 1;
                  return (
                    <div
                      key={padNum}
                      className="hop-pad"
                      onClick={() => handleTapMatHopPad(padNum)}
                    >
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--clr-text-soft)' }}>
                        Step
                      </span>
                      <span className="pad-number">{padNum}</span>
                      <span style={{ fontSize: '0.8rem' }}>⭐</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text-soft)', marginTop: '14px' }}>
                <span>🌱 Start (Pad 1)</span>
                <span>Count dots ➔ Tap matching pad!</span>
                <span>Finish (Pad 10) 🏆</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '0.82rem', color: 'var(--clr-text-soft)' }}>
            <span>Help Bunny hop step-by-step across all 10 pads!</span>
            <button
              type="button"
              className="numbers-btn-secondary"
              style={{ fontSize: '0.78rem', padding: '4px 12px' }}
              onClick={resetBunnyToStart}
            >
              Reset Bunny to 1
            </button>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* MODAL: HOW TO PLAY TUTORIAL                                  */}
      {/* ============================================================ */}
      {tutorialModalOpen && (
        <div className="numbers-modal-overlay">
          <div className="numbers-modal-card">
            <button
              type="button"
              className="numbers-modal-close"
              onClick={() => setTutorialModalOpen(false)}
              title="Close"
            >
              ✕
            </button>
            <h2 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--clr-text)', margin: '0 0 6px 0' }}>
              How to Play Hopscotch Mat
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--clr-text-soft)', marginBottom: '16px' }}>
              Count the dots on the die, then tap the pad with the same number to help Bunny hop!
            </p>

            <div style={{
              background: 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius)',
              padding: '18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around'
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                background: '#fff',
                border: '2px solid #111',
                borderRadius: '12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                padding: '6px',
                placeItems: 'center'
              }}>
                <div style={{ width: '8px', height: '8px', background: '#111', borderRadius: '50%' }} /><div /><div />
                <div /><div style={{ width: '8px', height: '8px', background: '#111', borderRadius: '50%' }} /><div />
                <div /><div /><div style={{ width: '8px', height: '8px', background: '#111', borderRadius: '50%' }} />
              </div>
              <span style={{ fontSize: '1.6rem', color: 'var(--clr-accent)' }}>➔</span>
              <div style={{
                width: '50px',
                height: '60px',
                background: 'var(--clr-input)',
                border: '2px solid var(--clr-accent)',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--clr-accent)' }}>
                  3
                </span>
                <span style={{ fontSize: '0.7rem' }}>⭐</span>
              </div>
            </div>

            <button
              type="button"
              className="numbers-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setTutorialModalOpen(false)}
            >
              👍 Let's Play!
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: STAR REWARD DIALOG                                    */}
      {/* ============================================================ */}
      {rewardModal.open && (
        <div className="numbers-modal-overlay">
          <div className="numbers-modal-card">
            <div style={{ fontSize: '3.5rem', marginBottom: '6px' }}>
              {rewardModal.emoji}
            </div>
            <h3 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--clr-text)', margin: '0 0 4px 0' }}>
              {rewardModal.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '16px' }}>
              {rewardModal.subtitle}
            </p>
            <div style={{ fontSize: '1.6rem', marginBottom: '20px' }}>
              ⭐ ⭐ ⭐
            </div>
            <button
              type="button"
              className="numbers-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setRewardModal(prev => ({ ...prev, open: false }))}
            >
              Keep Going! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
