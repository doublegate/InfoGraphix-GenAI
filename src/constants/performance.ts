/**
 * Performance Constants
 * v1.9.0 - TD-020: Extract magic numbers to named constants
 *
 * Defines performance-related thresholds for image processing and batch operations
 */

/**
 * Maximum image width (in pixels) for compression.
 * Images wider than this are scaled down to conserve storage and improve performance.
 *
 * Rationale: 1920px (1080p width) is sufficient for most displays while keeping
 * file sizes manageable. 4K displays can still view these images at high quality.
 */
export const MAX_WIDTH = 1920;

/**
 * JPEG quality for image compression (0-1 scale).
 * Lower values = smaller file size but lower quality.
 *
 * Rationale: 0.8 (80%) quality provides excellent visual fidelity while reducing
 * file size by ~60-70% compared to PNG. Visual differences are imperceptible
 * for most infographic content.
 */
export const IMAGE_QUALITY = 0.8;

/**
 * Delay between batch generation items (in milliseconds).
 * Prevents overwhelming the API with rapid requests.
 *
 * Rationale: 2000ms (2 seconds) provides a reasonable balance between throughput
 * and API rate limiting. Gemini API has rate limits, so spacing requests prevents
 * 429 errors during batch operations.
 */
export const DELAY_BETWEEN_ITEMS = 2000;

/**
 * Default batch configuration
 */
export const BATCH_DEFAULTS = {
  /** Default delay between batch items (ms) */
  DELAY: DELAY_BETWEEN_ITEMS,
  /** Whether to stop batch processing on first error */
  STOP_ON_ERROR: false,
} as const;
