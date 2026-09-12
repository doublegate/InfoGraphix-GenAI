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

// jsdom >= 28 defines `localStorage` on Window as an accessor with only a
// getter, so a plain assignment throws "Cannot set property localStorage of
// [object Window] which has only a getter". Define the property instead, which
// works on both the old data property and the new accessor.
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Same accessor problem as localStorage above: newer jsdom exposes `navigator`
// as a getter-only property, which breaks tests that swap it out to fake the
// Storage API. Re-declare it once as a writable data property so plain
// assignment keeps working at the call sites.
Object.defineProperty(globalThis, 'navigator', {
  value: globalThis.navigator,
  writable: true,
  configurable: true,
});

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
