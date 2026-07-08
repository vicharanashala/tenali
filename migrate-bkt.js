const fs = require('fs');
const path = require('path');

const APP_JSX_PATH = path.join(__dirname, 'client/src/App.jsx');

console.log('Reading App.jsx...');
let content = fs.readFileSync(APP_JSX_PATH, 'utf8');

console.log('Injecting updateBKT function...');
const bktInjection = `
// ─────────────────────────────────────────────────────────────────────────────
// BAYESIAN KNOWLEDGE TRACING (BKT) ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function updateBKT(prior, correct, params = { pGuess: 0.2, pSlip: 0.1, pTransit: 0.3 }) {
  const { pGuess, pSlip, pTransit } = params;
  let pKnown;
  
  if (correct) {
    pKnown = (prior * (1 - pSlip)) / (prior * (1 - pSlip) + (1 - prior) * pGuess);
  } else {
    pKnown = (prior * pSlip) / (prior * pSlip + (1 - prior) * (1 - pGuess));
  }
  
  return pKnown + (1 - pKnown) * pTransit;
}

`;

// Find where to inject it. We'll put it right before adaptiveLevel.
content = content.replace(
  'function adaptiveLevel(score)',
  bktInjection + 'function adaptiveLevel(score)'
);

console.log('Rewriting adaptiveLevel and adaptivePct for 0.0-1.0 range...');
content = content.replace(
  /function adaptiveLevel\(score\) \{ return ADAPT_DIFFS\[Math\.min\(Math\.max\(Math\.round\(score\), 0\), 3\)\] \}/g,
  'function adaptiveLevel(mastery) { return ADAPT_DIFFS[Math.min(Math.max(Math.floor(mastery * 4), 0), 3)] }'
);
content = content.replace(
  /function adaptivePct\(score\) \{ return Math\.min\(100, Math\.max\(0, \(score \/ 3\) \* 100\)\) \}/g,
  'function adaptivePct(mastery) { return Math.min(100, Math.max(0, mastery * 100)) }'
);

console.log('Replacing setAdaptScore linear logic with updateBKT...');

// 1. useState(0) -> useState(0.1) for adaptScore
// Looking for: const [adaptScore, setAdaptScore] = useState(0) // 0.0 (easy) → 3.0 (extrahard)
// Looking for: const [adaptScore, setAdaptScore] = useState(0)
content = content.replace(/const \[adaptScore, setAdaptScore\] = useState\(0\)/g, 'const [adaptScore, setAdaptScore] = useState(0.1)');

// 2. setAdaptScore(0) -> setAdaptScore(0.1)
content = content.replace(/setAdaptScore\(0\)/g, 'setAdaptScore(0.1)');

// 3. adaptScoreRef.current = 0 -> adaptScoreRef.current = 0.1
content = content.replace(/adaptScoreRef\.current = 0(?!.)/g, 'adaptScoreRef.current = 0.1');

// 4. setAdaptScore(prev => { const next = data.correct ? Math.min(3, prev + 0.25) : Math.max(0, prev - 0.35); adaptScoreRef.current = next; return next })
content = content.replace(
  /setAdaptScore\(prev => \{ const next = data\.correct \? Math\.min\(3, prev \+ 0\.25\) : Math\.max\(0, prev - 0\.35\); adaptScoreRef\.current = next; return next \}\)/g,
  'setAdaptScore(prev => { const next = updateBKT(prev, data.correct); adaptScoreRef.current = next; return next })'
);

// 5. setAdaptScore(prev => Math.max(0, prev - 0.35))
content = content.replace(
  /setAdaptScore\(prev => Math\.max\(0, prev - 0\.35\)\)/g,
  'setAdaptScore(prev => updateBKT(prev, false))'
);

// 6. Difficulty Slider: onChange={(p) => { const v = (p / 100) * 3; setAdaptScore(v); adaptScoreRef.current = v }}
content = content.replace(
  /onChange=\{\(p\) => \{ const v = \(p \/ 100\) \* 3; setAdaptScore\(v\); adaptScoreRef\.current = v \}\}/g,
  'onChange={(p) => { const v = (p / 100); setAdaptScore(v); adaptScoreRef.current = v }}'
);

console.log('Writing back App.jsx...');
fs.writeFileSync(APP_JSX_PATH, content, 'utf8');
console.log('Migration Complete!');
