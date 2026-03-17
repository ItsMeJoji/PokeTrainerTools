import { findAppDataFile, loadFromCloud, saveToCloud } from './drive-service.js';
import { isSignedIn } from './google-auth.js';

const LOCAL_STORAGE_KEY = 'ribbon_entries';

/**
 * SyncManager orchestrates the merging of local and cloud data.
 */
export const SyncManager = {
  isSyncing: false,
  lastSyncTime: null,
  fileId: null,

  /**
   * Merges two sets of journey entries based on unique ID and lastUpdated timestamp.
   * @param {Array} localEntries 
   * @param {Array} cloudEntries 
   * @returns {Array} The merged array.
   */
  mergeEntries(localEntries, cloudEntries) {
    const mergedMap = new Map();

    // Add local entries to the map
    localEntries.forEach(entry => {
      mergedMap.set(entry.id, entry);
    });

    // Merge cloud entries
    cloudEntries.forEach(cloudEntry => {
      if (mergedMap.has(cloudEntry.id)) {
        const localEntry = mergedMap.get(cloudEntry.id);
        const localTime = new Date(localEntry.lastUpdated || 0).getTime();
        const cloudTime = new Date(cloudEntry.lastUpdated || 0).getTime();

        // If cloud is newer, overwrite local
        if (cloudTime > localTime) {
          mergedMap.set(cloudEntry.id, cloudEntry);
        }
      } else {
        // New entry from cloud
        mergedMap.set(cloudEntry.id, cloudEntry);
      }
    });

    return Array.from(mergedMap.values());
  },

  /**
   * Performs a full sync: Load from cloud, merge, and save back if needed.
   * @returns {Promise<Array>} The final merged entries.
   */
  async sync() {
    if (!isSignedIn() || this.isSyncing) return null;

    this.isSyncing = true;
    try {
      // 1. Get file ID
      if (!this.fileId) {
        this.fileId = await findAppDataFile();
      }

      // 2. Load Local
      const localEntries = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');

      let finalEntries = localEntries;

      if (this.fileId) {
        // 3. Load Cloud
        const cloudData = await loadFromCloud(this.fileId);
        const cloudEntries = cloudData.entries || [];

        // 4. Merge
        finalEntries = this.mergeEntries(localEntries, cloudEntries);
      }

      // 5. Save back to Local
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalEntries));

      // 6. Push to Cloud
      await saveToCloud({ entries: finalEntries, lastSync: new Date().toISOString() }, this.fileId);
      
      // Update fileId in case it was just created
      if (!this.fileId) {
        this.fileId = await findAppDataFile();
      }

      this.lastSyncTime = new Date();
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
    if (!isSignedIn() || this.isSyncing) return;
    
    // We reuse the sync logic to ensure we don't overwrite cloud changes made by other devices
    return await this.sync();
  }
};
