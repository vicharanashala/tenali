const masteryEngine = require('../lil/masteryEngine');
const { ConceptMastery } = require('../lil/models');
const { MASTERY_THRESHOLD } = require('../lil/constants');
const { DEFAULT_PARAMS } = require('../lib/bkt');

describe('LIL Mastery Engine (BKT integration)', () => {
  let mockStore = {};

  beforeEach(() => {
    mockStore = {};
    vi.spyOn(ConceptMastery, 'findOne').mockImplementation(async ({ userId, topicId }) => {
      const key = `${userId}:${topicId}`;
      return mockStore[key] || null;
    });

    vi.spyOn(ConceptMastery.prototype, 'save').mockImplementation(async function() {
      const userIdStr = this.userId ? String(this.userId) : 'user1';
      const topicIdStr = String(this.topicId);
      const key = `${userIdStr}:${topicIdStr}`;
      mockStore[key] = this;
      return this;
    });
  });

  test('one correct answer does NOT immediately mark concept as mastered', async () => {
    const res = await masteryEngine.update('user1', 'addition', true);
    expect(res.isMastered).toBe(false);
    expect(res.newlyMastered).toBe(false);
    expect(res.pMastery).toBeGreaterThan(DEFAULT_PARAMS.pInit);
    expect(res.pMastery).toBeLessThan(MASTERY_THRESHOLD);
  });

  test('correct answer increases pMastery and displayedMasteryPercent', async () => {
    const initial = await masteryEngine.update('user1', 'addition', true);
    const second = await masteryEngine.update('user1', 'addition', true);
    expect(second.pMastery).toBeGreaterThan(initial.pMastery);
    expect(second.displayedMasteryPercent).toBeGreaterThan(initial.displayedMasteryPercent);
  });

  test('incorrect answer decreases pMastery and increases incorrectStreak', async () => {
    // Build up pMastery first
    for (let i = 0; i < 5; i++) {
      await masteryEngine.update('user1', 'addition', true);
    }
    const beforeWrong = await masteryEngine.update('user1', 'addition', true);
    const afterWrong = await masteryEngine.update('user1', 'addition', false);
    expect(afterWrong.pMastery).toBeLessThan(beforeWrong.pMastery);
    expect(afterWrong.incorrectStreak).toBe(1);
  });

  test('flips isMastered and sets newlyMastered to true when crossing MASTERY_THRESHOLD (0.85)', async () => {
    let res;
    // 11 answers should still be below 0.85
    for (let i = 0; i < 11; i++) {
      res = await masteryEngine.update('user1', 'addition', true);
    }
    expect(res.isMastered).toBe(false);

    // 12th correct answer crosses 0.85 threshold
    res = await masteryEngine.update('user1', 'addition', true);
    expect(res.pMastery).toBeGreaterThanOrEqual(MASTERY_THRESHOLD);
    expect(res.isMastered).toBe(true);
    expect(res.newlyMastered).toBe(true);

    // Subsequent correct answer stays mastered but newlyMastered is false
    const resNext = await masteryEngine.update('user1', 'addition', true);
    expect(resNext.isMastered).toBe(true);
    expect(resNext.newlyMastered).toBe(false);
  });

  test('incorrectStreak increment does not independently revoke mastery if pMastery >= 0.85', async () => {
    // Master the concept
    for (let i = 0; i < 15; i++) {
      await masteryEngine.update('user1', 'addition', true);
    }
    // High pMastery (e.g. ~0.9)
    const afterWrong = await masteryEngine.update('user1', 'addition', false);
    expect(afterWrong.incorrectStreak).toBe(1);
    expect(afterWrong.pMastery).toBeGreaterThanOrEqual(MASTERY_THRESHOLD);
    expect(afterWrong.isMastered).toBe(true);
  });
});
