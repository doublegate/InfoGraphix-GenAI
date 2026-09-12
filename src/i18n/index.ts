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
  return RTL_LANGUAGES.includes(language as typeof RTL_LANGUAGES[number]);
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

// i18next v26 removed the legacy `interpolation.format` callback; named
// formatters are registered on the formatter service instead. Usage in
// translations is unchanged: "{{count,number}}", "{{when,date}}",
// "{{when,relative}}".
//
// Registered SYNCHRONOUSLY, immediately after init() returns, rather than off
// its promise. init() builds the service container synchronously and only the
// resource loading is async, so the formatter exists here - and doing it this
// way closes the window in which a component could render a translation before
// the promise settled and get an unformatted value.
const formatter = i18next.services.formatter;
if (formatter) {
  formatter.add('number', (value, lng) =>
    typeof value === 'number' ? formatNumber(value, lng) : String(value)
  );
  formatter.add('date', (value, lng) =>
    value instanceof Date || typeof value === 'number'
      ? formatDate(value, lng)
      : String(value)
  );
  formatter.add('relative', (value, lng) =>
    value instanceof Date || typeof value === 'number'
      ? formatRelativeTime(value, lng)
      : String(value)
  );
}

// Set initial document direction
i18next.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
});

// Set direction on init
setDocumentDirection(i18next.language);

export default i18next;
