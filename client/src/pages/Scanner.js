import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import CameraScanner from '../components/Scanner/CameraScanner';
import MedicineSearch from '../components/Medicine/MedicineSearch';
import {
  CameraIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Scanner = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeScanner, setActiveScanner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const scanOptions = [
    {
      id: 'medicine',
      title: t('scanner.scanMedicine') || 'Scan Medicine',
      description: t('scanner.medicineDescription') || 'Identify pills, tablets & packaging',
      icon: CameraIcon,
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      id: 'document',
      title: t('scanner.scanDocument') || 'Scan Document',
      description: t('scanner.documentDescription') || 'Prescriptions & medical reports',
      icon: DocumentTextIcon,
      gradient: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30'
    }
  ];

  const handleScanResult = async (result) => {
    setIsLoading(true);
    setError('');
    setActiveScanner(null);
    
    try {
      if (result.type === 'medicine' || result.type === 'pill') {
        await processMedicineResult(result);
      } else if (result.type === 'document') {
        await processDocumentResult(result);
      }
    } catch (error) {
      console.error('Scan processing error:', error);
      setError(t('scanner.processingError') || 'Failed to process scan');
      setIsLoading(false);
    }
  };

  const processMedicineResult = async (result) => {
    try {
      const imageDataArray = Array.isArray(result.imageData) ? result.imageData : [result.imageData];
      const formData = new FormData();
      
      for (let i = 0; i < imageDataArray.length; i++) {
        const response = await fetch(imageDataArray[i]);
        const blob = await response.blob();
        formData.append('images', blob, `medicine-image-${i + 1}.jpg`);
      }

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 60000);
      });
      
      const fetchPromise = fetch('/api/scanner/medicine', {
        method: 'POST',
        headers: {
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: formData
      });
      
      const apiResponse = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!apiResponse.ok) {
        throw new Error(`API request failed: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      
      if (data.success && data.data) {
        result.pillInfo = data.data.pillInfo;
        result.confidence = data.data.confidence;
        result.medicineInfo = {
          found: data.data.pillInfo?.identified || false,
          ...data.data.pillInfo
        };
        
        navigate('/medicine-result', { 
          state: { scanResult: result },
          replace: false
        });
      } else {
        throw new Error(data.message || 'Failed to identify');
      }
    } catch (error) {
      result.medicineInfo = {
        found: false,
        error: error.message
      };
      navigate('/medicine-result', { 
        state: { scanResult: result },
        replace: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processDocumentResult = async (result) => {
    try {
      const response = await fetch(result.imageData);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('report', blob, 'scan-report.jpg');

      const apiResponse = await fetch('/api/reports/upload', {
        method: 'POST',
        headers: {
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: formData
      });

      const data = await apiResponse.json();
      
      if (data.success) {
        // Navigate to reports page and open the new report
        navigate('/reports', {
          state: { 
            openReport: data.data,
            activeTab: 'analysis'
          },
          replace: true
        });
      } else {
        throw new Error(data.message || 'Failed to process');
      }
    } catch (error) {
      console.error('Document scan failed:', error);
      setError(error.message || 'Failed to upload report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMedicineSelect = (medicine) => {
    navigate('/medicine-result', {
      state: { 
        scanResult: { 
          type: 'search',
          medicineInfo: { found: true, ...medicine }
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header Area */}
      <div className="px-4 pt-4 pb-6">
        {/* Search Bar */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowSearch(true)}
          className="w-full flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm mb-6"
        >
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400 text-sm">{t('scanner.searchMedicine') || 'Search medicine by name...'}</span>
        </motion.button>

        {/* AI Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 dark:bg-violet-950/50 rounded-full">
            <SparklesIcon className="w-4 h-4 text-violet-500" />
            <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
              {t('scanner.aiPowered') || 'AI-Powered Recognition'}
            </span>
          </div>
        </div>

        {/* Scan Options */}
        <div className="space-y-4">
          {scanOptions.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveScanner(option.id)}
              className={`w-full p-5 ${option.bgColor} rounded-2xl border border-gray-100 dark:border-slate-800 text-left`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-lg`}>
                  <option.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-3">
            {t('scanner.tips') || 'Tips for best results'}
          </h4>
          <ul className="space-y-2">
            {[
              t('scanner.tip1') || 'Ensure good lighting',
              t('scanner.tip2') || 'Keep the camera steady',
              t('scanner.tip3') || 'Center the medicine in frame'
            ].map((tip, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 right-4 p-4 bg-red-500 text-white rounded-xl shadow-lg flex items-center gap-3 z-40"
          >
            <span className="flex-1 text-sm">{error}</span>
            <button onClick={() => setError('')}>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 mx-6 text-center max-w-sm">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t('scanner.analyzing') || 'Analyzing...'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('scanner.aiProcessing') || 'AI is processing your image'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white dark:bg-slate-950 z-50"
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('scanner.searchMedicine') || 'Search Medicine'}
                </h2>
              </div>
              <MedicineSearch
                onSelectMedicine={(medicine) => {
                  setShowSearch(false);
                  handleMedicineSelect(medicine);
                }}
                placeholder={t('common.search') || 'Search...'}
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Scanner */}
      {activeScanner && (
        <CameraScanner
          scanType={activeScanner}
          onScanResult={handleScanResult}
          onError={(msg) => {
            setError(msg);
            setActiveScanner(null);
          }}
          onClose={() => setActiveScanner(null)}
        />
      )}
    </div>
  );
};

export default Scanner;