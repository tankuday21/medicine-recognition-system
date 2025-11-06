const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine'
  },
  medicineName: { 
    type: String, 
    required: true 
  },
  dosage: { 
    type: String, 
    required: true 
  },
  frequency: {
    type: String,
    enum: ['once', 'twice', 'thrice', 'four_times', 'custom'],
    required: true
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: Date,
  times: [String], // Array of time strings like "08:00", "14:00"
  isActive: { 
    type: Boolean, 
    default: true 
  },
  adherenceLog: [{
    scheduledTime: Date,
    takenTime: Date,
    status: { 
      type: String, 
      enum: ['taken', 'missed', 'skipped'],
      required: true
    },
    notes: String
  }],
  notes: String
}, { 
  timestamps: true 
});

// Index for efficient queries
reminderSchema.index({ userId: 1, isActive: 1 });
reminderSchema.index({ userId: 1, startDate: 1, endDate: 1 });

// Calculate adherence percentage
reminderSchema.methods.getAdherencePercentage = function() {
  if (this.adherenceLog.length === 0) return 0;
  
  const takenCount = this.adherenceLog.filter(log => log.status === 'taken').length;
  return Math.round((takenCount / this.adherenceLog.length) * 100);
};

module.exports = mongoose.model('Reminder', reminderSchema);