const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf-8');

// Replace setIsCorrect(true)
code = code.replace(/setIsCorrect\(\s*true\s*\)/g, "(window.playGlobalCorrect?.(), setIsCorrect(true))");
// Replace setIsCorrect(false)
code = code.replace(/setIsCorrect\(\s*false\s*\)/g, "(window.playGlobalWrong?.(), setIsCorrect(false))");

// Some apps use `setFeedback('Correct!')` or `setFeedback("Correct!")`
code = code.replace(/setFeedback\(\s*['"]Correct!?['"]\s*\)/gi, "(window.playGlobalCorrect?.(), setFeedback('Correct!'))");
code = code.replace(/setFeedback\(\s*['"]Incorrect!?['"]\s*\)/gi, "(window.playGlobalWrong?.(), setFeedback('Incorrect!'))");
code = code.replace(/setFeedback\(\s*['"]Correct['"]\s*\)/gi, "(window.playGlobalCorrect?.(), setFeedback('Correct'))");
code = code.replace(/setFeedback\(\s*['"]Incorrect['"]\s*\)/gi, "(window.playGlobalWrong?.(), setFeedback('Incorrect'))");

// Write back
fs.writeFileSync('client/src/App.jsx', code);
console.log("App.jsx patched with global sounds!");
