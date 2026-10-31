import React, { useState } from 'react';
import DivisionJar from './DivisionJar';
import DivisionFriends from './DivisionFriends';
import {
  getEmotionalState,
  isRepairSolved,
  giveChocolate,
  returnChocolate
} from './divisionLogic';
import {
  IconCheck,
  IconReplay,
  IconSparkles,
  IconArrowRight
} from './DivisionIcons';

/**
 * DivisionRepairView Component
 * Implements Stage 5: Repair Unequal Groups / Balances.
 * Learners inspect unequal shares and move candies between plates and jar to restore fairness.
 */
export default function DivisionRepairView({
  activities,
  activityIdx,
  problemIdx,
  onNextProblem
}) {
  const currentActivity = activities[activityIdx] || activities[0];
  const problem = currentActivity.problems[problemIdx] || currentActivity.problems[0];

  const [gameState, setGameState] = useState(() => ({
    jarCount: problem.initialJar || 0,
    counts: [...problem.initialCounts]
  }));
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedFriendIdx, setSelectedFriendIdx] = useState(null);

  const emotions = getEmotionalState(gameState.counts, gameState.jarCount);
  const isSolved = isRepairSolved(gameState.counts, gameState.jarCount);

  const friendsList = Array.from({ length: problem.friends }, (_, i) => ({
    name: problem.friendNames ? problem.friendNames[i] : `Friend ${i + 1}`,
    characterId: problem.characterIds ? problem.characterIds[i] : ['maya', 'rohan', 'priya', 'leo', 'sam'][i % 5]
  }));

  const handlePlateClick = (idx) => {
    // If friend was selected, move 1 candy from selected to this plate
    if (selectedFriendIdx !== null && selectedFriendIdx !== idx) {
      if (gameState.counts[selectedFriendIdx] > 0) {
        setGameState(prev => {
          const next = [...prev.counts];
          next[selectedFriendIdx] -= 1;
          next[idx] += 1;
          const nextState = { counts: next, jarCount: prev.jarCount };
          if (isRepairSolved(next, prev.jarCount)) {
            setShowCelebration(true);
          }
          return nextState;
        });
      }
      setSelectedFriendIdx(null);
      return;
    }

    // Toggle selection to move candy
    if (selectedFriendIdx === idx) {
      setSelectedFriendIdx(null);
    } else if (gameState.counts[idx] > 0) {
      setSelectedFriendIdx(idx);
    } else if (gameState.jarCount > 0) {
      // If plate empty, give from jar
      setGameState(prev => {
        const next = giveChocolate(idx, prev.counts, prev.jarCount, true);
        if (!next) return prev;
        if (isRepairSolved(next.counts, next.jarCount)) {
          setShowCelebration(true);
        }
        return next;
      });
    }
  };

  const handleReturnToJar = (idx) => {
    setGameState(prev => {
      const next = returnChocolate(idx, prev.counts, prev.jarCount);
      if (!next) return prev;
      if (isRepairSolved(next.counts, next.jarCount)) {
        setShowCelebration(true);
      } else {
        setShowCelebration(false);
      }
      return next;
    });
    setSelectedFriendIdx(null);
  };

  const handleGiveFromJar = (idx) => {
    setGameState(prev => {
      const next = giveChocolate(idx, prev.counts, prev.jarCount, true);
      if (!next) return prev;
      if (isRepairSolved(next.counts, next.jarCount)) {
        setShowCelebration(true);
      } else {
        setShowCelebration(false);
      }
      return next;
    });
    setSelectedFriendIdx(null);
  };

  const handleReset = () => {
    setGameState({
      jarCount: problem.initialJar || 0,
      counts: [...problem.initialCounts]
    });
    setShowCelebration(false);
    setSelectedFriendIdx(null);
  };

  return (
    <div className="division-repair-container fade-in">
      {/* Problem Prompt */}
      <div className="division-repair-banner">
        <div className="repair-badge">⚖️ Repair Unequal Shares</div>
        <p className="repair-instruction">
          {problem.prompt || 'The candies are distributed unfairly! Move candies so all friends have equal shares.'}
        </p>
      </div>

      {/* Selected Action Tip */}
      {selectedFriendIdx !== null && (
        <div className="repair-tip-banner pop-in">
          <span>
            Selected 1 candy from <strong>{problem.friendNames[selectedFriendIdx]}</strong>. Tap another friend's plate to move it, or return it to the jar!
          </span>
        </div>
      )}

      {/* Main Workspace */}
      <div className="division-workspace-grid">
        <div className="division-jar-zone">
          <DivisionJar
            count={gameState.jarCount}
            isSelected={false}
            onClick={() => {
              if (selectedFriendIdx !== null) {
                handleReturnToJar(selectedFriendIdx);
              }
            }}
          />
          <div className="division-loose-label">
            <span>Jar Candies: <strong>{gameState.jarCount}</strong></span>
          </div>
        </div>

        <div className="division-friends-zone">
          <DivisionFriends
            friends={friendsList}
            counts={gameState.counts}
            emotions={emotions}
            isLocked={() => false}
            onGiveCandy={handlePlateClick}
            onReturnCandy={handleReturnToJar}
            hoveredFriendIdx={selectedFriendIdx}
            disabled={showCelebration}
            isFreeMode={true}
          />
        </div>
      </div>

      {/* Quick Move Helper Bar */}
      <div className="repair-helpers-bar">
        {problem.friendNames.map((name, idx) => (
          <div key={idx} className="repair-friend-control">
            <span className="control-name">{name}: <strong>{gameState.counts[idx]}</strong></span>
            <div className="control-buttons">
              <button
                className="control-btn add"
                disabled={gameState.jarCount <= 0}
                onClick={() => handleGiveFromJar(idx)}
                title="Give 1 from jar"
              >
                + Jar
              </button>
              <button
                className="control-btn sub"
                disabled={gameState.counts[idx] <= 0}
                onClick={() => handleReturnToJar(idx)}
                title="Return 1 to jar"
              >
                − Jar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Celebration Card */}
      {showCelebration && (
        <div className="division-celebration-card pop-in">
          <div className="celebration-title">
            <IconSparkles size={24} />
            <span>Fairness Restored!</span>
            <IconSparkles size={24} />
          </div>

          <p className="celebration-subtitle">
            All <strong>{problem.friends}</strong> friends now have an equal share of{' '}
            <strong>{gameState.counts[0]}</strong> candies
            {gameState.jarCount > 0 ? (
              <> with <strong>{gameState.jarCount}</strong> leftover candies in the jar.</>
            ) : (
              '!'
            )}
          </p>

          <div className="celebration-actions">
            <button className="division-action-btn primary" onClick={onNextProblem}>
              <span>Next Repair Challenge</span>
              <IconArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="division-problem-footer">
        <button className="division-action-btn secondary" onClick={handleReset}>
          <IconReplay size={16} />
          <span>Reset Problem</span>
        </button>

        {isSolved && !showCelebration && (
          <button
            className="division-action-btn primary"
            onClick={() => setShowCelebration(true)}
          >
            <IconCheck size={18} />
            <span>Check Equal Shares</span>
          </button>
        )}
      </div>
    </div>
  );
}
