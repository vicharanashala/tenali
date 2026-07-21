const fs = require('fs');
const content = fs.readFileSync('c:/Users/dipto/repo/tenali/client/src/App.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  const lineNum = index + 1;
  if (lineNum >= 43284 && lineNum <= 43640 && line.includes('setRevealed')) {
    console.log(`Line ${lineNum}: ${line.trim()}`);
  }
});
