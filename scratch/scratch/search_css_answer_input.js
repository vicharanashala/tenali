const fs = require('fs');
const content = fs.readFileSync('c:/Users/dipto/repo/tenali/client/src/App.css', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('answer-input') || line.includes('.answer-input')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
