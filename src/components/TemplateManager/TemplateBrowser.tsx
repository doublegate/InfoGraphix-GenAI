/**
 * TemplateBrowser - Main template management interface
 * v1.4.0 Feature: Custom Style Templates
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Upload,
  RotateCcw,
  FileText,
  X,
  FolderOpen,
  ChevronDown
} from 'lucide-react';
import { TemplateConfig, InfographicStyle, ColorPalette, ImageSize, AspectRatio } from '../../types';
import {
  loadTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  exportTemplate,
  importTemplate,
  resetToDefaults,
  TEMPLATE_CATEGORIES,
  getTemplateCategory
} from '../../services/templateService';
import TemplateGrid from './TemplateGrid';
import TemplateEditor from './TemplateEditor';

interface TemplateBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate?: (template: TemplateConfig) => void;
  mode?: 'browse' | 'select';
  selectedTemplateId?: string;
}

const TemplateBrowser: React.FC<TemplateBrowserProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  mode = 'browse',
  selectedTemplateId
}) => {
  const [templates, setTemplates] = useState<TemplateConfig[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateConfig | undefined>();
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');

  // Group templates by category for counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Categories': templates.length };
    TEMPLATE_CATEGORIES.forEach(cat => { counts[cat] = 0; });
    counts['Other'] = 0;
    templates.forEach(t => {
      const cat = getTemplateCategory(t);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [templates]);

  // Sort categories alphabetically
  const sortedCategories = useMemo(() => {
    return ['All Categories', ...TEMPLATE_CATEGORIES.slice().sort(), 'Other'];
  }, []);

  // Load templates on mount
  useEffect(() => {
    if (isOpen) {
      void refreshTemplates();
    }
  }, [isOpen]);

  // Filter templates based on search and category
  useEffect(() => {
    let result = templates;

    // Filter by category first
    if (selectedCategory !== 'All Categories') {
      result = result.filter(t => getTemplateCategory(t) === selectedCategory);
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort alphabetically by name
    result = result.slice().sort((a, b) => a.name.localeCompare(b.name));

    setFilteredTemplates(result);
  }, [searchQuery, templates, selectedCategory]);

  const refreshTemplates = async () => {
    const loaded = await loadTemplates();
    setTemplates(loaded);
  };

  const handleCreateNew = () => {
    setEditingTemplate(undefined);
    setEditorMode('create');
    setIsEditorOpen(true);
  };

  const handleEdit = (template: TemplateConfig) => {
    setEditingTemplate(template);
    setEditorMode('edit');
    setIsEditorOpen(true);
  };

  const handleSave = (
    name: string,
    style: InfographicStyle,
    palette: ColorPalette,
    size: ImageSize,
    aspectRatio: AspectRatio,
    description?: string,
    tags?: string[]
  ) => {
    if (editorMode === 'edit' && editingTemplate) {
      void updateTemplate(editingTemplate.id, {
        name,
        style,
        palette,
        size,
        aspectRatio,
        description,
        tags
      });
    } else {
      void createTemplate(name, style, palette, size, aspectRatio, description, tags);
    }
    void refreshTemplates();
  };

  const handleDelete = (id: string) => {
    void deleteTemplate(id);
    void refreshTemplates();
  };

  const handleExport = (template: TemplateConfig) => {
    void exportTemplate(template);
  };

  const handleDuplicate = (template: TemplateConfig) => {
    void createTemplate(
      `${template.name} (Copy)`,
      template.style,
      template.palette,
      template.size,
      template.aspectRatio,
      template.description,
      template.tags
    );
    void refreshTemplates();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importTemplate(file);
      void refreshTemplates();
      alert('Template imported successfully!');
    } catch (error) {
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Reset input
    event.target.value = '';
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset all templates to defaults? This will remove your custom templates.')) {
      void resetToDefaults();
      void refreshTemplates();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {mode === 'select' ? 'Select Template' : 'Template Library'}
              </h2>
              <p className="text-sm text-slate-400">
                {mode === 'select'
                  ? 'Choose a template to apply its settings'
                  : 'Manage your custom style templates'}
              </p>
            </div>

            <div className="flex gap-2">
              {mode === 'browse' && (
                <>
                  <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Template
                  </button>
                  <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => { void handleImport(e); }}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleResetToDefaults}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    title="Reset to defaults"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Category Selector and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Category Dropdown */}
            <div className="relative sm:w-64">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-slate-400" />
                  <span className="truncate">{selectedCategory}</span>
                  {selectedCategory !== 'All Categories' && (
                    <span className="text-xs text-slate-500">({categoryCounts[selectedCategory] || 0})</span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCategoryDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCategoryDropdown(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                    {sortedCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left hover:bg-slate-700 transition-colors flex items-center justify-between ${
                          selectedCategory === category ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300'
                        } ${category === 'All Categories' ? 'border-b border-slate-700' : ''}`}
                      >
                        <span>{category}</span>
                        <span className="text-xs text-slate-500">{categoryCounts[category] || 0}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by name, description, or tags..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <FileText className="w-4 h-4" />
              <span>
                {filteredTemplates.length} of {templates.length} templates
                {selectedCategory !== 'All Categories' && ` in "${selectedCategory}"`}
              </span>
            </div>
            {selectedCategory !== 'All Categories' && (
              <button
                onClick={() => setSelectedCategory('All Categories')}
                className="text-blue-400 hover:text-blue-300 text-xs"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* Template Grid */}
          <TemplateGrid
            templates={filteredTemplates}
            selectedTemplateId={selectedTemplateId}
            onSelect={onApplyTemplate}
            onEdit={mode === 'browse' ? handleEdit : undefined}
            onDelete={mode === 'browse' ? handleDelete : undefined}
            onExport={mode === 'browse' ? handleExport : undefined}
            onDuplicate={mode === 'browse' ? handleDuplicate : undefined}
            mode={mode}
            emptyMessage={
              searchQuery
                ? 'No templates match your search'
                : 'No templates available'
            }
          />

          {/* Editor Modal */}
          <TemplateEditor
            template={editingTemplate}
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSave}
            mode={editorMode}
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateBrowser;
