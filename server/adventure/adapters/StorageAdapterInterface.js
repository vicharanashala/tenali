/**
 * TENALI ADVENTURE GAME - STORAGE ADAPTER INTERFACE
 * ══════════════════════════════════════════════════════════════════════
 * Base contract for progress persistence adapters.
 */

'use strict';

class StorageAdapterInterface {
  async getProgress(userId) {
    throw new Error('Method getProgress() must be implemented.');
  }

  async saveProgress(userId, progressData) {
    throw new Error('Method saveProgress() must be implemented.');
  }
}

module.exports = StorageAdapterInterface;
