import React, { useState, useEffect, useRef } from 'react';
import DivisionJar from './DivisionJar';
import DivisionFriends from './DivisionFriends';
import CandyPiece from './CandyPiece';
import {
  IconCandy,
  IconCelebration,
  IconReplay,
  IconPlay,
  IconPause,
  IconArrowRight,
  IconDragHand
} from './DivisionIcons';
import { getEmotionalState, isFriendLocked, giveChocolate } from './divisionLogic';

function DemoRunner({ currentDemo, demoIndex, totalDemos, onNext, onReplay, onSkipToInteractive }) {
  const [counts, setCounts] = useState(() => Array(currentDemo.friends).fill(0));
  const [jarCount, setJarCount] = useState(currentDemo.total);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeHandTarget, setActiveHandTarget] = useState(null);
  const timerRef = useRef(null);

  const isDemoFinished = jarCount <= currentDemo.remainder;

  useEffect(() => {
    if (!isPlaying || isDemoFinished) return;

    timerRef.current = setTimeout(() => {
      const minCount = Math.min(...counts);
      const targetFriend = counts.findIndex((c) => c === minCount);

      if (targetFriend !== -1 && jarCount > 0) {
        // Show animated drag hand gesture towards target friend
        setActiveHandTarget(targetFriend);

        setTimeout(() => {
          const next = giveChocolate(targetFriend, counts, jarCount);
          if (next) {
            setCounts(next.counts);
            setJarCount(next.jarCount);
          }
          setActiveHandTarget(null);
        }, 500);
      }
    }, currentDemo.speedMs || 1400);

    return () => clearTimeout(timerRef.current);
  }, [isPlaying, isDemoFinished, counts, jarCount, currentDemo]);

  const emotions = getEmotionalState(counts, jarCount);
  const friendsList = Array.from({ length: currentDemo.friends }, (_, i) => ({
    name: currentDemo.friendNames[i] || `Friend ${i + 1}`,
    characterId: currentDemo.characterIds ? currentDemo.characterIds[i] : 'maya'
  }));

  return (
    <div className="division-card division-fade-opacity">
      {/* Demo Banner */}
      <div className="division-goal-banner">
        <div className="division-goal-icons">
          <IconCandy size={24} />
          <IconArrowRight size={20} />
          <IconDragHand size={24} />
        </div>
        <div className="division-goal-text">
          Watch: Drag & Drop Fair Sharing ({demoIndex + 1} / {totalDemos})
        </div>
        <button
          className="demo-skip-btn"
          onClick={onSkipToInteractive}
          title="Jump directly to interactive drag and drop activities"
        >
          Skip to Interactive Drag & Drop ➔
        </button>
      </div>

      <div className="division-board demo-board-relative">
        <DivisionJar
          count={jarCount}
          isSelected={false}
          onSelect={() => {}}
          isRemainderPhase={isDemoFinished && jarCount > 0}
          disabled={true}
        />

        <DivisionFriends
          friends={friendsList}
          counts={counts}
          emotions={emotions}
          isLocked={(idx) => isFriendLocked(idx, counts)}
          onGiveCandy={() => {}}
          onReturnCandy={() => {}}
          jarSelected={false}
          hoveredFriendIdx={activeHandTarget}
          isDraggingFromJar={activeHandTarget !== null}
          disabled={true}
        />

        {/* Animated Hand Demonstration Guide */}
        {activeHandTarget !== null && (
          <div className="demo-animated-drag-indicator">
            <div className="demo-hand-floating">
              <IconDragHand size={34} />
              <div className="demo-carried-candy">
                <CandyPiece size={26} interactive={false} />
              </div>
            </div>
          </div>
        )}
      </div>

      {isDemoFinished && (
        <div className="division-celebration">
          <div className="division-celebration-title">
            <IconCelebration size={28} />
            <span>
              {jarCount > 0 ? 'Shared Fairly! Leftover in Jar.' : 'Shared Equally! Everyone Happy!'}
            </span>
          </div>

          <div className="division-controls-bar">
            <button
              className="division-action-btn secondary"
              onClick={onReplay}
              title="Watch this demonstration again"
            >
              <IconReplay size={18} />
              <span>Replay</span>
            </button>
            <button
              className="division-action-btn primary"
              onClick={onNext}
            >
              <span>{demoIndex < totalDemos - 1 ? 'Next Demo' : 'Start Drag & Drop Activities!'}</span>
              <IconArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {!isDemoFinished && (
        <div className="division-controls-bar">
          <button
            className="division-action-btn secondary"
            onClick={() => setIsPlaying(p => !p)}
          >
            {isPlaying ? (
              <>
                <IconPause size={18} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <IconPlay size={18} />
                <span>Play</span>
              </>
            )}
          </button>
          <button
            className="division-action-btn primary"
            onClick={onSkipToInteractive}
          >
            <span>Start Dragging Myself</span>
            <IconArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * DivisionDemonstration Component
 * Animated demonstrations showing equal sharing with animated sprite characters and candy.
 */
export default function DivisionDemonstration({ demos, onComplete, onSkipToInteractive }) {
  const [demoIndex, setDemoIndex] = useState(0);
  const [replayKey, setReplayKey] = useState(0);

  const currentDemo = demos[demoIndex];

  const handleNextDemo = () => {
    if (demoIndex < demos.length - 1) {
      setDemoIndex(prev => prev + 1);
    } else {
      onComplete && onComplete();
    }
  };

  const handleReplay = () => {
    setReplayKey(k => k + 1);
  };

  return (
    <DemoRunner
      key={`${demoIndex}-${replayKey}`}
      currentDemo={currentDemo}
      demoIndex={demoIndex}
      totalDemos={demos.length}
      onNext={handleNextDemo}
      onReplay={handleReplay}
      onSkipToInteractive={onSkipToInteractive || onComplete}
    />
  );
}
