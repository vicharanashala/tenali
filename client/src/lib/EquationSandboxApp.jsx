import React, { useState } from 'react';
import EquationSandbox from '../components/concept/EquationSandbox';
import { updateBKT } from '../bkt.js';
import confetti from 'canvas-confetti';

const LEVELS = [
  {
    id: 1,
    title: "Class 1: The Addition Bridge",
    classLevel: "Class 1",
    topic: "Basic Addition",
    description: "The star is across a gap at height 5. Build a flat bridge by typing an addition like y = 2 + 3",
    startPos: [-5, 6],
    stars: [{ x: 5, y: 5 }],
    skillId: 'sandbox_addition',
  },
  {
    id: 2,
    title: "Class 4: The Fraction Bridge",
    classLevel: "Class 4",
    topic: "Fractions & Decimals",
    description: "The star is at height 2.5. Build a bridge using fractions, like y = 5 / 2",
    startPos: [-4, 6],
    stars: [{ x: 4, y: 2.5 }],
    skillId: 'sandbox_fractions',
  },
  {
    id: 3,
    title: "Class 8: The Linear Slide",
    classLevel: "Class 8",
    topic: "Linear Equations",
    description: "Flat bridges won't work! Draw a slanted slide using algebra. Try y = -x + 3",
    startPos: [-5, 8],
    stars: [{ x: 0, y: 3 }, { x: 4, y: -1 }],
    skillId: 'sandbox_linear',
  },
  {
    id: 4,
    title: "Class 10: The Parabola Bowl",
    classLevel: "Class 10",
    topic: "Quadratic Equations",
    description: "Lines won't work here. Build a bowl using x^2 to catch the ball and roll it up.",
    startPos: [-4, 5],
    stars: [{ x: 0, y: 0 }, { x: 4, y: 3 }],
    skillId: 'sandbox_quadratic',
  },
  {
    id: 5,
    title: "Class 11: The Wave Rider",
    classLevel: "Class 11",
    topic: "Trigonometry",
    description: "The stars follow a wave pattern. Ride the wave using y = sin(x) * 2",
    startPos: [-6, 3],
    stars: [{ x: -4.7, y: 2 }, { x: -1.5, y: -2 }, { x: 1.5, y: 2 }, { x: 4.7, y: -2 }],
    skillId: 'sandbox_trig',
  }
];

export default function EquationSandboxApp({ user, onBack, initialAdaptScore = 0.5 }) {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [localAdaptScore, setLocalAdaptScore] = useState(initialAdaptScore);
  const [attemptsThisLevel, setAttemptsThisLevel] = useState(0);

  if (!selectedLevel) {
    return (
      <div style={{ padding: '30px', color: 'var(--clr-text)', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>The Universal Math Sandbox</h1>
        <p style={{ color: 'var(--clr-text-soft)', fontSize: '1.2rem', marginBottom: '30px' }}>
          From Class 1 Addition to Class 12 Calculus, everything is connected. Use the math you know to build bridges, slides, and waves to guide the ball to the stars. 
        </p>

        <div style={{ display: 'grid', gap: '20px' }}>
          {LEVELS.map(level => (
            <button
              key={level.id}
              onClick={() => {
                setSelectedLevel(level);
                setAttemptsThisLevel(0);
              }}
              style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'transform 0.2s, borderColor 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--clr-accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--clr-border)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--clr-accent)', fontWeight: 'bold', fontSize: '0.9rem' }}>{level.classLevel} &bull; {level.topic}</span>
                <span style={{ background: 'var(--clr-bg)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>Level {level.id}</span>
              </div>
              <h2 style={{ margin: '0', fontSize: '1.5rem', color: 'var(--clr-text)' }}>{level.title}</h2>
              <p style={{ margin: '0', color: 'var(--clr-text-soft)' }}>{level.description}</p>
            </button>
          ))}
        </div>

        <button 
          onClick={onBack} 
          style={{ marginTop: '30px', padding: '12px 24px', background: 'transparent', color: 'var(--clr-text)', border: '1px solid var(--clr-border)', borderRadius: '8px', cursor: 'pointer' }}
        >
          ← Return Home
        </button>
      </div>
    );
  }

  const handleAttempt = () => {
    setAttemptsThisLevel(a => a + 1);
  };

  const handleVictory = async (finalEquation) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Score based on how few attempts were needed (1 attempt = perfect, 10 attempts = flailing)
    const proxyScore = Math.max(0, 1 - (attemptsThisLevel / 10));
    
    // Update local BKT
    const nextScore = updateBKT(localAdaptScore, false, undefined, { proximityScore: proxyScore, attempts: attemptsThisLevel });
    setLocalAdaptScore(nextScore);

    // Save telemetry to backend
    try {
      await fetch('/api/concept-playgrounds/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          skillId: selectedLevel.skillId,
          classLevel: selectedLevel.classLevel,
          templateUsed: 'EquationSandbox',
          proximityScore: proxyScore,
          attempts: attemptsThisLevel,
          selfExplanationText: finalEquation,
          match: true
        })
      });
    } catch (e) {
      console.error("Failed to save attempt", e);
    }

    // Wait a moment then return to level select
    setTimeout(() => {
      setSelectedLevel(null);
    }, 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 100, background: 'var(--clr-bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: 'var(--clr-surface)', borderBottom: '1px solid var(--clr-border)' }}>
        <button onClick={() => setSelectedLevel(null)} style={{ background: 'transparent', border: 'none', color: 'var(--clr-text)', cursor: 'pointer', fontSize: '1rem' }}>
          ← Back
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>{selectedLevel.title}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft)' }}>{selectedLevel.description}</div>
        </div>
        <div style={{ width: '60px' }}></div> {/* Spacer for centering */}
      </div>
      
      <div style={{ flex: 1 }}>
        <EquationSandbox 
          levelConfig={selectedLevel} 
          onVictory={handleVictory} 
          onAttempt={handleAttempt} 
        />
      </div>
    </div>
  );
}
