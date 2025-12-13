import { useState, useCallback } from 'react';
import { validateInfographicForm, ValidationResult } from '../utils/validation';

/**
 * Hook for form validation with real-time error tracking
 * v1.8.0 - TD-031
 *
 * @example
 * ```tsx
 * const { errors, validate, clearError, isValid } = useFormValidation();
 *
 * const handleSubmit = (e) => {
 *   e.preventDefault();
 *   const validation = validate({ topic, githubRepo, url });
 *   if (validation.isValid) {
 *     // Submit form
 *   }
 * };
 *
 * <input
 *   value={topic}
 *   onChange={(e) => {
 *     setTopic(e.target.value);
 *     clearError('topic'); // Clear error on change
 *   }}
 * />
 * {errors.topic && <span className="error">{errors.topic}</span>}
 * ```
 */
export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((data: {
    topic: string;
    githubRepo?: string;
    url?: string;
    dateStart?: string;
    dateEnd?: string;
    fileExtensions?: string;
  }): ValidationResult & { errors: Record<string, string> } => {
    const result = validateInfographicForm(data);
    setErrors(result.errors);
    return result;
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    validate,
    clearError,
    clearAllErrors,
    hasErrors,
    isValid: !hasErrors,
  };
}
