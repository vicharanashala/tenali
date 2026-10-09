/**
 * TENALI ADVENTURE GAME - API CLIENT
 * ══════════════════════════════════════════════════════════════════════
 * Frontend API client communicating with /api/adventure endpoints.
 * Automatically attaches auth token if present, or guest progress header if guest.
 */

import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('tenali-auth-token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Attach guest progress payload as JSON string header
    const guestProgress = LocalStorageAdapter.getProgress();
    headers['x-guest-progress'] = JSON.stringify(guestProgress);
  }
  return headers;
}

export const adventureApi = {
  fetchConfig: async () => {
    const res = await fetch(`${API_BASE}/api/adventure/config`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load adventure data');
    return await res.json();
  },

  fetchContinue: async () => {
    const res = await fetch(`${API_BASE}/api/adventure/continue`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to get continue level');
    return await res.json();
  },

  startLevel: async (levelId) => {
    const res = await fetch(`${API_BASE}/api/adventure/start`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ levelId })
    });
    if (!res.ok) throw new Error('Failed to start level');
    return await res.json();
  },

  fetchNextClue: async (sessionId) => {
    const res = await fetch(`${API_BASE}/api/adventure/next-clue`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId })
    });
    if (!res.ok) throw new Error('Failed to fetch next clue');
    return await res.json();
  },

  fetchHint: async (sessionId) => {
    const res = await fetch(`${API_BASE}/api/adventure/hint`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId })
    });
    if (!res.ok) throw new Error('Failed to fetch hint');
    return await res.json();
  },

  submitGuess: async (sessionId, guessConceptId) => {
    const guestProgress = LocalStorageAdapter.getProgress();
    const res = await fetch(`${API_BASE}/api/adventure/guess`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId, guessConceptId, guestProgress })
    });
    if (!res.ok) throw new Error('Failed to validate guess');
    const data = await res.json();

    // If guest, sync saved progress back to local storage
    if (data.progress && !localStorage.getItem('tenali-auth-token')) {
      LocalStorageAdapter.saveProgress(data.progress);
    }
    return data;
  }
};
