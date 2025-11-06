// Design System Utilities
// Helper functions for working with the premium design system

import { designTokens, componentTokens } from '../styles/design-tokens';

/**
 * Get a color value from the design tokens
 * @param {string} colorPath - Dot notation path to color (e.g., 'primary.500')
 * @returns {string|null} - Color value or null if not found
 */
export const getColor = (colorPath) => {
  const keys = colorPath.split('.');
  let value = designTokens.colors;
  
  for (const key of keys) {
    value = value[key];
    if (!value) return null;
  }
  
  return value;
};

/**
 * Get a spacing value from the design tokens
 * @param {string|number} size - Spacing size key
 * @returns {string} - Spacing value
 */
export const getSpacing = (size) => {
  return designTokens.spacing[size] || size;
};

/**
 * Get a shadow value from the design tokens
 * @param {string} size - Shadow size key
 * @returns {string} - Shadow value
 */
export const getShadow = (size) => {
  return designTokens.shadows[size] || designTokens.shadows.DEFAULT;
};

/**
 * Get a breakpoint value from the design tokens
 * @param {string} size - Breakpoint size key
 * @returns {string} - Breakpoint value
 */
export const getBreakpoint = (size) => {
  return designTokens.breakpoints[size];
};

/**
 * Generate component classes based on variant
 * @param {string} component - Component name (e.g., 'button', 'card')
 * @param {string} variant - Variant name (e.g., 'primary', 'secondary')
 * @returns {object} - Object with class strings for different states
 */
export const getComponentClasses = (component, variant) => {
  const componentConfig = componentTokens[component];
  if (!componentConfig || !componentConfig[variant]) {
    console.warn(`Component variant not found: ${component}.${variant}`);
    return {};
  }
  
  return componentConfig[variant];
};

/**
 * Create responsive class string
 * @param {object} classes - Object with breakpoint keys and class values
 * @returns {string} - Responsive class string
 */
export const createResponsiveClasses = (classes) => {
  const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  let classString = '';
  
  // Add base classes (no prefix)
  if (classes.base || classes.default) {
    classString += classes.base || classes.default;
  }
  
  // Add responsive classes
  breakpointOrder.forEach(breakpoint => {
    if (classes[breakpoint]) {
      classString += ` ${breakpoint}:${classes[breakpoint]}`;
    }
  });
  
  return classString.trim();
};

/**
 * Generate touch-friendly size classes
 * @param {string} size - Size variant ('sm', 'md', 'lg')
 * @returns {string} - Touch target classes
 */
export const getTouchTargetClasses = (size = 'sm') => {
  const sizeMap = {
    sm: 'touch-target',
    md: 'touch-target-md',
    lg: 'touch-target-lg'
  };
  
  return sizeMap[size] || sizeMap.sm;
};

/**
 * Generate animation classes with duration and easing
 * @param {string} animation - Animation name
 * @param {string} duration - Duration ('fast', 'normal', 'slow')
 * @param {string} easing - Easing function name
 * @returns {string} - Animation class string
 */
export const getAnimationClasses = (animation, duration = 'normal', easing = 'out') => {
  const durationClass = `duration-${designTokens.animations.duration[duration]?.replace('ms', '')}`;
  const easingClass = `ease-${easing}`;
  
  return `${animation} ${durationClass} ${easingClass}`.trim();
};

/**
 * Generate safe area classes for mobile devices
 * @param {string|array} sides - Sides to apply safe area ('top', 'bottom', 'left', 'right', 'all')
 * @returns {string} - Safe area classes
 */
export const getSafeAreaClasses = (sides) => {
  if (sides === 'all') {
    return 'safe-area-inset';
  }
  
  const sidesArray = Array.isArray(sides) ? sides : [sides];
  return sidesArray.map(side => `safe-area-${side}`).join(' ');
};

/**
 * Generate medical-themed gradient classes
 * @param {string} type - Gradient type ('medical', 'medical-light', 'accent')
 * @returns {string} - Gradient classes
 */
export const getMedicalGradientClasses = (type = 'medical') => {
  const gradientMap = {
    medical: 'medical-gradient',
    'medical-light': 'medical-gradient-light',
    accent: 'accent-gradient'
  };
  
  return gradientMap[type] || gradientMap.medical;
};

/**
 * Generate status classes based on state
 * @param {string} status - Status type ('success', 'error', 'warning', 'info')
 * @returns {object} - Object with container and text classes
 */
export const getStatusClasses = (status) => {
  const statusMap = {
    success: {
      container: 'status-success',
      text: 'success-text',
      icon: 'text-semantic-success'
    },
    error: {
      container: 'status-error',
      text: 'error-text',
      icon: 'text-semantic-error'
    },
    warning: {
      container: 'status-warning',
      text: 'warning-text',
      icon: 'text-semantic-warning'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      text: 'text-blue-600',
      icon: 'text-semantic-info'
    }
  };
  
  return statusMap[status] || statusMap.info;
};

/**
 * Generate loading state classes
 * @param {string} type - Loading type ('spinner', 'skeleton', 'overlay')
 * @returns {string} - Loading classes
 */
export const getLoadingClasses = (type = 'spinner') => {
  const loadingMap = {
    spinner: 'loading-spinner',
    skeleton: 'loading-skeleton',
    overlay: 'loading-overlay'
  };
  
  return loadingMap[type] || loadingMap.spinner;
};

/**
 * Check if device supports hover interactions
 * @returns {boolean} - True if hover is supported
 */
export const supportsHover = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover)').matches;
};

/**
 * Check if user prefers reduced motion
 * @returns {boolean} - True if reduced motion is preferred
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user prefers high contrast
 * @returns {boolean} - True if high contrast is preferred
 */
export const prefersHighContrast = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Get current breakpoint based on window width
 * @returns {string} - Current breakpoint name
 */
export const getCurrentBreakpoint = () => {
  if (typeof window === 'undefined') return 'lg';
  
  const width = window.innerWidth;
  const breakpoints = designTokens.breakpoints;
  
  if (width < parseInt(breakpoints.sm)) return 'xs';
  if (width < parseInt(breakpoints.md)) return 'sm';
  if (width < parseInt(breakpoints.lg)) return 'md';
  if (width < parseInt(breakpoints.xl)) return 'lg';
  if (width < parseInt(breakpoints['2xl'])) return 'xl';
  return '2xl';
};

/**
 * Check if current device is mobile
 * @returns {boolean} - True if mobile device
 */
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < parseInt(designTokens.breakpoints.lg);
};

/**
 * Check if current device is tablet
 * @returns {boolean} - True if tablet device
 */
export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= parseInt(designTokens.breakpoints.lg) && width < parseInt(designTokens.breakpoints.xl);
};

/**
 * Check if current device is desktop
 * @returns {boolean} - True if desktop device
 */
export const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= parseInt(designTokens.breakpoints.xl);
};

/**
 * Generate class string from object with conditional classes
 * @param {object} classObj - Object with class names as keys and conditions as values
 * @returns {string} - Conditional class string
 */
export const conditionalClasses = (classObj) => {
  return Object.entries(classObj)
    .filter(([, condition]) => condition)
    .map(([className]) => className)
    .join(' ');
};

/**
 * Combine multiple class strings, removing duplicates
 * @param {...string} classes - Class strings to combine
 * @returns {string} - Combined class string
 */
export const combineClasses = (...classes) => {
  return [...new Set(classes.filter(Boolean).join(' ').split(' '))].join(' ');
};

/**
 * Generate focus ring classes for accessibility
 * @param {string} color - Focus ring color ('primary', 'secondary', etc.)
 * @returns {string} - Focus ring classes
 */
export const getFocusRingClasses = (color = 'primary') => {
  return `focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:ring-offset-2`;
};

/**
 * Generate medical icon color based on type
 * @param {string} type - Medical icon type ('heart', 'pulse', 'scan', 'emergency')
 * @returns {string} - Icon color class
 */
export const getMedicalIconColor = (type) => {
  const colorMap = {
    heart: 'text-medical-heart',
    pulse: 'text-medical-pulse',
    scan: 'text-medical-scan',
    emergency: 'text-medical-emergency'
  };
  
  return colorMap[type] || 'text-primary-500';
};

export default {
  getColor,
  getSpacing,
  getShadow,
  getBreakpoint,
  getComponentClasses,
  createResponsiveClasses,
  getTouchTargetClasses,
  getAnimationClasses,
  getSafeAreaClasses,
  getMedicalGradientClasses,
  getStatusClasses,
  getLoadingClasses,
  supportsHover,
  prefersReducedMotion,
  prefersHighContrast,
  getCurrentBreakpoint,
  isMobile,
  isTablet,
  isDesktop,
  conditionalClasses,
  combineClasses,
  getFocusRingClasses,
  getMedicalIconColor
};