// ─────────────────────────────────────────────────────────────────────────────
// misconceptionMap
//
// Structure per quiz type:
//   key: { question: "...", defaultHint: "...", misconceptions: [...] }
//     misconceptions[i] = { pattern: (studentAnswer, correctAnswer) => bool,
//                            label: string, hint: string }
//
// The pattern function receives the student's submitted answer (from req.body.answer)
// and the server's correctAnswer. Returns true if this misconception matches.
//
// ─────────────────────────────────────────────────────────────────────────────

export const misconceptionMap = {

  'addition-api': {
    question: 'Solve the addition problem',
    defaultHint: 'Make sure to line up the digits correctly.',
    misconceptions: [
      {
        label: 'forgot_to_carry',
        pattern: (ans, correct) => {
          const a = parseInt(ans);
          const c = parseInt(correct);
          return !isNaN(a) && !isNaN(c) && (a === c - 10 || a === c - 100);
        },
        hint: 'Hint: Looks like you forgot to carry a 1 to the next place value!',
      },
    ],
  },
  'basicarith-api': {
    question: 'Basic arithmetic',
    defaultHint: 'Check your signs and arithmetic carefully.',
    misconceptions: [
      {
        label: 'wrong_sign',
        pattern: (ans, correct) => {
          const a = parseFloat(ans);
          const c = parseFloat(correct);
          return !isNaN(a) && !isNaN(c) && a === -c;
        },
        hint: 'Hint: You have the right number, but check your positive/negative sign!',
      }
    ]
  },


  // ═══════════════════════════════════════════════════════════════
  // NUMERIC — single number answers
  // ═══════════════════════════════════════════════════════════════

  'gcd-api': {
    question: 'Find the GCD (Greatest Common Divisor) using the Euclidean Algorithm',
    defaultHint: 'Use the Euclidean Algorithm: divide the larger number by the smaller, then replace the larger with the smaller and the smaller with the remainder. Repeat until remainder is 0.',
    misconceptions: [
      {
        label: 'picked_larger',
        pattern: (ans, correct) => ans > correct && ans > 0,
        hint: 'GCD divides BOTH numbers evenly. Does {ans} divide the other number without a remainder? Try checking: {correct} × ? = {ans}',
      },
      {
        label: 'picked_smaller',
        pattern: (ans, correct) => ans < correct && ans > 0,
        hint: 'The GCD is the BIGGEST number that divides both. {ans} is too small — there\'s a larger number that also divides both. Keep applying the Euclidean Algorithm.',
      },
      {
        label: 'found_common_not_greatest',
        pattern: (ans, correct) => ans > 0 && ans < correct && correct % ans === 0,
        hint: '{ans} does divide both numbers correctly! But is there a BIGGER number that also divides both? The GCD must be the GREATEST common divisor.',
      },
      {
        label: 'off_by_one',
        pattern: (ans, correct) => Math.abs(ans - correct) === 1,
        hint: 'You\'re very close! Double-check your last step of the Euclidean Algorithm — did you get the remainder right?',
      },
      {
        label: 'wrong_algorithm_step',
        pattern: (ans, correct) => ans !== correct && ans > 0,
        hint: 'Make sure you\'re dividing the LARGER number by the SMALLER number at each step, and keeping track of the remainder correctly.',
      },
    ],
  },

  'sqrt-api': {
    question: 'Find the square root of a number',
    defaultHint: 'Think: what number, multiplied by itself, gives the original number? For perfect squares, try factoring first.',
    misconceptions: [
      {
        label: 'squared_instead_of_sqrt',
        pattern: (ans, correct) => ans > 0 && Math.abs(ans * ans - correct * correct) < 1,
        hint: 'It looks like you squared the answer. Remember: √n means "what number × itself = n?", not "n × n".',
      },
      {
        label: 'picked_negative_root_only',
        pattern: (ans, correct) => ans < 0 && correct > 0,
        hint: 'You found the negative root. But √ (principal square root) is always positive. The answer is {correct}, not {ans}.',
      },
      {
        label: 'off_by_factor',
        pattern: (ans, correct) => ans > 0 && correct > 0 && (ans * ans) === correct,
        hint: 'That\'s the square of {ans} — you got the operation backwards. Square root means "what number times itself?", not "multiply by itself".',
      },
      {
        label: 'partial_root',
        pattern: (ans, correct) => ans > 0 && ans * ans > correct,
        hint: 'Your answer {ans} × {ans} = {ans*ans} is LARGER than the original number {correct}. The square root must be smaller.',
      },
    ],
  },

  'primefactor-api': {
    question: 'Express the number as a product of prime factors',
    defaultHint: 'Divide by 2 repeatedly, then 3, then 5, then 7... until only prime numbers remain. Write as a product (e.g. 12 = 2² × 3).',
    misconceptions: [
      {
        label: 'included_composite',
        pattern: (ans, correct) => ans !== correct && String(ans).split('×').some(f => {
          const n = parseInt(f.trim(), 10)
          return n > 1 && (n % 2 !== 0 && n % 3 !== 0 && n % 5 !== 0 && n % 7 !== 0 && !isPrime(n))
        }),
        hint: 'Every factor in your answer must be PRIME (only divisible by 1 and itself). Check each factor — is {f} really prime?',
      },
      {
        label: 'missed_factor',
        pattern: (ans, correct) => ans !== correct,
        hint: 'Double-check your division steps. Did you find ALL prime factors? Multiply your answer back out — does it equal {correct}?',
      },
      {
        label: 'wrong_exponent_form',
        pattern: (ans, correct) => ans !== correct,
        hint: 'Your prime factorisation is almost right but check the form. Use indices for repeated primes (e.g. 2³ not 2×2×2).',
      },
    ],
  },

  'squaring-api': {
    question: 'Square the given number',
    defaultHint: 'Multiply the number by itself: n² = n × n. For (a+b)² use (a+b)(a+b) = a² + 2ab + b².',
    misconceptions: [
      {
        label: 'multiplied_by_self_wrong',
        pattern: (ans, correct) => false, // handled generically below
        hint: 'n² means n × n. Make sure you multiply correctly — {correct}² = {correct} × {correct}.',
      },
    ],
  },

  'percentage-api': {
    question: 'Calculate the percentage',
    defaultHint: 'Use: (part ÷ whole) × 100 = %. Make sure part and whole are the right way round.',
    misconceptions: [
      {
        label: 'swapped_part_whole',
        pattern: (ans, correct) => ans > 0 && Math.abs(ans - (100 - correct)) < 1,
        hint: 'Check your part ÷ whole calculation. Did you accidentally divide whole ÷ part? That gives the inverse percentage.',
      },
      {
        label: 'forgot_to_multiply_by_100',
        pattern: (ans, correct) => Math.abs(ans - correct * 100) < 0.5,
        hint: 'You found the decimal form but forgot to multiply by 100. A decimal becomes a percentage when you multiply by 100.',
      },
      {
        label: 'over_100_when_not',
        pattern: (ans, correct) => ans > 100 && correct <= 100,
        hint: 'A percentage over 100% means the part is bigger than the whole — is that what the question asks? Double-check the values.',
      },
    ],
  },

  'fractionadd-api': {
    question: 'Add the fractions and simplify',
    defaultHint: 'Find a common denominator (multiply tops and bottoms to match), add the numerators, then simplify.',
    misconceptions: [
      {
        label: 'added_top_only',
        pattern: (ans, correct) => ans !== correct,
        hint: 'To add fractions: (first numerator × second denominator) + (second numerator × first denominator) over (first denominator × second denominator). You can\'t just add numerators directly.',
      },
      {
        label: 'wrong_denominator',
        pattern: (ans, correct) => ans !== correct,
        hint: 'The denominator of the sum must be the LCM (lowest common multiple) of the two denominators — not just multiplying them. Simplify your answer too.',
      },
    ],
  },

  'indices-api': {
    question: 'Evaluate or simplify the expression with indices',
    defaultHint: 'Use the index laws: aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ ÷ aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ',
    misconceptions: [
      {
        label: 'added_exponents_multiplication',
        pattern: (ans, correct) => ans !== correct,
        hint: 'When MULTIPLYING terms with the same base, ADD the exponents (a³ × a² = a⁵), don\'t multiply them.',
      },
      {
        label: 'multiplied_exponents_power_of_power',
        pattern: (ans, correct) => ans !== correct,
        hint: 'When raising a power to a power, MULTIPLY the exponents: (a³)⁴ = a¹², not a⁷.',
      },
      {
        label: 'wrong_zero_or_negative',
        pattern: (ans, correct) => ans !== correct,
        hint: 'Remember: a⁰ = 1 (any non-zero number to power 0), and a⁻ⁿ = 1/aⁿ.',
      },
    ],
  },

  'log-api': {
    question: 'Evaluate or simplify the logarithmic expression',
    defaultHint: 'logₐ(b) = c means aᶜ = b. Use: log(ab) = log a + log b, log(a/b) = log a - log b.',
    misconceptions: [
      {
        label: 'confused_log_and_exp',
        pattern: (ans, correct) => ans !== correct,
        hint: 'logₐ(b) asks "what power of a gives b?". Make sure the base and argument are the right way round.',
      },
    ],
  },

  'pythag-api': {
    question: 'Use the Pythagorean theorem to find the missing side',
    defaultHint: 'a² + b² = c² where c is the longest side (hypotenuse). Square both sides, add or subtract, then square root.',
    misconceptions: [
      {
        label: 'added_instead_of_subtracting',
        pattern: (ans, correct) => false,
        hint: 'If finding a leg (not the hypotenuse): a² = c² − b². SUBTRACT the smaller squared side from the larger.',
      },
      {
        label: 'forgot_square_root',
        pattern: (ans, correct) => ans > 0 && Math.abs(ans * ans - (correct * correct)) < 1 && ans !== correct,
        hint: 'You computed a² correctly but forgot to square root the result. The answer is √(a²), not a².',
      },
      {
        label: 'wrong_side_formula',
        pattern: (ans, correct) => ans !== correct,
        hint: 'Make sure you identify which side is the hypotenuse (c, longest side) and which are the legs (a, b). c² = a² + b².',
      },
    ],
  },

  'trig-api': {
    question: 'Find the trig ratio or angle',
    defaultHint: 'SOHCAHTOA: Sin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent.',
    misconceptions: [
      {
        label: 'confused_sin_cos',
        pattern: (ans, correct) => false,
        hint: 'Sin is Opposite/Hypotenuse, Cos is Adjacent/Hypotenuse — don\'t swap them. Draw a right triangle and label the sides.',
      },
      {
        label: 'inverse_ratio_wrong',
        pattern: (ans, correct) => false,
        hint: 'arcsin, arccos, arctan give the ANGLE, not the ratio. Make sure you\'re using the right function for what\'s asked.',
      },
    ],
  },

  'polynomial-factor-api': {
    question: 'Factor the polynomial expression',
    defaultHint: 'Look for a common factor first. For quadratics: find two numbers that multiply to c and add to b in ax² + bx + c.',
    misconceptions: [
      {
        label: 'wrong_signs',
        pattern: (ans, correct) => ans !== correct,
        hint: 'Check the signs carefully — positive × positive = positive, positive × negative = negative. Your factors must give the right sign on each term.',
      },
      {
        label: 'missed_common_factor',
        pattern: (ans, correct) => ans !== correct,
        hint: 'Always factor out the GCD first. For example, 2x² + 4x = 2x(x + 2). Did you check for a common factor?',
      },
    ],
  },

  'qformula-api': {
    question: 'Use the quadratic formula to solve the equation',
    defaultHint: 'x = (−b ± √(b² − 4ac)) / 2a. First identify a, b, c from the equation in standard form ax² + bx + c = 0.',
    misconceptions: [
      {
        label: 'sign_error_in_b',
        pattern: (ans, correct) => ans !== correct,
        hint: 'The formula uses −b. Make sure the sign of b in your equation is correct — if b = +4, then −b = −4.',
      },
      {
        label: 'forgot_to_square_root',
        pattern: (ans, correct) => ans !== correct,
        hint: 'You need to find √(b² − 4ac) before plugging into the formula. Did you evaluate the discriminant?',
      },
      {
        label: 'wrong_ac_product',
        pattern: (ans, correct) => ans !== correct,
        hint: 'b² − 4ac needs the correct a and c from your equation. Check: a × c = ? × ? = discriminant term.',
      },
    ],
  },

  'simul-api': {
    question: 'Solve the system of simultaneous equations',
    defaultHint: 'Use substitution or elimination. Add/subtract equations to eliminate one variable, solve for the other, then substitute back.',
    misconceptions: [
      {
        label: 'eliminated_wrong_variable',
        pattern: (ans, correct) => ans !== correct && typeof ans === 'object',
        hint: 'Check which variable you eliminated — make sure you multiplied the equations by the right factors so the coefficients match.',
      },
    ],
  },

  'matrix-api': {
    question: 'Perform the matrix operation',
    defaultHint: 'For addition/subtraction: add/subtract corresponding elements. For multiplication: row × column dot product.',
    misconceptions: [
      {
        label: 'cross_multiplied',
        pattern: (ans, correct) => ans !== correct,
        hint: 'Matrix multiplication is NOT element-by-element. Each element of the result = sum of (row_i × column_j). Check your dimensions match.',
      },
      {
        label: 'wrong_dimension_result',
        pattern: (ans, correct) => false,
        hint: 'Result dimensions: (m×n) × (n×p) = (m×p). An m×n matrix times n×p matrix. Make sure your result has the right dimensions.',
      },
    ],
  },

  'stdform-api': {
    question: 'Express in standard form (scientific notation)',
    defaultHint: 'Write as a × 10ⁿ where 1 ≤ a < 10 and n is an integer. Move the decimal until only one non-zero digit is before it.',
    misconceptions: [
      {
        label: 'wrong_exponent_direction',
        pattern: (ans, correct) => ans !== correct,
        hint: 'If you moved the decimal LEFT, the exponent is POSITIVE. If you moved it RIGHT, the exponent is NEGATIVE.',
      },
      {
        label: 'wrong_number_of_moves',
        pattern: (ans, correct) => ans !== correct,
        hint: 'The exponent = number of places you moved the decimal point. Count carefully — how many hops to get from {correct} format back to the original?',
      },
    ],
  },

  'lineq-api': {
    question: 'Find the equation of the line in the form y = mx + c',
    defaultHint: 'm = (y₂−y₁)/(x₂−x₁), then substitute one point into y = mx + c to find c.',
    misconceptions: [
      {
        label: 'swapped_x_and_y_in_slope',
        pattern: (ans, correct) => ans && correct && ans.m && correct.m && Math.abs(1/ans.m - correct.m) < 0.1,
        hint: 'Slope = rise/run = (y₂−y₁)/(x₂−x₁). Make sure y is on top and x is on bottom.',
      },
    ],
  },

  'prob-api': {
    question: 'Calculate the probability',
    defaultHint: 'P(event) = favorable outcomes / total outcomes. Make sure outcomes are equally likely.',
    misconceptions: [
      {
        label: 'counted_impossible_outcomes',
        pattern: (ans, correct) => false,
        hint: 'Only count outcomes that actually satisfy the condition. Check: does {student answer} count any outcome that can\'t happen?',
      },
      {
        label: 'forgot_to_subtract_complement',
        pattern: (ans, correct) => ans !== correct && ans > correct,
        hint: 'For "at least one" problems, it\'s often easier: P(at least one) = 1 − P(none).',
      },
    ],
  },

  'surds-api': {
    question: 'Simplify the surd expression',
    defaultHint: '√ab = √a × √b. Factor out perfect squares from under the root, e.g. √12 = √(4×3) = 2√3.',
    misconceptions: [
      {
        label: 'split_root_wrongly',
        pattern: (ans, correct) => false,
        hint: '√(a+b) ≠ √a + √b. You can only split √(a×b) = √a × √b. Check your splitting carefully.',
      },
      {
        label: 'forgot_simplification',
        pattern: (ans, correct) => ans !== correct,
        hint: 'Factor out any perfect squares from under the root and simplify: √50 = √(25×2) = 5√2.',
      },
    ],
  },

  'sets-api': {
    question: 'Perform the set operation',
    defaultHint: '∪ = union (in either), ∩ = intersection (in both), \' = complement (not in). List all elements that satisfy the condition.',
    misconceptions: [
      {
        label: 'union_vs_intersection',
        pattern: (ans, correct) => false,
        hint: '∪ (union) = elements in either set. ∩ (intersection) = elements in BOTH sets. Make sure you used the right operation.',
      },
    ],
  },

  'sequences-api': {
    question: 'Find the next term or the rule',
    defaultHint: 'Find the pattern: is it +d (arithmetic) or ×r (geometric)? Check the difference or ratio between consecutive terms.',
    misconceptions: [
      {
        label: 'applied_wrong_difference',
        pattern: (ans, correct) => false,
        hint: 'For arithmetic sequences: subtract to find d, then add d each time. For geometric: divide or multiply by r each time.',
      },
    ],
  },

  'ratio-api': {
    question: 'Solve the ratio problem',
    defaultHint: 'If a:b = c:d, then a×d = b×c (cross-multiply). Or divide both by the total parts to find each share.',
    misconceptions: [
      {
        label: 'swapped_ratio_order',
        pattern: (ans, correct) => false,
        hint: 'a:b means a is to b, not b is to a. Check which value corresponds to which part of the ratio.',
      },
    ],
  },

  'variation-api': {
    question: 'Find the relationship and solve',
    defaultHint: 'Direct: y = kx. Indirect/Inverse: y = k/x. Find k by substituting the given values, then use k to find the unknown.',
    misconceptions: [
      {
        label: 'confused_direct_inverse',
        pattern: (ans, correct) => false,
        hint: 'Direct variation: as x increases, y increases (y = kx). Inverse variation: as x increases, y decreases (y = k/x).',
      },
    ],
  },

  'polygons-api': {
    question: 'Find the angle or side in the polygon',
    defaultHint: 'Interior angle sum of n-gon = (n−2)×180°. Each angle of a regular n-gon = (n−2)×180°/n.',
    misconceptions: [
      {
        label: 'wrong_angle_sum_formula',
        pattern: (ans, correct) => false,
        hint: 'Interior angles: (n−2)×180°, not n×180°. For a hexagon (n=6): (6−2)×180 = 720°.',
      },
    ],
  },

  'bearing-api': {
    question: 'Find the bearing or distance',
    defaultHint: 'Bearings are measured clockwise from North. Always write as 3 digits (e.g. 045°, not 45°).',
    misconceptions: [
      {
        label: 'measured_from_wrong_direction',
        pattern: (ans, correct) => false,
        hint: 'Bearings are ALWAYS measured clockwise from North (0°). Check: did you start from North and go clockwise?',
      },
    ],
  },

  'circle-api': {
    question: 'Solve the circle problem',
    defaultHint: 'Circumference = 2πr, Area = πr². Arc length = (θ/360)×2πr. Sector area = (θ/360)×πr².',
    misconceptions: [
      {
        label: 'used_diameter_instead_of_radius',
        pattern: (ans, correct) => false,
        hint: 'r = radius (centre to edge), d = diameter (edge to edge, d = 2r). Make sure you\'re using the right value in the formula.',
      },
    ],
  },

  'ineq-api': {
    question: 'Solve the inequality',
    defaultHint: 'Treat inequalities like equations EXCEPT: if you multiply/divide by a negative number, FLIP the inequality sign.',
    misconceptions: [
      {
        label: 'forgot_to_flip_sign',
        pattern: (ans, correct) => false,
        hint: 'When multiplying or dividing by a negative number, the inequality sign FLIPS: < becomes >, ≤ becomes ≥.',
      },
    ],
  },

  'section-api': {
    question: 'Find the section formula (internal or external division)',
    defaultHint: 'Internal: ((m·B + n·A)/(m+n), (m·B_y + n·A_y)/(m+n)). External: similar but m−n in denominator.',
    misconceptions: [
      {
        label: 'internal_vs_external_confused',
        pattern: (ans, correct) => false,
        hint: 'Internal division: point divides the segment. External: the point lies ON the line extension outside the segment. Check which one the question asks.',
      },
    ],
  },

  'transform-api': {
    question: 'Describe or apply the transformation',
    defaultHint: 'Translation: (x,y)→(x+a, y+b). Rotation: (x,y)→(−y,x) for 90° about origin. Reflection: swap and/or negate coordinates.',
    misconceptions: [
      {
        label: 'wrong_rotation_direction',
        pattern: (ans, correct) => false,
        hint: '90° anticlockwise: (x,y)→(−y,x). 90° clockwise: (x,y)→(y,−x). Check your rotation direction.',
      },
    ],
  },

};

// ─────────────────────────────────────────────────────────────────────────────
// getMisconceptionHint(quizType, studentAnswer, correctAnswer)
//
// Returns the targeted hint string for a wrong answer,
// or the default hint if no pattern matches.
// ─────────────────────────────────────────────────────────────────────────────

export function getMisconceptionHint(quizType, studentAnswer, correctAnswer) {
  const config = misconceptionMap[quizType]
  if (!config) return null // no misconceptions defined

  for (const m of config.misconceptions) {
    try {
      if (m.pattern(studentAnswer, correctAnswer)) {
        // Log to "database" for long-term weakness tracking (Feature 2 upgrade)
        try {
          const history = JSON.parse(localStorage.getItem('tenali-misconceptions') || '[]')
          history.push({ quizType, label: m.label, timestamp: Date.now() })
          localStorage.setItem('tenali-misconceptions', JSON.stringify(history))
        } catch (_) {}
        
        // Replace placeholders in hint
        return m.hint
          .replace(/\{ans\}/g, String(studentAnswer))
          .replace(/\{correct\}/g, String(correctAnswer))
      }
    } catch (_) {
      // Pattern threw — skip
    }
  }

  return config.defaultHint || null
}

// ─────────────────────────────────────────────────────────────────────────────
// getDefaultHint(quizType)
//
// Returns the default hint for a quiz type (used when no misconception matches).
// ─────────────────────────────────────────────────────────────────────────────

export function getDefaultHint(quizType) {
  return misconceptionMap[quizType]?.defaultHint || null
}