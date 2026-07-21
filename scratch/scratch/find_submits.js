const fs = require('fs');
const content = fs.readFileSync('c:/Users/dipto/repo/tenali/client/src/App.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('const handleSubmitOrNext =') || line.includes('function handleSubmitOrNext')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
