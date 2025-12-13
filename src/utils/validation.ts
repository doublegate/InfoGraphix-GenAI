/**
 * Validation utilities for form inputs
 * v1.9.0 - TD-020: Extracted magic numbers to constants
 */

import {
  MIN_TOPIC_LENGTH,
  MAX_TOPIC_LENGTH,
  VALID_PROTOCOLS,
  GITHUB_DOMAIN,
  FILE_EXTENSION_PATTERN,
  GITHUB_REPO_PATTERN,
  VALIDATION_ERRORS as ERRORS,
} from '../constants/validation';

/**
 * Validates a URL string
 * @param url - URL string to validate
 * @returns True if valid URL, false otherwise
 */
export function isValidURL(url: string): boolean {
  if (!url || !url.trim()) {
    return false;
  }

  try {
    const urlObj = new URL(url);
    // Must have http or https protocol
    return VALID_PROTOCOLS.includes(urlObj.protocol as typeof VALID_PROTOCOLS[number]);
  } catch {
    return false;
  }
}

/**
 * Validates a GitHub repository identifier
 * Accepts formats:
 * - owner/repo
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 *
 * @param repo - GitHub repository identifier
 * @returns True if valid GitHub repo format, false otherwise
 */
export function isValidGitHubRepo(repo: string): boolean {
  if (!repo || !repo.trim()) {
    return false;
  }

  const trimmed = repo.trim();

  // If it's a URL, extract owner/repo
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      if (url.hostname !== GITHUB_DOMAIN) {
        return false;
      }

      // Extract path (e.g., /owner/repo or /owner/repo.git)
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length !== 2) {
        return false;
      }

      // Remove .git suffix if present
      const repo = pathParts[1].replace(/\.git$/, '');
      const ownerRepo = `${pathParts[0]}/${repo}`;

      return GITHUB_REPO_PATTERN.test(ownerRepo);
    } catch {
      return false;
    }
  }

  // Direct owner/repo format
  return GITHUB_REPO_PATTERN.test(trimmed);
}

/**
 * Validates a date range
 * @param start - Start date in YYYY-MM-DD format
 * @param end - End date in YYYY-MM-DD format
 * @returns True if valid date range (start <= end), false otherwise
 */
export function isValidDateRange(start: string, end: string): boolean {
  if (!start || !end) {
    return false;
  }

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return false;
    }

    // Start must be before or equal to end
    return startDate <= endDate;
  } catch {
    return false;
  }
}

/**
 * Validates a date string (YYYY-MM-DD format)
 * @param date - Date string to validate
 * @returns True if valid date, false otherwise
 */
export function isValidDate(date: string): boolean {
  if (!date || !date.trim()) {
    return false;
  }

  try {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
}

/**
 * Validates a topic/query string
 * @param topic - Topic string to validate
 * @param minLength - Minimum required length (default: 3)
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns True if valid topic, false otherwise
 */
export function isValidTopic(
  topic: string,
  minLength = MIN_TOPIC_LENGTH,
  maxLength = MAX_TOPIC_LENGTH
): boolean {
  if (!topic || !topic.trim()) {
    return false;
  }

  const trimmed = topic.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

/**
 * Validates file extensions list
 * @param extensions - Comma-separated list of file extensions
 * @returns True if valid extensions format, false otherwise
 */
export function isValidFileExtensions(extensions: string): boolean {
  if (!extensions || !extensions.trim()) {
    return true; // Optional field
  }

  return FILE_EXTENSION_PATTERN.test(extensions.trim());
}

/**
 * Validation error messages
 * Re-export from constants for backwards compatibility
 */
export const ValidationErrors = ERRORS;

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Comprehensive form validation
 * @param data - Form data to validate
 * @returns Validation result with detailed errors
 */
export function validateInfographicForm(data: {
  topic: string;
  githubRepo?: string;
  url?: string;
  dateStart?: string;
  dateEnd?: string;
  fileExtensions?: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Validate topic (required)
  if (!isValidTopic(data.topic)) {
    if (!data.topic || !data.topic.trim()) {
      errors.topic = ERRORS.TOPIC_REQUIRED;
    } else if (data.topic.trim().length < MIN_TOPIC_LENGTH) {
      errors.topic = ERRORS.TOPIC_TOO_SHORT;
    } else if (data.topic.trim().length > MAX_TOPIC_LENGTH) {
      errors.topic = ERRORS.TOPIC_TOO_LONG;
    }
  }

  // Validate GitHub repo (optional)
  if (data.githubRepo && !isValidGitHubRepo(data.githubRepo)) {
    errors.githubRepo = ERRORS.GITHUB_REPO_INVALID;
  }

  // Validate URL (optional)
  if (data.url && !isValidURL(data.url)) {
    errors.url = ERRORS.URL_INVALID;
  }

  // Validate date range (optional)
  if (data.dateStart && data.dateEnd) {
    if (!isValidDateRange(data.dateStart, data.dateEnd)) {
      errors.dateRange = ERRORS.DATE_RANGE_INVALID;
    }
  } else if (data.dateStart && !isValidDate(data.dateStart)) {
    errors.dateStart = ERRORS.DATE_INVALID;
  } else if (data.dateEnd && !isValidDate(data.dateEnd)) {
    errors.dateEnd = ERRORS.DATE_INVALID;
  }

  // Validate file extensions (optional)
  if (data.fileExtensions && !isValidFileExtensions(data.fileExtensions)) {
    errors.fileExtensions = ERRORS.FILE_EXTENSIONS_INVALID;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
