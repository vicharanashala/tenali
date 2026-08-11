/**
 * TENALI REVERSE MIND READER — KNOWLEDGE BASE & DICTIONARY
 * ═════════════════════════════════════════════════════════
 * Stores:
 * 1. Extended Concepts (25 topics) with metadata and attributes.
 * 2. Predefined Question Library (45 items) grouped by categories.
 * 3. Dialogue Templates for random personality response selection.
 */

'use strict';

// ─── Personality Response Templates ─────────────────────────────────────────
const PERSONALITY_RESPONSES = {
  YES: [
    "Spot on! That is correct.",
    "My royal abacus agrees. Indeed, it does!",
    "Yes, you are on the right track!",
    "Indeed! The coordinates of your query align perfectly.",
    "You are getting warmer! Yes, that is true."
  ],
  NO: [
    "Alas, no.",
    "Not at all. That path leads to a numerical dead end.",
    "No, my logic says otherwise.",
    "That is incorrect. Try looking in another direction.",
    "My abacus shakes its head. No!"
  ],
  DONTKNOW: [
    "The mathematical ether is blurry on this one. I do not know.",
    "A mystery! I cannot give you a certain answer.",
    "Even my royal wisdom is stumped on this detail. I don't know.",
    "That detail is not fully clear. Let us focus on other clues!"
  ],
  HINT: [
    "A clue emerges from the ether: ",
    "Lean in, here is a secret: ",
    "My abacus whispers this clue: ",
    "A mathematical whisper for you: "
  ],
  WIN: [
    "Incredible! A brilliant victory. You successfully deciphered my secret!",
    "Outstanding! I bow to your logical deduction. You got it!",
    "A master reader of minds! You have unveiled my secret concept."
  ],
  LOSE: [
    "Aha! My secret remains safe. Better luck next time!",
    "The abacus wins today! The secret concept I had hidden was: ",
    "Alas, you ran out of resources! The secret was: "
  ]
};

// ─── Predefined Question Library ─────────────────────────────────────────────
const REVERSE_QUESTIONS = [
  // --- Category: Definition ---
  {
    id: "q_is_number",
    category: "Definition",
    text: "Is it a type of number (like prime numbers or integers)?",
    attribute: "isNumber",
    expectedValue: true
  },
  {
    id: "q_is_theorem",
    category: "Definition",
    text: "Is it a mathematical theorem (like Pythagoras' Theorem)?",
    attribute: "isTheorem",
    expectedValue: true
  },
  {
    id: "q_is_formula",
    category: "Definition",
    text: "Is it an equation or formula (like y = mx + c)?",
    attribute: "isFormula",
    expectedValue: true
  },
  {
    id: "q_is_operation",
    category: "Definition",
    text: "Is it a calculation process (like finding the HCF or LCM)?",
    attribute: "isOperation",
    expectedValue: true
  },
  {
    id: "q_is_not_operation",
    category: "Definition",
    text: "Is it a concept/idea rather than an operation?",
    attribute: "isOperation",
    expectedValue: false
  },
  {
    id: "q_is_not_number",
    category: "Definition",
    text: "Is it something other than a type of number?",
    attribute: "isNumber",
    expectedValue: false
  },

  // --- Category: Subject Category ---
  {
    id: "q_cat_geometry",
    category: "Category",
    text: "Does it belong to Geometry (shapes, lines, area)?",
    attribute: "isGeometry",
    expectedValue: true
  },
  {
    id: "q_cat_algebra",
    category: "Category",
    text: "Does it belong to Algebra (using letters like x and y)?",
    attribute: "isAlgebra",
    expectedValue: true
  },
  {
    id: "q_cat_number_theory",
    category: "Category",
    text: "Does it belong to Arithmetic/Number Theory (integers, factors)?",
    attribute: "isNumber",
    expectedValue: true
  },
  {
    id: "q_cat_not_geometry",
    category: "Category",
    text: "Is it outside the scope of Geometry?",
    attribute: "isGeometry",
    expectedValue: false
  },
  {
    id: "q_cat_not_algebra",
    category: "Category",
    text: "Is it outside the scope of Algebra?",
    attribute: "isAlgebra",
    expectedValue: false
  },

  // --- Category: Properties ---
  {
    id: "q_prop_diagrams",
    category: "Properties",
    text: "Do we usually draw a diagram or shape to show it?",
    attribute: "usesDiagram",
    expectedValue: true
  },
  {
    id: "q_prop_variables",
    category: "Properties",
    text: "Does it use variables/letters (like x and y)?",
    attribute: "containsVariables",
    expectedValue: true
  },
  {
    id: "q_prop_fractions",
    category: "Properties",
    text: "Does it use fractions, decimals, or ratios?",
    attribute: "usesFractions",
    expectedValue: true
  },
  {
    id: "q_prop_graphs",
    category: "Properties",
    text: "Does it involve coordinates, grids, or graphs?",
    attribute: "hasGraph",
    expectedValue: true
  },
  {
    id: "q_prop_calculation",
    category: "Properties",
    text: "Do we need to do calculations to find it?",
    attribute: "requiresCalculation",
    expectedValue: true
  },
  {
    id: "q_prop_no_calculation",
    category: "Properties",
    text: "Is it a qualitative concept (not requiring calculations)?",
    attribute: "requiresCalculation",
    expectedValue: false
  },
  {
    id: "q_prop_no_variables",
    category: "Properties",
    text: "Does it avoid algebraic variables?",
    attribute: "containsVariables",
    expectedValue: false
  },
  {
    id: "q_grade_elementary",
    category: "Properties",
    text: "Is it taught in primary school (Grade 5 or below)?",
    attribute: "gradeLevel",
    operator: "lte",
    expectedValue: 5
  },
  {
    id: "q_grade_middle",
    category: "Properties",
    text: "Is it taught in middle school (Grade 6 to 8)?",
    attribute: "gradeLevel",
    operator: "gte",
    expectedValue: 6
  },
  {
    id: "q_grade_high",
    category: "Properties",
    text: "Is it taught in high school (Grade 9 or above)?",
    attribute: "gradeLevel",
    operator: "gte",
    expectedValue: 9
  },

  // --- Category: Applications ---
  {
    id: "q_app_real_world",
    category: "Applications",
    text: "Does it have common real-world applications?",
    attribute: "realWorldApplication",
    expectedValue: true
  },
  {
    id: "q_app_no_real_world",
    category: "Applications",
    text: "Is it mostly theoretical or abstract math?",
    attribute: "realWorldApplication",
    expectedValue: false
  }
];

// ─── Concept Pool Dictionary (25 items) ──────────────────────────────────────
const REVERSE_CONCEPTS = [
  {
    id: "prime_number",
    name: "Prime Number",
    category: "Number Theory",
    difficulty: "easy",
    definition: "A whole number greater than 1 with exactly two positive divisors: 1 and itself.",
    examples: ["2", "3", "5", "7", "11", "13", "17"],
    attributes: {
      isGeometry: false,
      isAlgebra: false,
      isNumber: true,
      isFormula: false,
      isOperation: false,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: false,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: false,
      realWorldApplication: true,
      gradeLevel: 6
    },
    hints: {
      hint1: "It belongs to Number Theory and primes.",
      hint2: "Every positive integer greater than one is either me or can be multiplied by numbers like me."
    },
    funFact: "The number 2 is the only even prime number. All other prime numbers are odd!",
    relatedLesson: "Factors and Multiples",
    commonMistakes: "Students often think 1 is a prime number (it is not, as it only has 1 divisor) or that all odd numbers are prime (e.g. 9 is composite)."
  },
  {
    id: "hcf",
    name: "HCF (Highest Common Factor)",
    category: "Number Theory",
    difficulty: "easy",
    definition: "The largest positive integer that divides two or more integers without a remainder.",
    examples: ["HCF of 8 and 12 is 4", "HCF of 15 and 20 is 5"],
    attributes: {
      isGeometry: false,
      isAlgebra: false,
      isNumber: true,
      isFormula: false,
      isOperation: true,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: false,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: true,
      realWorldApplication: true,
      gradeLevel: 6
    },
    hints: {
      hint1: "It is an operation focused on finding common factors.",
      hint2: "It is used when dividing items into equal groups, finding the largest group size possible."
    },
    funFact: "If the HCF of two numbers is 1, they are called 'co-prime' or 'relatively prime' numbers.",
    relatedLesson: "Factors and Multiples",
    commonMistakes: "Confusing HCF with LCM. HCF divides numbers (resulting in a smaller or equal value), while LCM is a multiple (resulting in a larger or equal value)."
  },
  {
    id: "lcm",
    name: "LCM (Lowest Common Multiple)",
    category: "Number Theory",
    difficulty: "easy",
    definition: "The smallest positive integer that is a multiple of two or more integers.",
    examples: ["LCM of 4 and 6 is 12", "LCM of 3 and 5 is 15"],
    attributes: {
      isGeometry: false,
      isAlgebra: false,
      isNumber: true,
      isFormula: false,
      isOperation: true,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: false,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: true,
      realWorldApplication: true,
      gradeLevel: 6
    },
    hints: {
      hint1: "It is an operation focused on finding common multiples.",
      hint2: "It helps find common denominators when adding or subtracting fractions."
    },
    funFact: "The product of the HCF and LCM of two numbers is equal to the product of the two numbers themselves!",
    relatedLesson: "Factors and Multiples",
    commonMistakes: "Listing factors instead of multiples when looking for the LCM."
  },
  {
    id: "square_root",
    name: "Square Root",
    category: "Arithmetic",
    difficulty: "medium",
    definition: "A value that, when multiplied by itself, gives the original number.",
    examples: ["Square root of 9 is 3", "Square root of 16 is 4"],
    attributes: {
      isGeometry: false,
      isAlgebra: false,
      isNumber: true,
      isFormula: false,
      isOperation: true,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: false,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: true,
      realWorldApplication: true,
      gradeLevel: 7
    },
    hints: {
      hint1: "It is the inverse of squaring a number.",
      hint2: "Its mathematical symbol looks like a tick with a line extending over the numbers."
    },
    funFact: "The symbol for square root is called a radical!",
    relatedLesson: "Powers and Roots",
    commonMistakes: "Dividing by 2 instead of finding the square root (e.g. thinking the square root of 16 is 8 instead of 4)."
  },
  {
    id: "equivalent_fractions",
    name: "Equivalent Fractions",
    category: "Arithmetic",
    difficulty: "easy",
    definition: "Fractions that represent the same value or proportion of a whole, even if they have different numerators and denominators.",
    examples: ["1/2 is equivalent to 2/4", "3/4 is equivalent to 6/8"],
    attributes: {
      isGeometry: false,
      isAlgebra: false,
      isNumber: true,
      isFormula: false,
      isOperation: false,
      isTheorem: false,
      usesDiagram: true,
      containsVariables: false,
      usesFractions: true,
      hasGraph: false,
      requiresCalculation: false,
      realWorldApplication: true,
      gradeLevel: 4
    },
    hints: {
      hint1: "It slices something whole into fractions of identical values.",
      hint2: "You obtain them by multiplying or dividing the numerator and denominator by the same non-zero number."
    },
    funFact: "Even though the numbers look different, they represent the exact same decimal point (e.g., 0.5)!",
    relatedLesson: "Fractions Intro",
    commonMistakes: "Adding the same number to the top and bottom instead of multiplying (e.g. thinking 1/2 is equivalent to 2/3 by adding 1)."
  },
  {
    id: "percentage",
    name: "Percentage",
    category: "Arithmetic",
    difficulty: "easy",
    definition: "A relative value representing the hundredth part of any quantity (e.g., 50% = 50 out of 100).",
    examples: ["50% = 0.5", "25% = 1/4"],
    attributes: {
      isGeometry: false,
      isAlgebra: false,
      isNumber: true,
      isFormula: false,
      isOperation: false,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: false,
      usesFractions: true,
      hasGraph: false,
      requiresCalculation: false,
      realWorldApplication: true,
      gradeLevel: 5
    },
    hints: {
      hint1: "It means 'per hundred'.",
      hint2: "Its symbol contains a slash and two zeros (%)."
    },
    funFact: "Percentages are reversible! 8% of 50 is exactly the same as 50% of 8 (both are 4). Try it!",
    relatedLesson: "Fractions and Decimals",
    commonMistakes: "Forgetting that a percentage is out of 100 when doing calculations (e.g., calculating 5% of 200 as 5 * 200 instead of 0.05 * 200)."
  },
  {
    id: "linear_equation",
    name: "Linear Equation",
    category: "Algebra",
    difficulty: "medium",
    definition: "An equation between two variables that gives a straight line when plotted on a graph, with variables raised to the power of 1.",
    examples: ["y = 2x + 1", "3x - 5 = 10"],
    attributes: {
      isGeometry: false,
      isAlgebra: true,
      isNumber: false,
      isFormula: true,
      isOperation: false,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: true,
      usesFractions: false,
      hasGraph: true,
      requiresCalculation: true,
      realWorldApplication: true,
      gradeLevel: 6
    },
    hints: {
      hint1: "It is an algebraic statement where variables represent coordinates.",
      hint2: "When plotted on a grid, it forms a perfectly straight line."
    },
    funFact: "The slope-intercept form (y = mx + c) is one of the most famous linear formulas!",
    relatedLesson: "Simplifying Terms",
    commonMistakes: "Plotting curved lines or neglecting to keep variables to the first power."
  },
  {
    id: "quadratic_equation",
    name: "Quadratic Equation",
    category: "Algebra",
    difficulty: "hard",
    definition: "An equation of degree 2, typically written as ax² + bx + c = 0, representing a curved path (parabola).",
    examples: ["x² - 5x + 6 = 0", "y = 2x² + 3"],
    attributes: {
      isGeometry: false,
      isAlgebra: true,
      isNumber: false,
      isFormula: true,
      isOperation: false,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: true,
      usesFractions: false,
      hasGraph: true,
      requiresCalculation: true,
      realWorldApplication: true,
      gradeLevel: 9
    },
    hints: {
      hint1: "It is an algebraic equation of degree 2.",
      hint2: "When plotted on a graph, it curves into a U-shape called a parabola."
    },
    funFact: "Quadratic curves are found in the path of thrown balls, water fountains, and planetary orbits!",
    relatedLesson: "Factoring Quadratics",
    commonMistakes: "Assuming there is always only one solution (quadratics usually have two solutions or roots)."
  },
  {
    id: "matrix",
    name: "Matrix",
    category: "Algebra",
    difficulty: "hard",
    definition: "A rectangular array of numbers arranged in rows and columns, used to represent linear transformations.",
    examples: ["[[1, 2], [3, 4]]", "A 2x3 grid of numbers"],
    attributes: {
      isGeometry: false,
      isAlgebra: true,
      isNumber: false,
      isFormula: false,
      isOperation: false,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: false,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: true,
      realWorldApplication: true,
      gradeLevel: 10
    },
    hints: {
      hint1: "It arranges numbers in rows and columns.",
      hint2: "It is widely used in 3D computer graphics to calculate rotations and scaling."
    },
    funFact: "The word 'Matrix' comes from the Latin word for 'womb', and is also the name of a famous sci-fi movie!",
    relatedLesson: "Matrix Operations Practice",
    commonMistakes: "Multiplying matrices element-by-element instead of doing row-by-column multiplication."
  },
  {
    id: "vector",
    name: "Vector",
    category: "Geometry",
    difficulty: "hard",
    definition: "A quantity having direction as well as magnitude, especially as determining the position of one point in space relative to another.",
    examples: ["Moving 3 steps right and 4 steps up: [3, 4]", "Velocity vector showing speed and direction"],
    attributes: {
      isGeometry: true,
      isAlgebra: false,
      isNumber: false,
      isFormula: false,
      isOperation: false,
      isTheorem: false,
      usesDiagram: true,
      containsVariables: false,
      usesFractions: false,
      hasGraph: true,
      requiresCalculation: true,
      realWorldApplication: true,
      gradeLevel: 8
    },
    hints: {
      hint1: "It has both direction and magnitude (length).",
      hint2: "Usually drawn as an arrow pointing from a starting point to an ending point."
    },
    funFact: "In physics, force and acceleration are represented as vectors!",
    relatedLesson: "Coordinate Geometry",
    commonMistakes: "Thinking vectors only represent coordinates, forgetting they carry a direction arrow."
  },
  {
    id: "right_triangle",
    name: "Right Triangle",
    category: "Geometry",
    difficulty: "medium",
    definition: "A triangle in which one angle is a right angle (exactly 90 degrees).",
    examples: ["A triangle with angles 90, 45, and 45 degrees", "A 3-4-5 sided triangle"],
    attributes: {
      isGeometry: true,
      isAlgebra: false,
      isNumber: false,
      isFormula: false,
      isOperation: false,
      isTheorem: false,
      usesDiagram: true,
      containsVariables: false,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: false,
      realWorldApplication: true,
      gradeLevel: 5
    },
    hints: {
      hint1: "A three-sided polygon.",
      hint2: "It contains exactly one corner forming a perfect L-shape (90 degrees)."
    },
    funFact: "A right triangle's longest side is always called the hypotenuse!",
    relatedLesson: "Triangles Classification",
    commonMistakes: "Assuming all right triangles have equal side lengths (they can be scalene or isosceles)."
  },
  {
    id: "pythagoras_theorem",
    name: "Pythagoras' Theorem",
    category: "Geometry",
    difficulty: "medium",
    definition: "The theorem stating that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides (a² + b² = c²).",
    examples: ["3² + 4² = 5²", "In a right triangle with sides 6 and 8, hypotenuse is 10"],
    attributes: {
      isGeometry: true,
      isAlgebra: false,
      isNumber: false,
      isFormula: true,
      isOperation: false,
      isTheorem: true,
      usesDiagram: true,
      containsVariables: true,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: true,
      realWorldApplication: true,
      gradeLevel: 8
    },
    hints: {
      hint1: "A famous theorem about right-angled triangles.",
      hint2: "It relates the lengths of the three sides using the equation: a² + b² = c²."
    },
    funFact: "Though named after the Greek mathematician Pythagoras, ancient Babylonians and Indians knew this rule centuries earlier!",
    relatedLesson: "Right Triangle",
    commonMistakes: "Adding side lengths directly instead of squaring them first (e.g. thinking 3 + 4 = 5)."
  },
  {
    id: "venn_diagram",
    name: "Venn Diagram",
    category: "Logic",
    difficulty: "medium",
    definition: "A diagram that shows all possible logical relations between a finite collection of different sets, typically using overlapping circles.",
    examples: ["Overlapping circles showing prime numbers and odd numbers", "Sorting animals into mammals and flying creatures"],
    attributes: {
      isGeometry: false,
      isAlgebra: true,
      isNumber: false,
      isFormula: false,
      isOperation: false,
      isTheorem: false,
      usesDiagram: true,
      containsVariables: false,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: false,
      realWorldApplication: true,
      gradeLevel: 5
    },
    hints: {
      hint1: "It visualizes groups or sets.",
      hint2: "It uses overlapping circles to show similarities and differences."
    },
    funFact: "Invented by John Venn in 1880, these diagrams are widely used in logic, statistics, and business sorting!",
    relatedLesson: "Sets Intro",
    commonMistakes: "Forgetting to place items in the overlapping center box when they belong to both categories."
  },
  {
    id: "mean",
    name: "Mean",
    category: "Statistics",
    difficulty: "easy",
    definition: "The average of a set of numbers, calculated by summing all values and dividing by the total count of values.",
    examples: ["Mean of 2, 4, 6 is (2+4+6)/3 = 4", "Mean of 10 and 20 is 15"],
    attributes: {
      isGeometry: false,
      isAlgebra: false,
      isNumber: true,
      isFormula: false,
      isOperation: true,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: false,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: true,
      realWorldApplication: true,
      gradeLevel: 5
    },
    hints: {
      hint1: "It represents a statistical average.",
      hint2: "You find it by dividing the sum of a list of numbers by how many numbers there are."
    },
    funFact: "If you have a set of numbers, the mean represents the point where they balance perfectly on a scale!",
    relatedLesson: "Basic Arithmetic",
    commonMistakes: "Confusing it with the median (middle number) or mode (most common number)."
  },
  {
    id: "probability",
    name: "Probability",
    category: "Statistics",
    difficulty: "medium",
    definition: "The branch of mathematics concerning numerical descriptions of how likely an event is to occur.",
    examples: ["Probability of rolling a 6 is 1/6", "Probability of flipping heads is 0.5 (or 50%)"],
    attributes: {
      isGeometry: false,
      isAlgebra: false,
      isNumber: true,
      isFormula: false,
      isOperation: false,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: false,
      usesFractions: true,
      hasGraph: false,
      requiresCalculation: false,
      realWorldApplication: true,
      gradeLevel: 6
    },
    hints: {
      hint1: "It measures chance and likelihood.",
      hint2: "Its values always range from 0 (impossible) to 1 or 100% (certain)."
    },
    funFact: "Probability theory was originally developed to help solve gambling problems in the 17th century!",
    relatedLesson: "Fractions and Percentages",
    commonMistakes: "Writing probability values greater than 1 or 100% (which is mathematically impossible)."
  },
  {
    id: "ratio",
    name: "Ratio",
    category: "Arithmetic",
    difficulty: "easy",
    definition: "A comparison of two quantities showing how many times one value contains another.",
    examples: ["A ratio of 2:3 boys to girls", "Mixing juice and water in a 1:4 ratio"],
    attributes: {
      isGeometry: false,
      isAlgebra: false,
      isNumber: true,
      isFormula: false,
      isOperation: false,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: false,
      usesFractions: true,
      hasGraph: false,
      requiresCalculation: false,
      realWorldApplication: true,
      gradeLevel: 5
    },
    hints: {
      hint1: "It compares two relative quantities.",
      hint2: "It uses a colon symbol (:) to separate the numbers."
    },
    funFact: "The Golden Ratio (1:1.618) is a famous ratio found in nature, shell spirals, and Greek architecture!",
    relatedLesson: "Ratio Intro",
    commonMistakes: "Confusing ratios with fractions (e.g. in a 1:2 ratio, the first part is 1/3 of the total, not 1/2)."
  },
  {
    id: "decimal",
    name: "Decimal",
    category: "Arithmetic",
    difficulty: "easy",
    definition: "A number expressed in the scale of tens, containing a decimal point to separate whole units from fractions.",
    examples: ["3.14", "0.75", "10.5"],
    attributes: {
      isGeometry: false,
      isAlgebra: false,
      isNumber: true,
      isFormula: false,
      isOperation: false,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: false,
      usesFractions: true,
      hasGraph: false,
      requiresCalculation: false,
      realWorldApplication: true,
      gradeLevel: 4
    },
    hints: {
      hint1: "A number containing a point.",
      hint2: "It represents tenths, hundredths, and thousandths."
    },
    funFact: "The word decimal comes from the Latin word 'decimus', which means tenth!",
    relatedLesson: "Fractions and Decimals",
    commonMistakes: "Aligning decimals incorrectly when adding or subtracting numbers (e.g. adding 1.2 and 0.03 as 1.5)."
  },
  {
    id: "integers",
    name: "Integers",
    category: "Arithmetic",
    difficulty: "easy",
    definition: "A whole number that can be positive, negative, or zero.",
    examples: ["-3", "0", "45", "-1000"],
    attributes: {
      isGeometry: false,
      isAlgebra: false,
      isNumber: true,
      isFormula: false,
      isOperation: false,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: false,
      usesFractions: false,
      hasGraph: true,
      requiresCalculation: false,
      realWorldApplication: true,
      gradeLevel: 5
    },
    hints: {
      hint1: "They are whole numbers.",
      hint2: "They include negative numbers, zero, and positive numbers."
    },
    funFact: "The set of all integers is often represented by the capital letter Z, which stands for 'Zahlen' (German for numbers)!",
    relatedLesson: "Basic Arithmetic",
    commonMistakes: "Believing negative numbers are not whole numbers or thinking fractions can be integers."
  },
  {
    id: "polygon",
    name: "Polygon",
    category: "Geometry",
    difficulty: "easy",
    definition: "A plane figure with at least three straight sides and angles, and typically five or more.",
    examples: ["Triangle", "Pentagon", "Hexagon", "Square"],
    attributes: {
      isGeometry: true,
      isAlgebra: false,
      isNumber: false,
      isFormula: false,
      isOperation: false,
      isTheorem: false,
      usesDiagram: true,
      containsVariables: false,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: false,
      realWorldApplication: true,
      gradeLevel: 4
    },
    hints: {
      hint1: "A flat 2D shape with straight sides.",
      hint2: "The sides cannot be curved. A circle is not one of me."
    },
    funFact: "The word polygon comes from Greek, where 'poly' means many and 'gon' means angle!",
    relatedLesson: "Triangles Classification",
    commonMistakes: "Thinking shapes with curved sides (like semi-circles) or open lines are polygons."
  },
  {
    id: "circle",
    name: "Circle",
    category: "Geometry",
    difficulty: "medium",
    definition: "A round plane figure whose boundary consists of points equidistant from a fixed center point.",
    examples: ["A coin", "A wheel", "A clock face"],
    attributes: {
      isGeometry: true,
      isAlgebra: false,
      isNumber: false,
      isFormula: false,
      isOperation: false,
      isTheorem: false,
      usesDiagram: true,
      containsVariables: false,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: false,
      realWorldApplication: true,
      gradeLevel: 4
    },
    hints: {
      hint1: "A perfectly round 2D shape.",
      hint2: "It has a diameter, a radius, and a circumference, but no corners."
    },
    funFact: "A circle has an infinite number of lines of symmetry!",
    relatedLesson: "Triangles Classification",
    commonMistakes: "Confusing radius (distance from center to edge) with diameter (distance all the way across)."
  },
  {
    id: "perimeter",
    name: "Perimeter",
    category: "Geometry",
    difficulty: "easy",
    definition: "The continuous line forming the boundary of a closed geometric figure.",
    examples: ["Perimeter of a square with side 5 is 20", "Putting a fence around a rectangular garden"],
    attributes: {
      isGeometry: true,
      isAlgebra: false,
      isNumber: true,
      isFormula: true,
      isOperation: true,
      isTheorem: false,
      usesDiagram: true,
      containsVariables: false,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: true,
      realWorldApplication: true,
      gradeLevel: 4
    },
    hints: {
      hint1: "It measures the distance around the outer boundary of a shape.",
      hint2: "You find it by adding the lengths of all the outer sides."
    },
    funFact: "The word perimeter combines the Greek 'peri' (around) and 'metron' (measure)!",
    relatedLesson: "Triangles Classification",
    commonMistakes: "Confusing perimeter (length around) with area (space inside)."
  },
  {
    id: "area",
    name: "Area",
    category: "Geometry",
    difficulty: "easy",
    definition: "The amount of space inside the boundary of a flat 2D object.",
    examples: ["Area of a square with side 4 is 16", "Amount of carpet needed for a room"],
    attributes: {
      isGeometry: true,
      isAlgebra: false,
      isNumber: true,
      isFormula: true,
      isOperation: true,
      isTheorem: false,
      usesDiagram: true,
      containsVariables: false,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: true,
      realWorldApplication: true,
      gradeLevel: 4
    },
    hints: {
      hint1: "It measures the size of a surface.",
      hint2: "Calculated in square units (like cm² or square meters)."
    },
    funFact: "The area of a circle uses the famous number Pi (π) multiplied by the radius squared!",
    relatedLesson: "Triangles Classification",
    commonMistakes: "Multiplying side lengths incorrectly or forgetting to label the units as 'square units'."
  },
  {
    id: "exponent",
    name: "Exponent",
    category: "Arithmetic",
    difficulty: "medium",
    definition: "A quantity representing the power to which a given number or expression is to be raised.",
    examples: ["In 2³, 3 is the exponent", "10² is 100"],
    attributes: {
      isGeometry: false,
      isAlgebra: false,
      isNumber: true,
      isFormula: false,
      isOperation: true,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: false,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: true,
      realWorldApplication: true,
      gradeLevel: 6
    },
    hints: {
      hint1: "It represents a power or repeated multiplication.",
      hint2: "It is written as a small superscript number in the top right."
    },
    funFact: "Any non-zero number raised to the exponent 0 is always equal to 1!",
    relatedLesson: "Powers and Roots",
    commonMistakes: "Multiplying the base by the exponent directly (e.g. thinking 2³ is 2 * 3 = 6 instead of 2 * 2 * 2 = 8)."
  },
  {
    id: "median",
    name: "Median",
    category: "Statistics",
    difficulty: "easy",
    definition: "The middle number in a sorted, ascending or descending, list of numbers.",
    examples: ["Median of 1, 3, 10 is 3", "Median of 1, 2, 5, 8 is (2+5)/2 = 3.5"],
    attributes: {
      isGeometry: false,
      isAlgebra: false,
      isNumber: true,
      isFormula: false,
      isOperation: true,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: false,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: true,
      realWorldApplication: true,
      gradeLevel: 6
    },
    hints: {
      hint1: "It represents the middle value in a statistical dataset.",
      hint2: "Before finding it, you must first sort the list of numbers in numerical order."
    },
    funFact: "Unlike the mean, the median is not affected by extremely large or small numbers (outliers) in a list!",
    relatedLesson: "Basic Arithmetic",
    commonMistakes: "Finding the middle number in an unsorted list without ordering it first."
  },
  {
    id: "mode",
    name: "Mode",
    category: "Statistics",
    difficulty: "easy",
    definition: "The value that appears most frequently in a data set.",
    examples: ["Mode of 1, 2, 2, 3 is 2", "In [A, B, B, C], mode is B"],
    attributes: {
      isGeometry: false,
      isAlgebra: false,
      isNumber: true,
      isFormula: false,
      isOperation: true,
      isTheorem: false,
      usesDiagram: false,
      containsVariables: false,
      usesFractions: false,
      hasGraph: false,
      requiresCalculation: true,
      realWorldApplication: true,
      gradeLevel: 6
    },
    hints: {
      hint1: "It represents the most frequent value in a dataset.",
      hint2: "A list of numbers can have more than one of me, or none at all if all numbers appear equally."
    },
    funFact: "The word 'mode' comes from the French 'la mode', meaning fashion or popular choice!",
    relatedLesson: "Basic Arithmetic",
    commonMistakes: "Thinking there must always be exactly one mode, or listing the frequency instead of the number itself."
  }
];

module.exports = {
  PERSONALITY_RESPONSES,
  REVERSE_QUESTIONS,
  REVERSE_CONCEPTS
};
