// Smart Interface Components
// Intelligent UI components that adapt to user behavior

import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';
import { 
  useUserBehavior,
  useContextualHelp,
  useAdaptiveInterface,
  useSmartDefaults,
  useInterfaceDensity,
  usePersonalization
} from '../../hooks/useSmartInterface';
import { AccessibleButton } from '../accessibility/AccessibleComponents';

/**
 * Smart Help System Component
 * Provides contextual help with progressive disclosure
 */
export const SmartHelpSystem = ({ 
  context,
  children,
  className = '',
  ...props 
}) => {
  const {
    helpContent,
    userLevel,
    showHelp,
    progressiveDisclosure,
    requestHelp,
    dismissHelp,
    completeStep,
    trackHelpInteraction
  } = useContextualHelp(context);

  const [currentStep, setCurrentStep] = useState(0);

  const handleStepComplete = useCallback(() => {
    completeStep(currentStep);
    if (progressiveDisclosure && currentStep < progressiveDisclosure.totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      dismissHelp();
    }
  }, [currentStep, completeStep, progressiveDisclosure, dismissHelp]);

  const handleStepBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  if (!helpContent) return children;

  return (
    <div className={combineClasses('relative', className)} {...props}>
      {children}
      
      {/* Help Trigger Button */}
      {!showHelp && (
        <button
          onClick={requestHelp}
          className="absolute top-2 right-2 w-6 h-6 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Get help"
        >
          ?
        </button>
      )}

      {/* Help Content */}
      {showHelp && (
        <div className="absolute top-0 right-0 z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">{helpContent.title}</h3>
            <button
              onClick={dismissHelp}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close help"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">{helpContent.content}</p>
            
            {helpContent.tips && helpContent.tips.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Tips:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {helpContent.tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Progressive Disclosure */}
            {progressiveDisclosure && progressiveDisclosure.nextSteps.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Step {currentStep + 1} of {progressiveDisclosure.totalSteps}
                </h4>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / progressiveDisclosure.totalSteps) * 100}%` }}
                  />
                </div>
                
                {progressiveDisclosure.nextSteps[0] && (
                  <div className="bg-blue-50 p-3 rounded">
                    <h5 className="text-sm font-medium text-blue-900">
                      {progressiveDisclosure.nextSteps[0].title}
                    </h5>
                  </div>
                )}

                <div className="flex justify-between mt-3">
                  <AccessibleButton
                    onClick={handleStepBack}
                    disabled={currentStep === 0}
                    variant="secondary"
                    size="sm"
                  >
                    Back
                  </AccessibleButton>
                  <AccessibleButton
                    onClick={handleStepComplete}
                    size="sm"
                  >
                    {currentStep === progressiveDisclosure.totalSteps - 1 ? 'Finish' : 'Next'}
                  </AccessibleButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Adaptive Interface Container
 * Container that adapts its layout based on user preferences
 */
export const AdaptiveContainer = ({ 
  children, 
  context = 'general',
  className = '',
  ...props 
}) => {
  const { getAdaptiveClasses } = useAdaptiveInterface();
  const { getDensityClasses } = useInterfaceDensity();

  const adaptiveClasses = getAdaptiveClasses(className);
  const densityClasses = getDensityClasses('container');

  return (
    <div 
      className={combineClasses(adaptiveClasses, densityClasses)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Smart Form Component
 * Form that uses smart defaults and adaptive validation
 */
export const SmartForm = ({ 
  fields,
  onSubmit,
  context = 'form',
  className = '',
  ...props 
}) => {
  const { getFormDefaults, shouldAutoComplete, getValidationLevel } = useSmartDefaults(context);
  const { trackInteraction, trackTaskCompletion } = useUserBehavior();
  const { getDensityClasses } = useInterfaceDensity();

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const startTime = useRef(Date.now());

  useEffect(() => {
    // Set smart defaults when fields change
    const defaults = getFormDefaults(fields);
    setFormData(defaults);
  }, [fields, getFormDefaults]);

  const handleInputChange = useCallback((fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }

    // Track input interaction
    trackInteraction('input', {
      field: fieldName,
      context,
      timestamp: Date.now()
    });
  }, [errors, trackInteraction, context]);

  const validateForm = useCallback(() => {
    const validationLevel = getValidationLevel();
    const newErrors = {};

    fields.forEach(field => {
      const value = formData[field.name];
      
      // Required field validation
      if (field.required && (!value || value.toString().trim() === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      // Enhanced validation for strict mode
      if (validationLevel === 'strict' && value) {
        if (field.type === 'email' && !/\S+@\S+\.\S+/.test(value)) {
          newErrors[field.name] = 'Please enter a valid email address';
        }
        
        if (field.minLength && value.length < field.minLength) {
          newErrors[field.name] = `${field.label} must be at least ${field.minLength} characters`;
        }
      }
    });

    return newErrors;
  }, [fields, formData, getValidationLevel]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    setErrors(validationErrors);

    const duration = Date.now() - startTime.current;
    const success = Object.keys(validationErrors).length === 0;

    if (success) {
      onSubmit?.(formData);
      trackTaskCompletion(`form-${context}`, duration, true);
    } else {
      trackTaskCompletion(`form-${context}`, duration, false);
      trackInteraction('error', {
        type: 'validation',
        context,
        errorCount: Object.keys(validationErrors).length
      });
    }
  }, [validateForm, onSubmit, formData, trackTaskCompletion, trackInteraction, context]);

  const formClasses = combineClasses(
    'space-y-4',
    getDensityClasses('form'),
    className
  );

  return (
    <SmartHelpSystem context={context}>
      <form onSubmit={handleSubmit} className={formClasses} {...props}>
        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <label 
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            <input
              id={field.name}
              name={field.name}
              type={field.type || 'text'}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              autoComplete={shouldAutoComplete(field.name) ? 'on' : 'off'}
              className={combineClasses(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                errors[field.name] ? 'border-red-500' : 'border-gray-300',
                getDensityClasses('input')
              )}
            />
            
            {errors[field.name] && (
              <p className="text-sm text-red-600">{errors[field.name]}</p>
            )}
          </div>
        ))}
        
        <AccessibleButton
          type="submit"
          className="w-full"
        >
          Submit
        </AccessibleButton>
      </form>
    </SmartHelpSystem>
  );
};

/**
 * Recommendation Panel Component
 * Shows personalized recommendations based on user behavior
 */
export const RecommendationPanel = ({ 
  className = '',
  maxRecommendations = 3,
  ...props 
}) => {
  const { recommendations } = useUserBehavior();
  const [dismissedRecommendations, setDismissedRecommendations] = useState(new Set());

  const visibleRecommendations = recommendations
    .filter(rec => !dismissedRecommendations.has(rec.title))
    .slice(0, maxRecommendations);

  const handleDismiss = useCallback((recommendationTitle) => {
    setDismissedRecommendations(prev => new Set([...prev, recommendationTitle]));
  }, []);

  const handleAction = useCallback((recommendation) => {
    // Handle recommendation action
    console.log('Recommendation action:', recommendation);
    handleDismiss(recommendation.title);
  }, [handleDismiss]);

  if (visibleRecommendations.length === 0) return null;

  return (
    <div className={combineClasses('bg-blue-50 border border-blue-200 rounded-lg p-4', className)} {...props}>
      <h3 className="font-medium text-blue-900 mb-3">Recommendations</h3>
      
      <div className="space-y-3">
        {visibleRecommendations.map((recommendation, index) => (
          <div key={index} className="bg-white rounded p-3 border border-blue-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  {recommendation.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {recommendation.description}
                </p>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAction(recommendation)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    {recommendation.action === 'explore' ? 'Explore' :
                     recommendation.action === 'enable-help' ? 'Enable' :
                     recommendation.action === 'show-shortcuts' ? 'Learn' : 'Action'}
                  </button>
                  <button
                    onClick={() => handleDismiss(recommendation.title)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              
              <div className={combineClasses(
                'ml-2 px-2 py-1 rounded text-xs font-medium',
                recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              )}>
                {recommendation.priority}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Interface Density Control
 * Allows users to adjust interface density
 */
export const InterfaceDensityControl = ({ 
  className = '',
  ...props 
}) => {
  const { density, updateDensity, densityOptions } = useInterfaceDensity();

  return (
    <div className={combineClasses('space-y-3', className)} {...props}>
      <h3 className="font-medium text-gray-900">Interface Density</h3>
      
      <div className="space-y-2">
        {densityOptions.map((option) => (
          <label key={option.value} className="flex items-center">
            <input
              type="radio"
              name="density"
              value={option.value}
              checked={density === option.value}
              onChange={() => updateDensity(option.value)}
              className="mr-3"
            />
            <div>
              <span className="font-medium">{option.label}</span>
              <p className="text-sm text-gray-600">{option.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

/**
 * Personalization Settings Panel
 * Comprehensive personalization management
 */
export const PersonalizationSettings = ({ 
  isOpen, 
  onClose, 
  className = '',
  ...props 
}) => {
  const {
    personalizationSettings,
    updatePersonalizationSettings,
    exportPersonalizationData,
    importPersonalizationData,
    resetPersonalization,
    preferences
  } = usePersonalization();

  const [importData, setImportData] = useState('');

  const handleExport = useCallback(() => {
    const data = exportPersonalizationData();
    const dataStr = JSON.stringify(data, null, 2);
    navigator.clipboard?.writeText(dataStr);
    alert('Personalization data copied to clipboard');
  }, [exportPersonalizationData]);

  const handleImport = useCallback(() => {
    try {
      const data = JSON.parse(importData);
      const success = importPersonalizationData(data);
      if (success) {
        setImportData('');
        alert('Personalization data imported successfully');
      } else {
        alert('Failed to import personalization data');
      }
    } catch (error) {
      alert('Invalid data format');
    }
  }, [importData, importPersonalizationData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div 
        className={combineClasses(
          'bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Personalization Settings
          </h2>
          <AccessibleButton
            onClick={onClose}
            variant="secondary"
            size="sm"
          >
            Close
          </AccessibleButton>
        </div>

        <div className="space-y-6">
          {/* Current Preferences */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Current Preferences</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Interface Density:</span>
                <span className="text-sm font-medium">{preferences.interfaceDensity || 'Normal'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Help Level:</span>
                <span className="text-sm font-medium">{preferences.helpLevel || 'Medium'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Most Used Features:</span>
                <span className="text-sm font-medium">
                  {preferences.mostUsedFeatures?.length || 0} tracked
                </span>
              </div>
            </div>
          </div>

          {/* Personalization Options */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Personalization Options</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={personalizationSettings.enableBehaviorTracking}
                  onChange={(e) => updatePersonalizationSettings({ 
                    enableBehaviorTracking: e.target.checked 
                  })}
                  className="mr-2"
                />
                <span className="text-sm">Enable behavior tracking for personalization</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={personalizationSettings.enableAdaptiveInterface}
                  onChange={(e) => updatePersonalizationSettings({ 
                    enableAdaptiveInterface: e.target.checked 
                  })}
                  className="mr-2"
                />
                <span className="text-sm">Enable adaptive interface adjustments</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={personalizationSettings.enableSmartDefaults}
                  onChange={(e) => updatePersonalizationSettings({ 
                    enableSmartDefaults: e.target.checked 
                  })}
                  className="mr-2"
                />
                <span className="text-sm">Enable smart form defaults</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={personalizationSettings.enableContextualHelp}
                  onChange={(e) => updatePersonalizationSettings({ 
                    enableContextualHelp: e.target.checked 
                  })}
                  className="mr-2"
                />
                <span className="text-sm">Enable contextual help system</span>
              </label>
            </div>
          </div>

          {/* Interface Density Control */}
          <InterfaceDensityControl />

          {/* Data Management */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-900">Data Management</h3>
            
            <div className="flex space-x-2">
              <AccessibleButton
                onClick={handleExport}
                variant="secondary"
                size="sm"
              >
                Export Data
              </AccessibleButton>
              <AccessibleButton
                onClick={resetPersonalization}
                variant="secondary"
                size="sm"
              >
                Reset All
              </AccessibleButton>
            </div>

            <div className="space-y-2">
              <label htmlFor="import-personalization" className="block text-sm font-medium text-gray-700">
                Import Data
              </label>
              <textarea
                id="import-personalization"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste exported personalization data here..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <AccessibleButton
                onClick={handleImport}
                disabled={!importData.trim()}
                size="sm"
              >
                Import
              </AccessibleButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes
SmartHelpSystem.propTypes = {
  context: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

AdaptiveContainer.propTypes = {
  children: PropTypes.node.isRequired,
  context: PropTypes.string,
  className: PropTypes.string
};

SmartForm.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    required: PropTypes.bool,
    placeholder: PropTypes.string
  })).isRequired,
  onSubmit: PropTypes.func,
  context: PropTypes.string,
  className: PropTypes.string
};

RecommendationPanel.propTypes = {
  className: PropTypes.string,
  maxRecommendations: PropTypes.number
};

InterfaceDensityControl.propTypes = {
  className: PropTypes.string
};

PersonalizationSettings.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default {
  SmartHelpSystem,
  AdaptiveContainer,
  SmartForm,
  RecommendationPanel,
  InterfaceDensityControl,
  PersonalizationSettings
};