const fs = require('fs');

if (fs.existsSync('client/src/utils.jsx')) fs.unlinkSync('client/src/utils.jsx');

let code = fs.readFileSync('client/src/App.jsx', 'utf8');

code = code.replace('const API =', 'export const API =');
code = code.replace('function getLocalXp(', 'export function getLocalXp(');
code = code.replace('function setLocalXp(', 'export function setLocalXp(');
code = code.replace('function changeXp(', 'export function changeXp(');

const s1 = code.indexOf('function ProgressiveHintPanel');
const e1 = code.indexOf('// ─── Setup Phase ────────────────────────────────────────────────────────────', s1);

if (s1 > -1 && e1 > -1) {
  code = code.slice(0, s1) + code.slice(e1);
}

const importStmt = `import { HintModal } from './components/HintSystem/HintModal';\nimport { useQuizHintsAndXp } from './components/HintSystem/useHints.jsx';\n`;
code = code.replace("import { useEffect, useState, useRef, useMemo } from 'react'", importStmt + "import { useEffect, useState, useRef, useMemo } from 'react'");

code = code.replace(/<ProgressiveHintPanel/g, '<HintModal');

fs.writeFileSync('client/src/App.jsx', code);

let hintCode = fs.readFileSync('client/src/components/HintSystem/HintModal.jsx', 'utf8');
hintCode = hintCode.replace(/import \{ API.*\} from '..\/..\/utils\.jsx';/, "import { API, getLocalXp, setLocalXp, changeXp } from '../../App.jsx';");
fs.writeFileSync('client/src/components/HintSystem/HintModal.jsx', hintCode);

let hookCode = fs.readFileSync('client/src/components/HintSystem/useHints.jsx', 'utf8');
hookCode = hookCode.replace(/import \{ API.*\} from '..\/..\/utils\.jsx';/, "import { API, setLocalXp } from '../../App.jsx';");
fs.writeFileSync('client/src/components/HintSystem/useHints.jsx', hookCode);
console.log('Cleanup successful');
