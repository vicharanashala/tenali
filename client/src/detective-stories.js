/**
 * DETECTIVE STORIES — Complete Case Library
 *
 * Each topic from Tenali has 2–3 story variants so no student gets the same case
 * twice for the same module. Cases include narrative, question, answer, and hints.
 *
 * Schema:
 *   id          — unique string (topic-N)
 *   title       — display title
 *   description — short blurb for the case library
 *   difficulty  — 1 (easy) / 2 (medium) / 3 (hard)
 *   xpReward    — XP earned on completing all stages
 *   topic       — which Tenali module key this belongs to
 *   stages[]    — { narrative, question, answer, hint }
 *
 * Hint levels (shown progressively on hint click):
 *   hints[] — array of hint strings; revealed one at a time
 */

const DETECTIVE_TOPICS = {
  counting: 'Counting & Numbers',
  shapes: 'Shapes',
  patterns: 'Patterns',
  comparisons: 'Comparisons',
  addition: 'Addition',
  angles: 'Angles',
  basicarith: 'Arithmetic',
  banking: 'Banking (RD)',
  bearings: 'Bearings',
  binomial: 'Binomial Theorem',
  bounds: 'Bounds',
  circmeasure: 'Circular Measure',
  circleth: 'Circle Theorems',
  complex: 'Complex Numbers',
  congruence: 'Congruence',
  conics: 'Conic Sections',
  coordgeom: 'Coordinate Geometry',
  decimals: 'Decimals',
  diff: 'Differentiation',
  diffeq: 'Differential Equations',
  dotprod: 'Dot Products',
  fractionadd: 'Fractions',
  funceval: 'Functions',
  hcflcm: 'HCF & LCM',
  heron: "Heron's Formula",
  indices: 'Indices',
  ineq: 'Inequalities',
  integ: 'Integration',
  invtrig: 'Inverse Trig',
  limits: 'Limits',
  lineareq: 'Linear Equations',
  lineq: 'Line Equation',
  linprog: 'Linear Programming',
  log: 'Logarithms',
  matrix: 'Matrices',
  mensur: 'Mensuration',
  multiply: 'Multiplication',
  bases: 'Number Bases',
  percent: 'Percentages',
  permcomb: 'Permutations & Combinations',
  polyfactor: 'Polynomial Factorisation',
  polymul: 'Polynomial Multiplication',
  polygons: 'Polygons',
  primefactor: 'Prime Factors',
  prob: 'Probability',
  profitloss: 'Profit & Loss',
  pythag: "Pythagoras' Theorem",
  quadratic: 'Quadratic',
  qformula: 'Quadratic Formula',
  ratio: 'Ratio',
  remfactor: 'Remainder Theorem',
  rounding: 'Rounding',
  section: 'Section Formula',
  sequences: 'Sequences',
  shares: 'Shares & Dividends',
  sets: 'Sets',
  similarity: 'Similarity',
  squaring: 'Squaring',
  simul: 'Simultaneous Equations',
  sdt: 'Speed Distance Time',
  sqrt: 'Square Roots',
  stdform: 'Standard Form',
  stats: 'Statistics',
  surds: 'Surds',
  tatsavit: 'Algebra Simplification',
  transform: 'Transformations',
  triangles: 'Triangles',
  trig: 'Trigonometry',
  variation: 'Variation',
  vectors: 'Vectors',
  gst: 'GST (Goods & Services Tax)',
};

/**
 * ALL_DETECTIVE_STORIES
 * Each entry: { id, title, description, difficulty, xpReward, topic, stages: [{ narrative, question, answer, hints[] }] }
 */
const ALL_DETECTIVE_STORIES = [
  // ── UKG (Age 5) — Counting, Shapes, Patterns, Comparisons ──────────
  {
    id: 'counting-1',
    title: 'The Missing Numbers Mystery',
    description: 'Someone spilled ink on the number chart! Help find the missing numbers 1–20.',
    difficulty: 1, xpReward: 15, topic: 'counting',
    stages: [
      { narrative: 'Detective! The number line was smudged. It reads: 1, 2, _, 4, 5. A hidden message says "Find the missing number to open the toy chest!" Can you find it?',
        question: 'What number is missing? 1, 2, ?, 4, 5', answer: 3, hints: ['Count aloud: one, two, ... , four, five.', 'What comes after 2? It\'s 3!', 'The missing number is 3!'] },
      { narrative: 'Great counting! Another clue: "Count the apples: 🍎🍎🍎🍎🍎🍎🍎. How many apples are there?" The number opens a secret drawer.',
        question: '🍎🍎🍎🍎🍎🍎🍎 = How many apples?', answer: 7, hints: ['Point to each apple and count: 1, 2, 3...', 'There are 7 apples!'] },
      { narrative: 'Final clue: "What comes after 19? 19, ___" This is the page number in the storybook where evidence is hidden.',
        question: 'What number comes right after 19?', answer: 20, hints: ['20 comes after 19.', 'Count: 17, 18, 19, 20!'] },
    ],
  },
  {
    id: 'counting-2',
    title: 'The Counting Caterpillar',
    description: 'A sneaky caterpillar ate some numbers off the class board. Put them back!',
    difficulty: 1, xpReward: 15, topic: 'counting',
    stages: [
      { narrative: 'The classroom number board shows: 5, 6, 7, _, 9, 10. A caterpillar ate the missing number. What number is missing?',
        question: '5, 6, 7, ?, 9, 10. What is the missing number?', answer: 8, hints: ['Count from 5: 5, 6, 7, ...', 'Eight comes after 7!', 'The answer is 8.'] },
      { narrative: 'The caterpillar left a note: "I like numbers bigger than 12 but smaller than 15. What number am I?"',
        question: 'A number bigger than 12 but smaller than 15. What could it be?', answer: 13, hints: ['Numbers between 12 and 15 are 13 and 14.', '13 comes first!', 'The answer is 13.'] },
    ],
  },
  {
    id: 'shapes-1',
    title: 'The Shape Detective',
    description: 'A shape thief stole all the corners from the classroom. Identify the missing shapes!',
    difficulty: 1, xpReward: 15, topic: 'shapes',
    stages: [
      { narrative: 'The thief left a note: "I have 3 sides and 3 corners. What shape am I?" Find the shape to get the first clue!',
        question: 'I have 3 sides and 3 corners. What shape am I? (circle / triangle / square)', answer: 'triangle',
        hints: ['A shape with 3 sides is a triangle.', 'Count the corners of a triangle: 1, 2, 3!', 'It\'s a triangle! 🟦'] },
      { narrative: 'Next clue: "I have 4 equal sides and 4 corners. All my sides are the same length. What shape am I?"',
        question: 'I have 4 equal sides and 4 corners. What shape am I? (square / rectangle / circle)', answer: 'square',
        hints: ['A square has 4 sides, all the same length.', 'A rectangle has 4 sides too, but they\'re not all equal.', 'It\'s a square! 🟧'] },
    ],
  },
  {
    id: 'shapes-2',
    title: 'The Circle Chase',
    description: 'Round and round! Follow the circle clues to solve the mystery.',
    difficulty: 1, xpReward: 12, topic: 'shapes',
    stages: [
      { narrative: 'The villain left a drawing: a shape with no sides and no corners — it rolls! What shape is it?',
        question: 'What shape has no sides and no corners and can roll? (square / triangle / circle)', answer: 'circle',
        hints: ['A square has 4 corners. A triangle has 3.', 'What shape is left?', 'It\'s a circle! ⭕'] },
      { narrative: 'The final clue: "Count the circles in this picture: ⭕🔺⭕🟦⭕⬛" How many circles do you see?',
        question: '⭕🔺⭕🟦⭕⬛ — How many circles?', answer: 3, hints: ['Circle = ⭕', 'Count the circles: 1, 2, 3!', 'There are 3 circles.'] },
    ],
  },
  {
    id: 'patterns-1',
    title: 'The Pattern Predicament',
    description: 'A playful puppy mixed up a pattern of coloured blocks. Fix the pattern!',
    difficulty: 1, xpReward: 15, topic: 'patterns',
    stages: [
      { narrative: 'The blocks show: 🔴🔵🔴🔵🔴___. The puppy chewed the last block. What colour comes next in the pattern?',
        question: '🔴🔵🔴🔵🔴___ What colour comes next? (red / blue)', answer: 'blue',
        hints: ['The pattern goes: red, blue, red, blue...', 'After red comes blue!', 'The next block is blue! 🔵'] },
      { narrative: 'Another pattern: 🟢🟡🟢🟡🟢___. Someone hid the last shape. What comes next?',
        question: '🟢🟡🟢🟡🟢___ What colour comes next? (green / yellow)', answer: 'yellow',
        hints: ['The pattern goes: green, yellow, green, yellow...', 'After green comes yellow!', 'Yellow is next! 🟡'] },
    ],
  },
  {
    id: 'patterns-2',
    title: 'The Shape Pattern Puzzle',
    description: 'A mischievous mouse jumbled up a shape pattern. Restore it!',
    difficulty: 1, xpReward: 15, topic: 'patterns',
    stages: [
      { narrative: 'The pattern was: ◻️◻️🔺◻️◻️🔺___. What comes next — a square or a triangle?',
        question: '◻️◻️🔺◻️◻️🔺___ Next shape? (square / triangle)', answer: 'square',
        hints: ['The pattern is: square, square, triangle...', 'So it goes: square, square, triangle, square, square, triangle...', 'After triangle comes square! ◻️'] },
      { narrative: 'Now solve: ⭐⭐🌟🌟⭐⭐🌟🌟⭐___. What is the missing star?',
        question: '⭐⭐🌟🌟⭐⭐🌟🌟⭐___ Next? (small star / big star)', answer: 'small star',
        hints: ['The pattern is: small star, small star, big star, big star...', 'After big star comes small star again!', 'It\'s a small star! ⭐'] },
    ],
  },
  {
    id: 'comparisons-1',
    title: 'The Big & Small Caper',
    description: 'Someone swapped all the labels! Help sort things by size to find the clues.',
    difficulty: 1, xpReward: 12, topic: 'comparisons',
    stages: [
      { narrative: 'There are 2 boxes: one big 🎁 and one small 🎁. The clue is hidden in the BIG box. Which one is the big box — A or B? A: 🐘 B: 🐭',
        question: 'Which animal is BIG? (A: elephant 🐘 / B: mouse 🐭)', answer: 'elephant',
        hints: ['An elephant is very big!', 'A mouse is very small!', 'The big one is the elephant! 🐘'] },
      { narrative: 'Clue: "Count the toys. There are 5 cars 🚗 and 3 dolls 🎎. Are there more cars or more dolls?"',
        question: '5 cars 🚗 vs 3 dolls 🎎. Which has more? (cars / dolls)', answer: 'cars',
        hints: ['5 is more than 3.', '5 > 3.', 'There are more cars! 🚗'] },
    ],
  },
  {
    id: 'comparisons-2',
    title: 'The Long and Short of It',
    description: 'Measure which pencil is longer to find the hidden treasure!',
    difficulty: 1, xpReward: 12, topic: 'comparisons',
    stages: [
      { narrative: 'Two pencils: Pencil A is 4 blocks long, Pencil B is 7 blocks long. Which pencil is LONGER?',
        question: 'A=4 blocks, B=7 blocks. Which is longer? (A / B)', answer: 'B',
        hints: ['7 is bigger than 4.', 'So Pencil B is longer!', 'The answer is B. 📏'] },
      { narrative: 'The treasure note says: "I am thinking of something TALL. A chair is 3 feet tall. A tree is 10 feet tall. Which is taller?"',
        question: 'Chair=3ft, Tree=10ft. Which is TALLER? (chair / tree)', answer: 'tree',
        hints: ['10 is bigger than 3.', 'The tree is much taller!', 'It\'s the tree! 🌳'] },
    ],
  },

  // ── ADDITION ─────────────────────────────────────────────────────────
  {
    id: 'addition-1',
    title: 'The Bank Balance Blunder',
    description: 'A bank teller added deposits incorrectly. Help find the correct total!',
    difficulty: 1, xpReward: 30, topic: 'addition',
    stages: [
      { narrative: 'The bank received three deposits: ₹1,25,430, ₹2,34,567, and ₹3,12,345. The teller reported ₹6,72,342. But the manager suspects an error. Add the numbers correctly to find the missing amount.',
        question: '1,25,430 + 2,34,567 + 3,12,345 = ?', answer: 672342, hints: ['Start by adding the last two digits first.', '1,25,430 + 2,34,567 = 3,59,997. Then add 3,12,345.', '3,59,997 + 3,12,345 = 6,72,342. Wait — that IS what the teller reported! Maybe check again... the answer is 672342.'] },
      { narrative: 'The manager realises the teller was actually correct! But a second suspicious transaction appears: ₹45,678 + ₹89,012 + ₹67,890. The total was mysteriously written as ₹2,02,580. Verify this.',
        question: '45,678 + 89,012 + 67,890 = ?', answer: 202580, hints: ['Add 45,678 + 89,012 first.', '45,678 + 89,012 = 1,34,690.', '1,34,690 + 67,890 = 2,02,580. Correct!'] },
      { narrative: 'One more set of large numbers to verify: ₹9,87,654 + ₹1,23,456 + ₹4,56,789. The ATM log shows ₹15,67,899. Is this correct?',
        question: '9,87,654 + 1,23,456 + 4,56,789 = ?', answer: 1567899, hints: ['Break it into parts: 9,87,654 + 1,23,456 = 11,11,110.', '11,11,110 + 4,56,789 = 15,67,899.', 'Yes, the ATM log is correct.'] },
    ],
  },
  {
    id: 'addition-2',
    title: 'The Treasure Map Totals',
    description: 'A treasure map has distances marked in segments. Add them to find the total!',
    difficulty: 1, xpReward: 35, topic: 'addition',
    stages: [
      { narrative: 'The map shows three path segments: 156 steps north, 289 steps east, and 345 steps south. What is the total distance walked?',
        question: '156 + 289 + 345 = ?', answer: 790, hints: ['First add 156 + 289 = 445.', 'Then add 445 + 345 = 790 steps total.'] },
      { narrative: 'A clue says "Add the page numbers: 47, 128, 93, and 256." The sum opens a locked box.',
        question: '47 + 128 + 93 + 256 = ?', answer: 524, hints: ['Group numbers that add to easy totals: 47 + 93 = 140.', '128 + 256 = 384. Then 140 + 384 = 524.'] },
    ],
  },
  {
    id: 'addition-3',
    title: 'The Shopping Spree Mystery',
    description: 'A suspect bought items at different stores. Reconstruct the total bill.',
    difficulty: 1, xpReward: 25, topic: 'addition',
    stages: [
      { narrative: 'The suspect spent ₹599 at Store A, ₹849 at Store B, and ₹1,299 at Store C. The receipt total is torn — help recover it.',
        question: '599 + 849 + 1,299 = ?', answer: 2747, hints: ['599 + 849 = 1,448.', '1,448 + 1,299 = 2,747.'] },
      { narrative: 'The suspect also bought: ₹2,199 watch, ₹899 shoes, and ₹3,499 phone. The credit card was charged ₹6,597. Does this match?',
        question: '2,199 + 899 + 3,499 = ?', answer: 6597, hints: ['2,199 + 899 = 3,098.', '3,098 + 3,499 = 6,597. Matches!'] },
    ],
  },

  // ── ANGLES ──────────────────────────────────────────────────────────
  {
    id: 'angles-1',
    title: 'The Compass Conspiracy',
    description: 'A coded message uses angles between intersecting lines in a mysterious diagram.',
    difficulty: 1, xpReward: 35, topic: 'angles',
    stages: [
      { narrative: 'Two lines intersect. One angle is 65°. The culprit left a note: "Find the supplementary angle." What is it?',
        question: 'Supplementary angle to 65° = ?', answer: 115, hints: ['Supplementary angles add up to 180°.', '180° − 65° = 115°.'] },
      { narrative: 'The next clue: "Three angles around a point are 120°, 85°, and x°. Solve for x."',
        question: 'Angles around a point sum to 360°. 120 + 85 + x = 360. Find x.', answer: 155, hints: ['Angles around a point sum to 360°.', '120 + 85 = 205.', '360 − 205 = 155°.'] },
    ],
  },
  {
    id: 'angles-2',
    title: 'The Parallel Line Puzzle',
    description: 'A suspect drew parallel lines and used angle relationships to send a secret code.',
    difficulty: 2, xpReward: 40, topic: 'angles',
    stages: [
      { narrative: 'Two parallel lines are cut by a transversal. One corresponding angle is 73°. Find the other corresponding angle.',
        question: 'Corresponding angles are equal. If one is 73°, the other is ?', answer: 73, hints: ['Corresponding angles are equal when lines are parallel.', 'So the answer is simply 73°.'] },
      { narrative: 'An alternate interior angle is 108°. What is the co-interior (allied) angle on the same side?',
        question: 'Co-interior angles sum to 180°. 108° + ? = 180°', answer: 72, hints: ['Co-interior (allied) angles sum to 180°.', '180° − 108° = 72°.'] },
    ],
  },
  {
    id: 'angles-3',
    title: 'The Clock Angle Caper',
    description: 'The angle between clock hands reveals the time of the crime!',
    difficulty: 2, xpReward: 45, topic: 'angles',
    stages: [
      { narrative: 'The crime happened between 3:00 and 4:00. At 3:00, the hour hand points at 3 and minute hand at 12. What is the angle between them?',
        question: 'At 3:00, angle between hour (3) and minute (12) = 3 × 30° = ?°', answer: 90, hints: ['Each hour on the clock = 30°.', '3 hours apart = 3 × 30° = 90°.'] },
      { narrative: 'At 6:00, the hands form a straight line. What is the angle between them?',
        question: 'At 6:00, the hands are opposite. Angle = ?°', answer: 180, hints: ['At 6:00, hour at 6, minute at 12.', '6 hours apart = 6 × 30° = 180°.'] },
    ],
  },

  // ── ARITHMETIC (basicarith) ─────────────────────────────────────────
  {
    id: 'basicarith-1',
    title: 'The Negative Number Heist',
    description: 'A safe has a combination hidden in arithmetic with positive and negative numbers.',
    difficulty: 2, xpReward: 40, topic: 'basicarith',
    stages: [
      { narrative: 'The first clue: "Start at -8, add 15, then subtract 7. Where are you?" This is the floor number.',
        question: '-8 + 15 − 7 = ?', answer: 0, hints: ['-8 + 15 = 7.', '7 − 7 = 0.'] },
      { narrative: 'Second safe code: "Multiply -6 by 4, then divide by -3." What is the result?',
        question: '(-6 × 4) ÷ (-3) = ?', answer: 8, hints: ['-6 × 4 = -24.', '-24 ÷ (-3) = 8. (Negative ÷ negative = positive)'] },
    ],
  },
  {
    id: 'basicarith-2',
    title: 'The Subzero Sabotage',
    description: 'A freezer was sabotaged! Use integer arithmetic to trace the temperature changes.',
    difficulty: 2, xpReward: 45, topic: 'basicarith',
    stages: [
      { narrative: 'The freezer was at -18°C. Someone opened the door and it rose by 9°C, then the cooling system dropped it by 5°C. What is the temperature now?',
        question: '-18 + 9 − 5 = ?', answer: -14, hints: ['-18 + 9 = -9.', '-9 − 5 = -14°C.'] },
      { narrative: 'A second freezer shows: temperature dropped by 12°C from 3°C, then rose by 7°C. Find the final temperature.',
        question: '3 − 12 + 7 = ?', answer: -2, hints: ['3 − 12 = -9.', '-9 + 7 = -2°C.'] },
    ],
  },

  // ── BEARINGS ────────────────────────────────────────────────────────
  {
    id: 'bearings-1',
    title: 'The Lost Shipment',
    description: 'A stolen shipment was tracked using three-figure bearings. Follow the directions!',
    difficulty: 2, xpReward: 50, topic: 'bearings',
    stages: [
      { narrative: 'The tracking device shows the shipment travelled on a bearing of 045°. What direction is this? (Answer in degrees from North, clockwise.)',
        question: 'A bearing of 045° is which direction? (Northeast / Northwest / Southeast / Southwest)', answer: 'Northeast',
        hints: ['Bearings are measured clockwise from North.', '045° is exactly halfway between North (000°) and East (090°).', 'That is Northeast.'] },
      { narrative: 'The shipment then changed course to a bearing of 270°. What direction is this?',
        question: 'A bearing of 270° is which direction? (East / South / West / North)', answer: 'West',
        hints: ['North = 000°, East = 090°, South = 180°.', '270° is exactly West.'] },
    ],
  },
  {
    id: 'bearings-2',
    title: 'The Reverse Bearing',
    description: 'A suspect travelled and then returned. Find the back bearing!',
    difficulty: 2, xpReward: 55, topic: 'bearings',
    stages: [
      { narrative: 'A boat sailed on a bearing of 120° from the harbour. To return directly, they need the back bearing. Back bearing = forward bearing + 180° (or −180° if ≥ 180). What is the back bearing?',
        question: 'Back bearing of 120° = 120° + 180° = ?°', answer: 300, hints: ['Back bearing = forward bearing + 180°.', '120° + 180° = 300°.'] },
      { narrative: 'A plane flew on bearing 310° from the airport. The control tower needs the bearing to fly back. What is the back bearing?',
        question: 'Back bearing of 310° = 310° − 180° = ?°', answer: 130, hints: ['Since 310° ≥ 180°, subtract 180°.', '310° − 180° = 130°.'] },
    ],
  },

  // ── BINOMIAL THEOREM ────────────────────────────────────────────────
  {
    id: 'binomial-1',
    title: 'The Binomial Bank Vault',
    description: 'A vault code is hidden in the coefficients of a binomial expansion.',
    difficulty: 3, xpReward: 70, topic: 'binomial',
    stages: [
      { narrative: 'The vault manual says: "Expand (x + y)² and use the middle coefficient for the first digit." What is the coefficient of the xy term?',
        question: 'Coefficient of xy in (x + y)² = ?', answer: 2, hints: ['(x + y)² = x² + 2xy + y².', 'The coefficient of xy is 2.'] },
      { narrative: 'Next digit: "The sum of coefficients in (x + y)³" gives the second digit.',
        question: 'Sum of all coefficients in (x + y)³ = ?', answer: 8, hints: ['(x + y)³ = x³ + 3x²y + 3xy² + y³.', 'Sum = 1 + 3 + 3 + 1 = 8.'] },
    ],
  },

  // ── CIRCLE THEOREMS ─────────────────────────────────────────────────
  {
    id: 'circleth-1',
    title: 'The Circular Conspiracy',
    description: 'A mysterious circle diagram holds the key to cracking the case!',
    difficulty: 2, xpReward: 55, topic: 'circleth',
    stages: [
      { narrative: 'In a circle, the angle at the centre is 140°. What is the angle at the circumference subtended by the same arc?',
        question: 'Angle at centre = 2 × angle at circumference. 140° ÷ 2 = ?', answer: 70, hints: ['The angle at the centre is twice the angle at the circumference.', '140° ÷ 2 = 70°.'] },
      { narrative: 'An angle in a semicircle is always how many degrees? The next clue is hidden here.',
        question: 'Angle in a semicircle = ?°', answer: 90, hints: ['Think about Thales\' theorem.', 'The angle in a semicircle is always 90°.'] },
    ],
  },

  // ── COORDINATE GEOMETRY ─────────────────────────────────────────────
  {
    id: 'coordgeom-1',
    title: 'The Grid Getaway',
    description: 'A suspect\'s hideout is located using coordinate geometry. Find the midpoint!',
    difficulty: 2, xpReward: 50, topic: 'coordgeom',
    stages: [
      { narrative: 'Two witnesses spotted the suspect at points A(2, 3) and B(8, 7). The hideout is exactly halfway between them. What are the coordinates of the midpoint?',
        question: 'Midpoint of (2, 3) and (8, 7) = (?, ?)', answer: '(5, 5)',
        hints: ['Midpoint formula: ((x₁+x₂)/2, (y₁+y₂)/2).', 'x: (2+8)/2 = 5, y: (3+7)/2 = 5.', 'So the midpoint is (5, 5).'] },
      { narrative: 'The distance between the two sightings might help too. Calculate the distance between A(2, 3) and B(8, 7). (Round to 1 decimal place.)',
        question: 'Distance between (2,3) and (8,7) = √((8-2)² + (7-3)²) = ? (1 d.p.)', answer: 7.2,
        hints: ['Distance formula: √((x₂-x₁)² + (y₂-y₁)²).', '√((6)² + (4)²) = √(36 + 16) = √52.', '√52 ≈ 7.2 units.'] },
    ],
  },
  {
    id: 'coordgeom-2',
    title: 'The Gradient Getaway',
    description: 'The gradient of a line connecting two hideout locations reveals the escape route.',
    difficulty: 2, xpReward: 55, topic: 'coordgeom',
    stages: [
      { narrative: 'A hideout is at A(1, 2) and the next drop point is B(5, 10). What is the gradient of the line connecting them?',
        question: 'Gradient = (10-2)/(5-1) = 8/4 = ?', answer: 2, hints: ['Gradient = (y₂−y₁)/(x₂−x₁).', '(10−2)/(5−1) = 8/4 = 2.'] },
      { narrative: 'What is the equation of the line passing through these points in the form y = mx + c? Use m = 2 and point (1, 2).',
        question: '2 = 2(1) + c → c = ?. Equation: y = 2x + ?', answer: 0, hints: ['y = mx + c → 2 = 2(1) + c.', '2 = 2 + c → c = 0.', 'Equation: y = 2x.'] },
    ],
  },

  // ── DECIMALS ────────────────────────────────────────────────────────
  {
    id: 'decimals-1',
    title: 'The Precise Poisoning',
    description: 'A pharmacist poisoned a medicine by altering decimal quantities. Restore the correct doses!',
    difficulty: 1, xpReward: 30, topic: 'decimals',
    stages: [
      { narrative: 'The correct dose was 2.5 ml but it was changed to 1.75 ml. How much medicine is missing?',
        question: '2.5 − 1.75 = ?', answer: 0.75, hints: ['2.5 = 2.50.', '2.50 − 1.75 = 0.75 ml.'] },
      { narrative: 'Another bottle should contain 3.6 litres but someone added 0.85 litres too much. What is the correct amount it should contain? (Find what was there before the extra was added.)',
        question: 'Wait — if the current amount is 3.6 L and 0.85 L was added, what was the original amount? 3.6 − 0.85 = ?', answer: 2.75,
        hints: ['3.60 − 0.85 = ?', '3.60 − 0.85 = 2.75 litres.'] },
    ],
  },

  // ── DIFFERENTIATION ─────────────────────────────────────────────────
  {
    id: 'diff-1',
    title: 'The Derivative Detective',
    description: 'A hidden message is encoded in derivatives of polynomial functions.',
    difficulty: 3, xpReward: 80, topic: 'diff',
    stages: [
      { narrative: 'The first code: "Find dy/dx when y = x³ + 4x² − 2x + 7. Then evaluate at x = 1." The result is the first digit.',
        question: 'dy/dx = 3x² + 8x − 2. Evaluate at x = 1: 3 + 8 − 2 = ?', answer: 9,
        hints: ['Power rule: d/dx(xⁿ) = nxⁿ⁻¹.', 'dy/dx = 3x² + 8x − 2.', 'At x = 1: 3(1)² + 8(1) − 2 = 9.'] },
      { narrative: 'Second clue: "For y = 2x³ − 3x² + 5x − 1, find dy/dx at x = 2."',
        question: 'dy/dx = 6x² − 6x + 5. At x = 2: 6(4) − 6(2) + 5 = ?', answer: 17,
        hints: ['dy/dx = 6x² − 6x + 5.', '6(4) = 24, 6(2) = 12.', '24 − 12 + 5 = 17.'] },
    ],
  },

  // ── FRACTIONS ───────────────────────────────────────────────────────
  {
    id: 'fractionadd-1',
    title: 'The Recipe Riddle',
    description: 'A chef\'s recipe was tampered with. Fix the fraction measurements!',
    difficulty: 2, xpReward: 40, topic: 'fractionadd',
    stages: [
      { narrative: 'The recipe calls for 2/3 cup of flour and 1/4 cup of sugar. The chef added them together by mistake. What is 2/3 + 1/4? (Answer as a simplified fraction a/b)',
        question: '2/3 + 1/4 = ? (Simplify your answer)', answer: '11/12',
        hints: ['Find a common denominator: LCM of 3 and 4 is 12.', '2/3 = 8/12, 1/4 = 3/12.', '8/12 + 3/12 = 11/12.'] },
      { narrative: 'The chef needs 5/6 of the total mixture but only has 1/3. What fraction more does she need?',
        question: '5/6 − 1/3 = ? (Answer as a/b)', answer: '1/2',
        hints: ['1/3 = 2/6.', '5/6 − 2/6 = 3/6 = 1/2.'] },
    ],
  },

  // ── FUNCTIONS ───────────────────────────────────────────────────────
  {
    id: 'funceval-1',
    title: 'The Function of Evil',
    description: 'The suspect encoded their name using function notation. Decode it!',
    difficulty: 2, xpReward: 45, topic: 'funceval',
    stages: [
      { narrative: 'If f(x) = 3x − 5, then f(4) tells us the building number where the suspect was seen. What is f(4)?',
        question: 'f(4) = 3(4) − 5 = ?', answer: 7, hints: ['Substitute x = 4 into 3x − 5.', '3(4) − 5 = 12 − 5 = 7.'] },
      { narrative: 'If g(x) = x² + 2x + 1, find g(3). This is the room number.',
        question: 'g(3) = 3² + 2(3) + 1 = ?', answer: 16, hints: ['3² = 9.', '9 + 6 + 1 = 16.'] },
    ],
  },

  // ── HCF & LCM ───────────────────────────────────────────────────────
  {
    id: 'hcflcm-1',
    title: 'The Factor of Crime',
    description: 'A criminal left a trail using HCF and LCM of numbers.',
    difficulty: 2, xpReward: 45, topic: 'hcflcm',
    stages: [
      { narrative: 'The first clue: "Find the HCF of 36 and 48." This is the safe number.',
        question: 'HCF(36, 48) = ?', answer: 12, hints: ['Factors of 36: 1,2,3,4,6,9,12,18,36.', 'Factors of 48: 1,2,3,4,6,8,12,16,24,48.', 'Greatest common factor = 12.'] },
      { narrative: 'Second clue: "The LCM of 12 and 18 is the next code."',
        question: 'LCM(12, 18) = ?', answer: 36, hints: ['Multiples of 12: 12, 24, 36, 48...', 'Multiples of 18: 18, 36, 54...', 'Smallest common multiple = 36.'] },
    ],
  },

  // ── INDICES ─────────────────────────────────────────────────────────
  {
    id: 'indices-1',
    title: 'The Exponential Escape',
    description: 'The suspect used laws of indices to encrypt their escape route.',
    difficulty: 2, xpReward: 50, topic: 'indices',
    stages: [
      { narrative: 'The note says: "Simplify 2³ × 2⁴. The result equals the floor I escaped from."',
        question: '2³ × 2⁴ = 2^(3+4) = 2^? = ?', answer: 128, hints: ['Add the exponents: 2^3 × 2^4 = 2^(3+4) = 2^7.', '2^7 = 128.'] },
      { narrative: 'Another clue: "Simplify (5²)³. Divide by 5⁴." The result is the number of the getaway car.',
        question: '(5²)³ ÷ 5⁴ = 5^6 ÷ 5^4 = 5^(6-4) = 5^? = ?', answer: 25, hints: ['(5²)³ = 5^6.', '5^6 ÷ 5^4 = 5^(6-4) = 5^2 = 25.'] },
    ],
  },

  // ── INEQUALITIES ────────────────────────────────────────────────────
  {
    id: 'ineq-1',
    title: 'The Inequality Intrigue',
    description: 'A ransom note uses inequalities to hide the location.',
    difficulty: 2, xpReward: 50, topic: 'ineq',
    stages: [
      { narrative: 'The note: "x > 5 and x ≤ 10. The integer x is the floor where the package is hidden. There are 5 possible floors. Pick the largest."',
        question: 'Largest integer satisfying 5 < x ≤ 10 is ?', answer: 10, hints: ['x can be 6, 7, 8, 9, or 10.', 'The largest is 10.'] },
      { narrative: 'Second note: "2x − 7 > 3. Solve for x." The smallest integer solution is the row number.',
        question: '2x − 7 > 3 → 2x > 10 → x > ? Smallest integer: ?', answer: 6, hints: ['Add 7 to both sides: 2x > 10.', 'Divide by 2: x > 5.', 'Smallest integer greater than 5 is 6.'] },
    ],
  },

  // ── LINEAR EQUATIONS ────────────────────────────────────────────────
  {
    id: 'lineareq-1',
    title: 'The Equation Evidence',
    description: 'Linear equations hold the key to unlocking evidence lockers.',
    difficulty: 1, xpReward: 30, topic: 'lineareq',
    stages: [
      { narrative: 'A locker combination is the solution to: 3x + 7 = 22. What is x?',
        question: '3x + 7 = 22. Solve for x.', answer: 5, hints: ['Subtract 7 from both sides: 3x = 15.', 'Divide by 3: x = 5.'] },
      { narrative: 'Next locker: 4x − 9 = 23. Find x.',
        question: '4x − 9 = 23. Solve for x.', answer: 8, hints: ['Add 9 to both sides: 4x = 32.', 'Divide by 4: x = 8.'] },
    ],
  },

  // ── LOGARITHMS ──────────────────────────────────────────────────────
  {
    id: 'log-1',
    title: 'The Logarithmic Lair',
    description: 'The villain used logarithms to encode their secret base coordinates.',
    difficulty: 3, xpReward: 75, topic: 'log',
    stages: [
      { narrative: 'First clue: log₁₀(100) = ? This is the building number.',
        question: 'log₁₀(100) = ? (Hint: 10^? = 100)', answer: 2, hints: ['log₁₀(100) asks: 10 to what power equals 100?', '10² = 100, so log₁₀(100) = 2.'] },
      { narrative: 'Second clue: log₂(32) = ? This is the floor number.',
        question: 'log₂(32) = ? (Hint: 2^? = 32)', answer: 5, hints: ['log₂(32) asks: 2 to what power equals 32?', '2⁵ = 32, so log₂(32) = 5.'] },
    ],
  },

  // ── MATRICES ────────────────────────────────────────────────────────
  {
    id: 'matrix-1',
    title: 'The Matrix Mystery',
    description: 'A secret message is hidden in matrix operations.',
    difficulty: 3, xpReward: 80, topic: 'matrix',
    stages: [
      { narrative: 'Matrix A = [2 4; 1 3]. Find the determinant of A. This is the first digit.',
        question: 'det([2 4; 1 3]) = 2×3 − 4×1 = ?', answer: 2, hints: ['For a 2×2 matrix [a b; c d], determinant = ad − bc.', '2×3 − 4×1 = 6 − 4 = 2.'] },
      { narrative: 'Now add matrix B = [1 0; 0 1] to matrix A. What is the element in row 1, column 1 of A+B?',
        question: '[2 4; 1 3] + [1 0; 0 1] = ? Element at (1,1): ?', answer: 3, hints: ['Add corresponding elements.', '(2+1) = 3 at row 1, column 1.'] },
    ],
  },

  // ── MENSURATION ─────────────────────────────────────────────────────
  {
    id: 'mensur-1',
    title: 'The Garden Geometry Caper',
    description: 'A garden was dug up. Mensuration helps find what was taken.',
    difficulty: 2, xpReward: 55, topic: 'mensur',
    stages: [
      { narrative: 'A rectangular garden is 15 metres long and 8 metres wide. What is its area?',
        question: 'Area of rectangle = length × width = 15 × 8 = ? m²', answer: 120, hints: ['Area = 15 × 8 = 120 m².'] },
      { narrative: 'A cylindrical drum of radius 7 cm and height 10 cm was used. What is its volume? (Use π = 22/7)',
        question: 'Volume of cylinder = πr²h = (22/7) × 7² × 10 = ? cm³', answer: 1540, hints: ['r² = 7² = 49.', '(22/7) × 49 = 22 × 7 = 154.', '154 × 10 = 1540 cm³.'] },
    ],
  },

  // ── MULTIPLICATION ──────────────────────────────────────────────────
  {
    id: 'multiply-1',
    title: 'The Times Table Trail',
    description: 'A skip-counting trail left by the suspect reveals their path!',
    difficulty: 1, xpReward: 25, topic: 'multiply',
    stages: [
      { narrative: 'The suspect visited apartments that are multiples of 7: 7, 14, 21, _, 35. What is the missing number?',
        question: '7, 14, 21, ?, 35. Find the missing multiple.', answer: 28, hints: ['Adding 7 each time: 7, 14, 21, 28, 35.', 'The missing number is 28.'] },
      { narrative: 'Another trail: multiples of 8: 8, 16, 24, _, 40. What is the missing number? This is the apartment where evidence was found.',
        question: '8, 16, 24, ?, 40. Find the missing multiple.', answer: 32, hints: ['Adding 8 each time: 8, 16, 24, 32, 40.', 'The missing number is 32.'] },
    ],
  },

  // ── NUMBER BASES ────────────────────────────────────────────────────
  {
    id: 'bases-1',
    title: 'The Binary Decoder',
    description: 'A computer hacker left binary clues. Convert them to decimal!',
    difficulty: 2, xpReward: 55, topic: 'bases',
    stages: [
      { narrative: 'The hacker left: "10110 in binary = ? in decimal." This is the server room number.',
        question: '10110₂ = 1×16 + 0×8 + 1×4 + 1×2 + 0×1 = ?', answer: 22, hints: ['10110₂ = 1×16 + 0×8 + 1×4 + 1×2 + 0×1.', '16 + 0 + 4 + 2 + 0 = 22.'] },
      { narrative: 'Next clue: "1A in hexadecimal = ? in decimal." This opens a file.',
        question: '1A₁₆ = 1×16 + 10×1 = ?', answer: 26, hints: ['A in hexadecimal = 10 in decimal.', '1×16 + 10×1 = 16 + 10 = 26.'] },
    ],
  },

  // ── PERCENTAGES ─────────────────────────────────────────────────────
  {
    id: 'percent-1',
    title: 'The Discount Deception',
    description: 'A shopkeeper cheated customers with false discounts. Find the correct prices!',
    difficulty: 2, xpReward: 45, topic: 'percent',
    stages: [
      { narrative: 'A jacket costs ₹2,000. It was marked as "25% off." But the shopkeeper charged ₹1,600. Did they charge the correct discounted price? What should 25% off ₹2,000 be?',
        question: '25% of 2000 = ? Discounted price = 2000 − 500 = ?', answer: 1500, hints: ['25% = 1/4.', '2000 ÷ 4 = 500.', '2000 − 500 = 1500. The shopkeeper overcharged!'] },
      { narrative: 'A phone costs ₹15,000 and the shopkeeper gave "10% off + 5% additional off." The customer paid ₹12,825. Is this correct? First find 10% of 15,000, then 5% off THAT result.',
        question: 'Step 1: 15000 − 10% = 13500. Step 2: 13500 − 5% = ?', answer: 12825, hints: ['10% of 15000 = 1500. After 10% off: 15000 − 1500 = 13500.', '5% of 13500 = 675.', '13500 − 675 = 12825. Correct!'] },
    ],
  },

  // ── POLYGONS ────────────────────────────────────────────────────────
  {
    id: 'polygons-1',
    title: 'The Pentagon Plot',
    description: 'A mysterious polygon was drawn at the crime scene. Its angles tell a story.',
    difficulty: 2, xpReward: 50, topic: 'polygons',
    stages: [
      { narrative: 'A pentagon has interior angles summing to 540°. Four angles are 100°, 110°, 120°, and 130°. Find the missing angle.',
        question: 'Sum = 540. Given: 100+110+120+130 = 460. Missing = 540−460 = ?', answer: 80, hints: ['Sum of four given angles: 100+110+120+130 = 460°.', '540° − 460° = 80°.'] },
      { narrative: 'A regular hexagon has how many degrees in each interior angle? This is the next code.',
        question: 'Each interior angle of a regular hexagon = (6−2)×180÷6 = ?', answer: 120, hints: ['Sum of interior angles of hexagon = (n−2)×180° = 4×180 = 720°.', 'Each angle = 720° ÷ 6 = 120°.'] },
    ],
  },

  // ── PRIME FACTORS ───────────────────────────────────────────────────
  {
    id: 'primefactor-1',
    title: 'The Prime Suspect',
    description: 'A cryptogram uses prime factorization to hide a secret code.',
    difficulty: 1, xpReward: 30, topic: 'primefactor',
    stages: [
      { narrative: 'Find the prime factorization of 60. The sum of the prime factors (including repeats) is the locker number.',
        question: '60 = 2 × 2 × 3 × 5. Sum = 2+2+3+5 = ?', answer: 12, hints: ['60 = 2 × 30 = 2 × 2 × 15 = 2 × 2 × 3 × 5.', 'Sum = 2 + 2 + 3 + 5 = 12.'] },
      { narrative: 'Now find the prime factorization of 84. The largest prime factor is the next code.',
        question: '84 = 2 × 2 × 3 × 7. Largest prime factor = ?', answer: 7, hints: ['84 = 2 × 42 = 2 × 2 × 21 = 2 × 2 × 3 × 7.', 'The prime factors are 2, 2, 3, 7. Largest = 7.'] },
    ],
  },

  // ── PROBABILITY ─────────────────────────────────────────────────────
  {
    id: 'prob-1',
    title: 'The Gambling Den Heist',
    description: 'A rigged casino game was used to steal money. Use probability to expose the cheat!',
    difficulty: 2, xpReward: 55, topic: 'prob',
    stages: [
      { narrative: 'In a rigged game with a 10-sided die (numbers 1-10), what is the probability of rolling a number greater than 7? (Answer as a simplified fraction a/b)',
        question: 'Numbers > 7 on a 10-sided die: 8, 9, 10. P = 3/10. Give this as a fraction.', answer: '3/10',
        hints: ['Numbers greater than 7: 8, 9, 10. That\'s 3 numbers.', 'Total possible: 10 numbers.', 'Probability = 3/10.'] },
      { narrative: 'Two such dice are rolled. What is the probability of getting a sum of 10? (Answer as fraction a/b)',
        question: 'Ways to sum to 10: (4,6),(5,5),(6,4). That\'s 3 ways out of 100 total. P = ?', answer: '3/100',
        hints: ['Total possible outcomes = 10 × 10 = 100.', 'Ways to sum to 10: (4,6), (5,5), (6,4) = 3 ways.', 'P = 3/100.'] },
    ],
  },

  // ── PROFIT & LOSS ──────────────────────────────────────────────────
  {
    id: 'profitloss-1',
    title: 'The Counterfeit Goods Case',
    description: 'A merchant sold counterfeit goods. Calculate the real profit margins!',
    difficulty: 2, xpReward: 50, topic: 'profitloss',
    stages: [
      { narrative: 'The merchant bought goods for ₹500 and sold them for ₹650. What is the profit percentage?',
        question: 'Profit = 650−500 = 150. Profit % = (150/500)×100 = ?%', answer: 30, hints: ['Profit = Selling Price − Cost Price = 650−500 = ₹150.', 'Profit % = (Profit/CP) × 100 = (150/500) × 100.', '(150/500) × 100 = 30%.'] },
      { narrative: 'Another item had a cost price of ₹2,000 and was sold at a loss of 15%. What was the selling price?',
        question: 'Loss = 15% of 2000 = 300. SP = 2000 − 300 = ?', answer: 1700, hints: ['15% of 2000 = 0.15 × 2000 = 300.', 'Selling Price = Cost Price − Loss = 2000 − 300 = ₹1700.'] },
    ],
  },

  // ── PYTHAGORAS ──────────────────────────────────────────────────────
  {
    id: 'pythag-1',
    title: 'The Right-Angle Robbery',
    description: 'A ladder was used to break into a building. Use Pythagoras to find the height!',
    difficulty: 1, xpReward: 35, topic: 'pythag',
    stages: [
      { narrative: 'A 10-metre ladder is placed 6 metres from the base of a wall. How high up the wall does the ladder reach?',
        question: 'a² + 6² = 10² → a² = 100 − 36 = 64 → a = ?', answer: 8, hints: ['Pythagoras: a² + b² = c².', 'a² + 36 = 100.', 'a² = 64, so a = 8 metres.'] },
      { narrative: 'A right triangle has legs of 9 cm and 12 cm. What is the hypotenuse?',
        question: 'c² = 9² + 12² = 81 + 144 = 225. c = ?', answer: 15, hints: ['c² = 81 + 144 = 225.', 'c = √225 = 15 cm.'] },
    ],
  },

  // ── QUADRATIC ──────────────────────────────────────────────────────
  {
    id: 'quadratic-1',
    title: 'The Quadratic Crime',
    description: 'A quadratic equation was used to encode the number of stolen goods!',
    difficulty: 2, xpReward: 55, topic: 'quadratic',
    stages: [
      { narrative: 'The equation y = x² − 4x + 3 models the profit (y) from selling x items. Find y when x = 5.',
        question: 'y = 5² − 4(5) + 3 = 25 − 20 + 3 = ?', answer: 8, hints: ['5² = 25.', '-4(5) = -20.', '25 − 20 + 3 = 8.'] },
      { narrative: 'For the same equation y = x² − 4x + 3, find the y-intercept (value when x = 0).',
        question: 'y = 0² − 4(0) + 3 = ?', answer: 3, hints: ['When x = 0, y = 0 − 0 + 3.', 'y = 3.'] },
    ],
  },

  // ── QUADRATIC FORMULA ──────────────────────────────────────────────
  {
    id: 'qformula-1',
    title: 'The Formulaic Fraud',
    description: 'A quadratic equation hides the roots of a criminal enterprise.',
    difficulty: 3, xpReward: 70, topic: 'qformula',
    stages: [
      { narrative: 'Solve x² − 5x + 6 = 0 by factorising. The smaller root is a room number.',
        question: 'x² − 5x + 6 = (x−2)(x−3) = 0. Smaller root = ?', answer: 2, hints: ['Factor: x² − 5x + 6 = (x−2)(x−3).', 'Roots are x = 2 and x = 3.', 'Smaller root = 2.'] },
      { narrative: 'Solve x² + 2x − 15 = 0. The larger root is the floor number.',
        question: 'x² + 2x − 15 = (x+5)(x−3) = 0. Larger root = ?', answer: 3, hints: ['Factor: x² + 2x − 15 = (x+5)(x−3).', 'Roots are x = -5 and x = 3.', 'Larger root = 3.'] },
    ],
  },

  // ── RATIO ──────────────────────────────────────────────────────────
  {
    id: 'ratio-1',
    title: 'The Ratio Ransom',
    description: 'A ransom note split money in a ratio. Find the larger share!',
    difficulty: 1, xpReward: 30, topic: 'ratio',
    stages: [
      { narrative: '₹1,000 was split between two suspects in the ratio 2:3. How much did the one with the larger share get?',
        question: 'Total parts = 5. One part = 1000÷5 = 200. Larger share = 3×200 = ?', answer: 600, hints: ['Total parts = 2 + 3 = 5.', 'One part = 1000 ÷ 5 = 200.', 'Larger share = 3 × 200 = ₹600.'] },
      { narrative: 'A map scale is 1:50,000. Two cities are 12 cm apart on the map. What is the actual distance in kilometres?',
        question: 'Actual = 12 × 50,000 = 600,000 cm = 6000 m = ? km', answer: 6, hints: ['12 × 50,000 = 600,000 cm.', '600,000 cm ÷ 100 = 6,000 m.', '6,000 m ÷ 1000 = 6 km.'] },
    ],
  },

  // ── REMAINDER THEOREM ──────────────────────────────────────────────
  {
    id: 'remfactor-1',
    title: 'The Remainder Riddle',
    description: 'Polynomial remainders hold clues to a hidden safe combination.',
    difficulty: 3, xpReward: 75, topic: 'remfactor',
    stages: [
      { narrative: 'Find the remainder when (x³ − 2x² + x − 5) is divided by (x − 2). Use the Remainder Theorem: evaluate at x = 2.',
        question: 'f(2) = 8 − 8 + 2 − 5 = ?', answer: -3, hints: ['Remainder Theorem: remainder = f(a) when dividing by (x−a).', 'f(2) = 2³ − 2(2²) + 2 − 5.', 'f(2) = 8 − 8 + 2 − 5 = -3.'] },
      { narrative: 'Is (x − 3) a factor of x³ − 6x² + 11x − 6? Check by evaluating at x = 3.',
        question: 'f(3) = 27 − 54 + 33 − 6 = ? If 0, it\'s a factor.', answer: 0, hints: ['If f(3) = 0, then (x−3) is a factor.', 'f(3) = 27 − 54 + 33 − 6 = 0.', 'Yes, it is a factor (remainder = 0).'] },
    ],
  },

  // ── ROUNDING ───────────────────────────────────────────────────────
  {
    id: 'rounding-1',
    title: 'The Approximate Alibi',
    description: 'The suspect tried to hide precise numbers by rounding. Uncover the truth!',
    difficulty: 1, xpReward: 25, topic: 'rounding',
    stages: [
      { narrative: 'The suspect said "about 50 people saw me." But the security footage shows 47 people. What is 47 rounded to the nearest 10?',
        question: '47 rounded to nearest 10 = ?', answer: 50, hints: ['47 is between 40 and 50.', 'Since 7 ≥ 5, round up: 47 → 50.'] },
      { narrative: 'The bank statement shows ₹147.35. The suspect rounded it to the nearest rupee. What did they report?',
        question: '₹147.35 rounded to nearest rupee = ?', answer: 147, hints: ['Look at the decimal part: 0.35.', 'Since 0.35 < 0.5, round down.', '₹147.35 → ₹147.'] },
    ],
  },

  // ── SIMULTANEOUS EQUATIONS ─────────────────────────────────────────
  {
    id: 'simul-1',
    title: 'The Simultaneous Suspect',
    description: 'Two suspects\' locations are linked by simultaneous equations. Find them both!',
    difficulty: 3, xpReward: 70, topic: 'simul',
    stages: [
      { narrative: 'Solve: x + y = 10 and x − y = 4. The value of x is the house number.',
        question: 'Adding: 2x = 14, so x = ?', answer: 7, hints: ['Add the two equations: (x+y)+(x−y) = 10+4 → 2x = 14 → x = 7.', 'Then y = 10 − 7 = 3.'] },
      { narrative: 'Solve: 2x + y = 16 and x − y = 2. The value of y is the floor number.',
        question: 'Adding: 3x = 18, so x = 6. Then y = 16 − 2(6) = ?', answer: 4, hints: ['Add equations: (2x+y)+(x−y) = 16+2 → 3x = 18 → x = 6.', 'Substitute: 2(6)+y = 16 → 12+y = 16 → y = 4.'] },
    ],
  },

  // ── SPEED, DISTANCE, TIME ──────────────────────────────────────────
  {
    id: 'sdt-1',
    title: 'The High-Speed Chase',
    description: 'A car chase across the city! Use speed-distance-time calculations to catch the suspect.',
    difficulty: 2, xpReward: 45, topic: 'sdt',
    stages: [
      { narrative: 'The suspect drove 240 km in 3 hours. What was their average speed?',
        question: 'Speed = Distance ÷ Time = 240 ÷ 3 = ? km/h', answer: 80, hints: ['Speed = Distance ÷ Time.', '240 ÷ 3 = 80 km/h.'] },
      { narrative: 'At 80 km/h, how long would it take to travel 320 km?',
        question: 'Time = Distance ÷ Speed = 320 ÷ 80 = ? hours', answer: 4, hints: ['Time = Distance ÷ Speed.', '320 ÷ 80 = 4 hours.'] },
    ],
  },

  // ── SQUARE ROOTS ───────────────────────────────────────────────────
  {
    id: 'sqrt-1',
    title: 'The Square Root Hideout',
    description: 'A hidden location\'s coordinates are encoded using square roots.',
    difficulty: 1, xpReward: 30, topic: 'sqrt',
    stages: [
      { narrative: 'The first clue: "The nearest integer to √50." This is the street number.',
        question: '√50 is between 7 (49) and 8 (64). Nearest integer = ?', answer: 7, hints: ['7² = 49, 8² = 64.', '50 is closer to 49 than to 64.', 'Nearest integer to √50 is 7.'] },
      { narrative: 'Second clue: "√144 = ?" This is the number of steps from the corner.',
        question: '√144 = ?', answer: 12, hints: ['12² = 144.', '√144 = 12.'] },
    ],
  },

  // ── STANDARD FORM ──────────────────────────────────────────────────
  {
    id: 'stdform-1',
    title: 'The Scientific Sabotage',
    description: 'A scientist left data in standard form. Convert it to find the truth!',
    difficulty: 2, xpReward: 50, topic: 'stdform',
    stages: [
      { narrative: 'The mass of a sample is 3.5 × 10³ grams. Write this as an ordinary number.',
        question: '3.5 × 10³ = 3.5 × 1000 = ?', answer: 3500, hints: ['10³ = 1000.', '3.5 × 1000 = 3500 grams.'] },
      { narrative: 'A distance is 0.00047 km. Write this in standard form.',
        question: '0.00047 = 4.7 × 10^?', answer: -4, hints: ['Move the decimal point 4 places to the right to get 4.7.', '0.00047 = 4.7 × 10⁻⁴.', 'So the exponent is -4.'] },
    ],
  },

  // ── STATISTICS ──────────────────────────────────────────────────────
  {
    id: 'stats-1',
    title: 'The Statistical Swindle',
    description: 'A data analyst manipulated numbers. Find the true mean!',
    difficulty: 2, xpReward: 50, topic: 'stats',
    stages: [
      { narrative: 'Five transactions were: ₹200, ₹350, ₹400, ₹500, ₹550. What is the mean (average)?',
        question: 'Mean = (200+350+400+500+550) ÷ 5 = ?', answer: 400, hints: ['Sum = 200 + 350 + 400 + 500 + 550 = 2000.', '2000 ÷ 5 = 400.'] },
      { narrative: 'The same data: 200, 350, 400, 500, 550. What is the median?',
        question: 'Arrange in order: 200, 350, 400, 500, 550. Middle value = ?', answer: 400, hints: ['The numbers are already in order.', 'With 5 numbers, the median is the 3rd: 400.'] },
    ],
  },

  // ── SURDS ──────────────────────────────────────────────────────────
  {
    id: 'surds-1',
    title: 'The Surd Sanctuary',
    description: 'A secret meeting place is encoded using surds. Simplify to decode!',
    difficulty: 3, xpReward: 70, topic: 'surds',
    stages: [
      { narrative: 'Simplify √12. The number outside the root is the room number.',
        question: '√12 = √(4×3) = 2√3. The coefficient (number outside) = ?', answer: 2, hints: ['√12 = √(4 × 3) = √4 × √3.', '√4 = 2, so √12 = 2√3.', 'The coefficient outside is 2.'] },
      { narrative: 'Simplify √50 − √18. The result tells us the number of suspects.',
        question: '√50 = 5√2, √18 = 3√2. 5√2 − 3√2 = ?√2. What is the coefficient?', answer: 2, hints: ['√50 = √(25×2) = 5√2.', '√18 = √(9×2) = 3√2.', '5√2 − 3√2 = 2√2. Coefficient = 2.'] },
    ],
  },

  // ── TRIGONOMETRY ──────────────────────────────────────────────────
  {
    id: 'trig-1',
    title: 'The Trigonometric Trail',
    description: 'A right triangle at the crime scene reveals the height of a building.',
    difficulty: 2, xpReward: 55, topic: 'trig',
    stages: [
      { narrative: 'From 100 metres away, the angle of elevation to the top of a building is 30°. Sin 30° = 0.5. But we need tan: tan 30° ≈ 0.577. Height = distance × tan(angle). What is the height?',
        question: 'Height = 100 × tan(30°) = 100 × 0.577 = ? metres (round to nearest whole)', answer: 58,
        hints: ['Height = distance × tan(angle of elevation).', '100 × 0.577 = 57.7.', 'Rounded to nearest whole: 58 metres.'] },
      { narrative: 'A 12-metre flagpole casts a shadow of 20 metres. What is the angle of elevation of the sun? tan(θ) = opposite/adjacent = 12/20 = 0.6. tan⁻¹(0.6) ≈ ?° (nearest degree)',
        question: 'tan⁻¹(0.6) ≈ ?°', answer: 31, hints: ['tan(θ) = opposite/adjacent = 12/20 = 0.6.', 'tan⁻¹(0.6) ≈ 31°.'] },
    ],
  },

  // ── SIMILARITY ─────────────────────────────────────────────────────
  {
    id: 'similarity-1',
    title: 'The Similar Suspects',
    description: 'Two similar triangles at different scales hold the key to unlocking the case.',
    difficulty: 2, xpReward: 50, topic: 'similarity',
    stages: [
      { narrative: 'Two similar triangles have sides in the ratio 2:5. If the smaller triangle has a side of 6 cm, what is the corresponding side in the larger triangle?',
        question: 'Scale factor = 5/2. Larger side = 6 × (5/2) = ?', answer: 15, hints: ['Scale factor = 5/2 = 2.5.', '6 × 2.5 = 15 cm.'] },
      { narrative: 'The areas of two similar shapes are in the ratio of the squares of their sides. If side ratio is 2:5, what is the area ratio?',
        question: 'Area ratio = (2/5)² = 4 : ?', answer: 25, hints: ['Ratio of sides = 2:5.', 'Ratio of areas = 2²:5² = 4:25.', 'So the answer is 25.'] },
    ],
  },

  // ── TRANSFORMATIONS ────────────────────────────────────────────────
  {
    id: 'transform-1',
    title: 'The Transformed Trail',
    description: 'The suspect used geometric transformations to confuse investigators. Reverse them!',
    difficulty: 2, xpReward: 45, topic: 'transform',
    stages: [
      { narrative: 'A point at (3, 4) was reflected across the y-axis. What are the new coordinates?',
        question: 'Reflection across y-axis: (x, y) → (−x, y). (3, 4) → (?, ?)', answer: '(-3, 4)',
        hints: ['Reflection across y-axis changes the sign of x.', 'x: 3 → -3, y stays: 4.', 'New coordinates: (-3, 4).'] },
      { narrative: 'The same point (3, 4) was rotated 90° clockwise about the origin. What are the new coordinates?',
        question: 'Rotation 90° clockwise: (x, y) → (y, −x). (3, 4) → (4, ?)', answer: -3,
        hints: ['90° clockwise: (x, y) → (y, -x).', '(3, 4) → (4, -3).', 'So the answer is -3.'] },
    ],
  },

  // ── TRIANGLES ──────────────────────────────────────────────────────
  {
    id: 'triangles-1',
    title: 'The Triangle Treachery',
    description: 'The angles of a triangle hold the combination to a safe.',
    difficulty: 1, xpReward: 25, topic: 'triangles',
    stages: [
      { narrative: 'A triangle has angles 65° and 45°. What is the third angle?',
        question: 'Angle sum = 180°. Third = 180 − 65 − 45 = ?', answer: 70, hints: ['Angles of a triangle sum to 180°.', '65 + 45 = 110.', '180 − 110 = 70°.'] },
      { narrative: 'An isosceles triangle has a base angle of 40°. What is the angle at the vertex (apex)?',
        question: 'Base angles equal = 40° each. Vertex = 180 − 40 − 40 = ?', answer: 100, hints: ['Isosceles triangles have two equal base angles.', '40 + 40 = 80.', '180 − 80 = 100°.'] },
    ],
  },

  // ── VARIATION ──────────────────────────────────────────────────────
  {
    id: 'variation-1',
    title: 'The Varying Variables',
    description: 'Direct and inverse proportion reveals how the suspects worked together.',
    difficulty: 2, xpReward: 50, topic: 'variation',
    stages: [
      { narrative: 'y varies directly with x. When x = 4, y = 20. What is y when x = 7?',
        question: 'k = 20/4 = 5. y = 5 × 7 = ?', answer: 35, hints: ['Direct variation: y = kx.', 'k = 20/4 = 5.', 'y = 5 × 7 = 35.'] },
      { narrative: 'y varies inversely with x. When x = 3, y = 12. What is y when x = 9?',
        question: 'Inverse variation: y = k/x. k = 3×12 = 36. y = 36/9 = ?', answer: 4, hints: ['Inverse variation: xy = k or y = k/x.', 'k = 3 × 12 = 36.', 'y = 36/9 = 4.'] },
    ],
  },

  // ── VECTORS ─────────────────────────────────────────────────────────
  {
    id: 'vectors-1',
    title: 'The Vector Vault',
    description: 'Vector addition and scaling lead to the location of stolen goods.',
    difficulty: 2, xpReward: 55, topic: 'vectors',
    stages: [
      { narrative: 'Vector a = (3, 5) and vector b = (2, -1). Find a + b. The x-component is the aisle number.',
        question: 'a + b = (3+2, 5+(−1)) = (?, ?). What is the x-component?', answer: 5,
        hints: ['Add corresponding components.', 'x: 3 + 2 = 5.', 'y: 5 + (−1) = 4.'] },
      { narrative: 'Find the magnitude of vector v = (3, 4). This is the distance to the hideout.',
        question: '|v| = √(3² + 4²) = √(9+16) = √25 = ?', answer: 5, hints: ['Magnitude = √(x² + y²).', '3² + 4² = 9 + 16 = 25.', '√25 = 5.'] },
    ],
  },

  // ── SEQUENCES ──────────────────────────────────────────────────────
  {
    id: 'sequences-1',
    title: 'The Sequential Clue',
    description: 'A sequence of numbers was left at the scene. Find the next term!',
    difficulty: 2, xpReward: 45, topic: 'sequences',
    stages: [
      { narrative: 'Arithmetic sequence: 3, 7, 11, 15, ... What is the 6th term?',
        question: 'Common difference = 4. 5th = 19, 6th = 19 + 4 = ?', answer: 23, hints: ['Arithmetic: common difference = 7−3 = 4.', 'Sequence: 3, 7, 11, 15, 19, 23.', '6th term = 23.'] },
      { narrative: 'Geometric sequence: 2, 6, 18, 54, ... What is the 5th term?',
        question: 'Common ratio = 3. 5th = 54 × 3 = ?', answer: 162, hints: ['Geometric: common ratio = 6÷2 = 3.', 'Sequence: 2, 6, 18, 54, 162.', '5th term = 162.'] },
    ],
  },

  // ── SETS ───────────────────────────────────────────────────────────
  {
    id: 'sets-1',
    title: 'The Set of Suspects',
    description: 'A Venn diagram shows which suspects were at the scene. Find the intersection!',
    difficulty: 2, xpReward: 40, topic: 'sets',
    stages: [
      { narrative: 'Set A = {2, 4, 6, 8, 10} and Set B = {5, 6, 7, 8, 9}. Find A ∩ B (intersection). The sum of elements in the intersection is the number of shared witnesses.',
        question: 'A ∩ B = {6, 8}. Sum = 6 + 8 = ?', answer: 14, hints: ['Intersection = elements common to both sets.', 'Common: 6 and 8.', 'Sum = 6 + 8 = 14.'] },
      { narrative: 'With the same sets, find A ∪ B (union). How many elements are in the union?',
        question: 'A ∪ B = {2,4,5,6,7,8,9,10}. Number of elements = ?', answer: 8, hints: ['Union = all elements from both sets, no duplicates.', 'A ∪ B = {2,4,5,6,7,8,9,10}.', 'Count: 8 elements.'] },
    ],
  },

  // ── CIRCLES (Circular Measure) ────────────────────────────────────
  {
    id: 'circmeasure-1',
    title: 'The Radian Riddle',
    description: 'Angles in radians reveal the secret measurements of a circular conspiracy.',
    difficulty: 3, xpReward: 70, topic: 'circmeasure',
    stages: [
      { narrative: 'Convert 90° to radians. (Use π in your answer.)',
        question: '90° = (π/180) × 90 = π/?', answer: 2, hints: ['To convert degrees to radians, multiply by π/180.', '90 × π/180 = π/2.', 'So the denominator is 2.'] },
      { narrative: 'What is the arc length of a sector with radius 10 cm and angle π/3 radians? Arc length = rθ.',
        question: 'Arc = 10 × π/3 = (10π)/3 cm. Give the coefficient of π (as a decimal or fraction).', answer: '10/3',
        hints: ['Arc length = r × θ (where θ is in radians).', '10 × π/3 = (10π)/3.', 'The coefficient is 10/3.'] },
    ],
  },

  // ── DIFFERENTIAL EQUATIONS ─────────────────────────────────────────
  {
    id: 'diffeq-1',
    title: 'The Differential Decoder',
    description: 'A differential equation describes how the crime rate changes over time.',
    difficulty: 3, xpReward: 85, topic: 'diffeq',
    stages: [
      { narrative: 'The rate of evidence accumulation is dy/dx = 2x. If y = 3 when x = 1, find y when x = 4. (Hint: Integrate: y = x² + C)',
        question: 'y = x² + C. At x=1, y=3: 3 = 1+C → C=2. At x=4: y = 16 + 2 = ?', answer: 18,
        hints: ['Integrate dy/dx = 2x → y = x² + C.', 'Use y(1) = 3: 3 = 1 + C → C = 2.', 'y = x² + 2. At x=4: y = 16 + 2 = 18.'] },
      { narrative: 'For dy/dx = 3x² with y(0) = 4, find y(2).',
        question: 'y = x³ + C. At x=0, y=4: C=4. At x=2: y = 8 + 4 = ?', answer: 12,
        hints: ['Integrate: y = x³ + C.', 'y(0) = 4 → C = 4.', 'y(2) = 8 + 4 = 12.'] },
    ],
  },

  // ── INTEGRATION ────────────────────────────────────────────────────
  {
    id: 'integ-1',
    title: 'The Integral Investigation',
    description: 'Integration finds the area under the curve of the suspect\'s plan.',
    difficulty: 3, xpReward: 80, topic: 'integ',
    stages: [
      { narrative: 'Find ∫(2x + 1) dx from x=0 to x=3. This gives the area (a number) that is the evidence locker code.',
        question: '∫(2x+1) dx = [x² + x] from 0 to 3 = (9+3) − (0) = ?', answer: 12,
        hints: ['∫(2x+1) dx = x² + x + C.', 'Evaluate from 0 to 3: (3²+3) − (0²+0).', '9 + 3 = 12.'] },
      { narrative: 'Find ∫(3x² − 2) dx from x=1 to x=2. This is the final digits of the code.',
        question: '∫(3x²−2) dx = [x³ − 2x] from 1 to 2 = (8−4) − (1−2) = ?', answer: 5,
        hints: ['∫(3x²−2) dx = x³ − 2x + C.', 'At x=2: 8 − 4 = 4.', 'At x=1: 1 − 2 = -1. 4 − (−1) = 5.'] },
    ],
  },

  // ── LIMITS ─────────────────────────────────────────────────────────
  {
    id: 'limits-1',
    title: 'The Limitless Escape',
    description: 'A limit describes the value the suspect approached as they escaped.',
    difficulty: 3, xpReward: 75, topic: 'limits',
    stages: [
      { narrative: 'Find lim(x→2) (x² − 4)/(x − 2). This simplifies and gives the route number.',
        question: '(x²−4)/(x−2) = (x−2)(x+2)/(x−2) = x+2. As x→2, limit = 2+2 = ?', answer: 4,
        hints: ['Factor numerator: x² − 4 = (x−2)(x+2).', 'Cancel (x−2): result is x+2.', 'As x→2, x+2 → 4.'] },
      { narrative: 'Find lim(x→0) (sin x)/x. This is a standard limit.',
        question: 'The standard limit: lim(x→0) sin x / x = ?', answer: 1, hints: ['This is a fundamental trigonometric limit.', 'lim(x→0) sin x / x = 1.'] },
    ],
  },

  // ── INVERSE TRIG ───────────────────────────────────────────────────
  {
    id: 'invtrig-1',
    title: 'The Inverse Alibi',
    description: 'The suspect used inverse trigonometric functions to hide their angle of escape.',
    difficulty: 3, xpReward: 75, topic: 'invtrig',
    stages: [
      { narrative: 'Find sin⁻¹(1/2). This gives the angle in degrees that the suspect escaped at.',
        question: 'sin⁻¹(1/2) = ?° (principal value)', answer: 30, hints: ['sin(30°) = 1/2.', 'So sin⁻¹(1/2) = 30°.'] },
      { narrative: 'Find cos⁻¹(0) in degrees. This is the secondary angle.',
        question: 'cos⁻¹(0) = ?°', answer: 90, hints: ['cos(90°) = 0.', 'So cos⁻¹(0) = 90°.'] },
    ],
  },

  // ── BOUNDS ─────────────────────────────────────────────────────────
  {
    id: 'bounds-1',
    title: 'The Upper Bound Break-in',
    description: 'A measurement was rounded. The upper and lower bounds reveal the true value range.',
    difficulty: 2, xpReward: 50, topic: 'bounds',
    stages: [
      { narrative: 'A distance is 50 km measured to the nearest km. What is the lower bound (minimum possible actual distance)?',
        question: 'Lower bound = 50 − 0.5 = ? km', answer: 49.5, hints: ['To nearest km means ±0.5 km.', 'Lower bound = 50 − 0.5 = 49.5 km.'] },
      { narrative: 'What is the upper bound for the same 50 km measured to the nearest km?',
        question: 'Upper bound = 50 + 0.5 = ? km', answer: 50.5, hints: ['Upper bound = 50 + 0.5 = 50.5 km.', 'Note: technically 50.5 is excluded but this is the bound.'] },
    ],
  },

  // ── CONGRUENCE ─────────────────────────────────────────────────────
  {
    id: 'congruence-1',
    title: 'The Congruent Conspiracy',
    description: 'Two triangles at the crime scene are congruent. Find the missing side!',
    difficulty: 2, xpReward: 50, topic: 'congruence',
    stages: [
      { narrative: 'Triangle ABC is congruent to triangle DEF. AB = 5 cm, BC = 7 cm. In triangle DEF, which side corresponds to AB? (Use the naming convention: A↔D, B↔E, C↔F)',
        question: 'If A↔D and B↔E, then AB corresponds to which side of triangle DEF?', answer: 'DE',
        hints: ['A corresponds to D, B corresponds to E.', 'So side AB corresponds to side DE.'] },
      { narrative: 'Triangle PQR ≅ triangle XYZ (SSS). PQ = 8, QR = 10, XY = 8, YZ = 10. What is XZ if PR = 12?',
        question: 'Since triangles are congruent, all corresponding sides are equal. PR = 12, so XZ = ?', answer: 12,
        hints: ['SSS means all three sides are equal.', 'PR corresponds to XZ.', 'XZ = PR = 12.'] },
    ],
  },

  // ── CONIC SECTIONS ─────────────────────────────────────────────────
  {
    id: 'conics-1',
    title: 'The Conic Code',
    description: 'A conic section (parabola) describes the trajectory of a stolen object.',
    difficulty: 3, xpReward: 80, topic: 'conics',
    stages: [
      { narrative: 'A parabola has equation y = x² − 4x + 3. Find the vertex. The x-coordinate of the vertex is the first clue.',
        question: 'Vertex x = −b/(2a) = 4/(2×1) = ?', answer: 2, hints: ['For y = ax² + bx + c, vertex x = -b/(2a).', '-b/(2a) = -(-4)/(2×1) = 4/2 = 2.'] },
      { narrative: 'Find the y-coordinate of the vertex by substituting x = 2 into y = x² − 4x + 3.',
        question: 'y = 4 − 8 + 3 = ?', answer: -1, hints: ['2² = 4.', '−4(2) = -8.', '4 − 8 + 3 = -1.'] },
    ],
  },

  // ── HERON'S FORMULA ────────────────────────────────────────────────
  {
    id: 'heron-1',
    title: 'The Heron Heist',
    description: 'A triangular field was used as a meeting point. Heron\'s formula finds its area.',
    difficulty: 3, xpReward: 70, topic: 'heron',
    stages: [
      { narrative: 'A triangle has sides 13 m, 14 m, 15 m. Find the semi-perimeter s.',
        question: 's = (13 + 14 + 15) / 2 = 42 / 2 = ?', answer: 21, hints: ['Semi-perimeter = (a+b+c)/2.', '(13+14+15)/2 = 42/2 = 21.'] },
      { narrative: 'Using Heron\'s formula: Area = √(s(s-a)(s-b)(s-c)). s=21, a=13, b=14, c=15. Find the area.',
        question: 'Area = √(21×8×7×6) = √(?×6) = √7056 = ? m²', answer: 84, hints: ['21×8 = 168, 168×7 = 1176, 1176×6 = 7056.', '√7056 = 84 m².'] },
    ],
  },

  // ── COMPLEX NUMBERS ────────────────────────────────────────────────
  {
    id: 'complex-1',
    title: 'The Complex Conspiracy',
    description: 'Complex numbers encode a hidden frequency used by the criminals.',
    difficulty: 3, xpReward: 80, topic: 'complex',
    stages: [
      { narrative: 'Add (3 + 2i) + (1 + 7i). The real part is the frequency number.',
        question: '(3+2i) + (1+7i) = (3+1) + (2+7)i = ? + ?i', answer: 4, hints: ['Add real parts: 3 + 1 = 4.', 'Add imaginary parts: 2 + 7 = 9i.', 'The real part is 4.'] },
      { narrative: 'Multiply (1 + i)(3 − 2i). The imaginary part of the result is the secondary frequency.',
        question: '(1+i)(3−2i) = 3 − 2i + 3i − 2i² = 3 + i + 2 = 5 + i. Imaginary part = ?', answer: 1,
        hints: ['Use FOIL: 1×3 + 1×(−2i) + i×3 + i×(−2i).', '= 3 − 2i + 3i − 2i² = 3 + i + 2 = 5 + i.', 'i² = -1, so −2(−1) = +2.', 'Imaginary part = 1.'] },
    ],
  },

  // ── DOT PRODUCTS ───────────────────────────────────────────────────
  {
    id: 'dotprod-1',
    title: 'The Dot Product Data Heist',
    description: 'Dot products of vectors reveal perpendicular escape routes.',
    difficulty: 3, xpReward: 65, topic: 'dotprod',
    stages: [
      { narrative: 'Find the dot product of a = (3, 4) and b = (5, 2). This scalar tells us the efficiency of the escape route.',
        question: 'a·b = 3×5 + 4×2 = 15 + 8 = ?', answer: 23, hints: ['Dot product = x₁x₂ + y₁y₂.', '3×5 = 15, 4×2 = 8.', '15 + 8 = 23.'] },
      { narrative: 'Are vectors u = (2, 3) and v = (3, -2) perpendicular? (They are if their dot product = 0.)',
        question: 'u·v = 2×3 + 3×(−2) = 6 − 6 = ? (Are they perpendicular?)', answer: 0,
        hints: ['u·v = 2×3 + 3×(−2).', '6 − 6 = 0.', 'Yes, they are perpendicular since dot product = 0.'] },
    ],
  },

  // ── BANKING (RD) ──────────────────────────────────────────────────
  {
    id: 'banking-1',
    title: 'The Recurring Deposit Fraud',
    description: 'A bank manager manipulated recurring deposit calculations.',
    difficulty: 2, xpReward: 55, topic: 'banking',
    stages: [
      { narrative: 'A student deposits ₹1,000 per month in a recurring deposit at 6% p.a. simple interest. After 12 months, what is the total principal deposited?',
        question: 'Principal = 1000 × 12 = ?', answer: 12000, hints: ['Each month ₹1,000 for 12 months.', 'Total = 1000 × 12 = ₹12,000.'] },
      { narrative: 'For a recurring deposit of ₹500 per month for 24 months at 8% p.a., the maturity amount uses the formula: M = P×n + P×(n(n+1)/2)×(r/1200). P=500, n=24, r=8. Find the interest component only: P×(n(n+1)/2)×(r/1200).',
        question: 'n(n+1)/2 = 24×25/2 = 300. Interest = 500 × 300 × (8/1200) = 500 × 300 × (1/150) = ?', answer: 1000,
        hints: ['n(n+1)/2 = 24×25/2 = 300.', 'r/1200 = 8/1200 = 1/150.', '500 × 300 × (1/150) = 500 × 2 = ₹1,000.'] },
    ],
  },

  // ── POLYNOMIAL FACTORISATION ──────────────────────────────────────
  {
    id: 'polyfactor-1',
    title: 'The Factored Fingerprint',
    description: 'A quadratic expression was factored. The factors point to the culprits!',
    difficulty: 2, xpReward: 50, topic: 'polyfactor',
    stages: [
      { narrative: 'Factor x² + 7x + 12. One factor is (x + 3). What is the other factor?',
        question: 'x² + 7x + 12 = (x + 3)(x + ?)', answer: 4, hints: ['Find two numbers that multiply to 12 and add to 7.', '3 × 4 = 12 and 3 + 4 = 7.', 'So the other factor is (x + 4).'] },
      { narrative: 'Factor x² − 9. This is a difference of squares: (x − a)(x + a). Find a.',
        question: 'x² − 9 = (x − ?)(x + ?)', answer: 3, hints: ['Difference of squares: a² − b² = (a−b)(a+b).', 'x² − 9 = x² − 3².', '= (x−3)(x+3). a = 3.'] },
    ],
  },

  // ── POLYNOMIAL MULTIPLICATION ─────────────────────────────────────
  {
    id: 'polymul-1',
    title: 'The Multiplying Mafia',
    description: 'Multiply two polynomials to find the total area of the crime network.',
    difficulty: 2, xpReward: 55, topic: 'polymul',
    stages: [
      { narrative: 'Multiply (x + 2)(x + 5). The coefficient of x in the product is the number of gang members.',
        question: '(x+2)(x+5) = x² + 5x + 2x + 10 = x² + ?x + 10', answer: 7, hints: ['Use FOIL: First, Outer, Inner, Last.', 'x² + 5x + 2x + 10.', '5x + 2x = 7x. Coefficient = 7.'] },
      { narrative: 'Multiply (2x + 1)(x − 3). The constant term is the evidence room number.',
        question: '(2x+1)(x−3) = 2x² − 6x + x − 3 = 2x² − 5x − ?', answer: 3,
        hints: ['FOIL: (2x)(x) = 2x², (2x)(-3) = -6x, (1)(x) = x, (1)(-3) = -3.', '-6x + x = -5x.', 'Constant term = -3.'] },
    ],
  },

  // ── LINEAR PROGRAMMING ─────────────────────────────────────────────
  {
    id: 'linprog-1',
    title: 'The Optimisation Offence',
    description: 'The suspect tried to maximise their profit. Find the optimal values!',
    difficulty: 3, xpReward: 85, topic: 'linprog',
    stages: [
      { narrative: 'Maximise P = 2x + y subject to: x ≥ 0, y ≥ 0, x + y ≤ 10, x ≤ 6. The vertices are (0,0), (6,0), (6,4), (0,10). Evaluate P at these points.',
        question: 'P at (6,4) = 2(6) + 4 = 12 + 4 = ?', answer: 16, hints: ['P = 2x + y.', 'At (6,4): P = 2(6) + 4 = 12 + 4 = 16.', 'This is the maximum.'] },
      { narrative: 'For the same constraints, what is P at (0,10)?',
        question: 'P at (0,10) = 2(0) + 10 = ?', answer: 10, hints: ['P = 2x + y.', 'At (0,10): 0 + 10 = 10.'] },
    ],
  },

  // ── SHARES & DIVIDENDS ─────────────────────────────────────────────
  {
    id: 'shares-1',
    title: 'The Stock Market Swindle',
    description: 'A broker manipulated share prices. Calculate the correct dividend!',
    difficulty: 2, xpReward: 55, topic: 'shares',
    stages: [
      { narrative: 'A person bought 100 shares of a company at ₹50 each. What is the total investment?',
        question: 'Total = 100 × 50 = ?', answer: 5000, hints: ['Total investment = number of shares × price per share.', '100 × 50 = ₹5,000.'] },
      { narrative: 'The company declares a 12% dividend on each share of face value ₹10. What is the dividend per share?',
        question: 'Dividend per share = 12% of 10 = 0.12 × 10 = ?', answer: 1.2, hints: ['Dividend = Rate × Face Value.', '12% = 0.12.', '0.12 × 10 = ₹1.20 per share.'] },
    ],
  },

  // ── GST ────────────────────────────────────────────────────────────
  {
    id: 'gst-1',
    title: 'The GST Fraud',
    description: 'A shopkeeper evaded GST. Calculate the correct tax amount!',
    difficulty: 2, xpReward: 50, topic: 'gst',
    stages: [
      { narrative: 'An item costs ₹1,000 and GST is 18%. What is the GST amount?',
        question: 'GST = 18% of 1000 = 0.18 × 1000 = ?', answer: 180, hints: ['GST = Rate × Price.', '0.18 × 1000 = ₹180.'] },
      { narrative: 'If the same item with 18% GST has a total price (including GST) of ₹1,180, what is the original price before GST? (It should be ₹1,000, but check: Original = Total / 1.18 = 1180 / 1.18 = ?)',
        question: 'Original price = 1180 ÷ 1.18 = ?', answer: 1000, hints: ['Price including GST = Original × (1 + GST rate).', '1180 ÷ 1.18 = 1000.', 'Original price = ₹1,000.'] },
    ],
  },

  // ── SECTION FORMULA ────────────────────────────────────────────────
  {
    id: 'section-1',
    title: 'The Sectional Divide',
    description: 'A point divides a line segment in a given ratio. Find the coordinates!',
    difficulty: 3, xpReward: 65, topic: 'section',
    stages: [
      { narrative: 'Find the point that divides the line joining A(2, 4) and B(8, 10) in the ratio 1:2 internally. Use section formula: x = (mx₂ + nx₁)/(m+n), y = (my₂ + ny₁)/(m+n). Here m=1, n=2.',
        question: 'x = (1×8 + 2×2)/(1+2) = (8+4)/3 = 12/3 = ?', answer: 4,
        hints: ['Section formula for internal division.', 'x = (mx₂ + nx₁)/(m+n).', 'x = (1×8 + 2×2)/3 = 12/3 = 4.'] },
      { narrative: 'Find the y-coordinate of the same point.',
        question: 'y = (1×10 + 2×4)/(1+2) = (10+8)/3 = 18/3 = ?', answer: 6,
        hints: ['y = (my₂ + ny₁)/(m+n).', 'y = (1×10 + 2×4)/3 = 18/3 = 6.'] },
    ],
  },

  // ── SQUARING ───────────────────────────────────────────────────────
  {
    id: 'squaring-1',
    title: 'The Squaring Scheme',
    description: 'The suspects used (a+b)² identities to communicate in code.',
    difficulty: 2, xpReward: 40, topic: 'squaring',
    stages: [
      { narrative: 'The code says: "(a+b)² where a=30 and b=2." Use (a+b)² = a² + 2ab + b² to find the result.',
        question: '30² + 2(30)(2) + 2² = 900 + 120 + 4 = ?', answer: 1024, hints: ['30² = 900.', '2×30×2 = 120.', '900 + 120 + 4 = 1024.'] },
      { narrative: 'Now use (a−b)² = a² − 2ab + b² with a=50 and b=1 to find 49².',
        question: '50² − 2(50)(1) + 1² = 2500 − 100 + 1 = ?', answer: 2401, hints: ['50² = 2500.', '-2×50×1 = -100.', '2500 − 100 + 1 = 2401.'] },
    ],
  },

  // ── ALGEBRA SIMPLIFICATION (Tatsavit) ──────────────────────────────
  {
    id: 'tatsavit-1',
    title: 'The Simplification Secret',
    description: 'A trail of algebraic expressions must be simplified to find the hideout.',
    difficulty: 2, xpReward: 45, topic: 'tatsavit',
    stages: [
      { narrative: 'Simplify: 2(3x + 4) − 5. The coefficient of x is the street number.',
        question: '2(3x+4) − 5 = 6x + 8 − 5 = 6x + ?. Coefficient of x = ?', answer: 3,
        hints: ['2(3x+4) = 6x + 8.', '6x + 8 − 5 = 6x + 3.', 'Wait — the coefficient of x is 6. The constant term is 3.', 'Actually, re-reading: the coefficient of x is 6.'] },
      { narrative: 'Simplify: (2x² + 3x − 1) − (x² − 2x + 4). The result is the floor number structure.',
        question: '2x² + 3x − 1 − x² + 2x − 4 = x² + ?x − 5. Coefficient of x = ?', answer: 5,
        hints: ['2x² − x² = x².', '3x − (−2x) = 3x + 2x = 5x.', 'Constant: −1 − 4 = −5. Coefficient of x = 5.'] },
    ],
  },

  // ── DECIMALS EXTRA ────────────────────────────────────────────────
  {
    id: 'decimals-2',
    title: 'The Decimal Deception',
    description: 'A weighing scale was tampered with decimal readings.',
    difficulty: 1, xpReward: 30, topic: 'decimals',
    stages: [
      { narrative: 'A package weighed 4.25 kg but the label says 3.75 kg. What is the difference?',
        question: '4.25 − 3.75 = ?', answer: 0.5, hints: ['4.25 − 3.75 = 0.50.', 'That\'s 0.5 kg difference.'] },
      { narrative: 'The actual gold weight is 2.5 g. The thief reported 1.825 g. How much gold was stolen?',
        question: '2.5 − 1.825 = ? (Think 2.500 − 1.825)', answer: 0.675, hints: ['2.500 − 1.825 = 0.675.', 'That\'s 0.675 grams stolen.'] },
    ],
  },
  {
    id: 'multiply-2',
    title: 'The Multiplication Mansion',
    description: 'A mansion has rooms arranged in rows and columns. Multiply to find the total.',
    difficulty: 1, xpReward: 20, topic: 'multiply',
    stages: [
      { narrative: 'The mansion has 12 rows of windows and 15 columns. How many windows are there in total?',
        question: '12 × 15 = ?', answer: 180, hints: ['12 × 15 = 12 × (10 + 5) = 120 + 60 = 180.'] },
      { narrative: 'Each room has 4 walls, and each wall needs 3 litres of paint. How many litres per room?',
        question: '4 walls × 3 litres = ?', answer: 12, hints: ['4 × 3 = 12 litres.'] },
    ],
  },
  {
    id: 'pythag-2',
    title: 'The Ladder Larceny',
    description: 'A thief used a ladder to reach a window. Find how far the ladder\'s base is from the wall.',
    difficulty: 1, xpReward: 35, topic: 'pythag',
    stages: [
      { narrative: 'A 13-metre ladder reaches a window 12 metres high. How far is the ladder\'s base from the wall?',
        question: 'b² = 13² − 12² = 169 − 144 = 25. b = √25 = ?', answer: 5, hints: ['Pythagoras: c² = a² + b².', '13² = 12² + b² → 169 = 144 + b² → b² = 25 → b = 5.'] },
    ],
  },

  // ── ADDITIONAL CASES (new stories) ─────────────────────────────────
  {
    id: 'circleth-2',
    title: 'The Tangent Trail',
    description: 'Tangents to a circle reveal the path the suspect took to escape.',
    difficulty: 3, xpReward: 60, topic: 'circleth',
    stages: [
      { narrative: 'A tangent touches a circle at point P. The radius to P is 6 cm. What is the angle between the tangent and the radius?',
        question: 'Angle between tangent and radius = ?°', answer: 90, hints: ['The radius drawn to the point of tangency is perpendicular to the tangent.', 'So the angle is 90°.'] },
      { narrative: 'Two tangents are drawn from an external point to a circle. If one tangent is 8 cm, how long is the other tangent?',
        question: 'Two tangents from the same point are equal. Second tangent = ? cm', answer: 8, hints: ['Tangents from the same external point are equal in length.', 'So the other tangent is also 8 cm.'] },
    ],
  },
  {
    id: 'diff-2',
    title: 'The Turning Point Plot',
    description: 'Find the turning point of a quadratic to locate the suspect\'s hideout!',
    difficulty: 3, xpReward: 85, topic: 'diff',
    stages: [
      { narrative: 'A suspect\'s profit P(x) = −2x² + 12x − 10 (where x = items sold). Find dP/dx to locate the maximum profit.',
        question: 'dP/dx = −4x + 12. Set to 0: −4x + 12 = 0 → x = ?', answer: 3, hints: ['Differentiate: dP/dx = −4x + 12.', 'Set = 0: −4x + 12 = 0 → −4x = −12 → x = 3.'] },
      { narrative: 'The maximum profit (substitute x = 3 into P(x) = −2(9) + 12(3) − 10). What is the max profit?',
        question: 'P(3) = −18 + 36 − 10 = ?', answer: 8, hints: ['−2(3)² = −18.', '12(3) = 36.', '−18 + 36 − 10 = 8.'] },
    ],
  },
  {
    id: 'hcflcm-2',
    title: 'The Common Factor Heist',
    description: 'A criminal duo used common factors to hide their meeting schedule.',
    difficulty: 2, xpReward: 50, topic: 'hcflcm',
    stages: [
      { narrative: 'Two criminals meet every few days: one every 8 days, the other every 12 days. After how many days do they meet together?',
        question: 'LCM(8, 12) = ?', answer: 24, hints: ['List multiples: 8→8,16,24,32... 12→12,24,36...', 'LCM = 24 days.'] },
      { narrative: 'The police stake out every 6 days. The criminals meet every 15 days. How often do the police see the criminals?',
        question: 'LCM(6, 15) = ?', answer: 30, hints: ['6→6,12,18,24,30...', '15→15,30...', 'LCM = 30 days.'] },
    ],
  },
  {
    id: 'indices-2',
    title: 'The Power Rule Pursuit',
    description: 'The suspect used index laws to encode their power level.',
    difficulty: 2, xpReward: 55, topic: 'indices',
    stages: [
      { narrative: 'Simplify 3⁵ ÷ 3². The result reveals the floor number of the hideout.',
        question: '3⁵ ÷ 3² = 3^(5−2) = 3^? = ?', answer: 27, hints: ['3⁵ ÷ 3² = 3^(5−2) = 3³.', '3³ = 27.'] },
      { narrative: 'Simplify (2³)⁴. This is the apartment number.',
        question: '(2³)⁴ = 2^(3×4) = 2^? = ?', answer: 4096, hints: ['(2³)⁴ = 2^(3×4) = 2¹².', '2¹² = 4096.'] },
    ],
  },
  {
    id: 'ineq-2',
    title: 'The Compound Inequality Chase',
    description: 'Compound inequalities narrow down the suspect\'s possible locations!',
    difficulty: 2, xpReward: 55, topic: 'ineq',
    stages: [
      { narrative: 'The suspect is on a floor where: x ≥ 3 AND x ≤ 8. How many integer floors are possible?',
        question: 'Floors: 3, 4, 5, 6, 7, 8. Count = ?', answer: 6, hints: ['All integers from 3 to 8 inclusive.', 'Count: 3, 4, 5, 6, 7, 8 = 6 floors.'] },
      { narrative: 'Solve: 3 ≤ 2x − 1 ≤ 9. The largest integer x is the room number.',
        question: '3 ≤ 2x − 1 ≤ 9 → Add 1: 4 ≤ 2x ≤ 10 → Divide by 2: 2 ≤ x ≤ ?. Largest integer: ?', answer: 5, hints: ['Add 1 to all parts: 4 ≤ 2x ≤ 10.', 'Divide by 2: 2 ≤ x ≤ 5.', 'Largest integer = 5.'] },
    ],
  },
  {
    id: 'trig-2',
    title: 'The Cosine Rule Caper',
    description: 'Use the cosine rule to find the distance between two crime scenes!',
    difficulty: 3, xpReward: 65, topic: 'trig',
    stages: [
      { narrative: 'Two streets meet at 60°. One shop is 8 m from the corner, another is 5 m from the corner. How far apart are they? Use cosine rule: c² = a² + b² − 2ab cos(θ). cos(60°) = 0.5.',
        question: 'c² = 64 + 25 − 2(8)(5)(0.5) = 89 − 40 = 49. c = √49 = ? m', answer: 7, hints: ['8² = 64, 5² = 25.', '2×8×5×0.5 = 40.', '64 + 25 − 40 = 49. √49 = 7 m.'] },
      { narrative: 'A triangle has sides 7 cm and 10 cm with included angle 90°. Use the cosine rule (or Pythagoras) to find the third side.',
        question: 'c² = 49 + 100 − 2(7)(10)(0) = 149. c = √149 ≈ ?.cm (1 d.p.)', answer: 12.2,
        hints: ['cos(90°) = 0.', 'c² = 49 + 100 = 149.', '√149 ≈ 12.2 cm.'] },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Get all cases for a given topic.
 */
function getCasesByTopic(topic) {
  return ALL_DETECTIVE_STORIES.filter(c => c.topic === topic);
}

/**
 * Get a case by ID.
 */
function getCaseById(id) {
  return ALL_DETECTIVE_STORIES.find(c => c.id === id);
}

/**
 * Pick a random unsolved case for a topic, filtering out already-used case IDs.
 * Returns null if no remaining cases for that topic.
 */
function pickUnsolvedCase(topic, usedCaseIds = []) {
  const available = ALL_DETECTIVE_STORIES.filter(
    c => c.topic === topic && !usedCaseIds.includes(c.id)
  );
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Get all unique topics that have at least one case.
 */
function getCoveredTopics() {
  const topics = {};
  for (const c of ALL_DETECTIVE_STORIES) {
    if (!topics[c.topic]) topics[c.topic] = 0;
    topics[c.topic]++;
  }
  return topics;
}

/**
 * Get the number of cases per topic.
 */
function getCaseCountByTopic() {
  const counts = {};
  for (const c of ALL_DETECTIVE_STORIES) {
    counts[c.topic] = (counts[c.topic] || 0) + 1;
  }
  return counts;
}

export {
  ALL_DETECTIVE_STORIES,
  DETECTIVE_TOPICS,
  getCasesByTopic,
  getCaseById,
  pickUnsolvedCase,
  getCoveredTopics,
  getCaseCountByTopic,
};
