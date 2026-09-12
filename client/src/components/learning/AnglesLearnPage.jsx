import React, { useState, useEffect } from 'react';
import { getLearnContent } from '../../data/learnContent.js';
import DragAngle from './DragAngle';
import AngleChallenge from './AngleChallenge';
import AngleDetective from './AngleDetective';
import LearningVisual from '../LearningVisual';
import './angles-learn.css';

const AngleTypesInteractive = ({ onComplete }) => {
  const [revealed, setRevealed] = useState({ acute: false, right: false, obtuse: false });

  const handleReveal = (type) => {
    setRevealed(prev => {
      const next = { ...prev, [type]: true };
      if (next.acute && next.right && next.obtuse) {
        if (onComplete) setTimeout(onComplete, 500);
      }
      return next;
    });
  };

  return (
    <div className="types-interactive-grid">
      <div className={`type-card ${revealed.acute ? 'revealed' : ''}`} onClick={() => handleReveal('acute')}>
        <div className="type-label">Acute</div>
        <div className="type-icon">
          {revealed.acute ? (
            <svg width="60" height="60" viewBox="0 0 100 100" style={{ overflow: 'visible', strokeLinecap: 'round' }}>
              <line x1="10" y1="80" x2="90" y2="80" stroke="#333" strokeWidth="4" />
              <line x1="10" y1="80" x2="60" y2="20" stroke="#333" strokeWidth="4" />
              <path d="M 40 80 A 30 30 0 0 0 35 50" fill="none" stroke="#48BB78" strokeWidth="4" />
              <text x="45" y="65" fontSize="16" fill="#48BB78" fontWeight="800">&lt; 90°</text>
            </svg>
          ) : '?'}
        </div>
      </div>
      
      <div className={`type-card ${revealed.right ? 'revealed' : ''}`} onClick={() => handleReveal('right')}>
        <div className="type-label">Right</div>
        <div className="type-icon">
          {revealed.right ? (
            <svg width="60" height="60" viewBox="0 0 100 100" style={{ overflow: 'visible', strokeLinecap: 'round' }}>
              <line x1="20" y1="80" x2="90" y2="80" stroke="#333" strokeWidth="4" />
              <line x1="20" y1="80" x2="20" y2="10" stroke="#333" strokeWidth="4" />
              <polyline points="20,60 40,60 40,80" fill="none" stroke="#3182CE" strokeWidth="4" />
              <text x="45" y="45" fontSize="16" fill="#3182CE" fontWeight="800">90°</text>
            </svg>
          ) : '?'}
        </div>
      </div>

      <div className={`type-card ${revealed.obtuse ? 'revealed' : ''}`} onClick={() => handleReveal('obtuse')}>
        <div className="type-label">Obtuse</div>
        <div className="type-icon">
          {revealed.obtuse ? (
            <svg width="80" height="60" viewBox="0 0 120 100" style={{ overflow: 'visible', strokeLinecap: 'round' }}>
              <line x1="50" y1="80" x2="110" y2="80" stroke="#333" strokeWidth="4" />
              <line x1="50" y1="80" x2="20" y2="30" stroke="#333" strokeWidth="4" />
              <path d="M 75 80 A 25 25 0 0 0 35 55" fill="none" stroke="#FF7E67" strokeWidth="4" />
              <text x="50" y="50" fontSize="16" fill="#FF7E67" fontWeight="800">&gt; 90°</text>
            </svg>
          ) : '?'}
        </div>
      </div>
    </div>
  );
};

const AnglesLearnPage = ({ onStartTest, onBack }) => {
  const [learnData, setLearnData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Max 5

  useEffect(() => {
    setLoading(true);
    setError(false);
    getLearnContent('angles', 'Angles')
      .then(data => {
        setLearnData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load angles learn data:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const completeStep = (stepIndex) => {
    if (currentStep <= stepIndex) {
      setCurrentStep(stepIndex + 1);
      if (stepIndex + 1 === 5) { // Reached the end
        try {
          localStorage.setItem('tenali_angles_learned', 'true');
        } catch { /* localStorage unavailable */ }
      }
    }
  };

  const renderContent = (contentStr) => {
    return { 
      __html: contentStr
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/•/g, '<span style="display: inline-block; transform: scale(1.2); margin-right: 8px;">👉</span>') 
    };
  };

  if (loading) {
    return (
      <div className="angles-learn-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Loading learning content...</h2>
      </div>
    );
  }

  if (error || !learnData) {
    return (
      <div className="angles-learn-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Unable to load this lesson.</h2>
        <button onClick={() => window.location.reload()} className="btn-large btn-test" style={{ marginTop: '20px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="angles-learn-container fade-in">
      <div className="angles-learn-header">
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <button onClick={onBack} style={{ padding: '10px 20px', borderRadius: '25px', fontWeight: 'bold', border: '2px solid rgba(0,0,0,0.1)', background: 'white', color: 'var(--clr-text)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '1.2rem' }}>🏠</span> Back to Home
          </button>
        </div>
        <h1>{learnData.title}</h1>
        <p>📖 Let's PLAY with angles before the test!</p>
      </div>

      {/* STEP 0: What is an Angle? */}
      <div className={`learn-step-card ${currentStep < 0 ? 'locked' : ''}`}>
        <div className="step-number">1</div>
        <div className="learn-step-title">{learnData.blocks[0].icon} {learnData.blocks[0].title}</div>
        
        <DragAngle onInteract={() => completeStep(0)} />

        {currentStep >= 1 && (
          <div className="learn-step-content fade-in" style={{ marginTop: '30px' }} dangerouslySetInnerHTML={renderContent(learnData.blocks[0].content)} />
        )}
      </div>

      {/* STEP 1: Types of Angles */}
      {currentStep >= 1 && (
        <div className={`learn-step-card fade-in ${currentStep < 1 ? 'locked' : ''}`}>
          <div className="step-number">2</div>
          <div className="learn-step-title">{learnData.blocks[1].icon} {learnData.blocks[1].title}</div>
          
          <div className="instruction-badge" style={{ textAlign: 'center', display: 'inline-block' }}>🔎 Tap the cards to discover!</div>
          <AngleTypesInteractive onComplete={() => completeStep(1)} />

          {currentStep >= 2 && (
            <div className="learn-step-content fade-in" style={{ marginTop: '30px' }} dangerouslySetInnerHTML={renderContent(learnData.blocks[1].content)} />
          )}
        </div>
      )}

      {/* STEP 2: Find 90 Challenge */}
      {currentStep >= 2 && (
        <div className={`learn-step-card fade-in ${currentStep < 2 ? 'locked' : ''}`}>
          <div className="step-number">3</div>
          <div className="learn-step-title">🎯 Challenge Time!</div>
          
          <AngleChallenge onComplete={() => completeStep(2)} />
        </div>
      )}

      {/* STEP 3: Angle Rules & Pitfalls (Blocks 2, 3, 4) */}
      {currentStep >= 3 && (
        <div className={`learn-step-card fade-in ${currentStep < 3 ? 'locked' : ''}`}>
          <div className="step-number">4</div>
          <div className="learn-step-title">{learnData.blocks[2].icon} Rules & Examples</div>
          
          <div className="learn-step-content" dangerouslySetInnerHTML={renderContent(learnData.blocks[2].content)} />
          <LearningVisual visual="straight-line" />
          
          <div style={{ height: '20px' }}></div>
          
          <div className="learn-step-title" style={{ fontSize: '1.4rem' }}>{learnData.blocks[3].icon} {learnData.blocks[3].title}</div>
          <div className="learn-step-content" dangerouslySetInnerHTML={renderContent(learnData.blocks[3].content)} />
          <LearningVisual visual="worked-example" />

          <div style={{ height: '20px' }}></div>

          <div className="learn-step-title" style={{ fontSize: '1.4rem', color: '#E53E3E' }}>{learnData.blocks[4].icon} {learnData.blocks[4].title}</div>
          <div className="learn-step-content" dangerouslySetInnerHTML={renderContent(learnData.blocks[4].content)} />
          <LearningVisual visual="pitfall" />

          {currentStep === 3 && (
            <button className="btn-large btn-test" style={{ marginTop: '20px', width: '100%', background: 'var(--clr-accent)', color: 'white' }} onClick={() => completeStep(3)}>
              Got it! What's next?
            </button>
          )}
        </div>
      )}

      {/* STEP 4: Angle Detective */}
      {currentStep >= 4 && (
        <div className={`learn-step-card fade-in ${currentStep < 4 ? 'locked' : ''}`}>
          <div className="step-number">5</div>
          <div className="learn-step-title">🔍 Angle Detective</div>
          
          <div className="instruction-badge" style={{ textAlign: 'center', display: 'inline-block' }}>Find the angles in real life!</div>
          <AngleDetective onComplete={() => completeStep(4)} />
        </div>
      )}

      {/* STEP 5: Completion */}
      {currentStep >= 5 && (
        <div className="learn-step-card completion-card fade-in">
          <h2>🎉 You Did It!</h2>
          <p>You've completed the Angles lesson.</p>
          
          <div className="completion-actions">
            <button className="btn-test" style={{ padding: '10px 24px', fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px', border: '2px solid var(--clr-border, #edf2f7)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={onStartTest}>
              🎯 Start Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnglesLearnPage;
