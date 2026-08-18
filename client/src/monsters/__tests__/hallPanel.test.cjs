// Smoke test for HallPanel logic. Pure validation against the source files.
// We can't run React without a DOM, so we parse + extract key markers.
//
// Run with: node __tests__/hallPanel.test.cjs

const fs = require('fs');
const path = require('path');

const monstersDir = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, ok, details = '') {
  if (ok) {
    console.log(`PASS | ${name}${details ? ' ' + details : ''}`);
    pass++;
  } else {
    console.log(`FAIL | ${name}${details ? ' ' + details : ''}`);
    fail++;
  }
}

// ─── HallPanel.jsx ─────────────────────────────────────────────────────────
const hallSrc = fs.readFileSync(path.join(monstersDir, 'HallPanel.jsx'), 'utf8');

check('HallPanel exports default',
  /export default HallPanel/.test(hallSrc));

check('HallPanel imports MonsterCard',
  /import MonsterCard from '\.\/MonsterCard\.jsx'/.test(hallSrc));

check('HallPanel imports MonsterDetail',
  /import MonsterDetail from '\.\/MonsterDetail\.jsx'/.test(hallSrc));

check('HallPanel uses known monster IDs from monsterExplanations',
  /KNOWN_IDS\s*=\s*Object\.keys\(MONSTER_EXPLANATIONS\)/.test(hallSrc));

check('HallPanel returns null when not open',
  /if \(!open\) return null/.test(hallSrc));

check('HallPanel handles Escape key',
  /e\.key === 'Escape'/.test(hallSrc));

check('HallPanel backdrop click closes',
  /e\.target === e\.currentTarget/.test(hallSrc));

check('HallPanel has empty state branch',
  /No monsters yet/.test(hallSrc));

check('HallPanel grid renders MonsterCard instances',
  /<MonsterCard[\s\S]+?\/>/.test(hallSrc));

check('HallPanel detail view branches on selectedId',
  /if \(selectedId\)/.test(hallSrc));

check('HallPanel exposes onStartCure callback',
  /onStartCure && onStartCure/.test(hallSrc));

// ─── MonsterCard.jsx ───────────────────────────────────────────────────────
const cardSrc = fs.readFileSync(path.join(monstersDir, 'MonsterCard.jsx'), 'utf8');

check('MonsterCard exports default',
  /export default MonsterCard/.test(cardSrc));

check('MonsterCard supports seen vs unseen states',
  /unseen/.test(cardSrc));

check('MonsterCard disables unseen cards',
  /disabled={!seen}/.test(cardSrc));

check('MonsterCard shows cure badge when cures exist',
  /curesSuccessful > 0/.test(cardSrc));

check('MonsterCard renders blob with emoji',
  /monster-card-blob/.test(cardSrc) && /emoji/.test(cardSrc));

// ─── MonsterDetail.jsx ─────────────────────────────────────────────────────
const detailSrc = fs.readFileSync(path.join(monstersDir, 'MonsterDetail.jsx'), 'utf8');

check('MonsterDetail exports default',
  /export default MonsterDetail/.test(detailSrc));

check('MonsterDetail uses getMonsterExplanation',
  /getMonsterExplanation/.test(detailSrc));



check('MonsterDetail has Start Cure button',
  /Start Cure/.test(detailSrc));

check('MonsterDetail has stats row (3 stats)',
  /monster-detail-stat/.test(detailSrc) && /Breaches/.test(detailSrc));

check('MonsterDetail has Start Cure primary action',
  /monster-detail-btn-primary/.test(detailSrc) && /Start Cure/.test(detailSrc));

// ─── App.jsx integration ───────────────────────────────────────────────────
const appSrc = fs.readFileSync(path.join(monstersDir, '..', 'App.jsx'), 'utf8');

check('App.jsx imports HallPanel',
  /import HallPanel from '\.\/monsters\/HallPanel\.jsx'/.test(appSrc));

check('App.jsx imports loadMonsterLog',
  /load as loadMonsterLog/.test(appSrc));

check('App.jsx has hallOpen state',
  /const \[hallOpen, setHallOpen\] = useState\(false\)/.test(appSrc));

check('App.jsx has monsterLog state hydrated from storage',
  /loadMonsterLog\(\)/.test(appSrc));

check('App.jsx listens to storage events for sync',
  /addEventListener\('storage'/.test(appSrc));

check('App.jsx listens to tenali:monsterLogChanged for same-tab sync',
  /addEventListener\('tenali:monsterLogChanged'/.test(appSrc));

check('App.jsx mounts <HallPanel>',
  /<HallPanel\s/.test(appSrc));

check('App.jsx passes onOpenHall to MonsterToast',
  /<MonsterToast\s+onOpenHall=\{/.test(appSrc));

check('App.jsx opens Hall when a repeat toast is tapped',
  /<MonsterToast\s+onOpenHall=\{[\s\S]*?onTap=\{\(\) => setHallOpen\(true\)\}/.test(appSrc));

console.log('---');
console.log(`Total: ${pass}/${pass + fail}`);
if (fail > 0) process.exit(1);
