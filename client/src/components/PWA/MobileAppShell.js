import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  WifiIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import pwaService from '../../services/pwaService';

const MobileAppShell = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Listen for PWA events
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      setShowReconnectedBanner(true);
      
      // Hide reconnected banner after 3 seconds
      setTimeout(() => {
        setShowReconnectedBanner(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
      setShowReconnectedBanner(false);
    };

    const handleUpdateAvailable = () => {
      setIsUpdating(true);
    };

    // Native events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // PWA events
    window.addEventListener('pwa:online', handleOnline);
    window.addEventListener('pwa:offline', handleOffline);
    window.addEventListener('pwa:updateAvailable', handleUpdateAvailable);

    // Check initial state
    if (!navigator.onLine) {
      setShowOfflineBanner(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa:online', handleOnline);
      window.removeEventListener('pwa:offline', handleOffline);
      window.removeEventListener('pwa:updateAvailable', handleUpdateAvailable);
    };
  }, []);

  // Update pending sync count
  useEffect(() => {
    const updateSyncCount = async () => {
      // This would get the actual count from IndexedDB
      // For now, we'll simulate it
      if (!isOnline) {
        setPendingSyncCount(prev => prev + Math.floor(Math.random() * 3));
      } else {
        setPendingSyncCount(0);
      }
    };

    updateSyncCount();
  }, [isOnline, location]);

  const handleRetryConnection = async () => {
    try {
      // Test connection with a small request
      await fetch('/manifest.json', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      // If successful, the online event will fire
      setIsOnline(true);
      setShowOfflineBanner(false);
    } catch (error) {
      // Still offline
      console.log('Still offline');
    }
  };

  const handleUpdateApp = () => {
    // Trigger app update
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Offline Banner */}
      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-3 safe-area-pt"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">You're offline</p>
                  <p className="text-xs text-yellow-100">
                    {pendingSyncCount > 0 
                      ? `${pendingSyncCount} items will sync when connected`
                      : 'Some features may be limited'
                    }
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleRetryConnection}
                className="ml-4 p-2 bg-yellow-600 rounded-full hover:bg-yellow-700 transition-colors"
                aria-label="Retry connection"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reconnected Banner */}
      <AnimatePresence>
        {showReconnectedBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-3 safe-area-pt"
          >
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Back online</p>
                <p className="text-xs text-green-100">
                  {pendingSyncCount > 0 
                    ? 'Syncing your data...'
                    : 'All features are now available'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Available Banner */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-3 safe-area-pt"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowPathIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Update available</p>
                  <p className="text-xs text-blue-100">
                    New features and improvements are ready
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsUpdating(false)}
                  className="px-3 py-1 text-xs border border-blue-400 rounded hover:bg-blue-500 transition-colors"
                >
                  Later
                </button>
                <button
                  onClick={handleUpdateApp}
                  className="px-3 py-1 text-xs bg-white text-blue-600 rounded hover:bg-blue-50 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`${showOfflineBanner || showReconnectedBanner || isUpdating ? 'pt-16' : ''}`}>
        {children}
      </div>

      {/* Connection Status Indicator */}
      <div className="fixed bottom-4 left-4 z-40">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: isOnline ? 0 : 1 }}
          className="w-3 h-3 bg-red-500 rounded-full shadow-lg"
          title="Offline"
        />
      </div>

      {/* Sync Status Indicator */}
      {pendingSyncCount > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-4 left-8 z-40"
        >
          <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            {pendingSyncCount}
          </div>
        </motion.div>
      )}

      {/* PWA Status Bar (for debugging in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 right-0 z-50 bg-black bg-opacity-75 text-white text-xs p-2 m-2 rounded">
          <div>Online: {isOnline ? '✅' : '❌'}</div>
          <div>PWA: {window.matchMedia('(display-mode: standalone)').matches ? '✅' : '❌'}</div>
          <div>SW: {'serviceWorker' in navigator ? '✅' : '❌'}</div>
        </div>
      )}
    </div>
  );
};

export default MobileAppShell;