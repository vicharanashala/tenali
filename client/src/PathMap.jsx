/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useMemo } from 'react';

// ── Graph Nodes ─────────────────────────────────────────────────────────────
export const PATHMAP_NODES = [
  { id: 'basicarith',   label: 'Basic Arithmetic',   sub: '+, −, ×  single→4-digit',         cat: 'Arithmetic' },
  { id: 'addition',     label: 'Addition',            sub: 'Multi-digit addition drill',       cat: 'Arithmetic' },
  { id: 'multiply',     label: 'Multiplication',      sub: 'Times tables 2-19',                cat: 'Arithmetic' },
  { id: 'rounding',     label: 'Rounding',            sub: 'D.P., sig. figs, estimation',      cat: 'Arithmetic' },
  { id: 'fractionadd',  label: 'Fractions (Add)',     sub: 'LCD, mixed numbers',               cat: 'Arithmetic' },
  { id: 'percent',      label: 'Percentages',         sub: 'Find %, increase, reverse',        cat: 'Arithmetic' },
  { id: 'profitloss',   label: 'Profit & Loss',       sub: 'CP, SP, discounts, markup',        cat: 'Arithmetic' },
  { id: 'ratio',        label: 'Ratio',               sub: 'Simplify, divide, proportion',     cat: 'Arithmetic' },
  { id: 'sdt',          label: 'Speed / Dist / Time', sub: 'd=st, average speed, units',       cat: 'Arithmetic' },
  { id: 'squaring',     label: 'Squaring',            sub: '(a+b)² identity drill',            cat: 'Arithmetic' },
  { id: 'hcflcm',       label: 'HCF & LCM',          sub: 'Euclidean algorithm, word probs',  cat: 'Number Theory' },
  { id: 'primefactor',  label: 'Prime Factors',       sub: 'Prime decomposition',              cat: 'Number Theory' },
  { id: 'bases',        label: 'Number Bases',        sub: 'Binary, hex, conversions',         cat: 'Number Theory' },
  { id: 'indices',      label: 'Indices',             sub: 'Laws, negative, fractional exp',   cat: 'Algebra' },
  { id: 'surds',        label: 'Surds',               sub: 'Simplify, add, rationalise',       cat: 'Algebra' },
  { id: 'stdform',      label: 'Standard Form',       sub: 'Scientific notation ops',          cat: 'Algebra' },
  { id: 'log',          label: 'Logarithms',          sub: 'Evaluate, laws, solve equations',  cat: 'Algebra' },
  { id: 'sqrt',         label: 'Square Root',         sub: 'Nearest-integer √ drill',          cat: 'Algebra' },
  { id: 'quadratic',    label: 'Quadratic (eval)',    sub: 'y = ax²+bx+c  substitution',      cat: 'Algebra' },
  { id: 'funceval',     label: 'Functions',           sub: 'Evaluate f(x), f(x,y), f(x,y,z)', cat: 'Algebra' },
  { id: 'polymul',      label: 'Poly Multiply',       sub: 'Expand products of polys',         cat: 'Algebra' },
  { id: 'polyfactor',   label: 'Poly Factor',         sub: 'Factorise quadratics',             cat: 'Algebra' },
  { id: 'qformula',     label: 'Quadratic Formula',   sub: 'Find roots of ax²+bx+c = 0',      cat: 'Algebra' },
  { id: 'simul',        label: 'Simultaneous Eq.',    sub: '2×2 and 3×3 linear systems',       cat: 'Algebra' },
  { id: 'ineq',         label: 'Inequalities',        sub: 'Linear & quadratic inequalities',  cat: 'Algebra' },
  { id: 'sequences',    label: 'Sequences',           sub: 'AP & GP: nth term, sum',           cat: 'Algebra' },
  { id: 'variation',    label: 'Variation',            sub: 'Direct & inverse proportion',      cat: 'Algebra' },
  { id: 'binomial',     label: 'Binomial Theorem',    sub: 'nCr, expansion, coefficients',     cat: 'Algebra' },
  { id: 'complex',      label: 'Complex Numbers',     sub: 'Add, multiply, modulus',           cat: 'Algebra' },
  { id: 'bounds',       label: 'Bounds',              sub: 'Error intervals, propagation',     cat: 'Algebra' },
  { id: 'angles',       label: 'Angles',              sub: 'Straight line, point, parallel',   cat: 'Geometry' },
  { id: 'triangles',    label: 'Triangles',           sub: 'Angle sum, isosceles, exterior',   cat: 'Geometry' },
  { id: 'polygons',     label: 'Polygons',            sub: 'Interior / exterior angles',       cat: 'Geometry' },
  { id: 'congruence',   label: 'Congruence',          sub: 'SSS, SAS, ASA conditions',         cat: 'Geometry' },
  { id: 'similarity',   label: 'Similarity',          sub: 'Scale factor, area/vol ratios',    cat: 'Geometry' },
  { id: 'pythag',       label: "Pythagoras' Theorem", sub: 'Hypotenuse, legs, 3D',             cat: 'Geometry' },
  { id: 'circleth',     label: 'Circle Theorems',     sub: 'Semicircle, cyclic quad, tangent', cat: 'Geometry' },
  { id: 'mensur',       label: 'Mensuration',         sub: 'Area, perimeter, volume, SA',      cat: 'Geometry' },
  { id: 'transform',    label: 'Transformations',     sub: 'Reflect, rotate, translate',       cat: 'Geometry' },
  { id: 'bearings',     label: 'Bearings',            sub: '3-figure bearings, back bearing',  cat: 'Geometry' },
  { id: 'coordgeom',    label: 'Coord. Geometry',     sub: 'Midpoint, distance, gradient',     cat: 'Geometry' },
  { id: 'lineq',        label: 'Line Equation',       sub: 'y = mx + c from two points',       cat: 'Geometry' },
  { id: 'trig',         label: 'Trigonometry',        sub: 'SOH-CAH-TOA, sine/cosine rule',   cat: 'Geometry' },
  { id: 'diff',         label: 'Differentiation',     sub: 'Power rule, turning points',       cat: 'Calculus' },
  { id: 'integ',        label: 'Integration',         sub: 'Antiderivatives, definite integral', cat: 'Calculus' },
  { id: 'stats',        label: 'Statistics',           sub: 'Mean, median, mode, range',        cat: 'Statistics' },
  { id: 'prob',         label: 'Probability',          sub: 'Simple, combined, conditional',    cat: 'Statistics' },
  { id: 'sets',         label: 'Sets',                 sub: 'Union, intersection, Venn',        cat: 'Statistics' },
  { id: 'vectors',      label: 'Vectors',              sub: 'Add, scale, magnitude',            cat: 'Vectors & Matrices' },
  { id: 'dotprod',      label: 'Dot Products',         sub: 'Dot product, matrix multiply',     cat: 'Vectors & Matrices' },
  { id: 'matrix',       label: 'Matrices',             sub: 'Add, scalar ×, det, multiply',     cat: 'Vectors & Matrices' },
  { id: 'lineareq',     label: 'Linear Equations',     sub: 'Solve ax + b = c',                 cat: 'Algebra' },
  { id: 'decimals',     label: 'Decimals',             sub: '+, −, ×, ÷ with decimal places',   cat: 'Arithmetic' },
  { id: 'permcomb',     label: 'Perm. & Comb.',        sub: 'nPr, nCr, counting principles',    cat: 'Statistics' },
  { id: 'limits',       label: 'Limits',               sub: 'Limits at a point, infinity',      cat: 'Calculus' },
  { id: 'invtrig',      label: 'Inverse Trig',         sub: 'arcsin, arccos, arctan',           cat: 'Geometry' },
  { id: 'remfactor',    label: 'Remainder Theorem',    sub: 'Polynomial division, roots',       cat: 'Algebra' },
  { id: 'heron',        label: "Heron's Formula",      sub: 'Area from three sides',            cat: 'Geometry' },
  { id: 'shares',       label: 'Shares & Dividends',   sub: 'Stock, dividends, returns',        cat: 'Arithmetic' },
  { id: 'banking',      label: 'Banking (RD)',         sub: 'Recurring deposits, interest',     cat: 'Arithmetic' },
  { id: 'gst',          label: 'GST',                  sub: 'Goods and Services Tax',           cat: 'Arithmetic' },
  { id: 'section',      label: 'Section Formula',      sub: 'Internal & external division',     cat: 'Geometry' },
  { id: 'linprog',      label: 'Linear Programming',   sub: 'Optimise linear objective',        cat: 'Algebra' },
  { id: 'circmeasure',  label: 'Circular Measure',     sub: 'Radians, arc length, area',        cat: 'Geometry' },
  { id: 'conics',       label: 'Conic Sections',       sub: 'Circle, parabola, ellipse',        cat: 'Geometry' },
  { id: 'diffeq',       label: 'Differential Eq.',     sub: 'Solve dy/dx = f(x)',               cat: 'Calculus' }
];

// ── Graph Edges ─────────────────────────────────────────────────────────────
export const PATHMAP_EDGES = [
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
  ['multiply',   'hcflcm'],
  ['hcflcm',     'primefactor'],
  ['basicarith', 'bases'],
  ['multiply',   'indices'],
  ['indices',    'surds'],
  ['indices',    'log'],
  ['indices',    'stdform'],
  ['multiply',   'sqrt'],
  ['squaring',   'sqrt'],
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
  ['indices',    'diff'],
  ['polymul',    'diff'],
  ['quadratic',  'diff'],
  ['diff',       'integ'],
  ['basicarith', 'stats'],
  ['fractionadd','prob'],
  ['basicarith', 'prob'],
  ['basicarith', 'sets'],
  ['basicarith', 'vectors'],
  ['vectors',    'dotprod'],
  ['multiply',   'matrix'],
  ['basicarith', 'matrix'],
  ['matrix',     'dotprod'],
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
];

// Build adjacency map & parent prerequisites
const adj = {};
const prereqs = {};

PATHMAP_NODES.forEach(n => {
  adj[n.id] = [];
  prereqs[n.id] = [];
});

PATHMAP_EDGES.forEach(([u, v]) => {
  if (adj[u]) adj[u].push(v);
  if (prereqs[v]) prereqs[v].push(u);
});

// Helper: BFS shortest path
export function findShortestPath(startId, targetId) {
  if (!startId || !targetId) return [];
  if (startId === targetId) return [startId];

  const queue = [[startId]];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const path = queue.shift();
    const curr = path[path.length - 1];

    if (curr === targetId) return path;

    const neighbors = adj[curr] || [];
    for (const next of neighbors) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push([...path, next]);
      }
    }
  }

  return [startId, targetId];
}

// Helper: Check if all prerequisites of a node are completed
export function isNodeUnlocked(nodeId, completedSet) {
  const parents = prereqs[nodeId] || [];
  if (parents.length === 0) return true; // root topic
  return parents.some(p => completedSet.has(p));
}

// Helper: Recommend next topic
export function getRecommendedNextTopic(targetGoal, completedTopicsArray = []) {
  const completedSet = new Set(completedTopicsArray);
  
  if (!targetGoal) targetGoal = 'diff';

  // Find shortest path from basicarith to targetGoal
  const path = findShortestPath('basicarith', targetGoal);
  
  for (const topicId of path) {
    if (!completedSet.has(topicId)) {
      return PATHMAP_NODES.find(n => n.id === topicId) || PATHMAP_NODES[0];
    }
  }

  // If target path is completed, suggest first uncompleted unlocked node
  const uncompletedUnlocked = PATHMAP_NODES.find(n => !completedSet.has(n.id) && isNodeUnlocked(n.id, completedSet));
  if (uncompletedUnlocked) return uncompletedUnlocked;

  return PATHMAP_NODES.find(n => n.id === targetGoal) || PATHMAP_NODES[0];
}

// ── PmGoalModal ─────────────────────────────────────────────────────────────
export function PmGoalModal({ isOpen, onClose, currentGoal, onSelectGoal }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: 'var(--clr-surface, #1e202e)', border: '1px solid var(--clr-border, #2d3045)',
        borderRadius: '16px', maxWidth: '520px', width: '100%', maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--clr-border, #2d3045)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--clr-text, #fff)' }}>🎯 Select Learning Target</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--clr-dim, #888)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {PATHMAP_NODES.map(node => {
            const isSelected = node.id === currentGoal;
            return (
              <button
                key={node.id}
                onClick={() => { onSelectGoal(node.id); onClose(); }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', borderRadius: '10px',
                  background: isSelected ? 'rgba(249,115,22,0.15)' : 'var(--clr-card-bg, #161824)',
                  border: `1px solid ${isSelected ? 'var(--clr-accent, #f97316)' : 'var(--clr-border, #2d3045)'}`,
                  color: 'var(--clr-text, #fff)', cursor: 'pointer', textAlign: 'left'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{node.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--clr-dim, #888)' }}>{node.sub}</div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', color: 'var(--clr-accent, #f97316)' }}>
                  {node.cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── PmQuestBanner ───────────────────────────────────────────────────────────
export function PmQuestBanner({ currentGoal, completedTopics = [], onOpenGoalModal }) {
  const goalNode = PATHMAP_NODES.find(n => n.id === currentGoal) || PATHMAP_NODES.find(n => n.id === 'diff');
  const path = findShortestPath('basicarith', goalNode.id);
  const completedSet = new Set(completedTopics);
  const completedInPath = path.filter(id => completedSet.has(id)).length;
  const pct = path.length > 0 ? Math.round((completedInPath / path.length) * 100) : 0;
  const nextTopic = getRecommendedNextTopic(goalNode.id, completedTopics);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(99,102,241,0.12))',
      border: '1px solid rgba(249,115,22,0.3)', borderRadius: '14px', padding: '16px 20px',
      margin: '0 0 20px 0', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>📍</span>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--clr-text, #fff)' }}>
            Target: {goalNode.label}
          </span>
          <button
            onClick={onOpenGoalModal}
            style={{
              padding: '2px 10px', fontSize: '0.75rem', borderRadius: '999px',
              background: 'var(--clr-accent, #f97316)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600
            }}
          >
            Change Goal
          </button>
        </div>
        <div style={{ fontSize: '0.84rem', color: 'var(--clr-dim, #aaa)' }}>
          Path Progress: {completedInPath} / {path.length} steps ({pct}%)
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--clr-dim, #888)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Next Up</div>
          <div style={{ fontWeight: 600, color: 'var(--clr-accent, #f97316)', fontSize: '0.95rem' }}>{nextTopic.label}</div>
        </div>
        <div style={{
          width: '42px', height: '42px', borderRadius: '50%', background: 'var(--clr-accent-soft, rgba(249,115,22,0.2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
        }}>
          🎯
        </div>
      </div>
    </div>
  );
}

// ── PmHomeSection ───────────────────────────────────────────────────────────
export function PmHomeSection({ currentGoal, completedTopics = [], onSelectTopic }) {
  const nextTopic = getRecommendedNextTopic(currentGoal, completedTopics);

  return (
    <div style={{
      background: 'var(--clr-card-bg, #161824)', border: '1px solid var(--clr-border, #2d3045)',
      borderRadius: '16px', padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.3rem' }}>🗺️</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--clr-text, #fff)' }}>Personalized Recommendation</h3>
        </div>
        <button
          onClick={() => onSelectTopic('pathmap')}
          style={{ background: 'transparent', border: '1px solid var(--clr-accent, #f97316)', color: 'var(--clr-accent, #f97316)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
        >
          View Full Map ➔
        </button>
      </div>

      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--clr-dim, #aaa)' }}>
        Based on your current topic mastery and prerequisites, your optimal next step toward target mastery is:
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--clr-border, #2d3045)',
        borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--clr-text, #fff)' }}>{nextTopic.label}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-dim, #888)' }}>{nextTopic.sub}</div>
        </div>
        <button
          onClick={() => onSelectTopic(nextTopic.id)}
          style={{
            background: 'var(--clr-accent, #f97316)', border: 'none', color: '#fff',
            padding: '8px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(249,115,22,0.3)'
          }}
        >
          Start Practice ▶
        </button>
      </div>
    </div>
  );
}

// ── PmSuggestIcon ───────────────────────────────────────────────────────────
export function PmSuggestIcon({ currentGoal, completedTopics = [], onSelectTopic }) {
  const nextTopic = getRecommendedNextTopic(currentGoal, completedTopics);

  return (
    <button
      onClick={() => onSelectTopic(nextTopic.id)}
      title={`Recommended next topic: ${nextTopic.label}`}
      style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 900,
        background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff',
        border: 'none', borderRadius: '999px', padding: '10px 18px',
        display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700,
        fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
        transition: 'transform 0.2s'
      }}
    >
      <span>🎯 Next:</span>
      <span>{nextTopic.label}</span>
    </button>
  );
}

// ── PathMap Main Component ──────────────────────────────────────────────────
export default function PathMap({ onBack, onSelectTopic, completedTopics = [] }) {
  const [targetGoal, setTargetGoal] = useState(() => localStorage.getItem('tenali-target-goal') || 'diff');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tenali-target-goal', targetGoal);
  }, [targetGoal]);

  const completedSet = useMemo(() => new Set(completedTopics), [completedTopics]);
  const shortestPath = useMemo(() => findShortestPath('basicarith', targetGoal), [targetGoal]);

  return (
    <div className="pathmap-container" style={{ padding: '24px 16px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--clr-text, #fff)' }}>📍 Personalized Learning Roadmap</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--clr-dim, #aaa)' }}>
            Dependency-aware prerequisite path generated for your target learning goal.
          </p>
        </div>
        <button
          onClick={onBack}
          style={{ background: 'transparent', border: '1px solid var(--clr-border, #3a3d4a)', color: 'var(--clr-text, #fff)', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer' }}
        >
          Back
        </button>
      </div>

      {/* Quest Banner */}
      <PmQuestBanner
        currentGoal={targetGoal}
        completedTopics={completedTopics}
        onOpenGoalModal={() => setIsModalOpen(true)}
      />

      {/* Path Sequence Nodes */}
      <h3 style={{ fontSize: '1.1rem', margin: '24px 0 12px 0', color: 'var(--clr-text, #fff)' }}>
        Recommended Step-by-Step Path
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {shortestPath.map((stepId, idx) => {
          const node = PATHMAP_NODES.find(n => n.id === stepId);
          if (!node) return null;

          const isDone = completedSet.has(stepId);
          const isTarget = stepId === targetGoal;
          const isUnlocked = isNodeUnlocked(stepId, completedSet);
          const isNext = !isDone && isUnlocked;

          let statusBadge = '🔒 Locked';
          let borderClr = 'var(--clr-border, #2d3045)';
          let bgClr = 'var(--clr-card-bg, #161824)';

          if (isDone) {
            statusBadge = '✅ Mastered';
            borderClr = 'var(--clr-correct, #2ea043)';
            bgClr = 'rgba(46,160,67,0.1)';
          } else if (isNext) {
            statusBadge = '🎯 Next Up';
            borderClr = 'var(--clr-accent, #f97316)';
            bgClr = 'rgba(249,115,22,0.12)';
          } else if (isUnlocked) {
            statusBadge = '🔓 Unlocked';
            borderClr = 'var(--clr-accent-soft, #6366f1)';
          }

          return (
            <div
              key={stepId}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderRadius: '12px', background: bgClr,
                border: `2px solid ${borderClr}`, transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem',
                  color: isDone ? 'var(--clr-correct, #2ea043)' : isNext ? 'var(--clr-accent, #f97316)' : 'var(--clr-text, #fff)'
                }}>
                  {idx + 1}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--clr-text, #fff)' }}>
                    {node.label} {isTarget && '🎯'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--clr-dim, #888)' }}>{node.sub}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: borderClr }}>{statusBadge}</span>
                <button
                  onClick={() => onSelectTopic(node.id)}
                  disabled={!isUnlocked && !isDone}
                  style={{
                    background: isNext ? 'var(--clr-accent, #f97316)' : 'transparent',
                    border: `1px solid ${isNext ? 'var(--clr-accent, #f97316)' : 'var(--clr-border, #3a3d4a)'}`,
                    color: isNext ? '#fff' : 'var(--clr-text, #fff)',
                    padding: '6px 14px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 600,
                    cursor: (isUnlocked || isDone) ? 'pointer' : 'not-allowed', opacity: (isUnlocked || isDone) ? 1 : 0.4
                  }}
                >
                  {isDone ? 'Review' : 'Practice'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal Modal */}
      <PmGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentGoal={targetGoal}
        onSelectGoal={(newGoal) => setTargetGoal(newGoal)}
      />
    </div>
  );
}
