const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `medicine-${uniqueSuffix}${extension}`);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1
  },
  fileFilter: fileFilter
});

// Upload and process image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select an image file to upload'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;
    
    console.log(`📁 File uploaded: ${fileName}`);
    
    // Process image with Sharp for optimization
    try {
      const processedPath = path.join(path.dirname(filePath), `processed-${fileName}`);
      
      await sharp(filePath)
        .resize(1024, 1024, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toFile(processedPath);
      
      // Remove original file and use processed version
      await fs.remove(filePath);
      await fs.move(processedPath, filePath);
      
      console.log(`✅ Image processed and optimized: ${fileName}`);
      
    } catch (processError) {
      console.warn('⚠️ Image processing failed, using original:', processError.message);
    }

    // Schedule file deletion after 1 hour for privacy
    setTimeout(async () => {
      try {
        await fs.remove(filePath);
        console.log(`🗑️ Temporary file deleted: ${fileName}`);
      } catch (deleteError) {
        console.error('Error deleting temporary file:', deleteError);
      }
    }, 60 * 60 * 1000); // 1 hour

    res.json({
      success: true,
      data: {
        filename: fileName,
        path: filePath,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      },
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if upload failed
    if (req.file && req.file.path) {
      try {
        await fs.remove(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up failed upload:', cleanupError);
      }
    }
    
    res.status(500).json({
      error: 'Upload failed',
      message: 'An error occurred while uploading the image'
    });
  }
});

// Get uploaded image (for preview)
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads', filename);
    
    // Check if file exists
    const exists = await fs.pathExists(filePath);
    if (!exists) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The requested image was not found'
      });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'private, max-age=300'); // 5 minutes cache
    
    // Send file
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('File retrieval error:', error);
    res.status(500).json({
      error: 'File retrieval failed',
      message: 'An error occurred while retrieving the image'
    });
  }
});

module.exports = router;
