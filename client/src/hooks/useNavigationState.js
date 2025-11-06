// Navigation State Management Hook
// Comprehensive navigation state with persistence, analytics, and deep linking

import { useState, useEffect, useCallback, useRef } from 'react';
import { useResponsive } from './useDesignSystem';

/**
 * Navigation State Management Hook
 * Manages navigation state with persistence, history, and analytics
 */
export const useNavigationState = ({
  initialRoute = '/',
  persistState = true,
  enableAnalytics = true,
  enableDeepLinking = true,
  maxHistoryLength = 50,
  storageKey = 'navigation-state'
} = {}) => {
  const { isMobile } = useResponsive();
  const analyticsRef = useRef([]);
  const sessionStartTime = useRef(Date.now());

  // Core navigation state
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (persistState && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.currentRoute || initialRoute;
        } catch (e) {
          console.warn('Failed to parse saved navigation state:', e);
        }
      }
    }
    return initialRoute;
  });

  const [navigationHistory, setNavigationHistory] = useState(() => {
    if (persistState && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.navigationHistory || [initialRoute];
        } catch (e) {
          console.warn('Failed to parse saved navigation history:', e);
        }
      }
    }
    return [initialRoute];
  });

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [routeParams, setRouteParams] = useState({});
  const [routeMetadata, setRouteMetadata] = useState({});

  // Navigation analytics state
  const [sessionData, setSessionData] = useState({
    sessionId: generateSessionId(),
    startTime: sessionStartTime.current,
    pageViews: 0,
    totalTimeSpent: 0,
    mostVisitedRoutes: {},
    userFlow: []
  });

  // Persist state to localStorage
  useEffect(() => {
    if (persistState && typeof window !== 'undefined') {
      const stateToSave = {
        currentRoute,
        navigationHistory: navigationHistory.slice(-maxHistoryLength),
        timestamp: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    }
  }, [currentRoute, navigationHistory, persistState, storageKey, maxHistoryLength]);

  // Handle browser back/forward buttons
  useEffect(() => {
    if (!enableDeepLinking || typeof window === 'undefined') return;

    const handlePopState = (event) => {
      const newRoute = window.location.pathname + window.location.search;
      if (newRoute !== currentRoute) {
        setCurrentRoute(newRoute);
        updateBreadcrumbs(newRoute);
        trackNavigation(newRoute, 'browser-navigation');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentRoute, enableDeepLinking]);

  // Update browser URL when route changes
  useEffect(() => {
    if (enableDeepLinking && typeof window !== 'undefined') {
      if (window.location.pathname + window.location.search !== currentRoute) {
        window.history.pushState(null, '', currentRoute);
      }
    }
  }, [currentRoute, enableDeepLinking]);

  // Navigation functions
  const navigate = useCallback((route, options = {}) => {
    const {
      replace = false,
      params = {},
      metadata = {},
      trackAnalytics = true
    } = options;

    // Update route params and metadata
    setRouteParams(prev => ({ ...prev, ...params }));
    setRouteMetadata(prev => ({ ...prev, [route]: metadata }));

    // Update navigation history
    setNavigationHistory(prev => {
      const newHistory = replace ? prev.slice(0, -1) : [...prev];
      newHistory.push(route);
      return newHistory.slice(-maxHistoryLength);
    });

    // Update current route
    setCurrentRoute(route);

    // Update breadcrumbs
    updateBreadcrumbs(route, metadata);

    // Track analytics
    if (enableAnalytics && trackAnalytics) {
      trackNavigation(route, 'programmatic-navigation', metadata);
    }

    // Update browser URL
    if (enableDeepLinking && typeof window !== 'undefined') {
      if (replace) {
        window.history.replaceState(null, '', route);
      } else {
        window.history.pushState(null, '', route);
      }
    }
  }, [enableAnalytics, enableDeepLinking, maxHistoryLength]);

  const goBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current route
      const previousRoute = newHistory[newHistory.length - 1];
      
      setNavigationHistory(newHistory);
      setCurrentRoute(previousRoute);
      updateBreadcrumbs(previousRoute);
      
      if (enableAnalytics) {
        trackNavigation(previousRoute, 'back-navigation');
      }

      if (enableDeepLinking && typeof window !== 'undefined') {
        window.history.back();
      }
    }
  }, [navigationHistory, enableAnalytics, enableDeepLinking]);

  const goForward = useCallback(() => {
    if (typeof window !== 'undefined' && enableDeepLinking) {
      window.history.forward();
    }
  }, [enableDeepLinking]);

  const canGoBack = useCallback(() => {
    return navigationHistory.length > 1;
  }, [navigationHistory]);

  const canGoForward = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.history.length > 1;
    }
    return false;
  }, []);

  // Breadcrumb management
  const updateBreadcrumbs = useCallback((route, metadata = {}) => {
    const routeParts = route.split('/').filter(Boolean);
    const newBreadcrumbs = [];
    
    // Add home breadcrumb
    newBreadcrumbs.push({
      id: 'home',
      label: 'Home',
      route: '/',
      isActive: route === '/'
    });

    // Build breadcrumbs from route parts
    let currentPath = '';
    routeParts.forEach((part, index) => {
      currentPath += `/${part}`;
      const isLast = index === routeParts.length - 1;
      
      newBreadcrumbs.push({
        id: currentPath,
        label: metadata.breadcrumbLabel || formatBreadcrumbLabel(part),
        route: currentPath,
        isActive: isLast
      });
    });

    setBreadcrumbs(newBreadcrumbs);
  }, []);

  const navigateToBreadcrumb = useCallback((breadcrumb) => {
    navigate(breadcrumb.route, { 
      metadata: { breadcrumbNavigation: true },
      trackAnalytics: true 
    });
  }, [navigate]);

  // Analytics tracking
  const trackNavigation = useCallback((route, type, metadata = {}) => {
    if (!enableAnalytics) return;

    const timestamp = Date.now();
    const timeSpent = timestamp - sessionStartTime.current;

    const analyticsEvent = {
      id: generateEventId(),
      timestamp,
      route,
      type,
      metadata,
      timeSpent,
      sessionId: sessionData.sessionId,
      deviceType: isMobile ? 'mobile' : 'desktop',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : ''
    };

    // Add to analytics buffer
    analyticsRef.current.push(analyticsEvent);

    // Update session data
    setSessionData(prev => ({
      ...prev,
      pageViews: prev.pageViews + 1,
      totalTimeSpent: timeSpent,
      mostVisitedRoutes: {
        ...prev.mostVisitedRoutes,
        [route]: (prev.mostVisitedRoutes[route] || 0) + 1
      },
      userFlow: [...prev.userFlow, { route, timestamp, type }].slice(-20)
    }));

    // Send analytics if buffer is full
    if (analyticsRef.current.length >= 10) {
      flushAnalytics();
    }
  }, [enableAnalytics, sessionData.sessionId, isMobile]);

  const flushAnalytics = useCallback(() => {
    if (analyticsRef.current.length === 0) return;

    const events = [...analyticsRef.current];
    analyticsRef.current = [];

    // Send to analytics service (mock implementation)
    if (typeof window !== 'undefined' && window.gtag) {
      events.forEach(event => {
        window.gtag('event', 'navigation', {
          event_category: 'Navigation',
          event_label: event.route,
          custom_parameter_type: event.type,
          custom_parameter_device: event.deviceType
        });
      });
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.group('Navigation Analytics');
      events.forEach(event => {
        console.log(`${event.type}: ${event.route}`, event);
      });
      console.groupEnd();
    }
  }, []);

  // Flush analytics on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushAnalytics();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [flushAnalytics]);

  // Route matching utilities
  const matchRoute = useCallback((pattern, route = currentRoute) => {
    const patternParts = pattern.split('/').filter(Boolean);
    const routeParts = route.split('/').filter(Boolean);

    if (patternParts.length !== routeParts.length) {
      return null;
    }

    const params = {};
    const isMatch = patternParts.every((part, index) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = routeParts[index];
        return true;
      }
      return part === routeParts[index];
    });

    return isMatch ? params : null;
  }, [currentRoute]);

  const isActiveRoute = useCallback((route, exact = false) => {
    if (exact) {
      return currentRoute === route;
    }
    return currentRoute.startsWith(route);
  }, [currentRoute]);

  // Deep linking utilities
  const generateShareableLink = useCallback((route = currentRoute, params = {}) => {
    if (typeof window === 'undefined') return '';
    
    const url = new URL(route, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    return url.toString();
  }, [currentRoute]);

  const parseDeepLink = useCallback((url) => {
    try {
      const urlObj = new URL(url);
      const route = urlObj.pathname;
      const params = {};
      
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      return { route, params };
    } catch (e) {
      console.warn('Failed to parse deep link:', e);
      return null;
    }
  }, []);

  // Clear navigation state
  const clearNavigationState = useCallback(() => {
    setCurrentRoute(initialRoute);
    setNavigationHistory([initialRoute]);
    setBreadcrumbs([]);
    setRouteParams({});
    setRouteMetadata({});
    analyticsRef.current = [];
    
    if (persistState && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [initialRoute, persistState, storageKey]);

  return {
    // Current state
    currentRoute,
    navigationHistory,
    breadcrumbs,
    routeParams,
    routeMetadata,
    sessionData,

    // Navigation functions
    navigate,
    goBack,
    goForward,
    canGoBack,
    canGoForward,

    // Breadcrumb functions
    navigateToBreadcrumb,

    // Route utilities
    matchRoute,
    isActiveRoute,

    // Deep linking
    generateShareableLink,
    parseDeepLink,

    // Analytics
    trackNavigation,
    flushAnalytics,

    // State management
    clearNavigationState
  };
};

/**
 * Navigation Persistence Hook
 * Manages navigation state persistence across sessions
 */
export const useNavigationPersistence = ({
  storageKey = 'navigation-persistence',
  maxStoredSessions = 5
} = {}) => {
  const [savedSessions, setSavedSessions] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setSavedSessions(JSON.parse(saved));
        } catch (e) {
          console.warn('Failed to parse saved sessions:', e);
        }
      }
    }
  }, [storageKey]);

  const saveSession = useCallback((sessionData) => {
    const newSession = {
      id: generateSessionId(),
      timestamp: Date.now(),
      ...sessionData
    };

    setSavedSessions(prev => {
      const updated = [newSession, ...prev].slice(0, maxStoredSessions);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
      return updated;
    });
  }, [storageKey, maxStoredSessions]);

  const restoreSession = useCallback((sessionId) => {
    return savedSessions.find(session => session.id === sessionId);
  }, [savedSessions]);

  const clearSavedSessions = useCallback(() => {
    setSavedSessions([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  return {
    savedSessions,
    saveSession,
    restoreSession,
    clearSavedSessions
  };
};

// Utility functions
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateEventId() {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function formatBreadcrumbLabel(routePart) {
  return routePart
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default useNavigationState;