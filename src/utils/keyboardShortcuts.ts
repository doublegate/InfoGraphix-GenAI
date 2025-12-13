/**
 * Keyboard shortcut definitions and utilities.
 * Provides cross-platform keyboard shortcut handling with Mac/Windows compatibility.
 */

/**
 * Keyboard shortcut definition with modifier keys and action metadata.
 * Supports cross-platform modifier keys (Ctrl/Cmd, Alt/Option, Shift).
 */
export interface KeyboardShortcut {
  /** The main key to press (e.g., "Enter", "s", "?") */
  key: string;
  /** Whether Ctrl (Windows/Linux) or Cmd (Mac) is required */
  ctrl?: boolean;
  /** Whether Alt (Windows/Linux) or Option (Mac) is required */
  alt?: boolean;
  /** Whether Shift is required */
  shift?: boolean;
  /** Whether the Meta/Command key is required (primarily for Mac) */
  metaKey?: boolean;
  /** Human-readable description of the shortcut's action */
  description: string;
  /** Internal action identifier for routing */
  action: string;
}

export const SHORTCUTS: Record<string, KeyboardShortcut> = {
  GENERATE: {
    key: 'Enter',
    ctrl: true,
    description: 'Generate infographic',
    action: 'generate'
  },
  SAVE: {
    key: 's',
    ctrl: true,
    description: 'Save to history',
    action: 'save'
  },
  DOWNLOAD: {
    key: 'd',
    ctrl: true,
    description: 'Download image',
    action: 'download'
  },
  NEW: {
    key: 'n',
    ctrl: true,
    description: 'New/clear form',
    action: 'new'
  },
  HISTORY: {
    key: 'h',
    ctrl: true,
    description: 'Toggle history',
    action: 'history'
  },
  TEMPLATES: {
    key: 't',
    ctrl: true,
    description: 'Toggle templates',
    action: 'templates'
  },
  BATCH: {
    key: 'b',
    ctrl: true,
    description: 'Toggle batch manager',
    action: 'batch'
  },
  HELP: {
    key: '?',
    shift: true,
    description: 'Show keyboard shortcuts help',
    action: 'help'
  },
  ESCAPE: {
    key: 'Escape',
    description: 'Close modals',
    action: 'escape'
  },
  HIGH_CONTRAST: {
    key: 'c',
    ctrl: true,
    shift: true,
    description: 'Toggle high contrast mode',
    action: 'highContrast'
  }
};

/**
 * Check if a keyboard event matches a shortcut definition.
 * Handles cross-platform modifier key differences (Cmd on Mac, Ctrl on Windows/Linux).
 * Key comparison is case-insensitive.
 *
 * @param event - The keyboard event from a keydown/keyup listener
 * @param shortcut - The shortcut definition to match against
 * @returns True if the event matches the shortcut definition
 *
 * @example
 * ```typescript
 * const handleKeyDown = (e: KeyboardEvent) => {
 *   if (matchesShortcut(e, SHORTCUTS.SAVE)) {
 *     e.preventDefault();
 *     handleSave();
 *   }
 * };
 * ```
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? event.metaKey : event.ctrlKey;

  // Normalize key comparison
  const eventKey = event.key.toLowerCase();
  const shortcutKey = shortcut.key.toLowerCase();

  // Check if keys match
  if (eventKey !== shortcutKey) {
    return false;
  }

  // Check modifiers
  const ctrlMatch = shortcut.ctrl ? (isMac ? event.metaKey : event.ctrlKey) : !modifierKey;
  const altMatch = shortcut.alt ? event.altKey : !event.altKey;
  const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

  return ctrlMatch && altMatch && shiftMatch;
}

/**
 * Get human-readable shortcut text for display in UI.
 * Automatically uses Mac symbols (⌘, ⌥, ⇧) on Mac and text (Ctrl, Alt, Shift) on Windows/Linux.
 *
 * @param shortcut - The shortcut definition to format
 * @returns Formatted shortcut string (e.g., "⌘S" on Mac, "Ctrl+S" on Windows)
 *
 * @example
 * ```typescript
 * getShortcutText(SHORTCUTS.SAVE);
 * // Mac: "⌘S"
 * // Windows/Linux: "Ctrl+S"
 *
 * getShortcutText(SHORTCUTS.HELP);
 * // Mac: "⇧?"
 * // Windows/Linux: "Shift+?"
 * ```
 */
export function getShortcutText(shortcut: KeyboardShortcut): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }

  parts.push(shortcut.key);

  return parts.join(isMac ? '' : '+');
}
