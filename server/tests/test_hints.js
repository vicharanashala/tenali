const { spawn } = require('child_process');
const assert = require('assert');
const path = require('path');

const PORT = 4500;
const API_URL = `http://localhost:${PORT}/api/hints/lesson-complete`;

console.log('Starting Tenali test server on port', PORT);
const child = spawn('node', [path.join(__dirname, '..', 'index.js')], {
  env: { ...process.env, PORT, MONGO_URI: 'mongodb://127.0.0.1:27017/tenali-test-nonexistent-db' }
});

let serverStarted = false;

child.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(`[Server STDOUT] ${output.trim()}`);
  if (output.includes('Tenali app running') && !serverStarted) {
    serverStarted = true;
    runTests();
  }
});

child.stderr.on('data', (data) => {
  console.error(`[Server STDERR] ${data.toString().trim()}`);
});

child.on('error', (err) => {
  console.error('Child process spawn/execution error:', err);
});

child.on('exit', (code, signal) => {
  console.log(`Child process exited with code ${code} and signal ${signal}`);
  if (!serverStarted) {
    console.error('Server process exited before tests started.');
    process.exit(1);
  }
});

// Fallback timer in case stdout doesn't match
const fallbackTimer = setTimeout(() => {
  if (!serverStarted) {
    console.log('Fallback: starting tests after 45 seconds...');
    serverStarted = true;
    runTests();
  }
}, 45000);

async function runTests() {
  clearTimeout(fallbackTimer);
  try {
    console.log('\n--- Running Test 1: Standard Quiz (less than 10 questions, perfect score, no hints) ---');
    let res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept: 'test-concept-1',
        questionsCount: 5,
        hintsUsed: 0,
        correctCount: 5
      })
    });
    let data = await res.json();
    console.log('Result:', data);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.guest, true);
    assert.strictEqual(data.bonusAwarded, false);
    assert.strictEqual(data.bonusAmount, 0);
    assert.strictEqual(data.correctXp, 5);
    assert.strictEqual(data.perfectScoreBonus, 0);
    assert.strictEqual(data.totalAward, 5);
    console.log('Test 1 PASS');

    console.log('\n--- Running Test 2: Minimum 10 Questions Quiz (perfect score, no hints) ---');
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept: 'test-concept-2',
        questionsCount: 10,
        hintsUsed: 0,
        correctCount: 10
      })
    });
    data = await res.json();
    console.log('Result:', data);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.guest, true);
    assert.strictEqual(data.bonusAwarded, true);
    assert.strictEqual(data.bonusAmount, 50);
    assert.strictEqual(data.correctXp, 10);
    assert.strictEqual(data.perfectScoreBonus, 10);
    assert.strictEqual(data.totalAward, 70);
    console.log('Test 2 PASS');

    console.log('\n--- Running Test 3: Minimum 10 Questions Quiz (imperfect score, with hints) ---');
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept: 'test-concept-3',
        questionsCount: 10,
        hintsUsed: 2,
        correctCount: 8
      })
    });
    data = await res.json();
    console.log('Result:', data);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.guest, true);
    assert.strictEqual(data.bonusAwarded, true);
    assert.strictEqual(data.bonusAmount, 30);
    assert.strictEqual(data.correctXp, 8);
    assert.strictEqual(data.perfectScoreBonus, 0);
    assert.strictEqual(data.totalAward, 38);
    console.log('Test 3 PASS');

    console.log('\n--- Running Test 4: Deduplication Check (same concept) ---');
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept: 'test-concept-3',
        questionsCount: 10,
        hintsUsed: 2,
        correctCount: 8
      })
    });
    data = await res.json();
    console.log('Result:', data);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.guest, true);
    assert.strictEqual(data.alreadyCompleted, true);
    assert.strictEqual(data.bonusAmount, 0);
    assert.strictEqual(data.correctXp, 8);
    assert.strictEqual(data.perfectScoreBonus, 0);
    assert.strictEqual(data.totalAward, 8);
    console.log('Test 4 PASS');

    console.log('\n--- Running Test 5: Zero Correct Answers Quiz (0 hints) ---');
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept: 'test-concept-5',
        questionsCount: 5,
        hintsUsed: 0,
        correctCount: 0
      })
    });
    data = await res.json();
    console.log('Result:', data);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.guest, true);
    assert.strictEqual(data.bonusAmount, 0);
    assert.strictEqual(data.correctXp, 0);
    assert.strictEqual(data.perfectScoreBonus, 0);
    assert.strictEqual(data.totalAward, 0);
    console.log('Test 5 PASS');

    console.log('\n--- Running Test 6: Quiz with Solve button used (wasSolved: true) ---');
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept: 'test-concept-6',
        questionsCount: 5,
        hintsUsed: 0,
        correctCount: 3,
        wasSolved: true
      })
    });
    data = await res.json();
    console.log('Result:', data);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.guest, true);
    assert.strictEqual(data.bonusAmount, 0);
    assert.strictEqual(data.correctXp, 3);
    assert.strictEqual(data.perfectScoreBonus, 0);
    assert.strictEqual(data.totalAward, 3);
    console.log('Test 6 PASS');

    console.log('\n--- Running Test 7: Perfect Quiz with Solve button used (wasSolved: true) ---');
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept: 'test-concept-7',
        questionsCount: 10,
        hintsUsed: 0,
        correctCount: 10,
        wasSolved: true
      })
    });
    data = await res.json();
    console.log('Result:', data);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.guest, true);
    assert.strictEqual(data.bonusAmount, 0);
    assert.strictEqual(data.correctXp, 10);
    assert.strictEqual(data.perfectScoreBonus, 0);
    assert.strictEqual(data.totalAward, 10);
    console.log('Test 7 PASS');

    console.log('\n--- Running Test 8: Progressive Hint Level 3 Masking (Vocab) ---');
    res = await fetch(`http://localhost:${PORT}/api/hints/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept: 'vocab',
        questionId: 'vocab-test-123',
        level: 3,
        questionData: { id: 1, question: 'A definition here', options: ['A', 'B', 'C', 'D'] }
      })
    });
    data = await res.json();
    console.log('Result:', data);
    assert.ok(data.hint.includes('The correct option matches'));
    console.log('Test 8 PASS');

    console.log('\n--- Running Test 9: Progressive Hint Level 3 Masking (Math) ---');
    res = await fetch(`http://localhost:${PORT}/api/hints/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept: 'addition',
        questionId: 'addition-test-123',
        level: 3,
        questionData: { a: 5, b: 3 }
      })
    });
    data = await res.json();
    console.log('Result:', data);
    assert.strictEqual(data.success, true);
    assert.ok(data.hint.includes('5 + 3 = ?'));
    assert.ok(!data.hint.includes('5 + 3 = 8'));
    console.log('Test 9 PASS');

    console.log('\nALL TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    console.log('Killing test server...');
    child.kill();
    process.exit();
  }
}
