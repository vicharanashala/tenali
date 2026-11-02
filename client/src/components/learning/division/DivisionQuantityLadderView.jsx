import React, { useState } from 'react';
import CandyPiece from './CandyPiece';
import { generateDotGrid } from './divisionLogic';
import {
  IconCheck,
  IconReplay,
  IconSparkles,
  IconArrowRight,
  IconHand
} from './DivisionIcons';

/**
 * DivisionQuantityLadderView Component
 * Implements Stage 7: Connect Actions to Quantities (Representation Ladder).
 * Transitions learners from concrete objects to dot patterns, numerals, and arrangement statements.
 */
export default function DivisionQuantityLadderView({
  activities,
  activityIdx,
  problemIdx,
  onNextProblem
}) {
  const currentActivity = activities[activityIdx] || activities[0];
  const problem = currentActivity.problems[problemIdx] || currentActivity.problems[0];

  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSolved, setIsSolved] = useState(false);

  const handleSelectOption = (opt) => {
    setSelectedOptionId(opt.id);
    if (opt.id === problem.correctOptionId) {
      setFeedback({
        correct: true,
        text: 'Excellent! The representation matches the physical arrangement exactly.'
      });
      setIsSolved(true);
    } else {
      setFeedback({
        correct: false,
        text: 'Not quite. Inspect the arrangement carefully and compare the quantities.'
      });
      setIsSolved(false);
    }
  };

  const handleReset = () => {
    setSelectedOptionId(null);
    setFeedback(null);
    setIsSolved(false);
  };

  return (
    <div className="division-card division-fade-opacity">
      {/* Header banner */}
      <div className="division-goal-banner">
        <div className="division-goal-text">
          {currentActivity.title}: {currentActivity.subtitle} ({problemIdx + 1} / {currentActivity.problems.length})
        </div>
        <div className="division-drag-instruction-chip">
          <IconHand size={18} />
          <span>Connect objects to representations</span>
        </div>
      </div>

      <div className="ladder-problem-container">
        <p className="choice-prompt-text">{problem.prompt}</p>

        {/* Visual Stimulus Area */}
        <div className="ladder-stimulus-card">
          {/* Stimulus 1: Match Dots to Single Plate */}
          {problem.type === 'match_dots' && (
            <div className="stimulus-plate-display">
              <div className="division-plate" style={{ width: 140, height: 140 }}>
                <div className="plate-candies-wrapper">
                  {Array.from({ length: problem.itemCount }, (_, i) => (
                    <CandyPiece key={i} size={40} interactive={false} />
                  ))}
                </div>
              </div>
              <div className="stimulus-caption">Plate with {problem.itemCount} candies</div>
            </div>
          )}

          {/* Stimulus 2: Match Grouping Arrangement */}
          {problem.type === 'match_groups' && (
            <div className="stimulus-groups-display">
              <div className="stimulus-bags-row">
                {Array.from({ length: problem.groups }, (_, bIdx) => (
                  <div key={bIdx} className="stimulus-bag">
                    <div className="bag-label">Bag {bIdx + 1}</div>
                    <div className="bag-items-mini">
                      {Array.from({ length: problem.sizePerGroup }, (_, sIdx) => (
                        <CandyPiece key={sIdx} size={28} interactive={false} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="stimulus-caption">
                {problem.groups} bags, each containing {problem.sizePerGroup} candies
              </div>
            </div>
          )}

          {/* Stimulus 3: Quantity Relationship */}
          {problem.type === 'match_quantity_statement' && (
            <div className="stimulus-sharing-display">
              <div className="stimulus-friends-row">
                {Array.from({ length: problem.friends }, (_, fIdx) => (
                  <div key={fIdx} className="stimulus-friend-slot">
                    <div className="slot-plate">
                      {Array.from({ length: problem.share }, (_, sIdx) => (
                        <CandyPiece key={sIdx} size={26} interactive={false} />
                      ))}
                    </div>
                    <span className="slot-name">Friend {fIdx + 1}</span>
                  </div>
                ))}
              </div>
              <div className="stimulus-caption">
                Total {problem.total} candies shared across {problem.friends} friends
              </div>
            </div>
          )}

          {/* Stimulus 4: Remainder Card */}
          {problem.type === 'match_remainder_card' && (
            <div className="stimulus-remainder-display">
              <div className="stimulus-bags-row">
                {Array.from({ length: problem.groups }, (_, bIdx) => (
                  <div key={bIdx} className="stimulus-bag">
                    <div className="bag-label">Bag {bIdx + 1}</div>
                    <div className="bag-items-mini">
                      {Array.from({ length: problem.sizePerGroup }, (_, sIdx) => (
                        <CandyPiece key={sIdx} size={28} interactive={false} />
                      ))}
                    </div>
                  </div>
                ))}
                <div className="stimulus-leftover-box">
                  <div className="leftover-label">Leftover Jar</div>
                  <div className="leftover-candies">
                    {Array.from({ length: problem.remainder }, (_, rIdx) => (
                      <CandyPiece key={rIdx} size={28} interactive={false} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="stimulus-caption">
                {problem.groups} bags of {problem.sizePerGroup} with {problem.remainder} leftover
              </div>
            </div>
          )}
        </div>

        {/* Option Selection Cards */}
        <div className="ladder-options-grid">
          {problem.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <div
                key={opt.id}
                className={`ladder-option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectOption(opt)}
              >
                {/* If dot option, render visual dot pattern */}
                {opt.dots && (
                  <div className="dot-pattern-box">
                    <div className={`dot-grid count-${opt.dots}`}>
                      {generateDotGrid(opt.dots).map((dot) => (
                        <div key={dot.id} className="dot-pip" />
                      ))}
                    </div>
                  </div>
                )}
                <div className="option-label">{opt.label}</div>
              </div>
            );
          })}
        </div>

        {feedback && (
          <div className={`strategy-feedback-banner ${feedback.correct ? 'success' : 'hint'}`}>
            <span>{feedback.text}</span>
          </div>
        )}
      </div>

      {/* Celebration Card */}
      {isSolved && (
        <div className="division-celebration-card pop-in">
          <div className="celebration-title">
            <IconSparkles size={24} />
            <span>Representation Matched!</span>
            <IconSparkles size={24} />
          </div>

          <p className="celebration-subtitle">
            You accurately connected the visual arrangement to its formal mathematical representation.
          </p>

          <div className="celebration-actions">
            <button className="division-action-btn primary" onClick={onNextProblem}>
              <span>Next Representation Step</span>
              <IconArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="division-problem-footer">
        <button className="division-action-btn secondary" onClick={handleReset}>
          <IconReplay size={16} />
          <span>Reset Choice</span>
        </button>

        {isSolved && (
          <button className="division-action-btn primary" onClick={onNextProblem}>
            <IconCheck size={18} />
            <span>Continue</span>
          </button>
        )}
      </div>
    </div>
  );
}
