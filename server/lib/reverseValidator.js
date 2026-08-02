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
 * Safely parse target fraction value whether it is a number, object, or string.
 */
function parseTargetVal(target) {
  if (typeof target === 'number') return target;
  if (typeof target === 'object' && target !== null) {
    if (typeof target.val === 'number') return target.val;
    if (typeof target.num === 'number' && typeof target.den === 'number' && target.den !== 0) {
      return target.num / target.den;
    }
  }
  if (typeof target === 'string') {
    const evaluated = safeEvaluate(target);
    if (!isNaN(evaluated)) return evaluated;
  }
  return NaN;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function checkAdditionConstraint(c, qNum) {
  const a = Number(c.a), b = Number(c.b);
  if (qNum === 2 && (a === 0 || b === 0)) return 'Q2 Rule Violated: Neither term can be 0!';
  if (qNum === 3 && (Math.abs(a) <= 1 || Math.abs(b) <= 1)) return 'Q3 Rule Violated: Both terms must be > 1!';
  if (qNum === 4 && a >= 0 && b >= 0) return 'Q4 Rule Violated: Must use at least 1 negative number!';
  if (qNum === 5 && (a % 10 === 0 || b % 10 === 0)) return 'Q5 Rule Violated: Neither term can end in 0!';
  if (qNum === 6 && Math.abs(a - b) <= 5) return 'Q6 Rule Violated: Terms must have non-trivial difference (|a - b| > 5)!';
  if (qNum === 7 && (a >= 0 && b >= 0)) return 'Q7 Rule Violated: Must use a negative number!';
  if (qNum === 8 && (a % 5 === 0 || b % 5 === 0)) return 'Q8 Rule Violated: Neither term can end in 0 or 5!';
  if (qNum === 9 && a % 2 === 0 && b % 2 === 0) return 'Q9 Rule Violated: At least one term must be an odd number!';
  if (qNum === 10 && (a >= 0 && b >= 0 || a % 10 === 0 || b % 10 === 0)) return '🔥 Q10 BOSS Rule Violated: Must use a negative number AND non-round terms!';
  return null;
}

function checkMultiplicationConstraint(c, qNum) {
  const a = Number(c.a), b = Number(c.b);
  if (qNum === 2 && (Math.abs(a) === 1 || Math.abs(b) === 1)) return 'Q2 Rule Violated: Neither factor can be 1!';
  if (qNum === 3 && (Math.abs(a) <= 2 || Math.abs(b) <= 2)) return 'Q3 Rule Violated: Both factors must be > 2!';
  if (qNum === 4 && (a >= 0 || b >= 0)) return 'Q4 Rule Violated: Both factors must be negative numbers!';
  if (qNum === 5 && (a % 10 === 0 || b % 10 === 0)) return 'Q5 Rule Violated: Neither factor can end in 0!';
  if (qNum === 6 && (Math.abs(a) <= 3 || Math.abs(b) <= 3)) return 'Q6 Rule Violated: Both factors must be > 3!';
  if (qNum === 7 && (a >= 0 || b >= 0 || a % 10 === 0 || b % 10 === 0)) return 'Q7 Rule Violated: Double negative non-round factors required!';
  if (qNum === 8 && (a % 5 === 0 || b % 5 === 0)) return 'Q8 Rule Violated: Neither factor can end in 0 or 5!';
  if (qNum === 9 && (a === b || Math.abs(a) <= 4 || Math.abs(b) <= 4)) return 'Q9 Rule Violated: Factors must be distinct and > 4!';
  if (qNum === 10 && (a >= 0 || b >= 0 || a % 10 === 0 || b % 10 === 0)) return '🔥 Q10 BOSS Rule Violated: Double negative non-round factor multiplication required!';
  return null;
}

function checkDivisionConstraint(c, qNum) {
  const a = Number(c.a), b = Number(c.b);
  if (qNum === 2 && Math.abs(b) <= 1) return 'Q2 Rule Violated: Divisor must be > 1!';
  if (qNum === 3 && Math.abs(b) <= 2) return 'Q3 Rule Violated: Divisor must be > 2!';
  if (qNum === 4 && (a >= 0 || b >= 0)) return 'Q4 Rule Violated: Both dividend & divisor must be negative!';
  if (qNum === 5 && b % 10 === 0) return 'Q5 Rule Violated: Divisor cannot end in 0!';
  if (qNum === 6 && Math.abs(b) <= 5) return 'Q6 Rule Violated: Divisor must be > 5!';
  if (qNum === 7 && (a >= 0 || b >= 0)) return 'Q7 Rule Violated: Both dividend & divisor must be negative!';
  if (qNum === 8 && b % 10 === 0) return 'Q8 Rule Violated: Divisor must end in a non-round digit!';
  if (qNum === 9 && (Math.abs(b) <= 10 || b % 10 === 0)) return 'Q9 Rule Violated: Divisor must be > 10 and non-round!';
  if (qNum === 10 && (a >= 0 || b >= 0 || Math.abs(b) <= 10 || b % 10 === 0)) return '🔥 Q10 BOSS Rule Violated: Double negative with non-round divisor > 10 required!';
  return null;
}

function checkFractionsConstraint(c, qNum) {
  const n1 = Number(c.n1), d1 = Number(c.d1), n2 = Number(c.n2), d2 = Number(c.d2);
  const op = (c.op || '+').trim();
  if (qNum === 2 && (Math.abs(d1) <= 1 || Math.abs(d2) <= 1)) return 'Q2 Rule Violated: Denominators must be > 1!';
  if (qNum === 3 && d1 === d2) return 'Q3 Rule Violated: Denominators must not be equal!';
  if (qNum === 4 && op !== '-') return 'Q4 Rule Violated: Must use fraction subtraction (−)!';
  if (qNum === 5 && (op !== '-' || d1 === d2)) return 'Q5 Rule Violated: Subtraction with unequal denominators required!';
  if (qNum === 6 && Math.abs(n1) <= d1) return 'Q6 Rule Violated: Must use an improper fraction (numerator > denominator)!';
  if (qNum === 7 && (op !== '-' || d1 === d2 || Math.abs(n1) <= d1)) return 'Q7 Rule Violated: Subtraction with improper fraction & unequal denominators required!';
  if (qNum === 8 && gcd(d1, d2) !== 1) return 'Q8 Rule Violated: Denominators must be coprime (no common factors)!';
  if (qNum === 9 && n1 >= 0 && n2 >= 0) return 'Q9 Rule Violated: Must use at least 1 negative fraction numerator!';
  if (qNum === 10 && (op !== '-' || Math.abs(n1) <= d1 || gcd(d1, d2) !== 1)) return '🔥 Q10 BOSS Rule Violated: Fraction subtraction with improper fraction & coprime denominators required!';
  return null;
}

function checkLinearConstraint(c, qNum) {
  const a1 = Number(c.a1), b1 = Number(c.b1), a2 = Number(c.a2), b2 = Number(c.b2);
  if (qNum === 2 && (b1 === 0 || b2 === 0)) return 'Q2 Rule Violated: Constant terms b1 and b2 must be non-zero!';
  if (qNum === 3 && (a1 === 0 || a2 === 0)) return 'Q3 Rule Violated: Coefficients a1 and a2 must be non-zero (x on both sides)!';
  if (qNum === 4 && b1 >= 0 && b2 >= 0) return 'Q4 Rule Violated: Must include at least 1 negative constant term!';
  if (qNum === 5 && Math.abs(a1 - a2) <= 1) return 'Q5 Rule Violated: Coefficient difference |a1 - a2| must be > 1!';
  if (qNum === 6 && (a1 === 0 || a2 === 0 || (b1 >= 0 && b2 >= 0))) return 'Q6 Rule Violated: x on both sides AND negative constant term required!';
  if (qNum === 7 && (b1 >= 0 || b2 >= 0)) return 'Q7 Rule Violated: Both constant terms b1 and b2 must be negative!';
  if (qNum === 8 && (b1 % 10 === 0 || b2 % 10 === 0)) return 'Q8 Rule Violated: Constant terms must be non-round (not ending in 0)!';
  if (qNum === 9 && (Math.abs(a1 - a2) <= 2 || b1 >= 0)) return 'Q9 Rule Violated: |a1 - a2| > 2 with negative constant terms required!';
  if (qNum === 10 && (a1 === 0 || a2 === 0 || b1 >= 0 || b2 % 10 === 0)) return '🔥 Q10 BOSS Rule Violated: x on both sides, negative constants, AND non-round coefficients required!';
  return null;
}

function checkQuadraticConstraint(c, qNum) {
  const a = Number(c.a), b = Number(c.b), constC = Number(c.c);
  if (qNum === 2 && constC === 0) return 'Q2 Rule Violated: Constant term c must be non-zero!';
  if (qNum === 3 && b === 0) return 'Q3 Rule Violated: Linear coefficient b must be non-zero!';
  if (qNum === 4 && b <= 0) return 'Q4 Rule Violated: Must have at least 1 negative root!';
  if (qNum === 5 && b <= 0) return 'Q5 Rule Violated: Both roots must be negative numbers!';
  if (qNum === 6 && Math.abs(a) <= 1) return 'Q6 Rule Violated: Leading coefficient a must be > 1 (non-monic)!';
  if (qNum === 7 && (Math.abs(a) < 2 || b <= 0)) return 'Q7 Rule Violated: Non-monic leading a ≥ 2 with negative roots required!';
  if (qNum === 8 && Math.abs(a) < 3) return 'Q8 Rule Violated: Non-monic leading coefficient a ≥ 3 required!';
  if (qNum === 9 && (Math.abs(a) <= 1 || b === 0 || constC === 0)) return 'Q9 Rule Violated: Non-monic leading a > 1 with non-zero b and c required!';
  if (qNum === 10 && (Math.abs(a) < 2 || b <= 0)) return '🔥 Q10 BOSS Rule Violated: Non-monic leading a ≥ 2 with distinct negative roots required!';
  return null;
}

function checkGeometryConstraint(c, qNum) {
  const w = Number(c.w), h = Number(c.h);
  if (qNum === 2 && (w <= 1 || h <= 1)) return 'Q2 Rule Violated: Dimensions must be > 1 cm!';
  if (qNum === 3 && w === h) return 'Q3 Rule Violated: Width and height must not be equal (not a square)!';
  if (qNum === 4 && (w <= 2 || h <= 2)) return 'Q4 Rule Violated: Dimensions must be > 2 cm!';
  if (qNum === 5 && (w % 10 === 0 || h % 10 === 0)) return 'Q5 Rule Violated: Side lengths must be non-round (not ending in 0)!';
  if (qNum === 6 && Number.isInteger(w / h)) return 'Q6 Rule Violated: Aspect ratio w/h must be a non-integer!';
  if (qNum === 7 && w % 1 === 0 && h % 1 === 0) return 'Q7 Rule Violated: Must use at least 1 decimal side length (e.g. 2.5 cm)!';
  if (qNum === 8 && (w % 1 === 0 || h % 1 === 0)) return 'Q8 Rule Violated: Both side lengths must be decimal dimensions!';
  if (qNum === 9 && (w % 1 === 0 || h % 1 === 0 || w % 10 === 0)) return 'Q9 Rule Violated: Decimal side lengths with non-round values required!';
  if (qNum === 10 && (w % 1 === 0 || h % 1 === 0)) return '🔥 Q10 BOSS Rule Violated: Decimal side lengths with non-round values required!';
  return null;
}

function checkBigFourConstraint(c, qNum) {
  const a = Number(c.a), b = Number(c.b), termC = Number(c.c);
  const op1 = (c.op1 || '+').trim(), op2 = (c.op2 || '+').trim();
  if (qNum === 2 && (a === 0 || b === 0 || termC === 0)) return 'Q2 Rule Violated: Neither term can be 0!';
  if (qNum === 3 && (Math.abs(a) <= 1 || Math.abs(b) <= 1 || Math.abs(termC) <= 1)) return 'Q3 Rule Violated: Terms must be > 1!';
  if (qNum === 4 && op1 === op2) return 'Q4 Rule Violated: Must use 2 different operators!';
  if (qNum === 5 && op1 !== '*' && op1 !== '/' && op2 !== '*' && op2 !== '/') return 'Q5 Rule Violated: Must include at least one × or ÷ operator!';
  if (qNum === 6 && a >= 0 && b >= 0 && termC >= 0) return 'Q6 Rule Violated: Must include at least 1 negative term!';
  if (qNum === 7 && ((op1 !== '*' && op1 !== '/' && op2 !== '*' && op2 !== '/') || (a >= 0 && b >= 0 && termC >= 0))) return 'Q7 Rule Violated: Combine × or ÷ with a negative term required!';
  if (qNum === 8 && (a % 5 === 0 || b % 5 === 0 || termC % 5 === 0)) return 'Q8 Rule Violated: All terms must be non-round (not ending in 0 or 5)!';
  if (qNum === 9 && (op1 === op2 || (a >= 0 && b >= 0 && termC >= 0))) return 'Q9 Rule Violated: 2 distinct operators with negative term and non-round values required!';
  if (qNum === 10 && (op1 === op2 || (a >= 0 && b >= 0 && termC >= 0) || a % 10 === 0)) return '🔥 Q10 BOSS Rule Violated: 2 distinct operators (including × or ÷), negative term, AND non-round values required!';
  return null;
}

function checkQuestionConstraints(topic, construction, qNum) {
  if (qNum <= 1) return null; // Q1 is standard warm-up

  switch (topic) {
    case 'addition': return checkAdditionConstraint(construction, qNum);
    case 'multiplication': return checkMultiplicationConstraint(construction, qNum);
    case 'division': return checkDivisionConstraint(construction, qNum);
    case 'fractions': return checkFractionsConstraint(construction, qNum);
    case 'linear-equations': return checkLinearConstraint(construction, qNum);
    case 'quadratic-equations': return checkQuadraticConstraint(construction, qNum);
    case 'geometry': return checkGeometryConstraint(construction, qNum);
    case 'big-four': return checkBigFourConstraint(construction, qNum);
    default: return null;
  }
}

/**
 * Validate a student construction and assign a creativity score (1–5 ⭐).
 */
function validateConstruction(topic, target, construction, difficulty = 0, questionNumber = 1) {
  if (!construction) {
    return { correct: false, creativity: 1, feedback: 'No input provided.' };
  }

  const safeQ = Math.max(1, Math.min(10, parseInt(questionNumber, 10) || 1));
  const constraintErr = checkQuestionConstraints(topic, construction, safeQ);
  if (constraintErr) {
    return { correct: false, creativity: 1, feedback: constraintErr };
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

      const hints = {
        level1: 'Try using a negative non-round number in your addition!',
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
      } else if (Math.abs(a) <= 2 || Math.abs(b) <= 2 || (a % 10 === 0 && b % 10 === 0)) {
        creativity = 2;
        creativityLabel = 'Simple';
        feedback = `${a} + ${b} = ${target} ✓ — Simple addition (uses small or round numbers).`;
      } else if ((a < 0 || b < 0) && a % 10 !== 0 && b % 10 !== 0) {
        creativity = 5;
        creativityLabel = 'Exceptional';
        feedback = `${a} + ${b} = ${target} ✓ — Outstanding use of negative non-round numbers!`;
      } else if (a < 0 || b < 0) {
        creativity = 4;
        creativityLabel = 'Creative';
        feedback = `${a} + ${b} = ${target} ✓ — Great negative addition!`;
      } else if (Math.abs(a - b) > 1 && a > 5 && b > 5 && a % 10 !== 0 && b % 10 !== 0) {
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

      const sampleA = Math.abs(a) > 1 && a !== numTarget ? Math.abs(a) : 8;
      const sampleB = Math.round(numTarget / sampleA);

      const hints = {
        level1: 'Try using negative numbers for BOTH factors!',
        level2: `When you multiply two negative numbers, their minus signs cancel out to positive ${numTarget}.`,
        level3: `Direct 5-Star Solution: Use [(-${sampleA}) × (-${sampleB}) = ${numTarget}] to earn 5 Stars!`
      };

      let creativity = 3;
      let creativityLabel = 'Standard';
      let feedback = `${a} × ${b} = ${target} ✓ — Correct!`;

      if (a === 1 || b === 1) {
        creativity = 1;
        creativityLabel = 'Trivial';
        feedback = `${a} × ${b} = ${target} ✓ — Multiplying by 1 is trivial.`;
      } else if (a === 2 || b === 2 || a === 10 || b === 10) {
        creativity = 2;
        creativityLabel = 'Simple';
        feedback = `${a} × ${b} = ${target} ✓ — Simple factor pair.`;
      } else if (a < 0 && b < 0) {
        creativity = 5;
        creativityLabel = 'Exceptional';
        feedback = `${a} × ${b} = ${target} ✓ — Brilliant double negative factor multiplication!`;
      } else if (Math.abs(a) > 3 && Math.abs(b) > 3) {
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

    case 'division': {
      const a = Number(construction.a);
      const b = Number(construction.b);
      const numTarget = Number(target);

      if (isNaN(a) || isNaN(b)) {
        return { correct: false, creativity: 1, feedback: 'Please enter valid numbers.' };
      }

      if (b === 0) {
        return { correct: false, creativity: 1, feedback: 'Division by zero is undefined!' };
      }

      const quot = a / b;
      if (Math.abs(quot - numTarget) > 0.0001) {
        return {
          correct: false,
          creativity: 1,
          feedback: `${a} ÷ ${b} = ${quot}, which does not equal target ${target}.`
        };
      }

      const hints = {
        level1: 'Try using negative numbers for both dividend and divisor!',
        level2: `When you divide two negative numbers, their minus signs cancel out to positive ${numTarget}.`,
        level3: `Direct 5-Star Solution: Use [(-${numTarget * 12}) ÷ (-12) = ${numTarget}] to earn 5 Stars!`
      };

      let creativity = 3;
      let creativityLabel = 'Standard';
      let feedback = `${a} ÷ ${b} = ${target} ✓ — Correct!`;

      if (a === numTarget || b === 1) {
        creativity = 1;
        creativityLabel = 'Trivial';
        feedback = `${a} ÷ ${b} = ${target} ✓ — Dividing by 1 is trivial.`;
      } else if (b === 2 || b === 10) {
        creativity = 2;
        creativityLabel = 'Simple';
        feedback = `${a} ÷ ${b} = ${target} ✓ — Basic division!`;
      } else if (a < 0 && b < 0) {
        creativity = 5;
        creativityLabel = 'Exceptional';
        feedback = `${a} ÷ ${b} = ${target} ✓ — Outstanding double negative division!`;
      } else if (b > 10 && b % 10 !== 0) {
        creativity = 5;
        creativityLabel = 'Exceptional';
        feedback = `${a} ÷ ${b} = ${target} ✓ — Impressive non-round divisor!`;
      } else if (b > 5) {
        creativity = 4;
        creativityLabel = 'Creative';
        feedback = `${a} ÷ ${b} = ${target} ✓ — Great choice of divisor!`;
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
      const targetVal = parseTargetVal(target);

      const targetDisplay = typeof target === 'object' && target !== null && target.display ? target.display : target;

      if (isNaN(targetVal) || Math.abs(resultVal - targetVal) > 0.001) {
        return {
          correct: false,
          creativity: 1,
          feedback: `${n1}/${d1} ${op} ${n2}/${d2} = ${resultVal.toFixed(3)}, which does not equal ${targetDisplay}.`
        };
      }

      const hints = {
        level1: 'Try fraction subtraction (-) with unequal denominators!',
        level2: `Start with a fraction larger than ${targetDisplay} (like 7/6) and subtract a smaller fraction!`,
        level3: `Direct 5-Star Solution: Use [(7/6) - (5/12) = ${targetDisplay}] to earn 5 Stars!`
      };

      let creativity = 3;
      let creativityLabel = 'Standard';
      let feedback = `${n1}/${d1} ${op} ${n2}/${d2} = ${targetDisplay} ✓ — Great job!`;

      if (d1 === d2) {
        creativity = 2;
        creativityLabel = 'Simple';
        feedback = `${n1}/${d1} ${op} ${n2}/${d2} = ${targetDisplay} ✓ — Same denominator addition.`;
      } else if (op === '-' && d1 !== d2 && Math.abs(n1) > d1) {
        creativity = 5;
        creativityLabel = 'Exceptional';
        feedback = `${n1}/${d1} - ${n2}/${d2} = ${targetDisplay} ✓ — Masterful improper fraction subtraction with distinct denominators!`;
      } else if (op === '-' && d1 !== d2) {
        creativity = 4;
        creativityLabel = 'Creative';
        feedback = `${n1}/${d1} - ${n2}/${d2} = ${targetDisplay} ✓ — Excellent fraction subtraction with distinct denominators!`;
      } else if (d1 !== d2) {
        creativity = 4;
        creativityLabel = 'Creative';
        feedback = `${n1}/${d1} ${op} ${n2}/${d2} = ${targetDisplay} ✓ — Impressive fraction construction with distinct denominators!`;
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

      const hints = {
        level1: 'Include x terms on both sides with a negative constant and coefficient difference > 1!',
        level2: `Set left side to 3x - 7, substitute x = ${xTarget} to get ${3 * xTarget - 7}, then choose right side x + ${3 * xTarget - 7 - xTarget}.`,
        level3: `Direct 5-Star Solution: Use [3x - 7 = x + ${2 * xTarget - 7}] to earn 5 Stars!`
      };

      let creativity = 3;
      let creativityLabel = 'Standard';
      let feedback = `${a1}x + ${b1} = ${a2}x + ${b2} ✓ — Correct linear equation!`;

      if (a2 === 0) {
        creativity = 1;
        creativityLabel = 'Trivial';
        feedback = `${a1}x + ${b1} = ${b2} ✓ — One-sided linear equation.`;
      } else if (b1 === 0 || b2 === 0) {
        creativity = 2;
        creativityLabel = 'Simple';
        feedback = `${a1}x + ${b1} = ${a2}x + ${b2} ✓ — Simple equation with zero constant.`;
      } else if (a1 !== 0 && a2 !== 0 && (b1 < 0 || b2 < 0) && Math.abs(a1 - a2) > 1) {
        creativity = 5;
        creativityLabel = 'Exceptional';
        feedback = `${a1}x + ${b1} = ${a2}x + ${b2} ✓ — Exceptional two-sided equation with negative constant!`;
      } else if (a1 !== 0 && a2 !== 0 && Math.abs(a1 - a2) > 1) {
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
      const r1 = typeof target === 'object' && target !== null ? Number(target.r1) : 3;
      const r2 = typeof target === 'object' && target !== null ? Number(target.r2) : -2;

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

      const hints = {
        level1: 'Multiply the entire quadratic equation by a leading factor a > 1!',
        level2: `Start with monic roots quadratic x² - ${r1 + r2}x + ${r1 * r2} = 0, then double all terms!`,
        level3: `Direct 5-Star Solution: Use [2x² ${2 * expectedB >= 0 ? '+ ' + (2 * expectedB) : '- ' + Math.abs(2 * expectedB)}x ${2 * expectedC >= 0 ? '+ ' + (2 * expectedC) : '- ' + Math.abs(2 * expectedC)} = 0] to earn 5 Stars!`
      };

      let creativity = 3;
      let creativityLabel = 'Standard';
      let feedback = `${a === 1 ? '' : a}x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0 ✓ — Correct roots!`;

      if (a === 1 && (b === 0 || c === 0)) {
        creativity = 1;
        creativityLabel = 'Trivial';
        feedback = `x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0 ✓ — Trivial quadratic (zero term).`;
      } else if (a === 1 && (r1 === 0 || r2 === 0)) {
        creativity = 2;
        creativityLabel = 'Simple';
        feedback = `x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0 ✓ — Simple zero-root quadratic.`;
      } else if (Math.abs(a) > 1) {
        creativity = 5;
        creativityLabel = 'Exceptional';
        feedback += ' Brilliant use of non-monic leading coefficient!';
      } else if (r1 < 0 && r2 < 0) {
        creativity = 4;
        creativityLabel = 'Creative';
        feedback += ' Great double-negative root construction!';
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
        feedback = `Rectangle ${w} cm × ${h} cm = ${targetArea} cm² ✓ — Trivial 1 cm dimension.`;
      } else if (w === h) {
        creativity = 2;
        creativityLabel = 'Simple';
        feedback = `Square ${w} cm × ${h} cm = ${targetArea} cm² ✓ — Simple square dimensions.`;
      } else if (w % 1 !== 0 || h % 1 !== 0) {
        creativity = 5;
        creativityLabel = 'Exceptional';
        feedback += ' Outstanding use of decimal/fractional side dimensions!';
      } else if (w > 2 && h > 2 && w !== h && (w % h !== 0 && h % w !== 0)) {
        creativity = 4;
        creativityLabel = 'Creative';
        feedback += ' Excellent choice of non-divisible dimensions!';
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

    case 'big-four': {
      const a = Number(construction.a);
      const b = Number(construction.b);
      const c = Number(construction.c);
      const rawOp1 = (construction.op1 || '+').trim();
      const rawOp2 = (construction.op2 || '+').trim();
      const numTarget = Number(target);

      if (isNaN(a) || isNaN(b) || isNaN(c)) {
        return { correct: false, creativity: 1, feedback: 'Please enter valid numbers for terms a, b, and c.' };
      }

      const opMap = { '+': '+', '-': '-', '×': '*', '*': '*', '÷': '/', '/': '/' };
      const op1 = opMap[rawOp1] || '+';
      const op2 = opMap[rawOp2] || '+';

      // Evaluate (a op1 b)
      if (op1 === '/' && b === 0) {
        return { correct: false, creativity: 1, feedback: 'Division by zero is undefined in first step!' };
      }
      const step1 = op1 === '+' ? a + b : op1 === '-' ? a - b : op1 === '*' ? a * b : a / b;

      // Evaluate step1 op2 c
      if (op2 === '/' && c === 0) {
        return { correct: false, creativity: 1, feedback: 'Division by zero is undefined in second step!' };
      }
      const finalVal = op2 === '+' ? step1 + c : op2 === '-' ? step1 - c : op2 === '*' ? step1 * c : step1 / c;

      const displayOp1 = op1 === '*' ? '×' : op1 === '/' ? '÷' : op1;
      const displayOp2 = op2 === '*' ? '×' : op2 === '/' ? '÷' : op2;
      const exprDisplay = `(${a} ${displayOp1} ${b}) ${displayOp2} ${c}`;

      if (Math.abs(finalVal - numTarget) > 0.001) {
        return {
          correct: false,
          creativity: 1,
          feedback: `${exprDisplay} = ${finalVal}, which does not equal target ${target}.`
        };
      }

      const hints = {
        level1: 'Combine multiplication (×) or division (÷) with negative numbers!',
        level2: 'Try setting (a × b) to a value larger than target, then subtract c!',
        level3: `Direct 5-Star Solution: Try [(-5 + 23) × 4 = 72] to earn 5 Stars!`
      };

      let creativity = 3;
      let creativityLabel = 'Standard';
      let feedback = `${exprDisplay} = ${target} ✓ — Great 2-step solution!`;

      const hasZeroOrOne = a === 0 || b === 0 || c === 0 || a === 1 || b === 1 || c === 1;
      const hasMultDiv = op1 === '*' || op1 === '/' || op2 === '*' || op2 === '/';
      const hasNegatives = a < 0 || b < 0 || c < 0;

      if (hasZeroOrOne) {
        creativity = 1;
        creativityLabel = 'Trivial';
        feedback = `${exprDisplay} = ${target} ✓ — Uses 0 or 1 (trivial step).`;
      } else if (op1 === op2) {
        creativity = 2;
        creativityLabel = 'Simple';
        feedback = `${exprDisplay} = ${target} ✓ — Repeated same operator.`;
      } else if (hasNegatives && hasMultDiv) {
        creativity = 5;
        creativityLabel = 'Exceptional';
        feedback = `${exprDisplay} = ${target} ✓ — Outstanding combination of negative numbers with multiplication/division!`;
      } else if (hasMultDiv && op1 !== op2) {
        creativity = 4;
        creativityLabel = 'Creative';
        feedback = `${exprDisplay} = ${target} ✓ — Excellent combination of distinct arithmetic operators!`;
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
