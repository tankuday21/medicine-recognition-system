// Central export for all models
const User = require('./User');
const Medicine = require('./Medicine');
const Reminder = require('./Reminder');
const HealthMetrics = require('./HealthMetrics');
const Report = require('./Report');
const ChatMessage = require('./ChatMessage');
const SymptomCheck = require('./SymptomCheck');
const ScanHistory = require('./ScanHistory');
const EmergencyAlert = require('./EmergencyAlert');

module.exports = {
  User,
  Medicine,
  Reminder,
  HealthMetrics,
  Report,
  ChatMessage,
  SymptomCheck,
  ScanHistory,
  EmergencyAlert
};