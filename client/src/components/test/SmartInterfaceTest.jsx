// Smart Interface Test Component
// Comprehensive testing of smart interface and personalization features

import React, { useState, useCallback } from 'react';
import {
  SmartHelpSystem,
  AdaptiveContainer,
  SmartForm,
  RecommendationPanel,
  InterfaceDensityControl,
  PersonalizationSettings
} from '../smart/SmartInterface';
import {
  PersonalizedDashboard,
  QuickActionsWidget,
  RecentActivityWidget,
  HealthMetricsWidget,
  ShortcutsWidget
} from '../smart/PersonalizedDashboard';
import { AccessibleTabs } from '../accessibility/AccessibleComponents';
import { 
  useUserBehavior,
  useContextualHelp,
  useAdaptiveInterface,
  usePersonalization
} from '../../hooks/useSmartInterface';
import { combineClasses } from '../../utils/design-system';

const SmartInterfaceTest = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPersonalizationSettings, setShowPersonalizationSettings] = useState(false);

  // Smart interface hooks
  const { 
    preferences, 
    recommendations, 
    trackInteraction, 
    trackTaskCompletion 
  } = useUserBehavior();
  
  const { 
    interfaceSettings, 
    shouldShowFeature, 
    getRecommendedActions 
  } = useAdaptiveInterface();
  
  const personalization = usePersonalization();

  // Test form data
  const testFormFields = [
    {
      name: 'patientName',
      label: 'Patient Name',
      type: 'text',
      required: true,
      placeholder: 'Enter patient name'
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'patient@example.com'
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '(555) 123-4567'
    },
    {
      name: 'condition',
      label: 'Medical Condition',
      type: 'text',
      placeholder: 'Primary condition or concern'
    }
  ];

  // Test functions
  const handleFormSubmit = useCallback((formData) => {
    console.log('Form submitted:', formData);
    alert('Form submitted successfully!');
    
    // Track task completion
    trackTaskCompletion('patient-form', 5000, true);
  }, [trackTaskCompletion]);

  const simulateUserActivity = useCallback(() => {
    // Simulate various user interactions
    const activities = [
      { type: 'click', data: { element: 'BUTTON', feature: 'patients' } },
      { type: 'input', data: { type: 'text', name: 'search' } },
      { type: 'navigation', data: { path: '/reports' } },
      { type: 'click', data: { element: 'BUTTON', feature: 'appointments' } }
    ];

    activities.forEach((activity, index) => {
      setTimeout(() => {
        trackInteraction(activity.type, activity.data);
      }, index * 500);
    });

    alert('Simulated user activity - check recommendations panel for updates');
  }, [trackInteraction]);

  // Tab content
  const tabs = [
    {
      id: 'dashboard',
      label: 'Personalized Dashboard',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Personalized Dashboard</h3>
            <p className="text-gray-600">
              This dashboard adapts to your usage patterns and preferences. 
              Widgets are ordered by relevance and frequency of use.
            </p>
            
            <PersonalizedDashboard />
          </div>
        </div>
      )
    },
    {
      id: 'widgets',
      label: 'Individual Widgets',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dashboard Widgets</h3>
            <p className="text-gray-600">
              Individual widgets that make up the personalized dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickActionsWidget />
            <HealthMetricsWidget />
            <RecentActivityWidget />
            <ShortcutsWidget />
          </div>
        </div>
      )
    },
    {
      id: 'adaptive',
      label: 'Adaptive Interface',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Adaptive Interface Features</h3>
            <p className="text-gray-600">
              The interface adapts based on your behavior patterns and preferences.
            </p>
          </div>

          {/* Current Settings Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Current Adaptive Settings</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Interface Density:</span>
                <span className="ml-2 font-medium">{interfaceSettings.density}</span>
              </div>
              <div>
                <span className="text-gray-600">Complexity Level:</span>
                <span className="ml-2 font-medium">{interfaceSettings.complexity}</span>
              </div>
              <div>
                <span className="text-gray-600">Help Level:</span>
                <span className="ml-2 font-medium">{interfaceSettings.helpLevel}</span>
              </div>
              <div>
                <span className="text-gray-600">Shortcuts Enabled:</span>
                <span className="ml-2 font-medium">{interfaceSettings.shortcuts ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Interface Density Control */}
          <InterfaceDensityControl />

          {/* Adaptive Container Examples */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Adaptive Container Examples</h4>
            
            <AdaptiveContainer context="form">
              <div className="bg-white p-4 border border-gray-200 rounded-lg">
                <h5 className="font-medium mb-2">Form Container</h5>
                <p className="text-sm text-gray-600">
                  This container adapts its spacing and layout based on your interface density preference.
                </p>
              </div>
            </AdaptiveContainer>

            <AdaptiveContainer context="navigation">
              <div className="bg-white p-4 border border-gray-200 rounded-lg">
                <h5 className="font-medium mb-2">Navigation Container</h5>
                <p className="text-sm text-gray-600">
                  Navigation elements adapt to show more or fewer options based on your usage patterns.
                </p>
              </div>
            </AdaptiveContainer>
          </div>

          {/* Feature Visibility Test */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Feature Visibility Test</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['save', 'export', 'advanced', 'help'].map((feature) => (
                <div key={feature} className="text-center">
                  <div className={combineClasses(
                    'p-3 rounded-lg border',
                    shouldShowFeature(feature) 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50 opacity-50'
                  )}>
                    <div className="font-medium text-sm">{feature}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {shouldShowFeature(feature) ? 'Visible' : 'Hidden'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'smart-help',
      label: 'Smart Help System',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contextual Help System</h3>
            <p className="text-gray-600">
              Help system that adapts to your skill level and provides progressive disclosure.
            </p>
          </div>

          {/* Smart Help Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SmartHelpSystem context="forms">
              <div className="bg-white p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">Form Help Example</h4>
                <p className="text-sm text-gray-600 mb-3">
                  This form has contextual help that adapts to your experience level.
                </p>
                <SmartForm
                  fields={testFormFields.slice(0, 2)}
                  onSubmit={handleFormSubmit}
                  context="patient-form"
                />
              </div>
            </SmartHelpSystem>

            <SmartHelpSystem context="navigation">
              <div className="bg-white p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">Navigation Help Example</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Navigation help that provides tips based on your usage patterns.
                </p>
                <div className="space-y-2">
                  <button className="w-full p-2 text-left bg-gray-50 rounded hover:bg-gray-100">
                    Dashboard
                  </button>
                  <button className="w-full p-2 text-left bg-gray-50 rounded hover:bg-gray-100">
                    Patients
                  </button>
                  <button className="w-full p-2 text-left bg-gray-50 rounded hover:bg-gray-100">
                    Reports
                  </button>
                </div>
              </div>
            </SmartHelpSystem>
          </div>
        </div>
      )
    },
    {
      id: 'smart-forms',
      label: 'Smart Forms',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Smart Form System</h3>
            <p className="text-gray-600">
              Forms that use smart defaults and adaptive validation based on your behavior.
            </p>
          </div>

          <div className="max-w-md">
            <SmartForm
              fields={testFormFields}
              onSubmit={handleFormSubmit}
              context="patient-registration"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Smart Form Features</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Auto-completion based on previous entries</li>
              <li>• Adaptive validation (strict/normal based on error history)</li>
              <li>• Smart defaults from user behavior patterns</li>
              <li>• Contextual help that adapts to user skill level</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h3>
            <p className="text-gray-600">
              AI-powered recommendations based on your usage patterns and behavior.
            </p>
          </div>

          {/* Current Preferences Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Current User Preferences</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Most Used Features:</span>
                <span className="ml-2">
                  {preferences.mostUsedFeatures?.map(([name]) => name).join(', ') || 'None tracked yet'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Preferred Time:</span>
                <span className="ml-2 capitalize">{preferences.preferredTimeOfUse || 'Not determined'}</span>
              </div>
              <div>
                <span className="text-gray-600">Interface Density:</span>
                <span className="ml-2 capitalize">{preferences.interfaceDensity || 'Normal'}</span>
              </div>
              <div>
                <span className="text-gray-600">Help Level:</span>
                <span className="ml-2 capitalize">{preferences.helpLevel || 'Medium'}</span>
              </div>
            </div>
          </div>

          {/* Recommendations Panel */}
          <RecommendationPanel />

          {/* Simulate Activity Button */}
          <div className="text-center">
            <button
              onClick={simulateUserActivity}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Simulate User Activity
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Click to simulate user interactions and see how recommendations adapt
            </p>
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
            Smart Interface & Personalization Testing
          </h1>
          <p className="text-gray-600 mb-6">
            Comprehensive testing of intelligent UI adaptation, personalized dashboards, 
            contextual help, and behavior-based recommendations.
          </p>

          {/* Current Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-medium text-blue-900 mb-2">Personalization Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Behavior Tracking:</span>
                <span className="ml-1 font-medium">
                  {personalization.personalizationSettings.enableBehaviorTracking ? 'On' : 'Off'}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Adaptive Interface:</span>
                <span className="ml-1 font-medium">
                  {personalization.personalizationSettings.enableAdaptiveInterface ? 'On' : 'Off'}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Smart Defaults:</span>
                <span className="ml-1 font-medium">
                  {personalization.personalizationSettings.enableSmartDefaults ? 'On' : 'Off'}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Recommendations:</span>
                <span className="ml-1 font-medium">{recommendations.length} active</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setShowPersonalizationSettings(true)}
              className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors duration-200"
            >
              Personalization Settings
            </button>
            <button
              onClick={simulateUserActivity}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
            >
              Simulate Activity
            </button>
            <button
              onClick={personalization.resetPersonalization}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200"
            >
              Reset Personalization
            </button>
          </div>

          {/* Tab Navigation */}
          <AccessibleTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Personalization Settings Modal */}
      <PersonalizationSettings
        isOpen={showPersonalizationSettings}
        onClose={() => setShowPersonalizationSettings(false)}
      />
    </div>
  );
};

export default SmartInterfaceTest;