import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { ThemeProvider, useTheme } from './ThemeContext';

// Mock useTranslation
const mockT = vi.fn((key: string) => key);
const mockChangeLanguage = vi.fn();
const mockI18n = {
  language: 'en',
  changeLanguage: mockChangeLanguage,
  dir: vi.fn(() => 'ltr'),
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: mockI18n,
  }),
}));

// Mock useHighContrast
const mockToggle = vi.fn();
let mockIsHighContrast = false;

vi.mock('../hooks/useHighContrast', () => ({
  useHighContrast: () => ({
    isHighContrast: mockIsHighContrast,
    toggle: mockToggle,
  }),
}));

// Mock useAnnouncer
const mockAnnounce = vi.fn();

vi.mock('../hooks/useAnnouncer', () => ({
  useAnnouncer: () => ({
    announce: mockAnnounce,
  }),
}));

describe('ThemeContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsHighContrast = false;
  });

  describe('useTheme hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console error during this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within ThemeProvider');

      consoleSpy.mockRestore();
    });

    it('should provide context value when used within provider', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.isHighContrast).toBe(false);
      expect(typeof result.current.toggleHighContrast).toBe('function');
      expect(typeof result.current.t).toBe('function');
      expect(result.current.i18n).toBeDefined();
      expect(typeof result.current.announce).toBe('function');
    });
  });

  describe('high contrast mode', () => {
    it('should provide isHighContrast state', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isHighContrast).toBe(false);
    });

    it('should provide isHighContrast as true when hook returns true', () => {
      mockIsHighContrast = true;

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isHighContrast).toBe(true);
    });

    it('should call toggle function when toggleHighContrast is called', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.toggleHighContrast();
      });

      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('should call toggle multiple times', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.toggleHighContrast();
        result.current.toggleHighContrast();
        result.current.toggleHighContrast();
      });

      expect(mockToggle).toHaveBeenCalledTimes(3);
    });
  });

  describe('i18n integration', () => {
    it('should provide t function for translations', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.t).toBeDefined();
      expect(typeof result.current.t).toBe('function');
    });

    it('should translate keys using t function', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const translatedValue = result.current.t('test.key');

      expect(mockT).toHaveBeenCalledWith('test.key');
      expect(translatedValue).toBe('test.key');
    });

    it('should provide i18n object', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.i18n).toBeDefined();
      expect(result.current.i18n.language).toBe('en');
    });

    it('should allow language change via i18n', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.i18n.changeLanguage('es');
      });

      expect(mockChangeLanguage).toHaveBeenCalledWith('es');
    });

    it('should provide dir function for RTL support', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.i18n.dir).toBeDefined();
      expect(typeof result.current.i18n.dir).toBe('function');
    });
  });

  describe('announcer integration', () => {
    it('should provide announce function', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.announce).toBeDefined();
      expect(typeof result.current.announce).toBe('function');
    });

    it('should call announce with message', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.announce('Test announcement');
      });

      expect(mockAnnounce).toHaveBeenCalledWith('Test announcement');
    });

    it('should call announce with message and polite priority', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.announce('Polite message', 'polite');
      });

      expect(mockAnnounce).toHaveBeenCalledWith('Polite message', 'polite');
    });

    it('should call announce with message and assertive priority', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.announce('Urgent message', 'assertive');
      });

      expect(mockAnnounce).toHaveBeenCalledWith('Urgent message', 'assertive');
    });

    it('should handle multiple announcements', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.announce('First');
        result.current.announce('Second');
        result.current.announce('Third');
      });

      expect(mockAnnounce).toHaveBeenCalledTimes(3);
      expect(mockAnnounce).toHaveBeenNthCalledWith(1, 'First');
      expect(mockAnnounce).toHaveBeenNthCalledWith(2, 'Second');
      expect(mockAnnounce).toHaveBeenNthCalledWith(3, 'Third');
    });
  });

  describe('context value structure', () => {
    it('should have all required properties', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const contextKeys = Object.keys(result.current);
      expect(contextKeys).toContain('isHighContrast');
      expect(contextKeys).toContain('toggleHighContrast');
      expect(contextKeys).toContain('t');
      expect(contextKeys).toContain('i18n');
      expect(contextKeys).toContain('announce');
    });

    it('should have exactly 5 properties', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(Object.keys(result.current)).toHaveLength(5);
    });
  });

  describe('provider rendering', () => {
    it('should render children correctly', () => {
      let childRendered = false;
      const TestChild = () => {
        childRendered = true;
        return null;
      };

      renderHook(() => useTheme(), {
        wrapper: ({ children }) => (
          <ThemeProvider>
            <TestChild />
            {children}
          </ThemeProvider>
        ),
      });

      expect(childRendered).toBe(true);
    });

    it('should allow nested hooks access', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      // Verify all hooks are accessible
      expect(result.current.isHighContrast).toBeDefined();
      expect(result.current.t).toBeDefined();
      expect(result.current.announce).toBeDefined();
    });
  });

  describe('multiple consumers', () => {
    it('should provide same context to multiple hooks', () => {
      const { result: result1 } = renderHook(() => useTheme(), { wrapper });
      const { result: result2 } = renderHook(() => useTheme(), { wrapper });

      // Both should have access to the same mock functions
      expect(result1.current.toggleHighContrast).toBe(result2.current.toggleHighContrast);
      expect(result1.current.t).toBe(result2.current.t);
      expect(result1.current.announce).toBe(result2.current.announce);
    });
  });
});
