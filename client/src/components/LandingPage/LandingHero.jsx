import React from 'react';

/**
 * LandingHero Component
 * Hero presentation introducing the Tenali platform with core value proposition,
 * quick action buttons, platform statistics, and animated mascot visual.
 */
export default function LandingHero({ onExplorePuzzles = () => {} }) {
  const scrollToDemo = () => {
    const el = document.getElementById('demo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="landing-hero">
      <div className="landing-hero-grid">
        {/* Left Column: Heading & Value Proposition */}
        <div className="hero-content-col">
          <div className="hero-pill-badge">
            <span className="hero-pill-sparkle">✨</span>
            <span>Intelligent, Adaptive Math & Reasoning Engine</span>
          </div>

          <h1 className="hero-heading">
            Master Mathematics Through <span className="hero-highlight">Play & Logic</span>
          </h1>

          <p className="hero-description">
            Named after the legendary wit <strong>Tenali Raman</strong>, Tenali turns math practice into an infinite adventure. With <strong>93+ algorithmic puzzle types</strong>, real-time adaptive difficulty, multiplayer duels, and visual concept labs, every problem is generated on the fly—ensuring practice is never repetitive.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="hero-btn-primary"
              onClick={onExplorePuzzles}
            >
              <span>🚀 Start Playing Now</span>
              <span aria-hidden="true">➔</span>
            </button>

            <button
              type="button"
              className="hero-btn-secondary"
              onClick={scrollToDemo}
            >
              <span>▶️ Watch Live Demo</span>
            </button>
          </div>

          {/* Stats Counters */}
          <div className="hero-stats-row">
            <div className="hero-stat-card">
              <span className="hero-stat-number">93+</span>
              <span className="hero-stat-label">Algorithmic Puzzles</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-number">69</span>
              <span className="hero-stat-label">Curriculum Topics</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-number">0</span>
              <span className="hero-stat-label">Repetition (Dynamic)</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-number">4 Bands</span>
              <span className="hero-stat-label">Real-Time Adaptivity</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Mascot & Floating Feature Badges */}
        <div className="landing-hero-visual">
          <div className="hero-mascot-container">
            <div className="hero-mascot-circle-bg" aria-hidden="true" />
            
            <img
              src="/tenali.png"
              alt="Tenali Raman - The Wit of Logic"
              className="hero-mascot-img"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />

            {/* Minimalist Floating Feature Badges */}
            <div className="hero-floating-card hero-floating-card-1">
              <span className="hero-floating-icon">⚔️</span>
              <div>
                <span className="hero-floating-text">Battle Arena</span>
                <span className="hero-floating-sub">Live 1v1 duels</span>
              </div>
            </div>

            <div className="hero-floating-card hero-floating-card-2">
              <span className="hero-floating-icon">🥇</span>
              <div>
                <span className="hero-floating-text">Gold Mastery</span>
                <span className="hero-floating-sub">Topic achievements</span>
              </div>
            </div>

            <div className="hero-floating-card hero-floating-card-3">
              <span className="hero-floating-icon">👾</span>
              <div>
                <span className="hero-floating-text">Misconceptions</span>
                <span className="hero-floating-sub">Guided solver cures</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
