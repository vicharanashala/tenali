import React, { useState } from 'react';
import CandyPiece from './CandyPiece';
import DivisionJar from './DivisionJar';
import DivisionFriends from './DivisionFriends';
import {
  getEmotionalState,
  isFairSharingComplete,
  isGroupingComplete,
  giveChocolate,
  returnChocolate,
  giveToGroup,
  returnFromGroup,
  deriveEquation,
  deriveGroupingEquation
} from './divisionLogic';
import {
  IconCheck,
  IconReplay,
  IconSparkles,
  IconArrowRight,
  IconHand
} from './DivisionIcons';

/**
 * DivisionActionChoiceView Component
 * Implements Stage 6: Choose the Action (Mixed Strategy Discovery).
 * Children inspect the visual workspace and determine whether to distribute
 * among recipients (Sharing) or pack into fixed-capacity bags (Grouping).
 */
export default function DivisionActionChoiceView({
  activities,
  activityIdx,
  problemIdx,
  onNextProblem
}) {
  const currentActivity = activities[activityIdx] || activities[0];
  const problem = currentActivity.problems[problemIdx] || currentActivity.problems[0];

  const isSharing = problem.model === 'sharing';

  // Strategy detection state
  const [selectedStrategy, setSelectedStrategy] = useState(null); // 'sharing' | 'grouping' | null
  const [strategyFeedback, setStrategyFeedback] = useState(null);

  // Sharing state
  const [sharingState, setSharingState] = useState(() => ({
    counts: isSharing ? Array(problem.friends).fill(0) : [],
    jarCount: problem.total
  }));

  // Grouping state
  const [groupingState, setGroupingState] = useState(() => ({
    groupCounts: !isSharing ? Array(problem.maxBags).fill(0) : [],
    looseCount: problem.total
  }));

  const [showCelebration, setShowCelebration] = useState(false);

  // Sharing completion & emotions
  const emotions = isSharing
    ? getEmotionalState(sharingState.counts, sharingState.jarCount)
    : [];
  const isSharingDone = isSharing && isFairSharingComplete(sharingState.counts, sharingState.jarCount);

  // Grouping completion
  const isGroupingDone = !isSharing && isGroupingComplete(groupingState.groupCounts, groupingState.looseCount, problem.targetSize);

  const handleStrategyPick = (strategy) => {
    setSelectedStrategy(strategy);
    if (strategy === problem.model) {
      setStrategyFeedback({
        correct: true,
        text: isSharing
          ? 'Spot on! The recipients (friends) are waiting with empty plates. Distribute candies equally!'
          : 'Spot on! The bags show a target group size. Fill each bag to its target capacity!'
      });
    } else {
      setStrategyFeedback({
        correct: false,
        text: isSharing
          ? 'Look closer at the workspace: Notice the friends waiting with empty plates. That means recipients are given (Sharing)!'
          : 'Look closer at the workspace: Notice the bags showing a target number of candies. That means target size is given (Grouping)!'
      });
    }
  };

  // Sharing handlers
  const handleGiveCandy = (friendIdx) => {
    setSharingState((prev) => {
      const next = giveChocolate(friendIdx, prev.counts, prev.jarCount, true);
      return next || prev;
    });
  };

  const handleReturnCandy = (friendIdx) => {
    setSharingState((prev) => {
      const next = returnChocolate(friendIdx, prev.counts, prev.jarCount);
      return next || prev;
    });
  };

  // Grouping handlers
  const handleGiveToBag = (bagIdx) => {
    setGroupingState((prev) => {
      const next = giveToGroup(bagIdx, prev.groupCounts, prev.looseCount);
      return next || prev;
    });
  };

  const handleReturnFromBag = (bagIdx) => {
    setGroupingState((prev) => {
      const next = returnFromGroup(bagIdx, prev.groupCounts, prev.looseCount);
      return next || prev;
    });
  };

  const handleReset = () => {
    if (isSharing) {
      setSharingState({
        counts: Array(problem.friends).fill(0),
        jarCount: problem.total
      });
    } else {
      setGroupingState({
        groupCounts: Array(problem.maxBags).fill(0),
        looseCount: problem.total
      });
    }
    setShowCelebration(false);
  };

  const friendsList = isSharing
    ? Array.from({ length: problem.friends }, (_, i) => ({
        name: problem.friendNames[i] || `Friend ${i + 1}`,
        characterId: problem.characterIds[i] || 'maya'
      }))
    : [];

  // Equation summary
  const sharingEquation = isSharing
    ? deriveEquation(problem.total, problem.friends, sharingState.counts[0] || 0, sharingState.jarCount)
    : null;

  const groupingEquation = !isSharing
    ? deriveGroupingEquation(
        problem.total,
        problem.targetSize,
        groupingState.groupCounts.filter((c) => c === problem.targetSize).length,
        groupingState.looseCount
      )
    : null;

  return (
    <div className="division-card division-fade-opacity">
      {/* Header banner */}
      <div className="division-goal-banner">
        <div className="division-goal-text">
          {currentActivity.title}: {currentActivity.subtitle} ({problemIdx + 1} / {currentActivity.problems.length})
        </div>
        <div className="division-drag-instruction-chip">
          <IconHand size={18} />
          <span>Identify strategy & solve</span>
        </div>
      </div>

      <div className="action-choice-prompt">
        <p className="choice-prompt-text">{problem.prompt}</p>

        {/* Strategy Detective Selection */}
        <div className="strategy-selection-row">
          <button
            className={`strategy-btn ${selectedStrategy === 'sharing' ? 'active' : ''}`}
            onClick={() => handleStrategyPick('sharing')}
          >
            🤝 Equal Sharing (Known Friends)
          </button>
          <button
            className={`strategy-btn ${selectedStrategy === 'grouping' ? 'active' : ''}`}
            onClick={() => handleStrategyPick('grouping')}
          >
            🎒 Equal Grouping (Known Bag Size)
          </button>
        </div>

        {strategyFeedback && (
          <div className={`strategy-feedback-banner ${strategyFeedback.correct ? 'success' : 'hint'}`}>
            <span>{strategyFeedback.text}</span>
          </div>
        )}
      </div>

      {/* Main Interactive Board */}
      <div className="division-board">
        {/* Source Jar */}
        <DivisionJar
          count={isSharing ? sharingState.jarCount : groupingState.looseCount}
          disabled={showCelebration}
          isRemainderPhase={showCelebration}
        />

        {/* Sharing Destination */}
        {isSharing && (
          <DivisionFriends
            friends={friendsList}
            counts={sharingState.counts}
            emotions={emotions}
            isLocked={() => false}
            onGiveCandy={handleGiveCandy}
            onReturnCandy={handleReturnCandy}
            disabled={showCelebration}
            isFreeMode={true}
          />
        )}

        {/* Grouping Destination */}
        {!isSharing && (
          <div className="grouping-destination-area">
            <div className="grouping-bags-grid">
              {groupingState.groupCounts.map((count, idx) => {
                const isFull = count === problem.targetSize;
                const isOversized = count > problem.targetSize;
                return (
                  <div
                    key={idx}
                    className={`grouping-bag-card ${isFull ? 'bag-full' : ''} ${isOversized ? 'bag-oversized' : ''}`}
                    onClick={() => {
                      if (showCelebration) return;
                      if (groupingState.looseCount > 0 && !isFull) {
                        handleGiveToBag(idx);
                      }
                    }}
                  >
                    <div className="bag-badge">
                      <span>Bag {idx + 1}</span>
                      <span className="bag-capacity">
                        {count}/{problem.targetSize}
                      </span>
                    </div>

                    <div className="bag-slots-container">
                      {Array.from({ length: problem.targetSize }, (_, slotIdx) => (
                        <div key={slotIdx} className={`bag-slot ${slotIdx < count ? 'filled' : 'empty'}`}>
                          {slotIdx < count && <CandyPiece size={32} interactive={false} />}
                        </div>
                      ))}
                    </div>

                    <div className="bag-controls">
                      <button
                        className="bag-control-btn add"
                        disabled={groupingState.looseCount <= 0 || showCelebration}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGiveToBag(idx);
                        }}
                      >
                        + 1
                      </button>
                      <button
                        className="bag-control-btn remove"
                        disabled={count <= 0 || showCelebration}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReturnFromBag(idx);
                        }}
                      >
                        − 1
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Celebration Card */}
      {showCelebration && (
        <div className="division-celebration-card pop-in">
          <div className="celebration-title">
            <IconSparkles size={24} />
            <span>Action Strategy Solved!</span>
            <IconSparkles size={24} />
          </div>

          <p className="celebration-subtitle">
            {isSharing ? (
              <>
                All <strong>{problem.friends}</strong> friends received{' '}
                <strong>{sharingState.counts[0]}</strong> candies
                {sharingState.jarCount > 0 ? (
                  <> with <strong>{sharingState.jarCount}</strong> leftover in the jar.</>
                ) : (
                  '!'
                )}
              </>
            ) : (
              <>
                You made{' '}
                <strong>
                  {groupingState.groupCounts.filter((c) => c === problem.targetSize).length}
                </strong>{' '}
                complete bags of <strong>{problem.targetSize}</strong>
                {groupingState.looseCount > 0 ? (
                  <> with <strong>{groupingState.looseCount}</strong> leftover candies.</>
                ) : (
                  '!'
                )}
              </>
            )}
          </p>

          <div className="grouping-equation-box">
            <div className="equation-math">
              {isSharing ? sharingEquation?.equationString : groupingEquation?.equationString}
            </div>
            <div className="equation-division">
              {isSharing ? sharingEquation?.divisionString : groupingEquation?.divisionString}
            </div>
          </div>

          <div className="celebration-actions">
            <button className="division-action-btn primary" onClick={onNextProblem}>
              <span>Next Strategy Challenge</span>
              <IconArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="division-problem-footer">
        <button className="division-action-btn secondary" onClick={handleReset}>
          <IconReplay size={16} />
          <span>Reset Challenge</span>
        </button>

        {((isSharing && isSharingDone) || (!isSharing && isGroupingDone)) && !showCelebration && (
          <button
            className="division-action-btn primary"
            onClick={() => setShowCelebration(true)}
          >
            <IconCheck size={18} />
            <span>Check My Solution</span>
          </button>
        )}
      </div>
    </div>
  );
}
