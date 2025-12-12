import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/main.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

/**
 * Error handler for logging to external services (future enhancement)
 */
const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
  // Log to console in development
  console.error('Application error:', error);
  console.error('Component stack:', errorInfo.componentStack);

  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary onError={handleGlobalError}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
