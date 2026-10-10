import React, { useState, useEffect, useRef, useCallback } from 'react';
import './GeoGebraLineLab.css';

/**
 * GeoGebraLineLab
 *
 * Implements the GeoGebra 2D graphing engine following the exact
 * Tenali mode=kernel design language:
 * - Warm parchment card (#fbf7ee, border #d8c6a3, header #6b4a1d)
 * - Graphics-only perspective ('G') with hidden toolbars/menus
 * - Centered Cartesian axes (origin at 0, 0)
 * - Real-time synchronization of points (A..F), lineAB, origin lines, and y = a*x + b
 * - Recenter View and Clear buttons
 */
export default function GeoGebraLineLab({
  sliderA = 2,
  sliderB = 0,
  onSliderChange,
  plottedPoints = [],
  onPointPlotted,
  validatePoint,
  onClearPoints,
  onLineDrawn,
  showLineAB = false,
  linePoint1Name = 'A',
  linePoint2Name = 'B',
  showOriginLines = false,
  showParametricLine = true,
  showEquationDisplay = true,
  interactiveSliders = true,
  onSliderInteracted,
  inputPlaceholder = "e.g. (x, y) or Name = (x, y) or Line(A, B)",
  showInputBar = true,
  inputSubmitLabel = "Plot on Canvas 🚀",
  taskHeader = null,
  coordBounds = null
}) {
  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isGgbLoading, setIsGgbLoading] = useState(true);

  const geogebraContainerRef = useRef(null);
  const ggbApiRef = useRef(null);

  // Helper to ensure GeoGebra deployggb.js is available
  const ensureGeoGebraLoaded = useCallback(() => {
    if (window.GGBApplet) return Promise.resolve(window.GGBApplet);
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (window.GGBApplet) {
          clearInterval(interval);
          resolve(window.GGBApplet);
        }
      }, 50);
      setTimeout(() => {
        clearInterval(interval);
        if (window.GGBApplet) {
          resolve(window.GGBApplet);
        } else {
          setIsGgbLoading(false);
          resolve(null);
        }
      }, 6000);
    });
  }, []);

  // Format equation: y = ax + b
  const formatEquationDisplay = (a, b) => {
    let aPart = '';
    if (a === 1) aPart = 'x';
    else if (a === -1) aPart = '-x';
    else if (a === 0) aPart = '';
    else aPart = `${a}x`;

    let bPart = '';
    if (b > 0) {
      bPart = aPart ? ` + ${b}` : `${b}`;
    } else if (b < 0) {
      bPart = aPart ? ` - ${Math.abs(b)}` : `-${Math.abs(b)}`;
    } else if (b === 0) {
      bPart = aPart ? '' : '0';
    }

    const rightSide = aPart ? (bPart ? `${aPart}${bPart}` : aPart) : (bPart || '0');
    return `y = ${rightSide}`;
  };

  // Sync state into GeoGebra canvas
  const syncCanvasObjects = useCallback(() => {
    const api = ggbApiRef.current;
    if (!api) return;

    try {
      // 1. Sync Plotted Points: delete points from GeoGebra that are no longer in plottedPoints
      const allGgbPoints = api.getAllObjectNames('point') || [];
      const currentPlottedNames = new Set(plottedPoints.map((p) => p.name));

      allGgbPoints.forEach((ptName) => {
        if (ptName !== 'yInterceptPt' && !currentPlottedNames.has(ptName)) {
          try {
            api.deleteObject(ptName);
          } catch (e) {}
        }
      });

      // Plot/update active points
      plottedPoints.forEach((pt) => {
        api.evalCommand(`${pt.name} = (${pt.x}, ${pt.y})`);
        api.setColor(pt.name, 232, 134, 74); // Warm brand accent
        api.setPointSize(pt.name, 5);
        api.setLabelVisible(pt.name, true);
        api.setLabelStyle(pt.name, 1);
      });

      // 2. Line(A, B) connection - only connect if user has plotted the points
      if (showLineAB) {
        const p1 = linePoint1Name || 'A';
        const p2 = linePoint2Name || 'B';
        if (api.exists(p1) && api.exists(p2)) {
          api.evalCommand(`lineAB: Line(${p1}, ${p2})`);
          api.setColor('lineAB', 20, 184, 166); // Teal
          api.setLineThickness('lineAB', 4);
          api.setLabelVisible('lineAB', false);
        }
      } else {
        try { api.deleteObject('lineAB'); } catch (e) {}
      }

      // 3. Origin lines family (Q6)
      if (showOriginLines) {
        api.evalCommand('line1: y = x');
        api.setColor('line1', 59, 130, 246); // Blue
        api.setLineThickness('line1', 3);
        api.setLabelVisible('line1', false);

        api.evalCommand('line2: y = 2*x');
        api.setColor('line2', 232, 134, 74); // Orange
        api.setLineThickness('line2', 4);
        api.setLabelVisible('line2', false);

        api.evalCommand('line3: y = 10*x');
        api.setColor('line3', 168, 85, 247); // Purple
        api.setLineThickness('line3', 3);
        api.setLabelVisible('line3', false);
      } else {
        try {
          api.deleteObject('line1');
          api.deleteObject('line2');
          api.deleteObject('line3');
        } catch (e) {}
      }

      // 4. Parametric Line y = a*x + b
      if (showParametricLine) {
        const cmd = `paramLine: y = ${sliderA} * x + ${sliderB}`;
        api.evalCommand(cmd);
        api.setColor('paramLine', 232, 134, 74);
        api.setLineThickness('paramLine', 4);
        api.setLabelVisible('paramLine', false);

        api.evalCommand(`yInterceptPt = (0, ${sliderB})`);
        api.setColor('yInterceptPt', 20, 184, 166);
        api.setPointSize('yInterceptPt', 5);
        api.setLabelVisible('yInterceptPt', false);
      } else {
        try {
          api.deleteObject('paramLine');
          api.deleteObject('yInterceptPt');
        } catch (e) {}
      }
    } catch (err) {
      console.warn('GeoGebra sync warning:', err);
    }
  }, [plottedPoints, showLineAB, showOriginLines, showParametricLine, sliderA, sliderB]);

  // Initialize GeoGebra Applet
  useEffect(() => {
    let isMounted = true;
    setIsGgbLoading(true);
    ggbApiRef.current = null;

    ensureGeoGebraLoaded().then((GGBApplet) => {
      if (!isMounted || !GGBApplet) return;

      const container = geogebraContainerRef.current;
      if (!container) return;
      container.innerHTML = '';

      const containerId = 'line-studio-ggb-canvas';
      container.id = containerId;

      const params = {
        id: 'ggbLineStudioApplet',
        appName: 'graphing',
        perspective: 'G', // Pure 2D graphics view
        width: 620,
        height: 350,
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false,
        showResetIcon: false,
        allowStyleBar: false,
        showSuggestions: false,
        enableShiftDragZoom: true,
        enableRightClick: false,
        errorDialogsActive: false,
        useBrowserForJS: false,
        borderColor: '#e3d3b7',
        appletOnLoad: (api) => {
          if (!isMounted) return;
          ggbApiRef.current = api;
          setIsGgbLoading(false);

          try {
            api.setPerspective('G');
            api.evalCommand('SetPerspective("G")');
            // 1:1 isometric square grid with points A..F and origin visible
            if (coordBounds) {
              api.setCoordSystem(coordBounds.xmin, coordBounds.xmax, coordBounds.ymin, coordBounds.ymax);
            } else {
              api.setCoordSystem(-6, 12, -3, 13);
            }
            api.evalCommand('SetAxesRatio(1, 1)');
            syncCanvasObjects();
          } catch (err) {
            console.warn('GeoGebra init warning:', err);
          }
        }
      };

      const applet = new GGBApplet(params, true);
      applet.inject(containerId);
    });

    return () => {
      isMounted = false;
      if (geogebraContainerRef.current) {
        geogebraContainerRef.current.innerHTML = '';
      }
      ggbApiRef.current = null;
    };
  }, [ensureGeoGebraLoaded]);

  // Dynamic coordinate bounding update (e.g. framing all 5 points in Question 3)
  useEffect(() => {
    const api = ggbApiRef.current;
    if (!api || isGgbLoading) return;
    try {
      if (coordBounds) {
        api.setCoordSystem(coordBounds.xmin, coordBounds.xmax, coordBounds.ymin, coordBounds.ymax);
      } else {
        api.setCoordSystem(-6, 12, -3, 13);
      }
      api.evalCommand('SetAxesRatio(1, 1)');
    } catch (err) {
      console.warn('GeoGebra coordBounds update warning:', err);
    }
  }, [coordBounds?.xmin, coordBounds?.xmax, coordBounds?.ymin, coordBounds?.ymax, isGgbLoading]);

  // Synchronize when state dependencies change
  useEffect(() => {
    if (ggbApiRef.current && !isGgbLoading) {
      syncCanvasObjects();
    }
  }, [syncCanvasObjects, isGgbLoading]);

  // Reset feedback and input value when question/placeholder changes or input bar toggles
  useEffect(() => {
    setFeedback(null);
    setInputVal('');
  }, [inputPlaceholder, showInputBar]);

  // Strict Point or Command Plot Handler
  const handlePlotInput = (explicitStr) => {
    const raw = (typeof explicitStr === 'string' ? explicitStr : inputVal).trim();
    if (!raw) return;

    // Check for Line command: Line(A, B)
    const lineCmdMatch = raw.match(/^line\s*\(\s*([a-zA-Z]+)\s*,\s*([a-zA-Z]+)\s*\)$/i);
    if (lineCmdMatch) {
      if (ggbApiRef.current) {
        try {
          const pt1 = lineCmdMatch[1].toUpperCase();
          const pt2 = lineCmdMatch[2].toUpperCase();
          ggbApiRef.current.evalCommand(`lineAB: Line(${pt1}, ${pt2})`);
          ggbApiRef.current.setColor('lineAB', 20, 184, 166);
          ggbApiRef.current.setLineThickness('lineAB', 4);
          setFeedback({
            type: 'success',
            msg: `Line successfully drawn through points ${pt1} and ${pt2}!`
          });
          setInputVal('');
          if (onLineDrawn) {
            onLineDrawn({ pt1, pt2 });
          }
        } catch (e) {
          setFeedback({ type: 'error', msg: 'Could not connect points. Make sure both points are plotted first.' });
        }
      }
      return;
    }

    // Strict point pattern: Name = (x, y) or (x, y)
    // Parentheses and comma are mandatory!
    const namedMatch = raw.match(/^([A-Za-z]+)\s*=\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)$/);
    const coordsMatch = raw.match(/^\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)$/);

    let ptName = '';
    let x = 0;
    let y = 0;

    if (namedMatch) {
      ptName = namedMatch[1].toUpperCase();
      x = parseFloat(namedMatch[2]);
      y = parseFloat(namedMatch[3]);
    } else if (coordsMatch) {
      x = parseFloat(coordsMatch[1]);
      y = parseFloat(coordsMatch[2]);

      const existingNames = new Set(plottedPoints.map((p) => p.name));
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let i = 0; i < alphabet.length; i++) {
        if (!existingNames.has(alphabet[i])) {
          ptName = alphabet[i];
          break;
        }
      }
      if (!ptName) ptName = `P_{${plottedPoints.length + 1}}`;
    } else {
      // Diagnostic error message based on input
      if (/^line/i.test(raw)) {
        setFeedback({
          type: 'error',
          msg: 'Strict syntax required for line: Use Line(A, B), with uppercase Line and parentheses.'
        });
      } else if (!raw.includes('(') || !raw.includes(')')) {
        setFeedback({
          type: 'error',
          msg: 'Strict syntax error: Coordinates must be enclosed in parentheses e.g. A = (1, 2) or (1, 2).'
        });
      } else if (!raw.includes(',')) {
        setFeedback({
          type: 'error',
          msg: 'Strict syntax error: Coordinates must be separated by a comma e.g. A = (1, 2) or (1, 2).'
        });
      } else {
        setFeedback({
          type: 'error',
          msg: 'Strict syntax required: Format must be Name = (x, y) or (x, y), e.g. A = (1, 2) or (1, 2).'
        });
      }
      return;
    }

    // Custom validation (e.g. for Question 3 pattern movement validation)
    if (validatePoint) {
      const validation = validatePoint({ name: ptName, x, y });
      if (validation && !validation.isValid) {
        setFeedback({
          type: 'error',
          title: validation.title || '⚠️ MOVEMENT NOT CORRECT',
          msg: validation.error || 'The entered point does not follow the correct movement pattern.'
        });
        return; // Reject plotting: do not draw on canvas or register point
      }
      if (validation && validation.correctedName) {
        ptName = validation.correctedName;
      }
    }

    const newPoint = { name: ptName, x, y };

    if (ggbApiRef.current) {
      try {
        ggbApiRef.current.evalCommand(`${ptName} = (${x}, ${y})`);
        ggbApiRef.current.setColor(ptName, 232, 134, 74);
        ggbApiRef.current.setPointSize(ptName, 5);
        ggbApiRef.current.setLabelVisible(ptName, true);
        ggbApiRef.current.setLabelStyle(ptName, 1);
      } catch (err) {
        console.warn('GeoGebra plot warning:', err);
      }
    }

    if (onPointPlotted) {
      onPointPlotted(newPoint);
    }

    setFeedback({
      type: 'success',
      msg: `Point ${ptName} successfully plotted at (${x}, ${y})!`
    });
    setInputVal('');
  };

  const handleRecenter = () => {
    if (ggbApiRef.current) {
      try {
        if (coordBounds) {
          ggbApiRef.current.setCoordSystem(coordBounds.xmin, coordBounds.xmax, coordBounds.ymin, coordBounds.ymax);
          ggbApiRef.current.evalCommand('SetAxesRatio(1, 1)');
          return;
        }
        if (plottedPoints && plottedPoints.length >= 2) {
          const xs = plottedPoints.map((p) => p.x);
          const ys = plottedPoints.map((p) => p.y);
          const minX = Math.min(...xs, 0);
          const maxX = Math.max(...xs, 5);
          const minY = Math.min(...ys, 0);
          const maxY = Math.max(...ys, 5);
          const padX = Math.max(3, (maxX - minX) * 0.35);
          const padY = Math.max(3, (maxY - minY) * 0.35);
          ggbApiRef.current.setCoordSystem(minX - padX, maxX + padX, minY - padY, maxY + padY);
        } else {
          ggbApiRef.current.setCoordSystem(-6, 12, -3, 13);
        }
        ggbApiRef.current.evalCommand('SetAxesRatio(1, 1)');
      } catch (e) {}
    }
  };

  const handleClear = () => {
    const api = ggbApiRef.current;
    if (api) {
      try {
        const pts = api.getAllObjectNames('point') || [];
        pts.forEach((ptName) => {
          if (ptName !== 'yInterceptPt') {
            try {
              api.deleteObject(ptName);
            } catch (e) {}
          }
        });
        if (!showLineAB) {
          try {
            api.deleteObject('lineAB');
          } catch (e) {}
        }
      } catch (e) {
        console.warn('Error clearing points from GeoGebra:', e);
      }
    }
    if (onClearPoints) {
      onClearPoints();
    }
    setFeedback(null);
  };

  const handleSliderAChange = (e) => {
    const val = parseFloat(e.target.value);
    if (onSliderChange) onSliderChange(val, sliderB);
    if (onSliderInteracted) onSliderInteracted('a', val);
  };

  const handleSliderBChange = (e) => {
    const val = parseFloat(e.target.value);
    if (onSliderChange) onSliderChange(sliderA, val);
    if (onSliderInteracted) onSliderInteracted('b', val);
  };

  return (
    <div className="line-lab-root">
      {/* 1. Main Graph Card — Tenali mode=kernel design language */}
      <div className="kp-graph-card line-lab-graph-card">
        <div className="kp-graph-header">
          <span className="kp-card-title" style={{ color: '#6b4a1d' }}>
            GeoGebra 2D Cartesian Space
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showParametricLine && showEquationDisplay && (
              <span className="kp-badge" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fcd34d', fontWeight: 600 }}>
                {formatEquationDisplay(sliderA, sliderB)}
              </span>
            )}
            {plottedPoints.length > 0 && (
              <span className="kp-badge" style={{ background: '#f1e4cb', color: '#5a3f1c', borderColor: '#d8c6a3', fontWeight: 600 }}>
                {plottedPoints.length} {plottedPoints.length === 1 ? 'Point' : 'Points'}
              </span>
            )}
            <button
              className="line-lab-small-btn"
              onClick={handleRecenter}
              title="Recenter Coordinate Axes"
            >
              Reset View 🎯
            </button>
          </div>
        </div>

        {/* Viewport: GeoGebra Plane */}
        <div className="kp-geogebra-wrapper line-lab-canvas-wrapper">
          {isGgbLoading && (
            <div className="kp-geogebra-loading">
              <div className="kp-geogebra-spinner" />
              <span>Loading GeoGebra 2D Cartesian Engine...</span>
            </div>
          )}
          <div
            id="line-studio-ggb-canvas"
            ref={geogebraContainerRef}
            className="kp-geogebra-container"
            style={{ opacity: isGgbLoading ? 0 : 1 }}
          />
        </div>

        {/* Footer with Guidance */}
        <div className="kp-graph-footer">
          <div className="kp-graph-instruction">
            Axes meet at origin <strong>(0, 0)</strong>. Drag to pan around the plane, or use scroll to zoom.
          </div>
          {plottedPoints.length > 0 && onClearPoints && (
            <button className="line-lab-clear-btn" onClick={handleClear}>
              Clear Points 🧹
            </button>
          )}
        </div>
      </div>

      {/* Task Prompt / Header (Placed directly ABOVE the input boxes) */}
      {taskHeader && (
        <div className="line-lab-task-header-block" style={{ marginTop: '0.65rem', marginBottom: '0.35rem' }}>
          {taskHeader}
        </div>
      )}

      {/* 2. Interactive Sliders Tray (When in slider mode) */}
      {interactiveSliders && showParametricLine && (
        <div className="line-lab-sliders-tray">
          <div className="line-lab-tray-header">
            <span className="line-lab-tray-title">
              {showEquationDisplay ? 'Live Knobs: y = a·x + b' : 'Live Knobs: "a" and "b"'}
            </span>
            {showEquationDisplay && (
              <span className="line-lab-formula-pill">
                {formatEquationDisplay(sliderA, sliderB)}
              </span>
            )}
          </div>

          <div className="line-lab-sliders-grid">
            {/* Slider a: Steepness / Tilt */}
            <div className="line-lab-slider-row">
              <div className="line-lab-slider-meta">
                <span className="line-lab-knob-name">
                  Knob <strong>a</strong>
                </span>
                <span className="line-lab-val-badge">a = {sliderA > 0 ? `+${sliderA}` : sliderA}</span>
              </div>
              <div className="line-lab-slider-track">
                <button
                  type="button"
                  className="line-lab-stepper-btn"
                  onClick={() => {
                    const next = Math.max(-5, sliderA - 1);
                    if (onSliderChange) onSliderChange(next, sliderB);
                    if (onSliderInteracted) onSliderInteracted('a', next);
                  }}
                >
                  −
                </button>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.5"
                  value={sliderA}
                  onChange={handleSliderAChange}
                  className="line-lab-range"
                />
                <button
                  type="button"
                  className="line-lab-stepper-btn"
                  onClick={() => {
                    const next = Math.min(5, sliderA + 1);
                    if (onSliderChange) onSliderChange(next, sliderB);
                    if (onSliderInteracted) onSliderInteracted('a', next);
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Slider b: Where the line crosses y-axis */}
            <div className="line-lab-slider-row">
              <div className="line-lab-slider-meta">
                <span className="line-lab-knob-name">
                  Knob <strong>b</strong>
                </span>
                <span className="line-lab-val-badge">b = {sliderB > 0 ? `+${sliderB}` : sliderB}</span>
              </div>
              <div className="line-lab-slider-track">
                <button
                  type="button"
                  className="line-lab-stepper-btn"
                  onClick={() => {
                    const next = Math.max(-6, sliderB - 1);
                    if (onSliderChange) onSliderChange(sliderA, next);
                    if (onSliderInteracted) onSliderInteracted('b', next);
                  }}
                >
                  −
                </button>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  step="1"
                  value={sliderB}
                  onChange={handleSliderBChange}
                  className="line-lab-range"
                />
                <button
                  type="button"
                  className="line-lab-stepper-btn"
                  onClick={() => {
                    const next = Math.min(6, sliderB + 1);
                    if (onSliderChange) onSliderChange(sliderA, next);
                    if (onSliderInteracted) onSliderInteracted('b', next);
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Input Bar for Coordinate / Command Plotting (When in point mode) */}
      {!interactiveSliders && showInputBar && (
        <div className="line-lab-control-tray">
          <div className="line-lab-tray-header">
            <span className="line-lab-tray-title">GeoGebra Command / Coordinate Input</span>
            <span className="kp-badge" style={{ fontWeight: 600 }}>Strict Syntax: Name = (x, y) or Line(A, B)</span>
          </div>

          <div className="line-lab-input-row">
            <div className="line-lab-input-container">
              <span className="line-lab-input-prefix">✏️</span>
              <input
                type="text"
                className="line-lab-input-box"
                placeholder={inputPlaceholder}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePlotInput();
                }}
              />
            </div>
            <button
              className="line-lab-submit-btn"
              onClick={() => handlePlotInput()}
              disabled={!inputVal.trim() || isGgbLoading}
            >
              {inputSubmitLabel}
            </button>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div className={`line-lab-feedback-card ${feedback.type}`}>
              <div className="line-lab-feedback-header">
                <span>{feedback.title || (feedback.type === 'success' ? '✨ SUCCESS' : '💡 NOTICE')}</span>
              </div>
              <p className="line-lab-feedback-text">{feedback.msg}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
