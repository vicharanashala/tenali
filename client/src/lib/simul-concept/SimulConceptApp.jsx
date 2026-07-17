import React, { useState, useEffect } from 'react';
import Stage1Predict from './Stage1Predict';
import Stage2Grid from './Stage2Grid';
import Stage3Precision from './Stage3Precision';
import Stage4Elimination from './Stage4Elimination';
import Stage5Cases from './Stage5Cases';
import CompletionScreen from '../concept/CompletionScreen';

// Get or create anonymous learner ID
const getLearnerId = () => {
  let id = localStorage.getItem('tenali_learner_id');
  if (!id) {
    id = 'anon_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('tenali_learner_id', id);
  }
  return id;
};

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function SimulConceptApp({ onBack, SimulQuizApp }) {
  const [learnerId] = useState(getLearnerId());
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchState();
  }, [learnerId]);

  const fetchState = async () => {
    try {
      const res = await fetch(`${API}/api/concept-session/simul/state/${learnerId}`);
      if (!res.ok) throw new Error('Failed to fetch state');
      const data = await res.json();
      setState(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStageComplete = async (stageIndex, sessionData) => {
    // Optimistic UI update - instantly advance to next stage!
    setState(prev => ({
      ...prev,
      conceptReviewRung: stageIndex
    }));

    try {
      const res = await fetch(`${API}/api/concept-session/simul/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          learnerId,
          stageIndex,
          completedStages: [stageIndex],
          ...sessionData
        })
      });
      if (!res.ok) throw new Error('Failed to save session');
      const data = await res.json();
      
      // Update next review date if the server sent one
      if (data.nextConceptReviewDue) {
        setState(prev => ({
          ...prev,
          nextConceptReviewDue: data.nextConceptReviewDue
        }));
      }
    } catch (err) {
      console.error('Error saving session:', err);
    }
  };

  if (loading) return <div className="quiz-layout"><div className="welcome-box">Loading...</div></div>;
  if (error) return <div className="quiz-layout"><div className="welcome-box">Error: {error}</div></div>;

  const currentStage = state?.conceptReviewRung || 0;

  return (
    <div className="quiz-layout simul-concept">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div style={{ fontWeight: 'bold' }}>Simultaneous Equations: Concept Mastery</div>
        <div style={{ width: '60px' }}></div>
      </div>

      <div className="concept-container">
        {currentStage === 0 && <Stage1Predict onComplete={(data) => handleStageComplete(1, data)} />}
        {currentStage === 1 && <Stage2Grid onComplete={(data) => handleStageComplete(2, data)} />}
        {currentStage === 2 && (
          <Stage3Precision 
            initialGuess={state?.stage1Guess || {x: 0, y: 0}} 
            onComplete={(data) => handleStageComplete(3, data)} 
          />
        )}
        {currentStage === 3 && <Stage4Elimination onComplete={(data) => handleStageComplete(4, data)} />}
        {currentStage === 4 && <Stage5Cases onComplete={(data) => handleStageComplete(5, data)} />}
        
        {currentStage >= 5 && (
          <CompletionScreen onBack={onBack} nextReviewDue={state?.nextConceptReviewDue} QFormulaApp={SimulQuizApp} />
        )}
      </div>
    </div>
  );
}
