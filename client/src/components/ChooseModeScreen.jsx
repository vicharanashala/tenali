import React from 'react';
import LearningContainer from './LearningContainer';
import { KawaiiBee, KawaiiStar } from './TryItAssessment';
import './ChooseModeScreen.css';

/**
 * ChooseModeScreen
 * 
 * Reusable selection interface allowing students to choose between:
 * 1. Let's Learn! (Step-by-step concepts, examples, practice)
 * 2. Quiz Time! (Diagnostic jump straight to independent questions)
 *
 * @param {Object} props
 * @param {Function} props.onChooseLearning - Callback triggered when Learning Journey is selected
 * @param {Function} props.onChooseAssessment - Callback triggered when Assessment is selected
 * @param {boolean} props.learningCompleted - Whether the learning path has been fully completed
 */
export default function ChooseModeScreen({ onChooseLearning, onChooseAssessment, learningCompleted = false }) {
  return (
    <LearningContainer>
      <div className="choose-mode-wrapper">
        <h2 className="choose-mode-heading">Pick one to start!</h2>

        <div className="choose-mode-options">
          {/* Card 1: Let's Learn! */}
          <div 
            className={`choose-mode-card learning${learningCompleted ? ' completed' : ''}`}
            onClick={onChooseLearning}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChooseLearning(); } }}
          >
            <div className={`choose-mode-mascot-container${learningCompleted ? '' : ' animate'}`}>
              <div className="choose-mode-mascot-backdrop">
                <KawaiiBee size={80} />
              </div>
            </div>
            <h3 className="choose-mode-title">Let's Learn!</h3>
            <p className="choose-mode-desc">
              {learningCompleted ? 'Completed — click to replay' : 'We\'ll learn together, step by step!'}
            </p>
            <button className="choose-mode-button lets-go" tabIndex={-1}>{learningCompleted ? 'Replay' : 'Let\'s Go!'}</button>
          </div>

          {/* Card 2: Quiz Time! */}
          <div 
            className={`choose-mode-card quiz${learningCompleted ? ' highlighted' : ''}`}
            onClick={onChooseAssessment}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChooseAssessment(); } }}
          >
            <div className={`choose-mode-mascot-container${learningCompleted ? ' animate' : ' static'}`}>
              <div className="choose-mode-mascot-backdrop">
                <KawaiiStar size={52} />
              </div>
            </div>
            <h3 className="choose-mode-title">Quiz Time!</h3>
            <p className="choose-mode-desc">
              Show what you already know!
            </p>
            <button className="choose-mode-button lets-play" tabIndex={-1}>Let's Play!</button>
          </div>
        </div>
      </div>
    </LearningContainer>
  );
}
