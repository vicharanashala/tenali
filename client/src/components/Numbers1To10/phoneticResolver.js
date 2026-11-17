/**
 * phoneticResolver.js
 *
 * Normalizes speech-to-text transcriptions from Whisper into exact digits (1-10).
 * Supports English (en-IN, en-US), child speech acoustic variations,
 * and Indian regional languages (Hindi, Tamil, Telugu) in both transliterated
 * Latin alphabet and native Indic unicode scripts.
 */

// 1. Direct Indic script digit mappings (1 to 10)
const INDIC_DIGIT_MAP = {
  // Devanagari (Hindi, Marathi)
  '१': 1, '२': 2, '३': 3, '४': 4, '५': 5, '६': 6, '७': 7, '८': 8, '९': 9, '१०': 10,
  // Tamil
  '௧': 1, '௨': 2, '௩': 3, '௪': 4, '௫': 5, '௬': 6, '௭': 7, '௮': 8, '௯': 9, '௰': 10,
  // Telugu
  '౧': 1, '౨': 2, '౩': 3, '౪': 4, '౫': 5, '౬': 6, '౭': 7, '౮': 8, '౯': 9, '౧౦': 10
};

// 2. Primary English Digit Words (en-IN / en) - checked FIRST
const PRIMARY_ENGLISH_PATTERNS = {
  1:  /\b(one|first)\b/i,
  2:  /\b(two|second)\b/i,
  3:  /\b(three|third)\b/i,
  4:  /\b(four|fourth)\b/i,
  5:  /\b(five|fifth)\b/i,
  6:  /\b(six|sixth)\b/i,
  7:  /\b(seven|seventh)\b/i,
  8:  /\b(eight|eighth)\b/i,
  9:  /\b(nine|ninth)\b/i,
  10: /\b(ten|tenth)\b/i
};

// 3. Indian English & Child Phonetic Variations
const PHONETIC_ENGLISH_PATTERNS = {
  1:  /\b(won|wan|wun|van|when)\b/i,
  2:  /\b(to|too|tu)\b/i,
  3:  /\b(tree|free|thee|tri|tea)\b/i,
  4:  /\b(for|fore|far|fo)\b/i,
  5:  /\b(faiv|fai|fiv)\b/i,
  6:  /\b(siks|sick|sicks)\b/i,
  7:  /\b(sevn|sevan|sevin)\b/i,
  8:  /\b(ate|ait|eat)\b/i,
  9:  /\b(nain|nin)\b/i,
  10: /\b(tan|tin|den|then)\b/i
};

// 4. Regional Indian Languages (Hindi, Tamil, Telugu) - Transliteration & Native Script
const REGIONAL_PATTERNS = {
  1:  /\b(ek|ondru|onnu|onru|okati|uno|un)\b|एक|ஒன்று|ஒன்னு|ఒకటి/i,
  2:  /\b(do|doo|du|rendu|erandu|irandu|dos)\b|दो|இரண்டு|ரெண்டு|రెండు/i,
  3:  /\b(teen|tin|moonu|moondru|moodu|tres)\b|तीन|மூன்று|மூணு|మూడు/i,
  4:  /\b(char|chaar|naalu|naangu|naalugu|cuatro)\b|चार|நான்கு|நாலு|నాలుగు/i,
  5:  /\b(panch|paanch|anju|aindhu|ainthu|aidu|cinco)\b|पांच|पाँच|ஐந்து|அஞ்சு|ఐదు/i,
  6:  /\b(chhe|che|chha|aaru|seis)\b|छह|ஆறு|ఆరు/i,
  7:  /\b(saat|sat|yezhu|ezhu|yedu|edu|siete)\b|सात|ஏழு|ఏడు/i,
  8:  /\b(aath|ath|ettu|enimidi|ocho)\b|आठ|எட்டு|ఎనిమిది/i,
  9:  /\b(nau|ombodhu|onpathu|onbathu|thommidi|nueve)\b|नौ|ஒன்பது|తొమ్మిది/i,
  10: /\b(das|dus|pathu|patthu|padi|diez)\b|दस|பத்து|పది/i
};

/**
 * Resolves a raw transcription string to an integer between 1 and 10.
 * Priority order:
 *  1. Direct Arabic Digits (1-10)
 *  2. Indic Script Digits (१-१०, ௧-௰, ౧-౧౦)
 *  3. Primary Standard English words ("one", "two", ..., "ten")
 *  4. Child / Indian English phonetic approximations ("tree", "won", "ate", ...)
 *  5. Regional Indian numbers (Hindi, Tamil, Telugu words and scripts)
 *
 * @param {string} rawText
 * @returns {number|null}
 */
export function resolveTextToNumber(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  // 1. Direct Arabic digit check (e.g. "5", "10")
  const digitMatch = rawText.match(/\b([1-9]|10)\b/);
  if (digitMatch) {
    return parseInt(digitMatch[1], 10);
  }

  // 2. Direct Indic script digit check (e.g. "५", "௧", "౨")
  for (const [char, val] of Object.entries(INDIC_DIGIT_MAP)) {
    if (rawText.includes(char)) {
      return val;
    }
  }

  // Normalize string: lowercase, strip punctuation, preserve Unicode letters and numbers
  const clean = rawText
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\"'<>+@\\|[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return null;

  // 3. Primary Standard English words (Highest Priority for English)
  for (let num = 1; num <= 10; num++) {
    if (PRIMARY_ENGLISH_PATTERNS[num].test(clean)) {
      return num;
    }
  }

  // 4. Indian English & Child phonetic variants
  for (let num = 1; num <= 10; num++) {
    if (PHONETIC_ENGLISH_PATTERNS[num].test(clean)) {
      return num;
    }
  }

  // 5. Regional Indian Languages (Hindi, Tamil, Telugu)
  for (let num = 1; num <= 10; num++) {
    if (REGIONAL_PATTERNS[num].test(clean)) {
      return num;
    }
  }

  return null;
}

export default resolveTextToNumber;
