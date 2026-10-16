// Tests for the Concept Playgrounds fetch layer (src/lib/concept/conceptApi.js).
//
// This file doubles as the reference example for frontend testing in this repo
// (issue #294). It shows the patterns future tests should follow:
//   • mock the global `fetch` with vi.stubGlobal — never hit the network
//   • seed jsdom's localStorage with a fake token for authenticated calls
//   • assert on user-facing outcomes (returned data / thrown ConceptApiError),
//     not on internal implementation details.
//
// NOTE: full App.jsx testing is explicitly out of scope — target extracted
// modules like this one (lib/concept/*, features/tiles.js) until the
// component-extraction work lands.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConceptApiError, fetchConceptState, saveConceptStage } from './conceptApi';

const AUTH_TOKEN_KEY = 'tenali-auth-token';

let fetchMock;

// A minimal stand-in for Response — conceptFetch only reads `ok`, `status`
// and calls `json()`, so a real Response object is unnecessary.
function jsonResponse(body, { status = 200 } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

// Simulates a server that returns HTML/a truncated body instead of JSON —
// `json()` throws exactly like the real Response does.
function malformedJsonResponse({ status = 200 } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      throw new SyntaxError('Unexpected token < in JSON at position 0');
    },
  };
}

beforeEach(() => {
  localStorage.clear();
  // Fresh mock every test so nothing leaks between tests.
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchConceptState', () => {
  it('resolves with the parsed body on a successful response', async () => {
    const body = { stageIndex: 2, completed: true };
    fetchMock.mockResolvedValue(jsonResponse(body));

    const result = await fetchConceptState('algebra');

    expect(result).toEqual(body);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/concept-session/algebra/state'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
  });

  it('omits the Authorization header when no token is stored', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await fetchConceptState('algebra');

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it('sends the stored JWT as a Bearer token when present', async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'fake-jwt-token');
    fetchMock.mockResolvedValue(jsonResponse({}));

    await fetchConceptState('algebra');

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer fake-jwt-token');
  });

  it('rejects with ConceptApiError(status 0) when fetch fails at the network level', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await fetchConceptState('algebra').catch((e) => e);

    expect(error).toBeInstanceOf(ConceptApiError);
    expect(error).toMatchObject({
      message: 'Network error: Failed to fetch',
      status: 0,
      isAuthError: false,
    });
  });

  it('rejects with isAuthError on a 401 response so callers can prompt a re-login', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: 'Session expired' }, { status: 401 }),
    );

    const error = await fetchConceptState('algebra').catch((e) => e);

    expect(error).toBeInstanceOf(ConceptApiError);
    expect(error).toMatchObject({
      message: 'Session expired',
      status: 401,
      isAuthError: true,
    });
  });

  it('falls back to a generic message when an error response body is not JSON', async () => {
    fetchMock.mockResolvedValue(malformedJsonResponse({ status: 500 }));

    const error = await fetchConceptState('algebra').catch((e) => e);

    expect(error).toBeInstanceOf(ConceptApiError);
    expect(error).toMatchObject({
      message: 'Request failed (HTTP 500)',
      status: 500,
      isAuthError: false,
    });
  });

  it('resolves with null when a 2xx response body is not JSON', async () => {
    fetchMock.mockResolvedValue(malformedJsonResponse({ status: 200 }));

    await expect(fetchConceptState('algebra')).resolves.toBeNull();
  });
});

describe('saveConceptStage', () => {
  it('POSTs the stage payload as a JSON body', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await saveConceptStage('algebra', 3, { score: 10 });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toEqual(
      expect.stringContaining('/api/concept-session/algebra/session'),
    );
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ stageIndex: 3, score: 10 });
    expect(options.headers['Content-Type']).toBe('application/json');
  });
});
