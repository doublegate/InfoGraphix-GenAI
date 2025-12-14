/**
 * InfoGraphix API Service
 *
 * Wraps the InfoGraphix AI SDK client to provide a simplified interface
 * for the application. This service will use either the MockInfoGraphixClient
 * for development/testing or the production client when the backend is available.
 *
 * @module services/infographixService
 * @since v2.2.0-foundation
 */

import type { InfoGraphixClient } from '../api/sdk/client';
import { MockInfoGraphixClient, type MockClientOptions } from '../api/mock/mockClient';
import type { GenerateInfographicRequest } from '../api/types/requests';
import type { GenerationJob, Template } from '../api/types/models';
import { JobStatus } from '../api/types/models';
import type {
  AnalysisResult,
  GeneratedInfographic,
  InfographicStyle,
  ColorPalette,
  ImageSize,
  AspectRatio,
  GithubFilters,
  SavedVersion,
} from '../types';
import { log } from '../utils/logger';

/**
 * Configuration options for the InfoGraphix service.
 */
export interface InfoGraphixServiceOptions {
  /** API key for authentication */
  apiKey: string;
  /** Base URL for the API (default: mock client) */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Mock-specific options for development */
  mockOptions?: {
    /** Simulated analysis delay (ms) */
    analysisDelay?: number;
    /** Simulated generation delay (ms) */
    generationDelay?: number;
    /** Error simulation rate (0-1) */
    errorRate?: number;
  };
}

/**
 * Unified generation request matching the app's interface.
 */
export interface UnifiedGenerationRequest {
  topic: string;
  size: ImageSize;
  aspectRatio: AspectRatio;
  style: InfographicStyle;
  palette: ColorPalette;
  filters?: GithubFilters;
  fileContent?: string;
}

/**
 * Generation result with status tracking.
 */
export interface GenerationResult {
  /** Job ID for tracking */
  jobId: string;
  /** Current job status */
  status: 'pending' | 'analyzing' | 'generating' | 'completed' | 'failed' | 'cancelled';
  /** Generated infographic (when completed) */
  result?: GeneratedInfographic;
  /** Error message (if failed) */
  error?: string;
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining?: number;
}

/**
 * InfoGraphix API Service class.
 *
 * Provides a unified interface for infographic generation that works
 * with both the mock client (development) and production API.
 */
export class InfoGraphixService {
  private client: InfoGraphixClient;
  private options: InfoGraphixServiceOptions;

  constructor(options: InfoGraphixServiceOptions) {
    this.options = options;

    // For now, always use the mock client
    // When the backend is available, we'll add a production client
    const mockOptions: MockClientOptions = {
      apiKey: options.apiKey,
      baseUrl: options.baseUrl || 'https://api.infographix.ai/v1',
      timeout: options.timeout || 30000,
      retry: { maxRetries: 3 },
      logger: options.debug
        ? (level, message, data) => {
            log[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'info'](
              `[InfoGraphix] ${message}`,
              data
            );
          }
        : undefined,
      mockAnalysisDelay: options.mockOptions?.analysisDelay ?? 2000,
      mockGenerationDelay: options.mockOptions?.generationDelay ?? 3000,
      mockErrorRate: options.mockOptions?.errorRate ?? 0,
    };

    this.client = new MockInfoGraphixClient(mockOptions);
    log.info('InfoGraphix service initialized', { mode: 'mock' });
  }

  /**
   * Create a new infographic generation job.
   *
   * @param request - Generation request parameters
   * @returns Job ID and initial status
   */
  async createGeneration(request: UnifiedGenerationRequest): Promise<GenerationResult> {
    log.info('Creating infographic generation', { topic: request.topic });

    const apiRequest: GenerateInfographicRequest = {
      topic: request.topic,
      size: request.size,
      aspectRatio: request.aspectRatio,
      style: request.style,
      palette: request.palette,
      filters: request.filters,
      fileContent: request.fileContent,
    };

    const response = await this.client.generate.create(apiRequest);

    return {
      jobId: response.job.id,
      status: this.mapJobStatus(response.job.status),
      estimatedTimeRemaining: response.estimatedTime,
    };
  }

  /**
   * Get the current status of a generation job.
   *
   * @param jobId - Job identifier
   * @returns Current job status and result if completed
   */
  async getGenerationStatus(jobId: string): Promise<GenerationResult> {
    const response = await this.client.generate.getStatus(jobId);
    return this.mapJobToResult(response.job);
  }

  /**
   * Wait for a generation to complete.
   *
   * Polls the job status until completion or failure.
   *
   * @param jobId - Job identifier
   * @param onProgress - Optional callback for progress updates
   * @returns Final generation result
   */
  async waitForGeneration(
    jobId: string,
    onProgress?: (status: GenerationResult) => void
  ): Promise<GenerationResult> {
    const pollInterval = 1000;
    const maxAttempts = 60;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getGenerationStatus(jobId);

      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled') {
        return status;
      }

      await this.delay(pollInterval);
    }

    throw new Error('Generation timeout: max polling attempts exceeded');
  }

  /**
   * Cancel a pending or running generation.
   *
   * @param jobId - Job identifier
   */
  async cancelGeneration(jobId: string): Promise<void> {
    await this.client.generate.cancel(jobId);
    log.info('Generation cancelled', { jobId });
  }

  /**
   * Get generation history.
   *
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 20)
   * @returns Paginated list of saved generations
   */
  async getHistory(page = 1, pageSize = 20): Promise<{
    items: SavedVersion[];
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const response = await this.client.history.list({
      pagination: { page, pageSize },
    });

    return {
      items: response.data,
      totalItems: response.pagination.totalItems,
      totalPages: response.pagination.totalPages,
      hasNext: response.pagination.hasNext,
      hasPrevious: response.pagination.hasPrevious,
    };
  }

  /**
   * Delete a history item.
   *
   * @param historyId - History item identifier
   */
  async deleteHistoryItem(historyId: string): Promise<void> {
    await this.client.history.delete(historyId);
    log.info('History item deleted', { historyId });
  }

  /**
   * Get available templates.
   *
   * @returns List of templates
   */
  async getTemplates(): Promise<Template[]> {
    const response = await this.client.templates.list();
    return response.data;
  }

  /**
   * Get account quota information.
   *
   * @returns Current quota status
   */
  async getQuota(): Promise<{
    tier: string;
    requestsRemaining: number;
    generationsRemaining: number;
    resetAt: string;
  }> {
    const response = await this.client.account.getQuota();
    return {
      tier: response.quotas.tier,
      requestsRemaining: response.quotas.requestsPerMinute.remaining,
      generationsRemaining:
        response.quotas.generationsPerDay.limit === -1
          ? Infinity
          : response.quotas.generationsPerDay.limit - response.quotas.generationsPerDay.used,
      resetAt: response.quotas.generationsPerDay.resetAt,
    };
  }

  /**
   * Get available styles from the catalog.
   *
   * @returns List of available styles
   */
  async getAvailableStyles(): Promise<Array<{
    value: InfographicStyle;
    name: string;
    description: string;
  }>> {
    const response = await this.client.catalog.listStyles();
    return response.styles;
  }

  /**
   * Get available palettes from the catalog.
   *
   * @returns List of available palettes
   */
  async getAvailablePalettes(): Promise<Array<{
    value: ColorPalette;
    name: string;
    description: string;
    colors?: string[];
  }>> {
    const response = await this.client.catalog.listPalettes();
    return response.palettes;
  }

  // Private helper methods

  private mapJobStatus(status: JobStatus): GenerationResult['status'] {
    const statusMap: Record<JobStatus, GenerationResult['status']> = {
      [JobStatus.PENDING]: 'pending',
      [JobStatus.ANALYZING]: 'analyzing',
      [JobStatus.GENERATING]: 'generating',
      [JobStatus.COMPLETED]: 'completed',
      [JobStatus.FAILED]: 'failed',
      [JobStatus.CANCELLED]: 'cancelled',
    };
    return statusMap[status] || 'pending';
  }

  private mapJobToResult(job: GenerationJob): GenerationResult {
    const result: GenerationResult = {
      jobId: job.id,
      status: this.mapJobStatus(job.status),
    };

    if (job.result) {
      result.result = {
        imageUrl: job.result.imageUrl,
        analysis: job.result.analysis as AnalysisResult,
      };
    }

    if (job.error) {
      result.error = job.error.message;
    }

    return result;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance for convenience
let serviceInstance: InfoGraphixService | null = null;

/**
 * Get or create the InfoGraphix service instance.
 *
 * @param options - Service options (required for first call)
 * @returns Service instance
 */
export function getInfoGraphixService(options?: InfoGraphixServiceOptions): InfoGraphixService {
  if (!serviceInstance && !options) {
    throw new Error('InfoGraphix service not initialized. Provide options on first call.');
  }

  if (options) {
    serviceInstance = new InfoGraphixService(options);
  }

  return serviceInstance!;
}

/**
 * Reset the service instance (useful for testing).
 */
export function resetInfoGraphixService(): void {
  serviceInstance = null;
}
