// Enhanced Navigation Provider Component
// Comprehensive navigation state management with analytics and deep linking

import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigationState } from '../../hooks/useNavigationState';
import navigationAnalytics from '../../services/navigationAnalytics';
import deepLinking from '../../services/deepLinking';

// Create navigation context
const NavigationContext = createContext();

/**
 * Enhanced Navigation Provider Component
 * Provides comprehensive navigation state management with analytics and deep linking
 */
export const NavigationProvider = ({ 
  children, 
  initialRoute = '/',
  persistNavigation = true,
  enableAnalytics = true,
  enableDeepLinking = true,
  analyticsConfig = {},
  deepLinkingConfig = {}
}) => {
  // Use the enhanced navigation state hook
  const navigationState = useNavigationState({
    initialRoute,
    persistState: persistNavigation,
    enableAnalytics,
    enableDeepLinking
  });

  // Legacy tab-based navigation state for backward compatibility
  const [activeTab, setActiveTab] = useState(() => {
    if (persistNavigation && typeof window !== 'undefined') {
      return localStorage.getItem('activeTab') || 'home';
    }
    return 'home';
  });

  const [tabBadges, setTabBadges] = useState({});

  // Initialize analytics if enabled
  useEffect(() => {
    if (enableAnalytics) {
      navigationAnalytics.config = { ...navigationAnalytics.config, ...analyticsConfig };
    }
  }, [enableAnalytics, analyticsConfig]);

  // Initialize deep linking if enabled
  useEffect(() => {
    if (enableDeepLinking) {
      deepLinking.config = { ...deepLinking.config, ...deepLinkingConfig };
      
      // Handle initial deep link if present
      const currentUrl = window.location.href;
      if (deepLinking.isDeepLink(currentUrl)) {
        deepLinking.handleDeepLink(currentUrl, (parsed) => {
          navigationState.navigate(parsed.route, {
            params: parsed.params,
            metadata: { ...parsed.metadata, deepLink: true }
          });
        });
      }
    }
  }, [enableDeepLinking, deepLinkingConfig, navigationState]);

  // Persist active tab to localStorage
  useEffect(() => {
    if (persistNavigation && typeof window !== 'undefined') {
      localStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab, persistNavigation]);

  // Enhanced tab change handler with analytics
  const handleTabChange = (tabId, tabData = null) => {
    const previousTab = activeTab;
    setActiveTab(tabId);
    
    // Clear badge for the active tab
    if (tabBadges[tabId]) {
      setTabBadges(prev => ({
        ...prev,
        [tabId]: null
      }));
    }

    // Track navigation analytics
    if (enableAnalytics) {
      navigationAnalytics.trackNavigation({
        action: 'tab_change',
        route: `/${tabId}`,
        previousRoute: `/${previousTab}`,
        tabData,
        trigger: 'tab_click'
      });

      navigationAnalytics.trackUserFlow(`/${previousTab}`, `/${tabId}`, 'tab_click');
    }
  };

  // Enhanced navigation with route support
  const navigate = (route, options = {}) => {
    const { trackAnalytics = true, ...navOptions } = options;
    
    navigationState.navigate(route, navOptions);
    
    if (trackAnalytics && enableAnalytics) {
      navigationAnalytics.trackPageView(route, options.metadata);
    }
  };

  // Navigate with deep link generation
  const navigateWithDeepLink = (route, params = {}, options = {}) => {
    navigate(route, { params, ...options });
    
    if (enableDeepLinking) {
      const deepLink = deepLinking.generateDeepLink(route, params, options);
      return deepLink;
    }
    
    return null;
  };

  // Generate shareable link for current route
  const generateShareableLink = (options = {}) => {
    if (!enableDeepLinking) return null;
    
    return deepLinking.generateDeepLink(
      navigationState.currentRoute,
      navigationState.routeParams,
      options
    );
  };

  // Generate medical-specific deep links
  const generateMedicalLink = (type, data, options = {}) => {
    if (!enableDeepLinking) return null;
    
    return deepLinking.generateMedicalDeepLink(type, data, options);
  };

  // Badge management
  const setBadge = (tabId, badge) => {
    setTabBadges(prev => ({
      ...prev,
      [tabId]: badge
    }));
  };

  const clearBadge = (tabId) => {
    setTabBadges(prev => ({
      ...prev,
      [tabId]: null
    }));
  };

  const clearAllBadges = () => {
    setTabBadges({});
  };

  // Analytics methods
  const getNavigationInsights = () => {
    if (!enableAnalytics) return null;
    return navigationAnalytics.getNavigationInsights();
  };

  const trackCustomEvent = (eventData) => {
    if (enableAnalytics) {
      navigationAnalytics.trackNavigation(eventData);
    }
  };

  // Deep linking methods
  const shareCurrentPage = async (shareData = {}) => {
    if (!enableDeepLinking) return false;
    
    const deepLink = generateShareableLink({ trackable: true });
    return deepLinking.shareDeepLink(deepLink, shareData);
  };

  const copyCurrentPageLink = async () => {
    if (!enableDeepLinking) return false;
    
    const deepLink = generateShareableLink({ trackable: true });
    return deepLinking.copyToClipboard(deepLink);
  };

  // Legacy methods for backward compatibility
  const getPreviousTab = () => {
    const history = navigationState.navigationHistory;
    if (history.length < 2) return null;
    return history[history.length - 2].replace('/', '') || 'home';
  };

  const canGoBack = () => {
    return navigationState.canGoBack();
  };

  const goBack = () => {
    navigationState.goBack();
    
    if (enableAnalytics) {
      navigationAnalytics.trackBrowserNavigation('back', navigationState.currentRoute);
    }
  };

  const value = {
    // Enhanced navigation state
    ...navigationState,
    
    // Legacy tab-based navigation (backward compatibility)
    activeTab,
    setActiveTab,
    handleTabChange,
    tabBadges,
    setBadge,
    clearBadge,
    clearAllBadges,
    getPreviousTab,
    goBack,
    canGoBack,

    // Enhanced navigation methods
    navigate,
    navigateWithDeepLink,
    generateShareableLink,
    generateMedicalLink,

    // Analytics methods
    getNavigationInsights,
    trackCustomEvent,

    // Deep linking methods
    shareCurrentPage,
    copyCurrentPageLink,

    // Configuration
    enableAnalytics,
    enableDeepLinking
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * Hook to use navigation context
 */
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

/**
 * Higher-order component for navigation-aware components
 */
export const withNavigation = (Component) => {
  return React.forwardRef((props, ref) => {
    const navigation = useNavigation();
    
    return (
      <Component
        {...props}
        ref={ref}
        navigation={navigation}
      />
    );
  });
};

/**
 * Navigation Guard Component
 * Conditionally renders content based on active tab
 */
export const NavigationGuard = ({ 
  allowedTabs = [], 
  activeTab: propActiveTab,
  children,
  fallback = null 
}) => {
  const { activeTab: contextActiveTab } = useNavigation();
  const activeTab = propActiveTab || contextActiveTab;
  
  const isAllowed = allowedTabs.length === 0 || allowedTabs.includes(activeTab);
  
  return isAllowed ? children : fallback;
};

/**
 * Tab Content Component
 * Renders content for specific tabs with lazy loading
 */
export const TabContent = ({ 
  tabId, 
  children, 
  lazy = false,
  keepAlive = false,
  className = '' 
}) => {
  const { activeTab, navigationHistory } = useNavigation();
  const [hasBeenActive, setHasBeenActive] = useState(!lazy || activeTab === tabId);
  
  // Track if tab has been active for lazy loading
  useEffect(() => {
    if (activeTab === tabId) {
      setHasBeenActive(true);
    }
  }, [activeTab, tabId]);
  
  const isActive = activeTab === tabId;
  const shouldRender = !lazy || hasBeenActive;
  const shouldShow = isActive || (keepAlive && hasBeenActive);
  
  if (!shouldRender) {
    return null;
  }
  
  return (
    <div 
      className={`${shouldShow ? 'block' : 'hidden'} ${className}`}
      role="tabpanel"
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
};

// PropTypes
NavigationProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialTab: PropTypes.string,
  persistNavigation: PropTypes.bool
};

NavigationGuard.propTypes = {
  allowedTabs: PropTypes.arrayOf(PropTypes.string),
  activeTab: PropTypes.string,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node
};

TabContent.propTypes = {
  tabId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  lazy: PropTypes.bool,
  keepAlive: PropTypes.bool,
  className: PropTypes.string
};

export default NavigationProvider;