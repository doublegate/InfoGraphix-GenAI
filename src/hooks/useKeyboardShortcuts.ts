import { useEffect, useCallback, useRef } from 'react';
import { SHORTCUTS, matchesShortcut } from '../utils/keyboardShortcuts';

export interface ShortcutHandlers {
  onGenerate?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  onNew?: () => void;
  onToggleHistory?: () => void;
  onToggleTemplates?: () => void;
  onToggleBatch?: () => void;
  onShowHelp?: () => void;
  onEscape?: () => void;
  onToggleHighContrast?: () => void;
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
}

/**
 * Custom hook for handling keyboard shortcuts
 *
 * @param handlers - Object containing handler functions for each shortcut action
 * @param options - Configuration options
 */
export function useKeyboardShortcuts(
  handlers: ShortcutHandlers,
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true } = options;
  const handlersRef = useRef(handlers);

  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when user is typing in an input/textarea
    const target = event.target as HTMLElement;
    const isInputElement = (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    );

    // Allow Escape even in input elements to close modals
    if (event.key !== 'Escape' && isInputElement) {
      return;
    }

    const currentHandlers = handlersRef.current;

    // Check each shortcut
    if (matchesShortcut(event, SHORTCUTS.GENERATE) && currentHandlers.onGenerate) {
      event.preventDefault();
      currentHandlers.onGenerate();
    } else if (matchesShortcut(event, SHORTCUTS.SAVE) && currentHandlers.onSave) {
      event.preventDefault();
      currentHandlers.onSave();
    } else if (matchesShortcut(event, SHORTCUTS.DOWNLOAD) && currentHandlers.onDownload) {
      event.preventDefault();
      currentHandlers.onDownload();
    } else if (matchesShortcut(event, SHORTCUTS.NEW) && currentHandlers.onNew) {
      event.preventDefault();
      currentHandlers.onNew();
    } else if (matchesShortcut(event, SHORTCUTS.HISTORY) && currentHandlers.onToggleHistory) {
      event.preventDefault();
      currentHandlers.onToggleHistory();
    } else if (matchesShortcut(event, SHORTCUTS.TEMPLATES) && currentHandlers.onToggleTemplates) {
      event.preventDefault();
      currentHandlers.onToggleTemplates();
    } else if (matchesShortcut(event, SHORTCUTS.BATCH) && currentHandlers.onToggleBatch) {
      event.preventDefault();
      currentHandlers.onToggleBatch();
    } else if (matchesShortcut(event, SHORTCUTS.HELP) && currentHandlers.onShowHelp) {
      event.preventDefault();
      currentHandlers.onShowHelp();
    } else if (matchesShortcut(event, SHORTCUTS.ESCAPE) && currentHandlers.onEscape) {
      event.preventDefault();
      currentHandlers.onEscape();
    } else if (matchesShortcut(event, SHORTCUTS.HIGH_CONTRAST) && currentHandlers.onToggleHighContrast) {
      event.preventDefault();
      currentHandlers.onToggleHighContrast();
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}
