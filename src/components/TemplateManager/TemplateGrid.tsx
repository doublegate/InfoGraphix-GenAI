/**
 * TemplateGrid - Grid layout for browsing templates
 * v1.4.0 Feature: Custom Style Templates
 */

import React from 'react';
import { TemplateConfig } from '../../types';
import TemplateCard from './TemplateCard';

interface TemplateGridProps {
  templates: TemplateConfig[];
  selectedTemplateId?: string;
  onSelect?: (template: TemplateConfig) => void;
  onEdit?: (template: TemplateConfig) => void;
  onDelete?: (id: string) => void;
  onExport?: (template: TemplateConfig) => void;
  onDuplicate?: (template: TemplateConfig) => void;
  mode?: 'browse' | 'select';
  emptyMessage?: string;
}

const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  selectedTemplateId,
  onSelect,
  onEdit,
  onDelete,
  onExport,
  onDuplicate,
  mode = 'browse',
  emptyMessage = 'No templates found'
}) => {
  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-400 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-slate-500 max-w-md">
          {mode === 'browse'
            ? 'Create your first template to get started'
            : 'Try adjusting your search or filters'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          isSelected={template.id === selectedTemplateId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onExport={onExport}
          onDuplicate={onDuplicate}
          mode={mode}
        />
      ))}
    </div>
  );
};

export default TemplateGrid;
