// Performance Monitoring Hooks
// React hooks for performance monitoring and optimization

import { useState, useEffect, useCallback, useRef } from 'react';
import { performanceBudgetManager } from '../utils/performanceOptimization';

/**
 * Web Vitals Monitoring Hook
 * Monitors Core Web Vitals metrics
 */
export const useWebVitals = (onMetric) => {
  const [vitals, setVitals] = useState({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  });

  useEffect(() => {
    let clsValue = 0;
    let clsEntries = [];

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          const value = entry.startTime;
          setVitals(prev => ({ ...prev, fcp: value }));
          onMetric?.('FCP', value);
        }
      });
    });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const value = lastEntry.startTime;
      setVitals(prev => ({ ...prev, lcp: value }));
      onMetric?.('LCP', value);
    });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const value = entry.processingStart - entry.startTime;
        setVitals(prev => ({ ...prev, fid: value }));
        onMetric?.('FID', value);
      });
    });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      });
      setVitals(prev => ({ ...prev, cls: clsValue }));
      onMetric?.('CLS', clsValue);
    });

    // Time to First Byte
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const value = entry.responseStart - entry.requestStart;
        setVitals(prev => ({ ...prev, ttfb: value }));
        onMetric?.('TTFB', value);
      });
    });

    // Start observing
    try {
      fcpObserver.observe({ entryTypes: ['paint'] });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      navigationObserver.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      navigationObserver.disconnect();
    };
  }, [onMetric]);

  return vitals;
};

/**
 * Performance Budget Hook
 * Monitors performance against defined budgets
 */
export const usePerformanceBudget = (budgets = {}) => {
  const [violations, setViolations] = useState([]);
  const [score, setScore] = useState(100);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const checkBudgets = useCallback(async () => {
    setIsMonitoring(true);
    
    try {
      performanceBudgetManager.budgets = { ...performanceBudgetManager.budgets, ...budgets };
      const budgetViolations = await performanceBudgetManager.checkPerformanceBudgets();
      const report = performanceBudgetManager.generatePerformanceReport();
      
      setViolations(budgetViolations);
      setScore(report.score);
    } catch (error) {
      console.error('Failed to check performance budgets:', error);
    } finally {
      setIsMonitoring(false);
    }
  }, [budgets]);

  useEffect(() => {
    // Check budgets after page load
    if (document.readyState === 'complete') {
      setTimeout(checkBudgets, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(checkBudgets, 1000);
      });
    }
  }, [checkBudgets]);

  return {
    violations,
    score,
    isMonitoring,
    checkBudgets
  };
};

/**
 * Memory Usage Monitoring Hook
 * Monitors JavaScript memory usage
 */
export const useMemoryMonitoring = (interval = 5000) => {
  const [memoryInfo, setMemoryInfo] = useState({
    used: 0,
    total: 0,
    limit: 0,
    percentage: 0
  });

  useEffect(() => {
    if (!performance.memory) {
      console.warn('Memory API not supported');
      return;
    }

    const updateMemoryInfo = () => {
      const memory = performance.memory;
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      const percentage = Math.round((used / limit) * 100);

      setMemoryInfo({ used, total, limit, percentage });
    };

    updateMemoryInfo();
    const intervalId = setInterval(updateMemoryInfo, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return memoryInfo;
};

/**
 * Network Information Hook
 * Monitors network connection quality
 */
export const useNetworkInfo = () => {
  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
    isOnline: true
  });

  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      setNetworkInfo({
        effectiveType: connection?.effectiveType || '4g',
        downlink: connection?.downlink || 10,
        rtt: connection?.rtt || 100,
        saveData: connection?.saveData || false,
        isOnline: navigator.onLine
      });
    };

    updateNetworkInfo();

    // Listen for network changes
    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);
    
    const connection = navigator.connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  return networkInfo;
};

/**
 * Render Performance Hook
 * Monitors component render performance
 */
export const useRenderPerformance = (componentName) => {
  const renderCount = useRef(0);
  const renderTimes = useRef([]);
  const startTime = useRef(0);

  useEffect(() => {
    startTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    renderTimes.current.push(renderTime);
    
    // Keep only last 10 render times
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }

    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  });

  const getAverageRenderTime = useCallback(() => {
    if (renderTimes.current.length === 0) return 0;
    const sum = renderTimes.current.reduce((a, b) => a + b, 0);
    return sum / renderTimes.current.length;
  }, []);

  return {
    renderCount: renderCount.current,
    averageRenderTime: getAverageRenderTime(),
    lastRenderTime: renderTimes.current[renderTimes.current.length - 1] || 0
  };
};

/**
 * Intersection Observer Hook
 * Optimized intersection observer for lazy loading
 */
export const useIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true
} = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersectingNow = entry.isIntersecting;
        
        if (isIntersectingNow) {
          setIsIntersecting(true);
          setHasIntersected(true);
          
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return {
    ref: elementRef,
    isIntersecting,
    hasIntersected
  };
};

/**
 * Debounced Value Hook
 * Debounces value changes to reduce re-renders
 */
export const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttled Callback Hook
 * Throttles function calls to improve performance
 */
export const useThrottledCallback = (callback, delay = 100) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

/**
 * Memoized Callback Hook with Dependencies
 * Enhanced useCallback with dependency tracking
 */
export const useStableCallback = (callback, deps = []) => {
  const ref = useRef(callback);
  const depsRef = useRef(deps);

  // Update callback if dependencies changed
  if (!deps.every((dep, index) => dep === depsRef.current[index])) {
    ref.current = callback;
    depsRef.current = deps;
  }

  return useCallback((...args) => ref.current(...args), []);
};

/**
 * Performance Profiler Hook
 * Profiles component performance over time
 */
export const usePerformanceProfiler = (componentName, enabled = process.env.NODE_ENV === 'development') => {
  const profileData = useRef({
    renders: 0,
    totalTime: 0,
    maxTime: 0,
    minTime: Infinity,
    samples: []
  });

  const startTime = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    
    startTime.current = performance.now();
    profileData.current.renders += 1;
  });

  useEffect(() => {
    if (!enabled) return;

    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    const data = profileData.current;
    data.totalTime += renderTime;
    data.maxTime = Math.max(data.maxTime, renderTime);
    data.minTime = Math.min(data.minTime, renderTime);
    data.samples.push(renderTime);

    // Keep only last 100 samples
    if (data.samples.length > 100) {
      data.samples.shift();
    }

    // Log performance warnings
    if (renderTime > 16) {
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
    }
  });

  const getProfileSummary = useCallback(() => {
    const data = profileData.current;
    return {
      componentName,
      renders: data.renders,
      averageTime: data.renders > 0 ? data.totalTime / data.renders : 0,
      maxTime: data.maxTime === -Infinity ? 0 : data.maxTime,
      minTime: data.minTime === Infinity ? 0 : data.minTime,
      totalTime: data.totalTime,
      recentSamples: data.samples.slice(-10)
    };
  }, [componentName]);

  return enabled ? getProfileSummary : () => null;
};

/**
 * Resource Loading Hook
 * Monitors resource loading performance
 */
export const useResourceLoading = () => {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateResources = () => {
      const resourceEntries = performance.getEntriesByType('resource');
      const processedResources = resourceEntries.map(entry => ({
        name: entry.name,
        type: entry.initiatorType,
        size: entry.transferSize || 0,
        duration: entry.duration,
        startTime: entry.startTime,
        blocked: entry.domainLookupStart - entry.fetchStart,
        dns: entry.domainLookupEnd - entry.domainLookupStart,
        connect: entry.connectEnd - entry.connectStart,
        request: entry.responseStart - entry.requestStart,
        response: entry.responseEnd - entry.responseStart
      }));

      setResources(processedResources);
      setIsLoading(false);
    };

    if (document.readyState === 'complete') {
      updateResources();
    } else {
      window.addEventListener('load', updateResources);
    }

    return () => {
      window.removeEventListener('load', updateResources);
    };
  }, []);

  const getResourcesByType = useCallback((type) => {
    return resources.filter(resource => resource.type === type);
  }, [resources]);

  const getTotalSize = useCallback((type) => {
    const filteredResources = type ? getResourcesByType(type) : resources;
    return filteredResources.reduce((sum, resource) => sum + resource.size, 0);
  }, [resources, getResourcesByType]);

  const getSlowestResources = useCallback((count = 5) => {
    return [...resources]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, count);
  }, [resources]);

  return {
    resources,
    isLoading,
    getResourcesByType,
    getTotalSize,
    getSlowestResources
  };
};

export default useWebVitals;