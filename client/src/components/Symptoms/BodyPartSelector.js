import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  PlusIcon
} from '@heroicons/react/24/outline';

const BodyPartSelector = ({ onSymptomSelect }) => {
  const [bodyParts, setBodyParts] = useState([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBodyParts();
  }, []);

  const loadBodyParts = async () => {
    try {
      const response = await fetch('/api/symptoms/body-parts');
      const data = await response.json();

      if (data.success) {
        setBodyParts(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Failed to load body parts:', error);
      setError('Failed to load body parts');
    }
  };

  const handleBodyPartSelect = async (bodyPart) => {
    setSelectedBodyPart(bodyPart);
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/symptoms/body-parts/${bodyPart.id}`);
      const data = await response.json();

      if (data.success) {
        setSymptoms(data.data);
      } else {
        setError(data.message);
        setSymptoms([]);
      }
    } catch (error) {
      console.error('Failed to load symptoms:', error);
      setError('Failed to load symptoms');
      setSymptoms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSymptomSelect = (symptom) => {
    onSymptomSelect(symptom);
  };

  const getBodyPartIcon = (bodyPartId) => {
    const icons = {
      head: '🧠',
      face: '😊',
      throat: '🗣️',
      chest: '🫁',
      abdomen: '🤰',
      back: '🦴',
      arms: '💪',
      legs: '🦵',
      general: '🏃'
    };
    return icons[bodyPartId] || '📍';
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      neurological: 'bg-purple-100 text-purple-800',
      respiratory: 'bg-green-100 text-green-800',
      cardiovascular: 'bg-red-100 text-red-800',
      gastrointestinal: 'bg-yellow-100 text-yellow-800',
      musculoskeletal: 'bg-indigo-100 text-indigo-800',
      dermatological: 'bg-pink-100 text-pink-800',
      ent: 'bg-orange-100 text-orange-800',
      ophthalmological: 'bg-teal-100 text-teal-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      {/* Body Parts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {bodyParts.map((bodyPart) => (
          <button
            key={bodyPart.id}
            onClick={() => handleBodyPartSelect(bodyPart)}
            className={`
              p-4 border-2 rounded-lg text-center transition-all hover:shadow-md
              ${selectedBodyPart?.id === bodyPart.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="text-2xl mb-2">{getBodyPartIcon(bodyPart.id)}</div>
            <div className="font-medium text-sm">{bodyPart.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              {bodyPart.symptoms.length} symptoms
            </div>
          </button>
        ))}
      </div>

      {/* Selected Body Part Symptoms */}
      {selectedBodyPart && (
        <div className="border-t pt-6">
          <h3 className="font-medium text-gray-900 mb-4">
            Symptoms for {selectedBodyPart.name}
          </h3>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading symptoms...</p>
            </div>
          ) : symptoms.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {symptoms.map((symptom) => (
                <button
                  key={symptom.id}
                  onClick={() => handleSymptomSelect(symptom)}
                  className="p-3 border border-gray-200 rounded-lg text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{symptom.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(symptom.category)}`}>
                          {symptom.category}
                        </span>
                        {symptom.criticalThreshold && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            ⚠️ Critical
                          </span>
                        )}
                      </div>
                    </div>
                    <PlusIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No symptoms available for this body part</p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Instructions */}
      {!selectedBodyPart && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">How to use:</h4>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Click on a body part where you're experiencing symptoms</li>
            <li>Browse the list of symptoms for that area</li>
            <li>Click the "+" button to add symptoms to your list</li>
            <li>You can select multiple symptoms from different body parts</li>
          </ol>
        </div>
      )}
    </div>
  );
};

BodyPartSelector.propTypes = {
  onSymptomSelect: PropTypes.func.isRequired
};

export default BodyPartSelector;