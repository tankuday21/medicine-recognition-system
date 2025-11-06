import React from 'react';
import PropTypes from 'prop-types';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  HeartIcon,
  PhoneIcon,
  LightBulbIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const SymptomAnalysis = ({ result, symptoms, onRestart }) => {
  const { conditions, hasEmergencySymptoms, criticalSymptoms, recommendSeekCare } = result;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'mild':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'moderate':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'mild':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 70) return 'text-red-600';
    if (probability >= 50) return 'text-yellow-600';
    if (probability >= 30) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
        <button
          onClick={onRestart}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* Emergency Alert */}
      {hasEmergencySymptoms && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900">⚠️ EMERGENCY ALERT</h3>
              <p className="text-red-800 mt-1">
                Your symptoms may indicate a serious medical emergency. 
                <strong> Call 911 or go to the nearest emergency room immediately.</strong>
              </p>
              <div className="mt-3 flex space-x-3">
                <a
                  href="tel:911"
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span>Call 911</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Symptoms Alert */}
      {criticalSymptoms.length > 0 && !hasEmergencySymptoms && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-orange-900">Critical Symptoms Detected</h3>
              <p className="text-orange-800 mt-1">
                You have symptoms that require immediate medical attention:
              </p>
              <ul className="mt-2 list-disc list-inside text-orange-800">
                {criticalSymptoms.map((symptom, index) => (
                  <li key={index}>{symptom.name} ({symptom.severity})</li>
                ))}
              </ul>
              <p className="mt-2 font-medium text-orange-900">
                Please contact your healthcare provider or visit urgent care immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Seek Care Recommendation */}
      {recommendSeekCare && !hasEmergencySymptoms && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <HeartIcon className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900">Medical Consultation Recommended</h3>
              <p className="text-blue-800 mt-1">
                Based on your symptoms, we recommend consulting with a healthcare provider 
                for proper evaluation and treatment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Your Symptoms Summary */}
      <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Your Reported Symptoms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {symptoms.map((symptom, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
              <span className="font-medium">{symptom.name}</span>
              <div className="text-sm text-gray-600">
                <span className="capitalize">{symptom.severity}</span> • {symptom.duration}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Possible Conditions */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Possible Conditions</h3>
        
        {conditions.length > 0 ? (
          <div className="space-y-4">
            {conditions.map((condition, index) => (
              <div key={index} className={`p-4 border rounded-lg ${getSeverityColor(condition.severity)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getSeverityIcon(condition.severity)}
                    <div>
                      <h4 className="font-medium text-lg">{condition.condition}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm">
                        <span className={`font-bold ${getProbabilityColor(condition.probability)}`}>
                          {condition.probability}% match
                        </span>
                        <span className="text-gray-600">
                          {condition.matchingSymptoms}/{condition.totalSymptoms} symptoms match
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Self-Care Recommendations */}
                {condition.selfCare && condition.selfCare.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium mb-2 flex items-center space-x-2">
                      <LightBulbIcon className="h-4 w-4" />
                      <span>Self-Care Suggestions</span>
                    </h5>
                    <ul className="list-disc list-inside text-sm space-y-1 ml-6">
                      {condition.selfCare.map((care, careIndex) => (
                        <li key={careIndex}>{care}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* When to See Doctor */}
                {condition.seeDoctor && (
                  <div className="p-3 bg-white bg-opacity-50 rounded border">
                    <h5 className="font-medium mb-1 flex items-center space-x-2">
                      <HeartIcon className="h-4 w-4" />
                      <span>When to See a Doctor</span>
                    </h5>
                    <p className="text-sm">{condition.seeDoctor}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No specific conditions identified based on your symptoms.</p>
            <p className="text-sm mt-1">Consider consulting a healthcare provider for evaluation.</p>
          </div>
        )}
      </div>

      {/* General Recommendations */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-3">General Health Recommendations</h3>
        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
          <li>Monitor your symptoms and note any changes</li>
          <li>Stay hydrated and get adequate rest</li>
          <li>Avoid self-medication without professional guidance</li>
          <li>Keep a symptom diary to track patterns</li>
          <li>Contact your healthcare provider if symptoms worsen or persist</li>
        </ul>
      </div>

      {/* Important Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-yellow-800">
            <p className="font-medium">Important Disclaimer</p>
            <p className="text-sm mt-1">
              This analysis is for informational purposes only and should not replace professional 
              medical advice, diagnosis, or treatment. Always consult with qualified healthcare 
              providers for proper medical evaluation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

SymptomAnalysis.propTypes = {
  result: PropTypes.object.isRequired,
  symptoms: PropTypes.array.isRequired,
  onRestart: PropTypes.func.isRequired
};

export default SymptomAnalysis;