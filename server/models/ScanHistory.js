const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  scanType: {
    type: String,
    enum: ['barcode', 'qr', 'pill', 'document'],
    required: true
  },
  imageUrl: String,
  scanResult: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  processingTime: {
    type: Number, // in milliseconds
    default: 0
  },
  isSuccessful: {
    type: Boolean,
    default: true
  },
  errorMessage: String,
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
scanHistorySchema.index({ userId: 1, createdAt: -1 });
scanHistorySchema.index({ userId: 1, scanType: 1 });
scanHistorySchema.index({ userId: 1, isSuccessful: 1 });

module.exports = mongoose.model('ScanHistory', scanHistorySchema);