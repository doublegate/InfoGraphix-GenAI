import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { GenerationProvider, useGeneration } from './GenerationContext';
import {
  ImageSize,
  AspectRatio,
  InfographicStyle,
  ColorPalette,
  InfographicRequest,
} from '../types';

// Mock geminiService
const mockAnalyzeTopic = vi.fn();
const mockGenerateInfographicImage = vi.fn();

vi.mock('../services/geminiService', () => ({
  analyzeTopic: (...args: unknown[]) => mockAnalyzeTopic(...args),
  generateInfographicImage: (...args: unknown[]) => mockGenerateInfographicImage(...args),
}));

// Mock logger
vi.mock('../utils/logger', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('GenerationContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <GenerationProvider>{children}</GenerationProvider>
  );

  const mockRequest: InfographicRequest = {
    topic: 'Test Topic',
    size: ImageSize.Resolution_2K,
    aspectRatio: AspectRatio.Landscape,
    style: InfographicStyle.Modern,
    palette: ColorPalette.Vibrant,
  };

  const mockAnalysisResult = {
    title: 'Test Title',
    summary: 'Test Summary',
    keyPoints: ['Point 1', 'Point 2'],
    visualPlan: 'Test visual plan',
    webSources: [],
  };

  const mockImageUrl = 'data:image/png;base64,mockImageData';

  beforeEach(() => {
    vi.clearAllMocks();
    mockAnalyzeTopic.mockReset();
    mockGenerateInfographicImage.mockReset();
  });

  describe('useGeneration hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console error during this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useGeneration());
      }).toThrow('useGeneration must be used within GenerationProvider');

      consoleSpy.mockRestore();
    });

    it('should provide context value when used within provider', () => {
      const { result } = renderHook(() => useGeneration(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.processingStep).toBe('idle');
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useGeneration(), { wrapper });

      expect(result.current.processingStep).toBe('idle');
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.currentTopic).toBe('');
      expect(result.current.currentSize).toBe(ImageSize.Resolution_1K);
      expect(result.current.currentRatio).toBe(AspectRatio.Portrait);
      expect(result.current.currentStyle).toBe(InfographicStyle.Modern);
      expect(result.current.currentPalette).toBe(ColorPalette.BlueWhite);
      expect(result.current.currentFilters).toBeUndefined();
      expect(result.current.isCurrentResultSaved).toBe(false);
      expect(result.current.currentFeedback).toBeUndefined();
      expect(result.current.formInitialValues).toBeUndefined();
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useGeneration(), { wrapper });

      expect(typeof result.current.handleGenerate).toBe('function');
      expect(typeof result.current.setIsCurrentResultSaved).toBe('function');
      expect(typeof result.current.setCurrentFeedback).toBe('function');
      expect(typeof result.current.setFormInitialValues).toBe('function');
      expect(typeof result.current.setError).toBe('function');
      expect(typeof result.current.setResult).toBe('function');
      expect(typeof result.current.setProcessingStep).toBe('function');
      expect(typeof result.current.setCurrentTopic).toBe('function');
      expect(typeof result.current.setCurrentSize).toBe('function');
      expect(typeof result.current.setCurrentRatio).toBe('function');
      expect(typeof result.current.setCurrentStyle).toBe('function');
      expect(typeof result.current.setCurrentPalette).toBe('function');
      expect(typeof result.current.setCurrentFilters).toBe('function');
    });
  });

  describe('handleGenerate', () => {
    it('should successfully complete generation flow', async () => {
      mockAnalyzeTopic.mockResolvedValue(mockAnalysisResult);
      mockGenerateInfographicImage.mockResolvedValue(mockImageUrl);

      const { result } = renderHook(() => useGeneration(), { wrapper });

      await act(async () => {
        await result.current.handleGenerate(mockRequest);
      });

      expect(result.current.processingStep).toBe('complete');
      expect(result.current.result).not.toBeNull();
      expect(result.current.result?.imageUrl).toBe(mockImageUrl);
      expect(result.current.error).toBeNull();
    });

    it('should update current context during generation', async () => {
      mockAnalyzeTopic.mockResolvedValue(mockAnalysisResult);
      mockGenerateInfographicImage.mockResolvedValue(mockImageUrl);

      const { result } = renderHook(() => useGeneration(), { wrapper });

      await act(async () => {
        await result.current.handleGenerate(mockRequest);
      });

      expect(result.current.currentTopic).toBe('Test Topic');
      expect(result.current.currentSize).toBe(ImageSize.Resolution_2K);
      expect(result.current.currentRatio).toBe(AspectRatio.Landscape);
      expect(result.current.currentStyle).toBe(InfographicStyle.Modern);
      expect(result.current.currentPalette).toBe(ColorPalette.Vibrant);
    });

    it('should reset saved state when starting new generation', async () => {
      mockAnalyzeTopic.mockResolvedValue(mockAnalysisResult);
      mockGenerateInfographicImage.mockResolvedValue(mockImageUrl);

      const { result } = renderHook(() => useGeneration(), { wrapper });

      // Set saved state
      act(() => {
        result.current.setIsCurrentResultSaved(true);
        result.current.setCurrentFeedback({ id: 'fb1', rating: 5, comment: 'Great', timestamp: Date.now() });
      });

      expect(result.current.isCurrentResultSaved).toBe(true);
      expect(result.current.currentFeedback).toBeDefined();

      // Start new generation
      await act(async () => {
        await result.current.handleGenerate(mockRequest);
      });

      expect(result.current.isCurrentResultSaved).toBe(false);
      expect(result.current.currentFeedback).toBeUndefined();
    });

    it('should handle analysis phase errors', async () => {
      mockAnalyzeTopic.mockRejectedValue(new Error('Analysis failed'));

      const { result } = renderHook(() => useGeneration(), { wrapper });

      await act(async () => {
        await result.current.handleGenerate(mockRequest);
      });

      expect(result.current.processingStep).toBe('idle');
      expect(result.current.error).toBe('Analysis failed');
      expect(result.current.result).toBeNull();
    });

    it('should handle image generation phase errors', async () => {
      mockAnalyzeTopic.mockResolvedValue(mockAnalysisResult);
      mockGenerateInfographicImage.mockRejectedValue(new Error('Image generation failed'));

      const { result } = renderHook(() => useGeneration(), { wrapper });

      await act(async () => {
        await result.current.handleGenerate(mockRequest);
      });

      expect(result.current.processingStep).toBe('idle');
      expect(result.current.error).toBe('Image generation failed');
    });

    it('should handle non-Error exceptions', async () => {
      mockAnalyzeTopic.mockRejectedValue('string error');

      const { result } = renderHook(() => useGeneration(), { wrapper });

      await act(async () => {
        await result.current.handleGenerate(mockRequest);
      });

      expect(result.current.error).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle generation with filters', async () => {
      mockAnalyzeTopic.mockResolvedValue(mockAnalysisResult);
      mockGenerateInfographicImage.mockResolvedValue(mockImageUrl);

      const requestWithFilters: InfographicRequest = {
        ...mockRequest,
        filters: {
          language: 'TypeScript',
          fileExtensions: '.ts,.tsx',
        },
      };

      const { result } = renderHook(() => useGeneration(), { wrapper });

      await act(async () => {
        await result.current.handleGenerate(requestWithFilters);
      });

      expect(result.current.currentFilters).toEqual(requestWithFilters.filters);
      expect(mockAnalyzeTopic).toHaveBeenCalledWith(
        requestWithFilters.topic,
        requestWithFilters.style,
        requestWithFilters.palette,
        requestWithFilters.filters,
        undefined
      );
    });
  });

  describe('state setters', () => {
    it('should update isCurrentResultSaved', () => {
      const { result } = renderHook(() => useGeneration(), { wrapper });

      act(() => {
        result.current.setIsCurrentResultSaved(true);
      });

      expect(result.current.isCurrentResultSaved).toBe(true);
    });

    it('should update currentFeedback', () => {
      const { result } = renderHook(() => useGeneration(), { wrapper });
      const feedback = { id: 'fb1', rating: 4, comment: 'Good', timestamp: Date.now() };

      act(() => {
        result.current.setCurrentFeedback(feedback);
      });

      expect(result.current.currentFeedback).toEqual(feedback);
    });

    it('should update formInitialValues', () => {
      const { result } = renderHook(() => useGeneration(), { wrapper });
      const initialValues = { topic: 'Initial topic' };

      act(() => {
        result.current.setFormInitialValues(initialValues);
      });

      expect(result.current.formInitialValues).toEqual(initialValues);
    });

    it('should update error', () => {
      const { result } = renderHook(() => useGeneration(), { wrapper });

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');
    });

    it('should update result', () => {
      const { result } = renderHook(() => useGeneration(), { wrapper });
      const mockResult = {
        imageUrl: mockImageUrl,
        analysis: mockAnalysisResult,
      };

      act(() => {
        result.current.setResult(mockResult);
      });

      expect(result.current.result).toEqual(mockResult);
    });

    it('should update processingStep', () => {
      const { result } = renderHook(() => useGeneration(), { wrapper });

      act(() => {
        result.current.setProcessingStep('analyzing');
      });

      expect(result.current.processingStep).toBe('analyzing');
    });

    it('should update currentTopic', () => {
      const { result } = renderHook(() => useGeneration(), { wrapper });

      act(() => {
        result.current.setCurrentTopic('New Topic');
      });

      expect(result.current.currentTopic).toBe('New Topic');
    });

    it('should update currentSize', () => {
      const { result } = renderHook(() => useGeneration(), { wrapper });

      act(() => {
        result.current.setCurrentSize(ImageSize.Resolution_4K);
      });

      expect(result.current.currentSize).toBe(ImageSize.Resolution_4K);
    });

    it('should update currentRatio', () => {
      const { result } = renderHook(() => useGeneration(), { wrapper });

      act(() => {
        result.current.setCurrentRatio(AspectRatio.Square);
      });

      expect(result.current.currentRatio).toBe(AspectRatio.Square);
    });

    it('should update currentStyle', () => {
      const { result } = renderHook(() => useGeneration(), { wrapper });

      act(() => {
        result.current.setCurrentStyle(InfographicStyle.Cyberpunk);
      });

      expect(result.current.currentStyle).toBe(InfographicStyle.Cyberpunk);
    });

    it('should update currentPalette', () => {
      const { result } = renderHook(() => useGeneration(), { wrapper });

      act(() => {
        result.current.setCurrentPalette(ColorPalette.Sunset);
      });

      expect(result.current.currentPalette).toBe(ColorPalette.Sunset);
    });

    it('should update currentFilters', () => {
      const { result } = renderHook(() => useGeneration(), { wrapper });
      const filters = { language: 'Python' };

      act(() => {
        result.current.setCurrentFilters(filters);
      });

      expect(result.current.currentFilters).toEqual(filters);
    });
  });

  describe('processing step flow', () => {
    it('should transition through analyzing phase', async () => {
      let resolveAnalysis: (value: typeof mockAnalysisResult) => void;
      mockAnalyzeTopic.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveAnalysis = resolve;
          })
      );

      const { result } = renderHook(() => useGeneration(), { wrapper });

      // Start generation (don't await the inner promise, just the act)
      await act(async () => {
        void result.current.handleGenerate(mockRequest);
      });

      // Wait for analyzing phase
      await waitFor(() => {
        expect(result.current.processingStep).toBe('analyzing');
      });

      // Cleanup
      mockGenerateInfographicImage.mockResolvedValue(mockImageUrl);
      await act(async () => {
        resolveAnalysis!(mockAnalysisResult);
      });
    });
  });
});
