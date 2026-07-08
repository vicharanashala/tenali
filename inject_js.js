const fs = require('fs');

let text = fs.readFileSync('client/src/App.jsx', 'utf8');

let parts = text.split('\nfunction ');
let injected = 0;

for (let i = 1; i < parts.length; i++) {
  let part = parts[i];
  if (part.includes('adaptScore') && part.includes('<div className="card">')) {
    // Only inject if it's an App component (capitalized) or make*App
    let name = part.split('(')[0].trim();
    if (name.endsWith('App')) {
      let cardIndex = part.indexOf('<div className="card">');
      if (!part.includes('<MasteryProgress')) {
        let cardTag = '<div className="card">';
        let newPart = part.substring(0, cardIndex + cardTag.length) + 
                      `\n      <MasteryProgress adaptScore={typeof adaptScore !== 'undefined' ? adaptScore : undefined} />` + 
                      part.substring(cardIndex + cardTag.length);
        parts[i] = newPart;
        injected++;
      }
    }
  }
}

text = parts[0] + '\nfunction ' + parts.slice(1).join('\nfunction ');
fs.writeFileSync('client/src/App.jsx', text);
console.log('Injected into ' + injected + ' apps!');
