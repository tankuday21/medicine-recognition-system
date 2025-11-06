import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');

  useEffect(() => {
    const loadingSteps = [
      { progress: 20, text: 'Loading health data...' },
      { progress: 40, text: 'Preparing scanner...' },
      { progress: 60, text: 'Setting up reminders...' },
      { progress: 80, text: 'Connecting services...' },
      { progress: 100, text: 'Ready!' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        setLoadingProgress(step.progress);
        setLoadingText(step.text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(onComplete, 300); // Wait for exit animation
        }, 500);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-16 w-12 h-12 bg-white rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-32 left-20 w-16 h-16 bg-white rounded-full animate-pulse delay-700"></div>
            <div className="absolute bottom-20 right-10 w-8 h-8 bg-white rounded-full animate-pulse delay-500"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center text-white px-8">
            {/* App Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.1 
              }}
              className="w-24 h-24 mx-auto mb-8 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-30"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="text-4xl"
              >
                🏥
              </motion.div>
            </motion.div>

            {/* App Name */}
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-bold mb-2"
            >
              Mediot
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg text-blue-100 mb-12"
            >
              Your Digital Health Companion
            </motion.p>

            {/* Loading Progress */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="w-full max-w-xs mx-auto"
            >
              {/* Progress Bar */}
              <div className="relative mb-4">
                <div className="w-full h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingProgress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                
                {/* Progress Percentage */}
                <motion.div
                  className="absolute -top-8 right-0 text-sm text-blue-100"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {loadingProgress}%
                </motion.div>
              </div>

              {/* Loading Text */}
              <motion.p
                key={loadingText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-blue-100"
              >
                {loadingText}
              </motion.p>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-12 grid grid-cols-3 gap-6 max-w-sm mx-auto"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-xl">📱</span>
                </div>
                <p className="text-xs text-blue-100">Scan Medicine</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <p className="text-xs text-blue-100">AI Assistant</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-xl">⏰</span>
                </div>
                <p className="text-xs text-blue-100">Reminders</p>
              </div>
            </motion.div>
          </div>

          {/* Bottom Branding */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute bottom-8 left-0 right-0 text-center"
          >
            <p className="text-xs text-blue-200">
              Powered by AI • Secure • Offline Ready
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;