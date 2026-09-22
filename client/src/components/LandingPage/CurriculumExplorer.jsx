import React, { useState } from 'react';

const CATEGORIES = [
  {
    id: 'numbers',
    name: '🔢 Number Foundations',
    topics: [
      { key: 'addition', name: 'Addition', sub: '20-question mental addition' },
      { key: 'multiply', name: 'Multiplication Tables', sub: 'Adaptive times table drills (2–19)' },
      { key: 'fractionadd', name: 'Fractions', sub: 'Add, subtract, multiply & divide' },
      { key: 'decimals', name: 'Decimals', sub: 'Decimal place value & operations' },
      { key: 'hcflcm', name: 'HCF & LCM', sub: 'Prime factorization & multiples' },
      { key: 'primefactor', name: 'Prime Factors', sub: 'Factor trees & factor decomposition' },
      { key: 'column-addition', name: 'Column Addition', sub: 'Step-by-step carry tracking' },
      { key: 'bases', name: 'Number Bases', sub: 'Binary, octal, hexadecimal conversion' },
    ],
  },
  {
    id: 'shape',
    name: '📐 Shape & Space',
    topics: [
      { key: 'angles', name: 'Angles', sub: 'Parallel lines, transversals & interior sum' },
      { key: 'pythag', name: "Pythagoras' Theorem", sub: '2D & 3D right-angled triangle solving' },
      { key: 'triangles', name: 'Triangles', sub: 'Isosceles, equilateral & exterior angles' },
      { key: 'coordgeom', name: 'Coordinate Geometry', sub: 'Midpoint, slope, distance & lines' },
      { key: 'circleth', name: 'Circle Theorems', sub: 'Cyclic quads, tangents & chords' },
      { key: 'mensur', name: 'Mensuration', sub: 'Surface areas and volumes of prisms & cones' },
      { key: 'bearings', name: 'Bearings', sub: 'Three-figure navigation bearings' },
      { key: 'similarity', name: 'Similarity', sub: 'Scale factors & volume/area ratios' },
    ],
  },
  {
    id: 'algebra',
    name: '🔣 Algebra',
    topics: [
      { key: 'lineareq', name: 'Linear Equations', sub: 'One-variable balance & isolation' },
      { key: 'quadratic', name: 'Quadratic Substitution', sub: 'Evaluate ax² + bx + c' },
      { key: 'qformula', name: 'Quadratic Formula', sub: 'Roots of second-degree polynomials' },
      { key: 'simul', name: 'Simultaneous Equations', sub: '2×2 and 3×3 systems of equations' },
      { key: 'polymul', name: 'Polynomial Multiplication', sub: 'FOIL & monomial distribution' },
      { key: 'indices', name: 'Indices & Exponents', sub: 'Fractional & negative exponent laws' },
      { key: 'log', name: 'Logarithms', sub: 'Laws of logs, change of base & equations' },
      { key: 'ineq', name: 'Inequalities', sub: 'Linear and quadratic solution sets' },
    ],
  },
  {
    id: 'everyday',
    name: '🛒 Everyday Maths & Finance',
    topics: [
      { key: 'percent', name: 'Percentages', sub: 'Discounts, reverse percent & compounding' },
      { key: 'profitloss', name: 'Profit & Loss', sub: 'Markup, cost price & margins' },
      { key: 'ratio', name: 'Ratio & Proportion', sub: 'Sharing quantities & unitary method' },
      { key: 'sdt', name: 'Speed, Distance, Time', sub: 'Rate calculations & unit conversions' },
      { key: 'banking', name: 'Banking (RD)', sub: 'Recurring deposit & interest calculations' },
      { key: 'gst', name: 'Goods & Services Tax', sub: 'CGST, SGST and tax invoice problems' },
    ],
  },
  {
    id: 'calculus',
    name: '📈 Calculus & Advanced',
    topics: [
      { key: 'diff', name: 'Differentiation', sub: 'Power rule, tangents & turning points' },
      { key: 'integ', name: 'Integration', sub: 'Definite integrals & area under curves' },
      { key: 'limits', name: 'Limits', sub: 'Evaluation of algebraic & trig limits' },
      { key: 'diffeq', name: 'Differential Equations', sub: 'Separation of variables & solutions' },
      { key: 'complex', name: 'Complex Numbers', sub: 'Argand diagram, modulus & arithmetic' },
      { key: 'linprog', name: 'Linear Programming', sub: 'Constraints & objective optimization' },
    ],
  },
  {
    id: 'games',
    name: '🎲 Games & Reasoning',
    topics: [
      { key: 'battle', name: '⚔️ Battle Arena', sub: 'Real-time 1v1 multiplayer duels' },
      { key: 'detective', name: '🔍 Detective Agency', sub: 'Narrative math mysteries & case files' },
      { key: 'sudoku', name: 'Sudoku Puzzle', sub: '9×9 logical grid solving' },
      { key: 'riddle', name: '🧩 Math Riddles', sub: 'Discover hidden arithmetic rules' },
      { key: 'spot', name: 'Twin Hunt', sub: 'Visual spot-the-common-object game' },
      { key: 'carjourney', name: 'The Car Journey', sub: '16-stop progressive math odyssey' },
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
          <span>View All 90+ Topics in Interactive Grid</span>
          <span aria-hidden="true">➔</span>
        </button>
      </div>
    </section>
  );
}
