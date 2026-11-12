import React, { useEffect, useState } from 'react';
/**
 * RIYA_UNITS — Sequential, adaptive learning ladder for /riya.
 * Starts at basic arithmetic and climbs to the content of NIOS 311
 * Chapter 2 (Relations and Functions — I). Each unit pairs a brief
 * motivational lesson (two worked examples) with a short quiz.
 * A student must answer ≥ 4/5 questions correctly to advance;
 * otherwise the lesson replays with a gentle "let's review" note.
 * All problems are original practice items written for this ladder.
 */
const RIYA_UNITS = [
  // 1 ─ Adding & Subtracting ─────────────────────────────────────────
  {
    id: 'add-sub',
    title: 'Adding and subtracting',
    intro: 'Numbers tell us "how many". Adding combines; subtracting takes away. Riya saves ₹5 today and ₹3 tomorrow — she has ₹8. If she spends ₹2, she has ₹6 left.',
    examples: [
      {
        problem: '7 + 6 = ?', answer: '13',
        steps: ['Split 6 into 3 and 3.', '7 + 3 = 10 (easy jump to 10).', '10 + 3 = 13.']
      },
      {
        problem: '15 − 8 = ?', answer: '7',
        steps: ['Count up from 8 to 15.', '8 → 10 is 2 steps; 10 → 15 is 5 more.', '2 + 5 = 7.']
      },
    ],
    questions: [
      {
        prompt: '4 + 9 = ?', options: ['13', '12', '14', '11'], correctIndex: 0,
        explanation: 'Solution: 13\nStep 1: 4 + 6 = 10 (take 6 out of 9).\nStep 2: 10 + 3 = 13.'
      },
      {
        prompt: '12 − 5 = ?', options: ['7', '6', '8', '17'], correctIndex: 0,
        explanation: 'Solution: 7\nStep 1: 12 − 2 = 10.\nStep 2: 10 − 3 = 7.'
      },
      {
        prompt: '25 + 17 = ?', options: ['42', '32', '43', '412'], correctIndex: 0,
        explanation: 'Solution: 42\nStep 1: 25 + 15 = 40.\nStep 2: 40 + 2 = 42.'
      },
      {
        prompt: '30 − 14 = ?', options: ['16', '14', '26', '44'], correctIndex: 0,
        explanation: 'Solution: 16\nStep 1: 30 − 10 = 20.\nStep 2: 20 − 4 = 16.'
      },
      {
        prompt: '8 + 7 + 5 = ?', options: ['20', '19', '21', '15'], correctIndex: 0,
        explanation: 'Solution: 20\nStep 1: 8 + 7 = 15.\nStep 2: 15 + 5 = 20.'
      },
    ],
  },

  // 2 ─ Multiplying & Dividing ──────────────────────────────────────
  {
    id: 'mul-div',
    title: 'Multiplying and dividing',
    intro: 'Multiplication is fast adding: 4 × 3 is four groups of 3. Division is sharing equally: 12 ÷ 4 means "12 split into 4 equal piles".',
    examples: [
      {
        problem: '6 × 7 = ?', answer: '42',
        steps: ['Think 6 rows of 7 dots.', '6 × 7 = 5 × 7 + 7 = 35 + 7.', '= 42.']
      },
      {
        problem: '45 ÷ 9 = ?', answer: '5',
        steps: ['Ask: 9 × what = 45?', '9 × 5 = 45.', 'So 45 ÷ 9 = 5.']
      },
    ],
    questions: [
      {
        prompt: '8 × 6 = ?', options: ['48', '42', '56', '46'], correctIndex: 0,
        explanation: 'Solution: 48\nStep 1: 8 × 6 = 8 × 5 + 8.\nStep 2: 40 + 8 = 48.'
      },
      {
        prompt: '54 ÷ 6 = ?', options: ['9', '8', '7', '6'], correctIndex: 0,
        explanation: 'Solution: 9\nStep 1: 6 × 9 = 54.\nStep 2: So 54 ÷ 6 = 9.'
      },
      {
        prompt: '12 × 5 = ?', options: ['60', '55', '50', '65'], correctIndex: 0,
        explanation: 'Solution: 60\nStep 1: 12 × 10 = 120.\nStep 2: Halve: 120 ÷ 2 = 60.'
      },
      {
        prompt: '81 ÷ 9 = ?', options: ['9', '8', '7', '72'], correctIndex: 0,
        explanation: 'Solution: 9\nStep 1: 9 × 9 = 81.\nStep 2: So 81 ÷ 9 = 9.'
      },
      {
        prompt: '7 × 0 = ?', options: ['0', '7', '1', '70'], correctIndex: 0,
        explanation: 'Solution: 0\nStep 1: Any number times 0 is 0.\nStep 2: Seven groups of nothing is still nothing.'
      },
    ],
  },

  // 3 ─ Order of operations & integers ──────────────────────────────
  {
    id: 'order-ops',
    title: 'Order of operations and negative numbers',
    intro: 'Do brackets first, then × and ÷, then + and −. Negatives live on the left of 0 on the number line: −5 is colder than 0; subtracting a negative is the same as adding.',
    examples: [
      {
        problem: '2 + 3 × 4 = ?', answer: '14',
        steps: ['× before +.', '3 × 4 = 12.', '2 + 12 = 14.']
      },
      {
        problem: '7 − (−3) = ?', answer: '10',
        steps: ['Subtracting a negative flips the sign.', '7 − (−3) = 7 + 3.', '= 10.']
      },
    ],
    questions: [
      {
        prompt: '5 + 2 × 6 = ?', options: ['17', '42', '12', '27'], correctIndex: 0,
        explanation: 'Solution: 17\nStep 1: 2 × 6 = 12.\nStep 2: 5 + 12 = 17.'
      },
      {
        prompt: '(8 − 3) × 2 = ?', options: ['10', '2', '13', '5'], correctIndex: 0,
        explanation: 'Solution: 10\nStep 1: Brackets first: 8 − 3 = 5.\nStep 2: 5 × 2 = 10.'
      },
      {
        prompt: '−4 + 9 = ?', options: ['5', '−5', '13', '−13'], correctIndex: 0,
        explanation: 'Solution: 5\nStep 1: Start at −4 on the number line.\nStep 2: Move 9 to the right → 5.'
      },
      {
        prompt: '3 − 10 = ?', options: ['−7', '7', '−13', '13'], correctIndex: 0,
        explanation: 'Solution: −7\nStep 1: 10 − 3 = 7.\nStep 2: Since we subtracted more than we had, the answer is −7.'
      },
      {
        prompt: '−2 × −3 = ?', options: ['6', '−6', '5', '−5'], correctIndex: 0,
        explanation: 'Solution: 6\nStep 1: Negative × negative = positive.\nStep 2: 2 × 3 = 6, so −2 × −3 = 6.'
      },
    ],
  },

  // 4 ─ Fractions ────────────────────────────────────────────────────
  {
    id: 'fractions',
    title: 'Fractions',
    intro: 'A fraction is a slice of a whole: 3/4 means three of four equal pieces. To add, first match the denominators.',
    examples: [
      {
        problem: '1/2 + 1/4 = ?', answer: '3/4',
        steps: ['Make the bottoms match: 1/2 = 2/4.', '2/4 + 1/4 = 3/4.']
      },
      {
        problem: '2/3 × 3/5 = ?', answer: '2/5',
        steps: ['Multiply tops and bottoms: (2×3)/(3×5) = 6/15.', 'Simplify by 3: 6/15 = 2/5.']
      },
    ],
    questions: [
      {
        prompt: '1/3 + 1/3 = ?', options: ['2/3', '1/6', '2/6', '1/3'], correctIndex: 0,
        explanation: 'Solution: 2/3\nStep 1: Same denominator, so add the tops: 1 + 1 = 2.\nStep 2: Result: 2/3.'
      },
      {
        prompt: '3/4 − 1/2 = ?', options: ['1/4', '2/2', '1/2', '2/4'], correctIndex: 0,
        explanation: 'Solution: 1/4\nStep 1: Convert: 1/2 = 2/4.\nStep 2: 3/4 − 2/4 = 1/4.'
      },
      {
        prompt: '2/5 × 1/2 = ?', options: ['1/5', '2/10', '3/7', '2/5'], correctIndex: 0,
        explanation: 'Solution: 1/5\nStep 1: (2 × 1)/(5 × 2) = 2/10.\nStep 2: Simplify: 2/10 = 1/5.'
      },
      {
        prompt: 'Which is larger: 3/5 or 2/3?', options: ['2/3', '3/5', 'They are equal', 'Cannot tell'], correctIndex: 0,
        explanation: 'Solution: 2/3\nStep 1: Common denominator 15: 3/5 = 9/15 and 2/3 = 10/15.\nStep 2: 10/15 > 9/15, so 2/3 is larger.'
      },
      {
        prompt: 'Simplify 8/12.', options: ['2/3', '4/6', '1/2', '3/4'], correctIndex: 0,
        explanation: 'Solution: 2/3\nStep 1: Divide top and bottom by 4: 8/12 = 2/3.'
      },
    ],
  },

  // 5 ─ Variables & Expressions ──────────────────────────────────────
  {
    id: 'variables',
    title: 'Letters as numbers — a taste of algebra',
    intro: 'When we do not know a number yet, we give it a name like x. "Riya is x years old" means her age is some unknown number. 2x means "twice Riya\u2019s age".',
    examples: [
      {
        problem: 'If x = 5, find 2x + 1.', answer: '11',
        steps: ['Replace x with 5.', '2 × 5 = 10.', '10 + 1 = 11.']
      },
      {
        problem: 'If a = 3, find a² − a.', answer: '6',
        steps: ['a² means a × a.', '3 × 3 = 9, and a = 3.', '9 − 3 = 6.']
      },
    ],
    questions: [
      {
        prompt: 'If x = 4, then 3x − 2 = ?', options: ['10', '14', '5', '12'], correctIndex: 0,
        explanation: 'Solution: 10\nStep 1: 3x = 3 × 4 = 12.\nStep 2: 12 − 2 = 10.'
      },
      {
        prompt: 'If y = 2, then y² + y = ?', options: ['6', '4', '8', '5'], correctIndex: 0,
        explanation: 'Solution: 6\nStep 1: y² = 4.\nStep 2: 4 + 2 = 6.'
      },
      {
        prompt: 'Simplify 2x + 3x.', options: ['5x', '5x²', '6x', '2x + 3x'], correctIndex: 0,
        explanation: 'Solution: 5x\nStep 1: 2x and 3x are like terms.\nStep 2: 2 + 3 = 5, so 2x + 3x = 5x.'
      },
      {
        prompt: 'Expand 3(x + 2).', options: ['3x + 6', '3x + 2', 'x + 6', '3x + 5'], correctIndex: 0,
        explanation: 'Solution: 3x + 6\nStep 1: Multiply each term inside by 3.\nStep 2: 3·x + 3·2 = 3x + 6.'
      },
      {
        prompt: 'If n = −2, then 4n + 5 = ?', options: ['−3', '13', '−13', '3'], correctIndex: 0,
        explanation: 'Solution: −3\nStep 1: 4n = 4 × (−2) = −8.\nStep 2: −8 + 5 = −3.'
      },
    ],
  },

  // 6 ─ Solving simple equations ─────────────────────────────────────
  {
    id: 'equations',
    title: 'Solving for x',
    intro: 'An equation is a balance. Whatever you do to one side, do to the other, and x appears.',
    examples: [
      {
        problem: 'Solve x + 3 = 10.', answer: 'x = 7',
        steps: ['Subtract 3 from both sides.', 'x + 3 − 3 = 10 − 3.', 'x = 7.']
      },
      {
        problem: 'Solve 2x = 14.', answer: 'x = 7',
        steps: ['Divide both sides by 2.', '2x / 2 = 14 / 2.', 'x = 7.']
      },
    ],
    questions: [
      {
        prompt: 'Solve x − 4 = 9.', options: ['x = 13', 'x = 5', 'x = −5', 'x = 36'], correctIndex: 0,
        explanation: 'Solution: x = 13\nStep 1: Add 4 to both sides.\nStep 2: x = 9 + 4 = 13.'
      },
      {
        prompt: 'Solve 3x = 21.', options: ['x = 7', 'x = 18', 'x = 24', 'x = 3'], correctIndex: 0,
        explanation: 'Solution: x = 7\nStep 1: Divide both sides by 3.\nStep 2: x = 21/3 = 7.'
      },
      {
        prompt: 'Solve 2x + 1 = 9.', options: ['x = 4', 'x = 5', 'x = 8', 'x = 10'], correctIndex: 0,
        explanation: 'Solution: x = 4\nStep 1: Subtract 1: 2x = 8.\nStep 2: Divide by 2: x = 4.'
      },
      {
        prompt: 'Solve x/3 = 5.', options: ['x = 15', 'x = 8', 'x = 2', 'x = 5/3'], correctIndex: 0,
        explanation: 'Solution: x = 15\nStep 1: Multiply both sides by 3.\nStep 2: x = 5 × 3 = 15.'
      },
      {
        prompt: 'Solve 5x − 2 = 3x + 6.', options: ['x = 4', 'x = 2', 'x = 8', 'x = −2'], correctIndex: 0,
        explanation: 'Solution: x = 4\nStep 1: Subtract 3x: 2x − 2 = 6.\nStep 2: Add 2: 2x = 8. Divide by 2: x = 4.'
      },
    ],
  },

  // 7 ─ Ordered pairs & Cartesian product ────────────────────────────
  {
    id: 'ordered-pairs',
    title: 'Ordered pairs and Cartesian product',
    intro: '(a, b) is different from (b, a) — order matters, like a chess square. If A = {apples, bananas} and B = {small, big}, the menu A × B lists every pair: (apples, small), (apples, big), (bananas, small), (bananas, big).',
    examples: [
      {
        problem: 'A = {1, 2}, B = {x, y}. Write A × B.', answer: '{(1,x), (1,y), (2,x), (2,y)}',
        steps: ['Pair 1 with every element of B: (1,x), (1,y).', 'Pair 2 with every element of B: (2,x), (2,y).', 'Collect all four ordered pairs.']
      },
      {
        problem: 'If n(A) = 3 and n(B) = 2, how many pairs in A × B?', answer: '6',
        steps: ['Every element of A pairs with every element of B.', 'So 3 × 2.', '= 6 ordered pairs.']
      },
    ],
    questions: [
      {
        prompt: 'If (x + 1, 4) = (3, 4), find x.', options: ['x = 2', 'x = 4', 'x = 3', 'x = −2'], correctIndex: 0,
        explanation: 'Solution: x = 2\nStep 1: Equal ordered pairs means matching first components: x + 1 = 3.\nStep 2: So x = 2.'
      },
      {
        prompt: 'A = {1, 2, 3}, B = {5, 6}. Then n(A × B) =', options: ['6', '5', '9', '3'], correctIndex: 0,
        explanation: 'Solution: 6\nStep 1: n(A × B) = n(A) · n(B).\nStep 2: 3 · 2 = 6.'
      },
      {
        prompt: 'Which set equals A × B if A = {a} and B = {1, 2}?',
        options: ['{(a,1), (a,2)}', '{(1,a), (2,a)}', '{(a,1,2)}', '{(a), (1,2)}'], correctIndex: 0,
        explanation: 'Solution: {(a,1), (a,2)}\nStep 1: Take each element of A and pair it with each of B, in that order.\nStep 2: Pairs: (a,1), (a,2).'
      },
      {
        prompt: 'If A × B = {(p,1), (p,2), (q,1), (q,2)}, then A =', options: ['{p, q}', '{1, 2}', '{p, 1, q, 2}', '{(p,1)}'], correctIndex: 0,
        explanation: 'Solution: {p, q}\nStep 1: A is the set of first components.\nStep 2: Those are p and q.'
      },
      {
        prompt: 'For non-empty A and B, A × B = B × A exactly when:', options: ['A = B', 'A ⊂ B', 'A ∩ B = ∅', 'Always'], correctIndex: 0,
        explanation: 'Solution: A = B\nStep 1: If (a,b) is in both A × B and B × A for every a, b, then every element of A must be in B and vice-versa.\nStep 2: So A = B.'
      },
    ],
  },

  // 8 ─ Relations ────────────────────────────────────────────────────
  {
    id: 'relations',
    title: 'Relations',
    intro: 'A relation is a rule that links inputs to outputs — a sub-list of the full Cartesian product. Think of a seating plan: each student is linked to a chair, but the rule only picks certain pairs.',
    examples: [
      {
        problem: 'A = {1, 2, 3}, B = {2, 4, 6}. R = {(a, b): b = 2a}. List R.', answer: '{(1,2), (2,4), (3,6)}',
        steps: ['Check each a: 2·1 = 2 ✓, 2·2 = 4 ✓, 2·3 = 6 ✓.', 'Collect pairs (a, 2a).']
      },
      {
        problem: 'Domain and range of R = {(1,5), (2,7), (3,9)}.', answer: 'Domain {1,2,3}, Range {5,7,9}',
        steps: ['Domain = first components of the pairs.', 'Range = second components of the pairs.']
      },
    ],
    questions: [
      {
        prompt: 'A relation from A to B is:', options: ['A subset of A × B', 'A subset of A only', 'An element of A × B', 'The same as A ∪ B'], correctIndex: 0,
        explanation: 'Solution: A subset of A × B\nStep 1: Relations pick out certain ordered pairs.\nStep 2: Those pairs live in A × B, so R ⊆ A × B.'
      },
      {
        prompt: 'The domain of R = {(1,3), (2,5), (4,7)} is:', options: ['{1, 2, 4}', '{3, 5, 7}', '{1, 3, 5, 7}', '{2, 4}'], correctIndex: 0,
        explanation: 'Solution: {1, 2, 4}\nStep 1: Domain = set of first components.\nStep 2: Those are 1, 2, 4.'
      },
      {
        prompt: 'The range of R = {(1,3), (2,5), (4,7)} is:', options: ['{3, 5, 7}', '{1, 2, 4}', '{1, 7}', 'ℝ'], correctIndex: 0,
        explanation: 'Solution: {3, 5, 7}\nStep 1: Range = set of second components.\nStep 2: Those are 3, 5, 7.'
      },
      {
        prompt: 'If R = {(x, x²): x ∈ {−1, 0, 2}}, then range of R is:', options: ['{0, 1, 4}', '{−1, 0, 2}', '{0, 1, 2}', '{1, 4}'], correctIndex: 0,
        explanation: 'Solution: {0, 1, 4}\nStep 1: Compute x² for each x: (−1)² = 1, 0² = 0, 2² = 4.\nStep 2: Unique outputs: {0, 1, 4}.'
      },
      {
        prompt: 'If n(A) = 2 and n(B) = 3, the number of relations from A to B is:', options: ['2⁶ = 64', '6', '8', '2³ = 8'], correctIndex: 0,
        explanation: 'Solution: 64\nStep 1: n(A × B) = 2 · 3 = 6.\nStep 2: Each of the 6 pairs is either in R or not, giving 2⁶ = 64 relations.'
      },
    ],
  },

  // 9 ─ Functions ────────────────────────────────────────────────────
  {
    id: 'functions',
    title: 'Functions — the one-output rule',
    intro: 'A function is a special relation: every input has exactly one output. Like a vending machine — press a button, get one specific snack.',
    examples: [
      {
        problem: 'Is {(1,a), (2,a), (3,b)} a function from {1,2,3} to {a,b}?', answer: 'Yes',
        steps: ['Check each input: 1 → a, 2 → a, 3 → b.', 'Every input has exactly one output.', 'So yes, it is a function.']
      },
      {
        problem: 'Is {(1,a), (1,b), (2,a)} a function?', answer: 'No',
        steps: ['Input 1 maps to both a and b.', 'That breaks the one-output rule.', 'Not a function.']
      },
    ],
    questions: [
      {
        prompt: 'A function from A to B requires that:', options: ['every element of A has exactly one image in B', 'every element of B has exactly one pre-image', 'some elements of A map somewhere', 'A and B have the same size'], correctIndex: 0,
        explanation: 'Solution: every element of A has exactly one image in B\nStep 1: Each input gets one and only one output.\nStep 2: No input may be unmapped; none may map to two outputs.'
      },
      {
        prompt: 'Which is NOT a function from {1,2,3} to {p,q,r}?',
        options: ['{(1,p), (1,q), (2,r), (3,p)}', '{(1,p), (2,q), (3,r)}', '{(1,p), (2,p), (3,p)}', '{(1,r), (2,q), (3,p)}'], correctIndex: 0,
        explanation: 'Solution: {(1,p), (1,q), (2,r), (3,p)}\nStep 1: Input 1 maps to both p and q.\nStep 2: That violates the one-output rule.'
      },
      {
        prompt: 'If f(x) = 3x − 5, then f(4) =', options: ['7', '12', '−7', '17'], correctIndex: 0,
        explanation: 'Solution: 7\nStep 1: f(4) = 3(4) − 5.\nStep 2: = 12 − 5 = 7.'
      },
      {
        prompt: 'If f(x) = x² − 2x, then f(3) =', options: ['3', '6', '9', '−3'], correctIndex: 0,
        explanation: 'Solution: 3\nStep 1: f(3) = 9 − 6.\nStep 2: = 3.'
      },
      {
        prompt: 'If f(x) = (x + 1)/(x − 1), then f(2) =', options: ['3', '1/3', '−3', '1'], correctIndex: 0,
        explanation: 'Solution: 3\nStep 1: f(2) = (2 + 1)/(2 − 1).\nStep 2: = 3/1 = 3.'
      },
    ],
  },

  // 10 ─ Domain & Range ──────────────────────────────────────────────
  {
    id: 'domain-range',
    title: 'Domain and range of real functions',
    intro: 'Domain = the inputs the function can handle. Range = the outputs it can produce. Two common blockers: you cannot divide by 0, and you cannot take the square root of a negative number (in the reals).',
    examples: [
      {
        problem: 'Find the domain of f(x) = 1/(x − 2).', answer: 'ℝ \\ {2}',
        steps: ['The denominator cannot be 0.', 'x − 2 = 0 ⇒ x = 2.', 'Every real number except 2 is allowed.']
      },
      {
        problem: 'Find the domain of f(x) = √(x − 3).', answer: '[3, ∞)',
        steps: ['Inside a square root must be ≥ 0.', 'x − 3 ≥ 0 ⇒ x ≥ 3.', 'Domain is [3, ∞).']
      },
    ],
    questions: [
      {
        prompt: 'The domain of f(x) = 1/(x − 5) is:', options: ['ℝ \\ {5}', 'ℝ', '(5, ∞)', '[5, ∞)'], correctIndex: 0,
        explanation: 'Solution: ℝ \\ {5}\nStep 1: Denominator cannot be 0.\nStep 2: Exclude x = 5.'
      },
      {
        prompt: 'The domain of f(x) = √(x + 4) is:', options: ['[−4, ∞)', '(−4, ∞)', 'ℝ', '(−∞, −4]'], correctIndex: 0,
        explanation: 'Solution: [−4, ∞)\nStep 1: Inside √: x + 4 ≥ 0.\nStep 2: x ≥ −4.'
      },
      {
        prompt: 'The domain of f(x) = √(9 − x²) is:', options: ['[−3, 3]', '(−3, 3)', 'ℝ', '[0, 3]'], correctIndex: 0,
        explanation: 'Solution: [−3, 3]\nStep 1: 9 − x² ≥ 0 ⇒ x² ≤ 9.\nStep 2: |x| ≤ 3, i.e., −3 ≤ x ≤ 3.'
      },
      {
        prompt: 'The range of f(x) = x², x ∈ ℝ, is:', options: ['[0, ∞)', 'ℝ', '(0, ∞)', '(−∞, 0]'], correctIndex: 0,
        explanation: 'Solution: [0, ∞)\nStep 1: x² is never negative.\nStep 2: Every non-negative value is hit (take x = √y).'
      },
      {
        prompt: 'The range of the constant function f(x) = 7 is:', options: ['{7}', 'ℝ', '[7, ∞)', '{0}'], correctIndex: 0,
        explanation: 'Solution: {7}\nStep 1: Every input maps to 7.\nStep 2: So the output set is just {7}.'
      },
    ],
  },

  // 11 ─ Special real functions ──────────────────────────────────────
  {
    id: 'special',
    title: 'Modulus, signum, floor, exponential, log',
    intro: '|x| strips the sign. sgn(x) returns just the sign (−1, 0, 1). [x] rounds DOWN to the nearest integer. eˣ grows very fast; log x is its undo-button.',
    examples: [
      {
        problem: 'Compute |−5|, sgn(−4), [3.7], [−2.5].', answer: '5, −1, 3, −3',
        steps: ['|−5| = 5 — drop the sign.', 'sgn(−4) = −1 because −4 < 0.', '[3.7] = 3 (greatest integer ≤ 3.7).', '[−2.5] = −3 (integers ≤ −2.5 are …,−4,−3 — greatest is −3).']
      },
      {
        problem: 'Evaluate log₂ 8.', answer: '3',
        steps: ['log₂ 8 asks "2 to what power gives 8?"', '2³ = 8.', 'So log₂ 8 = 3.']
      },
    ],
    questions: [
      {
        prompt: '|−12| = ?', options: ['12', '−12', '0', '24'], correctIndex: 0,
        explanation: 'Solution: 12\nStep 1: |x| is the non-negative size of x.\nStep 2: |−12| = 12.'
      },
      {
        prompt: 'sgn(0) = ?', options: ['0', '1', '−1', 'undefined'], correctIndex: 0,
        explanation: 'Solution: 0\nStep 1: sgn is 1 for positives, −1 for negatives, 0 at 0.\nStep 2: Input is 0, so output is 0.'
      },
      {
        prompt: '[ −1.2 ] = ?', options: ['−2', '−1', '1', '2'], correctIndex: 0,
        explanation: 'Solution: −2\nStep 1: [x] rounds DOWN (toward −∞).\nStep 2: Integers ≤ −1.2 are …,−3, −2. The greatest is −2.'
      },
      {
        prompt: 'The range of eˣ for real x is:', options: ['(0, ∞)', '[0, ∞)', 'ℝ', '(−∞, 0)'], correctIndex: 0,
        explanation: 'Solution: (0, ∞)\nStep 1: eˣ is always positive.\nStep 2: As x → −∞, eˣ → 0⁺; as x → ∞, eˣ → ∞.'
      },
      {
        prompt: 'log₁₀ 1 = ?', options: ['0', '1', '10', 'undefined'], correctIndex: 0,
        explanation: 'Solution: 0\nStep 1: 10⁰ = 1.\nStep 2: So log₁₀ 1 = 0.'
      },
    ],
  },

  // 12 ─ Even & Odd ──────────────────────────────────────────────────
  {
    id: 'even-odd',
    title: 'Even and odd functions',
    intro: 'Even means symmetric about the y-axis: f(−x) = f(x), like x². Odd means flipped through the origin: f(−x) = −f(x), like x³.',
    examples: [
      {
        problem: 'Is f(x) = x² + 1 even or odd?', answer: 'Even',
        steps: ['f(−x) = (−x)² + 1 = x² + 1.', 'That equals f(x).', 'So f is even.']
      },
      {
        problem: 'Is f(x) = x³ − x even, odd, or neither?', answer: 'Odd',
        steps: ['f(−x) = (−x)³ − (−x) = −x³ + x.', 'That equals −(x³ − x) = −f(x).', 'So f is odd.']
      },
    ],
    questions: [
      {
        prompt: 'A function f is even when, for all x:', options: ['f(−x) = f(x)', 'f(−x) = −f(x)', 'f(x) = 0', 'f is a polynomial'], correctIndex: 0,
        explanation: 'Solution: f(−x) = f(x)\nStep 1: Even means mirror image across the y-axis.\nStep 2: Formally, f(−x) = f(x).'
      },
      {
        prompt: 'Which is ODD?', options: ['f(x) = x³', 'f(x) = x²', 'f(x) = |x|', 'f(x) = x² + 1'], correctIndex: 0,
        explanation: 'Solution: f(x) = x³\nStep 1: (−x)³ = −x³ = −f(x).\nStep 2: The other three satisfy f(−x) = f(x), so they are even.'
      },
      {
        prompt: 'f(x) = x² + |x| is:', options: ['Even', 'Odd', 'Neither', 'Both'], correctIndex: 0,
        explanation: 'Solution: Even\nStep 1: f(−x) = (−x)² + |−x| = x² + |x| = f(x).'
      },
      {
        prompt: 'f(x) = x + x³ is:', options: ['Odd', 'Even', 'Neither', 'Constant'], correctIndex: 0,
        explanation: 'Solution: Odd\nStep 1: f(−x) = −x − x³ = −(x + x³) = −f(x).'
      },
      {
        prompt: 'The graph of an even function is symmetric about:', options: ['the y-axis', 'the x-axis', 'the origin', 'the line y = x'], correctIndex: 0,
        explanation: 'Solution: the y-axis\nStep 1: f(−x) = f(x) means (x, y) and (−x, y) are both on the graph.\nStep 2: That is y-axis symmetry.'
      },
    ],
  },

  // 13 ─ Algebra of functions ────────────────────────────────────────
  {
    id: 'algebra-fn',
    title: 'Adding, multiplying and dividing functions',
    intro: 'Functions behave a lot like numbers: you can add, subtract, multiply, and divide them. (f + g)(x) = f(x) + g(x), and so on. For f/g, watch that g(x) ≠ 0.',
    examples: [
      {
        problem: 'f(x) = x² and g(x) = x + 1. Find (f + g)(x).', answer: 'x² + x + 1',
        steps: ['(f + g)(x) = f(x) + g(x).', '= x² + (x + 1).', '= x² + x + 1.']
      },
      {
        problem: 'f(x) = x + 2 and g(x) = x − 2. Find (fg)(x).', answer: 'x² − 4',
        steps: ['(fg)(x) = f(x) · g(x) = (x + 2)(x − 2).', 'Difference of squares.', '= x² − 4.']
      },
    ],
    questions: [
      {
        prompt: 'If f(x) = 2x and g(x) = x + 3, then (f + g)(2) =', options: ['9', '7', '10', '12'], correctIndex: 0,
        explanation: 'Solution: 9\nStep 1: f(2) = 4 and g(2) = 5.\nStep 2: 4 + 5 = 9.'
      },
      {
        prompt: 'If f(x) = x² and g(x) = x, the domain of (f/g)(x) is:', options: ['ℝ \\ {0}', 'ℝ', '(0, ∞)', '[0, ∞)'], correctIndex: 0,
        explanation: 'Solution: ℝ \\ {0}\nStep 1: (f/g)(x) = x²/x needs g(x) ≠ 0.\nStep 2: So x ≠ 0.'
      },
      {
        prompt: 'If f(x) = x + 1 and g(x) = x² − 1, then (f − g)(x) =', options: ['−x² + x + 2', 'x² + x', '−x² + x', 'x² + 1'], correctIndex: 0,
        explanation: 'Solution: −x² + x + 2\nStep 1: (f − g)(x) = (x + 1) − (x² − 1).\nStep 2: = x + 1 − x² + 1 = −x² + x + 2.'
      },
      {
        prompt: 'If f(x) = 3x and g(x) = x − 4, then (fg)(1) =', options: ['−9', '9', '3', '−3'], correctIndex: 0,
        explanation: 'Solution: −9\nStep 1: f(1) = 3, g(1) = −3.\nStep 2: (fg)(1) = 3 · (−3) = −9.'
      },
      {
        prompt: 'If f(x) = x + 2 and g(x) = x², then (f · g)(x) =', options: ['x³ + 2x²', 'x² + 2x', 'x³ + 2', '2x² + x²'], correctIndex: 0,
        explanation: 'Solution: x³ + 2x²\nStep 1: (f · g)(x) = (x + 2) · x².\nStep 2: = x³ + 2x².'
      },
    ],
  },
]

/**
 * RiyaApp — adaptive lesson ladder for /riya.
 * For each unit in RIYA_UNITS, the student first sees a short lesson
 * (title + intro + two worked examples), then answers five MCQs.
 * Pass threshold: 4 of 5 correct. Passing advances to the next unit;
 * failing replays the lesson with a "let's review" banner.
 */
function RiyaApp({ onBack, isGoalMode = false }) {
  const [unitIdx, setUnitIdx] = useState(0)
  const [phase, setPhase] = useState('lesson')           // 'lesson' | 'quiz' | 'complete'
  const [quizIdx, setQuizIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [showSolve, setShowSolve] = useState(false)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [totalAttempted, setTotalAttempted] = useState(0)
  const [reviewMode, setReviewMode] = useState(false)    // shows "let's review" banner on replay
  const [unitResults, setUnitResults] = useState([])     // per-unit pass record, for summary
  // Permutation that maps display slot (A, B, C, D) → original option index.
  // Updated when the student advances to a new question so the correct
  // option is not always in position A.
  const [optionOrder, setOptionOrder] = useState([0, 1, 2, 3])
  // Adaptive retry — activeIndices holds the subset of the unit's question
  // pool that is actually being asked in the current practice round. On a
  // fresh unit it's [0..n-1]; on a failed retry it shrinks to just the
  // questions the student got wrong.
  const [activeIndices, setActiveIndices] = useState(() => RIYA_UNITS[0].questions.map((_, i) => i))
  // Per-question state for the current practice round (indexed by position
  // within activeIndices): { selected, revealed }. Lets Back navigation
  // restore the student's earlier picks so they can review what they did.
  const [perQuestion, setPerQuestion] = useState([])
  const [sessionGoal, setSessionGoal] = useState(isGoalMode ? 'speed' : 'standard')
  useEffect(() => {
    if (!isGoalMode) {
      setSessionGoal('standard');
    }
  }, [isGoalMode]);

  const totalUnits = RIYA_UNITS.length
  const unit = RIYA_UNITS[unitIdx]
  const passThreshold = 4  // need >= 4 of 5 correct to advance on first pass

  // Current question in the active round
  const currentOrigIdx = activeIndices[quizIdx]
  const currentQuestion = unit && currentOrigIdx !== undefined ? unit.questions[currentOrigIdx] : null

  // Reshuffle options whenever the displayed question changes (new unit,
  // new active-round index, or returning to quiz phase). Fisher–Yates.
  useEffect(() => {
    const n = currentQuestion ? currentQuestion.options.length : 4
    const order = Array.from({ length: n }, (_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[order[i], order[j]] = [order[j], order[i]]
    }
    setOptionOrder(order)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitIdx, quizIdx, phase, currentOrigIdx])

  // ── Keyboard navigation ────────────────────────────────────────
  // Arrow keys move between options; Enter submits or advances;
  // A–D or 1–4 jump directly to that option slot. On lesson and
  // complete screens, Enter is the "continue" button.
  useEffect(() => {
    const onKey = (e) => {
      // Don't steal keys while the user is typing in a text/number field
      const tag = (e.target && e.target.tagName) || ''
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'

      if (phase === 'lesson') {
        if (e.key === 'Enter' && !isTyping) {
          e.preventDefault()
          startQuiz()
        }
        return
      }
      if (phase === 'complete') {
        if (e.key === 'Enter' && !isTyping) {
          e.preventDefault()
          handleRestart()
        }
        return
      }

      // phase === 'quiz'
      // Backspace / PageUp navigate to the previous question in either
      // answered or unanswered state.
      if ((e.key === 'Backspace' || e.key === 'PageUp') && !isTyping) {
        if (quizIdx > 0) {
          e.preventDefault()
          handleBack()
          return
        }
      }
      if (e.key === 'PageDown' && !isTyping && revealed) {
        e.preventDefault()
        handleNext()
        return
      }
      if (revealed) {
        if (e.key === 'Enter' && !isTyping) {
          e.preventDefault()
          handleNext()
        }
        return
      }

      // Not revealed → arrows navigate, Enter submits, A-D/1-4 jump
      const n = optionOrder.length
      if (n === 0) return
      const currentDisplayIdx = selected === null ? -1 : optionOrder.indexOf(selected)

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        const nextIdx = ((currentDisplayIdx < 0 ? -1 : currentDisplayIdx) + 1 + n) % n
        setSelected(optionOrder[nextIdx])
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const prevIdx = ((currentDisplayIdx < 0 ? 0 : currentDisplayIdx) - 1 + n) % n
        setSelected(optionOrder[prevIdx])
      } else if (e.key === 'Enter') {
        if (selected !== null && !isTyping) {
          e.preventDefault()
          handleSubmit()
        }
      } else if (!isTyping) {
        // A/B/C/D or 1/2/3/4 → select that slot directly
        const k = e.key.toLowerCase()
        const letterIdx = { a: 0, b: 1, c: 2, d: 3 }[k]
        const numIdx = { '1': 0, '2': 1, '3': 2, '4': 3 }[k]
        const targetDisplay = letterIdx !== undefined ? letterIdx
          : numIdx !== undefined ? numIdx : -1
        if (targetDisplay >= 0 && targetDisplay < n) {
          e.preventDefault()
          setSelected(optionOrder[targetDisplay])
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, revealed, selected, optionOrder, quizIdx, unitIdx, perQuestion, activeIndices])

  // ── Helpers ─────────────────────────────────────────────────────

  const startQuiz = () => {
    setPhase('quiz')
    setQuizIdx(0)
    setPerQuestion([])
    setSelected(null); setRevealed(false); setShowSolve(false)
  }

  const handleSubmit = () => {
    if (selected === null || revealed) return
    const q = currentQuestion
    if (!q) return
    const ok = selected === q.correctIndex
    setRevealed(true)
    // Record this question's outcome
    setPerQuestion(prev => {
      const next = [...prev]
      next[quizIdx] = { selected, revealed: true }
      return next
    })
    setTotalAttempted(n => n + 1)
    if (ok) setTotalCorrect(n => n + 1)
  }

  // Go to a given position in activeIndices. Snapshots current state into
  // perQuestion and loads whatever the student had for the destination
  // (so Back lets them review the answer they submitted).
  const goTo = (newIdx) => {
    if (newIdx < 0 || newIdx >= activeIndices.length) return
    const snapshot = { selected, revealed }
    const nextPQ = [...perQuestion]
    nextPQ[quizIdx] = snapshot
    setPerQuestion(nextPQ)
    const dest = nextPQ[newIdx]
    if (dest) {
      setSelected(dest.selected)
      setRevealed(dest.revealed)
    } else {
      setSelected(null)
      setRevealed(false)
    }
    setShowSolve(false)
    setQuizIdx(newIdx)
  }

  const handleBack = () => {
    if (quizIdx === 0) return
    goTo(quizIdx - 1)
  }

  const handleNext = () => {
    const last = quizIdx + 1 >= activeIndices.length
    if (!last) {
      goTo(quizIdx + 1)
      return
    }
    // Last question of the current round. Snapshot the last answer first.
    const finalPQ = [...perQuestion]
    finalPQ[quizIdx] = { selected, revealed }

    // Count correct in this round
    const correctThisRound = finalPQ.reduce((n, s, i) => {
      if (!s || !s.revealed) return n
      const origIdx = activeIndices[i]
      const q = unit.questions[origIdx]
      return s.selected === q.correctIndex ? n + 1 : n
    }, 0)

    // Pass rule:
    //   First pass through the unit (reviewMode=false): ≥ passThreshold.
    //   Retry (reviewMode=true): must get all re-asked questions correct.
    const passed = reviewMode
      ? correctThisRound === activeIndices.length
      : correctThisRound >= passThreshold

    setUnitResults(r => [...r, {
      title: unit.title,
      correct: correctThisRound,
      total: activeIndices.length,
      passed,
      reviewed: reviewMode,
    }])

    if (passed) {
      if (unitIdx + 1 >= totalUnits) {
        setPhase('complete')
      } else {
        const nextUnitIdx = unitIdx + 1
        setUnitIdx(nextUnitIdx)
        setPhase('lesson')
        setReviewMode(false)
        setActiveIndices(RIYA_UNITS[nextUnitIdx].questions.map((_, i) => i))
      }
    } else {
      // Adaptive retry: re-ask only the wrong ones
      const wrongIdxsInRound = []
      finalPQ.forEach((s, i) => {
        if (!s || !s.revealed) { wrongIdxsInRound.push(i); return }
        const q = unit.questions[activeIndices[i]]
        if (s.selected !== q.correctIndex) wrongIdxsInRound.push(i)
      })
      const newActive = wrongIdxsInRound.length > 0
        ? wrongIdxsInRound.map(i => activeIndices[i])
        : activeIndices    // safety net — should not normally happen
      setActiveIndices(newActive)
      setPhase('lesson')
      setReviewMode(true)
    }
    setQuizIdx(0)
    setPerQuestion([])
    setSelected(null); setRevealed(false); setShowSolve(false)
  }

  const handleRestart = () => {
    setUnitIdx(0); setPhase('lesson'); setQuizIdx(0); setPerQuestion([])
    setSelected(null); setRevealed(false); setShowSolve(false)
    setTotalCorrect(0); setTotalAttempted(0); setReviewMode(false)
    setUnitResults([])
    setActiveIndices(RIYA_UNITS[0].questions.map((_, i) => i))
  }

  // ── Rendering ───────────────────────────────────────────────────
  // Progress bar
  const progressPct = Math.round(100 * unitIdx / totalUnits)
  const renderProgress = () => (
    <div style={{ margin: '8px auto 14px', maxWidth: 480 }}>
      <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)', marginBottom: 4, textAlign: 'center' }}>
        Unit {Math.min(unitIdx + 1, totalUnits)} of {totalUnits} · {unit ? unit.title : ''}
      </div>
      <div style={{ height: 8, background: 'var(--clr-bg-soft, rgba(128,128,128,0.2))', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--clr-accent)', transition: 'width 300ms ease' }} />
      </div>
    </div>
  )

  // Complete screen
  if (phase === 'complete') {
    const pct = totalAttempted ? Math.round(100 * totalCorrect / totalAttempted) : 0
    return (
      <QuizLayout
        title="Riya — course complete"
        subtitle={`You cleared all ${totalUnits} units. Overall: ${totalCorrect} / ${totalAttempted} (${pct}%)`}
        onBack={onBack}
      >
        <div style={{ textAlign: 'center', marginTop: 16, marginBottom: 16 }}>
          <button className="submit-btn" onClick={handleRestart}>Start Over</button>
        </div>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          {unitResults.map((r, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', borderRadius: 8, marginBottom: 6,
              background: 'var(--clr-bg-soft, rgba(128,128,128,0.08))',
            }}>
              <span>{i + 1}. {r.title}</span>
              <span style={{ color: r.correct === r.total ? 'var(--clr-correct)' : 'var(--clr-text-soft)' }}>
                {r.correct}/{r.total}{r.reviewed ? ' · reviewed' : ''}
              </span>
            </div>
          ))}
        </div>
      </QuizLayout>
    )
  }

  // Lesson phase
  if (phase === 'lesson') {
    return (
      <QuizLayout
        title={`Lesson ${unitIdx + 1}: ${unit.title}`}
        subtitle={reviewMode ? 'Let us review this together, then try again.' : 'Read the short lesson, then try five practice questions.'}
        onBack={onBack}
      >
        {renderProgress()}
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{
            padding: '14px 18px', borderRadius: 10, marginBottom: 14,
            background: 'var(--clr-bg-soft, rgba(128,128,128,0.08))',
            borderLeft: '3px solid var(--clr-accent)',
            fontSize: '1rem', lineHeight: 1.5,
          }}>
            {unit.intro}
          </div>
          {unit.examples.map((ex, i) => (
            <div key={i} style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 12,
              border: '1px solid var(--clr-accent)',
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Example {i + 1}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: 4 }}>{ex.problem}</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--clr-correct)', marginTop: 4 }}>
                Answer: {ex.answer}
              </div>
              <ol style={{ margin: '8px 0 0 18px', padding: 0, lineHeight: 1.5 }}>
                {ex.steps.map((s, j) => <li key={j}>{s}</li>)}
              </ol>
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button className="submit-btn" onClick={startQuiz}>
              {reviewMode ? 'Try the practice again' : 'Start practice'}
            </button>
          </div>
        </div>
      </QuizLayout>
    )
  }

  // Quiz phase
  const q = currentQuestion
  const isCorrect = q && selected === q.correctIndex
  // Count answered + correct so far in this round, based on perQuestion
  // plus whatever the student has just selected for the current slot.
  const snapshotForCount = perQuestion.map((s, i) => (i === quizIdx ? { selected, revealed } : s))
  const roundAnswered = snapshotForCount.filter(s => s && s.revealed).length
  const roundCorrect = snapshotForCount.reduce((n, s, i) => {
    if (!s || !s.revealed) return n
    const qq = unit.questions[activeIndices[i]]
    return qq && s.selected === qq.correctIndex ? n + 1 : n
  }, 0)
  const roundTotal = activeIndices.length
  // Pass rule for the subtitle text
  const needText = reviewMode
    ? `need all ${roundTotal} correct to pass`
    : `need ${Math.min(passThreshold, roundTotal)} correct to advance`
  return (
    <QuizLayout
      title={`Practice: ${unit.title}`}
      subtitle={`Question ${quizIdx + 1} of ${roundTotal} · ${needText}${reviewMode ? ' · retry round' : ''}`}
      onBack={onBack}
    >
      {renderProgress()}
      <div className="progress-pill center" style={{ marginBottom: 12 }}>
        Correct in this round: {roundCorrect} / {roundAnswered}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-soft)', textAlign: 'center', marginBottom: 6, opacity: 0.7 }}>
        keyboard: ↑ ↓ to move · A–D or 1–4 to pick · Backspace back · Enter to {revealed ? 'continue' : 'submit'}
      </div>
      <div className="question-box" style={{ whiteSpace: 'pre-wrap', textAlign: 'center', marginBottom: 16 }}>
        <GlossaryText text={q.prompt || ''} />
      </div>
      <div className="options-list">
        {optionOrder.map((origIdx, displayIdx) => {
          const opt = q.options[origIdx]
          const letter = String.fromCharCode(65 + displayIdx)
          const isSel = selected === origIdx
          const isRight = revealed && origIdx === q.correctIndex
          const isWrongPick = revealed && isSel && origIdx !== q.correctIndex
          let extra = ''
          if (isRight) extra = 'selected'
          else if (isSel && !revealed) extra = 'selected'
          return (
            <label key={origIdx} className={`option-card ${extra}`} style={{
              borderColor: isRight ? 'var(--clr-correct)' : isWrongPick ? 'var(--clr-wrong)' : undefined,
              background: isRight ? 'var(--clr-correct-bg)' : isWrongPick ? 'var(--clr-wrong-bg)' : undefined,
              opacity: revealed && !isRight && !isWrongPick ? 0.7 : 1,
            }}>
              <input type="radio" name="riya" checked={isSel}
                onChange={() => !revealed && setSelected(origIdx)} disabled={revealed} />
              <span><strong>{letter})</strong> {opt}</span>
            </label>
          )
        })}
      </div>
      {revealed && !showSolve && (() => {
        // Find which display position currently holds the correct option
        const correctDisplayIdx = optionOrder.indexOf(q.correctIndex)
        const correctLetter = String.fromCharCode(65 + (correctDisplayIdx >= 0 ? correctDisplayIdx : 0))
        return (
          <div className={`feedback ${isCorrect ? 'correct' : 'wrong'}`} style={{ marginTop: 14, textAlign: 'center' }}>
            {isCorrect
              ? 'Correct!'
              : `Correct answer: ${correctLetter}) ${q.options[q.correctIndex]}`}
          </div>
        )
      })()}
      {showSolve && renderFeedback(q.explanation, false)}
      <div className="button-row" style={{ marginTop: 16 }}>
        <button onClick={handleBack} disabled={quizIdx === 0}
          style={{
            background: 'transparent',
            border: '1px solid var(--clr-text-soft)',
            color: 'var(--clr-text-soft)',
            opacity: quizIdx === 0 ? 0.4 : 1,
            cursor: quizIdx === 0 ? 'not-allowed' : 'pointer',
          }}>
          ← Back
        </button>
        {!revealed
          ? <button onClick={handleSubmit} disabled={selected === null}>Submit</button>
          : <button onClick={handleNext}>{quizIdx + 1 >= roundTotal ? 'Finish round' : 'Next →'}</button>}
        <button onClick={() => setShowSolve(s => !s)}
          style={{ background: 'transparent', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)' }}>
          {showSolve ? 'Hide Explanation' : 'Explanation'}
        </button>
      </div>
    </QuizLayout>
  )
}
export default RiyaApp;