import React, { useState } from 'react';

/**
 * LandingNavbar Component
 * Responsive glassmorphic navigation bar for Tenali.
 * Provides consistent access between the Landing Page and the full Puzzles view,
 * with integrated theme toggle, clean navigation links, and account notice modal.
 */
export default function LandingNavbar({
  currentView = 'landing',
  onViewChange = () => {},
  theme = 'dark',
  toggleTheme = () => {},
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuthNotice, setShowAuthNotice] = useState(false);

  const handleNavClick = (sectionId) => {
    setMobileOpen(false);
    if (sectionId === 'puzzles') {
      onViewChange('puzzles');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentView !== 'landing') {
      onViewChange('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleOpenAuth = () => {
    setMobileOpen(false);
    setShowAuthNotice(true);
  };

  return (
    <>
      <header className="landing-navbar">
        <div className="landing-navbar-inner">
          {/* Brand Group */}
          <button
            type="button"
            className="landing-nav-brand"
            onClick={() => handleNavClick('hero')}
            aria-label="Tenali Home"
          >
            <img
              src="/tenali.png"
              alt="Tenali Raman Mascot"
              className="landing-nav-logo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="landing-nav-title-group">
              <span className="landing-nav-title">Tenali</span>
              <span className="landing-nav-badge">v1.1 Adaptive</span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav aria-label="Main Navigation">
            <ul className="landing-nav-links">
              <li>
                <button
                  type="button"
                  className={`landing-nav-link-btn ${currentView === 'landing' ? 'active' : ''}`}
                  onClick={() => handleNavClick('hero')}
                >
                  🏠 Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`landing-nav-link-btn ${currentView === 'puzzles' ? 'active' : ''}`}
                  onClick={() => handleNavClick('puzzles')}
                >
                  🧩 All Puzzles
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="landing-nav-link-btn"
                  onClick={() => handleNavClick('showcase')}
                >
                  🖼️ Showcase
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="landing-nav-link-btn"
                  onClick={() => handleNavClick('demo')}
                >
                  ▶️ Live Demo
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="landing-nav-link-btn"
                  onClick={() => handleNavClick('features')}
                >
                  ⚡ Features
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="landing-nav-link-btn"
                  onClick={() => handleNavClick('curriculum')}
                >
                  📚 Curriculum
                </button>
              </li>
            </ul>
          </nav>

          {/* Right Actions: Theme Toggle, Account Menu, and Mobile Hamburger */}
          <div className="landing-nav-actions">
            <button
              type="button"
              className="landing-icon-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
              type="button"
              className="landing-icon-btn"
              onClick={handleOpenAuth}
              title="Account & Personalization"
              aria-label="Account"
            >
              👤
            </button>

            {/* Mobile hamburger toggle */}
            <button
              type="button"
              className="landing-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <div className={`landing-mobile-menu ${mobileOpen ? 'open' : ''}`}>
          <button
            type="button"
            className={`landing-nav-link-btn ${currentView === 'landing' ? 'active' : ''}`}
            onClick={() => handleNavClick('hero')}
          >
            🏠 Home
          </button>
          <button
            type="button"
            className={`landing-nav-link-btn ${currentView === 'puzzles' ? 'active' : ''}`}
            onClick={() => handleNavClick('puzzles')}
          >
            🧩 All Puzzles
          </button>
          <button
            type="button"
            className="landing-nav-link-btn"
            onClick={() => handleNavClick('showcase')}
          >
            🖼️ Feature Showcase
          </button>
          <button
            type="button"
            className="landing-nav-link-btn"
            onClick={() => handleNavClick('demo')}
          >
            ▶️ Interactive Demo
          </button>
          <button
            type="button"
            className="landing-nav-link-btn"
            onClick={() => handleNavClick('features')}
          >
            ⚡ Pedagogy & Features
          </button>
          <button
            type="button"
            className="landing-nav-link-btn"
            onClick={() => handleNavClick('curriculum')}
          >
            📚 Curriculum Domains
          </button>
          <button
            type="button"
            className="landing-nav-link-btn"
            style={{ marginTop: 8 }}
            onClick={handleOpenAuth}
          >
            👤 Account & Personalization
          </button>
        </div>
      </header>

      {/* Account & Personalization Notice Modal */}
      {showAuthNotice && (
        <div
          className="landing-modal-overlay"
          onClick={() => setShowAuthNotice(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <div
            className="landing-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="landing-modal-header">
              <span className="landing-modal-icon">👤</span>
              <div style={{ flex: 1 }}>
                <h3 id="auth-modal-title" className="landing-modal-title">
                  Account & Personalization
                </h3>
                <span className="landing-modal-badge">In Active Development 🚧</span>
              </div>
              <button
                type="button"
                className="landing-modal-close"
                onClick={() => setShowAuthNotice(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div className="landing-modal-body">
              <p>
                User accounts, progress saving, and personalized learning profiles are currently being developed.
              </p>
              <p style={{ marginTop: 12 }}>
                In the meantime, all <strong>40+ learning games and drills</strong> are completely unlocked, free, and available to practice right now with zero login required.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="hero-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setShowAuthNotice(false)}
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
