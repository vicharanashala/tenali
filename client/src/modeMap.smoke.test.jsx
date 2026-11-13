import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { RandomMixApp, GymApp } from './App';

describe('RandomMixApp & GymApp runtime smoke tests (Issue #517)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ prompt: 'Sample question', options: [] }),
        })
      )
    );
  });

  it('renders RandomMixApp without throwing ReferenceError', () => {
    expect(() => {
      render(<RandomMixApp onBack={() => {}} />);
    }).not.toThrow();

    expect(screen.getByText('Random Mix')).toBeDefined();
    expect(screen.getByText('Start Random Mix')).toBeDefined();
  });

  it('renders GymApp without throwing ReferenceError', () => {
    expect(() => {
      render(<GymApp onBack={() => {}} />);
    }).not.toThrow();

    expect(screen.getByText('Gym')).toBeDefined();
    expect(screen.getByText('Start Workout')).toBeDefined();
  });
});
