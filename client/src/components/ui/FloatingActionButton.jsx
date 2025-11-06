// Floating Action Button Component
// Premium FAB with animations and medical-specific variants

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { combineClasses, conditionalClasses } from '../../utils/design-system';

/**
 * Floating Action Button Component
 * Premium FAB with smooth animations and medical theming
 */
const FloatingActionButton = ({
  icon,
  label,
  position = 'bottom-right',
  size = 'md',
  variant = 'primary',
  extended = false,
  hideOnScroll = false,
  className = '',
  onClick,
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

  // Position classes
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6 safe-area-bottom safe-area-right',
    'bottom-left': 'fixed bottom-6 left-6 safe-area-bottom safe-area-left',
    'bottom-center': 'fixed bottom-6 left-1/2 transform -translate-x-1/2 safe-area-bottom',
    'top-right': 'fixed top-6 right-6 safe-area-top safe-area-right',
    'top-left': 'fixed top-6 left-6 safe-area-top safe-area-left'
  };

  // Size classes
  const sizeClasses = {
    sm: extended ? 'h-12 px-4 min-w-12' : 'w-12 h-12',
    md: extended ? 'h-14 px-6 min-w-14' : 'w-14 h-14',
    lg: extended ? 'h-16 px-8 min-w-16' : 'w-16 h-16'
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40',
    secondary: 'bg-white hover:bg-gray-50 text-primary-600 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 border border-gray-200',
    medical: 'medical-gradient shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40',
    emergency: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 animate-pulse hover:animate-none',
    success: 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40'
  };

  // Base classes
  const baseClasses = combineClasses(
    'inline-flex items-center justify-center',
    'rounded-full font-medium',
    'transition-all duration-300 ease-out',
    'transform hover:scale-110 active:scale-95',
    'focus:outline-none focus:ring-4 focus:ring-primary-500/50',
    'backdrop-blur-sm',
    'z-50'
  );

  // Conditional classes
  const conditionalClassNames = conditionalClasses({
    'gap-3': extended && label,
    'opacity-0 scale-75 pointer-events-none': !isVisible,
    'opacity-100 scale-100': isVisible,
  });

  // Combine all classes
  const fabClasses = combineClasses(
    baseClasses,
    positionClasses[position],
    sizeClasses[size],
    variantClasses[variant],
    conditionalClassNames,
    className
  );

  return (
    <button
      className={fabClasses}
      onClick={onClick}
      aria-label={label || 'Floating action button'}
      {...props}
    >
      {/* Icon */}
      <span className={`${iconSizeClasses[size]} flex-shrink-0 transition-transform duration-200`}>
        {icon}
      </span>
      
      {/* Extended label */}
      {extended && label && (
        <span className="text-sm font-semibold whitespace-nowrap">
          {label}
        </span>
      )}
      
      {/* Ripple effect */}
      <span className="absolute inset-0 rounded-full bg-white/20 scale-0 transition-transform duration-300 group-active:scale-100" />
    </button>
  );
};

/**
 * FAB with Speed Dial Menu
 * Expandable FAB with multiple action options
 */
export const SpeedDialFAB = ({
  mainIcon,
  mainLabel = 'Actions',
  actions = [],
  position = 'bottom-right',
  size = 'md',
  variant = 'primary',
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Speed dial actions */}
      {isOpen && (
        <div className={`absolute ${position.includes('bottom') ? 'bottom-20' : 'top-20'} ${position.includes('right') ? 'right-0' : 'left-0'} space-y-3 z-50`}>
          {actions.map((action, index) => (
            <div
              key={index}
              className={`
                transform transition-all duration-300 ease-out
                ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-75'}
              `}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <FloatingActionButton
                icon={action.icon}
                label={action.label}
                size="sm"
                variant={action.variant || 'secondary'}
                extended={true}
                position="static"
                className="relative"
                onClick={(e) => {
                  action.onClick?.(e);
                  setIsOpen(false);
                }}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Main FAB */}
      <FloatingActionButton
        icon={
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              mainIcon
            )}
          </div>
        }
        label={mainLabel}
        position={position}
        size={size}
        variant={variant}
        className={className}
        onClick={toggleOpen}
        {...props}
      />
    </div>
  );
};

FloatingActionButton.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string,
  position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'bottom-center', 'top-right', 'top-left']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'medical', 'emergency', 'success']),
  extended: PropTypes.bool,
  hideOnScroll: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func
};

SpeedDialFAB.propTypes = {
  mainIcon: PropTypes.node.isRequired,
  mainLabel: PropTypes.string,
  actions: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    variant: PropTypes.string
  })),
  position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'bottom-center', 'top-right', 'top-left']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'medical', 'emergency', 'success']),
  className: PropTypes.string
};

export default FloatingActionButton;