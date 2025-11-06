import React, { useState } from 'react';
import { 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  BeakerIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface ComprehensiveResultsProps {
  results: any;
  onReset: () => void;
}

const ComprehensiveResults: React.FC<ComprehensiveResultsProps> = ({ results, onReset }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pharmacology' | 'safety' | 'regulatory' | 'physical' | 'analysis'>('overview');

  const { analysis, essentialInfo, readMoreInfo } = results;

  // Helper function to safely render any value
  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return 'Not available';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      return (
        <div className="space-y-1">
          {Object.entries(value).map(([key, val]) => (
            <div key={key}>
              <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
              <span>{String(val)}</span>
            </div>
          ))}
        </div>
      );
    }
    if (Array.isArray(value)) {
      return (
        <ul className="space-y-1">
          {value.map((item, index) => (
            <li key={index}>• {String(item)}</li>
          ))}
        </ul>
      );
    }
    return String(value);
  };

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

  return (
    <div className="space-y-6">
      {/* Header with Confidence Score */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {essentialInfo?.identification?.verifiedName || 'Medicine Analysis'}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(analysis?.confidence || 5)}`}>
                {getConfidenceText(analysis?.confidence || 5)} ({analysis?.confidence || 5}/10)
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                📚 Comprehensive Analysis
              </span>
              <span>Detailed Information Available</span>
            </div>
          </div>
          <button
            onClick={onReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Try Another Image
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: InformationCircleIcon },
              { id: 'pharmacology', label: 'Pharmacology', icon: BeakerIcon },
              { id: 'safety', label: 'Safety', icon: ShieldCheckIcon },
              { id: 'regulatory', label: 'Regulatory', icon: DocumentTextIcon },
              { id: 'physical', label: 'Physical', icon: EyeIcon },
              { id: 'analysis', label: 'AI Analysis', icon: ClockIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-medical-500 text-medical-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="pt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medicine Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {essentialInfo?.identification?.brandName && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                        <p className="text-gray-900">{essentialInfo.identification.brandName}</p>
                      </div>
                    )}
                    {essentialInfo?.identification?.genericName && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Generic Name</label>
                        <p className="text-gray-900">{essentialInfo.identification.genericName}</p>
                      </div>
                    )}
                    {essentialInfo?.identification?.strength && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Strength</label>
                        <p className="text-gray-900">{essentialInfo.identification.strength}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {essentialInfo?.identification?.dosageForm && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Dosage Form</label>
                        <p className="text-gray-900">{essentialInfo.identification.dosageForm}</p>
                      </div>
                    )}
                    {essentialInfo?.identification?.manufacturer && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                        <p className="text-gray-900">{essentialInfo.identification.manufacturer}</p>
                      </div>
                    )}
                    {readMoreInfo?.clinicalData?.indication && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Indication</label>
                        <p className="text-gray-900">{readMoreInfo.clinicalData.indication}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Usage Information */}
              {essentialInfo?.basicUsage && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Information</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    {essentialInfo.basicUsage.indication && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-blue-900">What it's used for</label>
                        <p className="text-blue-800">{essentialInfo.basicUsage.indication}</p>
                      </div>
                    )}
                    {readMoreInfo?.clinicalData?.dosageInstructions && (
                      <div>
                        <label className="block text-sm font-medium text-blue-900">Dosage Instructions</label>
                        <p className="text-blue-800">{readMoreInfo.clinicalData.dosageInstructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pharmacology' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pharmacological Information</h3>
                {readMoreInfo?.detailedPharmacology ? (
                  <div className="space-y-4">
                    {readMoreInfo.detailedPharmacology.mechanism && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">Mechanism of Action</h4>
                        <div className="text-green-800">{renderValue(readMoreInfo.detailedPharmacology.mechanism)}</div>
                      </div>
                    )}
                    {readMoreInfo.detailedPharmacology.pharmacokinetics && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Pharmacokinetics</h4>
                        <div className="text-blue-800">{renderValue(readMoreInfo.detailedPharmacology.pharmacokinetics)}</div>
                      </div>
                    )}
                    {readMoreInfo.detailedPharmacology.therapeuticClass && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-medium text-purple-900 mb-2">Therapeutic Class</h4>
                        <div className="text-purple-800">{renderValue(readMoreInfo.detailedPharmacology.therapeuticClass)}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600">Detailed pharmacological information not available from image analysis.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-6">
              {/* Warnings */}
              {readMoreInfo?.comprehensiveSafety?.allWarnings?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Warnings & Precautions</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {readMoreInfo.comprehensiveSafety.allWarnings.map((warning: string, index: number) => (
                        <li key={index} className="flex items-start text-red-800">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Side Effects */}
              {readMoreInfo?.comprehensiveSafety?.allSideEffects?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Side Effects</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {readMoreInfo.comprehensiveSafety.allSideEffects.map((effect: string, index: number) => (
                        <li key={index} className="text-yellow-800 text-sm">
                          • {effect}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Drug Interactions */}
              {readMoreInfo?.comprehensiveSafety?.drugInteractions?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Drug Interactions</h3>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <ul className="space-y-1">
                      {readMoreInfo.comprehensiveSafety.drugInteractions.map((interaction: string, index: number) => (
                        <li key={index} className="text-orange-800 text-sm">
                          • {interaction}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'regulatory' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Regulatory Information</h3>
                {readMoreInfo?.regulatoryInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(readMoreInfo.regulatoryInfo)
                      .filter(([, value]) => value)
                      .map(([key, value]) => (
                        <div key={key} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <p className="text-gray-900 text-sm">{String(value)}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600">Regulatory information not available from image analysis.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'physical' && (
            <div className="space-y-6">
              {/* Physical Characteristics */}
              {essentialInfo?.physicalInfo && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Characteristics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(essentialInfo.physicalInfo)
                      .filter(([, value]) => value)
                      .map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <p className="text-gray-900">{String(value)}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Extracted Text */}
              {essentialInfo?.extractedText?.allText?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Found on Medicine</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {essentialInfo.extractedText.allText.map((text: string, index: number) => (
                        <span key={index} className="bg-white px-2 py-1 rounded border text-sm font-mono">
                          {text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis Details</h3>

                {/* Multi-Image Analysis Info */}
                {analysis?.multiImageAnalysis && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-purple-900 mb-2">Multi-Image Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-700">Total Images</label>
                        <p className="text-purple-800">{analysis.multiImageAnalysis.totalImages}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-purple-700">Image Types</label>
                        <p className="text-purple-800">{analysis.multiImageAnalysis.imageLabels?.join(', ')}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-purple-700">Analysis Type</label>
                        <p className="text-purple-800 capitalize">{analysis.multiImageAnalysis.analysisType?.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Contributions */}
                {analysis?.imageContributions && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-green-900 mb-3">Information Sources by Image</h4>
                    <div className="space-y-3">
                      {Object.entries(analysis.imageContributions).map(([imageKey, contribution]: [string, any]) => (
                        <div key={imageKey} className="bg-white border border-green-200 rounded p-3">
                          <div className="flex items-center mb-2">
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded font-medium">
                              {imageKey.replace('image', 'Image ')}
                            </span>
                            <span className="ml-2 text-sm text-green-800 font-medium">
                              {contribution.label || 'Unknown'}
                            </span>
                          </div>
                          {contribution.contributedInfo && Array.isArray(contribution.contributedInfo) && (
                            <ul className="text-green-700 text-sm space-y-1">
                              {contribution.contributedInfo.map((info: string, index: number) => (
                                <li key={index}>• {info}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Quality */}
                {readMoreInfo?.dataQuality && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">Data Quality Assessment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700">Completeness</label>
                        <p className="text-blue-800">{readMoreInfo.dataQuality.completeness}%</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700">Accuracy</label>
                        <p className="text-blue-800">{readMoreInfo.dataQuality.accuracy}%</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700">Verification Level</label>
                        <p className="text-blue-800 capitalize">{readMoreInfo.dataQuality.verificationLevel}</p>
                      </div>
                    </div>

                    {/* Conflicting Information */}
                    {analysis?.dataQuality?.conflictingInfo?.length > 0 && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                        <h5 className="font-medium text-yellow-800 mb-1">Conflicting Information</h5>
                        <ul className="text-yellow-700 text-sm space-y-1">
                          {analysis.dataQuality.conflictingInfo.map((conflict: string, index: number) => (
                            <li key={index}>• {conflict}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Analysis Reasoning */}
                {analysis?.reasoning && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Analysis Reasoning</h4>
                    <p className="text-gray-700 text-sm">{analysis.reasoning}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900">Important Disclaimer</h4>
            <p className="text-blue-800 text-sm mt-1">
              {results.disclaimer || 'This information is for educational purposes only. Always consult with healthcare professionals before making any medical decisions.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveResults;
