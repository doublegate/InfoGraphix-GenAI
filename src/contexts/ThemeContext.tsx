/**
 * Theme Context - v1.8.0 TD-006
 * Provides theme state (high contrast, language) to components without prop drilling
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useHighContrast } from '../hooks/useHighContrast';
import { useAnnouncer } from '../hooks/useAnnouncer';

interface ThemeContextValue {
  // High contrast mode
  isHighContrast: boolean;
  toggleHighContrast: () => void;

  // i18n
  t: ReturnType<typeof useTranslation>['t'];
  i18n: ReturnType<typeof useTranslation>['i18n'];

  // Accessibility
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const { isHighContrast, toggle: toggleHighContrast } = useHighContrast();
  const { announce } = useAnnouncer();

  const value: ThemeContextValue = {
    isHighContrast,
    toggleHighContrast,
    t,
    i18n,
    announce
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
