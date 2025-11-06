// Motor and Cognitive Accessibility Hooks
// React hooks for motor impairments and cognitive accessibility

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * Touch Target Hook
 * Ensures minimum touch target sizes for motor accessibility
 */
export const useTouchTargets = () => {
  const [touchTargetSize, setTouchTargetSize] = useState('standard'); // standard, large, extra-large
  
  useEffect(() => {
    const stored = localStorage.getItem('touch-target-size');
    if (stored) {
      setTouchTargetSize(stored);
    }
  }, []);

  const setTargetSize = useCallback((size) => {
    setTouchTargetSize(size);
    localStorage.setItem('touch-target-size', size);
    
    // Apply CSS class to document
    document.documentElement.classList.remove('touch-standard', 'touch-large', 'touch-extra-large');
    document.documentElement.classList.add(`touch-${size}`);
  }, []);

  const getTargetSizeClasses = useCallback((baseClasses = '') => {
    const sizeMap = {
      standard: 'min-h-[44px] min-w-[44px]',
      large: 'min-h-[56px] min-w-[56px]',
      'extra-large': 'min-h-[72px] min-w-[72px]'
    };
    
    return `${baseClasses} ${sizeMap[touchTargetSize]}`.trim();
  }, [touchTargetSize]);

  const getSpacingClasses = useCallback(() => {
    const spacingMap = {
      standard: 'gap-2',
      large: 'gap-3',
      'extra-large': 'gap-4'
    };
    
    return spacingMap[touchTargetSize];
  }, [touchTargetSize]);

  // Apply touch target size on mount
  useEffect(() => {
    document.documentElement.classList.add(`touch-${touchTargetSize}`);
  }, [touchTargetSize]);

  return {
    touchTargetSize,
    setTargetSize,
    getTargetSizeClasses,
    getSpacingClasses,
    sizes: [
      { value: 'standard', label: 'Standard (44px)', description: 'WCAG minimum size' },
      { value: 'large', label: 'Large (56px)', description: 'Easier to tap' },
      { value: 'extra-large', label: 'Extra Large (72px)', description: 'Maximum accessibility' }
    ]
  };
};

/**
 * Alternative Input Methods Hook
 * Provides alternatives to gesture-based interactions
 */
export const useAlternativeInputs = () => {
  const [alternativeInputsEnabled, setAlternativeInputsEnabled] = useState(false);
  const [inputMethod, setInputMethod] = useState('auto'); // auto, keyboard, voice, switch

  useEffect(() => {
    const stored = localStorage.getItem('alternative-inputs-enabled');
    const method = localStorage.getItem('input-method');
    
    if (stored) {
      setAlternativeInputsEnabled(JSON.parse(stored));
    }
    if (method) {
      setInputMethod(method);
    }

    // Detect input capabilities
    const hasTouch = 'ontouchstart' in window;
    const hasPointer = 'onpointerdown' in window;
    const hasKeyboard = true; // Assume keyboard is always available
    
    // Auto-detect if user might need alternatives
    if (!hasTouch && hasKeyboard) {
      setAlternativeInputsEnabled(true);
    }
  }, []);

  const enableAlternativeInputs = useCallback((enabled) => {
    setAlternativeInputsEnabled(enabled);
    localStorage.setItem('alternative-inputs-enabled', JSON.stringify(enabled));
    
    if (enabled) {
      document.documentElement.classList.add('alternative-inputs');
    } else {
      document.documentElement.classList.remove('alternative-inputs');
    }
  }, []);

  const setPreferredInputMethod = useCallback((method) => {
    setInputMethod(method);
    localStorage.setItem('input-method', method);
    
    // Apply input method class
    document.documentElement.classList.remove('input-auto', 'input-keyboard', 'input-voice', 'input-switch');
    document.documentElement.classList.add(`input-${method}`);
  }, []);

  const getGestureAlternative = useCallback((gestureType) => {
    const alternatives = {
      swipe: 'Use arrow keys or navigation buttons',
      pinch: 'Use zoom controls or +/- buttons',
      longPress: 'Use context menu button or right-click',
      drag: 'Use move buttons or keyboard navigation',
      rotate: 'Use rotation controls or keyboard shortcuts'
    };
    
    return alternatives[gestureType] || 'Use keyboard or button alternatives';
  }, []);

  const shouldShowAlternatives = useCallback((gestureType) => {
    return alternativeInputsEnabled || inputMethod === 'keyboard' || inputMethod === 'switch';
  }, [alternativeInputsEnabled, inputMethod]);

  return {
    alternativeInputsEnabled,
    inputMethod,
    enableAlternativeInputs,
    setPreferredInputMethod,
    getGestureAlternative,
    shouldShowAlternatives,
    inputMethods: [
      { value: 'auto', label: 'Auto-detect', description: 'Automatically detect best input method' },
      { value: 'keyboard', label: 'Keyboard', description: 'Keyboard-only navigation' },
      { value: 'voice', label: 'Voice', description: 'Voice commands and dictation' },
      { value: 'switch', label: 'Switch', description: 'Switch control navigation' }
    ]
  };
};

/**
 * Timeout Management Hook
 * Manages timeouts and provides user control over timing
 */
export const useTimeoutManagement = () => {
  const [timeoutSettings, setTimeoutSettings] = useState({
    enabled: false,
    warningTime: 30, // seconds before timeout
    totalTime: 120,  // total timeout in seconds
    extendable: true // can user extend timeout
  });

  const [activeTimeouts, setActiveTimeouts] = useState(new Map());
  const timeoutRefs = useRef(new Map());

  useEffect(() => {
    const stored = localStorage.getItem('timeout-settings');
    if (stored) {
      setTimeoutSettings(JSON.parse(stored));
    }
  }, []);

  const updateTimeoutSettings = useCallback((newSettings) => {
    const updated = { ...timeoutSettings, ...newSettings };
    setTimeoutSettings(updated);
    localStorage.setItem('timeout-settings', JSON.stringify(updated));
  }, [timeoutSettings]);

  const createTimeout = useCallback((id, onTimeout, onWarning) => {
    if (!timeoutSettings.enabled) return null;

    // Clear existing timeout
    if (timeoutRefs.current.has(id)) {
      clearTimeout(timeoutRefs.current.get(id).warning);
      clearTimeout(timeoutRefs.current.get(id).timeout);
    }

    const warningTimer = setTimeout(() => {
      onWarning?.();
      setActiveTimeouts(prev => new Map(prev.set(id, {
        ...prev.get(id),
        warningShown: true,
        remainingTime: timeoutSettings.totalTime - timeoutSettings.warningTime
      })));
    }, timeoutSettings.warningTime * 1000);

    const timeoutTimer = setTimeout(() => {
      onTimeout?.();
      setActiveTimeouts(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
      timeoutRefs.current.delete(id);
    }, timeoutSettings.totalTime * 1000);

    const timeoutData = {
      warning: warningTimer,
      timeout: timeoutTimer,
      startTime: Date.now(),
      warningShown: false,
      remainingTime: timeoutSettings.totalTime
    };

    timeoutRefs.current.set(id, timeoutData);
    setActiveTimeouts(prev => new Map(prev.set(id, timeoutData)));

    return id;
  }, [timeoutSettings]);

  const extendTimeout = useCallback((id, additionalTime = 60) => {
    if (!timeoutSettings.extendable) return false;

    const timeoutData = timeoutRefs.current.get(id);
    if (!timeoutData) return false;

    // Clear existing timers
    clearTimeout(timeoutData.warning);
    clearTimeout(timeoutData.timeout);

    // Create new timeout with extended time
    const newTimeoutTimer = setTimeout(() => {
      setActiveTimeouts(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
      timeoutRefs.current.delete(id);
    }, additionalTime * 1000);

    const updatedData = {
      ...timeoutData,
      timeout: newTimeoutTimer,
      remainingTime: additionalTime,
      warningShown: false
    };

    timeoutRefs.current.set(id, updatedData);
    setActiveTimeouts(prev => new Map(prev.set(id, updatedData)));

    return true;
  }, [timeoutSettings.extendable]);

  const clearTimeout = useCallback((id) => {
    const timeoutData = timeoutRefs.current.get(id);
    if (timeoutData) {
      clearTimeout(timeoutData.warning);
      clearTimeout(timeoutData.timeout);
      timeoutRefs.current.delete(id);
      setActiveTimeouts(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    }
  }, []);

  const resetTimeout = useCallback((id) => {
    const timeoutData = timeoutRefs.current.get(id);
    if (timeoutData) {
      // Clear existing and create new with same settings
      clearTimeout(id);
      // Note: This would need the original callbacks, so in practice
      // the component should handle recreation
    }
  }, [clearTimeout]);

  return {
    timeoutSettings,
    updateTimeoutSettings,
    createTimeout,
    extendTimeout,
    clearTimeout: clearTimeout,
    resetTimeout,
    activeTimeouts: Array.from(activeTimeouts.entries())
  };
};

/**
 * Cognitive Load Reduction Hook
 * Helps reduce cognitive load through simplified interfaces
 */
export const useCognitiveAccessibility = () => {
  const [cognitiveSettings, setCognitiveSettings] = useState({
    simplifiedInterface: false,
    reducedAnimations: false,
    enhancedFocus: false,
    stepByStep: false,
    confirmActions: true
  });

  useEffect(() => {
    const stored = localStorage.getItem('cognitive-settings');
    if (stored) {
      setCognitiveSettings(JSON.parse(stored));
    }

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setCognitiveSettings(prev => ({ ...prev, reducedAnimations: true }));
    }
  }, []);

  const updateCognitiveSettings = useCallback((newSettings) => {
    const updated = { ...cognitiveSettings, ...newSettings };
    setCognitiveSettings(updated);
    localStorage.setItem('cognitive-settings', JSON.stringify(updated));

    // Apply CSS classes
    const classes = [
      updated.simplifiedInterface && 'simplified-interface',
      updated.reducedAnimations && 'reduced-animations',
      updated.enhancedFocus && 'enhanced-focus',
      updated.stepByStep && 'step-by-step'
    ].filter(Boolean);

    document.documentElement.classList.remove(
      'simplified-interface', 'reduced-animations', 'enhanced-focus', 'step-by-step'
    );
    document.documentElement.classList.add(...classes);
  }, [cognitiveSettings]);

  const getSimplifiedClasses = useCallback((baseClasses = '') => {
    if (!cognitiveSettings.simplifiedInterface) return baseClasses;
    
    // Remove complex styling for simplified interface
    return baseClasses
      .replace(/gradient|shadow|rounded-\w+/g, '')
      .replace(/bg-\w+-\d+/g, 'bg-white')
      .replace(/text-\w+-\d+/g, 'text-black');
  }, [cognitiveSettings.simplifiedInterface]);

  const shouldShowConfirmation = useCallback((actionType) => {
    if (!cognitiveSettings.confirmActions) return false;
    
    const destructiveActions = ['delete', 'remove', 'clear', 'reset', 'cancel'];
    return destructiveActions.some(action => actionType.toLowerCase().includes(action));
  }, [cognitiveSettings.confirmActions]);

  const getStepByStepGuidance = useCallback((steps, currentStep) => {
    if (!cognitiveSettings.stepByStep) return null;
    
    return {
      currentStep: currentStep + 1,
      totalSteps: steps.length,
      progress: ((currentStep + 1) / steps.length) * 100,
      currentStepData: steps[currentStep],
      isFirst: currentStep === 0,
      isLast: currentStep === steps.length - 1,
      nextStep: currentStep < steps.length - 1 ? steps[currentStep + 1] : null,
      previousStep: currentStep > 0 ? steps[currentStep - 1] : null
    };
  }, [cognitiveSettings.stepByStep]);

  return {
    cognitiveSettings,
    updateCognitiveSettings,
    getSimplifiedClasses,
    shouldShowConfirmation,
    getStepByStepGuidance
  };
};

/**
 * Motor Impairment Support Hook
 * Comprehensive support for users with motor impairments
 */
export const useMotorImpairmentSupport = () => {
  const [motorSettings, setMotorSettings] = useState({
    clickDelay: 0,        // Delay before click registration (ms)
    hoverDelay: 500,      // Delay before hover effects (ms)
    dragThreshold: 10,    // Minimum distance for drag (px)
    doubleClickTime: 500, // Time window for double clicks (ms)
    stickyKeys: false,    // Enable sticky key behavior
    clickAssist: false    // Click assistance features
  });

  const clickTimeouts = useRef(new Map());
  const hoverTimeouts = useRef(new Map());

  useEffect(() => {
    const stored = localStorage.getItem('motor-settings');
    if (stored) {
      setMotorSettings(JSON.parse(stored));
    }
  }, []);

  const updateMotorSettings = useCallback((newSettings) => {
    const updated = { ...motorSettings, ...newSettings };
    setMotorSettings(updated);
    localStorage.setItem('motor-settings', JSON.stringify(updated));
  }, [motorSettings]);

  const createDelayedClick = useCallback((callback, elementId) => {
    if (motorSettings.clickDelay === 0) {
      callback();
      return;
    }

    // Clear existing timeout for this element
    if (clickTimeouts.current.has(elementId)) {
      clearTimeout(clickTimeouts.current.get(elementId));
    }

    const timeout = setTimeout(() => {
      callback();
      clickTimeouts.current.delete(elementId);
    }, motorSettings.clickDelay);

    clickTimeouts.current.set(elementId, timeout);
  }, [motorSettings.clickDelay]);

  const createDelayedHover = useCallback((callback, elementId) => {
    if (motorSettings.hoverDelay === 0) {
      callback();
      return;
    }

    // Clear existing timeout for this element
    if (hoverTimeouts.current.has(elementId)) {
      clearTimeout(hoverTimeouts.current.get(elementId));
    }

    const timeout = setTimeout(() => {
      callback();
      hoverTimeouts.current.delete(elementId);
    }, motorSettings.hoverDelay);

    hoverTimeouts.current.set(elementId, timeout);
  }, [motorSettings.hoverDelay]);

  const cancelDelayedAction = useCallback((elementId) => {
    if (clickTimeouts.current.has(elementId)) {
      clearTimeout(clickTimeouts.current.get(elementId));
      clickTimeouts.current.delete(elementId);
    }
    if (hoverTimeouts.current.has(elementId)) {
      clearTimeout(hoverTimeouts.current.get(elementId));
      hoverTimeouts.current.delete(elementId);
    }
  }, []);

  const getDragThreshold = useCallback(() => {
    return motorSettings.dragThreshold;
  }, [motorSettings.dragThreshold]);

  const getDoubleClickTime = useCallback(() => {
    return motorSettings.doubleClickTime;
  }, [motorSettings.doubleClickTime]);

  return {
    motorSettings,
    updateMotorSettings,
    createDelayedClick,
    createDelayedHover,
    cancelDelayedAction,
    getDragThreshold,
    getDoubleClickTime
  };
};

/**
 * Comprehensive Motor and Cognitive Accessibility Hook
 * Combines all motor and cognitive accessibility features
 */
export const useMotorCognitiveAccessibility = () => {
  const touchTargets = useTouchTargets();
  const alternativeInputs = useAlternativeInputs();
  const timeoutManagement = useTimeoutManagement();
  const cognitiveAccessibility = useCognitiveAccessibility();
  const motorImpairmentSupport = useMotorImpairmentSupport();

  const exportSettings = useCallback(() => {
    return {
      touchTargetSize: touchTargets.touchTargetSize,
      alternativeInputsEnabled: alternativeInputs.alternativeInputsEnabled,
      inputMethod: alternativeInputs.inputMethod,
      timeoutSettings: timeoutManagement.timeoutSettings,
      cognitiveSettings: cognitiveAccessibility.cognitiveSettings,
      motorSettings: motorImpairmentSupport.motorSettings
    };
  }, [
    touchTargets.touchTargetSize,
    alternativeInputs.alternativeInputsEnabled,
    alternativeInputs.inputMethod,
    timeoutManagement.timeoutSettings,
    cognitiveAccessibility.cognitiveSettings,
    motorImpairmentSupport.motorSettings
  ]);

  const importSettings = useCallback((settings) => {
    if (settings.touchTargetSize) {
      touchTargets.setTargetSize(settings.touchTargetSize);
    }
    if (settings.alternativeInputsEnabled !== undefined) {
      alternativeInputs.enableAlternativeInputs(settings.alternativeInputsEnabled);
    }
    if (settings.inputMethod) {
      alternativeInputs.setPreferredInputMethod(settings.inputMethod);
    }
    if (settings.timeoutSettings) {
      timeoutManagement.updateTimeoutSettings(settings.timeoutSettings);
    }
    if (settings.cognitiveSettings) {
      cognitiveAccessibility.updateCognitiveSettings(settings.cognitiveSettings);
    }
    if (settings.motorSettings) {
      motorImpairmentSupport.updateMotorSettings(settings.motorSettings);
    }
  }, [
    touchTargets,
    alternativeInputs,
    timeoutManagement,
    cognitiveAccessibility,
    motorImpairmentSupport
  ]);

  const resetAllSettings = useCallback(() => {
    touchTargets.setTargetSize('standard');
    alternativeInputs.enableAlternativeInputs(false);
    alternativeInputs.setPreferredInputMethod('auto');
    timeoutManagement.updateTimeoutSettings({
      enabled: false,
      warningTime: 30,
      totalTime: 120,
      extendable: true
    });
    cognitiveAccessibility.updateCognitiveSettings({
      simplifiedInterface: false,
      reducedAnimations: false,
      enhancedFocus: false,
      stepByStep: false,
      confirmActions: true
    });
    motorImpairmentSupport.updateMotorSettings({
      clickDelay: 0,
      hoverDelay: 500,
      dragThreshold: 10,
      doubleClickTime: 500,
      stickyKeys: false,
      clickAssist: false
    });
  }, [
    touchTargets,
    alternativeInputs,
    timeoutManagement,
    cognitiveAccessibility,
    motorImpairmentSupport
  ]);

  return {
    touchTargets,
    alternativeInputs,
    timeoutManagement,
    cognitiveAccessibility,
    motorImpairmentSupport,
    exportSettings,
    importSettings,
    resetAllSettings
  };
};

export default {
  useTouchTargets,
  useAlternativeInputs,
  useTimeoutManagement,
  useCognitiveAccessibility,
  useMotorImpairmentSupport,
  useMotorCognitiveAccessibility
};