/**
 * Tests for the Misconception Monster cure run (CureFlow.jsx).
 *
 * 1. Recorded mistakes come first, fallbacks make up the five questions.
 * 2. Four correct answers cure the monster and play the celebration.
 * 3. Fewer than four leaves it uncured, with no celebration.
 */

import { describe, test, expect, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CureFlow from './CureFlow.jsx';

const FALLBACK_ANSWERS = ['2x + 6', '8x - 20', '9y + 12', '5x - 10', '6z + 12'];

function answer(text) {
  const input = screen.getByRole('textbox', { name: 'Your answer' });
  fireEvent.change(input, { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
  fireEvent.click(screen.getByRole('button', { name: /Next question|See result/ }));
}

afterEach(() => {
  document.querySelectorAll('.cure-particle').forEach((p) => p.remove());
});

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
