const superscripts = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-'
};

export function parseMathValue(str) {
  if (typeof str !== 'string' && typeof str !== 'number') return NaN;
  if (typeof str === 'number') return str;
  str = String(str).trim().replace(/\s+/g, ' ').replace(/×/g, 'x').replace(/−/g, '-').replace(/\^/g, '^');
  
  let normStr = str.replace(/10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)/g, '10^$1');
  for (const [sup, num] of Object.entries(superscripts)) {
    normStr = normStr.split(sup).join(num);
  }
  
  normStr = normStr.replace(/\s*x\s*10\s*\^?\s*(-?\d+)/i, 'e$1');
  
  if (/^[+-]?\d*\.?\d+(?:e[+-]?\d+)?$/i.test(normStr)) {
    return parseFloat(normStr);
  }
  
  let fracMatch = normStr.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    if (den === 0) return NaN;
    return num / den;
  }
  
  let mixedMatch = normStr.match(/^([+-]?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) {
    const whole = parseFloat(mixedMatch[1]);
    const num = parseFloat(mixedMatch[2]);
    const den = parseFloat(mixedMatch[3]);
    if (den === 0) return NaN;
    const isNeg = whole < 0 || Object.is(whole, -0) || mixedMatch[1].startsWith('-');
    const sign = isNeg ? -1 : 1;
    return sign * (Math.abs(whole) + (num / den));
  }
  
  return NaN;
}

export function compareNumericAnswers(userStr, expectedVal, tol = 0.001) {
  const uv = parseMathValue(userStr);
  let ev = typeof expectedVal === 'number' ? expectedVal : parseMathValue(expectedVal);
  if (isNaN(uv) || isNaN(ev)) return false;
  return Math.abs(uv - ev) <= tol;
}
