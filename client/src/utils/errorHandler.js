// Comprehensive error handling system for the Mediot application

class ErrorHandler {
  constructor() {
    this.errorQueue = [];
    this.maxQueueSize = 100;
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    
    // Initialize error tracking
    this.initializeErrorTracking();
  }

  initializeErrorTracking() {
    // Global error handler for unhandled errors
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Global handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Network error handler
    window.addEventListener('offline', () => {
      this.handleError({
        type: 'network_error',
        message: 'Device went offline',
        timestamp: new Date().toISOString()
      });
    });
  }

  // Main error handling method
  handleError(error, context = {}) {
    const errorInfo = {
      id: this.generateErrorId(),
      ...error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      timestamp: error.timestamp || new Date().toISOString()
    };

    // Add to error queue
    this.addToQueue(errorInfo);

    // Log error locally
    this.logError(errorInfo);

    // Send to monitoring service
    this.sendToMonitoring(errorInfo);

    // Show user notification if appropriate
    this.showUserNotification(errorInfo);

    // Attempt recovery if possible
    this.attemptRecovery(errorInfo);

    return errorInfo.id;
  }

  // API error handler
  handleApiError(error, request = {}) {
    const apiError = {
      type: 'api_error',
      message: error.message || 'API request failed',
      status: error.status || error.response?.status,
      statusText: error.statusText || error.response?.statusText,
      url: request.url || error.config?.url,
      method: request.method || error.config?.method,
      data: request.data || error.config?.data,
      headers: request.headers || error.config?.headers,
      responseData: error.response?.data,
      stack: error.stack
    };

    return this.handleError(apiError, { category: 'api' });
  }

  // Authentication error handler
  handleAuthError(error, context = {}) {
    const authError = {
      type: 'auth_error',
      message: error.message || 'Authentication failed',
      status: error.status,
      action: context.action || 'unknown'
    };

    // Clear auth tokens on auth errors
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return this.handleError(authError, { category: 'authentication' });
  }

  // Validation error handler
  handleValidationError(errors, context = {}) {
    const validationError = {
      type: 'validation_error',
      message: 'Form validation failed',
      errors: Array.isArray(errors) ? errors : [errors],
      form: context.form || 'unknown'
    };

    return this.handleError(validationError, { category: 'validation' });
  }

  // Network error handler
  handleNetworkError(error, context = {}) {
    const networkError = {
      type: 'network_error',
      message: error.message || 'Network request failed',
      code: error.code,
      timeout: error.timeout,
      url: context.url
    };

    return this.handleError(networkError, { category: 'network' });
  }

  // File upload error handler
  handleFileError(error, file = {}) {
    const fileError = {
      type: 'file_error',
      message: error.message || 'File operation failed',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      operation: error.operation || 'unknown'
    };

    return this.handleError(fileError, { category: 'file' });
  }

  // Camera/media error handler
  handleMediaError(error, context = {}) {
    const mediaError = {
      type: 'media_error',
      message: error.message || 'Media access failed',
      name: error.name,
      constraint: error.constraint,
      device: context.device || 'unknown'
    };

    return this.handleError(mediaError, { category: 'media' });
  }

  // Database error handler
  handleDatabaseError(error, context = {}) {
    const dbError = {
      type: 'database_error',
      message: error.message || 'Database operation failed',
      operation: context.operation || 'unknown',
      table: context.table || 'unknown',
      query: context.query
    };

    return this.handleError(dbError, { category: 'database' });
  }

  // Add error to queue
  addToQueue(errorInfo) {
    this.errorQueue.push(errorInfo);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  // Log error locally
  logError(errorInfo) {
    const logLevel = this.getLogLevel(errorInfo);
    const logMessage = `[${errorInfo.type.toUpperCase()}] ${errorInfo.message}`;
    
    switch (logLevel) {
      case 'error':
        console.error(logMessage, errorInfo);
        break;
      case 'warn':
        console.warn(logMessage, errorInfo);
        break;
      case 'info':
        console.info(logMessage, errorInfo);
        break;
      default:
        console.log(logMessage, errorInfo);
    }

    // Store in localStorage for debugging
    try {
      const storedErrors = JSON.parse(localStorage.getItem('mediot_errors') || '[]');
      storedErrors.push({
        id: errorInfo.id,
        type: errorInfo.type,
        message: errorInfo.message,
        timestamp: errorInfo.timestamp
      });
      
      // Keep only last 50 errors
      if (storedErrors.length > 50) {
        storedErrors.splice(0, storedErrors.length - 50);
      }
      
      localStorage.setItem('mediot_errors', JSON.stringify(storedErrors));
    } catch (e) {
      console.warn('Failed to store error in localStorage:', e);
    }
  }

  // Send error to monitoring service
  async sendToMonitoring(errorInfo) {
    try {
      // Only send critical errors to avoid spam
      if (!this.shouldSendToMonitoring(errorInfo)) {
        return;
      }

      const response = await fetch('/api/monitoring/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify(errorInfo)
      });

      if (!response.ok) {
        console.warn('Failed to send error to monitoring service');
      }
    } catch (error) {
      console.warn('Error sending to monitoring service:', error);
    }
  }

  // Show user notification
  showUserNotification(errorInfo) {
    if (!this.shouldShowUserNotification(errorInfo)) {
      return;
    }

    const message = this.getUserFriendlyMessage(errorInfo);
    
    // Dispatch custom event for UI components to handle
    window.dispatchEvent(new CustomEvent('errorNotification', {
      detail: {
        id: errorInfo.id,
        type: errorInfo.type,
        message,
        severity: this.getErrorSeverity(errorInfo),
        actions: this.getErrorActions(errorInfo)
      }
    }));
  }

  // Attempt error recovery
  async attemptRecovery(errorInfo) {
    const recoveryStrategy = this.getRecoveryStrategy(errorInfo);
    
    if (!recoveryStrategy) {
      return false;
    }

    try {
      const success = await recoveryStrategy(errorInfo);
      
      if (success) {
        this.logError({
          ...errorInfo,
          type: 'recovery_success',
          message: `Successfully recovered from ${errorInfo.type}`
        });
      }
      
      return success;
    } catch (recoveryError) {
      this.logError({
        ...errorInfo,
        type: 'recovery_failed',
        message: `Failed to recover from ${errorInfo.type}`,
        recoveryError: recoveryError.message
      });
      
      return false;
    }
  }

  // Get recovery strategy for error type
  getRecoveryStrategy(errorInfo) {
    const strategies = {
      network_error: this.recoverFromNetworkError.bind(this),
      auth_error: this.recoverFromAuthError.bind(this),
      api_error: this.recoverFromApiError.bind(this),
      database_error: this.recoverFromDatabaseError.bind(this)
    };

    return strategies[errorInfo.type];
  }

  // Recovery strategies
  async recoverFromNetworkError(errorInfo) {
    // Wait for network to come back online
    return new Promise((resolve) => {
      const checkOnline = () => {
        if (navigator.onLine) {
          resolve(true);
        } else {
          setTimeout(checkOnline, 1000);
        }
      };
      checkOnline();
    });
  }

  async recoverFromAuthError(errorInfo) {
    // Try to refresh token
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        return true;
      }
    } catch (error) {
      console.warn('Token refresh failed:', error);
    }

    return false;
  }

  async recoverFromApiError(errorInfo) {
    // Retry API request with exponential backoff
    const retryKey = `${errorInfo.method}_${errorInfo.url}`;
    const attempts = this.retryAttempts.get(retryKey) || 0;

    if (attempts >= this.maxRetries) {
      return false;
    }

    const delay = Math.pow(2, attempts) * 1000; // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));

    this.retryAttempts.set(retryKey, attempts + 1);

    try {
      const response = await fetch(errorInfo.url, {
        method: errorInfo.method,
        headers: errorInfo.headers,
        body: errorInfo.data
      });

      if (response.ok) {
        this.retryAttempts.delete(retryKey);
        return true;
      }
    } catch (error) {
      console.warn('API retry failed:', error);
    }

    return false;
  }

  async recoverFromDatabaseError(errorInfo) {
    // Try to reinitialize database connection
    try {
      const { default: offlineStorageService } = await import('../services/offlineStorageService');
      await offlineStorageService.initialize();
      return true;
    } catch (error) {
      console.warn('Database recovery failed:', error);
      return false;
    }
  }

  // Utility methods
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentUserId() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      }
    } catch (error) {
      // Ignore token parsing errors
    }
    return null;
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  getLogLevel(errorInfo) {
    const criticalTypes = ['javascript_error', 'unhandled_promise_rejection', 'auth_error'];
    const warningTypes = ['api_error', 'network_error', 'validation_error'];
    
    if (criticalTypes.includes(errorInfo.type)) {
      return 'error';
    } else if (warningTypes.includes(errorInfo.type)) {
      return 'warn';
    }
    return 'info';
  }

  shouldSendToMonitoring(errorInfo) {
    const criticalTypes = ['javascript_error', 'unhandled_promise_rejection', 'auth_error'];
    const highStatusCodes = [500, 502, 503, 504];
    
    return criticalTypes.includes(errorInfo.type) || 
           highStatusCodes.includes(errorInfo.status) ||
           errorInfo.message?.includes('critical');
  }

  shouldShowUserNotification(errorInfo) {
    const userVisibleTypes = ['network_error', 'auth_error', 'file_error', 'media_error'];
    const hiddenTypes = ['javascript_error', 'unhandled_promise_rejection'];
    
    return userVisibleTypes.includes(errorInfo.type) && 
           !hiddenTypes.includes(errorInfo.type);
  }

  getUserFriendlyMessage(errorInfo) {
    const messages = {
      network_error: 'Connection problem. Please check your internet connection.',
      auth_error: 'Authentication failed. Please log in again.',
      api_error: 'Service temporarily unavailable. Please try again.',
      validation_error: 'Please check your input and try again.',
      file_error: 'File upload failed. Please try again.',
      media_error: 'Camera access failed. Please check permissions.',
      database_error: 'Data storage error. Please try again.'
    };

    return messages[errorInfo.type] || 'An unexpected error occurred. Please try again.';
  }

  getErrorSeverity(errorInfo) {
    const highSeverity = ['javascript_error', 'unhandled_promise_rejection', 'auth_error'];
    const mediumSeverity = ['api_error', 'network_error', 'database_error'];
    
    if (highSeverity.includes(errorInfo.type)) {
      return 'high';
    } else if (mediumSeverity.includes(errorInfo.type)) {
      return 'medium';
    }
    return 'low';
  }

  getErrorActions(errorInfo) {
    const actions = {
      network_error: [
        { label: 'Retry', action: 'retry' },
        { label: 'Work Offline', action: 'offline' }
      ],
      auth_error: [
        { label: 'Login Again', action: 'login' }
      ],
      api_error: [
        { label: 'Retry', action: 'retry' }
      ],
      file_error: [
        { label: 'Try Again', action: 'retry' }
      ],
      media_error: [
        { label: 'Check Permissions', action: 'permissions' },
        { label: 'Try Again', action: 'retry' }
      ]
    };

    return actions[errorInfo.type] || [{ label: 'Dismiss', action: 'dismiss' }];
  }

  // Public methods for getting error information
  getErrorQueue() {
    return [...this.errorQueue];
  }

  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('mediot_errors') || '[]');
    } catch (error) {
      return [];
    }
  }

  clearStoredErrors() {
    localStorage.removeItem('mediot_errors');
    this.errorQueue = [];
  }

  // Export error data for debugging
  exportErrorData() {
    return {
      queue: this.getErrorQueue(),
      stored: this.getStoredErrors(),
      retryAttempts: Object.fromEntries(this.retryAttempts),
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Export convenience functions
export const handleError = (error, context) => errorHandler.handleError(error, context);
export const handleApiError = (error, request) => errorHandler.handleApiError(error, request);
export const handleAuthError = (error, context) => errorHandler.handleAuthError(error, context);
export const handleValidationError = (errors, context) => errorHandler.handleValidationError(errors, context);
export const handleNetworkError = (error, context) => errorHandler.handleNetworkError(error, context);
export const handleFileError = (error, file) => errorHandler.handleFileError(error, file);
export const handleMediaError = (error, context) => errorHandler.handleMediaError(error, context);
export const handleDatabaseError = (error, context) => errorHandler.handleDatabaseError(error, context);

export default errorHandler;