import React, { useState } from 'react';
import './ReverseEngineeringApp.css';

const TOPICS = [
  { id: 'addition', name: 'Addition', icon: '➕', desc: 'Construct a sum that equals the target' },
  { id: 'multiplication', name: 'Multiplication', icon: '✖️', desc: 'Construct a product that equals the target' },
  { id: 'fractions', name: 'Fractions', icon: '🍕', desc: 'Construct a fraction operation equaling the target' },
  { id: 'linear-equations', name: 'Linear Equations', icon: '📈', desc: 'Construct an equation with a specific x solution' },
  { id: 'quadratic-equations', name: 'Quadratics', icon: '📐', desc: 'Construct a quadratic given its roots' },
  { id: 'geometry', name: 'Geometry Area', icon: '⏹️', desc: 'Construct rectangle dimensions for a target area' }
];

const DIFFICULTIES = [
  { level: 0, label: 'Easy' },
  { level: 1, label: 'Medium' },
  { level: 2, label: 'Hard' },
  { level: 3, label: 'Extra Hard' }
];

export default function ReverseEngineeringApp({ onBack }) {
  const [selectedTopic, setSelectedTopic] = useState('addition');
  const [difficulty, setDifficulty] = useState(0);
  const [inChallenge, setInChallenge] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(true);

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

  const fetchQuestion = async (topic, diff) => {
    setLoading(true);
    setResult(null);
    setAttemptsCount(0);
    setHintLevel(0);
    setShowHint(false);
    setInputs({});
    try {
      const res = await fetch(`/reverse-api/question?topic=${topic}&difficulty=${diff}`);
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
    if (t === 'addition' || t === 'multiplication' || t === 'geometry') {
      setInputs({ a: '', b: '', w: '', h: '' });
    } else if (t === 'fractions') {
      setInputs({ n1: '', d1: '', op: '+', n2: '', d2: '' });
    } else if (t === 'linear-equations') {
      setInputs({ a1: '', b1: '', a2: '', b2: '' });
    } else if (t === 'quadratic-equations') {
      setInputs({ a: '1', b: '', c: '' });
    }
  };

  const startChallenge = () => {
    setInChallenge(true);
    setHintsRemaining(3);
    fetchQuestion(selectedTopic, difficulty);
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
    if (!problem) return;
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
          construction: inputs
        })
      });
      const data = await res.json();
      setResult(data);

      if (data.correct) {
        const topicStats = stats[problem.topic] || { attempts: 0, bestCreativity: 0, completed: 0 };
        const updated = {
          ...stats,
          [problem.topic]: {
            attempts: topicStats.attempts + 1,
            completed: topicStats.completed + 1,
            bestCreativity: Math.max(topicStats.bestCreativity || 0, data.creativity || 1)
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

  const topicStat = stats[selectedTopic] || { completed: 0, bestCreativity: 0 };
  const isFirstTryPerfect = result && result.correct && result.creativity === 5 && attemptsCount === 1;

  // Determine hint text for current level
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

  return (
    <div className="reverse-app-container">
      <div className="reverse-header">
        <button className="reverse-back-btn" onClick={inChallenge ? () => setInChallenge(false) : onBack}>
          ← {inChallenge ? 'Change Topic' : 'Main Menu'}
        </button>
        {inChallenge && (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="reverse-stat-badge" style={{ fontWeight: 600, opacity: 0.9 }}>
              💡 Hints Left: <strong style={{ color: '#feb47b' }}>{hintsRemaining}</strong>/3
            </div>
            <div className="reverse-stat-badge" style={{ fontWeight: 600, opacity: 0.9 }}>
              Best Rating: {'⭐'.repeat(topicStat.bestCreativity || 0) || 'None'}
            </div>
          </div>
        )}
      </div>

      {!inChallenge ? (
        /* SETUP SCREEN */
        <div>
          <div className="reverse-title-section">
            <h1>🔄 Reverse Engineering Mode</h1>
            <p className="reverse-subtitle">
              Given a mathematical answer, construct a valid problem or equation that produces it.
            </p>
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
              </div>
            ))}
          </div>

          <div className="reverse-diff-selector">
            <span className="reverse-diff-label">Select Difficulty Level:</span>
            <div className="reverse-diff-buttons">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.level}
                  className={`reverse-diff-btn ${difficulty === d.level ? 'active' : ''}`}
                  onClick={() => setDifficulty(d.level)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button className="reverse-start-btn" onClick={startChallenge}>
            Start Challenge 🚀
          </button>
        </div>
      ) : (
        /* CHALLENGE SCREEN */
        <div className="reverse-challenge-card">
          {loading && !problem ? (
            <p>Loading problem challenge...</p>
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
                {(problem.topic === 'addition' || problem.topic === 'multiplication') && (
                  <>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="?"
                      value={inputs.a || ''}
                      onChange={(e) => handleInputChange('a', e.target.value)}
                    />
                    <span className="reverse-equals-sign">
                      {problem.topic === 'addition' ? '+' : '×'}
                    </span>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="?"
                      value={inputs.b || ''}
                      onChange={(e) => handleInputChange('b', e.target.value)}
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
                    />
                    <span className="reverse-equals-sign">×</span>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="Height"
                      value={inputs.h || ''}
                      onChange={(e) => handleInputChange('h', e.target.value)}
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
                      />
                      <div style={{ height: '2px', background: '#ccc' }} />
                      <input
                        type="number"
                        className="reverse-input-num"
                        style={{ height: '40px', fontSize: '1.1rem' }}
                        placeholder="den1"
                        value={inputs.d1 || ''}
                        onChange={(e) => handleInputChange('d1', e.target.value)}
                      />
                    </div>

                    <div className="reverse-op-toggle-group">
                      <button
                        type="button"
                        className={`reverse-op-toggle-btn ${(inputs.op || '+') === '+' ? 'active' : ''}`}
                        onClick={() => handleInputChange('op', '+')}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className={`reverse-op-toggle-btn ${(inputs.op || '+') === '-' ? 'active' : ''}`}
                        onClick={() => handleInputChange('op', '-')}
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
                      />
                      <div style={{ height: '2px', background: '#ccc' }} />
                      <input
                        type="number"
                        className="reverse-input-num"
                        style={{ height: '40px', fontSize: '1.1rem' }}
                        placeholder="den2"
                        value={inputs.d2 || ''}
                        onChange={(e) => handleInputChange('d2', e.target.value)}
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
                    />
                    <span className="reverse-equals-sign">x +</span>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="b1"
                      value={inputs.b1 || ''}
                      onChange={(e) => handleInputChange('b1', e.target.value)}
                    />
                    <span className="reverse-equals-sign">=</span>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="a2"
                      value={inputs.a2 || ''}
                      onChange={(e) => handleInputChange('a2', e.target.value)}
                    />
                    <span className="reverse-equals-sign">x +</span>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="b2"
                      value={inputs.b2 || ''}
                      onChange={(e) => handleInputChange('b2', e.target.value)}
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
                    />
                    <span className="reverse-equals-sign">x² +</span>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="b"
                      value={inputs.b || ''}
                      onChange={(e) => handleInputChange('b', e.target.value)}
                    />
                    <span className="reverse-equals-sign">x +</span>
                    <input
                      type="number"
                      className="reverse-input-num"
                      placeholder="c"
                      value={inputs.c || ''}
                      onChange={(e) => handleInputChange('c', e.target.value)}
                    />
                    <span className="reverse-equals-sign">= 0</span>
                  </>
                )}
              </div>

              {/* ACTIONS */}
              <div className="reverse-action-group">
                <button className="reverse-check-btn" onClick={submitAnswer} disabled={loading}>
                  {loading ? 'Checking...' : 'Check Construction ✓'}
                </button>

                {attemptsCount >= 1 && result && result.creativity < 5 && hintsRemaining > 0 && hintLevel < 3 && (
                  <button className="reverse-hint-trigger-btn" onClick={useHint}>
                    {getHintButtonLabel()}
                  </button>
                )}

                <button
                  className="reverse-next-btn"
                  onClick={() => fetchQuestion(selectedTopic, difficulty)}
                >
                  New Target ⟳
                </button>
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
    </div>
  );
}
