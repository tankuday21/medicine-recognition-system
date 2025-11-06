// Motor and Cognitive Accessibility Test Component
// Comprehensive testing of motor and cognitive accessibility features

import React, { useState, useCallback } from 'react';
import {
  TouchTargetButton,
  AlternativeInputGesture,
  TimeoutWarning,
  StepByStepGuide,
  ConfirmationDialog,
  MotorAccessibilitySettings
} from '../accessibility/MotorCognitiveAccessibility';
import { AccessibleTabs } from '../accessibility/AccessibleComponents';
import { 
  useTouchTargets,
  useAlternativeInputs,
  useTimeoutManagement,
  useCognitiveAccessibility,
  useMotorImpairmentSupport,
  useMotorCognitiveAccessibility
} from '../../hooks/useMotorAccessibility';
import { combineClasses } from '../../utils/design-system';

const MotorCognitiveTest = () => {
  const [activeTab, setActiveTab] = useState('touch-targets');
  const [showSettings, setShowSettings] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeoutActive, setTimeoutActive] = useState(false);

  // Accessibility hooks
  const touchTargets = useTouchTargets();
  const alternativeInputs = useAlternativeInputs();
  const timeoutManagement = useTimeoutManagement();
  const cognitiveAccessibility = useCognitiveAccessibility();
  const motorImpairmentSupport = useMotorImpairmentSupport();
  const settings = useMotorCognitiveAccessibility();

  // Test data
  const stepByStepData = [
    {
      title: 'Welcome',
      description: 'Welcome to the step-by-step guide. This will walk you through each step of the process.'
    },
    {
      title: 'Setup',
      description: 'First, we need to set up your preferences and configure the system.'
    },
    {
      title: 'Configuration',
      description: 'Now we will configure the specific settings for your needs.'
    },
    {
      title: 'Review',
      description: 'Please review all the settings and make sure everything looks correct.'
    },
    {
      title: 'Complete',
      description: 'Congratulations! You have completed the setup process.'
    }
  ];

  // Test functions
  const handleGesture = useCallback((gestureData) => {
    console.log('Gesture detected:', gestureData);
    alert(`Gesture: ${gestureData.type} ${gestureData.direction || ''}`);
  }, []);

  const handleTimeout = useCallback(() => {
    alert('Session timed out!');
    setTimeoutActive(false);
  }, []);

  const handleTimeoutWarning = useCallback(() => {
    setTimeoutActive(true);
  }, []);

  const startTimeout = useCallback(() => {
    timeoutManagement.createTimeout('test-timeout', handleTimeout, handleTimeoutWarning);
  }, [timeoutManagement, handleTimeout, handleTimeoutWarning]);

  const extendTimeout = useCallback((timeoutId) => {
    timeoutManagement.extendTimeout(timeoutId, 60);
    setTimeoutActive(false);
  }, [timeoutManagement]);

  const dismissTimeout = useCallback((timeoutId) => {
    timeoutManagement.clearTimeout(timeoutId);
    setTimeoutActive(false);
  }, [timeoutManagement]);

  // Tab content
  const tabs = [
    {
      id: 'touch-targets',
      label: 'Touch Targets',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Touch Target Size Settings</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">
                Current Size: {touchTargets.sizes.find(s => s.value === touchTargets.touchTargetSize)?.label}
              </h4>
              <div className="space-y-2">
                {touchTargets.sizes.map((size) => (
                  <label key={size.value} className="flex items-center">
                    <input
                      type="radio"
                      name="touchTargetSize"
                      value={size.value}
                      checked={touchTargets.touchTargetSize === size.value}
                      onChange={() => touchTargets.setTargetSize(size.value)}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium">{size.label}</span>
                      <p className="text-sm text-gray-600">{size.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Touch Target Examples</h3>
            <p className="text-gray-600 text-sm">
              These buttons demonstrate different touch target sizes. All should be easily tappable.
            </p>
            
            <div className={combineClasses('flex flex-wrap', touchTargets.getSpacingClasses())}>
              <TouchTargetButton onClick={() => alert('Button 1 clicked')}>
                Button 1
              </TouchTargetButton>
              <TouchTargetButton onClick={() => alert('Button 2 clicked')} variant="secondary">
                Button 2
              </TouchTargetButton>
              <TouchTargetButton onClick={() => alert('Button 3 clicked')}>
                Button 3
              </TouchTargetButton>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Spacing Test</h3>
            <p className="text-gray-600 text-sm">
              Interactive elements should have adequate spacing to prevent accidental activation.
            </p>
            
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 9 }, (_, i) => (
                <TouchTargetButton
                  key={i}
                  onClick={() => alert(`Grid button ${i + 1} clicked`)}
                  variant={i % 2 === 0 ? 'primary' : 'secondary'}
                >
                  {i + 1}
                </TouchTargetButton>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Motor & Cognitive Accessibility Testing
          </h1>
          <p className="text-gray-600 mb-6">
            Comprehensive testing of motor and cognitive accessibility features including 
            touch targets, alternative inputs, timeouts, and cognitive assistance.
          </p>

          {/* Settings Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-medium text-blue-900 mb-2">Current Settings</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Touch Size:</span>
                <span className="ml-1 font-medium">{touchTargets.touchTargetSize}</span>
              </div>
              <div>
                <span className="text-blue-700">Alt Inputs:</span>
                <span className="ml-1 font-medium">{alternativeInputs.alternativeInputsEnabled ? 'On' : 'Off'}</span>
              </div>
              <div>
                <span className="text-blue-700">Timeouts:</span>
                <span className="ml-1 font-medium">{timeoutManagement.timeoutSettings.enabled ? 'On' : 'Off'}</span>
              </div>
              <div>
                <span className="text-blue-700">Simplified:</span>
                <span className="ml-1 font-medium">{cognitiveAccessibility.cognitiveSettings.simplifiedInterface ? 'On' : 'Off'}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-6">
            <TouchTargetButton
              onClick={() => setShowSettings(true)}
              variant="primary"
            >
              Open Settings
            </TouchTargetButton>
            <TouchTargetButton
              onClick={startTimeout}
              variant="secondary"
            >
              Test Timeout
            </TouchTargetButton>
            <TouchTargetButton
              onClick={() => setShowConfirmation(true)}
              variant="secondary"
            >
              Test Confirmation
            </TouchTargetButton>
            <TouchTargetButton
              onClick={settings.resetAllSettings}
              variant="secondary"
            >
              Reset All
            </TouchTargetButton>
          </div>

          {/* Tab Navigation */}
          <AccessibleTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Timeout Warning */}
      {timeoutActive && (
        <TimeoutWarning
          timeoutId="test-timeout"
          remainingTime={30}
          onExtend={extendTimeout}
          onDismiss={dismissTimeout}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        title="Confirm Destructive Action"
        message="This action cannot be undone. Are you sure you want to proceed?"
        onConfirm={() => {
          setShowConfirmation(false);
          alert('Action confirmed!');
        }}
        onCancel={() => setShowConfirmation(false)}
        destructive={true}
      />

      {/* Settings Panel */}
      <MotorAccessibilitySettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default MotorCognitiveTest;