import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  XMarkIcon, 
  PhotoIcon, 
  PlusIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { validateImageFile, formatFileSize, createImagePreviewURL, revokeImagePreviewURL } from '../services/api';

interface UploadedImage {
  file: File;
  previewUrl: string;
  id: string;
}

interface MultiImageUploadProps {
  onImagesUpload: (files: File[]) => void;
  maxImages?: number;
  minImages?: number;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({ 
  onImagesUpload, 
  maxImages = 3, 
  minImages = 1 
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      setError('No valid files selected');
      return;
    }

    // Check if adding these files would exceed the limit
    const totalFiles = uploadedImages.length + acceptedFiles.length;
    if (totalFiles > maxImages) {
      setError(`Maximum ${maxImages} images allowed. You can upload ${maxImages - uploadedImages.length} more.`);
      return;
    }

    // Validate and process each file
    const newImages: UploadedImage[] = [];
    
    for (const file of acceptedFiles) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      const previewUrl = createImagePreviewURL(file);
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      newImages.push({
        file,
        previewUrl,
        id
      });
    }

    setUploadedImages(prev => [...prev, ...newImages]);
  }, [uploadedImages.length, maxImages]);

  const removeImage = useCallback((id: string) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        revokeImagePreviewURL(imageToRemove.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
    setError(null);
  }, []);

  const handleAnalyze = () => {
    if (uploadedImages.length < minImages) {
      setError(`Please upload at least ${minImages} image${minImages > 1 ? 's' : ''}`);
      return;
    }
    
    const files = uploadedImages.map(img => img.file);
    onImagesUpload(files);
  };

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      uploadedImages.forEach(img => {
        revokeImagePreviewURL(img.previewUrl);
      });
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploadedImages.length >= maxImages
  });

  const canUploadMore = uploadedImages.length < maxImages;
  const isReadyToAnalyze = uploadedImages.length >= minImages;

  return (
    <div className="space-mobile-y px-2 sm:px-0">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-mobile">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-blue-900 text-sm sm:text-base">Multi-Image Analysis</h3>
            <p className="text-blue-800 text-xs sm:text-sm mt-1 leading-relaxed">
              Upload {minImages}-{maxImages} images of your medicine for comprehensive analysis. 
              Try capturing different angles: front (name/branding), back (ingredients/dosage), 
              and side (manufacturing details).
            </p>
          </div>
        </div>
      </div>

      {/* Upload Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <PhotoIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-gray-700">
            {uploadedImages.length}/{maxImages} images uploaded
          </span>
          {isReadyToAnalyze && (
            <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
          )}
        </div>
        
        {uploadedImages.length > 0 && (
          <button
            onClick={() => {
              uploadedImages.forEach(img => {
                revokeImagePreviewURL(img.previewUrl);
              });
              setUploadedImages([]);
              setError(null);
            }}
            className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium transition-colors tap-target px-3 py-2 rounded-lg hover:bg-red-50"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Image Previews */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
          {uploadedImages.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="image-container-mobile">
                <img
                  src={image.previewUrl}
                  alt={`Medicine ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Info */}
              <div className="mt-1.5 sm:mt-2 text-xs text-gray-600">
                <p className="font-medium">Image {index + 1}</p>
                <p className="truncate">{formatFileSize(image.file.size)}</p>
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => removeImage(image.id)}
                className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white rounded-full p-1 sm:p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 tap-target"
                title="Remove image"
              >
                <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              
              {/* Image Label */}
              <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                {index === 0 ? 'Front' : index === 1 ? 'Back' : 'Side'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canUploadMore && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-medical-500 bg-medical-50 scale-105'
              : 'border-gray-300 hover:border-medical-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-center">
              {uploadedImages.length === 0 ? (
                <PhotoIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              ) : (
                <PlusIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              )}
            </div>
            
            <div>
              <p className="text-base sm:text-lg font-medium text-gray-900">
                {uploadedImages.length === 0 
                  ? 'Upload medicine images' 
                  : `Add ${maxImages - uploadedImages.length} more image${maxImages - uploadedImages.length !== 1 ? 's' : ''}`
                }
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {isDragActive
                  ? 'Drop the images here...'
                  : 'Tap to select or drag images'
                }
              </p>
            </div>
            
            <div className="text-xs sm:text-sm text-gray-500 space-y-0.5">
              <p>Supports: JPEG, PNG, GIF, WebP</p>
              <p>Max: 10MB per image</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-mobile">
          <div className="flex items-start gap-3">
            <XMarkIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-red-900 text-sm sm:text-base">Upload Error</h4>
              <p className="text-red-800 text-xs sm:text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      {uploadedImages.length > 0 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleAnalyze}
            disabled={!isReadyToAnalyze}
            className={`btn-mobile-primary w-full sm:w-auto px-6 sm:px-8 text-sm sm:text-base ${
              isReadyToAnalyze
                ? 'bg-medical-600 text-white hover:bg-medical-700 shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isReadyToAnalyze 
              ? `Analyze ${uploadedImages.length} Image${uploadedImages.length !== 1 ? 's' : ''}` 
              : `Upload ${minImages - uploadedImages.length} More Image${minImages - uploadedImages.length !== 1 ? 's' : ''}`
            }
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-mobile">
        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">📸 Photography Tips</h4>
        <ul className="text-xs sm:text-sm text-gray-700 space-y-1 sm:space-y-1.5">
          <li>• <strong>Front:</strong> Capture the medicine name, brand, and strength clearly</li>
          <li>• <strong>Back:</strong> Include ingredients list, dosage instructions, and warnings</li>
          <li>• <strong>Side:</strong> Show manufacturing details, expiration date, and lot number</li>
          <li>• Ensure good lighting and avoid shadows or glare</li>
          <li>• Keep text readable and in focus</li>
        </ul>
      </div>
    </div>
  );
};

export default MultiImageUpload;
