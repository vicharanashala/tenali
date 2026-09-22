import React, { useState, useEffect } from 'react';
import {
  PATH_META,
  PHASES,
  POINT_PATH_QUESTIONS,
  CLUSTER_1_SUMMARY,
  ENVIRONMENTS,
  ENVIRONMENT_OBJECTS,
  UNSEEN_OBJECTS_DESCRIPTIONS,
  UNSEEN_SPOTS_PRESETS
} from './questions';
import GeoGebraPointPlotter from './GeoGebraPointPlotter';
import './LinearAlgebraModule.css';

// ==========================================
// 1. VISUAL: Interactive Environment Studio (Q1)
// ==========================================
function InteractiveEnvironmentVisual({
  environment = 'room',
  selectedObject = 'Bulb',
  onSelectObject,
  aimMode,
  setAimMode,
  showAimControls = true,
  showFinger,
  showToolbar = false
}) {
  const displayFinger = showFinger !== undefined ? showFinger : showAimControls;

  return (
    <div className="la-room-studio">
      {showToolbar && (
        <div className="la-studio-toolbar">
          <span className="la-toolbar-label">Context Object:</span>
          <div className="la-obj-pills">
            {(ENVIRONMENT_OBJECTS[environment] || ENVIRONMENT_OBJECTS.room).map((obj) => (
              <button
                key={obj}
                className={`la-pill-btn ${selectedObject === obj ? 'active' : ''}`}
                onClick={() => onSelectObject && onSelectObject(obj)}
              >
                {obj}
              </button>
            ))}
          </div>
        </div>
      )}

      <svg className="la-svg-canvas" viewBox="0 0 420 185">
        <defs>
          <radialGradient id="bulbWarmGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.8" />
            <stop offset="65%" stopColor="#f97316" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- Background Architecture according to environment --- */}
        {environment === 'room' && (
          <g>
            <rect x="0" y="0" width="420" height="24" fill="#1f1a16" />
            <line x1="0" y1="24" x2="420" y2="24" stroke="rgba(255,245,230,0.2)" strokeWidth="2" />
            <text x="16" y="16" fill="rgba(255,245,230,0.4)" fontSize="9">Ceiling</text>
            <text x="16" y="38" fill="rgba(255,245,230,0.3)" fontSize="8.5">Wall</text>
          </g>
        )}

        {environment === 'outside' && (
          <g>
            <rect x="0" y="0" width="420" height="135" fill="#161e2e" />
            <rect x="0" y="135" width="420" height="50" fill="#142617" />
            <line x1="0" y1="135" x2="420" y2="135" stroke="rgba(74,222,128,0.25)" strokeWidth="1.5" />
            <text x="16" y="18" fill="rgba(147,197,253,0.4)" fontSize="9">Open Sky</text>
            <text x="16" y="152" fill="rgba(134,239,172,0.3)" fontSize="8.5">Ground / Path</text>
          </g>
        )}

        {environment === 'vehicle' && (
          <g>
            <rect x="0" y="0" width="420" height="185" fill="#181a20" />
            <rect x="40" y="25" width="340" height="120" rx="14" fill="#111827" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <line x1="0" y1="35" x2="420" y2="35" stroke="#71717a" strokeWidth="3" />
            <text x="16" y="18" fill="rgba(255,245,230,0.4)" fontSize="9">Vehicle Interior</text>
          </g>
        )}

        {environment === 'elsewhere' && (
          <g>
            <rect x="0" y="0" width="420" height="185" fill="#181412" />
            <line x1="0" y1="140" x2="420" y2="140" stroke="rgba(255,245,230,0.15)" strokeWidth="1" strokeDasharray="5,5" />
            <text x="16" y="18" fill="rgba(255,245,230,0.4)" fontSize="9">Surrounding Space</text>
          </g>
        )}

        {/* --- Objects --- */}
        {/* ROOM OBJECTS */}
        {selectedObject === 'Bulb' && (
          <g>
            <line x1="210" y1="24" x2="210" y2="70" stroke="#78716c" strokeWidth="2.5" />
            <circle cx="210" cy="92" r="42" fill="url(#bulbWarmGlow)" />
            <rect x="204" y="68" width="12" height="10" rx="2" fill="#a8a29e" />
            <path d="M 204 78 C 190 88, 192 110, 210 110 C 228 110, 230 88, 216 78 Z" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" />
            <path d="M 207 92 Q 210 86 213 92" stroke="#ca8a04" strokeWidth="1.5" fill="none" />
          </g>
        )}

        {selectedObject === 'Clock' && (
          <g>
            <circle cx="210" cy="85" r="30" fill="#2d2621" stroke="#e8864a" strokeWidth="3" />
            <circle cx="210" cy="85" r="2" fill="#e8864a" />
            <line x1="210" y1="85" x2="210" y2="65" stroke="#ede8e3" strokeWidth="2" strokeLinecap="round" />
            <line x1="210" y1="85" x2="225" y2="85" stroke="#ede8e3" strokeWidth="1.5" strokeLinecap="round" />
            <text x="210" y="62" textAnchor="middle" fill="rgba(255,245,230,0.5)" fontSize="7">12</text>
            <text x="210" y="111" textAnchor="middle" fill="rgba(255,245,230,0.5)" fontSize="7">6</text>
          </g>
        )}

        {selectedObject === 'Hanger' && (
          <g>
            <line x1="210" y1="24" x2="210" y2="65" stroke="#78716c" strokeWidth="2" />
            <circle cx="210" cy="65" r="4" fill="#a8a29e" />
            <path d="M 210 65 L 180 95 L 240 95 Z" fill="none" stroke="#e8864a" strokeWidth="2.5" strokeLinejoin="round" />
            <line x1="180" y1="95" x2="240" y2="95" stroke="#e8864a" strokeWidth="2.5" />
          </g>
        )}

        {selectedObject === 'Switch' && (
          <g>
            <rect x="195" y="65" width="30" height="40" rx="4" fill="#2d2621" stroke="rgba(255,245,230,0.3)" strokeWidth="2" />
            <rect x="204" y="75" width="12" height="18" rx="2" fill="#10b981" />
          </g>
        )}

        {/* OUTSIDE OBJECTS */}
        {selectedObject === 'Tree' && (
          <g>
            <rect x="204" y="90" width="12" height="45" fill="#78350f" />
            <circle cx="210" cy="72" r="32" fill="#166534" stroke="#22c55e" strokeWidth="1.5" />
            <circle cx="195" cy="80" r="22" fill="#15803d" />
            <circle cx="225" cy="80" r="22" fill="#15803d" />
          </g>
        )}

        {selectedObject === 'Sign' && (
          <g>
            <line x1="210" y1="85" x2="210" y2="140" stroke="#94a3b8" strokeWidth="3.5" />
            <rect x="175" y="60" width="70" height="34" rx="4" fill="#2563eb" stroke="#60a5fa" strokeWidth="2" />
            <text x="210" y="81" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">WAY OUT</text>
          </g>
        )}

        {selectedObject === 'Lamp Post' && (
          <g>
            <line x1="210" y1="55" x2="210" y2="140" stroke="#475569" strokeWidth="3.5" />
            <circle cx="210" cy="65" r="30" fill="url(#lanternGlow)" />
            <polygon points="200,68 220,68 215,50 205,50" fill="#f59e0b" stroke="#334155" strokeWidth="1.5" />
          </g>
        )}

        {selectedObject === 'Bench' && (
          <g>
            <rect x="170" y="80" width="80" height="12" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
            <rect x="170" y="96" width="80" height="8" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1" />
            <line x1="180" y1="104" x2="180" y2="135" stroke="#334155" strokeWidth="3" />
            <line x1="240" y1="104" x2="240" y2="135" stroke="#334155" strokeWidth="3" />
          </g>
        )}

        {/* VEHICLE OBJECTS */}
        {selectedObject === 'Handle' && (
          <g>
            <line x1="210" y1="35" x2="210" y2="65" stroke="#eab308" strokeWidth="3" />
            <circle cx="210" cy="85" r="16" fill="none" stroke="#eab308" strokeWidth="4" />
          </g>
        )}

        {selectedObject === 'Window' && (
          <g>
            <rect x="170" y="55" width="80" height="60" rx="8" fill="#38bdf8" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="2" />
            <line x1="180" y1="100" x2="225" y2="65" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.4" />
          </g>
        )}

        {selectedObject === 'Seat' && (
          <g>
            <rect x="190" y="55" width="40" height="24" rx="6" fill="#334155" stroke="#64748b" strokeWidth="2" />
            <path d="M 185 85 Q 210 80 235 85 L 230 130 L 190 130 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          </g>
        )}

        {/* ELSEWHERE FALLBACKS */}
        {(selectedObject === 'Light' || selectedObject === 'Ground Mark' || selectedObject === 'Object') && (
          <g>
            <circle cx="210" cy="85" r="22" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />
            <text x="210" y="89" textAnchor="middle" fill="#f59e0b" fontSize="8.5" fontWeight="bold">{selectedObject}</text>
          </g>
        )}

        {/* Placeholder when no object is selected */}
        {!selectedObject && (
          <g>
            <circle cx="210" cy="85" r="28" fill="rgba(255,245,230,0.04)" stroke="rgba(255,245,230,0.2)" strokeWidth="1.5" strokeDasharray="4,4" />
            <text x="210" y="89" textAnchor="middle" fill="rgba(255,245,230,0.4)" fontSize="9" fontStyle="italic">
              (Choose an object above)
            </text>
          </g>
        )}

        {/* Pointer Finger Aiming and Reticle (only when pointing/aiming is active) */}
        {displayFinger && (
          <>
            {/* The Exact Spot Reticle */}
            <g style={{ cursor: 'pointer' }} onClick={() => setAimMode && setAimMode('spot')}>
              <circle cx="210" cy="85" r="3.5" fill="#ef4444" />
              <circle cx="210" cy="85" r="14" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3,3" />
              <line x1="210" y1="68" x2="210" y2="78" stroke="#ef4444" strokeWidth="1" />
              <line x1="210" y1="92" x2="210" y2="102" stroke="#ef4444" strokeWidth="1" />
              <line x1="193" y1="85" x2="203" y2="85" stroke="#ef4444" strokeWidth="1" />
              <line x1="217" y1="85" x2="227" y2="85" stroke="#ef4444" strokeWidth="1" />
            </g>

            {/* Pointer Finger Aiming */}
            <path
              d={aimMode === 'object' ? "M 340 155 L 230 105" : "M 340 155 L 220 90"}
              stroke="#e8864a"
              strokeWidth="2.5"
              strokeDasharray="4,3"
              style={{ transition: 'd 0.25s ease' }}
            />
            <circle cx="340" cy="155" r="5" fill="#e8864a" />
            <text x="348" y="158" fill="#e8864a" fontSize="9.5" fontWeight="bold">Your Finger</text>
          </>
        )}

        {/* Aim Targets Interactive Toggles */}
        {showAimControls && (
          <>
            <g style={{ cursor: 'pointer' }} onClick={() => setAimMode('object')}>
              <rect x="35" y="70" width="130" height="26" rx="6" fill={aimMode === 'object' ? 'rgba(232,134,74,0.2)' : 'rgba(255,245,230,0.05)'} stroke={aimMode === 'object' ? '#e8864a' : 'rgba(255,245,230,0.15)'} />
              <text x="100" y="86" textAnchor="middle" fill={aimMode === 'object' ? '#e8864a' : 'rgba(255,245,230,0.7)'} fontSize="9" fontWeight="600">
                Aim: {selectedObject || 'Object'} (Body)
              </text>
            </g>

            <g style={{ cursor: 'pointer' }} onClick={() => setAimMode('spot')}>
              <rect x="35" y="105" width="130" height="26" rx="6" fill={aimMode === 'spot' ? 'rgba(239,68,68,0.2)' : 'rgba(255,245,230,0.05)'} stroke={aimMode === 'spot' ? '#ef4444' : 'rgba(255,245,230,0.15)'} />
              <text x="100" y="121" textAnchor="middle" fill={aimMode === 'spot' ? '#f87171' : 'rgba(255,245,230,0.7)'} fontSize="9" fontWeight="600">
                Aim: Spot (Location)
              </text>
            </g>
          </>
        )}
      </svg>

      {showAimControls && (
        <div className="la-studio-caption">
          {aimMode === 'object' ? (
            <span>👉 Aimed at the <strong>entire physical body</strong> of the {(selectedObject || 'chosen object').toLowerCase()} (has size, weight, material).</span>
          ) : (
            <span style={{ color: '#f87171' }}>🎯 Aimed at the <strong>exact spot in space</strong> where the {(selectedObject || 'chosen object').toLowerCase()} is located!</span>
          )}
        </div>
      )}
    </div>
  );
}
const InteractiveRoomVisual = InteractiveEnvironmentVisual;

// ==========================================
// 2. VISUAL: Interactive Drawing Notepad (Q1, Q2)
// ==========================================
function InteractiveDrawingPad({ dotPos, onDrawDot, setDotPos }) {
  const handleCanvasClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    if (onDrawDot) onDrawDot({ x, y });
    else if (setDotPos) setDotPos({ x, y });
  };

  return (
    <div className="la-paper-pad">
      <div className="la-paper-pad-header">
        <span className="la-pad-title">📝 Paper Canvas — Tap anywhere to place your dot</span>
        {dotPos && <span className="la-pad-coords">Dot at ({dotPos.x}px, {dotPos.y}px)</span>}
      </div>

      <div className="la-paper-sheet" onClick={handleCanvasClick}>
        {!dotPos ? (
          <div className="la-paper-prompt">
            <span className="la-pen-icon">✍️</span>
            <span>Tap here to draw a small dot on paper</span>
          </div>
        ) : (
          <div
            className="la-ink-dot"
            style={{ left: `${dotPos.x}px`, top: `${dotPos.y}px` }}
          >
            <span className="la-dot-ripple" />
          </div>
        )}
      </div>
    </div>
  );
}
const DotZoomVisual = InteractiveDrawingPad;

// ==========================================
// 3. VISUAL: Microscope Zoom Studio (Q2)
// ==========================================
function MicroscopeStudio({ zoomLevel, setZoomLevel, dotPos }) {
  const inkRadius = 4 + (zoomLevel - 1) * 8.5;
  const isZoomed = zoomLevel > 1;

  return (
    <div className="la-visual-card">
      <div className="la-visual-subhead">
        🔬 Microscope Inspection: Zooming into the Drawn Dot on Paper
      </div>
      <svg className="la-svg-canvas" viewBox="0 0 420 180">
        <defs>
          <radialGradient id="microInkGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={isZoomed ? 0.4 : 0.95} />
            <stop offset="85%" stopColor="#2563eb" stopOpacity={isZoomed ? 0.25 : 0.95} />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity={isZoomed ? 0.1 : 0.85} />
          </radialGradient>
        </defs>

        {/* Paper texture */}
        <rect x="30" y="15" width="360" height="150" rx="8" fill="#241e1a" stroke="rgba(255,245,230,0.18)" />
        <text x="45" y="35" fill="rgba(255,245,230,0.4)" fontSize="9">Sheet of Paper</text>

        {/* Grid fibers when zoomed */}
        {isZoomed && (
          <g opacity="0.12">
            <line x1="30" y1="90" x2="390" y2="90" stroke="#fff" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="210" y1="15" x2="210" y2="165" stroke="#fff" strokeWidth="0.5" strokeDasharray="4,4" />
          </g>
        )}

        {/* Center mathematical point (invisible location) */}
        <circle cx="210" cy="90" r="2" fill="#ef4444" />
        {isZoomed && (
          <g>
            <circle cx="210" cy="90" r="7" fill="none" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="2,2" />
            <line x1="196" y1="90" x2="224" y2="90" stroke="#ef4444" strokeWidth="0.8" />
            <line x1="210" y1="76" x2="210" y2="104" stroke="#ef4444" strokeWidth="0.8" />
          </g>
        )}

        {/* Ink Speck Covering */}
        <circle
          cx="210"
          cy="90"
          r={inkRadius}
          fill="url(#microInkGlow)"
          stroke="#60a5fa"
          strokeWidth={isZoomed ? 1.5 : 0}
        />

        {/* Dynamic Labels */}
        {!isZoomed ? (
          <g>
            <line x1="210" y1="90" x2="285" y2="65" stroke="#60a5fa" strokeWidth="1.2" />
            <circle cx="285" cy="65" r="2.5" fill="#60a5fa" />
            <text x="292" y="68" fill="#60a5fa" fontSize="9.5" fontWeight="bold">
              Pen Mark (Drawn Dot)
            </text>
            <text x="210" y="145" textAnchor="middle" fill="rgba(255,245,230,0.6)" fontSize="9">
              At 1x normal view, the ink dot covers the location: we see a visible mark.
            </text>
          </g>
        ) : (
          <g>
            <line
              x1={210 + inkRadius * 0.707}
              y1={90 - inkRadius * 0.707}
              x2="310"
              y2="45"
              stroke="#60a5fa"
              strokeWidth="1.2"
            />
            <circle cx="310" cy="45" r="2.5" fill="#60a5fa" />
            <text x="316" y="48" fill="#60a5fa" fontSize="9" fontWeight="bold">
              Visible Ink Speck (Size &gt; 0)
            </text>

            <line x1="210" y1="90" x2="310" y2="95" stroke="#ef4444" strokeWidth="1.2" />
            <circle cx="310" cy="95" r="2.5" fill="#ef4444" />
            <text x="316" y="98" fill="#ef4444" fontSize="9" fontWeight="bold">
              True Spot (Size = 0)
            </text>

            <text x="210" y="155" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">
              Magnified {zoomLevel}x: The paper has an ink speck, but the spot itself has zero size!
            </text>
          </g>
        )}
      </svg>

      <div className="la-visual-actions">
        <button
          className={`la-pill-btn ${zoomLevel === 1 ? 'active' : ''}`}
          onClick={() => setZoomLevel(1)}
        >
          1x (Normal Dot)
        </button>
        <button
          className={`la-pill-btn ${zoomLevel === 3 ? 'active' : ''}`}
          onClick={() => setZoomLevel(3)}
        >
          3x (Magnifying Glass)
        </button>
        <button
          className={`la-pill-btn ${zoomLevel === 7 ? 'active' : ''}`}
          onClick={() => setZoomLevel(7)}
        >
          7x (Microscope View)
        </button>
      </div>

      <div className="la-slider-control">
        <label>Adjust Magnification: <strong>{zoomLevel}x</strong></label>
        <input
          type="range"
          min="1"
          max="8"
          step="0.5"
          value={zoomLevel}
          onChange={(e) => setZoomLevel(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

// ==========================================
// 4. VISUAL: Size Inspector (Q3)
// ==========================================
function SizeInspectorVisual({ selectedObject = 'Bulb' }) {
  return (
    <div className="la-visual-card">
      <div className="la-visual-subhead">
        📐 Size Inspector: Physical Object Body vs. Spatial Spot
      </div>
      <svg className="la-svg-canvas" viewBox="0 0 420 170">
        {/* Left Card: Object Body */}
        <rect x="35" y="20" width="165" height="130" rx="8" fill="#231e1a" stroke="rgba(232, 134, 74, 0.3)" />
        <text x="117" y="42" textAnchor="middle" fill="#e8864a" fontSize="11" fontWeight="bold">
          Physical {selectedObject}
        </text>
        <rect x="75" y="55" width="85" height="50" rx="6" fill="rgba(232,134,74,0.15)" stroke="#e8864a" strokeDasharray="3,3" />
        <text x="117" y="84" textAnchor="middle" fill="#ede8e3" fontSize="9.5">
          Length × Width × Height
        </text>
        <text x="117" y="125" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
          Has Size &gt; 0 (A Body)
        </text>

        {/* Right Card: The Spot */}
        <rect x="220" y="20" width="165" height="130" rx="8" fill="#231e1a" stroke="rgba(239, 68, 68, 0.3)" />
        <text x="302" y="42" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="bold">
          The Spot (Location)
        </text>
        <circle cx="302" cy="80" r="3.5" fill="#ef4444" />
        <circle cx="302" cy="80" r="12" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
        <text x="302" y="125" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">
          Size = 0 (No Body)
        </text>
      </svg>
      <div className="la-studio-caption">
        A spot is just a place. It takes up <strong>no physical space</strong> of its own. Only the object occupying it has size!
      </div>
    </div>
  );
}

// ==========================================
// 5. VISUAL: Top-Down Spatial Field of View Studio (Q10-Q12)
// ==========================================
function SpatialFieldOfViewVisual({
  unseenSpot = 'Behind me on the chair',
  showMentalRay = false,
  showObserverToggle = false,
  observerPresent = true,
  onToggleObserver
}) {
  // Determine location coordinates based on the selected unseenSpot
  let spotX = 220;
  let spotY = 168; // directly behind (180°)
  const lower = (unseenSpot || '').toLowerCase();
  if (lower.includes('desk') || lower.includes('under') || lower.includes('floor')) {
    spotX = 115;
    spotY = 145; // lower-left
  } else if (lower.includes('wall') || lower.includes('tree') || lower.includes('trunk') || lower.includes('path') || lower.includes('bench')) {
    spotX = 325;
    spotY = 150; // lower-right
  }

  return (
    <div className="la-fov-studio">
      <div className="la-fov-header">
        <span className="la-fov-title">🗺️ Top-Down Spatial Awareness Radar</span>
        {showObserverToggle && (
          <div className="la-observer-toggle-wrap">
            <button
              className={`la-pill-btn ${observerPresent ? 'active' : ''}`}
              onClick={onToggleObserver}
            >
              {observerPresent ? '👁️ Observer Present' : '🌌 No Observer (Empty Space)'}
            </button>
          </div>
        )}
      </div>

      <svg className="la-svg-canvas" viewBox="0 0 440 205">
        <defs>
          {/* Vision cone gradient radiating forward towards screen */}
          <radialGradient id="fovConeGlow" cx="50%" cy="100%" r="90%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.02" />
          </radialGradient>
          {/* Pulsing spot glow */}
          <radialGradient id="spotAmberGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#d97706" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Spatial Room Boundary */}
        <rect x="20" y="10" width="400" height="185" rx="10" fill="#181512" stroke="rgba(255,245,230,0.15)" strokeWidth="1.2" />
        <circle cx="220" cy="110" r="75" fill="none" stroke="rgba(255,245,230,0.08)" strokeWidth="1" strokeDasharray="3,3" />

        {/* Ambient Unseen Space Labels */}
        <text x="35" y="112" fill="rgba(255,245,230,0.3)" fontSize="8" fontWeight="bold">UNSEEN SPACE</text>
        <text x="405" y="112" textAnchor="end" fill="rgba(255,245,230,0.3)" fontSize="8" fontWeight="bold">UNSEEN SPACE</text>
        <text x="220" y="198" textAnchor="middle" fill="rgba(255,245,230,0.4)" fontSize="7.5">BEHIND YOU (180°)</text>

        {/* Screen at the Top (Facing Forward at 0°) */}
        <rect x="170" y="16" width="100" height="12" rx="3" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.2" />
        <text x="220" y="25" textAnchor="middle" fill="#bfdbfe" fontSize="7.5" fontWeight="bold">
          🖥️ YOUR SCREEN (0°)
        </text>

        {/* Forward Field of View (FOV) Cone from Observer */}
        {observerPresent && (
          <g>
            <polygon points="220,110 145,28 295,28" fill="url(#fovConeGlow)" />
            <line x1="220" y1="110" x2="145" y2="28" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
            <line x1="220" y1="110" x2="295" y2="28" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
            <text x="220" y="65" textAnchor="middle" fill="#7dd3fc" fontSize="8" fontWeight="500">
              Forward Field of View (Screen)
            </text>
          </g>
        )}

        {/* Mental Awareness Ray (Q11 & Q12) */}
        {showMentalRay && observerPresent && (
          <g>
            <line
              x1="220"
              y1="110"
              x2={spotX}
              y2={spotY}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4,3"
            />
            <circle cx={(220 + spotX) / 2} cy={(110 + spotY) / 2} r="10" fill="#292524" stroke="#f59e0b" strokeWidth="1" />
            <text x={(220 + spotX) / 2} y={(110 + spotY) / 2 + 3} textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="bold">
              🧠 Mind
            </text>
          </g>
        )}

        {/* Observer Center [YOU] */}
        {observerPresent ? (
          <g>
            <circle cx="220" cy="110" r="15" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1.5" />
            <circle cx="220" cy="110" r="8.5" fill="#10b981" />
            <text x="220" y="113" textAnchor="middle" fill="#fff" fontSize="7.5" fontWeight="bold">
              YOU
            </text>
            {/* Forward Eye Arrow */}
            <polygon points="220,91 216,97 224,97" fill="#10b981" />
          </g>
        ) : (
          <g>
            <circle cx="220" cy="110" r="14" fill="none" stroke="rgba(255,245,230,0.15)" strokeWidth="1.2" strokeDasharray="3,3" />
            <text x="220" y="113" textAnchor="middle" fill="rgba(255,245,230,0.4)" fontSize="7">
              (Empty Space)
            </text>
          </g>
        )}

        {/* The Unseen Spot Marker (📍 Unseen Spot) */}
        {unseenSpot && (
          <g>
            {/* Pulsing ring */}
            <circle cx={spotX} cy={spotY} r="16" fill="url(#spotAmberGlow)" />
            <circle cx={spotX} cy={spotY} r="9" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3,2" />
            {/* True Spot point */}
            <circle cx={spotX} cy={spotY} r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            {/* Label pill */}
            <rect
              x={spotX - 58}
              y={spotY + 9}
              width="116"
              height="16"
              rx="4"
              fill="#24190e"
              stroke="#f59e0b"
              strokeWidth="1"
            />
            <text x={spotX} y={spotY + 20} textAnchor="middle" fill="#fef3c7" fontSize="7.5" fontWeight="bold">
              📍 {unseenSpot.length > 20 ? unseenSpot.slice(0, 18) + '...' : unseenSpot}
            </text>
          </g>
        )}
      </svg>

      <div className="la-studio-caption">
        {!showObserverToggle ? (
          <span>
            You are facing forward at the screen. The <strong>📍 spot</strong> sits outside your vision cone in surrounding space.
          </span>
        ) : observerPresent ? (
          <span>
            The spot exists in space behind you. Toggle the observer to see what happens when no eyes are watching.
          </span>
        ) : (
          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
            ✨ Observer is absent, but the spot's location in space remains firmly in place!
          </span>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MAIN CLUSTER 1 STUDIO MODULE
// ==========================================
// OPTION SHUFFLING HELPERS (Fisher-Yates)
// ==========================================
function shuffleOptions(arr) {
  if (!arr || !Array.isArray(arr)) return [];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getRawOptionsForQuestion(qId, selectedObject) {
  const objName = (selectedObject || 'chosen object').toLowerCase();
  switch (qId) {
    case 3:
      return [
        { id: 'q3_obj', text: `The ${objName} itself`, isCorrect: false, aim: 'object' },
        { id: 'q3_spot', text: `The spot where the ${objName} is`, isCorrect: true, aim: 'spot' }
      ];
    case 5:
      return [
        { id: 'q5_rep', text: `The drawn dot represents the spot, while the ${objName} occupies it`, isCorrect: true },
        { id: 'q5_occ', text: `The drawn dot occupies the spot, while the ${objName} represents it`, isCorrect: false },
        { id: 'q5_both_rep', text: 'Both represent the spot', isCorrect: false },
        { id: 'q5_both_occ', text: 'Both occupy the spot', isCorrect: false }
      ];
    case 6:
      return [
        { id: 'q6_pretty', text: 'Because circles look pretty', isCorrect: false },
        { id: 'q6_tradition', text: "Because it's a tradition", isCorrect: false },
        { id: 'q6_visible', text: 'Because we have to put something visible on paper', isCorrect: true },
        { id: 'q6_easy', text: 'Because circles are the easiest shape to draw', isCorrect: false }
      ];
    case 7:
      return [
        { id: 'q7_yes', text: 'Yes, it has size and body', isCorrect: true, value: 'Yes, it has physical size / body' },
        { id: 'q7_no', text: 'No', isCorrect: false, value: 'No' }
      ];
    case 8:
      return [
        { id: 'q8_only_obj', text: `Only the ${objName} has size (the spot has zero size)`, isCorrect: true },
        { id: 'q8_both', text: 'Both have size', isCorrect: false },
        { id: 'q8_neither', text: 'Neither has size', isCorrect: false },
        { id: 'q8_only_spot', text: 'Only the spot has size', isCorrect: false }
      ];
    case 10:
      return [
        { id: 'q10_yes', text: 'Yes, I can picture and locate it in my mind', isCorrect: true },
        { id: 'q10_no', text: 'No, I cannot picture it', isCorrect: false }
      ];
    case 11:
      return [
        { id: 'q11_yes', text: 'Yes, the spot exists in space unseen', isCorrect: true },
        { id: 'q11_no', text: 'No, it only exists when seen', isCorrect: false }
      ];
    default:
      return [];
  }
}

function initAllShuffledOptions(selectedObject) {
  const result = {};
  [3, 5, 6, 7, 8, 10, 11].forEach((qId) => {
    result[qId] = shuffleOptions(getRawOptionsForQuestion(qId, selectedObject));
  });
  return result;
}

// ==========================================
// MAIN STUDIO MODULE: Point Studio (Understanding the Point)
// ==========================================
export default function LinearAlgebraModule({ onBack, questions = POINT_PATH_QUESTIONS }) {
  const [currentIdx, setCurrentIdx] = useState(0); // 0 to 10
  const [isFinished, setIsFinished] = useState(false);

  // Environment & Studio Interactive States
  const [userEnvironment, setUserEnvironment] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [aimMode, setAimMode] = useState('spot');
  const [dotPos, setDotPos] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [unseenSpotChoice, setUnseenSpotChoice] = useState('');
  const [customUnseenSpot, setCustomUnseenSpot] = useState('');
  const [observerPresent, setObserverPresent] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [hasPlottedPoint, setHasPlottedPoint] = useState(false);

  // Shuffled options for all option-based questions
  const [shuffledOptionsMap, setShuffledOptionsMap] = useState(() => initAllShuffledOptions(null));

  // Freshly shuffle options every time the learner enters an unsubmitted option question
  useEffect(() => {
    const qId = currentIdx + 1;
    if ([3, 5, 6, 7, 8, 10, 11].includes(qId)) {
      setShuffledOptionsMap((prev) => {
        // If already submitted, preserve the existing shuffled options to keep answer state intact
        if (answers[qId]?.isSubmitted) return prev;
        return {
          ...prev,
          [qId]: shuffleOptions(getRawOptionsForQuestion(qId, selectedObject))
        };
      });
    }
  }, [currentIdx, selectedObject]);

  // Answers State for all 11 questions
  const [answers, setAnswers] = useState({
    1: { value: null, isAnswered: false },
    2: { value: null, isAnswered: false },
    3: { selected: null, isSubmitted: false },
    4: { isDone: false },
    5: { selected: null, isSubmitted: false },
    6: { selected: null, isSubmitted: false },
    7: { value: null, isAnswered: false },
    8: { selected: null, text: '', isSubmitted: false },
    9: { spotName: '', isSubmitted: false },
    10: { selected: null, text: '', isSubmitted: false },
    11: { selected: null, text: '', userNote: '', isSubmitted: false }
  });

  const totalQuestions = questions.length;
  const currentQ = questions[currentIdx] || questions[0];

  const updateAnswer = (qId, updates) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], ...updates }
    }));
  };

  const isQuestionComplete = (qId) => {
    const a = answers[qId];
    if (!a) return false;
    if (qId === 1) return Boolean(a.value);
    if (qId === 2) return Boolean(a.value);
    if (qId === 3) return a.isSubmitted;
    if (qId === 4) return a.isDone;
    if (qId === 5) return a.isSubmitted;
    if (qId === 6) return a.isSubmitted;
    if (qId === 7) return Boolean(a.value);
    if (qId === 8) return a.isSubmitted;
    if (qId === 9) return Boolean(a.spotName);
    if (qId === 10) return Boolean(a.isSubmitted);
    if (qId === 11) return Boolean(a.isSubmitted);
    return false;
  };

  const completedCount = Object.keys(answers).filter((id) => isQuestionComplete(Number(id))).length;

  const handleNextQuestion = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setIsFinished(false);
    setUserEnvironment(null);
    setSelectedObject(null);
    setAimMode('spot');
    setDotPos(null);
    setZoomLevel(1);
    setUnseenSpotChoice('');
    setCustomUnseenSpot('');
    setObserverPresent(true);
    setIsEvaluating(false);
    setHasPlottedPoint(false);
    setShuffledOptionsMap(initAllShuffledOptions(null));
    setAnswers({
      1: { value: null, isAnswered: false },
      2: { value: null, isAnswered: false },
      3: { selected: null, isSubmitted: false },
      4: { isDone: false },
      5: { selected: null, isSubmitted: false },
      6: { selected: null, isSubmitted: false },
      7: { value: null, isAnswered: false },
      8: { selected: null, text: '', isSubmitted: false },
      9: { spotName: '', isSubmitted: false },
      10: { selected: null, text: '', isSubmitted: false },
      11: { selected: null, text: '', userNote: '', isSubmitted: false }
    });
  };

  const handleCompleteJourney = () => {
    if (!hasPlottedPoint) return;
    if (onBack) {
      onBack();
    } else {
      handleRestart();
    }
  };

  // Grand Finale: The Naming Handover Ceremony
  if (isFinished) {
    return (
      <div className="la-studio-wrapper">
        <div className="la-top-nav">
          {onBack && (
            <button className="la-back-btn" onClick={onBack}>
              ← Back to Dashboard
            </button>
          )}
        </div>

        <div className="la-celebration-card">
          <div className="la-stars-row">🌟 🎯 🌟</div>
          <h2 className="la-celebration-title">{CLUSTER_1_SUMMARY.title}</h2>
          <p className="la-celebration-sub">
            You walked through all 11 observational questions along your discovery path and earned the fundamental idea of a spot.
          </p>

          {/* The Naming Handover */}
          <div className="la-handover-box">
            <span className="la-handover-badge">✨ THE NAMING HANDOVER</span>
            <blockquote className="la-handover-quote">
              "{CLUSTER_1_SUMMARY.namingHandover.quote}"
            </blockquote>
          </div>

          {/* GeoGebra Lab: Plot Your Point (mode=kernel UI style) */}
          <div style={{ width: '100%', marginTop: '0.4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <span className="la-phase-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981', color: '#10b981' }}>
                Interactive GeoGebra Lab
              </span>
              <h3 style={{ margin: '0.25rem 0', fontSize: '1.25rem', color: 'var(--clr-heading, #ede8e3)' }}>
                Plot Your First Point on GeoGebra
              </h3>
              <p style={{ margin: 0, color: 'var(--clr-text-soft, #a89e94)', fontSize: '0.85rem' }}>
                Your spot is now formally a <strong>POINT</strong>. Use the interactive GeoGebra studio below to input coordinates and plot them live on the plane:
              </p>
            </div>
            <GeoGebraPointPlotter onPointPlotted={() => setHasPlottedPoint(true)} />
          </div>

          {/* What You Earned Checklist */}
          <div className="la-takeaways-card">
            <div className="la-takeaways-title">What You Earned Across the Path:</div>
            <ul className="la-takeaways-list">
              {CLUSTER_1_SUMMARY.takeaways.map((item, idx) => (
                <li key={idx} className="la-takeaway-item">
                  <span className="la-takeaway-check">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="la-next-path">
            <span>⏭️ <strong>Path Forward:</strong> {CLUSTER_1_SUMMARY.nextCluster}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                className="la-btn-primary"
                onClick={handleCompleteJourney}
                disabled={!hasPlottedPoint}
                title={!hasPlottedPoint ? "Plot a point on the GeoGebra grid above to complete your journey" : "Complete the journey"}
              >
                Complete Journey 🎓
              </button>
              <button className="la-btn-secondary" onClick={handleRestart}>
                Explore the Journey Again 🔄
              </button>
              {onBack && (
                <button className="la-btn-secondary" onClick={onBack}>
                  Dashboard 🏠
                </button>
              )}
            </div>
            {!hasPlottedPoint && (
              <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontStyle: 'italic', textAlign: 'center' }}>
                💡 Plot a point on the GeoGebra grid above to unlock and complete your journey.
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="la-studio-wrapper">
      {/* Top Nav */}
      <div className="la-top-nav">
        {onBack && (
          <button className="la-back-btn" onClick={onBack}>
            ← Back to Tenali
          </button>
        )}
        <div className="la-progress-badge">
          <span>Question</span>
          <strong>{currentIdx + 1} / {totalQuestions}</strong>
        </div>
      </div>

      {/* Header */}
      <div className="la-header">
        <div className="la-phase-pill">{currentQ.phaseTitle}</div>
        <h1 className="la-title">{PATH_META.title}</h1>
        <p className="la-subtitle">{PATH_META.subtitle}</p>
      </div>

      {/* Unified 11-Question Progress Stepper Bar */}
      <div className="la-stepper-bar">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIdx;
          const isDone = isQuestionComplete(q.id);
          let className = 'la-step-pill';
          if (isDone) className += ' completed';
          if (isCurrent) className += ' active';

          return (
            <button
              key={q.id}
              className={className}
              onClick={() => setCurrentIdx(idx)}
              title={`Question ${q.id}: ${q.title}`}
            >
              <span className="la-pill-num">{q.id}</span>
            </button>
          );
        })}
      </div>

      {/* Main Question Card */}
      <div className="la-card">
        {/* Card Header with Question Title and Phase */}
        <div className="la-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="la-question-badge">Q{currentQ.id}</span>
            <span className="la-topic-badge">{currentQ.title}</span>
          </div>
          <span className="la-question-num">Question {currentQ.id} of {totalQuestions}</span>
        </div>

        {/* QUESTION CONTENT CONTAINER */}
        <div className="la-step-container">
          {/* =================================================== */}
          {/* QUESTION 1: PHYSICAL SURROUNDINGS                   */}
          {/* =================================================== */}
          {currentIdx === 0 && (
            <div className="la-single-step-view">
              <h3 className="la-step-heading">{currentQ.prompt}</h3>
              <p className="la-step-subtext">{currentQ.subtext}</p>

              <div className="la-options-stack" style={{ marginTop: '0.5rem' }}>
                {ENVIRONMENTS.map((env) => (
                  <button
                    key={env.id}
                    className={`la-option-btn ${userEnvironment === env.id ? 'selected' : ''}`}
                    onClick={() => {
                      setUserEnvironment(env.id);
                      setSelectedObject(null);
                      updateAnswer(1, { value: env.id, isAnswered: true });
                      updateAnswer(2, { value: null, isAnswered: false });
                    }}
                  >
                    <span className="la-option-letter">{env.icon}</span>
                    <span><strong>{env.label}</strong> ({env.note})</span>
                  </button>
                ))}
              </div>

              <div className="la-step-footer-actions end" style={{ marginTop: '0.75rem' }}>
                <button
                  className="la-btn-primary"
                  disabled={!userEnvironment}
                  onClick={() => setCurrentIdx(1)}
                >
                  Continue to Question 2 →
                </button>
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 2: SPOT AN OBJECT                          */}
          {/* =================================================== */}
          {currentIdx === 1 && (
            <div className="la-single-step-view">
              <h3 className="la-step-heading">{currentQ.prompt}</h3>
              <p className="la-step-subtext">
                {userEnvironment === 'room' && '— In a room: a bulb, clock, hanger, or switch on the wall or ceiling.'}
                {userEnvironment === 'outside' && '— Outside: a tree, sign, lamp post, or bench.'}
                {userEnvironment === 'vehicle' && '— In a vehicle: a handle, window, or seat.'}
                {!userEnvironment && '— Look around and select an object from the options below:'}
              </p>

              <div className="la-btn-row">
                {(ENVIRONMENT_OBJECTS[userEnvironment] || ENVIRONMENT_OBJECTS.room).map((obj) => (
                  <button
                    key={obj}
                    className={`la-choice-btn ${selectedObject === obj ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedObject(obj);
                      updateAnswer(2, { value: obj, isAnswered: true });
                    }}
                  >
                    {obj === 'Bulb' && '💡 '}
                    {obj === 'Clock' && '⏰ '}
                    {obj === 'Hanger' && '🧥 '}
                    {obj === 'Switch' && '🔘 '}
                    {obj === 'Tree' && '🌳 '}
                    {obj === 'Sign' && '🪧 '}
                    {obj === 'Lamp Post' && '🏮 '}
                    {obj === 'Bench' && '🪑 '}
                    {obj === 'Handle' && '🪢 '}
                    {obj === 'Window' && '🪟 '}
                    {obj === 'Seat' && '💺 '}
                    {obj}
                  </button>
                ))}
              </div>

              {/* Environment Graphic (Preview only, no pointer finger) */}
              <div style={{ marginTop: '0.75rem' }}>
                <InteractiveEnvironmentVisual
                  environment={userEnvironment || 'room'}
                  selectedObject={selectedObject}
                  onSelectObject={(obj) => {
                    setSelectedObject(obj);
                    updateAnswer(2, { value: obj, isAnswered: true });
                  }}
                  aimMode={aimMode}
                  setAimMode={setAimMode}
                  showAimControls={false}
                  showFinger={false}
                  showToolbar={false}
                />
              </div>

              <div className="la-step-footer-actions between">
                <button className="la-btn-secondary" onClick={() => setCurrentIdx(0)}>
                  ← Back to Question 1
                </button>
                <button
                  className="la-btn-primary"
                  disabled={!selectedObject}
                  onClick={() => setCurrentIdx(2)}
                >
                  Continue to Question 3 →
                </button>
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 3: WHERE DOES YOUR FINGER LAND?            */}
          {/* =================================================== */}
          {currentIdx === 2 && (
            <div className="la-single-step-view">
              <h3 className="la-step-heading">
                Point your finger at it. Where is your finger aimed — at the <strong>object itself</strong>, or at the <strong>spot where the object is</strong>?
              </h3>
              <p className="la-step-subtext">
                Think about it: The {(selectedObject || 'chosen object').toLowerCase()} has size, weight, and volume. Where does your point of gaze really land?
              </p>

              {/* Environment Studio with Aim Toggles & Pointer Finger */}
              <InteractiveEnvironmentVisual
                environment={userEnvironment || 'room'}
                selectedObject={selectedObject}
                onSelectObject={setSelectedObject}
                aimMode={aimMode}
                setAimMode={setAimMode}
                showAimControls={true}
                showFinger={true}
                showToolbar={false}
              />

              <div className="la-options-stack" style={{ marginTop: '0.75rem' }}>
                {(shuffledOptionsMap[3] || getRawOptionsForQuestion(3, selectedObject)).map((opt, i) => {
                  const isSelected = answers[3]?.selectedId === opt.id;
                  let cls = 'la-option-btn';
                  if (isSelected) cls += ' selected';
                  if (answers[3]?.isSubmitted) {
                    if (opt.isCorrect) cls += ' correct';
                    else if (isSelected) cls += ' incorrect';
                  }

                  return (
                    <button
                      key={opt.id}
                      className={cls}
                      onClick={() => {
                        if (!answers[3]?.isSubmitted) {
                          updateAnswer(3, { selectedId: opt.id, selected: i, text: opt.text });
                          setAimMode(opt.aim || (opt.isCorrect ? 'spot' : 'object'));
                        }
                      }}
                      disabled={answers[3]?.isSubmitted}
                    >
                      <span className="la-option-letter">{String.fromCharCode(65 + i)}</span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {!answers[3]?.isSubmitted ? (
                <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                  <button className="la-btn-secondary" onClick={() => setCurrentIdx(1)}>
                    ← Back to Question 2
                  </button>
                  <button
                    className="la-btn-primary"
                    disabled={!answers[3]?.selectedId}
                    onClick={() => updateAnswer(3, { isSubmitted: true })}
                  >
                    Check Observation
                  </button>
                </div>
              ) : (
                <div className="la-earns-card" style={{ marginTop: '0.75rem' }}>
                  <div className="la-earns-badge">🎉 EARNED INSIGHT</div>
                  <p className="la-earns-text">
                    Your finger lands on the <strong>spot</strong>, not the entire physical body.
                  </p>
                  <div className="la-step-footer-actions between">
                    <button className="la-btn-secondary" onClick={() => setCurrentIdx(1)}>
                      ← Back to Question 2
                    </button>
                    <button className="la-btn-primary" onClick={() => setCurrentIdx(3)}>
                      Continue to Question 4 →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 4: DRAWING A DOT                           */}
          {/* =================================================== */}
          {currentIdx === 3 && (
            <div className="la-single-step-view">
              <h3 className="la-step-heading">{currentQ.prompt}</h3>
              <p className="la-step-subtext">
                Draw it physically on paper in front of you, or click anywhere on the digital pad below:
              </p>

              <InteractiveDrawingPad
                dotPos={dotPos}
                onDrawDot={(pos) => {
                  setDotPos(pos);
                  updateAnswer(4, { isDone: true });
                }}
              />

              <div className="la-btn-row" style={{ marginTop: '0.75rem' }}>
                <button
                  className={`la-choice-btn large ${answers[4]?.isDone ? 'selected' : ''}`}
                  onClick={() => updateAnswer(4, { isDone: true })}
                >
                  {answers[4]?.isDone ? '✓ Yes, Dot is Drawn!' : 'Done — I drew the dot on paper ✓'}
                </button>
              </div>

              {answers[4]?.isDone && (
                <div className="la-credit-box" style={{ marginTop: '0.5rem' }}>
                  <span>✓ <strong>Physical Confirmation:</strong> You have created a tiny mark standing in for a location on paper.</span>
                </div>
              )}

              <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                <button className="la-btn-secondary" onClick={() => setCurrentIdx(2)}>
                  ← Back to Question 3
                </button>
                <button
                  className="la-btn-primary"
                  disabled={!answers[4]?.isDone}
                  onClick={() => setCurrentIdx(4)}
                >
                  Continue to Question 5 →
                </button>
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 5: REPRESENTATION VS. OCCUPATION           */}
          {/* =================================================== */}
          {currentIdx === 4 && (
            <div className="la-single-step-view">
              <h3 className="la-step-heading">
                Of the two — which one <em>represents</em> the place in space (stands in for it), and which one <em>occupies</em> it (has a body, is at it)?
              </h3>
              <p className="la-step-subtext">
                Comparing: The drawn dot on paper vs. Your chosen object ({(selectedObject || 'chosen object').toLowerCase()}).
              </p>

              <div className="la-options-stack" style={{ marginTop: '0.5rem' }}>
                {(shuffledOptionsMap[5] || getRawOptionsForQuestion(5, selectedObject)).map((opt, i) => {
                  const isSelected = answers[5]?.selectedId === opt.id;
                  let cls = 'la-option-btn';
                  if (isSelected) cls += ' selected';
                  if (answers[5]?.isSubmitted) {
                    if (opt.isCorrect) cls += ' correct';
                    else if (isSelected) cls += ' incorrect';
                  }

                  return (
                    <button
                      key={opt.id}
                      className={cls}
                      onClick={() => {
                        if (!answers[5]?.isSubmitted) {
                          updateAnswer(5, { selectedId: opt.id, selected: i, text: opt.text });
                        }
                      }}
                      disabled={answers[5]?.isSubmitted}
                    >
                      <span className="la-option-letter">{String.fromCharCode(65 + i)}</span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {!answers[5]?.isSubmitted ? (
                <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                  <button className="la-btn-secondary" onClick={() => setCurrentIdx(3)}>
                    ← Back to Question 4
                  </button>
                  <button
                    className="la-btn-primary"
                    disabled={!answers[5]?.selectedId}
                    onClick={() => updateAnswer(5, { isSubmitted: true })}
                  >
                    Check Answer
                  </button>
                </div>
              ) : (
                <div className="la-earns-card" style={{ marginTop: '0.75rem' }}>
                  <div className="la-earns-badge">🎉 EARNED INSIGHT</div>
                  <p className="la-earns-text">
                    The drawn dot is a stand-in for the spot; the {(selectedObject || 'chosen object').toLowerCase()} has a body and is at the spot.
                  </p>
                  <div className="la-step-footer-actions between">
                    <button className="la-btn-secondary" onClick={() => setCurrentIdx(3)}>
                      ← Back to Question 4
                    </button>
                    <button className="la-btn-primary" onClick={() => setCurrentIdx(5)}>
                      Continue to Question 6 →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 6: WHY DRAW MARKS?                         */}
          {/* =================================================== */}
          {currentIdx === 5 && (
            <div className="la-single-step-view">
              <h3 className="la-step-heading">{currentQ.prompt}</h3>
              <p className="la-step-subtext">{currentQ.subtext}</p>

              <div className="la-options-stack" style={{ marginTop: '0.5rem' }}>
                {(shuffledOptionsMap[6] || getRawOptionsForQuestion(6, selectedObject)).map((opt, i) => {
                  const isSelected = answers[6]?.selectedId === opt.id;
                  let cls = 'la-option-btn';
                  if (isSelected) cls += ' selected';
                  if (answers[6]?.isSubmitted) {
                    if (opt.isCorrect) cls += ' correct';
                    else if (isSelected) cls += ' incorrect';
                  }

                  return (
                    <button
                      key={opt.id}
                      className={cls}
                      onClick={() => {
                        if (!answers[6]?.isSubmitted) {
                          updateAnswer(6, { selectedId: opt.id, selected: i, text: opt.text });
                        }
                      }}
                      disabled={answers[6]?.isSubmitted}
                    >
                      <span className="la-option-letter">{String.fromCharCode(65 + i)}</span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {!answers[6]?.isSubmitted ? (
                <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                  <button className="la-btn-secondary" onClick={() => setCurrentIdx(4)}>
                    ← Back to Question 5
                  </button>
                  <button
                    className="la-btn-primary"
                    disabled={!answers[6]?.selectedId}
                    onClick={() => updateAnswer(6, { isSubmitted: true })}
                  >
                    Check Answer
                  </button>
                </div>
              ) : (
                <div className="la-earns-card" style={{ marginTop: '0.75rem' }}>
                  <div className="la-earns-badge">🎉 EARNED INSIGHT</div>
                  <p className="la-earns-text">
                    A spot itself cannot be drawn — we need a stand-in (the smallest visible thing on paper).
                  </p>
                  <div className="la-step-footer-actions between">
                    <button className="la-btn-secondary" onClick={() => setCurrentIdx(4)}>
                      ← Back to Question 5
                    </button>
                    <button className="la-btn-primary" onClick={() => setCurrentIdx(6)}>
                      Continue to Question 7 →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 7: BODY & DIMENSIONS OF THE OBJECT        */}
          {/* =================================================== */}
          {currentIdx === 6 && (
            <div className="la-single-step-view">
              <h3 className="la-step-heading">
                Does the {(selectedObject || 'chosen object').toLowerCase()} have size, like a body — length, width, something you can see?
              </h3>
              <p className="la-step-subtext">{currentQ.subtext}</p>

              <div className="la-btn-row" style={{ marginTop: '0.5rem' }}>
                {(shuffledOptionsMap[7] || getRawOptionsForQuestion(7, selectedObject)).map((opt) => (
                  <button
                    key={opt.id}
                    className={`la-choice-btn large ${answers[7]?.value === opt.value ? 'selected' : ''}`}
                    onClick={() => updateAnswer(7, { value: opt.value, isAnswered: true })}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>

              {/* 3D Wireframe Size Inspector */}
              <div style={{ marginTop: '0.75rem' }}>
                <SizeInspectorVisual selectedObject={selectedObject || 'Bulb'} />
              </div>

              <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                <button className="la-btn-secondary" onClick={() => setCurrentIdx(5)}>
                  ← Back to Question 6
                </button>
                <button
                  className="la-btn-primary"
                  disabled={!answers[7]?.value}
                  onClick={() => setCurrentIdx(7)}
                >
                  Continue to Question 8 →
                </button>
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 8: SIZE OF THE SPOT                       */}
          {/* =================================================== */}
          {currentIdx === 7 && (
            <div className="la-single-step-view">
              <h3 className="la-step-heading">
                Does the spot have size too, or only the {(selectedObject || 'chosen object').toLowerCase()}?
              </h3>
              <p className="la-step-subtext">{currentQ.subtext}</p>

              <div className="la-options-stack" style={{ marginTop: '0.5rem' }}>
                {(shuffledOptionsMap[8] || getRawOptionsForQuestion(8, selectedObject)).map((opt, i) => {
                  const isSelected = answers[8]?.selectedId === opt.id;
                  let cls = 'la-option-btn';
                  if (isSelected) cls += ' selected';
                  if (answers[8]?.isSubmitted) {
                    if (opt.isCorrect) cls += ' correct';
                    else if (isSelected) cls += ' incorrect';
                  }

                  return (
                    <button
                      key={opt.id}
                      className={cls}
                      onClick={() => {
                        if (!answers[8]?.isSubmitted) {
                          updateAnswer(8, { selectedId: opt.id, selected: i, text: opt.text });
                        }
                      }}
                      disabled={answers[8]?.isSubmitted}
                    >
                      <span className="la-option-letter">{String.fromCharCode(65 + i)}</span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {!answers[8]?.isSubmitted ? (
                <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                  <button className="la-btn-secondary" onClick={() => setCurrentIdx(6)}>
                    ← Back to Question 7
                  </button>
                  <button
                    className="la-btn-primary"
                    disabled={!answers[8]?.selectedId}
                    onClick={() => updateAnswer(8, { isSubmitted: true })}
                  >
                    Check Observation
                  </button>
                </div>
              ) : (
                <div className="la-submitted-step-box">
                  <div className="la-submitted-header">
                    <span className="la-submitted-tag">Your Answer:</span>
                    <span className="la-credit-tag">✓ Credit Earned</span>
                  </div>
                  <p className="la-submitted-quote">"{answers[8]?.text}"</p>
                  <div className="la-credit-box">
                    <span>✓ <strong>Spot on:</strong> A spot has zero size! Only the {(selectedObject || 'chosen object').toLowerCase()} occupying it has physical dimensions.</span>
                  </div>

                  <div className="la-earns-card" style={{ marginTop: '0.75rem' }}>
                    <div className="la-earns-badge">🎉 EARNED INSIGHT</div>
                    <p className="la-earns-text">
                      A spot has no size — that is why we need a stand-in mark to see it on paper.
                    </p>
                    <div className="la-step-footer-actions between">
                      <button className="la-btn-secondary" onClick={() => setCurrentIdx(6)}>
                        ← Back to Question 7
                      </button>
                      <button className="la-btn-primary" onClick={() => setCurrentIdx(8)}>
                        Continue to Question 9 →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 9: A SPOT YOU AREN'T LOOKING AT           */}
          {/* =================================================== */}
          {currentIdx === 8 && (
            <div className="la-single-step-view">
              <h3 className="la-step-heading">{currentQ.prompt}</h3>
              <p className="la-step-subtext">{currentQ.subtext}</p>

              {/* Preset Location Chips */}
              <div className="la-btn-row" style={{ marginTop: '0.65rem' }}>
                {(UNSEEN_SPOTS_PRESETS[userEnvironment] || UNSEEN_SPOTS_PRESETS.room).map((preset) => (
                  <button
                    key={preset}
                    className={`la-choice-btn ${(answers[9]?.spotName === preset && !customUnseenSpot) ? 'selected' : ''}`}
                    onClick={() => {
                      setCustomUnseenSpot('');
                      setUnseenSpotChoice(preset);
                      updateAnswer(9, { spotName: preset, isSubmitted: true });
                    }}
                  >
                    📍 {preset}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div style={{ marginTop: '0.65rem' }}>
                <input
                  type="text"
                  className="la-text-input"
                  placeholder="Or type another spot (e.g. Under the desk, behind the door...)"
                  value={customUnseenSpot}
                  onChange={(e) => {
                    setCustomUnseenSpot(e.target.value);
                    setUnseenSpotChoice(e.target.value);
                    updateAnswer(9, { spotName: e.target.value, isSubmitted: Boolean(e.target.value.trim()) });
                  }}
                />
              </div>

              {/* Dynamic Top-down Spatial Awareness Studio */}
              <div style={{ marginTop: '0.75rem' }}>
                <SpatialFieldOfViewVisual
                  unseenSpot={answers[9]?.spotName || unseenSpotChoice || 'Behind me on the chair'}
                  showMentalRay={false}
                  showObserverToggle={false}
                  observerPresent={true}
                />
              </div>

              {answers[9]?.spotName && (
                <div className="la-credit-box" style={{ marginTop: '0.5rem' }}>
                  <span>✓ <strong>Spot Plotted:</strong> You have identified "{answers[9]?.spotName}" located in space outside your forward view.</span>
                </div>
              )}

              <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                <button className="la-btn-secondary" onClick={() => setCurrentIdx(7)}>
                  ← Back to Question 8
                </button>
                <button
                  className="la-btn-primary"
                  disabled={!answers[9]?.spotName?.trim()}
                  onClick={() => setCurrentIdx(9)}
                >
                  Continue to Question 10 →
                </button>
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 10: PICTURE IT MENTALLY                    */}
          {/* =================================================== */}
          {currentIdx === 9 && (
            <div className="la-single-step-view">
              <h3 className="la-step-heading">{currentQ.prompt}</h3>
              <p className="la-step-subtext">{currentQ.subtext}</p>

              {/* Top-down Spatial Radar with Mental Awareness Ray */}
              <div style={{ marginTop: '0.5rem' }}>
                <SpatialFieldOfViewVisual
                  unseenSpot={answers[9]?.spotName || 'Behind me on the chair'}
                  showMentalRay={true}
                  showObserverToggle={false}
                  observerPresent={true}
                />
              </div>

              <div className="la-options-stack" style={{ marginTop: '0.75rem' }}>
                {(shuffledOptionsMap[10] || getRawOptionsForQuestion(10, selectedObject)).map((opt, i) => {
                  const isSelected = answers[10]?.selectedId === opt.id;
                  let cls = 'la-option-btn';
                  if (isSelected) cls += ' selected';
                  if (answers[10]?.isSubmitted) {
                    if (opt.isCorrect) cls += ' correct';
                    else if (isSelected) cls += ' incorrect';
                  }

                  return (
                    <button
                      key={opt.id}
                      className={cls}
                      onClick={() => {
                        if (!answers[10]?.isSubmitted) {
                          updateAnswer(10, { selectedId: opt.id, selected: i, text: opt.text });
                        }
                      }}
                      disabled={answers[10]?.isSubmitted}
                    >
                      <span className="la-option-letter">{String.fromCharCode(65 + i)}</span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {!answers[10]?.isSubmitted ? (
                <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                  <button className="la-btn-secondary" onClick={() => setCurrentIdx(8)}>
                    ← Back to Question 9
                  </button>
                  <button
                    className="la-btn-primary"
                    disabled={!answers[10]?.selectedId}
                    onClick={() => updateAnswer(10, { isSubmitted: true })}
                  >
                    Check Observation
                  </button>
                </div>
              ) : (
                <div className="la-submitted-step-box">
                  <div className="la-submitted-header">
                    <span className="la-submitted-tag">Your Observation:</span>
                    <span className="la-credit-tag">✓ Credit Earned</span>
                  </div>
                  <p className="la-submitted-quote">"{answers[10]?.text}"</p>
                  <div className="la-credit-box">
                    <span>✓ <strong>Mental Spatial Map:</strong> {currentQ.creditExplanation}</span>
                  </div>

                  <div className="la-earns-card" style={{ marginTop: '0.75rem' }}>
                    <div className="la-earns-badge">🎉 EARNED INSIGHT</div>
                    <p className="la-earns-text">
                      A spot can be held and located in thought without direct sight. Your mind holds a 360° map of space.
                    </p>
                    <div className="la-step-footer-actions between">
                      <button className="la-btn-secondary" onClick={() => setCurrentIdx(8)}>
                        ← Back to Question 9
                      </button>
                      <button className="la-btn-primary" onClick={() => setCurrentIdx(10)}>
                        Continue to Question 11 →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================== */}
          {/* QUESTION 11: THE SPOT STILL EXISTS                  */}
          {/* =================================================== */}
          {currentIdx === 10 && (
            <div className="la-single-step-view">
              <h3 className="la-step-heading">{currentQ.prompt}</h3>
              <p className="la-step-subtext">{currentQ.subtext}</p>

              {/* Top-down Spatial Radar with Observer Presence Toggle */}
              <div style={{ marginTop: '0.5rem' }}>
                <SpatialFieldOfViewVisual
                  unseenSpot={answers[9]?.spotName || 'Behind me on the chair'}
                  showMentalRay={observerPresent}
                  showObserverToggle={true}
                  observerPresent={observerPresent}
                  onToggleObserver={() => setObserverPresent(!observerPresent)}
                />
              </div>

              <div className="la-options-stack" style={{ marginTop: '0.75rem' }}>
                {(shuffledOptionsMap[11] || getRawOptionsForQuestion(11, selectedObject)).map((opt, i) => {
                  const isSelected = answers[11]?.selectedId === opt.id;
                  let cls = 'la-option-btn';
                  if (isSelected) cls += ' selected';
                  if (answers[11]?.isSubmitted) {
                    if (opt.isCorrect) cls += ' correct';
                    else if (isSelected) cls += ' incorrect';
                  }

                  return (
                    <button
                      key={opt.id}
                      className={cls}
                      onClick={() => {
                        if (!answers[11]?.isSubmitted) {
                          updateAnswer(11, { selectedId: opt.id, selected: i, text: opt.text });
                        }
                      }}
                      disabled={answers[11]?.isSubmitted}
                    >
                      <span className="la-option-letter">{String.fromCharCode(65 + i)}</span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {!answers[11]?.isSubmitted ? (
                <div className="la-input-wrapper" style={{ marginTop: '0.75rem' }}>
                  <input
                    type="text"
                    className="la-text-input"
                    placeholder={currentQ.placeholder}
                    value={answers[11]?.userNote || ''}
                    onChange={(e) => updateAnswer(11, { userNote: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && answers[11]?.selectedId) {
                        updateAnswer(11, { isSubmitted: true });
                      }
                    }}
                  />

                  <div className="la-step-footer-actions between" style={{ marginTop: '0.75rem' }}>
                    <button className="la-btn-secondary" onClick={() => setCurrentIdx(9)}>
                      ← Back to Question 10
                    </button>
                    <button
                      className="la-btn-primary"
                      disabled={!answers[11]?.selectedId}
                      onClick={() => updateAnswer(11, { isSubmitted: true })}
                    >
                      Confirm Final Observation
                    </button>
                  </div>
                </div>
              ) : (
                <div className="la-submitted-step-box">
                  <div className="la-submitted-header">
                    <span className="la-submitted-tag">Your Final Realization:</span>
                    <span className="la-credit-tag">✓ Credit Earned</span>
                  </div>
                  <p className="la-submitted-quote">
                    "{answers[11]?.text}{answers[11]?.userNote ? ` — ${answers[11].userNote}` : ''}"
                  </p>
                  <div className="la-credit-box">
                    <span>✓ <strong>Abstract Reality:</strong> {currentQ.creditExplanation}</span>
                  </div>

                  <div className="la-earns-card" style={{ marginTop: '0.75rem' }}>
                    <div className="la-earns-badge">🎉 DISCOVERY JOURNEY COMPLETE</div>
                    <p className="la-earns-text">
                      You have earned every property of a spot: it is distinct from objects, has zero size, cannot be directly drawn, and exists unconditionally everywhere in space!
                    </p>
                    <div className="la-step-footer-actions between">
                      <button className="la-btn-secondary" onClick={() => setCurrentIdx(9)}>
                        ← Back to Question 10
                      </button>
                      <button className="la-btn-primary" onClick={() => setIsFinished(true)}>
                        Complete Journey &amp; Reveal The Naming Handover 🏆
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="la-bottom-nav">
        <button
          className="la-nav-btn"
          onClick={handlePrevQuestion}
          disabled={currentIdx === 0}
        >
          ← Previous Question
        </button>

        <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft, #a89e94)' }}>
          {PATH_META.title} ({completedCount} of {totalQuestions} finished)
        </span>

        <button
          className="la-nav-btn"
          onClick={handleNextQuestion}
          disabled={currentIdx === totalQuestions - 1}
        >
          Next Question →
        </button>
      </div>
    </div>
  );
}
