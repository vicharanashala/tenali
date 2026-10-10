import React, { useState, useRef, useEffect } from 'react';
import GeoGebraFunctionLab from './GeoGebraFunctionLab';
import {
  parseLineEquation,
  parseFunctionEquation,
  parseFunctionEvaluationInput
} from './equationParser';
import './FunctionStudioModule.css';

/**
 * Question definitions for Function Studio Journey
 * Following the exact stepper architecture and design principles of Line Studio & Point Studio.
 */
const QUESTIONS_META = [
  {
    id: 1,
    phase: 'Phase 1: Line Foundation',
    title: 'Draw Your Line',
    prompt: 'Enter the equation of a line to draw on the canvas:',
    subtext: 'Type any linear equation starting with y = (for example: y = 2x + 3 or y = -x + 1):'
  },
  {
    id: 2,
    phase: 'Phase 2: One-to-One Mapping',
    title: 'Evaluate First Point',
    prompt: 'What is the value of y when x = ',
    subtext: 'Trace vertically along the dashed guideline on the coordinate grid, or calculate using the equation.'
  },
  {
    id: 3,
    phase: 'Phase 2: One-to-One Mapping',
    title: 'Evaluate Second Point',
    prompt: 'Now, what is the value of y when x = ',
    subtext: 'Find where x meets your line on the grid, or substitute x into the equation.'
  },
  {
    id: 4,
    phase: 'Phase 2: One-to-One Mapping',
    title: 'Evaluate Third Point',
    prompt: 'Finally, what is the value of y when x = ',
    subtext: 'Find where x meets your line on the grid, or substitute x into the equation.'
  },
  {
    id: 5,
    phase: 'Phase 3: The Big Intuition',
    title: 'Role of x',
    prompt: 'What do you think x is acting as on your line?',
    subtext: 'Think about how you started with x each time to determine y on your line.'
  },
  {
    id: 6,
    phase: 'Phase 3: The Big Intuition',
    title: 'Meet f(x)',
    prompt: 'Meet the Function Notation: f(x)',
    subtext: 'A cleaner way to show that x goes inside the rule.'
  },
  {
    id: 7,
    phase: 'Phase 4: Function Studio',
    title: 'Input Your Function',
    prompt: 'Define Your Function: f(x) = ...',
    subtext: 'Type a function starting with f(x) = (for example: f(x) = 2x + 3 or f(x) = -x + 4):'
  },
  {
    id: 8,
    phase: 'Phase 4: Function Studio',
    title: 'Evaluate f(x)',
    prompt: 'Evaluate f(2) and f(4)',
    subtext: 'Use your function rule f(x) to find outputs for inputs x = 2 and x = 4.'
  },
  {
    id: 9,
    phase: 'Phase 5: Functions Across Dimensions',
    title: 'Evaluate g(x,y)',
    prompt: 'Now, g(x,y) = 2x+3y, can you find f(2,3), f(3,4), f(2.44,4.33)....so on',
    subtext: 'Evaluate outputs for pairs of inputs (x, y).'
  },
  {
    id: 10,
    phase: 'Phase 5: Functions Across Dimensions',
    title: 'Think: ℝ²→ℝ²',
    prompt: 'Now, can you think of a function that takes input from set R² and give output from set R² as well.',
    subtext: 'Define a function rule that maps pairs in ℝ² to pairs in ℝ².'
  },
  {
    id: 11,
    phase: 'Phase 5: Functions Across Dimensions',
    title: 'Evaluate h(x,y)',
    prompt: 'If you have h(x,y) = (2x+3y, 4x+5y) can you find h(2,3) , h(4,5), h(1,2)....so on',
    subtext: 'Evaluate outputs for 2D vectors.'
  }
];

const OBSERVATIONS_META = {
  'obs-8': {
    phase: 'Phase 4: Function Studio',
    title: 'Input ℝ ➔ Output ℝ',
    prompt: 'Have you observed you are giving input from set R and output is also from set R?',
    subtext: 'This input output relation can be written as f: R→R'
  },
  'obs-9': {
    phase: 'Phase 5: Functions Across Dimensions',
    title: 'Relation g: ℝ² → ℝ',
    prompt: 'Have you observed you are giving input from set R² and output is from set R',
    subtext: 'This input output relation can be written as g: R²→R'
  },
  'summary': {
    phase: 'Phase 5: Functions Across Dimensions',
    title: 'Relation h: ℝ² → ℝ²',
    prompt: 'This is a function which takes input as R² and give output as R² so we can define it as h: R²→R²',
    subtext: 'Summary of dimensional function mappings.'
  }
};

const Q5_OPTIONS = [
  {
    id: 'input',
    label: 'Input',
    description: 'The starting value you feed into the rule',
    isCorrect: true,
    feedback: null
  },
  {
    id: 'output',
    label: 'Output',
    description: 'The final result produced by the rule',
    isCorrect: false,
    feedback: 'Not quite! Notice the direction: you were given x first and used the rule to find y. The result you get back (y) is the output, while x is the input.'
  },
  {
    id: 'constant',
    label: 'Fixed Constant',
    description: 'A number that never changes',
    isCorrect: false,
    feedback: 'Notice that x changed across every question (x = 1, then x = -2, then x = 2). Because its value changes freely, it is a variable input, not a constant.'
  },
  {
    id: 'slope',
    label: 'Slope',
    description: 'The steepness or tilt of the line',
    isCorrect: false,
    feedback: 'The slope is the multiplier in front of x (the steepness). But x itself is the variable value you plug in as the input.'
  }
];

const DEFAULT_LINE = parseLineEquation('y = 2x + 1');

export default function FunctionStudioModule({ onBack, onNext }) {
  // activeStep: 1..8 corresponding to Questions 1..8
  const [activeStep, setActiveStep] = useState(1);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);

  // Question 1: Line input text
  const [lineEquationInput, setLineEquationInput] = useState('');
  const [activeLine, setActiveLine] = useState(null);
  const effectiveLine = activeLine || DEFAULT_LINE;
  const [lineError, setLineError] = useState(null);

  // Question 7: Function input text
  const [functionEquationInput, setFunctionEquationInput] = useState('');
  const [activeFunctionLine, setActiveFunctionLine] = useState(null);
  const [functionError, setFunctionError] = useState(null);

  // Active line/function for display
  const currentDisplayLine = (activeStep >= 7 && activeFunctionLine) ? activeFunctionLine : effectiveLine;
  const currentLineLabel = activeStep >= 6
    ? `f(x) = ${currentDisplayLine.equationDisplay.replace(/^(y|f\(x\))\s*=\s*/, '')}`
    : currentDisplayLine.equationDisplay;

  // Answers for Questions 2, 3, 4, 5, 8, 9, 10, and 11
  const [answers, setAnswers] = useState({
    2: { yVal: '', isSubmitted: false, isCorrect: false, error: null },
    3: { yVal: '', isSubmitted: false, isCorrect: false, error: null },
    4: { yVal: '', isSubmitted: false, isCorrect: false, error: null },
    5: { selectedId: null, isSubmitted: false, isCorrect: false, error: null },
    8: { val2: '', val4: '', is2Correct: false, is4Correct: false, isCorrect: false, error: null },
    9: { val1: '', val2: '', is1Correct: false, is2Correct: false, isCorrect: false, error: null },
    10: { val1: '', val2: '', isSubmitted: false, isCorrect: false, error: null },
    11: {
      val1X: '', val1Y: '', is1Correct: false,
      val2X: '', val2Y: '', is2Correct: false,
      isCorrect: false,
      error: null
    }
  });

  // Track session completed journeys
  const [completedLinesCount, setCompletedLinesCount] = useState(0);

  const lineInputRef = useRef(null);
  const q2InputRef = useRef(null);
  const q3InputRef = useRef(null);
  const q4InputRef = useRef(null);
  const q7InputRef = useRef(null);
  const q8Val2Ref = useRef(null);
  const q8Val4Ref = useRef(null);
  const q9Val1Ref = useRef(null);
  const q9Val2Ref = useRef(null);
  const q10InputRef = useRef(null);
  const q11Input1XRef = useRef(null);
  const q11Input2XRef = useRef(null);

  // Auto-focus inputs on question change or sub-step progression
  const isQ8Part1Done = Boolean(answers[8]?.is2Correct);
  const isQ9Part1Done = Boolean(answers[9]?.is1Correct);
  const isQ11Part1Done = Boolean(answers[11]?.is1Correct);

  useEffect(() => {
    if (activeStep === 1 && !activeLine && lineInputRef.current) {
      lineInputRef.current.focus();
    } else if (activeStep === 2 && q2InputRef.current && !answers[2]?.isCorrect) {
      q2InputRef.current.focus();
    } else if (activeStep === 3 && q3InputRef.current && !answers[3]?.isCorrect) {
      q3InputRef.current.focus();
    } else if (activeStep === 4 && q4InputRef.current && !answers[4]?.isCorrect) {
      q4InputRef.current.focus();
    } else if (activeStep === 7 && !activeFunctionLine && q7InputRef.current) {
      q7InputRef.current.focus();
    } else if (activeStep === 8 && q8Val2Ref.current && !answers[8]?.is2Correct) {
      q8Val2Ref.current.focus();
    } else if (activeStep === 8 && q8Val4Ref.current && answers[8]?.is2Correct && !answers[8]?.is4Correct) {
      q8Val4Ref.current.focus();
    } else if (activeStep === 9 && q9Val1Ref.current && !answers[9]?.is1Correct) {
      q9Val1Ref.current.focus();
    } else if (activeStep === 9 && q9Val2Ref.current && answers[9]?.is1Correct && !answers[9]?.is2Correct) {
      q9Val2Ref.current.focus();
    } else if (activeStep === 10 && q10InputRef.current && !answers[10]?.isCorrect) {
      q10InputRef.current.focus();
    } else if (activeStep === 11 && !answers[11]?.is1Correct && q11Input1XRef.current) {
      q11Input1XRef.current.focus();
    } else if (activeStep === 11 && answers[11]?.is1Correct && !answers[11]?.is2Correct && q11Input2XRef.current) {
      q11Input2XRef.current.focus();
    }
  }, [
    activeStep,
    Boolean(activeLine),
    Boolean(activeFunctionLine),
    isQ8Part1Done,
    isQ9Part1Done,
    isQ11Part1Done
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

  // Question completion criteria
  const isQuestionComplete = (qId) => {
    if (qId === 1) return Boolean(activeLine);
    if (qId === 6) return Boolean(answers[5]?.isCorrect);
    if (qId === 7) return Boolean(activeFunctionLine);
    if (qId === 8) return Boolean(answers[8]?.isCorrect);
    if (qId === 9) return Boolean(answers[9]?.is2Correct || answers[9]?.isCorrect);
    if (qId === 10) return Boolean(answers[10]?.isCorrect);
    if (qId === 11) return Boolean(answers[11]?.isCorrect);
    return Boolean(answers[qId]?.isCorrect);
  };

  // Question unlock criteria (unrestricted for free navigation)
  const isQuestionUnlocked = (_qId) => true;

  // Inquiry points from effective line
  const inq1 = effectiveLine.inquiries[0];
  const inq2 = effectiveLine.inquiries[1];
  const inq3 = effectiveLine.inquiries[2];

  // Compute verified points for GeoGebra canvas
  const verifiedPoints = [];
  if (activeStep < 7) {
    if (answers[2]?.isCorrect && inq1) {
      verifiedPoints.push({ name: 'P_1', label: `(${inq1.x}, ${inq1.y})`, x: inq1.x, y: inq1.y });
    }
    if (answers[3]?.isCorrect && inq2) {
      verifiedPoints.push({ name: 'P_2', label: `(${inq2.x}, ${inq2.y})`, x: inq2.x, y: inq2.y });
    }
    if (answers[4]?.isCorrect && inq3) {
      verifiedPoints.push({ name: 'P_3', label: `(${inq3.x}, ${inq3.y})`, x: inq3.x, y: inq3.y });
    }
  } else if (activeStep === 8) {
    if (answers[8]?.is2Correct && currentDisplayLine) {
      verifiedPoints.push({
        name: 'Pt_eval2',
        label: `f(2) = ${currentDisplayLine.eval2}`,
        x: 2,
        y: currentDisplayLine.eval2
      });
    }
    if (answers[8]?.is4Correct && currentDisplayLine) {
      verifiedPoints.push({
        name: 'Pt_eval4',
        label: `f(4) = ${currentDisplayLine.eval4}`,
        x: 4,
        y: currentDisplayLine.eval4
      });
    }
  }

  // Determine what to graph on the GeoGebra canvas
  const getGgbActiveLine = () => {
    if (activeStep === 1) {
      if (!activeLine) return null;
      return {
        id: 'mainGraphLine',
        cmd: activeLine.ggbCmd,
        label: activeLine.equationDisplay
      };
    }
    if (activeStep >= 2 && activeStep <= 5) {
      return {
        id: 'mainGraphLine',
        cmd: effectiveLine.ggbCmd,
        label: effectiveLine.equationDisplay
      };
    }
    if (activeStep === 6) {
      return {
        id: 'mainGraphLine',
        cmd: effectiveLine.ggbCmd,
        label: `f(x) = ${effectiveLine.equationDisplay.replace(/^y\s*=\s*/, '')}`
      };
    }
    if (activeStep === 7) {
      if (!activeFunctionLine) return null;
      return {
        id: 'mainGraphLine',
        cmd: activeFunctionLine.ggbCmd,
        label: activeFunctionLine.equationDisplay
      };
    }
    if (activeStep >= 8) {
      const lineToUse = activeFunctionLine || effectiveLine;
      return {
        id: 'mainGraphLine',
        cmd: lineToUse.ggbCmd,
        label: lineToUse.equationDisplay.startsWith('f(x)')
          ? lineToUse.equationDisplay
          : `f(x) = ${lineToUse.equationDisplay.replace(/^y\s*=\s*/, '')}`
      };
    }
    return null;
  };

  // Target X for vertical guideline
  const getTargetX = () => {
    if (activeStep === 2 && !answers[2]?.isCorrect && inq1) return inq1.x;
    if (activeStep === 3 && !answers[3]?.isCorrect && inq2) return inq2.x;
    if (activeStep === 4 && !answers[4]?.isCorrect && inq3) return inq3.x;
    if (activeStep === 8) {
      if (!answers[8]?.is2Correct) return 2;
      if (!answers[8]?.is4Correct) return 4;
    }
    return null;
  };

  // Target Y for horizontal guideline
  const getTargetY = () => null;

  // Coordinate bounds for GeoGebra canvas per step
  const getCoordBounds = () => {
    if (activeStep === 8 && currentDisplayLine) {
      const e2 = currentDisplayLine.eval2 ?? (currentDisplayLine.m * 2 + currentDisplayLine.c);
      const e4 = currentDisplayLine.eval4 ?? (currentDisplayLine.m * 4 + currentDisplayLine.c);
      const c = currentDisplayLine.c ?? 0;
      const allY = [0, c, e2, e4];
      const minY = Math.min(...allY);
      const maxY = Math.max(...allY);
      const padY = Math.max(3, (maxY - minY) * 0.25);
      const ymin = Math.floor(minY - padY);
      const ymax = Math.ceil(maxY + padY);
      const deltaY = ymax - ymin;
      const deltaX = Math.max(22, Math.ceil(deltaY * 1.65));
      const centerX = 4;
      return {
        xmin: Math.floor(centerX - deltaX / 2),
        xmax: Math.ceil(centerX + deltaX / 2),
        ymin,
        ymax
      };
    }
    return { xmin: -6, xmax: 10, ymin: -4, ymax: 12 };
  };

  // Handle Q1 Line Submission
  const handlePlotLine = (e) => {
    if (e) e.preventDefault();
    const raw = lineEquationInput.trim();
    const parsed = parseLineEquation(raw);

    if (!parsed.success) {
      setLineError(parsed.error);
      return;
    }

    setActiveLine(parsed);
    setLineError(null);

    // Reset downstream answers when line is re-plotted
    setAnswers((prev) => ({
      ...prev,
      2: { yVal: '', isSubmitted: false, isCorrect: false, error: null },
      3: { yVal: '', isSubmitted: false, isCorrect: false, error: null },
      4: { yVal: '', isSubmitted: false, isCorrect: false, error: null },
      5: { selectedId: null, isSubmitted: false, isCorrect: false, error: null }
    }));
  };

  // Handle Q7 Function Submission
  const handlePlotFunction = (e) => {
    if (e) e.preventDefault();
    const raw = functionEquationInput.trim();
    const parsed = parseFunctionEquation(raw);

    if (!parsed.success) {
      setFunctionError(parsed.error);
      return;
    }

    setActiveFunctionLine(parsed);
    setFunctionError(null);

    setAnswers((prev) => ({
      ...prev,
      8: { val2: '', val4: '', is2Correct: false, is4Correct: false, isCorrect: false, error: null }
    }));
  };

  // Handle Q2..Q4 Point Answer Submission
  const handleCheckPointAnswer = (stepNum, targetInquiry, e) => {
    if (e) e.preventDefault();
    if (!targetInquiry) return;

    const currentAns = answers[stepNum];
    if (currentAns.isCorrect) return;

    const trimmed = currentAns.yVal.trim();
    if (!trimmed) {
      setAnswers((prev) => ({
        ...prev,
        [stepNum]: { ...prev[stepNum], error: 'Please enter a numeric value for y.' }
      }));
      return;
    }

    const val = parseFloat(trimmed);
    if (isNaN(val)) {
      setAnswers((prev) => ({
        ...prev,
        [stepNum]: { ...prev[stepNum], error: 'Please enter a valid number for y.' }
      }));
      return;
    }

    if (val === targetInquiry.y) {
      setAnswers((prev) => ({
        ...prev,
        [stepNum]: {
          ...prev[stepNum],
          isSubmitted: true,
          isCorrect: true,
          error: null
        }
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [stepNum]: {
          ...prev[stepNum],
          error: `Not quite. Substitute x = ${targetInquiry.x} into ${effectiveLine.equationDisplay}, or trace where the dashed vertical line touches your line on the grid.`
        }
      }));
    }
  };

  // Handle Q5 Instant Selection
  const handleSelectQ5Option = (selectedId) => {
    if (answers[5]?.isCorrect) return;

    const selectedOpt = Q5_OPTIONS.find((opt) => opt.id === selectedId);
    if (!selectedOpt) return;

    if (selectedOpt.isCorrect) {
      setAnswers((prev) => ({
        ...prev,
        5: { selectedId, isSubmitted: true, isCorrect: true, error: null }
      }));
      setCompletedLinesCount((prev) => prev + 1);
    } else {
      setAnswers((prev) => ({
        ...prev,
        5: {
          selectedId,
          isSubmitted: true,
          isCorrect: false,
          error: selectedOpt.feedback
        }
      }));
    }
  };

  // Handle Q8 f(2) Submission (GeoGebra convention)
  const handleCheckQ8Val2 = (e) => {
    if (e) e.preventDefault();
    const currentAns = answers[8];
    if (currentAns?.is2Correct) return;

    const raw = currentAns?.val2 || '';
    const res = parseFunctionEvaluationInput(raw, 2, currentDisplayLine);

    if (!res.success) {
      setAnswers((prev) => ({
        ...prev,
        8: { ...prev[8], error: res.error }
      }));
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      8: {
        ...prev[8],
        is2Correct: true,
        error: null
      }
    }));
  };

  // Handle Q8 f(4) Submission (GeoGebra convention)
  const handleCheckQ8Val4 = (e) => {
    if (e) e.preventDefault();
    const currentAns = answers[8];
    if (currentAns?.is4Correct) return;

    const raw = currentAns?.val4 || '';
    const res = parseFunctionEvaluationInput(raw, 4, currentDisplayLine);

    if (!res.success) {
      setAnswers((prev) => ({
        ...prev,
        8: { ...prev[8], error: res.error }
      }));
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      8: {
        ...prev[8],
        is4Correct: true,
        isCorrect: true,
        error: null
      }
    }));
    setCompletedLinesCount((prev) => prev + 1);
  };

  // Helper to validate evaluation for g(x, y) = 2x + 3y
  const parse2DEval = (raw, targetX, targetY, expectedVal) => {
    if (!raw || typeof raw !== 'string' || !raw.trim()) {
      return {
        success: false,
        error: `Type g(${targetX}, ${targetY}) to call your function with input (${targetX}, ${targetY}).`
      };
    }
    const trimmed = raw.trim();

    // Direct number, e.g. "13" -> reject and guide to use g(...) call syntax
    if (/^[+-]?\d+(?:\.\d+)?$/.test(trimmed)) {
      return {
        success: false,
        error: `Call the function by typing g(${targetX}, ${targetY}) rather than just the number.`
      };
    }

    // Generic variables like g(x, y)
    if (/^[a-zA-Z]\s*\(\s*x\s*,\s*y\s*\)$/i.test(trimmed)) {
      return {
        success: false,
        error: `Specify the input numbers inside the parentheses: type g(${targetX}, ${targetY}).`
      };
    }

    // Function call syntax: g(2, 3), g(2,3), f(2, 3), or g(2, 3) = 13
    const match = trimmed.match(/^[a-zA-Z]\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)(?:\s*=\s*(.*))?$/i);
    if (match) {
      const inX = parseFloat(match[1]);
      const inY = parseFloat(match[2]);
      if (Math.abs(inX - targetX) > 0.01 || Math.abs(inY - targetY) > 0.01) {
        return {
          success: false,
          error: `You called g(${inX}, ${inY}), but this question asks to evaluate at (${targetX}, ${targetY}). Type g(${targetX}, ${targetY}).`
        };
      }
      if (match[3] !== undefined && match[3].trim() !== '') {
        const rhs = parseFloat(match[3].trim());
        if (!isNaN(rhs) && Math.abs(rhs - expectedVal) > 0.01) {
          return {
            success: false,
            error: `Notice 2(${targetX}) + 3(${targetY}) = ${expectedVal}, not ${rhs}. You can just type g(${targetX}, ${targetY}) to evaluate!`
          };
        }
      }
      return { success: true };
    }

    // Direct arithmetic expression without function call: e.g. 2(2) + 3(3) or 4 + 9
    const cleanExpr = trimmed.replace(/\s+/g, '');
    if (/^[0-9+\-*/().]+$/.test(cleanExpr)) {
      return {
        success: false,
        error: `Call the function by typing g(${targetX}, ${targetY}) rather than entering an arithmetic expression.`
      };
    }

    return {
      success: false,
      error: `Use function command syntax: type g(${targetX}, ${targetY}).`
    };
  };

  // Handle Q9 g(2, 3) Submission
  const handleCheckQ9Val1 = (e) => {
    if (e) e.preventDefault();
    const currentAns = answers[9];
    if (currentAns?.is1Correct) return;

    const res = parse2DEval(currentAns?.val1 || '', 2, 3, 13);
    if (!res.success) {
      setAnswers((prev) => ({
        ...prev,
        9: { ...prev[9], error: res.error }
      }));
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      9: { ...prev[9], is1Correct: true, error: null }
    }));
  };

  // Handle Q9 g(3, 4) Submission
  const handleCheckQ9Val2 = (e) => {
    if (e) e.preventDefault();
    const currentAns = answers[9];
    if (currentAns?.is2Correct) return;

    const res = parse2DEval(currentAns?.val2 || '', 3, 4, 18);
    if (!res.success) {
      setAnswers((prev) => ({
        ...prev,
        9: { ...prev[9], error: res.error }
      }));
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      9: {
        ...prev[9],
        is2Correct: true,
        isCorrect: true,
        error: null
      }
    }));
    setCompletedLinesCount((prev) => prev + 1);
  };

  // Validates that an algebraic component is strictly linear in variables x and y
  const validate2DLinearComponent = (str, componentName) => {
    if (!str || typeof str !== 'string' || !str.trim()) {
      return { success: false, error: `Please enter a linear expression for ${componentName} (e.g. 2x + 3y).` };
    }
    const trimmed = str.trim();

    // Check for invalid letters (only x and y allowed as variables)
    const allLetters = trimmed.match(/[a-zA-Z]/g);
    if (allLetters) {
      const invalidLetters = allLetters.filter((ch) => !['x', 'y'].includes(ch.toLowerCase()));
      if (invalidLetters.length > 0) {
        const unique = [...new Set(invalidLetters.map((c) => c.toLowerCase()))].join(', ');
        return {
          success: false,
          error: `Invalid variable '${unique}' in ${componentName}. Linear functions can only use variables x and y (e.g. 2x + 3y).`
        };
      }
    }

    // Check for powers / exponents (e.g. x^2, y^3, x**2)
    if (/[\^]|\*{2}/.test(trimmed)) {
      return {
        success: false,
        error: `Only linear functions are allowed in ${componentName}. Powers like x² or y² are non-linear.`
      };
    }

    // Check for division by variables (e.g. /x, /y, /(x))
    if (/\/\s*\(?\s*[xy]/i.test(trimmed)) {
      return {
        success: false,
        error: `Only linear functions are allowed in ${componentName}. Dividing by variables like 1/x is non-linear.`
      };
    }

    // Check for products of variables (e.g. xy, yx, x*y, y*x, x(y), y(x))
    if (/x\s*\*?\s*y|y\s*\*?\s*x|x\s*\(\s*y\s*\)|y\s*\(\s*x\s*\)/i.test(trimmed)) {
      return {
        success: false,
        error: `Only linear functions are allowed in ${componentName}. Products of variables like xy are non-linear.`
      };
    }

    // Check for allowed characters: digits, x, y, +, -, *, /, (, ), ., space
    if (!/^[0-9xy+\-*/().\s]+$/i.test(trimmed)) {
      return {
        success: false,
        error: `Invalid characters in ${componentName}. Use standard math operators (+, -, *, /) and variables x, y.`
      };
    }

    // Must contain variable x or y
    if (!/[xy]/i.test(trimmed)) {
      return {
        success: false,
        error: `Please include variable x or y in ${componentName} to form a linear rule (e.g. 2x + 3y or x - y).`
      };
    }

    // Convert algebraic notation (e.g. 2x, 3y, (x+y)(2)) to executable JS expression
    let jsExpr = trimmed
      .replace(/(\d)\s*([xy])/gi, '$1*$2')
      .replace(/([xy])\s*(\d)/gi, '$1*$2')
      .replace(/(\d)\s*\(/g, '$1*(')
      .replace(/([xy])\s*\(/gi, '$1*(')
      .replace(/\)\s*([xy\d(])/gi, ')*$1');

    let testFn;
    try {
      testFn = new Function('x', 'y', `"use strict"; return (${jsExpr});`);
    } catch (err) {
      return {
        success: false,
        error: `Could not parse ${componentName} as a valid linear mathematical expression (e.g. 2x + 3y).`
      };
    }

    // Mathematical linearity verification:
    // A function L(x, y) is affine-linear iff L(x, y) = ax + by + c for all (x, y)
    try {
      const p00 = testFn(0, 0);
      const p10 = testFn(1, 0);
      const p01 = testFn(0, 1);

      if (
        typeof p00 !== 'number' || isNaN(p00) || !isFinite(p00) ||
        typeof p10 !== 'number' || isNaN(p10) || !isFinite(p10) ||
        typeof p01 !== 'number' || isNaN(p01) || !isFinite(p01)
      ) {
        return {
          success: false,
          error: `Please enter a valid linear expression for ${componentName} (e.g. 2x + 3y).`
        };
      }

      const c = p00;
      const a = p10 - c;
      const b = p01 - c;

      // Verify at multiple test points
      const testPoints = [
        [2, 3],
        [-3, 4],
        [5, -2],
        [7, 11],
        [0.5, -1.5]
      ];

      for (const [tx, ty] of testPoints) {
        const actual = testFn(tx, ty);
        const expected = a * tx + b * ty + c;
        if (typeof actual !== 'number' || isNaN(actual) || Math.abs(actual - expected) > 1e-4) {
          return {
            success: false,
            error: `Only linear functions of the form ax + by + c are allowed in ${componentName} (e.g. 2x + 3y).`
          };
        }
      }
    } catch (err) {
      return {
        success: false,
        error: `Could not evaluate ${componentName}. Please enter a linear expression (e.g. 2x + 3y).`
      };
    }

    return { success: true };
  };

  // Handle Q10 Think: ℝ² ➔ ℝ² Function Submission
  const handleCheckQ10 = (e) => {
    if (e) e.preventDefault();
    const v1 = (answers[10]?.val1 || '').trim();
    const v2 = (answers[10]?.val2 || '').trim();

    if (!v1 || !v2) {
      setAnswers((prev) => ({
        ...prev,
        10: { ...prev[10], error: 'Please enter linear expressions for both components, e.g. 2x + 3y and 4x + 5y.' }
      }));
      return;
    }

    const res1 = validate2DLinearComponent(v1, 'Component 1');
    if (!res1.success) {
      setAnswers((prev) => ({
        ...prev,
        10: { ...prev[10], isCorrect: false, error: res1.error }
      }));
      return;
    }

    const res2 = validate2DLinearComponent(v2, 'Component 2');
    if (!res2.success) {
      setAnswers((prev) => ({
        ...prev,
        10: { ...prev[10], isCorrect: false, error: res2.error }
      }));
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      10: { ...prev[10], isSubmitted: true, isCorrect: true, error: null }
    }));
    setCompletedLinesCount((prev) => prev + 1);
  };

  const parseVectorComponentValue = (str) => {
    if (!str || typeof str !== 'string' || !str.trim()) return NaN;
    const clean = str.trim().replace(/\s+/g, '').replace(/(\d)\(/g, '$1*(');
    if (/^[0-9+\-*/().]+$/.test(clean)) {
      try {
        const val = Function(`"use strict"; return (${clean})`)();
        if (typeof val === 'number') return val;
      } catch (err) {}
    }
    return parseFloat(str);
  };

  const evaluateVectorSubmission = (rawX, rawY, inX, inY, expX, expY) => {
    if (!rawX || !rawY || !rawX.trim() || !rawY.trim()) {
      return { success: false, error: `Please enter values for both components of h(${inX}, ${inY}).` };
    }

    const numX = parseVectorComponentValue(rawX);
    const numY = parseVectorComponentValue(rawY);

    if (isNaN(numX) || isNaN(numY)) {
      return { success: false, error: 'Please enter valid numbers or arithmetic expressions.' };
    }

    const xCorrect = Math.abs(numX - expX) < 0.01;
    const yCorrect = Math.abs(numY - expY) < 0.01;

    if (xCorrect && yCorrect) {
      return { success: true };
    }

    if (!xCorrect && yCorrect) {
      return { success: false, error: `First component incorrect: 2(${inX}) + 3(${inY}) = ${expX}.` };
    }
    if (xCorrect && !yCorrect) {
      return { success: false, error: `Second component incorrect: 4(${inX}) + 5(${inY}) = ${expY}.` };
    }
    return {
      success: false,
      error: `Not quite. First: 2(${inX}) + 3(${inY}) = ${expX}, Second: 4(${inX}) + 5(${inY}) = ${expY}.`
    };
  };

  // Handle Q11 Step 1: h(2, 3)
  const handleCheckQ11Val1 = (e) => {
    if (e) e.preventDefault();
    const currentAns = answers[11];
    if (currentAns?.is1Correct) return;

    const res = evaluateVectorSubmission(currentAns?.val1X || '', currentAns?.val1Y || '', 2, 3, 13, 23);
    if (!res.success) {
      setAnswers((prev) => ({
        ...prev,
        11: { ...prev[11], error: res.error }
      }));
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      11: { ...prev[11], is1Correct: true, error: null }
    }));
  };

  // Handle Q11 Step 2: h(4, 5)
  const handleCheckQ11Val2 = (e) => {
    if (e) e.preventDefault();
    const currentAns = answers[11];
    if (currentAns?.is2Correct) return;

    const res = evaluateVectorSubmission(currentAns?.val2X || '', currentAns?.val2Y || '', 4, 5, 23, 41);
    if (!res.success) {
      setAnswers((prev) => ({
        ...prev,
        11: { ...prev[11], error: res.error }
      }));
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      11: {
        ...prev[11],
        is2Correct: true,
        isCorrect: true,
        error: null
      }
    }));
    setCompletedLinesCount((prev) => prev + 1);
  };

  // Reset to input another line
  const handleResetNewJourney = () => {
    setActiveLine(null);
    setLineEquationInput('');
    setLineError(null);
    setActiveFunctionLine(null);
    setFunctionEquationInput('');
    setFunctionError(null);
    setAnswers({
      2: { yVal: '', isSubmitted: false, isCorrect: false, error: null },
      3: { yVal: '', isSubmitted: false, isCorrect: false, error: null },
      4: { yVal: '', isSubmitted: false, isCorrect: false, error: null },
      5: { selectedId: null, isSubmitted: false, isCorrect: false, error: null },
      8: { val2: '', val4: '', is2Correct: false, is4Correct: false, isCorrect: false, error: null },
      9: { val1: '', val2: '', is1Correct: false, is2Correct: false, isCorrect: false, error: null },
      10: { val1: '', val2: '', isSubmitted: false, isCorrect: false, error: null },
      11: {
        val1X: '', val1Y: '', is1Correct: false,
        val2X: '', val2Y: '', is2Correct: false,
        isCorrect: false,
        error: null
      }
    });
    setActiveStep(1);
  };

  const isObs8 = activeStep === 'obs-8';
  const isObs9 = activeStep === 'obs-9';
  const isSummary = activeStep === 'summary';
  const isObservationStep = isObs8 || isObs9 || isSummary;

  const currentQ = isObservationStep
    ? OBSERVATIONS_META[activeStep]
    : QUESTIONS_META.find((q) => q.id === activeStep) || QUESTIONS_META[0];

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
          {completedLinesCount > 0 && (
            <span
              className="fs-progress-badge"
              style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.35)' }}
            >
              ✓ Lines Completed: {completedLinesCount}
            </span>
          )}
          <span className="fs-progress-badge">
            {isObservationStep
              ? (isSummary ? 'Core Discovery' : 'Key Observation')
              : `Question ${activeStep} of ${QUESTIONS_META.length}`}
          </span>
        </div>
      </div>

      {/* 2. HEADER */}
      <div className="fs-header">
        <span className="fs-phase-pill">{currentQ.phase}</span>
        <h1 className="fs-title">The Function Studio</h1>
        <p className="fs-subtitle">
          Building mathematical intuition for rules, inputs, and outputs.
        </p>
      </div>

      {/* 3. STEPPER BAR (Unrestricted free navigation) */}
      <div className="fs-stepper-bar">
        {QUESTIONS_META.map((q) => {
          const isDone = isQuestionComplete(q.id);
          const isActive =
            activeStep === q.id ||
            (activeStep === 'obs-8' && q.id === 8) ||
            (activeStep === 'obs-9' && q.id === 9) ||
            (activeStep === 'summary' && q.id === 11);
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
            <span className="fs-question-badge">
              {isObservationStep
                ? (isSummary ? 'Discovery' : 'Observation')
                : `Q${activeStep}`}
            </span>
            <span className="fs-topic-badge">{currentQ.title}</span>
            {activeStep === 1 && activeLine && (
              <span className="fs-card-line-badge">{activeLine.equationDisplay}</span>
            )}
            {activeStep >= 2 && activeStep <= 5 && (
              <span className="fs-card-line-badge">{effectiveLine.equationDisplay}</span>
            )}
            {activeStep === 6 && (
              <span className="fs-card-line-badge">{`f(x) = ${effectiveLine.equationDisplay.replace(/^y\s*=\s*/, '')}`}</span>
            )}
            {activeStep === 7 && activeFunctionLine && (
              <span className="fs-card-line-badge">{activeFunctionLine.equationDisplay}</span>
            )}
            {(activeStep === 8 || activeStep === 'obs-8') && (
              <span className="fs-card-line-badge">{currentLineLabel}</span>
            )}
            {(activeStep === 9 || activeStep === 'obs-9') && (
              <span className="fs-card-line-badge">g(x,y) = 2x + 3y</span>
            )}
            {(activeStep === 10 || activeStep === 11 || activeStep === 'summary') && (
              <span className="fs-card-line-badge">h(x,y) = (2x+3y, 4x+5y)</span>
            )}
          </div>
          <span className="fs-question-num">
            {isObservationStep
              ? (isSummary ? 'Dimensional Summary' : 'Intermediate Observation')
              : `Question ${activeStep} of ${QUESTIONS_META.length}`}
          </span>
        </div>

        {/* 1. GRAPH AT TOP (Centered isometric Cartesian canvas) */}
        {activeStep !== 6 && typeof activeStep === 'number' && activeStep <= 8 && (
          <GeoGebraFunctionLab
            activeLine={getGgbActiveLine()}
            targetX={getTargetX()}
            targetY={getTargetY()}
            verifiedPoints={verifiedPoints}
            showInputBar={false}
            compact={false}
            coordBounds={getCoordBounds()}
          />
        )}

        {/* 2. QUESTION CONTENT */}

        {/* =================================================== */}
        {/* QUESTION 1: DRAW YOUR LINE                          */}
        {/* =================================================== */}
        {activeStep === 1 && (
          <div className="fs-step-intro-block">
            {activeLine ? (
              <>
                <div className="fs-equation-pill-bar">
                  <span className="fs-equation-pill-label">Line Equation:</span>
                  <span className="fs-equation-pill-val">{activeLine.equationDisplay}</span>
                </div>
                <h3 className="fs-step-heading">
                  Your Line: <span className="fs-equation-highlight">{activeLine.equationDisplay}</span>
                </h3>
                <p className="fs-step-subtext">
                  Your line <strong style={{ color: '#e8864a' }}>{activeLine.equationDisplay}</strong> is drawn on the canvas. Click Continue to evaluate points on it.
                </p>
              </>
            ) : (
              <>
                <h3 className="fs-step-heading">
                  Enter the equation of a line to draw on the canvas:
                </h3>
                <p className="fs-step-subtext">{currentQ.subtext}</p>
              </>
            )}

            {!activeLine && (
              <>
                <form className="fs-tray-input-row" onSubmit={handlePlotLine} style={{ marginTop: '0.85rem' }}>
                  <input
                    ref={lineInputRef}
                    type="text"
                    className="fs-tray-input-box"
                    placeholder="e.g. y = 2x + 3 or y = -x + 1"
                    value={lineEquationInput}
                    onChange={(e) => {
                      setLineEquationInput(e.target.value);
                      setLineError(null);
                    }}
                  />
                  <button type="submit" className="fs-tray-submit-btn">
                    Plot Line 🚀
                  </button>
                </form>

                {lineError && (
                  <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                    <span>⚠️</span>
                    <span>{lineError}</span>
                  </div>
                )}
              </>
            )}

            {activeLine && (
              <div className="fs-inquiry-feedback success" style={{ marginTop: '0.65rem' }}>
                <span>✓</span>
                <span>Line <strong>{activeLine.equationDisplay}</strong> plotted on canvas! Click Continue to evaluate points on it.</span>
              </div>
            )}

            {/* Step Footer Navigation */}
            <div className={`fs-step-footer-actions ${activeLine ? 'between' : 'end'}`}>
              {activeLine && (
                <button
                  className="fs-btn-secondary"
                  onClick={() => {
                    setActiveLine(null);
                  }}
                >
                  ✏️ Change Equation
                </button>
              )}
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep(2)}
              >
                Continue to Question 2 →
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* QUESTION 2: EVALUATE FIRST POINT                    */}
        {/* =================================================== */}
        {activeStep === 2 && (
          <div className="fs-step-intro-block">
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">Line Equation:</span>
              <span className="fs-equation-pill-val">{effectiveLine.equationDisplay}</span>
            </div>
            <h3 className="fs-step-heading">
              On your line <span className="fs-equation-highlight">{effectiveLine.equationDisplay}</span>, when <span style={{ color: '#e8864a' }}>x = {inq1.x}</span>, what is the value of <span style={{ color: '#14b8a6' }}>y</span>?
            </h3>
            <p className="fs-step-subtext">
              Look at the dashed vertical guideline at <strong>x = {inq1.x}</strong> on the grid, or substitute <strong>x = {inq1.x}</strong> into <strong>{effectiveLine.equationDisplay}</strong>.
            </p>

            <form
              className="fs-inquiry-form"
              onSubmit={(e) => handleCheckPointAnswer(2, inq1, e)}
              style={{ marginTop: '0.85rem' }}
            >
              <span className="fs-inquiry-prefix">y =</span>
              <input
                ref={q2InputRef}
                type="text"
                className="fs-inquiry-input"
                placeholder="?"
                value={answers[2].yVal}
                onChange={(e) => {
                  const val = e.target.value;
                  setAnswers((prev) => ({
                    ...prev,
                    2: { ...prev[2], yVal: val, error: null }
                  }));
                }}
                disabled={answers[2].isCorrect}
              />
              {!answers[2].isCorrect && (
                <button type="submit" className="fs-btn-primary">
                  Check Answer ✓
                </button>
              )}
            </form>

            {answers[2].error && (
              <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                <span>ℹ</span>
                <span>{answers[2].error}</span>
              </div>
            )}

            {answers[2].isCorrect && (
              <div className="fs-inquiry-feedback success" style={{ marginTop: '0.65rem' }}>
                <span>✓</span>
                <span>Correct! On <strong>{effectiveLine.equationDisplay}</strong>, when x = {inq1.x}, y = {inq1.y}. Point P1({inq1.x}, {inq1.y}) is now pinned on your line.</span>
              </div>
            )}

            {/* Step Footer Navigation */}
            <div className="fs-step-footer-actions between">
              <button className="fs-btn-secondary" onClick={() => setActiveStep(1)}>
                ← Back to Question 1
              </button>
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep(3)}
              >
                Continue to Question 3 →
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* QUESTION 3: EVALUATE SECOND POINT                   */}
        {/* =================================================== */}
        {activeStep === 3 && (
          <div className="fs-step-intro-block">
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">Line Equation:</span>
              <span className="fs-equation-pill-val">{effectiveLine.equationDisplay}</span>
            </div>
            <h3 className="fs-step-heading">
              On your line <span className="fs-equation-highlight">{effectiveLine.equationDisplay}</span>, when <span style={{ color: '#e8864a' }}>x = {inq2.x}</span>, what is the value of <span style={{ color: '#14b8a6' }}>y</span>?
            </h3>
            <p className="fs-step-subtext">
              Trace vertically from <strong>x = {inq2.x}</strong> to where it meets your line, or substitute <strong>x = {inq2.x}</strong> into <strong>{effectiveLine.equationDisplay}</strong>.
            </p>

            <form
              className="fs-inquiry-form"
              onSubmit={(e) => handleCheckPointAnswer(3, inq2, e)}
              style={{ marginTop: '0.85rem' }}
            >
              <span className="fs-inquiry-prefix">y =</span>
              <input
                ref={q3InputRef}
                type="text"
                className="fs-inquiry-input"
                placeholder="?"
                value={answers[3].yVal}
                onChange={(e) => {
                  const val = e.target.value;
                  setAnswers((prev) => ({
                    ...prev,
                    3: { ...prev[3], yVal: val, error: null }
                  }));
                }}
                disabled={answers[3].isCorrect}
              />
              {!answers[3].isCorrect && (
                <button type="submit" className="fs-btn-primary">
                  Check Answer ✓
                </button>
              )}
            </form>

            {answers[3].error && (
              <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                <span>ℹ</span>
                <span>{answers[3].error}</span>
              </div>
            )}

            {answers[3].isCorrect && (
              <div className="fs-inquiry-feedback success" style={{ marginTop: '0.65rem' }}>
                <span>✓</span>
                <span>Correct! On <strong>{effectiveLine.equationDisplay}</strong>, when x = {inq2.x}, y = {inq2.y}. Point P2({inq2.x}, {inq2.y}) is pinned on your line.</span>
              </div>
            )}

            {/* Step Footer Navigation */}
            <div className="fs-step-footer-actions between">
              <button className="fs-btn-secondary" onClick={() => setActiveStep(2)}>
                ← Back to Question 2
              </button>
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep(4)}
              >
                Continue to Question 4 →
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* QUESTION 4: THIRD POINT                             */}
        {/* =================================================== */}
        {activeStep === 4 && (
          <div className="fs-step-intro-block">
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">Line Equation:</span>
              <span className="fs-equation-pill-val">{effectiveLine.equationDisplay}</span>
            </div>
            <h3 className="fs-step-heading">
              On your line <span className="fs-equation-highlight">{effectiveLine.equationDisplay}</span>, when <span style={{ color: '#e8864a' }}>x = {inq3.x}</span>, what is the value of <span style={{ color: '#14b8a6' }}>y</span>?
            </h3>
            <p className="fs-step-subtext">
              Find where <strong>x = {inq3.x}</strong> meets your line on the grid, or substitute <strong>x = {inq3.x}</strong> into <strong>{effectiveLine.equationDisplay}</strong>.
            </p>

            <form
              className="fs-inquiry-form"
              onSubmit={(e) => handleCheckPointAnswer(4, inq3, e)}
              style={{ marginTop: '0.85rem' }}
            >
              <span className="fs-inquiry-prefix">y =</span>
              <input
                ref={q4InputRef}
                type="text"
                className="fs-inquiry-input"
                placeholder="?"
                value={answers[4].yVal}
                onChange={(e) => {
                  const val = e.target.value;
                  setAnswers((prev) => ({
                    ...prev,
                    4: { ...prev[4], yVal: val, error: null }
                  }));
                }}
                disabled={answers[4].isCorrect}
              />
              {!answers[4].isCorrect && (
                <button type="submit" className="fs-btn-primary">
                  Check Answer ✓
                </button>
              )}
            </form>

            {answers[4].error && (
              <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                <span>ℹ</span>
                <span>{answers[4].error}</span>
              </div>
            )}

            {answers[4].isCorrect && (
              <div className="fs-inquiry-feedback success" style={{ marginTop: '0.65rem' }}>
                <span>✓</span>
                <span>Correct! On <strong>{effectiveLine.equationDisplay}</strong>, when x = {inq3.x}, y = {inq3.y}. All 3 points are now pinned on your line.</span>
              </div>
            )}

            {/* Step Footer Navigation */}
            <div className="fs-step-footer-actions between">
              <button className="fs-btn-secondary" onClick={() => setActiveStep(3)}>
                ← Back to Question 3
              </button>
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep(5)}
              >
                Continue to Question 5 →
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* QUESTION 5: ROLE OF X (INPUT VS OUTPUT)             */}
        {/* =================================================== */}
        {activeStep === 5 && (
          <div className="fs-step-intro-block">
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">Line Equation:</span>
              <span className="fs-equation-pill-val">{effectiveLine.equationDisplay}</span>
            </div>
            <h3 className="fs-step-heading">
              In your equation <span className="fs-equation-highlight">{effectiveLine.equationDisplay}</span>, what do you think <span style={{ color: '#e8864a' }}>x</span> is acting as?
            </h3>
            <p className="fs-step-subtext">
              Think about how you evaluated each point: you were given a value for <strong>x</strong> first, substituted it into the rule, and calculated <strong>y</strong>.
            </p>

            {/* MCQ Options */}
            <div className="fs-options-grid" style={{ marginTop: '0.85rem' }}>
              {Q5_OPTIONS.map((opt, i) => {
                const isSelected = answers[5]?.selectedId === opt.id;
                const isSubmitted = answers[5]?.isSubmitted;
                let cls = 'fs-option-btn';
                if (isSelected) cls += ' selected';
                if (isSubmitted && isSelected) {
                  cls += opt.isCorrect ? ' correct' : ' incorrect';
                } else if (answers[5]?.isCorrect && opt.isCorrect) {
                  cls += ' correct';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={cls}
                    onClick={() => handleSelectQ5Option(opt.id)}
                    disabled={answers[5]?.isCorrect}
                  >
                    <span className="fs-option-letter">{String.fromCharCode(65 + i)}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{opt.label}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-soft, #a89e94)' }}>{opt.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {answers[5]?.error && (
              <div className="fs-inquiry-feedback error" style={{ marginTop: '0.75rem' }}>
                <span>ℹ</span>
                <span>{answers[5].error}</span>
              </div>
            )}

            {answers[5]?.isCorrect && (
              <div>
                <div className="fs-inquiry-feedback success" style={{ marginTop: '0.75rem' }}>
                  <span>✓</span>
                  <span>Correct! <strong>x</strong> is the <strong>Input</strong> that you feed into the rule.</span>
                </div>

                {/* EARNED INSIGHT CARD */}
                <div className="fs-earns-card" style={{ marginTop: '0.85rem' }}>
                  <div className="fs-earns-badge">✨ Core Intuition Earned</div>
                  <h4 style={{ margin: '0 0 0.35rem 0', color: '#ede8e3', fontSize: '1rem', fontWeight: 800 }}>
                    One Input x ➔ Exactly One Output y
                  </h4>
                  <p className="fs-earns-text" style={{ fontSize: '0.88rem', fontWeight: 500 }}>
                    Notice what happened across all three points: For every single input <strong>x</strong> you chose on your line <strong>{effectiveLine.equationDisplay}</strong>, the rule gave back <strong>exactly one output y</strong>.
                  </p>
                  <p className="fs-earns-sub">
                    A vertical line through any x touches your line at only one place. That unique output is what makes this rule a well-defined function.
                  </p>

                  <table className="fs-summary-table">
                    <thead>
                      <tr>
                        <th>Input (x)</th>
                        <th>Rule: {effectiveLine.equationDisplay}</th>
                        <th>Output (y)</th>
                        <th>Coordinate</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {effectiveLine.inquiries.map((inq, idx) => (
                        <tr key={idx}>
                          <td>x = {inq.x}</td>
                          <td style={{ color: '#a89e94' }}>
                            {effectiveLine.m}({inq.x}) {effectiveLine.c >= 0 ? `+ ${effectiveLine.c}` : `- ${Math.abs(effectiveLine.c)}`}
                          </td>
                          <td style={{ color: '#14b8a6', fontWeight: 700 }}>y = {inq.y}</td>
                          <td style={{ color: '#e8864a' }}>({inq.x}, {inq.y})</td>
                          <td style={{ color: '#34d399', fontWeight: 600 }}>✓ Pinned</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step Footer Navigation */}
            <div className="fs-step-footer-actions between">
              <button className="fs-btn-secondary" onClick={() => setActiveStep(4)}>
                ← Back to Question 4
              </button>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button className="fs-btn-secondary" onClick={handleResetNewJourney}>
                  ✏️ Input Another Line
                </button>
                <button className="fs-btn-primary" onClick={() => setActiveStep(6)}>
                  Continue to Question 6 →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* QUESTION 6: INTRODUCING f(x) FUNCTION NOTATION       */}
        {/* =================================================== */}
        {activeStep === 6 && (
          <div className="fs-step-intro-block">
            {/* Visual Handover & Intuition Container */}
            <div className="fs-handover-box">
              <span className="fs-handover-badge">✨ New Notation Unlocked</span>
              <h3 className="fs-handover-title">
                Writing the Rule to Show <span style={{ color: 'var(--clr-accent, #e8864a)' }}>x</span> as the Input
              </h3>

              {/* Visual Transformation Flow: y = 2x + 1 ➔ f(x) = 2x + 1 */}
              <div className="fs-notation-flow">
                <div className="fs-flow-card">
                  <span className="fs-flow-tag">Line Equation</span>
                  <span className="fs-flow-math">{effectiveLine.equationDisplay}</span>
                  <span className="fs-flow-note">Outputs y from x</span>
                </div>

                <span className="fs-flow-arrow">➔</span>

                <div className="fs-flow-card new">
                  <span className="fs-flow-tag highlight">Function Notation</span>
                  <span className="fs-flow-math highlight">
                    f(x) = {effectiveLine.equationDisplay.replace(/^y\s*=\s*/, '')}
                  </span>
                  <span className="fs-flow-note" style={{ color: 'var(--clr-accent, #e8864a)', fontWeight: 600 }}>
                    Shows x going into rule f
                  </span>
                </div>
              </div>

              {/* Machine Diagram */}
              <div className="fs-machine-diagram">
                <div className="fs-diagram-box input-box">
                  <span className="fs-diagram-label">INPUT</span>
                  <span className="fs-diagram-val">x</span>
                </div>
                <span className="fs-diagram-arrow">──▶</span>
                <div className="fs-diagram-box machine-box">
                  <span className="fs-diagram-label">RULE / MACHINE</span>
                  <span className="fs-diagram-val">
                    f(·) = {effectiveLine.m}(·) {effectiveLine.c >= 0 ? `+ ${effectiveLine.c}` : `- ${Math.abs(effectiveLine.c)}`}
                  </span>
                </div>
                <span className="fs-diagram-arrow">──▶</span>
                <div className="fs-diagram-box output-box">
                  <span className="fs-diagram-label">OUTPUT</span>
                  <span className="fs-diagram-val">f(x)</span>
                </div>
              </div>

              {/* 3 Punchy Points */}
              <div className="fs-handover-points">
                <div className="fs-point-item">
                  <span className="fs-point-bullet">•</span>
                  <span><strong>f</strong> is the name of our rule/machine.</span>
                </div>
                <div className="fs-point-item">
                  <span className="fs-point-bullet">•</span>
                  <span><strong>(x)</strong> shows that <strong>x</strong> is going inside the rule as the input.</span>
                </div>
                <div className="fs-point-item">
                  <span className="fs-point-bullet">•</span>
                  <span><strong>f(x)</strong> is the output produced (pronounced <em>"f of x"</em>). It replaces <strong>y</strong>!</span>
                </div>
              </div>
            </div>

            {/* Step Footer Navigation */}
            <div className="fs-step-footer-actions between" style={{ marginTop: '1.25rem' }}>
              <button className="fs-btn-secondary" onClick={() => setActiveStep(5)}>
                ← Back to Question 5
              </button>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button className="fs-btn-secondary" onClick={handleResetNewJourney}>
                  ✏️ Input Another Line
                </button>
                <button className="fs-btn-primary" onClick={() => setActiveStep(7)}>
                  Continue to Question 7 →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* QUESTION 7: INPUT YOUR FUNCTION f(x) = ...          */}
        {/* =================================================== */}
        {activeStep === 7 && (
          <div className="fs-step-intro-block">
            {activeFunctionLine ? (
              <>
                <div className="fs-equation-pill-bar">
                  <span className="fs-equation-pill-label">Function Notation:</span>
                  <span className="fs-equation-pill-val">{activeFunctionLine.equationDisplay}</span>
                </div>
                <h3 className="fs-step-heading">
                  Your Function: <span className="fs-equation-highlight">{activeFunctionLine.equationDisplay}</span>
                </h3>
                <p className="fs-step-subtext">
                  Your function <strong style={{ color: '#e8864a' }}>{activeFunctionLine.equationDisplay}</strong> is drawn on the canvas. Click Continue to evaluate inputs.
                </p>
              </>
            ) : (
              <>
                <h3 className="fs-step-heading">
                  Enter your function definition using f(x) = notation:
                </h3>
                <p className="fs-step-subtext">
                  Type the complete function starting with <strong>f(x) =</strong> (for example: <code>f(x) = 2x + 3</code> or <code>f(x) = -x + 1</code>):
                </p>
              </>
            )}

            {!activeFunctionLine && (
              <>
                <form className="fs-tray-input-row" onSubmit={handlePlotFunction} style={{ marginTop: '0.85rem' }}>
                  <input
                    ref={q7InputRef}
                    type="text"
                    className="fs-tray-input-box"
                    placeholder="e.g. f(x) = 2x + 3 or f(x) = -x + 1"
                    value={functionEquationInput}
                    onChange={(e) => {
                      setFunctionEquationInput(e.target.value);
                      if (functionError) setFunctionError(null);
                    }}
                  />
                  <button type="submit" className="fs-tray-submit-btn">
                    Plot Function 🚀
                  </button>
                </form>

                {functionError && (
                  <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                    <span>ℹ</span>
                    <span>{functionError}</span>
                  </div>
                )}
              </>
            )}

            {/* Step Footer Navigation */}
            <div className="fs-step-footer-actions between">
              <button className="fs-btn-secondary" onClick={() => setActiveStep(6)}>
                ← Back to Question 6
              </button>
              <button
                className="fs-btn-primary"
                disabled={!activeFunctionLine}
                onClick={() => setActiveStep(8)}
              >
                Continue to Question 8 →
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* =================================================== */}
        {/* QUESTION 8: EVALUATE f(2) AND f(4)                  */}
        {/* =================================================== */}
        {activeStep === 8 && (
          <div className="fs-step-intro-block">
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">Active Function:</span>
              <span className="fs-equation-pill-val">{currentLineLabel}</span>
            </div>

            {/* Dynamic Step Heading & Subtext */}
            {!answers[8]?.is2Correct && (
              <>
                <h3 className="fs-step-heading">
                  Call your function with <span className="fs-equation-highlight">x = 2</span>
                </h3>
                <p className="fs-step-subtext">
                  In GeoGebra, type <code>f(2)</code> to evaluate the output for input <strong>x = 2</strong>:
                </p>
              </>
            )}

            {answers[8]?.is2Correct && !answers[8]?.is4Correct && (
              <>
                <h3 className="fs-step-heading">
                  Call your function with <span className="fs-equation-highlight">x = 4</span>
                </h3>
                <p className="fs-step-subtext">
                  Now type <code>f(4)</code> to evaluate the output for input <strong>x = 4</strong>:
                </p>
              </>
            )}

            {answers[8]?.is4Correct && (
              <>
                <h3 className="fs-step-heading">
                  Function Evaluation Complete 🎉
                </h3>
                <p className="fs-step-subtext">
                  You evaluated both <strong>f(2)</strong> and <strong>f(4)</strong> on your function.
                </p>
              </>
            )}

            {/* GeoGebra Algebra View Output Panel */}
            <div className="fs-ggb-algebra-panel" style={{ marginTop: '0.85rem' }}>
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
                    <span className="fs-ggb-algebra-expr">{currentLineLabel}</span>
                    <span className="fs-ggb-algebra-dots">⋮</span>
                  </div>
                </div>
              </div>

              {/* f(2) evaluation entry (visible once f(2) is given) */}
              {answers[8]?.is2Correct && (
                <div className="fs-ggb-algebra-item">
                  <div className="fs-ggb-gutter">
                    <div className="fs-ggb-vis-circle" />
                  </div>
                  <div className="fs-ggb-algebra-body">
                    <div className="fs-ggb-algebra-row">
                      <span className="fs-ggb-algebra-expr">f(2)</span>
                      <span className="fs-ggb-algebra-dots">⋮</span>
                    </div>
                    <div className="fs-ggb-algebra-result">
                      <span className="eq">=</span>
                      <span className="val">{currentDisplayLine?.eval2}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* f(4) evaluation entry (visible once f(4) is given) */}
              {answers[8]?.is4Correct && (
                <div className="fs-ggb-algebra-item">
                  <div className="fs-ggb-gutter">
                    <div className="fs-ggb-vis-circle" />
                  </div>
                  <div className="fs-ggb-algebra-body">
                    <div className="fs-ggb-algebra-row">
                      <span className="fs-ggb-algebra-expr">f(4)</span>
                      <span className="fs-ggb-algebra-dots">⋮</span>
                    </div>
                    <div className="fs-ggb-algebra-result">
                      <span className="eq">=</span>
                      <span className="val">{currentDisplayLine?.eval4}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Inquiry 1: f(2) */}
            {!answers[8]?.is2Correct && (
              <div style={{ marginTop: '0.85rem' }}>
                <form className="fs-tray-input-row" onSubmit={handleCheckQ8Val2}>
                  <input
                    ref={q8Val2Ref}
                    type="text"
                    className="fs-tray-input-box"
                    placeholder="e.g. f(...)"
                    value={answers[8]?.val2 || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        8: { ...prev[8], val2: e.target.value, error: null }
                      }))
                    }
                  />
                  <button type="submit" className="fs-tray-submit-btn">
                    Evaluate f(2) ➔
                  </button>
                </form>

                {answers[8]?.error && !answers[8]?.is2Correct && (
                  <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                    <span>ℹ</span>
                    <span>{answers[8].error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Inquiry 2: f(4) (Only shown once f(2) is correct) */}
            {answers[8]?.is2Correct && !answers[8]?.is4Correct && (
              <div style={{ marginTop: '0.85rem' }}>
                <div className="fs-inquiry-feedback success" style={{ marginBottom: '0.75rem' }}>
                  <span>✓</span>
                  <span>Point (2, {currentDisplayLine?.eval2}) is pinned on the grid!</span>
                </div>

                <form className="fs-tray-input-row" onSubmit={handleCheckQ8Val4}>
                  <input
                    ref={q8Val4Ref}
                    type="text"
                    className="fs-tray-input-box"
                    placeholder="e.g. f(...)"
                    value={answers[8]?.val4 || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        8: { ...prev[8], val4: e.target.value, error: null }
                      }))
                    }
                  />
                  <button type="submit" className="fs-tray-submit-btn">
                    Evaluate f(4) ➔
                  </button>
                </form>

                {answers[8]?.error && (
                  <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                    <span>ℹ</span>
                    <span>{answers[8].error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Complete Card when both f(2) and f(4) are correct */}
            {answers[8]?.is4Correct && (
              <div style={{ marginTop: '0.85rem' }}>
                <div className="fs-inquiry-feedback success">
                  <span>✓</span>
                  <span>Fantastic! GeoGebra evaluated <strong>f(2) = {currentDisplayLine?.eval2}</strong> and <strong>f(4) = {currentDisplayLine?.eval4}</strong>!</span>
                </div>

                <div className="fs-earns-card" style={{ marginTop: '0.85rem' }}>
                  <div className="fs-earns-badge">🎉 Function Evaluation Complete!</div>
                  <h4 style={{ margin: '0 0 0.35rem 0', color: '#ede8e3', fontSize: '1rem', fontWeight: 800 }}>
                    {currentLineLabel}
                  </h4>

                  <table className="fs-summary-table" style={{ marginTop: '0.5rem' }}>
                    <thead>
                      <tr>
                        <th>Input (x)</th>
                        <th>Function Call</th>
                        <th>Rule Computation</th>
                        <th>Output Value</th>
                        <th>Grid Coordinate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>x = 2</td>
                        <td style={{ color: 'var(--clr-accent, #e8864a)', fontWeight: 700 }}>f(2)</td>
                        <td style={{ color: '#a89e94' }}>{currentDisplayLine?.m}(2) {currentDisplayLine?.c >= 0 ? `+ ${currentDisplayLine?.c}` : `- ${Math.abs(currentDisplayLine?.c)}`}</td>
                        <td style={{ color: '#14b8a6', fontWeight: 700 }}>{currentDisplayLine?.eval2}</td>
                        <td style={{ color: '#e8864a' }}>(2, {currentDisplayLine?.eval2})</td>
                      </tr>
                      <tr>
                        <td>x = 4</td>
                        <td style={{ color: 'var(--clr-accent, #e8864a)', fontWeight: 700 }}>f(4)</td>
                        <td style={{ color: '#a89e94' }}>{currentDisplayLine?.m}(4) {currentDisplayLine?.c >= 0 ? `+ ${currentDisplayLine?.c}` : `- ${Math.abs(currentDisplayLine?.c)}`}</td>
                        <td style={{ color: '#14b8a6', fontWeight: 700 }}>{currentDisplayLine?.eval4}</td>
                        <td style={{ color: '#e8864a' }}>(4, {currentDisplayLine?.eval4})</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step Footer Navigation */}
            <div className="fs-step-footer-actions between" style={{ marginTop: '1.25rem' }}>
              <button className="fs-btn-secondary" onClick={() => setActiveStep(7)}>
                ← Back to Question 7
              </button>
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep('obs-8')}
                disabled={!answers[8]?.is4Correct}
              >
                Continue to Observation →
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* IN-BETWEEN OBSERVATION: f: ℝ → ℝ                   */}
        {/* =================================================== */}
        {activeStep === 'obs-8' && (
          <div className="fs-step-intro-block">
            <div className="fs-handover-box" style={{ textAlign: 'center', padding: '1.75rem 1.5rem' }}>
              <span className="fs-handover-badge">🔍 Key Observation</span>
              <h3 style={{ margin: '0.85rem 0 1rem', fontSize: '1.25rem', color: '#f3efe6', fontWeight: 700, lineHeight: 1.4 }}>
                Have you observed you are giving input from <span style={{ color: 'var(--clr-accent, #e8864a)' }}>set ℝ</span> and output is also from <span style={{ color: '#14b8a6' }}>set ℝ</span>?
              </h3>

              <div style={{ margin: '1.25rem auto', padding: '1rem 1.5rem', background: 'rgba(232, 134, 74, 0.08)', border: '1px solid rgba(232, 134, 74, 0.25)', borderRadius: '12px', display: 'inline-block' }}>
                <p style={{ margin: '0 0 0.5rem', color: '#a89e94', fontSize: '0.92rem' }}>
                  This input output relation can be written as:
                </p>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--clr-accent, #e8864a)', letterSpacing: '0.05em' }}>
                  f: ℝ → ℝ
                </div>
              </div>
            </div>

            {/* Step Footer Navigation */}
            <div className="fs-step-footer-actions between" style={{ marginTop: '1.25rem' }}>
              <button className="fs-btn-secondary" onClick={() => setActiveStep(8)}>
                ← Back to Question 8
              </button>
              <button className="fs-btn-primary" onClick={() => setActiveStep(9)}>
                Continue to Question 9 →
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* QUESTION 9: EVALUATE g(x, y) = 2x + 3y              */}
        {/* =================================================== */}
        {activeStep === 9 && (
          <div className="fs-step-intro-block">
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">Active Rule:</span>
              <span className="fs-equation-pill-val">g(x, y) = 2x + 3y</span>
            </div>

            {/* Dynamic Step Heading & Subtext */}
            {!answers[9]?.is1Correct && (
              <>
                <h3 className="fs-step-heading">
                  Call your function with <span className="fs-equation-highlight">(x, y) = (2, 3)</span>
                </h3>
                <p className="fs-step-subtext">
                  Type <code>g(2, 3)</code> to evaluate the output for input pair <strong>(x, y) = (2, 3)</strong>:
                </p>
              </>
            )}

            {answers[9]?.is1Correct && !answers[9]?.is2Correct && (
              <>
                <h3 className="fs-step-heading">
                  Call your function with <span className="fs-equation-highlight">(x, y) = (3, 4)</span>
                </h3>
                <p className="fs-step-subtext">
                  Now type <code>g(3, 4)</code> to evaluate the output for input pair <strong>(x, y) = (3, 4)</strong>:
                </p>
              </>
            )}

            {answers[9]?.is2Correct && (
              <>
                <h3 className="fs-step-heading">
                  Function Evaluation Complete 🎉
                </h3>
                <p className="fs-step-subtext">
                  You evaluated <strong>g(2, 3) = 13</strong> and <strong>g(3, 4) = 18</strong> for the 2D rule.
                </p>
              </>
            )}

            {/* Interactive evaluation panel in Question 8 fashion */}
            <div className="fs-ggb-algebra-panel" style={{ marginTop: '0.85rem' }}>
              <span className="fs-ggb-algebra-title">Algebra (Functions)</span>
              <div className="fs-ggb-algebra-item">
                <div className="fs-ggb-gutter">
                  <div className="fs-ggb-vis-circle line" />
                </div>
                <div className="fs-ggb-algebra-body">
                  <div className="fs-ggb-algebra-row">
                    <span className="fs-ggb-algebra-expr">g(x, y) = 2x + 3y</span>
                    <span className="fs-ggb-algebra-dots">⋮</span>
                  </div>
                </div>
              </div>

              {/* g(2, 3) evaluation entry (visible once g(2, 3) is evaluated) */}
              {answers[9]?.is1Correct && (
                <div className="fs-ggb-algebra-item">
                  <div className="fs-ggb-gutter">
                    <div className="fs-ggb-vis-circle" />
                  </div>
                  <div className="fs-ggb-algebra-body">
                    <div className="fs-ggb-algebra-row">
                      <span className="fs-ggb-algebra-expr">g(2, 3)</span>
                      <span className="fs-ggb-algebra-dots">⋮</span>
                    </div>
                    <div className="fs-ggb-algebra-result">
                      <span className="eq">=</span>
                      <span className="val">13</span>
                    </div>
                  </div>
                </div>
              )}

              {/* g(3, 4) evaluation entry (visible once g(3, 4) is evaluated) */}
              {answers[9]?.is2Correct && (
                <div className="fs-ggb-algebra-item">
                  <div className="fs-ggb-gutter">
                    <div className="fs-ggb-vis-circle" />
                  </div>
                  <div className="fs-ggb-algebra-body">
                    <div className="fs-ggb-algebra-row">
                      <span className="fs-ggb-algebra-expr">g(3, 4)</span>
                      <span className="fs-ggb-algebra-dots">⋮</span>
                    </div>
                    <div className="fs-ggb-algebra-result">
                      <span className="eq">=</span>
                      <span className="val">18</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Inquiry 1: g(2, 3) */}
            {!answers[9]?.is1Correct && (
              <div style={{ marginTop: '0.85rem' }}>
                <form className="fs-tray-input-row" onSubmit={handleCheckQ9Val1}>
                  <input
                    ref={q9Val1Ref}
                    type="text"
                    className="fs-tray-input-box"
                    placeholder="e.g. g(...)"
                    value={answers[9]?.val1 || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        9: { ...prev[9], val1: e.target.value, error: null }
                      }))
                    }
                  />
                  <button type="submit" className="fs-tray-submit-btn">
                    Evaluate g(2, 3) ➔
                  </button>
                </form>

                {answers[9]?.error && !answers[9]?.is1Correct && (
                  <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                    <span>ℹ</span>
                    <span>{answers[9].error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Inquiry 2: g(3, 4) (Only shown once g(2, 3) is correct) */}
            {answers[9]?.is1Correct && !answers[9]?.is2Correct && (
              <div style={{ marginTop: '0.85rem' }}>
                <div className="fs-inquiry-feedback success" style={{ marginBottom: '0.75rem' }}>
                  <span>✓</span>
                  <span>Point (2, 3) output evaluated: <strong>g(2, 3) = 2(2) + 3(3) = 13</strong>!</span>
                </div>

                <form className="fs-tray-input-row" onSubmit={handleCheckQ9Val2}>
                  <input
                    ref={q9Val2Ref}
                    type="text"
                    className="fs-tray-input-box"
                    placeholder="e.g. g(...)"
                    value={answers[9]?.val2 || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        9: { ...prev[9], val2: e.target.value, error: null }
                      }))
                    }
                  />
                  <button type="submit" className="fs-tray-submit-btn">
                    Evaluate g(3, 4) ➔
                  </button>
                </form>

                {answers[9]?.error && (
                  <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                    <span>ℹ</span>
                    <span>{answers[9].error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Complete Card when both g(2, 3) and g(3, 4) are correct */}
            {answers[9]?.is2Correct && (
              <div style={{ marginTop: '0.85rem' }}>
                <div className="fs-inquiry-feedback success">
                  <span>✓</span>
                  <span>Fantastic! Evaluated <strong>g(2, 3) = 13</strong> and <strong>g(3, 4) = 18</strong>!</span>
                </div>

                <div className="fs-earns-card" style={{ marginTop: '0.85rem' }}>
                  <div className="fs-earns-badge">🎉 Function Evaluation Complete!</div>
                  <h4 style={{ margin: '0 0 0.35rem 0', color: '#ede8e3', fontSize: '1rem', fontWeight: 800 }}>
                    g(x, y) = 2x + 3y
                  </h4>

                  <table className="fs-summary-table" style={{ marginTop: '0.5rem' }}>
                    <thead>
                      <tr>
                        <th>Input (x, y)</th>
                        <th>Function Call</th>
                        <th>Rule Computation</th>
                        <th>Output Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ color: '#e8864a' }}>(2, 3)</td>
                        <td style={{ color: 'var(--clr-accent, #e8864a)', fontWeight: 700 }}>g(2, 3)</td>
                        <td style={{ color: '#a89e94' }}>2(2) + 3(3) = 4 + 9</td>
                        <td style={{ color: '#14b8a6', fontWeight: 700 }}>13</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#e8864a' }}>(3, 4)</td>
                        <td style={{ color: 'var(--clr-accent, #e8864a)', fontWeight: 700 }}>g(3, 4)</td>
                        <td style={{ color: '#a89e94' }}>2(3) + 3(4) = 6 + 12</td>
                        <td style={{ color: '#14b8a6', fontWeight: 700 }}>18</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#e8864a' }}>(2.44, 4.33)</td>
                        <td style={{ color: 'var(--clr-accent, #e8864a)', fontWeight: 700 }}>g(2.44, 4.33)</td>
                        <td style={{ color: '#a89e94' }}>2(2.44) + 3(4.33) = 4.88 + 12.99</td>
                        <td style={{ color: '#14b8a6', fontWeight: 700 }}>17.87</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step Footer Navigation */}
            <div className="fs-step-footer-actions between" style={{ marginTop: '1.25rem' }}>
              <button className="fs-btn-secondary" onClick={() => setActiveStep('obs-8')}>
                ← Back to Observation
              </button>
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep('obs-9')}
                disabled={!answers[9]?.is2Correct}
              >
                Continue to Observation →
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* IN-BETWEEN OBSERVATION: g: ℝ² → ℝ                  */}
        {/* =================================================== */}
        {activeStep === 'obs-9' && (
          <div className="fs-step-intro-block">
            <div className="fs-handover-box" style={{ textAlign: 'center', padding: '1.75rem 1.5rem' }}>
              <span className="fs-handover-badge">🔍 Key Observation</span>
              <h3 style={{ margin: '0.85rem 0 1rem', fontSize: '1.25rem', color: '#f3efe6', fontWeight: 700, lineHeight: 1.4 }}>
                Have you observed you are giving input from <span style={{ color: 'var(--clr-accent, #e8864a)' }}>set ℝ²</span> and output is from <span style={{ color: '#14b8a6' }}>set ℝ</span>?
              </h3>

              <div className="fs-machine-diagram" style={{ margin: '1rem auto 1.25rem', maxWidth: '520px' }}>
                <div className="fs-diagram-box input-box">
                  <span className="fs-diagram-label">INPUT PAIR</span>
                  <span className="fs-diagram-val">(x, y) ∈ ℝ²</span>
                </div>
                <span className="fs-diagram-arrow">──▶</span>
                <div className="fs-diagram-box machine-box">
                  <span className="fs-diagram-label">RULE</span>
                  <span className="fs-diagram-val">2x + 3y</span>
                </div>
                <span className="fs-diagram-arrow">──▶</span>
                <div className="fs-diagram-box output-box">
                  <span className="fs-diagram-label">SINGLE OUTPUT</span>
                  <span className="fs-diagram-val">g(x, y) ∈ ℝ</span>
                </div>
              </div>

              <div style={{ margin: '0.5rem auto 0', padding: '1rem 1.5rem', background: 'rgba(232, 134, 74, 0.08)', border: '1px solid rgba(232, 134, 74, 0.25)', borderRadius: '12px', display: 'inline-block' }}>
                <p style={{ margin: '0 0 0.5rem', color: '#a89e94', fontSize: '0.92rem' }}>
                  This input output relation can be written as:
                </p>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--clr-accent, #e8864a)', letterSpacing: '0.05em' }}>
                  g: ℝ² → ℝ
                </div>
              </div>
            </div>

            {/* Step Footer Navigation */}
            <div className="fs-step-footer-actions between" style={{ marginTop: '1.25rem' }}>
              <button className="fs-btn-secondary" onClick={() => setActiveStep(9)}>
                ← Back to Question 9
              </button>
              <button className="fs-btn-primary" onClick={() => setActiveStep(10)}>
                Continue to Question 10 →
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* QUESTION 10: THINK: ℝ² → ℝ² FUNCTION                */}
        {/* =================================================== */}
        {activeStep === 10 && (
          <div className="fs-step-intro-block">
            <h3 className="fs-step-heading">
              Think of a Linear Function: <span className="fs-equation-highlight">ℝ² ➔ ℝ²</span>
            </h3>
            <p className="fs-step-subtext">
              Now, can you think of a <strong>linear function</strong> that takes input from <strong>set ℝ²</strong> and gives output from <strong>set ℝ²</strong> as well?
            </p>

            <div className="fs-tray-card" style={{ marginTop: '1rem', padding: '1.25rem' }}>
              <form onSubmit={handleCheckQ10}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f3efe6' }}>h(x, y) = (</span>
                  <input
                    ref={q10InputRef}
                    type="text"
                    className="fs-tray-input-box"
                    placeholder="Component 1 (e.g. 2x + 3y)"
                    style={{ maxWidth: '200px', textAlign: 'center' }}
                    value={answers[10]?.val1 || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        10: { ...prev[10], val1: e.target.value, isCorrect: false, error: null }
                      }))
                    }
                  />
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f3efe6' }}>,</span>
                  <input
                    type="text"
                    className="fs-tray-input-box"
                    placeholder="Component 2 (e.g. 4x + 5y)"
                    style={{ maxWidth: '200px', textAlign: 'center' }}
                    value={answers[10]?.val2 || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        10: { ...prev[10], val2: e.target.value, isCorrect: false, error: null }
                      }))
                    }
                  />
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f3efe6' }}>)</span>
                  <button type="submit" className="fs-tray-submit-btn">
                    Set Function ➔
                  </button>
                </div>
              </form>

              {/* Quick Suggestion Button */}
              <div style={{ textAlign: 'center', marginTop: '0.85rem' }}>
                <button
                  type="button"
                  className="fs-btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.35rem 0.85rem' }}
                  onClick={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      10: { ...prev[10], val1: '2x + 3y', val2: '4x + 5y', error: null }
                    }))
                  }
                >
                  💡 Example: h(x, y) = (2x + 3y, 4x + 5y)
                </button>
              </div>

              {answers[10]?.error && (
                <div className="fs-inquiry-feedback error" style={{ marginTop: '0.85rem' }}>
                  <span>ℹ</span>
                  <span>{answers[10].error}</span>
                </div>
              )}
            </div>

            {answers[10]?.isCorrect && (
              <div style={{ marginTop: '1rem' }}>
                <div className="fs-inquiry-feedback success">
                  <span>✓</span>
                  <span>
                    Great linear rule! <strong>h(x, y) = ({answers[10].val1}, {answers[10].val2})</strong> maps every pair (x, y) ∈ ℝ² to an output pair (u, v) ∈ ℝ² linearly.
                  </span>
                </div>

                <div className="fs-machine-diagram" style={{ margin: '1rem auto', maxWidth: '520px' }}>
                  <div className="fs-diagram-box input-box">
                    <span className="fs-diagram-label">INPUT (2D)</span>
                    <span className="fs-diagram-val">(x, y) ∈ ℝ²</span>
                  </div>
                  <span className="fs-diagram-arrow">──▶</span>
                  <div className="fs-diagram-box machine-box">
                    <span className="fs-diagram-label">FUNCTION RULE</span>
                    <span className="fs-diagram-val">({answers[10].val1}, {answers[10].val2})</span>
                  </div>
                  <span className="fs-diagram-arrow">──▶</span>
                  <div className="fs-diagram-box output-box">
                    <span className="fs-diagram-label">OUTPUT (2D)</span>
                    <span className="fs-diagram-val">(u, v) ∈ ℝ²</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step Footer Navigation */}
            <div className="fs-step-footer-actions between" style={{ marginTop: '1.25rem' }}>
              <button className="fs-btn-secondary" onClick={() => setActiveStep('obs-9')}>
                ← Back to Observation
              </button>
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep(11)}
                disabled={!answers[10]?.isCorrect}
              >
                Continue to Question 11 →
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* QUESTION 11: EVALUATE h(x, y)                       */}
        {/* =================================================== */}
        {activeStep === 11 && (
          <div className="fs-step-intro-block">
            <div className="fs-equation-pill-bar">
              <span className="fs-equation-pill-label">Active Function:</span>
              <span className="fs-equation-pill-val">h(x, y) = (2x+3y, 4x+5y)</span>
            </div>

            {/* Dynamic Step Heading & Subtext */}
            {!answers[11]?.is1Correct && (
              <>
                <h3 className="fs-step-heading">
                  Calculate output for input <span className="fs-equation-highlight">(x, y) = (2, 3)</span>
                </h3>
                <p className="fs-step-subtext">
                  Evaluate <strong>h(2, 3)</strong>: substitute <strong>x = 2</strong> and <strong>y = 3</strong> into <code>(2x+3y, 4x+5y)</code>:
                </p>
              </>
            )}

            {answers[11]?.is1Correct && !answers[11]?.is2Correct && (
              <>
                <h3 className="fs-step-heading">
                  Next, calculate output for input <span className="fs-equation-highlight">(x, y) = (4, 5)</span>
                </h3>
                <p className="fs-step-subtext">
                  Evaluate <strong>h(4, 5)</strong>: substitute <strong>x = 4</strong> and <strong>y = 5</strong> into <code>(2x+3y, 4x+5y)</code>:
                </p>
              </>
            )}

            {answers[11]?.isCorrect && (
              <>
                <h3 className="fs-step-heading">
                  Vector Evaluation Complete 🎉
                </h3>
                <p className="fs-step-subtext">
                  You evaluated outputs for both input vectors <strong>(2, 3)</strong> and <strong>(4, 5)</strong>.
                </p>
              </>
            )}

            {/* Interactive evaluation panel in Question 8 & 9 fashion */}
            <div className="fs-ggb-algebra-panel" style={{ marginTop: '0.85rem' }}>
              <span className="fs-ggb-algebra-title">Vector Evaluation</span>
              <div className="fs-ggb-algebra-item">
                <div className="fs-ggb-gutter">
                  <div className="fs-ggb-vis-circle line" />
                </div>
                <div className="fs-ggb-algebra-body">
                  <div className="fs-ggb-algebra-row">
                    <span className="fs-ggb-algebra-expr">h(x, y) = (2x + 3y, 4x + 5y)</span>
                    <span className="fs-ggb-algebra-dots">⋮</span>
                  </div>
                </div>
              </div>

              {/* h(2, 3) evaluation entry */}
              {answers[11]?.is1Correct && (
                <div className="fs-ggb-algebra-item">
                  <div className="fs-ggb-gutter">
                    <div className="fs-ggb-vis-circle" />
                  </div>
                  <div className="fs-ggb-algebra-body">
                    <div className="fs-ggb-algebra-row">
                      <span className="fs-ggb-algebra-expr">h(2, 3)</span>
                      <span className="fs-ggb-algebra-dots">⋮</span>
                    </div>
                    <div className="fs-ggb-algebra-result">
                      <span className="eq">=</span>
                      <span className="val">(13, 23)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* h(4, 5) evaluation entry */}
              {answers[11]?.is2Correct && (
                <div className="fs-ggb-algebra-item">
                  <div className="fs-ggb-gutter">
                    <div className="fs-ggb-vis-circle" />
                  </div>
                  <div className="fs-ggb-algebra-body">
                    <div className="fs-ggb-algebra-row">
                      <span className="fs-ggb-algebra-expr">h(4, 5)</span>
                      <span className="fs-ggb-algebra-dots">⋮</span>
                    </div>
                    <div className="fs-ggb-algebra-result">
                      <span className="eq">=</span>
                      <span className="val">(23, 41)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Inquiry 1: h(2, 3) */}
            {!answers[11]?.is1Correct && (
              <div style={{ marginTop: '0.85rem' }}>
                <form
                  className="fs-tray-input-row"
                  onSubmit={handleCheckQ11Val1}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}
                >
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--clr-accent, #e8864a)', whiteSpace: 'nowrap' }}>
                    h(2, 3) =
                  </span>
                  <span style={{ fontSize: '1.2rem', color: '#a89e94' }}>(</span>
                  <input
                    ref={q11Input1XRef}
                    type="text"
                    className="fs-tray-input-box"
                    placeholder="2(2) + 3(3)"
                    style={{ maxWidth: '120px', textAlign: 'center' }}
                    value={answers[11]?.val1X || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        11: { ...prev[11], val1X: e.target.value, error: null }
                      }))
                    }
                  />
                  <span style={{ fontSize: '1.2rem', color: '#a89e94' }}>,</span>
                  <input
                    type="text"
                    className="fs-tray-input-box"
                    placeholder="4(2) + 5(3)"
                    style={{ maxWidth: '120px', textAlign: 'center' }}
                    value={answers[11]?.val1Y || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        11: { ...prev[11], val1Y: e.target.value, error: null }
                      }))
                    }
                  />
                  <span style={{ fontSize: '1.2rem', color: '#a89e94' }}>)</span>
                  <button type="submit" className="fs-tray-submit-btn">
                    Check Output ➔
                  </button>
                </form>

                {answers[11]?.error && !answers[11]?.is1Correct && (
                  <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                    <span>ℹ</span>
                    <span>{answers[11].error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Inquiry 2: h(4, 5) (Shown once h(2, 3) is correct) */}
            {answers[11]?.is1Correct && !answers[11]?.is2Correct && (
              <div style={{ marginTop: '0.85rem' }}>
                <div className="fs-inquiry-feedback success" style={{ marginBottom: '0.75rem' }}>
                  <span>✓</span>
                  <span>Vector (2, 3) evaluated: <strong>h(2, 3) = (13, 23)</strong>!</span>
                </div>

                <form
                  className="fs-tray-input-row"
                  onSubmit={handleCheckQ11Val2}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}
                >
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--clr-accent, #e8864a)', whiteSpace: 'nowrap' }}>
                    h(4, 5) =
                  </span>
                  <span style={{ fontSize: '1.2rem', color: '#a89e94' }}>(</span>
                  <input
                    ref={q11Input2XRef}
                    type="text"
                    className="fs-tray-input-box"
                    placeholder="2(4) + 3(5)"
                    style={{ maxWidth: '120px', textAlign: 'center' }}
                    value={answers[11]?.val2X || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        11: { ...prev[11], val2X: e.target.value, error: null }
                      }))
                    }
                  />
                  <span style={{ fontSize: '1.2rem', color: '#a89e94' }}>,</span>
                  <input
                    type="text"
                    className="fs-tray-input-box"
                    placeholder="4(4) + 5(5)"
                    style={{ maxWidth: '120px', textAlign: 'center' }}
                    value={answers[11]?.val2Y || ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        11: { ...prev[11], val2Y: e.target.value, error: null }
                      }))
                    }
                  />
                  <span style={{ fontSize: '1.2rem', color: '#a89e94' }}>)</span>
                  <button type="submit" className="fs-tray-submit-btn">
                    Check Output ➔
                  </button>
                </form>

                {answers[11]?.error && !answers[11]?.is2Correct && (
                  <div className="fs-inquiry-feedback error" style={{ marginTop: '0.65rem' }}>
                    <span>ℹ</span>
                    <span>{answers[11].error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Complete Card when both vector inputs are correct */}
            {answers[11]?.isCorrect && (
              <div style={{ marginTop: '0.85rem' }}>
                <div className="fs-inquiry-feedback success">
                  <span>✓</span>
                  <span>Fantastic! Evaluated <strong>h(2, 3) = (13, 23)</strong> and <strong>h(4, 5) = (23, 41)</strong>!</span>
                </div>

                <div className="fs-earns-card" style={{ marginTop: '0.85rem' }}>
                  <div className="fs-earns-badge">🎉 Vector Evaluation Complete!</div>
                  <h4 style={{ margin: '0 0 0.35rem 0', color: '#ede8e3', fontSize: '1rem', fontWeight: 800 }}>
                    h(x, y) = (2x + 3y, 4x + 5y)
                  </h4>

                  <table className="fs-summary-table" style={{ marginTop: '0.5rem' }}>
                    <thead>
                      <tr>
                        <th>Input (x, y)</th>
                        <th>Component Calculations</th>
                        <th>Output (u, v)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ color: '#e8864a' }}>(2, 3)</td>
                        <td style={{ color: '#a89e94' }}>(2(2)+3(3), 4(2)+5(3))</td>
                        <td style={{ color: '#14b8a6', fontWeight: 700 }}>(13, 23)</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#e8864a' }}>(4, 5)</td>
                        <td style={{ color: '#a89e94' }}>(2(4)+3(5), 4(4)+5(5))</td>
                        <td style={{ color: '#14b8a6', fontWeight: 700 }}>(23, 41)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step Footer Navigation */}
            <div className="fs-step-footer-actions between" style={{ marginTop: '1.25rem' }}>
              <button className="fs-btn-secondary" onClick={() => setActiveStep(10)}>
                ← Back to Question 10
              </button>
              <button
                className="fs-btn-primary"
                onClick={() => setActiveStep('summary')}
                disabled={!answers[11]?.isCorrect}
              >
                Continue to Discovery →
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* DISCOVERY: RELATION h: ℝ² → ℝ²                     */}
        {/* =================================================== */}
        {activeStep === 'summary' && (
          <div className="fs-step-intro-block">
            <div className="fs-handover-box" style={{ textAlign: 'center', padding: '1.75rem 1.5rem' }}>
              <span className="fs-handover-badge">🎯 Core Discovery</span>
              <h3 style={{ margin: '0.85rem 0 1.25rem', fontSize: '1.25rem', color: '#f3efe6', fontWeight: 700, lineHeight: 1.4 }}>
                This is a function which takes input as <span style={{ color: 'var(--clr-accent, #e8864a)' }}>ℝ²</span> and gives output as <span style={{ color: '#14b8a6' }}>ℝ²</span>, so we can define it as:
              </h3>

              <div style={{ margin: '1rem auto', padding: '1.25rem 2rem', background: 'rgba(232, 134, 74, 0.08)', border: '1px solid rgba(232, 134, 74, 0.25)', borderRadius: '12px', display: 'inline-block' }}>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--clr-accent, #e8864a)', letterSpacing: '0.05em' }}>
                  h: ℝ² → ℝ²
                </div>
              </div>

              {/* Dimensional Comparison Grid */}
              <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', textAlign: 'left' }}>
                <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#a89e94', fontWeight: 700 }}>1D ➔ 1D</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f3efe6', margin: '0.2rem 0' }}>f: ℝ → ℝ</div>
                  <div style={{ fontSize: '0.78rem', color: '#a89e94' }}>f(x) = mx + c</div>
                </div>
                <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#a89e94', fontWeight: 700 }}>2D ➔ 1D</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f3efe6', margin: '0.2rem 0' }}>g: ℝ² → ℝ</div>
                  <div style={{ fontSize: '0.78rem', color: '#a89e94' }}>g(x, y) = 2x + 3y</div>
                </div>
                <div style={{ padding: '0.85rem', background: 'rgba(232, 134, 74, 0.1)', border: '1px solid rgba(232, 134, 74, 0.3)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--clr-accent, #e8864a)', fontWeight: 700 }}>2D ➔ 2D</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--clr-accent, #e8864a)', margin: '0.2rem 0' }}>h: ℝ² → ℝ²</div>
                  <div style={{ fontSize: '0.78rem', color: '#a89e94' }}>h(x, y) = (2x+3y, 4x+5y)</div>
                </div>
              </div>
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
                <span>🚀 Advancing to <strong>Inverse Studio (Stage 5)</strong> in <strong>{autoAdvanceTimer}s</strong>...</span>
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

            {/* Step Footer Navigation */}
            <div className="fs-step-footer-actions between" style={{ marginTop: '1.25rem' }}>
              <button className="fs-btn-secondary" onClick={() => setActiveStep(11)}>
                ← Back to Question 11
              </button>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button className="fs-btn-secondary" onClick={handleResetNewJourney}>
                  ✏️ Try Another Function
                </button>
                {onBack && (
                  <button className="fs-btn-secondary" onClick={onBack}>
                    Dashboard 🏠
                  </button>
                )}
                {onNext && (
                  <button className="fs-btn-primary" onClick={onNext}>
                    Proceed to Inverse Studio (Stage 5) 🔄 ➔
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
