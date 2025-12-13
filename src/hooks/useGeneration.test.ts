import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGeneration, GenerationRequest, GenerationContext } from './useGeneration';
import {
  ImageSize,
  AspectRatio,
  InfographicStyle,
  ColorPalette,
  GeneratedInfographic,
} from '../types';

// Mock geminiService
const mockAnalyzeTopic = vi.fn();
const mockGenerateInfographicImage = vi.fn();

vi.mock('../services/geminiService', () => ({
  analyzeTopic: (...args: unknown[]) => mockAnalyzeTopic(...args),
  generateInfographicImage: (...args: unknown[]) => mockGenerateInfographicImage(...args),
  getRateLimiter: vi.fn(() => ({
    canMakeRequest: () => true,
    recordRequest: vi.fn(),
    getRemainingRequests: () => 10,
  })),
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

describe('useGeneration', () => {
  const mockRequest: GenerationRequest = {
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
    visualPlan: 'Test visual plan for image generation',
    webSources: [],
  };

  const mockImageUrl = 'data:image/png;base64,mockImageData';

  beforeEach(() => {
    vi.clearAllMocks();
    mockAnalyzeTopic.mockReset();
    mockGenerateInfographicImage.mockReset();
  });

  describe('initialization', () => {
    it('should initialize with idle state', () => {
      const { result } = renderHook(() => useGeneration());

      expect(result.current.processingStep).toBe('idle');
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isProcessing).toBe(false);
    });

    it('should initialize with default context values', () => {
      const { result } = renderHook(() => useGeneration());

      expect(result.current.context).toEqual({
        topic: '',
        size: ImageSize.Resolution_1K,
        aspectRatio: AspectRatio.Portrait,
        style: InfographicStyle.Modern,
        palette: ColorPalette.BlueWhite,
      });
    });

    it('should have all required functions', () => {
      const { result } = renderHook(() => useGeneration());

      expect(result.current.generate).toBeDefined();
      expect(typeof result.current.generate).toBe('function');
      expect(result.current.reset).toBeDefined();
      expect(typeof result.current.reset).toBe('function');
      expect(result.current.loadResult).toBeDefined();
      expect(typeof result.current.loadResult).toBe('function');
      expect(result.current.clearError).toBeDefined();
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('generate function', () => {
    it('should successfully complete generation flow', async () => {
      mockAnalyzeTopic.mockResolvedValue(mockAnalysisResult);
      mockGenerateInfographicImage.mockResolvedValue(mockImageUrl);

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.generate(mockRequest);
      });

      expect(result.current.processingStep).toBe('complete');
      expect(result.current.result).not.toBeNull();
      expect(result.current.result?.imageUrl).toBe(mockImageUrl);
      expect(result.current.result?.analysis).toEqual(mockAnalysisResult);
      expect(result.current.error).toBeNull();
    });

    it('should update context during generation', async () => {
      mockAnalyzeTopic.mockResolvedValue(mockAnalysisResult);
      mockGenerateInfographicImage.mockResolvedValue(mockImageUrl);

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.generate(mockRequest);
      });

      expect(result.current.context.topic).toBe('Test Topic');
      expect(result.current.context.size).toBe(ImageSize.Resolution_2K);
      expect(result.current.context.aspectRatio).toBe(AspectRatio.Landscape);
      expect(result.current.context.style).toBe(InfographicStyle.Modern);
      expect(result.current.context.palette).toBe(ColorPalette.Vibrant);
    });

    it('should handle generation with filters', async () => {
      mockAnalyzeTopic.mockResolvedValue(mockAnalysisResult);
      mockGenerateInfographicImage.mockResolvedValue(mockImageUrl);

      const requestWithFilters: GenerationRequest = {
        ...mockRequest,
        filters: {
          language: 'TypeScript',
          fileExtensions: '.ts,.tsx',
        },
      };

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.generate(requestWithFilters);
      });

      expect(mockAnalyzeTopic).toHaveBeenCalledWith(
        requestWithFilters.topic,
        requestWithFilters.style,
        requestWithFilters.palette,
        requestWithFilters.filters,
        undefined
      );
      expect(result.current.context.filters).toEqual(requestWithFilters.filters);
    });

    it('should handle generation with file content', async () => {
      mockAnalyzeTopic.mockResolvedValue(mockAnalysisResult);
      mockGenerateInfographicImage.mockResolvedValue(mockImageUrl);

      const requestWithFile: GenerationRequest = {
        ...mockRequest,
        fileContent: '# Test Markdown\n\nContent here',
      };

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.generate(requestWithFile);
      });

      expect(mockAnalyzeTopic).toHaveBeenCalledWith(
        requestWithFile.topic,
        requestWithFile.style,
        requestWithFile.palette,
        undefined,
        requestWithFile.fileContent
      );
    });

    it('should handle analysis phase errors', async () => {
      const errorMessage = 'Analysis failed';
      mockAnalyzeTopic.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.generate(mockRequest);
      });

      expect(result.current.processingStep).toBe('idle');
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.result).toBeNull();
    });

    it('should handle image generation phase errors', async () => {
      mockAnalyzeTopic.mockResolvedValue(mockAnalysisResult);
      const errorMessage = 'Image generation failed';
      mockGenerateInfographicImage.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.generate(mockRequest);
      });

      expect(result.current.processingStep).toBe('idle');
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.result).toBeNull();
    });

    it('should handle non-Error exceptions', async () => {
      mockAnalyzeTopic.mockRejectedValue('string error');

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.generate(mockRequest);
      });

      expect(result.current.error).toBe('An unexpected error occurred. Please try again.');
    });

    it('should clear previous error when starting new generation', async () => {
      // First, cause an error
      mockAnalyzeTopic.mockRejectedValue(new Error('First error'));

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.generate(mockRequest);
      });

      expect(result.current.error).toBe('First error');

      // Now start a successful generation
      mockAnalyzeTopic.mockResolvedValue(mockAnalysisResult);
      mockGenerateInfographicImage.mockResolvedValue(mockImageUrl);

      await act(async () => {
        await result.current.generate(mockRequest);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset function', () => {
    it('should reset all state to initial values', async () => {
      mockAnalyzeTopic.mockResolvedValue(mockAnalysisResult);
      mockGenerateInfographicImage.mockResolvedValue(mockImageUrl);

      const { result } = renderHook(() => useGeneration());

      // First complete a generation
      await act(async () => {
        await result.current.generate(mockRequest);
      });

      expect(result.current.processingStep).toBe('complete');
      expect(result.current.result).not.toBeNull();

      // Now reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.processingStep).toBe('idle');
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.context).toEqual({
        topic: '',
        size: ImageSize.Resolution_1K,
        aspectRatio: AspectRatio.Portrait,
        style: InfographicStyle.Modern,
        palette: ColorPalette.BlueWhite,
      });
    });
  });

  describe('loadResult function', () => {
    it('should load a previous result', () => {
      const mockLoadedResult: GeneratedInfographic = {
        imageUrl: 'data:image/png;base64,loadedImage',
        analysis: mockAnalysisResult,
      };

      const mockLoadedContext: GenerationContext = {
        topic: 'Loaded Topic',
        size: ImageSize.Resolution_4K,
        aspectRatio: AspectRatio.Square,
        style: InfographicStyle.Cyberpunk,
        palette: ColorPalette.Sunset,
      };

      const { result } = renderHook(() => useGeneration());

      act(() => {
        result.current.loadResult(mockLoadedResult, mockLoadedContext);
      });

      expect(result.current.result).toEqual(mockLoadedResult);
      expect(result.current.context).toEqual(mockLoadedContext);
      expect(result.current.processingStep).toBe('complete');
      expect(result.current.error).toBeNull();
    });

    it('should clear any existing error when loading result', async () => {
      mockAnalyzeTopic.mockRejectedValue(new Error('Previous error'));

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.generate(mockRequest);
      });

      expect(result.current.error).toBe('Previous error');

      const mockLoadedResult: GeneratedInfographic = {
        imageUrl: mockImageUrl,
        analysis: mockAnalysisResult,
      };

      const mockLoadedContext: GenerationContext = {
        topic: 'Loaded Topic',
        size: ImageSize.Resolution_2K,
        aspectRatio: AspectRatio.Landscape,
        style: InfographicStyle.Modern,
        palette: ColorPalette.Vibrant,
      };

      act(() => {
        result.current.loadResult(mockLoadedResult, mockLoadedContext);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('clearError function', () => {
    it('should clear the error state', async () => {
      mockAnalyzeTopic.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.generate(mockRequest);
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should not affect other state when clearing error', async () => {
      mockAnalyzeTopic.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.generate(mockRequest);
      });

      const processingStepBefore = result.current.processingStep;
      const contextBefore = { ...result.current.context };

      act(() => {
        result.current.clearError();
      });

      expect(result.current.processingStep).toBe(processingStepBefore);
      expect(result.current.context).toEqual(contextBefore);
    });
  });

  describe('isProcessing computed property', () => {
    it('should be false when idle', () => {
      const { result } = renderHook(() => useGeneration());

      expect(result.current.isProcessing).toBe(false);
    });

    it('should be false when complete', async () => {
      mockAnalyzeTopic.mockResolvedValue(mockAnalysisResult);
      mockGenerateInfographicImage.mockResolvedValue(mockImageUrl);

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.generate(mockRequest);
      });

      expect(result.current.isProcessing).toBe(false);
    });

    it('should be true during analyzing phase', async () => {
      let resolveAnalysis: (value: typeof mockAnalysisResult) => void;
      mockAnalyzeTopic.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveAnalysis = resolve;
          })
      );

      const { result } = renderHook(() => useGeneration());

      // Start generation (don't await the inner promise, just the act)
      await act(async () => {
        void result.current.generate(mockRequest);
      });

      // Wait for the analyzing phase
      await waitFor(() => {
        expect(result.current.processingStep).toBe('analyzing');
      });

      expect(result.current.isProcessing).toBe(true);

      // Cleanup
      act(() => {
        resolveAnalysis!(mockAnalysisResult);
      });
    });
  });
});
