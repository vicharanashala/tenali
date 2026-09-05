/**
 * DETECTIVE BOARD APP — BoardCasePlay presentation shell
 *
 * Renders a board-based crime-scene case (`type: 'board'`) for the Math
 * Detective Agency: a 12×12 chalkboard scene the learner walks a detective
 * around, objects that pin evidence tags onto the scene, a notebook overlay
 * (tap an evidence card to see its deduction prompt), a suspect poster with
 * a red ELIMINATED stamp and the short reason, an owl assistant bar, a math
 * index-card interaction, and a confession scene.
 *
 * Investigation + Learning logic lives in `detective-board-engine.js` (pure);
 * case data lives in `detective-board-cases.js`. This file is a thin shell.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './detective-board.css';

import { saveInProgressCase } from './detective-app';
import {
  createInitialState,
  movePlayer,
  isBlocked,
  objectAt,
  getMathFor,
  registerAnswer,
  handleWrong,
  collectObservation,
  applyElimination,
  onlyCulpritRemains,
  accusedSuspect,
  shouldShowDeduction,
  getPosterSuspects,
  getCollectedEvidence,
  getNotebookLines,
  getLatestThought,
  getThoughtsForEvidence,
  promptAnswer,
  CATEGORY_TAGS,
} from './detective-board-engine';

// ─── Tiny local sound helpers (Web Audio, failure-safe) ────────────────
let boardAudio = null;
function boardTone(freq, duration, type = 'sine', volume = 0.22) {
  try {
    if (!boardAudio) boardAudio = new (window.AudioContext || window.webkitAudioContext)();
    if (boardAudio.state === 'suspended') boardAudio.resume();
    const ctx = boardAudio;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch { /* audio unavailable — skip the sound */ }
}

const SFX = {
  step: () => boardTone(170, 0.05, 'triangle', 0.1),
  correct: () => { boardTone(660, 0.15, 'sine', 0.18); setTimeout(() => boardTone(880, 0.2, 'sine', 0.18), 100); },
  wrong: () => boardTone(200, 0.25, 'sine', 0.16),
  stamp: () => boardTone(120, 0.16, 'square', 0.14),
  confetti: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => boardTone(f, 0.28, 'sine', 0.16), i * 140)),
};

// ─── Assistant moods (the owl on the desk edge) ─────────────────────────
const BOARD_MOODS = {
  neutral: { emoji: '🦉', label: 'Hoot' },
  thinking: { emoji: '🤔', label: 'Hmm...' },
  correct: { emoji: '😎', label: 'Nice!' },
  wrong: { emoji: '🧐', label: 'Try again' },
  hint: { emoji: '💡', label: "Here's a clue" },
  solved: { emoji: '🥳', label: 'Case cracked!' },
  party: { emoji: '🎉', label: 'Brilliant!' },
};

const PROFILE_LABELS = {
  favouriteFood: 'Favourite Food',
  footprint: 'Footprint',
  colour: 'Colour',
  timing: 'Timing',
};

// Short rotated nudges for pure-observation clues (no math). The long
// observation sentence is replaced by one of these to cut cognitive load.
const OBSERVATION_ENCOURAGEMENTS = [
  'Nice deduction, Detective!',
  'Sharp eyes, Detective!',
  'Good catch!',
  "You're on the trail!",
];

// How long the suspect poster stays open to play the ELIMINATED stamp
// animation after an in-notebook elimination (slide-in 0.32s + 0.32s delay
// before the stamp slam 0.4s + card micro-shake 0.45s), before auto-closing
// back to the notebook.
const POSTER_STAMP_MS = 1150;

function catTag(category) {
  const t = CATEGORY_TAGS[category] || { emoji: '🔎', label: 'Clue' };
  return `${t.emoji} ${t.label}`;
}

function padCaseNumber(n) {
  return String(n || 1).padStart(3, '0');
}

// ─── Intro briefing scene ───────────────────────────────────────────────

function BoardIntro({ story, onStart }) {
  return (
    <div className="dbc-root">
      <div className="dbc-scene">
        <div className="dbc-paper-scene">
          <div className="dbc-case-tab" style={{ color: 'rgba(42,46,51,0.9)', borderColor: 'rgba(42,46,51,0.45)' }}>
            Case {padCaseNumber(story.caseNumber)} · Greenleaf Animal School
          </div>
          <h1 className="dbc-paper-scene-title">{story.title}</h1>
          <p className="dbc-paper-scene-body">{story.briefing}</p>
          <div className="dbc-section-label" style={{ textAlign: 'center' }}>
            In class today
          </div>
          <div className="dbc-suspect-row">
            {story.suspects.map(s => (
              <div key={s.id} className="dbc-suspect-chip">
                <div className="dbc-suspect-emoji" aria-hidden="true">{s.animalEmoji}</div>
                <div className="dbc-suspect-name">{s.name}</div>
                <div className="dbc-suspect-hint">{s.hint}</div>
              </div>
            ))}
          </div>
          <button className="dbc-primary-btn" onClick={onStart}>
            Start the Investigation 🔍
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Attention pointer (reusable visual cue) ────────────────────────────

function AttentionPointer({ targetRef, onDone, pulseCount = 2, center = false }) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch { return false; }
  }, []);

  const [style, setStyle] = useState({ opacity: 0 });
  const cycleTimer = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion) { onDone?.(); return; }
    const el = targetRef?.current;
    if (!el) { onDone?.(); return; }

    let cycles = 0;
    const runCycle = () => {
      if (cycles >= pulseCount) { onDone?.(); return; }
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      setStyle(center
        ? {
            opacity: 1,
            left: cx,
            top: rect.top + rect.height / 2,
            transform: 'translate(-50%, -50%)',
          }
        : {
            opacity: 1,
            left: cx,
            top: rect.bottom - 8,
            transform: 'translate(-50%, 0)',
          });
      cycleTimer.current = setTimeout(() => {
        setStyle(s => ({ ...s, opacity: 0.7 }));
        cycleTimer.current = setTimeout(() => {
          cycles++;
          runCycle();
        }, 500);
      }, 900);
    };
    runCycle();
    return () => { clearTimeout(cycleTimer.current); };
  }, [targetRef, pulseCount, prefersReducedMotion, onDone, center]);

  if (prefersReducedMotion) return null;

  return (
    <div className="dbc-attention-pointer" style={style} aria-hidden="true">
      <span className="dbc-attention-pointer-hand">👆</span>
    </div>
  );
}

// ─── Persistent tap-guidance pointer for the Detective Wall ─────────────
function WallPointer({ targetEl }) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch { return false; }
  }, []);

  if (prefersReducedMotion || !targetEl) return null;

  const rect = targetEl.getBoundingClientRect();
  const style = {
    opacity: 1,
    left: rect.left + rect.width / 2,
    top: rect.top + rect.height / 2,
    transform: 'translate(-50%, -50%)',
  };

  return (
    <div className="dbc-attention-pointer" style={style} aria-hidden="true">
      <span className="dbc-attention-pointer-hand">👆</span>
    </div>
  );
}

// ─── Confetti burst for the case-solved reward stage ──────────────────

function RewardConfetti() {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch { return false; }
  }, []);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const colors = ['#e8864a', '#ff9800', '#ffb300', '#d27c3c', '#a16738', '#ffd54f', '#ede8e3', '#795548', '#b57c50'];
    const t = setTimeout(() => {
      const next = Array.from({ length: 50 }).map((_, id) => ({
        id,
        left: `${Math.random() * 100}%`,
        size: `${6 + Math.random() * 8}px`,
        radius: Math.random() < 0.5 ? '50%' : '3px',
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: `${2 + Math.random() * 2}s`,
        delay: `${Math.random() * 0.6}s`,
      }));
      setParticles(next);
    }, 0);
    return () => clearTimeout(t);
  }, [prefersReducedMotion]);

  if (particles.length === 0) return null;

  return (
    <div className="dbc-confetti-layer" aria-hidden="true">
      {particles.map(p => (
        <span
          key={p.id}
          className="dbc-confetti-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: p.radius,
            backgroundColor: p.color,
            animationDelay: p.delay,
            '--dbc-confetti-duration': p.duration,
          }}
        />
      ))}
    </div>
  );
}

// ─── SVG string connections for the Detective Wall ───────────────────────

function WallStrings({ connections, containerRef, fast }) {
  const svgRef = useRef(null);
  const [paths, setPaths] = useState([]);

  const recalc = useCallback(() => {
    const container = containerRef?.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const newPaths = [];
    for (const conn of connections) {
      const fromEl = container.querySelector(`[data-card-id="${conn.from}"]`);
      const toEl = container.querySelector(`[data-card-id="${conn.to}"]`);
      if (!fromEl || !toEl) continue;
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
      const y1 = fromRect.top - containerRect.top;
      const x2 = toRect.left + toRect.width / 2 - containerRect.left;
      const y2 = toRect.top - containerRect.top;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const cx = mx + dy * 0.15;
      const cy = my - Math.abs(dx) * 0.1;
      newPaths.push({
        id: conn.id,
        d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
        animate: !conn.settled,
      });
    }
    setPaths(newPaths);
  }, [connections, containerRef]);

  useEffect(() => {
    recalc();
    const container = containerRef?.current;
    if (!container) return;
    const ro = new ResizeObserver(() => recalc());
    ro.observe(container);
    const onResize = () => recalc();
    window.addEventListener('resize', onResize);
    return () => { ro.disconnect(); window.removeEventListener('resize', onResize); };
  }, [recalc, containerRef]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svgEl = svgRef.current;
    const pathEls = svgEl.querySelectorAll('path');
    pathEls.forEach(pathEl => {
      const len = pathEl.getTotalLength();
      if (pathEl.classList.contains('dbc-string-animating') && !fast) {
        pathEl.style.strokeDasharray = len;
        pathEl.style.strokeDashoffset = len;
        requestAnimationFrame(() => {
          pathEl.style.transition = 'stroke-dashoffset 0.6s ease-out';
          pathEl.style.strokeDashoffset = '0';
        });
      } else {
        pathEl.style.strokeDasharray = len;
        pathEl.style.strokeDashoffset = '0';
      }
    });
  }, [paths, fast]);

  if (!paths.length) return null;

  return (
    <svg ref={svgRef} className="dbc-wall-strings-svg" aria-hidden="true">
      {paths.map(p => (
        <path
          key={p.id}
          d={p.d}
          className={p.animate && !fast ? 'dbc-string-animating' : ''}
          style={fast ? { strokeDasharray: 'none', strokeDashoffset: 0 } : undefined}
        />
      ))}
    </svg>
  );
}

// ─── Detective Wall (interactive Case 3 reveal) ────────────────────────

function BoardWall({ story, onComplete, onBack }) {
  const ded = story.deduction;

  const [step, setStep] = useState('opening');
  const [typewriterIdx, setTypewriterIdx] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [hintText, setHintText] = useState('');
  const [matchedIds, setMatchedIds] = useState([]);
  const [revealStage, setRevealStage] = useState(0);
  const [showBlueCases, setShowBlueCases] = useState(false);
  const [blueHandled, setBlueHandled] = useState(false);
  const [transientMood, setTransientMood] = useState(null);
  const [connections, setConnections] = useState([]);
  const [wallTapCount, setWallTapCount] = useState(0);
  const transientTimer = useRef(null);
  const portraitRef = useRef(null);
  const corkRef = useRef(null);

  const PORTRAIT = { type: 'emoji', value: '🐘' };
  const renderPortraitContent = () => {
    if (PORTRAIT.type === 'image') return <img src={PORTRAIT.value} alt="Mr. B" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
    return <span className="dbc-wall-mrB-emoji">{PORTRAIT.value}</span>;
  };

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch { return false; }
  }, []);
  const fast = prefersReducedMotion ? 10 : undefined;

  // ── Opening typewriter ────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'opening' || !ded) return;
    if (typewriterIdx >= ded.opening.length) {
      const t = setTimeout(() => setStep('connect-1'), fast || 1500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTypewriterIdx(v => v + 1), fast || 1800);
    return () => clearTimeout(t);
  }, [step, typewriterIdx, ded, fast]);

  // ── Owl text derived from step (no effect needed) ───────────────────
  const baseOwl = useMemo(() => {
    if (!ded) return { owlText: '', owlMood: 'neutral' };
    if (step === 'connect-1') return { owlText: 'Look closely, Detective. Which clues belong together?', owlMood: 'neutral' };
    if (step === 'connect-2') return { owlText: 'Good thinking! What connects to the music?', owlMood: 'correct' };
    if (step === 'connect-3') return { owlText: 'Nice! What helps us hear the music?', owlMood: 'correct' };
    if (step === 'blue-button') return { owlText: 'One more thing connects them all...', owlMood: 'thinking' };
    if (step === 'portrait-reveal') return { owlText: 'Something is still missing...', owlMood: 'thinking' };
    if (step === 'portrait-interact') return { owlText: '', owlMood: 'neutral' };
    return { owlText: '', owlMood: 'neutral' };
  }, [ded, step]);
  const owlText = baseOwl.owlText;
  const owlMood = transientMood || baseOwl.owlMood;

  // ── Portrait auto-reveal ──────────────────────────────────────────
  useEffect(() => {
    if (step !== 'portrait-reveal') return;
    const t = setTimeout(() => setStep('portrait-interact'), fast || 2500);
    return () => clearTimeout(t);
  }, [step, fast]);

  // ── Wall tutorial pointer: teaches tap-to-connect mechanic ───────
  const wallPointerTarget = useMemo(() => {
    if (!ded || wallTapCount >= 2) return null;
    const isConnect = step === 'connect-1' || step === 'connect-2' || step === 'connect-3';
    if (!isConnect) return null;
    if (selectedCardId === null) return ded.cards[0]?.id || null;
    return ded.cards.find(c => c.id !== selectedCardId)?.id || null;
  }, [wallTapCount, selectedCardId, ded, step]);

  const [wallPointerEl, setWallPointerEl] = useState(null);
  useEffect(() => {
    if (!wallPointerTarget || !corkRef.current) { setWallPointerEl(null); return; }
    setWallPointerEl(corkRef.current.querySelector(`[data-card-id="${wallPointerTarget}"]`));
  }, [wallPointerTarget]);

  if (!ded) return null;

  // ── Connection helpers ────────────────────────────────────────────
  const connectionIdx = step === 'connect-1' ? 0 : step === 'connect-2' ? 1 : step === 'connect-3' ? 2 : -1;
  const connection = connectionIdx >= 0 ? ded.connections[connectionIdx] : null;
  const nextStep = connectionIdx === 0 ? 'connect-2' : connectionIdx === 1 ? 'connect-3' : 'blue-button';
  const isConnectStep = connectionIdx >= 0;

  // ── Card tap handler ──────────────────────────────────────────────
  const handleCardTap = (cardId) => {
    if (!connection) return;
    setWallTapCount(v => v + 1);
    if (selectedCardId === null) {
      setSelectedCardId(cardId);
      setHintText('');
      SFX.step();
    } else {
      const first = selectedCardId;
      const second = cardId;
      setSelectedCardId(null);
      const ok = (first === connection.from && second === connection.to)
        || (first === connection.to && second === connection.from);
      if (ok) {
        SFX.correct();
        setMatchedIds(prev => [...prev, connection.from, connection.to]);
        setConnections(prev => [...prev, { from: connection.from, to: connection.to, id: `conn-${connection.from}-${connection.to}-${Date.now()}`, settled: false }]);
        setRevealStage(connection.portraitRevealStage);
        setHintText(connection.praise);
        clearTimeout(transientTimer.current);
        setTransientMood('correct');
        setTimeout(() => { setHintText(''); setStep(nextStep); }, fast || 1500);
      } else {
        SFX.wrong();
        setHintText(connection.hint || 'Try a different pair!');
        clearTimeout(transientTimer.current);
        setTransientMood('hint');
        setTimeout(() => { setHintText(''); setTransientMood(null); }, fast || 1200);
      }
    }
  };

  // ── Blue button tap ───────────────────────────────────────────────
  const handleBlueTap = () => {
    if (blueHandled) return;
    setBlueHandled(true);
    SFX.confetti();
    setShowBlueCases(true);
    setHintText(ded.blueButton.praise);
    clearTimeout(transientTimer.current);
    setTransientMood('solved');
    ded.blueButton.caseCards.forEach((cardId, i) => {
      setTimeout(() => {
        setConnections(prev => [...prev, { from: ded.blueButton.cardId, to: cardId, id: `blue-${cardId}-${Date.now()}`, settled: false }]);
      }, i * 300);
    });
    setTimeout(() => { setHintText(''); setStep('portrait-reveal'); }, fast || 2000);
  };

  // ── Portrait tap ──────────────────────────────────────────────────
  const handlePortraitTap = () => {
    SFX.correct();
    onComplete();
  };

  // ── Card matching helpers ─────────────────────────────────────────
  const matched = (id) => matchedIds.includes(id);
  const selected = (id) => selectedCardId === id;

  const owlEmoji = BOARD_MOODS[owlMood]?.emoji || '🦉';

  return (
    <div className="dbc-root">
      <div className="dbc-wall-overlay" />

      {/* ── Opening ──────────────────────────────────────────────── */}
      {step === 'opening' && (
        <div className="dbc-wall-opening">
          <div className="dbc-wall-owl-center">🦉</div>
          {ded.opening.slice(0, typewriterIdx + 1).map((line, i) => (
            <div key={i} className={`dbc-wall-opening-line${i === typewriterIdx ? ' is-active' : ''}`}>
              {line}
            </div>
          ))}
        </div>
      )}

      {/* ── Wall (connections + blue button) ─────────────────────── */}
      {isConnectStep && (
        <div className="dbc-wall-layout">
          <div className="dbc-wall-owl-side">
            <div className="dbc-wall-owl-emoji">{owlEmoji}</div>
            {owlText && <div className="dbc-wall-speech">{owlText}</div>}
          </div>
          <div className="dbc-wall-cork" ref={corkRef}>
            <div className="dbc-wall-title">Detective Wall</div>
            <div className="dbc-wall-prompt">{connection.prompt}</div>
            <div className="dbc-wall-cards-area">
              <WallStrings connections={connections} containerRef={corkRef} fast={fast} />
              {ded.cards.map(card => (
                <button
                  key={card.id}
                  data-card-id={card.id}
                  className={`dbc-wall-card${card.id === ded.blueButton.cardId ? ' dbc-wall-card--blue' : ''}${selected(card.id) ? ' is-selected' : ''}${matched(card.id) ? ' is-matched' : ''}`}
                  onClick={() => handleCardTap(card.id)}
                >
                  <div className={`dbc-wall-card-pin${matched(card.id) ? ' is-connected' : ''}`} />
                  <span className="dbc-wall-card-emoji">{card.emoji}</span>
                  <span className="dbc-wall-card-label">{card.label}</span>
                  <span className="dbc-wall-card-text">{card.text}</span>
                </button>
              ))}
              <div
                ref={portraitRef}
                className={`dbc-wall-mrB-card reveal-stage-${revealStage}`}
                data-card-id="portrait"
              >
                <div className="dbc-wall-card-pin is-connected" />
                <div className="dbc-wall-mrB-placeholder">?</div>
                <div className="dbc-wall-mrB-piece-1">{renderPortraitContent()}</div>
                <div className="dbc-wall-mrB-piece-2">{renderPortraitContent()}</div>
                <div className="dbc-wall-mrB-piece-3">{renderPortraitContent()}</div>
                <div className="dbc-wall-mrB-tape dbc-wall-mrB-tape--tl" />
                <div className="dbc-wall-mrB-tape dbc-wall-mrB-tape--tr" />
              </div>
            </div>
            {hintText && <div className="dbc-wall-hint">{hintText}</div>}
            {wallPointerEl && <WallPointer targetEl={wallPointerEl} />}
          </div>
        </div>
      )}

      {step === 'blue-button' && (
        <div className="dbc-wall-layout">
          <div className="dbc-wall-owl-side">
            <div className="dbc-wall-owl-emoji">{owlEmoji}</div>
            {owlText && <div className="dbc-wall-speech">{owlText}</div>}
          </div>
          <div className="dbc-wall-cork" ref={corkRef}>
            <div className="dbc-wall-title">Detective Wall</div>
            <div className="dbc-wall-prompt">{ded.blueButton.prompt}</div>
            <div className="dbc-wall-cards-area">
              <WallStrings connections={connections} containerRef={corkRef} fast={fast} />
              {ded.cards.map(card => {
                const isBlue = card.id === ded.blueButton.cardId;
                return (
                  <button
                    key={card.id}
                    data-card-id={card.id}
                    className={`dbc-wall-card${isBlue ? ' dbc-wall-card--blue' : ''}${isBlue && !blueHandled ? ' is-pulsing' : ''}${matched(card.id) ? ' is-matched' : ''}`}
                    onClick={isBlue ? handleBlueTap : undefined}
                    disabled={!isBlue}
                  >
                    <div className={`dbc-wall-card-pin${matched(card.id) || (isBlue && blueHandled) ? ' is-connected' : ''}`} />
                    <span className="dbc-wall-card-emoji">{card.emoji}</span>
                    <span className="dbc-wall-card-label">{card.label}</span>
                    <span className="dbc-wall-card-text">{card.text}</span>
                  </button>
                );
              })}
              <div className={`dbc-wall-mrB-card reveal-stage-${revealStage}`} data-card-id="portrait">
                <div className="dbc-wall-card-pin is-connected" />
                <div className="dbc-wall-mrB-placeholder">?</div>
                <div className="dbc-wall-mrB-piece-1">{renderPortraitContent()}</div>
                <div className="dbc-wall-mrB-piece-2">{renderPortraitContent()}</div>
                <div className="dbc-wall-mrB-piece-3">{renderPortraitContent()}</div>
                <div className="dbc-wall-mrB-tape dbc-wall-mrB-tape--tl" />
                <div className="dbc-wall-mrB-tape dbc-wall-mrB-tape--tr" />
              </div>
            </div>
            {showBlueCases && (
              <div className="dbc-wall-blue-cases">
                {ded.blueButton.caseSummaries.map((c, i) => (
                  <div key={i} className="dbc-wall-mini-case">{c}</div>
                ))}
              </div>
            )}
            {hintText && <div className="dbc-wall-hint">{hintText}</div>}
          </div>
        </div>
      )}

      {/* ── Portrait reveal (auto) ──────────────────────────────── */}
      {step === 'portrait-reveal' && (
        <div className="dbc-wall-layout">
          <div className="dbc-wall-owl-side">
            <div className="dbc-wall-owl-emoji">{owlEmoji}</div>
            {owlText && <div className="dbc-wall-speech">{owlText}</div>}
          </div>
          <div className="dbc-wall-cork dbc-wall-cork--reveal">
            <div className="dbc-wall-cork-center">
              <div className="dbc-wall-mrB-card reveal-stage-3 is-revealing">
                <div className="dbc-wall-card-pin is-connected" />
                <div className="dbc-wall-mrB-placeholder">?</div>
                <div className="dbc-wall-mrB-piece-1">{renderPortraitContent()}</div>
                <div className="dbc-wall-mrB-piece-2">{renderPortraitContent()}</div>
                <div className="dbc-wall-mrB-piece-3">{renderPortraitContent()}</div>
                <div className="dbc-wall-mrB-tape dbc-wall-mrB-tape--tl" />
                <div className="dbc-wall-mrB-tape dbc-wall-mrB-tape--tr" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Portrait interaction (waits for tap) ────────────────── */}
      {step === 'portrait-interact' && (
        <div className="dbc-wall-layout">
          <div className="dbc-wall-cork dbc-wall-cork--reveal">
            <div className="dbc-wall-cork-center">
              <div
                ref={portraitRef}
                className="dbc-wall-mrB-card reveal-stage-3 is-pulsing"
                onClick={handlePortraitTap}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePortraitTap(); } }}
                aria-label="Mr. B portrait — tap to continue"
              >
                <div className="dbc-wall-card-pin is-connected" />
                <div className="dbc-wall-mrB-placeholder">?</div>
                <div className="dbc-wall-mrB-piece-1">{renderPortraitContent()}</div>
                <div className="dbc-wall-mrB-piece-2">{renderPortraitContent()}</div>
                <div className="dbc-wall-mrB-piece-3">{renderPortraitContent()}</div>
                <div className="dbc-wall-mrB-tape dbc-wall-mrB-tape--tl" />
                <div className="dbc-wall-mrB-tape dbc-wall-mrB-tape--tr" />
              </div>
              <AttentionPointer targetRef={portraitRef} pulseCount={2} />
            </div>
          </div>
        </div>
      )}

      {/* ── Back button ─────────────────────────────────────────── */}
      {step !== 'opening' && (
        <button className="dbc-secondary-btn dbc-wall-back" onClick={onBack}>
          ← Back to Case Library
        </button>
      )}
    </div>
  );
}

// ─── Letter scene (portrait shrinks into letter, confession) ─────────────

function BoardLetter({ story, onComplete, onBack }) {
  const ded = story.deduction || {};
  const npc = ded.npc || {};
  const conf = story.confession || {};
  const full = conf.mrBNote || conf.culpritNarrative || '';

  const [step, setStep] = useState('letter-enter');
  const [revealed, setRevealed] = useState(0);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch { return false; }
  }, []);

  // ── Letter entrance animation ─────────────────────────────────────
  useEffect(() => {
    if (step !== 'letter-enter') return;
    const t = setTimeout(() => setStep('confession'), prefersReducedMotion ? 100 : 1200);
    return () => clearTimeout(t);
  }, [step, prefersReducedMotion]);

  // ── Typewriter ────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'confession' || revealed >= full.length) return;
    const t = setTimeout(() => setRevealed(v => v + 1), 30);
    return () => clearTimeout(t);
  }, [step, revealed, full.length]);

  // ── Auto-complete after typewriter finishes ───────────────────────
  useEffect(() => {
    if (step !== 'confession' || revealed < full.length) return;
    const t = setTimeout(onComplete, prefersReducedMotion ? 100 : 1800);
    return () => clearTimeout(t);
  }, [step, revealed, full.length, onComplete, prefersReducedMotion]);

  return (
    <div className="dbc-root">
      <div className="dbc-wall-overlay" />
      <div className={`dbc-letter${step === 'confession' ? ' is-open' : ''}`}>
        <div className="dbc-letter-paper">
          <div className="dbc-letter-portrait">
            <span className="dbc-letter-portrait-emoji">{npc.animalEmoji || '🎓'}</span>
          </div>
          <div className="dbc-letter-seal">Mr. B · sealed</div>
          <div className="dbc-letter-body">
            {full.slice(0, revealed)}
            {revealed < full.length && <span aria-hidden="true" className="dbc-letter-cursor">▌</span>}
          </div>
          {conf.resolution && revealed >= full.length && (
            <div className="dbc-letter-resolution">{conf.resolution}</div>
          )}
        </div>
      </div>
      <button className="dbc-secondary-btn dbc-wall-back" onClick={onBack}>
        ← Back to Case Library
      </button>
    </div>
  );
}

// ─── Confession scene (the case is solved) ──────────────────────────────

function BoardConfession({ story, stats, onBack }) {
  const conf = (story && story.confession) || {};
  const culprit = story.culprit
    ? story.suspects.find(s => s.id === story.culprit)
    : (conf.culpritName
      ? { animalEmoji: conf.culpritEmoji || '🎓', name: conf.culpritName }
      : conf.culpritEmoji
        ? { animalEmoji: conf.culpritEmoji, name: conf.culpritName || 'Mr. B' }
        : null);
  const full = conf.mrBNote || '';
  const [step, setStep] = useState('confession');
  const [noteOpen, setNoteOpen] = useState(false);
  const noteBtnRef = useRef(null);
  const openBtnRef = useRef(null);
  const [pointerDone, setPointerDone] = useState(false);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch { return false; }
  }, []);
  const [revealed, setRevealed] = useState(() => (prefersReducedMotion ? full.length : 0));

  useEffect(() => {
    if (!noteOpen) return;
    if (revealed >= full.length) return;
    const t = setTimeout(() => setRevealed(v => v + 1), 30);
    return () => clearTimeout(t);
  }, [noteOpen, revealed, full.length]);

  const stars = stats.totalHintsUsed === 0 ? 3 : stats.totalHintsUsed <= 2 ? 2 : 1;
  const xp = Math.round(story.xpReward * (stars === 3 ? 1 : stars === 2 ? 0.7 : 0.4));

  const confessionLines = (conf.confessionLines && conf.confessionLines.length)
    ? conf.confessionLines
    : [conf.culpritNarrative || ''];
  const teacherLine = conf.teacherLine || '';
  const noteRevealed = revealed >= full.length;

  const openNote = () => setNoteOpen(true);
  const toReward = () => setStep('reward');

  // ── Step 1: Culprit confession (avatar + speech bubbles) ─────────────
  if (step === 'confession') {
    return (
      <div className="dbc-root">
        <div className="dbc-scene">
          <div className="dbc-paper-scene dbc-confess-scene">
            <div className="dbc-confess-avatar" aria-hidden="true">
              {culprit ? culprit.animalEmoji : '🎓'}
              <span className="dbc-confess-name">{culprit ? culprit.name : 'The Case'}</span>
            </div>
            <div className="dbc-confess-bubbles">
              {confessionLines.filter(Boolean).map((line, i) => (
                <div key={i} className="dbc-speech-bubble">{line}</div>
              ))}
            </div>
            <div className="dbc-confess-give">
              <span className="dbc-confess-give-emoji">📜</span>
              <span className="dbc-confess-give-text">
                {conf.giveLine || 'He hands you a folded note…'}
              </span>
            </div>
            <button className="dbc-primary-btn" onClick={() => setStep('note')}>
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Mr. B note (physical look + typewriter reveal) ───────────
  if (step === 'note') {
    return (
      <div className="dbc-root">
        <div className="dbc-scene">
          <div className="dbc-paper-scene dbc-confess-scene">
            {!noteOpen ? (
              <button
                ref={noteBtnRef}
                className="dbc-note-cta"
                onClick={openNote}
                aria-label="Open Mr. B's note"
              >
                <span className="dbc-note-cta-emoji">📜</span>
                <span className="dbc-note-cta-title">A NOTE FOR YOU</span>
                <span ref={openBtnRef} className="dbc-note-cta-open">OPEN</span>
              </button>
            ) : (
              <div className="dbc-note-open-wrap">
                <div className="dbc-note-seal dbc-note-open-seal">Mr. B · sealed</div>
                <div className="dbc-mrB-note dbc-mrB-note--open">
                  {full.slice(0, revealed)}
                  <span aria-hidden="true">{revealed < full.length ? '▌' : ''}</span>
                </div>
                {noteRevealed && (
                  <>
                    {teacherLine && <div className="dbc-teacher-bubble">{teacherLine}</div>}
                    <button className="dbc-primary-btn" onClick={toReward} style={{ marginTop: '1rem' }}>
                      Continue →
                    </button>
                  </>
                )}
              </div>
            )}
            {!noteOpen && !pointerDone && (
              <AttentionPointer
                targetRef={openBtnRef}
                onDone={() => setPointerDone(true)}
                pulseCount={3}
                center
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Step 3: Reward (case solved) ─────────────────────────────────────
  return (
    <div className="dbc-root">
      <RewardConfetti />
      <div className="dbc-scene">
        <div className="dbc-paper-scene dbc-confess-scene">
          <div className="dbc-reward">
            <div className="dbc-reward-emojis">⭐🎉⭐</div>
            <div className="dbc-reward-title">CASE SOLVED!</div>
            {conf.rewardSubtitle && <div className="dbc-reward-subtitle">{conf.rewardSubtitle}</div>}
            <div className="dbc-reward-score">
              <span className="dbc-reward-stars">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</span>
              <span className="dbc-reward-xp">+{xp} XP</span>
            </div>
            <button className="dbc-primary-btn" onClick={onBack}>
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Visual math renderers ─────────────────────────────────────────────

function VisualMath({ visuals }) {
  if (!visuals) return null;

  if (visuals.type === 'count-visual') {
    const { groups, emoji, subtractFrom } = visuals;
    const totalCount = groups.reduce((a, b) => a + b, 0);
    return (
      <div className="dbc-visual dbc-visual--count" aria-label={`Visual counting: ${totalCount} ${emoji}`}>
        {groups.map((count, gi) => (
          <span key={gi} className="dbc-visual-group">
            {Array.from({ length: count }, (_, i) => {
              const isSubtracted = subtractFrom != null && i >= count - subtractFrom;
              return (
                <span key={i} className={`dbc-visual-item${isSubtracted ? ' is-subtracted' : ''}`}>
                  {emoji}
                  {isSubtracted && <span className="dbc-visual-item-cross" aria-hidden="true">✕</span>}
                </span>
              );
            })}
            {gi < groups.length - 1 && <span className="dbc-visual-op">+</span>}
          </span>
        ))}
        {subtractFrom != null && (
          <div className="dbc-visual-subtract">
            <span className="dbc-visual-subtract-label">− {subtractFrom} fell off</span>
          </div>
        )}
      </div>
    );
  }

  if (visuals.type === 'clock') {
    const { hour, minute, showMinute = true, description } = visuals;
    const hourAngle = ((hour % 12) + minute / 60) * 30;
    const minuteAngle = minute * 6;
    const hRad = (hourAngle - 90) * Math.PI / 180;
    const mRad = (minuteAngle - 90) * Math.PI / 180;
    const hourX2 = 50 + 22 * Math.cos(hRad);
    const hourY2 = 50 + 22 * Math.sin(hRad);
    const minuteX2 = 50 + 30 * Math.cos(mRad);
    const minuteY2 = 50 + 30 * Math.sin(mRad);
    const arrowSize = 3;
    const hourTipX = hourX2 + arrowSize * Math.cos(hRad);
    const hourTipY = hourY2 + arrowSize * Math.sin(hRad);
    const minuteTipX = minuteX2 + arrowSize * Math.cos(mRad);
    const minuteTipY = minuteY2 + arrowSize * Math.sin(mRad);
    return (
      <div className="dbc-visual dbc-visual--clock" aria-label={`Clock showing ${hour}:${String(minute).padStart(2, '0')}`}>
        <svg viewBox="0 0 100 100" className="dbc-clock-face">
          <circle cx="50" cy="50" r="46" fill="var(--dbc-chalk)" stroke="var(--dbc-slate)" strokeWidth="3" />
          {[...Array(12)].map((_, i) => {
            const a = (i * 30 - 90) * Math.PI / 180;
            const nx = 50 + 38 * Math.cos(a);
            const ny = 50 + 38 * Math.sin(a);
            const dx = 50 + 43 * Math.cos(a);
            const dy = 50 + 43 * Math.sin(a);
            return (
              <g key={i}>
                <circle cx={dx} cy={dy} r="1.5" fill="var(--dbc-slate)" opacity="0.5" />
                <text x={nx} y={ny} textAnchor="middle" dominantBaseline="central" className="dbc-clock-num">{i === 0 ? 12 : i}</text>
              </g>
            );
          })}
          <line x1="50" y1="50" x2={hourX2} y2={hourY2} className="dbc-clock-hand dbc-clock-hand--hour" />
          <polygon points={`${hourX2},${hourY2} ${hourTipX - 1.5 * Math.sin(hRad)},${hourTipY + 1.5 * Math.cos(hRad)} ${hourTipX + 1.5 * Math.sin(hRad)},${hourTipY - 1.5 * Math.cos(hRad)}`} className="dbc-clock-hand dbc-clock-hand--hour" style={{ stroke: 'none' }} />
          {showMinute && (
            <>
              <line x1="50" y1="50" x2={minuteX2} y2={minuteY2} className="dbc-clock-hand dbc-clock-hand--minute" />
              <polygon points={`${minuteX2},${minuteY2} ${minuteTipX - 1.2 * Math.sin(mRad)},${minuteTipY + 1.2 * Math.cos(mRad)} ${minuteTipX + 1.2 * Math.sin(mRad)},${minuteTipY - 1.2 * Math.cos(mRad)}`} className="dbc-clock-hand dbc-clock-hand--minute" style={{ stroke: 'none' }} />
            </>
          )}
          <circle cx="50" cy="50" r="3.5" fill="var(--dbc-slate)" />
        </svg>
        {description && <div className="dbc-clock-hint">Hour hand on 3, minute hand on 12</div>}
      </div>
    );
  }

  if (visuals.type === 'measure') {
    const { lengthCm, rulerLabels, rulerStart = 0, rulerEnd } = visuals;
    const end = rulerEnd || lengthCm;
    const start = rulerStart || 0;
    const totalLen = end || 14;
    return (
      <div className="dbc-visual dbc-visual--measure" aria-label={`Ruler measuring ${lengthCm} cm`}>
        <div className="dbc-ruler">
          <div className="dbc-ruler-track">
            {[...Array(totalLen + 1)].map((_, i) => (
              <div key={i} className="dbc-ruler-tick" style={{ left: `${(i / totalLen) * 100}%` }}>
                <div className={`dbc-ruler-tick-line ${i % 5 === 0 ? 'dbc-ruler-tick-line--major' : ''}`} />
                {rulerLabels === 'all' && (
                  <span className="dbc-ruler-label">{i + rulerStart}</span>
                )}
                {rulerLabels === 'ends' && (i === 0 || i === totalLen) && (
                  <span className="dbc-ruler-label">{i + rulerStart}</span>
                )}
                {!rulerLabels && (i === 0 || i === totalLen) && (
                  <span className="dbc-ruler-label">{i + rulerStart}</span>
                )}
              </div>
            ))}
            <div
              className="dbc-ruler-object"
              style={{
                left: `${(start / totalLen) * 100}%`,
                width: `${(lengthCm / totalLen) * 100}%`,
              }}
            >
              <div className="dbc-ruler-object-bar" />
              <div className="dbc-ruler-object-marker dbc-ruler-object-marker--start" />
              <div className="dbc-ruler-object-marker dbc-ruler-object-marker--end" />
            </div>
          </div>
          <div className="dbc-ruler-label-row">
            <span className="dbc-ruler-unit">cm</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Main board case component ──────────────────────────────────────────

export default function BoardCasePlay({ story, onComplete, onBack, initialState }) {
  const [engine, setEngine] = useState(() => {
    const base = createInitialState(story, { initialBand: initialState && initialState.initialBand });
    const snap = initialState && initialState.boardSnapshot;
    if (snap) return { ...base, ...snap };
    return base;
  });
  const [phase, setPhase] = useState(() => {
    const p = initialState && initialState.phase;
    if (p === 'exploring' || p === 'wall' || p === 'letter' || p === 'confession') return p;
    return 'intro';
  });
  const [activeObjectId, setActiveObjectId] = useState(null);
  const [cardState, setCardState] = useState(null); // { kind, variant?, text?, hintsShown, feedback, solved }
  const [answer, setAnswer] = useState('');
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);
  const [cluesSeen, setCluesSeen] = useState(() => {
    const snap = initialState && initialState.boardSnapshot;
    return snap && Array.isArray(snap.collectedEvidenceIds) ? snap.collectedEvidenceIds.length : 0;
  });
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(null);
  const [showAllThoughts, setShowAllThoughts] = useState(false);
  const [promptMisses, setPromptMisses] = useState({}); // evidenceId -> wrong taps
  const [wrongRow, setWrongRow] = useState(null); // { evidenceId, suspectId, ts } for shake retrigger
  const [mascot, setMascot] = useState({ mood: 'neutral', text: '' });
  const [toast, setToast] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [notebookPointerActive, setNotebookPointerActive] = useState(false);
  const notebookBtnRef = useRef(null);
  const toastTimer = useRef(null);
  const posterTimer = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (activeObjectId && cardState && cardState.kind === 'math' && !cardState.solved) {
      const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [activeObjectId, cardState]);

  // ── Notebook pointer: show when new evidence is collected ──────────
  const prevEvidenceCount = useRef(engine.collectedEvidenceIds.length);
  useEffect(() => {
    const prev = prevEvidenceCount.current;
    const curr = engine.collectedEvidenceIds.length;
    if (curr > prev && phase === 'exploring' && !notebookOpen && !completed && !activeObjectId) {
      prevEvidenceCount.current = curr;
      setNotebookPointerActive(true);
    } else if (!activeObjectId) {
      prevEvidenceCount.current = curr;
    }
  }, [engine.collectedEvidenceIds.length, phase, notebookOpen, completed, activeObjectId]);

  const showToast = useCallback((text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const collectedEvidence = useMemo(() => getCollectedEvidence(story, engine.collectedEvidenceIds), [story, engine.collectedEvidenceIds]);
  const unreadClues = engine.collectedEvidenceIds.length - cluesSeen;
  const posterSuspects = useMemo(() => getPosterSuspects(story, engine), [story, engine]);
  const thoughts = useMemo(() => getNotebookLines(story, engine.collectedEvidenceIds, engine.eliminatedIds), [story, engine.collectedEvidenceIds, engine.eliminatedIds]);
  const latestThought = useMemo(() => getLatestThought(story, engine.collectedEvidenceIds, engine.eliminatedIds), [story, engine.collectedEvidenceIds, engine.eliminatedIds]);
  const currentThoughts = useMemo(() => {
    if (showAllThoughts) return thoughts;
    if (!selectedEvidenceId) return latestThought;
    const perEvidence = getThoughtsForEvidence(story, engine.collectedEvidenceIds, selectedEvidenceId, engine.eliminatedIds);
    return perEvidence.length > 0 ? perEvidence : [];
  }, [showAllThoughts, thoughts, selectedEvidenceId, story, engine.collectedEvidenceIds, engine.eliminatedIds, latestThought]);
  const accusation = useMemo(() => accusedSuspect(story, engine), [story, engine]);

  // Persist the in-progress scene after each interaction/elimination/hint.
  useEffect(() => {
    if (completed) return;
    if (phase !== 'exploring' && phase !== 'wall' && phase !== 'letter' && phase !== 'confession') return;
    saveInProgressCase(story.id, {
      currentStage: 1,
      totalStages: 1,
      topic: story.topic,
      phase,
      boardSnapshot: {
        playerPos: engine.playerPos,
        collectedEvidenceIds: engine.collectedEvidenceIds,
        eliminatedIds: engine.eliminatedIds,
        band: engine.band,
        hintsUsedPerObject: engine.hintsUsedPerObject,
        correctCount: engine.correctCount,
        wrongCount: engine.wrongCount,
        totalHintsUsed: engine.totalHintsUsed,
      },
      savedCase: story,
    });
  }, [engine, phase, completed, story]);

  useEffect(() => () => {
    clearTimeout(toastTimer.current);
    clearTimeout(posterTimer.current);
  }, []);

  const closeCard = useCallback(() => {
    setActiveObjectId(null);
    setCardState(null);
    setAnswer('');
  }, []);

  const closeNotebook = useCallback(() => {
    setNotebookOpen(false);
    setShowAllThoughts(false);
  }, []);

  const openNotebook = useCallback(() => {
    setNotebookOpen(true);
    setShowAllThoughts(false);
    setCluesSeen(engine.collectedEvidenceIds.length);
  }, [engine.collectedEvidenceIds.length]);

  const openObject = useCallback((objectId) => {
    const obj = story.objects.find(o => o.id === objectId);
    if (!obj) return;
    setActiveObjectId(objectId);
    if (obj.clueType === 'observation') {
      const nudge = OBSERVATION_ENCOURAGEMENTS[Math.floor(Math.random() * OBSERVATION_ENCOURAGEMENTS.length)];
      setCardState({ kind: 'observation', text: nudge, hintsShown: [], feedback: null, solved: false });
      setMascot({ mood: 'thinking', text: `Take a close look at the ${obj.name.toLowerCase()}, Detective!` });
    } else {
      const variant = getMathFor(engine, obj);
      setCardState({ kind: 'math', variant, hintsShown: [], feedback: null, solved: false });
      setMascot({ mood: 'thinking', text: 'Use math to read this clue, Detective!' });
    }
  }, [engine, story]);

  const tryMove = useCallback((dx, dy) => {
    if (phase !== 'exploring' || activeObjectId || notebookOpen || posterOpen || exitDialogOpen || completed) return;
    const res = movePlayer(engine, story, dx, dy);
    if (!res.ok) {
      if (res.reason === 'blocked') setMascot({ mood: 'thinking', text: "That way's blocked, Detective!" });
      return;
    }
    SFX.step();
    setEngine(res.state);
    if (res.event.type === 'object') {
      openObject(res.event.objectId);
    } else if (res.event.type === 'already-collected') {
      showToast('Already in your notebook!');
    }
  }, [engine, phase, activeObjectId, notebookOpen, posterOpen, exitDialogOpen, completed, story, openObject, showToast]);

  // Keyboard: WASD + arrows to walk; Escape to close overlays/card.
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      const dirs = {
        w: [0, -1], a: [-1, 0], s: [0, 1], d: [1, 0],
        arrowup: [0, -1], arrowleft: [-1, 0], arrowdown: [0, 1], arrowright: [1, 0],
      };
      if (dirs[k]) {
        e.preventDefault();
        tryMove(dirs[k][0], dirs[k][1]);
        return;
      }
      if (k === 'escape') {
        if (exitDialogOpen) setExitDialogOpen(false);
        else if (activeObjectId) closeCard();
        else if (notebookOpen) closeNotebook();
        else if (posterOpen) setPosterOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tryMove, activeObjectId, notebookOpen, posterOpen, exitDialogOpen, closeCard, closeNotebook]);

  const handleTileTap = useCallback((obj) => {
    const [px, py] = engine.playerPos;
    const dist = Math.max(Math.abs(px - obj.cell[0]), Math.abs(py - obj.cell[1]));
    if (dist <= 1) {
      openObject(obj.id);
    } else {
      setMascot({ mood: 'thinking', text: 'Walk closer to reach that, Detective!' });
    }
  }, [engine.playerPos, openObject]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!activeObjectId || !cardState || cardState.solved) return;
    const obj = story.objects.find(o => o.id === activeObjectId);
    const res = registerAnswer(engine, story, obj, answer);
    if (res.correct) {
      SFX.correct();
      setEngine(res.state);
      setCardState({ ...cardState, solved: true, feedback: { correct: true }, evidence: obj.evidence });
      setAnswer('');
      setMascot({ mood: 'correct', text: 'Clue found! Pinned to the scene.' });
      showToast('Evidence found! Check your notebook.');
    } else {
      SFX.wrong();
      const hw = handleWrong(engine, obj);
      setEngine(hw.state);
      const hintsShown = [...(cardState.hintsShown || [])];
      if (!hintsShown.includes(hw.hintIndex)) hintsShown.push(hw.hintIndex);
      const objAfter = story.objects.find(o => o.id === activeObjectId);
      setCardState({
        ...cardState,
        variant: getMathFor(hw.state, objAfter),
        hintsShown,
        feedback: { correct: false },
      });
      setAnswer('');
      if (hw.offeredEasy) {
        setMascot({ mood: 'hint', text: "Let's try an easier version of this one, Detective." });
      } else {
        setMascot({ mood: 'hint', text: 'Detective, try again — here\'s a hint.' });
      }
    }
  }, [engine, story, activeObjectId, cardState, answer, showToast]);

  const handleObservationCollect = useCallback(() => {
    if (!activeObjectId || !cardState || cardState.solved) return;
    const obj = story.objects.find(o => o.id === activeObjectId);
    const res = collectObservation(engine, obj);
    SFX.correct();
    setEngine(res.state);
    setCardState({ ...cardState, solved: true, feedback: { correct: true }, evidence: obj.evidence });
    setMascot({ mood: 'correct', text: 'Noted in your notebook, Detective!' });
    showToast('Evidence found! Check your notebook.');
  }, [engine, story, activeObjectId, cardState, showToast]);

  // Deduction prompt: the child taps a suspect comparison row inside the
  // notebook. Evaluate immediately — correct → eliminate, wrong → owl hint.
  const handlePromptEliminate = useCallback((entry, suspectId) => {
    const evidenceId = entry.evidenceId || (entry.afterEvidenceIds || []).find(eid =>
      (story.eliminationRules || []).some(r => r.evidenceId === eid));
    if (!evidenceId) return;
    const res = applyElimination(engine, story, evidenceId, suspectId);
    if (!res.ok) {
      if (res.reason === 'no-contradiction') {
        SFX.wrong();
        const s = story.suspects.find(x => x.id === suspectId);
        const miss = (promptMisses[evidenceId] || 0) + 1;
        setPromptMisses(prev => ({ ...prev, [evidenceId]: miss }));
        const hint = miss === 1 ? entry.hint1 : entry.hint2;
        setMascot({ mood: 'hint', text: hint || `That clue doesn't rule out ${s ? s.name : 'them'} — keep looking.` });
        setWrongRow({ evidenceId, suspectId, ts: Date.now() });
      } else if (res.reason === 'not-collected') {
        showToast('Collect that clue first!');
      }
      return;
    }
    SFX.stamp();
    clearTimeout(posterTimer.current);
    setEngine(res.state);
    setSelectedEvidenceId(null);
    setPromptMisses(prev => ({ ...prev, [evidenceId]: 0 }));
    setWrongRow(prev => (prev && prev.evidenceId === evidenceId ? null : prev));
    setPosterOpen(true);
    const s = story.suspects.find(x => x.id === suspectId);
    if (onlyCulpritRemains(story, res.state)) {
      setMascot({ mood: 'solved', text: 'The case is cracked! Only one suspect remains.' });
    } else if (shouldShowDeduction(story, res.state)) {
      setMascot({ mood: 'solved', text: 'All students have alibis — but someone planned this...' });
      posterTimer.current = setTimeout(() => {
        setPosterOpen(false);
        setPhase('wall');
      }, 1800);
    } else {
      setMascot({ mood: 'correct', text: `Eliminated! ${s ? s.name : 'They'}: ${s ? s.eliminatedReason : ''}` });
      posterTimer.current = setTimeout(() => setPosterOpen(false), POSTER_STAMP_MS);
    }
  }, [engine, story, promptMisses, showToast]);

  // Tapping an evidence card in the notebook filters Current Thoughts to the
  // deduction that clue unlocks (repurposed from the old poster flow).
  const toggleEvidenceSelection = useCallback((evidenceId) => {
    setSelectedEvidenceId(prev => (prev === evidenceId ? null : evidenceId));
    setShowAllThoughts(false);
  }, []);

  const handleAccuse = useCallback(() => {
    if (!accusation || completed) return;
    SFX.confetti();
    setCompleted(true);
    setPosterOpen(false);
    setNotebookOpen(false);
    onComplete(story.id, true, {
      totalHintsUsed: engine.totalHintsUsed,
      correctCount: engine.correctCount,
      wrongCount: engine.wrongCount,
      totalQuestions: engine.correctCount + engine.wrongCount,
      skillFamily: story.skillFamily,
    });
    setPhase('confession');
    setMascot({ mood: 'party', text: 'Case solved! Brilliant detective work.' });
  }, [accusation, completed, engine, story, onComplete]);

  const mood = BOARD_MOODS[mascot.mood] || BOARD_MOODS.neutral;

  // Render one Current Thoughts entry by kind: note → short line,
  // prompt → evidence + question + tappable comparisons, aha → conclusion.
  const renderThoughtEntry = (entry) => {
    if (entry.kind === 'note') {
      return (
        <div key={entry.kind + ':' + entry.afterEvidenceIds.join(',')} className="dbc-thought-note">
          <span aria-hidden="true">{entry.emoji}</span> {entry.text}
        </div>
      );
    }
    if (entry.kind === 'prompt') {
      const evidenceId = entry.evidenceId || (entry.afterEvidenceIds || []).find(eid =>
        (story.eliminationRules || []).some(r => r.evidenceId === eid));
      const answeredId = promptAnswer(story, entry);
      const answered = !!answeredId && engine.eliminatedIds.includes(answeredId);
      const misses = promptMisses[evidenceId] || 0;
      const hint = !answered && misses !== 0 ? (misses === 1 ? entry.hint1 : entry.hint2) : null;
      return (
        <div key={entry.kind + ':' + entry.afterEvidenceIds.join(',')} className={`dbc-prompt-card${answered ? ' is-done' : ''}`}>
          <div className="dbc-prompt-evidence">{entry.evidenceEmoji} {entry.evidenceShort}</div>
          <div className="dbc-prompt-question">🔎 {entry.question}</div>
          {entry.compare.map(c => {
            const suspect = story.suspects.find(s => s.id === c.suspectId);
            const eliminated = engine.eliminatedIds.includes(c.suspectId);
            const isWrongRow = wrongRow && wrongRow.evidenceId === evidenceId && wrongRow.suspectId === c.suspectId;
            const cls = ['dbc-prompt-row'];
            if (eliminated) cls.push('is-answered');
            else if (isWrongRow) cls.push('is-wrong');
            return (
              <button
                key={c.suspectId + (isWrongRow ? '-' + wrongRow.ts : '')}
                className={cls.join(' ')}
                onClick={() => !eliminated && !answered && handlePromptEliminate(entry, c.suspectId)}
                disabled={eliminated || answered}
                aria-label={`${eliminated ? 'Eliminated: ' : 'Choose '}${suspect ? suspect.name : c.suspectId} — ${c.value}`}
              >
                <span className="dbc-prompt-row-emoji" aria-hidden="true">{suspect ? suspect.animalEmoji : '❓'}</span>
                <span className="dbc-prompt-row-name">{suspect ? suspect.name : c.suspectId}</span>
                <span className="dbc-prompt-row-value">{c.value}</span>
                {eliminated && <span className="dbc-prompt-row-check" aria-hidden="true">✓</span>}
              </button>
            );
          })}
          {hint && <div className="dbc-prompt-hint">💡 {hint}</div>}
        </div>
      );
    }
    return (
      <div key={entry.kind + ':' + entry.afterEvidenceIds.join(',')} className="dbc-aha-card">
        <div className="dbc-aha-text">{entry.emoji} {entry.text}</div>
        {entry.nudge && (
          <button className="dbc-aha-nudge" onClick={() => setPosterOpen(true)}>
            {entry.nudge}
          </button>
        )}
      </div>
    );
  };

  // ── Intro ─────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <BoardIntro
        story={story}
        onStart={() => {
          setPhase('exploring');
          setMascot({ mood: 'neutral', text: 'Explore the scene, Detective — step on anything interesting!' });
        }}
      />
    );
  }

  // ── Detective Wall (interactive Case 3 reveal) ──────────────────
  if (phase === 'wall') {
    return (
      <BoardWall
        story={story}
        onComplete={() => {
          SFX.confetti();
          setCompleted(true);
          onComplete(story.id, true, {
            totalHintsUsed: engine.totalHintsUsed,
            correctCount: engine.correctCount,
            wrongCount: engine.wrongCount,
            totalQuestions: engine.correctCount + engine.wrongCount,
            skillFamily: story.skillFamily,
          });
          setPhase('confession');
        }}
        onBack={onBack}
      />
    );
  }

  // ── Letter (portrait shrinks into letter, confession) ────────────
  if (phase === 'letter') {
    return (
      <BoardLetter
        story={story}
        onComplete={() => {
          SFX.confetti();
          setCompleted(true);
          onComplete(story.id, true, {
            totalHintsUsed: engine.totalHintsUsed,
            correctCount: engine.correctCount,
            wrongCount: engine.wrongCount,
            totalQuestions: engine.correctCount + engine.wrongCount,
            skillFamily: story.skillFamily,
          });
          setPhase('confession');
        }}
        onBack={onBack}
      />
    );
  }

  // ── Confession ────────────────────────────────────────────────────
  if (phase === 'confession') {
    return (
      <BoardConfession
        story={story}
        stats={{ totalHintsUsed: engine.totalHintsUsed }}
        onBack={onBack}
      />
    );
  }

  // ── Exploring: board + mascot + overlays ──────────────────────────
  const activeObj = activeObjectId ? story.objects.find(o => o.id === activeObjectId) : null;

  const renderTiles = [];
  for (let y = 0; y < story.gridSize; y++) {
    for (let x = 0; x < story.gridSize; x++) {
      const blocked = isBlocked(story, x, y);
      const obj = objectAt(story, x, y);
      const isPlayer = engine.playerPos[0] === x && engine.playerPos[1] === y;
      const collected = obj && engine.collectedEvidenceIds.includes(obj.evidence.id);

      const classes = ['dbc-tile'];
      if (blocked) classes.push('dbc-tile--blocked');
      else if (obj) classes.push(collected ? 'dbc-tile--collected' : 'dbc-tile--object');
      if (isPlayer) classes.push('dbc-tile--player', 'dbc-hop');

      const label = obj
        ? (collected ? `${obj.name} — already in your notebook` : `Investigate ${obj.name}`)
        : (blocked ? 'blocked' : 'floor');

      renderTiles.push(
        <div
          key={`${x}-${y}`}
          className={classes.join(' ')}
          role={obj && !blocked ? 'button' : undefined}
          tabIndex={obj && !blocked ? 0 : undefined}
          aria-label={label}
          onClick={obj && !blocked && !isPlayer ? () => handleTileTap(obj) : undefined}
          onKeyDown={obj && !blocked ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTileTap(obj);
            }
          } : undefined}
        >
          {!blocked && obj && (
            <>
              <span className="dbc-object-emoji" aria-hidden="true">{obj.emoji}</span>
              {collected && (
                <span className="dbc-evidence-tag" aria-hidden="true">{obj.evidence.id.replace('ev-', '')}</span>
              )}
            </>
          )}
          {!blocked && !obj && isPlayer && (
            <span className="dbc-player-hat" role="img" aria-label="You, the detective">🕵️</span>
          )}
        </div>
      );
    }
  }

  return (
    <div className="dbc-root">
      <div className="dbc-scene">
        <div className="dbc-topbar">
          <button
            className="dbc-exit-btn"
            onClick={() => setExitDialogOpen(true)}
            aria-label="Leave case"
          >
            ←
          </button>
          <div className="dbc-topbar-toggles">
            <button
              ref={notebookBtnRef}
              className={`dbc-toggle-btn${notebookOpen ? ' is-active' : ''}`}
              onClick={() => { if (notebookOpen) closeNotebook(); else openNotebook(); setPosterOpen(false); setNotebookPointerActive(false); }}
              aria-label={notebookOpen ? 'Close Notebook' : unreadClues > 0 ? 'Open Notebook — new clues waiting' : 'Open Notebook'}
            >
              <span
                key={engine.collectedEvidenceIds.length}
                className={`dbc-toggle-notebook dbc-toggle-inner${unreadClues > 0 ? ' dbc-toggle-inner--nudge' : ''}`}
              >
                📝
              </span>
              <span className="dbc-toggle-btn--tooltip">Notebook</span>
              {unreadClues > 0 && <span className="dbc-toggle-dot" aria-hidden="true" />}
            </button>
            <button
              className={`dbc-toggle-btn${posterOpen ? ' is-active' : ''}`}
              onClick={() => { setPosterOpen(v => !v); closeNotebook(); }}
              aria-label={posterOpen ? 'Close Suspects' : 'View Suspects'}
            >
              <span className="dbc-toggle-notebook dbc-toggle-inner">🖼</span>
              <span className="dbc-toggle-btn--tooltip">Suspects</span>
            </button>
          </div>
          {notebookPointerActive && !notebookOpen && phase === 'exploring' && (
            <AttentionPointer targetRef={notebookBtnRef} pulseCount={2} onDone={() => setNotebookPointerActive(false)} />
          )}
        </div>

        <div className="dbc-mascot-bar" role="status" aria-live="polite">
          <span className="dbc-mascot-emoji" aria-hidden="true">{mood.emoji}</span>
          <span className="dbc-mascot-speech">
            {mascot.text || `Walk the scene, Detective. ${collectedEvidence.length} of ${story.objects.length} clues found.`}
          </span>
        </div>

        <div className="dbc-board-wrap">
          <div className="dbc-board" role="grid" aria-label="Crime scene — 12 by 12 board">
            {renderTiles}
          </div>
        </div>

        <div className="dbc-dpad" aria-label="Movement controls">
          <button className="dbc-dpad-btn dbc-dpad-up" onClick={() => tryMove(0, -1)} aria-label="Move up">▲</button>
          <button className="dbc-dpad-btn dbc-dpad-left" onClick={() => tryMove(-1, 0)} aria-label="Move left">◀</button>
          <button className="dbc-dpad-btn dbc-dpad-down" onClick={() => tryMove(0, 1)} aria-label="Move down">▼</button>
          <button className="dbc-dpad-btn dbc-dpad-right" onClick={() => tryMove(1, 0)} aria-label="Move right">▶</button>
        </div>

        <div className="dbc-desk-edge" aria-hidden="true" />

        <div className="dbc-keyhint">WASD / arrow keys to move · Escape to close</div>
      </div>

      {/* Math / observation index card */}
      {activeObj && cardState && (
        <div className="dbc-card-backdrop" onClick={closeCard}>
          <div className="dbc-index-card" onClick={e => e.stopPropagation()}>
            {cardState.solved ? (
              <>
                <div className="dbc-card-label">🖇 Evidence found</div>
                <div className="dbc-card-narrative">
                  <span className="dbc-evidence-cat">{catTag(cardState.evidence.category)}</span>
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.45, margin: '0.4rem 0 0.9rem' }}>
                  {cardState.evidence.text}
                </p>
                <button className="dbc-card-submit" onClick={closeCard} style={{ width: '100%' }}>
                  Continue
                </button>
              </>
            ) : cardState.kind === 'observation' ? (
              <>
                <div className="dbc-card-label">🧐 Observation · {activeObj.name}</div>
                <p className="dbc-card-narrative">{cardState.text}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="dbc-card-submit" onClick={handleObservationCollect} style={{ flex: 1 }}>
                    Clue found 🔎
                  </button>
                  <button
                    className="dbc-primary-btn dbc-primary-btn--ghost-dark"
                    onClick={closeCard}
                    style={{ minHeight: 50, minWidth: 90, fontSize: '0.9rem', margin: 0 }}
                  >
                    Skip
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="dbc-card-label">🕵️ Investigation · {activeObj.name}</div>
                {!cardState.variant.visuals && (
                  <p className="dbc-card-narrative">{cardState.variant.narrative}</p>
                )}
                {cardState.variant.visuals && <VisualMath visuals={cardState.variant.visuals} />}
                <p className="dbc-card-question">{cardState.variant.question}</p>
                <div className="dbc-card-input-row">
                  <input
                    ref={inputRef}
                    className="dbc-card-input"
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="?"
                    aria-label="Your answer"
                  />
                  <button type="submit" className="dbc-card-submit" disabled={!answer.trim()}>
                    Check
                  </button>
                </div>

                {cardState.feedback && !cardState.feedback.correct && (
                  <div className="dbc-card-wrong">Not quite — try again, Detective!</div>
                )}

                {cardState.hintsShown.map(hidx => {
                  const hint = (activeObj.investigation && activeObj.investigation.hints) || [];
                  if (!hint[hidx]) return null;
                  return (
                    <div key={hidx} className="dbc-card-hint">
                      💡 {hint[hidx]}
                    </div>
                  );
                })}

                <div style={{ textAlign: 'right', marginTop: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={closeCard}
                    style={{ background: 'none', border: 'none', color: 'rgba(42,46,51,0.85)', fontSize: '0.78rem', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', minHeight: 44 }}
                  >
                    Skip for now
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Notebook overlay (slides from the left; stays mounted for a smooth exit) */}
      <div
        className={`dbc-overlay-backdrop${notebookOpen ? ' is-open' : ''}`}
        aria-hidden={!notebookOpen}
        onClick={closeNotebook}
      />
      <div
        className={`dbc-notebook${notebookOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-label="Evidence notebook"
        aria-hidden={!notebookOpen}
      >
        <div className="dbc-notebook-header">
          <span className="dbc-notebook-title">My Notebook</span>
          <button className="dbc-notebook-close" onClick={closeNotebook} aria-label="Close Notebook">✕</button>
        </div>
        <div className="dbc-notebook-body">
          <div>
            <div className="dbc-section-label">
              Evidence Found ({collectedEvidence.length}/{story.objects.length})
            </div>
            {collectedEvidence.length === 0 ? (
              <div className="dbc-notebook-empty">Nothing in the notebook yet — keep exploring the scene.</div>
            ) : (
              collectedEvidence.map(ev => (
                <div
                  key={ev.id}
                  className={`dbc-evidence-item${selectedEvidenceId === ev.id ? ' is-selected' : ''}`}
                  onClick={() => toggleEvidenceSelection(ev.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Evidence: ${catTag(ev.category)} — ${ev.text}. ${selectedEvidenceId === ev.id ? 'Showing its deduction.' : 'Tap to see its deduction.'}`}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleEvidenceSelection(ev.id); } }}
                >
                  <div className="dbc-evidence-cat">{catTag(ev.category)}</div>
                  {ev.text}
                </div>
              ))
            )}
          </div>
          <div>
            <div className="dbc-section-label">Current Thought</div>
            {currentThoughts.length === 0 ? (
              <div className="dbc-notebook-empty">Keep exploring — your thoughts will grow as clues appear.</div>
            ) : (
              currentThoughts.map(renderThoughtEntry)
            )}
            {thoughts.length > 1 && (
              <button
                className="dbc-thought-toggle"
                onClick={() => setShowAllThoughts(v => !v)}
                aria-pressed={showAllThoughts}
              >
                {showAllThoughts ? `Show one thought` : `Show all thoughts (${thoughts.length})`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Suspect poster overlay (slides from the right; stays mounted for a smooth exit) */}
      <div
        className={`dbc-overlay-backdrop${posterOpen && !notebookOpen ? ' is-open' : ''}`}
        aria-hidden={!posterOpen}
        onClick={() => setPosterOpen(false)}
      />
      <div
        className={`dbc-poster${posterOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-label="Suspect board"
        aria-hidden={!posterOpen}
      >
        <div className="dbc-poster-header">
          <span className="dbc-poster-title">Suspects</span>
          <button className="dbc-poster-close" onClick={() => setPosterOpen(false)} aria-label="Close Suspects">✕</button>
        </div>
        <div className="dbc-poster-body">
          {posterSuspects.map(s => (
            <div
              key={s.id}
              className={`dbc-suspect-card${s.eliminated ? ' is-eliminated' : ''}${accusation && accusation.id === s.id && !s.eliminated ? ' is-accusable' : ''}`}
              aria-label={`${s.name}, ${s.species}. ${s.eliminated ? `Eliminated — ${s.eliminatedReason}` : ''}`}
            >
              <div className="dbc-suspect-head">
                <span className="dbc-suspect-emoji" aria-hidden="true">{s.animalEmoji}</span>
                <span className="dbc-suspect-name">{s.name}</span>
              </div>
              <div className="dbc-suspect-hint">{s.hint}</div>
              <div className="dbc-profile-grid">
                {Object.entries(s.profile).map(([field, value]) => (
                  <div key={field} className="dbc-profile-slot">
                    <b>{PROFILE_LABELS[field] || field}</b>
                    <span className={value === '???' ? 'dbc-qmark' : ''}>{value}</span>
                  </div>
                ))}
              </div>
              {s.eliminated && <div className="dbc-stamp">ELIMINATED</div>}
              {s.eliminated && s.eliminatedReason && <div className="dbc-motive-line">{s.eliminatedReason}</div>}
            </div>
          ))}
        </div>
        {accusation && (
          <div className="dbc-accuse-row">
            <button className="dbc-accuse-btn" onClick={handleAccuse}>
              Accuse {accusation.name}!
            </button>
          </div>
        )}
      </div>

      {exitDialogOpen && (
        <div className="dbc-exit-dialog-backdrop" onClick={() => setExitDialogOpen(false)}>
          <div className="dbc-exit-dialog" role="dialog" aria-modal="true" aria-label="Leave the case?" onClick={e => e.stopPropagation()}>
            <div className="dbc-exit-dialog-title">Leave the case?</div>
            <p className="dbc-exit-dialog-body">
              Your progress is saved — you can pick it up again from the case library.
            </p>
            <div className="dbc-exit-dialog-actions">
              <button className="dbc-primary-btn dbc-primary-btn--ghost-dark" onClick={() => setExitDialogOpen(false)}>
                Keep playing
              </button>
              <button
                className="dbc-primary-btn"
                onClick={() => { setExitDialogOpen(false); onBack(); }}
              >
                Leave for now
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="dbc-toast" role="status">{toast}</div>}
    </div>
  );
}
