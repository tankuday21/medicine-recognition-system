// Smart Interface and Personalization Hooks
// React hooks for intelligent UI adaptation and personalization

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { userBehaviorTracker, contextualHelpSystem } from '../utils/smartInterface';

/**
 * User Behavior Tracking Hook
 * Tracks and analyzes user behavior patterns
 */
export const useUserBehavior = () => {
  const [preferences, setPreferences] = useState({});
  const [patterns, setPatterns] = useState({});
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Initial load of user preferences
    const userPrefs = userBehaviorTracker.getUserPreferences();
    setPreferences(userPrefs);

    // Set up periodic updates
    const interval = setInterval(() => {
      const updatedPrefs = userBehaviorTracker.getUserPreferences();
      setPreferences(updatedPrefs);
      
      const contextualRecs = userBehaviorTracker.getContextualRecommendations();
      setRecommendations(contextualRecs);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const trackInteraction = useCallback((type, data) => {
    userBehaviorTracker.trackInteraction(type, data);
  }, []);

  const trackTaskCompletion = useCallback((taskId, duration, success = true) => {
    userBehaviorTracker.trackTaskCompletion(taskId, duration, success);
  }, []);

  const getSmartDefaults = useCallback((context) => {
    return userBehaviorTracker.getSmartDefaults(context);
  }, []);

  const clearBehaviorData = useCallback(() => {
    userBehaviorTracker.clearData();
    setPreferences({});
    setPatterns({});
    setRecommendations([]);
  }, []);

  return {
    preferences,
    patterns,
    recommendations,
    trackInteraction,
    trackTaskCompletion,
    getSmartDefaults,
    clearBehaviorData
  };
};

/**
 * Contextual Help Hook
 * Provides contextual help and progressive disclosure
 */
export const useContextualHelp = (context) => {
  const [helpContent, setHelpContent] = useState(null);
  const [userLevel, setUserLevel] = useState('beginner');
  const [showHelp, setShowHelp] = useState(false);
  const [progressiveDisclosure, setProgressiveDisclosure] = useState(null);

  useEffect(() => {
    if (context) {
      const help = contextualHelpSystem.getContextualHelp(context);
      setHelpContent(help);
      setUserLevel(help.level);
      
      const disclosure = contextualHelpSystem.getProgressiveDisclosure(context);
      setProgressiveDisclosure(disclosure);
    }
  }, [context]);

  const trackHelpInteraction = useCallback((type, success = true) => {
    if (context) {
      contextualHelpSystem.trackInteraction(context, type, success);
      
      // Update user level after interaction
      const updatedHelp = contextualHelpSystem.getContextualHelp(context);
      setUserLevel(updatedHelp.level);
    }
  }, [context]);

  const requestHelp = useCallback(() => {
    setShowHelp(true);
    trackHelpInteraction('help-request');
  }, [trackHelpInteraction]);

  const dismissHelp = useCallback(() => {
    setShowHelp(false);
  }, []);

  const completeStep = useCallback((stepIndex) => {
    trackHelpInteraction('completion', true);
    
    if (progressiveDisclosure && stepIndex < progressiveDisclosure.totalSteps - 1) {
      const updatedDisclosure = contextualHelpSystem.getProgressiveDisclosure(
        context, 
        stepIndex + 1
      );
      setProgressiveDisclosure(updatedDisclosure);
    }
  }, [context, progressiveDisclosure, trackHelpInteraction]);

  return {
    helpContent,
    userLevel,
    showHelp,
    progressiveDisclosure,
    requestHelp,
    dismissHelp,
    completeStep,
    trackHelpInteraction
  };
};

/**
 * Adaptive Interface Hook
 * Adapts interface based on user preferences and behavior
 */
export const useAdaptiveInterface = () => {
  const [interfaceSettings, setInterfaceSettings] = useState({
    density: 'normal',
    complexity: 'standard',
    helpLevel: 'medium',
    shortcuts: false
  });

  const { preferences } = useUserBehavior();

  useEffect(() => {
    // Adapt interface based on user preferences
    const adaptedSettings = {
      density: preferences.interfaceDensity || 'normal',
      complexity: preferences.helpLevel === 'high' ? 'simple' : 'standard',
      helpLevel: preferences.helpLevel || 'medium',
      shortcuts: preferences.mostUsedFeatures?.length > 3
    };

    setInterfaceSettings(adaptedSettings);
  }, [preferences]);

  const getAdaptiveClasses = useCallback((baseClasses = '') => {
    const densityClasses = {
      compact: 'space-y-1 space-x-1 p-2',
      normal: 'space-y-2 space-x-2 p-4',
      spacious: 'space-y-4 space-x-4 p-6'
    };

    const complexityClasses = {
      simple: 'simplified-interface',
      standard: '',
      advanced: 'advanced-interface'
    };

    return [
      baseClasses,
      densityClasses[interfaceSettings.density],
      complexityClasses[interfaceSettings.complexity]
    ].filter(Boolean).join(' ');
  }, [interfaceSettings]);

  const shouldShowFeature = useCallback((featureName, defaultShow = true) => {
    if (interfaceSettings.complexity === 'simple') {
      const essentialFeatures = ['save', 'cancel', 'submit', 'home', 'back'];
      return essentialFeatures.includes(featureName.toLowerCase());
    }
    
    if (interfaceSettings.complexity === 'advanced') {
      return true;
    }
    
    return defaultShow;
  }, [interfaceSettings.complexity]);

  const getRecommendedActions = useCallback((context) => {
    const { mostUsedFeatures } = preferences;
    
    if (!mostUsedFeatures || mostUsedFeatures.length === 0) {
      return [];
    }

    return mostUsedFeatures
      .slice(0, 3)
      .map(([feature, count]) => ({
        feature,
        count,
        recommended: true
      }));
  }, [preferences]);

  return {
    interfaceSettings,
    getAdaptiveClasses,
    shouldShowFeature,
    getRecommendedActions
  };
};

/**
 * Smart Defaults Hook
 * Provides intelligent default values based on user behavior
 */
export const useSmartDefaults = (context, formData = {}) => {
  const [smartDefaults, setSmartDefaults] = useState({});
  const { getSmartDefaults } = useUserBehavior();

  useEffect(() => {
    const defaults = getSmartDefaults(context);
    setSmartDefaults(defaults);
  }, [context, getSmartDefaults]);

  const getFieldDefault = useCallback((fieldName, fallback = '') => {
    // Check if we have a smart default for this field
    if (smartDefaults[fieldName] !== undefined) {
      return smartDefaults[fieldName];
    }

    // Check user's previous inputs for this field
    const previousInputs = userBehaviorTracker.interactions.get(`input:${fieldName}`);
    if (previousInputs && previousInputs.data.length > 0) {
      // Return the most recent value
      const recentData = previousInputs.data[previousInputs.data.length - 1];
      return recentData.value || fallback;
    }

    return fallback;
  }, [smartDefaults]);

  const getFormDefaults = useCallback((fields) => {
    const defaults = {};
    
    fields.forEach(field => {
      defaults[field.name] = getFieldDefault(field.name, field.defaultValue);
    });

    return defaults;
  }, [getFieldDefault]);

  const shouldAutoComplete = useCallback((fieldName) => {
    return smartDefaults.autoComplete || false;
  }, [smartDefaults]);

  const getValidationLevel = useCallback(() => {
    return smartDefaults.validation || 'normal';
  }, [smartDefaults]);

  return {
    smartDefaults,
    getFieldDefault,
    getFormDefaults,
    shouldAutoComplete,
    getValidationLevel
  };
};

/**
 * Interface Density Hook
 * Manages interface density based on user preferences
 */
export const useInterfaceDensity = () => {
  const [density, setDensity] = useState('normal');
  const { preferences } = useUserBehavior();

  useEffect(() => {
    if (preferences.interfaceDensity) {
      setDensity(preferences.interfaceDensity);
    }
  }, [preferences.interfaceDensity]);

  const updateDensity = useCallback((newDensity) => {
    setDensity(newDensity);
    localStorage.setItem('interface-density', newDensity);
  }, []);

  const getDensityClasses = useCallback((element = 'general') => {
    const densityMap = {
      compact: {
        general: 'text-sm leading-tight',
        button: 'px-2 py-1 text-sm',
        card: 'p-3 space-y-2',
        form: 'space-y-2',
        navigation: 'py-1 px-2 text-sm'
      },
      normal: {
        general: 'text-base leading-normal',
        button: 'px-4 py-2 text-base',
        card: 'p-4 space-y-4',
        form: 'space-y-4',
        navigation: 'py-2 px-4 text-base'
      },
      spacious: {
        general: 'text-lg leading-relaxed',
        button: 'px-6 py-3 text-lg',
        card: 'p-6 space-y-6',
        form: 'space-y-6',
        navigation: 'py-3 px-6 text-lg'
      }
    };

    return densityMap[density]?.[element] || densityMap[density]?.general || '';
  }, [density]);

  const getSpacing = useCallback((size = 'normal') => {
    const spacingMap = {
      compact: {
        xs: 'space-y-1',
        sm: 'space-y-2',
        normal: 'space-y-3',
        lg: 'space-y-4'
      },
      normal: {
        xs: 'space-y-2',
        sm: 'space-y-3',
        normal: 'space-y-4',
        lg: 'space-y-6'
      },
      spacious: {
        xs: 'space-y-3',
        sm: 'space-y-4',
        normal: 'space-y-6',
        lg: 'space-y-8'
      }
    };

    return spacingMap[density]?.[size] || spacingMap.normal[size];
  }, [density]);

  return {
    density,
    updateDensity,
    getDensityClasses,
    getSpacing,
    densityOptions: [
      { value: 'compact', label: 'Compact', description: 'More content, less spacing' },
      { value: 'normal', label: 'Normal', description: 'Balanced spacing and content' },
      { value: 'spacious', label: 'Spacious', description: 'More spacing, easier to read' }
    ]
  };
};

/**
 * Personalization Hook
 * Comprehensive personalization management
 */
export const usePersonalization = () => {
  const userBehavior = useUserBehavior();
  const adaptiveInterface = useAdaptiveInterface();
  const interfaceDensity = useInterfaceDensity();

  const [personalizationSettings, setPersonalizationSettings] = useState({
    enableBehaviorTracking: true,
    enableAdaptiveInterface: true,
    enableSmartDefaults: true,
    enableContextualHelp: true
  });

  useEffect(() => {
    const stored = localStorage.getItem('personalization-settings');
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        setPersonalizationSettings(settings);
      } catch (error) {
        console.warn('Failed to load personalization settings:', error);
      }
    }
  }, []);

  const updatePersonalizationSettings = useCallback((newSettings) => {
    const updated = { ...personalizationSettings, ...newSettings };
    setPersonalizationSettings(updated);
    localStorage.setItem('personalization-settings', JSON.stringify(updated));
  }, [personalizationSettings]);

  const exportPersonalizationData = useCallback(() => {
    return {
      behaviorData: userBehaviorTracker.exportData(),
      helpProgress: contextualHelpSystem.getHelpStatistics(),
      interfaceSettings: adaptiveInterface.interfaceSettings,
      densitySettings: { density: interfaceDensity.density },
      personalizationSettings,
      exportedAt: Date.now()
    };
  }, [adaptiveInterface.interfaceSettings, interfaceDensity.density, personalizationSettings]);

  const importPersonalizationData = useCallback((data) => {
    try {
      if (data.behaviorData) {
        userBehaviorTracker.importData(data.behaviorData);
      }
      
      if (data.densitySettings?.density) {
        interfaceDensity.updateDensity(data.densitySettings.density);
      }
      
      if (data.personalizationSettings) {
        updatePersonalizationSettings(data.personalizationSettings);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import personalization data:', error);
      return false;
    }
  }, [interfaceDensity, updatePersonalizationSettings]);

  const resetPersonalization = useCallback(() => {
    userBehavior.clearBehaviorData();
    interfaceDensity.updateDensity('normal');
    updatePersonalizationSettings({
      enableBehaviorTracking: true,
      enableAdaptiveInterface: true,
      enableSmartDefaults: true,
      enableContextualHelp: true
    });
  }, [userBehavior, interfaceDensity, updatePersonalizationSettings]);

  return {
    ...userBehavior,
    ...adaptiveInterface,
    ...interfaceDensity,
    personalizationSettings,
    updatePersonalizationSettings,
    exportPersonalizationData,
    importPersonalizationData,
    resetPersonalization
  };
};

export default {
  useUserBehavior,
  useContextualHelp,
  useAdaptiveInterface,
  useSmartDefaults,
  useInterfaceDensity,
  usePersonalization
};