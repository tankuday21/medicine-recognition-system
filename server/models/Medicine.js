const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  dosage: String,
  manufacturer: String,
  uses: [String],
  sideEffects: [String],
  interactions: [String],
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  imageUrl: String,
  price: {
    amount: Number,
    currency: { type: String, default: 'INR' },
    source: String,
    lastUpdated: { type: Date, default: Date.now }
  },
  category: {
    type: String,
    enum: ['prescription', 'over-the-counter', 'supplement', 'other'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Index for search functionality
medicineSchema.index({ name: 'text', genericName: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);