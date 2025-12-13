/**
 * Storage Constants
 * v1.9.0 - TD-020: Extract magic numbers to named constants
 *
 * Defines storage-related thresholds and limits for IndexedDB and localStorage
 */

/**
 * Maximum number of saved infographic versions to keep in storage.
 * Older versions are automatically cleaned up when this threshold is exceeded.
 *
 * Rationale: 50 versions provides a reasonable history while preventing unbounded growth.
 * At ~1-2MB per compressed image, 50 versions ≈ 50-100MB of storage.
 */
export const MAX_VERSIONS = 50;

/**
 * Storage quota warning threshold (as a percentage, 0-1).
 * Warns users when storage usage exceeds this percentage of available quota.
 *
 * Rationale: 80% threshold gives users time to clean up before hitting the limit.
 * IndexedDB quota failures can cause data loss, so early warnings are critical.
 */
export const QUOTA_WARNING_THRESHOLD = 0.8;

/**
 * Minimum image size (in bytes) before compression is applied.
 * Images smaller than this threshold are stored as-is.
 *
 * Rationale: 100KB is small enough that compression overhead isn't worthwhile.
 * Compression can sometimes increase file size for already-optimized images.
 */
export const COMPRESSION_THRESHOLD = 100_000; // 100KB

/**
 * Storage key names for localStorage
 */
export const STORAGE_KEYS = {
  /** Saved infographic versions (deprecated - now in IndexedDB) */
  VERSIONS: 'infographix_versions',
  /** Form draft auto-save (deprecated - now in IndexedDB) */
  FORM_DRAFT: 'infographix_form_draft',
  /** Custom color palettes */
  CUSTOM_PALETTES: 'infographix_custom_palettes',
  /** Batch configuration presets */
  BATCH_CONFIGS: 'infographix_batch_configs',
  /** Templates (deprecated - now in IndexedDB) */
  TEMPLATES: 'infographix_templates',
  /** Batch queues (deprecated - now in IndexedDB) */
  BATCH_QUEUES: 'infographix_batch_queues',
} as const;

/**
 * IndexedDB database configuration
 */
export const INDEXED_DB = {
  /** Database name */
  NAME: 'infographix_db',
  /** Current database version */
  VERSION: 2,
  /** Object store names */
  STORES: {
    VERSIONS: 'versions',
    TEMPLATES: 'templates',
    BATCH_QUEUES: 'batchQueues',
    FORM_DRAFTS: 'formDrafts',
  },
} as const;
