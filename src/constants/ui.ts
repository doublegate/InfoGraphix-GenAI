/**
 * UI Constants
 * v1.9.0 - TD-020: Extract magic numbers to named constants
 *
 * Defines UI-related timing and animation constants
 */

/**
 * Debounce delay for form auto-save (in milliseconds).
 * Form changes are saved after this period of inactivity.
 *
 * Rationale: 1000ms (1 second) provides a good balance between responsiveness
 * and avoiding excessive IndexedDB writes. Users typically pause for 1+ seconds
 * between field changes, so this captures their intent without lag.
 */
export const DEBOUNCE_MS = 1000;

/**
 * Default animation durations for UI transitions (in milliseconds)
 */
export const ANIMATION_DURATION = {
  /** Fast transitions (e.g., hover effects, tooltips) */
  FAST: 150,
  /** Standard transitions (e.g., modal open/close, dropdowns) */
  NORMAL: 300,
  /** Slow transitions (e.g., page transitions, complex animations) */
  SLOW: 500,
} as const;

/**
 * Toast notification duration (in milliseconds)
 */
export const TOAST_DURATION = {
  /** Quick success messages */
  SHORT: 2000,
  /** Standard notifications */
  NORMAL: 4000,
  /** Important warnings/errors */
  LONG: 6000,
} as const;

/**
 * Keyboard shortcut debounce (in milliseconds).
 * Prevents accidental double-triggers of keyboard shortcuts.
 *
 * Rationale: 300ms is long enough to prevent accidental double-presses
 * but short enough to feel responsive for intentional repeated commands.
 */
export const KEYBOARD_DEBOUNCE = 300;

/**
 * Auto-hide delay for transient UI elements (in milliseconds)
 */
export const AUTO_HIDE_DELAY = {
  /** Tooltips */
  TOOLTIP: 200,
  /** Loading spinners (minimum visible duration for visual consistency) */
  SPINNER: 500,
  /** Success indicators */
  SUCCESS: 2000,
} as const;
