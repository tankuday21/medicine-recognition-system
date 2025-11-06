import React, { useState } from 'react';
import { MedicineAnalysisResult } from '../types/medicine';

interface MedicineResultsProps {
  results: MedicineAnalysisResult;
  onReset: () => void;
}

const MedicineResults: React.FC<MedicineResultsProps> = ({ results, onReset }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'prescribing' | 'safety' | 'pharmacology' | 'manufacturing' | 'regulatory' | 'alternatives' | 'analysis'>('overview');

  const { analysis, medicineInfo } = results;
  const { comprehensiveInfo, dataQuality } = medicineInfo;

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

  const formatWarnings = (warnings: string[] | string | undefined) => {
    if (!warnings) return [];
    if (typeof warnings === 'string') return [warnings];
    return warnings;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'prescribing', label: 'Prescribing', icon: '💊' },
    { id: 'safety', label: 'Safety', icon: '⚠️' },
    { id: 'pharmacology', label: 'Pharmacology', icon: '🧬' },
    { id: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
    { id: 'regulatory', label: 'Regulatory', icon: '🏛️' },
    { id: 'alternatives', label: 'Alternatives', icon: '🔄' },
    { id: 'analysis', label: 'AI Analysis', icon: '🤖' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Confidence Score */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {comprehensiveInfo?.identification?.primaryBrandName ||
                 comprehensiveInfo?.identification?.primaryGenericName ||
                 'Medicine Identified'}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(analysis.confidence)}`}>
                {getConfidenceText(analysis.confidence)} ({analysis.confidence}/10)
              </span>
            </div>

            {comprehensiveInfo?.identification?.primaryGenericName && comprehensiveInfo?.identification?.primaryBrandName && (
              <p className="text-gray-600 mb-2">
                Generic: {comprehensiveInfo.identification.primaryGenericName}
              </p>
            )}

            <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-4">
              {comprehensiveInfo?.identification?.strength && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {comprehensiveInfo.identification.strength}
                </span>
              )}
              {comprehensiveInfo?.identification?.dosageForm && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {comprehensiveInfo.identification.dosageForm}
                </span>
              )}
              {comprehensiveInfo?.identification?.manufacturer && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {comprehensiveInfo.identification.manufacturer}
                </span>
              )}
            </div>

            {/* Data Quality Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="font-medium text-blue-900">Data Completeness</div>
                <div className="text-2xl font-bold text-blue-600">{dataQuality?.completeness || 0}%</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="font-medium text-green-900">Accuracy Score</div>
                <div className="text-2xl font-bold text-green-600">{dataQuality?.accuracy || 0}%</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="font-medium text-purple-900">Data Sources</div>
                <div className="text-2xl font-bold text-purple-600">{medicineInfo.sources?.length || 0}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="font-medium text-orange-900">Data Points</div>
                <div className="text-2xl font-bold text-orange-600">{dataQuality?.dataPoints || 0}</div>
              </div>
            </div>
          </div>
          
          <button
            onClick={onReset}
            className="btn-secondary"
          >
            Analyze New Image
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${activeTab === tab.id
                    ? 'border-medical-500 text-medical-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                      <p className="text-gray-900">{comprehensiveInfo?.identification?.primaryBrandName || 'Not identified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Generic Name</label>
                      <p className="text-gray-900">{comprehensiveInfo?.identification?.primaryGenericName || 'Not identified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Active Ingredients</label>
                      <p className="text-gray-900">
                        {comprehensiveInfo?.identification?.activeIngredients?.join(', ') || 'Not identified'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Strength</label>
                      <p className="text-gray-900">{comprehensiveInfo?.identification?.strength || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dosage Form</label>
                      <p className="text-gray-900">{comprehensiveInfo?.identification?.dosageForm || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                      <p className="text-gray-900">{comprehensiveInfo?.identification?.manufacturer || 'Not identified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uses */}
              {comprehensiveInfo?.prescribingInfo?.indications && comprehensiveInfo.prescribingInfo.indications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Uses & Indications</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <ul className="text-blue-900 space-y-1">
                      {comprehensiveInfo.prescribingInfo.indications.map((indication, index) => (
                        <li key={index}>• {indication}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Dosage Instructions */}
              {comprehensiveInfo?.prescribingInfo?.dosageAndAdministration && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Dosage Instructions</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    {comprehensiveInfo.prescribingInfo.dosageAndAdministration.general && (
                      <p className="text-green-900 mb-2">{comprehensiveInfo.prescribingInfo.dosageAndAdministration.general}</p>
                    )}
                    {comprehensiveInfo.prescribingInfo.dosageAndAdministration.simplified && (
                      <p className="text-green-900">{comprehensiveInfo.prescribingInfo.dosageAndAdministration.simplified}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prescribing' && (
            <div className="space-y-6">
              {/* Physical Characteristics */}
              {analysis.physicalCharacteristics && Object.keys(analysis.physicalCharacteristics).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Characteristics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(analysis.physicalCharacteristics).map(([key, value]) => (
                      value && (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <p className="text-gray-900">{value}</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* NDC and Codes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Identification Codes</h3>
                <div className="space-y-3">
                  {comprehensiveInfo?.identification?.ndc && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">NDC (National Drug Code)</label>
                      <p className="text-gray-900 font-mono">{comprehensiveInfo.identification.ndc}</p>
                    </div>
                  )}
                  {analysis.manufacturingInfo?.lotNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Lot Number</label>
                      <p className="text-gray-900 font-mono">{analysis.manufacturingInfo.lotNumber}</p>
                    </div>
                  )}
                  {analysis.manufacturingInfo?.expirationDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                      <p className="text-gray-900">{analysis.manufacturingInfo.expirationDate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Extracted Text */}
              {analysis.extractedText?.allText && analysis.extractedText.allText.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Found on Medicine</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {analysis.extractedText.allText.map((text: string, index: number) => (
                        <span key={index} className="bg-white px-2 py-1 rounded border text-sm font-mono">
                          {text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Storage Instructions */}
              {comprehensiveInfo?.manufacturingInfo?.storageConditions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Storage Instructions</h3>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-purple-900">{comprehensiveInfo.manufacturingInfo.storageConditions}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-6">
              {/* Side Effects */}
              {comprehensiveInfo?.safetyProfile?.adverseReactions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Adverse Reactions</h3>
                  <div className="space-y-4">
                    {comprehensiveInfo.safetyProfile.adverseReactions.common.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="font-medium text-orange-900 mb-2">Common (&gt;1%)</h4>
                        <ul className="text-orange-800 space-y-1">
                          {comprehensiveInfo.safetyProfile.adverseReactions.common.map((reaction, index) => (
                            <li key={index}>• {reaction}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {comprehensiveInfo.safetyProfile.adverseReactions.serious.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 mb-2">Serious (0.1-1%)</h4>
                        <ul className="text-red-800 space-y-1">
                          {comprehensiveInfo.safetyProfile.adverseReactions.serious.map((reaction, index) => (
                            <li key={index}>• {reaction}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {comprehensiveInfo.safetyProfile.adverseReactions.rare.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Rare (&lt;0.1%)</h4>
                        <ul className="text-gray-800 space-y-1">
                          {comprehensiveInfo.safetyProfile.adverseReactions.rare.map((reaction, index) => (
                            <li key={index}>• {reaction}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {comprehensiveInfo?.safetyProfile?.warningsAndPrecautions && comprehensiveInfo.safetyProfile.warningsAndPrecautions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Warnings & Precautions</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {comprehensiveInfo.safetyProfile.warningsAndPrecautions.map((warning, index) => (
                        <li key={index} className="flex items-start text-red-900">
                          <svg className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Contraindications */}
              {comprehensiveInfo?.safetyProfile?.contraindications && comprehensiveInfo.safetyProfile.contraindications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contraindications</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <ul className="text-red-900 space-y-1">
                      {comprehensiveInfo.safetyProfile.contraindications.map((contraindication, index) => (
                        <li key={index}>• {contraindication}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Drug Interactions */}
              {comprehensiveInfo?.safetyProfile?.drugInteractions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Drug Interactions</h3>
                  <div className="space-y-4">
                    {comprehensiveInfo.safetyProfile.drugInteractions.major.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 mb-2">Major Interactions</h4>
                        <ul className="text-red-800 space-y-1">
                          {comprehensiveInfo.safetyProfile.drugInteractions.major.map((interaction, index) => (
                            <li key={index}>• {interaction}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {comprehensiveInfo.safetyProfile.drugInteractions.moderate.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-900 mb-2">Moderate Interactions</h4>
                        <ul className="text-yellow-800 space-y-1">
                          {comprehensiveInfo.safetyProfile.drugInteractions.moderate.map((interaction, index) => (
                            <li key={index}>• {interaction}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {comprehensiveInfo.safetyProfile.drugInteractions.minor.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Minor Interactions</h4>
                        <ul className="text-blue-800 space-y-1">
                          {comprehensiveInfo.safetyProfile.drugInteractions.minor.map((interaction, index) => (
                            <li key={index}>• {interaction}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Analysis Warnings */}
              {analysis.analysisWarnings && analysis.analysisWarnings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Analysis Warnings</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {analysis.analysisWarnings.map((warning, index) => (
                        <li key={index} className="flex items-start text-gray-700">
                          <svg className="w-4 h-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Safety Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Important Safety Information</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      This information is for educational purposes only. Always consult with healthcare
                      professionals before making any medical decisions. Never take medicine that you
                      cannot positively identify.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pharmacology' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Pharmacology Information</h3>
                <p className="text-blue-800">
                  Detailed pharmacology information will be displayed here when available from integrated databases.
                  This includes mechanism of action, pharmacokinetics, and pharmacodynamics.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'manufacturing' && (
            <div className="space-y-6">
              {/* Manufacturing Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Manufacturing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                      <p className="text-gray-900">{comprehensiveInfo?.manufacturingInfo?.manufacturer || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Lot Number</label>
                      <p className="text-gray-900 font-mono">{comprehensiveInfo?.manufacturingInfo?.lotNumber || 'Not visible'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                      <p className="text-gray-900">{comprehensiveInfo?.manufacturingInfo?.expirationDate || 'Not visible'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">NDC Number</label>
                      <p className="text-gray-900 font-mono">{comprehensiveInfo?.manufacturingInfo?.ndc || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Storage Conditions</label>
                      <p className="text-gray-900">{comprehensiveInfo?.manufacturingInfo?.storageConditions || 'Store as directed'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Shelf Life</label>
                      <p className="text-gray-900">{comprehensiveInfo?.manufacturingInfo?.shelfLife || 'See expiration date'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'regulatory' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Regulatory Information</h3>
                <p className="text-purple-800">
                  FDA approval status, controlled substance classification, and other regulatory details
                  will be displayed here when available from official sources.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'alternatives' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Alternative Medications</h3>
                <p className="text-green-800">
                  Generic equivalents, therapeutic alternatives, and pricing information
                  will be displayed here when available from integrated databases.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* AI Confidence and Reasoning */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700">Identification Status</label>
                      <p className={`text-lg font-semibold ${analysis.identified ? 'text-green-600' : 'text-red-600'}`}>
                        {analysis.identified ? 'Identified' : 'Not Identified'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700">Confidence Score</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {analysis.confidence}/10
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700">Data Sources</label>
                      <p className="text-sm text-gray-600">
                        {medicineInfo.sources.join(', ')}
                      </p>
                    </div>
                  </div>

                  {analysis.reasoning && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">AI Reasoning</label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-900">{analysis.reasoning}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Alternative Possibilities */}
              {analysis.alternatives && analysis.alternatives.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Alternative Possibilities</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {analysis.alternatives.map((alternative, index) => (
                        <li key={index} className="flex items-start text-gray-700">
                          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded mr-2 mt-0.5">
                            {index + 1}
                          </span>
                          {alternative}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Details</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block font-medium text-gray-700">Analysis Timestamp</label>
                      <p className="text-gray-600">{new Date(results.timestamp).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700">Last Updated</label>
                      <p className="text-gray-600">{new Date(medicineInfo.lastUpdated).toLocaleString()}</p>
                    </div>
                    {medicineInfo.sources && medicineInfo.sources.length > 0 && (
                      <div>
                        <label className="block font-medium text-gray-700">Primary Data Source</label>
                        <p className="text-gray-600">{medicineInfo.sources[0]}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">About This Analysis</h4>
                <p className="text-sm text-blue-800">
                  This analysis was performed using advanced AI computer vision technology.
                  The system analyzes visual features, text, and markings to identify medicines
                  and cross-references multiple medical databases. While highly accurate,
                  this tool should be used as a reference only and not as a substitute for
                  professional medical advice.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => window.print()}
            className="btn-secondary flex-1"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Results
          </button>

          <button
            onClick={() => {
              const data = JSON.stringify(results, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `medicine-analysis-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="btn-secondary flex-1"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Data
          </button>

          <button
            onClick={onReset}
            className="btn-primary flex-1"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Analyze Another Medicine
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicineResults;
