import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ExclamationTriangleIcon,
  PlusIcon,
  XMarkIcon,
  BeakerIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import MedicineSearch from '../Medicine/MedicineSearch';

const InteractionChecker = ({ onAnalysisComplete }) => {
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  const addMedicine = (medicine) => {
    if (selectedMedicines.find(m => m._id === medicine._id)) {
      return; // Already added
    }
    
    setSelectedMedicines(prev => [...prev, medicine]);
    setAnalysisResult(null);
    setError('');
  };

  const removeMedicine = (medicineId) => {
    setSelectedMedicines(prev => prev.filter(m => m._id !== medicineId));
    setAnalysisResult(null);
  };

  const analyzeInteractions = async () => {
    if (selectedMedicines.length < 2) {
      setError('Please select at least 2 medicines to check for interactions');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const medicines = selectedMedicines.map(m => ({
        name: m.name,
        dosage: m.dosage,
        genericName: m.genericName
      }));

      const response = await fetch('/api/chat/analyze-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify({ medicines })
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.data);
        if (onAnalysisComplete) {
          onAnalysisComplete(data.data);
        }
      } else {
        throw new Error(data.message || 'Failed to analyze interactions');
      }
    } catch (error) {
      console.error('Interaction analysis error:', error);
      setError('Failed to analyze medicine interactions. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'severe':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'moderate':
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
      case 'mild':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Medicine Interaction Checker</h2>
          <p className="text-sm text-gray-600">Check for potential interactions between medicines</p>
        </div>
      </div>

      {/* Medicine Selection */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add medicines to check for interactions:
          </label>
          <MedicineSearch
            onSelectMedicine={addMedicine}
            placeholder="Search and add medicines..."
          />
        </div>

        {/* Selected Medicines */}
        {selectedMedicines.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Medicines:</h3>
            <div className="space-y-2">
              {selectedMedicines.map((medicine) => (
                <div
                  key={medicine._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <BeakerIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{medicine.name}</p>
                      <p className="text-sm text-gray-600">
                        {medicine.genericName && medicine.genericName !== medicine.name && (
                          <span>{medicine.genericName} • </span>
                        )}
                        {medicine.dosage}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMedicine(medicine._id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Analyze Button */}
      <div className="mb-6">
        <button
          onClick={analyzeInteractions}
          disabled={selectedMedicines.length < 2 || isAnalyzing}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing Interactions...</span>
            </div>
          ) : (
            `Check Interactions ${selectedMedicines.length > 1 ? `(${selectedMedicines.length} medicines)` : ''}`
          )}
        </button>
      </div>

      {/* Analysis Result */}
      {analysisResult && (
        <div className="space-y-4">
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Interaction Analysis</h3>
            
            {/* Severity Badge */}
            <div className="mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(analysisResult.severity)}`}>
                {analysisResult.severity?.charAt(0).toUpperCase() + analysisResult.severity?.slice(1)} Risk
              </span>
            </div>

            {/* Analysis Content */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="prose prose-sm max-w-none">
                {analysisResult.analysis.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < analysisResult.analysis.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                <ul className="space-y-1">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This analysis provides general information only. Always consult your healthcare 
                  provider or pharmacist before combining medications or making changes to your treatment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

InteractionChecker.propTypes = {
  onAnalysisComplete: PropTypes.func
};

export default InteractionChecker;