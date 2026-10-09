/**
 * GUESS WHAT'S ON TENALI'S MIND — INTEGRATION TEST SUITE
 * ════════════════════════════════════════════════════════
 *
 * Verifies that the new sequential progressive clues API endpoints
 * work correctly end-to-end.
 *
 * Run with: node test_guess_mind.js
 */

const BASE_URL = 'http://localhost:4000';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓  ${message}`);
    passed++;
  } else {
    console.error(`  ✗  FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('Starting Guess What\'s On Tenali\'s Mind Integration Tests...\n');

  try {
    // Test 1: GET /api/mindreader/worlds
    console.log('--- Test 1: GET /api/mindreader/worlds ---');
    const worldsRes = await fetch(`${BASE_URL}/api/mindreader/worlds`);
    assert(worldsRes.status === 200, 'Worlds endpoint returned status 200');
    const worldsData = await worldsRes.json();
    assert(worldsData.worlds && Array.isArray(worldsData.worlds), 'Worlds response contains worlds array');
    assert(worldsData.worlds.length === 7, 'Should have exactly 7 worlds configured');
    assert(worldsData.worlds[0].unlocked === true, 'Number Kingdom (Beginner) should be unlocked by default');
    assert(worldsData.worlds[0].unlocked === true, 'Number Kingdom (Beginner) should be unlocked by default');

    // Test 2: POST /api/mindreader/start
    console.log('\n--- Test 2: POST /api/mindreader/start ---');
    const startRes = await fetch(`${BASE_URL}/api/mindreader/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ levelNum: 1, worldId: 'number_kingdom' })
    });
    assert(startRes.status === 200, 'Start endpoint returned status 200');
    const startData = await startRes.json();
    assert(startData.gameId, 'Response contains gameId');
    assert(startData.levelNum === 1, 'levelNum matches requested level');
    assert(startData.options && startData.options.length === 4, 'Level 1 returns 4 candidate options');
    assert(typeof startData.clue === 'string' && startData.clue.length > 0, 'First clue is a non-empty string');
    assert(startData.clueIndex === 0, 'clueIndex is 0');
    assert(startData.hintsRemaining === 3, 'hintsRemaining is 3');

    const gameId = startData.gameId;

    // Test 3: POST /api/mindreader/next-clue
    console.log('\n--- Test 3: POST /api/mindreader/next-clue ---');
    const clueRes = await fetch(`${BASE_URL}/api/mindreader/next-clue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    assert(clueRes.status === 200, 'Next clue endpoint returned status 200');
    const clueData = await clueRes.json();
    assert(typeof clueData.clue === 'string' && clueData.clue.length > 0, 'Second clue is a non-empty string');
    assert(clueData.clueIndex === 1, 'clueIndex incremented to 1');
    assert(clueData.cluesExhausted === false, 'cluesExhausted is false');

    // Test 4: POST /api/mindreader/use-hint
    console.log('\n--- Test 4: POST /api/mindreader/use-hint ---');
    const hintRes = await fetch(`${BASE_URL}/api/mindreader/use-hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    assert(hintRes.status === 200, 'Use hint endpoint returned status 200');
    const hintData = await hintRes.json();
    assert(typeof hintData.hint === 'string' && hintData.hint.length > 0, 'First hint text is non-empty');
    assert(hintData.hintsRemaining === 2, 'hintsRemaining decremented to 2');

    // Test 5: POST /api/mindreader/submit-guess
    console.log('\n--- Test 5: POST /api/mindreader/submit-guess ---');
    const guessToTry = startData.options[0];
    const guessRes = await fetch(`${BASE_URL}/api/mindreader/submit-guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, guess: guessToTry })
    });
    assert(guessRes.status === 200, 'Submit guess endpoint returned status 200');
    const guessData = await guessRes.json();
    assert(guessData.correct !== undefined, 'Response contains correct boolean flag');
    assert(guessData.correct ? !!guessData.actualConcept : true, 'Valid response returned for guess');
    assert(guessData.educationalInfo || guessData.cluesRemaining !== undefined, 'Response contains feedback info');

    // Test 6: Verify Session behavior after guess
    console.log('\n--- Test 6: Verify Session Endpoint ---');
    const checkHintRes = await fetch(`${BASE_URL}/api/mindreader/use-hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    assert(checkHintRes.status === 200 || checkHintRes.status === 404, 'Endpoint responds properly for game session');

    console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('All backend integration tests passed successfully!');
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

runTests();
