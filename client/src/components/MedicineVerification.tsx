import React, { useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface VerificationData {
  identified: boolean;
  confidence: number;
  medicineName: {
    brandName?: string;
    genericName?: string;
    primaryName?: string;
  };
  quickIdentification: {
    shape?: string;
    color?: string;
    visibleText: string[];
    markings?: string;
  };
  verificationNeeded: boolean;
  reasoning: string;
  // Multi-image analysis properties
  multiImageAnalysis?: {
    totalImages: number;
    imageLabels: string[];
    analysisType: string;
  };
  imageContributions?: {
    [key: string]: string;
  };
  dataQuality?: {
    completeness: number;
    consistency: number;
    conflictingInfo: string[];
  };
}

interface MedicineVerificationProps {
  verificationData: VerificationData;
  onConfirm: (confirmedName: string) => void;
  onReject: () => void;
  isLoading?: boolean;
}

const MedicineVerification: React.FC<MedicineVerificationProps> = ({
  verificationData,
  onConfirm,
  onReject,
  isLoading = false
}) => {
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 8) return 'text-green-600 bg-green-100';
    if (confidence >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 8) return 'High Confidence';
    if (confidence >= 6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const handleConfirm = () => {
    const confirmedName = showCustomInput && customName.trim() 
      ? customName.trim()
      : verificationData.medicineName.primaryName || 
        verificationData.medicineName.brandName || 
        verificationData.medicineName.genericName || '';
    
    if (confirmedName) {
      onConfirm(confirmedName);
    }
  };

  const handleCustomNameSubmit = () => {
    if (customName.trim()) {
      onConfirm(customName.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600"></div>
          <span className="ml-3 text-gray-600">Verifying medicine name...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Medicine Name Verification
          </h2>
          <p className="text-gray-600">
            Please confirm if this is the correct medicine name before we gather detailed information.
          </p>
          {verificationData.multiImageAnalysis && (
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                📸 {verificationData.multiImageAnalysis.totalImages} images analyzed
              </span>
            </div>
          )}
        </div>

        {/* Identification Results */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Identified Medicine
              </h3>
              
              {verificationData.identified ? (
                <div className="space-y-2">
                  {verificationData.medicineName.primaryName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Primary Name</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {verificationData.medicineName.primaryName}
                      </p>
                    </div>
                  )}
                  
                  {verificationData.medicineName.brandName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                      <p className="text-gray-900">{verificationData.medicineName.brandName}</p>
                    </div>
                  )}
                  
                  {verificationData.medicineName.genericName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Generic Name</label>
                      <p className="text-gray-900">{verificationData.medicineName.genericName}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <XCircleIcon className="h-5 w-5 mr-2" />
                  <span>Medicine could not be identified clearly</span>
                </div>
              )}
            </div>
            
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(verificationData.confidence)}`}>
              {getConfidenceText(verificationData.confidence)} ({verificationData.confidence}/10)
            </span>
          </div>

          {/* Physical Characteristics */}
          {(verificationData.quickIdentification.shape || 
            verificationData.quickIdentification.color || 
            verificationData.quickIdentification.markings) && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Physical Characteristics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {verificationData.quickIdentification.shape && (
                  <div>
                    <label className="block font-medium text-gray-700">Shape</label>
                    <p className="text-gray-600">{verificationData.quickIdentification.shape}</p>
                  </div>
                )}
                {verificationData.quickIdentification.color && (
                  <div>
                    <label className="block font-medium text-gray-700">Color</label>
                    <p className="text-gray-600">{verificationData.quickIdentification.color}</p>
                  </div>
                )}
                {verificationData.quickIdentification.markings && (
                  <div>
                    <label className="block font-medium text-gray-700">Markings</label>
                    <p className="text-gray-600">{verificationData.quickIdentification.markings}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Visible Text */}
          {verificationData.quickIdentification.visibleText.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Text Found on Medicine</h4>
              <div className="flex flex-wrap gap-2">
                {verificationData.quickIdentification.visibleText.map((text, index) => (
                  <span key={index} className="bg-white px-2 py-1 rounded border text-sm font-mono">
                    {text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Image Contributions (Multi-Image Analysis) */}
          {verificationData.imageContributions && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Image Analysis Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(verificationData.imageContributions).map(([imageKey, contribution]) => (
                  <div key={imageKey} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                        {imageKey.replace('image', 'Image ')}
                      </span>
                      <span className="ml-2 text-sm text-blue-800 font-medium">
                        {verificationData.multiImageAnalysis?.imageLabels?.[parseInt(imageKey.replace('image', '')) - 1] || 'Unknown'}
                      </span>
                    </div>
                    <p className="text-blue-700 text-sm">{String(contribution)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Quality (Multi-Image Analysis) */}
          {verificationData.dataQuality && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Analysis Quality</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <label className="block text-sm font-medium text-green-700">Completeness</label>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 bg-green-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(100, (verificationData.dataQuality.completeness / 10) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-green-800">{verificationData.dataQuality.completeness}/10</span>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <label className="block text-sm font-medium text-blue-700">Consistency</label>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 bg-blue-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(100, (verificationData.dataQuality.consistency / 10) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-blue-800">{verificationData.dataQuality.consistency}/10</span>
                  </div>
                </div>
              </div>
              {verificationData.dataQuality.conflictingInfo?.length > 0 && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h5 className="font-medium text-yellow-800 mb-1">Conflicting Information Detected</h5>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    {verificationData.dataQuality.conflictingInfo.map((conflict: string, index: number) => (
                      <li key={index}>• {conflict}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Warning if verification needed */}
        {verificationData.verificationNeeded && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800">Verification Recommended</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  The AI has some uncertainty about this identification. Please double-check the medicine name.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Custom Name Input */}
        {showCustomInput && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Enter Correct Medicine Name</h4>
            <div className="flex space-x-3">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter the correct medicine name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleCustomNameSubmit()}
              />
              <button
                onClick={handleCustomNameSubmit}
                disabled={!customName.trim()}
                className="px-4 py-2 bg-medical-600 text-white rounded-md hover:bg-medical-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {verificationData.identified && !showCustomInput && (
            <button
              onClick={handleConfirm}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Yes, this is correct
            </button>
          )}
          
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCustomInput ? 'Cancel' : 'Enter different name'}
          </button>
          
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <XCircleIcon className="h-5 w-5 mr-2" />
            Try different image
          </button>
        </div>

        {/* AI Reasoning */}
        {verificationData.reasoning && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
            <p className="text-gray-700 text-sm">{verificationData.reasoning}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineVerification;
