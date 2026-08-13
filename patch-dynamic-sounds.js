const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf-8');

const replacements = [
  'correct',
  'allCorrect',
  'ok',
  'data.correct'
];

replacements.forEach(variable => {
  const regex = new RegExp(`setIsCorrect\\(\\s*${variable.replace('.', '\\.')}\\s*\\)`, 'g');
  const replacement = `(${variable} ? window.playGlobalCorrect?.() : window.playGlobalWrong?.(), setIsCorrect(${variable}))`;
  code = code.replace(regex, replacement);
});

fs.writeFileSync('client/src/App.jsx', code);
console.log("App.jsx dynamically patched for remaining variables!");
