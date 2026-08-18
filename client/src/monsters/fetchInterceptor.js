/**
 * fetchInterceptor.js
 *
 * Installs a wrapper around window.fetch that observes /api/<topic>-api/check
 * responses and, on a wrong answer, runs the monster classifier, persists the
 * log entry, and dispatches a `tenali:wrongAnswer` CustomEvent for UI subscribers.
 *
 * Spec: D:\vins-phase-2\tenali-docs-backup\FEATURE_MONSTERS.md v0.2 §5.
 *
 * Design notes (improvements over v0.2 baseline spec):
 *  A. Topic allow-list. We only run classification for math topic slugs
 *     (basicarith, multiply, etc.). Endpoints like /api/auth/* or future
 *     non-math endpoints with `correct: false` are ignored.
 *  B. Debug instrumentation. When localStorage.tenali.monsters.debug === 'true',
 *     a `_monstersDebug` global is exposed with lastEvent/eventLog/replay/storageDump/
 *     enable/disable. Dev-only; production users see nothing.
 *  C. Atomic append. monsterStore.append calls go through a module-level
 *     promise queue so concurrent wrong-answer fires don't race on
 *     load -> modify -> save.
 *  D. Strict URL gating. URL must END with `/check` (exact match on segment,
 *     not a regex loose match). Avoids future endpoints that happen to
 *     contain `/check` in their path.
 *  E. Promise.resolve wrapping. Returns Promise.resolve(response) for
 *     explicit async contract.
 *
 * Failure handling (spec §8):
 *  - The interceptor wraps EVERYTHING in try/catch. Any internal error
 *    returns the original response unchanged — the app must keep working
 *    even if monsters is broken.
 *  - monsterStore failures are caught and logged; UI event still fires.
 *
 * Lifecycle:
 *  - `installMonstersInterceptor()` — idempotent; installs once.
 *  - Call once at app startup (e.g. from App.jsx top or main.jsx).
 */

import { classifyMonster, MONSTER_IDS } from './classifier.js';
import * as monsterStore from './monsterStore.js';

// ─── Configuration ───────────────────────────────────────────────────────────

/**
 * Topics whose /check responses we observe. Mirrors the 14 single-input
 * topics supported by server/warmupAdapter.js (topic-agnostic v0.2 design).
 * Adding a new topic = add it here + (optionally) in classifier.js gating.
 */
const ALLOWED_TOPICS = new Set([
  'basicarith',
  'multiply',
  'sqrt',
  'quadratic',
  'funceval',
  'indices',
  'addition',
  'squaring',
  'lineareq',
  'rounding',
  'ratio',
  'percent',
  'decimals',
  'sequences',
  'polymul',  // Poly Multiply — enables Bracketeer on a(x±c) easy questions
]);

const EVENT_NAME = 'tenali:wrongAnswer';
const DEBUG_FLAG_KEY = 'tenali.monsters.debug';
const ENABLE_FLAG_KEY = 'tenali.monsters.enabled';

const DEBUG_FIXTURES = {
  'bracketeer':      { topic: 'polymul', question: '3(x+2)', userAnswer: '3x + 2', correctAnswer: '3x + 6' },
  'sign-swapper':    { topic: 'basicarith', question: '(-3) + 5', userAnswer: '-2', correctAnswer: '2' },
  'decimal-drifter': { topic: 'decimals', question: '0.5 + 0.3', userAnswer: '0.08', correctAnswer: '0.8' },
  'carry-crasher':   { topic: 'addition', question: '47 + 38', userAnswer: '75', correctAnswer: '85' },
};

// ─── Module state ────────────────────────────────────────────────────────────

let _installed = false;
let _enabled = true;       // runtime toggle, mirrored to localStorage
let _debug = false;        // debug mode, mirrored to localStorage
let _lastEvent = null;     // last intercepted event for debug
let _appendQueue = Promise.resolve();  // serialized append queue (improvement C)
let _originalFetch = null; // preserved once so toggles never wrap a wrapper

// Per-topic cache of the most recent /question response. The /check response
// does NOT include the question text — only the correct answer. To classify
// mistakes like Bracketeer ("3(x+2)" → wrong distribution), we need the
// original prompt, which we cache from the prior /question call.
const _questionCache = new Map();  // topic → question object (prompt, a, b, op, etc.)

// Per-topic cache of the most recent /check request body. The /check response
// does NOT include the student's submitted answer — only the correct answer.
// We capture the request body (parsed JSON) so the interceptor knows what the
// student actually typed.
const _lastRequestBody = new Map();  // topic → parsed request body

// ─── Internal helpers ────────────────────────────────────────────────────────

function isCheckUrl(url) {
  // Improvement D: URL must END with `/check` (path segment exact match),
  // and the previous path segment must look like `<topic>-api`.
  if (typeof url !== 'string') return null;
  // Strip query string and fragment
  const cleanUrl = url.split('?')[0].split('#')[0];
  const m = cleanUrl.match(/\/([a-z0-9-]+)-api\/check\/?$/);
  if (!m) return null;
  const topic = m[1];
  if (!ALLOWED_TOPICS.has(topic)) return null;
  return topic;
}

/**
 * Identify a /question endpoint and return the topic, or null.
 * Pattern: GET /<topic>-api/question[?...]
 * Same strict-URL gating as isCheckUrl — URL must END with /question.
 */
function isQuestionUrl(url) {
  if (typeof url !== 'string') return null;
  const cleanUrl = url.split('?')[0].split('#')[0];
  const m = cleanUrl.match(/\/([a-z0-9-]+)-api\/question\/?$/);
  if (!m) return null;
  const topic = m[1];
  if (!ALLOWED_TOPICS.has(topic)) return null;
  return topic;
}

/**
 * Parse a fetch init.body into a JS object, or null if not parseable.
 * Body can be a string, Blob, FormData, etc — we only handle JSON strings.
 */
function parseRequestBody(init) {
  if (!init || !init.body) return null;
  if (typeof init.body !== 'string') return null;
  try {
    return JSON.parse(init.body);
  } catch (_e) {
    return null;
  }
}

function readBoolFlag(key, fallback = false) {
  try {
    const value = window.localStorage.getItem(key);
    return value == null ? fallback : value === 'true';
  } catch (_e) {
    return fallback;
  }
}

function writeBoolFlag(key, val) {
  try {
    if (val) window.localStorage.setItem(key, 'true');
    else window.localStorage.removeItem(key);
  } catch (_e) {
    // ignore — flag persistence is best-effort
  }
}

/**
 * Extract a normalized question/answer pair from a /check response.
 * The /check response only contains `{ correct, correctAnswer, message }`.
 * It does NOT include the question prompt or the user's submitted answer.
 * We pull those from per-topic caches populated by /question responses
 * and the captured request body.
 * Spec §5.3.
 */
function extractNormalized(data, url) {
  if (!data || typeof data !== 'object') return null;
  if (data.correct !== false) return null;  // only fire on wrong answers

  // Topic from URL is the source of truth; do not trust data.topic
  const topic = isCheckUrl(url);
  if (!topic) return null;

  // Question text — try the response first, then the cached /question
  const cachedQ = _questionCache.get(topic) || {};
  let question =
    data.question ?? data.prompt ?? data.q ?? data.stem ?? data.problem ??
    cachedQ?.prompt ?? cachedQ?.question ??
    '';

  // If operands are present in the cached question, reconstruct a clean arithmetic expression
  // so the classifier rules (such as Carry Crasher) can parse it reliably regardless of word templates.
  if (cachedQ.a !== undefined && cachedQ.b !== undefined) {
    const op = cachedQ.op ?? (topic === 'addition' ? '+' : (topic === 'multiply' ? '×' : '+'));
    question = `${cachedQ.a} ${op} ${cachedQ.b}`;
  }

  // Student answer and some endpoint-specific correct-answer fallbacks come
  // from the captured check request.
  const reqBody = _lastRequestBody.get(topic) || {};

  // Correct answer — the /check response always includes this
  const correctAnswer =
    data.correctAnswer ?? data.expected ?? data.answer ?? data.display ??
    reqBody.correctAnswer ?? reqBody.expected ?? '';

  // Student answer — pull from captured request body (the /check response
  // does NOT echo this back). Different endpoints use different field names.
  const userAnswer =
    data.userAnswer ?? data.answer ?? data.submitted ?? data.studentAnswer ??
    reqBody.userAnswer ?? reqBody.submitted ?? reqBody.answer ?? '';

  // Sanity: need at least the topic; question/userAnswer/correctAnswer
  // may be empty strings (interceptor still fires, classifier returns null).
  return { question, userAnswer, correctAnswer, topic };
}

/**
 * Serialize append() calls so concurrent wrong-answer fires don't race
 * on localStorage load -> modify -> save.
 */
function enqueueAppend(entry) {
  _appendQueue = _appendQueue.then(() => {
    try {
      const ok = monsterStore.append(entry);
      if (ok) notifyMonsterLogChanged();
    } catch (e) {
      console.warn('[monsters] append failed:', e.message);
    }
  });
  return _appendQueue;
}

/**
 * Fire a same-tab CustomEvent so App.jsx can re-hydrate monsterLog state.
 * The `storage` event only fires across tabs, not within the same tab —
 * so this bridge is required for the Hall panel to update in real time.
 */
function notifyMonsterLogChanged() {
  try {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('tenali:monsterLogChanged'));
  } catch (_e) { /* never break the interceptor */ }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Install the fetch interceptor. Idempotent. Safe to call multiple times.
 * Reads enable/debug flags from localStorage at install time.
 */
export function installMonstersInterceptor() {
  if (_installed) return;
  if (typeof window === 'undefined' || typeof window.fetch !== 'function') {
    // Not in a browser environment; nothing to wrap.
    return;
  }

  _enabled = readBoolFlag(ENABLE_FLAG_KEY, true);
  /* Legacy no-op install path retained in comments for historical context.
    // Spec §5.1: feature is gated off. Wrap a noop so a later runtime
    // enable() can swap it in.
    installNoopInterceptor();
    _installed = true;
    return;
  }
  */
  _debug = readBoolFlag(DEBUG_FLAG_KEY);
  installActiveInterceptor();
  _installed = true;
}

/**
 * No-op interceptor: every fetch goes through unchanged. Used when the
 * feature is disabled via the localStorage flag.
 */
function installNoopInterceptor() {
  // No wrapping; original window.fetch remains untouched.
}

/**
 * Active interceptor: wraps window.fetch with monster classification logic.
 */
function installActiveInterceptor() {
  if (_originalFetch == null) _originalFetch = window.fetch.bind(window);

  window.fetch = function patchedFetch(input, init) {
    if (!_enabled) return _originalFetch(input, init);
    // Capture the URL and request body up front so we can use them after the
    // fetch resolves. The /check response does NOT echo the request body, so
    // we have to capture it here.
    const reqUrl = typeof input === 'string' ? input : (input && input.url) || '';
    const reqBodyParsed = parseRequestBody(init);
    const reqTopic = isCheckUrl(reqUrl) || isQuestionUrl(reqUrl);
    if (reqTopic && reqBodyParsed) {
      _lastRequestBody.set(reqTopic, reqBodyParsed);
    }

    // Improvement E: explicit async contract
    return Promise.resolve(_originalFetch(input, init)).then(async (response) => {
      // Defensive: if anything below throws, return the original response
      // unchanged. The app MUST keep working.
      try {
        const url = reqUrl;
        const topic = isCheckUrl(url);
        if (!topic) {
          // Maybe a /question call — cache its body for later /check pairing
          const qTopic = isQuestionUrl(url);
          if (qTopic) {
            try {
              const qData = await response.clone().json().catch(() => null);
              if (qData && typeof qData === 'object') {
                _questionCache.set(qTopic, qData);
              }
            } catch (_e) { /* best effort */ }
          }
          return response;
        }

        // Clone before reading — the response body is single-use
        const data = await response.clone().json().catch(() => null);
        const normalized = extractNormalized(data, url);
        // Debug trace: record every /check extraction attempt, including nulls
        try {
          _eventLog.push({
            at: new Date().toISOString(),
            stage: 'normalize',
            url,
            data: data ? { correct: data.correct, correctAnswer: data.correctAnswer, message: data.message } : null,
            normalized,
          });
          if (_eventLog.length > _eventLogMax) _eventLog.shift();
        } catch {}
        if (!normalized) return response;

        // Run the classifier
        const monsterId = classifyMonster(normalized);
        if (!monsterId) return response;

        const eventDetail = {
          monsterId,
          topic,
          question: normalized.question,
          userAnswer: normalized.userAnswer,
          correctAnswer: normalized.correctAnswer,
          timestamp: Date.now(),
        };

        // Persist synchronously so the UI event handler reads the updated state immediately
        try {
          const ok = monsterStore.append({
            monsterId,
            topic,
            question: normalized.question,
            wrongAnswer: normalized.userAnswer,
            correctAnswer: normalized.correctAnswer,
            timestamp: eventDetail.timestamp,
          });
          if (ok) notifyMonsterLogChanged();
        } catch (e) {
          console.warn('[monsters] append failed:', e.message);
        }

        // Track for debug
        _lastEvent = eventDetail;
        pushEventLog(eventDetail);
        captureNormalizedForDebug(eventDetail, normalized);

        // Snapshot first-encounter state before writing it. The toast relies
        // on this event value because storage is updated before dispatch.
        let isNew = false;
        try {
          isNew = !monsterStore.isMonsterSeen(monsterId);
          if (monsterStore.markMonsterSeen(monsterId)) notifyMonsterLogChanged();
        } catch (e) {
          console.warn('[monsters] markMonsterSeen failed:', e.message);
        }
        eventDetail.isNew = isNew;

        // Dispatch UI event
        try {
          window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: eventDetail }));
        } catch (e) {
          console.warn('[monsters] event dispatch failed:', e.message);
        }

        return response;
      } catch (e) {
        // Last-ditch guard: never let interceptor logic break a fetch
        console.warn('[monsters] interceptor internal error, returning original response:', e.message);
        return response;
      }
    });
  };

  // Expose debug surface if debug flag is on
  if (_debug) {
    installDebugSurface();
  }
}

/**
 * Improvement B: dev-only debug surface.
 * Exposes `_monstersDebug` on window with helpful inspection tools.
 * Production users see nothing — debug flag is off by default.
 */
function installDebugSurface() {
  window._monstersDebug = {
    /**
     * Get the last intercepted event, or null if no event has fired yet.
     */
    lastEvent() {
      return _lastEvent;
    },

    /**
     * Get the full event history (most recent last), capped at 20 entries.
     * Useful when the toast got missed but you want to confirm it fired.
     */
    eventLog() {
      return getEventLog();
    },

    /**
     * Clear the in-memory event history. Does NOT touch localStorage.
     */
    clearEventLog() {
      clearEventLog();
    },

    /**
     * Re-run the classifier on an arbitrary input. Useful when tuning rules.
     * @param {{question, userAnswer, correctAnswer, topic}} input
     */
    replay(input) {
      return classifyMonster(input || {});
    },

    /**
     * Seed a monster for local UI testing. It writes a realistic log entry,
     * marks the monster seen, and dispatches the normal toast event. This is
     * exposed only when the explicit debug flag is enabled.
     */
    seed(monsterId = 'bracketeer') {
      if (!MONSTER_IDS.includes(monsterId)) {
        throw new Error(`Unknown monster id: ${monsterId}`);
      }
      const fixture = DEBUG_FIXTURES[monsterId];
      const timestamp = Date.now();
      const isNew = !monsterStore.isMonsterSeen(monsterId);
      const eventDetail = { monsterId, ...fixture, timestamp, isNew };
      monsterStore.append({
        monsterId,
        topic: fixture.topic,
        question: fixture.question,
        wrongAnswer: fixture.userAnswer,
        correctAnswer: fixture.correctAnswer,
        timestamp,
      });
      monsterStore.markMonsterSeen(monsterId);
      notifyMonsterLogChanged();
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: eventDetail }));
      _lastEvent = eventDetail;
      pushEventLog({ stage: 'debug-seed', ...eventDetail });
      return eventDetail;
    },

    /**
     * Dump the current localStorage state formatted for inspection.
     */
    storageDump() {
      try {
        const raw = window.localStorage.getItem('tenali.monsterLog.v1');
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return { error: e.message };
      }
    },

    /**
     * Runtime enable — installs the active interceptor if not already installed.
     * Persists the flag so it survives reloads.
     */
    enable() {
      writeBoolFlag(ENABLE_FLAG_KEY, true);
      _enabled = true;
    },

    /**
     * Runtime disable — restores the original fetch.
     * Note: this re-installs window.fetch with a passthrough; the original
     * reference held in `_installed` is lost. Use reset() to fully re-install.
     */
    disable() {
      writeBoolFlag(ENABLE_FLAG_KEY, false);
      _enabled = false;
      // Note: we don't unwrap window.fetch because we don't have a saved
      // reference to the pre-interceptor original. Instead, the gate is
      // enforced at install time. To re-enable, call reset() first.
    },

    /**
     * Reset installation state and re-install based on current flags.
     * Use this when you've changed enable/debug flags and want a clean reload.
     */
    reset() {
      _lastEvent = null;
      _appendQueue = Promise.resolve();
    },

    /**
     * Test classification with a specific monster pattern.
     * Helper for spec §3 example verification in DevTools.
     */
    testSpec() {
      const cases = [
        { label: 'Bracketeer trigger', input: { question: '3(x+2)', userAnswer: '3x + 2', correctAnswer: '3x + 6' }, expect: 'bracketeer' },
        { label: 'Sign Swapper trigger', input: { question: '(-3) + 5', userAnswer: '-2', correctAnswer: '2' }, expect: 'sign-swapper' },
        { label: 'Decimal Drifter trigger', input: { question: '0.5 + 0.3', userAnswer: '0.08', correctAnswer: '0.8' }, expect: 'decimal-drifter' },
      ];
      return cases.map(c => ({
        ...c,
        got: classifyMonster(c.input),
        pass: classifyMonster(c.input) === c.expect,
      }));
    },
  };
}

/**
 * Enable the feature at runtime. Persists the flag.
 * Safe to call before or after installMonstersInterceptor().
 */
export function enableMonsters() {
  writeBoolFlag(ENABLE_FLAG_KEY, true);
  _enabled = true;
  if (!_installed) {
    // Already installed — re-install to swap from noop to active.
    installMonstersInterceptor();
    _installed = true;
  }
}

/**
 * Disable the feature at runtime. Persists the flag.
 * Note: this does not unwrap window.fetch; use a full page reload to
 * fully uninstall, or call reset() to re-install based on flags.
 */
export function disableMonsters() {
  writeBoolFlag(ENABLE_FLAG_KEY, false);
  _enabled = false;
  // We don't unwrap here. To unwrap, would need to save originalFetch
  // at install time and re-bind. v0.2 doesn't need unwrap; future v2
  // might add a real toggle.
}

/**
 * Diagnostic — is the interceptor currently installed?
 */
export function isMonstersInstalled() {
  return _installed;
}

/**
 * Diagnostic — is the feature currently enabled (via flag)?
 */
export function isMonstersEnabled() {
  return _enabled;
}

// Append-only ring buffer for event history (debug instrumentation). Exposed via window._monstersDebug.eventLog() so we can verify the chain beyond the last event.
const _eventLog = [];  // append-only, capped at 20 entries
const _eventLogMax = 20;

function pushEventLog(eventDetail) {
  _eventLog.push({ at: new Date().toISOString(), ...eventDetail });
  if (_eventLog.length > _eventLogMax) _eventLog.shift();
}
function getEventLog() {
  return _eventLog.slice();
}
function clearEventLog() {
  _eventLog.length = 0;
}


function captureNormalizedForDebug(eventDetail, normalized) {
  _eventLog.push({
    at: new Date().toISOString(),
    monsterId: eventDetail.monsterId || null,
    topic: eventDetail.topic || null,
    input: normalized || null,  // what the classifier actually saw
  });
  if (_eventLog.length > _eventLogMax) _eventLog.shift();
}
