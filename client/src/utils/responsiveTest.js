// Mobile responsiveness testing and validation utilities

class ResponsiveTestSuite {
  constructor() {
    this.testResults = [];
    this.breakpoints = {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    };
    this.currentViewport = this.getCurrentViewport();
  }

  // Get current viewport information
  getCurrentViewport() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      orientation: window.screen?.orientation?.type || 'unknown',
      userAgent: navigator.userAgent,
      isMobile: this.isMobileDevice(),
      isTouch: 'ontouchstart' in window
    };
  }

  // Detect mobile device
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Test horizontal scrolling
  testHorizontalScrolling() {
    const body = document.body;
    const html = document.documentElement;
    
    const documentWidth = Math.max(
      body.scrollWidth,
      body.offsetWidth,
      html.clientWidth,
      html.scrollWidth,
      html.offsetWidth
    );
    
    const viewportWidth = window.innerWidth;
    const hasHorizontalScroll = documentWidth > viewportWidth;
    
    const result = {
      test: 'Horizontal Scrolling',
      passed: !hasHorizontalScroll,
      details: {
        documentWidth,
        viewportWidth,
        overflow: documentWidth - viewportWidth
      },
      message: hasHorizontalScroll 
        ? `Horizontal scroll detected: document is ${documentWidth - viewportWidth}px wider than viewport`
        : 'No horizontal scrolling detected'
    };
    
    this.testResults.push(result);
    return result;
  }

  // Test touch target sizes
  testTouchTargets() {
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])'
    );
    
    const minTouchSize = 44; // 44px minimum recommended by Apple/Google
    const failedElements = [];
    
    interactiveElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);
      
      // Skip hidden elements
      if (rect.width === 0 || rect.height === 0 || computedStyle.display === 'none') {
        return;
      }
      
      const width = Math.max(rect.width, parseFloat(computedStyle.minWidth) || 0);
      const height = Math.max(rect.height, parseFloat(computedStyle.minHeight) || 0);
      
      if (width < minTouchSize || height < minTouchSize) {
        failedElements.push({
          element: element.tagName.toLowerCase(),
          selector: this.getElementSelector(element),
          width: Math.round(width),
          height: Math.round(height),
          text: element.textContent?.trim().substring(0, 50) || ''
        });
      }
    });
    
    const result = {
      test: 'Touch Target Sizes',
      passed: failedElements.length === 0,
      details: {
        totalElements: interactiveElements.length,
        failedElements: failedElements.length,
        minRequiredSize: minTouchSize,
        failures: failedElements
      },
      message: failedElements.length === 0
        ? `All ${interactiveElements.length} interactive elements meet minimum touch target size`
        : `${failedElements.length} elements are smaller than ${minTouchSize}px`
    };
    
    this.testResults.push(result);
    return result;
  }

  // Test text readability
  testTextReadability() {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li, td, th, label');
    const minFontSize = 16; // 16px minimum for mobile
    const smallTextElements = [];
    
    textElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const fontSize = parseFloat(computedStyle.fontSize);
      
      // Skip elements without text content
      if (!element.textContent?.trim()) return;
      
      if (fontSize < minFontSize) {
        smallTextElements.push({
          element: element.tagName.toLowerCase(),
          selector: this.getElementSelector(element),
          fontSize: Math.round(fontSize),
          text: element.textContent.trim().substring(0, 50)
        });
      }
    });
    
    const result = {
      test: 'Text Readability',
      passed: smallTextElements.length === 0,
      details: {
        totalElements: textElements.length,
        smallTextElements: smallTextElements.length,
        minRequiredSize: minFontSize,
        failures: smallTextElements.slice(0, 10) // Limit to first 10
      },
      message: smallTextElements.length === 0
        ? 'All text elements meet minimum font size requirements'
        : `${smallTextElements.length} text elements are smaller than ${minFontSize}px`
    };
    
    this.testResults.push(result);
    return result;
  }

  // Test viewport meta tag
  testViewportMeta() {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const hasViewportMeta = !!viewportMeta;
    const content = viewportMeta?.getAttribute('content') || '';
    
    const requiredProperties = ['width=device-width', 'initial-scale=1'];
    const hasRequiredProperties = requiredProperties.every(prop => 
      content.includes(prop)
    );
    
    const result = {
      test: 'Viewport Meta Tag',
      passed: hasViewportMeta && hasRequiredProperties,
      details: {
        hasViewportMeta,
        content,
        requiredProperties,
        hasRequiredProperties
      },
      message: !hasViewportMeta 
        ? 'Viewport meta tag is missing'
        : !hasRequiredProperties
        ? 'Viewport meta tag is missing required properties'
        : 'Viewport meta tag is properly configured'
    };
    
    this.testResults.push(result);
    return result;
  }

  // Test responsive images
  testResponsiveImages() {
    const images = document.querySelectorAll('img');
    const nonResponsiveImages = [];
    
    images.forEach(img => {
      const computedStyle = window.getComputedStyle(img);
      const hasResponsiveCSS = 
        computedStyle.maxWidth === '100%' || 
        computedStyle.width === '100%' ||
        img.hasAttribute('srcset') ||
        img.closest('picture');
      
      if (!hasResponsiveCSS && img.naturalWidth > 0) {
        nonResponsiveImages.push({
          src: img.src.substring(0, 100),
          width: img.naturalWidth,
          height: img.naturalHeight,
          selector: this.getElementSelector(img)
        });
      }
    });
    
    const result = {
      test: 'Responsive Images',
      passed: nonResponsiveImages.length === 0,
      details: {
        totalImages: images.length,
        nonResponsiveImages: nonResponsiveImages.length,
        failures: nonResponsiveImages.slice(0, 5)
      },
      message: nonResponsiveImages.length === 0
        ? 'All images are responsive'
        : `${nonResponsiveImages.length} images may not be responsive`
    };
    
    this.testResults.push(result);
    return result;
  }

  // Test form usability on mobile
  testFormUsability() {
    const forms = document.querySelectorAll('form');
    const issues = [];
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, select, textarea');
      
      inputs.forEach(input => {
        const rect = input.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(input);
        
        // Check input height
        if (rect.height < 44) {
          issues.push({
            type: 'Small input height',
            element: input.tagName.toLowerCase(),
            height: Math.round(rect.height),
            selector: this.getElementSelector(input)
          });
        }
        
        // Check for proper input types on mobile
        if (input.type === 'text' && input.name?.includes('email')) {
          issues.push({
            type: 'Missing email input type',
            element: 'input',
            suggestion: 'Use type="email" for email inputs',
            selector: this.getElementSelector(input)
          });
        }
        
        if (input.type === 'text' && input.name?.includes('tel')) {
          issues.push({
            type: 'Missing tel input type',
            element: 'input',
            suggestion: 'Use type="tel" for phone inputs',
            selector: this.getElementSelector(input)
          });
        }
      });
    });
    
    const result = {
      test: 'Form Usability',
      passed: issues.length === 0,
      details: {
        totalForms: forms.length,
        issues: issues.length,
        failures: issues.slice(0, 10)
      },
      message: issues.length === 0
        ? 'Forms are optimized for mobile'
        : `${issues.length} form usability issues found`
    };
    
    this.testResults.push(result);
    return result;
  }

  // Test performance metrics
  async testPerformanceMetrics() {
    const metrics = {};
    
    // Get navigation timing
    if (performance.getEntriesByType) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        metrics.totalTime = navigation.loadEventEnd - navigation.navigationStart;
      }
    }
    
    // Get memory info if available
    if (performance.memory) {
      metrics.memoryUsed = Math.round(performance.memory.usedJSHeapSize / 1048576); // MB
      metrics.memoryTotal = Math.round(performance.memory.totalJSHeapSize / 1048576); // MB
    }
    
    // Check for large resources
    const resources = performance.getEntriesByType('resource');
    const largeResources = resources
      .filter(resource => resource.transferSize > 500000) // > 500KB
      .map(resource => ({
        name: resource.name.split('/').pop(),
        size: Math.round(resource.transferSize / 1024), // KB
        duration: Math.round(resource.duration)
      }));
    
    const performanceIssues = [];
    
    if (metrics.totalTime > 3000) {
      performanceIssues.push('Page load time exceeds 3 seconds');
    }
    
    if (largeResources.length > 0) {
      performanceIssues.push(`${largeResources.length} large resources detected`);
    }
    
    if (metrics.memoryUsed > 50) {
      performanceIssues.push('High memory usage detected');
    }
    
    const result = {
      test: 'Performance Metrics',
      passed: performanceIssues.length === 0,
      details: {
        metrics,
        largeResources: largeResources.slice(0, 5),
        issues: performanceIssues
      },
      message: performanceIssues.length === 0
        ? 'Performance metrics are within acceptable ranges'
        : `${performanceIssues.length} performance issues detected`
    };
    
    this.testResults.push(result);
    return result;
  }

  // Test accessibility features
  testAccessibility() {
    const issues = [];
    
    // Check for alt text on images
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} images missing alt text`);
    }
    
    // Check for form labels
    const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    const unlabeledInputs = Array.from(inputsWithoutLabels).filter(input => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      return !label && input.type !== 'hidden';
    });
    
    if (unlabeledInputs.length > 0) {
      issues.push(`${unlabeledInputs.length} form inputs missing labels`);
    }
    
    // Check for heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    let headingIssues = 0;
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        headingIssues++;
      }
      previousLevel = level;
    });
    
    if (headingIssues > 0) {
      issues.push(`${headingIssues} heading hierarchy issues`);
    }
    
    const result = {
      test: 'Accessibility',
      passed: issues.length === 0,
      details: {
        imagesWithoutAlt: imagesWithoutAlt.length,
        unlabeledInputs: unlabeledInputs.length,
        headingIssues,
        totalIssues: issues.length
      },
      message: issues.length === 0
        ? 'No accessibility issues detected'
        : issues.join(', ')
    };
    
    this.testResults.push(result);
    return result;
  }

  // Helper method to get element selector
  getElementSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes[0]}`;
      }
    }
    
    return element.tagName.toLowerCase();
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting mobile responsiveness tests...');
    
    this.testResults = [];
    
    // Run synchronous tests
    this.testHorizontalScrolling();
    this.testTouchTargets();
    this.testTextReadability();
    this.testViewportMeta();
    this.testResponsiveImages();
    this.testFormUsability();
    this.testAccessibility();
    
    // Run asynchronous tests
    await this.testPerformanceMetrics();
    
    return this.generateReport();
  }

  // Generate comprehensive report
  generateReport() {
    const passedTests = this.testResults.filter(test => test.passed);
    const failedTests = this.testResults.filter(test => !test.passed);
    
    const report = {
      timestamp: new Date().toISOString(),
      viewport: this.currentViewport,
      summary: {
        totalTests: this.testResults.length,
        passed: passedTests.length,
        failed: failedTests.length,
        score: Math.round((passedTests.length / this.testResults.length) * 100)
      },
      results: this.testResults,
      recommendations: this.generateRecommendations(failedTests)
    };
    
    this.logReport(report);
    return report;
  }

  // Generate recommendations based on failed tests
  generateRecommendations(failedTests) {
    const recommendations = [];
    
    failedTests.forEach(test => {
      switch (test.test) {
        case 'Horizontal Scrolling':
          recommendations.push('Add "overflow-x: hidden" to body or check for elements with fixed widths');
          break;
        case 'Touch Target Sizes':
          recommendations.push('Increase size of interactive elements to at least 44x44px');
          break;
        case 'Text Readability':
          recommendations.push('Increase font size to at least 16px for better mobile readability');
          break;
        case 'Viewport Meta Tag':
          recommendations.push('Add proper viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">');
          break;
        case 'Responsive Images':
          recommendations.push('Add max-width: 100% to images or use srcset for responsive images');
          break;
        case 'Form Usability':
          recommendations.push('Increase form input heights and use appropriate input types (email, tel, etc.)');
          break;
        case 'Performance Metrics':
          recommendations.push('Optimize images, enable compression, and consider lazy loading for better performance');
          break;
        case 'Accessibility':
          recommendations.push('Add alt text to images, labels to form inputs, and fix heading hierarchy');
          break;
      }
    });
    
    return [...new Set(recommendations)]; // Remove duplicates
  }

  // Log report to console
  logReport(report) {
    console.group('[INFO] Mobile Responsiveness Test Report');
    console.log(`Score: ${report.summary.score}/100`);
    console.log(`Tests: ${report.summary.passed}/${report.summary.totalTests} passed`);
    
    if (report.summary.failed > 0) {
      console.group('[ERROR] Failed Tests');
      report.results.filter(test => !test.passed).forEach(test => {
        console.log(`${test.test}: ${test.message}`);
      });
      console.groupEnd();
      
      console.group('[INFO] Recommendations');
      report.recommendations.forEach(rec => console.log(`• ${rec}`));
      console.groupEnd();
    } else {
      console.log('[SUCCESS] All tests passed!');
    }
    
    console.groupEnd();
  }

  // Test specific viewport size
  async testViewportSize(width, height) {
    // This would require browser automation in a real testing environment
    console.log(`Testing viewport: ${width}x${height}`);
    
    // Simulate viewport change (for demonstration)
    const originalViewport = this.currentViewport;
    this.currentViewport = { ...originalViewport, width, height };
    
    const report = await this.runAllTests();
    
    // Restore original viewport
    this.currentViewport = originalViewport;
    
    return report;
  }

  // Test multiple viewport sizes
  async testMultipleViewports() {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 }
    ];
    
    const results = {};
    
    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      results[viewport.name] = await this.testViewportSize(viewport.width, viewport.height);
    }
    
    return results;
  }
}

// Create singleton instance
const responsiveTestSuite = new ResponsiveTestSuite();

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  // Run tests after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      responsiveTestSuite.runAllTests();
    }, 2000);
  });
}

export default responsiveTestSuite;