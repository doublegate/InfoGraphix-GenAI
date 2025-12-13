import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnnouncer } from './useAnnouncer';

describe('useAnnouncer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Clean up any existing announcer elements
    const existingAnnouncers = document.querySelectorAll('[role="status"]');
    existingAnnouncers.forEach(el => el.remove());
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clean up after each test
    const existingAnnouncers = document.querySelectorAll('[role="status"]');
    existingAnnouncers.forEach(el => el.remove());
  });

  describe('initialization', () => {
    it('should create announcer element on mount', () => {
      renderHook(() => useAnnouncer());

      const announcer = document.querySelector('[role="status"]');
      expect(announcer).not.toBeNull();
      expect(announcer?.getAttribute('aria-live')).toBe('polite');
      expect(announcer?.getAttribute('aria-atomic')).toBe('true');
      expect(announcer?.className).toBe('sr-only');
    });

    it('should return announce function', () => {
      const { result } = renderHook(() => useAnnouncer());

      expect(result.current.announce).toBeDefined();
      expect(typeof result.current.announce).toBe('function');
    });
  });

  describe('cleanup', () => {
    it('should remove announcer element on unmount', () => {
      const { unmount } = renderHook(() => useAnnouncer());

      expect(document.querySelector('[role="status"]')).not.toBeNull();

      unmount();

      expect(document.querySelector('[role="status"]')).toBeNull();
    });
  });

  describe('announce function', () => {
    it('should announce polite messages', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announce('Test message');
      });

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.getAttribute('aria-live')).toBe('polite');

      // Clear text happens first, then message is set after 100ms
      expect(announcer?.textContent).toBe('');

      // Advance timers to set the message
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(announcer?.textContent).toBe('Test message');
    });

    it('should announce assertive messages', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announce('Urgent message', 'assertive');
      });

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.getAttribute('aria-live')).toBe('assertive');

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(announcer?.textContent).toBe('Urgent message');
    });

    it('should clear previous message before setting new one', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announce('First message');
        vi.advanceTimersByTime(100);
      });

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.textContent).toBe('First message');

      act(() => {
        result.current.announce('Second message');
      });

      // Text should be cleared immediately
      expect(announcer?.textContent).toBe('');

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(announcer?.textContent).toBe('Second message');
    });

    it('should handle multiple rapid announcements', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announce('Message 1');
        result.current.announce('Message 2');
        result.current.announce('Message 3');
      });

      const announcer = document.querySelector('[role="status"]');

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Last message should win
      expect(announcer?.textContent).toBe('Message 3');
    });

    it('should not throw when announcer ref is null', () => {
      const { result, unmount } = renderHook(() => useAnnouncer());

      // Unmount to make ref null
      unmount();

      // Should not throw when announce is called after unmount
      expect(() => {
        result.current.announce('Should not throw');
      }).not.toThrow();
    });

    it('should use default polite priority', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announce('Default priority message');
      });

      const announcer = document.querySelector('[role="status"]');
      expect(announcer?.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('multiple hooks', () => {
    it('should create separate announcer elements for each hook instance', () => {
      renderHook(() => useAnnouncer());
      renderHook(() => useAnnouncer());

      const announcers = document.querySelectorAll('[role="status"]');
      expect(announcers.length).toBe(2);
    });

    it('should clean up only its own announcer on unmount', () => {
      const { unmount: unmount1 } = renderHook(() => useAnnouncer());
      renderHook(() => useAnnouncer());

      expect(document.querySelectorAll('[role="status"]').length).toBe(2);

      unmount1();

      expect(document.querySelectorAll('[role="status"]').length).toBe(1);
    });
  });

  describe('timing behavior', () => {
    it('should wait 100ms before setting message content', () => {
      const { result } = renderHook(() => useAnnouncer());

      act(() => {
        result.current.announce('Timed message');
      });

      const announcer = document.querySelector('[role="status"]');

      // At 0ms, should be empty
      expect(announcer?.textContent).toBe('');

      // At 50ms, should still be empty
      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(announcer?.textContent).toBe('');

      // At 100ms, should have the message
      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(announcer?.textContent).toBe('Timed message');
    });
  });
});
