/**
 * Mock InfoGraphix AI Client
 *
 * Simulates the InfoGraphix AI API for testing and development.
 * Provides realistic delays and responses without requiring a backend.
 *
 * @module api/mock/mockClient
 */

import type { SavedVersion } from '../../types';
import { ImageSize, AspectRatio, InfographicStyle, ColorPalette, BatchStatus } from '../../types';
import type {
  InfoGraphixClient,
  GenerationApi,
  BatchApi,
  TemplatesApi,
  HistoryApi,
  AccountApi,
  WebhooksApi,
  CatalogApi,
} from '../sdk/client';
import type { ClientOptions, LogLevel } from '../sdk/options';
import { mergeOptions, validateOptions } from '../sdk/options';
import type { GenerationJob, BatchJob, Template, Webhook, UserTier } from '../types/models';
import { JobStatus, BatchJobStatus, UserTier as Tier } from '../types/models';
import { ApiErrorCode } from '../types/errors';

/**
 * Mock-specific client options.
 */
export interface MockClientOptions extends ClientOptions {
  /** Simulated delay for analysis phase (milliseconds) */
  mockAnalysisDelay?: number;
  /** Simulated delay for generation phase (milliseconds) */
  mockGenerationDelay?: number;
  /** Simulated error rate (0-1) */
  mockErrorRate?: number;
  /** User tier for quota simulation */
  mockUserTier?: UserTier;
}

/**
 * Mock InfoGraphix AI Client.
 *
 * Implements the full InfoGraphixClient interface with simulated behavior.
 */
export class MockInfoGraphixClient implements InfoGraphixClient {
  private options: Required<ClientOptions>;
  private mockOptions: MockClientOptions;

  // In-memory storage
  private jobs: Map<string, GenerationJob> = new Map();
  private batches: Map<string, BatchJob> = new Map();
  private templatesStorage: Map<string, Template> = new Map();
  private historyItems: SavedVersion[] = [];
  private webhooksStorage: Map<string, Webhook> = new Map();

  // Rate limiting simulation
  private requestCount = 0;
  private lastReset = Date.now();

  constructor(options: MockClientOptions) {
    validateOptions(options);
    this.options = mergeOptions(options);
    this.mockOptions = {
      mockAnalysisDelay: 2000,
      mockGenerationDelay: 3000,
      mockErrorRate: 0,
      mockUserTier: Tier.FREE,
      ...options,
    };

    this.log('info', 'Mock client initialized', { tier: this.mockOptions.mockUserTier });
  }

  configure(options: Partial<ClientOptions>): void {
    this.options = mergeOptions({ ...this.options, ...options });
    this.log('info', 'Client reconfigured');
  }

  getConfig(): Required<ClientOptions> {
    return { ...this.options };
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (this.options.logger) {
      this.options.logger(level, message, data);
    }
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldSimulateError(): boolean {
    return Math.random() < (this.mockOptions.mockErrorRate || 0);
  }

  // Generation API
  public readonly generate: GenerationApi = {
    create: async (request) => {
      this.log('info', 'Creating generation', { topic: request.topic });

      const jobId = this.generateId();
      const job: GenerationJob = {
        id: jobId,
        status: JobStatus.PENDING,
        request: {
          topic: request.topic,
          size: request.size || ImageSize.Resolution_2K,
          aspectRatio: request.aspectRatio || AspectRatio.Landscape,
          style: request.style || InfographicStyle.Modern,
          palette: request.palette || ColorPalette.BlueWhite,
          filters: request.filters,
          fileContent: request.fileContent,
        },
        createdAt: new Date().toISOString(),
        userId: 'mock_user',
      };

      this.jobs.set(jobId, job);

      // Simulate async processing (intentional fire-and-forget)
      void this.simulateGeneration(jobId);

      return {
        job,
        estimatedTime: (this.mockOptions.mockAnalysisDelay! + this.mockOptions.mockGenerationDelay!) / 1000,
      };
    },

    getStatus: async (jobId) => {
      const job = this.jobs.get(jobId);
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }
      return { job };
    },

    getResult: async (jobId) => {
      const job = this.jobs.get(jobId);
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }
      if (job.status !== JobStatus.COMPLETED) {
        throw new Error(`Job not completed: ${job.status}`);
      }
      return {
        result: job.result!,
        downloadUrl: `https://api.infographix.ai/v1/generate/${jobId}/download`,
      };
    },

    cancel: async (jobId) => {
      const job = this.jobs.get(jobId);
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }
      job.status = JobStatus.CANCELLED;
      this.jobs.set(jobId, job);
      return {
        message: 'Job cancelled successfully',
        jobId,
      };
    },

    list: async (request) => {
      const jobs = Array.from(this.jobs.values());
      const pageSize = request?.pagination?.pageSize || 20;
      const page = request?.pagination?.page || 1;

      return {
        data: jobs.slice((page - 1) * pageSize, page * pageSize).map(job => ({ job })),
        pagination: {
          page,
          pageSize,
          totalPages: Math.ceil(jobs.length / pageSize),
          totalItems: jobs.length,
          hasNext: page * pageSize < jobs.length,
          hasPrevious: page > 1,
        },
      };
    },

    waitForCompletion: async (jobId, pollInterval = 2000, maxAttempts = 30) => {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const status = await this.generate.getStatus(jobId);
        if (status.job.status === JobStatus.COMPLETED) {
          return this.generate.getResult(jobId);
        }
        if (status.job.status === JobStatus.FAILED || status.job.status === JobStatus.CANCELLED) {
          throw new Error(`Job ${status.job.status.toLowerCase()}: ${status.job.error?.message}`);
        }
        await this.simulateDelay(pollInterval);
      }
      throw new Error('Max polling attempts exceeded');
    },
  };

  // Batch API
  public readonly batch: BatchApi = {
    create: async (request) => {
      const batchId = this.generateId();
      const batch: BatchJob = {
        id: batchId,
        name: request.name,
        status: BatchJobStatus.PENDING,
        items: request.items.map(item => ({
          id: this.generateId(),
          topic: item.topic,
          status: BatchStatus.Pending,
          style: item.style || 'Modern Minimalist' as InfographicStyle,
          palette: item.palette || 'Professional Blue & White' as ColorPalette,
          size: item.size || ImageSize.Resolution_2K,
          aspectRatio: item.aspectRatio || AspectRatio.Landscape,
          createdAt: Date.now(),
        })),
        progress: {
          total: request.items.length,
          completed: 0,
          failed: 0,
          pending: request.items.length,
          processing: 0,
        },
        config: {
          delayBetweenItems: request.options?.delayBetweenItems || 0,
          stopOnError: request.options?.stopOnError || false,
          webhookUrl: request.options?.webhookUrl,
        },
        createdAt: new Date().toISOString(),
        userId: 'mock_user',
      };

      this.batches.set(batchId, batch);
      return {
        batch,
        estimatedTime: (request.items.length * (this.mockOptions.mockAnalysisDelay! + this.mockOptions.mockGenerationDelay!)) / 1000,
      };
    },

    getStatus: async (batchId) => {
      const batch = this.batches.get(batchId);
      if (!batch) {
        throw new Error(`Batch not found: ${batchId}`);
      }
      return { batch };
    },

    getResults: async (batchId) => {
      const batch = this.batches.get(batchId);
      if (!batch) {
        throw new Error(`Batch not found: ${batchId}`);
      }
      return {
        batch,
        results: batch.items.map(item => ({
          itemId: item.id,
          status: item.status.toLowerCase() as 'completed' | 'failed' | 'pending' | 'processing',
          result: item.result,
          error: item.error,
        })),
      };
    },

    cancel: async (batchId) => {
      const batch = this.batches.get(batchId);
      if (!batch) {
        throw new Error(`Batch not found: ${batchId}`);
      }
      batch.status = BatchJobStatus.CANCELLED;
      this.batches.set(batchId, batch);
      return {
        message: 'Batch cancelled successfully',
        jobId: batchId,
      };
    },

    retry: async (batchId, _request) => {
      // Mock implementation - just return the batch
      const batch = this.batches.get(batchId);
      if (!batch) {
        throw new Error(`Batch not found: ${batchId}`);
      }
      return { batch };
    },

    list: async (request) => {
      const batches = Array.from(this.batches.values());
      const pageSize = request?.pagination?.pageSize || 20;
      const page = request?.pagination?.page || 1;

      return {
        data: batches.slice((page - 1) * pageSize, page * pageSize).map(batch => ({ batch })),
        pagination: {
          page,
          pageSize,
          totalPages: Math.ceil(batches.length / pageSize),
          totalItems: batches.length,
          hasNext: page * pageSize < batches.length,
          hasPrevious: page > 1,
        },
      };
    },

    waitForCompletion: async (batchId, pollInterval = 3000, maxAttempts = 100) => {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const status = await this.batch.getStatus(batchId);
        if (status.batch.status === BatchJobStatus.COMPLETED) {
          return this.batch.getResults(batchId);
        }
        if (status.batch.status === BatchJobStatus.FAILED || status.batch.status === BatchJobStatus.CANCELLED) {
          throw new Error(`Batch ${status.batch.status.toLowerCase()}`);
        }
        await this.simulateDelay(pollInterval);
      }
      throw new Error('Max polling attempts exceeded');
    },
  };

  // Templates API
  public readonly templates: TemplatesApi = {
    list: async (request) => {
      const templates = Array.from(this.templatesStorage.values());
      const pageSize = request?.pagination?.pageSize || 20;
      const page = request?.pagination?.page || 1;

      return {
        data: templates.slice((page - 1) * pageSize, page * pageSize),
        pagination: {
          page,
          pageSize,
          totalPages: Math.ceil(templates.length / pageSize),
          totalItems: templates.length,
          hasNext: page * pageSize < templates.length,
          hasPrevious: page > 1,
        },
      };
    },

    get: async (templateId) => {
      const template = this.templatesStorage.get(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
      return { template };
    },

    create: async (request) => {
      const template: Template = {
        id: this.generateId(),
        ...request,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userId: 'mock_user',
        public: request.public || false,
        usageCount: 0,
      };
      this.templatesStorage.set(template.id, template);
      return { template };
    },

    update: async (templateId, request) => {
      const template = this.templatesStorage.get(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
      const updated = { ...template, ...request, updatedAt: Date.now() };
      this.templatesStorage.set(templateId, updated);
      return { template: updated };
    },

    delete: async (templateId) => {
      if (!this.templatesStorage.has(templateId)) {
        throw new Error(`Template not found: ${templateId}`);
      }
      this.templatesStorage.delete(templateId);
      return {
        message: 'Template deleted successfully',
        deletedId: templateId,
      };
    },
  };

  // History API
  public readonly history: HistoryApi = {
    list: async (request) => {
      const pageSize = request?.pagination?.pageSize || 20;
      const page = request?.pagination?.page || 1;

      return {
        data: this.historyItems.slice((page - 1) * pageSize, page * pageSize),
        pagination: {
          page,
          pageSize,
          totalPages: Math.ceil(this.historyItems.length / pageSize),
          totalItems: this.historyItems.length,
          hasNext: page * pageSize < this.historyItems.length,
          hasPrevious: page > 1,
        },
      };
    },

    get: async (historyId) => {
      const item = this.historyItems.find(h => h.id === historyId);
      if (!item) {
        throw new Error(`History item not found: ${historyId}`);
      }
      return item;
    },

    delete: async (historyId) => {
      const index = this.historyItems.findIndex(h => h.id === historyId);
      if (index === -1) {
        throw new Error(`History item not found: ${historyId}`);
      }
      this.historyItems.splice(index, 1);
      return {
        message: 'History item deleted successfully',
        deletedId: historyId,
      };
    },
  };

  // Account API
  public readonly account: AccountApi = {
    getInfo: async () => ({
      user: {
        id: 'mock_user',
        email: 'user@example.com',
        apiKey: this.options.apiKey,
        tier: this.mockOptions.mockUserTier || Tier.FREE,
        quotas: await this.account.getQuota().then(r => r.quotas),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        active: true,
      },
    }),

    getUsage: async () => ({
      stats: {
        currentPeriod: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          totalGenerations: this.jobs.size,
          totalRequests: this.requestCount,
        },
        allTime: {
          totalGenerations: this.jobs.size,
          totalRequests: this.requestCount,
          accountAge: 30,
        },
        recentActivity: {
          last24Hours: this.jobs.size,
          last7Days: this.jobs.size,
          last30Days: this.jobs.size,
        },
      },
    }),

    getQuota: async () => {
      const tier = this.mockOptions.mockUserTier || Tier.FREE;
      const limits = {
        [Tier.FREE]: { requestsPerMinute: 10, generationsPerDay: 25, batchSize: 5 },
        [Tier.PRO]: { requestsPerMinute: 60, generationsPerDay: 500, batchSize: 50 },
        [Tier.ENTERPRISE]: { requestsPerMinute: 300, generationsPerDay: -1, batchSize: 500 },
      };

      const limit = limits[tier];

      return {
        quotas: {
          tier,
          requestsPerMinute: {
            limit: limit.requestsPerMinute,
            remaining: limit.requestsPerMinute - (this.requestCount % limit.requestsPerMinute),
            resetAt: new Date(Math.ceil(Date.now() / 60000) * 60000).toISOString(),
          },
          generationsPerDay: {
            limit: limit.generationsPerDay,
            used: this.jobs.size,
            resetAt: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
          },
          maxBatchSize: limit.batchSize,
        },
      };
    },
  };

  // Webhooks API
  public readonly webhooks: WebhooksApi = {
    register: async (request) => {
      const webhook: Webhook = {
        id: this.generateId(),
        ...request,
        active: request.active !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'mock_user',
        deliveryStats: {
          total: 0,
          successful: 0,
          failed: 0,
        },
      };
      this.webhooksStorage.set(webhook.id, webhook);
      return { webhook };
    },

    list: async () => ({
      webhooks: Array.from(this.webhooksStorage.values()),
    }),

    get: async (webhookId) => {
      const webhook = this.webhooksStorage.get(webhookId);
      if (!webhook) {
        throw new Error(`Webhook not found: ${webhookId}`);
      }
      return { webhook };
    },

    update: async (webhookId, request) => {
      const webhook = this.webhooksStorage.get(webhookId);
      if (!webhook) {
        throw new Error(`Webhook not found: ${webhookId}`);
      }
      const updated = { ...webhook, ...request, updatedAt: new Date().toISOString() };
      this.webhooksStorage.set(webhookId, updated);
      return { webhook: updated };
    },

    delete: async (webhookId) => {
      if (!this.webhooksStorage.has(webhookId)) {
        throw new Error(`Webhook not found: ${webhookId}`);
      }
      this.webhooksStorage.delete(webhookId);
      return {
        message: 'Webhook deleted successfully',
        deletedId: webhookId,
      };
    },

    test: async (webhookId) => {
      const webhook = this.webhooksStorage.get(webhookId);
      if (!webhook) {
        throw new Error(`Webhook not found: ${webhookId}`);
      }
      return {
        success: true,
        statusCode: 200,
        responseTime: 150,
      };
    },
  };

  // Catalog API
  public readonly catalog: CatalogApi = {
    listStyles: async () => ({
      styles: [
        {
          value: 'Modern Minimalist' as InfographicStyle,
          name: 'Modern Minimalist',
          description: 'Clean lines, whitespace, contemporary feel',
        },
        // Add more styles as needed
      ],
    }),

    listPalettes: async () => ({
      palettes: [
        {
          value: 'Professional Blue & White' as ColorPalette,
          name: 'Professional Blue & White',
          description: 'Corporate, trustworthy, clean',
          colors: ['#0066CC', '#FFFFFF', '#F0F4F8'],
        },
        // Add more palettes as needed
      ],
    }),
  };

  // Private helper method to simulate generation
  private async simulateGeneration(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId)!;

    // Analysis phase
    await this.simulateDelay(this.mockOptions.mockAnalysisDelay!);
    job.status = JobStatus.ANALYZING;
    job.startedAt = new Date().toISOString();
    this.jobs.set(jobId, job);

    if (this.shouldSimulateError()) {
      job.status = JobStatus.FAILED;
      job.error = {
        code: ApiErrorCode.ANALYSIS_FAILED,
        message: 'Simulated analysis failure',
      };
      job.completedAt = new Date().toISOString();
      this.jobs.set(jobId, job);
      return;
    }

    // Generation phase
    await this.simulateDelay(this.mockOptions.mockGenerationDelay!);
    job.status = JobStatus.GENERATING;
    this.jobs.set(jobId, job);

    if (this.shouldSimulateError()) {
      job.status = JobStatus.FAILED;
      job.error = {
        code: ApiErrorCode.IMAGE_GENERATION_FAILED,
        message: 'Simulated generation failure',
      };
      job.completedAt = new Date().toISOString();
      this.jobs.set(jobId, job);
      return;
    }

    // Complete
    job.status = JobStatus.COMPLETED;
    job.result = {
      imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      analysis: {
        title: `Generated: ${job.request.topic}`,
        summary: 'Mock generation result',
        keyPoints: ['Point 1', 'Point 2', 'Point 3'],
        visualPlan: 'Mock visual plan',
      },
    };
    job.completedAt = new Date().toISOString();
    this.jobs.set(jobId, job);
  }
}
