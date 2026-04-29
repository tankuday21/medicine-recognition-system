import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA, useStandalone } from '../../hooks/usePWA';
import {
  XMarkIcon,
  DevicePhoneMobileIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

/**
 * Premium Install Prompt - Bottom Sheet Style
 */
const InstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const isStandalone = useStandalone();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem('pwa_prompt_dismissed_at');
    if (dismissedAt) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) return; // Don't show for 24 hours after dismiss
    }

    // Show prompt after delay
    const timer = setTimeout(() => {
      if ((isInstallable || isIOS) && !isInstalled && !isStandalone) {
        setShowPrompt(true);
      }
    }, 5000); // Show after 5 seconds

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, isStandalone, isIOS]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
    } else {
      const installed = await installApp();
      if (installed) {
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());
  };

  // Don't render if already installed
  if (isInstalled || isStandalone) return null;

  return (
    <>
      {/* Main Install Prompt - Bottom Sheet */}
      <AnimatePresence>
        {showPrompt && !showIOSGuide && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDismiss}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              <div className="px-6 pb-6">
                {/* Icon & Title */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <DevicePhoneMobileIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Install Mediot
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Add to your home screen
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  {[
                    'Works offline - access anytime',
                    'Faster loading & native feel',
                    'Quick access from home screen'
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 py-3.5 px-4 text-gray-600 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Not Now
                  </button>
                  <button
                    onClick={handleInstall}
                    className="flex-1 py-3.5 px-4 bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Install
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* iOS Installation Guide */}
      <AnimatePresence>
        {showIOSGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDismiss}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}
            >
              {/* Handle */}
              <div className="sticky top-0 bg-white dark:bg-slate-900 flex justify-center pt-3 pb-2 z-10">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              <div className="px-6 pb-6">
                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>

                {/* Title */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                    <DevicePhoneMobileIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Install on iPhone
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Follow these simple steps
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: 'Tap the Share button',
                      description: 'At the bottom of Safari',
                      icon: ShareIcon
                    },
                    {
                      step: 2,
                      title: 'Scroll and tap "Add to Home Screen"',
                      description: 'You may need to scroll down',
                      icon: null,
                      emoji: '➕'
                    },
                    {
                      step: 3,
                      title: 'Tap "Add" to confirm',
                      description: 'Mediot will appear on your home screen',
                      icon: CheckCircleIcon
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{item.step}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      {item.icon ? (
                        <item.icon className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      ) : item.emoji ? (
                        <span className="text-xl">{item.emoji}</span>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Done button */}
                <button
                  onClick={handleDismiss}
                  className="w-full mt-6 py-3.5 px-4 bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * Compact Install Button - For use in UI
 */
export const InstallButton = ({ className = '', variant = 'default' }) => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const isStandalone = useStandalone();

  if (!isInstallable || isInstalled || isStandalone) return null;

  if (variant === 'minimal') {
    return (
      <button
        onClick={installApp}
        className={`flex items-center gap-2 text-blue-500 font-medium text-sm ${className}`}
      >
        <ArrowDownTrayIcon className="w-4 h-4" />
        Install App
      </button>
    );
  }

  return (
    <button
      onClick={installApp}
      className={`flex items-center gap-3 w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/25 ${className}`}
    >
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
        <ArrowDownTrayIcon className="w-5 h-5" />
      </div>
      <div className="text-left flex-1">
        <p className="font-semibold text-sm">Install App</p>
        <p className="text-xs text-blue-100">Get the full experience</p>
      </div>
    </button>
  );
};

export default InstallPrompt;