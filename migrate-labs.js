const fs = require('fs');

// 1. LcmHcfApp.jsx
let lcmCode = fs.readFileSync('client/src/LcmHcfApp.jsx', 'utf-8');
lcmCode = lcmCode.replace("import React,", "import { useQuizSound } from './context/QuizSoundContext.jsx';\nimport React,");
lcmCode = lcmCode.replace("export default function InteractiveLcmHcfApp({ onBack }) {", "export default function InteractiveLcmHcfApp({ onBack }) {\n  const { playCorrect, playWrong } = useQuizSound();");
// The `handleQuizSubmit` does the evaluation
lcmCode = lcmCode.replace(
  "if (isCorrect) {\n        setQuizScore(s => s + 1);", 
  "if (isCorrect) {\n        playCorrect();\n        setQuizScore(s => s + 1);"
);
lcmCode = lcmCode.replace(
  "      } else {\n        setQuizFeedback({ correct: false", 
  "      } else {\n        playWrong();\n        setQuizFeedback({ correct: false"
);
fs.writeFileSync('client/src/LcmHcfApp.jsx', lcmCode);
console.log('LcmHcfApp.jsx migrated');

// 2. CoordGeomDiscoveryApp.jsx
let coordCode = fs.readFileSync('client/src/CoordGeomDiscoveryApp.jsx', 'utf-8');
coordCode = coordCode.replace("import React,", "import { useQuizSound } from './context/QuizSoundContext.jsx';\nimport React,");
coordCode = coordCode.replace("export default function CoordGeomDiscoveryApp({ onBack }) {", "export default function CoordGeomDiscoveryApp({ onBack }) {\n  const { playCorrect, playClick } = useQuizSound();");
// Inject playCorrect inside handlePointerUp
coordCode = coordCode.replace(
  "if (snappedX === midpoint.x && snappedY === midpoint.y) {\n      setMission(prev => ({",
  "if (snappedX === midpoint.x && snappedY === midpoint.y) {\n      playCorrect();\n      setMission(prev => ({"
);
// Inject playClick for regular dropping
coordCode = coordCode.replace(
  "} else {\n      setMission(prev => ({",
  "} else {\n      playClick();\n      setMission(prev => ({"
);
fs.writeFileSync('client/src/CoordGeomDiscoveryApp.jsx', coordCode);
console.log('CoordGeomDiscoveryApp.jsx migrated');
