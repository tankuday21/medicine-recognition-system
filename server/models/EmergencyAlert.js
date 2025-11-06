const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  alertType: {
    type: String,
    enum: ['sos', 'medical_emergency', 'medication_alert', 'critical_health'],
    required: true
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: String,
    accuracy: Number
  },
  message: {
    type: String,
    required: true
  },
  contactsNotified: [{
    contactId: String,
    name: String,
    phone: String,
    email: String,
    notificationMethod: { type: String, enum: ['sms', 'email', 'call'] },
    status: { type: String, enum: ['sent', 'delivered', 'failed'], default: 'sent' },
    sentAt: { type: Date, default: Date.now }
  }],
  emergencyServices: {
    contacted: { type: Boolean, default: false },
    serviceType: String,
    contactTime: Date
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled'],
    default: 'active'
  },
  resolvedAt: Date,
  notes: String
}, { 
  timestamps: true 
});

// Index for efficient queries
emergencyAlertSchema.index({ userId: 1, createdAt: -1 });
emergencyAlertSchema.index({ userId: 1, status: 1 });
emergencyAlertSchema.index({ alertType: 1, status: 1 });

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);