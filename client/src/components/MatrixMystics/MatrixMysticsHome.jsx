import React from 'react';
import './MatrixMysticsHome.css';

const MATRIX_MYSTICS_STUDIOS = [
  {
    key: 'point-studio',
    stage: 'Stage 01',
    phase: 'Dimension 0',
    title: 'Point Studio',
    icon: '📍',
    subtitle: 'Visual Intuition: From Physical Spot to Pure Location',
    formula: '0D • (x, y)',
    description: 'Explore dimension zero: discover why a mathematical point has position but no size, contrast physical marks with pure coordinates, and build the foundation of spatial geometry.',
    stepCount: '11 Inquiries',
    color: '#f59e0b',
  },
  {
    key: 'line-studio',
    stage: 'Stage 02',
    phase: 'Dimension 1',
    title: 'Line Studio',
    icon: '📏',
    subtitle: 'Embodied Geometry: Straight Paths & Steepness',
    formula: '1D • y = ax + b',
    description: 'Plot points and dynamic guidelines on interactive GeoGebra canvases to uncover the invariant slope ratio (Δy / Δx), intercept behavior, and the straight line rule.',
    stepCount: '10 Steps',
    color: '#0d9488',
  },
  {
    key: 'dimension-studio',
    stage: 'Stage 03',
    phase: 'Coordinate Worlds',
    title: 'Dimension Studio',
    icon: '🌌',
    subtitle: 'Understanding ℝ, ℝ², ℝ³, and ℝⁿ: The Worlds Where Math Lives',
    formula: 'ℝ • ℝ² • ℝ³ • ℝⁿ',
    description: 'Journey through Cartesian products (S × P), continuous number lines, 2D planes, and 3D space, climbing the dimensional ladder up to abstract n-dimensional spaces.',
    stepCount: '14 Steps',
    color: '#d97706',
  },
  {
    key: 'function-studio',
    stage: 'Stage 04',
    phase: 'Transformations',
    title: 'Function Studio',
    icon: '⚡',
    subtitle: 'Rules Beyond the Line: The One-Input-One-Output Pattern',
    formula: 'f(x) = ax + b',
    description: 'Investigate curves, absolute values, and vertical-line checks. Discover why valid functions require exactly one output per input, and transition to formal f(x) notation.',
    stepCount: '8 Questions',
    color: '#8b5cf6',
  },
  {
    key: 'inverse-studio',
    stage: 'Stage 05',
    phase: 'Reversibility',
    title: 'Inverse Studio',
    icon: '🔄',
    subtitle: 'Undoing the Rule: Output to Input in 1D & 2D',
    formula: 'f⁻¹(y) = x',
    description: 'Master reversible mathematical thinking: determine originating inputs from known outputs, evaluate multi-variable inverse queries, and uncover inverse rule mappings.',
    stepCount: '10 Stages',
    color: '#ea580c',
  },
  {
    key: 'matrix-studio',
    stage: 'Stage 06',
    phase: 'Linear Systems',
    title: 'Matrix Studio',
    icon: '📐',
    subtitle: 'From Functions to Matrices: The Simultaneous Machine Ax = b',
    formula: 'Ax = b',
    description: 'Unify multi-variable transformations ℝ² → ℝ² with simultaneous equations, discovering matrices as unified linear operator machines evaluated point by point.',
    stepCount: '9 Challenges',
    color: '#6366f1',
  },
  {
    key: 'kernel',
    stage: 'Stage 07',
    phase: 'Equilibrium & Null Space',
    title: 'The Zero Balance',
    icon: '⚖️',
    subtitle: 'Null Space & Equilibrium Discovery in 2D & 3D',
    formula: 'Ax = 0',
    description: 'Interact with tactile vector weights to balance outputs back to zero, discovering non-trivial null spaces and proving that equilibrium forms infinite linear subspaces.',
    stepCount: '3 Equilibrium Labs',
    color: '#06b6d4',
  },
];

export default function MatrixMysticsHome({ onSelect, theme = 'dark', toggleTheme = () => {} }) {
  return (
    <div className="mm-container" data-theme={theme}>
      {/* Background ambient lighting */}
      <div className="mm-ambient-bg" aria-hidden="true">
        <div className="mm-glow-orb-1" />
        <div className="mm-glow-orb-2" />
      </div>

      {/* Top Header / Branding */}
      <header className="mm-topbar">
        <div className="mm-brand">
          <div className="mm-brand-icon">📐</div>
          <span className="mm-brand-text">Matrix Mystics</span>
        </div>

        <button
          className="mm-theme-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </header>

      {/* Hero Presentation */}
      <section className="mm-hero">
        <div className="mm-pill-badge">
          <span>✨</span> Linear Algebra Inquiry Curriculum
        </div>
        <h1 className="mm-hero-title">
          Matrix <span>Mystics</span>
        </h1>
        <p className="mm-hero-subtitle">
          An interactive, inquiry-first learning journey through the foundations of Linear Algebra.
          Discover mathematical structures organically through tactile visual canvases before formal notation is introduced.
        </p>
      </section>

      {/* Progression Roadmap Ladder */}
      <div className="mm-roadmap-bar">
        <div className="mm-roadmap-title">Pedagogical Learning Progression</div>
        <div className="mm-roadmap-steps">
          {MATRIX_MYSTICS_STUDIOS.map((studio, idx) => (
            <React.Fragment key={studio.key}>
              <button
                className="mm-step-node"
                onClick={() => onSelect(studio.key)}
                title={`Open ${studio.title}`}
              >
                <span className="mm-step-badge">{studio.phase}</span>
                <span className="mm-step-label">{studio.title.replace(' Studio', '')}</span>
              </button>
              {idx < MATRIX_MYSTICS_STUDIOS.length - 1 && (
                <span className="mm-step-arrow" aria-hidden="true">➔</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Curriculum Grid */}
      <main className="mm-grid-container">
        <div className="mm-section-header">
          <h2 className="mm-section-title">Interactive Studios</h2>
          <span className="mm-count-badge">7 Progressive Learning Modules</span>
        </div>

        <div className="mm-cards-grid">
          {MATRIX_MYSTICS_STUDIOS.map((studio) => (
            <div
              key={studio.key}
              className="mm-studio-card"
              onClick={() => onSelect(studio.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(studio.key);
                }
              }}
            >
              <div>
                <div className="mm-card-top-row">
                  <span className="mm-stage-pill">{studio.stage}</span>
                  <span className="mm-formula-pill">{studio.formula}</span>
                </div>

                <h3 className="mm-card-title">
                  <span>{studio.icon}</span> {studio.title}
                </h3>
                <div className="mm-card-subtitle">{studio.subtitle}</div>
                <p className="mm-card-desc">{studio.description}</p>
              </div>

              <div className="mm-card-bottom">
                <span className="mm-step-count">{studio.stepCount}</span>
                <div className="mm-launch-btn">
                  Launch Studio <span>➔</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="mm-footer">
        <div>Matrix Mystics · Embodied Mathematical Learning</div>
        <div>Inquiry-first discovery studios from 0D point to Ax = b & Null Space</div>
      </footer>
    </div>
  );
}
