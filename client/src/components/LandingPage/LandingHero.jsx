import React from 'react';

/**
 * LandingHero Component
 * Hero presentation introducing the Tenali platform with core value proposition,
 * quick action buttons, platform statistics, and clean mascot visual.
 * Cleaned up with no pop-up cards obscuring Tenali.
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
            Named after the legendary wit <strong>Tenali Raman</strong>, Tenali turns math practice into an interactive adventure. With <strong>40+ algorithmic practice apps</strong>, high-intensity Gym workouts, and dynamic step solvers, every problem is synthesized on the fly—ensuring practice is never repetitive.
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
              <span className="hero-stat-number">40+</span>
              <span className="hero-stat-label">Algorithmic Puzzles</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-number">7</span>
              <span className="hero-stat-label">Adaptive Gym Drills</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-number">0</span>
              <span className="hero-stat-label">Repetition (Dynamic)</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-number">100%</span>
              <span className="hero-stat-label">Free & Open Source</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Mascot (Clean with no overlapping cards) */}
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
          </div>
        </div>
      </div>
    </section>
  );
}
