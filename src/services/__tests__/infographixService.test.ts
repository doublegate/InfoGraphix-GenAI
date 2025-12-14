/**
 * InfoGraphix Service Tests
 *
 * Tests the InfoGraphix API service wrapper and its integration
 * with the mock client.
 *
 * @module services/__tests__/infographixService.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  InfoGraphixService,
  getInfoGraphixService,
  resetInfoGraphixService,
  type InfoGraphixServiceOptions,
} from '../infographixService';
import { ImageSize, AspectRatio, InfographicStyle, ColorPalette } from '../../types';

// Test configuration
const testOptions: InfoGraphixServiceOptions = {
  apiKey: 'test-api-key',
  debug: false,
  mockOptions: {
    analysisDelay: 10, // Fast for tests
    generationDelay: 10,
    errorRate: 0,
  },
};

describe('InfoGraphixService', () => {
  let service: InfoGraphixService;

  beforeEach(() => {
    resetInfoGraphixService();
    service = new InfoGraphixService(testOptions);
  });

  afterEach(() => {
    resetInfoGraphixService();
  });

  describe('constructor', () => {
    it('should initialize with provided options', () => {
      expect(service).toBeInstanceOf(InfoGraphixService);
    });

    it('should use default values for optional mock options', () => {
      const minimalService = new InfoGraphixService({
        apiKey: 'test-key',
      });
      expect(minimalService).toBeInstanceOf(InfoGraphixService);
    });
  });

  describe('createGeneration', () => {
    it('should create a generation job and return job ID', async () => {
      const result = await service.createGeneration({
        topic: 'Test topic',
        size: ImageSize.Resolution_2K,
        aspectRatio: AspectRatio.Landscape,
        style: InfographicStyle.Modern,
        palette: ColorPalette.BlueWhite,
      });

      expect(result.jobId).toBeDefined();
      expect(result.jobId).toMatch(/^mock_/);
      expect(result.status).toBe('pending');
      expect(result.estimatedTimeRemaining).toBeGreaterThan(0);
    });

    it('should accept optional filters', async () => {
      const result = await service.createGeneration({
        topic: 'github.com/facebook/react',
        size: ImageSize.Resolution_1K,
        aspectRatio: AspectRatio.Square,
        style: InfographicStyle.Futuristic,
        palette: ColorPalette.DarkNeon,
        filters: {
          language: 'TypeScript',
          fileExtensions: '.tsx,.ts',
        },
      });

      expect(result.jobId).toBeDefined();
      expect(result.status).toBe('pending');
    });

    it('should accept optional file content', async () => {
      const result = await service.createGeneration({
        topic: 'My Document Analysis',
        size: ImageSize.Resolution_2K,
        aspectRatio: AspectRatio.Portrait,
        style: InfographicStyle.Corporate,
        palette: ColorPalette.Monochrome,
        fileContent: '# Test Markdown\n\nSome content here.',
      });

      expect(result.jobId).toBeDefined();
    });
  });

  describe('getGenerationStatus', () => {
    it('should return current job status', async () => {
      const createResult = await service.createGeneration({
        topic: 'Test topic',
        size: ImageSize.Resolution_2K,
        aspectRatio: AspectRatio.Landscape,
        style: InfographicStyle.Modern,
        palette: ColorPalette.BlueWhite,
      });

      const status = await service.getGenerationStatus(createResult.jobId);

      expect(status.jobId).toBe(createResult.jobId);
      expect(['pending', 'analyzing', 'generating', 'completed']).toContain(status.status);
    });

    it('should throw error for non-existent job', async () => {
      await expect(service.getGenerationStatus('non-existent-job')).rejects.toThrow();
    });
  });

  describe('waitForGeneration', () => {
    it('should wait for generation to complete', async () => {
      const createResult = await service.createGeneration({
        topic: 'Test topic',
        size: ImageSize.Resolution_2K,
        aspectRatio: AspectRatio.Landscape,
        style: InfographicStyle.Modern,
        palette: ColorPalette.BlueWhite,
      });

      const result = await service.waitForGeneration(createResult.jobId);

      expect(result.status).toBe('completed');
      expect(result.result).toBeDefined();
      expect(result.result?.imageUrl).toBeDefined();
      expect(result.result?.analysis).toBeDefined();
    });

    it('should call progress callback during generation', async () => {
      const createResult = await service.createGeneration({
        topic: 'Test topic',
        size: ImageSize.Resolution_2K,
        aspectRatio: AspectRatio.Landscape,
        style: InfographicStyle.Modern,
        palette: ColorPalette.BlueWhite,
      });

      const progressUpdates: string[] = [];
      const onProgress = vi.fn((status) => {
        progressUpdates.push(status.status);
      });

      await service.waitForGeneration(createResult.jobId, onProgress);

      expect(onProgress).toHaveBeenCalled();
    });
  });

  describe('cancelGeneration', () => {
    it('should cancel a pending job', async () => {
      const createResult = await service.createGeneration({
        topic: 'Test topic',
        size: ImageSize.Resolution_2K,
        aspectRatio: AspectRatio.Landscape,
        style: InfographicStyle.Modern,
        palette: ColorPalette.BlueWhite,
      });

      await service.cancelGeneration(createResult.jobId);

      const status = await service.getGenerationStatus(createResult.jobId);
      expect(status.status).toBe('cancelled');
    });
  });

  describe('getHistory', () => {
    it('should return paginated history', async () => {
      const result = await service.getHistory(1, 10);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('totalItems');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('hasNext');
      expect(result).toHaveProperty('hasPrevious');
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('getTemplates', () => {
    it('should return templates array', async () => {
      const templates = await service.getTemplates();

      expect(Array.isArray(templates)).toBe(true);
    });
  });

  describe('getQuota', () => {
    it('should return quota information', async () => {
      const quota = await service.getQuota();

      expect(quota).toHaveProperty('tier');
      expect(quota).toHaveProperty('requestsRemaining');
      expect(quota).toHaveProperty('generationsRemaining');
      expect(quota).toHaveProperty('resetAt');
      expect(typeof quota.requestsRemaining).toBe('number');
    });
  });

  describe('getAvailableStyles', () => {
    it('should return available styles', async () => {
      const styles = await service.getAvailableStyles();

      expect(Array.isArray(styles)).toBe(true);
      if (styles.length > 0) {
        expect(styles[0]).toHaveProperty('value');
        expect(styles[0]).toHaveProperty('name');
        expect(styles[0]).toHaveProperty('description');
      }
    });
  });

  describe('getAvailablePalettes', () => {
    it('should return available palettes', async () => {
      const palettes = await service.getAvailablePalettes();

      expect(Array.isArray(palettes)).toBe(true);
      if (palettes.length > 0) {
        expect(palettes[0]).toHaveProperty('value');
        expect(palettes[0]).toHaveProperty('name');
        expect(palettes[0]).toHaveProperty('description');
      }
    });
  });
});

describe('getInfoGraphixService singleton', () => {
  beforeEach(() => {
    resetInfoGraphixService();
  });

  afterEach(() => {
    resetInfoGraphixService();
  });

  it('should throw error when called without options before initialization', () => {
    expect(() => getInfoGraphixService()).toThrow(
      'InfoGraphix service not initialized. Provide options on first call.'
    );
  });

  it('should return same instance on subsequent calls', () => {
    const instance1 = getInfoGraphixService(testOptions);
    const instance2 = getInfoGraphixService();

    expect(instance1).toBe(instance2);
  });

  it('should create new instance when options provided again', () => {
    const instance1 = getInfoGraphixService(testOptions);
    const instance2 = getInfoGraphixService({
      ...testOptions,
      apiKey: 'different-key',
    });

    // New instance is created but singleton is updated
    expect(instance2).toBeInstanceOf(InfoGraphixService);
  });
});
