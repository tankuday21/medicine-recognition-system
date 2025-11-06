// Bundle analysis utilities for performance optimization

class BundleAnalyzer {
  constructor() {
    this.chunks = new Map();
    this.loadTimes = new Map();
    this.isSupported = typeof window !== 'undefined' && 'performance' in window;
  }

  // Track chunk loading
  trackChunkLoad(chunkName, startTime = performance.now()) {
    if (!this.isSupported) return;

    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    this.loadTimes.set(chunkName, loadTime);
    
    console.log(`[INFO] Chunk loaded: ${chunkName} (${loadTime.toFixed(2)}ms)`);
    
    // Warn about slow chunks
    if (loadTime > 1000) {
      console.warn(`[WARN] Slow chunk detected: ${chunkName} took ${loadTime.toFixed(2)}ms to load`);
    }
  }

  // Analyze bundle size
  analyzeBundleSize() {
    if (!this.isSupported) return;

    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(resource => 
      resource.name.includes('.js') && !resource.name.includes('node_modules')
    );

    const bundleInfo = jsResources.map(resource => ({
      name: this.extractChunkName(resource.name),
      size: resource.transferSize || resource.encodedBodySize,
      loadTime: resource.duration,
      cached: resource.transferSize === 0
    }));

    console.group('[INFO] Bundle Analysis');
    bundleInfo.forEach(chunk => {
      const sizeKB = (chunk.size / 1024).toFixed(2);
      const status = chunk.cached ? '(cached)' : '';
      console.log(`${chunk.name}: ${sizeKB}KB ${status} - ${chunk.loadTime.toFixed(2)}ms`);
    });
    console.groupEnd();

    return bundleInfo;
  }

  // Extract chunk name from URL
  extractChunkName(url) {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace(/\.[a-f0-9]+\.js$/, '.js');
  }

  // Get loading performance metrics
  getLoadingMetrics() {
    if (!this.isSupported) return {};

    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) return {};

    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.navigationStart
    };
  }

  // Identify unused code
  identifyUnusedCode() {
    if (!this.isSupported || !window.chrome || !window.chrome.loadTimes) {
      console.warn('Code coverage analysis not supported in this browser');
      return;
    }

    // This would require Chrome DevTools Protocol in a real implementation
    console.log('[INFO] To analyze unused code, use Chrome DevTools Coverage tab');
  }

  // Suggest optimizations
  suggestOptimizations() {
    const bundleInfo = this.analyzeBundleSize();
    const suggestions = [];

    // Check for large chunks
    const largeBundles = bundleInfo.filter(chunk => chunk.size > 250 * 1024); // > 250KB
    if (largeBundles.length > 0) {
      suggestions.push({
        type: 'bundle-size',
        message: `Large bundles detected: ${largeBundles.map(b => b.name).join(', ')}`,
        recommendation: 'Consider code splitting or lazy loading for these bundles'
      });
    }

    // Check for slow loading chunks
    const slowChunks = Array.from(this.loadTimes.entries())
      .filter(([, time]) => time > 1000);
    
    if (slowChunks.length > 0) {
      suggestions.push({
        type: 'load-time',
        message: `Slow loading chunks: ${slowChunks.map(([name]) => name).join(', ')}`,
        recommendation: 'Consider preloading critical chunks or optimizing bundle size'
      });
    }

    // Check for non-cached resources
    const uncachedBundles = bundleInfo.filter(chunk => !chunk.cached && chunk.size > 50 * 1024);
    if (uncachedBundles.length > 0) {
      suggestions.push({
        type: 'caching',
        message: `Large uncached bundles: ${uncachedBundles.map(b => b.name).join(', ')}`,
        recommendation: 'Ensure proper cache headers are set for static assets'
      });
    }

    return suggestions;
  }

  // Generate performance report
  generateReport() {
    const bundleInfo = this.analyzeBundleSize();
    const loadingMetrics = this.getLoadingMetrics();
    const suggestions = this.suggestOptimizations();

    const report = {
      timestamp: new Date().toISOString(),
      bundles: bundleInfo,
      loadingMetrics,
      suggestions,
      totalBundleSize: bundleInfo.reduce((total, chunk) => total + chunk.size, 0),
      averageLoadTime: bundleInfo.reduce((total, chunk) => total + chunk.loadTime, 0) / bundleInfo.length
    };

    console.group('[INFO] Bundle Performance Report');
    console.log('Total bundle size:', (report.totalBundleSize / 1024).toFixed(2), 'KB');
    console.log('Average load time:', report.averageLoadTime.toFixed(2), 'ms');
    console.log('Suggestions:', report.suggestions.length);
    console.groupEnd();

    return report;
  }

  // Monitor chunk loading in real-time
  startMonitoring() {
    if (!this.isSupported) return;

    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('.js') && !entry.name.includes('node_modules')) {
          const chunkName = this.extractChunkName(entry.name);
          this.trackChunkLoad(chunkName, entry.startTime);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    // Auto-generate report after initial load
    setTimeout(() => {
      this.generateReport();
    }, 5000);

    return observer;
  }
}

// Create singleton instance
const bundleAnalyzer = new BundleAnalyzer();

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  bundleAnalyzer.startMonitoring();
}

export default bundleAnalyzer;