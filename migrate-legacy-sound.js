const fs = require('fs');

// 1. Migrate App.jsx
let appCode = fs.readFileSync('client/src/App.jsx', 'utf-8');
appCode = appCode.replace("import { playSound } from './audioContext'", "import { useQuizSound } from './context/QuizSoundContext.jsx';");

// Inject hook into PercentApp
appCode = appCode.replace(
  "function PercentApp({", 
  "function PercentApp({\n  const { playCorrect, playWrong } = useQuizSound();"
);
// In App.jsx, the calls are like playSound('correct', soundEnabled);
appCode = appCode.replace(/playSound\('correct',\s*soundEnabled\)/g, "playCorrect()");
appCode = appCode.replace(/playSound\('wrong',\s*soundEnabled\)/g, "playWrong()");
fs.writeFileSync('client/src/App.jsx', appCode);
console.log('App.jsx migrated');

// 2. Migrate PercentExplanationApp.jsx
let percentCode = fs.readFileSync('client/src/PercentExplanationApp.jsx', 'utf-8');
percentCode = percentCode.replace("import { playSound } from './audioContext';", "import { useQuizSound } from './context/QuizSoundContext.jsx';");
percentCode = percentCode.replace(
  "export default function PercentExplanationApp() {", 
  "export default function PercentExplanationApp() {\n  const { playCorrect, playWrong } = useQuizSound();"
);
percentCode = percentCode.replace(
  /playSound\(isCorrect \? 'correct' : 'wrong',[^)]+\)/g, 
  "isCorrect ? playCorrect() : playWrong()"
);
fs.writeFileSync('client/src/PercentExplanationApp.jsx', percentCode);
console.log('PercentExplanationApp.jsx migrated');

// 3. Migrate detective-app.jsx
let detectiveCode = fs.readFileSync('client/src/detective-app.jsx', 'utf-8');
if (!detectiveCode.includes('QuizSoundContext')) {
  detectiveCode = detectiveCode.replace(
    "import React,", 
    "import { useQuizSound } from './context/QuizSoundContext.jsx';\nimport React,"
  );
  detectiveCode = detectiveCode.replace(
    "export default function EnhancedMathDetectiveApp() {", 
    "export default function EnhancedMathDetectiveApp() {\n  const { playCorrect } = useQuizSound();"
  );
  detectiveCode = detectiveCode.replace(/playCorrectSound\(\)/g, "playCorrect()");
}
fs.writeFileSync('client/src/detective-app.jsx', detectiveCode);
console.log('detective-app.jsx migrated');

// 4. Deprecate audioContext.js
let audioCtxCode = fs.readFileSync('client/src/audioContext.js', 'utf-8');
if (!audioCtxCode.includes('DEPRECATED')) {
  audioCtxCode = "// DEPRECATED: Please use useQuizSound() from './context/QuizSoundContext.jsx' instead.\n// This file is kept temporarily for backward compatibility during migration.\n" + audioCtxCode;
  fs.writeFileSync('client/src/audioContext.js', audioCtxCode);
  console.log('audioContext.js deprecated');
}
