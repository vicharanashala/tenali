import React, { useState } from 'react'
import { API, QuizLayout, useTimer, useProgressSubmit, renderFeedback } from '../App.jsx'
import CoordinateGrid from '../components/CoordinateGrid'

export default function CoordGeomInteractiveApp({ onBack }) {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [round, setRound] = useState(0);
  const [numQuestions, setNumQuestions] = useState('10');
  const [difficulty, setDifficulty] = useState('easy');
  const [score, setScore] = useState(0);

  const [currentQ, setCurrentQ] = useState(null);
  const [dartPos, setDartPos] = useState(null); // {x, y}
  const [textAnswer, setTextAnswer] = useState(''); // for distance, gradient, etc.
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [results, setResults] = useState([]);

  useProgressSubmit(revealed, isCorrect, 'coordgeom', currentQ?.id);
  const timer = useTimer();

  const loadQuestion = async () => {
    try {
      const r = await fetch(`${API}/coordgeom-api/question?difficulty=${difficulty}`);
      if (!r.ok) throw new Error('Server error');
      const data = await r.json();
      setCurrentQ(data);
      setDartPos(null);
      setTextAnswer('');
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
    loadQuestion();
  };

  // CoordinateGrid handles clicks internally

  const handleCheck = async () => {
    if (revealed) return;
    if (currentQ?.type === 'coord' && !dartPos) return;
    if (currentQ?.type !== 'coord' && !textAnswer.trim()) return;

    const timeTaken = timer.stop();
    setRevealed(true);

    try {
      const payload = {
        ...currentQ,
        userAnswer: currentQ.type === 'coord' ? `(${dartPos.x}, ${dartPos.y})` : textAnswer
      };
      const r = await fetch(`${API}/coordgeom-api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await r.json();

      const correct = data.correct;
      setIsCorrect(correct);
      setFeedback(data.message + (correct ? ` ${data.display} is correct!` : ` The answer was ${data.display}.`));
      if (correct) setScore(s => s + 1);

      setResults(prev => [...prev, {
        question: currentQ.prompt,
        userAnswer: payload.userAnswer,
        correctAnswer: data.display,
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
    setFeedback(`Solution: The answer is ${currentQ.display}.`);
    setResults(prev => [...prev, {
      question: currentQ.prompt,
      userAnswer: '—',
      correctAnswer: currentQ.display,
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
    const diffLabels = { easy: 'Easy — Foundations', medium: 'Medium — Lengths', hard: 'Hard — Slopes & Eqs', extrahard: 'Extra Hard — Advanced' };
    return (
      <QuizLayout title="Coordinate Geometry" subtitle="Choose a level and solve coordinate geometry challenges" onBack={onBack}>
        <div className="welcome-box">
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: 'var(--clr-text)', fontSize: '0.9rem', margin: '0 0 16px', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
              Select Difficulty:
            </h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
              {['easy', 'medium', 'hard', 'extrahard'].map(d => (
                <button key={d} onClick={() => setDifficulty(d)} style={{
                  background: difficulty === d ? 'var(--clr-accent)' : 'transparent',
                  border: difficulty === d ? '1px solid var(--clr-accent)' : '1px solid var(--clr-border)',
                  borderRadius: '50px', padding: '8px 16px',
                  color: difficulty === d ? '#FFF' : 'var(--clr-text-soft)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                }}>
                  {diffLabels[d]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ color: 'var(--clr-text-soft)', fontSize: '0.85rem', margin: '0 0 12px', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
              How many questions?
            </label>
            <input type="text" value={numQuestions} onChange={(e) => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) setNumQuestions(v) }} style={{
              background: 'var(--clr-input)', border: '1px solid var(--clr-border)', borderRadius: '6px',
              padding: '10px', color: 'var(--clr-text)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem',
              width: '100px', textAlign: 'center', outline: 'none'
            }} placeholder="10" />
          </div>

          <button onClick={startGame} style={{
            background: 'var(--clr-accent)', border: 'none', borderRadius: '6px',
            padding: '10px 24px', color: '#FFF', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
          }}>
            Start Quiz
          </button>
        </div>
      </QuizLayout>
    );
  }

  if (finished) {
    return (
      <QuizLayout title="Coordinate Geometry" onBack={onBack}>
        <ResultsView score={score} total={Number(numQuestions)} results={results} onRetry={startGame} />
      </QuizLayout>
    );
  }

  return (
    <QuizLayout title="Coordinate Geometry" onBack={onBack}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 4px' }}>
          <span style={{ color: 'var(--clr-muted)', fontSize: '0.85rem' }}>Round {round} / {numQuestions}</span>
          <span style={{ fontWeight: 700, color: 'var(--clr-accent)' }}>Score: {score}</span>
        </div>

        <h3 className="prompt-text">{currentQ?.prompt}</h3>

        <div style={{ margin: '20px auto', display: 'flex', justifyContent: 'center' }}>
          <CoordinateGrid
            points={currentQ?.points || []}
            onClick={currentQ?.type === 'coord' && !revealed ? (pos) => setDartPos(pos) : undefined}
            cursorType={currentQ?.type === 'coord' ? 'crosshair' : 'default'}
            userTarget={dartPos}
            revealedTarget={revealed && !isCorrect && currentQ?.type === 'coord' ? { x: currentQ.ansX, y: currentQ.ansY } : null}
            connectPoints={true}
            width={350}
            height={350}
          />
        </div>

        {currentQ?.type === 'coord' ? (
          dartPos && !revealed && (
            <p style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', margin: '8px 0 0' }}>
              Selected Point: ({dartPos.x}, {dartPos.y})
            </p>
          )
        ) : (
          <div style={{ marginTop: 20 }}>
            <input
              type="text"
              className="answer-input"
              placeholder={currentQ?.type === 'equation' ? 'e.g. y=-3/4x+2' : currentQ?.type === 'fraction' ? 'e.g. -3/4' : 'e.g. 13'}
              value={textAnswer}
              onChange={e => !revealed && setTextAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCheck(); }}
              disabled={revealed}
            />
          </div>
        )}

        <div className="button-row" style={{ marginTop: 20, justifyContent: 'center', gap: '10px' }}>
          {!revealed ? (
            <>
              <button className="btn" onClick={handleCheck} disabled={currentQ?.type === 'coord' ? !dartPos : !textAnswer.trim()}>
                Check Answer
              </button>
              <button className="btn" onClick={handleSolve} style={{ background: 'transparent', border: '1px solid var(--clr-border)', color: 'var(--clr-muted)' }}>
                💡 Solve
              </button>
            </>
          ) : (
            <button className="btn" onClick={nextQuestion}>
              Next Question
            </button>
          )}
        </div>

        {revealed && (
          <div style={{ marginTop: 20 }}>
            {renderFeedback(feedback, isCorrect)}
          </div>
        )}
      </div>
    </QuizLayout>
  );
}
