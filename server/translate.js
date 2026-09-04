/**
 * Translate module — server-side proxy to Google Cloud Translation.
 *
 * The client's AutoTranslator no longer calls the unofficial Google "gtx"
 * endpoint directly from the browser (unauthenticated, no SLA, and would
 * require shipping an API key to every client). Instead it POSTs here, and
 * this module holds the API key and talks to the official Cloud Translation
 * API (https://cloud.google.com/translate). Results are cached in-memory by
 * "text|targetLang" so repeated phrases (very common — the same UI strings
 * hit by many students) don't re-spend quota.
 *
 * Exposes:
 *   - router (Express Router): POST /api/translate  { text, targetLang }
 *
 * Configuration (env):
 *   GOOGLE_TRANSLATE_API_KEY   required; if unset the route returns the
 *                              original text untranslated (graceful no-op,
 *                              same fallback behavior as before).
 */

const express = require('express');
const logger = require('./lib/logger');

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const ENDPOINT = 'https://translation.googleapis.com/language/translate/v2';
const TRANSLATE_TIMEOUT_MS = 5000;
const MAX_TEXT_LENGTH = 500;

if (!API_KEY) {
  logger.warn(null,'[translate] GOOGLE_TRANSLATE_API_KEY not set — /api/translate will pass text through untranslated.');
}

// In-memory cache: "text|targetLang" -> translated string. Bounded so it
// can't grow unbounded over a long-running server process.
const cache = new Map();
const MAX_CACHE_ENTRIES = 5000;

function cacheGet(key) {
  return cache.get(key);
}

function cacheSet(key, value) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, value);
}

async function translateViaGoogle(text, targetLang) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS);
  try {
    const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: 'en', target: targetLang, format: 'text' }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`translate HTTP ${res.status}`);
    const data = await res.json();
    const translated = data?.data?.translations?.[0]?.translatedText;
    if (!translated) throw new Error('empty translation response');
    return translated;
  } finally {
    clearTimeout(timer);
  }
}

const router = express.Router();

router.post('/', express.json(), async (req, res) => {
  const text = String((req.body || {}).text || '').slice(0, MAX_TEXT_LENGTH);
  const targetLang = String((req.body || {}).targetLang || '').trim();

  if (!text.trim() || !targetLang) {
    return res.status(400).json({ error: 'text and targetLang are required' });
  }

  if (!API_KEY) {
    return res.json({ translated: text });
  }

  const cacheKey = `${text}|${targetLang}`;
  const cached = cacheGet(cacheKey);
  if (cached) {
    return res.json({ translated: cached });
  }

  try {
    const translated = await translateViaGoogle(text, targetLang);
    cacheSet(cacheKey, translated);
    res.json({ translated });
  } catch (err) {
    logger.warn(null,'[translate] request failed, returning original text:', err.message);
    res.json({ translated: text });
  }
});

module.exports = { router };
