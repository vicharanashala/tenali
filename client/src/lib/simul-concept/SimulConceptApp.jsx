import React, { useState, useEffect, useCallback } from 'react';
import Stage1Predict from './Stage1Predict';
import Stage2Grid from './Stage2Grid';
import Stage3Precision from './Stage3Precision';
import Stage4Elimination from './Stage4Elimination';
import Stage5Cases from './Stage5Cases';
import CompletionScreen from '../concept/CompletionScreen';
import { fetchConceptState, saveConceptStage, startConceptReview } from '../concept/conceptApi';
import { reportScoreEvent } from '../scoreApi';

const SKILL_ID = 'simul';

export default function SimulConceptApp({ onBack, SimulQuizApp }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Initial load. State is only touched after the await, so the effect body
  // itself performs no synchronous setState, and a unmount mid-flight is a
  // no-op rather than a warning.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchConceptState(SKILL_ID);
        if (!cancelled) setState(next);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const retryLoad = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setState(await fetchConceptState(SKILL_ID));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStageComplete = async (stageIndex, sessionData) => {
    setSaving(true);
    setError(null);
    try {
      reportScoreEvent({ type: 'quiz_correct', difficulty: 'medium', module: 'SimulConcept' });
      setState(await saveConceptStage(SKILL_ID, stageIndex, sessionData));
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleStartReview = async () => {
    setSaving(true);
    setError(null);
    try {
      setState(await startConceptReview(SKILL_ID));
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="quiz-layout"><div className="welcome-box">Loading your progress...</div></div>;
  }

  if (error && !state) {
    return (
      <div className="quiz-layout">
        <div className="welcome-box">
          <h3>{error.isAuthError ? 'Please log in' : 'Could not load your progress'}</h3>
          <p>{error.isAuthError
            ? 'Your session has expired. Log in again to pick up where you left off.'
            : error.message}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            {!error.isAuthError && <button className="primary-btn" onClick={retryLoad}>Try again</button>}
            <button className="secondary-btn" onClick={onBack}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  const currentStage = state.currentStage || 0;
  const stageCount = state.stageCount || 5;

  return (
    <div className="quiz-layout simul-concept">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div style={{ fontWeight: 'bold' }}>Simultaneous Equations: Concept Mastery</div>
        <div style={{ width: '60px' }}></div>
      </div>

      {state.persisted === false && (
        <div className="welcome-box" style={{ marginBottom: '1rem' }}>
          Working offline: your progress will not be saved this session.
        </div>
      )}

      {error && (
        <div className="welcome-box" style={{ marginBottom: '1rem' }}>
          <strong>{error.isAuthError ? 'Session expired.' : 'Could not save that stage.'}</strong>{' '}
          {error.isAuthError ? 'Log in again to save your progress.' : error.message}
        </div>
      )}

      <div className="concept-container" aria-busy={saving}>
        {currentStage === 0 && <Stage1Predict onComplete={(d) => handleStageComplete(1, d)} />}
        {currentStage === 1 && <Stage2Grid onComplete={(d) => handleStageComplete(2, d)} />}
        {currentStage === 2 && (
          <Stage3Precision
            initialGuess={state.stage1Guess || { x: 0, y: 0 }}
            onComplete={(d) => handleStageComplete(3, d)}
          />
        )}
        {currentStage === 3 && <Stage4Elimination onComplete={(d) => handleStageComplete(4, d)} />}
        {currentStage === 4 && <Stage5Cases onComplete={(d) => handleStageComplete(5, d)} />}

        {currentStage >= stageCount && (
          <CompletionScreen
            onBack={onBack}
            nextReviewDue={state.nextConceptReviewDue}
            isSpacedReplayDue={state.isSpacedReplayDue}
            onStartReview={handleStartReview}
            mastery={state.mastery}
            PracticeApp={SimulQuizApp}
          />
        )}
      </div>
    </div>
  );
}
