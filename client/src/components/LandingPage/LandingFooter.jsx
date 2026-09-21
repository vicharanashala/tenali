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
              An intelligent, adaptive mathematics learning platform pairing rigorous algorithmic question generation with Cambridge IGCSE curriculum chapters, high-intensity gym drills, and step-by-step solvers.
            </p>

            <div className="footer-motto-quote">
              "Understand First. Test Later. Learn Better."
            </div>

            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: '#fff', borderRadius: 6, padding: '4px 8px', display: 'inline-flex' }}>
                <img src="/iit-ropar-logo.png" alt="IIT Ropar" style={{ height: 28, width: 'auto' }} />
              </div>
              <div style={{ background: '#fff', borderRadius: 6, padding: '4px 8px', display: 'inline-flex' }}>
                <img src="/vicharanashala-logo.png" alt="Vicharanashala" style={{ height: 28, width: 'auto' }} />
              </div>
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
                  🧩 Browse All 40+ Puzzles
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectTopic('gym')}>
                  ⚡ Adaptive Gym Workouts
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectTopic('randommix')}>
                  🎲 Random Mixed Quiz
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectTopic('custom')}>
                  🎛️ Custom Lesson Builder
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => onSelectTopic('trackProgress')}
                >
                  📊 Progress & Speed Tracker
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
                  📈 Calculus & Higher Maths
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectTopic('matrix')}>
                  🧮 Matrices & Determinants
                </button>
              </li>
            </ul>
          </div>

          {/* Community & Institutional Credits Col */}
          <div>
            <h4 className="footer-col-title">Research & Lab</h4>
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
                  href="https://vicharanashala.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link-btn"
                >
                  🧪 Vicharanashala Lab (VLED)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div>
            A product of <strong>Vicharanashala Lab for Education Design</strong>, an educational research lab at the <strong>Indian Institute of Technology Ropar</strong>. &copy; {new Date().getFullYear()} Vicharanashala, IIT Ropar. All rights reserved.
          </div>

          <div className="footer-badges-strip">
            <span className="footer-mini-badge">React 19</span>
            <span className="footer-mini-badge">Vite 8</span>
            <span className="footer-mini-badge">Recharts</span>
            <span className="footer-mini-badge">Algorithmic Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
