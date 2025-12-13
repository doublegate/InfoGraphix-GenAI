/**
 * Validation Constants
 * v1.9.0 - TD-020: Extract magic numbers to named constants
 *
 * Defines validation rules and constraints for form inputs
 */

/**
 * Minimum length for topic/query strings (in characters).
 * Topics shorter than this are rejected.
 *
 * Rationale: 3 characters is the minimum to form a meaningful query.
 * Single characters or two-letter abbreviations are too vague for
 * AI-powered content generation.
 */
export const MIN_TOPIC_LENGTH = 3;

/**
 * Maximum length for topic/query strings (in characters).
 * Topics longer than this are rejected to prevent excessive API costs.
 *
 * Rationale: 1000 characters is ~150-200 words, more than enough for
 * a detailed topic description. Gemini has token limits, and very long
 * prompts increase cost without improving quality.
 */
export const MAX_TOPIC_LENGTH = 1000;

/**
 * Supported protocols for URL validation
 */
export const VALID_PROTOCOLS = ['http:', 'https:'] as const;

/**
 * GitHub domain for repository validation
 */
export const GITHUB_DOMAIN = 'github.com';

/**
 * File extension validation pattern
 * Matches comma-separated extensions with optional dots
 * Examples: "js,ts,tsx" or ".js,.ts,.tsx"
 */
export const FILE_EXTENSION_PATTERN = /^\.?[a-zA-Z0-9]+(,\s*\.?[a-zA-Z0-9]+)*$/;

/**
 * GitHub repository pattern (owner/repo format)
 * Matches alphanumeric characters, underscores, hyphens, and dots
 * Examples: "facebook/react", "vercel/next.js"
 */
export const GITHUB_REPO_PATTERN = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

/**
 * Validation error messages
 */
export const VALIDATION_ERRORS = {
  URL_INVALID: 'Please enter a valid URL starting with http:// or https://',
  GITHUB_REPO_INVALID:
    'Please enter a valid GitHub repository (e.g., owner/repo or https://github.com/owner/repo)',
  DATE_RANGE_INVALID: 'End date must be after or equal to start date',
  DATE_INVALID: 'Please enter a valid date in YYYY-MM-DD format',
  TOPIC_TOO_SHORT: `Topic must be at least ${MIN_TOPIC_LENGTH} characters long`,
  TOPIC_TOO_LONG: `Topic must be less than ${MAX_TOPIC_LENGTH} characters`,
  TOPIC_REQUIRED: 'Topic is required',
  FILE_EXTENSIONS_INVALID: 'Please enter valid file extensions (e.g., js,ts,tsx)',
} as const;
