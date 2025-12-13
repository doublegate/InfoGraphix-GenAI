# Testing Guide - InfoGraphix AI

**Version:** 2.1.0
**Last Updated:** December 13, 2025

## Overview

InfoGraphix AI maintains comprehensive test coverage using modern testing tools and best practices. This guide covers the testing infrastructure, conventions, and how to contribute tests.

## Test Statistics (v2.1.0)

| Category | Coverage | Tests |
|----------|----------|-------|
| **Overall** | 81.29% | 299 |
| Utilities | 91.11% | 100 |
| Hooks | 98.87% | 48 |
| Contexts | 100% | 45 |
| Components | 100%* | 51 |
| Services | 70.8% | 55 |

*Coverage for tested components; not all components have tests yet.

## Testing Stack

### Core Tools

- **[Vitest](https://vitest.dev/)** - Fast, Vite-native test runner
- **[@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)** - React component testing
- **[@testing-library/user-event](https://testing-library.com/docs/user-event/intro/)** - User interaction simulation
- **[@axe-core/react](https://github.com/dequelabs/axe-core-npm)** - Accessibility testing
- **[happy-dom](https://github.com/capricorn86/happy-dom)** - Fast DOM implementation

### Configuration

Test configuration is in `vite.config.ts`:

```typescript
test: {
  globals: true,
  environment: 'happy-dom',
  setupFiles: './src/test/setup.ts',
  include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html', 'lcov'],
    exclude: ['node_modules/', 'src/test/', '**/*.d.ts', 'vite.config.ts'],
  },
}
```

## Running Tests

### Commands

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode (for development)
npm run test

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm run test:run -- src/utils/logger.test.ts

# Run tests matching pattern
npm run test:run -- --grep "rate limiter"
```

### Coverage Report

After running `npm run test:coverage`, view the HTML report:

```bash
open coverage/index.html
```

## Test Structure

### Directory Organization

```
src/
├── components/
│   ├── ErrorBoundary.test.tsx
│   ├── FeedbackForm.test.tsx
│   ├── ProcessingState.test.tsx
│   └── SkipLink.test.tsx
├── contexts/
│   ├── GenerationContext.test.tsx
│   └── ThemeContext.test.tsx
├── hooks/
│   ├── useAnnouncer.test.ts
│   ├── useGeneration.test.ts
│   └── useHighContrast.test.ts
├── services/
│   ├── geminiService.test.ts
│   └── storageService.test.ts
├── utils/
│   ├── logger.test.ts
│   └── rateLimiter.test.ts
└── test/
    └── setup.ts
```

### Naming Conventions

- Test files: `ComponentName.test.tsx` or `moduleName.test.ts`
- Test suites: `describe('ComponentName', () => { ... })`
- Test cases: `it('should do something specific', () => { ... })`

## Writing Tests

### Component Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<MyComponent onClick={onClick} />);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalled();
  });
});
```

### Hook Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(defaultValue);
  });

  it('should update state', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.setValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });
});
```

### Context Tests

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { MyProvider, useMyContext } from './MyContext';

describe('MyContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MyProvider>{children}</MyProvider>
  );

  it('should throw when used outside provider', () => {
    expect(() => renderHook(() => useMyContext()))
      .toThrow('useMyContext must be used within MyProvider');
  });

  it('should provide context value', () => {
    const { result } = renderHook(() => useMyContext(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
```

### Service Tests with Mocks

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../utils/logger', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('myService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful operation', async () => {
    const result = await myService.doSomething();
    expect(result).toBeDefined();
  });
});
```

## Mocking Patterns

### Browser APIs

```typescript
// Mock localStorage
const localStorageData: Record<string, string> = {};
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: vi.fn((key) => localStorageData[key] || null),
    setItem: vi.fn((key, value) => { localStorageData[key] = value; }),
    removeItem: vi.fn((key) => { delete localStorageData[key]; }),
  },
  writable: true,
});

// Mock matchMedia
Object.defineProperty(globalThis, 'matchMedia', {
  value: vi.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});
```

### IndexedDB

```typescript
import { resetDatabaseForTesting } from '../services/storageService';

beforeEach(() => {
  // Reset singleton database instance
  resetDatabaseForTesting();

  // Set up mock IDB
  const mockDb = createMockDatabase();
  globalThis.indexedDB = mockIndexedDB;
});
```

### Time/Timers

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('should handle delayed operation', async () => {
  const callback = vi.fn();
  startDelayedOperation(callback);

  vi.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalled();
});
```

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// Good: Tests what user sees
it('should display error message on failure', async () => {
  render(<Form />);
  await user.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/error/i)).toBeInTheDocument();
});

// Avoid: Tests internal state
it('should set hasError to true', () => { ... });
```

### 2. Use Semantic Queries

```typescript
// Best: Accessible queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);

// Good: Text queries
screen.getByText(/welcome/i);

// Avoid: Test IDs (unless necessary)
screen.getByTestId('submit-button');
```

### 3. Isolate Tests

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  // Reset any shared state
});
```

### 4. Handle Async Properly

```typescript
// Use async/await
it('should load data', async () => {
  render(<DataLoader />);
  await waitFor(() => {
    expect(screen.getByText(/loaded/i)).toBeInTheDocument();
  });
});

// Use userEvent for interactions
const user = userEvent.setup();
await user.click(button);
```

### 5. Test Error Cases

```typescript
it('should handle network error', async () => {
  mockFetch.mockRejectedValue(new Error('Network error'));

  render(<DataLoader />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| Overall | 70% | 81.29% |
| Utilities | 90% | 91.11% |
| Hooks | 85% | 98.87% |
| Contexts | 90% | 100% |
| Components | 75% | 100%* |
| Services | 70% | 70.8% |

## CI Integration

Tests run automatically on:
- Pull request creation
- Push to main branch

GitHub Actions workflow (`.github/workflows/ci.yml`):

```yaml
- name: Run tests
  run: npm run test:run

- name: Upload coverage
  uses: codecov/codecov-action@v4
```

## Debugging Tests

### Verbose Output

```bash
npm run test:run -- --reporter=verbose
```

### Single Test

```bash
npm run test:run -- -t "specific test name"
```

### Debug Mode

```typescript
// Add to test for debugging
screen.debug();  // Print DOM
console.log(result.current);  // Print hook state
```

## Contributing Tests

1. **New Features**: Add tests before or alongside implementation
2. **Bug Fixes**: Add regression test that fails without fix
3. **Refactoring**: Ensure existing tests pass after changes

### Pull Request Checklist

- [ ] All tests pass (`npm run test:run`)
- [ ] Coverage maintained or improved
- [ ] New code has corresponding tests
- [ ] Tests follow naming conventions
- [ ] No skipped tests without explanation

## Resources

- [Vitest Documentation](https://vitest.dev/guide/)
- [Testing Library Docs](https://testing-library.com/docs/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing](https://www.deque.com/axe/)
