/**
 * Finding 10 + 11 regression tests.
 *
 * Finding 10 — skipping a clue must never collect its evidence, and a skipped
 * clue must stay revisitable. Finding 11 — wrong answers and skips must not
 * refund hints already spent, and classic progress must persist the running
 * hint total across save/resume.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import {
  DetectiveCaseView,
  EnhancedCasePlay,
  EnhancedClueSolve,
  PathCasePlay,
} from './detective-app';

const STORAGE_KEY = 'tenali-detective-progress';

function classicCase(overrides = {}) {
  return {
    id: 'classic-hints-test',
    title: 'The Test Case',
    topic: 'addition',
    stages: [
      { narrative: 'First clue.', question: 'What is 2 + 2?', answer: 4, hints: ['Count on your fingers.', 'Two and two make four.'] },
      { narrative: 'Second clue.', question: 'What is 3 + 1?', answer: 4, hints: ['Start at three.', 'One more than three.'] },
    ],
    ...overrides,
  };
}

function singleStageClassic() {
  return classicCase({ id: 'classic-hints-test', stages: [classicCase().stages[0]] });
}

function enhancedStory(overrides = {}) {
  return {
    id: 'enhanced-skip-test',
    title: 'The Enhanced Test Case',
    topic: 'addition',
    culprit: 'suki',
    suspects: [
      { id: 'suki', name: 'Suki', appearance: '🐿️', role: 'helper', profile: {} },
      { id: 'nora', name: 'Nora', appearance: '🦊', role: 'helper', profile: {} },
    ],
    stages: [
      {
        narrative: 'A clue on the stage.',
        question: 'What is 2 + 2?',
        answer: 4,
        hints: ['Count on your fingers.', 'Two and two make four.'],
        evidence: { id: 'ev-test', text: 'A test clue.', category: 'identity' },
      },
    ],
    ...overrides,
  };
}

function pathStory() {
  return {
    id: 'path-skip-test',
    title: 'The Path Test Case',
    topic: 'addition',
    culprit: 'suki',
    suspects: [
      { id: 'suki', name: 'Suki', appearance: '🐿️', role: 'helper', profile: {} },
      { id: 'nora', name: 'Nora', appearance: '🦊', role: 'helper', profile: {} },
    ],
    stages: [
      {
        narrative: 'Stage one.',
        question: 'What is 2 + 2?',
        answer: 4,
        hints: ['Count on your fingers.'],
        evidence: { id: 'ev-path-1', text: 'First path clue.', category: 'identity' },
      },
      {
        narrative: 'Stage two.',
        question: 'What is 3 + 1?',
        answer: 4,
        hints: ['Start at three.'],
        evidence: { id: 'ev-path-2', text: 'Second path clue.', category: 'identity' },
      },
    ],
  };
}

function clickHint() {
  fireEvent.click(screen.getByRole('button', { name: /Need a hint/i }));
}

function submitAnswer(value) {
  fireEvent.change(screen.getByPlaceholderText('Your answer...'), { target: { value: String(value) } });
  fireEvent.click(screen.getByRole('button', { name: /Submit Evidence/i }));
}

function skipClue() {
  fireEvent.click(screen.getByRole('button', { name: /Skip this question/i }));
  fireEvent.click(screen.getByRole('button', { name: /^Skip anyway$/i }));
}

beforeEach(() => {
  localStorage.clear();
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillRect: vi.fn(),
    globalAlpha: 1,
    fillStyle: '#000',
  }));
  vi.stubGlobal('requestAnimationFrame', () => 0);
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Finding 11 — hint accounting', () => {
  test('classic wrong answers do not refund hints', () => {
    const onComplete = vi.fn();
    render(<DetectiveCaseView caseData={singleStageClassic()} initialStage={0} onComplete={onComplete} onBack={() => {}} />);

    clickHint();
    clickHint();
    submitAnswer(0);
    expect(screen.getByText(/The correct answer was/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));
    expect(screen.getByText(/Hint 1:/i)).toBeInTheDocument();
    expect(screen.getByText(/Hint 2:/i)).toBeInTheDocument();

    submitAnswer(4);
    fireEvent.click(screen.getByRole('button', { name: /Complete Case/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][2].totalHintsUsed).toBe(2);
  });

  test('enhanced clue solving keeps cumulative hints across a wrong answer', () => {
    const onSolved = vi.fn();
    const onSkip = vi.fn();
    render(
      <EnhancedClueSolve
        story={enhancedStory()}
        clueIdx={0}
        onSolved={onSolved}
        onSkip={onSkip}
        onBack={() => {}}
      />
    );

    clickHint();
    clickHint();
    submitAnswer(0);
    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));
    expect(screen.getByText(/Hint 1:/i)).toBeInTheDocument();

    submitAnswer(4);
    fireEvent.click(screen.getByRole('button', { name: /Collect Evidence/i }));

    expect(onSolved).toHaveBeenCalledWith(2);
    expect(onSkip).not.toHaveBeenCalled();
  });

  test('classic save captures skipped clues along with hint totals', () => {
    render(<DetectiveCaseView caseData={classicCase({ id: 'classic-save-test' })} initialStage={0} onComplete={() => {}} onBack={() => {}} />);

    clickHint();
    skipClue();
    fireEvent.click(screen.getByRole('button', { name: /← Cases/i }));

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const snapshot = saved.cases['classic-save-test'];
    expect(snapshot.totalHintsUsed).toBe(2);
    expect(snapshot.skippedClues).toEqual([0]);
    expect(snapshot.currentStage).toBe(0);
  });

  test('classic progress saves and restores totalHintsUsed', () => {
    const onComplete = vi.fn();
    const first = render(
      <DetectiveCaseView caseData={classicCase({ id: 'classic-save-test' })} initialStage={0} onComplete={onComplete} onBack={() => {}} />
    );

    clickHint();
    submitAnswer(4);
    fireEvent.click(screen.getByRole('button', { name: /Next Stage/i }));
    fireEvent.click(screen.getByRole('button', { name: /← Cases/i }));

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(saved.cases['classic-save-test'].totalHintsUsed).toBe(1);
    expect(saved.cases['classic-save-test'].currentStage).toBe(1);

    first.unmount();
    render(
      <DetectiveCaseView
        caseData={classicCase({ id: 'classic-save-test' })}
        initialStage={saved.cases['classic-save-test'].currentStage}
        initialHintsUsed={saved.cases['classic-save-test'].totalHintsUsed}
        onComplete={onComplete}
        onBack={() => {}}
      />
    );

    submitAnswer(4);
    fireEvent.click(screen.getByRole('button', { name: /Complete Case/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][2].totalHintsUsed).toBe(1);
  });
});

describe('Finding 10 — skipping clues', () => {
  test('classic skip is not a success, stays revisitable, and costs one hint', () => {
    const onComplete = vi.fn();
    render(<DetectiveCaseView caseData={singleStageClassic()} initialStage={0} onComplete={onComplete} onBack={() => {}} />);

    skipClue();
    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByText(/Skipped — you can revisit this clue/i)).toBeInTheDocument();
    expect(screen.getByText(/The correct answer was/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Revisit clue/i }));
    expect(screen.getByPlaceholderText('Your answer...')).toBeInTheDocument();

    submitAnswer(4);
    fireEvent.click(screen.getByRole('button', { name: /Complete Case/i }));

    expect(onComplete.mock.calls[0][2].totalHintsUsed).toBe(1);
    expect(onComplete.mock.calls[0][2].skippedClues).toEqual([]);
  });

  test('enhanced skip awards no evidence and leaves the clue revisitable', () => {
    render(<EnhancedCasePlay story={enhancedStory()} onComplete={() => {}} onBack={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /Clue 1:/i }));
    skipClue();

    expect(screen.getByText(/No evidence collected yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Skipped — tap to revisit/i)).toBeInTheDocument();
    expect(screen.getByText(/0\/1 clues solved/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Make your accusation/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Clue 1:/i }));
    submitAnswer(4);
    fireEvent.click(screen.getByRole('button', { name: /Collect Evidence/i }));

    expect(screen.getByText(/Evidence Collected/i)).toBeInTheDocument();
  });

  test('enhanced skip passes spent hints to the parent instead of awarding the clue', () => {
    const onSolved = vi.fn();
    const onSkip = vi.fn();
    render(
      <EnhancedClueSolve
        story={enhancedStory()}
        clueIdx={0}
        onSolved={onSolved}
        onSkip={onSkip}
        onBack={() => {}}
      />
    );

    clickHint();
    skipClue();

    expect(onSkip).toHaveBeenCalledWith(1);
    expect(onSolved).not.toHaveBeenCalled();
  });

  test('enhanced skip persists the skipped clue and spent hints for resume', () => {
    render(<EnhancedCasePlay story={enhancedStory()} onComplete={() => {}} onBack={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /Clue 1:/i }));
    clickHint();
    skipClue();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const snapshot = saved.cases['enhanced-skip-test'];
    expect(snapshot.totalHintsUsed).toBe(1);
    expect(snapshot.skippedClues).toEqual([0]);
    expect(snapshot.solvedClues).toEqual([]);
    expect(snapshot.evidenceItems).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: /Clue 1:/i }));
    submitAnswer(4);
    fireEvent.click(screen.getByRole('button', { name: /Collect Evidence/i }));

    const afterSolve = JSON.parse(localStorage.getItem(STORAGE_KEY)).cases['enhanced-skip-test'];
    expect(afterSolve.solvedClues).toEqual([0]);
    expect(afterSolve.skippedClues).toEqual([]);
    expect(afterSolve.totalHintsUsed).toBe(1);
  });

  test('path skip persists and only charges its hints once', () => {
    render(<PathCasePlay story={pathStory()} onComplete={() => {}} onBack={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /Stage 1: ready/i }));
    clickHint();
    skipClue();

    expect(screen.getByText(/0\/2 stages solved/i)).toBeInTheDocument();
    expect(screen.getByText(/No evidence collected yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Stage 1: ready/i })).toBeInTheDocument();

    const afterSkip = JSON.parse(localStorage.getItem(STORAGE_KEY)).cases['path-skip-test'];
    expect(afterSkip.totalHintsUsed).toBe(1);
    expect(afterSkip.skippedClues).toEqual([0]);
    expect(afterSkip.solvedClues).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: /Stage 1: ready/i }));
    submitAnswer(4);
    fireEvent.click(screen.getByRole('button', { name: /Collect Evidence/i }));

    expect(screen.getByText(/New Clue — Evidence #1/i)).toBeInTheDocument();

    const afterSolve = JSON.parse(localStorage.getItem(STORAGE_KEY)).cases['path-skip-test'];
    expect(afterSolve.totalHintsUsed).toBe(1);
    expect(afterSolve.solvedClues).toEqual([0]);
    expect(afterSolve.skippedClues).toEqual([]);
  });
});