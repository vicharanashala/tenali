import React, { useState, useEffect } from 'react';
import Stage1Intuition from './Stage1Intuition';
import Stage1bKinematics from './Stage1bKinematics';
import Stage1cFirstPrinciple from './Stage1cFirstPrinciple';
import Stage2PowerRule from './Stage2PowerRule';
import Stage3ChainRule from './Stage3ChainRule';
import Stage4ProductQuotient from './Stage4ProductQuotient';
import Stage5MixedSolver from './Stage5MixedSolver';
import Stage6TurningPoints from './Stage6TurningPoints';
import Stage7Optimization from './Stage7Optimization';
import Stage8Bridge from './Stage6Bridge';
import MasteryBadge from '../MasteryBadge';

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

export default function DiffConceptApp({ onBack, DiffApp }) {
  const [learnerId] = useState(getLearnerId());
  const [serverState, setServerState] = useState(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchState();
  }, [learnerId]);

  const fetchState = async () => {
    try {
      const res = await fetch(`${API}/api/concept-session/diff/state/${learnerId}`);
      if (!res.ok) throw new Error('Failed to fetch state');
      const data = await res.json();
      setServerState(data);
      if (data.isSpacedReplayDue) {
        setCurrentStage(100); // 100 = Replay Stage 1
      } else {
        setCurrentStage(0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStageComplete = async (stageIndex, sessionData) => {
    // Optimistic UI update
    setCurrentStage(stageIndex);

    try {
      let submitData = {
        learnerId,
        stageIndex,
        completedStages: [stageIndex],
        ...sessionData
      };

      if (stageIndex === 102) {
        // Finished spaced replay
        submitData.completedStages = [6];
        submitData.isSpacedReplay = true;
      } else if (stageIndex === 9) {
        // Finished initial flow (Stage 9 completion means they enter Stage 10 Bridge)
        submitData.completedStages = [10];
      }

      const res = await fetch(`${API}/api/concept-session/diff/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      if (!res.ok) throw new Error('Failed to save session');
      const data = await res.json();
      
      if (data.nextConceptReviewDue) {
        setServerState(prev => ({
          ...prev,
          nextConceptReviewDue: data.nextConceptReviewDue
        }));
      }
    } catch (err) {
      console.error('Error saving session:', err);
    }
  };

  const handleBack = () => {
    if (currentStage === 0 || currentStage === 100) {
      onBack();
    } else {
      setCurrentStage(currentStage - 1);
    }
  };

  if (loading) return <div className="quiz-layout"><div className="welcome-box">Loading...</div></div>;
  if (error) return <div className="quiz-layout"><div className="welcome-box">Error: {error}</div></div>;

  // BKT mastery derived from stage progress (10 stages: 0-9)
  const totalStages = 10;
  const effectiveStage = currentStage >= 100 ? 9 : currentStage; // spaced replay stages count as completed
  const mastery = Math.min(1, (effectiveStage / totalStages) + 0.02);

  return (
    <div className="quiz-layout diff-concept">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button className="back-btn" onClick={handleBack}>← Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontWeight: 'bold' }}>Differentiation: Concept Mastery</div>
          <MasteryBadge mastery={mastery} label="BKT" size={52} />
        </div>
        <div style={{ width: '60px' }}></div>
      </div>

      <div className="concept-container">
        {currentStage === 0 && <Stage1Intuition onComplete={(data) => handleStageComplete(1, data)} />}
        {currentStage === 1 && <Stage1bKinematics onComplete={(data) => handleStageComplete(2, data)} />}
        {currentStage === 2 && <Stage1cFirstPrinciple onComplete={(data) => handleStageComplete(3, data)} />}
        {currentStage === 3 && <Stage2PowerRule onComplete={(data) => handleStageComplete(4, data)} />}
        {currentStage === 4 && <Stage3ChainRule onComplete={(data) => handleStageComplete(5, data)} />}
        {currentStage === 5 && <Stage4ProductQuotient onComplete={(data) => handleStageComplete(6, data)} />}
        {currentStage === 6 && <Stage5MixedSolver onComplete={(data) => handleStageComplete(7, data)} />}
        {currentStage === 7 && <Stage6TurningPoints onComplete={(data) => handleStageComplete(8, data)} />}
        {currentStage === 8 && <Stage7Optimization onComplete={(data) => handleStageComplete(9, data)} />}
        {currentStage === 9 && <Stage8Bridge onBack={onBack} nextReviewDue={serverState?.nextConceptReviewDue} DiffApp={DiffApp} />}

        {/* Spaced Replay Sequence */}
        {currentStage === 100 && <Stage1Intuition onComplete={(data) => handleStageComplete(101, data)} isSpacedReplay={true} />}
        {currentStage === 101 && <Stage5MixedSolver onComplete={(data) => handleStageComplete(102, data)} isSpacedReplay={true} />}
        {currentStage === 102 && <Stage8Bridge onBack={onBack} nextReviewDue={serverState?.nextConceptReviewDue} DiffApp={DiffApp} />}
      </div>
    </div>
  );
}
