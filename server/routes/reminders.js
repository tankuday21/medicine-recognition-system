const express = require('express');
const { auth } = require('../middleware/auth');
const reminderService = require('../services/reminderService');

const router = express.Router();

// Create a new reminder
router.post('/', auth, async (req, res) => {
  try {
    const result = await reminderService.createReminder(req.user._id, req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json({
        error: 'Reminder creation failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({
      error: 'Reminder creation failed',
      message: 'Internal server error'
    });
  }
});

// Get user's reminders
router.get('/', auth, async (req, res) => {
  try {
    const options = {
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : null,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await reminderService.getUserReminders(req.user._id, options);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Failed to fetch reminders',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      error: 'Failed to fetch reminders',
      message: 'Internal server error'
    });
  }
});

// Get today's reminders
router.get('/today', auth, async (req, res) => {
  try {
    const result = await reminderService.getTodaysReminders(req.user._id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Failed to fetch today\'s reminders',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Get today\'s reminders error:', error);
    res.status(500).json({
      error: 'Failed to fetch today\'s reminders',
      message: 'Internal server error'
    });
  }
});

// Get adherence statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const result = await reminderService.getAdherenceStats(req.user._id, days);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Failed to fetch adherence stats',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Get adherence stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch adherence stats',
      message: 'Internal server error'
    });
  }
});

// Get scheduling conflicts
router.get('/conflicts', auth, async (req, res) => {
  try {
    const result = await reminderService.getSchedulingConflicts(req.user._id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Failed to fetch scheduling conflicts',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Get scheduling conflicts error:', error);
    res.status(500).json({
      error: 'Failed to fetch scheduling conflicts',
      message: 'Internal server error'
    });
  }
});

// Update a reminder
router.put('/:id', auth, async (req, res) => {
  try {
    const result = await reminderService.updateReminder(req.user._id, req.params.id, req.body);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Reminder update failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({
      error: 'Reminder update failed',
      message: 'Internal server error'
    });
  }
});

// Delete a reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await reminderService.deleteReminder(req.user._id, req.params.id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Reminder deletion failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({
      error: 'Reminder deletion failed',
      message: 'Internal server error'
    });
  }
});

// Log dose (taken/missed/skipped)
router.post('/:id/log', auth, async (req, res) => {
  try {
    const result = await reminderService.logDose(req.user._id, req.params.id, req.body);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Dose logging failed',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Log dose error:', error);
    res.status(500).json({
      error: 'Dose logging failed',
      message: 'Internal server error'
    });
  }
});

// Mark medicine as taken (legacy endpoint for sync service)
router.post('/mark-taken', auth, async (req, res) => {
  try {
    const { reminderId, scheduledTime, status = 'taken' } = req.body;
    
    if (!reminderId) {
      return res.status(400).json({
        error: 'Missing reminder ID',
        message: 'Please provide a reminder ID'
      });
    }

    console.log(`💊 Marking medicine as ${status} for reminder: ${reminderId}`);

    const result = await reminderService.logDose(req.user._id, reminderId, {
      scheduledTime,
      status,
      timestamp: new Date().toISOString()
    });
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Failed to mark medicine',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Mark medicine taken error:', error);
    res.status(500).json({
      error: 'Failed to mark medicine',
      message: 'Internal server error'
    });
  }
});

// Get adherence data for calendar
router.get('/adherence', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing date range',
        message: 'Please provide startDate and endDate query parameters'
      });
    }

    console.log(`📅 Getting adherence data for user ${req.user._id} from ${startDate} to ${endDate}`);

    const result = await reminderService.getAdherenceData(req.user._id, startDate, endDate);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Failed to get adherence data',
        message: result.message
      });
    }
  } catch (error) {
    console.error('Get adherence data error:', error);
    res.status(500).json({
      error: 'Failed to get adherence data',
      message: 'Internal server error'
    });
  }
});

// Get default times for frequency
router.get('/frequency/:frequency/times', (req, res) => {
  try {
    const { frequency } = req.params;
    const times = reminderService.getDefaultTimesForFrequency(frequency);
    
    res.json({
      success: true,
      data: {
        frequency,
        defaultTimes: times,
        expectedCount: reminderService.getExpectedTimesForFrequency(frequency)
      }
    });
  } catch (error) {
    console.error('Get default times error:', error);
    res.status(500).json({
      error: 'Failed to get default times',
      message: 'Internal server error'
    });
  }
});

module.exports = router;