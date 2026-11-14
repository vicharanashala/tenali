/**
 * Component tests for Focus Mode.
 *
 * 1. With localStorage throwing (Safari private browsing, a full quota) the
 *    Focus switch and the study timer still work for the session.
 * 2. FocusSessionBar: position, Next, the last topic, off-list topics.
 * 3. computeGoalPath: prerequisites always come before what they unlock.
 * 4. FocusHome: picker with no topics, board with topics, refresh on sign-in.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

const realStorage = window.localStorage;
const throwingStorage = {
  getItem: () => { throw new Error('SecurityError'); },
  setItem: () => { throw new Error('QuotaExceededError'); },
  removeItem: () => { throw new Error('SecurityError'); },
  // Only for test/setup.js, which clears storage after every test.
  clear: () => {},
};
const useStorage = (s) => Object.defineProperty(window, 'localStorage', { value: s, configurable: true, writable: true });

afterEach(() => {
  useStorage(realStorage);
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('localStorage unavailable', () => {
  beforeEach(() => { useStorage(throwingStorage); });

  test('the Focus switch still switches, instead of springing back to Explore', async () => {
    const { default: StudyModeToggle } = await import('./components/StudyModeToggle.jsx');
    render(<StudyModeToggle />);
    fireEvent.click(screen.getByRole('radio', { name: /Focus/ }));
    expect(screen.getByRole('radio', { name: /Focus/ })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('radio', { name: /Explore/ }));
    expect(screen.getByRole('radio', { name: /Explore/ })).toHaveAttribute('aria-checked', 'true');
  });

  test('the study timer still starts and counts down', async () => {
    const { useFocusTimer, formatClock } = await import('./lib/focusTimer.js');
    function Probe() {
      const { running, remaining, startFocus } = useFocusTimer();
      return (
        <div>
          <button type="button" onClick={() => startFocus(25)}>start</button>
          <span data-testid="state">{running ? `running ${formatClock(remaining)}` : 'idle'}</span>
        </div>
      );
    }
    render(<Probe />);
    expect(screen.getByTestId('state')).toHaveTextContent('idle');
    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    expect(screen.getByTestId('state').textContent).toMatch(/^running (25:00|24:5\d)$/);
  });
});

describe('FocusSessionBar', () => {
  const renderBar = async (mode, topics, props = {}) => {
    window.localStorage.setItem('tenali-study-mode', 'focus');
    window.localStorage.setItem('tenali-focus-topics', JSON.stringify(topics));
    const { default: FocusSessionBar } = await import('./components/FocusSessionBar.jsx');
    const onGo = vi.fn();
    const onBoard = vi.fn();
    render(<FocusSessionBar mode={mode} onGo={onGo} onBoard={onBoard} {...props} />);
    return { onGo, onBoard };
  };

  test('shows the position and goes to the next topic', async () => {
    const { onGo } = await renderBar('ratio', ['ratio', 'percent']);
    expect(screen.getByRole('button', { name: /1 of 2/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Next/ }));
    expect(onGo).toHaveBeenCalledWith('percent');
  });

  test('the last topic has no Next, and says so', async () => {
    await renderBar('percent', ['ratio', 'percent']);
    expect(screen.getByRole('button', { name: /2 of 2/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Next/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Last one!/)).toBeInTheDocument();
  });

  test('a topic not on the list offers the way back to the list', async () => {
    const { onBoard } = await renderBar('basicarith', ['ratio', 'percent']);
    expect(screen.queryByRole('button', { name: /Next/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /My list/ }));
    expect(onBoard).toHaveBeenCalled();
  });
});

describe('computeGoalPath', () => {
  test('every prerequisite comes before the topics that need it', async () => {
    const { computeGoalPath, getPrerequisites, getAllTopicKeys } = await import('./lib/prerequisiteGraph.js');
    for (const goal of getAllTopicKeys()) {
      const { steps } = computeGoalPath(goal, new Set());
      const at = Object.fromEntries(steps.map((s, i) => [s.id, i]));
      expect(steps[steps.length - 1].id === goal || at[goal] !== undefined, goal).toBe(true);
      for (const s of steps) {
        for (const p of getPrerequisites(s.id)) {
          if (at[p] !== undefined) expect(at[p], `${goal}: ${p} before ${s.id}`).toBeLessThan(at[s.id]);
        }
      }
    }
  });

  test('mastered steps are marked and not counted as remaining', async () => {
    const { computeGoalPath } = await import('./lib/prerequisiteGraph.js');
    const all = computeGoalPath('ratio', new Set());
    const done = computeGoalPath('ratio', new Set(['basicarith']));
    expect(done.remaining).toBe(all.remaining - 1);
    expect(done.steps.find((s) => s.id === 'basicarith').mastered).toBe(true);
    expect(computeGoalPath('basicarith', new Set(['basicarith'])).alreadyThere).toBe(true);
  });
});

describe('FocusHome', () => {
  const renderHome = async (topics) => {
    window.localStorage.setItem('tenali-study-mode', 'focus');
    if (topics) window.localStorage.setItem('tenali-focus-topics', JSON.stringify(topics));
    const { default: FocusHome } = await import('./components/FocusHome.jsx');
    const onSelect = vi.fn();
    render(<FocusHome onSelect={onSelect} />);
    return { onSelect };
  };

  test('with no topics it shows the picker', async () => {
    await renderHome(null);
    expect(screen.getByText('What are you revising?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pick at least one topic' })).toBeDisabled();
  });

  test('with topics it shows the board, and a topic card opens that topic', async () => {
    const { onSelect } = await renderHome(['ratio', 'percent']);
    expect(screen.getByText('Your revision list')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Ratio/ }));
    expect(onSelect).toHaveBeenCalledWith('ratio');
  });

  test('signing in reloads progress without a reload of the page', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ mastery: [] }) }));
    await renderHome(['ratio']);
    expect(fetch).not.toHaveBeenCalled(); // signed out: no request
    window.localStorage.setItem('tenali-auth-token', 'fake-token');
    act(() => { window.dispatchEvent(new Event('tenali-auth-change')); });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });
});
