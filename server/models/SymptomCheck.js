const mongoose = require('mongoose');

const symptomCheckSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  symptoms: [{
    name: { type: String, required: true },
    severity: { 
      type: String, 
      enum: ['mild', 'moderate', 'severe'],
      required: true
    },
    duration: {
      value: Number,
      unit: { type: String, enum: ['hours', 'days', 'weeks', 'months'] }
    },
    bodyPart: String
  }],
  possibleConditions: [{
    name: String,
    probability: {
      type: Number,
      min: 0,
      max: 100
    },
    description: String,
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'serious', 'emergency']
    }
  }],
  recommendations: {
    selfCare: [String],
    whenToSeeDoctor: String,
    emergencyWarning: {
      isEmergency: { type: Boolean, default: false },
      warning: String
    }
  },
  riskFactors: [String],
  checkDate: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
symptomCheckSchema.index({ userId: 1, checkDate: -1 });
symptomCheckSchema.index({ userId: 1, 'recommendations.emergencyWarning.isEmergency': 1 });

module.exports = mongoose.model('SymptomCheck', symptomCheckSchema);