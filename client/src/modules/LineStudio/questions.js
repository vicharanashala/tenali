/**
 * Cluster 2 — The Equation of a Line
 *
 * Goal: From the point earned in Cluster 1, the learner earns the embodied
 * insight — equal movement along x and y produces a straight line — then sees
 * that insight play out across a family of lines (y = x, y = 2x, y = 10x, all
 * passing through origin), and finally meets the algebraic shape that captures
 * the whole family, y = a*x + b.
 *
 * The terms "slope" and "y-intercept" are deliberately NOT used.
 * The scaffolding names "steepness / tilt" (for a) and "where the line crosses
 * the y-axis" (for b) carry the intuition.
 *
 * Faithfully adapted from Conceptual questions/clusters/cluster 2.md
 */

export const PATH_META = {
  title: 'The Equation of a Line',
  subtitle: 'From Equal Movement to the Equation y = a·x + b',
  totalQuestions: 10
};

export const PHASES = [
  { id: 1, name: 'Phase 1: Plotting & Stepping', range: [1, 3] },
  { id: 2, name: 'Phase 2: Seeing & Drawing the Line', range: [4, 5] },
  { id: 3, name: 'Phase 3: Knobs & Exploration', range: [6, 8] },
  { id: 4, name: 'Phase 4: The Equation y = ax + b', range: [9, 10] }
];

export const STAGE_0_INTRO = {
  id: 1,
  title: 'Plot Any Two Points',
  prompt: 'Plot any two different points of your choice on the canvas:',
  subtext: 'Type points into the input bar below (e.g. (1, 2) or A = (1, 2)):',
  insight: 'Every straight line starts with points sharing equal movement!'
};

export const LINE_PATH_QUESTIONS = [
  {
    id: 1,
    phaseId: 1,
    phaseTitle: 'Phase 1: Plotting & Stepping',
    title: 'Plot Any Two Points',
    prompt: 'Plot any two different points of your choice on the canvas:',
    subtext: 'Type points into the input bar below (e.g. (1, 2) or A = (1, 2)):',
    type: 'plot_points',
    creditExplanation: 'Two distinct points plotted successfully on the coordinate grid!',
    earns: 'Any straight line in the universe begins with two points!'
  },
  {
    id: 2,
    phaseId: 1,
    phaseTitle: 'Phase 1: Plotting & Stepping',
    title: 'Measure Movement Step',
    prompt: 'Find the movement step between your points:',
    subtext: null,
    type: 'step_inputs',
    creditExplanation: 'Step movement in X and shift in Y verified!',
    earns: 'The movement between points is measured by how much you move in x and how much you shift in y.'
  },
  {
    id: 3,
    phaseId: 1,
    phaseTitle: 'Phase 1: Plotting & Stepping',
    title: 'Step in Same Pattern',
    prompt: 'Plot points C, D, and E using the same step:',
    subtext: null,
    type: 'plot_points',
    creditExplanation: 'Points C, D, and E plotted along the exact same step rhythm!',
    earns: 'Repeating the same movement step creates a continuous chain of points along a straight path.'
  },
  {
    id: 4,
    phaseId: 2,
    phaseTitle: 'Phase 2: Seeing & Drawing the Line',
    title: 'Geometric Pattern',
    prompt: 'What pattern do these 5 points form?',
    subtext: null,
    type: 'mcq',
    options: [
      { id: 'q4_line', text: 'A line (Straight Line)', isCorrect: true },
      { id: 'q4_curve', text: 'A curved parabola', isCorrect: false },
      { id: 'q4_circle', text: 'A circle', isCorrect: false },
      { id: 'q4_random', text: 'Random scattered dots', isCorrect: false }
    ],
    creditExplanation: 'All five points form a straight line! Repeating the exact same delta (step) produces an unwavering straight path.',
    earns: 'When every step is the same small movement (same Δx, same Δy), points fall on a straight line.'
  },
  {
    id: 5,
    phaseId: 2,
    phaseTitle: 'Phase 2: Seeing & Drawing the Line',
    title: 'Draw the Line',
    prompt: 'Connect the points with a line:',
    subtext: 'Type Line(A, B) in the input bar below:',
    type: 'draw_line',
    creditExplanation: 'Drawing Line(A, B) creates a line that passes directly through every single point!',
    earns: 'A single straight line passes through every point built from equal movement.'
  },
  {
    id: 6,
    phaseId: 3,
    phaseTitle: 'Phase 3: Knobs & Exploration',
    title: 'Slider Observation',
    prompt: 'Change sliders "a" and "b" and type your observation:',
    subtext: null,
    type: 'slider_observation',
    creditExplanation: 'You observed how knob a controls the tilt/steepness and knob b controls where the line crosses the y-axis!',
    earns: 'You observed how knob a controls steepness/tilt, and knob b controls where the line crosses the y-axis!'
  },
  {
    id: 7,
    phaseId: 3,
    phaseTitle: 'Phase 3: Knobs & Exploration',
    title: 'Increasing Knob "a"',
    prompt: 'What happens when "a" is slowly increased?',
    subtext: null,
    type: 'mcq',
    options: [
      { id: 'q7_anticlockwise', text: 'The line moves anti-clockwise', isCorrect: true },
      { id: 'q7_clockwise', text: 'The line moves clockwise', isCorrect: false },
      { id: 'q7_shift_up', text: 'The line moves straight up along the y-axis', isCorrect: false },
      { id: 'q7_shift_right', text: 'The line moves horizontally to the right', isCorrect: false }
    ],
    creditExplanation: 'As "a" increases, the slope steepens and the line moves anti-clockwise around its y-crossing.',
    earns: 'Increasing "a" makes the line move anti-clockwise — it controls the tilt and steepness of the line.'
  },
  {
    id: 8,
    phaseId: 3,
    phaseTitle: 'Phase 3: Knobs & Exploration',
    title: 'Role of Knob "b"',
    prompt: 'What is "b" doing here?',
    subtext: null,
    type: 'mcq',
    options: [
      { id: 'q8_pass_y', text: "b gives where the line will pass at 'y'", isCorrect: true },
      { id: 'q8_pass_x', text: "b gives where the line will pass at 'x'", isCorrect: false },
      { id: 'q8_tilt', text: 'b gives how steeply the line tilts', isCorrect: false },
      { id: 'q8_rotate', text: 'b makes the line rotate clockwise', isCorrect: false }
    ],
    creditExplanation: 'The number "b" directly specifies where the line will pass at the vertical y-axis at (0, b).',
    earns: 'Knob "b" gives where the line will pass at "y" — shifting the line vertically.'
  },
  {
    id: 9,
    phaseId: 4,
    phaseTitle: 'Phase 4: The Equation y = ax + b',
    title: 'Writing the Equation',
    prompt: 'Write an equation with steepness 3 and passing through 2 at y:',
    subtext: null,
    type: 'equation_input',
    creditExplanation: 'You constructed the equation y = 3x + 2! Steepness is 3 and it passes through 2 at y.',
    earns: 'The equation shape y = ax + b connects knob "a" (steepness) and knob "b" (where it passes at y).'
  },
  {
    id: 10,
    phaseId: 4,
    phaseTitle: 'Phase 4: The Equation y = ax + b',
    title: 'Passing Through the Origin',
    prompt: 'When will the line pass through origin?',
    subtext: null,
    type: 'mcq',
    options: [
      { id: 'q10_b_zero', text: 'When b = 0', isCorrect: true },
      { id: 'q10_a_zero', text: 'When a = 0', isCorrect: false },
      { id: 'q10_a_one', text: 'When a = 1', isCorrect: false },
      { id: 'q10_a_eq_b', text: 'When a = b', isCorrect: false }
    ],
    creditExplanation: 'Because "b" gives where the line passes at y, passing through the origin (0, 0) requires b = 0!',
    earns: 'When b = 0, the line passes directly through the origin (0, 0) as y = a·x.'
  }
];

export const CLUSTER_2_SUMMARY = {
  title: 'The Equation of a Line: Complete!',
  namingHandover: {
    title: 'The Naming Handover',
    formula: 'y = a·x + b',
    quote: "Every straight line follows y = a·x + b:\n'a' controls rotation & steepness • 'b' gives where it passes at y"
  },
  takeaways: [
    'Equal movement steps (Δx, Δy) form a straight line.',
    'In y = a·x + b: "a" controls rotation/steepness, "b" gives where the line passes at y.',
    'When b = 0, the line passes directly through the origin (0, 0).'
  ],
  challenges: [
    {
      id: 'c1',
      title: 'Crossing at 3 with Steepness 2',
      description: 'Set steepness a = 2 and y-crossing b = 3',
      targetA: 2,
      targetB: 3
    },
    {
      id: 'c2',
      title: 'Flat Horizontal Line at -1',
      description: 'Set steepness a = 0 and y-crossing b = -1',
      targetA: 0,
      targetB: -1
    },
    {
      id: 'c3',
      title: 'Downward Line Through Origin',
      description: 'Set steepness a = -2 and y-crossing b = 0',
      targetA: -2,
      targetB: 0
    },
    {
      id: 'c4',
      title: 'Steep Climb Through 5',
      description: 'Set steepness a = 4 and y-crossing b = 5',
      targetA: 4,
      targetB: 5
    }
  ],
  nextCluster: 'Next Destination: Curves & Systems of Lines (What happens when lines intersect, or when the rhythm itself accelerates?)'
};
