/**
 * GEOGEBRA QUESTION BANK (LEVEL 1)
 *
 * Current Status: Cleared for incoming intuitive, curiosity-driven questions.
 * Note: All previous 33 questions and validator logic are preserved in:
 * `Tenali-understanding/backup_questions/`
 *
 * Expected question schema:
 * {
 *   id: 1,
 *   category: '2D Basics',
 *   prompt: 'Question prompt text...',
 *   options: [
 *     { key: 'A', text: 'Option A' },
 *     { key: 'B', text: 'Option B' },
 *     { key: 'C', text: 'Option C' },
 *     { key: 'D', text: 'Option D' }
 *   ],
 *   correct: 'A',
 *   hint: 'Syntax hint...',
 *   explanation: 'Explanation text...',
 *   perspective: 'G' // 'G' = 2D Suite/Geometry, 'T' = 3D View, 'A' = Matrix / CAS
 * }
 */

export const GEOGEBRA_LEVEL_1_QUESTIONS = [
  {
    id: 1,
    category: '2D Basics: The Point',
    prompt: 'Now that you have earned the idea of a point as a pure location in space, let us plot one on a digital coordinate plane! Which input in GeoGebra will plot a point at x = 3 and y = 5 and assign it a standard label?',
    options: [
      { key: 'A', text: '(3, 5)' },
      { key: 'B', text: 'P = [3, 5]' },
      { key: 'C', text: 'point(3, 5)' },
      { key: 'D', text: 'plot(3, 5)' }
    ],
    correct: 'A',
    hint: 'Type standard coordinates inside parentheses: (3, 5) into the GeoGebra input bar.',
    explanation: 'In GeoGebra, simply typing (3, 5) creates a geometric point at coordinates (3, 5) and automatically assigns it an uppercase letter label (A).',
    perspective: 'G'
  }
];
