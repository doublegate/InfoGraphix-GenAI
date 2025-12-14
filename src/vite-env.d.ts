/// <reference types="vite/client" />

/**
 * Environment variable types for InfoGraphix AI
 *
 * @since v2.2.0-foundation - Added API mode configuration
 */
interface ImportMetaEnv {
  // ==========================================================================
  // API Mode Configuration (v2.2.0+)
  // ==========================================================================

  /**
   * API Mode: Controls which backend is used for infographic generation
   * - 'gemini'     : Direct Gemini API calls (default)
   * - 'infographix': InfoGraphix AI API (mock for now, production Q2 2026)
   * - 'auto'       : Automatically selects based on available keys
   */
  readonly VITE_API_MODE?: 'gemini' | 'infographix' | 'auto';

  // ==========================================================================
  // Google Gemini API
  // ==========================================================================

  /** Google Gemini API Key */
  readonly VITE_GEMINI_API_KEY?: string;

  // ==========================================================================
  // InfoGraphix AI API (Future - Q2 2026)
  // ==========================================================================

  /** InfoGraphix API Key */
  readonly VITE_INFOGRAPHIX_API_KEY?: string;

  /** InfoGraphix API Base URL (default: https://api.infographix.ai/v1) */
  readonly VITE_INFOGRAPHIX_BASE_URL?: string;

  // ==========================================================================
  // Development Options
  // ==========================================================================

  /** Enable debug logging */
  readonly VITE_DEBUG?: string;

  /** Mock analysis delay in milliseconds */
  readonly VITE_MOCK_ANALYSIS_DELAY?: string;

  /** Mock generation delay in milliseconds */
  readonly VITE_MOCK_GENERATION_DELAY?: string;

  /** Mock error rate (0-1) */
  readonly VITE_MOCK_ERROR_RATE?: string;

  // ==========================================================================
  // Vite Built-in Variables
  // ==========================================================================

  /** True in development mode */
  readonly DEV: boolean;

  /** True in production mode */
  readonly PROD: boolean;

  /** Current mode (development, production, etc.) */
  readonly MODE: string;

  /** Base URL of the application */
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
