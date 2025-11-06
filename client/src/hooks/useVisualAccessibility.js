// Visual Accessibility Hooks
// React hooks for visual accessibility features

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getContrastRatio, meetsWCAGStandards, getAccessibleColorSuggestions } from '../utils/colorAccessibility';

/**
 * High Contrast Mode Hook
 * Detects and manages high contrast mode preferences
 */
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [userPreference, setUserPreference] = useState(null);

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e) => {
      if (userPreference === null) {
        setIsHighContrast(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    // Check localStorage for user preference
    const stored = localStorage.getItem('high-contrast-mode');
    if (stored !== null) {
      const preference = JSON.parse(stored);
      setUserPreference(preference);
      setIsHighContrast(preference);
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [userPreference]);

  const toggleHighContrast = useCallback(() => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    setUserPreference(newValue);
    localStorage.setItem('high-contrast-mode', JSON.stringify(newValue));
    
    // Apply high contrast class to document
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  const resetToSystem = useCallback(() => {
    setUserPreference(null);
    localStorage.removeItem('high-contrast-mode');
    
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);
    
    document.documentElement.classList.remove('high-contrast');
  }, []);

  // Apply high contrast class on mount if needed
  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  return {
    isHighContrast,
    userPreference,
    toggleHighContrast,
    resetToSystem
  };
};

/**
 * Font Size Scaling Hook
 * Manages font size scaling for better readability
 */
export const useFontScaling = () => {
  const [fontSize, setFontSize] = useState(100); // Percentage
  const [userPreference, setUserPreference] = useState(null);

  useEffect(() => {
    // Check localStorage for user preference
    const stored = localStorage.getItem('font-scale');
    if (stored !== null) {
      const scale = parseInt(stored, 10);
      setFontSize(scale);
      setUserPreference(scale);
    }
  }, []);

  const setFontScale = useCallback((scale) => {
    const clampedScale = Math.max(75, Math.min(200, scale)); // 75% to 200%
    setFontSize(clampedScale);
    setUserPreference(clampedScale);
    localStorage.setItem('font-scale', clampedScale.toString());
    
    // Apply font scale to document
    document.documentElement.style.fontSize = `${clampedScale}%`;
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontScale(fontSize + 10);
  }, [fontSize, setFontScale]);

  const decreaseFontSize = useCallback(() => {
    setFontScale(fontSize - 10);
  }, [fontSize, setFontScale]);

  const resetFontSize = useCallback(() => {
    setFontScale(100);
  }, [setFontScale]);

  // Apply font scale on mount if needed
  useEffect(() => {
    if (userPreference !== null) {
      document.documentElement.style.fontSize = `${fontSize}%`;
    }
  }, [fontSize, userPreference]);

  return {
    fontSize,
    setFontScale,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    canIncrease: fontSize < 200,
    canDecrease: fontSize > 75
  };
};

/**
 * Color Contrast Hook
 * Validates and manages color contrast
 */
export const useColorContrast = () => {
  const validateContrast = useCallback((foreground, background, options = {}) => {
    return meetsWCAGStandards(foreground, background, options.level || 'AA', options.size || 'normal');
  }, []);

  const getAccessibleTextColor = useCallback((backgroundColor, options = {}) => {
    const suggestions = getAccessibleColorSuggestions('#000000', backgroundColor);
    return suggestions.darker.length > 0 ? suggestions.darker[0].color : '#000000';
  }, []);

  const getContrastRatioCallback = useCallback((color1, color2) => {
    return getContrastRatio(color1, color2);
  }, []);

  const ensureContrast = useCallback((foreground, background, minRatio = 4.5) => {
    const ratio = getContrastRatio(foreground, background);
    if (ratio >= minRatio) return foreground;
    
    const suggestions = getAccessibleColorSuggestions(foreground, background);
    return suggestions.darker.length > 0 ? suggestions.darker[0].color : foreground;
  }, []);

  return {
    validateContrast,
    getAccessibleTextColor,
    getContrastRatio: getContrastRatioCallback,
    ensureContrast
  };
};

/**
 * Color Blindness Support Hook
 * Provides color-blind friendly alternatives
 */
export const useColorBlindnessSupport = () => {
  const [colorBlindMode, setColorBlindMode] = useState('none');

  useEffect(() => {
    const stored = localStorage.getItem('color-blind-mode');
    if (stored) {
      setColorBlindMode(stored);
    }
  }, []);

  const setColorBlindnessMode = useCallback((mode) => {
    setColorBlindMode(mode);
    localStorage.setItem('color-blind-mode', mode);
    
    // Apply color blind mode class
    document.documentElement.classList.remove(
      'protanopia', 'deuteranopia', 'tritanopia', 'monochrome'
    );
    
    if (mode !== 'none') {
      document.documentElement.classList.add(mode);
    }
  }, []);

  const getStatusIndicators = useCallback(() => {
    return {
      success: '#22c55e',
      warning: '#f59e0b', 
      error: '#ef4444',
      info: '#3b82f6'
    };
  }, []);

  const getPatternForStatus = useCallback((status) => {
    const indicators = getStatusIndicators();
    return indicators[status]?.pattern || 'solid';
  }, [getStatusIndicators]);

  const getSymbolForStatus = useCallback((status) => {
    const indicators = getStatusIndicators();
    return indicators[status]?.symbol || '';
  }, [getStatusIndicators]);

  // Apply color blind mode class on mount if needed
  useEffect(() => {
    if (colorBlindMode !== 'none') {
      document.documentElement.classList.add(colorBlindMode);
    }
  }, [colorBlindMode]);

  return {
    colorBlindMode,
    setColorBlindnessMode,
    getStatusIndicators,
    getPatternForStatus,
    getSymbolForStatus,
    modes: [
      { value: 'none', label: 'Normal Vision' },
      { value: 'protanopia', label: 'Protanopia (Red-blind)' },
      { value: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
      { value: 'tritanopia', label: 'Tritanopia (Blue-blind)' },
      { value: 'monochrome', label: 'Monochrome' }
    ]
  };
};

/**
 * Responsive Text Hook
 * Manages responsive text sizing and readability
 */
export const useResponsiveText = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getResponsiveTextSize = useCallback((baseSize, options = {}) => {
    const { minSize = 14, maxSize = 24, scaleFactor = 1.2 } = options;
    
    // Calculate size based on viewport width
    const viewportFactor = viewport.width / 1024; // Base on 1024px width
    const calculatedSize = baseSize * Math.max(0.8, Math.min(scaleFactor, viewportFactor));
    
    return Math.max(minSize, Math.min(maxSize, calculatedSize));
  }, [viewport.width]);

  const getLineHeight = useCallback((fontSize) => {
    // Ensure minimum line height for readability
    return Math.max(1.4, 1.2 + (fontSize - 14) * 0.02);
  }, []);

  const getOptimalLineLength = useCallback(() => {
    // Optimal line length is 45-75 characters
    const charWidth = 8; // Approximate character width in pixels
    const optimalWidth = Math.min(viewport.width * 0.8, 75 * charWidth);
    return Math.max(45 * charWidth, optimalWidth);
  }, [viewport.width]);

  return {
    viewport,
    getResponsiveTextSize,
    getLineHeight,
    getOptimalLineLength,
    isMobile: viewport.width < 768,
    isTablet: viewport.width >= 768 && viewport.width < 1024,
    isDesktop: viewport.width >= 1024
  };
};

/**
 * Visual Accessibility Settings Hook
 * Centralized management of all visual accessibility settings
 */
export const useVisualAccessibilitySettings = () => {
  const highContrast = useHighContrastMode();
  const fontScaling = useFontScaling();
  const colorBlindness = useColorBlindnessSupport();
  const responsiveText = useResponsiveText();

  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setAnimationsEnabled(!mediaQuery.matches);

    const handleChange = (e) => {
      setAnimationsEnabled(!e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleAnimations = useCallback(() => {
    const newValue = !animationsEnabled;
    setAnimationsEnabled(newValue);
    localStorage.setItem('animations-enabled', JSON.stringify(newValue));
    
    if (!newValue) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [animationsEnabled]);

  const resetAllSettings = useCallback(() => {
    highContrast.resetToSystem();
    fontScaling.resetFontSize();
    colorBlindness.setColorBlindnessMode('none');
    setAnimationsEnabled(true);
    localStorage.removeItem('animations-enabled');
    document.documentElement.classList.remove('reduce-motion');
  }, [highContrast, fontScaling, colorBlindness]);

  const exportSettings = useCallback(() => {
    return {
      highContrast: highContrast.userPreference,
      fontSize: fontScaling.fontSize,
      colorBlindMode: colorBlindness.colorBlindMode,
      animationsEnabled
    };
  }, [highContrast.userPreference, fontScaling.fontSize, colorBlindness.colorBlindMode, animationsEnabled]);

  const importSettings = useCallback((settings) => {
    if (settings.highContrast !== undefined) {
      if (settings.highContrast === null) {
        highContrast.resetToSystem();
      } else {
        highContrast.toggleHighContrast();
      }
    }
    
    if (settings.fontSize !== undefined) {
      fontScaling.setFontScale(settings.fontSize);
    }
    
    if (settings.colorBlindMode !== undefined) {
      colorBlindness.setColorBlindnessMode(settings.colorBlindMode);
    }
    
    if (settings.animationsEnabled !== undefined) {
      setAnimationsEnabled(settings.animationsEnabled);
      if (!settings.animationsEnabled) {
        document.documentElement.classList.add('reduce-motion');
      }
    }
  }, [highContrast, fontScaling, colorBlindness]);

  return {
    highContrast,
    fontScaling,
    colorBlindness,
    responsiveText,
    animationsEnabled,
    toggleAnimations,
    resetAllSettings,
    exportSettings,
    importSettings
  };
};

export default {
  useHighContrastMode,
  useFontScaling,
  useColorContrast,
  useColorBlindnessSupport,
  useResponsiveText,
  useVisualAccessibilitySettings
};