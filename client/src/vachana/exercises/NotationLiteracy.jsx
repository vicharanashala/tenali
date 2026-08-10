import { useState } from 'react';

const NOTATIONS = {
  level1: [
    { symbol: '+', name: 'Addition / Plus', desc: 'Combines values to find their total sum.' },
    { symbol: '−', name: 'Subtraction / Minus', desc: 'Finds the difference by taking one value away.' },
    { symbol: '×', name: 'Multiplication / Times', desc: 'Repeated addition of a number.' },
    { symbol: '÷', name: 'Division / Divide', desc: 'Splits a value into equal groups.' },
    { symbol: '=', name: 'Equals', desc: 'States that two values are equivalent.' },
    { symbol: '<', name: 'Less Than', desc: 'Shows the left value is smaller than the right value.' },
    { symbol: '>', name: 'Greater Than', desc: 'Shows the left value is larger than the right value.' }
  ],
  level2: [
    { symbol: '≤', name: 'Less Than or Equal To', desc: 'Indicates the left value is smaller or equal to the right.' },
    { symbol: '≥', name: 'Greater Than or Equal To', desc: 'Indicates the left value is larger or equal to the right.' },
    { symbol: 'x²', name: 'Exponent / Power', desc: 'Represents multiplying a number by itself.' },
    { symbol: '√', name: 'Square Root', desc: 'Finds a value that squared equals the original number.' },
    { symbol: '≈', name: 'Approximately Equal To', desc: 'Indicates two values are close but not exactly equal.' },
    { symbol: '±', name: 'Plus-Minus', desc: 'Indicates both positive and negative values.' },
    { symbol: '|x|', name: 'Absolute Value', desc: 'The positive distance of a number from zero.' }
  ],
  level3: [
    { symbol: '∑', name: 'Summation / Sigma', desc: 'Represents adding a sequence of numbers.' },
    { symbol: '∏', name: 'Product / Pi', desc: 'Represents multiplying a sequence of numbers.' },
    { symbol: '∞', name: 'Infinity', desc: 'A concept representing endless size or quantity.' },
    { symbol: '∈', name: 'Element Of', desc: 'Indicates that an object is a member of a set.' },
    { symbol: '⊂', name: 'Subset Of', desc: 'Indicates that set A is fully contained in set B.' },
    { symbol: 'Δ', name: 'Delta / Change', desc: 'Represents the change or difference in a variable.' },
    { symbol: '∫', name: 'Integral', desc: 'Represents accumulation or area under a curve.' }
  ]
};

export default function NotationLiteracy() {
  const [quizMode, setQuizMode] = useState(false);
  const [quizLevel, setQuizLevel] = useState('level1');
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [masteredLevels, setMasteredLevels] = useState({ level1: false, level2: false, level3: false });

  // Generate a random question for the active quiz level
  const generateQuestion = (currentLevel) => {
    const list = NOTATIONS[currentLevel];
    const target = list[Math.floor(Math.random() * list.length)];
    
    const correctAnswer = target.name;
    const distractors = list.filter(n => n.symbol !== target.symbol).map(n => n.name);
    const shuffledDistractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [correctAnswer, ...shuffledDistractors].sort(() => 0.5 - Math.random());

    setQuizQuestion({
      target,
      correctAnswer,
      options
    });
    setAnswered(false);
    setSelectedOption(null);
  };

  const startQuiz = (selectedLevel) => {
    setQuizLevel(selectedLevel);
    setQuizMode(true);
    setStreak(0);
    generateQuestion(selectedLevel);
  };

  const handleAnswerSubmit = (option) => {
    if (answered) return;
    setSelectedOption(option);
    setAnswered(true);

    const isCorrect = option === quizQuestion.correctAnswer;
    if (isCorrect) {
      setStreak(st => {
        const nextStreak = st + 1;
        if (nextStreak >= 5) {
          setMasteredLevels(prev => ({ ...prev, [quizLevel]: true }));
        }
        return nextStreak;
      });
    } else {
      setStreak(0);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 0' }}>
      {!quizMode ? (
        /* LEVEL SELECTION SCREEN */
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-text)', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px 0', textAlign: 'center' }}>
            Notation Literacy
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', marginBottom: '32px', textAlign: 'center' }}>
            Choose a level to start mastering mathematical notations.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {Object.keys(NOTATIONS).map((lvl, index) => (
              <button
                key={lvl}
                onClick={() => startQuiz(lvl)}
                style={{
                  background: 'var(--clr-surface)',
                  border: '1px solid var(--clr-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s, border-color 0.15s',
                  width: '100%'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--clr-accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--clr-border)';
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--clr-text)' }}>Level {index + 1}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                    {index === 0 ? 'Basic Arithmetic' : index === 1 ? 'Intermediate Algebra' : 'Advanced Math / Calculus'}
                  </span>
                </div>
                {masteredLevels[lvl] ? (
                  <span style={{ color: 'var(--clr-correct, #2ea043)', fontWeight: 'bold', fontSize: '0.9rem' }}>🏆 Mastered</span>
                ) : (
                  <span style={{ color: 'var(--clr-accent)', fontWeight: '600', fontSize: '0.9rem' }}>Start Quiz ➔</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* MINIMALIST QUIZ SCREEN */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* TOP BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setQuizMode(false)}
              style={{ background: 'transparent', border: '1px solid var(--clr-border)', borderRadius: '8px', padding: '6px 14px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--clr-text-soft)' }}
            >
              ← Back to Levels
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--clr-text-soft)' }}>
              Streak: <strong style={{ color: streak >= 5 ? 'var(--clr-correct, #2ea043)' : 'var(--clr-text)' }}>{streak}/5</strong>
            </span>
          </div>

          {/* PROGRESS BAR */}
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(streak * 20, 100)}%`, height: '100%', background: streak >= 5 ? 'var(--clr-correct, #2ea043)' : 'var(--clr-accent)', transition: 'width 0.3s ease' }}></div>
          </div>

          {/* LARGE SYMBOL */}
          <div style={{
            background: 'var(--clr-surface)',
            border: '1px solid var(--clr-border)',
            borderRadius: '24px',
            padding: '48px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '5rem',
            fontWeight: 'bold',
            color: 'var(--clr-text)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            {quizQuestion?.target.symbol}
          </div>

          {/* INSTRUCTION */}
          <p style={{ textAlign: 'center', margin: 0, fontSize: '0.95rem', color: 'var(--clr-text-soft)' }}>
            Identify the meaning of the notation symbol above.
          </p>

          {/* MCQ OPTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quizQuestion?.options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === quizQuestion.correctAnswer;
              
              let btnBg = 'var(--clr-surface)';
              let btnBorder = '1px solid var(--clr-border)';
              let btnColor = 'var(--clr-text)';

              if (answered) {
                if (isCorrect) {
                  btnBg = 'rgba(46,160,67,0.12)';
                  btnBorder = '1.5px solid var(--clr-correct, #2ea043)';
                  btnColor = 'var(--clr-correct, #2ea043)';
                } else if (isSelected) {
                  btnBg = 'rgba(244,67,54,0.12)';
                  btnBorder = '1.5px solid red';
                  btnColor = 'red';
                }
              }

              return (
                <button
                  key={i}
                  disabled={answered}
                  onClick={() => handleAnswerSubmit(opt)}
                  style={{
                    textAlign: 'left',
                    padding: '16px 20px',
                    background: btnBg,
                    border: btnBorder,
                    color: btnColor,
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    cursor: answered ? 'default' : 'pointer',
                    fontWeight: isSelected ? 'bold' : '500',
                    transition: 'all 0.1s'
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* NEXT / MASTERY DIALOG */}
          {answered && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.2s ease-out' }}>
              {streak >= 5 && !masteredLevels[quizLevel] && (
                <div style={{ textAlign: 'center', padding: '12px', borderRadius: '10px', background: 'rgba(46,160,67,0.12)', color: 'var(--clr-correct, #2ea043)', fontWeight: 'bold' }}>
                  🏆 Level Mastered!
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => generateQuestion(quizLevel)}
                  style={{
                    background: 'var(--clr-accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 28px',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Next Symbol ➔
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
