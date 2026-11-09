import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { fireConfetti } from './confettiHelper.js';
import { useWhisperVoice, PushToTalkButton } from './index.js';

/**
 * SpaceMazeAdventure — Tenali Star Station Explorer
 *
 * Features:
 * - Dynamic Jumbled Positions: Numbers (1 to N) are randomly shuffled across the maze docking stations for each game!
 * - Jumbled Orbiting Stars: Orbiting counting stars around the rocket are also jumbled in their orbital positions.
 * - Ultra-low-latency Voice Recognition (<100ms): Powered by native browser Web Speech API.
 * - Tactile Star Tapping: Tap the star or speak the number to advance.
 * - Shortest-path Rocket Flight: BFS pathfinding moves the rocket along the cosmic tubes.
 */

// Comprehensive multilingual & phonetic number regex dictionary
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

function checkTargetSpoken(text, targetNum) {
  if (!text || !NUMBER_PATTERNS[targetNum]) return false;
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  return NUMBER_PATTERNS[targetNum].test(clean);
}

function findAnySpokenNumber(text) {
  if (!text) return null;
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  for (let num = 1; num <= 10; num++) {
    if (NUMBER_PATTERNS[num].test(clean)) {
      return num;
    }
  }
  return null;
}

// Default sequential stations 1..N across nodes 1..N
// Station 1 is always next to the Start Pad, and Station N (or 10) is always next to Saturn!
function generateSequentialStations(n) {
  const stationToNode = {};
  const nodeToStation = {};
  for (let s = 1; s <= n; s++) {
    stationToNode[s] = s;
    nodeToStation[s] = s;
  }
  return { stationToNode, nodeToStation };
}

// Jumble layout: Keeps Station 1 at Node 1 (next to Start Pad) and Station N at Node N (next to Saturn)
function generateShuffledStations(n) {
  const stationToNode = { 1: 1 };
  const nodeToStation = { 1: 1 };

  if (n <= 2) {
    if (n === 2) {
      stationToNode[2] = 2;
      nodeToStation[2] = 2;
    }
    return { stationToNode, nodeToStation };
  }

  // Anchor N to Node N (next to Saturn)
  stationToNode[n] = n;
  nodeToStation[n] = n;

  // Shuffle middle stations 2..(n-1)
  const middleStations = [];
  for (let i = 2; i < n; i++) middleStations.push(i);

  for (let i = middleStations.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [middleStations[i], middleStations[j]] = [middleStations[j], middleStations[i]];
  }

  for (let idx = 0; idx < middleStations.length; idx++) {
    const s = middleStations[idx];
    const nodeId = idx + 2;
    stationToNode[s] = nodeId;
    nodeToStation[nodeId] = s;
  }

  return { stationToNode, nodeToStation };
}

// SVG Maze Node Coordinates
const ALL_NODES = [
  [35, 270],  // Launch base (Node 0)
  [105, 245], // St 1 (next to Start Pad)
  [65, 175],  // St 2
  [55, 95],   // St 3
  [65, 30],   // St 4
  [155, 60],  // St 5
  [210, 130], // St 6
  [155, 205], // St 7
  [235, 245], // St 8
  [320, 60],  // St 9
  [355, 180]  // St 10 (next to Saturn)
];

const ALL_EDGES = [
  [0, 1], // Start Pad (Node 0) to Pad 1 (Node 1)
  [1, 2], [1, 7], [1, 8],
  [2, 3], [2, 7],
  [3, 4], [3, 5],
  [4, 5],
  [5, 6], [5, 9],
  [6, 7], [6, 8], [6, 9], [6, 10],
  [7, 8],
  [8, 10],
  [9, 10]
];

function edgeKey(a, b) {
  return Math.min(a, b) + '-' + Math.max(a, b);
}

// Precompute control points and SVG path definitions for the tubes
const computedPaths = [];
const controlPoints = {};

ALL_EDGES.forEach((e, idx) => {
  const p0 = ALL_NODES[e[0]];
  const p1 = ALL_NODES[e[1]];
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const curveOffset = ((idx % 2 === 0) ? 1 : -1) * 14;
  const midX = (p0[0] + p1[0]) / 2 - (dy / dist) * curveOffset;
  const midY = (p0[1] + p1[1]) / 2 + (dx / dist) * curveOffset;
  const key = edgeKey(e[0], e[1]);
  controlPoints[key] = [midX, midY];
  const d = `M ${p0[0]} ${p0[1]} Q ${midX} ${midY} ${p1[0]} ${p1[1]}`;
  computedPaths.push({ id: key, from: e[0], to: e[1], d });
});

function getBezierPoint(a, b, t) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const cp = controlPoints[edgeKey(lo, hi)] || [
    (ALL_NODES[a][0] + ALL_NODES[b][0]) / 2,
    (ALL_NODES[a][1] + ALL_NODES[b][1]) / 2
  ];
  const p0 = ALL_NODES[a];
  const p1 = ALL_NODES[b];
  const u = 1 - t;
  const x = u * u * p0[0] + 2 * u * t * cp[0] + t * t * p1[0];
  const y = u * u * p0[1] + 2 * u * t * cp[1] + t * t * p1[1];
  return [x, y];
}

function findShortestPath(startNode, endNode, maxN) {
  if (startNode === endNode) return [startNode];
  const queue = [startNode];
  const visited = {};
  const parent = {};
  visited[startNode] = true;

  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr === endNode) break;

    for (let i = 0; i < ALL_EDGES.length; i++) {
      const edge = ALL_EDGES[i];
      if (edge[0] > maxN || edge[1] > maxN) continue;
      let next = -1;
      if (edge[0] === curr) next = edge[1];
      else if (edge[1] === curr) next = edge[0];

      if (next !== -1 && !visited[next]) {
        visited[next] = true;
        parent[next] = curr;
        queue.push(next);
      }
    }
  }

  const path = [endNode];
  while (path[0] !== startNode) {
    const p = parent[path[0]];
    if (p === undefined) return [startNode, endNode];
    path.unshift(p);
  }
  return path;
}

function getSaturnCoords(nodePos) {
  if (!nodePos) return { x: 395, y: 156 };
  const [nx, ny] = nodePos;
  // Position Saturn directly next to Pad 10 on the upper right
  return { x: Math.min(410, nx + 40), y: ny - 24 };
}

export default function SpaceMazeAdventure({
  onAwardStars,
  onTopicComplete,
  sfxTone
}) {
  // Game parameters & state
  const [stationCount, setStationCount] = useState(10); // N = 5 | 7 | 10

  // Default sequential layout of stations across nodes (Pad 1 next to Start Pad, Pad 10 next to Saturn)
  const [stationLayout, setStationLayout] = useState(() => generateSequentialStations(10));
  // Jumbled ordering of stars around the orbiting rocket (starts with 1 star at Station 1)
  const [starOrder, setStarOrder] = useState([1]);

  // Rocket starts parked on START PAD (Node 0)
  const [currentStationIdx, setCurrentStationIdx] = useState(0);
  const [expectedStation, setExpectedStation] = useState(1); // Current/next station number (1..N)
  const [currentCountingStep, setCurrentCountingStep] = useState(1);
  const [isCountingPhase, setIsCountingPhase] = useState(false); // Waiting to launch to Pad 1!
  const [isFlying, setIsFlying] = useState(false);

  // Initial rocket position on Start Pad (Node 0)
  const [rocketPos, setRocketPos] = useState({ x: ALL_NODES[0][0], y: ALL_NODES[0][1], angle: 0 });
  const [rocketStatus, setRocketStatus] = useState('⚡ Rocket Ready on Start Pad');

  // UI feedback banners
  const [banner, setBanner] = useState({
    text: '🚀 Rocket ready on Start Pad! Choose Pad 1 to launch!',
    type: 'normal'
  });
  const [countGuideText, setCountGuideText] = useState('Say or click: Pad 1 🚀');

  // Speech Recognition state
  const [heardWord, setHeardWord] = useState('Ready to launch...');

  // Victory celebration modal
  const [winModalOpen, setWinModalOpen] = useState(false);

  // Audio Context Ref & State tracking refs
  const audioCtxRef = useRef(null);
  const currentStationIdxRef = useRef(0);
  const isCountingPhaseRef = useRef(false);
  const isFlyingRef = useRef(false);
  const targetStepRef = useRef(1);
  const expectedStationRef = useRef(1);
  const lastMatchTimeRef = useRef(0);
  const tokenRef = useRef(0);
  const animFrameRef = useRef(null);

  // Sync refs to avoid stale closures
  useEffect(() => {
    currentStationIdxRef.current = currentStationIdx;
  }, [currentStationIdx]);

  useEffect(() => {
    isFlyingRef.current = isFlying;
  }, [isFlying]);

  useEffect(() => {
    targetStepRef.current = currentCountingStep;
  }, [currentCountingStep]);

  useEffect(() => {
    expectedStationRef.current = expectedStation;
  }, [expectedStation]);

  useEffect(() => {
    isCountingPhaseRef.current = isCountingPhase;
  }, [isCountingPhase]);

  // Initialize Web Audio
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq, type = 'sine', duration = 0.15, gainVal = 0.15) => {
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

  const playChime = useCallback((index) => {
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const f = scale[(index - 1) % scale.length];
    playTone(f, 'triangle', 0.35, 0.25);
    setTimeout(() => {
      playTone(f * 2, 'sine', 0.25, 0.12);
    }, 50);
  }, [playTone]);

  const playSwoosh = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Fallback
    }
  }, [getAudioCtx]);

  const playSuccessChord = useCallback(() => {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 'triangle', 0.6, 0.2);
      }, i * 80);
    });
  }, [playTone]);

  const playErrorSound = useCallback(() => {
    playTone(150, 'sawtooth', 0.2, 0.2);
  }, [playTone]);

  // Bulletproof Speech Synthesis for kids voice commands
  const speakVoiceCommand = useCallback((phrase, onEnd) => {
    if (typeof window === 'undefined') {
      if (onEnd) onEnd();
      return;
    }

    try {
      playTone(587.33, 'triangle', 0.14, 0.16);
    } catch {}

    if (!('speechSynthesis' in window)) {
      if (onEnd) setTimeout(onEnd, 350);
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.cancel();

      const tSpeak = setTimeout(() => {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }

          const u = new SpeechSynthesisUtterance(phrase);
          u.rate = 1.0;
          u.pitch = 1.0;
          u.lang = 'en-US';

          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            const enVoice = voices.find(v => v.lang === 'en-US' || v.lang === 'en-IN' || v.lang.startsWith('en')) || voices[0];
            if (enVoice) {
              u.voice = enVoice;
            }
          }

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
          u.onerror = cleanUp;

          window.speechSynthesis.speak(u);
          window.speechSynthesis.resume();

          const durationEst = Math.max(1200, phrase.length * 95);
          setTimeout(cleanUp, durationEst);
        } catch {
          if (onEnd) onEnd();
        }
      }, 40);
    } catch {
      if (onEnd) onEnd();
    }
  }, [playTone]);

  const speak = speakVoiceCommand;

  // Forward declaration of handleCountInput and onStationClick via refs
  const handleCountInputRef = useRef(null);
  const onStationClickRef = useRef(null);

  // Voice recognition handler powered by useWhisperVoice hook
  const handleMazeNumber = useCallback((detectedNum, cleanText, rawText) => {
    if (detectedNum === null) return;
    const now = Date.now();
    if (now - lastMatchTimeRef.current < 280) return;
    lastMatchTimeRef.current = now;

    if (isCountingPhaseRef.current) {
      const currentTarget = targetStepRef.current;
      if (detectedNum === currentTarget) {
        setHeardWord(`"${cleanText}" ⭐`);
        if (handleCountInputRef.current) {
          handleCountInputRef.current(currentTarget);
        }
      } else {
        setCountGuideText(`Heard "${detectedNum}" — Next is ${currentTarget}! ⭐`);
      }
    } else {
      const nextExpected = expectedStationRef.current;
      if (detectedNum === nextExpected) {
        setHeardWord(`"${cleanText}" 🚀`);
        const targetNode = (stationLayout && stationLayout.stationToNode && stationLayout.stationToNode[nextExpected]) || nextExpected;
        if (targetNode !== undefined && onStationClickRef.current) {
          onStationClickRef.current(nextExpected, targetNode);
        }
      } else {
        setBanner({
          text: `👉 Heard "${detectedNum}". Say or tap Pad ${nextExpected} to launch! 🚀`,
          type: 'normal'
        });
      }
    }
  }, [stationLayout]);

  const whisperVoice = useWhisperVoice({
    onNumberDetected: handleMazeNumber,
    onTextHeard: (t) => {
      if (!t) return;
      setHeardWord(`"${t}"`);
      // If parked on Start Pad, words like "launch", "start", "go", "pad 1", "fly", "one" will trigger launch
      if (currentStationIdxRef.current === 0 && !isFlyingRef.current && !isCountingPhaseRef.current) {
        const clean = t.toLowerCase();
        if (/\b(launch|start|go|fly|rocket|pad|one|1)\b/i.test(clean)) {
          const targetNode = (stationLayout && stationLayout.stationToNode && stationLayout.stationToNode[1]) || 1;
          if (onStationClickRef.current) {
            onStationClickRef.current(1, targetNode);
          }
        }
      }
    }
  });

  const whisperVoiceRef = useRef(whisperVoice);
  useEffect(() => {
    whisperVoiceRef.current = whisperVoice;
  }, [whisperVoice]);

  // Finish counting for a station
  const finishStationCounting = useCallback((stationK) => {
    setIsCountingPhase(false);
    isCountingPhaseRef.current = false;
    if (whisperVoice.isRecording) {
      whisperVoice.stopRecording();
    }
    playSuccessChord();
    fireConfetti({ particleCount: 50 + stationK * 8, spread: 75, origin: { y: 0.6 } });

    setCountGuideText(`🎉 Super! All ${stationK} stars collected!`);

    const nextStation = stationK + 1;
    setExpectedStation(nextStation);
    expectedStationRef.current = nextStation;

    if (typeof onAwardStars === 'function') {
      onAwardStars(2);
    }

    setTimeout(() => {
      if (nextStation > stationCount) {
        // Game win! All stations reached at Saturn!
        setIsCountingPhase(false);
        isCountingPhaseRef.current = false;
        if (whisperVoice.isRecording) {
          whisperVoice.stopRecording();
        }
        playSuccessChord();
        setBanner({
          text: `🎉 Mission Accomplished! All ${stationCount} Stations Completed at Saturn! 🪐🎉`,
          type: 'success'
        });
        setWinModalOpen(true);
        if (typeof onTopicComplete === 'function') {
          onTopicComplete('numbers-1-to-10');
        }
        fireConfetti({ particleCount: 160, spread: 100, origin: { y: 0.5 } });
        speak(`Hooray! You reached all ${stationCount} stations and counted every star at Saturn!`);
      } else {
        setBanner({
          text: `👉 Great! Choose Pad ${nextStation} on the maze to launch rocket! 🚀`,
          type: 'normal'
        });
        setCountGuideText(`Ready for Pad ${nextStation}!`);
        speakVoiceCommand(`Fly to Pad ${nextStation}!`);
      }
    }, 1200);
  }, [whisperVoice, playSuccessChord, speakVoiceCommand, stationCount, onAwardStars, onTopicComplete]);

  // Handle count input (instant voice or star tap)
  const handleCountInput = useCallback((numberCounted) => {
    if (isFlying) return;
    getAudioCtx();

    setCurrentCountingStep((prevStep) => {
      if (numberCounted === prevStep) {
        playChime(prevStep);

        const stationK = expectedStationRef.current;
        if (prevStep < stationK) {
          const nextStep = prevStep + 1;
          targetStepRef.current = nextStep;
          setCountGuideText(`Great! Next say or tap: ${nextStep}`);
          return nextStep;
        } else {
          finishStationCounting(stationK);
          return prevStep;
        }
      } else {
        setCountGuideText(`Say or tap ${prevStep}! ⭐`);
        return prevStep;
      }
    });
  }, [isFlying, getAudioCtx, playChime, finishStationCounting]);

  // Keep ref up to date to prevent stale closures
  useEffect(() => {
    handleCountInputRef.current = handleCountInput;
  }, [handleCountInput]);

  // Setup counting phase when rocket arrives at a station
  const setupCountingPhaseForStation = useCallback((stationNum, nodeId) => {
    setIsCountingPhase(true);
    isCountingPhaseRef.current = true;
    setCurrentCountingStep(1);
    targetStepRef.current = 1;
    lastMatchTimeRef.current = 0;

    // Jumble the orbiting stars around the rocket for this station
    const stars = Array.from({ length: stationNum }, (_, i) => i + 1);
    for (let i = stars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [stars[i], stars[j]] = [stars[j], stars[i]];
    }
    setStarOrder(stars);

    setBanner({
      text: stationNum === 1 ? '🌟 Pad 1: Count the 1 star to refuel!' : `🌟 Pad ${stationNum}: Count the ${stationNum} stars from 1 to ${stationNum}!`,
      type: 'counting'
    });
    setCountGuideText('Say out loud or tap: 1');
    setHeardWord('Listening...');

    playChime(1);
    speakVoiceCommand(stationNum === 1 ? 'Count 1 star to launch!' : `Count ${stationNum} stars! Say 1!`);
  }, [playChime, speakVoiceCommand]);

  // Smooth rocket flight along bezier tubes using BFS
  const flyRocketTo = useCallback((targetNode, callback) => {
    const startNode = currentStationIdxRef.current;
    if (startNode === targetNode) {
      if (callback) callback();
      return;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setIsFlying(true);
    isFlyingRef.current = true;
    setRocketStatus(`🚀 Flying to Pad ${targetNode}...`);
    playSwoosh();

    const path = findShortestPath(startNode, targetNode, stationCount);
    if (!path || path.length < 2) {
      currentStationIdxRef.current = targetNode;
      setCurrentStationIdx(targetNode);
      setRocketPos({ x: ALL_NODES[targetNode][0], y: ALL_NODES[targetNode][1], angle: 0 });
      setIsFlying(false);
      isFlyingRef.current = false;
      if (callback) callback();
      return;
    }

    let stepIndex = 0;
    const stepDuration = 600; // Smooth 600ms flight per hop
    let startTime = null;
    const myToken = tokenRef.current;

    const frame = (now) => {
      try {
        if (myToken !== tokenRef.current) return;
        const currentTime = (typeof now === 'number' && !isNaN(now)) ? now : performance.now();
        if (startTime === null) startTime = currentTime;
        const elapsed = Math.max(0, currentTime - startTime);
        const rawT = Math.min(elapsed / stepDuration, 1);
        const t = rawT < 0.5 ? 2 * rawT * rawT : -1 + (4 - 2 * rawT) * rawT;

        const fromNode = path[stepIndex];
        const toNode = path[stepIndex + 1];

        const pt = getBezierPoint(fromNode, toNode, t);
        const cp = controlPoints[edgeKey(Math.min(fromNode, toNode), Math.max(fromNode, toNode))] || [
          (ALL_NODES[fromNode][0] + ALL_NODES[toNode][0]) / 2,
          (ALL_NODES[fromNode][1] + ALL_NODES[toNode][1]) / 2
        ];
        const p0 = ALL_NODES[fromNode];
        const p1 = ALL_NODES[toNode];
        const dx = 2 * (1 - t) * (cp[0] - p0[0]) + 2 * t * (p1[0] - cp[0]);
        const dy = 2 * (1 - t) * (cp[1] - p0[1]) + 2 * t * (p1[1] - cp[1]);
        const flightAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 45;

        setRocketPos({ x: pt[0], y: pt[1], angle: flightAngle });

        if (rawT < 1) {
          animFrameRef.current = requestAnimationFrame(frame);
        } else {
          stepIndex++;
          if (stepIndex < path.length - 1) {
            startTime = performance.now();
            playSwoosh();
            animFrameRef.current = requestAnimationFrame(frame);
          } else {
            currentStationIdxRef.current = targetNode;
            setCurrentStationIdx(targetNode);
            setRocketPos({ x: ALL_NODES[targetNode][0], y: ALL_NODES[targetNode][1], angle: 0 });
            setIsFlying(false);
            isFlyingRef.current = false;
            setRocketStatus(`📍 Docked at Pad ${targetNode}`);
            if (callback) callback();
          }
        }
      } catch (err) {
        currentStationIdxRef.current = targetNode;
        setCurrentStationIdx(targetNode);
        setRocketPos({ x: ALL_NODES[targetNode][0], y: ALL_NODES[targetNode][1], angle: 0 });
        setIsFlying(false);
        isFlyingRef.current = false;
        if (callback) callback();
      }
    };

    animFrameRef.current = requestAnimationFrame(frame);
  }, [playSwoosh, stationCount]);

  // Station Click Handler — checks clicked station number against expected station
  const onStationClick = useCallback((stationNum, nodeId) => {
    if (isFlyingRef.current) return;
    getAudioCtx();

    const currNode = currentStationIdxRef.current;
    const currStation = (stationLayout && stationLayout.nodeToStation && stationLayout.nodeToStation[currNode]) || currNode;

    // SCENARIO 1: Rocket is on Start Pad (Node 0)
    // Tapping Pad 1 or Start Pad or 0 launches to Pad 1!
    if (currNode === 0) {
      if (stationNum === 1 || nodeId === 1 || stationNum === 0 || nodeId === 0) {
        const targetNode = (stationLayout && stationLayout.stationToNode && stationLayout.stationToNode[1]) || 1;
        setExpectedStation(1);
        expectedStationRef.current = 1;
        flyRocketTo(targetNode, () => {
          setupCountingPhaseForStation(1, targetNode);
        });
        return;
      }
    }

    // SCENARIO 2: Rocket is already at Pad 1 or current station
    // If the child taps the pad the rocket is on, advance to the NEXT pad!
    if (nodeId === currNode || stationNum === currStation) {
      const nextStation = currStation + 1;
      if (nextStation <= stationCount) {
        const nextNode = (stationLayout && stationLayout.stationToNode && stationLayout.stationToNode[nextStation]) || nextStation;
        setExpectedStation(nextStation);
        expectedStationRef.current = nextStation;
        flyRocketTo(nextNode, () => {
          setupCountingPhaseForStation(nextStation, nextNode);
        });
      } else {
        // Reached Saturn!
        finishStationCounting(stationCount);
      }
      return;
    }

    // SCENARIO 3: Child taps the expected target station (e.g. Pad 1, Pad 2, etc.)
    const expected = expectedStationRef.current;
    const expectedNode = (stationLayout && stationLayout.stationToNode && stationLayout.stationToNode[expected]) || expected;
    if (stationNum === expected || nodeId === expectedNode) {
      flyRocketTo(expectedNode, () => {
        setupCountingPhaseForStation(expected, expectedNode);
      });
      return;
    }

    // SCENARIO 4: Child taps next station ahead
    if (stationNum === currStation + 1) {
      const nextStation = currStation + 1;
      const targetNode = (stationLayout && stationLayout.stationToNode && stationLayout.stationToNode[nextStation]) || nodeId;
      setExpectedStation(nextStation);
      expectedStationRef.current = nextStation;
      flyRocketTo(targetNode, () => {
        setupCountingPhaseForStation(nextStation, targetNode);
      });
      return;
    }

    // Otherwise wrong pad:
    playErrorSound();
    const targetStation = currStation === 0 ? 1 : currStation + 1;
    setBanner({
      text: `⚠️ That is Pad ${stationNum}! Tap Pad ${targetStation} to launch! 🚀`,
      type: 'error'
    });
    speakVoiceCommand(`Look for Pad ${targetStation}`);
    setTimeout(() => {
      setBanner({
        text: `👉 Tap Pad ${targetStation} on the maze to launch rocket! 🚀`,
        type: 'normal'
      });
    }, 1500);
  }, [getAudioCtx, stationLayout, stationCount, playErrorSound, speakVoiceCommand, flyRocketTo, setupCountingPhaseForStation, finishStationCounting]);

  useEffect(() => {
    onStationClickRef.current = onStationClick;
  }, [onStationClick]);

  // Reset Game: Rocket starts on Start Pad (Node 0), Pad 1 is next to Start Pad, Pad 10 is next to Saturn
  const resetGame = useCallback((newLayout) => {
    tokenRef.current++;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (whisperVoice.isRecording) {
      whisperVoice.stopRecording();
    }
    setWinModalOpen(false);

    // Default sequential stations (Pad 1 next to Start Pad, Pad 10 next to Saturn)
    const layout = newLayout || generateSequentialStations(stationCount);
    setStationLayout(layout);

    setExpectedStation(1);
    expectedStationRef.current = 1;
    setCurrentStationIdx(0); // Start on START PAD (Node 0)
    currentStationIdxRef.current = 0;
    setCurrentCountingStep(1);
    targetStepRef.current = 1;
    setIsCountingPhase(false); // Waiting to choose Pad 1!
    isCountingPhaseRef.current = false;
    setIsFlying(false);
    isFlyingRef.current = false;
    setStarOrder([1]);

    setRocketPos({ x: ALL_NODES[0][0], y: ALL_NODES[0][1], angle: 0 });
    setRocketStatus('⚡ Rocket Ready on Start Pad');

    setBanner({
      text: '🚀 Rocket ready on Start Pad! Choose Pad 1 to launch!',
      type: 'normal'
    });
    setCountGuideText('Say or click: Pad 1 🚀');
    setHeardWord('Ready to launch...');

    playChime(1);
    speakVoiceCommand("Let's launch to Pad One!");
  }, [whisperVoice, playChime, stationCount, speakVoiceCommand]);

  // Quick jumble button handler
  const jumblePositions = useCallback(() => {
    getAudioCtx();
    playSwoosh();
    resetGame(generateShuffledStations(stationCount));
  }, [getAudioCtx, playSwoosh, resetGame, stationCount]);

  // Handle station count selector change
  const handleStationCountChange = (e) => {
    const newN = parseInt(e.target.value, 10) || 10;
    setStationCount(newN);
    resetGame(generateShuffledStations(newN));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (whisperVoiceRef.current && whisperVoiceRef.current.isRecording) {
        try { whisperVoiceRef.current.stopRecording(); } catch (e) {}
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Compute floating stars orbiting directly around the rocket at currentStationIdx
  const floatingStars = [];
  if (isCountingPhase && currentStationIdx > 0) {
    const total = expectedStation;
    const rx = ALL_NODES[currentStationIdx][0];
    const ry = ALL_NODES[currentStationIdx][1];

    for (let slot = 0; slot < total; slot++) {
      let angle;
      if (total === 1) {
        angle = -Math.PI / 2;
      } else {
        angle = -Math.PI / 2 + (slot * (2 * Math.PI)) / total;
      }

      // Radius staggered for larger clusters so stars never overlap
      const radius = total <= 5 ? 28 : (total <= 7 ? 32 : (slot % 2 === 0 ? 36 : 28));
      const sx = rx + radius * Math.cos(angle);
      const sy = ry + radius * Math.sin(angle);

      // Star numeral from jumbled order
      const starNum = (starOrder && starOrder[slot]) ? starOrder[slot] : (slot + 1);
      const isCounted = starNum < currentCountingStep;
      const isTargetStep = isCountingPhase && starNum === currentCountingStep;

      floatingStars.push({
        num: starNum,
        x: sx,
        y: sy,
        isCounted,
        isTargetStep
      });
    }
  }

  // Dynamic Saturn positioning at Station 10 (or Station N)
  const saturnStationTarget = (stationLayout && stationLayout.stationToNode && stationLayout.stationToNode[10]) ? 10 : stationCount;
  const saturnNodeId = (stationLayout && stationLayout.stationToNode && stationLayout.stationToNode[saturnStationTarget]) || stationCount;
  const pos10 = ALL_NODES[saturnNodeId] || ALL_NODES[stationCount];
  const saturnCoords = getSaturnCoords(pos10);

  return (
    <div className="tenali-space-maze-wrapper">
      {/* Top Header Control Bar */}
      <header className="space-explorer-header">
        <div className="space-explorer-title">
          <span className="rocket-icon">🚀</span>
          <h2>Star Station Explorer</h2>
        </div>
        <div className="space-explorer-controls">
          <div className="station-selector-pill">
            <label htmlFor="stationCountSelect">Stations (N):</label>
            <select
              id="stationCountSelect"
              value={stationCount}
              onChange={handleStationCountChange}
            >
              <option value="5">5</option>
              <option value="7">7</option>
              <option value="10">10</option>
            </select>
          </div>
          <button
            type="button"
            className="space-jumble-btn"
            onClick={jumblePositions}
            title="Jumble number positions"
          >
            🔀 Jumble
          </button>
          <button
            type="button"
            className="space-reset-btn"
            onClick={() => resetGame()}
            title="Restart game"
          >
            🔄 Reset
          </button>
        </div>
      </header>

      {/* Instructional Banner with Integrated Live Voice & Count Prompt */}
      <div className={`space-instruction-banner ${banner.type}`}>
        <div className="banner-title-text">{banner.text}</div>
        <div className="banner-counting-hud" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
          {isCountingPhase ? (
            <span className="banner-count-prompt">
              Tap star or click mic to say: <strong className="highlight-digit">{currentCountingStep}</strong>
            </span>
          ) : (
            <span className="banner-count-prompt">
              Speak or tap: <strong className="highlight-digit">Station {expectedStation}</strong> 🚀
            </span>
          )}
          <PushToTalkButton
            whisperState={whisperVoice}
            label={isCountingPhase ? `Click to Speak '${currentCountingStep}'` : `Click to Speak 'Station ${expectedStation}'`}
          />
          <span
            className={`whisper-live-badge ${whisperVoice.serverOnline ? 'server-online' : ''}`}
            title="In-browser Whisper AI neural recognition active"
            style={whisperVoice.serverOnline ? { borderColor: '#10b981', color: '#6ee7b7' } : undefined}
          >
            {whisperVoice.serverOnline ? '🟢 Whisper Indian Digits Active' : '✨ Whisper Indian Digits AI'}
          </span>
        </div>
      </div>

      {/* Mission Progress Tracker */}
      <div className="space-progress-bar">
        <span className="progress-label">Mission Progress:</span>
        <div className="progress-pills-row">
          {Array.from({ length: stationCount }).map((_, idx) => {
            const stNum = idx + 1;
            const isCompleted = stNum < expectedStation;
            const isCurrent = stNum === expectedStation;

            return (
              <div
                key={stNum}
                className={`progress-pill-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              >
                {stNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded SVG Space Maze Canvas */}
      <div className="space-maze-canvas-card">
        <svg
          viewBox="-15 -15 450 335"
          className="space-maze-svg-board"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Space Maze Map"
        >
          <defs>
            {/* Glow filters */}
            <filter id="star-gold-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="maze-space-sky" cx="50%" cy="20%" r="90%">
              <stop offset="0%" stopColor="#4a2d8a" />
              <stop offset="65%" stopColor="#20134e" />
              <stop offset="100%" stopColor="#0f0928" />
            </radialGradient>
          </defs>

          {/* Galaxy Canvas Background */}
          <rect x="-30" y="-30" width="480" height="365" rx="16" fill="url(#maze-space-sky)" />

          {/* Twinkling background stars */}
          {[
            [19, 11, 1.2, '#67e8f9'], [92, 58, 2, '#fef08a'], [165, 105, 1.2, '#67e8f9'],
            [238, 152, 2, '#fef08a'], [311, 199, 1.2, '#67e8f9'], [384, 246, 2, '#fef08a'],
            [37, 293, 1.2, '#67e8f9'], [110, 30, 2, '#fef08a'], [183, 77, 1.2, '#67e8f9'],
            [256, 124, 2, '#fef08a'], [329, 171, 1.2, '#67e8f9'], [402, 218, 2, '#fef08a'],
            [55, 265, 1.2, '#67e8f9'], [128, 2, 2, '#fef08a'], [201, 49, 1.2, '#67e8f9'],
            [274, 96, 2, '#fef08a'], [347, 143, 1.2, '#67e8f9'], [420, 190, 2, '#fef08a']
          ].map(([cx, cy, r, fill], idx) => (
            <circle key={idx} cx={cx} cy={cy} r={r} fill={fill} opacity="0.65" />
          ))}

          {/* Dynamic Saturn Goal Planet anchored to Station 10 */}
          <g
            className="space-saturn-goal"
            transform={`translate(${saturnCoords.x}, ${saturnCoords.y})`}
            style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.6))' }}
          >
            {/* Cosmic tether line linking Station 10 node to Saturn */}
            <line
              x1={pos10[0] - saturnCoords.x}
              y1={pos10[1] - saturnCoords.y}
              x2={0}
              y2={0}
              stroke="#eab308"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.6"
            />
            {/* Saturn Outer Ring */}
            <ellipse
              cx="0"
              cy="0"
              rx="22"
              ry="7"
              fill="none"
              stroke="#fde047"
              strokeWidth="3.5"
              transform="rotate(-22)"
              opacity="0.95"
            />
            {/* Saturn Inner Shadow Ring */}
            <ellipse
              cx="0"
              cy="0"
              rx="25"
              ry="8.5"
              fill="none"
              stroke="rgba(234, 179, 8, 0.45)"
              strokeWidth="1.5"
              transform="rotate(-22)"
            />
            {/* Saturn Planet Body */}
            <circle cx="0" cy="0" r="13" fill="#a855f7" />
            {/* Planetary Atmospheric Bands */}
            <path
              d="M -11 -2 Q 0 -6 11 -2"
              fill="none"
              stroke="#c084fc"
              strokeWidth="2"
              opacity="0.75"
            />
            <path
              d="M -12 3 Q 0 -1 12 3"
              fill="none"
              stroke="#7e22ce"
              strokeWidth="2"
              opacity="0.75"
            />
            {/* Ring Front Overlay for 3D Depth */}
            <path
              d="M -21 1 A 22 7 0 0 0 21 3"
              fill="none"
              stroke="#fef08a"
              strokeWidth="2"
              transform="rotate(-22)"
              opacity="0.9"
            />
            {/* Saturn Label */}
            <text
              x="0"
              y="20"
              textAnchor="middle"
              fontSize="8"
              fontWeight="bold"
              fill="#fde047"
              letterSpacing="0.5"
            >
              🪐 SATURN
            </text>
          </g>

          {/* Layered Tube Pathways */}
          <g id="tubes-layer">
            {computedPaths
              .filter(pt => pt.from <= stationCount && pt.to <= stationCount)
              .map(pt => (
                <path
                  key={`outer-${pt.id}`}
                  d={pt.d}
                  fill="none"
                  stroke="#4c1d95"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
              ))}
            {computedPaths
              .filter(pt => pt.from <= stationCount && pt.to <= stationCount)
              .map(pt => (
                <path
                  key={`mid-${pt.id}`}
                  d={pt.d}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="14"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              ))}
            {computedPaths
              .filter(pt => pt.from <= stationCount && pt.to <= stationCount)
              .map(pt => (
                <path
                  key={`core-${pt.id}`}
                  d={pt.d}
                  fill="none"
                  stroke="#e0e7ff"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              ))}
          </g>

          
          {/* Circular Docking Station Nodes with Start Pad and Station 1 to N */}
          <g id="stations-layer">
            {/* Dedicated START PAD (Node 0) */}
            <g
              key="station-node-0"
              className="space-docking-node start-pad-node"
              onClick={() => onStationClick(1, 1)}
              onPointerDown={() => onStationClick(1, 1)}
              style={{ cursor: 'pointer' }}
            >
              {/* Generous touch target */}
              <circle
                cx={ALL_NODES[0][0]}
                cy={ALL_NODES[0][1]}
                r="36"
                fill="#ffffff"
                opacity="0.001"
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
              />
              {/* Launch Pad Base */}
              <circle
                cx={ALL_NODES[0][0]}
                cy={ALL_NODES[0][1]}
                r="25"
                fill="#0f172a"
                stroke={currentStationIdx === 0 ? '#38bdf8' : '#475569'}
                strokeWidth="3.5"
                strokeDasharray={currentStationIdx === 0 ? '5 2.5' : 'none'}
              />
              <circle
                cx={ALL_NODES[0][0]}
                cy={ALL_NODES[0][1]}
                r="19"
                fill={currentStationIdx === 0 ? '#0284c7' : '#1e293b'}
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              {/* Launch Pad Crosshairs */}
              <line
                x1={ALL_NODES[0][0] - 11}
                y1={ALL_NODES[0][1]}
                x2={ALL_NODES[0][0] + 11}
                y2={ALL_NODES[0][1]}
                stroke="#93c5fd"
                strokeWidth="1.5"
                opacity="0.85"
                style={{ pointerEvents: 'none' }}
              />
              <line
                x1={ALL_NODES[0][0]}
                y1={ALL_NODES[0][1] - 11}
                x2={ALL_NODES[0][0]}
                y2={ALL_NODES[0][1] + 11}
                stroke="#93c5fd"
                strokeWidth="1.5"
                opacity="0.85"
                style={{ pointerEvents: 'none' }}
              />
              <circle
                cx={ALL_NODES[0][0]}
                cy={ALL_NODES[0][1]}
                r="4.5"
                fill="#facc15"
                style={{ pointerEvents: 'none' }}
              />
              {/* START PAD Pill Label */}
              <g
                transform={`translate(${ALL_NODES[0][0]}, ${ALL_NODES[0][1] + 30})`}
                onClick={() => onStationClick(1, 1)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x="-34"
                  y="-9"
                  width="68"
                  height="18"
                  rx="9"
                  fill="#0284c7"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fontSize="8.5"
                  fontWeight="900"
                  fill="#ffffff"
                  letterSpacing="0.5"
                  style={{ pointerEvents: 'none' }}
                >
                  START PAD 🚀
                </text>
              </g>
            </g>

            {Array.from({ length: stationCount }).map((_, idx) => {
              const nodeId = idx + 1;
              const pos = ALL_NODES[nodeId];
              // Retrieve the jumbled station number displayed at this node
              const stationNum = (stationLayout && stationLayout.nodeToStation && stationLayout.nodeToStation[nodeId])
                ? stationLayout.nodeToStation[nodeId]
                : nodeId;

              const isTarget = stationNum === expectedStation;
              const isCompleted = stationNum < expectedStation;
              const isSaturnStation = stationNum === saturnStationTarget;
              const isStartStation = stationNum === 1;

              let outerStroke = '#38bdf8';
              let outerWidth = 2.5;
              let innerFill = '#f59e0b';
              let textFill = '#1e1b4b';

              if (isCompleted) {
                innerFill = '#22c55e';
                outerStroke = '#4ade80';
                outerWidth = 2;
                textFill = '#ffffff';
              } else if (isTarget) {
                innerFill = '#fbbf24';
                outerStroke = '#fde047';
                outerWidth = 4;
                textFill = '#1e1b4b';
              }

              const badgeYOffset = pos[1] > 255 ? -26 : 26;

              return (
                <g
                  key={`station-node-${nodeId}`}
                  className="space-docking-node"
                  onClick={() => onStationClick(stationNum, nodeId)}
                  onPointerDown={() => onStationClick(stationNum, nodeId)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Generous touch target */}
                  <circle
                    cx={pos[0]}
                    cy={pos[1]}
                    r="30"
                    fill="#ffffff"
                    opacity="0.001"
                    style={{ cursor: 'pointer', pointerEvents: 'all' }}
                  />
                  {/* Golden Saturn Orbital Ring on Station 10 Node */}
                  {isSaturnStation && (
                    <ellipse
                      cx={pos[0]}
                      cy={pos[1]}
                      rx="25"
                      ry="8.5"
                      fill="none"
                      stroke="#facc15"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      transform={`rotate(-25 ${pos[0]} ${pos[1]})`}
                      opacity="0.95"
                      style={{ pointerEvents: 'none' }}
                    />
                  )}

                  <circle
                    cx={pos[0]}
                    cy={pos[1]}
                    r="18"
                    fill="#1e1b4b"
                    stroke={outerStroke}
                    strokeWidth={outerWidth}
                    filter={isTarget ? 'url(#star-gold-glow)' : 'none'}
                    style={{ cursor: 'pointer' }}
                  />
                  <circle
                    cx={pos[0]}
                    cy={pos[1]}
                    r="14"
                    fill={innerFill}
                    style={{ cursor: 'pointer' }}
                  />
                  <text
                    x={pos[0]}
                    y={pos[1] + 5.5}
                    textAnchor="middle"
                    fontSize="15"
                    fontWeight="900"
                    fill={textFill}
                    style={{ pointerEvents: 'none' }}
                  >
                    {isCompleted ? '✓' : stationNum}
                  </text>

                  {/* "CHOOSE 1 🚀" Hint when on Start Pad */}
                  {isStartStation && currentStationIdx === 0 && (
                    <g
                      transform={`translate(${pos[0]}, ${pos[1] - 26})`}
                      onClick={() => onStationClick(1, nodeId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect
                        x="-30"
                        y="-8"
                        width="60"
                        height="16"
                        rx="8"
                        fill="#f59e0b"
                        stroke="#fde047"
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="900"
                        fill="#1e1b4b"
                        style={{ pointerEvents: 'none' }}
                      >
                        CHOOSE 1 🚀
                      </text>
                    </g>
                  )}

                  {/* PAD 1 Label below Station 1 */}
                  {isStartStation && currentStationIdx !== 0 && (
                    <g
                      transform={`translate(${pos[0]}, ${pos[1] + badgeYOffset})`}
                      onClick={() => onStationClick(1, nodeId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect
                        x="-22"
                        y="-8"
                        width="44"
                        height="15"
                        rx="7.5"
                        fill="#059669"
                        stroke="#34d399"
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="900"
                        fill="#ffffff"
                        style={{ pointerEvents: 'none' }}
                      >
                        PAD 1 ⭐
                      </text>
                    </g>
                  )}

                  {/* GOAL Badge below Station 10 */}
                  {isSaturnStation && (
                    <g transform={`translate(${pos[0]}, ${pos[1] + badgeYOffset})`} pointerEvents="none">
                      <rect
                        x="-22"
                        y="-8"
                        width="44"
                        height="15"
                        rx="7.5"
                        fill="#7c3aed"
                        stroke="#c084fc"
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="900"
                        fill="#fef08a"
                      >
                        GOAL 🪐
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Flying / Landed Rocket */}
          <g
            transform={`translate(${rocketPos.x}, ${rocketPos.y}) rotate(${rocketPos.angle || 0})`}
            onClick={() => {
              if (isFlyingRef.current) return;
              const curr = currentStationIdxRef.current;
              if (curr === 0) {
                const targetNode = (stationLayout && stationLayout.stationToNode && stationLayout.stationToNode[1]) || 1;
                onStationClick(1, targetNode);
              } else {
                // Tapping rocket advances to next station!
                const next = curr + 1;
                if (next <= stationCount) {
                  const targetNode = (stationLayout && stationLayout.stationToNode && stationLayout.stationToNode[next]) || next;
                  onStationClick(next, targetNode);
                }
              }
            }}
            onPointerDown={() => {
              if (isFlyingRef.current) return;
              const curr = currentStationIdxRef.current;
              if (curr === 0) {
                const targetNode = (stationLayout && stationLayout.stationToNode && stationLayout.stationToNode[1]) || 1;
                onStationClick(1, targetNode);
              } else {
                const next = curr + 1;
                if (next <= stationCount) {
                  const targetNode = (stationLayout && stationLayout.stationToNode && stationLayout.stationToNode[next]) || next;
                  onStationClick(next, targetNode);
                }
              }
            }}
            style={{ cursor: isFlying ? 'default' : 'pointer' }}
          >
            {/* Thruster exhaust flame trail when flying */}
            {isFlying && (
              <circle
                cx="-12"
                cy="12"
                r="7"
                fill="#f97316"
                filter="url(#star-gold-glow)"
                opacity="0.9"
                style={{ pointerEvents: 'none' }}
              />
            )}
            <circle
              cx="0"
              cy="0"
              r="28"
              fill="#ffffff"
              opacity="0.001"
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
            />
            <text
              x="0"
              y="0"
              fontSize="28"
              textAnchor="middle"
              dominantBaseline="central"
              className="space-maze-rocket"
              style={{ pointerEvents: 'none' }}
            >
              🚀
            </text>
          </g>

          {/* Floating Stars Hovering Directly Around the Rocket */}
          <g id="floating-stars-over-rocket">
            {floatingStars.map((fs) => (
              <g
                key={`floating-star-${fs.num}`}
                className="orbit-star-node"
                transform={`translate(${fs.x}, ${fs.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCountInput(fs.num);
                }}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx="0"
                  cy="0"
                  r={fs.isTargetStep ? 11.5 : 10}
                  fill={fs.isCounted ? '#fbbf24' : (fs.isTargetStep ? '#4c1d95' : 'rgba(30, 27, 75, 0.85)')}
                  stroke={fs.isCounted ? '#fef08a' : (fs.isTargetStep ? '#facc15' : '#818cf8')}
                  strokeWidth={fs.isTargetStep ? 2.8 : (fs.isCounted ? 2.5 : 1.2)}
                  filter={fs.isCounted || fs.isTargetStep ? 'url(#star-gold-glow)' : 'none'}
                />
                <text
                  x="0"
                  y="-0.5"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fs.isTargetStep ? 13 : 11}
                  pointerEvents="none"
                >
                  ⭐
                </text>
                <text
                  x="0"
                  y="7.5"
                  textAnchor="middle"
                  fontSize="7.5"
                  fontWeight="bold"
                  fill={fs.isCounted ? '#451a03' : '#e0e7ff'}
                  pointerEvents="none"
                >
                  {fs.num}
                </text>
              </g>
            ))}
          </g>
        </svg>

        {/* Live Rocket Status Overlay */}
        <div className="rocket-status-pill">
          {rocketStatus}
        </div>
      </div>

      {/* Celebration Modal */}
      {winModalOpen && (
        <div className="numbers-modal-overlay">
          <div className="numbers-modal-card cosmic-win-card">
            <div style={{ fontSize: '3.6rem', marginBottom: '8px' }}>🏆🪐🚀⭐</div>
            <h2 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.8rem', color: '#fde047', margin: '0 0 6px 0' }}>
              Cosmic Master!
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#ede8e3', marginBottom: '18px' }}>
              Hooray! You found all {stationCount} stations across the cosmic maze and counted every star in perfect order from 1 to {stationCount}!
            </p>
            <div style={{ fontSize: '1.8rem', marginBottom: '20px' }}>
              ⭐ ⭐ ⭐ ⭐ ⭐
            </div>
            <button
              type="button"
              className="numbers-btn-primary"
              style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #f59e0b, #eab308)', color: '#1e1b4b', fontWeight: 900 }}
              onClick={() => resetGame()}
            >
              🚀 Play Again!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { SpaceMazeAdventure };
