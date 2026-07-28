/**
 * TENALI ADVENTURE GAME - LOCAL STORAGE ADAPTER (CLIENT)
 * ══════════════════════════════════════════════════════════════════════
 * Handles reading and saving guest progress in browser localStorage.
 *
 * MIGRATION
 * ---------
 * World IDs have changed across versions:
 *   world_1             → number_kingdom
 *   arithmetic_kingdom  → number_kingdom  (was formerly the first world)
 * Any stale localStorage entry containing these old IDs is migrated on read.
 *
 * VERSION RESET
 * -------------
 * When DATA_VERSION changes, all saved progress is wiped and the player
 * starts fresh. Bump this number whenever the world/level structure changes
 * in a way that makes old progress incompatible.
 */

const STORAGE_KEY    = 'tenali-adventure-guest-progress';
const VERSION_KEY    = 'tenali-adventure-data-version';
const DATA_VERSION   = 3;   // bump when world IDs or level structure changes

const DEFAULT_GUEST_PROGRESS = {
  xp: 0,
  totalStars: 0,
  completedLevels: [],
  unlockedWorlds: ['number_kingdom'],
  levelStars: {},
  highestScore: 0
};

/**
 * Map of old world IDs → current world IDs.
 * Add entries here whenever a world ID changes.
 */
const WORLD_ID_MIGRATION = {
  'world_1':            'number_kingdom',
  'arithmetic_kingdom': 'number_kingdom',  // arithmetic_kingdom was the old first world
};

/**
 * Migrate a list of world IDs, replacing any stale IDs with current ones.
 * Deduplicates the result.
 */
function migrateWorldIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return ['number_kingdom'];
  const migrated = ids.map(id => WORLD_ID_MIGRATION[id] || id);
  return [...new Set(migrated)];
}

export const LocalStorageAdapter = {
  /**
   * Run version check on startup. If stored version doesn't match DATA_VERSION,
   * wipe the old progress and write the new version stamp.
   * Call this once when the app loads — it's a no-op after first run.
   */
  checkVersion: () => {
    try {
      const saved = parseInt(localStorage.getItem(VERSION_KEY) || '0', 10);
      if (saved !== DATA_VERSION) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
      }
    } catch (_) {}
  },

  getProgress: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_GUEST_PROGRESS };

      const parsed = JSON.parse(raw);

      const unlockedRaw = Array.isArray(parsed.unlockedWorlds) && parsed.unlockedWorlds.length > 0
        ? parsed.unlockedWorlds
        : ['number_kingdom'];

      const unlockedWorlds = migrateWorldIds(unlockedRaw);

      const progress = {
        xp:               parsed.xp || 0,
        totalStars:       parsed.totalStars || 0,
        completedLevels:  Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [],
        unlockedWorlds,
        levelStars:       parsed.levelStars || {},
        highestScore:     parsed.highestScore || 0
      };

      // If migration changed anything, write back immediately so next read is clean
      const originalStr = JSON.stringify(parsed.unlockedWorlds);
      const migratedStr = JSON.stringify(unlockedWorlds);
      if (originalStr !== migratedStr) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (_) {}
      }

      return progress;
    } catch (_e) {
      return { ...DEFAULT_GUEST_PROGRESS };
    }
  },

  saveProgress: (progress) => {
    try {
      const normalized = {
        xp:              progress.xp || 0,
        totalStars:      progress.totalStars || 0,
        completedLevels: progress.completedLevels || [],
        unlockedWorlds:  migrateWorldIds(progress.unlockedWorlds || ['number_kingdom']),
        levelStars:      progress.levelStars || {},
        highestScore:    progress.highestScore || 0
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    } catch (_e) {
      return progress;
    }
  },

  /**
   * Hard-reset all adventure progress. Useful for debugging or "start over".
   */
  clearProgress: () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }
};
