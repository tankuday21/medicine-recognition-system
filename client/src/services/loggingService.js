// Comprehensive logging service for the Mediot application

class LoggingService {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.logLevel = this.getLogLevel();
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.remoteLoggingEnabled = true;
    this.batchSize = 50;
    this.batchTimeout = 30000; // 30 seconds
    this.pendingLogs = [];
    this.batchTimer = null;
    
    this.initializeLogging();
  }

  // Initialize logging system
  initializeLogging() {
    // Set up console override for development
    if (process.env.NODE_ENV === 'development') {
      this.overrideConsole();
    }

    // Set up periodic log flushing
    this.startBatchTimer();

    // Set up beforeunload handler to flush logs
    window.addEventListener('beforeunload', () => {
      this.flushLogs();
    });

    // Set up visibility change handler
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushLogs();
      }
    });

    console.log('Logging service initialized');
  }

  // Get log level from environment or localStorage
  getLogLevel() {
    const stored = localStorage.getItem('mediot_log_level');
    if (stored) return stored;

    if (process.env.NODE_ENV === 'development') {
      return 'debug';
    } else if (process.env.NODE_ENV === 'production') {
      return 'warn';
    }
    
    return 'info';
  }

  // Generate unique session ID
  generateSessionId() {
    let sessionId = sessionStorage.getItem('mediot_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('mediot_session_id', sessionId);
    }
    return sessionId;
  }

  // Set user ID for logging context
  setUserId(userId) {
    this.userId = userId;
  }

  // Main logging method
  log(level, message, data = {}, context = {}) {
    // Check if log level should be recorded
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      data: this.sanitizeData(data),
      context: {
        sessionId: this.sessionId,
        userId: this.userId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      },
      stack: level === 'error' ? this.getStackTrace() : null
    };

    // Add to local logs
    this.addToLocalLogs(logEntry);

    // Add to pending batch for remote logging
    if (this.remoteLoggingEnabled) {
      this.addToPendingBatch(logEntry);
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      this.outputToConsole(logEntry);
    }

    return logEntry.id;
  }

  // Convenience methods for different log levels
  debug(message, data, context) {
    return this.log('debug', message, data, context);
  }

  info(message, data, context) {
    return this.log('info', message, data, context);
  }

  warn(message, data, context) {
    return this.log('warn', message, data, context);
  }

  error(message, data, context) {
    return this.log('error', message, data, context);
  }

  critical(message, data, context) {
    return this.log('critical', message, data, context);
  }

  // Specialized logging methods
  logUserAction(action, details = {}) {
    return this.info(`User action: ${action}`, details, { category: 'user_action' });
  }

  logApiCall(method, url, status, duration, data = {}) {
    const level = status >= 400 ? 'error' : 'info';
    return this.log(level, `API ${method} ${url}`, {
      method,
      url,
      status,
      duration,
      ...data
    }, { category: 'api_call' });
  }

  logPerformance(metric, value, context = {}) {
    return this.info(`Performance: ${metric}`, { metric, value }, { 
      category: 'performance',
      ...context 
    });
  }

  logWorkflow(workflowId, step, status, data = {}) {
    const level = status === 'failed' ? 'error' : 'info';
    return this.log(level, `Workflow ${workflowId}: ${step} ${status}`, {
      workflowId,
      step,
      status,
      ...data
    }, { category: 'workflow' });
  }

  logSecurity(event, details = {}) {
    return this.warn(`Security event: ${event}`, details, { category: 'security' });
  }

  logFeatureUsage(feature, action, metadata = {}) {
    return this.info(`Feature usage: ${feature} - ${action}`, metadata, { 
      category: 'feature_usage' 
    });
  }

  logError(error, context = {}) {
    const errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context
    };

    return this.error(`Error: ${error.message}`, errorData, { category: 'error' });
  }

  // Check if log level should be recorded
  shouldLog(level) {
    const levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      critical: 4
    };

    return levels[level] >= levels[this.logLevel];
  }

  // Add log to local storage
  addToLocalLogs(logEntry) {
    this.logs.push(logEntry);

    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Store in localStorage for persistence
    try {
      const storedLogs = this.getStoredLogs();
      storedLogs.push({
        id: logEntry.id,
        timestamp: logEntry.timestamp,
        level: logEntry.level,
        message: logEntry.message,
        category: logEntry.context.category
      });

      // Keep only recent logs in localStorage
      if (storedLogs.length > 200) {
        storedLogs.splice(0, storedLogs.length - 200);
      }

      localStorage.setItem('mediot_logs', JSON.stringify(storedLogs));
    } catch (error) {
      console.warn('Failed to store logs in localStorage:', error);
    }
  }

  // Add log to pending batch for remote logging
  addToPendingBatch(logEntry) {
    this.pendingLogs.push(logEntry);

    // Send batch if it reaches the batch size
    if (this.pendingLogs.length >= this.batchSize) {
      this.flushLogs();
    }
  }

  // Start batch timer for periodic log flushing
  startBatchTimer() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    this.batchTimer = setInterval(() => {
      if (this.pendingLogs.length > 0) {
        this.flushLogs();
      }
    }, this.batchTimeout);
  }

  // Flush pending logs to remote service
  async flushLogs() {
    if (this.pendingLogs.length === 0) {
      return;
    }

    const logsToSend = [...this.pendingLogs];
    this.pendingLogs = [];

    try {
      const response = await fetch('/api/logging/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify({
          logs: logsToSend,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        // Re-add logs to pending if send failed
        this.pendingLogs.unshift(...logsToSend);
        console.warn('Failed to send logs to server');
      } else {
        console.debug(`Sent ${logsToSend.length} logs to server`);
      }
    } catch (error) {
      // Re-add logs to pending if send failed
      this.pendingLogs.unshift(...logsToSend);
      console.warn('Error sending logs to server:', error);
    }
  }

  // Output log to console (development only)
  outputToConsole(logEntry) {
    const { level, message, data, context } = logEntry;
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.debug(prefix, message, data, context);
        break;
      case 'info':
        console.info(prefix, message, data, context);
        break;
      case 'warn':
        console.warn(prefix, message, data, context);
        break;
      case 'error':
      case 'critical':
        console.error(prefix, message, data, context);
        break;
      default:
        console.log(prefix, message, data, context);
    }
  }

  // Override console methods for development
  overrideConsole() {
    const originalConsole = { ...console };

    console.log = (...args) => {
      this.debug(args[0], { args: args.slice(1) }, { source: 'console.log' });
      originalConsole.log(...args);
    };

    console.info = (...args) => {
      this.info(args[0], { args: args.slice(1) }, { source: 'console.info' });
      originalConsole.info(...args);
    };

    console.warn = (...args) => {
      this.warn(args[0], { args: args.slice(1) }, { source: 'console.warn' });
      originalConsole.warn(...args);
    };

    console.error = (...args) => {
      this.error(args[0], { args: args.slice(1) }, { source: 'console.error' });
      originalConsole.error(...args);
    };
  }

  // Utility methods
  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStackTrace() {
    try {
      throw new Error();
    } catch (error) {
      return error.stack;
    }
  }

  sanitizeData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    
    const sanitizeObject = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      const result = Array.isArray(obj) ? [] : {};
      
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }
      
      return result;
    };

    return sanitizeObject(sanitized);
  }

  // Public API methods
  getLogs(filters = {}) {
    let filteredLogs = [...this.logs];

    if (filters.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level);
    }

    if (filters.category) {
      filteredLogs = filteredLogs.filter(log => 
        log.context.category === filters.category
      );
    }

    if (filters.startTime) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(filters.startTime)
      );
    }

    if (filters.endTime) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(filters.endTime)
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchTerm) ||
        JSON.stringify(log.data).toLowerCase().includes(searchTerm)
      );
    }

    return filteredLogs.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  getStoredLogs() {
    try {
      return JSON.parse(localStorage.getItem('mediot_logs') || '[]');
    } catch (error) {
      return [];
    }
  }

  clearLogs() {
    this.logs = [];
    this.pendingLogs = [];
    localStorage.removeItem('mediot_logs');
  }

  setLogLevel(level) {
    this.logLevel = level;
    localStorage.setItem('mediot_log_level', level);
  }

  enableRemoteLogging() {
    this.remoteLoggingEnabled = true;
  }

  disableRemoteLogging() {
    this.remoteLoggingEnabled = false;
  }

  // Export logs for debugging
  exportLogs(format = 'json') {
    const logs = this.getLogs();
    
    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else if (format === 'csv') {
      const headers = ['timestamp', 'level', 'message', 'category', 'userId', 'sessionId'];
      const csvRows = [headers.join(',')];
      
      logs.forEach(log => {
        const row = [
          log.timestamp,
          log.level,
          `"${log.message.replace(/"/g, '""')}"`,
          log.context.category || '',
          log.context.userId || '',
          log.context.sessionId || ''
        ];
        csvRows.push(row.join(','));
      });
      
      return csvRows.join('\n');
    }
    
    return logs;
  }

  // Get logging statistics
  getStats() {
    const logs = this.getLogs();
    const stats = {
      total: logs.length,
      byLevel: {},
      byCategory: {},
      byHour: {},
      recentErrors: []
    };

    logs.forEach(log => {
      // By level
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      
      // By category
      const category = log.context.category || 'uncategorized';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      
      // By hour
      const hour = new Date(log.timestamp).getHours();
      stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
      
      // Recent errors
      if (log.level === 'error' || log.level === 'critical') {
        stats.recentErrors.push({
          timestamp: log.timestamp,
          message: log.message,
          level: log.level
        });
      }
    });

    // Keep only recent errors (last 10)
    stats.recentErrors = stats.recentErrors
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    return stats;
  }
}

// Create singleton instance
const loggingService = new LoggingService();

// Export convenience functions
export const log = (level, message, data, context) => loggingService.log(level, message, data, context);
export const debug = (message, data, context) => loggingService.debug(message, data, context);
export const info = (message, data, context) => loggingService.info(message, data, context);
export const warn = (message, data, context) => loggingService.warn(message, data, context);
export const error = (message, data, context) => loggingService.error(message, data, context);
export const critical = (message, data, context) => loggingService.critical(message, data, context);

export const logUserAction = (action, details) => loggingService.logUserAction(action, details);
export const logApiCall = (method, url, status, duration, data) => loggingService.logApiCall(method, url, status, duration, data);
export const logPerformance = (metric, value, context) => loggingService.logPerformance(metric, value, context);
export const logWorkflow = (workflowId, step, status, data) => loggingService.logWorkflow(workflowId, step, status, data);
export const logSecurity = (event, details) => loggingService.logSecurity(event, details);
export const logFeatureUsage = (feature, action, metadata) => loggingService.logFeatureUsage(feature, action, metadata);
export const logError = (error, context) => loggingService.logError(error, context);

export default loggingService;