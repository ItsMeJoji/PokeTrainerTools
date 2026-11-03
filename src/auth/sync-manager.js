import { findAppDataFile, loadFromCloud, saveToCloud } from './drive-service.js';
import { isSignedIn } from './google-auth.js';

const LOCAL_STORAGE_KEY = 'ribbon_entries';
const DELETED_STORAGE_KEY = 'ribbon_deleted_entries';
const TOMBSTONE_RETENTION_MS = 60 * 24 * 60 * 60 * 1000; // 60 days retention

/**
 * SyncManager orchestrates the merging of local and cloud data.
 */
export const SyncManager = {
  isSyncing: false,
  needsResync: false,
  lastSyncTime: null,
  fileId: null,

  /**
   * Retrieves deleted entries (tombstones) from localStorage.
   * @returns {Object.<string, string>} Map of entry ID to deletedAt ISO string.
   */
  getDeletedEntries() {
    try {
      const raw = localStorage.getItem(DELETED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  /**
   * Records a tombstone for a deleted entry.
   * @param {string} entryId - The ID of the deleted entry.
   */
  recordDeletion(entryId) {
    if (!entryId) return;
    const deleted = this.getDeletedEntries();
    deleted[entryId] = new Date().toISOString();
    try {
      localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deleted));
    } catch (e) {
      console.error('Failed to save deleted entries:', e);
    }
  },

  /**
   * Merges two sets of journey entries based on unique ID, lastUpdated timestamp,
   * and tombstone deletion tracking.
   * @param {Array} localEntries 
   * @param {Array} cloudEntries 
   * @param {Object} [localDeleted] - Map of entryId -> deletedAt ISO string
   * @param {Object} [cloudDeleted] - Map of entryId -> deletedAt ISO string
   * @returns {{ entries: Array, deletedEntries: Object }} The merged entries and tombstones.
   */
  mergeEntries(localEntries = [], cloudEntries = [], localDeleted = null, cloudDeleted = {}) {
    const activeLocalDeleted = localDeleted !== null ? localDeleted : this.getDeletedEntries();

    // 1. Merge tombstones (deleted entries)
    const mergedDeleted = { ...activeLocalDeleted };
    for (const [id, cloudTimeStr] of Object.entries(cloudDeleted || {})) {
      const cloudTime = new Date(cloudTimeStr).getTime();
      const localTime = mergedDeleted[id] ? new Date(mergedDeleted[id]).getTime() : 0;
      if (cloudTime > localTime) {
        mergedDeleted[id] = cloudTimeStr;
      }
    }

    // Prune old tombstones past retention period
    const cutoff = Date.now() - TOMBSTONE_RETENTION_MS;
    for (const [id, timeStr] of Object.entries(mergedDeleted)) {
      if (new Date(timeStr).getTime() < cutoff) {
        delete mergedDeleted[id];
      }
    }

    const mergedMap = new Map();

    // 2. Add local entries that have not been deleted
    localEntries.forEach(entry => {
      if (!entry || !entry.id) return;
      const entryTime = new Date(entry.lastUpdated || 0).getTime();
      const deletedTime = mergedDeleted[entry.id] ? new Date(mergedDeleted[entry.id]).getTime() : 0;

      // Keep only if never deleted, or updated after deletion
      if (deletedTime === 0 || entryTime > deletedTime) {
        mergedMap.set(entry.id, entry);
      }
    });

    // 3. Merge cloud entries
    cloudEntries.forEach(cloudEntry => {
      if (!cloudEntry || !cloudEntry.id) return;
      const cloudTime = new Date(cloudEntry.lastUpdated || 0).getTime();
      const deletedTime = mergedDeleted[cloudEntry.id] ? new Date(mergedDeleted[cloudEntry.id]).getTime() : 0;

      // If cloud entry was deleted and has not been updated since, do not restore it
      if (deletedTime > 0 && cloudTime <= deletedTime) {
        return;
      }

      if (mergedMap.has(cloudEntry.id)) {
        const localEntry = mergedMap.get(cloudEntry.id);
        const localTime = new Date(localEntry.lastUpdated || 0).getTime();

        // If cloud is newer, overwrite local
        if (cloudTime > localTime) {
          mergedMap.set(cloudEntry.id, cloudEntry);
        }
      } else {
        // New entry from cloud (not deleted)
        mergedMap.set(cloudEntry.id, cloudEntry);
      }
    });

    return {
      entries: Array.from(mergedMap.values()),
      deletedEntries: mergedDeleted,
    };
  },

  /**
   * Performs a full sync: Load from cloud, merge, and save back if needed.
   * @returns {Promise<Array>} The final merged entries.
   */
  async sync() {
    if (!isSignedIn()) return null;

    if (this.isSyncing) {
      this.needsResync = true;
      return null;
    }

    this.isSyncing = true;
    try {
      let finalEntries = [];

      while (true) {
        this.needsResync = false;

        // 1. Get file ID
        if (!this.fileId) {
          this.fileId = await findAppDataFile();
        }

        // 2. Load Local
        const localEntries = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        const localDeleted = this.getDeletedEntries();

        finalEntries = localEntries;
        let finalDeleted = localDeleted;

        if (this.fileId) {
          // 3. Load Cloud
          const cloudData = await loadFromCloud(this.fileId);
          const cloudEntries = Array.isArray(cloudData) ? cloudData : (cloudData?.entries || []);
          const cloudDeleted = Array.isArray(cloudData) ? {} : (cloudData?.deletedEntries || {});

          // 4. Merge
          const merged = this.mergeEntries(localEntries, cloudEntries, localDeleted, cloudDeleted);
          finalEntries = merged.entries;
          finalDeleted = merged.deletedEntries;
        }

        // 5. Save back to Local
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalEntries));
        localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(finalDeleted));

        // 6. Push to Cloud
        await saveToCloud({
          entries: finalEntries,
          deletedEntries: finalDeleted,
          lastSync: new Date().toISOString()
        }, this.fileId);

        // Update fileId in case it was just created
        if (!this.fileId) {
          this.fileId = await findAppDataFile();
        }

        this.lastSyncTime = new Date();

        if (!this.needsResync) {
          break;
        }
      }

      return finalEntries;
    } catch (err) {
      console.error('Sync failed:', err);
      throw err;
    } finally {
      this.isSyncing = false;
    }
  },

  /**
   * Debounced push to cloud.
   */
  async push() {
    if (!isSignedIn()) return;
    
    // We reuse the sync logic to ensure we don't overwrite cloud changes made by other devices
    return await this.sync();
  }
};
