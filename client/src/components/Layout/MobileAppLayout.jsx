/**
 * World-Class Mobile PWA Layout
 * Native app experience with bottom tabs, no hamburger menu
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLayout } from '../../contexts/LayoutContext';
import { usePWA, useStandalone } from '../../hooks/usePWA';
import {
  HomeIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Cog6ToothIcon,
  BellIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { PremiumLoading } from '../ui/PremiumComponents';
import {
  HomeIcon as HomeSolid,
  CameraIcon as CameraSolid,
  ChatBubbleLeftRightIcon as ChatSolid,
  ClockIcon as ClockSolid,
  UserCircleIcon as UserSolid
} from '@heroicons/react/24/solid';

// Bottom navigation configuration
const bottomNavItems = [
  {
    id: 'home',
    path: '/',
    icon: HomeIcon,
    activeIcon: HomeSolid,
    labelKey: 'nav.home',
    color: 'blue'
  },
  {
    id: 'chat',
    path: '/chat',
    icon: ChatBubbleLeftRightIcon,
    activeIcon: ChatSolid,
    labelKey: 'nav.aiAssistant',
    color: 'violet'
  },
  {
    id: 'scanner',
    path: '/scanner',
    icon: CameraIcon,
    activeIcon: CameraSolid,
    labelKey: 'nav.scanner',
    color: 'emerald',
    isMain: true // Center action button
  },
  {
    id: 'reminders',
    path: '/reminders',
    icon: ClockIcon,
    activeIcon: ClockSolid,
    labelKey: 'nav.reminders',
    color: 'amber'
  },
  {
    id: 'profile',
    path: '/profile',
    icon: UserCircleIcon,
    activeIcon: UserSolid,
    labelKey: 'nav.profile',
    color: 'rose'
  },
];

// Pages that need special header treatment
const pageConfig = {
  '/': { title: 'Mediot', showSearch: true, showNotification: true },
  '/dashboard': { title: 'nav.dashboard', showBack: true },
  '/scanner': { title: 'nav.scanner', showBack: false, minimal: true },
  '/chat': { title: 'nav.aiAssistant', showBack: false, hideNav: true, minimal: true },
  '/reminders': { title: 'nav.reminders', showBack: false, showAdd: true },
  '/symptoms': { title: 'nav.symptoms', showBack: true },
  '/reports': { title: 'nav.reports', showBack: true },
  '/sos': { title: 'nav.emergencySOS', showBack: true, urgent: true, hideNav: true },
  '/price-lookup': { title: 'nav.priceLookup', showBack: true },
  '/news': { title: 'nav.healthNews', showBack: true },
  '/profile': { title: 'nav.profile', showBack: false, minimal: true },
  '/medicine-result': { title: 'Scan Result', minimal: true, hideNav: true },
  '/pill-result': { title: 'Scan Result', minimal: true, hideNav: true },
  '/barcode-result': { title: 'Scan Result', minimal: true, hideNav: true },
  '/login': { hidden: true },
  '/register': { hidden: true },
};

const MobileAppLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { t, language, isLoading } = useLanguage();
  const { isInstallable } = usePWA();
  const isStandalone = useStandalone();
  const { hideBottomNav } = useLayout();

  const [scrolled, setScrolled] = useState(false);
  const [localHideNav, setLocalHideNav] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get current page config
  const currentConfig = useMemo(() => {
    const exactMatch = pageConfig[location.pathname];
    if (exactMatch) return exactMatch;

    // Check for partial matches (e.g., /medicine-result)
    const partialMatch = Object.entries(pageConfig).find(([path]) =>
      path !== '/' && location.pathname.startsWith(path)
    );
    return partialMatch ? { ...partialMatch[1], showBack: true } : { title: 'Mediot', showBack: true };
  }, [location.pathname]);

  // Handle scroll
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setScrolled(currentScrollY > 20);

          // Hide nav on scroll down (only after 150px), show on scroll up
          if (currentScrollY > lastScrollY && currentScrollY > 150) {
            setLocalHideNav(true);
          } else if (currentScrollY < lastScrollY) {
            setLocalHideNav(false);
          }
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Combined hide logic
  const shouldHideNav = currentConfig.hideNav || localHideNav || hideBottomNav;

  // Check if route is active
  const isActive = useCallback((path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  // Get page title
  const getTitle = useCallback(() => {
    if (currentConfig.title === 'Mediot') return 'Mediot';
    return currentConfig.title?.startsWith('nav.') ? t(currentConfig.title) : currentConfig.title;
  }, [currentConfig.title, t]);

  // Global Language Loading State
  if (isLoading) {
    return <PremiumLoading fullScreen text="Initializing Language..." />;
  }

  // Hide layout on auth pages
  if (currentConfig.hidden) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* ... (rest of the component) */}

      {/* Main Content */}
      <main
        style={{
          paddingBottom: shouldHideNav ? '0' : 'calc(5rem + env(safe-area-inset-bottom))'
        }}
      >
        <div key={location.pathname} className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* ... (Bottom Nav and FAB) */}


      {/* Bottom Navigation */}
      {!shouldHideNav && (
        <motion.nav
          initial={{ y: 0 }}
          animate={{ y: shouldHideNav ? 100 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          {/* Glass background */}
          <div
            className="absolute inset-0 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-slate-700/50"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          />

          {/* Nav items */}
          <div
            className="relative flex items-end justify-around px-2"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
          >
            {bottomNavItems.map((item, index) => {
              const active = isActive(item.path);
              const Icon = active ? item.activeIcon : item.icon;

              // Center scanner button (elevated)
              if (item.isMain) {
                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(item.path)}
                    className="relative -mt-4 flex flex-col items-center"
                  >
                    <motion.div
                      animate={{
                        scale: active ? 1 : 1,
                        boxShadow: active
                          ? '0 8px 30px rgba(16, 185, 129, 0.4)'
                          : '0 4px 20px rgba(16, 185, 129, 0.3)'
                      }}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${active
                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                        : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                        }`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <span className={`text-[10px] mt-1 font-medium ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                      {t(item.labelKey)}
                    </span>
                  </motion.button>
                );
              }

              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(item.path)}
                  className="relative flex flex-col items-center py-2 px-3 min-w-[64px]"
                >
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute -top-0.5 w-8 h-1 bg-blue-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  <motion.div
                    animate={{ scale: active ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <Icon className={`w-6 h-6 ${active
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500'
                      }`} />
                  </motion.div>

                  <span className={`text-[10px] mt-1 font-medium transition-colors ${active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-500'
                    }`}>
                    {t(item.labelKey)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.nav>
      )}

      {/* Quick Actions FAB - Only on Home */}
      {location.pathname === '/' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="fixed right-4 z-40"
          style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/sos')}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/40 flex items-center justify-center"
          >
            <ExclamationTriangleIcon className="w-7 h-7" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default MobileAppLayout;