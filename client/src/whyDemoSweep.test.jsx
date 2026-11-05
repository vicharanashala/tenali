/**
 * Drags every "Why learn this?" demo through every value on its slider.
 *
 * At each value the big result line and the caption must not show NaN,
 * undefined or Infinity, and any plain sum written out in words
 * ("7 x 4 is 28", "28 + 3 = 31") must actually be right: a child reads
 * these as facts.
 */

import { describe, test, expect } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import topicMotivation from './data/topicMotivation.json';
import WhyDemo from './lib/whyDemos.jsx';

// A chain of numbers joined by + - x × −, e.g. "8 + 2 + 5" or "7 x 4".
const NUM = String.raw`-?\d[\d,]*(?:\.\d+)?`;
const CHAIN = String.raw`${NUM}(?:\s*(?:x|×|\+|−|-)\s*${NUM})*`;
// "<chain> = <chain>" or "<chain> is <chain>" with an operator on the left.
const EQUATION = new RegExp(String.raw`(${NUM}(?:\s*(?:x|×|\+|−|-)\s*${NUM})+)\s*(?:=|is)\s*(${CHAIN})`, 'g');

function evaluate(expr) {
  const js = expr.replace(/,/g, '').replace(/[x×]/g, '*').replace(/−/g, '-');
  if (!/^[-\d.*+\s]+$/.test(js)) return NaN;
  return Function(`"use strict"; return (${js});`)();
}

function badSums(text) {
  const bad = [];
  for (const [whole, lhs, rhs] of text.matchAll(EQUATION)) {
    const a = evaluate(lhs);
    const b = evaluate(rhs);
    if (Number.isNaN(a) || Number.isNaN(b)) continue;
    if (Math.abs(a - b) > 1e-9) bad.push(whole);
  }
  return bad;
}

function valuesOf(slider) {
  const min = Number(slider.min);
  const max = Number(slider.max);
  const step = Number(slider.step) || 1;
  const out = [];
  for (let v = min; v <= max + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
}

describe.each(Object.keys(topicMotivation))('%s demo', (id) => {
  test('reads correctly at every slider value', () => {
    const { container } = render(<WhyDemo kind={id} />);
    const slider = container.querySelector('input[type="range"]');
    const values = slider ? valuesOf(slider) : [null];
    for (const v of values) {
      if (slider) fireEvent.change(slider, { target: { value: String(v) } });
      const text = [...container.querySelectorAll('.why-demo-big, .why-demo-caption')].map((n) => n.textContent).join(' | ');
      expect(text, `${id} at ${v}: ${text}`).not.toMatch(/NaN|undefined|Infinity/);
      expect(badSums(text), `${id} at ${v}: ${text}`).toEqual([]);
    }
    cleanup();
  });
});

describe('multiply demo caption', () => {
  test('the two pieces add up to the total at every width', () => {
    const { container } = render(<WhyDemo kind="multiply" />);
    const slider = container.querySelector('input[type="range"]');
    for (const n of valuesOf(slider)) {
      fireEvent.change(slider, { target: { value: String(n) } });
      const caption = container.querySelector('.why-demo-caption').textContent;
      const pieces = [...caption.matchAll(/7 x (\d+) is (\d+)/g)].map((m) => {
        expect(Number(m[2]), caption).toBe(7 * Number(m[1]));
        return Number(m[1]);
      });
      expect(pieces.reduce((a, b) => a + b, 0), `${n}: ${caption}`).toBe(n);
      expect(caption, `${n}: ${caption}`).toContain(String(7 * n));
    }
    cleanup();
  });
});
