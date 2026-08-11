/**
 * GUESS WHAT'S ON TENALI'S MIND — COMPACT SEQUENTIAL GAME ENGINE
 * ══════════════════════════════════════════════════════════════
 * Implements a scroll-free, minimal UI matching the Word Creator aesthetic.
 * Uses exact Tenali project CSS variables for themes and colors.
 */

import React, { useState, useEffect } from 'react';
import { TenaliAvatar } from './App';
import { playSound } from './audioContext';
import confetti from 'canvas-confetti';
import './MindReader2.css';

const API = import.meta.env.VITE_API_BASE_URL || '';
const AUTH_TOKEN_KEY = 'tenali-auth-token';

function authGetToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

function playCoinSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {}
}

function playConfettiSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // 1. Victory Fanfare Arpeggio (C Major chord cascade)
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const startTime = ctx.currentTime + idx * 0.07;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.28, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });

    // 2. High Sparkle Chime Effect
    const sparkleOsc = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkleOsc.type = 'sine';
    const sparkleStart = ctx.currentTime + 0.35;
    sparkleOsc.frequency.setValueAtTime(1760.00, sparkleStart);
    sparkleOsc.frequency.exponentialRampToValueAtTime(2637.02, sparkleStart + 0.2);

    sparkleGain.gain.setValueAtTime(0.2, sparkleStart);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, sparkleStart + 0.25);

    sparkleOsc.connect(sparkleGain);
    sparkleGain.connect(ctx.destination);

    sparkleOsc.start(sparkleStart);
    sparkleOsc.stop(sparkleStart + 0.25);
  } catch (e) {}
}

export default function MindReaderApp2({ onBack }) {
  // Game Phase: 'setup' | 'worlds' | 'levels' | 'playing' | 'gameover'
  const [phase, setPhase] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Player Stats
  const [xp, setXp] = useState(0);
  const [mrr, setMrr] = useState(1000);
  const [unlockedWorlds, setUnlockedWorlds] = useState(['number_kingdom']);
  const [levelProgress, setLevelProgress] = useState({}); // levelNum -> starsEarned
  const [levelOptions, setLevelOptions] = useState(['Whole Numbers', 'Integers', 'Fractions', 'Decimal Numbers']);
  const [roundSelections, setRoundSelections] = useState({ 0: [], 1: [], 2: [], 3: [], 4: [] });
  const [isSummaryPhase, setIsSummaryPhase] = useState(false);

  // Animation states for flying plane
  const [animatingFrom, setAnimatingFrom] = useState(null);
  const [animatingTo, setAnimatingTo] = useState(null);

  // Active game navigation states
  const [worlds, setWorlds] = useState([]);
  const [activeWorldIndex, setActiveWorldIndex] = useState(0);
  const [activeWorldId, setActiveWorldId] = useState('number_kingdom');
  const [levelNum, setLevelNum] = useState(1);

  // Active game session playing states
  const [gameId, setGameId] = useState('');
  const [clue, setClue] = useState('');
  const [clueIndex, setClueIndex] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [cluesExhausted, setCluesExhausted] = useState(false);
  const [avatarExpression, setAvatarExpression] = useState('thinking');
  const [tenaliSpeech, setTenaliSpeech] = useState('');

  // Searchable Concept Selector
  const [guessSearchQuery, setGuessSearchQuery] = useState('');
  const [wrongGuessFeedback, setWrongGuessFeedback] = useState('');

  // Hint Overlay Box
  const [showHintOverlay, setShowHintOverlay] = useState(false);
  const [hintText, setHintText] = useState('');

  // Guess Modal Selector
  const [showGuess, setShowGuess] = useState(false);
  const [guessQuery, setGuessQuery] = useState('');

  // Results & Educational Data
  const [isCorrectGuess, setIsCorrectGuess] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [mrrChange, setMrrChange] = useState(0);
  const [actualConcept, setActualConcept] = useState('');
  const [educationalInfo, setEducationalInfo] = useState(null);
  const [xpBreakdown, setXpBreakdown] = useState(null);
  const [xpStep, setXpStep] = useState(0);
  const [starTip, setStarTip] = useState('');
  const [isHoveringNextLevel, setIsHoveringNextLevel] = useState(false);

  // Clues history navigation & review
  const [revealedClues, setRevealedClues] = useState([]);
  const [localClueIndex, setLocalClueIndex] = useState(0);
  const [showReviewedClues, setShowReviewedClues] = useState(false);

  const syncGlobalXp = (newXp) => {
    try {
      const userStr = localStorage.getItem('tenali-auth-user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj) {
          userObj.xp = newXp;
          localStorage.setItem('tenali-auth-user', JSON.stringify(userObj));
          window.dispatchEvent(new Event('tenali-auth-change'));
        }
      }
    } catch (e) {
      console.error('[MindReaderApp2] Error syncing global XP:', e);
    }
  };

  // Load user profile, XP, levels stars on load
  const loadWorldsAndProgress = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const token = authGetToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/mindreader/worlds`, { headers });
      if (res.ok) {
        const data = await res.json();
        console.log('[MindReaderApp2 Debug] Received worlds from API:', data.worlds?.map(w => ({ worldId: w.worldId, worldName: w.worldName, unlocked: w.unlocked })));
        
        let loadedXp = data.xp || 0;
        let loadedProgress = data.levelProgress || {};

        if (!token) {
          try {
            const guestXp = localStorage.getItem('tenali-guess-mind-guest-xp');
            if (guestXp !== null) {
              loadedXp = parseInt(guestXp, 10);
            }
            const guestProg = localStorage.getItem('tenali-guess-mind-guest-progress');
            if (guestProg !== null) {
              loadedProgress = JSON.parse(guestProg);
            }
          } catch (e) {
            console.error('Error loading guest progress:', e);
          }
        }

        setXp(loadedXp);
        setLevelProgress(loadedProgress);
        
        if (loadedXp !== undefined) {
          syncGlobalXp(loadedXp);
        }

        let resolvedWorlds = (data.worlds || []).map(w => ({
          ...w,
          unlocked: true // Force unlock every kingdom
        }));
        setWorlds(resolvedWorlds);

        // Determine first uncompleted level
        const completedLevels = Object.keys(loadedProgress).map(Number);
        const highestCompleted = completedLevels.length > 0 ? Math.max(...completedLevels) : 0;
        const resumeLevel = highestCompleted + 1;

        let startLevel = resumeLevel;
        try {
          const savedLastLevel = localStorage.getItem('tenali-guess-mind-last-level');
          if (savedLastLevel) {
            const parsedSaved = parseInt(savedLastLevel, 10);
            if (parsedSaved > 0) {
              startLevel = parsedSaved;
            }
          }
        } catch (e) {}

        if (phase === 'setup' || phase === 'levels' || !levelNum) {
          setLevelNum(startLevel);
        }
      } else {
        setErrorMsg('Failed to load levels progress.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorldsAndProgress();
  }, [phase]);

  // Set Tenali greeting message on lobby setup
  useEffect(() => {
    if (phase === 'setup') {
      setAvatarExpression('thinking');
      setTenaliSpeech("I have hidden a mathematical concept inside my mind. Can you guess it in 5 clues?");
    }
  }, [phase]);

  // Auto-cleanup for flying plane animation
  useEffect(() => {
    if (animatingFrom !== null && animatingTo !== null) {
      const timer = setTimeout(() => {
        setAnimatingFrom(null);
        setAnimatingTo(null);
      }, 3400); // matches the 3.2s animation duration plus buffer
      return () => clearTimeout(timer);
    }
  }, [animatingFrom, animatingTo]);

  // Animated XP receipt steps & confetti sound effect sequence on gameover screen
  useEffect(() => {
    if (phase === 'gameover' && isCorrectGuess && xpEarned > 0) {
      setXpStep(0);

      // Trigger confetti sound & particle burst
      try {
        playConfettiSound();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      // Determine valid steps to execute based on earned bonuses
      const steps = [1]; // Base XP
      if (xpBreakdown?.noHintBonus > 0) steps.push(3);
      if (xpBreakdown?.streakBonus > 0) steps.push(4);
      steps.push(5); // Total Sum

      let stepIdx = 0;
      const interval = setInterval(() => {
        if (stepIdx < steps.length) {
          const currentStep = steps[stepIdx];
          setXpStep(currentStep);
          playCoinSound();
          stepIdx++;
        } else {
          clearInterval(interval);
        }
      }, 420);

      return () => clearInterval(interval);
    }
  }, [phase, isCorrectGuess, xpEarned, xpBreakdown]);

  // Auto-scroll to the active/current level when opening the levels map page
  useEffect(() => {
    if (phase === 'levels') {
      const timer = setTimeout(() => {
        const targetElement = document.querySelector('.active-target-level') ||
                              document.querySelector('.gm-level-node.active-node');
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [phase, activeWorldId, activeWorldIndex]);

  // Kingdom Level Boundaries Map (guarantees complete independence for every kingdom)
  const WORLD_LEVEL_RANGES = {
    'number_kingdom': [1, 15],
    'arithmetic_kingdom': [11, 20],
    'geometry_kingdom': [21, 30],
    'algebra_kingdom': [31, 40],
    'advanced_math_kingdom': [41, 50],
    'coordinate_calculus_kingdom': [51, 60],
    'data_logic_kingdom': [61, 66]
  };

  const LEVEL_NAMES_MAP = {
    1: "The Number Village (Number Sets)",
    2: "The Hall of Hidden Properties (Even, Odd, Prime, Composite)",
    3: "The Factor Forge (Factors, Multiples, HCF, LCM)",
    4: "The Divisibility Temple (Divisibility Rules)",
    5: "The Place Value Palace (Place Values)",
    6: "The Comparison Bridge (Number Comparison)",
    7: "The Fraction Forest (Fraction Types)",
    8: "The Decimal Dock (Decimal Places)",
    9: "The Ratio Market (Representations)",
    10: "The Roman Ruins (Roman & Ancient Numerals)",
    11: "The Pattern Peaks (Sequences & Patterns)",
    12: "The Operation Oasis (Arithmetic Operations)",
    13: "The Estimation Enclave (Rounding & Estimation)",
    14: "The Power Peak (Powers & Roots)",
    15: "The King's Trial (Number Kingdom Boss)"
  };

  const getKingdomLevelNumbers = (w) => {
    if (!w) return Array.from({ length: 10 }, (_, i) => i + 1);

    // 1. Check w.levels if levelNum values are distinct per kingdom
    if (Array.isArray(w.levels) && w.levels.length > 0) {
      const nums = w.levels.map(l => typeof l === 'number' ? l : (l.levelNum || l.id));
      if (nums.some(n => n > 10) || w.worldId === 'number_kingdom') {
        return nums;
      }
    }

    // 2. Check w.levelRange if explicit
    if (Array.isArray(w.levelRange) && w.levelRange.length === 2) {
      const [s, e] = w.levelRange;
      if (s !== 1 || e !== 10 || w.worldId === 'number_kingdom') {
        const nums = [];
        for (let i = s; i <= e; i++) nums.push(i);
        return nums;
      }
    }

    // 3. Fallback to predefined distinct range map for each kingdom
    if (w.worldId && WORLD_LEVEL_RANGES[w.worldId]) {
      const [s, e] = WORLD_LEVEL_RANGES[w.worldId];
      const nums = [];
      for (let i = s; i <= e; i++) nums.push(i);
      return nums;
    }

    return Array.from({ length: 10 }, (_, i) => i + 1);
  };

  const getLevelStars = (worldId, lvlNum, progressMap) => {
    if (!progressMap) return 0;
    // Check scoped key first (e.g. 'arithmetic_kingdom_11' or 'arithmetic_kingdom_1')
    if (worldId && progressMap[`${worldId}_${lvlNum}`] !== undefined) {
      return progressMap[`${worldId}_${lvlNum}`];
    }
    // Check global level index (e.g. 11 for arithmetic kingdom)
    if (progressMap[lvlNum] !== undefined) {
      return progressMap[lvlNum];
    }
    return 0;
  };

  // Level selector maps
  const getLevelsForActiveWorld = () => {
    if (!worlds || worlds.length === 0) return [];
    const activeWorld = worlds.find(w => w.worldId === activeWorldId) || worlds[activeWorldIndex] || worlds[0];
    if (!activeWorld) return [];

    const levelNums = getKingdomLevelNumbers(activeWorld);

    const list = [];
    let isPrevUnlockedAndCompleted = true; // first level in kingdom is unlocked by default

    for (let idx = 0; idx < levelNums.length; idx++) {
      const num = levelNums[idx];
      let unlocked = false;
      if (idx === 0) {
        unlocked = activeWorld.unlocked !== undefined ? activeWorld.unlocked : true;
      } else {
        const prevNum = levelNums[idx - 1];
        const prevCompleted = getLevelStars(activeWorld.worldId, prevNum, levelProgress) > 0;
        unlocked = isPrevUnlockedAndCompleted && prevCompleted;
      }
      const currentStars = getLevelStars(activeWorld.worldId, num, levelProgress);
      isPrevUnlockedAndCompleted = unlocked && currentStars > 0;

      const levelName = (activeWorld.levels && activeWorld.levels[idx]?.levelName)
        || LEVEL_NAMES_MAP[num]
        || `Level ${idx + 1}`;

      list.push({
        levelNum: num,
        relativeNum: idx + 1,
        levelName,
        stars: currentStars,
        unlocked
      });
    }

    // Determine current level to play (first unlocked level with 0 stars, or last unlocked level if all completed)
    let currentPlayLevelNum = null;
    const firstUncompletedUnlocked = list.find(n => n.unlocked && n.stars === 0);
    if (firstUncompletedUnlocked) {
      currentPlayLevelNum = firstUncompletedUnlocked.levelNum;
    } else {
      const unlockedNodes = list.filter(n => n.unlocked);
      if (unlockedNodes.length > 0) {
        currentPlayLevelNum = unlockedNodes[unlockedNodes.length - 1].levelNum;
      }
    }

    return list.map(n => ({
      ...n,
      isCurrent: n.levelNum === currentPlayLevelNum
    }));
  };

  // Get highest level completed overall across all worlds
  const getHighestCompletedLevelOverall = () => {
    const completedLevels = Object.keys(levelProgress)
      .map(Number)
      .filter(lvl => (levelProgress[lvl] || 0) > 0);
    return completedLevels.length > 0 ? Math.max(...completedLevels) : 0;
  };

  // Get highest completed level info for a specific world/kingdom (independent per kingdom)
  const getHighestCompletedLevelForWorld = (w) => {
    if (!w) return { globalLevel: 0, relativeLevel: 0, hasStarted: false };
    const levelNums = getKingdomLevelNumbers(w);
    const startLevel = levelNums[0] || 1;

    const completed = levelNums.filter(lvl => getLevelStars(w.worldId, lvl, levelProgress) > 0);
    if (completed.length === 0) {
      return { globalLevel: 0, relativeLevel: 0, hasStarted: false };
    }

    const globalLevel = Math.max(...completed);
    const relativeLevel = globalLevel - startLevel + 1;

    return {
      globalLevel,
      relativeLevel,
      hasStarted: true
    };
  };

  // Dynamically calculate total stars earned in a specific kingdom
  const getKingdomStarsCount = (w) => {
    if (!w) return 0;
    const levelNums = getKingdomLevelNumbers(w);
    return levelNums.reduce((sum, lvl) => sum + getLevelStars(w.worldId, lvl, levelProgress), 0);
  };



  // World Carousel Handlers
  const nextWorld = () => {
    if (activeWorldIndex < worlds.length - 1) {
      const nextIdx = activeWorldIndex + 1;
      setActiveWorldIndex(nextIdx);
      if (worlds[nextIdx]) setActiveWorldId(worlds[nextIdx].worldId);
    }
  };

  const prevWorld = () => {
    if (activeWorldIndex > 0) {
      const prevIdx = activeWorldIndex - 1;
      setActiveWorldIndex(prevIdx);
      if (worlds[prevIdx]) setActiveWorldId(worlds[prevIdx].worldId);
    }
  };

  const handleSelectWorld = (world) => {
    if (!world.unlocked) return;
    setActiveWorldId(world.worldId);
    const idx = worlds.findIndex(w => w.worldId === world.worldId);
    if (idx !== -1) setActiveWorldIndex(idx);
    setPhase('levels');
  };

  // Start Level API
  const handleStartLevel = async (lvl) => {
    setLoading(true);
    setErrorMsg('');
    setWrongGuessFeedback('');
    setGuessSearchQuery('');
    try {
      localStorage.setItem('tenali-guess-mind-last-level', lvl);
    } catch (e) {}
    try {
      const token = authGetToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/mindreader/start`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ levelNum: lvl, worldId: activeWorldId })
      });

      if (res.ok) {
        const data = await res.json();
        setGameId(data.gameId);
        setLevelNum(data.levelNum);
        if (data.worldId) {
          setActiveWorldId(data.worldId);
          const idx = worlds.findIndex(w => w.worldId === data.worldId);
          if (idx !== -1) setActiveWorldIndex(idx);
        }
        if (data.options && data.options.length > 0) {
          setLevelOptions(data.options);
        } else {
          setLevelOptions(['Whole Numbers', 'Integers', 'Fractions', 'Decimal Numbers']);
        }
        setRoundSelections({ 0: [], 1: [], 2: [], 3: [], 4: [] });
        setIsSummaryPhase(false);
        setClue(data.clue);
        setClueIndex(data.clueIndex);
        setRevealedClues([data.clue]);
        setLocalClueIndex(0);
        setHintsRemaining(data.hintsRemaining);
        setCluesExhausted(false);
        setShowHintOverlay(false);
        setHintText('');
        setGuessQuery('');
        setAvatarExpression('thinking');
        setTimeout(() => {
          setPhase('playing');
        }, 400);
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || 'Failed to start level.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle option selection for current round
  const toggleCandidateOption = (optName) => {
    const currentList = roundSelections[localClueIndex] || [];
    const exists = currentList.includes(optName);
    const updatedList = exists
      ? currentList.filter(o => o !== optName)
      : [...currentList, optName];
    setRoundSelections({
      ...roundSelections,
      [localClueIndex]: updatedList
    });
  };

  // Next Clue API
  const handleNextClue = async () => {
    setWrongGuessFeedback('');
    if (localClueIndex < revealedClues.length - 1) {
      setLocalClueIndex(localClueIndex + 1);
      setClue(revealedClues[localClueIndex + 1]);
      return;
    }

    if (localClueIndex === 4 || cluesExhausted) {
      setIsSummaryPhase(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/mindreader/next-clue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      });

      if (res.ok) {
        const data = await res.json();
        setClue(data.clue);
        setClueIndex(data.clueIndex);
        setRevealedClues([...revealedClues, data.clue]);
        setLocalClueIndex(localClueIndex + 1);
        setCluesExhausted(data.cluesExhausted);
        setAvatarExpression('happy');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Request Hint API
  const handleUseHint = async () => {
    if (hintsRemaining <= 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/mindreader/use-hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      });

      if (res.ok) {
        const data = await res.json();
        setHintText(data.hint);
        setHintsRemaining(data.hintsRemaining);
        setShowHintOverlay(true);
        setAvatarExpression('smirk');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Submit Guess API
  const handleSubmitGuess = async (selectedConceptName) => {
    const guessToSubmit = selectedConceptName || guessQuery;
    if (!guessToSubmit || !guessToSubmit.trim()) return;
    setLoading(true);
    setWrongGuessFeedback('');
    try {
      const token = authGetToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/mindreader/submit-guess`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ gameId, guess: guessToSubmit, roundSelections })
      });

      if (res.ok) {
        const data = await res.json();
        setIsCorrectGuess(data.correct);
        setStarsEarned(data.starsEarned || 0);
        setStarTip(data.starTip || '');
        setXpEarned(data.xpEarned || 0);
        setMrrChange(data.reward ? data.reward.mrrChange : 0);
        setXpBreakdown(data.reward ? data.reward.xpBreakdown : null);
        setEducationalInfo(data.educationalInfo);
        setShowGuess(false);

        if (data.correct) {
          // Unlock level locally
          const updatedStars = Math.max(levelProgress[levelNum] || 0, data.starsEarned || 1);
          const nextProgress = {
            ...levelProgress,
            [levelNum]: updatedStars
          };
          setLevelProgress(nextProgress);

          let nextXp = xp;
          if (data.xpEarned) {
            nextXp = xp + data.xpEarned;
            setXp(nextXp);
          }
          if (data.reward && data.reward.xp !== undefined) {
            syncGlobalXp(data.reward.xp);
          } else {
            syncGlobalXp(nextXp);
          }
          if (!token) {
            try {
              localStorage.setItem('tenali-guess-mind-guest-xp', nextXp.toString());
              localStorage.setItem('tenali-guess-mind-guest-progress', JSON.stringify(nextProgress));
            } catch (e) {}
          }
          try {
            localStorage.setItem('tenali-guess-mind-last-level', levelNum + 1);
          } catch (e) {}
          setActualConcept(data.actualConcept || guessToSubmit);
          setAvatarExpression('victory');
          setTenaliSpeech(`Outstanding! You correctly guessed "${data.actualConcept || guessToSubmit}"!`);
          if (typeof confetti === 'function') {
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
          setPhase('gameover');
        } else {
          if (data.cluesRemaining) {
            setWrongGuessFeedback("❌ Not quite! That's not the secret concept. Try reading another clue or guessing again!");
          } else {
            setActualConcept('');
            setAvatarExpression('loss');
            setTenaliSpeech("All 5 clues are completed. Review the educational revision card below!");
            setPhase('gameover');
          }
        }
      } else {
        if (res.status === 404) {
          // Auto-recover session if expired/restarted
          handleStartLevel(levelNum);
        } else {
          setWrongGuessFeedback('Unable to submit guess. Please try again.');
        }
      }
    } catch (err) {
      console.error('[GuessMind] Submit guess error:', err);
      setWrongGuessFeedback('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Thought Box Change Handler
  const handleThoughtChange = (index, val) => {
    const updated = [...thoughtGuesses];
    updated[index] = val;
    setThoughtGuesses(updated);
  };

  const handlePrevLocalClue = () => {
    if (localClueIndex > 0) {
      setLocalClueIndex(localClueIndex - 1);
      setClue(revealedClues[localClueIndex - 1]);
    }
  };

  const handleJumpToRound = (rIdx) => {
    if (rIdx < revealedClues.length) {
      setLocalClueIndex(rIdx);
      setClue(revealedClues[rIdx]);
      setIsSummaryPhase(false);
    } else if (rIdx === revealedClues.length && rIdx < 5) {
      handleNextClue();
    }
  };

  const renderSvgPath = () => {
    const levels = getLevelsForActiveWorld();
    if (levels.length === 0) return null;
    
    const nodeHeight = 100;
    const width = 400;
    const height = levels.length * nodeHeight;
    
    let pathD = "";
    levels.forEach((lvl, idx) => {
      const offsetSign = idx % 4 === 1 ? 38 : idx % 4 === 3 ? -38 : 0;
      const x = 200 + offsetSign;
      const y = 50 + idx * nodeHeight; // center of the 100px block
      
      if (idx === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        const prevOffsetSign = (idx - 1) % 4 === 1 ? 38 : (idx - 1) % 4 === 3 ? -38 : 0;
        const prevX = 200 + prevOffsetSign;
        const prevY = 50 + (idx - 1) * nodeHeight;
        
        const cpY1 = prevY + nodeHeight / 2;
        const cpY2 = y - nodeHeight / 2;
        pathD += ` C ${prevX} ${cpY1}, ${x} ${cpY2}, ${x} ${y}`;
      }
    });

    const fromIdx = animatingFrom !== null ? levels.findIndex(n => n.levelNum === animatingFrom) : -1;
    const toIdx = animatingTo !== null ? levels.findIndex(n => n.levelNum === animatingTo) : -1;

    let x1, y1, x2, y2, cpY1, cpY2;
    if (fromIdx !== -1 && toIdx !== -1) {
      const fromOffsetSign = fromIdx % 4 === 1 ? 38 : fromIdx % 4 === 3 ? -38 : 0;
      x1 = 200 + fromOffsetSign;
      y1 = 50 + fromIdx * nodeHeight;

      const toOffsetSign = toIdx % 4 === 1 ? 38 : toIdx % 4 === 3 ? -38 : 0;
      x2 = 200 + toOffsetSign;
      y2 = 50 + toIdx * nodeHeight;

      cpY1 = y1 + nodeHeight / 2;
      cpY2 = y2 - nodeHeight / 2;
    }
    
    return (
      <svg 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none'
        }}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <path
          d={pathD}
          fill="none"
          stroke="url(#trackGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="8 8"
          style={{
            animation: 'dashMove 20s linear infinite'
          }}
        />
        {fromIdx !== -1 && toIdx !== -1 && (
          <g
            style={{
              offsetPath: `path('M ${x1} ${y1} C ${x1} ${cpY1}, ${x2} ${cpY2}, ${x2} ${y2}')`,
              offsetRotate: 'auto',
              animation: 'flyPlane 3.2s cubic-bezier(0.25, 1, 0.5, 1) forwards'
            }}
          >
            {/* Beautiful paper plane SVG path */}
            <path
              d="M-8 -8 L12 0 L-8 8 L-4 0 Z"
              fill="var(--clr-accent)"
              stroke="#fff"
              strokeWidth="1.5"
              style={{
                filter: 'drop-shadow(0 0 6px var(--clr-accent))'
              }}
            />
          </g>
        )}
        <defs>
          <linearGradient id="trackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--clr-accent)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4a90e2" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  // Clean outline button style
  const outlineBtnStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--clr-border)',
    color: 'var(--clr-text-soft)',
    borderRadius: '20px',
    padding: '6px 16px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: 'none',
    margin: 0
  };
  return (
    <div className="mr2-container" style={{ background: 'transparent', padding: '10px 15px', minHeight: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Global Navigation Header at the top */}
      {phase !== 'playing' && (
        <div style={{
          width: '100%',
          maxWidth: '500px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          paddingBottom: '10px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {phase === 'setup' && onBack && (
              <button style={outlineBtnStyle} onClick={onBack}>
                Home
              </button>
            )}
            {phase === 'worlds' && (
              <>
                <button style={outlineBtnStyle} onClick={() => setPhase('setup')}>
                  Setup
                </button>
                {onBack && (
                  <button style={outlineBtnStyle} onClick={onBack}>
                    Home
                  </button>
                )}
              </>
            )}
            {phase === 'levels' && (
              <>
                <button style={outlineBtnStyle} onClick={() => setPhase('worlds')}>
                  Worlds
                </button>
                {onBack && (
                  <button style={outlineBtnStyle} onClick={onBack}>
                    Home
                  </button>
                )}
              </>
            )}
            {phase === 'gameover' && (
              <>
                <button style={outlineBtnStyle} onClick={() => setPhase('levels')}>
                  Map
                </button>
                {onBack && (
                  <button style={outlineBtnStyle} onClick={onBack}>
                    Home
                  </button>
                )}
              </>
            )}
          </div>

          <div style={{ fontSize: '0.88rem', color: 'var(--clr-text)', fontWeight: '600', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            🏆 XP: <strong style={{ color: 'var(--clr-accent)' }}>{xp}</strong>
          </div>
        </div>
      )}




      {errorMsg && <div className="feedback wrong" style={{ textAlign: 'center', padding: '6px', margin: '4px 0', fontSize: '0.9rem' }}>{errorMsg}</div>}

      {/* ─── PHASE 1: SETUP LOBBY SCREEN (MINIMAL TEXT) ────────────────────────── */}
      {phase === 'setup' && (
        <div className="gm-container" style={{ minHeight: 'auto', gap: '15px' }}>
          <h2 style={{ margin: '10px 0 0 0', fontFamily: 'var(--font-display)', color: 'var(--clr-text)', fontSize: '2rem' }}>Read Tenali's Mind</h2>

          <div className="mr2-char-hub-vertical" style={{ margin: '10px 0', gap: '10px' }}>
            <TenaliAvatar expression={avatarExpression} skin="classic" />
            <div className="mr2-speech-bubble" style={{ maxWidth: '320px', padding: '12px 18px' }}>
              <p className="mr2-dialogue-text" style={{ fontSize: '1rem', margin: 0, color: 'var(--clr-text)' }}>{tenaliSpeech}</p>
            </div>
          </div>

          <button
            className="gm-primary-action-btn"
            style={{
              width: '100%',
              maxWidth: '320px',
              padding: '12px 24px',
              marginTop: '10px',
              background: 'var(--clr-accent)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: '700',
              cursor: 'pointer'
            }}
            onClick={() => setPhase('worlds')}
          >
            Start Game
          </button>


        </div>
      )}

      {/* ─── PHASE 2: WORLD SELECT CAROUSEL ───────────────────────────────────── */}
      {phase === 'worlds' && (
        <div className="gm-container" style={{ minHeight: 'auto', gap: '10px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--clr-text)', fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Select a Kingdom</h3>
          {worlds.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              width: '100%',
              maxWidth: '800px',
              margin: '10px auto',
              boxSizing: 'border-box',
              padding: '0 10px'
            }}>
              {worlds.map((w, idx) => {
                const starsCount = getKingdomStarsCount(w);
                const kingdomProgress = getHighestCompletedLevelForWorld(w);

                return (
                  <div
                    key={w.worldId}
                    className="gm-world-grid-card"
                    style={{
                      background: 'var(--clr-card)',
                      border: '1px solid var(--clr-border)',
                      borderRadius: '20px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'center',
                      height: '130px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onClick={() => {
                      setActiveWorldIndex(idx);
                      setActiveWorldId(w.worldId);
                      setPhase('levels');
                    }}
                  >
                    {/* Inner badge container (Title) - Fixed height & centered alignment */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: 'var(--clr-text)',
                      width: '100%',
                      height: '56px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      lineHeight: '1.25',
                      boxSizing: 'border-box',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}>
                      {w.worldName}
                    </div>

                    {/* Subtext: Level X ⭐ Stars or Yet to start */}
                    {kingdomProgress.hasStarted ? (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', height: '24px' }}>
                        <span style={{ color: 'var(--clr-accent)', fontWeight: '700' }}>
                          Level {kingdomProgress.relativeLevel}
                        </span>
                        <span style={{ color: '#f1c40f', fontWeight: '700' }}>
                          ⭐ {starsCount}
                        </span>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.82rem', fontStyle: 'italic', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Yet to start
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div>Loading worlds...</div>
          )}
        </div>
      )}

      {/* ─── PHASE 3: LEVEL SELECTION TRACK (CANDY CRUSH STYLE) ──────────────────── */}
      {phase === 'levels' && (
        <div className="gm-container" style={{ minHeight: 'auto', gap: '15px', width: '100%', maxWidth: '400px', margin: '0 auto', overflow: 'visible' }}>
          <h4 style={{ margin: '5px 0 10px 0', color: 'var(--clr-text)', fontFamily: 'var(--font-display)', fontSize: '1.6rem', textAlign: 'center' }}>
            {worlds[activeWorldIndex]?.worldName}
          </h4>

          {(() => {
            const levelsList = getLevelsForActiveWorld();
            return (
              <div className="gm-level-track" style={{ position: 'relative', width: '100%', height: `${levelsList.length * 100}px`, padding: 0, boxSizing: 'border-box' }}>
                {renderSvgPath()}

                {levelsList.map((node, index) => {
                  const activeWorld = worlds[activeWorldIndex];

                  // Gentle curve offset (+38px, -38px)
                  const offsetSign = index % 4 === 1 ? '38px' : index % 4 === 3 ? '-38px' : '0px';
                  const isActive = node.levelNum === levelNum || node.isCurrent;
                  const isCompleted = node.stars > 0;
                  const isNodeOnRight = index % 4 === 1;
                  const labelSide = isNodeOnRight ? 'left' : 'right';

                  return (
                    <div
                      key={node.levelNum}
                      className={`gm-level-node-wrapper ${node.isCurrent ? 'active-target-level' : ''}`}
                      style={{
                        position: 'absolute',
                        top: `${index * 100}px`,
                        left: '50%',
                        transform: `translateX(-50%) translateX(${offsetSign})`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        zIndex: 2,
                        boxSizing: 'border-box',
                        transition: 'all 0.3s'
                      }}
                    >
                      {/* Circle Node - Centered Exactly on Connecting SVG Line Path */}
                      <div
                        className={`gm-level-node ${node.unlocked ? 'unlocked' : ''} ${isActive ? 'active-node' : ''}`}
                        title={`Level ${node.relativeNum || node.levelNum}`}
                        style={{
                          width: isActive ? '64px' : '56px',
                          height: isActive ? '64px' : '56px',
                          borderRadius: '50%',
                          background: isCompleted
                            ? 'radial-gradient(circle, #2ecc71 0%, #27ae60 100%)'
                            : isActive
                            ? 'var(--clr-accent)'
                            : node.unlocked
                            ? 'radial-gradient(circle, var(--clr-surface) 0%, var(--clr-card) 100%)'
                            : 'rgba(30, 39, 46, 0.9)',
                          border: isCompleted
                            ? '3px solid #2ecc71'
                            : isActive
                            ? '3px solid #fff'
                            : node.unlocked
                            ? '3px solid var(--clr-accent)'
                            : '3px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          fontWeight: '700',
                          color: (isCompleted || isActive) ? '#fff' : (node.unlocked ? 'var(--clr-text)' : 'rgba(255, 255, 255, 0.3)'),
                          cursor: node.unlocked ? 'pointer' : 'not-allowed',
                          boxShadow: isCompleted
                            ? '0 0 12px rgba(46, 204, 113, 0.5)'
                            : isActive
                            ? '0 0 20px var(--clr-accent)'
                            : '0 4px 10px rgba(0, 0, 0, 0.3)',
                          transition: 'all 0.25s',
                          flexShrink: 0
                        }}
                        onClick={() => {
                          if (node.unlocked) {
                            handleStartLevel(node.levelNum);
                          }
                        }}
                        onMouseEnter={e => {
                          if (node.unlocked && !isActive) {
                            e.currentTarget.style.transform = 'scale(1.12)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (node.unlocked && !isActive) {
                            e.currentTarget.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        {node.unlocked ? (node.relativeNum || node.levelNum) : '🔒'}
                      </div>

                      {/* Side Level Label & Stars (Positioned Absolutely on the Side) */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          [labelSide]: '68px',
                          textAlign: labelSide === 'left' ? 'right' : 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: labelSide === 'left' ? 'flex-end' : 'flex-start',
                          width: '150px',
                          pointerEvents: 'none',
                          zIndex: 10
                        }}
                      >
                        <div
                          className={`gm-node-label ${node.unlocked ? '' : 'locked'}`}
                          style={{
                            margin: 0,
                            fontSize: '0.86rem',
                            fontWeight: '700',
                            lineHeight: '1.3',
                            color: node.unlocked ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)'
                          }}
                        >
                          {(node.levelName || `Level ${node.relativeNum || node.levelNum}`).replace(/\s*\([^)]*\)/g, '').trim()}
                        </div>
                        {node.unlocked && (
                          <div style={{ display: 'flex', gap: '2px', color: '#f1c40f', fontSize: '0.75rem', marginTop: '3px' }}>
                            {node.stars > 0 ? (
                              Array.from({ length: node.stars }).map((_, i) => <span key={i}>★</span>)
                            ) : (
                              <span style={{ color: 'rgba(255, 255, 255, 0.25)', fontSize: '0.7rem' }}>☆☆☆</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ─── PHASE 4: GAMEPLAY BOARD ────────────────── */}
      {phase === 'playing' && (
        <div className="gm-container" style={{ minHeight: 'auto', gap: '4px', width: '100%', maxWidth: '440px' }}>
          {/* Top Control Header Bar */}
          <div className="gm-top-bar" style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            marginBottom: '16px',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button
                style={{
                  ...outlineBtnStyle,
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
                onClick={() => setPhase('levels')}
              >
                Quit
              </button>
            </div>

            <div style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--clr-text)',
              fontSize: '1.3rem',
              fontWeight: '700',
              textAlign: 'center'
            }}>
              Level {levelNum}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {!isSummaryPhase ? (
                <button
                  style={{
                    ...outlineBtnStyle,
                    padding: '6px 14px',
                    fontSize: '0.85rem',
                    borderRadius: '20px',
                    background: 'rgba(232, 134, 74, 0.12)',
                    border: '1px solid rgba(232, 134, 74, 0.3)',
                    color: 'var(--clr-accent)'
                  }}
                  onClick={handleUseHint}
                  disabled={hintsRemaining <= 0}
                >
                  Hint ({hintsRemaining}/3)
                </button>
              ) : <div />}
            </div>
          </div>

          {/* Top Stepper: R1 R2 R3 R4 R5 */}
          <div style={{ display: 'flex', gap: '18px', justifyContent: 'center', alignItems: 'center', marginBottom: '16px', fontSize: '0.9rem', fontWeight: '700' }}>
            {[0, 1, 2, 3, 4].map((rIdx) => {
              const isUnlocked = rIdx < revealedClues.length;
              const isActive = !isSummaryPhase && rIdx === localClueIndex;
              return (
                <span
                  key={rIdx}
                  style={{
                    color: isActive
                      ? 'var(--clr-accent)'
                      : isUnlocked
                      ? 'var(--clr-text)'
                      : 'rgba(255, 255, 255, 0.25)',
                    borderBottom: isActive ? '2px solid var(--clr-accent)' : 'none',
                    paddingBottom: '2px',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleJumpToRound(rIdx)}
                >
                  {'R' + (rIdx + 1)}
                </span>
              );
            })}
          </div>

          {!isSummaryPhase ? (
            <>

              {/* Speech Cloud Clue Box */}
              <div style={{
                margin: '0 auto 16px auto',
                width: '100%',
                maxWidth: '420px',
                textAlign: 'center',
                background: 'var(--clr-card)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderLeft: '4px solid var(--clr-accent)',
                borderRight: '4px solid var(--clr-accent)',
                borderRadius: '16px',
                padding: '18px 20px',
                boxSizing: 'border-box',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)'
              }}>
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.15rem', lineHeight: '1.45', color: 'var(--clr-text)', margin: 0 }}>
                  "{clue || 'I am thinking of a mathematical concept...'}"
                </p>
              </div>

              {/* Options Subheader */}
              <div style={{ width: '100%', marginBottom: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--clr-text-soft)', fontWeight: '600', letterSpacing: '0.2px' }}>
                  Select options that match this clue:
                </span>
              </div>

              {/* 4 Candidate Option Cards Grid */}
              <div style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                margin: '0 0 16px 0'
              }}>
                {levelOptions.map((optName) => {
                  const isChecked = (roundSelections[localClueIndex] || []).includes(optName);
                  return (
                    <button
                      key={optName}
                      type="button"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '14px 14px',
                        background: isChecked ? 'rgba(232, 134, 74, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                        border: isChecked ? '1px solid var(--clr-accent)' : '1px solid rgba(255, 255, 255, 0.09)',
                        borderRadius: '14px',
                        color: isChecked ? '#fff' : 'var(--clr-text)',
                        fontSize: '0.92rem',
                        fontWeight: '700',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                        boxShadow: isChecked ? '0 4px 14px rgba(232, 134, 74, 0.25)' : 'none'
                      }}
                      onClick={() => toggleCandidateOption(optName)}
                    >
                      <span>{optName}</span>
                      <span style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '7px',
                        border: isChecked ? 'none' : '1.5px solid rgba(255, 255, 255, 0.2)',
                        background: isChecked ? 'var(--clr-accent)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        {isChecked ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Clue Hint details popup if requested */}
              {showHintOverlay && (
                <div className="feedback correct" style={{ width: '100%', padding: '8px 12px', margin: '6px 0', textAlign: 'center', fontSize: '0.85rem', borderRadius: '10px' }}>
                  💡 Hint: <strong>{hintText}</strong>
                </div>
              )}

              {/* Footer Navigation Row: Same size equal buttons */}
              <div className="gm-footer-nav" style={{ width: '100%', display: 'flex', gap: '12px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <button
                  style={{
                    ...outlineBtnStyle,
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    justifyContent: 'center',
                    opacity: localClueIndex === 0 ? 0.35 : 1,
                    cursor: localClueIndex === 0 ? 'not-allowed' : 'pointer'
                  }}
                  disabled={localClueIndex === 0}
                  onClick={handlePrevLocalClue}
                >
                  Prev
                </button>
                <button 
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'var(--clr-accent)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={handleNextClue}
                >
                  {localClueIndex < 4 ? 'Next Round' : 'Make Final Guess'}
                </button>
              </div>
            </>
          ) : (
            /* ─── MAKE FINAL GUESS STEP ─── */
            <>
              {/* Mind Speech Card Box */}
              <div style={{
                margin: '0 auto 28px auto',
                width: '100%',
                maxWidth: '420px',
                textAlign: 'center',
                background: 'var(--clr-card)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '18px 20px',
                boxSizing: 'border-box',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)'
              }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0, color: 'var(--clr-text)', fontWeight: '700' }}>
                  Make your final guess
                </p>
              </div>

              {/* 4 Option Cards Grid with clue match score badge */}
              <div style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                margin: '0 0 16px 0'
              }}>
                {levelOptions.map((optName) => {
                  const selectCount = [0, 1, 2, 3, 4].filter(rIdx => (roundSelections[rIdx] || []).includes(optName)).length;

                  return (
                    <button
                      key={optName}
                      type="button"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '14px 14px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '14px',
                        color: 'var(--clr-text)',
                        fontSize: '0.92rem',
                        fontWeight: '700',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleSubmitGuess(optName)}
                    >
                      <span>{optName}</span>
                      <span style={{
                        fontSize: '0.76rem',
                        fontWeight: 'bold',
                        color: 'var(--clr-accent)',
                        background: 'rgba(232, 134, 74, 0.15)',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        border: '1px solid rgba(232, 134, 74, 0.3)'
                      }}>
                        {selectCount}/5
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Footer Navigation Row */}
              <div className="gm-footer-nav" style={{ width: '100%', display: 'flex', gap: '12px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <button
                  style={{
                    ...outlineBtnStyle,
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setIsSummaryPhase(false);
                    setLocalClueIndex(4);
                  }}
                >
                  Back to R5
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── PHASE 5: GAMEOVER RESULT SCREEN ─── */}
      {phase === 'gameover' && (
        <div className="gm-container" style={{ minHeight: 'auto', gap: '8px', width: '100%', maxWidth: '440px', padding: '10px 15px' }}>
          {/* Centered Display Heading */}
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-text)', fontSize: '2.2rem', margin: '15px 0 2px 0', textAlign: 'center', fontWeight: 'bold' }}>
            {isCorrectGuess ? '🎉 Victory!' : 'Level Complete'}
          </h2>
          {isCorrectGuess && actualConcept && (
            <p style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', margin: '0 0 8px 0', textAlign: 'center' }}>
              Concept: <strong style={{ color: 'var(--clr-accent)' }}>"{actualConcept}"</strong>
            </p>
          )}

          {/* Reactive Tenali Character Avatar & Dialogue Speech Bubble */}
          <div className="mr2-char-hub-vertical" style={{ margin: '10px 0', gap: '8px', alignItems: 'center' }}>
            <TenaliAvatar
              expression={isCorrectGuess ? (starsEarned === 3 ? 'cheering' : 'happy') : 'thinking'}
              skin="classic"
            />
            <div className="mr2-speech-bubble" style={{ maxWidth: '360px', padding: '10px 16px', border: '1px solid var(--clr-accent)' }}>
              <p className="mr2-dialogue-text" style={{ fontSize: '0.92rem', margin: 0, color: 'var(--clr-text)', fontWeight: '600' }}>
                {isCorrectGuess
                  ? (starsEarned === 3
                      ? "Brilliant deduction! You read my mind like an open manuscript! 🧠✨"
                      : "Great job! You cracked the mystery! Can you aim for 3 stars next time?")
                  : "A tough puzzle! Even royal masterminds learn from clues. Let's try again!"}
              </p>
            </div>
          </div>

          {/* Sequential Animated Star Pop-In */}
          {isCorrectGuess && (
            <div style={{ fontSize: '2.4rem', color: '#f1c40f', margin: '4px 0', textAlign: 'center', letterSpacing: '8px' }}>
              {Array.from({ length: 3 }).map((_, idx) => {
                const isEarned = idx < starsEarned;
                return (
                  <span
                    key={idx}
                    className={isEarned ? 'gm-star-animated' : ''}
                    style={{
                      animationDelay: `${idx * 0.15}s`,
                      opacity: isEarned ? 1 : 0.18,
                      filter: isEarned ? 'drop-shadow(0 0 10px rgba(241, 196, 15, 0.6))' : 'none'
                    }}
                  >
                    ★
                  </span>
                );
              })}
            </div>
          )}

          {/* Sequential Audio-Enabled XP Breakdown Receipt */}
          {isCorrectGuess && xpBreakdown && (
            <div className="gm-xp-breakdown" style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1.5px solid var(--clr-border)',
              borderRadius: '14px',
              padding: '14px 18px',
              width: '100%',
              margin: '12px 0',
              fontSize: '0.9rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}>
              {/* Step 1: Base XP */}
              {xpStep >= 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', animation: 'gm-fade-in 0.3s ease-out' }}>
                  <span style={{ color: 'var(--clr-text-soft)' }}>🪙 {xpBreakdown.isReplay ? 'Replay Base XP (30%):' : 'Base XP:'}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--clr-text)' }}>+{xpBreakdown.baseXp} XP</span>
                </div>
              )}

              {/* Step 3: No-Hint Bonus */}
              {xpStep >= 3 && xpBreakdown.noHintBonus > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', animation: 'gm-fade-in 0.3s ease-out' }}>
                  <span style={{ color: 'var(--clr-text-soft)' }}>💡 No-Hint Bonus:</span>
                  <span style={{ color: 'var(--clr-correct)', fontWeight: 'bold' }}>+{xpBreakdown.noHintBonus} XP</span>
                </div>
              )}

              {/* Step 4: Streak Bonus */}
              {xpStep >= 4 && xpBreakdown.streakBonus > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', animation: 'gm-fade-in 0.3s ease-out' }}>
                  <span style={{ color: 'var(--clr-text-soft)' }}>🔥 Streak Bonus (Streak: {xpBreakdown.streak}):</span>
                  <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>+{xpBreakdown.streakBonus} XP</span>
                </div>
              )}

              {/* Step 5: Total Sum */}
              {xpStep >= 5 && (
                <div style={{ borderTop: '1px dashed var(--clr-border)', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1rem', animation: 'gm-fade-in 0.3s ease-out' }}>
                  <span style={{ color: 'var(--clr-text)' }}>Total XP Earned:</span>
                  <span style={{ color: 'var(--clr-accent)', fontSize: '1.1rem' }}>+{xpEarned} XP</span>
                </div>
              )}
            </div>
          )}

          {/* Side-by-Side Action Buttons Flow */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '15px', width: '100%' }}>
            <button
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--clr-text)',
                borderRadius: '12px',
                border: '1px solid var(--clr-border)',
                padding: '12px 16px',
                fontSize: '0.92rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
              onClick={() => {
                handleStartLevel(levelNum);
              }}
            >
              Retry
            </button>

            {isCorrectGuess ? (
              <div style={{ flex: 1, position: 'relative' }}>
                {starsEarned < 3 && isHoveringNextLevel && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'max-content',
                    maxWidth: '260px',
                    background: 'var(--clr-card)',
                    border: '1px solid var(--clr-accent)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    color: '#fff',
                    textAlign: 'center',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                    zIndex: 20,
                    pointerEvents: 'none',
                    lineHeight: '1.35'
                  }}>
                    <strong>How to get 3 stars:</strong><br />
                    {starTip || "Select the secret concept in candidate choices across all 5 rounds!"}
                  </div>
                )}
                <button
                  style={{
                    width: '100%',
                    background: 'var(--clr-accent)',
                    color: 'var(--clr-text)',
                    borderRadius: '12px',
                    border: 'none',
                    padding: '12px 16px',
                    fontSize: '0.92rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    boxShadow: '0 4px 14px rgba(232, 134, 74, 0.3)'
                  }}
                  title={starsEarned < 3 ? (starTip || "Select the secret concept in candidate choices across all 5 rounds to get 3 stars!") : ''}
                  onMouseEnter={() => setIsHoveringNextLevel(true)}
                  onMouseLeave={() => setIsHoveringNextLevel(false)}
                  onClick={() => {
                    const completedLvl = levelNum;
                    const nextLvl = levelNum + 1;
                    setAnimatingFrom(completedLvl);
                    setAnimatingTo(nextLvl);
                    setLevelNum(nextLvl);
                    setPhase('levels');
                    playSound('plane');
                  }}
                >
                  Next Level
                </button>
              </div>
            ) : (
              <button
                style={{
                  flex: 1,
                  background: 'var(--clr-accent)',
                  color: 'var(--clr-text)',
                  borderRadius: '12px',
                  border: 'none',
                  padding: '12px 16px',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
                onClick={() => {
                  handleStartLevel(levelNum);
                }}
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
