/**
 * matrixEvaluator.js - Helper calculations and validation for MatrixStudio
 */

/**
 * Parses numeric input string, allowing integers, decimals, and basic fractions (e.g. "3/2" or "-1/2")
 */
export function parseNumericValue(val) {
  if (val === null || val === undefined) return NaN;
  const str = String(val).trim();
  if (!str) return NaN;

  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
  }
  return parseFloat(str);
}

/**
 * Checks if two numbers are approximately equal within tolerance
 */
export function areNumbersClose(a, b, tol = 1e-4) {
  return Math.abs(a - b) < tol;
}

/**
 * Robust Linear Equation Parser for 2D lines:
 * Accepts:
 * - "x + y = 5" or "2x - y = 1"
 * - "y = 2x - 1" or "y = -x + 5"
 * - "-x + 3y = 9"
 * - "3x - 4y = 12"
 *
 * Normalizes to standard form: a*x + b*y = c
 * Returns { valid: true, a, b, c, display, ggbCmd } or { valid: false, error: string }
 */
export function parseLinearEquation(rawStr) {
  if (!rawStr || typeof rawStr !== 'string') {
    return { valid: false, error: 'Please enter a linear equation.' };
  }

  let str = rawStr.trim();
  // Strip superfluous spaces around signs
  str = str.replace(/\s+/g, ' ');

  if (!str.includes('=')) {
    return {
      valid: false,
      error: 'An equation must contain an "=" sign (e.g. x + y = 5 or y = 2x - 1).'
    };
  }

  const parts = str.split('=');
  if (parts.length !== 2) {
    return { valid: false, error: 'The equation should contain exactly one "=" sign.' };
  }

  const lhsStr = parts[0].trim().replace(/\s+/g, '');
  const rhsStr = parts[1].trim().replace(/\s+/g, '');

  if (!lhsStr || !rhsStr) {
    return { valid: false, error: 'Both sides of the equation must have values.' };
  }

  let coeffX = 0;
  let coeffY = 0;
  let totalConst = 0;

  // Helper to parse one side of the equation
  const parseSide = (s, sideSign) => {
    let text = s;
    if (!text.startsWith('+') && !text.startsWith('-')) {
      text = '+' + text;
    }

    // Match terms like +2x, -3y, +x, -y, +5, -1/2x, +3.5
    const termRegex = /([+-])(?:(\d+(?:\.\d+)?(?:\/\d+)?|\d+\/\d+)?([xy])|(\d+(?:\.\d+)?(?:\/\d+)?|\d+\/\d+))/gi;
    let match;
    let consumedLen = 0;

    while ((match = termRegex.exec(text)) !== null) {
      consumedLen += match[0].length;
      const sign = match[1] === '-' ? -1 : 1;
      const varName = match[3] ? match[3].toLowerCase() : null;

      if (varName) {
        let num = 1;
        if (match[2]) {
          num = parseNumericValue(match[2]);
        }
        if (isNaN(num)) return false;
        if (varName === 'x') {
          coeffX += sideSign * sign * num;
        } else if (varName === 'y') {
          coeffY += sideSign * sign * num;
        }
      } else {
        const num = parseNumericValue(match[4]);
        if (isNaN(num)) return false;
        totalConst += sideSign * sign * num;
      }
    }

    return consumedLen === text.length;
  };

  const lhsOk = parseSide(lhsStr, 1);
  const rhsOk = parseSide(rhsStr, -1);

  if (!lhsOk || !rhsOk) {
    return {
      valid: false,
      error: 'Could not parse equation. Please use standard formats like "x + y = 5" or "y = 2x - 1".'
    };
  }

  // We have coeffX*x + coeffY*y + totalConst = 0 => coeffX*x + coeffY*y = -totalConst
  let a = coeffX;
  let b = coeffY;
  let c = -totalConst;

  if (Math.abs(a) < 1e-6 && Math.abs(b) < 1e-6) {
    return { valid: false, error: 'Equation must contain variable x or y.' };
  }

  // If a < 0, multiply entire equation by -1 for clean readability
  if (a < -1e-6 || (Math.abs(a) < 1e-6 && b < -1e-6)) {
    a = -a;
    b = -b;
    c = -c;
  }

  const roundNice = (val) => {
    const rounded = Math.round(val);
    return Math.abs(val - rounded) < 1e-5 ? rounded : parseFloat(val.toFixed(3));
  };

  a = roundNice(a);
  b = roundNice(b);
  c = roundNice(c);

  // Generate canonical display: e.g. "x + y = 5" or "2x - y = 1"
  let xPart = '';
  if (a === 1) xPart = 'x';
  else if (a === -1) xPart = '-x';
  else if (a !== 0) xPart = `${a}x`;

  let yPart = '';
  if (b === 1) yPart = xPart ? '+ y' : 'y';
  else if (b === -1) yPart = xPart ? '- y' : '-y';
  else if (b > 0) yPart = xPart ? `+ ${b}y` : `${b}y`;
  else if (b < 0) yPart = xPart ? `- ${Math.abs(b)}y` : `-${Math.abs(b)}y`;

  const lhsFormatted = [xPart, yPart].filter(Boolean).join(' ') || '0';
  const display = `${lhsFormatted} = ${c}`;
  const ggbCmd = `${a}*x + ${b}*y = ${c}`;

  return {
    valid: true,
    a,
    b,
    c,
    display,
    ggbCmd
  };
}

/**
 * Solves a 2x2 system of linear equations:
 * a1*x + b1*y = c1
 * a2*x + b2*y = c2
 *
 * Returns { solvable: true, x, y, det } or { solvable: false, det: 0 }
 */
export function solve2x2System(a1, b1, c1, a2, b2, c2) {
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < 1e-6) {
    return { solvable: false, det: 0 };
  }
  const x = (c1 * b2 - c2 * b1) / det;
  const y = (a1 * c2 - a2 * c1) / det;

  const roundNice = (v) => {
    const r = Math.round(v);
    return Math.abs(v - r) < 1e-5 ? r : parseFloat(v.toFixed(2));
  };

  return {
    solvable: true,
    x: roundNice(x),
    y: roundNice(y),
    det
  };
}

/**
 * Multiplies a 2x2 matrix with a 2x1 column vector
 * A: [[a11, a12], [a21, a22]]
 * v: [x, y]
 *
 * Returns [y1, y2]
 */
export function multiplyMatrixVector(matrix, vector) {
  const [row1, row2] = matrix;
  const [x, y] = vector;
  const y1 = row1[0] * x + row1[1] * y;
  const y2 = row2[0] * x + row2[1] * y;
  return [y1, y2];
}

/**
 * Validates a user's 2x2 matrix input against expected matrix
 */
export function validateMatrixInput(userMatrix, expectedMatrix) {
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      const userVal = parseNumericValue(userMatrix[r][c]);
      if (isNaN(userVal)) {
        return {
          valid: false,
          error: `Please enter a valid numeric value for Row ${r + 1}, Column ${c + 1}.`
        };
      }
      if (!areNumbersClose(userVal, expectedMatrix[r][c])) {
        return {
          valid: false,
          error: `Row ${r + 1}, Column ${c + 1} does not match the multiplier in the equation.`
        };
      }
    }
  }
  return { valid: true };
}

/**
 * Validates target vector input [b1, b2]
 */
export function validateVectorInput(userVector, expectedVector) {
  for (let i = 0; i < 2; i++) {
    const val = parseNumericValue(userVector[i]);
    if (isNaN(val)) {
      return {
        valid: false,
        error: `Please enter a valid number for entry ${i + 1}.`
      };
    }
    if (!areNumbersClose(val, expectedVector[i])) {
      return {
        valid: false,
        error: `Entry ${i + 1} does not match the equation target.`
      };
    }
  }
  return { valid: true };
}

/**
 * Parses a vector component value, supporting direct numbers or arithmetic expressions (e.g. 2(2)+3(3) or 4+9)
 */
export function parseVectorComponentValue(str) {
  if (!str || typeof str !== 'string' || !str.trim()) return NaN;
  const clean = str.trim().replace(/\s+/g, '').replace(/(\d)\(/g, '$1*(');
  if (/^[0-9+\-*/().]+$/.test(clean)) {
    try {
      const val = Function(`"use strict"; return (${clean})`)();
      if (typeof val === 'number') return val;
    } catch (err) {}
  }
  return parseFloat(str);
}
