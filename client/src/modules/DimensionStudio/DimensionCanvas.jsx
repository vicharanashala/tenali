import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './DimensionCanvas.css';

/**
 * DimensionCanvas.jsx
 *
 * Interactive multi-dimensional visualization canvas supporting:
 * - Sets: Discrete Cartesian Cross Product (S × P and S × S = S²) with interactive dot matrix
 * - 1D: Real Number Line (ℝ) with draggable point x
 * - 2D: Cartesian Plane (ℝ²) with draggable point (x, y) & projection drop lines
 * - 3D: Rotatable 3D coordinate system (ℝ³) with (x, y, z) & floor projection lines
 * - nD: Feature space vector (ℝⁿ) with interactive sliders & multi-feature profile
 */
export default function DimensionCanvas({
  mode = 'set', // 'set' | '1d' | '2d' | '3d' | 'nd' | 'sandbox'
  initialCoords = {},
  onCoordsChange = null,
  compact = false
}) {
  // Selected dimension mode (for sandbox or active mode)
  const [activeTab, setActiveTab] = useState(() => {
    if (mode === 'sandbox') return 'set';
    return mode;
  });

  // Sync tab when prop mode changes (unless in sandbox)
  useEffect(() => {
    if (mode !== 'sandbox') {
      setActiveTab(mode);
    }
  }, [mode]);

  // =========================================================
  // SET / CROSS PRODUCT STATE
  // =========================================================
  const setS = useMemo(() => [1, 2], []);
  const setP = useMemo(() => [3, 4], []);

  // 's_cross_p' | 's_cross_s' | 'fill_gaps'
  const [setMode, setSetMode] = useState(initialCoords.setMode || 's_cross_p');
  const [selectedSetPoint, setSelectedSetPoint] = useState(initialCoords.selected || [2, 3]);

  // 1D Coordinate
  const [val1D, setVal1D] = useState(initialCoords.x ?? 2);

  // 2D Coordinates
  const [val2D, setVal2D] = useState({
    x: initialCoords.x ?? 2,
    y: initialCoords.y ?? 3
  });

  // 3D Coordinates
  const [val3D, setVal3D] = useState({
    x: initialCoords.x ?? 2,
    y: initialCoords.y ?? 2,
    z: initialCoords.z ?? 3
  });

  // 3D Camera Rotation (pitch rotX, yaw rotY)
  const [rotX, setRotX] = useState(0.45); // Pitch
  const [rotY, setRotY] = useState(-0.65); // Yaw
  const isDragging3DRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // nD Coordinates
  const [nDState, setNDState] = useState(() => {
    const n = initialCoords.n || 4;
    const vals = initialCoords.values || [2, 3, -1, 4];
    return { n, values: vals, preset: 'spacetime' };
  });

  // SVG / Canvas refs
  const svgRef = useRef(null);
  const isDragging2DRef = useRef(false);
  const isDragging1DRef = useRef(false);

  // Sync initial coords when step changes
  useEffect(() => {
    if (initialCoords.setMode) {
      setSetMode(initialCoords.setMode);
    }
    if (initialCoords.selected) {
      setSelectedSetPoint(initialCoords.selected);
    }
    if (initialCoords.x !== undefined) {
      setVal1D(initialCoords.x);
      setVal2D((prev) => ({ ...prev, x: initialCoords.x }));
      setVal3D((prev) => ({ ...prev, x: initialCoords.x }));
    }
    if (initialCoords.y !== undefined) {
      setVal2D((prev) => ({ ...prev, y: initialCoords.y }));
      setVal3D((prev) => ({ ...prev, y: initialCoords.y }));
    }
    if (initialCoords.z !== undefined) {
      setVal3D((prev) => ({ ...prev, z: initialCoords.z }));
    }
    if (initialCoords.n !== undefined && initialCoords.values) {
      setNDState({
        n: initialCoords.n,
        values: initialCoords.values,
        preset: initialCoords.n === 4 ? 'spacetime' : initialCoords.n === 5 ? 'weather' : 'custom'
      });
    }
  }, [initialCoords]);

  // Notify parent of coordinate updates
  useEffect(() => {
    if (onCoordsChange) {
      if (activeTab === 'set') onCoordsChange({ setMode, selectedSetPoint });
      else if (activeTab === '1d') onCoordsChange({ x: val1D });
      else if (activeTab === '2d') onCoordsChange(val2D);
      else if (activeTab === '3d') onCoordsChange(val3D);
      else if (activeTab === 'nd') onCoordsChange(nDState);
    }
  }, [activeTab, setMode, selectedSetPoint, val1D, val2D, val3D, nDState, onCoordsChange]);

  // =========================================================
  // 1D DRAGGING LOGIC (Number Line)
  // =========================================================
  const handle1DPointerDown = (e) => {
    isDragging1DRef.current = true;
    handle1DPointerMove(e);
  };

  const handle1DPointerMove = useCallback((e) => {
    if (!isDragging1DRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    if (clientX === undefined) return;
    const relX = clientX - rect.left;
    const width = rect.width;
    // Map relX (0 to width) to [-5, 5]
    const mathX = (relX / width) * 10 - 5;
    const clamped = Math.max(-5, Math.min(5, Math.round(mathX * 2) / 2));
    setVal1D(clamped);
  }, []);

  const handle1DPointerUp = useCallback(() => {
    isDragging1DRef.current = false;
  }, []);

  // =========================================================
  // 2D DRAGGING LOGIC (Cartesian Plane)
  // =========================================================
  const handle2DPointerDown = (e) => {
    isDragging2DRef.current = true;
    handle2DPointerMove(e);
  };

  const handle2DPointerMove = useCallback((e) => {
    if (!isDragging2DRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    if (clientX === undefined || clientY === undefined) return;

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    // Center is (w/2, h/2), range [-5, 5] horizontally and vertically
    const mathX = (relX - w / 2) / (w / 10);
    const mathY = -((relY - h / 2) / (h / 10));

    const clampedX = Math.max(-5, Math.min(5, Math.round(mathX * 2) / 2));
    const clampedY = Math.max(-5, Math.min(5, Math.round(mathY * 2) / 2));

    setVal2D({ x: clampedX, y: clampedY });
  }, []);

  const handle2DPointerUp = useCallback(() => {
    isDragging2DRef.current = false;
  }, []);

  // Global pointer up listeners
  useEffect(() => {
    const handleGlobalUp = () => {
      isDragging1DRef.current = false;
      isDragging2DRef.current = false;
      isDragging3DRef.current = false;
    };
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, []);

  // =========================================================
  // 3D ROTATION DRAG
  // =========================================================
  const handle3DPointerDown = (e) => {
    isDragging3DRef.current = true;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    dragStartRef.current = { x: clientX, y: clientY };
  };

  const handle3DPointerMove = useCallback((e) => {
    if (!isDragging3DRef.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    dragStartRef.current = { x: clientX, y: clientY };

    setRotY((prev) => prev + dx * 0.012);
    setRotX((prev) => Math.max(-1.2, Math.min(1.2, prev - dy * 0.012)));
  }, []);

  // 3D Projection Math Helper
  const project3D = useCallback(
    (x, y, z, cx, cy, scale = 26) => {
      const cosY = Math.cos(rotY),
        sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX),
        sinX = Math.sin(rotX);

      // Rotate around Y (yaw)
      const x1 = x * cosY + y * sinY;
      const y1 = -x * sinY + y * cosY;
      const z1 = z;

      // Rotate around X (pitch)
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      return {
        screenX: cx + x2 * scale,
        screenY: cy - z2 * scale,
        depth: y2
      };
    },
    [rotX, rotY]
  );

  // nD Preset Switcher
  const handleNDPreset = (presetKey) => {
    if (presetKey === 'spacetime') {
      setNDState({
        n: 4,
        values: [2, 3, 1, 4],
        preset: 'spacetime'
      });
    } else if (presetKey === 'weather') {
      setNDState({
        n: 5,
        values: [24, 65, 1013, 15, 2],
        preset: 'weather'
      });
    } else if (presetKey === 'house') {
      setNDState({
        n: 6,
        values: [2100, 3, 2, 8, 2, 420],
        preset: 'house'
      });
    }
  };

  const handleNDValueChange = (idx, val) => {
    const num = parseFloat(val) || 0;
    setNDState((prev) => {
      const next = [...prev.values];
      next[idx] = num;
      return { ...prev, values: next };
    });
  };

  // Set cross pairs generator
  const currentSetPairs = useMemo(() => {
    const pairs = [];
    const yElements = setMode === 's_cross_p' ? setP : setS;
    setS.forEach((s) => {
      yElements.forEach((p) => {
        pairs.push([s, p]);
      });
    });
    return pairs;
  }, [setS, setP, setMode]);

  // Coordinate mapping helper for discrete set dots (2x2 grid)
  const getSetCoords = useCallback(
    (sVal, yVal) => {
      const sIdx = setS.indexOf(sVal);
      const yElements = setMode === 's_cross_p' ? setP : setS;
      const yIdx = yElements.indexOf(yVal);
      const ptX = 250 + (sIdx >= 0 ? sIdx : 0) * 140;
      const ptY = 155 - (yIdx >= 0 ? yIdx : 0) * 80;
      return { ptX, ptY };
    },
    [setS, setP, setMode]
  );

  const isSandbox = mode === 'sandbox';

  return (
    <div className={`dc-wrapper ${compact ? 'compact' : ''}`}>
      {/* Top Header & Dimension Tabs (Shown ONLY in Sandbox Mode) */}
      {isSandbox && (
        <div className="dc-header">
          <div className="dc-tab-group">
            <button
              type="button"
              className={`dc-tab ${activeTab === 'set' ? 'active' : ''}`}
              onClick={() => setActiveTab('set')}
            >
              <span className="dc-tab-dot dot-set" />
              <span className="dc-tab-title">Sets (S²)</span>
            </button>

            <button
              type="button"
              className={`dc-tab ${activeTab === '1d' ? 'active' : ''}`}
              onClick={() => setActiveTab('1d')}
            >
              <span className="dc-tab-dot dot-1d" />
              <span className="dc-tab-title">1D: ℝ</span>
            </button>

            <button
              type="button"
              className={`dc-tab ${activeTab === '2d' ? 'active' : ''}`}
              onClick={() => setActiveTab('2d')}
            >
              <span className="dc-tab-dot dot-2d" />
              <span className="dc-tab-title">2D: ℝ²</span>
            </button>

            <button
              type="button"
              className={`dc-tab ${activeTab === '3d' ? 'active' : ''}`}
              onClick={() => setActiveTab('3d')}
            >
              <span className="dc-tab-dot dot-3d" />
              <span className="dc-tab-title">3D: ℝ³</span>
            </button>

            <button
              type="button"
              className={`dc-tab ${activeTab === 'nd' ? 'active' : ''}`}
              onClick={() => setActiveTab('nd')}
            >
              <span className="dc-tab-dot dot-nd" />
              <span className="dc-tab-title">nD: ℝⁿ</span>
            </button>
          </div>

          {/* Dynamic Coordinate Address Tag */}
          <div className="dc-address-pill">
            <span className="dc-address-label">Address:</span>
            <span className="dc-address-val">
              {activeTab === 'set' &&
                `(${selectedSetPoint[0]}, ${selectedSetPoint[1]}) ∈ ${
                  setMode === 's_cross_p' ? 'S × P' : 'S² (S × S)'
                }`}
              {activeTab === '1d' && `x = ${val1D} ∈ ℝ`}
              {activeTab === '2d' && `(x, y) = (${val2D.x}, ${val2D.y}) ∈ ℝ²`}
              {activeTab === '3d' && `(x, y, z) = (${val3D.x}, ${val3D.y}, ${val3D.z}) ∈ ℝ³`}
              {activeTab === 'nd' && `(${nDState.values.join(', ')}) ∈ ℝ${nDState.n}`}
            </span>
          </div>
        </div>
      )}

      {/* Main Visual Display Area */}
      <div className="dc-canvas-container">
        {/* ========================================================= */}
        {/* SETS VIEW: Cartesian Product Grid (S × P and S × S = S²)   */}
        {/* ========================================================= */}
        {activeTab === 'set' && (
          <div className="dc-set-container">
            {/* Set Presets & Mode Selector (Shown ONLY in Sandbox Mode) */}
            {isSandbox && (
              <div className="dc-set-preset-bar">
                <span className="dc-set-preset-label">Choose Set Product:</span>
                <button
                  type="button"
                  className={`dc-preset-btn ${setMode === 's_cross_p' ? 'active' : ''}`}
                  onClick={() => {
                    setSetMode('s_cross_p');
                    setSelectedSetPoint([2, 3]);
                  }}
                >
                  🔢 S × P (2 × 2 = 4 Pairs)
                </button>
                <button
                  type="button"
                  className={`dc-preset-btn ${setMode === 's_cross_s' ? 'active' : ''}`}
                  onClick={() => {
                    setSetMode('s_cross_s');
                    setSelectedSetPoint([2, 2]);
                  }}
                >
                  ✨ S × S = S² (2 × 2 = 4 Pairs)
                </button>
                <button
                  type="button"
                  className={`dc-preset-btn ${setMode === 'fill_gaps' ? 'active' : ''}`}
                  onClick={() => {
                    setSetMode('fill_gaps');
                  }}
                >
                  🌊 Fill Gaps → ℝ² (Continuous)
                </button>
              </div>
            )}

            {/* Set SVG Dot Grid */}
            <div className="dc-canvas-inner">
              <svg
                ref={svgRef}
                viewBox="0 0 600 270"
                className="dc-svg"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="setAxisGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="setPlaneFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(245, 158, 11, 0.05)" />
                    <stop offset="100%" stopColor="rgba(20, 184, 166, 0.12)" />
                  </linearGradient>
                </defs>

                {/* If Continuous Preview Mode is on */}
                {setMode === 'fill_gaps' && (
                  <g>
                    <rect
                      x="180"
                      y="40"
                      width="280"
                      height="170"
                      fill="url(#setPlaneFill)"
                      stroke="#14b8a6"
                      strokeWidth="1.5"
                      strokeDasharray="5 4"
                      rx="8"
                    />
                    <text
                      x="320"
                      y="120"
                      fill="#14b8a6"
                      fontSize="14"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      All Gaps Filled → Continuous ℝ² = ℝ × ℝ
                    </text>
                    <text
                      x="320"
                      y="142"
                      fill="#a89e94"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      Infinitely many pairs (x, y) along every decimal & fraction!
                    </text>
                  </g>
                )}

                {/* Horizontal Axis: Set S = {1, 2} */}
                <line
                  x1="160"
                  y1="210"
                  x2="470"
                  y2="210"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <polygon points="470,205 484,210 470,215" fill="#f59e0b" />
                <text
                  x="488"
                  y="214"
                  fill="#f59e0b"
                  fontSize="13"
                  fontWeight="700"
                  dominantBaseline="middle"
                >
                  S
                </text>

                {/* Vertical Axis: Set P = {3, 4} or Set S = {1, 2} */}
                <line
                  x1="180"
                  y1="220"
                  x2="180"
                  y2="35"
                  stroke={setMode === 's_cross_p' ? '#38bdf8' : '#f59e0b'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <polygon
                  points="175,35 180,21 185,35"
                  fill={setMode === 's_cross_p' ? '#38bdf8' : '#f59e0b'}
                />
                <text
                  x="180"
                  y="14"
                  fill={setMode === 's_cross_p' ? '#38bdf8' : '#f59e0b'}
                  fontSize="13"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {setMode === 's_cross_p' ? 'P' : 'S'}
                </text>

                {/* Horizontal ticks: Set S = {1, 2} */}
                {setS.map((sVal) => {
                  const { ptX } = getSetCoords(sVal, (setMode === 's_cross_p' ? setP : setS)[0]);
                  return (
                    <g key={`htick-${sVal}`}>
                      <line
                        x1={ptX}
                        y1="205"
                        x2={ptX}
                        y2="215"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                      <text
                        x={ptX}
                        y="235"
                        fill="#f59e0b"
                        fontSize="13"
                        fontWeight="700"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {sVal}
                      </text>
                      {/* Grid helper line */}
                      <line
                        x1={ptX}
                        y1="40"
                        x2={ptX}
                        y2="205"
                        stroke="rgba(255, 255, 255, 0.06)"
                        strokeDasharray="3 3"
                      />
                    </g>
                  );
                })}

                {/* Vertical ticks: P = {3, 4} or S = {1, 2} */}
                {(setMode === 's_cross_p' ? setP : setS).map((yVal) => {
                  const { ptY } = getSetCoords(setS[0], yVal);
                  const color = setMode === 's_cross_p' ? '#38bdf8' : '#f59e0b';
                  return (
                    <g key={`vtick-${yVal}`}>
                      <line
                        x1="175"
                        y1={ptY}
                        x2="185"
                        y2={ptY}
                        stroke={color}
                        strokeWidth="2"
                      />
                      <text
                        x="165"
                        y={ptY + 4}
                        fill={color}
                        fontSize="13"
                        fontWeight="700"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {yVal}
                      </text>
                      {/* Grid helper line */}
                      <line
                        x1="185"
                        y1={ptY}
                        x2="450"
                        y2={ptY}
                        stroke="rgba(255, 255, 255, 0.06)"
                        strokeDasharray="3 3"
                      />
                    </g>
                  );
                })}

                {/* Projection lines for selected point */}
                {(() => {
                  const [selS, selY] = selectedSetPoint;
                  const { ptX, ptY } = getSetCoords(selS, selY);
                  return (
                    <g>
                      <line
                        x1={ptX}
                        y1={ptY}
                        x2={ptX}
                        y2="210"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      <line
                        x1={ptX}
                        y1={ptY}
                        x2="180"
                        y2={ptY}
                        stroke={setMode === 's_cross_p' ? '#38bdf8' : '#f59e0b'}
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                    </g>
                  );
                })()}

                {/* Discrete Grid Points */}
                {currentSetPairs.map(([sVal, yVal]) => {
                  const { ptX, ptY } = getSetCoords(sVal, yVal);
                  const isSelected =
                    selectedSetPoint[0] === sVal && selectedSetPoint[1] === yVal;

                  return (
                    <g
                      key={`pt-${sVal}-${yVal}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedSetPoint([sVal, yVal])}
                    >
                      {/* Click/Hover target */}
                      <circle cx={ptX} cy={ptY} r="20" fill="transparent" />

                      {/* Halo ring if selected */}
                      {isSelected && (
                        <circle
                          cx={ptX}
                          cy={ptY}
                          r="18"
                          fill="rgba(245, 158, 11, 0.25)"
                          stroke="#f59e0b"
                          strokeWidth="1.5"
                        />
                      )}

                      {/* Center Point */}
                      <circle
                        cx={ptX}
                        cy={ptY}
                        r={isSelected ? 8 : 6}
                        fill={isSelected ? '#f59e0b' : '#ede8e3'}
                        stroke="#1e1a17"
                        strokeWidth="2"
                        className="dc-interactive-point"
                      />

                      {/* Point label: only shown on active/selected point */}
                      {isSelected && (
                        <g>
                          <rect
                            x={ptX - 25}
                            y={ptY - 26}
                            width="50"
                            height="19"
                            rx="4"
                            fill="#1e1a17"
                            stroke="#f59e0b"
                            strokeWidth="1.2"
                          />
                          <text
                            x={ptX}
                            y={ptY - 13}
                            fill="#f59e0b"
                            fontSize="11"
                            fontWeight="700"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            ({sVal}, {yVal})
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 1D VIEW: Real Number Line                                 */}
        {/* ========================================================= */}
        {activeTab === '1d' && (
          <div
            className="dc-canvas-inner"
            onPointerDown={handle1DPointerDown}
            onPointerMove={handle1DPointerMove}
            onPointerUp={handle1DPointerUp}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 600 240"
              className="dc-svg"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid / Axis Background */}
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#14b8a6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Main Number Line Axis */}
              <line
                x1="30"
                y1="120"
                x2="570"
                y2="120"
                stroke="url(#lineGrad)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Arrowheads */}
              <polygon points="570,114 584,120 570,126" fill="#14b8a6" />
              <polygon points="30,114 16,120 30,126" fill="#14b8a6" />

              {/* Ticks and Labels from -5 to +5 */}
              {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((t) => {
                const screenX = 300 + t * 50;
                const isZero = t === 0;
                return (
                  <g key={t}>
                    <line
                      x1={screenX}
                      y1={isZero ? 100 : 110}
                      x2={screenX}
                      y2={isZero ? 140 : 130}
                      stroke={isZero ? '#e8864a' : 'rgba(255, 245, 230, 0.4)'}
                      strokeWidth={isZero ? 3 : 1.5}
                    />
                    <text
                      x={screenX}
                      y={156}
                      fill={isZero ? '#e8864a' : '#ede8e3'}
                      fontSize={isZero ? '14' : '12'}
                      fontWeight={isZero ? '700' : '500'}
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {t}
                    </text>
                  </g>
                );
              })}

              {/* Active Point x */}
              {(() => {
                const ptX = 300 + val1D * 50;
                return (
                  <g>
                    {/* Pulsing ring */}
                    <circle cx={ptX} cy={120} r="18" fill="rgba(20, 184, 166, 0.2)" />
                    {/* Center point */}
                    <circle
                      cx={ptX}
                      cy={120}
                      r="9"
                      fill="#14b8a6"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="dc-interactive-point"
                    />
                    {/* Tooltip badge */}
                    <rect
                      x={ptX - 35}
                      y={65}
                      width="70"
                      height="26"
                      rx="6"
                      fill="#1e1a17"
                      stroke="#14b8a6"
                      strokeWidth="1.5"
                    />
                    <text
                      x={ptX}
                      y={82}
                      fill="#14b8a6"
                      fontSize="12"
                      fontWeight="700"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      x = {val1D}
                    </text>
                  </g>
                );
              })()}
            </svg>

            {/* 1D Controls strip (hidden if showSlider is false) */}
            {initialCoords.showSlider !== false && (
              <div className="dc-controls-bar">
                <span className="dc-ctrl-hint">👆 Drag the point or use slider:</span>
                <div className="dc-slider-item">
                  <label>x coordinate:</label>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.5"
                    value={val1D}
                    onChange={(e) => setVal1D(parseFloat(e.target.value))}
                  />
                  <span className="dc-slider-val">{val1D}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 2D VIEW: Cartesian Plane (ℝ²)                            */}
        {/* ========================================================= */}
        {activeTab === '2d' && (
          <div
            className="dc-canvas-inner"
            onPointerDown={handle2DPointerDown}
            onPointerMove={handle2DPointerMove}
            onPointerUp={handle2DPointerUp}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 600 300"
              className="dc-svg"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid Lines */}
              {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((t) => (
                <g key={t}>
                  {/* Vertical grid line */}
                  <line
                    x1={300 + t * 45}
                    y1={15}
                    x2={300 + t * 45}
                    y2={285}
                    stroke="rgba(255, 245, 230, 0.08)"
                    strokeWidth="1"
                  />
                  {/* Horizontal grid line */}
                  <line
                    x1={30}
                    y1={150 - t * 24}
                    x2={570}
                    y2={150 - t * 24}
                    stroke="rgba(255, 245, 230, 0.08)"
                    strokeWidth="1"
                  />
                </g>
              ))}

              {/* X Axis (horizontal) */}
              <line
                x1="30"
                y1="150"
                x2="570"
                y2="150"
                stroke="#14b8a6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <text x="575" y="154" fill="#14b8a6" fontSize="13" fontWeight="700">
                X
              </text>

              {/* Y Axis (vertical) */}
              <line
                x1="300"
                y1="285"
                x2="300"
                y2="15"
                stroke="#e8864a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <text x="300" y="10" fill="#e8864a" fontSize="13" fontWeight="700" textAnchor="middle">
                Y
              </text>

              {/* Origin (0, 0) */}
              <circle cx="300" cy="150" r="3.5" fill="#ede8e3" />
              <text x="290" y="165" fill="#a89e94" fontSize="10" fontFamily="monospace">
                (0,0)
              </text>

              {/* Active Point (x, y) */}
              {(() => {
                const ptX = 300 + val2D.x * 45;
                const ptY = 150 - val2D.y * 24;

                return (
                  <g>
                    {/* Dotted projection lines to axes */}
                    <line
                      x1={ptX}
                      y1={ptY}
                      x2={ptX}
                      y2={150}
                      stroke="#14b8a6"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    <line
                      x1={ptX}
                      y1={ptY}
                      x2={300}
                      y2={ptY}
                      stroke="#e8864a"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />

                    {/* Projections markers on axes */}
                    <circle cx={ptX} cy={150} r="4" fill="#14b8a6" />
                    <circle cx={300} cy={ptY} r="4" fill="#e8864a" />

                    {/* Point halo & center */}
                    <circle cx={ptX} cy={ptY} r="16" fill="rgba(168, 85, 247, 0.25)" />
                    <circle
                      cx={ptX}
                      cy={ptY}
                      r="8"
                      fill="#a855f7"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="dc-interactive-point"
                    />

                    {/* Label pill */}
                    <rect
                      x={ptX + 12}
                      y={ptY - 26}
                      width="82"
                      height="24"
                      rx="5"
                      fill="#1e1a17"
                      stroke="#a855f7"
                      strokeWidth="1.5"
                    />
                    <text
                      x={ptX + 53}
                      y={ptY - 10}
                      fill="#ede8e3"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      ({val2D.x}, {val2D.y})
                    </text>
                  </g>
                );
              })()}
            </svg>

            {/* 2D Controls strip */}
            <div className="dc-controls-bar">
              <span className="dc-ctrl-hint">👆 Drag anywhere on the grid or use sliders:</span>
              <div className="dc-slider-item">
                <label style={{ color: '#14b8a6' }}>x (horizontal):</label>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.5"
                  value={val2D.x}
                  onChange={(e) => setVal2D((prev) => ({ ...prev, x: parseFloat(e.target.value) }))}
                />
                <span className="dc-slider-val">{val2D.x}</span>
              </div>
              <div className="dc-slider-item">
                <label style={{ color: '#e8864a' }}>y (vertical):</label>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.5"
                  value={val2D.y}
                  onChange={(e) => setVal2D((prev) => ({ ...prev, y: parseFloat(e.target.value) }))}
                />
                <span className="dc-slider-val">{val2D.y}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3D VIEW: Rotatable 3D Coordinate Space (ℝ³)              */}
        {/* ========================================================= */}
        {activeTab === '3d' && (
          <div
            className="dc-canvas-inner dc-3d-container"
            onPointerDown={handle3DPointerDown}
            onPointerMove={handle3DPointerMove}
          >
            <div className="dc-3d-hint-banner">
              <span>🔄 Drag to rotate 3D view</span>
              <button
                type="button"
                className="dc-recenter-btn"
                onClick={() => {
                  setRotX(0.45);
                  setRotY(-0.65);
                }}
              >
                Reset Camera
              </button>
            </div>

            <svg viewBox="0 0 600 320" className="dc-svg" preserveAspectRatio="xMidYMid meet">
              {(() => {
                const cx = 300;
                const cy = 175;
                const axisLen = 5.2;

                // Project origins and axis endpoints
                const origin = project3D(0, 0, 0, cx, cy);
                const ptXAxis = project3D(axisLen, 0, 0, cx, cy);
                const ptYAxis = project3D(0, axisLen, 0, cx, cy);
                const ptZAxis = project3D(0, 0, axisLen, cx, cy);

                // Project negative axes
                const ptXNeg = project3D(-axisLen, 0, 0, cx, cy);
                const ptYNeg = project3D(0, -axisLen, 0, cx, cy);

                // Project active point and its floor projections
                const pt = project3D(val3D.x, val3D.y, val3D.z, cx, cy);
                const ptFloor = project3D(val3D.x, val3D.y, 0, cx, cy);

                return (
                  <g>
                    {/* Floor Grid (XY Plane) */}
                    {[-4, -2, 0, 2, 4].map((gridCoord) => {
                      const p1 = project3D(gridCoord, -4, 0, cx, cy);
                      const p2 = project3D(gridCoord, 4, 0, cx, cy);
                      const q1 = project3D(-4, gridCoord, 0, cx, cy);
                      const q2 = project3D(4, gridCoord, 0, cx, cy);

                      return (
                        <g key={gridCoord}>
                          <line
                            x1={p1.screenX}
                            y1={p1.screenY}
                            x2={p2.screenX}
                            y2={p2.screenY}
                            stroke="rgba(255, 245, 230, 0.05)"
                            strokeWidth="1"
                          />
                          <line
                            x1={q1.screenX}
                            y1={q1.screenY}
                            x2={q2.screenX}
                            y2={q2.screenY}
                            stroke="rgba(255, 245, 230, 0.05)"
                            strokeWidth="1"
                          />
                        </g>
                      );
                    })}

                    {/* Negative dashed axes */}
                    <line
                      x1={origin.screenX}
                      y1={origin.screenY}
                      x2={ptXNeg.screenX}
                      y2={ptXNeg.screenY}
                      stroke="rgba(239, 68, 68, 0.3)"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1={origin.screenX}
                      y1={origin.screenY}
                      x2={ptYNeg.screenX}
                      y2={ptYNeg.screenY}
                      stroke="rgba(20, 184, 166, 0.3)"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />

                    {/* Positive X Axis (Red) */}
                    <line
                      x1={origin.screenX}
                      y1={origin.screenY}
                      x2={ptXAxis.screenX}
                      y2={ptXAxis.screenY}
                      stroke="#ef4444"
                      strokeWidth="2.5"
                    />
                    <text
                      x={ptXAxis.screenX + 8}
                      y={ptXAxis.screenY + 4}
                      fill="#ef4444"
                      fontSize="13"
                      fontWeight="700"
                    >
                      X
                    </text>

                    {/* Positive Y Axis (Green/Teal) */}
                    <line
                      x1={origin.screenX}
                      y1={origin.screenY}
                      x2={ptYAxis.screenX}
                      y2={ptYAxis.screenY}
                      stroke="#14b8a6"
                      strokeWidth="2.5"
                    />
                    <text
                      x={ptYAxis.screenX + 8}
                      y={ptYAxis.screenY + 4}
                      fill="#14b8a6"
                      fontSize="13"
                      fontWeight="700"
                    >
                      Y
                    </text>

                    {/* Positive Z Axis (Purple/Altitude) */}
                    <line
                      x1={origin.screenX}
                      y1={origin.screenY}
                      x2={ptZAxis.screenX}
                      y2={ptZAxis.screenY}
                      stroke="#a855f7"
                      strokeWidth="2.5"
                    />
                    <text
                      x={ptZAxis.screenX - 4}
                      y={ptZAxis.screenY - 10}
                      fill="#a855f7"
                      fontSize="13"
                      fontWeight="700"
                    >
                      Z
                    </text>

                    {/* Projection drop lines from point to floor and axes */}
                    {/* From point to floor */}
                    <line
                      x1={pt.screenX}
                      y1={pt.screenY}
                      x2={ptFloor.screenX}
                      y2={ptFloor.screenY}
                      stroke="#a855f7"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                    {/* From floor to X axis */}
                    <line
                      x1={ptFloor.screenX}
                      y1={ptFloor.screenY}
                      x2={ptXAxis.screenX}
                      y2={ptXAxis.screenY}
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    {/* From floor to Y axis */}
                    <line
                      x1={ptFloor.screenX}
                      y1={ptFloor.screenY}
                      x2={ptYAxis.screenX}
                      y2={ptYAxis.screenY}
                      stroke="#14b8a6"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />

                    {/* Shadow on floor */}
                    <ellipse
                      cx={ptFloor.screenX}
                      cy={ptFloor.screenY}
                      rx="7"
                      ry="3.5"
                      fill="rgba(0, 0, 0, 0.4)"
                    />
                    <circle cx={ptFloor.screenX} cy={ptFloor.screenY} r="4" fill="rgba(255,255,255,0.4)" />

                    {/* Point in 3D Space */}
                    <circle cx={pt.screenX} cy={pt.screenY} r="18" fill="rgba(232, 134, 74, 0.25)" />
                    <circle
                      cx={pt.screenX}
                      cy={pt.screenY}
                      r="8.5"
                      fill="#e8864a"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="dc-interactive-point"
                    />

                    {/* 3D Label pill */}
                    <rect
                      x={pt.screenX + 12}
                      y={pt.screenY - 26}
                      width="105"
                      height="24"
                      rx="5"
                      fill="#1e1a17"
                      stroke="#e8864a"
                      strokeWidth="1.5"
                    />
                    <text
                      x={pt.screenX + 64}
                      y={pt.screenY - 10}
                      fill="#ede8e3"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      ({val3D.x}, {val3D.y}, {val3D.z})
                    </text>
                  </g>
                );
              })()}
            </svg>

            {/* 3D Coordinates Sliders */}
            <div className="dc-controls-bar">
              <div className="dc-slider-item">
                <label style={{ color: '#ef4444' }}>X:</label>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  step="0.5"
                  value={val3D.x}
                  onChange={(e) => setVal3D((prev) => ({ ...prev, x: parseFloat(e.target.value) }))}
                />
                <span className="dc-slider-val">{val3D.x}</span>
              </div>

              <div className="dc-slider-item">
                <label style={{ color: '#14b8a6' }}>Y:</label>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  step="0.5"
                  value={val3D.y}
                  onChange={(e) => setVal3D((prev) => ({ ...prev, y: parseFloat(e.target.value) }))}
                />
                <span className="dc-slider-val">{val3D.y}</span>
              </div>

              <div className="dc-slider-item">
                <label style={{ color: '#a855f7' }}>Z:</label>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  step="0.5"
                  value={val3D.z}
                  onChange={(e) => setVal3D((prev) => ({ ...prev, z: parseFloat(e.target.value) }))}
                />
                <span className="dc-slider-val">{val3D.z}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* nD VIEW: Multi-Feature Space (ℝⁿ)                         */}
        {/* ========================================================= */}
        {activeTab === 'nd' && (
          <div className="dc-nd-container">
            {/* Real World Presets */}
            <div className="dc-nd-preset-bar">
              <span className="dc-nd-preset-label">Real-World Examples:</span>
              <button
                type="button"
                className={`dc-preset-btn ${nDState.preset === 'spacetime' ? 'active' : ''}`}
                onClick={() => handleNDPreset('spacetime')}
              >
                🚀 Space-Time (ℝ⁴)
              </button>
              <button
                type="button"
                className={`dc-preset-btn ${nDState.preset === 'weather' ? 'active' : ''}`}
                onClick={() => handleNDPreset('weather')}
              >
                🌦️ Weather Station (ℝ⁵)
              </button>
              <button
                type="button"
                className={`dc-preset-btn ${nDState.preset === 'house' ? 'active' : ''}`}
                onClick={() => handleNDPreset('house')}
              >
                🏡 Housing Features (ℝ⁶)
              </button>
            </div>

            {/* nD Vector Card */}
            <div className="dc-nd-vector-card">
              <div className="dc-nd-card-header">
                <span className="dc-nd-dim-pill">Dimension n = {nDState.n}</span>
                <span className="dc-nd-math-expr">
                  Point v ∈ ℝ<sup>{nDState.n}</sup> = ({nDState.values.join(', ')})
                </span>
              </div>

              {/* Dimension Channels */}
              <div className="dc-nd-channels-grid">
                {nDState.values.map((v, idx) => {
                  const dimNames = {
                    spacetime: ['x (width)', 'y (length)', 'z (altitude)', 't (time)'],
                    weather: ['Temp (°C)', 'Humidity (%)', 'Pressure (hPa)', 'Wind (km/h)', 'Rain (mm)'],
                    house: ['Area (sqft)', 'Bedrooms', 'Bathrooms', 'Age (yrs)', 'Garage', 'Price ($k)']
                  };
                  const label = dimNames[nDState.preset]?.[idx] || `Coordinate x${idx + 1}`;

                  return (
                    <div key={idx} className="dc-nd-channel-item">
                      <div className="dc-channel-header">
                        <span className="dc-channel-idx">
                          x<sub>{idx + 1}</sub>
                        </span>
                        <span className="dc-channel-name">{label}</span>
                        <span className="dc-channel-val">{v}</span>
                      </div>
                      <input
                        type="range"
                        min={nDState.preset === 'weather' && idx === 2 ? '950' : '-10'}
                        max={nDState.preset === 'weather' && idx === 2 ? '1050' : '50'}
                        step="1"
                        value={v}
                        onChange={(e) => handleNDValueChange(idx, e.target.value)}
                        className="dc-channel-slider"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="dc-nd-insight-banner">
                💡 <strong>Every additional measurement is another axis in ℝⁿ.</strong> Even though we cannot physically draw 4 or 5 perpendicular lines in our room, algebra calculates distances, vectors, and lines in ℝⁿ effortlessly!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
