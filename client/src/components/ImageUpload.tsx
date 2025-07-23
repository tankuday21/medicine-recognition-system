import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { validateImageFile, formatFileSize, createImagePreviewURL, revokeImagePreviewURL } from '../services/api';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      setError('No valid files selected');
      return;
    }

    const file = acceptedFiles[0];
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Clean up previous preview
    if (previewUrl) {
      revokeImagePreviewURL(previewUrl);
    }

    // Create new preview
    const newPreviewUrl = createImagePreviewURL(file);
    setPreviewUrl(newPreviewUrl);
    setSelectedFile(file);
  }, [previewUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleAnalyze = () => {
    if (selectedFile) {
      onImageUpload(selectedFile);
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      revokeImagePreviewURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Medicine Image
        </h2>
        <p className="text-gray-600">
          Take a clear photo of your medicine, pill bottle, or packaging
        </p>
      </div>

      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
            ${isDragActive 
              ? 'border-medical-500 bg-medical-50' 
              : 'border-gray-300 hover:border-medical-400 hover:bg-gray-50'
            }
          `}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-medical-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your image here' : 'Drag & drop an image here'}
              </p>
              <p className="text-gray-600 mt-1">
                or <span className="text-medical-600 font-medium">click to browse</span>
              </p>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Supported formats: JPEG, PNG, GIF, WebP</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="relative">
            <img
              src={previewUrl!}
              alt="Medicine preview"
              className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
            />
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors duration-200"
              title="Remove image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* File Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
              <div className="flex items-center text-green-600">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Ready</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleAnalyze}
              className="flex-1 btn-primary text-lg py-3"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Analyze Medicine
            </button>
            <button
              onClick={handleReset}
              className="btn-secondary"
            >
              Choose Different Image
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">📸 Tips for Best Results</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure good lighting and clear focus</li>
          <li>• Include any text or markings on the medicine</li>
          <li>• Capture the entire pill, bottle, or packaging</li>
          <li>• Avoid shadows or reflections</li>
          <li>• Take the photo from directly above if possible</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;
