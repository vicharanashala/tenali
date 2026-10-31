import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { NUMBERS_INFO } from './numbers1To10Data.js';

/**
 * NumberTracingApp — Minimal Tactile Learn & Trace Module
 *
 * Designed for intuitive early-learning:
 * - Zero poetic chatter: Only counts the number names aloud ("One", "Two", "Three"...)
 * - Animated tactile demo: Hand cursor shows how to trace and count
 * - Auto-advances to the next number upon completing the count
 */

// 3D Cartoon Click Hand Cursor for tutorials and visual hints
function ClickHandCursor({ isPressed = false, isContinuous = false }) {
  return (
    <div
      className={`tutorial-click-hand ${isPressed ? 'is-pressed' : ''} ${isContinuous ? 'is-continuous' : ''}`}
      aria-hidden="true"
    >
      <div className="hand-tap-ripple" />
      <svg
        className="hand-pointer-svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#78350f"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"
          fill="#fbbf24"
        />
        <path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2" fill="#fde047" />
        <path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" fill="#fde047" />
        <path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" fill="#fef08a" />
      </svg>
    </div>
  );
}

const NUMBER_WORDS = {
  1: 'One',
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
  7: 'Seven',
  8: 'Eight',
  9: 'Nine',
  10: 'Ten'
};

// Accurate stroke definitions, start coordinates, and objects
export const TRACING_CONFIG = {
  1: {
    strokes: [
      { id: 'stem', path: 'M 150,55 L 150,245', start: [150, 55], end: [150, 245] }
    ],
    objectName: 'apple',
    objectEmoji: '🍎'
  },
  2: {
    strokes: [
      { id: 'curve_sleep', path: 'M 95,100 C 95,45 205,45 205,110 C 205,170 115,210 95,245 L 205,245', start: [95, 100], end: [205, 245] }
    ],
    objectName: 'duck',
    objectEmoji: '🦆'
  },
  3: {
    strokes: [
      { id: 'double_curve', path: 'M 105,80 C 150,55 200,75 195,125 C 190,160 150,160 135,160 C 160,160 205,170 200,215 C 195,255 140,260 100,245', start: [105, 80], end: [100, 245] }
    ],
    objectName: 'car',
    objectEmoji: '🚗'
  },
  4: {
    strokes: [
      { id: 'down_cross', path: 'M 115,60 L 115,180 L 205,180', start: [115, 60], end: [205, 180] },
      { id: 'down_stem', path: 'M 175,60 L 175,250', start: [175, 60], end: [175, 250] }
    ],
    objectName: 'star',
    objectEmoji: '⭐'
  },
  5: {
    strokes: [
      { id: 'down_belly', path: 'M 125,75 L 120,135 C 140,125 205,125 205,180 C 205,235 145,245 105,230', start: [125, 75], end: [105, 230] },
      { id: 'top_hat', path: 'M 125,75 L 195,75', start: [125, 75], end: [195, 75] }
    ],
    objectName: 'butterfly',
    objectEmoji: '🦋'
  },
  6: {
    strokes: [
      { id: 'curve_loop', path: 'M 185,75 C 120,115 100,175 100,215 C 100,265 195,265 195,215 C 195,165 100,165 100,215', start: [185, 75], end: [100, 215] }
    ],
    objectName: 'strawberry',
    objectEmoji: '🍓'
  },
  7: {
    strokes: [
      { id: 'roof_slant', path: 'M 100,75 L 200,75 L 130,250', start: [100, 75], end: [130, 250] }
    ],
    objectName: 'flower',
    objectEmoji: '🌸'
  },
  8: {
    strokes: [
      { id: 'figure_eight', path: 'M 150,70 C 120,70 120,135 150,155 C 180,175 180,245 150,245 C 120,245 120,175 150,155 C 180,135 180,70 150,70', start: [150, 70], end: [150, 70] }
    ],
    objectName: 'balloon',
    objectEmoji: '🎈'
  },
  9: {
    strokes: [
      { id: 'loop_stem', path: 'M 150,145 C 120,145 120,75 150,75 C 180,75 180,145 150,145 L 180,145 L 180,250 C 180,260 150,260 140,250', start: [150, 145], end: [140, 250] }
    ],
    objectName: 'fish',
    objectEmoji: '🐟'
  },
  10: {
    strokes: [
      { id: 'one_stem', path: 'M 90,75 L 90,245', start: [90, 75], end: [90, 245] },
      { id: 'zero_oval', path: 'M 175,75 C 145,75 145,245 175,245 C 205,245 205,75 175,75', start: [175, 75], end: [175, 75] }
    ],
    objectName: 'cupcake',
    objectEmoji: '🧁'
  }
};

const NUMBER_PATTERNS = {
  1:  /\b(1|one|won|wan|van|when|run|first|ek|ondru|onnu|onru|un|uno)\b/i,
  2:  /\b(2|two|to|too|tu|do|doo|second|rendu|erandu|irandu|dos)\b/i,
  3:  /\b(3|three|tree|free|thee|tri|third|teen|tin|moonu|moondru|tres)\b/i,
  4:  /\b(4|four|for|fore|far|ford|fourth|char|chaar|naalu|naangu|cuatro)\b/i,
  5:  /\b(5|five|faiv|fai|fiv|fifth|panch|paanch|anju|aindhu|ainthu|cinco)\b/i,
  6:  /\b(6|six|siks|sex|sick|sixth|chhe|che|chha|aaru|seis)\b/i,
  7:  /\b(7|seven|sevn|sevan|seventh|saat|sat|yezhu|ezhu|siete)\b/i,
  8:  /\b(8|eight|ate|ait|eat|eighth|aath|ath|ettu|ocho)\b/i,
  9:  /\b(9|nine|nain|nin|night|ninth|nau|no|ombodhu|onpathu|onbathu|nueve)\b/i,
  10: /\b(10|ten|tan|tin|den|tenth|das|dus|pathu|patthu|diez)\b/i
};

function detectSpokenNumber(text, expectedTarget) {
  if (!text) return null;
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  // Check expected target first
  if (expectedTarget && NUMBER_PATTERNS[expectedTarget] && NUMBER_PATTERNS[expectedTarget].test(clean)) {
    return expectedTarget;
  }
  // Check any other number 1..10
  for (let n = 1; n <= 10; n++) {
    if (n !== expectedTarget && NUMBER_PATTERNS[n] && NUMBER_PATTERNS[n].test(clean)) {
      return n;
    }
  }
  return null;
}

export default function NumberTracingApp({
  onAwardStars,
  markTopicCompleted,
  onNavigateMaze
}) {
  const [selectedNum, setSelectedNum] = useState(1);
  const [stage, setStage] = useState('TRACING'); // 'TRACING' | 'ECHO_COUNT' | 'SOLO_COUNT' | 'COMPLETED'
  
  // Tracing state
  const [currentStrokeIdx, setCurrentStrokeIdx] = useState(0);
  const [strokeProgress, setStrokeProgress] = useState(0); // 0 to 1
  const [isDragging, setIsDragging] = useState(false);
  const [completedStrokes, setCompletedStrokes] = useState([]);
  const [completedNumbers, setCompletedNumbers] = useState(new Set());

  // Echo Counting state (Call & Response: voice says 1, child repeats 1, then 2, etc.)
  const [echoStep, setEchoStep] = useState(1);
  const [echoSubState, setEchoSubState] = useState('ANNOUNCING_NUM'); // 'ANNOUNCING_NUM' | 'APP_SPEAKING' | 'WAITING_KID'

  // Solo Counting state (Child counts on their own 1..N; restarts on wrong count)
  const [soloCountStep, setSoloCountStep] = useState(1);
  const [wrongAttemptFlash, setWrongAttemptFlash] = useState(false);

  const [heardWord, setHeardWord] = useState('');
  const [micActive, setMicActive] = useState(false);

  // Demo animation state
  const [demoActive, setDemoActive] = useState(false);
  const [demoHandPos, setDemoHandPos] = useState({ target: 'none', x: 0, y: 0, pressing: false, itemIdx: 0 });
  const demoTimersRef = useRef([]);
  const demoAnimRef = useRef(null);

  // Refs for zero-latency, closure-safe callbacks
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const audioCtxRef = useRef(null);
  const speechRecRef = useRef(null);
  const stageRef = useRef('TRACING');
  const echoStepRef = useRef(1);
  const echoSubStateRef = useRef('ANNOUNCING_NUM');
  const soloCountStepRef = useRef(1);
  const lastMatchTimeRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    echoStepRef.current = echoStep;
  }, [echoStep]);

  useEffect(() => {
    echoSubStateRef.current = echoSubState;
  }, [echoSubState]);

  useEffect(() => {
    soloCountStepRef.current = soloCountStep;
  }, [soloCountStep]);

  const config = TRACING_CONFIG[selectedNum] || TRACING_CONFIG[1];
  const activeStroke = config.strokes[currentStrokeIdx] || config.strokes[0];

  // Initialize Web Audio
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) audioCtxRef.current = new AudioClass();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq, type = 'sine', duration = 0.15, gainVal = 0.18) => {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  }, [getAudioCtx]);

  const playChime = useCallback((step) => {
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const f = scale[(step - 1) % scale.length];
    playTone(f, 'triangle', 0.28, 0.25);
    setTimeout(() => playTone(f * 1.5, 'sine', 0.2, 0.12), 40);
  }, [playTone]);

  const playWrongTone = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(170, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch {
      // Audio fallback
    }
  }, [getAudioCtx]);

  const playSuccessChord = useCallback(() => {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 'triangle', 0.5, 0.22), i * 80);
    });
  }, [playTone]);

  // Clean, minimal speech: STRICTLY only speaks the number name itself ("One", "Two", etc.)
  const speakNumber = useCallback((num) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const word = NUMBER_WORDS[num] || String(num);
      const u = new SpeechSynthesisUtterance(word);
      u.rate = 1.0;
      u.pitch = 1.15;
      window.speechSynthesis.speak(u);
    } catch {
      // Fallback
    }
  }, []);

  // Compute live dot coordinates along the SVG path based on progress
  const [dotPos, setDotPos] = useState({ x: activeStroke.start[0], y: activeStroke.start[1] });

  useEffect(() => {
    if (pathRef.current) {
      try {
        const totalLen = pathRef.current.getTotalLength();
        const pt = pathRef.current.getPointAtLength(totalLen * strokeProgress);
        setDotPos({ x: pt.x, y: pt.y });
      } catch {
        setDotPos({ x: activeStroke.start[0], y: activeStroke.start[1] });
      }
    } else {
      setDotPos({ x: activeStroke.start[0], y: activeStroke.start[1] });
    }
  }, [strokeProgress, activeStroke]);

  // Clear demo and transition timers
  const clearDemoTimers = useCallback(() => {
    demoTimersRef.current.forEach(t => clearTimeout(t));
    demoTimersRef.current = [];
    if (demoAnimRef.current) {
      cancelAnimationFrame(demoAnimRef.current);
      demoAnimRef.current = null;
    }
  }, []);

  const stopDemo = useCallback(() => {
    clearDemoTimers();
    setDemoActive(false);
    setDemoHandPos({ target: 'none', x: 0, y: 0, pressing: false, itemIdx: 0 });
  }, [clearDemoTimers]);

  // Switch/Reset Number
  const selectNumber = useCallback((n) => {
    clearDemoTimers();
    if (speechRecRef.current) {
      try { speechRecRef.current.abort(); } catch { /* ignore */ }
      speechRecRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSelectedNum(n);
    setStage('TRACING');
    stageRef.current = 'TRACING';
    setCurrentStrokeIdx(0);
    setStrokeProgress(0);
    setCompletedStrokes([]);
    setEchoStep(1);
    echoStepRef.current = 1;
    setEchoSubState('ANNOUNCING_NUM');
    echoSubStateRef.current = 'ANNOUNCING_NUM';
    setSoloCountStep(1);
    soloCountStepRef.current = 1;
    setWrongAttemptFlash(false);
    setHeardWord('');
    speakNumber(n);
  }, [clearDemoTimers, speakNumber]);

  // Finish counting: Confetti, stars, strictly SILENT (no spoken words), advance to next number!
  const finishCountingAndAdvance = useCallback(() => {
    if (speechRecRef.current) {
      try { speechRecRef.current.abort(); } catch { /* ignore */ }
      speechRecRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setStage('COMPLETED');
    stageRef.current = 'COMPLETED';
    playSuccessChord();

    try {
      confetti({ particleCount: 85, spread: 75, origin: { y: 0.6 } });
    } catch {
      // Safe fallback
    }

    setCompletedNumbers((prev) => new Set([...prev, selectedNum]));

    if (typeof onAwardStars === 'function') {
      onAwardStars(2);
    }

    // After counting don't say anything, automatically move to next number
    const t = setTimeout(() => {
      if (selectedNum < 10) {
        selectNumber(selectedNum + 1);
      } else {
        if (typeof markTopicCompleted === 'function') {
          markTopicCompleted('numbers-1-to-10');
        }
        if (typeof onNavigateMaze === 'function') {
          onNavigateMaze();
        }
      }
    }, 1200);

    demoTimersRef.current.push(t);
  }, [selectedNum, playSuccessChord, onAwardStars, markTopicCompleted, onNavigateMaze, selectNumber]);

  // Handle Solo Counting Attempt (Child counts on their own 1..N; restart on wrong count)
  const handleSoloCountAttempt = useCallback((spokenNum) => {
    const target = soloCountStepRef.current;
    if (spokenNum === target) {
      // Correct number in solo sequence!
      playChime(target);
      if (target < selectedNum) {
        const nextTarget = target + 1;
        soloCountStepRef.current = nextTarget;
        setSoloCountStep(nextTarget);
      } else {
        // Child completed counting the number on their own!
        finishCountingAndAdvance();
      }
    } else {
      // Counted wrong! Restart counting for this number alone
      playWrongTone();
      soloCountStepRef.current = 1;
      setSoloCountStep(1);
      setWrongAttemptFlash(true);
      const tFlash = setTimeout(() => setWrongAttemptFlash(false), 900);
      demoTimersRef.current.push(tFlash);
    }
  }, [selectedNum, playChime, playWrongTone, finishCountingAndAdvance]);

  // Transition to Solo Count Stage (Child counts on their own)
  const startSoloCountStage = useCallback(() => {
    setStage('SOLO_COUNT');
    stageRef.current = 'SOLO_COUNT';
    setSoloCountStep(1);
    soloCountStepRef.current = 1;
    setWrongAttemptFlash(false);
    setHeardWord('');
    lastMatchTimeRef.current = Date.now();
  }, []);

  // Trigger one step in Echo Count (voice speaks, then waits for child repeat)
  const triggerEchoStep = useCallback((step) => {
    setEchoStep(step);
    echoStepRef.current = step;
    setEchoSubState('APP_SPEAKING');
    echoSubStateRef.current = 'APP_SPEAKING';

    speakNumber(step);
    playTone(523.25, 'triangle', 0.18, 0.2);

    const tWait = setTimeout(() => {
      setEchoSubState('WAITING_KID');
      echoSubStateRef.current = 'WAITING_KID';
      lastMatchTimeRef.current = Date.now();
    }, 650);

    demoTimersRef.current.push(tWait);
  }, [speakNumber, playTone]);

  // When child repeats the step in Echo Count
  const onChildEchoed = useCallback((spokenNum) => {
    const currentStep = echoStepRef.current;
    if (spokenNum !== currentStep) return;

    playChime(currentStep);

    if (currentStep < selectedNum) {
      const nextStep = currentStep + 1;
      setEchoStep(nextStep);
      echoStepRef.current = nextStep;
      const tNext = setTimeout(() => {
        triggerEchoStep(nextStep);
      }, 700);
      demoTimersRef.current.push(tNext);
    } else {
      // Child successfully repeated all numbers! Now count on their own
      const tSolo = setTimeout(() => {
        startSoloCountStage();
      }, 900);
      demoTimersRef.current.push(tSolo);
    }
  }, [selectedNum, playChime, triggerEchoStep, startSoloCountStage]);

  // Ensure speech recognition is active and processing callbacks
  const ensureSpeechActive = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechClass) return;

    try {
      if (!speechRecRef.current) {
        const r = new SpeechClass();
        speechRecRef.current = r;
        r.continuous = true;
        r.interimResults = true;
        r.maxAlternatives = 8;
        r.lang = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-US';

        r.onstart = () => setMicActive(true);
        r.onend = () => {
          setMicActive(false);
          if (stageRef.current === 'ECHO_COUNT' || stageRef.current === 'SOLO_COUNT') {
            try { r.start(); } catch { /* ignore */ }
          }
        };
        r.onerror = () => { /* ignore */ };

        r.onresult = (ev) => {
          for (let i = ev.resultIndex; i < ev.results.length; i++) {
            const res = ev.results[i];
            if (!res) continue;
            const text = res[0] ? res[0].transcript : '';
            if (text) setHeardWord(text.trim());

            for (let a = 0; a < res.length; a++) {
              const cand = res[a] ? res[a].transcript : '';
              const now = Date.now();
              if (now - lastMatchTimeRef.current < 280) continue;

              if (stageRef.current === 'ECHO_COUNT') {
                if (echoSubStateRef.current === 'WAITING_KID') {
                  const expected = echoStepRef.current;
                  const spoken = detectSpokenNumber(cand, expected);
                  if (spoken === expected) {
                    lastMatchTimeRef.current = now;
                    echoSubStateRef.current = 'APP_SPEAKING';
                    onChildEchoed(spoken);
                    break;
                  }
                }
              } else if (stageRef.current === 'SOLO_COUNT') {
                const expected = soloCountStepRef.current;
                const spoken = detectSpokenNumber(cand, expected);
                if (spoken !== null) {
                  lastMatchTimeRef.current = now;
                  handleSoloCountAttempt(spoken);
                  break;
                }
              }
            }
          }
        };

        r.start();
      } else {
        try { speechRecRef.current.start(); } catch { /* ignore */ }
      }
    } catch {
      // Speech recognition fallback
    }
  }, [onChildEchoed, handleSoloCountAttempt]);

  // Phase A: Echo Count (First say number e.g. 4, then voice says 1 child repeats 1, then 2...)
  const startEchoCountStage = useCallback(() => {
    setStage('ECHO_COUNT');
    stageRef.current = 'ECHO_COUNT';
    setEchoStep(1);
    echoStepRef.current = 1;
    setEchoSubState('ANNOUNCING_NUM');
    echoSubStateRef.current = 'ANNOUNCING_NUM';
    setHeardWord('');

    ensureSpeechActive();

    // Step 0: First say the target number itself (e.g. "Four")
    speakNumber(selectedNum);
    playTone(440, 'triangle', 0.25, 0.2);

    // After 900ms, start step 1 of call & response
    const tStartEcho = setTimeout(() => {
      triggerEchoStep(1);
    }, 900);

    demoTimersRef.current.push(tStartEcho);
  }, [selectedNum, speakNumber, playTone, ensureSpeechActive, triggerEchoStep]);

  // User Pointer Dragging along Path
  const handlePointerDown = (e) => {
    if (demoActive) stopDemo();
    if (stage !== 'TRACING') return;
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
    getAudioCtx();
    playTone(480, 'sine', 0.08, 0.12);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !svgRef.current || !pathRef.current || stage !== 'TRACING') return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - svgRect.left) / svgRect.width) * 300;
    const svgY = ((e.clientY - svgRect.top) / svgRect.height) * 300;

    const totalLen = pathRef.current.getTotalLength();
    if (totalLen <= 0) return;

    const samples = 35;
    let bestDist = Infinity;
    let bestLen = strokeProgress * totalLen;

    const minSearch = Math.max(0, (strokeProgress - 0.08) * totalLen);
    const maxSearch = Math.min(totalLen, (strokeProgress + 0.35) * totalLen);
    const step = (maxSearch - minSearch) / samples;

    for (let l = minSearch; l <= maxSearch; l += step) {
      const pt = pathRef.current.getPointAtLength(l);
      const d = Math.hypot(pt.x - svgX, pt.y - svgY);
      if (d < bestDist) {
        bestDist = d;
        bestLen = l;
      }
    }

    if (bestDist < 55) {
      const newProgress = Math.min(1, Math.max(strokeProgress, bestLen / totalLen));
      setStrokeProgress(newProgress);

      if (newProgress >= 0.94) {
        setStrokeProgress(1);
        setIsDragging(false);
        playChime(currentStrokeIdx + 1);

        const newCompleted = [...completedStrokes, currentStrokeIdx];
        setCompletedStrokes(newCompleted);

        if (newCompleted.length >= config.strokes.length) {
          playSuccessChord();
          // Move to Echo Count Stage (voice says 1, child repeats 1, then 2...)
          const t = setTimeout(() => {
            startEchoCountStage();
          }, 450);
          demoTimersRef.current.push(t);
        } else {
          // Advance to next stroke (e.g. stroke 2 in number 4)
          const nextIdx = currentStrokeIdx + 1;
          setCurrentStrokeIdx(nextIdx);
          setStrokeProgress(0);
        }
      }
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch {
      // Safe fallback
    }
  };

  // Object Tap Handler (works as fallback or accompaniment to mic)
  const handleObjectTap = (itemIdx) => {
    if (demoActive) stopDemo();
    getAudioCtx();
    if (stage === 'ECHO_COUNT') {
      if (echoSubStateRef.current === 'WAITING_KID' && itemIdx === echoStepRef.current) {
        echoSubStateRef.current = 'APP_SPEAKING';
        onChildEchoed(itemIdx);
      }
    } else if (stage === 'SOLO_COUNT') {
      handleSoloCountAttempt(itemIdx);
    }
  };

  // Animated Playable Demo: Demonstrates how to trace and count
  const startDemo = useCallback(() => {
    clearDemoTimers();
    setDemoActive(true);
    setStage('TRACING');
    stageRef.current = 'TRACING';
    setCurrentStrokeIdx(0);
    setStrokeProgress(0);
    setCompletedStrokes([]);

    const stroke0 = config.strokes[0];
    const totalLen = pathRef.current ? pathRef.current.getTotalLength() : 300;

    // Step 1: Hand points to green start dot
    setDemoHandPos({ target: 'svg', x: stroke0.start[0], y: stroke0.start[1], pressing: false, itemIdx: 0 });

    const t1 = setTimeout(() => {
      // Press down on start dot
      setDemoHandPos(prev => ({ ...prev, pressing: true }));
      playTone(480, 'sine', 0.08, 0.12);

      // Animate stroke glide over 1.2s
      const startTime = performance.now();
      const duration = 1200;

      const animateTrace = (now) => {
        const elapsed = now - startTime;
        const p = Math.min(1, elapsed / duration);
        setStrokeProgress(p);

        if (pathRef.current) {
          try {
            const pt = pathRef.current.getPointAtLength(totalLen * p);
            setDemoHandPos({ target: 'svg', x: pt.x, y: pt.y, pressing: true, itemIdx: 0 });
          } catch {
            // Ignore
          }
        }

        if (p < 1) {
          demoAnimRef.current = requestAnimationFrame(animateTrace);
        } else {
          // Stroke completed
          setCompletedStrokes([0]);
          playChime(1);

          // If second stroke exists (e.g. number 4)
          if (config.strokes.length > 1) {
            const stroke1 = config.strokes[1];
            setCurrentStrokeIdx(1);
            setStrokeProgress(0);
            setDemoHandPos({ target: 'svg', x: stroke1.start[0], y: stroke1.start[1], pressing: false, itemIdx: 0 });

            const tNext = setTimeout(() => {
              setDemoHandPos(prev => ({ ...prev, pressing: true }));
              const start2 = performance.now();
              const dur2 = 1000;

              const anim2 = (now2) => {
                const el2 = now2 - start2;
                const p2 = Math.min(1, el2 / dur2);
                setStrokeProgress(p2);

                if (pathRef.current) {
                  try {
                    const l2 = pathRef.current.getTotalLength();
                    const pt2 = pathRef.current.getPointAtLength(l2 * p2);
                    setDemoHandPos({ target: 'svg', x: pt2.x, y: pt2.y, pressing: true, itemIdx: 0 });
                  } catch {
                    // Ignore
                  }
                }

                if (p2 < 1) {
                  demoAnimRef.current = requestAnimationFrame(anim2);
                } else {
                  setCompletedStrokes([0, 1]);
                  playSuccessChord();
                  startCountingDemo();
                }
              };

              demoAnimRef.current = requestAnimationFrame(anim2);
            }, 300);

            demoTimersRef.current.push(tNext);
          } else {
            playSuccessChord();
            startCountingDemo();
          }
        }
      };

      demoAnimRef.current = requestAnimationFrame(animateTrace);
    }, 600);

    demoTimersRef.current.push(t1);

    // Sub-routine: Count objects demo (demonstrates repeat & count)
    const startCountingDemo = () => {
      const tCountStart = setTimeout(() => {
        setStage('ECHO_COUNT');
        stageRef.current = 'ECHO_COUNT';
        setEchoStep(1);
        echoStepRef.current = 1;
        setEchoSubState('ANNOUNCING_NUM');
        echoSubStateRef.current = 'ANNOUNCING_NUM';

        // Step 0: First say the target number itself
        speakNumber(selectedNum);
        playTone(440, 'triangle', 0.25, 0.2);

        const tBeginCount = setTimeout(() => {
          let c = 1;
          const totalItems = selectedNum;

          const countNextItem = () => {
            if (c <= totalItems) {
              setEchoStep(c);
              echoStepRef.current = c;
              setEchoSubState('APP_SPEAKING');
              echoSubStateRef.current = 'APP_SPEAKING';
              speakNumber(c);

              const tHandTap = setTimeout(() => {
                setEchoSubState('WAITING_KID');
                echoSubStateRef.current = 'WAITING_KID';
                setDemoHandPos({ target: 'item', x: 0, y: 0, pressing: true, itemIdx: c });
                playChime(c);

                const tItemRelease = setTimeout(() => {
                  setDemoHandPos(prev => ({ ...prev, pressing: false }));
                  c++;
                  const tNextDelay = setTimeout(countNextItem, 450);
                  demoTimersRef.current.push(tNextDelay);
                }, 350);

                demoTimersRef.current.push(tItemRelease);
              }, 400);

              demoTimersRef.current.push(tHandTap);
            } else {
              // Demo finished! Reset to interactive play mode
              const tFinish = setTimeout(() => {
                stopDemo();
                selectNumber(selectedNum);
              }, 800);
              demoTimersRef.current.push(tFinish);
            }
          };

          countNextItem();
        }, 900);

        demoTimersRef.current.push(tBeginCount);
      }, 500);

      demoTimersRef.current.push(tCountStart);
    };
  }, [config.strokes, selectedNum, clearDemoTimers, playChime, playTone, playSuccessChord, speakNumber, stopDemo]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearDemoTimers();
      if (speechRecRef.current) {
        try { speechRecRef.current.abort(); } catch { /* ignore */ }
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [clearDemoTimers]);

  return (
    <div className="tenali-learn-trace-container">
      {/* Top Number Selector Ribbon with Demo Button */}
      <header className="trace-top-bar">
        <div className="trace-number-ribbon">
          {NUMBERS_INFO.map((item) => {
            const isSelected = item.num === selectedNum;
            const isDone = completedNumbers.has(item.num);
            return (
              <button
                key={item.num}
                type="button"
                className={`trace-number-chip ${isSelected ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                onClick={() => selectNumber(item.num)}
              >
                <span className="chip-digit">{item.num}</span>
                {isDone && <span className="chip-badge">⭐</span>}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={`trace-demo-btn ${demoActive ? 'is-active' : ''}`}
          onClick={demoActive ? stopDemo : startDemo}
          title="Watch how to trace and count"
        >
          <span>{demoActive ? '⏹️ Stop Demo' : '🎬 Watch Demo'}</span>
        </button>
      </header>

      {/* Main Interactive Learning Workspace (2-Column) */}
      <div className="trace-card-grid">
        {/* Left Column: Hollow Cartoon Numeral & Guided Tracing Track */}
        <div className="trace-canvas-panel">
          <div className="trace-panel-header">
            <span className={`number-name-badge ${stage === 'ECHO_COUNT' && echoSubState === 'ANNOUNCING_NUM' ? 'is-speaking' : ''}`}>
              Number {selectedNum}
            </span>
            <span className="stroke-progress-indicator">
              {stage === 'TRACING'
                ? `Stroke ${currentStrokeIdx + 1} of ${config.strokes.length}`
                : stage === 'ECHO_COUNT'
                ? '🗣️ Repeat after me'
                : stage === 'SOLO_COUNT'
                ? '🌟 Count on your own!'
                : '✓ Great Job!'}
            </span>
          </div>

          <div className="trace-svg-board-box">
            <svg
              ref={svgRef}
              viewBox="0 0 300 300"
              className="trace-svg-board"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <defs>
                <filter id="green-radar-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="trace-fill-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>

              {/* 1. Hollow Outer Cartoon Numeral Tube Background */}
              {config.strokes.map((s) => (
                <path
                  key={`bg-${s.id}`}
                  d={s.path}
                  fill="none"
                  stroke="#1e1b4b"
                  strokeWidth="48"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* 2. Hollow Inner Cartoon Border */}
              {config.strokes.map((s) => (
                <path
                  key={`border-${s.id}`}
                  d={s.path}
                  fill="none"
                  stroke="#4338ca"
                  strokeWidth="38"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* 3. Completed / Active Stroke Fill */}
              {config.strokes.map((s, idx) => {
                const isFinished = completedStrokes.includes(idx);
                const isCurrent = idx === currentStrokeIdx && stage === 'TRACING';
                if (!isFinished && !isCurrent) return null;

                return (
                  <path
                    key={`fill-${s.id}`}
                    d={s.path}
                    fill="none"
                    stroke="url(#trace-fill-grad)"
                    strokeWidth="28"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={isFinished ? 1 : 0.95}
                  />
                );
              })}

              {/* 4. Active Stroke Reference for pathLength measurement */}
              <path
                ref={pathRef}
                d={activeStroke.path}
                fill="none"
                stroke="transparent"
                strokeWidth="1"
              />

              {/* 5. Inner Dashed Guidance Track */}
              {config.strokes.map((s, idx) => (
                <path
                  key={`dash-${s.id}`}
                  d={s.path}
                  fill="none"
                  stroke="#fde047"
                  strokeWidth="3.5"
                  strokeDasharray="8 8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={completedStrokes.includes(idx) ? 0.3 : 0.9}
                />
              ))}

              {/* 6. Glowing Green Start Dot / Slider at Starting Point */}
              {stage === 'TRACING' && (
                <g
                  transform={`translate(${dotPos.x}, ${dotPos.y})`}
                  onPointerDown={handlePointerDown}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                  className="trace-interactive-dot-group"
                >
                  <circle
                    r="24"
                    fill="none"
                    stroke="#a3e635"
                    strokeWidth="2"
                    opacity="0.75"
                    className="trace-radar-halo"
                  />
                  <circle
                    r="15"
                    fill="#84cc16"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    filter="url(#green-radar-glow)"
                  />
                  <circle r="5" fill="#fef08a" />
                </g>
              )}
            </svg>

            {/* Hand Cursor during Tracing Demo */}
            {demoActive && demoHandPos.target === 'svg' && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(demoHandPos.x / 300) * 100}%`,
                  top: `${(demoHandPos.y / 300) * 100}%`,
                  pointerEvents: 'none'
                }}
              >
                <ClickHandCursor isPressed={demoHandPos.pressing} isContinuous={false} />
              </div>
            )}

            {/* Continuous Hand Tap Hint on initial idle */}
            {!demoActive && stage === 'TRACING' && strokeProgress === 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: `${(dotPos.x / 300) * 100}%`,
                  top: `${(dotPos.y / 300) * 100}%`,
                  pointerEvents: 'none'
                }}
              >
                <ClickHandCursor isPressed={false} isContinuous={true} />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Object Count & Minimal Interaction Studio */}
        <div className="trace-counter-panel">
          <div className="counter-panel-header">
            <h3>{selectedNum} {config.objectName}s</h3>
            {stage === 'ECHO_COUNT' && (
              <div className="voice-mic-indicator app-count-mode">
                <span className="voice-mic-dot active" />
                <span>
                  {echoSubState === 'ANNOUNCING_NUM'
                    ? `🔊 Number ${selectedNum}`
                    : echoSubState === 'APP_SPEAKING'
                    ? `🔊 Listen: "${NUMBER_WORDS[echoStep]}"`
                    : `🎤 Repeat: "${NUMBER_WORDS[echoStep]}"`}
                </span>
              </div>
            )}
            {stage === 'SOLO_COUNT' && (
              <div className={`voice-mic-indicator ${wrongAttemptFlash ? 'wrong-count-mode' : 'kid-count-mode'}`}>
                <span className={`voice-mic-dot ${micActive ? 'active' : ''}`} />
                <span>
                  {wrongAttemptFlash
                    ? `🔄 Try again from 1`
                    : heardWord
                    ? `"${heardWord}"`
                    : `🎤 Count on your own: ${soloCountStep} / ${selectedNum}`}
                </span>
              </div>
            )}
          </div>

          {/* Concrete Objects Display (e.g. 4 Apples) */}
          <div className={`trace-objects-grid ${wrongAttemptFlash ? 'is-wrong' : ''}`}>
            {Array.from({ length: selectedNum }).map((_, idx) => {
              const itemNum = idx + 1;
              let isLit = false;
              let isTarget = false;

              if (stage === 'ECHO_COUNT') {
                isLit = itemNum < echoStep;
                isTarget = itemNum === echoStep;
              } else if (stage === 'SOLO_COUNT') {
                isLit = itemNum < soloCountStep;
                isTarget = itemNum === soloCountStep;
              } else if (stage === 'COMPLETED') {
                isLit = true;
              }

              return (
                <div
                  key={`obj-${itemNum}`}
                  className={`trace-item-bubble ${isLit ? 'is-lit' : ''} ${isTarget ? 'is-target' : ''}`}
                  onClick={() => handleObjectTap(itemNum)}
                  style={{
                    cursor: (stage === 'ECHO_COUNT' || stage === 'SOLO_COUNT') ? 'pointer' : 'default',
                    position: 'relative'
                  }}
                >
                  <span className="object-emoji-render">{config.objectEmoji}</span>
                  <span className="object-num-tag">{itemNum}</span>

                  {/* Hand Cursor during Counting Demo */}
                  {demoActive && demoHandPos.target === 'item' && demoHandPos.itemIdx === itemNum && (
                    <div style={{ position: 'absolute', top: '10px', left: '14px', pointerEvents: 'none' }}>
                      <ClickHandCursor isPressed={demoHandPos.pressing} isContinuous={false} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Minimal Controls */}
          <div className="trace-actions-bar">
            {stage === 'COMPLETED' ? (
              <button
                type="button"
                className="trace-btn-primary"
                onClick={() => selectNumber(selectedNum < 10 ? selectedNum + 1 : 1)}
              >
                Next ➡️
              </button>
            ) : (
              <button
                type="button"
                className="trace-btn-restart"
                onClick={() => selectNumber(selectedNum)}
              >
                🔄 Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
