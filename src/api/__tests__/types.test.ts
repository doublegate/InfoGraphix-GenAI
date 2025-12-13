/**
 * Type validation tests for InfoGraphix AI API types.
 *
 * @module api/__tests__/types.test
 */

import { describe, it, expect } from 'vitest';
import {
  ApiErrorCode,
  ErrorCodeToHttpStatus,
  createApiError,
  createValidationError,
  createRateLimitError,
} from '../types/errors';
import {
  toRateLimitHeaders,
  fromRateLimitHeaders,
} from '../types/common';
import {
  UserTier,
  JobStatus,
  BatchJobStatus,
  WebhookEvent,
} from '../types/models';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../types/responses';

describe('API Types', () => {
  describe('Error Codes', () => {
    it('should map error codes to correct HTTP status codes', () => {
      expect(ErrorCodeToHttpStatus[ApiErrorCode.UNAUTHORIZED]).toBe(401);
      expect(ErrorCodeToHttpStatus[ApiErrorCode.FORBIDDEN]).toBe(403);
      expect(ErrorCodeToHttpStatus[ApiErrorCode.NOT_FOUND]).toBe(404);
      expect(ErrorCodeToHttpStatus[ApiErrorCode.RATE_LIMITED]).toBe(429);
      expect(ErrorCodeToHttpStatus[ApiErrorCode.INTERNAL_ERROR]).toBe(500);
    });

    it('should create API error with correct structure', () => {
      const error = createApiError(
        ApiErrorCode.INVALID_REQUEST,
        'Test error',
        { field: 'topic' },
        'req_123'
      );

      expect(error.code).toBe(ApiErrorCode.INVALID_REQUEST);
      expect(error.message).toBe('Test error');
      expect(error.details).toEqual({ field: 'topic' });
      expect(error.requestId).toBe('req_123');
      expect(error.statusCode).toBe(400);
      expect(error.timestamp).toBeDefined();
    });

    it('should create validation error', () => {
      const validationErrors = [
        { field: 'topic', message: 'Required field', value: undefined, expected: 'string' },
        { field: 'size', message: 'Invalid size', value: '5K', expected: '1K | 2K | 4K' },
      ];

      const error = createValidationError(validationErrors, 'req_456');

      expect(error.code).toBe(ApiErrorCode.INVALID_REQUEST);
      expect(error.details?.validationErrors).toEqual(validationErrors);
      expect(error.requestId).toBe('req_456');
    });

    it('should create rate limit error', () => {
      const details = {
        limitType: 'rate' as const,
        limit: 60,
        current: 61,
        resetAt: Math.floor(Date.now() / 1000) + 60,
        retryAfter: 60,
      };

      const error = createRateLimitError(details);

      expect(error.code).toBe(ApiErrorCode.RATE_LIMITED);
      expect(error.message).toContain('Rate limit exceeded');
      expect(error.details).toEqual(details);
    });
  });

  describe('Rate Limit Headers', () => {
    it('should convert rate limit info to headers', () => {
      const info = {
        rateLimit: {
          limit: 60,
          remaining: 45,
          reset: 1687856400,
        },
        quota: {
          limit: 500,
          remaining: 423,
          reset: 1687910400,
        },
      };

      const headers = toRateLimitHeaders(info);

      expect(headers['X-RateLimit-Limit']).toBe('60');
      expect(headers['X-RateLimit-Remaining']).toBe('45');
      expect(headers['X-RateLimit-Reset']).toBe('1687856400');
      expect(headers['X-Quota-Limit']).toBe('500');
      expect(headers['X-Quota-Remaining']).toBe('423');
      expect(headers['X-Quota-Reset']).toBe('1687910400');
    });

    it('should parse headers back to rate limit info', () => {
      const headers = {
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': '45',
        'X-RateLimit-Reset': '1687856400',
        'X-Quota-Limit': '500',
        'X-Quota-Remaining': '423',
        'X-Quota-Reset': '1687910400',
      };

      const info = fromRateLimitHeaders(headers);

      expect(info.rateLimit.limit).toBe(60);
      expect(info.rateLimit.remaining).toBe(45);
      expect(info.rateLimit.reset).toBe(1687856400);
      expect(info.quota.limit).toBe(500);
      expect(info.quota.remaining).toBe(423);
      expect(info.quota.reset).toBe(1687910400);
    });
  });

  describe('Enums', () => {
    it('should have correct user tier values', () => {
      expect(UserTier.FREE).toBe('free');
      expect(UserTier.PRO).toBe('pro');
      expect(UserTier.ENTERPRISE).toBe('enterprise');
    });

    it('should have correct job status values', () => {
      expect(JobStatus.PENDING).toBe('pending');
      expect(JobStatus.ANALYZING).toBe('analyzing');
      expect(JobStatus.GENERATING).toBe('generating');
      expect(JobStatus.COMPLETED).toBe('completed');
      expect(JobStatus.FAILED).toBe('failed');
      expect(JobStatus.CANCELLED).toBe('cancelled');
    });

    it('should have correct batch status values', () => {
      expect(BatchJobStatus.PENDING).toBe('pending');
      expect(BatchJobStatus.PROCESSING).toBe('processing');
      expect(BatchJobStatus.COMPLETED).toBe('completed');
      expect(BatchJobStatus.FAILED).toBe('failed');
      expect(BatchJobStatus.CANCELLED).toBe('cancelled');
      expect(BatchJobStatus.PAUSED).toBe('paused');
    });

    it('should have correct webhook event values', () => {
      expect(WebhookEvent.GENERATION_STARTED).toBe('generation.started');
      expect(WebhookEvent.GENERATION_COMPLETED).toBe('generation.completed');
      expect(WebhookEvent.BATCH_STARTED).toBe('batch.started');
      expect(WebhookEvent.QUOTA_EXCEEDED).toBe('quota.exceeded');
    });
  });

  describe('Response Helpers', () => {
    it('should create success response', () => {
      const data = { id: '123', name: 'Test' };
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.meta?.version).toBe('2.2.0');
      expect(response.meta?.timestamp).toBeDefined();
    });

    it('should create error response', () => {
      const error = createApiError(ApiErrorCode.NOT_FOUND, 'Resource not found');
      const response = createErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error).toEqual(error);
      expect(response.meta?.version).toBe('2.2.0');
    });
  });
});

describe('Type Exports', () => {
  it('should export all common types', async () => {
    const commonTypes = await import('../types/common');
    expect(commonTypes.toRateLimitHeaders).toBeDefined();
    expect(commonTypes.fromRateLimitHeaders).toBeDefined();
  });

  it('should export all error types', async () => {
    const errorTypes = await import('../types/errors');
    expect(errorTypes.ApiErrorCode).toBeDefined();
    expect(errorTypes.createApiError).toBeDefined();
    expect(errorTypes.createValidationError).toBeDefined();
    expect(errorTypes.createRateLimitError).toBeDefined();
  });

  it('should export all model types', async () => {
    const modelTypes = await import('../types/models');
    expect(modelTypes.UserTier).toBeDefined();
    expect(modelTypes.JobStatus).toBeDefined();
    expect(modelTypes.BatchJobStatus).toBeDefined();
    expect(modelTypes.WebhookEvent).toBeDefined();
  });

  it('should export all request types', async () => {
    const requestTypes = await import('../types/requests');
    expect(requestTypes).toBeDefined();
  });

  it('should export all response types', async () => {
    const responseTypes = await import('../types/responses');
    expect(responseTypes.createSuccessResponse).toBeDefined();
    expect(responseTypes.createErrorResponse).toBeDefined();
  });
});

describe('SDK Exports', () => {
  it('should export SDK client interface', async () => {
    const sdkClient = await import('../sdk/client');
    expect(sdkClient).toBeDefined();
  });

  it('should export SDK options', async () => {
    const sdkOptions = await import('../sdk/options');
    expect(sdkOptions.DEFAULT_CLIENT_OPTIONS).toBeDefined();
    expect(sdkOptions.mergeOptions).toBeDefined();
    expect(sdkOptions.validateOptions).toBeDefined();
  });
});

describe('Mock Client', () => {
  it('should export mock client', async () => {
    const mockClient = await import('../mock/mockClient');
    expect(mockClient.MockInfoGraphixClient).toBeDefined();
  });
});
