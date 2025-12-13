/**
 * IndexedDB Storage Service for InfoGraphix AI
 *
 * Provides persistent storage for generated infographics with:
 * - Large image storage (bypasses localStorage 5MB limit)
 * - Image compression to reduce storage footprint
 * - Quota management with warnings
 * - Auto-cleanup of old versions
 */

import { SavedVersion } from '../types';
import { log } from '../utils/logger';

const DB_NAME = 'infographix_db';
const DB_VERSION = 1;
const STORE_NAME = 'versions';
const MAX_VERSIONS = 50; // Auto-cleanup threshold
const QUOTA_WARNING_THRESHOLD = 0.8; // Warn at 80% capacity

/**
 * Database connection singleton
 */
let dbInstance: IDBDatabase | null = null;

/**
 * Opens or creates the IndexedDB database.
 * Uses singleton pattern to reuse connections.
 */
export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      log.error('IndexedDB error:', request.error);
      reject(new Error('Failed to open database. Please check browser storage permissions.'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create versions store with indexes
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('topic', 'topic', { unique: false });
      }
    };
  });
};

/**
 * Compresses a base64 image by resizing and quality reduction.
 * Returns the original if compression fails or image is already small.
 *
 * @param dataUrl - Base64 data URL of the image
 * @param maxWidth - Maximum width after compression (default 1920)
 * @param quality - JPEG quality 0-1 (default 0.8)
 */
export const compressImage = async (
  dataUrl: string,
  maxWidth = 1920,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve) => {
    // Skip if already small
    if (dataUrl.length < 100000) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Scale down if larger than maxWidth
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try JPEG first (better compression), fallback to original format
      try {
        const compressed = canvas.toDataURL('image/jpeg', quality);
        // Only use compressed if it's actually smaller
        resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

/**
 * Saves a version to IndexedDB with optional image compression.
 *
 * @param version - The SavedVersion object to store
 * @param compress - Whether to compress the image (default true)
 */
export const saveVersion = async (
  version: SavedVersion,
  compress = true
): Promise<void> => {
  const db = await openDatabase();

  // Compress image if enabled
  let versionToSave = version;
  if (compress && version.data.imageUrl.startsWith('data:')) {
    const compressedImage = await compressImage(version.data.imageUrl);
    versionToSave = {
      ...version,
      data: {
        ...version.data,
        imageUrl: compressedImage,
      },
    };
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.put(versionToSave);

    request.onsuccess = () => {
      // Check if cleanup needed
      cleanupOldVersions().catch(log.error);
      resolve();
    };

    request.onerror = () => {
      log.error('Failed to save version:', request.error);
      reject(new Error('Failed to save to storage. Storage may be full.'));
    };
  });
};

/**
 * Retrieves all saved versions, sorted by timestamp (newest first).
 */
export const getAllVersions = async (): Promise<SavedVersion[]> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    const request = index.openCursor(null, 'prev'); // Descending order
    const versions: SavedVersion[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        versions.push(cursor.value);
        cursor.continue();
      } else {
        resolve(versions);
      }
    };

    request.onerror = () => {
      log.error('Failed to load versions:', request.error);
      reject(new Error('Failed to load saved versions.'));
    };
  });
};

/**
 * Retrieves a single version by ID.
 */
export const getVersion = async (id: string): Promise<SavedVersion | null> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error('Failed to retrieve version.'));
    };
  });
};

/**
 * Deletes a version by ID.
 */
export const deleteVersion = async (id: string): Promise<void> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to delete version.'));
  });
};

/**
 * Clears all saved versions.
 */
export const clearAllVersions = async (): Promise<void> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to clear versions.'));
  });
};

/**
 * Automatically removes oldest versions when MAX_VERSIONS is exceeded.
 */
export const cleanupOldVersions = async (): Promise<number> => {
  const versions = await getAllVersions();

  if (versions.length <= MAX_VERSIONS) {
    return 0;
  }

  const toDelete = versions.slice(MAX_VERSIONS);
  let deleted = 0;

  for (const version of toDelete) {
    try {
      await deleteVersion(version.id);
      deleted++;
    } catch (e) {
      log.error('Failed to delete old version:', e);
    }
  }

  log.info(`Auto-cleaned ${deleted} old versions`);
  return deleted;
};

/**
 * Estimates current storage usage and quota.
 * Returns percentage of quota used and warning if approaching limit.
 */
export const checkStorageQuota = async (): Promise<{
  usedMB: number;
  quotaMB: number;
  percentUsed: number;
  warning: boolean;
}> => {
  if (!navigator.storage || !navigator.storage.estimate) {
    return { usedMB: 0, quotaMB: 0, percentUsed: 0, warning: false };
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usedMB = (estimate.usage || 0) / (1024 * 1024);
    const quotaMB = (estimate.quota || 0) / (1024 * 1024);
    const percentUsed = quotaMB > 0 ? (usedMB / quotaMB) : 0;

    return {
      usedMB: Math.round(usedMB * 100) / 100,
      quotaMB: Math.round(quotaMB * 100) / 100,
      percentUsed: Math.round(percentUsed * 100),
      warning: percentUsed >= QUOTA_WARNING_THRESHOLD,
    };
  } catch {
    return { usedMB: 0, quotaMB: 0, percentUsed: 0, warning: false };
  }
};

/**
 * Migrates data from localStorage to IndexedDB (one-time migration).
 * Call this on app startup to handle upgrades from older versions.
 */
export const migrateFromLocalStorage = async (): Promise<number> => {
  const stored = localStorage.getItem('infographix_versions');
  if (!stored) return 0;

  try {
    const versions: SavedVersion[] = JSON.parse(stored);
    let migrated = 0;

    for (const version of versions) {
      try {
        await saveVersion(version, true); // Compress during migration
        migrated++;
      } catch (e) {
        log.error('Failed to migrate version:', e);
      }
    }

    // Clear localStorage after successful migration
    if (migrated > 0) {
      localStorage.removeItem('infographix_versions');
      log.info(`Migrated ${migrated} versions from localStorage to IndexedDB`);
    }

    return migrated;
  } catch (e) {
    log.error('Migration failed:', e);
    return 0;
  }
};

/**
 * Updates the feedback for an existing version.
 */
export const updateVersionFeedback = async (
  id: string,
  feedback: SavedVersion['feedback']
): Promise<void> => {
  const version = await getVersion(id);
  if (!version) {
    throw new Error('Version not found');
  }

  const updated: SavedVersion = {
    ...version,
    feedback,
  };

  await saveVersion(updated, false); // Don't re-compress
};
