const fs = require('fs');
const path = require('path');

const APP_JSX_PATH = path.join(__dirname, 'client/src/App.jsx');

console.log('Reading App.jsx...');
let content = fs.readFileSync(APP_JSX_PATH, 'utf8');

console.log('Injecting visual BKT Mastery Percentage UI...');

// Looking for: {isAdaptive && <DifficultySlider pct={adaptivePct(adaptScore)} onChange={(p) => { const v = (p / 100); setAdaptScore(v); adaptScoreRef.current = v }} />}
// Note: We've already replaced * 3 with nothing in the previous script.

const searchString = /\{isAdaptive && <DifficultySlider pct=\{adaptivePct\(adaptScore\)\} onChange=\{\(p\) => \{ const v = \(p \/ 100\); setAdaptScore\(v\); adaptScoreRef\.current = v \}\} \/>\}/g;

const replacementString = `{isAdaptive && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', width: '100%' }}>
            <div style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', background: '#0f766e', color: '#ccfbf1', fontSize: '0.875rem', fontWeight: 'bold', border: '1px solid #115e59', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              BKT Mastery: {Math.round(adaptScore * 100)}%
            </div>
            <DifficultySlider pct={adaptivePct(adaptScore)} onChange={(p) => { const v = (p / 100); setAdaptScore(v); adaptScoreRef.current = v }} />
          </div>
        )}`;

content = content.replace(searchString, replacementString);

console.log('Writing back App.jsx...');
fs.writeFileSync(APP_JSX_PATH, content, 'utf8');
console.log('UI update Complete!');
