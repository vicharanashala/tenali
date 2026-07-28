/**
 * AUTOMATED INTEGRATION TESTS FOR TENALI REVERSE MIND READER
 * ═══════════════════════════════════════════════════════════
 * Spawns the backend server on port 4001, fires requests to start, ask questions,
 * get hints, and guess the concept, verifying the expected outputs and rules.
 *
 * Run with: node server/test_reverse_mindreader.js
 */

'use strict';

const { fork } = require('child_process');
const path = require('path');

// Port to run the test server on
const TEST_PORT = 4001;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

// Helper to delay execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('🚀 Starting test Express server...');
  
  // Start server as a child process
  let hasExited = false;
  let exitCode = null;
  let exitSignal = null;

  let stdoutData = '';
  const serverProc = fork(path.join(__dirname, 'index.js'), [], {
    cwd: __dirname,
    env: { ...process.env, PORT: TEST_PORT, MONGO_URI: 'mongodb://127.0.0.1:27017/tenali_test' },
    silent: true
  });

  serverProc.stdout.on('data', (data) => {
    const chunk = data.toString();
    stdoutData += chunk;
    process.stdout.write(chunk);
  });

  serverProc.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  serverProc.on('exit', (code, signal) => {
    hasExited = true;
    exitCode = code;
    exitSignal = signal;
    console.log(`[Test Runner] Server process exited with code ${code} and signal ${signal}`);
  });

  // Clean up child process on exit
  const cleanup = () => {
    console.log('🧹 Killing server process...');
    if (!hasExited) {
      serverProc.kill();
    }
  };

  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  try {
    // Wait for server to bind to port and print startup logs
    await sleep(9000);

    if (hasExited) {
      throw new Error(`Server crashed on startup with code ${exitCode} and signal ${exitSignal}`);
    }

    console.log('\n--- 1. Testing /api/game/start (Easy - Default) ---');
    const startResEasy = await fetch(`${BASE_URL}/api/game/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!startResEasy.ok) {
      throw new Error(`Failed to start game Easy: ${startResEasy.statusText}`);
    }
    
    const startDataEasy = await startResEasy.json();
    console.log('Start Game Easy Response:', startDataEasy);
    if (startDataEasy.questionsRemaining !== 15 || startDataEasy.hintsRemaining !== 3 || startDataEasy.difficulty !== 'easy') {
      throw new Error('Default start game parameters are invalid (expected Easy).');
    }
    console.log('✓ Default (Easy) start game checks passed.');

    console.log('\n--- 1b. Testing /api/game/start (Hard Level) ---');
    const startResHard = await fetch(`${BASE_URL}/api/game/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty: 'hard', allowedCategories: ['Geometry'] })
    });

    if (!startResHard.ok) {
      throw new Error(`Failed to start game Hard: ${startResHard.statusText}`);
    }

    const startDataHard = await startResHard.json();
    console.log('Start Game Hard Response:', startDataHard);
    const { gameId, questionsRemaining, hintsRemaining, state, difficulty } = startDataHard;
    if (!gameId || questionsRemaining !== 6 || hintsRemaining !== 1 || state !== 'PLAYING' || difficulty !== 'hard') {
      throw new Error('Hard level start parameters are invalid.');
    }
    console.log('✓ Hard level start game checks passed (with category filtering).');

    console.log('\n--- 2. Testing /api/game/question ---');
    // Ask a valid question: q_is_number
    const q1Res = await fetch(`${BASE_URL}/api/game/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, questionId: 'q_is_number' })
    });
    
    if (!q1Res.ok) {
      throw new Error(`Failed to ask question: ${q1Res.statusText}`);
    }
    
    const q1Data = await q1Res.json();
    console.log('Question 1 Response:', q1Data);
    
    if (!q1Data.dialogue || !['yes', 'no', 'dontknow'].includes(q1Data.answer) || q1Data.questionsRemaining !== 5) {
      throw new Error('Question 1 response properties are invalid.');
    }
    console.log('✓ Question 1 checks passed.');

    console.log('\n--- 3. Testing Question Validation (Double Ask) ---');
    // Ask the same question again -> should fail with 400
    const qDuplicateRes = await fetch(`${BASE_URL}/api/game/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, questionId: 'q_is_number' })
    });
    
    console.log(`Duplicate Ask status code: ${qDuplicateRes.status}`);
    if (qDuplicateRes.status !== 400) {
      throw new Error('Server allowed duplicate question.');
    }
    const dupData = await qDuplicateRes.json();
    console.log('Duplicate Ask error message:', dupData);
    console.log('✓ Duplicate question prevention checked.');

    console.log('\n--- 4. Testing /api/game/hint ---');
    // Ask for hint 1 (max allowed for Hard is 1)
    const h1Res = await fetch(`${BASE_URL}/api/game/hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    
    if (!h1Res.ok) {
      throw new Error(`Failed to get hint 1: ${h1Res.statusText}`);
    }
    
    const h1Data = await h1Res.json();
    console.log('Hint 1 Response:', h1Data);
    if (!h1Data.dialogue || !h1Data.hint || h1Data.hintsRemaining !== 0) {
      throw new Error('Hint 1 response properties are invalid.');
    }
    console.log('✓ Hint 1 checks passed.');

    // Ask for hint 2 -> should fail because Hard level limits to 1 hint
    const h2Res = await fetch(`${BASE_URL}/api/game/hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
    
    console.log(`Hint 2 (exceeded) status code: ${h2Res.status}`);
    if (h2Res.status !== 400) {
      throw new Error('Server allowed asking for more hints than Hard limit.');
    }
    console.log('✓ Hint limit checks passed.');

    console.log('\n--- 5. Testing /api/game/guess ---');
    // Extract the secret concept name from stdoutData
    const startedMatch = stdoutData.match(/Started session sess_\w+ with concept "([^"]+)" \[Level: hard\] \[Allowed Cats: Geometry\]/);
    if (!startedMatch) {
      throw new Error('Could not find secret concept name with Category filter "Geometry" in server stdout logs.');
    }
    const secretConcept = startedMatch[1];
    console.log(`Detected secret concept from logs: "${secretConcept}"`);

    // Guess the correct concept and pass winStreak: 2
    const guessRes = await fetch(`${BASE_URL}/api/game/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, guess: secretConcept, winStreak: 2 })
    });
    
    if (!guessRes.ok) {
      throw new Error(`Failed to submit guess: ${guessRes.statusText}`);
    }
    
    const guessData = await guessRes.json();
    console.log('Guess Response:', guessData);
    
    if (guessData.correct !== true || !guessData.reward || !guessData.concept) {
      throw new Error('Guess response properties are invalid.');
    }
    
    // Assert streak multiplier calculations
    if (guessData.reward.winStreak !== 3) {
      throw new Error(`Expected winStreak to be 3, got ${guessData.reward.winStreak}`);
    }
    
    // Hard Level base: 20 points
    // Questions remaining: 5 (5 * 2 = 10 bonus)
    // Hints remaining: 0 (0 * 5 = 0 bonus)
    // Hard level bonus: 25 points
    // Base total = 20 + 10 + 0 + 25 = 55 points
    // Streak multiplier: 1.2x -> expected: Math.round(55 * 1.2) = 66
    if (guessData.reward.mrrChange !== 66) {
      throw new Error(`Expected mrrChange to be 66 (55 base * 1.2 multiplier), got ${guessData.reward.mrrChange}`);
    }

    console.log(`✓ Guess completed. Was guess correct? ${guessData.correct}`);
    console.log(`✓ Secret Concept was: ${guessData.concept.name}`);
    console.log(`✓ Win Streak reached: ${guessData.reward.winStreak}`);
    console.log(`✓ MRR Change (including 1.2x streak multiplier & Hard Level bonus): +${guessData.reward.mrrChange}`);

    // Verify Telemetry Output
    console.log('\n--- 6. Verify Telemetry Output ---');
    if (!stdoutData.includes('[ReverseMindReader] Telemetry prepared:')) {
      throw new Error('Telemetry prepared log was not found in server stdout.');
    }
    console.log('✓ Telemetry data verified in server stdout.');

    // Verify session was cleared
    console.log('\n--- 7. Verify Session Cleanup ---');
    const followUpRes = await fetch(`${BASE_URL}/api/game/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, guess: 'Prime Number' })
    });
    
    console.log(`Submitting guess to cleaned-up session status: ${followUpRes.status}`);
    if (followUpRes.status !== 404) {
      throw new Error('Session was not evicted from cache after guess.');
    }
    console.log('✓ Cache cleanup checks passed.');

    console.log('\n🌟 ALL BACKEND TESTS PASSED SUCCESSFULLY! 🌟');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST RUN ENCOUNTERED FAILURE:', err);
    process.exit(1);
  } finally {
    cleanup();
  }
}

runTests();
