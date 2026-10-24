/**
 * Render smoke test for all 67 "Why learn this?" demos.
 *
 * Every topic now ships an interactive SVG visual, hand written per topic.
 * Lint and the production build only prove those files parse. They say
 * nothing about a demo that divides by zero, hands NaN to an SVG path, or
 * reads a property off undefined, and a crash inside one of these takes
 * down the whole quiz screen it sits on.
 *
 * So this renders each demo to a string at its initial slider value and
 * fails loudly if the markup comes back empty or with NaN in it. Rendering
 * to string needs no DOM and no testing library, which keeps it runnable in
 * this checkout.
 *
 * What it does not cover: dragging. Exercising the full slider range needs
 * a real DOM and @testing-library/react, neither of which is installed
 * here, so the maths at the extremes of each range is still only checked by
 * hand.
 */

import { describe, test, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import topicMotivation from './data/topicMotivation.json';
import WhyDemo from './lib/whyDemos.jsx';

const topics = Object.keys(topicMotivation);

describe('every Why demo renders', () => {
  test('there are demos for all 67 topics', () => {
    expect(topics.length).toBe(67);
  });

  test.each(topics)('%s renders without throwing', (id) => {
    expect(() => renderToStaticMarkup(<WhyDemo kind={id} />)).not.toThrow();
  });

  test.each(topics)('%s produces actual SVG, not an empty shell', (id) => {
    const html = renderToStaticMarkup(<WhyDemo kind={id} />);
    expect(html, `${id} rendered nothing`).toContain('why-demo');
    expect(html, `${id} has no visual`).toContain('<svg');
    expect(html, `${id} has no slider`).toContain('type="range"');
  });

  test.each(topics)('%s emits no NaN, Infinity or undefined', (id) => {
    const html = renderToStaticMarkup(<WhyDemo kind={id} />);
    expect(html, `${id} leaked NaN into the markup`).not.toMatch(/NaN/);
    expect(html, `${id} leaked Infinity`).not.toMatch(/Infinity/);
    expect(html, `${id} leaked undefined`).not.toMatch(/undefined/);
  });

  test('an unknown kind renders nothing instead of throwing', () => {
    expect(renderToStaticMarkup(<WhyDemo kind="not-a-topic" />)).toBe('');
    expect(renderToStaticMarkup(<WhyDemo />)).toBe('');
  });
});
