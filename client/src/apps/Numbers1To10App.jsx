import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import SpaceMazeAdventure from './SpaceMazeAdventure.jsx';
import NumberTracingApp from './NumberTracingApp.jsx';
import './Numbers1To10App.css';

const NUMBER_WORDS = {
  1: 'One',
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
  7: 'Seven',
  8: 'Eight',
  9: 'Nine',
  10: 'Ten'
};

/**
 * Numbers1To10App — Hopscotch Mat Adventure
 *
 * Dedicated Number Foundations module:
 * - Start position for Bunny outside the 10-card mat (Position 0).
 * - Left & Right Arrow controls to hop over the pads step-by-step.
 * - When die rolls N, the first N cards glow.
 * - As Bunny hops over each pad, it stops glowing.
 * - Cards are hidden initially; when Bunny reaches the target card,
 *   it flips, reveals the numeral, speaks the number name, and celebrates!
 */
// 3D Cartoon Click Hand Cursor for tutorials and visual hints (zero text, pure tactile clicking animation)
function ClickHandCursor({ isPressed = false, isContinuous = false }) {
  return (
    <div
      className={`tutorial-click-hand ${isPressed ? 'is-pressed' : ''} ${isContinuous ? 'is-continuous' : ''}`}
      aria-hidden="true"
    >
      <div className="hand-tap-ripple" />
      <svg
        className="hand-pointer-svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#78350f"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"
          fill="#fbbf24"
        />
        <path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" fill="#fde047" />
        <path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" fill="#fde047" />
        <path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" fill="#fef08a" />
      </svg>
    </div>
  );
}

export default function Numbers1To10App({
  onBack,
  completedTopics = [],
  markTopicCompleted,
  updateCoins
}) {
  const [activeTab, setActiveTab] = useState('trace'); // 'trace' | 'hopscotch' | 'maze'
  const [starCount, setStarCount] = useState(0);
  const [starBump, setStarBump] = useState(false);

  // Bunny Position: 0 = Start Burrow (outside mat), 1..10 = Number Cards
  const [bunnyPos, setBunnyPos] = useState(0);
  const [bunnyHopSpring, setBunnyHopSpring] = useState(false);
  const [bunnyYayVisible, setBunnyYayVisible] = useState(false);

  // Target count from dice roll (1 to 10)
  const [gameDiceTarget, setGameDiceTarget] = useState(0);
  const [gameDiceRolling, setGameDiceRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  // Dice values: [val] for 1..6, [val1, val2] for 7..10 with non-repeating numbers
  const [currentDiceValues, setCurrentDiceValues] = useState([0]);

  // Non-repeating random number pool (ensures numbers 1..10 cycle without immediate repeats)
  const remainingNumbersRef = useRef([]);
  const lastRolledNumberRef = useRef(null);

  // Currently revealed pad for this round (revealed ONLY when reaching the right card!)
  const [revealedPad, setRevealedPad] = useState(null);
  const [discoveredNumbers, setDiscoveredNumbers] = useState(new Set());

  // Interactive demo guide state (guides first-time play: 1. Click Roll -> 2. Click Hop)
  const [demoCompleted, setDemoCompleted] = useState(false);

  // Subway Surfers / Temple Run style interactive tutorial demo state
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoHandPos, setDemoHandPos] = useState({ target: 'none', clicking: false });
  const demoTimersRef = useRef([]);

  // Round message & lock
  const [feedbackMsg, setFeedbackMsg] = useState('🎲 Roll the die to play!');
  const [targetReached, setTargetReached] = useState(false);

  // Auto-roll timer ref
  const autoRollTimerRef = useRef(null);

  // Dedicated Confetti Canvas Instance Ref (prevents body insertion & scrollbar flicker)
  const confettiCanvasRef = useRef(null);
  const confettiInstanceRef = useRef(null);

  useEffect(() => {
    if (confettiCanvasRef.current && typeof confetti === 'function' && typeof confetti.create === 'function') {
      try {
        confettiInstanceRef.current = confetti.create(confettiCanvasRef.current, {
          resize: true,
          useWorker: true
        });
      } catch {
        // Fallback to default
      }
    }
    return () => {
      if (confettiInstanceRef.current) {
        try {
          confettiInstanceRef.current.reset();
        } catch {
          // Safe fallback
        }
      }
    };
  }, []);

  // Modals
  const [tutorialModalOpen, setTutorialModalOpen] = useState(false);
  const [rewardModal, setRewardModal] = useState({ open: false, title: '', subtitle: '', emoji: '⭐' });

  // Web Audio Context Ref
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
      // Audio fallback
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

  // Video-game coin pickup chime (classic B5 -> E6 crystal chime)
  const sfxCoin = useCallback(() => {
    sfxTone(987.77, 'sine', 0.07, 0.18);
    setTimeout(() => sfxTone(1318.51, 'sine', 0.24, 0.22), 65);
  }, [sfxTone]);

  const sfxDiceRoll = useCallback(() => {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        sfxTone(240 + Math.random() * 260, 'square', 0.04, 0.06);
      }, i * 50);
    }
  }, [sfxTone]);

  // Voice speech pronunciation (speaks number name when hopping)
  const speakNumberName = useCallback((num) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const word = NUMBER_WORDS[num] || String(num);
        const utt = new SpeechSynthesisUtterance(word);
        utt.rate = 0.95;
        utt.pitch = 1.15;
        window.speechSynthesis.speak(utt);
      } catch {
        // Fallback
      }
    }
  }, []);

  const awardStars = useCallback((qty = 2) => {
    setStarCount(prev => prev + qty);
    setStarBump(true);
    setTimeout(() => setStarBump(false), 400);

    if (confettiInstanceRef.current) {
      try {
        confettiInstanceRef.current({
          particleCount: 35 + qty * 10,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // Fallback
      }
    } else if (typeof confetti === 'function') {
      confetti({
        particleCount: 35 + qty * 10,
        spread: 60,
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

  // Helper to pick next number (1 to 10) guaranteeing no consecutive repeats
  const getNextRandomNumber = useCallback(() => {
    if (remainingNumbersRef.current.length === 0) {
      const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      // Fisher-Yates shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      // If the next number to pop matches the last rolled number, swap it with another index
      if (lastRolledNumberRef.current !== null && pool[pool.length - 1] === lastRolledNumberRef.current) {
        const swapIdx = Math.floor(Math.random() * (pool.length - 1));
        [pool[pool.length - 1], pool[swapIdx]] = [pool[swapIdx], pool[pool.length - 1]];
      }
      remainingNumbersRef.current = pool;
    }

    let next = remainingNumbersRef.current.pop();

    // Absolute safeguard: if somehow identical to previous roll, swap or pick alternative
    if (next === lastRolledNumberRef.current) {
      if (remainingNumbersRef.current.length > 0) {
        const alt = remainingNumbersRef.current.pop();
        remainingNumbersRef.current.push(next);
        next = alt;
      } else {
        const candidates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(n => n !== lastRolledNumberRef.current);
        next = candidates[Math.floor(Math.random() * candidates.length)];
      }
    }

    lastRolledNumberRef.current = next;
    return next;
  }, []);

  // Split target numbers into dice values (1..6: 1 die; 7..10: 2 dice with non-repeating numbers)
  const DICE_SPLITS = {
    7: [4, 3],
    8: [5, 3],
    9: [5, 4],
    10: [6, 4]
  };

  // Clear all demo timers safely
  const clearDemoTimers = useCallback(() => {
    demoTimersRef.current.forEach(t => clearTimeout(t));
    demoTimersRef.current = [];
  }, []);

  // Stop / Skip demo and restore game to fresh start
  const stopDemo = useCallback(() => {
    clearDemoTimers();
    setDemoActive(false);
    setDemoStep(0);
    setDemoHandPos({ target: 'none', clicking: false });
    setBunnyPos(0);
    setHasRolled(false);
    setGameDiceTarget(0);
    setCurrentDiceValues([0]);
    setRevealedPad(null);
    setTargetReached(false);
    setBunnyYayVisible(false);
    setFeedbackMsg('🎲 Roll the die to play!');
  }, [clearDemoTimers]);

  // Subway Surfers / Temple Run Style Animated Playable Tutorial Demo
  const startDemo = useCallback(() => {
    clearDemoTimers();
    if (autoRollTimerRef.current) clearTimeout(autoRollTimerRef.current);
    // Reset state for tutorial run
    setBunnyPos(0);
    setHasRolled(false);
    setGameDiceTarget(0);
    setCurrentDiceValues([0]);
    setRevealedPad(null);
    setTargetReached(false);
    setBunnyYayVisible(false);
    setTutorialModalOpen(false);
    setDemoActive(true);
    setDemoStep(1);
    setDemoHandPos({ target: 'dice', clicking: false });
    setFeedbackMsg('🎬 Demo: Tap dice to start!');

    // Step 1: Hand taps Dice at t = 1.3s
    const t1 = setTimeout(() => {
      setDemoHandPos({ target: 'dice', clicking: true });
      sfxClick();
      sfxDiceRoll();
      setGameDiceRolling(true);

      const t2 = setTimeout(() => {
        setDemoHandPos({ target: 'dice', clicking: false });
        const demoTarget = 8;
        setGameDiceTarget(demoTarget);
        setCurrentDiceValues(DICE_SPLITS[8] || [5, 3]);
        setHasRolled(true);
        setGameDiceRolling(false);
        setDemoStep(3);
        setFeedbackMsg('🎬 Demo: Rolled 8 (5 and 3)! Now tap Hop ▶ to jump!');
        // Move hand down to Hop button
        setDemoHandPos({ target: 'hop', clicking: false });

        // Sequential 8 hops to demonstrate the full path to 8 with voice counting
        const hopDelayBase = 720;
        for (let hopNum = 1; hopNum <= 8; hopNum++) {
          const hopTimer = setTimeout(() => {
            setDemoHandPos({ target: 'hop', clicking: true });
            sfxClick();
            sfxBoing();
            setTimeout(() => sfxCoin(), 60);
            // Voice counts the number for each hop out loud!
            speakNumberName(hopNum);
            setBunnyHopSpring(true);
            setBunnyPos(hopNum);
            setDemoStep(3 + hopNum);
            setFeedbackMsg(`🎬 Demo: Bunny hops to ${hopNum}! 🥕`);

            const liftTimer = setTimeout(() => {
              setBunnyHopSpring(false);
              setDemoHandPos({ target: 'hop', clicking: false });

              if (hopNum === 8) {
                setDemoHandPos({ target: 'none', clicking: false });
                setTargetReached(true);
                sfxSuccess();
                setRevealedPad(8);
                setBunnyYayVisible(true);
                setFeedbackMsg('🎉 Demo: Reached 8! Card flips and reveals! ⭐');

                if (confettiInstanceRef.current) {
                  try {
                    confettiInstanceRef.current({
                      particleCount: 50,
                      spread: 60,
                      origin: { y: 0.7 }
                    });
                  } catch {
                    // safe fallback
                  }
                }

                const finishTimer = setTimeout(() => {
                  setDemoStep(12);
                }, 1200);
                demoTimersRef.current.push(finishTimer);
              }
            }, 260);
            demoTimersRef.current.push(liftTimer);
          }, 850 + (hopNum - 1) * hopDelayBase);
          demoTimersRef.current.push(hopTimer);
        }
      }, 350);
      demoTimersRef.current.push(t2);
    }, 1300);
    demoTimersRef.current.push(t1);
  }, [clearDemoTimers, sfxBoing, sfxClick, sfxCoin, sfxDiceRoll, sfxSuccess, speakNumberName]);

  // Roll die with random count from 1 to 10
  const rollGameDice = useCallback(() => {
    if (demoActive) return;
    if (gameDiceRolling) return;
    if (autoRollTimerRef.current) clearTimeout(autoRollTimerRef.current);
    sfxDiceRoll();
    setGameDiceRolling(true);
    setTargetReached(false);
    setRevealedPad(null); // Cards reset to blank for the new roll!
    setBunnyPos(0); // Reset bunny to start burrow above cards
    setBunnyYayVisible(false);

    setTimeout(() => {
      const next = getNextRandomNumber();
      setGameDiceTarget(next);
      if (next <= 6) {
        setCurrentDiceValues([next]);
      } else {
        setCurrentDiceValues(DICE_SPLITS[next] || [Math.ceil(next / 2), Math.floor(next / 2)]);
      }
      setHasRolled(true);
      setGameDiceRolling(false);
      setFeedbackMsg(`🐰 Hop ${next} times!`);
    }, 280);
  }, [demoActive, gameDiceRolling, getNextRandomNumber, sfxDiceRoll]);

  // Check if bunny has landed on target
  const handleBunnyLanded = useCallback((newPos, target) => {
    if (newPos === target) {
      setTargetReached(true);
      sfxSuccess();
      awardStars(2);

      // Flip & reveal ONLY this right card!
      setRevealedPad(target);
      setDiscoveredNumbers(prev => new Set(prev).add(target));

      setBunnyYayVisible(true);
      setFeedbackMsg(`🎉 You reached ${target}!`);

      // Auto roll next round after celebration (1.75 seconds)
      if (autoRollTimerRef.current) clearTimeout(autoRollTimerRef.current);
      autoRollTimerRef.current = setTimeout(() => {
        rollGameDice();
      }, 1750);
    } else if (newPos > target) {
      sfxBoing();
      setFeedbackMsg(`◀ Step back to ${target}!`);
    } else {
      const left = target - newPos;
      setFeedbackMsg(`🥕 ${left} more to go!`);
    }
  }, [awardStars, rollGameDice, sfxBoing, sfxSuccess, speakNumberName]);

  // Hop to a specific position with animation
  const hopToPosition = useCallback((targetPos) => {
    if (targetPos < 0 || (gameDiceTarget > 0 && targetPos > gameDiceTarget)) return;
    sfxBoing();
    // Video-game coin pickup sound when hopping forward onto a carrot
    if (targetPos > bunnyPos && targetPos <= gameDiceTarget) {
      setTimeout(() => sfxCoin(), 70);
    }
    // Voice counts the number on every hop (without revealing the card)!
    if (targetPos >= 1 && targetPos <= 10) {
      speakNumberName(targetPos);
    }
    setBunnyHopSpring(true);
    setBunnyPos(targetPos);
    if (!demoCompleted) setDemoCompleted(true);

    setTimeout(() => {
      setBunnyHopSpring(false);
      handleBunnyLanded(targetPos, gameDiceTarget);
    }, 320);
  }, [bunnyPos, demoCompleted, gameDiceTarget, handleBunnyLanded, sfxBoing, sfxCoin, speakNumberName]);

  // Arrow control: Hop Right (forward)
  const hopRight = useCallback(() => {
    if (demoActive) return;
    if (!hasRolled) {
      setFeedbackMsg('🎲 Roll the die first!');
      sfxBoing();
      return;
    }
    // Stop hopping once reached the number shown in dice!
    if (bunnyPos >= gameDiceTarget || targetReached || gameDiceRolling) return;
    hopToPosition(bunnyPos + 1);
  }, [demoActive, hasRolled, bunnyPos, gameDiceTarget, targetReached, gameDiceRolling, hopToPosition, sfxBoing]);

  // Arrow control: Hop Left (backward)
  const hopLeft = useCallback(() => {
    if (demoActive) return;
    if (!hasRolled) {
      setFeedbackMsg('🎲 Roll the die first!');
      sfxBoing();
      return;
    }
    if (bunnyPos <= 0 || targetReached || gameDiceRolling) return;
    hopToPosition(bunnyPos - 1);
  }, [demoActive, hasRolled, bunnyPos, targetReached, gameDiceRolling, hopToPosition, sfxBoing]);

  // Keyboard navigation for arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (demoActive || targetReached) return;
      if (e.key === 'ArrowRight' || e.key === 'Right') {
        e.preventDefault();
        hopRight();
      } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        e.preventDefault();
        hopLeft();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [demoActive, targetReached, hopRight, hopLeft]);

  // Auto-play tutorial demo as soon as user enters the module
  useEffect(() => {
    const timer = setTimeout(() => {
      startDemo();
    }, 200);
    demoTimersRef.current.push(timer);

    return () => {
      clearTimeout(timer);
    };
  }, [startDemo]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearDemoTimers();
      if (autoRollTimerRef.current) clearTimeout(autoRollTimerRef.current);
    };
  }, [clearDemoTimers]);

  // Dice Pip Face Component (Standard 1 to 6 dots on 3x3 grid)
  const DiceFace = ({ count, isDuo = false }) => {
    const pipBg = '#111827';

    if (!hasRolled || count <= 0) {
      return (
        <div className="dice-unrolled-face">
          <span style={{ fontSize: isDuo ? '1.5rem' : '2.1rem' }}>🎲</span>
          <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
            Roll!
          </span>
        </div>
      );
    }

    const pipMap = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };
    const pips = pipMap[count] || [];
    const dotSize = isDuo ? '11px' : '13px';

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          width: '100%',
          height: '100%',
          padding: isDuo ? '3px' : '4px',
          gap: isDuo ? '2px' : '3px',
          placeItems: 'center'
        }}
      >
        {Array.from({ length: 9 }).map((_, idx) => (
          <div
            key={idx}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              background: pips.includes(idx) ? pipBg : 'transparent',
              boxShadow: pips.includes(idx) ? 'inset 0 1.5px 2px rgba(0,0,0,0.45)' : 'none'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="numbers-app-wrapper">
      {/* Permanent Fixed Confetti Canvas (zero body injection, zero scrollbar flicker) */}
      <canvas ref={confettiCanvasRef} className="numbers-confetti-canvas" />

      {/* ============================================================ */}
      {/* HEADER NAVBAR                                                */}
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
            <h2>Tenali · Numbers 1 to 10</h2>
            <span className="numbers-header-subtitle">Hop with Bunny! 🐰</span>
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
      {/* ACTIVITY TABS NAVIGATION                                      */}
      {/* ============================================================ */}
      <nav className="numbers-tab-nav" aria-label="Activity Mode Selection">
        <button
          type="button"
          className={`numbers-tab-btn ${activeTab === 'trace' ? 'active' : ''}`}
          onClick={() => { sfxClick(); setActiveTab('trace'); }}
        >
          <span>✍️</span> <span>Learn & Trace</span>
        </button>
        <button
          type="button"
          className={`numbers-tab-btn ${activeTab === 'hopscotch' ? 'active' : ''}`}
          onClick={() => { sfxClick(); setActiveTab('hopscotch'); }}
        >
          <span>🐰</span> <span>Hopscotch Mat</span>
        </button>
        <button
          type="button"
          className={`numbers-tab-btn ${activeTab === 'maze' ? 'active' : ''}`}
          onClick={() => { sfxClick(); setActiveTab('maze'); }}
        >
          <span>🚀</span> <span>Space Maze</span>
        </button>
      </nav>

      {/* ============================================================ */}
      {/* TAB 1: LEARN & TRACE FOUNDATIONS                            */}
      {/* ============================================================ */}
      {activeTab === 'trace' && (
        <NumberTracingApp
          onAwardStars={awardStars}
          markTopicCompleted={markTopicCompleted}
          onNavigateMaze={() => { sfxClick(); setActiveTab('maze'); }}
        />
      )}

      {/* ============================================================ */}
      {/* TAB 1: HOPSCOTCH MAT ADVENTURE GAME                          */}
      {/* ============================================================ */}
      {activeTab === 'hopscotch' && (
      <section className="numbers-card">
        {/* Compact Section Header */}
        <div className="numbers-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 2.2vw, 1.45rem)' }}>
              🐰 Hopscotch (1 to 10)
            </h1>
          </div>

          <button
            type="button"
            className="numbers-btn-secondary"
            style={{ fontSize: '0.8rem', padding: '5px 14px' }}
            onClick={startDemo}
            title="Watch tutorial demo"
          >
            <span>🎬 Watch Demo</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* UNIFIED GAME CONTAINER (DICE + MAT + BUTTONS ALL TOGETHER)   */}
        {/* ============================================================ */}
        <div className="bunny-track-container unified-arena">

          {/* 1. TOP: DICE & TARGET CONTROLS (LOCKED STATIC HEIGHT) */}
          <div className="arena-dice-bar">
            <div className="arena-dice-left-group">
              <div
                className="dice-display-area"
                onClick={rollGameDice}
                title="Tap dice to roll"
              >
                {currentDiceValues.map((val, idx) => (
                  <div
                    key={idx}
                    className={`dice-cube compact ${currentDiceValues.length > 1 ? 'duo' : ''} ${gameDiceRolling ? 'rolling' : ''} ${(demoActive && demoHandPos.target === 'dice' && demoHandPos.clicking) ? 'is-demo-pressed' : ''}`}
                  >
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DiceFace count={val} isDuo={currentDiceValues.length > 1} />
                    </div>
                  </div>
                ))}

                {/* Hand Clicking Directly ON the Dice Cube */}
                {demoActive && demoHandPos.target === 'dice' && (
                  <ClickHandCursor isPressed={demoHandPos.clicking} isContinuous={false} />
                )}
                {!demoActive && !hasRolled && !demoCompleted && (
                  <ClickHandCursor isPressed={false} isContinuous={true} />
                )}
              </div>

              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <button
                  type="button"
                  className={`numbers-btn-primary compact ${!hasRolled || (demoActive && demoHandPos.target === 'dice') ? 'demo-pulse-btn' : ''}`}
                  onClick={rollGameDice}
                  disabled={gameDiceRolling || demoActive}
                >
                  <span>🎲</span> <span>{hasRolled ? 'Roll Again' : 'Roll!'}</span>
                </button>
              </div>

              <p className="arena-feedback-msg" title={feedbackMsg}>
                {feedbackMsg}
              </p>
            </div>

            <div className="numbers-status-pill compact arena-goal-pill">
              <span>{hasRolled ? `🎯 Goal: ${gameDiceTarget}` : '🎲 Roll!'}</span>
            </div>
          </div>

          {/* 2. MIDDLE: THE MAT (100% WIDTH, NO HORIZONTAL SCROLL) */}
          <div className="bunny-track-arena">
            {/* Floating Bunny Token */}
            <div
              className={`bunny-avatar-token ${bunnyHopSpring ? 'hop-spring' : ''}`}
              style={{
                top: bunnyPos === 0 ? '4px' : '56px',
                left: `calc(${bunnyPos === 0 ? 0 : bunnyPos - 1} * (10% + 0.6px))`,
                width: 'calc(10% - 5.4px)'
              }}
            >
              {bunnyYayVisible && (
                <div className="bunny-yay-bubble">
                  ⭐ {gameDiceTarget}! {NUMBER_WORDS[gameDiceTarget]}!
                </div>
              )}
              <span className="bunny-emoji">🐰</span>
            </div>

            {/* Row 1: Start Position (Burrow above Card 1) + Visual Carrot Path */}
            <div className="track-top-row">
              {/* Column 1: Start Burrow directly above Card 1 */}
              <div
                className={`start-burrow-above ${bunnyPos === 0 ? 'is-active-spot' : ''}`}
              >
                <span className="start-burrow-badge">🌱 START</span>
                <span className="start-burrow-icon" style={{ opacity: bunnyPos === 0 ? 0.35 : 1, fontSize: '1.45rem' }}>🥕</span>
              </div>

              {/* Columns 2-10: Clean Guide Banner without separate carrots */}
              <div className="track-guide-banner">
                {demoActive ? (
                  <div className="demo-active-banner">
                    <div className="demo-live-badge">
                      <span className="demo-live-dot" />
                      <span>TUTORIAL DEMO</span>
                    </div>
                    <span className="demo-live-text">
                      {demoStep === 1 && '1. Click the Dice 🎲'}
                      {demoStep === 2 && '🎲 Rolling the dice...'}
                      {demoStep === 3 && '2. Click Hop ▶ 🐰'}
                      {demoStep >= 4 && demoStep <= 10 && `🐰 Hop to ${demoStep - 3}: Carrot collected! 🥕`}
                      {demoStep === 11 && '🎉 Reached Goal 8! Card flips! ⭐'}
                      {demoStep >= 12 && "⭐ Tutorial Finished! ⭐"}
                    </span>
                    <button
                      type="button"
                      className="demo-skip-btn"
                      onClick={stopDemo}
                      title="Skip Demo & Play"
                    >
                      <span>Skip ✕</span>
                    </button>
                  </div>
                ) : !hasRolled ? (
                  <div className="demo-track-guide">
                    <span className="demo-step-chip">🎬 Quick Demo</span>
                    <span className="demo-guide-step">
                      <span className="demo-num">1</span> Click <strong>Roll 🎲</strong>
                    </span>
                    <span className="demo-arrow">➔</span>
                    <span className="demo-guide-step">
                      <span className="demo-num">2</span> Click <strong>Hop ▶</strong>
                    </span>
                  </div>
                ) : targetReached ? (
                  <div className="track-guide-visual">
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--clr-correct, #5cb87a)' }}>
                      🎉 Found Card {gameDiceTarget}! ⭐ ⭐ ⭐
                    </span>
                  </div>
                ) : (
                  <div className="track-guide-visual">
                    <span style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--clr-text)' }}>
                      🐰 Hop with Bunny to Card <strong>{gameDiceTarget}</strong>!
                    </span>
                  </div>
                )}
                {!demoActive && (
                  <div className="track-target-pill">
                    <span>🎯 {hasRolled ? gameDiceTarget : 'Roll!'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Subway Surfers / Temple Run Finish Screen */}
            {demoActive && demoStep >= 12 && (
              <div className="demo-finish-overlay">
                <div className="demo-finish-card">
                  <span style={{ fontSize: '2.4rem', lineHeight: 1 }}>🎉</span>
                  <h3 style={{ margin: '6px 0 2px 0', fontSize: '1.25rem', color: '#ede8e3', fontWeight: 800 }}>
                    Tutorial Complete!
                  </h3>
                  <p style={{ margin: '0 0 14px 0', fontSize: '0.88rem', color: '#a89e94', lineHeight: 1.35 }}>
                    You're ready to play! Roll the dice and hop with Bunny! 🐰🥕
                  </p>
                  <button
                    type="button"
                    className="numbers-btn-primary"
                    onClick={stopDemo}
                    style={{ padding: '9px 24px', fontSize: '0.95rem' }}
                  >
                    <span>Let's Play! 🚀</span>
                  </button>
                </div>
              </div>
            )}

            {/* Row 2: Hopping Lane between Top Row and Cards */}
            <div className="track-hop-lane" />

            {/* Row 3: 10 Blank Number Cards Mat (Only arrow keys/buttons make bunny hop; no click or hover reveal) */}
            <div className="hop-pads-track">
              {Array.from({ length: 10 }).map((_, i) => {
                const padNum = i + 1;
                const isGlowing = hasRolled && !gameDiceRolling && padNum <= gameDiceTarget && padNum > bunnyPos;
                const isRevealed = revealedPad === padNum;

                let cardInnerClass = 'hop-card-inner';
                if (isRevealed) cardInnerClass += ' is-flipped';
                if (isGlowing) cardInnerClass += ' is-glowing';

                return (
                  <div
                    key={padNum}
                    className="hop-card-container"
                    title={isRevealed ? `${padNum} (${NUMBER_WORDS[padNum]})` : undefined}
                  >
                    {/* Floating Video-Game Carrot (Only Carrot, No Coin Circle!) */}
                    {isGlowing && (
                      <div
                        className="card-carrot-wrapper"
                        style={{
                          animationDelay: `${(padNum - 1) * 0.14}s`
                        }}
                      >
                        <div
                          className="floating-game-carrot"
                          style={{
                            animationDelay: `${(padNum - 1) * 0.14}s`
                          }}
                        >
                          <span className="floating-carrot-icon">🥕</span>
                        </div>
                        <div
                          className="carrot-ground-shadow"
                          style={{
                            animationDelay: `${(padNum - 1) * 0.14}s`
                          }}
                        />
                      </div>
                    )}

                    <div className={cardInnerClass}>
                      {/* Blank Card Face (Unrevealed - completely blank!) */}
                      <div className="hop-card-face hop-card-back" />

                      {/* Front Face (Revealed Number - shown ONLY upon reaching right card!) */}
                      <div className="hop-card-face hop-card-front">
                        <span className="pad-star-top">⭐</span>
                        <span className="pad-number">{padNum}</span>
                        <span className="pad-word">{NUMBER_WORDS[padNum]}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. BOTTOM: CONTROLS & STEP COUNTER (INSIDE THE CONTAINER) */}
          <div className="hop-controls-bar inside-container">
            <div className="hop-arrow-controls">
              <button
                type="button"
                className="hop-arrow-btn"
                onClick={hopLeft}
                disabled={!hasRolled || bunnyPos <= 0 || targetReached || gameDiceRolling}
                title="Hop back"
              >
                <span>◀</span> <span>Hop</span>
              </button>

              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <button
                  type="button"
                  className={`hop-arrow-btn primary ${(hasRolled && bunnyPos === 0 && !demoCompleted) || (demoActive && demoHandPos.target === 'hop') ? 'demo-pulse-btn' : ''} ${(demoActive && demoHandPos.target === 'hop' && demoHandPos.clicking) ? 'is-demo-pressed' : ''}`}
                  onClick={hopRight}
                  disabled={!hasRolled || (gameDiceTarget > 0 && bunnyPos >= gameDiceTarget) || targetReached || gameDiceRolling || demoActive}
                  title={targetReached ? `Reached Goal ${gameDiceTarget}!` : "Hop forward"}
                >
                  <span>Hop</span> <span>▶</span>
                </button>
                {/* Hand Clicking Directly ON the Hop ▶ Button */}
                {demoActive && demoHandPos.target === 'hop' && (
                  <ClickHandCursor isPressed={demoHandPos.clicking} isContinuous={false} />
                )}
                {!demoActive && hasRolled && bunnyPos === 0 && !demoCompleted && (
                  <ClickHandCursor isPressed={false} isContinuous={true} />
                )}
              </div>
            </div>

            <div className="hop-step-indicator">
              <span>🐰 <strong>{bunnyPos === 0 ? 'Start' : bunnyPos}</strong></span>
              <span>/</span>
              <span>🎯 <strong>{hasRolled ? gameDiceTarget : '?'}</strong></span>
            </div>

            <div className="hop-actions-group">
              <button
                type="button"
                className="numbers-btn-secondary reset-start-btn"
                onClick={() => hopToPosition(0)}
                disabled={!hasRolled || bunnyPos === 0 || targetReached}
                title="Back to Start"
              >
                <span>↺ Start</span>
              </button>
            </div>
          </div>

        </div>
      </section>
      )}

      {/* ============================================================ */}
      {/* TAB 2: SPACE MAZE ADVENTURE GAME                             */}
      {/* ============================================================ */}
      {activeTab === 'maze' && (
        <SpaceMazeAdventure
          onAwardStars={awardStars}
          onTopicComplete={markTopicCompleted}
          sfxTone={sfxTone}
        />
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
              Quick Demo 🐰
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--clr-text-soft)', marginBottom: '16px' }}>
              How to play in 2 easy steps:
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              textAlign: 'left',
              marginBottom: '20px',
              background: 'var(--clr-surface)',
              padding: '16px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--clr-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
                <span style={{ fontSize: '1.6rem' }}>🎲</span>
                <span><strong>1. Click Roll Dice:</strong> See your target number and reveal the glowing path!</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
                <span style={{ fontSize: '1.6rem' }}>🐰</span>
                <span><strong>2. Click Hop ▶:</strong> Hop Bunny across the cards to collect the floating carrots 🥕!</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
                <span style={{ fontSize: '1.6rem' }}>⭐</span>
                <span><strong>3. Land on Target:</strong> Reach the final card to flip it and celebrate!</span>
              </div>
            </div>

            <button
              type="button"
              className="numbers-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setTutorialModalOpen(false)}
            >
              Let's Play! 🚀
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
