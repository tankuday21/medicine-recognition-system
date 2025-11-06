// Simple Onboarding System Component
// Basic onboarding flow for premium UI

import React, { useState } from 'react';

/**
 * Onboarding System Component
 */
export const OnboardingSystem = ({ 
  isOpen = false, 
  onComplete,
  variant = 'premium'
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Premium UI',
      description: 'Experience enhanced medical app interface with improved accessibility and performance.',
      icon: '🎉'
    },
    {
      title: 'Touch Optimized',
      description: 'All components are optimized for touch interactions with minimum 44px touch targets.',
      icon: '👆'
    },
    {
      title: 'Accessibility First',
      description: 'Built with accessibility in mind, supporting screen readers and keyboard navigation.',
      icon: '♿'
    },
    {
      title: 'Ready to Go!',
      description: 'You\'re all set to use the enhanced medical app interface.',
      icon: '✅'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handleSkip = () => {
    onComplete?.();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 text-center">
          <div className="text-4xl mb-4">{step.icon}</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h2>
          <p className="text-gray-600">{step.description}</p>
        </div>

        {/* Progress */}
        <div className="px-6 mb-6">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Step {currentStep + 1}</span>
            <span>{steps.length} steps</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSystem;