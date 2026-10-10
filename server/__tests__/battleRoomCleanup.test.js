const { rooms, cleanupRooms } = require('../index.js');

describe('Battle Room Cleanup (185 E)', () => {
  beforeEach(() => {
    rooms.clear();
  });

  afterEach(() => {
    rooms.clear();
  });

  it('prunes ended rooms older than 10 minutes', () => {
    const now = Date.now();
    const tenMinsMs = 10 * 60 * 1000;

    // Room ended 11 minutes ago -> should be pruned
    rooms.set('OLD1', {
      code: 'OLD1',
      state: 'ended',
      createdAt: now - (tenMinsMs + 60000),
      lastActiveAt: now - (tenMinsMs + 60000),
    });

    // Room ended 5 minutes ago -> should remain
    rooms.set('NEW1', {
      code: 'NEW1',
      state: 'ended',
      createdAt: now - (5 * 60 * 1000),
      lastActiveAt: now - (5 * 60 * 1000),
    });

    const pruned = cleanupRooms(now);

    expect(pruned).toBe(1);
    expect(rooms.has('OLD1')).toBe(false);
    expect(rooms.has('NEW1')).toBe(true);
  });

  it('prunes inactive abandoned rooms older than 30 minutes', () => {
    const now = Date.now();
    const thirtyMinsMs = 30 * 60 * 1000;

    // Room in waiting state inactive for 35 minutes -> should be pruned
    rooms.set('ABAN', {
      code: 'ABAN',
      state: 'waiting',
      createdAt: now - (thirtyMinsMs + 5 * 60 * 1000),
      lastActiveAt: now - (thirtyMinsMs + 5 * 60 * 1000),
    });

    // Room in playing state active 10 minutes ago -> should remain
    rooms.set('ACTV', {
      code: 'ACTV',
      state: 'playing',
      createdAt: now - (20 * 60 * 1000),
      lastActiveAt: now - (10 * 60 * 1000),
    });

    const pruned = cleanupRooms(now);

    expect(pruned).toBe(1);
    expect(rooms.has('ABAN')).toBe(false);
    expect(rooms.has('ACTV')).toBe(true);
  });

  it('clears roundTimer when pruning an expired room with active timer', () => {
    const now = Date.now();
    const fakeTimer = setTimeout(() => {}, 100000);

    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    rooms.set('TIMR', {
      code: 'TIMR',
      state: 'ended',
      createdAt: now - (15 * 60 * 1000),
      lastActiveAt: now - (15 * 60 * 1000),
      roundTimer: fakeTimer,
    });

    const pruned = cleanupRooms(now);

    expect(pruned).toBe(1);
    expect(rooms.has('TIMR')).toBe(false);
    expect(clearTimeoutSpy).toHaveBeenCalledWith(fakeTimer);
    clearTimeoutSpy.mockRestore();
  });
});
