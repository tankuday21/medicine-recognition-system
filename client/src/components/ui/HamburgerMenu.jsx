// Premium Hamburger Menu Component
// Animated hamburger button with smooth transitions

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';

/**
 * Animated Hamburger Icon Component
 * Three-line hamburger that animates to X when active
 */
export const HamburgerIcon = ({
  isOpen = false,
  size = 'md',
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const iconClasses = combineClasses(
    'hamburger-icon',
    sizeClasses[size],
    'transition-all duration-300 ease-out',
    className
  );

  return (
    <svg
      className={iconClasses}
      fill="none"
      stroke={color}
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Top line */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        d={isOpen ? "M6 6l12 12" : "M4 6h16"}
        className="transition-all duration-300 ease-out"
      />
      
      {/* Middle line */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        d="M4 12h16"
        className={combineClasses(
          'transition-all duration-300 ease-out',
          isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
        )}
      />
      
      {/* Bottom line */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        d={isOpen ? "M6 18l12-12" : "M4 18h16"}
        className="transition-all duration-300 ease-out"
      />
    </svg>
  );
};

/**
 * Premium Hamburger Menu Button Component
 * Interactive button with hover effects and accessibility
 */
const HamburgerMenu = ({
  isOpen = false,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label = 'Menu',
  className = '',
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Variant styles
  const variantClasses = {
    default: 'bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 hover:shadow-md',
    primary: 'bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600 hover:shadow-xl',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    medical: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl'
  };

  // Size styles
  const sizeClasses = {
    sm: 'p-2 rounded-lg',
    md: 'p-3 rounded-xl',
    lg: 'p-4 rounded-xl'
  };

  const buttonClasses = combineClasses(
    'hamburger-menu-button group',
    'relative flex items-center justify-center',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    'active:scale-95',
    'touch-target',
    variantClasses[variant],
    sizeClasses[size],
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    isPressed ? 'scale-95' : 'scale-100',
    className
  );

  const handleClick = (e) => {
    console.log('HamburgerMenu: Button clicked!', { disabled, isOpen, hasOnClick: !!onClick });
    if (!disabled) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      onClick?.(e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      role="button"
      {...props}
    >
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-inherit overflow-hidden">
        <div className={combineClasses(
          'absolute inset-0 bg-white/20 rounded-inherit transition-all duration-300',
          'scale-0 group-active:scale-100 opacity-0 group-active:opacity-100'
        )} />
      </div>

      {/* Icon and Label Container */}
      <div className="relative flex items-center">
        <HamburgerIcon
          isOpen={isOpen}
          size={size}
          color="currentColor"
        />
        
        {showLabel && (
          <span className={combineClasses(
            'ml-2 font-medium transition-all duration-200',
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
          )}>
            {isOpen ? 'Close' : label}
          </span>
        )}
      </div>

      {/* Loading indicator (optional) */}
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
        </div>
      )}
    </button>
  );
};

/**
 * Floating Hamburger Menu Component
 * Floating action button style hamburger menu
 */
export const FloatingHamburgerMenu = ({
  isOpen = false,
  onClick,
  position = 'top-left',
  className = '',
  ...props
}) => {
  const positionClasses = {
    'top-left': 'fixed top-4 left-4 z-50',
    'top-right': 'fixed top-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50'
  };

  const floatingClasses = combineClasses(
    'floating-hamburger-menu',
    positionClasses[position],
    'safe-area-inset',
    className
  );

  return (
    <div className={floatingClasses}>
      <HamburgerMenu
        isOpen={isOpen}
        onClick={onClick}
        variant="primary"
        size="md"
        className="shadow-2xl shadow-primary-500/30"
        {...props}
      />
    </div>
  );
};

/**
 * Medical Hamburger Menu Component
 * Pre-styled hamburger menu for medical applications
 */
export const MedicalHamburgerMenu = ({
  isOpen = false,
  onClick,
  showNotification = false,
  notificationCount = 0,
  className = '',
  ...props
}) => {
  return (
    <div className="relative">
      <HamburgerMenu
        isOpen={isOpen}
        onClick={onClick}
        variant="medical"
        size="md"
        className={combineClasses(
          'shadow-lg shadow-primary-500/20',
          className
        )}
        {...props}
      />
      
      {/* Notification Badge */}
      {showNotification && notificationCount > 0 && (
        <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 shadow-lg">
          {notificationCount > 99 ? '99+' : notificationCount}
        </div>
      )}
    </div>
  );
};

/**
 * Hamburger Menu with Breadcrumb Component
 * Combines hamburger menu with breadcrumb navigation
 */
export const HamburgerMenuWithBreadcrumb = ({
  isOpen = false,
  onClick,
  breadcrumbs = [],
  onBreadcrumbClick,
  className = '',
  ...props
}) => {
  return (
    <div className={combineClasses(
      'flex items-center space-x-3',
      className
    )}>
      <HamburgerMenu
        isOpen={isOpen}
        onClick={onClick}
        variant="ghost"
        size="sm"
        {...props}
      />
      
      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id || index}>
              {index > 0 && (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              <button
                onClick={() => onBreadcrumbClick?.(crumb, index)}
                className={combineClasses(
                  'transition-colors duration-200',
                  index === breadcrumbs.length - 1
                    ? 'text-gray-900 font-medium cursor-default'
                    : 'text-gray-500 hover:text-gray-700 cursor-pointer'
                )}
                disabled={index === breadcrumbs.length - 1}
              >
                {crumb.label}
              </button>
            </React.Fragment>
          ))}
        </nav>
      )}
    </div>
  );
};

// PropTypes
HamburgerIcon.propTypes = {
  isOpen: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.string,
  strokeWidth: PropTypes.number,
  className: PropTypes.string
};

HamburgerMenu.propTypes = {
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'ghost', 'medical']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showLabel: PropTypes.bool,
  label: PropTypes.string,
  className: PropTypes.string
};

FloatingHamburgerMenu.propTypes = {
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  className: PropTypes.string
};

MedicalHamburgerMenu.propTypes = {
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
  showNotification: PropTypes.bool,
  notificationCount: PropTypes.number,
  className: PropTypes.string
};

HamburgerMenuWithBreadcrumb.propTypes = {
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
  breadcrumbs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string.isRequired
  })),
  onBreadcrumbClick: PropTypes.func,
  className: PropTypes.string
};

export default HamburgerMenu;