import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './KernelPlayground.css';

const STAGES = {
  1: {
    id: 1,
    is3D: false,
    name: 'Stage 1: 2D Plane (2 Values)',
    title: 'The 2-Value Balance',
    subtitle: 'Move x₁ and x₂ to steer the combined output to 0.00.',
    tip: 'Move the sliders. Notice how the blue output dot moves across the plane. Steer it onto the origin target (0, 0)!',
    desc: 'You discovered that active values can cancel out to zero! In Stage 2, three values move your output through 3D space.'
  },
  2: {
    id: 2,
    is3D: true,
    name: 'Stage 2: 3D Space (3 Values)',
    title: 'The 3-Way Equilibrium',
    subtitle: 'Move x₁, x₂, and x₃ to navigate the output in 3D space to 0.00.',
    tip: 'Drag to rotate 3D space. Find a non-zero combination of x₁, x₂, and x₃ that brings the output dot onto the origin (0, 0, 0).',
    desc: 'Brilliant! You found a non-zero combination where the output collapses to zero! In Stage 3, let us see if this balance holds along an entire line.'
  },
  3: {
    id: 3,
    is3D: true,
    name: 'Stage 3: The Infinite Line',
    title: 'Scaling the Equilibrium',
    subtitle: 'Discover how many different active combinations can collapse the output to 0.',
    tip: 'You found one balance! Now try doubling all 3 values, or inverting their signs. Does the output stay at 0.00?',
    desc: 'Master of Equilibrium! You proved that it is not just one magic input—there is an entire line of combinations that all collapse to zero!'
  }
};

export default function KernelPlayground({ onBack }) {
  const [currentStage, setCurrentStage] = useState(1);
  const [completedStages, setCompletedStages] = useState(new Set());

  // Sliders: x1, x2, x3
  const [valA, setValA] = useState(2);
  const [valB, setValB] = useState(1);
  const [valC, setValC] = useState(1);

  // Kernel line visibility toggle
  const [showKernel, setShowKernel] = useState(false);

  // View mode: 'canvas' (default ultra-smooth) or 'geogebra' (embed)
  const [viewMode, setViewMode] = useState('geogebra');

  // Stage 3: Found kernel points list
  const [foundPoints, setFoundPoints] = useState([]);

  // Active focused slider for keyboard navigation
  const [focusedSlider, setFocusedSlider] = useState(null);

  // GeoGebra API integration refs & loading state
  const geogebraContainerRef = useRef(null);
  const ggbApiRef = useRef(null);
  const [isGgbLoading, setIsGgbLoading] = useState(true);

  // Helper to ensure GeoGebra deployggb.js is loaded
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
        if (window.GGBApplet) resolve(window.GGBApplet);
      }, 8000);
    });
  }, []);

  // Canvas ref and 3D rotation state (pitch rotX, yaw rotY)
  const canvasRef = useRef(null);
  const [rotX, setRotX] = useState(0.38);
  const [rotY, setRotY] = useState(-0.55);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Celebration state
  const [celebratedThisStage, setCelebratedThisStage] = useState(false);
  const [showRevealCard, setShowRevealCard] = useState(false);

  const confettiCanvasRef = useRef(null);
  const confettiAnimId = useRef(null);

  // Current stage config
  const stageConfig = STAGES[currentStage];
  const is3D = stageConfig.is3D;

  // Calculate output distance without showing matrix/calculations:
  // Matrix 2x2: [[1,2],[3,6]] -> output = sqrt((x1 + 2x2)^2 + (3x1 + 6x2)^2)
  // Matrix 3x3: [[1,2,3],[4,5,6],[7,8,9]] -> output = sqrt((x1+2x2+3x3)^2 + (4x1+5x2+6x3)^2 + (7x1+8x2+9x3)^2)
  const { offset, proximity, isTrivialZero, isBalanced, outputVec } = useMemo(() => {
    const isAllZero = valA === 0 && valB === 0 && (!is3D || valC === 0);

    if (!is3D) {
      const r1 = 1 * valA + 2 * valB;
      const r2 = 3 * valA + 6 * valB;
      const dist = Math.sqrt(r1 * r1 + r2 * r2);
      const balanced = dist < 0.05 && !isAllZero;
      const prox = Math.max(0, Math.round((1 - Math.min(dist, 25) / 25) * 100));
      return { 
        offset: dist, 
        proximity: prox, 
        isTrivialZero: isAllZero, 
        isBalanced: balanced,
        outputVec: [r1, r2, 0]
      };
    } else {
      const r1 = 1 * valA + 2 * valB + 3 * valC;
      const r2 = 4 * valA + 5 * valB + 6 * valC;
      const r3 = 7 * valA + 8 * valB + 9 * valC;
      const dist = Math.sqrt(r1 * r1 + r2 * r2 + r3 * r3);
      const balanced = dist < 0.05 && !isAllZero;
      const prox = Math.max(0, Math.round((1 - Math.min(dist, 40) / 40) * 100));
      return { 
        offset: dist, 
        proximity: prox, 
        isTrivialZero: isAllZero, 
        isBalanced: balanced,
        outputVec: [r1, r2, r3]
      };
    }
  }, [valA, valB, valC, is3D]);

  // 3D Projection Helper
  const project3D = useCallback((x, y, z, width, height) => {
    const scale = 22;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;

    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    return {
      sx: width / 2 + x1 * scale,
      sy: height / 2 - y2 * scale,
      depth: z2
    };
  }, [rotX, rotY]);

  // 2D Projection Helper
  const project2D = useCallback((x, y, width, height) => {
    const scale = 24;
    return {
      sx: width / 2 + x * scale,
      sy: height / 2 - y * scale
    };
  }, []);

  // GeoGebra Applet Lifecycle (Mount / Unmount / Stage Switch)
  useEffect(() => {
    if (viewMode !== 'geogebra') return;

    let isMounted = true;
    setIsGgbLoading(true);
    ggbApiRef.current = null;

    ensureGeoGebraLoaded().then((GGBApplet) => {
      if (!isMounted || !GGBApplet) return;

      const container = geogebraContainerRef.current;
      if (!container) return;
      container.innerHTML = '';

      const containerId = `kp-ggb-element-${is3D ? '3d' : '2d'}`;
      container.id = containerId;

      const params = {
        id: is3D ? 'ggbApplet3D' : 'ggbApplet2D',
        appName: is3D ? '3d' : 'graphing',
        perspective: is3D ? 'T' : 'G', // Strictly Graphics-only perspective (hides algebra view/equations completely)
        width: 600,
        height: 330,
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
            // Enforce Graphics / 3D-only perspective to ensure algebra sidebar is closed and hidden
            api.setPerspective(is3D ? 'T' : 'G');
            api.evalCommand(`SetPerspective("${is3D ? 'T' : 'G'}")`);

            // Configure coordinate bounds to comfortably view the entire output range
            if (is3D) {
              api.setCoordSystem(-80, 80, -80, 80, -80, 80, false);
              api.evalCommand('Target = (0, 0, 0)');
              api.evalCommand(`Output = (${outputVec[0]}, ${outputVec[1]}, ${outputVec[2]})`);
            } else {
              api.setCoordSystem(-22, 22, -60, 60);
              api.evalCommand('Target = (0, 0)');
              api.evalCommand(`Output = (${outputVec[0]}, ${outputVec[1]})`);
            }

            // Target styling (fixed origin target)
            api.setColor('Target', 180, 140, 60);
            api.setPointSize('Target', 3);
            api.setPointStyle('Target', 1);
            api.setFixed('Target', true, false);
            api.setCaption('Target', is3D ? 'Target (0, 0, 0)' : 'Target (0, 0)');
            api.setLabelVisible('Target', true);

            // Output styling (Free point - must NOT be fixed so setCoords moves it)
            api.setFixed('Output', false);
            if (isBalanced) {
              api.setColor('Output', 16, 185, 129);
              api.setPointSize('Output', 5);
              api.setCaption('Output', 'Output: 0.00 ✨');
            } else {
              api.setColor('Output', 30, 85, 190);
              api.setPointSize('Output', 4);
              api.setCaption('Output', `Output (${offset.toFixed(2)})`);
            }
            api.setLabelVisible('Output', true);

            // Guide segment connecting Target to Output
            api.evalCommand('Guide = Segment(Target, Output)');
            api.setColor('Guide', 120, 120, 120);
            api.setLineStyle('Guide', 2);
            api.setLineThickness('Guide', 1);
            api.setLabelVisible('Guide', false);

            // Trajectory path to 0
            if (is3D) {
              api.evalCommand('Path = Line(Target, Output)');
            } else {
              api.evalCommand('Path = Line((0, 0), (1, 3))');
            }
            api.setColor('Path', 5, 150, 105);
            api.setLineStyle('Path', 2);
            api.setLineThickness('Path', 1);
            api.setLabelVisible('Path', false);
            api.setVisible('Path', showKernel);
          } catch (err) {
            console.warn('GeoGebra init objects warning:', err);
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
  }, [viewMode, is3D, ensureGeoGebraLoaded]);

  // Real-time synchronization with GeoGebra API on slider changes
  useEffect(() => {
    if (viewMode !== 'geogebra' || !ggbApiRef.current) return;
    const api = ggbApiRef.current;

    try {
      // Ensure Output point is unfixed so coordinates update smoothly
      api.setFixed('Output', false);

      const x = outputVec[0];
      const y = outputVec[1];
      const z = is3D ? outputVec[2] : 0;

      if (is3D) {
        api.setCoords('Output', x, y, z);
        api.evalCommand(`SetCoords(Output, ${x}, ${y}, ${z})`);
      } else {
        api.setCoords('Output', x, y);
        api.evalCommand(`SetCoords(Output, ${x}, ${y})`);
      }

      if (isBalanced) {
        api.setColor('Output', 16, 185, 129);
        api.setPointSize('Output', 5);
        api.setCaption('Output', 'Output: 0.00 ✨');
      } else {
        api.setColor('Output', 30, 85, 190);
        api.setPointSize('Output', 4);
        api.setCaption('Output', `Output (${offset.toFixed(2)})`);
      }

      api.setVisible('Path', showKernel);
      if (is3D && showKernel && offset > 0.1) {
        api.evalCommand(`Path = Line((0, 0, 0), (${x}, ${y}, ${z}))`);
        api.setColor('Path', 5, 150, 105);
        api.setLineStyle('Path', 2);
        api.setLineThickness('Path', 1);
        api.setVisible('Path', true);
      }
    } catch (e) {
      console.warn('GeoGebra sync warning:', e);
    }
  }, [outputVec, isBalanced, offset, showKernel, is3D, viewMode, isGgbLoading]);

  // Draw Graph on Canvas (Plotting Output Space, Collapsing to Origin at 0.00)
  useEffect(() => {
    if (viewMode !== 'canvas') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#fbf7ee';
    ctx.fillRect(0, 0, width, height);

    if (is3D) {
      // 3D Output Space Rendering
      const axisLen = 6.5;

      // Draw 3 Axes (y1, y2, y3) in soft warm sand/brown colors
      const axes = [
        { name: 'y₁', color: '#bfa068', from: [-axisLen, 0, 0], to: [axisLen, 0, 0] },
        { name: 'y₂', color: '#a8894d', from: [0, -axisLen, 0], to: [0, axisLen, 0] },
        { name: 'y₃', color: '#c4aa79', from: [0, 0, -axisLen], to: [0, 0, axisLen] }
      ];

      axes.forEach(axis => {
        const p1 = project3D(axis.from[0], axis.from[1], axis.from[2], width, height);
        const p2 = project3D(axis.to[0], axis.to[1], axis.to[2], width, height);

        ctx.beginPath();
        ctx.strokeStyle = axis.color;
        ctx.lineWidth = 1.5;
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();

        // Axis end label
        ctx.fillStyle = '#8a6e3d';
        ctx.font = 'bold 11px -apple-system, sans-serif';
        ctx.fillText(axis.name, p2.sx + 4, p2.sy + 4);
      });

      // Target Origin Marker at (0, 0, 0) (Sleek GeoGebra style)
      const originPt = project3D(0, 0, 0, width, height);
      ctx.beginPath();
      ctx.arc(originPt.sx, originPt.sy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isBalanced ? '#10b981' : '#bfa068';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(originPt.sx, originPt.sy, 7, 0, Math.PI * 2);
      ctx.strokeStyle = isBalanced ? 'rgba(16, 185, 129, 0.6)' : 'rgba(191, 160, 104, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isBalanced ? '#065f46' : '#8a6e3d';
      ctx.font = 'bold 10px ui-monospace, sans-serif';
      ctx.fillText('Target (0, 0, 0)', originPt.sx + 8, originPt.sy + 16);

      // Trajectory Guide to 0 when showKernel is toggled
      if (showKernel) {
        const dist = offset;
        const dir = dist > 0.01 
          ? [outputVec[0] / dist, outputVec[1] / dist, outputVec[2] / dist]
          : [0.577, 0.577, 0.577];
        const tLen = 5.5;
        const kp1 = project3D(-dir[0] * tLen, -dir[1] * tLen, -dir[2] * tLen, width, height);
        const kp2 = project3D(dir[0] * tLen, dir[1] * tLen, dir[2] * tLen, width, height);

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 5]);
        ctx.moveTo(kp1.sx, kp1.sy);
        ctx.lineTo(kp2.sx, kp2.sy);
        ctx.stroke();
        ctx.restore();

        // Guide label tag
        ctx.fillStyle = '#065f46';
        ctx.font = 'bold 11px ui-monospace, sans-serif';
        ctx.fillText('Path to 0.00', kp2.sx + 6, kp2.sy + 4);
      }

      // Compute visual position of Output vector:
      const r1 = outputVec[0];
      const r2 = outputVec[1];
      const r3 = outputVec[2];
      const dist = offset;

      let visX = 0;
      let visY = 0;
      let visZ = 0;
      if (dist > 0.001) {
        let visDist = dist / 6.0;
        if (visDist > 5.5) {
          visDist = 5.5 + 0.8 * Math.tanh((visDist - 5.5) / 2.5);
        }
        visX = (r1 / dist) * visDist;
        visY = (r2 / dist) * visDist;
        visZ = (r3 / dist) * visDist;
      }

      const pt = project3D(visX, visY, visZ, width, height);

      // Dashed displacement guide line from Origin to Output Point
      if (dist > 0.05) {
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = proximity >= 80 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(30, 85, 190, 0.45)';
        ctx.lineWidth = 1;
        ctx.moveTo(originPt.sx, originPt.sy);
        ctx.lineTo(pt.sx, pt.sy);
        ctx.stroke();
        ctx.restore();
      }

      // Outer glow if balanced
      if (isBalanced) {
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, 9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.fill();
      }

      // Output dot (Thin, sleek GeoGebra style)
      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, isBalanced ? 4.5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isBalanced ? '#10b981' : '#1e55be';
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Label next to output dot
      ctx.fillStyle = isBalanced ? '#065f46' : '#1e3a8a';
      ctx.font = 'bold 12px -apple-system, sans-serif';
      if (isBalanced) {
        ctx.fillText('✨ Output: 0.00 (Balanced!)', pt.sx + 10, pt.sy - 8);
      } else {
        ctx.fillText(`Output (${dist.toFixed(2)})`, pt.sx + 10, pt.sy - 8);
      }

    } else {
      // 2D Output Space Rendering
      const axisLen = 6;

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(216, 198, 163, 0.35)';
      ctx.lineWidth = 0.75;
      for (let g = -6; g <= 6; g += 2) {
        const h1 = project2D(-6, g, width, height);
        const h2 = project2D(6, g, width, height);
        ctx.beginPath();
        ctx.moveTo(h1.sx, h1.sy);
        ctx.lineTo(h2.sx, h2.sy);
        ctx.stroke();

        const v1 = project2D(g, -6, width, height);
        const v2 = project2D(g, 6, width, height);
        ctx.beginPath();
        ctx.moveTo(v1.sx, v1.sy);
        ctx.lineTo(v2.sx, v2.sy);
        ctx.stroke();
      }

      // Axes y1 and y2
      const ax1 = project2D(-axisLen, 0, width, height);
      const ax2 = project2D(axisLen, 0, width, height);
      ctx.beginPath();
      ctx.strokeStyle = '#a8894d';
      ctx.lineWidth = 1.8;
      ctx.moveTo(ax1.sx, ax1.sy);
      ctx.lineTo(ax2.sx, ax2.sy);
      ctx.stroke();

      const ay1 = project2D(0, -axisLen, width, height);
      const ay2 = project2D(0, axisLen, width, height);
      ctx.beginPath();
      ctx.strokeStyle = '#a8894d';
      ctx.lineWidth = 1.8;
      ctx.moveTo(ay1.sx, ay1.sy);
      ctx.lineTo(ay2.sx, ay2.sy);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = '#8a6e3d';
      ctx.font = 'bold 11px -apple-system, sans-serif';
      ctx.fillText('y₁', ax2.sx - 14, ax2.sy - 8);
      ctx.fillText('y₂', ay2.sx + 8, ay2.sy + 14);

      // Target Origin Marker at (0, 0) (Sleek GeoGebra style)
      const originPt = project2D(0, 0, width, height);
      ctx.beginPath();
      ctx.arc(originPt.sx, originPt.sy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isBalanced ? '#10b981' : '#a8894d';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(originPt.sx, originPt.sy, 7, 0, Math.PI * 2);
      ctx.strokeStyle = isBalanced ? 'rgba(16, 185, 129, 0.6)' : 'rgba(168, 137, 77, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isBalanced ? '#065f46' : '#8a6e3d';
      ctx.font = 'bold 10px ui-monospace, sans-serif';
      ctx.fillText('Target (0, 0)', originPt.sx + 8, originPt.sy + 16);

      // Trajectory line to 0 when showKernel is on: line y2 = 3*y1
      if (showKernel) {
        const kp1 = project2D(-1.8, -5.4, width, height);
        const kp2 = project2D(1.8, 5.4, width, height);

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 5]);
        ctx.moveTo(kp1.sx, kp1.sy);
        ctx.lineTo(kp2.sx, kp2.sy);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#065f46';
        ctx.font = 'bold 11px ui-monospace, sans-serif';
        ctx.fillText('Path to 0.00', kp2.sx + 6, kp2.sy + 4);
      }

      // Compute visual position of Output vector:
      const r1 = outputVec[0];
      const r2 = outputVec[1];
      const dist = offset;

      let visX = 0;
      let visY = 0;
      if (dist > 0.001) {
        let visDist = dist / 2.8;
        if (visDist > 5.2) {
          visDist = 5.2 + 0.6 * Math.tanh((visDist - 5.2) / 2.0);
        }
        visX = (r1 / dist) * visDist;
        visY = (r2 / dist) * visDist;
      }

      const pt = project2D(visX, visY, width, height);

      // Dashed displacement guide line from Origin to Output Point
      if (dist > 0.05) {
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = proximity >= 80 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(30, 85, 190, 0.45)';
        ctx.lineWidth = 1;
        ctx.moveTo(originPt.sx, originPt.sy);
        ctx.lineTo(pt.sx, pt.sy);
        ctx.stroke();
        ctx.restore();
      }

      // Outer glow if balanced
      if (isBalanced) {
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, 9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.fill();
      }

      // Output dot (Thin, sleek GeoGebra style)
      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, isBalanced ? 4.5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isBalanced ? '#10b981' : '#1e55be';
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Label next to output dot
      ctx.fillStyle = isBalanced ? '#065f46' : '#1e3a8a';
      ctx.font = 'bold 12px -apple-system, sans-serif';
      if (isBalanced) {
        ctx.fillText('✨ Output: 0.00 (Balanced!)', pt.sx + 10, pt.sy - 8);
      } else {
        ctx.fillText(`Output (${dist.toFixed(2)})`, pt.sx + 10, pt.sy - 8);
      }
    }
  }, [viewMode, is3D, valA, valB, valC, rotX, rotY, showKernel, isBalanced, outputVec, offset, proximity, project3D, project2D]);

  // Mouse drag handlers for 3D rotation
  const handleMouseDown = (e) => {
    if (!is3D) return;
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !is3D) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => prev + dx * 0.012);
    setRotX((prev) => Math.max(-1.4, Math.min(1.4, prev + dy * 0.012)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch drag handlers
  const handleTouchStart = (e) => {
    if (!is3D || e.touches.length === 0) return;
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || !is3D || e.touches.length === 0) return;
    const dx = e.touches[0].clientX - lastMousePosRef.current.x;
    const dy = e.touches[0].clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    setRotY((prev) => prev + dx * 0.015);
    setRotX((prev) => Math.max(-1.4, Math.min(1.4, prev + dy * 0.015)));
  };

  // Randomize away from zero
  const handleRandomize = (stg = currentStage) => {
    if (stg === 1) {
      setValA(Math.floor(Math.random() * 5) + 1);
      setValB(Math.floor(Math.random() * 5) + 1);
      setValC(0);
    } else {
      setValA(Math.floor(Math.random() * 5) + 1);
      setValB(Math.floor(Math.random() * 5) + 1);
      setValC(Math.floor(Math.random() * 5) - 3 || 2);
    }
  };

  // Switch stage
  const handleSwitchStage = (stg) => {
    setCurrentStage(stg);
    setCelebratedThisStage(false);
    setShowKernel(false);
    handleRandomize(stg);
  };

  // Handle equilibrium detection
  useEffect(() => {
    if (isBalanced && !celebratedThisStage) {
      setCelebratedThisStage(true);
      setCompletedStages((prev) => new Set([...prev, currentStage]));

      if (currentStage === 3) {
        setShowRevealCard(true);
        const pt = `(${valA}, ${valB}, ${valC})`;
        setFoundPoints((prev) => (!prev.includes(pt) ? [...prev, pt] : prev));
      }
    }
  }, [isBalanced, celebratedThisStage, currentStage, valA, valB, valC]);

  // Stage 3 track points
  useEffect(() => {
    if (currentStage === 3 && isBalanced) {
      const pt = `(${valA}, ${valB}, ${valC})`;
      setFoundPoints((prev) => (!prev.includes(pt) ? [...prev, pt] : prev));
    }
  }, [isBalanced, currentStage, valA, valB, valC]);

  // Confetti effect
  useEffect(() => {
    if (!isBalanced) return;
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#f8b414', '#dc2641', '#1e55be'];
    const particles = Array.from({ length: 45 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2 - 80,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.6) * 14,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 6
    }));

    let frame = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.rotation += p.spin;
        p.alpha -= 0.015;
        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });
      frame++;
      if (alive && frame < 85) {
        confettiAnimId.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    render();

    return () => {
      if (confettiAnimId.current) cancelAnimationFrame(confettiAnimId.current);
    };
  }, [isBalanced]);

  return (
    <div className="kp-wrapper">
      <canvas
        ref={confettiCanvasRef}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}
      />

      {/* Top Bar with Navigation */}
      <div className="kp-top-nav">
        {onBack && (
          <button className="kp-back-btn" onClick={onBack}>
            ← Back to Tenali
          </button>
        )}
      </div>

      {/* Header */}
      <div className="kp-header">
        <h1 className="kp-title">The Zero Balance</h1>
        <p className="kp-subtitle">
          {stageConfig.subtitle}
        </p>
      </div>

      {/* Stage Stepper */}
      <div className="kp-stepper">
        {[1, 2, 3].map((stg) => (
          <button
            key={stg}
            className={`kp-step-btn ${currentStage === stg ? 'active' : ''}`}
            onClick={() => handleSwitchStage(stg)}
          >
            <span>Stage {stg}</span>
            {completedStages.has(stg) && <span className="kp-check-badge">✓</span>}
          </button>
        ))}
      </div>

      {/* Graph Card */}
      <div className="kp-graph-card">
        <div className="kp-graph-header">
          <span className="kp-card-title" style={{ color: '#6b4a1d' }}>
            {is3D ? '3D Output Space' : '2D Output Space'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="kp-badge" style={{ background: '#f1e4cb', color: '#5a3f1c', borderColor: '#d8c6a3', fontWeight: 600 }}>
              Output: {isBalanced ? '0.00 ✨' : offset.toFixed(2)}
            </span>
            <div className="kp-view-mode-toggle">
              <button
                className={`kp-view-mode-btn ${viewMode === 'geogebra' ? 'active' : ''}`}
                onClick={() => setViewMode('geogebra')}
                title="GeoGebra Interactive Calculator"
              >
                GeoGebra
              </button>
              <button
                className={`kp-view-mode-btn ${viewMode === 'canvas' ? 'active' : ''}`}
                onClick={() => setViewMode('canvas')}
                title="Canvas (Offline fallback)"
              >
                Canvas
              </button>
            </div>
          </div>
        </div>

        {/* Viewport: Interactive GeoGebra OR Custom Canvas Fallback */}
        {viewMode === 'geogebra' ? (
          <div className="kp-geogebra-wrapper">
            {isGgbLoading && (
              <div className="kp-geogebra-loading">
                <div className="kp-geogebra-spinner" />
                <span>Loading GeoGebra {is3D ? '3D' : '2D'} Engine...</span>
              </div>
            )}
            <div
              id={`kp-ggb-element-${is3D ? '3d' : '2d'}`}
              ref={geogebraContainerRef}
              className="kp-geogebra-container"
              style={{ opacity: isGgbLoading ? 0 : 1 }}
            />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={600}
            height={330}
            className="kp-canvas-viewport"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          />
        )}

        <div className="kp-graph-footer">
          <div className="kp-graph-instruction">
            {is3D
              ? 'Drag to rotate. Blue dot = Combined Output. Steer the sliders to collapse output to the origin (0, 0, 0).'
              : 'Blue dot = Combined Output. Steer the sliders to collapse output to the origin (0, 0).'}
          </div>
          <label className="kp-toggle-kernel">
            <input
              type="checkbox"
              checked={showKernel}
              onChange={(e) => setShowKernel(e.target.checked)}
            />
            <span>Show path to 0</span>
          </label>
        </div>
      </div>

      {/* Output Level Status Bar */}
      <div className="kp-output-bar">
        <div className="kp-output-stat">
          <span className="kp-output-label">Output Level:</span>
          <span className={`kp-output-num ${isBalanced ? 'zero' : ''}`}>
            {isTrivialZero ? '0.00 (Trivial)' : isBalanced ? '0.00 (Balanced!)' : offset.toFixed(2)}
          </span>
        </div>
        <span className={`kp-output-status-msg ${isBalanced ? 'balanced' : isTrivialZero ? 'trivial' : proximity >= 80 ? 'close' : ''}`}>
          {isTrivialZero
            ? '⚠️ All inputs at 0. Find an active balance!'
            : isBalanced
            ? '✨ PERFECT EQUILIBRIUM'
            : proximity >= 80
            ? '🔥 Very close to 0!'
            : 'Move sliders to cancel output to 0.00'}
        </span>
      </div>

      {/* Inline Celebration Card (Shows in-tab so learner can see how/why they got 0!) */}
      {isBalanced && (
        <div className="kp-inline-celebration">
          <div className="kp-inline-badge">
            ✨ Stage {currentStage} Equilibrium Achieved
          </div>
          <h3 className="kp-inline-title">Combined Output Cancelled to 0.00!</h3>

          {/* Active Values Breakdown */}
          <div className="kp-inline-pills">
            <span className="kp-active-point-label">Your Active Inputs:</span>
            <span className="kp-active-val-pill">x₁ = {valA > 0 ? `+${valA}` : valA}</span>
            <span className="kp-active-val-pill">x₂ = {valB > 0 ? `+${valB}` : valB}</span>
            {is3D && (
              <span className="kp-active-val-pill">x₃ = {valC > 0 ? `+${valC}` : valC}</span>
            )}
          </div>

          <p className="kp-inline-desc">{stageConfig.desc}</p>

          <div className="kp-inline-action-row">
            {currentStage < 3 ? (
              <button
                className="kp-inline-btn-primary"
                onClick={() => handleSwitchStage(currentStage + 1)}
              >
                Proceed to Stage {currentStage + 1} →
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
                <button
                  className="kp-inline-btn-primary"
                  onClick={() => handleSwitchStage(1)}
                >
                  Play Again 🔄
                </button>
                {onBack && (
                  <button
                    className="kp-inline-btn-secondary"
                    onClick={onBack}
                  >
                    Back to Home 🏠
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sliders Card */}
      <div className="kp-card">
        <div className="kp-card-header" style={{ marginBottom: '0.65rem' }}>
          <span className="kp-card-title">Move Values (Sliders)</span>
          <span className="kp-badge">
            {is3D ? '3 Values Active' : '2 Values Active'}
          </span>
        </div>

        <div className="kp-sliders-stack">
          {/* Slider 1: x1 */}
          <div
            className={`kp-slider-row ${focusedSlider === 'x1' ? 'is-focused' : ''}`}
            style={{
              '--c-thumb': '#dc2641',
              '--c-ring': 'rgba(220,38,65,0.28)'
            }}
          >
            <div className="kp-stream-info">
              <div className="kp-stream-dot" style={{ backgroundColor: '#dc2641' }} />
              <span className="kp-stream-name">x₁</span>
            </div>
            <input
              type="range"
              aria-label="Value x1"
              min={is3D ? -5 : -6}
              max={is3D ? 5 : 6}
              step="1"
              value={valA}
              onFocus={() => setFocusedSlider('x1')}
              onBlur={() => setFocusedSlider(null)}
              onChange={(e) => {
                setValA(Number(e.target.value));
                setCelebratedThisStage(false);
              }}
              className="kp-range-input"
            />
            <div className="kp-stream-val">{valA > 0 ? `+${valA}` : valA}</div>
          </div>

          {/* Slider 2: x2 */}
          <div
            className={`kp-slider-row ${focusedSlider === 'x2' ? 'is-focused' : ''}`}
            style={{
              '--c-thumb': '#f8b414',
              '--c-ring': 'rgba(248,180,20,0.3)'
            }}
          >
            <div className="kp-stream-info">
              <div className="kp-stream-dot" style={{ backgroundColor: '#f8b414' }} />
              <span className="kp-stream-name">x₂</span>
            </div>
            <input
              type="range"
              aria-label="Value x2"
              min={is3D ? -5 : -6}
              max={is3D ? 5 : 6}
              step="1"
              value={valB}
              onFocus={() => setFocusedSlider('x2')}
              onBlur={() => setFocusedSlider(null)}
              onChange={(e) => {
                setValB(Number(e.target.value));
                setCelebratedThisStage(false);
              }}
              className="kp-range-input"
            />
            <div className="kp-stream-val">{valB > 0 ? `+${valB}` : valB}</div>
          </div>

          {/* Slider 3: x3 (Stages 2 & 3) */}
          {is3D && (
            <div
              className={`kp-slider-row ${focusedSlider === 'x3' ? 'is-focused' : ''}`}
              style={{
                '--c-thumb': '#1e55be',
                '--c-ring': 'rgba(30,85,190,0.28)'
              }}
            >
              <div className="kp-stream-info">
                <div className="kp-stream-dot" style={{ backgroundColor: '#1e55be' }} />
                <span className="kp-stream-name">x₃</span>
              </div>
              <input
                type="range"
                aria-label="Value x3"
                min="-5"
                max="5"
                step="1"
                value={valC}
                onFocus={() => setFocusedSlider('x3')}
                onBlur={() => setFocusedSlider(null)}
                onChange={(e) => {
                  setValC(Number(e.target.value));
                  setCelebratedThisStage(false);
                }}
                className="kp-range-input"
              />
              <div className="kp-stream-val">{valC > 0 ? `+${valC}` : valC}</div>
            </div>
          )}
        </div>

        {/* Stage 3: Discovered Points on the Line */}
        {currentStage === 3 && (
          <div className="kp-tray">
            <div className="kp-tray-title">
              Discovered Balance Points on the Line ({foundPoints.length})
            </div>
            <div className="kp-tray-pills">
              {foundPoints.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  Find an active balance point to log it here...
                </span>
              ) : (
                foundPoints.map((pt, i) => (
                  <span key={i} className="kp-point-pill">
                    {pt}
                  </span>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="kp-controls-bar">
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="kp-btn-secondary" onClick={() => handleRandomize()}>
            🎲 Shuffle Values
          </button>
          <button
            className="kp-btn-secondary"
            onClick={() => {
              setValA(0);
              setValB(0);
              setValC(0);
            }}
          >
            Clear (0)
          </button>
        </div>
      </div>

      {/* Tip Card */}
      <div className="kp-tip-card">
        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>💡</span>
        <div>
          <strong>{stageConfig.name}:</strong> {stageConfig.tip}
        </div>
      </div>

      {/* Stage 3: The Secret Reveal Card */}
      {showRevealCard && (
        <div className="kp-reveal-card">
          <div className="kp-reveal-title">🌱 What You Discovered: The Kernel</div>
          <div className="kp-reveal-body">
            Notice how all your winning points lie on that single straight line in space.
            In mathematics, the set of all inputs that collapse the output to zero is called the <strong>Kernel</strong> (or <strong>Null Space</strong>).
            Whenever this line exists, active inputs can completely cancel each other out!
          </div>
        </div>
      )}
    </div>
  );
}
