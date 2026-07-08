const fs = require('fs');

let text = fs.readFileSync('client/src/App.jsx', 'utf8');
let parts = text.split('\nfunction ');
for (let i = 1; i < parts.length; i++) {
  let part = parts[i];
  let name = part.split('(')[0].trim();
  if (name === 'AdditionApp') {
    console.log("Found AdditionApp");
    console.log("Has adaptScore:", part.includes('adaptScore'));
    console.log("Has <div className=\"card\">:", part.includes('<div className="card">'));
  }
}
