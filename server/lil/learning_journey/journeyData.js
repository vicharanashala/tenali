const JOURNEY_CURRICULUM = [
  {
    id: "arithmetic_basics",
    name: "Arithmetic Basics",
    description: "Fundamentals of numbers and basic calculations.",
    concepts: [
      { key: "addition", name: "Addition" },
      { key: "basicarith", name: "Arithmetic (+, -, *)" },
      { key: "multiply", name: "Multiplication" },
      { key: "hcflcm", name: "HCF & LCM" },
      { key: "decimals", name: "Decimals" },
      { key: "fractionadd", name: "Fractions" },
      { key: "rounding", name: "Rounding" }
    ]
  },
  {
    id: "advanced_arithmetic",
    name: "Advanced Arithmetic & Finance",
    description: "Learn ratios, financial formulas, and rates of change.",
    concepts: [
      { key: "bases", name: "Number Bases" },
      { key: "stdform", name: "Standard Form" },
      { key: "sqrt", name: "Square Root" },
      { key: "percent", name: "Percentages" },
      { key: "profitloss", name: "Profit & Loss" },
      { key: "banking", name: "Banking (RD)" },
      { key: "gst", name: "GST" },
      { key: "shares", name: "Shares & Dividends" },
      { key: "sdt", name: "Speed, Distance, Time" },
      { key: "variation", name: "Variation" }
    ]
  },
  {
    id: "algebra_foundations",
    name: "Algebra Foundations",
    description: "Variables, linear equations, exponents, and simple expansions.",
    concepts: [
      { key: "lineareq", name: "Linear Equations" },
      { key: "squaring", name: "Squaring" },
      { key: "indices", name: "Indices" },
      { key: "funceval", name: "Functions" },
      { key: "ratio", name: "Ratio" }
    ]
  },
  {
    id: "algebra_intermediate",
    name: "Intermediate Algebra",
    description: "Polynomial operations, factoring, and system of equations.",
    concepts: [
      { key: "polymul", name: "Poly Multiply" },
      { key: "polyfactor", name: "Poly Factor" },
      { key: "primefactor", name: "Prime Factors" },
      { key: "quadratic", name: "Quadratic" },
      { key: "qformula", name: "Quadratics (Formula)" },
      { key: "simul", name: "Sim. Equations" },
      { key: "remfactor", name: "Remainder Theorem" }
    ]
  },
  {
    id: "geometry_foundations",
    name: "Geometry Foundations",
    description: "Lines, shapes, properties of triangles, and polygons.",
    concepts: [
      { key: "angles", name: "Angles" },
      { key: "triangles", name: "Triangles" },
      { key: "congruence", name: "Congruence" },
      { key: "pythag", name: "Pythagoras' Theorem" },
      { key: "polygons", name: "Polygons" },
      { key: "similarity", name: "Similarity" },
      { key: "circleth", name: "Circle Theorems" },
      { key: "transform", name: "Transformations" }
    ]
  },
  {
    id: "coordinate_vectors",
    name: "Coordinate Geometry & Vectors",
    description: "Plotting coordinates, lines, vectors, and matrices.",
    concepts: [
      { key: "lineq", name: "Line Equation" },
      { key: "coordgeom", name: "Coord. Geometry" },
      { key: "section", name: "Section Formula" },
      { key: "vectors", name: "Vectors" },
      { key: "dotprod", name: "Dot Products" },
      { key: "matrix", name: "Matrices" }
    ]
  },
  {
    id: "trig_measurement",
    name: "Trigonometry & Mensuration",
    description: "Angle measures, bearing, areas, volumes, and standard formulas.",
    concepts: [
      { key: "trig", name: "Trigonometry" },
      { key: "invtrig", name: "Inverse Trig" },
      { key: "bearings", name: "Bearings" },
      { key: "circmeasure", name: "Circular Measure" },
      { key: "mensur", name: "Mensuration" },
      { key: "heron", name: "Heron's Formula" }
    ]
  },
  {
    id: "prob_stats",
    name: "Probability & Statistics",
    description: "Venn diagrams, combinations, sorting data, and calculating likelihood.",
    concepts: [
      { key: "prob", name: "Probability" },
      { key: "stats", name: "Statistics" },
      { key: "sets", name: "Sets" },
      { key: "permcomb", name: "Perm. & Comb." }
    ]
  },
  {
    id: "calculus_analysis",
    name: "Calculus & Advanced Analysis",
    description: "Limits, rates of change, integrals, and advanced algebraic concepts.",
    concepts: [
      { key: "limits", name: "Limits" },
      { key: "diff", name: "Differentiation" },
      { key: "integ", name: "Integration" },
      { key: "diffeq", name: "Differential Eq." },
      { key: "conics", name: "Conic Sections" },
      { key: "binomial", name: "Binomial Theorem" },
      { key: "log", name: "Logarithms" },
      { key: "complex", name: "Complex Numbers" },
      { key: "sequences", name: "Sequences" },
      { key: "linprog", name: "Linear Programming" }
    ]
  },
  {
    id: "games_puzzles",
    name: "Puzzles & Challenges",
    description: "Vocabulary, general knowledge, visual games, and quick mental gym quizzes.",
    concepts: [
      { key: "gk", name: "GK" },
      { key: "vocab", name: "Vocabulary" },
      { key: "spot", name: "Twin Hunt" },
      { key: "guess", name: "Guess the Number" },
      { key: "gymdecimals", name: "Gym Decimals" },
      { key: "funcgym", name: "Functions Gym" },
      { key: "dotprodgym", name: "DotProducts Gym" },
      { key: "fracaddgym", name: "Fractions-add-gym" },
      { key: "lineqgym", name: "LinearEquations-Gym" },
      { key: "indicesgym", name: "Indices-Gym" },
      { key: "polygym", name: "Polynomials Gym" },
      { key: "tatsavit", name: "Tatsavit" }
    ]
  }
];

module.exports = { JOURNEY_CURRICULUM };
