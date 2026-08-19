/**
 * Feature CR — Road License hand-off channel.
 *
 * When the student taps "Open <topic> →" on a Car Journey Road License, the
 * license writes a one-shot recommendation here and navigates. The Tenali
 * card's setup screen reads it ONCE (and consumes it) to pre-select the
 * earned difficulty — the student is free to change it before starting.
 *
 * Deliberately tiny and one-way: no quiz behaviour changes, no persistence
 * beyond a single hop (5-minute TTL guards against stale carry-over), and a
 * missing/invalid entry simply falls back to the card's normal default.
 */
const CJ_RECO_KEY = 'tenali-cj-reco';

export function cjSetReco(mode, diff) {
  try { localStorage.setItem(CJ_RECO_KEY, JSON.stringify({ mode, diff, ts: Date.now() })); } catch { /* ignore */ }
}

/** Read the recommendation for this topic. Returns a difficulty key only if it
 *  targets `topicKey`, is fresh (5-min TTL), and is one the card actually
 *  offers — otherwise null, so the card keeps its normal default.
 *
 *  Deliberately NON-destructive: it is called from `useState` initialisers,
 *  which React invokes twice under StrictMode. A read-and-delete would hand
 *  the value to the first invocation and null to the second, so the level
 *  would silently fail to apply. The TTL is what prevents stale carry-over;
 *  re-opening the same card inside the window simply re-applies the same
 *  (still correct) recommendation. */
export function cjTakeReco(topicKey, validDiffs) {
  try {
    const r = JSON.parse(localStorage.getItem(CJ_RECO_KEY));
    if (!r || r.mode !== topicKey) return null;
    if (Date.now() - r.ts > 5 * 60 * 1000) return null;
    return validDiffs.includes(r.diff) ? r.diff : null;
  } catch { return null; }
}
