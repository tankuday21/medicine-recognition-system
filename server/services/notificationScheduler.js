const reminderService = require('./reminderService');
const { User } = require('../models');

class NotificationScheduler {
  constructor() {
    this.scheduledNotifications = new Map();
    this.isRunning = false;
    console.log('📅 Notification scheduler initialized');
  }

  // Start the notification scheduler
  start() {
    if (this.isRunning) {
      console.log('⚠️ Notification scheduler already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting notification scheduler...');
    
    // Check for notifications every minute
    this.intervalId = setInterval(() => {
      this.checkAndSendNotifications();
    }, 60000); // 1 minute

    // Initial check
    this.checkAndSendNotifications();
  }

  // Stop the notification scheduler
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Clear all scheduled notifications
    this.scheduledNotifications.clear();
    console.log('🛑 Notification scheduler stopped');
  }

  // Check and send notifications for all users
  async checkAndSendNotifications() {
    try {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      console.log(`🔔 Checking notifications at ${currentTime}`);

      // Get all users with notification preferences enabled
      const users = await User.find({
        'preferences.notifications.reminders': true
      });

      for (const user of users) {
        await this.checkUserNotifications(user._id, now);
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  // Check notifications for a specific user
  async checkUserNotifications(userId, now) {
    try {
      const todaysReminders = await reminderService.getTodaysReminders(userId);
      
      if (!todaysReminders.success) {
        return;
      }

      const currentTime = now.getTime();
      const fiveMinutesAgo = currentTime - (5 * 60 * 1000);
      const oneMinuteFromNow = currentTime + (1 * 60 * 1000);

      for (const reminder of todaysReminders.data) {
        const scheduledTime = new Date(reminder.scheduledTime).getTime();
        
        // Check if it's time for a notification (within 1 minute window)
        if (scheduledTime >= fiveMinutesAgo && scheduledTime <= oneMinuteFromNow && reminder.status === 'pending') {
          const notificationKey = `${userId}-${reminder.reminderId}-${scheduledTime}`;
          
          // Avoid duplicate notifications
          if (!this.scheduledNotifications.has(notificationKey)) {
            await this.sendMedicationReminder(userId, reminder);
            this.scheduledNotifications.set(notificationKey, now);
            
            // Clean up old notifications (older than 1 hour)
            this.cleanupOldNotifications();
          }
        }
      }
    } catch (error) {
      console.error(`Error checking notifications for user ${userId}:`, error);
    }
  }

  // Send medication reminder notification
  async sendMedicationReminder(userId, reminder) {
    try {
      console.log(`💊 Sending medication reminder for ${reminder.medicineName} to user ${userId}`);
      
      const notificationData = {
        userId,
        type: 'medication_reminder',
        title: '💊 Medication Reminder',
        message: `Time to take ${reminder.medicineName} (${reminder.dosage})`,
        data: {
          reminderId: reminder.reminderId,
          medicineName: reminder.medicineName,
          dosage: reminder.dosage,
          scheduledTime: reminder.scheduledTime
        },
        timestamp: new Date()
      };

      // Log notification (in production, send to notification service)
      console.log('📱 Notification:', JSON.stringify(notificationData, null, 2));
      
      return {
        success: true,
        notification: notificationData
      };
    } catch (error) {
      console.error('Error sending medication reminder:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clean up old notifications from memory
  cleanupOldNotifications() {
    const oneHourAgo = new Date().getTime() - (60 * 60 * 1000);
    
    for (const [key, timestamp] of this.scheduledNotifications.entries()) {
      if (timestamp.getTime() < oneHourAgo) {
        this.scheduledNotifications.delete(key);
      }
    }
  }

  // Get notification status
  getStatus() {
    return {
      isRunning: this.isRunning,
      scheduledCount: this.scheduledNotifications.size,
      lastCheck: this.lastCheck || null
    };
  }
}

// Create singleton instance
const notificationScheduler = new NotificationScheduler();

module.exports = notificationScheduler;