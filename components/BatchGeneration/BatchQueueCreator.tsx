/**
 * BatchQueueCreator - Form to create new batch queues
 * v1.4.0 Feature: Batch Generation Mode
 */

import React, { useState } from 'react';
import { X, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import {
  InfographicStyle,
  ColorPalette,
  ImageSize,
  AspectRatio,
  GithubFilters
} from '../../types';

interface BatchQueueCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    name: string,
    topics: string[],
    style: InfographicStyle,
    palette: ColorPalette,
    size: ImageSize,
    aspectRatio: AspectRatio,
    filters?: GithubFilters,
    delayBetweenItems?: number,
    stopOnError?: boolean
  ) => void;
}

const BatchQueueCreator: React.FC<BatchQueueCreatorProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState('');
  const [topicsText, setTopicsText] = useState('');
  const [style, setStyle] = useState<InfographicStyle>(InfographicStyle.Modern);
  const [palette, setPalette] = useState<ColorPalette>(ColorPalette.BlueWhite);
  const [size, setSize] = useState<ImageSize>(ImageSize.Resolution_2K);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Portrait);
  const [delayBetweenItems, setDelayBetweenItems] = useState(2000);
  const [stopOnError, setStopOnError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [language, setLanguage] = useState('');
  const [extensions, setExtensions] = useState('');
  const [date, setDate] = useState('');

  const parseTopics = (text: string): string[] => {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const topics = parseTopics(topicsText);

    if (name.trim() && topics.length > 0) {
      const filters: GithubFilters | undefined =
        language || extensions || date
          ? {
              language: language || undefined,
              fileExtensions: extensions || undefined,
              lastUpdatedAfter: date || undefined
            }
          : undefined;

      onCreate(
        name.trim(),
        topics,
        style,
        palette,
        size,
        aspectRatio,
        filters,
        delayBetweenItems,
        stopOnError
      );

      // Reset form
      setName('');
      setTopicsText('');
      setStyle(InfographicStyle.Modern);
      setPalette(ColorPalette.BlueWhite);
      setSize(ImageSize.Resolution_2K);
      setAspectRatio(AspectRatio.Portrait);
      setDelayBetweenItems(2000);
      setStopOnError(false);
      setLanguage('');
      setExtensions('');
      setDate('');
      setShowFilters(false);
      onClose();
    }
  };

  const topicCount = parseTopics(topicsText).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Create Batch Queue</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Queue Name */}
          <div>
            <label htmlFor="queue-name" className="block text-sm font-medium text-slate-300 mb-2">
              Queue Name <span className="text-red-400">*</span>
            </label>
            <input
              id="queue-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Tech News Batch"
              required
            />
          </div>

          {/* Topics List */}
          <div>
            <label htmlFor="topics-list" className="block text-sm font-medium text-slate-300 mb-2">
              Topics (one per line) <span className="text-red-400">*</span>
            </label>
            <textarea
              id="topics-list"
              value={topicsText}
              onChange={(e) => setTopicsText(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="AI in Healthcare&#10;Quantum Computing&#10;https://github.com/user/repo&#10;Renewable Energy"
              required
            />
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className="text-slate-500">Maximum 50 topics</span>
              <span
                className={`font-medium ${
                  topicCount > 50
                    ? 'text-red-400'
                    : topicCount > 0
                    ? 'text-green-400'
                    : 'text-slate-500'
                }`}
              >
                {topicCount} / 50
              </span>
            </div>
            {topicCount > 50 && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>Maximum 50 topics allowed</span>
              </div>
            )}
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="batch-style" className="block text-sm font-medium text-slate-300 mb-2">
                Style
              </label>
              <select
                id="batch-style"
                value={style}
                onChange={(e) => setStyle(e.target.value as InfographicStyle)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.values(InfographicStyle).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="batch-palette" className="block text-sm font-medium text-slate-300 mb-2">
                Palette
              </label>
              <select
                id="batch-palette"
                value={palette}
                onChange={(e) => setPalette(e.target.value as ColorPalette)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.values(ColorPalette).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="batch-size" className="block text-sm font-medium text-slate-300 mb-2">
                Size
              </label>
              <select
                id="batch-size"
                value={size}
                onChange={(e) => setSize(e.target.value as ImageSize)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.values(ImageSize).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="batch-aspect" className="block text-sm font-medium text-slate-300 mb-2">
                Aspect Ratio
              </label>
              <select
                id="batch-aspect"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.values(AspectRatio).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/50 rounded-lg">
            <div>
              <label htmlFor="delay" className="block text-sm font-medium text-slate-300 mb-2">
                Delay Between Items (ms)
              </label>
              <input
                id="delay"
                type="number"
                value={delayBetweenItems}
                onChange={(e) => setDelayBetweenItems(parseInt(e.target.value))}
                min={1000}
                step={500}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stopOnError}
                  onChange={(e) => setStopOnError(e.target.checked)}
                  className="w-4 h-4 bg-slate-900 border-slate-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-300">Stop on first error</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={topicCount === 0 || topicCount > 50 || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Create Queue ({topicCount} items)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchQueueCreator;
