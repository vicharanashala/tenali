import React, { useEffect, useMemo, useRef, useState } from 'react';

const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

/**
 * Pure subatomic particle calculation per PDE Section 4.2.
 * Neutral ground-state atom: p+ = Z, e- = Z, n0 = A - Z.
 */
export function getSubatomicCounts(element) {
  const protons = element.number;
  const electrons = element.number;
  const neutrons = Math.max(0, element.massNumber - element.number);
  return { protons, neutrons, electrons };
}

/**
 * Deterministic golden-angle (phyllotaxis) packing for nucleons inside radius maxR.
 * Used for both Z <= 20 countable SVG nucleons and Z > 20 Canvas cluster.
 */
function buildNucleonLayout(protons, neutrons, maxR) {
  const total = protons + neutrons;
  if (total === 0) return [];

  // Interleave protons and neutrons evenly so both particle types are uniformly visible
  const types = [];
  let pRem = protons;
  let nRem = neutrons;
  while (pRem > 0 || nRem > 0) {
    if (pRem >= nRem && pRem > 0) {
      types.push('p');
      pRem -= 1;
    } else if (nRem > 0) {
      types.push('n');
      nRem -= 1;
    }
  }

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return types.map((type, idx) => {
    if (total === 1) {
      return { type, x: 0, y: 0, phase: 0 };
    }
    const r = maxR * Math.sqrt((idx + 0.5) / total);
    const theta = idx * goldenAngle;
    return {
      type,
      x: r * Math.cos(theta),
      y: r * Math.sin(theta),
      phase: idx * 1.37,
    };
  });
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function AtomVisualizerModal({
  element,
  onClose,
  onSelectElement,
  totalElements = 118,
  categoryMeta,
}) {
  const [isPlaying, setIsPlaying] = useState(() => !prefersReducedMotion());
  const [elapsedSec, setElapsedSec] = useState(0);
  const closeBtnRef = useRef(null);
  const canvasRef = useRef(null);
  const lastTsRef = useRef(null);

  const { protons, neutrons, electrons } = useMemo(
    () => getSubatomicCounts(element),
    [element]
  );

  const isSvgNucleus = element.number <= 20;

  // Dynamic Bohr shell radii R_k = R_0 + k * deltaR fitting inside 360x360 viewBox
  const shellCount = element.shells.length;
  const center = 180;
  const maxOrbitRadius = 158;
  const r0 = isSvgNucleus ? 30 : 38;
  const deltaR = shellCount > 0 ? (maxOrbitRadius - r0) / Math.max(shellCount, 1) : 20;

  const svgNucleons = useMemo(() => {
    if (!isSvgNucleus) return [];
    const maxPackR = Math.min(22, 6 + Math.sqrt(protons + neutrons) * 2.8);
    return buildNucleonLayout(protons, neutrons, maxPackR);
  }, [isSvgNucleus, protons, neutrons]);

  const canvasNucleons = useMemo(() => {
    if (isSvgNucleus) return [];
    return buildNucleonLayout(protons, neutrons, 28);
  }, [isSvgNucleus, protons, neutrons]);

  // Focus Close button when modal opens or switches element
  useEffect(() => {
    if (closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
  }, [element.number]);

  // Listen for Escape key and Left/Right arrow navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowLeft' && onSelectElement && element.number > 1) {
        onSelectElement(element.number - 1);
      } else if (event.key === 'ArrowRight' && onSelectElement && element.number < totalElements) {
        onSelectElement(element.number + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [element.number, onClose, onSelectElement, totalElements]);

  // Sync with OS prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event) => {
      if (event.matches) {
        setIsPlaying(false);
      }
    };
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    return undefined;
  }, []);

  // 60 FPS requestAnimationFrame clock for Bohr shells + nucleus animation
  useEffect(() => {
    if (!isPlaying) {
      lastTsRef.current = null;
      return undefined;
    }

    let rafId = 0;
    const tick = (timestamp) => {
      if (lastTsRef.current !== null) {
        const dt = Math.min((timestamp - lastTsRef.current) / 1000, 0.05);
        setElapsedSec((prev) => prev + dt);
      }
      lastTsRef.current = timestamp;
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
      lastTsRef.current = null;
    };
  }, [isPlaying]);

  // Render optimized HTML5 Canvas nucleon cluster for Z > 20
  useEffect(() => {
    if (isSvgNucleus) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
    if (!ctx) return;

    const size = 84;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;

    // Subtle glowing core halo
    const halo = ctx.createRadialGradient(cx, cy, 4, cx, cy, 38);
    halo.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
    halo.addColorStop(0.65, 'rgba(56, 189, 248, 0.16)');
    halo.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fill();

    // Draw packed nucleons with gentle thermal jitter
    const nucleonR = Math.max(2.1, Math.min(3.8, 34 / Math.sqrt(protons + neutrons)));
    const jitterAmp = isPlaying ? 0.55 : 0;

    for (let i = 0; i < canvasNucleons.length; i += 1) {
      const n = canvasNucleons[i];
      const jx = jitterAmp * Math.cos(elapsedSec * 4.5 + n.phase);
      const jy = jitterAmp * Math.sin(elapsedSec * 3.8 + n.phase * 1.2);
      const px = cx + n.x + jx;
      const py = cy + n.y + jy;

      ctx.beginPath();
      ctx.arc(px, py, nucleonR, 0, Math.PI * 2);
      ctx.fillStyle = n.type === 'p' ? '#ef4444' : '#94a3b8';
      ctx.fill();
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // Central high-contrast numeric summary pill inside canvas cluster
    ctx.fillStyle = 'rgba(15, 23, 42, 0.86)';
    ctx.beginPath();
    ctx.arc(cx, cy, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 9px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = '#fca5a5';
    ctx.fillText(`${protons}p+`, cx, cy - 5);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`${neutrons}n0`, cx, cy + 6);

    ctx.restore();
  }, [isSvgNucleus, canvasNucleons, protons, neutrons, elapsedSec, isPlaying]);

  const accentColor = categoryMeta?.color || '#06b6d4';
  const categoryLabel = categoryMeta?.label || element.category.replace(/-/g, ' ');
  const isotopeLabel = `${element.symbol}-${element.massNumber}`;
  const isotopeNote = element.isRadioactive
    ? 'Longest-lived known isotope (radioactive / synthetic)'
    : 'Most abundant stable isotope';

  const dialogAriaLabel = `${element.name} (${element.symbol}) Bohr atom model: ${protons} protons, ${neutrons} neutrons, ${electrons} electrons`;

  return (
    <div
      className="ptl-modal-backdrop"
      data-testid="atom-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="ptl-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={dialogAriaLabel}
        style={{ '--ptl-accent': accentColor } as React.CSSProperties}
      >
        <div className="ptl-modal-header">
          <div className="ptl-modal-title-group">
            <span className="ptl-modal-z-badge" style={{ backgroundColor: accentColor }}>
              Z = {element.number}
            </span>
            <div>
              <h2 className="ptl-modal-title">
                {element.name} <span className="ptl-modal-symbol">({element.symbol})</span>
              </h2>
              <p className="ptl-modal-subtitle">
                {categoryLabel} &middot; Period {element.period}
                {element.group ? ` \u00B7 Group ${element.group}` : ' \u00B7 f-block'}
              </p>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            className="ptl-icon-btn"
            onClick={onClose}
            aria-label="Close atom explorer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ptl-modal-body">
          {/* Left Stage: Live 2D SVG Bohr Shells + Hybrid Nucleus */}
          <div className="ptl-atom-stage-wrap">
            <div className="ptl-atom-stage">
              <svg
                viewBox="0 0 360 360"
                className="ptl-atom-svg"
                role="img"
                aria-label={`Animated 2D Bohr diagram of ${element.name} with ${shellCount} electron shell${shellCount === 1 ? '' : 's'}`}
              >
                {/* Concentric Bohr Shells: R_k = R_0 + k * deltaR */}
                {element.shells.map((electronCount, shellIdx) => {
                  const k = shellIdx + 1;
                  const radius = r0 + k * deltaR;
                  const omega = 1.15 / (0.65 + 0.45 * k);
                  const shellName = SHELL_NAMES[shellIdx] || `n=${k}`;

                  return (
                    <g key={shellName}>
                      <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.34)"
                        strokeWidth="1.25"
                        strokeDasharray={shellIdx % 2 === 1 ? '4 3' : undefined}
                      />
                      <text
                        x={center}
                        y={center - radius + 10}
                        textAnchor="middle"
                        className="ptl-shell-ring-label"
                      >
                        {shellName}
                      </text>

                      {/* Orbiting Electrons: theta_{k,i}(t) = (2*pi*i / N_k) + omega_k * t */}
                      {Array.from({ length: electronCount }, (_, i) => {
                        const theta = (2 * Math.PI * i) / electronCount + omega * elapsedSec;
                        const ex = center + radius * Math.cos(theta);
                        const ey = center + radius * Math.sin(theta);
                        return (
                          <circle
                            key={`${shellName}-e-${i}`}
                            cx={ex}
                            cy={ey}
                            r={shellCount >= 6 ? 3.4 : 4.2}
                            fill="#38bdf8"
                            stroke="#0f172a"
                            strokeWidth="1.1"
                          />
                        );
                      })}
                    </g>
                  );
                })}

                {/* Hybrid Nucleus Branch 1: Z <= 20 Countable SVG Protons & Neutrons */}
                {isSvgNucleus && (
                  <g data-testid="svg-nucleus">
                    <circle
                      cx={center}
                      cy={center}
                      r={24}
                      fill="rgba(239, 68, 68, 0.14)"
                    />
                    {svgNucleons.map((n, idx) => {
                      const jitterAmp = isPlaying ? 0.65 : 0;
                      const jx = jitterAmp * Math.cos(elapsedSec * 4.2 + n.phase);
                      const jy = jitterAmp * Math.sin(elapsedSec * 3.6 + n.phase * 1.1);
                      return (
                        <circle
                          key={`nuc-${idx}`}
                          cx={center + n.x + jx}
                          cy={center + n.y + jy}
                          r={element.number <= 4 ? 5.2 : 4.1}
                          fill={n.type === 'p' ? '#ef4444' : '#94a3b8'}
                          stroke="#0f172a"
                          strokeWidth="0.9"
                        />
                      );
                    })}
                  </g>
                )}
              </svg>

              {/* Hybrid Nucleus Branch 2: Z > 20 Optimized HTML5 Canvas Cluster */}
              {!isSvgNucleus && (
                <canvas
                  ref={canvasRef}
                  width={84}
                  height={84}
                  className="ptl-nucleus-canvas"
                  data-testid="canvas-nucleus"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="ptl-stage-controls">
              <button
                type="button"
                className="ptl-control-btn ptl-control-primary"
                onClick={() => setIsPlaying((prev) => !prev)}
                aria-pressed={isPlaying}
              >
                {isPlaying ? 'Pause Orbit' : 'Play Orbit'}
              </button>

              {onSelectElement && (
                <div className="ptl-step-controls">
                  <button
                    type="button"
                    className="ptl-control-btn"
                    disabled={element.number <= 1}
                    onClick={() => onSelectElement(element.number - 1)}
                    aria-label="Previous element"
                  >
                    &larr; Prev
                  </button>
                  <button
                    type="button"
                    className="ptl-control-btn"
                    disabled={element.number >= totalElements}
                    onClick={() => onSelectElement(element.number + 1)}
                    aria-label="Next element"
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </div>

            <div className="ptl-legend-row" aria-label="Particle color legend">
              <span className="ptl-legend-item">
                <span className="ptl-dot ptl-dot-p" /> Proton (p<sup>+</sup>)
              </span>
              <span className="ptl-legend-item">
                <span className="ptl-dot ptl-dot-n" /> Neutron (n<sup>0</sup>)
              </span>
              <span className="ptl-legend-item">
                <span className="ptl-dot ptl-dot-e" /> Electron (e<sup>&minus;</sup>)
              </span>
            </div>
          </div>

          {/* Right Panel: Subatomic Math, Isotope Standard & Shell Breakdown */}
          <div className="ptl-details-panel">
            <div className="ptl-stat-grid">
              <div className="ptl-stat-card ptl-stat-p">
                <span className="ptl-stat-label">Protons (p<sup>+</sup>)</span>
                <strong className="ptl-stat-val" data-testid="proton-count">{protons}</strong>
                <span className="ptl-stat-formula">Z = {element.number}</span>
              </div>
              <div className="ptl-stat-card ptl-stat-n">
                <span className="ptl-stat-label">Neutrons (n<sup>0</sup>)</span>
                <strong className="ptl-stat-val" data-testid="neutron-count">{neutrons}</strong>
                <span className="ptl-stat-formula">
                  A &minus; Z = {element.massNumber} &minus; {element.number}
                </span>
              </div>
              <div className="ptl-stat-card ptl-stat-e">
                <span className="ptl-stat-label">Electrons (e<sup>&minus;</sup>)</span>
                <strong className="ptl-stat-val" data-testid="electron-count">{electrons}</strong>
                <span className="ptl-stat-formula">Neutral atom = Z</span>
              </div>
            </div>

            <div className="ptl-info-box">
              <div className="ptl-info-row">
                <span className="ptl-info-key">IUPAC Atomic Weight</span>
                <span className="ptl-info-val">{element.atomicMass} u</span>
              </div>
              <div className="ptl-info-row">
                <span className="ptl-info-key">Primary Isotope Model</span>
                <span className="ptl-info-val" data-testid="isotope-label">
                  {isotopeLabel} (A = {element.massNumber})
                </span>
              </div>
              <p className="ptl-isotope-note" data-testid="isotope-note">
                {isotopeNote}
              </p>
            </div>

            <div className="ptl-info-box">
              <div className="ptl-info-key" style={{ marginBottom: '6px' }}>
                Electron Shells ({element.shells.join(', ')})
              </div>
              <div className="ptl-shell-pills">
                {element.shells.map((count, idx) => (
                  <span key={SHELL_NAMES[idx]} className="ptl-shell-pill">
                    <strong>{SHELL_NAMES[idx]}</strong>: {count}
                  </span>
                ))}
              </div>
              <div className="ptl-config-row">
                <span className="ptl-info-key">Electron Configuration</span>
                <code className="ptl-config-code">{element.electronConfiguration}</code>
              </div>
            </div>

            <div className="ptl-engine-note">
              {isSvgNucleus
                ? 'Nucleus Mode: Countable SVG nucleons (Z \u2264 20)'
                : 'Nucleus Mode: 60 FPS Canvas nucleon cluster (Z > 20)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}