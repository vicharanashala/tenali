import React, { useState, useEffect } from 'react';
import { REVERSE_DEMO_DATA } from './reverseDemoData';
import './ReverseEngineeringApp.css';

const TOPICS = [
  { id: 'addition', name: 'Addition', icon: '➕', desc: 'Construct a sum that equals the target' },
  { id: 'multiplication', name: 'Multiplication', icon: '✖️', desc: 'Construct a product that equals the target' },
  { id: 'division', name: 'Division', icon: '➗', desc: 'Construct a quotient that equals the target' },
  { id: 'fractions', name: 'Fractions', icon: '🍕', desc: 'Construct a fraction operation equaling the target' },
  { id: 'linear-equations', name: 'Linear Equations', icon: '📈', desc: 'Construct an equation with a specific x solution' },
  { id: 'quadratic-equations', name: 'Quadratics', icon: '📐', desc: 'Construct a quadratic given its roots' },
  { id: 'geometry', name: 'Geometry Area', icon: '⏹️', desc: 'Construct rectangle dimensions for a target area' },
  { id: 'big-four', name: 'The Big 4', icon: '⚡', desc: 'Combine +, −, ×, ÷ in a 2-step equation' }
];

const TOTAL_QUESTIONS_PER_SESSION = 10;

const getDifficultyForQuestion = (qNum) => {
  if (qNum <= 3) return 0; // Easy (Q1-3)
  if (qNum <= 6) return 1; // Medium (Q4-6)
  if (qNum <= 9) return 2; // Hard (Q7-9)
  return 3;                // Extra Hard / Boss Question (Q10)
};

const getTierBadge = (qNum) => {
  if (qNum <= 3) return { label: '🟢 Easy (Q1-3)', type: 'easy' };
  if (qNum <= 6) return { label: '🔵 Medium (Q4-6)', type: 'medium' };
  if (qNum <= 9) return { label: '🟠 Hard (Q7-9)', type: 'hard' };
  return { label: '🔥 BOSS QUESTION 10/10', type: 'boss' };
};

export default function ReverseEngineeringApp({ onBack }) {
  const [selectedTopic, setSelectedTopic] = useState('addition');
  const [inChallenge, setInChallenge] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(true);

  // 10-Question Session state
  const [questionNumber, setQuestionNumber] = useState(1);
  const [sessionResults, setSessionResults] = useState([]); // [{ qNum, display, stars, correct, skipped }]
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);

  // 5-Star Celebration Overlay state
  const [showCelebration, setShowCelebration] = useState(false);

  // Demo walkthrough state
  const [demoTopicId, setDemoTopicId] = useState(null);
  const [demoStepIndex, setDemoStepIndex] = useState(0);

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form inputs & attempts state
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [hintLevel, setHintLevel] = useState(0); // 0 = none, 1 = concept, 2 = guided, 3 = direct answer
  const [showHint, setShowHint] = useState(false);

  // Persistence stats
  const [stats, setStats] = useState(() => {
    try {
      const stored = localStorage.getItem('tenali-reverse-engineering');
      return stored ? JSON.parse(stored) : {};
    } catch (_e) {
      return {};
    }
  });

  const saveStats = (newStats) => {
    setStats(newStats);
    try {
      localStorage.setItem('tenali-reverse-engineering', JSON.stringify(newStats));
    } catch (_e) {}
  };

  const fetchQuestion = async (topic, qNum) => {
    setLoading(true);
    setResult(null);
    setAttemptsCount(0);
    setHintLevel(0);
    setShowHint(false);
    setIsQuestionAnswered(false);
    setInputs({});

    const currentQ = qNum || questionNumber;
    const computedDiff = getDifficultyForQuestion(currentQ);

    try {
      const res = await fetch(`/reverse-api/question?topic=${topic}&difficulty=${computedDiff}&questionNumber=${currentQ}`);
      const data = await res.json();
      setProblem(data);
      initInputs(data);
    } catch (err) {
      console.error('Failed to fetch reverse question:', err);
    } finally {
      setLoading(false);
    }
  };

  const initInputs = (prob) => {
    if (!prob) return;
    const t = prob.topic;
    if (t === 'addition' || t === 'multiplication' || t === 'division' || t === 'geometry') {
      setInputs({ a: '', b: '', w: '', h: '' });
    } else if (t === 'fractions') {
      setInputs({ n1: '', d1: '', op: '+', n2: '', d2: '' });
    } else if (t === 'linear-equations') {
      setInputs({ a1: '', b1: '', a2: '', b2: '' });
    } else if (t === 'quadratic-equations') {
      setInputs({ a: '1', b: '', c: '' });
    } else if (t === 'big-four') {
      setInputs({ a: '', op1: '+', b: '', op2: '×', c: '' });
    }
  };

  const startChallenge = () => {
    setInChallenge(true);
    setQuestionNumber(1);
    setSessionResults([]);
    setSessionComplete(false);
    setIsQuestionAnswered(false);
    setShowCelebration(false);
    setHintsRemaining(3);
    fetchQuestion(selectedTopic, 1);
  };

  const openDemo = (topicId, e) => {
    if (e) e.stopPropagation();
    setDemoTopicId(topicId);
    setDemoStepIndex(0);
  };

  const closeDemo = () => {
    setDemoTopicId(null);
    setDemoStepIndex(0);
  };

  const startChallengeFromDemo = (topicId) => {
    setSelectedTopic(topicId);
    closeDemo();
    setInChallenge(true);
    setQuestionNumber(1);
    setSessionResults([]);
    setSessionComplete(false);
    setIsQuestionAnswered(false);
    setShowCelebration(false);
    setHintsRemaining(3);
    fetchQuestion(topicId, 1);
  };

  const handleInputChange = (field, val) => {
    setInputs((prev) => ({ ...prev, [field]: val }));
  };

  const useHint = () => {
    if (hintsRemaining > 0 && hintLevel < 3) {
      setHintsRemaining((prev) => prev - 1);
      setHintLevel((prev) => prev + 1);
      setShowHint(true);
    }
  };

  const submitAnswer = async () => {
    if (!problem || isQuestionAnswered) return;
    setLoading(true);
    const newAttemptCount = attemptsCount + 1;
    setAttemptsCount(newAttemptCount);

    try {
      const res = await fetch('/reverse-api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: problem.topic,
          target: problem.target,
          difficulty: problem.difficulty,
          questionNumber: questionNumber,
          construction: inputs
        })
      });
      const data = await res.json();
      setResult(data);

      if (data.correct) {
        setIsQuestionAnswered(true);
        const starsEarned = data.creativity || 1;

        // Record question result
        setSessionResults((prev) => [
          ...prev,
          {
            qNum: questionNumber,
            display: problem.display,
            stars: starsEarned,
            correct: true,
            skipped: false
          }
        ]);

        // Trigger 5-Star Celebration Effect if 5 stars earned
        if (starsEarned === 5) {
          setShowCelebration(true);
          setTimeout(() => {
            setShowCelebration(false);
          }, 3200);
        }

        // Update persistence stats
        const topicStats = stats[problem.topic] || { attempts: 0, bestCreativity: 0, completed: 0 };
        const updated = {
          ...stats,
          [problem.topic]: {
            attempts: topicStats.attempts + 1,
            completed: topicStats.completed + 1,
            bestCreativity: Math.max(topicStats.bestCreativity || 0, starsEarned)
          }
        };
        saveStats(updated);
      }
    } catch (err) {
      console.error('Check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const skipQuestion = () => {
    if (isQuestionAnswered) return;
    setIsQuestionAnswered(true);
    setResult({
      correct: false,
      skipped: true,
      creativity: 0,
      feedback: 'Question skipped. Moving to next question!'
    });

    setSessionResults((prev) => [
      ...prev,
      {
        qNum: questionNumber,
        display: problem.display,
        stars: 0,
        correct: false,
        skipped: true
      }
    ]);
  };

  const goToNextQuestion = () => {
    if (questionNumber < TOTAL_QUESTIONS_PER_SESSION) {
      const nextQ = questionNumber + 1;
      setQuestionNumber(nextQ);
      setHintsRemaining(3);
      fetchQuestion(selectedTopic, nextQ);
    } else {
      setSessionComplete(true);
    }
  };

  const topicStat = stats[selectedTopic] || { completed: 0, bestCreativity: 0 };
  const isFirstTryPerfect = result && result.correct && result.creativity === 5 && attemptsCount === 1;

  const getHintTextForLevel = () => {
    if (!result) return '';
    const h = result.hints || {};
    if (hintLevel === 1) return h.level1 || result.fiveStarHint || 'Try using a negative or non-round number!';
    if (hintLevel === 2) return h.level2 || 'Pick a negative number (e.g. -19) and calculate the second term!';
    if (hintLevel === 3) return h.level3 || 'Direct 5-Star Solution: Use [(-19) + (target + 19) = target]!';
    return '';
  };

  const getHintButtonLabel = () => {
    if (hintLevel === 0) return `💡 Reveal 5-Star Hint (${hintsRemaining} left)`;
    if (hintLevel === 1) return `💡 Next Hint: Guided Step (${hintsRemaining} left)`;
    if (hintLevel === 2) return `💡 Show Direct 5-Star Solution (${hintsRemaining} left)`;
    return '';
  };

  // Calculate total stars earned in the current session
  const totalSessionStars = sessionResults.reduce((acc, q) => acc + (q.stars || 0), 0);

  const getSessionGrade = (totalStars) => {
    if (totalStars >= 45) return { label: '🏆 Mastermind', color: '#f6ad55', desc: 'Outstanding mathematical creativity across all questions!' };
    if (totalStars >= 35) return { label: '🌟 Expert', color: '#68d391', desc: 'Great job! Highly inventive problem-solving!' };
    if (totalStars >= 20) return { label: '👍 Proficient', color: '#63b3ed', desc: 'Good effort! Keep practicing creative solutions!' };
    return { label: '📚 Explorer', color: '#fc8181', desc: 'Nice start! Try using hints to unlock 5-star strategies!' };
  };

  const activeDemoData = demoTopicId ? REVERSE_DEMO_DATA[demoTopicId] : null;
  const currentDemoStep = activeDemoData ? activeDemoData.steps[demoStepIndex] : null;

  return (
    <div className="reverse-app-container">
      <div className="reverse-header">
        <button className="reverse-back-btn" onClick={inChallenge ? () => setInChallenge(false) : onBack}>
          ← {inChallenge ? 'Change Topic' : 'Main Menu'}
        </button>

        {inChallenge && !sessionComplete && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="reverse-demo-btn header-demo" onClick={(e) => openDemo(selectedTopic, e)}>
              🎬 Watch Demo
            </button>
            {(() => {
              const tier = getTierBadge(questionNumber);
              return (
                <div className={`reverse-tier-pill ${tier.type}`}>
                  {tier.label}
                </div>
              );
            })()}
            <div className="reverse-stat-badge" style={{ fontWeight: 600, opacity: 0.9 }}>
              💡 Hints: <strong style={{ color: '#feb47b' }}>{hintsRemaining}</strong>/3
            </div>
          </div>
        )}
      </div>

      {!inChallenge ? (
        /* SETUP SCREEN */
        <div>
          <div className="reverse-title-section">
            <h1>Reverse Engineering Mode</h1>
            <p className="reverse-subtitle">
              Given a mathematical answer, construct a valid problem or equation that produces it.
            </p>
            <div className="reverse-brain-tip-banner">
              📝 <strong>Pro-Tip</strong>: Keep a pen & paper handy! Reverse engineering gets delightfully brain-heavy as you craft creative equations 🧠⚡
            </div>
          </div>

          <div className="reverse-topics-grid">
            {TOPICS.map((t) => (
              <div
                key={t.id}
                className={`reverse-topic-card ${selectedTopic === t.id ? 'selected' : ''}`}
                onClick={() => setSelectedTopic(t.id)}
              >
                <div className="reverse-topic-icon">{t.icon}</div>
                <div className="reverse-topic-name">{t.name}</div>
                <div className="reverse-topic-desc">{t.desc}</div>
                <button
                  className="reverse-demo-btn card-demo"
                  onClick={(e) => openDemo(t.id, e)}
                  title="Watch an interactive step-by-step example"
                >
                  🎬 Watch Demo
                </button>
              </div>
            ))}
          </div>

          <button className="reverse-start-btn" onClick={startChallenge} style={{ marginTop: '16px' }}>
            Start 10-Question Campaign 🚀
          </button>
        </div>
      ) : sessionComplete ? (
        /* SESSION SUMMARY SCREEN */
        <div className="reverse-summary-container">
          <div className="reverse-summary-card">
            <div className="reverse-summary-header">
              <h2>🏆 Campaign Complete!</h2>
              <p className="reverse-subtitle" style={{ marginTop: '4px' }}>
                {TOPICS.find((t) => t.id === selectedTopic)?.name} — 10-Question Campaign (Easy ➔ Boss Level)
              </p>
            </div>

            {/* TOTAL SCORE BADGE */}
            <div className="reverse-score-box">
              <div className="reverse-score-number">
                ⭐ {totalSessionStars} <span style={{ fontSize: '1.4rem', opacity: 0.7 }}>/ 50</span>
              </div>
              {(() => {
                const grade = getSessionGrade(totalSessionStars);
                return (
                  <div className="reverse-grade-badge" style={{ borderColor: grade.color, color: grade.color }}>
                    {grade.label}
                  </div>
                );
              })()}
              <p style={{ marginTop: '10px', fontSize: '0.95rem', opacity: 0.85 }}>
                {getSessionGrade(totalSessionStars).desc}
              </p>
            </div>

            {/* BREAKDOWN OF ALL 10 QUESTIONS */}
            <div className="reverse-summary-breakdown">
              <h3>Question Breakdown</h3>
              <div className="reverse-questions-grid">
                {sessionResults.map((q) => (
                  <div key={q.qNum} className="reverse-q-row">
                    <span className="reverse-q-num">Q{q.qNum}</span>
                    <span className="reverse-q-display">{q.display}</span>
                    <span className="reverse-q-stars">
                      {q.skipped ? (
                        <span style={{ color: '#fc8181', fontWeight: 700 }}>❌ Skipped</span>
                      ) : (
                        '⭐'.repeat(q.stars) || '⭐'
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="reverse-summary-actions">
              <button className="reverse-start-btn" onClick={startChallenge}>
                Play Again 🔄
              </button>
              <button className="reverse-next-btn" onClick={() => setInChallenge(false)}>
                ← Change Topic
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* CHALLENGE SCREEN (QUESTION 1..10) */
        <div className="reverse-challenge-card">
          {/* PROGRESS DOT TRACKER */}
          <div className="reverse-session-tracker">
            {Array.from({ length: TOTAL_QUESTIONS_PER_SESSION }).map((_, idx) => {
              const qIdx = idx + 1;
              const qResult = sessionResults.find((r) => r.qNum === qIdx);
              let dotClass = 'pending';
              if (qIdx === questionNumber && !isQuestionAnswered) dotClass = 'active';
              else if (qResult) dotClass = qResult.skipped ? 'skipped' : 'completed';

              return (
                <div key={qIdx} className={`reverse-tracker-dot ${dotClass}`} title={`Question ${qIdx}`}>
                  {qResult && !qResult.skipped ? `⭐${qResult.stars}` : qIdx}
                </div>
              );
            })}
          </div>

          {loading && !problem ? (
            <p>Loading campaign challenge...</p>
          ) : problem ? (
            <div>
              <div className="reverse-target-badge">
                🎯 {problem.display}
              </div>

              <div className="reverse-rules-section">
                <div className="reverse-rules-title">Rules & Constraints</div>
                <div className="reverse-rules-list">
                  {problem.rules.map((rule, idx) => (
                    <span key={idx} className="reverse-rule-pill">
                      ✓ {rule}
                    </span>
                  ))}
                </div>
              </div>

              {/* INPUT BUILDER BASED ON TOPIC */}
              <div className="reverse-builder-box">
                {(problem.topic === 'addition' || problem.topic === 'multiplication' || problem.topic === 'division') && (
                  <>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="?"
                      value={inputs.a || ''}
                      onChange={(e) => handleInputChange('a', e.target.value)}
                      disabled={isQuestionAnswered}
                    />
                    <span className="reverse-equals-sign">
                      {problem.topic === 'addition' ? '+' : problem.topic === 'multiplication' ? '×' : '÷'}
                    </span>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="?"
                      value={inputs.b || ''}
                      onChange={(e) => handleInputChange('b', e.target.value)}
                      disabled={isQuestionAnswered}
                    />
                    <span className="reverse-equals-sign">=</span>
                    <span className="reverse-target-badge" style={{ margin: 0, padding: '8px 18px', fontSize: '1.2rem' }}>
                      {problem.target}
                    </span>
                  </>
                )}

                {problem.topic === 'geometry' && (
                  <>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="Width"
                      value={inputs.w || ''}
                      onChange={(e) => handleInputChange('w', e.target.value)}
                      disabled={isQuestionAnswered}
                    />
                    <span className="reverse-equals-sign">×</span>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="Height"
                      value={inputs.h || ''}
                      onChange={(e) => handleInputChange('h', e.target.value)}
                      disabled={isQuestionAnswered}
                    />
                    <span className="reverse-equals-sign">=</span>
                    <span className="reverse-target-badge" style={{ margin: 0, padding: '8px 18px', fontSize: '1.2rem' }}>
                      {problem.target} cm²
                    </span>
                  </>
                )}

                {problem.topic === 'fractions' && (
                  <>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
                      <input
                        type="number"
                        className="reverse-input-num"
                        style={{ height: '40px', fontSize: '1.1rem' }}
                        placeholder="num1"
                        value={inputs.n1 || ''}
                        onChange={(e) => handleInputChange('n1', e.target.value)}
                        disabled={isQuestionAnswered}
                      />
                      <div style={{ height: '2px', background: '#ccc' }} />
                      <input
                        type="number"
                        className="reverse-input-num"
                        style={{ height: '40px', fontSize: '1.1rem' }}
                        placeholder="den1"
                        value={inputs.d1 || ''}
                        onChange={(e) => handleInputChange('d1', e.target.value)}
                        disabled={isQuestionAnswered}
                      />
                    </div>

                    <div className="reverse-op-toggle-group">
                      <button
                        type="button"
                        className={`reverse-op-toggle-btn ${(inputs.op || '+') === '+' ? 'active' : ''}`}
                        onClick={() => handleInputChange('op', '+')}
                        disabled={isQuestionAnswered}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className={`reverse-op-toggle-btn ${(inputs.op || '+') === '-' ? 'active' : ''}`}
                        onClick={() => handleInputChange('op', '-')}
                        disabled={isQuestionAnswered}
                      >
                        −
                      </button>
                    </div>

                    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
                      <input
                        type="number"
                        className="reverse-input-num"
                        style={{ height: '40px', fontSize: '1.1rem' }}
                        placeholder="num2"
                        value={inputs.n2 || ''}
                        onChange={(e) => handleInputChange('n2', e.target.value)}
                        disabled={isQuestionAnswered}
                      />
                      <div style={{ height: '2px', background: '#ccc' }} />
                      <input
                        type="number"
                        className="reverse-input-num"
                        style={{ height: '40px', fontSize: '1.1rem' }}
                        placeholder="den2"
                        value={inputs.d2 || ''}
                        onChange={(e) => handleInputChange('d2', e.target.value)}
                        disabled={isQuestionAnswered}
                      />
                    </div>

                    <span className="reverse-equals-sign">=</span>
                    <span className="reverse-target-badge" style={{ margin: 0, padding: '8px 18px', fontSize: '1.2rem' }}>
                      {problem.target}
                    </span>
                  </>
                )}

                {problem.topic === 'linear-equations' && (
                  <>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="a1"
                      value={inputs.a1 || ''}
                      onChange={(e) => handleInputChange('a1', e.target.value)}
                      disabled={isQuestionAnswered}
                    />
                    <span className="reverse-equals-sign">x +</span>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="b1"
                      value={inputs.b1 || ''}
                      onChange={(e) => handleInputChange('b1', e.target.value)}
                      disabled={isQuestionAnswered}
                    />
                    <span className="reverse-equals-sign">=</span>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="a2"
                      value={inputs.a2 || ''}
                      onChange={(e) => handleInputChange('a2', e.target.value)}
                      disabled={isQuestionAnswered}
                    />
                    <span className="reverse-equals-sign">x +</span>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="b2"
                      value={inputs.b2 || ''}
                      onChange={(e) => handleInputChange('b2', e.target.value)}
                      disabled={isQuestionAnswered}
                    />
                  </>
                )}

                {problem.topic === 'quadratic-equations' && (
                  <>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="a"
                      value={inputs.a || '1'}
                      onChange={(e) => handleInputChange('a', e.target.value)}
                      disabled={isQuestionAnswered}
                    />
                    <span className="reverse-equals-sign">x² +</span>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="b"
                      value={inputs.b || ''}
                      onChange={(e) => handleInputChange('b', e.target.value)}
                      disabled={isQuestionAnswered}
                    />
                    <span className="reverse-equals-sign">x +</span>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="c"
                      value={inputs.c || ''}
                      onChange={(e) => handleInputChange('c', e.target.value)}
                      disabled={isQuestionAnswered}
                    />
                    <span className="reverse-equals-sign">= 0</span>
                  </>
                )}

                {problem.topic === 'big-four' && (
                  <>
                    <span className="reverse-equals-sign" style={{ fontSize: '1.6rem', fontWeight: 800 }}>(</span>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="a"
                      value={inputs.a || ''}
                      onChange={(e) => handleInputChange('a', e.target.value)}
                      disabled={isQuestionAnswered}
                    />
                    <div className="reverse-op-toggle-group">
                      {['+', '−', '×', '÷'].map((op) => (
                        <button
                          key={op}
                          type="button"
                          className={`reverse-op-toggle-btn ${(inputs.op1 || '+') === op ? 'active' : ''}`}
                          onClick={() => handleInputChange('op1', op)}
                          disabled={isQuestionAnswered}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="b"
                      value={inputs.b || ''}
                      onChange={(e) => handleInputChange('b', e.target.value)}
                      disabled={isQuestionAnswered}
                    />
                    <span className="reverse-equals-sign" style={{ fontSize: '1.6rem', fontWeight: 800 }}>)</span>
                    <div className="reverse-op-toggle-group">
                      {['+', '−', '×', '÷'].map((op) => (
                        <button
                          key={op}
                          type="button"
                          className={`reverse-op-toggle-btn ${(inputs.op2 || '×') === op ? 'active' : ''}`}
                          onClick={() => handleInputChange('op2', op)}
                          disabled={isQuestionAnswered}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="c"
                      value={inputs.c || ''}
                      onChange={(e) => handleInputChange('c', e.target.value)}
                      disabled={isQuestionAnswered}
                    />
                    <span className="reverse-equals-sign">=</span>
                    <span className="reverse-target-badge" style={{ margin: 0, padding: '8px 18px', fontSize: '1.2rem' }}>
                      {problem.target}
                    </span>
                  </>
                )}
              </div>

              {/* ACTIONS */}
              <div className="reverse-action-group">
                {!isQuestionAnswered ? (
                  <>
                    <button className="reverse-check-btn" onClick={submitAnswer} disabled={loading}>
                      {loading ? 'Checking...' : 'Check Construction ✓'}
                    </button>

                    {attemptsCount >= 1 && result && result.creativity < 5 && hintsRemaining > 0 && hintLevel < 3 && (
                      <button className="reverse-hint-trigger-btn" onClick={useHint}>
                        {getHintButtonLabel()}
                      </button>
                    )}

                    <button className="reverse-skip-btn" onClick={skipQuestion} title="Skip this question (0 stars)">
                      Skip Question ⏭️
                    </button>
                  </>
                ) : (
                  <button className="reverse-next-btn" onClick={goToNextQuestion}>
                    {questionNumber < TOTAL_QUESTIONS_PER_SESSION ? 'Next Question ➔' : 'View Summary 🏆'}
                  </button>
                )}
              </div>

              {/* RESULT DISPLAY & FIRST TRY CONGRATULATIONS */}
              {result && (
                <div className={`reverse-result-modal ${result.correct ? 'correct' : 'incorrect'}`}>
                  {isFirstTryPerfect && (
                    <div className="reverse-congrats-banner">
                      🎉 CONGRATULATIONS! You earned 5 STARS (Exceptional) on your very FIRST TRY! Masterful thinking! 🏆
                    </div>
                  )}

                  {result.correct && (
                    <div className="reverse-stars">
                      {'⭐'.repeat(result.creativity || 1)}{' '}
                      <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        ({result.creativityLabel || 'Correct'})
                      </span>
                    </div>
                  )}
                  <div className="reverse-feedback-text">{result.feedback}</div>

                  {/* PROGRESSIVE HINT POPUP */}
                  {showHint && hintLevel > 0 && (
                    <div className="reverse-hint-popup">
                      <div className="reverse-hint-title">
                        💡 5-Star Strategy Hint — Level {hintLevel}/3 {hintLevel === 3 ? '(Direct Solution)' : ''}
                      </div>
                      <div className="reverse-hint-body">
                        {getHintTextForLevel()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* RECOMMENDATION ADVISORY POPUP MODAL */}
      {showRecommendationModal && (
        <div className="reverse-modal-overlay" onClick={() => setShowRecommendationModal(false)}>
          <div className="reverse-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="reverse-modal-header">
              <span className="reverse-modal-icon">💡</span>
              <h2 className="reverse-modal-title">Learning Recommendation</h2>
            </div>
            <div className="reverse-modal-body">
              <p>
                Welcome to <strong>Reverse Engineering Mode</strong>! In this module, you build math questions from given target answers.
              </p>
              <p style={{ marginTop: '12px', background: 'rgba(255,255,255,0.06)', padding: '12px', borderRadius: '10px' }}>
                📌 <strong>Advice</strong>: It is recommended to first complete the basic topic modules (e.g. Addition, Multiplication, Algebra) to build procedural fluency before constructing questions here.
                <br /><br />
                📝 <strong>Pro-Tip</strong>: Keep a pen & paper handy! Things get delightfully brain-heavy as you craft creative equations 🧠⚡
              </p>
              <p style={{ marginTop: '12px', fontSize: '0.92rem', opacity: 0.85 }}>
                <em>Note: This is only a friendly recommendation. There are no restrictions—feel free to explore and challenge yourself anytime!</em>
              </p>
            </div>
            <div className="reverse-modal-footer">
              <button className="reverse-modal-close-btn" onClick={() => setShowRecommendationModal(false)}>
                Got it! Let's Explore 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE DEMO WALKTHROUGH MODAL */}
      {activeDemoData && currentDemoStep && (
        <div className="reverse-modal-overlay" onClick={closeDemo}>
          <div className="reverse-demo-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="reverse-demo-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.8rem' }}>{activeDemoData.icon}</span>
                <h2 className="reverse-modal-title" style={{ fontSize: '1.3rem' }}>
                  {activeDemoData.topicName} Walkthrough
                </h2>
              </div>
              <button className="reverse-demo-close-x" onClick={closeDemo}>✕</button>
            </div>

            <div className="reverse-demo-stepper-bar">
              {activeDemoData.steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`reverse-demo-step-dot ${idx === demoStepIndex ? 'active' : idx < demoStepIndex ? 'completed' : ''}`}
                  onClick={() => setDemoStepIndex(idx)}
                >
                  {idx + 1}
                </div>
              ))}
            </div>

            <div className="reverse-demo-step-title">{currentDemoStep.stepTitle}</div>
            <div className="reverse-demo-step-desc">{currentDemoStep.description}</div>

            {/* PREVIEW ANIMATED BOX */}
            <div className="reverse-demo-preview-box">
              {currentDemoStep.preview.display && (
                <div className="reverse-demo-target-badge">🎯 {currentDemoStep.preview.display}</div>
              )}

              {currentDemoStep.preview.expression && (
                <div className="reverse-demo-expression">
                  <code>{currentDemoStep.preview.expression}</code>
                </div>
              )}

              {currentDemoStep.preview.stars && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '1.6rem' }}>{'⭐'.repeat(currentDemoStep.preview.stars)}</div>
                  <div style={{ color: '#48bb78', fontWeight: 700, marginTop: '4px' }}>
                    {currentDemoStep.preview.feedback}
                  </div>
                </div>
              )}
            </div>

            <div className="reverse-demo-tip-banner">
              {currentDemoStep.tip}
            </div>

            <div className="reverse-demo-modal-footer">
              <button
                className="reverse-next-btn"
                onClick={() => setDemoStepIndex((prev) => Math.max(0, prev - 1))}
                disabled={demoStepIndex === 0}
                style={{ opacity: demoStepIndex === 0 ? 0.4 : 1 }}
              >
                ← Back
              </button>

              {demoStepIndex < activeDemoData.steps.length - 1 ? (
                <button
                  className="reverse-check-btn"
                  onClick={() => setDemoStepIndex((prev) => Math.min(activeDemoData.steps.length - 1, prev + 1))}
                >
                  Next Step →
                </button>
              ) : (
                <button
                  className="reverse-start-btn"
                  style={{ margin: 0, padding: '12px 24px', fontSize: '1rem' }}
                  onClick={() => startChallengeFromDemo(activeDemoData.topicId)}
                >
                  Try It Yourself 🚀
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5-STAR CELEBRATION OVERLAY EFFECT */}
      {showCelebration && (
        <div className="reverse-celebration-overlay">
          {/* Confetti Particles */}
          {Array.from({ length: 45 }).map((_, i) => (
            <div
              key={i}
              className="reverse-confetti-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${2 + Math.random() * 1.5}s`,
                backgroundColor: ['#ff7e5f', '#feb47b', '#48bb78', '#4299e1', '#9f7aea', '#ed64a6', '#ecc94b'][i % 7]
              }}
            />
          ))}

          <div className="reverse-celebration-box">
            <div className="reverse-celebration-stars">⭐ ⭐ ⭐ ⭐ ⭐</div>
            <div className="reverse-celebration-title">EXCEPTIONAL! 🌟</div>
            <div className="reverse-celebration-subtitle">
              5-STAR CREATIVITY UNLOCKED!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
