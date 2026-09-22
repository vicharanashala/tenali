import React, { useState, useEffect, useRef, useCallback } from 'react';
import './GeoGebraPointPlotter.css';

/**
 * GeoGebraPointPlotter
 *
 * Interactive GeoGebra Lab component with the tactile UI styling of mode=kernel.
 * Features an embedded 2D coordinate plane canvas, real-time plotting via an input
 * box below, preset quick-chips, point management tray, and educational insights.
 */
export default function GeoGebraPointPlotter({ onPointPlotted }) {
  const [inputVal, setInputVal] = useState('');
  const [plottedPoints, setPlottedPoints] = useState([]);
  const [lastPlotted, setLastPlotted] = useState(null);
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

      const containerId = 'la-ggb-point-plotter-canvas';
      container.id = containerId;

      const params = {
        id: 'ggbPointPlotterApplet',
        appName: 'graphing',
        perspective: 'G', // Graphics view only: clean Cartesian grid
        width: 620,
        height: 330,
        showToolBar: false,
        showAlgebraInput: false, // We use our custom input box below
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
            // Standard Cartesian bounds around origin
            api.setCoordSystem(-7, 7, -5, 5);

            // Re-plot any existing points
            plottedPoints.forEach((pt) => {
              api.evalCommand(`${pt.name} = (${pt.x}, ${pt.y})`);
              api.setColor(pt.name, 232, 134, 74);
              api.setPointSize(pt.name, 5);
              api.setLabelVisible(pt.name, true);
              api.setLabelStyle(pt.name, 1);
            });
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

  // Core Point Plotting Handler
  const handlePlotPoint = (explicitStr) => {
    const raw = (typeof explicitStr === 'string' ? explicitStr : inputVal).trim();
    if (!raw) return;

    // Strict pattern matching (parentheses and comma are strictly required):
    // 1) Named: "A = (3, 5)" or "P = (-2, 4)"
    // 2) Unnamed: "(3, 5)" or "(-2, 4)"
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

      // Assign next available letter
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
      setFeedback({
        type: 'error',
        msg: 'Strict syntax required! Coordinates must be enclosed in parentheses and separated by a comma, e.g. (2, 3) or A = (2, 3).'
      });
      return;
    }

    const newPoint = { name: ptName, x, y };

    // Execute in GeoGebra API if connected
    if (ggbApiRef.current) {
      const api = ggbApiRef.current;
      try {
        api.evalCommand(`${ptName} = (${x}, ${y})`);
        api.setColor(ptName, 232, 134, 74); // Brand warm accent (#e8864a)
        api.setPointSize(ptName, 5);
        api.setLabelVisible(ptName, true);
        api.setLabelStyle(ptName, 1); // 1 = Name + Value label
      } catch (err) {
        console.warn('GeoGebra plot warning:', err);
      }
    }

    setPlottedPoints((prev) => {
      const filtered = prev.filter((p) => p.name !== ptName);
      return [...filtered, newPoint];
    });

    setLastPlotted(newPoint);
    setFeedback({
      type: 'success',
      msg: `Point ${ptName} successfully plotted at (${x}, ${y}) on the plane!`
    });
    setInputVal('');

    if (onPointPlotted) {
      onPointPlotted(newPoint);
    }
  };

  // Remove individual point
  const handleRemovePoint = (name) => {
    if (ggbApiRef.current) {
      try {
        ggbApiRef.current.deleteObject(name);
      } catch (e) {}
    }
    setPlottedPoints((prev) => prev.filter((p) => p.name !== name));
    if (lastPlotted?.name === name) {
      setLastPlotted(null);
    }
  };

  // Clear all points
  const handleClearAll = () => {
    if (ggbApiRef.current) {
      try {
        plottedPoints.forEach((p) => {
          ggbApiRef.current.deleteObject(p.name);
        });
      } catch (e) {}
    }
    setPlottedPoints([]);
    setLastPlotted(null);
    setFeedback(null);
  };

  // Center coordinate view
  const handleCenterView = () => {
    if (ggbApiRef.current) {
      try {
        ggbApiRef.current.setCoordSystem(-7, 7, -5, 5);
      } catch (e) {}
    }
  };

  return (
    <div className="la-ggb-plotter-root">
      {/* 1. Main Graph Card (mode=kernel design language) */}
      <div className="kp-graph-card la-ggb-graph-card">
        {/* Header with Title and Status Badges */}
        <div className="kp-graph-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="kp-card-title" style={{ color: '#6b4a1d' }}>
              GeoGebra 2D Plane
            </span>
            <span className="kp-badge" style={{ background: '#f1e4cb', color: '#5a3f1c', borderColor: '#d8c6a3' }}>
              {plottedPoints.length} {plottedPoints.length === 1 ? 'Point' : 'Points'} Plotted
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="la-ggb-small-btn"
              onClick={handleCenterView}
              title="Recenter Coordinate Axes"
            >
              Reset View 🎯
            </button>
          </div>
        </div>

        {/* Viewport: Interactive GeoGebra Plane */}
        <div className="kp-geogebra-wrapper la-ggb-canvas-wrapper">
          {isGgbLoading && (
            <div className="kp-geogebra-loading">
              <div className="kp-geogebra-spinner" />
              <span>Loading GeoGebra Cartesian Engine...</span>
            </div>
          )}
          <div
            id="la-ggb-point-plotter-canvas"
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
          {plottedPoints.length > 0 && (
            <button className="la-ggb-clear-btn" onClick={handleClearAll}>
              Clear Board 🧹
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Input Box Card (mode=kernel design language) */}
      <div className="kp-card la-ggb-control-card">
        <div className="kp-card-header">
          <span className="kp-card-title">Input Point to Plot on GeoGebra</span>
          <span className="kp-badge">Syntax: (x, y)</span>
        </div>

        {/* The Point Input Field */}
        <div className="la-ggb-input-row">
          <div className="la-ggb-input-container">
            <span className="la-ggb-input-prefix">📍</span>
            <input
              type="text"
              className="la-ggb-input-box"
              placeholder="e.g. (3, 5) or A = (-2, 4)"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePlotPoint();
              }}
              autoFocus
            />
          </div>
          <button
            className="la-ggb-submit-btn"
            onClick={() => handlePlotPoint()}
            disabled={!inputVal.trim() || isGgbLoading}
          >
            Plot Point 🚀
          </button>
        </div>

        {/* Educational Feedback / Confirmation Card */}
        {feedback && (
          <div className={`la-ggb-feedback-card ${feedback.type}`}>
            <div className="la-ggb-feedback-header">
              <span>{feedback.type === 'success' ? '✨ SUCCESS' : '💡 NOTICE'}</span>
            </div>
            <p className="la-ggb-feedback-text">{feedback.msg}</p>
            {feedback.type === 'success' && lastPlotted && (
              <p className="la-ggb-feedback-subtext">
                Look at the coordinate grid: The dot is a visible stand-in marking <strong>({lastPlotted.x}, {lastPlotted.y})</strong>. The <em>point</em> itself has zero width and zero height — it is purely that location!
              </p>
            )}
          </div>
        )}

        {/* Plotted Points Tray */}
        {plottedPoints.length > 0 && (
          <div className="kp-tray la-ggb-tray">
            <div className="kp-tray-title">Active Points on Board:</div>
            <div className="kp-tray-pills">
              {plottedPoints.map((pt) => (
                <div key={pt.name} className="la-ggb-point-tag">
                  <span className="la-ggb-tag-text">
                    📍 <strong>{pt.name}</strong> = ({pt.x}, {pt.y})
                  </span>
                  <button
                    className="la-ggb-tag-del"
                    onClick={() => handleRemovePoint(pt.name)}
                    title={`Delete ${pt.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
