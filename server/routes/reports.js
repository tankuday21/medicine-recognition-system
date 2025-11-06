const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { auth } = require('../middleware/auth');
const ocrService = require('../services/ocrService');
const reportAnalysisService = require('../services/reportAnalysisService');
const { Report, HealthMetrics } = require('../models');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/reports');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `report-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload an image or PDF file.'));
    }
  }
});

// Upload and process report
router.post('/upload', auth, upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    console.log(`📄 Processing report upload for user: ${req.user._id}`);

    // Validate file
    const validation = ocrService.validateFile(req.file);
    if (!validation.valid) {
      // Clean up uploaded file
      await fs.remove(req.file.path);
      return res.status(400).json({
        error: 'Invalid file',
        message: validation.message
      });
    }

    // Create report record
    const report = new Report({
      userId: req.user._id,
      fileName: req.file.originalname,
      fileType: path.extname(req.file.originalname).toLowerCase().slice(1),
      fileSize: req.file.size,
      filePath: req.file.path,
      processingStatus: 'processing'
    });

    await report.save();

    // Process in background
    processReportAsync(report._id, req.file.path, req.file.mimetype);

    res.status(202).json({
      success: true,
      message: 'Report uploaded successfully and is being processed',
      data: {
        reportId: report._id,
        fileName: report.fileName,
        status: report.processingStatus
      }
    });

  } catch (error) {
    console.error('Report upload error:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        await fs.remove(req.file.path);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'Upload failed',
      message: 'Failed to upload and process report'
    });
  }
});

// Get user's reports
router.get('/', auth, async (req, res) => {
  try {
    const {
      status = null,
      type = null,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { userId: req.user._id };
    
    if (status) {
      query.processingStatus = status;
    }
    
    if (type) {
      query.reportType = type;
    }

    const reports = await Report.find(query)
      .populate('healthMetrics')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('-filePath'); // Don't expose file paths

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: {
        reports,
        total,
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      error: 'Failed to fetch reports',
      message: 'Internal server error'
    });
  }
});

// Get specific report
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('healthMetrics');

    if (!report) {
      return res.status(404).json({
        error: 'Report not found',
        message: 'Report not found or access denied'
      });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      error: 'Failed to fetch report',
      message: 'Internal server error'
    });
  }
});

// Get report processing status
router.get('/:id/status', auth, async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('processingStatus errorMessage confidence');

    if (!report) {
      return res.status(404).json({
        error: 'Report not found',
        message: 'Report not found or access denied'
      });
    }

    res.json({
      success: true,
      data: {
        status: report.processingStatus,
        errorMessage: report.errorMessage,
        confidence: report.confidence
      }
    });

  } catch (error) {
    console.error('Get report status error:', error);
    res.status(500).json({
      error: 'Failed to fetch report status',
      message: 'Internal server error'
    });
  }
});

// Delete report
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({
        error: 'Report not found',
        message: 'Report not found or access denied'
      });
    }

    // Delete associated health metrics
    if (report.healthMetrics) {
      await HealthMetrics.findByIdAndDelete(report.healthMetrics);
    }

    // Delete file
    if (report.filePath && await fs.pathExists(report.filePath)) {
      await fs.remove(report.filePath);
    }

    // Delete report record
    await Report.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      error: 'Failed to delete report',
      message: 'Internal server error'
    });
  }
});

// Get OCR service status
router.get('/service/status', (req, res) => {
  try {
    const ocrStatus = ocrService.getStatus();
    const analysisStatus = reportAnalysisService.getStatus();

    res.json({
      success: true,
      data: {
        ocr: ocrStatus,
        analysis: analysisStatus
      }
    });
  } catch (error) {
    console.error('Get service status error:', error);
    res.status(500).json({
      error: 'Failed to get service status',
      message: 'Internal server error'
    });
  }
});

// Background processing function
async function processReportAsync(reportId, filePath, mimeType) {
  try {
    console.log(`🔄 Background processing report: ${reportId}`);

    // Step 1: OCR Processing
    const ocrResult = await ocrService.processDocument(filePath, mimeType);
    
    if (!ocrResult.success) {
      await Report.findByIdAndUpdate(reportId, {
        processingStatus: 'failed',
        errorMessage: ocrResult.message
      });
      return;
    }

    // Step 2: Text preprocessing
    const preprocessResult = ocrService.preprocessText(ocrResult.extractedText);
    const finalText = preprocessResult.success ? preprocessResult.cleanedText : ocrResult.extractedText;

    // Step 3: Health metrics analysis
    const analysisResult = await reportAnalysisService.analyzeReport(finalText, {
      ocrConfidence: ocrResult.confidence,
      source: ocrResult.source
    });

    if (!analysisResult.success) {
      await Report.findByIdAndUpdate(reportId, {
        processingStatus: 'failed',
        errorMessage: analysisResult.message,
        extractedText: finalText,
        confidence: ocrResult.confidence
      });
      return;
    }

    // Step 4: Save health metrics
    let healthMetricsId = null;
    if (analysisResult.analysis.extractedMetrics.length > 0) {
      const healthMetrics = new HealthMetrics({
        userId: (await Report.findById(reportId)).userId,
        reportId: reportId,
        metrics: analysisResult.analysis.extractedMetrics.map(metric => ({
          name: metric.name,
          value: metric.value,
          unit: metric.unit,
          normalRange: metric.normalRange,
          isNormal: metric.isNormal,
          category: metric.category
        })),
        abnormalFlags: analysisResult.analysis.abnormalFlags,
        summary: analysisResult.analysis.summary,
        recommendations: analysisResult.analysis.recommendations
      });

      await healthMetrics.save();
      healthMetricsId = healthMetrics._id;
    }

    // Step 5: Update report with results
    await Report.findByIdAndUpdate(reportId, {
      processingStatus: 'processed',
      extractedText: finalText,
      healthMetrics: healthMetricsId,
      confidence: ocrResult.confidence,
      summary: analysisResult.analysis.summary.overallStatus
    });

    console.log(`✅ Report processing completed: ${reportId}`);

  } catch (error) {
    console.error(`❌ Report processing failed: ${reportId}`, error);
    
    await Report.findByIdAndUpdate(reportId, {
      processingStatus: 'failed',
      errorMessage: error.message
    });
  }
}

module.exports = router;