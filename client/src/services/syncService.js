import offlineStorageService from './offlineStorageService';

class SyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.syncQueue = [];
    this.lastSyncTime = null;
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Initialize last sync time from localStorage
    this.lastSyncTime = localStorage.getItem('lastSyncTime');
  }

  async initialize() {
    await offlineStorageService.initialize();
    
    // Sync immediately if online
    if (this.isOnline) {
      this.syncWithServer();
    }
  }

  handleOnline() {
    console.log('Device came online');
    this.isOnline = true;
    
    // Trigger sync after a short delay to ensure connection is stable
    setTimeout(() => {
      this.syncWithServer();
    }, 1000);
  }

  handleOffline() {
    console.log('Device went offline');
    this.isOnline = false;
  }

  async syncWithServer() {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    console.log('Starting sync with server...');

    try {
      // Sync offline actions first
      await this.syncOfflineActions();
      
      // Sync reminders
      await this.syncReminders();
      
      // Sync scan history
      await this.syncScanHistory();
      
      // Download fresh data
      await this.downloadFreshData();
      
      // Update last sync time
      this.lastSyncTime = new Date().toISOString();
      localStorage.setItem('lastSyncTime', this.lastSyncTime);
      
      console.log('Sync completed successfully');
      
      // Dispatch sync complete event
      window.dispatchEvent(new CustomEvent('syncComplete', {
        detail: { success: true, timestamp: this.lastSyncTime }
      }));
      
    } catch (error) {
      console.error('Sync failed:', error);
      
      // Dispatch sync error event
      window.dispatchEvent(new CustomEvent('syncError', {
        detail: { error: error.message }
      }));
    } finally {
      this.syncInProgress = false;
    }
  }

  async syncOfflineActions() {
    const actions = await offlineStorageService.getOfflineActions();
    
    for (const action of actions) {
      try {
        await this.processOfflineAction(action);
        await offlineStorageService.removeOfflineAction(action.id);
        console.log('Synced offline action:', action.type);
      } catch (error) {
        console.error('Failed to sync offline action:', action.type, error);
        
        // Increment retry count
        action.retryCount = (action.retryCount || 0) + 1;
        
        // Remove action if too many retries
        if (action.retryCount > 3) {
          await offlineStorageService.removeOfflineAction(action.id);
          console.log('Removed failed action after max retries:', action.type);
        } else {
          await offlineStorageService.put('offlineActions', action);
        }
      }
    }
  }

  async processOfflineAction(action) {
    const { type, data } = action;
    
    switch (type) {
      case 'CREATE_REMINDER':
        return this.syncCreateReminder(data);
      
      case 'UPDATE_REMINDER':
        return this.syncUpdateReminder(data);
      
      case 'DELETE_REMINDER':
        return this.syncDeleteReminder(data);
      
      case 'MARK_MEDICINE_TAKEN':
        return this.syncMarkMedicineTaken(data);
      
      case 'SAVE_SCAN_RESULT':
        return this.syncScanResult(data);
      
      case 'UPDATE_PROFILE':
        return this.syncProfileUpdate(data);
      
      default:
        console.warn('Unknown offline action type:', type);
    }
  }

  async syncCreateReminder(data) {
    const response = await fetch('/api/reminders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create reminder on server');
    }

    const result = await response.json();
    
    // Update local reminder with server ID
    if (data.localId) {
      await offlineStorageService.updateReminder(data.localId, {
        id: result.data.id,
        synced: true
      });
    }
    
    return result;
  }

  async syncUpdateReminder(data) {
    const response = await fetch(`/api/reminders/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update reminder on server');
    }

    // Mark as synced locally
    await offlineStorageService.updateReminder(data.id, { synced: true });
    
    return response.json();
  }

  async syncDeleteReminder(data) {
    const response = await fetch(`/api/reminders/${data.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete reminder on server');
    }

    // Remove from local storage
    await offlineStorageService.delete('reminders', data.id);
    
    return response.json();
  }

  async syncMarkMedicineTaken(data) {
    const response = await fetch('/api/reminders/mark-taken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to mark medicine as taken on server');
    }

    return response.json();
  }

  async syncScanResult(data) {
    const response = await fetch('/api/scanner/save-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to save scan result on server');
    }

    return response.json();
  }

  async syncProfileUpdate(data) {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update profile on server');
    }

    return response.json();
  }

  async syncReminders() {
    try {
      // Get server reminders
      const response = await fetch('/api/reminders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const serverReminders = await response.json();
        
        // Update local reminders with server data
        for (const reminder of serverReminders.data || []) {
          await offlineStorageService.put('reminders', {
            ...reminder,
            synced: true
          });
        }
        
        console.log('Reminders synced from server');
      }
    } catch (error) {
      console.error('Failed to sync reminders from server:', error);
    }
  }

  async syncScanHistory() {
    try {
      // Get unsynced scan history
      const localScans = await offlineStorageService.getScanHistory();
      const unsyncedScans = localScans.filter(scan => !scan.synced);
      
      for (const scan of unsyncedScans) {
        try {
          await this.syncScanResult(scan);
          
          // Mark as synced
          scan.synced = true;
          await offlineStorageService.put('scanHistory', scan);
        } catch (error) {
          console.error('Failed to sync scan result:', scan.id, error);
        }
      }
      
      console.log('Scan history synced');
    } catch (error) {
      console.error('Failed to sync scan history:', error);
    }
  }

  async downloadFreshData() {
    try {
      // Download fresh medicine data
      await this.downloadMedicines();
      
      // Download fresh news
      await this.downloadNews();
      
      console.log('Fresh data downloaded');
    } catch (error) {
      console.error('Failed to download fresh data:', error);
    }
  }

  async downloadMedicines() {
    try {
      const response = await fetch('/api/medicines/popular', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const medicines = await response.json();
        
        // Cache popular medicines for offline use
        for (const medicine of medicines.data || []) {
          await offlineStorageService.cacheMedicine(medicine);
        }
        
        console.log('Popular medicines cached');
      }
    } catch (error) {
      console.error('Failed to download medicines:', error);
    }
  }

  async downloadNews() {
    try {
      const response = await fetch('/api/news?limit=50');

      if (response.ok) {
        const news = await response.json();
        
        // Cache news articles
        if (news.data && news.data.articles) {
          await offlineStorageService.cacheNews(news.data.articles);
        }
        
        console.log('News articles cached');
      }
    } catch (error) {
      console.error('Failed to download news:', error);
    }
  }

  // Queue offline action
  async queueAction(type, data) {
    const action = {
      type,
      data,
      timestamp: new Date().toISOString()
    };
    
    await offlineStorageService.queueOfflineAction(action);
    console.log('Action queued for sync:', type);
    
    // Try to sync immediately if online
    if (this.isOnline && !this.syncInProgress) {
      setTimeout(() => this.syncWithServer(), 100);
    }
  }

  // Manual sync trigger
  async forcSync() {
    if (this.isOnline) {
      await this.syncWithServer();
      return true;
    }
    return false;
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      lastSyncTime: this.lastSyncTime
    };
  }

  // Background sync (called by service worker)
  async backgroundSync() {
    console.log('Background sync triggered');
    
    if (this.isOnline) {
      await this.syncWithServer();
    }
  }
}

// Create singleton instance
const syncService = new SyncService();

export default syncService;