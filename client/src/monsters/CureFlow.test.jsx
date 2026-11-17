/**
 * Tests for the Misconception Monster cure run (CureFlow.jsx).
 *
 * 1. Recorded mistakes come first, fallbacks make up the five questions.
 * 2. Four correct answers cure the monster and play the celebration.
 * 3. Fewer than four leaves it uncured, with no celebration.
 * 4. Rendering never writes to storage, prop changes swap the questions,
 *    the celebration fires once and cleans up, and the callbacks fire.
 */

import { describe, test, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CureFlow from './CureFlow.jsx';

const FALLBACK_ANSWERS = ['2x + 6', '8x - 20', '9y + 12', '5x - 10', '6z + 12'];

function answer(text) {
  const input = screen.getByRole('textbox', { name: 'Your answer' });
  fireEvent.change(input, { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
  fireEvent.click(screen.getByRole('button', { name: /Next question|See result/ }));
}

afterEach(() => {
  vi.useRealTimers();
  document.querySelectorAll('.cure-particle').forEach((p) => p.remove());
});

const cureAll = () => FALLBACK_ANSWERS.forEach(answer);

describe('questions', () => {
  test('starts on question 1 of 5 straight away, using the fallbacks', () => {
    render(<CureFlow monsterId="bracketeer" topic="algebra" />);
    expect(screen.getByText(/Question 1 of 5/)).toBeInTheDocument();
    expect(screen.getByText('Expand: 2(x + 3)')).toBeInTheDocument();
  });

  test('puts a recorded mistake first', () => {
    localStorage.setItem('tenali.monsterLog.v1', JSON.stringify({
      version: 1,
      log: [{ monsterId: 'bracketeer', topic: 'algebra', question: 'Expand: 7(a + 1)', correctAnswer: '7a + 7', timestamp: 1 }],
    }));
    render(<CureFlow monsterId="bracketeer" topic="algebra" />);
    expect(screen.getByText('Expand: 7(a + 1)')).toBeInTheDocument();
  });
});

describe('finishing a run', () => {
  test('four correct answers cure the monster and play the celebration', () => {
    render(<CureFlow monsterId="bracketeer" topic="algebra" />);
    // The fifth fallback is 6(2z + 1) = 12z + 6; answer it wrong on purpose.
    FALLBACK_ANSWERS.forEach(answer);
    expect(screen.getByText('Monster cured!')).toBeInTheDocument();
    expect(screen.getByText(/You got 4 of 5/)).toBeInTheDocument();
    expect(document.querySelectorAll('.cure-particle').length).toBeGreaterThan(0);
    expect(document.querySelector('.cure-poof-cloud.poof-animate')).not.toBeNull();
  });

  test('fewer than four leaves it uncured, with no celebration', () => {
    render(<CureFlow monsterId="bracketeer" topic="algebra" />);
    ['2x + 6', 'no', 'no', 'no', 'no'].forEach(answer);
    expect(screen.getByText(/The monster held on/)).toBeInTheDocument();
    expect(document.querySelectorAll('.cure-particle').length).toBe(0);
    expect(document.querySelector('.cure-poof-cloud.poof-animate')).toBeNull();
  });
});

describe('rendering and props', () => {
  test('rendering does not write to localStorage', () => {
    expect(localStorage.getItem('tenali.monsterLog.v1')).toBeNull();
    render(<CureFlow monsterId="bracketeer" topic="algebra" />);
    expect(localStorage.getItem('tenali.monsterLog.v1')).toBeNull();
  });

  test('a new monsterId swaps in that monster\'s questions', () => {
    const { rerender } = render(<CureFlow monsterId="bracketeer" topic="algebra" />);
    expect(screen.getByText('Expand: 2(x + 3)')).toBeInTheDocument();
    rerender(<CureFlow monsterId="sign-swapper" topic="integers" />);
    expect(screen.getByText('Calculate: (-3) + 7')).toBeInTheDocument();
  });

  test('an unknown monster still gets a full run of five', () => {
    render(<CureFlow monsterId="not-a-monster" topic="x" />);
    expect(screen.getByText(/Question 1 of 5/)).toBeInTheDocument();
  });
});

describe('celebration', () => {
  test('fires once, and cleans up its particles and poof', () => {
    vi.useFakeTimers();
    const { rerender } = render(<CureFlow monsterId="bracketeer" topic="algebra" />);
    cureAll();
    expect(document.querySelectorAll('.cure-particle').length).toBe(45);
    rerender(<CureFlow monsterId="bracketeer" topic="algebra" />);
    expect(document.querySelectorAll('.cure-particle').length).toBe(45);
    act(() => { vi.advanceTimersByTime(1200); });
    expect(document.querySelectorAll('.cure-particle').length).toBe(0);
    expect(document.querySelector('.cure-poof-cloud.poof-animate')).toBeNull();
  });
});

describe('callbacks', () => {
  test('Cancel calls onCancel', () => {
    const onCancel = vi.fn();
    render(<CureFlow monsterId="bracketeer" topic="algebra" onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('Return to Hall reports the result through onComplete', () => {
    const onComplete = vi.fn();
    render(<CureFlow monsterId="bracketeer" topic="algebra" onComplete={onComplete} />);
    cureAll();
    fireEvent.click(screen.getByRole('button', { name: 'Return to Hall' }));
    expect(onComplete).toHaveBeenCalledWith({ success: true, correctCount: 4 });
  });
});
