/**
 * fetchMasterySet() has three outcomes the UI must keep apart:
 *   - a Set      → real progress (possibly empty: nothing mastered yet)
 *   - null       → signed out, progress unknown
 *   - rejection  → the read failed, progress unknown
 * Collapsing the last two into an empty Set is what showed returning
 * students "0 mastered" whenever the server hiccupped.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchMasterySet, isSignedIn } from './lib/masteryClient';

function fakeWindow(token) {
  const store = new Map(token ? [['tenali-auth-token', token]] : []);
  return {
    location: { search: '' },
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    },
  };
}

describe('fetchMasterySet', () => {
  const realFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = realFetch;
    delete globalThis.window;
  });

  describe('signed out', () => {
    beforeEach(() => { globalThis.window = fakeWindow(null); });

    test('resolves null and never calls the API', async () => {
      globalThis.fetch = vi.fn();
      expect(isSignedIn()).toBe(false);
      await expect(fetchMasterySet()).resolves.toBeNull();
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });
  });

  describe('signed in', () => {
    beforeEach(() => { globalThis.window = fakeWindow('tok'); });

    test('returns only mastered topic ids', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ mastery: [
          { topicId: 'ratio', isMastered: true },
          { topicId: 'percent', isMastered: false },
        ] }),
      });
      const set = await fetchMasterySet();
      expect([...set]).toEqual(['ratio']);
      expect(globalThis.fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer tok');
    });

    test('maps API path names back to graph topic ids', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ mastery: [{ topicId: 'twinhunt', isMastered: true }] }),
      });
      const set = await fetchMasterySet();
      expect([...set]).toEqual(['spot']);
    });

    test('an empty list is a real, empty Set', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ mastery: [] }) });
      const set = await fetchMasterySet();
      expect(set).toBeInstanceOf(Set);
      expect(set.size).toBe(0);
    });

    test('a 503 (no database) rejects instead of looking like zero progress', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
      await expect(fetchMasterySet()).rejects.toThrow(/503/);
    });

    test('a network failure rejects', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(fetchMasterySet()).rejects.toThrow();
    });
  });
});
