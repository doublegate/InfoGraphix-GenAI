/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';
import {
  InfographicRequest,
  AnalysisResult,
  SavedVersion,
  ImageSize,
  AspectRatio,
  InfographicStyle,
  ColorPalette,
} from '../types';

/**
 * Mock data for testing
 */

export const mockInfographicRequest: InfographicRequest = {
  topic: 'Test Topic',
  size: ImageSize.Resolution_2K,
  aspectRatio: AspectRatio.Landscape,
  style: InfographicStyle.Modern,
  palette: ColorPalette.Vibrant,
};

export const mockAnalysisResult: AnalysisResult = {
  title: 'Test Infographic',
  summary: 'This is a test summary of the infographic topic.',
  keyPoints: [
    'Key point 1',
    'Key point 2',
    'Key point 3',
  ],
  visualPlan: 'A modern infographic design with vibrant colors.',
  webSources: [
    {
      uri: 'https://example.com/source1',
      title: 'Source 1',
    },
  ],
};

export const mockSavedVersion: SavedVersion = {
  id: 'test-id-123',
  timestamp: Date.now(),
  topic: mockInfographicRequest.topic,
  size: mockInfographicRequest.size,
  aspectRatio: mockInfographicRequest.aspectRatio,
  style: mockInfographicRequest.style,
  palette: mockInfographicRequest.palette,
  data: {
    imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    analysis: mockAnalysisResult,
  },
};

export const mockTemplate = {
  id: 'test-template',
  name: 'Test Template',
  category: 'Business',
  description: 'A test template for business infographics',
  settings: {
    style: InfographicStyle.Modern,
    palette: ColorPalette.BlueWhite,
    aspectRatio: AspectRatio.Landscape,
    size: ImageSize.Resolution_2K,
  },
  previewUrl: 'https://example.com/preview.png',
  prompt: 'Create a professional business infographic',
  tags: ['business', 'professional', 'test'],
  isCustom: false,
  createdAt: Date.now(),
};

export const mockCustomTemplate = {
  ...mockTemplate,
  id: 'custom-template',
  name: 'Custom Test Template',
  isCustom: true,
};

/**
 * Mock Gemini API responses
 */
export const mockGeminiAnalysisResponse = {
  text: JSON.stringify(mockAnalysisResult),
  candidates: [{
    groundingMetadata: {
      groundingChunks: [],
    },
  }],
};

export const mockGeminiImageResponse = {
  candidates: [
    {
      content: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            },
          },
        ],
      },
    },
  ],
};

/**
 * Mock error responses
 */
export const mockApiError = new Error('API Error');
export const mockRateLimitError = Object.assign(new Error('Rate limit exceeded'), {
  status: 429,
});
export const mockAuthError = Object.assign(new Error('403 Authentication failed'), {
  status: 403,
});

/**
 * Mock IndexedDB data
 */
export const mockIDBRequest = {
  result: null,
  error: null,
  onsuccess: null as any,
  onerror: null as any,
};

export const mockIDBDatabase = {
  createObjectStore: vi.fn(),
  transaction: vi.fn(),
  close: vi.fn(),
};

export const mockIDBTransaction = {
  objectStore: vi.fn(),
  oncomplete: null as any,
  onerror: null as any,
};

export const mockIDBObjectStore = {
  add: vi.fn().mockReturnValue(mockIDBRequest),
  get: vi.fn().mockReturnValue(mockIDBRequest),
  put: vi.fn().mockReturnValue(mockIDBRequest),
  delete: vi.fn().mockReturnValue(mockIDBRequest),
  getAll: vi.fn().mockReturnValue(mockIDBRequest),
  clear: vi.fn().mockReturnValue(mockIDBRequest),
  openCursor: vi.fn().mockReturnValue(mockIDBRequest),
};

/**
 * Helper to create mock file
 */
export const createMockFile = (
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): File => {
  const blob = new Blob([content], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
};

/**
 * Helper to wait for async operations
 */
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
