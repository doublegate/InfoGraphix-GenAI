import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  openDatabase,
  saveVersion,
  getVersions,
  deleteVersion,
  clearVersions,
  compressImage,
  getStorageQuota,
} from './storageService';
import { mockSavedVersion, mockIDBDatabase, mockIDBRequest } from '../test/mockData';

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
  databases: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  global.indexedDB = mockIndexedDB as any;
});

describe('storageService', () => {
  describe('openDatabase', () => {
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
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({ target: mockRequest } as any);
      }

      await expect(dbPromise).resolves.toBeDefined();
    });

    it('should handle database open errors', async () => {
      const mockRequest = {
        ...mockIDBRequest,
        error: new Error('Failed to open database'),
        onsuccess: null as any,
        onerror: null as any,
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);

      const dbPromise = openDatabase();

      // Simulate error
      if (mockRequest.onerror) {
        mockRequest.onerror({ target: mockRequest } as any);
      }

      await expect(dbPromise).rejects.toThrow();
    });
  });

  describe('compressImage', () => {
    it('should compress large images', async () => {
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

      const mockImage = new Image();
      mockImage.width = 4000;
      mockImage.height = 3000;

      const result = await compressImage(
        'data:image/png;base64,original',
        2000,
        0.8
      );

      expect(result).toContain('data:image/jpeg;base64,');
    });

    it('should return original image if already small', async () => {
      const smallImage = 'data:image/png;base64,small';

      const mockImage = new Image();
      mockImage.width = 800;
      mockImage.height = 600;

      const result = await compressImage(smallImage, 2000, 0.8);

      expect(result).toBe(smallImage);
    });
  });

  describe('getStorageQuota', () => {
    it('should return storage quota information', async () => {
      const mockEstimate = {
        usage: 1000000,
        quota: 10000000,
      };

      global.navigator.storage = {
        estimate: vi.fn().mockResolvedValue(mockEstimate),
      } as any;

      const quota = await getStorageQuota();

      expect(quota.used).toBe(1000000);
      expect(quota.total).toBe(10000000);
      expect(quota.percentUsed).toBe(10);
    });

    it('should handle missing storage API', async () => {
      delete (global.navigator as any).storage;

      const quota = await getStorageQuota();

      expect(quota.used).toBe(0);
      expect(quota.total).toBe(0);
      expect(quota.percentUsed).toBe(0);
    });
  });
});
