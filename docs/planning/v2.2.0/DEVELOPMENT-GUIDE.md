# Development Guide - v2.2.0-foundation

**Version:** v2.2.0-foundation
**Status:** Active
**Created:** 2025-12-13
**Target Audience:** Backend developers, SDK contributors, API integrators

---

## Overview

This guide explains how to use the v2.2.0-foundation type system, SDK interfaces, and OpenAPI specification for development. The foundation provides type-safe contracts that will be used for backend implementation, SDK development, and client integrations.

**Foundation Components:**
- Type system (`src/api/types/`)
- SDK interfaces (`src/api/sdk/`)
- Mock client (`src/api/mock/`)
- OpenAPI specification (`docs/api/openapi.yaml`)

---

## Getting Started

### Prerequisites

```bash
# Clone the repository
git clone https://github.com/doublegate/InfoGraphix-GenAI.git
cd InfoGraphix-GenAI

# Install dependencies
npm install

# Run tests to verify foundation
npm test -- src/api/__tests__

# Build the project
npm run build
```

---

## Using the Type System

### Importing Types

All API types are exported from `src/api/types/index.ts`:

```typescript
import type {
  // Common types
  PaginationParams,
  PaginationMeta,
  SortParams,
  FilterParams,
  RateLimitInfo,

  // Error types
  ApiErrorCode,
  ApiError,

  // Models
  User,
  UserTier,
  GenerationJob,
  JobStatus,
  BatchJob,
  Webhook,
  Template,

  // Request types
  GenerateInfographicRequest,
  BatchGenerateRequest,
  CreateTemplateRequest,

  // Response types
  ApiResponse,
  GenerationResponse,
  BatchResponse,
} from './api/types';
```

### Error Handling

**Using Error Helpers:**

```typescript
import {
  createApiError,
  createValidationError,
  createRateLimitError,
  ApiErrorCode,
} from './api/types';

// Create a generic API error
const error = createApiError(
  ApiErrorCode.INTERNAL_ERROR,
  'An unexpected error occurred',
  { context: 'database query' }
);

// Create a validation error
const validationError = createValidationError(
  'Invalid topic length',
  { field: 'topic', min: 3, max: 1000 }
);

// Create a rate limit error
const rateLimitError = createRateLimitError(120); // retry after 120 seconds
```

**Error Code to HTTP Status Mapping:**

```typescript
import { ErrorCodeToHttpStatus, ApiErrorCode } from './api/types';

const statusCode = ErrorCodeToHttpStatus[ApiErrorCode.UNAUTHORIZED]; // 401
const notFoundCode = ErrorCodeToHttpStatus[ApiErrorCode.NOT_FOUND]; // 404
```

### Rate Limit Headers

**Converting to/from HTTP Headers:**

```typescript
import { toRateLimitHeaders, fromRateLimitHeaders } from './api/types';

// Convert RateLimitInfo to HTTP headers
const rateLimitInfo = {
  limit: 60,
  remaining: 45,
  reset: new Date('2026-06-15T12:00:00Z'),
  quotaLimit: 500,
  quotaRemaining: 423,
  quotaReset: new Date('2026-06-16T00:00:00Z'),
};

const headers = toRateLimitHeaders(rateLimitInfo);
// {
//   'X-RateLimit-Limit': '60',
//   'X-RateLimit-Remaining': '45',
//   'X-RateLimit-Reset': '1687856400',
//   ...
// }

// Parse from HTTP headers
const parsed = fromRateLimitHeaders(headers);
```

### Response Helpers

**Creating Standardized Responses:**

```typescript
import { createSuccessResponse, createErrorResponse } from './api/types';

// Success response
const success = createSuccessResponse(
  { id: 'gen_123', status: 'completed' },
  { page: 1, limit: 10, total: 100 }
);

// Error response
const error = createErrorResponse(
  'INVALID_INPUT',
  'Topic is required',
  { field: 'topic' }
);
```

---

## Working with the Mock Client

The mock client (`src/api/mock/`) provides a fully functional API implementation for testing without a backend.

### Basic Usage

```typescript
import { createMockClient } from './api/mock';

// Create mock client
const client = createMockClient({
  apiKey: 'test_key',
  // Optional: inject errors for testing
  injectErrors: false,
});

// Use like the real client
const response = await client.generate.create({
  topic: 'Climate Change',
  style: 'modern',
  palette: 'ocean',
  size: '2K',
  aspectRatio: 'landscape',
});

console.log(response.data.id); // 'job_1'
```

### Testing with Mock Client

```typescript
import { describe, it, expect } from 'vitest';
import { createMockClient } from './api/mock';

describe('Generation Flow', () => {
  it('should create and complete generation', async () => {
    const client = createMockClient({ apiKey: 'test' });

    // Create generation
    const createResp = await client.generate.create({
      topic: 'Test Topic',
      style: 'modern',
      palette: 'professional',
      size: '1K',
      aspectRatio: 'square',
    });

    expect(createResp.success).toBe(true);
    expect(createResp.data.status).toBe('pending');

    // Wait for completion (mock delays are short)
    await new Promise(resolve => setTimeout(resolve, 100));

    const statusResp = await client.generate.getStatus(createResp.data.id);
    expect(['analyzing', 'generating', 'completed']).toContain(
      statusResp.data.status
    );
  });
});
```

### Error Injection for Testing

```typescript
import { createMockClient } from './api/mock';

// Create client with error injection
const client = createMockClient({
  apiKey: 'test',
  injectErrors: true, // Randomly inject errors
});

// Test error handling
try {
  await client.generate.create({ topic: 'Test' });
} catch (error) {
  expect(error.code).toBeDefined();
  expect(error.statusCode).toBeGreaterThan(0);
}
```

---

## Validating Against OpenAPI Specification

### Using the Specification

The OpenAPI spec is located at `docs/api/openapi.yaml` (645 lines).

**View in Swagger UI:**

```bash
# Install Swagger UI CLI
npm install -g swagger-ui-cli

# Serve the spec
swagger-ui docs/api/openapi.yaml
```

**Validate Requests/Responses:**

```bash
# Install OpenAPI validator
npm install -g @apidevtools/swagger-cli

# Validate the spec
swagger-cli validate docs/api/openapi.yaml
```

### Example: Validating a Request

```typescript
import Ajv from 'ajv';
import openapiSpec from '../../../docs/api/openapi.yaml';

const ajv = new Ajv({ allErrors: true });

// Extract schema from OpenAPI spec
const schema = openapiSpec.components.schemas.GenerateInfographicRequest;

// Validate request data
const validate = ajv.compile(schema);
const isValid = validate(requestData);

if (!isValid) {
  console.error(validate.errors);
}
```

---

## Extending the Type System

### Adding New Request Types

**Step 1: Define the Request Interface**

```typescript
// src/api/types/requests.ts

/**
 * Request to create a custom style
 */
export interface CreateCustomStyleRequest {
  /** Style name */
  name: string;
  /** Style description */
  description?: string;
  /** Base style to extend */
  baseStyle: InfographicStyle;
  /** Custom modifications */
  modifications: {
    colorOverrides?: string[];
    fontFamily?: string;
    layout?: 'grid' | 'flow' | 'columns';
  };
}
```

**Step 2: Export from Index**

```typescript
// src/api/types/index.ts
export type { CreateCustomStyleRequest } from './requests';
```

**Step 3: Update OpenAPI Spec**

```yaml
# docs/api/openapi.yaml
components:
  schemas:
    CreateCustomStyleRequest:
      type: object
      required:
        - name
        - baseStyle
        - modifications
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        description:
          type: string
          maxLength: 500
        baseStyle:
          $ref: '#/components/schemas/InfographicStyle'
        modifications:
          type: object
          # ... etc
```

**Step 4: Add Tests**

```typescript
// src/api/__tests__/types.test.ts

describe('CreateCustomStyleRequest', () => {
  it('should validate correct request', () => {
    const request: CreateCustomStyleRequest = {
      name: 'My Style',
      baseStyle: InfographicStyle.Modern,
      modifications: {
        colorOverrides: ['#FF5733', '#3498DB'],
      },
    };

    expect(request).toBeDefined();
  });
});
```

---

## Adding New API Endpoints

### Step 1: Define Types

```typescript
// Add request type in src/api/types/requests.ts
export interface UploadImageRequest {
  file: Blob;
  purpose: 'template' | 'color-extraction';
}

// Add response type in src/api/types/responses.ts
export interface UploadImageResponse extends ApiResponse<{
  id: string;
  url: string;
  purpose: string;
  uploadedAt: string;
}> {}
```

### Step 2: Update SDK Interface

```typescript
// src/api/sdk/client.ts

/**
 * Media upload API
 */
export interface MediaApi {
  /**
   * Upload an image
   */
  uploadImage(request: UploadImageRequest): Promise<UploadImageResponse>;

  /**
   * Delete an uploaded image
   */
  deleteImage(imageId: string): Promise<DeleteResponse>;
}

export interface InfoGraphixClient {
  // ... existing APIs
  media: MediaApi;
}
```

### Step 3: Implement in Mock Client

```typescript
// src/api/mock/mockClient.ts

class MockMediaApi implements MediaApi {
  async uploadImage(request: UploadImageRequest): Promise<UploadImageResponse> {
    const imageId = `img_${Date.now()}`;

    return createSuccessResponse({
      id: imageId,
      url: `https://mock.infographix.ai/uploads/${imageId}`,
      purpose: request.purpose,
      uploadedAt: new Date().toISOString(),
    });
  }

  async deleteImage(imageId: string): Promise<DeleteResponse> {
    return createSuccessResponse({ deleted: true });
  }
}

// Add to MockInfoGraphixClient
export class MockInfoGraphixClient implements InfoGraphixClient {
  // ... existing APIs
  public readonly media: MediaApi;

  constructor(options: ClientOptions) {
    // ...
    this.media = new MockMediaApi();
  }
}
```

### Step 4: Update OpenAPI Specification

```yaml
# docs/api/openapi.yaml
paths:
  /api/v1/media/upload:
    post:
      summary: Upload an image
      tags:
        - Media
      security:
        - ApiKeyAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                purpose:
                  type: string
                  enum: [template, color-extraction]
      responses:
        '200':
          description: Image uploaded successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UploadImageResponse'
```

---

## Testing Best Practices

### Unit Testing Types

```typescript
// src/api/__tests__/types.test.ts

import { describe, it, expect } from 'vitest';
import {
  createApiError,
  toRateLimitHeaders,
  fromRateLimitHeaders,
} from '../types';

describe('API Types', () => {
  describe('Error Creation', () => {
    it('should create valid API error', () => {
      const error = createApiError('INVALID_INPUT', 'Test error');

      expect(error.code).toBe('INVALID_INPUT');
      expect(error.message).toBe('Test error');
      expect(error.timestamp).toBeDefined();
    });
  });

  describe('Rate Limit Headers', () => {
    it('should round-trip headers correctly', () => {
      const original = {
        limit: 60,
        remaining: 45,
        reset: new Date('2026-01-01T00:00:00Z'),
        quotaLimit: 500,
        quotaRemaining: 400,
        quotaReset: new Date('2026-01-02T00:00:00Z'),
      };

      const headers = toRateLimitHeaders(original);
      const parsed = fromRateLimitHeaders(headers);

      expect(parsed.limit).toBe(original.limit);
      expect(parsed.remaining).toBe(original.remaining);
      expect(parsed.reset.getTime()).toBe(original.reset.getTime());
    });
  });
});
```

### Integration Testing with Mock Client

```typescript
// tests/integration/full-workflow.test.ts

import { describe, it, expect } from 'vitest';
import { createMockClient } from '../../src/api/mock';

describe('Full Generation Workflow', () => {
  it('should complete end-to-end generation', async () => {
    const client = createMockClient({ apiKey: 'test' });

    // 1. Create generation
    const job = await client.generate.create({
      topic: 'AI Trends 2026',
      style: 'modern',
      palette: 'vibrant',
      size: '2K',
      aspectRatio: 'landscape',
    });

    expect(job.success).toBe(true);
    const jobId = job.data.id;

    // 2. Poll for status
    let status = await client.generate.getStatus(jobId);
    expect(['pending', 'analyzing', 'generating']).toContain(
      status.data.status
    );

    // 3. Wait for completion (mock is fast)
    await new Promise(resolve => setTimeout(resolve, 200));
    status = await client.generate.getStatus(jobId);

    // 4. Get result
    if (status.data.status === 'completed') {
      const result = await client.generate.getResult(jobId);

      expect(result.success).toBe(true);
      expect(result.data.imageUrl).toBeDefined();
      expect(result.data.analysis).toBeDefined();
    }
  });
});
```

---

## Contributing to the Foundation

### Adding New Features

**1. Proposal**
- Open GitHub Discussion describing the feature
- Provide use cases and API design
- Get feedback from maintainers

**2. Implementation**
- Create feature branch from `main`
- Add types to `src/api/types/`
- Update SDK interfaces in `src/api/sdk/`
- Implement in mock client
- Update OpenAPI spec
- Add tests

**3. Documentation**
- Add JSDoc comments
- Update this guide if needed
- Add examples in `examples/`

**4. Testing**
- Run `npm test` (all tests must pass)
- Run `npm run build` (no errors)
- Run `npm run lint` (no warnings)

**5. Pull Request**
- Create PR against `main`
- Fill out PR template
- Request review from maintainers

### Code Style Guidelines

**TypeScript:**

```typescript
// Use explicit return types
function createUser(email: string): User {
  // ...
}

// Use type imports
import type { User, UserTier } from './types';

// JSDoc for all public APIs
/**
 * Creates a new user account
 *
 * @param email - User email address
 * @param tier - Subscription tier (default: FREE)
 * @returns Created user object
 */
export function createUser(
  email: string,
  tier: UserTier = UserTier.FREE
): User {
  // ...
}

// Prefer const for immutables
const API_VERSION = 'v1';

// Use template literals
const url = `${baseUrl}/api/${API_VERSION}/users`;

// Destructure when appropriate
const { id, email, tier } = user;
```

**Testing:**

```typescript
// Descriptive test names
describe('GenerationApi', () => {
  describe('create()', () => {
    it('should create generation job with valid request', async () => {
      // Arrange
      const client = createMockClient({ apiKey: 'test' });
      const request = { topic: 'Test', style: 'modern' };

      // Act
      const response = await client.generate.create(request);

      // Assert
      expect(response.success).toBe(true);
      expect(response.data.id).toBeDefined();
    });

    it('should throw on invalid request', async () => {
      // ...
    });
  });
});
```

---

## Common Patterns

### Pagination

```typescript
import type { PaginationParams, PaginationMeta } from './api/types';

async function fetchAllTemplates(client: InfoGraphixClient) {
  const allTemplates = [];
  let page = 1;
  const limit = 50;

  while (true) {
    const response = await client.templates.list({
      pagination: { offset: (page - 1) * limit, limit },
    });

    allTemplates.push(...response.data);

    const meta = response.meta as PaginationMeta;
    if (!meta.hasMore) break;

    page++;
  }

  return allTemplates;
}
```

### Sorting and Filtering

```typescript
import type { SortParams, FilterParams } from './api/types';

// Fetch with sorting
const response = await client.history.list({
  sort: {
    field: 'createdAt',
    order: 'desc',
  },
  pagination: { offset: 0, limit: 25 },
});

// Fetch with filtering
const filtered = await client.history.list({
  filter: {
    field: 'status',
    operator: 'eq',
    value: 'completed',
  },
  sort: { field: 'createdAt', order: 'desc' },
  pagination: { offset: 0, limit: 25 },
});
```

### Error Handling

```typescript
import { InfoGraphixError } from './api/types';

try {
  const result = await client.generate.create(request);
} catch (error) {
  if (error instanceof InfoGraphixError) {
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        console.log(`Rate limited. Retry after ${error.details?.retryAfter}s`);
        break;
      case 'QUOTA_EXCEEDED':
        console.log('Daily quota exceeded');
        break;
      case 'INVALID_INPUT':
        console.log('Validation error:', error.details);
        break;
      default:
        console.error('API error:', error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Batch Operations

```typescript
async function generateMultiple(
  client: InfoGraphixClient,
  topics: string[]
) {
  // Create batch
  const batch = await client.batch.create({
    name: 'Bulk Generation',
    items: topics.map(topic => ({
      topic,
      style: 'modern',
      palette: 'professional',
      size: '2K',
      aspectRatio: 'landscape',
    })),
  });

  console.log(`Batch created: ${batch.data.id}`);

  // Poll for completion
  while (true) {
    const status = await client.batch.getStatus(batch.data.id);

    console.log(
      `Progress: ${status.data.completedItems}/${status.data.totalItems}`
    );

    if (status.data.status === 'completed') {
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Get results
  const results = await client.batch.getResults(batch.data.id);
  return results.data.items;
}
```

---

## Troubleshooting

### Type Errors

**Problem:** TypeScript errors when importing types

```
Module '"./api/types"' has no exported member 'User'
```

**Solution:** Check that type is exported in `src/api/types/index.ts`

```typescript
// Ensure this exists:
export type { User } from './models';
```

---

### Mock Client Not Working

**Problem:** Mock client methods return undefined

**Solution:** Verify mock client initialization

```typescript
import { createMockClient } from './api/mock';

// Correct:
const client = createMockClient({ apiKey: 'test' });

// Incorrect:
const client = new MockInfoGraphixClient(); // Missing options
```

---

### OpenAPI Validation Fails

**Problem:** Spec fails validation

```
Swagger schema validation failed.
#/components/schemas/User/properties/tier must have required property 'type'
```

**Solution:** Fix the schema definition

```yaml
# Incorrect:
tier:
  enum: [free, pro, enterprise]

# Correct:
tier:
  type: string
  enum: [free, pro, enterprise]
```

---

## Resources

### Documentation
- [API Design](../../api/API-DESIGN.md)
- [OpenAPI Specification](../../api/openapi.yaml)
- [Backend Implementation Plan](./BACKEND-IMPLEMENTATION-PLAN.md)
- [SDK Development Plan](./SDK-DEVELOPMENT-PLAN.md)

### Code References
- Type System: `src/api/types/`
- SDK Interfaces: `src/api/sdk/`
- Mock Client: `src/api/mock/`
- Tests: `src/api/__tests__/`

### External Resources
- [OpenAPI 3.1 Spec](https://spec.openapis.org/oas/v3.1.0)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)

---

## Support

### Questions?
- GitHub Discussions: [InfoGraphix-GenAI Discussions](https://github.com/doublegate/InfoGraphix-GenAI/discussions)
- Issues: [Report a bug](https://github.com/doublegate/InfoGraphix-GenAI/issues)

### Contributing
See [CONTRIBUTING.md](../../../CONTRIBUTING.md) for contribution guidelines.

---

**Last Updated:** 2025-12-13
**Maintainers:** InfoGraphix Team
**Version:** v2.2.0-foundation
