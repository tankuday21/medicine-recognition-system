// Premium Drawer Navigation Component
// Slide-out navigation with smooth animations and medical theming

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { combineClasses, conditionalClasses } from '../../utils/design-system';

/**
 * Drawer Navigation Item Component
 * Individual navigation item within the drawer
 */
export const DrawerNavItem = ({
  icon,
  label,
  badge,
  isActive = false,
  disabled = false,
  onClick,
  children,
  className = '',
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = children && React.Children.count(children) > 0;

  const itemClasses = combineClasses(
    'drawer-nav-item group',
    'flex items-center w-full p-4 transition-all duration-200 ease-out',
    'hover:bg-gray-50 active:bg-gray-100',
    isActive ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-500' : 'text-gray-700',
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
      <button
        className={itemClasses}
        onClick={handleClick}
        disabled={disabled}
        aria-expanded={hasChildren ? isExpanded : undefined}
        {...props}
      >
        {/* Icon */}
        <div className={combineClasses(
          'flex-shrink-0 w-6 h-6 mr-3 transition-all duration-200',
          'group-active:scale-90',
          isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
        )}>
          {icon}
        </div>

        {/* Label */}
        <span className={combineClasses(
          'flex-1 text-left font-medium transition-colors duration-200',
          isActive ? 'text-primary-600' : 'text-gray-700'
        )}>
          {label}
        </span>

        {/* Badge */}
        {badge && (
          <div className="flex-shrink-0 ml-2 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-2">
            {badge}
          </div>
        )}

        {/* Expand/Collapse Icon */}
        {hasChildren && (
          <div className={combineClasses(
            'flex-shrink-0 ml-2 w-5 h-5 text-gray-400 transition-transform duration-200',
            isExpanded ? 'rotate-90' : 'rotate-0'
          )}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </button>

      {/* Sub-items */}
      {hasChildren && (
        <div className={combineClasses(
          'overflow-hidden transition-all duration-300 ease-out',
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="pl-9 bg-gray-50/50">
            {children}
          </div>
        </div>
      )}
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
    default: 'bg-white border-b border-gray-200',
    medical: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white',
    dark: 'bg-gray-900 text-white'
  };

  const headerClasses = combineClasses(
    'drawer-header',
    'flex items-center justify-between p-6',
    variantClasses[variant],
    className
  );

  return (
    <div className={headerClasses} {...props}>
      <div className="flex items-center flex-1">
        {/* Avatar */}
        {avatar && (
          <div className="flex-shrink-0 mr-4">
            {typeof avatar === 'string' ? (
              <img
                src={avatar}
                alt="User avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              avatar
            )}
          </div>
        )}

        {/* Title and Subtitle */}
        <div className="flex-1 min-w-0">
          {title && (
            <h2 className={combineClasses(
              'text-lg font-semibold truncate',
              variant === 'medical' || variant === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={combineClasses(
              'text-sm truncate mt-1',
              variant === 'medical' || variant === 'dark' ? 'text-white/80' : 'text-gray-500'
            )}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className={combineClasses(
            'flex-shrink-0 p-2 rounded-lg transition-all duration-200',
            'hover:bg-black/10 active:scale-90',
            variant === 'medical' || variant === 'dark' ? 'text-white' : 'text-gray-500'
          )}
          aria-label="Close navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
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
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      badge: showBadges ? '12' : null
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      badge: showBadges ? '3' : null
    },
    {
      id: 'medical-records',
      label: 'Medical Records',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      children: [
        { id: 'lab-results', label: 'Lab Results', badge: showBadges ? '2' : null },
        { id: 'imaging', label: 'Imaging' },
        { id: 'prescriptions', label: 'Prescriptions' },
        { id: 'allergies', label: 'Allergies' }
      ]
    },
    {
      id: 'medications',
      label: 'Medications',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
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
        label={item.label}
        badge={item.badge}
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
      <div className="flex-1 overflow-y-auto">
        {renderNavItems(navigationItems)}
      </div>

      {/* Footer */}
      <DrawerFooter variant="medical">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Version 2.1.0</span>
          <button className="text-primary-600 hover:text-primary-700 font-medium">
            Help & Support
          </button>
        </div>
      </DrawerFooter>
    </DrawerNavigation>
  );
};

// PropTypes
DrawerNavItem.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isActive: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
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