/**
 * Logger Utility
 *
 * Centralized logging with environment-aware filtering and structured output.
 * Replaces scattered console.log/warn/error statements throughout the codebase.
 *
 * TD-004: Technical Debt Remediation
 */

/* eslint-disable no-console */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LoggerConfig {
  /** Minimum log level to output (default: INFO in production, DEBUG in development) */
  level: LogLevel;
  /** Enable/disable all logging (default: true) */
  enabled: boolean;
  /** Prefix for all log messages (default: "[InfoGraphix]") */
  prefix: string;
  /** Enable timestamp in logs (default: true in development) */
  includeTimestamp: boolean;
  /** Enable stack traces for errors (default: true) */
  includeStackTrace: boolean;
}

class Logger {
  private config: LoggerConfig;

  constructor(config?: Partial<LoggerConfig>) {
    const isDev = import.meta.env.DEV;

    this.config = {
      level: isDev ? LogLevel.DEBUG : LogLevel.INFO,
      enabled: true,
      prefix: '[InfoGraphix]',
      includeTimestamp: isDev,
      includeStackTrace: true,
      ...config,
    };
  }

  /**
   * Update logger configuration at runtime
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): Readonly<LoggerConfig> {
    return { ...this.config };
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && level >= this.config.level;
  }

  /**
   * Format a log message with prefix and timestamp
   */
  private formatMessage(level: string, ...args: unknown[]): unknown[] {
    const parts: string[] = [];

    if (this.config.prefix) {
      parts.push(this.config.prefix);
    }

    if (this.config.includeTimestamp) {
      const timestamp = new Date().toISOString();
      parts.push(`[${timestamp}]`);
    }

    parts.push(`[${level}]`);

    return [parts.join(' '), ...args];
  }

  /**
   * Debug level logging (verbose information for development)
   * Disabled in production by default
   */
  public debug(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(...this.formatMessage('DEBUG', ...args));
    }
  }

  /**
   * Info level logging (general informational messages)
   */
  public info(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(...this.formatMessage('INFO', ...args));
    }
  }

  /**
   * Warning level logging (potential issues)
   */
  public warn(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(...this.formatMessage('WARN', ...args));
    }
  }

  /**
   * Error level logging (errors and exceptions)
   */
  public error(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      // Check if last argument is an Error object with stack trace
      const lastArg = args[args.length - 1];

      if (this.config.includeStackTrace && lastArg instanceof Error && lastArg.stack) {
        console.error(...this.formatMessage('ERROR', ...args));
      } else {
        console.error(...this.formatMessage('ERROR', ...args));
      }
    }
  }

  /**
   * Group related log messages
   */
  public group(label: string, collapsed = false): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      if (collapsed) {
        console.groupCollapsed(...this.formatMessage('GROUP', label));
      } else {
        console.group(...this.formatMessage('GROUP', label));
      }
    }
  }

  /**
   * End a log group
   */
  public groupEnd(): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.groupEnd();
    }
  }

  /**
   * Performance timing - start a timer
   */
  public time(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.time(`${this.config.prefix} ${label}`);
    }
  }

  /**
   * Performance timing - end a timer and log elapsed time
   */
  public timeEnd(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.timeEnd(`${this.config.prefix} ${label}`);
    }
  }

  /**
   * Table logging for structured data
   */
  public table(data: unknown): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.table(data);
    }
  }

  /**
   * Clear the console (development only)
   */
  public clear(): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.clear();
    }
  }
}

// Create and export singleton instance
export const logger = new Logger();

// Export class for testing or custom instances
export { Logger };

// Convenience exports for common use cases
export const log = {
  debug: (...args: unknown[]) => logger.debug(...args),
  info: (...args: unknown[]) => logger.info(...args),
  warn: (...args: unknown[]) => logger.warn(...args),
  error: (...args: unknown[]) => logger.error(...args),
  group: (label: string, collapsed?: boolean) => logger.group(label, collapsed),
  groupEnd: () => logger.groupEnd(),
  time: (label: string) => logger.time(label),
  timeEnd: (label: string) => logger.timeEnd(label),
  table: (data: unknown) => logger.table(data),
};
