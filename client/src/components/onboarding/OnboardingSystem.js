import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UserPlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import scanAvatar from '../../assets/images/scanning-avatar-3d.png';
import doctorAvatar from '../../assets/images/doctor-3d.png';
import analyticsAvatar from '../../assets/images/analytics-avatar-3d.png';
import login3d from '../../assets/images/3d-login.png';

/**
 * Premium Onboarding System - Full Screen App Intro
 * Fully responsive with swipe support and enhanced UX
 */
export const OnboardingSystem = ({ isOpen = false, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const { setGuestMode } = useAuth();
  const navigate = useNavigate();

  const steps = [
    {
      title: 'Your Personal Health Companion',
      description: 'Meet your AI-powered medical assistant. Get instant answers about medications',
      image: doctorAvatar,
      icon: ChatBubbleLeftRightIcon,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800',
      features: ['24/7 AI Support', 'Medical Q&A', 'Health Tips']
    },
    {
      title: 'Scan Medicines Instantly',
      description: 'Point your camera at any pill, bottle, or prescription. Get detailed information in seconds.',
      image: scanAvatar,
      icon: CameraIcon,
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800',
      features: ['Pill Identification', 'Dosage Info', 'Side Effects']
    },
    {
      title: 'Track Your Wellness',
      description: 'Beautiful analytics to monitor your health journey. Set reminders and never miss a dose.',
      image: analyticsAvatar,
      icon: ChartBarIcon,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800',
      features: ['Health Reports', 'Reminders', 'Progress Tracking']
    },
    {
      title: 'Join Mediot Today',
      description: 'Create your account to unlock all features, or continue as a guest with limited access.',
      image: login3d,
      icon: UserPlusIcon,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800',
      features: ['Secure Account', 'Cloud Sync', 'Full Access'],
      isAuth: true
    }
  ];

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
    if (distance < -minSwipeDistance && currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else onComplete?.();
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleGuestMode = () => {
    // Set guest mode using AuthContext
    setGuestMode();
    onComplete?.();
  };

  const handleNavigation = (path) => {
    onComplete?.();
    navigate(path);
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-white dark:bg-slate-900"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`absolute inset-0 ${step.bgColor}`}
        />
      </AnimatePresence>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${step.color} opacity-20 rounded-full blur-3xl`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr ${step.color} opacity-1 rounded-full blur-3xl`} />
      </div>

      <div className="relative h-full flex flex-col">

        {step.isAuth ? (
          /* Auth Screen Layout - Three Button Options */
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16" style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}>
            <div className="min-h-full flex flex-col justify-center py-4 sm:py-12">
              <div className="w-full max-w-md mx-auto space-y-4 sm:space-y-6">
                {/* Image Section */}
                <motion.div className="flex justify-center mb-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5, type: "spring" }}
                      className="relative"
                    >
                      <div className={`p-1 rounded-2xl bg-gradient-to-br ${step.color} shadow-xl`}>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-2 sm:p-4">
                          <img
                            src={step.image}
                            alt={step.title}
                            className="w-20 h-20 sm:w-36 sm:h-36 object-contain rounded-lg mx-auto"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                {/* Title and Description */}
                <div className="text-center space-y-2 sm:space-y-3">
                  <AnimatePresence mode="wait">
                    <motion.h1
                      key={`title-${currentStep}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white"
                    >
                      {step.title}
                    </motion.h1>
                  </AnimatePresence>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={`desc-${currentStep}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-2"
                    >
                      {step.description}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Three Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3 sm:space-y-4"
                >
                  {/* Sign Up Button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation('/register')}
                    className={`w-full py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-white bg-gradient-to-r ${step.color} shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2`}
                  >
                    <UserPlusIcon className="w-5 h-5" />
                    Create New Account
                  </motion.button>

                  {/* Login Button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation('/login')}
                    className="w-full py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    I Already Have an Account
                  </motion.button>

                  {/* Guest Mode Button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGuestMode}
                    className="w-full py-3 sm:py-4 rounded-xl font-medium text-sm sm:text-base text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <EyeIcon className="w-5 h-5" />
                    Continue as Guest
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full ml-2">Limited</span>
                  </motion.button>
                </motion.div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 justify-center pt-2 sm:pt-4">
                  {step.features.map((f, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-slate-700/50">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Regular Onboarding Layout - Full Screen without Top Header */
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 sm:px-8 lg:px-16 pb-4 gap-4 sm:gap-8 lg:gap-16" style={{ paddingTop: 'max(env(safe-area-inset-top), 24px)' }}>
            <>
              <motion.div className="w-full lg:w-1/2 flex items-center justify-center relative">
                <div className={`absolute inset-0 bg-gradient-to-tr ${step.color} opacity-20 blur-[60px] rounded-full scale-75`} />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="relative z-10"
                  >
                    <div className={`p-1 sm:p-1.5 rounded-[1.5rem] sm:rounded-[2.5rem] bg-gradient-to-br ${step.color} shadow-2xl`}>
                      <div className="bg-white dark:bg-slate-800 rounded-[1.25rem] sm:rounded-[2.25rem] p-3 sm:p-6">
                        <img
                          src={step.image}
                          alt={step.title}
                          className="w-36 h-36 sm:w-52 sm:h-52 md:w-60 md:h-60 lg:w-72 lg:h-72 object-contain rounded-xl sm:rounded-2xl"
                        />
                      </div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-gray-100 dark:border-slate-700"
                    >
                      <span className={`text-xs sm:text-sm font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                        {step.features[0]}
                      </span>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              <div className="w-full lg:w-1/2 text-center lg:text-left space-y-3 sm:space-y-5 z-10">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={`title-${currentStep}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-white leading-tight"
                  >
                    {step.title}
                  </motion.h1>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={`desc-${currentStep}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto lg:mx-0"
                  >
                    {step.description}
                  </motion.p>
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap gap-2 justify-center lg:justify-start"
                >
                  {step.features.map((f, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-slate-700/50">
                      {f}
                    </span>
                  ))}
                </motion.div>
              </div>
            </>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col items-center lg:items-start gap-4 sm:gap-5 pt-1 sm:pt-2 px-4 sm:px-8 lg:px-16">
          <div className="flex gap-2">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 ${i === currentStep
                    ? `w-8 sm:w-10 bg-gradient-to-r ${step.color}`
                    : i < currentStep
                      ? `w-2 sm:w-2.5 bg-gradient-to-r ${steps[i].color} opacity-50`
                      : 'w-2 sm:w-2.5 bg-gray-300 dark:bg-gray-700'
                  }`}
              />
            ))}
          </div>

          {!step.isAuth && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {currentStep > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrev}
                  className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 shadow-lg"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className={`group flex-1 sm:flex-none px-6 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base text-white shadow-xl bg-gradient-to-r ${step.color} flex items-center justify-center gap-2 overflow-hidden`}
              >
                <span>{currentStep === steps.length - 1 ? "Let's Go!" : 'Continue'}</span>
                <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700" />
              </motion.button>
            </div>
          )}

          {step.isAuth && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrev}
                className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 shadow-lg"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </motion.button>
            </div>
          )}

          {!step.isAuth && (
            <p className="text-xs text-gray-400 lg:hidden">← Swipe to navigate →</p>
          )}
        </div>

        <div className="flex-shrink-0 h-4 sm:h-6" />
      </div>
    </div>
  );
};

export default OnboardingSystem;
