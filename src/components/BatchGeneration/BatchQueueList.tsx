/**
 * BatchQueueList - Display list of batch queues
 * v1.4.0 Feature: Batch Generation Mode
 */

import React from 'react';
import { BatchQueue } from '../../types';
import BatchQueueCard from './BatchQueueCard';

interface BatchQueueListProps {
  queues: BatchQueue[];
  onStart?: (queueId: string) => void;
  onPause?: (queueId: string) => void;
  onDelete?: (queueId: string) => void;
  onView?: (queue: BatchQueue) => void;
  runningQueueId?: string | null;
}

const BatchQueueList: React.FC<BatchQueueListProps> = ({
  queues,
  onStart,
  onPause,
  onDelete,
  onView,
  runningQueueId
}) => {
  if (queues.length === 0) {
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-400 mb-2">No Batch Queues</h3>
        <p className="text-sm text-slate-500 max-w-md">
          Create your first batch queue to generate multiple infographics at once
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {queues.map((queue) => (
        <BatchQueueCard
          key={queue.id}
          queue={queue}
          onStart={onStart}
          onPause={onPause}
          onDelete={onDelete}
          onView={onView}
          isRunning={runningQueueId !== null && runningQueueId !== queue.id}
        />
      ))}
    </div>
  );
};

export default BatchQueueList;
