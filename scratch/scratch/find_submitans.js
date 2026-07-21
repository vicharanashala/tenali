const fs = require('fs');
const content = fs.readFileSync('c:/Users/dipto/repo/tenali/client/src/App.jsx', 'utf8');
const lines = content.split('\n');
for (let idx = 42200; idx < 42380; idx++) {
  const line = lines[idx];
  if (line.includes('submitAns') || line.includes('submit') || line.includes('setRevealed')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
}
