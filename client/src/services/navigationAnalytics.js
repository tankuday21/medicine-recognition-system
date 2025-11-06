// Navigation Analytics Service
// Comprehensive analytics tracking for navigation behavior

/**
 * Navigation Analytics Service
 * Tracks user navigation patterns and provides insights
 */
class NavigationAnalyticsService {
  constructor(config = {}) {
    this.config = {
      enableTracking: true,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      maxRetries: 3,
      apiEndpoint: '/api/analytics/navigation',
      enableLocalStorage: true,
      storageKey: 'navigation-analytics',
      enableConsoleLogging: process.env.NODE_ENV === 'development',
      ...config
    };

    this.eventQueue = [];
    this.sessionData = this.initializeSession();
    this.flushTimer = null;
    this.retryQueue = [];

    this.startFlushTimer();
    this.setupEventListeners();
  }

  /**
   * Initialize analytics session
   */
  initializeSession() {
    const sessionId = this.generateSessionId();
    const startTime = Date.now();
    
    return {
      sessionId,
      startTime,
      userId: this.getUserId(),
      deviceInfo: this.getDeviceInfo(),
      pageViews: 0,
      totalTimeSpent: 0,
      bounceRate: 0,
      exitPages: [],
      entryPages: [],
      userFlow: [],
      mostVisitedPages: {},
      averageTimePerPage: {},
      navigationPatterns: {}
    };
  }

  /**
   * Track navigation event
   */
  trackNavigation(eventData) {
    if (!this.config.enableTracking) return;

    const event = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      sessionId: this.sessionData.sessionId,
      userId: this.sessionData.userId,
      type: 'navigation',
      ...eventData,
      deviceInfo: this.sessionData.deviceInfo,
      pageLoadTime: this.calculatePageLoadTime(),
      referrer: typeof window !== 'undefined' ? document.referrer : '',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : ''
    };

    this.addToQueue(event);
    this.updateSessionData(event);

    if (this.config.enableConsoleLogging) {
      console.log('Navigation Event:', event);
    }
  }

  /**
   * Track page view
   */
  trackPageView(route, metadata = {}) {
    this.trackNavigation({
      action: 'page_view',
      route,
      metadata,
      timeSpent: this.calculateTimeSpent(),
      scrollDepth: this.getScrollDepth(),
      viewportSize: this.getViewportSize()
    });
  }

  /**
   * Track navigation click
   */
  trackNavigationClick(element, route, metadata = {}) {
    this.trackNavigation({
      action: 'navigation_click',
      element: this.getElementInfo(element),
      route,
      metadata,
      clickPosition: this.getClickPosition(element),
      timeOnPage: this.calculateTimeOnCurrentPage()
    });
  }

  /**
   * Track breadcrumb navigation
   */
  trackBreadcrumbClick(breadcrumb, index) {
    this.trackNavigation({
      action: 'breadcrumb_click',
      breadcrumb: {
        label: breadcrumb.label,
        route: breadcrumb.route,
        index,
        depth: index + 1
      },
      navigationDepth: index + 1
    });
  }

  /**
   * Track search navigation
   */
  trackSearchNavigation(query, results, selectedResult = null) {
    this.trackNavigation({
      action: 'search_navigation',
      searchQuery: query,
      resultsCount: results.length,
      selectedResult,
      searchTime: Date.now()
    });
  }

  /**
   * Track back/forward navigation
   */
  trackBrowserNavigation(direction, route) {
    this.trackNavigation({
      action: 'browser_navigation',
      direction, // 'back' or 'forward'
      route,
      historyLength: typeof window !== 'undefined' ? window.history.length : 0
    });
  }

  /**
   * Track navigation error
   */
  trackNavigationError(error, route, metadata = {}) {
    this.trackNavigation({
      action: 'navigation_error',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      route,
      metadata,
      errorTime: Date.now()
    });
  }

  /**
   * Track user flow
   */
  trackUserFlow(fromRoute, toRoute, trigger) {
    const flowEvent = {
      from: fromRoute,
      to: toRoute,
      trigger, // 'click', 'back', 'forward', 'direct', etc.
      timestamp: Date.now(),
      timeSpent: this.calculateTimeSpent()
    };

    this.sessionData.userFlow.push(flowEvent);
    
    this.trackNavigation({
      action: 'user_flow',
      flow: flowEvent,
      flowLength: this.sessionData.userFlow.length
    });
  }

  /**
   * Get navigation insights
   */
  getNavigationInsights() {
    return {
      session: this.sessionData,
      popularPages: this.getPopularPages(),
      navigationPatterns: this.getNavigationPatterns(),
      userJourney: this.getUserJourney(),
      performanceMetrics: this.getPerformanceMetrics(),
      conversionFunnels: this.getConversionFunnels()
    };
  }

  /**
   * Get popular pages
   */
  getPopularPages() {
    const pages = Object.entries(this.sessionData.mostVisitedPages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return pages.map(([route, visits]) => ({
      route,
      visits,
      averageTime: this.sessionData.averageTimePerPage[route] || 0,
      bounceRate: this.calculateBounceRate(route)
    }));
  }

  /**
   * Get navigation patterns
   */
  getNavigationPatterns() {
    const patterns = {};
    const flow = this.sessionData.userFlow;

    for (let i = 0; i < flow.length - 1; i++) {
      const from = flow[i].to;
      const to = flow[i + 1].to;
      const pattern = `${from} -> ${to}`;
      
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    }

    return Object.entries(patterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([pattern, count]) => ({ pattern, count }));
  }

  /**
   * Get user journey
   */
  getUserJourney() {
    return this.sessionData.userFlow.map((step, index) => ({
      step: index + 1,
      route: step.to,
      trigger: step.trigger,
      timeSpent: step.timeSpent,
      timestamp: step.timestamp
    }));
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const totalTime = Date.now() - this.sessionData.startTime;
    const avgTimePerPage = totalTime / Math.max(this.sessionData.pageViews, 1);

    return {
      sessionDuration: totalTime,
      pageViews: this.sessionData.pageViews,
      averageTimePerPage: avgTimePerPage,
      bounceRate: this.sessionData.bounceRate,
      pagesPerSession: this.sessionData.pageViews,
      navigationEfficiency: this.calculateNavigationEfficiency()
    };
  }

  /**
   * Get conversion funnels
   */
  getConversionFunnels() {
    // Define common medical app funnels
    const funnels = {
      patientRegistration: ['/register', '/patient-info', '/medical-history', '/confirmation'],
      appointmentBooking: ['/appointments', '/select-doctor', '/select-time', '/confirmation'],
      medicationOrder: ['/medications', '/prescription', '/pharmacy', '/checkout', '/confirmation']
    };

    const results = {};
    
    Object.entries(funnels).forEach(([funnelName, steps]) => {
      results[funnelName] = this.analyzeFunnel(steps);
    });

    return results;
  }

  /**
   * Analyze funnel conversion
   */
  analyzeFunnel(steps) {
    const flow = this.sessionData.userFlow;
    const stepCounts = {};
    
    steps.forEach(step => {
      stepCounts[step] = flow.filter(f => f.to === step).length;
    });

    const conversions = [];
    for (let i = 0; i < steps.length - 1; i++) {
      const currentStep = stepCounts[steps[i]] || 0;
      const nextStep = stepCounts[steps[i + 1]] || 0;
      const conversionRate = currentStep > 0 ? (nextStep / currentStep) * 100 : 0;
      
      conversions.push({
        from: steps[i],
        to: steps[i + 1],
        conversionRate,
        dropOff: currentStep - nextStep
      });
    }

    return {
      steps: steps.map(step => ({
        step,
        visits: stepCounts[step] || 0
      })),
      conversions,
      overallConversion: steps.length > 0 ? 
        ((stepCounts[steps[steps.length - 1]] || 0) / (stepCounts[steps[0]] || 1)) * 100 : 0
    };
  }

  /**
   * Add event to queue
   */
  addToQueue(event) {
    this.eventQueue.push(event);
    
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Update session data
   */
  updateSessionData(event) {
    if (event.action === 'page_view') {
      this.sessionData.pageViews++;
      this.sessionData.mostVisitedPages[event.route] = 
        (this.sessionData.mostVisitedPages[event.route] || 0) + 1;
      
      if (event.timeSpent) {
        const currentAvg = this.sessionData.averageTimePerPage[event.route] || 0;
        const visits = this.sessionData.mostVisitedPages[event.route];
        this.sessionData.averageTimePerPage[event.route] = 
          (currentAvg * (visits - 1) + event.timeSpent) / visits;
      }
    }

    this.sessionData.totalTimeSpent = Date.now() - this.sessionData.startTime;
  }

  /**
   * Flush events to analytics service
   */
  async flush() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.sendEvents(events);
      
      if (this.config.enableConsoleLogging) {
        console.log(`Flushed ${events.length} navigation events`);
      }
    } catch (error) {
      console.error('Failed to send navigation events:', error);
      this.retryQueue.push(...events);
      this.scheduleRetry();
    }
  }

  /**
   * Send events to analytics service
   */
  async sendEvents(events) {
    if (typeof window === 'undefined') return;

    // Store in localStorage if enabled
    if (this.config.enableLocalStorage) {
      const stored = JSON.parse(localStorage.getItem(this.config.storageKey) || '[]');
      stored.push(...events);
      localStorage.setItem(this.config.storageKey, JSON.stringify(stored.slice(-1000))); // Keep last 1000 events
    }

    // Send to Google Analytics if available
    if (window.gtag) {
      events.forEach(event => {
        window.gtag('event', event.action, {
          event_category: 'Navigation',
          event_label: event.route,
          custom_parameter_session_id: event.sessionId,
          custom_parameter_user_id: event.userId
        });
      });
    }

    // Send to custom analytics endpoint
    if (this.config.apiEndpoint) {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events,
          session: this.sessionData
        })
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }
    }
  }

  /**
   * Schedule retry for failed events
   */
  scheduleRetry() {
    if (this.retryQueue.length === 0) return;

    setTimeout(() => {
      const eventsToRetry = [...this.retryQueue];
      this.retryQueue = [];
      
      this.sendEvents(eventsToRetry).catch(() => {
        // If retry fails, we'll lose these events
        console.warn('Failed to retry sending navigation events');
      });
    }, 5000); // Retry after 5 seconds
  }

  /**
   * Start flush timer
   */
  startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush();
      }
    });
  }

  /**
   * Utility methods
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getUserId() {
    if (typeof window === 'undefined') return null;
    
    // Try to get user ID from various sources
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', userId);
    }
    return userId;
  }

  getDeviceInfo() {
    if (typeof window === 'undefined') return {};

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio,
      touchSupport: 'ontouchstart' in window,
      connectionType: navigator.connection?.effectiveType || 'unknown'
    };
  }

  calculatePageLoadTime() {
    if (typeof window === 'undefined' || !window.performance) return 0;
    
    const navigation = window.performance.getEntriesByType('navigation')[0];
    return navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
  }

  calculateTimeSpent() {
    return Date.now() - this.sessionData.startTime;
  }

  calculateTimeOnCurrentPage() {
    // This would need to be tracked per page
    return 0;
  }

  getScrollDepth() {
    if (typeof window === 'undefined') return 0;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    return documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
  }

  getViewportSize() {
    if (typeof window === 'undefined') return { width: 0, height: 0 };
    
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  getElementInfo(element) {
    if (!element) return {};
    
    return {
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      textContent: element.textContent?.slice(0, 100),
      href: element.href
    };
  }

  getClickPosition(element) {
    if (!element) return { x: 0, y: 0 };
    
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  calculateBounceRate(route) {
    const visits = this.sessionData.mostVisitedPages[route] || 0;
    const singlePageSessions = this.sessionData.userFlow.filter(
      flow => flow.to === route && this.sessionData.userFlow.length === 1
    ).length;
    
    return visits > 0 ? (singlePageSessions / visits) * 100 : 0;
  }

  calculateNavigationEfficiency() {
    const totalSteps = this.sessionData.userFlow.length;
    const uniquePages = new Set(this.sessionData.userFlow.map(f => f.to)).size;
    
    return totalSteps > 0 ? (uniquePages / totalSteps) * 100 : 0;
  }

  /**
   * Destroy analytics service
   */
  destroy() {
    this.flush();
    
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }
}

// Create singleton instance
const navigationAnalytics = new NavigationAnalyticsService();

export default navigationAnalytics;
export { NavigationAnalyticsService };