const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf-8');

// The broken pattern is: ;( ? window.playGlobalCorrect?.() : window.playGlobalWrong?.(), setIsCorrect(VAR))
// We want to restore it to: ;(VAR ? window.playGlobalCorrect?.() : window.playGlobalWrong?.(), setIsCorrect(VAR))

code = code.replace(/;\(\s*\?\s*window\.playGlobalCorrect\?\.(\(\))?\s*:\s*window\.playGlobalWrong\?\.(\(\))?\s*,\s*setIsCorrect\(([^)]+)\)\)/g, ';($3 ? window.playGlobalCorrect?.() : window.playGlobalWrong?.(), setIsCorrect($3))');

fs.writeFileSync('client/src/App.jsx', code);
console.log('App.jsx fixed broken syntax!');
