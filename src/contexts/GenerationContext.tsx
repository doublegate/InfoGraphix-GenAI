/**
 * Generation Context - v1.8.0 TD-006
 * Provides generation state to components without prop drilling
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { log } from '../utils/logger';
import {
  GeneratedInfographic,
  InfographicRequest,
  ImageSize,
  AspectRatio,
  InfographicStyle,
  ColorPalette,
  GithubFilters,
  Feedback
} from '../types';
import { analyzeTopic, generateInfographicImage } from '../services/geminiService';

type ProcessingStep = 'idle' | 'analyzing' | 'generating' | 'complete';

interface GenerationState {
  // Processing state
  processingStep: ProcessingStep;
  result: GeneratedInfographic | null;
  error: string | null;

  // Current request context
  currentTopic: string;
  currentSize: ImageSize;
  currentRatio: AspectRatio;
  currentStyle: InfographicStyle;
  currentPalette: ColorPalette;
  currentFilters: GithubFilters | undefined;

  // UI state
  isCurrentResultSaved: boolean;
  currentFeedback: Feedback | undefined;
  formInitialValues: Partial<InfographicRequest> | undefined;
}

interface GenerationContextValue extends GenerationState {
  // Actions
  handleGenerate: (request: InfographicRequest) => Promise<void>;
  setIsCurrentResultSaved: (saved: boolean) => void;
  setCurrentFeedback: (feedback: Feedback | undefined) => void;
  setFormInitialValues: (values: Partial<InfographicRequest> | undefined) => void;
  setError: (error: string | null) => void;
  setResult: (result: GeneratedInfographic | null) => void;
  setProcessingStep: (step: ProcessingStep) => void;
  setCurrentTopic: (topic: string) => void;
  setCurrentSize: (size: ImageSize) => void;
  setCurrentRatio: (ratio: AspectRatio) => void;
  setCurrentStyle: (style: InfographicStyle) => void;
  setCurrentPalette: (palette: ColorPalette) => void;
  setCurrentFilters: (filters: GithubFilters | undefined) => void;
}

const GenerationContext = createContext<GenerationContextValue | undefined>(undefined);

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [result, setResult] = useState<GeneratedInfographic | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [currentTopic, setCurrentTopic] = useState('');
  const [currentSize, setCurrentSize] = useState<ImageSize>(ImageSize.Resolution_1K);
  const [currentRatio, setCurrentRatio] = useState<AspectRatio>(AspectRatio.Portrait);
  const [currentStyle, setCurrentStyle] = useState<InfographicStyle>(InfographicStyle.Modern);
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(ColorPalette.BlueWhite);
  const [currentFilters, setCurrentFilters] = useState<GithubFilters | undefined>(undefined);

  const [isCurrentResultSaved, setIsCurrentResultSaved] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | undefined>(undefined);
  const [formInitialValues, setFormInitialValues] = useState<Partial<InfographicRequest> | undefined>(undefined);

  const handleGenerate = useCallback(async (request: InfographicRequest) => {
    setError(null);
    setResult(null);
    setCurrentFeedback(undefined);
    setIsCurrentResultSaved(false);

    // Update current context
    setCurrentTopic(request.topic);
    setCurrentSize(request.size);
    setCurrentRatio(request.aspectRatio);
    setCurrentStyle(request.style);
    setCurrentPalette(request.palette);
    setCurrentFilters(request.filters);

    setProcessingStep('analyzing');

    try {
      // Step 1: Deep Analysis with Thinking Model
      const analysis = await analyzeTopic(
        request.topic,
        request.style,
        request.palette,
        request.filters,
        request.fileContent
      );

      setProcessingStep('generating');

      // Step 2: Image Generation with Nano Banana Pro
      const imageUrl = await generateInfographicImage(
        analysis.visualPlan,
        request.size,
        request.aspectRatio
      );

      setResult({
        imageUrl,
        analysis
      });
      setProcessingStep('complete');
    } catch (err: unknown) {
      log.error(err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(message);
      setProcessingStep('idle');
    }
  }, []);

  const value: GenerationContextValue = {
    processingStep,
    result,
    error,
    currentTopic,
    currentSize,
    currentRatio,
    currentStyle,
    currentPalette,
    currentFilters,
    isCurrentResultSaved,
    currentFeedback,
    formInitialValues,
    handleGenerate,
    setIsCurrentResultSaved,
    setCurrentFeedback,
    setFormInitialValues,
    setError,
    setResult,
    setProcessingStep,
    setCurrentTopic,
    setCurrentSize,
    setCurrentRatio,
    setCurrentStyle,
    setCurrentPalette,
    setCurrentFilters
  };

  return (
    <GenerationContext.Provider value={value}>
      {children}
    </GenerationContext.Provider>
  );
}

export function useGeneration() {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error('useGeneration must be used within GenerationProvider');
  }
  return context;
}
