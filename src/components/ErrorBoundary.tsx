import React, { Component, ErrorInfo, ReactNode } from 'react';
import { log } from '../utils/logger';
import { AlertTriangle, RefreshCw } from 'lucide-react';
// import { captureError } from '../services/errorTrackingService';  // Uncomment when Sentry is configured

/**
 * Props for the ErrorBoundary component.
 */
interface ErrorBoundaryProps {
  /** Child components to wrap with error handling */
  children: ReactNode;
  /** Optional custom fallback UI to show on error */
  fallback?: ReactNode;
  /** Optional callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * State for the ErrorBoundary component.
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches JavaScript errors in child components.
 *
 * Prevents the entire app from crashing when an error occurs in a component tree.
 * Shows a user-friendly error message with recovery options.
 *
 * @example
 * ```tsx
 * <ErrorBoundary onError={(error) => logErrorToService(error)}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when an error is thrown.
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Log error information for debugging and analytics.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log to console in development
    log.error('ErrorBoundary caught an error:', error);
    log.error('Component stack:', errorInfo.componentStack);

    // Send to error tracking service (v1.7.0)
    // Uncomment when Sentry is configured
    // captureError(error, {
    //   componentStack: errorInfo.componentStack,
    // });

    // Call optional error callback for external logging
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Reset the error state and attempt recovery.
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Reload the entire page as a last resort recovery option.
   */
  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-slate-400 mb-6">
              An unexpected error occurred. Your work may not have been saved.
            </p>

            {/* Error Details (collapsible in production) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-slate-500 hover:text-slate-300 text-sm mb-2">
                  Show error details
                </summary>
                <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-48">
                  <pre className="text-xs text-red-300 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-slate-500 mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Recovery Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors font-medium"
              >
                Reload Page
              </button>
            </div>

            {/* Help Text */}
            <p className="mt-6 text-xs text-slate-500">
              If this problem persists, try clearing your browser cache or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
