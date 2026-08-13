const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf-8');

code = code.replace(/;\(Correct\?\.\(\),\s*setIsCorrect\(true\)\)/g, ';(window.playGlobalCorrect?.(), setIsCorrect(true))');
code = code.replace(/;\(Wrong\?\.\(\),\s*setIsCorrect\(false\)\)/g, ';(window.playGlobalWrong?.(), setIsCorrect(false))');

fs.writeFileSync('client/src/App.jsx', code);
console.log('App.jsx fixed broken static sound syntax!');
