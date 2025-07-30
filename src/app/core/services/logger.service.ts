import { Injectable } from '@angular/core';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: unknown;
  component?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly isProduction = false; // TODO: Configure based on environment
  private readonly maxLogEntries = 1000;
  private logHistory: LogEntry[] = [];

  /**
   * Log a debug message
   */
  debug(message: string, data?: unknown, component?: string): void {
    this.log('debug', message, data, component);
  }

  /**
   * Log an info message
   */
  info(message: string, data?: unknown, component?: string): void {
    this.log('info', message, data, component);
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: unknown, component?: string): void {
    this.log('warn', message, data, component);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: unknown, component?: string): void {
    this.log('error', message, error, component);
  }

  /**
   * Log a message with the specified level
   */
  private log(level: LogLevel, message: string, data?: unknown, component?: string): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
      component
    };

    // Add to history
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxLogEntries) {
      this.logHistory.shift();
    }

    // Only log to console in development or if explicitly enabled
    if (!this.isProduction || this.shouldLogToConsole(level)) {
      this.logToConsole(entry);
    }

    // In production, you might want to send errors to a logging service
    if (this.isProduction && level === 'error') {
      this.sendToLoggingService(entry);
    }
  }

  /**
   * Determine if a log should be output to console
   */
  private shouldLogToConsole(level: LogLevel): boolean {
    // In production, only log errors and warnings
    if (this.isProduction) {
      return level === 'error' || level === 'warn';
    }
    // In development, log everything
    return true;
  }

  /**
   * Log to console with appropriate styling
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const prefix = entry.component ? `[${entry.component}]` : '';
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(`🔍 ${message}`, entry.data || '');
        break;
      case 'info':
        console.info(`ℹ️ ${message}`, entry.data || '');
        break;
      case 'warn':
        console.warn(`⚠️ ${message}`, entry.data || '');
        break;
      case 'error':
        console.error(`❌ ${message}`, entry.data || '');
        break;
    }
  }

  /**
   * Send error logs to external logging service (e.g., Sentry, LogRocket)
   */
  private sendToLoggingService(entry: LogEntry): void {
    // TODO: Implement external logging service integration
    // Example: Sentry.captureException(entry.data);
    // Example: LogRocket.captureException(entry.data);
  }

  /**
   * Get log history
   */
  getLogHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  clearLogHistory(): void {
    this.logHistory = [];
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logHistory.filter(entry => entry.level === level);
  }

  /**
   * Get logs by component
   */
  getLogsByComponent(component: string): LogEntry[] {
    return this.logHistory.filter(entry => entry.component === component);
  }

  /**
   * Get recent logs (last N entries)
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logHistory.slice(-count);
  }
} 