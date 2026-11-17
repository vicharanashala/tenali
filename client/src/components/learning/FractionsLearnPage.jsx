import React, { useState, useEffect } from 'react';
import { getLearnContent } from '../../data/learnContent.js';
import FractionVisualizer from './FractionVisualizer';
import FractionPartsInteractive from './FractionPartsInteractive';
import FractionTypesInteractive from './FractionTypesInteractive';
import FractionChallenge from './FractionChallenge';
import FractionDetective from './FractionDetective';
import './fractions-learn.css';

/**
 * FractionsLearnPage — Interactive "Learn by Playing" orchestrator.
 *
 * Architecture mirrors AnglesLearnPage & GSTLearnPage:
 *   Step 0: What is a Fraction? → FractionVisualizer (shade pieces)
 *   Step 1: Numerator/Denominator → FractionPartsInteractive (build fraction)
 *   Step 2: Types of Fractions → FractionTypesInteractive (tap-to-discover)
 *   Step 3: Fraction Challenge → FractionChallenge (mini-quiz)
 *   Step 4: Real-World Detective → FractionDetective (real-world objects)
 *   Step 5: Completion → Start Test
 *
 * Theory text from fractions.json is revealed AFTER each interaction completes.
 */
const FractionsLearnPage = ({ onStartTest, onBack }) => {
  const [learnData, setLearnData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0..5 (5 = all done)

  useEffect(() => {
    setLoading(true);
    setError(false);
    getLearnContent('fractions', 'Fractions')
      .then(data => {
        setLearnData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load Fractions learn data:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const completeStep = (stepIndex) => {
    if (currentStep <= stepIndex) {
      setCurrentStep(stepIndex + 1);
    }
  };

  // Safe: HTML rendered via dangerouslySetInnerHTML originates from trusted local learnContent data, not user input.
  const renderContent = (contentStr) => {
    return {
      __html: contentStr
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/•/g, '<span style="display: inline-block; transform: scale(1.2); margin-right: 8px; color: #48BB78;">👉</span>')
    };
  };

  if (loading) {
    return (
      <div className="fractions-learn-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Loading learning content...</h2>
      </div>
    );
  }

  if (error || !learnData) {
    return (
      <div className="fractions-learn-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Unable to load this lesson.</h2>
        <button onClick={() => window.location.reload()} className="btn-large btn-test" style={{ marginTop: '20px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="fractions-learn-container fade-in">
      <div className="fractions-learn-header">
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <button onClick={onBack} style={{ padding: '10px 20px', borderRadius: '25px', fontWeight: 'bold', border: '2px solid rgba(0,0,0,0.1)', background: 'white', color: 'var(--clr-text)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            ← Back
          </button>
        </div>
        <h1>{learnData.title}</h1>
        <p>Understand fractions through play — interact to unlock the next step!</p>
      </div>

      {/* ─── STEP 0: What is a Fraction? ─── */}
      <div className="learn-step-card">
        <div className="step-number" style={{ background: '#3182CE' }}>1</div>
        <div className="learn-step-title">{learnData.blocks[0].icon} {learnData.blocks[0].title}</div>

        <FractionVisualizer onComplete={() => completeStep(0)} />

        {currentStep >= 1 && (
          <div className="learn-step-content fade-in" style={{ marginTop: '30px' }} dangerouslySetInnerHTML={renderContent(learnData.blocks[0].content)} />
        )}
      </div>

      {/* ─── STEP 1: Numerator & Denominator ─── */}
      {currentStep >= 1 && (
        <div className="learn-step-card fade-in">
          <div className="step-number" style={{ background: '#3182CE' }}>2</div>
          <div className="learn-step-title">{learnData.blocks[1].icon} {learnData.blocks[1].title}</div>

          <FractionPartsInteractive onComplete={() => completeStep(1)} />

          {currentStep >= 2 && (
            <div className="learn-step-content fade-in" style={{ marginTop: '30px' }} dangerouslySetInnerHTML={renderContent(learnData.blocks[1].content)} />
          )}
        </div>
      )}

      {/* ─── STEP 2: Types of Fractions ─── */}
      {currentStep >= 2 && (
        <div className="learn-step-card fade-in">
          <div className="step-number" style={{ background: '#3182CE' }}>3</div>
          <div className="learn-step-title">{learnData.blocks[2].icon} {learnData.blocks[2].title}</div>

          <div className="instruction-badge" style={{ textAlign: 'center', display: 'inline-block' }}>
            Tap to discover the Fraction Family!
          </div>
          <FractionTypesInteractive onComplete={() => completeStep(2)} />

          {currentStep >= 3 && (
            <div className="learn-step-content fade-in" style={{ marginTop: '30px' }} dangerouslySetInnerHTML={renderContent(learnData.blocks[2].content)} />
          )}
        </div>
      )}

      {/* ─── STEP 3: Fraction Challenge ─── */}
      {currentStep >= 3 && (
        <div className="learn-step-card fade-in">
          <div className="step-number" style={{ background: '#3182CE' }}>4</div>
          <div className="learn-step-title">{learnData.blocks[3].icon} {learnData.blocks[3].title}</div>

          <div className="instruction-badge" style={{ textAlign: 'center', display: 'inline-block' }}>
            Can you spot the bigger fraction?
          </div>
          <FractionChallenge onComplete={() => completeStep(3)} />

          {currentStep >= 4 && (
            <div className="learn-step-content fade-in" style={{ marginTop: '30px' }} dangerouslySetInnerHTML={renderContent(learnData.blocks[3].content)} />
          )}
        </div>
      )}

      {/* ─── STEP 4: Real-World Detective ─── */}
      {currentStep >= 4 && (
        <div className="learn-step-card fade-in">
          <div className="step-number" style={{ background: '#3182CE' }}>5</div>
          <div className="learn-step-title">{learnData.blocks[4].icon} {learnData.blocks[4].title}</div>

          <FractionDetective onComplete={() => completeStep(4)} />

          {currentStep >= 5 && (
            <div className="learn-step-content fade-in" style={{ marginTop: '30px' }} dangerouslySetInnerHTML={renderContent(learnData.blocks[4].content)} />
          )}
        </div>
      )}

      {/* ─── STEP 5: Completion ─── */}
      {currentStep >= 5 && (
        <div className="learn-step-card completion-card fade-in">
          <h2>🎉 You Did It!</h2>
          <p>You've explored how fractions work. Now let's see what you know!</p>

          <div className="completion-actions">
            <button className="btn-test" style={{ padding: '10px 24px', fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px', border: '2px solid var(--clr-border, #edf2f7)', cursor: 'pointer', fontFamily: 'inherit', color: '#3182CE' }} onClick={onStartTest}>
              🎯 Start Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FractionsLearnPage;
