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
import { useLanguage } from '../../contexts/LanguageContext';
import {
  GlassCard,
  GradientButton,
  ProgressBar,
  Alert,
  ActionButton
} from '../ui/PremiumComponents';
import { motion, AnimatePresence } from 'framer-motion';

const ReportUpload = ({ onUploadSuccess }) => {
  const { t } = useLanguage();
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
      setError(t('reports.invalidFileType'));
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError(t('reports.fileTooLarge'));
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
          setSuccess(t('reports.uploadSuccess'));
          setTimeout(() => {
            if (onUploadSuccess) {
              onUploadSuccess(response.data);
            }
            // Reset form
            setSelectedFile(null);
            setUploadProgress(0);
            setSuccess('');
          }, 1500);

        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            console.error('❌ Report upload failed:', errorResponse);
            setError(errorResponse.message || t('reports.uploadFailed'));
          } catch (e) {
            console.error('❌ Report upload failed (raw):', xhr.responseText);
            setError(t('reports.uploadFailed'));
          }
        }
        setIsUploading(false);
      });

      xhr.addEventListener('error', () => {
        setError(t('reports.uploadFailed'));
        setIsUploading(false);
      });

      xhr.open('POST', '/api/reports/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      setError(t('reports.uploadFailed'));
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
    if (fileType?.startsWith('image/')) {
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
    <div className="space-y-6">
      {/* Upload Area */}
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
              relative border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all duration-300
              ${dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                : 'border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-slate-800'
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
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
              onChange={handleFileInput}
              disabled={isUploading}
            />

            <div className="relative z-0 pointer-events-none">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CloudArrowUpIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('reports.dropReportHere')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {t('reports.orBrowseFiles')}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
                <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700">
                  JPG, PNG, PDF
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700">
                  Max {maxFileSize / 1024 / 1024}MB
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <GlassCard className="!p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-xl">
                  {getFileIcon(selectedFile.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white">{selectedFile.name}</h4>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                {!isUploading && !success && (
                  <button
                    onClick={removeFile}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              {isUploading && (
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <ProgressBar value={uploadProgress} />
                </div>
              )}

              {success && (
                <div className="mb-6">
                  <Alert type="success" message={success} icon={CheckCircleIcon} />
                </div>
              )}

              {error && (
                <div className="mb-6">
                  <Alert type="error" message={error} icon={ExclamationCircleIcon} />
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-4 mt-10 pt-6 border-t border-gray-100 dark:border-slate-800">
                {!isUploading && !success && (
                  <>
                    <button
                      onClick={removeFile}
                      className="w-full sm:flex-1 py-4 px-6 text-gray-500 dark:text-gray-400 font-bold text-sm hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleUpload}
                      className="w-full sm:flex-[2] py-4 px-8 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      <CloudArrowUpIcon className="w-5 h-5" />
                      {t('reports.uploadAndAnalyze')}
                    </button>
                  </>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <GlassCard className="!bg-blue-50/50 dark:!bg-blue-900/10 !border-blue-100 dark:!border-blue-900/20 !p-6">
        <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3 text-sm uppercase tracking-wider">
          {t('reports.howItWorks')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
            <p className="text-sm text-blue-800 dark:text-blue-200">{t('reports.step1')}</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
            <p className="text-sm text-blue-800 dark:text-blue-200">{t('reports.step2')}</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
            <p className="text-sm text-blue-800 dark:text-blue-200">{t('reports.step3')}</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
            <p className="text-sm text-blue-800 dark:text-blue-200">{t('reports.step4')}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

ReportUpload.propTypes = {
  onUploadSuccess: PropTypes.func
};

export default ReportUpload;