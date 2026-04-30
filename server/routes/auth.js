const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: '7d' }
  );
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, dateOfBirth, gender } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      console.warn('[AUTH] Registration failed: Missing fields', { 
        hasEmail: !!email, 
        hasPassword: !!password, 
        hasName: !!name,
        bodyKeys: Object.keys(req.body)
      });
      
      const missing = [];
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      if (!name) missing.push('name');
      
      return res.status(400).json({
        error: 'Validation error',
        message: `${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} required`
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'Registration failed',
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Internal server error'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // Demo/Test user login (works without database)
    if (email === 'test@mediot.com' && password === 'Test@123') {
      const demoUser = {
        _id: 'demo-user-id',
        email: 'test@mediot.com',
        name: 'Test User',
        gender: 'other',
        preferences: {
          language: 'en',
          theme: 'auto',
          notifications: { reminders: true, news: true, emergency: true }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const token = jwt.sign(
        { userId: demoUser._id, isDemo: true },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login successful',
        token,
        user: demoUser
      });
    }

    // Find user by email
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      console.warn(`[AUTH] Login failed: User not found with email ${email}`);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.warn(`[AUTH] Login failed: Invalid password for user ${email}`);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    // Handle demo user
    if (req.user && req.user.isDemo) {
      return res.json({
        user: {
          _id: 'demo-user-id',
          email: 'test@mediot.com',
          name: 'Test User',
          gender: 'other',
          preferences: {
            language: 'en',
            theme: 'auto',
            notifications: { reminders: true, news: true, emergency: true }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Profile fetch failed',
      message: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'dateOfBirth', 'gender', 'bloodGroup', 'height', 'weight', 'phone',
      'allergies', 'chronicConditions', 'emergencyContacts', 'preferences',
      'stats', 'appRating', 'newsSearchHistory'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Handle demo user profile update (virtual update)
    if (req.user && req.user.isDemo) {
      const demoUser = {
        ...req.user,
        ...updates,
        updatedAt: new Date()
      };
      return res.json({
        message: 'Profile updated successfully (Demo Mode)',
        user: demoUser
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        error: 'Profile update failed',
        message: 'User not found'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'Internal server error'
    });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(req.user._id);
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'Internal server error'
    });
  }
});

module.exports = router;