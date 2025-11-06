const express = require('express');
const { auth } = require('../middleware/auth');
const emergencyService = require('../services/emergencyService');

const router = express.Router();

// Trigger emergency alert
router.post('/trigger', auth, async (req, res) => {
  try {
    const { location, emergencyType, message, selectedContacts } = req.body;

    // Validate required fields
    if (!location || !emergencyType) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Location and emergency type are required'
      });
    }

    // Validate location data
    if (!location.latitude || !location.longitude) {
      return res.status(400).json({
        error: 'Invalid location',
        message: 'Latitude and longitude are required'
      });
    }

    console.log(`🚨 Emergency trigger request from user: ${req.user._id}`);

    const result = await emergencyService.triggerEmergency(req.user._id, {
      location,
      emergencyType,
      message,
      selectedContacts
    });

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json({
        error: 'Emergency trigger failed',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Emergency trigger error:', error);
    res.status(500).json({
      error: 'Emergency trigger failed',
      message: 'Internal server error'
    });
  }
});

// Get emergency contacts
router.get('/contacts', auth, async (req, res) => {
  try {
    const result = await emergencyService.getEmergencyContacts(req.user._id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Failed to get emergency contacts',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({
      error: 'Failed to get emergency contacts',
      message: 'Internal server error'
    });
  }
});

// Add emergency contact
router.post('/contacts', auth, async (req, res) => {
  try {
    const { name, phone, email, relationship, isPrimary } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name and phone number are required'
      });
    }

    const result = await emergencyService.addEmergencyContact(req.user._id, {
      name,
      phone,
      email,
      relationship,
      isPrimary
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json({
        error: 'Failed to add emergency contact',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Add emergency contact error:', error);
    res.status(500).json({
      error: 'Failed to add emergency contact',
      message: 'Internal server error'
    });
  }
});

// Update emergency contact
router.put('/contacts/:contactId', auth, async (req, res) => {
  try {
    const { contactId } = req.params;
    const updateData = req.body;

    const result = await emergencyService.updateEmergencyContact(
      req.user._id,
      contactId,
      updateData
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Failed to update emergency contact',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Update emergency contact error:', error);
    res.status(500).json({
      error: 'Failed to update emergency contact',
      message: 'Internal server error'
    });
  }
});

// Delete emergency contact
router.delete('/contacts/:contactId', auth, async (req, res) => {
  try {
    const { contactId } = req.params;

    const result = await emergencyService.deleteEmergencyContact(
      req.user._id,
      contactId
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Failed to delete emergency contact',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Delete emergency contact error:', error);
    res.status(500).json({
      error: 'Failed to delete emergency contact',
      message: 'Internal server error'
    });
  }
});

// Test emergency contact
router.post('/contacts/:contactId/test', auth, async (req, res) => {
  try {
    const { contactId } = req.params;

    const result = await emergencyService.testEmergencyContact(
      req.user._id,
      contactId
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json({
        error: 'Failed to test emergency contact',
        message: result.message
      });
    }

  } catch (error) {
    console.error('Test emergency contact error:', error);
    res.status(500).json({
      error: 'Failed to test emergency contact',
      message: 'Internal server error'
    });
  }
});

// Get service status
router.get('/status', async (req, res) => {
  try {
    const status = emergencyService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get emergency service status error:', error);
    res.status(500).json({
      error: 'Failed to get service status',
      message: 'Internal server error'
    });
  }
});

module.exports = router;