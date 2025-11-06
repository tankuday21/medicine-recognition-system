class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    console.log('[INFO] Notification service initialized:', { 
      supported: this.isSupported, 
      permission: this.permission 
    });
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      return {
        success: false,
        message: 'Notifications are not supported in this browser'
      };
    }

    if (this.permission === 'granted') {
      return {
        success: true,
        message: 'Notification permission already granted'
      };
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;

      if (permission === 'granted') {
        return {
          success: true,
          message: 'Notification permission granted'
        };
      } else {
        return {
          success: false,
          message: 'Notification permission denied'
        };
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return {
        success: false,
        message: 'Failed to request notification permission'
      };
    }
  }

  // Show a notification
  showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Cannot show notification: not supported or permission denied');
      return null;
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'mediot-reminder',
      requireInteraction: true,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Auto-close after 10 seconds if not interacted with
      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  // Show medication reminder notification
  showMedicationReminder(medicine, dosage, time, reminderItem = null) {
    const title = '[MEDICATION] Medication Reminder';
    const body = `Time to take ${medicine}${dosage ? ` (${dosage})` : ''}`;
    
    const options = {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `medication-${medicine}-${Date.now()}`,
      requireInteraction: true,
      silent: false,
      data: {
        type: 'medication',
        medicine,
        dosage,
        time,
        reminderId: reminderItem?.reminderId,
        scheduledTime: reminderItem?.scheduledTime
      },
      actions: [
        {
          action: 'taken',
          title: '[DONE] Mark as Taken',
          icon: '/icons/check.png'
        },
        {
          action: 'snooze',
          title: '⏰ Snooze 10 min',
          icon: '/icons/snooze.png'
        },
        {
          action: 'skip',
          title: '⏭️ Skip This Dose',
          icon: '/icons/skip.png'
        }
      ]
    };

    const notification = this.showNotification(title, options);
    
    if (notification) {
      // Handle notification clicks
      notification.onclick = () => {
        window.focus();
        notification.close();
        // Navigate to reminders page
        this.navigateToReminders();
      };

      // Handle action clicks (for browsers that support it)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'notification-action') {
            this.handleNotificationAction(event.data.action, reminderItem);
          }
        });
      }

      // Auto-close after 30 seconds for medication reminders
      setTimeout(() => {
        if (notification) {
          notification.close();
        }
      }, 30000);
    }

    return notification;
  }

  // Show early reminder (5 minutes before)
  showEarlyReminder(medicine, dosage, minutesBefore) {
    const title = '⏰ Upcoming Medication';
    const body = `${medicine}${dosage ? ` (${dosage})` : ''} is due in ${minutesBefore} minutes`;
    
    const options = {
      body,
      icon: '/favicon.ico',
      tag: `early-${medicine}`,
      requireInteraction: false,
      data: {
        type: 'early_reminder',
        medicine,
        dosage,
        minutesBefore
      }
    };

    return this.showNotification(title, options);
  }

  // Handle notification actions
  async handleNotificationAction(action, reminderItem) {
    if (!reminderItem) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      switch (action) {
        case 'taken':
          await this.markMedicationTaken(reminderItem);
          this.showConfirmationNotification('[SUCCESS] Medication marked as taken');
          break;
        case 'snooze':
          await this.snoozeMedication(reminderItem, 10);
          this.showConfirmationNotification('⏰ Reminder snoozed for 10 minutes');
          break;
        case 'skip':
          await this.skipMedication(reminderItem);
          this.showConfirmationNotification('⏭️ Dose skipped');
          break;
      }
    } catch (error) {
      console.error('Error handling notification action:', error);
    }
  }

  // Mark medication as taken
  async markMedicationTaken(reminderItem) {
    const response = await fetch(`/api/reminders/${reminderItem.reminderId}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        scheduledTime: reminderItem.scheduledTime,
        status: 'taken',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to mark medication as taken');
    }

    return response.json();
  }

  // Snooze medication reminder
  async snoozeMedication(reminderItem, minutes) {
    // Schedule a new notification after the snooze period
    setTimeout(() => {
      this.showMedicationReminder(
        reminderItem.medicineName,
        reminderItem.dosage,
        new Date().toLocaleTimeString(),
        reminderItem
      );
    }, minutes * 60 * 1000);
  }

  // Skip medication dose
  async skipMedication(reminderItem) {
    const response = await fetch(`/api/reminders/${reminderItem.reminderId}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        scheduledTime: reminderItem.scheduledTime,
        status: 'skipped',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to skip medication');
    }

    return response.json();
  }

  // Show confirmation notification
  showConfirmationNotification(message) {
    const options = {
      body: message,
      icon: '/favicon.ico',
      tag: 'confirmation',
      requireInteraction: false
    };

    const notification = this.showNotification('Mediot', options);
    
    // Auto-close after 3 seconds
    if (notification) {
      setTimeout(() => notification.close(), 3000);
    }

    return notification;
  }

  // Navigate to reminders page
  navigateToReminders() {
    if (window.location.pathname !== '/reminders') {
      window.location.href = '/reminders';
    }
  }

  // Schedule notifications for today's reminders
  scheduleNotifications(todaysSchedule) {
    if (!this.isSupported || this.permission !== 'granted') {
      return {
        success: false,
        message: 'Notifications not available'
      };
    }

    // Clear existing scheduled notifications
    this.clearScheduledNotifications();

    const now = new Date();
    let scheduledCount = 0;
    this.scheduledTimeouts = this.scheduledTimeouts || [];

    todaysSchedule.forEach(item => {
      const scheduledTime = new Date(item.scheduledTime);
      
      // Only schedule future notifications for pending items
      if (scheduledTime > now && item.status === 'pending') {
        const timeUntilNotification = scheduledTime.getTime() - now.getTime();
        
        // Schedule the main notification
        const timeoutId = setTimeout(() => {
          this.showMedicationReminder(
            item.medicineName,
            item.dosage,
            scheduledTime.toLocaleTimeString(),
            item
          );
          
          // Schedule follow-up notifications if not taken
          this.scheduleFollowUpNotifications(item);
        }, timeUntilNotification);

        this.scheduledTimeouts.push({
          id: timeoutId,
          reminderId: item.reminderId,
          scheduledTime: scheduledTime,
          type: 'main'
        });
        
        scheduledCount++;

        // Schedule a 5-minute early reminder for important medications
        if (item.isImportant && timeUntilNotification > 5 * 60 * 1000) {
          const earlyTimeoutId = setTimeout(() => {
            this.showEarlyReminder(item.medicineName, item.dosage, 5);
          }, timeUntilNotification - (5 * 60 * 1000));

          this.scheduledTimeouts.push({
            id: earlyTimeoutId,
            reminderId: item.reminderId,
            scheduledTime: new Date(scheduledTime.getTime() - 5 * 60 * 1000),
            type: 'early'
          });
        }
      }
    });

    console.log(`[INFO] Scheduled ${scheduledCount} medication notifications`);

    return {
      success: true,
      message: `Scheduled ${scheduledCount} notifications for today`,
      count: scheduledCount
    };
  }

  // Clear all scheduled notifications
  clearScheduledNotifications() {
    if (this.scheduledTimeouts) {
      this.scheduledTimeouts.forEach(timeout => {
        clearTimeout(timeout.id);
      });
      this.scheduledTimeouts = [];
      console.log('🧹 Cleared all scheduled notifications');
    }
  }

  // Schedule follow-up notifications for missed medications
  scheduleFollowUpNotifications(item) {
    const followUpIntervals = [15, 30, 60]; // minutes
    
    followUpIntervals.forEach(minutes => {
      const timeoutId = setTimeout(() => {
        // Check if medication was taken before showing follow-up
        this.checkAndShowFollowUp(item, minutes);
      }, minutes * 60 * 1000);

      this.scheduledTimeouts.push({
        id: timeoutId,
        reminderId: item.reminderId,
        scheduledTime: new Date(Date.now() + minutes * 60 * 1000),
        type: 'followup'
      });
    });
  }

  // Check medication status and show follow-up if needed
  async checkAndShowFollowUp(item, minutesLate) {
    try {
      // Check if medication was marked as taken
      const response = await fetch(`/api/reminders/${item.reminderId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const todayLogs = data.adherenceLogs?.filter(log => {
          const logDate = new Date(log.timestamp).toDateString();
          const today = new Date().toDateString();
          return logDate === today && log.status === 'taken';
        }) || [];

        // If not taken, show follow-up notification
        if (todayLogs.length === 0) {
          this.showMissedMedicationAlert(
            item.medicineName,
            item.dosage,
            `${minutesLate} minutes ago`
          );
        }
      }
    } catch (error) {
      console.error('Error checking medication status:', error);
      // Show follow-up anyway if we can't check status
      this.showMissedMedicationAlert(
        item.medicineName,
        item.dosage,
        `${minutesLate} minutes ago`
      );
    }
  }

  // Show adherence summary notification
  showAdherenceSummary(stats) {
    const title = '[SUMMARY] Daily Adherence Summary';
    const body = `You took ${stats.taken} out of ${stats.scheduled} medications today (${stats.percentage}%)`;
    
    const options = {
      body,
      icon: '/favicon.ico',
      tag: 'adherence-summary',
      data: {
        type: 'adherence',
        stats
      }
    };

    return this.showNotification(title, options);
  }

  // Show missed medication alert
  showMissedMedicationAlert(medicine, dosage, scheduledTime) {
    const title = '[ALERT] Missed Medication';
    const body = `You missed ${medicine} (${dosage}) scheduled for ${scheduledTime}`;
    
    const options = {
      body,
      icon: '/favicon.ico',
      tag: `missed-${medicine}`,
      data: {
        type: 'missed',
        medicine,
        dosage,
        scheduledTime
      }
    };

    return this.showNotification(title, options);
  }

  // Test notification
  showTestNotification() {
    const title = '🧪 Test Notification';
    const body = 'This is a test notification from Mediot';
    
    const options = {
      body,
      icon: '/favicon.ico',
      tag: 'test-notification'
    };

    return this.showNotification(title, options);
  }

  // Get notification permission status
  getPermissionStatus() {
    return {
      isSupported: this.isSupported,
      permission: this.permission,
      canRequest: this.permission === 'default',
      isGranted: this.permission === 'granted'
    };
  }

  // Clear all notifications with specific tag
  clearNotifications(tag) {
    // Note: There's no direct way to clear notifications by tag in the browser
    // This is a placeholder for future implementation with service workers
    console.log(`Clearing notifications with tag: ${tag}`);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;