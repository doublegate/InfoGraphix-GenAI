/**
 * Color Constants
 * v1.9.0 - TD-020: Extract magic numbers to named constants
 *
 * Defines color extraction and accessibility constants
 */

/**
 * Maximum number of colors to extract from an image.
 * Limits the palette size to prevent overwhelming users with too many options.
 *
 * Rationale: 6 colors (Vibrant, DarkVibrant, LightVibrant, Muted, DarkMuted,
 * LightMuted) covers the full spectrum of Vibrant.js output while providing
 * variety without overwhelming the UI.
 */
export const MAX_COLORS = 6;

/**
 * WCAG AA contrast ratio requirements
 * Based on Web Content Accessibility Guidelines 2.1
 * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */
export const WCAG_AA = {
  /** Minimum contrast ratio for normal text (4.5:1) */
  NORMAL: 4.5,
  /** Minimum contrast ratio for large text (3:1) */
  LARGE: 3,
} as const;

/**
 * WCAG AAA contrast ratio requirements (enhanced)
 * Based on Web Content Accessibility Guidelines 2.1
 * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html
 */
export const WCAG_AAA = {
  /** Minimum contrast ratio for normal text (7:1) */
  NORMAL: 7,
  /** Minimum contrast ratio for large text (4.5:1) */
  LARGE: 4.5,
} as const;

/**
 * Relative luminance threshold for determining text color.
 * Luminance above this threshold uses dark text, below uses light text.
 *
 * Rationale: 0.5 is the midpoint between pure black (0) and pure white (1).
 * Colors with luminance > 0.5 are perceptually "light" and need dark text
 * for readability, and vice versa.
 */
export const LUMINANCE_THRESHOLD = 0.5;

/**
 * Color theory angle offsets (in degrees)
 * Used for generating complementary, triadic, and other color schemes
 */
export const COLOR_THEORY = {
  /** Complementary color offset (opposite on color wheel) */
  COMPLEMENTARY: 180,
  /** Triadic color offsets (120 degrees apart) */
  TRIADIC: [120, 240],
  /** Analogous color step (adjacent colors) */
  ANALOGOUS_STEP: 30,
  /** Split-complementary offsets */
  SPLIT_COMPLEMENTARY: [150, 210],
  /** Tetradic/square offsets (90 degrees apart) */
  TETRADIC: [90, 180, 270],
} as const;

/**
 * Default color scheme generation count
 * Number of colors to generate for analogous schemes
 */
export const DEFAULT_SCHEME_COUNT = 5;

/**
 * RGB/HSL conversion constants
 */
export const COLOR_CONVERSION = {
  /** RGB maximum value */
  RGB_MAX: 255,
  /** Hue degrees in a full circle */
  HUE_MAX: 360,
  /** Saturation/Lightness percentage max */
  PERCENT_MAX: 100,
} as const;
