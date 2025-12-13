/**
 * Modal State Management Hook - v1.8.0 TD-009
 * Centralizes modal visibility state to reduce App.tsx complexity
 */

import { useState, useCallback } from 'react';

interface ModalState {
  showHistory: boolean;
  showAbout: boolean;
  showBatchManager: boolean;
  showTemplateManager: boolean;
  showKeyboardShortcuts: boolean;
}

interface ModalActions {
  openHistory: () => void;
  closeHistory: () => void;
  toggleHistory: () => void;
  openAbout: () => void;
  closeAbout: () => void;
  toggleAbout: () => void;
  openBatchManager: () => void;
  closeBatchManager: () => void;
  toggleBatchManager: () => void;
  openTemplateManager: () => void;
  closeTemplateManager: () => void;
  toggleTemplateManager: () => void;
  openKeyboardShortcuts: () => void;
  closeKeyboardShortcuts: () => void;
  toggleKeyboardShortcuts: () => void;
  closeAll: () => void;
}

type UseModalsReturn = ModalState & ModalActions;

/**
 * Hook to manage modal visibility state
 * Provides open/close/toggle functions for all modals
 */
export function useModals(): UseModalsReturn {
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showBatchManager, setShowBatchManager] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // History modal
  const openHistory = useCallback(() => setShowHistory(true), []);
  const closeHistory = useCallback(() => setShowHistory(false), []);
  const toggleHistory = useCallback(() => setShowHistory(prev => !prev), []);

  // About modal
  const openAbout = useCallback(() => setShowAbout(true), []);
  const closeAbout = useCallback(() => setShowAbout(false), []);
  const toggleAbout = useCallback(() => setShowAbout(prev => !prev), []);

  // Batch Manager modal
  const openBatchManager = useCallback(() => setShowBatchManager(true), []);
  const closeBatchManager = useCallback(() => setShowBatchManager(false), []);
  const toggleBatchManager = useCallback(() => setShowBatchManager(prev => !prev), []);

  // Template Manager modal
  const openTemplateManager = useCallback(() => setShowTemplateManager(true), []);
  const closeTemplateManager = useCallback(() => setShowTemplateManager(false), []);
  const toggleTemplateManager = useCallback(() => setShowTemplateManager(prev => !prev), []);

  // Keyboard Shortcuts modal
  const openKeyboardShortcuts = useCallback(() => setShowKeyboardShortcuts(true), []);
  const closeKeyboardShortcuts = useCallback(() => setShowKeyboardShortcuts(false), []);
  const toggleKeyboardShortcuts = useCallback(() => setShowKeyboardShortcuts(prev => !prev), []);

  // Close all modals
  const closeAll = useCallback(() => {
    setShowHistory(false);
    setShowAbout(false);
    setShowBatchManager(false);
    setShowTemplateManager(false);
    setShowKeyboardShortcuts(false);
  }, []);

  return {
    // State
    showHistory,
    showAbout,
    showBatchManager,
    showTemplateManager,
    showKeyboardShortcuts,

    // Actions
    openHistory,
    closeHistory,
    toggleHistory,
    openAbout,
    closeAbout,
    toggleAbout,
    openBatchManager,
    closeBatchManager,
    toggleBatchManager,
    openTemplateManager,
    closeTemplateManager,
    toggleTemplateManager,
    openKeyboardShortcuts,
    closeKeyboardShortcuts,
    toggleKeyboardShortcuts,
    closeAll
  };
}
