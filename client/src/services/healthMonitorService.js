// System health monitoring service for the Mediot application

class HealthMonitorService {
  constructor() {
    this.isMonitoring = false;
    this.healthData = {
      performance: {},
      memory: {},
      network: {},
      storage: {},
      features: {},
      errors: []
    };
    this.monitoringInterval = null;
    this.checkInterval = 30000; // 30 seconds
    this.listeners = new Set();
  }

  // Initialize health monitoring
  async initialize() {
    if (this.isMonitoring) return;

    console.log('Initializing health monitoring...');
    
    this.isMonitoring = true;
    
    // Initial health check
    await this.performHealthCheck();
    
    // Start periodic monitoring
    this.startPeriodicMonitoring();
    
    // Set up event listeners
    this.setupEventListeners();
    
    console.log('Health monitoring initialized');
  }

  // Stop health monitoring
  stop() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.removeEventListeners();
    
    console.log('Health monitoring stopped');
  }

  // Perform comprehensive health check
  async performHealthCheck() {
    const startTime = performance.now();
    
    try {
      // Check all system components
      const results = await Promise.allSettled([
        this.checkPerformance(),
        this.checkMemory(),
        this.checkNetwork(),
        this.checkStorage(),
        this.checkFeatures(),
        this.checkServices()
      ]);

      // Process results
      const [performance, memory, network, storage, features, services] = results;
      
      this.healthData = {
        timestamp: new Date().toISOString(),
        checkDuration: performance.now() - startTime,
        performance: performance.status === 'fulfilled' ? performance.value : { status: 'error', error: performance.reason },
        memory: memory.status === 'fulfilled' ? memory.value : { status: 'error', error: memory.reason },
        network: network.status === 'fulfilled' ? network.value : { status: 'error', error: network.reason },
        storage: storage.status === 'fulfilled' ? storage.value : { status: 'error', error: storage.reason },
        features: features.status === 'fulfilled' ? features.value : { status: 'error', error: features.reason },
        services: services.status === 'fulfilled' ? services.value : { status: 'error', error: services.reason },
        overallStatus: this.calculateOverallStatus()
      };

      // Notify listeners
      this.notifyListeners(this.healthData);
      
      return this.healthData;
    } catch (error) {
      console.error('Health check failed:', error);
      
      this.healthData = {
        timestamp: new Date().toISOString(),
        checkDuration: performance.now() - startTime,
        overallStatus: 'critical',
        error: error.message
      };
      
      return this.healthData;
    }
  }

  // Check performance metrics
  async checkPerformance() {
    const performance_data = {
      status: 'healthy',
      metrics: {}
    };

    try {
      // Navigation timing
      if (performance.navigation) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          performance_data.metrics.pageLoad = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: navigation.responseEnd - navigation.requestStart
          };
        }
      }

      // Memory usage (if available)
      if (performance.memory) {
        performance_data.metrics.memory = {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          usagePercentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
        };
      }

      // Long tasks (if available)
      if ('PerformanceObserver' in window) {
        try {
          const longTasks = performance.getEntriesByType('longtask');
          performance_data.metrics.longTasks = {
            count: longTasks.length,
            totalDuration: longTasks.reduce((sum, task) => sum + task.duration, 0)
          };
        } catch (e) {
          // PerformanceObserver might not support longtask
        }
      }

      // FPS estimation
      performance_data.metrics.fps = await this.estimateFPS();

      // Determine performance status
      if (performance_data.metrics.memory?.usagePercentage > 90) {
        performance_data.status = 'critical';
      } else if (performance_data.metrics.memory?.usagePercentage > 70 || performance_data.metrics.fps < 30) {
        performance_data.status = 'warning';
      }

    } catch (error) {
      performance_data.status = 'error';
      performance_data.error = error.message;
    }

    return performance_data;
  }

  // Check memory usage
  async checkMemory() {
    const memoryData = {
      status: 'healthy',
      metrics: {}
    };

    try {
      // Browser memory (if available)
      if (performance.memory) {
        const memory = performance.memory;
        memoryData.metrics.browser = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        };
      }

      // Storage quota (if available)
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        memoryData.metrics.storage = {
          quota: estimate.quota,
          usage: estimate.usage,
          usagePercentage: (estimate.usage / estimate.quota) * 100
        };
      }

      // IndexedDB usage
      try {
        const dbUsage = await this.getIndexedDBUsage();
        memoryData.metrics.indexedDB = dbUsage;
      } catch (error) {
        console.warn('Failed to get IndexedDB usage:', error);
      }

      // Determine memory status
      const browserUsage = memoryData.metrics.browser?.usagePercentage || 0;
      const storageUsage = memoryData.metrics.storage?.usagePercentage || 0;

      if (browserUsage > 90 || storageUsage > 90) {
        memoryData.status = 'critical';
      } else if (browserUsage > 70 || storageUsage > 70) {
        memoryData.status = 'warning';
      }

    } catch (error) {
      memoryData.status = 'error';
      memoryData.error = error.message;
    }

    return memoryData;
  }

  // Check network connectivity
  async checkNetwork() {
    const networkData = {
      status: 'healthy',
      metrics: {}
    };

    try {
      // Basic connectivity
      networkData.metrics.online = navigator.onLine;
      
      // Connection info (if available)
      if ('connection' in navigator) {
        const connection = navigator.connection;
        networkData.metrics.connection = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }

      // API connectivity test
      const apiStart = performance.now();
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          timeout: 5000
        });
        
        networkData.metrics.api = {
          status: response.status,
          responseTime: performance.now() - apiStart,
          accessible: response.ok
        };
      } catch (error) {
        networkData.metrics.api = {
          status: 'error',
          responseTime: performance.now() - apiStart,
          accessible: false,
          error: error.message
        };
      }

      // Determine network status
      if (!networkData.metrics.online || !networkData.metrics.api?.accessible) {
        networkData.status = 'critical';
      } else if (networkData.metrics.api?.responseTime > 3000) {
        networkData.status = 'warning';
      }

    } catch (error) {
      networkData.status = 'error';
      networkData.error = error.message;
    }

    return networkData;
  }

  // Check storage systems
  async checkStorage() {
    const storageData = {
      status: 'healthy',
      metrics: {}
    };

    try {
      // LocalStorage
      try {
        const testKey = 'health_check_test';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        storageData.metrics.localStorage = { accessible: true };
      } catch (error) {
        storageData.metrics.localStorage = { accessible: false, error: error.message };
      }

      // SessionStorage
      try {
        const testKey = 'health_check_test';
        sessionStorage.setItem(testKey, 'test');
        sessionStorage.removeItem(testKey);
        storageData.metrics.sessionStorage = { accessible: true };
      } catch (error) {
        storageData.metrics.sessionStorage = { accessible: false, error: error.message };
      }

      // IndexedDB
      try {
        const dbTest = await this.testIndexedDB();
        storageData.metrics.indexedDB = { accessible: dbTest, error: dbTest ? null : 'Connection failed' };
      } catch (error) {
        storageData.metrics.indexedDB = { accessible: false, error: error.message };
      }

      // Cache API
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          storageData.metrics.cacheAPI = { 
            accessible: true, 
            cacheCount: cacheNames.length,
            caches: cacheNames
          };
        } catch (error) {
          storageData.metrics.cacheAPI = { accessible: false, error: error.message };
        }
      }

      // Determine storage status
      const criticalStorageFailed = !storageData.metrics.localStorage?.accessible || 
                                   !storageData.metrics.indexedDB?.accessible;
      
      if (criticalStorageFailed) {
        storageData.status = 'critical';
      } else if (!storageData.metrics.sessionStorage?.accessible) {
        storageData.status = 'warning';
      }

    } catch (error) {
      storageData.status = 'error';
      storageData.error = error.message;
    }

    return storageData;
  }

  // Check browser features
  async checkFeatures() {
    const featuresData = {
      status: 'healthy',
      metrics: {}
    };

    try {
      // Core features
      featuresData.metrics.core = {
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        notifications: 'Notification' in window,
        geolocation: 'geolocation' in navigator,
        camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
        fileAPI: 'File' in window && 'FileReader' in window,
        webGL: this.checkWebGL(),
        webAssembly: 'WebAssembly' in window
      };

      // PWA features
      featuresData.metrics.pwa = {
        manifest: document.querySelector('link[rel="manifest"]') !== null,
        serviceWorkerRegistered: await this.checkServiceWorkerRegistration(),
        installable: await this.checkInstallability()
      };

      // Performance features
      featuresData.metrics.performance = {
        performanceObserver: 'PerformanceObserver' in window,
        intersectionObserver: 'IntersectionObserver' in window,
        resizeObserver: 'ResizeObserver' in window,
        mutationObserver: 'MutationObserver' in window
      };

      // Determine features status
      const criticalFeaturesMissing = !featuresData.metrics.core.serviceWorker || 
                                     !featuresData.metrics.core.fileAPI;
      
      if (criticalFeaturesMissing) {
        featuresData.status = 'warning';
      }

    } catch (error) {
      featuresData.status = 'error';
      featuresData.error = error.message;
    }

    return featuresData;
  }

  // Check services status
  async checkServices() {
    const servicesData = {
      status: 'healthy',
      metrics: {}
    };

    try {
      // Sync service
      try {
        const { default: syncService } = await import('./syncService');
        servicesData.metrics.syncService = {
          status: 'healthy',
          ...syncService.getSyncStatus()
        };
      } catch (error) {
        servicesData.metrics.syncService = {
          status: 'error',
          error: error.message
        };
      }

      // Offline storage service
      try {
        const { default: offlineStorageService } = await import('./offlineStorageService');
        servicesData.metrics.offlineStorage = {
          status: offlineStorageService.isSupported ? 'healthy' : 'warning',
          supported: offlineStorageService.isSupported
        };
      } catch (error) {
        servicesData.metrics.offlineStorage = {
          status: 'error',
          error: error.message
        };
      }

      // Push notification service
      try {
        const { default: pushNotificationService } = await import('./pushNotificationService');
        const isSubscribed = await pushNotificationService.isSubscribed();
        servicesData.metrics.pushNotifications = {
          status: pushNotificationService.isSupported ? 'healthy' : 'warning',
          supported: pushNotificationService.isSupported,
          subscribed: isSubscribed
        };
      } catch (error) {
        servicesData.metrics.pushNotifications = {
          status: 'error',
          error: error.message
        };
      }

      // Determine services status
      const criticalServicesFailed = servicesData.metrics.syncService?.status === 'error' ||
                                    servicesData.metrics.offlineStorage?.status === 'error';
      
      if (criticalServicesFailed) {
        servicesData.status = 'critical';
      }

    } catch (error) {
      servicesData.status = 'error';
      servicesData.error = error.message;
    }

    return servicesData;
  }

  // Helper methods
  async estimateFPS() {
    return new Promise((resolve) => {
      let frames = 0;
      const startTime = performance.now();
      
      const countFrames = () => {
        frames++;
        if (performance.now() - startTime < 1000) {
          requestAnimationFrame(countFrames);
        } else {
          resolve(frames);
        }
      };
      
      requestAnimationFrame(countFrames);
    });
  }

  async getIndexedDBUsage() {
    try {
      const databases = await indexedDB.databases();
      let totalSize = 0;
      
      for (const db of databases) {
        // This is an approximation as there's no direct way to get DB size
        totalSize += 1; // Placeholder
      }
      
      return {
        databases: databases.length,
        estimatedSize: totalSize
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async testIndexedDB() {
    return new Promise((resolve) => {
      const request = indexedDB.open('health_check_test', 1);
      
      request.onsuccess = () => {
        request.result.close();
        indexedDB.deleteDatabase('health_check_test');
        resolve(true);
      };
      
      request.onerror = () => {
        resolve(false);
      };
      
      request.onblocked = () => {
        resolve(false);
      };
    });
  }

  checkWebGL() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (error) {
      return false;
    }
  }

  async checkServiceWorkerRegistration() {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      return !!registration;
    } catch (error) {
      return false;
    }
  }

  async checkInstallability() {
    try {
      // Check if app is already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return { installed: true, installable: false };
      }
      
      // Check if installable
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ installed: false, installable: false });
        }, 1000);
        
        window.addEventListener('beforeinstallprompt', () => {
          clearTimeout(timeout);
          resolve({ installed: false, installable: true });
        }, { once: true });
      });
    } catch (error) {
      return { installed: false, installable: false, error: error.message };
    }
  }

  calculateOverallStatus() {
    const components = [
      this.healthData.performance?.status,
      this.healthData.memory?.status,
      this.healthData.network?.status,
      this.healthData.storage?.status,
      this.healthData.features?.status,
      this.healthData.services?.status
    ].filter(Boolean);

    if (components.includes('critical')) {
      return 'critical';
    } else if (components.includes('error')) {
      return 'error';
    } else if (components.includes('warning')) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  // Event handling
  setupEventListeners() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
  }

  removeEventListeners() {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    window.removeEventListener('error', this.handleError.bind(this));
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
  }

  handleOnline() {
    this.performHealthCheck();
  }

  handleOffline() {
    this.performHealthCheck();
  }

  handleError(event) {
    this.healthData.errors = this.healthData.errors || [];
    this.healthData.errors.push({
      type: 'javascript_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      timestamp: new Date().toISOString()
    });
  }

  handleUnhandledRejection(event) {
    this.healthData.errors = this.healthData.errors || [];
    this.healthData.errors.push({
      type: 'unhandled_promise_rejection',
      message: event.reason?.message || 'Unhandled promise rejection',
      timestamp: new Date().toISOString()
    });
  }

  // Periodic monitoring
  startPeriodicMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);
  }

  // Listener management
  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners(healthData) {
    this.listeners.forEach(callback => {
      try {
        callback(healthData);
      } catch (error) {
        console.error('Health monitor listener error:', error);
      }
    });
  }

  // Public API
  getHealthData() {
    return { ...this.healthData };
  }

  getHealthStatus() {
    return this.healthData.overallStatus || 'unknown';
  }

  isHealthy() {
    return this.getHealthStatus() === 'healthy';
  }

  // Export health data
  exportHealthData() {
    return {
      ...this.healthData,
      exportTimestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }
}

// Create singleton instance
const healthMonitorService = new HealthMonitorService();

export default healthMonitorService;