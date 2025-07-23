import React, { useState } from 'react';
import { 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import LoadingAnimation from './LoadingAnimation';

interface EssentialInfoData {
  identification: {
    verifiedName: string;
    brandName?: string;
    genericName?: string;
    strength?: string;
    dosageForm?: string;
    manufacturer?: string;
  };
  basicUsage: {
    indication?: string;
    dosageInstructions?: string;
    route?: string;
  };
  safetyHighlights: {
    keyWarnings: string[];
    commonSideEffects: string[];
    storageInstructions?: string;
  };
  physicalInfo: {
    shape?: string;
    color?: string;
    markings?: string;
    packaging?: string;
  };
  extractedText: {
    allText: string[];
    drugNames: string[];
  };
  manufacturingInfo: {
    lotNumber?: string;
    expirationDate?: string;
  };
}

interface EssentialMedicineInfoProps {
  essentialData: EssentialInfoData;
  onReadMore: () => void;
  isLoadingReadMore?: boolean;
  onReset: () => void;
}

const EssentialMedicineInfo: React.FC<EssentialMedicineInfoProps> = ({
  essentialData,
  onReadMore,
  isLoadingReadMore = false,
  onReset
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'usage' | 'safety' | 'physical'>('overview');

  if (isLoadingReadMore) {
    return <LoadingAnimation message="Loading comprehensive medicine information..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {essentialData.identification.verifiedName}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                ✓ Verified
              </span>
              <span>Essential Information</span>
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
              { id: 'usage', label: 'Usage', icon: DocumentTextIcon },
              { id: 'safety', label: 'Safety', icon: ExclamationTriangleIcon },
              { id: 'physical', label: 'Physical', icon: EyeIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSection === tab.id
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
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {essentialData.identification.brandName && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                        <p className="text-gray-900">{essentialData.identification.brandName}</p>
                      </div>
                    )}
                    {essentialData.identification.genericName && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Generic Name</label>
                        <p className="text-gray-900">{essentialData.identification.genericName}</p>
                      </div>
                    )}
                    {essentialData.identification.strength && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Strength</label>
                        <p className="text-gray-900">{essentialData.identification.strength}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {essentialData.identification.dosageForm && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Dosage Form</label>
                        <p className="text-gray-900">{essentialData.identification.dosageForm}</p>
                      </div>
                    )}
                    {essentialData.identification.manufacturer && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                        <p className="text-gray-900">{essentialData.identification.manufacturer}</p>
                      </div>
                    )}
                    {essentialData.basicUsage.route && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Route</label>
                        <p className="text-gray-900">{essentialData.basicUsage.route}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Manufacturing Info */}
              {(essentialData.manufacturingInfo.expirationDate || essentialData.manufacturingInfo.lotNumber) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Manufacturing Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {essentialData.manufacturingInfo.expirationDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                        <p className="text-gray-900 flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2 text-orange-500" />
                          {essentialData.manufacturingInfo.expirationDate}
                        </p>
                      </div>
                    )}
                    {essentialData.manufacturingInfo.lotNumber && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Lot Number</label>
                        <p className="text-gray-900">{essentialData.manufacturingInfo.lotNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'usage' && (
            <div className="space-y-6">
              {essentialData.basicUsage.indication && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What it's used for</h3>
                  <p className="text-gray-700">{essentialData.basicUsage.indication}</p>
                </div>
              )}
              
              {essentialData.basicUsage.dosageInstructions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Dosage Instructions</h3>
                  <p className="text-gray-700">{essentialData.basicUsage.dosageInstructions}</p>
                </div>
              )}

              {essentialData.safetyHighlights.storageInstructions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Storage Instructions</h3>
                  <p className="text-gray-700">{essentialData.safetyHighlights.storageInstructions}</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'safety' && (
            <div className="space-y-6">
              {essentialData.safetyHighlights.keyWarnings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Warnings</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {essentialData.safetyHighlights.keyWarnings.map((warning, index) => (
                        <li key={index} className="flex items-start text-red-800">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {essentialData.safetyHighlights.commonSideEffects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Side Effects</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {essentialData.safetyHighlights.commonSideEffects.map((effect, index) => (
                        <li key={index} className="text-yellow-800 text-sm">
                          • {effect}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'physical' && (
            <div className="space-y-6">
              {/* Physical Characteristics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Characteristics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(essentialData.physicalInfo).map(([key, value]) => 
                    value && (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <p className="text-gray-900">{value}</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Extracted Text */}
              {essentialData.extractedText.allText.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Found on Medicine</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {essentialData.extractedText.allText.map((text, index) => (
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
        </div>
      </div>

      {/* Read More Button */}
      <div className="card">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Want More Detailed Information?
          </h3>
          <p className="text-gray-600 mb-4">
            Get comprehensive details including pharmacology, drug interactions, clinical data, and more.
          </p>
          <button
            onClick={onReadMore}
            className="inline-flex items-center px-6 py-3 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Read More Details
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900">Important Disclaimer</h4>
            <p className="text-blue-800 text-sm mt-1">
              This information is for educational purposes only. Always consult with healthcare
              professionals before making any medical decisions. Never take medicine that you
              cannot positively identify.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EssentialMedicineInfo;
