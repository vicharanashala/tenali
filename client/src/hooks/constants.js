export const WARMUP_QUESTIONS_V01 = [
  { prompt: 'What is 6 + 7?', answer: 13 },
  { prompt: 'What is 9 + 5?', answer: 14 },
  { prompt: 'What is 8 + 4?', answer: 12 },
]

export const getTopicDisplayName = (apiPath) => {
  if (!apiPath) return 'Basics'
  // Accept either "basicarith" (prereq map format) or "basicarith-api"
  // (legacy factory format) so callers can use either.
  const key = apiPath.endsWith('-api') ? apiPath : `${apiPath}-api`
  const customNames = {
    'trig-api': 'Trigonometry',
    'pythag-api': 'Pythagoras Theorem',
    'lineareq-api': 'Linear Equations',
    'multiply-api': 'Multiplication',
    'addition-api': 'Addition & Subtraction',
    'decimals-api': 'Decimals & Fractions',
    'stdform-api': 'Standard Form',
    'quadratic-api': 'Quadratic Equations',
    'diff-api': 'Differentiation',
    'integ-api': 'Integration',
    'limits-api': 'Limits & Functions',
    'permcomb-api': 'Permutations & Combinations',
    'primefactor-api': 'Prime Factorisation',
    'sqrt-api': 'Square Roots',
    'hcflcm-api': 'HCF & LCM',
    'angles-api': 'Angles & Lines',
    'triangles-api': 'Triangles',
    'congruence-api': 'Triangle Congruence',
    'similarity-api': 'Triangle Similarity',
    'circle-api': 'Circle Theorems',
    'bearings-api': 'Bearings',
    'coordgeom-api': 'Coordinate Geometry',
    'transform-api': 'Transformations',
    'mensur-api': 'Mensuration',
    'vectors-api': 'Vectors',
    'matrix-api': 'Matrices',
    'prob-api': 'Probability',
    'stats-api': 'Statistics',
    'ineq-api': 'Inequalities',
    'polymul-api': 'Polynomial Multiplication',
    'polyfactor-api': 'Polynomial Factorisation',
    'qformula-api': 'Quadratic Formula',
    'simul-api': 'Simultaneous Equations',
    'funceval-api': 'Function Evaluation',
    'lineq-api': 'Line Equations',
    'fractionadd-api': 'Fraction Addition',
    'profitloss-api': 'Profit & Loss',
    'sdt-api': 'Speed, Distance & Time',
    'bases-api': 'Number Bases',
    'surds-api': 'Surds',
    'log-api': 'Logarithms',
    'binomial-api': 'Binomial Expansion',
    'complex-api': 'Complex Numbers',
    'bounds-api': 'Lower & Upper Bounds',
    'polygons-api': 'Polygons',
    'remfactor-api': 'Remainder & Factor Theorem',
    'heron-api': "Heron's Formula",
    'linprog-api': 'Linear Programming',
    'diffeq-api': 'Differential Equations',
    'invtrig-api': 'Inverse Trigonometry',
    'circmeasure-api': 'Circular Measure',
    'section-api': 'Section Formula',
    'conics-api': 'Conics',
    'shares-api': 'Shares & Dividends',
    'banking-api': 'Banking',
    'gst-api': 'GST',
    'dotprod-api': 'Dot Product',
    'basicarith-api': 'Basic Arithmetic',
    'gk-api': 'General Knowledge',
    'vocab-api': 'Vocabulary',
  }
  if (customNames[key]) return customNames[key]
  return key
    .replace('-api', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Whitelist of topics whose /question + /check endpoints accept a single
// text input (or otherwise work without a multi-input adapter).
//
// Keys use the same format as the prerequisite map (no `-api` suffix).
// v1.1 will add: lineq, polymul, polyfactor, primefactor, qformula, simul
// (see server/warmupAdapter.js for the adapter scaffold).
export const WARMUP_SUPPORTED_TOPICS = new Set([
  'basicarith',
  'multiply',
  'sqrt',
  'quadratic',
  'funceval',
  'indices',
  'addition',
  'squaring',
  'lineareq',
  'rounding',
  'ratio',
  'percent',
  'decimals',
  'sequences',
])

export const getWarmupPrompt = (q) => {
  if (!q) return '…'
  if (q.prompt) return q.prompt
  if (q.p1Display && q.p2Display) return `Expand (${q.p1Display})(${q.p2Display})`
  if (q.n1 != null && q.d1 != null && q.n2 != null && q.d2 != null) {
    return `${q.n1}/${q.d1} ${q.op || '+'} ${q.n2}/${q.d2}`
  }
  if (q.display && q.factors) return `Factorise: ${q.display}`
  if (q.display) return q.display
  if (q.question) return q.question
  return '…'
}