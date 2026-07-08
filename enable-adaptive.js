const fs = require('fs');
const path = require('path');

const APP_JSX_PATH = path.join(__dirname, 'client/src/App.jsx');

let content = fs.readFileSync(APP_JSX_PATH, 'utf8');

console.log('Enabling Adaptive Mode by default...');
content = content.replace(/const \[isAdaptive, setIsAdaptive\] = useState\(false\)/g, 'const [isAdaptive, setIsAdaptive] = useState(true)');

fs.writeFileSync(APP_JSX_PATH, content, 'utf8');
console.log('Adaptive Mode Enabled!');
