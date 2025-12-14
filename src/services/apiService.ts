/**
 * Unified API Service
 *
 * Provides a unified interface for infographic generation that automatically
 * routes between different backends based on configuration:
 *
 * - 'gemini': Direct Gemini API calls (current production behavior)
 * - 'infographix': InfoGraphix AI API (mock for now, production in Q2 2026)
 * - 'auto': Automatically selects based on available configuration
 *
 * @module services/apiService
 * @since v2.2.0-foundation
 */

import {
  ImageSize,
  AspectRatio,
  type AnalysisResult,
  type GeneratedInfographic,
  type InfographicStyle,
  type ColorPalette,
  type GithubFilters,
  type StyleSuggestion,
} from '../types';
import {
  analyzeTopic as geminiAnalyzeTopic,
  generateInfographicImage as geminiGenerateImage,
  suggestStyleAndPalette as geminiSuggestStyleAndPalette,
  getRateLimiter,
} from './geminiService';
import {
  InfoGraphixService,
  getInfoGraphixService,
  resetInfoGraphixService,
  type UnifiedGenerationRequest,
  type GenerationResult,
} from './infographixService';
import { log } from '../utils/logger';

/**
 * API mode for routing requests.
 */
export type ApiMode = 'gemini' | 'infographix' | 'auto';

/**
 * Configuration for the API service.
 */
export interface ApiServiceConfig {
  /** API mode to use */
  mode: ApiMode;
  /** Gemini API key (required for 'gemini' and 'auto' modes) */
  geminiApiKey?: string;
  /** InfoGraphix API key (required for 'infographix' mode) */
  infographixApiKey?: string;
  /** InfoGraphix API base URL */
  infographixBaseUrl?: string;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Generation request parameters.
 */
export interface GenerationRequest {
  topic: string;
  size: ImageSize;
  aspectRatio: AspectRatio;
  style: InfographicStyle;
  palette: ColorPalette;
  filters?: GithubFilters;
  fileContent?: string;
}

/**
 * Processing step for UI feedback.
 */
export type ProcessingStep = 'idle' | 'analyzing' | 'generating' | 'complete';

/**
 * Progress callback for generation updates.
 */
export type ProgressCallback = (step: ProcessingStep, message?: string) => void;

/**
 * Unified API Service class.
 *
 * Provides a single interface for infographic generation that works
 * with multiple backend implementations.
 */
class ApiService {
  private config: ApiServiceConfig;
  private infographixService: InfoGraphixService | null = null;

  constructor() {
    this.config = {
      mode: this.detectDefaultMode(),
      geminiApiKey: process.env.API_KEY,
      debug: process.env.NODE_ENV === 'development',
    };
  }

  /**
   * Configure the API service.
   *
   * @param config - Configuration options
   */
  configure(config: Partial<ApiServiceConfig>): void {
    this.config = { ...this.config, ...config };

    // Reset InfoGraphix service if switching modes
    if (config.mode || config.infographixApiKey) {
      resetInfoGraphixService();
      this.infographixService = null;
    }

    log.info('API service configured', {
      mode: this.config.mode,
      hasGeminiKey: !!this.config.geminiApiKey,
      hasInfoGraphixKey: !!this.config.infographixApiKey,
    });
  }

  /**
   * Get current configuration.
   *
   * @returns Current config (with sensitive values masked)
   */
  getConfig(): Omit<ApiServiceConfig, 'geminiApiKey' | 'infographixApiKey'> & {
    hasGeminiKey: boolean;
    hasInfoGraphixKey: boolean;
  } {
    return {
      mode: this.config.mode,
      infographixBaseUrl: this.config.infographixBaseUrl,
      debug: this.config.debug,
      hasGeminiKey: !!this.config.geminiApiKey,
      hasInfoGraphixKey: !!this.config.infographixApiKey,
    };
  }

  /**
   * Get the effective API mode.
   *
   * @returns The mode that will be used for requests
   */
  getEffectiveMode(): 'gemini' | 'infographix' {
    if (this.config.mode === 'auto') {
      return this.detectDefaultMode() === 'infographix' ? 'infographix' : 'gemini';
    }
    return this.config.mode;
  }

  /**
   * Check if the service is ready to make requests.
   *
   * @returns True if configured correctly
   */
  isReady(): boolean {
    const mode = this.getEffectiveMode();

    if (mode === 'gemini') {
      return !!this.config.geminiApiKey;
    }

    if (mode === 'infographix') {
      return !!this.config.infographixApiKey;
    }

    return false;
  }

  /**
   * Check rate limit status.
   *
   * @returns Rate limit information
   */
  getRateLimitStatus(): {
    canMakeRequest: boolean;
    remaining: number;
    resetIn: number;
  } {
    const rateLimiter = getRateLimiter();
    return {
      canMakeRequest: rateLimiter.canMakeRequest(),
      remaining: rateLimiter.getRemainingRequests(),
      resetIn: rateLimiter.getTimeUntilReset(),
    };
  }

  /**
   * Analyze a topic to extract key points and visual plan.
   *
   * @param topic - Topic, URL, or GitHub repo to analyze
   * @param style - Infographic style
   * @param palette - Color palette
   * @param filters - Optional GitHub filters
   * @param fileContent - Optional file content to analyze
   * @param onProgress - Optional progress callback
   * @returns Analysis result
   */
  async analyzeTopic(
    topic: string,
    style: InfographicStyle,
    palette: ColorPalette,
    filters?: GithubFilters,
    fileContent?: string,
    onProgress?: ProgressCallback
  ): Promise<AnalysisResult> {
    const mode = this.getEffectiveMode();

    onProgress?.('analyzing', 'Starting topic analysis...');

    if (mode === 'gemini') {
      return geminiAnalyzeTopic(topic, style, palette, filters, fileContent);
    }

    // InfoGraphix mode - use SDK client
    // Note: In the real implementation, this would call a combined analyze+generate endpoint
    // For now, we simulate analysis by extracting it from a generation job
    const service = this.getInfoGraphixService();
    const result = await service.createGeneration({
      topic,
      style,
      palette,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Landscape,
      filters,
      fileContent,
    });

    // Wait for analysis phase to complete
    const finalResult = await service.waitForGeneration(result.jobId, status => {
      if (status.status === 'analyzing') {
        onProgress?.('analyzing', 'Researching topic...');
      } else if (status.status === 'generating') {
        onProgress?.('generating', 'Creating visualization...');
      }
    });

    if (finalResult.error) {
      throw new Error(finalResult.error);
    }

    if (!finalResult.result) {
      throw new Error('No result from analysis');
    }

    return finalResult.result.analysis;
  }

  /**
   * Generate an infographic image from a visual plan.
   *
   * @param visualPlan - Detailed prompt for image generation
   * @param size - Image resolution
   * @param aspectRatio - Image aspect ratio
   * @param onProgress - Optional progress callback
   * @returns Base64 image data URL
   */
  async generateImage(
    visualPlan: string,
    size: ImageSize,
    aspectRatio: AspectRatio,
    onProgress?: ProgressCallback
  ): Promise<string> {
    const mode = this.getEffectiveMode();

    onProgress?.('generating', 'Generating infographic...');

    if (mode === 'gemini') {
      return geminiGenerateImage(visualPlan, size, aspectRatio);
    }

    // InfoGraphix mode - image is already generated as part of the job
    // This would be called after analyzeTopic in a two-phase flow
    throw new Error('InfoGraphix mode requires using generateInfographic() for combined generation');
  }

  /**
   * Generate a complete infographic (analysis + image).
   *
   * This is the recommended method for most use cases as it handles
   * the full generation pipeline in a single call.
   *
   * @param request - Generation request parameters
   * @param onProgress - Optional progress callback
   * @returns Generated infographic with analysis
   */
  async generateInfographic(
    request: GenerationRequest,
    onProgress?: ProgressCallback
  ): Promise<GeneratedInfographic> {
    const mode = this.getEffectiveMode();

    if (mode === 'gemini') {
      // Two-phase Gemini flow
      onProgress?.('analyzing', 'Analyzing topic...');
      const analysis = await geminiAnalyzeTopic(
        request.topic,
        request.style,
        request.palette,
        request.filters,
        request.fileContent
      );

      onProgress?.('generating', 'Generating infographic...');
      const imageUrl = await geminiGenerateImage(
        analysis.visualPlan,
        request.size,
        request.aspectRatio
      );

      onProgress?.('complete', 'Generation complete');
      return { imageUrl, analysis };
    }

    // InfoGraphix mode - single API call handles both phases
    const service = this.getInfoGraphixService();

    onProgress?.('analyzing', 'Starting generation...');
    const job = await service.createGeneration(request);

    const result = await service.waitForGeneration(job.jobId, status => {
      if (status.status === 'analyzing') {
        onProgress?.('analyzing', 'Researching topic...');
      } else if (status.status === 'generating') {
        onProgress?.('generating', 'Creating visualization...');
      }
    });

    if (result.error) {
      throw new Error(result.error);
    }

    if (!result.result) {
      throw new Error('No result from generation');
    }

    onProgress?.('complete', 'Generation complete');
    return result.result;
  }

  /**
   * Get AI-powered style and palette suggestions.
   *
   * @param topic - Topic to analyze
   * @returns Style and palette suggestions
   */
  async getSuggestions(topic: string): Promise<StyleSuggestion> {
    // Always use Gemini for suggestions (lightweight operation)
    return geminiSuggestStyleAndPalette(topic);
  }

  /**
   * Create an async generation job (InfoGraphix mode only).
   *
   * Returns immediately with a job ID that can be polled for status.
   *
   * @param request - Generation request
   * @returns Job information
   */
  async createAsyncGeneration(request: GenerationRequest): Promise<GenerationResult> {
    const mode = this.getEffectiveMode();

    if (mode === 'gemini') {
      throw new Error('Async generation is not available in Gemini mode. Use generateInfographic() instead.');
    }

    const service = this.getInfoGraphixService();
    return service.createGeneration(request);
  }

  /**
   * Get the status of an async generation job.
   *
   * @param jobId - Job identifier
   * @returns Current job status
   */
  async getGenerationStatus(jobId: string): Promise<GenerationResult> {
    const service = this.getInfoGraphixService();
    return service.getGenerationStatus(jobId);
  }

  /**
   * Cancel an async generation job.
   *
   * @param jobId - Job identifier
   */
  async cancelGeneration(jobId: string): Promise<void> {
    const service = this.getInfoGraphixService();
    return service.cancelGeneration(jobId);
  }

  // Private helpers

  private detectDefaultMode(): ApiMode {
    // Check for InfoGraphix API configuration
    const infographixKey = import.meta.env?.VITE_INFOGRAPHIX_API_KEY;
    const apiMode = import.meta.env?.VITE_API_MODE as ApiMode | undefined;

    if (apiMode && ['gemini', 'infographix', 'auto'].includes(apiMode)) {
      return apiMode;
    }

    if (infographixKey) {
      return 'infographix';
    }

    return 'gemini';
  }

  private getInfoGraphixService(): InfoGraphixService {
    if (!this.infographixService) {
      const apiKey = this.config.infographixApiKey || 'mock-api-key';
      this.infographixService = getInfoGraphixService({
        apiKey,
        baseUrl: this.config.infographixBaseUrl,
        debug: this.config.debug,
      });
    }
    return this.infographixService;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Re-export types for convenience
export type { GenerationResult, UnifiedGenerationRequest };
