import React from 'react';

/**
 * FeaturesOverview Component
 * Grounded presentation of the core educational capabilities present in Tenali.
 * Conveys honest, accurate, and humble information without exaggeration.
 */
const CAPABILITIES = [
  {
    id: 'algorithmic',
    icon: '🧮',
    tag: 'Dynamic Practice',
    title: 'Algorithmic Problem Generation',
    desc: 'Problems are generated algorithmically with varied numerical parameters rather than drawn from static lists. This helps learners focus on solving methods rather than memorizing answers.',
  },
  {
    id: 'hints',
    icon: '💡',
    tag: 'Step-by-Step Support',
    title: 'Guided Hints & Solutions',
    desc: 'When stuck on a problem, learners can reveal step-by-step explanations showing the intermediate steps, formulas, and reasoning needed to reach the solution.',
  },
  {
    id: 'gym',
    icon: '⚡',
    tag: 'Speed & Fluency',
    title: 'Mental Math & Arithmetic Gym',
    desc: 'Dedicated practice drills for foundational arithmetic, fractions, linear equations, polynomials, and index laws to help students build calculation fluency.',
  },
  {
    id: 'topics',
    icon: '📚',
    tag: 'Topic Coverage',
    title: '40+ School Mathematics Topics',
    desc: 'Organized topic modules spanning number basics, fractions, algebra, coordinate geometry, trigonometry, statistics, and introductory calculus.',
  },
  {
    id: 'custom',
    icon: '🎛️',
    tag: 'Flexible Practice',
    title: 'Custom Practice & Random Mix',
    desc: 'Choose specific topics to practice together in a personalized lesson, or use the Random Mix feature to test your problem-solving across multiple areas.',
  },
  {
    id: 'open',
    icon: '🏛️',
    tag: 'Community & Education',
    title: 'Free & Open-Source Initiative',
    desc: 'Developed as an educational initiative at the Vicharanashala Lab for Education Design, IIT Ropar. Openly accessible for all learners with zero fees or advertisements.',
  },
];

export default function FeaturesOverview() {
  return (
    <section id="features" className="landing-section">
      <div className="section-header-center">
        <div className="section-tag">
          <span>⚡ Platform Capabilities</span>
        </div>
        <h2 className="section-title">How Tenali Supports Your Math Practice</h2>
        <p className="section-subtitle">
          A clean, focused environment built to help students practice and understand mathematical concepts at their own pace.
        </p>
      </div>

      <div className="features-grid">
        {CAPABILITIES.map((feat) => (
          <div key={feat.id} className="feature-card">
            <div className="feature-card-header">
              <span className="feature-icon" aria-hidden="true">
                {feat.icon}
              </span>
              <span className="feature-tag">{feat.tag}</span>
            </div>
            <h3 className="feature-title">{feat.title}</h3>
            <p className="feature-desc">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
