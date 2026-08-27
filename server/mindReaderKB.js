const QUESTIONS = [
  { id: 'q_geometry', text: '🪄 Hmm... should I start looking among shapes, lines, and angles?' },
  { id: 'q_algebra', text: '🔠 Is your secret hiding in the land of letters, variables, and expressions?' },
  { id: 'q_statistics', text: '📊 Are we looking at clues from data, chance, or averages?' },
  { id: 'q_number', text: '🔢 Is your secret hiding somewhere in the world of numbers?' },
  { id: 'q_triangle', text: '📐 Does your shape have exactly three sides, or does it dance with triangle ratios?' },
  { id: 'q_circle', text: '🟡 Is your shape perfectly round like a coin or a bubble?' },
  { id: 'q_equation', text: '⚖️ Shall we balance two sides of an equation to find a mystery variable?' },
  { id: 'q_operation', text: '⚙️ Does your secret ask us to perform an action, calculation, or step-by-step process?' },
  { id: 'q_fraction_percent', text: '🍰 Does it slice something whole into fractions, decimals, percentages, or ratios?' },
  { id: 'q_graph', text: '🗺️ Shall we map out our clues using coordinates on a grid or graph?' },
  { id: 'q_prime_factor', text: '🧱 Is your secret about the building blocks of numbers, like primes or factors?' },
  { id: 'q_vector_matrix', text: '🧭 Does it point us in a direction, or arrange numbers in a grid like a matrix?' },
  { id: 'q_sets_logic', text: '🧺 Are we sorting things into different logical groups or sets?' },
  { id: 'q_multiple', text: '📈 Are we searching for a multiple that grows bigger, rather than a factor that divides?' },
  { id: 'q_hundred', text: '💯 Does your secret comparison focus on parts out of a hundred?' },
  { id: 'q_degree_two', text: '🎢 Does this equation trace a curved path with a variable raised to the power of two?' }
];

const CONCEPTS = [
  {
    id: 'prime_number',
    name: 'Prime Number',
    chapter: 1,
    lessonId: 'L1',
    subject: 'Number',
    categories: ['Number Concepts', 'Primes'],
    description: 'A whole number greater than 1 with exactly two positive divisors: 1 and itself.',
    definingCharacteristics: [
      'It is a number concept, not algebra or geometry.',
      'It has exactly two factors: 1 and the number itself.',
      'It is not divisible by other numbers.'
    ],
    recommendations: {
      related: ['Composite Number', 'Prime Factorization'],
      prerequisites: ['Factors and Multiples'],
      exercises: ['Chapter 1 Lesson 1 Practice']
    },
    answers: {
      q_geometry: false, q_algebra: false, q_statistics: false, q_number: true,
      q_triangle: false, q_circle: false, q_equation: false, q_operation: false,
      q_fraction_percent: false, q_graph: false, q_prime_factor: true, q_vector_matrix: false,
      q_sets_logic: false, q_multiple: false, q_hundred: false, q_degree_two: false
    }
  },
  {
    id: 'hcf',
    name: 'HCF (Highest Common Factor)',
    chapter: 1,
    lessonId: 'L2',
    subject: 'Number',
    categories: ['Number Concepts', 'Factors & Multiples'],
    description: 'The largest positive integer that divides two or more integers without a remainder.',
    definingCharacteristics: [
      'It is a number concept.',
      'It represents an operation/process of finding factors.',
      'It is used to simplify fractions and solve grouping problems.'
    ],
    recommendations: {
      related: ['LCM', 'Prime Factorization'],
      prerequisites: ['Factors and Multiples'],
      exercises: ['Chapter 1 Lesson 2 Practice']
    },
    answers: {
      q_geometry: false, q_algebra: false, q_statistics: false, q_number: true,
      q_triangle: false, q_circle: false, q_equation: false, q_operation: true,
      q_fraction_percent: false, q_graph: false, q_prime_factor: true, q_vector_matrix: false,
      q_sets_logic: false, q_multiple: false, q_hundred: false, q_degree_two: false
    }
  },
  {
    id: 'lcm',
    name: 'LCM (Lowest Common Multiple)',
    chapter: 1,
    lessonId: 'L2',
    subject: 'Number',
    categories: ['Number Concepts', 'Factors & Multiples'],
    description: 'The smallest positive integer that is a multiple of two or more integers.',
    definingCharacteristics: [
      'It is a number concept.',
      'It represents an operation/process of finding multiples.',
      'It is used to find common denominators for fraction addition.'
    ],
    recommendations: {
      related: ['HCF', 'Prime Factorization'],
      prerequisites: ['Factors and Multiples'],
      exercises: ['Chapter 1 Lesson 2 Practice']
    },
    answers: {
      q_geometry: false, q_algebra: false, q_statistics: false, q_number: true,
      q_triangle: false, q_circle: false, q_equation: false, q_operation: true,
      q_fraction_percent: false, q_graph: false, q_prime_factor: true, q_vector_matrix: false,
      q_sets_logic: false, q_multiple: true, q_hundred: false, q_degree_two: false
    }
  },
  {
    id: 'square_root',
    name: 'Square Root',
    chapter: 1,
    lessonId: 'L6',
    subject: 'Number',
    categories: ['Number Concepts', 'Powers & Roots'],
    description: 'A value that, when multiplied by itself, gives the original number.',
    definingCharacteristics: [
      'It is a number concept.',
      'It is a mathematical operation (finding a number times itself).',
      'It is the inverse operation of squaring.'
    ],
    recommendations: {
      related: ['Square Number', 'Surds'],
      prerequisites: ['Powers and Roots'],
      exercises: ['Chapter 1 Lesson 6 Practice']
    },
    answers: {
      q_geometry: false, q_algebra: false, q_statistics: false, q_number: true,
      q_triangle: false, q_circle: false, q_equation: false, q_operation: true,
      q_fraction_percent: false, q_graph: false, q_prime_factor: false, q_vector_matrix: false,
      q_sets_logic: false, q_multiple: false, q_hundred: false, q_degree_two: false
    }
  },
  {
    id: 'equivalent_fractions',
    name: 'Equivalent Fractions',
    chapter: 5,
    lessonId: 'L1',
    subject: 'Number',
    categories: ['Fractions', 'Decimals & Percentages'],
    description: 'Fractions that represent the same value or proportion of a whole, even if they have different numerators and denominators.',
    definingCharacteristics: [
      'It is a number concept.',
      'It directly involves fractions/decimals/ratios.',
      'It relies on multiplying or dividing the top and bottom by the same number.'
    ],
    recommendations: {
      related: ['Simplest Form', 'Ratio'],
      prerequisites: ['Fractions Intro'],
      exercises: ['Chapter 5 Lesson 1 Practice']
    },
    answers: {
      q_geometry: false, q_algebra: false, q_statistics: false, q_number: true,
      q_triangle: false, q_circle: false, q_equation: false, q_operation: false,
      q_fraction_percent: true, q_graph: false, q_prime_factor: false, q_vector_matrix: false,
      q_sets_logic: false, q_multiple: false, q_hundred: false, q_degree_two: false
    }
  },
  {
    id: 'percentage',
    name: 'Percentage',
    chapter: 5,
    lessonId: 'L8',
    subject: 'Number',
    categories: ['Fractions', 'Decimals & Percentages'],
    description: 'A relative value representing the hundredth part of any quantity (e.g. 50% = 50 out of 100).',
    definingCharacteristics: [
      'It is a number concept.',
      'It represents parts of a whole (fractions/ratios out of 100).',
      'It is widely used in finance, discounts, and probability.'
    ],
    recommendations: {
      related: ['Equivalent Fractions', 'Simple Interest'],
      prerequisites: ['Fractions and Decimals'],
      exercises: ['Chapter 5 Lesson 8 Practice']
    },
    answers: {
      q_geometry: false, q_algebra: false, q_statistics: false, q_number: true,
      q_triangle: false, q_circle: false, q_equation: false, q_operation: false,
      q_fraction_percent: true, q_graph: false, q_prime_factor: false, q_vector_matrix: false,
      q_sets_logic: false, q_multiple: false, q_hundred: true, q_degree_two: false
    }
  },
  {
    id: 'linear_equation',
    name: 'Linear Equation',
    chapter: 6,
    lessonId: 'L1',
    subject: 'Algebra',
    categories: ['Algebra', 'Equations'],
    description: 'An equation between two variables that gives a straight line when plotted on a graph, with variables raised to the power of 1.',
    definingCharacteristics: [
      'It is an algebra-related concept.',
      'It involves solving an equation for variable x.',
      'It represents a straight line on a graph.'
    ],
    recommendations: {
      related: ['Quadratic Equation', 'Simultaneous Equations'],
      prerequisites: ['Simplifying Terms', 'Substitution'],
      exercises: ['Chapter 6 Lesson 1 Practice']
    },
    answers: {
      q_geometry: false, q_algebra: true, q_statistics: false, q_number: false,
      q_triangle: false, q_circle: false, q_equation: true, q_operation: false,
      q_fraction_percent: false, q_graph: true, q_prime_factor: false, q_vector_matrix: false,
      q_sets_logic: false, q_multiple: false, q_hundred: false, q_degree_two: false
    }
  },
  {
    id: 'quadratic_equation',
    name: 'Quadratic Equation',
    chapter: 10,
    lessonId: 'L3',
    subject: 'Algebra',
    categories: ['Algebra', 'Equations'],
    description: 'An equation of degree 2, typically written as ax² + bx + c = 0, representing a curved path (parabola).',
    definingCharacteristics: [
      'It is an algebra-related concept.',
      'It involves equations and variables raised to the power of 2.',
      'It plots as a curve (parabola), not a straight line.'
    ],
    recommendations: {
      related: ['Linear Equation', 'Quadratic Formula'],
      prerequisites: ['Factoring Quadratics'],
      exercises: ['Chapter 10 Lesson 3 Practice']
    },
    answers: {
      q_geometry: false, q_algebra: true, q_statistics: false, q_number: false,
      q_triangle: false, q_circle: false, q_equation: true, q_operation: false,
      q_fraction_percent: false, q_graph: true, q_prime_factor: false, q_vector_matrix: false,
      q_sets_logic: false, q_multiple: false, q_hundred: false, q_degree_two: true
    }
  },
  {
    id: 'matrix',
    name: 'Matrix',
    chapter: 23,
    lessonId: 'L1',
    subject: 'Algebra',
    categories: ['Algebra', 'Vectors & Matrices'],
    description: 'A rectangular array of numbers arranged in rows and columns, used to represent linear transformations.',
    definingCharacteristics: [
      'It is an algebra-related concept.',
      'It involves vectors, grids of numbers, or matrices.',
      'It does not represent a standard algebraic function.'
    ],
    recommendations: {
      related: ['Vector', 'Translation'],
      prerequisites: ['Basic Arithmetic'],
      exercises: ['Matrix Operations Practice']
    },
    answers: {
      q_geometry: false, q_algebra: true, q_statistics: false, q_number: false,
      q_triangle: false, q_circle: false, q_equation: false, q_operation: false,
      q_fraction_percent: false, q_graph: false, q_prime_factor: false, q_vector_matrix: true,
      q_sets_logic: false, q_multiple: false, q_hundred: false, q_degree_two: false
    }
  },
  {
    id: 'vector',
    name: 'Vector',
    chapter: 23,
    lessonId: 'L2',
    subject: 'Geometry',
    categories: ['Geometry', 'Vectors & Matrices'],
    description: 'A quantity having direction as well as magnitude, especially as determining the position of one point in space relative to another.',
    definingCharacteristics: [
      'It is related to geometry, space, or directions.',
      'It involves vectors or column matrices.',
      'It is used to represent translation transformations.'
    ],
    recommendations: {
      related: ['Matrix', 'Translation'],
      prerequisites: ['Coordinate Geometry'],
      exercises: ['Chapter 23 Lesson 2 Practice']
    },
    answers: {
      q_geometry: true, q_algebra: false, q_statistics: false, q_number: false,
      q_triangle: false, q_circle: false, q_equation: false, q_operation: false,
      q_fraction_percent: false, q_graph: true, q_prime_factor: false, q_vector_matrix: true,
      q_sets_logic: false, q_multiple: false, q_hundred: false, q_degree_two: false
    }
  },
  {
    id: 'right_triangle',
    name: 'Right Triangle',
    chapter: 3,
    lessonId: 'L3',
    subject: 'Geometry',
    categories: ['Geometry', 'Triangles'],
    description: 'A triangle in which one angle is a right angle (exactly 90 degrees).',
    definingCharacteristics: [
      'It is a geometry concept.',
      'It involves a three-sided shape (triangle).',
      'It has a 90-degree angle.'
    ],
    recommendations: {
      related: ['Pythagoras\' Theorem', 'Trigonometric Ratios'],
      prerequisites: ['Triangles Classification'],
      exercises: ['Chapter 3 Lesson 3 Practice']
    },
    answers: {
      q_geometry: true, q_algebra: false, q_statistics: false, q_number: false,
      q_triangle: true, q_circle: false, q_equation: false, q_operation: false,
      q_fraction_percent: false, q_graph: false, q_prime_factor: false, q_vector_matrix: false,
      q_sets_logic: false, q_multiple: false, q_hundred: false, q_degree_two: false
    }
  },
  {
    id: 'pythagoras_theorem',
    name: 'Pythagoras\' Theorem',
    chapter: 11,
    lessonId: 'L1',
    subject: 'Geometry',
    categories: ['Geometry', 'Triangles'],
    description: 'The theorem stating that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides (a² + b² = c²).',
    definingCharacteristics: [
      'It is a geometry concept.',
      'It involves triangles, hypotenuse, and squares of sides.',
      'It is an equation/formula to calculate lengths.'
    ],
    recommendations: {
      related: ['Right Triangle', 'Trigonometric Ratios'],
      prerequisites: ['Right Triangle', 'Square Roots'],
      exercises: ['Chapter 11 Lesson 1 Practice']
    },
    answers: {
      q_geometry: true, q_algebra: false, q_statistics: false, q_number: false,
      q_triangle: true, q_circle: false, q_equation: true, q_operation: true,
      q_fraction_percent: false, q_graph: false, q_prime_factor: false, q_vector_matrix: false,
      q_sets_logic: false, q_multiple: false, q_hundred: false, q_degree_two: false
    }
  },
  {
    id: 'venn_diagram',
    name: 'Venn Diagram',
    chapter: 9,
    lessonId: 'L3',
    subject: 'Algebra',
    categories: ['Sets', 'Logic'],
    description: 'A diagram that shows all possible logical relations between a finite collection of different sets, typically using overlapping circles.',
    definingCharacteristics: [
      'It is related to algebra and set theory.',
      'It involves sets, unions, intersections, and logic.',
      'It is a visual diagram, not a coordinates plot.'
    ],
    recommendations: {
      related: ['Set Operations', 'Probability'],
      prerequisites: ['Sets Intro'],
      exercises: ['Chapter 9 Lesson 3 Practice']
    },
    answers: {
      q_geometry: false, q_algebra: true, q_statistics: false, q_number: false,
      q_triangle: false, q_circle: true, q_equation: false, q_operation: false,
      q_fraction_percent: false, q_graph: false, q_prime_factor: false, q_vector_matrix: false,
      q_sets_logic: true, q_multiple: false, q_hundred: false, q_degree_two: false
    }
  },
  {
    id: 'mean',
    name: 'Mean',
    chapter: 12,
    lessonId: 'L1',
    subject: 'Statistics',
    categories: ['Statistics', 'Averages'],
    description: 'The average of a set of numbers, calculated by summing all values and dividing by the total count of values.',
    definingCharacteristics: [
      'It is a statistics concept.',
      'It represents an operation/calculation (sum divided by count).',
      'It is used to summarize numerical data.'
    ],
    recommendations: {
      related: ['Median', 'Mode', 'Range'],
      prerequisites: ['Basic Arithmetic'],
      exercises: ['Chapter 12 Lesson 1 Practice']
    },
    answers: {
      q_geometry: false, q_algebra: false, q_statistics: true, q_number: false,
      q_triangle: false, q_circle: false, q_equation: false, q_operation: true,
      q_fraction_percent: false, q_graph: false, q_prime_factor: false, q_vector_matrix: false,
      q_sets_logic: false, q_multiple: false, q_hundred: false, q_degree_two: false
    }
  },
  {
    id: 'probability',
    name: 'Probability',
    chapter: 8,
    lessonId: 'L1',
    subject: 'Statistics',
    categories: ['Statistics', 'Probability'],
    description: 'The branch of mathematics concerning numerical descriptions of how likely an event is to occur.',
    definingCharacteristics: [
      'It is a statistics/probability concept.',
      'It measures the likelihood of events happening.',
      'Values always fall between 0 and 1 (or 0% and 100%).'
    ],
    recommendations: {
      related: ['Venn Diagram', 'Sample Space'],
      prerequisites: ['Fractions and Percentages'],
      exercises: ['Chapter 8 Lesson 1 Practice']
    },
    answers: {
      q_geometry: false, q_algebra: false, q_statistics: true, q_number: false,
      q_triangle: false, q_circle: false, q_equation: false, q_operation: false,
      q_fraction_percent: true, q_graph: false, q_prime_factor: false, q_vector_matrix: false,
      q_sets_logic: false, q_multiple: false, q_hundred: false, q_degree_two: false
    }
  }
];

module.exports = { QUESTIONS, CONCEPTS };
