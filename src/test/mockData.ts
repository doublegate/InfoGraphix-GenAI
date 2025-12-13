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
  fileContent: null,
  githubFilters: null,
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
      url: 'https://example.com/source1',
      title: 'Source 1',
      snippet: 'Relevant information from source 1',
    },
  ],
  suggestions: {
    styles: [InfographicStyle.Modern, InfographicStyle.Minimalist],
    palettes: [ColorPalette.Vibrant, ColorPalette.Professional],
    reasoning: 'Modern and minimalist styles work well for technical topics.',
  },
};

export const mockSavedVersion: SavedVersion = {
  id: 'test-id-123',
  timestamp: Date.now(),
  imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  request: mockInfographicRequest,
  analysis: mockAnalysisResult,
  metadata: {
    generationTime: 1500,
    modelUsed: 'gemini-3-pro-image-preview',
  },
};

export const mockTemplate = {
  id: 'test-template',
  name: 'Test Template',
  category: 'Business',
  description: 'A test template for business infographics',
  settings: {
    style: InfographicStyle.Modern,
    palette: ColorPalette.Professional,
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
  response: {
    text: () => JSON.stringify(mockAnalysisResult),
  },
};

export const mockGeminiImageResponse = {
  response: {
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
  },
};

/**
 * Mock error responses
 */
export const mockApiError = new Error('API Error');
export const mockRateLimitError = Object.assign(new Error('Rate limit exceeded'), {
  status: 429,
});
export const mockAuthError = Object.assign(new Error('Authentication failed'), {
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
