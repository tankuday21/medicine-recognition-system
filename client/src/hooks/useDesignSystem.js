// React Hook for Design System Integration
// Provides reactive access to design system utilities and responsive behavior

import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentBreakpoint,
  isMobile,
  isTablet,
  isDesktop,
  supportsHover,
  prefersReducedMotion,
  prefersHighContrast
} from '../utils/design-system';

/**
 * Hook for responsive design system utilities
 * @returns {object} - Responsive utilities and current breakpoint info
 */
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState(() => getCurrentBreakpoint());
  const [deviceType, setDeviceType] = useState(() => ({
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop()
  }));

  const updateBreakpoint = useCallback(() => {
    const newBreakpoint = getCurrentBreakpoint();
    setBreakpoint(newBreakpoint);
    setDeviceType({
      isMobile: isMobile(),
      isTablet: isTablet(),
      isDesktop: isDesktop()
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      updateBreakpoint();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateBreakpoint]);

  return {
    breakpoint,
    ...deviceType,
    updateBreakpoint
  };
};

/**
 * Hook for theme management (light/dark mode)
 * @returns {object} - Theme utilities and current theme
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    
    // Check localStorage first
    const stored = localStorage.getItem('theme');
    if (stored && ['light', 'dark', 'auto'].includes(stored)) {
      return stored;
    }
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const effectiveTheme = theme === 'auto' ? systemTheme : theme;

  const toggleTheme = useCallback(() => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [effectiveTheme]);

  const setThemeMode = useCallback((mode) => {
    if (['light', 'dark', 'auto'].includes(mode)) {
      setTheme(mode);
      localStorage.setItem('theme', mode);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [effectiveTheme]);

  return {
    theme,
    effectiveTheme,
    systemTheme,
    isDark: effectiveTheme === 'dark',
    isLight: effectiveTheme === 'light',
    toggleTheme,
    setThemeMode
  };
};

/**
 * Hook for accessibility preferences
 * @returns {object} - Accessibility preference utilities
 */
export const useAccessibility = () => {
  const [preferences, setPreferences] = useState(() => ({
    reducedMotion: prefersReducedMotion(),
    highContrast: prefersHighContrast(),
    supportsHover: supportsHover()
  }));

  useEffect(() => {
    const updatePreferences = () => {
      setPreferences({
        reducedMotion: prefersReducedMotion(),
        highContrast: prefersHighContrast(),
        supportsHover: supportsHover()
      });
    };

    // Listen for changes in accessibility preferences
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const hoverQuery = window.matchMedia('(hover: hover)');

    reducedMotionQuery.addEventListener('change', updatePreferences);
    highContrastQuery.addEventListener('change', updatePreferences);
    hoverQuery.addEventListener('change', updatePreferences);

    return () => {
      reducedMotionQuery.removeEventListener('change', updatePreferences);
      highContrastQuery.removeEventListener('change', updatePreferences);
      hoverQuery.removeEventListener('change', updatePreferences);
    };
  }, []);

  return preferences;
};

/**
 * Hook for managing component animations based on user preferences
 * @param {object} options - Animation options
 * @returns {object} - Animation utilities
 */
export const useAnimation = (options = {}) => {
  const { reducedMotion } = useAccessibility();
  const {
    enabledDuration = 300,
    disabledDuration = 0,
    enabledEasing = 'ease-out',
    disabledEasing = 'linear'
  } = options;

  const shouldAnimate = !reducedMotion;
  const duration = shouldAnimate ? enabledDuration : disabledDuration;
  const easing = shouldAnimate ? enabledEasing : disabledEasing;

  const getAnimationProps = useCallback((animationOptions = {}) => {
    const {
      duration: customDuration,
      easing: customEasing,
      ...otherProps
    } = animationOptions;

    return {
      ...otherProps,
      transition: {
        duration: shouldAnimate ? (customDuration || duration) / 1000 : 0,
        ease: shouldAnimate ? (customEasing || easing) : 'linear',
        ...otherProps.transition
      }
    };
  }, [shouldAnimate, duration, easing]);

  return {
    shouldAnimate,
    duration,
    easing,
    getAnimationProps
  };
};

/**
 * Hook for managing touch interactions on mobile devices
 * @returns {object} - Touch interaction utilities
 */
export const useTouch = () => {
  const { isMobile } = useResponsive();
  const { supportsHover } = useAccessibility();
  
  const [touchState, setTouchState] = useState({
    isPressed: false,
    touchStart: null,
    touchEnd: null
  });

  const handleTouchStart = useCallback((e) => {
    setTouchState(prev => ({
      ...prev,
      isPressed: true,
      touchStart: {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      }
    }));
  }, []);

  const handleTouchEnd = useCallback((e) => {
    setTouchState(prev => ({
      ...prev,
      isPressed: false,
      touchEnd: {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now()
      }
    }));
  }, []);

  const getTouchProps = useCallback((options = {}) => {
    const { onTap, onLongPress, longPressDuration = 500 } = options;

    if (!isMobile) return {};

    return {
      onTouchStart: handleTouchStart,
      onTouchEnd: (e) => {
        handleTouchEnd(e);
        
        if (touchState.touchStart && onTap) {
          const duration = Date.now() - touchState.touchStart.time;
          const distance = Math.sqrt(
            Math.pow(e.changedTouches[0].clientX - touchState.touchStart.x, 2) +
            Math.pow(e.changedTouches[0].clientY - touchState.touchStart.y, 2)
          );
          
          if (duration < longPressDuration && distance < 10) {
            onTap(e);
          } else if (duration >= longPressDuration && onLongPress) {
            onLongPress(e);
          }
        }
      }
    };
  }, [isMobile, touchState, handleTouchStart, handleTouchEnd]);

  return {
    isMobile,
    supportsHover,
    touchState,
    getTouchProps
  };
};

/**
 * Hook for managing safe area insets on mobile devices
 * @returns {object} - Safe area utilities
 */
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0,
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0,
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  const getSafeAreaStyle = useCallback((sides = ['top', 'bottom', 'left', 'right']) => {
    const style = {};
    
    if (sides.includes('top')) style.paddingTop = `${safeArea.top}px`;
    if (sides.includes('bottom')) style.paddingBottom = `${safeArea.bottom}px`;
    if (sides.includes('left')) style.paddingLeft = `${safeArea.left}px`;
    if (sides.includes('right')) style.paddingRight = `${safeArea.right}px`;
    
    return style;
  }, [safeArea]);

  return {
    safeArea,
    getSafeAreaStyle,
    hasSafeArea: Object.values(safeArea).some(value => value > 0)
  };
};

/**
 * Main design system hook that combines all utilities
 * @returns {object} - Complete design system utilities
 */
export const useDesignSystem = () => {
  const responsive = useResponsive();
  const theme = useTheme();
  const accessibility = useAccessibility();
  const animation = useAnimation();
  const touch = useTouch();
  const safeArea = useSafeArea();

  return {
    responsive,
    theme,
    accessibility,
    animation,
    touch,
    safeArea
  };
};

export default useDesignSystem;