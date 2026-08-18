import { useState, useEffect, useRef } from 'react';

/**
 * useTimer Hook
 * Supports three modes driven by the sessionGoal:
 *   'speed'    — countdown from limitSeconds → 0; fires onTimeout when it hits 0
 *   'perfect'  — hidden (elapsed kept internally but not shown by QuizLayout)
 *   other      — count-up stopwatch (original behaviour)
 */
export function useTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [mode, setMode] = useState('standard');
  const startRef = useRef(Date.now());
  const intervalRef = useRef(null);
  const limitRef = useRef(0);
  const onTORef = useRef(null);
  const firedRef = useRef(false);

  const start = (goal = 'standard', onTimeout = null, limitSeconds = 15) => {
    clearInterval(intervalRef.current);
    let initialValue = 0;
    let currentGoal = goal;

    if (typeof goal === 'number') {
      initialValue = goal;
      currentGoal = 'standard';
    }

    startRef.current = Date.now() - (initialValue * 1000);
    limitRef.current = limitSeconds;
    onTORef.current = onTimeout;
    firedRef.current = false;
    setMode(currentGoal);
    setElapsed(initialValue);
    setRemaining(currentGoal === 'speed' ? limitSeconds : 0);

    intervalRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - startRef.current) / 1000);
      setElapsed(secs);
      if (currentGoal === 'speed') {
        const left = Math.max(0, limitRef.current - secs);
        setRemaining(left);
        if (left === 0 && !firedRef.current) {
          firedRef.current = true;
          clearInterval(intervalRef.current);
          if (typeof onTORef.current === 'function') onTORef.current();
        }
      }
    }, 250);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    firedRef.current = true;
    return Math.floor((Date.now() - startRef.current) / 1000);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    firedRef.current = true;
    setElapsed(0);
    setRemaining(0);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return { elapsed, remaining, mode, start, stop, reset };
}
