/**
 * Client-side rate limiter for API requests.
 * Prevents excessive API calls and handles cooldown periods after rate limit errors.
 *
 * v1.9.1 - TD-032: Rate Limiting UI
 */

/**
 * Configuration for rate limiter behavior.
 */
export interface RateLimiterConfig {
  /** Maximum number of requests allowed within the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Cooldown period after hitting rate limit (ms) */
  cooldownMs: number;
}

/**
 * Request timestamp record.
 */
interface RequestRecord {
  /** Unix timestamp (ms) when request was made */
  timestamp: number;
}

/**
 * Client-side rate limiter with sliding window algorithm.
 * Tracks request history and enforces rate limits with cooldown periods.
 *
 * @example
 * ```typescript
 * const limiter = new RateLimiter({
 *   maxRequests: 10,
 *   windowMs: 60000,    // 1 minute
 *   cooldownMs: 300000  // 5 minutes
 * });
 *
 * if (limiter.canMakeRequest()) {
 *   limiter.recordRequest();
 *   await makeApiCall();
 * } else {
 *   const wait = limiter.getTimeUntilReset();
 *   console.log(`Please wait ${wait}ms before retrying`);
 * }
 * ```
 */
export class RateLimiter {
  private config: RateLimiterConfig;
  private requests: RequestRecord[] = [];
  private cooldownUntil: number | null = null;

  /**
   * Create a new rate limiter instance.
   *
   * @param config - Rate limiter configuration
   */
  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  /**
   * Check if a new request can be made.
   * Considers both rate limit window and cooldown period.
   *
   * @returns True if request is allowed, false if rate limited or in cooldown
   *
   * @example
   * ```typescript
   * if (limiter.canMakeRequest()) {
   *   // Safe to proceed with API call
   *   limiter.recordRequest();
   *   await makeApiCall();
   * }
   * ```
   */
  canMakeRequest(): boolean {
    const now = Date.now();

    // Check if in cooldown period
    if (this.cooldownUntil !== null && now < this.cooldownUntil) {
      return false;
    }

    // Remove expired requests from the window
    this.cleanupExpiredRequests();

    // Check if under rate limit
    return this.requests.length < this.config.maxRequests;
  }

  /**
   * Record a new request in the rate limiter history.
   * Should be called immediately before making an API request.
   *
   * @example
   * ```typescript
   * limiter.recordRequest();
   * const result = await geminiService.generateImage(...);
   * ```
   */
  recordRequest(): void {
    this.requests.push({ timestamp: Date.now() });
  }

  /**
   * Activate cooldown period after receiving a rate limit error (429).
   * Prevents further requests for the configured cooldown duration.
   *
   * @example
   * ```typescript
   * try {
   *   await makeApiCall();
   * } catch (error) {
   *   if (error.status === 429) {
   *     limiter.activateCooldown();
   *     // Show cooldown timer in UI
   *   }
   * }
   * ```
   */
  activateCooldown(): void {
    this.cooldownUntil = Date.now() + this.config.cooldownMs;
  }

  /**
   * Get time remaining until rate limit resets.
   * Returns the longer of: time until window expires or cooldown ends.
   *
   * @returns Milliseconds until reset, or 0 if can make request
   *
   * @example
   * ```typescript
   * const wait = limiter.getTimeUntilReset();
   * if (wait > 0) {
   *   const seconds = Math.ceil(wait / 1000);
   *   console.log(`Please wait ${seconds} seconds`);
   * }
   * ```
   */
  getTimeUntilReset(): number {
    const now = Date.now();

    // Check cooldown time
    const cooldownRemaining = this.cooldownUntil !== null
      ? Math.max(0, this.cooldownUntil - now)
      : 0;

    // Check window reset time
    let windowRemaining = 0;
    if (this.requests.length >= this.config.maxRequests) {
      const oldestRequest = this.requests[0];
      const windowExpires = oldestRequest.timestamp + this.config.windowMs;
      windowRemaining = Math.max(0, windowExpires - now);
    }

    return Math.max(cooldownRemaining, windowRemaining);
  }

  /**
   * Get number of requests remaining in current window.
   * Useful for displaying quota information to users.
   *
   * @returns Number of requests that can still be made
   *
   * @example
   * ```typescript
   * const remaining = limiter.getRemainingRequests();
   * console.log(`${remaining} requests remaining`);
   * ```
   */
  getRemainingRequests(): number {
    const now = Date.now();

    // If in cooldown, no requests available
    if (this.cooldownUntil !== null && now < this.cooldownUntil) {
      return 0;
    }

    this.cleanupExpiredRequests();
    return Math.max(0, this.config.maxRequests - this.requests.length);
  }

  /**
   * Check if currently in cooldown period.
   *
   * @returns True if in cooldown, false otherwise
   *
   * @example
   * ```typescript
   * if (limiter.isInCooldown()) {
   *   // Show cooldown timer UI
   *   const wait = limiter.getTimeUntilReset();
   *   showCooldownMessage(wait);
   * }
   * ```
   */
  isInCooldown(): boolean {
    return this.cooldownUntil !== null && Date.now() < this.cooldownUntil;
  }

  /**
   * Reset the rate limiter, clearing all request history and cooldown.
   * Useful for testing or manual reset.
   *
   * @example
   * ```typescript
   * // Reset after user upgrades to paid tier
   * limiter.reset();
   * ```
   */
  reset(): void {
    this.requests = [];
    this.cooldownUntil = null;
  }

  /**
   * Get current configuration.
   *
   * @returns Current rate limiter configuration
   */
  getConfig(): RateLimiterConfig {
    return { ...this.config };
  }

  /**
   * Update rate limiter configuration.
   * Useful for adjusting limits based on user tier or API changes.
   *
   * @param config - New configuration (partial update supported)
   *
   * @example
   * ```typescript
   * // Increase limits for paid users
   * limiter.updateConfig({
   *   maxRequests: 100,
   *   windowMs: 60000
   * });
   * ```
   */
  updateConfig(config: Partial<RateLimiterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Remove expired requests from the sliding window.
   * Private helper method called automatically by canMakeRequest().
   */
  private cleanupExpiredRequests(): void {
    const now = Date.now();
    const cutoff = now - this.config.windowMs;
    this.requests = this.requests.filter(req => req.timestamp > cutoff);
  }
}

/**
 * Default rate limiter configuration for Gemini API.
 * Conservative defaults to avoid hitting rate limits.
 */
export const DEFAULT_RATE_LIMITER_CONFIG: RateLimiterConfig = {
  maxRequests: 10,        // 10 requests
  windowMs: 60000,        // per minute
  cooldownMs: 300000      // 5 minute cooldown after rate limit
};

/**
 * Create a rate limiter with default configuration.
 *
 * @param config - Optional partial config to override defaults
 * @returns New RateLimiter instance
 *
 * @example
 * ```typescript
 * const limiter = createRateLimiter();
 *
 * // Or with custom config
 * const customLimiter = createRateLimiter({
 *   maxRequests: 20,
 *   cooldownMs: 600000 // 10 minute cooldown
 * });
 * ```
 */
export function createRateLimiter(
  config?: Partial<RateLimiterConfig>
): RateLimiter {
  return new RateLimiter({
    ...DEFAULT_RATE_LIMITER_CONFIG,
    ...config
  });
}
