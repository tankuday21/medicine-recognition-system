// Mobile-specific notification service for PWA

class MobileNotificationService {
  constructor() {
    this.permission = Notification.permission;
    this.isSupported = 'Notification' in window;
    this.registration = null;
    this.activeNotifications = new Map();
    this.reminderQueue = [];
    this.vibrationPatterns = {
      reminder: [200, 100, 200],
      emergency: [500, 200, 500, 200, 500],
      success: [100],
      warning: [300, 100, 300]
    };
  }

  // Initialize the notification service
  async initialize() {
    console.log('[INFO] Initializing Mobile Notification Service...');
    
    if (!this.isSupported) {
      console.warn('Notifications not supported');
      return false;
    }

    // Get service worker registration
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready;
        console.log('Service Worker ready for notifications');
      } catch (error) {
        console.error('Failed to get service worker registration:', error);
      }
    }

    // Listen for notification clicks
    this.setupNotificationHandlers();
    
    // Setup reminder scheduling
    this.setupReminderScheduling();
    
    console.log('[SUCCESS] Mobile Notification Service initialized');
    return true;
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        
        // Show welcome notification
        await this.showNotification('Notifications Enabled', {
          body: 'You\'ll receive medication reminders and health updates.',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'permission-granted',
          vibrate: this.vibrationPatterns.success,
          actions: [
            {
              action: 'test-reminder',
              title: 'Test Reminder',
              icon: '/icons/reminder-action.png'
            }
          ]
        });
        
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  // Show notification with mobile optimizations
  async showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    const defaultOptions = {
      badge: '/icons/badge-72x72.png',
      icon: '/icons/icon-192x192.png',
      vibrate: this.vibrationPatterns.reminder,
      requireInteraction: false,
      silent: false,
      renotify: false,
      timestamp: Date.now(),
      data: {
        timestamp: Date.now(),
        url: '/'
      }
    };

    const notificationOptions = {
      ...defaultOptions,
      ...options,
      data: {
        ...defaultOptions.data,
        ...options.data
      }
    };

    try {
      let notification;
      
      if (this.registration && this.registration.showNotification) {
        // Use service worker notification for better mobile support
        await this.registration.showNotification(title, notificationOptions);
        console.log('Service worker notification shown:', title);
      } else {
        // Fallback to regular notification
        notification = new Notification(title, notificationOptions);
        console.log('Regular notification shown:', title);
        
        // Store reference for management
        if (notificationOptions.tag) {
          this.activeNotifications.set(notificationOptions.tag, notification);
        }
      }

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  // Schedule medication reminder
  async scheduleMedicationReminder(reminder) {
    if (this.permission !== 'granted') {
      console.warn('Cannot schedule reminder: permission not granted');
      return false;
    }

    const now = new Date();
    const reminderTime = new Date(reminder.scheduledTime);
    const delay = reminderTime.getTime() - now.getTime();

    if (delay <= 0) {
      // Show immediately if time has passed
      return await this.showMedicationReminder(reminder);
    }

    // Schedule for later
    const timeoutId = setTimeout(async () => {
      await this.showMedicationReminder(reminder);
      this.reminderQueue = this.reminderQueue.filter(r => r.id !== reminder.id);
    }, delay);

    // Add to queue
    this.reminderQueue.push({
      ...reminder,
      timeoutId
    });

    console.log(`Medication reminder scheduled for ${reminderTime.toLocaleString()}`);
    return true;
  }

  // Show medication reminder notification
  async showMedicationReminder(reminder) {
    const title = `[MEDICATION] ${reminder.medicineName}`;
    const body = `Time to take your ${reminder.dosage}`;
    
    const options = {
      body,
      icon: '/icons/medication-icon.png',
      badge: '/icons/badge-72x72.png',
      tag: `reminder-${reminder.id}`,
      vibrate: this.vibrationPatterns.reminder,
      requireInteraction: true,
      actions: [
        {
          action: 'taken',
          title: 'Mark as Taken',
          icon: '/icons/check-action.png'
        },
        {
          action: 'snooze',
          title: 'Snooze 10min',
          icon: '/icons/snooze-action.png'
        },
        {
          action: 'skip',
          title: 'Skip',
          icon: '/icons/skip-action.png'
        }
      ],
      data: {
        type: 'medication-reminder',
        reminderId: reminder.id,
        medicineName: reminder.medicineName,
        dosage: reminder.dosage,
        url: '/reminders'
      }
    };

    return await this.showNotification(title, options);
  }

  // Show emergency SOS notification
  async showEmergencyNotification(location) {
    const title = '[EMERGENCY] Emergency SOS Activated';
    const body = location 
      ? `Emergency alert sent with your location: ${location}`
      : 'Emergency alert sent to your contacts';

    const options = {
      body,
      icon: '/icons/emergency-icon.png',
      badge: '/icons/badge-72x72.png',
      tag: 'emergency-sos',
      vibrate: this.vibrationPatterns.emergency,
      requireInteraction: true,
      silent: false,
      actions: [
        {
          action: 'cancel',
          title: 'Cancel Alert',
          icon: '/icons/cancel-action.png'
        },
        {
          action: 'call-emergency',
          title: 'Call Emergency',
          icon: '/icons/phone-action.png'
        }
      ],
      data: {
        type: 'emergency-sos',
        location,
        url: '/sos'
      }
    };

    return await this.showNotification(title, options);
  }

  // Show health update notification
  async showHealthUpdateNotification(update) {
    const title = '[HEALTH UPDATE] Health Update';
    const body = update.message || 'New health insights available';

    const options = {
      body,
      icon: '/icons/health-icon.png',
      badge: '/icons/badge-72x72.png',
      tag: 'health-update',
      vibrate: this.vibrationPatterns.success,
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/view-action.png'
        }
      ],
      data: {
        type: 'health-update',
        updateId: update.id,
        url: '/dashboard'
      }
    };

    return await this.showNotification(title, options);
  }

  // Setup notification event handlers
  setupNotificationHandlers() {
    if (!this.registration) return;

    // Handle notification clicks
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'notification-click') {
        this.handleNotificationClick(event.data);
      }
    });

    // Handle notification actions
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'notification-action') {
        this.handleNotificationAction(event.data);
      }
    });
  }

  // Handle notification click
  handleNotificationClick(data) {
    console.log('Notification clicked:', data);
    
    // Open the app to the relevant page
    if (data.url) {
      window.open(data.url, '_blank');
    }

    // Handle specific notification types
    switch (data.type) {
      case 'medication-reminder':
        this.handleMedicationReminderClick(data);
        break;
      case 'emergency-sos':
        this.handleEmergencyClick(data);
        break;
      case 'health-update':
        this.handleHealthUpdateClick(data);
        break;
    }
  }

  // Handle notification actions
  handleNotificationAction(data) {
    console.log('Notification action:', data.action, data);
    
    switch (data.action) {
      case 'taken':
        this.markMedicationTaken(data.reminderId);
        break;
      case 'snooze':
        this.snoozeMedicationReminder(data.reminderId, 10); // 10 minutes
        break;
      case 'skip':
        this.skipMedicationReminder(data.reminderId);
        break;
      case 'cancel':
        this.cancelEmergencyAlert(data);
        break;
      case 'call-emergency':
        this.callEmergencyServices();
        break;
      case 'test-reminder':
        this.showTestReminder();
        break;
    }
  }

  // Setup reminder scheduling system
  setupReminderScheduling() {
    // Check for due reminders every minute
    setInterval(() => {
      this.checkDueReminders();
    }, 60000);

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkDueReminders();
      }
    });
  }

  // Check for due reminders
  async checkDueReminders() {
    // This would typically fetch from IndexedDB or API
    // For now, we'll simulate checking
    console.log('Checking for due reminders...');
  }

  // Mark medication as taken
  async markMedicationTaken(reminderId) {
    console.log('Marking medication as taken:', reminderId);
    
    // Update reminder status in storage
    // This would typically update IndexedDB or send to API
    
    // Show confirmation
    await this.showNotification('[SUCCESS] Medication Taken', {
      body: 'Great job staying on track with your medication!',
      tag: 'medication-taken',
      vibrate: this.vibrationPatterns.success
    });
  }

  // Snooze medication reminder
  async snoozeMedicationReminder(reminderId, minutes) {
    console.log(`Snoozing reminder ${reminderId} for ${minutes} minutes`);
    
    // Schedule new reminder
    const snoozeTime = new Date(Date.now() + minutes * 60000);
    
    // Show confirmation
    await this.showNotification('⏰ Reminder Snoozed', {
      body: `We'll remind you again in ${minutes} minutes`,
      tag: 'medication-snoozed',
      vibrate: this.vibrationPatterns.success
    });
  }

  // Skip medication reminder
  async skipMedicationReminder(reminderId) {
    console.log('Skipping medication reminder:', reminderId);
    
    // Update reminder status
    // This would typically update IndexedDB or send to API
    
    // Show confirmation
    await this.showNotification('⏭️ Reminder Skipped', {
      body: 'Reminder has been skipped for this time',
      tag: 'medication-skipped',
      vibrate: this.vibrationPatterns.warning
    });
  }

  // Show test reminder
  async showTestReminder() {
    const testReminder = {
      id: 'test-reminder',
      medicineName: 'Test Medicine',
      dosage: '1 tablet',
      scheduledTime: new Date()
    };
    
    await this.showMedicationReminder(testReminder);
  }

  // Cancel all scheduled reminders
  cancelAllReminders() {
    this.reminderQueue.forEach(reminder => {
      if (reminder.timeoutId) {
        clearTimeout(reminder.timeoutId);
      }
    });
    this.reminderQueue = [];
    console.log('All reminders cancelled');
  }

  // Get notification status
  getStatus() {
    return {
      isSupported: this.isSupported,
      permission: this.permission,
      hasServiceWorker: !!this.registration,
      activeNotifications: this.activeNotifications.size,
      scheduledReminders: this.reminderQueue.length
    };
  }

  // Clear all notifications
  async clearAllNotifications() {
    if (this.registration && this.registration.getNotifications) {
      const notifications = await this.registration.getNotifications();
      notifications.forEach(notification => notification.close());
    }
    
    this.activeNotifications.forEach(notification => notification.close());
    this.activeNotifications.clear();
    
    console.log('All notifications cleared');
  }
}

// Create singleton instance
const mobileNotificationService = new MobileNotificationService();

// Auto-initialize
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    mobileNotificationService.initialize();
  });
  
  // Make available globally for debugging
  window.mobileNotificationService = mobileNotificationService;
}

export default mobileNotificationService;