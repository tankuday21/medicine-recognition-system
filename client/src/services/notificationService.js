class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.soundEnabled = true;
    this.selectedSound = localStorage.getItem('notification_sound') || 'classic';
    this.loopSound = localStorage.getItem('notification_loop') === 'true';
    this.activeOscillators = [];
    this.activeAudioCtx = null;

    this.soundThemes = {
      classic: {
        name: 'Classic Mediot',
        play: (ctx, now) => {
          const playTone = (freq, start, dur) => this.createTone(ctx, freq, start, dur, 'sine');
          playTone(880, now, 0.15);
          playTone(1100, now + 0.18, 0.15);
          playTone(1320, now + 0.36, 0.2);
        }
      },
      medical: {
        name: 'Medical Pulse',
        play: (ctx, now) => {
          const playPulse = (start) => {
            this.createTone(ctx, 987.77, start, 0.1, 'sine'); // B5
            this.createTone(ctx, 987.77, start + 0.15, 0.1, 'sine');
          };
          playPulse(now);
          playPulse(now + 0.6);
        }
      },
      digital: {
        name: 'Digital Alert',
        play: (ctx, now) => {
          for (let i = 0; i < 4; i++) {
            this.createTone(ctx, 2000, now + (i * 0.1), 0.05, 'square', 0.1);
          }
        }
      },
      chime: {
        name: 'Harmony Chime',
        play: (ctx, now) => {
          this.createTone(ctx, 523.25, now, 0.5, 'sine', 0.3); // C5
          this.createTone(ctx, 659.25, now + 0.1, 0.5, 'sine', 0.2); // E5
          this.createTone(ctx, 783.99, now + 0.2, 0.5, 'sine', 0.2); // G5
          this.createTone(ctx, 1046.50, now + 0.3, 0.6, 'sine', 0.2); // C6
        }
      },
      zen: {
        name: 'Zen Bowl',
        play: (ctx, now) => {
          this.createTone(ctx, 440, now, 1.5, 'sine', 0.3); // A4
          this.createTone(ctx, 444, now, 1.5, 'sine', 0.1); // Slight detune for richness
        }
      },
      urgent: {
        name: 'Urgent Alert',
        play: (ctx, now) => {
          for (let i = 0; i < 6; i++) {
            this.createTone(ctx, i % 2 === 0 ? 1500 : 1200, now + (i * 0.1), 0.08, 'sawtooth', 0.1);
          }
        }
      }
    };

    console.log('[NotificationService] Initialized:', {
      supported: this.isSupported,
      permission: this.permission,
      selectedSound: this.selectedSound
    });

    // Start checking for due reminders every 30 seconds
    this.startReminderChecker();
  }

  // Helper to create a single tone
  createTone(ctx, frequency, startTime, duration, type = 'sine', volume = 0.4) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    
    // Track for stopping
    this.activeOscillators.push(oscillator);
    oscillator.onended = () => {
      this.activeOscillators = this.activeOscillators.filter(o => o !== oscillator);
    };
  }

  // Play notification sound using Web Audio API
  playNotificationSound() {
    if (!this.soundEnabled) return;
    
    // Stop any existing sound if we're starting a new one
    this.stopSound();

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      this.activeAudioCtx = ctx;
      const now = ctx.currentTime;
      const theme = this.soundThemes[this.selectedSound] || this.soundThemes.classic;

      // Repeat sequence for better visibility
      const loopCount = this.loopSound ? 100 : (this.selectedSound === 'zen' || this.selectedSound === 'chime' ? 1 : 3);
      const loopDelay = this.selectedSound === 'medical' ? 1.2 : 0.8;

      for (let i = 0; i < loopCount; i++) {
        theme.play(ctx, now + (i * loopDelay));
      }

      console.log(`[NotificationService] Sound played: ${theme.name} (Loop: ${this.loopSound})`);
    } catch (error) {
      console.error('[NotificationService] Error playing sound:', error);
    }
  }

  stopSound() {
    if (this.activeOscillators.length > 0) {
      this.activeOscillators.forEach(osc => {
        try { osc.stop(); } catch(e) {}
      });
      this.activeOscillators = [];
    }
    
    if (this.activeAudioCtx && this.activeAudioCtx.state !== 'closed') {
      this.activeAudioCtx.close();
      this.activeAudioCtx = null;
    }
    console.log('[NotificationService] All sounds stopped');
  }

  setLoop(enabled) {
    this.loopSound = enabled;
    localStorage.setItem('notification_loop', enabled);
    console.log(`[NotificationService] Loop ${enabled ? 'enabled' : 'disabled'}`);
  }

  setSoundTheme(themeId) {
    if (this.soundThemes[themeId]) {
      this.selectedSound = themeId;
      localStorage.setItem('notification_sound', themeId);
      console.log(`[NotificationService] Sound theme changed to: ${themeId}`);
      this.playNotificationSound(); // Play sample
      return true;
    }
    return false;
  }

  getAvailableSounds() {
    return Object.keys(this.soundThemes).map(id => ({
      id,
      name: this.soundThemes[id].name
    }));
  }

  // Start checking for due reminders
  startReminderChecker() {
    console.log('[NotificationService] Starting reminder checker');

    // Check every 20 seconds for due reminders
    this.reminderCheckInterval = setInterval(() => {
      this.checkDueReminders();
    }, 20000);

    // Also check after a short delay
    setTimeout(() => this.checkDueReminders(), 3000);
  }

  // Stop the reminder checker
  stopReminderChecker() {
    if (this.reminderCheckInterval) {
      clearInterval(this.reminderCheckInterval);
      this.reminderCheckInterval = null;
    }
  }

  // Check for reminders that are due now
  async checkDueReminders() {
    if (this.permission !== 'granted') {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/reminders/today', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.warn('[NotificationService] Failed to fetch reminders:', response.status);
        return;
      }

      const data = await response.json();
      if (!data.success || !data.data) return;

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      console.log(`[NotificationService] Checking ${data.data.length} reminders at ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);

      data.data.forEach(item => {
        if (item.status !== 'pending') return;

        const scheduledTime = new Date(item.scheduledTime);
        const scheduledHour = scheduledTime.getHours();
        const scheduledMinute = scheduledTime.getMinutes();

        // Check if this reminder is due (within 2 minute window)
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        const scheduledTotalMinutes = scheduledHour * 60 + scheduledMinute;
        const diff = currentTotalMinutes - scheduledTotalMinutes;

        if (diff >= 0 && diff <= 2) {
          const notificationKey = `reminder-shown-${item.reminderId}-${scheduledTime.toDateString()}-${scheduledHour}-${scheduledMinute}`;

          // Avoid duplicate notifications
          if (!sessionStorage.getItem(notificationKey)) {
            console.log(`[NotificationService] Triggering reminder for ${item.medicineName} at ${scheduledHour}:${scheduledMinute.toString().padStart(2, '0')}`);
            sessionStorage.setItem(notificationKey, 'true');

            this.showMedicationReminder(
              item.medicineName,
              item.dosage,
              scheduledTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              item
            );
          }
        }
      });
    } catch (error) {
      console.error('[NotificationService] Error checking due reminders:', error);
    }
  }

  // Manually trigger a reminder check (for testing)
  async triggerReminderCheck() {
    console.log('[NotificationService] Manual reminder check triggered');
    await this.checkDueReminders();
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
        // Test sound on permission grant (user interaction enables audio)
        this.playNotificationSound();
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
      console.error('[NotificationService] Error requesting permission:', error);
      return {
        success: false,
        message: 'Failed to request notification permission'
      };
    }
  }

  // Show a notification with sound
  showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('[NotificationService] Cannot show notification: not supported or permission denied');
      return null;
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'mediot-reminder',
      requireInteraction: true,
      silent: false,
      ...options
    };

    try {
      // Play sound alert
      this.playNotificationSound();

      const notification = new Notification(title, defaultOptions);

      notification.onclick = () => {
        window.focus();
        notification.close();
        this.stopSound();
      };

      // Auto-close after 60 seconds
      setTimeout(() => {
        notification.close();
      }, 60000);

      console.log('[NotificationService] Notification shown:', title);
      return notification;
    } catch (error) {
      console.error('[NotificationService] Error showing notification:', error);
      return null;
    }
  }

  // Show medication reminder notification
  showMedicationReminder(medicine, dosage, time, reminderItem = null) {
    const title = '💊 Medication Reminder';
    const body = `Time to take ${medicine}${dosage ? ` (${dosage})` : ''}\nScheduled: ${time}`;

    const options = {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `medication-${medicine}-${Date.now()}`,
      requireInteraction: true,
      data: {
        type: 'medication',
        medicine,
        dosage,
        time,
        reminderId: reminderItem?.reminderId,
        scheduledTime: reminderItem?.scheduledTime
      }
    };

    const notification = this.showNotification(title, options);

    if (notification) {
      notification.onclick = () => {
        window.focus();
        notification.close();
        this.navigateToReminders();
      };
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
      requireInteraction: false
    };

    return this.showNotification(title, options);
  }

  // Show test notification with sound
  showTestNotification() {
    console.log('[NotificationService] Showing test notification');

    const title = '🧪 Test Notification';
    const body = 'This is a test notification from Mediot. You should hear a sound!';

    const options = {
      body,
      icon: '/favicon.ico',
      tag: 'test-notification',
      requireInteraction: false
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
            scheduledTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            item
          );
        }, timeUntilNotification);

        this.scheduledTimeouts.push({
          id: timeoutId,
          reminderId: item.reminderId,
          scheduledTime: scheduledTime,
          type: 'main'
        });

        scheduledCount++;
        console.log(`[NotificationService] Scheduled notification for ${item.medicineName} in ${Math.round(timeUntilNotification / 60000)} minutes`);
      }
    });

    console.log(`[NotificationService] Scheduled ${scheduledCount} notifications`);

    return {
      success: true,
      message: `Scheduled ${scheduledCount} notifications for today`,
      count: scheduledCount
    };
  }

  // Clear all scheduled notifications
  clearScheduledNotifications() {
    if (this.scheduledTimeouts && this.scheduledTimeouts.length > 0) {
      this.scheduledTimeouts.forEach(timeout => {
        clearTimeout(timeout.id);
      });
      this.scheduledTimeouts = [];
      console.log('[NotificationService] Cleared scheduled notifications');
    }
  }

  // Show missed medication alert
  showMissedMedicationAlert(medicine, dosage, scheduledTime) {
    const title = '⚠️ Missed Medication';
    const body = `You missed ${medicine} (${dosage}) scheduled for ${scheduledTime}`;

    const options = {
      body,
      icon: '/favicon.ico',
      tag: `missed-${medicine}`,
      requireInteraction: true
    };

    return this.showNotification(title, options);
  }

  // Show adherence summary notification
  showAdherenceSummary(stats) {
    const title = '📊 Daily Adherence Summary';
    const body = `You took ${stats.taken} out of ${stats.scheduled} medications today (${stats.percentage}%)`;

    const options = {
      body,
      icon: '/favicon.ico',
      tag: 'adherence-summary'
    };

    return this.showNotification(title, options);
  }

  // Toggle sound on/off
  toggleSound(enabled) {
    this.soundEnabled = enabled;
    console.log(`[NotificationService] Sound ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Play sound only (for testing)
  testSound() {
    console.log('[NotificationService] Testing sound...');
    this.playNotificationSound();
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
