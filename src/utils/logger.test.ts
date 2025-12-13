/**
 * Logger Utility Unit Tests
 *
 * Tests for the centralized logging utility with environment-aware filtering.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, LogLevel, log } from './logger';

// Mock import.meta.env
vi.mock('vite', () => ({
  defineConfig: vi.fn(),
}));

describe('Logger', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    group: ReturnType<typeof vi.spyOn>;
    groupCollapsed: ReturnType<typeof vi.spyOn>;
    groupEnd: ReturnType<typeof vi.spyOn>;
    time: ReturnType<typeof vi.spyOn>;
    timeEnd: ReturnType<typeof vi.spyOn>;
    table: ReturnType<typeof vi.spyOn>;
    clear: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      group: vi.spyOn(console, 'group').mockImplementation(() => {}),
      groupCollapsed: vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {}),
      groupEnd: vi.spyOn(console, 'groupEnd').mockImplementation(() => {}),
      time: vi.spyOn(console, 'time').mockImplementation(() => {}),
      timeEnd: vi.spyOn(console, 'timeEnd').mockImplementation(() => {}),
      table: vi.spyOn(console, 'table').mockImplementation(() => {}),
      clear: vi.spyOn(console, 'clear').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create logger with default config', () => {
      const logger = new Logger();
      const config = logger.getConfig();

      expect(config.enabled).toBe(true);
      expect(config.prefix).toBe('[InfoGraphix]');
      expect(config.includeStackTrace).toBe(true);
    });

    it('should accept custom configuration', () => {
      const logger = new Logger({
        level: LogLevel.ERROR,
        enabled: false,
        prefix: '[Custom]',
        includeTimestamp: true,
        includeStackTrace: false,
      });
      const config = logger.getConfig();

      expect(config.level).toBe(LogLevel.ERROR);
      expect(config.enabled).toBe(false);
      expect(config.prefix).toBe('[Custom]');
      expect(config.includeTimestamp).toBe(true);
      expect(config.includeStackTrace).toBe(false);
    });

    it('should allow partial config override', () => {
      const logger = new Logger({ prefix: '[Test]' });
      const config = logger.getConfig();

      expect(config.prefix).toBe('[Test]');
      expect(config.enabled).toBe(true); // Default preserved
    });
  });

  describe('configure', () => {
    it('should update logger configuration at runtime', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      expect(logger.getConfig().level).toBe(LogLevel.DEBUG);

      logger.configure({ level: LogLevel.ERROR });
      expect(logger.getConfig().level).toBe(LogLevel.ERROR);
    });

    it('should preserve unspecified config values', () => {
      const logger = new Logger({
        prefix: '[Original]',
        level: LogLevel.WARN,
      });

      logger.configure({ level: LogLevel.DEBUG });

      const config = logger.getConfig();
      expect(config.prefix).toBe('[Original]');
      expect(config.level).toBe(LogLevel.DEBUG);
    });
  });

  describe('getConfig', () => {
    it('should return a copy of configuration', () => {
      const logger = new Logger();
      const config1 = logger.getConfig();
      const config2 = logger.getConfig();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2);
    });
  });

  describe('debug', () => {
    it('should log when level is DEBUG', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.debug('test message');

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'test message'
      );
    });

    it('should not log when level is higher than DEBUG', () => {
      const logger = new Logger({ level: LogLevel.INFO });
      logger.debug('test message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should include prefix in output', () => {
      const logger = new Logger({ level: LogLevel.DEBUG, prefix: '[Test]' });
      logger.debug('message');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[Test]'),
        'message'
      );
    });

    it('should handle multiple arguments', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.debug('message', { data: 'value' }, 123);

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'message',
        { data: 'value' },
        123
      );
    });
  });

  describe('info', () => {
    it('should log when level is INFO or lower', () => {
      const logger = new Logger({ level: LogLevel.INFO });
      logger.info('info message');

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'info message'
      );
    });

    it('should not log when level is higher than INFO', () => {
      const logger = new Logger({ level: LogLevel.WARN });
      logger.info('info message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log using console.warn', () => {
      const logger = new Logger({ level: LogLevel.WARN });
      logger.warn('warning message');

      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        'warning message'
      );
    });

    it('should not log when level is ERROR (higher than WARN)', () => {
      const logger = new Logger({ level: LogLevel.ERROR });
      const warnCallsBefore = consoleSpy.warn.mock.calls.length;
      logger.warn('warning message');
      const warnCallsAfter = consoleSpy.warn.mock.calls.length;

      // No new warn calls should have been made by this specific logger
      expect(warnCallsAfter).toBe(warnCallsBefore);
    });
  });

  describe('error', () => {
    it('should log using console.error', () => {
      const logger = new Logger({ level: LogLevel.ERROR });
      logger.error('error message');

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'error message'
      );
    });

    it('should handle Error objects', () => {
      const logger = new Logger({ level: LogLevel.ERROR });
      const error = new Error('Test error');
      logger.error('Something failed', error);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'Something failed',
        error
      );
    });

    it('should always log when enabled (ERROR is highest priority)', () => {
      const logger = new Logger({ level: LogLevel.ERROR });
      logger.error('critical error');

      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('group', () => {
    it('should create expanded group when collapsed is false', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.group('Group Label', false);

      expect(consoleSpy.group).toHaveBeenCalledTimes(1);
      expect(consoleSpy.groupCollapsed).not.toHaveBeenCalled();
    });

    it('should create collapsed group when collapsed is true', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.group('Group Label', true);

      expect(consoleSpy.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(consoleSpy.group).not.toHaveBeenCalled();
    });

    it('should not create group when level is higher than DEBUG', () => {
      const logger = new Logger({ level: LogLevel.INFO });
      logger.group('Group Label');

      expect(consoleSpy.group).not.toHaveBeenCalled();
      expect(consoleSpy.groupCollapsed).not.toHaveBeenCalled();
    });
  });

  describe('groupEnd', () => {
    it('should end group when level is DEBUG', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.groupEnd();

      expect(consoleSpy.groupEnd).toHaveBeenCalledTimes(1);
    });

    it('should not end group when level is higher than DEBUG', () => {
      const logger = new Logger({ level: LogLevel.INFO });
      logger.groupEnd();

      expect(consoleSpy.groupEnd).not.toHaveBeenCalled();
    });
  });

  describe('time and timeEnd', () => {
    it('should start timer with prefixed label', () => {
      const logger = new Logger({ level: LogLevel.DEBUG, prefix: '[Test]' });
      logger.time('operation');

      expect(consoleSpy.time).toHaveBeenCalledWith('[Test] operation');
    });

    it('should end timer with prefixed label', () => {
      const logger = new Logger({ level: LogLevel.DEBUG, prefix: '[Test]' });
      logger.timeEnd('operation');

      expect(consoleSpy.timeEnd).toHaveBeenCalledWith('[Test] operation');
    });

    it('should not log timer when level is higher than DEBUG', () => {
      const logger = new Logger({ level: LogLevel.INFO });
      logger.time('operation');
      logger.timeEnd('operation');

      expect(consoleSpy.time).not.toHaveBeenCalled();
      expect(consoleSpy.timeEnd).not.toHaveBeenCalled();
    });
  });

  describe('table', () => {
    it('should log table when level is DEBUG', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      const data = [{ a: 1 }, { a: 2 }];
      logger.table(data);

      expect(consoleSpy.table).toHaveBeenCalledWith(data);
    });

    it('should not log table when level is higher than DEBUG', () => {
      const logger = new Logger({ level: LogLevel.INFO });
      logger.table([{ a: 1 }]);

      expect(consoleSpy.table).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear console when level is DEBUG', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });
      logger.clear();

      expect(consoleSpy.clear).toHaveBeenCalledTimes(1);
    });

    it('should not clear console when level is higher than DEBUG', () => {
      const logger = new Logger({ level: LogLevel.INFO });
      logger.clear();

      expect(consoleSpy.clear).not.toHaveBeenCalled();
    });
  });

  describe('enabled flag', () => {
    it('should not log when disabled', () => {
      const logger = new Logger({
        level: LogLevel.DEBUG,
        enabled: false,
      });

      const logCallsBefore = consoleSpy.log.mock.calls.length;
      const warnCallsBefore = consoleSpy.warn.mock.calls.length;
      const errorCallsBefore = consoleSpy.error.mock.calls.length;

      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');

      // Verify no new calls were made by this disabled logger
      expect(consoleSpy.log.mock.calls.length).toBe(logCallsBefore);
      expect(consoleSpy.warn.mock.calls.length).toBe(warnCallsBefore);
      expect(consoleSpy.error.mock.calls.length).toBe(errorCallsBefore);
    });

    it('should log after re-enabling', () => {
      const logger = new Logger({
        level: LogLevel.DEBUG,
        enabled: false,
      });

      const logCallsBefore = consoleSpy.log.mock.calls.length;
      logger.info('should not appear');
      expect(consoleSpy.log.mock.calls.length).toBe(logCallsBefore);

      logger.configure({ enabled: true });
      logger.info('should appear');
      expect(consoleSpy.log.mock.calls.length).toBe(logCallsBefore + 1);
    });
  });

  describe('timestamp', () => {
    it('should include timestamp when configured', () => {
      const logger = new Logger({
        level: LogLevel.DEBUG,
        includeTimestamp: true,
      });
      logger.debug('message');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        'message'
      );
    });

    it('should not include timestamp when not configured', () => {
      const logger = new Logger({
        level: LogLevel.DEBUG,
        includeTimestamp: false,
      });
      logger.debug('message');

      const call = consoleSpy.log.mock.calls[0][0] as string;
      expect(call).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    });
  });
});

describe('LogLevel enum', () => {
  it('should have correct numeric values', () => {
    expect(LogLevel.DEBUG).toBe(0);
    expect(LogLevel.INFO).toBe(1);
    expect(LogLevel.WARN).toBe(2);
    expect(LogLevel.ERROR).toBe(3);
    expect(LogLevel.NONE).toBe(4);
  });

  it('should allow comparison for filtering', () => {
    expect(LogLevel.INFO > LogLevel.DEBUG).toBe(true);
    expect(LogLevel.ERROR > LogLevel.WARN).toBe(true);
    expect(LogLevel.NONE > LogLevel.ERROR).toBe(true);
  });
});

describe('log convenience object', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    group: ReturnType<typeof vi.spyOn>;
    groupCollapsed: ReturnType<typeof vi.spyOn>;
    groupEnd: ReturnType<typeof vi.spyOn>;
    time: ReturnType<typeof vi.spyOn>;
    timeEnd: ReturnType<typeof vi.spyOn>;
    table: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      group: vi.spyOn(console, 'group').mockImplementation(() => {}),
      groupCollapsed: vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {}),
      groupEnd: vi.spyOn(console, 'groupEnd').mockImplementation(() => {}),
      time: vi.spyOn(console, 'time').mockImplementation(() => {}),
      timeEnd: vi.spyOn(console, 'timeEnd').mockImplementation(() => {}),
      table: vi.spyOn(console, 'table').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should expose debug method', () => {
    expect(typeof log.debug).toBe('function');
  });

  it('should expose info method', () => {
    expect(typeof log.info).toBe('function');
  });

  it('should expose warn method', () => {
    expect(typeof log.warn).toBe('function');
  });

  it('should expose error method', () => {
    expect(typeof log.error).toBe('function');
  });

  it('should expose group method', () => {
    expect(typeof log.group).toBe('function');
  });

  it('should expose groupEnd method', () => {
    expect(typeof log.groupEnd).toBe('function');
  });

  it('should expose time method', () => {
    expect(typeof log.time).toBe('function');
  });

  it('should expose timeEnd method', () => {
    expect(typeof log.timeEnd).toBe('function');
  });

  it('should expose table method', () => {
    expect(typeof log.table).toBe('function');
  });
});

describe('Logger edge cases', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle empty prefix', () => {
    const logger = new Logger({
      level: LogLevel.DEBUG,
      prefix: '',
    });
    logger.debug('message');

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG]'),
      'message'
    );
  });

  it('should handle null/undefined arguments', () => {
    const logger = new Logger({ level: LogLevel.DEBUG });
    logger.debug(null, undefined, 'value');

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.any(String),
      null,
      undefined,
      'value'
    );
  });

  it('should handle objects with circular references', () => {
    const logger = new Logger({ level: LogLevel.DEBUG });
    const obj: Record<string, unknown> = { a: 1 };
    obj.self = obj; // Circular reference

    // Should not throw
    expect(() => logger.debug('circular', obj)).not.toThrow();
  });

  it('should handle LogLevel.NONE to disable all logging', () => {
    const logger = new Logger({ level: LogLevel.NONE });

    const logCallsBefore = consoleSpy.log.mock.calls.length;
    const errorCallsBefore = consoleSpy.error.mock.calls.length;

    logger.debug('debug');
    logger.info('info');
    logger.warn('warn');
    logger.error('error');

    // Verify no new calls were made by this NONE-level logger
    expect(consoleSpy.log.mock.calls.length).toBe(logCallsBefore);
    expect(consoleSpy.error.mock.calls.length).toBe(errorCallsBefore);
  });
});
