

# API Design Documentation

**Version:** 2.2.0
**Status:** Foundation (Types & Specification Only)
**Date:** 2025-12-13

## Overview

This document outlines the design decisions, architectural patterns, and rationale behind the InfoGraphix AI REST API v2.2.0 foundation work.

**Note:** This release contains only type definitions, SDK interfaces, and OpenAPI specification. The actual backend implementation is planned for future releases.

## Design Principles

### 1. RESTful Architecture

The API follows REST principles with:
- Resource-based URLs (`/templates`, `/generate`, etc.)
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Stateless request/response model
- HATEOAS-inspired links in responses

### 2. API-First Development

- OpenAPI 3.1 specification serves as the source of truth
- TypeScript types derived from the spec
- SDK interfaces match the specification exactly
- Mock client enables frontend development before backend exists

### 3. Developer Experience

Prioritizes ease of use:
- Comprehensive JSDoc comments
- Consistent error messages
- Detailed response metadata
- Helper functions for common operations

## Authentication Strategy

### API Key Authentication

**Decision:** Use API keys passed via `X-API-Key` header.

**Rationale:**
- Simple for developers to implement
- No complex OAuth flows needed
- Suitable for server-to-server communication
- Easy to rotate and revoke

**Alternative Considered:** JWT tokens were considered but deemed overly complex for the initial release.

## Rate Limiting Approach

### Token Bucket Algorithm

**Implementation:**
- Per-user rate limiting (requests per minute)
- Daily quota tracking (generations per day)
- Tier-based limits (Free/Pro/Enterprise)

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1687856400
X-Quota-Limit: 500
X-Quota-Remaining: 423
X-Quota-Reset: 1687910400
```

**Rationale:**
- Standard pattern recognized by developers
- Communicates limits proactively
- Enables client-side rate limiting
- Supports burst traffic with gradual refill

## Error Handling Patterns

### Standardized Error Response

```typescript
{
  code: ApiErrorCode,
  message: string,
  details?: Record<string, unknown>,
  timestamp: string,
  requestId?: string,
  statusCode?: number
}
```

**Key Features:**
- Distinct error codes for specific scenarios
- HTTP status codes match error types
- Structured details for validation errors
- Request IDs for debugging

### Error Code Categories

1. **Authentication (401):** UNAUTHORIZED, INVALID_API_KEY, EXPIRED_TOKEN
2. **Authorization (403):** FORBIDDEN, INSUFFICIENT_PERMISSIONS
3. **Validation (400):** INVALID_REQUEST, INVALID_PARAMETER, MISSING_REQUIRED_FIELD
4. **Not Found (404):** NOT_FOUND, TEMPLATE_NOT_FOUND, JOB_NOT_FOUND
5. **Rate Limiting (429):** RATE_LIMITED, QUOTA_EXCEEDED
6. **Server Errors (500):** GENERATION_FAILED, INTERNAL_ERROR

## Versioning Strategy

### URL-Based Versioning

**Format:** `/api/v1/...`

**Rationale:**
- Clear and explicit
- Easy to route at infrastructure level
- Supports multiple versions simultaneously
- Common industry standard

### Breaking vs Non-Breaking Changes

**Breaking Changes** (require new version):
- Removing endpoints
- Removing/renaming fields
- Changing field types
- Changing authentication

**Non-Breaking Changes** (same version):
- Adding endpoints
- Adding optional fields
- Deprecating fields (with warnings)
- Adding enum values

### Deprecation Process

1. Add deprecation warning in `meta.deprecations`
2. Document in changelog
3. Provide migration guide
4. Maintain for at least 6 months
5. Remove in next major version

## Pagination Design

### Dual Pagination Support

**Offset-Based:**
```typescript
{
  page: 1,
  pageSize: 20
}
```

**Cursor-Based:**
```typescript
{
  cursor: "base64_encoded_cursor"
}
```

**Rationale:**
- Offset-based for simple use cases
- Cursor-based for large datasets and real-time updates
- Consistent response format for both

### Pagination Metadata

Includes all navigation information:
```typescript
{
  page: number,
  pageSize: number,
  totalPages: number,
  totalItems: number,
  hasNext: boolean,
  hasPrevious: boolean,
  nextCursor?: string,
  previousCursor?: string
}
```

## Async Operation Handling

### Job-Based Pattern

**Flow:**
1. POST /generate → Returns job ID immediately
2. GET /generate/{jobId} → Poll for status
3. GET /generate/{jobId}/result → Retrieve completed result

**Statuses:** pending → analyzing → generating → completed/failed

**Rationale:**
- Infographic generation takes 15-45 seconds
- Prevents HTTP timeouts
- Enables progress tracking
- Supports webhook notifications

### Webhook Integration

Optional webhook URL can be provided:
- Receives notifications on status changes
- HMAC-SHA256 signature verification
- Automatic retry with exponential backoff
- Delivery logs for debugging

## Data Models

### Core Entities

1. **User** - Account and authentication
2. **GenerationJob** - Single infographic generation
3. **BatchJob** - Multiple generation requests
4. **Template** - Reusable style configuration
5. **Webhook** - Event notification endpoint
6. **SavedVersion** - Generation history item

### Relationship Design

- User → owns → Templates, Jobs, Webhooks
- BatchJob → contains → multiple BatchItems
- Template → referenced by → Generation requests

## SDK Architecture

### Namespaced API

Groups related operations:
```typescript
client.generate.create()
client.batch.create()
client.templates.list()
client.account.getQuota()
```

**Rationale:**
- Logical grouping
- Prevents naming conflicts
- Matches API structure
- Autocomplete-friendly

### Configuration Options

Comprehensive configuration:
- Base URL and timeout
- Retry configuration
- Webhook polling
- Logging and debugging

### Mock Client

Full interface implementation for testing:
- Simulates delays
- In-memory storage
- Rate limit simulation
- Error injection

## Security Considerations

### Input Validation

- All request parameters validated
- Type checking via TypeScript
- Schema validation (future: Zod/Joi)
- Sanitization of user inputs

### Rate Limiting

- Prevents abuse
- Fair usage across tiers
- DDoS protection
- Quota management

### Webhook Security

- HTTPS-only endpoints
- HMAC signature verification
- Secret rotation support
- Delivery attempt limits

## Performance Considerations

### Caching Strategy

- Analysis results cached (future)
- Template configurations cached
- Rate limit status cached
- Response compression (gzip)

### Optimization Techniques

- Pagination prevents large payloads
- Cursor-based pagination for efficiency
- Batch operations reduce round trips
- Webhook notifications reduce polling

## Future Enhancements

### Planned for v2.2.x

1. **Backend Implementation** - Express/Fastify server
2. **Database Layer** - PostgreSQL + Redis
3. **Queue System** - Bull/BullMQ for jobs
4. **Python SDK** - PyPI package
5. **JavaScript SDK** - npm package

### Considered for v2.3.0+

1. **GraphQL API** - Alternative to REST
2. **Streaming Responses** - Server-Sent Events
3. **Advanced Filters** - Complex query DSL
4. **API Playground** - Interactive documentation
5. **SDK Code Generation** - OpenAPI Generator

## Migration Path

### From v1.x (Frontend-Only)

The current frontend application can be gradually migrated:

1. **Phase 1:** Use mock client for testing
2. **Phase 2:** Switch to real API when available
3. **Phase 3:** Migrate localStorage to API history
4. **Phase 4:** Implement webhook notifications

### Backwards Compatibility

- Frontend types remain compatible
- Existing enums (ImageSize, AspectRatio, etc.) unchanged
- Analysis/generation flow preserved
- No breaking changes to current codebase

## References

- [OpenAPI 3.1 Specification](./openapi.yaml)
- [v2.2.0 Release Plan](../planning/version-plans/v2.2.0-PLAN.md)
- [Current Architecture](../technical/ARCHITECTURE.md)
- [API Guide](../guides/API.md)

## Changelog

**2025-12-13** - Initial API design documentation for v2.2.0 foundation
