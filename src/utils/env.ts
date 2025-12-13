/**
 * Environment Variable Validation Utility
 *
 * Validates required environment variables at application startup.
 * Only runs in development mode to avoid production overhead.
 *
 * @module utils/env
 */

import { log } from './logger';

interface EnvironmentVariable {
  key: string;
  required: boolean;
  description: string;
}

/**
 * List of environment variables used by the application
 */
const ENVIRONMENT_VARIABLES: EnvironmentVariable[] = [
  {
    key: 'VITE_GEMINI_API_KEY',
    required: false, // Optional in dev, can use AI Studio API key instead
    description: 'Google Gemini API key for AI generation (optional if using AI Studio)',
  },
];

/**
 * Validates environment variables and logs warnings/errors in development mode
 *
 * @throws {Error} If required environment variables are missing in development
 */
export function validateEnvironment(): void {
  // Only run validation in development mode
  if (!import.meta.env.DEV) {
    return;
  }

  const missing: EnvironmentVariable[] = [];
  const warnings: EnvironmentVariable[] = [];

  for (const envVar of ENVIRONMENT_VARIABLES) {
    const value = import.meta.env[envVar.key];

    if (!value || value === '') {
      if (envVar.required) {
        missing.push(envVar);
      } else {
        warnings.push(envVar);
      }
    }
  }

  // Log warnings for optional variables
  if (warnings.length > 0) {
    log.warn('[Environment] Optional environment variables not set:');
    warnings.forEach(envVar => {
      log.warn(`  - ${envVar.key}: ${envVar.description}`);
    });
  }

  // Throw error for required variables
  if (missing.length > 0) {
    const missingKeys = missing.map(v => v.key).join(', ');
    log.error('[Environment] Missing required environment variables:');
    missing.forEach(envVar => {
      log.error(`  - ${envVar.key}: ${envVar.description}`);
    });
    throw new Error(
      `Missing required environment variables: ${missingKeys}\n` +
      'Please check .env.local file or refer to .env.example for setup instructions.'
    );
  }

  // Success message
  log.info('[Environment] ✓ Environment validation passed');
}

/**
 * Gets an environment variable value with type safety
 *
 * @param key - Environment variable key
 * @param fallback - Fallback value if variable is not set
 * @returns Environment variable value or fallback
 */
export function getEnv(key: string, fallback = ''): string {
  return import.meta.env[key] || fallback;
}

/**
 * Checks if a specific environment variable is set
 *
 * @param key - Environment variable key
 * @returns True if variable is set and non-empty
 */
export function hasEnv(key: string): boolean {
  const value = import.meta.env[key];
  return value !== undefined && value !== '';
}
