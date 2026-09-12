// Home-screen tile registry.
//
// Extracted from App.jsx (issue #189). This file is intentionally PURE DATA:
// every entry is { key, name, subtitle, color } and nothing here imports or
// references a React component. That is what makes it safe to edit without
// touching the App.jsx monolith.
//
// modeMap deliberately does NOT live here -- its values are components defined
// inline throughout App.jsx, so extracting it needs component extraction first.
// See #199.

// Set false to remove the Car Journey card from the home grid (hamburger-only mode).
export const CJ_SHOW_GRID_CARD = true

export const TILES = [
    { key: 'battle', name: '⚔️ Battle Arena', subtitle: 'Live fastest-finger duels', color: 'red', category: 'shelf' },
    { key: 'detective', name: '🔍 Detective Agency', subtitle: 'Solve math mysteries and crack cases!', color: 'indigo', category: 'shelf' },
    { key: 'addition', name: 'Addition', subtitle: '20-question addition practice', color: 'blue', category: 'number-foundations' },
    { key: 'column-addition', name: 'Column Addition', subtitle: 'Vertical addition with carrying', color: 'blue', category: 'number-foundations', foldInto: 'basicarith' },
    { key: 'column-division', name: 'Column Division', subtitle: 'Vertical division with long division', color: 'blue', category: 'number-foundations', foldInto: 'basicarith' },
    { key: 'column-multiplication', name: 'Column Multiplication', subtitle: 'Vertical multiplication with carrying', color: 'blue', category: 'number-foundations', foldInto: 'basicarith' },
    { key: 'column-subtraction', name: 'Column Subtraction', subtitle: 'Vertical subtraction with borrowing', color: 'blue', category: 'number-foundations', foldInto: 'basicarith' },
    { key: 'angles', name: 'Angles', subtitle: 'Lines, points, parallel lines', color: 'green', category: 'shape-space' },
    { key: 'basicarith', name: 'Arithmetic', subtitle: '+, −, ×, ÷ with positive & negative', color: 'purple', category: 'number-foundations' },
    { key: 'banking', name: 'Banking (RD)', subtitle: 'Interest & recurring deposits', color: 'blue', category: 'everyday-maths' },
    { key: 'bearings', name: 'Bearings', subtitle: 'Three-figure bearings', color: 'green', category: 'shape-space' },
    { key: 'binomial', name: 'Binomial Theorem', subtitle: 'Expansions & coefficients', color: 'purple', category: 'algebra' },
    { key: 'bounds', name: 'Bounds', subtitle: 'Upper & lower bounds', color: 'blue', category: 'algebra' },
    { key: 'circmeasure', name: 'Circular Measure', subtitle: 'Radians, arc length, sectors', color: 'green', category: 'shape-space' },
    { key: 'circleth', name: 'Circle Theorems', subtitle: 'Angles, tangents, cyclic quads', color: 'purple', category: 'shape-space' },
    { key: 'complex', name: 'Complex Numbers', subtitle: 'Add, multiply, modulus', color: 'blue', category: 'algebra' },
    { key: 'congruence', name: 'Congruence', subtitle: 'SSS, SAS, ASA, RHS', color: 'green', category: 'shape-space' },
    { key: 'conics', name: 'Conic Sections', subtitle: 'Circle, parabola, ellipse, hyperbola', color: 'purple', category: 'shape-space' },
    { key: 'coordgeom', name: 'Coord. Geometry', subtitle: 'Midpoint, distance, gradient', color: 'blue', category: 'shape-space' },
    { key: 'decimals', name: 'Decimals', subtitle: 'Add, subtract, multiply, divide', color: 'blue', category: 'number-foundations' },
    { key: 'diff', name: 'Differentiation', subtitle: 'Power rule, turning points', color: 'purple', category: 'calculus' },
    { key: 'diffeq', name: 'Differential Eq.', subtitle: 'Order, degree, solve DEs', color: 'green', category: 'calculus' },
    { key: 'dotprod', name: 'Dot Products', subtitle: 'Vectors, matrices, fill blanks', color: 'blue', category: 'linear-algebra' },
    { key: 'fractionadd', name: 'Fractions', subtitle: 'Add, subtract, multiply & divide', color: 'green', category: 'number-foundations' },
    { key: 'funceval', name: 'Functions', subtitle: 'Evaluate f(x), f(x,y), f(x,y,z)', color: 'green', category: 'algebra' },
    { key: 'gk', name: 'GK', subtitle: 'General Knowledge questions', color: 'purple', category: 'shelf' },
    { key: 'gst', name: 'GST', subtitle: 'Goods & Services Tax', color: 'purple', category: 'everyday-maths' },
    { key: 'hcflcm', name: 'HCF & LCM', subtitle: 'Highest common factor & LCM', color: 'blue', category: 'number-foundations' },
    { key: 'idlivada', name: 'Idli Vada Sambhar', subtitle: 'Multiples, common multiples & LCM game', color: 'orange', category: 'number-foundations', foldInto: 'fractionadd' },
    { key: 'heron', name: "Heron's Formula", subtitle: 'Triangle area from sides', color: 'blue', category: 'shape-space' },
    { key: 'indices', name: 'Indices', subtitle: 'Laws of exponents', color: 'purple', category: 'algebra' },
    { key: 'ineq', name: 'Inequalities', subtitle: 'Linear & quadratic inequalities', color: 'green', category: 'algebra' },
    { key: 'integ', name: 'Integration', subtitle: 'Reverse differentiation & areas', color: 'blue', category: 'calculus' },
    { key: 'invtrig', name: 'Inverse Trig', subtitle: 'arcsin, arccos, arctan', color: 'green', category: 'shape-space' },
    { key: 'limits', name: 'Limits', subtitle: 'Evaluate limits', color: 'purple', category: 'calculus' },
    { key: 'linearalgebra', name: 'Linear Algebra', subtitle: '56 missions across 6 modules', color: 'orange', category: 'linear-algebra' },
    { key: 'lineareq', name: 'Linear Equations', subtitle: 'Solve for x in one variable', color: 'blue', category: 'algebra' },
    { key: 'lineq', name: 'Line Equation', subtitle: 'Find m and c from two points', color: 'green', category: 'shape-space' },
    { key: 'linprog', name: 'Linear Programming', subtitle: 'Optimize objective functions', color: 'green', category: 'algebra' },
    { key: 'log', name: 'Logarithms', subtitle: 'Evaluate, simplify, solve', color: 'purple', category: 'algebra' },
    { key: 'matrix', name: 'Matrices', subtitle: 'Add, multiply, determinant', color: 'blue', category: 'linear-algebra' },
    { key: 'mensur', name: 'Mensuration', subtitle: 'Area, volume, surface area', color: 'green', category: 'shape-space' },
    { key: 'multiply', name: 'Multiplication', subtitle: 'Practice any times table (2–19)', color: 'purple', category: 'number-foundations' },
    { key: 'bases', name: 'Number Bases', subtitle: 'Binary, decimal, hexadecimal', color: 'green', category: 'number-foundations' },
    { key: 'basic-arith-lab', name: 'Origin', subtitle: 'Practice +, -, ×, ÷ with varied templates', color: 'blue', category: 'number-foundations', foldInto: 'basicarith' },
    { key: 'percent', name: 'Percentages', subtitle: 'Find, increase, reverse, compound', color: 'blue', category: 'everyday-maths' },
    { key: 'permcomb', name: 'Perm. & Comb.', subtitle: 'Permutations & combinations', color: 'purple', category: 'data-chance' },
    { key: 'polyfactor', name: 'Poly Factor', subtitle: 'Factor a quadratic expression', color: 'green', category: 'algebra' },
    { key: 'polymul', name: 'Poly Multiply', subtitle: 'Multiply two polynomials', color: 'blue', category: 'algebra' },
    { key: 'polygons', name: 'Polygons', subtitle: 'Interior & exterior angles', color: 'purple', category: 'shape-space' },
    { key: 'primefactor', name: 'Prime Factors', subtitle: 'Break a number into primes', color: 'green', category: 'number-foundations' },
    { key: 'prob', name: 'Probability', subtitle: 'Single & combined events', color: 'blue', category: 'data-chance' },
    { key: 'profitloss', name: 'Profit & Loss', subtitle: 'Cost price, discounts, markup', color: 'purple', category: 'everyday-maths' },
    { key: 'pythag', name: "Pythagoras' Theorem", subtitle: 'Hypotenuse, legs, 3D', color: 'green', category: 'shape-space' },
    { key: 'quadratic', name: 'Quadratic', subtitle: 'Find y for y = ax² + bx + c', color: 'blue', category: 'algebra' },
    { key: 'qformula', name: 'Quadratics (Formula)', subtitle: 'Find roots of ax² + bx + c = 0', color: 'purple', category: 'algebra' },
    { key: 'ratio', name: 'Ratio', subtitle: 'Ratio & proportion', color: 'green', category: 'everyday-maths' },
    { key: 'remfactor', name: 'Remainder Theorem', subtitle: 'Remainder & factor theorem', color: 'blue', category: 'algebra' },
    { key: 'rounding', name: 'Rounding', subtitle: 'D.P., sig. figs, estimation', color: 'blue', category: 'number-foundations' },
    { key: 'section', name: 'Section Formula', subtitle: 'Midpoint, section, centroid', color: 'green', category: 'shape-space' },
    { key: 'sequences', name: 'Sequences', subtitle: 'Arithmetic & geometric sequences', color: 'purple', category: 'algebra' },
    { key: 'shares', name: 'Shares & Dividends', subtitle: 'Shares, dividends, returns', color: 'purple', category: 'everyday-maths' },
    { key: 'sets', name: 'Sets', subtitle: 'Union, intersection, Venn diagrams', color: 'blue', category: 'data-chance' },
    { key: 'similarity', name: 'Similarity', subtitle: 'Scale factor, area & volume ratios', color: 'green', category: 'shape-space' },
    { key: 'squaring', name: 'Squaring', subtitle: 'Square numbers using (a+b)²', color: 'purple', category: 'number-foundations' },
    { key: 'simul', name: 'Sim. Equations', subtitle: '2×2 (easy) or 3×3 (hard)', color: 'purple', category: 'algebra' },
    { key: 'sdt', name: 'Speed, Distance, Time', subtitle: 'Rate problems & conversions', color: 'blue', category: 'everyday-maths' },
    { key: 'sqrt', name: 'Square Root', subtitle: 'Nearest-integer square root drill', color: 'green', category: 'algebra' },
    { key: 'stdform', name: 'Standard Form', subtitle: 'Scientific notation operations', color: 'purple', category: 'algebra' },
    { key: 'stats', name: 'Statistics', subtitle: 'Mean, median, mode, range', color: 'blue', category: 'data-chance' },
    { key: 'sudoku', name: 'Sudoku', subtitle: '9x9 number puzzle — fill every row, column & box', color: 'teal', category: 'shelf' },
    { key: 'surds', name: 'Surds', subtitle: 'Simplify, add, multiply, rationalise', color: 'green', category: 'algebra' },
    { key: 'tatsavit', name: 'Tatsavit', subtitle: 'Algebra simplification drill', color: 'blue', category: 'algebra' },
    ...(CJ_SHOW_GRID_CARD ? [{ key: 'carjourney', name: 'The Car Journey', subtitle: '16-stop math road trip — counting to calculus', color: 'orange', category: 'number-foundations', foldInto: 'basicarith' }] : []),
    { key: 'transform', name: 'Transformations', subtitle: 'Reflect, rotate, translate, enlarge', color: 'purple', category: 'shape-space' },
    { key: 'triangles', name: 'Triangles', subtitle: 'Angle sum, isosceles, exterior', color: 'blue', category: 'shape-space' },
    { key: 'trig', name: 'Trigonometry', subtitle: 'SOH-CAH-TOA, sine/cosine rule', color: 'green', category: 'shape-space' },
    { key: 'variation', name: 'Variation', subtitle: 'Direct & inverse proportion', color: 'purple', category: 'algebra' },
    { key: 'vectors', name: 'Vectors', subtitle: 'Add, scale, magnitude', color: 'blue', category: 'linear-algebra' },
    { key: 'vocab', name: 'Vocabulary', subtitle: 'Match words to definitions', color: 'green', category: 'shelf' },
    { key: 'spot', name: 'Twin Hunt', subtitle: 'Find the common object', color: 'purple', category: 'shelf' },
    { key: 'gymdecimals', name: 'Gym Decimals', subtitle: 'Signed decimal × decimal — 1-digit MCQ', color: 'purple', category: 'number-foundations', foldInto: 'decimals' },
    { key: 'guess', name: 'Guess the Number', subtitle: 'Binary magic trick — mind-reading game', color: 'blue', category: 'number-foundations', foldInto: 'bases' },
    { key: 'funcgym', name: 'Functions Gym', subtitle: 'Evaluate small polynomials (MCQ)', color: 'blue', category: 'algebra', foldInto: 'funceval' },
    { key: 'dotprodgym', name: 'DotProducts Gym', subtitle: '2D/3D dot products (MCQ)', color: 'green', category: 'linear-algebra', foldInto: 'dotprod' },
    { key: 'fracaddgym', name: 'Fractions-add-gym', subtitle: 'Add single-digit fractions (MCQ)', color: 'purple', category: 'number-foundations', foldInto: 'fractionadd' },
    { key: 'lineqgym', name: 'LinearEquations-Gym', subtitle: 'Solve linear equations (MCQ)', color: 'blue', category: 'algebra', foldInto: 'lineareq' },
    { key: 'indicesgym', name: 'Indices-Gym', subtitle: 'Index laws (MCQ)', color: 'green', category: 'algebra', foldInto: 'indices' },
    { key: 'polygym', name: 'Polynomials Gym', subtitle: 'Arithmetic → monomial algebra (MCQ)', color: 'blue', category: 'algebra', foldInto: 'polymul' },
    { key: 'water-jug-lab', name: '🧪 Water Jug Lab', subtitle: 'GCD discovery — 13-level progression', color: 'teal', category: 'shelf' },
    { key: 'equation-crafting-lab', name: '⚗️ Equation Crafting Lab', subtitle: 'Build expressions in the mixing pot', color: 'orange', category: 'algebra' },
]

// Hamburger-only entries (#190). Data only -- composition stays in App.jsx.
export const FEATURED_TILES = [
    { key: 'randommix', name: 'Random Mix', subtitle: 'Adaptive cross-topic quiz', color: 'featured' },
    { key: 'custom', name: 'Custom Lesson', subtitle: 'Build your own mixed quiz', color: 'featured' },
    { key: 'gym', name: 'Gym', subtitle: 'Adaptive workout across all 7 gym puzzles', color: 'featured' },
    { key: 'treasurehunt', name: 'Treasure Hunt', subtitle: 'Solve & seek on a treasure grid', color: 'featured' },
    { key: 'contrastlist', name: 'Contrast Challenge', subtitle: 'Distinguish similar concepts', color: 'featured' },
    { key: 'vachana', name: 'Vachana', subtitle: 'Mathematical Literacy Lab', color: 'featured' },
]

// Visual Learning Universe lives only in the hamburger menu (#191).
export const MATH_LAB_ENTRY = { key: 'math-lab', name: '🔬 Visual Learning Universe', subtitle: 'Visual, Mensuration & Addition labs', color: 'orange' }

// GEOCRAFT_ENTRY is the only tile-shaped object carrying isRedirect/path (#191).
// Those fields are load-bearing: they are why clicking GeoCraft does a full page
// navigation instead of setting a mode. Do not normalise them away.
export const GEOCRAFT_ENTRY = { key: 'geocraft', name: '📐 GeoCraft', subtitle: 'Interactive Geometry Lab', color: 'featured', isRedirect: true, path: '/geocraft' }

export default TILES
