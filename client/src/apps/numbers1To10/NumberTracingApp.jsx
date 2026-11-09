import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { fireConfetti } from './confettiHelper.js';
import { NUMBERS_INFO } from './numbers1To10Data.js';
import { useWhisperVoice, PushToTalkButton } from './index.js';

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
  1:  /\b(1|one|won|wan|van|when|run|first|ek|ondru|onnu|onru|un|uno|bun|fun|done)\b/i,
  2:  /\b(2|two|to|too|tu|do|doo|second|rendu|erandu|irandu|dos)\b/i,
  3:  /\b(3|three|tree|free|thee|tri|third|teen|tin|moonu|moondru|tres)\b/i,
  4:  /\b(4|four|for|fore|far|ford|fourth|char|chaar|naalu|naangu|cuatro)\b/i,
  5:  /\b(5|five|faiv|fai|fiv|fifth|panch|paanch|anju|aindhu|ainthu|cinco|bye|buy)\b/i,
  6:  /\b(6|six|siks|sex|sick|sixth|chhe|che|chha|aaru|seis)\b/i,
  7:  /\b(7|seven|sevn|sevan|seventh|saat|sat|yezhu|ezhu|siete)\b/i,
  8:  /\b(8|eight|ate|ait|eat|eighth|aath|ath|ettu|ocho)\b/i,
  9:  /\b(9|nine|nain|nin|night|ninth|nau|no|ombodhu|onpathu|onbathu|nueve)\b/i,
  10: /\b(10|ten|tan|tin|den|tenth|das|dus|pathu|patthu|diez|dead)\b/i
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
  const [litCount, setLitCount] = useState(0);
  const [isTraceGreenGlow, setIsTraceGreenGlow] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  // Demo animation state
  const [demoActive, setDemoActive] = useState(false);
  const [demoHandPos, setDemoHandPos] = useState({ target: 'none', x: 0, y: 0, pressing: false, itemIdx: 0 });
  const demoTimersRef = useRef([]);
  const demoAnimRef = useRef(null);

  // Refs for zero-latency, closure-safe callbacks
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const audioCtxRef = useRef(null);
  const stageRef = useRef('TRACING');
  const selectedNumRef = useRef(selectedNum);
  const echoStepRef = useRef(1);
  const echoSubStateRef = useRef('ANNOUNCING_NUM');
  const soloCountStepRef = useRef(1);
  const lastMatchTimeRef = useRef(0);
  const onChildEchoedRef = useRef(null);
  const handleSoloCountAttemptRef = useRef(null);
  const whisperVoiceRef = useRef(null);
  const strokeDoneRef = useRef(false);
  const isDraggingRef = useRef(false);

  // Pre-load and warm up browser SpeechSynthesis voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices();
        const onVoices = () => {
          try { window.speechSynthesis.getVoices(); } catch {}
        };
        window.speechSynthesis.onvoiceschanged = onVoices;
        return () => {
          window.speechSynthesis.onvoiceschanged = null;
        };
      } catch {}
    }
  }, []);

  // Keep refs in sync with state
  useEffect(() => {
    selectedNumRef.current = selectedNum;
  }, [selectedNum]);

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

  // Spoken voice command for kids: clear, enthusiastic, auto-coordinates with microphone
  const speakVoiceCommand = useCallback((phrase, onEnd) => {
    if (typeof window === 'undefined') {
      if (onEnd) onEnd();
      return;
    }

    // Audible ear-con chime so the user always has instant auditory response
    try {
      playTone(587.33, 'triangle', 0.14, 0.16);
    } catch {}

    if (!('speechSynthesis' in window)) {
      if (onEnd) setTimeout(onEnd, 350);
      return;
    }

    try {
      // 1. Temporarily pause mic so it does not hear the computer's voice
      if (whisperVoiceRef.current && whisperVoiceRef.current.isRecording) {
        try { whisperVoiceRef.current.stopRecording(); } catch (e) {}
      }

      // Resume if paused
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.cancel();

      // Delay by 40ms to let Chrome's cancel queue flush cleanly
      const tSpeak = setTimeout(() => {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }

          const u = new SpeechSynthesisUtterance(phrase);
          u.rate = 1.0;
          u.pitch = 1.0; // Standard pitch to prevent SAPI5 failure on Windows
          u.lang = 'en-US';

          // Assign voice if available
          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            const enVoice = voices.find(v => v.lang === 'en-US' || v.lang === 'en-IN' || v.lang.startsWith('en')) || voices[0];
            if (enVoice) {
              u.voice = enVoice;
            }
          }

          // Anchor to window so V8 GC does not collect mid-speech
          if (!window.__activeUtterances) window.__activeUtterances = [];
          window.__activeUtterances.push(u);

          let finished = false;
          const cleanUp = () => {
            if (finished) return;
            finished = true;
            if (window.__activeUtterances) {
              window.__activeUtterances = window.__activeUtterances.filter(item => item !== u);
            }
            if (onEnd) onEnd();
          };

          u.onend = cleanUp;
          u.onerror = (e) => {
            console.warn('[speechSynthesis] utterance error:', e);
            cleanUp();
          };

          window.speechSynthesis.speak(u);
          window.speechSynthesis.resume();

          // Safety fallback timer
          const durationEst = Math.max(1200, phrase.length * 95);
          const safetyTimer = setTimeout(cleanUp, durationEst);
          demoTimersRef.current.push(safetyTimer);
        } catch (innerErr) {
          console.warn('[speechSynthesis] inner speak error:', innerErr);
          if (onEnd) onEnd();
        }
      }, 40);

      demoTimersRef.current.push(tSpeak);
    } catch (err) {
      console.warn('[speechSynthesis] outer speak error:', err);
      if (onEnd) onEnd();
    }
  }, [playTone]);

  const speakNumber = useCallback((num) => {
    const word = NUMBER_WORDS[num] || String(num);
    speakVoiceCommand(word);
  }, [speakVoiceCommand]);

  // Compute live dot coordinates along the SVG path based on progress
  const [dotPos, setDotPos] = useState(() => {
    const start = (activeStroke && activeStroke.start) || [150, 55];
    return { x: start[0], y: start[1] };
  });

  useEffect(() => {
    if (pathRef.current) {
      try {
        const totalLen = pathRef.current.getTotalLength();
        if (totalLen && !isNaN(totalLen)) {
          const pt = pathRef.current.getPointAtLength(totalLen * strokeProgress);
          if (pt && !isNaN(pt.x) && !isNaN(pt.y)) {
            setDotPos({ x: pt.x, y: pt.y });
            return;
          }
        }
      } catch {
        // Fallback
      }
    }
    const start = (activeStroke && activeStroke.start) || [150, 55];
    setDotPos({ x: start[0], y: start[1] });
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
    setIsTraceGreenGlow(false);
    setDemoHandPos({ target: 'none', x: 0, y: 0, pressing: false, itemIdx: 0 });
  }, [clearDemoTimers]);

  // Switch/Reset Number
  const selectNumber = useCallback((n) => {
    clearDemoTimers();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    strokeDoneRef.current = false;
    isDraggingRef.current = false;
    setSelectedNum(n);
    selectedNumRef.current = n;
    setStage('TRACING');
    stageRef.current = 'TRACING';
    setIsTraceGreenGlow(false);
    setCurrentStrokeIdx(0);
    setStrokeProgress(0);
    setCompletedStrokes([]);
    setEchoStep(1);
    echoStepRef.current = 1;
    setEchoSubState('ANNOUNCING_NUM');
    echoSubStateRef.current = 'ANNOUNCING_NUM';
    setSoloCountStep(1);
    soloCountStepRef.current = 1;
    setLitCount(0);
    setWrongAttemptFlash(false);
    setHeardWord('');
    setSuccessBanner('');
    const word = NUMBER_WORDS[n] || String(n);
    speakVoiceCommand(`Let's trace Number ${word}!`);
  }, [clearDemoTimers, speakVoiceCommand]);

  // Handle correct number: Count objects with glowing green & chimes, burst confetti, and auto-advance!
  const handleVoiceSuccess = useCallback((targetNum) => {
    clearDemoTimers();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setSelectedNum(targetNum);
    setLitCount(0);
    const word = NUMBER_WORDS[targetNum] || String(targetNum);
    setSuccessBanner(`🎉 Correct! That's ${word} (${targetNum})! ⭐`);
    setCompletedNumbers((prev) => new Set([...prev, targetNum]));

    getAudioCtx();

    // Sequentially count each object from 1 to targetNum with bright green glow and audio!
    for (let i = 1; i <= targetNum; i++) {
      const timer = setTimeout(() => {
        setLitCount(i);
        playChime(i);
        speakNumber(i);

        // When all objects have been counted with green glow:
        if (i === targetNum) {
          const celebrTimer = setTimeout(() => {
            playSuccessChord();
            // Burst massive celebration confetti!
            fireConfetti({
              particleCount: 100 + targetNum * 10,
              spread: 90,
              origin: { y: 0.6 }
            });

            if (typeof onAwardStars === 'function') {
              onAwardStars(2);
            }

            // Auto-advance to the next number after celebration
            const advanceTimer = setTimeout(() => {
              setSuccessBanner('');
              if (targetNum < 10) {
                selectNumber(targetNum + 1);
              } else {
                setStage('COMPLETED');
                stageRef.current = 'COMPLETED';
                if (typeof markTopicCompleted === 'function') {
                  markTopicCompleted('numbers-1-to-10');
                }
                if (typeof onNavigateMaze === 'function') {
                  onNavigateMaze();
                }
              }
            }, 1800);
            demoTimersRef.current.push(advanceTimer);
          }, 450);
          demoTimersRef.current.push(celebrTimer);
        }
      }, i * 650);
      demoTimersRef.current.push(timer);
    }
  }, [clearDemoTimers, speakNumber, getAudioCtx, playChime, playSuccessChord, selectNumber, onAwardStars, markTopicCompleted, onNavigateMaze]);

  // Finish counting: Confetti, stars, celebration banner, seamlessly transition to next number!
  const finishCountingAndAdvance = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const currentNum = selectedNumRef.current;
    setStage('COMPLETED');
    stageRef.current = 'COMPLETED';
    setLitCount(currentNum);

    const word = NUMBER_WORDS[currentNum] || String(currentNum);
    setSuccessBanner(`🎉 Super! You counted all ${currentNum} ${config.objectName}s! ⭐`);

    playSuccessChord();
    fireConfetti({
      particleCount: 110 + currentNum * 10,
      spread: 90,
      origin: { y: 0.6 }
    });

    setCompletedNumbers((prev) => new Set([...prev, currentNum]));

    if (typeof onAwardStars === 'function') {
      onAwardStars(2);
    }

    // Voice command after counting!
    speakVoiceCommand(`Super! You counted all ${word} ${config.objectName}s!`);

    // Auto-advance seamlessly to the next number!
    const t = setTimeout(() => {
      setSuccessBanner('');
      if (currentNum < 10) {
        selectNumber(currentNum + 1);
      } else {
        if (typeof markTopicCompleted === 'function') {
          markTopicCompleted('numbers-1-to-10');
        }
        if (typeof onNavigateMaze === 'function') {
          onNavigateMaze();
        }
      }
    }, 1800);

    demoTimersRef.current.push(t);
  }, [config.objectName, playSuccessChord, onAwardStars, markTopicCompleted, onNavigateMaze, selectNumber, speakVoiceCommand]);

  // Handle Solo Counting Attempt (Child counts on their own 1..N; gentle reset on miscount with no penalty)
  const handleSoloCountAttempt = useCallback((spokenNum) => {
    const target = soloCountStepRef.current;
    if (spokenNum === target) {
      // Correct number in solo sequence!
      playChime(target);
      setLitCount(target); // Lights up object in green with checkmark badge

      if (target < selectedNum) {
        const nextTarget = target + 1;
        soloCountStepRef.current = nextTarget;
        setSoloCountStep(nextTarget);
      } else {
        // Child completed counting the number on their own!
        finishCountingAndAdvance();
      }
    } else {
      // Miscounted: No penalty! Gentle sound plays, reset only this number to 1 to try again with confidence
      playWrongTone();
      soloCountStepRef.current = 1;
      setSoloCountStep(1);
      setLitCount(0);
      setWrongAttemptFlash(true);
      const tFlash = setTimeout(() => setWrongAttemptFlash(false), 900);
      demoTimersRef.current.push(tFlash);
    }
  }, [selectedNum, playChime, playWrongTone, finishCountingAndAdvance]);

  // Sync ref
  useEffect(() => {
    handleSoloCountAttemptRef.current = handleSoloCountAttempt;
  }, [handleSoloCountAttempt]);

  // Transition to Step 3: Solo Count Stage (Child counts on their own 1..N)
  const startSoloCountStage = useCallback(() => {
    setStage('SOLO_COUNT');
    stageRef.current = 'SOLO_COUNT';
    setSoloCountStep(1);
    soloCountStepRef.current = 1;
    setLitCount(0);
    setWrongAttemptFlash(false);
    setHeardWord('');
    lastMatchTimeRef.current = Date.now();
    playSuccessChord();
  }, [playSuccessChord]);

  // Trigger one step in Echo Count (voice speaks cleanly, waits for child repeat)
  const triggerEchoStep = useCallback((step) => {
    setEchoStep(step);
    echoStepRef.current = step;
    setEchoSubState('APP_SPEAKING');
    echoSubStateRef.current = 'APP_SPEAKING';
    // Do NOT setLitCount here! Item 1 should not turn green or get a tick until child repeats it!

    speakNumber(step);
    playChime(step);

    const tWait = setTimeout(() => {
      setEchoSubState('WAITING_KID');
      echoSubStateRef.current = 'WAITING_KID';
      lastMatchTimeRef.current = Date.now();
    }, 650);

    demoTimersRef.current.push(tWait);
  }, [speakNumber, playChime]);

  // When child counts a step via mic or tap
  const onChildEchoed = useCallback((spokenNum) => {
    const currentStep = echoStepRef.current;
    const currentTarget = selectedNumRef.current;
    if (spokenNum !== currentStep) return;

    playChime(currentStep);
    // CHILD SPOKE IT! Object turns glowing green with checkmark!
    setLitCount(currentStep);

    if (currentStep < currentTarget) {
      const nextStep = currentStep + 1;
      // Next object starts glowing immediately!
      setEchoStep(nextStep);
      echoStepRef.current = nextStep;
      setEchoSubState('WAITING_KID');
      echoSubStateRef.current = 'WAITING_KID';
      setSuccessBanner(`✓ "${NUMBER_WORDS[currentStep]}"! Now say "${NUMBER_WORDS[nextStep]}"! 🎙️`);

      const tNext = setTimeout(() => {
        speakVoiceCommand(`Say ${NUMBER_WORDS[nextStep]}!`, () => {
          if (whisperVoiceRef.current && !whisperVoiceRef.current.isRecording && stageRef.current === 'ECHO_COUNT') {
            whisperVoiceRef.current.startRecording();
          }
        });
        playTone(520, 'sine', 0.12, 0.15);
      }, 350);
      demoTimersRef.current.push(tNext);
    } else {
      // Child successfully counted all objects! All objects glow green!
      setSuccessBanner(`🎉 Perfect! Counted all ${currentTarget} ${config.objectName}s! ⭐`);
      const tFinish = setTimeout(() => {
        finishCountingAndAdvance();
      }, 700);
      demoTimersRef.current.push(tFinish);
    }
  }, [config.objectName, playChime, speakVoiceCommand, playTone, finishCountingAndAdvance]);

  // Sync ref
  useEffect(() => {
    onChildEchoedRef.current = onChildEchoed;
  }, [onChildEchoed]);

  // Step 2: Count Objects one by one (First object glows immediately!)
  const startEchoCountStage = useCallback(() => {
    setStage('ECHO_COUNT');
    stageRef.current = 'ECHO_COUNT';
    setEchoStep(1);
    echoStepRef.current = 1;
    setEchoSubState('WAITING_KID');
    echoSubStateRef.current = 'WAITING_KID';
    setLitCount(0); // Count starts at 0! Object 1 is NOT green yet; it is glowing as the target!
    setHeardWord('');
    setSuccessBanner(`🔢 Say "One"! 🎙️`);

    playTone(520, 'sine', 0.15, 0.18);
    speakVoiceCommand(`Now count the ${config.objectName}s! Say One!`, () => {
      if (whisperVoiceRef.current && !whisperVoiceRef.current.isRecording && stageRef.current === 'ECHO_COUNT') {
        whisperVoiceRef.current.startRecording();
      }
    });
  }, [config.objectName, speakVoiceCommand, playTone]);

  // Step 1 Complete: Numeral Voice Recognition Celebration & Start Counting!
  // Triggered ONLY after the child SAYS the right number!
  const triggerNumeralVoiceSuccess = useCallback(() => {
    clearDemoTimers();
    setIsTraceGreenGlow(true);
    setCompletedStrokes(config.strokes.map((_, i) => i));
    setStrokeProgress(1);

    const currentNum = selectedNumRef.current;

    // Immediately start object counting so the FIRST OBJECT GLOWS RIGHT AWAY!
    setStage('ECHO_COUNT');
    stageRef.current = 'ECHO_COUNT';
    setEchoStep(1);
    echoStepRef.current = 1;
    setEchoSubState('WAITING_KID');
    echoSubStateRef.current = 'WAITING_KID';
    setLitCount(0); // Object 1 is NOT green yet; it is glowing as the active target!
    setSuccessBanner(`🔢 Count: Say "One"! 🎙️`);

    playSuccessChord();
    fireConfetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.6 }
    });

    // Voice command: instruct to count the objects!
    speakVoiceCommand(`Correct! Now count the ${config.objectName}s! Say One!`, () => {
      // Automatically open mic for counting step 1!
      if (whisperVoiceRef.current && !whisperVoiceRef.current.isRecording && stageRef.current === 'ECHO_COUNT') {
        whisperVoiceRef.current.startRecording();
      }
    });
  }, [config.strokes, config.objectName, playSuccessChord, speakVoiceCommand, clearDemoTimers]);

  // Unified voice recognition handler powered by useWhisperVoice hook
  const handleVoiceNumber = useCallback((detectedNum, cleanText, rawText) => {
    if (rawText) setHeardWord(rawText);
    const now = Date.now();
    if (now - lastMatchTimeRef.current < 280) return;

    if (detectedNum >= 1 && detectedNum <= 10) {
      lastMatchTimeRef.current = now;

      if (stageRef.current === 'ECHO_COUNT') {
        const expected = echoStepRef.current;
        if (detectedNum === expected) {
          echoSubStateRef.current = 'APP_SPEAKING';
          setLitCount(detectedNum);
          if (onChildEchoedRef.current) {
            onChildEchoedRef.current(detectedNum);
          }
        }
      } else if (stageRef.current === 'SOLO_COUNT') {
        if (handleSoloCountAttemptRef.current) {
          handleSoloCountAttemptRef.current(detectedNum);
        }
      } else if (stageRef.current === 'TRACING') {
        // Child spoke the number: trigger green numeral trace glow, confetti, & object counting!
        if (detectedNum === selectedNumRef.current) {
          triggerNumeralVoiceSuccess();
        }
      }
    }
  }, [triggerNumeralVoiceSuccess]);

  const whisperVoice = useWhisperVoice({
    onNumberDetected: (num, rawText) => {
      handleVoiceNumber(num, String(num), rawText);
    },
    onTextHeard: (t) => {
      if (t) setHeardWord(t);
    }
  });
  whisperVoiceRef.current = whisperVoice;

  // User Pointer Dragging along Path
  const handlePointerDown = (e) => {
    if (demoActive) stopDemo();
    if (stage !== 'TRACING' || strokeDoneRef.current) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
    getAudioCtx();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    playTone(480, 'sine', 0.08, 0.12);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !svgRef.current || !pathRef.current || stage !== 'TRACING' || strokeDoneRef.current) return;

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
        if (strokeDoneRef.current) return;
        isDraggingRef.current = false;
        setIsDragging(false);
        setStrokeProgress(1);
        playChime(currentStrokeIdx + 1);

        const newCompleted = [...completedStrokes, currentStrokeIdx];
        setCompletedStrokes(newCompleted);

        if (newCompleted.length >= config.strokes.length) {
          // Tracing completed! Do NOT show confetti or green glow yet (those show when saying the number)
          strokeDoneRef.current = true;
          setCompletedStrokes(newCompleted);
          setStrokeProgress(1);
          playChime(config.strokes.length);
          const currentNum = selectedNumRef.current;
          const word = NUMBER_WORDS[currentNum] || String(currentNum);
          setSuccessBanner(`🎙️ Say "${word}"!`);

          // Voice command after tracing!
          speakVoiceCommand(`Great! Now say ${word}!`, () => {
            if (whisperVoiceRef.current && !whisperVoiceRef.current.isRecording && stageRef.current === 'TRACING') {
              whisperVoiceRef.current.startRecording();
            }
          });
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
    isDraggingRef.current = false;
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
      if (itemIdx === echoStepRef.current) {
        echoSubStateRef.current = 'APP_SPEAKING';
        if (onChildEchoedRef.current) {
          onChildEchoedRef.current(itemIdx);
        }
      } else {
        playTone(320, 'sine', 0.1, 0.1);
      }
    } else if (stage === 'SOLO_COUNT') {
      if (handleSoloCountAttemptRef.current) {
        handleSoloCountAttemptRef.current(itemIdx);
      }
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
      if (whisperVoice.isRecording) {
        whisperVoice.stopRecording();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [clearDemoTimers, whisperVoice]);

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

      {/* Push-to-Talk Whisper Neural Speech HUD */}
      <div className="voice-universal-hud" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '10px 16px',
        margin: '8px 0 14px 0',
        borderRadius: '14px',
        background: 'rgba(30, 41, 59, 0.75)',
        border: '1px solid rgba(148, 163, 184, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <PushToTalkButton
            whisperState={whisperVoice}
            label={
              stage === 'ECHO_COUNT'
                ? `Click to Speak "${NUMBER_WORDS[echoStep]}" (${echoStep}/${selectedNum})`
                : stage === 'SOLO_COUNT'
                ? `Click to Count "${NUMBER_WORDS[soloCountStep]}" (${soloCountStep}/${selectedNum})`
                : `Click to Speak "${NUMBER_WORDS[selectedNum]}"`
            }
          />

          <span
            className={`whisper-live-badge ${whisperVoice.serverOnline ? 'server-online' : ''}`}
            title="In-browser Whisper AI neural recognition active"
            style={whisperVoice.serverOnline ? { borderColor: '#10b981', color: '#6ee7b7' } : undefined}
          >
            {whisperVoice.serverOnline ? '🟢 Whisper Indian Digits Active' : '✨ Whisper Indian Digits AI'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          {heardWord ? (
            <span style={{ color: '#fde047', fontWeight: 600 }}>
              🗣️ Heard: <em>"{heardWord}"</em> ⭐
            </span>
          ) : (
            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
              {stage === 'TRACING'
                ? (completedStrokes.length >= config.strokes.length
                    ? `✍️ Tracing done! Click mic to say "${NUMBER_WORDS[selectedNum]}"!`
                    : '💡 Trace numeral along arrows, or click mic to speak!')
                : stage === 'ECHO_COUNT'
                ? `💡 Say "${NUMBER_WORDS[echoStep]}" to count the glowing object! (${echoStep}/${selectedNum})`
                : `💡 Count on your own: ${soloCountStep} / ${selectedNum} (no penalty on stumble!)`}
            </span>
          )}
        </div>
      </div>

      {/* Celebration Success Banner */}
      {successBanner && (
        <div
          className="trace-success-banner"
          style={{
            background: 'linear-gradient(135deg, #15803d 0%, #16a34a 50%, #22c55e 100%)',
            color: '#ffffff',
            padding: '14px 24px',
            borderRadius: '16px',
            textAlign: 'center',
            fontSize: '1.35rem',
            fontWeight: 800,
            marginBottom: '16px',
            boxShadow: '0 0 25px rgba(34, 197, 94, 0.7), inset 0 0 10px rgba(255, 255, 255, 0.4)',
            border: '2px solid #86efac',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <span style={{ fontSize: '1.6rem' }}>🎉</span>
          <span>{successBanner}</span>
          <span style={{ fontSize: '1.6rem' }}>⭐</span>
        </div>
      )}

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
                ? (completedStrokes.length >= config.strokes.length
                    ? `1️⃣ 🎙️ Now Click Mic to Say "${NUMBER_WORDS[selectedNum]}"`
                    : `1️⃣ Trace Stroke ${currentStrokeIdx + 1} of ${config.strokes.length}`)
                : stage === 'ECHO_COUNT'
                ? `2️⃣ 🗣️ Repeat: "${NUMBER_WORDS[echoStep]}"`
                : stage === 'SOLO_COUNT'
                ? `3️⃣ 🌟 Solo Count (${soloCountStep}/${selectedNum})`
                : '✓ Great Job!'}
            </span>
          </div>

          <div className={`trace-svg-board-box ${isTraceGreenGlow ? 'is-green-glow' : ''}`}>
            <svg
              ref={svgRef}
              viewBox="0 0 300 300"
              className={`trace-svg-board ${isTraceGreenGlow ? 'is-green-glow' : ''}`}
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
                <linearGradient id="trace-success-green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#86efac" />
                  <stop offset="50%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
                <filter id="numeral-super-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <marker
                  id="guide-arrow-marker"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="4"
                  markerHeight="4"
                  orient="auto"
                >
                  <path d="M 0 2 L 7 5 L 0 8 z" fill="#fde047" />
                </marker>
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
                  stroke={isTraceGreenGlow ? "#15803d" : "#4338ca"}
                  strokeWidth="38"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* 3. Completed / Active Stroke Fill */}
              {config.strokes.map((s, idx) => {
                const isFinished = completedStrokes.includes(idx) || isTraceGreenGlow;
                const isCurrent = idx === currentStrokeIdx && stage === 'TRACING';
                if (!isFinished && !isCurrent) return null;

                return (
                  <path
                    key={`fill-${s.id}`}
                    d={s.path}
                    fill="none"
                    stroke={isTraceGreenGlow ? "url(#trace-success-green-grad)" : "url(#trace-fill-grad)"}
                    strokeWidth={isTraceGreenGlow ? "36" : "28"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={isTraceGreenGlow ? "url(#numeral-super-glow)" : undefined}
                    className={isTraceGreenGlow ? "trace-numeral-green-glow-pulse" : undefined}
                    opacity={1}
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

              {/* 5. Inner Dashed Guidance Track with Directional Guides */}
              {config.strokes.map((s, idx) => {
                const isActive = idx === currentStrokeIdx && stage === 'TRACING';
                return (
                  <path
                    key={`dash-${s.id}`}
                    d={s.path}
                    fill="none"
                    stroke={isActive ? '#fde047' : '#94a3b8'}
                    strokeWidth="3.5"
                    strokeDasharray="8 8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    markerMid={isActive ? 'url(#guide-arrow-marker)' : 'none'}
                    markerEnd={isActive ? 'url(#guide-arrow-marker)' : 'none'}
                    opacity={completedStrokes.includes(idx) ? 0.3 : 0.95}
                  />
                );
              })}

              {/* 6. Glowing Green Start Dot / Slider with Directional Hint */}
              {stage === 'TRACING' && completedStrokes.length < config.strokes.length && (
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
                  {strokeProgress === 0 && (
                    <text
                      x="0"
                      y="-22"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="900"
                      fill="#a3e635"
                      style={{ filter: 'drop-shadow(0 0 4px #000)' }}
                    >
                      START ⬇️
                    </text>
                  )}
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
            {!demoActive && stage === 'TRACING' && strokeProgress === 0 && completedStrokes.length < config.strokes.length && (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3>{selectedNum} {config.objectName}s</h3>
              <span className="whisper-live-badge" title="Neural Speech Recognition via Whisper AI">
                ✨ Whisper AI
              </span>
            </div>
            {stage === 'ECHO_COUNT' && (
              <div className="voice-mic-indicator app-count-mode">
                <span className="voice-mic-dot active" />
                <span>
                  {`🎤 Say: "${NUMBER_WORDS[echoStep]}" (${echoStep}/${selectedNum})`}
                </span>
              </div>
            )}
            {stage === 'SOLO_COUNT' && (
              <div className={`voice-mic-indicator ${wrongAttemptFlash ? 'wrong-count-mode' : 'kid-count-mode'}`}>
                <span className={`voice-mic-dot ${whisperVoice.isRecording ? 'active' : ''}`} />
                <span>
                  {wrongAttemptFlash
                    ? `🔄 Try again from 1`
                    : heardWord
                    ? `"${heardWord}"`
                    : `🎤 Hold button to count: ${soloCountStep} / ${selectedNum}`}
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
                isLit = itemNum <= litCount;
                isTarget = itemNum === echoStep && !isLit;
              } else if (stage === 'SOLO_COUNT') {
                isLit = itemNum <= litCount;
                isTarget = itemNum === soloCountStep && !isLit;
              } else if (stage === 'COMPLETED') {
                isLit = true;
              } else {
                isLit = false;
              }

              return (
                <div
                  key={`obj-${itemNum}`}
                  className={`trace-item-bubble ${isLit ? 'is-lit is-green-glow' : ''} ${isTarget ? 'is-target' : ''}`}
                  onClick={() => handleObjectTap(itemNum)}
                  style={{
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <span className="object-emoji-render">{config.objectEmoji}</span>
                  <span className="object-num-tag">{itemNum}</span>

                  {isLit && (
                    <span className="object-check-badge" style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: '#22c55e',
                      color: '#ffffff',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 10px #22c55e'
                    }}>
                      ✓
                    </span>
                  )}

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

export { NumberTracingApp };
