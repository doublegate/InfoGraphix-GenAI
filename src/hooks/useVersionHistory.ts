import { useState, useEffect, useCallback } from 'react';
import { SavedVersion, Feedback } from '../types';
import {
  getAllVersions,
  saveVersion,
  deleteVersion,
  clearAllVersions,
  updateVersionFeedback,
  migrateFromLocalStorage,
  checkStorageQuota,
} from '../services/storageService';

/**
 * Storage quota information
 */
interface StorageQuota {
  usedMB: number;
  quotaMB: number;
  percentUsed: number;
  warning: boolean;
}

/**
 * Return type for useVersionHistory hook
 */
interface UseVersionHistoryReturn {
  /** All saved versions, sorted by timestamp (newest first) */
  versions: SavedVersion[];
  /** Loading state while fetching versions */
  isLoading: boolean;
  /** Error message if an operation failed */
  error: string | null;
  /** Current storage quota information */
  storageQuota: StorageQuota | null;
  /** Save a new version */
  save: (version: SavedVersion) => Promise<boolean>;
  /** Delete a version by ID */
  remove: (id: string) => Promise<boolean>;
  /** Clear all saved versions */
  clearAll: () => Promise<boolean>;
  /** Update feedback for a version */
  updateFeedback: (id: string, feedback: Feedback) => Promise<boolean>;
  /** Refresh the versions list */
  refresh: () => Promise<void>;
}

/**
 * Custom hook for managing version history with IndexedDB storage.
 *
 * Features:
 * - Automatic migration from localStorage
 * - Image compression
 * - Storage quota monitoring
 * - Auto-cleanup of old versions
 *
 * @example
 * ```tsx
 * const { versions, save, remove, isLoading, error } = useVersionHistory();
 *
 * const handleSave = async (result) => {
 *   const success = await save({
 *     id: crypto.randomUUID(),
 *     timestamp: Date.now(),
 *     topic: 'My Topic',
 *     ...result
 *   });
 * };
 * ```
 */
export function useVersionHistory(): UseVersionHistoryReturn {
  const [versions, setVersions] = useState<SavedVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageQuota, setStorageQuota] = useState<StorageQuota | null>(null);

  /**
   * Load versions from IndexedDB
   */
  const loadVersions = useCallback(async () => {
    try {
      setError(null);
      const loaded = await getAllVersions();
      setVersions(loaded);

      // Check storage quota
      const quota = await checkStorageQuota();
      setStorageQuota(quota);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load versions';
      setError(message);
      console.error('useVersionHistory load error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initialize: migrate from localStorage and load versions
   */
  useEffect(() => {
    const init = async () => {
      try {
        // One-time migration from localStorage
        await migrateFromLocalStorage();
      } catch (e) {
        console.error('Migration error:', e);
      }

      await loadVersions();
    };

    init();
  }, [loadVersions]);

  /**
   * Save a new version with automatic compression
   */
  const save = useCallback(async (version: SavedVersion): Promise<boolean> => {
    try {
      setError(null);
      await saveVersion(version, true); // Enable compression
      await loadVersions(); // Refresh list
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to save version';
      setError(message);
      console.error('useVersionHistory save error:', e);
      return false;
    }
  }, [loadVersions]);

  /**
   * Delete a version by ID
   */
  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await deleteVersion(id);

      // Optimistic update
      setVersions((prev) => prev.filter((v) => v.id !== id));

      // Check storage quota after deletion
      const quota = await checkStorageQuota();
      setStorageQuota(quota);

      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete version';
      setError(message);
      console.error('useVersionHistory delete error:', e);
      return false;
    }
  }, []);

  /**
   * Clear all saved versions
   */
  const clearAll = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      await clearAllVersions();
      setVersions([]);

      // Check storage quota after clearing
      const quota = await checkStorageQuota();
      setStorageQuota(quota);

      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to clear versions';
      setError(message);
      console.error('useVersionHistory clearAll error:', e);
      return false;
    }
  }, []);

  /**
   * Update feedback for a specific version
   */
  const updateFeedback = useCallback(async (
    id: string,
    feedback: Feedback
  ): Promise<boolean> => {
    try {
      setError(null);
      await updateVersionFeedback(id, feedback);

      // Update local state
      setVersions((prev) =>
        prev.map((v) => (v.id === id ? { ...v, feedback } : v))
      );

      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update feedback';
      setError(message);
      console.error('useVersionHistory updateFeedback error:', e);
      return false;
    }
  }, []);

  /**
   * Refresh the versions list
   */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadVersions();
  }, [loadVersions]);

  return {
    versions,
    isLoading,
    error,
    storageQuota,
    save,
    remove,
    clearAll,
    updateFeedback,
    refresh,
  };
}

export default useVersionHistory;
