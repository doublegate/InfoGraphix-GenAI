import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import i18next, {
  RTL_LANGUAGES,
  isRTL,
  setDocumentDirection,
  formatNumber,
  formatDate,
  formatRelativeTime,
} from './index';

/**
 * These cover the i18next v26 migration: the legacy `interpolation.format`
 * callback was removed upstream, and the three custom formats are now
 * registered on the formatter service once init() resolves. Without a test the
 * only signal that the migration worked would be a translation silently
 * rendering a raw value in production.
 */
describe('i18n', () => {
  beforeAll(async () => {
    // The formatters are registered synchronously at import time, so they do
    // not need waiting for. This waits only for resource loading, which the
    // t() assertions below do need.
    if (!i18next.isInitialized) {
      await new Promise<void>((resolve) => i18next.on('initialized', () => resolve()));
    }
  });

  describe('custom interpolation formatters', () => {
    it('registers the formatter service', () => {
      expect(i18next.services.formatter).toBeDefined();
    });

    it('formats a number through {{value, number}}', async () => {
      i18next.addResource('en', 'translation', 'test.num', '{{value, number}}');
      await i18next.changeLanguage('en');
      expect(i18next.t('test.num', { value: 1234567 })).toBe('1,234,567');
    });

    it('formats a date through {{value, date}}', async () => {
      i18next.addResource('en', 'translation', 'test.date', '{{value, date}}');
      await i18next.changeLanguage('en');
      const when = new Date(Date.UTC(2026, 0, 15, 12));
      // Exact text is locale/tz dependent; assert it was formatted, not dumped.
      const out = i18next.t('test.date', { value: when });
      expect(out).toMatch(/2026/);
      expect(out).not.toContain('GMT');
    });

    it('formats relative time through {{value, relative}}', async () => {
      i18next.addResource('en', 'translation', 'test.rel', '{{value, relative}}');
      await i18next.changeLanguage('en');
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      expect(i18next.t('test.rel', { value: twoHoursAgo })).toMatch(/hour/);
    });

    it('passes a non-formattable value through as a string', async () => {
      i18next.addResource('en', 'translation', 'test.bad', '{{value, number}}');
      await i18next.changeLanguage('en');
      expect(i18next.t('test.bad', { value: 'not-a-number' })).toBe('not-a-number');
    });
  });

  describe('formatNumber', () => {
    it('groups by locale', () => {
      expect(formatNumber(1234567.89, 'en')).toBe('1,234,567.89');
      expect(formatNumber(1234.5, 'de')).toBe('1.234,5');
    });

    it('honours Intl options', () => {
      expect(formatNumber(0.42, 'en', { style: 'percent' })).toBe('42%');
    });
  });

  describe('formatDate', () => {
    it('renders year, short month and day', () => {
      const out = formatDate(new Date(Date.UTC(2026, 0, 15, 12)), 'en');
      expect(out).toMatch(/Jan/);
      expect(out).toMatch(/2026/);
    });

    it('accepts a timestamp as well as a Date', () => {
      const ts = Date.UTC(2026, 0, 15, 12);
      expect(formatDate(ts, 'en')).toBe(formatDate(new Date(ts), 'en'));
    });
  });

  describe('formatRelativeTime', () => {
    it.each([
      [30 * 1000, /second/],
      [5 * 60 * 1000, /minute/],
      [3 * 60 * 60 * 1000, /hour/],
      [2 * 24 * 60 * 60 * 1000, /day/],
    ])('describes %ims ago in the expected unit', (ago, expected) => {
      expect(formatRelativeTime(Date.now() - (ago as number), 'en')).toMatch(
        expected as RegExp
      );
    });
  });

  describe('isRTL', () => {
    it.each(RTL_LANGUAGES)('treats %s as right-to-left', (lang) => {
      expect(isRTL(lang)).toBe(true);
    });

    it('treats Latin-script languages as left-to-right', () => {
      expect(isRTL('en')).toBe(false);
      expect(isRTL('es')).toBe(false);
    });

    // Documents CURRENT behaviour, which is an exact match against the four
    // codes rather than a base-language match. Note that LanguageDetector can
    // hand back a regional tag such as "ar-EG", and this returns false for it,
    // so setDocumentDirection would choose ltr for an Arabic locale. Changing
    // that is a behaviour fix and does not belong in a dependency bump; the
    // test is here so the gap is visible rather than merely absent.
    it('matches exact codes only, not regional tags', () => {
      expect(isRTL('ar-EG')).toBe(false);
      expect(isRTL('en-GB')).toBe(false);
    });
  });

  describe('setDocumentDirection', () => {
    afterEach(() => {
      document.documentElement.removeAttribute('dir');
      document.documentElement.removeAttribute('lang');
    });

    it('sets dir=rtl for a right-to-left language', () => {
      setDocumentDirection('ar');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });

    it('sets dir=ltr for a left-to-right language', () => {
      setDocumentDirection('en');
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    });
  });
});
