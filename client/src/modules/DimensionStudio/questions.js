/**
 * questions.js - Question definitions for Dimension Studio
 *
 * Pedagogical Sequence:
 * 1. Sets & Cartesian Cross Product:
 *    - Set S = {1, 2, 3, 4} and Set P = {1, 3}
 *    - S × P (Cartesian product / cross meaning)
 *    - S × S (crossing a set with itself)
 *    - S² (why S × S is written as S²)
 * 2. The Continuous Real Line (ℝ & ℝ²):
 *    - What is ℝ? (The set of all real numbers)
 *    - Pinpointing a point in ℝ (1 degree of freedom)
 *    - What is ℝ × ℝ? (This is exactly ℝ²!)
 *    - Elements of ℝ² & connecting to Function Studio (why graphs live in ℝ²)
 * 3. The Three-Number World (ℝ³):
 *    - What is ℝ³ = ℝ × ℝ × ℝ? Elements of ℝ³: ordered triples (x, y, z)
 *    - Real-world degrees of freedom (train in ℝ, car in ℝ², drone in ℝ³)
 * 4. Beyond Human Eyesight (ℝ⁴ to ℝⁿ):
 *    - Can ℝ⁴ exist? (4-tuples: space-time x, y, z, t)
 *    - Dimensions as features in AI & data science (ℝ⁵ house features)
 *    - Universal definition of ℝⁿ (ordered n-tuples)
 * 5. Interactive Dimensional Sandbox:
 *    - Free exploration across Sets, 1D, 2D, 3D, and nD
 */

export const PATH_META = {
  title: 'Dimension Studio',
  subtitle: 'From Sets & Cross Products to ℝ, ℝ², ℝ³, and ℝⁿ',
  totalQuestions: 11
};

export const PHASES = [
  { id: 1, name: 'Phase 1: Sets & The Cross Product', range: [1, 3] },
  { id: 2, name: 'Phase 2: The Continuous Real World (ℝ & ℝ²)', range: [4, 7] },
  { id: 3, name: 'Phase 3: The Three-Number World (ℝ³)', range: [8, 8] },
  { id: 4, name: 'Phase 4: Beyond Eyesight (ℝ⁴ to ℝⁿ)', range: [9, 10] },
  { id: 5, name: 'Phase 5: Dimensional Master Ceremony', range: [11, 11] }
];

export const DIMENSION_QUESTIONS = [
  // =========================================================
  // PHASE 1: Sets & The Cross Product
  // =========================================================
  {
    id: 1,
    phaseId: 1,
    phaseTitle: 'Phase 1: Sets & The Cross Product',
    title: 'The Cross Product of Two Sets (S × P)',
    prompt: 'Given Set S = {1, 2} and Set P = {3, 4}, can you find (S × P)?',
    subtext: 'Cartesian product of S and P:',
    type: 'mcq',
    options: [
      {
        id: 'q1_merge',
        text: '{1, 2, 3, 4}',
        isCorrect: false
      },
      {
        id: 'q1_pairs',
        text: '{(1, 3), (1, 4), (2, 3), (2, 4)}',
        isCorrect: true
      },
      {
        id: 'q1_multiplied',
        text: '{3, 4, 6, 8}',
        isCorrect: false
      },
      {
        id: 'q1_two',
        text: '{(1, 3), (2, 4)}',
        isCorrect: false
      }
    ],
    explanation: 'The Cartesian product (or "cross") S × P pairs every element of S with every element of P as an ordered pair (s, p). S × P = {(1, 3), (1, 4), (2, 3), (2, 4)} — exactly 2 × 2 = 4 ordered pairs!',
    canvasMode: 'none',
    hideVisualizer: true
  },
  {
    id: 2,
    phaseId: 1,
    phaseTitle: 'Phase 1: Sets & The Cross Product',
    title: 'Crossing a Set with Itself (S × S)',
    prompt: 'Given Set S = {1, 2}, in the same manner can you find (S × S)?',
    subtext: 'Cartesian product of S with itself:',
    type: 'mcq',
    options: [
      {
        id: 'q2_squares',
        text: '{1, 4}',
        isCorrect: false
      },
      {
        id: 'q2_diagonal',
        text: '{(1, 1), (2, 2)}',
        isCorrect: false
      },
      {
        id: 'q2_4pairs',
        text: '{(1, 1), (1, 2), (2, 1), (2, 2)}',
        isCorrect: true
      },
      {
        id: 'q2_unchanged',
        text: '{1, 2}',
        isCorrect: false
      }
    ],
    explanation: 'Crossing S with itself pairs every element in S with every element in S. S × S = {(1, 1), (1, 2), (2, 1), (2, 2)} — exactly 2 × 2 = 4 ordered pairs!',
    canvasMode: 'none',
    hideVisualizer: true
  },
  {
    id: 3,
    phaseId: 1,
    phaseTitle: 'Phase 1: Sets & The Cross Product',
    title: 'Why We Write S² (The Exponent Notation)',
    prompt: 'Why is S × S written as S²?',
    subtext: 'What does the exponent 2 mean?',
    type: 'mcq',
    options: [
      {
        id: 'q3_squaring_nums',
        text: 'Squaring each number: s²',
        isCorrect: false
      },
      {
        id: 'q3_two_elements',
        text: 'The set has 2 elements',
        isCorrect: false
      },
      {
        id: 'q3_multiply_by_two',
        text: 'Multiplying each number by 2',
        isCorrect: false
      },
      {
        id: 'q3_tuples',
        text: 'Ordered pairs: (s₁, s₂)',
        isCorrect: true
      }
    ],
    explanation: 'S × S = S² denotes ordered 2-tuples (pairs). Similarly, S³ = S × S × S denotes ordered 3-tuples (triples)!',
    canvasMode: 'none',
    hideVisualizer: true
  },

  // =========================================================
  // PHASE 2: The Continuous Real World (ℝ & ℝ²)
  // =========================================================
  {
    id: 4,
    phaseId: 2,
    phaseTitle: 'Phase 2: The Continuous Real World (ℝ & ℝ²)',
    title: 'Do You Know What ℝ Is?',
    prompt: 'What does the symbol ℝ represent?',
    subtext: 'The continuous 1D number line:',
    type: 'mcq',
    options: [
      {
        id: 'q4_integers_only',
        text: 'Positive integers only',
        isCorrect: false
      },
      {
        id: 'q4_real_set',
        text: 'All Real Numbers',
        isCorrect: true
      },
      {
        id: 'q4_radius',
        text: 'Radius of a circle',
        isCorrect: false
      },
      {
        id: 'q4_variable',
        text: 'An undefined variable',
        isCorrect: false
      }
    ],
    explanation: 'ℝ is the set of all real numbers (negatives, fractions, decimals, π). Geometrically, it forms the continuous 1D number line.',
    canvasMode: 'none',
    hideVisualizer: true
  },
  {
    id: 5,
    phaseId: 2,
    phaseTitle: 'Phase 2: The Continuous Real World (ℝ & ℝ²)',
    title: 'Pinpointing a Location in ℝ',
    prompt: 'How many numbers identify a location in ℝ?',
    subtext: 'Degrees of freedom in 1D:',
    type: 'mcq',
    options: [
      {
        id: 'q5_two_numbers',
        text: '2 numbers (x, y)',
        isCorrect: false
      },
      {
        id: 'q5_one_number',
        text: '1 number (x)',
        isCorrect: true
      },
      {
        id: 'q5_three_numbers',
        text: '3 numbers (x, y, z)',
        isCorrect: false
      },
      {
        id: 'q5_infinite',
        text: 'Infinitely many numbers',
        isCorrect: false
      }
    ],
    explanation: 'Because ℝ is a 1-dimensional line, a single coordinate x gives 1 degree of freedom.',
    canvasMode: 'none',
    hideVisualizer: true
  },
  {
    id: 6,
    phaseId: 2,
    phaseTitle: 'Phase 2: The Continuous Real World (ℝ & ℝ²)',
    title: 'What is ℝ × ℝ? Meet ℝ²!',
    prompt: 'Following S × S = S², what is ℝ × ℝ?',
    subtext: 'Crossing the real line with itself:',
    type: 'mcq',
    options: [
      {
        id: 'q6_single_num',
        text: 'A single larger number',
        isCorrect: false
      },
      {
        id: 'q6_r2_plane',
        text: 'ℝ² (all ordered pairs (x, y))',
        isCorrect: true
      },
      {
        id: 'q6_two_nums',
        text: '{1, 2}',
        isCorrect: false
      },
      {
        id: 'q6_area',
        text: 'The area of a circle',
        isCorrect: false
      }
    ],
    explanation: 'Crossing the real line with itself gives ℝ × ℝ = ℝ² — the continuous 2D Cartesian plane of all ordered pairs (x, y).',
    canvasMode: '2d',
    initialCoords: { x: 2, y: 3 }
  },
  {
    id: 7,
    phaseId: 2,
    phaseTitle: 'Phase 2: The Continuous Real World (ℝ & ℝ²)',
    title: 'Elements of ℝ² & The Bridge to Function Studio',
    prompt: 'Which of the following is an element of ℝ²?',
    subtext: 'Ordered pairs of real numbers:',
    type: 'mcq',
    options: [
      {
        id: 'q7_single',
        text: '5.2',
        isCorrect: false
      },
      {
        id: 'q7_triple',
        text: '(1, 2, 3)',
        isCorrect: false
      },
      {
        id: 'q7_ordered_pair',
        text: '(2.5, -4)',
        isCorrect: true
      },
      {
        id: 'q7_shape',
        text: 'A triangle',
        isCorrect: false
      }
    ],
    explanation: 'An element of ℝ² is any ordered pair (x, y) of real numbers. Function graphs plot input x and output f(x) as points in ℝ²!',
    canvasMode: '2d',
    initialCoords: { x: 3, y: -2 }
  },

  // =========================================================
  // PHASE 3: The Three-Number World (ℝ³)
  // =========================================================
  {
    id: 8,
    phaseId: 3,
    phaseTitle: 'Phase 3: The Three-Number World (ℝ³)',
    title: 'What is ℝ³ and Give an Element of ℝ³!',
    prompt: 'What is an element of ℝ³ = ℝ × ℝ × ℝ?',
    subtext: 'Ordered triples (x, y, z):',
    type: 'mcq',
    options: [
      {
        id: 'q8_pair',
        text: '(2, -3)',
        isCorrect: false
      },
      {
        id: 'q8_cube',
        text: '3',
        isCorrect: false
      },
      {
        id: 'q8_triple_elem',
        text: '(2, -3, 5)',
        isCorrect: true
      },
      {
        id: 'q8_time',
        text: '3 hours',
        isCorrect: false
      }
    ],
    explanation: 'ℝ³ = ℝ × ℝ × ℝ is the set of all ordered triples (x, y, z) representing points in 3D space.',
    canvasMode: '3d',
    initialCoords: { x: 2, y: 3, z: 2 }
  },
  // =========================================================
  // PHASE 4: Beyond Eyesight (ℝ⁴ to ℝⁿ)
  // =========================================================
  {
    id: 9,
    phaseId: 4,
    phaseTitle: 'Phase 4: Beyond Eyesight (ℝ⁴ to ℝⁿ)',
    title: 'Can ℝ⁴ Exist?',
    prompt: 'Does ℝ⁴ mathematically exist?',
    subtext: 'Algebra vs human eyesight:',
    type: 'mcq',
    options: [
      {
        id: 'q9_impossible',
        text: 'No, only 3D can exist',
        isCorrect: false
      },
      {
        id: 'q9_eyeballs',
        text: 'Only with four eyes',
        isCorrect: false
      },
      {
        id: 'q9_algebra_eyes',
        text: 'Yes, ordered 4-tuples (x, y, z, t)',
        isCorrect: true
      },
      {
        id: 'q9_illegal',
        text: 'No, math forbids 4D',
        isCorrect: false
      }
    ],
    explanation: 'Algebra does not need eyeballs! ℝ⁴ is the set of ordered 4-tuples (x₁, x₂, x₃, x₄), used in physics for space-time (x, y, z, t).',
    canvasMode: 'none',
    hideVisualizer: true
  },
  {
    id: 10,
    phaseId: 4,
    phaseTitle: 'Phase 4: Beyond Eyesight (ℝ⁴ to ℝⁿ)',
    title: 'Dimensions as Features & The Universal Definition of ℝⁿ',
    prompt: 'A house has 5 features: (SqFt, Beds, Baths, Age, Price). Which space does it belong to?',
    subtext: 'Feature space in AI & data science:',
    type: 'mcq',
    options: [
      {
        id: 'q10_house_3d',
        text: 'ℝ³ (physical houses)',
        isCorrect: false
      },
      {
        id: 'q10_price_1d',
        text: 'ℝ (only price)',
        isCorrect: false
      },
      {
        id: 'q10_r5_rn',
        text: 'ℝ⁵ (ordered 5-tuples)',
        isCorrect: true
      },
      {
        id: 'q10_not_math',
        text: 'None (not mathematical)',
        isCorrect: false
      }
    ],
    explanation: 'In AI and Data Science, every feature is an axis! A house with 5 attributes is an element of ℝ⁵, and ℝⁿ is the set of all ordered n-tuples.',
    canvasMode: 'none',
    hideVisualizer: true
  },

  // =========================================================
  // PHASE 5: Dimensional Master Ceremony
  // =========================================================
  {
    id: 11,
    phaseId: 5,
    phaseTitle: 'Phase 5: Dimensional Master Ceremony',
    title: 'Dimensional Master Ceremony',
    prompt: 'You have mastered the ladder of dimensions — from discrete Cartesian sets S × P and S² to continuous ℝ, ℝ², ℝ³, and ℝⁿ!',
    subtext: 'The complete mathematical hierarchy of dimensions:',
    type: 'sandbox',
    options: [],
    explanation: 'Every dimension adds one independent coordinate to your address: from discrete sets S × P and S² to continuous ℝ, ℝ², ℝ³ up to high-dimensional AI vectors in ℝⁿ!',
    canvasMode: 'none',
    hideVisualizer: true
  }
];
