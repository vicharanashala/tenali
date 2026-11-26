/**
 * Tests for the "Why learn this?" panel (components/WhyLearnThis.jsx).
 *
 * The panel reads mastery from GET /api/mastery. Signed out, or when that
 * read fails (401, 503, network), it must still be the normal panel and
 * never present the failure as "nothing mastered": no ticks and no
 * "0/1 ready" counts.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WhyLearnThis from './WhyLearnThis.jsx';

// Ratio builds on Basic Arithmetic and leads to Percentages, among others.
const open = async () => {
  fireEvent.click(screen.getByRole('button', { name: /Why learn this\?/ }));
  await screen.findByText('A ratio keeps amounts in balance, at any size.');
};
const chipTexts = () => [...document.querySelectorAll('.why-chip')].map((c) => c.textContent);

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('signed out', () => {
  test('shows the normal panel, with no progress shown and no request made', async () => {
    render(<WhyLearnThis topicId="ratio" onNavigate={null} />);
    await open();
    expect(screen.getByText('Learn these first', { exact: false })).toBeInTheDocument();
    expect(chipTexts()).toContain('Basic Arithmetic');
    expect(chipTexts().join(' ')).not.toMatch(/✓|ready/);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('signed in', () => {
  beforeEach(() => localStorage.setItem('tenali-auth-token', 'fake-token'));

  test.each([
    ['401 (expired session)', { ok: false, status: 401, json: async () => ({}) }],
    ['503 (no database)', { ok: false, status: 503, json: async () => ({}) }],
  ])('a %s is not shown as zero mastery', async (_name, response) => {
    fetch.mockResolvedValue(response);
    render(<WhyLearnThis topicId="ratio" onNavigate={null} />);
    await open();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(chipTexts()).toContain('Basic Arithmetic');
    expect(chipTexts().join(' ')).not.toMatch(/✓|ready/);
  });

  test('real mastery ticks prerequisites and counts what is ready', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ mastery: [{ topicId: 'basicarith', isMastered: true }] }) });
    render(<WhyLearnThis topicId="ratio" onNavigate={null} />);
    await open();
    await waitFor(() => expect(chipTexts()).toContain('✓ Basic Arithmetic'));
    expect(chipTexts().join(' ')).toMatch(/\d\/\d ready/);
  });
});
