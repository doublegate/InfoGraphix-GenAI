import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Keyboard } from 'lucide-react';
import { SHORTCUTS, getShortcutText } from '../utils/keyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Generation & Actions',
      shortcuts: [
        { ...SHORTCUTS.GENERATE, label: t('shortcuts.generate') },
        { ...SHORTCUTS.SAVE, label: t('shortcuts.save') },
        { ...SHORTCUTS.DOWNLOAD, label: t('shortcuts.download') },
        { ...SHORTCUTS.NEW, label: t('shortcuts.new') }
      ]
    },
    {
      title: 'Navigation',
      shortcuts: [
        { ...SHORTCUTS.HISTORY, label: t('shortcuts.history') },
        { ...SHORTCUTS.TEMPLATES, label: t('shortcuts.templates') },
        { ...SHORTCUTS.BATCH, label: t('shortcuts.batch') },
        { ...SHORTCUTS.ESCAPE, label: t('shortcuts.escape') }
      ]
    },
    {
      title: 'Accessibility',
      shortcuts: [
        { ...SHORTCUTS.HIGH_CONTRAST, label: t('accessibility.toggleHighContrast') },
        { ...SHORTCUTS.HELP, label: t('shortcuts.help') }
      ]
    }
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-blue-400" />
            <h2 id="shortcuts-title" className="text-2xl font-bold text-slate-100">
              {t('shortcuts.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          {shortcutGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-slate-200">
                      {shortcut.label}
                    </span>
                    <kbd className="px-3 py-1.5 bg-slate-700 text-slate-100 rounded font-mono text-sm border border-slate-600">
                      {getShortcutText(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700">
          <p className="text-sm text-slate-400 text-center">
            Press <kbd className="px-2 py-1 bg-slate-700 text-slate-100 rounded font-mono text-xs">?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  );
}
