/**
 * Error types and codes for the InfoGraphix AI API.
 *
 * Provides comprehensive error handling with specific error codes
 * for different failure scenarios.
 *
 * @module api/types/errors
 */

/**
 * API error codes.
 *
 * Each error code maps to a specific HTTP status code and represents
 * a distinct error condition.
 */
export enum ApiErrorCode {
  // Authentication errors (401)
  /** Authentication is required but not provided */
  UNAUTHORIZED = 'UNAUTHORIZED',
  /** The provided API key is invalid or malformed */
  INVALID_API_KEY = 'INVALID_API_KEY',
  /** The authentication token has expired */
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',

  // Permission errors (403)
  /** Access to the requested resource is forbidden */
  FORBIDDEN = 'FORBIDDEN',
  /** The authenticated user lacks required permissions */
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Rate limiting errors (429)
  /** Rate limit has been exceeded */
  RATE_LIMITED = 'RATE_LIMITED',
  /** Daily or monthly quota has been exceeded */
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',

  // Validation errors (400)
  /** The request is invalid or malformed */
  INVALID_REQUEST = 'INVALID_REQUEST',
  /** One or more request parameters are invalid */
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  /** A required field is missing from the request */
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  /** The provided value is out of acceptable range */
  VALUE_OUT_OF_RANGE = 'VALUE_OUT_OF_RANGE',

  // Resource errors (404)
  /** The requested resource was not found */
  NOT_FOUND = 'NOT_FOUND',
  /** The specified template was not found */
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  /** The specified job was not found */
  JOB_NOT_FOUND = 'JOB_NOT_FOUND',
  /** The specified batch was not found */
  BATCH_NOT_FOUND = 'BATCH_NOT_FOUND',
  /** The specified webhook was not found */
  WEBHOOK_NOT_FOUND = 'WEBHOOK_NOT_FOUND',

  // Conflict errors (409)
  /** The resource already exists */
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  /** The resource is in an invalid state for this operation */
  INVALID_STATE = 'INVALID_STATE',

  // Generation errors (500)
  /** Infographic generation failed */
  GENERATION_FAILED = 'GENERATION_FAILED',
  /** Topic analysis phase failed */
  ANALYSIS_FAILED = 'ANALYSIS_FAILED',
  /** Image generation phase failed */
  IMAGE_GENERATION_FAILED = 'IMAGE_GENERATION_FAILED',
  /** Batch processing failed */
  BATCH_PROCESSING_FAILED = 'BATCH_PROCESSING_FAILED',

  // External service errors (502, 503)
  /** The service is temporarily unavailable */
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  /** Error communicating with Gemini API */
  GEMINI_API_ERROR = 'GEMINI_API_ERROR',
  /** Error communicating with external service */
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Internal errors (500)
  /** An unexpected internal error occurred */
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  /** Database operation failed */
  DATABASE_ERROR = 'DATABASE_ERROR',
  /** Configuration error */
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

/**
 * Maps error codes to HTTP status codes.
 */
export const ErrorCodeToHttpStatus: Record<ApiErrorCode, number> = {
  // 401 Unauthorized
  [ApiErrorCode.UNAUTHORIZED]: 401,
  [ApiErrorCode.INVALID_API_KEY]: 401,
  [ApiErrorCode.EXPIRED_TOKEN]: 401,

  // 403 Forbidden
  [ApiErrorCode.FORBIDDEN]: 403,
  [ApiErrorCode.INSUFFICIENT_PERMISSIONS]: 403,

  // 429 Too Many Requests
  [ApiErrorCode.RATE_LIMITED]: 429,
  [ApiErrorCode.QUOTA_EXCEEDED]: 429,

  // 400 Bad Request
  [ApiErrorCode.INVALID_REQUEST]: 400,
  [ApiErrorCode.INVALID_PARAMETER]: 400,
  [ApiErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ApiErrorCode.VALUE_OUT_OF_RANGE]: 400,

  // 404 Not Found
  [ApiErrorCode.NOT_FOUND]: 404,
  [ApiErrorCode.TEMPLATE_NOT_FOUND]: 404,
  [ApiErrorCode.JOB_NOT_FOUND]: 404,
  [ApiErrorCode.BATCH_NOT_FOUND]: 404,
  [ApiErrorCode.WEBHOOK_NOT_FOUND]: 404,

  // 409 Conflict
  [ApiErrorCode.ALREADY_EXISTS]: 409,
  [ApiErrorCode.INVALID_STATE]: 409,

  // 500 Internal Server Error
  [ApiErrorCode.GENERATION_FAILED]: 500,
  [ApiErrorCode.ANALYSIS_FAILED]: 500,
  [ApiErrorCode.IMAGE_GENERATION_FAILED]: 500,
  [ApiErrorCode.BATCH_PROCESSING_FAILED]: 500,
  [ApiErrorCode.INTERNAL_ERROR]: 500,
  [ApiErrorCode.DATABASE_ERROR]: 500,
  [ApiErrorCode.CONFIGURATION_ERROR]: 500,

  // 502 Bad Gateway
  [ApiErrorCode.EXTERNAL_SERVICE_ERROR]: 502,

  // 503 Service Unavailable
  [ApiErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ApiErrorCode.GEMINI_API_ERROR]: 503,
};

/**
 * API error response.
 *
 * Returned when an API request fails for any reason.
 */
export interface ApiError {
  /** Error code identifying the type of error */
  code: ApiErrorCode;
  /** Human-readable error message */
  message: string;
  /** Additional error details (field-specific errors, debugging info, etc.) */
  details?: Record<string, unknown>;
  /** ISO 8601 timestamp when the error occurred */
  timestamp: string;
  /** Unique request ID for debugging */
  requestId?: string;
  /** HTTP status code */
  statusCode?: number;
}

/**
 * Validation error details.
 *
 * Used in ApiError.details when validation fails.
 */
export interface ValidationError {
  /** Field that failed validation */
  field: string;
  /** Validation error message */
  message: string;
  /** The value that failed validation */
  value?: unknown;
  /** Expected value or constraint */
  expected?: string;
}

/**
 * Rate limit error details.
 *
 * Used in ApiError.details for rate limit errors.
 */
export interface RateLimitErrorDetails extends Record<string, unknown> {
  /** Type of limit that was exceeded */
  limitType: 'rate' | 'quota';
  /** Current limit value */
  limit: number;
  /** How many requests were made */
  current: number;
  /** Unix timestamp when the limit resets */
  resetAt: number;
  /** Seconds to wait before retry */
  retryAfter: number;
}

/**
 * Create a standardized API error.
 *
 * @param code - Error code
 * @param message - Error message
 * @param details - Optional error details
 * @param requestId - Optional request ID
 * @returns Formatted API error
 */
export function createApiError(
  code: ApiErrorCode,
  message: string,
  details?: Record<string, unknown>,
  requestId?: string
): ApiError {
  return {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
    requestId,
    statusCode: ErrorCodeToHttpStatus[code],
  };
}

/**
 * Create a validation error.
 *
 * @param errors - Array of validation errors
 * @param requestId - Optional request ID
 * @returns Formatted API error
 */
export function createValidationError(
  errors: ValidationError[],
  requestId?: string
): ApiError {
  return createApiError(
    ApiErrorCode.INVALID_REQUEST,
    'Request validation failed',
    { validationErrors: errors },
    requestId
  );
}

/**
 * Create a rate limit error.
 *
 * @param details - Rate limit error details
 * @param requestId - Optional request ID
 * @returns Formatted API error
 */
export function createRateLimitError(
  details: RateLimitErrorDetails,
  requestId?: string
): ApiError {
  const message =
    details.limitType === 'rate'
      ? `Rate limit exceeded. Please retry after ${details.retryAfter} seconds.`
      : `Quota exceeded. Resets at ${new Date(details.resetAt * 1000).toISOString()}.`;

  return createApiError(
    details.limitType === 'rate' ? ApiErrorCode.RATE_LIMITED : ApiErrorCode.QUOTA_EXCEEDED,
    message,
    details,
    requestId
  );
}
