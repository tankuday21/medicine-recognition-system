import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const ReportUpload = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const allowedTypes = {
    'image/jpeg': 'JPEG Image',
    'image/jpg': 'JPG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'image/webp': 'WebP Image',
    'application/pdf': 'PDF Document'
  };

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setError('');
    setSuccess('');

    // Validate file type
    if (!allowedTypes[file.type]) {
      setError('Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP) or PDF file.');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError('File too large. Please upload a file smaller than 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('report', selectedFile);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      // Handle response
      xhr.addEventListener('load', () => {
        if (xhr.status === 202) {
          const response = JSON.parse(xhr.responseText);
          setSuccess('Report uploaded successfully and is being processed!');
          setSelectedFile(null);
          setUploadProgress(0);
          
          if (onUploadSuccess) {
            onUploadSuccess(response.data);
          }
        } else {
          const errorResponse = JSON.parse(xhr.responseText);
          setError(errorResponse.message || 'Upload failed');
        }
        setIsUploading(false);
      });

      xhr.addEventListener('error', () => {
        setError('Upload failed. Please try again.');
        setIsUploading(false);
      });

      xhr.open('POST', '/api/reports/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <DocumentTextIcon className="h-8 w-8 text-red-500" />;
    }
    return <DocumentTextIcon className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : selectedFile 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
          onChange={handleFileInput}
          disabled={isUploading}
        />

        {!selectedFile ? (
          <div>
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-900">
                Drop your medical report here
              </p>
              <p className="text-gray-600 mt-1">
                or <span className="text-blue-600 font-medium">browse files</span>
              </p>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Supported formats: JPEG, PNG, GIF, WebP, PDF</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center space-x-3">
              {getFileIcon(selectedFile.type)}
              <div className="text-left">
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)} • {allowedTypes[selectedFile.type]}
                </p>
              </div>
              <button
                onClick={removeFile}
                className="p-1 text-gray-400 hover:text-gray-600"
                disabled={isUploading}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
          <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !isUploading && (
        <div className="mt-6 flex space-x-3">
          <button
            onClick={removeFile}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload & Analyze
          </button>
        </div>
      )}

      {/* Information */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Upload your medical report (lab results, test reports, etc.)</li>
          <li>Our AI extracts text and identifies health metrics</li>
          <li>Get insights about your health values and recommendations</li>
          <li>Track trends over time with multiple reports</li>
        </ol>
      </div>
    </div>
  );
};

ReportUpload.propTypes = {
  onUploadSuccess: PropTypes.func
};

export default ReportUpload;