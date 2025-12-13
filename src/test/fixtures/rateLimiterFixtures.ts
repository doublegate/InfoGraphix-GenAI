/**
 * Test fixtures for RateLimiter
 */
import { RateLimiterConfig } from '../../utils/rateLimiter';

/**
 * Standard test configuration with short durations for fast tests
 */
export const testConfig: RateLimiterConfig = {
  maxRequests: 3,
  windowMs: 100, // 100ms window for fast tests
  cooldownMs: 200, // 200ms cooldown for fast tests
};

/**
 * Strict configuration - single request per window
 */
export const strictConfig: RateLimiterConfig = {
  maxRequests: 1,
  windowMs: 50,
  cooldownMs: 100,
};

/**
 * Lenient configuration - many requests allowed
 */
export const lenientConfig: RateLimiterConfig = {
  maxRequests: 100,
  windowMs: 1000,
  cooldownMs: 500,
};

/**
 * Production-like configuration
 */
export const productionConfig: RateLimiterConfig = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  cooldownMs: 300000, // 5 minutes
};

/**
 * Helper to wait for a specified duration
 */
export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
