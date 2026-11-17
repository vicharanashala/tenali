const fs = require('fs');
let code = fs.readFileSync('client/src/App.jsx', 'utf8');

const xpFuncs = `
export function getLocalXp() {
  try {
    const val = localStorage.getItem('tenali_xp');
    return val ? parseInt(val, 10) : 0;
  } catch { return 0; }
}

export function setLocalXp(val) {
  try { localStorage.setItem('tenali_xp', val.toString()); } catch {}
  // dispatch event to sync UI if needed
  window.dispatchEvent(new CustomEvent('tenali_xp_update', { detail: { xp: val } }));
}

export function changeXp(delta) {
  const current = getLocalXp();
  const next = Math.max(0, current + delta);
  setLocalXp(next);
  return next;
}
`;

if (!code.includes('export function getLocalXp')) {
  // Inject at the bottom before export default App
  code = code.replace(/export default App/, xpFuncs + '\nexport default App');
}

// Ensure they are exported in the named export list if needed, but 'export function' already exports them if this was a module.
// In Vite, exporting them is enough for other files to import { getLocalXp } from './App.jsx'

fs.writeFileSync('client/src/App.jsx', code);
console.log('Injected XP functions');
