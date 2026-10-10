import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import './GeoGebraMatrixLab.css';

/**
 * GeoGebraMatrixLab
 *
 * Implements the GeoGebra 2D graphing engine following the exact
 * Tenali mode=kernel & FunctionStudio / LineStudio design language:
 * - Warm parchment card (#fbf7ee, border #d8c6a3, header #6b4a1d)
 * - Graphics-only perspective ('G') with hidden toolbars/menus
 * - Centered Cartesian axes (origin at 0, 0)
 * - Dual-line visualization with distinct Tenali color palettes
 * - Live intersection point pin with coordinate readout and guidelines
 * - Recenter View and Zoom controls
 * - Interactive Intersect function tool for simultaneous equation solving
 * - Active Canvas Objects strip at bottom of card
 */
const GeoGebraMatrixLabComponent = forwardRef(function GeoGebraMatrixLab(
  {
    line1 = null,
    line2 = null,
    intersection = null,
    showIntersection = true,
    showGuidelines = true,
    compact = false,
    allowIntersect = false,
    onIntersect = null
  },
  ref
) {
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
      // 1. Line 1
      try {
        api.deleteObject('Line1');
      } catch (e) {}

      if (line1 && line1.equation) {
        api.evalCommand(`Line1: ${line1.equation}`);
        api.setColor('Line1', 20, 184, 166); // Tenali Teal
        api.setLineThickness('Line1', 4);
        if (line1.display) {
          try {
            api.setCaption('Line1', line1.display);
            api.setLabelStyle('Line1', 3);
          } catch (e) {}
        }
        api.setLabelVisible('Line1', true);
      }

      // 2. Line 2
      try {
        api.deleteObject('Line2');
      } catch (e) {}

      if (line2 && line2.equation) {
        api.evalCommand(`Line2: ${line2.equation}`);
        api.setColor('Line2', 232, 134, 74); // Tenali Amber
        api.setLineThickness('Line2', 4);
        if (line2.display) {
          try {
            api.setCaption('Line2', line2.display);
            api.setLabelStyle('Line2', 3);
          } catch (e) {}
        }
        api.setLabelVisible('Line2', true);
      }

      // 3. Intersection Point & Guidelines
      try {
        api.deleteObject('IntersectionPt');
        api.deleteObject('GuideX');
        api.deleteObject('GuideY');
      } catch (e) {}

      if (showIntersection && intersection && !isNaN(intersection.x) && !isNaN(intersection.y)) {
        const { x, y } = intersection;
        api.evalCommand(`IntersectionPt = (${x}, ${y})`);
        api.setColor('IntersectionPt', 168, 85, 247); // Purple
        api.setPointSize('IntersectionPt', 6);
        api.setLabelStyle('IntersectionPt', 1); // Name & Value
        api.setLabelVisible('IntersectionPt', true);

        if (showGuidelines) {
          // Segment down to x-axis
          api.evalCommand(`GuideX = Segment((${x}, ${y}), (${x}, 0))`);
          api.setColor('GuideX', 168, 85, 247);
          api.setLineStyle('GuideX', 1); // Dashed
          api.setLineThickness('GuideX', 2);
          api.setLabelVisible('GuideX', false);

          // Segment across to y-axis
          api.evalCommand(`GuideY = Segment((${x}, ${y}), (0, ${y}))`);
          api.setColor('GuideY', 168, 85, 247);
          api.setLineStyle('GuideY', 1); // Dashed
          api.setLineThickness('GuideY', 2);
          api.setLabelVisible('GuideY', false);
        }
      }
    } catch (err) {
      console.warn('GeoGebraMatrixLab sync warning:', err);
    }
  }, [line1, line2, intersection, showIntersection, showGuidelines]);

  // Initialize GeoGebra Applet
  useEffect(() => {
    let isMounted = true;
    setIsGgbLoading(true);
    ggbApiRef.current = null;

    ensureGeoGebraLoaded().then((GGBAppletClass) => {
      if (!isMounted || !GGBAppletClass) return;

      const container = geogebraContainerRef.current;
      if (!container) return;
      container.innerHTML = '';

      const containerId = 'matrix-studio-ggb-canvas';
      container.id = containerId;

      const params = {
        id: 'ggbMatrixStudioApplet',
        appName: 'graphing',
        perspective: 'G', // Pure 2D graphics view
        width: 620,
        height: compact ? 220 : 360,
        scaleContainerClass: 'func-lab-canvas-wrapper',
        autoHeight: false,
        allowUpscale: false,
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
            api.setCoordSystem(-6, 10, -4, 10);
            api.evalCommand('SetAxesRatio(1, 1)');
            syncCanvasObjects();
          } catch (err) {
            console.warn('GeoGebra init warning:', err);
          }
        }
      };

      const applet = new GGBAppletClass(params, true);
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

  // Synchronize when dependencies change
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

  // Controls
  const handleIntersect = useCallback(() => {
    const api = ggbApiRef.current;
    if (!api) return;

    try {
      api.evalCommand('IntersectionPt = Intersect(Line1, Line2)');
      api.setColor('IntersectionPt', 168, 85, 247); // Tenali Purple
      api.setPointSize('IntersectionPt', 6);
      api.setLabelStyle('IntersectionPt', 1); // Name & Value
      api.setLabelVisible('IntersectionPt', true);

      const x = api.getXcoord('IntersectionPt');
      const y = api.getYcoord('IntersectionPt');

      if (!isNaN(x) && !isNaN(y)) {
        try {
          api.deleteObject('GuideX');
          api.deleteObject('GuideY');
        } catch (e) {}

        api.evalCommand(`GuideX = Segment((${x}, ${y}), (${x}, 0))`);
        api.setColor('GuideX', 168, 85, 247);
        api.setLineStyle('GuideX', 1); // Dashed
        api.setLineThickness('GuideX', 2);
        api.setLabelVisible('GuideX', false);

        api.evalCommand(`GuideY = Segment((${x}, ${y}), (0, ${y}))`);
        api.setColor('GuideY', 168, 85, 247);
        api.setLineStyle('GuideY', 1); // Dashed
        api.setLineThickness('GuideY', 2);
        api.setLabelVisible('GuideY', false);

        if (onIntersect) {
          onIntersect({
            x: Math.round(x * 100) / 100,
            y: Math.round(y * 100) / 100
          });
        }
      }
    } catch (err) {
      console.warn('GeoGebra intersect execution warning:', err);
    }
  }, [onIntersect]);

  // Expose triggerIntersect to parent component via ref
  useImperativeHandle(ref, () => ({
    triggerIntersect: handleIntersect
  }), [handleIntersect]);

  // When allowIntersect is true, allow clicking directly on lines on the canvas to trigger intersect
  useEffect(() => {
    const api = ggbApiRef.current;
    if (!api || isGgbLoading || !allowIntersect) return;

    const onObjectClick = (objName) => {
      if (objName === 'Line1' || objName === 'Line2' || objName === 'IntersectionPt') {
        handleIntersect();
      }
    };

    try {
      api.registerObjectClickListener('Line1', onObjectClick);
      api.registerObjectClickListener('Line2', onObjectClick);
    } catch (e) {}

    return () => {
      try {
        api.unregisterObjectClickListener('Line1');
        api.unregisterObjectClickListener('Line2');
      } catch (e) {}
    };
  }, [allowIntersect, isGgbLoading, handleIntersect]);

  const handleRecenter = () => {
    if (ggbApiRef.current) {
      if (intersection && !isNaN(intersection.x) && !isNaN(intersection.y)) {
        const { x, y } = intersection;
        const minX = Math.min(x, 0) - 3;
        const maxX = Math.max(x, 0) + 3;
        const minY = Math.min(y, 0) - 3;
        const maxY = Math.max(y, 0) + 3;
        ggbApiRef.current.setCoordSystem(minX, maxX, minY, maxY);
        ggbApiRef.current.evalCommand('SetAxesRatio(1, 1)');
      } else {
        ggbApiRef.current.setCoordSystem(-6, 10, -4, 10);
        ggbApiRef.current.evalCommand('SetAxesRatio(1, 1)');
      }
    }
  };

  const handleZoom = (factor) => {
    if (ggbApiRef.current && ggbApiRef.current.zoomIn) {
      if (factor > 1) {
        ggbApiRef.current.zoomIn(1.2);
      } else {
        ggbApiRef.current.zoomIn(0.833);
      }
    }
  };

  return (
    <div className="func-lab-root">
      {/* 1. TOP: GRAPH CARD */}
      <div className={`func-lab-graph-card ${compact ? 'compact' : ''}`}>
        <div className="func-lab-graph-header">
          <span className="func-lab-tag">Linear System Coordinate Canvas</span>
          <div className="func-lab-header-actions">
            {allowIntersect && (
              <button
                className="func-lab-small-btn highlight"
                onClick={handleIntersect}
                title="Use GeoGebra's Intersect function to find where lines meet"
              >
                ⨉ Intersect Lines
              </button>
            )}
            <button className="func-lab-small-btn" onClick={() => handleZoom(1.2)} title="Zoom In">
              + Zoom
            </button>
            <button className="func-lab-small-btn" onClick={() => handleZoom(0.8)} title="Zoom Out">
              − Zoom
            </button>
            <button className="func-lab-small-btn" onClick={handleRecenter} title="Recenter View">
              ⟲ Recenter
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
        {(line1 || line2 || (showIntersection && intersection)) && (
          <div className="func-lab-objects-strip">
            <span style={{ fontWeight: 600 }}>Active Canvas Objects:</span>
            {line1 && (
              <span className="func-lab-object-chip">
                <span className="func-lab-object-dot" style={{ backgroundColor: '#14b8a6' }} />
                {line1.display || line1.equation}
              </span>
            )}
            {line2 && (
              <span className="func-lab-object-chip">
                <span className="func-lab-object-dot" style={{ backgroundColor: '#e8864a' }} />
                {line2.display || line2.equation}
              </span>
            )}
            {showIntersection && intersection && !isNaN(intersection.x) && !isNaN(intersection.y) && (
              <span className="func-lab-object-chip">
                <span className="func-lab-object-dot" style={{ backgroundColor: '#a855f7' }} />
                Crossing P({intersection.x}, {intersection.y})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

function arePropsEqual(prevProps, nextProps) {
  if (prevProps.compact !== nextProps.compact) return false;
  if (prevProps.showIntersection !== nextProps.showIntersection) return false;
  if (prevProps.showGuidelines !== nextProps.showGuidelines) return false;
  if (prevProps.allowIntersect !== nextProps.allowIntersect) return false;

  const l1Equal =
    prevProps.line1?.equation === nextProps.line1?.equation &&
    prevProps.line1?.display === nextProps.line1?.display;
  const l2Equal =
    prevProps.line2?.equation === nextProps.line2?.equation &&
    prevProps.line2?.display === nextProps.line2?.display;
  const intEqual =
    prevProps.intersection?.x === nextProps.intersection?.x &&
    prevProps.intersection?.y === nextProps.intersection?.y;

  return l1Equal && l2Equal && intEqual;
}

export default React.memo(GeoGebraMatrixLabComponent, arePropsEqual);
