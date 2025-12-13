/**
 * Theme Tokens for InfoGraphix AI
 *
 * Centralized design system tokens for colors, spacing, typography, and more.
 * This enables consistent styling and future support for dark/light mode themes.
 *
 * v2.0.0 - TD-026: Theme System Implementation
 */

/**
 * Color palette tokens
 */
export const colors = {
  // Background colors
  background: {
    primary: '#0f172a', // slate-900
    secondary: '#1e293b', // slate-800
    tertiary: '#334155', // slate-700
    elevated: '#475569', // slate-600
  },

  // Surface colors (cards, panels)
  surface: {
    primary: '#1e293b', // slate-800
    secondary: '#334155', // slate-700
    elevated: '#475569', // slate-600
    overlay: 'rgba(15, 23, 42, 0.95)', // slate-900 with opacity
  },

  // Border colors
  border: {
    primary: '#334155', // slate-700
    secondary: '#475569', // slate-600
    focus: '#3b82f6', // blue-500
    success: '#22c55e', // green-500
    error: '#ef4444', // red-500
    warning: '#f59e0b', // amber-500
  },

  // Text colors
  text: {
    primary: '#f1f5f9', // slate-100
    secondary: '#cbd5e1', // slate-300
    tertiary: '#94a3b8', // slate-400
    muted: '#64748b', // slate-500
    inverse: '#0f172a', // slate-900 (for light backgrounds)
  },

  // Interactive colors (buttons, links)
  interactive: {
    primary: '#3b82f6', // blue-500
    primaryHover: '#2563eb', // blue-600
    secondary: '#8b5cf6', // violet-500
    secondaryHover: '#7c3aed', // violet-600
    success: '#22c55e', // green-500
    successHover: '#16a34a', // green-600
    danger: '#ef4444', // red-500
    dangerHover: '#dc2626', // red-600
    warning: '#f59e0b', // amber-500
    warningHover: '#d97706', // amber-600
  },

  // Semantic colors
  semantic: {
    info: '#3b82f6', // blue-500
    success: '#22c55e', // green-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
    infoBackground: 'rgba(59, 130, 246, 0.1)',
    successBackground: 'rgba(34, 197, 94, 0.1)',
    warningBackground: 'rgba(245, 158, 11, 0.1)',
    errorBackground: 'rgba(239, 68, 68, 0.1)',
  },

  // AI/Gradient accents
  accent: {
    purple: '#a855f7', // purple-500
    pink: '#ec4899', // pink-500
    cyan: '#06b6d4', // cyan-500
    gradient: {
      purpleBlue: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
      pinkPurple: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
      cyanBlue: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    },
  },
} as const;

/**
 * Spacing scale (based on Tailwind's 4px scale)
 */
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
  '4xl': '6rem', // 96px
} as const;

/**
 * Typography scale
 */
export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },

  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

/**
 * Border radius scale
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  base: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const;

/**
 * Shadow scale
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

/**
 * Transition/animation tokens
 */
export const transitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  timing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
} as const;

/**
 * Z-index scale
 */
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const;

/**
 * Breakpoints (for responsive design)
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Helper function to get color with opacity
 */
export const withOpacity = (color: string, opacity: number): string => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Handle rgb/rgba colors
  if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match && match.length >= 3) {
      return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${opacity})`;
    }
  }

  return color;
};

/**
 * Theme type definition for TypeScript
 */
export type Theme = {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  transitions: typeof transitions;
  zIndex: typeof zIndex;
  breakpoints: typeof breakpoints;
};

/**
 * Default theme object
 */
export const theme: Theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
};

export default theme;
