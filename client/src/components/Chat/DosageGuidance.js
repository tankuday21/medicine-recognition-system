import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ClockIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import MedicineSearch from '../Medicine/MedicineSearch';

const DosageGuidance = ({ medicine: initialMedicine, onGuidanceComplete }) => {
  const [selectedMedicine, setSelectedMedicine] = useState(initialMedicine || null);
  const [isLoading, setIsLoading] = useState(false);
  const [guidance, setGuidance] = useState(null);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();

  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine);
    setGuidance(null);
    setError('');
  };

  const getGuidance = async () => {
    if (!selectedMedicine) {
      setError('Please select a medicine first');
      return;
    }

    if (!isAuthenticated) {
      setError('Please sign in to get personalized dosage guidance');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat/dosage-guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          medicine: {
            name: selectedMedicine.name,
            dosage: selectedMedicine.dosage,
            genericName: selectedMedicine.genericName
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setGuidance(data.data);
        if (onGuidanceComplete) {
          onGuidanceComplete(data.data);
        }
      } else {
        throw new Error(data.message || 'Failed to get dosage guidance');
      }
    } catch (error) {
      console.error('Dosage guidance error:', error);
      setError('Failed to get dosage guidance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <ClockIcon className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dosage Guidance</h2>
          <p className="text-sm text-gray-600">Get personalized dosage information</p>
        </div>
      </div>

      {/* User Profile Info */}
      {isAuthenticated && user && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <UserIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Your Profile</span>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Name: {user.name}</p>
            {user.gender && <p>Gender: {user.gender}</p>}
            {user.allergies && user.allergies.length > 0 && (
              <p>Allergies: {user.allergies.join(', ')}</p>
            )}
            {user.chronicConditions && user.chronicConditions.length > 0 && (
              <p>Conditions: {user.chronicConditions.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* Medicine Selection */}
      {!initialMedicine && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select medicine for dosage guidance:
          </label>
          <MedicineSearch
            onSelectMedicine={handleMedicineSelect}
            placeholder="Search for a medicine..."
          />
        </div>
      )}

      {/* Selected Medicine Display */}
      {selectedMedicine && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Selected Medicine:</h3>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{selectedMedicine.name}</p>
              <p className="text-sm text-gray-600">
                {selectedMedicine.genericName && selectedMedicine.genericName !== selectedMedicine.name && (
                  <span>{selectedMedicine.genericName} • </span>
                )}
                {selectedMedicine.dosage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Get Guidance Button */}
      <div className="mb-6">
        <button
          onClick={getGuidance}
          disabled={!selectedMedicine || isLoading || !isAuthenticated}
          className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Getting Guidance...</span>
            </div>
          ) : (
            'Get Dosage Guidance'
          )}
        </button>
      </div>

      {/* Authentication Notice */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Sign In Required</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Please sign in to get personalized dosage guidance based on your health profile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Guidance Result */}
      {guidance && (
        <div className="space-y-4">
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Dosage Guidance for {guidance.medicine.name}
            </h3>
            
            {/* Guidance Content */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="prose prose-sm max-w-none">
                {guidance.guidance.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < guidance.guidance.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Considerations */}
            {guidance.considerations && guidance.considerations.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Important Considerations:</h4>
                <ul className="space-y-1">
                  {guidance.considerations.map((consideration, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{consideration}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Important Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Medical Disclaimer</h4>
                <p className="text-sm text-red-700 mt-1">
                  This guidance is for informational purposes only and should not replace professional 
                  medical advice. Always consult your healthcare provider for personalized dosage 
                  recommendations based on your specific health condition and medical history.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DosageGuidance.propTypes = {
  medicine: PropTypes.object,
  onGuidanceComplete: PropTypes.func
};

export default DosageGuidance;