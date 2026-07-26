/**
 * Reverse Engineering Validator & Creativity Scorer
 *
 * Safe algebraic validation and heuristic scoring engine (no eval).
 */

/**
 * Safely parse and evaluate simple numeric expressions (+, -, *, /, ^, sqrt, abs)
 * Returns NaN if string contains unauthorized characters or syntax errors.
 */
function safeEvaluate(exprStr) {
  if (typeof exprStr !== 'string') {
    if (typeof exprStr === 'number') return exprStr;
    return NaN;
  }

  const str = exprStr.trim();
  if (!str) return NaN;

  if (!/^[0-9\.\s\+\-\*\/\^\(\)|sqrt|abs]+$/i.test(str)) {
    return NaN;
  }

  try {
    const tokens = [];
    let i = 0;
    while (i < str.length) {
      const ch = str[i];
      if (/\s/.test(ch)) {
        i++;
        continue;
      }
      if (/[0-9\.]/.test(ch)) {
        let numStr = '';
        while (i < str.length && /[0-9\.]/.test(str[i])) {
          numStr += str[i];
          i++;
        }
        tokens.push({ type: 'NUM', val: parseFloat(numStr) });
      } else if (/[+\-*/^()]/.test(ch)) {
        tokens.push({ type: 'OP', val: ch });
        i++;
      } else if (str.substring(i, i + 4).toLowerCase() === 'sqrt') {
        tokens.push({ type: 'FUNC', val: 'sqrt' });
        i += 4;
      } else if (str.substring(i, i + 3).toLowerCase() === 'abs') {
        tokens.push({ type: 'FUNC', val: 'abs' });
        i += 3;
      } else {
        return NaN;
      }
    }

    let pos = 0;

    function parseExpression() {
      let left = parseTerm();
      while (pos < tokens.length && (tokens[pos].val === '+' || tokens[pos].val === '-')) {
        const op = tokens[pos++].val;
        const right = parseTerm();
        left = op === '+' ? left + right : left - right;
      }
      return left;
    }

    function parseTerm() {
      let left = parseFactor();
      while (pos < tokens.length && (tokens[pos].val === '*' || tokens[pos].val === '/')) {
        const op = tokens[pos++].val;
        const right = parseFactor();
        left = op === '*' ? left * right : left / right;
      }
      return left;
    }

    function parseFactor() {
      let left = parseUnary();
      if (pos < tokens.length && tokens[pos].val === '^') {
        pos++;
        const right = parseFactor();
        left = Math.pow(left, right);
      }
      return left;
    }

    function parseUnary() {
      if (pos < tokens.length && tokens[pos].val === '-') {
        pos++;
        return -parsePrimary();
      }
      if (pos < tokens.length && tokens[pos].val === '+') {
        pos++;
        return parsePrimary();
      }
      return parsePrimary();
    }

    function parsePrimary() {
      if (pos >= tokens.length) return NaN;
      const token = tokens[pos++];
      if (token.type === 'NUM') return token.val;
      if (token.type === 'FUNC') {
        const fn = token.val;
        if (pos < tokens.length && tokens[pos].val === '(') {
          pos++;
          const arg = parseExpression();
          if (pos < tokens.length && tokens[pos].val === ')') pos++;
          if (fn === 'sqrt') return Math.sqrt(arg);
          if (fn === 'abs') return Math.abs(arg);
        }
        return NaN;
      }
      if (token.type === 'OP' && token.val === '(') {
        const val = parseExpression();
        if (pos < tokens.length && tokens[pos].val === ')') pos++;
        return val;
      }
      return NaN;
    }

    const res = parseExpression();
    return pos === tokens.length ? res : NaN;
  } catch (_e) {
    return NaN;
  }
}

/**
 * Validate a student construction and assign a creativity score (1–5 ⭐).
 */
function validateConstruction(topic, target, construction, difficulty = 0) {
  if (!construction) {
    return { correct: false, creativity: 1, feedback: 'No input provided.' };
  }

  switch (topic) {
    case 'addition': {
      const a = Number(construction.a);
      const b = Number(construction.b);
      const numTarget = Number(target);

      if (isNaN(a) || isNaN(b)) {
        return { correct: false, creativity: 1, feedback: 'Please enter valid numbers.' };
      }

      const sum = a + b;
      if (Math.abs(sum - numTarget) > 0.0001) {
        return {
          correct: false,
          creativity: 1,
          feedback: `${a} + ${b} = ${sum}, which does not equal target ${target}.`
        };
      }

      if (difficulty >= 1 && (a === 0 || b === 0)) {
        return {
          correct: false,
          creativity: 1,
          feedback: 'Rule violated: Neither term can be 0.'
        };
      }

      if (difficulty === 3 && (a <= 10 || b <= 10)) {
        return {
          correct: false,
          creativity: 1,
          feedback: 'Rule violated: Both terms must be positive integers > 10.'
        };
      }

      // Tiered Hints (Level 1 concept, Level 2 guidance, Level 3 direct solution)
      const hints = {
        level1: 'Try using a negative number in your addition!',
        level2: `Pick a negative number like -19, then calculate ${numTarget} - (-19) to find the second number.`,
        level3: `Direct 5-Star Solution: Use [(-19) + ${numTarget + 19} = ${numTarget}] to earn 5 Stars!`
      };

      let creativity = 3;
      let creativityLabel = 'Standard';
      let feedback = `${a} + ${b} = ${target} ✓ — Good solution!`;

      if (a === 0 || b === 0 || a === numTarget || b === numTarget) {
        creativity = 1;
        creativityLabel = 'Trivial';
        feedback = `${a} + ${b} = ${target} ✓ — Correct, but trivial (uses zero or target directly).`;
      } else if (a % 10 === 0 && b % 10 === 0 && a > 0 && b > 0) {
        creativity = 2;
        creativityLabel = 'Simple';
        feedback = `${a} + ${b} = ${target} ✓ — Round numbers used.`;
      } else if ((a < 0 || b < 0) && (a % 10 !== 0 || b % 10 !== 0)) {
        creativity = 5;
        creativityLabel = 'Exceptional';
        feedback = `${a} + ${b} = ${target} ✓ — Outstanding use of negative non-round numbers!`;
      } else if (a < 0 || b < 0) {
        creativity = 4;
        creativityLabel = 'Creative';
        feedback = `${a} + ${b} = ${target} ✓ — Great negative addition!`;
      } else if (Math.abs(a - b) > 1 && a > 5 && b > 5) {
        creativity = 4;
        creativityLabel = 'Creative';
        feedback = `${a} + ${b} = ${target} ✓ — Great choice of non-obvious numbers!`;
      }

      return {
        correct: true,
        creativity,
        creativityLabel,
        feedback,
        hints,
        fiveStarHint: hints.level1
      };
    }

    case 'multiplication': {
      const a = Number(construction.a);
      const b = Number(construction.b);
      const numTarget = Number(target);

      if (isNaN(a) || isNaN(b)) {
        return { correct: false, creativity: 1, feedback: 'Please enter valid numbers.' };
      }

      const prod = a * b;
      if (Math.abs(prod - numTarget) > 0.0001) {
        return {
          correct: false,
          creativity: 1,
          feedback: `${a} × ${b} = ${prod}, which does not equal target ${target}.`
        };
      }

      if (difficulty >= 1 && (a <= 1 || b <= 1)) {
        return {
          correct: false,
          creativity: 1,
          feedback: 'Rule violated: Both numbers must be > 1.'
        };
      }
      if (difficulty >= 2 && (a % 10 === 0 || b % 10 === 0)) {
        return {
          correct: false,
          creativity: 1,
          feedback: 'Rule violated: Neither number can be a multiple of 10.'
        };
      }
      if (difficulty === 3 && (a <= 5 || b <= 5)) {
        return {
          correct: false,
          creativity: 1,
          feedback: 'Rule violated: Both numbers must be greater than 5.'
        };
      }

      const hints = {
        level1: 'Try using negative numbers for both factors!',
        level2: `When you multiply two negative numbers, their minus signs cancel out to positive ${numTarget}.`,
        level3: `Direct 5-Star Solution: Use [(-${Math.abs(a || 8)}) × (-${Math.abs(b || 9)}) = ${numTarget}] to earn 5 Stars!`
      };

      let creativity = 3;
      let creativityLabel = 'Standard';
      let feedback = `${a} × ${b} = ${target} ✓ — Correct!`;

      if (a === 1 || b === 1) {
        creativity = 1;
        creativityLabel = 'Trivial';
        feedback = `${a} × ${b} = ${target} ✓ — Multiplying by 1 is trivial.`;
      } else if (a === 2 || b === 2) {
        creativity = 2;
        creativityLabel = 'Simple';
        feedback = `${a} × ${b} = ${target} ✓ — Basic doubling!`;
      } else if (a < 0 && b < 0) {
        creativity = 5;
        creativityLabel = 'Exceptional';
        feedback = `${a} × ${b} = ${target} ✓ — Brilliant double negative factor multiplication!`;
      } else if (a > 3 && b > 3 && a !== b) {
        creativity = 4;
        creativityLabel = 'Creative';
        feedback = `${a} × ${b} = ${target} ✓ — Excellent factorization!`;
      }

      return {
        correct: true,
        creativity,
        creativityLabel,
        feedback,
        hints,
        fiveStarHint: hints.level1
      };
    }

    case 'fractions': {
      const n1 = Number(construction.n1);
      const d1 = Number(construction.d1);
      const n2 = Number(construction.n2);
      const d2 = Number(construction.d2);
      const op = (construction.op || '+').trim();

      if (isNaN(n1) || isNaN(d1) || isNaN(n2) || isNaN(d2) || d1 === 0 || d2 === 0) {
        return { correct: false, creativity: 1, feedback: 'Invalid fraction inputs (denominators cannot be zero).' };
      }

      const v1 = n1 / d1;
      const v2 = n2 / d2;
      const resultVal = op === '-' ? v1 - v2 : v1 + v2;
      const targetVal = safeEvaluate(target) || Number(construction.targetValue) || 0.75;

      if (Math.abs(resultVal - targetVal) > 0.001) {
        return {
          correct: false,
          creativity: 1,
          feedback: `${n1}/${d1} ${op} ${n2}/${d2} = ${resultVal.toFixed(3)}, which does not equal ${target}.`
        };
      }

      if (difficulty >= 2 && d1 === d2) {
        return {
          correct: false,
          creativity: 1,
          feedback: 'Rule violated: Denominators must not be equal.'
        };
      }

      const hints = {
        level1: 'Try fraction subtraction (-) with unequal denominators!',
        level2: `Start with a fraction larger than ${target} (like 7/6) and subtract a smaller fraction!`,
        level3: `Direct 5-Star Solution: Use [(7/6) - (5/12) = ${target}] to earn 5 Stars!`
      };

      let creativity = 3;
      let creativityLabel = 'Standard';
      let feedback = `${n1}/${d1} ${op} ${n2}/${d2} = ${target} ✓ — Great job!`;

      if (d1 === d2) {
        creativity = 2;
        creativityLabel = 'Simple';
        feedback = `${n1}/${d1} ${op} ${n2}/${d2} = ${target} ✓ — Same denominator addition.`;
      } else if (op === '-' && d1 !== d2) {
        creativity = 5;
        creativityLabel = 'Exceptional';
        feedback = `${n1}/${d1} - ${n2}/${d2} = ${target} ✓ — Masterful fraction subtraction with distinct denominators!`;
      } else if (d1 !== d2) {
        creativity = 4;
        creativityLabel = 'Creative';
        feedback = `${n1}/${d1} ${op} ${n2}/${d2} = ${target} ✓ — Impressive fraction construction with distinct denominators!`;
      }

      return {
        correct: true,
        creativity,
        creativityLabel,
        feedback,
        hints,
        fiveStarHint: hints.level1
      };
    }

    case 'linear-equations': {
      const a1 = Number(construction.a1);
      const b1 = Number(construction.b1);
      const a2 = Number(construction.a2);
      const b2 = Number(construction.b2);
      const xTarget = Number(target);

      if (isNaN(a1) || isNaN(b1) || isNaN(a2) || isNaN(b2)) {
        return { correct: false, creativity: 1, feedback: 'Please enter valid coefficients.' };
      }

      if (a1 === a2) {
        return { correct: false, creativity: 1, feedback: 'Invalid equation: coefficients of x are equal (no unique solution).' };
      }

      const leftVal = a1 * xTarget + b1;
      const rightVal = a2 * xTarget + b2;

      if (Math.abs(leftVal - rightVal) > 0.0001) {
        const actualX = (b2 - b1) / (a1 - a2);
        return {
          correct: false,
          creativity: 1,
          feedback: `Your equation (${a1}x + ${b1} = ${a2}x + ${b2}) has solution x = ${actualX}, not x = ${xTarget}.`
        };
      }

      if (difficulty >= 1 && (a1 === 0 || a2 === 0)) {
        return {
          correct: false,
          creativity: 1,
          feedback: 'Rule violated: x must appear on both sides of the equation (a1 and a2 cannot be 0).'
        };
      }
      if (difficulty >= 2 && (a1 === 0 || b1 === 0 || a2 === 0 || b2 === 0)) {
        return {
          correct: false,
          creativity: 1,
          feedback: 'Rule violated: Coefficients and constants must be non-zero.'
        };
      }

      const hints = {
        level1: 'Include x terms on both sides of the equation with a negative constant!',
        level2: `Set left side to 3x - 7, substitute x = ${xTarget} to get ${3 * xTarget - 7}, then choose right side x + ${3 * xTarget - 7 - xTarget}.`,
        level3: `Direct 5-Star Solution: Use [3x - 7 = x + ${2 * xTarget - 7}] to earn 5 Stars!`
      };

      let creativity = 3;
      let creativityLabel = 'Standard';
      let feedback = `${a1}x + ${b1} = ${a2}x + ${b2} ✓ — Correct linear equation!`;

      if (a2 === 0 && b1 === 0) {
        creativity = 1;
        creativityLabel = 'Trivial';
      } else if (a1 !== 0 && a2 !== 0 && (b1 < 0 || b2 < 0)) {
        creativity = 5;
        creativityLabel = 'Exceptional';
        feedback = `${a1}x + ${b1} = ${a2}x + ${b2} ✓ — Exceptional two-sided equation with negative constant!`;
      } else if (a1 !== 0 && a2 !== 0) {
        creativity = 4;
        creativityLabel = 'Creative';
        feedback = `${a1}x + ${b1} = ${a2}x + ${b2} ✓ — Great two-sided linear equation!`;
      }

      return {
        correct: true,
        creativity,
        creativityLabel,
        feedback,
        hints,
        fiveStarHint: hints.level1
      };
    }

    case 'quadratic-equations': {
      const a = Number(construction.a);
      const b = Number(construction.b);
      const c = Number(construction.c);
      const { r1, r2 } = target;

      if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) {
        return { correct: false, creativity: 1, feedback: 'Leading coefficient a cannot be zero.' };
      }

      const expectedB = -a * (r1 + r2);
      const expectedC = a * (r1 * r2);

      if (Math.abs(b - expectedB) > 0.0001 || Math.abs(c - expectedC) > 0.0001) {
        return {
          correct: false,
          creativity: 1,
          feedback: `${a}x² + ${b}x + ${c} = 0 does not have roots ${r1} and ${r2}.`
        };
      }

      if (difficulty === 3 && a <= 1) {
        return {
          correct: false,
          creativity: 1,
          feedback: 'Rule violated: Leading coefficient a must be an integer > 1.'
        };
      }

      const hints = {
        level1: 'Multiply the entire quadratic equation by a leading factor a > 1!',
        level2: `Start with monic roots quadratic x² - ${r1 + r2}x + ${r1 * r2} = 0, then double all terms!`,
        level3: `Direct 5-Star Solution: Use [2x² ${2 * expectedB >= 0 ? '+ ' + (2 * expectedB) : '- ' + Math.abs(2 * expectedB)}x ${2 * expectedC >= 0 ? '+ ' + (2 * expectedC) : '- ' + Math.abs(2 * expectedC)} = 0] to earn 5 Stars!`
      };

      let creativity = 3;
      let creativityLabel = 'Standard';
      let feedback = `${a === 1 ? '' : a}x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0 ✓ — Correct roots!`;

      if (a === 1) {
        creativity = 3;
        creativityLabel = 'Standard';
      } else if (a > 1 || a < 0) {
        creativity = 5;
        creativityLabel = 'Exceptional';
        feedback += ' Brilliant use of non-monic leading coefficient!';
      }

      return {
        correct: true,
        creativity,
        creativityLabel,
        feedback,
        hints,
        fiveStarHint: hints.level1
      };
    }

    case 'geometry': {
      const w = Number(construction.w);
      const h = Number(construction.h);
      const targetArea = Number(target);

      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
        return { correct: false, creativity: 1, feedback: 'Width and height must be positive numbers.' };
      }

      const area = w * h;
      if (Math.abs(area - targetArea) > 0.0001) {
        return {
          correct: false,
          creativity: 1,
          feedback: `Rectangle of ${w} × ${h} has area ${area} cm², target is ${targetArea} cm².`
        };
      }

      if (difficulty >= 1 && (w <= 1 || h <= 1)) {
        return {
          correct: false,
          creativity: 1,
          feedback: 'Rule violated: Both width and length must be integers > 1.'
        };
      }
      if (difficulty >= 2 && w === h) {
        return {
          correct: false,
          creativity: 1,
          feedback: 'Rule violated: Width and length must not be equal (not a square).'
        };
      }

      const hints = {
        level1: 'Use decimal or fractional side dimensions instead of whole numbers!',
        level2: `Choose width = 2.5 cm, then calculate length = ${targetArea} / 2.5.`,
        level3: `Direct 5-Star Solution: Use [2.5 cm × ${targetArea / 2.5} cm = ${targetArea} cm²] to earn 5 Stars!`
      };

      let creativity = 3;
      let creativityLabel = 'Standard';
      let feedback = `Rectangle ${w} cm × ${h} cm = ${targetArea} cm² ✓ — Correct dimensions!`;

      if (w === 1 || h === 1) {
        creativity = 1;
        creativityLabel = 'Trivial';
      } else if (w % 1 !== 0 || h % 1 !== 0) {
        creativity = 5;
        creativityLabel = 'Exceptional';
        feedback += ' Outstanding use of decimal/fractional side dimensions!';
      } else if (w > 2 && h > 2 && w !== h) {
        creativity = 4;
        creativityLabel = 'Creative';
        feedback += ' Excellent choice of dimensions!';
      }

      return {
        correct: true,
        creativity,
        creativityLabel,
        feedback,
        hints,
        fiveStarHint: hints.level1
      };
    }

    default:
      return { correct: false, creativity: 1, feedback: 'Unknown topic category.' };
  }
}

module.exports = { safeEvaluate, validateConstruction };
