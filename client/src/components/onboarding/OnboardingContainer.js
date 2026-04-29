// Onboarding Container Component
// Main container that orchestrates the complete onboarding experience

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onboardingFlowManager, interactiveTutorialSystem } from '../../utils/onboardingSystem';
import { OnboardingFlow } from './OnboardingFlow';
import { GuidedTour, TutorialLauncher } from './GuidedTour';
import { OnboardingProgress } from './OnboardingProgress';
import { PersonalizedOnboardingSetup } from './PersonalizedOnboarding';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

/**
 * Main Onboarding Container
 */
export const OnboardingContainer = ({ 
  userId,
  userRole = 'general',
  userLevel = 'beginner',
  onComplete,
  onDismiss,
  showProgress = true,
  autoStart = false
}) => {
  const [currentView, setCurrentView] = useState('welcome');
  const [userProfile, setUserProfile] = useState(null);
  const [activeFlow, setActiveFlow] = useState(null);
  const [activeTutorial, setActiveTutorial] = useState(null);
  const [onboardingStats, setOnboardingStats] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    initializeOnboarding();
  }, [userId, userRole, userLevel]);

  const initializeOnboarding = useCallback(() => {
    const stats = onboardingFlowManager.getOnboardingStats();
    setOnboardingStats(stats);
    const hasCompletedBasic = onboardingFlowManager.completedFlows.has('basic');
    
    if (autoStart && !hasCompletedBasic) {
      const personalizedPath = onboardingFlowManager.personalizedPaths.get(userId);
      if (personalizedPath) {
        setCurrentView('flow');
        startOnboardingFlow();
      } else {
        setCurrentView('setup');
      }
    } else if (hasCompletedBasic) {
      setShowWelcome(false);
      setCurrentView('progress');
    }
  }, [userId, userRole, userLevel, autoStart]);


  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setCurrentView('setup');
  };

  const handleSetupComplete = (profile, personalizedPath) => {
    setUserProfile(profile);
    setCurrentView('flow');
    if (personalizedPath && personalizedPath.flows.length > 0) {
      startSpecificFlow(personalizedPath.flows[0]);
    } else {
      startOnboardingFlow();
    }
  };

  const handleSetupSkip = () => {
    setCurrentView('flow');
    startOnboardingFlow();
  };

  const startOnboardingFlow = () => {
    const flow = onboardingFlowManager.getOnboardingFlow(userRole, userLevel);
    if (flow) {
      setActiveFlow(flow.id);
    } else {
      setCurrentView('progress');
    }
  };

  const startSpecificFlow = (flowId) => {
    setActiveFlow(flowId);
    setCurrentView('flow');
  };

  const handleFlowComplete = (flow) => {
    setActiveFlow(null);
    if (userId) {
      const nextFlow = onboardingFlowManager.getNextRecommendedFlow(userId);
      setCurrentView(nextFlow ? 'continue' : 'progress');
    } else {
      setCurrentView('progress');
    }
    if (onComplete) onComplete(flow);
  };

  const handleFlowSkip = () => {
    setActiveFlow(null);
    setCurrentView('progress');
  };

  const startTutorial = (tutorialId) => {
    setActiveTutorial(tutorialId);
    setCurrentView('tutorial');
  };

  const handleTutorialComplete = () => {
    setActiveTutorial(null);
    setCurrentView('progress');
  };

  const handleTutorialExit = () => {
    setActiveTutorial(null);
    setCurrentView('progress');
  };

  const handleDismiss = () => {
    if (onDismiss) onDismiss();
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={handleWelcomeComplete} onDismiss={handleDismiss} stats={onboardingStats} />;
      case 'setup':
        return <PersonalizedOnboardingSetup userId={userId} onComplete={handleSetupComplete} onSkip={handleSetupSkip} initialProfile={{ role: userRole, experience: userLevel }} />;
      case 'flow':
        return <OnboardingFlow userRole={userRole} userLevel={userLevel} onComplete={handleFlowComplete} onSkip={handleFlowSkip} autoStart={true} />;
      case 'tutorial':
        return <GuidedTour tutorialId={activeTutorial} onComplete={handleTutorialComplete} onExit={handleTutorialExit} autoStart={true} />;
      case 'continue':
        return (
          <ContinueScreen
            userId={userId}
            onContinue={() => {
              const nextFlow = onboardingFlowManager.getNextRecommendedFlow(userId);
              if (nextFlow) startSpecificFlow(nextFlow.id);
            }}
            onFinish={() => setCurrentView('progress')}
          />
        );
      case 'progress':
      default:
        return (
          <div className="space-y-8">
            <OnboardingProgress userId={userId} onFlowStart={startSpecificFlow} onFlowReset={() => setOnboardingStats(onboardingFlowManager.getOnboardingStats())} />
            <TutorialLauncher onTutorialStart={startTutorial} />
          </div>
        );
    }
  };

  return (
    <div className="onboarding-container min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};


/**
 * Welcome Screen Component
 */
const WelcomeScreen = ({ onGetStarted, onDismiss, stats }) => {
  const hasExistingProgress = stats && stats.completedFlows > 0;

  return (
    <div className="min-h-screen flex items-end sm:items-center justify-center p-0 sm:p-4">
      <Card className="w-full max-w-2xl mx-auto p-6 sm:p-10 text-center rounded-t-3xl sm:rounded-2xl relative pb-32 sm:pb-10">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Welcome to MedIoT Premium
          </h1>
          
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Your intelligent medical interface designed for healthcare professionals
          </p>
        </div>

        {hasExistingProgress ? (
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 sm:p-6">
              <h3 className="font-medium text-blue-900 mb-3 text-lg">
                Welcome Back!
              </h3>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                You've completed {stats.completedFlows} onboarding flows and {stats.completedSteps} steps.
                Continue where you left off or explore new features.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">
              Let's get you started
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-5 sm:p-6 bg-gray-50 rounded-xl">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-medium text-gray-900 mb-2">Personalized</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Tailored to your role and experience</p>
              </div>
              
              <div className="p-5 sm:p-6 bg-gray-50 rounded-xl">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-medium text-gray-900 mb-2">Interactive</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Learn by doing with guided tutorials</p>
              </div>
              
              <div className="p-5 sm:p-6 bg-gray-50 rounded-xl">
                <div className="text-3xl mb-3">🏆</div>
                <h3 className="font-medium text-gray-900 mb-2">Rewarding</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Track progress and earn achievements</p>
              </div>
            </div>
          </div>
        )}

        {/* Fixed Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white sm:relative sm:bg-transparent border-t sm:border-t-0 border-gray-100 z-10">
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
            <Button size="lg" onClick={onGetStarted} className="w-full sm:w-auto px-10 py-4">
              {hasExistingProgress ? 'Continue Learning' : 'Get Started'}
            </Button>
            
            {onDismiss && (
              <Button variant="ghost" size="lg" onClick={onDismiss} className="w-full sm:w-auto px-10 py-4">
                Skip for Now
              </Button>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            You can access onboarding anytime from the help menu
          </p>
        </div>
      </Card>
    </div>
  );
};


/**
 * Continue Screen Component
 */
const ContinueScreen = ({ userId, onContinue, onFinish }) => {
  const [nextFlow, setNextFlow] = useState(null);

  useEffect(() => {
    const flow = onboardingFlowManager.getNextRecommendedFlow(userId);
    setNextFlow(flow);
  }, [userId]);

  return (
    <div className="min-h-screen flex items-end sm:items-center justify-center p-0 sm:p-4">
      <Card className="w-full max-w-md mx-auto p-6 sm:p-8 text-center rounded-t-3xl sm:rounded-2xl relative pb-32 sm:pb-8">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Great Progress!
          </h2>
          
          <p className="text-gray-600 leading-relaxed">
            You've completed another onboarding flow. Ready to continue?
          </p>
        </div>

        {nextFlow && (
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 sm:p-6 text-left">
              <h3 className="font-medium text-blue-900 mb-2 text-lg">
                Next: {nextFlow.title}
              </h3>
              <p className="text-sm text-blue-800 mb-3 leading-relaxed">
                {nextFlow.description}
              </p>
              <div className="text-xs text-blue-600">
                ~{nextFlow.estimatedTime} minutes
              </div>
            </div>
          </div>
        )}

        {/* Fixed Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white sm:relative sm:bg-transparent border-t sm:border-t-0 border-gray-100 z-10">
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            {nextFlow && (
              <Button onClick={onContinue} className="w-full py-4">
                Continue with {nextFlow.title}
              </Button>
            )}
            
            <Button variant="ghost" onClick={onFinish} className="w-full py-4">
              Finish for Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};


/**
 * Onboarding Status Widget (for dashboard)
 */
export const OnboardingStatusWidget = ({ 
  userId, 
  onStartOnboarding, 
  onViewProgress,
  compact = false 
}) => {
  const [stats, setStats] = useState(null);
  const [nextRecommendation, setNextRecommendation] = useState(null);

  useEffect(() => {
    const onboardingStats = onboardingFlowManager.getOnboardingStats();
    setStats(onboardingStats);
    if (userId) {
      setNextRecommendation(onboardingFlowManager.getNextRecommendedFlow(userId));
    }
  }, [userId]);

  if (!stats) {
    return (
      <Card className="p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-2 bg-gray-200 rounded"></div>
      </Card>
    );
  }

  const completionPercentage = (stats.completedFlows / stats.totalFlows) * 100;
  const isComplete = completionPercentage >= 100;

  if (compact) {
    return (
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Onboarding</span>
            <Badge variant={isComplete ? 'success' : 'primary'} size="sm">
              {Math.round(completionPercentage)}%
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
        
        {!isComplete && onStartOnboarding && (
          <Button size="sm" onClick={onStartOnboarding}>Continue</Button>
        )}
      </div>
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Onboarding Progress</h3>
        <Badge variant={isComplete ? 'success' : 'primary'}>
          {Math.round(completionPercentage)}%
        </Badge>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-5">
        <motion.div
          className="bg-blue-600 h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div className="text-sm text-gray-600 mb-5">
        {isComplete ? (
          <span className="text-green-600 font-medium">
            🎉 Onboarding complete! You're all set.
          </span>
        ) : (
          <span>{stats.completedFlows} of {stats.totalFlows} flows completed</span>
        )}
      </div>
      
      {nextRecommendation && !isComplete && (
        <div className="mb-5">
          <p className="text-sm text-gray-600 mb-3">Next: {nextRecommendation.title}</p>
          {onStartOnboarding && (
            <Button size="sm" onClick={onStartOnboarding} className="w-full">
              Continue Learning
            </Button>
          )}
        </div>
      )}
      
      {onViewProgress && (
        <Button variant="ghost" size="sm" onClick={onViewProgress} className="w-full text-gray-600 hover:text-gray-800">
          View Details
        </Button>
      )}
    </Card>
  );
};

export default OnboardingContainer;