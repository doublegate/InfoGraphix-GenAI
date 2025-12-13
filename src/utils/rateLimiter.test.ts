/**
 * RateLimiter Unit Tests
 *
 * Comprehensive tests for the client-side rate limiter utility.
 * Tests cover all methods, edge cases, and the sliding window algorithm.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  RateLimiter,
  RateLimiterConfig,
  DEFAULT_RATE_LIMITER_CONFIG,
  createRateLimiter,
} from './rateLimiter';
import {
  testConfig,
  strictConfig,
  lenientConfig,
  wait,
} from '../test/fixtures/rateLimiterFixtures';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should create instance with provided config', () => {
      const limiter = new RateLimiter(testConfig);
      expect(limiter.getConfig()).toEqual(testConfig);
    });

    it('should start with no requests recorded', () => {
      const limiter = new RateLimiter(testConfig);
      expect(limiter.getRemainingRequests()).toBe(testConfig.maxRequests);
    });

    it('should start without cooldown active', () => {
      const limiter = new RateLimiter(testConfig);
      expect(limiter.isInCooldown()).toBe(false);
    });
  });

  describe('canMakeRequest', () => {
    it('should return true when no requests have been made', () => {
      const limiter = new RateLimiter(testConfig);
      expect(limiter.canMakeRequest()).toBe(true);
    });

    it('should return true when under rate limit', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.recordRequest();
      limiter.recordRequest();
      expect(limiter.canMakeRequest()).toBe(true);
    });

    it('should return false when at rate limit', () => {
      const limiter = new RateLimiter(testConfig);
      for (let i = 0; i < testConfig.maxRequests; i++) {
        limiter.recordRequest();
      }
      expect(limiter.canMakeRequest()).toBe(false);
    });

    it('should return false when in cooldown', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.activateCooldown();
      expect(limiter.canMakeRequest()).toBe(false);
    });

    it('should return true after window expires', () => {
      const limiter = new RateLimiter(testConfig);
      for (let i = 0; i < testConfig.maxRequests; i++) {
        limiter.recordRequest();
      }
      expect(limiter.canMakeRequest()).toBe(false);

      // Advance time past the window
      vi.advanceTimersByTime(testConfig.windowMs + 1);
      expect(limiter.canMakeRequest()).toBe(true);
    });

    it('should return true after cooldown expires', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.activateCooldown();
      expect(limiter.canMakeRequest()).toBe(false);

      // Advance time past the cooldown
      vi.advanceTimersByTime(testConfig.cooldownMs + 1);
      expect(limiter.canMakeRequest()).toBe(true);
    });
  });

  describe('recordRequest', () => {
    it('should increment request count', () => {
      const limiter = new RateLimiter(testConfig);
      expect(limiter.getRemainingRequests()).toBe(3);
      limiter.recordRequest();
      expect(limiter.getRemainingRequests()).toBe(2);
    });

    it('should record multiple requests', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.recordRequest();
      limiter.recordRequest();
      limiter.recordRequest();
      expect(limiter.getRemainingRequests()).toBe(0);
    });

    it('should allow recording beyond limit (for tracking)', () => {
      const limiter = new RateLimiter(strictConfig);
      limiter.recordRequest();
      limiter.recordRequest(); // Over limit
      expect(limiter.canMakeRequest()).toBe(false);
    });
  });

  describe('activateCooldown', () => {
    it('should activate cooldown state', () => {
      const limiter = new RateLimiter(testConfig);
      expect(limiter.isInCooldown()).toBe(false);
      limiter.activateCooldown();
      expect(limiter.isInCooldown()).toBe(true);
    });

    it('should block requests during cooldown', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.activateCooldown();
      expect(limiter.canMakeRequest()).toBe(false);
      expect(limiter.getRemainingRequests()).toBe(0);
    });

    it('should set correct cooldown duration', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.activateCooldown();

      const timeUntilReset = limiter.getTimeUntilReset();
      expect(timeUntilReset).toBe(testConfig.cooldownMs);
    });

    it('should allow resetting cooldown with new activation', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.activateCooldown();

      vi.advanceTimersByTime(50);
      limiter.activateCooldown(); // Reset cooldown

      expect(limiter.getTimeUntilReset()).toBe(testConfig.cooldownMs);
    });
  });

  describe('getTimeUntilReset', () => {
    it('should return 0 when no restrictions', () => {
      const limiter = new RateLimiter(testConfig);
      expect(limiter.getTimeUntilReset()).toBe(0);
    });

    it('should return cooldown time when in cooldown', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.activateCooldown();
      expect(limiter.getTimeUntilReset()).toBe(testConfig.cooldownMs);
    });

    it('should return window remaining time when at limit', () => {
      const limiter = new RateLimiter(testConfig);
      for (let i = 0; i < testConfig.maxRequests; i++) {
        limiter.recordRequest();
      }
      // Time until oldest request expires
      expect(limiter.getTimeUntilReset()).toBe(testConfig.windowMs);
    });

    it('should return longer of cooldown or window time', () => {
      const limiter = new RateLimiter(testConfig);
      for (let i = 0; i < testConfig.maxRequests; i++) {
        limiter.recordRequest();
      }
      limiter.activateCooldown();

      // Cooldown (200ms) is longer than window (100ms)
      expect(limiter.getTimeUntilReset()).toBe(testConfig.cooldownMs);
    });

    it('should decrease over time', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.activateCooldown();

      const initial = limiter.getTimeUntilReset();
      vi.advanceTimersByTime(50);
      const after = limiter.getTimeUntilReset();

      expect(after).toBe(initial - 50);
    });

    it('should not return negative values', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.activateCooldown();

      vi.advanceTimersByTime(testConfig.cooldownMs + 100);
      expect(limiter.getTimeUntilReset()).toBe(0);
    });
  });

  describe('getRemainingRequests', () => {
    it('should return max when no requests made', () => {
      const limiter = new RateLimiter(testConfig);
      expect(limiter.getRemainingRequests()).toBe(testConfig.maxRequests);
    });

    it('should decrease with each request', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.recordRequest();
      expect(limiter.getRemainingRequests()).toBe(2);
      limiter.recordRequest();
      expect(limiter.getRemainingRequests()).toBe(1);
    });

    it('should return 0 when at limit', () => {
      const limiter = new RateLimiter(testConfig);
      for (let i = 0; i < testConfig.maxRequests; i++) {
        limiter.recordRequest();
      }
      expect(limiter.getRemainingRequests()).toBe(0);
    });

    it('should return 0 during cooldown', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.activateCooldown();
      expect(limiter.getRemainingRequests()).toBe(0);
    });

    it('should increase as requests expire from window', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.recordRequest();
      expect(limiter.getRemainingRequests()).toBe(2);

      vi.advanceTimersByTime(testConfig.windowMs + 1);
      expect(limiter.getRemainingRequests()).toBe(3);
    });

    it('should not return negative values', () => {
      const limiter = new RateLimiter(strictConfig);
      limiter.recordRequest();
      limiter.recordRequest();
      limiter.recordRequest();
      // Even with excess recordings, remaining should be 0
      expect(limiter.getRemainingRequests()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('isInCooldown', () => {
    it('should return false initially', () => {
      const limiter = new RateLimiter(testConfig);
      expect(limiter.isInCooldown()).toBe(false);
    });

    it('should return true after activating cooldown', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.activateCooldown();
      expect(limiter.isInCooldown()).toBe(true);
    });

    it('should return false after cooldown expires', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.activateCooldown();
      expect(limiter.isInCooldown()).toBe(true);

      vi.advanceTimersByTime(testConfig.cooldownMs + 1);
      expect(limiter.isInCooldown()).toBe(false);
    });

    it('should return true at cooldown boundary', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.activateCooldown();

      vi.advanceTimersByTime(testConfig.cooldownMs - 1);
      expect(limiter.isInCooldown()).toBe(true);
    });
  });

  describe('reset', () => {
    it('should clear request history', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.recordRequest();
      limiter.recordRequest();
      expect(limiter.getRemainingRequests()).toBe(1);

      limiter.reset();
      expect(limiter.getRemainingRequests()).toBe(testConfig.maxRequests);
    });

    it('should clear cooldown', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.activateCooldown();
      expect(limiter.isInCooldown()).toBe(true);

      limiter.reset();
      expect(limiter.isInCooldown()).toBe(false);
    });

    it('should allow requests after reset', () => {
      const limiter = new RateLimiter(testConfig);
      for (let i = 0; i < testConfig.maxRequests; i++) {
        limiter.recordRequest();
      }
      limiter.activateCooldown();
      expect(limiter.canMakeRequest()).toBe(false);

      limiter.reset();
      expect(limiter.canMakeRequest()).toBe(true);
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', () => {
      const limiter = new RateLimiter(testConfig);
      expect(limiter.getConfig()).toEqual(testConfig);
    });

    it('should return a copy (not reference)', () => {
      const limiter = new RateLimiter(testConfig);
      const config1 = limiter.getConfig();
      const config2 = limiter.getConfig();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2);
    });
  });

  describe('updateConfig', () => {
    it('should update maxRequests', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.updateConfig({ maxRequests: 10 });

      const config = limiter.getConfig();
      expect(config.maxRequests).toBe(10);
      expect(config.windowMs).toBe(testConfig.windowMs);
    });

    it('should update windowMs', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.updateConfig({ windowMs: 500 });

      const config = limiter.getConfig();
      expect(config.windowMs).toBe(500);
    });

    it('should update cooldownMs', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.updateConfig({ cooldownMs: 1000 });

      const config = limiter.getConfig();
      expect(config.cooldownMs).toBe(1000);
    });

    it('should update multiple values at once', () => {
      const limiter = new RateLimiter(testConfig);
      limiter.updateConfig({
        maxRequests: 20,
        windowMs: 300,
        cooldownMs: 600,
      });

      const config = limiter.getConfig();
      expect(config.maxRequests).toBe(20);
      expect(config.windowMs).toBe(300);
      expect(config.cooldownMs).toBe(600);
    });

    it('should preserve unspecified values', () => {
      const limiter = new RateLimiter(testConfig);
      const originalCooldown = testConfig.cooldownMs;

      limiter.updateConfig({ maxRequests: 50 });

      const config = limiter.getConfig();
      expect(config.cooldownMs).toBe(originalCooldown);
    });
  });

  describe('sliding window algorithm', () => {
    it('should allow new request after oldest expires', () => {
      const limiter = new RateLimiter(testConfig);

      // Fill up the limit
      for (let i = 0; i < testConfig.maxRequests; i++) {
        limiter.recordRequest();
        vi.advanceTimersByTime(10); // Stagger requests
      }

      expect(limiter.canMakeRequest()).toBe(false);

      // Wait for first request to expire
      vi.advanceTimersByTime(testConfig.windowMs - 20);
      expect(limiter.canMakeRequest()).toBe(true);
    });

    it('should handle interleaved requests and time advances', () => {
      const limiter = new RateLimiter({ ...testConfig, maxRequests: 2 });

      limiter.recordRequest();
      vi.advanceTimersByTime(30);

      limiter.recordRequest();
      expect(limiter.canMakeRequest()).toBe(false);

      // First request expires at 100ms, we're at 30ms
      vi.advanceTimersByTime(71);
      expect(limiter.canMakeRequest()).toBe(true);
    });
  });
});

describe('DEFAULT_RATE_LIMITER_CONFIG', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_RATE_LIMITER_CONFIG.maxRequests).toBe(10);
    expect(DEFAULT_RATE_LIMITER_CONFIG.windowMs).toBe(60000);
    expect(DEFAULT_RATE_LIMITER_CONFIG.cooldownMs).toBe(300000);
  });
});

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create limiter with default config', () => {
    const limiter = createRateLimiter();
    expect(limiter.getConfig()).toEqual(DEFAULT_RATE_LIMITER_CONFIG);
  });

  it('should allow partial config override', () => {
    const limiter = createRateLimiter({ maxRequests: 20 });
    const config = limiter.getConfig();

    expect(config.maxRequests).toBe(20);
    expect(config.windowMs).toBe(DEFAULT_RATE_LIMITER_CONFIG.windowMs);
    expect(config.cooldownMs).toBe(DEFAULT_RATE_LIMITER_CONFIG.cooldownMs);
  });

  it('should allow full config override', () => {
    const customConfig: RateLimiterConfig = {
      maxRequests: 5,
      windowMs: 30000,
      cooldownMs: 120000,
    };

    const limiter = createRateLimiter(customConfig);
    expect(limiter.getConfig()).toEqual(customConfig);
  });

  it('should create functional limiter', () => {
    const limiter = createRateLimiter(testConfig);
    expect(limiter.canMakeRequest()).toBe(true);

    limiter.recordRequest();
    expect(limiter.getRemainingRequests()).toBe(testConfig.maxRequests - 1);
  });
});

describe('RateLimiter integration scenarios', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle typical API usage pattern', () => {
    const limiter = createRateLimiter(testConfig);

    // Make some requests
    for (let i = 0; i < 2; i++) {
      expect(limiter.canMakeRequest()).toBe(true);
      limiter.recordRequest();
    }

    // One request remaining
    expect(limiter.getRemainingRequests()).toBe(1);

    // Simulate rate limit error from API (429)
    limiter.activateCooldown();
    expect(limiter.canMakeRequest()).toBe(false);

    // Wait for cooldown
    vi.advanceTimersByTime(testConfig.cooldownMs + 1);
    expect(limiter.canMakeRequest()).toBe(true);
  });

  it('should handle burst followed by steady usage', () => {
    const limiter = createRateLimiter({ ...testConfig, maxRequests: 5 });

    // Burst: 3 rapid requests
    limiter.recordRequest();
    limiter.recordRequest();
    limiter.recordRequest();
    expect(limiter.getRemainingRequests()).toBe(2);

    // Wait half the window
    vi.advanceTimersByTime(testConfig.windowMs / 2);

    // More requests
    limiter.recordRequest();
    limiter.recordRequest();
    expect(limiter.canMakeRequest()).toBe(false);

    // After first half expires
    vi.advanceTimersByTime(testConfig.windowMs / 2 + 1);
    expect(limiter.getRemainingRequests()).toBe(3);
  });

  it('should handle config update mid-session', () => {
    const limiter = createRateLimiter(strictConfig);

    limiter.recordRequest();
    expect(limiter.canMakeRequest()).toBe(false);

    // Upgrade to lenient config
    limiter.updateConfig(lenientConfig);
    expect(limiter.canMakeRequest()).toBe(true);
  });
});
