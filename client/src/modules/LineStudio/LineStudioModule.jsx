import React, { useState, useEffect } from 'react';
import {
  PATH_META,
  PHASES,
  LINE_PATH_QUESTIONS,
  CLUSTER_2_SUMMARY
} from './questions';
import GeoGebraLineLab from './GeoGebraLineLab';
import { evaluateAnswer, evaluateEquationAnswer } from './answerEvaluator';
import './LineStudioModule.css';

// Fisher-Yates shuffle helper
function shuffleArray(arr) {
  if (!arr || !Array.isArray(arr)) return [];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function initShuffledOptions() {
  const result = {};
  LINE_PATH_QUESTIONS.forEach((q) => {
    if (q.options) {
      result[q.id] = shuffleArray(q.options);
    }
  });
  return result;
}

export default function LineStudioModule({ onBack, onNext }) {
  // activeStep: 1..6 are Questions 1..6; 7 is Graduation / Free Play
  const [activeStep, setActiveStep] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);

  // GeoGebra Sliders State
  const [sliderA, setSliderA] = useState(2);
  const [sliderB, setSliderB] = useState(0);

  // GeoGebra Points State
  const [plottedPoints, setPlottedPoints] = useState([]);

  // Free Play interaction tracking
  const [freePlayInteracted, setFreePlayInteracted] = useState(false);

  // Shuffled options map for all MCQ questions (e.g. Q4)
  const [shuffledOptionsMap, setShuffledOptionsMap] = useState(() => initShuffledOptions());

  // Question Answers State for Questions 1..10
  const [answers, setAnswers] = useState({
    1: { isSubmitted: false, isCompleted: false },
    2: { deltaX: '', deltaY: '', isSubmitted: false, isCompleted: false, error: null },
    3: { isSubmitted: false, isCompleted: false },
    4: { selectedId: null, isSubmitted: false, error: null },
    5: { lineDrawn: false, lineInput: '', lineError: null, isSubmitted: false },
    6: { observation: '', isSubmitted: false, evalResult: null, error: null },
    7: { selectedId: null, isSubmitted: false, error: null },
    8: { selectedId: null, isSubmitted: false, error: null },
    9: { input: '', isSubmitted: false, isCompleted: false, error: null, feedback: null, normalizedEquation: '' },
    10: { selectedId: null, isSubmitted: false, error: null }
  });

  const updateAnswer = (qId, updates) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], ...updates }
    }));
  };

  // Conceptual verification of Question 6 observation (matching Point Studio)
  const handleCheckObservation = () => {
    const rawAnswer = answers[6]?.observation || '';
    const evalResult = evaluateAnswer(rawAnswer);
    if (evalResult.result === 'PASS') {
      updateAnswer(6, {
        isSubmitted: true,
        evalResult,
        error: null
      });
    } else {
      updateAnswer(6, {
        isSubmitted: false,
        evalResult,
        error: evalResult.feedback
      });
    }
  };

  // Equation verification for Question 9 (y = 3x + 2)
  const handleCheckEquation = () => {
    const raw = answers[9]?.input || '';
    const evalResult = evaluateEquationAnswer(raw, 3, 2);

    if (evalResult.status === 'PASS') {
      setSliderA(evalResult.parsedA);
      setSliderB(evalResult.parsedB);
      updateAnswer(9, {
        isSubmitted: true,
        isCompleted: true,
        error: null,
        feedback: evalResult.feedback,
        normalizedEquation: evalResult.normalizedEquation
      });
    } else {
      updateAnswer(9, {
        error: evalResult.feedback
      });
    }
  };

  // Re-shuffle unsubmitted MCQs when entering
  useEffect(() => {
    if (activeStep === 4 || activeStep === 7 || activeStep === 8 || activeStep === 10) {
      const q = LINE_PATH_QUESTIONS.find((item) => item.id === activeStep);
      if (q && q.options && !answers[activeStep]?.isSubmitted) {
        setShuffledOptionsMap((prev) => ({
          ...prev,
          [activeStep]: shuffleArray(q.options)
        }));
      }
    }
  }, [activeStep]);

  // Handle slider interaction in Questions 6..8, 10 or Free Play
  const handleSliderInteracted = (knob, val) => {
    if (activeStep > 10 || isFinished) {
      setFreePlayInteracted(true);
    }
  };

  // Mode conditions: Questions 6, 7, 8, 10 and Graduation are slider mode
  const isSliderMode = (activeStep >= 6 && activeStep <= 8) || activeStep === 10;
  const showLineAB = (activeStep === 5 && answers[5]?.lineDrawn) || (activeStep > 5 && activeStep < 6);
  const showOriginLines = false;
  const showParametricLine = (activeStep >= 6 && activeStep !== 9) || (activeStep === 9 && answers[9]?.isSubmitted);

  // Only show GeoGebra command input bar when the question requires plotting on GeoGebra:
  // Q1: Plot two points (required)
  // Q2: Measure dx & dy in question card (NOT required)
  // Q3: Plot C, D, E (required)
  // Q4: Guess pattern MCQ in question card (NOT required)
  // Q5: Draw Line(A, B) in GeoGebra (required until line is drawn)
  // Q6: Sliders mode for y = ax + b (NOT required)
  const showGeoGebraInputBar = activeStep === 1 || activeStep === 3 || (activeStep === 5 && !answers[5]?.lineDrawn);

  // Identify the learner's first two points (from Q1)
  const userPtA = plottedPoints.find((p) => p.name === 'A') || (plottedPoints.length >= 1 ? plottedPoints[0] : null);
  const userPtB = plottedPoints.find((p) => p.name === 'B') || (plottedPoints.length >= 2 ? plottedPoints[1] : null);

  // Check if two distinct points are plotted in Q1
  const hasPointA = Boolean(userPtA);
  const hasPointB = Boolean(userPtB && (userPtB.x !== userPtA?.x || userPtB.y !== userPtA?.y));
  const hasTwoPoints = hasPointA && hasPointB;

  // Active baseline points for pattern continuation (fallback to (1, 2) and (2, 4) if learner jumped ahead)
  const ptA = userPtA || { name: 'A', x: 1, y: 2 };
  const ptB = (userPtB && (userPtB.x !== ptA.x || userPtB.y !== ptA.y))
    ? userPtB
    : { name: 'B', x: ptA.x + 1, y: ptA.y + 2 };

  // Step increments: delta X and delta Y
  const dx = Number((ptB.x - ptA.x).toFixed(2));
  const dy = Number((ptB.y - ptA.y).toFixed(2));

  // Target points C, D, E calculated to lie on the exact same straight line
  const targetC = { name: 'C', x: Number((ptB.x + dx).toFixed(2)), y: Number((ptB.y + dy).toFixed(2)) };
  const targetD = { name: 'D', x: Number((targetC.x + dx).toFixed(2)), y: Number((targetC.y + dy).toFixed(2)) };
  const targetE = { name: 'E', x: Number((targetD.x + dx).toFixed(2)), y: Number((targetD.y + dy).toFixed(2)) };

  // Check if learner has plotted points matching target coordinates C, D, E
  const hasPointC = plottedPoints.some(
    (p) => (p.name === 'C' || (p !== userPtA && p !== userPtB)) && Math.abs(p.x - targetC.x) < 0.05 && Math.abs(p.y - targetC.y) < 0.05
  );
  const hasPointD = plottedPoints.some(
    (p) => (p.name === 'D' || (p !== userPtA && p !== userPtB)) && Math.abs(p.x - targetD.x) < 0.05 && Math.abs(p.y - targetD.y) < 0.05
  );
  const hasPointE = plottedPoints.some(
    (p) => (p.name === 'E' || (p !== userPtA && p !== userPtB)) && Math.abs(p.x - targetE.x) < 0.05 && Math.abs(p.y - targetE.y) < 0.05
  );

  // Question 3: Find the farthest point among the 5 points (A, B, C, D, E) and zoom out according to that only
  const getFarthestPointBounds = () => {
    const fivePoints = [ptA, ptB, targetC, targetD, targetE];

    // Calculate the farthest point from the origin (0, 0)
    const farthestPoint = fivePoints.reduce((maxPt, pt) => {
      const dPt = Math.hypot(pt.x, pt.y);
      const dMax = Math.hypot(maxPt.x, maxPt.y);
      return dPt > dMax ? pt : maxPt;
    }, fivePoints[0]);

    // Default base coordinate system in GeoGebraLineLab: [-6, 12, -3, 13]
    const defaultXmin = -6;
    const defaultXmax = 12;
    const defaultYmin = -3;
    const defaultYmax = 13;

    // Safety margin ratio so points sit comfortably inside the frame
    const margin = 0.75;

    // Zoom scale starts at 1.0 (never zoom in closer than standard, only zoom out)
    let zoomScale = 1.0;

    // Check farthest point against default boundaries
    if (farthestPoint.x > defaultXmax * margin) {
      zoomScale = Math.max(zoomScale, farthestPoint.x / (defaultXmax * margin));
    }
    if (farthestPoint.x < defaultXmin * margin) {
      zoomScale = Math.max(zoomScale, farthestPoint.x / (defaultXmin * margin));
    }
    if (farthestPoint.y > defaultYmax * margin) {
      zoomScale = Math.max(zoomScale, farthestPoint.y / (defaultYmax * margin));
    }
    if (farthestPoint.y < defaultYmin * margin) {
      zoomScale = Math.max(zoomScale, farthestPoint.y / (defaultYmin * margin));
    }

    // Also verify all 5 points are covered with the same safety margin
    fivePoints.forEach((p) => {
      if (p.x > defaultXmax * margin) {
        zoomScale = Math.max(zoomScale, p.x / (defaultXmax * margin));
      }
      if (p.x < defaultXmin * margin) {
        zoomScale = Math.max(zoomScale, p.x / (defaultXmin * margin));
      }
      if (p.y > defaultYmax * margin) {
        zoomScale = Math.max(zoomScale, p.y / (defaultYmax * margin));
      }
      if (p.y < defaultYmin * margin) {
        zoomScale = Math.max(zoomScale, p.y / (defaultYmin * margin));
      }
    });

    const scale = Math.max(1.0, Math.ceil(zoomScale * 10) / 10);

    return {
      xmin: Math.floor(defaultXmin * scale),
      xmax: Math.ceil(defaultXmax * scale),
      ymin: Math.floor(defaultYmin * scale),
      ymax: Math.ceil(defaultYmax * scale),
      farthestPoint
    };
  };

  // Callback when a line is drawn via GeoGebra input bar
  const handleLineDrawn = ({ pt1, pt2 }) => {
    if (activeStep === 5) {
      updateAnswer(5, { lineDrawn: true, isSubmitted: true, lineError: null });
    }
  };

  // Dynamic prompts that adapt to the learner's chosen points
  const getDynamicPrompt = () => {
    if (activeStep === 1) {
      return 'Plot any two different points of your choice on the canvas:';
    }
    if (activeStep === 2) {
      return `Find the movement step from ${ptA.name}(${ptA.x}, ${ptA.y}) to ${ptB.name}(${ptB.x}, ${ptB.y}):`;
    }
    if (activeStep === 3) {
      return `Plot points C, D, and E using step (Δx = ${dx >= 0 ? '+' : ''}${dx}, Δy = ${dy >= 0 ? '+' : ''}${dy}):`;
    }
    if (activeStep === 4) {
      return 'What pattern do these 5 points form?';
    }
    if (activeStep === 5) {
      return 'Connect the points with a line:';
    }
    if (activeStep === 6) {
      return 'Change sliders "a" and "b" and type your observation:';
    }
    if (activeStep === 7) {
      return 'What happens when "a" is slowly increased?';
    }
    if (activeStep === 8) {
      return 'What is "b" doing here?';
    }
    if (activeStep === 9) {
      return 'Write an equation with steepness 3 and passing through 2 at y:';
    }
    return currentQ?.prompt;
  };

  const getDynamicSubtext = () => {
    if (activeStep === 1) {
      return 'Type points into the input bar below (e.g. (1, 2) or A = (1, 2)):';
    }
    if (activeStep === 2) {
      return null;
    }
    if (activeStep === 3) {
      return null;
    }
    if (activeStep === 4) {
      return null;
    }
    if (activeStep === 5) {
      return `Type Line(${ptA.name}, ${ptB.name}) in the input bar below:`;
    }
    if (activeStep >= 6) {
      return null;
    }
    return currentQ?.subtext;
  };

  // Dynamic input placeholder to guide user typing
  const getInputPlaceholder = () => {
    if (activeStep === 1) {
      if (!hasPointA) return 'e.g. A = (x, y) or (x, y) — pick any first point';
      if (!hasPointB) return `e.g. B = (x, y) or (x, y) — pick a second point (different from (${ptA.x}, ${ptA.y}))`;
      return 'Points A & B plotted! Ready for Level 2';
    }
    if (activeStep === 2) {
      return 'Enter Δx and Δy in the question card below';
    }
    if (activeStep === 3) {
      if (!hasPointC) return 'e.g. C = (x, y) or (x, y) — step from B';
      if (!hasPointD) return 'e.g. D = (x, y) or (x, y) — step from C';
      if (!hasPointE) return 'e.g. E = (x, y) or (x, y) — step from D';
      return 'Points C, D, E plotted!';
    }
    if (activeStep === 4) return 'Choose the pattern in the card below';
    if (activeStep === 5) return `e.g. Line(${ptA.name}, ${ptB.name})`;
    return 'e.g. (x, y) or Name = (x, y) or Line(A, B)';
  };

  // Manage canvas points on level navigation - never auto-plot any points at any level
  useEffect(() => {
    if (activeStep === 1) {
      // In level 1, only show points A and B if the learner put them
      setPlottedPoints((prev) => {
        if (prev.length <= 2) return prev;
        const p1 = prev.find((p) => p.name === 'A') || prev[0];
        const p2 = prev.find((p) => p.name === 'B') || prev[1];
        return [p1, p2].filter(Boolean);
      });
    } else if (activeStep === 6) {
      // Level 6: Equation y = ax + b and sliders; clear plotted points
      setPlottedPoints([]);
      setSliderA(2);
      setSliderB(0);
    }
  }, [activeStep]);

  const handlePointPlotted = (pt) => {
    setPlottedPoints((prev) => {
      const filtered = prev.filter((p) => p.name !== pt.name);
      return [...filtered, pt];
    });
  };

  const handleClearPoints = () => {
    setPlottedPoints([]);
  };

  // Validates point inputs for Question 1, Question 3, and Question 5
  const handleValidatePoint = ({ name, x, y }) => {
    if (activeStep === 1) {
      if (userPtA && Math.abs(x - userPtA.x) < 0.05 && Math.abs(y - userPtA.y) < 0.05) {
        return {
          isValid: false,
          title: '⚠️ IDENTICAL POINT',
          error: `Point (${x}, ${y}) has the exact same coordinates as Point A! Please choose a different second point.`
        };
      }
      return { isValid: true };
    }

    if (activeStep === 3) {
      const formatDelta = (v) => {
        if (v > 0) return `+${v}`;
        if (v === 0) return '0';
        return `${v}`;
      };

      if (hasPointC && hasPointD && hasPointE) {
        return {
          isValid: false,
          title: '✓ ALL POINTS PLOTTED',
          error: "All 3 points (C, D, and E) have already been plotted in pattern! Click 'Continue to Next Level' to proceed."
        };
      }

      // Determine which point is next in sequence
      let refPoint;
      let targetPoint;
      let expectedName;

      if (!hasPointC) {
        refPoint = ptB;
        targetPoint = targetC;
        expectedName = 'C';
      } else if (!hasPointD) {
        refPoint = targetC;
        targetPoint = targetD;
        expectedName = 'D';
      } else {
        refPoint = targetD;
        targetPoint = targetE;
        expectedName = 'E';
      }

      // Check if re-entering existing points
      if (Math.abs(x - ptA.x) < 0.05 && Math.abs(y - ptA.y) < 0.05) {
        const err = {
          title: '⚠️ POINT ALREADY PLOTTED',
          msg: `Point ${ptA.name}(${ptA.x}, ${ptA.y}) is already plotted! Please plot point ${expectedName} by stepping from ${refPoint.name}(${refPoint.x}, ${refPoint.y}).`
        };
        updateAnswer(3, { validationError: err });
        return { isValid: false, title: err.title, error: err.msg };
      }

      if (Math.abs(x - ptB.x) < 0.05 && Math.abs(y - ptB.y) < 0.05) {
        const err = {
          title: '⚠️ POINT ALREADY PLOTTED',
          msg: `Point ${ptB.name}(${ptB.x}, ${ptB.y}) is already plotted! Please plot point ${expectedName} by stepping from ${refPoint.name}(${refPoint.x}, ${refPoint.y}).`
        };
        updateAnswer(3, { validationError: err });
        return { isValid: false, title: err.title, error: err.msg };
      }

      if (hasPointC && Math.abs(x - targetC.x) < 0.05 && Math.abs(y - targetC.y) < 0.05) {
        const err = {
          title: '⚠️ POINT ALREADY PLOTTED',
          msg: `Point C(${targetC.x}, ${targetC.y}) is already plotted! Next, please plot point ${expectedName} by stepping from ${refPoint.name}(${refPoint.x}, ${refPoint.y}).`
        };
        updateAnswer(3, { validationError: err });
        return { isValid: false, title: err.title, error: err.msg };
      }

      if (hasPointD && Math.abs(x - targetD.x) < 0.05 && Math.abs(y - targetD.y) < 0.05) {
        const err = {
          title: '⚠️ POINT ALREADY PLOTTED',
          msg: `Point D(${targetD.x}, ${targetD.y}) is already plotted! Next, please plot point ${expectedName} by stepping from ${refPoint.name}(${refPoint.x}, ${refPoint.y}).`
        };
        updateAnswer(3, { validationError: err });
        return { isValid: false, title: err.title, error: err.msg };
      }

      // Check if jumping ahead to future target points out of order
      if (!hasPointC) {
        if (Math.abs(x - targetD.x) < 0.05 && Math.abs(y - targetD.y) < 0.05) {
          const err = {
            title: '⚠️ PLOT IN SEQUENCE',
            msg: `That is point D (2 steps away)! Please plot point C first by taking 1 step (Δx = ${formatDelta(dx)}, Δy = ${formatDelta(dy)}) from point B(${ptB.x}, ${ptB.y}).`
          };
          updateAnswer(3, { validationError: err });
          return { isValid: false, title: err.title, error: err.msg };
        }
        if (Math.abs(x - targetE.x) < 0.05 && Math.abs(y - targetE.y) < 0.05) {
          const err = {
            title: '⚠️ PLOT IN SEQUENCE',
            msg: `That is point E (3 steps away)! Please plot point C first by taking 1 step (Δx = ${formatDelta(dx)}, Δy = ${formatDelta(dy)}) from point B(${ptB.x}, ${ptB.y}).`
          };
          updateAnswer(3, { validationError: err });
          return { isValid: false, title: err.title, error: err.msg };
        }
      } else if (!hasPointD) {
        if (Math.abs(x - targetE.x) < 0.05 && Math.abs(y - targetE.y) < 0.05) {
          const err = {
            title: '⚠️ PLOT IN SEQUENCE',
            msg: `That is point E (2 steps from C)! Please plot point D first by taking 1 step (Δx = ${formatDelta(dx)}, Δy = ${formatDelta(dy)}) from point C(${targetC.x}, ${targetC.y}).`
          };
          updateAnswer(3, { validationError: err });
          return { isValid: false, title: err.title, error: err.msg };
        }
      }

      // Calculate actual movement deltas from the reference point
      const actualDx = Number((x - refPoint.x).toFixed(2));
      const actualDy = Number((y - refPoint.y).toFixed(2));

      const isXCorrect = Math.abs(x - targetPoint.x) < 0.05;
      const isYCorrect = Math.abs(y - targetPoint.y) < 0.05;

      if (isXCorrect && isYCorrect) {
        // Clear any previous validation error on success
        updateAnswer(3, { validationError: null });
        return {
          isValid: true,
          correctedName: expectedName
        };
      }

      // Axis-specific feedback when movement is incorrect:
      let errTitle = '';
      let errMsg = '';

      if (!isXCorrect && isYCorrect) {
        errTitle = '❌ INCORRECT MOVEMENT ON X-AXIS';
        errMsg = `The movement is not correct on the X-axis: your shift in Y is correct (${formatDelta(actualDy)}), but your movement in X is ${formatDelta(actualDx)} (should be ${formatDelta(dx)} from point ${refPoint.name}(${refPoint.x}, ${refPoint.y})).`;
      } else if (isXCorrect && !isYCorrect) {
        errTitle = '❌ INCORRECT MOVEMENT ON Y-AXIS';
        errMsg = `The movement is not correct on the Y-axis: your movement in X is correct (${formatDelta(actualDx)}), but your shift in Y is ${formatDelta(actualDy)} (should be ${formatDelta(dy)} from point ${refPoint.name}(${refPoint.x}, ${refPoint.y})).`;
      } else {
        errTitle = '❌ INCORRECT MOVEMENT ON BOTH AXES';
        errMsg = `The movement is not correct on both the X-axis and Y-axis: from point ${refPoint.name}(${refPoint.x}, ${refPoint.y}), you moved ${formatDelta(actualDx)} in X (should be ${formatDelta(dx)}) and ${formatDelta(actualDy)} in Y (should be ${formatDelta(dy)}).`;
      }

      updateAnswer(3, { validationError: { title: errTitle, msg: errMsg } });
      return {
        isValid: false,
        title: errTitle,
        error: errMsg
      };
    }

    if (activeStep === 5) {
      return {
        isValid: false,
        title: '💡 USE LINE COMMAND',
        error: `In this level, connect the points using the line command: Line(${ptA.name}, ${ptB.name}).`
      };
    }

    return { isValid: true };
  };

  const isQuestionComplete = (qId) => {
    const a = answers[qId];
    if (!a) return false;
    if (qId === 1) {
      return Boolean(a.isSubmitted || a.isCompleted || hasTwoPoints);
    }
    if (qId === 2) {
      return Boolean(a.isSubmitted || a.isCompleted);
    }
    if (qId === 3) {
      return Boolean(a.isSubmitted || a.isCompleted || (hasPointC && hasPointD && hasPointE));
    }
    if (qId === 4) {
      return Boolean(a.isSubmitted);
    }
    if (qId === 5) {
      return Boolean(a.isSubmitted || a.lineDrawn);
    }
    if (qId === 6) {
      return Boolean(a.isSubmitted);
    }
    if (qId === 7) {
      return Boolean(a.isSubmitted);
    }
    if (qId === 8) {
      return Boolean(a.isSubmitted);
    }
    return Boolean(a.isSubmitted);
  };

  const completedCount = Object.keys(answers).filter((id) => isQuestionComplete(Number(id))).length;

  const currentQ = LINE_PATH_QUESTIONS.find((q) => q.id === activeStep);

  // Active Phase calculation
  const getActivePhaseName = () => {
    if (activeStep <= 3) return 'Phase 1: Plotting & Stepping';
    if (activeStep <= 5) return 'Phase 2: Seeing & Drawing the Line';
    if (activeStep <= 8) return 'Phase 3: Knobs & Exploration';
    return 'Phase 4: The Equation y = ax + b';
  };

  // Q2 Step Verification
  const handleVerifyStepDelta = () => {
    const enteredDx = parseFloat(answers[2]?.deltaX);
    const enteredDy = parseFloat(answers[2]?.deltaY);

    if (isNaN(enteredDx) || isNaN(enteredDy)) {
      updateAnswer(2, { error: 'Please enter valid numerical values for both movement in X and shift in Y.' });
      return;
    }

    const isForward = Math.abs(enteredDx - dx) < 0.05 && Math.abs(enteredDy - dy) < 0.05;
    const isBackward = Math.abs(enteredDx - (-dx)) < 0.05 && Math.abs(enteredDy - (-dy)) < 0.05;

    if (isForward || isBackward) {
      updateAnswer(2, { isSubmitted: true, isCompleted: true, error: null });
    } else {
      updateAnswer(2, {
        error: `From point ${ptA.name}(${ptA.x}, ${ptA.y}) to ${ptB.name}(${ptB.x}, ${ptB.y}): change in x is ${ptB.x} - (${ptA.x}) = ${dx}, and shift in y is ${ptB.y} - (${ptA.y}) = ${dy}. Check your numbers!`
      });
    }
  };

  // Q5 Line Drawing Command
  const handleDrawLineCommand = () => {
    const val = (answers[5]?.lineInput || '').trim();
    const match = val.match(/^line\s*\(\s*([a-zA-Z]+)\s*,\s*([a-zA-Z]+)\s*\)$/i);
    if (match) {
      updateAnswer(5, { lineDrawn: true, isSubmitted: true, lineError: null });
    } else {
      updateAnswer(5, {
        lineError: `Strict syntax required: Use Line(${ptA.name}, ${ptB.name}) with parentheses and comma to join points.`
      });
    }
  };

  // Auto-advance timer when graduating
  const isAtGraduation = isFinished || activeStep > (PATH_META.totalQuestions || 10);
  useEffect(() => {
    let timer;
    if (isAtGraduation && onNext) {
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
  }, [isAtGraduation, onNext, autoAdvanceTimer]);

  // ========================================================
  // RENDER: GRADUATION / FREE-PLAY LAB (After Level 10)
  // ========================================================
  if (isFinished || activeStep > (PATH_META.totalQuestions || 10)) {
    return (
      <div className="la-studio-wrapper">
        <div className="la-top-nav">
          {onBack && (
            <button className="la-back-btn" onClick={onBack}>
              ← Back to Dashboard
            </button>
          )}
          <span className="la-progress-badge">Destination Achieved 🏆</span>
        </div>

        <div className="la-header">
          <span className="la-phase-pill">The Naming Handover</span>
          <h1 className="la-title">{CLUSTER_2_SUMMARY.title}</h1>
        </div>

        {/* The Naming Handover */}
        <div className="line-handover-box" style={{ textAlign: 'center', padding: '1.5rem 1.75rem' }}>
          <span className="line-handover-badge">✨ THE NAMING HANDOVER</span>
          <div style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            fontFamily: 'serif',
            color: '#e8864a',
            margin: '0.6rem 0 0.4rem 0',
            letterSpacing: '0.04em'
          }}>
            y = a·x + b
          </div>
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.98rem', color: '#f3efe6', lineHeight: 1.5 }}>
            Whatever you were doing with knobs <strong>a</strong> and <strong>b</strong> is actually this equation!
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            textAlign: 'left',
            background: 'rgba(0, 0, 0, 0.28)',
            padding: '1.1rem 1.35rem',
            borderRadius: '12px',
            border: '1px solid rgba(232, 134, 74, 0.22)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <span style={{ color: '#e8864a', fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.2 }}>•</span>
              <span style={{ fontSize: '0.95rem', color: '#f3efe6', lineHeight: 1.5 }}>
                <strong>Knob 'a' controls rotation &amp; steepness:</strong> Increasing 'a' rotates the line anti-clockwise.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <span style={{ color: '#e8864a', fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.2 }}>•</span>
              <span style={{ fontSize: '0.95rem', color: '#f3efe6', lineHeight: 1.5 }}>
                <strong>Knob 'b' gives where the line passes at 'y':</strong> When b = 0, the line passes directly through the origin (0, 0).
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
          {onNext && autoAdvanceTimer !== null && (
            <div style={{
              background: 'rgba(13, 148, 136, 0.15)',
              border: '1px solid #0d9488',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: '#0d9488',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span>🚀 Advancing to <strong>Dimension Studio (Stage 3)</strong> in <strong>{autoAdvanceTimer}s</strong>...</span>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: '1px solid #0d9488',
                  borderRadius: '4px',
                  color: '#0d9488',
                  padding: '2px 6px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
                onClick={() => setAutoAdvanceTimer(null)}
              >
                Stay Here
              </button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="la-btn-primary large"
              onClick={() => (onNext ? onNext() : onBack?.())}
            >
              {onNext ? 'Proceed to Dimension Studio (Stage 3) 🌌 ➔' : 'Complete Journey 🏆'}
            </button>
            {onBack && (
              <button className="la-btn-secondary large" onClick={onBack}>
                Dashboard 🏠
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // RENDER: STEPPER JOURNEY (Questions 1..6)
  // ========================================================
  return (
    <div className="la-studio-wrapper">
      {/* Top Nav */}
      <div className="la-top-nav">
        {onBack && (
          <button className="la-back-btn" onClick={onBack}>
            ← Dashboard
          </button>
        )}
        <span className="la-progress-badge">
          {`Question ${activeStep} of ${PATH_META.totalQuestions || 10}`}
        </span>
      </div>

      {/* Header */}
      <div className="la-header">
        <span className="la-phase-pill">{getActivePhaseName()}</span>
        <h1 className="la-title">{PATH_META.title}</h1>
        <p className="la-subtitle">
          {currentQ?.subtext || PATH_META.subtitle}
        </p>
      </div>

      {/* Stepper Bar */}
      <div className="la-stepper-bar">
        {LINE_PATH_QUESTIONS.map((q) => {
          const isDone = isQuestionComplete(q.id);
          const isActive = activeStep === q.id;
          return (
            <button
              key={q.id}
              className={`la-step-pill ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
              onClick={() => setActiveStep(q.id)}
            >
              <span className="la-pill-num">{q.id}</span>
            </button>
          );
        })}
      </div>

      {/* Main Single Unified Card: Header + Graph at Top + Input Box + Question + Verification */}
      <div className="la-card">
        {/* Card Header */}
        <div className="la-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="la-question-badge">
              {`Q${currentQ?.id || activeStep}`}
            </span>
            <span className="la-topic-badge">
              {currentQ?.title || ''}
            </span>
          </div>
          <span className="la-question-num">
            {`Question ${activeStep} of ${PATH_META.totalQuestions || 10}`}
          </span>
        </div>

        {/* 1. GRAPH AT TOP & ASKED TASK DIRECTLY ABOVE INPUT BOX */}
        {activeStep !== 9 ? (
          <GeoGebraLineLab
            sliderA={sliderA}
            sliderB={sliderB}
            onSliderChange={(newA, newB) => {
              setSliderA(newA);
              setSliderB(newB);
            }}
            plottedPoints={plottedPoints}
            onPointPlotted={handlePointPlotted}
            validatePoint={handleValidatePoint}
            onClearPoints={handleClearPoints}
            onLineDrawn={handleLineDrawn}
            showLineAB={showLineAB}
            linePoint1Name={ptA.name}
            linePoint2Name={ptB.name}
            showOriginLines={showOriginLines}
            showParametricLine={showParametricLine}
            showEquationDisplay={false}
            interactiveSliders={isSliderMode}
            onSliderInteracted={handleSliderInteracted}
            showInputBar={showGeoGebraInputBar}
            coordBounds={activeStep >= 3 && activeStep <= 5 ? getFarthestPointBounds() : null}
            inputSubmitLabel={activeStep === 5 ? 'Draw Line 🚀' : 'Plot on Canvas 🚀'}
            inputPlaceholder={getInputPlaceholder()}
            taskHeader={
              <div className="la-step-intro-block" style={{ margin: '0.45rem 0' }}>
                <h3 className="la-step-heading">
                  {getDynamicPrompt()}
                </h3>
                {getDynamicSubtext() && (
                  <p className="la-step-subtext">
                    {getDynamicSubtext()}
                  </p>
                )}
              </div>
            }
          />
        ) : (
          <div className="la-step-intro-block" style={{ margin: '0.45rem 0 1rem 0' }}>
            <h3 className="la-step-heading">
              {getDynamicPrompt()}
            </h3>
            {getDynamicSubtext() && (
              <p className="la-step-subtext">
                {getDynamicSubtext()}
              </p>
            )}
          </div>
        )}

        <div className="la-step-container">
          {/* =================================================== */}
          {/* QUESTION 1: PLOT ANY TWO POINTS                     */}
          {/* =================================================== */}
          {activeStep === 1 && (
            <div className="la-single-step-view">
              <div className="la-verification-bar">
                <div className="la-verification-group">
                  <span className="la-verification-label">Verification:</span>
                  <div className={`la-verification-chip ${hasPointA ? 'verified' : ''}`}>
                    <span>{hasPointA ? '✓' : '⏳'}</span>
                    <span>{userPtA ? `Point ${userPtA.name} (${userPtA.x}, ${userPtA.y})` : 'Point 1: Any (x, y)'}</span>
                  </div>
                  <div className={`la-verification-chip ${hasPointB ? 'verified' : ''}`}>
                    <span>{hasPointB ? '✓' : '⏳'}</span>
                    <span>{userPtB ? `Point ${userPtB.name} (${userPtB.x}, ${userPtB.y})` : 'Point 2: Any (x, y)'}</span>
                  </div>
                  {hasTwoPoints && (
                    <span className="la-verification-tag">✓ 2 Distinct Points Plotted</span>
                  )}
                </div>

                <div className="la-verification-actions">
                  <button
                    className="la-btn-primary"
                    disabled={!hasTwoPoints}
                    onClick={() => {
                      updateAnswer(1, { isSubmitted: true, isCompleted: true });
                      setActiveStep(2);
                    }}
                    style={{
                      padding: '0.45rem 1.15rem',
                      fontSize: '0.85rem',
                      opacity: hasTwoPoints ? 1 : 0.45,
                      cursor: hasTwoPoints ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Continue to Next Level →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 2: MEASURE MOVEMENT IN X AND SHIFT IN Y   */}
          {/* =================================================== */}
          {activeStep === 2 && (
            <div className="la-single-step-view">
              <div className="la-observation-box">
                <div className="la-observation-header">
                  <span>📏 MEASURE STEP DELTA</span>
                  {answers[2]?.isSubmitted && <span className="la-credit-tag">✓ Step Verified</span>}
                </div>

                <div className="line-delta-inputs-grid">
                  <div className="line-delta-field">
                    <label className="line-delta-label">Change in X (Δx = x₂ − x₁)</label>
                    <input
                      type="number"
                      step="any"
                      className="la-text-input"
                      placeholder="e.g. 2"
                      value={answers[2]?.deltaX || ''}
                      onChange={(e) => updateAnswer(2, { deltaX: e.target.value, error: null })}
                      disabled={answers[2]?.isSubmitted}
                    />
                  </div>
                  <div className="line-delta-field">
                    <label className="line-delta-label">Change in Y (Δy = y₂ − y₁)</label>
                    <input
                      type="number"
                      step="any"
                      className="la-text-input"
                      placeholder="e.g. 3"
                      value={answers[2]?.deltaY || ''}
                      onChange={(e) => updateAnswer(2, { deltaY: e.target.value, error: null })}
                      disabled={answers[2]?.isSubmitted}
                    />
                  </div>
                </div>

                {answers[2]?.error && (
                  <div style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 500 }}>
                    {answers[2]?.error}
                  </div>
                )}

                {!answers[2]?.isSubmitted ? (
                  <div className="la-step-footer-actions between" style={{ marginTop: '0.85rem' }}>
                    <button className="la-btn-secondary" onClick={() => setActiveStep(1)}>
                      ← Back to Level 1
                    </button>
                    <button
                      className="la-btn-primary"
                      disabled={answers[2]?.deltaX === '' || answers[2]?.deltaY === ''}
                      onClick={handleVerifyStepDelta}
                    >
                      Verify Movement Step ✓
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', fontSize: '0.82rem', color: '#6ee7b7' }}>
                      ✓ <strong>Step Confirmed:</strong> You moved <strong>{dx}</strong> in X, and shifted <strong>{dy}</strong> in Y!
                    </div>

                    <div className="la-earns-card" style={{ marginTop: '0.85rem' }}>
                      <div className="la-earns-badge">🎉 EARNED INSIGHT</div>
                      <p className="la-earns-text">{currentQ.earns}</p>
                      <p className="la-earns-sub">{currentQ.creditExplanation}</p>
                      <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                        <button className="la-btn-secondary" onClick={() => setActiveStep(1)}>
                          ← Back to Level 1
                        </button>
                        <button className="la-btn-primary" onClick={() => setActiveStep(3)}>
                          Continue to Next Level →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 3: MOVE IN SAME PATTERN 3 MORE TIMES      */}
          {/* =================================================== */}
          {activeStep === 3 && (
            <div className="la-single-step-view">
              <div className="la-verification-bar">
                <div className="la-verification-group">
                  <span className="la-verification-label">Verification:</span>
                  {!hasPointC && !hasPointD && !hasPointE && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft, #a89e94)' }}>
                      ⏳ Plot points C, D, and E using your movement step (0 of 3 plotted)
                    </span>
                  )}
                  {hasPointC && (
                    <div className="la-verification-chip verified">
                      <span>✓</span>
                      <span>Point C ({targetC.x}, {targetC.y})</span>
                    </div>
                  )}
                  {hasPointD && (
                    <div className="la-verification-chip verified">
                      <span>✓</span>
                      <span>Point D ({targetD.x}, {targetD.y})</span>
                    </div>
                  )}
                  {hasPointE && (
                    <div className="la-verification-chip verified">
                      <span>✓</span>
                      <span>Point E ({targetE.x}, {targetE.y})</span>
                    </div>
                  )}
                  {hasPointC && hasPointD && hasPointE && (
                    <span className="la-verification-tag">✓ All 3 Plotted in Pattern!</span>
                  )}
                </div>

                <div className="la-verification-actions">
                  <button
                    className="la-btn-secondary"
                    onClick={() => setActiveStep(2)}
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                  >
                    ← Back
                  </button>
                  <button
                    className="la-btn-primary"
                    disabled={!(hasPointC && hasPointD && hasPointE)}
                    onClick={() => {
                      updateAnswer(3, { isSubmitted: true, isCompleted: true });
                      setActiveStep(4);
                    }}
                    style={{
                      padding: '0.45rem 1.15rem',
                      fontSize: '0.85rem',
                      opacity: (hasPointC && hasPointD && hasPointE) ? 1 : 0.45,
                      cursor: (hasPointC && hasPointD && hasPointE) ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Continue to Next Level →
                  </button>
                </div>
              </div>

              {answers[3]?.validationError && !(hasPointC && hasPointD && hasPointE) && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.65rem 0.95rem',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    color: '#fca5a5',
                    lineHeight: '1.45'
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: '0.2rem', color: '#f87171' }}>
                    {answers[3].validationError.title}
                  </strong>
                  <span>{answers[3].validationError.msg}</span>
                </div>
              )}

              {hasPointC && hasPointD && hasPointE && (
                <div className="la-earns-card" style={{ marginTop: '0.75rem' }}>
                  <div className="la-earns-badge">🎉 LEVEL 3 COMPLETE (PHASE 1)</div>
                  <p className="la-earns-text">{currentQ.earns}</p>
                  <p className="la-earns-sub">{currentQ.creditExplanation}</p>
                </div>
              )}
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 4: GUESS THE VISIBLE PATTERN               */}
          {/* =================================================== */}
          {activeStep === 4 && (
            <div className="la-single-step-view">
              <div className="la-observation-box">
                <div className="la-observation-header">
                  <span>👀 GEOMETRIC PATTERN</span>
                  {answers[4]?.isSubmitted && <span className="la-credit-tag">✓ Pattern Identified</span>}
                </div>

                <div className="la-options-stack" style={{ marginTop: '0.65rem' }}>
                  {(shuffledOptionsMap[4] || currentQ.options).map((opt, i) => {
                    const isSelected = answers[4]?.selectedId === opt.id;
                    const isSubmitted = answers[4]?.isSubmitted;
                    let cls = 'la-option-btn';
                    if (isSelected) cls += ' selected';
                    if (isSubmitted) {
                      if (opt.isCorrect) cls += ' correct';
                      else if (isSelected) cls += ' incorrect';
                    }

                    return (
                      <button
                        key={opt.id}
                        className={cls}
                        onClick={() => {
                          if (!isSubmitted) updateAnswer(4, { selectedId: opt.id, error: null });
                        }}
                        disabled={isSubmitted}
                      >
                        <span className="la-option-letter">{String.fromCharCode(65 + i)}</span>
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {answers[4]?.error && !answers[4]?.isSubmitted && (
                  <div style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 500 }}>
                    {answers[4]?.error}
                  </div>
                )}

                {!answers[4]?.isSubmitted ? (
                  <div className="la-step-footer-actions between" style={{ marginTop: '0.85rem' }}>
                    <button className="la-btn-secondary" onClick={() => setActiveStep(3)}>
                      ← Back to Level 3
                    </button>
                    <button
                      className="la-btn-primary"
                      disabled={!answers[4]?.selectedId}
                      onClick={() => {
                        const opt = currentQ.options?.find((o) => o.id === answers[4]?.selectedId);
                        if (opt?.isCorrect) {
                          updateAnswer(4, { isSubmitted: true, error: null });
                        } else {
                          updateAnswer(4, { error: 'Look closely at the canvas: every point moved by the exact same step. They do not bend into a curve or scatter — they all form a straight line!' });
                        }
                      }}
                    >
                      Check Pattern
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="la-earns-card" style={{ marginTop: '0.85rem' }}>
                      <div className="la-earns-badge">🎉 EARNED INSIGHT</div>
                      <p className="la-earns-text">{currentQ.earns}</p>
                      <p className="la-earns-sub">{currentQ.creditExplanation}</p>
                      <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                        <button className="la-btn-secondary" onClick={() => setActiveStep(3)}>
                          ← Back to Level 3
                        </button>
                        <button className="la-btn-primary" onClick={() => setActiveStep(5)}>
                          Continue to Next Level →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 5: DRAW THE PATTERN USING ITS NAME         */}
          {/* =================================================== */}
          {activeStep === 5 && (
            <div className="la-single-step-view">
              <div className="la-observation-box">
                <div className="la-observation-header">
                  <span>📏 CONNECT POINTS: Line({ptA.name}, {ptB.name})</span>
                  {answers[5]?.lineDrawn && <span className="la-credit-tag">✓ Line Drawn</span>}
                </div>

                {!answers[5]?.lineDrawn ? (
                  <div style={{ marginTop: '0.65rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft, #a89e94)' }}>
                      ⏳ Type <code>Line({ptA.name}, {ptB.name})</code> in the input bar and click Draw Line.
                    </span>
                    {answers[5]?.lineError && (
                      <div style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 500 }}>
                        {answers[5]?.lineError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', fontSize: '0.82rem', color: '#6ee7b7' }}>
                      ✓ <strong>Line Connected:</strong> Passes straight through all plotted points!
                    </div>

                    <div className="la-earns-card" style={{ marginTop: '0.85rem' }}>
                      <div className="la-earns-badge">🎉 LEVEL 5 COMPLETE (PHASE 2)</div>
                      <p className="la-earns-text">{currentQ.earns}</p>
                      <p className="la-earns-sub">{currentQ.creditExplanation}</p>
                      <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                        <button className="la-btn-secondary" onClick={() => setActiveStep(4)}>
                          ← Back to Level 4
                        </button>
                        <button className="la-btn-primary" onClick={() => setActiveStep(6)}>
                          Continue to Next Level →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 6: EXPLORE KNOBS "a" AND "b"               */}
          {/* =================================================== */}
          {activeStep === 6 && (
            <div className="la-single-step-view">
              <div className="la-observation-box">
                <div className="la-observation-header">
                  <span>👀 SLIDER OBSERVATION</span>
                  {answers[6]?.isSubmitted && <span className="la-credit-tag">✓ Observation Verified</span>}
                </div>

                {!answers[6]?.isSubmitted ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.35rem' }}>
                      <label className="line-delta-label">What do you observe as you change "a" and "b"?</label>
                      <textarea
                        className="line-observation-textarea"
                        placeholder="Describe what happens to the line when you change 'a' and 'b'..."
                        value={answers[6]?.observation || ''}
                        onChange={(e) => updateAnswer(6, { observation: e.target.value, evalResult: null, error: null })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && answers[6]?.observation?.trim()) {
                            e.preventDefault();
                            handleCheckObservation();
                          }
                        }}
                      />
                    </div>

                    {answers[6]?.evalResult && answers[6].evalResult.result !== 'PASS' && (
                      <div
                        style={{
                          marginTop: '0.65rem',
                          padding: '0.65rem 0.85rem',
                          background: answers[6].evalResult.result === 'UNCERTAIN' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          border: `1px solid ${answers[6].evalResult.result === 'UNCERTAIN' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                          borderRadius: '8px',
                          fontSize: '0.825rem',
                          color: answers[6].evalResult.result === 'UNCERTAIN' ? '#fcd34d' : '#fca5a5',
                          lineHeight: '1.45'
                        }}
                      >
                        <strong style={{ display: 'block', marginBottom: '0.2rem' }}>
                          {answers[6].evalResult.result === 'UNCERTAIN' ? '💡 Almost there:' : '💡 Check Observation:'}
                        </strong>
                        <span>{answers[6].evalResult.feedback}</span>
                      </div>
                    )}

                    <div className="la-step-footer-actions between" style={{ marginTop: '0.85rem' }}>
                      <button className="la-btn-secondary" onClick={() => setActiveStep(5)}>
                        ← Back to Level 5
                      </button>
                      <button
                        className="la-btn-primary"
                        disabled={!answers[6]?.observation?.trim()}
                        onClick={handleCheckObservation}
                      >
                        Check Observation ✓
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="la-submitted-step-box" style={{ marginTop: '0.5rem' }}>
                    <div className="la-submitted-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span className="la-submitted-tag" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--clr-text-soft, #a89e94)' }}>Your Verified Observation:</span>
                      <button
                        type="button"
                        onClick={() => updateAnswer(6, { isSubmitted: false })}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--clr-text-soft, #a89e94)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Edit ✎
                      </button>
                    </div>
                    <p className="la-submitted-quote" style={{ fontStyle: 'italic', color: 'var(--clr-text, #ede8e3)', margin: '0 0 0.5rem 0', lineHeight: 1.45 }}>
                      "{answers[6]?.observation}"
                    </p>
                    <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', fontSize: '0.825rem', color: '#6ee7b7', lineHeight: 1.45 }}>
                      ✓ <strong>Spot on:</strong> {answers[6]?.evalResult?.feedback || 'Changing "a" rotates/tilts the line, and changing "b" shifts it up and down!'}
                    </div>

                    <div className="la-earns-card" style={{ marginTop: '0.85rem' }}>
                      <div className="la-earns-badge">🎉 DISCOVERY COMPLETE (PHASE 3)</div>
                      <p className="la-earns-text">{currentQ.earns}</p>
                      <p className="la-earns-sub">{currentQ.creditExplanation}</p>
                      <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                        <button className="la-btn-secondary" onClick={() => setActiveStep(5)}>
                          ← Back to Level 5
                        </button>
                        <button
                          className="la-btn-primary"
                          onClick={() => setActiveStep(7)}
                        >
                          Continue to Question 7 →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 7: WHAT HAPPENS WHEN "a" INCREASES?       */}
          {/* =================================================== */}
          {activeStep === 7 && (
            <div className="la-single-step-view">
              <div className="la-observation-box">
                <div className="la-observation-header">
                  <span>👀 OBSERVATION: INCREASING "a"</span>
                  {answers[7]?.isSubmitted && <span className="la-credit-tag">✓ Answer Verified</span>}
                </div>

                <div className="la-options-stack" style={{ marginTop: '0.65rem' }}>
                  {(shuffledOptionsMap[7] || currentQ.options).map((opt, i) => {
                    const isSelected = answers[7]?.selectedId === opt.id;
                    const isSubmitted = answers[7]?.isSubmitted;
                    let cls = 'la-option-btn';
                    if (isSelected) cls += ' selected';
                    if (isSubmitted) {
                      if (opt.isCorrect) cls += ' correct';
                      else if (isSelected) cls += ' incorrect';
                    }

                    return (
                      <button
                        key={opt.id}
                        className={cls}
                        onClick={() => {
                          if (!isSubmitted) updateAnswer(7, { selectedId: opt.id, error: null });
                        }}
                        disabled={isSubmitted}
                      >
                        <span className="la-option-letter">{String.fromCharCode(65 + i)}</span>
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {answers[7]?.error && !answers[7]?.isSubmitted && (
                  <div style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 500 }}>
                    {answers[7]?.error}
                  </div>
                )}

                {!answers[7]?.isSubmitted ? (
                  <div className="la-step-footer-actions between" style={{ marginTop: '0.85rem' }}>
                    <button className="la-btn-secondary" onClick={() => setActiveStep(6)}>
                      ← Back to Question 6
                    </button>
                    <button
                      className="la-btn-primary"
                      disabled={!answers[7]?.selectedId}
                      onClick={() => {
                        const opt = currentQ.options?.find((o) => o.id === answers[7]?.selectedId);
                        if (opt?.isCorrect) {
                          updateAnswer(7, { isSubmitted: true, error: null });
                        } else {
                          updateAnswer(7, { error: 'Look at the canvas as you drag slider "a" to higher values: notice which direction it turns — the line moves anti-clockwise!' });
                        }
                      }}
                    >
                      Check Observation ✓
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="la-earns-card" style={{ marginTop: '0.85rem' }}>
                      <div className="la-earns-badge">🎉 EARNED INSIGHT</div>
                      <p className="la-earns-text">{currentQ.earns}</p>
                      <p className="la-earns-sub">{currentQ.creditExplanation}</p>
                      <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                        <button className="la-btn-secondary" onClick={() => setActiveStep(6)}>
                          ← Back to Question 6
                        </button>
                        <button className="la-btn-primary" onClick={() => setActiveStep(8)}>
                          Continue to Question 8 →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 8: WHAT IS "b" DOING HERE?               */}
          {/* =================================================== */}
          {activeStep === 8 && (
            <div className="la-single-step-view">
              <div className="la-observation-box">
                <div className="la-observation-header">
                  <span>👀 OBSERVATION: WHAT IS "b" DOING?</span>
                  {answers[8]?.isSubmitted && <span className="la-credit-tag">✓ Answer Verified</span>}
                </div>

                <div className="la-options-stack" style={{ marginTop: '0.65rem' }}>
                  {(shuffledOptionsMap[8] || currentQ.options).map((opt, i) => {
                    const isSelected = answers[8]?.selectedId === opt.id;
                    const isSubmitted = answers[8]?.isSubmitted;
                    let cls = 'la-option-btn';
                    if (isSelected) cls += ' selected';
                    if (isSubmitted) {
                      if (opt.isCorrect) cls += ' correct';
                      else if (isSelected) cls += ' incorrect';
                    }

                    return (
                      <button
                        key={opt.id}
                        className={cls}
                        onClick={() => {
                          if (!isSubmitted) updateAnswer(8, { selectedId: opt.id, error: null });
                        }}
                        disabled={isSubmitted}
                      >
                        <span className="la-option-letter">{String.fromCharCode(65 + i)}</span>
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {answers[8]?.error && !answers[8]?.isSubmitted && (
                  <div style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 500 }}>
                    {answers[8]?.error}
                  </div>
                )}

                {!answers[8]?.isSubmitted ? (
                  <div className="la-step-footer-actions between" style={{ marginTop: '0.85rem' }}>
                    <button className="la-btn-secondary" onClick={() => setActiveStep(7)}>
                      ← Back to Question 7
                    </button>
                    <button
                      className="la-btn-primary"
                      disabled={!answers[8]?.selectedId}
                      onClick={() => {
                        const opt = currentQ.options?.find((o) => o.id === answers[8]?.selectedId);
                        if (opt?.isCorrect) {
                          updateAnswer(8, { isSubmitted: true, error: null });
                        } else {
                          updateAnswer(8, { error: 'Look at where the line crosses the vertical axis as you change slider "b": notice that "b" gives where the line will pass at "y"!' });
                        }
                      }}
                    >
                      Check Observation ✓
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="la-earns-card" style={{ marginTop: '0.85rem' }}>
                      <div className="la-earns-badge">🎉 DISCOVERY COMPLETE (PHASE 3)</div>
                      <p className="la-earns-text">{currentQ.earns}</p>
                      <p className="la-earns-sub">{currentQ.creditExplanation}</p>
                      <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                        <button className="la-btn-secondary" onClick={() => setActiveStep(7)}>
                          ← Back to Question 7
                        </button>
                        <button
                          className="la-btn-primary"
                          onClick={() => setActiveStep(9)}
                        >
                          Continue to Question 9 →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 9: WRITE EQUATION                          */}
          {/* =================================================== */}
          {activeStep === 9 && (
            <div className="la-single-step-view">
              {/* CLEAR VISIBLE TARGET VALUES CARD */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1.15rem 1.35rem',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--clr-text-soft, #a89e94)',
                  marginBottom: '0.75rem'
                }}>
                  Given Line Parameters
                </div>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  alignItems: 'stretch',
                  flexWrap: 'wrap'
                }}>
                  {/* Steepness / Tilt Value */}
                  <div style={{
                    flex: '1 1 200px',
                    maxWidth: '280px',
                    background: 'rgba(232, 134, 74, 0.12)',
                    border: '1.5px solid rgba(232, 134, 74, 0.45)',
                    borderRadius: '10px',
                    padding: '0.9rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      fontSize: '0.76rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#a89e94',
                      fontWeight: 700,
                      marginBottom: '0.35rem'
                    }}>
                      Steepness / Tilt (a)
                    </span>
                    <span style={{
                      fontSize: '2.1rem',
                      fontWeight: 800,
                      color: '#e8864a',
                      fontFamily: 'serif',
                      lineHeight: 1
                    }}>
                      3
                    </span>
                  </div>

                  {/* Passing through y value */}
                  <div style={{
                    flex: '1 1 200px',
                    maxWidth: '280px',
                    background: 'rgba(20, 184, 166, 0.12)',
                    border: '1.5px solid rgba(20, 184, 166, 0.45)',
                    borderRadius: '10px',
                    padding: '0.9rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      fontSize: '0.76rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#a89e94',
                      fontWeight: 700,
                      marginBottom: '0.35rem'
                    }}>
                      Passes through y at (b)
                    </span>
                    <span style={{
                      fontSize: '2.1rem',
                      fontWeight: 800,
                      color: '#14b8a6',
                      fontFamily: 'serif',
                      lineHeight: 1
                    }}>
                      2
                    </span>
                  </div>
                </div>
              </div>

              {/* EQUATION INPUT & SUBMISSION */}
              <div className="la-observation-box">
                <div className="la-observation-header">
                  <span>✍️ EQUATION BUILDER</span>
                  {answers[9]?.isSubmitted && <span className="la-credit-tag">✓ Equation Verified</span>}
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', color: '#f3efe6', marginBottom: '0.45rem', fontWeight: 500 }}>
                    Write the equation of the line using these values:
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="la-text-input"
                      value={answers[9]?.input ?? ''}
                      onChange={(e) => {
                        if (!answers[9]?.isSubmitted) {
                          updateAnswer(9, { input: e.target.value, error: null });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !answers[9]?.isSubmitted) {
                          handleCheckEquation();
                        }
                      }}
                      placeholder="e.g. y = 5x + 4"
                      disabled={answers[9]?.isSubmitted}
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.9rem',
                        fontSize: '1rem',
                        fontFamily: 'monospace',
                        borderRadius: '8px',
                        border: answers[9]?.error ? '1.5px solid #f87171' : '1.5px solid rgba(232, 134, 74, 0.4)',
                        background: '#1a1816',
                        color: '#fbf7ee'
                      }}
                    />
                    {!answers[9]?.isSubmitted && (
                      <button
                        className="la-btn-primary"
                        onClick={handleCheckEquation}
                        disabled={!answers[9]?.input?.trim()}
                      >
                        Check Equation ✓
                      </button>
                    )}
                  </div>

                  {answers[9]?.error && !answers[9]?.isSubmitted && (
                    <div style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '0.45rem', fontWeight: 500 }}>
                      {answers[9]?.error}
                    </div>
                  )}

                  {!answers[9]?.isSubmitted ? (
                    <div className="la-step-footer-actions between" style={{ marginTop: '0.85rem' }}>
                      <button className="la-btn-secondary" onClick={() => setActiveStep(8)}>
                        ← Back to Question 8
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="la-earns-card" style={{ marginTop: '0.85rem' }}>
                        <div className="la-earns-badge">🎉 EQUATION VERIFIED: {answers[9]?.normalizedEquation || 'y = 3x + 2'}</div>
                        <p className="la-earns-text">{currentQ.earns}</p>
                        <p className="la-earns-sub">{answers[9]?.feedback || currentQ.creditExplanation}</p>
                        <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                          <button className="la-btn-secondary" onClick={() => setActiveStep(8)}>
                            ← Back to Question 8
                          </button>
                          <button className="la-btn-primary" onClick={() => setActiveStep(10)}>
                            Continue to Question 10 →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 10: WHEN WILL LINE PASS THROUGH ORIGIN?   */}
          {/* =================================================== */}
          {activeStep === 10 && (
            <div className="la-single-step-view">
              <div className="la-observation-box">
                <div className="la-observation-header">
                  <span>👀 OBSERVATION: PASSING THROUGH ORIGIN</span>
                  {answers[10]?.isSubmitted && <span className="la-credit-tag">✓ Answer Verified</span>}
                </div>

                <div className="la-options-stack" style={{ marginTop: '0.65rem' }}>
                  {(shuffledOptionsMap[10] || currentQ.options).map((opt, i) => {
                    const isSelected = answers[10]?.selectedId === opt.id;
                    const isSubmitted = answers[10]?.isSubmitted;
                    let cls = 'la-option-btn';
                    if (isSelected) cls += ' selected';
                    if (isSubmitted) {
                      if (opt.isCorrect) cls += ' correct';
                      else if (isSelected) cls += ' incorrect';
                    }

                    return (
                      <button
                        key={opt.id}
                        className={cls}
                        onClick={() => {
                          if (!isSubmitted) updateAnswer(10, { selectedId: opt.id, error: null });
                        }}
                        disabled={isSubmitted}
                      >
                        <span className="la-option-letter">{String.fromCharCode(65 + i)}</span>
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {answers[10]?.error && !answers[10]?.isSubmitted && (
                  <div style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 500 }}>
                    {answers[10]?.error}
                  </div>
                )}

                {!answers[10]?.isSubmitted ? (
                  <div className="la-step-footer-actions between" style={{ marginTop: '0.85rem' }}>
                    <button className="la-btn-secondary" onClick={() => setActiveStep(9)}>
                      ← Back to Question 9
                    </button>
                    <button
                      className="la-btn-primary"
                      disabled={!answers[10]?.selectedId}
                      onClick={() => {
                        const opt = currentQ.options?.find((o) => o.id === answers[10]?.selectedId);
                        if (opt?.isCorrect) {
                          setSliderB(0);
                          updateAnswer(10, { isSubmitted: true, error: null });
                        } else if (answers[10]?.selectedId === 'q10_a_zero') {
                          updateAnswer(10, { error: 'When a = 0, the line is flat horizontal (y = b). It only passes through the origin if b = 0!' });
                        } else if (answers[10]?.selectedId === 'q10_a_one') {
                          updateAnswer(10, { error: 'When a = 1, the equation is y = x + b. It only passes through the origin if b = 0!' });
                        } else {
                          updateAnswer(10, { error: 'Look at slider "b": since "b" gives where the line passes at y, what must "b" be to pass through (0, 0)?' });
                        }
                      }}
                    >
                      Check Answer ✓
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="la-earns-card" style={{ marginTop: '0.85rem' }}>
                      <div className="la-earns-badge">🎉 JOURNEY COMPLETE: CLUSTER 2 MASTERED</div>
                      <p className="la-earns-text">{currentQ.earns}</p>
                      <p className="la-earns-sub">{currentQ.creditExplanation}</p>
                      <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                        <button className="la-btn-secondary" onClick={() => setActiveStep(9)}>
                          ← Back to Question 9
                        </button>
                        <button
                          className="la-btn-primary large"
                          onClick={() => setIsFinished(true)}
                        >
                          Enter The Naming Handover Ceremony 🏆
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="la-bottom-nav">
        <button
          className="la-nav-btn"
          onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
          disabled={activeStep === 1}
        >
          ← Previous Step
        </button>

        <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft, #a89e94)' }}>
          {PATH_META.title} ({completedCount} of {PATH_META.totalQuestions || 10} questions answered)
        </span>

        <button
          className="la-nav-btn"
          onClick={() => {
            if (activeStep < (PATH_META.totalQuestions || 10)) {
              setActiveStep((prev) => prev + 1);
            } else {
              setIsFinished(true);
            }
          }}
          disabled={
            (activeStep === 1 && !hasTwoPoints) ||
            (activeStep === 2 && !answers[2]?.isSubmitted) ||
            (activeStep === 3 && !(hasPointC && hasPointD && hasPointE)) ||
            (activeStep === 4 && !answers[4]?.isSubmitted) ||
            (activeStep === 5 && !answers[5]?.lineDrawn) ||
            (activeStep === 6 && !answers[6]?.isSubmitted) ||
            (activeStep === 7 && !answers[7]?.isSubmitted) ||
            (activeStep === 8 && !answers[8]?.isSubmitted) ||
            (activeStep === 9 && !answers[9]?.isSubmitted) ||
            (activeStep === 10 && !answers[10]?.isSubmitted)
          }
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}
