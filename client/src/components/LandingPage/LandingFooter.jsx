import React from 'react';

export default function LandingFooter({
  onExplorePuzzles = () => {},
  onSelectTopic = () => {},
}) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="footer-top-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <img
                src="/tenali.png"
                alt="Tenali Logo"
                className="footer-brand-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="footer-brand-title">Tenali</span>
            </div>

            <p className="footer-brand-desc">
              An intelligent, adaptive math learning platform pairing rigorous algorithmic question generation with real-time multiplayer duels, spatial manipulatives, and gamified error recovery.
            </p>

            <div className="footer-motto-quote">
              "Understand First. Test Later. Learn Better."
            </div>
          </div>

          {/* Quick Links Col */}
          <div>
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-link-btn" onClick={scrollToTop}>
                  🏠 Overview
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={onExplorePuzzles}>
                  🧩 Browse All 90+ Puzzles
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectTopic('learning_journey')}>
                  ⭐ Guided Learning Journey
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectTopic('battle')}>
                  ⚔️ Live Battle Arena
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectTopic('detective')}>
                  🔍 Math Detective Agency
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => window.dispatchEvent(new CustomEvent('tenali:openHall'))}
                >
                  👾 Hall of Silly Mistakes
                </button>
              </li>
            </ul>
          </div>

          {/* Domains Col */}
          <div>
            <h4 className="footer-col-title">Curriculum</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectTopic('addition')}>
                  🔢 Number Foundations
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectTopic('angles')}>
                  📐 Shape & Space (Geometry)
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectTopic('lineareq')}>
                  🔣 Algebra & Functions
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectTopic('percent')}>
                  🛒 Everyday Maths & Finance
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectTopic('diff')}>
                  📈 Calculus & Advanced
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectTopic('sudoku')}>
                  🎲 Logic Puzzles & Games
                </button>
              </li>
            </ul>
          </div>

          {/* Community & Open Source Col */}
          <div>
            <h4 className="footer-col-title">Community</h4>
            <ul className="footer-links-list">
              <li>
                <a
                  href="https://github.com/vicharanashala/tenali"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link-btn"
                >
                  ⭐ GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/vicharanashala/tenali/blob/main/CONTRIBUTORS.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link-btn"
                >
                  👥 Contributors (40+)
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/vicharanashala/tenali/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link-btn"
                >
                  📜 MIT Open Source License
                </a>
              </li>
              <li>
                <a
                  href="https://tenali.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link-btn"
                >
                  🌐 Live: tenali.fun
                </a>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => {
                    const el = document.getElementById('demo');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  ▶️ Interactive Application Demo
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div>
            © 2026 Tenali Platform. Built for curious learners everywhere.
          </div>

          <div className="footer-badges-strip">
            <span className="footer-mini-badge">React 19</span>
            <span className="footer-mini-badge">Vite 8</span>
            <span className="footer-mini-badge">Socket.IO</span>
            <span className="footer-mini-badge">Three.js</span>
            <span className="footer-mini-badge">Framer Motion</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
