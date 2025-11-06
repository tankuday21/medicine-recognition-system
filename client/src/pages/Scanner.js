import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraScanner from '../components/Scanner/CameraScanner';
import MedicineInfo from '../components/Medicine/MedicineInfo';
import MedicineSearch from '../components/Medicine/MedicineSearch';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  CameraIcon,
  QrCodeIcon,
  IdentificationIcon,
  DocumentTextIcon,
  ClockIcon,
  HeartIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Scanner = () => {
  const navigate = useNavigate();
  const [activeScanner, setActiveScanner] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const scanTypes = [
    {
      id: 'barcode',
      title: 'Barcode Scanner',
      description: 'Scan medicine barcodes for instant information',
      icon: IdentificationIcon,
      color: 'bg-blue-500',
      examples: ['EAN-13', 'UPC', 'Code 128']
    },
    {
      id: 'qr',
      title: 'QR Code Scanner',
      description: 'Scan QR codes on medicine packages',
      icon: QrCodeIcon,
      color: 'bg-green-500',
      examples: ['Medicine info', 'Dosage details', 'Manufacturer data']
    },
    {
      id: 'medicine',
      title: 'Medicine Identifier',
      description: 'Identify any medicine - pills, creams, syrups, etc.',
      icon: CameraIcon,
      color: 'bg-purple-500',
      examples: ['Pills & Tablets', 'Creams & Ointments', 'Syrups & Liquids']
    },
    {
      id: 'document',
      title: 'Document Scanner',
      description: 'Scan prescriptions and medical reports',
      icon: DocumentTextIcon,
      color: 'bg-orange-500',
      examples: ['Prescriptions', 'Lab reports', 'Medical documents']
    }
  ];

  const handleScanResult = async (result) => {
    setIsLoading(true);
    setError('');
    setActiveScanner(null); // Close scanner immediately
    
    try {
      console.log('Scan result:', result);
      
      // Process the scan result based on type
      if (result.type === 'barcode') {
        await processBarcodeResult(result);
        setScanResult(result);
      } else if (result.type === 'qr') {
        await processQRResult(result);
        setScanResult(result);
      } else if (result.type === 'medicine' || result.type === 'pill') {
        // For medicine, processMedicineResult will handle navigation
        await processMedicineResult(result);
      } else if (result.type === 'document') {
        await processDocumentResult(result);
        setScanResult(result);
      }
    } catch (error) {
      console.error('Scan processing error:', error);
      setError('Failed to process scan result');
    } finally {
      setIsLoading(false);
    }
  };

  const processBarcodeResult = async (result) => {
    try {
      console.log('Processing barcode with AI:', result.data);
      
      const response = await fetch('/api/scanner/barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify({ barcode: result.data })
      });

      const data = await response.json();
      console.log('Barcode API response:', data);
      
      if (data.success) {
        // Handle new AI-powered response format
        result.medicineInfo = data.data.medicineInfo || {
          found: data.data.found || false,
          ...data.data.medicine
        };
        result.confidence = data.data.confidence;
        
        // Navigate to results page
        navigate('/barcode-result', {
          state: { scanResult: result },
          replace: false
        });
      } else {
        throw new Error(data.message || 'Failed to process barcode');
      }
    } catch (error) {
      console.error('Barcode processing error:', error);
      result.medicineInfo = {
        found: false,
        error: error.message
      };
    }
  };

  const processQRResult = async (result) => {
    try {
      console.log('Processing QR code with AI:', result.data);
      
      const response = await fetch('/api/scanner/qr-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify({ qrData: result.data })
      });

      const data = await response.json();
      console.log('QR Code API response:', data);
      
      if (data.success) {
        result.qrData = data.data.parsedData;
        result.medicineInfo = data.data.medicineInfo || (data.data.medicine ? {
          found: true,
          ...data.data.medicine
        } : { found: false });
        result.confidence = data.data.confidence;
        
        // Navigate to results page
        navigate('/qr-result', {
          state: { scanResult: result },
          replace: false
        });
      } else {
        throw new Error(data.message || 'Failed to process QR code');
      }
    } catch (error) {
      console.error('QR processing error:', error);
      result.qrData = {
        rawData: result.data,
        parsed: false,
        error: error.message
      };
    }
  };

  const processMedicineResult = async (result) => {
    try {
      const imageDataArray = Array.isArray(result.imageData) ? result.imageData : [result.imageData];
      console.log('Processing medicine images with Gemini AI');
      console.log('Number of images:', imageDataArray.length);
      
      const formData = new FormData();
      
      // Convert all images to blobs and add to FormData
      for (let i = 0; i < imageDataArray.length; i++) {
        const response = await fetch(imageDataArray[i]);
        const blob = await response.blob();
        console.log(`Image ${i + 1} - Blob size:`, blob.size, 'type:', blob.type);
        formData.append('images', blob, `medicine-image-${i + 1}.jpg`);
      }

      console.log('Sending request to /api/scanner/medicine...');
      
      // Create a timeout promise (30 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - Gemini API is taking too long. Please try again.')), 30000);
      });
      
      // Send to backend for Gemini AI processing with timeout
      const fetchPromise = fetch('/api/scanner/medicine', {
        method: 'POST',
        headers: {
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: formData
      });
      
      // Race between fetch and timeout
      const apiResponse = await Promise.race([fetchPromise, timeoutPromise]);

      console.log('API Response status:', apiResponse.status);
      
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('API Error response:', errorText);
        throw new Error(`API request failed with status ${apiResponse.status}: ${errorText}`);
      }

      const data = await apiResponse.json();
      console.log('API Response data:', data);
      
      if (data.success && data.data) {
        result.pillInfo = data.data.pillInfo;
        result.confidence = data.data.confidence;
        result.medicineInfo = {
          found: data.data.pillInfo?.identified || false,
          medicineType: data.data.pillInfo?.medicineType,
          name: data.data.pillInfo?.medicineName?.primaryName,
          brandName: data.data.pillInfo?.medicineName?.brandName,
          genericName: data.data.pillInfo?.medicineName?.genericName,
          activeIngredients: data.data.pillInfo?.activeIngredients,
          uses: data.data.pillInfo?.commonUses,
          physicalCharacteristics: data.data.pillInfo?.physicalCharacteristics,
          dosageInformation: data.data.pillInfo?.dosageInformation,
          administrationRoute: data.data.pillInfo?.administrationRoute,
          storageInstructions: data.data.pillInfo?.storageInstructions,
          expiryInfo: data.data.pillInfo?.expiryInfo,
          manufacturerInfo: data.data.pillInfo?.manufacturerInfo,
          possibleMatches: data.data.pillInfo?.possibleMatches,
          safetyWarning: data.data.pillInfo?.safetyWarning,
          verificationNeeded: data.data.pillInfo?.verificationNeeded
        };
        
        console.log('Navigating to results page with:', result);
        
        // Navigate to results page immediately after successful processing
        navigate('/medicine-result', { 
          state: { scanResult: result },
          replace: false
        });
      } else {
        console.error('API returned unsuccessful response:', data);
        throw new Error(data.message || 'Failed to identify pill');
      }
    } catch (error) {
      console.error('Pill processing error:', error);
      console.error('Error stack:', error.stack);
      
      result.pillInfo = {
        identified: false,
        confidence: 0,
        error: error.message,
        possibleMatches: [],
        medicineName: {
          primaryName: 'Error processing image',
          brandName: null,
          genericName: null
        },
        physicalCharacteristics: {
          shape: 'Unable to determine',
          color: 'Unable to determine',
          imprint: 'Error occurred',
          size: 'N/A',
          coating: 'N/A',
          scoring: 'N/A'
        }
      };
      result.medicineInfo = {
        found: false,
        error: error.message,
        name: 'Error processing image',
        safetyWarning: 'An error occurred while processing the image. Please try again or consult a pharmacist.'
      };
      
      console.log('Navigating to results page with error state:', result);
      
      // Still navigate to results page even on error to show error state
      navigate('/medicine-result', { 
        state: { scanResult: result },
        replace: false
      });
    }
  };

  const processDocumentResult = async (result) => {
    try {
      console.log('Processing document with Gemini AI OCR');
      
      // Convert image data to blob
      const response = await fetch(result.imageData);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'document-image.jpg');

      // Send to backend for Gemini AI OCR
      const apiResponse = await fetch('/api/scanner/document', {
        method: 'POST',
        headers: {
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: formData
      });

      const data = await apiResponse.json();
      console.log('Document API response:', data);
      
      if (data.success) {
        result.documentInfo = data.data.documentInfo || {
          ocrProcessed: true,
          extractedText: data.data.extractedText || '',
          confidence: data.data.confidence || 0
        };
        
        // Navigate to results page
        navigate('/document-result', {
          state: { scanResult: result },
          replace: false
        });
      } else {
        throw new Error(data.message || 'Failed to process document');
      }
    } catch (error) {
      console.error('Document processing error:', error);
      result.documentInfo = {
        ocrProcessed: false,
        extractedText: '',
        confidence: 0,
        error: error.message
      };
    }
  };

  const handleScanError = (errorMessage) => {
    setError(errorMessage);
    setActiveScanner(null);
  };

  const startScanning = (scanType) => {
    setActiveScanner(scanType);
    setScanResult(null);
    setSelectedMedicine(null);
    setError('');
  };

  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine);
    setScanResult(null);
    setError('');
  };

  const closeScanner = () => {
    setActiveScanner(null);
  };

  const createReminder = () => {
    // TODO: Navigate to reminder creation with scan result
    console.log('Creating reminder for:', scanResult);
  };

  const viewMedicineDetails = () => {
    // TODO: Navigate to medicine details page
    console.log('Viewing details for:', scanResult);
  };

  return (
    <div className="py-4 sm:py-6">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Medicine Scanner</h1>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2">
          Scan barcodes, QR codes, pills, or documents to get instant medicine information
        </p>
        
        {/* Medicine Search */}
        <div className="max-w-md mx-auto px-2">
          <MedicineSearch
            onSelectMedicine={handleMedicineSelect}
            placeholder="Or search medicines by name..."
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm sm:text-base">
          {error}
        </div>
      )}

      {/* Loading State - Full Screen Modal */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Pill...</h3>
            <p className="text-gray-600 mb-4">
              Using AI to identify your pill. This may take 10-30 seconds.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p className="flex items-center justify-center gap-2"><CheckCircleIcon className="h-4 w-4 text-green-500" /> Image captured</p>
              <p className="flex items-center justify-center gap-2"><CheckCircleIcon className="h-4 w-4 text-green-500" /> Uploading to server</p>
              <p className="animate-pulse text-blue-600 font-medium flex items-center justify-center gap-2"><ClockIcon className="h-4 w-4" /> AI analyzing characteristics...</p>
              <p className="text-gray-400 flex items-center justify-center gap-2"><ClockIcon className="h-4 w-4" /> Identifying medicine</p>
            </div>
            <div className="mt-6 text-xs text-gray-400">
              Please wait, do not close this window
            </div>
          </div>
        </div>
      )}

      {/* Scan Result */}
      {scanResult && (
        <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
          {/* Scan Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Scan Result</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  scanTypes.find(t => t.id === scanResult.type)?.color || 'bg-gray-500'
                }`}>
                  <CameraIcon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base truncate">
                    {scanTypes.find(t => t.id === scanResult.type)?.title}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    Scanned at {scanResult.timestamp?.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Raw Data:</p>
                <p className="text-xs sm:text-sm text-gray-900 font-mono break-all">
                  {scanResult.data}
                </p>
              </div>

              {/* Pill Identification Results */}
              {scanResult.type === 'pill' && scanResult.pillInfo && (
                <div className="space-y-4">
                  {scanResult.pillInfo.identified ? (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-green-900 mb-2">
                            {scanResult.medicineInfo?.name || 'Pill Identified'}
                          </h3>
                          <p className="text-sm text-green-800 mb-2">
                            Confidence: {scanResult.confidence}%
                          </p>
                          
                          {scanResult.medicineInfo?.brandName && (
                            <p className="text-sm text-green-800">
                              <span className="font-medium">Brand Name:</span> {scanResult.medicineInfo.brandName}
                            </p>
                          )}
                          
                          {scanResult.medicineInfo?.genericName && (
                            <p className="text-sm text-green-800">
                              <span className="font-medium">Generic Name:</span> {scanResult.medicineInfo.genericName}
                            </p>
                          )}

                          {scanResult.medicineInfo?.physicalCharacteristics && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <p className="text-sm font-medium text-green-900 mb-2">Physical Characteristics:</p>
                              <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                                <div><span className="font-medium">Shape:</span> {scanResult.medicineInfo.physicalCharacteristics.shape}</div>
                                <div><span className="font-medium">Color:</span> {scanResult.medicineInfo.physicalCharacteristics.color}</div>
                                {scanResult.medicineInfo.physicalCharacteristics.imprint && (
                                  <div className="col-span-2"><span className="font-medium">Imprint:</span> {scanResult.medicineInfo.physicalCharacteristics.imprint}</div>
                                )}
                              </div>
                            </div>
                          )}

                          {scanResult.medicineInfo?.activeIngredients && scanResult.medicineInfo.activeIngredients.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <p className="text-sm font-medium text-green-900 mb-1">Active Ingredients:</p>
                              <p className="text-sm text-green-800">{scanResult.medicineInfo.activeIngredients.join(', ')}</p>
                            </div>
                          )}

                          {scanResult.medicineInfo?.uses && scanResult.medicineInfo.uses.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <p className="text-sm font-medium text-green-900 mb-1">Common Uses:</p>
                              <ul className="text-sm text-green-800 list-disc list-inside">
                                {scanResult.medicineInfo.uses.map((use, idx) => (
                                  <li key={idx}>{use}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {scanResult.medicineInfo?.verificationNeeded && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <p className="text-sm text-yellow-800 bg-yellow-50 p-2 rounded flex items-center gap-2">
                                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" /> Verification recommended: Please confirm with a pharmacist
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-yellow-800 font-medium mb-2">
                        Unable to identify pill with confidence
                      </p>
                      {scanResult.medicineInfo?.physicalCharacteristics && (
                        <div className="text-sm text-yellow-800 mt-2">
                          <p className="font-medium mb-1">Observed characteristics:</p>
                          <p>Shape: {scanResult.medicineInfo.physicalCharacteristics.shape}</p>
                          <p>Color: {scanResult.medicineInfo.physicalCharacteristics.color}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {scanResult.medicineInfo?.possibleMatches && scanResult.medicineInfo.possibleMatches.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-2">Possible Matches:</p>
                      <div className="space-y-2">
                        {scanResult.medicineInfo.possibleMatches.map((match, idx) => (
                          <div key={idx} className="text-sm text-blue-800 bg-white p-2 rounded">
                            <p className="font-medium">{match.name}</p>
                            {match.strength && <p className="text-xs">Strength: {match.strength}</p>}
                            {match.manufacturer && <p className="text-xs">Manufacturer: {match.manufacturer}</p>}
                            <p className="text-xs">Confidence: {match.matchConfidence}/10</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {scanResult.medicineInfo?.safetyWarning && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <p className="text-sm font-medium text-red-900 mb-1 flex items-center gap-2"><ExclamationTriangleIcon className="h-5 w-5" /> Safety Warning:</p>
                      <p className="text-sm text-red-800">{scanResult.medicineInfo.safetyWarning}</p>
                    </div>
                  )}

                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <strong>Important:</strong> This is an AI-assisted identification tool. Always verify pill identity with a licensed pharmacist or healthcare provider before taking any medication. Never take medication that you cannot positively identify.
                    </p>
                  </div>
                </div>
              )}

              {!scanResult.medicineInfo?.found && scanResult.type !== 'pill' && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-yellow-800">
                    {scanResult.medicineInfo?.error || 'Medicine not found in database'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Medicine Information */}
          {scanResult.medicineInfo?.found && (
            <MedicineInfo
              medicine={scanResult.medicineInfo}
              onCreateReminder={createReminder}
              showActions={true}
            />
          )}
        </div>
      )}

      {/* Selected Medicine from Search */}
      {selectedMedicine && !scanResult && (
        <div className="mb-8">
          <MedicineInfo
            medicine={selectedMedicine}
            onCreateReminder={createReminder}
            showActions={true}
          />
        </div>
      )}

      {/* Scanner Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {scanTypes.map((scanType) => (
          <div
            key={scanType.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer active:scale-95"
            onClick={() => startScanning(scanType.id)}
          >
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className={`${scanType.color} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                <scanType.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  {scanType.title}
                </h3>
                <p className="text-gray-600 mb-2 sm:mb-3 text-sm sm:text-base">
                  {scanType.description}
                </p>
                
                <div className="space-y-1 hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">Supports:</p>
                  <div className="flex flex-wrap gap-1">
                    {scanType.examples.map((example, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
              <button className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base font-medium touch-target">
                Start Scanning
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="mt-6 sm:mt-8 bg-blue-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3">Scanning Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">For Best Results:</h4>
            <ul className="space-y-1">
              <li>• Ensure good lighting</li>
              <li>• Hold camera steady</li>
              <li>• Clean the lens</li>
              <li>• Get close to the target</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Supported Formats:</h4>
            <ul className="space-y-1">
              <li>• EAN-13, UPC barcodes</li>
              <li>• QR codes and Data Matrix</li>
              <li>• High-resolution images</li>
              <li>• PDF documents</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Camera Scanner Modal */}
      {activeScanner && (
        <CameraScanner
          scanType={activeScanner}
          onScanResult={handleScanResult}
          onError={handleScanError}
          onClose={closeScanner}
        />
      )}
    </div>
  );
};

export default Scanner;