import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

const BarcodeResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { scanResult } = location.state || {};

  if (!scanResult) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No scan result found</p>
          <button
            onClick={() => navigate('/scanner')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Scanner
          </button>
        </div>
      </div>
    );
  }

  const { medicineInfo, confidence, data: barcodeData } = scanResult;
  const identified = medicineInfo?.identified || medicineInfo?.found || false;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/scanner')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Barcode Scan Result
              </h1>
              <p className="text-sm text-gray-600">AI-Powered Analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Barcode Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Scanned Barcode</h2>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Barcode Number</p>
            <p className="text-2xl font-mono font-bold text-gray-900">{barcodeData}</p>
          </div>
        </div>

        {/* Identification Status */}
        <div className={`rounded-lg shadow-sm border p-6 ${
          identified 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {identified ? (
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
              )}
            </div>
            <div className="flex-1">
              <h2 className={`text-2xl font-bold mb-2 ${
                identified ? 'text-green-900' : 'text-yellow-900'
              }`}>
                {identified ? 'Medicine Identified from Barcode' : 'Barcode Processed'}
              </h2>
              <div className="flex items-center space-x-4 mb-3">
                <div>
                  <p className={`text-sm font-medium ${
                    identified ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    Confidence Score
                  </p>
                  <p className={`text-3xl font-bold ${
                    identified ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    {confidence}%
                  </p>
                </div>
              </div>
              {medicineInfo?.verificationNeeded && (
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mt-3">
                  <p className="text-sm text-yellow-900 font-medium flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" /> Verification Recommended: Please confirm this identification with a licensed pharmacist before use.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medicine Information */}
        {medicineInfo && Object.keys(medicineInfo).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <InformationCircleIcon className="h-6 w-6 mr-2 text-blue-600" />
              Medicine Information from Barcode
            </h2>
            <div className="space-y-3">
              {medicineInfo.medicineName && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Medicine Name</p>
                  <p className="text-lg font-bold text-gray-900">
                    {medicineInfo.medicineName.primaryName || medicineInfo.medicineName.brandName || 'Unknown'}
                  </p>
                </div>
              )}
              {medicineInfo.barcodeInfo && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {medicineInfo.barcodeInfo.type && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 font-medium">Barcode Type</p>
                      <p className="text-base text-gray-900">{medicineInfo.barcodeInfo.type}</p>
                    </div>
                  )}
                  {medicineInfo.barcodeInfo.country && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 font-medium">Country</p>
                      <p className="text-base text-gray-900">{medicineInfo.barcodeInfo.country}</p>
                    </div>
                  )}
                  {medicineInfo.barcodeInfo.manufacturer && (
                    <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                      <p className="text-sm text-gray-600 font-medium">Manufacturer</p>
                      <p className="text-base text-gray-900">{medicineInfo.barcodeInfo.manufacturer}</p>
                    </div>
                  )}
                </div>
              )}
              {medicineInfo.possibleMatches && medicineInfo.possibleMatches.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 font-medium mb-2">Possible Matches</p>
                  <ul className="space-y-1">
                    {medicineInfo.possibleMatches.map((match, idx) => (
                      <li key={idx} className="text-gray-900 bg-blue-50 p-2 rounded">• {match}</li>
                    ))}
                  </ul>
                </div>
              )}
              {medicineInfo.reasoning && (
                <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium mb-1">Analysis</p>
                  <p className="text-sm text-gray-700">{medicineInfo.reasoning}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Information Found */}
        {(!medicineInfo || Object.keys(medicineInfo).length === 0 || !identified) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Limited Information</h3>
            <p className="text-yellow-800 mb-4">
              The AI could not extract detailed medicine information from this barcode number.
              This could be because:
            </p>
            <ul className="list-disc list-inside text-yellow-800 space-y-1 mb-4">
              <li>The barcode is not in a recognized medicine database</li>
              <li>The barcode format is not standard for medicines</li>
              <li>Additional information is needed for identification</li>
            </ul>
            <p className="text-yellow-800 font-medium">
              Try scanning the medicine packaging directly using the Medicine Identifier for better results.
            </p>
          </div>
        )}

        {/* Raw Data for Debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
            <p className="text-sm font-mono text-gray-700">
              <strong>Debug Info:</strong><br/>
              {JSON.stringify(medicineInfo, null, 2)}
            </p>
          </div>
        )}

        {/* Medicine Name (old structure - keep for compatibility) */}
        {medicineInfo?.name && false && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <InformationCircleIcon className="h-6 w-6 mr-2 text-blue-600" />
              Medicine Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 font-medium">Primary Name</p>
                <p className="text-2xl font-bold text-gray-900">{medicineInfo.name}</p>
              </div>
              {medicineInfo.brandName && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Brand Name</p>
                  <p className="text-lg text-gray-900">{medicineInfo.brandName}</p>
                </div>
              )}
              {medicineInfo.genericName && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Generic Name</p>
                  <p className="text-lg text-gray-900">{medicineInfo.genericName}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Physical Characteristics */}
        {medicineInfo?.physicalCharacteristics && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Physical Characteristics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium mb-1">Shape</p>
                <p className="text-base text-gray-900">{medicineInfo.physicalCharacteristics.shape}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium mb-1">Color</p>
                <p className="text-base text-gray-900">{medicineInfo.physicalCharacteristics.color}</p>
              </div>
              {medicineInfo.physicalCharacteristics.size && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-medium mb-1">Size</p>
                  <p className="text-base text-gray-900">{medicineInfo.physicalCharacteristics.size}</p>
                </div>
              )}
              {medicineInfo.physicalCharacteristics.coating && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-medium mb-1">Coating</p>
                  <p className="text-base text-gray-900">{medicineInfo.physicalCharacteristics.coating}</p>
                </div>
              )}
              {medicineInfo.physicalCharacteristics.imprint && (
                <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
                  <p className="text-sm text-gray-600 font-medium mb-1">Imprint / Markings</p>
                  <p className="text-base text-gray-900 font-mono">{medicineInfo.physicalCharacteristics.imprint}</p>
                </div>
              )}
              {medicineInfo.physicalCharacteristics.scoring && (
                <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
                  <p className="text-sm text-gray-600 font-medium mb-1">Scoring</p>
                  <p className="text-base text-gray-900">{medicineInfo.physicalCharacteristics.scoring}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Ingredients */}
        {medicineInfo?.activeIngredients && medicineInfo.activeIngredients.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Ingredients</h2>
            <div className="space-y-2">
              {medicineInfo.activeIngredients.map((ingredient, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-blue-50 rounded-lg p-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                  <p className="text-gray-900">{ingredient}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Uses */}
        {medicineInfo?.uses && medicineInfo.uses.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Common Uses</h2>
            <ul className="space-y-2">
              {medicineInfo.uses.map((use, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-900">{use}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dosage Information */}
        {medicineInfo?.dosageInformation && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dosage Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {medicineInfo.dosageInformation.strength && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-medium mb-1">Strength</p>
                  <p className="text-lg font-semibold text-gray-900">{medicineInfo.dosageInformation.strength}</p>
                </div>
              )}
              {medicineInfo.dosageInformation.form && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-medium mb-1">Form</p>
                  <p className="text-lg font-semibold text-gray-900">{medicineInfo.dosageInformation.form}</p>
                </div>
              )}
              {medicineInfo.dosageInformation.quantity && (
                <div className="bg-blue-50 rounded-lg p-4 sm:col-span-2">
                  <p className="text-sm text-gray-600 font-medium mb-1">Quantity</p>
                  <p className="text-lg font-semibold text-gray-900">{medicineInfo.dosageInformation.quantity}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Administration & Storage */}
        {(medicineInfo?.administrationRoute || medicineInfo?.storageInstructions) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage & Storage</h2>
            <div className="space-y-4">
              {medicineInfo.administrationRoute && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Administration Route</p>
                  <p className="text-base text-gray-900 capitalize">{medicineInfo.administrationRoute}</p>
                </div>
              )}
              {medicineInfo.storageInstructions && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Storage Instructions</p>
                  <p className="text-base text-gray-900">{medicineInfo.storageInstructions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manufacturer & Expiry */}
        {(medicineInfo?.manufacturerInfo || medicineInfo?.expiryInfo) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
            <div className="space-y-4">
              {medicineInfo.manufacturerInfo && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Manufacturer</p>
                  <p className="text-base text-gray-900">{medicineInfo.manufacturerInfo}</p>
                </div>
              )}
              {medicineInfo.expiryInfo && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Expiry Information</p>
                  <p className="text-base text-gray-900">{medicineInfo.expiryInfo}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Possible Matches */}
        {medicineInfo?.possibleMatches && medicineInfo.possibleMatches.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Possible Alternative Matches</h2>
            <div className="space-y-3">
              {medicineInfo.possibleMatches.map((match, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-gray-900">{match.name}</p>
                    <span className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                      {match.matchConfidence}/10
                    </span>
                  </div>
                  {match.strength && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Strength:</span> {match.strength}
                    </p>
                  )}
                  {match.manufacturer && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Manufacturer:</span> {match.manufacturer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety Warning */}
        {medicineInfo?.safetyWarning && (
          <div className="bg-red-50 border border-red-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
              <ShieldExclamationIcon className="h-6 w-6 mr-2" />
              Safety Warning
            </h2>
            <p className="text-red-800">{medicineInfo.safetyWarning}</p>
          </div>
        )}

        {/* Important Disclaimer */}
        <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6">
          <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"><ExclamationTriangleIcon className="h-5 w-5" /> Important Safety Information</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• This is an AI-assisted identification tool and may not be 100% accurate</p>
            <p>• <strong>Always verify</strong> pill identity with a licensed pharmacist or healthcare provider</p>
            <p>• <strong>Never take medication</strong> that you cannot positively identify</p>
            <p>• Consult your doctor or pharmacist before taking any medication</p>
            <p>• If you have any doubts, seek professional medical advice immediately</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/scanner')}
            className="w-full py-4 px-6 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-lg"
          >
            Scan Another Pill
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 px-6 bg-white border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeResult;
