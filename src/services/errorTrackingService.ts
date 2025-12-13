/**
 * Error Tracking Service Stub
 * v1.7.0 Technical Debt Remediation
 *
 * This is a placeholder for future error tracking integration (e.g., Sentry).
 * See docs/technical/ERROR-TRACKING.md for full integration instructions.
 *
 * To enable error tracking:
 * 1. Install Sentry: npm install --save @sentry/react
 * 2. Uncomment the implementation below
 * 3. Add VITE_SENTRY_DSN to .env.local
 * 4. Update ErrorBoundary.tsx to use captureError()
 * 5. Call initErrorTracking() in src/index.tsx
 */

// import * as Sentry from '@sentry/react';
// import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize error tracking service
 * Currently a no-op until Sentry is installed and configured
 */
export const initErrorTracking = (): void => {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;

  if (!sentryDsn || environment === 'development') {
    // eslint-disable-next-line no-console
    console.info('[Error Tracking] Disabled (no DSN or dev environment)');
    return;
  }

  // TODO: Uncomment when Sentry is installed
  /*
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
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    release: `infographix-genai@${import.meta.env.VITE_APP_VERSION || '2.0.2'}`,
    beforeSend(event) {
      // Filter localhost errors
      if (event.request?.url?.includes('localhost')) {
        return null;
      }
      // Scrub API keys
      if (event.message) {
        event.message = event.message.replace(/api[_-]?key[=:]\s*[\w-]+/gi, 'api_key=***');
      }
      return event;
    },
    ignoreErrors: [
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      'NetworkError',
      'Failed to fetch',
      'ResizeObserver loop limit exceeded',
    ],
  });
  */

  // eslint-disable-next-line no-console
  console.info('[Error Tracking] Stub mode - install @sentry/react to enable');
};

/**
 * Manually capture an error
 * Currently logs to console in development
 */
export const captureError = (error: Error, context?: Record<string, unknown>): void => {
  if (import.meta.env.MODE === 'development') {
    console.error('[Dev] Error captured:', error, context);
    return;
  }

  // TODO: Uncomment when Sentry is installed
  // Sentry.captureException(error, { extra: context });
  console.warn('[Error Tracking] Stub mode - error not sent to tracking service:', error.message);
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (userId: string, metadata?: Record<string, unknown>): void => {
  // TODO: Uncomment when Sentry is installed
  // Sentry.setUser({ id: userId, ...metadata });
  // eslint-disable-next-line no-console
  console.info('[Error Tracking] User context set (stub):', userId, metadata);
};

/**
 * Add breadcrumb for debugging context
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  data?: Record<string, unknown>
): void => {
  // TODO: Uncomment when Sentry is installed
  // Sentry.addBreadcrumb({ message, category, data, level: 'info' });
  // eslint-disable-next-line no-console
  console.info('[Error Tracking] Breadcrumb (stub):', category, message, data);
};
