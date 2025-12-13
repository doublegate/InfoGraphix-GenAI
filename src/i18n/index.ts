import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import es from './es.json';

/**
 * RTL language support configuration
 * Add new RTL languages here as they are supported
 */
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'] as const;

/**
 * Check if a language code is RTL
 */
export const isRTL = (language: string): boolean => {
  return RTL_LANGUAGES.includes(language as any);
};

/**
 * Set document direction based on language
 */
export const setDocumentDirection = (language: string): void => {
  const dir = isRTL(language) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = language;
};

/**
 * Format number according to locale
 */
export const formatNumber = (
  value: number,
  locale?: string,
  options?: Intl.NumberFormatOptions
): string => {
  const currentLocale = locale || i18next.language || 'en';
  return new Intl.NumberFormat(currentLocale, options).format(value);
};

/**
 * Format date according to locale
 */
export const formatDate = (
  date: Date | number,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const currentLocale = locale || i18next.language || 'en';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat(currentLocale, defaultOptions).format(date);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (
  date: Date | number,
  locale?: string
): string => {
  const currentLocale = locale || i18next.language || 'en';
  const now = Date.now();
  const timestamp = typeof date === 'number' ? date : date.getTime();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  const rtf = new Intl.RelativeTimeFormat(currentLocale, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 604800) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 604800), 'week');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
};

void i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
      // Enable formatting functions
      format: (value, format, lng) => {
        if (format === 'number' && typeof value === 'number') {
          return formatNumber(value, lng);
        }
        if (format === 'date' && (value instanceof Date || typeof value === 'number')) {
          return formatDate(value, lng);
        }
        if (format === 'relative' && (value instanceof Date || typeof value === 'number')) {
          return formatRelativeTime(value, lng);
        }
        return value as string;
      },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    // Enable pluralization support
    pluralSeparator: '_',
    contextSeparator: '_',
    // Add support for missing keys in development
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lngs, ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`Missing translation key: ${key} for languages: ${lngs.join(', ')}`);
      }
    },
  });

// Set initial document direction
i18next.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
});

// Set direction on init
setDocumentDirection(i18next.language);

export default i18next;
