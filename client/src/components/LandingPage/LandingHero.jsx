import React from 'react';

/**
 * LandingHero Component
 * Hero presentation introducing the Tenali platform with core value proposition,
 * quick action buttons, platform statistics, and clean mascot visual.
 * Conveys honest, grounded information in a humble tone.
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
            <span>Interactive Mathematics Practice & Drills</span>
          </div>

          <h1 className="hero-heading">
            Master Mathematics Through <span className="hero-highlight">Practice & Understanding</span>
          </h1>

          <p className="hero-description">
            Named after the witty scholar <strong>Tenali Raman</strong>, Tenali is an educational math tool developed at the Vicharanashala Lab for Education Design, IIT Ropar. Offering <strong>40+ practice modules</strong>, mental arithmetic drills, and step-by-step solutions, problems are generated on the fly with varied parameters to support conceptual understanding.
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
              <span className="hero-stat-label">Math Practice Topics</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-number">7</span>
              <span className="hero-stat-label">Arithmetic Gym Drills</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-number">100%</span>
              <span className="hero-stat-label">Free & Open Source</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-number">No Ads</span>
              <span className="hero-stat-label">Free for Everyone</span>
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
