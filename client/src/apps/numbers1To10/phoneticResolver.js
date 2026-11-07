/**
 * phoneticResolver.js
 *
 * Normalizes speech-to-text transcriptions from Whisper into exact digits (1-10).
 * Handles Indian accents, multilingual numbers (Tamil, Hindi, Telugu),
 * and common child speech acoustic variations.
 */

const NUMBER_PATTERNS = {
  1:  /\b(1|one|won|wan|van|when|run|first|ek|ondru|onnu|onru|okati|un|uno)\b/i,
  2:  /\b(2|two|to|too|tu|do|doo|second|rendu|erandu|irandu|dos)\b/i,
  3:  /\b(3|three|tree|free|thee|tri|third|teen|tin|moonu|moondru|moodu|tres)\b/i,
  4:  /\b(4|four|for|fore|far|ford|fourth|char|chaar|naalu|naangu|cuatro)\b/i,
  5:  /\b(5|five|faiv|fai|fiv|fifth|panch|paanch|anju|aindhu|ainthu|aidu|cinco|bye|buy)\b/i,
  6:  /\b(6|six|siks|sex|sick|sixth|chhe|che|chha|aaru|seis)\b/i,
  7:  /\b(7|seven|sevn|sevan|seventh|saat|sat|yezhu|ezhu|yedu|siete)\b/i,
  8:  /\b(8|eight|ate|ait|eat|eighth|aath|ath|ettu|enimidi|ocho)\b/i,
  9:  /\b(9|nine|nain|nin|night|ninth|nau|no|ombodhu|onpathu|onbathu|thommidi|nueve)\b/i,
  10: /\b(10|ten|tan|tin|den|tenth|das|dus|pathu|patthu|padi|diez)\b/i
};

/**
 * Resolves a raw transcription string to an integer between 1 and 10.
 * Returns null if no valid number is detected.
 *
 * @param {string} rawText
 * @returns {number|null}
 */
export function resolveTextToNumber(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  // Normalize string: lowercase, strip punctuation
  const clean = rawText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();

  // 1. Direct digit check (e.g. "5")
  const digitMatch = clean.match(/\b([1-9]|10)\b/);
  if (digitMatch) {
    return parseInt(digitMatch[1], 10);
  }

  // 2. Pattern matching against number regex map
  for (let num = 1; num <= 10; num++) {
    if (NUMBER_PATTERNS[num].test(clean)) {
      return num;
    }
  }

  return null;
}

export default resolveTextToNumber;

