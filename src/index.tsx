import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { GenerationProvider, ThemeProvider } from './contexts';
import './i18n'; // Initialize i18n
import './styles/main.css';
import { validateEnvironment } from './utils/env';
import { log } from './utils/logger';

// Validate environment variables in development
validateEnvironment();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

/**
 * Error handler for logging to external services (future enhancement)
 */
const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
  // Log to console in development
  log.error('Application error:', error);
  log.error('Component stack:', errorInfo.componentStack);

  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary onError={handleGlobalError}>
      <ThemeProvider>
        <GenerationProvider>
          <App />
        </GenerationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
