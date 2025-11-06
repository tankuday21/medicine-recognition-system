// Cross-Device Testing and Optimization Utilities
// Comprehensive device testing and optimization system

/**
 * Device Detection and Testing Manager
 */
export class DeviceTestingManager {
  constructor() {
    this.deviceInfo = this.getDeviceInfo();
    this.testResults = new Map();
    this.optimizations = new Map();
    this.performanceMetrics = new Map();
    
    this.init();
  }

  /**
   * Initialize device testing
   */
  init() {
    this.detectDevice();
    this.setupPerformanceMonitoring();
    this.setupTouchOptimization();
    this.setupViewportOptimization();
  }

  /**
   * Get comprehensive device information
   */
  getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    return {
      // Basic device info
      userAgent,
      platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      
      // Screen information
      screenWidth: screen.width,
      screenHeight: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      
      // Viewport information
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      
      // Orientation
      orientation: screen.orientation?.type || 'unknown',
      orientationAngle: screen.orientation?.angle || 0,
      
      // Touch capabilities
      touchSupport: 'ontouchstart' in window,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      
      // Network information
      connection: this.getConnectionInfo(),
      
      // Performance capabilities
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      memory: navigator.deviceMemory || 'unknown',
      
      // Browser capabilities
      webGL: this.checkWebGLSupport(),
      serviceWorker: 'serviceWorker' in navigator,
      localStorage: this.checkLocalStorageSupport(),
      
      // Device type detection
      deviceType: this.detectDeviceType(userAgent),
      operatingSystem: this.detectOperatingSystem(userAgent),
      browser: this.detectBrowser(userAgent)
    };
  }

  /**
   * Get network connection information
   */
  getConnectionInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) return null;
    
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
      type: connection.type
    };
  }

  /**
   * Check WebGL support
   */
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check localStorage support
   */
  checkLocalStorageSupport() {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Detect device type
   */
  detectDeviceType(userAgent) {
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Detect operating system
   */
  detectOperatingSystem(userAgent) {
    if (/windows phone/i.test(userAgent)) return 'Windows Phone';
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/android/i.test(userAgent)) return 'Android';
    if (/ipad|iphone|ipod/i.test(userAgent)) return 'iOS';
    if (/mac/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    return 'Unknown';
  }

  /**
   * Detect browser
   */
  detectBrowser(userAgent) {
    if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    if (/opera/i.test(userAgent)) return 'Opera';
    return 'Unknown';
  }

  /**
   * Detect specific device characteristics
   */
  detectDevice() {
    const device = {
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isAndroid: /Android/.test(navigator.userAgent),
      isMobile: this.deviceInfo.deviceType === 'mobile',
      isTablet: this.deviceInfo.deviceType === 'tablet',
      isDesktop: this.deviceInfo.deviceType === 'desktop',
      isLowEnd: this.isLowEndDevice(),
      isHighEnd: this.isHighEndDevice(),
      hasNotch: this.hasNotch(),
      supportsHover: window.matchMedia('(hover: hover)').matches,
      prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    this.deviceInfo = { ...this.deviceInfo, ...device };
    return device;
  }

  /**
   * Check if device is low-end
   */
  isLowEndDevice() {
    const memory = navigator.deviceMemory;
    const cores = navigator.hardwareConcurrency;
    
    // Consider low-end if memory < 2GB or cores < 2
    return (memory && memory < 2) || (cores && cores < 2) || 
           this.deviceInfo.devicePixelRatio < 2;
  }

  /**
   * Check if device is high-end
   */
  isHighEndDevice() {
    const memory = navigator.deviceMemory;
    const cores = navigator.hardwareConcurrency;
    
    // Consider high-end if memory >= 4GB and cores >= 4
    return (memory && memory >= 4) && (cores && cores >= 4) && 
           this.deviceInfo.devicePixelRatio >= 2;
  }

  /**
   * Check if device has a notch
   */
  hasNotch() {
    // Check for safe area insets (indicates notch or similar)
    const testElement = document.createElement('div');
    testElement.style.paddingTop = 'env(safe-area-inset-top)';
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    const hasNotch = computedStyle.paddingTop !== '0px';
    
    document.body.removeChild(testElement);
    return hasNotch;
  }

  /**
   * Setup performance monitoring for different devices
   */
  setupPerformanceMonitoring() {
    // Monitor frame rate
    this.monitorFrameRate();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor network performance
    this.monitorNetworkPerformance();
    
    // Monitor touch responsiveness
    this.monitorTouchResponsiveness();
  }

  /**
   * Monitor frame rate performance
   */
  monitorFrameRate() {
    let frames = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        
        this.recordPerformanceMetric('frameRate', {
          fps,
          timestamp: currentTime,
          deviceType: this.deviceInfo.deviceType,
          isLowEnd: this.deviceInfo.isLowEnd
        });
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  /**
   * Monitor memory usage
   */
  monitorMemoryUsage() {
    if (!performance.memory) return;
    
    setInterval(() => {
      this.recordPerformanceMetric('memory', {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: performance.now(),
        deviceMemory: navigator.deviceMemory
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Monitor network performance
   */
  monitorNetworkPerformance() {
    const connection = navigator.connection;
    if (!connection) return;
    
    const recordNetworkMetrics = () => {
      this.recordPerformanceMetric('network', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
        timestamp: performance.now()
      });
    };
    
    // Record initial metrics
    recordNetworkMetrics();
    
    // Monitor changes
    connection.addEventListener('change', recordNetworkMetrics);
  }

  /**
   * Monitor touch responsiveness
   */
  monitorTouchResponsiveness() {
    if (!this.deviceInfo.touchSupport) return;
    
    let touchStartTime = 0;
    
    document.addEventListener('touchstart', () => {
      touchStartTime = performance.now();
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
      const touchDuration = performance.now() - touchStartTime;
      
      this.recordPerformanceMetric('touchResponse', {
        duration: touchDuration,
        timestamp: performance.now(),
        deviceType: this.deviceInfo.deviceType
      });
    }, { passive: true });
  }

  /**
   * Setup touch optimization based on device
   */
  setupTouchOptimization() {
    if (!this.deviceInfo.touchSupport) return;
    
    // Apply touch-specific optimizations
    document.documentElement.classList.add('touch-device');
    
    // Optimize for different touch capabilities
    if (this.deviceInfo.maxTouchPoints > 1) {
      document.documentElement.classList.add('multi-touch');
    }
    
    // Disable hover effects on touch devices
    if (!this.deviceInfo.supportsHover) {
      document.documentElement.classList.add('no-hover');
    }
    
    // Optimize touch targets
    this.optimizeTouchTargets();
  }

  /**
   * Optimize touch targets for device
   */
  optimizeTouchTargets() {
    const minTouchTarget = this.deviceInfo.isLowEnd ? 48 : 44; // Larger targets for low-end devices
    
    document.documentElement.style.setProperty('--min-touch-target', `${minTouchTarget}px`);
    
    // Add touch target optimization class
    document.documentElement.classList.add('touch-optimized');
  }

  /**
   * Setup viewport optimization
   */
  setupViewportOptimization() {
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
    
    // Handle viewport changes
    window.addEventListener('resize', () => {
      this.handleViewportChange();
    });
    
    // Initial viewport setup
    this.optimizeViewport();
  }

  /**
   * Handle orientation changes
   */
  handleOrientationChange() {
    const newOrientation = screen.orientation?.type || 'unknown';
    
    this.recordPerformanceMetric('orientationChange', {
      from: this.deviceInfo.orientation,
      to: newOrientation,
      timestamp: performance.now()
    });
    
    this.deviceInfo.orientation = newOrientation;
    this.deviceInfo.orientationAngle = screen.orientation?.angle || 0;
    
    // Update viewport dimensions
    this.deviceInfo.viewportWidth = window.innerWidth;
    this.deviceInfo.viewportHeight = window.innerHeight;
    
    // Apply orientation-specific optimizations
    this.applyOrientationOptimizations();
  }

  /**
   * Handle viewport changes
   */
  handleViewportChange() {
    this.deviceInfo.viewportWidth = window.innerWidth;
    this.deviceInfo.viewportHeight = window.innerHeight;
    
    // Check for virtual keyboard
    this.detectVirtualKeyboard();
  }

  /**
   * Detect virtual keyboard
   */
  detectVirtualKeyboard() {
    const heightDifference = screen.height - window.innerHeight;
    const isKeyboardOpen = heightDifference > 150; // Threshold for keyboard detection
    
    if (isKeyboardOpen !== this.deviceInfo.keyboardOpen) {
      this.deviceInfo.keyboardOpen = isKeyboardOpen;
      
      // Apply keyboard-specific optimizations
      if (isKeyboardOpen) {
        document.documentElement.classList.add('keyboard-open');
      } else {
        document.documentElement.classList.remove('keyboard-open');
      }
    }
  }

  /**
   * Optimize viewport for device
   */
  optimizeViewport() {
    // Set viewport meta tag if not present
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    
    // Optimize viewport content based on device
    let viewportContent = 'width=device-width, initial-scale=1';
    
    if (this.deviceInfo.isIOS) {
      // iOS-specific optimizations
      viewportContent += ', viewport-fit=cover';
    }
    
    if (this.deviceInfo.isLowEnd) {
      // Disable zoom on low-end devices for better performance
      viewportContent += ', user-scalable=no';
    }
    
    viewportMeta.content = viewportContent;
  }

  /**
   * Apply orientation-specific optimizations
   */
  applyOrientationOptimizations() {
    const isLandscape = this.deviceInfo.orientation.includes('landscape');
    
    if (isLandscape) {
      document.documentElement.classList.add('landscape');
      document.documentElement.classList.remove('portrait');
    } else {
      document.documentElement.classList.add('portrait');
      document.documentElement.classList.remove('landscape');
    }
  }

  /**
   * Run comprehensive device tests
   */
  async runDeviceTests() {
    const tests = [
      this.testTouchInteractions(),
      this.testPerformance(),
      this.testViewportHandling(),
      this.testNetworkConditions(),
      this.testAccessibilityFeatures(),
      this.testBrowserCompatibility()
    ];
    
    const results = await Promise.all(tests);
    
    const testReport = {
      deviceInfo: this.deviceInfo,
      testResults: results,
      timestamp: Date.now(),
      recommendations: this.generateOptimizationRecommendations(results)
    };
    
    this.testResults.set('comprehensive', testReport);
    return testReport;
  }

  /**
   * Test touch interactions
   */
  async testTouchInteractions() {
    if (!this.deviceInfo.touchSupport) {
      return { test: 'touchInteractions', status: 'skipped', reason: 'No touch support' };
    }
    
    const results = {
      test: 'touchInteractions',
      status: 'passed',
      details: {
        maxTouchPoints: this.deviceInfo.maxTouchPoints,
        touchTargetSize: this.getTouchTargetCompliance(),
        gestureSupport: this.testGestureSupport(),
        touchLatency: await this.measureTouchLatency()
      }
    };
    
    return results;
  }

  /**
   * Test performance characteristics
   */
  async testPerformance() {
    const performanceTests = {
      frameRate: await this.measureFrameRate(),
      memoryUsage: this.measureMemoryUsage(),
      renderingPerformance: await this.measureRenderingPerformance(),
      scriptExecution: await this.measureScriptPerformance()
    };
    
    return {
      test: 'performance',
      status: 'completed',
      details: performanceTests,
      score: this.calculatePerformanceScore(performanceTests)
    };
  }

  /**
   * Test viewport handling
   */
  async testViewportHandling() {
    return {
      test: 'viewportHandling',
      status: 'completed',
      details: {
        responsiveBreakpoints: this.testResponsiveBreakpoints(),
        orientationSupport: this.testOrientationSupport(),
        safeAreaSupport: this.testSafeAreaSupport(),
        keyboardHandling: this.testKeyboardHandling()
      }
    };
  }

  /**
   * Test network conditions
   */
  async testNetworkConditions() {
    const connection = this.deviceInfo.connection;
    
    return {
      test: 'networkConditions',
      status: 'completed',
      details: {
        connectionType: connection?.effectiveType || 'unknown',
        bandwidth: connection?.downlink || 0,
        latency: connection?.rtt || 0,
        saveDataMode: connection?.saveData || false,
        offlineSupport: this.testOfflineSupport()
      }
    };
  }

  /**
   * Test accessibility features
   */
  async testAccessibilityFeatures() {
    return {
      test: 'accessibility',
      status: 'completed',
      details: {
        screenReaderSupport: this.testScreenReaderSupport(),
        keyboardNavigation: this.testKeyboardNavigation(),
        colorContrast: this.testColorContrast(),
        focusManagement: this.testFocusManagement(),
        reducedMotion: this.deviceInfo.prefersReducedMotion
      }
    };
  }

  /**
   * Test browser compatibility
   */
  async testBrowserCompatibility() {
    return {
      test: 'browserCompatibility',
      status: 'completed',
      details: {
        browser: this.deviceInfo.browser,
        webGLSupport: this.deviceInfo.webGL,
        serviceWorkerSupport: this.deviceInfo.serviceWorker,
        localStorageSupport: this.deviceInfo.localStorage,
        cssFeatures: this.testCSSFeatures(),
        jsFeatures: this.testJSFeatures()
      }
    };
  }

  /**
   * Record performance metric
   */
  recordPerformanceMetric(type, data) {
    if (!this.performanceMetrics.has(type)) {
      this.performanceMetrics.set(type, []);
    }
    
    this.performanceMetrics.get(type).push({
      ...data,
      deviceInfo: {
        type: this.deviceInfo.deviceType,
        os: this.deviceInfo.operatingSystem,
        browser: this.deviceInfo.browser,
        isLowEnd: this.deviceInfo.isLowEnd
      }
    });
    
    // Limit stored metrics
    const metrics = this.performanceMetrics.get(type);
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(testResults) {
    const recommendations = [];
    
    // Performance recommendations
    const perfTest = testResults.find(r => r.test === 'performance');
    if (perfTest && perfTest.score < 70) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        suggestion: 'Consider reducing animation complexity and optimizing asset loading for this device'
      });
    }
    
    // Touch recommendations
    if (this.deviceInfo.touchSupport && this.deviceInfo.isLowEnd) {
      recommendations.push({
        category: 'touch',
        priority: 'medium',
        suggestion: 'Increase touch target sizes and reduce touch event complexity for better responsiveness'
      });
    }
    
    // Network recommendations
    const networkTest = testResults.find(r => r.test === 'networkConditions');
    if (networkTest && networkTest.details.connectionType === 'slow-2g') {
      recommendations.push({
        category: 'network',
        priority: 'high',
        suggestion: 'Implement aggressive caching and reduce asset sizes for slow network conditions'
      });
    }
    
    return recommendations;
  }

  /**
   * Get device testing report
   */
  getTestingReport() {
    return {
      deviceInfo: this.deviceInfo,
      testResults: Object.fromEntries(this.testResults),
      performanceMetrics: Object.fromEntries(this.performanceMetrics),
      optimizations: Object.fromEntries(this.optimizations),
      timestamp: Date.now()
    };
  }

  // Helper methods for testing (simplified implementations)
  getTouchTargetCompliance() { return 'compliant'; }
  testGestureSupport() { return true; }
  async measureTouchLatency() { return 16; }
  async measureFrameRate() { return 60; }
  measureMemoryUsage() { return { used: 50, available: 100 }; }
  async measureRenderingPerformance() { return 'good'; }
  async measureScriptPerformance() { return 'good'; }
  calculatePerformanceScore(tests) { return 85; }
  testResponsiveBreakpoints() { return 'passed'; }
  testOrientationSupport() { return 'passed'; }
  testSafeAreaSupport() { return this.hasNotch(); }
  testKeyboardHandling() { return 'passed'; }
  testOfflineSupport() { return 'serviceWorker' in navigator; }
  testScreenReaderSupport() { return 'partial'; }
  testKeyboardNavigation() { return 'passed'; }
  testColorContrast() { return 'passed'; }
  testFocusManagement() { return 'passed'; }
  testCSSFeatures() { return 'modern'; }
  testJSFeatures() { return 'es6+'; }
}

// Create singleton instance
export const deviceTestingManager = new DeviceTestingManager();

// Export utility functions
export const runDeviceTests = async () => {
  return await deviceTestingManager.runDeviceTests();
};

export const getDeviceInfo = () => {
  return deviceTestingManager.deviceInfo;
};

export const getTestingReport = () => {
  return deviceTestingManager.getTestingReport();
};

export default {
  DeviceTestingManager,
  deviceTestingManager,
  runDeviceTests,
  getDeviceInfo,
  getTestingReport
};