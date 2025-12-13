import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHighContrast } from './useHighContrast';

describe('useHighContrast', () => {
  const originalLocalStorage = globalThis.localStorage;
  const originalMatchMedia = globalThis.matchMedia;

  let localStorageData: Record<string, string>;
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  let mediaQueryListeners: Array<(e: MediaQueryListEvent) => void>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset localStorage mock
    localStorageData = {};
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageData[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageData[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageData[key];
        }),
        clear: vi.fn(() => {
          localStorageData = {};
        }),
      },
      writable: true,
      configurable: true,
    });

    // Reset matchMedia mock
    mediaQueryListeners = [];
    mockMatchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '(prefers-contrast: high)',
      addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          mediaQueryListeners.push(handler);
        }
      }),
      removeEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          const index = mediaQueryListeners.indexOf(handler);
          if (index > -1) {
            mediaQueryListeners.splice(index, 1);
          }
        }
      }),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));
    Object.defineProperty(globalThis, 'matchMedia', {
      value: mockMatchMedia,
      writable: true,
      configurable: true,
    });

    // Reset document.documentElement
    document.documentElement.classList.remove('high-contrast');
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'matchMedia', {
      value: originalMatchMedia,
      writable: true,
      configurable: true,
    });
    document.documentElement.classList.remove('high-contrast');
  });

  describe('initial state', () => {
    it('should initialize from localStorage when available', () => {
      localStorageData['infographix_high_contrast'] = 'true';

      const { result } = renderHook(() => useHighContrast());

      expect(result.current.isHighContrast).toBe(true);
    });

    it('should initialize as false from localStorage', () => {
      localStorageData['infographix_high_contrast'] = 'false';

      const { result } = renderHook(() => useHighContrast());

      expect(result.current.isHighContrast).toBe(false);
    });

    it('should fall back to system preference when no localStorage value', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(prefers-contrast: high)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useHighContrast());

      expect(result.current.isHighContrast).toBe(true);
    });

    it('should default to false when no preference is set', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-contrast: high)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useHighContrast());

      expect(result.current.isHighContrast).toBe(false);
    });

    it('should handle missing matchMedia', () => {
      Object.defineProperty(globalThis, 'matchMedia', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useHighContrast());

      expect(result.current.isHighContrast).toBe(false);
    });
  });

  describe('toggle function', () => {
    it('should toggle from false to true', () => {
      const { result } = renderHook(() => useHighContrast());

      expect(result.current.isHighContrast).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isHighContrast).toBe(true);
    });

    it('should toggle from true to false', () => {
      localStorageData['infographix_high_contrast'] = 'true';

      const { result } = renderHook(() => useHighContrast());

      expect(result.current.isHighContrast).toBe(true);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isHighContrast).toBe(false);
    });

    it('should toggle multiple times', () => {
      const { result } = renderHook(() => useHighContrast());

      act(() => {
        result.current.toggle();
        result.current.toggle();
        result.current.toggle();
      });

      expect(result.current.isHighContrast).toBe(true);
    });
  });

  describe('CSS class management', () => {
    it('should add high-contrast class when enabled', () => {
      const { result } = renderHook(() => useHighContrast());

      act(() => {
        result.current.toggle();
      });

      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });

    it('should remove high-contrast class when disabled', () => {
      localStorageData['infographix_high_contrast'] = 'true';

      const { result } = renderHook(() => useHighContrast());

      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);

      act(() => {
        result.current.toggle();
      });

      expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
    });
  });

  describe('localStorage persistence', () => {
    it('should save preference to localStorage when toggled', () => {
      const { result } = renderHook(() => useHighContrast());

      act(() => {
        result.current.toggle();
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('infographix_high_contrast', 'true');
    });

    it('should save false to localStorage when disabled', () => {
      localStorageData['infographix_high_contrast'] = 'true';

      const { result } = renderHook(() => useHighContrast());

      act(() => {
        result.current.toggle();
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('infographix_high_contrast', 'false');
    });
  });

  describe('system preference listener', () => {
    it('should set up event listener on mount', () => {
      const addEventListener = vi.fn();
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-contrast: high)',
        addEventListener,
        removeEventListener: vi.fn(),
      });

      renderHook(() => useHighContrast());

      expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should not update from system preference if user has manual preference', () => {
      localStorageData['infographix_high_contrast'] = 'false';
      let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;

      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-contrast: high)',
        addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            changeHandler = handler;
          }
        }),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useHighContrast());

      expect(result.current.isHighContrast).toBe(false);

      // Simulate system preference change
      if (changeHandler) {
        act(() => {
          changeHandler!({ matches: true } as MediaQueryListEvent);
        });
      }

      // Should still be false because user has manual preference
      expect(result.current.isHighContrast).toBe(false);
    });

    it('should handle missing matchMedia on mount', () => {
      Object.defineProperty(globalThis, 'matchMedia', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      // Should not throw
      const { result } = renderHook(() => useHighContrast());

      expect(result.current.isHighContrast).toBe(false);
    });

    it('should remove event listener on unmount', () => {
      const removeEventListener = vi.fn();
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-contrast: high)',
        addEventListener: vi.fn(),
        removeEventListener,
      });

      const { unmount } = renderHook(() => useHighContrast());

      unmount();

      expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('fallback for older browsers', () => {
    it('should use addListener/removeListener when addEventListener is not available', () => {
      const addListener = vi.fn();
      const removeListener = vi.fn();
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-contrast: high)',
        addEventListener: undefined,
        removeEventListener: undefined,
        addListener,
        removeListener,
      });

      const { unmount } = renderHook(() => useHighContrast());

      expect(addListener).toHaveBeenCalledWith(expect.any(Function));

      unmount();

      expect(removeListener).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
