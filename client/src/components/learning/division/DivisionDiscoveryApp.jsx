import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import DivisionJar from './DivisionJar';
import DivisionFriends from './DivisionFriends';
import DivisionDemonstration from './DivisionDemonstration';
import DivisionEquationView from './DivisionEquationView';
import DivisionTerminology from './DivisionTerminology';
import CandyPiece from './CandyPiece';
import FriendAvatar from './FriendAvatar';
import {
  IconCandy,
  IconCelebration,
  IconReplay,
  IconArrowRight,
  IconSparkles,
  IconDragHand,
  IconLock,
  IconHand,
  IconEmotion,
  IconCheck
} from './DivisionIcons';
import { DIVISION_DEMOS, DIVISION_ACTIVITIES } from '../../../data/divisionActivities';
import {
  getEmotionalState,
  isFriendLocked,
  isDistributionEqual,
  isFairSharingComplete,
  giveChocolate,
  returnChocolate
} from './divisionLogic';
import './division-learn.css';

function ActivityProblemView({
  activity,
  problem,
  problemIdx,
  onProblemDone,
  onReset
}) {
  // Single atomic state for mathematical integrity
  const [gameState, setGameState] = useState(() => ({
    jarCount: problem.total,
    counts: Array(problem.friends).fill(0)
  }));
  const [jarSelected, setJarSelected] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Synchronous state ref for window pointer listeners
  const stateRef = useRef(gameState);
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  // Drag state
  const dragRef = useRef({
    active: false,
    source: null, // 'jar' | 'plate'
    friendIdx: null,
    startX: 0,
    startY: 0
  });

  const [dragGhost, setDragGhost] = useState(null); // { x, y }
  const [dragSource, setDragSource] = useState(null); // 'jar' | 'plate' | null
  const [hoveredFriendIdx, setHoveredFriendIdx] = useState(null);
  const [isHoveredJar, setIsHoveredJar] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // In Activity 1 (Exact Sharing), guided scaffolding with turn-taking lock is active.
  // After the exact section (Activities 2, 3, 4, or any with remainder), free experimentation mode is active.
  const isFreeMode = activity.id > 1 || Boolean(activity.hasRemainder);

  // In free mode, friend reactions become visible only after submitting!
  const emotions = isFreeMode
    ? (hasSubmitted ? getEmotionalState(gameState.counts, gameState.jarCount) : gameState.counts.map(() => 'neutral'))
    : getEmotionalState(gameState.counts, gameState.jarCount);

  const isEqual = isDistributionEqual(gameState.counts);
  const isComplete = isFairSharingComplete(gameState.counts, gameState.jarCount);
  const hasUnequalCandies = !isEqual;

  const handleGive = useCallback((friendIndex) => {
    setGameState((prev) => {
      const next = giveChocolate(friendIndex, prev.counts, prev.jarCount, isFreeMode);
      if (!next) return prev;
      if (!isFreeMode && isFairSharingComplete(next.counts, next.jarCount)) {
        setShowCelebration(true);
      }
      return next;
    });
    setJarSelected(false);
    if (isFreeMode) {
      setHasSubmitted(false);
      setShowCelebration(false);
    }
  }, [isFreeMode]);

  const handleReturn = useCallback((friendIndex) => {
    setGameState((prev) => {
      const next = returnChocolate(friendIndex, prev.counts, prev.jarCount);
      if (!next) return prev;
      setShowCelebration(false);
      return next;
    });
    if (isFreeMode) {
      setHasSubmitted(false);
      setShowCelebration(false);
    }
  }, [isFreeMode]);

  const handleSubmit = useCallback(() => {
    setHasSubmitted(true);
    const min = Math.min(...gameState.counts);
    const max = Math.max(...gameState.counts);
    const hasCandies = gameState.counts.some(c => c > 0);
    const fairEqual = min === max && hasCandies;
    const canShareMore = gameState.jarCount >= problem.friends;

    if (fairEqual && !canShareMore) {
      setShowCelebration(true);
    }
  }, [gameState.counts, gameState.jarCount, problem.friends]);

  // Pointer drag start from Jar
  const handlePointerDownJar = (e) => {
    if (stateRef.current.jarCount <= 0 || showCelebration) return;
    e.preventDefault();
    dragRef.current = {
      active: true,
      source: 'jar',
      friendIdx: null,
      startX: e.clientX,
      startY: e.clientY
    };
    setDragGhost({ x: e.clientX, y: e.clientY });
    setDragSource('jar');
    setHoveredFriendIdx(null);
    setIsHoveredJar(false);
  };

  // Pointer drag start from Friend Plate
  const handlePointerDownPlate = (e, friendIdx) => {
    if (stateRef.current.counts[friendIdx] <= 0 || showCelebration) return;
    e.preventDefault();
    dragRef.current = {
      active: true,
      source: 'plate',
      friendIdx,
      startX: e.clientX,
      startY: e.clientY
    };
    setDragGhost({ x: e.clientX, y: e.clientY });
    setDragSource('plate');
    setHoveredFriendIdx(null);
    setIsHoveredJar(false);
  };


  // Window-level pointer tracking
  useEffect(() => {
    const onPointerMove = (e) => {
      if (!dragRef.current.active) return;
      e.preventDefault();

      const x = e.clientX;
      const y = e.clientY;
      setDragGhost({ x, y });

      const elem = document.elementFromPoint(x, y);
      if (!elem) {
        setHoveredFriendIdx(null);
        setIsHoveredJar(false);
        return;
      }

      const friendCard = elem.closest('[data-friend-index]');
      if (friendCard) {
        const idx = parseInt(friendCard.getAttribute('data-friend-index'), 10);
        setHoveredFriendIdx(isNaN(idx) ? null : idx);
        setIsHoveredJar(false);
        return;
      }

      const jarTarget = elem.closest('[data-drop-jar]');
      if (jarTarget) {
        setIsHoveredJar(true);
        setHoveredFriendIdx(null);
        return;
      }

      setHoveredFriendIdx(null);
      setIsHoveredJar(false);
    };

    const onPointerUp = (e) => {
      if (!dragRef.current.active) return;

      const { source, friendIdx, startX, startY } = dragRef.current;
      dragRef.current.active = false;
      setDragGhost(null);

      const endX = e.clientX;
      const endY = e.clientY;
      const dist = Math.hypot(endX - startX, endY - startY);

      const elem = document.elementFromPoint(endX, endY);
      const friendCard = elem ? elem.closest('[data-friend-index]') : null;
      const jarTarget = elem ? elem.closest('[data-drop-jar]') : null;

      if (source === 'jar') {
        if (friendCard) {
          const targetIdx = parseInt(friendCard.getAttribute('data-friend-index'), 10);
          if (!isNaN(targetIdx)) {
            const locked = !isFreeMode && isFriendLocked(targetIdx, stateRef.current.counts);
            if (!locked) {
              handleGive(targetIdx);
            }
          }
        } else if (dist < 8) {
          // Tap / click on jar to toggle selection
          setJarSelected(prev => !prev);
        }
      } else if (source === 'plate') {
        if (jarTarget || !friendCard) {
          handleReturn(friendIdx);
        } else if (dist < 8) {
          handleReturn(friendIdx);
        }
      }

      setHoveredFriendIdx(null);
      setIsHoveredJar(false);
      setDragSource(null);
    };


    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [handleGive, handleReturn]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === ' ' && stateRef.current.jarCount > 0) {
        e.preventDefault();
        setJarSelected(prev => !prev);
        return;
      }

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= problem.friends) {
        e.preventDefault();
        const targetIdx = num - 1;
        const locked = !isFreeMode && isFriendLocked(targetIdx, stateRef.current.counts);
        if (!locked && stateRef.current.jarCount > 0) {
          handleGive(targetIdx);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [problem.friends, handleGive, isFreeMode]);

  const friendsList = Array.from({ length: problem.friends }, (_, i) => ({
    name: problem.friendNames[i] || `Friend ${i + 1}`,
    characterId: problem.characterIds ? problem.characterIds[i] : (['maya', 'rohan', 'priya', 'leo', 'sam'][i % 5])
  }));

  return (
    <div className="division-card division-fade-opacity">
      {/* Visual Goal Banner with zero emojis */}
      <div className="division-goal-banner">
        <div className="division-goal-icons">
          <IconCandy size={24} />
          <IconArrowRight size={18} />
          <IconDragHand size={24} />
        </div>
        <div className="division-goal-text">
          {activity.title}: {activity.subtitle} ({problemIdx + 1} / {activity.problems.length})
        </div>
        <div className="division-drag-instruction-chip">
          <IconDragHand size={18} />
          <span>Drag candies to friends</span>
        </div>
      </div>

      {/* Core Interactive Board: Jar + Friends */}
      <div className="division-board">
        <DivisionJar
          count={gameState.jarCount}
          isSelected={jarSelected}
          onSelect={() => setJarSelected(s => !s)}
          isRemainderPhase={showCelebration && gameState.jarCount > 0}
          disabled={showCelebration}
          onPointerDownCandy={handlePointerDownJar}
          isHoveredDrop={isHoveredJar && dragSource === 'plate'}
        />

        <DivisionFriends
          friends={friendsList}
          counts={gameState.counts}
          emotions={emotions}
          isLocked={(idx) => (isFreeMode ? false : isFriendLocked(idx, gameState.counts))}
          onGiveCandy={handleGive}
          onReturnCandy={handleReturn}
          jarSelected={jarSelected}
          hoveredFriendIdx={hoveredFriendIdx}
          isDraggingFromJar={dragGhost !== null}
          onPlateCandyPointerDown={handlePointerDownPlate}
          disabled={showCelebration}
          isFreeMode={isFreeMode}
        />
      </div>

      {/* Floating Candy Ghost during Drag, portaled to document.body for pixel-exact cursor positioning */}
      {dragGhost && typeof document !== 'undefined' && createPortal(
        <div
          className="division-drag-ghost"
          style={{
            left: `${dragGhost.x}px`,
            top: `${dragGhost.y}px`
          }}
        >
          <CandyPiece size={46} isDragging={true} />
        </div>,
        document.body
      )}

      {/* Unequal Sharing Warning (shown when submitted in free mode or when jar emptied unequally in exact mode) */}
      {((!isFreeMode && hasUnequalCandies && gameState.jarCount === 0) || (isFreeMode && hasSubmitted && hasUnequalCandies)) && (
        <div className="division-warning-banner">
          <IconEmotion emotion="sad" size={24} />
          <span>Not everyone is happy! Someone has fewer candies. Drag the extra candy back to the jar to keep sharing fair.</span>
        </div>
      )}

      {/* Info Banner when equal but more candies can still be shared */}
      {isFreeMode && hasSubmitted && isEqual && (gameState.jarCount >= problem.friends) && gameState.counts.some(c => c > 0) && (
        <div className="division-info-banner">
          <IconCandy size={22} />
          <span>You shared equally so far, but there are still enough candies in the jar to give more to everyone! Keep distributing.</span>
        </div>
      )}

      {/* Info Banner if submitted without distributing candies */}
      {isFreeMode && hasSubmitted && gameState.counts.every(c => c === 0) && (
        <div className="division-info-banner">
          <IconHand size={22} />
          <span>Drag candies from the jar to the friends before submitting!</span>
        </div>
      )}

      {/* Success / Completion Celebration */}
      {showCelebration && (
        <div className="division-celebration">
          <div className="division-celebration-title">
            <IconCelebration size={28} />
            <span>All Friends Are Happy!</span>
          </div>
          <p style={{ margin: '0 0 16px', color: 'var(--clr-text, #ede8e3)', fontWeight: 600 }}>
            {gameState.jarCount > 0
              ? `Every friend received ${gameState.counts[0]} candies, and ${gameState.jarCount} remain in the jar.`
              : `Every friend received exactly ${gameState.counts[0]} candies!`}
          </p>
          <div className="division-controls-bar">
            <button
              className="division-action-btn primary"
              onClick={() => onProblemDone(gameState.counts[0], gameState.jarCount)}
            >
              <span>See What We Discovered</span>
              <IconSparkles size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Action Controls (Reset & Submit) */}
      {!showCelebration && (
        <div className="division-controls-bar">
          <button
            className="division-action-btn secondary"
            onClick={() => {
              setGameState({
                jarCount: problem.total,
                counts: Array(problem.friends).fill(0)
              });
              setShowCelebration(false);
              setJarSelected(false);
              setHasSubmitted(false);
              onReset && onReset();
            }}
            title="Reset candies back to the jar"
          >
            <IconReplay size={16} />
            <span>Reset Jar</span>
          </button>

          {/* Submit Button in Free Experimentation Mode */}
          {isFreeMode && (
            <button
              className="division-action-btn primary"
              onClick={handleSubmit}
              title="Submit distribution to see friend reactions"
            >
              <IconCheck size={18} />
              <span>Submit</span>
            </button>
          )}

          {/* Activity 1 manual fallback button if complete */}
          {!isFreeMode && isComplete && gameState.counts[0] > 0 && (
            <button
              className="division-action-btn primary"
              onClick={() => onProblemDone(gameState.counts[0], gameState.jarCount)}
            >
              <span>Fair Share Complete!</span>
              <IconSparkles size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * DivisionDiscoveryApp Component
 * Full interactive learning experience teaching division through fair sharing of candies.
 * Uses high-res sprite sheet avatars and drag-and-drop distribution.
 */
export default function DivisionDiscoveryApp({ onBack, onStartTest }) {
  const [phase, setPhase] = useState('goal');
  const [activityIdx, setActivityIdx] = useState(0);
  const [problemIdx, setProblemIdx] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  // Result snapshot for equation derivation
  const [lastResult, setLastResult] = useState({ perFriend: 0, leftover: 0 });

  const currentActivity = DIVISION_ACTIVITIES[activityIdx] || DIVISION_ACTIVITIES[0];
  const currentProblem = currentActivity.problems[problemIdx] || currentActivity.problems[0];

  const handleProblemDone = (perFriend, leftover) => {
    setLastResult({ perFriend, leftover });
    setPhase('equation');
  };

  const handleEquationContinue = () => {
    if (problemIdx < currentActivity.problems.length - 1) {
      setProblemIdx(prev => prev + 1);
      setPhase('activity');
    } else if (activityIdx < DIVISION_ACTIVITIES.length - 1) {
      setActivityIdx(prev => prev + 1);
      setProblemIdx(0);
      setPhase('activity');
    } else {
      try {
        localStorage.setItem('tenali_division_learned', 'true');
      } catch { /* localStorage fallback */ }
      setPhase('terminology');
    }
  };

  const PILL_STEPS = [
    { key: 'demo', label: 'Demo' },
    { key: 'act1', label: '1. Exact' },
    { key: 'act2', label: '2. Larger' },
    { key: 'act3', label: '3. Leftovers' },
    { key: 'act4', label: '4. Challenge' },
    { key: 'term', label: 'Review' }
  ];

  const getPillStatus = (idx) => {
    if (phase === 'demo') return idx === 0 ? 'active' : 'idle';
    if (phase === 'terminology') return idx === 5 ? 'active' : 'completed';
    const activePillIdx = activityIdx + 1;
    if (idx < activePillIdx) return 'completed';
    if (idx === activePillIdx) return 'active';
    return 'idle';
  };

  return (
    <div className="division-learn-container fade-in">
      {/* Header */}
      <div className="division-header">
        <button className="division-back-btn" onClick={onBack} title="Return to Home">
          ← Back to Home
        </button>

        <div className="division-progress-pills">
          {PILL_STEPS.map((step, idx) => (
            <div
              key={step.key}
              className={`division-pill ${getPillStatus(idx)}`}
              onClick={() => {
                if (idx === 0) setPhase('demo');
                else if (idx <= 4) {
                  setActivityIdx(idx - 1);
                  setProblemIdx(0);
                  setPhase('activity');
                } else {
                  setPhase('terminology');
                }
              }}
              style={{ cursor: 'pointer' }}
              title={`Jump to ${step.label}`}
            >
              {step.label}
            </div>
          ))}
        </div>
      </div>

      {/* PHASE 1: START WITH A VISUAL GOAL (NO EMOJIS, NEW SPRITES) */}
      {phase === 'goal' && (
        <div className="division-card division-fade-opacity" style={{ textAlign: 'center', padding: '40px 24px' }}>
          {/* Animated Hero Illustration */}
          <div className="division-goal-hero-graphic">
            <div className="hero-candy-badge">
              <CandyPiece size={48} isDragging={false} interactive={false} />
            </div>
            <div className="hero-arrow">
              <IconArrowRight size={28} />
            </div>
            <div className="hero-friends-row">
              <FriendAvatar characterId="rohan" emotion="happy" size={88} />
              <FriendAvatar characterId="priya" emotion="happy" size={88} />
              <FriendAvatar characterId="maya" emotion="happy" size={88} />
            </div>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--clr-text, #ede8e3)', margin: '16px 0 12px' }}>
            Fair Sharing
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--clr-accent, #e8864a)', fontWeight: 700, margin: '0 0 28px' }}>
            Make all friends happy by sharing candies equally!
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <div style={{ background: 'var(--clr-surface, #362f2a)', padding: '18px 24px', borderRadius: '16px', border: '1px solid var(--clr-border, rgba(255, 245, 230, 0.18))' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <IconEmotion emotion="happy" size={26} />
                <IconEmotion emotion="happy" size={26} />
                <IconEmotion emotion="happy" size={26} />
              </div>
              <div style={{ fontWeight: 700, marginTop: '8px', color: 'var(--clr-correct, #5cb87a)' }}>
                Equal Shares = Happy Friends
              </div>
            </div>
            <div style={{ background: 'var(--clr-surface, #362f2a)', padding: '18px 24px', borderRadius: '16px', border: '1px solid var(--clr-border, rgba(255, 245, 230, 0.18))' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                <IconLock size={20} locked={true} />
                <IconArrowRight size={16} />
                <IconHand size={20} />
              </div>
              <div style={{ fontWeight: 700, marginTop: '8px', color: 'var(--clr-accent, #e8864a)' }}>
                One at a Time, Take Turns
              </div>
            </div>
          </div>

          <div className="division-controls-bar" style={{ justifyContent: 'center', gap: '16px' }}>
            <button
              className="division-action-btn primary"
              style={{ fontSize: '1.15rem', padding: '14px 36px' }}
              onClick={() => {
                setPhase('activity');
                setActivityIdx(0);
                setProblemIdx(0);
              }}
            >
              <IconDragHand size={22} />
              <span>Start Drag & Drop Sharing</span>
            </button>
            <button
              className="division-action-btn secondary"
              style={{ fontSize: '1.05rem', padding: '14px 28px' }}
              onClick={() => setPhase('demo')}
            >
              <span>Watch Guided Demo</span>
              <IconArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: GUIDED DEMONSTRATIONS */}
      {phase === 'demo' && (
        <DivisionDemonstration
          demos={DIVISION_DEMOS}
          onComplete={() => {
            setPhase('activity');
            setActivityIdx(0);
            setProblemIdx(0);
          }}
          onSkipToInteractive={() => {
            setPhase('activity');
            setActivityIdx(0);
            setProblemIdx(0);
          }}
        />
      )}

      {/* PHASE 3: INTERACTIVE ACTIVITIES (1 to 4 with Drag & Drop) */}
      {phase === 'activity' && (
        <ActivityProblemView
          key={`${activityIdx}-${problemIdx}-${resetKey}`}
          activity={currentActivity}
          problem={currentProblem}
          problemIdx={problemIdx}
          onProblemDone={handleProblemDone}
          onReset={() => setResetKey(k => k + 1)}
        />
      )}

      {/* PHASE 4: VISUAL EQUATION DERIVATION */}
      {phase === 'equation' && (
        <DivisionEquationView
          total={currentProblem.total}
          friendsCount={currentProblem.friends}
          perFriend={lastResult.perFriend}
          leftover={lastResult.leftover}
          characterIds={currentProblem.characterIds}
          friendNames={currentProblem.friendNames}
          activityId={currentActivity?.id}
          onContinue={handleEquationContinue}
        />
      )}

      {/* PHASE 5: FORMAL TERMINOLOGY REVIEW */}
      {phase === 'terminology' && (
        <DivisionTerminology
          onBack={onBack}
          onFinish={() => {
            if (onStartTest) {
              onStartTest();
            } else {
              onBack();
            }
          }}
        />
      )}
    </div>
  );
}
