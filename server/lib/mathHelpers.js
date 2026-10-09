/**
 * server/lib/mathHelpers.js
 * Centralized, safe mathematical value parsing and answer validation.
 */

/**
 * Safely parses a math string expression without using eval.
 * Supports:
 * - Simple integers / floats ("43.13", "-5")
 * - Fractions ("2/3", "-5/2")
 * - Mixed numbers ("1 1/2", "-2 3/4")
 * - Scientific notation ("1.5e3", "2.1e-4")
 * - Coordinate tuples ("(1/2, 3/4)") -> returns array of numbers [0.5, 0.75]
 *
 * @param {string|number} input
 * @returns {number|number[]|NaN}
 */
function parseMathValue(input) {
  if (input === null || input === undefined) return NaN;
  if (typeof input === 'number') return isNaN(input) ? NaN : input;

  let str = String(input).trim().replace(/−/g, '-');

  if (!str) return NaN;

  // Handle tuple/coordinate pairs like "(1/2, 3/4)" or "1/2, 3/4"
  if (str.startsWith('(') && str.endsWith(')')) {
    str = str.slice(1, -1).trim();
  }

  if (str.includes(',')) {
    const parts = str.split(',').map(p => parseMathValue(p.trim()));
    if (parts.some(p => typeof p !== 'number' || isNaN(p))) return NaN;
    return parts;
  }

  // Handle scientific notation e.g. 1.5e3 or 1.5E-3
  if (/^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/.test(str)) {
    const val = Number(str);
    return isNaN(val) ? NaN : val;
  }

  // Handle mixed numbers e.g. "1 1/2" or "-2 3/4"
  const mixedMatch = str.match(/^([+-]?\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const intPart = parseFloat(mixedMatch[1]);
    const numPart = parseFloat(mixedMatch[2]);
    const denPart = parseFloat(mixedMatch[3]);
    if (denPart === 0) return NaN;
    const fractionVal = numPart / denPart;
    return intPart >= 0 ? intPart + fractionVal : intPart - fractionVal;
  }

  // Handle simple fractions e.g. "2/3" or "-5/2"
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0].trim());
      const den = parseFloat(parts[1].trim());
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
    return NaN;
  }

  // Handle standard numeric floats/ints
  const val = parseFloat(str);
  return isNaN(val) ? NaN : val;
}

/**
 * Compares two math values (numbers or coordinate arrays) within a specified tolerance.
 */
function compareMathValues(studentInput, expectedAnswer, tolerance = 0.001) {
  const v1 = parseMathValue(studentInput);
  const v2 = parseMathValue(expectedAnswer);

  if (Array.isArray(v1) && Array.isArray(v2)) {
    if (v1.length !== v2.length) return false;
    return v1.every((val, i) => Math.abs(val - v2[i]) <= tolerance);
  }

  if (typeof v1 === 'number' && typeof v2 === 'number') {
    if (isNaN(v1) || isNaN(v2)) return false;
    return Math.abs(v1 - v2) <= tolerance;
  }

  return false;
}

/**
 * Text matching that avoids substring false-positives (e.g. "145" matching "4").
 */
function textMatches(input, keywords) {
  if (!input) return false;
  const t = String(input).trim().toLowerCase();
  const kwList = Array.isArray(keywords) ? keywords : [keywords];

  return kwList.some(k => {
    const kw = String(k).trim().toLowerCase();
    if (!kw) return false;

    // Exact match
    if (t === kw) return true;

    // Word-boundary match for words/phrases
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|\\s|\\b)${escaped}(?:$|\\s|\\b)`, 'i');
    return regex.test(t);
  });
}

module.exports = {
  parseMathValue,
  compareMathValues,
  textMatches,
};
