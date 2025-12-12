/**
 * Custom React Hooks for InfoGraphix AI
 *
 * These hooks extract and organize state management logic from App.tsx,
 * making the codebase more maintainable and testable.
 */

export { useVersionHistory } from './useVersionHistory';
export { useGeneration } from './useGeneration';
export { useFormPersistence, DEFAULT_FORM_VALUES } from './useFormPersistence';

// Re-export types
export type { ProcessingStep, GenerationRequest, GenerationContext } from './useGeneration';
export type { FormValues } from './useFormPersistence';
