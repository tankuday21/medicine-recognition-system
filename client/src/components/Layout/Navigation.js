import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
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
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navigation = () => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [showSecondaryMenu, setShowSecondaryMenu] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { path: '/', icon: HomeIcon, label: t('navigation.home') },
    { path: '/dashboard', icon: ChartBarIcon, label: t('navigation.dashboard') },
    { path: '/scanner', icon: CameraIcon, label: t('navigation.scanner') },
    { path: '/chat', icon: ChatBubbleLeftRightIcon, label: t('navigation.chat') },
    { path: '/reminders', icon: ClockIcon, label: t('navigation.reminders') }
  ];

  const secondaryNavItems = [
    { path: '/symptoms', icon: HeartIcon, label: t('navigation.symptoms') },
    { path: '/reports', icon: DocumentTextIcon, label: t('navigation.reports') },
    { path: '/sos', icon: ExclamationTriangleIcon, label: t('navigation.sos') },
    { path: '/price-lookup', icon: CurrencyDollarIcon, label: t('navigation.prices') },
    { path: '/news', icon: NewspaperIcon, label: t('navigation.news') }
  ];

  return (
    <>
      {/* Primary Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-pb">
        <div className="max-w-7xl mx-auto px-1 sm:px-4">
          <div className="flex justify-around">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex flex-col items-center py-2 px-1 sm:px-3 text-xs transition-all duration-200 min-w-0 flex-1 touch-target ${
                    isActive
                      ? 'text-blue-600 scale-105'
                      : 'text-gray-600 hover:text-gray-900 active:scale-95'
                  }`
                }
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 mb-1 flex-shrink-0" />
                <span className="truncate text-xs leading-tight max-w-full">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Secondary Navigation - Expandable Menu */}
      {isMobile ? (
        <div className="fixed bottom-16 right-2 sm:right-4" style={{ zIndex: 9999 }}>
          {/* Backdrop */}
          {showSecondaryMenu && (
            <div
              className="fixed inset-0 bg-black bg-opacity-20"
              onClick={() => {
                console.log('Backdrop clicked, closing menu');
                setShowSecondaryMenu(false);
              }}
              aria-hidden="true"
              style={{ 
                bottom: 0, 
                top: 0, 
                left: 0, 
                right: 0,
                zIndex: 9997
              }}
            />
          )}

          {/* Menu Items */}
          {showSecondaryMenu && (
            <div 
              className="absolute bottom-16 right-0 flex flex-col space-y-3"
              style={{
                zIndex: 9998,
                pointerEvents: 'auto'
              }}
              role="menu"
              aria-orientation="vertical"
            >
              {secondaryNavItems.map(({ path, icon: Icon, label }, index) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => {
                    console.log('Menu item clicked:', label);
                    setShowSecondaryMenu(false);
                  }}
                  className="group relative"
                  role="menuitem"
                >
                  <div className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg transition-all duration-200 active:scale-95 touch-target">
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  {/* Label */}
                  <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {label}
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
                  </div>
                </NavLink>
              ))}
            </div>
          )}
          
          {/* Menu Toggle Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const newState = !showSecondaryMenu;
              console.log('Hamburger clicked! Current state:', showSecondaryMenu, '-> New state:', newState);
              setShowSecondaryMenu(newState);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 active:scale-95 touch-target"
            style={{ 
              position: 'relative',
              zIndex: 9999,
              pointerEvents: 'auto',
              cursor: 'pointer',
              touchAction: 'manipulation'
            }}
            aria-label="Toggle secondary menu"
            aria-expanded={showSecondaryMenu}
            type="button"
          >
            {showSecondaryMenu ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      ) : (
        /* Desktop Secondary Navigation - Floating Action Menu */
        <div className="fixed bottom-20 right-4 z-30">
          <div className="flex flex-col space-y-2">
            {secondaryNavItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className="group relative"
              >
                <div className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
                
                {/* Tooltip */}
                <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {label}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;