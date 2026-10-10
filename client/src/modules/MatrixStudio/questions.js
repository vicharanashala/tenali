/**
 * questions.js - Question definitions for Matrix Studio Journey
 *
 * Cluster 4 — From Functions to Matrices: The Simultaneous Machine (Ax = b)
 *
 * Question Path:
 * Q1:  Plot Your Two Lines (User inputs 2 linear equations to plot)
 * Q2:  Same Values of x and y (MCQ: Where do both lines have same values of x and y? -> Intersection)
 * Q3:  Calculate the Intersection (Enter Intersect(Line1, Line2) to find meeting point)
 * Q4:  Spotting the Structure (Variables are input slots; multipliers define the rule)
 * Q5:  Extracting the Multiplier Grid (2x2 rectangular matrix)
 * Q6:  Input Stack and Target Stack (Column vectors)
 * Q7:  Row-by-Column: The Multiplier Machine (Row-dot-column operation)
 * Q8:  The Grand Equation: Ax = b (Generalizing f(x) = y)
 * Q9:  Live Evaluation: Feeding (x, y) to the Machine (Evaluating A·x = b)
 * Q10: Testing a Second System (Fresh 2x2 system assembly and solution)
 * Q11: The Naming Handover & Sandbox (Ceremony + live interactive coefficient sandbox)
 */

export const PATH_META = {
  title: 'From Functions to Matrices',
  subtitle: 'The Simultaneous Machine: Ax = b',
  totalQuestions: 11
};

export const PHASES = [
  { id: 1, name: 'Phase 1: Two Rules at Once', range: [1, 3] },
  { id: 2, name: 'Phase 2: Isolating the Structure', range: [4, 6] },
  { id: 3, name: 'Phase 3: The Multiplier Machine', range: [7, 8] },
  { id: 4, name: 'Phase 4: Live Verification on Canvas', range: [9, 10] },
  { id: 5, name: 'Phase 5: The Naming Handover', range: [11, 11] }
];

export const DEFAULT_SYSTEM = {
  line1: {
    raw: 'x + y = 5',
    a: 1,
    b: 1,
    c: 5,
    display: 'x + y = 5',
    ggbCmd: 'x + y = 5'
  },
  line2: {
    raw: '2x - y = 1',
    a: 2,
    b: -1,
    c: 1,
    display: '2x - y = 1',
    ggbCmd: '2x - y = 1'
  },
  intersection: { x: 2, y: 3 }
};

export const MATRIX_PATH_QUESTIONS = [
  {
    id: 1,
    phaseId: 1,
    phaseTitle: 'Phase 1: Two Rules at Once',
    title: 'Plot Your Two Lines',
    prompt: 'Plot two linear equations on the canvas:',
    subtext: 'Enter Line 1, then Line 2 below:'
  },
  {
    id: 2,
    phaseId: 1,
    phaseTitle: 'Phase 1: Two Rules at Once',
    title: 'Same Values of x and y',
    prompt: 'Where do both lines share the same (x, y)?',
    subtext: 'Look at Line 1 and Line 2 on the canvas:'
  },
  {
    id: 3,
    phaseId: 1,
    phaseTitle: 'Phase 1: Two Rules at Once',
    title: 'Calculate the Intersection',
    prompt: "Use GeoGebra's intersect function to calculate where the lines meet:",
    subtext: 'Type Intersect(Line1, Line2) into the input box below:'
  },
  {
    id: 4,
    phaseId: 2,
    phaseTitle: 'Phase 2: Isolating the Structure',
    title: 'A Function from ℝ² to ℝ²',
    prompt: 'Consider h(x, y) = (2x + 3y, 4x + 5y). Calculate the output for input (2, 3):',
    subtext: 'A single 2D input (x, y) feeds the SAME x and the SAME y into both coordinates simultaneously:'
  },
  {
    id: 5,
    phaseId: 2,
    phaseTitle: 'Phase 2: Isolating the Structure',
    title: 'Extracting the Multiplier Grid',
    prompt: 'Extract the 4 multipliers into a 2×2 grid:',
    subtext: 'Enter the coefficients from your equations:'
  },
  {
    id: 6,
    phaseId: 2,
    phaseTitle: 'Phase 2: Isolating the Structure',
    title: 'Input Stack and Target Stack',
    prompt: 'Enter the target constants for column b:',
    subtext: 'Extract the right-hand values:'
  },
  {
    id: 7,
    phaseId: 3,
    phaseTitle: 'Phase 3: The Multiplier Machine',
    title: 'Row-by-Column: The Multiplier Machine',
    prompt: 'Multiply row-by-column. Does it recreate your equations?',
    subtext: 'Check row × column multiplication:'
  },
  {
    id: 8,
    phaseId: 3,
    phaseTitle: 'Phase 3: The Multiplier Machine',
    title: 'The Grand Equation: A x = b',
    prompt: 'In 1D: f(x) = y. In 2D: A x = b. How do they match?',
    subtext: 'Match each part between 1D and 2D:'
  },
  {
    id: 9,
    phaseId: 4,
    phaseTitle: 'Phase 4: Live Verification on Canvas',
    title: 'Live Evaluation: Feeding (x, y) to the Machine',
    prompt: 'Evaluate A · x with your intersection coordinates:',
    subtext: 'Calculate each row\'s output:'
  },
  {
    id: 10,
    phaseId: 4,
    phaseTitle: 'Phase 4: Live Verification on Canvas',
    title: 'Testing a Second System',
    prompt: 'Solve: 2x + y = 8 and x + 2y = 7:',
    subtext: 'Enter matrix A and point (x, y):'
  },
  {
    id: 11,
    phaseId: 5,
    phaseTitle: 'Phase 5: The Naming Handover',
    title: 'The Naming Handover & Free-Play Lab',
    prompt: 'Functions to Matrices: Ax = b unlocked!',
    subtext: 'Review takeaways and explore the sandbox below:'
  }
];

export const MATRIX_STUDIO_SUMMARY = {
  title: 'From Functions to Matrices: Ax = b',
  keyTakeaways: [
    'Lines cross at (x, y), satisfying both equations simultaneously.',
    'Variables are placeholders; multipliers and constants define the system.',
    'A 2×2 matrix evaluates inputs via row-by-column multiplication.',
    'A · x = b is the multi-dimensional version of f(x) = y.',
    'Intersecting lines is identical to solving A · x = b.'
  ]
};

