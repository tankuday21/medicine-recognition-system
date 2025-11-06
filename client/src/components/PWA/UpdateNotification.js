import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

const UpdateNotification = () => {
  const { t } = useTranslation();
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload the page when new service worker takes control
        window.location.reload();
      });

      navigator.serviceWorker.ready.then((registration) => {
        // Check for updates periodically
        const checkForUpdates = () => {
          registration.update();
        };

        // Check for updates every 30 minutes
        setInterval(checkForUpdates, 30 * 60 * 1000);

        // Listen for waiting service worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdate(true);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setShowUpdate(true);
            }
          });
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdate(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50">
      <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <ArrowPathIcon className="h-6 w-6 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">
                Update Available
              </h3>
              <p className="text-xs text-blue-100">
                A new version of Mediot is ready
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-blue-200 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-sm text-blue-100 mb-4">
          Update now to get the latest features and improvements.
        </p>
        
        <div className="flex space-x-2">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Update Now
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-blue-400 text-blue-100 hover:bg-blue-500 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;