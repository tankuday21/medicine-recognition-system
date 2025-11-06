// Cross-Device Testing Utilities
// Comprehensive testing framework for cross-device compatibility

/**
 * Cross-Device Test Manager
 * Manages testing across different device profiles and capabilities
 */
export class CrossDeviceTestManager {
  constructor() {
    this.deviceProfiles = new Map();
    this.testResults = new Map();
    this.currentTests = new Set();
    this.initializeDeviceProfiles();
  }

  /**
   * Initialize standard device profiles for testing
   */
  initializeDeviceProfiles() {
    const profiles = [
      // Mobile Devices
      {
        id: 'iphone-se',
        name: 'iPhone SE',
        category: 'mobile',
        viewport: { width: 375, height: 667 },
        pixelRatio: 2,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        capabilities: {
          touch: true,
          hover: false,
          orientation: true,
          vibration: true,
          geolocation: true,
          camera: true,
          microphone: true
        },
        performance: {
          cpu: 'low-mid',
          memory: 'limited',
          network: 'variable'
        }
      },
      {
        id: 'iphone-12',
        name: 'iPhone 12',
        category: 'mobile',
        viewport: { width: 390, height: 844 },
        pixelRatio: 3,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        capabilities: {
          touch: true,
          hover: false,
          orientation: true,
          vibration: true,
          geolocation: true,
          camera: true,
          microphone: true
        },
        performance: {
          cpu: 'high',
          memory: 'good',
          network: 'good'
        }
      },
      {
        id: 'samsung-s21',
        name: 'Samsung Galaxy S21',
        category: 'mobile',
        viewport: { width: 360, height: 800 },
        pixelRatio: 3,
        userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
        capabilities: {
          touch: true,
          hover: false,
          orientation: true,
          vibration: true,
          geolocation: true,
          camera: true,
          microphone: true
        },
        performance: {
          cpu: 'high',
          memory: 'good',
          network: 'good'
        }
      },
      {
        id: 'pixel-5',
        name: 'Google Pixel 5',
        category: 'mobile',
        viewport: { width: 393, height: 851 },
        pixelRatio: 2.75,
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36',
        capabilities: {
          touch: true,
          hover: false,
          orientation: true,
          vibration: true,
          geolocation: true,
          camera: true,
          microphone: true
        },
        performance: {
          cpu: 'mid-high',
          memory: 'good',
          network: 'good'
        }
      },
      // Tablet Devices
      {
        id: 'ipad',
        name: 'iPad',
        category: 'tablet',
        viewport: { width: 768, height: 1024 },
        pixelRatio: 2,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        capabilities: {
          touch: true,
          hover: false,
          orientation: true,
          vibration: false,
          geolocation: true,
          camera: true,
          microphone: true
        },
        performance: {
          cpu: 'high',
          memory: 'excellent',
          network: 'good'
        }
      },
      {
        id: 'ipad-pro',
        name: 'iPad Pro',
        category: 'tablet',
        viewport: { width: 1024, height: 1366 },
        pixelRatio: 2,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        capabilities: {
          touch: true,
          hover: false,
          orientation: true,
          vibration: false,
          geolocation: true,
          camera: true,
          microphone: true
        },
        performance: {
          cpu: 'excellent',
          memory: 'excellent',
          network: 'excellent'
        }
      },
      // Desktop Devices
      {
        id: 'desktop-1080p',
        name: 'Desktop 1080p',
        category: 'desktop',
        viewport: { width: 1920, height: 1080 },
        pixelRatio: 1,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        capabilities: {
          touch: false,
          hover: true,
          orientation: false,
          vibration: false,
          geolocation: true,
          camera: true,
          microphone: true
        },
        performance: {
          cpu: 'excellent',
          memory: 'excellent',
          network: 'excellent'
        }
      },
      {
        id: 'desktop-4k',
        name: 'Desktop 4K',
        category: 'desktop',
        viewport: { width: 3840, height: 2160 },
        pixelRatio: 2,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        capabilities: {
          touch: false,
          hover: true,
          orientation: false,
          vibration: false,
          geolocation: true,
          camera: true,
          microphone: true
        },
        performance: {
          cpu: 'excellent',
          memory: 'excellent',
          network: 'excellent'
        }
      }
    ];

    profiles.forEach(profile => {
      this.deviceProfiles.set(profile.id, profile);
    });
  }

  /**
   * Run comprehensive cross-device tests
   */
  async runCrossDeviceTests(testConfig = {}) {
    const {
      devices = Array.from(this.deviceProfiles.keys()),
      testSuites = ['layout', 'interaction', 'performance', 'accessibility'],
      parallel = false
    } = testConfig;

    const results = new Map();

    if (parallel) {
      // Run tests in parallel for faster execution
      const testPromises = devices.map(deviceId => 
        this.testDevice(deviceId, testSuites)
      );
      const parallelResults = await Promise.all(testPromises);
      
      devices.forEach((deviceId, index) => {
        results.set(deviceId, parallelResults[index]);
      });
    } else {
      // Run tests sequentially for more accurate results
      for (const deviceId of devices) {
        const deviceResult = await this.testDevice(deviceId, testSuites);
        results.set(deviceId, deviceResult);
      }
    }

    this.testResults = results;
    return this.generateTestReport();
  }

  /**
   * Test a specific device profile
   */
  async testDevice(deviceId, testSuites) {
    const profile = this.deviceProfiles.get(deviceId);
    if (!profile) {
      throw new Error(`Device profile not found: ${deviceId}`);
    }

    this.currentTests.add(deviceId);
    
    const deviceResults = {
      device: profile,
      timestamp: new Date().toISOString(),
      testSuites: {},
      overallScore: 0,
      issues: [],
      recommendations: []
    };

    try {
      // Simulate device environment
      await this.simulateDeviceEnvironment(profile);

      // Run each test suite
      for (const suite of testSuites) {
        const suiteResult = await this.runTestSuite(suite, profile);
        deviceResults.testSuites[suite] = suiteResult;
      }

      // Calculate overall score
      deviceResults.overallScore = this.calculateOverallScore(deviceResults.testSuites);
      
      // Generate recommendations
      deviceResults.recommendations = this.generateRecommendations(profile, deviceResults);

    } catch (error) {
      deviceResults.error = error.message;
      deviceResults.overallScore = 0;
    } finally {
      this.currentTests.delete(deviceId);
    }

    return deviceResults;
  }

  /**
   * Simulate device environment for testing
   */
  async simulateDeviceEnvironment(profile) {
    // Simulate viewport changes
    if (typeof window !== 'undefined') {
      // In a real implementation, this would use tools like Puppeteer
      // to actually change the viewport. Here we simulate the effect.
      const mockViewport = {
        width: profile.viewport.width,
        height: profile.viewport.height,
        pixelRatio: profile.pixelRatio
      };
      
      // Store original values
      const original = {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      };

      // Mock the viewport (in real testing, this would be actual viewport changes)
      Object.defineProperty(window, 'innerWidth', { value: mockViewport.width, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: mockViewport.height, configurable: true });
      Object.defineProperty(window, 'devicePixelRatio', { value: mockViewport.pixelRatio, configurable: true });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));

      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Run a specific test suite
   */
  async runTestSuite(suiteName, profile) {
    switch (suiteName) {
      case 'layout':
        return await this.testLayout(profile);
      case 'interaction':
        return await this.testInteraction(profile);
      case 'performance':
        return await this.testPerformance(profile);
      case 'accessibility':
        return await this.testAccessibility(profile);
      default:
        throw new Error(`Unknown test suite: ${suiteName}`);
    }
  }

  /**
   * Test layout responsiveness
   */
  async testLayout(profile) {
    const results = {
      score: 0,
      tests: {},
      issues: []
    };

    // Test responsive breakpoints
    results.tests.breakpoints = this.testBreakpoints(profile);
    
    // Test element visibility
    results.tests.visibility = this.testElementVisibility(profile);
    
    // Test text readability
    results.tests.readability = this.testTextReadability(profile);
    
    // Test image scaling
    results.tests.imageScaling = this.testImageScaling(profile);

    // Calculate layout score
    const testScores = Object.values(results.tests).map(test => test.score);
    results.score = testScores.reduce((sum, score) => sum + score, 0) / testScores.length;

    return results;
  }

  /**
   * Test user interactions
   */
  async testInteraction(profile) {
    const results = {
      score: 0,
      tests: {},
      issues: []
    };

    // Test touch targets (for touch devices)
    if (profile.capabilities.touch) {
      results.tests.touchTargets = this.testTouchTargets(profile);
    }

    // Test hover states (for hover-capable devices)
    if (profile.capabilities.hover) {
      results.tests.hoverStates = this.testHoverStates(profile);
    }

    // Test gesture support
    results.tests.gestures = this.testGestureSupport(profile);

    // Test keyboard navigation
    results.tests.keyboardNav = this.testKeyboardNavigation(profile);

    // Calculate interaction score
    const testScores = Object.values(results.tests).map(test => test.score);
    results.score = testScores.length > 0 ? testScores.reduce((sum, score) => sum + score, 0) / testScores.length : 0;

    return results;
  }

  /**
   * Test performance characteristics
   */
  async testPerformance(profile) {
    const results = {
      score: 0,
      tests: {},
      issues: []
    };

    // Test load performance
    results.tests.loadTime = this.testLoadTime(profile);
    
    // Test memory usage
    results.tests.memoryUsage = this.testMemoryUsage(profile);
    
    // Test animation performance
    results.tests.animationPerf = this.testAnimationPerformance(profile);
    
    // Test network efficiency
    results.tests.networkEfficiency = this.testNetworkEfficiency(profile);

    // Calculate performance score based on device capabilities
    const testScores = Object.values(results.tests).map(test => test.score);
    results.score = testScores.reduce((sum, score) => sum + score, 0) / testScores.length;

    return results;
  }

  /**
   * Test accessibility features
   */
  async testAccessibility(profile) {
    const results = {
      score: 0,
      tests: {},
      issues: []
    };

    // Test screen reader compatibility
    results.tests.screenReader = this.testScreenReaderCompat(profile);
    
    // Test keyboard accessibility
    results.tests.keyboardAccess = this.testKeyboardAccessibility(profile);
    
    // Test color contrast
    results.tests.colorContrast = this.testColorContrast(profile);
    
    // Test text scaling
    results.tests.textScaling = this.testTextScaling(profile);

    // Calculate accessibility score
    const testScores = Object.values(results.tests).map(test => test.score);
    results.score = testScores.reduce((sum, score) => sum + score, 0) / testScores.length;

    return results;
  }

  // Individual test implementations
  testBreakpoints(profile) {
    const { width } = profile.viewport;
    let score = 100;
    const issues = [];

    // Check if layout adapts to viewport width
    const breakpoints = [
      { name: 'mobile', max: 767 },
      { name: 'tablet', min: 768, max: 1023 },
      { name: 'desktop', min: 1024 }
    ];

    const currentBreakpoint = breakpoints.find(bp => 
      (!bp.min || width >= bp.min) && (!bp.max || width <= bp.max)
    );

    if (!currentBreakpoint) {
      score -= 20;
      issues.push('Viewport width not covered by responsive breakpoints');
    }

    return { score, issues, breakpoint: currentBreakpoint?.name };
  }

  testElementVisibility(profile) {
    let score = 100;
    const issues = [];

    // Check for elements that might be hidden or cut off
    if (typeof document !== 'undefined') {
      const elements = document.querySelectorAll('*');
      let hiddenElements = 0;

      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          hiddenElements++;
        }
      });

      if (hiddenElements > elements.length * 0.1) {
        score -= 30;
        issues.push(`${hiddenElements} elements appear to be hidden or collapsed`);
      }
    }

    return { score, issues };
  }

  testTextReadability(profile) {
    let score = 100;
    const issues = [];

    // Check text size relative to viewport
    const minTextSize = profile.category === 'mobile' ? 16 : 14;
    
    if (typeof document !== 'undefined') {
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
      let smallTextCount = 0;

      textElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const fontSize = parseInt(styles.fontSize);
        
        if (fontSize < minTextSize) {
          smallTextCount++;
        }
      });

      if (smallTextCount > 0) {
        score -= Math.min(50, smallTextCount * 5);
        issues.push(`${smallTextCount} text elements below recommended size (${minTextSize}px)`);
      }
    }

    return { score, issues };
  }

  testImageScaling(profile) {
    let score = 100;
    const issues = [];

    if (typeof document !== 'undefined') {
      const images = document.querySelectorAll('img');
      let scalingIssues = 0;

      images.forEach(img => {
        const rect = img.getBoundingClientRect();
        const naturalRatio = img.naturalWidth / img.naturalHeight;
        const displayRatio = rect.width / rect.height;

        // Check for significant aspect ratio changes
        if (Math.abs(naturalRatio - displayRatio) > 0.1) {
          scalingIssues++;
        }
      });

      if (scalingIssues > 0) {
        score -= Math.min(40, scalingIssues * 10);
        issues.push(`${scalingIssues} images with aspect ratio distortion`);
      }
    }

    return { score, issues };
  }

  testTouchTargets(profile) {
    let score = 100;
    const issues = [];
    const minTouchSize = 44; // 44px minimum touch target size

    if (typeof document !== 'undefined') {
      const touchElements = document.querySelectorAll('button, a, input, [role="button"], [onclick]');
      let smallTargets = 0;

      touchElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width < minTouchSize || rect.height < minTouchSize) {
          smallTargets++;
        }
      });

      if (smallTargets > 0) {
        score -= Math.min(60, smallTargets * 10);
        issues.push(`${smallTargets} touch targets below ${minTouchSize}px minimum`);
      }
    }

    return { score, issues };
  }

  testHoverStates(profile) {
    let score = 100;
    const issues = [];

    // For devices with hover capability, check hover states
    if (typeof document !== 'undefined') {
      const hoverElements = document.querySelectorAll('button, a, [role="button"]');
      let missingHover = 0;

      hoverElements.forEach(el => {
        const styles = window.getComputedStyle(el, ':hover');
        const normalStyles = window.getComputedStyle(el);
        
        // Simple check for hover state differences
        if (styles.backgroundColor === normalStyles.backgroundColor &&
            styles.color === normalStyles.color) {
          missingHover++;
        }
      });

      if (missingHover > hoverElements.length * 0.5) {
        score -= 30;
        issues.push('Many interactive elements lack hover states');
      }
    }

    return { score, issues };
  }

  testGestureSupport(profile) {
    let score = 100;
    const issues = [];

    // Check for gesture-dependent functionality on non-touch devices
    if (!profile.capabilities.touch) {
      // Look for swipe or gesture-only interactions
      if (typeof document !== 'undefined') {
        const gestureElements = document.querySelectorAll('[data-swipe], [data-gesture]');
        if (gestureElements.length > 0) {
          score -= 40;
          issues.push('Gesture-dependent elements found on non-touch device');
        }
      }
    }

    return { score, issues };
  }

  testKeyboardNavigation(profile) {
    let score = 100;
    const issues = [];

    if (typeof document !== 'undefined') {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      let nonFocusable = 0;
      focusableElements.forEach(el => {
        if (el.tabIndex === -1 && !el.disabled) {
          nonFocusable++;
        }
      });

      if (nonFocusable > 0) {
        score -= Math.min(50, nonFocusable * 5);
        issues.push(`${nonFocusable} interactive elements not keyboard accessible`);
      }
    }

    return { score, issues };
  }

  testLoadTime(profile) {
    const loadTime = performance.now();
    let score = 100;
    const issues = [];

    // Adjust expectations based on device performance
    const thresholds = {
      'low-mid': 3000,
      'mid-high': 2000,
      'high': 1500,
      'excellent': 1000
    };

    const threshold = thresholds[profile.performance.cpu] || 2000;

    if (loadTime > threshold) {
      score -= Math.min(60, (loadTime - threshold) / 100);
      issues.push(`Load time (${Math.round(loadTime)}ms) exceeds target for ${profile.performance.cpu} CPU`);
    }

    return { score, issues, loadTime: Math.round(loadTime) };
  }

  testMemoryUsage(profile) {
    let score = 100;
    const issues = [];
    let memoryUsage = 0;

    if (performance.memory) {
      memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      
      // Adjust thresholds based on device memory
      const thresholds = {
        'limited': 50,
        'good': 100,
        'excellent': 200
      };

      const threshold = thresholds[profile.performance.memory] || 100;

      if (memoryUsage > threshold) {
        score -= Math.min(50, (memoryUsage - threshold) / 10);
        issues.push(`Memory usage (${Math.round(memoryUsage)}MB) high for ${profile.performance.memory} memory device`);
      }
    }

    return { score, issues, memoryUsage: Math.round(memoryUsage) };
  }

  testAnimationPerformance(profile) {
    let score = 100;
    const issues = [];

    // Check for performance-intensive animations on low-end devices
    if (profile.performance.cpu === 'low-mid') {
      if (typeof document !== 'undefined') {
        const animatedElements = document.querySelectorAll('[style*="animation"], [class*="animate"]');
        if (animatedElements.length > 5) {
          score -= 30;
          issues.push('Many animations may impact performance on low-end device');
        }
      }
    }

    return { score, issues };
  }

  testNetworkEfficiency(profile) {
    let score = 100;
    const issues = [];

    // Simulate network efficiency based on device profile
    if (profile.performance.network === 'variable') {
      // Check for large resources that might be problematic on slow networks
      score -= 10;
      issues.push('Consider optimizing for variable network conditions');
    }

    return { score, issues };
  }

  testScreenReaderCompat(profile) {
    let score = 100;
    const issues = [];

    if (typeof document !== 'undefined') {
      // Check for ARIA labels and semantic structure
      const elementsNeedingLabels = document.querySelectorAll('button, input, [role="button"]');
      let missingLabels = 0;

      elementsNeedingLabels.forEach(el => {
        if (!el.getAttribute('aria-label') && !el.textContent?.trim() && !el.getAttribute('aria-labelledby')) {
          missingLabels++;
        }
      });

      if (missingLabels > 0) {
        score -= Math.min(50, missingLabels * 5);
        issues.push(`${missingLabels} elements missing accessible labels`);
      }
    }

    return { score, issues };
  }

  testKeyboardAccessibility(profile) {
    let score = 100;
    const issues = [];

    if (typeof document !== 'undefined') {
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
      let inaccessible = 0;

      interactiveElements.forEach(el => {
        if (el.tabIndex === -1 || (el.disabled && !el.getAttribute('aria-disabled'))) {
          inaccessible++;
        }
      });

      if (inaccessible > 0) {
        score -= Math.min(60, inaccessible * 10);
        issues.push(`${inaccessible} interactive elements not keyboard accessible`);
      }
    }

    return { score, issues };
  }

  testColorContrast(profile) {
    let score = 100;
    const issues = [];

    // Simplified contrast check - in real implementation would calculate actual ratios
    if (typeof document !== 'undefined') {
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a');
      let lowContrast = 0;

      textElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        // Simplified check - real implementation would calculate contrast ratio
        if (styles.color === styles.backgroundColor) {
          lowContrast++;
        }
      });

      if (lowContrast > 0) {
        score -= Math.min(40, lowContrast * 5);
        issues.push(`${lowContrast} elements may have insufficient color contrast`);
      }
    }

    return { score, issues };
  }

  testTextScaling(profile) {
    let score = 100;
    const issues = [];

    // Check if text scales properly with zoom
    // This would require actual zoom testing in a real implementation
    return { score, issues };
  }

  /**
   * Calculate overall score from test suite results
   */
  calculateOverallScore(testSuites) {
    const suiteScores = Object.values(testSuites).map(suite => suite.score);
    return suiteScores.length > 0 ? Math.round(suiteScores.reduce((sum, score) => sum + score, 0) / suiteScores.length) : 0;
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations(profile, results) {
    const recommendations = [];

    // Analyze results and generate specific recommendations
    Object.entries(results.testSuites).forEach(([suiteName, suiteResult]) => {
      if (suiteResult.score < 80) {
        switch (suiteName) {
          case 'layout':
            recommendations.push({
              category: 'Layout',
              priority: 'high',
              message: `Improve responsive layout for ${profile.name}`,
              details: suiteResult.issues
            });
            break;
          case 'interaction':
            recommendations.push({
              category: 'Interaction',
              priority: 'high',
              message: `Optimize interactions for ${profile.category} devices`,
              details: suiteResult.issues
            });
            break;
          case 'performance':
            recommendations.push({
              category: 'Performance',
              priority: 'medium',
              message: `Optimize performance for ${profile.performance.cpu} CPU devices`,
              details: suiteResult.issues
            });
            break;
          case 'accessibility':
            recommendations.push({
              category: 'Accessibility',
              priority: 'high',
              message: 'Address accessibility issues',
              details: suiteResult.issues
            });
            break;
        }
      }
    });

    return recommendations;
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    const report = {
      summary: {
        totalDevices: this.testResults.size,
        averageScore: 0,
        passedDevices: 0,
        failedDevices: 0,
        criticalIssues: 0
      },
      deviceResults: Array.from(this.testResults.entries()).map(([deviceId, result]) => ({
        deviceId,
        ...result
      })),
      recommendations: [],
      timestamp: new Date().toISOString()
    };

    // Calculate summary statistics
    let totalScore = 0;
    let criticalIssues = 0;

    this.testResults.forEach(result => {
      totalScore += result.overallScore;
      
      if (result.overallScore >= 70) {
        report.summary.passedDevices++;
      } else {
        report.summary.failedDevices++;
      }

      // Count critical issues
      result.recommendations?.forEach(rec => {
        if (rec.priority === 'high') {
          criticalIssues++;
        }
      });

      // Collect all recommendations
      if (result.recommendations) {
        report.recommendations.push(...result.recommendations);
      }
    });

    report.summary.averageScore = Math.round(totalScore / this.testResults.size);
    report.summary.criticalIssues = criticalIssues;

    return report;
  }

  /**
   * Get device profiles
   */
  getDeviceProfiles() {
    return Array.from(this.deviceProfiles.values());
  }

  /**
   * Get test results
   */
  getTestResults() {
    return this.testResults;
  }

  /**
   * Clear test results
   */
  clearResults() {
    this.testResults.clear();
  }
}

// Create singleton instance
export const crossDeviceTestManager = new CrossDeviceTestManager();

// Utility functions
export const runCrossDeviceTests = async (config) => {
  return await crossDeviceTestManager.runCrossDeviceTests(config);
};

export const getDeviceProfiles = () => {
  return crossDeviceTestManager.getDeviceProfiles();
};

export const getTestResults = () => {
  return crossDeviceTestManager.getTestResults();
};

export default {
  CrossDeviceTestManager,
  crossDeviceTestManager,
  runCrossDeviceTests,
  getDeviceProfiles,
  getTestResults
};