// Premium Drawer Navigation Component
// Slide-out navigation with smooth animations and medical theming

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { combineClasses, conditionalClasses } from '../../utils/design-system';

// Premium Icons
import {
  Squares2X2Icon,
  UsersIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BeakerIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ChevronRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  HeartIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

import {
  Squares2X2Icon as Squares2X2Solid,
  UsersIcon as UsersSolid,
  CalendarDaysIcon as CalendarSolid,
  DocumentTextIcon as DocumentSolid,
  BeakerIcon as BeakerSolid,
  ChartBarIcon as ChartBarSolid,
  Cog6ToothIcon as CogSolid
} from '@heroicons/react/24/solid';

/**
 * Drawer Navigation Item Component
 * Individual navigation item within the drawer
 */
export const DrawerNavItem = ({
  icon,
  activeIcon,
  label,
  badge,
  isActive = false,
  disabled = false,
  onClick,
  children,
  gradient = 'from-primary-500 to-primary-600',
  className = '',
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = children && React.Children.count(children) > 0;
  const Icon = isActive && activeIcon ? activeIcon : icon;

  const itemClasses = combineClasses(
    'drawer-nav-item group',
    'flex items-center w-full p-3 rounded-xl transition-all duration-200 ease-out',
    'hover:bg-gray-50 dark:hover:bg-slate-800 active:bg-gray-100 dark:active:bg-slate-700',
    isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className
  );

  const handleClick = (e) => {
    if (disabled) return;
    
    if (hasChildren) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    } else {
      onClick?.(e);
    }
  };

  return (
    <div className="drawer-nav-item-container">
      <motion.button
        whileTap={{ scale: 0.98 }}
        className={itemClasses}
        onClick={handleClick}
        disabled={disabled}
        aria-expanded={hasChildren ? isExpanded : undefined}
        {...props}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="drawerActiveIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-600 rounded-r-full"
          />
        )}

        {/* Icon with gradient background */}
        <div className={combineClasses(
          'flex-shrink-0 w-10 h-10 rounded-xl mr-3 flex items-center justify-center transition-all duration-200',
          isActive 
            ? `bg-gradient-to-br ${gradient} text-white shadow-lg` 
            : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-slate-600'
        )}>
          {typeof Icon === 'function' ? <Icon className="w-5 h-5" /> : Icon}
        </div>

        {/* Label */}
        <span className={combineClasses(
          'flex-1 text-left font-medium transition-colors duration-200',
          isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
        )}>
          {label}
        </span>

        {/* Badge */}
        {badge && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex-shrink-0 ml-2 min-w-[24px] h-6 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-2 shadow-lg shadow-red-500/25"
          >
            {badge}
          </motion.div>
        )}

        {/* Expand/Collapse Icon */}
        {hasChildren && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 ml-2 w-5 h-5 text-gray-400"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </motion.div>
        )}
      </motion.button>

      {/* Sub-items */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-12 py-1 space-y-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Drawer Navigation Header Component
 * Header section of the drawer with user info or branding
 */
export const DrawerHeader = ({
  title,
  subtitle,
  avatar,
  onClose,
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700',
    medical: 'bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white',
    dark: 'bg-gray-900 text-white'
  };

  const headerClasses = combineClasses(
    'drawer-header',
    'flex items-center justify-between p-5',
    variantClasses[variant],
    className
  );

  return (
    <div className={headerClasses} {...props}>
      <div className="flex items-center flex-1">
        {/* Avatar */}
        {avatar && (
          <div className="flex-shrink-0 mr-4 relative">
            {typeof avatar === 'string' ? (
              <img
                src={avatar}
                alt="User avatar"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30"
              />
            ) : (
              avatar
            )}
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
        )}

        {/* Title and Subtitle */}
        <div className="flex-1 min-w-0">
          {title && (
            <h2 className={combineClasses(
              'text-lg font-bold truncate',
              variant === 'medical' || variant === 'dark' ? 'text-white' : 'text-gray-900 dark:text-white'
            )}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={combineClasses(
              'text-sm truncate mt-0.5',
              variant === 'medical' || variant === 'dark' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
            )}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>

      {/* Close Button */}
      {onClose && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className={combineClasses(
            'flex-shrink-0 p-2 rounded-xl transition-all duration-200',
            'hover:bg-black/10 dark:hover:bg-white/10',
            variant === 'medical' || variant === 'dark' ? 'text-white' : 'text-gray-500 dark:text-gray-400'
          )}
          aria-label="Close navigation"
        >
          <XMarkIcon className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
};

/**
 * Drawer Navigation Footer Component
 * Footer section with additional actions or information
 */
export const DrawerFooter = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantClasses = {
    default: 'bg-gray-50 border-t border-gray-200',
    medical: 'bg-primary-50 border-t border-primary-200',
    dark: 'bg-gray-800 border-t border-gray-700'
  };

  const footerClasses = combineClasses(
    'drawer-footer',
    'p-4',
    variantClasses[variant],
    className
  );

  return (
    <div className={footerClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Premium Drawer Navigation Component
 * Main drawer container with overlay and animations
 */
const DrawerNavigation = ({
  isOpen = false,
  onClose,
  position = 'left',
  width = 320,
  overlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  enableSwipeGestures = true,
  variant = 'default',
  className = '',
  children,
  // Navigation items support
  navigationItems = [],
  activeItem,
  onItemClick,
  userInfo,
  ...props
}) => {
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle animation state
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, onClose]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose?.();
    }
  };

  // Handle swipe gestures
  useEffect(() => {
    if (!enableSwipeGestures || !isOpen) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      
      const deltaX = currentX - startX;
      const shouldClose = position === 'left' ? deltaX < -50 : deltaX > 50;
      
      if (shouldClose) {
        onClose?.();
        isDragging = false;
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    const drawer = drawerRef.current;
    if (drawer) {
      drawer.addEventListener('touchstart', handleTouchStart, { passive: true });
      drawer.addEventListener('touchmove', handleTouchMove, { passive: true });
      drawer.addEventListener('touchend', handleTouchEnd, { passive: true });

      return () => {
        drawer.removeEventListener('touchstart', handleTouchStart);
        drawer.removeEventListener('touchmove', handleTouchMove);
        drawer.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [enableSwipeGestures, isOpen, onClose, position]);

  // Animation classes
  const overlayClasses = combineClasses(
    'fixed inset-0 z-40 transition-all duration-300 ease-out',
    overlay ? 'bg-black/50 backdrop-blur-sm' : 'pointer-events-none',
    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  );

  const drawerClasses = combineClasses(
    'drawer-navigation',
    'fixed top-0 h-full bg-white shadow-2xl z-50',
    'flex flex-col transition-transform duration-300 ease-out',
    position === 'left' ? 'left-0' : 'right-0',
    position === 'left' 
      ? (isOpen ? 'translate-x-0' : '-translate-x-full')
      : (isOpen ? 'translate-x-0' : 'translate-x-full'),
    className
  );

  const drawerStyle = {
    width: `${width}px`,
    maxWidth: '90vw'
  };

  if (!isOpen && !isAnimating) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={overlayClasses}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        ref={drawerRef}
        className={drawerClasses}
        style={drawerStyle}
        role="navigation"
        aria-label="Navigation menu"
      >
        {/* Render navigation items if provided */}
        {navigationItems.length > 0 ? (
          <>
            {/* User Info Header */}
            {userInfo && (
              <DrawerHeader
                title={userInfo.name}
                subtitle={userInfo.email || userInfo.role}
                avatar={userInfo.avatar}
                onClose={onClose}
                variant={variant}
              />
            )}
            
            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {navigationItems.map((item) => (
                <DrawerNavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                  isActive={activeItem === item.id}
                  onClick={() => onItemClick?.(item.id, item)}
                >
                  {item.children && item.children.map((child) => (
                    <DrawerNavItem
                      key={child.id}
                      icon={child.icon}
                      label={child.label}
                      badge={child.badge}
                      isActive={activeItem === child.id}
                      onClick={() => onItemClick?.(child.id, child)}
                    />
                  ))}
                </DrawerNavItem>
              ))}
            </div>
          </>
        ) : (
          children
        )}
      </nav>
    </>
  );
};

/**
 * Medical Drawer Navigation Component
 * Pre-configured drawer for medical applications
 */
export const MedicalDrawerNavigation = ({
  isOpen = false,
  onClose,
  activeItem,
  onItemClick,
  userInfo,
  showBadges = true,
  className = '',
  ...props
}) => {
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Squares2X2Icon,
      activeIcon: Squares2X2Solid,
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: UsersIcon,
      activeIcon: UsersSolid,
      gradient: 'from-blue-500 to-cyan-500',
      badge: showBadges ? '12' : null
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: CalendarDaysIcon,
      activeIcon: CalendarSolid,
      gradient: 'from-emerald-500 to-teal-500',
      badge: showBadges ? '3' : null
    },
    {
      id: 'medical-records',
      label: 'Medical Records',
      icon: DocumentTextIcon,
      activeIcon: DocumentSolid,
      gradient: 'from-indigo-500 to-blue-500',
      children: [
        { id: 'lab-results', label: 'Lab Results', icon: BeakerIcon, badge: showBadges ? '2' : null },
        { id: 'imaging', label: 'Imaging', icon: DocumentTextIcon },
        { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardDocumentListIcon },
        { id: 'allergies', label: 'Allergies', icon: ShieldCheckIcon }
      ]
    },
    {
      id: 'medications',
      label: 'Medications',
      icon: BeakerIcon,
      activeIcon: BeakerSolid,
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: ChartBarIcon,
      activeIcon: ChartBarSolid,
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Cog6ToothIcon,
      activeIcon: CogSolid,
      gradient: 'from-slate-500 to-gray-500'
    }
  ];

  const handleItemClick = (itemId, item) => {
    onItemClick?.(itemId, item);
    if (!item.children) {
      onClose?.();
    }
  };

  const renderNavItems = (items, level = 0) => {
    return items.map((item) => (
      <DrawerNavItem
        key={item.id}
        icon={item.icon}
        activeIcon={item.activeIcon}
        label={item.label}
        badge={item.badge}
        gradient={item.gradient}
        isActive={activeItem === item.id}
        onClick={() => handleItemClick(item.id, item)}
      >
        {item.children && renderNavItems(item.children, level + 1)}
      </DrawerNavItem>
    ));
  };

  return (
    <DrawerNavigation
      isOpen={isOpen}
      onClose={onClose}
      variant="medical"
      className={className}
      {...props}
    >
      {/* Header */}
      <DrawerHeader
        title={userInfo?.name || 'Medical App'}
        subtitle={userInfo?.role || 'Healthcare Professional'}
        avatar={userInfo?.avatar}
        onClose={onClose}
        variant="medical"
      />

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {renderNavItems(navigationItems)}
      </div>

      {/* Premium Card */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-5 h-5" />
            <span className="font-semibold text-sm">Pro Features</span>
          </div>
          <p className="text-xs text-primary-100 mb-3">
            Unlock advanced analytics and priority support
          </p>
          <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <DrawerFooter variant="default">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Version 2.1.0</span>
          <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
            Help & Support
          </button>
        </div>
      </DrawerFooter>
    </DrawerNavigation>
  );
};

// PropTypes
DrawerNavItem.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]).isRequired,
  activeIcon: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  label: PropTypes.string.isRequired,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isActive: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
  gradient: PropTypes.string,
  className: PropTypes.string
};

DrawerHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  avatar: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'medical', 'dark']),
  className: PropTypes.string,
  children: PropTypes.node
};

DrawerFooter.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'medical', 'dark']),
  className: PropTypes.string
};

DrawerNavigation.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  position: PropTypes.oneOf(['left', 'right']),
  width: PropTypes.number,
  overlay: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  enableSwipeGestures: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'medical', 'dark']),
  className: PropTypes.string,
  children: PropTypes.node,
  navigationItems: PropTypes.array,
  activeItem: PropTypes.string,
  onItemClick: PropTypes.func,
  userInfo: PropTypes.object
};

MedicalDrawerNavigation.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  activeItem: PropTypes.string,
  onItemClick: PropTypes.func,
  userInfo: PropTypes.shape({
    name: PropTypes.string,
    role: PropTypes.string,
    avatar: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
  }),
  showBadges: PropTypes.bool,
  className: PropTypes.string
};

export default DrawerNavigation;