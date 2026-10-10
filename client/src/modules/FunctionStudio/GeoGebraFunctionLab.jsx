import React, { useState, useEffect, useRef, useCallback } from 'react';
import './GeoGebraFunctionLab.css';

/**
 * GeoGebraFunctionLab
 *
 * Implements the interactive 2D function graphing engine:
 * - 1:1 isometric Cartesian coordinate grid with centered axes
 * - Live parsing and visualization of curves (y = x^2), lines (y = x + 5),
 *   V-shapes (y = abs(x)), implicit relations (y^2 = x), and named functions (f(x), g(x))
 * - Interactive point plotting (A, B, C...) with distinct coordinates and styling
 * - Recenter and Clear controls
 * - Top-level canvas with mid-level GeoGebra command input bar
 */
export default function GeoGebraFunctionLab({
  plottedPoints = [],
  plottedRules = [],
  activeLine = null,
  targetX = null,
  targetY = null,
  verifiedPoints = [],
  onPointPlotted,
  onRuleEntered,
  onClearCanvas,
  inputPlaceholder = 'e.g. y = x^2 or f(x) = x^2 or A = (-2, 4)',
  suggestedShortcuts = [],
  showInputBar = false,
  compact = false,
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

  // Sync state into GeoGebra canvas
  const syncCanvasObjects = useCallback(() => {
    const api = ggbApiRef.current;
    if (!api) return;

    try {
      // 1. Sync Active Line / Function
      const activeLineId = 'mainGraphLine';
      try {
        api.deleteObject('mainLine');
        api.deleteObject(activeLineId);
      } catch (e) {}

      if (activeLine && activeLine.cmd) {
        api.evalCommand(`${activeLineId}: y = ${activeLine.cmd}`);
        const color = activeLine.color || [232, 134, 74]; // Tenali Amber
        api.setColor(activeLineId, color[0], color[1], color[2]);
        api.setLineThickness(activeLineId, 5);
        if (activeLine.label) {
          try {
            api.setCaption(activeLineId, activeLine.label);
            api.setLabelStyle(activeLineId, 3);
          } catch (e) {}
        }
        api.setLabelVisible(activeLineId, true);
      }

      // 2. Sync Target X & Target Y Guidelines (trace guidelines)
      try {
        api.deleteObject('targetGuide');
        api.deleteObject('targetGuideY');
      } catch (e) {}

      if (targetX !== null && targetX !== undefined) {
        api.evalCommand(`targetGuide: x = ${targetX}`);
        api.setColor('targetGuide', 20, 184, 166); // Tenali Teal
        api.setLineStyle('targetGuide', 1); // Dashed
        api.setLineThickness('targetGuide', 2);
        api.setLabelVisible('targetGuide', false);
      }

      if (targetY !== null && targetY !== undefined) {
        api.evalCommand(`targetGuideY: y = ${targetY}`);
        api.setColor('targetGuideY', 232, 134, 74); // Tenali Amber
        api.setLineStyle('targetGuideY', 1); // Dashed
        api.setLineThickness('targetGuideY', 2);
        api.setLabelVisible('targetGuideY', false);
      }

      // 3. Sync Verified Points
      const allVerifiedNames = new Set(verifiedPoints.map((p, i) => p.name || `P_${i + 1}`));
      verifiedPoints.forEach((pt, i) => {
        const ptName = pt.name || `P_${i + 1}`;
        try {
          api.deleteObject(ptName);
        } catch (e) {}
        api.evalCommand(`${ptName} = (${pt.x}, ${pt.y})`);
        api.setColor(ptName, 20, 184, 166); // Tenali Teal
        api.setPointSize(ptName, 7);
        if (pt.label) {
          try {
            api.setCaption(ptName, pt.label);
            api.setLabelStyle(ptName, 3);
          } catch (e) {}
        } else {
          api.setLabelStyle(ptName, 1); // 1 = Name & Value
        }
        api.setLabelVisible(ptName, true);
      });

      // 4. Sync custom plottedPoints
      const currentCustomPointNames = new Set(plottedPoints.map((p) => p.name));
      plottedPoints.forEach((pt) => {
        api.evalCommand(`${pt.name} = (${pt.x}, ${pt.y})`);
        api.setColor(pt.name, 232, 134, 74);
        api.setPointSize(pt.name, 6);
        api.setLabelVisible(pt.name, true);
        api.setLabelStyle(pt.name, 1);
      });

      // 5. Clean up any leftover points
      const allAllowedPoints = new Set([...allVerifiedNames, ...currentCustomPointNames]);
      const allGgbPoints = api.getAllObjectNames('point') || [];
      allGgbPoints.forEach((ptName) => {
        if (!allAllowedPoints.has(ptName)) {
          try {
            api.deleteObject(ptName);
          } catch (e) {}
        }
      });

      // 6. Sync Plotted Rules
      const existingRules = new Set(plottedRules.map((r) => r.id));
      const allFunctions = [
        ...(api.getAllObjectNames('function') || []),
        ...(api.getAllObjectNames('line') || []),
        ...(api.getAllObjectNames('implicitpoly') || [])
      ];

      allFunctions.forEach((objName) => {
        if (objName === 'targetGuide' || objName === 'targetGuideY' || objName === activeLineId) return;
        if (!existingRules.has(objName) && !allAllowedPoints.has(objName)) {
          try {
            api.deleteObject(objName);
          } catch (e) {}
        }
      });

      plottedRules.forEach((rule) => {
        api.evalCommand(`${rule.id}: ${rule.cmd}`);
        if (rule.color) {
          api.setColor(rule.id, rule.color[0], rule.color[1], rule.color[2]);
        }
        api.setLineThickness(rule.id, 4);
        api.setLabelVisible(rule.id, true);
      });
    } catch (err) {
      console.warn('GeoGebra sync warning:', err);
    }
  }, [activeLine, targetX, targetY, verifiedPoints, plottedPoints, plottedRules]);

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

      const containerId = 'function-studio-ggb-canvas';
      container.id = containerId;

      const params = {
        id: 'ggbFunctionStudioApplet',
        appName: 'graphing',
        perspective: 'G', // Pure 2D graphics view
        width: 620,
        height: compact ? 220 : 360,
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
            // Centered Cartesian viewport fitting lines and curves
            const b = coordBounds || { xmin: -6, xmax: 10, ymin: -4, ymax: 12 };
            api.setCoordSystem(b.xmin, b.xmax, b.ymin, b.ymax);
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

  // Dynamic coordinate bounding update (e.g. Question 8 & evaluation framing)
  useEffect(() => {
    const api = ggbApiRef.current;
    if (!api || isGgbLoading) return;
    try {
      const b = coordBounds || { xmin: -6, xmax: 10, ymin: -4, ymax: 12 };
      api.setCoordSystem(b.xmin, b.xmax, b.ymin, b.ymax);
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

  // Dynamically resize GeoGebra viewport when compact mode toggles
  useEffect(() => {
    const api = ggbApiRef.current;
    if (api && !isGgbLoading) {
      try {
        const targetH = compact ? 220 : 360;
        const container = geogebraContainerRef.current;
        const targetW = container?.clientWidth || 620;
        if (typeof api.setSize === 'function') {
          api.setSize(targetW, targetH);
        }
      } catch (err) {
        console.warn('GeoGebra resize warning:', err);
      }
    }
  }, [compact, isGgbLoading]);

  // Robust Normalizer for Mathematical Inputs
  const normalizeInput = (raw) => {
    let s = raw.trim();
    // Replace superscript powers
    s = s.replace(/²/g, '^2').replace(/³/g, '^3');
    // Replace |x| with abs(x)
    s = s.replace(/\|([^|]+)\|/g, 'abs($1)');
    return s;
  };

  // Plot Input Handler: supports points, rules, implicit equations
  const handlePlotInput = (explicitStr) => {
    const raw = (typeof explicitStr === 'string' ? explicitStr : inputVal).trim();
    if (!raw) return;

    const normalized = normalizeInput(raw);
    const api = ggbApiRef.current;

    // 1. Check for Point: Name = (x, y) or (x, y)
    const namedPointMatch = normalized.match(/^([A-Za-z]+)\s*=\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)$/);
    const coordPointMatch = normalized.match(/^\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)$/);

    if (namedPointMatch || coordPointMatch) {
      let ptName = '';
      let x = 0;
      let y = 0;

      if (namedPointMatch) {
        ptName = namedPointMatch[1].toUpperCase();
        x = parseFloat(namedPointMatch[2]);
        y = parseFloat(namedPointMatch[3]);
      } else {
        x = parseFloat(coordPointMatch[1]);
        y = parseFloat(coordPointMatch[2]);
        const existingNames = new Set(plottedPoints.map((p) => p.name));
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < alphabet.length; i++) {
          if (!existingNames.has(alphabet[i])) {
            ptName = alphabet[i];
            break;
          }
        }
        if (!ptName) ptName = `P_{${plottedPoints.length + 1}}`;
      }

      if (api) {
        try {
          api.evalCommand(`${ptName} = (${x}, ${y})`);
          api.setColor(ptName, 232, 134, 74);
          api.setPointSize(ptName, 6);
          api.setLabelVisible(ptName, true);
        } catch (e) {
          console.warn('Point plot warning:', e);
        }
      }

      if (onPointPlotted) {
        onPointPlotted({ name: ptName, x, y });
      }

      setFeedback({
        type: 'success',
        msg: `Point ${ptName} plotted at (${x}, ${y})!`
      });
      setInputVal('');
      return;
    }

    // 2. Check for Implicit Curve: y^2 = x
    const implicitMatch = normalized.match(/^y\s*\^\s*2\s*=\s*x$/i);
    if (implicitMatch) {
      const ruleId = 'curve_y2_x';
      if (api) {
        try {
          api.evalCommand(`${ruleId}: y^2 = x`);
          api.setColor(ruleId, 239, 68, 68); // Red/Rose to highlight pattern-breaker
          api.setLineThickness(ruleId, 4);
        } catch (e) {
          console.warn('Implicit eval warning:', e);
        }
      }

      if (onRuleEntered) {
        onRuleEntered({
          id: ruleId,
          name: 'y² = x',
          cmd: 'y^2 = x',
          color: [239, 68, 68],
          isBreaker: true,
          raw
        });
      }

      setFeedback({
        type: 'info',
        msg: 'Rule y² = x plotted! Notice the two branches meeting at (0, 0).'
      });
      setInputVal('');
      return;
    }

    // 3. Check for Named Function: f(x) = ... or g(x) = ... or name(x) = ...
    const namedFuncMatch = normalized.match(/^([a-zA-Z]+)\s*\(\s*x\s*\)\s*=\s*(.+)$/i);
    if (namedFuncMatch) {
      const funcName = namedFuncMatch[1].toLowerCase();
      const rhs = namedFuncMatch[2].trim();
      const ruleId = `func_${funcName}`;
      const cmd = `${funcName}(x) = ${rhs}`;

      // Distinguish colors: f -> Tenali amber, g -> teal, others -> sky blue
      let color = [20, 184, 166];
      if (funcName === 'f') color = [232, 134, 74]; // Tenali Amber
      else if (funcName === 'g') color = [20, 184, 166]; // Tenali Teal
      else color = [59, 130, 246]; // Blue

      if (api) {
        try {
          api.evalCommand(`${ruleId}: ${cmd}`);
          api.setColor(ruleId, color[0], color[1], color[2]);
          api.setLineThickness(ruleId, 4);
        } catch (e) {
          console.warn('Named function eval warning:', e);
        }
      }

      if (onRuleEntered) {
        onRuleEntered({
          id: ruleId,
          name: `${funcName}(x) = ${rhs}`,
          cmd,
          funcName,
          rhs,
          color,
          raw
        });
      }

      setFeedback({
        type: 'success',
        msg: `Rule "${funcName}" defined as ${funcName}(x) = ${rhs}!`
      });
      setInputVal('');
      return;
    }

    // 4. Check for Standard Explicit Rule: y = ...
    const explicitRuleMatch = normalized.match(/^y\s*=\s*(.+)$/i);
    if (explicitRuleMatch) {
      const rhs = explicitRuleMatch[1].trim();
      const ruleId = `rule_${rhs.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const cmd = `y = ${rhs}`;

      let color = [20, 184, 166]; // Teal default
      if (rhs.includes('^2') || rhs.includes('²')) color = [232, 134, 74]; // Tenali Amber for x^2
      else if (rhs.includes('+') || rhs.includes('-')) color = [20, 184, 166]; // Teal for lines
      else if (rhs.includes('abs')) color = [217, 119, 6]; // Warm Amber for abs

      if (api) {
        try {
          api.evalCommand(`${ruleId}: ${cmd}`);
          api.setColor(ruleId, color[0], color[1], color[2]);
          api.setLineThickness(ruleId, 4);
        } catch (e) {
          console.warn('Explicit rule eval warning:', e);
        }
      }

      if (onRuleEntered) {
        onRuleEntered({
          id: ruleId,
          name: `y = ${rhs}`,
          cmd,
          rhs,
          color,
          raw
        });
      }

      setFeedback({
        type: 'success',
        msg: `Rule y = ${rhs} plotted on canvas!`
      });
      setInputVal('');
      return;
    }

    // 5. Bare Expression Shorthand (e.g. "x^2", "x + 5", "abs(x)")
    if (['x^2', 'x+5', 'abs(x)', 'x^3', 'sin(x)'].some((p) => normalized.replace(/\s+/g, '').includes(p))) {
      const cmd = `y = ${normalized}`;
      const ruleId = `rule_${normalized.replace(/[^a-zA-Z0-9]/g, '_')}`;

      if (api) {
        try {
          api.evalCommand(`${ruleId}: ${cmd}`);
          api.setColor(ruleId, 124, 58, 237);
          api.setLineThickness(ruleId, 4);
        } catch (e) {}
      }

      if (onRuleEntered) {
        onRuleEntered({
          id: ruleId,
          name: `y = ${normalized}`,
          cmd,
          color: [124, 58, 237],
          raw
        });
      }

      setFeedback({
        type: 'success',
        msg: `Rule y = ${normalized} plotted!`
      });
      setInputVal('');
      return;
    }

    // Fallback: syntax diagnostic feedback
    setFeedback({
      type: 'error',
      msg: 'Format not recognized. Try: y = x^2, f(x) = x^2, y^2 = x, or Point A = (-2, 4).'
    });
  };

  const handleRecenter = () => {
    if (ggbApiRef.current) {
      try {
        const b = coordBounds || { xmin: -6, xmax: 10, ymin: -4, ymax: 12 };
        ggbApiRef.current.setCoordSystem(b.xmin, b.xmax, b.ymin, b.ymax);
        ggbApiRef.current.evalCommand('SetAxesRatio(1, 1)');
      } catch (e) {}
    }
  };

  const handleClear = () => {
    const api = ggbApiRef.current;
    if (api) {
      try {
        const allNames = api.getAllObjectNames();
        allNames.forEach((name) => {
          try {
            api.deleteObject(name);
          } catch (e) {}
        });
      } catch (e) {}
    }
    if (onClearCanvas) {
      onClearCanvas();
    }
    setFeedback({ type: 'info', msg: 'Canvas cleared.' });
  };

  return (
    <div className="func-lab-root">
      {/* 1. TOP: GRAPH CARD */}
      <div className={`func-lab-graph-card ${compact ? 'compact' : ''}`}>
        <div className="func-lab-graph-header">
          <span className="func-lab-tag">Function Coordinate Canvas</span>
          <div className="func-lab-header-actions">
            <button className="func-lab-small-btn" onClick={handleRecenter} title="Recenter View">
              ⟲ Recenter
            </button>
            <button className="func-lab-small-btn" onClick={handleClear} title="Clear Canvas">
              ✕ Clear
            </button>
          </div>
        </div>

        <div className={`func-lab-canvas-wrapper ${compact ? 'compact' : ''}`}>
          {isGgbLoading && (
            <div className="func-lab-geogebra-loading">
              <div className="func-lab-geogebra-spinner" />
              <span>Loading GeoGebra Coordinate Canvas...</span>
            </div>
          )}
          <div
            ref={geogebraContainerRef}
            className="func-lab-geogebra-container"
            style={{ opacity: isGgbLoading ? 0.3 : 1 }}
          />
        </div>

        {/* Live Plotted Objects Indicator */}
        {(activeLine || verifiedPoints.length > 0 || plottedPoints.length > 0 || plottedRules.length > 0) && (
          <div className="func-lab-objects-strip">
            <span style={{ fontWeight: 600 }}>Active Canvas Objects:</span>
            {activeLine && (
              <span className="func-lab-object-chip">
                <span className="func-lab-object-dot" style={{ backgroundColor: '#e8864a' }} />
                {activeLine.label || `y = ${activeLine.cmd}`}
              </span>
            )}
            {verifiedPoints.map((p, i) => (
              <span key={p.name || i} className="func-lab-object-chip">
                <span className="func-lab-object-dot" style={{ backgroundColor: '#14b8a6' }} />
                {p.name || `P_${i + 1}`} ({p.x}, {p.y})
              </span>
            ))}
            {plottedRules.map((r) => (
              <span key={r.id} className="func-lab-object-chip">
                <span
                  className="func-lab-object-dot"
                  style={{
                    backgroundColor: r.color
                      ? `rgb(${r.color[0]}, ${r.color[1]}, ${r.color[2]})`
                      : '#e8864a'
                  }}
                />
                {r.name}
              </span>
            ))}
            {plottedPoints.map((p) => (
              <span key={p.name} className="func-lab-object-chip">
                <span className="func-lab-object-dot" style={{ backgroundColor: '#e8864a' }} />
                {p.name} ({p.x}, {p.y})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. MIDDLE: INPUT BAR (OPTIONAL) */}
      {showInputBar && (
        <div className="func-lab-input-card">
          <div className="func-lab-input-row">
            <input
              type="text"
              className="func-lab-input-field"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePlotInput();
              }}
              placeholder={inputPlaceholder}
              aria-label="GeoGebra Command Input"
            />
            <button className="func-lab-plot-btn" onClick={() => handlePlotInput()}>
              Plot on Canvas 🚀
            </button>
          </div>

          {/* Shortcuts for active step */}
          {suggestedShortcuts && suggestedShortcuts.length > 0 && (
            <div className="func-lab-shortcuts">
              <span className="func-lab-shortcut-label">Quick Commands:</span>
              {suggestedShortcuts.map((sc, i) => (
                <button
                  key={i}
                  type="button"
                  className="func-lab-shortcut-chip"
                  onClick={() => {
                    setInputVal(sc);
                    handlePlotInput(sc);
                  }}
                >
                  {sc}
                </button>
              ))}
            </div>
          )}

          {feedback && (
            <div className={`func-lab-feedback ${feedback.type}`}>
              {feedback.msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
