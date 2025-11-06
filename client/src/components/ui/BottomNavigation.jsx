// Premium Bottom Navigation Component
// Mobile-first navigation with animations and medical theming

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { combineClasses, conditionalClasses } from '../../utils/design-system';

/**
 * Bottom Navigation Tab Component
 * Individual tab within the bottom navigation
 */
export const BottomNavTab = ({
  icon,
  activeIcon,
  label,
  badge,
  isActive = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const tabClasses = combineClasses(
    'nav-tab group relative',
    'flex flex-col items-center justify-center',
    'min-w-[60px] p-2 rounded-lg transition-all duration-200 ease-out',
    'touch-target',
    isActive 
      ? 'text-primary-600 bg-primary-50' 
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className
  );

  const handleClick = (e) => {
    if (!disabled) {
      onClick?.(e);
    }
  };

  return (
    <button
      className={tabClasses}
      onClick={handleClick}
      disabled={disabled}
      aria-label={label}
      {...props}
    >
      {/* Icon with animation */}
      <div className={combineClasses(
        'relative transition-all duration-200 ease-out',
        'group-active:scale-90',
        isActive ? 'scale-110' : 'group-hover:scale-105'
      )}>
        <div className="w-6 h-6 flex items-center justify-center">
          {isActive && activeIcon ? activeIcon : icon}
        </div>
        
        {/* Badge */}
        {badge && (
          <div className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
            {badge}
          </div>
        )}
      </div>

      {/* Label */}
      <span className={combineClasses(
        'text-xs font-medium mt-1 transition-all duration-200',
        'line-clamp-1 text-center',
        isActive ? 'text-primary-600' : 'text-gray-500'
      )}>
        {label}
      </span>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
      )}
    </button>
  );
};

/**
 * Premium Bottom Navigation Component
 * Main navigation container with tabs
 */
const BottomNavigation = ({
  tabs = [],
  activeTab,
  onTabChange,
  variant = 'default',
  hideOnScroll = false,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll visibility
  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, hideOnScroll]);

  // Variant classes
  const variantClasses = {
    default: 'bg-white border-t border-gray-200 shadow-2xl',
    glass: 'bg-white/80 backdrop-blur-md border-t border-white/20 shadow-2xl',
    medical: 'bg-gradient-to-r from-primary-50 to-white border-t border-primary-200 shadow-2xl shadow-primary-500/10'
  };

  // Base navigation classes
  const navClasses = combineClasses(
    'nav-bottom',
    'fixed bottom-0 left-0 right-0 z-50',
    'transition-all duration-300 ease-out',
    'safe-area-bottom',
    variantClasses[variant],
    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
    className
  );

  return (
    <nav className={navClasses} {...props}>
      <div className="flex justify-around items-center px-2 py-1">
        {tabs.map((tab, index) => (
          <BottomNavTab
            key={tab.id || index}
            icon={tab.icon}
            activeIcon={tab.activeIcon}
            label={tab.label}
            badge={tab.badge}
            isActive={activeTab === tab.id}
            disabled={tab.disabled}
            onClick={() => onTabChange?.(tab.id, tab)}
          />
        ))}
      </div>
    </nav>
  );
};

/**
 * Medical Bottom Navigation Component
 * Pre-configured navigation for medical applications
 */
export const MedicalBottomNavigation = ({
  activeTab,
  onTabChange,
  showBadges = true,
  className = '',
  ...props
}) => {
  const medicalTabs = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )
    },
    {
      id: 'scan',
      label: 'Scan',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12v4m6-4h2M6 12H4m6 8h.01M12 20h4.01M12 20H7.99" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4a1 1 0 011-1h3zm-1 2v1h-1V5h1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      ),
      badge: showBadges ? '3' : null
    },
    {
      id: 'medications',
      label: 'Meds',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      badge: showBadges ? '2' : null
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM8 7a4 4 0 118 0 4 4 0 01-8 0zm9.447 10.895A8.963 8.963 0 0112 20a8.963 8.963 0 01-5.447-1.895 6 6 0 0110.894 0z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  return (
    <BottomNavigation
      tabs={medicalTabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      variant="medical"
      className={className}
      {...props}
    />
  );
};

// PropTypes
BottomNavTab.propTypes = {
  icon: PropTypes.node.isRequired,
  activeIcon: PropTypes.node,
  label: PropTypes.string.isRequired,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isActive: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
};

BottomNavigation.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.node.isRequired,
    activeIcon: PropTypes.node,
    label: PropTypes.string.isRequired,
    badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    disabled: PropTypes.bool
  })).isRequired,
  activeTab: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onTabChange: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'glass', 'medical']),
  hideOnScroll: PropTypes.bool,
  className: PropTypes.string
};

MedicalBottomNavigation.propTypes = {
  activeTab: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onTabChange: PropTypes.func,
  showBadges: PropTypes.bool,
  className: PropTypes.string
};

export default BottomNavigation;