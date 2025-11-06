import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DevicePhoneMobileIcon,
  ShareIcon,
  PlusIcon,
  BellIcon,
  WifiIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import pwaService from '../../services/pwaService';

const MobilePWAManager = () => {
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [showAddToHomeScreen, setShowAddToHomeScreen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if running as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                     window.navigator.standalone ||
                     document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Check if can install
    const appInfo = pwaService.getAppInfo();
    setCanInstall(appInfo.canInstall);

    // Listen for PWA events
    const handleInstallAvailable = () => {
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setCanInstall(false);
      setShowAddToHomeScreen(false);
      setShowIOSInstructions(false);
    };

    window.addEventListener('pwa:installAvailable', handleInstallAvailable);
    window.addEventListener('pwa:appInstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa:installAvailable', handleInstallAvailable);
      window.removeEventListener('pwa:appInstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else if (canInstall) {
      const success = await pwaService.showInstallPrompt();
      if (!success) {
        setShowAddToHomeScreen(true);
      }
    } else {
      setShowAddToHomeScreen(true);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await pwaService.requestNotificationPermission();
    if (granted) {
      await pwaService.showNotification('Notifications Enabled', {
        body: 'You\'ll now receive medication reminders and health updates.',
        icon: '/icons/icon-192x192.png'
      });
    }
  };

  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Main Install Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-20 right-4 z-40"
      >
        <button
          onClick={handleInstall}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 active:scale-95"
          aria-label="Install Mediot App"
        >
          <ArrowDownTrayIcon className="h-6 w-6" />
        </button>
      </motion.div>

      {/* iOS Installation Instructions */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
            onClick={() => setShowIOSInstructions(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="w-full bg-white rounded-t-3xl p-6 pb-8 safe-area-pb"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DevicePhoneMobileIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Install Mediot
                </h3>
                <p className="text-gray-600">
                  Add Mediot to your home screen for the best experience
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Tap the Share button
                    </p>
                    <div className="flex items-center text-gray-600">
                      <ShareIcon className="h-4 w-4 mr-2" />
                      <span className="text-xs">Usually at the bottom of Safari</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Select "Add to Home Screen"
                    </p>
                    <div className="flex items-center text-gray-600">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      <span className="text-xs">Scroll down if you don't see it</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Tap "Add" to confirm
                    </p>
                    <div className="flex items-center text-gray-600">
                      <span className="text-xs">Mediot will appear on your home screen</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Got it
                </button>
                <button
                  onClick={handleEnableNotifications}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <BellIcon className="h-4 w-4 mr-2" />
                  Enable Notifications
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generic Add to Home Screen Instructions */}
      <AnimatePresence>
        {showAddToHomeScreen && !isIOS && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddToHomeScreen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DevicePhoneMobileIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Add to Home Screen
                </h3>
                <p className="text-gray-600">
                  For the best experience, add Mediot to your home screen
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <WifiIcon className="h-4 w-4 mr-3 text-green-500" />
                  <span>Works offline</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BellIcon className="h-4 w-4 mr-3 text-blue-500" />
                  <span>Push notifications</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-3">⚡</span>
                  <span>Faster loading</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 text-center">
                  Look for the "Add to Home Screen" or "Install" option in your browser menu
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddToHomeScreen(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleEnableNotifications}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enable Notifications
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobilePWAManager;