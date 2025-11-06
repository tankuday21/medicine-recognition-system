// Production configuration for Mediot server

const config = {
  // Environment
  env: 'production',
  
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    host: '0.0.0.0',
    timeout: 30000,
    keepAliveTimeout: 65000,
    headersTimeout: 66000
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      retryWrites: true,
      w: 'majority',
      readPreference: 'primary',
      compressors: ['zlib'],
      zlibCompressionLevel: 6
    },
    dbName: process.env.MONGODB_DB_NAME || 'mediot-production'
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET,
    cookieMaxAge: 24 * 60 * 60 * 1000, // 24 hours
    secureCookies: true,
    sameSite: 'strict'
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://mediot-app.vercel.app',
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400 // 24 hours
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // Security Headers
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google-analytics.com"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.openai.com", "https://api.sendgrid.com"],
          fontSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    },
    trustProxy: true
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain'
    ],
    destination: 'uploads/',
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
      folder: 'mediot-production'
    }
  },

  // External APIs
  apis: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-3.5-turbo',
      maxTokens: 1000,
      temperature: 0.7,
      timeout: 30000
    },
    googleCloud: {
      apiKey: process.env.GOOGLE_CLOUD_API_KEY,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER
    }
  },

  // Email Configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'apikey',
        pass: process.env.SMTP_PASS || process.env.SENDGRID_API_KEY
      }
    },
    from: process.env.FROM_EMAIL || 'noreply@mediot.app',
    support: process.env.SUPPORT_EMAIL || 'support@mediot.app',
    templates: {
      welcome: 'welcome-template',
      verification: 'verification-template',
      passwordReset: 'password-reset-template',
      reminder: 'reminder-template'
    }
  },

  // Push Notifications
  pushNotifications: {
    vapid: {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
      subject: process.env.VAPID_SUBJECT || 'mailto:support@mediot.app'
    },
    gcm: {
      apiKey: process.env.GCM_API_KEY
    }
  },

  // Cache Configuration
  cache: {
    redis: {
      url: process.env.REDIS_URL,
      options: {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        lazyConnect: true
      }
    },
    ttl: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour
    checkPeriod: 600 // 10 minutes
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'warn',
    format: 'json',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
    enableErrorTracking: process.env.ENABLE_ERROR_TRACKING !== 'false',
    maxFiles: 5,
    maxSize: '20m',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true
  },

  // Monitoring
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: 'production',
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.1
    },
    analytics: {
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
      mixpanelToken: process.env.MIXPANEL_TOKEN
    },
    healthCheck: {
      interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
      timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000
    }
  },

  // Feature Flags
  features: {
    analytics: process.env.ENABLE_ANALYTICS === 'true',
    pushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS !== 'false',
    fileUpload: process.env.ENABLE_FILE_UPLOAD !== 'false',
    aiChat: process.env.ENABLE_AI_CHAT !== 'false',
    geolocation: process.env.ENABLE_GEOLOCATION !== 'false',
    camera: process.env.ENABLE_CAMERA !== 'false',
    offlineMode: true,
    backgroundSync: true
  },

  // Performance
  performance: {
    compression: {
      level: parseInt(process.env.COMPRESSION_LEVEL) || 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return true;
      }
    },
    enableGzip: process.env.ENABLE_GZIP !== 'false',
    enableBrotli: process.env.ENABLE_BROTLI !== 'false'
  },

  // API Versioning
  api: {
    version: 'v1',
    prefix: '/api',
    documentation: {
      enabled: false, // Disable in production
      path: '/docs'
    }
  },

  // Backup Configuration
  backup: {
    enabled: true,
    schedule: '0 2 * * *', // Daily at 2 AM
    retention: 30, // Keep 30 days
    s3: {
      bucket: process.env.BACKUP_S3_BUCKET,
      region: process.env.BACKUP_S3_REGION,
      accessKeyId: process.env.BACKUP_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.BACKUP_S3_SECRET_ACCESS_KEY
    }
  },

  // SSL/TLS Configuration
  ssl: {
    enabled: true,
    enforceHttps: true,
    trustProxy: true
  }
};

module.exports = config;