/**
 * Focus Mode study timer (lib/focusTimer.js).
 *
 * The timer stores an end time, not a countdown, and several screens may
 * tick it at once (the board and the in-quiz bar), so the important
 * properties are: it finishes exactly once, it counts a session exactly
 * once, it survives junk in storage, and today's count resets tomorrow.
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  readTimer, startFocus, startBreak, stopTimer, remainingMs, completeIfDue,
  sessionsToday, formatClock, FOCUS_LENGTHS,
} from './lib/focusTimer';

function fakeWindow() {
  const store = new Map();
  const events = [];
  return {
    events,
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    },
    dispatchEvent: (e) => events.push(e),
  };
}

const T0 = new Date(2026, 9, 7, 10, 0, 0).getTime(); // 7 Oct 2026, 10:00 local
const MIN = 60000;

beforeEach(() => {
  globalThis.window = fakeWindow();
  globalThis.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init?.detail; } };
});
afterEach(() => { delete globalThis.window; });

describe('starting and counting down', () => {
  test('idle by default', () => {
    expect(readTimer()).toBeNull();
    expect(remainingMs(readTimer(), T0)).toBe(0);
  });

  test('a 25 minute session counts down from its end time', () => {
    startFocus(25, T0);
    const t = readTimer();
    expect(t).toEqual({ phase: 'focus', endsAt: T0 + 25 * MIN, minutes: 25 });
    expect(remainingMs(t, T0 + 10 * MIN)).toBe(15 * MIN);
  });

  test('an unsupported length falls back to 25 minutes', () => {
    startFocus(999, T0);
    expect(readTimer().minutes).toBe(25);
  });

  test('every offered length is accepted as is', () => {
    FOCUS_LENGTHS.forEach((m) => {
      startFocus(m, T0);
      expect(readTimer().minutes).toBe(m);
    });
  });

  test('changes are broadcast so other screens update', () => {
    startFocus(15, T0);
    expect(window.events.at(-1).type).toBe('tenali-focus-timer-change');
  });
});

describe('finishing', () => {
  test('nothing happens before the end time', () => {
    startFocus(15, T0);
    expect(completeIfDue(T0 + 14 * MIN).phase).toBe('focus');
    expect(sessionsToday(T0)).toBe(0);
  });

  test('a finished session waits for a break and counts once', () => {
    startFocus(15, T0);
    expect(completeIfDue(T0 + 15 * MIN).phase).toBe('focus-done');
    // A second screen ticking at the same moment must not double count.
    completeIfDue(T0 + 15 * MIN + 500);
    expect(readTimer().phase).toBe('focus-done');
    expect(sessionsToday(T0)).toBe(1);
  });

  test('a break runs for five minutes and then waits', () => {
    startBreak(T0);
    expect(remainingMs(readTimer(), T0)).toBe(5 * MIN);
    expect(completeIfDue(T0 + 5 * MIN).phase).toBe('break-done');
    expect(sessionsToday(T0)).toBe(0); // breaks are not sessions
  });

  test('stopping returns to idle', () => {
    startFocus(25, T0);
    stopTimer();
    expect(readTimer()).toBeNull();
  });
});

describe('sessions today', () => {
  test('counts up through the day and resets the next day', () => {
    startFocus(15, T0);
    completeIfDue(T0 + 15 * MIN);
    startFocus(15, T0 + 30 * MIN);
    completeIfDue(T0 + 45 * MIN);
    expect(sessionsToday(T0 + 46 * MIN)).toBe(2);
    expect(sessionsToday(T0 + 24 * 60 * MIN)).toBe(0);
  });
});

describe('bad stored data', () => {
  test('junk in storage reads as idle instead of throwing', () => {
    window.localStorage.setItem('tenali-focus-timer', '{not json');
    expect(readTimer()).toBeNull();
    window.localStorage.setItem('tenali-focus-timer', JSON.stringify({ phase: 'focus', endsAt: 'soon' }));
    expect(readTimer()).toBeNull();
    window.localStorage.setItem('tenali-focus-sessions', 'garbage');
    expect(sessionsToday(T0)).toBe(0);
  });

  test('storage that throws does not break starting a session', () => {
    window.localStorage.setItem = () => { throw new Error('quota'); };
    expect(() => startFocus(25, T0)).not.toThrow();
  });
});

describe('formatClock', () => {
  test('pads seconds and rounds up partial seconds', () => {
    expect(formatClock(25 * MIN)).toBe('25:00');
    expect(formatClock(61000)).toBe('1:01');
    expect(formatClock(500)).toBe('0:01');
    expect(formatClock(0)).toBe('0:00');
  });
});
