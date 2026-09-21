import React, { useState } from 'react';

const CATEGORIES = [
  {
    id: 'numbers',
    name: '🔢 Number Foundations',
    topics: [
      { key: 'addition', name: 'Addition', sub: '20-question mental addition practice' },
      { key: 'multiply', name: 'Multiplication Tables', sub: 'Adaptive times table drills (2–19)' },
      { key: 'fractionadd', name: 'Fractions', sub: 'Add, subtract, multiply & divide' },
      { key: 'decimals', name: 'Decimals', sub: 'Decimal place value & arithmetic' },
      { key: 'hcflcm', name: 'HCF & LCM', sub: 'Highest common factors & multiples' },
      { key: 'primefactor', name: 'Prime Factors', sub: 'Break numbers into prime factors' },
      { key: 'rounding', name: 'Rounding & Estimation', sub: 'Decimal places, sig figs & bounds' },
      { key: 'bases', name: 'Number Bases', sub: 'Binary, decimal & hexadecimal conversion' },
    ],
  },
  {
    id: 'algebra',
    name: '🔣 Algebra & Polynomials',
    topics: [
      { key: 'lineareq', name: 'Linear Equations', sub: 'Solve for x in one variable' },
      { key: 'simul', name: 'Simultaneous Equations', sub: '2×2 and 3×3 systems of equations' },
      { key: 'quadratic', name: 'Quadratic Substitution', sub: 'Evaluate ax² + bx + c expressions' },
      { key: 'qformula', name: 'Quadratic Formula', sub: 'Find roots of ax² + bx + c = 0' },
      { key: 'polyfactor', name: 'Poly Factorization', sub: 'Factor quadratic expressions' },
      { key: 'polymul', name: 'Polynomial Multiplication', sub: 'Multiply two polynomial terms' },
      { key: 'indices', name: 'Indices & Exponents', sub: 'Laws of indices and powers' },
      { key: 'log', name: 'Logarithms', sub: 'Evaluate, simplify & solve logs' },
    ],
  },
  {
    id: 'shape',
    name: '📐 Shape, Space & Geometry',
    topics: [
      { key: 'angles', name: 'Angles', sub: 'Parallel lines, points & transversals' },
      { key: 'pythag', name: "Pythagoras' Theorem", sub: '2D & 3D right-angled triangle solving' },
      { key: 'triangles', name: 'Triangles', sub: 'Angle sum, isosceles & exterior angles' },
      { key: 'coordgeom', name: 'Coordinate Geometry', sub: 'Midpoint, distance, and gradient' },
      { key: 'circleth', name: 'Circle Theorems', sub: 'Angles, tangents & cyclic quadrilaterals' },
      { key: 'circmeasure', name: 'Circular Measure', sub: 'Radians, arc length & sector areas' },
      { key: 'mensur', name: 'Mensuration', sub: 'Surface areas and volumes of shapes' },
      { key: 'similarity', name: 'Similarity', sub: 'Scale factors & area/volume ratios' },
    ],
  },
  {
    id: 'commercial',
    name: '🛒 Everyday Maths & Finance',
    topics: [
      { key: 'percent', name: 'Percentages', sub: 'Discounts, reverse percent & compound' },
      { key: 'profitloss', name: 'Profit & Loss', sub: 'Cost price, markup & discounts' },
      { key: 'ratio', name: 'Ratio & Proportion', sub: 'Direct, inverse & sharing quantities' },
      { key: 'sdt', name: 'Speed, Distance, Time', sub: 'Rate problems & unit conversions' },
      { key: 'banking', name: 'Banking (RD)', sub: 'Recurring deposits & interest calculations' },
      { key: 'gst', name: 'Goods & Services Tax', sub: 'CGST, SGST and billing calculations' },
      { key: 'shares', name: 'Shares & Dividends', sub: 'Face value, market value & dividends' },
      { key: 'stats', name: 'Statistics', sub: 'Mean, median, mode & range' },
    ],
  },
  {
    id: 'calculus',
    name: '📈 Higher Maths & Calculus',
    topics: [
      { key: 'trig', name: 'Trigonometry', sub: 'SOH-CAH-TOA, sine & cosine rules' },
      { key: 'invtrig', name: 'Inverse Trig', sub: 'arcsin, arccos, and arctan' },
      { key: 'diff', name: 'Differentiation', sub: 'Power rule, gradients & turning points' },
      { key: 'integ', name: 'Integration', sub: 'Anti-derivatives & area under curves' },
      { key: 'limits', name: 'Limits', sub: 'Evaluate algebraic & trigonometric limits' },
      { key: 'diffeq', name: 'Differential Equations', sub: 'Order, degree & first-order solving' },
      { key: 'matrix', name: 'Matrices & Determinants', sub: 'Matrix arithmetic & 2×2 determinants' },
      { key: 'vectors', name: 'Vectors', sub: 'Vector addition, scaling & magnitude' },
    ],
  },
  {
    id: 'gym',
    name: '⚡ Adaptive Gym & Workouts',
    topics: [
      { key: 'gym', name: 'Adaptive Gym All-in-One', sub: 'Comprehensive workout across 7 gym modules' },
      { key: 'randommix', name: 'Random Mix', sub: 'Dynamic cross-topic adaptive challenge' },
      { key: 'custom', name: 'Custom Lesson', sub: 'Select custom topics to build your quiz' },
      { key: 'funcgym', name: 'Functions Gym', sub: 'Rapid polynomial evaluation (MCQ)' },
      { key: 'dotprodgym', name: 'Dot Products Gym', sub: '2D/3D dot products practice' },
      { key: 'fracaddgym', name: 'Fractions Gym', sub: 'Speed single-digit fraction additions' },
      { key: 'lineqgym', name: 'Linear Equations Gym', sub: 'Rapid 1-variable balance solving' },
      { key: 'indicesgym', name: 'Indices Gym', sub: 'Fast index law calculations' },
    ],
  },
];

export default function CurriculumExplorer({
  onSelectTopic = () => {},
  onExplorePuzzles = () => {},
}) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);

  const currentCategory =
    CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  return (
    <section id="curriculum" className="landing-section">
      <div className="section-header-center">
        <div className="section-tag">
          <span>📚 Curriculum Architecture</span>
        </div>
        <h2 className="section-title">Comprehensive Mathematical Coverage</h2>
        <p className="section-subtitle">
          Explore structured modules spanning elementary numeracy, secondary school geometry, Cambridge IGCSE topics, and advanced calculus.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="curriculum-tabs" role="tablist">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`curriculum-tab-btn ${
              activeCategory === cat.id ? 'active' : ''
            }`}
            onClick={() => setActiveCategory(cat.id)}
            role="tab"
            aria-selected={activeCategory === cat.id}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Topics Grid */}
      <div className="curriculum-grid">
        {currentCategory.topics.map((t) => (
          <div
            key={t.key}
            className="curriculum-card"
            onClick={() => onSelectTopic(t.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectTopic(t.key);
              }
            }}
          >
            <h4 className="curriculum-card-title">{t.name}</h4>
            <p className="curriculum-card-sub">{t.sub}</p>
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--clr-accent)',
                marginTop: 10,
                fontWeight: 600,
              }}
            >
              Launch Practice ➔
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Action */}
      <div className="curriculum-bottom-cta">
        <button
          type="button"
          className="hero-btn-primary"
          onClick={onExplorePuzzles}
        >
          <span>View All 40+ Topics in Interactive Grid</span>
          <span aria-hidden="true">➔</span>
        </button>
      </div>
    </section>
  );
}
