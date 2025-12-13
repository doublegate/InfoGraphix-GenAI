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

// Mock the Google Gemini AI SDK
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn(),
    }),
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
  });

  afterEach(() => {
    delete process.env.API_KEY;
  });

  describe('analyzeTopic', () => {
    it('should analyze a simple text topic', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockGeminiAnalysisResponse);

      (GoogleGenAI as any).mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      }));

      const result = await analyzeTopic('Test Topic');

      expect(result).toBeDefined();
      expect(result.title).toBe(mockAnalysisResult.title);
      expect(result.summary).toBe(mockAnalysisResult.summary);
      expect(result.keyPoints).toEqual(mockAnalysisResult.keyPoints);
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should throw error when API key is missing', async () => {
      delete process.env.API_KEY;

      await expect(analyzeTopic('Test Topic')).rejects.toThrow(
        'API Key not found'
      );
    });

    it('should handle rate limit errors', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockRejectedValue(mockRateLimitError);

      (GoogleGenAI as any).mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      }));

      await expect(analyzeTopic('Test Topic')).rejects.toThrow(
        /Rate limit exceeded/
      );
    });

    it('should handle authentication errors', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockRejectedValue(mockAuthError);

      (GoogleGenAI as any).mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      }));

      await expect(analyzeTopic('Test Topic')).rejects.toThrow(
        /Permission denied/
      );
    });

    it('should detect and handle GitHub repository URLs', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockGeminiAnalysisResponse);

      (GoogleGenAI as any).mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      }));

      await analyzeTopic('https://github.com/test/repo');

      expect(mockGenerateContent).toHaveBeenCalled();
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs).toContain('github.com');
    });

    it('should handle multiple URLs', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockGeminiAnalysisResponse);

      (GoogleGenAI as any).mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      }));

      await analyzeTopic('https://example.com/1\nhttps://example.com/2');

      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should pass GitHub filters when provided', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockGeminiAnalysisResponse);

      (GoogleGenAI as any).mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      }));

      const filters = {
        language: 'TypeScript',
        extensions: ['.ts', '.tsx'],
        excludePaths: ['node_modules'],
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      await analyzeTopic('https://github.com/test/repo', filters);

      expect(mockGenerateContent).toHaveBeenCalled();
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs).toContain('TypeScript');
    });
  });

  describe('generateInfographicImage', () => {
    it('should generate an infographic image', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue(mockGeminiImageResponse);

      (GoogleGenAI as any).mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      }));

      const result = await generateInfographicImage(
        'Test title',
        ['Point 1', 'Point 2'],
        'Visual plan',
        InfographicStyle.Modern,
        ColorPalette.Vibrant,
        ImageSize.Resolution_2K,
        AspectRatio.Landscape
      );

      expect(result).toContain('data:image/png;base64,');
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should throw error when no candidates in response', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const mockGenerateContent = vi.fn().mockResolvedValue({
        response: { candidates: [] },
      });

      (GoogleGenAI as any).mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      }));

      await expect(
        generateInfographicImage(
          'Test',
          ['Point'],
          'Plan',
          InfographicStyle.Modern,
          ColorPalette.Vibrant,
          ImageSize.Resolution_2K,
          AspectRatio.Landscape
        )
      ).rejects.toThrow('No image data');
    });

    it('should handle service unavailable errors', async () => {
      const { GoogleGenAI } = await import('@google/genai');
      const serviceError = Object.assign(new Error('Service unavailable'), {
        status: 503,
      });
      const mockGenerateContent = vi.fn().mockRejectedValue(serviceError);

      (GoogleGenAI as any).mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      }));

      await expect(
        generateInfographicImage(
          'Test',
          ['Point'],
          'Plan',
          InfographicStyle.Modern,
          ColorPalette.Vibrant,
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
