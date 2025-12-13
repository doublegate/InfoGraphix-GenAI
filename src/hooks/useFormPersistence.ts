import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AspectRatio,
  ColorPalette,
  GithubFilters,
  ImageSize,
  InfographicStyle,
} from '../types';
import { log } from '../utils/logger';
import {
  getFormDraft,
  saveFormDraft,
  clearFormDraft as clearFormDraftFromDB,
  migrateFormDraftFromLocalStorage,
  FormDraft,
} from '../services/storageService';

const DEBOUNCE_MS = 1000; // Save after 1 second of inactivity

// Migration flag
let migrationComplete = false;

/**
 * Form values that can be persisted
 */
export interface FormValues {
  topic: string;
  size: ImageSize;
  aspectRatio: AspectRatio;
  style: InfographicStyle;
  palette: ColorPalette;
  filters?: GithubFilters;
}

/**
 * Default form values
 */
export const DEFAULT_FORM_VALUES: FormValues = {
  topic: '',
  size: ImageSize.Resolution_1K,
  aspectRatio: AspectRatio.Portrait,
  style: InfographicStyle.Modern,
  palette: ColorPalette.BlueWhite,
  filters: undefined,
};

/**
 * Validates and sanitizes form values from storage
 */
const validateFormValues = (data: unknown): FormValues | null => {
  if (!data || typeof data !== 'object') return null;

  const obj = data as Record<string, unknown>;

  // Validate topic
  if (typeof obj.topic !== 'string') return null;

  // Validate enums
  const validSizes = Object.values(ImageSize);
  const validRatios = Object.values(AspectRatio);
  const validStyles = Object.values(InfographicStyle);
  const validPalettes = Object.values(ColorPalette);

  if (!validSizes.includes(obj.size as ImageSize)) return null;
  if (!validRatios.includes(obj.aspectRatio as AspectRatio)) return null;
  if (!validStyles.includes(obj.style as InfographicStyle)) return null;
  if (!validPalettes.includes(obj.palette as ColorPalette)) return null;

  // Validate optional filters
  let filters: GithubFilters | undefined;
  if (obj.filters && typeof obj.filters === 'object') {
    const f = obj.filters as Record<string, unknown>;
    filters = {
      language: typeof f.language === 'string' ? f.language : undefined,
      fileExtensions: typeof f.fileExtensions === 'string' ? f.fileExtensions : undefined,
      lastUpdatedAfter: typeof f.lastUpdatedAfter === 'string' ? f.lastUpdatedAfter : undefined,
    };
  }

  return {
    topic: obj.topic as string,
    size: obj.size as ImageSize,
    aspectRatio: obj.aspectRatio as AspectRatio,
    style: obj.style as InfographicStyle,
    palette: obj.palette as ColorPalette,
    filters,
  };
};

/**
 * Return type for useFormPersistence hook
 */
interface UseFormPersistenceReturn {
  /** Current form values (from storage or defaults) */
  values: FormValues;
  /** Whether initial values have loaded */
  isLoaded: boolean;
  /** Update form values (triggers auto-save) */
  updateValues: (updates: Partial<FormValues>) => void;
  /** Set all form values at once */
  setValues: (values: FormValues) => void;
  /** Clear saved form data */
  clearDraft: () => void;
  /** Save immediately (bypasses debounce) */
  saveNow: () => void;
}

/**
 * Custom hook for auto-saving form state to IndexedDB.
 * v1.8.0 TD-003: Migrated from localStorage to IndexedDB
 *
 * Features:
 * - Debounced auto-save (saves after 1 second of inactivity)
 * - Type-safe validation on load
 * - Graceful handling of corrupted data
 * - Automatic migration from localStorage
 *
 * @example
 * ```tsx
 * const { values, updateValues, isLoaded } = useFormPersistence();
 *
 * const handleTopicChange = (e) => {
 *   updateValues({ topic: e.target.value });
 * };
 * ```
 */
export function useFormPersistence(): UseFormPersistenceReturn {
  const [values, setValuesState] = useState<FormValues>(DEFAULT_FORM_VALUES);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Ensures migration from localStorage has been performed.
   */
  const ensureMigration = useCallback(async () => {
    if (migrationComplete) return;

    try {
      const migrated = await migrateFormDraftFromLocalStorage();
      if (migrated) {
        log.info('Form draft migrated from localStorage to IndexedDB');
      }
      migrationComplete = true;
    } catch (e) {
      log.error('Form draft migration error:', e);
      migrationComplete = true;
    }
  }, []);

  /**
   * Load saved form data on mount
   */
  useEffect(() => {
    const loadDraft = async () => {
      try {
        await ensureMigration();

        const draft = await getFormDraft();
        if (draft) {
          const formValues: FormValues = {
            topic: draft.topic,
            size: draft.size as ImageSize,
            aspectRatio: draft.aspectRatio as AspectRatio,
            style: draft.style as InfographicStyle,
            palette: draft.palette as ColorPalette,
            filters: draft.filters as GithubFilters | undefined,
          };

          const validated = validateFormValues(formValues);
          if (validated) {
            setValuesState(validated);
          } else {
            log.warn('Invalid form draft data, using defaults');
          }
        }
      } catch (e) {
        log.error('Failed to load form draft:', e);
      } finally {
        setIsLoaded(true);
      }
    };

    loadDraft();
  }, [ensureMigration]);

  /**
   * Save form values to IndexedDB
   */
  const saveToStorage = useCallback(async (valuesToSave: FormValues) => {
    try {
      const draft: FormDraft = {
        id: 'current',
        topic: valuesToSave.topic,
        size: valuesToSave.size as string,
        aspectRatio: valuesToSave.aspectRatio as string,
        style: valuesToSave.style as string,
        palette: valuesToSave.palette as string,
        filters: valuesToSave.filters,
        savedAt: Date.now(),
      };

      await saveFormDraft(draft);
    } catch (e) {
      log.error('Failed to save form draft:', e);
    }
  }, []);

  /**
   * Debounced save function
   */
  const debouncedSave = useCallback((valuesToSave: FormValues) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage(valuesToSave);
    }, DEBOUNCE_MS);
  }, [saveToStorage]);

  /**
   * Clean up timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Update specific form values
   */
  const updateValues = useCallback((updates: Partial<FormValues>) => {
    setValuesState((prev) => {
      const updated = { ...prev, ...updates };
      debouncedSave(updated);
      return updated;
    });
  }, [debouncedSave]);

  /**
   * Set all form values at once
   */
  const setValues = useCallback((newValues: FormValues) => {
    setValuesState(newValues);
    debouncedSave(newValues);
  }, [debouncedSave]);

  /**
   * Clear saved form data
   */
  const clearDraft = useCallback(async () => {
    setValuesState(DEFAULT_FORM_VALUES);
    try {
      await clearFormDraftFromDB();
    } catch (e) {
      log.error('Failed to clear form draft:', e);
    }
  }, []);

  /**
   * Save immediately (bypasses debounce)
   */
  const saveNow = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    // Fire and forget - don't await
    saveToStorage(values).catch(e => log.error('Failed to save form draft:', e));
  }, [values, saveToStorage]);

  return {
    values,
    isLoaded,
    updateValues,
    setValues,
    clearDraft,
    saveNow,
  };
}

export default useFormPersistence;
