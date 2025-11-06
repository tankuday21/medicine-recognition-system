import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SymptomInput from '../components/Symptoms/SymptomInput';
import BodyPartSelector from '../components/Symptoms/BodyPartSelector';
import SymptomAnalysis from '../components/Symptoms/SymptomAnalysis';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  HeartIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Symptoms = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  const steps = [
    { id: 1, name: 'Select Symptoms', description: 'Choose your symptoms' },
    { id: 2, name: 'Review & Analyze', description: 'Review and get analysis' },
    { id: 3, name: 'Results', description: 'View recommendations' }
  ];

  const handleSymptomAdd = (symptom) => {
    const exists = selectedSymptoms.find(s => s.symptomId === symptom.id);
    if (!exists) {
      setSelectedSymptoms(prev => [...prev, {
        symptomId: symptom.id,
        name: symptom.name,
        severity: 'moderate',
        duration: '1-3 days',
        bodyPart: symptom.bodyParts[0]
      }]);
    }
  };

  const handleSymptomUpdate = (symptomId, updates) => {
    setSelectedSymptoms(prev => 
      prev.map(symptom => 
        symptom.symptomId === symptomId 
          ? { ...symptom, ...updates }
          : symptom
      )
    );
  };

  const handleSymptomRemove = (symptomId) => {
    setSelectedSymptoms(prev => prev.filter(s => s.symptomId !== symptomId));
  };

  const handleAnalyze = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to get symptom analysis');
      return;
    }

    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const response = await fetch('/api/symptoms/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          symptoms: selectedSymptoms
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysisResult(data.data);
        setCurrentStep(3);
      } else {
        setError(data.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setSelectedSymptoms([]);
    setAnalysisResult(null);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <HeartIcon className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Symptom Checker</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get preliminary health guidance based on your symptoms. This tool provides general information 
          and should not replace professional medical advice.
        </p>
      </div>

      {/* Important Disclaimer */}
      <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-900">Important Medical Disclaimer</h3>
            <p className="text-yellow-800 text-sm mt-1">
              This symptom checker is for informational purposes only and is not a substitute for 
              professional medical advice, diagnosis, or treatment. Always seek the advice of your 
              physician or other qualified health provider with any questions you may have regarding 
              a medical condition.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Warning */}
      <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-900">Emergency Situations</h3>
            <p className="text-red-800 text-sm mt-1">
              If you are experiencing a medical emergency, call 911 immediately. Do not use this 
              symptom checker for emergency situations such as chest pain, difficulty breathing, 
              severe bleeding, or loss of consciousness.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${currentStep >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-500'
                }
              `}>
                {step.id}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRightIcon className="h-5 w-5 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Step 1: Symptom Selection */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Your Symptoms</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Body Part Selector */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Body Part</h3>
                <BodyPartSelector onSymptomSelect={handleSymptomAdd} />
              </div>

              {/* Symptom Search */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Search Symptoms</h3>
                <SymptomInput onSymptomSelect={handleSymptomAdd} />
              </div>
            </div>

            {/* Selected Symptoms */}
            {selectedSymptoms.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Symptoms</h3>
                <div className="space-y-4">
                  {selectedSymptoms.map((symptom) => (
                    <div key={symptom.symptomId} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{symptom.name}</h4>
                          
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Severity */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Severity
                              </label>
                              <select
                                value={symptom.severity}
                                onChange={(e) => handleSymptomUpdate(symptom.symptomId, { severity: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="mild">Mild</option>
                                <option value="moderate">Moderate</option>
                                <option value="severe">Severe</option>
                              </select>
                            </div>

                            {/* Duration */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration
                              </label>
                              <select
                                value={symptom.duration}
                                onChange={(e) => handleSymptomUpdate(symptom.symptomId, { duration: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="less than 1 day">Less than 1 day</option>
                                <option value="1-3 days">1-3 days</option>
                                <option value="4-7 days">4-7 days</option>
                                <option value="1-2 weeks">1-2 weeks</option>
                                <option value="more than 2 weeks">More than 2 weeks</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSymptomRemove(symptom.symptomId)}
                          className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={selectedSymptoms.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Analysis
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Review & Analyze */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Symptoms</h2>
            
            <div className="space-y-4 mb-8">
              {selectedSymptoms.map((symptom) => (
                <div key={symptom.symptomId} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{symptom.name}</h4>
                      <p className="text-sm text-gray-600">
                        Severity: {symptom.severity} • Duration: {symptom.duration}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!isAuthenticated && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <InformationCircleIcon className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-900">Sign In Required</h3>
                    <p className="text-blue-800 text-sm mt-1">
                      Please sign in to get personalized symptom analysis and recommendations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !isAuthenticated}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'Get Analysis'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {currentStep === 3 && analysisResult && (
          <div>
            <SymptomAnalysis 
              result={analysisResult} 
              symptoms={selectedSymptoms}
              onRestart={handleRestart}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Symptoms;