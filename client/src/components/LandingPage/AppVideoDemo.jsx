import React, { useState, useEffect } from 'react';

/**
 * AppVideoDemo Component
 * Interactive simulated demo player allowing visitors to experience
 * Tenali's real-time problem answering, dynamic feedback, adaptive score
 * adjustments, and step-by-step hint reveals. Zero external dependencies.
 */
export default function AppVideoDemo({ onSelectTopic = () => {} }) {
  const [activeTab, setActiveTab] = useState('sim'); // 'sim' | 'video'
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [adaptScore, setAdaptScore] = useState(1.65);
  const [hasVideo, setHasVideo] = useState(false);

  // Check if a demo video exists in public directory
  useEffect(() => {
    fetch('/demo.mp4', { method: 'HEAD' })
      .then((res) => {
        if (res.ok && res.headers.get('content-type')?.includes('video')) {
          setHasVideo(true);
        }
      })
      .catch(() => {
        setHasVideo(false);
      });
  }, []);

  const handleSelectAnswer = (optKey) => {
    if (isAnswered) return;
    setSelectedOption(optKey);
    setIsAnswered(true);

    if (optKey === 'B') {
      setAdaptScore((prev) => Math.min(3.0, +(prev + 0.35).toFixed(2)));
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
  };

  // Compute difficulty band label based on score
  const getDiffLabel = (score) => {
    if (score < 0.8) return 'Easy';
    if (score < 1.8) return 'Medium';
    if (score < 2.5) return 'Hard';
    return 'Extra-Hard';
  };

  return (
    <section id="demo" className="landing-section">
      <div className="section-header-center">
        <div className="section-tag">
          <span>▶️ Interactive Demo</span>
        </div>
        <h2 className="section-title">See Tenali in Action</h2>
        <p className="section-subtitle">
          Experience the real-time feedback loop: answer on-the-fly generated questions, watch difficulty calibrate dynamically, and inspect step-by-step explanations.
        </p>
      </div>

      <div className="demo-player-container">
        {/* Top Window Bar */}
        <div className="demo-player-topbar">
          <div className="demo-window-controls" aria-hidden="true">
            <span className="demo-window-dot demo-dot-red" />
            <span className="demo-window-dot demo-dot-yellow" />
            <span className="demo-window-dot demo-dot-green" />
          </div>

          <div className="demo-window-title">
            <span>🎮 Tenali Interactive Preview Player</span>
          </div>

          <div className="demo-mode-switcher">
            <button
              type="button"
              className={`demo-mode-btn ${activeTab === 'sim' ? 'active' : ''}`}
              onClick={() => setActiveTab('sim')}
            >
              Interactive Preview
            </button>
            {hasVideo && (
              <button
                type="button"
                className={`demo-mode-btn ${activeTab === 'video' ? 'active' : ''}`}
                onClick={() => setActiveTab('video')}
              >
                Video Reel
              </button>
            )}
          </div>
        </div>

        {/* Player Screen Content */}
        {activeTab === 'video' && hasVideo ? (
          <div style={{ padding: 16, background: '#000', display: 'flex', justifyContent: 'center' }}>
            <video
              controls
              autoPlay
              muted
              loop
              playsInline
              style={{ width: '100%', maxHeight: 520, borderRadius: 8 }}
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support HTML5 video.
            </video>
          </div>
        ) : (
          <div className="demo-screen-content">
            {/* Simulated Quiz Header */}
            <div className="sim-quiz-header">
              <div className="sim-topic-tag">
                <span>📐 Pythagoras' Theorem</span>
                <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>· Question 4 of 20</span>
              </div>

              <div className="sim-difficulty-meter">
                <span>
                  Difficulty: <strong>{getDiffLabel(adaptScore)}</strong> ({adaptScore.toFixed(2)})
                </span>
                <div className="sim-diff-bar-bg" title={`Adapt Score: ${adaptScore.toFixed(2)} / 3.0`}>
                  <div
                    className="sim-diff-bar-fill"
                    style={{ width: `${(adaptScore / 3.0) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Simulated Question */}
            <div className="sim-question-box">
              <p className="sim-question-prompt">
                In a right-angled triangle, the two shorter legs measure <strong>6 cm</strong> and <strong>8 cm</strong>. What is the length of the hypotenuse?
              </p>
              <div className="sim-question-formula">
                c² = a² + b²
              </div>
            </div>

            {/* Simulated Multiple Choice Options */}
            <div className="sim-options-grid">
              {[
                { key: 'A', text: '12 cm', correct: false },
                { key: 'B', text: '10 cm', correct: true },
                { key: 'C', text: '14 cm', correct: false },
                { key: 'D', text: '9 cm', correct: false },
              ].map((opt) => {
                const isSelected = selectedOption === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    className={`sim-option-btn ${
                      isSelected && opt.correct ? 'selected-correct' : ''
                    }`}
                    onClick={() => handleSelectAnswer(opt.key)}
                    disabled={isAnswered}
                    style={{
                      opacity: isAnswered && !opt.correct && !isSelected ? 0.45 : 1,
                      cursor: isAnswered ? 'default' : 'pointer',
                    }}
                  >
                    <span>
                      <strong style={{ marginRight: 8 }}>{opt.key}.</strong>
                      {opt.text}
                    </span>
                    {isAnswered && opt.correct && (
                      <span style={{ color: '#5cb87a' }}>✓ Correct</span>
                    )}
                    {isAnswered && isSelected && !opt.correct && (
                      <span style={{ color: '#e05a4a' }}>✗ Incorrect</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Feedback Banner */}
            {isAnswered && (
              <div className="sim-feedback-banner sim-feedback-correct">
                <div>
                  <strong>🎉 Brilliant reasoning!</strong>
                  <span style={{ marginLeft: 8, opacity: 0.9 }}>
                    +0.35 Adapt Score · Difficulty calibrated up! · Band: {getDiffLabel(adaptScore)}
                  </span>
                </div>
                <button
                  type="button"
                  className="demo-action-btn"
                  onClick={() => setShowHint(!showHint)}
                >
                  {showHint ? 'Hide Solution' : '💡 Inspect Step-by-Step Proof'}
                </button>
              </div>
            )}

            {/* Step-by-Step Explanation Box */}
            {showHint && (
              <div className="sim-hint-card">
                <strong style={{ color: 'var(--clr-accent)', display: 'block', marginBottom: 6 }}>
                  📐 Step-by-Step Tenali Raman Solution:
                </strong>
                <ol style={{ paddingLeft: 20, margin: 0, lineHeight: 1.6 }}>
                  <li>Apply the Pythagorean theorem: <code>c² = a² + b²</code></li>
                  <li>Substitute values: <code>c² = 6² + 8² = 36 + 64 = 100</code></li>
                  <li>Take the principal square root: <code>c = √100 = 10 cm</code>.</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Bottom Controller Bar */}
        <div className="demo-player-controls-bar">
          <div className="demo-ctrl-group">
            <button
              type="button"
              className="demo-action-btn"
              onClick={handleReset}
            >
              🔄 Reset Demo
            </button>
            <button
              type="button"
              className="demo-action-btn"
              onClick={() => setShowHint(!showHint)}
            >
              💡 {showHint ? 'Hide Explanation' : 'Show Explanation'}
            </button>
          </div>

          <div className="demo-ctrl-group">
            <button
              type="button"
              className="demo-action-btn primary"
              onClick={() => onSelectTopic('pythag')}
            >
              <span>Play Full Pythagoras Quiz</span>
              <span aria-hidden="true">➔</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
