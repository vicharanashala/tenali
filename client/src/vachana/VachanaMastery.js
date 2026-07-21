// ─── Vachana Mastery Engine ───────────────────────────────────────────────────
// A reusable state machine for ZPD-based mastery progression/regression.
// Provides: constants, localStorage persistence, question bank management,
// and the useMastery React hook for exercises to consume.
//
// Based on:
//   - Vygotsky's Zone of Proximal Development (ZPD)
//   - Bloom's Mastery Learning (1968): ≥80% accuracy before advancing
//   - Newman's Error Hierarchy (1977): hierarchical reading → comprehension → transformation
// ────────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';

export const MASTERY_ADVANCE_THRESHOLD = 5;   // consecutive correct answers to level up
export const MASTERY_REGRESS_THRESHOLD = 3;   // consecutive wrong answers to level down
const MASTERY_STORAGE_KEY = 'vachana_mastery_progress';

/**
 * Load all mastery progress from localStorage.
 * Returns an object keyed by exerciseId.
 */
export function loadMasteryProgress() {
  try {
    const raw = localStorage.getItem(MASTERY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save all mastery progress to localStorage.
 */
export function saveMasteryProgress(progress) {
  try {
    localStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(progress));
  } catch { /* silent fail if localStorage is full */ }
}

/**
 * Get or initialize the mastery state for a single exercise.
 */
export function getMasteryState(progress, exerciseId) {
  if (!progress[exerciseId]) {
    progress[exerciseId] = {
      currentLevel: 1,
      correctStreak: 0,
      wrongStreak: 0,
      highestLevel: 1,
      mastered: false,
      totalAttempts: 0,
      totalCorrect: 0
    };
  }
  return progress[exerciseId];
}

/**
 * Process an answer and return { newState, event }.
 * event is one of: 'level_up', 'mastered', 'level_down', 'correct', 'wrong'
 */
export function processMasteryAnswer(state, isCorrect, maxLevel) {
  const next = { ...state };

  if (isCorrect === 'skip_explore') {
    next.currentLevel = Math.min(2, maxLevel);
    next.correctStreak = 0;
    next.wrongStreak = 0;
    return { newState: next, event: 'level_up' };
  }

  next.totalAttempts++;
  if (isCorrect) next.totalCorrect++;

  let event = isCorrect ? 'correct' : 'wrong';

  if (isCorrect) {
    next.wrongStreak = 0;
    next.correctStreak++;

    if (next.correctStreak >= MASTERY_ADVANCE_THRESHOLD) {
      if (next.currentLevel < maxLevel) {
        next.currentLevel++;
        next.highestLevel = Math.max(next.highestLevel, next.currentLevel);
        next.correctStreak = 0;
        event = 'level_up';
      } else if (!next.mastered) {
        next.mastered = true;
        next.correctStreak = 0;
        event = 'mastered';
      }
    }
  } else {
    next.correctStreak = 0;
    next.wrongStreak++;

    if (next.wrongStreak >= MASTERY_REGRESS_THRESHOLD) {
      if (next.currentLevel > 1) {
        next.currentLevel--;
        next.wrongStreak = 0;
        event = 'level_down';
      } else {
        next.wrongStreak = 0;
        // Stay at level 1, just reset streak
      }
    }
  }

  return { newState: next, event };
}

/**
 * Custom React hook: useMastery(exerciseId, maxLevel)
 *
 * Returns: { state, handleAnswer, resetExercise, toastMsg, clearToast }
 *
 * Usage inside an exercise:
 *   const mastery = useMastery('order', 5);
 *   // When student submits an answer:
 *   mastery.handleAnswer(isCorrect);
 *   // Read current level: mastery.state.currentLevel
 *   // Show toast: mastery.toastMsg
 */
export function useMastery(exerciseId, maxLevel) {
  const [state, setState] = useState(() => {
    const progress = loadMasteryProgress();
    return getMasteryState(progress, exerciseId);
  });
  const [toastMsg, setToastMsg] = useState(null);

  const handleAnswer = (isCorrect) => {
    setState(prev => {
      const { newState, event } = processMasteryAnswer(prev, isCorrect, maxLevel);

      // Persist to localStorage
      const progress = loadMasteryProgress();
      progress[exerciseId] = newState;
      saveMasteryProgress(progress);

      // Set toast message based on event
      if (event === 'level_up') {
        setToastMsg({ type: 'up', text: `⬆️ Level Up! Welcome to Level ${newState.currentLevel}` });
      } else if (event === 'mastered') {
        setToastMsg({ type: 'mastered', text: "🏆 Mastery achieved! You've conquered this exercise!" });
      } else if (event === 'level_down') {
        setToastMsg({ type: 'down', text: `Let's go back and strengthen the basics. Level ${newState.currentLevel} 💪` });
      }

      return newState;
    });
  };

  const clearToast = () => setToastMsg(null);

  const resetExercise = () => {
    const fresh = {
      currentLevel: 1, correctStreak: 0, wrongStreak: 0,
      highestLevel: 1, mastered: false, totalAttempts: 0, totalCorrect: 0
    };
    const progress = loadMasteryProgress();
    progress[exerciseId] = fresh;
    saveMasteryProgress(progress);
    setState(fresh);
    setToastMsg(null);
  };

  return { state, handleAnswer, resetExercise, toastMsg, clearToast };
}

/**
 * Get a random question from a question bank for a specific level.
 * Avoids repeating the last question if possible.
 */
export function getNextQuestion(bank, level, lastQuestionId) {
  const levelKey = String(level);
  const questions = bank[levelKey];
  if (!questions || questions.length === 0) return null;
  if (questions.length === 1) return questions[0];

  const candidates = lastQuestionId
    ? questions.filter(q => q.id !== lastQuestionId)
    : questions;

  const pool = candidates.length > 0 ? candidates : questions;
  return pool[Math.floor(Math.random() * pool.length)];
}


