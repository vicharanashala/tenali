import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import GeoGebraMatrixLab from './GeoGebraMatrixLab';
import {
  PATH_META,
  PHASES,
  DEFAULT_SYSTEM,
  MATRIX_PATH_QUESTIONS,
  MATRIX_STUDIO_SUMMARY
} from './questions';
import {
  parseNumericValue,
  parseLinearEquation,
  solve2x2System,
  validateMatrixInput,
  validateVectorInput,
  parseVectorComponentValue
} from './matrixEvaluator';
import './MatrixStudioModule.css';

export default function MatrixStudioModule({ onBack, onNext }) {
  const [activeStep, setActiveStep] = useState(1);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);

  // Active linear system input by user in Question 1 (single sequential input box, no pre-fill)
  const [activeSystem, setActiveSystem] = useState(null);
  const [plottedLine1, setPlottedLine1] = useState(null);
  const [plottedLine2, setPlottedLine2] = useState(null);
  const [currentLineInput, setCurrentLineInput] = useState('');
  const [plotError, setPlotError] = useState(null);

  // Input refs for autofocus and canvas control
  const lineInputRef = useRef(null);
  const q3InputRef = useRef(null);
  const q4ValXRef = useRef(null);
  const q9Row1Ref = useRef(null);
  const ggbLabRef = useRef(null);

  // Answers state across questions 1..11
  const [answers, setAnswers] = useState({
    1: { isPlotted: false },
    2: { selectedOption: null, isCorrect: false },
    3: { inputStr: '', xVal: '', yVal: '', intersectFound: false, foundPt: null, isCorrect: false, error: null },
    4: { valX: '', valY: '', isCorrect: false, error: null },
    5: { matrix: [['', ''], ['', '']], isCorrect: false, error: null },
    6: { targets: ['', ''], isCorrect: false, error: null },
    7: { selectedOption: null, isCorrect: false },
    8: { selectedOption: null, isCorrect: false },
    9: { row1: '', row2: '', isCorrect: false, error: null },
    10: { matrix: [['', ''], ['', '']], x: '', y: '', isCorrect: false, error: null },
    11: { completed: true }
  });

  // Sandbox coefficients for Step 11 Free-play
  const [sandboxCoeffs, setSandboxCoeffs] = useState({
    a1: 1,
    b1: 1,
    c1: 5,
    a2: 2,
    b2: -1,
    c2: 1
  });

  const effectiveSystem = activeSystem || DEFAULT_SYSTEM;
  const L1 = effectiveSystem.line1;
  const L2 = effectiveSystem.line2;
  const P = effectiveSystem.intersection;

  const currentQ = useMemo(() => {
    return MATRIX_PATH_QUESTIONS.find((q) => q.id === activeStep) || MATRIX_PATH_QUESTIONS[0];
  }, [activeStep]);

  const currentPhase = useMemo(() => {
    return PHASES.find((p) => p.id === currentQ.phaseId) || PHASES[0];
  }, [currentQ]);

  // Autofocus inputs only when active step changes (prevent viewport scrolling/jumping)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeStep === 1 && !activeSystem && lineInputRef.current) {
        lineInputRef.current.focus({ preventScroll: true });
      } else if (activeStep === 3 && q3InputRef.current && !answers[3]?.isCorrect) {
        q3InputRef.current.focus({ preventScroll: true });
      } else if (activeStep === 4 && q4ValXRef.current && !answers[4]?.isCorrect) {
        q4ValXRef.current.focus({ preventScroll: true });
      } else if (activeStep === 9 && q9Row1Ref.current && !answers[9]?.isCorrect) {
        q9Row1Ref.current.focus({ preventScroll: true });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [activeStep]);

  // Auto-advance countdown on Step 11 ceremony
  const isCeremonyStep = activeStep === 11;
  useEffect(() => {
    let timer;
    if (isCeremonyStep && onNext) {
      if (autoAdvanceTimer === null) {
        timer = setTimeout(() => {
          setAutoAdvanceTimer(4);
        }, 0);
      } else if (autoAdvanceTimer > 0) {
        timer = setTimeout(() => {
          setAutoAdvanceTimer((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);
      } else if (autoAdvanceTimer === 0 && onNext) {
        onNext();
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCeremonyStep, onNext, autoAdvanceTimer]);

  const isQ3IntersectFound = Boolean(answers[3]?.intersectFound);
  const isQ3Correct = Boolean(answers[3]?.isCorrect);

  // GeoGebra sync data based on active step (stable object references)
  const geoGebraData = useMemo(() => {
    if (activeStep === 1) {
      const l1 = plottedLine1 || activeSystem?.line1;
      const l2 = plottedLine2 || activeSystem?.line2;
      return {
        line1: l1 ? { equation: l1.ggbCmd, display: l1.display } : null,
        line2: l2 ? { equation: l2.ggbCmd, display: l2.display } : null,
        intersection: activeSystem ? P : null,
        showIntersection: false
      };
    } else if (activeStep === 2) {
      // In Question 2: show lines, no intersection pin yet (conceptual MCQ)
      return {
        line1: { equation: L1.ggbCmd, display: L1.display },
        line2: { equation: L2.ggbCmd, display: L2.display },
        intersection: P,
        showIntersection: false
      };
    } else if (activeStep === 3) {
      // In Question 3: reveal intersection pin once intersect function is run or coordinates verified
      return {
        line1: { equation: L1.ggbCmd, display: L1.display },
        line2: { equation: L2.ggbCmd, display: L2.display },
        intersection: P,
        showIntersection: isQ3IntersectFound || isQ3Correct
      };
    } else if (activeStep >= 4 && activeStep <= 9) {
      return {
        line1: { equation: L1.ggbCmd, display: L1.display },
        line2: { equation: L2.ggbCmd, display: L2.display },
        intersection: P,
        showIntersection: true
      };
    } else if (activeStep === 10) {
      // Step 10: Fixed fresh test system
      return {
        line1: { equation: '2x + y = 8', display: '2x + y = 8' },
        line2: { equation: 'x + 2y = 7', display: 'x + 2y = 7' },
        intersection: { x: 3, y: 2 },
        showIntersection: true
      };
    } else {
      // Step 11: Sandbox mode
      const { a1, b1, c1, a2, b2, c2 } = sandboxCoeffs;
      const solved = solve2x2System(a1, b1, c1, a2, b2, c2);
      return {
        line1: {
          equation: `${a1}x + ${b1}y = ${c1}`,
          display: `${a1}x + ${b1}y = ${c1}`
        },
        line2: {
          equation: `${a2}x + ${b2}y = ${c2}`,
          display: `${a2}x + ${b2}y = ${c2}`
        },
        intersection: solved.solvable ? { x: solved.x, y: solved.y } : null,
        showIntersection: solved.solvable
      };
    }
  }, [activeStep, activeSystem, isQ3IntersectFound, isQ3Correct, L1.ggbCmd, L1.display, L2.ggbCmd, L2.display, P.x, P.y, sandboxCoeffs, plottedLine1, plottedLine2]);

  const isQuestionComplete = (qId) => {
    const a = answers[qId];
    if (!a) return false;
    if (qId === 1) return Boolean(activeSystem && a.isPlotted);
    if (qId === 11) return true;
    return Boolean(a.isCorrect);
  };

  const getCardBadge = () => {
    if (activeStep === 1) {
      if (activeSystem) return `Plotted: ${L1.display} & ${L2.display}`;
      if (plottedLine1) return `Plotted Line 1: ${plottedLine1.display}`;
      return 'Plot Two Lines';
    }
    if (activeStep === 2) return 'Where Values Match';
    if (activeStep === 3) return 'Find Shared (x, y)';
    if (activeStep === 4) return '2D Function: h(x, y) = (2x+3y, 4x+5y)';
    if (activeStep <= 6) return 'Structure: [Grid] · [x] = [b]';
    if (activeStep <= 8) return 'Ax = b';
    if (activeStep === 9) return `A · [${P.x}/${P.y}] = [${L1.c}/${L2.c}]`;
    if (activeStep === 10) return 'Test System: 2x + y = 8 & x + 2y = 7';
    return 'Sandbox: Ax = b';
  };

  // =========================================================
  // STEP 1: Plotting Two Lines (Strict user input, no pre-fill)
  // =========================================================
  // STEP 1: Single Sequential Input for Plotting Two Lines
  // =========================================================
  const handleResetLines = () => {
    setActiveSystem(null);
    setPlottedLine1(null);
    setPlottedLine2(null);
    setCurrentLineInput('');
    setPlotError(null);
    setAnswers((prev) => ({
      ...prev,
      1: { isPlotted: false },
      2: { selectedOption: null, isCorrect: false },
      3: { xVal: '', yVal: '', isCorrect: false, error: null },
      4: { val1: '', val2: '', isCorrect: false, error: null },
      6: { matrix: [['', ''], ['', '']], isCorrect: false, error: null },
      7: { targets: ['', ''], isCorrect: false, error: null },
      10: { row1: '', row2: '', isCorrect: false, error: null }
    }));
    setTimeout(() => {
      if (lineInputRef.current) lineInputRef.current.focus();
    }, 50);
  };

  const handlePlotSingleLine = (e) => {
    if (e) e.preventDefault();
    setPlotError(null);

    const trimmed = currentLineInput.trim();
    if (!trimmed) {
      setPlotError(!plottedLine1 ? 'Please enter an equation for Line 1.' : 'Please enter an equation for Line 2.');
      return;
    }

    const parsed = parseLinearEquation(trimmed);
    if (!parsed.valid) {
      setPlotError(parsed.error);
      return;
    }

    if (!plottedLine1) {
      // Step 1A: Line 1 successfully parsed and plotted
      setPlottedLine1(parsed);
      setCurrentLineInput('');
      setPlotError(null);
      setTimeout(() => {
        if (lineInputRef.current) lineInputRef.current.focus();
      }, 50);
    } else {
      // Step 1B: Line 2 successfully parsed - now verify non-parallel intersection
      const system = solve2x2System(
        plottedLine1.a,
        plottedLine1.b,
        plottedLine1.c,
        parsed.a,
        parsed.b,
        parsed.c
      );

      if (!system.solvable) {
        setPlotError(
          'These two lines are parallel (or identical) and do not cross at a single point! Please enter a non-parallel Line 2.'
        );
        return;
      }

      const newSys = {
        line1: plottedLine1,
        line2: parsed,
        intersection: { x: system.x, y: system.y }
      };

      setPlottedLine2(parsed);
      setActiveSystem(newSys);
      setCurrentLineInput('');
      setPlotError(null);
      setAnswers((prev) => ({
        ...prev,
        1: { isPlotted: true },
        // Reset subsequent dependent calculations if system changes
        2: { selectedOption: null, isCorrect: false },
        3: { xVal: '', yVal: '', isCorrect: false, error: null },
        4: { val1: '', val2: '', isCorrect: false, error: null },
        6: { matrix: [['', ''], ['', '']], isCorrect: false, error: null },
        7: { targets: ['', ''], isCorrect: false, error: null },
        10: { row1: '', row2: '', isCorrect: false, error: null }
      }));
    }
  };

  // =========================================================
  // STEP 2: At which point both have same values of x & y (MCQ)
  // =========================================================
  const handleSelectQ2 = (optId) => {
    const isCorrect = optId === 'q2_intersection';
    setAnswers((prev) => ({
      ...prev,
      2: { selectedOption: optId, isCorrect }
    }));
  };

  // =========================================================
  // STEP 3: Values of x and y at the intersection point (GeoGebra Intersect)
  // =========================================================
  // Callback when GeoGebra computes/plots the intersection
  const handleIntersectionFound = useCallback((pt) => {
    setAnswers((prev) => ({
      ...prev,
      3: {
        ...prev[3],
        inputStr: 'Intersect(Line1, Line2)',
        intersectFound: true,
        foundPt: pt,
        xVal: String(pt.x),
        yVal: String(pt.y),
        isCorrect: true,
        error: null
      }
    }));
  }, []);

  // Handle user submitting the intersect command in Q3 input box
  const handleCheckQ3Intersect = (e) => {
    if (e) e.preventDefault();
    const raw = (answers[3]?.inputStr || '').trim();

    if (!raw) {
      setAnswers((prev) => ({
        ...prev,
        3: { ...prev[3], error: 'Type Intersect(Line1, Line2) to calculate the intersection in GeoGebra.' }
      }));
      return;
    }

    // If user entered only numbers or coordinates e.g. "(2, 3)" or "2, 3"
    if (/^[-+]?\d/.test(raw) || /^\(\s*[-+]?\d/.test(raw)) {
      setAnswers((prev) => ({
        ...prev,
        3: {
          ...prev[3],
          error: 'In GeoGebra, type the intersection function Intersect(Line1, Line2) to calculate the crossing point.'
        }
      }));
      return;
    }

    // Check if it's an intersect call:
    // Matches Intersect(Line1, Line2), Intersect(line1, line2), Intersect(Line 1, Line 2), Intersect(l1, l2), Intersect(eq1, eq2), or just Intersect
    const isIntersect = /^intersect(?:ion)?(?:\s*\(.*?\))?$/i.test(raw);

    if (!isIntersect) {
      setAnswers((prev) => ({
        ...prev,
        3: {
          ...prev[3],
          error: 'Please use the GeoGebra intersection function: Intersect(Line1, Line2)'
        }
      }));
      return;
    }

    // Trigger GeoGebra execution on canvas
    if (ggbLabRef.current?.triggerIntersect) {
      ggbLabRef.current.triggerIntersect();
    }

    setAnswers((prev) => ({
      ...prev,
      3: {
        ...prev[3],
        inputStr: raw,
        intersectFound: true,
        foundPt: { x: P.x, y: P.y },
        xVal: String(P.x),
        yVal: String(P.y),
        isCorrect: true,
        error: null
      }
    }));
  };

  // =========================================================
  // STEP 4: A Function from ℝ² to ℝ² - Evaluating h(2, 3)
  // =========================================================
  const handleCheckQ4 = (e) => {
    e.preventDefault();
    const rawX = answers[4]?.valX;
    const rawY = answers[4]?.valY;

    if (!rawX || !rawY || !rawX.trim() || !rawY.trim()) {
      setAnswers((prev) => ({
        ...prev,
        4: { ...prev[4], error: 'Please enter values for both coordinates of h(2, 3).' }
      }));
      return;
    }

    const numX = parseVectorComponentValue(rawX);
    const numY = parseVectorComponentValue(rawY);

    if (isNaN(numX) || isNaN(numY)) {
      setAnswers((prev) => ({
        ...prev,
        4: { ...prev[4], error: 'Please enter valid numbers or arithmetic expressions.' }
      }));
      return;
    }

    const isXCorrect = Math.abs(numX - 13) < 0.01; // 2(2) + 3(3) = 4 + 9 = 13
    const isYCorrect = Math.abs(numY - 23) < 0.01; // 4(2) + 5(3) = 8 + 15 = 23

    if (isXCorrect && isYCorrect) {
      setAnswers((prev) => ({
        ...prev,
        4: { ...prev[4], isCorrect: true, error: null }
      }));
    } else {
      let errMsg = '';
      if (!isXCorrect && !isYCorrect) {
        errMsg = 'Both coordinates are incorrect. Check: 2(2) + 3(3) and 4(2) + 5(3).';
      } else if (!isXCorrect) {
        errMsg = '1st coordinate is incorrect. Check: 2(2) + 3(3) = 4 + 9 = 13.';
      } else {
        errMsg = '2nd coordinate is incorrect. Check: 4(2) + 5(3) = 8 + 15 = 23.';
      }
      setAnswers((prev) => ({
        ...prev,
        4: { ...prev[4], error: errMsg }
      }));
    }
  };

  // =========================================================
  // STEP 5: Multiplier Grid
  // =========================================================
  const handleMatrixCellChange = (r, c, val) => {
    setAnswers((prev) => {
      const newM = prev[5].matrix.map((row) => [...row]);
      newM[r][c] = val;
      return {
        ...prev,
        5: { ...prev[5], matrix: newM, error: null }
      };
    });
  };

  const handleCheckQ5 = (e) => {
    e.preventDefault();
    const expected = [
      [L1.a, L1.b],
      [L2.a, L2.b]
    ];
    const res = validateMatrixInput(answers[5].matrix, expected);
    if (!res.valid) {
      setAnswers((prev) => ({
        ...prev,
        5: { ...prev[5], error: res.error }
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        5: { ...prev[5], isCorrect: true, error: null }
      }));
    }
  };

  // =========================================================
  // STEP 6: Target Stacks
  // =========================================================
  const handleTargetChange = (idx, val) => {
    setAnswers((prev) => {
      const newT = [...prev[6].targets];
      newT[idx] = val;
      return {
        ...prev,
        6: { ...prev[6], targets: newT, error: null }
      };
    });
  };

  const handleCheckQ6 = (e) => {
    e.preventDefault();
    const expected = [L1.c, L2.c];
    const res = validateVectorInput(answers[6].targets, expected);
    if (!res.valid) {
      setAnswers((prev) => ({
        ...prev,
        6: { ...prev[6], error: res.error }
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        6: { ...prev[6], isCorrect: true, error: null }
      }));
    }
  };

  // =========================================================
  // STEP 7: Row-by-Column
  // =========================================================
  const handleSelectQ7 = (optId) => {
    const isCorrect = optId === 'q7_exact';
    setAnswers((prev) => ({
      ...prev,
      7: { selectedOption: optId, isCorrect }
    }));
  };

  // =========================================================
  // STEP 8: The Grand Equation Ax = b
  // =========================================================
  const handleSelectQ8 = (optId) => {
    const isCorrect = optId === 'q8_analog';
    setAnswers((prev) => ({
      ...prev,
      8: { selectedOption: optId, isCorrect }
    }));
  };

  // =========================================================
  // STEP 9: Live Evaluation of A · [x / y]
  // =========================================================
  const handleCheckQ9 = (e) => {
    e.preventDefault();
    const r1 = parseNumericValue(answers[9].row1);
    const r2 = parseNumericValue(answers[9].row2);

    if (isNaN(r1) || isNaN(r2)) {
      setAnswers((prev) => ({
        ...prev,
        9: { ...prev[9], error: 'Please calculate row outputs for both lines.' }
      }));
      return;
    }

    const correct1 = Math.abs(r1 - L1.c) < 1e-4;
    const correct2 = Math.abs(r2 - L2.c) < 1e-4;

    if (!correct1 || !correct2) {
      setAnswers((prev) => ({
        ...prev,
        9: {
          ...prev[9],
          error: `Row 1 should equal ${L1.c}, and Row 2 should equal ${L2.c}. Check your calculations!`
        }
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        9: { ...prev[9], isCorrect: true, error: null }
      }));
    }
  };

  // =========================================================
  // STEP 10: Second System Solve
  // =========================================================
  const handleQ10MatrixChange = (r, c, val) => {
    setAnswers((prev) => {
      const newM = prev[10].matrix.map((row) => [...row]);
      newM[r][c] = val;
      return {
        ...prev,
        10: { ...prev[10], matrix: newM, error: null }
      };
    });
  };

  const handleCheckQ10 = (e) => {
    e.preventDefault();
    const expectedM = [
      [2, 1],
      [1, 2]
    ];
    const mRes = validateMatrixInput(answers[10].matrix, expectedM);
    if (!mRes.valid) {
      setAnswers((prev) => ({
        ...prev,
        10: { ...prev[10], error: `Matrix: ${mRes.error}` }
      }));
      return;
    }
    const xVal = parseNumericValue(answers[10].x);
    const yVal = parseNumericValue(answers[10].y);
    if (xVal !== 3 || yVal !== 2) {
      setAnswers((prev) => ({
        ...prev,
        10: {
          ...prev[10],
          error: 'Look at the canvas intersection point: where do 2x + y = 8 and x + 2y = 7 meet? (x = 3, y = 2).'
        }
      }));
      return;
    }
    setAnswers((prev) => ({
      ...prev,
      10: { ...prev[10], isCorrect: true, error: null }
    }));
  };

  // Sandbox coefficient updates for Step 11
  const handleSandboxChange = (key, val) => {
    setSandboxCoeffs((prev) => ({
      ...prev,
      [key]: parseFloat(val) || 0
    }));
  };

  return (
    <div className="fs-studio-wrapper">
      {/* 1. TOP NAVIGATION */}
      <div className="fs-top-nav">
        {onBack && (
          <button className="fs-back-btn" onClick={onBack}>
            ← Dashboard
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="fs-progress-badge">{`Question ${activeStep} of ${MATRIX_PATH_QUESTIONS.length}`}</span>
        </div>
      </div>

      {/* 2. HEADER */}
      <div className="fs-header">
        <span className="fs-phase-pill">{currentPhase.name}</span>
        <h1 className="fs-title">{PATH_META.title}</h1>
        <p className="fs-subtitle">{PATH_META.subtitle}</p>
      </div>

      {/* 3. STEPPER BAR (Questions 1..11) */}
      <div className="fs-stepper-bar">
        {MATRIX_PATH_QUESTIONS.map((q) => {
          const isDone = isQuestionComplete(q.id);
          const isActive = activeStep === q.id;
          return (
            <button
              key={q.id}
              className={`fs-step-pill ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
              onClick={() => setActiveStep(q.id)}
              title={`Question ${q.id}: ${q.title}`}
            >
              <span>{q.id}</span>
            </button>
          );
        })}
      </div>

      {/* 4. MAIN CARD: Header + Graph at Top + Question Content */}
      <div className="fs-card">
        {/* Card Header */}
        <div className="fs-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="fs-question-badge">{`Q${activeStep}`}</span>
            <span className="fs-topic-badge">{currentQ.title}</span>
            <span className="fs-card-line-badge">{getCardBadge()}</span>
          </div>
          <span className="fs-question-num">{`Question ${activeStep} of ${MATRIX_PATH_QUESTIONS.length}`}</span>
        </div>

        {/* 1. GRAPH AT TOP (GeoGebra Matrix Lab inside card) */}
        {activeStep <= 11 && (
          <GeoGebraMatrixLab
            ref={ggbLabRef}
            line1={geoGebraData.line1}
            line2={geoGebraData.line2}
            intersection={geoGebraData.intersection}
            showIntersection={geoGebraData.showIntersection}
            compact={activeStep >= 5 && activeStep <= 9}
            allowIntersect={activeStep === 3 && !answers[3]?.isCorrect}
            onIntersect={handleIntersectionFound}
          />
        )}

        {/* 2. QUESTION CONTENT */}
        <div className="fs-step-intro-block">
          {/* Equation Pill Bar */}
          {activeStep > 1 && activeStep <= 9 && (
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">Your Plotted System:</span>
              <span className="fs-equation-pill-val">
                {L1.display} &nbsp;|&nbsp; {L2.display}
              </span>
            </div>
          )}

          <h3 className="fs-step-heading">
            {currentQ.prompt}
          </h3>
          <p className="fs-step-subtext">
            {currentQ.subtext}
          </p>

          {/* ========================================================= */}
          {/* QUESTION 1: Plot Your Two Lines (Single sequential input) */}
          {/* ========================================================= */}
          {activeStep === 1 && (
            <div className="fs-q1-container">
              {/* Verification Bar / Status Strip */}
              <div className="fs-verification-bar">
                <div className="fs-verification-group">
                  <span className="fs-verification-label">Plotted Lines:</span>
                  <div className={`fs-verification-chip line1 ${plottedLine1 ? 'verified' : ''}`}>
                    <span>{plottedLine1 ? '✓' : '⏳'}</span>
                    <span>
                      {plottedLine1
                        ? `Line 1: ${plottedLine1.display}`
                        : 'Line 1: Pending'}
                    </span>
                  </div>
                  <div className={`fs-verification-chip line2 ${plottedLine2 ? 'verified' : ''}`}>
                    <span>{plottedLine2 ? '✓' : '⏳'}</span>
                    <span>
                      {plottedLine2
                        ? `Line 2: ${plottedLine2.display}`
                        : 'Line 2: Pending'}
                    </span>
                  </div>
                  {activeSystem && (
                    <span className="fs-verification-tag">✓ 2 Lines Plotted</span>
                  )}
                </div>

                {(plottedLine1 || plottedLine2) && (
                  <div className="fs-verification-actions">
                    <button
                      type="button"
                      className="fs-btn-secondary"
                      onClick={handleResetLines}
                      title="Clear lines and start over"
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                    >
                      ✕ Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Single Sequential Input Box (shown until both lines are verified) */}
              {!activeSystem ? (
                <form onSubmit={handlePlotSingleLine} className="fs-single-input-form">
                  <div className="fs-single-input-meta">
                    <span className={`fs-line-tag-label ${!plottedLine1 ? 'line1' : 'line2'}`}>
                      {!plottedLine1 ? 'Line 1' : 'Line 2'}
                    </span>
                    <span className="fs-single-input-hint">
                      {!plottedLine1
                        ? 'Enter Line 1 (e.g. x + y = 5):'
                        : `Line 1 plotted! Now enter Line 2 (e.g. 2x - y = 1):`}
                    </span>
                  </div>

                  <div className="fs-single-input-row">
                    <input
                      ref={lineInputRef}
                      type="text"
                      className="fs-tray-input-box"
                      placeholder={
                        !plottedLine1
                          ? 'e.g. x + y = 5'
                          : 'e.g. 2x - y = 1'
                      }
                      value={currentLineInput}
                      onChange={(e) => {
                        setCurrentLineInput(e.target.value);
                        setPlotError(null);
                      }}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="fs-btn-primary"
                      disabled={!currentLineInput.trim()}
                    >
                      {!plottedLine1 ? 'Plot Line 1 🚀' : 'Plot Line 2 🚀'}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ marginTop: '0.85rem' }}>
                  <div className="fs-inquiry-feedback success">
                    <span>✓</span>
                    <span>
                      Lines plotted: <strong>{plottedLine1?.display}</strong> &amp; <strong>{plottedLine2?.display}</strong>.
                    </span>
                  </div>
                </div>
              )}

              {plotError && (
                <div className="fs-inquiry-feedback error" style={{ marginTop: '0.75rem' }}>
                  <span>⚠️</span>
                  <span>{plotError}</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* QUESTION 2: At which point both have same values of x & y */}
          {/* ========================================================= */}
          {activeStep === 2 && (
            <div className="fs-options-grid">
              {[
                {
                  id: 'q2_intersection',
                  text: 'At their intersection point',
                  isCorrect: true,
                  feedback: '✓ Correct! Shared by both lines.'
                },
                {
                  id: 'q2_y_intercept',
                  text: 'At the y-intercept',
                  isCorrect: false,
                  feedback: '✕ Belongs to only one line.'
                },
                {
                  id: 'q2_x_intercept',
                  text: 'At the x-intercept',
                  isCorrect: false,
                  feedback: '✕ Belongs to only one line.'
                },
                {
                  id: 'q2_origin',
                  text: 'At the origin (0, 0)',
                  isCorrect: false,
                  feedback: '✕ Lines do not cross here.'
                }
              ].map((opt, idx) => {
                const isSelected = answers[2]?.selectedOption === opt.id;
                let btnClass = 'fs-option-btn';
                if (isSelected) {
                  btnClass += opt.isCorrect ? ' correct' : ' incorrect';
                }
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={opt.id}
                    className={btnClass}
                    onClick={() => handleSelectQ2(opt.id)}
                    disabled={answers[2]?.isCorrect}
                  >
                    <span className="fs-option-letter">{letter}</span>
                    <div style={{ flex: 1 }}>
                      <span>{opt.text}</span>
                      {isSelected && (
                        <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
                          {opt.feedback}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {answers[2]?.isCorrect && (
                <div className="fs-inquiry-feedback success" style={{ marginTop: '0.65rem' }}>
                  <span>✓</span>
                  <span>Correct! Both lines meet at their intersection point.</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* QUESTION 3: Values of x and y at the intersection point  */}
          {/* ========================================================= */}
          {/* ========================================================= */}
          {/* QUESTION 3: Values of x and y at the intersection point  */}
          {/* ========================================================= */}
          {activeStep === 3 && (
            <div style={{ marginTop: '0.85rem' }}>
              {/* GeoGebra Algebra View Output Panel (Matching FunctionStudio Question 8) */}
              <div className="fs-ggb-algebra-panel">
                <span className="fs-ggb-algebra-title">
                  📐 GeoGebra Algebra View
                </span>

                {/* Line 1 Entry */}
                <div className="fs-ggb-algebra-item">
                  <div className="fs-ggb-gutter">
                    <div className="fs-ggb-vis-circle" />
                  </div>
                  <div className="fs-ggb-algebra-body">
                    <div className="fs-ggb-algebra-row">
                      <span className="fs-ggb-algebra-expr">Line1: {L1.display}</span>
                      <span className="fs-ggb-algebra-dots">⋮</span>
                    </div>
                  </div>
                </div>

                {/* Line 2 Entry */}
                <div className="fs-ggb-algebra-item">
                  <div className="fs-ggb-gutter">
                    <div className="fs-ggb-vis-circle line2" />
                  </div>
                  <div className="fs-ggb-algebra-body">
                    <div className="fs-ggb-algebra-row">
                      <span className="fs-ggb-algebra-expr">Line2: {L2.display}</span>
                      <span className="fs-ggb-algebra-dots">⋮</span>
                    </div>
                  </div>
                </div>

                {/* Intersect result entry (visible once evaluated) */}
                {answers[3]?.isCorrect && (
                  <div className="fs-ggb-algebra-item">
                    <div className="fs-ggb-gutter">
                      <div className="fs-ggb-vis-circle intersect" />
                    </div>
                    <div className="fs-ggb-algebra-body">
                      <div className="fs-ggb-algebra-row">
                        <span className="fs-ggb-algebra-expr">Intersect(Line1, Line2)</span>
                        <span className="fs-ggb-algebra-dots">⋮</span>
                      </div>
                      <div className="fs-ggb-algebra-result">
                        <span className="eq">=</span>
                        <span className="val">({P.x}, {P.y})</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Intersection Command Input Tray */}
              <form className="fs-tray-input-row" onSubmit={handleCheckQ3Intersect} style={{ marginTop: '0.85rem' }}>
                <input
                  ref={q3InputRef}
                  type="text"
                  className="fs-tray-input-box"
                  placeholder="e.g. Intersect(Line1, Line2)"
                  value={answers[3]?.inputStr || ''}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      3: { ...prev[3], inputStr: e.target.value, error: null }
                    }))
                  }
                  disabled={answers[3]?.isCorrect}
                />
                {!answers[3]?.isCorrect && (
                  <button type="submit" className="fs-tray-submit-btn">
                    Intersect ➔
                  </button>
                )}
              </form>

              {/* Quick Suggestion Chip */}
              {!answers[3]?.isCorrect && (
                <div style={{ marginTop: '0.55rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--fs-text-subtle)' }}>Quick fill:</span>
                  <button
                    type="button"
                    className="fs-preset-chip"
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        3: { ...prev[3], inputStr: 'Intersect(Line1, Line2)', error: null }
                      }))
                    }
                    style={{ cursor: 'pointer', fontSize: '0.78rem', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.4)' }}
                  >
                    Intersect(Line1, Line2)
                  </button>
                </div>
              )}

              {answers[3]?.error && (
                <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                  <span>⚠️</span>
                  <span>{answers[3].error}</span>
                </div>
              )}

              {answers[3]?.isCorrect && (
                <div className="fs-inquiry-feedback success" style={{ marginTop: '0.65rem' }}>
                  <span>✓</span>
                  <span>Intersection point ({P.x}, {P.y}) calculated by GeoGebra and pinned on the canvas!</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* QUESTION 4: A Function from ℝ² to ℝ²                      */}
          {/* ========================================================= */}
          {activeStep === 4 && (
            <div style={{ marginTop: '0.5rem' }}>
              {/* Function Rule & Substitution Card */}
              <div className="fs-r2-function-card">
                <div className="fs-r2-function-header">
                  <span className="fs-r2-map-badge">2D Rule: ℝ² ➔ ℝ²</span>
                  <span className="fs-r2-formula">h(x, y) = ( 2x + 3y , 4x + 5y )</span>
                </div>

                <div className="fs-r2-breakdown">
                  <div className="fs-r2-input-strip">
                    <span className="fs-r2-strip-label">Given input vector (x, y):</span>
                    <span className="fs-r2-chip x-chip">x = 2</span>
                    <span className="fs-r2-chip y-chip">y = 3</span>
                  </div>

                  <div className="fs-r2-coord-rows">
                    <div className="fs-r2-coord-row">
                      <span className="fs-r2-coord-name">1st Coord:</span>
                      <span className="fs-r2-coord-calc">
                        2 · <span className="fs-r2-val-chip x-chip">2</span> + 3 · <span className="fs-r2-val-chip y-chip">3</span>
                        {answers[4]?.isCorrect ? (
                          <> = 4 + 9 = <strong style={{ color: 'var(--clr-teal)' }}>13 ✓</strong></>
                        ) : (
                          <> = ?</>
                        )}
                      </span>
                    </div>
                    <div className="fs-r2-coord-row">
                      <span className="fs-r2-coord-name">2nd Coord:</span>
                      <span className="fs-r2-coord-calc">
                        4 · <span className="fs-r2-val-chip x-chip">2</span> + 5 · <span className="fs-r2-val-chip y-chip">3</span>
                        {answers[4]?.isCorrect ? (
                          <> = 8 + 15 = <strong style={{ color: 'var(--clr-teal)' }}>23 ✓</strong></>
                        ) : (
                          <> = ?</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluation Form */}
              <form onSubmit={handleCheckQ4} className="fs-r2-form">
                <div className="fs-r2-eval-row">
                  <span className="fs-r2-eval-label">h(2, 3) =</span>
                  <span className="fs-r2-paren">(</span>
                  <input
                    ref={q4ValXRef}
                    type="text"
                    className="fs-cell-input fs-r2-input"
                    placeholder="2(2)+3(3)"
                    value={answers[4]?.valX || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        4: { ...prev[4], valX: e.target.value, error: null }
                      }))
                    }
                    disabled={answers[4]?.isCorrect}
                    title="1st coordinate output: 2(2) + 3(3)"
                  />
                  <span className="fs-r2-comma">,</span>
                  <input
                    type="text"
                    className="fs-cell-input fs-r2-input"
                    placeholder="4(2)+5(3)"
                    value={answers[4]?.valY || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        4: { ...prev[4], valY: e.target.value, error: null }
                      }))
                    }
                    disabled={answers[4]?.isCorrect}
                    title="2nd coordinate output: 4(2) + 5(3)"
                  />
                  <span className="fs-r2-paren">)</span>

                  {!answers[4]?.isCorrect && (
                    <button type="submit" className="fs-btn-primary" style={{ padding: '0.5rem 1.15rem' }}>
                      Check Output ➔
                    </button>
                  )}
                </div>

                {answers[4]?.error && (
                  <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                    <span>⚠️</span>
                    <span>{answers[4].error}</span>
                  </div>
                )}

                {answers[4]?.isCorrect && (
                  <div style={{ marginTop: '0.85rem' }}>
                    <div className="fs-inquiry-feedback success">
                      <span>✓</span>
                      <span>Output evaluated: <strong>h(2, 3) = (13, 23)</strong> in ℝ²!</span>
                    </div>

                    <div className="fs-earns-card" style={{ marginTop: '0.85rem' }}>
                      <div className="fs-earns-badge">💡 Core Realization</div>
                      <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--clr-accent)', fontSize: '0.98rem', fontWeight: 800 }}>
                        Same x and Same y in Both Coordinates!
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--clr-text, #ede8e3)' }}>
                        Notice what happened when you evaluated the input vector <strong>(x, y) = (2, 3)</strong>:
                      </p>
                      <ul style={{ margin: '0.45rem 0 0.65rem 1.25rem', padding: 0, fontSize: '0.85rem', lineHeight: 1.55 }}>
                        <li>
                          The <strong style={{ color: '#38bdf8' }}>exact same x = 2</strong> went into both coordinates: <code style={{ color: '#38bdf8' }}>2(2)</code> and <code style={{ color: '#38bdf8' }}>4(2)</code>.
                        </li>
                        <li>
                          The <strong style={{ color: '#fb923c' }}>exact same y = 3</strong> went into both coordinates: <code style={{ color: '#fb923c' }}>3(3)</code> and <code style={{ color: '#fb923c' }}>5(3)</code>.
                        </li>
                      </ul>
                      <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.5, color: 'var(--clr-text-soft, #a89e94)' }}>
                        A 2D function binds both coordinates to the <em>same input pair simultaneously</em>. That's why simultaneous equations share the same (x, y) solution — and why we can separate the multipliers into a matrix in the next step!
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* QUESTION 5: Extracting Multiplier Grid                    */}
          {/* ========================================================= */}
          {activeStep === 5 && (
            <form onSubmit={handleCheckQ5}>
              <div className="fs-matrix-assembly">
                <div className="fs-matrix-bracket">
                  <div className="fs-matrix-grid">
                    <input
                      type="text"
                      className="fs-cell-input"
                      placeholder="?"
                      value={answers[5].matrix[0][0]}
                      onChange={(e) => handleMatrixCellChange(0, 0, e.target.value)}
                      disabled={answers[5].isCorrect}
                      title="Row 1, Column 1"
                    />
                    <input
                      type="text"
                      className="fs-cell-input"
                      placeholder="?"
                      value={answers[5].matrix[0][1]}
                      onChange={(e) => handleMatrixCellChange(0, 1, e.target.value)}
                      disabled={answers[5].isCorrect}
                      title="Row 1, Column 2"
                    />
                    <input
                      type="text"
                      className="fs-cell-input"
                      placeholder="?"
                      value={answers[5].matrix[1][0]}
                      onChange={(e) => handleMatrixCellChange(1, 0, e.target.value)}
                      disabled={answers[5].isCorrect}
                      title="Row 2, Column 1"
                    />
                    <input
                      type="text"
                      className="fs-cell-input"
                      placeholder="?"
                      value={answers[5].matrix[1][1]}
                      onChange={(e) => handleMatrixCellChange(1, 1, e.target.value)}
                      disabled={answers[5].isCorrect}
                      title="Row 2, Column 2"
                    />
                  </div>
                </div>

                <span className="fs-math-sym">·</span>

                <div className="fs-vector-bracket">
                  <span className="fs-static-cell">x</span>
                  <span className="fs-static-cell">y</span>
                </div>

                <span className="fs-math-sym">=</span>

                <div className="fs-vector-bracket target">
                  <span className="fs-static-cell">{L1.c}</span>
                  <span className="fs-static-cell">{L2.c}</span>
                </div>
              </div>

              {!answers[5].isCorrect && (
                <button type="submit" className="fs-btn-primary" style={{ marginTop: '1rem' }}>
                  Check Matrix A 🚀
                </button>
              )}

              {answers[5].error && (
                <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                  <span>⚠️</span>
                  <span>{answers[5].error}</span>
                </div>
              )}

              {answers[5].isCorrect && (
                <div className="fs-inquiry-feedback success" style={{ marginTop: '0.65rem' }}>
                  <span>✓</span>
                  <span>Matrix A assembled!</span>
                </div>
              )}
            </form>
          )}

          {/* ========================================================= */}
          {/* QUESTION 6: Target Stacks                                 */}
          {/* ========================================================= */}
          {activeStep === 6 && (
            <form onSubmit={handleCheckQ6}>
              <div className="fs-matrix-assembly">
                <div className="fs-matrix-bracket">
                  <div className="fs-matrix-grid">
                    <span className="fs-static-cell">{L1.a}</span>
                    <span className="fs-static-cell">{L1.b}</span>
                    <span className="fs-static-cell">{L2.a}</span>
                    <span className="fs-static-cell">{L2.b}</span>
                  </div>
                </div>

                <span className="fs-math-sym">·</span>

                <div className="fs-vector-bracket">
                  <span className="fs-static-cell">x</span>
                  <span className="fs-static-cell">y</span>
                </div>

                <span className="fs-math-sym">=</span>

                <div className="fs-vector-bracket target">
                  <input
                    type="text"
                    className="fs-cell-input"
                    placeholder="?"
                    value={answers[6].targets[0]}
                    onChange={(e) => handleTargetChange(0, e.target.value)}
                    disabled={answers[6].isCorrect}
                    title="Target 1"
                  />
                  <input
                    type="text"
                    className="fs-cell-input"
                    placeholder="?"
                    value={answers[6].targets[1]}
                    onChange={(e) => handleTargetChange(1, e.target.value)}
                    disabled={answers[6].isCorrect}
                    title="Target 2"
                  />
                </div>
              </div>

              {!answers[6].isCorrect && (
                <button type="submit" className="fs-btn-primary" style={{ marginTop: '1rem' }}>
                  Check Target b 🚀
                </button>
              )}

              {answers[6].error && (
                <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                  <span>⚠️</span>
                  <span>{answers[6].error}</span>
                </div>
              )}

              {answers[6].isCorrect && (
                <div className="fs-inquiry-feedback success" style={{ marginTop: '0.65rem' }}>
                  <span>✓</span>
                  <span>Target vector b assembled!</span>
                </div>
              )}
            </form>
          )}

          {/* ========================================================= */}
          {/* QUESTION 7: Row-by-Column Machine                         */}
          {/* ========================================================= */}
          {activeStep === 7 && (
            <div className="fs-options-grid">
              {[
                {
                  id: 'q7_exact',
                  text: 'Yes, it recreates both equations',
                  isCorrect: true
                },
                {
                  id: 'q7_different',
                  text: 'No, gives different equations',
                  isCorrect: false
                },
                {
                  id: 'q7_multiply',
                  text: 'Multiplies all numbers together',
                  isCorrect: false
                }
              ].map((opt, idx) => {
                const isSelected = answers[7]?.selectedOption === opt.id;
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
                    disabled={answers[7]?.isCorrect}
                  >
                    <span className="fs-option-letter">{letter}</span>
                    <div style={{ flex: 1 }}>
                      <span>{opt.text}</span>
                      {isSelected && (
                        <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
                          {opt.isCorrect
                            ? '✓ Exactly! Row × column matches both lines.'
                            : '✕ Multiply each row by the column vector.'}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {answers[7]?.isCorrect && (
                <div className="fs-inquiry-feedback success" style={{ marginTop: '0.65rem' }}>
                  <span>✓</span>
                  <span>Row-by-column multiplication reproduces both equations.</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* QUESTION 8: The Grand Equation Ax = b                     */}
          {/* ========================================================= */}
          {activeStep === 8 && (
            <div className="fs-options-grid">
              {[
                {
                  id: 'q8_analog',
                  text: 'A = machine, x = inputs, b = targets',
                  isCorrect: true
                },
                {
                  id: 'q8_wrong1',
                  text: 'A = number, x = line, b = angle',
                  isCorrect: false
                },
                {
                  id: 'q8_wrong2',
                  text: 'b = machine, x = inputs, A = targets',
                  isCorrect: false
                }
              ].map((opt, idx) => {
                const isSelected = answers[8]?.selectedOption === opt.id;
                let btnClass = 'fs-option-btn';
                if (isSelected) {
                  btnClass += opt.isCorrect ? ' correct' : ' incorrect';
                }
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={opt.id}
                    className={btnClass}
                    onClick={() => handleSelectQ8(opt.id)}
                    disabled={answers[8]?.isCorrect}
                  >
                    <span className="fs-option-letter">{letter}</span>
                    <div style={{ flex: 1 }}>
                      <span>{opt.text}</span>
                      {isSelected && (
                        <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
                          {opt.isCorrect
                            ? '✓ Exactly! A acts on x to give b.'
                            : '✕ A is the machine, x is the input vector.'}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {answers[8]?.isCorrect && (
                <div className="fs-inquiry-feedback success" style={{ marginTop: '0.65rem' }}>
                  <span>✓</span>
                  <span>A x = b is the 2D version of f(x) = y.</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* QUESTION 9: Live Evaluation                               */}
          {/* ========================================================= */}
          {activeStep === 9 && (
            <form onSubmit={handleCheckQ9}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, minWidth: '220px', fontSize: '0.9rem' }}>
                    Row 1: {L1.a}({P.x}) {L1.b >= 0 ? '+' : '-'} {Math.abs(L1.b)}({P.y}) =
                  </span>
                  <input
                    ref={q9Row1Ref}
                    type="text"
                    className="fs-cell-input"
                    style={{ width: '80px', height: '36px' }}
                    placeholder="?"
                    value={answers[9].row1}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        9: { ...prev[9], row1: e.target.value, error: null }
                      }))
                    }
                    disabled={answers[9].isCorrect}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, minWidth: '220px', fontSize: '0.9rem' }}>
                    Row 2: {L2.a}({P.x}) {L2.b >= 0 ? '+' : '-'} {Math.abs(L2.b)}({P.y}) =
                  </span>
                  <input
                    type="text"
                    className="fs-cell-input"
                    style={{ width: '80px', height: '36px' }}
                    placeholder="?"
                    value={answers[9].row2}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        9: { ...prev[9], row2: e.target.value, error: null }
                      }))
                    }
                    disabled={answers[9].isCorrect}
                  />
                </div>
              </div>

              {!answers[9].isCorrect && (
                <button type="submit" className="fs-btn-primary" style={{ marginTop: '1rem' }}>
                  Evaluate A · x 🚀
                </button>
              )}

              {answers[9].error && (
                <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                  <span>⚠️</span>
                  <span>{answers[9].error}</span>
                </div>
              )}

              {answers[9].isCorrect && (
                <div className="fs-inquiry-feedback success" style={{ marginTop: '0.65rem' }}>
                  <span>✓</span>
                  <span>Output [{L1.c}, {L2.c}] matches target b: A · x = b verified!</span>
                </div>
              )}
            </form>
          )}

          {/* ========================================================= */}
          {/* QUESTION 10: Second System Solve                          */}
          {/* ========================================================= */}
          {activeStep === 10 && (
            <form onSubmit={handleCheckQ10}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-accent)', marginBottom: '0.4rem' }}>
                Step 1: Enter Matrix A for 2x + y = 8 &amp; x + 2y = 7:
              </div>

              <div className="fs-matrix-assembly" style={{ marginTop: '0.35rem' }}>
                <div className="fs-matrix-bracket">
                  <div className="fs-matrix-grid">
                    <input
                      type="text"
                      className="fs-cell-input"
                      placeholder="?"
                      value={answers[10].matrix[0][0]}
                      onChange={(e) => handleQ10MatrixChange(0, 0, e.target.value)}
                      disabled={answers[10].isCorrect}
                      title="Line 1: x-multiplier"
                    />
                    <input
                      type="text"
                      className="fs-cell-input"
                      placeholder="?"
                      value={answers[10].matrix[0][1]}
                      onChange={(e) => handleQ10MatrixChange(0, 1, e.target.value)}
                      disabled={answers[10].isCorrect}
                      title="Line 1: y-multiplier"
                    />
                    <input
                      type="text"
                      className="fs-cell-input"
                      placeholder="?"
                      value={answers[10].matrix[1][0]}
                      onChange={(e) => handleQ10MatrixChange(1, 0, e.target.value)}
                      disabled={answers[10].isCorrect}
                      title="Line 2: x-multiplier"
                    />
                    <input
                      type="text"
                      className="fs-cell-input"
                      placeholder="?"
                      value={answers[10].matrix[1][1]}
                      onChange={(e) => handleQ10MatrixChange(1, 1, e.target.value)}
                      disabled={answers[10].isCorrect}
                      title="Line 2: y-multiplier"
                    />
                  </div>
                </div>

                <span className="fs-math-sym">·</span>

                <div className="fs-vector-bracket">
                  <span className="fs-static-cell">x</span>
                  <span className="fs-static-cell">y</span>
                </div>

                <span className="fs-math-sym">=</span>

                <div className="fs-vector-bracket target">
                  <span className="fs-static-cell">8</span>
                  <span className="fs-static-cell">7</span>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-accent)', marginTop: '0.9rem', marginBottom: '0.4rem' }}>
                Step 2: Enter intersection point (x, y):
              </div>

              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 600 }}>x =</span>
                  <input
                    type="text"
                    className="fs-cell-input"
                    style={{ width: '70px', height: '36px' }}
                    placeholder="?"
                    value={answers[10].x}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        10: { ...prev[10], x: e.target.value, error: null }
                      }))
                    }
                    disabled={answers[10].isCorrect}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 600 }}>y =</span>
                  <input
                    type="text"
                    className="fs-cell-input"
                    style={{ width: '70px', height: '36px' }}
                    placeholder="?"
                    value={answers[10].y}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        10: { ...prev[10], y: e.target.value, error: null }
                      }))
                    }
                    disabled={answers[10].isCorrect}
                  />
                </div>
              </div>

              {!answers[10].isCorrect && (
                <button type="submit" className="fs-btn-primary" style={{ marginTop: '1rem' }}>
                  Verify System 🚀
                </button>
              )}

              {answers[10].error && (
                <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                  <span>⚠️</span>
                  <span>{answers[10].error}</span>
                </div>
              )}

              {answers[10].isCorrect && (
                <div className="fs-inquiry-feedback success" style={{ marginTop: '0.65rem' }}>
                  <span>✓</span>
                  <span>Solved! A · [3, 2] = [8, 7] holds true.</span>
                </div>
              )}
            </form>
          )}

          {/* ========================================================= */}
          {/* QUESTION 11: Ceremony & Free-Play Sandbox                 */}
          {/* ========================================================= */}
          {activeStep === 11 && (
            <div>
              <div className="fs-ceremony-card">
                <div className="fs-ceremony-icon">🏛️</div>
                <h2 className="fs-ceremony-title">The Naming Handover</h2>
                <p className="fs-ceremony-subtitle">
                  Functions to matrices transition complete:
                </p>

                <div
                  style={{
                    fontSize: '2.1rem',
                    fontWeight: 800,
                    fontFamily: 'serif',
                    color: 'var(--clr-accent)',
                    margin: '0.75rem 0',
                    letterSpacing: '0.04em'
                  }}
                >
                  A · x = b
                </div>

                <div className="fs-takeaways-list">
                  {MATRIX_STUDIO_SUMMARY.keyTakeaways.map((point, i) => (
                    <div key={i} className="fs-takeaway-item">
                      <span style={{ color: 'var(--clr-accent)', fontWeight: 800 }}>•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="fs-sandbox-card">
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--clr-heading)' }}>
                  Interactive Matrix Sandbox
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--clr-text-soft)' }}>
                  Adjust sliders to explore live matrix transformations:
                </p>

                <div className="fs-sandbox-row">
                  <span className="fs-sandbox-label">Line 1: a₁·x + b₁·y = c₁</span>
                  <div className="fs-slider-group">
                    <span>a₁:</span>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="1"
                      className="fs-slider-input"
                      value={sandboxCoeffs.a1}
                      onChange={(e) => handleSandboxChange('a1', e.target.value)}
                    />
                    <strong>{sandboxCoeffs.a1}</strong>
                  </div>
                  <div className="fs-slider-group">
                    <span>b₁:</span>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="1"
                      className="fs-slider-input"
                      value={sandboxCoeffs.b1}
                      onChange={(e) => handleSandboxChange('b1', e.target.value)}
                    />
                    <strong>{sandboxCoeffs.b1}</strong>
                  </div>
                  <div className="fs-slider-group">
                    <span>c₁:</span>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      className="fs-slider-input"
                      value={sandboxCoeffs.c1}
                      onChange={(e) => handleSandboxChange('c1', e.target.value)}
                    />
                    <strong>{sandboxCoeffs.c1}</strong>
                  </div>
                </div>

                <div className="fs-sandbox-row">
                  <span className="fs-sandbox-label">Line 2: a₂·x + b₂·y = c₂</span>
                  <div className="fs-slider-group">
                    <span>a₂:</span>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="1"
                      className="fs-slider-input"
                      value={sandboxCoeffs.a2}
                      onChange={(e) => handleSandboxChange('a2', e.target.value)}
                    />
                    <strong>{sandboxCoeffs.a2}</strong>
                  </div>
                  <div className="fs-slider-group">
                    <span>b₂:</span>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="1"
                      className="fs-slider-input"
                      value={sandboxCoeffs.b2}
                      onChange={(e) => handleSandboxChange('b2', e.target.value)}
                    />
                    <strong>{sandboxCoeffs.b2}</strong>
                  </div>
                  <div className="fs-slider-group">
                    <span>c₂:</span>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      className="fs-slider-input"
                      value={sandboxCoeffs.c2}
                      onChange={(e) => handleSandboxChange('c2', e.target.value)}
                    />
                    <strong>{sandboxCoeffs.c2}</strong>
                  </div>
                </div>

                {geoGebraData.intersection ? (
                  <div className="fs-inquiry-feedback success">
                    <span>✓</span>
                    <span>
                      Solution vector x: [{geoGebraData.intersection.x.toFixed(2)}, {geoGebraData.intersection.y.toFixed(2)}] solves A x = b.
                    </span>
                  </div>
                ) : (
                  <div className="fs-inquiry-feedback error">
                    <span>⚠️</span>
                    <span>The lines are parallel or dependent: determinant det(A) = 0!</span>
                  </div>
                )}
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
                  <span>🚀 Advancing to <strong>Null Space & Kernel (Stage 7)</strong> in <strong>{autoAdvanceTimer}s</strong>...</span>
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
            </div>
          )}

          {/* Step Footer Navigation (Previous / Continue / Change Lines) */}
          <div className={`fs-step-footer-actions ${activeStep === 1 && activeSystem ? 'between' : (activeStep > 1 ? 'between' : 'end')}`}>
            {activeStep === 1 && activeSystem && (
              <button
                className="fs-btn-secondary"
                onClick={handleResetLines}
              >
                ✏️ Change Equations
              </button>
            )}

            {activeStep > 1 && (
              <button
                className="fs-btn-secondary"
                onClick={() => setActiveStep(activeStep - 1)}
              >
                ← Previous
              </button>
            )}

            {activeStep === 1 && activeSystem && (
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep(2)}
              >
                Continue to Question 2 →
              </button>
            )}

            {activeStep > 1 && activeStep < 11 && (
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep(activeStep + 1)}
                disabled={!isQuestionComplete(activeStep)}
              >
                Continue to Question {activeStep + 1} →
              </button>
            )}

            {activeStep === 11 && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {onBack && (
                  <button className="fs-btn-secondary" onClick={onBack}>
                    Dashboard 🏠
                  </button>
                )}
                {onNext && (
                  <button className="fs-btn-primary" onClick={onNext}>
                    Proceed to Null Space & Kernel (Stage 7) ⚖️ ➔
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
