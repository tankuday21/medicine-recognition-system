// Accessibility Test Component
// Comprehensive testing of accessibility features and screen reader support

import React, { useState, useCallback } from 'react';
import {
  AccessibleButton,
  AccessibleInput,
  AccessibleModal,
  AccessibleDropdown,
  AccessibleTabs,
  AccessibleAlert
} from '../accessibility/AccessibleComponents';
import {
  SkipLinks,
  MainContent,
  NavigationWrapper,
  HeaderWrapper,
  FooterWrapper,
  BreadcrumbNavigation,
  PageTitle,
  FocusIndicator
} from '../accessibility/SkipNavigation';
import { 
  useScreenReader, 
  useReducedMotion, 
  useHighContrast 
} from '../../hooks/useAccessibility';
import { combineClasses } from '../../utils/design-system';

const AccessibilityTest = () => {
  const [activeTab, setActiveTab] = useState('components');
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [alerts, setAlerts] = useState([]);

  // Accessibility hooks
  const { 
    isScreenReaderActive, 
    announce, 
    announceNavigation,
    announceAction,
    announceError,
    announceSuccess 
  } = useScreenReader();
  const prefersReducedMotion = useReducedMotion();
  const prefersHighContrast = useHighContrast();

  // Form handling
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [formErrors]);

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    }
    
    return errors;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      announceSuccess('Form submitted successfully');
      addAlert('success', 'Form Submitted', 'Your form has been submitted successfully!');
      setFormData({ name: '', email: '', message: '' });
    } else {
      announceError('Form has validation errors');
      addAlert('error', 'Validation Error', 'Please fix the errors in the form');
    }
  }, [validateForm, announceSuccess, announceError]);

  // Alert management
  const addAlert = useCallback((type, title, message) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, type, title, message }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Test functions
  const testScreenReaderAnnouncement = useCallback(() => {
    announce('This is a test announcement for screen readers', 'assertive');
  }, [announce]);

  const testNavigationAnnouncement = useCallback(() => {
    announceNavigation('Test Page', 'This is a test navigation announcement');
  }, [announceNavigation]);

  const testActionAnnouncement = useCallback(() => {
    announceAction('Button clicked', 'Action completed successfully');
  }, [announceAction]);

  // Tab content
  const tabs = [
    {
      id: 'components',
      label: 'Accessible Components',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Button Components</h3>
            <div className="flex flex-wrap gap-4">
              <AccessibleButton
                variant="primary"
                ariaLabel="Primary action button"
                onClick={() => addAlert('info', 'Button Clicked', 'Primary button was clicked')}
              >
                Primary Button
              </AccessibleButton>
              
              <AccessibleButton
                variant="secondary"
                ariaLabel="Secondary action button"
                onClick={() => addAlert('info', 'Button Clicked', 'Secondary button was clicked')}
              >
                Secondary Button
              </AccessibleButton>
              
              <AccessibleButton
                variant="danger"
                ariaLabel="Dangerous action button"
                onClick={() => addAlert('warning', 'Warning', 'Danger button was clicked')}
              >
                Danger Button
              </AccessibleButton>
              
              <AccessibleButton
                loading={true}
                ariaLabel="Loading button"
                disabled
              >
                Loading Button
              </AccessibleButton>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Modal Component</h3>
            <AccessibleButton
              onClick={() => setModalOpen(true)}
              ariaLabel="Open modal dialog"
            >
              Open Modal
            </AccessibleButton>
            
            <AccessibleModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Accessible Modal Example"
            >
              <p className="text-gray-600 mb-4">
                This is an accessible modal with focus trapping and keyboard navigation.
                Try pressing Tab to navigate through the focusable elements.
              </p>
              <div className="flex justify-end space-x-2">
                <AccessibleButton
                  variant="secondary"
                  onClick={() => setModalOpen(false)}
                  ariaLabel="Cancel and close modal"
                >
                  Cancel
                </AccessibleButton>
                <AccessibleButton
                  onClick={() => {
                    setModalOpen(false);
                    addAlert('success', 'Action Completed', 'Modal action was successful');
                  }}
                  ariaLabel="Confirm action and close modal"
                >
                  Confirm
                </AccessibleButton>
              </div>
            </AccessibleModal>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dropdown Component</h3>
            <AccessibleDropdown
              trigger={
                <AccessibleButton ariaLabel="Open dropdown menu">
                  Dropdown Menu
                </AccessibleButton>
              }
              isOpen={dropdownOpen}
              onToggle={setDropdownOpen}
            >
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
                Option 1
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
                Option 2
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
                Option 3
              </button>
            </AccessibleDropdown>
          </div>
        </div>
      )
    },
    {
      id: 'forms',
      label: 'Form Accessibility',
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Accessible Form Example</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <AccessibleInput
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={formErrors.name}
              required
              placeholder="Enter your full name"
              helperText="This field is required"
            />
            
            <AccessibleInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={formErrors.email}
              required
              placeholder="Enter your email address"
              helperText="We'll never share your email"
            />
            
            <div className="space-y-1">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
                <span className="text-red-500 ml-1" aria-label="required">*</span>
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Enter your message"
                rows={4}
                className={combineClasses(
                  'block w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  formErrors.message 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 bg-white hover:border-gray-400'
                )}
                aria-required="true"
                aria-invalid={!!formErrors.message}
                aria-describedby={formErrors.message ? 'message-error' : undefined}
              />
              {formErrors.message && (
                <p id="message-error" className="text-sm text-red-600" role="alert">
                  {formErrors.message}
                </p>
              )}
            </div>
            
            <AccessibleButton
              type="submit"
              ariaLabel="Submit form"
              className="w-full"
            >
              Submit Form
            </AccessibleButton>
          </form>
        </div>
      )
    },
    {
      id: 'navigation',
      label: 'Navigation & Landmarks',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Breadcrumb Navigation</h3>
            <BreadcrumbNavigation
              items={[
                { id: 'home', label: 'Home', href: '/' },
                { id: 'accessibility', label: 'Accessibility', href: '/accessibility' },
                { id: 'test', label: 'Test Page' }
              ]}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Focus Management</h3>
            <p className="text-gray-600">
              Use Tab key to navigate through focusable elements. 
              Notice the visible focus indicators on interactive elements.
            </p>
            
            <FocusIndicator>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">Focus Indicator Example</h4>
                <p className="text-sm text-gray-600 mb-3">
                  This container will show a focus ring when any child element is focused.
                </p>
                <div className="space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none">
                    Button 1
                  </button>
                  <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none">
                    Button 2
                  </button>
                </div>
              </div>
            </FocusIndicator>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Landmark Regions</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>This page includes proper landmark regions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Banner:</strong> Site header with navigation</li>
                <li><strong>Navigation:</strong> Primary navigation menu</li>
                <li><strong>Main:</strong> Main content area</li>
                <li><strong>Complementary:</strong> Sidebar content</li>
                <li><strong>Contentinfo:</strong> Site footer</li>
              </ul>
              <p className="mt-2">
                Screen reader users can navigate between these landmarks using landmark navigation commands.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'testing',
      label: 'Screen Reader Testing',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Screen Reader Detection</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm">
                <strong>Screen Reader Active:</strong> {isScreenReaderActive ? 'Yes' : 'No'}
              </p>
              <p className="text-sm mt-1">
                <strong>Reduced Motion:</strong> {prefersReducedMotion ? 'Yes' : 'No'}
              </p>
              <p className="text-sm mt-1">
                <strong>High Contrast:</strong> {prefersHighContrast ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Region Testing</h3>
            <p className="text-gray-600 text-sm">
              Test screen reader announcements using the buttons below:
            </p>
            
            <div className="flex flex-wrap gap-2">
              <AccessibleButton
                onClick={testScreenReaderAnnouncement}
                ariaLabel="Test general screen reader announcement"
                size="sm"
              >
                Test Announcement
              </AccessibleButton>
              
              <AccessibleButton
                onClick={testNavigationAnnouncement}
                ariaLabel="Test navigation announcement"
                size="sm"
                variant="secondary"
              >
                Test Navigation
              </AccessibleButton>
              
              <AccessibleButton
                onClick={testActionAnnouncement}
                ariaLabel="Test action announcement"
                size="sm"
                variant="secondary"
              >
                Test Action
              </AccessibleButton>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Alert Testing</h3>
            <div className="flex flex-wrap gap-2">
              <AccessibleButton
                onClick={() => addAlert('info', 'Information', 'This is an informational alert')}
                size="sm"
              >
                Info Alert
              </AccessibleButton>
              
              <AccessibleButton
                onClick={() => addAlert('success', 'Success', 'Operation completed successfully')}
                size="sm"
                variant="secondary"
              >
                Success Alert
              </AccessibleButton>
              
              <AccessibleButton
                onClick={() => addAlert('warning', 'Warning', 'This is a warning message')}
                size="sm"
                variant="secondary"
              >
                Warning Alert
              </AccessibleButton>
              
              <AccessibleButton
                onClick={() => addAlert('error', 'Error', 'An error has occurred')}
                size="sm"
                variant="danger"
              >
                Error Alert
              </AccessibleButton>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Keyboard Navigation Guide</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Tab:</strong> Move to next focusable element</p>
              <p><strong>Shift + Tab:</strong> Move to previous focusable element</p>
              <p><strong>Enter/Space:</strong> Activate buttons and links</p>
              <p><strong>Arrow Keys:</strong> Navigate within components (tabs, dropdowns)</p>
              <p><strong>Escape:</strong> Close modals and dropdowns</p>
              <p><strong>Home/End:</strong> Move to first/last item in lists</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip Links */}
      <SkipLinks />
      
      {/* Header */}
      <HeaderWrapper className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Accessibility Test Suite
            </h1>
            <NavigationWrapper ariaLabel="Main navigation">
              <nav className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500">
                  Home
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500">
                  Documentation
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500">
                  Help
                </a>
              </nav>
            </NavigationWrapper>
          </div>
        </div>
      </HeaderWrapper>

      {/* Main Content */}
      <MainContent className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTitle
          title="Accessibility Testing"
          subtitle="Comprehensive testing of accessibility features, screen reader support, and keyboard navigation"
        />

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2 mb-6">
            {alerts.map((alert) => (
              <AccessibleAlert
                key={alert.id}
                type={alert.type}
                title={alert.title}
                onDismiss={() => removeAlert(alert.id)}
              >
                {alert.message}
              </AccessibleAlert>
            ))}
          </div>
        )}

        {/* Tab Navigation */}
        <AccessibleTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </MainContent>

      {/* Footer */}
      <FooterWrapper className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 MedIoT Premium UI. All rights reserved.</p>
            <p className="text-sm mt-2">
              This application is designed with accessibility in mind and follows WCAG 2.1 AA guidelines.
            </p>
          </div>
        </div>
      </FooterWrapper>
    </div>
  );
};

export default AccessibilityTest;