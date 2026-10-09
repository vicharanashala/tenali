/**
 * TENALI ADVENTURE GAME - PROGRESS SERVICE
 * ══════════════════════════════════════════════════════════════════════
 * Storage-independent progress service. Coordinates between MongoDB adapter
 * and Guest LocalStorage payloads so game services never care about storage implementation.
 */

'use strict';

const mongoAdapter = require('./adapters/MongoAdapter');
const config = require('./adventureConfig');

const DEFAULT_PROGRESS = {
  xp: 0,
  totalStars: 0,
  completedLevels: [],
  unlockedWorlds: config.DEFAULT_UNLOCKED_WORLDS,
  levelStars: {},
  highestScore: 0
};

/** Legacy world IDs that must be mapped to current IDs on the server side. */
const WORLD_ID_MIGRATION = {
  'world_1':            'number_kingdom',
  'arithmetic_kingdom': 'number_kingdom',
};

function migrateWorldIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [...config.DEFAULT_UNLOCKED_WORLDS];
  const migrated = ids.map(id => WORLD_ID_MIGRATION[id] || id);
  return [...new Set(migrated)];
}

class AdventureProgressService {
  /**
   * Normalizes raw progress input into a valid AdventureProgress object.
   */
  normalizeProgress(raw) {
    if (!raw || typeof raw !== 'object') return { ...DEFAULT_PROGRESS };
    // Start with defaults and overlay provided values
    const unlocked = Array.isArray(raw.unlockedWorlds) && raw.unlockedWorlds.length > 0
      ? migrateWorldIds(raw.unlockedWorlds)
      : config.DEFAULT_UNLOCKED_WORLDS;
    // Ensure default worlds are always present
    const finalUnlocked = Array.from(new Set([...config.DEFAULT_UNLOCKED_WORLDS, ...unlocked]));
    return {
      xp: typeof raw.xp === 'number' ? raw.xp : 0,
      totalStars: typeof raw.totalStars === 'number' ? raw.totalStars : 0,
      completedLevels: Array.isArray(raw.completedLevels) ? raw.completedLevels : [],
      unlockedWorlds: finalUnlocked,
      levelStars: raw.levelStars && typeof raw.levelStars === 'object' ? raw.levelStars : {},
      highestScore: typeof raw.highestScore === 'number' ? raw.highestScore : 0
    };
  }

  /**
   * Gets progress for a user or normalizes guest payload.
   */
  async getProgress(userContext, guestProgressPayload) {
    if (userContext && userContext._id) {
      const dbProgress = await mongoAdapter.getProgress(userContext._id);
      if (dbProgress) {
        // Always normalize DB results — catches any stale world IDs in MongoDB
        return this.normalizeProgress(dbProgress);
      }
    }
    return this.normalizeProgress(guestProgressPayload);
  }

  /**
   * Saves progress for a user (DB) or returns normalized payload for Guest.
   */
  async saveProgress(userContext, updatedProgress) {
    const normalized = this.normalizeProgress(updatedProgress);
    if (userContext && userContext._id) {
      await mongoAdapter.saveProgress(userContext._id, normalized);
    }
    return normalized;
  }
}

module.exports = new AdventureProgressService();
