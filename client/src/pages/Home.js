import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePWA } from '../hooks/usePWA';
import {
  CameraIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  HeartIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  NewspaperIcon,
  SparklesIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  UserCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

// Premium Components
import {
  GlassCard,
  SectionHeader,
  AnimatedList,
  AnimatedListItem
} from '../components/ui/PremiumComponents';

// Import images
import hero3d from '../assets/images/hero-3d.png';
import medicalHeroIcon from '../assets/images/medical_hero_icon.png';
import pill3d from '../assets/images/3d-pill-bottle.png';
import chat3d from '../assets/images/3d-chat-bot.png';
import bell3d from '../assets/images/3d-bell.png';
import heart3d from '../assets/images/3d-heart-shield.png';


console.log('PremiumComponents Imports:', { GlassCard, SectionHeader, AnimatedList, AnimatedListItem });

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { isInstallable, installApp } = usePWA();
  const navigate = useNavigate();

  // Quick actions for the grid
  const quickActions = [
    {
      id: 'scanner',
      title: t('scanner.scanMedicine'),
      subtitle: t('scanner.analyzing'),
      icon: CameraIcon,
      image: pill3d,
      path: '/scanner',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'chat',
      title: t('nav.aiAssistant'),
      subtitle: t('chat.howCanIHelp'),
      icon: ChatBubbleLeftRightIcon,
      image: chat3d,
      path: '/chat',
      gradient: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50 dark:bg-violet-900/20',
      iconColor: 'text-violet-600 dark:text-violet-400'
    },
    {
      id: 'reminders',
      title: t('reminders.title'),
      subtitle: t('reminders.addReminder'),
      icon: ClockIcon,
      image: bell3d,
      path: '/reminders',
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      id: 'symptoms',
      title: t('symptoms.title'),
      subtitle: t('symptoms.selectSymptoms'),
      icon: HeartIcon,
      image: heart3d,
      path: '/symptoms',
      gradient: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-50 dark:bg-rose-900/20',
      iconColor: 'text-rose-600 dark:text-rose-400'
    }
  ];

  // More services
  const moreServices = [
    { id: 'reports', title: t('nav.reports'), icon: DocumentTextIcon, path: '/reports', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { id: 'price', title: t('nav.priceLookup'), icon: CurrencyDollarIcon, path: '/price-lookup', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { id: 'news', title: t('nav.healthNews'), icon: NewspaperIcon, path: '/news', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' },
    { id: 'sos', title: t('nav.emergencySOS'), icon: ExclamationTriangleIcon, path: '/sos', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  return (
    <div className="pb-24">
      {/* Premium Header with Logo Animation */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <video autoPlay muted playsInline loop className="w-full h-full object-contain">
                <source src="/videos/logo_animation.mp4" type="video/mp4" />
              </video>
            </motion.div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-0.5">
                {isAuthenticated ? t('common.personalDashboard') : t('common.welcomeTo')}
              </p>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display leading-none">
                {isAuthenticated ? (user?.name?.split(' ')[0] || 'User') : 'Mediot'} <span className="text-primary-500">.</span>
              </h1>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-premium border border-gray-100 dark:border-slate-800 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <UserCircleIcon className="w-7 h-7 text-slate-400" />
            )}
          </button>
        </div>

        {/* Beautiful Animated Underline */}
        <div className="mt-5 relative w-full h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />
          <motion.div 
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-40 blur-[1px]" 
          />
        </div>
      </div>

      {/* Responsive Clean Hero Section */}
      <div className="px-4 mb-8">
        <motion.div 
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-premium group flex items-center"
        >
          <div className="relative w-full py-6 px-5 sm:py-8 sm:px-8 flex flex-row items-center justify-between z-10 gap-4 sm:gap-8">
            <div className="flex-1 text-left w-full">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[9px] sm:text-[11px] font-bold uppercase tracking-wider bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 mb-3 sm:mb-5 border border-primary-100 dark:border-primary-500/20"
              >
                <SparklesIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                {t('common.aiPowered')}
              </motion.div>
              
              <h2 className="text-slate-900 dark:text-white text-xl sm:text-4xl font-black mb-2 sm:mb-4 leading-tight font-display max-w-[180px] sm:max-w-[300px]">
                {t('home.heroTitle')}
              </h2>
              
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-4 sm:mb-6 font-medium max-w-[170px] sm:max-w-[280px] line-clamp-2 sm:line-clamp-none leading-relaxed">
                {t('home.heroDescription')}
              </p>
              
            </div>

            {/* Visual Element without gradient */}
            <div className="w-28 h-28 sm:w-56 sm:h-56 relative flex-shrink-0">
              <div className="absolute inset-0 bg-primary-50 dark:bg-slate-800 rounded-full" />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full relative z-10 p-3 sm:p-4"
              >
                <img 
                  src={medicalHeroIcon} 
                  alt="Hero Visual" 
                  className="w-full h-full object-contain drop-shadow-xl sm:drop-shadow-2xl rounded-full"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* PWA Install Prompt */}
      {isInstallable && (
        <div className="px-4 mb-6">
          <GlassCard
            className="bg-gradient-to-r from-indigo-500 to-purple-500 !border-0 text-white overflow-hidden relative"
            onClick={installApp}
            padding="p-0"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
            <div className="p-4 flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                <ArrowDownTrayIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg font-display">{t('pwa.installApp')}</h3>
                <p className="text-white/80 text-sm">{t('pwa.getFullExperience')}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <ChevronRightIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="px-4 mb-6">
        <SectionHeader title={t('dashboard.quickActions')} className="!mb-3 !px-1" />
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <GlassCard
              key={action.id}
              className="relative overflow-hidden !p-3.5 flex flex-col items-start justify-between min-h-[130px] group border-0 shadow-premium hover:shadow-premium-lg"
              onClick={() => navigate(action.path)}
              delay={index * 0.1}
            >
              {/* Background Gradient Blob */}
              <div className={`absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br ${action.gradient} opacity-[0.08] rounded-full blur-2xl group-hover:opacity-[0.15] transition-opacity duration-500`} />

              <div className="w-full flex justify-between items-start mb-2 relative z-10">
                <img
                  src={action.image}
                  alt={action.title}
                  className="w-16 h-16 object-contain drop-shadow-md rounded-2xl transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <div className="relative z-10 w-full">
                <h3 className="font-bold text-gray-900 dark:text-white mb-0.5 font-display leading-tight text-base">
                  {action.title}
                </h3>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Daily Tip */}
      <div className="px-4 mb-8">
        <GlassCard
          className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-100 dark:border-emerald-800/50"
          onClick={() => navigate('/news')}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
              <LightBulbIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1 font-display">
                {t('dashboard.dailyTip')}
              </h3>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80 leading-relaxed font-medium">
                <span className="block">{t('home.hydrationTip')}</span>
                <span className="block mt-0.5">{t('home.drinkWater')}</span>
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* More Services */}
      <div className="px-4 mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white font-display">
            {t('common.moreTools')}
          </h2>
        </div>

        <GlassCard className="!p-0 overflow-hidden border border-gray-100 dark:border-gray-800 shadow-premium">
          <AnimatedList>
            {moreServices.map((service, index) => (
              <div key={service.id}>
                <AnimatedListItem>
                  <button
                    onClick={() => navigate(service.path)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${service.bg} group-hover:scale-105 duration-200`}>
                      <service.icon className={`w-6 h-6 ${service.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className={`font-semibold text-base ${service.id === 'sos' ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                        {service.title}
                      </h4>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                </AnimatedListItem>
                {index < moreServices.length - 1 && (
                  <div className="mx-4 h-px bg-gray-100 dark:bg-gray-800" />
                )}
              </div>
            ))}
          </AnimatedList>
        </GlassCard>
      </div>

      {/* Trust Badges */}
      <div className="px-6 py-4 flex justify-center items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 mb-6">
        <div className="flex flex-col items-center gap-1">
          <ShieldCheckIcon className="w-6 h-6 text-gray-400" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">{t('common.secure')}</span>
        </div>
        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
        <div className="flex flex-col items-center gap-1">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-blue-600">AI</div>
            <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-indigo-600">ML</div>
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">{t('common.smart')}</span>
        </div>
        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
        <div className="flex flex-col items-center gap-1">
          <HeartIcon className="w-6 h-6 text-gray-400" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">{t('common.trusted')}</span>
        </div>
      </div>

    </div>
  );
};

export default Home;