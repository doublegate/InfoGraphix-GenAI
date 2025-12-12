/**
 * BatchManager - Main batch generation interface
 * v1.4.0 Feature: Batch Generation Mode
 */

import React, { useState, useEffect } from 'react';
import { Plus, Download, RefreshCw, X } from 'lucide-react';
import {
  BatchQueue,
  BatchItem,
  InfographicStyle,
  ColorPalette,
  ImageSize,
  AspectRatio,
  GithubFilters
} from '../../types';
import {
  loadQueues,
  createQueue,
  deleteQueue,
  pauseQueue
} from '../../services/batchService';
import BatchQueueCreator from './BatchQueueCreator';
import BatchQueueList from './BatchQueueList';
import BatchItemCard from './BatchItemCard';

interface BatchManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartQueue?: (queue: BatchQueue) => void;
  onViewItem?: (item: BatchItem) => void;
}

const BatchManager: React.FC<BatchManagerProps> = ({ isOpen, onClose, onStartQueue, onViewItem }) => {
  const [queues, setQueues] = useState<BatchQueue[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<BatchQueue | null>(null);
  const [runningQueueId, setRunningQueueId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshQueues();
    }
  }, [isOpen]);

  const refreshQueues = () => {
    const loaded = loadQueues();
    setQueues(loaded);
  };

  const handleCreate = (
    name: string,
    topics: string[],
    style: InfographicStyle,
    palette: ColorPalette,
    size: ImageSize,
    aspectRatio: AspectRatio,
    filters?: GithubFilters,
    delayBetweenItems?: number,
    stopOnError?: boolean
  ) => {
    createQueue(
      name,
      topics,
      style,
      palette,
      size,
      aspectRatio,
      filters,
      delayBetweenItems,
      stopOnError
    );
    refreshQueues();
  };

  const handleStart = (queueId: string) => {
    const queue = queues.find((q) => q.id === queueId);
    if (queue && onStartQueue) {
      setRunningQueueId(queueId);
      onStartQueue(queue);
    }
  };

  const handlePause = (queueId: string) => {
    pauseQueue(queueId);
    setRunningQueueId(null);
    refreshQueues();
  };

  const handleDelete = (queueId: string) => {
    deleteQueue(queueId);
    if (selectedQueue?.id === queueId) {
      setSelectedQueue(null);
    }
    refreshQueues();
  };

  const handleView = (queue: BatchQueue) => {
    setSelectedQueue(queue);
  };

  const handleExportCompleted = async (queue: BatchQueue) => {
    const completed = queue.items.filter((item) => item.result);
    if (completed.length === 0) {
      alert('No completed items to export');
      return;
    }

    const items = completed.map((item) => ({
      filename: item.topic.replace(/[^a-z0-9_\-]/gi, '_'),
      dataURL: item.result!.imageUrl
    }));

    // Dynamic import to only load export libraries when needed
    const { exportBatchAsZip } = await import('../../utils/exportUtils');
    exportBatchAsZip(items, queue.name.replace(/[^a-z0-9_\-]/gi, '_'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Batch Generation</h2>
              <p className="text-sm text-slate-400">
                Generate multiple infographics in a queue (up to 50 per batch)
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={refreshQueues}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                title="Refresh queues"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowCreator(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Batch Queue
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

      {/* Queue List or Detail View */}
      {selectedQueue ? (
        <div className="space-y-4">
          {/* Back Button */}
          <button
            onClick={() => setSelectedQueue(null)}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
          >
            ← Back to All Queues
          </button>

          {/* Queue Header */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{selectedQueue.name}</h3>
              <div className="flex gap-2">
                {selectedQueue.items.some((item) => item.result) && (
                  <button
                    onClick={() => handleExportCompleted(selectedQueue)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Completed ({selectedQueue.items.filter((i) => i.result).length})
                  </button>
                )}
              </div>
            </div>

            {/* Progress Summary */}
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">
                  {selectedQueue.items.length}
                </div>
                <div className="text-xs text-slate-400">Total Items</div>
              </div>
              <div className="bg-green-900/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">
                  {selectedQueue.items.filter((i) => i.result).length}
                </div>
                <div className="text-xs text-green-400">Completed</div>
              </div>
              <div className="bg-blue-900/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">
                  {selectedQueue.items.filter((i) => !i.result && !i.error).length}
                </div>
                <div className="text-xs text-blue-400">Remaining</div>
              </div>
              <div className="bg-red-900/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-400">
                  {selectedQueue.items.filter((i) => i.error).length}
                </div>
                <div className="text-xs text-red-400">Failed</div>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedQueue.items.map((item) => (
              <BatchItemCard
                key={item.id}
                item={item}
                onView={onViewItem}
              />
            ))}
          </div>
        </div>
      ) : (
        <BatchQueueList
          queues={queues}
          onStart={handleStart}
          onPause={handlePause}
          onDelete={handleDelete}
          onView={handleView}
          runningQueueId={runningQueueId}
        />
      )}

          {/* Creator Modal */}
          <BatchQueueCreator
            isOpen={showCreator}
            onClose={() => setShowCreator(false)}
            onCreate={handleCreate}
          />
        </div>
      </div>
    </div>
  );
};

export default BatchManager;
