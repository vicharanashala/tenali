const fs = require('fs');

let code = fs.readFileSync('client/src/App.jsx', 'utf8');

const s1 = code.indexOf('function ProgressiveHintPanel');
const e2 = code.indexOf('\nfunction XpSummaryCard');

code = code.slice(0, s1) + code.slice(e2);

// Add imports
const importStmt = `import { HintModal } from './components/HintSystem/HintModal.jsx';\nimport { useQuizHintsAndXp } from './components/HintSystem/useHints.jsx';\n`;
if (!code.includes('HintModal.jsx')) {
  code = code.replace("import { useEffect, useState, useRef, useMemo } from 'react'", importStmt + "import { useEffect, useState, useRef, useMemo } from 'react'");
}

// Replace usages
code = code.replace(/<ProgressiveHintPanel/g, '<HintModal');

// Export needed functions
code = code.replace('const API =', 'export const API =');
code = code.replace('function getLocalXp(', 'export function getLocalXp(');
code = code.replace('function setLocalXp(', 'export function setLocalXp(');
code = code.replace('function changeXp(', 'export function changeXp(');

fs.writeFileSync('client/src/App.jsx', code);
console.log('App.jsx fixed perfectly');
