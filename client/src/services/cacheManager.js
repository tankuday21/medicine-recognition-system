// Cache Management Service
// Comprehensive caching system for performance optimization

/**
 * Memory Cache Manager
 * In-memory caching with LRU eviction policy
 */
class MemoryCacheManager {
  constructor(maxSize = 100, ttl = 300000) { // 5 minutes default TTL
    this.cache = new Map();
    this.accessOrder = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.accessCount = 0;
  }

  /**
   * Get item from cache
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() > item.expiry) {
      this.delete(key);
      return null;
    }

    // Update access order for LRU
    this.accessOrder.set(key, ++this.accessCount);
    
    return item.value;
  }

  /**
   * Set item in cache
   */
  set(key, value, customTtl = null) {
    const expiry = Date.now() + (customTtl || this.ttl);
    
    // If cache is full, remove least recently used item
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, { value, expiry });
    this.accessOrder.set(key, ++this.accessCount);
    
    return true;
  }

  /**
   * Delete item from cache
   */
  delete(key) {
    this.cache.delete(key);
    this.accessOrder.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.accessOrder.clear();
    this.accessCount = 0;
  }

  /**
   * Evict least recently used item
   */
  evictLRU() {
    let lruKey = null;
    let lruAccess = Infinity;

    for (const [key, access] of this.accessOrder) {
      if (access < lruAccess) {
        lruAccess = access;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, item] of this.cache) {
      if (now > item.expiry) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expiredItems: expiredCount,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
    };
  }

  /**
   * Clean up expired items
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, item] of this.cache) {
      if (now > item.expiry) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));
    return expiredKeys.length;
  }
}

/**
 * Local Storage Cache Manager
 * Persistent caching using localStorage
 */
class LocalStorageCacheManager {
  constructor(prefix = 'cache_', maxSize = 50) {
    this.prefix = prefix;
    this.maxSize = maxSize;
    this.indexKey = `${prefix}index`;
  }

  /**
   * Get item from localStorage cache
   */
  get(key) {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      
      if (!item) {
        return null;
      }

      const parsed = JSON.parse(item);
      
      // Check if item has expired
      if (Date.now() > parsed.expiry) {
        this.delete(key);
        return null;
      }

      // Update access time
      parsed.lastAccess = Date.now();
      localStorage.setItem(fullKey, JSON.stringify(parsed));
      
      return parsed.value;
    } catch (error) {
      console.error('LocalStorage cache get error:', error);
      return null;
    }
  }

  /**
   * Set item in localStorage cache
   */
  set(key, value, ttl = 3600000) { // 1 hour default
    try {
      const fullKey = this.prefix + key;
      const item = {
        value,
        expiry: Date.now() + ttl,
        lastAccess: Date.now(),
        size: JSON.stringify(value).length
      };

      // Check storage quota
      if (!this.hasStorageSpace(JSON.stringify(item))) {
        this.evictOldest();
      }

      localStorage.setItem(fullKey, JSON.stringify(item));
      this.updateIndex(key);
      
      return true;
    } catch (error) {
      console.error('LocalStorage cache set error:', error);
      
      // Try to free up space and retry
      this.evictOldest();
      try {
        localStorage.setItem(this.prefix + key, JSON.stringify({
          value,
          expiry: Date.now() + ttl,
          lastAccess: Date.now()
        }));
        this.updateIndex(key);
        return true;
      } catch (retryError) {
        console.error('LocalStorage cache retry failed:', retryError);
        return false;
      }
    }
  }

  /**
   * Delete item from localStorage cache
   */
  delete(key) {
    try {
      const fullKey = this.prefix + key;
      localStorage.removeItem(fullKey);
      this.removeFromIndex(key);
      return true;
    } catch (error) {
      console.error('LocalStorage cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear all cache items
   */
  clear() {
    try {
      const index = this.getIndex();
      index.forEach(key => {
        localStorage.removeItem(this.prefix + key);
      });
      localStorage.removeItem(this.indexKey);
      return true;
    } catch (error) {
      console.error('LocalStorage cache clear error:', error);
      return false;
    }
  }

  /**
   * Check if there's enough storage space
   */
  hasStorageSpace(data) {
    try {
      const testKey = 'test_storage_space';
      localStorage.setItem(testKey, data);
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Evict oldest items to free up space
   */
  evictOldest() {
    const index = this.getIndex();
    const items = [];

    // Get all items with their access times
    index.forEach(key => {
      try {
        const item = localStorage.getItem(this.prefix + key);
        if (item) {
          const parsed = JSON.parse(item);
          items.push({ key, lastAccess: parsed.lastAccess });
        }
      } catch (error) {
        // Remove corrupted items
        this.delete(key);
      }
    });

    // Sort by last access time and remove oldest
    items.sort((a, b) => a.lastAccess - b.lastAccess);
    const toRemove = Math.ceil(items.length * 0.2); // Remove 20% of items
    
    for (let i = 0; i < toRemove && i < items.length; i++) {
      this.delete(items[i].key);
    }
  }

  /**
   * Update cache index
   */
  updateIndex(key) {
    try {
      const index = this.getIndex();
      if (!index.includes(key)) {
        index.push(key);
        
        // Limit index size
        if (index.length > this.maxSize) {
          const toRemove = index.shift();
          this.delete(toRemove);
        }
        
        localStorage.setItem(this.indexKey, JSON.stringify(index));
      }
    } catch (error) {
      console.error('Index update error:', error);
    }
  }

  /**
   * Remove key from index
   */
  removeFromIndex(key) {
    try {
      const index = this.getIndex();
      const newIndex = index.filter(k => k !== key);
      localStorage.setItem(this.indexKey, JSON.stringify(newIndex));
    } catch (error) {
      console.error('Index removal error:', error);
    }
  }

  /**
   * Get cache index
   */
  getIndex() {
    try {
      const index = localStorage.getItem(this.indexKey);
      return index ? JSON.parse(index) : [];
    } catch (error) {
      console.error('Index retrieval error:', error);
      return [];
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const index = this.getIndex();
    let totalSize = 0;
    let expiredCount = 0;
    const now = Date.now();

    index.forEach(key => {
      try {
        const item = localStorage.getItem(this.prefix + key);
        if (item) {
          const parsed = JSON.parse(item);
          totalSize += item.length;
          if (now > parsed.expiry) {
            expiredCount++;
          }
        }
      } catch (error) {
        // Count corrupted items as expired
        expiredCount++;
      }
    });

    return {
      itemCount: index.length,
      totalSize,
      expiredCount,
      storageUsage: this.getStorageUsage()
    };
  }

  /**
   * Get localStorage usage
   */
  getStorageUsage() {
    let total = 0;
    for (const storageKey in localStorage) {
      if (localStorage.hasOwnProperty(storageKey)) {
        total += localStorage[storageKey].length + storageKey.length;
      }
    }
    return total;
  }

  /**
   * Cleanup expired items
   */
  cleanup() {
    const index = this.getIndex();
    const now = Date.now();
    let cleanedCount = 0;

    index.forEach(key => {
      try {
        const item = localStorage.getItem(this.prefix + key);
        if (item) {
          const parsed = JSON.parse(item);
          if (now > parsed.expiry) {
            this.delete(key);
            cleanedCount++;
          }
        }
      } catch (error) {
        // Remove corrupted items
        this.delete(key);
        cleanedCount++;
      }
    });

    return cleanedCount;
  }
}

/**
 * API Response Cache Manager
 * Specialized caching for API responses
 */
class APIResponseCacheManager {
  constructor() {
    this.memoryCache = new MemoryCacheManager(200, 300000); // 5 minutes
    this.persistentCache = new LocalStorageCacheManager('api_', 100);
    this.pendingRequests = new Map();
  }

  /**
   * Get cached API response
   */
  async get(url, options = {}) {
    const cacheKey = this.generateCacheKey(url, options);
    
    // Check memory cache first
    let cached = this.memoryCache.get(cacheKey);
    if (cached) {
      return { data: cached, source: 'memory' };
    }

    // Check persistent cache
    cached = this.persistentCache.get(cacheKey);
    if (cached) {
      // Promote to memory cache
      this.memoryCache.set(cacheKey, cached);
      return { data: cached, source: 'storage' };
    }

    return null;
  }

  /**
   * Set API response in cache
   */
  set(url, options = {}, data, ttl = {}) {
    const cacheKey = this.generateCacheKey(url, options);
    const { memory = 300000, storage = 3600000 } = ttl;

    // Store in memory cache
    this.memoryCache.set(cacheKey, data, memory);
    
    // Store in persistent cache for longer TTL
    if (storage > memory) {
      this.persistentCache.set(cacheKey, data, storage);
    }
  }

  /**
   * Cached fetch with deduplication
   */
  async cachedFetch(url, options = {}) {
    const cacheKey = this.generateCacheKey(url, options);
    
    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Check cache first
    const cached = await this.get(url, options);
    if (cached) {
      return cached.data;
    }

    // Make request and cache response
    const requestPromise = this.makeRequest(url, options)
      .then(data => {
        this.set(url, options, data);
        this.pendingRequests.delete(cacheKey);
        return data;
      })
      .catch(error => {
        this.pendingRequests.delete(cacheKey);
        throw error;
      });

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Make HTTP request
   */
  async makeRequest(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate cache key from URL and options
   */
  generateCacheKey(url, options = {}) {
    const { method = 'GET', body, headers = {} } = options;
    const keyData = {
      url,
      method,
      body: body ? JSON.stringify(body) : null,
      headers: Object.keys(headers).sort().reduce((sorted, key) => {
        sorted[key] = headers[key];
        return sorted;
      }, {})
    };
    
    return btoa(JSON.stringify(keyData)).replace(/[/+=]/g, '');
  }

  /**
   * Invalidate cache entries
   */
  invalidate(pattern) {
    // Invalidate memory cache
    for (const key of this.memoryCache.cache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // Invalidate persistent cache
    const index = this.persistentCache.getIndex();
    index.forEach(key => {
      if (key.includes(pattern)) {
        this.persistentCache.delete(key);
      }
    });
  }

  /**
   * Preload API responses
   */
  async preload(urls, options = {}) {
    const promises = urls.map(url => 
      this.cachedFetch(url, options).catch(error => {
        console.warn(`Failed to preload ${url}:`, error);
        return null;
      })
    );

    return Promise.allSettled(promises);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memory: this.memoryCache.getStats(),
      storage: this.persistentCache.getStats(),
      pendingRequests: this.pendingRequests.size
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const memoryCleanup = this.memoryCache.cleanup();
    const storageCleanup = this.persistentCache.cleanup();
    
    return {
      memory: memoryCleanup,
      storage: storageCleanup
    };
  }
}

/**
 * Image Cache Manager
 * Specialized caching for images with blob storage
 */
class ImageCacheManager {
  constructor() {
    this.cache = new Map();
    this.maxSize = 50; // Maximum number of cached images
    this.maxSizeBytes = 50 * 1024 * 1024; // 50MB
    this.currentSize = 0;
  }

  /**
   * Get cached image
   */
  async get(url) {
    const cached = this.cache.get(url);
    if (cached) {
      // Update access time
      cached.lastAccess = Date.now();
      return cached.blob;
    }
    return null;
  }

  /**
   * Cache image blob
   */
  async set(url, blob) {
    const size = blob.size;
    
    // Check if we need to evict items
    while (this.cache.size >= this.maxSize || this.currentSize + size > this.maxSizeBytes) {
      this.evictLRU();
    }

    this.cache.set(url, {
      blob,
      size,
      lastAccess: Date.now()
    });
    
    this.currentSize += size;
  }

  /**
   * Fetch and cache image
   */
  async fetchAndCache(url) {
    try {
      // Check cache first
      const cached = await this.get(url);
      if (cached) {
        return URL.createObjectURL(cached);
      }

      // Fetch image
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();
      await this.set(url, blob);
      
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Image cache error:', error);
      return url; // Fallback to original URL
    }
  }

  /**
   * Evict least recently used image
   */
  evictLRU() {
    let lruUrl = null;
    let lruTime = Infinity;

    for (const [url, data] of this.cache) {
      if (data.lastAccess < lruTime) {
        lruTime = data.lastAccess;
        lruUrl = url;
      }
    }

    if (lruUrl) {
      const data = this.cache.get(lruUrl);
      this.currentSize -= data.size;
      this.cache.delete(lruUrl);
    }
  }

  /**
   * Clear image cache
   */
  clear() {
    this.cache.clear();
    this.currentSize = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      itemCount: this.cache.size,
      totalSize: this.currentSize,
      maxSize: this.maxSize,
      maxSizeBytes: this.maxSizeBytes,
      usage: (this.currentSize / this.maxSizeBytes) * 100
    };
  }
}

// Create singleton instances
export const memoryCache = new MemoryCacheManager();
export const localStorageCache = new LocalStorageCacheManager();
export const apiCache = new APIResponseCacheManager();
export const imageCache = new ImageCacheManager();

// Utility functions
export const cacheAPI = (url, options) => apiCache.cachedFetch(url, options);
export const cacheImage = (url) => imageCache.fetchAndCache(url);
export const invalidateCache = (pattern) => apiCache.invalidate(pattern);

// Auto cleanup interval
setInterval(() => {
  memoryCache.cleanup();
  localStorageCache.cleanup();
  apiCache.cleanup();
}, 300000); // Cleanup every 5 minutes

export default {
  MemoryCacheManager,
  LocalStorageCacheManager,
  APIResponseCacheManager,
  ImageCacheManager,
  memoryCache,
  localStorageCache,
  apiCache,
  imageCache
};