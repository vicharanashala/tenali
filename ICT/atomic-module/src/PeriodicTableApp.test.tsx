import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PeriodicTableApp from './PeriodicTableApp';
import { getSubatomicCounts } from './AtomVisualizerModal';
import elementsData from './elements118.json';

function mockMatchMedia(reducedMotion = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? reducedMotion : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('elements118.json dataset integrity', () => {
  it('contains all 118 IUPAC elements with valid shells and isotope math', () => {
    expect(elementsData).toHaveLength(118);

    const coords = new Set();
    elementsData.forEach((el, idx) => {
      expect(el.number).toBe(idx + 1);
      expect(el.massNumber).toBeGreaterThanOrEqual(el.number);
      const shellSum = el.shells.reduce((acc, count) => acc + count, 0);
      expect(shellSum).toBe(el.number);

      const coordKey = `${el.gridRow}-${el.gridCol}`;
      expect(coords.has(coordKey)).toBe(false);
      coords.add(coordKey);
    });
  });

  it('computes accurate subatomic counts for Chlorine (Cl-35) and Carbon (C-12)', () => {
    const chlorine = elementsData.find((e) => e.symbol === 'Cl');
    expect(getSubatomicCounts(chlorine)).toEqual({
      protons: 17,
      neutrons: 18,
      electrons: 17,
    });

    const carbon = elementsData.find((e) => e.symbol === 'C');
    expect(getSubatomicCounts(carbon)).toEqual({
      protons: 6,
      neutrons: 6,
      electrons: 6,
    });
  });
});

describe('PeriodicTableApp & AtomVisualizerModal', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      clearRect: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      textAlign: 'center',
      textBaseline: 'middle',
      font: '',
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all 118 element tiles in the periodic table grid', () => {
    render(<PeriodicTableApp />);
    expect(screen.getByTestId('element-tile-H')).toBeTruthy();
    expect(screen.getByTestId('element-tile-Cl')).toBeTruthy();
    expect(screen.getByTestId('element-tile-Og')).toBeTruthy();
    expect(screen.getByText(/Showing/i).textContent).toContain('118');
  });

  it('filters elements by search query and category chip', () => {
    render(<PeriodicTableApp />);

    const searchInput = screen.getByLabelText(/Search elements by name, symbol, or atomic number/i);
    fireEvent.change(searchInput, { target: { value: 'Chlorine' } });

    expect(screen.getByTestId('element-tile-Cl').getAttribute('data-matched')).toBe('true');
    expect(screen.getByTestId('element-tile-H').getAttribute('data-matched')).toBe('false');

    fireEvent.click(screen.getByLabelText('Clear search'));
    fireEvent.click(screen.getByRole('button', { name: 'Noble Gases' }));

    expect(screen.getByTestId('element-tile-He').getAttribute('data-matched')).toBe('true');
    expect(screen.getByTestId('element-tile-Og').getAttribute('data-matched')).toBe('true');
    expect(screen.getByTestId('element-tile-Na').getAttribute('data-matched')).toBe('false');
  });

  it('opens Chlorine modal with Cl-35 subatomic counts, IUPAC mass, and SVG nucleus (Z <= 20)', () => {
    render(<PeriodicTableApp />);
    fireEvent.click(screen.getByTestId('element-tile-Cl'));

    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toContain('17 protons, 18 neutrons, 17 electrons');

    expect(screen.getByTestId('proton-count').textContent).toBe('17');
    expect(screen.getByTestId('neutron-count').textContent).toBe('18');
    expect(screen.getByTestId('electron-count').textContent).toBe('17');
    expect(screen.getByText('35.45 u')).toBeTruthy();
    expect(screen.getByTestId('isotope-label').textContent).toContain('Cl-35');

    // Hybrid nucleus rule: Z <= 20 uses countable SVG nucleons
    expect(screen.getByTestId('svg-nucleus')).toBeTruthy();
    expect(screen.queryByTestId('canvas-nucleus')).toBeNull();
  });

  it('switches to optimized HTML5 Canvas nucleus for Z > 20 and labels synthetic superheavy elements', () => {
    render(<PeriodicTableApp />);
    fireEvent.click(screen.getByTestId('element-tile-Og'));

    expect(screen.getByTestId('canvas-nucleus')).toBeTruthy();
    expect(screen.queryByTestId('svg-nucleus')).toBeNull();
    expect(screen.getByTestId('proton-count').textContent).toBe('118');
    expect(screen.getByTestId('neutron-count').textContent).toBe('176');
    expect(screen.getByTestId('isotope-note').textContent).toMatch(/Longest-lived known isotope/i);
  });

  it('supports Escape key dismissal and Play/Pause orbit toggle', () => {
    render(<PeriodicTableApp />);
    fireEvent.click(screen.getByTestId('element-tile-C'));

    const pauseBtn = screen.getByRole('button', { name: /Pause Orbit/i });
    expect(pauseBtn.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(pauseBtn);
    const playBtn = screen.getByRole('button', { name: /Play Orbit/i });
    expect(playBtn.getAttribute('aria-pressed')).toBe('false');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('respects prefers-reduced-motion: reduce by starting paused', () => {
    mockMatchMedia(true);
    render(<PeriodicTableApp />);
    fireEvent.click(screen.getByTestId('element-tile-He'));

    const playBtn = screen.getByRole('button', { name: /Play Orbit/i });
    expect(playBtn.getAttribute('aria-pressed')).toBe('false');
  });
});