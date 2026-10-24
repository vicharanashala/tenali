const fs = require('fs');
const path = require('path');
(async () => {
  const m = await import('file:///c:/PROJECTS/Tenali/Tenali-IITROPAR/client/src/data/learnContent.js');
  const data = m.learnContent;
  const dir = path.join(__dirname, 'learnContent');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  for (const [key, value] of Object.entries(data)) {
    fs.writeFileSync(path.join(dir, key + '.json'), JSON.stringify(value, null, 2));
  }
  console.log('Successfully created', Object.keys(data).length, 'json files.');
})();
