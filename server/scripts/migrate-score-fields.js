'use strict';
/**
 * Migration for issue #89 — consolidate duplicate score fields.
 *
 * Canonical score fields: { coins, xp, totalSolved }.
 * The deprecated duplicates (coinBalance, xpScore) are absorbed into the
 * canonical fields and removed from every user document:
 *
 *   coins = max(coins, coinBalance)   // no data loss
 *   xp    = max(xp,    xpScore)
 *
 * Why max():
 *   - While the old UserSchema pre('save') mirror hook existed, all four
 *     fields always held the same number, so max() is that number (never a
 *     double-count — summing them would corrupt balances).
 *   - For documents written before that hook, the deprecated field is the one
 *     the legacy code actually incremented (e.g. coinBalance), while the
 *     canonical field may still hold its untouched schema default. max()
 *     keeps the larger, i.e. the real balance.
 *   - Non-numeric junk in a deprecated field counts as 0.
 *
 * The run is idempotent: after a successful pass no document matches the
 * filter again, so a rerun is a no-op. Interrupted runs resume where they
 * stopped (each document is migrated with its own updateOne).
 *
 * Usage:
 *   node scripts/migrate-score-fields.js            # apply
 *   node scripts/migrate-score-fields.js --dry-run  # count only, no writes
 *
 * Reads MONGO_URI (default mongodb://127.0.0.1:27017/tenali).
 */

const mongoose = require('mongoose');

// Docs that still carry at least one deprecated field.
const LEGACY_FILTER = {
  $or: [{ coinBalance: { $exists: true } }, { xpScore: { $exists: true } }],
};

// Schema defaults for the canonical fields (auth.js UserSchema).
const COINS_DEFAULT = 500;
const XP_DEFAULT = 500;

/**
 * Picks the no-loss value for one canonical field.
 * Missing canonical field → schema default (unless a legacy value exists);
 * both present → the larger; legacy junk → ignored.
 */
function resolve(primary, legacy, fallback) {
  const primaryOk = typeof primary === 'number' && Number.isFinite(primary);
  const legacyOk = typeof legacy === 'number' && Number.isFinite(legacy);
  if (primaryOk && legacyOk) return Math.max(primary, legacy);
  if (primaryOk) return primary;
  if (legacyOk) return legacy;
  if (primary === undefined) return fallback;
  return 0;
}

/**
 * Migrate one mongoose model's collection (raw driver access, because the
 * deprecated paths are no longer part of the schema and would be stripped by
 * mongoose reads).
 *
 * @param {import('mongoose').Model} model  the User (or UserStats) model
 * @param {{ dryRun?: boolean }} [options]
 * @returns {Promise<{ matched: number, modified: number, dryRun: boolean }>}
 */
async function migrateScoreFields(model, options = {}) {
  const { dryRun = false } = options;
  const collection = model.collection;

  const legacyDocs = await collection.find(LEGACY_FILTER).toArray();
  if (dryRun) return { matched: legacyDocs.length, modified: 0, dryRun: true };

  let modified = 0;
  for (const doc of legacyDocs) {
    const $set = {
      coins: resolve(doc.coins, doc.coinBalance, COINS_DEFAULT),
      xp: resolve(doc.xp, doc.xpScore, XP_DEFAULT),
    };
    const $unset = {};
    if ('coinBalance' in doc) $unset.coinBalance = '';
    if ('xpScore' in doc) $unset.xpScore = '';
    await collection.updateOne({ _id: doc._id }, { $set, $unset });
    modified += 1;
  }
  return { matched: legacyDocs.length, modified, dryRun: false };
}

/**
 * The unused UserStats collection may still hold a deprecated xpScore field
 * (the model no longer declares it). Drop the field; the stats it named were
 * never read anywhere.
 */
async function migrateLegacyStats(model, options = {}) {
  const { dryRun = false } = options;
  const collection = model.collection;
  const filter = { xpScore: { $exists: true } };
  const matched = await collection.countDocuments(filter);
  if (dryRun || matched === 0) return { matched, modified: 0, dryRun: !!dryRun };
  const result = await collection.updateMany(filter, { $unset: { xpScore: '' } });
  return { matched, modified: result.modifiedCount, dryRun: false };
}

module.exports = { migrateScoreFields, migrateLegacyStats };

if (require.main === module) {
  (async () => {
    const dryRun = process.argv.includes('--dry-run');
    const auth = require('../auth');
    await auth.connectMongo();
    if (dryRun) console.log('[migrate-score-fields] dry run — no writes');

    const users = await migrateScoreFields(auth.User, { dryRun });
    console.log(`[migrate-score-fields] users: ${users.matched} with legacy fields, ${users.modified} migrated`);

    const stats = await migrateLegacyStats(auth.UserStats, { dryRun });
    console.log(`[migrate-score-fields] userstats: ${stats.matched} with legacy fields, ${stats.modified} cleaned`);

    await mongoose.disconnect();
  })().catch((err) => {
    console.error('[migrate-score-fields] failed:', err);
    process.exit(1);
  });
}
