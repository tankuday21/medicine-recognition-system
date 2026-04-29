// Interactive Onboarding Flow Component
// Progressive onboarding with feature introduction and guided tours

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onboardingFlowManager } from '../../utils/onboardingSystem';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { Card } from '../ui/Card';

/**
 * Main Onboarding Flow Component
 */
export const OnboardingFlow = ({ 
  userRole = 'general', 
  userLevel = 'beginner',
  onComplete,
  onSkip,
  autoStart = true 
}) => {
  const [currentFlow, setCurrentFlow] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize onboarding flow
  useEffect(() => {
    if (autoStart) {
      initializeOnboarding();
    }
  }, [userRole, userLevel, autoStart]);

  const initializeOnboarding = useCallback(() => {
    const flow = onboardingFlowManager.getOnboardingFlow(userRole, userLevel);
    if (flow) {
      const flowData = onboardingFlowManager.startFlow(flow.id);
      if (flowData) {
        setCurrentFlow(flowData.flow);
        setCurrentStep(flowData.currentStepData);
        setProgress(flowData.progress);
        setIsVisible(true);
      }
    }
  }, [userRole, userLevel]);

  const handleStepComplete = useCallback(() => {
    if (!currentFlow || !currentStep) return;

    setIsLoading(true);
    
    setTimeout(() => {
      const completed = onboardingFlowManager.completeStep(currentFlow.id, currentStep.id);
      
      if (completed) {
        const nextStepData = onboardingFlowManager.getCurrentStep(currentFlow.id);
        
        if (nextStepData) {
          setCurrentStep(nextStepData.step);
          setProgress(prev => ({
            ...prev,
            currentStep: prev.currentStep + 1
          }));
        } else {
          // Flow completed
          handleFlowComplete();
        }
      }
      
      setIsLoading(false);
    }, 500);
  }, [currentFlow, currentStep]);

  const handleStepSkip = useCallback(() => {
    if (!currentFlow || !currentStep || !currentStep.skippable) return;

    const skipped = onboardingFlowManager.skipStep(currentFlow.id, currentStep.id);
    
    if (skipped) {
      const nextStepData = onboardingFlowManager.getCurrentStep(currentFlow.id);
      
      if (nextStepData) {
        setCurrentStep(nextStepData.step);
        setProgress(prev => ({
          ...prev,
          currentStep: prev.currentStep + 1
        }));
      } else {
        handleFlowComplete();
      }
    }
  }, [currentFlow, currentStep]);

  const handleFlowComplete = useCallback(() => {
    setIsVisible(false);
    if (onComplete) {
      onComplete(currentFlow);
    }
  }, [currentFlow, onComplete]);

  const handleFlowSkip = useCallback(() => {
    setIsVisible(false);
    if (onSkip) {
      onSkip(currentFlow);
    }
  }, [currentFlow, onSkip]);

  if (!isVisible || !currentFlow || !currentStep) {
    return null;
  }

  const progressPercentage = progress ? 
    ((progress.currentStep + 1) / currentFlow.steps.length) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          className="w-full max-w-md mx-0 sm:mx-4 max-h-[90vh] sm:max-h-none"
        >
          <Card className="p-6 sm:p-8 bg-white shadow-2xl rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-none">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {currentFlow.title}
                </h2>
                <button
                  onClick={handleFlowSkip}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  aria-label="Skip onboarding"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <Progress 
                value={progressPercentage} 
                className="mb-3"
                aria-label={`Onboarding progress: ${Math.round(progressPercentage)}%`}
              />
              
              <p className="text-sm text-gray-600">
                Step {progress.currentStep + 1} of {currentFlow.steps.length}
              </p>
            </div>

            {/* Step Content - Scrollable */}
            <div className="flex-1 overflow-y-auto pb-24 sm:pb-0">
              <OnboardingStepContent 
                step={currentStep}
                onComplete={handleStepComplete}
                onSkip={handleStepSkip}
                isLoading={isLoading}
              />
            </div>

            {/* Fixed Action Buttons */}
            <div className="fixed bottom-0 left-0 right-0 sm:relative sm:mt-6 p-4 sm:p-0 bg-white sm:bg-transparent border-t sm:border-t-0 border-gray-100 z-10">
              <div className="flex items-center justify-between max-w-md mx-auto sm:max-w-none">
                <div>
                  {currentStep.skippable && (
                    <Button
                      variant="ghost"
                      onClick={handleStepSkip}
                      disabled={isLoading}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Skip
                    </Button>
                  )}
                </div>
                
                <Button
                  onClick={handleStepComplete}
                  loading={isLoading}
                  className="min-w-[120px]"
                >
                  {currentStep.type === 'completion' ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Individual Onboarding Step Content
 */
const OnboardingStepContent = ({ step, isLoading }) => {
  const renderStepContent = () => {
    switch (step.type) {
      case 'intro':
        return <IntroStep step={step} />;
      case 'tour':
        return <TourStep step={step} />;
      case 'interactive':
        return <InteractiveStep step={step} />;
      case 'completion':
        return <CompletionStep step={step} />;
      default:
        return <DefaultStep step={step} />;
    }
  };

  return (
    <div className="onboarding-step-content">
      <motion.div
        key={step.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderStepContent()}
      </motion.div>
    </div>
  );
};

/**
 * Intro Step Component
 */
const IntroStep = ({ step }) => {
  const { content } = step;
  
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          {content.title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {content.description}
        </p>
      </div>
      
      {content.features && (
        <div className="bg-gray-50 rounded-xl p-5 mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Key Features:</h4>
          <ul className="space-y-3">
            {content.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Tour Step Component
 */
const TourStep = ({ step }) => {
  const { content } = step;
  
  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {content.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {content.description}
          </p>
        </div>
      </div>
      
      {content.tips && (
        <div className="bg-blue-50 rounded-xl p-5">
          <h4 className="text-sm font-medium text-blue-900 mb-3">💡 Pro Tips:</h4>
          <ul className="space-y-2">
            {content.tips.map((tip, index) => (
              <li key={index} className="text-sm text-blue-800 leading-relaxed">
                • {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {step.target && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">Look for:</span> The highlighted element on your screen
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Interactive Step Component
 */
const InteractiveStep = ({ step }) => {
  const { content } = step;
  
  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
        </div>
        
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {content.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {content.description}
          </p>
        </div>
      </div>
      
      {content.action && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <h4 className="text-sm font-medium text-green-900 mb-2">🎯 Your Task:</h4>
          <p className="text-sm text-green-800 leading-relaxed">
            {content.action}
          </p>
        </div>
      )}
      
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-600">
          Complete the task above, then click Next to continue.
        </p>
      </div>
    </div>
  );
};

/**
 * Completion Step Component
 */
const CompletionStep = ({ step }) => {
  const { content } = step;
  
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          {content.title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {content.description}
        </p>
      </div>
      
      {content.rewards && (
        <div className="bg-green-50 rounded-xl p-5">
          <h4 className="text-sm font-medium text-green-900 mb-4">🎉 What You've Accomplished:</h4>
          <ul className="space-y-3">
            {content.rewards.map((reward, index) => (
              <li key={index} className="flex items-center text-sm text-green-800">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {reward}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {content.nextSteps && (
        <div className="bg-blue-50 rounded-xl p-5">
          <h4 className="text-sm font-medium text-blue-900 mb-4">🚀 Next Steps:</h4>
          <ul className="space-y-2">
            {content.nextSteps.map((nextStep, index) => (
              <li key={index} className="text-sm text-blue-800 leading-relaxed">
                • {nextStep}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Default Step Component
 */
const DefaultStep = ({ step }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {step.title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {step.description}
      </p>
    </div>
  );
};

export default OnboardingFlow;