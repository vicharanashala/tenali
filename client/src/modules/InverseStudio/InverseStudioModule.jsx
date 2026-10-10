import React, { useState, useRef, useEffect } from 'react';
import { PHASES, INVERSE_QUESTIONS } from './questions';
import './InverseStudioModule.css';

// Evaluator for single-variable expressions in x (for Question 8)
function evaluate1DExpression(exprStr, xVal) {
  if (!exprStr || typeof exprStr !== 'string') return NaN;
  let clean = exprStr.trim().toLowerCase();
  clean = clean.replace(/(\d)x/g, '$1*x');
  clean = clean.replace(/x(\d)/g, 'x*$1');
  clean = clean.replace(/(\d)\(/g, '$1*(');
  clean = clean.replace(/\)(\d)/g, ')*$1');
  clean = clean.replace(/\)\(/g, ')*(');
  clean = clean.replace(/x/g, `(${xVal})`);

  // Allow only digits, basic arithmetic, and parens
  if (!/^[0-9+\-*/().\s]+$/.test(clean)) return NaN;
  try {
    const fn = Function(`"use strict"; return (${clean});`);
    const res = fn();
    return typeof res === 'number' && !isNaN(res) ? res : NaN;
  } catch (e) {
    return NaN;
  }
}

// Parse number or fraction (e.g. "-5/2" -> -2.5)
function parseFractionOrNumber(valStr) {
  if (!valStr || typeof valStr !== 'string') return NaN;
  const clean = valStr.trim().replace(/\s+/g, '');
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
  }
  return parseFloat(clean);
}

function parseLinearFunction(inputStr) {
  if (!inputStr || typeof inputStr !== 'string' || !inputStr.trim()) {
    return { success: false, error: 'Please enter a linear function, e.g. 2x + 3 or f(x) = 3x - 1.' };
  }
  let clean = inputStr.trim();
  // Strip function notation prefix like f(x) = or y = or g(x) =
  clean = clean.replace(/^[a-zA-Z]\s*\(\s*x\s*\)\s*=\s*/i, '').replace(/^[a-zA-Z]\s*=\s*/i, '').trim();
  clean = clean.replace(/\s+/g, '');

  // Detect non-linear operations
  if (/sin|cos|tan|sqrt|cbrt|log|ln|abs|exp|\^|\*\*|x\*x|\/x/i.test(clean)) {
    return { success: false, error: 'That is a non-linear function! Please enter a linear function of the form ax + b (e.g. 2x + 3).' };
  }

  // Ensure variable is x
  if (/[a-wy-z]/i.test(clean)) {
    return { success: false, error: 'Please use x as the variable (e.g. 2x + 3).' };
  }

  // Normalize multiplication
  clean = clean.replace(/\*/g, '');

  // Handle simple division of x, e.g. x/2 -> 0.5x
  clean = clean.replace(/x\/(\d+(?:\.\d+)?)/gi, (m, d) => (1 / parseFloat(d)) + 'x');

  // Check constant function (no x)
  if (!/x/i.test(clean)) {
    if (/^[+-]?\d+(?:\.\d+)?$/.test(clean)) {
      return { success: false, error: `A constant function (like f(x) = ${clean}) cannot be reversed because all inputs produce the same output! Please enter a linear function with x (e.g. 2x + 3).` };
    }
    return { success: false, error: 'Please enter a linear function with variable x, e.g. 2x + 3.' };
  }

  const match1 = clean.match(/^([+-]?(?:\d+(?:\.\d+)?)?)x([+-]\d+(?:\.\d+)?)?$/i);
  let a = null;
  let b = 0;
  if (match1) {
    const aStr = match1[1];
    if (aStr === '' || aStr === '+') a = 1;
    else if (aStr === '-') a = -1;
    else a = parseFloat(aStr);

    if (match1[2] !== undefined) {
      b = parseFloat(match1[2]);
    } else {
      b = 0;
    }
  } else {
    const match2 = clean.match(/^([+-]?\d+(?:\.\d+)?)([+-](?:\d+(?:\.\d+)?)?)x$/i);
    if (match2) {
      b = parseFloat(match2[1]);
      const aStr = match2[2];
      if (aStr === '' || aStr === '+') a = 1;
      else if (aStr === '-') a = -1;
      else a = parseFloat(aStr);
    }
  }

  if (a === null || isNaN(a) || isNaN(b)) {
    return { success: false, error: 'Could not recognize the linear function. Please format like 2x + 3 or f(x) = 2x + 3.' };
  }

  if (a === 0) {
    return { success: false, error: 'The coefficient of x cannot be 0. A constant function cannot be inverted!' };
  }

  const aPart = a === 1 ? 'x' : (a === -1 ? '-x' : `${a}x`);
  const bPart = b > 0 ? ` + ${b}` : (b < 0 ? ` - ${Math.abs(b)}` : '');
  const display = `f(x) = ${aPart}${bPart}`;

  let gDisplay = '';
  if (b === 0) {
    gDisplay = a === 1 ? 'g(x) = x' : (a === -1 ? 'g(x) = -x' : `g(x) = x / ${a}`);
  } else if (b > 0) {
    gDisplay = a === 1 ? `g(x) = x - ${b}` : (a === -1 ? `g(x) = -(x - ${b})` : `g(x) = (x - ${b}) / ${a}`);
  } else {
    gDisplay = a === 1 ? `g(x) = x + ${Math.abs(b)}` : (a === -1 ? `g(x) = -(x + ${Math.abs(b)})` : `g(x) = (x + ${Math.abs(b)}) / ${a}`);
  }

  return { success: true, a, b, display, gDisplay };
}

export default function InverseStudioModule({ onBack, onNext }) {
  // activeStep: 1..10, 'summary'
  const [activeStep, setActiveStep] = useState(1);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);

  // Question 1: Linear function input (learner enters their own function)
  const [q1FuncInput, setQ1FuncInput] = useState('');
  const [activeFunc, setActiveFunc] = useState(null);
  const [q1Done, setQ1Done] = useState(false);
  const [q1FuncError, setQ1FuncError] = useState(null);

  // Question 2 (Part a): Backward Thinking: f(alpha) = y1 and f(alpha) = y2
  const [q2Val1, setQ2Val1] = useState('');
  const [q2Val2, setQ2Val2] = useState('');
  const [q2Part1Done, setQ2Part1Done] = useState(false);
  const [q2Part2Done, setQ2Part2Done] = useState(false);
  const [q2Error, setQ2Error] = useState(null);

  // Question 3: Reverse function inquiry
  const [q3McqSelected, setQ3McqSelected] = useState(null);
  const [q3McqDone, setQ3McqDone] = useState(false);
  const [q3McqError, setQ3McqError] = useState(null);

  // Question 4: How to Undo (Reverse operations)
  const [q4OpSelected, setQ4OpSelected] = useState(null);
  const [q4OpDone, setQ4OpDone] = useState(false);
  const [q4OpError, setQ4OpError] = useState(null);

  // Question 5: Test Reverse Rule x = 10 -> f(10) & g(f(10)) = 10
  const [q5Val1, setQ5Val1] = useState('');
  const [q5Val2, setQ5Val2] = useState('');
  const [q5Part1Done, setQ5Part1Done] = useState(false);
  const [q5Part2Done, setQ5Part2Done] = useState(false);
  const [q5Error, setQ5Error] = useState(null);

  // Question 6: Swap Pattern (Input of f & Output of f)
  const [q6Selected, setQ6Selected] = useState(null);
  const [q6Done, setQ6Done] = useState(false);
  const [q6Error, setQ6Error] = useState(null);
  const [q7Selected, setQ7Selected] = useState(null);
  const [q7Done, setQ7Done] = useState(false);
  const [q7Error, setQ7Error] = useState(null);

  // Question 7: Use the Inverse f(alpha) = y_test -> g(y_test) = 5
  const [q8Val, setQ8Val] = useState('');
  const [q8Done, setQ8Done] = useState(false);
  const [q8Error, setQ8Error] = useState(null);

  // Question 8: Craft inverse for f(x) = 7x + 2
  const [q9Expr, setQ9Expr] = useState('');
  const [q9Done, setQ9Done] = useState(false);
  const [q9Error, setQ9Error] = useState(null);

  // Input refs for autofocus
  const q1InputRef = useRef(null);
  const q2Input1Ref = useRef(null);
  const q2Input2Ref = useRef(null);
  const q5Input1Ref = useRef(null);
  const q5Input2Ref = useRef(null);
  const q8InputRef = useRef(null);
  const q9InputRef = useRef(null);

  // Dynamic parameters from activeFunc (fallback to default 2x + 3 if not yet entered)
  const a = activeFunc ? activeFunc.a : 2;
  const b = activeFunc ? activeFunc.b : 3;
  const activeDisplay = activeFunc ? activeFunc.display : 'f(x) = 2x + 3';
  const activeGDisplay = activeFunc ? activeFunc.gDisplay : 'g(x) = (x - 3) / 2';
  const q2Target1 = a * 1 + b;
  const q2Target2 = a * 2 + b;
  const q3Target = a * 4 + b;
  const q5Target = a * 10 + b;
  const q8Target = a * 5 + b;

  const getAlphaExpr = () => {
    const aPart = a === 1 ? 'α' : (a === -1 ? '-α' : `${a}α`);
    const bPart = b > 0 ? ` + ${b}` : (b < 0 ? ` - ${Math.abs(b)}` : '');
    return `${aPart}${bPart}`;
  };

  const getRuleDescription = () => {
    if (a === 1 && b === 0) return 'leaves each input unchanged.';
    if (a === 1) return `adds ${b} to each input.`;
    if (a === -1 && b === 0) return 'negates each input.';
    if (a === -1) return `negates each input and adds ${b}.`;
    if (b === 0) return `multiplies each input by ${a}.`;
    const op = b > 0 ? `adds ${b}` : `subtracts ${Math.abs(b)}`;
    return `multiplies each input by ${a}, then ${op}.`;
  };

  // Autofocus input when step changes
  useEffect(() => {
    if (activeStep === 1 && !q1Done && q1InputRef.current) {
      q1InputRef.current.focus({ preventScroll: true });
    } else if (activeStep === 2 && !q2Part1Done && q2Input1Ref.current) {
      q2Input1Ref.current.focus({ preventScroll: true });
    } else if (activeStep === 2 && q2Part1Done && !q2Part2Done && q2Input2Ref.current) {
      q2Input2Ref.current.focus({ preventScroll: true });
    } else if (activeStep === 5 && !q5Part1Done && q5Input1Ref.current) {
      q5Input1Ref.current.focus({ preventScroll: true });
    } else if (activeStep === 5 && q5Part1Done && !q5Part2Done && q5Input2Ref.current) {
      q5Input2Ref.current.focus({ preventScroll: true });
    } else if (activeStep === 7 && !q8Done && q8InputRef.current) {
      q8InputRef.current.focus({ preventScroll: true });
    } else if (activeStep === 8 && !q9Done && q9InputRef.current) {
      q9InputRef.current.focus({ preventScroll: true });
    }
  }, [
    activeStep,
    q1Done,
    q2Part1Done,
    q2Part2Done,
    q3McqDone,
    q4OpDone,
    q5Part1Done,
    q5Part2Done,
    q6Done,
    q7Done,
    q8Done,
    q9Done
  ]);

  // Auto-advance countdown on summary step
  const isSummaryStep = activeStep === 'summary';
  useEffect(() => {
    let timer;
    if (isSummaryStep && onNext) {
      if (autoAdvanceTimer === null) {
        timer = setTimeout(() => {
          setAutoAdvanceTimer(4);
        }, 0);
      } else if (autoAdvanceTimer > 0) {
        timer = setTimeout(() => {
          setAutoAdvanceTimer((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);
      } else if (autoAdvanceTimer === 0) {
        onNext();
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSummaryStep, onNext, autoAdvanceTimer]);

  // Current question metadata
  const isObs2 = activeStep === 'obs-2';
  const currentQ = isObs2
    ? { id: 'obs-2', phaseId: '1d-inverse', title: 'Key Observation' }
    : (INVERSE_QUESTIONS.find((q) => q.id === activeStep) || INVERSE_QUESTIONS[0]);
  const currentPhase = PHASES.find((p) => p.id === currentQ.phaseId) || PHASES[0];

  // Helper to determine if a step is completed
  const isStepDone = (step) => {
    if (step === 1) return q1Done;
    if (step === 2) return q2Part1Done && q2Part2Done;
    if (step === 3) return q3McqDone;
    if (step === 4) return q4OpDone;
    if (step === 5) return q5Part1Done && q5Part2Done;
    if (step === 6) return q6Done && q7Done;
    if (step === 7) return q8Done;
    if (step === 8) return q9Done;
    return false;
  };

  // Card header badge helper
  const getCardBadge = () => {
    if (activeStep === 1) return activeFunc ? activeFunc.display : null;
    if (activeStep === 2 || activeStep === 'obs-2' || activeStep === 3) return activeDisplay;
    if (activeStep === 4) return activeGDisplay;
    if (activeStep === 5) return q5Part1Done ? activeGDisplay : activeDisplay;
    if (activeStep === 6) return `${activeDisplay} & ${activeGDisplay}`;
    if (activeStep === 7) return activeGDisplay;
    if (activeStep === 8) return 'f(x) = 7x + 2';
    return null;
  };

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------

  // Helper to reset downstream 1D answers when function changes
  const resetDownstream1D = () => {
    setQ2Val1('');
    setQ2Val2('');
    setQ2Part1Done(false);
    setQ2Part2Done(false);
    setQ2Error(null);
    setQ3McqSelected(null);
    setQ3McqDone(false);
    setQ3McqError(null);
    setQ4OpSelected(null);
    setQ4OpDone(false);
    setQ4OpError(null);
    setQ5Val1('');
    setQ5Val2('');
    setQ5Part1Done(false);
    setQ5Part2Done(false);
    setQ5Error(null);
    setQ6Selected(null);
    setQ6Done(false);
    setQ6Error(null);
    setQ7Selected(null);
    setQ7Done(false);
    setQ7Error(null);
    setQ8Val('');
    setQ8Done(false);
    setQ8Error(null);
  };

  // Q1: Check and register linear function
  const handleCheckQ1 = (e) => {
    if (e) e.preventDefault();
    const res = parseLinearFunction(q1FuncInput);
    if (!res.success) {
      setQ1FuncError(res.error);
      return;
    }
    setActiveFunc(res);
    setQ1Done(true);
    setQ1FuncError(null);
    resetDownstream1D();
  };

  // Q1: Select a quick preset example
  const handleSelectPreset = (presetText) => {
    setQ1FuncInput(presetText);
    setQ1FuncError(null);
    const res = parseLinearFunction(presetText);
    if (!res.success) return;
    setActiveFunc(res);
    setQ1Done(true);
    resetDownstream1D();
  };

  // Q2: Part 1: f(alpha) = target1 -> alpha = 1
  const handleCheckQ2Part1 = (e) => {
    if (e) e.preventDefault();
    const val = parseFloat(q2Val1);
    if (isNaN(val)) {
      setQ2Error('Please enter a valid number.');
      return;
    }
    if (Math.abs(val - 1) < 0.01) {
      setQ2Part1Done(true);
      setQ2Error(null);
    } else {
      setQ2Error(`Not quite: ${a}(${val}) + ${b} = ${a * val + b}, but we need ${q2Target1}.`);
    }
  };

  // Q2: Part 2: f(alpha) = target2 -> alpha = 2
  const handleCheckQ2Part2 = (e) => {
    if (e) e.preventDefault();
    const val = parseFloat(q2Val2);
    if (isNaN(val)) {
      setQ2Error('Please enter a valid number.');
      return;
    }
    if (Math.abs(val - 2) < 0.01) {
      setQ2Part2Done(true);
      setQ2Error(null);
    } else {
      setQ2Error(`Not quite: ${a}(${val}) + ${b} = ${a * val + b}, but we need ${q2Target2}.`);
    }
  };

  // Q3: Inquiry MCQ - Can a function take output of f(x) and return input x?
  const handleSelectQ3Mcq = (id) => {
    setQ3McqSelected(id);
    if (id === 'yes') {
      setQ3McqDone(true);
      setQ3McqError(null);
    } else {
      setQ3McqDone(false);
      setQ3McqError('Functions with unique outputs can always be reversed to recover the original input!');
    }
  };

  // Q4: How to Undo - Invert operations in reverse order
  const handleSelectQ4Op = (id) => {
    setQ4OpSelected(id);
    if (id === 'correct_reverse') {
      setQ4OpDone(true);
      setQ4OpError(null);
    } else if (id === 'wrong_order') {
      setQ4OpDone(false);
      setQ4OpError('Order matters: undo addition/subtraction first, then division.');
    } else {
      setQ4OpDone(false);
      setQ4OpError('To undo a rule, perform opposite operations in reverse order.');
    }
  };

  // Q5: Part 1: f(10) = 10a + b = q5Target
  const handleCheckQ5Part1 = (e) => {
    if (e) e.preventDefault();
    const val = parseFloat(q5Val1);
    if (isNaN(val)) {
      setQ5Error('Please enter a valid number.');
      return;
    }
    if (Math.abs(val - q5Target) < 0.01) {
      setQ5Part1Done(true);
      setQ5Error(null);
    } else {
      setQ5Error(`Not quite: ${a}(10) + ${b} = ${q5Target}, but you entered ${val}.`);
    }
  };

  // Q5: Part 2: g(q5Target) = 10
  const handleCheckQ5Part2 = (e) => {
    if (e) e.preventDefault();
    const val = parseFloat(q5Val2);
    if (isNaN(val)) {
      setQ5Error('Please enter a valid number.');
      return;
    }
    if (Math.abs(val - 10) < 0.01) {
      setQ5Part2Done(true);
      setQ5Error(null);
    } else {
      setQ5Error(`Not quite: (${q5Target} - ${b}) / ${a} = 10, but you entered ${val}.`);
    }
  };

  // Q4 (Input Pattern): MCQ - What does the Input of f become?
  const handleSelectQ6 = (optId) => {
    setQ6Selected(optId);
    if (optId === 'output_of_g') {
      setQ6Done(true);
      setQ6Error(null);
    } else {
      setQ6Done(false);
      setQ6Error('Check again: Since machine g reverses machine f by returning its original input, the input of f becomes the output of g.');
    }
  };

  // Q6 (renumbered from Q7): MCQ - What did the Output of f (q5Target) become?
  const handleSelectQ7 = (optId) => {
    setQ7Selected(optId);
    if (optId === 'input_of_g') {
      setQ7Done(true);
      setQ7Error(null);
    } else {
      setQ7Done(false);
      setQ7Error(`Check again: f produced output ${q5Target}, which was fed directly as the input into g.`);
    }
  };

  // Q8: f(alpha) = q8Target -> g(q8Target) = 5
  const handleCheckQ8 = (e) => {
    if (e) e.preventDefault();
    const val = parseFloat(q8Val);
    if (isNaN(val)) {
      setQ8Error('Please enter a valid number.');
      return;
    }
    if (Math.abs(val - 5) < 0.01) {
      setQ8Done(true);
      setQ8Error(null);
    } else {
      setQ8Error(`Not quite: (${q8Target} - ${b}) / ${a} = 5.`);
    }
  };

  // Q9: Find g(x) for f(x) = 7x + 2 -> g(x) = (x - 2)/7
  const handleCheckQ9 = (e) => {
    if (e) e.preventDefault();
    if (!q9Expr.trim()) {
      setQ9Error('Please enter an expression in terms of x.');
      return;
    }

    const testPoints = [2, 9, 16, -5];
    let allPassed = true;
    for (const testX of testPoints) {
      const expected = (testX - 2) / 7;
      const actual = evaluate1DExpression(q9Expr, testX);
      if (isNaN(actual) || Math.abs(actual - expected) > 0.001) {
        allPassed = false;
        break;
      }
    }

    if (allPassed) {
      setQ9Done(true);
      setQ9Error(null);
    } else {
      const plusCheck = evaluate1DExpression(q9Expr, 2);
      if (Math.abs(plusCheck - 4 / 7) < 0.001) {
        setQ9Error('Close! To undo +2, remember to subtract 2: (x - 2) / 7.');
      } else {
        setQ9Error('Not quite. To undo 7x + 2: subtract 2 first, then divide by 7.');
      }
    }
  };

  // Reset module to start
  const handleResetModule = () => {
    setActiveStep(1);
    setQ1FuncInput('');
    setActiveFunc(null);
    setQ1Done(false);
    setQ1FuncError(null);
    resetDownstream1D();
    setQ9Expr('');
    setQ9Done(false);
    setQ9Error(null);
  };

  return (
    <div className="fs-studio-wrapper">
      {/* Top Nav */}
      <div className="fs-top-nav">
        <button className="fs-back-btn" onClick={onBack || (() => {})}>
          ← Exit Studio
        </button>
        <span className="fs-progress-badge">
          Step {activeStep === 'summary' ? 9 : (isObs2 ? '2' : activeStep)} / 9
        </span>
      </div>

      {/* Header */}
      <div className="fs-header">
        <h1 className="fs-title" style={{ fontSize: '1.4rem', margin: 0 }}>🔄 Inverse Studio</h1>
      </div>

      {/* Stepper Bar */}
      <div className="fs-stepper-bar">
        {[1, 2, 3, 4, 5, 6, 7, 8, 'summary'].map((step) => {
          const isAct = activeStep === step || (activeStep === 'obs-2' && step === 2);
          const isDone = isStepDone(step);
          const label = step === 'summary' ? '★' : `Q${step}`;
          return (
            <button
              key={String(step)}
              className={`fs-step-pill ${isAct ? 'active' : ''} ${isDone ? 'completed' : ''}`}
              onClick={() => {
                if (step === 1 || q1Done) {
                  setActiveStep(step);
                }
              }}
              disabled={step !== 1 && !q1Done}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* CARD WRAPPER */}
      <div className="fs-card">
        {/* Card Header */}
        <div className="fs-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="fs-question-badge">
              {activeStep === 'summary' ? 'DISCOVERY' : (isObs2 ? 'OBSERVATION' : `Q${activeStep}`)}
            </span>
            <span className="fs-topic-badge">{currentQ.title}</span>
            {getCardBadge() && (
              <span className="fs-card-line-badge">{getCardBadge()}</span>
            )}
          </div>
          <span className="fs-question-num">
            {activeStep === 'summary'
              ? 'Discovery Summary'
              : (isObs2 ? 'Key Observation' : `Question ${activeStep} of ${INVERSE_QUESTIONS.length - 1}`)}
          </span>
        </div>

        {/* ======================================================== */}
        {/* QUESTION 1: ENTER A RANDOM FUNCTION                      */}
        {/* ======================================================== */}
        {activeStep === 1 && (
          <div className="fs-step-intro-block">
            {q1Done && activeFunc ? (
              <>
                <div className="fs-equation-pill-bar">
                  <span className="fs-equation-pill-label">Function:</span>
                  <span className="fs-equation-pill-val">{activeDisplay}</span>
                </div>

                <h3 className="fs-step-heading">
                  Rule Locked: <span className="fs-equation-highlight">{activeDisplay}</span>
                </h3>
                <p className="fs-step-subtext">
                  Your forward rule is ready. It {getRuleDescription()}
                </p>

                {/* Machine Diagram for the Forward Function */}
                <div className="fs-machine-diagram">
                  <div className="fs-diagram-box input-box">
                    <span className="fs-diagram-label">INPUT</span>
                    <span className="fs-diagram-val">x</span>
                  </div>
                  <span className="fs-diagram-arrow">──▶</span>
                  <div className="fs-diagram-box machine-box" style={{ minWidth: '150px' }}>
                    <span className="fs-diagram-label">FORWARD RULE f</span>
                    <span className="fs-diagram-val">{activeDisplay}</span>
                  </div>
                  <span className="fs-diagram-arrow">──▶</span>
                  <div className="fs-diagram-box output-box">
                    <span className="fs-diagram-label">OUTPUT</span>
                    <span className="fs-diagram-val">f(x)</span>
                  </div>
                </div>

                <div className="fs-inquiry-feedback success" style={{ marginTop: '0.85rem' }}>
                  <span>✓</span>
                  <span>
                    Linear function registered! In the next questions, we'll discover how to undo this rule and recover inputs from outputs.
                  </span>
                </div>

                {/* Footer Navigation */}
                <div className="fs-step-footer-actions between" style={{ marginTop: '1.25rem' }}>
                  <button
                    className="fs-btn-secondary"
                    onClick={() => {
                      setQ1Done(false);
                      setTimeout(() => q1InputRef.current?.focus(), 50);
                    }}
                  >
                    ✏️ Change Function
                  </button>
                  <button
                    className="fs-btn-primary"
                    onClick={() => setActiveStep(2)}
                  >
                    Continue to Question 2 →
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="fs-step-heading">
                  Enter a random linear function:
                </h3>
                <p className="fs-step-subtext">
                  Type any linear rule of the form <strong>f(x) = ax + b</strong> (for example, <code>2x + 3</code> or <code>3x - 1</code>):
                </p>

                {/* Quick Presets */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.65rem 0', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-soft)', fontWeight: 600 }}>Try an example:</span>
                  {['2x + 3', '3x + 4', '4x - 1'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="fs-tray-shortcut-chip"
                      onClick={() => handleSelectPreset(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <form className="fs-tray-input-row" onSubmit={handleCheckQ1} style={{ marginTop: '0.65rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--clr-accent)', fontSize: '1.05rem', fontFamily: 'monospace' }}>f(x) =</span>
                  <input
                    ref={q1InputRef}
                    type="text"
                    className="fs-tray-input-box"
                    placeholder="e.g. 2x + 3"
                    style={{ minWidth: '180px', maxWidth: '240px', textAlign: 'center' }}
                    value={q1FuncInput}
                    onChange={(e) => {
                      setQ1FuncInput(e.target.value);
                      setQ1FuncError(null);
                    }}
                  />
                  <button type="submit" className="fs-tray-submit-btn">
                    Set Function ➔
                  </button>
                </form>

                {q1FuncError && (
                  <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                    <span>ℹ</span>
                    <span>{q1FuncError}</span>
                  </div>
                )}

                {/* Footer Navigation */}
                <div className="fs-step-footer-actions end" style={{ marginTop: '1.25rem' }}>
                  <button
                    className="fs-btn-primary"
                    disabled={true}
                  >
                    Continue to Question 2 →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* QUESTION 2 (Part a): BACKWARD THINKING                   */}
        {/* ======================================================== */}
        {activeStep === 2 && (
          <div className="fs-step-intro-block">
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">Function:</span>
              <span className="fs-equation-pill-val">{activeDisplay}</span>
            </div>

            {/* CASE 1: Solve for alpha when f(alpha) = q2Target1 */}
            {!q2Part1Done && (
              <>
                <h3 className="fs-step-heading">
                  If <span className="fs-equation-highlight">f(α) = {q2Target1}</span>, what is the input <span style={{ color: 'var(--clr-accent)', fontWeight: 800 }}>α</span>?
                </h3>
                <p className="fs-step-subtext">
                  Find input <strong>α</strong> such that <span className="fs-equation-highlight">{getAlphaExpr()} = {q2Target1}</span>:
                </p>

                {/* Machine Diagram for Case 1 */}
                <div className="fs-machine-diagram">
                  <div className="fs-diagram-box input-box" style={{ borderColor: 'var(--clr-accent)' }}>
                    <span className="fs-diagram-label">INPUT</span>
                    <span className="fs-diagram-val" style={{ color: 'var(--clr-accent)' }}>α = ?</span>
                  </div>
                  <span className="fs-diagram-arrow">──▶</span>
                  <div className="fs-diagram-box machine-box" style={{ minWidth: '140px' }}>
                    <span className="fs-diagram-label">FORWARD RULE f</span>
                    <span className="fs-diagram-val">{activeDisplay}</span>
                  </div>
                  <span className="fs-diagram-arrow">──▶</span>
                  <div className="fs-diagram-box output-box">
                    <span className="fs-diagram-label">GIVEN OUTPUT</span>
                    <span className="fs-diagram-val">{q2Target1}</span>
                  </div>
                </div>
              </>
            )}

            {/* CASE 2: Solve for alpha when f(alpha) = q2Target2 */}
            {q2Part1Done && !q2Part2Done && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', borderRadius: '9999px', padding: '0.2rem 0.65rem', fontSize: '0.78rem', fontWeight: 700 }}>
                    ✓ Case 1 Solved: f(1) = {q2Target1} (α = 1)
                  </span>
                </div>

                <h3 className="fs-step-heading">
                  Now if <span className="fs-equation-highlight">f(α) = {q2Target2}</span>, what is the input <span style={{ color: 'var(--clr-accent)', fontWeight: 800 }}>α</span>?
                </h3>
                <p className="fs-step-subtext">
                  Find input <strong>α</strong> such that <span className="fs-equation-highlight">{getAlphaExpr()} = {q2Target2}</span>:
                </p>

                {/* Machine Diagram for Case 2 */}
                <div className="fs-machine-diagram">
                  <div className="fs-diagram-box input-box" style={{ borderColor: 'var(--clr-accent)' }}>
                    <span className="fs-diagram-label">INPUT</span>
                    <span className="fs-diagram-val" style={{ color: 'var(--clr-accent)' }}>α = ?</span>
                  </div>
                  <span className="fs-diagram-arrow">──▶</span>
                  <div className="fs-diagram-box machine-box" style={{ minWidth: '140px' }}>
                    <span className="fs-diagram-label">FORWARD RULE f</span>
                    <span className="fs-diagram-val">{activeDisplay}</span>
                  </div>
                  <span className="fs-diagram-arrow">──▶</span>
                  <div className="fs-diagram-box output-box">
                    <span className="fs-diagram-label">GIVEN OUTPUT</span>
                    <span className="fs-diagram-val">{q2Target2}</span>
                  </div>
                </div>
              </>
            )}

            {/* BOTH SOLVED: Summary Showcase */}
            {q2Part1Done && q2Part2Done && (
              <>
                <h3 className="fs-step-heading">
                  Both Inputs Recovered!
                </h3>
                <p className="fs-step-subtext">
                  You solved backwards from each output to find its original input:
                </p>

                {/* Two-case Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', margin: '0.85rem 0' }}>
                  <div className="fs-diagram-box" style={{ padding: '0.85rem', alignItems: 'center' }}>
                    <span className="fs-diagram-label" style={{ color: 'var(--clr-accent)' }}>CASE 1</span>
                    <span className="fs-diagram-val" style={{ fontSize: '1.05rem', margin: '0.2rem 0' }}>f(1) = {q2Target1}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)' }}>
                      Output {q2Target1} ➔ Input <strong style={{ color: '#ffffff' }}>α = 1</strong>
                    </span>
                  </div>
                  <div className="fs-diagram-box" style={{ padding: '0.85rem', alignItems: 'center' }}>
                    <span className="fs-diagram-label" style={{ color: 'var(--clr-accent)' }}>CASE 2</span>
                    <span className="fs-diagram-val" style={{ fontSize: '1.05rem', margin: '0.2rem 0' }}>f(2) = {q2Target2}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)' }}>
                      Output {q2Target2} ➔ Input <strong style={{ color: '#ffffff' }}>α = 2</strong>
                    </span>
                  </div>
                </div>

                <div className="fs-inquiry-feedback success" style={{ marginTop: '0.85rem' }}>
                  <span>✓</span>
                  <span>
                    Great job! Both outputs verified. Ready for the key observation?
                  </span>
                </div>
              </>
            )}

            {/* GeoGebra Algebra View Output Panel (Shown Above Input Box) */}
            <div className="fs-ggb-algebra-panel" style={{ marginTop: '1.15rem' }}>
              <span className="fs-ggb-algebra-title">
                📐 GeoGebra Algebra View
              </span>

              {/* Function Rule Entry */}
              <div className="fs-ggb-algebra-item">
                <div className="fs-ggb-gutter">
                  <div className="fs-ggb-vis-circle line" />
                </div>
                <div className="fs-ggb-algebra-body">
                  <div className="fs-ggb-algebra-row">
                    <span className="fs-ggb-algebra-expr">{activeDisplay}</span>
                    <span className="fs-ggb-algebra-dots">⋮</span>
                  </div>
                </div>
              </div>

              {/* Case 1 Evaluation Entry */}
              <div className="fs-ggb-algebra-item">
                <div className="fs-ggb-gutter">
                  <div className="fs-ggb-vis-circle" />
                </div>
                <div className="fs-ggb-algebra-body">
                  <div className="fs-ggb-algebra-row">
                    <span className="fs-ggb-algebra-expr">{q2Part1Done ? 'f(1)' : 'f(α)'}</span>
                    <span className="fs-ggb-algebra-dots">⋮</span>
                  </div>
                  <div className="fs-ggb-algebra-result">
                    <span className="eq">=</span>
                    <span className="val">{q2Target1}</span>
                  </div>
                </div>
              </div>

              {/* Case 2 Evaluation Entry (visible once Case 1 is solved) */}
              {q2Part1Done && (
                <div className="fs-ggb-algebra-item">
                  <div className="fs-ggb-gutter">
                    <div className="fs-ggb-vis-circle" />
                  </div>
                  <div className="fs-ggb-algebra-body">
                    <div className="fs-ggb-algebra-row">
                      <span className="fs-ggb-algebra-expr">{q2Part2Done ? 'f(2)' : 'f(α)'}</span>
                      <span className="fs-ggb-algebra-dots">⋮</span>
                    </div>
                    <div className="fs-ggb-algebra-result">
                      <span className="eq">=</span>
                      <span className="val">{q2Target2}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* INPUT BOX SHIFTED BELOW GEOGEBRA ALGEBRA VIEW */}
            {!q2Part1Done && (
              <form className="fs-tray-input-row" onSubmit={handleCheckQ2Part1} style={{ marginTop: '0.85rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--clr-accent)', fontSize: '1.05rem', fontFamily: 'monospace' }}>α =</span>
                <input
                  ref={q2Input1Ref}
                  type="text"
                  className="fs-tray-input-box"
                  placeholder="?"
                  style={{ maxWidth: '95px', textAlign: 'center' }}
                  value={q2Val1}
                  onChange={(e) => {
                    setQ2Val1(e.target.value);
                    setQ2Error(null);
                  }}
                />
                <button type="submit" className="fs-tray-submit-btn">
                  Check ➔
                </button>
              </form>
            )}

            {q2Part1Done && !q2Part2Done && (
              <form className="fs-tray-input-row" onSubmit={handleCheckQ2Part2} style={{ marginTop: '0.85rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--clr-accent)', fontSize: '1.05rem', fontFamily: 'monospace' }}>α =</span>
                <input
                  ref={q2Input2Ref}
                  type="text"
                  className="fs-tray-input-box"
                  placeholder="?"
                  style={{ maxWidth: '95px', textAlign: 'center' }}
                  value={q2Val2}
                  onChange={(e) => {
                    setQ2Val2(e.target.value);
                    setQ2Error(null);
                  }}
                />
                <button type="submit" className="fs-tray-submit-btn">
                  Check ➔
                </button>
              </form>
            )}

            {q2Error && (
              <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                <span>ℹ</span>
                <span>{q2Error}</span>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="fs-step-footer-actions between" style={{ marginTop: '1.25rem' }}>
              <button className="fs-btn-secondary" onClick={() => setActiveStep(1)}>
                ← Back to Question 1
              </button>
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep('obs-2')}
                disabled={!(q2Part1Done && q2Part2Done)}
              >
                Continue to Observation →
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* OBSERVATION AFTER QUESTION 2: INVERSE INTUITION          */}
        {/* ======================================================== */}
        {activeStep === 'obs-2' && (
          <div className="fs-step-intro-block">
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">Function:</span>
              <span className="fs-equation-pill-val">{activeDisplay}</span>
            </div>

            <div className="fs-handover-box" style={{ padding: '1.75rem 1.25rem', textAlign: 'center' }}>
              <span className="fs-handover-badge">💡 Observation</span>
              <h3 style={{ margin: '0.85rem 0 0.4rem', fontSize: '1.25rem', color: '#f3efe6', fontWeight: 700 }}>
                Look here: you found input from output of the function.
              </h3>
              <p style={{ fontSize: '1.05rem', color: 'var(--clr-accent, #e8864a)', fontWeight: 600, margin: '0.35rem 0 1.25rem' }}>
                Don't you think that is inverse of what a function generally does?
              </p>

              <div className="fs-machine-diagram" style={{ margin: '1rem auto' }}>
                <div className="fs-diagram-box input-box">
                  <span className="fs-diagram-label">FUNCTION</span>
                  <span className="fs-diagram-val">Input ➔ Output</span>
                </div>
                <span className="fs-diagram-arrow">vs</span>
                <div className="fs-diagram-box machine-box" style={{ borderColor: 'var(--clr-accent)' }}>
                  <span className="fs-diagram-label" style={{ color: 'var(--clr-accent)' }}>INVERSE</span>
                  <span className="fs-diagram-val" style={{ color: 'var(--clr-accent)' }}>Output ➔ Input</span>
                </div>
              </div>
            </div>

            {/* Step Footer Navigation */}
            <div className="fs-step-footer-actions between" style={{ marginTop: '1.25rem' }}>
              <button className="fs-btn-secondary" onClick={() => setActiveStep(2)}>
                ← Back to Question 2
              </button>
              <button className="fs-btn-primary" onClick={() => setActiveStep(3)}>
                Continue to Question 3 →
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* QUESTION 3: REVERSE FUNCTION INQUIRY                     */}
        {/* ======================================================== */}
        {activeStep === 3 && (
          <div className="fs-step-intro-block">
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">Function:</span>
              <span className="fs-equation-pill-val">{activeDisplay}</span>
            </div>
            <h3 className="fs-step-heading">
              Can we have a function that takes the output of <span className="fs-equation-highlight">f(x)</span> and returns the original input <span className="fs-equation-highlight">x</span>?
            </h3>
            <p className="fs-step-subtext">
              Instead of solving equations backwards one by one, can a single function reverse this mapping?
            </p>

            {/* MCQ Options */}
            <div className="fs-options-grid">
              {[
                { id: 'yes', text: 'Yes, a reverse function', isCorrect: true },
                { id: 'no', text: 'No, functions only go forward', isCorrect: false }
              ].map((opt, idx) => {
                const isSelected = q3McqSelected === opt.id || (q3McqDone && opt.id === 'yes');
                let btnClass = 'fs-option-btn';
                if (isSelected) {
                  btnClass += opt.isCorrect ? ' correct' : ' incorrect';
                }
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={opt.id}
                    className={btnClass}
                    onClick={() => handleSelectQ3Mcq(opt.id)}
                    disabled={q3McqDone}
                  >
                    <span className="fs-option-letter">{letter}</span>
                    <span style={{ flex: 1 }}>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {q3McqDone && (
              <div className="fs-inquiry-feedback success">
                <span>✓</span>
                <span>
                  Exactly! A function that takes outputs and returns original inputs is called an <strong>inverse function</strong>.
                </span>
              </div>
            )}

            {q3McqError && (
              <div className="fs-inquiry-feedback error">
                <span>ℹ</span>
                <span>{q3McqError}</span>
              </div>
            )}

            {/* Navigation */}
            <div className="fs-step-footer-actions between">
              <button className="fs-btn-secondary" onClick={() => setActiveStep('obs-2')}>
                ← Back to Observation
              </button>
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep(4)}
                disabled={!q3McqDone}
              >
                Continue to Question 4 →
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* QUESTION 4: HOW TO UNDO (REVERSE OPERATIONS)             */}
        {/* ======================================================== */}
        {activeStep === 4 && (
          <div className="fs-step-intro-block">
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">Forward Rule:</span>
              <span className="fs-equation-pill-val">{activeDisplay}</span>
            </div>
            <h3 className="fs-step-heading">
              How do we undo <span className="fs-equation-highlight">{activeDisplay}</span>?
            </h3>
            <p className="fs-step-subtext">
              Reverse each operation in opposite order:
            </p>

            <div className="fs-options-grid">
              {[
                {
                  id: 'correct_reverse',
                  text: b !== 0
                    ? `${b > 0 ? `Subtract ${b}` : `Add ${Math.abs(b)}`}, then divide by ${a} ➔ ${activeGDisplay}`
                    : `Divide by ${a} ➔ ${activeGDisplay}`,
                  isCorrect: true
                },
                {
                  id: 'wrong_order',
                  text: b !== 0
                    ? `Divide by ${a}, then ${b > 0 ? `subtract ${b}` : `add ${Math.abs(b)}`} ➔ g(x) = (x/${a}) ${b > 0 ? `- ${b}` : `+ ${Math.abs(b)}`}`
                    : `Multiply by ${a} ➔ g(x) = ${a}x`,
                  isCorrect: false
                },
                {
                  id: 'wrong_ops',
                  text: `Multiply by ${a}, then ${b > 0 ? `add ${b}` : `subtract ${Math.abs(b)}`} ➔ ${activeDisplay}`,
                  isCorrect: false
                }
              ].map((opt, idx) => {
                const isSelected = q4OpSelected === opt.id;
                let btnClass = 'fs-option-btn';
                if (isSelected) {
                  btnClass += opt.isCorrect ? ' correct' : ' incorrect';
                }
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={opt.id}
                    className={btnClass}
                    onClick={() => handleSelectQ4Op(opt.id)}
                    disabled={q4OpDone}
                  >
                    <span className="fs-option-letter">{letter}</span>
                    <span style={{ flex: 1 }}>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {q4OpDone && (
              <div className="fs-inquiry-feedback success">
                <span>✓</span>
                <span>
                  Correct! The reverse rule is <strong className="fs-equation-highlight">{activeGDisplay}</strong>.
                </span>
              </div>
            )}

            {q4OpError && (
              <div className="fs-inquiry-feedback error">
                <span>ℹ</span>
                <span>{q4OpError}</span>
              </div>
            )}

            {/* Navigation */}
            <div className="fs-step-footer-actions between">
              <button className="fs-btn-secondary" onClick={() => setActiveStep(3)}>
                ← Back to Question 3
              </button>
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep(5)}
                disabled={!q4OpDone}
              >
                Continue to Question 5 →
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* QUESTION 5: TEST REVERSE RULE (x = 10)                   */}
        {/* ======================================================== */}
        {activeStep === 5 && (
          <div className="fs-step-intro-block">
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">{q5Part1Done ? 'Undo Rule:' : 'Function:'}</span>
              <span className="fs-equation-pill-val">{q5Part1Done ? activeGDisplay : activeDisplay}</span>
            </div>
            <h3 className="fs-step-heading">
              Test with input <span className="fs-equation-highlight">x = 10</span>:
            </h3>

            {/* Substep 1: f(10) */}
            {!q5Part1Done && (
              <div>
                <p className="fs-step-subtext" style={{ marginBottom: '0.65rem' }}>
                  First, compute forward output:
                </p>
                <form className="fs-tray-input-row" onSubmit={handleCheckQ5Part1}>
                  <span style={{ fontWeight: 800, color: 'var(--clr-accent)', fontSize: '1.05rem' }}>f(10) =</span>
                  <input
                    ref={q5Input1Ref}
                    type="text"
                    className="fs-tray-input-box"
                    placeholder="?"
                    style={{ maxWidth: '95px', textAlign: 'center' }}
                    value={q5Val1}
                    onChange={(e) => {
                      setQ5Val1(e.target.value);
                      setQ5Error(null);
                    }}
                  />
                  <button type="submit" className="fs-tray-submit-btn">
                    Check ➔
                  </button>
                </form>
              </div>
            )}

            {q5Part1Done && (
              <div className="fs-inquiry-feedback success">
                <span>✓</span>
                <span>Forward run complete: <strong>f(10) = {q5Target}</strong></span>
              </div>
            )}

            {/* Substep 2: g(q5Target) */}
            {q5Part1Done && !q5Part2Done && (
              <div style={{ marginTop: '1.15rem' }}>
                <div className="fs-equation-pill-bar" style={{ marginBottom: '0.45rem' }}>
                  <span className="fs-equation-pill-label">Undo Rule:</span>
                  <span className="fs-equation-pill-val">{activeGDisplay}</span>
                </div>
                <p className="fs-step-subtext" style={{ marginBottom: '0.65rem' }}>
                  Now feed output <strong>{q5Target}</strong> into the undo rule to reverse it:
                </p>
                <form className="fs-tray-input-row" onSubmit={handleCheckQ5Part2}>
                  <span style={{ fontWeight: 800, color: 'var(--clr-accent)', fontSize: '1.05rem' }}>g({q5Target}) =</span>
                  <input
                    ref={q5Input2Ref}
                    type="text"
                    className="fs-tray-input-box"
                    placeholder="?"
                    style={{ maxWidth: '95px', textAlign: 'center' }}
                    value={q5Val2}
                    onChange={(e) => {
                      setQ5Val2(e.target.value);
                      setQ5Error(null);
                    }}
                  />
                  <button type="submit" className="fs-tray-submit-btn">
                    Check ➔
                  </button>
                </form>
              </div>
            )}

            {q5Part2Done && (
              <div className="fs-inquiry-feedback success">
                <span>✓</span>
                <span>Reverse run complete: <strong>g({q5Target}) = 10</strong></span>
              </div>
            )}

            {q5Error && (
              <div className="fs-inquiry-feedback error">
                <span>ℹ</span>
                <span>{q5Error}</span>
              </div>
            )}

            {/* Observation callout */}
            {q5Part1Done && q5Part2Done && (
              <div className="fs-observation-callout">
                <span className="fs-obs-badge">💡 Observation</span>
                <div>
                  Again, 10 ➔ f ➔ {q5Target} ➔ g ➔ 10. Feeding the output of <strong>f</strong> into <strong>g</strong> brought us right back to our starting input!
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="fs-step-footer-actions between">
              <button className="fs-btn-secondary" onClick={() => setActiveStep(4)}>
                ← Back to Question 4
              </button>
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep(6)}
                disabled={!(q5Part1Done && q5Part2Done)}
              >
                Continue to Question 6 →
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* QUESTION 6: SWAP PATTERN                                 */}
        {/* ======================================================== */}
        {activeStep === 6 && (
          <div className="fs-step-intro-block">
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">Round Trip:</span>
              <span className="fs-equation-pill-val">10 ➔ f ➔ {q5Target} ➔ g ➔ 10</span>
            </div>
            <h3 className="fs-step-heading">
              Notice the Swap Pattern:
            </h3>
            <p className="fs-step-subtext">
              Look closely at what happened during the test: machine <strong>f</strong> took <strong>10</strong> and produced <strong>{q5Target}</strong>. Then machine <strong>g</strong> took <strong>{q5Target}</strong> and gave back <strong>10</strong>.
            </p>

            {/* Part 1: Input of f */}
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.45rem', color: 'var(--clr-text)' }}>
                1. The <span className="fs-equation-highlight">Input of f</span> (10) became the:
              </div>
              <div className="fs-options-grid">
                {[
                  { id: 'input_of_g', text: 'Input of g', isCorrect: false },
                  { id: 'output_of_g', text: 'Output of g', isCorrect: true }
                ].map((opt, idx) => {
                  const isSelected = q6Selected === opt.id;
                  let btnClass = 'fs-option-btn';
                  if (isSelected) {
                    btnClass += opt.isCorrect ? ' correct' : ' incorrect';
                  }
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <button
                      key={opt.id}
                      className={btnClass}
                      onClick={() => handleSelectQ6(opt.id)}
                      disabled={q6Done}
                    >
                      <span className="fs-option-letter">{letter}</span>
                      <span style={{ flex: 1 }}>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {q6Done && (
                <div className="fs-inquiry-feedback success" style={{ marginTop: '0.45rem' }}>
                  <span>✓</span>
                  <span>
                    Correct! The <strong>Input of f</strong> (10) became the <strong>Output of g</strong>.
                  </span>
                </div>
              )}

              {q6Error && (
                <div className="fs-inquiry-feedback error" style={{ marginTop: '0.45rem' }}>
                  <span>ℹ</span>
                  <span>{q6Error}</span>
                </div>
              )}
            </div>

            {/* Part 2: Output of f (reveals after Part 1) */}
            {q6Done && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.45rem', color: 'var(--clr-text)' }}>
                  2. The <span className="fs-equation-highlight">Output of f</span> ({q5Target}) became the:
                </div>
                <div className="fs-options-grid">
                  {[
                    { id: 'input_of_g', text: 'Input of g', isCorrect: true },
                    { id: 'output_of_g', text: 'Output of g', isCorrect: false }
                  ].map((opt, idx) => {
                    const isSelected = q7Selected === opt.id;
                    let btnClass = 'fs-option-btn';
                    if (isSelected) {
                      btnClass += opt.isCorrect ? ' correct' : ' incorrect';
                    }
                    const letter = String.fromCharCode(65 + idx);
                    return (
                      <button
                        key={opt.id}
                        className={btnClass}
                        onClick={() => handleSelectQ7(opt.id)}
                        disabled={q7Done}
                      >
                        <span className="fs-option-letter">{letter}</span>
                        <span style={{ flex: 1 }}>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {q7Done && (
                  <div className="fs-inquiry-feedback success" style={{ marginTop: '0.45rem' }}>
                    <span>✓</span>
                    <span>
                      Correct! The <strong>Output of f</strong> ({q5Target}) became the <strong>Input of g</strong>.
                    </span>
                  </div>
                )}

                {q7Error && (
                  <div className="fs-inquiry-feedback error" style={{ marginTop: '0.45rem' }}>
                    <span>ℹ</span>
                    <span>{q7Error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Observation callout when both parts done */}
            {q6Done && q7Done && (
              <div className="fs-observation-callout" style={{ marginTop: '1.2rem' }}>
                <span className="fs-obs-badge">💡 Observation</span>
                <div>
                  Machine <strong>g</strong> systematically reverses <strong>f</strong> by swapping inputs and outputs! Because <strong>g</strong> undoes <strong>f</strong>, we call <strong>g</strong> the <strong>Inverse Function</strong> of <strong>f</strong>, written as <span className="fs-equation-highlight" style={{ fontSize: '0.95rem' }}>g = f⁻¹</span>.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="fs-step-footer-actions between">
              <button className="fs-btn-secondary" onClick={() => setActiveStep(5)}>
                ← Back to Question 5
              </button>
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep(7)}
                disabled={!(q6Done && q7Done)}
              >
                Continue to Question 7 →
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* QUESTION 7: USE THE INVERSE                              */}
        {/* ======================================================== */}
        {activeStep === 7 && (
          <div className="fs-step-intro-block">
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">Inverse Function:</span>
              <span className="fs-equation-pill-val">{activeGDisplay}</span>
            </div>
            <h3 className="fs-step-heading">
              If <span className="fs-equation-highlight">f(α) = {q8Target}</span>, find <span className="fs-equation-highlight">α</span> using the inverse:
            </h3>
            <p className="fs-step-subtext">
              Put output <strong>{q8Target}</strong> directly into <strong>g = f⁻¹</strong> to recover <strong>α</strong> without solving backwards from scratch:
            </p>

            {!q8Done && (
              <form className="fs-tray-input-row" onSubmit={handleCheckQ8} style={{ marginTop: '0.65rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
                  α = g({q8Target}) =
                </span>
                <input
                  ref={q8InputRef}
                  type="text"
                  className="fs-tray-input-box"
                  placeholder="?"
                  style={{ maxWidth: '95px', textAlign: 'center' }}
                  value={q8Val}
                  onChange={(e) => {
                    setQ8Val(e.target.value);
                    setQ8Error(null);
                  }}
                />
                <button type="submit" className="fs-tray-submit-btn">
                  Check ➔
                </button>
              </form>
            )}

            {q8Done && (
              <div className="fs-inquiry-feedback success">
                <span>✓</span>
                <span>
                  Correct! <strong>α = 5</strong>, because <strong>f⁻¹({q8Target}) = 5</strong> and <strong>f(5) = {q8Target}</strong>!
                </span>
              </div>
            )}

            {q8Error && (
              <div className="fs-inquiry-feedback error">
                <span>ℹ</span>
                <span>{q8Error}</span>
              </div>
            )}

            {q8Done && (
              <div className="fs-observation-callout">
                <span className="fs-obs-badge">💡 Observation</span>
                <div>
                  The inverse function <span className="fs-equation-highlight" style={{ fontSize: '0.92rem' }}>f⁻¹</span> turns any output back into its original input in a single step!
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="fs-step-footer-actions between">
              <button className="fs-btn-secondary" onClick={() => setActiveStep(6)}>
                ← Back to Question 6
              </button>
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep(8)}
                disabled={!q8Done}
              >
                Continue to Question 8 →
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* QUESTION 8: CRAFT INVERSE                                */}
        {/* ======================================================== */}
        {activeStep === 8 && (
          <div className="fs-step-intro-block">
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">Function:</span>
              <span className="fs-equation-pill-val">f(x) = 7x + 2</span>
            </div>
            <h3 className="fs-step-heading">
              Build the inverse function <span className="fs-equation-highlight">g(x)</span>:
            </h3>
            <p className="fs-step-subtext">
              Find the rule <strong>g(x)</strong> that reverses whatever <strong>f(x) = 7x + 2</strong> does:
            </p>

            {!q9Done && (
              <form className="fs-tray-input-row" onSubmit={handleCheckQ9} style={{ marginTop: '0.65rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--clr-accent)', fontSize: '1.05rem' }}>
                  g(x) =
                </span>
                <input
                  ref={q9InputRef}
                  type="text"
                  className="fs-tray-input-box"
                  placeholder="(x - 2)/7"
                  style={{ minWidth: '160px', maxWidth: '200px', textAlign: 'center' }}
                  value={q9Expr}
                  onChange={(e) => {
                    setQ9Expr(e.target.value);
                    setQ9Error(null);
                  }}
                />
                <button type="submit" className="fs-tray-submit-btn">
                  Check ➔
                </button>
              </form>
            )}

            {q9Done && (
              <div className="fs-inquiry-feedback success">
                <span>✓</span>
                <span>
                  Correct! <strong>g(x) = (x - 2) / 7</strong>. You just built the inverse <span className="fs-equation-highlight" style={{ fontSize: '0.92rem' }}>f⁻¹(x) = (x - 2)/7</span>!
                </span>
              </div>
            )}

            {q9Error && (
              <div className="fs-inquiry-feedback error">
                <span>ℹ</span>
                <span>{q9Error}</span>
              </div>
            )}

            {/* Navigation */}
            <div className="fs-step-footer-actions between">
              <button className="fs-btn-secondary" onClick={() => setActiveStep(7)}>
                ← Back to Question 7
              </button>
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep('summary')}
                disabled={!q9Done}
              >
                Continue to Summary →
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUMMARY                                                  */}
        {/* ======================================================== */}
        {activeStep === 'summary' && (
          <div className="fs-step-intro-block">
            <h3 className="fs-step-heading" style={{ textAlign: 'center' }}>
              Summary: The Inverse Function
            </h3>

            <table className="fs-summary-table" style={{ margin: '0.65rem 0' }}>
              <thead>
                <tr>
                  <th>Concept</th>
                  <th>Forward Rule f</th>
                  <th>Inverse Rule f⁻¹</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--clr-accent)', fontWeight: 700 }}>Operation</td>
                  <td>{activeDisplay}</td>
                  <td>{activeGDisplay}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--clr-accent)', fontWeight: 700 }}>Round Trip</td>
                  <td colSpan="2" style={{ textAlign: 'center' }}>
                    x ➔ f(x) ➔ f⁻¹(f(x)) = x
                  </td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--clr-accent)', fontWeight: 700 }}>Swap Rule</td>
                  <td colSpan="2" style={{ textAlign: 'center' }}>
                    Input of f = Output of f⁻¹ &amp; Output of f = Input of f⁻¹
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="fs-inquiry-feedback success" style={{ marginTop: '0.65rem' }}>
              <span>💡</span>
              <span>
                An <strong>inverse function</strong> undoes the forward rule by reversing its operations in opposite order!
              </span>
            </div>

            {onNext && autoAdvanceTimer !== null && (
              <div style={{
                background: 'rgba(232, 134, 74, 0.15)',
                border: '1px solid var(--clr-accent, #e8864a)',
                borderRadius: '8px',
                padding: '0.6rem 1.25rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                margin: '1.25rem 0'
              }}>
                <span>🚀 Advancing to <strong>Matrix Studio (Stage 6)</strong> in <strong>{autoAdvanceTimer}s</strong>...</span>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: '1px solid var(--clr-accent, #e8864a)',
                    borderRadius: '4px',
                    color: 'var(--clr-accent, #e8864a)',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    fontSize: '0.78rem'
                  }}
                  onClick={() => setAutoAdvanceTimer(null)}
                >
                  Stay Here
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className="fs-step-footer-actions between">
              <button className="fs-btn-secondary" onClick={() => setActiveStep(8)}>
                ← Back to Question 8
              </button>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button className="fs-btn-secondary" onClick={handleResetModule}>
                  🔄 Start Over
                </button>
                {onBack && (
                  <button className="fs-btn-secondary" onClick={onBack}>
                    Dashboard 🏠
                  </button>
                )}
                {onNext && (
                  <button className="fs-btn-primary" onClick={onNext}>
                    Proceed to Matrix Studio (Stage 6) 📐 ➔
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
