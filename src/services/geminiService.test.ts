/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeTopic, generateInfographicImage, getRateLimiter } from './geminiService';
import { InfographicStyle, ColorPalette, ImageSize, AspectRatio } from '../types';
import {
  mockAnalysisResult,
  mockGeminiAnalysisResponse,
  mockGeminiImageResponse,
  mockRateLimitError,
  mockAuthError,
} from '../test/mockData';

// Hoist the mock functions so they can be reconfigured in tests
const { mockGenerateContent, mockGoogleGenAI } = vi.hoisted(() => {
  const mockGenerateContent = vi.fn();
  const mockGoogleGenAI = vi.fn();

  return { mockGenerateContent, mockGoogleGenAI };
});

// Mock the Google Gemini AI SDK
vi.mock('@google/genai', () => ({
  GoogleGenAI: mockGoogleGenAI,
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

// Mock rate limiter
vi.mock('../utils/rateLimiter', () => ({
  createRateLimiter: vi.fn(() => ({
    canMakeRequest: vi.fn(() => true),
    recordRequest: vi.fn(),
    activateCooldown: vi.fn(),
    getTimeUntilReset: vi.fn(() => 60000),
    getRemainingRequests: vi.fn(() => 10),
  })),
}));

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set mock API key
    process.env.API_KEY = 'test-api-key';

    // Reset mock implementations
    mockGenerateContent.mockReset();
    mockGoogleGenAI.mockReset();

    // Set up default mock implementation
    // The actual API uses ai.models.generateContent(), not ai.getGenerativeModel().generateContent()
    mockGoogleGenAI.mockImplementation(function() {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    });
  });

  afterEach(() => {
    delete process.env.API_KEY;
  });

  describe('analyzeTopic', () => {
    it('should analyze a simple text topic', async () => {
      mockGenerateContent.mockResolvedValue(mockGeminiAnalysisResponse);

      const result = await analyzeTopic('Test Topic', InfographicStyle.Modern, ColorPalette.Vibrant);

      expect(result).toBeDefined();
      expect(result.title).toBe(mockAnalysisResult.title);
      expect(result.summary).toBe(mockAnalysisResult.summary);
      expect(result.keyPoints).toEqual(mockAnalysisResult.keyPoints);
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should throw error when API key is missing', async () => {
      delete process.env.API_KEY;

      await expect(analyzeTopic('Test Topic', InfographicStyle.Modern, ColorPalette.Vibrant)).rejects.toThrow(
        'API Key not found'
      );
    });

    it('should handle rate limit errors', async () => {
      mockGenerateContent.mockRejectedValue(mockRateLimitError);

      await expect(analyzeTopic('Test Topic', InfographicStyle.Modern, ColorPalette.Vibrant)).rejects.toThrow(
        /Rate limit exceeded/
      );
    });

    it('should handle authentication errors', async () => {
      mockGenerateContent.mockRejectedValue(mockAuthError);

      await expect(analyzeTopic('Test Topic', InfographicStyle.Modern, ColorPalette.Vibrant)).rejects.toThrow(
        /Permission denied/
      );
    });

    it('should detect and handle GitHub repository URLs', async () => {
      mockGenerateContent.mockResolvedValue(mockGeminiAnalysisResponse);

      await analyzeTopic('https://github.com/test/repo', InfographicStyle.Modern, ColorPalette.Vibrant);

      expect(mockGenerateContent).toHaveBeenCalled();
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents).toContain('github.com');
    });

    it('should handle multiple URLs', async () => {
      mockGenerateContent.mockResolvedValue(mockGeminiAnalysisResponse);

      await analyzeTopic('https://example.com/1\nhttps://example.com/2', InfographicStyle.Modern, ColorPalette.Vibrant);

      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should pass GitHub filters when provided', async () => {
      mockGenerateContent.mockResolvedValue(mockGeminiAnalysisResponse);

      const filters = {
        language: 'TypeScript',
        fileExtensions: '.ts,.tsx',
        lastUpdatedAfter: '2024-01-01',
      };

      await analyzeTopic('https://github.com/test/repo', InfographicStyle.Modern, ColorPalette.Vibrant, filters);

      expect(mockGenerateContent).toHaveBeenCalled();
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents).toContain('TypeScript');
    });
  });

  describe('generateInfographicImage', () => {
    it('should generate an infographic image', async () => {
      mockGenerateContent.mockResolvedValue(mockGeminiImageResponse);

      const result = await generateInfographicImage(
        'Visual plan for the infographic',
        ImageSize.Resolution_2K,
        AspectRatio.Landscape
      );

      expect(result).toContain('data:image/png;base64,');
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should throw error when no candidates in response', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { candidates: [] },
      });

      await expect(
        generateInfographicImage(
          'Visual plan',
          ImageSize.Resolution_2K,
          AspectRatio.Landscape
        )
      ).rejects.toThrow('No image data');
    });

    it('should handle service unavailable errors', async () => {
      const serviceError = Object.assign(new Error('Service unavailable'), {
        status: 503,
      });
      mockGenerateContent.mockRejectedValue(serviceError);

      await expect(
        generateInfographicImage(
          'Visual plan',
          ImageSize.Resolution_2K,
          AspectRatio.Landscape
        )
      ).rejects.toThrow(/overloaded/);
    });
  });

  describe('getRateLimiter', () => {
    it('should return a rate limiter instance', () => {
      const rateLimiter = getRateLimiter();
      expect(rateLimiter).toBeDefined();
      expect(rateLimiter.canMakeRequest).toBeDefined();
      expect(rateLimiter.recordRequest).toBeDefined();
    });

    it('should return the same instance on multiple calls', () => {
      const limiter1 = getRateLimiter();
      const limiter2 = getRateLimiter();
      expect(limiter1).toBe(limiter2);
    });
  });
});
