import React from 'react';

const STEPS = [
  {
    step: '1',
    icon: '🌐',
    title: 'Explore & Discover',
    desc: 'Jump in instantly. Guest access works with zero setup, providing immediate access to all 40+ topic apps, Cambridge IGCSE chapters, and student tables.',
  },
  {
    step: '2',
    icon: '📐',
    title: 'Pick Your Focus',
    desc: 'Choose your desired area: fundamental arithmetic, algebraic equation solvers, geometric proofs, calculus, or targeted high-intensity Gym workouts.',
  },
  {
    step: '3',
    icon: '▶️',
    title: 'Dynamic Practice',
    desc: 'Tackle algorithmically synthesized questions. Every correct answer solidifies mastery, while one-tap step solvers clarify logic whenever you need guidance.',
  },
  {
    step: '4',
    icon: '📊',
    title: 'Measure & Master',
    desc: 'Review session analytics, speed rates (correct answers/minute), and accuracy trends to build confidence and complete conceptual fluency.',
  },
];

export default function WorkflowSection({ onExplorePuzzles = () => {} }) {
  return (
    <section className="landing-section landing-section-compact">
      <div className="section-header-center">
        <div className="section-tag">
          <span>🎯 How It Works</span>
        </div>
        <h2 className="section-title">The Four-Stage Learner Loop</h2>
        <p className="section-subtitle">
          A seamless, distraction-free progression designed to build competence and speed with every practice session.
        </p>
      </div>

      <div className="workflow-row">
        {STEPS.map((item) => (
          <div key={item.step} className="workflow-card">
            <span className="workflow-step-num">Stage {item.step}</span>
            <div className="workflow-icon">{item.icon}</div>
            <h3 className="workflow-title">{item.title}</h3>
            <p className="workflow-desc">{item.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <button
          type="button"
          className="hero-btn-primary"
          onClick={onExplorePuzzles}
        >
          <span>Get Started in 10 Seconds</span>
          <span aria-hidden="true">➔</span>
        </button>
      </div>
    </section>
  );
}
