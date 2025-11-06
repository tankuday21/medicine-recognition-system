// Test runner for mobile responsiveness validation

import responsiveTestSuite from './responsiveTest';
import visualTestSuite from './visualTest';
import performanceMonitor from './performanceMonitor';

class MobileTestRunner {
  constructor() {
    this.results = {
      responsive: null,
      visual: null,
      performance: null,
      overall: null
    };
    this.isRunning = false;
  }

  // Run all mobile tests
  async runAllTests(options = {}) {
    if (this.isRunning) {
      console.warn('Tests are already running');
      return this.results;
    }

    this.isRunning = true;
    console.log('[INFO] Starting comprehensive mobile testing...');

    try {
      // Run responsive tests
      console.log('[INFO] Running responsive tests...');
      this.results.responsive = await responsiveTestSuite.runAllTests();

      // Run visual tests if enabled
      if (options.includeVisual !== false) {
        console.log('[INFO] Running visual tests...');
        const screenshots = await visualTestSuite.testResponsiveBreakpoints();
        this.results.visual = visualTestSuite.generateVisualReport();
      }

      // Run performance tests
      console.log('[INFO] Running performance tests...');
      performanceMonitor.measurePageLoad();
      performanceMonitor.measureCoreWebVitals();
      performanceMonitor.measureMemoryUsage();
      
      // Wait for performance metrics to be collected
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.results.performance = performanceMonitor.generateReport();

      // Calculate overall score
      this.results.overall = this.calculateOverallScore();

      console.log('[SUCCESS] All tests completed');
      this.logSummary();

      return this.results;
    } catch (error) {
      console.error('[ERROR] Test execution failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  // Run quick validation (responsive tests only)
  async runQuickValidation() {
    console.log('[INFO] Running quick mobile validation...');
    
    const results = await responsiveTestSuite.runAllTests();
    
    // Quick performance check
    const memory = performanceMonitor.measureMemoryUsage();
    const deviceInfo = performanceMonitor.getDeviceInfo();
    
    const quickResults = {
      responsive: results,
      performance: { memory, deviceInfo },
      timestamp: new Date().toISOString()
    };

    this.logQuickSummary(quickResults);
    return quickResults;
  }

  // Calculate overall mobile score
  calculateOverallScore() {
    let totalScore = 0;
    let weights = 0;

    // Responsive score (40% weight)
    if (this.results.responsive) {
      totalScore += this.results.responsive.summary.score * 0.4;
      weights += 0.4;
    }

    // Performance score (40% weight)
    if (this.results.performance) {
      const perfScore = this.calculatePerformanceScore(this.results.performance);
      totalScore += perfScore * 0.4;
      weights += 0.4;
    }

    // Visual score (20% weight)
    if (this.results.visual) {
      const visualScore = this.calculateVisualScore(this.results.visual);
      totalScore += visualScore * 0.2;
      weights += 0.2;
    }

    const overallScore = weights > 0 ? Math.round(totalScore / weights) : 0;

    return {
      score: overallScore,
      breakdown: {
        responsive: this.results.responsive?.summary.score || 0,
        performance: this.results.performance ? this.calculatePerformanceScore(this.results.performance) : 0,
        visual: this.results.visual ? this.calculateVisualScore(this.results.visual) : 0
      },
      grade: this.getGrade(overallScore),
      recommendations: this.generateOverallRecommendations()
    };
  }

  // Calculate performance score from metrics
  calculatePerformanceScore(performanceData) {
    let score = 100;
    const metrics = performanceData.metrics;

    // LCP scoring
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 30;
      else if (metrics.lcp > 2500) score -= 15;
    }

    // FID scoring
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 25;
      else if (metrics.fid > 100) score -= 10;
    }

    // CLS scoring
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 20;
      else if (metrics.cls > 0.1) score -= 10;
    }

    // Memory usage scoring
    if (metrics.memory) {
      const memoryUsage = metrics.memory.used / metrics.memory.limit;
      if (memoryUsage > 0.8) score -= 15;
      else if (memoryUsage > 0.6) score -= 5;
    }

    // FPS scoring
    if (metrics.fps) {
      if (metrics.fps < 30) score -= 20;
      else if (metrics.fps < 50) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  // Calculate visual score from visual tests
  calculateVisualScore(visualData) {
    if (!visualData.comparisons || visualData.comparisons.length === 0) {
      return visualData.screenshots.length > 0 ? 80 : 0; // Base score for having screenshots
    }

    const passedComparisons = visualData.summary.passedComparisons;
    const totalComparisons = visualData.summary.totalComparisons;
    
    return Math.round((passedComparisons / totalComparisons) * 100);
  }

  // Get letter grade from score
  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // Generate overall recommendations
  generateOverallRecommendations() {
    const recommendations = [];

    if (this.results.responsive) {
      recommendations.push(...this.results.responsive.recommendations);
    }

    if (this.results.performance) {
      recommendations.push(...this.results.performance.recommendations);
    }

    // Add mobile-specific recommendations
    const deviceInfo = this.results.performance?.device;
    if (deviceInfo) {
      if (deviceInfo.connection?.effectiveType === '2g' || deviceInfo.connection?.effectiveType === '3g') {
        recommendations.push('Optimize for slow network connections detected');
      }
      
      if (deviceInfo.pixelRatio > 2) {
        recommendations.push('Optimize images for high-DPI displays');
      }
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  // Log comprehensive summary
  logSummary() {
    if (!this.results.overall) return;

    console.group('[INFO] Mobile Test Summary');
    console.log(`Overall Score: ${this.results.overall.score}/100 (Grade: ${this.results.overall.grade})`);
    
    console.group('[INFO] Score Breakdown');
    Object.entries(this.results.overall.breakdown).forEach(([category, score]) => {
      console.log(`${category}: ${score}/100`);
    });
    console.groupEnd();

    if (this.results.overall.recommendations.length > 0) {
      console.group('[INFO] Recommendations');
      this.results.overall.recommendations.forEach(rec => {
        console.log(`• ${rec}`);
      });
      console.groupEnd();
    }

    console.groupEnd();
  }

  // Log quick summary
  logQuickSummary(results) {
    console.group('[INFO] Quick Mobile Validation');
    console.log(`Responsive Score: ${results.responsive.summary.score}/100`);
    console.log(`Tests: ${results.responsive.summary.passed}/${results.responsive.summary.totalTests} passed`);
    
    if (results.performance.memory) {
      const memUsage = Math.round(results.performance.memory.used / 1048576);
      console.log(`Memory Usage: ${memUsage}MB`);
    }

    if (results.responsive.summary.failed > 0) {
      console.group('[ERROR] Failed Tests');
      results.responsive.results
        .filter(test => !test.passed)
        .forEach(test => console.log(`• ${test.test}: ${test.message}`));
      console.groupEnd();
    }

    console.groupEnd();
  }

  // Export results to file
  exportResults(filename) {
    const exportData = {
      ...this.results,
      exportedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `mobile-test-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`[INFO] Results exported to ${a.download}`);
  }

  // Clear all results
  clearResults() {
    this.results = {
      responsive: null,
      visual: null,
      performance: null,
      overall: null
    };
    console.log('[INFO] Test results cleared');
  }

  // Get current results
  getResults() {
    return this.results;
  }

  // Check if tests are running
  getIsRunning() {
    return this.isRunning;
  }
}

// Create singleton instance
const mobileTestRunner = new MobileTestRunner();

// Auto-run quick validation in development
if (process.env.NODE_ENV === 'development') {
  // Run quick validation after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      mobileTestRunner.runQuickValidation();
    }, 3000);
  });
}

// Global access for debugging
if (typeof window !== 'undefined') {
  window.mobileTestRunner = mobileTestRunner;
}

export default mobileTestRunner;