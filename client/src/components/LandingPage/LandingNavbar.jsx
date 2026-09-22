import React, { useState } from 'react';
import { useAccessibility } from '../../lib/AccessibilityProvider';

/**
 * LandingNavbar Component
 * Responsive glassmorphic navigation bar for Tenali.
 * Provides direct access between the Landing Page and the full Puzzles view,
 * with integrated theme toggle, accessibility settings, and account menu.
 */
export default function LandingNavbar({
  currentView = 'landing',
  onViewChange = () => {},
  theme = 'dark',
  toggleTheme = () => {},
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setIsOpen: setA11yOpen } = useAccessibility();

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
    window.dispatchEvent(new CustomEvent('tenali:openAuth'));
  };

  const handleOpenA11y = () => {
    setMobileOpen(false);
    if (setA11yOpen) {
      setA11yOpen(true);
    }
  };

  return (
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

        {/* Desktop Nav Links - Single Clean 'All Puzzles' Option */}
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

        {/* Right Actions: Theme Toggle, Settings (Gear), and Account Menu */}
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
            onClick={handleOpenA11y}
            title="Accessibility & Language Settings"
            aria-label="Settings"
          >
            ⚙️
          </button>

          <button
            type="button"
            className="landing-icon-btn"
            onClick={handleOpenAuth}
            title="Account & Login"
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
          className="landing-nav-link-btn"
          onClick={() => handleNavClick('hero')}
        >
          🏠 Home Overview
        </button>
        <button
          type="button"
          className="landing-nav-link-btn"
          onClick={() => handleNavClick('puzzles')}
        >
          🧩 All 90+ Puzzles & Games
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
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button
            type="button"
            className="landing-nav-link-btn"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={handleOpenA11y}
          >
            ⚙️ Settings
          </button>
          <button
            type="button"
            className="landing-nav-link-btn"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={handleOpenAuth}
          >
            👤 Account
          </button>
        </div>
      </div>
    </header>
  );
}
