const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

// Log environment status
console.log('🔍 Starting Medicine Recognition Server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🔑 Gemini API Key present:', !!process.env.GEMINI_API_KEY);
console.log('🚪 Port:', process.env.PORT || 3001);

// Validate required environment variables (but don't exit immediately)
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is required');
  console.error('⚠️ Server will start but AI features will be disabled');
}

// Try to load routes, but don't fail if they can't be loaded
let medicineRoutes, uploadRoutes;

try {
  medicineRoutes = require('./routes/medicine');
  uploadRoutes = require('./routes/upload');
  console.log('✅ Routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  console.error('Stack trace:', error.stack);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://mediot.vercel.app',
        'https://medicine-recognition-system.vercel.app',
        'https://medicine-recognition-system-git-main-tankuday21.vercel.app',
        'https://medicine-recognition-system-tankuday21.vercel.app',
        process.env.CORS_ORIGIN
      ].filter(Boolean)
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
fs.ensureDirSync(uploadsDir);

// Routes (only if they loaded successfully)
if (medicineRoutes) {
  app.use('/api/medicine', medicineRoutes);
} else {
  app.use('/api/medicine', (req, res) => {
    res.status(503).json({
      error: 'Service unavailable',
      message: 'Medicine analysis service is temporarily unavailable'
    });
  });
}

if (uploadRoutes) {
  app.use('/api/upload', uploadRoutes);
} else {
  app.use('/api/upload', (req, res) => {
    res.status(503).json({
      error: 'Service unavailable',
      message: 'Upload service is temporarily unavailable'
    });
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      message: 'Please upload an image smaller than 10MB'
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Please upload a valid image file (JPEG, PNG, GIF, WebP)'
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource was not found'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Medicine Recognition Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Gemini API configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
  console.log(`📚 Local medicine database loaded`);
}).on('error', (err) => {
  console.error('❌ Server startup error:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
