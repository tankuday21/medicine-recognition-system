import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { InstallButton } from '../PWA/InstallPrompt';
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  HomeIcon,
  ChartBarIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  HeartIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  NewspaperIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import {
  BellIcon as BellSolid,
  Cog6ToothIcon as Cog6ToothSolid,
  HomeIcon as HomeSolid,
  ChartBarIcon as ChartBarSolid,
  CameraIcon as CameraSolid,
  ChatBubbleLeftRightIcon as ChatSolid,
  ClockIcon as ClockSolid,
  HeartIcon as HeartSolid,
  DocumentTextIcon as DocumentSolid,
  ExclamationTriangleIcon as SOSSolid,
  CurrencyDollarIcon as PriceSolid,
  NewspaperIcon as NewsSolid,
  UserCircleIcon as UserSolid
} from '@heroicons/react/24/solid';

// Icon mapping for navigation items
const iconMap = {
  home: { outline: HomeIcon, solid: HomeSolid },
  dashboard: { outline: ChartBarIcon, solid: ChartBarSolid },
  scanner: { outline: CameraIcon, solid: CameraSolid },
  chat: { outline: ChatBubbleLeftRightIcon, solid: ChatSolid },
  reminders: { outline: ClockIcon, solid: ClockSolid },
  symptoms: { outline: HeartIcon, solid: HeartSolid },
  reports: { outline: DocumentTextIcon, solid: DocumentSolid },
  sos: { outline: ExclamationTriangleIcon, solid: SOSSolid },
  'price-lookup': { outline: CurrencyDollarIcon, solid: PriceSolid },
  news: { outline: NewspaperIcon, solid: NewsSolid },
  profile: { outline: UserCircleIcon, solid: UserSolid },
  login: { outline: ArrowRightOnRectangleIcon, solid: ArrowRightOnRectangleIcon },
  logout: { outline: ArrowLeftOnRectangleIcon, solid: ArrowLeftOnRectangleIcon },
};

/**
 * Premium Navigation System
 * A complete navigation system with sidebar and premium icons
 */
const NavigationSystem = ({
  title = "Mediot",
  subtitle = "Healthcare AI",
  navigationItems = [],
  onItemClick,
  userInfo,
  children,
  headerActions
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [hasNotifications] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isGuest } = useAuth();
  const { t } = useLanguage();

  // Filter navigation items based on authentication
  const filteredNavItems = navigationItems.filter(item => {
    // Items that require authentication
    const authRequiredItems = ['dashboard', 'reminders', 'reports', 'profile'];
    // Items to hide when authenticated
    const hideWhenAuthItems = ['login'];

    if (authRequiredItems.includes(item.id) && !isAuthenticated && !isGuest) {
      return false;
    }
    if (hideWhenAuthItems.includes(item.id) && (isAuthenticated || isGuest)) {
      return false;
    }
    return true;
  });

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleNavClick = (item) => {
    if (onItemClick) {
      onItemClick(item.id, item);
    } else if (item.path) {
      navigate(item.path);
    }
    if (isMobile) setSidebarOpen(false);
  };

  // Check if item is active
  const isItemActive = (item) => {
    if (item.path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(item.path);
  };

  // Get the correct icon for an item based on active state
  const getItemIcon = (item, isActive) => {
    // First try to get icon from our local iconMap using item.id
    const mappedIcons = iconMap[item.id];
    if (mappedIcons) {
      const Icon = isActive ? mappedIcons.solid : mappedIcons.outline;
      return <Icon className="w-5 h-5" />;
    }

    // Fallback to passed icon prop
    const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;

    if (!Icon) {
      // Return a default placeholder icon
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    }

    // Heroicons are function components, render them directly
    if (typeof Icon === 'function') {
      return <Icon className="w-5 h-5" />;
    }

    // If it's JSX element
    if (React.isValidElement(Icon)) {
      return Icon;
    }

    return null;
  };

  const sidebarWidth = 280;

  return (
    <div className="h-screen bg-gray-50 dark:bg-slate-900 flex overflow-hidden font-sans">

      {/* Mobile Header */}
      {isMobile && (
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-50 px-4 flex items-center justify-between shadow-sm border-b border-gray-200/50 dark:border-slate-700/50"
        >
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </motion.button>
            <div>
              <h1 className="text-lg font-display font-bold text-gray-900 dark:text-white">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 relative transition-colors"
            >
              {hasNotifications ? (
                <BellSolid className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              ) : (
                <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </motion.button>
          </div>
        </motion.header>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || !isMobile) && (
          <>
            {/* Backdrop for mobile */}
            {isMobile && isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              />
            )}

            <motion.aside
              initial={{ x: isMobile ? -300 : 0, width: isMobile ? 280 : (isSidebarOpen ? sidebarWidth : 0) }}
              animate={{ x: 0, width: isMobile ? 280 : (isSidebarOpen ? sidebarWidth : 0) }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed lg:relative inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col shadow-xl lg:shadow-none overflow-hidden"
            >
              {/* Sidebar Header */}
              <div className="h-20 flex items-center px-5 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3 flex-1">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h1 className="font-display font-bold text-lg text-gray-900 dark:text-white leading-none truncate">{title}</h1>
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-0.5 truncate">{subtitle}</p>
                  </div>
                  {isMobile && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {filteredNavItems.map((item) => {
                  const isActive = isItemActive(item);

                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`
                        relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                        ${isActive
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                        }
                        ${item.urgent && !isActive ? 'hover:bg-red-50 dark:hover:bg-red-900/20' : ''}
                      `}
                    >
                      {/* Active indicator - positioned to align with icon center */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-9 bg-gradient-to-b from-primary-500 to-primary-600 rounded-r-full" />
                      )}

                      {/* Icon container with gradient */}
                      <div className={`
                        relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 flex-shrink-0
                        ${isActive
                          ? `bg-gradient-to-br ${item.gradient || 'from-primary-500 to-primary-600'} text-white shadow-lg`
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-slate-600'
                        }
                        ${item.urgent && !isActive ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : ''}
                      `}>
                        {getItemIcon(item, isActive)}

                        {/* Glow effect */}
                        {isActive && (
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.gradient || 'from-primary-500 to-primary-600'} opacity-40 blur-lg -z-10`} />
                        )}
                      </div>

                      {/* Label */}
                      <span className="flex-1 text-left font-medium text-sm truncate">
                        {item.labelKey ? t(item.labelKey) : item.label}
                      </span>

                      {/* Badge */}
                      {item.badge && (
                        <span className={`
                          px-2 py-0.5 text-xs font-bold rounded-full flex-shrink-0
                          ${item.badge === 'AI'
                            ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                            : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </nav>

              {/* Install App Button */}
              <div className="px-3 pb-2">
                <InstallButton className="w-full" />
              </div>

              {/* User Profile with Settings */}
              <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                {(isAuthenticated || isGuest) ? (
                  <motion.div className="flex items-center gap-3 p-2 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-primary-500/25 flex-shrink-0">
                      {isGuest ? (
                        <span>G</span>
                      ) : (
                        user?.avatar ? (
                          <img src={user.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span>{user?.name?.charAt(0) || 'U'}</span>
                        )
                      )}
                    </div>
                    <div className="text-left overflow-hidden flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {isGuest ? 'Guest User' : (user?.name || 'User')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {isGuest ? 'Limited Access' : (user?.email || 'View Profile')}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                      title="Logout"
                    >
                      <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/login')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span className="font-medium">Sign In</span>
                  </motion.button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden min-h-screen">
        {/* Desktop Header */}
        {!isMobile && (
          <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between px-6 z-30 sticky top-0">
            <div className="flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleSidebar}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <Bars3Icon className="w-5 h-5" />
              </motion.button>
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search medicines, symptoms..."
                  className="pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-slate-800 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 w-72 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {headerActions}
              <InstallButton variant="compact" />
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors"
              >
                {hasNotifications ? (
                  <BellSolid className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                ) : (
                  <BellIcon className="w-5 h-5" />
                )}
                {hasNotifications && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </motion.button>
            </div>
          </header>
        )}

        {/* Scrollable Content */}
        <main className={`flex-1 overflow-y-auto ${isMobile ? 'pt-16' : ''} bg-gray-50/50 dark:bg-slate-900/50 p-4 lg:p-6 relative`}>
          {/* Background Decorations */}
          <div className="fixed top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary-50/30 dark:from-primary-900/10 to-transparent pointer-events-none -z-10" />
          <div className="fixed -top-40 -right-40 w-96 h-96 bg-primary-200/20 dark:bg-primary-800/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NavigationSystem;
