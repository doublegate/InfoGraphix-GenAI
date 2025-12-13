/**
 * Request types for the InfoGraphix AI API.
 *
 * Defines the shape of all API request payloads.
 *
 * @module api/types/requests
 */

import type {
  InfographicStyle,
  ColorPalette,
  ImageSize,
  AspectRatio,
  GithubFilters,
} from '../../types';
import type { PaginationParams, SortParams, DateRangeFilter } from './common';
import type { WebhookEvent } from './models';

/**
 * Generate infographic request.
 *
 * Creates a single infographic generation job.
 */
export interface GenerateInfographicRequest {
  /** Topic, URL, or GitHub repository to analyze */
  topic: string;

  /** Visual style for the infographic */
  style?: InfographicStyle;

  /** Color palette for the infographic */
  palette?: ColorPalette;

  /** Output image resolution */
  size?: ImageSize;

  /** Output image aspect ratio */
  aspectRatio?: AspectRatio;

  /** Optional GitHub repository filters */
  filters?: GithubFilters;

  /** Optional file content for analysis (markdown, CSV, etc.) */
  fileContent?: string;

  /** Optional webhook URL for completion notification */
  webhookUrl?: string;
}

/**
 * Batch generate request.
 *
 * Creates a batch of infographic generation jobs.
 */
export interface BatchGenerateRequest {
  /** Name for this batch */
  name: string;

  /** Array of generation requests */
  items: GenerateInfographicRequest[];

  /** Batch configuration options */
  options?: {
    /** Delay between processing items (milliseconds, default: 0) */
    delayBetweenItems?: number;

    /** Stop processing on first error (default: false) */
    stopOnError?: boolean;

    /** Webhook URL for batch progress notifications */
    webhookUrl?: string;
  };
}

/**
 * Create template request.
 *
 * Saves a template configuration for reuse.
 */
export interface CreateTemplateRequest {
  /** Template name */
  name: string;

  /** Optional description */
  description?: string;

  /** Visual style */
  style: InfographicStyle;

  /** Color palette */
  palette: ColorPalette;

  /** Image resolution */
  size: ImageSize;

  /** Image aspect ratio */
  aspectRatio: AspectRatio;

  /** Optional tags for categorization */
  tags?: string[];

  /** Whether this template should be public (default: false) */
  public?: boolean;
}

/**
 * Update template request.
 *
 * Updates an existing template. All fields are optional.
 */
export interface UpdateTemplateRequest {
  /** New template name */
  name?: string;

  /** New description */
  description?: string;

  /** New visual style */
  style?: InfographicStyle;

  /** New color palette */
  palette?: ColorPalette;

  /** New image resolution */
  size?: ImageSize;

  /** New image aspect ratio */
  aspectRatio?: AspectRatio;

  /** New tags */
  tags?: string[];

  /** New public status */
  public?: boolean;
}

/**
 * List templates request.
 *
 * Query parameters for listing templates.
 */
export interface ListTemplatesRequest {
  /** Pagination parameters */
  pagination?: PaginationParams;

  /** Filters */
  filters?: {
    /** Filter by style */
    style?: InfographicStyle;

    /** Filter by palette */
    palette?: ColorPalette;

    /** Filter by tags (any match) */
    tags?: string[];

    /** Filter by creator (user ID) */
    creator?: string;

    /** Filter by public status */
    public?: boolean;
  };

  /** Sort options */
  sort?: SortParams<'createdAt' | 'updatedAt' | 'name' | 'usageCount'>;
}

/**
 * List history request.
 *
 * Query parameters for listing generation history.
 */
export interface ListHistoryRequest {
  /** Pagination parameters */
  pagination?: PaginationParams;

  /** Filters */
  filters?: {
    /** Filter by date range */
    dateRange?: DateRangeFilter;

    /** Filter by style */
    style?: InfographicStyle;

    /** Filter by palette */
    palette?: ColorPalette;

    /** Filter by job status */
    status?: 'completed' | 'failed';

    /** Search in topic text */
    search?: string;
  };

  /** Sort options */
  sort?: SortParams<'timestamp' | 'topic'>;
}

/**
 * List jobs request.
 *
 * Query parameters for listing generation jobs.
 */
export interface ListJobsRequest {
  /** Pagination parameters */
  pagination?: PaginationParams;

  /** Filters */
  filters?: {
    /** Filter by job status */
    status?: 'pending' | 'analyzing' | 'generating' | 'completed' | 'failed' | 'cancelled';

    /** Filter by date range */
    dateRange?: DateRangeFilter;
  };

  /** Sort options */
  sort?: SortParams<'createdAt' | 'startedAt' | 'completedAt'>;
}

/**
 * List batches request.
 *
 * Query parameters for listing batch jobs.
 */
export interface ListBatchesRequest {
  /** Pagination parameters */
  pagination?: PaginationParams;

  /** Filters */
  filters?: {
    /** Filter by batch status */
    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'paused';

    /** Filter by date range */
    dateRange?: DateRangeFilter;
  };

  /** Sort options */
  sort?: SortParams<'createdAt' | 'startedAt' | 'completedAt' | 'name'>;
}

/**
 * Register webhook request.
 *
 * Registers a new webhook endpoint.
 */
export interface RegisterWebhookRequest {
  /** Webhook endpoint URL (must be HTTPS) */
  url: string;

  /** Events to subscribe to */
  events: WebhookEvent[];

  /** Optional secret for HMAC signature verification */
  secret?: string;

  /** Whether the webhook should be active immediately (default: true) */
  active?: boolean;

  /** Optional custom headers to include in webhook requests */
  headers?: Record<string, string>;
}

/**
 * Update webhook request.
 *
 * Updates an existing webhook configuration.
 */
export interface UpdateWebhookRequest {
  /** New webhook URL */
  url?: string;

  /** New event subscriptions */
  events?: WebhookEvent[];

  /** New secret */
  secret?: string;

  /** New active status */
  active?: boolean;

  /** New custom headers */
  headers?: Record<string, string>;
}

/**
 * Retry batch items request.
 *
 * Retries failed items in a batch.
 */
export interface RetryBatchItemsRequest {
  /** Optional: specific item IDs to retry. If not provided, retries all failed items. */
  itemIds?: string[];
}

/**
 * Cancel batch request.
 *
 * Cancels a running batch job.
 */
export interface CancelBatchRequest {
  /** Reason for cancellation (optional) */
  reason?: string;
}
