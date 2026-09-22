import React from 'react';

const FEATURES = [
  {
    icon: '🧮',
    title: 'Infinite Algorithmic Generation',
    description: 'There is no static database of questions. Every single problem, polynomial, and matrix is synthesized on the fly with strict mathematical parameters, guaranteeing that no two practice sessions are ever identical.',
    tag: 'Zero Repetition',
    bg: 'rgba(232, 134, 74, 0.15)',
    border: 'rgba(232, 134, 74, 0.4)',
  },
  {
    icon: '📈',
    title: 'Real-Time Adaptive Difficulty',
    description: 'The engine continuously computes your adaptive mastery score (0 to 3) as you play. Score gains calibrate difficulty upwards through Easy, Medium, Hard, and Extra-Hard, ensuring learners are always in their flow zone.',
    tag: 'Dynamic Calibration',
    bg: 'rgba(92, 184, 122, 0.15)',
    border: 'rgba(92, 184, 122, 0.4)',
  },
  {
    icon: '🪜',
    title: 'Progressive Pedagogical Flow',
    description: 'Rooted in modern learning science: Understand → Interact → Discover → Practice → Test. Complex concepts are gently unlocked step by step to eliminate cognitive overload before formal assessment begins.',
    tag: 'Concept Grounding',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
  },
  {
    icon: '⚔️',
    title: 'Live Multiplayer Battle Arena',
    description: 'Engage in synchronized fastest-finger math duels with peers in real time via Socket.IO. Two contenders solve side-by-side; first correct answer claims the round with instant streak multipliers.',
    tag: 'Socket.IO Multiplayer',
    bg: 'rgba(224, 90, 74, 0.15)',
    border: 'rgba(224, 90, 74, 0.4)',
  },
  {
    icon: '👾',
    title: 'Misconception Monster Healing',
    description: 'Slips and mistakes aren’t punished—they are diagnosed. Tenali’s misconception engine classifies error patterns into collectible monsters, providing targeted guided solvers to cure reasoning traps permanently.',
    tag: 'Gamified Diagnostic',
    bg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.4)',
  },
  {
    icon: '🔬',
    title: 'Visual Labs & 50+ Language Code Sandbox',
    description: 'Tactile SVG grids, Three.js 3D net-folding geometry models, and an in-browser code runner supporting 50+ programming languages bridging pure mathematical concepts to computer science.',
    tag: 'Multi-Disciplinary',
    bg: 'rgba(236, 72, 153, 0.15)',
    border: 'rgba(236, 72, 153, 0.4)',
  },
];

export default function FeaturesOverview() {
  return (
    <section id="features" className="landing-section">
      <div className="section-header-center">
        <div className="section-tag">
          <span>⚡ Platform Capabilities</span>
        </div>
        <h2 className="section-title">Built for Deep Understanding & Delight</h2>
        <p className="section-subtitle">
          Tenali pairs rigorous mathematical algorithms with game mechanics and pedagogical insight, creating an engaging environment for learners of all ages.
        </p>
      </div>

      <div className="features-grid">
        {FEATURES.map((feat, idx) => (
          <div key={idx} className="feature-card">
            <div
              className="feature-icon-box"
              style={{ background: feat.bg, border: `1px solid ${feat.border}` }}
            >
              <span>{feat.icon}</span>
            </div>
            <h3 className="feature-card-title">{feat.title}</h3>
            <p className="feature-card-desc">{feat.description}</p>
            <span className="feature-card-tag">{feat.tag}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
