/**
 * Keyboard shortcut definitions and utilities
 */

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  metaKey?: boolean;
  description: string;
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
 * Check if a keyboard event matches a shortcut definition
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
 * Get human-readable shortcut text for display
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
