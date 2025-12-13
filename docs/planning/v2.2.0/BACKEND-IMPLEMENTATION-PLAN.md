# Backend Implementation Plan - v2.2.0 API Platform

**Version:** v2.2.0 (Q2 2026)
**Status:** Planning
**Created:** 2025-12-13
**Foundation:** v2.2.0-foundation (Released 2025-12-13)

---

## Overview

This document outlines the comprehensive backend implementation plan for the InfoGraphix AI API Platform (v2.2.0). The foundation work (type definitions, SDK interfaces, OpenAPI spec, mock client) was completed in v2.2.0-foundation. This plan covers the actual backend implementation targeting Q2 2026.

**Foundation Assets:**
- TypeScript type system (`src/api/types/`)
- SDK interface definitions (`src/api/sdk/`)
- Mock API client (`src/api/mock/`)
- OpenAPI 3.1 specification (`docs/api/openapi.yaml`)
- API design documentation (`docs/api/API-DESIGN.md`)

---

## Technology Stack Decisions

### Backend Framework

**Option 1: Express.js (Recommended)**

**Pros:**
- Mature ecosystem with extensive middleware
- Large community and extensive documentation
- Well-tested in production environments
- Easy to find developers
- Flexible and unopinionated
- Excellent TypeScript support

**Cons:**
- Slightly slower than newer frameworks
- Less built-in features (needs middleware)
- Callback-based (though async/await works)

**Recommendation:** Use Express.js for stability, community support, and developer familiarity.

**Option 2: Fastify**

**Pros:**
- High performance (2-3x faster than Express)
- Built-in schema validation (JSON Schema)
- TypeScript-first design
- Modern plugin system
- Excellent logging

**Cons:**
- Smaller ecosystem
- Fewer developers familiar with it
- Less middleware available

**Decision:** Start with Express.js. Consider Fastify migration if performance becomes critical.

---

### Database Architecture

**Primary Database: PostgreSQL**

**Rationale:**
- ACID compliance for critical data (users, jobs, webhooks)
- JSON column support for flexible metadata
- Full-text search capabilities
- Battle-tested reliability
- Excellent performance at scale

**Schema Design:**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  api_key_hash VARCHAR(255) NOT NULL,
  tier VARCHAR(20) NOT NULL DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT tier_check CHECK (tier IN ('free', 'pro', 'enterprise'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_api_key_hash ON users(api_key_hash);

-- User quotas table
CREATE TABLE user_quotas (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  daily_generations_limit INTEGER NOT NULL,
  daily_generations_used INTEGER DEFAULT 0,
  monthly_generations_limit INTEGER NOT NULL,
  monthly_generations_used INTEGER DEFAULT 0,
  batch_size_limit INTEGER NOT NULL,
  quota_reset_date DATE NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage stats table
CREATE TABLE usage_stats (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint VARCHAR(100) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usage_stats_user_id ON usage_stats(user_id);
CREATE INDEX idx_usage_stats_timestamp ON usage_stats(timestamp);

-- Generation jobs table
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  request_data JSONB NOT NULL,
  result_data JSONB,
  error_code VARCHAR(50),
  error_message TEXT,
  analysis_started_at TIMESTAMP,
  analysis_completed_at TIMESTAMP,
  generation_started_at TIMESTAMP,
  generation_completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT status_check CHECK (status IN (
    'pending', 'analyzing', 'generating', 'completed', 'failed', 'cancelled'
  ))
);

CREATE INDEX idx_jobs_user_id ON generation_jobs(user_id);
CREATE INDEX idx_jobs_status ON generation_jobs(status);
CREATE INDEX idx_jobs_created_at ON generation_jobs(created_at);

-- Batch jobs table
CREATE TABLE batch_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  total_items INTEGER NOT NULL,
  completed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT batch_status_check CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled', 'paused'
  ))
);

CREATE INDEX idx_batch_jobs_user_id ON batch_jobs(user_id);
CREATE INDEX idx_batch_jobs_status ON batch_jobs(status);

-- Batch items table
CREATE TABLE batch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batch_jobs(id) ON DELETE CASCADE,
  job_id UUID REFERENCES generation_jobs(id) ON DELETE SET NULL,
  position INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  request_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT item_status_check CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled'
  ))
);

CREATE INDEX idx_batch_items_batch_id ON batch_items(batch_id);
CREATE INDEX idx_batch_items_job_id ON batch_items(job_id);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tags TEXT[],
  config JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_is_public ON templates(is_public);
CREATE INDEX idx_templates_tags ON templates USING GIN(tags);

-- Webhooks table
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url VARCHAR(2048) NOT NULL,
  secret VARCHAR(255) NOT NULL,
  events TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX idx_webhooks_is_active ON webhooks(is_active);

-- Webhook deliveries table (for tracking and retries)
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  next_retry_at TIMESTAMP,
  last_error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT delivery_status_check CHECK (status IN (
    'pending', 'delivered', 'failed', 'retrying'
  ))
);

CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_next_retry ON webhook_deliveries(next_retry_at);
```

---

### Caching Layer: Redis

**Use Cases:**
1. **Rate Limiting:** Token bucket algorithm implementation
2. **Session Storage:** API tokens and authentication
3. **Job Queues:** Background processing with Bull/BullMQ
4. **Result Caching:** Cache completed generations (TTL: 1 hour)
5. **Quota Tracking:** Real-time quota consumption

**Redis Data Structures:**

```redis
# Rate limiting (token bucket)
HSET rate_limit:{user_id} tokens {count} last_refill {timestamp}
EXPIRE rate_limit:{user_id} 3600

# API tokens
SETEX api_token:{token_hash} 86400 {user_id}

# Job status cache
SETEX job:{job_id}:status 3600 {status_json}

# Quota cache (synced with PostgreSQL)
HSET quota:{user_id} daily {count} monthly {count}
EXPIRE quota:{user_id} 3600
```

---

### Queue System: BullMQ

**Queues:**

1. **Generation Queue** (`generation-queue`)
   - Analysis phase jobs
   - Image generation jobs
   - Priority levels (pro users get higher priority)

2. **Batch Queue** (`batch-queue`)
   - Batch job orchestration
   - Sequential processing with concurrency control

3. **Webhook Queue** (`webhook-queue`)
   - Webhook delivery jobs
   - Retry with exponential backoff

**Configuration:**

```typescript
// Queue setup
import { Queue, Worker } from 'bullmq';

const generationQueue = new Queue('generation-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

// Worker setup
const generationWorker = new Worker(
  'generation-queue',
  async (job) => {
    const { jobId, userId, request } = job.data;

    // Update job status
    await updateJobStatus(jobId, 'analyzing');

    // Analysis phase
    const analysis = await geminiService.analyzeTopic(request);

    await updateJobStatus(jobId, 'generating');

    // Generation phase
    const image = await geminiService.generateInfographicImage(analysis);

    // Store result
    await storeGenerationResult(jobId, { analysis, image });

    await updateJobStatus(jobId, 'completed');

    // Trigger webhook
    await triggerWebhook(userId, 'generation.completed', { jobId });
  },
  {
    connection: redisConnection,
    concurrency: 10,
  }
);
```

---

### File Storage: S3-Compatible

**Options:**
1. **AWS S3** (Production)
2. **MinIO** (Self-hosted alternative)
3. **Cloudflare R2** (Zero egress fees)

**Storage Structure:**

```
bucket: infographix-results
├── {user_id}/
│   ├── {job_id}/
│   │   ├── result.png
│   │   ├── result_1k.png
│   │   ├── result_2k.png
│   │   └── result_4k.png
│   └── batches/
│       └── {batch_id}/
│           └── {item_id}/
│               └── result.png
```

**Access Pattern:**
- Signed URLs with 1-hour expiration
- CDN integration (CloudFront/Cloudflare)
- Automatic cleanup after 30 days

---

## Authentication Implementation

### API Key Strategy

**Generation:**

```typescript
import crypto from 'crypto';

function generateApiKey(): string {
  const prefix = 'ig_';
  const random = crypto.randomBytes(32).toString('hex');
  return `${prefix}${random}`;
}

function hashApiKey(apiKey: string): string {
  return crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
}
```

**Authentication Middleware:**

```typescript
import { Request, Response, NextFunction } from 'express';

async function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'API key required. Provide via X-API-Key header.',
      },
    });
  }

  // Check Redis cache first
  const cachedUserId = await redis.get(`api_key:${hashApiKey(apiKey)}`);

  if (cachedUserId) {
    req.user = await getUserById(cachedUserId);
    return next();
  }

  // Fallback to database
  const user = await findUserByApiKey(apiKey);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_API_KEY',
        message: 'Invalid API key.',
      },
    });
  }

  // Cache for 1 hour
  await redis.setex(`api_key:${hashApiKey(apiKey)}`, 3600, user.id);

  req.user = user;
  next();
}
```

---

## Rate Limiting Architecture

### Token Bucket Algorithm

**Implementation:**

```typescript
import Redis from 'ioredis';

interface RateLimitConfig {
  maxTokens: number;
  refillRate: number; // tokens per second
  refillInterval: number; // milliseconds
}

const RATE_LIMITS: Record<UserTier, RateLimitConfig> = {
  free: { maxTokens: 10, refillRate: 10, refillInterval: 60000 }, // 10/min
  pro: { maxTokens: 60, refillRate: 1, refillInterval: 1000 }, // 60/min
  enterprise: { maxTokens: 300, refillRate: 5, refillInterval: 1000 }, // 300/min
};

async function checkRateLimit(
  userId: string,
  tier: UserTier
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const key = `rate_limit:${userId}`;
  const config = RATE_LIMITS[tier];
  const now = Date.now();

  const data = await redis.hgetall(key);

  let tokens = data.tokens ? parseFloat(data.tokens) : config.maxTokens;
  let lastRefill = data.last_refill ? parseInt(data.last_refill) : now;

  // Calculate tokens to add based on elapsed time
  const elapsed = now - lastRefill;
  const tokensToAdd = (elapsed / config.refillInterval) * config.refillRate;

  tokens = Math.min(config.maxTokens, tokens + tokensToAdd);

  if (tokens < 1) {
    const retryAfter = Math.ceil((1 - tokens) / config.refillRate * (config.refillInterval / 1000));
    return { allowed: false, retryAfter };
  }

  // Consume 1 token
  tokens -= 1;

  await redis.hset(key, 'tokens', tokens.toString(), 'last_refill', now.toString());
  await redis.expire(key, 3600);

  return { allowed: true };
}

// Rate limiting middleware
async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { user } = req;

  const result = await checkRateLimit(user.id, user.tier);

  if (!result.allowed) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: result.retryAfter,
      },
    });
  }

  next();
}
```

---

## Webhook Delivery System

### Event Emission

```typescript
import { Queue } from 'bullmq';

const webhookQueue = new Queue('webhook-queue', {
  connection: redisConnection,
});

async function triggerWebhook(
  userId: string,
  eventType: WebhookEvent,
  payload: any
) {
  // Get active webhooks for this user and event
  const webhooks = await db.webhooks.findMany({
    where: {
      userId,
      isActive: true,
      events: { has: eventType },
    },
  });

  for (const webhook of webhooks) {
    await webhookQueue.add('deliver', {
      webhookId: webhook.id,
      eventType,
      payload,
      url: webhook.url,
      secret: webhook.secret,
    });
  }
}
```

### Webhook Worker

```typescript
import { Worker } from 'bullmq';
import crypto from 'crypto';
import axios from 'axios';

const webhookWorker = new Worker(
  'webhook-queue',
  async (job) => {
    const { webhookId, eventType, payload, url, secret } = job.data;

    const timestamp = Date.now();
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${JSON.stringify(payload)}`)
      .digest('hex');

    try {
      await axios.post(url, payload, {
        headers: {
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': timestamp.toString(),
          'X-Webhook-Event': eventType,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      // Record successful delivery
      await recordWebhookDelivery(webhookId, eventType, 'delivered');

    } catch (error) {
      // Record failed delivery
      await recordWebhookDelivery(webhookId, eventType, 'failed', error.message);

      throw error; // BullMQ will retry
    }
  },
  {
    connection: redisConnection,
    concurrency: 10,
    limiter: {
      max: 100,
      duration: 1000,
    },
    settings: {
      backoffStrategy: (attemptsMade) => {
        // Exponential backoff: 5s, 25s, 125s, 625s
        return Math.pow(5, attemptsMade) * 1000;
      },
    },
  }
);
```

---

## Deployment Architecture

### Infrastructure Components

**Production Setup:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Backend API
  api:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://user:pass@postgres:5432/infographix
      REDIS_URL: redis://redis:6379
      AWS_S3_BUCKET: infographix-results
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    depends_on:
      - postgres
      - redis
    replicas: 3

  # PostgreSQL Database
  postgres:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: infographix
      POSTGRES_USER: user
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  # Redis Cache & Queue
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # BullMQ Dashboard
  bull-board:
    build: ./bull-board
    ports:
      - "3002:3002"
    environment:
      REDIS_URL: redis://redis:6379
    depends_on:
      - redis

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:
```

**Kubernetes Alternative:**

For enterprise scale, use Kubernetes with:
- Horizontal Pod Autoscaling (HPA) for API pods
- StatefulSets for PostgreSQL and Redis
- Ingress controller with TLS
- Persistent Volume Claims for data

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/backend-deploy.yml
name: Backend Deploy

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-deploy.yml'

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: backend
        run: npm ci

      - name: Run migrations
        working-directory: backend
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: Run tests
        working-directory: backend
        run: npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379

      - name: Run integration tests
        working-directory: backend
        run: npm run test:integration

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        working-directory: backend
        run: |
          docker build -t infographix-api:${{ github.sha }} .
          docker tag infographix-api:${{ github.sha }} ${{ steps.login-ecr.outputs.registry }}/infographix-api:latest
          docker push ${{ steps.login-ecr.outputs.registry }}/infographix-api:latest

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster infographix-cluster \
            --service api \
            --force-new-deployment
```

---

## Testing Strategy

### Test Categories

**1. Unit Tests (src/api/__tests__/)**
- Service layer tests
- Utility function tests
- Database model tests
- 90%+ coverage target

**2. Integration Tests (tests/integration/)**
- API endpoint tests
- Database integration tests
- Redis integration tests
- Queue processing tests

**3. E2E Tests (tests/e2e/)**
- Full workflow tests
- Authentication flows
- Generation pipeline tests
- Webhook delivery tests

### Test Tools

```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "testcontainers": "^10.0.0",
    "@types/jest": "^29.0.0",
    "@types/supertest": "^6.0.0"
  }
}
```

### Example Test

```typescript
// tests/integration/generation.test.ts
import request from 'supertest';
import { app } from '../src/app';
import { testDb, testRedis } from './helpers';

describe('POST /api/v1/generate', () => {
  beforeAll(async () => {
    await testDb.migrate();
    await testRedis.flushall();
  });

  afterAll(async () => {
    await testDb.destroy();
    await testRedis.quit();
  });

  it('should create a generation job', async () => {
    const user = await testDb.createUser({ tier: 'pro' });

    const response = await request(app)
      .post('/api/v1/generate')
      .set('X-API-Key', user.apiKey)
      .send({
        topic: 'Climate Change',
        style: 'modern',
        palette: 'ocean',
        size: '2K',
        aspectRatio: 'landscape',
      });

    expect(response.status).toBe(202);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        id: expect.any(String),
        status: 'pending',
      },
    });
  });

  it('should reject requests without API key', async () => {
    const response = await request(app)
      .post('/api/v1/generate')
      .send({
        topic: 'Test',
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should enforce rate limits', async () => {
    const user = await testDb.createUser({ tier: 'free' });

    // Free tier: 10 requests per minute
    for (let i = 0; i < 10; i++) {
      const response = await request(app)
        .post('/api/v1/generate')
        .set('X-API-Key', user.apiKey)
        .send({ topic: `Test ${i}` });

      expect(response.status).toBe(202);
    }

    // 11th request should be rate limited
    const response = await request(app)
      .post('/api/v1/generate')
      .set('X-API-Key', user.apiKey)
      .send({ topic: 'Test 11' });

    expect(response.status).toBe(429);
    expect(response.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});
```

---

## Migration Path from v1.x

### Data Migration

**Step 1: Export Existing Data**

Frontend-only v1.x stores data in localStorage and IndexedDB. Provide export functionality:

```typescript
// Migration export utility
async function exportUserData() {
  const savedVersions = await storageService.getVersions();
  const templates = await storageService.getTemplates();
  const batchQueues = await storageService.getBatchQueues();

  return {
    version: '1.x',
    exportedAt: new Date().toISOString(),
    data: {
      versions: savedVersions,
      templates,
      batches: batchQueues,
    },
  };
}
```

**Step 2: Import to Backend**

Provide import endpoint in v2.2.0:

```typescript
// POST /api/v1/migrate/import
router.post('/migrate/import', authenticateApiKey, async (req, res) => {
  const { data } = req.body;
  const { user } = req;

  // Import templates
  for (const template of data.templates) {
    await db.templates.create({
      userId: user.id,
      name: template.name,
      config: template.config,
    });
  }

  // Import version history
  for (const version of data.versions) {
    await db.generationJobs.create({
      userId: user.id,
      status: 'completed',
      requestData: version.request,
      resultData: version.result,
    });
  }

  res.json({
    success: true,
    data: {
      templatesImported: data.templates.length,
      versionsImported: data.versions.length,
    },
  });
});
```

---

## Security Considerations

### 1. API Key Security
- Store hashed keys in database (SHA-256)
- Use HTTPS only
- Implement key rotation
- Add key expiration dates

### 2. Input Validation
- Use Zod for request validation
- Sanitize user inputs
- Validate file uploads
- Prevent XSS and injection attacks

### 3. Rate Limiting
- Implement per-endpoint limits
- DDoS protection
- IP-based rate limiting for public endpoints

### 4. Data Protection
- Encrypt sensitive data at rest
- Use signed S3 URLs
- Implement data retention policies
- GDPR compliance (data export/deletion)

### 5. Webhook Security
- HMAC signature verification
- HTTPS-only webhook URLs
- Implement webhook signing

---

## Performance Optimizations

### 1. Database
- Connection pooling (pg-pool)
- Query optimization with indexes
- Prepared statements
- Read replicas for analytics

### 2. Caching
- Redis for frequently accessed data
- CDN for image delivery
- HTTP caching headers
- Query result caching

### 3. API
- Response compression (gzip)
- Pagination for large datasets
- Lazy loading
- Batch endpoints for bulk operations

### 4. Queue Processing
- Concurrency limits
- Priority queues
- Dead letter queues
- Job deduplication

---

## Monitoring & Observability

### Metrics to Track

**Application Metrics:**
- Request rate (req/s)
- Response time (p50, p95, p99)
- Error rate
- Active connections

**Business Metrics:**
- Generations per day
- API usage by tier
- Webhook delivery rate
- User growth

**Infrastructure Metrics:**
- CPU usage
- Memory usage
- Database connections
- Redis memory
- Queue length

### Tools

```yaml
# Prometheus + Grafana
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
```

---

## Timeline & Milestones

### Phase 1: Foundation (Weeks 1-4)
- [ ] Set up Express backend
- [ ] PostgreSQL schema implementation
- [ ] Redis integration
- [ ] Authentication middleware
- [ ] Basic CRUD endpoints

### Phase 2: Core Features (Weeks 5-8)
- [ ] Generation endpoints
- [ ] Batch processing
- [ ] Template management
- [ ] Rate limiting
- [ ] Quota system

### Phase 3: Advanced Features (Weeks 9-12)
- [ ] Webhook system
- [ ] S3 integration
- [ ] Queue processing
- [ ] Admin endpoints
- [ ] Analytics

### Phase 4: Testing & Polish (Weeks 13-16)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Deployment automation

---

## Success Criteria

- [ ] All OpenAPI endpoints implemented
- [ ] 90%+ test coverage
- [ ] API latency <500ms (p95)
- [ ] 99.9% uptime
- [ ] Security audit passed
- [ ] Load testing (1000 req/min)
- [ ] Documentation complete
- [ ] Migration path tested

---

**Next Steps:**
1. Review and approve this plan
2. Set up development environment
3. Create project structure
4. Implement Phase 1 milestones
5. Begin SDK development in parallel

**Related Documents:**
- [SDK Development Plan](./SDK-DEVELOPMENT-PLAN.md)
- [Development Guide](./DEVELOPMENT-GUIDE.md)
- [API Design Documentation](../../api/API-DESIGN.md)
- [OpenAPI Specification](../../api/openapi.yaml)
