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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md mx-4"
        >
          <Card className="p-6 bg-white shadow-2xl">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentFlow.title}
                </h2>
                <button
                  onClick={handleFlowSkip}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Skip onboarding"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>\n                </button>\n              </div>\n              \n              <Progress \n                value={progressPercentage} \n                className=\"mb-2\"\n                aria-label={`Onboarding progress: ${Math.round(progressPercentage)}%`}\n              />\n              \n              <p className=\"text-sm text-gray-600\">\n                Step {progress.currentStep + 1} of {currentFlow.steps.length}\n              </p>\n            </div>\n\n            {/* Step Content */}\n            <OnboardingStepContent \n              step={currentStep}\n              onComplete={handleStepComplete}\n              onSkip={handleStepSkip}\n              isLoading={isLoading}\n            />\n          </Card>\n        </motion.div>\n      </motion.div>\n    </AnimatePresence>\n  );\n};\n\n/**\n * Individual Onboarding Step Content\n */\nconst OnboardingStepContent = ({ step, onComplete, onSkip, isLoading }) => {\n  const renderStepContent = () => {\n    switch (step.type) {\n      case 'intro':\n        return <IntroStep step={step} />;\n      case 'tour':\n        return <TourStep step={step} />;\n      case 'interactive':\n        return <InteractiveStep step={step} />;\n      case 'completion':\n        return <CompletionStep step={step} />;\n      default:\n        return <DefaultStep step={step} />;\n    }\n  };\n\n  return (\n    <div className=\"space-y-6\">\n      {/* Step Content */}\n      <motion.div\n        key={step.id}\n        initial={{ opacity: 0, x: 20 }}\n        animate={{ opacity: 1, x: 0 }}\n        exit={{ opacity: 0, x: -20 }}\n        transition={{ duration: 0.3 }}\n      >\n        {renderStepContent()}\n      </motion.div>\n\n      {/* Action Buttons */}\n      <div className=\"flex items-center justify-between pt-4 border-t border-gray-200\">\n        <div>\n          {step.skippable && (\n            <Button\n              variant=\"ghost\"\n              onClick={onSkip}\n              disabled={isLoading}\n              className=\"text-gray-600 hover:text-gray-800\"\n            >\n              Skip\n            </Button>\n          )}\n        </div>\n        \n        <Button\n          onClick={onComplete}\n          loading={isLoading}\n          className=\"min-w-[100px]\"\n        >\n          {step.type === 'completion' ? 'Finish' : 'Next'}\n        </Button>\n      </div>\n    </div>\n  );\n};\n\n/**\n * Intro Step Component\n */\nconst IntroStep = ({ step }) => {\n  const { content } = step;\n  \n  return (\n    <div className=\"text-center space-y-4\">\n      <div className=\"w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center\">\n        <svg className=\"w-8 h-8 text-primary-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n          <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M13 10V3L4 14h7v7l9-11h-7z\" />\n        </svg>\n      </div>\n      \n      <div>\n        <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">\n          {content.title}\n        </h3>\n        <p className=\"text-gray-600 mb-4\">\n          {content.description}\n        </p>\n      </div>\n      \n      {content.features && (\n        <div className=\"bg-gray-50 rounded-lg p-4\">\n          <h4 className=\"text-sm font-medium text-gray-900 mb-2\">Key Features:</h4>\n          <ul className=\"space-y-1\">\n            {content.features.map((feature, index) => (\n              <li key={index} className=\"flex items-center text-sm text-gray-600\">\n                <svg className=\"w-4 h-4 text-green-500 mr-2\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\n                  <path fillRule=\"evenodd\" d=\"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z\" clipRule=\"evenodd\" />\n                </svg>\n                {feature}\n              </li>\n            ))}\n          </ul>\n        </div>\n      )}\n    </div>\n  );\n};\n\n/**\n * Tour Step Component\n */\nconst TourStep = ({ step }) => {\n  const { content } = step;\n  \n  return (\n    <div className=\"space-y-4\">\n      <div className=\"flex items-start space-x-3\">\n        <div className=\"w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0\">\n          <svg className=\"w-5 h-5 text-blue-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n            <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M15 12a3 3 0 11-6 0 3 3 0 016 0z\" />\n            <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z\" />\n          </svg>\n        </div>\n        \n        <div className=\"flex-1\">\n          <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">\n            {content.title}\n          </h3>\n          <p className=\"text-gray-600 mb-3\">\n            {content.description}\n          </p>\n        </div>\n      </div>\n      \n      {content.tips && (\n        <div className=\"bg-blue-50 rounded-lg p-4\">\n          <h4 className=\"text-sm font-medium text-blue-900 mb-2\">💡 Pro Tips:</h4>\n          <ul className=\"space-y-1\">\n            {content.tips.map((tip, index) => (\n              <li key={index} className=\"text-sm text-blue-800\">\n                • {tip}\n              </li>\n            ))}\n          </ul>\n        </div>\n      )}\n      \n      {step.target && (\n        <div className=\"bg-yellow-50 border border-yellow-200 rounded-lg p-3\">\n          <p className=\"text-sm text-yellow-800\">\n            <span className=\"font-medium\">Look for:</span> The highlighted element on your screen\n          </p>\n        </div>\n      )}\n    </div>\n  );\n};\n\n/**\n * Interactive Step Component\n */\nconst InteractiveStep = ({ step }) => {\n  const { content } = step;\n  \n  return (\n    <div className=\"space-y-4\">\n      <div className=\"flex items-start space-x-3\">\n        <div className=\"w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0\">\n          <svg className=\"w-5 h-5 text-green-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n            <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11\" />\n          </svg>\n        </div>\n        \n        <div className=\"flex-1\">\n          <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">\n            {content.title}\n          </h3>\n          <p className=\"text-gray-600 mb-3\">\n            {content.description}\n          </p>\n        </div>\n      </div>\n      \n      {content.action && (\n        <div className=\"bg-green-50 border border-green-200 rounded-lg p-4\">\n          <h4 className=\"text-sm font-medium text-green-900 mb-2\">🎯 Your Task:</h4>\n          <p className=\"text-sm text-green-800\">\n            {content.action}\n          </p>\n        </div>\n      )}\n      \n      <div className=\"bg-gray-50 rounded-lg p-3\">\n        <p className=\"text-sm text-gray-600\">\n          Complete the task above, then click Next to continue.\n        </p>\n      </div>\n    </div>\n  );\n};\n\n/**\n * Completion Step Component\n */\nconst CompletionStep = ({ step }) => {\n  const { content } = step;\n  \n  return (\n    <div className=\"text-center space-y-4\">\n      <div className=\"w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center\">\n        <svg className=\"w-8 h-8 text-green-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n          <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z\" />\n        </svg>\n      </div>\n      \n      <div>\n        <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">\n          {content.title}\n        </h3>\n        <p className=\"text-gray-600 mb-4\">\n          {content.description}\n        </p>\n      </div>\n      \n      {content.rewards && (\n        <div className=\"bg-green-50 rounded-lg p-4 mb-4\">\n          <h4 className=\"text-sm font-medium text-green-900 mb-2\">🎉 What You've Accomplished:</h4>\n          <ul className=\"space-y-1\">\n            {content.rewards.map((reward, index) => (\n              <li key={index} className=\"flex items-center text-sm text-green-800\">\n                <svg className=\"w-4 h-4 text-green-500 mr-2\" fill=\"currentColor\" viewBox=\"0 0 20 20\">\n                  <path fillRule=\"evenodd\" d=\"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z\" clipRule=\"evenodd\" />\n                </svg>\n                {reward}\n              </li>\n            ))}\n          </ul>\n        </div>\n      )}\n      \n      {content.nextSteps && (\n        <div className=\"bg-blue-50 rounded-lg p-4\">\n          <h4 className=\"text-sm font-medium text-blue-900 mb-2\">🚀 Next Steps:</h4>\n          <ul className=\"space-y-1\">\n            {content.nextSteps.map((step, index) => (\n              <li key={index} className=\"text-sm text-blue-800\">\n                • {step}\n              </li>\n            ))}\n          </ul>\n        </div>\n      )}\n    </div>\n  );\n};\n\n/**\n * Default Step Component\n */\nconst DefaultStep = ({ step }) => {\n  return (\n    <div className=\"space-y-4\">\n      <h3 className=\"text-lg font-semibold text-gray-900\">\n        {step.title}\n      </h3>\n      <p className=\"text-gray-600\">\n        {step.description}\n      </p>\n    </div>\n  );\n};\n\nexport default OnboardingFlow;"