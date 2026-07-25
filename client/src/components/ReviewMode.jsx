// client/src/components/ReviewMode.jsx
import React, { useState, useEffect } from 'react';
import { getDueQuestions, updateReviewResult, recordAttempt } from '../services/srsService';

const ReviewMode = ({ onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState({ correct: 0, incorrect: 0, total: 0 });
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const due = getDueQuestions();
    setQuestions(due);
    if (due.length === 0) setFinished(true);
  }, []);

  const handleSubmit = () => {
    const q = questions[currentIndex];
    if (!userAnswer.trim()) return;

    const isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    const attemptData = {
      prompt: q.prompt,
      correctAnswer: q.correctAnswer,
      userAnswer: userAnswer.trim(),
      explanation: q.explanation,
      topic: q.topic,
      difficulty: q.difficulty
    };

    // Update mastery in SRS
    updateReviewResult(q.id, isCorrect);
    // Also record the new attempt (keeps history)
    recordAttempt(attemptData, isCorrect);

    setResults(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      total: prev.total + 1
    }));

    setFeedback({
      message: isCorrect ? '✅ Correct! Great job.' : `❌ Oops. Correct answer: ${q.correctAnswer}`,
      isCorrect
    });

    // Advance after short delay
    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setFinished(true);
      } else {
        setCurrentIndex(prev => prev + 1);
        setUserAnswer('');
        setFeedback(null);
      }
    }, 1500);
  };

  if (finished) {
    const accuracy = results.total === 0 ? 0 : Math.round((results.correct / results.total) * 100);
    const remaining = getDueQuestions().length;
    return (
      <div className="quiz-layout">
        <header className="quiz-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h2 className="quiz-title">📊 Review Complete!</h2>
        </header>
        <div className="results-panel" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="stat-card" style={{ background: 'var(--clr-card)', padding: '20px', borderRadius: '12px' }}>
              <h3>{results.total}</h3>
              <p>Reviewed</p>
            </div>
            <div className="stat-card" style={{ background: 'var(--clr-card)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ color: 'var(--clr-success)' }}>{results.correct}</h3>
              <p>Correct</p>
            </div>
            <div className="stat-card" style={{ background: 'var(--clr-card)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ color: 'var(--clr-danger)' }}>{results.incorrect}</h3>
              <p>Incorrect</p>
            </div>
          </div>
          <div style={{ marginTop: '20px', fontSize: '1.2rem' }}>
            Accuracy: <strong>{accuracy}%</strong>
          </div>
          <div style={{ marginTop: '12px', color: 'var(--clr-text-muted)' }}>
            {remaining > 0 ? `📅 ${remaining} question(s) still due for review later.` : '🎉 All caught up! Nothing due right now.'}
          </div>
          <button className="primary-btn" onClick={onBack} style={{ marginTop: '30px' }}>Back to Home</button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-layout">
        <header className="quiz-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h2 className="quiz-title">📅 Review Mode</h2>
        </header>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3>🎉 No questions due for review!</h3>
          <p style={{ color: 'var(--clr-text-muted)' }}>Come back later or solve more questions to build your notebook.</p>
          <button className="primary-btn" onClick={onBack} style={{ marginTop: '20px' }}>Back to Home</button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="quiz-layout">
      <header className="quiz-header">
        <button className="back-btn" onClick={onBack}>← Exit Review</button>
        <h2 className="quiz-title">📝 Review Session</h2>
        <span className="badge">{currentIndex + 1} / {questions.length}</span>
      </header>

      <div className="progress-bar" style={{ width: '100%', height: '6px', background: 'var(--clr-bg-alt)', borderRadius: '4px', marginBottom: '20px' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--clr-accent)', borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>

      <div className="question-card" style={{ background: 'var(--clr-card)', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span className="topic-tag" style={{ background: 'var(--clr-accent-light)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>{q.topic}</span>
          <span className="difficulty-tag" style={{ background: 'var(--clr-bg-alt)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>Difficulty {q.difficulty}</span>
          <span className="mistake-tag" style={{ background: 'var(--clr-danger-light)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>❌ {q.mistakes} mistake(s)</span>
        </div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 'normal' }}>{q.prompt}</h3>
      </div>

      <div className="answer-section" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your answer..."
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--clr-border)', fontSize: '1rem' }}
        />
        <button className="primary-btn" onClick={handleSubmit} disabled={!userAnswer.trim()}>Submit</button>
      </div>

      {feedback && (
        <div className={`feedback ${feedback.isCorrect ? 'correct' : 'wrong'}`} style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px' }}>
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default ReviewMode;