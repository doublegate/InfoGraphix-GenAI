/**
 * Data models for the InfoGraphix AI API.
 *
 * Core domain models including User, Job, Webhook, and related entities.
 *
 * @module api/types/models
 */

import type {
  InfographicRequest,
  GeneratedInfographic,
  TemplateConfig,
  BatchItem,
} from '../../types';
import type { ApiErrorCode } from './errors';

/**
 * User subscription tier.
 *
 * Determines rate limits, quotas, and feature access.
 */
export enum UserTier {
  /** Free tier with basic limits */
  FREE = 'free',
  /** Pro tier with increased limits */
  PRO = 'pro',
  /** Enterprise tier with custom limits */
  ENTERPRISE = 'enterprise',
}

/**
 * User account model.
 *
 * Represents an authenticated API user.
 */
export interface User {
  /** Unique user identifier (UUID) */
  id: string;
  /** User email address */
  email: string;
  /** API key for authentication (hashed in database) */
  apiKey: string;
  /** Subscription tier */
  tier: UserTier;
  /** Current quota status */
  quotas: UserQuotas;
  /** ISO 8601 timestamp of account creation */
  createdAt: string;
  /** ISO 8601 timestamp of last account update */
  updatedAt: string;
  /** ISO 8601 timestamp of last API activity */
  lastActiveAt?: string;
  /** Whether the account is active */
  active: boolean;
}

/**
 * User quota and rate limit information.
 *
 * Tracks current usage against tier limits.
 */
export interface UserQuotas {
  /** User's subscription tier */
  tier: UserTier;

  /** Rate limit tracking (requests per minute) */
  requestsPerMinute: {
    /** Maximum requests allowed per minute */
    limit: number;
    /** Remaining requests in current window */
    remaining: number;
    /** ISO 8601 timestamp when the window resets */
    resetAt: string;
  };

  /** Daily generation quota */
  generationsPerDay: {
    /** Maximum generations per day (-1 for unlimited) */
    limit: number;
    /** Generations used in current day */
    used: number;
    /** ISO 8601 timestamp when the quota resets */
    resetAt: string;
  };

  /** Maximum batch size allowed for this tier */
  maxBatchSize: number;

  /** Storage quota (optional, for future use) */
  storageMB?: {
    /** Storage limit in megabytes */
    limit: number;
    /** Storage currently used in megabytes */
    used: number;
  };
}

/**
 * Usage statistics for a user account.
 *
 * Provides insights into API usage patterns.
 */
export interface UsageStats {
  /** Statistics for the current billing period */
  currentPeriod: {
    /** Period start date (ISO 8601) */
    startDate: string;
    /** Period end date (ISO 8601) */
    endDate: string;
    /** Total generations in this period */
    totalGenerations: number;
    /** Total API requests in this period */
    totalRequests: number;
  };

  /** All-time statistics */
  allTime: {
    /** Total generations since account creation */
    totalGenerations: number;
    /** Total API requests since account creation */
    totalRequests: number;
    /** Account age in days */
    accountAge: number;
  };

  /** Recent activity breakdown */
  recentActivity: {
    /** Generations in last 24 hours */
    last24Hours: number;
    /** Generations in last 7 days */
    last7Days: number;
    /** Generations in last 30 days */
    last30Days: number;
  };
}

/**
 * Job status enumeration.
 *
 * Tracks the lifecycle of an infographic generation job.
 */
export enum JobStatus {
  /** Job is queued, waiting to start */
  PENDING = 'pending',
  /** Job is in the analysis phase */
  ANALYZING = 'analyzing',
  /** Job is in the image generation phase */
  GENERATING = 'generating',
  /** Job completed successfully */
  COMPLETED = 'completed',
  /** Job failed with an error */
  FAILED = 'failed',
  /** Job was cancelled by user */
  CANCELLED = 'cancelled',
}

/**
 * Generation job model.
 *
 * Represents an asynchronous infographic generation request.
 */
export interface GenerationJob {
  /** Unique job identifier (UUID) */
  id: string;
  /** Current job status */
  status: JobStatus;

  /** Original generation request */
  request: InfographicRequest;

  /** Progress information (when processing) */
  progress?: {
    /** Current processing step */
    currentStep: 'analyzing' | 'generating';
    /** Completion percentage (0-100) */
    percentage: number;
    /** Optional progress message */
    message?: string;
  };

  /** Generation result (when completed) */
  result?: GeneratedInfographic;

  /** Error information (if failed) */
  error?: {
    /** Error code */
    code: ApiErrorCode;
    /** Error message */
    message: string;
    /** Additional error details */
    details?: Record<string, unknown>;
  };

  /** ISO 8601 timestamp of job creation */
  createdAt: string;
  /** ISO 8601 timestamp when processing started */
  startedAt?: string;
  /** ISO 8601 timestamp when job completed or failed */
  completedAt?: string;

  /** User ID who created this job */
  userId: string;
  /** Estimated completion time (ISO 8601) */
  estimatedCompletionTime?: string;
  /** Number of retry attempts */
  retryCount?: number;
}

/**
 * Batch job status enumeration.
 */
export enum BatchJobStatus {
  /** Batch is queued */
  PENDING = 'pending',
  /** Batch is being processed */
  PROCESSING = 'processing',
  /** All items completed */
  COMPLETED = 'completed',
  /** Batch failed */
  FAILED = 'failed',
  /** Batch was cancelled */
  CANCELLED = 'cancelled',
  /** Batch is paused */
  PAUSED = 'paused',
}

/**
 * Batch generation job model.
 *
 * Represents a batch of infographic generation requests.
 */
export interface BatchJob {
  /** Unique batch identifier (UUID) */
  id: string;
  /** User-defined batch name */
  name: string;
  /** Current batch status */
  status: BatchJobStatus;

  /** Items in the batch */
  items: BatchItem[];

  /** Progress summary */
  progress: {
    /** Total number of items */
    total: number;
    /** Number of completed items */
    completed: number;
    /** Number of failed items */
    failed: number;
    /** Number of pending items */
    pending: number;
    /** Number of currently processing items */
    processing: number;
  };

  /** Batch configuration */
  config: {
    /** Delay between processing items (milliseconds) */
    delayBetweenItems: number;
    /** Stop processing on first error */
    stopOnError: boolean;
    /** Optional webhook URL for progress notifications */
    webhookUrl?: string;
  };

  /** ISO 8601 timestamp of batch creation */
  createdAt: string;
  /** ISO 8601 timestamp when processing started */
  startedAt?: string;
  /** ISO 8601 timestamp when batch completed */
  completedAt?: string;

  /** User ID who created this batch */
  userId: string;
}

/**
 * Webhook event types.
 *
 * Events that can trigger webhook notifications.
 */
export enum WebhookEvent {
  /** Generation job started */
  GENERATION_STARTED = 'generation.started',
  /** Analysis phase started */
  GENERATION_ANALYZING = 'generation.analyzing',
  /** Image generation phase started */
  GENERATION_GENERATING = 'generation.generating',
  /** Generation completed successfully */
  GENERATION_COMPLETED = 'generation.completed',
  /** Generation failed */
  GENERATION_FAILED = 'generation.failed',

  /** Batch job started */
  BATCH_STARTED = 'batch.started',
  /** Batch progress update */
  BATCH_PROGRESS = 'batch.progress',
  /** Batch completed */
  BATCH_COMPLETED = 'batch.completed',
  /** Batch failed */
  BATCH_FAILED = 'batch.failed',

  /** Approaching quota limit */
  QUOTA_WARNING = 'quota.warning',
  /** Quota exceeded */
  QUOTA_EXCEEDED = 'quota.exceeded',
}

/**
 * Webhook configuration.
 *
 * Defines how and when to send webhook notifications.
 */
export interface WebhookConfig {
  /** Webhook endpoint URL (HTTPS required) */
  url: string;
  /** Events to subscribe to */
  events: WebhookEvent[];
  /** Optional secret for HMAC signature verification */
  secret?: string;
  /** Whether the webhook is active */
  active?: boolean;
  /** Custom headers to include in webhook requests */
  headers?: Record<string, string>;
}

/**
 * Webhook model.
 *
 * Represents a registered webhook endpoint.
 */
export interface Webhook extends WebhookConfig {
  /** Unique webhook identifier (UUID) */
  id: string;
  /** ISO 8601 timestamp of webhook creation */
  createdAt: string;
  /** ISO 8601 timestamp of last webhook update */
  updatedAt: string;
  /** ISO 8601 timestamp of last successful delivery */
  lastTriggeredAt?: string;
  /** User ID who owns this webhook */
  userId: string;

  /** Delivery statistics */
  deliveryStats: {
    /** Total delivery attempts */
    total: number;
    /** Successful deliveries */
    successful: number;
    /** Failed deliveries */
    failed: number;
    /** Average response time in milliseconds */
    averageResponseTime?: number;
  };
}

/**
 * Webhook payload.
 *
 * Data structure sent to webhook endpoints.
 *
 * @template T - Type of the event-specific data
 */
export interface WebhookPayload<T = unknown> {
  /** Event type that triggered this webhook */
  event: WebhookEvent;
  /** ISO 8601 timestamp when the event occurred */
  timestamp: string;
  /** Event-specific data */
  data: T;
  /** Webhook ID that received this event */
  webhookId: string;
  /** HMAC-SHA256 signature for verification (if secret configured) */
  signature?: string;
  /** Delivery attempt number (for retries) */
  attemptNumber?: number;
}

/**
 * Webhook delivery log entry.
 *
 * Records the result of a webhook delivery attempt.
 */
export interface WebhookDelivery {
  /** Unique delivery identifier */
  id: string;
  /** Webhook ID */
  webhookId: string;
  /** Event that triggered the delivery */
  event: WebhookEvent;
  /** HTTP status code from the webhook endpoint */
  statusCode?: number;
  /** Response body from the webhook endpoint */
  response?: string;
  /** Error message if delivery failed */
  error?: string;
  /** ISO 8601 timestamp of delivery attempt */
  attemptedAt: string;
  /** Response time in milliseconds */
  responseTime?: number;
  /** Whether this was a retry attempt */
  isRetry: boolean;
  /** Retry attempt number */
  retryCount: number;
}

/**
 * Template model (extends the existing TemplateConfig).
 *
 * Additional API-specific fields for saved templates.
 */
export interface Template extends TemplateConfig {
  /** User ID who owns this template */
  userId: string;
  /** Whether the template is public */
  public: boolean;
  /** Number of times this template has been used */
  usageCount: number;
  /** ISO 8601 timestamp of last use */
  lastUsedAt?: string;
}
