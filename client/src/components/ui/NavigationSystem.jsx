// Premium Navigation System Component
// Combines hamburger menu, drawer navigation, and responsive behavior

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';
import { useResponsiveNavigation } from '../../hooks/useResponsiveNavigation';
import HamburgerMenu, { MedicalHamburgerMenu } from './HamburgerMenu';
import DrawerNavigation, { MedicalDrawerNavigation } from './DrawerNavigation';

/**
 * Navigation Header Component
 * Top header with hamburger menu and title
 */
export const NavigationHeader = ({
  title,
  subtitle,
  logo,
  actions,
  showHamburger = true,
  hamburgerProps = {},
  variant = 'default',
  sticky = true,
  className = '',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white border-b border-gray-200 shadow-sm',
    medical: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg',
    glass: 'bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm',
    dark: 'bg-gray-900 text-white border-b border-gray-700'
  };

  const headerClasses = combineClasses(
    'navigation-header',
    'flex items-center justify-between px-4 py-3',
    'transition-all duration-200 ease-out',
    'safe-area-top',
    sticky ? 'sticky top-0 z-40' : 'relative',
    variantClasses[variant],
    className
  );

  return (
    <header className={headerClasses} {...props}>
      {/* Left Section */}
      <div className="flex items-center flex-1 min-w-0">
        {/* Hamburger Menu */}
        {showHamburger && (
          <div className="flex-shrink-0 mr-3">
            {variant === 'medical' ? (
              <MedicalHamburgerMenu
                variant="ghost"
                size="sm"
                {...hamburgerProps}
              />
            ) : (
              <HamburgerMenu
                variant="ghost"
                size="sm"
                {...hamburgerProps}
              />
            )}
          </div>
        )}

        {/* Logo */}
        {logo && (
          <div className="flex-shrink-0 mr-3">
            {typeof logo === 'string' ? (
              <img src={logo} alt="Logo" className="h-8 w-auto" />
            ) : (
              logo
            )}
          </div>
        )}

        {/* Title and Subtitle */}
        <div className="flex-1 min-w-0">
          {title && (
            <h1 className={combineClasses(
              'text-lg font-semibold truncate',
              variant === 'medical' || variant === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p className={combineClasses(
              'text-sm truncate',
              variant === 'medical' || variant === 'dark' ? 'text-white/80' : 'text-gray-500'
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Section */}
      {(actions || children) && (
        <div className="flex items-center space-x-2 flex-shrink-0">
          {actions}
          {children}
        </div>
      )}
    </header>
  );
};

/**
 * Premium Navigation System Component
 * Complete navigation system with responsive behavior
 */
const NavigationSystem = ({
  // Header props
  title,
  subtitle,
  logo,
  headerActions,
  headerVariant = 'default',
  showHeader = true,
  stickyHeader = true,

  // Drawer props
  drawerWidth = 320,
  drawerPosition = 'left',
  drawerVariant = 'default',
  navigationItems = [],
  activeItem,
  onItemClick,

  // Behavior props
  defaultOpen = false,
  closeOnItemClick = true,
  enableSwipeGestures = true,
  enableKeyboardShortcuts = true,

  // User info
  userInfo,

  // Styling
  className = '',
  children,
  ...props
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(defaultOpen);
  const { isMobile, isTablet } = useResponsiveNavigation();

  // Handle drawer toggle
  const handleDrawerToggle = (e) => {
    e?.stopPropagation();
    setIsDrawerOpen((prevState) => {
      console.log('NavigationSystem: Drawer toggle clicked! Current state:', prevState, '-> New state:', !prevState);
      return !prevState;
    });
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  // Handle navigation item click
  const handleItemClick = (itemId, item) => {
    onItemClick?.(itemId, item);
    
    if (closeOnItemClick && !item.children) {
      setIsDrawerOpen(false);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e) => {
      // Toggle drawer with Ctrl/Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        handleDrawerToggle();
      }
      
      // Close drawer with Escape
      if (e.key === 'Escape' && isDrawerOpen) {
        handleDrawerClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, isDrawerOpen]);

  // Auto-close drawer on mobile when clicking outside
  useEffect(() => {
    if (!isMobile || !isDrawerOpen) return;

    const handleClickOutside = (e) => {
      // Check if click is outside drawer area
      const drawer = document.querySelector('.drawer-navigation');
      if (drawer && !drawer.contains(e.target)) {
        handleDrawerClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, isDrawerOpen]);

  const containerClasses = combineClasses(
    'navigation-system',
    'relative min-h-screen',
    className
  );

  return (
    <div className={containerClasses} {...props}>
      {/* Navigation Header */}
      {showHeader && (
        <NavigationHeader
          title={title}
          subtitle={subtitle}
          logo={logo}
          actions={headerActions}
          variant={headerVariant}
          sticky={stickyHeader}
          hamburgerProps={{
            isOpen: isDrawerOpen,
            onClick: handleDrawerToggle
          }}
        />
      )}

      {/* Drawer Navigation */}
      <DrawerNavigation
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        position={drawerPosition}
        width={drawerWidth}
        variant={drawerVariant}
        enableSwipeGestures={enableSwipeGestures}
        navigationItems={navigationItems}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        userInfo={userInfo}
      />

      {/* Main Content Area */}
      <main className={combineClasses(
        'navigation-content',
        'transition-all duration-300 ease-out',
        showHeader ? 'pt-0' : 'pt-0'
      )}>
        {children}
      </main>
    </div>
  );
};

/**
 * Medical Navigation System Component
 * Pre-configured navigation system for medical applications
 */
export const MedicalNavigationSystem = ({
  title = 'Medical App',
  subtitle,
  userInfo,
  activeItem,
  onItemClick,
  showNotifications = true,
  notificationCount = 0,
  headerActions,
  className = '',
  children,
  ...props
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerToggle = (e) => {
    e?.stopPropagation();
    setIsDrawerOpen((prevState) => {
      console.log('MedicalNavigationSystem: Drawer toggle clicked! Current state:', prevState, '-> New state:', !prevState);
      return !prevState;
    });
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleItemClick = (itemId, item) => {
    onItemClick?.(itemId, item);
    if (!item.children) {
      setIsDrawerOpen(false);
    }
  };

  // Default header actions for medical app
  const defaultHeaderActions = (
    <div className="flex items-center space-x-2">
      {/* Search Button */}
      <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Notifications */}
      <div className="relative">
        <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        {showNotifications && notificationCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {notificationCount > 99 ? '99+' : notificationCount}
          </div>
        )}
      </div>

      {/* User Avatar */}
      <button className="p-1 hover:bg-white/10 rounded-lg transition-all duration-200">
        {userInfo?.avatar ? (
          <img
            src={userInfo.avatar}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </button>
    </div>
  );

  return (
    <div className={combineClasses('medical-navigation-system', className)}>
      {/* Medical Header */}
      <NavigationHeader
        title={title}
        subtitle={subtitle}
        variant="medical"
        sticky={true}
        actions={headerActions || defaultHeaderActions}
        hamburgerProps={{
          isOpen: isDrawerOpen,
          onClick: handleDrawerToggle,
          showNotification: showNotifications,
          notificationCount: notificationCount
        }}
        showHamburger={true}
      />

      {/* Medical Drawer */}
      <MedicalDrawerNavigation
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        userInfo={userInfo}
        showBadges={true}
      />

      {/* Main Content */}
      <main className="medical-content">
        {children}
      </main>
    </div>
  );
};

/**
 * Navigation Content Wrapper Component
 * Provides proper spacing and layout for main content
 */
export const NavigationContent = ({
  padding = 'default',
  maxWidth = 'full',
  centered = false,
  className = '',
  children,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  const contentClasses = combineClasses(
    'navigation-content-wrapper',
    paddingClasses[padding],
    maxWidthClasses[maxWidth],
    centered ? 'mx-auto' : '',
    className
  );

  return (
    <div className={contentClasses} {...props}>
      {children}
    </div>
  );
};

// PropTypes
NavigationHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  logo: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  actions: PropTypes.node,
  showHamburger: PropTypes.bool,
  hamburgerProps: PropTypes.object,
  variant: PropTypes.oneOf(['default', 'medical', 'glass', 'dark']),
  sticky: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node
};

NavigationSystem.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  logo: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  headerActions: PropTypes.node,
  headerVariant: PropTypes.oneOf(['default', 'medical', 'glass', 'dark']),
  showHeader: PropTypes.bool,
  stickyHeader: PropTypes.bool,
  drawerWidth: PropTypes.number,
  drawerPosition: PropTypes.oneOf(['left', 'right']),
  drawerVariant: PropTypes.oneOf(['default', 'medical', 'dark']),
  navigationItems: PropTypes.array,
  activeItem: PropTypes.string,
  onItemClick: PropTypes.func,
  defaultOpen: PropTypes.bool,
  closeOnItemClick: PropTypes.bool,
  enableSwipeGestures: PropTypes.bool,
  enableKeyboardShortcuts: PropTypes.bool,
  userInfo: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.node
};

MedicalNavigationSystem.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  userInfo: PropTypes.object,
  activeItem: PropTypes.string,
  onItemClick: PropTypes.func,
  showNotifications: PropTypes.bool,
  notificationCount: PropTypes.number,
  headerActions: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node
};

NavigationContent.propTypes = {
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg']),
  maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  centered: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node
};

export default NavigationSystem;