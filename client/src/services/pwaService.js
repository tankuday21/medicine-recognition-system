// PWA Service for managing offline functionality and app features

class PWAService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.installPrompt = null;
    this.registration = null;
    this.isInstalled = this.checkIfInstalled();
    this.offlineQueue = [];
    this.syncTags = {
      BACKGROUND_SYNC: 'background-sync',
      REMINDER_SYNC: 'reminder-sync',
      HEALTH_DATA_SYNC: 'health-data-sync'
    };
  }

  // Initialize PWA service
  async initialize() {
    console.log('[INFO] Initializing PWA Service...');
    
    // Register service worker
    await this.registerServiceWorker();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize offline storage
    await this.initializeOfflineStorage();
    
    // Check for updates
    this.checkForUpdates();
    
    console.log('[SUCCESS] PWA Service initialized');
  }

  // Register service worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', this.registration);
        
        // Listen for service worker updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.notifyUpdate();
            }
          });
        });
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });
        
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Set up event listeners
  setupEventListeners() {
    // Online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnline();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOffline();
    });
    
    // Install prompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      this.notifyInstallAvailable();
    });
    
    // App installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.installPrompt = null;
      this.notifyAppInstalled();
    });
    
    // Visibility change for background sync
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncOfflineData();
      }
    });
  }

  // Initialize offline storage
  async initializeOfflineStorage() {
    try {
      // Initialize IndexedDB for offline data
      await this.openOfflineDB();
      console.log('Offline storage initialized');
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
    }
  }

  // Open IndexedDB for offline storage
  async openOfflineDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MediotOfflineDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('offlineActions')) {
          const store = db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('type', 'type');
        }
        
        if (!db.objectStoreNames.contains('cachedData')) {
          const store = db.createObjectStore('cachedData', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
        }
        
        if (!db.objectStoreNames.contains('reminders')) {
          const store = db.createObjectStore('reminders', { keyPath: 'id' });
          store.createIndex('nextDue', 'nextDue');
        }
      };
    });
  }

  // Handle online event
  handleOnline() {
    console.log('[INFO] Connection restored');
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa:online'));
    
    // Sync offline data
    this.syncOfflineData();
    
    // Show notification
    this.showNotification('Connection restored', {
      body: 'You\'re back online. Syncing data...',
      icon: '/icons/icon-192x192.png',
      tag: 'connection-restored'
    });
  }

  // Handle offline event
  handleOffline() {
    console.log('[INFO] Connection lost');
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa:offline'));
    
    // Show notification
    this.showNotification('You\'re offline', {
      body: 'Some features may be limited. Data will sync when connection is restored.',
      icon: '/icons/icon-192x192.png',
      tag: 'connection-lost'
    });
  }

  // Handle service worker messages
  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case 'SW_ACTIVATED':
        console.log('Service Worker activated, version:', data.version);
        break;
      case 'CACHE_UPDATED':
        console.log('Cache updated:', data.cacheName);
        break;
      case 'SYNC_COMPLETE':
        console.log('Background sync complete:', data.tag);
        break;
    }
  }

  // Check if app is installed
  checkIfInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  }

  // Show install prompt
  async showInstallPrompt() {
    if (this.installPrompt) {
      this.installPrompt.prompt();
      const { outcome } = await this.installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted install prompt');
      } else {
        console.log('User dismissed install prompt');
      }
      
      this.installPrompt = null;
      return outcome === 'accepted';
    }
    return false;
  }

  // Add action to offline queue
  async addToOfflineQueue(action) {
    try {
      const db = await this.openOfflineDB();
      const transaction = db.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      
      const offlineAction = {
        ...action,
        timestamp: Date.now(),
        retryCount: 0
      };
      
      await store.add(offlineAction);
      console.log('Added action to offline queue:', action.type);
      
      // Try to sync if online
      if (this.isOnline) {
        this.syncOfflineData();
      }
    } catch (error) {
      console.error('Failed to add action to offline queue:', error);
    }
  }

  // Sync offline data
  async syncOfflineData() {
    if (!this.isOnline || !this.registration) return;
    
    try {
      // Trigger background sync
      await this.registration.sync.register(this.syncTags.BACKGROUND_SYNC);
      console.log('Background sync registered');
    } catch (error) {
      console.error('Background sync registration failed:', error);
      // Fallback to immediate sync
      this.syncOfflineDataImmediate();
    }
  }

  // Immediate sync fallback
  async syncOfflineDataImmediate() {
    try {
      const db = await this.openOfflineDB();
      const transaction = db.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const actions = await store.getAll();
      
      for (const action of actions) {
        try {
          const response = await fetch(action.url, {
            method: action.method,
            headers: action.headers,
            body: action.body
          });
          
          if (response.ok) {
            await store.delete(action.id);
            console.log('Synced offline action:', action.id);
          } else {
            // Increment retry count
            action.retryCount = (action.retryCount || 0) + 1;
            if (action.retryCount < 3) {
              await store.put(action);
            } else {
              await store.delete(action.id);
              console.log('Max retries reached, removing action:', action.id);
            }
          }
        } catch (error) {
          console.error('Failed to sync action:', action.id, error);
        }
      }
    } catch (error) {
      console.error('Immediate sync failed:', error);
    }
  }

  // Cache data for offline use
  async cacheData(key, data, ttl = 24 * 60 * 60 * 1000) { // 24 hours default
    try {
      const db = await this.openOfflineDB();
      const transaction = db.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      
      const cachedItem = {
        key,
        data,
        timestamp: Date.now(),
        ttl
      };
      
      await store.put(cachedItem);
      console.log('Data cached:', key);
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  // Get cached data
  async getCachedData(key) {
    try {
      const db = await this.openOfflineDB();
      const transaction = db.transaction(['cachedData'], 'readonly');
      const store = transaction.objectStore('cachedData');
      const item = await store.get(key);
      
      if (item) {
        // Check if data is still valid
        if (Date.now() - item.timestamp < item.ttl) {
          return item.data;
        } else {
          // Data expired, remove it
          const deleteTransaction = db.transaction(['cachedData'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('cachedData');
          await deleteStore.delete(key);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  // Show notification
  async showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      if (this.registration && this.registration.showNotification) {
        // Use service worker notification
        await this.registration.showNotification(title, {
          badge: '/icons/icon-192x192.png',
          ...options
        });
      } else {
        // Fallback to regular notification
        new Notification(title, options);
      }
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Check for app updates
  async checkForUpdates() {
    if (this.registration) {
      try {
        await this.registration.update();
        console.log('Checked for updates');
      } catch (error) {
        console.error('Update check failed:', error);
      }
    }
  }

  // Notify about available update
  notifyUpdate() {
    window.dispatchEvent(new CustomEvent('pwa:updateAvailable'));
  }

  // Notify about install availability
  notifyInstallAvailable() {
    window.dispatchEvent(new CustomEvent('pwa:installAvailable'));
  }

  // Notify about app installation
  notifyAppInstalled() {
    window.dispatchEvent(new CustomEvent('pwa:appInstalled'));
    this.showNotification('App Installed', {
      body: 'Mediot has been installed successfully!',
      icon: '/icons/icon-192x192.png'
    });
  }

  // Get app info
  getAppInfo() {
    return {
      isOnline: this.isOnline,
      isInstalled: this.isInstalled,
      canInstall: !!this.installPrompt,
      hasServiceWorker: !!this.registration,
      hasNotificationPermission: Notification.permission === 'granted'
    };
  }

  // Schedule reminder notification
  async scheduleReminderNotification(reminder) {
    if (!this.registration) return;
    
    try {
      // Store reminder in IndexedDB
      const db = await this.openOfflineDB();
      const transaction = db.transaction(['reminders'], 'readwrite');
      const store = transaction.objectStore('reminders');
      await store.put(reminder);
      
      // Register background sync for reminders
      await this.registration.sync.register(this.syncTags.REMINDER_SYNC);
      
      console.log('Reminder scheduled:', reminder.id);
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
    }
  }

  // Get storage usage
  async getStorageUsage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage,
          available: estimate.quota,
          percentage: Math.round((estimate.usage / estimate.quota) * 100)
        };
      } catch (error) {
        console.error('Failed to get storage usage:', error);
      }
    }
    return null;
  }

  // Clear cache
  async clearCache() {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Cache cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }
}

// Create singleton instance
const pwaService = new PWAService();

// Auto-initialize
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    pwaService.initialize();
  });
  
  // Make available globally for debugging
  window.pwaService = pwaService;
}

export default pwaService;