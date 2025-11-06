// Production monitoring and error tracking middleware

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

class MonitoringService {
  constructor() {
    this.isInitialized = false;
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      activeConnections: 0
    };
  }

  // Initialize monitoring services
  initialize(app) {
    if (this.isInitialized) return;

    // Initialize Sentry for error tracking
    this.initializeSentry();
    
    // Set up request monitoring
    this.setupRequestMonitoring(app);
    
    // Set up error tracking
    this.setupErrorTracking(app);
    
    // Set up performance monitoring
    this.setupPerformanceMonitoring(app);
    
    // Set up custom metrics
    this.setupCustomMetrics();
    
    this.isInitialized = true;
    console.log('Monitoring service initialized');
  }

  // Initialize Sentry
  initializeSentry() {
    if (!process.env.SENTRY_DSN) {
      console.warn('Sentry DSN not configured, skipping Sentry initialization');
      return;
    }

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'production',
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
      profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 0.1,
      integrations: [
        new ProfilingIntegration(),
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: true }),
        new Sentry.Integrations.Mongo()
      ],
      beforeSend(event) {
        // Filter out sensitive data
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers.authorization;
            delete event.request.headers.cookie;
          }
        }
        return event;
      },
      beforeSendTransaction(event) {
        // Sample transactions based on URL
        if (event.request?.url?.includes('/health')) {
          return null; // Don't track health check requests
        }
        return event;
      }
    });

    console.log('Sentry initialized for error tracking');
  }

  // Set up request monitoring
  setupRequestMonitoring(app) {
    // Sentry request handler (must be first)
    if (process.env.SENTRY_DSN) {
      app.use(Sentry.Handlers.requestHandler());
      app.use(Sentry.Handlers.tracingHandler());
    }

    // Custom request monitoring
    app.use((req, res, next) => {
      const startTime = Date.now();
      
      // Track active connections
      this.metrics.activeConnections++;
      
      // Track request
      this.metrics.requests++;
      
      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = (...args) => {
        const responseTime = Date.now() - startTime;
        
        // Store response time
        this.metrics.responseTime.push(responseTime);
        
        // Keep only last 1000 response times
        if (this.metrics.responseTime.length > 1000) {
          this.metrics.responseTime.shift();
        }
        
        // Decrease active connections
        this.metrics.activeConnections--;
        
        // Log slow requests
        if (responseTime > 5000) {
          console.warn(`Slow request: ${req.method} ${req.url} - ${responseTime}ms`);
          
          if (process.env.SENTRY_DSN) {
            Sentry.addBreadcrumb({
              message: 'Slow request detected',
              category: 'performance',
              level: 'warning',
              data: {
                method: req.method,
                url: req.url,
                responseTime,
                userAgent: req.get('User-Agent')
              }
            });
          }
        }
        
        // Call original end
        originalEnd.apply(res, args);
      };
      
      next();
    });
  }

  // Set up error tracking
  setupErrorTracking(app) {
    // Global error handler
    app.use((err, req, res, next) => {
      // Track error
      this.metrics.errors++;
      
      // Log error
      console.error('Application error:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
      
      // Send to Sentry
      if (process.env.SENTRY_DSN) {
        Sentry.captureException(err, {
          tags: {
            component: 'express',
            method: req.method,
            url: req.url
          },
          user: {
            id: req.user?.id,
            ip_address: req.ip
          },
          extra: {
            headers: this.sanitizeHeaders(req.headers),
            body: this.sanitizeBody(req.body),
            query: req.query,
            params: req.params
          }
        });
      }
      
      // Send error response
      const statusCode = err.statusCode || err.status || 500;
      const message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message;
      
      res.status(statusCode).json({
        success: false,
        error: {
          message,
          code: err.code,
          ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
        }
      });
    });

    // Sentry error handler (must be after all other middleware)
    if (process.env.SENTRY_DSN) {
      app.use(Sentry.Handlers.errorHandler());
    }
  }

  // Set up performance monitoring
  setupPerformanceMonitoring(app) {
    // Monitor event loop lag
    let lastTime = process.hrtime.bigint();
    
    setInterval(() => {
      const currentTime = process.hrtime.bigint();
      const lag = Number(currentTime - lastTime - 1000000000n) / 1000000; // Convert to ms
      lastTime = currentTime;
      
      if (lag > 100) { // Log if event loop lag > 100ms
        console.warn(`Event loop lag detected: ${lag.toFixed(2)}ms`);
        
        if (process.env.SENTRY_DSN) {
          Sentry.addBreadcrumb({
            message: 'Event loop lag detected',
            category: 'performance',
            level: 'warning',
            data: { lag: lag.toFixed(2) }
          });
        }
      }
    }, 1000);

    // Monitor memory usage
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
      const usagePercent = (heapUsedMB / heapTotalMB) * 100;
      
      if (usagePercent > 90) {
        console.warn(`High memory usage: ${usagePercent.toFixed(2)}%`);
        
        if (process.env.SENTRY_DSN) {
          Sentry.addBreadcrumb({
            message: 'High memory usage detected',
            category: 'performance',
            level: 'warning',
            data: {
              heapUsed: heapUsedMB.toFixed(2),
              heapTotal: heapTotalMB.toFixed(2),
              usagePercent: usagePercent.toFixed(2)
            }
          });
        }
      }
    }, 30000); // Check every 30 seconds
  }

  // Set up custom metrics
  setupCustomMetrics() {
    // Reset metrics periodically
    setInterval(() => {
      this.metrics.requests = 0;
      this.metrics.errors = 0;
      this.metrics.responseTime = [];
    }, 3600000); // Reset every hour
  }

  // Sanitize headers for logging
  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    return sanitized;
  }

  // Sanitize request body for logging
  sanitizeBody(body) {
    if (!body || typeof body !== 'object') return body;
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  // Custom error tracking methods
  trackError(error, context = {}) {
    this.metrics.errors++;
    
    console.error('Custom error tracked:', error.message, context);
    
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: context.tags || {},
        extra: context.extra || {},
        user: context.user || {}
      });
    }
  }

  trackEvent(event, data = {}) {
    console.info('Event tracked:', event, data);
    
    if (process.env.SENTRY_DSN) {
      Sentry.addBreadcrumb({
        message: event,
        category: 'custom',
        level: 'info',
        data
      });
    }
  }

  trackPerformance(operation, duration, metadata = {}) {
    console.info(`Performance: ${operation} took ${duration}ms`, metadata);
    
    if (process.env.SENTRY_DSN) {
      Sentry.addBreadcrumb({
        message: `Performance: ${operation}`,
        category: 'performance',
        level: 'info',
        data: {
          duration,
          ...metadata
        }
      });
    }
  }

  // Get current metrics
  getMetrics() {
    const responseTime = this.metrics.responseTime;
    const avgResponseTime = responseTime.length > 0 
      ? responseTime.reduce((a, b) => a + b, 0) / responseTime.length 
      : 0;
    
    return {
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      activeConnections: this.metrics.activeConnections,
      responseTime: {
        average: Math.round(avgResponseTime),
        min: responseTime.length > 0 ? Math.min(...responseTime) : 0,
        max: responseTime.length > 0 ? Math.max(...responseTime) : 0,
        samples: responseTime.length
      },
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
  }

  // Health check for monitoring
  getHealthStatus() {
    const metrics = this.getMetrics();
    const memUsage = metrics.memory.heapUsed / metrics.memory.heapTotal;
    
    let status = 'healthy';
    const issues = [];
    
    if (memUsage > 0.9) {
      status = 'critical';
      issues.push('High memory usage');
    } else if (memUsage > 0.75) {
      status = 'warning';
      issues.push('Elevated memory usage');
    }
    
    if (metrics.responseTime.average > 5000) {
      status = status === 'critical' ? 'critical' : 'warning';
      issues.push('Slow response times');
    }
    
    if (metrics.errors > 10) {
      status = 'critical';
      issues.push('High error rate');
    }
    
    return {
      status,
      issues,
      metrics
    };
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

// Middleware function
const monitoring = (app) => {
  monitoringService.initialize(app);
  return monitoringService;
};

// Export individual functions for convenience
monitoring.trackError = (error, context) => monitoringService.trackError(error, context);
monitoring.trackEvent = (event, data) => monitoringService.trackEvent(event, data);
monitoring.trackPerformance = (operation, duration, metadata) => 
  monitoringService.trackPerformance(operation, duration, metadata);
monitoring.getMetrics = () => monitoringService.getMetrics();
monitoring.getHealthStatus = () => monitoringService.getHealthStatus();

module.exports = monitoring;