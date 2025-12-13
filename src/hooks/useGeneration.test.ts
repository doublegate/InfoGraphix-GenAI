import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGeneration } from './useGeneration';
import { InfographicStyle, ColorPalette, ImageSize, AspectRatio } from '../types';

// Mock geminiService
vi.mock('../services/geminiService', () => ({
  analyzeTopic: vi.fn(),
  generateInfographicImage: vi.fn(),
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useGeneration());

    expect(result.current.processingStep).toBe('idle');
    expect(result.current.currentRequest).toBeNull();
    expect(result.current.analysisResult).toBeNull();
    expect(result.current.generatedImage).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should have generate function', () => {
    const { result } = renderHook(() => useGeneration());

    expect(result.current.generate).toBeDefined();
    expect(typeof result.current.generate).toBe('function');
  });

  it('should have reset function', () => {
    const { result } = renderHook(() => useGeneration());

    expect(result.current.reset).toBeDefined();
    expect(typeof result.current.reset).toBe('function');
  });
});
