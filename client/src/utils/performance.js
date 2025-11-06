import { lazy } from 'react';

// Lazy loading utilities
export const createLazyComponent = (importFunc, fallback = null) => {
  return lazy(() => {
    return Promise.all([
      importFunc(),
      // Minimum delay to prevent flash of loading state
      new Promise(resolve => setTimeout(resolve, 200))
    ]).then(([moduleExports]) => moduleExports);
  });
};

// Image lazy loading with intersection observer
export class LazyImageLoader {
  constructor() {
    this.observer = null;
    this.images = new Set();
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        this.loadImage(img);
        this.observer.unobserve(img);
        this.images.delete(img);
      }
    });
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.classList.add('loaded');
      img.removeAttribute('data-src');
    }
  }

  observe(img) {
    if (this.observer) {
      this.images.add(img);
      this.observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  unobserve(img) {
    if (this.observer && this.images.has(img)) {
      this.observer.unobserve(img);
      this.images.delete(img);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.images.clear();
    }
  }
}

// Create singleton instance
export const lazyImageLoader = new LazyImageLoader();

// Debounce utility for performance
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle utility for performance
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory usage monitoring
export class MemoryMonitor {
  constructor() {
    this.isSupported = 'memory' in performance;
    this.measurements = [];
    this.maxMeasurements = 100;
  }

  measure() {
    if (!this.isSupported) return null;

    const memory = performance.memory;
    const measurement = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    };

    this.measurements.push(measurement);
    
    // Keep only recent measurements
    if (this.measurements.length > this.maxMeasurements) {
      this.measurements.shift();
    }

    return measurement;
  }

  getAverageUsage() {
    if (this.measurements.length === 0) return null;

    const total = this.measurements.reduce((sum, m) => sum + m.usedJSHeapSize, 0);
    return total / this.measurements.length;
  }

  getMemoryTrend() {
    if (this.measurements.length < 2) return 'stable';

    const recent = this.measurements.slice(-10);
    const older = this.measurements.slice(-20, -10);

    if (recent.length === 0 || older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, m) => sum + m.usedJSHeapSize, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.usedJSHeapSize, 0) / older.length;

    const change = (recentAvg - olderAvg) / olderAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  isMemoryPressure() {
    const latest = this.measurements[this.measurements.length - 1];
    if (!latest) return false;

    const usageRatio = latest.usedJSHeapSize / latest.jsHeapSizeLimit;
    return usageRatio > 0.8; // 80% usage threshold
  }
}

// Performance timing utilities
export class PerformanceTracker {
  constructor() {
    this.marks = new Map();
    this.measures = new Map();
  }

  mark(name) {
    const timestamp = performance.now();
    this.marks.set(name, timestamp);
    
    if ('mark' in performance) {
      performance.mark(name);
    }
    
    return timestamp;
  }

  measure(name, startMark, endMark = null) {
    const startTime = this.marks.get(startMark);
    const endTime = endMark ? this.marks.get(endMark) : performance.now();
    
    if (startTime === undefined) {
      console.warn(`Start mark "${startMark}" not found`);
      return null;
    }

    const duration = endTime - startTime;
    this.measures.set(name, duration);

    if ('measure' in performance && endMark) {
      performance.measure(name, startMark, endMark);
    }

    return duration;
  }

  getMeasure(name) {
    return this.measures.get(name);
  }

  getAllMeasures() {
    return Object.fromEntries(this.measures);
  }

  clear() {
    this.marks.clear();
    this.measures.clear();
    
    if ('clearMarks' in performance) {
      performance.clearMarks();
    }
    if ('clearMeasures' in performance) {
      performance.clearMeasures();
    }
  }
}

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel=\"stylesheet\"]'));
    
    console.group('Bundle Analysis');
    console.log('Scripts:', scripts.length);
    console.log('Stylesheets:', styles.length);
    
    scripts.forEach(script => {
      console.log(`Script: ${script.src}`);
    });
    
    styles.forEach(style => {
      console.log(`Stylesheet: ${style.href}`);
    });
    
    console.groupEnd();
  }
};

// Resource hints for preloading
export const addResourceHint = (href, as, type = 'preload') => {
  const link = document.createElement('link');
  link.rel = type;
  link.href = href;
  if (as) link.as = as;
  document.head.appendChild(link);
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical fonts
  addResourceHint('/fonts/inter-var.woff2', 'font', 'preload');
  
  // Preload critical images
  addResourceHint('/icons/icon-192x192.png', 'image', 'preload');
  
  // Prefetch likely next pages
  addResourceHint('/scanner', null, 'prefetch');
  addResourceHint('/chat', null, 'prefetch');
};

// Virtual scrolling utility for large lists
export class VirtualScroller {
  constructor(container, itemHeight, renderItem, totalItems) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.totalItems = totalItems;
    this.visibleItems = [];
    this.scrollTop = 0;
    this.containerHeight = 0;
    
    this.init();
  }

  init() {
    this.containerHeight = this.container.clientHeight;
    this.visibleCount = Math.ceil(this.containerHeight / this.itemHeight) + 2; // Buffer
    
    this.container.addEventListener('scroll', this.handleScroll.bind(this));
    this.render();
  }

  handleScroll() {
    this.scrollTop = this.container.scrollTop;
    this.render();
  }

  render() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleCount, this.totalItems);
    
    // Clear container
    this.container.innerHTML = '';
    
    // Create spacer for items above viewport
    if (startIndex > 0) {
      const topSpacer = document.createElement('div');
      topSpacer.style.height = `${startIndex * this.itemHeight}px`;
      this.container.appendChild(topSpacer);
    }
    
    // Render visible items
    for (let i = startIndex; i < endIndex; i++) {
      const item = this.renderItem(i);
      this.container.appendChild(item);
    }
    
    // Create spacer for items below viewport
    const remainingItems = this.totalItems - endIndex;
    if (remainingItems > 0) {
      const bottomSpacer = document.createElement('div');
      bottomSpacer.style.height = `${remainingItems * this.itemHeight}px`;
      this.container.appendChild(bottomSpacer);
    }
  }

  updateTotalItems(newTotal) {
    this.totalItems = newTotal;
    this.render();
  }

  scrollToIndex(index) {
    const scrollTop = index * this.itemHeight;
    this.container.scrollTop = scrollTop;
  }
}

// Web Workers utility for heavy computations
export class WorkerPool {
  constructor(workerScript, poolSize = navigator.hardwareConcurrency || 4) {
    this.workerScript = workerScript;
    this.poolSize = poolSize;
    this.workers = [];
    this.queue = [];
    this.activeJobs = new Map();
    
    this.init();
  }

  init() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerScript);
      worker.onmessage = this.handleWorkerMessage.bind(this);
      worker.onerror = this.handleWorkerError.bind(this);
      this.workers.push({ worker, busy: false });
    }
  }

  handleWorkerMessage(event) {
    const { jobId, result, error } = event.data;
    const job = this.activeJobs.get(jobId);
    
    if (job) {
      if (error) {
        job.reject(new Error(error));
      } else {
        job.resolve(result);
      }
      
      this.activeJobs.delete(jobId);
      
      // Mark worker as available
      const workerInfo = this.workers.find(w => w.worker === event.target);
      if (workerInfo) {
        workerInfo.busy = false;
      }
      
      // Process next job in queue
      this.processQueue();
    }
  }

  handleWorkerError(error) {
    console.error('Worker error:', error);
  }

  execute(data) {
    return new Promise((resolve, reject) => {
      const jobId = Date.now() + Math.random();
      const job = { jobId, data, resolve, reject };
      
      this.queue.push(job);
      this.processQueue();
    });
  }

  processQueue() {
    if (this.queue.length === 0) return;
    
    const availableWorker = this.workers.find(w => !w.busy);
    if (!availableWorker) return;
    
    const job = this.queue.shift();
    availableWorker.busy = true;
    
    this.activeJobs.set(job.jobId, job);
    availableWorker.worker.postMessage({
      jobId: job.jobId,
      data: job.data
    });
  }

  terminate() {
    this.workers.forEach(({ worker }) => worker.terminate());
    this.workers = [];
    this.queue = [];
    this.activeJobs.clear();
  }
}

// Create singleton instances
export const memoryMonitor = new MemoryMonitor();
export const performanceTracker = new PerformanceTracker();

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  // Monitor memory usage every 30 seconds
  setInterval(() => {
    memoryMonitor.measure();
    
    if (memoryMonitor.isMemoryPressure()) {
      console.warn('Memory pressure detected');
      // Trigger garbage collection if possible
      if (window.gc) {
        window.gc();
      }
    }
  }, 30000);

  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) { // Long task threshold
          console.warn('Long task detected:', entry.duration + 'ms');
        }
      });
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }

  // Monitor Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('[INFO] LCP:', lastEntry.startTime.toFixed(2) + 'ms');
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const delay = entry.processingStart - entry.startTime;
        console.log('[INFO] FID:', delay.toFixed(2) + 'ms');
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          console.log('[INFO] CLS:', clsValue.toFixed(4));
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Preload critical resources
  preloadCriticalResources();
  
  // Bundle analysis in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      analyzeBundleSize();
    }, 2000);
  }
  
  console.log('[INFO] Performance monitoring initialized');
};