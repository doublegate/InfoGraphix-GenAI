/**
 * BatchQueueCard - Queue overview and actions
 * v1.4.0 Feature: Batch Generation Mode
 */

import React from 'react';
import {
  Play,
  Pause,
  Trash2,
  Eye,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Calendar
} from 'lucide-react';
import { BatchQueue } from '../../types';
import { getQueueStats } from '../../services/batchService';

interface BatchQueueCardProps {
  queue: BatchQueue;
  onStart?: (queueId: string) => void;
  onPause?: (queueId: string) => void;
  onDelete?: (queueId: string) => void;
  onView?: (queue: BatchQueue) => void;
  isRunning?: boolean;
}

const BatchQueueCard: React.FC<BatchQueueCardProps> = ({
  queue,
  onStart,
  onPause,
  onDelete,
  onView,
  isRunning
}) => {
  const stats = getQueueStats(queue);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round(((stats.complete + stats.failed + stats.cancelled) / stats.total) * 100);
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{queue.name}</h3>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(queue.createdAt)}</span>
            <span className="text-slate-600">·</span>
            <span>{stats.total} items</span>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            queue.status === 'running'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
              : queue.status === 'paused'
              ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30'
              : queue.status === 'complete'
              ? 'bg-green-600/20 text-green-300 border border-green-500/30'
              : 'bg-slate-600/20 text-slate-300 border border-slate-500/30'
          }`}
        >
          {queue.status}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Progress</span>
          <span>{getProgressPercentage()}%</span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div
              className="bg-green-500 transition-all duration-300"
              style={{ width: `${(stats.complete / stats.total) * 100}%` }}
            />
            <div
              className="bg-red-500 transition-all duration-300"
              style={{ width: `${(stats.failed / stats.total) * 100}%` }}
            />
            <div
              className="bg-slate-600 transition-all duration-300"
              style={{ width: `${(stats.cancelled / stats.total) * 100}%` }}
            />
            <div
              className="bg-blue-500 transition-all duration-300 animate-pulse"
              style={{ width: `${(stats.processing / stats.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        <div className="flex flex-col items-center p-2 bg-slate-900/50 rounded">
          <Clock className="w-4 h-4 text-slate-400 mb-1" />
          <span className="text-xs text-slate-400">Pending</span>
          <span className="text-sm font-semibold text-white">{stats.pending}</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-blue-900/20 rounded">
          <Loader2 className="w-4 h-4 text-blue-400 mb-1" />
          <span className="text-xs text-blue-400">Processing</span>
          <span className="text-sm font-semibold text-white">{stats.processing}</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-green-900/20 rounded">
          <CheckCircle2 className="w-4 h-4 text-green-400 mb-1" />
          <span className="text-xs text-green-400">Complete</span>
          <span className="text-sm font-semibold text-white">{stats.complete}</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-red-900/20 rounded">
          <XCircle className="w-4 h-4 text-red-400 mb-1" />
          <span className="text-xs text-red-400">Failed</span>
          <span className="text-sm font-semibold text-white">{stats.failed}</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-slate-800/50 rounded">
          <span className="text-xs text-slate-500 mb-1">❌</span>
          <span className="text-xs text-slate-500">Cancelled</span>
          <span className="text-sm font-semibold text-slate-400">{stats.cancelled}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onView && (
          <button
            onClick={() => onView(queue)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
        )}
        {queue.status === 'running' && onPause && (
          <button
            onClick={() => onPause(queue.id)}
            className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition-colors"
            title="Pause queue"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}
        {(queue.status === 'idle' || queue.status === 'paused') && onStart && !isRunning && (
          <button
            onClick={() => onStart(queue.id)}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            title="Start queue"
          >
            <Play className="w-4 h-4" />
          </button>
        )}
        {onDelete && queue.status !== 'running' && (
          <button
            onClick={() => {
              if (confirm(`Delete queue "${queue.name}"?`)) {
                onDelete(queue.id);
              }
            }}
            className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
            title="Delete queue"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default BatchQueueCard;
