// Premium Drawer Component
// Slide-out navigation drawer with animations and medical theming

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { combineClasses, conditionalClasses } from '../../utils/design-system';

/**
 * Premium Drawer Component
 * Slide-out navigation panel with backdrop and animations
 */
const Drawer = ({
  isOpen = false,
  onClose,
  position = 'left',
  size = 'md',
  variant = 'default',
  backdrop = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  children,
  className = '',
  ...props
}) => {
  const drawerRef = useRef(null);

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

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isOpen]);

  // Prevent body scroll when drawer is open
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

  // Size classes
  const sizeClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
    xl: 'w-[28rem]',
    full: 'w-full'
  };

  // Position classes
  const positionClasses = {
    left: {
      container: 'left-0 top-0 h-full',
      transform: isOpen ? 'translate-x-0' : '-translate-x-full'
    },
    right: {
      container: 'right-0 top-0 h-full',
      transform: isOpen ? 'translate-x-0' : 'translate-x-full'
    },
    top: {
      container: 'top-0 left-0 w-full',
      transform: isOpen ? 'translate-y-0' : '-translate-y-full'
    },
    bottom: {
      container: 'bottom-0 left-0 w-full',
      transform: isOpen ? 'translate-y-0' : 'translate-y-full'
    }
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-white shadow-2xl',
    glass: 'bg-white/90 backdrop-blur-md shadow-2xl border border-white/20',
    medical: 'bg-gradient-to-b from-white to-primary-50/30 shadow-2xl shadow-primary-500/10 border-r border-primary-200'
  };

  // Backdrop classes
  const backdropClasses = combineClasses(
    'fixed inset-0 z-40 transition-all duration-300 ease-out',
    backdrop ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent',
    isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
  );

  // Drawer classes
  const drawerClasses = combineClasses(
    'fixed z-50 transition-transform duration-300 ease-out',
    'safe-area-inset',
    positionClasses[position].container,
    position === 'left' || position === 'right' ? sizeClasses[size] : 'h-auto',
    variantClasses[variant],
    positionClasses[position].transform,
    className
  );

  if (!isOpen && !backdrop) return null;

  return (
    <>
      {/* Backdrop */}
      {backdrop && (
        <div
          className={backdropClasses}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={drawerClasses}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {children}
      </div>
    </>
  );
};

/**
 * Drawer Header Component
 */
export const DrawerHeader = ({
  children,
  onClose,
  showCloseButton = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={combineClasses(
        'flex items-center justify-between p-6 border-b border-gray-100',
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {children}
      </div>
      
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          aria-label="Close drawer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Drawer Body Component
 */
export const DrawerBody = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={combineClasses('flex-1 overflow-y-auto p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Drawer Footer Component
 */
export const DrawerFooter = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={combineClasses(
        'p-6 border-t border-gray-100 bg-gray-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// PropTypes
Drawer.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  position: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  variant: PropTypes.oneOf(['default', 'glass', 'medical']),
  backdrop: PropTypes.bool,
  closeOnBackdropClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

DrawerHeader.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  showCloseButton: PropTypes.bool,
  className: PropTypes.string
};

DrawerBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

DrawerFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default Drawer;