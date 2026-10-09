import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ConceptApiError,
  fetchConceptState,
  saveConceptStage,
  startConceptReview,
  logConceptAttempt
} from './conceptApi.js';

describe('conceptApi', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('fetchConceptState', () => {
    it('fetches state successfully without auth token', async () => {
      const mockData = { skillId: 'math-1', stage: 1 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const data = await fetchConceptState('math-1');
      expect(data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/concept-session/math-1/state',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('attaches Authorization header when auth token exists in localStorage', async () => {
      localStorage.setItem('tenali-auth-token', 'test-token-123');
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await fetchConceptState('math-1');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/concept-session/math-1/state',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token-123'
          }
        })
      );
    });

    it('handles network failure (fetch throws)', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

      try {
        await fetchConceptState('math-1');
      } catch (err) {
        expect(err).toBeInstanceOf(ConceptApiError);
        expect(err.message).toContain('Network error: Failed to fetch');
        expect(err.status).toBe(0);
        expect(err.isAuthError).toBe(false);
      }
    });

    it('handles 401 Unauthorized response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized token expired' })
      });

      try {
        await fetchConceptState('math-1');
      } catch (err) {
        expect(err).toBeInstanceOf(ConceptApiError);
        expect(err.message).toBe('Unauthorized token expired');
        expect(err.status).toBe(401);
        expect(err.isAuthError).toBe(true);
      }
    });

    it('handles non-JSON error response (e.g. 500 HTML error page)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON at position 0');
        }
      });

      try {
        await fetchConceptState('math-1');
      } catch (err) {
        expect(err).toBeInstanceOf(ConceptApiError);
        expect(err.message).toBe('Request failed (HTTP 500)');
        expect(err.status).toBe(500);
        expect(err.isAuthError).toBe(false);
      }
    });
  });

  describe('saveConceptStage', () => {
    it('sends POST request with stageIndex and sessionData', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const res = await saveConceptStage('math-1', 2, { score: 100 });
      expect(res).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/concept-session/math-1/session',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ stageIndex: 2, score: 100 })
        })
      );
    });
  });

  describe('startConceptReview', () => {
    it('sends POST request to start review', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reviewStarted: true })
      });

      const res = await startConceptReview('math-1');
      expect(res).toEqual({ reviewStarted: true });
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/concept-session/math-1/review/start',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('logConceptAttempt', () => {
    it('sends POST request with attempt payload', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ logged: true })
      });

      const payload = { skillId: 'math-1', correct: true };
      const res = await logConceptAttempt(payload);
      expect(res).toEqual({ logged: true });
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/concept-playgrounds/attempt',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload)
        })
      );
    });
  });
});
