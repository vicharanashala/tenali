import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DIMENSION_QUESTIONS, PHASES, PATH_META } from './questions';
import DimensionCanvas from './DimensionCanvas';
import './DimensionStudioModule.css';

// Fisher-Yates shuffle helper
function shuffleArray(arr) {
  if (!arr || !Array.isArray(arr)) return [];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function initShuffledOptions() {
  const result = {};
  DIMENSION_QUESTIONS.forEach((q) => {
    if (q.options && q.options.length > 0) {
      result[q.id] = shuffleArray(q.options);
    }
  });
  return result;
}

export default function DimensionStudioModule({ onBack = null, onNext = null }) {
  const [activeStep, setActiveStep] = useState(1);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);
  const [shuffledOptionsMap] = useState(() => initShuffledOptions());
  const [answers, setAnswers] = useState(() => {
    const init = {};
    DIMENSION_QUESTIONS.forEach((q) => {
      init[q.id] = {
        selectedOption: null,
        isSubmitted: false,
        isCorrect: false,
        error: null
      };
    });
    return init;
  });

  const cardRef = useRef(null);

  const currentQ = useMemo(() => {
    return DIMENSION_QUESTIONS.find((q) => q.id === activeStep) || DIMENSION_QUESTIONS[0];
  }, [activeStep]);

  const currentPhase = useMemo(() => {
    return PHASES.find((p) => p.id === currentQ.phaseId) || PHASES[0];
  }, [currentQ]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep]);

  // Auto-advance countdown on ceremony step
  const isCeremony = currentQ.type === 'sandbox';
  useEffect(() => {
    let timer;
    if (isCeremony && onNext) {
      if (autoAdvanceTimer === null) {
        timer = setTimeout(() => {
          setAutoAdvanceTimer(4);
        }, 0);
      } else if (autoAdvanceTimer > 0) {
        timer = setTimeout(() => {
          setAutoAdvanceTimer((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);
      } else if (autoAdvanceTimer === 0) {
        onNext();
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCeremony, onNext, autoAdvanceTimer]);

  // Handle MCQ selection (does not auto-submit)
  const handleSelectOption = (optId) => {
    setAnswers((prev) => ({
      ...prev,
      [activeStep]: {
        ...prev[activeStep],
        selectedOption: optId,
        error: null
      }
    }));
  };

  // Submit and verify answer
  const handleCheckAnswer = () => {
    const selectedId = answers[activeStep]?.selectedOption;
    if (!selectedId) return;

    const options = shuffledOptionsMap[activeStep] || currentQ.options;
    const opt = options.find((o) => o.id === selectedId);
    if (!opt) return;

    if (opt.isCorrect) {
      setAnswers((prev) => ({
        ...prev,
        [activeStep]: {
          ...prev[activeStep],
          isSubmitted: true,
          isCorrect: true,
          error: null
        }
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [activeStep]: {
          ...prev[activeStep],
          isSubmitted: false,
          isCorrect: false,
          error: 'Not quite. Review the definitions and try again!'
        }
      }));
    }
  };

  // Advance step
  const handleNext = () => {
    if (activeStep < DIMENSION_QUESTIONS.length) {
      setActiveStep((prev) => prev + 1);
    }
  };

  // Previous step
  const handlePrev = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    }
  };

  // Jump to specific step from stepper bar
  const handleJumpToStep = (stepId) => {
    setActiveStep(stepId);
  };

  const isQuestionComplete = (qId) => {
    const a = answers[qId];
    if (!a) return false;
    const q = DIMENSION_QUESTIONS.find((item) => item.id === qId);
    if (q?.type === 'sandbox') return true;
    return Boolean(a.isSubmitted && a.isCorrect);
  };

  const completedCount = Object.keys(answers).filter((id) =>
    isQuestionComplete(Number(id))
  ).length;

  const currentAns = answers[activeStep];

  // Helper for address badge
  const getAddressBadge = (step) => {
    if (step === 1) return '(2, 3) ∈ S × P';
    if (step === 2) return '(2, 2) ∈ S²';
    if (step === 3) return 'S × S = S²';
    if (step === 4 || step === 5) return 'x ∈ ℝ';
    if (step === 6 || step === 7) return '(x, y) ∈ ℝ²';
    if (step === 8) return '(x, y, z) ∈ ℝ³';
    if (step === 9) return 'v ∈ ℝ⁴';
    if (step === 10) return 'v ∈ ℝⁿ';
    return 'Master Ceremony';
  };

  return (
    <div className="fs-studio-wrapper">
      {/* 1. TOP NAVIGATION */}
      <div className="fs-top-nav">
        {onBack && (
          <button type="button" className="fs-back-btn" onClick={onBack}>
            ← Dashboard
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {completedCount > 0 && (
            <span
              className="fs-progress-badge"
              style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.35)' }}
            >
              ✓ Completed: {completedCount}
            </span>
          )}
          <span className="fs-progress-badge">
            {`Question ${activeStep} of ${DIMENSION_QUESTIONS.length}`}
          </span>
        </div>
      </div>

      {/* 2. HEADER */}
      <div className="fs-header">
        <span className="fs-phase-pill">{currentPhase.name}</span>
        <h1 className="fs-title">{PATH_META.title}</h1>
        <p className="fs-subtitle">
          {PATH_META.subtitle}
        </p>
      </div>

      {/* 3. STEPPER BAR (Consistent with LineStudio, FunctionStudio, MatrixStudio) */}
      <div className="fs-stepper-bar">
        {DIMENSION_QUESTIONS.map((q) => {
          const isDone = isQuestionComplete(q.id);
          const isActive = activeStep === q.id;
          return (
            <button
              key={q.id}
              type="button"
              className={`fs-step-pill ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
              onClick={() => handleJumpToStep(q.id)}
              title={`Question ${q.id}: ${q.title}`}
            >
              <span>{q.id}</span>
            </button>
          );
        })}
      </div>

      {/* 4. MAIN UNIFIED CARD */}
      <div className="fs-card" ref={cardRef}>
        {/* Card Header */}
        <div className="fs-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="fs-question-badge">{activeStep === 11 ? '🎓' : `Q${activeStep}`}</span>
            <span className="fs-topic-badge">{currentQ.title}</span>
            <span className="fs-card-line-badge">{getAddressBadge(activeStep)}</span>
          </div>
          <span className="fs-question-num">
            {activeStep === 11 ? 'Ceremony & Summary' : `Question ${activeStep} of ${DIMENSION_QUESTIONS.length}`}
          </span>
        </div>

        {/* 1. GRAPH / CANVAS AT TOP (Rendered only for questions with visualizers: Q6+ and Sandbox) */}
        {currentQ.canvasMode && currentQ.canvasMode !== 'none' && !currentQ.hideVisualizer && (
          <DimensionCanvas
            key={currentQ.id}
            mode={currentQ.canvasMode}
            initialCoords={currentQ.initialCoords}
            compact={false}
          />
        )}

        {/* 2. QUESTION CONTENT */}
        {currentQ.type === 'mcq' && (
          <div className="fs-step-intro-block">
            <h3 className="fs-step-heading">{currentQ.prompt}</h3>
            <p className="fs-step-subtext">{currentQ.subtext}</p>

            {/* Multiple Choice Options */}
            <div className="fs-options-grid">
              {(shuffledOptionsMap[currentQ.id] || currentQ.options).map((opt, idx) => {
                const isSelected = currentAns?.selectedOption === opt.id;
                const isSubmitted = currentAns?.isSubmitted;
                let btnClass = 'fs-option-btn';
                if (isSelected) btnClass += ' selected';
                if (isSubmitted) {
                  if (opt.isCorrect) btnClass += ' correct';
                  else if (isSelected) btnClass += ' incorrect';
                }
                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={btnClass}
                    onClick={() => !isSubmitted && handleSelectOption(opt.id)}
                    disabled={isSubmitted}
                  >
                    <span className="fs-option-letter">{letter}</span>
                    <span className="fs-option-text">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Error Message */}
            {currentAns?.error && !currentAns?.isSubmitted && (
              <div className="fs-error-banner">
                {currentAns.error}
              </div>
            )}

            {/* Action Buttons */}
            {!currentAns?.isSubmitted ? (
              <div className="fs-step-footer-actions between">
                <button
                  type="button"
                  className="fs-btn-secondary"
                  onClick={handlePrev}
                  disabled={activeStep === 1}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  className="fs-btn-primary"
                  disabled={!currentAns?.selectedOption}
                  onClick={handleCheckAnswer}
                >
                  Check Answer ✓
                </button>
              </div>
            ) : (
              <div className="fs-earns-card">
                <div className="fs-earns-badge">🎉 EARNED INSIGHT</div>
                <p className="fs-earns-text">{currentQ.explanation}</p>
                <div className="fs-step-footer-actions between">
                  <button
                    type="button"
                    className="fs-btn-secondary"
                    onClick={handlePrev}
                    disabled={activeStep === 1}
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    className="fs-btn-primary"
                    onClick={handleNext}
                  >
                    {activeStep < DIMENSION_QUESTIONS.length
                      ? (activeStep === DIMENSION_QUESTIONS.length - 1
                          ? 'View Master Ceremony 🎓'
                          : `Continue to Question ${activeStep + 1} →`)
                      : 'View Master Ceremony 🎓'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. QUESTION 12: SANDBOX / GRADUATION CEREMONY */}
        {currentQ.type === 'sandbox' && (
          <div className="fs-ceremony-card">
            <div className="fs-ceremony-header">
              <div className="fs-ceremony-badge">🎓</div>
              <h3 className="fs-ceremony-title">Dimensional Master Ceremony</h3>
              <p className="fs-ceremony-desc">
                You have mastered the ladder of dimensions — from discrete Cartesian sets S × P and S² to continuous ℝ, ℝ², ℝ³, and ℝⁿ!
              </p>
            </div>

            <div className="fs-summary-table-wrap">
              <table className="fs-summary-table">
                <thead>
                  <tr>
                    <th>Space</th>
                    <th>Address</th>
                    <th>Degrees of Freedom</th>
                    <th>Connection</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>S × P</code></td>
                    <td><code>(s, p)</code></td>
                    <td>Discrete grid</td>
                    <td>Cartesian cross product of sets</td>
                  </tr>
                  <tr>
                    <td><code>S²</code></td>
                    <td><code>(s₁, s₂)</code></td>
                    <td>Discrete grid</td>
                    <td>Set crossed with itself (S × S)</td>
                  </tr>
                  <tr>
                    <td><code>ℝ</code></td>
                    <td><code>x</code></td>
                    <td>1 Direction (line)</td>
                    <td>Continuous number line (input / domain)</td>
                  </tr>
                  <tr>
                    <td><code>ℝ²</code></td>
                    <td><code>(x, y)</code></td>
                    <td>2 Directions (plane)</td>
                    <td>Cartesian plane (function graphs & lines)</td>
                  </tr>
                  <tr>
                    <td><code>ℝ³</code></td>
                    <td><code>(x, y, z)</code></td>
                    <td>3 Directions (space)</td>
                    <td>Physical 3D space (width, length, height)</td>
                  </tr>
                  <tr>
                    <td><code>ℝⁿ</code></td>
                    <td><code>(x₁, ..., xₙ)</code></td>
                    <td>n Directions</td>
                    <td>Multi-feature data, vectors & AI embeddings</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {onNext && autoAdvanceTimer !== null && (
              <div style={{
                background: 'rgba(232, 134, 74, 0.15)',
                border: '1px solid var(--clr-accent, #e8864a)',
                borderRadius: '8px',
                padding: '0.6rem 1.25rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                margin: '1.25rem 0'
              }}>
                <span>🚀 Advancing to <strong>Function Studio (Stage 4)</strong> in <strong>{autoAdvanceTimer}s</strong>...</span>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: '1px solid var(--clr-accent, #e8864a)',
                    borderRadius: '4px',
                    color: 'var(--clr-accent, #e8864a)',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    fontSize: '0.78rem'
                  }}
                  onClick={() => setAutoAdvanceTimer(null)}
                >
                  Stay Here
                </button>
              </div>
            )}

            <div className="fs-step-footer-actions between">
              <button
                type="button"
                className="fs-btn-secondary"
                onClick={() => handleJumpToStep(1)}
              >
                ↺ Review from Question 1
              </button>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {onBack && (
                  <button
                    type="button"
                    className="fs-btn-secondary"
                    onClick={onBack}
                  >
                    Dashboard 🏠
                  </button>
                )}
                {onNext && (
                  <button
                    type="button"
                    className="fs-btn-primary"
                    onClick={onNext}
                  >
                    Proceed to Function Studio (Stage 4) ⚡ ➔
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
