/**
 * Saved Versions Management Hook - v1.8.0 TD-009
 * Manages version history state and localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { SavedVersion } from '../types';
import { log } from '../utils/logger';

const STORAGE_KEY = 'infographix_versions';

interface UseSavedVersionsReturn {
  versions: SavedVersion[];
  isLoading: boolean;
  saveVersion: (version: SavedVersion) => Promise<void>;
  deleteVersion: (id: string) => void;
  clearHistory: () => void;
}

/**
 * Hook to manage saved version history
 * Handles loading from localStorage, saving, deleting, and clearing
 */
export function useSavedVersions(): UseSavedVersionsReturn {
  const [versions, setVersions] = useState<SavedVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load versions from localStorage on mount
  useEffect(() => {
    const loadVersions = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setVersions(JSON.parse(stored));
        }
      } catch (e) {
        log.error('Failed to load version history', e);
      } finally {
        setIsLoading(false);
      }
    };

    void loadVersions();
  }, []);

  // Save a new version
  const saveVersion = useCallback(async (version: SavedVersion) => {
    const updated = [version, ...versions];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setVersions(updated);
    } catch (e) {
      log.error('Failed to save version to history', e);
      throw new Error('Failed to save to history. Local storage might be full (Base64 images are large).');
    }
  }, [versions]);

  // Delete a specific version
  const deleteVersion = useCallback((id: string) => {
    const updated = versions.filter(v => v.id !== id);
    setVersions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [versions]);

  // Clear all history
  const clearHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all history? This cannot be undone.')) {
      setVersions([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    versions,
    isLoading,
    saveVersion,
    deleteVersion,
    clearHistory
  };
}
