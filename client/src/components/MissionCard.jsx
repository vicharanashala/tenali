import React, { useEffect, useState } from 'react';
import './MissionCard.css';
import LearningContainer from './LearningContainer';

/**
 * MissionCard Component
 * 
 * A reusable progress card for the Tenali Learning Framework (TLF).
 * Introduces today's adventure at the start of a lesson and reappears as a milestone.
 * Features an animation for newly completed checkboxes while keeping previously completed checks solid.
 *
 * @param {Object} props
 * @param {string} props.title - Title for the mission card
 * @param {Array<string>} props.items - List of mission items/activities
 * @param {Array<boolean>} props.completedStates - Completed states matching each item index
 * @param {Function} props.onContinue - Callback fired when pressing the CTA button
 * @param {string} props.buttonText - Text label for the CTA button
 */
export default function MissionCard({ 
  title, 
  items, 
  completedStates, 
  onContinue, 
  buttonText = "Start Mission" 
}) {
  const cacheKey = `tlf_mission_completed_${title.replace(/\s+/g, '_').toLowerCase()}`;

  // Read previously completed items on component mount
  const [previouslyCompleted] = useState(() => {
    if (completedStates.every(v => !v)) {
      sessionStorage.removeItem(cacheKey);
      return [];
    }
    try {
      const cached = sessionStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  // Track which indices are newly completed during this session mount
  const [animateIndices, setAnimateIndices] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000); // 5 seconds duration allows all particles to naturally fall off
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  useEffect(() => {
    const newAnimate = [];
    const updatedPreviouslyCompleted = [...previouslyCompleted];

    completedStates.forEach((isCompleted, idx) => {
      if (isCompleted) {
        if (!previouslyCompleted.includes(idx)) {
          newAnimate.push(idx);
          updatedPreviouslyCompleted.push(idx);
        }
      }
    });

    if (newAnimate.length > 0) {
      setAnimateIndices(newAnimate);
      sessionStorage.setItem(cacheKey, JSON.stringify(updatedPreviouslyCompleted));
      
      // Index 2 is Mission 3 ("Discover + and =")
      if (newAnimate.includes(2)) {
        setShowConfetti(true);
      }
    }
  }, [completedStates, previouslyCompleted, cacheKey]);

  return (
    <LearningContainer>
      <div className="tlf-mission-card-wrapper">
        <div className="tlf-mission-card">
          <h2 className="tlf-mission-card-title">{title}</h2>
          
          <div className="tlf-mission-items-list">
            {items.map((item, idx) => {
              const isCompleted = completedStates[idx];
              const shouldAnimate = animateIndices.includes(idx);
              
              return (
                <div 
                  key={idx} 
                  className={`tlf-mission-item-row${isCompleted ? ' completed' : ''}`}
                >
                  <div className="tlf-mission-checkbox-outer">
                    {isCompleted && (
                      <svg className="tlf-checkmark-svg" viewBox="0 0 24 24">
                        <path 
                          className={`tlf-checkmark-path${shouldAnimate ? ' animate' : ''}`}
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="tlf-mission-item-text">{item}</span>
                </div>
              );
            })}
          </div>

          <button className="tlf-mission-btn-continue" onClick={onContinue}>
            {buttonText}
          </button>
        </div>
      </div>
      {showConfetti && (
        <div className="tlf-confetti-container">
          {Array.from({ length: 50 }).map((_, idx) => {
            const colors = ['#F5C75D', '#FF9D42', '#5CB85C', '#5BC0DE', '#F06292'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const randomLeft = Math.random() * 100;
            const randomDelay = Math.random() * 1.5;
            const randomDuration = 2.0 + Math.random() * 1.0;
            const randomSize = 6 + Math.floor(Math.random() * 6);
            const randomRot = Math.random() * 360;
            return (
              <div
                key={idx}
                className="tlf-confetti-particle"
                style={{
                  backgroundColor: randomColor,
                  left: `${randomLeft}%`,
                  width: `${randomSize}px`,
                  height: `${randomSize * 1.2}px`,
                  animationDelay: `${randomDelay}s`,
                  animationDuration: `${randomDuration}s`,
                  transform: `rotate(${randomRot}deg)`
                }}
              />
            );
          })}
        </div>
      )}
    </LearningContainer>
  );
}
