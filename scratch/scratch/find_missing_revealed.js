const fs = require('fs');
const content = fs.readFileSync('c:/Users/dipto/repo/tenali/client/src/App.jsx', 'utf8');
const lines = content.split('\n');

const lineNumbers = [38762, 38956, 42375, 43128, 43520, 44651, 45016, 45355, 46958, 53447, 60963];

lineNumbers.forEach(ln => {
  console.log(`\n--- Declaration at Line ${ln} ---`);
  // Look ahead up to 70 lines to see if setRevealed is used within the function scope
  let hasSetRevealed = false;
  let count = 0;
  for (let idx = ln; idx < ln + 70 && idx < lines.length; idx++) {
    const line = lines[idx];
    if (line.includes('setRevealed')) {
      hasSetRevealed = true;
      console.log(`Found setRevealed on line ${idx + 1}: ${line.trim()}`);
    }
  }
  if (!hasSetRevealed) {
    console.log(`❌ NO setRevealed found in next 70 lines for line ${ln}!`);
  }
});
