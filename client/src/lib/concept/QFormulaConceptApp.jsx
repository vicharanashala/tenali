import React, { useState, useEffect } from 'react';
import Stage1Predict from './Stage1Predict';
import Stage2Derivation from './Stage2Derivation';
import Stage3Guided from './Stage3Guided';
import Stage4Independent from './Stage4Independent';
import Stage5Review from './Stage5Review';
import CompletionScreen from './CompletionScreen';


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

export default function QFormulaConceptApp({ onBack, QFormulaApp }) {
  const [learnerId] = useState(getLearnerId());
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchState();
  }, [learnerId]);

  const fetchState = async () => {
    try {
      const res = await fetch(`${API}/api/concept-session/qformula/state/${learnerId}`);
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
      const res = await fetch(`${API}/api/concept-session/qformula/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          learnerId,
          stageIndex,
          completedStages: [stageIndex], // Prevent backend TypeError
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
      // Optionally handle error visually
    }
  };

  if (loading) return <div className="quiz-layout"><div className="welcome-box">Loading...</div></div>;
  if (error) return <div className="quiz-layout"><div className="welcome-box">Error: {error}</div></div>;

  const currentStage = state.conceptReviewRung || 0;
  const isDue = state.nextConceptReviewDue ? new Date() >= new Date(state.nextConceptReviewDue) : true;

  // BKT mastery derived from stage progress (5 stages total: 0-4)
  const totalStages = 5;
  const mastery = Math.min(1, (currentStage / totalStages) + 0.04); // +0.04 so stage 0 shows ~4% rather than 0%

  return (
    <div className="quiz-layout qformula-concept">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontWeight: 'bold' }}>Quadratic Formula: Concept Mastery</div>
        </div>
        <div style={{ width: '60px' }}></div>
      </div>

      <div className="concept-container">
        {currentStage === 0 && <Stage1Predict onComplete={(data) => handleStageComplete(1, data)} />}
        {currentStage === 1 && <Stage2Derivation onComplete={(data) => handleStageComplete(2, data)} />}
        {currentStage === 2 && <Stage3Guided onComplete={(data) => handleStageComplete(3, data)} />}
        {currentStage === 3 && <Stage4Independent onComplete={(data) => handleStageComplete(4, data)} />}
        
        {/* If they are at stage 4 (completed independent), they do Spaced Review or Finish */}
        {currentStage >= 4 && (
          <CompletionScreen onBack={onBack} nextReviewDue={state.nextConceptReviewDue} QFormulaApp={QFormulaApp} />
        )}
      </div>
    </div>
  );
}
