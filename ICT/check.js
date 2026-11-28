/*
 * Headless run of the Soil Explorer checks.
 * Usage (from the soil-explorer folder):  node tests/check.js
 * Exit code 0 when every check passes, 1 otherwise.
 *
 * The same checks run in the browser: open index.html?selftest
 */
'use strict';

global.window = {};
require('../js/i18n.js');
require('../js/data/india-geo.js');
require('../js/data/content.js');
require('../js/core.js');
require('../js/selftest.js');

const SE = global.window.SE;
const results = SE.selftest.run();

let group = '';
let failed = 0;
results.forEach(function (r) {
  if (r.group !== group) {
    group = r.group;
    console.log('\n' + group);
  }
  if (!r.pass) failed++;
  console.log('  ' + (r.pass ? 'pass' : 'FAIL') + '  ' + r.name + (r.detail ? '\n        ' + r.detail : ''));
});
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' checks passed.');
process.exit(failed ? 1 : 0);
