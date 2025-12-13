/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  openDatabase,
  compressImage,
  checkStorageQuota,
} from './storageService';
import { mockIDBDatabase, mockIDBRequest } from '../test/mockData';

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
  databases: vi.fn(),
};

// Mock Image class that triggers onload when src is set
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  width = 100;
  height = 100;
  private _src = '';

  get src() {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    // Trigger onload asynchronously to simulate real behavior
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  (globalThis as any).indexedDB = mockIndexedDB;
  (globalThis as any).Image = MockImage as any;
});

describe('storageService', () => {
  describe('openDatabase', () => {
    // Run error test FIRST to avoid singleton caching issues
    it('should handle database open errors', async () => {
      const errorRequest = {
        ...mockIDBRequest,
        error: new Error('Failed to open database'),
        onsuccess: null as any,
        onerror: null as any,
      };

      mockIndexedDB.open.mockReturnValue(errorRequest);

      const dbPromise = openDatabase();

      // Simulate error - use setTimeout to ensure the promise has set up handlers
      setTimeout(() => {
        if (errorRequest.onerror) {
          errorRequest.onerror({ target: errorRequest } as any);
        }
      }, 0);

      await expect(dbPromise).rejects.toThrow();
    });

    it('should open the database successfully', async () => {
      const mockRequest = {
        ...mockIDBRequest,
        result: mockIDBDatabase,
        onsuccess: null as any,
        onerror: null as any,
        onupgradeneeded: null as any,
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);

      const dbPromise = openDatabase();

      // Simulate success
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess({ target: mockRequest } as any);
        }
      }, 0);

      await expect(dbPromise).resolves.toBeDefined();
    });
  });

  describe('compressImage', () => {
    it('should compress large images', async () => {
      // Create a large image data URL (>100KB COMPRESSION_THRESHOLD)
      const largeBase64 = 'A'.repeat(110000); // >100KB
      const largeImage = `data:image/png;base64,${largeBase64}`;

      // Create a mock canvas and context
      const mockCanvas = document.createElement('canvas');
      const mockContext = {
        drawImage: vi.fn(),
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas);
      vi.spyOn(mockCanvas, 'getContext').mockReturnValue(mockContext as any);
      vi.spyOn(mockCanvas, 'toDataURL').mockReturnValue(
        'data:image/jpeg;base64,compressed'
      );

      // Override MockImage to return large dimensions that will be scaled down
      class LargeMockImage extends MockImage {
        width = 4000;
        height = 3000;
      }
      (globalThis as any).Image = LargeMockImage as any;

      const result = await compressImage(largeImage, 2000, 0.8);

      expect(result).toContain('data:image/jpeg;base64,');
    });

    it('should return original image if already small', async () => {
      const smallImage = 'data:image/png;base64,small';

      const result = await compressImage(smallImage, 2000, 0.8);

      // Returns original because length < 100KB threshold
      expect(result).toBe(smallImage);
    });
  });

  describe('checkStorageQuota', () => {
    it('should return storage quota information', async () => {
      const mockEstimate = {
        usage: 1048576, // 1MB in bytes
        quota: 10485760, // 10MB in bytes
      };

      (globalThis as any).navigator = {
        storage: {
          estimate: vi.fn().mockResolvedValue(mockEstimate),
        },
      };

      const quota = await checkStorageQuota();

      expect(quota.usedMB).toBe(1);
      expect(quota.quotaMB).toBe(10);
      expect(quota.percentUsed).toBe(10);
      expect(quota.warning).toBe(false);
    });

    it('should handle missing storage API', async () => {
      (globalThis as any).navigator = {};

      const quota = await checkStorageQuota();

      expect(quota.usedMB).toBe(0);
      expect(quota.quotaMB).toBe(0);
      expect(quota.percentUsed).toBe(0);
      expect(quota.warning).toBe(false);
    });
  });
});
