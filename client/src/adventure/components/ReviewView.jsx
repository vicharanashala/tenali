import React from 'react';
import { useAdventure } from '../context/AdventureContext';

export default function ReviewView() {
  const { state, startLevel, setView } = useAdventure();
  const { reviewData, resultData, session } = state;

  if (!reviewData) return null;

  // Use simple child-friendly labels for worlds that use the thoughts voice
  const isChildMode = session && session.useThoughts;

  const handleNext = () => {
    if (resultData && resultData.nextLevelId) {
      startLevel(resultData.nextLevelId);
    } else {
      setView('LEVEL_SELECT');
    }
  };

  return (
    <div className="adv-review-container">
      <div className="adv-card adv-review-card">

        <header className="adv-review-header">
          <span className="adv-review-badge">
            {isChildMode ? '📖 Let\'s Learn!' : '📖 Educational Review'}
          </span>
          <h2 className="adv-review-concept">{reviewData.conceptName}</h2>
        </header>

        {/* Definition */}
        <section className="adv-review-section">
          <h4 className="adv-review-section-title">
            {isChildMode ? '📘 What is it?' : '📘 Definition'}
          </h4>
          <p className="adv-review-text">{reviewData.definition}</p>
        </section>

        {/* Examples — always show, renamed simply */}
        {reviewData.workedExample && (
          <section className="adv-review-section">
            <h4 className="adv-review-section-title">
              {isChildMode ? '✏️ Examples' : '✍️ Worked Example'}
            </h4>
            <div className="adv-review-example-box">
              {reviewData.workedExample}
            </div>
          </section>
        )}

        {/* Common Mistakes — shown with friendlier title for children */}
        {reviewData.commonMistakes && (
          <section className="adv-review-section">
            <h4 className="adv-review-section-title">
              {isChildMode ? '⚠️ Watch Out!' : '⚠️ Common Mistakes'}
            </h4>
            <p className="adv-review-text">{reviewData.commonMistakes}</p>
          </section>
        )}

        {/* Fun Fact — always show */}
        {reviewData.funFact && (
          <section className="adv-review-section">
            <h4 className="adv-review-section-title">💡 Fun Fact</h4>
            <p className="adv-review-text italic">{reviewData.funFact}</p>
          </section>
        )}

        {/* Practice Question */}
        {reviewData.practiceQuestion && (
          <section className="adv-review-section">
            <h4 className="adv-review-section-title">
              {isChildMode ? '❓ Try This!' : '❓ Practice Question'}
            </h4>
            <div className="adv-review-practice-box">
              <p className="adv-practice-q">
                <strong>Q:</strong> {reviewData.practiceQuestion}
              </p>
              {reviewData.practiceAnswer && (
                <p className="adv-practice-a">
                  <strong>A:</strong> {reviewData.practiceAnswer}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Related Concepts — hide for very young children to avoid overload */}
        {!isChildMode && reviewData.relatedConcepts && reviewData.relatedConcepts.length > 0 && (
          <section className="adv-review-section">
            <h4 className="adv-review-section-title">🔗 Related Concepts</h4>
            <div className="adv-review-chips">
              {reviewData.relatedConcepts.map((item, idx) => (
                <span key={idx} className="adv-chip">{item}</span>
              ))}
            </div>
          </section>
        )}

        <div className="adv-review-actions">
          <button
            className="adv-btn adv-btn-primary adv-full-width"
            onClick={handleNext}
            aria-label={resultData?.nextLevelId ? 'Go to next level' : 'Return to level list'}
          >
            {resultData?.nextLevelId
              ? (isChildMode ? 'Next Level! →' : 'Next Level →')
              : (isChildMode ? 'Back to Levels →' : 'Return to Journey Path →')}
          </button>
        </div>
      </div>
    </div>
  );
}
