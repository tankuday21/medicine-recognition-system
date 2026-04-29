import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePWA } from '../hooks/usePWA';
import LanguageSelector from '../components/LanguageSelector';
import RatingModal from '../components/RatingModal';
import EditProfileModal from '../components/EditProfileModal';
import { motion } from 'framer-motion';
import {
  PencilSquareIcon,
  UserCircleIcon,
  ChevronRightIcon,
  HeartIcon,
  PhoneIcon,
  GlobeAltIcon,
  BellIcon,
  ShieldCheckIcon,
  MoonIcon,
  SunIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ArrowDownTrayIcon,
  CameraIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentMagnifyingGlassIcon,
  StarIcon,
  CheckBadgeIcon,
  SparklesIcon,
  CheckIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid
} from '@heroicons/react/24/solid';
import { BackButton, PremiumLoading } from '../components/ui/PremiumComponents';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isGuest } = useAuth();
  const { t, getCurrentLanguage, language, isLoading } = useLanguage();
  const { isInstallable, installApp, isInstalled } = usePWA();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [stats, setStats] = useState({ scans: 0, reminders: 0, chats: 0 });
  const [renderKey, setRenderKey] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { updateProfile } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('profile.goodMorning');
    if (hour < 17) return t('profile.goodAfternoon');
    return t('profile.goodEvening');
  };

  const getMemberSince = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return t('profile.memberSinceDefault');
  };

  const MenuItem = ({ icon: Icon, label, subtitle, onClick, rightElement, iconBg = 'bg-gray-100 dark:bg-slate-800', iconColor = 'text-gray-600 dark:text-gray-400' }) => (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`w-full flex items-center gap-3 p-3 sm:p-4 min-h-[60px] ${onClick ? 'cursor-pointer active:bg-gray-50 dark:active:bg-slate-800/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/30' : ''} transition-colors`}
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base leading-tight">{label}</p>
        {subtitle && <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{subtitle}</p>}
      </div>
      <div className="flex-shrink-0" onClick={(e) => rightElement && e.stopPropagation()}>
        {rightElement || <ChevronRightIcon className="w-5 h-5 text-gray-300 dark:text-gray-600" />}
      </div>
    </motion.div>
  );

  const Toggle = ({ enabled, onToggle }) => (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`w-11 h-6 sm:w-12 sm:h-7 rounded-full p-0.5 transition-colors cursor-pointer ${enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-600'}`}
    >
      <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5 sm:translate-x-5' : 'translate-x-0'}`} />
    </div>
  );

  useEffect(() => {
    // Sync local state with user data when it changes
    if (user?.preferences?.theme) {
      setDarkMode(user.preferences.theme === 'dark');
      if (user.preferences.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    if (isAuthenticated && user?.stats) {
      setStats({
        scans: user.stats.scans || 0,
        reminders: user.stats.reminders || 0,
        chats: user.stats.chats || 0
      });
    } else if (isGuest) {
      const savedScans = parseInt(localStorage.getItem('total_scans') || '0');
      const savedChats = parseInt(localStorage.getItem('total_chats') || '0');
      const savedReminders = parseInt(localStorage.getItem('total_reminders') || '0');

      setStats({
        scans: savedScans,
        reminders: savedReminders,
        chats: savedChats
      });
    }
  }, [isAuthenticated, isGuest, user]);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setRenderKey(prev => prev + 1);
    }
  }, [language, isLoading]);

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('darkMode', newMode ? 'true' : 'false');

    if (isAuthenticated) {
      await updateProfile({
        preferences: {
          ...user?.preferences,
          theme: newMode ? 'dark' : 'light'
        }
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRate = async (rating) => {
    console.log(`User rated: ${rating} stars`);
    localStorage.setItem('app_rating', rating);

    if (isAuthenticated) {
      await updateProfile({
        appRating: {
          score: rating,
          date: new Date(),
          feedback: '' // Can be expanded later to collect text feedback
        }
      });
    }
  };

  if (isLoading) {
    if (isLoading) {
      return <PremiumLoading fullScreen text={t('common.loading')} />;
    }
  }

  // Not authenticated and not guest view
  if (!isAuthenticated && !isGuest) {
    return (
      <div key={renderKey} className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative mb-6 sm:mb-8"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-500 rounded-3xl flex items-center justify-center shadow-lg">
              <UserCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 bg-amber-400 rounded-xl flex items-center justify-center">
              <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
          </motion.div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            {t('profile.welcomeToMediot')}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center mb-6 sm:mb-8 max-w-xs px-2">
            {t('profile.signInMessage')}
          </p>

          <div className="w-full max-w-sm space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
            {[
              { icon: CameraIcon, text: t('profile.features.scanMedicines'), color: 'text-blue-500' },
              { icon: BellIcon, text: t('profile.features.neverMissDose'), color: 'text-amber-500' },
              { icon: ChatBubbleLeftRightIcon, text: t('profile.features.aiHealthAssistant'), color: 'text-violet-500' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                <feature.icon className={`w-5 h-5 ${feature.color} flex-shrink-0`} />
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 flex-1">{feature.text}</span>
                <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              </div>
            ))}
          </div>

          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 sm:py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-colors text-sm sm:text-base"
            >
              {t('auth.signIn')}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full py-3.5 sm:py-4 bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-semibold rounded-2xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm sm:text-base"
            >
              {t('auth.createAccount')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Guest user view
  if (isGuest) {
    return (
      <div key={renderKey} className="min-h-screen bg-gray-100 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 pt-2 sm:pt-4 pb-4 sm:pb-6 px-4 sm:px-5" style={{ paddingTop: 'max(env(safe-area-inset-top), 8px)' }}>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <BackButton className="!p-0 bg-transparent hover:bg-transparent shadow-none border-none dark:bg-transparent" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{getGreeting()} 👋</p>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('profile.guestUser')}</h1>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/settings')}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center"
            >
              <Cog6ToothIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-400 rounded-2xl flex items-center justify-center">
                <UserCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-lg flex items-center justify-center border-2 border-white dark:border-slate-900">
                <SparklesIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t('profile.guestMode')}</h2>
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-full">{t('profile.limited')}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('profile.createAccountToUnlock')}</p>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-5">
            {[
              { value: stats.scans, label: t('profile.scans'), icon: DocumentMagnifyingGlassIcon, color: 'text-blue-500' },
              { value: stats.reminders, label: t('profile.reminders'), icon: ClockIcon, color: 'text-amber-500' },
              { value: stats.chats, label: t('profile.messages'), icon: ChatBubbleLeftRightIcon, color: 'text-violet-500' },
            ].map((stat, i) => (
              <div key={i} className={`flex-1 rounded-2xl p-2.5 sm:p-3 text-center bg-gray-50 dark:bg-slate-800`}>
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl text-white"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs sm:text-sm">{t('profile.unlockPremiumFeatures')}</p>
                <p className="text-xs text-blue-100">{t('profile.premiumFeaturesDesc')}</p>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 rounded-xl text-xs font-medium flex-shrink-0"
              >
                {t('profile.upgrade')}
              </button>
            </div>
          </motion.div>
        </div>

        <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{t('profile.availableFeatures')}</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              <MenuItem
                icon={CameraIcon}
                label={t('profile.medicineScanner')}
                subtitle={t('profile.identifyPillsMedicines')}
                onClick={() => navigate('/scanner')}
                iconBg="bg-blue-50 dark:bg-blue-950/30"
                iconColor="text-blue-500"
              />
              <MenuItem
                icon={ChatBubbleLeftRightIcon}
                label={t('profile.aiAssistant')}
                subtitle={t('profile.askHealthQuestions')}
                onClick={() => navigate('/chat')}
                iconBg="bg-violet-50 dark:bg-violet-950/30"
                iconColor="text-violet-500"
              />
              <MenuItem
                icon={DocumentTextIcon}
                label={t('profile.symptomsChecker')}
                subtitle={t('profile.checkYourSymptoms')}
                onClick={() => navigate('/symptoms')}
                iconBg="bg-emerald-50 dark:bg-emerald-950/30"
                iconColor="text-emerald-500"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{t('profile.premiumFeatures')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.createAccountToUnlock')}</p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              <MenuItem
                icon={ClockIcon}
                label={t('profile.medicineReminders')}
                subtitle={t('profile.neverMissADose')}
                onClick={() => navigate('/register')}
                iconBg="bg-gray-100 dark:bg-slate-800"
                iconColor="text-gray-400"
                rightElement={<span className="text-xs text-amber-500 font-medium">{t('profile.premium')}</span>}
              />
              <MenuItem
                icon={DocumentTextIcon}
                label={t('profile.healthReports')}
                subtitle={t('profile.trackHealthData')}
                onClick={() => navigate('/register')}
                iconBg="bg-gray-100 dark:bg-slate-800"
                iconColor="text-gray-400"
                rightElement={<span className="text-xs text-amber-500 font-medium">{t('profile.premium')}</span>}
              />
              <MenuItem
                icon={HeartIcon}
                label={t('profile.healthProfile')}
                subtitle={t('profile.personalizedRecommendations')}
                onClick={() => navigate('/register')}
                iconBg="bg-gray-100 dark:bg-slate-800"
                iconColor="text-gray-400"
                rightElement={<span className="text-xs text-amber-500 font-medium">{t('profile.premium')}</span>}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm" style={{ overflow: 'visible' }}>
            <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{t('profile.settings')}</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              <div className="flex items-center gap-3 p-3 sm:p-4 min-h-[60px] relative overflow-visible">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <GlobeAltIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{t('profile.language')}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{getCurrentLanguage().nativeName}</p>
                </div>
                <div className="flex-shrink-0">
                  <LanguageSelector key={language} variant="compact" />
                </div>
              </div>
              <MenuItem
                icon={darkMode ? SunIcon : MoonIcon}
                label={t('profile.darkMode')}
                onClick={toggleDarkMode}
                rightElement={<Toggle enabled={darkMode} onToggle={toggleDarkMode} />}
                iconBg="bg-gray-50 dark:bg-gray-950/30"
                iconColor="text-gray-500"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              <MenuItem
                icon={UserCircleIcon}
                label={t('auth.createAccount')}
                subtitle={t('profile.unlockAllFeatures')}
                onClick={() => navigate('/register')}
                iconBg="bg-emerald-50 dark:bg-emerald-950/30"
                iconColor="text-emerald-500"
              />
              <MenuItem
                icon={ArrowRightOnRectangleIcon}
                label={t('auth.signIn')}
                subtitle={t('profile.alreadyHaveAccount')}
                onClick={() => navigate('/login')}
                iconBg="bg-blue-50 dark:bg-blue-950/30"
                iconColor="text-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div key={renderKey} className="min-h-screen bg-gray-100 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 pt-2 sm:pt-4 pb-4 sm:pb-6 px-4 sm:px-5" style={{ paddingTop: 'max(env(safe-area-inset-top), 8px)' }}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <BackButton className="!p-0 bg-transparent hover:bg-transparent shadow-none border-none dark:bg-transparent" />
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{getGreeting()} 👋</p>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{user?.name?.split(' ')[0] || 'User'}</h1>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/settings')}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center"
          >
            <Cog6ToothIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </div>

        {/* Profile Card & Edit Button */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 mb-6">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
                <span className="text-white text-xl sm:text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-white dark:border-slate-900">
                <CheckIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</h2>
                <CheckBadgeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t('profile.memberSince')} {getMemberSince()}</p>
            </div>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <PencilSquareIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t('common.edit')}</span>
          </button>
        </div>

        {/* Medical Stats Row */}
        {user?.bloodGroup && (
          <div className="grid grid-cols-3 gap-2 mb-4 px-1">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-2 text-center">
              <p className="text-xs text-red-500 font-medium">{t('common.blood')}</p>
              <p className="text-sm font-bold text-red-700 dark:text-red-400">{user.bloodGroup}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2 text-center">
              <p className="text-xs text-blue-500 font-medium">{t('common.height')}</p>
              <p className="text-sm font-bold text-blue-700 dark:text-blue-400">{user.height} cm</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2 text-center">
              <p className="text-xs text-emerald-500 font-medium">{t('common.weight')}</p>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{user.weight} kg</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-5">
          {[
            { value: stats.scans, label: t('profile.scans'), icon: DocumentMagnifyingGlassIcon, color: 'text-blue-500' },
            { value: stats.reminders, label: t('profile.reminders'), icon: ClockIcon, color: 'text-amber-500' },
            { value: stats.chats, label: t('profile.messages'), icon: ChatBubbleLeftRightIcon, color: 'text-violet-500' },
          ].map((stat, i) => (
            <div key={i} className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-2xl p-2.5 sm:p-3 text-center">
              <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${stat.color}`} />
              <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
        {isInstallable && !isInstalled && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={installApp}
            className="w-full flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-emerald-500 rounded-2xl text-white shadow-sm"
          >
            <ArrowDownTrayIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-sm">{t('profile.installMediot')}</p>
              <p className="text-xs text-emerald-100">{t('profile.getFasterAccess')}</p>
            </div>
            <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          </motion.button>
        )}

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {[
            { icon: CameraIcon, label: t('profile.scan'), path: '/scanner', color: 'bg-blue-500' },
            { icon: ClockIcon, label: t('profile.reminders'), path: '/reminders', color: 'bg-amber-500' },
            { icon: ChatBubbleLeftRightIcon, label: t('profile.aiChat'), path: '/chat', color: 'bg-violet-500' },
          ].map((action, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 text-center shadow-sm"
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">{action.label}</p>
            </motion.button>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{t('profile.healthProfile')}</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            <MenuItem
              icon={HeartIcon}
              label={t('profile.medicalInfo')}
              subtitle={t('profile.conditionsAllergies')}
              iconBg="bg-rose-50 dark:bg-rose-950/30"
              iconColor="text-rose-500"
              onClick={() => navigate('/medical-info')}
            />
            <MenuItem
              icon={PhoneIcon}
              label={t('profile.emergencyContacts')}
              subtitle={t('profile.contactsSaved', { count: 2 })}
              iconBg="bg-red-50 dark:bg-red-950/30"
              iconColor="text-red-500"
              onClick={() => navigate('/emergency-contacts')}
            />
            <MenuItem
              icon={DocumentTextIcon}
              label={t('profile.medicalReports')}
              subtitle={t('profile.viewUploadedReports')}
              iconBg="bg-indigo-50 dark:bg-indigo-950/30"
              iconColor="text-indigo-500"
              onClick={() => navigate('/reports')}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm" style={{ overflow: 'visible' }}>
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{t('profile.preferences')}</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            <div className="flex items-center gap-3 p-3 sm:p-4 min-h-[60px] relative overflow-visible">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <GlobeAltIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{t('profile.language')}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{getCurrentLanguage().nativeName}</p>
              </div>
              <div className="flex-shrink-0">
                <LanguageSelector key={language} variant="compact" />
              </div>
            </div>
            <MenuItem
              icon={BellIcon}
              label={t('profile.notifications')}
              subtitle={t('profile.remindersAlerts')}
              iconBg="bg-amber-50 dark:bg-amber-950/30"
              iconColor="text-amber-500"
              rightElement={<Toggle enabled={notifications} onToggle={() => setNotifications(!notifications)} />}
            />
            <MenuItem
              icon={darkMode ? MoonIcon : SunIcon}
              label={t('profile.darkMode')}
              subtitle={darkMode ? t('common.on') : t('common.off')}
              iconBg="bg-purple-50 dark:bg-purple-950/30"
              iconColor="text-purple-500"
              onClick={toggleDarkMode}
              rightElement={<Toggle enabled={darkMode} onToggle={toggleDarkMode} />}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{t('profile.support')}</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            <MenuItem
              icon={QuestionMarkCircleIcon}
              label={t('profile.helpFAQ')}
              iconBg="bg-cyan-50 dark:bg-cyan-950/30"
              iconColor="text-cyan-500"
              onClick={() => navigate('/help')}
            />
            <MenuItem
              icon={ShieldCheckIcon}
              label={t('profile.privacyPolicy')}
              iconBg="bg-emerald-50 dark:bg-emerald-950/30"
              iconColor="text-emerald-500"
              onClick={() => navigate('/privacy')}
            />
            <MenuItem
              icon={StarIcon}
              label={t('profile.rateUs')}
              subtitle={t('profile.loveTheApp')}
              iconBg="bg-amber-50 dark:bg-amber-950/30"
              iconColor="text-amber-500"
              onClick={() => setShowRatingModal(true)}
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-3.5 sm:p-4 bg-white dark:bg-slate-900 text-red-500 rounded-2xl font-medium shadow-sm min-h-[56px]"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          {t('auth.signOut')}
        </motion.button>

        <div className="text-center py-3 sm:py-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-lg flex items-center justify-center">
              <HeartSolid className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">{t('common.appName')}</span>
          </div>
          <p className="text-sm text-gray-400">{t('profile.version')} 2.0.0 • {t('profile.madeWithLove')}</p>
        </div>
      </div>

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onRate={handleRate}
      />

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onUpdate={updateProfile}
      />
    </div>
  );
};

export default Profile;
