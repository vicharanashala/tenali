/**
 * TENALI ADVENTURE GAME - BACKEND TEST SUITE
 * ══════════════════════════════════════════════════════════════════════
 * Run with: node test_adventure.js
 */

'use strict';

const assert = require('assert');
const kb = require('./adventure/adventureKB');
const sessionManager = require('./adventure/adventureSessionManager');
const bossEngine = require('./adventure/bossEngine');
const reviewService = require('./adventure/reviewService');
const adventureService = require('./adventure/adventureService');

async function runTests() {
  console.log('🧪 Starting Tenali Adventure Game Test Suite...\n');

  // 1. Test adventureKB Data Loader
  console.log('1️⃣ Testing adventureKB Data Loader...');
  const worlds = kb.getWorlds();
  const levels = kb.getLevels();
  const concepts = kb.getConcepts();

  assert(worlds.length >= 2, 'Should have at least 2 worlds');
  assert(levels.length >= 18, 'Should have at least 18 levels');
  assert(concepts.length >= 18, 'Should have at least 18 concepts');

  const lvl1 = kb.getLevelById('lvl_1_1');
  assert(lvl1 && lvl1.conceptId === 'addition', 'lvl_1_1 should map to addition');
  console.log('  ✅ adventureKB passed!\n');

  // 2. Test adventureSessionManager
  console.log('2️⃣ Testing adventureSessionManager...');
  const sess = sessionManager.createSession({
    userId: 'test_user_1',
    levelId: 'lvl_1_1',
    conceptId: 'addition',
    isBoss: false
  });

  assert(sess.sessionId.startsWith('adv_sess_'), 'Session ID should start with adv_sess_');
  assert.strictEqual(sess.currentClueIndex, 0, 'Initial clue index should be 0');

  const retrieved = sessionManager.getSession(sess.sessionId);
  assert.strictEqual(retrieved.sessionId, sess.sessionId, 'Session should be retrievable');
  console.log('  ✅ adventureSessionManager passed!\n');

  // 3. Test bossEngine
  console.log('3️⃣ Testing bossEngine...');
  const bossLevel = kb.getLevelById('lvl_1_10');
  assert(bossLevel.isBoss === true, 'lvl_1_10 should be a Boss level');

  const bossClues = bossEngine.generateBossClues(bossLevel);
  assert(bossClues.length > 0, 'Boss clues should be generated');

  const isBossCorrect = bossEngine.validateBossGuess('composite_number', 'composite_number');
  assert.strictEqual(isBossCorrect, true, 'Boss guess validation should return true for exact match');

  const bossRewards = bossEngine.calculateBossRewards(2, 0);
  assert.strictEqual(bossRewards.stars, 3, 'Boss rewards should return 3 stars for <=2 clues and 0 hints');
  assert.strictEqual(bossRewards.xpGained, 100, 'Boss rewards should double XP (100 XP)');
  console.log('  ✅ bossEngine passed!\n');

  // 4. Test reviewService
  console.log('4️⃣ Testing reviewService...');
  const review = reviewService.generateReview('addition');
  assert.strictEqual(review.conceptName, 'Addition', 'Review concept name should match');
  assert(review.definition.length > 0, 'Review definition should be non-empty');
  assert(review.workedExample.length > 0, 'Review worked example should be non-empty');
  console.log('  ✅ reviewService passed!\n');

  // 5. Test adventureService Full Gameplay Flow
  console.log('5️⃣ Testing adventureService Gameplay Flow...');
  const gameData = await adventureService.getGameData(null, null);
  assert(gameData.worlds.length >= 2, 'Game data should return worlds');

  // Start Level 1
  const sessionData = await adventureService.startLevel(null, 'lvl_1_1');
  assert(sessionData.sessionId, 'startLevel should return a valid sessionId');
  assert.strictEqual(sessionData.levelId, 'lvl_1_1', 'startLevel should match levelId');

  // Next Clue
  const clue2Data = await adventureService.getNextClue(sessionData.sessionId);
  assert.strictEqual(clue2Data.clueNumber, 2, 'getNextClue should return clueNumber 2');

  // Get Hint
  const hintData = await adventureService.getHint(sessionData.sessionId);
  assert(hintData.hint.length > 0, 'getHint should return hint string');

  // Submit Correct Guess
  const guessResult = await adventureService.submitGuess(sessionData.sessionId, 'addition', null, null);
  assert.strictEqual(guessResult.correct, true, 'submitGuess should be correct for addition');
  assert.strictEqual(guessResult.ended, true, 'Game session should end on correct guess');
  assert(guessResult.progress.completedLevels.includes('lvl_1_1'), 'lvl_1_1 should be added to completedLevels');
  assert(guessResult.progress.xp > 0, 'XP should increase');
  assert(guessResult.review.conceptName === 'Addition', 'Review card should be returned');
  console.log('  ✅ adventureService full flow passed!\n');

  console.log('🎉 ALL TENALI ADVENTURE BACKEND TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
