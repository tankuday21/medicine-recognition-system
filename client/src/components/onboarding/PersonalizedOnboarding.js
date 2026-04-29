// Personalized Onboarding Setup
// Create customized onboarding paths based on user profile and preferences

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onboardingFlowManager } from '../../utils/onboardingSystem';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Radio } from '../ui/Radio';

/**
 * Personalized Onboarding Setup Wizard
 */
export const PersonalizedOnboardingSetup = ({ 
  userId, 
  onComplete, 
  onSkip,
  initialProfile = {} 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState({
    role: '',
    experience: '',
    interests: [],
    goals: [],
    timeAvailable: '',
    learningStyle: '',
    ...initialProfile
  });
  const [isLoading, setIsLoading] = useState(false);
  const [personalizedPath, setPersonalizedPath] = useState(null);

  const steps = [
    { id: 'role', title: "What's your role?", description: 'Help us customize your experience', component: RoleStep },
    { id: 'experience', title: 'Experience Level', description: 'How familiar are you with medical software?', component: ExperienceStep },
    { id: 'interests', title: 'Areas of Interest', description: 'What features are you most interested in?', component: InterestsStep },
    { id: 'goals', title: 'Your Goals', description: 'What do you want to achieve?', component: GoalsStep },
    { id: 'preferences', title: 'Learning Preferences', description: 'How do you prefer to learn?', component: PreferencesStep },
    { id: 'summary', title: 'Your Personalized Path', description: 'Review your customized onboarding experience', component: SummaryStep }
  ];


  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (currentStep === steps.length - 2) {
        generatePersonalizedPath();
      }
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (onComplete) {
        onComplete(userProfile, personalizedPath);
      }
      setIsLoading(false);
    }, 1000);
  };

  const generatePersonalizedPath = () => {
    const path = onboardingFlowManager.createPersonalizedPath(userId, userProfile);
    setPersonalizedPath(path);
  };

  const updateProfile = (updates) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const isStepValid = () => {
    const step = steps[currentStep];
    switch (step.id) {
      case 'role': return userProfile.role !== '';
      case 'experience': return userProfile.experience !== '';
      case 'interests': return userProfile.interests.length > 0;
      case 'goals': return userProfile.goals.length > 0;
      case 'preferences': return userProfile.timeAvailable !== '' && userProfile.learningStyle !== '';
      default: return true;
    }
  };

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      <Card className="p-6 sm:p-8 relative pb-28 sm:pb-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Personalize Your Experience
            </h1>
            {onSkip && (
              <Button variant="ghost" onClick={onSkip} className="text-gray-600 hover:text-gray-800">
                Skip Setup
              </Button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-5">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <CurrentStepComponent
              profile={userProfile}
              onUpdate={updateProfile}
              personalizedPath={personalizedPath}
            />
          </motion.div>
        </AnimatePresence>

        {/* Fixed Navigation */}
        <div className="fixed bottom-0 left-0 right-0 sm:relative p-4 sm:p-0 sm:pt-6 sm:border-t border-gray-200 bg-white sm:bg-transparent z-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div>
              {currentStep > 0 && (
                <Button variant="ghost" onClick={handlePrevious} disabled={isLoading}>
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {currentStep + 1} of {steps.length}
              </span>
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || isLoading}
                loading={isLoading && currentStep === steps.length - 1}
                className="min-w-[120px]"
              >
                {currentStep === steps.length - 1 ? 'Start Onboarding' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};


/**
 * Role Selection Step
 */
const RoleStep = ({ profile, onUpdate }) => {
  const roles = [
    { id: 'doctor', title: 'Doctor / Physician', description: 'Medical practitioner providing patient care', icon: '👨‍⚕️' },
    { id: 'nurse', title: 'Nurse', description: 'Healthcare professional providing patient care', icon: '👩‍⚕️' },
    { id: 'admin', title: 'Administrator', description: 'Managing healthcare operations and systems', icon: '👨‍💼' },
    { id: 'technician', title: 'Medical Technician', description: 'Operating medical equipment and devices', icon: '🔬' },
    { id: 'student', title: 'Student / Trainee', description: 'Learning healthcare practices and systems', icon: '🎓' },
    { id: 'other', title: 'Other', description: 'Different role in healthcare', icon: '👤' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {roles.map((role) => (
          <label
            key={role.id}
            className={`flex items-center p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all ${
              profile.role === role.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Radio
              name="role"
              value={role.id}
              checked={profile.role === role.id}
              onChange={(e) => onUpdate({ role: e.target.value })}
              className="sr-only"
            />
            <div className="flex items-center space-x-4 flex-1">
              <span className="text-2xl sm:text-3xl">{role.icon}</span>
              <div>
                <h3 className="font-medium text-gray-900">{role.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{role.description}</p>
              </div>
            </div>
            {profile.role === role.id && (
              <div className="text-blue-500">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  );
};

/**
 * Experience Level Step
 */
const ExperienceStep = ({ profile, onUpdate }) => {
  const levels = [
    { id: 'beginner', title: 'Beginner', description: 'New to medical software and digital healthcare tools', features: ['Step-by-step guidance', 'Detailed explanations', 'Extra help resources'] },
    { id: 'intermediate', title: 'Intermediate', description: 'Some experience with healthcare software', features: ['Focused tutorials', 'Key feature highlights', 'Efficiency tips'] },
    { id: 'advanced', title: 'Advanced', description: 'Experienced with medical software and systems', features: ['Quick overview', 'Advanced features', 'Customization options'] }
  ];

  return (
    <div className="space-y-5">
      {levels.map((level) => (
        <label
          key={level.id}
          className={`block p-5 sm:p-6 border-2 rounded-xl cursor-pointer transition-all ${
            profile.experience === level.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Radio
            name="experience"
            value={level.id}
            checked={profile.experience === level.id}
            onChange={(e) => onUpdate({ experience: e.target.value })}
            className="sr-only"
          />
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">{level.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{level.description}</p>
              <ul className="space-y-2">
                {level.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            {profile.experience === level.id && (
              <div className="text-blue-500 ml-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};


/**
 * Interests Selection Step
 */
const InterestsStep = ({ profile, onUpdate }) => {
  const interests = [
    { id: 'patient-management', title: 'Patient Management', icon: '👥' },
    { id: 'diagnostics', title: 'Diagnostics & Testing', icon: '🔬' },
    { id: 'analytics', title: 'Data & Analytics', icon: '📊' },
    { id: 'scheduling', title: 'Appointment Scheduling', icon: '📅' },
    { id: 'billing', title: 'Billing & Insurance', icon: '💰' },
    { id: 'communication', title: 'Team Communication', icon: '💬' },
    { id: 'reporting', title: 'Reports & Documentation', icon: '📋' },
    { id: 'mobile', title: 'Mobile Features', icon: '📱' }
  ];

  const handleInterestToggle = (interestId) => {
    const currentInterests = profile.interests || [];
    const newInterests = currentInterests.includes(interestId)
      ? currentInterests.filter(id => id !== interestId)
      : [...currentInterests, interestId];
    onUpdate({ interests: newInterests });
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        Select all areas you're interested in learning about (choose at least one):
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        {interests.map((interest) => {
          const isSelected = (profile.interests || []).includes(interest.id);
          return (
            <label
              key={interest.id}
              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Checkbox
                checked={isSelected}
                onChange={() => handleInterestToggle(interest.id)}
                className="sr-only"
              />
              <div className="flex items-center space-x-3 flex-1">
                <span className="text-xl sm:text-2xl">{interest.icon}</span>
                <span className="text-sm font-medium text-gray-900">{interest.title}</span>
              </div>
              {isSelected && (
                <div className="text-blue-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Goals Selection Step
 */
const GoalsStep = ({ profile, onUpdate }) => {
  const goals = [
    { id: 'efficiency', title: 'Improve Workflow Efficiency', icon: '⚡' },
    { id: 'patient-care', title: 'Enhance Patient Care', icon: '❤️' },
    { id: 'compliance', title: 'Ensure Regulatory Compliance', icon: '✅' },
    { id: 'collaboration', title: 'Better Team Collaboration', icon: '🤝' },
    { id: 'data-insights', title: 'Gain Data Insights', icon: '🔍' },
    { id: 'cost-reduction', title: 'Reduce Operational Costs', icon: '💡' }
  ];

  const handleGoalToggle = (goalId) => {
    const currentGoals = profile.goals || [];
    const newGoals = currentGoals.includes(goalId)
      ? currentGoals.filter(id => id !== goalId)
      : [...currentGoals, goalId];
    onUpdate({ goals: newGoals });
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        What are your main goals with this platform? (select all that apply):
      </p>
      
      <div className="space-y-4">
        {goals.map((goal) => {
          const isSelected = (profile.goals || []).includes(goal.id);
          return (
            <label
              key={goal.id}
              className={`flex items-center p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Checkbox
                checked={isSelected}
                onChange={() => handleGoalToggle(goal.id)}
                className="sr-only"
              />
              <div className="flex items-center space-x-4 flex-1">
                <span className="text-2xl sm:text-3xl">{goal.icon}</span>
                <span className="font-medium text-gray-900">{goal.title}</span>
              </div>
              {isSelected && (
                <div className="text-blue-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};


/**
 * Preferences Step
 */
const PreferencesStep = ({ profile, onUpdate }) => {
  const timeOptions = [
    { value: '5', label: '5 minutes - Quick overview' },
    { value: '15', label: '15 minutes - Essential features' },
    { value: '30', label: '30 minutes - Comprehensive tour' },
    { value: 'flexible', label: "Flexible - I'll go at my own pace" }
  ];

  const learningStyles = [
    { id: 'visual', title: 'Visual Learner', description: 'I prefer screenshots, diagrams, and visual guides', icon: '👁️' },
    { id: 'hands-on', title: 'Hands-on Learner', description: 'I learn best by trying things myself with guidance', icon: '✋' },
    { id: 'step-by-step', title: 'Step-by-step Learner', description: 'I prefer detailed instructions and sequential learning', icon: '📝' }
  ];

  return (
    <div className="space-y-8">
      {/* Time Available */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">
          How much time do you have for onboarding?
        </h3>
        <Select
          value={profile.timeAvailable}
          onChange={(e) => onUpdate({ timeAvailable: e.target.value })}
          options={timeOptions}
          placeholder="Select time preference"
        />
      </div>

      {/* Learning Style */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">
          What's your preferred learning style?
        </h3>
        <div className="space-y-4">
          {learningStyles.map((style) => (
            <label
              key={style.id}
              className={`flex items-start p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all ${
                profile.learningStyle === style.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Radio
                name="learningStyle"
                value={style.id}
                checked={profile.learningStyle === style.id}
                onChange={(e) => onUpdate({ learningStyle: e.target.value })}
                className="sr-only"
              />
              <div className="flex items-start space-x-4 flex-1">
                <span className="text-2xl">{style.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{style.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                </div>
              </div>
              {profile.learningStyle === style.id && (
                <div className="text-blue-500 ml-4">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};


/**
 * Summary Step
 */
const SummaryStep = ({ profile, personalizedPath }) => {
  const getRoleTitle = (role) => {
    const roles = {
      doctor: 'Doctor / Physician',
      nurse: 'Nurse',
      admin: 'Administrator',
      technician: 'Medical Technician',
      student: 'Student / Trainee',
      other: 'Other'
    };
    return roles[role] || role;
  };

  const getExperienceTitle = (experience) => {
    const levels = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
    return levels[experience] || experience;
  };

  return (
    <div className="space-y-8">
      {/* Profile Summary */}
      <div className="bg-gray-50 rounded-xl p-5 sm:p-6">
        <h3 className="font-medium text-gray-900 mb-4">Your Profile</h3>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 text-sm">
          <div>
            <span className="text-gray-600">Role:</span>
            <span className="ml-2 font-medium">{getRoleTitle(profile.role)}</span>
          </div>
          <div>
            <span className="text-gray-600">Experience:</span>
            <span className="ml-2 font-medium">{getExperienceTitle(profile.experience)}</span>
          </div>
          <div>
            <span className="text-gray-600">Time Available:</span>
            <span className="ml-2 font-medium">
              {profile.timeAvailable === 'flexible' ? 'Flexible' : `${profile.timeAvailable} minutes`}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Learning Style:</span>
            <span className="ml-2 font-medium capitalize">
              {profile.learningStyle?.replace('-', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Personalized Path */}
      {personalizedPath && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Your Personalized Learning Path</h3>
          <div className="space-y-4">
            {personalizedPath.flows.map((flowId, index) => {
              const flow = onboardingFlowManager.flows.get(flowId);
              return (
                <div
                  key={flowId}
                  className="flex items-center space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-xl"
                >
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{flow?.title || flowId}</h4>
                    <p className="text-sm text-gray-600 mt-1">{flow?.description || 'Custom flow'}</p>
                  </div>
                  <div className="text-sm text-gray-500 flex-shrink-0">~{flow?.estimatedTime || 5}m</div>
                </div>
              );
            })}
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-800">
              🎯 Total estimated time: ~{personalizedPath.estimatedTime} minutes
            </p>
          </div>
        </div>
      )}

      {/* What to Expect */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">What to Expect</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Interactive tutorials tailored to your role and experience
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Focus on features that match your interests and goals
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Progress tracking and achievement rewards
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Skip or revisit any section at your own pace
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PersonalizedOnboardingSetup;