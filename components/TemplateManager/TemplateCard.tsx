/**
 * TemplateCard - Individual template preview card
 * v1.4.0 Feature: Custom Style Templates
 */

import React from 'react';
import {
  Edit,
  Trash2,
  Download,
  Copy,
  Tag,
  Calendar,
  User
} from 'lucide-react';
import { TemplateConfig } from '../../types';

interface TemplateCardProps {
  template: TemplateConfig;
  onSelect?: (template: TemplateConfig) => void;
  onEdit?: (template: TemplateConfig) => void;
  onDelete?: (id: string) => void;
  onExport?: (template: TemplateConfig) => void;
  onDuplicate?: (template: TemplateConfig) => void;
  isSelected?: boolean;
  mode?: 'browse' | 'select';
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onSelect,
  onEdit,
  onDelete,
  onExport,
  onDuplicate,
  isSelected,
  mode = 'browse'
}) => {
  const handleClick = () => {
    if (mode === 'select' && onSelect) {
      onSelect(template);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      className={`bg-slate-800/50 rounded-xl border ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-slate-700'
      } p-4 hover:border-slate-600 transition-all ${
        mode === 'select' ? 'cursor-pointer' : ''
      } group`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
          {template.description && (
            <p className="text-sm text-slate-400 line-clamp-2">{template.description}</p>
          )}
        </div>
      </div>

      {/* Configuration Preview */}
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500">Style:</span>
            <span className="ml-2 text-slate-300">{template.style}</span>
          </div>
          <div>
            <span className="text-slate-500">Palette:</span>
            <span className="ml-2 text-slate-300">{template.palette}</span>
          </div>
          <div>
            <span className="text-slate-500">Size:</span>
            <span className="ml-2 text-slate-300">{template.size}</span>
          </div>
          <div>
            <span className="text-slate-500">Aspect:</span>
            <span className="ml-2 text-slate-300">{template.aspectRatio}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {template.tags && template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded-full"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span>{template.creator || 'User'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(template.updatedAt)}</span>
        </div>
      </div>

      {/* Actions */}
      {mode === 'browse' && (
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onSelect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(template);
              }}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
              title="Use this template"
            >
              Use Template
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(template);
              }}
              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              title="Edit template"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(template);
              }}
              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              title="Duplicate template"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
          {onExport && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExport(template);
              }}
              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              title="Export template"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete template "${template.name}"?`)) {
                  onDelete(template.id);
                }
              }}
              className="p-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
              title="Delete template"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Select Mode Indicator */}
      {mode === 'select' && isSelected && (
        <div className="flex items-center justify-center gap-2 text-blue-400 text-sm font-medium">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          Selected
        </div>
      )}
    </div>
  );
};

export default TemplateCard;
