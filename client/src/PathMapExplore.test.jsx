/**
 * Tests for the Learning Path's Explore view (PathMapExplore.jsx).
 *
 * 1. The layout covers every maths topic and always reads left to right.
 * 2. Progress comes from /api/mastery when signed in, and falls back to
 *    PathMap's own "done" topics when signed out or when the read fails,
 *    and says which one it is showing.
 * 3. "Make this my goal" hands the goal to PathMap instead of keeping its own.
 */

import { describe, test, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import graphData from '../../graph/graph-data.json';
import { pmFetchGraphData, pmNodes } from './pathMapHelpers';
import PathMapExplore from './PathMapExplore';
import { buildLayout, completedTopics } from './lib/pathMapExplore';

const okJson = (body) => ({ ok: true, json: async () => body });

beforeAll(async () => {
  // jsdom has no layout engine, so scrolling is a no-op here.
  Element.prototype.scrollTo = () => {};
  globalThis.fetch = vi.fn().mockResolvedValue(okJson(graphData));
  await pmFetchGraphData();
});

beforeEach(() => {
  // Skip the first-visit nudge so it does not cover the card.
  localStorage.setItem('tenali-graph-tour-seen', '1');
});

afterEach(() => {
  vi.restoreAllMocks();
});

const renderExplore = (props = {}) => render(
  <PathMapExplore
    known={new Set()}
    goalId={null}
    onSetGoal={vi.fn()}
    onShowGoalView={vi.fn()}
    onPractise={vi.fn()}
    onBack={vi.fn()}
    {...props}
  />
);

describe('layout', () => {
  test('places every maths topic from graph-data.json', () => {
    const layout = buildLayout();
    const maths = pmNodes.filter((n) => n.cat !== 'other').map((n) => n.id);
    expect([...layout.ids].sort()).toEqual([...maths].sort());
  });

  test('every edge runs left to right, prerequisite first', () => {
    const layout = buildLayout();
    layout.edges.forEach((e) => {
      expect(layout.pos[e.src].depth, `${e.src} -> ${e.tgt}`).toBeLessThan(layout.pos[e.tgt].depth);
    });
  });
});

describe('completedTopics', () => {
  const ids = ['basicarith', 'addition', 'ratio'];

  test('server mastery wins when there is one', () => {
    const server = new Set(['ratio']);
    expect(completedTopics({ serverMastery: server, known: new Set(['addition']), ids })).toBe(server);
  });

  test('without server mastery, uses the topics marked known', () => {
    const done = completedTopics({ serverMastery: null, known: new Set(['addition']), ids });
    expect([...done]).toEqual(['addition']);
  });
});

describe('progress source', () => {
  test('signed out: uses topics marked known, and says so', async () => {
    renderExplore({ known: new Set(['basicarith']) });
    expect(await screen.findByText(/Showing topics you marked as known/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Basic Arithmetic\. ✓ Done/ })).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalledWith(expect.stringContaining('/api/mastery'), expect.anything());
  });

  test('signed in: uses /api/mastery', async () => {
    localStorage.setItem('tenali-auth-token', 'fake-token');
    globalThis.fetch = vi.fn().mockResolvedValue(okJson({ mastery: [{ topicId: 'addition', isMastered: true }] }));
    renderExplore({ known: new Set(['basicarith']) });
    expect(await screen.findByText(/1\/\d+ mastered/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Addition\. ✓ Done/ })).toBeInTheDocument();
    // A topic only marked known locally is not counted once real data is in.
    expect(screen.queryByRole('button', { name: /^Basic Arithmetic\. ✓ Done/ })).not.toBeInTheDocument();
  });

  test('a failed read falls back to topics marked known, says so, and offers a retry', async () => {
    localStorage.setItem('tenali-auth-token', 'fake-token');
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    renderExplore({ known: new Set(['basicarith']) });
    expect(await screen.findByText(/Couldn't load your progress/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Basic Arithmetic\. ✓ Done/ })).toBeInTheDocument();
  });
});

describe('topic card', () => {
  test('"Make this my goal" sets the PathMap goal and returns to the Goal view', async () => {
    const onSetGoal = vi.fn();
    const onShowGoalView = vi.fn();
    renderExplore({ onSetGoal, onShowGoalView });
    fireEvent.click(await screen.findByRole('button', { name: /^Ratio\./ }));
    fireEvent.click(screen.getByRole('button', { name: /Make this my goal/ }));
    expect(onSetGoal).toHaveBeenCalledWith('ratio');
    expect(onShowGoalView).toHaveBeenCalled();
  });

  test('the current goal is labelled on the map', async () => {
    renderExplore({ goalId: 'ratio' });
    await waitFor(() => expect(screen.getByRole('button', { name: /^Ratio\. 🎯 Your goal/ })).toBeInTheDocument());
  });

  test('"Practise now" opens that topic', async () => {
    const onPractise = vi.fn();
    renderExplore({ onPractise });
    fireEvent.click(await screen.findByRole('button', { name: /^Ratio\./ }));
    fireEvent.click(screen.getByRole('button', { name: /Practise now/ }));
    expect(onPractise).toHaveBeenCalledWith('ratio');
  });
});
