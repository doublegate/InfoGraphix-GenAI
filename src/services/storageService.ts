/**
 * IndexedDB Storage Service for InfoGraphix AI - v1.8.0 TD-003
 *
 * Unified storage for all application data:
 * - Versions: Generated infographics with large images
 * - Templates: User-created style configurations
 * - Batch Queues: Batch generation job queues
 * - Form Drafts: Auto-saved form state
 *
 * Benefits over localStorage:
 * - No 5MB limit (can store hundreds of MB)
 * - Asynchronous operations (non-blocking)
 * - Structured data with indexes
 * - Automatic quota management
 */

import { SavedVersion, TemplateConfig } from '../types';
import { log } from '../utils/logger';
import {
  MAX_VERSIONS,
  QUOTA_WARNING_THRESHOLD,
  COMPRESSION_THRESHOLD,
  INDEXED_DB,
  STORAGE_KEYS,
} from '../constants/storage';
import { MAX_WIDTH, IMAGE_QUALITY } from '../constants/performance';

const DB_NAME = INDEXED_DB.NAME;
const DB_VERSION = INDEXED_DB.VERSION;
const STORE_VERSIONS = INDEXED_DB.STORES.VERSIONS;
const STORE_TEMPLATES = INDEXED_DB.STORES.TEMPLATES;
const STORE_BATCH_QUEUES = INDEXED_DB.STORES.BATCH_QUEUES;
const STORE_FORM_DRAFTS = INDEXED_DB.STORES.FORM_DRAFTS;

/**
 * Batch queue item interface
 */
export interface BatchQueueItem {
  id: string;
  topic: string;
  size: string;
  aspectRatio: string;
  style: string;
  palette: string;
  // Matches BatchStatus enum values: pending, processing, complete, failed, cancelled
  status: 'pending' | 'processing' | 'complete' | 'failed' | 'cancelled';
  createdAt: number;
  completedAt?: number;
  result?: unknown;
  error?: string;
}

/**
 * Form draft interface
 */
export interface FormDraft {
  id: 'current'; // Single draft entry
  topic: string;
  size: string;
  aspectRatio: string;
  style: string;
  palette: string;
  filters?: unknown;
  savedAt: number;
}

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
      const oldVersion = event.oldVersion;

      // v1: Create versions store
      if (oldVersion < 1 && !db.objectStoreNames.contains(STORE_VERSIONS)) {
        const versionsStore = db.createObjectStore(STORE_VERSIONS, { keyPath: 'id' });
        versionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        versionsStore.createIndex('topic', 'topic', { unique: false });
      }

      // v2: Create templates, batchQueues, formDrafts stores (v1.8.0 TD-003)
      if (oldVersion < 2) {
        // Templates store
        if (!db.objectStoreNames.contains(STORE_TEMPLATES)) {
          const templatesStore = db.createObjectStore(STORE_TEMPLATES, { keyPath: 'id' });
          templatesStore.createIndex('name', 'name', { unique: false });
          templatesStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Batch queues store
        if (!db.objectStoreNames.contains(STORE_BATCH_QUEUES)) {
          const batchStore = db.createObjectStore(STORE_BATCH_QUEUES, { keyPath: 'id' });
          batchStore.createIndex('status', 'status', { unique: false });
          batchStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Form drafts store (single entry)
        if (!db.objectStoreNames.contains(STORE_FORM_DRAFTS)) {
          db.createObjectStore(STORE_FORM_DRAFTS, { keyPath: 'id' });
        }
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
  maxWidth = MAX_WIDTH,
  quality = IMAGE_QUALITY
): Promise<string> => {
  return new Promise((resolve) => {
    // Skip if already small
    if (dataUrl.length < COMPRESSION_THRESHOLD) {
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
    const transaction = db.transaction([STORE_VERSIONS], 'readwrite');
    const store = transaction.objectStore(STORE_VERSIONS);

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
    const transaction = db.transaction([STORE_VERSIONS], 'readonly');
    const store = transaction.objectStore(STORE_VERSIONS);
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
    const transaction = db.transaction([STORE_VERSIONS], 'readonly');
    const store = transaction.objectStore(STORE_VERSIONS);
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
    const transaction = db.transaction([STORE_VERSIONS], 'readwrite');
    const store = transaction.objectStore(STORE_VERSIONS);
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
    const transaction = db.transaction([STORE_VERSIONS], 'readwrite');
    const store = transaction.objectStore(STORE_VERSIONS);
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
  const stored = localStorage.getItem(STORAGE_KEYS.VERSIONS);
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
      localStorage.removeItem(STORAGE_KEYS.VERSIONS);
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

// ============================================================================
// TEMPLATE CRUD OPERATIONS (v1.8.0 TD-003)
// ============================================================================

/**
 * Saves a template to IndexedDB.
 * Returns the template ID.
 */
export const saveTemplate = async (template: TemplateConfig): Promise<string> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TEMPLATES], 'readwrite');
    const store = transaction.objectStore(STORE_TEMPLATES);
    const request = store.put(template);

    request.onsuccess = () => resolve(template.id);
    request.onerror = () => {
      log.error('Failed to save template:', request.error);
      reject(new Error('Failed to save template.'));
    };
  });
};

/**
 * Retrieves all templates, sorted by createdAt (newest first).
 */
export const getTemplates = async (): Promise<TemplateConfig[]> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TEMPLATES], 'readonly');
    const store = transaction.objectStore(STORE_TEMPLATES);
    const index = store.index('createdAt');
    const request = index.openCursor(null, 'prev');
    const templates: TemplateConfig[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        templates.push(cursor.value);
        cursor.continue();
      } else {
        resolve(templates);
      }
    };

    request.onerror = () => {
      log.error('Failed to load templates:', request.error);
      reject(new Error('Failed to load templates.'));
    };
  });
};

/**
 * Retrieves a single template by ID.
 */
export const getTemplateById = async (id: string): Promise<TemplateConfig | null> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TEMPLATES], 'readonly');
    const store = transaction.objectStore(STORE_TEMPLATES);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error('Failed to retrieve template.'));
  });
};

/**
 * Updates an existing template.
 * Returns the updated template.
 */
export const updateTemplate = async (
  id: string,
  updates: Partial<TemplateConfig>
): Promise<TemplateConfig> => {
  const existing = await getTemplateById(id);
  if (!existing) {
    throw new Error('Template not found');
  }

  const updated: TemplateConfig = {
    ...existing,
    ...updates,
    id, // Ensure ID doesn't change
    updatedAt: Date.now(),
  };

  await saveTemplate(updated);
  return updated;
};

/**
 * Deletes a template by ID.
 */
export const deleteTemplate = async (id: string): Promise<boolean> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TEMPLATES], 'readwrite');
    const store = transaction.objectStore(STORE_TEMPLATES);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => {
      log.error('Failed to delete template:', request.error);
      reject(new Error('Failed to delete template.'));
    };
  });
};

// ============================================================================
// BATCH QUEUE CRUD OPERATIONS (v1.8.0 TD-003)
// ============================================================================

/**
 * Saves a batch queue item to IndexedDB.
 * Returns the item ID.
 */
export const saveBatchQueue = async (item: BatchQueueItem): Promise<string> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_BATCH_QUEUES], 'readwrite');
    const store = transaction.objectStore(STORE_BATCH_QUEUES);
    const request = store.put(item);

    request.onsuccess = () => resolve(item.id);
    request.onerror = () => {
      log.error('Failed to save batch item:', request.error);
      reject(new Error('Failed to save batch item.'));
    };
  });
};

/**
 * Retrieves all batch queue items, sorted by createdAt (newest first).
 */
export const getBatchQueue = async (): Promise<BatchQueueItem[]> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_BATCH_QUEUES], 'readonly');
    const store = transaction.objectStore(STORE_BATCH_QUEUES);
    const index = store.index('createdAt');
    const request = index.openCursor(null, 'prev');
    const items: BatchQueueItem[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        items.push(cursor.value);
        cursor.continue();
      } else {
        resolve(items);
      }
    };

    request.onerror = () => {
      log.error('Failed to load batch queue:', request.error);
      reject(new Error('Failed to load batch queue.'));
    };
  });
};

/**
 * Updates a batch queue item.
 */
export const updateBatchItem = async (
  id: string,
  updates: Partial<BatchQueueItem>
): Promise<void> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_BATCH_QUEUES], 'readwrite');
    const store = transaction.objectStore(STORE_BATCH_QUEUES);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result;
      if (!existing) {
        reject(new Error('Batch item not found'));
        return;
      }

      const updated = { ...existing, ...updates, id };
      const putRequest = store.put(updated);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => {
        log.error('Failed to update batch item:', putRequest.error);
        reject(new Error('Failed to update batch item.'));
      };
    };

    getRequest.onerror = () => {
      reject(new Error('Failed to retrieve batch item.'));
    };
  });
};

/**
 * Deletes a batch queue item by ID.
 */
export const deleteBatchItem = async (id: string): Promise<boolean> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_BATCH_QUEUES], 'readwrite');
    const store = transaction.objectStore(STORE_BATCH_QUEUES);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => {
      log.error('Failed to delete batch item:', request.error);
      reject(new Error('Failed to delete batch item.'));
    };
  });
};

/**
 * Clears all batch queue items.
 */
export const clearBatchQueue = async (): Promise<void> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_BATCH_QUEUES], 'readwrite');
    const store = transaction.objectStore(STORE_BATCH_QUEUES);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to clear batch queue.'));
  });
};

// ============================================================================
// FORM DRAFT OPERATIONS (v1.8.0 TD-003)
// ============================================================================

/**
 * Saves form draft to IndexedDB (single entry with id='current').
 */
export const saveFormDraft = async (draft: FormDraft): Promise<void> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_FORM_DRAFTS], 'readwrite');
    const store = transaction.objectStore(STORE_FORM_DRAFTS);
    const request = store.put({ ...draft, id: 'current' });

    request.onsuccess = () => resolve();
    request.onerror = () => {
      log.error('Failed to save form draft:', request.error);
      reject(new Error('Failed to save form draft.'));
    };
  });
};

/**
 * Retrieves the current form draft.
 */
export const getFormDraft = async (): Promise<FormDraft | null> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_FORM_DRAFTS], 'readonly');
    const store = transaction.objectStore(STORE_FORM_DRAFTS);
    const request = store.get('current');

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error('Failed to retrieve form draft.'));
  });
};

/**
 * Clears the current form draft.
 */
export const clearFormDraft = async (): Promise<void> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_FORM_DRAFTS], 'readwrite');
    const store = transaction.objectStore(STORE_FORM_DRAFTS);
    const request = store.delete('current');

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to clear form draft.'));
  });
};

// ============================================================================
// MIGRATION UTILITIES (v1.8.0 TD-003)
// ============================================================================

/**
 * Migrates templates from localStorage to IndexedDB.
 * Returns count of migrated templates.
 */
export const migrateTemplatesFromLocalStorage = async (): Promise<number> => {
  const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  if (!stored) return 0;

  try {
    const templates: TemplateConfig[] = JSON.parse(stored);
    if (!Array.isArray(templates)) return 0;

    let migrated = 0;
    for (const template of templates) {
      try {
        await saveTemplate(template);
        migrated++;
      } catch (e) {
        log.error('Failed to migrate template:', e);
      }
    }

    if (migrated > 0) {
      localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
      log.info(`Migrated ${migrated} templates from localStorage to IndexedDB`);
    }

    return migrated;
  } catch (e) {
    log.error('Template migration failed:', e);
    return 0;
  }
};

/**
 * Migrates batch queue from localStorage to IndexedDB.
 * Returns count of migrated items.
 */
export const migrateBatchQueueFromLocalStorage = async (): Promise<number> => {
  const stored = localStorage.getItem(STORAGE_KEYS.BATCH_QUEUES);
  if (!stored) return 0;

  try {
    const queues = JSON.parse(stored);
    if (!Array.isArray(queues)) return 0;

    let migrated = 0;
    // Flatten queue items from all queues
    for (const queue of queues) {
      if (queue.items && Array.isArray(queue.items)) {
        for (const item of queue.items) {
          try {
            const batchItem: BatchQueueItem = {
              id: item.id || crypto.randomUUID(),
              topic: item.topic,
              size: item.size,
              aspectRatio: item.aspectRatio,
              style: item.style,
              palette: item.palette,
              status: item.status || 'pending',
              createdAt: item.createdAt || Date.now(),
              completedAt: item.completedAt,
              result: item.result,
              error: item.error,
            };
            await saveBatchQueue(batchItem);
            migrated++;
          } catch (e) {
            log.error('Failed to migrate batch item:', e);
          }
        }
      }
    }

    if (migrated > 0) {
      localStorage.removeItem(STORAGE_KEYS.BATCH_QUEUES);
      log.info(`Migrated ${migrated} batch items from localStorage to IndexedDB`);
    }

    return migrated;
  } catch (e) {
    log.error('Batch queue migration failed:', e);
    return 0;
  }
};

/**
 * Migrates form draft from localStorage to IndexedDB.
 * Returns true if migration succeeded.
 */
export const migrateFormDraftFromLocalStorage = async (): Promise<boolean> => {
  const stored = localStorage.getItem(STORAGE_KEYS.FORM_DRAFT);
  if (!stored) return false;

  try {
    const draft = JSON.parse(stored);
    const formDraft: FormDraft = {
      id: 'current',
      topic: draft.topic || '',
      size: draft.size,
      aspectRatio: draft.aspectRatio,
      style: draft.style,
      palette: draft.palette,
      filters: draft.filters,
      savedAt: Date.now(),
    };

    await saveFormDraft(formDraft);
    localStorage.removeItem(STORAGE_KEYS.FORM_DRAFT);
    log.info('Migrated form draft from localStorage to IndexedDB');
    return true;
  } catch (e) {
    log.error('Form draft migration failed:', e);
    return false;
  }
};

/**
 * Migrates all data from localStorage to IndexedDB.
 * Returns migration statistics.
 */
export const migrateAllFromLocalStorage = async (): Promise<{
  versions: number;
  templates: number;
  batches: number;
  formDraft: boolean;
}> => {
  const [versions, templates, batches, formDraft] = await Promise.all([
    migrateFromLocalStorage(), // Already exists for versions
    migrateTemplatesFromLocalStorage(),
    migrateBatchQueueFromLocalStorage(),
    migrateFormDraftFromLocalStorage(),
  ]);

  const stats = { versions, templates, batches, formDraft };
  log.info('Migration complete:', stats);
  return stats;
};
