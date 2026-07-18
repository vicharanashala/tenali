import React from 'react';
import './LearningContainer.css';

/**
 * LearningContainer
 * 
 * Reusable layout shell for all Tenali Learning Framework (TLF) experiences.
 * Emphasizes maximum readability, consistent mobile/desktop spacing,
 * and handles base presentation layout without lesson/quiz business logic.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child elements to render under the placeholder
 */
export default function LearningContainer({ children }) {
  return (
    <div className="tlf-learning-container-wrapper">
      <div className="tlf-learning-container-inner">
        {children}
      </div>
    </div>
  );
}
