/* eslint-disable @typescript-eslint/no-explicit-any */
// jest-dom v7: the bare entry point registers the matchers at runtime but no
// longer augments vitest's `Assertion` types. The /vitest subpath does both, so
// `expect(...).toBeInTheDocument()` type-checks as well as runs.
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
(globalThis as any).IntersectionObserver = class IntersectionObserver {
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
(globalThis as any).ResizeObserver = class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock IndexedDB
const indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
  databases: vi.fn(),
};

(globalThis as any).indexedDB = indexedDB;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// jsdom >= 28 defines `localStorage` and `navigator` on Window as accessors
// with only a getter, so a plain `globalThis.x = ...` throws "Cannot set
// property x of [object Window] which has only a getter".
//
// vi.stubGlobal redefines them as configurable, writable properties, which
// fixes two things at once: the assignment above works, and the four places in
// storageService.test.ts that swap `navigator` out per-test keep working
// unchanged. It also registers the stub with Vitest, so vi.unstubAllGlobals()
// can restore them if per-test isolation is ever needed.
vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('navigator', globalThis.navigator);

// Mock AI Studio window.aistudio object
(globalThis as any).aistudio = {
  hasSelectedApiKey: vi.fn().mockReturnValue(false),
  openSelectKey: vi.fn(),
};

// Suppress console errors in tests (optional - remove if you want to see them)
(globalThis as any).console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};
