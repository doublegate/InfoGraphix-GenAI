/**
 * Storage Helper Utilities
 * v1.9.0 - TD-021: DRY storage services
 *
 * Reusable helpers for localStorage and IndexedDB operations
 * with proper error handling and type safety.
 */

import { log } from './logger';

/**
 * Safely parses a JSON string, returning the fallback value on error.
 *
 * @template T - The expected type of the parsed value
 * @param value - JSON string to parse
 * @param fallback - Default value to return if parsing fails
 * @returns Parsed value or fallback
 *
 * @example
 * ```ts
 * const data = safeParseJSON<string[]>('["a","b"]', []);
 * // Returns ['a', 'b']
 *
 * const invalid = safeParseJSON<string[]>('invalid json', []);
 * // Returns [] (fallback)
 * ```
 */
export function safeParseJSON<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    log.warn('JSON parse failed, using fallback:', error);
    return fallback;
  }
}

/**
 * Safely retrieves and parses a value from localStorage.
 * Returns the fallback value if the key doesn't exist or parsing fails.
 *
 * @template T - The expected type of the stored value
 * @param key - localStorage key
 * @param fallback - Default value to return if retrieval/parsing fails
 * @returns Parsed value from storage or fallback
 *
 * @example
 * ```ts
 * interface Config { theme: string; }
 * const config = safeLocalStorageGet<Config>('app_config', { theme: 'light' });
 * ```
 */
export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return fallback;
    }
    return safeParseJSON<T>(stored, fallback);
  } catch (error) {
    log.error(`Failed to get localStorage item '${key}':`, error);
    return fallback;
  }
}

/**
 * Safely stringifies and stores a value in localStorage.
 * Returns true if successful, false if the operation fails.
 *
 * @template T - The type of the value to store
 * @param key - localStorage key
 * @param value - Value to store (will be JSON.stringify'd)
 * @returns true if successful, false otherwise
 *
 * @example
 * ```ts
 * const success = safeLocalStorageSet('user_prefs', { darkMode: true });
 * if (!success) {
 *   console.error('Failed to save preferences');
 * }
 * ```
 */
export function safeLocalStorageSet<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    log.error(`Failed to set localStorage item '${key}':`, error);
    return false;
  }
}

/**
 * Removes an item from localStorage safely.
 *
 * @param key - localStorage key to remove
 * @returns true if successful, false otherwise
 */
export function safeLocalStorageRemove(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    log.error(`Failed to remove localStorage item '${key}':`, error);
    return false;
  }
}

/**
 * Generic IndexedDB transaction wrapper that handles common patterns.
 * Provides a cleaner API for database operations with automatic error handling.
 *
 * @template T - The type of value returned by the operation
 * @param db - IndexedDB database instance
 * @param storeName - Name of the object store to access
 * @param mode - Transaction mode ('readonly' | 'readwrite')
 * @param operation - Callback that performs the database operation
 * @returns Promise resolving to the operation result
 *
 * @example
 * ```ts
 * // Get a value
 * const version = await indexedDBTransaction(
 *   db,
 *   'versions',
 *   'readonly',
 *   (store) => store.get(id)
 * );
 *
 * // Put a value
 * await indexedDBTransaction(
 *   db,
 *   'versions',
 *   'readwrite',
 *   (store) => store.put(version)
 * );
 * ```
 */
export function indexedDBTransaction<T>(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        log.error(`IndexedDB operation failed on '${storeName}':`, request.error);
        reject(
          new Error(
            `Database operation failed: ${request.error?.message || 'Unknown error'}`
          )
        );
      };

      transaction.onerror = () => {
        log.error(`IndexedDB transaction failed on '${storeName}':`, transaction.error);
        reject(
          new Error(
            `Database transaction failed: ${transaction.error?.message || 'Unknown error'}`
          )
        );
      };
    } catch (error) {
      log.error(`Failed to create IndexedDB transaction for '${storeName}':`, error);
      reject(error);
    }
  });
}

/**
 * Generic IndexedDB cursor iteration wrapper.
 * Simplifies cursor-based operations like getAllVersions().
 *
 * @template T - The type of items in the result array
 * @param db - IndexedDB database instance
 * @param storeName - Name of the object store to access
 * @param indexName - Optional index name to use (uses primary key if not provided)
 * @param direction - Cursor direction ('next' | 'nextunique' | 'prev' | 'prevunique')
 * @param filter - Optional filter function to apply to each item
 * @returns Promise resolving to array of items
 *
 * @example
 * ```ts
 * // Get all versions sorted by timestamp (newest first)
 * const versions = await indexedDBCursorIterate<SavedVersion>(
 *   db,
 *   'versions',
 *   'timestamp',
 *   'prev'
 * );
 *
 * // Get versions filtered by topic
 * const filtered = await indexedDBCursorIterate<SavedVersion>(
 *   db,
 *   'versions',
 *   'topic',
 *   'next',
 *   (v) => v.topic === 'React'
 * );
 * ```
 */
export function indexedDBCursorIterate<T>(
  db: IDBDatabase,
  storeName: string,
  indexName?: string,
  direction: IDBCursorDirection = 'next',
  filter?: (item: T) => boolean
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const source = indexName ? store.index(indexName) : store;
      const request = source.openCursor(null, direction);
      const items: T[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const item = cursor.value as T;
          if (!filter || filter(item)) {
            items.push(item);
          }
          cursor.continue();
        } else {
          resolve(items);
        }
      };

      request.onerror = () => {
        log.error(`IndexedDB cursor iteration failed on '${storeName}':`, request.error);
        reject(
          new Error(
            `Cursor iteration failed: ${request.error?.message || 'Unknown error'}`
          )
        );
      };

      transaction.onerror = () => {
        log.error(`IndexedDB transaction failed on '${storeName}':`, transaction.error);
        reject(
          new Error(
            `Transaction failed: ${transaction.error?.message || 'Unknown error'}`
          )
        );
      };
    } catch (error) {
      log.error(`Failed to create cursor for '${storeName}':`, error);
      reject(error);
    }
  });
}

/**
 * Batch operation for IndexedDB.
 * Executes multiple operations in a single transaction for better performance.
 *
 * @template T - The type of operation results
 * @param db - IndexedDB database instance
 * @param storeName - Name of the object store to access
 * @param mode - Transaction mode ('readonly' | 'readwrite')
 * @param operations - Array of operations to perform
 * @returns Promise resolving to array of results
 *
 * @example
 * ```ts
 * // Save multiple versions at once
 * await indexedDBBatch(
 *   db,
 *   'versions',
 *   'readwrite',
 *   versions.map(v => (store) => store.put(v))
 * );
 * ```
 */
export function indexedDBBatch<T>(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  operations: Array<(store: IDBObjectStore) => IDBRequest<T>>
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      const results: T[] = [];
      let completed = 0;

      operations.forEach((operation, index) => {
        const request = operation(store);

        request.onsuccess = () => {
          results[index] = request.result;
          completed++;

          if (completed === operations.length) {
            resolve(results);
          }
        };

        request.onerror = () => {
          log.error(`Batch operation ${index} failed:`, request.error);
          reject(
            new Error(
              `Batch operation ${index} failed: ${request.error?.message || 'Unknown error'}`
            )
          );
        };
      });

      transaction.onerror = () => {
        log.error(`Batch transaction failed on '${storeName}':`, transaction.error);
        reject(
          new Error(
            `Batch transaction failed: ${transaction.error?.message || 'Unknown error'}`
          )
        );
      };
    } catch (error) {
      log.error(`Failed to create batch transaction for '${storeName}':`, error);
      reject(error);
    }
  });
}

/**
 * Estimates and checks localStorage quota.
 * Returns usage statistics and warnings.
 *
 * @returns Object with used bytes, quota bytes, percentage, and warning flag
 */
export function checkLocalStorageQuota(): {
  usedBytes: number;
  quotaBytes: number;
  percentUsed: number;
  warning: boolean;
} {
  try {
    let usedBytes = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        usedBytes += key.length + (localStorage.getItem(key)?.length || 0);
      }
    }

    // Most browsers have a 5-10MB limit for localStorage
    const quotaBytes = 10 * 1024 * 1024; // Assume 10MB
    const percentUsed = Math.round((usedBytes / quotaBytes) * 100);

    return {
      usedBytes,
      quotaBytes,
      percentUsed,
      warning: percentUsed >= 80,
    };
  } catch (error) {
    log.error('Failed to check localStorage quota:', error);
    return {
      usedBytes: 0,
      quotaBytes: 0,
      percentUsed: 0,
      warning: false,
    };
  }
}
