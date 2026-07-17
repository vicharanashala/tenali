module.exports = { generateExplanation };

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

/**
 * Generate a detailed, educational step-by-step explanation for how to solve the problem.
 * Covers all ~60 puzzle types with contextual teaching.
 *
 * @param {object} req - Express request object (contains path and body)
 * @param {object} data - Response data object from the check endpoint
 * @returns {string|null} Explanation text or null if unable to generate
 */
function generateExplanation(req, data) {
  const p = req.path;
  const b = req.body || {};
  const d = data || {};
  const ans = d.correctAnswer ?? d.display ?? d.answer ?? '';

  try {

  // ── Basic Arithmetic ──────────────────────────────────────────
  if (p.includes('basicarith-api')) {
    const { a, b: num2, op } = b;
    const r = d.correctAnswer;
    let s = `Problem: ${a} ${op} ${num2}\n\n`;
    if (op === '+') {
      if (Number(a) < 0 || Number(num2) < 0) {
        s += `When adding negative numbers, think of a number line.\n`;
        s += `Move right for positive, left for negative.\n`;
      }
      s += `${a} + ${num2} = ${r}\n\n`;
      s += `Tip: Addition means combining quantities together.`;
    } else if (op === '−' || op === '-') {
      s += `Subtraction means finding the difference.\n`;
      if (Number(num2) < 0) s += `Subtracting a negative is the same as adding: ${a} − (${num2}) = ${a} + ${Math.abs(num2)} = ${r}\n`;
      else s += `${a} − ${num2} = ${r}\n`;
      s += `\nTip: Think "how far apart are these numbers on the number line?"`;
    } else if (op === '×') {
      s += `Multiplication means repeated addition.\n`;
      const absA = Math.abs(Number(a)), absB = Math.abs(Number(num2));
      s += `${absA} × ${absB} = ${absA * absB}\n`;
      const neg = (Number(a) < 0) !== (Number(num2) < 0);
      if (neg) s += `One number is negative → result is negative: ${r}\n`;
      else if (Number(a) < 0 && Number(num2) < 0) s += `Both negative → result is positive: ${r}\n`;
      s += `\nRule: positive × positive = positive\nnegative × positive = negative\nnegative × negative = positive`;
    } else if (op === '÷') {
      // Division explanation
      s += `Division asks: "How many times does ${num2} fit into ${a}?"\n`;
      const absA = Math.abs(Number(a)), absB = Math.abs(Number(num2));
      s += `\nStep 1: Divide the absolute values.\n`;
      s += `  ${absA} ÷ ${absB} = ${absB === 0 ? 'undefined' : absA / absB}\n\n`;
      s += `Step 2: Apply the sign rule (same as multiplication):\n`;
      const neg = (Number(a) < 0) !== (Number(num2) < 0);
      if (neg) s += `  One operand negative → quotient is negative.\n`;
      else if (Number(a) < 0 && Number(num2) < 0) s += `  Both operands negative → quotient is positive.\n`;
      else s += `  Both operands positive → quotient is positive.\n`;
      s += `\nAnswer: ${a} ÷ ${num2} = ${r}\n\n`;
      s += `Rule: positive ÷ positive = positive\nnegative ÷ positive = negative\nnegative ÷ negative = positive\nNote: division by 0 is undefined.`;
    }
    return s;
  }

  // ── Column Addition (must check before plain addition-api) ────
  if (p.includes('column-addition-api')) {
    const { a, b: num2 } = b;
    const sum = (d.correctAnswer != null) ? d.correctAnswer : a + num2;
    const aStr = String(a), bStr = String(num2), sStr = String(sum);
    const maxLen = Math.max(aStr.length, bStr.length);
    const aPad = aStr.padStart(maxLen, ' '), bPad = bStr.padStart(maxLen, ' ');
    let s = `Problem: Column addition of ${a} + ${num2}\n\n`;
    s += `Working right to left, column by column:\n`;
    let carry = 0;
    for (let i = maxLen - 1; i >= 0; i--) {
      const da = parseInt(aPad[i]) || 0, db = parseInt(bPad[i]) || 0;
      const total = da + db + carry;
      const outDigit = total % 10;
      const newCarry = total >= 10 ? 1 : 0;
      s += `  ${da} + ${db}${carry ? ' + carry ' + carry : ''} = ${total} → write ${outDigit}${newCarry ? ', carry 1' : ''}\n`;
      carry = newCarry;
    }
    s += `\nAnswer: ${a} + ${num2} = ${sum}`;
    return s;
  }

  // ── Column Multiplication ────────────────────────────────────
  if (p.includes('column-multiplication-api')) {
    const { a, b: num2 } = b;
    const product = (d.correctAnswer != null) ? d.correctAnswer : a * num2;
    const aStr = String(a);
    const bStr = String(num2);
    const bLen = bStr.length;
    let s = `Problem: Column multiplication of ${a} × ${num2}\n\n`;

    if (bLen > 1) {
      s += `Multiplier ${num2} has ${bLen} digits. We compute one partial product per multiplier digit (right to left), then add them:\n\n`;
      let partials = [];
      let pow = 1;
      for (let bi = bStr.length - 1; bi >= 0; bi--) {
        const bd = parseInt(bStr[bi]);
        const partial = a * bd;
        partials.push(partial);
        s += `Partial product ${partials.length} (${a} × ${bd}):\n`;
        let carry = 0;
        for (let i = aStr.length - 1; i >= 0; i--) {
          const da = parseInt(aStr[i]) || 0;
          const total = da * bd + carry;
          const outDigit = total % 10;
          const newCarry = Math.floor(total / 10);
          s += `  ${da} × ${bd}${carry ? ' + carry ' + carry : ''} = ${total} → write ${outDigit}${newCarry ? ', carry ' + newCarry : ''}\n`;
          carry = newCarry;
        }
        if (pow > 1) s += `  (shift left ${Math.log10(pow)} place${Math.log10(pow) > 1 ? 's' : ''})\n`;
        s += `  = ${partial}${pow > 1 ? ' × ' + pow : ''}\n\n`;
        pow *= 10;
      }
      s += `Add all partial products: ${partials.map((p, i) => p * Math.pow(10, bLen - 1 - i)).join(' + ')} = ${product}`;
    } else {
      s += `Multiply each digit of ${a} by ${num2}, right to left, carrying as needed:\n`;
      let carry = 0;
      for (let i = aStr.length - 1; i >= 0; i--) {
        const da = parseInt(aStr[i]) || 0;
        const total = da * num2 + carry;
        const outDigit = total % 10;
        const newCarry = Math.floor(total / 10);
        s += `  ${da} × ${num2}${carry ? ' + carry ' + carry : ''} = ${total} → write ${outDigit}${newCarry ? ', carry ' + newCarry : ''}\n`;
        carry = newCarry;
      }
      s += `\nAnswer: ${a} × ${num2} = ${product}`;
    }
    return s;
  }

  // ── Column Subtraction (must check before plain subtraction-api) ──
  // Grade-school narration: right to left. Whenever the top digit is smaller
  // than the bottom digit, the child "converts" that top digit by crossing it
  // out, writing the next-left larger digit's −1 above, and the column's +10.
  // Example for 23 − 18:
  //   Step 1: 3 < 8, convert 3 → 13, then 13 − 8 = 5
  //   Step 2: 2 was borrowed from, so top is now 1, then 1 − 1 = 0
  if (p.includes('column-subtraction-api')) {
    const { a, b: num2 } = b;
    const diff = (d.correctAnswer != null) ? d.correctAnswer : a - num2;
    const aStr = String(a), bStr = String(num2);
    const len = Math.max(aStr.length, bStr.length, String(diff).length);

    // workMinuend[i] = the top digit currently in column i after any earlier borrows.
    // workMinuend[i] may be 9 (because a column passed through as part of a cascade),
    // or it may be the digit minus the borrow-out that already left it.
    const workMinuend = aStr.padStart(len, ' ').split('').map(d => d === ' ' ? 0 : Number(d));
    const workSubtrahend = bStr.padStart(len, ' ').split('').map(d => d === ' ' ? 0 : Number(d));

    let s = `Problem: Column subtraction of ${a} − ${num2}\n\n`;
    const lines = [];

    for (let i = len - 1; i >= 0; i--) {
      const top = workMinuend[i];
      const bot = workSubtrahend[i];
      if (top < bot) {
        // Find the nearest non-zero column to the left, reduce it by 1, and
        // fill the columns between with 9s. That gives the new "top" digit
        // for column i: top + 10.
        let k = i - 1;
        while (k >= 0 && workMinuend[k] === 0) k--;
        if (k < 0) {
          // Nothing to borrow from (shouldn't happen with a >= b).
          lines.push(`Step: convert top ${top} → ${top + 10}, then ${top + 10} − ${bot} = ${top + 10 - bot}`);
        } else {
          workMinuend[k] -= 1;
          for (let j = k + 1; j < i; j++) workMinuend[j] = 9;
          const newTop = top + 10;
          const shownOldTop = (top === 0 && i > k + 1)
            ? `0 (became 9 after the borrow passed through)`
            : `${top}`;
          lines.push(`Step: ${top} < ${bot}, convert top ${shownOldTop} → ${newTop}, then ${newTop} − ${bot} = ${newTop - bot}`);
          workMinuend[i] = newTop - bot; // updated remaining top isn't needed further, just records result
        }
      } else {
        lines.push(`Step: ${top} − ${bot} = ${top - bot}`);
      }
    }

    lines.forEach((ln, i) => s += `${ln}\n`);
    s += `\nAnswer: ${a} − ${num2} = ${diff}`;
    return s;
  }

  // ── Addition ──────────────────────────────────────────────────
  if (p.includes('addition-api')) {
    const { a, b: num2 } = b;
    return `Problem: ${a} + ${num2}\n\nAdd the two numbers together:\n${a} + ${num2} = ${d.correctAnswer}\n\nTip: For large additions, break numbers into place values.\nExample: ${a} = ${Math.floor(a/10)*10} + ${a%10}, then add.`;
  }

  // ── Multiplication Tables ─────────────────────────────────────
  if (p.includes('multiply-api')) {
    const { table, multiplier } = b;
    const r = d.correctAnswer;
    return `Problem: ${table} × ${multiplier}\n\nThis is the ${table}-times table:\n${table} × ${multiplier} = ${r}\n\nTip: Multiplication is repeated addition.\n${table} × ${multiplier} means adding ${table} to itself ${multiplier} times.\n${Array.from({length: Math.min(multiplier, 5)}, (_, i) => table).join(' + ')}${multiplier > 5 ? ' + ...' : ''} = ${r}`;
  }

  // ── Quadratic Evaluation ──────────────────────────────────────
  if (p.includes('quadratic-api') && !p.includes('qformula')) {
    const { a, b: bCoeff, c, x } = b;
    const r = d.correctAnswer;
    let s = `Problem: Evaluate y = ${a}x² + ${bCoeff}x + ${c} at x = ${x}\n\n`;
    s += `Step 1: Substitute x = ${x} into each term:\n`;
    const t1 = a * x * x, t2 = bCoeff * x;
    s += `  ${a}(${x})² = ${a} × ${x*x} = ${t1}\n`;
    s += `  ${bCoeff}(${x}) = ${t2}\n`;
    s += `  constant = ${c}\n\n`;
    s += `Step 2: Add all terms:\n`;
    s += `  ${t1} + ${t2} + ${c} = ${r}\n\n`;
    s += `Tip: Always compute x² first, then multiply by the coefficient.`;
    return s;
  }

  // ── Square Roots ──────────────────────────────────────────────
  if (p.includes('sqrt-api')) {
    const { q } = b;
    const fl = d.floorAnswer, ce = d.ceilAnswer;
    let s = `Problem: Approximate √${q}\n\n`;
    s += `Step 1: Find perfect squares around ${q}:\n`;
    s += `  ${fl}² = ${fl*fl}\n  ${ce}² = ${ce*ce}\n\n`;
    s += `Step 2: Since ${fl*fl} ≤ ${q} ≤ ${ce*ce}:\n`;
    s += `  ${fl} ≤ √${q} ≤ ${ce}\n\n`;
    s += `√${q} ≈ ${d.sqrtRounded}\n\n`;
    s += `Tip: Memorise perfect squares (1, 4, 9, 16, 25, 36, 49, 64, 81, 100...) to estimate roots quickly.`;
    return s;
  }

  // ── Fraction Addition / Subtraction / Multiplication / Division ──
  if (p.includes('fractionadd-api')) {
    const { n1, d1, n2, d2, mixed, w1, w2 } = b;
    const op = b.op || '+';
    const opWord = op === '+' ? 'Add' : (op === '−' || op === '-') ? 'Subtract' : (op === '×' || op === '*') ? 'Multiply' : 'Divide';
    let s = '';
    if (mixed) {
      s += `Problem: ${w1} ${n1}/${d1} ${op} ${w2} ${n2}/${d2}\n\n`;
      s += `Step 1: Convert mixed numbers to improper fractions:\n`;
      const imp1 = w1 * d1 + n1, imp2 = w2 * d2 + n2;
      s += `  ${w1} ${n1}/${d1} = ${imp1}/${d1}\n`;
      s += `  ${w2} ${n2}/${d2} = ${imp2}/${d2}\n\n`;
      if (op === '+' || op === '−' || op === '-') {
        s += `Step 2: Use a common denominator and ${opWord.toLowerCase()} numerators.\n`;
      } else if (op === '×' || op === '*') {
        s += `Step 2: Multiply numerators together and denominators together: (${imp1} × ${imp2}) / (${d1} × ${d2}).\n`;
      } else {
        s += `Step 2: Invert the second fraction and multiply: (${imp1}/${d1}) × (${d2}/${imp2}).\n`;
      }
    } else {
      s += `Problem: ${n1}/${d1} ${op} ${n2}/${d2}\n\n`;
      if (op === '+' || op === '−' || op === '-') {
        if (d1 === d2) {
          s += `Step 1: Same denominators! ${opWord} numerators directly:\n`;
          const combined = (op === '+') ? (n1 + n2) : (n1 - n2);
          s += `  ${n1}/${d1} ${op} ${n2}/${d2} = ${combined}/${d1}\n\n`;
        } else {
          const lcd = (d1 * d2) / gcd(d1, d2);
          s += `Step 1: Find LCD of ${d1} and ${d2}: LCD = ${lcd}\n`;
          s += `Step 2: Convert fractions:\n`;
          s += `  ${n1}/${d1} = ${n1 * (lcd/d1)}/${lcd}\n`;
          s += `  ${n2}/${d2} = ${n2 * (lcd/d2)}/${lcd}\n\n`;
          const combined = (op === '+') ? (n1*(lcd/d1) + n2*(lcd/d2)) : (n1*(lcd/d1) - n2*(lcd/d2));
          s += `Step 3: ${opWord} numerators: ${n1*(lcd/d1)} ${op} ${n2*(lcd/d2)} = ${combined}\n\n`;
        }
      } else if (op === '×' || op === '*') {
        s += `Step 1: Multiply numerators and denominators:\n`;
        s += `  (${n1} × ${n2}) / (${d1} × ${d2}) = ${n1*n2}/${d1*d2}\n\n`;
      } else {
        s += `Step 1: Invert the divisor and multiply:\n`;
        s += `  ${n1}/${d1} ÷ ${n2}/${d2} = ${n1}/${d1} × ${d2}/${n2} = ${n1*d2}/${d1*n2}\n\n`;
      }
    }
    s += `Step: Simplify to lowest terms.\n`;
    s += `Answer: ${d.display}\n\n`;
    s += `Tip: Always simplify by dividing numerator and denominator by their GCD.`;
    return s;
  }

  // ── Polynomial Multiplication ─────────────────────────────────
  if (p.includes('polymul-api')) {
    const { p1, p2, p1Display, p2Display } = b;
    let s = `Problem: Multiply ${p1Display || 'P₁'} × ${p2Display || 'P₂'}\n\n`;
    s += `Method: Multiply each term of the first polynomial by each term of the second.\n\n`;
    if (p1 && p2) {
      s += `Step 1: Distribute each term:\n`;
      for (let i = 0; i < p1.length; i++) {
        if (p1[i] === 0) continue;
        const terms = p2.map((c, j) => c === 0 ? null : `${p1[i]*c}x^${(p1.length-1-i)+(p2.length-1-j)}`).filter(Boolean);
        s += `  ${p1[i]}x^${p1.length-1-i} × each term → ${terms.join(', ')}\n`;
      }
      s += `\nStep 2: Combine like terms (same power of x)\n`;
    }
    s += `\nAnswer: ${d.correctDisplay || d.display}\n\n`;
    s += `Tip: Use the FOIL method for binomials, or grid method for longer polynomials.`;
    return s;
  }

  // ── Polynomial Factorization ──────────────────────────────────
  if (p.includes('polyfactor-api')) {
    const { a, b: bCoeff, c } = b;
    let s = `Problem: Factorise ${a}x² + ${bCoeff}x + ${c}\n\n`;
    s += `Method: Find two numbers that multiply to give a×c = ${a*c}\nand add to give b = ${bCoeff}.\n\n`;
    s += `Step 1: List factor pairs of ${a*c}.\n`;
    s += `Step 2: Find the pair that sums to ${bCoeff}.\n`;
    s += `Step 3: Rewrite the middle term using those factors.\n`;
    s += `Step 4: Factor by grouping.\n\n`;
    s += `Answer: ${d.display || '(check factored form)'}\n\n`;
    s += `Tip: If a=1, just find two numbers that multiply to c and add to b.`;
    return s;
  }

  // ── Prime Factorization ───────────────────────────────────────
  if (p.includes('primefactor-api')) {
    const num = b.number;
    const factors = d.correctFactors;
    let s = `Problem: Find the prime factors of ${num}\n\n`;
    s += `Method: Divide by the smallest prime repeatedly.\n\n`;
    if (factors) {
      let remaining = num;
      let step = 1;
      for (const f of factors) {
        s += `Step ${step}: ${remaining} ÷ ${f} = ${remaining / f}\n`;
        remaining = remaining / f;
        step++;
      }
      s += `\nPrime factorisation: ${num} = ${factors.join(' × ')}\n\n`;
    }
    s += `Tip: Always start dividing by the smallest prime (2, then 3, then 5, 7, 11...)`;
    return s;
  }

  // ── Quadratic Formula ─────────────────────────────────────────
  if (p.includes('qformula-api')) {
    const { a, b: bCoeff, c } = b;
    let s = `Problem: Solve ${a}x² + ${bCoeff}x + ${c} = 0\n\n`;
    s += `Formula: x = (-b ± √(b²-4ac)) / 2a\n\n`;
    const disc = bCoeff * bCoeff - 4 * a * c;
    s += `Step 1: Calculate discriminant: b²-4ac = ${bCoeff}²-4(${a})(${c}) = ${bCoeff*bCoeff} - ${4*a*c} = ${disc}\n\n`;
    if (disc > 0) {
      s += `Discriminant > 0 → Two distinct real roots\n`;
      s += `Step 2: x = (${-bCoeff} ± √${disc}) / ${2*a}\n`;
      const sqrtD = Math.sqrt(disc);
      s += `  √${disc} ≈ ${sqrtD.toFixed(2)}\n`;
      s += `  x₁ = (${-bCoeff} + ${sqrtD.toFixed(2)}) / ${2*a} = ${((-bCoeff + sqrtD) / (2*a)).toFixed(2)}\n`;
      s += `  x₂ = (${-bCoeff} - ${sqrtD.toFixed(2)}) / ${2*a} = ${((-bCoeff - sqrtD) / (2*a)).toFixed(2)}\n`;
    } else if (disc === 0) {
      s += `Discriminant = 0 → One repeated root\n`;
      s += `x = ${-bCoeff} / ${2*a} = ${(-bCoeff / (2*a)).toFixed(2)}\n`;
    } else {
      s += `Discriminant < 0 → Complex roots\n`;
      s += `Real part = ${-bCoeff}/${2*a} = ${(-bCoeff/(2*a)).toFixed(2)}\n`;
      s += `Imaginary part = √${Math.abs(disc)}/${2*a} ≈ ${(Math.sqrt(Math.abs(disc))/(2*a)).toFixed(2)}i\n`;
    }
    s += `\nTip: The discriminant tells you how many roots to expect.`;
    return s;
  }

  // ── Simultaneous Equations ────────────────────────────────────
  if (p.includes('simul-api')) {
    const sol = d.solution || b.solution;
    let s = `Problem: Solve the system of equations\n\n`;
    s += `Method: Use elimination or substitution.\n\n`;
    s += `Step 1: Choose a variable to eliminate.\n`;
    s += `Step 2: Multiply equations to make coefficients equal.\n`;
    s += `Step 3: Subtract equations to eliminate one variable.\n`;
    s += `Step 4: Solve for the remaining variable(s).\n`;
    s += `Step 5: Substitute back to find other variables.\n\n`;
    if (sol) s += `Solution: x = ${sol.x}${sol.y !== undefined ? ', y = ' + sol.y : ''}${sol.z !== undefined ? ', z = ' + sol.z : ''}\n\n`;
    s += `Tip: Check your answer by substituting back into ALL original equations.`;
    return s;
  }

  // ── Function Evaluation ───────────────────────────────────────
  if (p.includes('funceval-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Evaluate the function'}\n\n`;
    s += `Step 1: Identify the function and the input value.\n`;
    s += `Step 2: Substitute the input value for x in the function.\n`;
    s += `Step 3: Simplify the expression.\n\n`;
    s += `Answer: ${d.correctAnswer}\n\n`;
    s += `Tip: Always substitute carefully, using brackets around negative values.`;
    return s;
  }

  // ── Line Equations ────────────────────────────────────────────
  if (p.includes('lineq-api') && !p.includes('lineareq')) {
    const { x1, y1, x2, y2 } = b;
    let s = `Problem: Find y = mx + c passing through (${x1}, ${y1}) and (${x2}, ${y2})\n\n`;
    const m = ((y2 - y1) / (x2 - x1));
    s += `Step 1: Calculate slope m = (y₂-y₁)/(x₂-x₁)\n`;
    s += `  m = (${y2}-${y1})/(${x2}-${x1}) = ${y2-y1}/${x2-x1} = ${m.toFixed(2)}\n\n`;
    const c = y1 - m * x1;
    s += `Step 2: Find y-intercept using y = mx + c with one point:\n`;
    s += `  ${y1} = ${m.toFixed(2)} × ${x1} + c\n`;
    s += `  c = ${y1} - ${(m * x1).toFixed(2)} = ${c.toFixed(2)}\n\n`;
    s += `Answer: y = ${m.toFixed(2)}x + ${c.toFixed(2)}\n\n`;
    s += `Tip: The slope tells you the steepness. Positive = rising, negative = falling.`;
    return s;
  }

  // ── Surds ─────────────────────────────────────────────────────
  if (p.includes('surds-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Simplify the surd expression'}\n\n`;
    if (b.type === 'simplify') {
      s += `Method: Find the largest perfect square factor.\n`;
      s += `Step 1: Factor the number under the root.\n`;
      s += `Step 2: √(a×b) = √a × √b where a is a perfect square.\n`;
      s += `Step 3: Simplify √a to get the coefficient.\n\n`;
    } else if (b.type === 'multiply') {
      s += `Rule: √a × √b = √(a×b)\n`;
      s += `Step 1: Multiply the numbers under the roots.\n`;
      s += `Step 2: Simplify the result if possible.\n\n`;
    } else if (b.type === 'rationalise') {
      s += `Method: Multiply top and bottom by the conjugate of the denominator.\n`;
      s += `Step 1: If denominator is √a, multiply by √a/√a.\n`;
      s += `Step 2: If denominator is a + √b, multiply by (a - √b)/(a - √b).\n`;
      s += `Step 3: Simplify the result.\n\n`;
    }
    s += `Answer: ${ans}\n\n`;
    s += `Tip: Memorise perfect squares up to 225 (15²) for quick simplification.`;
    return s;
  }

  // ── Indices (Exponents) ───────────────────────────────────────
  if (p.includes('indices-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Simplify the expression'}\n\n`;
    s += `Key Laws of Indices:\n`;
    s += `• aᵐ × aⁿ = aᵐ⁺ⁿ (same base, multiply → add powers)\n`;
    s += `• aᵐ ÷ aⁿ = aᵐ⁻ⁿ (same base, divide → subtract powers)\n`;
    s += `• (aᵐ)ⁿ = aᵐⁿ (power of a power → multiply)\n`;
    s += `• a⁰ = 1 (anything to the power 0 is 1)\n`;
    s += `• a⁻ⁿ = 1/aⁿ (negative power → reciprocal)\n`;
    s += `• a^(1/n) = ⁿ√a (fractional power → root)\n\n`;
    s += `Apply the relevant rule to simplify.\n\n`;
    s += `Answer: ${ans}\n\n`;
    s += `Tip: Always simplify step by step. Identify which law applies first.`;
    return s;
  }

  // ── Sequences ─────────────────────────────────────────────────
  if (p.includes('sequences-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Find the term or sum'}\n\n`;
    if (b.type && b.type.startsWith('arith')) {
      s += `This is an arithmetic sequence (constant difference).\n\n`;
      s += `Formulas:\n`;
      s += `• nth term: aₙ = a₁ + (n-1)d\n`;
      s += `• Sum of n terms: Sₙ = n/2 × (2a₁ + (n-1)d)  or  Sₙ = n/2 × (first + last)\n\n`;
    } else {
      s += `This is a geometric sequence (constant ratio).\n\n`;
      s += `Formulas:\n`;
      s += `• nth term: aₙ = a₁ × rⁿ⁻¹\n`;
      s += `• Sum of n terms: Sₙ = a₁(rⁿ - 1)/(r - 1)\n\n`;
    }
    s += `Step 1: Identify a₁ (first term) and d or r (common difference/ratio).\n`;
    s += `Step 2: Substitute into the appropriate formula.\n`;
    s += `Step 3: Calculate.\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Ratios ────────────────────────────────────────────────────
  if (p.includes('ratio-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Solve the ratio problem'}\n\n`;
    if (b.type === 'simplify') {
      s += `To simplify a ratio, divide both parts by their GCD.\n\n`;
    } else if (b.type === 'divide2' || b.type === 'divide3') {
      s += `To divide in a given ratio:\n`;
      s += `Step 1: Add the parts of the ratio.\n`;
      s += `Step 2: Divide the total by this sum to get one "share".\n`;
      s += `Step 3: Multiply each ratio part by the share value.\n\n`;
    } else if (b.type === 'direct') {
      s += `Direct proportion: if a:b = c:d, then a×d = b×c (cross-multiply).\n\n`;
    }
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Percentages ───────────────────────────────────────────────
  if (p.includes('percent-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Solve the percentage problem'}\n\n`;
    if (b.type === 'simple') {
      s += `To find x% of a number: multiply by x/100.\n`;
    } else if (b.type === 'find_pct') {
      s += `To find what percentage a is of b: (a/b) × 100.\n`;
    } else if (b.type === 'inc_dec') {
      s += `Percentage increase/decrease:\n`;
      s += `New value = original × (1 + rate/100) for increase\n`;
      s += `New value = original × (1 - rate/100) for decrease\n`;
    } else if (b.type === 'reverse') {
      s += `Reverse percentage: to find the original before x% change:\n`;
      s += `Original = new value ÷ (1 ± x/100)\n`;
    } else if (b.type === 'compound') {
      s += `Compound interest/growth: A = P(1 + r/100)ⁿ\n`;
      s += `where P = principal, r = rate, n = periods.\n`;
    }
    s += `\nAnswer: ${ans}\n\n`;
    s += `Tip: "Percent" means "per hundred". Always think in terms of hundredths.`;
    return s;
  }

  // ── Sets ──────────────────────────────────────────────────────
  if (p.includes('sets-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Solve the set problem'}\n\n`;
    s += `Key Set Operations:\n`;
    s += `• A ∪ B (union) = all elements in A or B or both\n`;
    s += `• A ∩ B (intersection) = elements in both A and B\n`;
    s += `• A - B (difference) = elements in A but not in B\n`;
    s += `• |A| = number of elements in A\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Trigonometry ──────────────────────────────────────────────
  if (p.includes('trig-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Solve the trigonometry problem'}\n\n`;
    s += `Key Formulae:\n`;
    s += `• SOH: sin(θ) = Opposite / Hypotenuse\n`;
    s += `• CAH: cos(θ) = Adjacent / Hypotenuse\n`;
    s += `• TOA: tan(θ) = Opposite / Adjacent\n`;
    s += `• Pythagoras: a² + b² = c²\n`;
    s += `• Sine rule: a/sinA = b/sinB = c/sinC\n`;
    s += `• Cosine rule: a² = b² + c² - 2bc·cos(A)\n\n`;
    s += `Step 1: Identify what you know (sides/angles).\n`;
    s += `Step 2: Choose the appropriate formula.\n`;
    s += `Step 3: Substitute and solve.\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Coordinate Geometry ───────────────────────────────────────
  if (p.includes('coordgeom-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Solve the coordinate geometry problem'}\n\n`;
    if (b.type === 'midpoint') {
      s += `Midpoint formula: M = ((x₁+x₂)/2, (y₁+y₂)/2)\n`;
    } else if (b.type === 'distance') {
      s += `Distance formula: d = √((x₂-x₁)² + (y₂-y₁)²)\n`;
    } else if (b.type === 'gradient') {
      s += `Gradient formula: m = (y₂-y₁)/(x₂-x₁)\n`;
    } else if (b.type === 'perp_bisector') {
      s += `Perpendicular bisector:\n`;
      s += `Step 1: Find midpoint of the two points.\n`;
      s += `Step 2: Find gradient of the line joining them.\n`;
      s += `Step 3: Negative reciprocal gives perpendicular gradient.\n`;
      s += `Step 4: Use y - y₁ = m(x - x₁) with the midpoint.\n`;
    }
    s += `\nAnswer: ${ans}`;
    return s;
  }

  // ── Probability ───────────────────────────────────────────────
  if (p.includes('prob-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Calculate the probability'}\n\n`;
    s += `P(event) = favourable outcomes / total outcomes\n\n`;
    s += `Key Rules:\n`;
    s += `• P(A and B) = P(A) × P(B) [if independent]\n`;
    s += `• P(A or B) = P(A) + P(B) - P(A and B)\n`;
    s += `• P(not A) = 1 - P(A)\n\n`;
    s += `Answer: ${ans}\n\n`;
    s += `Tip: Always express probability as a simplified fraction.`;
    return s;
  }

  // ── Statistics ────────────────────────────────────────────────
  if (p.includes('stats-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Calculate the statistic'}\n\n`;
    if (b.type === 'mean' || b.type === 'freq_mean') {
      s += `Mean = sum of all values ÷ number of values\n`;
      s += `For frequency tables: mean = Σ(f × x) ÷ Σf\n`;
    } else if (b.type === 'median') {
      s += `Median = middle value when data is sorted.\n`;
      s += `If n is even: median = average of the two middle values.\n`;
    } else if (b.type === 'mode') {
      s += `Mode = the most frequently occurring value(s).\n`;
    } else if (b.type === 'range') {
      s += `Range = highest value - lowest value.\n`;
    }
    s += `\nAnswer: ${ans}`;
    return s;
  }

  // ── Matrices ──────────────────────────────────────────────────
  if (p.includes('matrix-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Solve the matrix problem'}\n\n`;
    if (b.type === 'determinant') {
      s += `For a 2×2 matrix [[a,b],[c,d]]:\ndet = ad - bc\n\n`;
    } else if (b.type === 'scalar') {
      s += `Scalar multiplication: multiply every element by the scalar.\n\n`;
    } else {
      s += `Matrix addition: add corresponding elements.\n\n`;
    }
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Vectors ───────────────────────────────────────────────────
  if (p.includes('vectors-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Solve the vector problem'}\n\n`;
    if (b.type === 'add') s += `Vector addition: add corresponding components (x₁+x₂, y₁+y₂).\n\n`;
    else if (b.type === 'scalar') s += `Scalar multiplication: multiply each component by the scalar.\n\n`;
    else if (b.type === 'magnitude') s += `Magnitude: |v| = √(x² + y²)\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Dot Product ───────────────────────────────────────────────
  if (p.includes('dotprod-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Calculate the dot product'}\n\n`;
    s += `Dot product: a·b = a₁b₁ + a₂b₂ (+ a₃b₃ for 3D)\n`;
    s += `Multiply corresponding components, then sum.\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Logarithms ────────────────────────────────────────────────
  if (p.includes('log-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Evaluate the logarithm'}\n\n`;
    s += `Key Laws of Logarithms:\n`;
    s += `• log(a×b) = log(a) + log(b)\n`;
    s += `• log(a/b) = log(a) - log(b)\n`;
    s += `• log(aⁿ) = n·log(a)\n`;
    s += `• logₐ(a) = 1, logₐ(1) = 0\n`;
    s += `• logₐ(b) = c means aᶜ = b\n\n`;
    s += `Answer: ${ans}\n\n`;
    s += `Tip: "log base a of b" asks "what power of a gives b?"`;
    return s;
  }

  // ── Inequalities ──────────────────────────────────────────────
  if (p.includes('ineq-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Solve the inequality'}\n\n`;
    s += `Method: Solve like an equation, but remember:\n`;
    s += `• When multiplying/dividing by a negative, FLIP the sign.\n`;
    s += `• For quadratic inequalities, find roots then test intervals.\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Differentiation ───────────────────────────────────────────
  if (p.includes('diff-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Differentiate'}\n\n`;
    s += `Key Rules:\n`;
    s += `• Power rule: d/dx(xⁿ) = nxⁿ⁻¹\n`;
    s += `• Constant rule: d/dx(c) = 0\n`;
    s += `• Sum rule: differentiate term by term\n`;
    s += `• Chain rule: d/dx(f(g(x))) = f'(g(x)) × g'(x)\n`;
    s += `• Product rule: d/dx(fg) = f'g + fg'\n\n`;
    s += `Apply the power rule to each term: bring the exponent down as a coefficient,\nthen reduce the exponent by 1.\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Integration ───────────────────────────────────────────────
  if (p.includes('integ-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Integrate'}\n\n`;
    s += `Key Rules:\n`;
    s += `• Power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C  (n ≠ -1)\n`;
    s += `• Constant: ∫k dx = kx + C\n`;
    s += `• Sum rule: integrate term by term\n`;
    s += `• ∫1/x dx = ln|x| + C\n\n`;
    s += `Reverse the power rule: increase the exponent by 1,\nthen divide by the new exponent. Don't forget +C!\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Limits ────────────────────────────────────────────────────
  if (p.includes('limits-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Evaluate the limit'}\n\n`;
    s += `Methods for evaluating limits:\n`;
    s += `1. Direct substitution — try plugging in the value.\n`;
    s += `2. If 0/0, factorise and cancel common factors.\n`;
    s += `3. For limits at infinity, divide by highest power of x.\n`;
    s += `4. L'Hôpital's rule: if 0/0 or ∞/∞, take derivative of top and bottom.\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Mensuration (Area/Volume) ─────────────────────────────────
  if (p.includes('mensur-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Calculate the measurement'}\n\n`;
    s += `Common Formulae:\n`;
    s += `• Circle: area = πr², circumference = 2πr\n`;
    s += `• Triangle: area = ½ × base × height\n`;
    s += `• Rectangle: area = length × width\n`;
    s += `• Cylinder: volume = πr²h, surface = 2πr(r+h)\n`;
    s += `• Sphere: volume = 4/3πr³, surface = 4πr²\n`;
    s += `• Cone: volume = 1/3πr²h\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Bearings ──────────────────────────────────────────────────
  if (p.includes('bearings-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Calculate the bearing'}\n\n`;
    s += `Bearings are measured clockwise from North (000° to 360°).\n\n`;
    s += `Key rules:\n`;
    s += `• Always give 3 digits (e.g., 045° not 45°).\n`;
    s += `• Back bearing = bearing ± 180°.\n`;
    s += `• Use trigonometry to find angles in the triangle.\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Number Bases ──────────────────────────────────────────────
  if (p.includes('bases-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Convert between number bases'}\n\n`;
    if (b.type === 'dec_to_bin') {
      s += `Decimal → Binary: Divide by 2 repeatedly, read remainders bottom to top.\n\n`;
    } else if (b.type === 'bin_to_dec') {
      s += `Binary → Decimal: Each digit × its place value (powers of 2), then sum.\n`;
      s += `Place values from right: 1, 2, 4, 8, 16, 32, 64, 128...\n\n`;
    } else if (b.type === 'dec_to_hex') {
      s += `Decimal → Hex: Divide by 16 repeatedly. Remainders 10-15 = A-F.\n\n`;
    } else if (b.type === 'hex_to_bin') {
      s += `Hex → Binary: Convert each hex digit to 4-bit binary.\n`;
      s += `0=0000, 1=0001, ..., 9=1001, A=1010, B=1011, C=1100, D=1101, E=1110, F=1111\n\n`;
    } else if (b.type === 'bin_add') {
      s += `Binary addition: 0+0=0, 0+1=1, 1+0=1, 1+1=10 (carry 1)\n\n`;
    }
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Circle Theorems ───────────────────────────────────────────
  if (p.includes('circle-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Find the angle'}\n\n`;
    s += `Circle Theorems:\n`;
    s += `• Angle at centre = 2 × angle at circumference\n`;
    s += `• Angles in the same segment are equal\n`;
    s += `• Angle in a semicircle = 90°\n`;
    s += `• Opposite angles of a cyclic quadrilateral sum to 180°\n`;
    s += `• Tangent meets radius at 90°\n`;
    s += `• Alternate segment theorem\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Transformations ───────────────────────────────────────────
  if (p.includes('transform-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Apply the transformation'}\n\n`;
    s += `Types of Transformations:\n`;
    s += `• Translation: move by vector (a, b) → (x+a, y+b)\n`;
    s += `• Reflection: flip across a line (x-axis, y-axis, y=x, etc.)\n`;
    s += `• Rotation: turn around a point by an angle\n`;
    s += `• Enlargement: scale from a centre by a factor\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Tatsavit (9-level drill) ──────────────────────────────────
  if (p.includes('tatsavit-api')) {
    const type = b.type;
    const prompt = b.prompt || b.display || '';
    let s = `Problem: ${prompt}\n\n`;
    if (type === 0 || type === 1) {
      s += `This is a multiplication tables question.\n`;
      s += `Tip: If unsure, use repeated addition or break into smaller products.\n`;
    } else if (type === 2) {
      s += `This is a squares question (n²).\n`;
      s += `Tip: Use the identity (a+b)² = a² + 2ab + b² to compute squares of larger numbers.\n`;
    } else if (type === 3) {
      s += `This is a square root question.\n`;
      s += `Tip: Know your perfect squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144...\n`;
    } else if (type === 4) {
      s += `This is a monomial multiplication question.\n`;
      s += `Rule: Multiply coefficients, add exponents of same base.\n`;
      s += `Example: 3x² × 5x³ = 15x⁵\n`;
    } else if (type === 5) {
      s += `This is a percentage question.\n`;
      s += `To find x% of n: multiply n by x/100.\n`;
    } else if (type === 6) {
      s += `This is an addition problem.\nTip: Break into place values for mental math.\n`;
    } else if (type === 7) {
      s += `This is a subtraction problem.\nTip: Use complementary addition (count up from smaller to larger).\n`;
    } else if (type === 8) {
      s += `This is a negative arithmetic problem.\n`;
      s += `Rules: neg × neg = pos, neg × pos = neg\nneg + neg = more negative, neg - neg = check signs.\n`;
    }
    s += `\nAnswer: ${ans}`;
    return s;
  }

  // ── GK / Vocab (Multiple Choice) ──────────────────────────────
  if (p.includes('gk-api') || p.includes('vocab-api')) {
    const correctText = d.correctAnswerText || d.correctAnswer || ans;
    return `The correct answer is: ${correctText}\n\nTip: Read all options carefully before choosing.`;
  }

  // ── Linear Equations (solve ax + b = c) ───────────────────────
  if (p.includes('lineareq-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Solve the linear equation'}\n\n`;
    s += `Method: Isolate x on one side.\n`;
    s += `Step 1: Move constant terms to the right.\n`;
    s += `Step 2: Move x terms to the left.\n`;
    s += `Step 3: Divide both sides by the coefficient of x.\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Permutations & Combinations ───────────────────────────────
  if (p.includes('permcomb-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Calculate'}\n\n`;
    s += `Permutation (order matters): nPr = n! / (n-r)!\n`;
    s += `Combination (order doesn't matter): nCr = n! / (r!(n-r)!)\n\n`;
    s += `Tip: Ask yourself "does the order matter?" to decide which to use.\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Inverse Trig ──────────────────────────────────────────────
  if (p.includes('invtrig-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Evaluate'}\n\n`;
    s += `Inverse trig functions find the angle given a ratio.\n`;
    s += `• sin⁻¹(x) gives the angle whose sine is x\n`;
    s += `• cos⁻¹(x) gives the angle whose cosine is x\n`;
    s += `• tan⁻¹(x) gives the angle whose tangent is x\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Remainder / Factor Theorem ────────────────────────────────
  if (p.includes('remfactor-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Apply the theorem'}\n\n`;
    s += `Remainder Theorem: When f(x) is divided by (x-a), remainder = f(a).\n`;
    s += `Factor Theorem: If f(a) = 0, then (x-a) is a factor of f(x).\n\n`;
    s += `Step 1: Substitute the value into the polynomial.\n`;
    s += `Step 2: Calculate f(a).\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Heron's Formula ───────────────────────────────────────────
  if (p.includes('heron-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Calculate the area'}\n\n`;
    s += `Heron's Formula: Area = √(s(s-a)(s-b)(s-c))\n`;
    s += `where s = (a+b+c)/2 is the semi-perimeter.\n\n`;
    s += `Step 1: Calculate s = (a+b+c)/2\n`;
    s += `Step 2: Calculate each factor: s-a, s-b, s-c\n`;
    s += `Step 3: Multiply and take the square root.\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Conics ────────────────────────────────────────────────────
  if (p.includes('conics-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Identify or work with the conic'}\n\n`;
    s += `Standard forms:\n`;
    s += `• Circle: (x-h)² + (y-k)² = r²\n`;
    s += `• Ellipse: (x-h)²/a² + (y-k)²/b² = 1\n`;
    s += `• Parabola: y = ax² + bx + c\n`;
    s += `• Hyperbola: (x-h)²/a² - (y-k)²/b² = 1\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Differential Equations ────────────────────────────────────
  if (p.includes('diffeq-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Solve the differential equation'}\n\n`;
    s += `Method (Separable DE):\n`;
    s += `Step 1: Separate variables: put all y terms with dy, all x terms with dx.\n`;
    s += `Step 2: Integrate both sides.\n`;
    s += `Step 3: Solve for y if possible. Don't forget +C!\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Angles ────────────────────────────────────────────────────
  if (p.includes('angles-api')) {
    const promptStr = b.prompt || '';
    // Use the numeric answer (no degree symbol) so we can format consistently.
    // Fall back to whatever 'ans' contains if 'b.answer' is unavailable.
    const rNum = (b.answer !== undefined && b.answer !== null) ? b.answer : String(ans).replace(/°/g, '');
    const rDeg = `${rNum}°`;
    let s = `Problem: ${promptStr}\n\n`;
    // Pick the right rule based on keywords in the prompt.
    if (/straight line/i.test(promptStr) && !/cross/i.test(promptStr)) {
      s += `Rule: angles on a straight line add up to 180°.\n`;
      // Try to extract the given angle for an explicit subtraction.
      const m = promptStr.match(/(\d+)\s*°/);
      if (m) s += `  ${m[1]}° + x = 180°  →  x = 180° − ${m[1]}° = ${rDeg}\n\n`;
      else s += `  Sum the known angles and subtract from 180°.\n\n`;
    } else if (/at a point|meet at a point/i.test(promptStr)) {
      s += `Rule: angles around a point add up to 360°.\n`;
      const nums = (promptStr.match(/(\d+)\s*°/g) || []).map(x => parseInt(x));
      if (nums.length) s += `  Sum of given angles = ${nums.reduce((a,n)=>a+n,0)}°.\n  x = 360° − sum = ${rDeg}\n\n`;
    } else if (/vertically opposite/i.test(promptStr)) {
      s += `Rule: vertically opposite angles are equal.\n  Answer: ${rDeg}.\n\n`;
    } else if (/cross/i.test(promptStr) && /adjacent/i.test(promptStr)) {
      s += `Rule: adjacent angles on a straight line add up to 180°.\n  x = 180° − given = ${rDeg}.\n\n`;
    } else if (/alternate/i.test(promptStr)) {
      s += `Rule: alternate angles between parallel lines are equal (Z-shape).\n  Answer: ${rDeg}.\n\n`;
    } else if (/corresponding/i.test(promptStr)) {
      s += `Rule: corresponding angles between parallel lines are equal (F-shape).\n  Answer: ${rDeg}.\n\n`;
    } else if (/co-interior|cointerior|allied/i.test(promptStr)) {
      s += `Rule: co-interior (allied) angles between parallel lines add up to 180° (C-shape).\n  Answer: 180° − given = ${rDeg}.\n\n`;
    } else {
      s += `Identify which angle relationship applies (line, point, or parallel lines), then apply the matching rule.\n\nAnswer: ${rDeg}.\n\n`;
    }
    s += `Tip: a quick sketch with the right shape (line, point, Z, F, C) makes it obvious which rule fits.`;
    return s;
  }

  // ── Binomial Theorem ──────────────────────────────────────────
  if (p.includes('binomial-api')) {
    const promptStr = b.prompt || '';
    const r = ans;
    let s = `Problem: ${promptStr}\n\n`;
    s += `General formula: (a + b)^n = Σ C(n,r) · a^(n−r) · b^r  for r = 0 … n.\n`;
    s += `Where C(n,r) = n! / (r!·(n−r)!).\n\n`;
    // Extract n and r from common shapes like "nCr" or "x^r in (...)^n"
    const nCrMatch = promptStr.match(/(\d+)C(\d+)/);
    const expandMatch = promptStr.match(/x\^(\d+).*\(([^)]+)\)\^(\d+)/);
    const termMatch = promptStr.match(/(\d+)(?:nd|rd|th).*\(1\s*\+\s*x\)\^(\d+)/);
    if (nCrMatch) {
      const n = +nCrMatch[1], rr = +nCrMatch[2];
      s += `Step 1: Plug in n = ${n}, r = ${rr}.\n`;
      s += `Step 2: ${n}C${rr} = ${n}! / (${rr}!·${n-rr}!) = ${r}.\n\n`;
    } else if (expandMatch) {
      const power = expandMatch[1];
      const inside = expandMatch[2];
      const n = expandMatch[3];
      s += `Step 1: Identify the term containing x^${power}: choose r = ${power} in (${inside})^${n}.\n`;
      s += `Step 2: That term is C(${n}, ${power}) · (1st term)^(${n}−${power}) · (2nd term)^${power}.\n`;
      s += `Step 3: Evaluate to get coefficient = ${r}.\n\n`;
    } else if (termMatch) {
      const k = +termMatch[1];
      const n = +termMatch[2];
      s += `Step 1: The k-th term uses r = k − 1, so r = ${k - 1}.\n`;
      s += `Step 2: Coefficient = C(${n}, ${k - 1}) = ${r}.\n\n`;
    } else {
      s += `Step 1: Identify n and the desired power r.\n`;
      s += `Step 2: Apply C(n,r)·a^(n−r)·b^r and evaluate.\n\n`;
    }
    s += `Answer: ${r}\n\n`;
    s += `Tip: Pascal's triangle gives C(n,r) for small n quickly — each entry is the sum of the two above it.`;
    return s;
  }

  // ── Bounds ────────────────────────────────────────────────────
  if (p.includes('bounds-api')) {
    const promptStr = b.prompt || '';
    const r = ans;
    let s = `Problem: ${promptStr}\n\n`;
    s += `Key idea: when a value is rounded to a step h, the true value lies in the interval\n`;
    s += `  [reported − h/2, reported + h/2).\n`;
    s += `The lower bound is reported − h/2; the upper bound is reported + h/2.\n\n`;
    if (/lower bound/i.test(promptStr)) {
      s += `Step 1: Identify the rounding step h from the question (e.g., 1 d.p. → h = 0.1).\n`;
      s += `Step 2: Lower bound = reported − h/2.\n\n`;
    } else if (/upper bound/i.test(promptStr) && /a\s*[+÷×−-]\s*b/i.test(promptStr)) {
      s += `Step 1: For combinations of bounded quantities, push each toward the extreme that\n  makes the calculation as large (upper) or as small (lower) as required.\n`;
      s += `  • a + b: upper = a_upper + b_upper.\n`;
      s += `  • a × b (positives): upper = a_upper × b_upper.\n`;
      s += `  • a ÷ b (positives): upper = a_upper ÷ b_lower (smaller divisor → larger quotient).\n\n`;
    } else if (/upper bound/i.test(promptStr)) {
      s += `Step 1: Identify the rounding step h.\n`;
      s += `Step 2: Upper bound = reported + h/2.\n\n`;
    }
    s += `Answer: ${r}\n\n`;
    s += `Tip: write out the inequality reported − h/2 ≤ true < reported + h/2 before plugging numbers in — it stops sign mistakes.`;
    return s;
  }

  // ── Gym Decimals ──────────────────────────────────────────────
  if (p.includes('gymdecimals-api')) {
    const { a, b: bStr, d1, d2, e1, e2, prodMantissa, prodExp } = b;
    let s = `Problem: ${a} × ${bStr}\n\n`;
    s += `Strategy: separate each number into a single digit and a power of 10.\n`;
    s += `  ${a} = ${d1} × 10^${e1}\n`;
    s += `  ${bStr} = ${d2} × 10^${e2}\n\n`;
    s += `Step 1: Multiply the digits.\n`;
    s += `  ${d1} × ${d2} = ${prodMantissa}\n\n`;
    s += `Step 2: Add the exponents (combine the powers of 10).\n`;
    s += `  10^${e1} × 10^${e2} = 10^${e1 + e2}\n\n`;
    s += `Step 3: Reassemble.\n`;
    s += `  ${prodMantissa} × 10^${prodExp} = ${d.display}\n\n`;
    s += `Tip: count decimal places — every position the point moves left in the inputs adds one place to the answer.`;
    return s;
  }

  // ── Linear Programming ────────────────────────────────────────
  if (p.includes('linprog-api')) {
    let s = `Problem: ${b.prompt || b.display || 'Solve the LP problem'}\n\n`;
    s += `Method:\n`;
    s += `Step 1: Identify constraints and objective function.\n`;
    s += `Step 2: Graph the feasible region.\n`;
    s += `Step 3: Find corner points (vertices).\n`;
    s += `Step 4: Evaluate objective function at each corner.\n`;
    s += `Step 5: The optimal solution is at the best corner point.\n\n`;
    s += `Answer: ${ans}`;
    return s;
  }

  // ── Dart Board (Visual Coordinates) ───────────────────────────
  if (p.includes('darts-api')) {
    const { x, y, type, startX, startY, axis } = b;
    let s = `Problem: ${b.prompt || 'Throw the dart'}\n\n`;
    if (type === 'reflection') {
      s += `Step 1: Start at the given point (${startX}, ${startY}).\n`;
      s += `Step 2: Reflect across the ${axis}-axis.\n`;
      if (axis === 'x') {
        s += `  When reflecting across the x-axis, negate the y-coordinate.\n`;
        s += `  (${startX}, ${startY}) → (${startX}, ${-startY}) = (${x}, ${y})\n\n`;
      } else {
        s += `  When reflecting across the y-axis, negate the x-coordinate.\n`;
        s += `  (${startX}, ${startY}) → (${-startX}, ${startY}) = (${x}, ${y})\n\n`;
      }
    } else {
      s += `Step 1: The x-coordinate is ${x}. Move ${Math.abs(x)} units ${x > 0 ? 'right' : x < 0 ? 'left' : 'nowhere'} from the origin (0,0) along the horizontal x-axis.\n`;
      s += `Step 2: The y-coordinate is ${y}. Move ${Math.abs(y)} units ${y > 0 ? 'up' : y < 0 ? 'down' : 'nowhere'} along the vertical y-axis.\n\n`;
    }
    s += `Answer: Place the dart at (${x}, ${y}).`;
    return s;
  }

  // ── Generic fallback with prompt ──────────────────────────────
  if (b.prompt || b.display) {
    let s = `Problem: ${b.prompt || b.display}\n\n`;
    s += `Answer: ${ans}\n\n`;
    s += `Read the problem carefully, identify what is being asked,\napply the relevant formula or method, and simplify your answer.`;
    return s;
  }

  // ── Bare fallback ─────────────────────────────────────────────
  if (ans) return `The correct answer is: ${ans}`;
  return null;

  } catch (e) {
    // If anything goes wrong in explanation generation, return a basic answer
    return ans ? `The correct answer is: ${ans}` : null;
  }
}
