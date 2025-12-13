# Error Tracking Integration Guide

This document provides instructions for integrating error tracking services (e.g., Sentry, LogRocket, Rollbar) into InfoGraphix AI for production monitoring.

## Table of Contents

- [Why Error Tracking?](#why-error-tracking)
- [Recommended Services](#recommended-services)
- [Sentry Integration](#sentry-integration)
- [Alternative Services](#alternative-services)
- [Configuration Best Practices](#configuration-best-practices)
- [Testing](#testing)

---

## Why Error Tracking?

Error tracking services provide:

- **Real-time Error Notifications**: Get alerted when errors occur in production
- **Stack Traces & Context**: Detailed error information including browser, OS, and user actions
- **Error Grouping**: Similar errors are automatically grouped for easier triage
- **Performance Monitoring**: Track application performance and identify bottlenecks
- **Release Tracking**: Associate errors with specific releases for faster debugging

---

## Recommended Services

| Service | Best For | Pricing |
|---------|----------|---------|
| **[Sentry](https://sentry.io/)** | Comprehensive error tracking with React support | Free tier: 5K errors/month |
| **[LogRocket](https://logrocket.com/)** | Session replay with error tracking | Free tier: 1K sessions/month |
| **[Rollbar](https://rollbar.com/)** | Simple, fast error tracking | Free tier: 5K events/month |
| **[Bugsnag](https://www.bugsnag.com/)** | Multi-platform error monitoring | Free tier: Limited |

**Recommendation**: Sentry offers the best free tier and React-specific features.

---

## Sentry Integration

### Step 1: Install Sentry SDK

```bash
npm install --save @sentry/react
```

### Step 2: Initialize Sentry

Create `/src/services/errorTrackingService.ts` (or modify the existing stub):

```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize Sentry error tracking
 * Only enabled in production with valid DSN
 */
export const initErrorTracking = () => {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;

  // Only initialize if DSN is provided and not in development
  if (!sentryDsn || environment === 'development') {
    console.log('[Error Tracking] Disabled (no DSN or dev environment)');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment,
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // Session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Release tracking (use version from package.json)
    release: `infographix-genai@${import.meta.env.VITE_APP_VERSION || '1.7.0'}`,

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Don't send events for localhost API errors (development leakage)
      if (event.request?.url?.includes('localhost')) {
        return null;
      }

      // Scrub API keys from error messages
      if (event.message) {
        event.message = event.message.replace(/api[_-]?key[=:]\s*[\w-]+/gi, 'api_key=***');
      }

      return event;
    },

    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',

      // Network errors (user-specific)
      'NetworkError',
      'Failed to fetch',

      // ResizeObserver loop errors (benign)
      'ResizeObserver loop limit exceeded',
    ],
  });

  console.log('[Error Tracking] Sentry initialized');
};

/**
 * Manually capture an error
 */
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (import.meta.env.MODE === 'development') {
    console.error('[Dev] Error captured:', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (userId: string, metadata?: Record<string, any>) => {
  Sentry.setUser({
    id: userId,
    ...metadata,
  });
};

/**
 * Add breadcrumb for debugging context
 */
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
};
```

### Step 3: Update ErrorBoundary Component

Modify `/src/components/ErrorBoundary.tsx`:

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
// import * as Sentry from '@sentry/react';  // Uncomment when Sentry is installed

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);

    // Send to Sentry (uncomment when integrated)
    // Sentry.captureException(error, {
    //   extra: {
    //     componentStack: errorInfo.componentStack,
    //   },
    // });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-red-500/50 p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h1 className="text-2xl font-bold text-white">Something Went Wrong</h1>
            </div>

            <p className="text-slate-300 mb-4">
              An unexpected error occurred. Our team has been notified and is working on a fix.
            </p>

            {this.state.error && (
              <pre className="bg-slate-900 text-red-300 p-3 rounded text-xs overflow-auto mb-4 max-h-40">
                {this.state.error.toString()}
              </pre>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Step 4: Initialize in Main Entry Point

Update `/src/index.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
// import { initErrorTracking } from './services/errorTrackingService';  // Uncomment when ready

// Initialize error tracking
// initErrorTracking();  // Uncomment when Sentry DSN is configured

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 5: Add Environment Variable

Add to `.env.local` (never commit this file):

```env
# Sentry Configuration (v1.7.0 Error Tracking)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_APP_VERSION=1.7.0
```

### Step 6: Update .gitignore

Ensure `.env.local` is ignored:

```gitignore
# Environment variables
.env.local
.env.production.local
```

### Step 7: Add to package.json (Optional)

Add version script for automatic version tracking:

```json
{
  "scripts": {
    "build": "vite build",
    "build:production": "VITE_APP_VERSION=$(node -p \"require('./package.json').version\") vite build"
  }
}
```

---

## Alternative Services

### LogRocket Integration

```bash
npm install --save logrocket
```

```typescript
import LogRocket from 'logrocket';

LogRocket.init('your-app-id/project-name');

// Identify users
LogRocket.identify('user-id', {
  name: 'User Name',
  email: 'user@example.com',
});
```

### Rollbar Integration

```bash
npm install --save rollbar
```

```typescript
import Rollbar from 'rollbar';

const rollbar = new Rollbar({
  accessToken: 'your-access-token',
  environment: import.meta.env.MODE,
});

rollbar.error('Error message', error);
```

---

## Configuration Best Practices

### 1. Environment-Specific Configuration

- **Development**: Disable error tracking or use console logging
- **Staging**: Enable with higher sample rates for testing
- **Production**: Enable with conservative sample rates (10-20%)

### 2. Privacy & Security

- **Scrub Sensitive Data**: Remove API keys, tokens, passwords from error reports
- **Anonymize Users**: Use hashed user IDs instead of emails
- **Filter PII**: Block personally identifiable information from session replays

### 3. Performance Considerations

- **Sample Rates**: Don't track 100% of transactions (too expensive)
- **Lazy Loading**: Load error tracking SDK asynchronously if possible
- **Bundle Size**: Sentry adds ~50KB gzipped - acceptable for production monitoring

### 4. Error Filtering

Ignore common, non-actionable errors:
- Browser extension errors
- Network timeouts (user-specific)
- ResizeObserver errors (benign React warnings)

---

## Testing

### Manual Test

Add a test button in development to verify Sentry integration:

```typescript
// src/components/SentryTestButton.tsx (dev only)
const SentryTestButton = () => {
  if (import.meta.env.MODE !== 'development') return null;

  return (
    <button
      onClick={() => {
        throw new Error('Sentry Test Error');
      }}
      className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded"
    >
      Test Sentry
    </button>
  );
};
```

### Verify Dashboard

1. Trigger a test error
2. Check your Sentry dashboard at `https://sentry.io/`
3. Verify error appears with correct:
   - Stack trace
   - Environment (development/production)
   - Release version
   - Browser/OS information

---

## Cost Optimization

### Free Tier Limits

- **Sentry**: 5,000 errors/month
- **LogRocket**: 1,000 sessions/month
- **Rollbar**: 5,000 events/month

### Tips to Stay Within Limits

1. **Filter Aggressively**: Ignore non-actionable errors
2. **Sample Wisely**: Use 10-20% sampling for performance tracking
3. **Set Alerts**: Get notified when approaching limits
4. **Use Retention Policies**: Auto-delete old errors after 30-90 days

---

## Troubleshooting

### Sentry Not Capturing Errors

1. **Check DSN**: Verify `VITE_SENTRY_DSN` is set correctly
2. **Check Environment**: Ensure not in development mode
3. **Check beforeSend**: Verify filter isn't blocking all errors
4. **Check Network**: Ensure no ad blockers blocking `sentry.io`

### High Error Volume

1. **Review Ignored Errors**: May need to filter more aggressively
2. **Check for Loops**: Infinite error loops can exhaust quota quickly
3. **Review Sample Rates**: Reduce from 1.0 to 0.1 or lower

---

## Additional Resources

- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [LogRocket React Guide](https://docs.logrocket.com/docs/react)
- [Rollbar React Setup](https://docs.rollbar.com/docs/react)
- [Error Tracking Best Practices](https://sentry.io/resources/error-tracking-best-practices/)

---

**Version**: 1.7.0
**Last Updated**: 2024-12-12
**Status**: Ready for Integration
