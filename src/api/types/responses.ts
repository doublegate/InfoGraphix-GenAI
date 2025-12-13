/**
 * Response types for the InfoGraphix AI API.
 *
 * Defines the shape of all API response payloads.
 *
 * @module api/types/responses
 */

import type { GeneratedInfographic, InfographicStyle, ColorPalette } from '../../types';
import type { ResponseMeta, PaginatedResponse } from './common';
import type { ApiError } from './errors';
import type {
  GenerationJob,
  BatchJob,
  Webhook,
  User,
  UserQuotas,
  UsageStats,
  Template,
} from './models';

/**
 * Standard API response wrapper.
 *
 * All API responses follow this structure for consistency.
 *
 * @template T - The type of the response data
 */
export interface ApiResponse<T> {
  /** Whether the request was successful */
  success: boolean;

  /** Response data (present when success is true) */
  data?: T;

  /** Error information (present when success is false) */
  error?: ApiError;

  /** Response metadata */
  meta?: ResponseMeta;
}

/**
 * Generation response.
 *
 * Returned when creating a new generation job.
 */
export interface GenerationResponse {
  /** The created generation job */
  job: GenerationJob;

  /** Estimated completion time in seconds */
  estimatedTime?: number;
}

/**
 * Job status response.
 *
 * Returned when querying job status.
 */
export interface JobStatusResponse {
  /** The generation job */
  job: GenerationJob;
}

/**
 * Job result response.
 *
 * Returned when retrieving a completed job's result.
 */
export interface JobResultResponse {
  /** The generated infographic */
  result: GeneratedInfographic;

  /** Download URL for the image (expires after 24 hours) */
  downloadUrl?: string;
}

/**
 * Batch response.
 *
 * Returned when creating a batch job.
 */
export interface BatchResponse {
  /** The created batch job */
  batch: BatchJob;

  /** Estimated total completion time in seconds */
  estimatedTime?: number;
}

/**
 * Batch status response.
 *
 * Returned when querying batch status.
 */
export interface BatchStatusResponse {
  /** The batch job */
  batch: BatchJob;
}

/**
 * Batch results response.
 *
 * Returned when retrieving all batch results.
 */
export interface BatchResultsResponse {
  /** The batch job */
  batch: BatchJob;

  /** Individual results for each item */
  results: Array<{
    /** Item ID */
    itemId: string;
    /** Item status */
    status: 'completed' | 'failed' | 'pending' | 'processing';
    /** Generated result (if completed) */
    result?: GeneratedInfographic;
    /** Error message (if failed) */
    error?: string;
  }>;
}

/**
 * Template response.
 *
 * Returned when creating or retrieving a template.
 */
export interface TemplateResponse {
  /** The template */
  template: Template;
}

/**
 * Templates list response.
 *
 * Returned when listing templates.
 */
export interface TemplatesListResponse extends PaginatedResponse<Template> {
  /** Additional metadata about the templates */
  meta?: {
    /** Total number of public templates */
    publicCount?: number;
    /** Total number of user's private templates */
    privateCount?: number;
  };
}

/**
 * Webhook response.
 *
 * Returned when creating or retrieving a webhook.
 */
export interface WebhookResponse {
  /** The webhook */
  webhook: Webhook;
}

/**
 * Webhooks list response.
 *
 * Returned when listing webhooks.
 */
export interface WebhooksListResponse {
  /** Array of webhooks */
  webhooks: Webhook[];
}

/**
 * Test webhook response.
 *
 * Returned when testing a webhook endpoint.
 */
export interface TestWebhookResponse {
  /** Whether the test was successful */
  success: boolean;
  /** HTTP status code from the webhook endpoint */
  statusCode?: number;
  /** Response time in milliseconds */
  responseTime?: number;
  /** Error message if test failed */
  error?: string;
}

/**
 * User account response.
 *
 * Returned when retrieving account information.
 */
export interface UserAccountResponse {
  /** The user account */
  user: User;
}

/**
 * Usage statistics response.
 *
 * Returned when retrieving usage statistics.
 */
export interface UsageStatsResponse {
  /** Usage statistics */
  stats: UsageStats;
}

/**
 * User quotas response.
 *
 * Returned when retrieving quota information.
 */
export interface UserQuotasResponse {
  /** Quota information */
  quotas: UserQuotas;
}

/**
 * Styles list response.
 *
 * Returned when listing available styles.
 */
export interface StylesListResponse {
  /** Available infographic styles */
  styles: Array<{
    /** Style value */
    value: InfographicStyle;
    /** Style display name */
    name: string;
    /** Style description */
    description: string;
    /** Preview image URL */
    previewUrl?: string;
  }>;
}

/**
 * Palettes list response.
 *
 * Returned when listing available color palettes.
 */
export interface PalettesListResponse {
  /** Available color palettes */
  palettes: Array<{
    /** Palette value */
    value: ColorPalette;
    /** Palette display name */
    name: string;
    /** Palette description */
    description: string;
    /** Array of hex color codes */
    colors?: string[];
    /** Preview image URL */
    previewUrl?: string;
  }>;
}

/**
 * Delete response.
 *
 * Returned when successfully deleting a resource.
 */
export interface DeleteResponse {
  /** Confirmation message */
  message: string;
  /** ID of the deleted resource */
  deletedId: string;
}

/**
 * Cancel response.
 *
 * Returned when successfully cancelling a job.
 */
export interface CancelResponse {
  /** Confirmation message */
  message: string;
  /** ID of the cancelled job */
  jobId: string;
}

/**
 * Health check response.
 *
 * Returned by the health check endpoint.
 */
export interface HealthCheckResponse {
  /** Overall service status */
  status: 'ok' | 'degraded' | 'down';
  /** API version */
  version: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Individual service statuses */
  services?: {
    /** Database status */
    database?: 'ok' | 'degraded' | 'down';
    /** Gemini API status */
    gemini?: 'ok' | 'degraded' | 'down';
    /** Queue status */
    queue?: 'ok' | 'degraded' | 'down';
  };
}

/**
 * Create typed API response helper.
 *
 * @template T - Type of the response data
 * @param data - Response data
 * @param meta - Optional response metadata
 * @returns Typed API response
 */
export function createSuccessResponse<T>(data: T, meta?: ResponseMeta): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: meta || {
      version: '2.2.0',
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Create typed API error response helper.
 *
 * @param error - API error
 * @param meta - Optional response metadata
 * @returns Typed API error response
 */
export function createErrorResponse(error: ApiError, meta?: ResponseMeta): ApiResponse<never> {
  return {
    success: false,
    error,
    meta: meta || {
      version: '2.2.0',
      timestamp: new Date().toISOString(),
    },
  };
}
