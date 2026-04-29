const mongoose = require('mongoose');

const healthMetricsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  },
  bloodSugar: {
    fasting: Number,
    postMeal: Number,
    random: Number,
    hba1c: Number
  },
  bloodPressure: {
    systolic: Number,
    diastolic: Number
  },
  cholesterol: {
    total: Number,
    hdl: Number,
    ldl: Number,
    triglycerides: Number
  },
  hemoglobin: Number,
  weight: Number,
  height: Number,
  bmi: Number,
  temperature: Number,
  heartRate: Number,
  oxygenSaturation: Number,
  testDate: {
    type: Date,
    default: Date.now
  },
  abnormalFlags: [{
    metric: String,
    value: Number,
    normalRange: {
      min: Number,
      max: Number
    },
    severity: {
      type: String,
      enum: ['low', 'high', 'critical', 'moderate', 'normal']
    },
    recommendation: String
  }],
  // New fields for AI Report Analysis
  patientInfo: {
    name: String,
    age: mongoose.Schema.Types.Mixed,
    gender: String,
    patientId: String,
    referringDoctor: String
  },
  providerInfo: {
    labName: String,
    reportDate: String,
    labAddress: String
  },
  clinicalNotes: [String],
  metrics: [{
    name: String,
    displayName: String,
    value: mongoose.Schema.Types.Mixed, // Changed from Number to Mixed to support string values like "afebrile"
    unit: String,
    normalRange: {
      min: Number,
      max: Number
    },
    isNormal: Boolean,
    category: String,
    interpretation: String
  }],
  // Store full hierarchical analysis from advanced prompt
  detailedAnalysis: mongoose.Schema.Types.Mixed,
  summary: {
    totalMetrics: Number,
    normalMetrics: Number,
    abnormalMetrics: Number,
    overallStatus: {
      type: String,
      enum: ['normal', 'minor_concerns', 'attention_needed', 'critical', 'unknown'],
      default: 'unknown'
    },
    categoriesAnalyzed: [String],
    completeness: {
      percentage: Number
    }
  },
  recommendations: [{
    title: String,
    description: String,
    category: String
  }],
  // specific notes
  notes: String
}, {
  timestamps: true
});

// Index for efficient queries
healthMetricsSchema.index({ userId: 1, testDate: -1 });
healthMetricsSchema.index({ userId: 1, 'abnormalFlags.severity': 1 });

// Calculate BMI if height and weight are provided
healthMetricsSchema.pre('save', function (next) {
  if (this.weight && this.height) {
    const heightInMeters = this.height / 100;
    this.bmi = Math.round((this.weight / (heightInMeters * heightInMeters)) * 10) / 10;
  }
  next();
});

module.exports = mongoose.model('HealthMetrics', healthMetricsSchema);