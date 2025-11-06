// Premium Modal Components
// Mobile-optimized modals with accessibility and animations

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { combineClasses } from '../../utils/design-system';
import { useAnimations } from '../../hooks/useAnimations';
import { useResponsive } from '../../hooks/useDesignSystem';

/**
 * Modal Backdrop Component
 * Handles backdrop with blur and click-to-close
 */
export const ModalBackdrop = ({
  isOpen,
  onClose,
  blur = true,
  className = '',
  children,
  ...props
}) => {
  const { getAnimationConfig } = useAnimations();
  const animationConfig = getAnimationConfig('fast');

  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: animationConfig
  };

  const backdropClasses = combineClasses(
    'fixed inset-0 z-40',
    'bg-black/50',
    blur ? 'backdrop-blur-sm' : '',
    className
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={backdropClasses}
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Modal Content Component
 * Main modal content container
 */
export const ModalContent = ({
  children,
  size = 'md',
  position = 'center',
  className = '',
  onClick,
  ...props
}) => {
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full'
  };

  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-16',
    bottom: 'items-end justify-center pb-16'
  };

  const contentClasses = combineClasses(
    'relative w-full mx-4',
    sizeClasses[size],
    'bg-white rounded-xl shadow-2xl',
    'transform transition-all duration-300',
    className
  );

  // Prevent backdrop click when clicking on modal content
  const handleContentClick = (e) => {
    e.stopPropagation();
    onClick?.(e);
  };

  return (
    <div className={combineClasses('fixed inset-0 z-50 flex p-4', positionClasses[position])}>
      <div className={contentClasses} onClick={handleContentClick} {...props}>
        {children}
      </div>
    </div>
  );
};

/**
 * Modal Header Component
 * Header with title and close button
 */
export const ModalHeader = ({
  children,
  title,
  subtitle,
  onClose,
  showCloseButton = true,
  className = '',
  ...props
}) => {
  const headerClasses = combineClasses(
    'flex items-center justify-between p-6 border-b border-gray-200',
    className
  );

  return (
    <div className={headerClasses} {...props}>
      <div className="flex-1 min-w-0">
        {title && (
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1 truncate">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          aria-label="Close modal"
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
 * Modal Body Component
 * Main content area with proper scrolling
 */
export const ModalBody = ({
  children,
  padding = 'default',
  maxHeight,
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const bodyClasses = combineClasses(
    'overflow-y-auto',
    paddingClasses[padding],
    className
  );

  const bodyStyle = maxHeight ? { maxHeight } : {};

  return (
    <div className={bodyClasses} style={bodyStyle} {...props}>
      {children}
    </div>
  );
};

/**
 * Modal Footer Component
 * Footer with action buttons
 */
export const ModalFooter = ({
  children,
  align = 'right',
  className = '',
  ...props
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  const footerClasses = combineClasses(
    'flex items-center gap-3 p-6 border-t border-gray-200',
    alignClasses[align],
    className
  );

  return (
    <div className={footerClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Main Modal Component
 * Complete modal with all features
 */
const Modal = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  position = 'center',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventBodyScroll = true,
  className = '',
  ...props
}) => {
  const { getAnimationConfig } = useAnimations();
  const { isMobile } = useResponsive();
  const animationConfig = getAnimationConfig('default');
  const modalRef = useRef(null);

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
    if (!preventBodyScroll) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, preventBodyScroll]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isOpen]);

  const modalVariants = {
    initial: { 
      opacity: 0, 
      scale: isMobile ? 0.95 : 0.9,
      y: isMobile ? 20 : 0
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      y: 0
    },
    exit: { 
      opacity: 0, 
      scale: isMobile ? 0.95 : 0.9,
      y: isMobile ? 20 : 0
    },
    transition: animationConfig
  };

  const handleBackdropClick = closeOnBackdrop ? onClose : undefined;

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <ModalBackdrop isOpen={isOpen} onClose={handleBackdropClick} />
          <motion.div
            ref={modalRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            <ModalContent
              size={size}
              position={position}
              className={className}
              onClick={(e) => e.stopPropagation()}
              {...props}
            >
              {(title || subtitle || showCloseButton) && (
                <ModalHeader
                  title={title}
                  subtitle={subtitle}
                  onClose={onClose}
                  showCloseButton={showCloseButton}
                />
              )}
              
              <ModalBody>
                {children}
              </ModalBody>
            </ModalContent>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

/**
 * Confirmation Modal Component
 * Pre-built confirmation dialog
 */
export const ConfirmationModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  ...props
}) => {
  const variantStyles = {
    default: {
      confirmButton: 'bg-primary-500 hover:bg-primary-600 text-white',
      icon: 'text-primary-500'
    },
    danger: {
      confirmButton: 'bg-red-500 hover:bg-red-600 text-white',
      icon: 'text-red-500'
    },
    warning: {
      confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      icon: 'text-yellow-500'
    }
  };

  const styles = variantStyles[variant] || variantStyles.default;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-gray-700">{message}</p>
        </div>
      </div>

      <ModalFooter className="mt-6">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 ${styles.confirmButton}`}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            confirmText
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
};

/**
 * Medical Modal Component
 * Pre-styled modal for medical applications
 */
export const MedicalModal = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  priority = 'normal',
  patientInfo,
  className = '',
  ...props
}) => {
  const priorityStyles = {
    normal: 'border-t-4 border-t-primary-500',
    urgent: 'border-t-4 border-t-yellow-500',
    critical: 'border-t-4 border-t-red-500'
  };

  const modalClasses = combineClasses(
    priorityStyles[priority],
    className
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      className={modalClasses}
      {...props}
    >
      {patientInfo && (
        <div className="mb-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {patientInfo.initials || 'P'}
            </div>
            <div>
              <p className="font-medium text-gray-900">{patientInfo.name}</p>
              <p className="text-sm text-gray-600">ID: {patientInfo.id}</p>
            </div>
          </div>
        </div>
      )}
      
      {children}
    </Modal>
  );
};

// PropTypes
ModalBackdrop.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  blur: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node
};

ModalContent.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'full']),
  position: PropTypes.oneOf(['center', 'top', 'bottom']),
  className: PropTypes.string,
  onClick: PropTypes.func
};

ModalHeader.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onClose: PropTypes.func,
  showCloseButton: PropTypes.bool,
  className: PropTypes.string
};

ModalBody.propTypes = {
  children: PropTypes.node.isRequired,
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg']),
  maxHeight: PropTypes.string,
  className: PropTypes.string
};

ModalFooter.propTypes = {
  children: PropTypes.node.isRequired,
  align: PropTypes.oneOf(['left', 'center', 'right', 'between']),
  className: PropTypes.string
};

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'full']),
  position: PropTypes.oneOf(['center', 'top', 'bottom']),
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  preventBodyScroll: PropTypes.bool,
  className: PropTypes.string
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'danger', 'warning']),
  loading: PropTypes.bool
};

MedicalModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  priority: PropTypes.oneOf(['normal', 'urgent', 'critical']),
  patientInfo: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string,
    initials: PropTypes.string
  }),
  className: PropTypes.string
};

export default Modal;