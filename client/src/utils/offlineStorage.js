/**
 * Offline Storage Utility using IndexedDB
 * Provides offline data persistence for PWA
 */

const DB_NAME = 'MediotOfflineDB';
const DB_VERSION = 1;

const STORES = {
  MEDICINES: 'medicines',
  REMINDERS: 'reminders',
  HEALTH_METRICS: 'healthMetrics',
  CHAT_HISTORY: 'chatHistory',
  SCAN_HISTORY: 'scanHistory',
  OFFLINE_QUEUE: 'offlineQueue'
};

class OfflineStorage {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains(STORES.MEDICINES)) {
          const medicineStore = db.createObjectStore(STORES.MEDICINES, { keyPath: 'id', autoIncrement: true });
          medicineStore.createIndex('barcode', 'barcode', { unique: false });
          medicineStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.REMINDERS)) {
          const reminderStore = db.createObjectStore(STORES.REMINDERS, { keyPath: 'id', autoIncrement: true });
          reminderStore.createIndex('date', 'date', { unique: false });
          reminderStore.createIndex('userId', 'userId', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.HEALTH_METRICS)) {
          const metricsStore = db.createObjectStore(STORES.HEALTH_METRICS, { keyPath: 'id', autoIncrement: true });
          metricsStore.createIndex('timestamp', 'timestamp', { unique: false });
          metricsStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.CHAT_HISTORY)) {
          const chatStore = db.createObjectStore(STORES.CHAT_HISTORY, { keyPath: 'id', autoIncrement: true });
          chatStore.createIndex('timestamp', 'timestamp', { unique: false });
          chatStore.createIndex('userId', 'userId', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.SCAN_HISTORY)) {
          const scanStore = db.createObjectStore(STORES.SCAN_HISTORY, { keyPath: 'id', autoIncrement: true });
          scanStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.OFFLINE_QUEUE)) {
          const queueStore = db.createObjectStore(STORES.OFFLINE_QUEUE, { keyPath: 'id', autoIncrement: true });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          queueStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  async add(storeName, data) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add({ ...data, timestamp: Date.now() });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update(storeName, data) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ ...data, updatedAt: Date.now() });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addToOfflineQueue(action) {
    return this.add(STORES.OFFLINE_QUEUE, {
      ...action,
      status: 'pending',
      retries: 0
    });
  }

  async getOfflineQueue() {
    return this.getAll(STORES.OFFLINE_QUEUE);
  }

  async removeFromOfflineQueue(id) {
    return this.delete(STORES.OFFLINE_QUEUE, id);
  }

  async syncOfflineQueue() {
    const queue = await this.getOfflineQueue();
    const results = [];

    for (const item of queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body
        });

        if (response.ok) {
          await this.removeFromOfflineQueue(item.id);
          results.push({ success: true, item });
        } else {
          results.push({ success: false, item, error: 'Request failed' });
        }
      } catch (error) {
        results.push({ success: false, item, error: error.message });
      }
    }

    return results;
  }
}

export const offlineStorage = new OfflineStorage();
export { STORES };
