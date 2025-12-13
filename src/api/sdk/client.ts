/**
 * InfoGraphix AI SDK Client Interface
 *
 * Defines the interface for the official TypeScript/JavaScript SDK.
 * This interface will be implemented by both the production client
 * and the mock client for testing.
 *
 * @module api/sdk/client
 */

import type { SavedVersion } from '../../types';
import type {
  GenerateInfographicRequest,
  BatchGenerateRequest,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  ListTemplatesRequest,
  ListHistoryRequest,
  ListJobsRequest,
  ListBatchesRequest,
  RegisterWebhookRequest,
  UpdateWebhookRequest,
  RetryBatchItemsRequest,
} from '../types/requests';
import type {
  GenerationResponse,
  JobStatusResponse,
  JobResultResponse,
  BatchResponse,
  BatchStatusResponse,
  BatchResultsResponse,
  TemplateResponse,
  TemplatesListResponse,
  WebhookResponse,
  WebhooksListResponse,
  TestWebhookResponse,
  UserAccountResponse,
  UsageStatsResponse,
  UserQuotasResponse,
  StylesListResponse,
  PalettesListResponse,
  DeleteResponse,
  CancelResponse,
} from '../types/responses';
import type { PaginatedResponse } from '../types/common';
import type { ClientOptions } from './options';

/**
 * Generation API namespace.
 *
 * Methods for creating and managing infographic generations.
 */
export interface GenerationApi {
  /**
   * Create a new infographic generation.
   *
   * @param request - Generation request
   * @returns Generation response with job details
   */
  create(request: GenerateInfographicRequest): Promise<GenerationResponse>;

  /**
   * Get the status of a generation job.
   *
   * @param jobId - Job identifier
   * @returns Job status response
   */
  getStatus(jobId: string): Promise<JobStatusResponse>;

  /**
   * Get the result of a completed generation.
   *
   * @param jobId - Job identifier
   * @returns Job result with generated infographic
   * @throws Error if job is not completed
   */
  getResult(jobId: string): Promise<JobResultResponse>;

  /**
   * Cancel a pending or running generation.
   *
   * @param jobId - Job identifier
   * @returns Cancel confirmation
   */
  cancel(jobId: string): Promise<CancelResponse>;

  /**
   * List generation jobs.
   *
   * @param request - List request with filters and pagination
   * @returns Paginated list of jobs
   */
  list(request?: ListJobsRequest): Promise<PaginatedResponse<JobStatusResponse>>;

  /**
   * Wait for a generation to complete.
   *
   * Polls the job status until it completes or fails.
   *
   * @param jobId - Job identifier
   * @param pollInterval - Polling interval in milliseconds (default: 2000)
   * @param maxAttempts - Maximum polling attempts (default: 30)
   * @returns Job result when completed
   * @throws Error if job fails or max attempts exceeded
   */
  waitForCompletion(
    jobId: string,
    pollInterval?: number,
    maxAttempts?: number
  ): Promise<JobResultResponse>;
}

/**
 * Batch API namespace.
 *
 * Methods for batch generation operations.
 */
export interface BatchApi {
  /**
   * Create a batch generation job.
   *
   * @param request - Batch generation request
   * @returns Batch response with job details
   */
  create(request: BatchGenerateRequest): Promise<BatchResponse>;

  /**
   * Get the status of a batch job.
   *
   * @param batchId - Batch identifier
   * @returns Batch status response
   */
  getStatus(batchId: string): Promise<BatchStatusResponse>;

  /**
   * Get all results from a batch.
   *
   * @param batchId - Batch identifier
   * @returns Batch results response
   */
  getResults(batchId: string): Promise<BatchResultsResponse>;

  /**
   * Cancel a running batch.
   *
   * @param batchId - Batch identifier
   * @returns Cancel confirmation
   */
  cancel(batchId: string): Promise<CancelResponse>;

  /**
   * Retry failed items in a batch.
   *
   * @param batchId - Batch identifier
   * @param request - Optional request to specify which items to retry
   * @returns New batch response
   */
  retry(batchId: string, request?: RetryBatchItemsRequest): Promise<BatchResponse>;

  /**
   * List batch jobs.
   *
   * @param request - List request with filters and pagination
   * @returns Paginated list of batches
   */
  list(request?: ListBatchesRequest): Promise<PaginatedResponse<BatchStatusResponse>>;

  /**
   * Wait for a batch to complete.
   *
   * Polls the batch status until all items complete.
   *
   * @param batchId - Batch identifier
   * @param pollInterval - Polling interval in milliseconds (default: 3000)
   * @param maxAttempts - Maximum polling attempts (default: 100)
   * @returns Batch results when completed
   * @throws Error if batch fails or max attempts exceeded
   */
  waitForCompletion(
    batchId: string,
    pollInterval?: number,
    maxAttempts?: number
  ): Promise<BatchResultsResponse>;
}

/**
 * Templates API namespace.
 *
 * Methods for managing style templates.
 */
export interface TemplatesApi {
  /**
   * List available templates.
   *
   * @param request - List request with filters and pagination
   * @returns Paginated list of templates
   */
  list(request?: ListTemplatesRequest): Promise<TemplatesListResponse>;

  /**
   * Get a specific template.
   *
   * @param templateId - Template identifier
   * @returns Template response
   */
  get(templateId: string): Promise<TemplateResponse>;

  /**
   * Create a new template.
   *
   * @param request - Template creation request
   * @returns Created template
   */
  create(request: CreateTemplateRequest): Promise<TemplateResponse>;

  /**
   * Update an existing template.
   *
   * @param templateId - Template identifier
   * @param request - Template update request
   * @returns Updated template
   */
  update(templateId: string, request: UpdateTemplateRequest): Promise<TemplateResponse>;

  /**
   * Delete a template.
   *
   * @param templateId - Template identifier
   * @returns Delete confirmation
   */
  delete(templateId: string): Promise<DeleteResponse>;
}

/**
 * History API namespace.
 *
 * Methods for managing generation history.
 */
export interface HistoryApi {
  /**
   * List generation history.
   *
   * @param request - List request with filters and pagination
   * @returns Paginated list of saved generations
   */
  list(request?: ListHistoryRequest): Promise<PaginatedResponse<SavedVersion>>;

  /**
   * Get a specific history item.
   *
   * @param historyId - History item identifier
   * @returns Saved generation
   */
  get(historyId: string): Promise<SavedVersion>;

  /**
   * Delete a history item.
   *
   * @param historyId - History item identifier
   * @returns Delete confirmation
   */
  delete(historyId: string): Promise<DeleteResponse>;
}

/**
 * Account API namespace.
 *
 * Methods for account management and usage tracking.
 */
export interface AccountApi {
  /**
   * Get account information.
   *
   * @returns User account details
   */
  getInfo(): Promise<UserAccountResponse>;

  /**
   * Get usage statistics.
   *
   * @returns Usage stats
   */
  getUsage(): Promise<UsageStatsResponse>;

  /**
   * Get quota information.
   *
   * @returns Current quota status
   */
  getQuota(): Promise<UserQuotasResponse>;
}

/**
 * Webhooks API namespace.
 *
 * Methods for webhook management.
 */
export interface WebhooksApi {
  /**
   * Register a new webhook.
   *
   * @param request - Webhook registration request
   * @returns Created webhook
   */
  register(request: RegisterWebhookRequest): Promise<WebhookResponse>;

  /**
   * List registered webhooks.
   *
   * @returns List of webhooks
   */
  list(): Promise<WebhooksListResponse>;

  /**
   * Get a specific webhook.
   *
   * @param webhookId - Webhook identifier
   * @returns Webhook details
   */
  get(webhookId: string): Promise<WebhookResponse>;

  /**
   * Update a webhook.
   *
   * @param webhookId - Webhook identifier
   * @param request - Webhook update request
   * @returns Updated webhook
   */
  update(webhookId: string, request: UpdateWebhookRequest): Promise<WebhookResponse>;

  /**
   * Delete a webhook.
   *
   * @param webhookId - Webhook identifier
   * @returns Delete confirmation
   */
  delete(webhookId: string): Promise<DeleteResponse>;

  /**
   * Test a webhook endpoint.
   *
   * Sends a test payload to verify the webhook is working.
   *
   * @param webhookId - Webhook identifier
   * @returns Test result
   */
  test(webhookId: string): Promise<TestWebhookResponse>;
}

/**
 * Catalog API namespace.
 *
 * Methods for retrieving available styles and palettes.
 */
export interface CatalogApi {
  /**
   * List available infographic styles.
   *
   * @returns List of styles with metadata
   */
  listStyles(): Promise<StylesListResponse>;

  /**
   * List available color palettes.
   *
   * @returns List of palettes with metadata
   */
  listPalettes(): Promise<PalettesListResponse>;
}

/**
 * InfoGraphix AI SDK Client.
 *
 * Main client interface for the InfoGraphix AI API.
 */
export interface InfoGraphixClient {
  /**
   * Configure the client with new options.
   *
   * @param options - New client options (merged with existing)
   */
  configure(options: Partial<ClientOptions>): void;

  /**
   * Get current client configuration.
   *
   * @returns Current options
   */
  getConfig(): Required<ClientOptions>;

  /**
   * Generation API methods.
   */
  readonly generate: GenerationApi;

  /**
   * Batch API methods.
   */
  readonly batch: BatchApi;

  /**
   * Templates API methods.
   */
  readonly templates: TemplatesApi;

  /**
   * History API methods.
   */
  readonly history: HistoryApi;

  /**
   * Account API methods.
   */
  readonly account: AccountApi;

  /**
   * Webhooks API methods.
   */
  readonly webhooks: WebhooksApi;

  /**
   * Catalog API methods (styles and palettes).
   */
  readonly catalog: CatalogApi;
}
