const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userProfileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: { type: Date },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  phone: { type: String },
  allergies: [String],
  chronicConditions: [String],
  emergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    relationship: String,
    isPrimary: { type: Boolean, default: false }
  }],
  preferences: {
    language: { type: String, default: 'en' },
    notifications: {
      reminders: { type: Boolean, default: true },
      news: { type: Boolean, default: true },
      emergency: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stats: {
    scans: { type: Number, default: 0 },
    reminders: { type: Number, default: 0 },
    chats: { type: Number, default: 0 }
  },
  appRating: {
    score: { type: Number },
    date: { type: Date },
    feedback: { type: String }
  },
  newsSearchHistory: [String]
}, {
  timestamps: true
});

// Hash password before saving
userProfileSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userProfileSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userProfileSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userProfileSchema);