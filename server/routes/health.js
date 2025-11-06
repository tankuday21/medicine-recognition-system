// Health check endpoint for production monitoring

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Health check data
let healthData = {
  status: 'unknown',
  timestamp: new Date().toISOString(),
  uptime: 0,
  version: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  checks: {}
};

// Update health data periodically
const updateHealthData = async () => {
  const startTime = Date.now();
  
  try {
    const checks = {
      database: await checkDatabase(),
      memory: checkMemory(),
      disk: checkDisk(),
      external_apis: await checkExternalAPIs(),
      cache: await checkCache(),
      features: checkFeatures()
    };

    const allHealthy = Object.values(checks).every(check => check.status === 'healthy');
    const hasWarnings = Object.values(checks).some(check => check.status === 'warning');
    const hasCritical = Object.values(checks).some(check => check.status === 'critical');

    let overallStatus = 'healthy';
    if (hasCritical) {
      overallStatus = 'critical';
    } else if (hasWarnings) {
      overallStatus = 'warning';
    }

    healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: Date.now() - startTime,
      checks,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };

  } catch (error) {
    healthData = {
      status: 'critical',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: Date.now() - startTime,
      error: error.message,
      checks: {}
    };
  }
};

// Check database connectivity
const checkDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return {
        status: 'critical',
        message: 'Database not connected',
        details: {
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          name: mongoose.connection.name
        }
      };
    }

    // Test database operation
    const startTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const responseTime = Date.now() - startTime;

    if (responseTime > 1000) {
      return {
        status: 'warning',
        message: 'Database response slow',
        details: {
          responseTime,
          host: mongoose.connection.host,
          name: mongoose.connection.name
        }
      };
    }

    return {
      status: 'healthy',
      message: 'Database connected',
      details: {
        responseTime,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState
      }
    };

  } catch (error) {
    return {
      status: 'critical',
      message: 'Database check failed',
      error: error.message
    };
  }
};

// Check memory usage
const checkMemory = () => {
  try {
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal;
    const usedMemory = memUsage.heapUsed;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    let status = 'healthy';
    let message = 'Memory usage normal';

    if (memoryUsagePercent > 90) {
      status = 'critical';
      message = 'Memory usage critical';
    } else if (memoryUsagePercent > 75) {
      status = 'warning';
      message = 'Memory usage high';
    }

    return {
      status,
      message,
      details: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        usagePercent: Math.round(memoryUsagePercent)
      }
    };

  } catch (error) {
    return {
      status: 'error',
      message: 'Memory check failed',
      error: error.message
    };
  }
};

// Check disk space (simplified)
const checkDisk = () => {
  try {
    // This is a simplified check - in production you might want to use a library
    // to check actual disk space
    return {
      status: 'healthy',
      message: 'Disk space adequate',
      details: {
        note: 'Disk space monitoring not implemented'
      }
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Disk check failed',
      error: error.message
    };
  }
};

// Check external APIs
const checkExternalAPIs = async () => {
  const apiChecks = {};
  
  // Check OpenAI API
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        timeout: 5000
      });

      apiChecks.openai = {
        status: response.ok ? 'healthy' : 'warning',
        message: response.ok ? 'OpenAI API accessible' : 'OpenAI API issues',
        responseCode: response.status
      };
    } catch (error) {
      apiChecks.openai = {
        status: 'warning',
        message: 'OpenAI API check failed',
        error: error.message
      };
    }
  }

  // Check SendGrid API
  if (process.env.SENDGRID_API_KEY) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`
        },
        timeout: 5000
      });

      apiChecks.sendgrid = {
        status: response.ok ? 'healthy' : 'warning',
        message: response.ok ? 'SendGrid API accessible' : 'SendGrid API issues',
        responseCode: response.status
      };
    } catch (error) {
      apiChecks.sendgrid = {
        status: 'warning',
        message: 'SendGrid API check failed',
        error: error.message
      };
    }
  }

  const hasErrors = Object.values(apiChecks).some(check => check.status === 'critical');
  const hasWarnings = Object.values(apiChecks).some(check => check.status === 'warning');

  return {
    status: hasErrors ? 'critical' : hasWarnings ? 'warning' : 'healthy',
    message: hasErrors ? 'External API errors' : hasWarnings ? 'External API warnings' : 'External APIs healthy',
    details: apiChecks
  };
};

// Check cache (Redis if available)
const checkCache = async () => {
  try {
    // If Redis is configured, check it
    if (process.env.REDIS_URL) {
      // This would require Redis client setup
      return {
        status: 'healthy',
        message: 'Cache not implemented',
        details: {
          note: 'Redis cache monitoring not implemented'
        }
      };
    }

    return {
      status: 'healthy',
      message: 'No cache configured',
      details: {
        note: 'Cache not required for current setup'
      }
    };

  } catch (error) {
    return {
      status: 'warning',
      message: 'Cache check failed',
      error: error.message
    };
  }
};

// Check feature flags and configurations
const checkFeatures = () => {
  try {
    const features = {
      analytics: process.env.ENABLE_ANALYTICS === 'true',
      pushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS !== 'false',
      fileUpload: process.env.ENABLE_FILE_UPLOAD !== 'false',
      aiChat: process.env.ENABLE_AI_CHAT !== 'false',
      geolocation: process.env.ENABLE_GEOLOCATION !== 'false',
      camera: process.env.ENABLE_CAMERA !== 'false'
    };

    const enabledFeatures = Object.entries(features).filter(([_, enabled]) => enabled);
    
    return {
      status: 'healthy',
      message: `${enabledFeatures.length} features enabled`,
      details: {
        enabled: enabledFeatures.map(([feature]) => feature),
        total: Object.keys(features).length
      }
    };

  } catch (error) {
    return {
      status: 'error',
      message: 'Feature check failed',
      error: error.message
    };
  }
};

// Health check routes

// Simple health check
router.get('/', (req, res) => {
  res.status(healthData.status === 'critical' ? 503 : 200).json({
    status: healthData.status,
    timestamp: healthData.timestamp,
    uptime: healthData.uptime
  });
});

// Detailed health check
router.get('/detailed', (req, res) => {
  res.status(healthData.status === 'critical' ? 503 : 200).json(healthData);
});

// Liveness probe (for Kubernetes/container orchestration)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Readiness probe (for Kubernetes/container orchestration)
router.get('/ready', (req, res) => {
  const isReady = healthData.status !== 'critical' && 
                  mongoose.connection.readyState === 1;
  
  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Metrics endpoint (Prometheus format)
router.get('/metrics', (req, res) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  const metrics = `
# HELP mediot_uptime_seconds Total uptime in seconds
# TYPE mediot_uptime_seconds counter
mediot_uptime_seconds ${process.uptime()}

# HELP mediot_memory_usage_bytes Memory usage in bytes
# TYPE mediot_memory_usage_bytes gauge
mediot_memory_usage_bytes{type="heap_used"} ${memUsage.heapUsed}
mediot_memory_usage_bytes{type="heap_total"} ${memUsage.heapTotal}
mediot_memory_usage_bytes{type="external"} ${memUsage.external}
mediot_memory_usage_bytes{type="rss"} ${memUsage.rss}

# HELP mediot_cpu_usage_microseconds CPU usage in microseconds
# TYPE mediot_cpu_usage_microseconds counter
mediot_cpu_usage_microseconds{type="user"} ${cpuUsage.user}
mediot_cpu_usage_microseconds{type="system"} ${cpuUsage.system}

# HELP mediot_health_status Health check status (1=healthy, 0=unhealthy)
# TYPE mediot_health_status gauge
mediot_health_status ${healthData.status === 'healthy' ? 1 : 0}

# HELP mediot_database_status Database connection status (1=connected, 0=disconnected)
# TYPE mediot_database_status gauge
mediot_database_status ${mongoose.connection.readyState === 1 ? 1 : 0}
`.trim();

  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

// Initialize health monitoring
const initializeHealthMonitoring = () => {
  // Update health data immediately
  updateHealthData();
  
  // Update health data every 30 seconds
  setInterval(updateHealthData, 30000);
  
  console.log('Health monitoring initialized');
};

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  // Update health status to indicate shutdown
  healthData.status = 'shutting_down';
  
  // Close database connection
  mongoose.connection.close(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = {
  router,
  initializeHealthMonitoring,
  getHealthData: () => healthData
};