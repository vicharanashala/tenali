// ═══════════════════════════════════════════════════════════════════════════
// prerequisiteGraph.js — Prerequisite graph data extracted from graph/index.html
// Provides helper functions for the Prerequisite Diagnostic Test (Feature 3)
// ═══════════════════════════════════════════════════════════════════════════

// ─── NODE DATA — every puzzle topic in Tenali ────────────────────────────
const nodes = [
  // Arithmetic
  { id: 'basicarith',   label: 'Basic Arithmetic',   cat: 'arith' },
  { id: 'addition',     label: 'Addition',            cat: 'arith' },
  { id: 'multiply',     label: 'Multiplication',      cat: 'arith' },
  { id: 'rounding',     label: 'Rounding',            cat: 'arith' },
  { id: 'fractionadd',  label: 'Fractions (Add)',     cat: 'arith' },
  { id: 'percent',      label: 'Percentages',         cat: 'arith' },
  { id: 'profitloss',   label: 'Profit & Loss',       cat: 'arith' },
  { id: 'ratio',        label: 'Ratio',               cat: 'arith' },
  { id: 'sdt',          label: 'Speed / Dist / Time', cat: 'arith' },
  { id: 'squaring',     label: 'Squaring',            cat: 'arith' },
  { id: 'decimals',     label: 'Decimals',            cat: 'arith' },
  { id: 'shares',       label: 'Shares & Dividends',  cat: 'arith' },
  { id: 'banking',      label: 'Banking (RD)',        cat: 'arith' },
  { id: 'gst',          label: 'GST',                 cat: 'arith' },

  // Number theory
  { id: 'hcflcm',       label: 'HCF & LCM',          cat: 'numth' },
  { id: 'primefactor',  label: 'Prime Factors',       cat: 'numth' },
  { id: 'bases',        label: 'Number Bases',        cat: 'numth' },

  // Algebra
  { id: 'indices',      label: 'Indices',             cat: 'alg' },
  { id: 'surds',        label: 'Surds',               cat: 'alg' },
  { id: 'stdform',      label: 'Standard Form',       cat: 'alg' },
  { id: 'log',          label: 'Logarithms',          cat: 'alg' },
  { id: 'sqrt',         label: 'Square Root',         cat: 'alg' },
  { id: 'quadratic',    label: 'Quadratic (eval)',    cat: 'alg' },
  { id: 'funceval',     label: 'Functions',           cat: 'alg' },
  { id: 'polymul',      label: 'Poly Multiply',       cat: 'alg' },
  { id: 'polyfactor',   label: 'Poly Factor',         cat: 'alg' },
  { id: 'qformula',     label: 'Quadratic Formula',   cat: 'alg' },
  { id: 'simul',        label: 'Simultaneous Eq.',    cat: 'alg' },
  { id: 'ineq',         label: 'Inequalities',        cat: 'alg' },
  { id: 'sequences',    label: 'Sequences',           cat: 'alg' },
  { id: 'variation',    label: 'Variation',            cat: 'alg' },
  { id: 'binomial',     label: 'Binomial Theorem',    cat: 'alg' },
  { id: 'complex',      label: 'Complex Numbers',     cat: 'alg' },
  { id: 'bounds',       label: 'Bounds',              cat: 'alg' },
  { id: 'lineareq',     label: 'Linear Equations',    cat: 'alg' },
  { id: 'linprog',      label: 'Linear Programming',  cat: 'alg' },
  { id: 'remfactor',    label: 'Remainder Theorem',   cat: 'alg' },

  // Geometry
  { id: 'angles',       label: 'Angles',              cat: 'geom' },
  { id: 'triangles',    label: 'Triangles',           cat: 'geom' },
  { id: 'polygons',     label: 'Polygons',            cat: 'geom' },
  { id: 'congruence',   label: 'Congruence',          cat: 'geom' },
  { id: 'similarity',   label: 'Similarity',          cat: 'geom' },
  { id: 'pythag',       label: "Pythagoras' Theorem", cat: 'geom' },
  { id: 'circleth',     label: 'Circle Theorems',     cat: 'geom' },
  { id: 'mensur',       label: 'Mensuration',         cat: 'geom' },
  { id: 'transform',    label: 'Transformations',     cat: 'geom' },
  { id: 'bearings',     label: 'Bearings',            cat: 'geom' },
  { id: 'coordgeom',    label: 'Coord. Geometry',     cat: 'geom' },
  { id: 'lineq',        label: 'Line Equation',       cat: 'geom' },
  { id: 'trig',         label: 'Trigonometry',        cat: 'geom' },
  { id: 'invtrig',      label: 'Inverse Trig',        cat: 'geom' },
  { id: 'heron',        label: "Heron's Formula",     cat: 'geom' },
  { id: 'section',      label: 'Section Formula',     cat: 'geom' },
  { id: 'circmeasure',  label: 'Circular Measure',    cat: 'geom' },
  { id: 'conics',       label: 'Conic Sections',      cat: 'geom' },

  // Calculus
  { id: 'diff',         label: 'Differentiation',     cat: 'calc' },
  { id: 'integ',        label: 'Integration',         cat: 'calc' },
  { id: 'limits',       label: 'Limits',              cat: 'calc' },
  { id: 'diffeq',       label: 'Differential Eq.',    cat: 'calc' },

  // Stats & Probability
  { id: 'stats',        label: 'Statistics',           cat: 'stats' },
  { id: 'prob',         label: 'Probability',          cat: 'stats' },
  { id: 'sets',         label: 'Sets',                 cat: 'stats' },
  { id: 'permcomb',     label: 'Perm. & Comb.',        cat: 'stats' },

  // Vectors & Matrices
  { id: 'vectors',      label: 'Vectors',              cat: 'vecmat' },
  { id: 'dotprod',      label: 'Dot Products',         cat: 'vecmat' },
  { id: 'matrix',       label: 'Matrices',             cat: 'vecmat' },

  // Other
  { id: 'gk',           label: 'General Knowledge',    cat: 'other' },
  { id: 'vocab',        label: 'Vocabulary',            cat: 'other' },
  { id: 'spot',         label: 'Twin Hunt',             cat: 'other' },
]

// ─── EDGES — directed: [prerequisite, dependent] ─────────────────────────
// "You should know A before attempting B"
const edges = [
  // Arithmetic chain
  ['basicarith', 'addition'],
  ['basicarith', 'multiply'],
  ['basicarith', 'rounding'],
  ['multiply',   'squaring'],
  ['addition',   'squaring'],
  ['multiply',   'fractionadd'],
  ['fractionadd','percent'],
  ['percent',    'profitloss'],
  ['ratio',      'percent'],
  ['basicarith', 'ratio'],
  ['multiply',   'sdt'],
  ['ratio',      'sdt'],

  // Number theory
  ['multiply',    'hcflcm'],
  ['hcflcm',      'primefactor'],
  ['basicarith',  'bases'],

  // Algebra: indices → surds → logs
  ['multiply',   'indices'],
  ['indices',    'surds'],
  ['indices',    'log'],
  ['indices',    'stdform'],
  ['multiply',   'sqrt'],
  ['squaring',   'sqrt'],

  // Algebra: polynomials & equations
  ['basicarith', 'funceval'],
  ['multiply',   'quadratic'],
  ['indices',    'quadratic'],
  ['multiply',   'polymul'],
  ['indices',    'polymul'],
  ['polymul',    'polyfactor'],
  ['polyfactor', 'qformula'],
  ['sqrt',       'qformula'],
  ['basicarith', 'simul'],
  ['funceval',   'simul'],
  ['basicarith', 'ineq'],
  ['polyfactor', 'ineq'],
  ['basicarith', 'sequences'],
  ['multiply',   'sequences'],
  ['indices',    'sequences'],
  ['ratio',      'variation'],
  ['indices',    'variation'],
  ['indices',    'binomial'],
  ['polymul',    'binomial'],
  ['sqrt',       'complex'],
  ['qformula',   'complex'],
  ['rounding',   'bounds'],

  // Geometry
  ['basicarith', 'angles'],
  ['angles',     'triangles'],
  ['angles',     'polygons'],
  ['triangles',  'polygons'],
  ['triangles',  'congruence'],
  ['triangles',  'similarity'],
  ['ratio',      'similarity'],
  ['triangles',  'pythag'],
  ['squaring',   'pythag'],
  ['angles',     'circleth'],
  ['triangles',  'circleth'],
  ['multiply',   'mensur'],
  ['squaring',   'mensur'],
  ['polygons',   'mensur'],
  ['angles',     'transform'],
  ['coordgeom',  'transform'],
  ['angles',     'bearings'],
  ['basicarith', 'coordgeom'],
  ['pythag',     'coordgeom'],
  ['coordgeom',  'lineq'],
  ['fractionadd','lineq'],
  ['pythag',     'trig'],
  ['angles',     'trig'],
  ['ratio',      'trig'],

  // Calculus
  ['indices',    'diff'],
  ['polymul',    'diff'],
  ['quadratic',  'diff'],
  ['diff',       'integ'],

  // Stats & Probability
  ['basicarith', 'stats'],
  ['fractionadd','prob'],
  ['basicarith', 'prob'],
  ['basicarith', 'sets'],

  // Vectors & Matrices
  ['basicarith', 'vectors'],
  ['vectors',    'dotprod'],
  ['multiply',   'matrix'],
  ['basicarith', 'matrix'],
  ['matrix',     'dotprod'],

  // New edges
  ['basicarith', 'decimals'],
  ['basicarith', 'lineareq'],
  ['lineareq',   'simul'],
  ['basicarith', 'shares'],
  ['basicarith', 'banking'],
  ['percent',    'gst'],
  ['percent',    'shares'],
  ['percent',    'banking'],
  ['basicarith', 'permcomb'],
  ['sequences',  'limits'],
  ['limits',     'diff'],
  ['trig',       'invtrig'],
  ['trig',       'circmeasure'],
  ['coordgeom',  'section'],
  ['coordgeom',  'conics'],
  ['polyfactor', 'remfactor'],
  ['polymul',    'remfactor'],
  ['pythag',     'heron'],
  ['triangles',  'heron'],
  ['mensur',     'heron'],
  ['lineareq',   'linprog'],
  ['ineq',       'linprog'],
  ['diff',       'diffeq'],
  ['integ',      'diffeq'],
]

// ─── Precomputed lookup maps ─────────────────────────────────────────────

const nodeMap = {}
nodes.forEach(n => { nodeMap[n.id] = n })

// predecessors[topic] = Set of direct prerequisite topic keys
const predecessors = {}
nodes.forEach(n => { predecessors[n.id] = new Set() })
edges.forEach(([src, tgt]) => {
  if (predecessors[tgt]) predecessors[tgt].add(src)
})

// successors[topic] = Set of topic keys this topic directly unlocks
const successors = {}
nodes.forEach(n => { successors[n.id] = new Set() })
edges.forEach(([src, tgt]) => {
  if (successors[src]) successors[src].add(tgt)
})

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Get direct prerequisites for a topic.
 * @param {string} topicKey — e.g. 'trig'
 * @returns {string[]} — e.g. ['pythag', 'angles', 'ratio']
 */
export function getPrerequisites(topicKey) {
  return predecessors[topicKey] ? [...predecessors[topicKey]] : []
}

/**
 * Get the human-readable label for a topic key.
 * @param {string} topicKey — e.g. 'trig'
 * @returns {string} — e.g. 'Trigonometry'
 */
export function getTopicLabel(topicKey) {
  return nodeMap[topicKey]?.label || topicKey
}

/**
 * Map a topic key to its API path for fetching questions.
 * Most topics use `<key>-api`, but some are special.
 */
const API_OVERRIDES = {
  spot: 'twinhunt-api',
  lineareq: 'lineareq-api',
}

export function getTopicApiPath(topicKey) {
  return API_OVERRIDES[topicKey] || `${topicKey}-api`
}

// Reverse of getTopicApiPath: API path segment (e.g. "circle", "twinhunt")
// -> topic key (e.g. "circleth", "spot"). Built lazily once. Anything that
// naively does `apiPath.replace('-api', '')` instead of this will silently
// break for the topics in API_OVERRIDES above, since their apiPath segment
// doesn't match their topic key.
let apiSegmentToTopic = null
export function getTopicIdFromApiPath(apiPath) {
  if (!apiSegmentToTopic) {
    apiSegmentToTopic = {}
    getAllTopicKeys().forEach((key) => {
      const segment = getTopicApiPath(key).replace(/-api$/, '')
      apiSegmentToTopic[segment] = key
    })
  }
  const segment = (apiPath || '').replace(/-api$/, '')
  return apiSegmentToTopic[segment] || segment
}

/**
 * Check if a topic has any prerequisites at all.
 */
export function hasPrerequisites(topicKey) {
  return getPrerequisites(topicKey).length > 0
}

/**
 * Get the topics that directly become available once this topic is done.
 * @param {string} topicKey — e.g. 'ratio'
 * @returns {string[]} — e.g. ['percent', 'sdt', 'similarity', 'trig']
 */
export function getUnlocks(topicKey) {
  return successors[topicKey] ? [...successors[topicKey]] : []
}

/**
 * Get all available topic keys.
 */
export function getAllTopicKeys() {
  return nodes.map(n => n.id)
}

/**
 * Get category for a topic.
 */
export function getTopicCategory(topicKey) {
  return nodeMap[topicKey]?.cat || 'other'
}

/**
 * Goal-directed path: given a destination topic and a student's mastered
 * set, compute exactly what's left between "what they already know" and
 * that goal — not a single linear chain (the graph is a DAG, a topic can
 * have several prerequisite branches), but the full set of not-yet-mastered
 * ancestors, topologically ordered into one valid learning sequence so a
 * student can just work top to bottom.
 *
 * Already-mastered ancestors are included too (marked `mastered: true`),
 * so the checklist reads as "your whole path," not just the remaining gap
 * — the point is to show how far they've already come, not just what's left.
 *
 * @param {string} goalId
 * @param {Set<string>} masteredSet
 * @returns {{ steps: Array<{id:string,label:string,mastered:boolean}>, remaining: number, alreadyThere: boolean }}
 */
export function computeGoalPath(goalId, masteredSet) {
  const mastered = masteredSet || new Set()

  // Full ancestor closure of the goal (including the goal itself).
  const closure = new Set()
  const stack = [goalId]
  while (stack.length) {
    const cur = stack.pop()
    if (closure.has(cur)) continue
    closure.add(cur)
    for (const p of getPrerequisites(cur)) stack.push(p)
  }

  // Topological order via longest-chain depth, same technique used for the
  // map's column layout — ties broken alphabetically for a stable order.
  const depthCache = {}
  function depthOf(id) {
    if (depthCache[id] !== undefined) return depthCache[id]
    depthCache[id] = 0
    const prereqs = getPrerequisites(id).filter((p) => closure.has(p))
    const d = prereqs.length === 0 ? 0 : 1 + Math.max(...prereqs.map(depthOf))
    depthCache[id] = d
    return d
  }
  const ordered = [...closure].sort((a, b) => depthOf(a) - depthOf(b) || getTopicLabel(a).localeCompare(getTopicLabel(b)))

  const steps = ordered.map((id) => ({ id, label: getTopicLabel(id), mastered: mastered.has(id) }))
  const remaining = steps.filter((s) => !s.mastered).length

  return { steps, remaining, alreadyThere: remaining === 0 }
}
