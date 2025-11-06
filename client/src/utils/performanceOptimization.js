// Performance Optimization Utilities
// Comprehensive performance optimization tools and utilities

import React from 'react';

/**
 * Code Splitting Utilities
 * Dynamic imports and lazy loading for components and routes
 */
export class CodeSplittingManager {
  constructor() {
    this.loadedChunks = new Set();
    this.preloadQueue = [];
    this.loadingPromises = new Map();
  }

  /**
   * Lazy load a component with error boundary
   */
  lazyLoadComponent(importFn, fallback = null) {
    return React.lazy(async () => {
      try {
        const module = await importFn();
        return module;
      } catch (error) {
        console.error('Failed to load component:', error);
        // Return a fallback component
        return {
          default: () => fallback || React.createElement('div', null, 'Failed to load component')
        };
      }
    });
  }

  /**
   * Preload a component for faster loading
   */
  async preloadComponent(importFn, priority = 'low') {
    const key = importFn.toString();
    
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    const loadPromise = importFn().catch(error => {
      console.warn('Failed to preload component:', error);
      return null;
    });

    this.loadingPromises.set(key, loadPromise);
    
    if (priority === 'high') {
      return loadPromise;
    } else {
      // Low priority - load when idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => loadPromise);
      } else {
        setTimeout(() => loadPromise, 0);
      }
    }
  }

  /**
   * Preload route components based on user behavior
   */
  preloadRoutesByPriority(routes) {
    const highPriorityRoutes = routes.filter(route => route.priority === 'high');
    const mediumPriorityRoutes = routes.filter(route => route.priority === 'medium');
    const lowPriorityRoutes = routes.filter(route => route.priority === 'low');

    // Load high priority immediately
    highPriorityRoutes.forEach(route => {
      this.preloadComponent(route.component, 'high');
    });

    // Load medium priority after a delay
    setTimeout(() => {
      mediumPriorityRoutes.forEach(route => {
        this.preloadComponent(route.component, 'medium');
      });
    }, 1000);

    // Load low priority when idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        lowPriorityRoutes.forEach(route => {
          this.preloadComponent(route.component, 'low');
        });
      });
    }
  }
}

/**
 * Image Optimization Manager
 * Handles image loading, optimization, and lazy loading
 */
export class ImageOptimizationManager {
  constructor() {
    this.observer = null;
    this.imageCache = new Map();
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target);
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }

  /**
   * Lazy load an image
   */
  lazyLoadImage(imgElement) {
    if (this.observer) {
      this.observer.observe(imgElement);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(imgElement);
    }
  }

  /**
   * Load image with optimization
   */
  async loadImage(imgElement) {
    const src = imgElement.dataset.src;
    if (!src) return;

    try {
      // Check cache first
      if (this.imageCache.has(src)) {
        imgElement.src = this.imageCache.get(src);
        imgElement.classList.add('loaded');
        return;
      }

      // Create optimized image URL
      const optimizedSrc = this.getOptimizedImageUrl(src, imgElement);
      
      // Preload the image
      const img = new Image();
      img.onload = () => {
        imgElement.src = optimizedSrc;
        imgElement.classList.add('loaded');
        this.imageCache.set(src, optimizedSrc);
      };
      img.onerror = () => {
        // Fallback to original src
        imgElement.src = src;
        imgElement.classList.add('error');
      };
      img.src = optimizedSrc;

    } catch (error) {
      console.error('Failed to load image:', error);
      imgElement.src = src; // Fallback
    }
  }

  /**
   * Generate optimized image URL based on device capabilities
   */
  getOptimizedImageUrl(src, imgElement) {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const containerWidth = imgElement.offsetWidth || imgElement.clientWidth;
    const containerHeight = imgElement.offsetHeight || imgElement.clientHeight;

    // Calculate optimal dimensions
    const optimalWidth = Math.ceil(containerWidth * devicePixelRatio);
    const optimalHeight = Math.ceil(containerHeight * devicePixelRatio);

    // Check for WebP support
    const supportsWebP = this.supportsWebP();
    const supportsAVIF = this.supportsAVIF();

    // Build optimized URL (assuming a service like Cloudinary or similar)
    const params = new URLSearchParams();
    if (optimalWidth > 0) params.set('w', optimalWidth);
    if (optimalHeight > 0) params.set('h', optimalHeight);
    params.set('f', supportsAVIF ? 'avif' : supportsWebP ? 'webp' : 'auto');
    params.set('q', 'auto');

    // If it's already a full URL with params, return as is
    if (src.includes('?')) {
      return src;
    }

    return `${src}?${params.toString()}`;
  }

  /**
   * Check WebP support
   */
  supportsWebP() {
    if (this._webpSupport !== undefined) return this._webpSupport;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    this._webpSupport = canvas.toDataURL('image/webp').indexOf('webp') !== -1;
    return this._webpSupport;
  }

  /**
   * Check AVIF support
   */
  supportsAVIF() {
    if (this._avifSupport !== undefined) return this._avifSupport;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    this._avifSupport = canvas.toDataURL('image/avif').indexOf('avif') !== -1;
    return this._avifSupport;
  }

  /**
   * Preload critical images
   */
  preloadCriticalImages(imageUrls) {
    imageUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }
}

/**
 * Bundle Optimization Manager
 * Handles bundle analysis and optimization
 */
export class BundleOptimizationManager {
  constructor() {
    this.bundleMetrics = {
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
      duplicates: [],
      unusedExports: []
    };
  }

  /**
   * Analyze bundle performance
   */
  analyzeBundlePerformance() {
    if (typeof window === 'undefined') return null;

    const performanceEntries = performance.getEntriesByType('navigation');
    const resourceEntries = performance.getEntriesByType('resource');

    const jsResources = resourceEntries.filter(entry => 
      entry.name.includes('.js') || entry.name.includes('.mjs')
    );

    const cssResources = resourceEntries.filter(entry => 
      entry.name.includes('.css')
    );

    return {
      navigation: performanceEntries[0],
      javascript: {
        count: jsResources.length,
        totalSize: jsResources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        loadTime: jsResources.reduce((sum, entry) => sum + entry.duration, 0)
      },
      css: {
        count: cssResources.length,
        totalSize: cssResources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        loadTime: cssResources.reduce((sum, entry) => sum + entry.duration, 0)
      }
    };
  }

  /**
   * Get bundle size recommendations
   */
  getBundleSizeRecommendations() {
    const analysis = this.analyzeBundlePerformance();
    if (!analysis) return [];

    const recommendations = [];

    // JavaScript bundle size check
    if (analysis.javascript.totalSize > 250000) { // 250KB
      recommendations.push({
        type: 'bundle-size',
        severity: 'high',
        message: 'JavaScript bundle size is too large',
        suggestion: 'Consider code splitting and lazy loading',
        currentSize: analysis.javascript.totalSize,
        targetSize: 250000
      });
    }

    // CSS bundle size check
    if (analysis.css.totalSize > 50000) { // 50KB
      recommendations.push({
        type: 'css-size',
        severity: 'medium',
        message: 'CSS bundle size could be optimized',
        suggestion: 'Consider CSS purging and critical CSS extraction',
        currentSize: analysis.css.totalSize,
        targetSize: 50000
      });
    }

    // Load time check
    if (analysis.javascript.loadTime > 1000) { // 1 second
      recommendations.push({
        type: 'load-time',
        severity: 'high',
        message: 'JavaScript load time is too slow',
        suggestion: 'Optimize bundle splitting and use CDN',
        currentTime: analysis.javascript.loadTime,
        targetTime: 1000
      });
    }

    return recommendations;
  }
}

/**
 * Tree Shaking Analyzer
 * Analyzes and reports unused code
 */
export class TreeShakingAnalyzer {
  constructor() {
    this.usedModules = new Set();
    this.importMap = new Map();
  }

  /**
   * Track module usage
   */
  trackModuleUsage(moduleName, exports) {
    this.usedModules.add(moduleName);
    
    if (Array.isArray(exports)) {
      exports.forEach(exportName => {
        const key = `${moduleName}.${exportName}`;
        this.importMap.set(key, (this.importMap.get(key) || 0) + 1);
      });
    }
  }

  /**
   * Get unused exports report
   */
  getUnusedExportsReport() {
    const report = {
      totalModules: this.usedModules.size,
      unusedExports: [],
      recommendations: []
    };

    // Analyze import frequency
    const sortedImports = Array.from(this.importMap.entries())
      .sort(([,a], [,b]) => a - b);

    const unusedThreshold = 1;
    const rarelyUsedThreshold = 3;

    sortedImports.forEach(([importPath, count]) => {
      if (count <= unusedThreshold) {
        report.unusedExports.push({
          import: importPath,
          usageCount: count,
          recommendation: 'Consider removing this import'
        });
      } else if (count <= rarelyUsedThreshold) {
        report.recommendations.push({
          import: importPath,
          usageCount: count,
          recommendation: 'Consider lazy loading this import'
        });
      }
    });

    return report;
  }
}

/**
 * Performance Budget Manager
 * Manages and enforces performance budgets
 */
export class PerformanceBudgetManager {
  constructor(budgets = {}) {
    this.budgets = {
      // Default budgets
      totalJSSize: 250000, // 250KB
      totalCSSSize: 50000,  // 50KB
      totalImageSize: 500000, // 500KB
      firstContentfulPaint: 1500, // 1.5s
      largestContentfulPaint: 2500, // 2.5s
      firstInputDelay: 100, // 100ms
      cumulativeLayoutShift: 0.1,
      ...budgets
    };
    
    this.violations = [];
  }

  /**
   * Check performance against budgets
   */
  async checkPerformanceBudgets() {
    const violations = [];

    // Check bundle sizes
    const bundleAnalysis = new BundleOptimizationManager().analyzeBundlePerformance();
    if (bundleAnalysis) {
      if (bundleAnalysis.javascript.totalSize > this.budgets.totalJSSize) {
        violations.push({
          metric: 'JavaScript Bundle Size',
          current: bundleAnalysis.javascript.totalSize,
          budget: this.budgets.totalJSSize,
          severity: 'high'
        });
      }

      if (bundleAnalysis.css.totalSize > this.budgets.totalCSSSize) {
        violations.push({
          metric: 'CSS Bundle Size',
          current: bundleAnalysis.css.totalSize,
          budget: this.budgets.totalCSSSize,
          severity: 'medium'
        });
      }
    }

    // Check Web Vitals
    if ('web-vitals' in window) {
      const webVitals = await this.getWebVitals();
      
      Object.entries(webVitals).forEach(([metric, value]) => {
        const budget = this.budgets[this.camelCase(metric)];
        if (budget && value > budget) {
          violations.push({
            metric,
            current: value,
            budget,
            severity: this.getVitalsSeverity(metric, value, budget)
          });
        }
      });
    }

    this.violations = violations;
    return violations;
  }

  /**
   * Get Web Vitals metrics
   */
  async getWebVitals() {
    return new Promise((resolve) => {
      const vitals = {};
      
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            vitals.firstContentfulPaint = entry.startTime;
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          vitals.firstInputDelay = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        vitals.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Resolve after a delay to collect metrics
      setTimeout(() => {
        resolve(vitals);
      }, 3000);
    });
  }

  /**
   * Get severity level for Web Vitals
   */
  getVitalsSeverity(metric, value, budget) {
    const ratio = value / budget;
    if (ratio > 2) return 'critical';
    if (ratio > 1.5) return 'high';
    if (ratio > 1.2) return 'medium';
    return 'low';
  }

  /**
   * Convert kebab-case to camelCase
   */
  camelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport() {
    return {
      budgets: this.budgets,
      violations: this.violations,
      score: this.calculatePerformanceScore(),
      recommendations: this.getPerformanceRecommendations()
    };
  }

  /**
   * Calculate overall performance score
   */
  calculatePerformanceScore() {
    if (this.violations.length === 0) return 100;
    
    const totalViolations = this.violations.length;
    const severityWeights = { low: 1, medium: 2, high: 3, critical: 4 };
    
    const weightedViolations = this.violations.reduce((sum, violation) => {
      return sum + (severityWeights[violation.severity] || 1);
    }, 0);

    const maxPossibleScore = totalViolations * 4; // All critical
    const score = Math.max(0, 100 - (weightedViolations / maxPossibleScore) * 100);
    
    return Math.round(score);
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations() {
    const recommendations = [];

    this.violations.forEach(violation => {
      switch (violation.metric) {
        case 'JavaScript Bundle Size':
          recommendations.push({
            type: 'code-splitting',
            message: 'Implement code splitting to reduce initial bundle size',
            priority: 'high'
          });
          break;
        case 'CSS Bundle Size':
          recommendations.push({
            type: 'css-optimization',
            message: 'Purge unused CSS and implement critical CSS',
            priority: 'medium'
          });
          break;
        case 'firstContentfulPaint':
          recommendations.push({
            type: 'loading-optimization',
            message: 'Optimize critical rendering path and reduce blocking resources',
            priority: 'high'
          });
          break;
        case 'largestContentfulPaint':
          recommendations.push({
            type: 'image-optimization',
            message: 'Optimize images and implement lazy loading',
            priority: 'high'
          });
          break;
        case 'firstInputDelay':
          recommendations.push({
            type: 'javascript-optimization',
            message: 'Reduce JavaScript execution time and use web workers',
            priority: 'medium'
          });
          break;
        case 'cumulativeLayoutShift':
          recommendations.push({
            type: 'layout-stability',
            message: 'Add size attributes to images and reserve space for dynamic content',
            priority: 'medium'
          });
          break;
      }
    });

    return recommendations;
  }
}

// Create singleton instances
export const codeSplittingManager = new CodeSplittingManager();
export const imageOptimizationManager = new ImageOptimizationManager();
export const bundleOptimizationManager = new BundleOptimizationManager();
export const treeShakingAnalyzer = new TreeShakingAnalyzer();
export const performanceBudgetManager = new PerformanceBudgetManager();

// Export utility functions
export const preloadRoute = (importFn) => codeSplittingManager.preloadComponent(importFn);
export const lazyLoadImage = (imgElement) => imageOptimizationManager.lazyLoadImage(imgElement);
export const checkPerformanceBudgets = () => performanceBudgetManager.checkPerformanceBudgets();

export default {
  CodeSplittingManager,
  ImageOptimizationManager,
  BundleOptimizationManager,
  TreeShakingAnalyzer,
  PerformanceBudgetManager,
  codeSplittingManager,
  imageOptimizationManager,
  bundleOptimizationManager,
  treeShakingAnalyzer,
  performanceBudgetManager
};