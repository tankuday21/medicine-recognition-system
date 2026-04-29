// Premium Sidebar Component
// Beautiful sidebar with premium icons and animations

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon as HomeOutline,
  ChartBarIcon as ChartBarOutline,
  CameraIcon as CameraOutline,
  ChatBubbleLeftRightIcon as ChatOutline,
  ClockIcon as ClockOutline,
  HeartIcon as HeartOutline,
  DocumentTextIcon as DocumentOutline,
  ExclamationTriangleIcon as SOSOutline,
  CurrencyDollarIcon as PriceOutline,
  NewspaperIcon as NewsOutline,
  Cog6ToothIcon as SettingsOutline,
  UserCircleIcon as ProfileOutline,
  BellIcon as BellOutline,
  QuestionMarkCircleIcon as HelpOutline,
  ArrowLeftOnRectangleIcon as LogoutOutline,
  SparklesIcon,
  ShieldCheckIcon,
  BeakerIcon,
  CalendarDaysIcon,
  MapPinIcon,
  PhoneIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

import {
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
  Cog6ToothIcon as SettingsSolid,
  UserCircleIcon as ProfileSolid,
  BellIcon as BellSolid
} from '@heroicons/react/24/solid';

// Navigation items with premium icons
const navigationItems = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { 
        path: '/', 
        label: 'Home', 
        icon: HomeOutline, 
        activeIcon: HomeSolid,
        gradient: 'from-blue-500 to-cyan-500'
      },
      { 
        path: '/dashboard', 
        label: 'Dashboard', 
        icon: ChartBarOutline, 
        activeIcon: ChartBarSolid,
        gradient: 'from-violet-500 to-purple-500'
      },
      { 
        path: '/scanner', 
        label: 'Smart Scanner', 
        icon: CameraOutline, 
        activeIcon: CameraSolid,
        gradient: 'from-emerald-500 to-teal-500',
        badge: 'AI'
      },
    ]
  },
  {
    id: 'health',
    label: 'Health Tools',
    items: [
      { 
        path: '/chat', 
        label: 'AI Assistant', 
        icon: ChatOutline, 
        activeIcon: ChatSolid,
        gradient: 'from-pink-500 to-rose-500'
      },
      { 
        path: '/reminders', 
        label: 'Reminders', 
        icon: ClockOutline, 
        activeIcon: ClockSolid,
        gradient: 'from-amber-500 to-orange-500',
        badge: '3'
      },
      { 
        path: '/symptoms', 
        label: 'Symptom Tracker', 
        icon: HeartOutline, 
        activeIcon: HeartSolid,
        gradient: 'from-red-500 to-pink-500'
      },
      { 
        path: '/reports', 
        label: 'Health Reports', 
        icon: DocumentOutline, 
        activeIcon: DocumentSolid,
        gradient: 'from-indigo-500 to-blue-500'
      },
    ]
  },
  {
    id: 'services',
    label: 'Services',
    items: [
      { 
        path: '/sos', 
        label: 'Emergency SOS', 
        icon: SOSOutline, 
        activeIcon: SOSSolid,
        gradient: 'from-red-600 to-red-500',
        urgent: true
      },
      { 
        path: '/price-lookup', 
        label: 'Price Lookup', 
        icon: PriceOutline, 
        activeIcon: PriceSolid,
        gradient: 'from-green-500 to-emerald-500'
      },
      { 
        path: '/news', 
        label: 'Health News', 
        icon: NewsOutline, 
        activeIcon: NewsSolid,
        gradient: 'from-slate-500 to-gray-500'
      },
    ]
  }
];

const bottomItems = [
  { path: '/profile', label: 'Profile', icon: ProfileOutline, activeIcon: ProfileSolid, gradient: 'from-blue-500 to-indigo-500' },
  { path: '/settings', label: 'Settings', icon: SettingsOutline, activeIcon: SettingsSolid, gradient: 'from-gray-500 to-slate-500' },
];

// Sidebar Nav Item Component
const SidebarNavItem = ({ item, isCollapsed, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const Icon = isActive ? item.activeIcon : item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) => `
        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-200 ease-out
        ${isActive 
          ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/20 text-primary-700 dark:text-primary-300 shadow-sm' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
        }
        ${item.urgent ? 'hover:bg-red-50 dark:hover:bg-red-900/20' : ''}
      `}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-600 rounded-r-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Icon with gradient background on hover/active */}
      <div className={`
        relative flex items-center justify-center w-9 h-9 rounded-xl
        transition-all duration-200
        ${isActive 
          ? `bg-gradient-to-br ${item.gradient || 'from-primary-500 to-primary-600'} text-white shadow-lg` 
          : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-slate-600'
        }
        ${item.urgent && !isActive ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : ''}
      `}>
        <Icon className="w-5 h-5" />
        
        {/* Glow effect for active */}
        {isActive && (
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.gradient || 'from-primary-500 to-primary-600'} opacity-40 blur-lg -z-10`} />
        )}
      </div>

      {/* Label */}
      {!isCollapsed && (
        <span className="flex-1 font-medium text-sm truncate">
          {item.label}
        </span>
      )}

      {/* Badge */}
      {!isCollapsed && item.badge && (
        <span className={`
          px-2 py-0.5 text-xs font-bold rounded-full
          ${item.badge === 'AI' 
            ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white' 
            : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
          }
        `}>
          {item.badge}
        </span>
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="
          absolute left-full ml-3 px-3 py-2 
          bg-gray-900 dark:bg-slate-700 text-white text-sm font-medium 
          rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 whitespace-nowrap z-50
          shadow-xl
        ">
          {item.label}
          {item.badge && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/20 rounded">
              {item.badge}
            </span>
          )}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900 dark:border-r-slate-700" />
        </div>
      )}
    </NavLink>
  );
};

// Section Header Component
const SectionHeader = ({ label, isCollapsed }) => {
  if (isCollapsed) return <div className="h-4" />;
  
  return (
    <div className="px-3 py-2 mt-4 first:mt-0">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </span>
    </div>
  );
};

// Main Premium Sidebar Component
const PremiumSidebar = ({ 
  isOpen = true, 
  onClose, 
  isCollapsed = false,
  onToggleCollapse,
  user,
  className = '' 
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`
        flex items-center gap-3 p-4 border-b border-gray-200 dark:border-slate-700
        ${isCollapsed ? 'justify-center' : ''}
      `}>
        {/* Logo */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/25"
        >
          <BeakerIcon className="w-6 h-6 text-white" />
        </motion.div>
        
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-display font-bold text-gray-900 dark:text-white truncate">
              Mediot
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Health Companion
            </p>
          </div>
        )}

        {/* Close button for mobile */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Info */}
      {user && !isCollapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-100 dark:ring-primary-900"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email || 'Premium Member'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navigationItems.map((section) => (
          <div key={section.id}>
            <SectionHeader label={section.label} isCollapsed={isCollapsed} />
            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarNavItem 
                  key={item.path} 
                  item={item} 
                  isCollapsed={isCollapsed}
                  onClick={isMobile ? onClose : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-200 dark:border-slate-700 space-y-1">
        {bottomItems.map((item) => (
          <SidebarNavItem 
            key={item.path} 
            item={item} 
            isCollapsed={isCollapsed}
            onClick={isMobile ? onClose : undefined}
          />
        ))}
        
        {/* Collapse Toggle (Desktop) */}
        {!isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="
              w-full flex items-center justify-center gap-3 px-3 py-2.5 mt-2
              text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 
              rounded-xl transition-all duration-200
            "
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </motion.div>
            {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>
        )}
      </div>

      {/* Premium Badge */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="w-5 h-5" />
              <span className="font-semibold text-sm">Premium</span>
            </div>
            <p className="text-xs text-primary-100 mb-3">
              Unlock all features and get priority support
            </p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Mobile Sidebar (Drawer)
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={onClose}
            />
            
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`
                fixed left-0 top-0 h-full w-72 
                bg-white dark:bg-slate-900 
                shadow-2xl z-50
                ${className}
              `}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop Sidebar
  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.2 }}
      className={`
        hidden lg:flex flex-col h-screen
        bg-white dark:bg-slate-900 
        border-r border-gray-200 dark:border-slate-700
        ${className}
      `}
    >
      {sidebarContent}
    </motion.aside>
  );
};

export default PremiumSidebar;
