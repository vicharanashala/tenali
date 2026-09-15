'use strict';
// Mongoose 9 removed callback-style document middleware (next is undefined).
// seedUsers() calls User.create/save, so a broken pre('save') hook aborts seeding.

const { User } = require('./auth');

const BUILTIN_MW = Symbol.for('mongoose:built-in-middleware');

function userEconomyPreSaveHook() {
  const pres = User.schema.s.hooks._pres.get('save');
  const hook = pres.find((h) => !h.fn[BUILTIN_MW]);
  if (!hook) throw new Error('User economy pre-save hook not found');
  return hook.fn;
}

describe('User pre-save middleware', () => {
  it('syncs economy fields under Mongoose 9 (no next callback)', () => {
    const hook = userEconomyPreSaveHook();
    const doc = new User({ username: 'economy-sync', passwordHash: 'hash', coins: 10 });
    doc.coins = 42;
    doc.markModified('coins');
    expect(() => hook.call(doc)).not.toThrow();
    expect(doc.xp).toBe(42);
    expect(doc.coinBalance).toBe(42);
    expect(doc.xpScore).toBe(42);
  });
});
