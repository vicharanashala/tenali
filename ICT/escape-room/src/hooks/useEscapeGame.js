import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ESCAPES, getEscapeById, getNextDifficultyEscape } from '../data/escapes.js';
import { generateArithmeticProblem } from '../generators/arithmeticGenerator.js';
import { generateLinearEqProblem } from '../generators/linearEqGenerator.js';
import { generateQuadraticProblem } from '../generators/quadraticGenerator.js';

const GENERATOR_REGISTRY = {
  arithmeticGenerator: generateArithmeticProblem,
  linearEqGenerator: generateLinearEqProblem,
  quadraticGenerator: generateQuadraticProblem,
};

/**
 * Replaces {{variable}} tokens in a hint template using the generated problem variables.
 */
export function interpolateHint(template, variables = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      return String(variables[key]);
    }
    return `{{${key}}}`;
  });
}

/**
 * Locked star calculation:
 * - 3 stars: 0 hints & 1st try
 * - 2 stars: 1 hint OR 2-3 tries (with <= 1 hint)
 * - 1 star:  2+ hints OR 4+ tries
 */
export function calculateRoomStars(attempts, hintsRevealed) {
  if (hintsRevealed >= 2 || attempts >= 4) return 1;
  if (hintsRevealed === 1 || attempts >= 2) return 2;
  return 3;
}

/**
 * Formats seconds into mm:ss for informational display.
 */
export function formatElapsedTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Generates fresh algorithmic problems and interpolated hints for every room in an escape story.
 */
export function buildFreshRoomsState(escapeStory) {
  return escapeStory.rooms.map((room) => {
    const { generator, subtype, config } = room.problemTemplate;
    const generatorFn = GENERATOR_REGISTRY[generator];
    if (!generatorFn) {
      throw new Error(`Unknown generator "${generator}" in room "${room.id}"`);
    }

    const problem = generatorFn(subtype, config);
    const interpolatedHints = room.hints.map((hintTemplate) =>
      interpolateHint(hintTemplate, problem.variables)
    );

    return {
      roomConfig: room,
      problem,
      hints: interpolatedHints,
      attempts: 0,
      wrongAttempts: 0,
      hintsRevealed: 0,
      autoHintTriggered: false,
      solved: false,
      starsEarned: 0,
    };
  });
}

/**
 * Main Escape Room game state hook.
 * Session-only (no localStorage / no backend API) for sandboxed iframe safety.
 * Timer architecture tracks elapsed seconds cleanly and is ready for optional future countdown mode.
 */
export function useEscapeGame(timerConfig = { mode: 'elapsed', limitSeconds: null }) {
  const [screen, setScreen] = useState('selection'); // 'selection' | 'playing' | 'completed'
  const [activeEscapeId, setActiveEscapeId] = useState(null);
  const [roomsState, setRoomsState] = useState([]);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [shakeTrigger, setShakeTrigger] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [roomUnlockedModal, setRoomUnlockedModal] = useState(null);

  const shakeTimeoutRef = useRef(null);

  const activeEscape = useMemo(
    () => (activeEscapeId ? getEscapeById(activeEscapeId) : null),
    [activeEscapeId]
  );

  const nextDifficultyEscape = useMemo(
    () => (activeEscapeId ? getNextDifficultyEscape(activeEscapeId) : null),
    [activeEscapeId]
  );

  const currentRoom = roomsState[currentRoomIndex] || null;

  // Informational elapsed-time clock (pauses on completion or selection screen)
  useEffect(() => {
    if (screen !== 'playing' || roomUnlockedModal) return undefined;

    const intervalId = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [screen, roomUnlockedModal]);

  // Clean up shake timer on unmount
  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, []);

  const triggerShake = useCallback(() => {
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }
    setShakeTrigger(false);
    // Double-frame / micro-delay ensures CSS shake animation restarts on consecutive wrong answers
    shakeTimeoutRef.current = setTimeout(() => {
      setShakeTrigger(true);
      shakeTimeoutRef.current = setTimeout(() => {
        setShakeTrigger(false);
      }, 500);
    }, 16);
  }, []);

  const startEscape = useCallback((escapeId) => {
    const story = getEscapeById(escapeId);
    if (!story) return;

    setActiveEscapeId(story.id);
    setRoomsState(buildFreshRoomsState(story));
    setCurrentRoomIndex(0);
    setElapsedSeconds(0);
    setShakeTrigger(false);
    setLastFeedback(null);
    setRoomUnlockedModal(null);
    setScreen('playing');
  }, []);

  const playAgain = useCallback(() => {
    if (!activeEscapeId) return;
    startEscape(activeEscapeId);
  }, [activeEscapeId, startEscape]);

  const tryNextDifficulty = useCallback(() => {
    if (!nextDifficultyEscape) return;
    startEscape(nextDifficultyEscape.id);
  }, [nextDifficultyEscape, startEscape]);

  const exitEscape = useCallback(() => {
    setScreen('selection');
    setActiveEscapeId(null);
    setRoomsState([]);
    setCurrentRoomIndex(0);
    setElapsedSeconds(0);
    setShakeTrigger(false);
    setLastFeedback(null);
    setRoomUnlockedModal(null);
  }, []);

  const revealNextHint = useCallback(() => {
    if (screen !== 'playing' || roomUnlockedModal) return;

    setRoomsState((prev) =>
      prev.map((room, idx) => {
        if (idx !== currentRoomIndex || room.solved) return room;
        const nextCount = Math.min(3, room.hintsRevealed + 1);
        return { ...room, hintsRevealed: nextCount };
      })
    );
  }, [screen, roomUnlockedModal, currentRoomIndex]);

  const submitCode = useCallback(
    (rawInput) => {
      if (screen !== 'playing' || !currentRoom || currentRoom.solved || roomUnlockedModal) {
        return { correct: false };
      }

      const normalized = String(rawInput ?? '')
        .trim()
        .replace(/−/g, '-');

      if (normalized === '' || normalized === '-') {
        triggerShake();
        setLastFeedback({
          type: 'error',
          message: 'Please enter a numeric code before trying the lock.',
        });
        return { correct: false };
      }

      const parsed = Number(normalized);
      if (!Number.isInteger(parsed)) {
        triggerShake();
        setLastFeedback({
          type: 'error',
          message: 'Lock codes must be whole integers (use ± for negative numbers).',
        });
        return { correct: false };
      }

      const nextAttempts = currentRoom.attempts + 1;
      const expectedAnswer = currentRoom.problem.answer;

      if (parsed === expectedAnswer) {
        const starsEarned = calculateRoomStars(nextAttempts, currentRoom.hintsRevealed);
        const isLastRoom = currentRoomIndex >= roomsState.length - 1;

        setRoomsState((prev) =>
          prev.map((room, idx) =>
            idx === currentRoomIndex
              ? {
                  ...room,
                  attempts: nextAttempts,
                  solved: true,
                  starsEarned,
                }
              : room
          )
        );

        setLastFeedback(null);
        setRoomUnlockedModal({
          roomIndex: currentRoomIndex,
          roomNumber: currentRoom.roomConfig.roomNumber,
          roomName: currentRoom.roomConfig.name,
          roomEmoji: currentRoom.roomConfig.emoji,
          nextRoomName: isLastRoom
            ? null
            : roomsState[currentRoomIndex + 1].roomConfig.name,
          nextRoomNumber: isLastRoom
            ? null
            : roomsState[currentRoomIndex + 1].roomConfig.roomNumber,
          starsEarned,
          hintsRevealed: currentRoom.hintsRevealed,
          attempts: nextAttempts,
          answer: expectedAnswer,
          extraneous: currentRoom.problem.variables?.extraneous ?? null,
          steps: currentRoom.problem.steps,
          isLastRoom,
        });

        return { correct: true, starsEarned };
      }

      // Wrong answer: shake, increment attempts, auto-reveal Hint 1 on 3rd wrong attempt
      const nextWrongAttempts = currentRoom.wrongAttempts + 1;
      const shouldAutoRevealHint1 =
        nextWrongAttempts >= 3 && currentRoom.hintsRevealed === 0;

      const isExtraneousGuess =
        currentRoom.problem.subtype === 'radical-extraneous' &&
        parsed === currentRoom.problem.variables?.extraneous;

      setRoomsState((prev) =>
        prev.map((room, idx) => {
          if (idx !== currentRoomIndex) return room;
          return {
            ...room,
            attempts: nextAttempts,
            wrongAttempts: nextWrongAttempts,
            hintsRevealed: shouldAutoRevealHint1 ? 1 : room.hintsRevealed,
            autoHintTriggered: room.autoHintTriggered || shouldAutoRevealHint1,
          };
        })
      );

      triggerShake();

      if (isExtraneousGuess) {
        setLastFeedback({
          type: 'error',
          message: `Incorrect code! x = ${parsed} is an extraneous root—plug it back into the original equation to verify.`,
          attemptNumber: nextAttempts,
          autoHintJustTriggered: shouldAutoRevealHint1,
        });
      } else if (shouldAutoRevealHint1) {
        setLastFeedback({
          type: 'auto-hint',
          message: '3 wrong attempts — Hint 1 has been automatically revealed below!',
          attemptNumber: nextAttempts,
          autoHintJustTriggered: true,
        });
      } else {
        setLastFeedback({
          type: 'error',
          message: `Incorrect code! Double-check your steps and try again. (Attempt ${nextAttempts})`,
          attemptNumber: nextAttempts,
          autoHintJustTriggered: false,
        });
      }

      return { correct: false, autoHintJustTriggered: shouldAutoRevealHint1 };
    },
    [screen, currentRoom, currentRoomIndex, roomsState, roomUnlockedModal, triggerShake]
  );

  // Strict no-skip advancement: only callable after the current room is solved
  const proceedToNextRoom = useCallback(() => {
    if (!roomUnlockedModal) return;

    const isLastRoom = roomUnlockedModal.isLastRoom;
    setRoomUnlockedModal(null);
    setLastFeedback(null);

    if (isLastRoom) {
      setScreen('completed');
    } else {
      setCurrentRoomIndex((prev) => Math.min(roomsState.length - 1, prev + 1));
    }
  }, [roomUnlockedModal, roomsState.length]);

  const totalStars = useMemo(
    () => roomsState.reduce((sum, room) => sum + room.starsEarned, 0),
    [roomsState]
  );

  const solvedCount = useMemo(
    () => roomsState.filter((room) => room.solved).length,
    [roomsState]
  );

  const maxStars = roomsState.length * 3;
  const formattedTime = formatElapsedTime(elapsedSeconds);

  return {
    escapes: ESCAPES,
    screen,
    activeEscape,
    nextDifficultyEscape,
    roomsState,
    currentRoomIndex,
    currentRoom,
    solvedCount,
    totalStars,
    maxStars,
    elapsedSeconds,
    formattedTime,
    timerConfig,
    shakeTrigger,
    lastFeedback,
    roomUnlockedModal,
    startEscape,
    submitCode,
    revealNextHint,
    proceedToNextRoom,
    playAgain,
    tryNextDifficulty,
    exitEscape,
  };
}

export default useEscapeGame;