const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user profile with detailed information
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.json({
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Profile fetch failed',
      message: 'Internal server error'
    });
  }
});

// Update basic profile information
router.put('/basic', auth, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'dateOfBirth', 'gender'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'No valid fields to update'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

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

// Update medical information
router.put('/medical', auth, async (req, res) => {
  try {
    const { allergies, chronicConditions } = req.body;
    const updates = {};

    if (allergies !== undefined) {
      updates.allergies = Array.isArray(allergies) ? allergies : [];
    }
    
    if (chronicConditions !== undefined) {
      updates.chronicConditions = Array.isArray(chronicConditions) ? chronicConditions : [];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'No valid medical information to update'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Medical information updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Medical info update error:', error);
    res.status(500).json({
      error: 'Medical info update failed',
      message: 'Internal server error'
    });
  }
});

// Update emergency contacts
router.put('/emergency-contacts', auth, async (req, res) => {
  try {
    const { emergencyContacts } = req.body;

    if (!Array.isArray(emergencyContacts)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Emergency contacts must be an array'
      });
    }

    // Validate each contact
    for (const contact of emergencyContacts) {
      if (!contact.name || !contact.phone) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Each emergency contact must have name and phone'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { emergencyContacts },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Emergency contacts updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Emergency contacts update error:', error);
    res.status(500).json({
      error: 'Emergency contacts update failed',
      message: 'Internal server error'
    });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Preferences must be an object'
      });
    }

    // Merge with existing preferences
    const user = await User.findById(req.user._id);
    const updatedPreferences = {
      ...user.preferences.toObject(),
      ...preferences
    };

    // Validate specific preference fields
    if (preferences.language && !['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu'].includes(preferences.language)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid language preference'
      });
    }

    if (preferences.theme && !['light', 'dark', 'auto'].includes(preferences.theme)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid theme preference'
      });
    }

    if (preferences.units && !['metric', 'imperial'].includes(preferences.units)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid units preference'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: updatedPreferences },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Preferences updated successfully',
      user: updatedUser.toJSON()
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      error: 'Preferences update failed',
      message: 'Internal server error'
    });
  }
});

// Delete user account
router.delete('/account', auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password is required to delete account'
      });
    }

    const user = await User.findById(req.user._id);
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid password'
      });
    }

    // Soft delete - mark as inactive instead of hard delete
    await User.findByIdAndUpdate(req.user._id, { isActive: false });

    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      error: 'Account deletion failed',
      message: 'Internal server error'
    });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Import models dynamically to avoid circular dependencies
    const { Reminder, ScanHistory, ChatMessage, SymptomCheck, Report } = require('../models');

    const stats = {
      reminders: {
        total: await Reminder.countDocuments({ userId, isActive: true }),
        active: await Reminder.countDocuments({ 
          userId, 
          isActive: true, 
          startDate: { $lte: new Date() },
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: new Date() } }
          ]
        })
      },
      scans: {
        total: await ScanHistory.countDocuments({ userId }),
        successful: await ScanHistory.countDocuments({ userId, isSuccessful: true }),
        thisMonth: await ScanHistory.countDocuments({ 
          userId, 
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        })
      },
      chatMessages: await ChatMessage.countDocuments({ userId }),
      symptomChecks: await SymptomCheck.countDocuments({ userId }),
      reports: await Report.countDocuments({ userId })
    };

    res.json({ stats });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      error: 'Stats fetch failed',
      message: 'Internal server error'
    });
  }
});

module.exports = router;