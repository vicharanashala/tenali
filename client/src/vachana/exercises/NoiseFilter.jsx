import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NOISE_CORPUS } from '../noiseCorpus';
import { motion, AnimatePresence } from 'framer-motion';

// --- Premium Icons ---
const RocketIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="M12 15l-3-3m3 3l3-3m-3 3V9m0-6c-3 0-6 3-6 6v3.5l4-1.5L12 9l2 1 4 1.5V9c0-3-3-6-6-6z"/>
  </svg>
);

const TrophyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffb300' }}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/>
    <path d="M12 2a7 7 0 0 0-7 7v3.76a3 3 0 0 0 1.56 2.63l3.94 2.22c.94.53 2.06.53 3 0l3.94-2.22A3 3 0 0 0 19 12.76V9a7 7 0 0 0-7-7z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const BookOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const BrainIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2z"/>
  </svg>
);

const SwishIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const getLevelType = (levelIndex) => {
  if (levelIndex === 1 || levelIndex === 3) return 'teach';
  if (levelIndex === 2 || levelIndex === 4) return 'standard';
  if (levelIndex === 5) return 'review';
  if (levelIndex === 6) return 'boss';
  if (levelIndex === 7) return 'final_exam';
  return 'standard';
};

const mapStageIndexToOriginal = (tier, stageIndex) => {
  if (tier === 1) {
    if (stageIndex === 1) return 1; // Tutorial
    if (stageIndex === 2) return 2; // Practice: Part 1
    if (stageIndex === 3) return 4; // Practice: Part 2
    if (stageIndex === 4) return 5; // Review Level
    if (stageIndex === 5) return 6; // Hero's Challenge
  } else {
    if (stageIndex === 1) return 2; // Practice: Part 1
    if (stageIndex === 2) return 4; // Practice: Part 2
    if (stageIndex === 3) return 5; // Review Level
    if (stageIndex === 4) return 6; // Hero's Challenge
  }
  return stageIndex;
};

const TIER_NAMES = {
  1: "Reception Arithmetic",
  2: "Basic Operations",
  3: "Fractions & Decimals",
  4: "Measurement & Rates",
  5: "Introductory Geometry",
  6: "Ratios & Percents",
  7: "Data & Probability",
  8: "Introductory Algebra"
};

export default function NoiseFilter() {
  // --- LocalStorage Mastery-Driven State ---
  const [noiseState, setNoiseState] = useState(() => {
    try {
      const stored = localStorage.getItem('tenali_noise_progress');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
    return {
      currentTier: 1,
      currentLevelIndex: 2,
      questionStates: {}, // key: questionId, value: { status: 'mastered' | 'unseen', correctCount, seenCount }
      tierStates: { '1': 'in_progress' }, // 'locked' | 'in_progress' | 'certified'
      placementCompleted: false,
      isPlacing: false,
      placementStep: 0,
      placementTier: 4,
      placementAnswers: [], // array of { tier, questionId, correct }
      failedLevelIndex: null,
      failedLevelType: null,
      reteachQuestionIds: []
    };
  });

  const saveNoiseState = (newState) => {
    setNoiseState(newState);
    try {
      localStorage.setItem('tenali_noise_progress', JSON.stringify(newState));
    } catch {
      // Ignore
    }
  };

  // --- Session Variables ---
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [sessionQIndex, setSessionQIndex] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState([]); // array of booleans
  const [sessionSelections, setSessionSelections] = useState({}); // key: tokenIdx, value: 'noise' | 'relevant'
  const [hasAnswered, setHasAnswered] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [isLoadingPlacement, setIsLoadingPlacement] = useState(false);
  const [teachIndex, setTeachIndex] = useState(0); // for teach stage slideshows
  const [hintsUsed, setHintsUsed] = useState(0);
  const [selectedTier, setSelectedTier] = useState(null);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [modalTeachIndex, setModalTeachIndex] = useState(0);
  const [portalTarget, setPortalTarget] = useState(null);

  useEffect(() => {
    setPortalTarget(document.getElementById('vachana-header-right'));
  }, []);

  // Keypress event handler hook
  useEffect(() => {
    setHintsUsed(0);
  }, [sessionQIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sessionActive || sessionFinished) return;
      
      // space to check / next
      if (e.code === 'Space') {
        e.preventDefault();
        const teachMode = getLevelType(noiseState.currentLevelIndex) === 'teach' && noiseState.failedLevelIndex === null;
        if (teachMode) {
          handleNextTeach();
        } else {
          if (!hasAnswered) {
            checkAnswer();
          } else {
            handleNextQuestion();
          }
        }
      }

      // number keys to toggle tokens (1, 2, 3, etc.)
      const isNum = /^[1-9]$/.test(e.key) || e.key === '0';
      if (isNum && !hasAnswered) {
        const idx = e.key === '0' ? 9 : parseInt(e.key) - 1;
        const currentQ = sessionQuestions[sessionQIndex];
        if (currentQ && currentQ.tokens && idx < currentQ.tokens.length) {
          toggleToken(idx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessionActive, sessionFinished, sessionQuestions, sessionQIndex, sessionSelections, hasAnswered]);

  const startSession = (customType = null, customTier = null, customLevelIndex = null, stateOverride = null) => {
    const baseState = stateOverride || noiseState;
    const targetTier = customTier || baseState.currentTier;
    const targetLevelIndex = customLevelIndex || baseState.currentLevelIndex;
    const origLevelIndex = mapStageIndexToOriginal(targetTier, targetLevelIndex);
    const targetFailedLevelIndex = (customTier && customTier !== baseState.currentTier && !customLevelIndex) ? null : baseState.failedLevelIndex;

    const tierProblems = NOISE_CORPUS.filter(p => p.tier === targetTier);
    let levelType = customType || (origLevelIndex === 7 ? 'final_exam' : getLevelType(origLevelIndex));
    let targetProblems = [];
    let questions = [];

    if (targetFailedLevelIndex !== null) {
      levelType = 'reteach';
    }

    saveNoiseState({
      ...baseState,
      currentTier: targetTier,
      currentLevelIndex: targetLevelIndex,
      failedLevelIndex: customLevelIndex ? null : baseState.failedLevelIndex,
      failedLevelType: customLevelIndex ? null : baseState.failedLevelType
    });

    if (levelType === 'teach') {
      setSessionActive(true);
      setSessionQuestions([]);
      setSessionQIndex(0);
      setSessionAnswers([]);
      setSessionSelections({});
      setSessionFinished(false);
      setTeachIndex(0);
      return;
    }

    if (levelType === 'standard') {
      const startIdx = origLevelIndex === 2 ? 0 : 5;
      targetProblems = tierProblems.slice(startIdx, startIdx + 5);
      questions = [...targetProblems].sort(() => 0.5 - Math.random());
    } else if (levelType === 'review') {
      // mix of previous completed tiers and current tier first chunk
      const pool = NOISE_CORPUS.filter(p => p.tier < targetTier || (p.tier === targetTier && tierProblems.indexOf(p) < 10));
      questions = [...pool].sort(() => 0.5 - Math.random()).slice(0, 15);
    } else if (levelType === 'boss') {
      // all 10 problems in this tier
      questions = [...tierProblems].sort(() => 0.5 - Math.random());
    } else if (levelType === 'reteach') {
      const reteachProblems = NOISE_CORPUS.filter(p => baseState.reteachQuestionIds.includes(p.id));
      questions = [...reteachProblems].sort(() => 0.5 - Math.random());
      // fallback in case empty
      if (questions.length === 0) {
        questions = tierProblems.slice(0, 5);
      }
    } else if (levelType === 'final_exam') {
      // 30 random problems from the whole corpus
      questions = [...NOISE_CORPUS].sort(() => 0.5 - Math.random()).slice(0, 30);
    }

    setSessionQuestions(questions);
    setSessionQIndex(0);
    setSessionAnswers([]);
    setSessionSelections({});
    setHasAnswered(false);
    setSessionFinished(false);
    setSessionActive(true);
  };

  // --- Placement Test Workflow ---
  const startPlacementCheck = () => {
    const startTier = 4;
    const wordPool = NOISE_CORPUS.filter(p => p.tier === startTier);
    const randomProblem = wordPool[Math.floor(Math.random() * wordPool.length)];

    const newState = {
      ...noiseState,
      isPlacing: true,
      placementStep: 1,
      placementTier: startTier,
      placementAnswers: []
    };
    saveNoiseState(newState);

    setSessionQuestions([randomProblem]);
    setSessionQIndex(0);
    setSessionAnswers([]);
    setSessionSelections({});
    setHasAnswered(false);
    setSessionFinished(false);
    setSessionActive(true);
  };

  const handlePlacementAnswer = (isCorrect) => {
    const currentQ = sessionQuestions[sessionQIndex];
    const newAnswers = [...noiseState.placementAnswers, {
      tier: noiseState.placementTier,
      questionId: currentQ.id,
      correct: isCorrect
    }];

    if (noiseState.placementStep < 15) {
      let nextTier = noiseState.placementTier;
      if (isCorrect) {
        nextTier = Math.min(8, nextTier + 1);
      } else {
        nextTier = Math.max(1, nextTier - 1);
      }

      const problemPool = NOISE_CORPUS.filter(p => p.tier === nextTier);
      const seenIds = newAnswers.map(a => a.questionId);
      let available = problemPool.filter(p => !seenIds.includes(p.id));
      if (available.length === 0) available = problemPool;
      const nextProblem = available[Math.floor(Math.random() * available.length)];

      const newState = {
        ...noiseState,
        placementStep: noiseState.placementStep + 1,
        placementTier: nextTier,
        placementAnswers: newAnswers
      };
      saveNoiseState(newState);

      setSessionQuestions(prev => [...prev, nextProblem]);
      setSessionQIndex(prev => prev + 1);
      setSessionSelections({});
      setHasAnswered(false);
    } else {
      // finish placement test and calibrate starting tier
      let placedTier = noiseState.placementTier;
      if (!isCorrect) {
        placedTier = Math.max(1, placedTier - 1);
      }

      const newTierStates = { ...noiseState.tierStates };
      for (let t = 1; t <= placedTier; t++) {
        newTierStates[String(t)] = t === placedTier ? 'in_progress' : 'certified';
      }

      const newQuestionStates = { ...noiseState.questionStates };
      NOISE_CORPUS.forEach(p => {
        if (p.tier < placedTier) {
          newQuestionStates[p.id] = {
            status: 'mastered',
            correctCount: 2,
            seenCount: 2
          };
        }
      });

      const newState = {
        ...noiseState,
        currentTier: placedTier,
        currentLevelIndex: 1,
        tierStates: newTierStates,
        questionStates: newQuestionStates,
        placementCompleted: true,
        isPlacing: false,
        placementAnswers: newAnswers
      };
      saveNoiseState(newState);
      setSessionFinished(true);
    }
  };

  // --- Active Session Quiz Operations ---
  const toggleToken = (idx) => {
    if (hasAnswered) return;
    const currentQ = sessionQuestions[sessionQIndex];
    const totalNoise = currentQ ? currentQ.tokens.filter(tok => tok.isNoise).length : 0;

    setSessionSelections(prev => {
      const isSelectingNoise = prev[idx] !== 'noise';
      if (isSelectingNoise && noiseState.currentTier === 1) {
        const currentSelectedCount = Object.values(prev).filter(val => val === 'noise').length;
        if (currentSelectedCount >= totalNoise) {
          return prev;
        }
      }
      return {
        ...prev,
        [idx]: prev[idx] === 'noise' ? 'relevant' : 'noise'
      };
    });
  };

  const checkAnswer = () => {
    const currentQ = sessionQuestions[sessionQIndex];
    if (!currentQ) return;

    // A problem is correctly filtered if every token is toggled correctly
    const isCorrect = currentQ.tokens.every((tok, idx) => {
      const userState = sessionSelections[idx] || 'relevant';
      const isNoise = tok.isNoise;
      return userState === (isNoise ? 'noise' : 'relevant');
    });

    setSessionAnswers(prev => [...prev, isCorrect]);
    setHasAnswered(true);

    if (noiseState.isPlacing) {
      // handled inside handleNextQuestion for placement
      return;
    }

    // Save mastery update for the question
    const qState = noiseState.questionStates[currentQ.id] || { status: 'unseen', correctCount: 0, seenCount: 0 };
    const newSeenCount = qState.seenCount + 1;
    let newCorrectCount = qState.correctCount;
    if (isCorrect) newCorrectCount += 1;

    let newStatus = qState.status;
    if (newCorrectCount >= 2) {
      newStatus = 'mastered';
    }

    const newQuestionStates = {
      ...noiseState.questionStates,
      [currentQ.id]: {
        status: newStatus,
        correctCount: newCorrectCount,
        seenCount: newSeenCount
      }
    };

    saveNoiseState({
      ...noiseState,
      questionStates: newQuestionStates
    });
  };

  const handleNextQuestion = () => {
    if (noiseState.isPlacing) {
      const lastAnswer = sessionAnswers[sessionAnswers.length - 1];
      handlePlacementAnswer(lastAnswer);
      return;
    }

    if (sessionQIndex < sessionQuestions.length - 1) {
      setSessionQIndex(prev => prev + 1);
      setSessionSelections({});
      setHasAnswered(false);
    } else {
      // session finished, check scores
      const totalCorrect = sessionAnswers.filter(Boolean).length;
      const totalQ = sessionQuestions.length;
      const scorePct = (totalCorrect / totalQ) * 100;

      const origLevelIndex = mapStageIndexToOriginal(noiseState.currentTier, noiseState.currentLevelIndex);
      let levelType = noiseState.failedLevelIndex !== null ? 'reteach' : (origLevelIndex === 7 ? 'final_exam' : getLevelType(origLevelIndex));
      let threshold = (levelType === 'boss' || levelType === 'final_exam') ? 90 : 80;
      const passed = scorePct >= threshold;

      const newState = { ...noiseState };

      if (passed) {
        if (levelType === 'reteach') {
          // resolved the failed stage, reset corrective pointers
          newState.failedLevelIndex = null;
          newState.failedLevelType = null;
          newState.reteachQuestionIds = [];
        } else if (levelType === 'boss') {
          // certified tier
          newState.tierStates[String(noiseState.currentTier)] = 'certified';
          if (noiseState.currentTier < 8) {
            newState.currentTier += 1;
            newState.currentLevelIndex = 1;
            newState.tierStates[String(newState.currentTier)] = 'in_progress';
          } else {
            // Unlocked final exam
            newState.currentLevelIndex = 7;
          }
        } else if (levelType === 'final_exam') {
          // completed all!
        } else {
          // regular stage progression
          newState.currentLevelIndex += 1;
        }
      } else {
        // failed level: trigger Reteach corrective loop
        if (levelType !== 'reteach') {
          newState.failedLevelIndex = noiseState.currentLevelIndex;
          newState.failedLevelType = levelType;
          
          // identify failed question IDs
          const failedIds = [];
          sessionQuestions.forEach((q, idx) => {
            if (!sessionAnswers[idx]) {
              failedIds.push(q.id);
            }
          });
          newState.reteachQuestionIds = failedIds;
        }
      }

      saveNoiseState(newState);
      setSessionFinished(true);
    }
  };

  const handleNextTeach = () => {
    const origLevelIndex = mapStageIndexToOriginal(noiseState.currentTier, noiseState.currentLevelIndex);
    const chunkIdx = origLevelIndex === 1 ? 0 : 5;
    const tierProblems = NOISE_CORPUS.filter(p => p.tier === noiseState.currentTier);
    if (teachIndex < 4 && tierProblems[chunkIdx + teachIndex + 1]) {
      setTeachIndex(prev => prev + 1);
    } else {
      // finished teach stage, return to dashboard
      setSessionActive(false);
      setSessionFinished(false);
    }
  };

  const resetAllProgress = () => {
    const cleanState = {
      currentTier: 1,
      currentLevelIndex: 2,
      questionStates: {},
      tierStates: { '1': 'in_progress' },
      placementCompleted: false,
      isPlacing: false,
      placementStep: 0,
      placementTier: 4,
      placementAnswers: [],
      failedLevelIndex: null,
      failedLevelType: null,
      reteachQuestionIds: []
    };
    saveNoiseState(cleanState);
    setSessionActive(false);
    setSessionFinished(false);
  };

  // --- View Computations ---
  const origLevelIndex = mapStageIndexToOriginal(noiseState.currentTier, noiseState.currentLevelIndex);
  const levelType = noiseState.failedLevelIndex !== null ? 'reteach' : (origLevelIndex === 7 ? 'final_exam' : getLevelType(origLevelIndex));
  const currentQ = sessionQuestions[sessionQIndex];

  const totalNoiseCount = currentQ ? currentQ.tokens.filter(tok => tok.isNoise).length : 0;
  const currentSelectedCount = Object.values(sessionSelections).filter(val => val === 'noise').length;

  const showHint = () => {
    if (!currentQ) return;
    const unfoundIdx = currentQ.tokens.findIndex((tok, idx) => tok.isNoise && sessionSelections[idx] !== 'noise');
    if (unfoundIdx !== -1) {
      setSessionSelections(prev => ({
        ...prev,
        [unfoundIdx]: 'noise'
      }));
      setHintsUsed(prev => prev + 1);
    }
  };

  // ==========================================
  // VIEW: 1. DASHBOARD VIEW (Tier Selection)
  // ==========================================
  if (!sessionActive) {


    return (
      <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
        {portalTarget && createPortal(
          <button
            onClick={() => startSession(null, 1, 1)}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1.5px solid var(--clr-accent)',
              color: 'var(--clr-accent)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(232, 134, 74, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            📖 View Tutorial
          </button>,
          portalTarget
        )}
        {/* Categories Placement Welcome Screen */}
        {isLoadingPlacement && (
          <div style={{
            background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '24px', padding: '40px 28px', textAlign: 'center', margin: '20px auto 32px',
            animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ marginBottom: '16px', transform: 'scale(1.8)', color: 'var(--clr-accent)' }}><ShieldIcon /></div>
            <h4 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '8px', fontFamily: 'var(--font-display)', color: 'var(--clr-accent)' }}>
              Find Your Level
            </h4>
            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '32px', maxWidth: '540px', margin: '0 auto 32px' }}>
              Find your starting level. You will get 15 questions to filter out the noise.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={() => setIsLoadingPlacement(false)} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid var(--clr-border)', color: 'var(--clr-text-soft)', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={() => { setIsLoadingPlacement(false); startPlacementCheck(); }} className="submit-btn" style={{ padding: '12px 32px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Begin Test <RocketIcon />
              </button>
            </div>
          </div>
        )}

        {/* Tier Grid Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(tierNum => {
            const tierState = noiseState.tierStates[String(tierNum)] || 'locked';
            const isActive = tierNum === noiseState.currentTier;
            const isCertified = noiseState.tierStates[String(tierNum)] === 'certified';

            return (
              <div 
                key={tierNum} 
                onClick={() => {
                  let startStage = (tierNum === noiseState.currentTier) ? noiseState.currentLevelIndex : 1;
                  if (tierNum === 1 && startStage === 1) {
                    startStage = 2;
                  }
                  startSession(null, tierNum, startStage);
                }}
                style={{
                  background: isActive ? 'linear-gradient(135deg, var(--clr-surface) 0%, rgba(232, 134, 74, 0.04) 100%)' : 'var(--clr-surface)',
                  border: isActive ? '1.5px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                  borderRadius: '20px', padding: '24px', cursor: 'pointer',
                  boxShadow: isActive ? '0 8px 30px rgba(232,134,74,0.15)' : 'none',
                  display: 'flex', flexDirection: 'column', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--clr-accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = isActive ? 'var(--clr-accent)' : 'var(--clr-border)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: isCertified ? '#2ea043' : (isActive ? 'var(--clr-accent)' : 'var(--clr-text-soft)'), textTransform: 'uppercase' }}>
                    LEVEL {tierNum}
                  </span>
                  <div>
                    {isCertified && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#2ea043', fontWeight: '700' }}><CheckIcon /> Certified</span>}
                  </div>
                </div>

                <h4 style={{ margin: '0', fontSize: '1.1rem', fontWeight: '700', color: 'var(--clr-text)', fontFamily: 'var(--font-display)' }}>
                  {TIER_NAMES[tierNum]}
                </h4>



              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: 2. SESSION COMPLETE SCREEN
  // ==========================================
  if (sessionFinished) {
    const totalCorrect = sessionAnswers.filter(Boolean).length;
    const totalQ = sessionQuestions.length;
    const scorePct = totalQ > 0 ? (totalCorrect / totalQ) * 100 : 0;
    
    let isTeach = getLevelType(noiseState.currentLevelIndex) === 'teach' && noiseState.failedLevelIndex === null;
    if (noiseState.failedLevelIndex !== null) isTeach = false;

    return (
      <div style={{ maxWidth: '480px', margin: '40px auto', textAlign: 'center', animation: 'scaleUp 0.3s ease-out' }}>
        <div style={{
          background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '24px', padding: '40px 32px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
        }}>
          <div style={{ marginBottom: '20px', transform: 'scale(1.8)', color: 'var(--clr-accent)' }}>
            <TrophyIcon />
          </div>

          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 8px', color: 'var(--clr-text)', fontFamily: 'var(--font-display)' }}>
            {noiseState.isPlacing ? 'Test Completed!' : (isTeach ? 'Lesson Finished!' : 'Session Complete!')}
          </h3>

          {!noiseState.isPlacing && !isTeach && (
            <>
              <div style={{ fontSize: '3.6rem', fontWeight: '900', color: scorePct >= (levelType === 'boss' || levelType === 'final_exam' ? 90 : 80) ? '#2ea043' : '#ef5350', margin: '20px 0 10px' }}>
                {totalCorrect}/{totalQ}
              </div>
              <p style={{ fontSize: '1.05rem', color: 'var(--clr-text-soft)', margin: '0 0 32px' }}>
                {scorePct >= (levelType === 'boss' || levelType === 'final_exam' ? 90 : 80)
                  ? 'Congratulations! You successfully passed the target score and completed this stage!'
                  : `You scored ${Math.round(scorePct)}%, which is below the pass target. Let's do a corrective reteach micro-level to address the missed items.`
                }
              </p>
            </>
          )}

          {isTeach && (
            <p style={{ fontSize: '1.05rem', color: 'var(--clr-text-soft)', margin: '0 0 32px' }}>
              Awesome! You have reviewed all the word problems in this teaching stage. You are now ready to practice!
            </p>
          )}

          {noiseState.isPlacing && (
            <p style={{ fontSize: '1.05rem', color: 'var(--clr-text-soft)', margin: '0 0 32px' }}>
              Excellent job! Based on your performance in the Level Finder, we have calibrated your entry point to: <br/>
              <strong style={{ color: 'var(--clr-accent)', fontSize: '1.2rem', display: 'block', marginTop: '12px' }}>
                Level {noiseState.currentTier}: {TIER_NAMES[noiseState.currentTier]}
              </strong>
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => {
                setSessionFinished(false);
                setSessionActive(false);
                if (noiseState.isPlacing) {
                  // close placement check
                  saveNoiseState({ ...noiseState, isPlacing: false });
                }
              }}
              className="submit-btn"
              style={{ width: '100%', padding: '12px 0', fontSize: '0.98rem', fontWeight: '700' }}
            >
              Continue to Dashboard
            </button>
            
            {!isTeach && !noiseState.isPlacing && scorePct < (levelType === 'boss' || levelType === 'final_exam' ? 90 : 80) && (
              <button
                onClick={() => {
                  setSessionFinished(false);
                  startSession();
                }}
                style={{
                  width: '100%', padding: '12px 0', fontSize: '0.98rem', fontWeight: '700',
                  background: 'transparent', border: '1px solid var(--clr-border)', color: 'var(--clr-text-soft)', borderRadius: '12px', cursor: 'pointer'
                }}
              >
                Start Corrective Reteach
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: 3. TEACHING SLIDESHOW VIEW (Stage 1 & 3)
  // ==========================================
  const teachMode = levelType === 'teach';
  if (teachMode) {
    const chunkIdx = origLevelIndex === 1 ? 0 : 5;
    const tierProblems = NOISE_CORPUS.filter(p => p.tier === noiseState.currentTier);
    const activeProblem = tierProblems[chunkIdx + teachIndex];

    return (
      <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
        {/* Progress header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', color: 'var(--clr-text-soft)', marginBottom: '20px'
        }}>
          <span style={{ fontWeight: '600' }}>
            Level {noiseState.currentTier} · Tutorial
          </span>
          <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: '6px' }}>
            Example {teachIndex + 1} of 5
          </span>
        </div>

        {/* Teaching Card */}
        {activeProblem && (
          <div style={{
            background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '24px', padding: '32px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.3)', marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--clr-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpenIcon /> Example: {activeProblem.title}
              </h4>
            </div>

            <p style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
              Compare the original story with the filtered version below to see what to keep.
            </p>

            {/* Structured example comparison */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--clr-text-soft)', fontWeight: 700, display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>
                  Original Story
                </span>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--clr-text-soft)' }}>
                  {activeProblem.question_text}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--clr-accent)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>⬇️ Noise Filter Applied ⬇️</span>
              </div>

              <div style={{ padding: '16px', background: 'rgba(46,160,67,0.03)', borderRadius: '12px', border: '1px solid rgba(46,160,67,0.2)' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#2ea043', fontWeight: 700, display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>
                  Core Math Info
                </span>
                <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.7', color: '#fff', display: 'flex', flexWrap: 'wrap', gap: '4px 6px', alignItems: 'center' }}>
                  {activeProblem.tokens.map((tok, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: tok.isNoise ? '2px 6px' : '2px 8px',
                        borderRadius: '6px',
                        background: tok.isNoise ? 'rgba(239,83,80,0.08)' : 'rgba(46,160,67,0.08)',
                        border: tok.isNoise ? '1px dashed rgba(239,83,80,0.3)' : '1px solid rgba(46,160,67,0.3)',
                        textDecoration: tok.isNoise ? 'line-through' : 'none',
                        color: tok.isNoise ? '#ef5350' : '#2ea043',
                        opacity: tok.isNoise ? 0.45 : 1,
                        fontWeight: tok.isNoise ? 'normal' : '700',
                      }}
                    >
                      {tok.text}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            {/* Explanation box */}
            <div style={{
              padding: '16px', background: 'rgba(232, 134, 74, 0.05)', border: '1px solid rgba(232, 134, 74, 0.15)', borderRadius: '12px',
              fontSize: '0.9rem', color: 'var(--clr-text)', lineHeight: '1.6'
            }}>
              <strong style={{ color: 'var(--clr-accent)', display: 'block', marginBottom: '6px' }}>Why?</strong>
              {activeProblem.explanation}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          <button
            onClick={() => {
              setSessionActive(false);
              setSessionFinished(false);
            }}
            style={{
              padding: '12px 24px', background: 'transparent', border: '1px solid var(--clr-border)', color: 'var(--clr-text-soft)',
              borderRadius: '12px', cursor: 'pointer', fontWeight: '600'
            }}
          >
            Dashboard
          </button>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {teachIndex > 0 && (
              <button
                onClick={() => setTeachIndex(prev => prev - 1)}
                style={{
                  padding: '12px 20px', background: 'transparent', border: '1px solid var(--clr-border)', color: 'var(--clr-text)',
                  borderRadius: '12px', cursor: 'pointer', fontWeight: '600'
                }}
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNextTeach}
              className="submit-btn"
              style={{ padding: '12px 32px', fontWeight: '600' }}
            >
              {teachIndex < 4 && tierProblems[chunkIdx + teachIndex + 1] ? 'Next Concept' : 'Finish Lesson'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: 4. QUIZ / ACTIVE EXERCISE WORKSPACE
  // ==========================================
  return (
    <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Progress header info */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.88rem', color: 'var(--clr-text-soft)', marginBottom: '10px' }}>
          <span style={{ fontWeight: '600' }}>
            {noiseState.isPlacing
              ? `Level Finder — Question ${noiseState.placementStep} of 15`
              : levelType === 'reteach'
                ? `Reteach Corrective Level — Question ${sessionQIndex + 1} of ${sessionQuestions.length}`
                : levelType === 'final_exam'
                  ? `Final Exam — Question ${sessionQIndex + 1} of ${sessionQuestions.length}`
                  : `Level ${noiseState.currentTier} · Stage ${noiseState.currentLevelIndex} — Question ${sessionQIndex + 1} of ${sessionQuestions.length}`
            }
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!noiseState.isPlacing && noiseState.currentTier >= 1 && (
              <button
                onClick={() => {
                  setModalTeachIndex(0);
                  setShowTutorialModal(true);
                }}
                style={{
                  padding: '4px 10px', background: 'rgba(232,134,74,0.12)', border: '1px solid var(--clr-accent)',
                  color: 'var(--clr-accent)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
                  fontWeight: '700', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '4px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--clr-accent)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(232,134,74,0.12)';
                  e.currentTarget.style.color = 'var(--clr-accent)';
                }}
              >
                💡 Tutorial Reference
              </button>
            )}
            <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>
              {!noiseState.isPlacing && `Pass Target: ${levelType === 'boss' || levelType === 'final_exam' ? '90%' : '80%'}`}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            width: `${noiseState.isPlacing ? (noiseState.placementStep / 15) * 100 : ((sessionQIndex + (hasAnswered ? 1 : 0)) / sessionQuestions.length) * 100}%`,
            height: '100%', background: 'linear-gradient(90deg, var(--clr-accent) 0%, #ffaa66 100%)', boxShadow: '0 0 8px var(--clr-accent)',
            transition: 'width 0.4s ease-out'
          }} />
        </div>
      </div>

      {/* Main interactive Card */}
      {currentQ && (
        <div style={{
          background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '24px', padding: '32px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)', marginBottom: '24px', position: 'relative'
        }}>




          {/* Noise filter status tracker */}
          {noiseState.currentTier === 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', fontWeight: '600' }}>
                Noise elements: {currentSelectedCount} of {totalNoiseCount} selected
              </span>
            </div>
          )}

          {/* Tokens Box */}
          <div style={{
            display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--clr-border)',
            marginBottom: '24px', lineHeight: '1.8'
          }}>
            {currentQ.tokens.map((tok, idx) => {
              const userVal = sessionSelections[idx] || 'relevant';
              const isNoise = userVal === 'noise';

              // After verification, show matching borders
              let borderStyle = '1px solid var(--clr-border)';
              let color = 'var(--clr-text)';
              let bg = 'transparent';

              if (hasAnswered) {
                const wasCorrect = userVal === (tok.isNoise ? 'noise' : 'relevant');
                if (wasCorrect) {
                  borderStyle = '1.5px solid #2ea043';
                  color = '#2ea043';
                  bg = 'rgba(46,160,67,0.03)';
                } else {
                  borderStyle = '1.5px solid #ef5350';
                  color = '#ef5350';
                  bg = 'rgba(239,83,80,0.03)';
                }
              } else {
                if (isNoise) {
                  borderStyle = '1px dashed #ef5350';
                  color = '#ef5350';
                  bg = 'rgba(239,83,80,0.02)';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={hasAnswered}
                  onClick={() => toggleToken(idx)}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', border: borderStyle, color, background: bg,
                    opacity: isNoise ? 0.45 : 1, textDecoration: isNoise ? 'line-through' : 'none',
                    cursor: hasAnswered ? 'default' : 'pointer', fontSize: '0.92rem', transition: 'all 0.2s', fontWeight: '500'
                  }}
                  onMouseEnter={e => {
                    if (!hasAnswered) e.currentTarget.style.borderColor = 'var(--clr-accent)';
                  }}
                  onMouseLeave={e => {
                    if (!hasAnswered) e.currentTarget.style.borderColor = isNoise ? '#ef5350' : 'var(--clr-border)';
                  }}
                >
                  {tok.text}
                </button>
              );
            })}
          </div>

          {/* Submission and Explanations Display */}
          <AnimatePresence>
            {hasAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--clr-border)', borderRadius: '16px', padding: '20px', marginBottom: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '1.1rem', fontWeight: '700',
                    color: sessionAnswers[sessionAnswers.length - 1] ? '#2ea043' : '#ef5350'
                  }}>
                    {sessionAnswers[sessionAnswers.length - 1] ? '✅ Correct! Perfect Filtering' : '❌ Mismatch Found'}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--clr-text-soft)', margin: '0 0 14px', lineHeight: '1.5' }}>
                  {currentQ.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setSessionActive(false);
                  setSessionFinished(false);
                }}
                style={{
                  padding: '12px 24px', background: 'transparent', border: '1px solid var(--clr-border)', color: 'var(--clr-text-soft)',
                  borderRadius: '12px', cursor: 'pointer', fontWeight: '600'
                }}
              >
                Exit Level
              </button>

              <button
                onClick={() => {
                  const startLevelIndex = noiseState.currentTier === 1 ? 2 : 1;
                  const newState = {
                    ...noiseState,
                    currentTier: noiseState.currentTier,
                    currentLevelIndex: startLevelIndex,
                    failedLevelIndex: null,
                    failedLevelType: null,
                    reteachQuestionIds: []
                  };
                  newState.tierStates[String(noiseState.currentTier)] = 'in_progress';
                  startSession(null, noiseState.currentTier, startLevelIndex, newState);
                }}
                style={{
                  padding: '12px 24px', background: 'transparent', border: '1px solid rgba(239, 83, 80, 0.3)', color: '#ef5350',
                  borderRadius: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239, 83, 80, 0.05)';
                  e.currentTarget.style.borderColor = '#ef5350';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(239, 83, 80, 0.3)';
                }}
              >
                Reset Level
              </button>
            </div>

            {!hasAnswered ? (
              <button
                onClick={checkAnswer}
                className="submit-btn"
                style={{ padding: '12px 32px', fontWeight: '700', fontSize: '0.92rem' }}
              >
                Verify Filter
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="submit-btn"
                style={{ padding: '12px 32px', fontWeight: '700', fontSize: '0.92rem' }}
              >
                {sessionQIndex < sessionQuestions.length - 1 ? 'Next Question' : 'Finish Session'}
              </button>
            )}
          </div>
        </div>
      )}
      {showTutorialModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
            borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '600px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative'
          }}>
            <button
              onClick={() => setShowTutorialModal(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px', background: 'transparent',
                border: 'none', color: 'var(--clr-text-soft)', fontSize: '1.2rem', cursor: 'pointer'
              }}
            >
              ✕
            </button>
            
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: '0.88rem', color: 'var(--clr-text-soft)', marginBottom: '20px'
            }}>
              <span style={{ fontWeight: '600' }}>
                Level {noiseState.currentTier} · Tutorial Reference
              </span>
              <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: '6px' }}>
                Example {modalTeachIndex + 1} of 5
              </span>
            </div>

            {/* Teaching Card Problem details inside modal */}
            {(() => {
              const tierProblems = NOISE_CORPUS.filter(p => p.tier === noiseState.currentTier);
              const activeProblem = tierProblems[modalTeachIndex]; // Chunk 1 tutorial is at index 0-4
              if (!activeProblem) return null;

              return (
                <div>
                  <div style={{
                    fontSize: '1.15rem', color: 'var(--clr-text)', fontWeight: '700',
                    lineHeight: '1.6', marginBottom: '24px', fontFamily: 'var(--font-display)',
                    background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px',
                    border: '1px solid var(--clr-border)'
                  }}>
                    {activeProblem.tokens.map((tok, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-block', margin: '0 3px', padding: '2px 4px',
                          borderRadius: '4px',
                          background: tok.isNoise ? 'rgba(239, 83, 80, 0.15)' : 'rgba(46, 160, 67, 0.15)',
                          color: tok.isNoise ? '#ef5350' : '#2ea043',
                          textDecoration: tok.isNoise ? 'line-through' : 'none',
                          fontWeight: tok.isNoise ? '400' : '700'
                        }}
                      >
                        {tok.text}
                      </span>
                    ))}
                  </div>



                  {/* Navigation inside modal */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                    {modalTeachIndex > 0 ? (
                      <button
                        onClick={() => setModalTeachIndex(prev => prev - 1)}
                        style={{
                          padding: '10px 20px', background: 'transparent', border: '1px solid var(--clr-border)',
                          color: 'var(--clr-text)', borderRadius: '10px', cursor: 'pointer', fontWeight: '600'
                        }}
                      >
                        Previous
                      </button>
                    ) : <div />}
                    
                    <button
                      onClick={() => {
                        if (modalTeachIndex < 4) {
                          setModalTeachIndex(prev => prev + 1);
                        } else {
                          setShowTutorialModal(false);
                        }
                      }}
                      className="submit-btn"
                      style={{ padding: '10px 24px', fontWeight: '600' }}
                    >
                      {modalTeachIndex < 4 ? 'Next Concept' : 'Got it!'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
