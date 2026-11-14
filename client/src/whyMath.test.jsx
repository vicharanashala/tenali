/**
 * "Why Mathematics?" content checks.
 *
 * Each open draws four beats at random from the pool, with a random
 * starting value, so a broken beat or a NaN at one end of a slider can
 * hide for weeks. These tests walk every beat across its whole range
 * instead, and check the guess-then-reveal flow is wired up correctly:
 * the right answer is one of the choices, the aim is reachable, and the
 * slider never starts already past it.
 */

import { describe, test, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BEATS, HOOKS, closeLine, humanTime } from './lib/whyMathBeats.jsx';

const words = (s) => (s.match(/[A-Za-z0-9'²³√₹%×÷]+/g) || []).length;
const sentences = (s) => s.trim().split(/(?<=[.!?])\s+(?=[A-Z0-9₹√])/).filter(Boolean);

function valuesOf(beat) {
  const step = beat.step || 1;
  const out = [];
  for (let v = beat.min; v <= beat.max + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
}

describe('the beat pool', () => {
  test('has enough beats for four fresh surprises', () => {
    expect(BEATS.length).toBeGreaterThanOrEqual(8);
  });

  test('keys and emojis are unique', () => {
    expect(new Set(BEATS.map((b) => b.key)).size).toBe(BEATS.length);
    expect(new Set(BEATS.map((b) => b.emoji)).size).toBe(BEATS.length);
  });
});

describe.each(BEATS.map((b) => [b.key, b]))('%s', (_key, beat) => {
  test('offers three different guesses, one of them right', () => {
    expect(beat.guess.options).toHaveLength(3);
    expect(new Set(beat.guess.options).size).toBe(3);
    expect(beat.guess.options).toContain(beat.guess.answer);
  });

  test('starts inside the range, below the aim, and the aim is reachable', () => {
    for (let i = 0; i < 25; i++) {
      const start = beat.initial();
      expect(start).toBeGreaterThanOrEqual(beat.min);
      expect(start).toBeLessThanOrEqual(beat.max);
      expect(start, 'would reveal the answer before any dragging').toBeLessThan(beat.aim);
    }
    expect(valuesOf(beat)).toContain(beat.aim);
  });

  test('every slider value draws a picture with no NaN, Infinity or undefined', () => {
    valuesOf(beat).forEach((v) => {
      const html = renderToStaticMarkup(beat.visual(v));
      expect(html, `at ${v}`).toContain('<svg');
      expect(html, `NaN at ${v}`).not.toMatch(/NaN/);
      expect(html, `Infinity at ${v}`).not.toMatch(/Infinity/);
      expect(html, `undefined at ${v}`).not.toMatch(/undefined/);
    });
  });

  test('every slider value gives a readable result line', () => {
    valuesOf(beat).forEach((v) => {
      const { big } = beat.read(v);
      expect(typeof big, `at ${v}`).toBe('string');
      expect(big.length, `at ${v}`).toBeGreaterThan(3);
      expect(big, `at ${v}`).not.toMatch(/NaN|Infinity|undefined|e\+/);
    });
  });

  test('copy is short and child-friendly', () => {
    expect(words(beat.question), beat.question).toBeLessThanOrEqual(35);
    expect(words(beat.reveal), beat.reveal).toBeLessThanOrEqual(12);
    expect(words(beat.why), beat.why).toBeLessThanOrEqual(45);
    sentences(beat.why).forEach((s) => expect(words(s), s).toBeLessThanOrEqual(20));
    [beat.question, beat.reveal, beat.why, ...beat.guess.options].forEach((t) => {
      expect(t).not.toMatch(/[—–]/);
    });
  });
});

describe('hooks and closing lines', () => {
  test('no hook promises a different number of surprises than four', () => {
    HOOKS.forEach((h) => {
      expect(h).not.toMatch(/\b(six|five|three|6|5|3)\b/i);
    });
  });

  test('closing line fits every score', () => {
    for (let right = 0; right <= 4; right++) {
      const line = closeLine(right, 4);
      expect(typeof line).toBe('string');
      expect(line.length).toBeGreaterThan(10);
    }
  });
});

describe('humanTime', () => {
  test('never shows "0 seconds" for a tiny time', () => {
    expect(humanTime(0.01)).toBe('less than a second');
  });
  test('reads the 4-digit PIN case as 10 seconds', () => {
    expect(humanTime(10)).toBe('10 seconds');
  });
  test('reads a 12-digit code as about 32 years', () => {
    expect(humanTime(1e9)).toBe('32 years');
  });
});
