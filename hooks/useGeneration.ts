import { useState, useCallback } from 'react';
import {
  AspectRatio,
  ColorPalette,
  GeneratedInfographic,
  GithubFilters,
  ImageSize,
  InfographicStyle,
} from '../types';
import { analyzeTopic, generateInfographicImage } from '../services/geminiService';

/**
 * Processing step states
 */
export type ProcessingStep = 'idle' | 'analyzing' | 'generating' | 'complete';

/**
 * Generation request parameters
 */
export interface GenerationRequest {
  topic: string;
  size: ImageSize;
  aspectRatio: AspectRatio;
  style: InfographicStyle;
  palette: ColorPalette;
  filters?: GithubFilters;
  fileContent?: string;
}

/**
 * Current generation context (for saving/display)
 */
export interface GenerationContext {
  topic: string;
  size: ImageSize;
  aspectRatio: AspectRatio;
  style: InfographicStyle;
  palette: ColorPalette;
  filters?: GithubFilters;
}

/**
 * Return type for useGeneration hook
 */
interface UseGenerationReturn {
  /** Current processing step */
  processingStep: ProcessingStep;
  /** Generated result (null until complete) */
  result: GeneratedInfographic | null;
  /** Error message if generation failed */
  error: string | null;
  /** Current generation context for saving */
  context: GenerationContext;
  /** Whether currently processing */
  isProcessing: boolean;
  /** Start a new generation */
  generate: (request: GenerationRequest) => Promise<void>;
  /** Load a previous result (from version history) */
  loadResult: (result: GeneratedInfographic, context: GenerationContext) => void;
  /** Reset to idle state */
  reset: () => void;
  /** Clear the current error */
  clearError: () => void;
}

/**
 * Custom hook for managing the infographic generation workflow.
 *
 * Handles the two-phase AI pipeline:
 * 1. Topic analysis with Gemini 3 Pro (thinking mode)
 * 2. Image generation with Nano Banana Pro
 *
 * @example
 * ```tsx
 * const { generate, result, processingStep, error } = useGeneration();
 *
 * const handleSubmit = async (formData) => {
 *   await generate({
 *     topic: formData.topic,
 *     size: formData.size,
 *     aspectRatio: formData.aspectRatio,
 *     style: formData.style,
 *     palette: formData.palette,
 *   });
 * };
 * ```
 */
export function useGeneration(): UseGenerationReturn {
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [result, setResult] = useState<GeneratedInfographic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<GenerationContext>({
    topic: '',
    size: ImageSize.Resolution_1K,
    aspectRatio: AspectRatio.Portrait,
    style: InfographicStyle.Modern,
    palette: ColorPalette.BlueWhite,
  });

  /**
   * Whether the hook is currently processing
   */
  const isProcessing = processingStep === 'analyzing' || processingStep === 'generating';

  /**
   * Start a new infographic generation
   */
  const generate = useCallback(async (request: GenerationRequest): Promise<void> => {
    // Reset state
    setError(null);
    setResult(null);

    // Update context
    setContext({
      topic: request.topic,
      size: request.size,
      aspectRatio: request.aspectRatio,
      style: request.style,
      palette: request.palette,
      filters: request.filters,
    });

    // Phase 1: Analysis
    setProcessingStep('analyzing');

    try {
      const analysis = await analyzeTopic(
        request.topic,
        request.style,
        request.palette,
        request.filters,
        request.fileContent
      );

      // Phase 2: Image Generation
      setProcessingStep('generating');

      const imageUrl = await generateInfographicImage(
        analysis.visualPlan,
        request.size,
        request.aspectRatio
      );

      // Success
      setResult({
        imageUrl,
        analysis,
      });
      setProcessingStep('complete');
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'An unexpected error occurred. Please try again.';

      console.error('Generation error:', err);
      setError(message);
      setProcessingStep('idle');
    }
  }, []);

  /**
   * Load a previous result (from version history)
   */
  const loadResult = useCallback((
    loadedResult: GeneratedInfographic,
    loadedContext: GenerationContext
  ): void => {
    setResult(loadedResult);
    setContext(loadedContext);
    setError(null);
    setProcessingStep('complete');
  }, []);

  /**
   * Reset to idle state
   */
  const reset = useCallback((): void => {
    setProcessingStep('idle');
    setResult(null);
    setError(null);
    setContext({
      topic: '',
      size: ImageSize.Resolution_1K,
      aspectRatio: AspectRatio.Portrait,
      style: InfographicStyle.Modern,
      palette: ColorPalette.BlueWhite,
    });
  }, []);

  /**
   * Clear the current error
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    processingStep,
    result,
    error,
    context,
    isProcessing,
    generate,
    loadResult,
    reset,
    clearError,
  };
}

export default useGeneration;
