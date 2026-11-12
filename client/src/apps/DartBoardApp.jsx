import React, { useRef, useState } from 'react';
import { QuizLayout, useTimer } from '../App';

function DartBoardApp({ onBack }) {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [round, setRound] = useState(0);
  const [numQuestions, setNumQuestions] = useState('10');
  const [difficulty, setDifficulty] = useState('easy');
  const [isAdaptive, setIsAdaptive] = useState(false);
  const [adaptScore, setAdaptScore] = useState(0);
  const adaptScoreRef = useRef(0);
  const [score, setScore] = useState(0);

  const [currentQ, setCurrentQ] = useState(null);
  const [dartPos, setDartPos] = useState(null); // {x, y}
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [results, setResults] = useState([]);

  useProgressSubmit(revealed, isCorrect, 'darts', currentQ?.id);
  const timer = useTimer();

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
    setIsAdaptive(e.target.value === 'adaptive');
    if (e.target.value !== 'adaptive') setAdaptScore(0);
  };

  const currentLevel = isAdaptive ? adaptiveLevel(adaptScore) : difficulty;

  const loadQuestion = async () => {
    try {
      const r = await fetch(`${API}/darts-api/question?level=${currentLevel}`);
      if (!r.ok) throw new Error('Server error');
      const data = await r.json();
      setCurrentQ(data);
      setDartPos(null);
      setRevealed(false);
      setIsCorrect(null);
      setFeedback('');
      timer.start();
    } catch (e) {
      console.error(e);
      setFeedback('Error loading question. ' + e.message);
    }
  };

  const startGame = () => {
    const qCount = parseInt(numQuestions) || 10;
    setNumQuestions(String(qCount));
    setStarted(true);
    setFinished(false);
    setRound(1);
    setScore(0);
    setResults([]);
    if (isAdaptive) {
      setAdaptScore(1.5);
      adaptScoreRef.current = 1.5;
    }
    loadQuestion();
  };

  const handleGridClick = (e) => {
    if (revealed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Grid is 300x300. Origin (0,0) is at 150,150.
    // 1 unit = 30px (10 units from -5 to +5 -> 300px)
    let gridX = (clickX - 150) / 30;
    let gridY = (150 - clickY) / 30;

    // Snap to nearest half step (0.5)
    gridX = Math.round(gridX * 2) / 2;
    gridY = Math.round(gridY * 2) / 2;

    // Clamp to -5, 5
    gridX = Math.max(-5, Math.min(5, gridX));
    gridY = Math.max(-5, Math.min(5, gridY));

    setDartPos({ x: gridX, y: gridY });
  };

  const handleCheck = async () => {
    if (!dartPos || revealed) return;
    const timeTaken = timer.stop();
    setRevealed(true);

    try {
      const payload = {
        ...currentQ,
        userX: dartPos.x,
        userY: dartPos.y,
      };
      const r = await fetch(`${API}/darts-api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await r.json();

      const correct = data.correct;
      setIsCorrect(correct);
      setFeedback(correct
        ? `âœ… Bullseye! (${dartPos.x}, ${dartPos.y}) is correct!`
        : `âŒ Missed! You threw at (${dartPos.x}, ${dartPos.y}) but the target was (${currentQ.x}, ${currentQ.y}).`
      );
      if (correct) setScore(s => s + 1);

      if (isAdaptive) {
        if (correct) {
          const boost = timeTaken < 3 ? 0.3 : (timeTaken < 6 ? 0.2 : 0.1);
          adaptScoreRef.current = Math.min(3.0, adaptScoreRef.current + boost);
        } else {
          adaptScoreRef.current = Math.max(0.0, adaptScoreRef.current - 0.4);
        }
        setAdaptScore(adaptScoreRef.current);
      }

      setResults(prev => [...prev, {
        question: currentQ.prompt,
        userAnswer: `(${dartPos.x}, ${dartPos.y})`,
        correctAnswer: `(${currentQ.x}, ${currentQ.y})`,
        correct,
        time: timeTaken
      }]);
    } catch (e) {
      console.error(e);
      setFeedback('Error checking answer.');
    }
  };

  const handleSolve = () => {
    if (revealed || !currentQ) return;
    timer.stop();
    setRevealed(true);
    setIsCorrect(false);
    setFeedback(`Solution: The target coordinate is (${currentQ.x}, ${currentQ.y}).\nMove ${currentQ.x >= 0 ? 'right' : 'left'} ${Math.abs(currentQ.x)} unit(s) on the x-axis, then ${currentQ.y >= 0 ? 'up' : 'down'} ${Math.abs(currentQ.y)} unit(s) on the y-axis.`);
    setResults(prev => [...prev, {
      question: currentQ.prompt,
      userAnswer: dartPos ? `(${dartPos.x}, ${dartPos.y})` : 'â€”',
      correctAnswer: `(${currentQ.x}, ${currentQ.y})`,
      correct: false,
      time: 0
    }]);
  };

  const nextQuestion = () => {
    if (round >= Number(numQuestions)) {
      setFinished(true);
    } else {
      setRound(r => r + 1);
      loadQuestion();
    }
  };

  if (!started) {
    return (
      <QuizLayout title="Dart Board" subtitle="Visual Coordinate Geometry" onBack={onBack}>
        <div className="setup-container">
          <p>Click on the grid to throw the dart at the correct coordinate.</p>
          <div className="setup-controls">
            <select value={difficulty} onChange={handleDifficultyChange}>
              <option value="easy">Easy (1st Quadrant)</option>
              <option value="medium">Medium (All Quadrants)</option>
              <option value="hard">Hard (Half-steps)</option>
              <option value="extrahard">Extra Hard (Transformations)</option>
              <option value="adaptive">Adaptive</option>
            </select>
            <input type="number" min="1" max="100" value={numQuestions} onChange={e => setNumQuestions(e.target.value)} />
            <button className="primary-button" onClick={startGame}>Start</button>
          </div>
        </div>
      </QuizLayout>
    );
  }

  if (finished) {
    return (
      <QuizLayout title="Dart Board" onBack={onBack}>
        <ResultsView score={score} total={Number(numQuestions)} results={results} onRetry={startGame} />
      </QuizLayout>
    );
  }

  const dartStyle = dartPos ? {
    position: 'absolute',
    left: `${150 + dartPos.x * 30}px`,
    top: `${150 - dartPos.y * 30}px`,
    transform: 'translate(-50%, -50%)',
    fontSize: '22px',
    lineHeight: 1,
    pointerEvents: 'none',
    zIndex: 10,
    transition: 'left 0.15s, top 0.15s',
  } : { display: 'none' };

  const targetStyle = revealed && !isCorrect && currentQ ? {
    position: 'absolute',
    left: `${150 + currentQ.x * 30}px`,
    top: `${150 - currentQ.y * 30}px`,
    transform: 'translate(-50%, -50%)',
    fontSize: '18px',
    lineHeight: 1,
    pointerEvents: 'none',
    zIndex: 9,
    opacity: 0.85,
  } : { display: 'none' };

  return (
    <QuizLayout title="Dart Board" onBack={onBack}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 4px' }}>
          <span style={{ color: 'var(--clr-muted)', fontSize: '0.85rem' }}>Round {round} / {numQuestions}</span>
          <span style={{ fontWeight: 700, color: 'var(--clr-accent)' }}>Score: {score}</span>
        </div>

        <h3 className="prompt-text">{currentQ?.prompt}</h3>

        <div className="dartboard-container">
          <div className="dartboard-grid" onClick={handleGridClick}>
            <div className="dartboard-axis-x" />
            <div className="dartboard-axis-y" />
            <span className="dartboard-label x-pos">5</span>
            <span className="dartboard-label x-neg">-5</span>
            <span className="dartboard-label y-pos">5</span>
            <span className="dartboard-label y-neg">-5</span>
            <span className="dartboard-label origin">0</span>

            <div style={dartStyle}>ðŸŽ¯</div>
            {revealed && !isCorrect && currentQ && <div style={targetStyle}>â­•</div>}
          </div>
        </div>

        {dartPos && !revealed && (
          <p style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', margin: '8px 0 0' }}>
            Selected: ({dartPos.x}, {dartPos.y})
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
          {!revealed ? (
            <>
              <button className="primary-button" onClick={handleCheck} disabled={!dartPos}>
                ðŸŽ¯ Throw Dart!
              </button>
              <button
                onClick={handleSolve}
                style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              >
                ðŸ’¡ Solve
              </button>
            </>
          ) : (
            <button className="primary-button" onClick={nextQuestion}>Next â†’</button>
          )}
        </div>

        {revealed && feedback && (
          <div style={{ marginTop: 20 }}>
            {renderFeedback(feedback, isCorrect)}
          </div>
        )}
      </div>
    </QuizLayout>
  );
}


export default DartBoardApp;
