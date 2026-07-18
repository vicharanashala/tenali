import React, { useState } from 'react';
import { useMastery, getNextQuestion, loadMasteryProgress } from '../VachanaMastery';
import MasteryLevelHeader from '../MasteryLevelHeader';

// ─── Jumbled Words Question Bank ─────────────────────────────────────────────
// Reduced to 6 questions per level to optimize cognitive load and prevent student fatigue.
const QUESTION_BANK = {
  '1': [ // Easy: Direct chronological mapping (single-step)
    {
      id: 'jumb_1_01',
      expression: 'x + 5',
      blocks: ['x', 'increased by', 'five'],
      answer: 'x increased by five',
      explanation: '✅ "x + 5" translates directly in reading order: the variable "x" followed by the operation "increased by five".',
      hint: 'Translate from left to right: write the variable, then the addition.'
    },
    {
      id: 'jumb_1_02',
      expression: 'y - 4',
      blocks: ['y', 'decreased by', 'four'],
      answer: 'y decreased by four',
      explanation: '✅ "y - 4" is translated directly as "y decreased by four" in chronological order.',
      hint: 'Translate directly: start with y, then describe the subtraction.'
    },
    {
      id: 'jumb_1_03',
      expression: '3z',
      blocks: ['three times', 'z'],
      answer: 'three times z',
      explanation: '✅ Multiplication is expressed by stating the multiplier before the variable: "three times z".',
      hint: 'Express the multiplication of 3 and z.'
    },
    {
      id: 'jumb_1_04',
      expression: 'a / 2',
      blocks: ['a', 'divided by', 'two'],
      answer: 'a divided by two',
      explanation: '✅ Division is written in chronological order: the numerator "a" divided by the denominator "two".',
      hint: 'Read the fraction from top to bottom.'
    },
    {
      id: 'jumb_1_05',
      expression: 'm + 8',
      blocks: ['m', 'plus', 'eight'],
      answer: 'm plus eight',
      explanation: '✅ Simple addition is translated as "m plus eight".',
      hint: 'Use the simplest word for addition.'
    },
    {
      id: 'jumb_1_06',
      expression: 'p / 3',
      blocks: ['p', 'divided by', 'three'],
      answer: 'p divided by three',
      explanation: '✅ Division is written in chronological order: "p divided by three".',
      hint: 'Translate from top to bottom.'
    }
  ],
  '2': [ // Medium: Syntactic Inversion & Two-Step Direct
    {
      id: 'jumb_2_01',
      expression: 'x - 7',
      blocks: ['seven', 'less than', 'x'],
      answer: 'seven less than x',
      explanation: '✅ "seven less than x" means we start with x and subtract 7. This is an inversion error trap!',
      hint: 'Remember that "less than" reverses the verbal order of numbers. The subtracted number comes first.'
    },
    {
      id: 'jumb_2_02',
      expression: 'y - 10',
      blocks: ['ten', 'subtracted from', 'y'],
      answer: 'ten subtracted from y',
      explanation: '✅ "ten subtracted from y" indicates y is the starting value, and 10 is subtracted from it (y - 10).',
      hint: 'The phrase "subtracted from" reverses the order of terms. Write the amount to subtract first.'
    },
    {
      id: 'jumb_2_03',
      expression: '2x + 5',
      blocks: ['twice x', 'plus', 'five'],
      answer: 'twice x plus five',
      explanation: '✅ "2x + 5" combines multiplication ("twice x") and addition ("plus five") in chronological order.',
      hint: 'Translate step-by-step: first the multiplication of 2 and x, then the addition of 5.'
    },
    {
      id: 'jumb_2_04',
      expression: '3b - 2',
      blocks: ['two less than', 'three times b'],
      answer: 'two less than three times b',
      explanation: '✅ "two less than three times b" inverts the subtraction: three times b is evaluated first, then 2 is subtracted.',
      hint: 'Combine the multiplication (3b) and subtraction (minus 2) with an inversion phrase.'
    },
    {
      id: 'jumb_2_05',
      expression: 'p - 4',
      blocks: ['four fewer than', 'p'],
      answer: 'four fewer than p',
      explanation: '✅ "four fewer than p" is another inversion trap representing p - 4.',
      hint: 'The phrase "fewer than" means subtraction and reverses the order of terms.'
    },
    {
      id: 'jumb_2_06',
      expression: '5y + 2',
      blocks: ['five times y', 'plus', 'two'],
      answer: 'five times y plus two',
      explanation: '✅ "5y + 2" translates chronologically: the multiplication of y by 5, plus 2.',
      hint: 'Combine the multiplication (5y) and addition (+ 2) in reading order.'
    }
  ],
  '3': [ // Hard: Parentheses & Multiple Operations
    {
      id: 'jumb_3_01',
      expression: '3(y + 4)',
      blocks: ['three times', 'the sum of', 'y', 'and four'],
      answer: 'three times the sum of y and four',
      explanation: '✅ "3(y + 4)" requires parentheses. We express this by stating "three times" followed by "the sum of" to group y and 4.',
      hint: 'Use "the sum of" to indicate that the addition should happen inside parentheses before multiplying.'
    },
    {
      id: 'jumb_3_02',
      expression: '2(x - 5)',
      blocks: ['twice', 'the difference of', 'x', 'and five'],
      answer: 'twice the difference of x and five',
      explanation: '✅ "2(x - 5)" uses "twice" followed by "the difference of" to show that subtraction happens first inside parentheses.',
      hint: '"The difference of" grouping indicates parentheses around the subtraction.'
    },
    {
      id: 'jumb_3_03',
      expression: '(a + 8) / 2',
      blocks: ['half of', 'the sum of', 'a', 'and eight'],
      answer: 'half of the sum of a and eight',
      explanation: '✅ "(a + 8) / 2" is represented by taking "half of" the grouped expression "the sum of a and eight".',
      hint: 'The division by 2 applies to the entire addition, so we state "half of" before "the sum".'
    },
    {
      id: 'jumb_3_04',
      expression: '5(2x - 3)',
      blocks: ['five times', 'the quantity', 'three less than', 'twice x'],
      answer: 'five times the quantity three less than twice x',
      explanation: '✅ "5(2x - 3)" uses "the quantity" to set off parentheses, enclosing the inverted subtraction "three less than twice x".',
      hint: 'Use "the quantity" to group the terms inside the parentheses.'
    },
    {
      id: 'jumb_3_05',
      expression: '(3n - 1) / 4',
      blocks: ['one-fourth of', 'the quantity', 'one less than', 'three times n'],
      answer: 'one-fourth of the quantity one less than three times n',
      explanation: '✅ The division by 4 applies to the entire numerator. We write "one-fourth of" followed by "the quantity" for parentheses.',
      hint: 'Start with the division multiplier ("one-fourth of") and use "the quantity" to group the numerator terms.'
    },
    {
      id: 'jumb_3_06',
      expression: '3(2a + 1)',
      blocks: ['three times', 'the quantity', 'twice a', 'plus one'],
      answer: 'three times the quantity twice a plus one',
      explanation: '✅ "3(2a + 1)" uses "the quantity" to open parentheses enclosing the two-step expression "twice a plus one".',
      hint: 'Use "the quantity" to show parentheses around the terms inside.'
    }
  ]
};

// Helper to shuffle array (Fisher-Yates)
const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function JumbledWords() {
  const jumbledMastery = useMastery('jumbled', 3);

  // Initialize data synchronously to avoid StrictMode double-fire loading bugs
  const [initialData] = useState(() => {
    const progress = loadMasteryProgress();
    const currentLevel = progress['jumbled']?.currentLevel || 1;
    const questions = QUESTION_BANK[String(currentLevel)];
    // Always start with the very first question of the current level on clean load
    const question = questions && questions.length > 0 ? questions[0] : null;
    let shuffled = [];
    if (question) {
      shuffled = shuffleArray(question.blocks);
      let attempts = 0;
      const correctAns = question.answer;
      while (shuffled.join(' ').toLowerCase() === correctAns.toLowerCase() && attempts < 10) {
        shuffled = shuffleArray(question.blocks);
        attempts++;
      }
    }
    return { question, shuffled };
  });

  const [currentQuestion, setCurrentQuestion] = useState(initialData.question);
  const [shuffledPool, setShuffledPool] = useState(initialData.shuffled);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [msg, setMsg] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Track recently seen question IDs at the current level to avoid repetitions
  const [seenIds, setSeenIds] = useState(() => initialData.question ? [initialData.question.id] : []);

  // Pedagogy states: require at least one attempt, and enforce reading time on skip/solve
  const [hasAttempted, setHasAttempted] = useState(false);
  const [solveCountdown, setSolveCountdown] = useState(0);

  React.useEffect(() => {
    if (solveCountdown <= 0) return;
    const timer = setTimeout(() => {
      setSolveCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [solveCountdown]);

  // Select a question avoiding immediate repetitions
  const selectQuestionNoRepeat = (level, lastId) => {
    const levelKey = String(level);
    const questions = QUESTION_BANK[levelKey];
    if (!questions || questions.length === 0) return null;

    // If seenIds is empty (first load or progress reset), always start with the first question of that level
    if (seenIds.length === 0) {
      const selected = questions[0];
      if (selected) {
        setSeenIds([selected.id]);
      }
      return selected;
    }

    // Filter out questions already seen in this cycle
    let candidates = questions.filter(q => !seenIds.includes(q.id));

    // If all questions at this level have been seen, reset the tracking list
    if (candidates.length === 0) {
      candidates = questions;
      // Reset seenIds to just the last seen question to prevent immediate double-repeats
      setSeenIds(lastId ? [lastId] : []);
    }

    // Filter out the last question specifically if we have multiple choices left
    if (lastId && candidates.length > 1) {
      candidates = candidates.filter(q => q.id !== lastId);
    }

    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    if (selected) {
      setSeenIds(prev => [...prev, selected.id]);
    }
    return selected;
  };

  // Initialize or load next question
  const loadQuestion = (level) => {
    const nextQ = selectQuestionNoRepeat(level, currentQuestion?.id || null);
    setCurrentQuestion(nextQ);
    if (nextQ) {
      let shuffled = shuffleArray(nextQ.blocks);
      let attempts = 0;
      const correctAns = nextQ.answer;
      while (shuffled.join(' ').toLowerCase() === correctAns.toLowerCase() && attempts < 10) {
        shuffled = shuffleArray(nextQ.blocks);
        attempts++;
      }
      setShuffledPool(shuffled);
    }
    setSelectedIndices([]);
    setMsg('');
    setShowHint(false);
    setIsSolved(false);
    setHasChecked(false);
    setHasAttempted(false);
    setSolveCountdown(0);
  };

  const handleTileClick = (index) => {
    if (isSolved) return;
    if (selectedIndices.includes(index)) {
      setSelectedIndices(prev => prev.filter(i => i !== index));
    } else {
      setSelectedIndices(prev => [...prev, index]);
    }
    setMsg('');
    setHasChecked(false);
  };

  const handleActiveTileClick = (pos) => {
    if (isSolved) return;
    setSelectedIndices(prev => prev.filter((_, idx) => idx !== pos));
    setMsg('');
    setHasChecked(false);
  };

  const clearSelection = () => {
    if (isSolved) return;
    setSelectedIndices([]);
    setMsg('');
    setHasChecked(false);
  };

  const checkAnswer = () => {
    if (!currentQuestion) return;
    if (selectedIndices.length === 0) {
      setMsg('⚠️ Please place some word blocks to construct the phrase first.');
      return;
    }

    const assembledPhrase = selectedIndices.map(i => shuffledPool[i]).join(' ');
    const isCorrect = assembledPhrase.toLowerCase() === currentQuestion.answer.toLowerCase();

    setHasChecked(true);
    setHasAttempted(true); // Player made a validation attempt!

    if (isCorrect) {
      setMsg(currentQuestion.explanation);
      jumbledMastery.handleAnswer(true);
      setTimeout(() => {
        const nextLevel = loadMasteryProgress()['jumbled']?.currentLevel || jumbledMastery.state.currentLevel;
        loadQuestion(nextLevel);
      }, 2500);
    } else {
      let errorHelp = '';
      if (currentQuestion.expression.includes('-')) {
        const lowerPhrase = assembledPhrase.toLowerCase();
        if (lowerPhrase.startsWith(currentQuestion.expression[0].toLowerCase() + ' less than') || 
            lowerPhrase.startsWith(currentQuestion.expression[0].toLowerCase() + ' subtracted from')) {
          errorHelp = ' 💡 Watch out! In English, phrases like "A less than B" or "A subtracted from B" mean B − A, not A − B. The subtracted amount must come first in the sentence.';
        }
      }
      setMsg(`❌ Incorrect phrasing order.${errorHelp} Try again or click 'Solve' to see the correct structure.`);
      jumbledMastery.handleAnswer(false);
    }
  };

  const solveQuestion = () => {
    if (!currentQuestion) return;
    setIsSolved(true);
    setSolveCountdown(3); // Start 3-second countdown to force reading of solution
    const correctBlocks = currentQuestion.blocks;
    const newIndices = [];
    correctBlocks.forEach(block => {
      const idx = shuffledPool.indexOf(block);
      if (idx !== -1 && !newIndices.includes(idx)) {
        newIndices.push(idx);
      }
    });
    setSelectedIndices(newIndices);
    setMsg(currentQuestion.explanation);
    jumbledMastery.handleAnswer(false);
  };

  const handleNext = () => {
    const nextLevel = loadMasteryProgress()['jumbled']?.currentLevel || jumbledMastery.state.currentLevel;
    loadQuestion(nextLevel);
  };

  const handleReset = () => {
    jumbledMastery.resetExercise();
    setSeenIds([]);
    setHasAttempted(false);
    setSolveCountdown(0);
    loadQuestion(1);
  };

  if (!currentQuestion) return <div style={{ color: 'var(--clr-text-soft)' }}>Loading...</div>;

  return (
    <div style={{ fontFamily: 'var(--font-display, "DM Sans", sans-serif)', color: 'var(--clr-text)' }}>
      <MasteryLevelHeader
        state={jumbledMastery.state}
        maxLevel={3}
        toastMsg={jumbledMastery.toastMsg}
        onClearToast={jumbledMastery.clearToast}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
          🧩 Unscramble the Algebraic Expression
        </span>
        <button
          onClick={handleReset}
          style={{
            background: '#d93f3f',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 700,
            boxShadow: '0 2px 4px rgba(217, 63, 63, 0.2)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#b82e2e'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#d93f3f'; }}
        >
          Reset Progress
        </button>
      </div>

      {/* Target Expression Card */}
      <div style={{
        background: 'var(--clr-surface)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid var(--clr-border)',
        marginBottom: '24px',
        textAlign: 'center',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '0.92rem', color: 'var(--clr-text-soft)' }}>
          Construct the correct verbal phrase for the expression:
        </p>
        <div style={{
          fontSize: '2.2rem',
          fontWeight: 700,
          color: 'var(--clr-accent)',
          fontFamily: 'var(--font-mono, monospace)',
          letterSpacing: '1px',
          textShadow: '0 0 10px rgba(108, 206, 255, 0.15)'
        }}>
          {currentQuestion.expression}
        </div>
      </div>

      {/* Assembled Area (Dotted Box) */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--clr-text-soft)' }}>Your Phrase:</span>
          {selectedIndices.length > 0 && !isSolved && (
            <button
              onClick={clearSelection}
              style={{
                background: 'transparent', border: 'none', color: 'var(--clr-text-soft)',
                cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline'
              }}
            >
              Clear
            </button>
          )}
        </div>
        <div style={{
          minHeight: '80px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '2px dashed var(--clr-border)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}>
          {selectedIndices.length === 0 ? (
            <span style={{ color: 'var(--clr-text-soft)', fontSize: '0.92rem', fontStyle: 'italic' }}>
              Click tiles below to build the sentence
            </span>
          ) : (
            selectedIndices.map((poolIndex, pos) => (
              <button
                key={pos}
                onClick={() => handleActiveTileClick(pos)}
                disabled={isSolved}
                style={{
                  padding: '8px 14px',
                  background: 'var(--clr-card)',
                  border: '1px solid var(--clr-border)',
                  borderRadius: '8px',
                  color: 'var(--clr-accent)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: isSolved ? 'default' : 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.15s, border-color 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={e => { if (!isSolved) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { if (!isSolved) e.currentTarget.style.transform = 'none'; }}
              >
                {shuffledPool[poolIndex]}
                {!isSolved && <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>×</span>}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Word Pool Area */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 600 }}>
          Word Bank
        </p>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.01)',
          borderRadius: '12px',
          border: '1px solid var(--clr-border)'
        }}>
          {shuffledPool.map((word, idx) => {
            const isSelected = selectedIndices.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                disabled={isSelected || isSolved}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  border: isSelected ? '1px dashed var(--clr-border)' : '1px solid var(--clr-border)',
                  background: isSelected ? 'transparent' : 'var(--clr-card)',
                  color: isSelected ? 'transparent' : 'var(--clr-text)',
                  cursor: isSelected ? 'default' : 'pointer',
                  boxShadow: isSelected ? 'none' : '0 4px 6px rgba(0,0,0,0.1)',
                  pointerEvents: isSelected ? 'none' : 'auto'
                }}
                onMouseEnter={e => { if (!isSelected && !isSolved) { e.currentTarget.style.borderColor = 'var(--clr-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                onMouseLeave={e => { if (!isSelected && !isSolved) { e.currentTarget.style.borderColor = 'var(--clr-border)'; e.currentTarget.style.transform = 'none'; } }}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
        {!isSolved ? (
          <>
            <button
              className="submit-btn"
              onClick={checkAnswer}
              style={{ padding: '12px 24px', fontSize: '0.95rem', fontWeight: 700 }}
            >
              Validate Order
            </button>
            <button
              onClick={() => setShowHint(prev => !prev)}
              style={{
                background: 'transparent',
                border: '1px solid var(--clr-border)',
                color: 'var(--clr-text)',
                padding: '10px 18px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            <button
              onClick={solveQuestion}
              disabled={!hasAttempted}
              style={{
                background: 'transparent',
                border: !hasAttempted ? '1px solid rgba(108, 206, 255, 0.15)' : '1px solid rgba(108, 206, 255, 0.4)',
                color: !hasAttempted ? 'rgba(108, 206, 255, 0.3)' : 'var(--clr-accent)',
                padding: '10px 18px',
                borderRadius: '10px',
                cursor: !hasAttempted ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginLeft: 'auto',
                transition: 'all 0.2s'
              }}
              title={!hasAttempted ? "Please try validating an answer first before viewing the solution!" : "Reveal the correct phrase"}
            >
              Solve
            </button>
          </>
        ) : (
          <button
            className="submit-btn"
            onClick={handleNext}
            disabled={solveCountdown > 0}
            style={{
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: 700,
              background: solveCountdown > 0 ? 'var(--clr-border, #444)' : 'var(--clr-accent)',
              color: solveCountdown > 0 ? 'var(--clr-text-soft, #888)' : 'var(--clr-bg, #000)',
              cursor: solveCountdown > 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {solveCountdown > 0 ? `Next Question (Wait ${solveCountdown}s)` : 'Next Question →'}
          </button>
        )}
      </div>

      {/* Hint Box */}
      {showHint && !isSolved && (
        <div style={{
          padding: '14px',
          background: 'rgba(108, 206, 255, 0.05)',
          border: '1px solid rgba(108, 206, 255, 0.2)',
          borderRadius: '10px',
          fontSize: '0.9rem',
          lineHeight: '1.4',
          marginBottom: '20px'
        }}>
          💡 <strong>Hint:</strong> {currentQuestion.hint}
        </div>
      )}

      {/* Validation Message / Explanation */}
      {msg && (
        <div style={{
          fontSize: '0.95rem',
          padding: '16px',
          borderRadius: '12px',
          background: msg.startsWith('✅') ? 'rgba(46,160,67,0.1)' : 'rgba(255,100,100,0.08)',
          border: msg.startsWith('✅') ? '1px solid var(--clr-correct, #2ea043)' : '1px solid rgba(255,100,100,0.3)',
          color: 'var(--clr-text)',
          lineHeight: '1.5'
        }}>
          {msg}
        </div>
      )}
    </div>
  );
}
