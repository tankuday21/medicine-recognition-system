const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { auth } = require('../middleware/auth');
const ocrService = require('../services/ocrService');
const reportAnalysisService = require('../services/reportAnalysisService');
const geminiService = require('../services/geminiService');
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
      console.log('❌ No file in request');
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    console.log('📦 req.file:', JSON.stringify({
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      destination: req.file.destination,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    }, null, 2));

    console.log(`📄 Processing report upload for user: ${req.user._id}`);
    console.log(`📁 File received: ${req.file.originalname}, size: ${req.file.size}, type: ${req.file.mimetype}`);

    // Validate file
    const validation = ocrService.validateFile(req.file);
    console.log(`✅ Validation result: ${validation.valid}`);
    if (!validation.valid) {
      // Clean up uploaded file
      await fs.remove(req.file.path);
      console.log(`❌ Validation failed: ${validation.message}`);
      return res.status(400).json({
        error: 'Invalid file',
        message: validation.message
      });
    }

    console.log(`💾 Creating report record in database...`);
    const report = new Report({
      userId: req.user._id,
      fileName: req.file.originalname,
      fileType: path.extname(req.file.originalname).toLowerCase().slice(1),
      fileSize: req.file.size,
      filePath: req.file.path,
      processingStatus: 'processing'
    });

    await report.save();
    console.log(`✅ Report record saved with ID: ${report._id}`);

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
    console.error('❌ Report upload error details:', {
      message: error.message,
      stack: error.stack,
      user: req.user ? req.user._id : 'not authenticated',
      file: req.file ? req.file.originalname : 'no file'
    });

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
      message: 'Failed to upload and process report',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// Rename report
router.put('/:id/rename', auth, async (req, res) => {
  try {
    const { fileName } = req.body;
    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'New file name is required'
      });
    }

    const report = await Report.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { fileName },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Report renamed successfully',
      data: report
    });
  } catch (error) {
    console.error('Rename report error:', error);
    res.status(500).json({
      success: false,
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
    console.log(`🔄 Progressive processing started for report: ${reportId}`);

    // Step 1: Extract Text (OCR)
    await Report.findByIdAndUpdate(reportId, { 
      processingStep: 'extracting_text', 
      processingProgress: 15 
    });
    const rawText = await reportAnalysisService.extractText(filePath);
    await Report.findByIdAndUpdate(reportId, { 
      extractedText: rawText, 
      processingProgress: 30 
    });

    // Step 2: Basic Analysis (Metadata, Patient, Hospital, Summary)
    await Report.findByIdAndUpdate(reportId, { 
      processingStep: 'basic_analysis', 
      processingProgress: 45 
    });
    const basic = await reportAnalysisService.analyzeBasic(rawText);
    
    const reportDoc = await Report.findById(reportId);
    const healthMetrics = new HealthMetrics({
      userId: reportDoc.userId,
      reportId: reportId,
      patientInfo: {
        name: Array.isArray(basic.patient_details?.name) ? basic.patient_details.name.join(' ') : basic.patient_details?.name,
        age: basic.patient_details?.age,
        gender: basic.patient_details?.gender,
        patientId: basic.patient_details?.id
      },
      providerInfo: {
        labName: Array.isArray(basic.hospital_details?.name) ? basic.hospital_details.name.join(' ') : basic.hospital_details?.name,
        labAddress: Array.isArray(basic.hospital_details?.address) ? basic.hospital_details.address.join(', ') : basic.hospital_details?.address,
        reportDate: basic.document_metadata?.date
      },
      summary: { overallStatus: 'unknown' },
      notes: basic.summary,
      detailedAnalysis: { basic_info: basic }
    });
    await healthMetrics.save();
    
    // Update report with the metrics link so UI can start showing basic info
    await Report.findByIdAndUpdate(reportId, { 
      healthMetrics: healthMetrics._id,
      summary: basic.summary,
      processingProgress: 60 
    });

    // Step 3: Detailed Analysis (Vitals, Metrics, Advice)
    await Report.findByIdAndUpdate(reportId, { 
      processingStep: 'detailed_analysis', 
      processingProgress: 75 
    });
    const detailed = await reportAnalysisService.analyzeDetailed(rawText);
    
    // Map Detailed Results
    const mappedMetrics = [];
    if (detailed.vitals && Array.isArray(detailed.vitals)) {
      detailed.vitals.forEach(v => {
        mappedMetrics.push({
          name: v.name,
          displayName: v.name,
          value: v.value,
          unit: v.unit,
          category: 'Vitals',
          interpretation: v.interpretation,
          isNormal: true
        });
      });
    }

    if (detailed.investigations?.results && Array.isArray(detailed.investigations.results)) {
      detailed.investigations.results.forEach(r => {
        let min = null, max = null;
        if (r.normal_range) {
          const rangeParts = String(r.normal_range).match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
          if (rangeParts) {
            min = parseFloat(rangeParts[1]);
            max = parseFloat(rangeParts[2]);
          }
        }
        mappedMetrics.push({
          name: r.name,
          displayName: r.name,
          value: r.value,
          unit: r.unit,
          normalRange: { min, max },
          isNormal: r.is_abnormal === false || r.is_abnormal === "false",
          category: 'Laboratory',
          interpretation: r.interpretation
        });
      });
    }

    // Update HealthMetrics with detailed data
    await HealthMetrics.findByIdAndUpdate(healthMetrics._id, {
      metrics: mappedMetrics,
      clinicalNotes: Array.isArray(detailed.medications) ? detailed.medications.map(m => `${m.name}: ${m.dosage}`) : [],
      summary: {
        totalMetrics: mappedMetrics.length,
        normalMetrics: mappedMetrics.filter(m => m.isNormal).length,
        abnormalMetrics: mappedMetrics.filter(m => !m.isNormal).length,
        overallStatus: mappedMetrics.some(m => !m.isNormal) ? 'attention_needed' : 'normal',
        reportCompleteness: 'High'
      },
      recommendations: (detailed.advice || []).map(a => ({
        title: a.title,
        description: a.description,
        category: a.category || 'General'
      })),
      detailedAnalysis: { ...healthMetrics.detailedAnalysis, clinical_data: detailed }
    });

    // Finalize Report
    await Report.findByIdAndUpdate(reportId, {
      processingStatus: 'processed',
      processingStep: 'completed',
      processingProgress: 100,
      confidence: 0.98
    });

    console.log(`✅ Progressive processing completed for report: ${reportId}`);

  } catch (error) {
    console.error(`❌ Progressive processing failed: ${reportId}`, error);
    await Report.findByIdAndUpdate(reportId, {
      processingStatus: 'failed',
      errorMessage: error.message
    });
  }
}

// ── Report-specific AI Chat (Updated with history and DeepSeek) ──────────
router.post('/:id/chat', auth, async (req, res) => {
  try {
    const { message, reportContext, conversationId, language } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Verify the report belongs to the user
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const userId = req.user._id;
    const convId = conversationId || `report_${req.params.id}`;

    console.log(`💬 Report chat from user:${userId} for report:${req.params.id}`);

    // Load history
    let conversationHistory = [];
    try {
      const ChatMessage = require('../models/ChatMessage'); // Local import to avoid circular dependency if any
      const previousMessages = await ChatMessage.find({
        userId: userId,
        conversationId: convId
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      conversationHistory = previousMessages.reverse().map(msg => ({
        sender: msg.sender,
        message: msg.content
      }));
    } catch (err) {
      console.error('Error loading report chat history:', err);
    }

    // Save user message
    try {
      const ChatMessage = require('../models/ChatMessage');
      await ChatMessage.create({
        userId: userId,
        conversationId: convId,
        content: message.trim(),
        sender: 'user',
        context: { reportId: req.params.id }
      });
    } catch (err) {
      console.error('Error saving report query message:', err);
    }

    // Generate response using DeepSeek via geminiService
    const result = await geminiService.generateReportQueryResponse(
      message.trim(),
      reportContext || report.extractedText,
      conversationHistory,
      language
    );

    if (result.success && result.data?.message) {
      // Save AI response
      try {
        const ChatMessage = require('../models/ChatMessage');
        await ChatMessage.create({
          userId: userId,
          conversationId: convId,
          content: result.data.message,
          sender: 'assistant',
          aiResponse: { provider: result.data.provider }
        });
      } catch (err) {
        console.error('Error saving AI report response:', err);
      }

      return res.json({
        success: true,
        data: {
          response: result.data.message,
          followUps: [], // Could be added to geminiService later if needed
          provider: result.data.provider,
          conversationId: convId
        }
      });
    } else {
      throw new Error(result.error || 'AI processing failed');
    }

  } catch (error) {
    console.error('Report chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process your question. Please try again.'
    });
  }
});

module.exports = router;