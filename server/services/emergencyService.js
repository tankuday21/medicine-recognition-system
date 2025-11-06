const { User } = require('../models');

class EmergencyService {
  constructor() {
    this.emergencyContacts = new Map(); // In-memory storage for demo
    this.activeEmergencies = new Map();
    console.log('🚨 Emergency Service initialized');
  }

  // Trigger emergency alert
  async triggerEmergency(userId, emergencyData) {
    try {
      console.log(`🚨 Emergency triggered for user: ${userId}`);
      
      const { location, emergencyType, message, selectedContacts } = emergencyData;
      
      // Validate required data
      if (!location || !emergencyType) {
        return {
          success: false,
          message: 'Location and emergency type are required'
        };
      }

      // Get user information
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Create emergency record
      const emergencyId = this.generateEmergencyId();
      const emergency = {
        id: emergencyId,
        userId,
        userName: user.name,
        userEmail: user.email,
        emergencyType,
        location,
        message: message || 'Emergency assistance needed',
        selectedContacts: selectedContacts || [],
        timestamp: new Date().toISOString(),
        status: 'active',
        alertsSent: [],
        responses: []
      };

      this.activeEmergencies.set(emergencyId, emergency);

      // Send alerts to emergency contacts
      const alertResults = await this.sendEmergencyAlerts(emergency);

      // Update emergency record with alert results
      emergency.alertsSent = alertResults;
      this.activeEmergencies.set(emergencyId, emergency);

      console.log(`✅ Emergency ${emergencyId} processed. Alerts sent: ${alertResults.length}`);

      return {
        success: true,
        data: {
          emergencyId,
          alertsSent: alertResults.length,
          timestamp: emergency.timestamp
        }
      };

    } catch (error) {
      console.error('Emergency trigger error:', error);
      return {
        success: false,
        message: 'Failed to trigger emergency alert'
      };
    }
  }

  // Send emergency alerts to contacts
  async sendEmergencyAlerts(emergency) {
    const alertResults = [];
    
    try {
      // Get user's emergency contacts
      const userContacts = await this.getEmergencyContacts(emergency.userId);
      
      if (!userContacts.success || userContacts.data.length === 0) {
        console.log('⚠️ No emergency contacts found for user');
        return alertResults;
      }

      // Filter contacts if specific ones were selected
      let contactsToAlert = userContacts.data;
      if (emergency.selectedContacts && emergency.selectedContacts.length > 0) {
        contactsToAlert = userContacts.data.filter(contact => 
          emergency.selectedContacts.includes(contact.id)
        );
      }

      // Send alerts to each contact
      for (const contact of contactsToAlert) {
        try {
          const alertResult = await this.sendAlert(emergency, contact);
          alertResults.push(alertResult);
        } catch (error) {
          console.error(`Failed to send alert to ${contact.name}:`, error);
          alertResults.push({
            contactId: contact.id,
            contactName: contact.name,
            method: 'failed',
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Also send to emergency services if critical
      if (emergency.emergencyType === 'medical_emergency' || emergency.emergencyType === 'accident') {
        const emergencyServiceAlert = await this.notifyEmergencyServices(emergency);
        alertResults.push(emergencyServiceAlert);
      }

    } catch (error) {
      console.error('Error sending emergency alerts:', error);
    }

    return alertResults;
  }

  // Send individual alert
  async sendAlert(emergency, contact) {
    try {
      const alertMessage = this.generateAlertMessage(emergency, contact);
      
      // In a real implementation, this would integrate with:
      // - SMS services (Twilio, AWS SNS)
      // - Email services (SendGrid, AWS SES)
      // - Push notifications
      
      console.log(`📱 Sending emergency alert to ${contact.name} (${contact.phone})`);
      console.log(`📧 Alert message: ${alertMessage.sms}`);
      
      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phone,
        contactEmail: contact.email,
        method: 'sms_email',
        success: true,
        message: alertMessage.sms,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      throw error;
    }
  }

  // Generate alert message
  generateAlertMessage(emergency, contact) {
    const { userName, emergencyType, location, message, timestamp } = emergency;
    
    const locationText = location.address || 
      `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`;
    
    const emergencyTypeText = this.getEmergencyTypeText(emergencyType);
    
    const smsMessage = `🚨 EMERGENCY ALERT 🚨\n\n` +
      `${userName} needs help!\n` +
      `Type: ${emergencyTypeText}\n` +
      `Location: ${locationText}\n` +
      `Message: ${message}\n` +
      `Time: ${new Date(timestamp).toLocaleString()}\n\n` +
      `Please respond or call them immediately.`;

    const emailSubject = `🚨 Emergency Alert - ${userName} needs help`;
    
    const emailBody = `
      <h2 style="color: #dc2626;">🚨 EMERGENCY ALERT</h2>
      <p><strong>${userName}</strong> has triggered an emergency alert and needs immediate assistance.</p>
      
      <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0;">
        <p><strong>Emergency Type:</strong> ${emergencyTypeText}</p>
        <p><strong>Location:</strong> ${locationText}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
      </div>
      
      <p><strong>What to do:</strong></p>
      <ul>
        <li>Contact ${userName} immediately</li>
        <li>If you cannot reach them, consider calling emergency services</li>
        <li>Go to their location if safe and appropriate</li>
      </ul>
      
      <p style="color: #dc2626;"><strong>This is an automated emergency alert from Mediot.</strong></p>
    `;

    return {
      sms: smsMessage,
      emailSubject,
      emailBody
    };
  }

  // Notify emergency services
  async notifyEmergencyServices(emergency) {
    try {
      console.log('🚑 Notifying emergency services...');
      
      // In a real implementation, this would integrate with:
      // - Local emergency services APIs
      // - 911 dispatch systems
      // - Medical alert services
      
      return {
        contactId: 'emergency_services',
        contactName: 'Emergency Services',
        method: 'emergency_dispatch',
        success: true,
        message: 'Emergency services have been notified',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error notifying emergency services:', error);
      return {
        contactId: 'emergency_services',
        contactName: 'Emergency Services',
        method: 'emergency_dispatch',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get emergency type display text
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
      const { name, phone, email, relationship, isPrimary } = contactData;
      
      // Validate required fields
      if (!name || !phone) {
        return {
          success: false,
          message: 'Name and phone number are required'
        };
      }

      // Validate phone number format
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(phone)) {
        return {
          success: false,
          message: 'Invalid phone number format'
        };
      }

      // Validate email if provided
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return {
            success: false,
            message: 'Invalid email format'
          };
        }
      }

      // Get existing contacts
      const existingContacts = this.emergencyContacts.get(userId) || [];
      
      // Check if phone number already exists
      const phoneExists = existingContacts.some(contact => contact.phone === phone);
      if (phoneExists) {
        return {
          success: false,
          message: 'Phone number already exists in emergency contacts'
        };
      }

      // If this is primary, remove primary flag from others
      if (isPrimary) {
        existingContacts.forEach(contact => {
          contact.isPrimary = false;
        });
      }

      // Create new contact
      const newContact = {
        id: this.generateContactId(),
        name,
        phone,
        email: email || null,
        relationship: relationship || 'Other',
        isPrimary: isPrimary || false,
        isVerified: false,
        createdAt: new Date().toISOString()
      };

      existingContacts.push(newContact);
      this.emergencyContacts.set(userId, existingContacts);

      console.log(`📞 Emergency contact added for user ${userId}: ${name}`);

      return {
        success: true,
        data: newContact
      };

    } catch (error) {
      console.error('Add emergency contact error:', error);
      return {
        success: false,
        message: 'Failed to add emergency contact'
      };
    }
  }

  // Get emergency contacts
  async getEmergencyContacts(userId) {
    try {
      const contacts = this.emergencyContacts.get(userId) || [];
      
      return {
        success: true,
        data: contacts.sort((a, b) => {
          // Primary contacts first, then by creation date
          if (a.isPrimary && !b.isPrimary) return -1;
          if (!a.isPrimary && b.isPrimary) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
      };

    } catch (error) {
      console.error('Get emergency contacts error:', error);
      return {
        success: false,
        message: 'Failed to get emergency contacts'
      };
    }
  }

  // Update emergency contact
  async updateEmergencyContact(userId, contactId, updateData) {
    try {
      const contacts = this.emergencyContacts.get(userId) || [];
      const contactIndex = contacts.findIndex(c => c.id === contactId);
      
      if (contactIndex === -1) {
        return {
          success: false,
          message: 'Emergency contact not found'
        };
      }

      // Validate updates
      if (updateData.phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(updateData.phone)) {
          return {
            success: false,
            message: 'Invalid phone number format'
          };
        }
      }

      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          return {
            success: false,
            message: 'Invalid email format'
          };
        }
      }

      // If setting as primary, remove primary from others
      if (updateData.isPrimary) {
        contacts.forEach(contact => {
          contact.isPrimary = false;
        });
      }

      // Update contact
      contacts[contactIndex] = {
        ...contacts[contactIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      this.emergencyContacts.set(userId, contacts);

      return {
        success: true,
        data: contacts[contactIndex]
      };

    } catch (error) {
      console.error('Update emergency contact error:', error);
      return {
        success: false,
        message: 'Failed to update emergency contact'
      };
    }
  }

  // Delete emergency contact
  async deleteEmergencyContact(userId, contactId) {
    try {
      const contacts = this.emergencyContacts.get(userId) || [];
      const filteredContacts = contacts.filter(c => c.id !== contactId);
      
      if (filteredContacts.length === contacts.length) {
        return {
          success: false,
          message: 'Emergency contact not found'
        };
      }

      this.emergencyContacts.set(userId, filteredContacts);

      return {
        success: true,
        message: 'Emergency contact deleted successfully'
      };

    } catch (error) {
      console.error('Delete emergency contact error:', error);
      return {
        success: false,
        message: 'Failed to delete emergency contact'
      };
    }
  }

  // Test emergency contact
  async testEmergencyContact(userId, contactId) {
    try {
      const contacts = this.emergencyContacts.get(userId) || [];
      const contact = contacts.find(c => c.id === contactId);
      
      if (!contact) {
        return {
          success: false,
          message: 'Emergency contact not found'
        };
      }

      // Create test emergency
      const testEmergency = {
        id: 'test-' + Date.now(),
        userId,
        userName: 'Test User',
        emergencyType: 'test',
        location: {
          latitude: 0,
          longitude: 0,
          address: 'Test Location'
        },
        message: 'This is a test of the emergency alert system.',
        timestamp: new Date().toISOString()
      };

      // Send test alert
      const alertResult = await this.sendAlert(testEmergency, contact);

      return {
        success: true,
        data: alertResult
      };

    } catch (error) {
      console.error('Test emergency contact error:', error);
      return {
        success: false,
        message: 'Failed to test emergency contact'
      };
    }
  }

  // Generate unique IDs
  generateEmergencyId() {
    return 'emer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateContactId() {
    return 'cont_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get service status
  getStatus() {
    return {
      isEnabled: true,
      activeEmergencies: this.activeEmergencies.size,
      totalContacts: Array.from(this.emergencyContacts.values()).reduce((sum, contacts) => sum + contacts.length, 0),
      emergencyTypes: ['medical_emergency', 'accident', 'personal_safety', 'natural_disaster', 'other']
    };
  }
}

// Create singleton instance
const emergencyService = new EmergencyService();

module.exports = emergencyService;