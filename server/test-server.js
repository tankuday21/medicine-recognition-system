// Minimal test server to debug startup issues
const express = require('express');
require('dotenv').config();

console.log('🔍 Starting minimal test server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🔑 Gemini API Key present:', !!process.env.GEMINI_API_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: 'test-1.0.0',
    env: process.env.NODE_ENV || 'development'
  });
});

// Test Gemini initialization
app.get('/api/test-gemini', async (req, res) => {
  try {
    console.log('🧪 Testing Gemini initialization...');
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY not found',
        message: 'Environment variable GEMINI_API_KEY is required'
      });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try different model names
    const models = ['gemini-2.5-pro', 'gemini-1.5-pro', 'gemini-pro', 'gemini-pro-vision'];
    const results = {};
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        results[modelName] = 'Available';
        console.log(`✅ Model ${modelName} initialized successfully`);
      } catch (error) {
        results[modelName] = `Error: ${error.message}`;
        console.log(`❌ Model ${modelName} failed: ${error.message}`);
      }
    }

    res.json({
      status: 'Gemini test completed',
      models: results,
      apiKeyPresent: true
    });

  } catch (error) {
    console.error('❌ Gemini test error:', error);
    res.status(500).json({
      error: 'Gemini test failed',
      message: error.message,
      stack: error.stack
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Gemini test: http://localhost:${PORT}/api/test-gemini`);
}).on('error', (err) => {
  console.error('❌ Server startup error:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('✅ Test server setup completed');
