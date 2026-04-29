const express = require('express');
const { auth } = require('../middleware/auth');
const emergencyService = require('../services/emergencyService');

const router = express.Router();

// Trigger emergency alert (sends SMS to all contacts)
router.post('/trigger', auth, async (req, res) => {
  try {
    const { location, emergencyType, message, selectedContacts } = req.body;

    if (!location || !emergencyType) {
      return res.status(400).json({
        success: false,
        message: 'Location and emergency type are required'
      });
    }

    if (!location.latitude || !location.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    console.log(`🚨 Emergency trigger from user: ${req.user._id}`);

    const result = await emergencyService.triggerEmergency(req.user._id, {
      location,
      emergencyType,
      message,
      selectedContacts
    }, req.user);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Emergency trigger error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get emergency contacts
router.get('/contacts', auth, async (req, res) => {
  try {
    const result = await emergencyService.getEmergencyContacts(req.user._id);
    res.json(result);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add emergency contact
router.post('/contacts', auth, async (req, res) => {
  try {
    const { name, phone, relationship, isPrimary } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required'
      });
    }

    const result = await emergencyService.addEmergencyContact(req.user._id, {
      name,
      phone,
      relationship,
      isPrimary
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update emergency contact
router.put('/contacts/:contactId', auth, async (req, res) => {
  try {
    const { contactId } = req.params;
    const result = await emergencyService.updateEmergencyContact(req.user._id, contactId, req.body);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete emergency contact
router.delete('/contacts/:contactId', auth, async (req, res) => {
  try {
    const { contactId } = req.params;
    const result = await emergencyService.deleteEmergencyContact(req.user._id, contactId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Test SMS to contact
router.post('/contacts/:contactId/test', auth, async (req, res) => {
  try {
    const { contactId } = req.params;
    const { location } = req.body;
    const result = await emergencyService.testEmergencyContact(req.user._id, contactId, location, req.user);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Test contact error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Test SMS endpoint (for testing page)
router.post('/test-sms', auth, async (req, res) => {
  try {
    const { phone, userName, emergencyType, location } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      return res.status(400).json({ success: false, message: 'Twilio not configured' });
    }

    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // Format phone number
    let formattedPhone = phone.replace(/\s/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('91')) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+91' + formattedPhone;
      }
    }

    const mapsLink = location 
      ? `https://www.google.com/maps?q=${location.latitude}+${location.longitude}`
      : `https://www.google.com/maps?q=28.6139+77.2090`;

    const message = `🚨 SOS! ${userName || 'User'} needs help!\n📍 Location: ${mapsLink}\n📞 Call: ${phone}`;

    // Use Messaging Service SID if available
    const messageOptions = {
      body: message,
      to: formattedPhone
    };

    if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
      messageOptions.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    } else {
      messageOptions.from = process.env.TWILIO_PHONE_NUMBER;
    }

    const result = await client.messages.create(messageOptions);

    console.log(`📱 Test SMS sent to: ${formattedPhone} - SID: ${result.sid}`);

    res.json({
      success: true,
      message: `Test SMS sent to ${formattedPhone}`,
      sid: result.sid
    });

  } catch (error) {
    console.error('Test SMS error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send test SMS'
    });
  }
});

// Get service status
router.get('/status', async (req, res) => {
  try {
    const status = emergencyService.getStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
