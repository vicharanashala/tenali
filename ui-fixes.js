const fs = require('fs');
const path = require('path');

const APP_JSX_PATH = path.join(__dirname, 'client/src/App.jsx');

let content = fs.readFileSync(APP_JSX_PATH, 'utf8');
console.log('Injecting currentDiffRef to lock difficulty badge...');

// 1. Add currentDiffRef to state declarations
content = content.replace(
  /const adaptScoreRef = useRef\(0\.1\)/g,
  'const adaptScoreRef = useRef(0.1)\n  const currentDiffRef = useRef(\'easy\')'
);

// 2. Update currentDiffRef when fetching question
content = content.replace(
  /const res = await fetch\(/g,
  'currentDiffRef.current = effectiveDiff();\n    const res = await fetch('
);

// 3. Change ADAPT_LABELS[curAdaptLevel] to ADAPT_LABELS[currentDiffRef.current]
content = content.replace(
  /ADAPT_LABELS\[curAdaptLevel\]/g,
  'ADAPT_LABELS[currentDiffRef.current || curAdaptLevel]'
);
content = content.replace(
  /ADAPT_COLORS\[curAdaptLevel\]/g,
  'ADAPT_COLORS[currentDiffRef.current || curAdaptLevel]'
);

// 4. Implement Hard Gate (prevent revealing on wrong answer)
// Looking for: setIsCorrect(data.correct)
// If it's a MCQuizApp, it looks for `data.correct` too.
// Wait, for standard QuizApp, it's:
// setIsCorrect(data.correct)
// const newScore = score + (data.correct ? 1 : 0)
// We want to insert: if (!data.correct) { setFeedback('Incorrect. Try again!'); setAnswer(''); return; }
content = content.replace(
  /setIsCorrect\(data\.correct\)\n\s+const newScore = score \+ \(data\.correct \? 1 : 0\)/g,
  `setIsCorrect(data.correct)
      if (!data.correct) {
        setFeedback('Incorrect. Try again!');
        setAnswer('');
        return;
      }
      const newScore = score + 1`
);

// Same for makeMCQuizApp:
content = content.replace(
  /setIsCorrect\(data\.correct\)\n\s+if \(data\.correct\) \{/g,
  `setIsCorrect(data.correct)
      if (!data.correct) {
        setFeedback('Incorrect. Try again!');
        setSelected(null);
        return;
      }
      if (data.correct) {`
);

// 5. Add Session Progress UI
// Looking for: BKT Mastery: {Math.round(adaptScore * 100)}%
// We will add the Session Progress div right next to it.
const bktSearch = /BKT Mastery: \{Math\.round\(adaptScore \* 100\)\}%/g;
const bktReplace = `BKT Mastery: {Math.round(adaptScore * 100)}%
            </div>
            <div style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', background: '#4f46e5', color: '#e0e7ff', fontSize: '0.875rem', fontWeight: 'bold', border: '1px solid #3730a3', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              Session: {Math.round((questionNumber / totalQ) * 100)}%`;
content = content.replace(bktSearch, bktReplace);


fs.writeFileSync(APP_JSX_PATH, content, 'utf8');
console.log('UI Fixes Complete!');
