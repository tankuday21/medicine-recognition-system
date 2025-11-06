const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fileName: String,
  fileType: {
    type: String,
    enum: ['pdf', 'jpg', 'jpeg', 'png', 'gif'],
    required: true
  },
  fileSize: Number,
  filePath: String,
  extractedText: String,
  healthMetrics: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'HealthMetrics' 
  },
  summary: String,
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  processingStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'processed', 'failed'], 
    default: 'pending' 
  },
  errorMessage: String,
  reportType: {
    type: String,
    enum: ['blood_test', 'urine_test', 'x_ray', 'mri', 'ct_scan', 'ecg', 'other'],
    default: 'other'
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ userId: 1, processingStatus: 1 });
reportSchema.index({ userId: 1, reportType: 1 });

module.exports = mongoose.model('Report', reportSchema);