const assert = require('assert');
const router = require('../hints');

// Find the route handler for /lesson-complete
const routeLayer = router.stack.find(layer => layer.route && layer.route.path === '/lesson-complete');
if (!routeLayer) {
  console.error('Could not find /lesson-complete route!');
  process.exit(1);
}
const handler = routeLayer.route.stack[0].handle;

// Helper to run mock test
async function runTest(name, body, expected) {
  console.log(`Running: ${name}`);
  const req = {
    body,
    get: () => null, // mock header
    headers: {}
  };
  
  let resData = null;
  let statusVal = 200;
  
  const res = {
    status: (code) => {
      statusVal = code;
      return res;
    },
    json: (data) => {
      resData = data;
      return res;
    }
  };
  
  await handler(req, res);
  
  console.log('Result:', resData);
  assert.strictEqual(statusVal, 200);
  assert.strictEqual(resData.success, true);
  assert.strictEqual(resData.guest, true);
  assert.strictEqual(resData.bonusAmount, expected.bonusAmount);
  assert.strictEqual(resData.correctXp, expected.correctXp);
  assert.strictEqual(resData.perfectScoreBonus, expected.perfectScoreBonus);
  assert.strictEqual(resData.totalAward, expected.totalAward);
  console.log('PASS\n');
}

async function main() {
  try {
    await runTest(
      'Test 1: Standard Quiz (< 10 questions, perfect score, 0 hints)',
      { concept: 'concept-1', questionsCount: 5, hintsUsed: 0, correctCount: 5 },
      { bonusAmount: 0, correctXp: 5, perfectScoreBonus: 0, totalAward: 5 }
    );
    
    await runTest(
      'Test 2: Minimum 10 Questions Quiz (perfect score, 0 hints)',
      { concept: 'concept-2', questionsCount: 10, hintsUsed: 0, correctCount: 10 },
      { bonusAmount: 50, correctXp: 10, perfectScoreBonus: 10, totalAward: 70 }
    );
    
    await runTest(
      'Test 3: Minimum 10 Questions Quiz (imperfect score, 2 hints)',
      { concept: 'concept-3', questionsCount: 10, hintsUsed: 2, correctCount: 8 },
      { bonusAmount: 30, correctXp: 8, perfectScoreBonus: 0, totalAward: 38 }
    );

    await runTest(
      'Test 4: Deduplication Check (concept-3 again, imperfect score, 2 hints)',
      { concept: 'concept-3', questionsCount: 10, hintsUsed: 2, correctCount: 8 },
      { bonusAmount: 0, correctXp: 8, perfectScoreBonus: 0, totalAward: 8 }
    );

    await runTest(
      'Test 5: Zero Correct Answers Quiz (0 hints)',
      { concept: 'concept-5', questionsCount: 5, hintsUsed: 0, correctCount: 0 },
      { bonusAmount: 0, correctXp: 0, perfectScoreBonus: 0, totalAward: 0 }
    );

    await runTest(
      'Test 6: Quiz with Solve button used (wasSolved: true)',
      { concept: 'concept-6', questionsCount: 5, hintsUsed: 0, correctCount: 3, wasSolved: true },
      { bonusAmount: 0, correctXp: 3, perfectScoreBonus: 0, totalAward: 3 }
    );

    await runTest(
      'Test 7: Perfect Quiz with Solve button used (wasSolved: true)',
      { concept: 'concept-7', questionsCount: 10, hintsUsed: 0, correctCount: 10, wasSolved: true },
      { bonusAmount: 0, correctXp: 10, perfectScoreBonus: 0, totalAward: 10 }
    );
    
    console.log('ALL DIRECT CALCULATIONS TESTS PASSED!');
  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  }
}

main();
