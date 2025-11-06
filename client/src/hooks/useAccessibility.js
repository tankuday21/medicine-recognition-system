// Accessibility Hooks
// React hooks for accessibility features and screen reader support

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Screen Reader Hook
 * Manages screen reader announcements and live regions
 */
export const useScreenReader = () => {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const liveRegionRef = useRef(null);
  const politeRegionRef = useRef(null);

  useEffect(() => {
    // Detect screen reader usage
    const detectScreenReader = () => {
      // Check for common screen reader indicators
      const hasScreenReader = 
        window.speechSynthesis ||
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver') ||
        window.navigator.userAgent.includes('Talkback');
      
      setIsScreenReaderActive(!!hasScreenReader);
    };

    detectScreenReader();

    // Create live regions if they don't exist
    if (!document.getElementById('sr-live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'sr-live-region';
      liveRegion.setAttribute('aria-live', 'assertive');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `;
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    if (!document.getElementById('sr-polite-region')) {
      const politeRegion = document.createElement('div');
      politeRegion.id = 'sr-polite-region';
      politeRegion.setAttribute('aria-live', 'polite');
      politeRegion.setAttribute('aria-atomic', 'true');
      politeRegion.className = 'sr-only';
      politeRegion.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `;
      document.body.appendChild(politeRegion);
      politeRegionRef.current = politeRegion;
    }
  }, []);

  const announce = useCallback((message, priority = 'polite') => {
    const region = priority === 'assertive' ? liveRegionRef.current : politeRegionRef.current;
    if (region) {
      // Clear and set message
      region.textContent = '';
      setTimeout(() => {
        region.textContent = message;
      }, 100);
    }
  }, []);

  const announceNavigation = useCallback((pageName, context = '') => {
    const message = context 
      ? `Navigated to ${pageName}. ${context}`
      : `Navigated to ${pageName}`;
    announce(message, 'polite');
  }, [announce]);

  const announceAction = useCallback((action, result = '') => {
    const message = result 
      ? `${action}. ${result}`
      : action;
    announce(message, 'assertive');
  }, [announce]);

  const announceError = useCallback((error) => {
    announce(`Error: ${error}`, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message) => {
    announce(`Success: ${message}`, 'polite');
  }, [announce]);

  return {
    isScreenReaderActive,
    announce,
    announceNavigation,
    announceAction,
    announceError,
    announceSuccess
  };
};

/**
 * Keyboard Navigation Hook
 * Manages keyboard navigation and focus management
 */
export const useKeyboardNavigation = (options = {}) => {
  const {
    trapFocus = false,
    restoreFocus = true,
    autoFocus = false
  } = options;

  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [autoFocus]);

  useEffect(() => {
    if (trapFocus) {
      previousFocusRef.current = document.activeElement;
      
      const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
          handleTabKey(e, containerRef.current);
        }
        if (e.key === 'Escape') {
          handleEscapeKey();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        
        if (restoreFocus && previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [trapFocus, restoreFocus]);

  const getFocusableElements = useCallback((container) => {
    if (!container) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(el => !el.hasAttribute('aria-hidden'));
  }, []);

  const handleTabKey = useCallback((e, container) => {
    if (!container) return;

    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, [getFocusableElements]);

  const handleEscapeKey = useCallback(() => {
    if (restoreFocus && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [restoreFocus]);

  const focusFirst = useCallback(() => {
    if (containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      firstFocusable?.focus();
    }
  }, [getFocusableElements]);

  const focusLast = useCallback(() => {
    if (containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current);
      const lastFocusable = focusableElements[focusableElements.length - 1];
      lastFocusable?.focus();
    }
  }, [getFocusableElements]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    getFocusableElements: () => getFocusableElements(containerRef.current)
  };
};

/**
 * Focus Management Hook
 * Advanced focus management for complex components
 */
export const useFocusManagement = () => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const itemsRef = useRef([]);

  const registerItem = useCallback((element, index) => {
    if (element) {
      itemsRef.current[index] = element;
    }
  }, []);

  const focusItem = useCallback((index) => {
    const item = itemsRef.current[index];
    if (item) {
      item.focus();
      setFocusedIndex(index);
    }
  }, []);

  const focusNext = useCallback(() => {
    const nextIndex = Math.min(focusedIndex + 1, itemsRef.current.length - 1);
    focusItem(nextIndex);
  }, [focusedIndex, focusItem]);

  const focusPrevious = useCallback(() => {
    const prevIndex = Math.max(focusedIndex - 1, 0);
    focusItem(prevIndex);
  }, [focusedIndex, focusItem]);

  const focusFirst = useCallback(() => {
    focusItem(0);
  }, [focusItem]);

  const focusLast = useCallback(() => {
    focusItem(itemsRef.current.length - 1);
  }, [focusItem]);

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusNext();
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusPrevious();
        break;
      case 'Home':
        e.preventDefault();
        focusFirst();
        break;
      case 'End':
        e.preventDefault();
        focusLast();
        break;
    }
  }, [focusNext, focusPrevious, focusFirst, focusLast]);

  return {
    focusedIndex,
    registerItem,
    focusItem,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    handleKeyDown
  };
};

/**
 * ARIA Attributes Hook
 * Generates appropriate ARIA attributes for components
 */
export const useAriaAttributes = (options = {}) => {
  const {
    role,
    label,
    labelledBy,
    describedBy,
    expanded,
    selected,
    checked,
    disabled,
    required,
    invalid,
    live,
    atomic
  } = options;

  const ariaAttributes = {};

  if (role) ariaAttributes.role = role;
  if (label) ariaAttributes['aria-label'] = label;
  if (labelledBy) ariaAttributes['aria-labelledby'] = labelledBy;
  if (describedBy) ariaAttributes['aria-describedby'] = describedBy;
  if (expanded !== undefined) ariaAttributes['aria-expanded'] = expanded;
  if (selected !== undefined) ariaAttributes['aria-selected'] = selected;
  if (checked !== undefined) ariaAttributes['aria-checked'] = checked;
  if (disabled) ariaAttributes['aria-disabled'] = disabled;
  if (required) ariaAttributes['aria-required'] = required;
  if (invalid) ariaAttributes['aria-invalid'] = invalid;
  if (live) ariaAttributes['aria-live'] = live;
  if (atomic !== undefined) ariaAttributes['aria-atomic'] = atomic;

  return ariaAttributes;
};

/**
 * Skip Links Hook
 * Manages skip navigation links
 */
export const useSkipLinks = () => {
  const [skipLinks] = useState([
    { id: 'main-content', label: 'Skip to main content' },
    { id: 'navigation', label: 'Skip to navigation' },
    { id: 'search', label: 'Skip to search' },
    { id: 'footer', label: 'Skip to footer' }
  ]);

  const skipTo = useCallback((targetId) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return {
    skipLinks,
    skipTo
  };
};

/**
 * Reduced Motion Hook
 * Detects and respects user's motion preferences
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * High Contrast Hook
 * Detects high contrast mode preference
 */
export const useHighContrast = () => {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
};

/**
 * Landmark Navigation Hook
 * Manages landmark regions for screen readers
 */
export const useLandmarkNavigation = () => {
  const [landmarks] = useState([
    { id: 'banner', role: 'banner', label: 'Site header' },
    { id: 'navigation', role: 'navigation', label: 'Main navigation' },
    { id: 'main', role: 'main', label: 'Main content' },
    { id: 'complementary', role: 'complementary', label: 'Sidebar' },
    { id: 'contentinfo', role: 'contentinfo', label: 'Site footer' }
  ]);

  const navigateToLandmark = useCallback((landmarkId) => {
    const landmark = document.querySelector(`[role="${landmarkId}"], #${landmarkId}`);
    if (landmark) {
      landmark.focus();
      landmark.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return {
    landmarks,
    navigateToLandmark
  };
};

export default {
  useScreenReader,
  useKeyboardNavigation,
  useFocusManagement,
  useAriaAttributes,
  useSkipLinks,
  useReducedMotion,
  useHighContrast,
  useLandmarkNavigation
};