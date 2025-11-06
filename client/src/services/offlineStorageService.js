class OfflineStorageService {
  constructor() {
    this.dbName = 'MediotDB';
    this.dbVersion = 1;
    this.db = null;
    this.isSupported = 'indexedDB' in window;
  }

  async initialize() {
    if (!this.isSupported) {
      console.warn('IndexedDB is not supported');
      return false;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        this.createObjectStores(db);
      };
    });
  }

  createObjectStores(db) {
    // Medicines store
    if (!db.objectStoreNames.contains('medicines')) {
      const medicinesStore = db.createObjectStore('medicines', { keyPath: 'id' });
      medicinesStore.createIndex('name', 'name', { unique: false });
      medicinesStore.createIndex('barcode', 'barcode', { unique: false });
    }

    // Scan history store
    if (!db.objectStoreNames.contains('scanHistory')) {
      const scanHistoryStore = db.createObjectStore('scanHistory', { keyPath: 'id', autoIncrement: true });
      scanHistoryStore.createIndex('timestamp', 'timestamp', { unique: false });
      scanHistoryStore.createIndex('type', 'type', { unique: false });
    }

    // Reminders store
    if (!db.objectStoreNames.contains('reminders')) {
      const remindersStore = db.createObjectStore('reminders', { keyPath: 'id', autoIncrement: true });
      remindersStore.createIndex('medicineId', 'medicineId', { unique: false });
      remindersStore.createIndex('nextDue', 'nextDue', { unique: false });
    }

    // User data store
    if (!db.objectStoreNames.contains('userData')) {
      const userDataStore = db.createObjectStore('userData', { keyPath: 'key' });
    }

    // Offline actions store (for sync when back online)
    if (!db.objectStoreNames.contains('offlineActions')) {
      const offlineActionsStore = db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
      offlineActionsStore.createIndex('timestamp', 'timestamp', { unique: false });
      offlineActionsStore.createIndex('type', 'type', { unique: false });
    }

    // News cache store
    if (!db.objectStoreNames.contains('newsCache')) {
      const newsCacheStore = db.createObjectStore('newsCache', { keyPath: 'id' });
      newsCacheStore.createIndex('timestamp', 'timestamp', { unique: false });
      newsCacheStore.createIndex('category', 'category', { unique: false });
    }
  }

  async ensureInitialized() {
    if (!this.db) {
      await this.initialize();
    }
  }

  // Generic CRUD operations
  async add(storeName, data) {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data) {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, key) {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName, limit = null) {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = limit ? store.getAll(null, limit) : store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Medicine-specific operations
  async cacheMedicine(medicine) {
    try {
      await this.put('medicines', {
        ...medicine,
        cachedAt: new Date().toISOString()
      });
      console.log('Medicine cached:', medicine.name);
    } catch (error) {
      console.error('Failed to cache medicine:', error);
    }
  }

  async getCachedMedicine(id) {
    try {
      return await this.get('medicines', id);
    } catch (error) {
      console.error('Failed to get cached medicine:', error);
      return null;
    }
  }

  async searchCachedMedicines(query) {
    try {
      const medicines = await this.getAll('medicines');
      return medicines.filter(medicine => 
        medicine.name.toLowerCase().includes(query.toLowerCase()) ||
        (medicine.genericName && medicine.genericName.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (error) {
      console.error('Failed to search cached medicines:', error);
      return [];
    }
  }

  // Scan history operations
  async saveScanResult(scanResult) {
    try {
      const scanRecord = {
        ...scanResult,
        timestamp: new Date().toISOString(),
        synced: false
      };
      
      const id = await this.add('scanHistory', scanRecord);
      console.log('Scan result saved:', id);
      return id;
    } catch (error) {
      console.error('Failed to save scan result:', error);
      return null;
    }
  }

  async getScanHistory(limit = 50) {
    try {
      const history = await this.getAll('scanHistory', limit);
      return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Failed to get scan history:', error);
      return [];
    }
  }

  // Reminder operations
  async saveReminder(reminder) {
    try {
      const reminderRecord = {
        ...reminder,
        createdAt: new Date().toISOString(),
        synced: false
      };
      
      const id = await this.add('reminders', reminderRecord);
      console.log('Reminder saved:', id);
      return id;
    } catch (error) {
      console.error('Failed to save reminder:', error);
      return null;
    }
  }

  async getReminders() {
    try {
      return await this.getAll('reminders');
    } catch (error) {
      console.error('Failed to get reminders:', error);
      return [];
    }
  }

  async updateReminder(id, updates) {
    try {
      const reminder = await this.get('reminders', id);
      if (reminder) {
        const updatedReminder = {
          ...reminder,
          ...updates,
          updatedAt: new Date().toISOString(),
          synced: false
        };
        await this.put('reminders', updatedReminder);
        console.log('Reminder updated:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update reminder:', error);
      return false;
    }
  }

  // Offline actions for sync
  async queueOfflineAction(action) {
    try {
      const actionRecord = {
        ...action,
        timestamp: new Date().toISOString(),
        retryCount: 0
      };
      
      const id = await this.add('offlineActions', actionRecord);
      console.log('Offline action queued:', id);
      return id;
    } catch (error) {
      console.error('Failed to queue offline action:', error);
      return null;
    }
  }

  async getOfflineActions() {
    try {
      return await this.getAll('offlineActions');
    } catch (error) {
      console.error('Failed to get offline actions:', error);
      return [];
    }
  }

  async removeOfflineAction(id) {
    try {
      await this.delete('offlineActions', id);
      console.log('Offline action removed:', id);
      return true;
    } catch (error) {
      console.error('Failed to remove offline action:', error);
      return false;
    }
  }

  // News caching
  async cacheNews(articles) {
    try {
      const promises = articles.map(article => 
        this.put('newsCache', {
          ...article,
          cachedAt: new Date().toISOString()
        })
      );
      
      await Promise.all(promises);
      console.log('News articles cached:', articles.length);
    } catch (error) {
      console.error('Failed to cache news:', error);
    }
  }

  async getCachedNews(limit = 20) {
    try {
      const news = await this.getAll('newsCache', limit);
      return news.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } catch (error) {
      console.error('Failed to get cached news:', error);
      return [];
    }
  }

  // User data operations
  async saveUserData(key, data) {
    try {
      await this.put('userData', { key, data, updatedAt: new Date().toISOString() });
      console.log('User data saved:', key);
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }

  async getUserData(key) {
    try {
      const result = await this.get('userData', key);
      return result ? result.data : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  // Cleanup old data
  async cleanup() {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Clean old scan history
      const scanHistory = await this.getAll('scanHistory');
      const oldScans = scanHistory.filter(scan => 
        new Date(scan.timestamp) < oneWeekAgo
      );
      
      for (const scan of oldScans) {
        await this.delete('scanHistory', scan.id);
      }

      // Clean old news cache
      const newsCache = await this.getAll('newsCache');
      const oldNews = newsCache.filter(article => 
        new Date(article.cachedAt) < oneWeekAgo
      );
      
      for (const article of oldNews) {
        await this.delete('newsCache', article.id);
      }

      console.log('Cleanup completed:', { 
        scansRemoved: oldScans.length, 
        newsRemoved: oldNews.length 
      });
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }

  // Export data for backup
  async exportData() {
    try {
      const data = {
        medicines: await this.getAll('medicines'),
        scanHistory: await this.getAll('scanHistory'),
        reminders: await this.getAll('reminders'),
        userData: await this.getAll('userData'),
        exportedAt: new Date().toISOString()
      };
      
      return data;
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }

  // Import data from backup
  async importData(data) {
    try {
      if (data.medicines) {
        for (const medicine of data.medicines) {
          await this.put('medicines', medicine);
        }
      }
      
      if (data.scanHistory) {
        for (const scan of data.scanHistory) {
          await this.put('scanHistory', scan);
        }
      }
      
      if (data.reminders) {
        for (const reminder of data.reminders) {
          await this.put('reminders', reminder);
        }
      }
      
      if (data.userData) {
        for (const userData of data.userData) {
          await this.put('userData', userData);
        }
      }
      
      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

// Create singleton instance
const offlineStorageService = new OfflineStorageService();

export default offlineStorageService;