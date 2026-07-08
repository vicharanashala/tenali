const fs = require('fs');

let text = fs.readFileSync('client/src/App.jsx', 'utf8');

// split by 'function '
let parts = text.split('\nfunction ');
let injectedCount = 0;

for (let i = 1; i < parts.length; i++) {
  let part = parts[i];
  
  // if part defines a component that has adaptScore
  if (part.includes('App(') && part.includes('adaptScore')) {
    // find the first <h1> and inject MasteryProgress before it
    let h1Index = part.indexOf('<h1');
    if (h1Index !== -1 && !part.includes('<MasteryProgress')) {
      // Find the start of the line containing <h1
      let lineStart = part.lastIndexOf('\n', h1Index);
      let indent = part.substring(lineStart, h1Index);
      
      let newPart = part.substring(0, h1Index) + 
                    `<MasteryProgress adaptScore={typeof adaptScore !== 'undefined' ? adaptScore : undefined} />` + 
                    indent + 
                    part.substring(h1Index);
      parts[i] = newPart;
      injectedCount++;
    }
  }
}

text = parts[0] + '\nfunction ' + parts.slice(1).join('\nfunction ');
fs.writeFileSync('client/src/App.jsx', text);
console.log('Injected ' + injectedCount);
