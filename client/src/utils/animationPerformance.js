// Animation Performance Testing Utilities
// Tools for monitoring and optimizing animation performance

/**
 * Performance Monitor Class
 * Monitors animation performance and provides optimization recommendations
 */
class AnimationPerformanceMonitor {
  constructor(config = {}) {
    this.config = {
      targetFPS: 60,
      warningThreshold: 45,
      criticalThreshold: 30,
      sampleSize: 100,
      enableLogging: process.env.NODE_ENV === 'development',
      enableAutoOptimization: true,
      ...config
    };

    this.frameData = [];
    this.isMonitoring = false;
    this.animationId = null;
    this.lastFrameTime = performance.now();
    this.performanceMetrics = {
      averageFPS: 60,
      minFPS: 60,
      maxFPS: 60,
      frameDrops: 0,
      jankEvents: 0,
      totalFrames: 0
    };

    this.observers = [];
    this.setupPerformanceObserver();
  }

  /**
   * Start monitoring animation performance
   */
  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameData = [];
    this.lastFrameTime = performance.now();
    this.performanceMetrics = {
      averageFPS: 60,
      minFPS: 60,
      maxFPS: 60,
      frameDrops: 0,
      jankEvents: 0,
      totalFrames: 0
    };

    this.measureFrame();

    if (this.config.enableLogging) {
      console.log('Animation performance monitoring started');
    }
  }

  /**
   * Stop monitoring animation performance
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.calculateMetrics();

    if (this.config.enableLogging) {
      console.log('Animation performance monitoring stopped');
      this.logPerformanceReport();
    }

    return this.getPerformanceReport();
  }

  /**
   * Measure frame performance
   */
  measureFrame() {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const frameDuration = currentTime - this.lastFrameTime;
    const fps = 1000 / frameDuration;

    this.frameData.push({
      timestamp: currentTime,
      duration: frameDuration,
      fps: fps
    });

    // Keep only recent frames
    if (this.frameData.length > this.config.sampleSize) {
      this.frameData.shift();
    }

    // Detect frame drops and jank
    if (fps < this.config.warningThreshold) {
      this.performanceMetrics.frameDrops++;
    }

    if (frameDuration > 16.67 * 2) { // More than 2 frames worth of time
      this.performanceMetrics.jankEvents++;
    }

    this.performanceMetrics.totalFrames++;
    this.lastFrameTime = currentTime;

    // Continue monitoring
    this.animationId = requestAnimationFrame(() => this.measureFrame());
  }

  /**
   * Calculate performance metrics
   */
  calculateMetrics() {
    if (this.frameData.length === 0) return;

    const fpsList = this.frameData.map(frame => frame.fps);
    const sum = fpsList.reduce((a, b) => a + b, 0);

    this.performanceMetrics.averageFPS = sum / fpsList.length;
    this.performanceMetrics.minFPS = Math.min(...fpsList);
    this.performanceMetrics.maxFPS = Math.max(...fpsList);
  }

  /**
   * Get current performance report
   */
  getPerformanceReport() {
    this.calculateMetrics();

    const report = {
      ...this.performanceMetrics,
      performanceLevel: this.getPerformanceLevel(),
      recommendations: this.getOptimizationRecommendations(),
      deviceInfo: this.getDeviceInfo(),
      timestamp: Date.now()
    };

    return report;
  }

  /**
   * Determine performance level
   */
  getPerformanceLevel() {
    const avgFPS = this.performanceMetrics.averageFPS;
    
    if (avgFPS >= this.config.targetFPS * 0.9) {
      return 'excellent';
    } else if (avgFPS >= this.config.warningThreshold) {
      return 'good';
    } else if (avgFPS >= this.config.criticalThreshold) {
      return 'poor';
    } else {
      return 'critical';
    }
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations() {
    const recommendations = [];
    const avgFPS = this.performanceMetrics.averageFPS;
    const jankRate = this.performanceMetrics.jankEvents / this.performanceMetrics.totalFrames;

    if (avgFPS < this.config.warningThreshold) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: 'Average FPS is below target. Consider reducing animation complexity.',
        actions: [
          'Reduce number of simultaneous animations',
          'Use transform and opacity properties for animations',
          'Enable hardware acceleration with will-change CSS property',
          'Consider using requestAnimationFrame for custom animations'
        ]
      });
    }

    if (jankRate > 0.1) {
      recommendations.push({
        type: 'jank',
        severity: 'medium',
        message: 'High jank rate detected. Animations may appear stuttery.',
        actions: [
          'Avoid animating layout properties (width, height, top, left)',
          'Use CSS transforms instead of changing position',
          'Reduce animation duration or ease complexity',
          'Check for expensive operations during animations'
        ]
      });
    }

    if (this.performanceMetrics.frameDrops > this.performanceMetrics.totalFrames * 0.2) {
      recommendations.push({
        type: 'frame-drops',
        severity: 'high',
        message: 'Frequent frame drops detected.',
        actions: [
          'Reduce animation complexity',
          'Use CSS animations instead of JavaScript animations',
          'Implement animation performance budgets',
          'Consider disabling animations on low-end devices'
        ]
      });
    }

    // Device-specific recommendations
    const deviceInfo = this.getDeviceInfo();
    if (deviceInfo.isMobile && avgFPS < 45) {
      recommendations.push({
        type: 'mobile-optimization',
        severity: 'medium',
        message: 'Poor performance on mobile device detected.',
        actions: [
          'Implement reduced motion preferences',
          'Use simpler animations on mobile',
          'Consider touch-specific optimizations',
          'Test on actual mobile devices'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Get device information
   */
  getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isLowEnd = navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2;

    return {
      userAgent,
      isMobile,
      isLowEnd,
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      deviceMemory: navigator.deviceMemory || 'unknown',
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    };
  }

  /**
   * Setup Performance Observer for additional metrics
   */
  setupPerformanceObserver() {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      // Observe long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            this.performanceMetrics.jankEvents++;
            
            if (this.config.enableLogging) {
              console.warn(`Long task detected: ${entry.duration}ms`, entry);
            }
          }
        }
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);

      // Observe layout shifts
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.value > 0.1) { // Significant layout shift
            if (this.config.enableLogging) {
              console.warn(`Layout shift detected: ${entry.value}`, entry);
            }
          }
        }
      });

      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(layoutShiftObserver);

    } catch (error) {
      console.warn('Performance Observer setup failed:', error);
    }
  }

  /**
   * Log performance report to console
   */
  logPerformanceReport() {
    const report = this.getPerformanceReport();
    
    console.group('[INFO] Animation Performance Report');
    console.log(`Performance Level: ${report.performanceLevel.toUpperCase()}`);
    console.log(`Average FPS: ${report.averageFPS.toFixed(2)}`);
    console.log(`Min FPS: ${report.minFPS.toFixed(2)}`);
    console.log(`Max FPS: ${report.maxFPS.toFixed(2)}`);
    console.log(`Frame Drops: ${report.frameDrops}`);
    console.log(`Jank Events: ${report.jankEvents}`);
    console.log(`Total Frames: ${report.totalFrames}`);
    
    if (report.recommendations.length > 0) {
      console.group('[INFO] Recommendations');
      report.recommendations.forEach((rec, index) => {
        console.group(`${index + 1}. ${rec.message}`);
        rec.actions.forEach(action => console.log(`• ${action}`));
        console.groupEnd();
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  /**
   * Cleanup observers
   */
  destroy() {
    this.stopMonitoring();
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Animation Performance Tester
 * Automated testing for animation performance
 */
export class AnimationPerformanceTester {
  constructor() {
    this.monitor = new AnimationPerformanceMonitor();
    this.testResults = [];
  }

  /**
   * Test animation performance
   */
  async testAnimation(animationFn, options = {}) {
    const {
      duration = 1000,
      name = 'Animation Test',
      iterations = 1
    } = options;

    const results = [];

    for (let i = 0; i < iterations; i++) {
      this.monitor.startMonitoring();
      
      // Run animation
      await new Promise(resolve => {
        animationFn();
        setTimeout(resolve, duration);
      });
      
      const report = this.monitor.stopMonitoring();
      report.testName = `${name} - Iteration ${i + 1}`;
      results.push(report);
    }

    const aggregatedResult = this.aggregateResults(results, name);
    this.testResults.push(aggregatedResult);
    
    return aggregatedResult;
  }

  /**
   * Test multiple animations
   */
  async testAnimationSuite(animations) {
    const suiteResults = [];

    for (const animation of animations) {
      const result = await this.testAnimation(
        animation.fn,
        {
          name: animation.name,
          duration: animation.duration || 1000,
          iterations: animation.iterations || 1
        }
      );
      suiteResults.push(result);
    }

    return {
      suite: 'Animation Performance Suite',
      timestamp: Date.now(),
      results: suiteResults,
      summary: this.generateSuiteSummary(suiteResults)
    };
  }

  /**
   * Aggregate test results
   */
  aggregateResults(results, testName) {
    if (results.length === 1) {
      return { ...results[0], testName };
    }

    const avgFPS = results.reduce((sum, r) => sum + r.averageFPS, 0) / results.length;
    const minFPS = Math.min(...results.map(r => r.minFPS));
    const maxFPS = Math.max(...results.map(r => r.maxFPS));
    const totalFrameDrops = results.reduce((sum, r) => sum + r.frameDrops, 0);
    const totalJankEvents = results.reduce((sum, r) => sum + r.jankEvents, 0);

    return {
      testName,
      iterations: results.length,
      averageFPS: avgFPS,
      minFPS,
      maxFPS,
      frameDrops: totalFrameDrops,
      jankEvents: totalJankEvents,
      performanceLevel: this.getPerformanceLevel(avgFPS),
      recommendations: results[0].recommendations, // Use first result's recommendations
      timestamp: Date.now()
    };
  }

  /**
   * Generate suite summary
   */
  generateSuiteSummary(results) {
    const avgFPS = results.reduce((sum, r) => sum + r.averageFPS, 0) / results.length;
    const worstPerformer = results.reduce((worst, current) => 
      current.averageFPS < worst.averageFPS ? current : worst
    );
    const bestPerformer = results.reduce((best, current) => 
      current.averageFPS > best.averageFPS ? current : best
    );

    return {
      overallAverageFPS: avgFPS,
      worstPerformer: worstPerformer.testName,
      bestPerformer: bestPerformer.testName,
      totalTests: results.length,
      passedTests: results.filter(r => r.performanceLevel === 'excellent' || r.performanceLevel === 'good').length
    };
  }

  /**
   * Get performance level from FPS
   */
  getPerformanceLevel(fps) {
    if (fps >= 54) return 'excellent';
    if (fps >= 45) return 'good';
    if (fps >= 30) return 'poor';
    return 'critical';
  }

  /**
   * Export test results
   */
  exportResults(format = 'json') {
    const data = {
      timestamp: Date.now(),
      testResults: this.testResults,
      deviceInfo: this.monitor.getDeviceInfo()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return data;
  }

  /**
   * Convert results to CSV format
   */
  convertToCSV(data) {
    const headers = ['Test Name', 'Average FPS', 'Min FPS', 'Max FPS', 'Frame Drops', 'Jank Events', 'Performance Level'];
    const rows = data.testResults.map(result => [
      result.testName,
      result.averageFPS.toFixed(2),
      result.minFPS.toFixed(2),
      result.maxFPS.toFixed(2),
      result.frameDrops,
      result.jankEvents,
      result.performanceLevel
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

/**
 * Reduced Motion Detection
 * Detects user's reduced motion preference
 */
export const detectReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
};

/**
 * Device Performance Classification
 * Classifies device performance level
 */
export const classifyDevicePerformance = () => {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }

  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const deviceMemory = navigator.deviceMemory || 4;
  const connection = navigator.connection;

  let score = 0;

  // CPU score
  if (hardwareConcurrency >= 8) score += 3;
  else if (hardwareConcurrency >= 4) score += 2;
  else score += 1;

  // Memory score
  if (deviceMemory >= 8) score += 3;
  else if (deviceMemory >= 4) score += 2;
  else score += 1;

  // Connection score
  if (connection) {
    if (connection.effectiveType === '4g') score += 2;
    else if (connection.effectiveType === '3g') score += 1;
  } else {
    score += 2; // Assume good connection if unknown
  }

  // Device type penalty
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) score -= 1;

  // Classify performance
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
};

/**
 * Animation Budget Calculator
 * Calculates animation budget based on device performance
 */
export const calculateAnimationBudget = (performanceLevel = 'medium') => {
  const budgets = {
    high: {
      maxSimultaneousAnimations: 10,
      maxAnimationDuration: 1000,
      allowComplexEasing: true,
      allowTransforms3D: true,
      allowFilters: true,
      targetFPS: 60
    },
    medium: {
      maxSimultaneousAnimations: 5,
      maxAnimationDuration: 800,
      allowComplexEasing: true,
      allowTransforms3D: true,
      allowFilters: false,
      targetFPS: 60
    },
    low: {
      maxSimultaneousAnimations: 2,
      maxAnimationDuration: 500,
      allowComplexEasing: false,
      allowTransforms3D: false,
      allowFilters: false,
      targetFPS: 30
    }
  };

  return budgets[performanceLevel] || budgets.medium;
};

// Create singleton monitor instance
export const performanceMonitor = new AnimationPerformanceMonitor();

// Export utilities
export {
  AnimationPerformanceMonitor,
  AnimationPerformanceTester
};

export default performanceMonitor;