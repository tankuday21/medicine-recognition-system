const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  conversationId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  context: {
    type: mongoose.Schema.Types.Mixed, // Can store scan results, medicine data, etc.
    default: null
  },
  aiResponse: {
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    sources: [String],
    followUpQuestions: [String]
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
chatMessageSchema.index({ userId: 1, conversationId: 1, createdAt: -1 });
chatMessageSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);