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

export default function PreSymbolAddition({ onFinished, onFailed, initialCharacter = 'apple', startAtStageB = false }) {
  // 1. Core State (Mission 2 counts 2-4)
  const [leftCount, setLeftCount] = useState(() => Math.floor(Math.random() * 3) + 2); // 2-4
  const [rightCount, setRightCount] = useState(() => Math.floor(Math.random() * 3) + 2); // 2-4
  const [characterType, setCharacterType] = useState(initialCharacter);
  const [currentStage, setCurrentStage] = useState(() => startAtStageB ? 'B' : 'A'); // 'A' or 'B'
  const [stageBQuestionNum, setStageBQuestionNum] = useState(1); // 1 or 2
  const [attemptCount, setAttemptCount] = useState(0); // Shared attempt counter across Mission 2
  const [misconceptions, setMisconceptions] = useState([]); // Adaptive remediation: classified mistake types

  // Card items configurations
  const [leftItems, setLeftItems] = useState(() => generateBoxGridItems(leftCount));
  const [rightItems, setRightItems] = useState(() => generateBoxGridItems(rightCount));

  useEffect(() => {
    setLeftItems(generateBoxGridItems(leftCount));
    setRightItems(generateBoxGridItems(rightCount));
  }, [leftCount, rightCount]);

  // Answer selection and validation
  const [numericAnswer, setNumericAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [answerStatus, setAnswerStatus] = useState(null); // 'correct' or 'incorrect'
  const [feedbackText, setFeedbackText] = useState('');

  // Active counting state
  const [markedLeft, setMarkedLeft] = useState({});
  const [markedRight, setMarkedRight] = useState({});

  // Card box size measurement
  const leftBoxRef = useRef(null);
  const [boxSize, setBoxSize] = useState({ width: 170, height: 140 });

  useEffect(() => {
    const updateSize = () => {
      if (leftBoxRef.current) {
        setBoxSize({
          width: leftBoxRef.current.clientWidth || 170,
          height: leftBoxRef.current.clientHeight || 140
        });
      }
    };
    const observer = new ResizeObserver(() => updateSize());
    if (leftBoxRef.current) observer.observe(leftBoxRef.current);
    updateSize();

    return () => observer.disconnect();
  }, []);

  // Compute position coordinates dynamically inside safe boundaries
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

      // Clamp coordinates inside safe zone
      x = Math.max(xMin, Math.min(xMax, x));
      y = Math.max(yMin, Math.min(yMax, y));

      return { x, y };
    });
  };

  const leftPositions = useMemo(() => getBoxPositions(leftItems), [leftItems, boxSize]);
  const rightPositions = useMemo(() => getBoxPositions(rightItems), [rightItems, boxSize]);

  // Click togglers for items
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
    if (isAnswered || numericAnswer === '') return;

    const userAnswer = parseInt(numericAnswer, 10);
    const correctAnswer = leftCount + rightCount;
    const isCorrect = userAnswer === correctAnswer;

    setIsAnswered(true);

    if (isCorrect) {
      setAnswerStatus('correct');
      const msg = CORRECT_ENCOURAGEMENTS[Math.floor(Math.random() * CORRECT_ENCOURAGEMENTS.length)];
      setFeedbackText(msg);

      setTimeout(() => {
        advanceStage(true);
      }, 2000); // Encouraging message displays for 2 seconds
    } else {
      setAnswerStatus('incorrect');
      const msg = getRandomIncorrectFeedback();
      setFeedbackText(msg);
      
      const misconception = classifyMisconception(leftCount, rightCount, userAnswer);
      const newMisconceptions = [...misconceptions, misconception];
      setMisconceptions(newMisconceptions);

      const newAttempts = attemptCount + 1;
      setAttemptCount(newAttempts);

      setTimeout(() => {
        if (newAttempts >= 3) {
          onFailed(characterType, newMisconceptions);
        } else {
          regenerateQuestion();
        }
      }, 2000); // Shortened delay: 2 seconds
    }
  };

  const regenerateQuestion = () => {
    setNumericAnswer('');
    setIsAnswered(false);
    setAnswerStatus(null);
    setFeedbackText('');
    setMarkedLeft({});
    setMarkedRight({});

    const newLeft = Math.floor(Math.random() * 3) + 2;
    const newRight = Math.floor(Math.random() * 3) + 2;
    setLeftCount(newLeft);
    setRightCount(newRight);
    
    setCurrentStage('A');
    setStageBQuestionNum(1);

    // Randomize character type for new Stage A cycle (avoiding previous type)
    const available = ['apple', 'bee', 'star'].filter(c => c !== characterType);
    const randomChar = available[Math.floor(Math.random() * available.length)];
    setCharacterType(randomChar);
  };

  const advanceStage = (isCorrect) => {
    setNumericAnswer('');
    setIsAnswered(false);
    setAnswerStatus(null);
    setFeedbackText('');
    setMarkedLeft({});
    setMarkedRight({});

    if (isCorrect) {
      if (currentStage === 'A') {
        setCurrentStage('B');
        setStageBQuestionNum(1);
      } else if (currentStage === 'B' && stageBQuestionNum === 1) {
        // Stage B Question 1 correct -> Proceed to Stage B Question 2!
        setStageBQuestionNum(2);
        // Generate new random counts (2-4 objects per box)
        const newLeft = Math.floor(Math.random() * 3) + 2;
        const newRight = Math.floor(Math.random() * 3) + 2;
        setLeftCount(newLeft);
        setRightCount(newRight);

        // Pick a different character type for Question 3 (Second "+" Question)
        const availableCharacters = ['apple', 'bee', 'star'].filter(c => c !== characterType);
        const randomChar = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
        setCharacterType(randomChar);
      } else {
        // Stage B Question 2 correct -> Complete Mission 2!
        onFinished();
      }
    }
  };

  const CharComponent = CHARACTER_COMPONENTS[characterType];
  const pluralName = CHARACTER_PLURAL[characterType] || 'objects';

  return (
    <LearningContainer>
      <div className="tlf-assessment-wrapper">
        <div className="tlf-assessment-card">
          <h2 className="tlf-assessment-title">
            How many altogether?
          </h2>
          
          <p className="tlf-assessment-helper">
            Type your answer.
          </p>

          <div className={`tlf-boxes-row ${currentStage === 'B' ? 'tlf-stage-b-active' : ''}`}>
            
            <div className="tlf-box left" ref={leftBoxRef}>
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
            </div>

            <div className="tlf-plus-symbol">+</div>

            <div className="tlf-box right">
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
            </div>

          </div>

          <div className="tlf-input-container">
            <input
              className={`tlf-numeric-input ${isAnswered && answerStatus === 'incorrect' ? 'incorrect' : ''}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={numericAnswer}
              onChange={handleNumericChange}
              disabled={isAnswered}
              autoFocus
              placeholder="?"
            />
          </div>

          <button
            className="tlf-submit-btn"
            onClick={handleSubmit}
            disabled={
              isAnswered || 
              numericAnswer === ''
            }
          >
            Submit
          </button>

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
