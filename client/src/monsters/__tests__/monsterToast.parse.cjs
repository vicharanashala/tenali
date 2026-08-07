// Quick syntax-parse-only smoke check for MonsterToast.jsx and App.jsx.
// Run with: node __tests__/monsterToast.parse.cjs
// Tests: acorn + acorn-jsx parsing of the JSX source (no execution).

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const jsx = require('acorn-jsx');

const Parser = acorn.Parser.extend(jsx());

const FILES = [
  // Path relative to repo root
  'client/src/monsters/MonsterToast.jsx',
  'client/src/monsters/HallPanel.jsx',
  'client/src/monsters/MonsterCard.jsx',
  'client/src/monsters/MonsterDetail.jsx',
  'client/src/monsters/CureFlow.jsx',
  'client/src/App.jsx',
];

let pass = 0, fail = 0;
for (const rel of FILES) {
  const abs = path.join(__dirname, '..', '..', '..', '..', rel);
  const src = fs.readFileSync(abs, 'utf8');
  try {
    Parser.parse(src, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      allowReturnOutsideFunction: true,
      allowImportExportEverywhere: true,
      allowHashBang: true,
    });
    console.log(`PASS | ${rel} (${src.length} bytes) parses cleanly`);
    pass++;
  } catch (e) {
    console.log(`FAIL | ${rel}: ${e.message}`);
    fail++;
  }
}

console.log('---');
console.log(`Total: ${pass}/${pass + fail}`);
if (fail > 0) process.exit(1);
