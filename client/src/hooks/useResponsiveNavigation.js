// Responsive Navigation Hook
// Manages navigation behavior across different screen sizes

import { useState, useEffect, useCallback } from 'react';
import { useResponsive } from './useDesignSystem';

/**
 * Hook for responsive navigation behavior
 * Adapts navigation patterns based on screen size and device capabilities
 */
export const useResponsiveNavigation = ({
  mobileBreakpoint = 768,
  enableGestures = true,
  autoHideOnScroll = true
} = {}) => {
  const { isMobile, isTablet, breakpoint } = useResponsive();
  const [isNavigationVisible, setIsNavigationVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');

  // Determine navigation type based on screen size
  const getNavigationType = useCallback(() => {
    if (isMobile) return 'bottom';
    if (isTablet) return 'side-collapsed';
    return 'side-expanded';
  }, [isMobile, isTablet]);

  // Handle scroll behavior for auto-hide
  useEffect(() => {
    if (!autoHideOnScroll || !isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      
      setScrollDirection(direction);
      
      // Hide navigation when scrolling down, show when scrolling up
      if (direction === 'down' && currentScrollY > 100) {
        setIsNavigationVisible(false);
      } else if (direction === 'up' || currentScrollY < 50) {
        setIsNavigationVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    const throttledHandleScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [lastScrollY, autoHideOnScroll, isMobile]);

  // Handle touch gestures for navigation
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = useCallback((e) => {
    if (!enableGestures || !isMobile) return;
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    });
  }, [enableGestures, isMobile]);

  const handleTouchMove = useCallback((e) => {
    if (!enableGestures || !isMobile) return;
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    });
  }, [enableGestures, isMobile]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || !enableGestures || !isMobile) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const timeElapsed = touchEnd.time - touchStart.time;
    
    const isLeftSwipe = distanceX > 50 && Math.abs(distanceY) < 100 && timeElapsed < 300;
    const isRightSwipe = distanceX < -50 && Math.abs(distanceY) < 100 && timeElapsed < 300;
    const isUpSwipe = distanceY > 50 && Math.abs(distanceX) < 100 && timeElapsed < 300;
    const isDownSwipe = distanceY < -50 && Math.abs(distanceX) < 100 && timeElapsed < 300;

    return {
      isLeftSwipe,
      isRightSwipe,
      isUpSwipe,
      isDownSwipe,
      distanceX,
      distanceY,
      timeElapsed
    };
  }, [touchStart, touchEnd, enableGestures, isMobile]);

  // Get navigation configuration based on screen size
  const getNavigationConfig = useCallback(() => {
    const navigationType = getNavigationType();
    
    return {
      type: navigationType,
      position: navigationType === 'bottom' ? 'bottom' : 'left',
      isCollapsible: navigationType.includes('side'),
      showLabels: navigationType === 'bottom' || navigationType === 'side-expanded',
      iconSize: isMobile ? 'md' : 'sm',
      spacing: isMobile ? 'comfortable' : 'compact',
      variant: isMobile ? 'mobile' : 'desktop'
    };
  }, [getNavigationType, isMobile]);

  // Handle navigation visibility toggle
  const toggleNavigation = useCallback(() => {
    setIsNavigationVisible(prev => !prev);
  }, []);

  // Force show navigation
  const showNavigation = useCallback(() => {
    setIsNavigationVisible(true);
  }, []);

  // Force hide navigation
  const hideNavigation = useCallback(() => {
    setIsNavigationVisible(false);
  }, []);

  // Check if navigation should be persistent
  const isPersistent = useCallback(() => {
    return !isMobile && !isTablet;
  }, [isMobile, isTablet]);

  // Get safe area adjustments
  const getSafeAreaAdjustments = useCallback(() => {
    if (typeof window === 'undefined') return {};
    
    const safeAreaTop = getComputedStyle(document.documentElement)
      .getPropertyValue('env(safe-area-inset-top)') || '0px';
    const safeAreaBottom = getComputedStyle(document.documentElement)
      .getPropertyValue('env(safe-area-inset-bottom)') || '0px';
    const safeAreaLeft = getComputedStyle(document.documentElement)
      .getPropertyValue('env(safe-area-inset-left)') || '0px';
    const safeAreaRight = getComputedStyle(document.documentElement)
      .getPropertyValue('env(safe-area-inset-right)') || '0px';

    return {
      top: safeAreaTop,
      bottom: safeAreaBottom,
      left: safeAreaLeft,
      right: safeAreaRight
    };
  }, []);

  return {
    // Navigation state
    isNavigationVisible,
    navigationType: getNavigationType(),
    navigationConfig: getNavigationConfig(),
    scrollDirection,
    isPersistent: isPersistent(),
    
    // Navigation controls
    toggleNavigation,
    showNavigation,
    hideNavigation,
    
    // Touch gesture handling
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    
    // Device information
    isMobile,
    isTablet,
    breakpoint,
    
    // Safe area adjustments
    safeArea: getSafeAreaAdjustments()
  };
};

/**
 * Hook for navigation item badges and notifications
 */
export const useNavigationBadges = () => {
  const [badges, setBadges] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Add or update badge
  const setBadge = useCallback((itemId, count, variant = 'default') => {
    setBadges(prev => ({
      ...prev,
      [itemId]: { count, variant, timestamp: Date.now() }
    }));
  }, []);

  // Remove badge
  const clearBadge = useCallback((itemId) => {
    setBadges(prev => {
      const newBadges = { ...prev };
      delete newBadges[itemId];
      return newBadges;
    });
  }, []);

  // Clear all badges
  const clearAllBadges = useCallback(() => {
    setBadges({});
  }, []);

  // Add notification
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      timestamp: Date.now(),
      ...notification
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after timeout if specified
    if (notification.timeout) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.timeout);
    }
    
    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    badges,
    notifications,
    setBadge,
    clearBadge,
    clearAllBadges,
    addNotification,
    removeNotification,
    clearAllNotifications
  };
};

// Utility function for throttling
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export default useResponsiveNavigation;