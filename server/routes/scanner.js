const express = require('express');
const multer = require('multer');
const { auth, optionalAuth } = require('../middleware/auth');

// Try to use real scanner service, fallback to mock if database unavailable
let scannerService;
try {
  scannerService = require('../services/scannerService');
} catch (error) {
  console.log('⚠️ Using mock scanner service (database unavailable)');
  scannerService = require('../services/mockScannerService');
}

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// Scan barcode
router.post('/barcode', optionalAuth, async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Barcode is required'
      });
    }

    const result = await scannerService.scanBarcode(barcode, req.user?._id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Scan failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Barcode scan error:', error);
    res.status(500).json({
      error: 'Scan failed',
      message: 'Internal server error'
    });
  }
});

// Process QR code
router.post('/qr-code', optionalAuth, async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'QR code data is required'
      });
    }

    const result = await scannerService.processQRCode(qrData, req.user?._id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Processing failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('QR code processing error:', error);
    res.status(500).json({
      error: 'Processing failed',
      message: 'Internal server error'
    });
  }
});

// Identify medicine from image (pills, creams, syrups, etc.)
router.post('/medicine', optionalAuth, upload.array('images', 4), async (req, res) => {
  const startTime = Date.now();
  try {
    console.log('📸 Received medicine identification request');
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'At least one image file is required'
      });
    }

    console.log('📸 Number of images:', req.files.length);
    req.files.forEach((file, index) => {
      console.log(`📸 Image ${index + 1} - Size: ${file.size} bytes, Type: ${file.mimetype}`);
    });
    console.log('📸 Starting identification...');

    const imageBuffers = req.files.map(file => file.buffer);
    const result = await scannerService.identifyMedicine(imageBuffers, req.user?._id);

    const duration = Date.now() - startTime;
    console.log(`✅ Identification completed in ${duration}ms`);

    if (result.success) {
      res.json(result);
    } else {
      console.log('⚠️ Identification unsuccessful:', result.message);
      res.status(400).json({
        error: 'Identification failed',
        message: result.message,
        data: result.data // Include data even on failure
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Medicine identification error after ${duration}ms:`, error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Identification failed',
      message: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Legacy route - redirect to /medicine
router.post('/pill', optionalAuth, upload.single('image'), async (req, res) => {
  // Forward to medicine endpoint
  return router.handle(Object.assign(req, { url: '/medicine' }), res);
});

// Extract text from document
router.post('/document', optionalAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Image file is required'
      });
    }

    const result = await scannerService.extractTextFromDocument(req.file.buffer, req.user?._id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Processing failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Document processing error:', error);
    res.status(500).json({
      error: 'Processing failed',
      message: 'Internal server error'
    });
  }
});

// Search medicines
router.get('/search', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Search query must be at least 2 characters long'
      });
    }

    const result = await scannerService.searchMedicines(query.trim(), parseInt(limit));

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Search failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Medicine search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'Internal server error'
    });
  }
});

// Get scan history (requires authentication)
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const result = await scannerService.getScanHistory(
      req.user._id,
      parseInt(limit),
      parseInt(offset)
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'History fetch failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Scan history error:', error);
    res.status(500).json({
      error: 'History fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get medicine details by ID
router.get('/medicine/:id', async (req, res) => {
  try {
    const { Medicine } = require('../models');
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine || !medicine.isActive) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      data: medicine
    });
  } catch (error) {
    console.error('Medicine fetch error:', error);
    res.status(500).json({
      error: 'Fetch failed',
      message: 'Internal server error'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Image size must be less than 10MB'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only JPEG, PNG, GIF, and WebP images are allowed'
    });
  }

  next(error);
});

module.exports = router;