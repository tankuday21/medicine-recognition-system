// Device Optimization Utilities
// Optimize UI components and interactions for different device types

/**
 * Device Optimization Manager
 * Handles device-specific optimizations and adaptations
 */
export class DeviceOptimizationManager {
  constructor() {
    this.currentDevice = null;
    this.optimizations = new Map();
    this.observers = new Set();
    this.initializeDeviceDetection();
    this.setupOptimizations();
  }

  /**
   * Initialize device detection and monitoring
   */
  initializeDeviceDetection() {
    if (typeof window === 'undefined') return;

    // Detect initial device characteristics
    this.detectDevice();

    // Monitor viewport changes
    window.addEventListener('resize', () => {
      this.detectDevice();
      this.applyOptimizations();
    });

    // Monitor orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.detectDevice();
        this.applyOptimizations();
      }, 100);
    });

    // Monitor connection changes
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.detectDevice();
        this.applyOptimizations();
      });
    }
  }

  /**
   * Detect current device characteristics
   */
  detectDevice() {
    if (typeof window === 'undefined') return;

    const device = {
      // Viewport information
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio || 1
      },
      
      // Device category
      category: this.detectDeviceCategory(),
      
      // Capabilities
      capabilities: {
        touch: 'ontouchstart' in window,
        hover: window.matchMedia('(hover: hover)').matches,
        pointer: window.matchMedia('(pointer: fine)').matches ? 'fine' : 'coarse',
        orientation: screen.orientation?.type || 'unknown',
        vibration: 'vibrate' in navigator,
        geolocation: 'geolocation' in navigator,
        camera: 'mediaDevices' in navigator,
        microphone: 'mediaDevices' in navigator
      },
      
      // Performance characteristics
      performance: {
        memory: this.detectMemoryCapacity(),
        cpu: this.detectCPUCapacity(),
        network: this.detectNetworkCapacity(),
        battery: this.detectBatteryStatus()
      },
      
      // User preferences
      preferences: {
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        fontSize: this.detectFontSizePreference()
      },
      
      // Browser information
      browser: {
        userAgent: navigator.userAgent,
        vendor: navigator.vendor,
        platform: navigator.platform,
        language: navigator.language
      },
      
      timestamp: Date.now()
    };

    this.currentDevice = device;
    this.notifyObservers(device);
    
    return device;
  }

  /**
   * Detect device category (mobile, tablet, desktop)
   */
  detectDeviceCategory() {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Check user agent for mobile indicators
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    // Check viewport width
    if (width < 768) {
      return 'mobile';
    } else if (width < 1024) {
      return isMobileUA ? 'tablet' : 'desktop';
    } else {
      return 'desktop';
    }
  }

  /**
   * Detect memory capacity
   */
  detectMemoryCapacity() {
    if (navigator.deviceMemory) {
      if (navigator.deviceMemory <= 2) return 'limited';
      if (navigator.deviceMemory <= 4) return 'moderate';
      if (navigator.deviceMemory <= 8) return 'good';
      return 'excellent';
    }
    
    // Fallback estimation based on device category
    const category = this.detectDeviceCategory();
    switch (category) {
      case 'mobile': return 'limited';
      case 'tablet': return 'moderate';
      case 'desktop': return 'good';
      default: return 'moderate';
    }
  }

  /**
   * Detect CPU capacity
   */
  detectCPUCapacity() {
    if (navigator.hardwareConcurrency) {
      if (navigator.hardwareConcurrency <= 2) return 'low';
      if (navigator.hardwareConcurrency <= 4) return 'moderate';
      if (navigator.hardwareConcurrency <= 8) return 'good';
      return 'excellent';
    }
    
    // Fallback estimation
    const category = this.detectDeviceCategory();
    switch (category) {
      case 'mobile': return 'low';
      case 'tablet': return 'moderate';
      case 'desktop': return 'good';
      default: return 'moderate';
    }
  }

  /**
   * Detect network capacity
   */
  detectNetworkCapacity() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const effectiveType = connection.effectiveType;
      
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          return 'poor';
        case '3g':
          return 'moderate';
        case '4g':
          return 'good';
        default:
          return 'moderate';
      }
    }
    
    return 'moderate';
  }

  /**
   * Detect battery status
   */
  detectBatteryStatus() {
    // Battery API is deprecated, but we can provide fallback
    return {
      level: 1, // Assume full battery
      charging: true,
      chargingTime: Infinity,
      dischargingTime: Infinity
    };
  }

  /**
   * Detect font size preference
   */
  detectFontSizePreference() {
    const testElement = document.createElement('div');
    testElement.style.fontSize = '1rem';
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    document.body.appendChild(testElement);
    
    const fontSize = window.getComputedStyle(testElement).fontSize;
    document.body.removeChild(testElement);
    
    const size = parseInt(fontSize);
    if (size <= 14) return 'small';
    if (size <= 16) return 'normal';
    if (size <= 18) return 'large';
    return 'extra-large';
  }

  /**
   * Setup device-specific optimizations
   */
  setupOptimizations() {
    // Mobile optimizations
    this.optimizations.set('mobile', {
      touchTargets: {
        minSize: 44,
        spacing: 8
      },
      typography: {
        minFontSize: 16,
        lineHeight: 1.5
      },
      interactions: {
        hoverEffects: false,
        focusVisible: true,
        tapHighlight: false
      },
      performance: {
        animationDuration: 200,
        maxAnimations: 3,
        lazyLoading: true
      },
      layout: {
        maxColumns: 1,
        padding: 16,
        margin: 8
      }
    });

    // Tablet optimizations
    this.optimizations.set('tablet', {
      touchTargets: {
        minSize: 44,
        spacing: 12
      },
      typography: {
        minFontSize: 16,
        lineHeight: 1.4
      },
      interactions: {
        hoverEffects: false,
        focusVisible: true,
        tapHighlight: false
      },
      performance: {
        animationDuration: 250,
        maxAnimations: 5,
        lazyLoading: true
      },
      layout: {
        maxColumns: 2,
        padding: 24,
        margin: 12
      }
    });

    // Desktop optimizations
    this.optimizations.set('desktop', {
      touchTargets: {
        minSize: 32,
        spacing: 4
      },
      typography: {
        minFontSize: 14,
        lineHeight: 1.4
      },
      interactions: {
        hoverEffects: true,
        focusVisible: true,
        tapHighlight: true
      },
      performance: {
        animationDuration: 300,
        maxAnimations: 10,
        lazyLoading: false
      },
      layout: {
        maxColumns: 4,
        padding: 32,
        margin: 16
      }
    });
  }

  /**
   * Apply optimizations based on current device
   */
  applyOptimizations() {
    if (!this.currentDevice) return;

    const optimizations = this.getOptimizationsForDevice(this.currentDevice);
    
    // Apply CSS custom properties
    this.applyCSSOptimizations(optimizations);
    
    // Apply JavaScript optimizations
    this.applyJSOptimizations(optimizations);
    
    // Apply accessibility optimizations
    this.applyA11yOptimizations(optimizations);
    
    // Apply performance optimizations
    this.applyPerformanceOptimizations(optimizations);
  }

  /**
   * Get optimizations for specific device
   */
  getOptimizationsForDevice(device) {
    const baseOptimizations = this.optimizations.get(device.category) || {};
    
    // Apply device-specific adjustments
    const adjustedOptimizations = { ...baseOptimizations };
    
    // Adjust for low memory devices
    if (device.performance.memory === 'limited') {
      adjustedOptimizations.performance = {
        ...adjustedOptimizations.performance,
        animationDuration: Math.max(100, adjustedOptimizations.performance.animationDuration - 100),
        maxAnimations: Math.max(1, adjustedOptimizations.performance.maxAnimations - 2),
        lazyLoading: true
      };
    }
    
    // Adjust for slow networks
    if (device.performance.network === 'poor') {
      adjustedOptimizations.performance = {
        ...adjustedOptimizations.performance,
        lazyLoading: true,
        preloadImages: false,
        compressionLevel: 'high'
      };
    }
    
    // Adjust for reduced motion preference
    if (device.preferences.reducedMotion) {
      adjustedOptimizations.performance = {
        ...adjustedOptimizations.performance,
        animationDuration: 0,
        maxAnimations: 0
      };
    }
    
    // Adjust for high contrast preference
    if (device.preferences.highContrast) {
      adjustedOptimizations.accessibility = {
        ...adjustedOptimizations.accessibility,
        contrastRatio: 7,
        boldText: true
      };
    }
    
    return adjustedOptimizations;
  }

  /**
   * Apply CSS optimizations
   */
  applyCSSOptimizations(optimizations) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Touch targets
    if (optimizations.touchTargets) {
      root.style.setProperty('--touch-target-min-size', `${optimizations.touchTargets.minSize}px`);
      root.style.setProperty('--touch-target-spacing', `${optimizations.touchTargets.spacing}px`);
    }
    
    // Typography
    if (optimizations.typography) {
      root.style.setProperty('--min-font-size', `${optimizations.typography.minFontSize}px`);
      root.style.setProperty('--line-height', optimizations.typography.lineHeight.toString());
    }
    
    // Layout
    if (optimizations.layout) {
      root.style.setProperty('--max-columns', optimizations.layout.maxColumns.toString());
      root.style.setProperty('--container-padding', `${optimizations.layout.padding}px`);
      root.style.setProperty('--element-margin', `${optimizations.layout.margin}px`);
    }
    
    // Performance
    if (optimizations.performance) {
      root.style.setProperty('--animation-duration', `${optimizations.performance.animationDuration}ms`);
    }
  }

  /**
   * Apply JavaScript optimizations
   */
  applyJSOptimizations(optimizations) {
    // Store optimizations globally for component access
    if (typeof window !== 'undefined') {
      window.__deviceOptimizations = optimizations;
    }
    
    // Apply interaction optimizations
    if (optimizations.interactions) {
      this.applyInteractionOptimizations(optimizations.interactions);
    }
  }

  /**
   * Apply interaction optimizations
   */
  applyInteractionOptimizations(interactions) {
    if (typeof document === 'undefined') return;

    // Disable hover effects on touch devices
    if (!interactions.hoverEffects) {
      document.body.classList.add('no-hover');
    } else {
      document.body.classList.remove('no-hover');
    }
    
    // Configure tap highlight
    if (!interactions.tapHighlight) {
      document.body.style.webkitTapHighlightColor = 'transparent';
    }
    
    // Configure focus visibility
    if (interactions.focusVisible) {
      document.body.classList.add('focus-visible-enabled');
    }
  }

  /**
   * Apply accessibility optimizations
   */
  applyA11yOptimizations(optimizations) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Apply accessibility-specific CSS properties
    if (optimizations.accessibility) {
      if (optimizations.accessibility.contrastRatio) {
        root.style.setProperty('--contrast-ratio', optimizations.accessibility.contrastRatio.toString());
      }
      
      if (optimizations.accessibility.boldText) {
        root.style.setProperty('--font-weight-adjustment', 'bold');
      }
    }
  }

  /**
   * Apply performance optimizations
   */
  applyPerformanceOptimizations(optimizations) {
    if (!optimizations.performance) return;

    // Limit concurrent animations
    if (optimizations.performance.maxAnimations !== undefined) {
      this.limitConcurrentAnimations(optimizations.performance.maxAnimations);
    }
    
    // Configure lazy loading
    if (optimizations.performance.lazyLoading) {
      this.enableLazyLoading();
    }
  }

  /**
   * Limit concurrent animations
   */
  limitConcurrentAnimations(maxAnimations) {
    if (typeof document === 'undefined') return;

    // This would be implemented with a more sophisticated animation manager
    // For now, we'll add a CSS class to indicate the limitation
    document.body.setAttribute('data-max-animations', maxAnimations.toString());
  }

  /**
   * Enable lazy loading optimizations
   */
  enableLazyLoading() {
    if (typeof document === 'undefined') return;

    // Add lazy loading attributes to images
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  }

  /**
   * Get current device information
   */
  getCurrentDevice() {
    return this.currentDevice;
  }

  /**
   * Get optimizations for current device
   */
  getCurrentOptimizations() {
    if (!this.currentDevice) return null;
    return this.getOptimizationsForDevice(this.currentDevice);
  }

  /**
   * Subscribe to device changes
   */
  subscribe(callback) {
    this.observers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.observers.delete(callback);
    };
  }

  /**
   * Notify observers of device changes
   */
  notifyObservers(device) {
    this.observers.forEach(callback => {
      try {
        callback(device);
      } catch (error) {
        console.error('Error in device observer:', error);
      }
    });
  }

  /**
   * Force device re-detection and optimization
   */
  refresh() {
    this.detectDevice();
    this.applyOptimizations();
  }

  /**
   * Get device-specific component props
   */
  getComponentProps(componentType) {
    const optimizations = this.getCurrentOptimizations();
    if (!optimizations) return {};

    switch (componentType) {
      case 'Button':
        return {
          minHeight: optimizations.touchTargets?.minSize,
          spacing: optimizations.touchTargets?.spacing,
          disableHover: !optimizations.interactions?.hoverEffects
        };
      
      case 'Input':
        return {
          minHeight: optimizations.touchTargets?.minSize,
          fontSize: optimizations.typography?.minFontSize
        };
      
      case 'Card':
        return {
          padding: optimizations.layout?.padding,
          margin: optimizations.layout?.margin
        };
      
      default:
        return {};
    }
  }

  /**
   * Check if feature should be enabled for current device
   */
  shouldEnableFeature(featureName) {
    const device = this.getCurrentDevice();
    if (!device) return true;

    switch (featureName) {
      case 'animations':
        return !device.preferences.reducedMotion && device.performance.cpu !== 'low';
      
      case 'hoverEffects':
        return device.capabilities.hover;
      
      case 'lazyLoading':
        return device.performance.network === 'poor' || device.performance.memory === 'limited';
      
      case 'vibration':
        return device.capabilities.vibration && device.category === 'mobile';
      
      case 'geolocation':
        return device.capabilities.geolocation;
      
      default:
        return true;
    }
  }
}

// Create singleton instance
export const deviceOptimizationManager = new DeviceOptimizationManager();

// React hook for device optimization
export const useDeviceOptimization = () => {
  const [device, setDevice] = React.useState(deviceOptimizationManager.getCurrentDevice());
  const [optimizations, setOptimizations] = React.useState(deviceOptimizationManager.getCurrentOptimizations());

  React.useEffect(() => {
    const unsubscribe = deviceOptimizationManager.subscribe((newDevice) => {
      setDevice(newDevice);
      setOptimizations(deviceOptimizationManager.getOptimizationsForDevice(newDevice));
    });

    return unsubscribe;
  }, []);

  return {
    device,
    optimizations,
    getComponentProps: (componentType) => deviceOptimizationManager.getComponentProps(componentType),
    shouldEnableFeature: (featureName) => deviceOptimizationManager.shouldEnableFeature(featureName),
    refresh: () => deviceOptimizationManager.refresh()
  };
};

// Utility functions
export const getCurrentDevice = () => {
  return deviceOptimizationManager.getCurrentDevice();
};

export const getCurrentOptimizations = () => {
  return deviceOptimizationManager.getCurrentOptimizations();
};

export const shouldEnableFeature = (featureName) => {
  return deviceOptimizationManager.shouldEnableFeature(featureName);
};

export const getComponentProps = (componentType) => {
  return deviceOptimizationManager.getComponentProps(componentType);
};

export default {
  DeviceOptimizationManager,
  deviceOptimizationManager,
  useDeviceOptimization,
  getCurrentDevice,
  getCurrentOptimizations,
  shouldEnableFeature,
  getComponentProps
};