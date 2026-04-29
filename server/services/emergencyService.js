const { User } = require('../models');

// Initialize Twilio
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  const twilio = require('twilio');
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

class EmergencyService {
  constructor() {
    this.emergencyContacts = new Map();
    this.activeEmergencies = new Map();
    this.smsEnabled = !!twilioClient && !!process.env.TWILIO_PHONE_NUMBER;
    
    console.log('🚨 Emergency Service initialized');
    console.log(`   📱 SMS (Twilio): ${this.smsEnabled ? 'Enabled' : 'Disabled'}`);
  }

  // Trigger emergency alert
  async triggerEmergency(userId, emergencyData, reqUser = null) {
    try {
      console.log(`🚨 Emergency triggered for user: ${userId}`);
      
      const { location, emergencyType, message, selectedContacts } = emergencyData;
      
      if (!location || !emergencyType) {
        return { success: false, message: 'Location and emergency type are required' };
      }

      let user = reqUser;
      if (!user || !user.isDemo) {
        user = await User.findById(userId);
      }
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const emergencyId = this.generateEmergencyId();
      const emergency = {
        id: emergencyId,
        userId,
        userName: user.name,
        userPhone: user.phone || 'Not provided',
        emergencyType,
        location,
        message: message || 'Emergency assistance needed',
        selectedContacts: selectedContacts || [],
        timestamp: new Date().toISOString(),
        status: 'active',
        alertsSent: []
      };

      this.activeEmergencies.set(emergencyId, emergency);

      const alertResults = await this.sendEmergencyAlerts(emergency);
      emergency.alertsSent = alertResults;

      const successfulAlerts = alertResults.filter(r => r.success).length;
      console.log(`✅ Emergency ${emergencyId} - SMS sent: ${successfulAlerts}/${alertResults.length}`);

      return {
        success: true,
        data: {
          emergencyId,
          alertsSent: successfulAlerts,
          totalContacts: alertResults.length,
          timestamp: emergency.timestamp
        }
      };

    } catch (error) {
      console.error('Emergency trigger error:', error);
      return { success: false, message: 'Failed to trigger emergency alert' };
    }
  }

  // Send SMS alerts to contacts
  async sendEmergencyAlerts(emergency) {
    const alertResults = [];
    
    try {
      const userContacts = await this.getEmergencyContacts(emergency.userId.toString());
      
      if (!userContacts.success || userContacts.data.length === 0) {
        console.log('⚠️ No emergency contacts found');
        return alertResults;
      }

      let contactsToAlert = userContacts.data;
      if (emergency.selectedContacts && emergency.selectedContacts.length > 0) {
        contactsToAlert = userContacts.data.filter(contact => 
          emergency.selectedContacts.includes(contact.id)
        );
      }

      for (const contact of contactsToAlert) {
        try {
          const alertResult = await this.sendSMSAlert(emergency, contact);
          alertResults.push(alertResult);
        } catch (error) {
          console.error(`Failed to send SMS to ${contact.name}:`, error);
          alertResults.push({
            contactId: contact.id,
            contactName: contact.name,
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

    } catch (error) {
      console.error('Error sending alerts:', error);
    }

    return alertResults;
  }

  // Send SMS via Twilio
  async sendSMSAlert(emergency, contact) {
    if (!this.smsEnabled) {
      return {
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phone,
        success: false,
        message: 'SMS not configured',
        timestamp: new Date().toISOString()
      };
    }

    const message = this.generateSMSMessage(emergency);
    
    // Format phone number
    let formattedPhone = contact.phone.replace(/\s/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('91')) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+91' + formattedPhone;
      }
    }

    try {
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

      const result = await twilioClient.messages.create(messageOptions);

      console.log(`📱 SMS sent to ${contact.name} (${formattedPhone}) - SID: ${result.sid}`);

      return {
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phone,
        success: true,
        sid: result.sid,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }

  // Generate SMS message
  generateSMSMessage(emergency) {
    const { userName, userPhone, location, emergencyType } = emergency;
    const typeText = this.getEmergencyTypeText(emergencyType);
    const lat = location.latitude;
    const lng = location.longitude;
    // Use a plus sign instead of a comma to prevent link truncation in SMS apps
    const mapsLink = `https://www.google.com/maps?q=${lat}+${lng}`;
    return `🚨 SOS! ${userName} needs help!\n⚠️ Type: ${typeText}\n📍 Location: ${mapsLink}\n📞 Call: ${userPhone}`;
  }

  getEmergencyTypeText(type) {
    const types = {
      medical_emergency: 'Medical Emergency',
      accident: 'Accident',
      personal_safety: 'Personal Safety',
      natural_disaster: 'Natural Disaster',
      other: 'Other Emergency'
    };
    return types[type] || 'Emergency';
  }

  // Add emergency contact
  async addEmergencyContact(userId, contactData) {
    try {
      const { name, phone, relationship, isPrimary } = contactData;
      
      if (!name || !phone) {
        return { success: false, message: 'Name and phone number are required' };
      }

      const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$|^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return { success: false, message: 'Invalid phone number format' };
      }

      // Handle demo user
      if (userId.toString() === '000000000000000000000001') {
        const userIdStr = userId.toString();
        const existingContacts = this.emergencyContacts.get(userIdStr) || [];
        
        const normalizedPhone = phone.replace(/\s/g, '');
        if (existingContacts.some(c => c.phone.replace(/\s/g, '') === normalizedPhone)) {
          return { success: false, message: 'Phone number already exists' };
        }

        if (isPrimary) {
          existingContacts.forEach(contact => { contact.isPrimary = false; });
        }

        const newContact = {
          id: this.generateContactId(),
          name,
          phone,
          relationship: relationship || 'Other',
          isPrimary: isPrimary || false,
          createdAt: new Date().toISOString()
        };

        existingContacts.push(newContact);
        this.emergencyContacts.set(userIdStr, existingContacts);
        return { success: true, data: newContact };
      }

      // Handle real user
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const normalizedPhone = phone.replace(/\s/g, '');
      if (user.emergencyContacts.some(c => c.phone.replace(/\s/g, '') === normalizedPhone)) {
        return { success: false, message: 'Phone number already exists' };
      }

      if (isPrimary) {
        user.emergencyContacts.forEach(contact => { contact.isPrimary = false; });
      }

      const newContact = {
        name,
        phone,
        relationship: relationship || 'Other',
        isPrimary: isPrimary || false
      };

      user.emergencyContacts.push(newContact);
      await user.save();

      const savedContact = user.emergencyContacts[user.emergencyContacts.length - 1];
      return { 
        success: true, 
        data: {
          id: savedContact._id,
          name: savedContact.name,
          phone: savedContact.phone,
          relationship: savedContact.relationship,
          isPrimary: savedContact.isPrimary,
          createdAt: savedContact._id.getTimestamp()
        } 
      };

    } catch (error) {
      console.error('Add contact error:', error);
      return { success: false, message: 'Failed to add contact' };
    }
  }

  // Get emergency contacts
  async getEmergencyContacts(userId) {
    try {
      const userIdStr = userId.toString();
      
      // Handle demo user
      if (userIdStr === '000000000000000000000001') {
        const contacts = this.emergencyContacts.get(userIdStr) || [];
        return {
          success: true,
          data: contacts.sort((a, b) => {
            if (a.isPrimary && !b.isPrimary) return -1;
            if (!a.isPrimary && b.isPrimary) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          })
        };
      }

      // Handle real user
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const contacts = user.emergencyContacts.map(c => ({
        id: c._id,
        name: c.name,
        phone: c.phone,
        relationship: c.relationship,
        isPrimary: c.isPrimary,
        createdAt: c._id.getTimestamp()
      }));

      return {
        success: true,
        data: contacts.sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) return -1;
          if (!a.isPrimary && b.isPrimary) return 1;
          return b.createdAt - a.createdAt;
        })
      };

    } catch (error) {
      console.error('Get contacts error:', error);
      return { success: false, message: 'Failed to get contacts' };
    }
  }

  // Update emergency contact
  async updateEmergencyContact(userId, contactId, updateData) {
    try {
      const userIdStr = userId.toString();
      
      // Handle demo user
      if (userIdStr === '000000000000000000000001') {
        const contacts = this.emergencyContacts.get(userIdStr) || [];
        const contactIndex = contacts.findIndex(c => c.id === contactId);
        
        if (contactIndex === -1) {
          return { success: false, message: 'Contact not found' };
        }

        if (updateData.isPrimary) {
          contacts.forEach(contact => { contact.isPrimary = false; });
        }

        contacts[contactIndex] = {
          ...contacts[contactIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };

        this.emergencyContacts.set(userIdStr, contacts);
        return { success: true, data: contacts[contactIndex] };
      }

      // Handle real user
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const contact = user.emergencyContacts.id(contactId);
      if (!contact) {
        return { success: false, message: 'Contact not found' };
      }

      if (updateData.isPrimary) {
        user.emergencyContacts.forEach(c => { c.isPrimary = false; });
      }

      if (updateData.name) contact.name = updateData.name;
      if (updateData.phone) contact.phone = updateData.phone;
      if (updateData.relationship) contact.relationship = updateData.relationship;
      if (updateData.isPrimary !== undefined) contact.isPrimary = updateData.isPrimary;

      await user.save();

      return { 
        success: true, 
        data: {
          id: contact._id,
          name: contact.name,
          phone: contact.phone,
          relationship: contact.relationship,
          isPrimary: contact.isPrimary
        } 
      };

    } catch (error) {
      console.error('Update contact error:', error);
      return { success: false, message: 'Failed to update contact' };
    }
  }

  // Delete emergency contact
  async deleteEmergencyContact(userId, contactId) {
    try {
      const userIdStr = userId.toString();
      
      // Handle demo user
      if (userIdStr === '000000000000000000000001') {
        const contacts = this.emergencyContacts.get(userIdStr) || [];
        const filteredContacts = contacts.filter(c => c.id !== contactId);
        
        if (filteredContacts.length === contacts.length) {
          return { success: false, message: 'Contact not found' };
        }

        this.emergencyContacts.set(userIdStr, filteredContacts);
        return { success: true, message: 'Contact deleted' };
      }

      // Handle real user
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      user.emergencyContacts.pull(contactId);
      await user.save();

      return { success: true, message: 'Contact deleted' };

    } catch (error) {
      console.error('Delete contact error:', error);
      return { success: false, message: 'Failed to delete contact' };
    }
  }

  // Test SMS to contact
  async testEmergencyContact(userId, contactId, location = null, reqUser = null) {
    try {
      const userIdStr = userId.toString();
      let contact = null;

      // Handle demo user
      if (userIdStr === '000000000000000000000001') {
        const contacts = this.emergencyContacts.get(userIdStr) || [];
        contact = contacts.find(c => c.id === contactId);
      } else {
        // Handle real user
        const user = await User.findById(userId);
        if (!user) {
          return { success: false, message: 'User not found' };
        }
        
        const foundContact = user.emergencyContacts.id(contactId);
        if (foundContact) {
          contact = {
            id: foundContact._id.toString(),
            name: foundContact.name,
            phone: foundContact.phone,
            relationship: foundContact.relationship,
            isPrimary: foundContact.isPrimary
          };
        }
      }
      
      if (!contact) {
        return { success: false, message: 'Contact not found' };
      }

      let user = reqUser;
      if (!user || !user.isDemo) {
        user = await User.findById(userId);
      }

      const testEmergency = {
        id: 'test-' + Date.now(),
        userId,
        userName: user?.name || 'Test User',
        userPhone: user?.phone || 'Not provided',
        emergencyType: 'test',
        location: location || { latitude: 28.6139, longitude: 77.2090, address: 'Test Location - New Delhi' },
        message: 'This is a test emergency alert from Mediot.',
        timestamp: new Date().toISOString(),
        status: 'test',
        alertsSent: []
      };

      const alertResult = await this.sendSMSAlert(testEmergency, contact);

      return { success: alertResult.success, data: alertResult };

    } catch (error) {
      console.error('Test contact error:', error);
      return { success: false, message: 'Failed to test contact' };
    }
  }

  generateEmergencyId() {
    return 'emer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateContactId() {
    return 'cont_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getStatus() {
    return {
      isEnabled: true,
      smsEnabled: this.smsEnabled,
      activeEmergencies: this.activeEmergencies.size,
      totalContacts: Array.from(this.emergencyContacts.values()).reduce((sum, contacts) => sum + contacts.length, 0),
      emergencyTypes: ['medical_emergency', 'accident', 'personal_safety', 'natural_disaster', 'other'],
      indianEmergencyNumbers: {
        universal: '112',
        police: '100',
        ambulance: '108',
        fire: '101',
        women: '1091'
      }
    };
  }
}

const emergencyService = new EmergencyService();

module.exports = emergencyService;
