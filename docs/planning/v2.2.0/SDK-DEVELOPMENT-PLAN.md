# SDK Development Plan - v2.2.0 API Platform

**Version:** v2.2.0 (Q2 2026)
**Status:** Planning
**Created:** 2025-12-13
**Foundation:** v2.2.0-foundation (Released 2025-12-13)

---

## Overview

This document outlines the development plan for the official InfoGraphix AI SDKs. The foundation work (TypeScript type system and interfaces) was completed in v2.2.0-foundation. This plan covers the implementation of both Python and TypeScript/JavaScript SDKs for Q2 2026.

**Goals:**
- Provide first-class SDKs for Python and TypeScript/JavaScript
- Enable easy integration with InfoGraphix AI API
- Support both synchronous and asynchronous operations
- Maintain type safety across all interactions
- Publish to PyPI and npm with automated CI/CD

---

## TypeScript/JavaScript SDK

### Package Overview

**Package Name:** `@infographix/sdk`
**Description:** Official TypeScript/JavaScript SDK for InfoGraphix AI API
**Repository:** `https://github.com/doublegate/infographix-sdk-ts`
**License:** MIT

**Key Features:**
- Full TypeScript support with strict types
- Promise-based API for modern async/await patterns
- Supports Node.js 18+ and modern browsers
- Tree-shakeable ES modules
- Event emitters for progress tracking
- Request cancellation via AbortController
- Automatic retry with exponential backoff
- Comprehensive error handling

---

### Project Structure

```
infographix-sdk-ts/
├── src/
│   ├── client.ts              # Main SDK client
│   ├── config.ts              # Configuration and options
│   ├── errors.ts              # Error classes
│   ├── types/
│   │   ├── common.ts          # Common types
│   │   ├── models.ts          # Data models
│   │   ├── requests.ts        # Request types
│   │   └── responses.ts       # Response types
│   ├── api/
│   │   ├── generation.ts      # Generation API
│   │   ├── batch.ts           # Batch API
│   │   ├── templates.ts       # Templates API
│   │   ├── history.ts         # History API
│   │   ├── account.ts         # Account API
│   │   ├── webhooks.ts        # Webhooks API
│   │   └── catalog.ts         # Styles/Palettes catalog
│   ├── http/
│   │   ├── client.ts          # HTTP client wrapper
│   │   ├── retry.ts           # Retry logic
│   │   └── interceptors.ts    # Request/response interceptors
│   ├── utils/
│   │   ├── validation.ts      # Input validation
│   │   ├── url.ts             # URL helpers
│   │   └── stream.ts          # Streaming utilities
│   └── index.ts               # Public API exports
├── tests/
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── fixtures/              # Test data
├── examples/
│   ├── basic/                 # Basic examples
│   ├── advanced/              # Advanced examples
│   └── browser/               # Browser examples
├── docs/
│   ├── api/                   # API documentation
│   ├── guides/                # User guides
│   └── migration/             # Migration guides
├── package.json
├── tsconfig.json
├── tsup.config.ts             # Build configuration
├── vitest.config.ts           # Test configuration
└── README.md
```

---

### Build System

**Build Tool:** tsup (fast TypeScript bundler)

**Configuration:**

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: true,
  target: 'es2020',
  outDir: 'dist',
  external: [],
  treeshake: true,
});
```

**Package.json Scripts:**

```json
{
  "name": "@infographix/sdk",
  "version": "2.2.0",
  "description": "Official TypeScript/JavaScript SDK for InfoGraphix AI",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "typecheck": "tsc --noEmit",
    "docs": "typedoc src/index.ts",
    "prepublishOnly": "npm run build && npm test"
  },
  "dependencies": {},
  "peerDependencies": {},
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "typedoc": "^0.25.0"
  },
  "keywords": [
    "infographix",
    "infographic",
    "ai",
    "gemini",
    "sdk",
    "typescript",
    "javascript"
  ]
}
```

---

### Core Implementation

**Main Client:**

```typescript
// src/client.ts
import { GenerationApi } from './api/generation';
import { BatchApi } from './api/batch';
import { TemplatesApi } from './api/templates';
import { HistoryApi } from './api/history';
import { AccountApi } from './api/account';
import { WebhooksApi } from './api/webhooks';
import { CatalogApi } from './api/catalog';
import { HttpClient } from './http/client';
import type { ClientOptions } from './config';
import { DEFAULT_OPTIONS, validateOptions, mergeOptions } from './config';

export class InfoGraphixClient {
  private http: HttpClient;
  private options: Required<ClientOptions>;

  // Namespaced APIs
  public readonly generate: GenerationApi;
  public readonly batch: BatchApi;
  public readonly templates: TemplatesApi;
  public readonly history: HistoryApi;
  public readonly account: AccountApi;
  public readonly webhooks: WebhooksApi;
  public readonly catalog: CatalogApi;

  constructor(options: ClientOptions) {
    this.options = mergeOptions(DEFAULT_OPTIONS, options);
    validateOptions(this.options);

    this.http = new HttpClient(this.options);

    // Initialize namespaced APIs
    this.generate = new GenerationApi(this.http);
    this.batch = new BatchApi(this.http);
    this.templates = new TemplatesApi(this.http);
    this.history = new HistoryApi(this.http);
    this.account = new AccountApi(this.http);
    this.webhooks = new WebhooksApi(this.http);
    this.catalog = new CatalogApi(this.http);
  }

  /**
   * Update client configuration at runtime
   */
  configure(options: Partial<ClientOptions>): void {
    this.options = mergeOptions(this.options, options);
    validateOptions(this.options);
    this.http.updateConfig(this.options);
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<Required<ClientOptions>> {
    return { ...this.options };
  }
}
```

**HTTP Client with Retry:**

```typescript
// src/http/client.ts
import type { ClientOptions } from '../config';
import { retry } from './retry';
import { InfoGraphixError } from '../errors';

export class HttpClient {
  private baseUrl: string;
  private apiKey: string;
  private headers: Record<string, string>;
  private timeout: number;
  private retryConfig: Required<ClientOptions>['retry'];

  constructor(options: Required<ClientOptions>) {
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey;
    this.timeout = options.timeout;
    this.retryConfig = options.retry;
    this.headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...options.headers,
    };
  }

  async request<T>(
    method: string,
    path: string,
    data?: unknown,
    signal?: AbortSignal
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const fetchFn = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          method,
          headers: this.headers,
          body: data ? JSON.stringify(data) : undefined,
          signal: signal || controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          await this.handleErrorResponse(response);
        }

        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    return retry(fetchFn, this.retryConfig);
  }

  async get<T>(path: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>('GET', path, undefined, signal);
  }

  async post<T>(path: string, data: unknown, signal?: AbortSignal): Promise<T> {
    return this.request<T>('POST', path, data, signal);
  }

  async put<T>(path: string, data: unknown, signal?: AbortSignal): Promise<T> {
    return this.request<T>('PUT', path, data, signal);
  }

  async delete<T>(path: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>('DELETE', path, undefined, signal);
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    const body = await response.json().catch(() => ({}));

    throw new InfoGraphixError(
      body.error?.code || 'UNKNOWN_ERROR',
      body.error?.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      body.error?.details
    );
  }

  updateConfig(options: Required<ClientOptions>): void {
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey;
    this.timeout = options.timeout;
    this.retryConfig = options.retry;
    this.headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...options.headers,
    };
  }
}
```

**Retry Logic:**

```typescript
// src/http/retry.ts
import type { RetryConfig } from '../config';

export async function retry<T>(
  fn: () => Promise<T>,
  config: Required<RetryConfig>
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on non-retryable errors
      if (error instanceof InfoGraphixError) {
        if (!config.retryableStatusCodes.includes(error.statusCode)) {
          throw error;
        }
      }

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = config.retryDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Error Handling:**

```typescript
// src/errors.ts
export class InfoGraphixError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'InfoGraphixError';

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InfoGraphixError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}
```

---

### API Implementation Examples

**Generation API:**

```typescript
// src/api/generation.ts
import type { HttpClient } from '../http/client';
import type { GenerateInfographicRequest } from '../types/requests';
import type {
  GenerationResponse,
  JobStatusResponse,
  JobResultResponse,
  CancelResponse,
} from '../types/responses';

export class GenerationApi {
  constructor(private http: HttpClient) {}

  /**
   * Create a new infographic generation job
   */
  async create(
    request: GenerateInfographicRequest,
    signal?: AbortSignal
  ): Promise<GenerationResponse> {
    return this.http.post<GenerationResponse>(
      '/api/v1/generate',
      request,
      signal
    );
  }

  /**
   * Get generation job status
   */
  async getStatus(
    jobId: string,
    signal?: AbortSignal
  ): Promise<JobStatusResponse> {
    return this.http.get<JobStatusResponse>(
      `/api/v1/generate/${jobId}`,
      signal
    );
  }

  /**
   * Get generation result (when complete)
   */
  async getResult(
    jobId: string,
    signal?: AbortSignal
  ): Promise<JobResultResponse> {
    return this.http.get<JobResultResponse>(
      `/api/v1/generate/${jobId}/result`,
      signal
    );
  }

  /**
   * Cancel a pending generation
   */
  async cancel(
    jobId: string,
    signal?: AbortSignal
  ): Promise<CancelResponse> {
    return this.http.delete<CancelResponse>(
      `/api/v1/generate/${jobId}`,
      signal
    );
  }

  /**
   * Wait for generation to complete (with polling)
   */
  async waitForCompletion(
    jobId: string,
    options?: {
      pollInterval?: number;
      maxAttempts?: number;
      signal?: AbortSignal;
    }
  ): Promise<JobResultResponse> {
    const pollInterval = options?.pollInterval || 2000;
    const maxAttempts = options?.maxAttempts || 150; // 5 minutes max

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getStatus(jobId, options?.signal);

      if (status.data.status === 'completed') {
        return this.getResult(jobId, options?.signal);
      }

      if (status.data.status === 'failed') {
        throw new InfoGraphixError(
          'GENERATION_FAILED',
          'Generation job failed',
          500,
          status.data
        );
      }

      if (status.data.status === 'cancelled') {
        throw new InfoGraphixError(
          'GENERATION_CANCELLED',
          'Generation job was cancelled',
          400
        );
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new InfoGraphixError(
      'TIMEOUT',
      'Generation job did not complete in time',
      408
    );
  }
}
```

**Batch API with Events:**

```typescript
// src/api/batch.ts
import { EventEmitter } from 'events';
import type { HttpClient } from '../http/client';
import type { BatchGenerateRequest } from '../types/requests';
import type {
  BatchResponse,
  BatchStatusResponse,
  BatchResultsResponse,
} from '../types/responses';

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  percentage: number;
}

export class BatchApi extends EventEmitter {
  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Create a batch generation job
   */
  async create(
    request: BatchGenerateRequest,
    signal?: AbortSignal
  ): Promise<BatchResponse> {
    return this.http.post<BatchResponse>('/api/v1/batch', request, signal);
  }

  /**
   * Get batch status
   */
  async getStatus(
    batchId: string,
    signal?: AbortSignal
  ): Promise<BatchStatusResponse> {
    return this.http.get<BatchStatusResponse>(
      `/api/v1/batch/${batchId}`,
      signal
    );
  }

  /**
   * Get batch results
   */
  async getResults(
    batchId: string,
    signal?: AbortSignal
  ): Promise<BatchResultsResponse> {
    return this.http.get<BatchResultsResponse>(
      `/api/v1/batch/${batchId}/results`,
      signal
    );
  }

  /**
   * Wait for batch completion with progress events
   */
  async waitForCompletion(
    batchId: string,
    options?: {
      pollInterval?: number;
      signal?: AbortSignal;
    }
  ): Promise<BatchResultsResponse> {
    const pollInterval = options?.pollInterval || 5000;

    while (true) {
      const status = await this.getStatus(batchId, options?.signal);
      const { total, completed, failed } = status.data;

      // Emit progress event
      this.emit('progress', {
        total,
        completed,
        failed,
        percentage: (completed + failed) / total * 100,
      } as BatchProgress);

      if (status.data.status === 'completed') {
        return this.getResults(batchId, options?.signal);
      }

      if (status.data.status === 'failed') {
        throw new InfoGraphixError(
          'BATCH_FAILED',
          'Batch job failed',
          500,
          status.data
        );
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
}
```

---

### Testing Strategy

**Test Configuration:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/types/**'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
});
```

**Example Unit Test:**

```typescript
// tests/unit/client.test.ts
import { describe, it, expect, vi } from 'vitest';
import { InfoGraphixClient } from '../../src/client';

describe('InfoGraphixClient', () => {
  it('should initialize with valid config', () => {
    const client = new InfoGraphixClient({
      apiKey: 'test_key',
      baseUrl: 'https://api.infographix.ai',
    });

    expect(client).toBeDefined();
    expect(client.generate).toBeDefined();
    expect(client.batch).toBeDefined();
  });

  it('should throw on invalid config', () => {
    expect(() => {
      new InfoGraphixClient({ apiKey: '' });
    }).toThrow();
  });

  it('should update configuration', () => {
    const client = new InfoGraphixClient({ apiKey: 'test' });

    client.configure({ timeout: 10000 });

    expect(client.getConfig().timeout).toBe(10000);
  });
});
```

**Example Integration Test:**

```typescript
// tests/integration/generation.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { InfoGraphixClient } from '../../src';

describe('Generation API Integration', () => {
  let client: InfoGraphixClient;

  beforeAll(() => {
    client = new InfoGraphixClient({
      apiKey: process.env.INFOGRAPHIX_API_KEY!,
      baseUrl: process.env.API_BASE_URL || 'https://api.infographix.ai',
    });
  });

  it('should create and complete generation', async () => {
    const response = await client.generate.create({
      topic: 'Test Topic',
      style: 'modern',
      palette: 'professional',
      size: '1K',
      aspectRatio: 'square',
    });

    expect(response.success).toBe(true);
    expect(response.data.id).toBeDefined();

    // Wait for completion
    const result = await client.generate.waitForCompletion(response.data.id);

    expect(result.success).toBe(true);
    expect(result.data.imageUrl).toBeDefined();
  }, 60000);
});
```

---

### Documentation Generation

**TypeDoc Configuration:**

```json
// typedoc.json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "theme": "default",
  "exclude": ["**/*.test.ts", "**/__tests__/**"],
  "readme": "README.md",
  "includeVersion": true,
  "categorizeByGroup": true,
  "sort": ["source-order"]
}
```

---

### Example Usage

**Basic Example:**

```typescript
// examples/basic/simple-generation.ts
import { InfoGraphixClient } from '@infographix/sdk';

async function main() {
  const client = new InfoGraphixClient({
    apiKey: process.env.INFOGRAPHIX_API_KEY!,
  });

  // Create generation
  const job = await client.generate.create({
    topic: 'Climate Change Statistics',
    style: 'modern',
    palette: 'ocean',
    size: '2K',
    aspectRatio: 'landscape',
  });

  console.log(`Job created: ${job.data.id}`);

  // Wait for completion
  const result = await client.generate.waitForCompletion(job.data.id);

  console.log(`Generation complete: ${result.data.imageUrl}`);
}

main().catch(console.error);
```

**Batch Example with Progress:**

```typescript
// examples/advanced/batch-with-progress.ts
import { InfoGraphixClient } from '@infographix/sdk';

async function main() {
  const client = new InfoGraphixClient({
    apiKey: process.env.INFOGRAPHIX_API_KEY!,
  });

  const batch = await client.batch.create({
    name: 'My Batch',
    items: [
      { topic: 'Topic 1' },
      { topic: 'Topic 2' },
      { topic: 'Topic 3' },
    ],
  });

  console.log(`Batch created: ${batch.data.id}`);

  // Listen for progress
  client.batch.on('progress', (progress) => {
    console.log(`Progress: ${progress.percentage.toFixed(1)}%`);
    console.log(`Completed: ${progress.completed}/${progress.total}`);
  });

  // Wait for completion
  const results = await client.batch.waitForCompletion(batch.data.id);

  console.log(`Batch complete. ${results.data.items.length} items generated.`);
}

main().catch(console.error);
```

---

### Publishing to npm

**GitHub Actions Workflow:**

```yaml
# .github/workflows/publish-npm.yml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Publish
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Python SDK

### Package Overview

**Package Name:** `infographix`
**Description:** Official Python SDK for InfoGraphix AI API
**Repository:** `https://github.com/doublegate/infographix-sdk-python`
**License:** MIT

**Key Features:**
- Full type hints with py.typed marker
- Synchronous and async clients
- Pydantic models for validation
- Automatic retry with exponential backoff
- Context manager support
- Comprehensive documentation
- Python 3.8+ support

---

### Project Structure

```
infographix-sdk-python/
├── src/
│   └── infographix/
│       ├── __init__.py
│       ├── client.py              # Main client
│       ├── async_client.py        # Async client
│       ├── config.py              # Configuration
│       ├── exceptions.py          # Custom exceptions
│       ├── types/
│       │   ├── __init__.py
│       │   ├── common.py          # Common types
│       │   ├── models.py          # Pydantic models
│       │   ├── requests.py        # Request models
│       │   └── responses.py       # Response models
│       ├── api/
│       │   ├── __init__.py
│       │   ├── generation.py      # Generation API
│       │   ├── batch.py           # Batch API
│       │   ├── templates.py       # Templates API
│       │   ├── history.py         # History API
│       │   ├── account.py         # Account API
│       │   ├── webhooks.py        # Webhooks API
│       │   └── catalog.py         # Catalog API
│       ├── http/
│       │   ├── __init__.py
│       │   ├── client.py          # HTTP client
│       │   └── retry.py           # Retry logic
│       ├── utils/
│       │   ├── __init__.py
│       │   └── validation.py      # Validation utils
│       └── py.typed               # Type marker
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── examples/
│   ├── basic/
│   ├── advanced/
│   └── async_/
├── docs/
│   ├── api/
│   └── guides/
├── pyproject.toml
├── setup.py
├── README.md
└── MANIFEST.in
```

---

### Build System

**pyproject.toml:**

```toml
[build-system]
requires = ["setuptools>=68.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "infographix"
version = "2.2.0"
description = "Official Python SDK for InfoGraphix AI API"
readme = "README.md"
license = { text = "MIT" }
authors = [
    { name = "InfoGraphix Team", email = "support@infographix.ai" }
]
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
    "Typing :: Typed",
]
requires-python = ">=3.8"
dependencies = [
    "httpx>=0.25.0",
    "pydantic>=2.0.0",
    "typing-extensions>=4.0.0;python_version<'3.10'",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
    "pytest-cov>=4.0.0",
    "mypy>=1.0.0",
    "ruff>=0.1.0",
    "black>=23.0.0",
]
docs = [
    "sphinx>=7.0.0",
    "sphinx-rtd-theme>=1.3.0",
    "sphinx-autodoc-typehints>=1.24.0",
]

[project.urls]
Homepage = "https://infographix.ai"
Documentation = "https://docs.infographix.ai/sdk/python"
Repository = "https://github.com/doublegate/infographix-sdk-python"
Changelog = "https://github.com/doublegate/infographix-sdk-python/blob/main/CHANGELOG.md"

[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
infographix = ["py.typed"]

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = "test_*.py"
python_classes = "Test*"
python_functions = "test_*"
addopts = "--cov=infographix --cov-report=term --cov-report=html"

[tool.mypy]
python_version = "3.8"
strict = true
warn_return_any = true
warn_unused_configs = true

[tool.ruff]
line-length = 100
target-version = "py38"
select = ["E", "F", "I", "N", "W"]

[tool.black]
line-length = 100
target-version = ["py38", "py39", "py310", "py311", "py312"]
```

---

### Core Implementation

**Main Client:**

```python
# src/infographix/client.py
from typing import Optional
from .config import ClientConfig, DEFAULT_CONFIG
from .http.client import HttpClient
from .api.generation import GenerationApi
from .api.batch import BatchApi
from .api.templates import TemplatesApi
from .api.history import HistoryApi
from .api.account import AccountApi
from .api.webhooks import WebhooksApi
from .api.catalog import CatalogApi


class InfoGraphixClient:
    """
    Official InfoGraphix AI SDK Client.

    Args:
        api_key: Your InfoGraphix API key
        base_url: API base URL (default: https://api.infographix.ai)
        timeout: Request timeout in seconds (default: 60)
        max_retries: Maximum number of retries (default: 3)
        **kwargs: Additional configuration options

    Example:
        >>> client = InfoGraphixClient(api_key="your_api_key")
        >>> result = client.generate.create(topic="Climate Change")
    """

    def __init__(
        self,
        api_key: str,
        base_url: Optional[str] = None,
        timeout: Optional[int] = None,
        max_retries: Optional[int] = None,
        **kwargs
    ):
        self.config = ClientConfig(
            api_key=api_key,
            base_url=base_url or DEFAULT_CONFIG.base_url,
            timeout=timeout or DEFAULT_CONFIG.timeout,
            max_retries=max_retries or DEFAULT_CONFIG.max_retries,
            **kwargs
        )

        self._http = HttpClient(self.config)

        # Initialize namespaced APIs
        self.generate = GenerationApi(self._http)
        self.batch = BatchApi(self._http)
        self.templates = TemplatesApi(self._http)
        self.history = HistoryApi(self._http)
        self.account = AccountApi(self._http)
        self.webhooks = WebhooksApi(self._http)
        self.catalog = CatalogApi(self._http)

    def __enter__(self):
        """Context manager entry"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()

    def close(self):
        """Close HTTP client and cleanup resources"""
        self._http.close()
```

**Async Client:**

```python
# src/infographix/async_client.py
from typing import Optional
from .config import ClientConfig, DEFAULT_CONFIG
from .http.client import AsyncHttpClient
from .api.generation import AsyncGenerationApi
from .api.batch import AsyncBatchApi
# ... other async APIs


class AsyncInfoGraphixClient:
    """
    Async version of InfoGraphix AI SDK Client.

    Args:
        api_key: Your InfoGraphix API key
        base_url: API base URL
        timeout: Request timeout in seconds
        **kwargs: Additional configuration options

    Example:
        >>> async with AsyncInfoGraphixClient(api_key="key") as client:
        ...     result = await client.generate.create(topic="AI")
    """

    def __init__(self, api_key: str, **kwargs):
        self.config = ClientConfig(api_key=api_key, **kwargs)
        self._http = AsyncHttpClient(self.config)

        # Initialize async APIs
        self.generate = AsyncGenerationApi(self._http)
        self.batch = AsyncBatchApi(self._http)
        # ... other APIs

    async def __aenter__(self):
        """Async context manager entry"""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close()

    async def close(self):
        """Close HTTP client"""
        await self._http.close()
```

**HTTP Client:**

```python
# src/infographix/http/client.py
import httpx
from typing import Any, Dict, Optional
from ..config import ClientConfig
from ..exceptions import InfoGraphixError
from .retry import retry_with_backoff


class HttpClient:
    """HTTP client for API requests"""

    def __init__(self, config: ClientConfig):
        self.config = config
        self.client = httpx.Client(
            base_url=config.base_url,
            headers={
                "X-API-Key": config.api_key,
                "Content-Type": "application/json",
            },
            timeout=config.timeout,
        )

    @retry_with_backoff()
    def request(
        self,
        method: str,
        path: str,
        *,
        json: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Make HTTP request with retry"""
        response = self.client.request(
            method=method,
            url=path,
            json=json,
            params=params,
        )

        if not response.is_success:
            self._handle_error(response)

        return response.json()

    def get(self, path: str, **kwargs) -> Dict[str, Any]:
        return self.request("GET", path, **kwargs)

    def post(self, path: str, **kwargs) -> Dict[str, Any]:
        return self.request("POST", path, **kwargs)

    def put(self, path: str, **kwargs) -> Dict[str, Any]:
        return self.request("PUT", path, **kwargs)

    def delete(self, path: str, **kwargs) -> Dict[str, Any]:
        return self.request("DELETE", path, **kwargs)

    def _handle_error(self, response: httpx.Response) -> None:
        try:
            body = response.json()
            error = body.get("error", {})
            raise InfoGraphixError(
                code=error.get("code", "UNKNOWN_ERROR"),
                message=error.get("message", f"HTTP {response.status_code}"),
                status_code=response.status_code,
                details=error.get("details"),
            )
        except Exception:
            raise InfoGraphixError(
                code="HTTP_ERROR",
                message=f"HTTP {response.status_code}: {response.text}",
                status_code=response.status_code,
            )

    def close(self):
        """Close HTTP client"""
        self.client.close()
```

**Pydantic Models:**

```python
# src/infographix/types/models.py
from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class UserTier(str, Enum):
    """User subscription tier"""
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class JobStatus(str, Enum):
    """Generation job status"""
    PENDING = "pending"
    ANALYZING = "analyzing"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class User(BaseModel):
    """User account model"""
    id: str
    email: str
    tier: UserTier
    created_at: datetime
    updated_at: datetime


class GenerationJob(BaseModel):
    """Generation job model"""
    id: str
    user_id: str
    status: JobStatus
    topic: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        use_enum_values = True
```

---

### Publishing to PyPI

**GitHub Actions Workflow:**

```yaml
# .github/workflows/publish-pypi.yml
name: Publish to PyPI

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install build twine

      - name: Run tests
        run: |
          pip install -e ".[dev]"
          pytest

      - name: Build package
        run: python -m build

      - name: Publish to PyPI
        env:
          TWINE_USERNAME: __token__
          TWINE_PASSWORD: ${{ secrets.PYPI_TOKEN }}
        run: twine upload dist/*
```

---

## Timeline & Milestones

### TypeScript SDK (6 weeks)

**Week 1-2: Foundation**
- [ ] Project setup and build system
- [ ] HTTP client implementation
- [ ] Error handling
- [ ] Configuration system

**Week 3-4: API Implementation**
- [ ] Generation API
- [ ] Batch API
- [ ] Templates API
- [ ] History, Account, Webhooks, Catalog APIs

**Week 5-6: Testing & Publishing**
- [ ] Unit tests (90%+ coverage)
- [ ] Integration tests
- [ ] Documentation (TypeDoc)
- [ ] Examples and guides
- [ ] npm publishing setup

### Python SDK (6 weeks)

**Week 1-2: Foundation**
- [ ] Project setup (pyproject.toml)
- [ ] HTTP client (httpx)
- [ ] Pydantic models
- [ ] Configuration

**Week 3-4: API Implementation**
- [ ] Sync client APIs
- [ ] Async client APIs
- [ ] Context managers

**Week 5-6: Testing & Publishing**
- [ ] Unit tests (pytest)
- [ ] Integration tests
- [ ] Sphinx documentation
- [ ] Examples
- [ ] PyPI publishing setup

---

## Success Criteria

### TypeScript SDK
- [ ] 90%+ test coverage
- [ ] Full TypeDoc documentation
- [ ] 10+ code examples
- [ ] npm package published
- [ ] TypeScript types validated
- [ ] Tree-shakeable build
- [ ] Browser and Node.js support confirmed

### Python SDK
- [ ] 90%+ test coverage
- [ ] Full Sphinx documentation
- [ ] 10+ code examples
- [ ] PyPI package published
- [ ] Type hints validated (mypy)
- [ ] Sync and async clients working
- [ ] Context manager support verified

---

**Next Steps:**
1. Review and approve this plan
2. Set up SDK repositories
3. Begin parallel development
4. Weekly sync meetings for API changes
5. Integration testing with backend

**Related Documents:**
- [Backend Implementation Plan](./BACKEND-IMPLEMENTATION-PLAN.md)
- [Development Guide](./DEVELOPMENT-GUIDE.md)
- [v2.2.0 Release Plan](../version-plans/v2.2.0-PLAN.md)
