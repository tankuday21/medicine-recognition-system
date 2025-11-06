// Performance monitoring utilities for mobile optimization

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isSupported = this.checkSupport();
  }

  checkSupport() {
    return (
      typeof window !== 'undefined' &&
      'performance' in window &&
      'PerformanceObserver' in window
    );
  }

  // Measure page load performance
  measurePageLoad() {
    if (!this.isSupported) return;

    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          request: navigation.responseStart - navigation.requestStart,
          response: navigation.responseEnd - navigation.responseStart,
          dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          load: navigation.loadEventEnd - navigation.loadEventStart,
          total: navigation.loadEventEnd - navigation.navigationStart
        };

        this.metrics.set('pageLoad', metrics);
        this.logMetrics('Page Load', metrics);
        return metrics;
      }
    } catch (error) {
      console.warn('Failed to measure page load performance:', error);
    }
  }

  // Measure Core Web Vitals
  measureCoreWebVitals() {
    if (!this.isSupported) return;

    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lcp = entries[entries.length - 1];
      const value = lcp.startTime;
      this.metrics.set('lcp', value);
      this.logMetric('LCP', value, 'ms', value > 2500 ? 'poor' : value > 1200 ? 'needs-improvement' : 'good');
    });

    // First Input Delay (FID)
    this.observeMetric('first-input', (entries) => {
      const fid = entries[0];
      const value = fid.processingStart - fid.startTime;
      this.metrics.set('fid', value);
      this.logMetric('FID', value, 'ms', value > 100 ? 'poor' : value > 25 ? 'needs-improvement' : 'good');
    });

    // Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entries) => {
      let cls = 0;
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      });
      this.metrics.set('cls', cls);
      this.logMetric('CLS', cls, '', cls > 0.25 ? 'poor' : cls > 0.1 ? 'needs-improvement' : 'good');
    });
  }

  // Observe specific performance metrics
  observeMetric(type, callback) {
    if (!this.isSupported) return;

    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });

      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  // Measure component render time
  measureComponentRender(componentName, renderFunction) {
    if (!this.isSupported) return renderFunction();

    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    this.metrics.set(`render_${componentName}`, renderTime);
    
    if (renderTime > 16) { // More than one frame at 60fps
      console.warn(`Slow render detected for ${componentName}: ${renderTime.toFixed(2)}ms`);
    }

    return result;
  }

  // Measure API call performance
  async measureApiCall(url, fetchFunction) {
    const startTime = performance.now();
    
    try {
      const result = await fetchFunction();
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.metrics.set(`api_${url}`, duration);
      this.logMetric(`API ${url}`, duration, 'ms');

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.metrics.set(`api_${url}_error`, duration);
      throw error;
    }
  }

  // Monitor memory usage
  measureMemoryUsage() {
    if (!this.isSupported || !performance.memory) return;

    const memory = {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    };

    this.metrics.set('memory', memory);
    
    const usagePercent = (memory.used / memory.limit) * 100;
    if (usagePercent > 80) {
      console.warn(`High memory usage detected: ${usagePercent.toFixed(1)}%`);
    }

    return memory;
  }

  // Monitor frame rate
  monitorFrameRate(duration = 5000) {
    if (!this.isSupported) return;

    let frames = 0;
    let startTime = performance.now();
    let lastTime = startTime;

    const countFrame = (currentTime) => {
      frames++;
      
      if (currentTime - startTime >= duration) {
        const fps = Math.round((frames * 1000) / (currentTime - startTime));
        this.metrics.set('fps', fps);
        this.logMetric('FPS', fps, '', fps < 30 ? 'poor' : fps < 50 ? 'needs-improvement' : 'good');
        return;
      }

      requestAnimationFrame(countFrame);
    };

    requestAnimationFrame(countFrame);
  }

  // Get device information
  getDeviceInfo() {
    if (typeof window === 'undefined') return {};

    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    };

    this.metrics.set('device', info);
    return info;
  }

  // Log performance metrics
  logMetric(name, value, unit = '', status = '') {
    const statusEmoji = {
      good: '[OK]',
      'needs-improvement': '[WARN]',
      poor: '[ERROR]'
    };

    console.log(
      `[INFO] ${name}: ${value.toFixed ? value.toFixed(2) : value}${unit} ${statusEmoji[status] || ''}`
    );
  }

  logMetrics(category, metrics) {
    console.group(`[INFO] ${category} Performance`);
    Object.entries(metrics).forEach(([key, value]) => {
      console.log(`${key}: ${value.toFixed ? value.toFixed(2) : value}ms`);
    });
    console.groupEnd();
  }

  // Get all collected metrics
  getAllMetrics() {
    return Object.fromEntries(this.metrics);
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics.clear();
  }

  // Disconnect all observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  // Generate performance report
  generateReport() {
    const metrics = this.getAllMetrics();
    const deviceInfo = this.getDeviceInfo();

    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      device: deviceInfo,
      metrics: metrics,
      recommendations: this.generateRecommendations(metrics)
    };
  }

  // Generate performance recommendations
  generateRecommendations(metrics) {
    const recommendations = [];

    if (metrics.lcp > 2500) {
      recommendations.push('Consider optimizing images and reducing server response time to improve LCP');
    }

    if (metrics.fid > 100) {
      recommendations.push('Reduce JavaScript execution time to improve FID');
    }

    if (metrics.cls > 0.25) {
      recommendations.push('Add size attributes to images and avoid inserting content above existing content');
    }

    if (metrics.fps < 30) {
      recommendations.push('Optimize animations and reduce DOM complexity to improve frame rate');
    }

    const memoryUsage = metrics.memory;
    if (memoryUsage && (memoryUsage.used / memoryUsage.limit) > 0.8) {
      recommendations.push('High memory usage detected. Consider implementing lazy loading and component cleanup');
    }

    return recommendations;
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-initialize core measurements
if (typeof window !== 'undefined') {
  // Wait for page load
  if (document.readyState === 'complete') {
    performanceMonitor.measurePageLoad();
    performanceMonitor.measureCoreWebVitals();
  } else {
    window.addEventListener('load', () => {
      performanceMonitor.measurePageLoad();
      performanceMonitor.measureCoreWebVitals();
    });
  }

  // Monitor frame rate periodically
  setTimeout(() => {
    performanceMonitor.monitorFrameRate();
  }, 2000);
}

export default performanceMonitor;