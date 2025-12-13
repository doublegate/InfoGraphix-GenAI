import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SkipLink from './SkipLink';

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key === 'accessibility.skipToMain' ? 'Skip to main content' : key,
  }),
}));

describe('SkipLink', () => {
  let mainContent: HTMLElement | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    // Create main content element
    mainContent = document.createElement('div');
    mainContent.id = 'main-content';
    mainContent.tabIndex = -1;
    // Mock scrollIntoView since jsdom doesn't implement it
    mainContent.scrollIntoView = vi.fn();
    document.body.appendChild(mainContent);
  });

  afterEach(() => {
    // Clean up
    if (mainContent && mainContent.parentNode) {
      mainContent.parentNode.removeChild(mainContent);
    }
    mainContent = null;
  });

  describe('rendering', () => {
    it('should render skip link', () => {
      render(<SkipLink />);

      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    });

    it('should render as anchor element', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link', { name: 'Skip to main content' });
      expect(link).toBeInTheDocument();
    });

    it('should have href pointing to main-content', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link', { name: 'Skip to main content' });
      expect(link).toHaveAttribute('href', '#main-content');
    });

    it('should have sr-only class for screen reader accessibility', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link', { name: 'Skip to main content' });
      expect(link).toHaveClass('sr-only');
    });
  });

  describe('click behavior', () => {
    it('should prevent default on click', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link', { name: 'Skip to main content' });
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');
      link.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should focus main content on click', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link', { name: 'Skip to main content' });
      const focusSpy = vi.spyOn(mainContent!, 'focus');

      fireEvent.click(link);

      expect(focusSpy).toHaveBeenCalled();
    });

    it('should scroll main content into view on click', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link', { name: 'Skip to main content' });

      fireEvent.click(link);

      expect(mainContent!.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should handle missing main content gracefully', () => {
      // Remove main content element
      if (mainContent && mainContent.parentNode) {
        mainContent.parentNode.removeChild(mainContent);
        mainContent = null;
      }

      render(<SkipLink />);

      const link = screen.getByRole('link', { name: 'Skip to main content' });

      // Should not throw
      expect(() => fireEvent.click(link)).not.toThrow();
    });
  });

  describe('accessibility', () => {
    it('should be accessible via keyboard', () => {
      render(<SkipLink />);

      const link = screen.getByRole('link', { name: 'Skip to main content' });
      // Link should be in the document and focusable
      expect(link).toBeInTheDocument();
    });

    it('should use translated text from i18n', () => {
      render(<SkipLink />);

      // The mock returns 'Skip to main content' for 'accessibility.skipToMain'
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    });
  });
});
