import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { BarcodeFormat, DecodeHintType, BrowserMultiFormatReader } from '@zxing/library';
import PropTypes from 'prop-types';
import {
  CameraIcon,
  XMarkIcon,
  ArrowPathIcon,
  PhotoIcon,
  QrCodeIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const CameraScanner = ({ scanType, onScanResult, onError, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [capturedImages, setCapturedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const webcamRef = useRef(null);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const maxImages = 4;

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: facingMode
  };

  // Initialize scanner based on type
  useEffect(() => {
    if (scanType === 'qr' && !scannerRef.current) {
      initializeQRScanner();
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [scanType]);

  const initializeQRScanner = () => {
    try {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2
        },
        false
      );

      scanner.render(
        (decodedText, decodedResult) => {
          console.log('QR Code detected:', decodedText);
          handleScanSuccess({
            type: 'qr',
            data: decodedText,
            confidence: 100,
            timestamp: new Date()
          });
          scanner.clear();
        },
        (error) => {
          // Ignore frequent scanning errors
          if (!error.includes('NotFoundException')) {
            console.warn('QR scan error:', error);
          }
        }
      );

      scannerRef.current = scanner;
    } catch (error) {
      console.error('Failed to initialize QR scanner:', error);
      onError('Failed to initialize QR code scanner');
    }
  };

  const handleScanSuccess = useCallback((result) => {
    setIsScanning(false);
    onScanResult(result);
  }, [onScanResult]);

  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) return;
    if (capturedImages.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImages(prev => [...prev, imageSrc]);
    }
  }, [capturedImages, maxImages]);

  const processImage = async (imageData) => {
    setIsProcessing(true);
    
    try {
      if (scanType === 'barcode') {
        await processBarcodeImage(imageData);
      } else if (scanType === 'medicine' || scanType === 'pill') {
        await processMedicineImage(imageData);
      } else if (scanType === 'document') {
        await processDocumentImage(imageData);
      }
    } catch (error) {
      console.error('Image processing error:', error);
      onError('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const processBarcodeImage = async (imageData) => {
    try {
      const codeReader = new BrowserMultiFormatReader();
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E
      ]);

      // Convert data URL to image element
      const img = new Image();
      img.onload = async () => {
        try {
          const result = await codeReader.decodeFromImageElement(img, hints);
          handleScanSuccess({
            type: 'barcode',
            data: result.getText(),
            format: result.getBarcodeFormat(),
            confidence: 95,
            timestamp: new Date()
          });
        } catch (error) {
          console.error('Barcode decode error:', error);
          onError('No barcode detected in image');
        }
      };
      img.src = imageData;
    } catch (error) {
      console.error('Barcode processing error:', error);
      onError('Failed to process barcode');
    }
  };

  const processMedicineImage = async (imageDataArray) => {
    try {
      console.log('Processing medicine images with Gemini AI...', imageDataArray.length, 'images');
      
      // Send image data array - the Scanner component will handle the API call
      handleScanSuccess({
        type: 'medicine',
        data: 'Processing medicine identification...',
        confidence: 0,
        timestamp: new Date(),
        imageData: Array.isArray(imageDataArray) ? imageDataArray : [imageDataArray],
        imageCount: Array.isArray(imageDataArray) ? imageDataArray.length : 1
      });
    } catch (error) {
      console.error('Medicine processing error:', error);
      onError('Failed to process medicine images');
    }
  };

  const processDocumentImage = async (imageData) => {
    // For document scanning, we'll also send to backend for OCR processing
    try {
      handleScanSuccess({
        type: 'document',
        data: 'Document OCR - Backend processing required',
        confidence: 0,
        timestamp: new Date(),
        imageData: imageData
      });
    } catch (error) {
      console.error('Document processing error:', error);
      onError('Failed to process document');
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const remainingSlots = maxImages - capturedImages.length;
    
    if (files.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`);
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setCapturedImages(prev => [...prev, imageData]);
      };
      reader.readAsDataURL(file);
    });
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const removeImage = (index) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setCapturedImages([]);
    setIsProcessing(false);
  };

  const processAllImages = async () => {
    if (capturedImages.length === 0) return;
    setIsProcessing(true);
    
    try {
      if (scanType === 'barcode') {
        await processBarcodeImage(capturedImages[0]);
      } else if (scanType === 'medicine' || scanType === 'pill') {
        await processMedicineImage(capturedImages);
      } else if (scanType === 'document') {
        await processDocumentImage(capturedImages[0]);
      }
    } catch (error) {
      console.error('Image processing error:', error);
      onError('Failed to process images');
    } finally {
      setIsProcessing(false);
    }
  };

  const getScanTypeIcon = () => {
    switch (scanType) {
      case 'qr':
        return <QrCodeIcon className="h-6 w-6" />;
      case 'barcode':
        return <IdentificationIcon className="h-6 w-6" />;
      case 'pill':
        return <PhotoIcon className="h-6 w-6" />;
      case 'document':
        return <PhotoIcon className="h-6 w-6" />;
      default:
        return <CameraIcon className="h-6 w-6" />;
    }
  };

  const getScanTypeTitle = () => {
    switch (scanType) {
      case 'qr':
        return 'QR Code Scanner';
      case 'barcode':
        return 'Barcode Scanner';
      case 'medicine':
      case 'pill':
        return 'Medicine Identifier';
      case 'document':
        return 'Document Scanner';
      default:
        return 'Scanner';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col safe-area-pt safe-area-pb">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-black text-white">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="flex-shrink-0">
            {getScanTypeIcon()}
          </div>
          <h2 className="text-base sm:text-lg font-semibold truncate">{getScanTypeTitle()}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors touch-target flex-shrink-0"
          aria-label="Close scanner"
        >
          <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      {/* Scanner Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 overflow-hidden">
        {scanType === 'qr' ? (
          // QR Code Scanner
          <div className="w-full max-w-sm sm:max-w-md">
            <div id="qr-reader" className="w-full"></div>
          </div>
        ) : capturedImages.length > 0 ? (
          // Show captured images
          <div className="w-full max-w-2xl space-y-3 sm:space-y-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">
                  Captured Images ({capturedImages.length}/{maxImages})
                </h3>
                {!isProcessing && (
                  <button
                    onClick={clearAllImages}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {capturedImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt={`Captured ${index + 1}`}
                      className="w-full rounded-lg object-cover aspect-square"
                    />
                    {!isProcessing && (
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>

              {isProcessing && (
                <div className="mt-4 bg-black bg-opacity-50 p-4 rounded-lg">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">Processing {capturedImages.length} image(s)...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              {capturedImages.length < maxImages && !isProcessing && (
                <button
                  onClick={() => {}}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 touch-target text-sm sm:text-base font-medium"
                  disabled
                >
                  Add More ({capturedImages.length}/{maxImages})
                </button>
              )}
              <button
                onClick={processAllImages}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 touch-target text-sm sm:text-base font-medium"
              >
                {isProcessing ? 'Processing...' : `Identify (${capturedImages.length} image${capturedImages.length > 1 ? 's' : ''})`}
              </button>
            </div>
          </div>
        ) : (
          // Camera View
          <div className="w-full max-w-sm sm:max-w-md space-y-3 sm:space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-gray-900">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full aspect-square object-cover"
                onUserMediaError={(error) => {
                  console.error('Camera error:', error);
                  onError('Failed to access camera');
                }}
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white border-dashed rounded-lg w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
                  <div className="text-white text-center px-2">
                    <div className="text-xs sm:text-sm opacity-75">
                      {scanType === 'barcode' && 'Align barcode within frame'}
                      {(scanType === 'medicine' || scanType === 'pill') && 'Center medicine in frame'}
                      {scanType === 'document' && 'Fit document in frame'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 touch-target"
                aria-label="Upload from gallery"
              >
                <PhotoIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              <button
                onClick={capturePhoto}
                className="p-3 sm:p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg touch-target"
                aria-label="Capture photo"
              >
                <CameraIcon className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>

              <button
                onClick={switchCamera}
                className="p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 touch-target"
                aria-label="Switch camera"
              >
                <ArrowPathIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-3 sm:p-4 bg-black text-white text-center">
        <p className="text-xs sm:text-sm opacity-75 px-2">
          {scanType === 'qr' && 'Point camera at QR code to scan automatically'}
          {scanType === 'barcode' && 'Tap capture button when barcode is in frame'}
          {(scanType === 'medicine' || scanType === 'pill') && 'Take a clear photo of the medicine for identification'}
          {scanType === 'document' && 'Capture medical report or prescription'}
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

CameraScanner.propTypes = {
  scanType: PropTypes.oneOf(['barcode', 'qr', 'medicine', 'pill', 'document']).isRequired,
  onScanResult: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default CameraScanner;