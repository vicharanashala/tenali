import React, { useState } from 'react';
import CandyPiece from './CandyPiece';
import DivisionJar from './DivisionJar';
import {
  isGroupFull,
  isGroupOversized,
  isGroupingComplete,
  giveToGroup,
  returnFromGroup,
  deriveGroupingEquation
} from './divisionLogic';
import {
  IconCheck,
  IconReplay,
  IconSparkles,
  IconArrowRight
} from './DivisionIcons';

/**
 * DivisionGroupingView Component
 * Teaches measurement division (equal grouping into bags of a fixed target size).
 */
export default function DivisionGroupingView({
  activities,
  activityIdx,
  problemIdx,
  onNextProblem
}) {
  const currentActivity = activities[activityIdx] || activities[0];
  const problem = currentActivity.problems[problemIdx] || currentActivity.problems[0];

  // State: groupCounts array for the bags, looseCount for remaining candies
  const [gameState, setGameState] = useState(() => ({
    groupCounts: Array(problem.maxBags).fill(0),
    looseCount: problem.total
  }));
  const [showCelebration, setShowCelebration] = useState(false);

  const completeGroupsCount = gameState.groupCounts.filter(c => c === problem.targetSize).length;
  const isComplete = isGroupingComplete(gameState.groupCounts, gameState.looseCount, problem.targetSize);

  const handleGiveToBag = (bagIdx) => {
    setGameState((prev) => {
      const next = giveToGroup(bagIdx, prev.groupCounts, prev.looseCount);
      if (!next) return prev;
      if (isGroupingComplete(next.groupCounts, next.looseCount, problem.targetSize)) {
        setShowCelebration(true);
      } else {
        setShowCelebration(false);
      }
      return next;
    });
  };

  const handleReturnFromBag = (bagIdx) => {
    setGameState((prev) => {
      const next = returnFromGroup(bagIdx, prev.groupCounts, prev.looseCount);
      if (!next) return prev;
      setShowCelebration(false);
      return next;
    });
  };

  const handleReset = () => {
    setGameState({
      groupCounts: Array(problem.maxBags).fill(0),
      looseCount: problem.total
    });
    setShowCelebration(false);
  };

  const equation = deriveGroupingEquation(
    problem.total,
    problem.targetSize,
    completeGroupsCount,
    gameState.looseCount
  );

  return (
    <div className="division-grouping-container fade-in">
      {/* Target Size Banner */}
      <div className="division-target-banner">
        <div className="target-banner-badge">
          <span className="target-label">Target Group Size:</span>
          <span className="target-number">{problem.targetSize} candies per bag</span>
        </div>
        <p className="target-instruction">
          {problem.prompt || `Pack the candies into groups of ${problem.targetSize}.`}
        </p>
      </div>

      <div className="division-workspace-grid">
        {/* Source Jar with Loose Candies */}
        <div className="division-jar-zone">
          <DivisionJar
            count={gameState.looseCount}
            isSelected={false}
            onClick={() => {
              // Click jar auto-places to first bag needing candies
              const targetIdx = gameState.groupCounts.findIndex(c => c < problem.targetSize);
              if (targetIdx !== -1 && gameState.looseCount > 0) {
                handleGiveToBag(targetIdx);
              }
            }}
          />
          <div className="division-loose-label">
            {gameState.looseCount < problem.targetSize && isComplete ? (
              <span className="valid-remainder-tag">
                ✨ Valid Remainder ({gameState.looseCount} left)
              </span>
            ) : (
              <span>Candies to pack: <strong>{gameState.looseCount}</strong></span>
            )}
          </div>
        </div>

        {/* Bags / Group Containers */}
        <div className="division-bags-zone">
          <div className="division-bags-header">
            <span>Bags ({completeGroupsCount} of {problem.maxBags} filled)</span>
          </div>

          <div className="division-bags-grid">
            {gameState.groupCounts.map((count, idx) => {
              const full = isGroupFull(count, problem.targetSize);
              const oversized = isGroupOversized(count, problem.targetSize);

              return (
                <div
                  key={idx}
                  className={`division-bag-card ${full ? 'bag-full' : ''} ${oversized ? 'bag-oversized' : ''}`}
                >
                  <div className="bag-card-top">
                    <span className="bag-title">Bag #{idx + 1}</span>
                    <span className={`bag-status-pill ${full ? 'full' : ''} ${oversized ? 'error' : ''}`}>
                      {oversized ? 'Too many!' : full ? '✓ Full' : `${count}/${problem.targetSize}`}
                    </span>
                  </div>

                  {/* Visual Candy Slots */}
                  <div className="bag-candies-area">
                    {Array.from({ length: Math.max(count, problem.targetSize) }).map((_, slotIdx) => {
                      const hasCandy = slotIdx < count;
                      return (
                        <div
                          key={slotIdx}
                          className={`bag-candy-slot ${hasCandy ? 'filled' : 'empty'}`}
                          onClick={() => {
                            if (hasCandy) {
                              handleReturnFromBag(idx);
                            } else if (gameState.looseCount > 0) {
                              handleGiveToBag(idx);
                            }
                          }}
                        >
                          {hasCandy ? (
                            <CandyPiece isFloating={false} />
                          ) : (
                            <div className="slot-placeholder" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="bag-actions">
                    <button
                      className="bag-btn add-btn"
                      disabled={gameState.looseCount === 0 || count >= problem.targetSize + 2}
                      onClick={() => handleGiveToBag(idx)}
                      title="Add candy to bag"
                    >
                      + Add
                    </button>
                    <button
                      className="bag-btn remove-btn"
                      disabled={count === 0}
                      onClick={() => handleReturnFromBag(idx)}
                      title="Return candy to jar"
                    >
                      − Return
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completion & Equation Box */}
      {showCelebration && (
        <div className="division-celebration-card pop-in">
          <div className="celebration-title">
            <IconSparkles size={24} />
            <span>All Complete Groups Formed!</span>
            <IconSparkles size={24} />
          </div>

          <p className="celebration-subtitle">
            You made <strong>{completeGroupsCount}</strong> complete bags of{' '}
            <strong>{problem.targetSize}</strong>
            {gameState.looseCount > 0 ? (
              <> with <strong>{gameState.looseCount}</strong> leftover candies.</>
            ) : (
              ' with 0 leftovers!'
            )}
          </p>

          <div className="grouping-equation-box">
            <div className="equation-math">{equation.equationString}</div>
            <div className="equation-division">{equation.divisionString}</div>
          </div>

          <div className="celebration-actions">
            <button className="division-action-btn primary" onClick={onNextProblem}>
              <span>Next Challenge</span>
              <IconArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="division-problem-footer">
        <button className="division-action-btn secondary" onClick={handleReset}>
          <IconReplay size={16} />
          <span>Reset Candies</span>
        </button>

        {isComplete && !showCelebration && (
          <button
            className="division-action-btn primary"
            onClick={() => setShowCelebration(true)}
          >
            <IconCheck size={18} />
            <span>Check Groups</span>
          </button>
        )}
      </div>
    </div>
  );
}
