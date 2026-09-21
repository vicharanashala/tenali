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
    icon: '⚡',
    title: 'Adaptive Gym & Speed Drills',
    description: 'High-intensity workouts across 7 targeted gym modules (polynomials, dot products, fractions, linear equations, indices, and decimals). Push mental agility with live speed and accuracy tracking.',
    tag: 'Mental Agility',
    bg: 'rgba(92, 184, 122, 0.15)',
    border: 'rgba(92, 184, 122, 0.4)',
  },
  {
    icon: '📖',
    title: 'Cambridge IGCSE Curriculum',
    description: '24 complete textbook chapters paired with 27 scaffolded concept bridge modules. Structured pathways transition learners seamlessly from elementary arithmetic to advanced secondary mathematics.',
    tag: '24 Full Chapters',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
  },
  {
    icon: '💡',
    title: 'Instant Step-by-Step Solvers',
    description: 'Never stay stuck. One-tap guided step-by-step explanations deconstruct solutions into transparent logical steps, showing intermediate factorizations, bracket operations, and algebraic substitutions.',
    tag: 'Guided Solvers',
    bg: 'rgba(224, 90, 74, 0.15)',
    border: 'rgba(224, 90, 74, 0.4)',
  },
  {
    icon: '🎛️',
    title: 'Custom Lessons & Random Mix',
    description: 'Tailor your own learning session. Select multiple specific topic apps to create a personalized mixed workout, or launch the adaptive Random Mix for comprehensive cross-topic revision.',
    tag: 'Personalized Practice',
    bg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.4)',
  },
  {
    icon: '📊',
    title: 'Session Analytics & Speed Graphs',
    description: 'Track long-term mastery with integrated accuracy and speed graphs. Visualize correct answers per minute and session-by-session historical performance curves.',
    tag: 'Data-Driven Progress',
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
          Tenali pairs rigorous mathematical algorithms with responsive pacing and pedagogical insight, creating an engaging environment for learners of all ages.
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
