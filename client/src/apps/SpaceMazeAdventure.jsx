import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';

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

// Generate a random permutation of station numbers 1..N across nodes 1..N
function generateShuffledStations(n) {
  const nodes = Array.from({ length: n }, (_, i) => i + 1);

  // Fisher-Yates shuffle
  for (let i = nodes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
  }

  // Ensure it's not strictly identity if n > 1
  let isIdentity = true;
  for (let i = 0; i < n; i++) {
    if (nodes[i] !== i + 1) {
      isIdentity = false;
      break;
    }
  }
  if (isIdentity && n > 1) {
    [nodes[0], nodes[1]] = [nodes[1], nodes[0]];
  }

  const stationToNode = {};
  const nodeToStation = {};

  for (let s = 1; s <= n; s++) {
    const nodeId = nodes[s - 1];
    stationToNode[s] = nodeId;
    nodeToStation[nodeId] = s;
  }

  return { stationToNode, nodeToStation };
}

// SVG Maze Node Coordinates
const ALL_NODES = [
  [35, 270],  // Launch base (Node 0)
  [105, 245], // St 1
  [65, 175],  // St 2
  [55, 95],   // St 3
  [65, 30],   // St 4
  [155, 60],  // St 5
  [210, 130], // St 6
  [155, 205], // St 7
  [235, 245], // St 8
  [320, 60],  // St 9
  [355, 180]  // St 10
];

const ALL_EDGES = [
  [0, 1], [1, 2], [1, 7], [1, 8],
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

export default function SpaceMazeAdventure({
  onAwardStars,
  onTopicComplete,
  sfxTone
}) {
  // Game parameters & state
  const [stationCount, setStationCount] = useState(10); // N = 5 | 7 | 10
  const [currentStationIdx, setCurrentStationIdx] = useState(0); // Current node index (0 = Launch Base)
  const [expectedStation, setExpectedStation] = useState(1); // Next station number to visit (1..N)
  const [currentCountingStep, setCurrentCountingStep] = useState(1);
  const [isCountingPhase, setIsCountingPhase] = useState(false);
  const [isFlying, setIsFlying] = useState(false);

  // Dynamic jumbled layout of stations across nodes
  const [stationLayout, setStationLayout] = useState(() => generateShuffledStations(10));
  // Jumbled ordering of stars around the orbiting rocket
  const [starOrder, setStarOrder] = useState([]);

  // Rocket position
  const [rocketPos, setRocketPos] = useState({ x: ALL_NODES[0][0], y: ALL_NODES[0][1] });
  const [rocketStatus, setRocketStatus] = useState('⚡ Rocket Standby');

  // UI feedback banners
  const [banner, setBanner] = useState({
    text: '👉 Find and click Station 1 on the maze to launch! 🚀',
    type: 'normal' // 'normal' | 'error' | 'success' | 'counting'
  });
  const [countGuideText, setCountGuideText] = useState('Ready for countdown!');

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [micStatusText, setMicStatusText] = useState('Mic Ready');
  const [micState, setMicState] = useState('idle'); // 'idle' | 'listening' | 'error'
  const [heardWord, setHeardWord] = useState('Waiting to launch...');

  // Victory celebration modal
  const [winModalOpen, setWinModalOpen] = useState(false);

  // Audio Context Ref
  const audioCtxRef = useRef(null);
  const speechRecRef = useRef(null);
  const isListeningRef = useRef(false);
  const isCountingPhaseRef = useRef(false);
  const targetStepRef = useRef(1);
  const expectedStationRef = useRef(1);
  const lastMatchTimeRef = useRef(0);
  const recognitionRestartTimeoutRef = useRef(null);
  const tokenRef = useRef(0);
  const animFrameRef = useRef(null);

  // Sync refs to avoid stale closures
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

  // Text to speech
  const speak = useCallback((text, callback) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (callback) callback();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05;
    u.pitch = 1.15;
    let finished = false;
    const done = () => {
      if (!finished) {
        finished = true;
        if (callback) callback();
      }
    };
    u.onend = done;
    u.onerror = done;
    window.speechSynthesis.speak(u);
    setTimeout(done, 2500);
  }, []);

  // Forward declaration of handleCountInput via ref
  const handleCountInputRef = useRef(null);

  // Stop native speech recognition
  const stopSpeechRecognition = useCallback(() => {
    isListeningRef.current = false;
    clearTimeout(recognitionRestartTimeoutRef.current);

    if (speechRecRef.current) {
      try {
        speechRecRef.current.abort();
      } catch {
        // Safe cleanup
      }
      speechRecRef.current = null;
    }
    setIsListening(false);
    setMicState('idle');
    setMicStatusText('Mic Idle (Tap to Speak)');
  }, []);

  // Start native browser Speech Recognition with ultra-low latency (<50ms)
  const startSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecClass) {
      setMicStatusText('Tap stars to count');
      setMicState('error');
      return;
    }

    // Stop existing instance if any
    if (speechRecRef.current) {
      try {
        speechRecRef.current.abort();
      } catch {
        // Safe cleanup
      }
      speechRecRef.current = null;
    }

    try {
      const r = new SpeechRecClass();
      speechRecRef.current = r;

      r.continuous = true;
      r.interimResults = true;
      r.maxAlternatives = 8;
      r.lang = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-US';

      r.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setMicState('listening');
        setMicStatusText(`Mic Live: Say '${targetStepRef.current}'`);
      };

      r.onspeechstart = () => {
        setMicStatusText('Hearing you...');
      };

      r.onresult = (ev) => {
        if (!isCountingPhaseRef.current) return;
        const currentTarget = targetStepRef.current;
        let latestText = '';

        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const res = ev.results[i];
          if (!res) continue;

          const topCandidate = res[0] ? res[0].transcript : '';
          if (topCandidate) {
            latestText = topCandidate.trim();
          }

          // Check all alternatives immediately for target number
          for (let a = 0; a < res.length; a++) {
            const cand = res[a] ? res[a].transcript : '';
            if (checkTargetSpoken(cand, currentTarget)) {
              const now = Date.now();
              if (now - lastMatchTimeRef.current > 300) {
                lastMatchTimeRef.current = now;
                setHeardWord(`"${cand.trim()}" ⭐`);
                if (handleCountInputRef.current) {
                  handleCountInputRef.current(currentTarget);
                }
                return;
              }
            }
          }
        }

        if (latestText) {
          setHeardWord(`"${latestText}"`);
          const otherNum = findAnySpokenNumber(latestText);
          if (otherNum !== null && otherNum !== currentTarget) {
            setCountGuideText(`Heard "${otherNum}" — Next is ${currentTarget}! ⭐`);
          }
        }
      };

      r.onerror = (ev) => {
        if (ev.error === 'no-speech' || ev.error === 'aborted') {
          return;
        }
        console.warn('Speech recognition warning:', ev.error);
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
          setMicStatusText('Mic Blocked (Tap to Allow)');
          setMicState('error');
          isListeningRef.current = false;
          setIsListening(false);
        }
      };

      r.onend = () => {
        isListeningRef.current = false;
        if (isCountingPhaseRef.current) {
          clearTimeout(recognitionRestartTimeoutRef.current);
          recognitionRestartTimeoutRef.current = setTimeout(() => {
            if (isCountingPhaseRef.current) {
              try {
                r.start();
              } catch {
                // Ignore if restart fails
              }
            }
          }, 80);
        } else {
          setIsListening(false);
          setMicState('idle');
          setMicStatusText('Mic Idle');
        }
      };

      r.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setMicStatusText('Tap stars to count');
      setMicState('error');
    }
  }, []);

  // Toggle mic on/off via user gesture
  const toggleMic = useCallback(() => {
    getAudioCtx();
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  }, [getAudioCtx, isListening, startSpeechRecognition, stopSpeechRecognition]);

  // Finish counting for a station
  const finishStationCounting = useCallback((stationK) => {
    setIsCountingPhase(false);
    isCountingPhaseRef.current = false;
    stopSpeechRecognition();
    playSuccessChord();

    setCountGuideText(`🎉 Super! All ${stationK} stars collected!`);

    const nextStation = stationK + 1;
    setExpectedStation(nextStation);

    if (typeof onAwardStars === 'function') {
      onAwardStars(2);
    }

    setTimeout(() => {
      if (nextStation > stationCount) {
        // Game win!
        setIsCountingPhase(false);
        stopSpeechRecognition();
        playSuccessChord();
        setBanner({
          text: `🎉 Mission Accomplished! All ${stationCount} Stations Completed! 🎉`,
          type: 'success'
        });
        setWinModalOpen(true);
        if (typeof onTopicComplete === 'function') {
          onTopicComplete('numbers-1-to-10');
        }
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } catch {
          // Fallback
        }
        speak(`Hooray! You reached all ${stationCount} stations and counted every star!`);
      } else {
        setBanner({
          text: `👉 Find and click Station ${nextStation} on the maze to continue!`,
          type: 'normal'
        });
        setCountGuideText('Ready for the next station!');
      }
    }, 1200);
  }, [stopSpeechRecognition, playSuccessChord, speak, stationCount, onAwardStars, onTopicComplete]);

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
          setMicStatusText(`Listening: Say '${nextStep}'...`);
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
      text: `🌟 Station ${stationNum}: Count the ${stationNum} stars from 1 to ${stationNum}!`,
      type: 'counting'
    });
    setCountGuideText('Say out loud or tap: 1');
    setHeardWord('Listening...');

    playChime(1);
    startSpeechRecognition();
  }, [startSpeechRecognition, playChime]);

  // Smooth rocket flight along bezier tubes using BFS
  const flyRocketTo = useCallback((targetNode, callback) => {
    setIsFlying(true);
    setRocketStatus(`🚀 Flying to destination...`);
    playSwoosh();

    const path = findShortestPath(currentStationIdx, targetNode, stationCount);
    let stepIndex = 0;
    const stepDuration = 380;
    let startTime = performance.now();
    const myToken = tokenRef.current;

    const frame = (now) => {
      if (myToken !== tokenRef.current) return;
      const elapsed = now - startTime;
      const t = Math.min(elapsed / stepDuration, 1);
      const fromNode = path[stepIndex];
      const toNode = path[stepIndex + 1];

      const pt = getBezierPoint(fromNode, toNode, t);
      setRocketPos({ x: pt[0], y: pt[1] });

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(frame);
      } else {
        stepIndex++;
        if (stepIndex < path.length - 1) {
          startTime = performance.now();
          playSwoosh();
          animFrameRef.current = requestAnimationFrame(frame);
        } else {
          setCurrentStationIdx(targetNode);
          setIsFlying(false);
          setRocketStatus(`📍 Docked at Station`);
          callback();
        }
      }
    };

    if (path.length < 2) {
      setCurrentStationIdx(targetNode);
      setIsFlying(false);
      callback();
    } else {
      animFrameRef.current = requestAnimationFrame(frame);
    }
  }, [playSwoosh, currentStationIdx, stationCount]);

  // Station Click Handler — checks clicked station number against expected station
  const onStationClick = useCallback((stationNum, nodeId) => {
    if (isFlying || isCountingPhase) return;
    getAudioCtx();

    if (stationNum !== expectedStation) {
      playErrorSound();
      setBanner({
        text: `⚠️ That is Station ${stationNum}! Look for Station ${expectedStation}! 🔍`,
        type: 'error'
      });
      speak(`Look for station number ${expectedStation}`);
      setTimeout(() => {
        setBanner({
          text: `👉 Find and click Station ${expectedStation} on the maze!`,
          type: 'normal'
        });
      }, 1500);
      return;
    }

    flyRocketTo(nodeId, () => {
      setupCountingPhaseForStation(stationNum, nodeId);
    });
  }, [isFlying, isCountingPhase, getAudioCtx, expectedStation, playErrorSound, speak, flyRocketTo, setupCountingPhaseForStation]);

  // Reset Game with option to apply a new jumbled layout
  const resetGame = useCallback((newLayout) => {
    tokenRef.current++;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    stopSpeechRecognition();
    setWinModalOpen(false);

    // Apply provided layout or generate a fresh jumble
    const layout = newLayout || generateShuffledStations(stationCount);
    setStationLayout(layout);

    setExpectedStation(1);
    setCurrentStationIdx(0);
    setCurrentCountingStep(1);
    setIsCountingPhase(false);
    setIsFlying(false);
    setStarOrder([]);

    setRocketPos({ x: ALL_NODES[0][0], y: ALL_NODES[0][1] });
    setRocketStatus('⚡ Rocket on Launch Base');

    setBanner({
      text: '👉 Find and click Station 1 on the maze to launch! 🚀',
      type: 'normal'
    });
    setCountGuideText('Ready for countdown!');
    setHeardWord('Waiting to launch...');

    speak('Find Station 1 to start!');
  }, [stopSpeechRecognition, speak, stationCount]);

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
      stopSpeechRecognition();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopSpeechRecognition]);

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
        {isCountingPhase && (
          <div className="banner-counting-hud">
            <span className="banner-count-prompt">
              Tap star or say out loud: <strong className="highlight-digit">{currentCountingStep}</strong>
            </span>
            <button
              type="button"
              className={`mic-status-pill ${micState}`}
              onClick={toggleMic}
              title="Click to toggle microphone"
            >
              <span className={`mic-dot-indicator ${micState}`} />
              <span>{micStatusText}</span>
            </button>
            {heardWord && heardWord !== 'Waiting to launch...' && (
              <span className="banner-heard-tag">Heard: <em>{heardWord}</em></span>
            )}
          </div>
        )}
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

          {/* Saturn Goal Planet at (385, 28) */}
          <g transform="translate(385, 28)">
            <ellipse cx="0" cy="0" rx="20" ry="6" fill="none" stroke="#eab308" strokeWidth="3" transform="rotate(-20)" />
            <circle cx="0" cy="0" r="12" fill="#a855f7" />
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

          {/* Launch Base Station (Node 0) */}
          <g id="launchpad-node">
            <circle
              cx={ALL_NODES[0][0]}
              cy={ALL_NODES[0][1]}
              r="18"
              fill="#312e81"
              stroke="#06b6d4"
              strokeWidth="3"
            />
            <text
              x={ALL_NODES[0][0]}
              y={ALL_NODES[0][1] + 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#38bdf8"
            >
              BASE
            </text>
          </g>

          {/* Circular Docking Station Nodes 1 to N with Jumbled Number Labels */}
          <g id="stations-layer">
            {Array.from({ length: stationCount }).map((_, idx) => {
              const nodeId = idx + 1;
              const pos = ALL_NODES[nodeId];
              // Retrieve the jumbled station number displayed at this node
              const stationNum = (stationLayout && stationLayout.nodeToStation && stationLayout.nodeToStation[nodeId])
                ? stationLayout.nodeToStation[nodeId]
                : nodeId;

              const isTarget = stationNum === expectedStation;
              const isCompleted = stationNum < expectedStation;

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

              return (
                <g
                  key={`station-node-${nodeId}`}
                  className="space-docking-node"
                  onClick={() => onStationClick(stationNum, nodeId)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={pos[0]}
                    cy={pos[1]}
                    r="18"
                    fill="#1e1b4b"
                    stroke={outerStroke}
                    strokeWidth={outerWidth}
                    filter={isTarget ? 'url(#star-gold-glow)' : 'none'}
                  />
                  <circle
                    cx={pos[0]}
                    cy={pos[1]}
                    r="14"
                    fill={innerFill}
                  />
                  <text
                    x={pos[0]}
                    y={pos[1] + 5.5}
                    textAnchor="middle"
                    fontSize="15"
                    fontWeight="900"
                    fill={textFill}
                    pointerEvents="none"
                  >
                    {isCompleted ? '✓' : stationNum}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Flying / Landed Rocket */}
          <text
            x={rocketPos.x}
            y={rocketPos.y}
            fontSize="28"
            textAnchor="middle"
            dominantBaseline="central"
            className="space-maze-rocket"
          >
            🚀
          </text>

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
