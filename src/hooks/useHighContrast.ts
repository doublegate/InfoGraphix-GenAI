import { useState, useEffect, useCallback } from 'react';

const HIGH_CONTRAST_KEY = 'infographix_high_contrast';

/**
 * Custom hook for managing high contrast mode
 * Persists preference to localStorage and applies CSS class
 */
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem(HIGH_CONTRAST_KEY);
    if (saved !== null) {
      return saved === 'true';
    }

    // Check system preference
    if (window.matchMedia) {
      return window.matchMedia('(prefers-contrast: high)').matches;
    }

    return false;
  });

  useEffect(() => {
    // Apply or remove high contrast class
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Save preference
    localStorage.setItem(HIGH_CONTRAST_KEY, String(isHighContrast));
  }, [isHighContrast]);

  // Listen for system preference changes
  useEffect(() => {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-update if user hasn't manually set a preference
      const saved = localStorage.getItem(HIGH_CONTRAST_KEY);
      if (saved === null) {
        setIsHighContrast(e.matches);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const toggle = useCallback(() => {
    setIsHighContrast(prev => !prev);
  }, []);

  return { isHighContrast, toggle };
}
