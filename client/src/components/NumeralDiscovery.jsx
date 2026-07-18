import React, { useState, useMemo, useEffect, useRef } from 'react';
import './PreSymbolAddition.css';
import LearningContainer from './LearningContainer';
import { CHARACTER_COMPONENTS, CHARACTER_PLURAL } from './TryItAssessment';
import { getRandomIncorrectFeedback } from '../services/feedback';

const CORRECT_ENCOURAGEMENTS = [
  "🌟 Great counting!",
  "Awesome!",
  "Nice work!",
  "Fantastic!",
  "Excellent counting!",
  "You're doing great!"
];

function classifyMisconception(leftCount, rightCount, answer) {
  const concat1 = parseInt(`${leftCount}${rightCount}`, 10);
  const concat2 = parseInt(`${rightCount}${leftCount}`, 10);
  if (answer === concat1 || answer === concat2) return 'concatenation';
  if (Math.abs(answer - (leftCount + rightCount)) <= 2) return 'counting-error';
  return 'symbol-misunderstanding';
}

function generateBoxGridItems(quantity) {
  const cells = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      cells.push({ col: c, row: r });
    }
  }

  const shuffled = cells.sort(() => Math.random() - 0.5);
  const items = [];

  for (let i = 0; i < quantity; i++) {
    const cell = shuffled[i];
    const jitterX = Math.floor(Math.random() * 13) - 6; // -6 to 6 px
    const jitterY = Math.floor(Math.random() * 13) - 6; // -6 to 6 px

    items.push({
      col: cell.col,
      row: cell.row,
      jitterX,
      jitterY
    });
  }

  return items;
}

export default function NumeralDiscovery({ onFinished, onFailed, initialCharacter = 'apple' }) {
  // 1. Core State (Mission 3 counts 1-4)
  const [leftCount, setLeftCount] = useState(() => Math.floor(Math.random() * 4) + 1); // 1-4
  const [rightCount, setRightCount] = useState(() => Math.floor(Math.random() * 4) + 1); // 1-4
  const [characterType] = useState(initialCharacter);
  
  // Abstraction levels: starts directly at NUMERAL_WITH_ICON
  const [representationLevel, setRepresentationLevel] = useState('NUMERAL_WITH_ICON'); // OBJECTS_ONLY, NUMERAL_WITH_ICON, NUMERAL_ONLY
  const [wrongAttempts, setWrongAttempts] = useState(0); // wrong attempts tracker for current level
  const [misconceptions, setMisconceptions] = useState([]); // Adaptive remediation: classified mistake types
  const [numeralOnlyCorrectCount, setNumeralOnlyCorrectCount] = useState(0); // tracks correct numeral-only questions

  // Progressive Reveal Sequence States
  const [revealStep, setRevealStep] = useState(0);
  const [hasPlayedEntryAnimation, setHasPlayedEntryAnimation] = useState(false);

  // Transition State (for State 4 fade out and centering)
  const [transitionState, setTransitionState] = useState(null); // null, state_4

  // Card items configurations (for objects-only fallback layout)
  const [leftItems, setLeftItems] = useState(() => generateBoxGridItems(leftCount));
  const [rightItems, setRightItems] = useState(() => generateBoxGridItems(rightCount));

  useEffect(() => {
    setLeftItems(generateBoxGridItems(leftCount));
    setRightItems(generateBoxGridItems(rightCount));
  }, [leftCount, rightCount]);

  // Answer validation states
  const [numericAnswer, setNumericAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [answerStatus, setAnswerStatus] = useState(null); // 'correct' or 'incorrect'
  const [feedbackText, setFeedbackText] = useState('');

  // Active checkmarks for objects mode
  const [markedLeft, setMarkedLeft] = useState({});
  const [markedRight, setMarkedRight] = useState({});

  // Card box size measurement
  const leftBoxRef = useRef(null);
  const [boxSize, setBoxSize] = useState({ width: 170, height: 115 });

  useEffect(() => {
    const updateSize = () => {
      if (leftBoxRef.current) {
        setBoxSize({
          width: leftBoxRef.current.clientWidth || 170,
          height: leftBoxRef.current.clientHeight || 115
        });
      }
    };
    const observer = new ResizeObserver(() => updateSize());
    if (leftBoxRef.current) observer.observe(leftBoxRef.current);
    updateSize();

    return () => observer.disconnect();
  }, []);

  const getBoxPositions = (items) => {
    const margin = 16;
    const charWidth = 48;
    const charHeight = 48;

    const xMin = margin;
    const xMax = boxSize.width - margin - charWidth;
    const yMin = margin;
    const yMax = boxSize.height - margin - charHeight;

    return items.map((item) => {
      const fractionX = item.col;
      const fractionY = item.row;

      const baseX = xMin + fractionX * (xMax - xMin);
      const baseY = yMin + fractionY * (yMax - yMin);

      let x = baseX + item.jitterX;
      let y = baseY + item.jitterY;

      x = Math.max(xMin, Math.min(xMax, x));
      y = Math.max(yMin, Math.min(yMax, y));

      return { x, y };
    });
  };

  const leftPositions = useMemo(() => getBoxPositions(leftItems), [leftItems, boxSize]);
  const rightPositions = useMemo(() => getBoxPositions(rightItems), [rightItems, boxSize]);

  // Run Progressive Reveal Timeline
  useEffect(() => {
    if (hasPlayedEntryAnimation) {
      setRevealStep(9);
      return;
    }

    // Step 1: Establish visual layout outlines immediately
    setRevealStep(1);

    // Step 2: Left operand fades in
    const t2 = setTimeout(() => {
      setRevealStep(2);
    }, 150);

    // Step 3: "+" symbol fades in
    const t3 = setTimeout(() => {
      setRevealStep(3);
    }, 350);

    // Step 4: Right operand fades in
    const t4 = setTimeout(() => {
      setRevealStep(4);
    }, 550);

    // Step 5: Pause 300ms, then slide left
    const t5 = setTimeout(() => {
      setRevealStep(5);
    }, 850);

    // Step 6: "=" symbol fades in immediately after slide completes (1200ms)
    // '=' animation duration: 300ms (completes at 1500ms)
    const t6 = setTimeout(() => {
      setRevealStep(6);
    }, 1200);

    // Step 7: Answer box fades in after 150ms delay (starts at 1650ms)
    // Answer box animation duration: 300ms (completes at 1950ms)
    const t7 = setTimeout(() => {
      setRevealStep(7);
    }, 1650);

    // Step 8: Submit button fades in after 150ms delay (starts at 2100ms)
    // Submit button animation duration: 250ms (completes at 2350ms)
    const t8 = setTimeout(() => {
      setRevealStep(8);
    }, 2100);

    // Step 9: Make input and button interactive (starts at 2350ms)
    const t9 = setTimeout(() => {
      setRevealStep(9);
      setHasPlayedEntryAnimation(true);
    }, 2350);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
      clearTimeout(t9);
    };
  }, [hasPlayedEntryAnimation]);

  // State 4 Transition (fades out remaining icons, centers numerals)
  const triggerNumeralOnlyTransition = () => {
    setTransitionState('state_4');
    setNumericAnswer('');
    setIsAnswered(false);
    setAnswerStatus(null);
    setFeedbackText('');

    setTimeout(() => {
      setTransitionState(null);
      setRepresentationLevel('NUMERAL_ONLY');
      setNumeralOnlyCorrectCount(0);
      setWrongAttempts(0);
      setMisconceptions([]);
      regenerateQuestionForLevel('NUMERAL_ONLY');
    }, 1200);
  };

  const handleLeftItemClick = (idx) => {
    if (isAnswered) return;
    setMarkedLeft((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleRightItemClick = (idx) => {
    if (isAnswered) return;
    setMarkedRight((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleNumericChange = (e) => {
    if (isAnswered) return;
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setNumericAnswer(val);
    }
  };

  const handleSubmit = () => {
    if (isAnswered || numericAnswer === '' || revealStep < 9) return;

    const userAnswer = parseInt(numericAnswer, 10);
    const correctAnswer = leftCount + rightCount;
    const isCorrect = userAnswer === correctAnswer;

    setIsAnswered(true);

    if (isCorrect) {
      setAnswerStatus('correct');
      const msg = CORRECT_ENCOURAGEMENTS[Math.floor(Math.random() * CORRECT_ENCOURAGEMENTS.length)];
      setFeedbackText(msg);

      setTimeout(() => {
        if (representationLevel === 'NUMERAL_WITH_ICON') {
          triggerNumeralOnlyTransition();
        } else {
          advanceStage(true);
        }
      }, 2000);
    } else {
      setAnswerStatus('incorrect');
      const msg = getRandomIncorrectFeedback();
      setFeedbackText(msg);
      
      const misconception = classifyMisconception(leftCount, rightCount, userAnswer);
      const newMisconceptions = [...misconceptions, misconception];
      setMisconceptions(newMisconceptions);

      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);

      setTimeout(() => {
        if (newAttempts >= 3) {
          setWrongAttempts(0);
          onFailed(characterType, newMisconceptions);
        } else {
          regenerateQuestionForLevel(representationLevel);
        }
      }, 2000);
    }
  };

  const regenerateQuestionForLevel = (level) => {
    setNumericAnswer('');
    setIsAnswered(false);
    setAnswerStatus(null);
    setFeedbackText('');
    setMarkedLeft({});
    setMarkedRight({});

    const newLeft = Math.floor(Math.random() * 4) + 1; // 1-4
    const newRight = Math.floor(Math.random() * 4) + 1; // 1-4
    setLeftCount(newLeft);
    setRightCount(newRight);
  };

  const advanceStage = (isCorrect) => {
    setNumericAnswer('');
    setIsAnswered(false);
    setAnswerStatus(null);
    setFeedbackText('');
    setMarkedLeft({});
    setMarkedRight({});

    if (isCorrect) {
      if (representationLevel === 'NUMERAL_ONLY') {
        const nextCorrectCount = numeralOnlyCorrectCount + 1;
        setNumeralOnlyCorrectCount(nextCorrectCount);
        if (nextCorrectCount >= 2) {
          onFinished();
        } else {
          regenerateQuestionForLevel('NUMERAL_ONLY');
        }
      } else if (representationLevel === 'NUMERAL_WITH_ICON') {
        triggerNumeralOnlyTransition();
      }
    }
  };

  const CharComponent = CHARACTER_COMPONENTS[characterType];
  const pluralName = CHARACTER_PLURAL[characterType] || 'objects';

  // Box dimensions selectors (height remains a fixed 115px)
  const leftBoxShrunk = representationLevel !== 'OBJECTS_ONLY';
  const rightBoxShrunk = representationLevel !== 'OBJECTS_ONLY';

  const leftBoxShowObjects = representationLevel === 'OBJECTS_ONLY';
  const rightBoxShowObjects = representationLevel === 'OBJECTS_ONLY';

  const leftBoxShowNumeral = representationLevel !== 'OBJECTS_ONLY';
  const rightBoxShowNumeral = representationLevel !== 'OBJECTS_ONLY';

  const leftBoxHideIcon = representationLevel === 'NUMERAL_ONLY' || transitionState === 'state_4';
  const rightBoxHideIcon = representationLevel === 'NUMERAL_ONLY' || transitionState === 'state_4';

  // Progressive reveal conditional visibility variables
  const showLeftContent = revealStep >= 2;
  const showPlusSymbol = revealStep >= 3;
  const showRightContent = revealStep >= 4;
  const slideActive = revealStep >= 5;
  const showEqualSymbol = revealStep >= 6;
  const showResultBox = revealStep >= 7;
  const showSubmitBtn = revealStep >= 8;

  return (
    <LearningContainer>
      <div className="tlf-assessment-wrapper tlf-num-disc">
        <div className="tlf-assessment-card">
          <h2 className="tlf-assessment-title">
            How many altogether?
          </h2>
          
          <p className="tlf-assessment-helper">
            Type your answer.
          </p>

          {/* Cards container row */}
          <div className={`tlf-boxes-row tlf-stage-b-active ${slideActive ? 'tlf-equation-active' : ''}`}>
            
            {/* Left Box Card */}
            <div className={`tlf-box left ${leftBoxShrunk ? 'shrunk' : ''}`} ref={leftBoxRef}>
              {leftBoxShowObjects && (
                <div className="tlf-box-objects-wrapper">
                  {leftPositions.map((pos, idx) => {
                    const isMarked = !!markedLeft[idx];
                    return (
                      <div
                        key={idx}
                        className={`tlf-box-item${isMarked ? ' marked' : ''}`}
                        onClick={() => handleLeftItemClick(idx)}
                        style={{ left: `${pos.x}px`, top: `${pos.y}px`, animationDelay: `${idx * 0.05}s` }}
                      >
                        <CharComponent size={48} />
                        {isMarked && (
                          <div className="tlf-box-item-checkmark-badge">✓</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {leftBoxShowNumeral && (
                <div className={`tlf-numeral-content ${showLeftContent ? 'opacity-show' : 'opacity-hide'}`}>
                  <span className="tlf-box-numeral">{leftCount}</span>
                  <div className={`tlf-numeral-icon ${leftBoxHideIcon ? 'fade-out' : ''}`}>
                    <CharComponent size={36} />
                  </div>
                </div>
              )}
            </div>

            {/* Plus Symbol */}
            <div className={`tlf-plus-symbol ${showPlusSymbol ? 'opacity-show' : 'opacity-hide'}`}>+</div>

            {/* Right Box Card */}
            <div className={`tlf-box right ${rightBoxShrunk ? 'shrunk' : ''}`}>
              {rightBoxShowObjects && (
                <div className="tlf-box-objects-wrapper">
                  {rightPositions.map((pos, idx) => {
                    const isMarked = !!markedRight[idx];
                    return (
                      <div
                        key={idx}
                        className={`tlf-box-item${isMarked ? ' marked' : ''}`}
                        onClick={() => handleRightItemClick(idx)}
                        style={{ left: `${pos.x}px`, top: `${pos.y}px`, animationDelay: `${idx * 0.05}s` }}
                      >
                        <CharComponent size={48} />
                        {isMarked && (
                          <div className="tlf-box-item-checkmark-badge">✓</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {rightBoxShowNumeral && (
                <div className={`tlf-numeral-content ${showRightContent ? 'opacity-show' : 'opacity-hide'}`}>
                  <span className="tlf-box-numeral">{rightCount}</span>
                  <div className={`tlf-numeral-icon ${rightBoxHideIcon ? 'fade-out' : ''}`}>
                    <CharComponent size={36} />
                  </div>
                </div>
              )}
            </div>

            {/* Equal Symbol */}
            <div className={`tlf-equal-symbol ${showEqualSymbol ? 'reveal-equal' : 'opacity-hide'}`}>=</div>

            {/* Equation results input card */}
            {showResultBox && (
              <div className={`tlf-box result-box reveal-result-box ${isAnswered && answerStatus === 'incorrect' ? 'incorrect' : ''}`}>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={numericAnswer}
                  onChange={handleNumericChange}
                  disabled={isAnswered || transitionState === 'state_4' || revealStep < 8}
                  autoFocus
                  placeholder="Type here"
                />
              </div>
            )}

          </div>

          {/* Submit Button */}
          {showSubmitBtn && (
            <button
              className="tlf-submit-btn reveal-submit-btn"
              onClick={handleSubmit}
              disabled={
                isAnswered || 
                numericAnswer === '' ||
                revealStep < 9
              }
            >
              Submit
            </button>
          )}

          {/* Feedback area */}
          <div className="tlf-feedback-area">
            {isAnswered && (
              <div className={`tlf-feedback-message ${answerStatus}`}>
                {feedbackText.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </LearningContainer>
  );
}
