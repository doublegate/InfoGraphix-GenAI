/**
 * Common types shared across the API.
 * Includes pagination, sorting, filtering, and other utilities.
 *
 * @module api/types/common
 */

/**
 * Pagination parameters for list endpoints.
 *
 * Supports both offset-based and cursor-based pagination.
 */
export interface PaginationParams {
  /** Page number (1-indexed). Used for offset-based pagination. */
  page?: number;
  /** Number of items per page (default: 20, max: 100) */
  pageSize?: number;
  /** Cursor for cursor-based pagination (alternative to page) */
  cursor?: string;
}

/**
 * Pagination metadata in response.
 *
 * Provides information about current page position and navigation.
 */
export interface PaginationMeta {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrevious: boolean;
  /** Cursor for the next page (cursor-based pagination) */
  nextCursor?: string;
  /** Cursor for the previous page (cursor-based pagination) */
  previousCursor?: string;
}

/**
 * Generic paginated response wrapper.
 *
 * @template T - The type of items in the data array
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  data: T[];
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * Sort order for list endpoints.
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Generic sorting parameters.
 *
 * @template T - The type containing the sortable fields
 */
export interface SortParams<T extends string = string> {
  /** Field to sort by */
  field: T;
  /** Sort order (ascending or descending) */
  order: SortOrder;
}

/**
 * Date range filter.
 *
 * Used for filtering items by creation date, update date, etc.
 */
export interface DateRangeFilter {
  /** Start date (ISO 8601 format) */
  start: string;
  /** End date (ISO 8601 format) */
  end: string;
}

/**
 * Response metadata.
 *
 * Included in all API responses for debugging and versioning.
 */
export interface ResponseMeta {
  /** API version */
  version: string;
  /** Request ID for tracking and debugging */
  requestId?: string;
  /** ISO 8601 timestamp of the response */
  timestamp: string;
  /** Deprecation warnings if any */
  deprecations?: DeprecationInfo[];
}

/**
 * Deprecation information for API fields or endpoints.
 *
 * Used to communicate upcoming breaking changes to API consumers.
 */
export interface DeprecationInfo {
  /** Deprecated field or endpoint */
  field: string;
  /** Version when deprecation was introduced */
  deprecatedSince: string;
  /** Version when the field/endpoint will be removed */
  removeInVersion: string;
  /** Suggested replacement field or endpoint */
  replacement?: string;
  /** Additional deprecation message */
  message: string;
}

/**
 * Rate limit information.
 *
 * Included in response headers and quota endpoints.
 */
export interface RateLimitInfo {
  /** Request rate limits (per minute) */
  rateLimit: {
    /** Maximum requests per minute for this tier */
    limit: number;
    /** Remaining requests in current window */
    remaining: number;
    /** Unix timestamp when the rate limit window resets */
    reset: number;
  };

  /** Daily quota limits */
  quota: {
    /** Maximum generations per day (-1 for unlimited) */
    limit: number;
    /** Remaining generations in current day */
    remaining: number;
    /** Unix timestamp when the daily quota resets */
    reset: number;
  };
}

/**
 * Convert rate limit info to HTTP headers.
 *
 * @param info - Rate limit information
 * @returns HTTP headers object
 */
export function toRateLimitHeaders(info: RateLimitInfo): Record<string, string> {
  return {
    'X-RateLimit-Limit': info.rateLimit.limit.toString(),
    'X-RateLimit-Remaining': info.rateLimit.remaining.toString(),
    'X-RateLimit-Reset': info.rateLimit.reset.toString(),
    'X-Quota-Limit': info.quota.limit.toString(),
    'X-Quota-Remaining': info.quota.remaining.toString(),
    'X-Quota-Reset': info.quota.reset.toString(),
  };
}

/**
 * Parse rate limit headers into RateLimitInfo.
 *
 * @param headers - HTTP response headers
 * @returns Parsed rate limit information
 */
export function fromRateLimitHeaders(headers: Record<string, string>): RateLimitInfo {
  return {
    rateLimit: {
      limit: parseInt(headers['X-RateLimit-Limit'] || '0', 10),
      remaining: parseInt(headers['X-RateLimit-Remaining'] || '0', 10),
      reset: parseInt(headers['X-RateLimit-Reset'] || '0', 10),
    },
    quota: {
      limit: parseInt(headers['X-Quota-Limit'] || '0', 10),
      remaining: parseInt(headers['X-Quota-Remaining'] || '0', 10),
      reset: parseInt(headers['X-Quota-Reset'] || '0', 10),
    },
  };
}
