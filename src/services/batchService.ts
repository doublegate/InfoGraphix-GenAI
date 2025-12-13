/**
 * Batch generation queue management service.
 * v1.4.0 Feature: Batch Generation Mode
 */

import {
  BatchItem,
  BatchQueue,
  BatchStatus,
  InfographicStyle,
  ColorPalette,
  ImageSize,
  AspectRatio,
  GithubFilters
} from '../types';
import { log } from '../utils/logger';

const STORAGE_KEY = 'infographix_batch_queues';
const CONFIG_STORAGE_KEY = 'infographix_batch_configs';

/**
 * Load all batch queues from localStorage
 */
export const loadQueues = (): BatchQueue[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const queues = JSON.parse(stored);
    return Array.isArray(queues) ? queues : [];
  } catch (error) {
    log.error('Failed to load batch queues:', error);
    return [];
  }
};

/**
 * Save queues to localStorage
 */
const saveQueues = (queues: BatchQueue[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queues));
  } catch (error) {
    log.error('Failed to save batch queues:', error);
    throw new Error('Failed to save batch queue. Storage might be full.');
  }
};

/**
 * Create a new batch queue
 */
export const createQueue = (
  name: string,
  topics: string[],
  style: InfographicStyle,
  palette: ColorPalette,
  size: ImageSize,
  aspectRatio: AspectRatio,
  filters?: GithubFilters,
  delayBetweenItems: number = 2000,
  stopOnError: boolean = false
): BatchQueue => {
  const now = Date.now();

  const items: BatchItem[] = topics.map(topic => ({
    id: crypto.randomUUID(),
    topic: topic.trim(),
    status: BatchStatus.Pending,
    style,
    palette,
    size,
    aspectRatio,
    filters,
    createdAt: now
  }));

  const queue: BatchQueue = {
    id: crypto.randomUUID(),
    name,
    items,
    status: 'idle',
    createdAt: now,
    config: {
      delayBetweenItems,
      stopOnError
    }
  };

  const queues = loadQueues();
  queues.unshift(queue);
  saveQueues(queues);

  return queue;
};

/**
 * Get a queue by ID
 */
export const getQueue = (id: string): BatchQueue | null => {
  const queues = loadQueues();
  return queues.find(q => q.id === id) || null;
};

/**
 * Update a queue
 */
export const updateQueue = (id: string, updates: Partial<BatchQueue>): BatchQueue | null => {
  const queues = loadQueues();
  const index = queues.findIndex(q => q.id === id);

  if (index === -1) {
    return null;
  }

  queues[index] = {
    ...queues[index],
    ...updates
  };

  saveQueues(queues);
  return queues[index];
};

/**
 * Update a specific item in a queue
 */
export const updateQueueItem = (
  queueId: string,
  itemId: string,
  updates: Partial<BatchItem>
): BatchQueue | null => {
  const queues = loadQueues();
  const queueIndex = queues.findIndex(q => q.id === queueId);

  if (queueIndex === -1) {
    return null;
  }

  const itemIndex = queues[queueIndex].items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) {
    return null;
  }

  queues[queueIndex].items[itemIndex] = {
    ...queues[queueIndex].items[itemIndex],
    ...updates
  };

  // Update queue status based on items
  queues[queueIndex].status = deriveQueueStatus(queues[queueIndex].items);

  saveQueues(queues);
  return queues[queueIndex];
};

/**
 * Delete a queue
 */
export const deleteQueue = (id: string): boolean => {
  const queues = loadQueues();
  const filtered = queues.filter(q => q.id !== id);

  if (filtered.length === queues.length) {
    return false;
  }

  saveQueues(filtered);
  return true;
};

/**
 * Get queue statistics
 */
export const getQueueStats = (queue: BatchQueue): {
  total: number;
  pending: number;
  processing: number;
  complete: number;
  failed: number;
  cancelled: number;
} => {
  return {
    total: queue.items.length,
    pending: queue.items.filter(i => i.status === BatchStatus.Pending).length,
    processing: queue.items.filter(i => i.status === BatchStatus.Processing).length,
    complete: queue.items.filter(i => i.status === BatchStatus.Complete).length,
    failed: queue.items.filter(i => i.status === BatchStatus.Failed).length,
    cancelled: queue.items.filter(i => i.status === BatchStatus.Cancelled).length
  };
};

/**
 * Get next pending item in queue
 */
export const getNextPendingItem = (queue: BatchQueue): BatchItem | null => {
  return queue.items.find(i => i.status === BatchStatus.Pending) || null;
};

/**
 * Check if queue has any pending or processing items
 */
export const isQueueActive = (queue: BatchQueue): boolean => {
  return queue.items.some(i =>
    i.status === BatchStatus.Pending || i.status === BatchStatus.Processing
  );
};

/**
 * Derive queue status from its items
 */
const deriveQueueStatus = (items: BatchItem[]): 'idle' | 'running' | 'paused' | 'complete' => {
  const hasProcessing = items.some(i => i.status === BatchStatus.Processing);
  const hasPending = items.some(i => i.status === BatchStatus.Pending);
  const allComplete = items.every(i =>
    i.status === BatchStatus.Complete ||
    i.status === BatchStatus.Failed ||
    i.status === BatchStatus.Cancelled
  );

  if (hasProcessing) return 'running';
  if (allComplete) return 'complete';
  if (hasPending) return 'idle';
  return 'complete';
};

/**
 * Retry a failed item
 */
export const retryItem = (queueId: string, itemId: string): BatchQueue | null => {
  return updateQueueItem(queueId, itemId, {
    status: BatchStatus.Pending,
    error: undefined,
    startedAt: undefined,
    completedAt: undefined,
    result: undefined
  });
};

/**
 * Cancel a pending or processing item
 */
export const cancelItem = (queueId: string, itemId: string): BatchQueue | null => {
  return updateQueueItem(queueId, itemId, {
    status: BatchStatus.Cancelled,
    completedAt: Date.now()
  });
};

/**
 * Pause a queue (mark all pending items as paused by setting queue status)
 */
export const pauseQueue = (queueId: string): BatchQueue | null => {
  return updateQueue(queueId, { status: 'paused' });
};

/**
 * Resume a paused queue
 */
export const resumeQueue = (queueId: string): BatchQueue | null => {
  return updateQueue(queueId, { status: 'idle' });
};

/**
 * Cancel all pending items in a queue
 */
export const cancelQueue = (queueId: string): BatchQueue | null => {
  const queue = getQueue(queueId);
  if (!queue) return null;

  const updatedItems = queue.items.map(item => {
    if (item.status === BatchStatus.Pending || item.status === BatchStatus.Processing) {
      return {
        ...item,
        status: BatchStatus.Cancelled,
        completedAt: Date.now()
      };
    }
    return item;
  });

  return updateQueue(queueId, {
    items: updatedItems,
    status: 'complete'
  });
};

/**
 * Save a batch configuration preset
 */
export interface BatchConfigPreset {
  id: string;
  name: string;
  style: InfographicStyle;
  palette: ColorPalette;
  size: ImageSize;
  aspectRatio: AspectRatio;
  filters?: GithubFilters;
  delayBetweenItems: number;
  stopOnError: boolean;
  createdAt: number;
}

export const saveBatchConfig = (
  name: string,
  style: InfographicStyle,
  palette: ColorPalette,
  size: ImageSize,
  aspectRatio: AspectRatio,
  delayBetweenItems: number = 2000,
  stopOnError: boolean = false,
  filters?: GithubFilters
): BatchConfigPreset => {
  const preset: BatchConfigPreset = {
    id: crypto.randomUUID(),
    name,
    style,
    palette,
    size,
    aspectRatio,
    filters,
    delayBetweenItems,
    stopOnError,
    createdAt: Date.now()
  };

  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    const configs = stored ? JSON.parse(stored) : [];
    configs.unshift(preset);
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
  } catch (error) {
    log.error('Failed to save batch config:', error);
  }

  return preset;
};

/**
 * Load batch configuration presets
 */
export const loadBatchConfigs = (): BatchConfigPreset[] => {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!stored) return [];
    const configs = JSON.parse(stored);
    return Array.isArray(configs) ? configs : [];
  } catch (error) {
    log.error('Failed to load batch configs:', error);
    return [];
  }
};

/**
 * Delete a batch configuration preset
 */
export const deleteBatchConfig = (id: string): boolean => {
  try {
    const configs = loadBatchConfigs();
    const filtered = configs.filter(c => c.id !== id);

    if (filtered.length === configs.length) {
      return false;
    }

    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    log.error('Failed to delete batch config:', error);
    return false;
  }
};
