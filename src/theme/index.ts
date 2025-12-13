/**
 * Theme System Entry Point
 *
 * Exports all theme-related tokens and utilities.
 */

export {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  withOpacity,
  theme,
  type Theme,
} from './tokens';

// Default export for convenience
import { theme as themeDefault } from './tokens';
export default themeDefault;
