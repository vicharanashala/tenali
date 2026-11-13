const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf8');

const imports = `import { HintModal } from './components/HintSystem/HintModal.jsx';\nimport { useQuizHintsAndXp } from './components/HintSystem/useHints.jsx';\n`;
if (!code.includes('HintModal.jsx')) {
  code = code.replace(/import React, \{ useEffect/, imports + 'import React, { useEffect');
}

const apps = {
  'GKApp': 'gk',
  'AdaptiveTablesApp': 'tables',
  'AdaptiveMixedApp': 'mixed',
  'RandomMixApp': 'mix',
  'SetsApp': 'sets',
  'SequencesApp': 'sequences',
  'RatioApp': 'ratio',
  'PercentApp': 'percent',
  'IndicesApp': 'indices',
  'SurdsApp': 'surds',
  'FractionAddApp': 'fractionadd',
  'SqrtApp': 'sqrt',
  'FuncEvalApp': 'funceval',
  'Tatsavit1App': 'tatsavit1',
  'TatsavitLineApp': 'tatsavitline',
  'GymApp': 'gym',
  'makeQuizApp': "apiPath.split('-')[0]",
  'makeMCQuizApp': "apiPath.split('-')[0]"
};

for (const [appName, appId] of Object.entries(apps)) {
  const startIdx = code.indexOf(`function ${appName}(`);
  if (startIdx === -1) {
    console.log(`Could not find ${appName}`);
    continue;
  }
  
  let timerIdx = code.indexOf('const timer = useTimer()', startIdx);
  if (timerIdx === -1 || timerIdx - startIdx > 6000) {
    console.log(`${appName}: timer is too far or not found!`);
    continue;
  }
  
  const hookStr = `\n  const { hintsUsedCount, xpBreakdown, bonusLoading } = useQuizHintsAndXp(${appId.includes('apiPath') ? appId : `'${appId}'`}, finished, score, totalQ, typeof isCorrect !== 'undefined' ? (isCorrect || false) : false, results);`;
  const insertHookAt = timerIdx + 'const timer = useTimer()'.length;
  code = code.slice(0, insertHookAt) + hookStr + code.slice(insertHookAt);
  
  let layoutIdx = code.indexOf('</QuizLayout>', insertHookAt + hookStr.length);
  if (layoutIdx === -1 || layoutIdx - insertHookAt > 20000) {
      console.log(`${appName}: QuizLayout is too far or not found!`);
      continue;
  }

  const hintModalStr = `<HintModal concept={${appId.includes('apiPath') ? appId : `'${appId}'`}} questionId={question?.id || 'unknown'} questionData={question} revealed={revealed} hintsUsedCount={hintsUsedCount} xpBreakdown={xpBreakdown} bonusLoading={bonusLoading} />\n`;
  code = code.slice(0, layoutIdx) + hintModalStr + code.slice(layoutIdx);
}

fs.writeFileSync('client/src/App.jsx', code);
console.log('Done!');
