class PushNotificationService {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.registration = null;
    this.subscription = null;
  }

  async initialize() {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      console.log('Push notification service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  async requestPermission() {
    if (!this.isSupported) {
      return 'not-supported';
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  async subscribe() {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      throw new Error('Service worker not ready');
    }

    try {
      // Check if already subscribed
      this.subscription = await this.registration.pushManager.getSubscription();
      
      if (this.subscription) {
        console.log('Already subscribed to push notifications');
        return this.subscription;
      }

      // Subscribe to push notifications
      const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || 
        'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HtLlVLVWjSrWrTTUeNqSRgN6RcVOQWasOasmnPA_93dPyUDgw';

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('Subscribed to push notifications:', this.subscription);

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);

      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  async unsubscribe() {
    if (!this.subscription) {
      return true;
    }

    try {
      await this.subscription.unsubscribe();
      await this.removeSubscriptionFromServer(this.subscription);
      this.subscription = null;
      console.log('Unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  async sendSubscriptionToServer(subscription) {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }

      console.log('Subscription sent to server successfully');
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      // Don't throw here - subscription still works locally
    }
  }

  async removeSubscriptionFromServer(subscription) {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }

      console.log('Subscription removed from server successfully');
    } catch (error) {
      console.error('Error removing subscription from server:', error);
    }
  }

  async getSubscription() {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      return null;
    }

    try {
      this.subscription = await this.registration.pushManager.getSubscription();
      return this.subscription;
    } catch (error) {
      console.error('Failed to get subscription:', error);
      return null;
    }
  }

  async isSubscribed() {
    const subscription = await this.getSubscription();
    return !!subscription;
  }

  // Schedule local notification (for reminders when offline)
  async scheduleLocalNotification(title, options = {}) {
    if (!this.isSupported) {
      return false;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      return false;
    }

    try {
      if (this.registration) {
        await this.registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          vibrate: [200, 100, 200],
          ...options
        });
        return true;
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
    }

    return false;
  }

  // Test notification
  async sendTestNotification() {
    return this.scheduleLocalNotification('Mediot Test', {
      body: 'Push notifications are working correctly!',
      tag: 'test-notification',
      requireInteraction: false,
      actions: [
        {
          action: 'close',
          title: 'Close'
        }
      ]
    });
  }

  // Utility function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Medicine reminder notifications
  async scheduleMedicineReminder(medicine, time, options = {}) {
    const title = `Time for ${medicine.name}`;
    const body = `Take ${medicine.dosage} as prescribed`;
    
    return this.scheduleLocalNotification(title, {
      body,
      tag: `medicine-${medicine.id}-${time}`,
      icon: '/icons/pill-icon.png',
      requireInteraction: true,
      actions: [
        {
          action: 'taken',
          title: 'Mark as Taken'
        },
        {
          action: 'snooze',
          title: 'Remind Later'
        },
        {
          action: 'skip',
          title: 'Skip'
        }
      ],
      data: {
        type: 'medicine-reminder',
        medicineId: medicine.id,
        scheduledTime: time,
        ...options
      },
      ...options
    });
  }

  // Health check reminders
  async scheduleHealthCheckReminder(checkType, message, options = {}) {
    const title = `Health Check Reminder`;
    
    return this.scheduleLocalNotification(title, {
      body: message,
      tag: `health-check-${checkType}`,
      icon: '/icons/health-icon.png',
      actions: [
        {
          action: 'open',
          title: 'Open Mediot'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      data: {
        type: 'health-check',
        checkType,
        ...options
      },
      ...options
    });
  }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;