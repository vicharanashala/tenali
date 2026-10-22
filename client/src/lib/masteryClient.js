/**
 * masteryClient.js — one shared place for everything that reads or reports
 * on mastery, used by WhyLearnThis, the Learning Journey view, and the
 * Topic Connections map. Consolidates three near-identical fetches that
 * used to be copy-pasted per component.
 *
 * Also carries a DEV-ONLY mock override, gated on `import.meta.env.DEV` —
 * impossible to trigger in a production build. Without a database in a
 * given environment, mastery is always empty and the glow/countdown
 * features are real but invisible; this lets anyone reviewing the work
 * actually see them fire, via a URL param or a localStorage flag:
 *
 *   http://localhost:5173/?mockMastery=basicarith,addition,ratio,squaring
 *
 * or, from the browser console:
 *   localStorage.setItem('tenali-mock-mastery', 'basicarith,addition,ratio')
 */

import { getPrerequisites, getTopicIdFromApiPath } from './prerequisiteGraph';

const API = import.meta.env.VITE_API_BASE_URL || '';

export function getMockMasterySet() {
  if (!import.meta.env.DEV) return null;
  try {
    // The app rewrites the URL to `?mode=...` on every navigation (no
    // router, just a synced query string), which wipes out `?mockMastery=`
    // after the very first click. Capture it into localStorage the moment
    // it's seen so it survives every navigation after that, not just the
    // first render.
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('mockMastery');
    if (fromUrl) window.localStorage.setItem('tenali-mock-mastery', fromUrl);
    const raw = fromUrl || window.localStorage.getItem('tenali-mock-mastery');
    if (!raw) return null;
    return new Set(raw.split(',').map((s) => s.trim()).filter(Boolean));
  } catch {
    return null;
  }
}

export function isMockMasteryActive() {
  return getMockMasterySet() !== null;
}

export function isSignedIn() {
  try {
    return !!window.localStorage.getItem('tenali-auth-token');
  } catch {
    return false;
  }
}

/**
 * Fetch the current student's mastered-topic set.
 *
 * Resolves to null when signed out: nobody is tracking progress, which is
 * "unknown", not "nothing mastered", so callers show neutral states and a
 * sign-in hint rather than 0/N counts.
 *
 * Rejects when the request fails. A failed read must not look like "you
 * have mastered nothing" either: that would show a returning student zero
 * progress as if it were real, and make the celebration diff fire for
 * every topic once the server comes back. Callers show an error state.
 */
export async function fetchMasterySet() {
  const mock = getMockMasterySet();
  if (mock) return mock;
  if (!isSignedIn()) return null;
  const token = window.localStorage.getItem('tenali-auth-token');
  const res = await fetch(`${API}/api/mastery`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Could not load mastery (HTTP ${res.status})`);
  const data = await res.json();
  // The server records mastery under the quiz's API path segment (e.g.
  // "twinhunt" for /twinhunt-api), which is not always the graph's topic id
  // ("spot"), so map it back before anyone compares against the graph.
  return new Set((data.mastery || []).filter((m) => m.isMastered).map((m) => getTopicIdFromApiPath(m.topicId)));
}

/**
 * How ready a topic is to be unlocked: how many of its direct
 * prerequisites are already mastered, out of how many it has.
 */
export function unlockReadiness(topicId, masteredSet) {
  const prereqs = getPrerequisites(topicId);
  const ready = masteredSet ? prereqs.filter((p) => masteredSet.has(p)).length : 0;
  return { ready, total: prereqs.length || 1 };
}

/**
 * Fire-and-forget engagement logging — POST /api/events, backed by the
 * existing LearningEvent model (server/lil/models.js, server/lil/eventGenerator.js).
 * Never throws, never blocks the UI; silently does nothing if logged out
 * or the request fails. This is the only way anyone will ever know whether
 * a feature like this actually gets used.
 */
export function logEvent(eventType, topicId, details = {}) {
  try {
    const token = window.localStorage.getItem('tenali-auth-token');
    if (!token) return;
    fetch(`${API}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ eventType, topicId, details }),
    }).catch(() => {});
  } catch {
    /* never let telemetry break the UI */
  }
}
