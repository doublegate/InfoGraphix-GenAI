/**
 * Batch generation queue management service.
 * v1.8.0 TD-003: Migrated to IndexedDB storage
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
import {
  getBatchQueue as getBatchQueueFromDB,
  saveBatchQueue as saveBatchQueueToDB,
  deleteBatchItem as deleteBatchItemFromDB,
  updateBatchItem as updateBatchItemInDB,
  clearBatchQueue as clearBatchQueueFromDB,
  migrateBatchQueueFromLocalStorage,
  BatchQueueItem,
} from './storageService';

const CONFIG_STORAGE_KEY = 'infographix_batch_configs';

// Migration flag
let migrationComplete = false;

/**
 * Ensures migration from localStorage has been performed.
 */
const ensureMigration = async (): Promise<void> => {
  if (migrationComplete) return;

  try {
    const migrated = await migrateBatchQueueFromLocalStorage();
    if (migrated > 0) {
      log.info(`Batch queue migration: ${migrated} items migrated to IndexedDB`);
    }
    migrationComplete = true;
  } catch (e) {
    log.error('Batch queue migration error:', e);
    migrationComplete = true;
  }
};

/**
 * Convert IndexedDB BatchQueueItem to app BatchQueue format
 * Note: IndexedDB stores flattened items, we reconstruct queues as needed
 */
const convertToQueue = (items: BatchQueueItem[]): BatchQueue => {
  // Create a synthetic queue from items
  const batchItems: BatchItem[] = items.map(item => ({
    id: item.id,
    topic: item.topic,
    status: item.status as BatchStatus,
    style: item.style as InfographicStyle,
    palette: item.palette as ColorPalette,
    size: item.size as ImageSize,
    aspectRatio: item.aspectRatio as AspectRatio,
    createdAt: item.createdAt,
    startedAt: undefined,
    completedAt: item.completedAt,
    result: item.result,
    error: item.error,
  }));

  return {
    id: crypto.randomUUID(),
    name: 'Current Queue',
    items: batchItems,
    status: deriveQueueStatus(batchItems),
    createdAt: Date.now(),
    config: {
      delayBetweenItems: 2000,
      stopOnError: false,
    },
  };
};

/**
 * Load all batch queues from IndexedDB
 */
export const loadQueues = async (): Promise<BatchQueue[]> => {
  await ensureMigration();

  try {
    const items = await getBatchQueueFromDB();
    if (items.length === 0) return [];

    // Return a single queue containing all items
    return [convertToQueue(items)];
  } catch (error) {
    log.error('Failed to load batch queues:', error);
    return [];
  }
};

/**
 * Create a new batch queue
 */
export const createQueue = async (
  name: string,
  topics: string[],
  style: InfographicStyle,
  palette: ColorPalette,
  size: ImageSize,
  aspectRatio: AspectRatio,
  filters?: GithubFilters,
  delayBetweenItems: number = 2000,
  stopOnError: boolean = false
): Promise<BatchQueue> => {
  await ensureMigration();

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

  // Save each item to IndexedDB
  for (const item of items) {
    const queueItem: BatchQueueItem = {
      id: item.id,
      topic: item.topic,
      size: item.size as string,
      aspectRatio: item.aspectRatio as string,
      style: item.style as string,
      palette: item.palette as string,
      status: item.status as 'pending' | 'processing' | 'complete' | 'error',
      createdAt: item.createdAt,
      completedAt: item.completedAt,
      result: item.result,
      error: item.error,
    };
    await saveBatchQueueToDB(queueItem);
  }

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

  return queue;
};

/**
 * Get a queue by ID
 * Note: In IndexedDB mode, we reconstruct queues from items
 */
export const getQueue = async (id: string): Promise<BatchQueue | null> => {
  await ensureMigration();

  try {
    const queues = await loadQueues();
    return queues.find(q => q.id === id) || null;
  } catch (error) {
    log.error('Failed to get queue:', error);
    return null;
  }
};

/**
 * Update a queue
 * Note: Only updates items in IndexedDB, queue metadata is ephemeral
 */
export const updateQueue = async (id: string, updates: Partial<BatchQueue>): Promise<BatchQueue | null> => {
  await ensureMigration();

  try {
    const queues = await loadQueues();
    const queue = queues.find(q => q.id === id);

    if (!queue) {
      return null;
    }

    // Update queue in memory
    const updated = {
      ...queue,
      ...updates
    };

    return updated;
  } catch (error) {
    log.error('Failed to update queue:', error);
    return null;
  }
};

/**
 * Update a specific item in a queue
 */
export const updateQueueItem = async (
  queueId: string,
  itemId: string,
  updates: Partial<BatchItem>
): Promise<BatchQueue | null> => {
  await ensureMigration();

  try {
    // Update item in IndexedDB
    const dbUpdates: Partial<BatchQueueItem> = {
      status: updates.status as 'pending' | 'processing' | 'complete' | 'error' | undefined,
      completedAt: updates.completedAt,
      result: updates.result,
      error: updates.error,
    };

    await updateBatchItemInDB(itemId, dbUpdates);

    // Return updated queue
    const queues = await loadQueues();
    return queues[0] || null;
  } catch (error) {
    log.error('Failed to update queue item:', error);
    return null;
  }
};

/**
 * Delete a queue (clears all items)
 */
export const deleteQueue = async (id: string): Promise<boolean> => {
  await ensureMigration();

  try {
    await clearBatchQueueFromDB();
    return true;
  } catch (error) {
    log.error('Failed to delete queue:', error);
    return false;
  }
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
export const retryItem = async (queueId: string, itemId: string): Promise<BatchQueue | null> => {
  return await updateQueueItem(queueId, itemId, {
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
export const cancelItem = async (queueId: string, itemId: string): Promise<BatchQueue | null> => {
  return await updateQueueItem(queueId, itemId, {
    status: BatchStatus.Cancelled,
    completedAt: Date.now()
  });
};

/**
 * Pause a queue (mark all pending items as paused by setting queue status)
 */
export const pauseQueue = async (queueId: string): Promise<BatchQueue | null> => {
  return await updateQueue(queueId, { status: 'paused' });
};

/**
 * Resume a paused queue
 */
export const resumeQueue = async (queueId: string): Promise<BatchQueue | null> => {
  return await updateQueue(queueId, { status: 'idle' });
};

/**
 * Cancel all pending items in a queue
 */
export const cancelQueue = async (queueId: string): Promise<BatchQueue | null> => {
  await ensureMigration();

  try {
    const queue = await getQueue(queueId);
    if (!queue) return null;

    // Update all pending/processing items to cancelled
    for (const item of queue.items) {
      if (item.status === BatchStatus.Pending || item.status === BatchStatus.Processing) {
        await updateQueueItem(queueId, item.id, {
          status: BatchStatus.Cancelled,
          completedAt: Date.now()
        });
      }
    }

    // Return updated queue
    const updated = await getQueue(queueId);
    return updated ? { ...updated, status: 'complete' } : null;
  } catch (error) {
    log.error('Failed to cancel queue:', error);
    return null;
  }
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
