const fs = require('fs');
const path = require('path');
import('./learnContent.js').then(m => {
  const data = m.learnContent;
  const dir = path.join(__dirname, 'learnContent');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  for (const [key, value] of Object.entries(data)) {
    fs.writeFileSync(path.join(dir, key + '.json'), JSON.stringify(value, null, 2));
  }
  console.log('Successfully created', Object.keys(data).length, 'json files.');
}).catch(console.error);
