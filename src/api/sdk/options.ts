/**
 * SDK configuration options for the InfoGraphix AI client.
 *
 * @module api/sdk/options
 */

/**
 * Retry configuration for failed requests.
 */
export interface RetryConfig {
  /** Whether retry is enabled (default: true) */
  enabled: boolean;

  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number;

  /** Initial retry delay in milliseconds (default: 1000) */
  retryDelay: number;

  /** Use exponential backoff for retries (default: true) */
  exponentialBackoff: boolean;

  /** Maximum retry delay in milliseconds (default: 30000) */
  maxRetryDelay?: number;

  /** HTTP status codes that should trigger a retry */
  retryableStatusCodes?: number[];
}

/**
 * Webhook polling configuration.
 *
 * Used for polling job status when webhooks are not available.
 */
export interface WebhookConfig {
  /** Whether webhook polling is enabled (default: false) */
  enabled: boolean;

  /** Polling interval in milliseconds (default: 2000) */
  pollInterval?: number;

  /** Maximum number of polling attempts before giving up (default: 30) */
  maxPolls?: number;
}

/**
 * Logging configuration.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

/**
 * Custom logger function.
 *
 * @param level - Log level
 * @param message - Log message
 * @param data - Optional additional data
 */
export type Logger = (level: LogLevel, message: string, data?: unknown) => void;

/**
 * SDK client configuration options.
 */
export interface ClientOptions {
  // Required configuration
  /** API key for authentication */
  apiKey: string;

  // Optional configuration
  /** API base URL (default: https://api.infographix.ai/v1) */
  baseUrl?: string;

  /** Request timeout in milliseconds (default: 60000) */
  timeout?: number;

  /** Retry configuration */
  retry?: Partial<RetryConfig>;

  /** Additional HTTP headers to include in all requests */
  headers?: Record<string, string>;

  /** Webhook/polling configuration for async operations */
  webhooks?: Partial<WebhookConfig>;

  /** Logging configuration */
  logLevel?: LogLevel;

  /** Custom logger function */
  logger?: Logger;

  /** User agent string (default: @infographix/sdk/{version}) */
  userAgent?: string;

  /** Whether to validate requests before sending (default: true) */
  validateRequests?: boolean;

  /** Whether to automatically follow redirects (default: true) */
  followRedirects?: boolean;

  /** Maximum number of redirects to follow (default: 5) */
  maxRedirects?: number;
}

/**
 * Default client options.
 */
export const DEFAULT_CLIENT_OPTIONS: Partial<ClientOptions> = {
  baseUrl: 'https://api.infographix.ai/v1',
  timeout: 60000,
  retry: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    maxRetryDelay: 30000,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },
  webhooks: {
    enabled: false,
    pollInterval: 2000,
    maxPolls: 30,
  },
  logLevel: 'warn',
  userAgent: '@infographix/sdk/2.2.0',
  validateRequests: true,
  followRedirects: true,
  maxRedirects: 5,
};

/**
 * Merge user options with defaults.
 *
 * @param options - User-provided options
 * @returns Merged options
 */
export function mergeOptions(options: ClientOptions): Required<ClientOptions> {
  return {
    ...DEFAULT_CLIENT_OPTIONS,
    ...options,
    retry: {
      ...DEFAULT_CLIENT_OPTIONS.retry!,
      ...options.retry,
    } as RetryConfig,
    webhooks: {
      ...DEFAULT_CLIENT_OPTIONS.webhooks!,
      ...options.webhooks,
    } as WebhookConfig,
    headers: {
      ...DEFAULT_CLIENT_OPTIONS.headers,
      ...options.headers,
    },
  } as Required<ClientOptions>;
}

/**
 * Validate client options.
 *
 * @param options - Client options to validate
 * @throws Error if options are invalid
 */
export function validateOptions(options: ClientOptions): void {
  if (!options.apiKey || typeof options.apiKey !== 'string') {
    throw new Error('API key is required and must be a string');
  }

  if (options.baseUrl && !options.baseUrl.startsWith('http')) {
    throw new Error('Base URL must start with http:// or https://');
  }

  if (options.timeout && (options.timeout < 0 || options.timeout > 300000)) {
    throw new Error('Timeout must be between 0 and 300000 milliseconds (5 minutes)');
  }

  if (options.retry?.maxRetries && options.retry.maxRetries < 0) {
    throw new Error('Max retries must be a non-negative number');
  }

  if (options.retry?.retryDelay && options.retry.retryDelay < 0) {
    throw new Error('Retry delay must be a non-negative number');
  }

  if (options.webhooks?.pollInterval && options.webhooks.pollInterval < 100) {
    throw new Error('Poll interval must be at least 100 milliseconds');
  }
}
