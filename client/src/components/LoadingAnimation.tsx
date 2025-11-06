import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  DocumentTextIcon, 
  ShieldCheckIcon,
  BeakerIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface LoadingAnimationProps {
  message?: string;
  type?: 'verification' | 'comprehensive' | 'general';
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  message = "Processing...", 
  type = 'general' 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const getSteps = () => {
    switch (type) {
      case 'verification':
        return [
          { icon: MagnifyingGlassIcon, label: 'Analyzing image', duration: 2000 },
          { icon: DocumentTextIcon, label: 'Extracting text', duration: 1500 },
          { icon: ShieldCheckIcon, label: 'Identifying medicine', duration: 2500 }
        ];
      case 'comprehensive':
        return [
          { icon: MagnifyingGlassIcon, label: 'Gathering comprehensive data', duration: 3000 },
          { icon: BeakerIcon, label: 'Analyzing pharmacology', duration: 2500 },
          { icon: ShieldCheckIcon, label: 'Checking safety information', duration: 2000 },
          { icon: DocumentTextIcon, label: 'Cross-referencing databases', duration: 3500 },
          { icon: CheckCircleIcon, label: 'Finalizing results', duration: 1500 }
        ];
      default:
        return [
          { icon: MagnifyingGlassIcon, label: 'Processing request', duration: 2000 },
          { icon: DocumentTextIcon, label: 'Analyzing data', duration: 2500 },
          { icon: CheckCircleIcon, label: 'Preparing results', duration: 1500 }
        ];
    }
  };

  const steps = getSteps();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const advanceStep = () => {
      if (currentStep < steps.length - 1) {
        setCompletedSteps(prev => [...prev, currentStep]);
        setCurrentStep(prev => prev + 1);
        timeoutId = setTimeout(advanceStep, steps[currentStep + 1]?.duration || 2000);
      } else {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
    };

    timeoutId = setTimeout(advanceStep, steps[currentStep]?.duration || 2000);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentStep, steps]);

  return (
    <div className="card">
      <div className="text-center py-8">
        {/* Main Loading Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-medical-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
        </div>

        {/* Main Message */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {message}
        </h3>
        <p className="text-gray-600 mb-8">
          Please wait while we process your request...
        </p>

        {/* Progress Steps */}
        <div className="max-w-md mx-auto">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(index);
              const isCurrent = currentStep === index;
              const isPending = index > currentStep;

              return (
                <div
                  key={index}
                  className={`flex items-center p-3 rounded-lg transition-all duration-500 ${
                    isCompleted
                      ? 'bg-green-50 border border-green-200'
                      : isCurrent
                      ? 'bg-medical-50 border border-medical-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`flex-shrink-0 mr-3 ${
                    isCompleted
                      ? 'text-green-600'
                      : isCurrent
                      ? 'text-medical-600'
                      : 'text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="h-6 w-6" />
                    ) : (
                      <step.icon className={`h-6 w-6 ${isCurrent ? 'animate-pulse' : ''}`} />
                    )}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${
                      isCompleted
                        ? 'text-green-800'
                        : isCurrent
                        ? 'text-medical-800'
                        : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                  </div>

                  {isCurrent && (
                    <div className="flex-shrink-0 ml-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-medical-600 border-t-transparent"></div>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="flex-shrink-0 ml-3">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-medical-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, ((completedSteps.length + (currentStep < steps.length ? 0.5 : 0)) / steps.length) * 100)}%`
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Step {Math.min(currentStep + 1, steps.length)} of {steps.length}
            </p>
          </div>
        </div>

        {/* Additional Info for Comprehensive Loading */}
        {type === 'comprehensive' && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-blue-900">Comprehensive Analysis in Progress</h4>
                <p className="text-blue-800 text-sm mt-1">
                  We're gathering detailed information from multiple medical databases including FDA, 
                  RxNorm, DailyMed, and other reliable sources to provide you with the most accurate 
                  and comprehensive medicine information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fun Facts for Long Loading */}
        {type === 'comprehensive' && (
          <div className="mt-6 text-sm text-gray-500">
            <p>💡 Did you know? We cross-reference information from over 10 medical databases to ensure accuracy.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingAnimation;
