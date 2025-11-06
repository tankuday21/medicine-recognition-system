// Animation Management Hook
// Manages animation preferences, performance, and reduced motion support

import { useState, useEffect, useCallback, useRef } from 'react';
import { useResponsive } from './useDesignSystem';

/**
 * Animation Performance Hook
 * Manages animation performance and user preferences
 */
export const useAnimations = ({
  enableAnimations = true,
  respectReducedMotion = true,
  performanceMode = 'auto', // 'auto', 'high', 'low'
  debugMode = false
} = {}) => {
  const { isMobile } = useResponsive();
  const [animationsEnabled, setAnimationsEnabled] = useState(enableAnimations);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [performanceLevel, setPerformanceLevel] = useState(performanceMode);
  const frameRateRef = useRef([]);
  const lastFrameTime = useRef(performance.now());

  // Check for reduced motion preference
  useEffect(() => {
    if (!respectReducedMotion) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e) => {
      setReducedMotion(e.matches);
      if (e.matches) {
        setAnimationsEnabled(false);
      }
    };

    setReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setAnimationsEnabled(false);
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [respectReducedMotion]);

  // Auto-detect performance level
  useEffect(() => {
    if (performanceMode !== 'auto') return;

    const detectPerformance = () => {
      // Check device capabilities
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;
      const deviceMemory = navigator.deviceMemory || 4;
      const connection = navigator.connection;

      let score = 0;

      // CPU score
      if (hardwareConcurrency >= 8) score += 3;
      else if (hardwareConcurrency >= 4) score += 2;
      else score += 1;

      // Memory score
      if (deviceMemory >= 8) score += 3;
      else if (deviceMemory >= 4) score += 2;
      else score += 1;

      // Connection score
      if (connection) {
        if (connection.effectiveType === '4g') score += 2;
        else if (connection.effectiveType === '3g') score += 1;
      } else {
        score += 2; // Assume good connection if unknown
      }

      // Device type penalty
      if (isMobile) score -= 1;

      // Determine performance level
      if (score >= 7) setPerformanceLevel('high');
      else if (score >= 4) setPerformanceLevel('medium');
      else setPerformanceLevel('low');
    };

    detectPerformance();
  }, [performanceMode, isMobile]);

  // Monitor frame rate
  useEffect(() => {
    if (!debugMode) return;

    let animationId;
    
    const measureFrameRate = () => {
      const now = performance.now();
      const delta = now - lastFrameTime.current;
      const fps = 1000 / delta;
      
      frameRateRef.current.push(fps);
      if (frameRateRef.current.length > 60) {
        frameRateRef.current.shift();
      }
      
      lastFrameTime.current = now;
      animationId = requestAnimationFrame(measureFrameRate);
    };

    animationId = requestAnimationFrame(measureFrameRate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [debugMode]);

  // Get animation configuration based on performance level
  const getAnimationConfig = useCallback((animationType = 'default') => {
    if (!animationsEnabled || reducedMotion) {
      return {
        duration: 0,
        ease: 'linear',
        enabled: false
      };
    }

    const configs = {
      high: {
        default: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
        fast: { duration: 0.15, ease: 'easeOut' },
        slow: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
        spring: { type: 'spring', stiffness: 300, damping: 30 },
        bounce: { type: 'spring', stiffness: 400, damping: 10 }
      },
      medium: {
        default: { duration: 0.25, ease: 'easeOut' },
        fast: { duration: 0.15, ease: 'easeOut' },
        slow: { duration: 0.4, ease: 'easeOut' },
        spring: { type: 'spring', stiffness: 200, damping: 25 },
        bounce: { type: 'spring', stiffness: 300, damping: 15 }
      },
      low: {
        default: { duration: 0.2, ease: 'linear' },
        fast: { duration: 0.1, ease: 'linear' },
        slow: { duration: 0.3, ease: 'linear' },
        spring: { duration: 0.2, ease: 'easeOut' },
        bounce: { duration: 0.2, ease: 'easeOut' }
      }
    };

    const config = configs[performanceLevel] || configs.medium;
    return {
      ...config[animationType] || config.default,
      enabled: true
    };
  }, [animationsEnabled, reducedMotion, performanceLevel]);

  // Get stagger configuration
  const getStaggerConfig = useCallback((itemCount = 5) => {
    if (!animationsEnabled || reducedMotion) {
      return { staggerChildren: 0, delayChildren: 0 };
    }

    const baseDelay = performanceLevel === 'high' ? 0.1 : 
                     performanceLevel === 'medium' ? 0.08 : 0.05;
    
    const maxDelay = Math.min(baseDelay * itemCount, 1); // Cap at 1 second
    const staggerDelay = maxDelay / itemCount;

    return {
      staggerChildren: staggerDelay,
      delayChildren: performanceLevel === 'high' ? 0.2 : 0.1
    };
  }, [animationsEnabled, reducedMotion, performanceLevel]);

  // Get loading animation configuration
  const getLoadingConfig = useCallback(() => {
    if (!animationsEnabled || reducedMotion) {
      return { type: 'static' };
    }

    return {
      type: performanceLevel === 'low' ? 'simple' : 'advanced',
      duration: performanceLevel === 'high' ? 1 : 1.5,
      complexity: performanceLevel === 'high' ? 'high' : 'medium'
    };
  }, [animationsEnabled, reducedMotion, performanceLevel]);

  // Toggle animations
  const toggleAnimations = useCallback(() => {
    setAnimationsEnabled(prev => !prev);
  }, []);

  // Force performance level
  const setPerformanceMode = useCallback((mode) => {
    setPerformanceLevel(mode);
  }, []);

  // Get current frame rate
  const getCurrentFrameRate = useCallback(() => {
    if (frameRateRef.current.length === 0) return 60;
    
    const sum = frameRateRef.current.reduce((a, b) => a + b, 0);
    return Math.round(sum / frameRateRef.current.length);
  }, []);

  // Check if animations should be disabled due to performance
  const shouldDisableAnimations = useCallback(() => {
    if (!debugMode) return false;
    
    const currentFPS = getCurrentFrameRate();
    return currentFPS < 30; // Disable if FPS drops below 30
  }, [debugMode, getCurrentFrameRate]);

  return {
    // State
    animationsEnabled,
    reducedMotion,
    performanceLevel,
    
    // Configuration getters
    getAnimationConfig,
    getStaggerConfig,
    getLoadingConfig,
    
    // Controls
    toggleAnimations,
    setPerformanceMode,
    
    // Performance monitoring
    getCurrentFrameRate,
    shouldDisableAnimations,
    
    // Utilities
    isHighPerformance: performanceLevel === 'high',
    isMediumPerformance: performanceLevel === 'medium',
    isLowPerformance: performanceLevel === 'low'
  };
};

/**
 * Intersection Observer Animation Hook
 * Triggers animations when elements enter viewport
 */
export const useInViewAnimation = ({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  animationConfig = {}
} = {}) => {
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef(null);
  const { getAnimationConfig } = useAnimations();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        
        if (inView && (!triggerOnce || !hasTriggered)) {
          setIsInView(true);
          setHasTriggered(true);
        } else if (!triggerOnce && !inView) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  const animationProps = {
    initial: { opacity: 0, y: 20 },
    animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    transition: getAnimationConfig('default'),
    ...animationConfig
  };

  return {
    ref: elementRef,
    isInView,
    animationProps
  };
};

/**
 * Scroll-triggered Animation Hook
 * Creates scroll-based animations
 */
export const useScrollAnimation = ({
  offset = 100,
  duration = 0.3,
  easing = 'easeOut'
} = {}) => {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsScrolling(true);

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  const getScrollProgress = useCallback((elementHeight = 0) => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    return Math.min(scrollY / documentHeight, 1);
  }, [scrollY]);

  const getParallaxOffset = useCallback((speed = 0.5) => {
    return scrollY * speed;
  }, [scrollY]);

  const getFadeOpacity = useCallback((startOffset = 0, endOffset = 200) => {
    if (scrollY < startOffset) return 1;
    if (scrollY > endOffset) return 0;
    return 1 - ((scrollY - startOffset) / (endOffset - startOffset));
  }, [scrollY]);

  return {
    scrollY,
    isScrolling,
    getScrollProgress,
    getParallaxOffset,
    getFadeOpacity
  };
};

/**
 * Gesture Animation Hook
 * Handles touch gesture animations
 */
export const useGestureAnimation = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocity = 0.3
} = {}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const startTime = useRef(0);

  const handleDragStart = useCallback((event, info) => {
    setIsDragging(true);
    startPos.current = { x: info.point.x, y: info.point.y };
    startTime.current = Date.now();
  }, []);

  const handleDrag = useCallback((event, info) => {
    setDragOffset({ x: info.offset.x, y: info.offset.y });
  }, []);

  const handleDragEnd = useCallback((event, info) => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });

    const deltaX = info.point.x - startPos.current.x;
    const deltaY = info.point.y - startPos.current.y;
    const deltaTime = Date.now() - startTime.current;
    const velocityX = Math.abs(deltaX) / deltaTime;
    const velocityY = Math.abs(deltaY) / deltaTime;

    // Check for swipe gestures
    if (Math.abs(deltaX) > threshold && velocityX > velocity) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (Math.abs(deltaY) > threshold && velocityY > velocity) {
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }
  }, [threshold, velocity, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    isDragging,
    dragOffset,
    dragHandlers: {
      onDragStart: handleDragStart,
      onDrag: handleDrag,
      onDragEnd: handleDragEnd
    }
  };
};

export default useAnimations;