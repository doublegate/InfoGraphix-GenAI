/**
 * TemplateEditor - Form for creating and editing templates
 * v1.4.0 Feature: Custom Style Templates
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Tag as TagIcon } from 'lucide-react';
import {
  TemplateConfig,
  InfographicStyle,
  ColorPalette,
  ImageSize,
  AspectRatio
} from '../../types';

interface TemplateEditorProps {
  template?: TemplateConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    name: string,
    style: InfographicStyle,
    palette: ColorPalette,
    size: ImageSize,
    aspectRatio: AspectRatio,
    description?: string,
    tags?: string[]
  ) => void;
  mode?: 'create' | 'edit';
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  isOpen,
  onClose,
  onSave,
  mode = 'create'
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState<InfographicStyle>(InfographicStyle.Modern);
  const [palette, setPalette] = useState<ColorPalette>(ColorPalette.BlueWhite);
  const [size, setSize] = useState<ImageSize>(ImageSize.Resolution_2K);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Portrait);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Load template data when editing
  useEffect(() => {
    if (template && mode === 'edit') {
      setName(template.name);
      setDescription(template.description || '');
      setStyle(template.style);
      setPalette(template.palette);
      setSize(template.size);
      setAspectRatio(template.aspectRatio);
      setTags(template.tags || []);
    } else {
      // Reset form for create mode
      setName('');
      setDescription('');
      setStyle(InfographicStyle.Modern);
      setPalette(ColorPalette.BlueWhite);
      setSize(ImageSize.Resolution_2K);
      setAspectRatio(AspectRatio.Portrait);
      setTags([]);
    }
  }, [template, mode, isOpen]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(
        name.trim(),
        style,
        palette,
        size,
        aspectRatio,
        description.trim() || undefined,
        tags.length > 0 ? tags : undefined
      );
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'edit' ? 'Edit Template' : 'Create New Template'}
          </h2>
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
          {/* Name */}
          <div>
            <label htmlFor="template-name" className="block text-sm font-medium text-slate-300 mb-2">
              Template Name <span className="text-red-400">*</span>
            </label>
            <input
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Corporate Blue Template"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="template-description" className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe when and how to use this template..."
            />
          </div>

          {/* Style */}
          <div>
            <label htmlFor="template-style" className="block text-sm font-medium text-slate-300 mb-2">
              Infographic Style <span className="text-red-400">*</span>
            </label>
            <select
              id="template-style"
              value={style}
              onChange={(e) => setStyle(e.target.value as InfographicStyle)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {Object.values(InfographicStyle).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Color Palette */}
          <div>
            <label htmlFor="template-palette" className="block text-sm font-medium text-slate-300 mb-2">
              Color Palette <span className="text-red-400">*</span>
            </label>
            <select
              id="template-palette"
              value={palette}
              onChange={(e) => setPalette(e.target.value as ColorPalette)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {Object.values(ColorPalette).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Size & Aspect Ratio Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="template-size" className="block text-sm font-medium text-slate-300 mb-2">
                Image Size <span className="text-red-400">*</span>
              </label>
              <select
                id="template-size"
                value={size}
                onChange={(e) => setSize(e.target.value as ImageSize)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {Object.values(ImageSize).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="template-aspect" className="block text-sm font-medium text-slate-300 mb-2">
                Aspect Ratio <span className="text-red-400">*</span>
              </label>
              <select
                id="template-aspect"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {Object.values(AspectRatio).map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="template-tags" className="block text-sm font-medium text-slate-300 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                id="template-tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm"
                  >
                    <TagIcon className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {mode === 'edit' ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateEditor;
