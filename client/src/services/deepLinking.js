// Deep Linking Service
// Handles deep linking, URL generation, and route parsing for navigation

/**
 * Deep Linking Service
 * Manages deep links, shareable URLs, and route parsing
 */
class DeepLinkingService {
  constructor(config = {}) {
    this.config = {
      baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
      enableTracking: true,
      enableSharing: true,
      defaultRoute: '/',
      routePatterns: {},
      parameterEncoding: 'base64', // 'base64', 'json', 'query'
      enableCompression: true,
      maxUrlLength: 2048,
      ...config
    };

    this.routeCache = new Map();
    this.setupEventListeners();
  }

  /**
   * Generate shareable deep link
   */
  generateDeepLink(route, params = {}, options = {}) {
    const {
      includeState = false,
      includeMetadata = false,
      compress = this.config.enableCompression,
      trackable = this.config.enableTracking
    } = options;

    try {
      const url = new URL(route, this.config.baseUrl);
      
      // Add parameters
      if (Object.keys(params).length > 0) {
        const encodedParams = this.encodeParameters(params);
        url.searchParams.set('params', encodedParams);
      }

      // Add state if requested
      if (includeState && typeof window !== 'undefined') {
        const state = this.captureCurrentState();
        const encodedState = this.encodeParameters(state);
        url.searchParams.set('state', encodedState);
      }

      // Add metadata
      if (includeMetadata) {
        const metadata = {
          timestamp: Date.now(),
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
          referrer: typeof window !== 'undefined' ? document.referrer : '',
          ...options.metadata
        };
        const encodedMetadata = this.encodeParameters(metadata);
        url.searchParams.set('meta', encodedMetadata);
      }

      // Add tracking parameters
      if (trackable) {
        url.searchParams.set('utm_source', 'app');
        url.searchParams.set('utm_medium', 'deep_link');
        url.searchParams.set('utm_campaign', options.campaign || 'navigation');
        url.searchParams.set('link_id', this.generateLinkId());
      }

      let finalUrl = url.toString();

      // Compress if needed and URL is too long
      if (compress && finalUrl.length > this.config.maxUrlLength) {
        finalUrl = this.compressUrl(finalUrl);
      }

      return finalUrl;
    } catch (error) {
      console.error('Failed to generate deep link:', error);
      return `${this.config.baseUrl}${route}`;
    }
  }

  /**
   * Parse deep link and extract information
   */
  parseDeepLink(url) {
    try {
      const urlObj = new URL(url);
      const route = urlObj.pathname;
      
      const result = {
        route,
        params: {},
        state: {},
        metadata: {},
        tracking: {}
      };

      // Parse parameters
      const paramsString = urlObj.searchParams.get('params');
      if (paramsString) {
        result.params = this.decodeParameters(paramsString);
      }

      // Parse state
      const stateString = urlObj.searchParams.get('state');
      if (stateString) {
        result.state = this.decodeParameters(stateString);
      }

      // Parse metadata
      const metaString = urlObj.searchParams.get('meta');
      if (metaString) {
        result.metadata = this.decodeParameters(metaString);
      }

      // Parse tracking parameters
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'link_id'];
      trackingParams.forEach(param => {
        const value = urlObj.searchParams.get(param);
        if (value) {
          result.tracking[param] = value;
        }
      });

      // Parse query parameters
      urlObj.searchParams.forEach((value, key) => {
        if (!['params', 'state', 'meta', ...trackingParams].includes(key)) {
          result.params[key] = value;
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to parse deep link:', error);
      return {
        route: this.config.defaultRoute,
        params: {},
        state: {},
        metadata: {},
        tracking: {}
      };
    }
  }

  /**
   * Generate medical-specific deep links
   */
  generateMedicalDeepLink(type, data, options = {}) {
    const medicalRoutes = {
      patient: '/patients/:patientId',
      appointment: '/appointments/:appointmentId',
      prescription: '/prescriptions/:prescriptionId',
      labResult: '/lab-results/:resultId',
      medicalRecord: '/medical-records/:recordId',
      scan: '/scans/:scanId',
      medication: '/medications/:medicationId'
    };

    const routePattern = medicalRoutes[type];
    if (!routePattern) {
      throw new Error(`Unknown medical deep link type: ${type}`);
    }

    // Replace route parameters
    let route = routePattern;
    Object.entries(data).forEach(([key, value]) => {
      route = route.replace(`:${key}`, value);
    });

    // Add medical-specific metadata
    const medicalMetadata = {
      type,
      category: 'medical',
      securityLevel: options.securityLevel || 'standard',
      expiresAt: options.expiresAt || (Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      ...options.metadata
    };

    return this.generateDeepLink(route, data, {
      ...options,
      metadata: medicalMetadata,
      campaign: `medical_${type}`
    });
  }

  /**
   * Generate shareable patient link
   */
  generatePatientLink(patientId, options = {}) {
    return this.generateMedicalDeepLink('patient', { patientId }, {
      includeMetadata: true,
      trackable: true,
      securityLevel: 'high',
      ...options
    });
  }

  /**
   * Generate appointment booking link
   */
  generateAppointmentLink(appointmentData, options = {}) {
    return this.generateMedicalDeepLink('appointment', appointmentData, {
      includeState: true,
      includeMetadata: true,
      trackable: true,
      ...options
    });
  }

  /**
   * Generate prescription sharing link
   */
  generatePrescriptionLink(prescriptionId, options = {}) {
    return this.generateMedicalDeepLink('prescription', { prescriptionId }, {
      includeMetadata: true,
      trackable: true,
      securityLevel: 'high',
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      ...options
    });
  }

  /**
   * Validate deep link security
   */
  validateDeepLink(url) {
    const parsed = this.parseDeepLink(url);
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      securityLevel: 'standard'
    };

    // Check expiration
    if (parsed.metadata.expiresAt && Date.now() > parsed.metadata.expiresAt) {
      validation.isValid = false;
      validation.errors.push('Link has expired');
    }

    // Check security level
    if (parsed.metadata.securityLevel === 'high') {
      validation.securityLevel = 'high';
      
      // Additional security checks for high-security links
      if (!parsed.tracking.link_id) {
        validation.warnings.push('High-security link missing tracking ID');
      }
    }

    // Validate route pattern
    const routeExists = this.validateRoute(parsed.route);
    if (!routeExists) {
      validation.isValid = false;
      validation.errors.push('Invalid route');
    }

    // Check for suspicious parameters
    const suspiciousPatterns = ['<script', 'javascript:', 'data:', 'vbscript:'];
    const allParams = JSON.stringify(parsed.params);
    
    suspiciousPatterns.forEach(pattern => {
      if (allParams.toLowerCase().includes(pattern)) {
        validation.isValid = false;
        validation.errors.push('Suspicious content detected');
      }
    });

    return validation;
  }

  /**
   * Handle deep link navigation
   */
  async handleDeepLink(url, navigationCallback) {
    try {
      // Validate the deep link
      const validation = this.validateDeepLink(url);
      if (!validation.isValid) {
        console.error('Invalid deep link:', validation.errors);
        return false;
      }

      // Parse the deep link
      const parsed = this.parseDeepLink(url);
      
      // Track deep link usage
      if (this.config.enableTracking) {
        this.trackDeepLinkUsage(parsed);
      }

      // Execute navigation
      if (navigationCallback) {
        await navigationCallback(parsed);
      }

      return true;
    } catch (error) {
      console.error('Failed to handle deep link:', error);
      return false;
    }
  }

  /**
   * Generate QR code data for deep link
   */
  generateQRCodeData(url, options = {}) {
    const {
      size = 256,
      errorCorrectionLevel = 'M',
      margin = 4,
      darkColor = '#000000',
      lightColor = '#FFFFFF'
    } = options;

    return {
      text: url,
      width: size,
      height: size,
      correctLevel: errorCorrectionLevel,
      margin,
      color: {
        dark: darkColor,
        light: lightColor
      }
    };
  }

  /**
   * Share deep link via Web Share API
   */
  async shareDeepLink(url, shareData = {}) {
    if (typeof navigator === 'undefined' || !navigator.share) {
      // Fallback to clipboard
      return this.copyToClipboard(url);
    }

    try {
      await navigator.share({
        title: shareData.title || 'Medical App Link',
        text: shareData.text || 'Check out this medical information',
        url: url
      });
      return true;
    } catch (error) {
      console.error('Failed to share deep link:', error);
      return this.copyToClipboard(url);
    }
  }

  /**
   * Copy deep link to clipboard
   */
  async copyToClipboard(url) {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Encode parameters based on configuration
   */
  encodeParameters(params) {
    const jsonString = JSON.stringify(params);
    
    switch (this.config.parameterEncoding) {
      case 'base64':
        return btoa(jsonString);
      case 'json':
        return encodeURIComponent(jsonString);
      case 'query':
        return new URLSearchParams(params).toString();
      default:
        return btoa(jsonString);
    }
  }

  /**
   * Decode parameters based on configuration
   */
  decodeParameters(encoded) {
    try {
      switch (this.config.parameterEncoding) {
        case 'base64':
          return JSON.parse(atob(encoded));
        case 'json':
          return JSON.parse(decodeURIComponent(encoded));
        case 'query':
          const params = {};
          new URLSearchParams(encoded).forEach((value, key) => {
            params[key] = value;
          });
          return params;
        default:
          return JSON.parse(atob(encoded));
      }
    } catch (error) {
      console.error('Failed to decode parameters:', error);
      return {};
    }
  }

  /**
   * Compress URL (simplified implementation)
   */
  compressUrl(url) {
    // In a real implementation, you might use a URL shortening service
    // For now, we'll just remove unnecessary parameters
    const urlObj = new URL(url);
    
    // Remove tracking parameters if URL is too long
    if (url.length > this.config.maxUrlLength) {
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach(param => {
        urlObj.searchParams.delete(param);
      });
    }

    return urlObj.toString();
  }

  /**
   * Capture current application state
   */
  captureCurrentState() {
    if (typeof window === 'undefined') return {};

    return {
      timestamp: Date.now(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      scroll: {
        x: window.pageXOffset,
        y: window.pageYOffset
      },
      // Add more state as needed
    };
  }

  /**
   * Validate route exists
   */
  validateRoute(route) {
    // Check against configured route patterns
    if (Object.keys(this.config.routePatterns).length > 0) {
      return Object.keys(this.config.routePatterns).some(pattern => {
        const regex = new RegExp(pattern.replace(/:\w+/g, '\\w+'));
        return regex.test(route);
      });
    }

    // Basic validation - route should start with /
    return route.startsWith('/');
  }

  /**
   * Track deep link usage
   */
  trackDeepLinkUsage(parsed) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'deep_link_used', {
        event_category: 'Navigation',
        event_label: parsed.route,
        custom_parameter_link_id: parsed.tracking.link_id,
        custom_parameter_source: parsed.tracking.utm_source
      });
    }

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Deep link used:', parsed);
    }
  }

  /**
   * Generate unique link ID
   */
  generateLinkId() {
    return `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Handle browser back/forward with deep links
    window.addEventListener('popstate', (event) => {
      const url = window.location.href;
      if (this.isDeepLink(url)) {
        this.handleDeepLink(url);
      }
    });
  }

  /**
   * Check if URL is a deep link
   */
  isDeepLink(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.has('params') || 
             urlObj.searchParams.has('state') || 
             urlObj.searchParams.has('link_id');
    } catch {
      return false;
    }
  }
}

// Create singleton instance
const deepLinking = new DeepLinkingService();

export default deepLinking;
export { DeepLinkingService };