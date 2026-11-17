import React, { useState, useEffect } from 'react';
import { getLearnContent } from '../../data/learnContent.js';
import GstPriceTag from './GstPriceTag';
import GstTypeDiscovery from './GstTypeDiscovery';
import GstRateExplorer from './GstRateExplorer';
import GstBillActivity from './GstBillActivity';
import GstChallenge from './GstChallenge';
import './gst-learn.css';

/**
 * GSTLearnPage — Interactive "Learn by Playing" orchestrator.
 *
 * Architecture mirrors AnglesLearnPage:
 *   Step 0: What is GST? → GstPriceTag (interactive slider)
 *   Step 1: CGST / SGST / IGST → GstTypeDiscovery (tap-to-discover cards)
 *   Step 2: Calculating GST → GstRateExplorer (pick product + rate)
 *   Step 3: Input Tax Credit → GstBillActivity (dual-slider ITC demo)
 *   Step 4: Common Mistakes → GstChallenge (mini quiz with pitfall feedback)
 *   Step 5: Completion → Start Test
 *
 * Each step unlocks only after the learner interacts with the current activity.
 * Theory text from gst.json is revealed AFTER the interaction completes.
 */
const GSTLearnPage = ({ onStartTest, onBack }) => {
  const [learnData, setLearnData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0..5 (5 = all done)

  useEffect(() => {
    setLoading(true);
    setError(false);
    getLearnContent('gst', 'GST')
      .then(data => {
        setLearnData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load GST learn data:", err);
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
        .replace(/•/g, '<span style="display: inline-block; transform: scale(1.2); margin-right: 8px;">👉</span>')
    };
  };

  if (loading) {
    return (
      <div className="gst-learn-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Loading learning content...</h2>
      </div>
    );
  }

  if (error || !learnData) {
    return (
      <div className="gst-learn-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Unable to load this lesson.</h2>
        <button onClick={() => window.location.reload()} className="btn-large btn-test" style={{ marginTop: '20px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="gst-learn-container fade-in">
      <div className="gst-learn-header">
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <button onClick={onBack} style={{ padding: '10px 20px', borderRadius: '25px', fontWeight: 'bold', border: '2px solid rgba(0,0,0,0.1)', background: 'white', color: 'var(--clr-text)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            ← Back
          </button>
        </div>
        <h1>{learnData.title}</h1>
        <p>Learn GST by doing — interact with each activity to unlock the next!</p>
      </div>

      {/* ─── STEP 0: What is GST? ─── */}
      <div className="learn-step-card">
        <div className="step-number">1</div>
        <div className="learn-step-title">{learnData.blocks[0].icon} {learnData.blocks[0].title}</div>

        <GstPriceTag onComplete={() => completeStep(0)} />

        {currentStep >= 1 && (
          <div className="learn-step-content fade-in" style={{ marginTop: '30px' }} dangerouslySetInnerHTML={renderContent(learnData.blocks[0].content)} />
        )}
      </div>

      {/* ─── STEP 1: CGST, SGST & IGST ─── */}
      {currentStep >= 1 && (
        <div className="learn-step-card fade-in">
          <div className="step-number">2</div>
          <div className="learn-step-title">{learnData.blocks[1].icon} {learnData.blocks[1].title}</div>

          <div className="instruction-badge" style={{ textAlign: 'center', display: 'inline-block' }}>
            Tap each transaction to discover the GST type!
          </div>
          <GstTypeDiscovery onComplete={() => completeStep(1)} />

          {currentStep >= 2 && (
            <div className="learn-step-content fade-in" style={{ marginTop: '30px' }} dangerouslySetInnerHTML={renderContent(learnData.blocks[1].content)} />
          )}
        </div>
      )}

      {/* ─── STEP 2: Calculating GST Amount ─── */}
      {currentStep >= 2 && (
        <div className="learn-step-card fade-in">
          <div className="step-number">3</div>
          <div className="learn-step-title">{learnData.blocks[2].icon} {learnData.blocks[2].title}</div>

          <GstRateExplorer onComplete={() => completeStep(2)} />

          {currentStep >= 3 && (
            <div className="learn-step-content fade-in" style={{ marginTop: '30px' }} dangerouslySetInnerHTML={renderContent(learnData.blocks[2].content)} />
          )}
        </div>
      )}

      {/* ─── STEP 3: Input Tax Credit ─── */}
      {currentStep >= 3 && (
        <div className="learn-step-card fade-in">
          <div className="step-number">4</div>
          <div className="learn-step-title">{learnData.blocks[3].icon} {learnData.blocks[3].title}</div>

          <GstBillActivity onComplete={() => completeStep(3)} />

          {currentStep >= 4 && (
            <div className="learn-step-content fade-in" style={{ marginTop: '30px' }} dangerouslySetInnerHTML={renderContent(learnData.blocks[3].content)} />
          )}
        </div>
      )}

      {/* ─── STEP 4: Common Mistakes — Challenge ─── */}
      {currentStep >= 4 && (
        <div className="learn-step-card fade-in">
          <div className="step-number">5</div>
          <div className="learn-step-title">{learnData.blocks[4].icon} Challenge: Avoid the Pitfalls!</div>

          <div className="instruction-badge" style={{ textAlign: 'center', display: 'inline-block' }}>
            Can you avoid the common GST mistakes?
          </div>
          <GstChallenge onComplete={() => completeStep(4)} />

          {currentStep >= 5 && (
            <div className="learn-step-content fade-in" style={{ marginTop: '30px' }} dangerouslySetInnerHTML={renderContent(learnData.blocks[4].content)} />
          )}
        </div>
      )}

      {/* ─── STEP 5: Completion ─── */}
      {currentStep >= 5 && (
        <div className="learn-step-card completion-card fade-in">
          <h2>🎉 You Did It!</h2>
          <p>You've completed the GST lesson.</p>

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

export default GSTLearnPage;
