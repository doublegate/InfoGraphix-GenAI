/**
 * BatchItemCard - Individual batch item status display
 * v1.4.0 Feature: Batch Generation Mode
 */

import React from 'react';
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCw,
  Eye
} from 'lucide-react';
import { BatchItem, BatchStatus } from '../../types';

interface BatchItemCardProps {
  item: BatchItem;
  onRetry?: (itemId: string) => void;
  onCancel?: (itemId: string) => void;
  onView?: (item: BatchItem) => void;
}

const BatchItemCard: React.FC<BatchItemCardProps> = ({
  item,
  onRetry,
  onCancel,
  onView
}) => {
  const getStatusIcon = () => {
    switch (item.status) {
      case BatchStatus.Pending:
        return <Clock className="w-5 h-5 text-slate-400" />;
      case BatchStatus.Processing:
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case BatchStatus.Complete:
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case BatchStatus.Failed:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case BatchStatus.Cancelled:
        return <Ban className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case BatchStatus.Pending:
        return 'border-slate-700 bg-slate-800/30';
      case BatchStatus.Processing:
        return 'border-blue-500/50 bg-blue-900/20';
      case BatchStatus.Complete:
        return 'border-green-500/50 bg-green-900/20';
      case BatchStatus.Failed:
        return 'border-red-500/50 bg-red-900/20';
      case BatchStatus.Cancelled:
        return 'border-slate-600 bg-slate-800/20';
    }
  };

  const formatDuration = () => {
    if (!item.startedAt) return null;
    const end = item.completedAt || Date.now();
    const duration = Math.floor((end - item.startedAt) / 1000);
    return `${duration}s`;
  };

  return (
    <div
      className={`p-4 rounded-lg border ${getStatusColor()} transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5">{getStatusIcon()}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white truncate">{item.topic}</h3>
            <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-400">
              <span>{item.style}</span>
              <span>·</span>
              <span>{item.palette}</span>
              <span>·</span>
              <span>{item.size}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2">
          {item.status === BatchStatus.Complete && onView && (
            <button
              onClick={() => onView(item)}
              className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
              title="View result"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {item.status === BatchStatus.Failed && onRetry && (
            <button
              onClick={() => onRetry(item.id)}
              className="p-1.5 hover:bg-slate-700 rounded transition-colors text-blue-400 hover:text-blue-300"
              title="Retry"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          )}
          {(item.status === BatchStatus.Pending || item.status === BatchStatus.Processing) &&
            onCancel && (
              <button
                onClick={() => onCancel(item.id)}
                className="p-1.5 hover:bg-slate-700 rounded transition-colors text-red-400 hover:text-red-300"
                title="Cancel"
              >
                <Ban className="w-4 h-4" />
              </button>
            )}
        </div>
      </div>

      {/* Status Details */}
      <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-700/50">
        <span
          className={`px-2 py-0.5 rounded-full ${
            item.status === BatchStatus.Pending
              ? 'bg-slate-700 text-slate-300'
              : item.status === BatchStatus.Processing
              ? 'bg-blue-600/20 text-blue-300'
              : item.status === BatchStatus.Complete
              ? 'bg-green-600/20 text-green-300'
              : item.status === BatchStatus.Failed
              ? 'bg-red-600/20 text-red-300'
              : 'bg-slate-600/20 text-slate-400'
          }`}
        >
          {item.status}
        </span>
        {formatDuration() && (
          <span className="text-slate-500">{formatDuration()}</span>
        )}
      </div>

      {/* Error Message */}
      {item.error && (
        <div className="mt-2 p-2 bg-red-900/10 border border-red-500/20 rounded text-xs text-red-400">
          {item.error}
        </div>
      )}
    </div>
  );
};

export default BatchItemCard;
