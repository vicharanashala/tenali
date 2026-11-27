import React, { useCallback, useMemo, useState } from 'react';
import {
  generateQuiz,
  QUIZ_TYPE_LABELS,
  type QuizQuestion,
  type QuizType,
} from './quizData';

/* ------------------------------------------------------------------ */
/*  Scoped styles for the quiz                                        */
/* ------------------------------------------------------------------ */

const QUIZ_STYLES = `
/* Quiz Tab Button in Header */
.ptl-quiz-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid rgba(6, 182, 212, 0.45);
  background: rgba(6, 182, 212, 0.12);
  color: #22d3ee;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.ptl-quiz-tab:hover {
  background: rgba(6, 182, 212, 0.22);
  border-color: #22d3ee;
  transform: translateY(-1px);
}
.ptl-quiz-tab[aria-pressed="true"] {
  background: #06b6d4;
  color: #0b1120;
  border-color: #06b6d4;
}

/* Quiz Panel */
.ptl-quiz-panel {
  max-width: 820px;
  margin: 0 auto;
  padding-top: 8px;
}

/* Setup card */
.ptl-quiz-setup {
  background: linear-gradient(160deg, #111827, #0f172a);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 16px;
  padding: 28px 24px;
  text-align: center;
}
.ptl-quiz-setup-title {
  margin: 0 0 4px;
  font-size: 1.5rem;
  font-weight: 800;
  color: #f8fafc;
}
.ptl-quiz-setup-sub {
  margin: 0 0 20px;
  font-size: 0.9rem;
  color: #94a3b8;
}
.ptl-quiz-setup-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
  text-align: left;
}
.ptl-quiz-type-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(30, 41, 59, 0.5);
  cursor: pointer;
  transition: all 0.12s ease;
  user-select: none;
}
.ptl-quiz-type-card:hover {
  border-color: rgba(148, 163, 184, 0.45);
  background: rgba(30, 41, 59, 0.7);
}
.ptl-quiz-type-card[aria-pressed="true"] {
  border-color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.ptl-quiz-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 2px solid rgba(148, 163, 184, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.12s ease;
}
.ptl-quiz-type-card[aria-pressed="true"] .ptl-quiz-checkbox {
  background: #06b6d4;
  border-color: #06b6d4;
}
.ptl-quiz-type-label {
  font-size: 0.84rem;
  font-weight: 600;
  color: #e2e8f0;
}
.ptl-quiz-count-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}
.ptl-quiz-count-label {
  font-size: 0.88rem;
  color: #cbd5e1;
  font-weight: 600;
}
.ptl-quiz-count-select {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: #1e293b;
  color: #f8fafc;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}
.ptl-quiz-start-btn {
  padding: 12px 32px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 4px 16px rgba(6, 182, 212, 0.3);
}
.ptl-quiz-start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(6, 182, 212, 0.45);
}
.ptl-quiz-start-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Progress bar */
.ptl-quiz-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.ptl-quiz-progress-bar-wrap {
  flex: 1;
  height: 8px;
  background: rgba(30, 41, 59, 0.75);
  border-radius: 999px;
  overflow: hidden;
}
.ptl-quiz-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #06b6d4, #3b82f6);
  border-radius: 999px;
  transition: width 0.35s ease;
}
.ptl-quiz-progress-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: #94a3b8;
  white-space: nowrap;
}

/* Question Card */
.ptl-quiz-qcard {
  background: linear-gradient(160deg, #111827, #0f172a);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 16px;
  padding: 24px;
  animation: ptl-quiz-fadein 0.3s ease;
}
@keyframes ptl-quiz-fadein {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ptl-quiz-qtype {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(6, 182, 212, 0.14);
  color: #22d3ee;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 10px;
}
.ptl-quiz-prompt {
  margin: 0 0 18px;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.4;
  color: #f8fafc;
}

/* Options */
.ptl-quiz-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ptl-quiz-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1.5px solid rgba(148, 163, 184, 0.24);
  background: rgba(30, 41, 59, 0.45);
  color: #e2e8f0;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s ease;
  text-align: left;
  width: 100%;
}
.ptl-quiz-option:hover:not(:disabled) {
  border-color: rgba(148, 163, 184, 0.5);
  background: rgba(30, 41, 59, 0.7);
  transform: translateX(4px);
}
.ptl-quiz-option:disabled {
  cursor: default;
}
.ptl-quiz-option-letter {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.14);
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
}
.ptl-quiz-option--correct {
  border-color: #22c55e !important;
  background: rgba(34, 197, 94, 0.14) !important;
}
.ptl-quiz-option--correct .ptl-quiz-option-letter {
  background: #22c55e;
  color: #0b1120;
}
.ptl-quiz-option--wrong {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.14) !important;
}
.ptl-quiz-option--wrong .ptl-quiz-option-letter {
  background: #ef4444;
  color: #fff;
}

/* Explanation */
.ptl-quiz-explanation {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  border-left: 3px solid #06b6d4;
  background: rgba(6, 182, 212, 0.08);
  font-size: 0.86rem;
  color: #cbd5e1;
  line-height: 1.5;
  animation: ptl-quiz-fadein 0.25s ease;
}
.ptl-quiz-next-btn {
  margin-top: 16px;
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: #1e293b;
  color: #f8fafc;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.12s ease;
}
.ptl-quiz-next-btn:hover {
  border-color: #38bdf8;
  background: #293548;
}

/* Results Card */
.ptl-quiz-results {
  background: linear-gradient(160deg, #111827, #0f172a);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  animation: ptl-quiz-fadein 0.4s ease;
}
.ptl-quiz-results-title {
  margin: 0 0 4px;
  font-size: 1.5rem;
  font-weight: 800;
  color: #f8fafc;
}
.ptl-quiz-score-ring {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 20px auto;
}
.ptl-quiz-score-ring svg {
  transform: rotate(-90deg);
}
.ptl-quiz-score-ring-bg {
  fill: none;
  stroke: rgba(148, 163, 184, 0.14);
  stroke-width: 10;
}
.ptl-quiz-score-ring-fg {
  fill: none;
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease;
}
.ptl-quiz-score-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.ptl-quiz-score-pct {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}
.ptl-quiz-score-label {
  font-size: 0.82rem;
  color: #94a3b8;
  margin-top: 2px;
}
.ptl-quiz-score-breakdown {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 16px 0 20px;
  font-size: 0.88rem;
  color: #cbd5e1;
}
.ptl-quiz-score-correct {
  color: #22c55e;
  font-weight: 700;
}
.ptl-quiz-score-wrong {
  color: #ef4444;
  font-weight: 700;
}
.ptl-quiz-results-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
.ptl-quiz-results-actions button {
  padding: 10px 24px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: #1e293b;
  color: #f8fafc;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.12s ease;
}
.ptl-quiz-results-actions button:hover {
  border-color: #38bdf8;
}
.ptl-quiz-results-actions .ptl-quiz-retry-btn {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  border: none;
  color: #fff;
  box-shadow: 0 4px 16px rgba(6, 182, 212, 0.3);
}
.ptl-quiz-results-actions .ptl-quiz-retry-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.45);
}

/* Review list */
.ptl-quiz-review {
  margin-top: 24px;
  text-align: left;
}
.ptl-quiz-review-title {
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 10px;
}
.ptl-quiz-review-item {
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.16);
  margin-bottom: 8px;
}
.ptl-quiz-review-q {
  font-size: 0.84rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 4px;
}
.ptl-quiz-review-a {
  font-size: 0.8rem;
  color: #94a3b8;
}
.ptl-quiz-review-a strong {
  color: #22c55e;
}
.ptl-quiz-review-item--wrong {
  border-left: 3px solid #ef4444;
}
.ptl-quiz-review-item--correct {
  border-left: 3px solid #22c55e;
}
`;

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const ALL_QUIZ_TYPES: QuizType[] = [
  'symbol-to-name',
  'name-to-symbol',
  'number-to-element',
  'category-identify',
  'subatomic-count',
];

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface QuizModeProps {
  onExit: () => void;
}

interface AnswerRecord {
  question: QuizQuestion;
  selectedIndex: number;
  isCorrect: boolean;
}

export default function QuizMode({ onExit }: QuizModeProps) {
  /* Setup state */
  const [selectedTypes, setSelectedTypes] = useState<Set<QuizType>>(
    new Set(ALL_QUIZ_TYPES)
  );
  const [questionCount, setQuestionCount] = useState(10);

  /* Active quiz state */
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [showResults, setShowResults] = useState(false);

  /* Derived */
  const currentQ = questions ? questions[currentIdx] : null;
  const isAnswered = selectedAnswer !== null;
  const totalQuestions = questions?.length ?? 0;
  const correctCount = answers.filter((a) => a.isCorrect).length;

  /* ---- Setup handlers ---- */

  const toggleType = useCallback((type: QuizType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type); // keep at least one
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const startQuiz = useCallback(() => {
    const q = generateQuiz(questionCount, [...selectedTypes]);
    setQuestions(q);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResults(false);
  }, [questionCount, selectedTypes]);

  /* ---- Quiz handlers ---- */

  const handleAnswer = useCallback(
    (optionIdx: number) => {
      if (isAnswered || !currentQ) return;
      setSelectedAnswer(optionIdx);
      setAnswers((prev) => [
        ...prev,
        {
          question: currentQ,
          selectedIndex: optionIdx,
          isCorrect: optionIdx === currentQ.correctIndex,
        },
      ]);
    },
    [isAnswered, currentQ]
  );

  const handleNext = useCallback(() => {
    if (!questions) return;
    if (currentIdx + 1 >= questions.length) {
      setShowResults(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedAnswer(null);
    }
  }, [questions, currentIdx]);

  const handleRestart = useCallback(() => {
    setQuestions(null);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResults(false);
    setCurrentIdx(0);
  }, []);

  /* ---- Score ring calculations ---- */

  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const circumference = 2 * Math.PI * 65;
  const dashOffset = circumference - (circumference * scorePercent) / 100;
  const scoreColor =
    scorePercent >= 80 ? '#22c55e' : scorePercent >= 50 ? '#eab308' : '#ef4444';

  /* ---------------------------------------------------------------- */
  /*  Render: Setup screen                                             */
  /* ---------------------------------------------------------------- */

  if (!questions) {
    return (
      <div className="ptl-quiz-panel">
        <style>{QUIZ_STYLES}</style>
        <div className="ptl-quiz-setup">
          <h2 className="ptl-quiz-setup-title">⚗️ Element Quiz</h2>
          <p className="ptl-quiz-setup-sub">
            Test your knowledge of the periodic table! Choose question types and hit start.
          </p>

          <div className="ptl-quiz-setup-grid">
            {ALL_QUIZ_TYPES.map((type) => {
              const active = selectedTypes.has(type);
              return (
                <button
                  key={type}
                  type="button"
                  className="ptl-quiz-type-card"
                  aria-pressed={active}
                  onClick={() => toggleType(type)}
                >
                  <span className="ptl-quiz-checkbox">
                    {active && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0b1120" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className="ptl-quiz-type-label">
                    {QUIZ_TYPE_LABELS[type]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="ptl-quiz-count-row">
            <span className="ptl-quiz-count-label">Number of questions:</span>
            <select
              className="ptl-quiz-count-select"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            >
              {QUESTION_COUNT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              type="button"
              className="ptl-quiz-start-btn"
              disabled={selectedTypes.size === 0}
              onClick={startQuiz}
            >
              🚀 Start Quiz
            </button>
            <button
              type="button"
              className="ptl-quiz-next-btn"
              onClick={onExit}
            >
              ← Back to Table
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render: Results screen                                           */
  /* ---------------------------------------------------------------- */

  if (showResults) {
    return (
      <div className="ptl-quiz-panel">
        <style>{QUIZ_STYLES}</style>
        <div className="ptl-quiz-results">
          <h2 className="ptl-quiz-results-title">
            {scorePercent >= 80 ? '🎉 ' : scorePercent >= 50 ? '👍 ' : '📚 '}
            Quiz Complete!
          </h2>

          <div className="ptl-quiz-score-ring">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle
                className="ptl-quiz-score-ring-bg"
                cx="80"
                cy="80"
                r="65"
              />
              <circle
                className="ptl-quiz-score-ring-fg"
                cx="80"
                cy="80"
                r="65"
                stroke={scoreColor}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="ptl-quiz-score-text">
              <span className="ptl-quiz-score-pct" style={{ color: scoreColor }}>
                {scorePercent}%
              </span>
              <span className="ptl-quiz-score-label">Score</span>
            </div>
          </div>

          <div className="ptl-quiz-score-breakdown">
            <span>
              <span className="ptl-quiz-score-correct">✓ {correctCount}</span> correct
            </span>
            <span>
              <span className="ptl-quiz-score-wrong">✗ {totalQuestions - correctCount}</span> wrong
            </span>
            <span>{totalQuestions} total</span>
          </div>

          <div className="ptl-quiz-results-actions">
            <button
              type="button"
              className="ptl-quiz-retry-btn"
              onClick={handleRestart}
            >
              🔄 Try Again
            </button>
            <button type="button" onClick={onExit}>
              ← Back to Table
            </button>
          </div>

          {/* Review section */}
          <div className="ptl-quiz-review">
            <h3 className="ptl-quiz-review-title">📋 Review Your Answers</h3>
            {answers.map((rec, idx) => (
              <div
                key={rec.question.id}
                className={`ptl-quiz-review-item ${
                  rec.isCorrect
                    ? 'ptl-quiz-review-item--correct'
                    : 'ptl-quiz-review-item--wrong'
                }`}
              >
                <div className="ptl-quiz-review-q">
                  {idx + 1}. {rec.question.prompt}
                </div>
                <div className="ptl-quiz-review-a">
                  Your answer: {rec.question.options[rec.selectedIndex]}
                  {!rec.isCorrect && (
                    <>
                      {' '}— Correct: <strong>{rec.question.options[rec.question.correctIndex]}</strong>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render: Active question                                          */
  /* ---------------------------------------------------------------- */

  return (
    <div className="ptl-quiz-panel">
      <style>{QUIZ_STYLES}</style>

      {/* Progress bar */}
      <div className="ptl-quiz-progress">
        <div className="ptl-quiz-progress-bar-wrap">
          <div
            className="ptl-quiz-progress-bar"
            style={{ width: `${((currentIdx + (isAnswered ? 1 : 0)) / totalQuestions) * 100}%` }}
          />
        </div>
        <span className="ptl-quiz-progress-text">
          {currentIdx + 1} / {totalQuestions}
        </span>
      </div>

      {/* Question card */}
      {currentQ && (
        <div className="ptl-quiz-qcard" key={currentQ.id}>
          <span className="ptl-quiz-qtype">
            {QUIZ_TYPE_LABELS[currentQ.type]}
          </span>
          <p className="ptl-quiz-prompt">{currentQ.prompt}</p>

          <div className="ptl-quiz-options">
            {currentQ.options.map((opt, idx) => {
              let modClass = '';
              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  modClass = 'ptl-quiz-option--correct';
                } else if (idx === selectedAnswer) {
                  modClass = 'ptl-quiz-option--wrong';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  className={`ptl-quiz-option ${modClass}`}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(idx)}
                >
                  <span className="ptl-quiz-option-letter">
                    {OPTION_LETTERS[idx]}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Post-answer: explanation + next */}
          {isAnswered && (
            <>
              <div className="ptl-quiz-explanation">
                {selectedAnswer === currentQ.correctIndex ? '✅ Correct! ' : '❌ Incorrect. '}
                {currentQ.explanation}
              </div>
              <button
                type="button"
                className="ptl-quiz-next-btn"
                onClick={handleNext}
              >
                {currentIdx + 1 >= totalQuestions ? '📊 See Results' : 'Next Question →'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
