// Offline Manager Service
// Handles offline functionality, sync, and data management

/**
 * Offline Manager Class
 * Manages offline state, data synchronization, and offline actions
 */
class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.offlineActions = [];
    this.syncInProgress = false;
    this.listeners = new Set();
    this.dbName = 'MedIoTOfflineDB';
    this.dbVersion = 1;
    this.db = null;
    
    this.init();
  }

  /**
   * Initialize offline manager
   */
  async init() {
    // Set up event listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Initialize IndexedDB
    await this.initDB();
    
    // Register service worker
    await this.registerServiceWorker();
    
    // Load offline actions from storage
    await this.loadOfflineActions();
    
    // Sync if online
    if (this.isOnline) {
      this.syncOfflineActions();
    }
  }

  /**
   * Initialize IndexedDB for offline storage
   */
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('offlineActions')) {
          const actionsStore = db.createObjectStore('offlineActions', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
          actionsStore.createIndex('type', 'type', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('offlineData')) {
          const dataStore = db.createObjectStore('offlineData', { 
            keyPath: 'key' 
          });
          dataStore.createIndex('timestamp', 'timestamp', { unique: false });
          dataStore.createIndex('type', 'type', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          syncStore.createIndex('priority', 'priority', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Register service worker
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              this.notifyListeners('sw-update-available', { registration });
            }
          });
        });
        
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Handle online event
   */
  handleOnline() {
    console.log('Connection restored');
    this.isOnline = true;
    this.notifyListeners('online');
    this.syncOfflineActions();
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    console.log('Connection lost');
    this.isOnline = false;
    this.notifyListeners('offline');
  }

  /**
   * Handle service worker messages
   */
  handleSWMessage(event) {
    const { data } = event;
    
    if (data.type === 'SYNC_SUCCESS') {
      this.notifyListeners('sync-success', data.action);
    } else if (data.type === 'SYNC_FAILED') {
      this.notifyListeners('sync-failed', data.action);
    }
  }

  /**
   * Add offline action to queue
   */
  async addOfflineAction(action) {
    const offlineAction = {
      ...action,
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3
    };

    try {
      // Store in IndexedDB
      const transaction = this.db.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      store.add(offlineAction);
      
      // Add to memory
      this.offlineActions.push(offlineAction);
      
      console.log('Offline action queued:', offlineAction);
      this.notifyListeners('action-queued', offlineAction);
      
      // Try to sync if online
      if (this.isOnline) {
        this.syncOfflineActions();
      }
      
      return offlineAction.id;
    } catch (error) {
      console.error('Failed to queue offline action:', error);
      throw error;
    }
  }

  /**
   * Load offline actions from IndexedDB
   */
  async loadOfflineActions() {
    try {
      const transaction = this.db.transaction(['offlineActions'], 'readonly');
      const store = transaction.objectStore('offlineActions');
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          this.offlineActions = request.result;
          console.log(`Loaded ${this.offlineActions.length} offline actions`);
          resolve(this.offlineActions);
        };
        
        request.onerror = () => {
          console.error('Failed to load offline actions:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Failed to load offline actions:', error);
      return [];
    }
  }

  /**
   * Sync offline actions with server
   */
  async syncOfflineActions() {
    if (this.syncInProgress || !this.isOnline || this.offlineActions.length === 0) {
      return;
    }

    this.syncInProgress = true;
    this.notifyListeners('sync-start');

    try {
      const actionsToSync = [...this.offlineActions];
      const syncResults = [];

      for (const action of actionsToSync) {
        try {
          const result = await this.executeOfflineAction(action);
          syncResults.push({ action, success: true, result });
          
          // Remove successful action
          await this.removeOfflineAction(action.id);
          
        } catch (error) {
          console.error('Failed to sync action:', error);
          
          // Increment retry count
          action.retryCount = (action.retryCount || 0) + 1;
          
          if (action.retryCount >= action.maxRetries) {
            // Remove failed action after max retries
            await this.removeOfflineAction(action.id);
            syncResults.push({ action, success: false, error: error.message, maxRetriesReached: true });
          } else {
            // Update action with new retry count
            await this.updateOfflineAction(action);
            syncResults.push({ action, success: false, error: error.message, willRetry: true });
          }
        }
      }

      this.notifyListeners('sync-complete', syncResults);
      
    } catch (error) {
      console.error('Sync process failed:', error);
      this.notifyListeners('sync-error', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Execute an offline action
   */
  async executeOfflineAction(action) {
    const { url, method, headers, body } = action;
    
    const response = await fetch(url, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Remove offline action from storage
   */
  async removeOfflineAction(actionId) {
    try {
      // Remove from IndexedDB
      const transaction = this.db.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      store.delete(actionId);
      
      // Remove from memory
      this.offlineActions = this.offlineActions.filter(action => action.id !== actionId);
      
      console.log('Offline action removed:', actionId);
    } catch (error) {
      console.error('Failed to remove offline action:', error);
    }
  }

  /**
   * Update offline action in storage
   */
  async updateOfflineAction(action) {
    try {
      const transaction = this.db.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      store.put(action);
      
      // Update in memory
      const index = this.offlineActions.findIndex(a => a.id === action.id);
      if (index !== -1) {
        this.offlineActions[index] = action;
      }
    } catch (error) {
      console.error('Failed to update offline action:', error);
    }
  }

  /**
   * Store data for offline access
   */
  async storeOfflineData(key, data, type = 'general') {
    try {
      const offlineData = {
        key,
        data,
        type,
        timestamp: Date.now()
      };

      const transaction = this.db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      store.put(offlineData);
      
      console.log('Data stored for offline access:', key);
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  }

  /**
   * Retrieve offline data
   */
  async getOfflineData(key) {
    try {
      const transaction = this.db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const request = store.get(key);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.data : null);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }

  /**
   * Get all offline data by type
   */
  async getOfflineDataByType(type) {
    try {
      const transaction = this.db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('type');
      const request = index.getAll(type);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result.map(item => item.data));
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Failed to get offline data by type:', error);
      return [];
    }
  }

  /**
   * Clear old offline data
   */
  async clearOldOfflineData(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
    try {
      const cutoffTime = Date.now() - maxAge;
      const transaction = this.db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoffTime);
      
      const request = index.openCursor(range);
      
      return new Promise((resolve, reject) => {
        let deletedCount = 0;
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          } else {
            console.log(`Cleared ${deletedCount} old offline data entries`);
            resolve(deletedCount);
          }
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Failed to clear old offline data:', error);
      return 0;
    }
  }

  /**
   * Add event listener
   */
  addEventListener(callback) {
    this.listeners.add(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(type, data = null) {
    this.listeners.forEach(callback => {
      try {
        callback({ type, data, isOnline: this.isOnline });
      } catch (error) {
        console.error('Listener callback error:', error);
      }
    });
  }

  /**
   * Get offline status
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      pendingActions: this.offlineActions.length,
      syncInProgress: this.syncInProgress,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasIndexedDB: 'indexedDB' in window
    };
  }

  /**
   * Force sync offline actions
   */
  async forcSync() {
    if (this.isOnline) {
      await this.syncOfflineActions();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  /**
   * Clear all offline data and actions
   */
  async clearAllOfflineData() {
    try {
      // Clear offline actions
      const actionsTransaction = this.db.transaction(['offlineActions'], 'readwrite');
      const actionsStore = actionsTransaction.objectStore('offlineActions');
      actionsStore.clear();
      
      // Clear offline data
      const dataTransaction = this.db.transaction(['offlineData'], 'readwrite');
      const dataStore = dataTransaction.objectStore('offlineData');
      dataStore.clear();
      
      // Clear memory
      this.offlineActions = [];
      
      console.log('All offline data cleared');
      this.notifyListeners('data-cleared');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      throw error;
    }
  }
}

/**
 * Offline-First API Client
 * API client that works offline-first with automatic sync
 */
export class OfflineAPIClient {
  constructor(baseURL, offlineManager) {
    this.baseURL = baseURL;
    this.offlineManager = offlineManager;
  }

  /**
   * Make API request with offline support
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const { method = 'GET', body, headers = {}, offline = true } = options;

    try {
      // Try network request first
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store successful GET responses for offline access
        if (method === 'GET' && offline) {
          await this.offlineManager.storeOfflineData(
            `api:${endpoint}`,
            data,
            'api-response'
          );
        }
        
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log('Network request failed:', error.message);
      
      // Handle offline scenarios
      if (method === 'GET') {
        // Try to get cached data for GET requests
        const cachedData = await this.offlineManager.getOfflineData(`api:${endpoint}`);
        if (cachedData) {
          console.log('Serving cached API response');
          return { ...cachedData, _offline: true };
        }
      } else {
        // Queue non-GET requests for later sync
        if (offline) {
          await this.offlineManager.addOfflineAction({
            url,
            method,
            headers,
            body,
            type: 'api-request'
          });
          
          return { 
            _queued: true, 
            message: 'Request queued for sync when online' 
          };
        }
      }
      
      throw error;
    }
  }

  /**
   * GET request with caching
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request with offline queueing
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      ...options, 
      method: 'POST', 
      body: data 
    });
  }

  /**
   * PUT request with offline queueing
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: data 
    });
  }

  /**
   * DELETE request with offline queueing
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { 
      ...options, 
      method: 'DELETE' 
    });
  }
}

// Create singleton instance
export const offlineManager = new OfflineManager();

// Create API client instance
export const offlineAPIClient = new OfflineAPIClient('/api', offlineManager);

export default offlineManager;