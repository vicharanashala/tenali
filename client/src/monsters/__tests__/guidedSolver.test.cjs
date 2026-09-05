/**
 * guidedSolver.test.cjs
 * Static analysis and structure test for GuidedSolver.jsx
 */

const fs = require('fs');
const path = require('path');

function check(name, condition) {
  if (condition) {
    console.log(`PASS | ${name}`);
  } else {
    console.error(`FAIL | ${name}`);
    process.exitCode = 1;
  }
}

const file = path.join(__dirname, '..', 'GuidedSolver.jsx');
check('GuidedSolver.jsx exists', fs.existsSync(file));

const content = fs.readFileSync(file, 'utf8');

check('GuidedSolver exports default', /export default GuidedSolver/.test(content));
check('GuidedSolver supports Bracketeer', /The Bracketeer Solver/.test(content));
check('GuidedSolver supports Sign Swapper', /The Sign Swapper Solver/.test(content));
check('GuidedSolver supports Decimal Drifter', /The Decimal Drifter Solver/.test(content));
check('GuidedSolver supports Carry Crasher', /The Carry Crasher Solver/.test(content));
check('GuidedSolver has reset steps action', /Reset Steps/.test(content));
check('GuidedSolver has Ready to Start Cure action', /Ready to Start Cure/.test(content));
