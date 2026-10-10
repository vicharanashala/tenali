/**
 * Cluster 3 — Rules Beyond the Line
 *
 * Goal: From the line rule y = a*x + b earned in cluster 2, the learner discovers
 * that other rules — not just lines — also assign exactly one y to every x.
 * They earn the one-input-one-output pattern as a property of the rule itself,
 * not its drawn shape. They meet a rule that violates the pattern (y² = x) and
 * learn to tell the difference.
 *
 * The formal word "function" is strictly held back until the Naming Handover Ceremony!
 *
 * Faithfully adapted from Conceptual questions/clusters/cluster 3.md
 */

export const PATH_META = {
  title: 'Rules Beyond the Line',
  subtitle: 'The One-Input-One-Output Pattern',
  totalQuestions: 10
};

export const PHASES = [
  { id: 1, name: 'Phase 1: The Line Rule Was Just One Rule', range: [1, 3] },
  { id: 2, name: 'Phase 2: Many Rules, Same Pattern', range: [4, 5] },
  { id: 3, name: 'Phase 3: When the Pattern Breaks', range: [6, 8] },
  { id: 4, name: 'Phase 4: The Named Rule', range: [9, 10] }
];

export const FUNCTION_PATH_QUESTIONS = [
  {
    id: 1,
    phaseId: 1,
    phaseTitle: 'Phase 1: The Line Rule Was Just One Rule',
    title: 'Try a Different Rule',
    prompt: 'Plot the rule y = x^2 and three points on it: A = (-2, 4), B = (0, 0), and C = (2, 4). Observe whether they form a straight line.',
    subtext: 'Type y = x^2 and then plot points A, B, and C in the input bar above:',
    type: 'rule_and_points',
    expectedRule: 'y = x^2',
    ruleAliases: ['y = x^2', 'y=x^2', 'y = x²', 'y=x²', 'x^2', 'x²'],
    requiredPoints: [
      { name: 'A', x: -2, y: 4 },
      { name: 'B', x: 0, y: 0 },
      { name: 'C', x: 2, y: 4 }
    ],
    options: [
      { id: 'q1_curve', text: 'No — they curve (A and C are at the same height, with B lower between them)', isCorrect: true },
      { id: 'q1_line', text: 'Yes — they form a straight line', isCorrect: false }
    ],
    creditExplanation: 'y = x² draws a smooth curve, not a straight line! A straight line through A and C would pass through (0, 4), but B sits at (0, 0).',
    earns: 'The rule y = x² does NOT draw a straight line — it draws a curve. The line rule was just one rule; this is another.'
  },
  {
    id: 2,
    phaseId: 1,
    phaseTitle: 'Phase 1: The Line Rule Was Just One Rule',
    title: 'One y per x, Still',
    prompt: 'Look at the curve y = x². Pick x = 3 (y = 9) and x = -3 (y = 9). For ANY x you pick, does y = x² give you exactly one y?',
    subtext: 'Consider plugging any x-value into the rule y = x²:',
    type: 'mcq_observation',
    options: [
      { id: 'q2_one_y', text: 'Yes — exactly one y for every x', isCorrect: true },
      { id: 'q2_two_y', text: 'No — sometimes two y\'s, sometimes none', isCorrect: false }
    ],
    creditExplanation: 'x² is well-defined for every real x; it always gives exactly one output y and never fails to give one.',
    earns: 'Even though y = x² is not a line, it still gives exactly one y for every x. Many rules share this behavior!'
  },
  {
    id: 3,
    phaseId: 1,
    phaseTitle: 'Phase 1: The Line Rule Was Just One Rule',
    title: 'Another Rule, Again One y per x',
    prompt: 'In the input bar, type: y = x + 5. Test x = 0 (y = 5), x = 2 (y = 7), and x = -10 (y = -5). Does this rule draw a straight line or a curve?',
    subtext: 'Type y = x + 5 into the input bar above, then determine its shape:',
    type: 'rule_and_mcq',
    expectedRule: 'y = x + 5',
    ruleAliases: ['y = x + 5', 'y=x+5', 'x + 5', 'x+5'],
    options: [
      { id: 'q3_line', text: 'Straight line', isCorrect: true },
      { id: 'q3_curve', text: 'Curve', isCorrect: false }
    ],
    creditExplanation: 'y = x + 5 is a straight line rule of the form y = a*x + b (with a = 1, b = 5), and it gives exactly one y per x.',
    earns: 'y = x + 5 is another rule that gives exactly one y per x — and draws a straight line. Two different rules (x², x + 5); both satisfy "one y per x".'
  },
  {
    id: 4,
    phaseId: 2,
    phaseTitle: 'Phase 2: Many Rules, Same Pattern',
    title: 'Try Yet Another Rule: y = abs(x)',
    prompt: 'In the input bar, type: y = abs(x). A V-shape appears. For every x you pick (like 3, -3, 0), does y = abs(x) give exactly one y?',
    subtext: 'Plot y = abs(x) above and evaluate inputs x = 3, -3, 0:',
    type: 'rule_and_mcq',
    expectedRule: 'y = abs(x)',
    ruleAliases: ['y = abs(x)', 'y=abs(x)', 'abs(x)', '|x|', 'y = |x|', 'y=|x|'],
    options: [
      { id: 'q4_one_y', text: 'Yes — exactly one y for every x', isCorrect: true },
      { id: 'q4_two_y', text: 'No — sometimes two y\'s, sometimes none', isCorrect: false }
    ],
    creditExplanation: '|x| is well-defined for every real number; it always returns exactly one output value.',
    earns: 'y = |x| is yet another rule — V-shaped, not straight — and still gives exactly one y per x. Lines, x², |x| all share "one y per x".'
  },
  {
    id: 5,
    phaseId: 2,
    phaseTitle: 'Phase 2: Many Rules, Same Pattern',
    title: "What's the Common Thread?",
    prompt: 'Look at three rules you have tried: y = x², y = x + 5, and y = abs(x). Each formula and shape is different, but they share ONE fundamental property. Which one?',
    subtext: 'Identify the invariant property shared by all three rules:',
    type: 'mcq',
    options: [
      { id: 'q5_common', text: 'For every input x, each rule gives exactly one output y', isCorrect: true },
      { id: 'q5_lines', text: 'They all draw straight lines', isCorrect: false },
      { id: 'q5_curves', text: 'They all draw curves', isCorrect: false },
      { id: 'q5_origin', text: 'They all start from (0, 0)', isCorrect: false }
    ],
    creditExplanation: 'The drawn shape (line, parabola, or V-shape) can change freely, but "one input → exactly one output" is what stays invariant!',
    earns: 'The common thread across rules is: for every input x, exactly one output y. The drawn shape does not matter — what matters is "one y per x".'
  },
  {
    id: 6,
    phaseId: 3,
    phaseTitle: 'Phase 3: When the Pattern Breaks',
    title: "A Rule That Gives Two y's for One x",
    prompt: 'Consider the rule: y² = x. If x = 4, then y² = 4. What could y be? And how does this differ from y = x²?',
    subtext: 'Analyze what happens when the square is placed on y instead of x:',
    type: 'multi_part_mcq',
    part1: {
      question: 'For x = 4, y² = 4. What is y?',
      options: [
        { id: 'q6_p1_c', text: 'y = 2 OR y = -2', isCorrect: true },
        { id: 'q6_p1_a', text: 'y = 4 only', isCorrect: false },
        { id: 'q6_p1_b', text: 'y = 2 only', isCorrect: false },
        { id: 'q6_p1_d', text: 'No y works', isCorrect: false }
      ]
    },
    part2: {
      question: 'What is the key difference between y = x² and y² = x?',
      options: [
        { id: 'q6_p2_b', text: 'y = x² always gives exactly one y per x; y² = x gives two y\'s per x (when x > 0)', isCorrect: true },
        { id: 'q6_p2_a', text: 'y² = x simply uses a square on the y side', isCorrect: false },
        { id: 'q6_p2_c', text: 'They are the exact same rule written differently', isCorrect: false },
        { id: 'q6_p2_d', text: 'y = x² is broken', isCorrect: false }
      ]
    },
    creditExplanation: 'Both 2² = 4 and (-2)² = 4 satisfy y² = x. Unlike y = x², which yields one answer, y² = x yields two outputs for every positive x!',
    earns: 'The rule y² = x is different from y = x². For positive x, it gives two outputs. For negative x, it gives none. It violates the "one y per x" pattern!'
  },
  {
    id: 7,
    phaseId: 3,
    phaseTitle: 'Phase 3: When the Pattern Breaks',
    title: 'Plot y² = x on the Canvas',
    prompt: 'In the input bar, type: y^2 = x. Look at the sideways shape on the canvas. What does it look like?',
    subtext: 'Type y^2 = x into the input bar above to inspect its geometry:',
    type: 'rule_and_mcq',
    expectedRule: 'y^2 = x',
    ruleAliases: ['y^2 = x', 'y^2=x', 'y² = x', 'y²=x'],
    options: [
      { id: 'q7_branches', text: 'Two branches — an upper branch and a lower branch — that meet at (0, 0)', isCorrect: true },
      { id: 'q7_single', text: 'A single curve like x² (just sideways)', isCorrect: false },
      { id: 'q7_line', text: 'A straight line', isCorrect: false },
      { id: 'q7_circle', text: 'A closed circle', isCorrect: false }
    ],
    creditExplanation: 'y² = x is a sideways parabola with two distinct branches. Any vertical line at x > 0 cuts both branches, producing two y-values for a single x!',
    earns: 'On the canvas, y² = x has two branches sharing the same positive x coordinates. The rule is ambiguous, not single-valued.'
  },
  {
    id: 8,
    phaseId: 3,
    phaseTitle: 'Phase 3: When the Pattern Breaks',
    title: 'The Deciding Question',
    prompt: 'Compare y = x², y = abs(x), and y² = x. What makes a rule "well-formed" as a dependable way of assigning y to x?',
    subtext: 'Select the foundational property that distinguishes dependable rules:',
    type: 'mcq',
    options: [
      { id: 'q8_deciding', text: 'The rule must give exactly one y for every x — no more, no less', isCorrect: true },
      { id: 'q8_line', text: 'The rule must draw a straight line', isCorrect: false },
      { id: 'q8_letters', text: 'The rule must use only numbers, never variables', isCorrect: false },
      { id: 'q8_origin', text: 'The rule must pass through the origin (0, 0)', isCorrect: false }
    ],
    creditExplanation: 'Exactly one output y for every input x is the deciding property. No ambiguity, no double outputs, no missing values.',
    earns: 'The deciding property of a well-formed rule: for every input x, exactly one output y. This is what y = x² and y = |x| satisfy, but y² = x breaks.'
  },
  {
    id: 9,
    phaseId: 4,
    phaseTitle: 'Phase 4: The Named Rule',
    title: 'A Rule With a Name: f(x) = x²',
    prompt: 'In the input bar, type: f(x) = x^2. The curve appears, and we have named the rule "f". Compute f(3) and f(-2):',
    subtext: 'Type f(x) = x^2 into the input bar, then evaluate the outputs:',
    type: 'rule_and_inputs',
    expectedRule: 'f(x) = x^2',
    ruleAliases: ['f(x) = x^2', 'f(x)=x^2', 'f(x) = x²', 'f(x)=x²'],
    inputs: [
      { id: 'f_3', label: 'What is f(3)?', placeholder: '?', expected: '9' },
      { id: 'f_neg2', label: 'What is f(-2)?', placeholder: '?', expected: '4' }
    ],
    creditExplanation: 'f(3) = 3² = 9, and f(-2) = (-2)² = 4. The notation f(x) simply says: "this is rule f, and f(x) is its output at input x".',
    earns: 'Writing f(x) = x² names the rule "f". Then f(3) means "the output that rule f produces when input is 3" — which is 9.'
  },
  {
    id: 10,
    phaseId: 4,
    phaseTitle: 'Phase 4: The Named Rule',
    title: 'Different Rules, Different Names: g(x) = abs(x) + 1',
    prompt: 'In the input bar, type: g(x) = abs(x) + 1. Compute g(0) and g(-2). Why do f and g have different names?',
    subtext: 'Type g(x) = abs(x) + 1 above, then compute the outputs:',
    type: 'rule_and_inputs_mcq',
    expectedRule: 'g(x) = abs(x) + 1',
    ruleAliases: ['g(x) = abs(x) + 1', 'g(x)=abs(x)+1', 'g(x) = |x| + 1', 'g(x)=|x|+1'],
    inputs: [
      { id: 'g_0', label: 'What is g(0)?', placeholder: '?', expected: '1' },
      { id: 'g_neg2', label: 'What is g(-2)?', placeholder: '?', expected: '3' }
    ],
    mcq: {
      question: 'f and g are two DIFFERENT rules. Should they have different names?',
      options: [
        { id: 'q10_true', text: 'True — different rules get different names', isCorrect: true },
        { id: 'q10_false', text: 'False — all rules should share the same name', isCorrect: false }
      ]
    },
    creditExplanation: 'g(0) = |0| + 1 = 1, and g(-2) = |-2| + 1 = 3. Each well-formed rule can be given its own unique name (f, g, h).',
    earns: 'Different rules get different names. f and g are two distinct rules — f(x) = x², g(x) = |x| + 1 — giving distinct outputs for the same input.'
  }
];

export const CLUSTER_3_SUMMARY = {
  ceremony: {
    title: 'The Naming Handover Ceremony',
    subtitle: 'From a "Well-Formed Rule" to a Function',
    formalName: 'Function',
    proclamation: [
      'From now on, we call any rule that gives exactly one y for every x a **function**.',
      'The notation `f(x) = ...` is how we write one — `f` is the rule\'s name, `x` is the input, and `f(x)` is the output.',
      'A function is not just a formula — it is a **pattern**. The formula can be anything: a line, a curve, a square, an absolute value, or a wave — as long as it assigns exactly one output to every input.'
    ],
    earnedInsights: [
      'The line rule y = a*x + b was just one rule among infinitely many.',
      'y = x² is a rule that gives one y per x — but draws a curve, not a line.',
      'y = |x| is a V-shaped rule that still gives exactly one y per x.',
      'The common thread: For every x, exactly one y. Drawn shape does not matter.',
      'y² = x breaks the pattern: for positive x, it yields two outputs; for negative x, none.',
      'The deciding property of a well-formed rule: exactly one y for every x.',
      'The notation f(x) = ... names the rule "f", where f(x) is its output at input x.',
      'Different rules receive distinct names (f, g, h).',
      'Any rule possessing this one-input-one-output property is called a Function!'
    ]
  },
  lab: {
    title: 'Function Explorer Lab',
    subtitle: 'Free exploration with named rules, curves, and relations',
    instructions: 'Type any function or relation into the input bar to see its graph. Try custom names like h(x), p(x), q(x), or test what breaks the function property!',
    suggestedRules: [
      { name: 'Line Rule', cmd: 'h(x) = 2*x + 3', tag: 'Straight line' },
      { name: 'Cubic Curve', cmd: 'p(x) = x^3', tag: 'S-shaped curve' },
      { name: 'Sine Wave', cmd: 'q(x) = sin(x)', tag: 'Oscillating wave' },
      { name: 'Square Root', cmd: 'r(x) = sqrt(x)', tag: 'Upper branch only' },
      { name: 'Pattern Breaker', cmd: 'y^2 = x', tag: 'Not a function (2 branches)' }
    ]
  }
};
