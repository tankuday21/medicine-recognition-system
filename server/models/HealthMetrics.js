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
      enum: ['low', 'high', 'critical'] 
    },
    recommendation: String
  }],
  notes: String
}, { 
  timestamps: true 
});

// Index for efficient queries
healthMetricsSchema.index({ userId: 1, testDate: -1 });
healthMetricsSchema.index({ userId: 1, 'abnormalFlags.severity': 1 });

// Calculate BMI if height and weight are provided
healthMetricsSchema.pre('save', function(next) {
  if (this.weight && this.height) {
    const heightInMeters = this.height / 100;
    this.bmi = Math.round((this.weight / (heightInMeters * heightInMeters)) * 10) / 10;
  }
  next();
});

module.exports = mongoose.model('HealthMetrics', healthMetricsSchema);