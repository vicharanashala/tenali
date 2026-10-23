'use strict';
// Unit tests for server/lib/streak.js — streak milestone bonus calculations.
// Supports both Vitest (API contract runner / `npm test`) and direct Node (`node server/lib/streak.test.js`).

const assert = require('node:assert/strict');
const { getStreakMilestoneBonus } = require('./streak');

const suite = typeof describe === 'function' ? describe : (name, fn) => fn();
const itTest = typeof test === 'function' ? test : (typeof it === 'function' ? it : (name, fn) => fn());

suite('Streak Milestone Bonus Calculations', () => {
  itTest('awards 50 bonus coins for a 3-day streak', () => {
    assert.equal(getStreakMilestoneBonus(3), 50);
  });

  itTest('awards 150 bonus coins for a 7-day streak', () => {
    assert.equal(getStreakMilestoneBonus(7), 150);
  });

  itTest('awards 300 bonus coins for a 15-day streak', () => {
    assert.equal(getStreakMilestoneBonus(15), 300);
  });

  itTest('awards 500 bonus coins for a 30-day streak', () => {
    assert.equal(getStreakMilestoneBonus(30), 500);
  });

  itTest('returns 0 bonus coins for a 4-day streak (non-milestone)', () => {
    assert.equal(getStreakMilestoneBonus(4), 0);
  });

  itTest('returns 0 bonus coins for a 0-day streak', () => {
    assert.equal(getStreakMilestoneBonus(0), 0);
  });
});

if (typeof describe !== 'function') {
  console.log('streak.test.js: all assertions passed');
}
